package token_test

import (
	"testing"
	"time"

	"github.com/dineflow/api/pkg/token"
)

func TestTokenMaker(t *testing.T) {
	secret := "super-secret-key-that-is-at-least-32-bytes-long!"
	maker := token.NewMaker(secret, secret, 15*time.Minute, 7*24*time.Hour)

	userID := "user_123"
	tenantID := "tenant_456"
	role := "owner"

	jwtStr, claims, err := maker.CreateAccessToken(userID, tenantID, role)
	if err != nil {
		t.Fatalf("failed to create access token: %v", err)
	}
	if jwtStr == "" {
		t.Fatalf("expected non-empty token string")
	}
	if claims.UserID != userID || claims.TenantID != tenantID || claims.Role != role {
		t.Fatalf("claims mismatch: %+v", claims)
	}

	// Verify token
	verifiedClaims, err := maker.VerifyAccessToken(jwtStr)
	if err != nil {
		t.Fatalf("failed to verify valid token: %v", err)
	}
	if verifiedClaims.UserID != userID {
		t.Errorf("expected user ID %s, got %s", userID, verifiedClaims.UserID)
	}
	if verifiedClaims.TenantID != tenantID {
		t.Errorf("expected tenant ID %s, got %s", tenantID, verifiedClaims.TenantID)
	}

	// Expired token
	expiredMaker := token.NewMaker(secret, secret, -1*time.Minute, -1*time.Minute)
	expiredToken, _, err := expiredMaker.CreateAccessToken(userID, tenantID, role)
	if err != nil {
		t.Fatalf("failed to create expired token: %v", err)
	}
	_, err = maker.VerifyAccessToken(expiredToken)
	if err == nil {
		t.Errorf("expected error for expired token, got nil")
	}
}
