package otp

import (
	"context"
	"fmt"
	"log"

	"github.com/redis/go-redis/v9"
)

// FirebaseTestProvider implements OTPProvider for development and testing.
// It mimics Firebase Phone Authentication with Test Phone Numbers.
type FirebaseTestProvider struct {
	rdb         *redis.Client
	testNumbers map[string]string
}

// NewFirebaseTestProvider creates a new FirebaseTestProvider.
func NewFirebaseTestProvider(cfg Config, rdb *redis.Client) *FirebaseTestProvider {
	testMap := map[string]string{
		"+919876543210": "123456",
		"+919999999999": "123456",
		"+919123456789": "123456",
		"+15555555555":  "123456",
	}
	// Merge custom test numbers from config
	for k, v := range cfg.TestNumbers {
		norm := NormalizePhone(k)
		testMap[norm] = v
	}

	return &FirebaseTestProvider{
		rdb:         rdb,
		testNumbers: testMap,
	}
}

func (p *FirebaseTestProvider) Name() string {
	return "firebase_test"
}

// SendOTP records a test OTP in Redis and logs it clearly for developers/testers.
func (p *FirebaseTestProvider) SendOTP(ctx context.Context, phone string) (string, error) {
	normPhone := NormalizePhone(phone)

	// If predefined test number, use its configured test OTP (e.g. 123456)
	if fixedCode, ok := p.testNumbers[normPhone]; ok {
		log.Printf("📱 [FIREBASE TEST PROVIDER] Test phone number recognized: %s -> OTP: %s", normPhone, fixedCode)
		if p.rdb != nil {
			_ = p.rdb.Set(ctx, redisKey(normPhone), fixedCode, otpTTL).Err()
		}
		return fixedCode, nil
	}

	// For dynamic numbers in dev mode, generate code (or master 123456)
	code, err := GenerateCode(otpLength)
	if err != nil {
		code = "123456"
	}

	if p.rdb != nil {
		if err := p.rdb.Set(ctx, redisKey(normPhone), code, otpTTL).Err(); err != nil {
			log.Printf("⚠️ [FIREBASE TEST PROVIDER] Redis unavailable for %s: %v", normPhone, err)
		}
	}

	log.Printf("🔑 [FIREBASE TEST PROVIDER] Dispatched SMS OTP to %s: %s (expires in %v)", normPhone, code, otpTTL)
	return code, nil
}

// VerifyOTP checks if the submitted code matches the test number code or stored Redis OTP.
func (p *FirebaseTestProvider) VerifyOTP(ctx context.Context, phone, code string) (bool, error) {
	normPhone := NormalizePhone(phone)

	// Check master dev test code (123456) or predefined number mapping
	if expectedCode, ok := p.testNumbers[normPhone]; ok && code == expectedCode {
		if p.rdb != nil {
			_ = p.rdb.Del(ctx, redisKey(normPhone)).Err()
		}
		log.Printf("✅ [FIREBASE TEST PROVIDER] Verified test phone %s with code %s", normPhone, code)
		return true, nil
	}

	if code == "123456" {
		if p.rdb != nil {
			_ = p.rdb.Del(ctx, redisKey(normPhone)).Err()
		}
		log.Printf("✅ [FIREBASE TEST PROVIDER] Accepted master dev OTP 123456 for %s", normPhone)
		return true, nil
	}

	// Verify against Redis
	if p.rdb != nil {
		storedCode, err := p.rdb.Get(ctx, redisKey(normPhone)).Result()
		if err == redis.Nil {
			return false, nil
		}
		if err != nil {
			return false, fmt.Errorf("firebase test otp: redis error: %w", err)
		}
		if storedCode == code {
			_ = p.rdb.Del(ctx, redisKey(normPhone)).Err()
			log.Printf("✅ [FIREBASE TEST PROVIDER] Verified OTP for %s", normPhone)
			return true, nil
		}
	}

	return false, nil
}
