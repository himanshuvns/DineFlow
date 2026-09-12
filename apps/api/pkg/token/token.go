package token

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// TokenType differentiates access and refresh tokens to prevent misuse.
type TokenType string

const (
	AccessToken  TokenType = "access"
	RefreshToken TokenType = "refresh"
)

// Claims is the JWT payload for DineFlow tokens.
type Claims struct {
	UserID   string    `json:"uid"`
	TenantID string    `json:"tid"`
	Role     string    `json:"role"`
	TokenID  string    `json:"jti"`   // unique token ID for revocation
	Type     TokenType `json:"type"`
	jwt.RegisteredClaims
}

// Maker handles JWT creation and verification.
type Maker struct {
	accessSecret  []byte
	refreshSecret []byte
	accessTTL     time.Duration
	refreshTTL    time.Duration
}

// NewMaker creates a new token maker with the given secrets and TTLs.
func NewMaker(accessSecret, refreshSecret string, accessTTL, refreshTTL time.Duration) *Maker {
	return &Maker{
		accessSecret:  []byte(accessSecret),
		refreshSecret: []byte(refreshSecret),
		accessTTL:     accessTTL,
		refreshTTL:    refreshTTL,
	}
}

// CreateAccessToken generates a short-lived JWT for API access.
func (m *Maker) CreateAccessToken(userID, tenantID, role string) (string, *Claims, error) {
	return m.create(userID, tenantID, role, AccessToken, m.accessTTL, m.accessSecret)
}

// CreateRefreshToken generates a long-lived JWT used to obtain new access tokens.
func (m *Maker) CreateRefreshToken(userID, tenantID, role string) (string, *Claims, error) {
	return m.create(userID, tenantID, role, RefreshToken, m.refreshTTL, m.refreshSecret)
}

func (m *Maker) create(userID, tenantID, role string, tokenType TokenType, ttl time.Duration, secret []byte) (string, *Claims, error) {
	now := time.Now().UTC()
	claims := &Claims{
		UserID:   userID,
		TenantID: tenantID,
		Role:     role,
		TokenID:  uuid.NewString(),
		Type:     tokenType,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(ttl)),
			Issuer:    "dineflow",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(secret)
	if err != nil {
		return "", nil, err
	}
	return signed, claims, nil
}

// VerifyAccessToken parses and validates an access token, returning its claims.
func (m *Maker) VerifyAccessToken(tokenStr string) (*Claims, error) {
	return m.verify(tokenStr, AccessToken, m.accessSecret)
}

// VerifyRefreshToken parses and validates a refresh token, returning its claims.
func (m *Maker) VerifyRefreshToken(tokenStr string) (*Claims, error) {
	return m.verify(tokenStr, RefreshToken, m.refreshSecret)
}

func (m *Maker) verify(tokenStr string, expectedType TokenType, secret []byte) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return secret, nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	if claims.Type != expectedType {
		return nil, errors.New("wrong token type")
	}

	return claims, nil
}
