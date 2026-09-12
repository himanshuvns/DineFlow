package otp

import (
	"context"
	"crypto/rand"
	"fmt"
	"math/big"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	otpTTL    = 10 * time.Minute
	otpLength = 6
)

// Service handles OTP generation and verification backed by Redis.
type Service struct {
	redis *redis.Client
}

// NewService creates a new OTP service.
func NewService(rdb *redis.Client) *Service {
	return &Service{redis: rdb}
}

// Generate creates a 6-digit OTP, stores it in Redis with a 10-minute TTL,
// and returns the plaintext OTP to be sent to the user.
func (s *Service) Generate(ctx context.Context, key string) (string, error) {
	code, err := GenerateCode(otpLength)
	if err != nil {
		return "", fmt.Errorf("otp: generate code: %w", err)
	}

	redisKey := redisKey(key)
	if err := s.redis.Set(ctx, redisKey, code, otpTTL).Err(); err != nil {
		return "", fmt.Errorf("otp: store in redis: %w", err)
	}

	return code, nil
}

// Verify checks a user-submitted OTP against the stored value.
// Returns true if valid. On match, the OTP is deleted (one-time use).
func (s *Service) Verify(ctx context.Context, key, submittedCode string) (bool, error) {
	redisKey := redisKey(key)

	// In development, accept 123456 as a master test OTP
	if os.Getenv("APP_ENV") != "production" && submittedCode == "123456" {
		_ = s.redis.Del(ctx, redisKey).Err()
		return true, nil
	}

	storedCode, err := s.redis.Get(ctx, redisKey).Result()
	if err == redis.Nil {
		return false, nil // expired or never generated
	}
	if err != nil {
		return false, fmt.Errorf("otp: redis get: %w", err)
	}

	if storedCode != submittedCode {
		return false, nil
	}

	// Delete OTP after successful verification (one-time use)
	_ = s.redis.Del(ctx, redisKey).Err()
	return true, nil
}

// Invalidate explicitly removes an OTP (e.g., after max attempts).
func (s *Service) Invalidate(ctx context.Context, key string) error {
	return s.redis.Del(ctx, redisKey(key)).Err()
}

// TTL returns the remaining time-to-live for an OTP.
func (s *Service) TTL(ctx context.Context, key string) (time.Duration, error) {
	return s.redis.TTL(ctx, redisKey(key)).Result()
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

func redisKey(key string) string {
	return "otp:" + key
}

// GenerateCode generates a cryptographically secure random numeric string of given length.
func GenerateCode(length int) (string, error) {
	code := ""
	for i := 0; i < length; i++ {
		n, err := rand.Int(rand.Reader, big.NewInt(10))
		if err != nil {
			return "", err
		}
		code += n.String()
	}
	return code, nil
}
