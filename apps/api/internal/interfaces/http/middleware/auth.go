package middleware

import (
	"strings"

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
// It extracts userID, tenantID, role, and tokenID from the token claims and
// sets them on the Gin context for downstream handlers.
func Auth(maker *token.Maker) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Unauthorized(c, "Authorization header is required.")
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			response.Unauthorized(c, "Invalid authorization header format. Use: Bearer <token>")
			return
		}

		tokenStr := parts[1]
		if tokenStr == "" {
			response.Unauthorized(c, "Token is required.")
			return
		}

		claims, err := maker.VerifyAccessToken(tokenStr)
		if err != nil {
			response.Unauthorized(c, "Invalid or expired token.")
			return
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
