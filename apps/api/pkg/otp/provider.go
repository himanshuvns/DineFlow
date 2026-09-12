package otp

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/redis/go-redis/v9"
)

var (
	ErrInvalidOTP = errors.New("invalid or expired verification code")
	ErrRateLimit  = errors.New("too many OTP requests, please wait before trying again")
)

// OTPProvider defines the unified interface for OTP delivery and verification.
type OTPProvider interface {
	// SendOTP dispatches an OTP to the specified phone number (E.164 format)
	// and returns the generated code (or empty if provider keeps it internal).
	SendOTP(ctx context.Context, phone string) (string, error)

	// VerifyOTP validates the code submitted for the phone number.
	VerifyOTP(ctx context.Context, phone, code string) (bool, error)

	// Name returns the identifier of the active provider.
	Name() string
}

// Config holds settings for provider instantiation.
type Config struct {
	Provider          string            // "firebase_test" (default) or "msg91"
	FirebaseProjectID string
	MSG91AuthKey      string
	MSG91TemplateID   string
	MSG91SenderID     string
	TestNumbers       map[string]string // e.g. "+919876543210": "123456"
}

// NewOTPProvider is a factory creating the configured OTPProvider.
func NewOTPProvider(cfg Config, rdb *redis.Client) (OTPProvider, error) {
	providerName := strings.ToLower(strings.TrimSpace(cfg.Provider))
	switch providerName {
	case "msg91":
		return NewMSG91Provider(cfg, rdb), nil
	case "firebase_test", "firebase", "test", "":
		return NewFirebaseTestProvider(cfg, rdb), nil
	default:
		return nil, fmt.Errorf("unknown otp provider: %s (supported: 'firebase_test', 'msg91')", cfg.Provider)
	}
}

// NormalizePhone formats a phone number by stripping whitespace/hyphens and ensuring '+' prefix.
func NormalizePhone(phone string) string {
	cleaned := strings.TrimSpace(phone)
	cleaned = strings.ReplaceAll(cleaned, " ", "")
	cleaned = strings.ReplaceAll(cleaned, "-", "")
	cleaned = strings.ReplaceAll(cleaned, "(", "")
	cleaned = strings.ReplaceAll(cleaned, ")", "")

	if cleaned == "" {
		return ""
	}

	if !strings.HasPrefix(cleaned, "+") {
		// Default to +91 (India) if 10 digits provided without prefix
		if len(cleaned) == 10 {
			cleaned = "+91" + cleaned
		} else {
			cleaned = "+" + cleaned
		}
	}
	return cleaned
}

// ParseTestNumbers parses a comma-separated list of "phone:code" pairs (e.g. "+919876543210:123456").
func ParseTestNumbers(raw string) map[string]string {
	result := make(map[string]string)
	if strings.TrimSpace(raw) == "" {
		return result
	}
	pairs := strings.Split(raw, ",")
	for _, pair := range pairs {
		parts := strings.Split(strings.TrimSpace(pair), ":")
		if len(parts) == 2 {
			p := NormalizePhone(parts[0])
			c := strings.TrimSpace(parts[1])
			if p != "" && c != "" {
				result[p] = c
			}
		}
	}
	return result
}
