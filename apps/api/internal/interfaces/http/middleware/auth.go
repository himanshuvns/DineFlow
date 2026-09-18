package middleware

import (
	"strings"

	redisinfra "github.com/dineflow/api/internal/infrastructure/redis"
	"github.com/dineflow/api/pkg/response"
	"github.com/dineflow/api/pkg/token"
	"github.com/gin-gonic/gin"
)

// contextKey is a typed string for gin context keys to avoid collisions.
type contextKey string

const (
	KeyUserID   contextKey = "userID"
	KeyTenantID contextKey = "tenantID"
	KeyRole     contextKey = "role"
	KeyTokenID  contextKey = "tokenID"
	KeyClaims   contextKey = "claims"
)

// Auth is a Gin middleware that verifies the Bearer JWT on every protected route.
// It checks token signature, expiration, and real-time Redis revocation status
// before attaching identity claims to the request context.
func Auth(maker *token.Maker, rdb *redisinfra.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		var tokenStr string

		if authHeader != "" {
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) == 2 && strings.EqualFold(parts[0], "Bearer") {
				tokenStr = parts[1]
			}
		}

		// Fallback for SSE / EventSource / WebSocket where browser cannot set custom headers
		if tokenStr == "" {
			tokenStr = c.Query("token")
		}

		if tokenStr == "" {
			response.Unauthorized(c, "Authorization header or token query parameter is required.")
			return
		}

		claims, err := maker.VerifyAccessToken(tokenStr)
		if err != nil {
			response.Unauthorized(c, "Invalid or expired token.")
			return
		}

		// Real-time Revocation Check (Logout / Security Invalidation)
		if rdb != nil {
			if rdb.IsTokenBlacklisted(c.Request.Context(), claims.TokenID) {
				response.Unauthorized(c, "Session has been invalidated. Please sign in again.")
				return
			}
			if claims.IssuedAt != nil && rdb.IsUserSessionRevoked(c.Request.Context(), claims.UserID, claims.IssuedAt.Time) {
				response.Unauthorized(c, "All active sessions have been terminated. Please sign in again.")
				return
			}
		}

		// Attach all identity information to the request context
		c.Set(string(KeyUserID), claims.UserID)
		c.Set(string(KeyTenantID), claims.TenantID)
		c.Set(string(KeyRole), claims.Role)
		c.Set(string(KeyTokenID), claims.TokenID)
		c.Set(string(KeyClaims), claims)

		c.Next()
	}
}

// ─── Context Accessors (used in handlers to avoid string key typos) ───────────

// GetUserID returns the authenticated user's ID from context.
func GetUserID(c *gin.Context) string {
	return c.GetString(string(KeyUserID))
}

// GetTenantID returns the authenticated tenant's ID from context.
func GetTenantID(c *gin.Context) string {
	return c.GetString(string(KeyTenantID))
}

// GetRole returns the authenticated user's role from context.
func GetRole(c *gin.Context) string {
	return c.GetString(string(KeyRole))
}

// GetTokenID returns the JWT token ID (JTI) from context.
func GetTokenID(c *gin.Context) string {
	return c.GetString(string(KeyTokenID))
}
