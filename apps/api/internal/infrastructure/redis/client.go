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

// ─── Token Blacklist & Session Revocation ──────────────────────────────────────

// BlacklistToken marks an access token JTI as revoked until its expiry.
func (c *Client) BlacklistToken(ctx context.Context, jti string, ttl time.Duration) error {
	if jti == "" {
		return nil
	}
	if ttl <= 0 {
		ttl = 24 * time.Hour
	}
	return c.rdb.Set(ctx, "bl:"+jti, "1", ttl).Err()
}

// IsTokenBlacklisted checks if an access token JTI has been revoked.
func (c *Client) IsTokenBlacklisted(ctx context.Context, jti string) bool {
	if jti == "" {
		return false
	}
	val, err := c.rdb.Exists(ctx, "bl:"+jti).Result()
	return err == nil && val > 0
}

// RevokeUserSessions invalidates all existing tokens issued for a user before now.
func (c *Client) RevokeUserSessions(ctx context.Context, userID string, ttl time.Duration) error {
	if userID == "" {
		return nil
	}
	if ttl <= 0 {
		ttl = 7 * 24 * time.Hour
	}
	nowStr := fmt.Sprintf("%d", time.Now().UTC().Unix())
	return c.rdb.Set(ctx, "user:revoked_at:"+userID, nowStr, ttl).Err()
}

// IsUserSessionRevoked checks whether the token was issued before the user's revocation timestamp.
func (c *Client) IsUserSessionRevoked(ctx context.Context, userID string, tokenIssuedAt time.Time) bool {
	if userID == "" {
		return false
	}
	val, err := c.rdb.Get(ctx, "user:revoked_at:"+userID).Result()
	if err != nil || val == "" {
		return false
	}
	var revokedAtUnix int64
	_, parseErr := fmt.Sscanf(val, "%d", &revokedAtUnix)
	if parseErr != nil {
		return false
	}
	return tokenIssuedAt.Unix() <= revokedAtUnix
}

// ─── IP Blocklist ─────────────────────────────────────────────────────────────

// BlockIP adds an IP address to the Redis blocklist set.
func (c *Client) BlockIP(ctx context.Context, ip string, reason string) error {
	if ip == "" {
		return nil
	}
	pipe := c.rdb.Pipeline()
	pipe.SAdd(ctx, "security:blocked_ips", ip)
	if reason != "" {
		pipe.Set(ctx, "security:ip_reason:"+ip, reason, 30*24*time.Hour)
	}
	_, err := pipe.Exec(ctx)
	return err
}

// UnblockIP removes an IP from the blocklist set.
func (c *Client) UnblockIP(ctx context.Context, ip string) error {
	if ip == "" {
		return nil
	}
	pipe := c.rdb.Pipeline()
	pipe.SRem(ctx, "security:blocked_ips", ip)
	pipe.Del(ctx, "security:ip_reason:"+ip)
	_, err := pipe.Exec(ctx)
	return err
}

// IsIPBlocked checks if an IP is currently blocked.
func (c *Client) IsIPBlocked(ctx context.Context, ip string) bool {
	if ip == "" {
		return false
	}
	isMember, err := c.rdb.SIsMember(ctx, "security:blocked_ips", ip).Result()
	return err == nil && isMember
}

// GetBlockedIPs returns the list of all blocked IPs.
func (c *Client) GetBlockedIPs(ctx context.Context) ([]string, error) {
	return c.rdb.SMembers(ctx, "security:blocked_ips").Result()
}

