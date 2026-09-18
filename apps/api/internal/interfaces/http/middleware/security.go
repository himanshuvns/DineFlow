package middleware

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"strings"

	redisinfra "github.com/dineflow/api/internal/infrastructure/redis"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// SecurityHeaders sets defense-in-depth HTTP security headers on all responses.
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Header("Permissions-Policy", "camera=(self), microphone=(), geolocation=(self)")
		c.Next()
	}
}

// RequestID attaches a unique tracing identifier to each request.
func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		reqID := c.GetHeader("X-Request-ID")
		if reqID == "" {
			reqID = uuid.NewString()
		}
		c.Set("requestID", reqID)
		c.Header("X-Request-ID", reqID)
		c.Next()
	}
}

// IPBlocklist blocks any request originating from an IP in the Redis blocklist.
func IPBlocklist(rdb *redisinfra.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		if rdb == nil {
			c.Next()
			return
		}

		clientIP := c.ClientIP()
		if rdb.IsIPBlocked(c.Request.Context(), clientIP) {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "IP_BLOCKED",
					"message": "Access from this IP has been restricted by platform security policy.",
				},
			})
			return
		}
		c.Next()
	}
}

// NoSQLSanitizer guards against NoSQL operator injection and dangerous script tags.
func NoSQLSanitizer() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Sanitize Query Parameters
		for key, values := range c.Request.URL.Query() {
			if strings.Contains(key, "$") || strings.Contains(key, ".") {
				c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
					"success": false,
					"error": gin.H{
						"code":    "OPERATOR_INJECTION_DETECTED",
						"message": "Dangerous query parameter detected containing reserved database operators.",
					},
				})
				return
			}
			for _, v := range values {
				lower := strings.ToLower(v)
				if strings.Contains(lower, "<script") || strings.Contains(lower, "javascript:") {
					c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
						"success": false,
						"error": gin.H{
							"code":    "MALICIOUS_INPUT",
							"message": "Potentially malicious script detected in input.",
						},
					})
					return
				}
			}
		}

		// 2. Sanitize JSON Body for Operator Injection ($where, $regex, $gt, etc.)
		if c.Request.Method == http.MethodPost || c.Request.Method == http.MethodPut || c.Request.Method == http.MethodPatch {
			contentType := c.GetHeader("Content-Type")
			if strings.Contains(contentType, "application/json") && c.Request.Body != nil {
				bodyBytes, err := io.ReadAll(c.Request.Body)
				if err == nil && len(bodyBytes) > 0 {
					c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

					var payload interface{}
					if jsonErr := json.Unmarshal(bodyBytes, &payload); jsonErr == nil {
						if hasOperatorInjection(payload) {
							c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
								"success": false,
								"error": gin.H{
									"code":    "OPERATOR_INJECTION_DETECTED",
									"message": "Invalid request payload containing reserved database operators.",
								},
							})
							return
						}
					}
				}
			}
		}

		c.Next()
	}
}

// hasOperatorInjection recursively checks if any map key begins with '$'.
func hasOperatorInjection(data interface{}) bool {
	switch v := data.(type) {
	case map[string]interface{}:
		for k, val := range v {
			if strings.HasPrefix(k, "$") {
				return true
			}
			if hasOperatorInjection(val) {
				return true
			}
		}
	case []interface{}:
		for _, item := range v {
			if hasOperatorInjection(item) {
				return true
			}
		}
	}
	return false
}
