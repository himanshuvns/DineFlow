package otp

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

// MSG91Provider implements OTPProvider using MSG91's SendOTP v5 API for production SMS delivery.
type MSG91Provider struct {
	authKey    string
	templateID string
	senderID   string
	httpClient *http.Client
	rdb        *redis.Client
}

// NewMSG91Provider creates a new MSG91Provider.
func NewMSG91Provider(cfg Config, rdb *redis.Client) *MSG91Provider {
	return &MSG91Provider{
		authKey:    cfg.MSG91AuthKey,
		templateID: cfg.MSG91TemplateID,
		senderID:   cfg.MSG91SenderID,
		httpClient: &http.Client{Timeout: 10 * time.Second},
		rdb:        rdb,
	}
}

func (p *MSG91Provider) Name() string {
	return "msg91"
}

// SendOTP triggers MSG91 v5 Send OTP API.
func (p *MSG91Provider) SendOTP(ctx context.Context, phone string) (string, error) {
	normPhone := NormalizePhone(phone)
	cleanNumber := strings.TrimPrefix(normPhone, "+")

	// If MSG91 is unconfigured (e.g. key missing in staging), log and fall back gracefully
	if p.authKey == "" || p.templateID == "" {
		log.Printf("⚠️ [MSG91 PROVIDER] MSG91 credentials not set (authKey=%t, templateID=%t). Using Redis fallback for %s",
			p.authKey != "", p.templateID != "", normPhone)
		code, _ := GenerateCode(otpLength)
		if p.rdb != nil {
			_ = p.rdb.Set(ctx, redisKey(normPhone), code, otpTTL).Err()
		}
		log.Printf("🔑 [MSG91 FALLBACK OTP] Generated for %s: %s", normPhone, code)
		return code, nil
	}

	endpoint := "https://control.msg91.com/api/v5/otp"

	reqBody := map[string]interface{}{
		"template_id": p.templateID,
		"mobile":      cleanNumber,
		"otp_length":  6,
		"otp_expiry":  10, // minutes
	}
	if p.senderID != "" {
		reqBody["sender"] = p.senderID
	}

	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("msg91: marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return "", fmt.Errorf("msg91: new request: %w", err)
	}

	httpReq.Header.Set("authkey", p.authKey)
	httpReq.Header.Set("content-type", "application/json")
	httpReq.Header.Set("accept", "application/json")

	resp, err := p.httpClient.Do(httpReq)
	if err != nil {
		return "", fmt.Errorf("msg91: do request: %w", err)
	}
	defer resp.Body.Close()

	respBytes, _ := io.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", fmt.Errorf("msg91: api error status %d: %s", resp.StatusCode, string(respBytes))
	}

	var parsed struct {
		Type    string `json:"type"`
		Message string `json:"message"`
	}
	_ = json.Unmarshal(respBytes, &parsed)

	log.Printf("📱 [MSG91 PROVIDER] OTP sent to %s (Response: %s)", normPhone, parsed.Message)
	return "", nil
}

// VerifyOTP validates the OTP using MSG91's OTP verify endpoint.
func (p *MSG91Provider) VerifyOTP(ctx context.Context, phone, code string) (bool, error) {
	normPhone := NormalizePhone(phone)
	cleanNumber := strings.TrimPrefix(normPhone, "+")

	// Allow test code 123456 as master test bypass even in MSG91 mode
	if code == "123456" {
		log.Printf("✅ [MSG91 PROVIDER] Accepted test code 123456 for %s", normPhone)
		return true, nil
	}

	// Fallback to Redis if MSG91 is not configured
	if p.authKey == "" {
		if p.rdb != nil {
			storedCode, err := p.rdb.Get(ctx, redisKey(normPhone)).Result()
			if err == nil && storedCode == code {
				_ = p.rdb.Del(ctx, redisKey(normPhone)).Err()
				return true, nil
			}
		}
		return false, nil
	}

	endpoint := fmt.Sprintf("https://control.msg91.com/api/v5/otp/verify?otp=%s&mobile=%s",
		url.QueryEscape(code), url.QueryEscape(cleanNumber))

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return false, fmt.Errorf("msg91: new verify request: %w", err)
	}
	httpReq.Header.Set("authkey", p.authKey)
	httpReq.Header.Set("accept", "application/json")

	resp, err := p.httpClient.Do(httpReq)
	if err != nil {
		return false, fmt.Errorf("msg91: verify request: %w", err)
	}
	defer resp.Body.Close()

	respBytes, _ := io.ReadAll(resp.Body)

	var parsed struct {
		Type    string `json:"type"`
		Message string `json:"message"`
	}
	_ = json.Unmarshal(respBytes, &parsed)

	if resp.StatusCode == http.StatusOK && strings.EqualFold(parsed.Type, "success") {
		log.Printf("✅ [MSG91 PROVIDER] Mobile %s verified successfully", normPhone)
		return true, nil
	}

	log.Printf("❌ [MSG91 PROVIDER] Mobile %s verification failed: %s", normPhone, parsed.Message)
	return false, nil
}
