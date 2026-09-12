package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

const pingTimeout = 5 * time.Second

// Client wraps the Redis client with DineFlow-specific helpers.
type Client struct {
	rdb *redis.Client
	log *zap.Logger
}

// New connects to Redis using the given URL and returns a Client.
// Validates connectivity with a ping before returning.
func New(ctx context.Context, url string, log *zap.Logger) (*Client, error) {
	opts, err := redis.ParseURL(url)
	if err != nil {
		return nil, fmt.Errorf("redis: parse url: %w", err)
	}

	rdb := redis.NewClient(opts)

	pingCtx, cancel := context.WithTimeout(ctx, pingTimeout)
	defer cancel()

	if err := rdb.Ping(pingCtx).Err(); err != nil {
		return nil, fmt.Errorf("redis: ping: %w", err)
	}

	log.Info("Redis connected", zap.String("addr", opts.Addr))

	return &Client{rdb: rdb, log: log}, nil
}

// Raw returns the underlying *redis.Client for use in sub-packages (e.g., OTP service).
func (c *Client) Raw() *redis.Client {
	return c.rdb
}

// Ping verifies the connection is still alive.
func (c *Client) Ping(ctx context.Context) error {
	pingCtx, cancel := context.WithTimeout(ctx, pingTimeout)
	defer cancel()
	return c.rdb.Ping(pingCtx).Err()
}

// Close gracefully closes the Redis connection.
func (c *Client) Close() error {
	c.log.Info("Redis disconnecting...")
	return c.rdb.Close()
}

// ─── Rate Limiting ─────────────────────────────────────────────────────────────

// RateLimitResult contains the outcome of a rate limit check.
type RateLimitResult struct {
	Allowed   bool
	Remaining int
	ResetAt   time.Time
}

// CheckRateLimit implements a sliding window rate limiter using Redis.
// key: unique identifier (e.g., "rl:auth:192.168.1.1")
// limit: max requests per window
// window: time window duration
func (c *Client) CheckRateLimit(ctx context.Context, key string, limit int, window time.Duration) (*RateLimitResult, error) {
	now := time.Now().UTC()
	windowStart := now.Add(-window)

	pipe := c.rdb.Pipeline()
	// Remove entries outside the window
	pipe.ZRemRangeByScore(ctx, key, "0", fmt.Sprintf("%d", windowStart.UnixMilli()))
	// Count current entries
	countCmd := pipe.ZCard(ctx, key)
	// Add current request
	pipe.ZAdd(ctx, key, redis.Z{Score: float64(now.UnixMilli()), Member: now.UnixNano()})
	// Set TTL on the key
	pipe.Expire(ctx, key, window)

	if _, err := pipe.Exec(ctx); err != nil {
		return nil, fmt.Errorf("redis: rate limit pipeline: %w", err)
	}

	count := countCmd.Val()
	allowed := count < int64(limit)
	remaining := limit - int(count)
	if remaining < 0 {
		remaining = 0
	}

	return &RateLimitResult{
		Allowed:   allowed,
		Remaining: remaining,
		ResetAt:   now.Add(window),
	}, nil
}

// ─── Session / Token Storage ───────────────────────────────────────────────────

// SetRefreshToken stores a refresh token's metadata with TTL.
func (c *Client) SetRefreshToken(ctx context.Context, tokenID string, userID string, ttl time.Duration) error {
	return c.rdb.Set(ctx, "rt:"+tokenID, userID, ttl).Err()
}

// GetRefreshToken retrieves the userID associated with a refresh token.
func (c *Client) GetRefreshToken(ctx context.Context, tokenID string) (string, error) {
	return c.rdb.Get(ctx, "rt:"+tokenID).Result()
}

// RevokeRefreshToken removes a refresh token from the store.
func (c *Client) RevokeRefreshToken(ctx context.Context, tokenID string) error {
	return c.rdb.Del(ctx, "rt:"+tokenID).Err()
}

// ─── Feature Flag Cache ────────────────────────────────────────────────────────

// SetFeatureFlags caches a tenant's serialized feature flags JSON for 5 minutes.
func (c *Client) SetFeatureFlags(ctx context.Context, tenantID string, flagsJSON []byte) error {
	return c.rdb.Set(ctx, "ff:"+tenantID, flagsJSON, 5*time.Minute).Err()
}

// GetFeatureFlags retrieves cached feature flags for a tenant.
func (c *Client) GetFeatureFlags(ctx context.Context, tenantID string) ([]byte, error) {
	return c.rdb.Get(ctx, "ff:"+tenantID).Bytes()
}

// InvalidateFeatureFlags removes cached feature flags (called on plan change).
func (c *Client) InvalidateFeatureFlags(ctx context.Context, tenantID string) error {
	return c.rdb.Del(ctx, "ff:"+tenantID).Err()
}
