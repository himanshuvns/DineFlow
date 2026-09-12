package otp_test

import (
	"strconv"
	"testing"

	"github.com/dineflow/api/pkg/otp"
)

func TestGenerateCode(t *testing.T) {
	for i := 0; i < 20; i++ {
		code, err := otp.GenerateCode(6)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(code) != 6 {
			t.Errorf("expected OTP length 6, got %d (%s)", len(code), code)
		}
		if _, err := strconv.Atoi(code); err != nil {
			t.Errorf("expected numeric string, got %s", code)
		}
	}
}
