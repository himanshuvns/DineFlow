package otp

import (
	"context"
	"testing"
)

func TestNormalizePhone(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"9876543210", "+919876543210"},
		{"+91 98765 43210", "+919876543210"},
		{"+91-98765-43210", "+919876543210"},
		{"(987) 654-3210", "+919876543210"},
		{"+15555555555", "+15555555555"},
		{"+44 20 7946 0958", "+442079460958"},
		{"", ""},
	}

	for _, tt := range tests {
		got := NormalizePhone(tt.input)
		if got != tt.expected {
			t.Errorf("NormalizePhone(%q) = %q; want %q", tt.input, got, tt.expected)
		}
	}
}

func TestParseTestNumbers(t *testing.T) {
	raw := "+919876543210:123456, 9999999999:654321"
	parsed := ParseTestNumbers(raw)

	if parsed["+919876543210"] != "123456" {
		t.Errorf("expected 123456 for +919876543210, got %s", parsed["+919876543210"])
	}
	if parsed["+919999999999"] != "654321" {
		t.Errorf("expected 654321 for +919999999999, got %s", parsed["+919999999999"])
	}
}

func TestFirebaseTestProvider(t *testing.T) {
	ctx := context.Background()
	provider := NewFirebaseTestProvider(Config{
		TestNumbers: map[string]string{
			"+919876543210": "123456",
		},
	}, nil)

	if provider.Name() != "firebase_test" {
		t.Errorf("expected name firebase_test, got %s", provider.Name())
	}

	// 1. Send OTP for test number
	code, err := provider.SendOTP(ctx, "+91 98765 43210")
	if err != nil {
		t.Fatalf("SendOTP error: %v", err)
	}
	if code != "123456" {
		t.Errorf("expected test code 123456, got %s", code)
	}

	// 2. Verify matching code
	valid, err := provider.VerifyOTP(ctx, "+91 98765 43210", "123456")
	if err != nil || !valid {
		t.Errorf("expected valid verification, got valid=%v, err=%v", valid, err)
	}

	// 3. Verify mismatching code
	valid, err = provider.VerifyOTP(ctx, "+91 98765 43210", "999999")
	if err != nil || valid {
		t.Errorf("expected invalid verification for wrong code, got valid=%v, err=%v", valid, err)
	}
}

func TestMSG91ProviderFallback(t *testing.T) {
	ctx := context.Background()
	// Unconfigured MSG91 provider should fallback to mock / test codes gracefully
	provider := NewMSG91Provider(Config{
		Provider: "msg91",
	}, nil)

	if provider.Name() != "msg91" {
		t.Errorf("expected name msg91, got %s", provider.Name())
	}

	// Should generate fallback code
	code, err := provider.SendOTP(ctx, "+91 98765 43210")
	if err != nil {
		t.Fatalf("SendOTP error: %v", err)
	}
	if len(code) != 6 {
		t.Errorf("expected 6-digit code, got %s", code)
	}

	// Master code 123456 should be accepted in mock mode
	valid, err := provider.VerifyOTP(ctx, "+91 98765 43210", "123456")
	if err != nil || !valid {
		t.Errorf("expected valid verification with fallback master code, got valid=%v, err=%v", valid, err)
	}
}
