package middleware

import (
	"fmt"
	"net/http"
	"time"

	redisinfra "github.com/dineflow/api/internal/infrastructure/redis"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
)

// RateLimit creates a sliding window rate limit middleware.
//
// keyFunc extracts the rate limit key from the request (e.g., IP or tenant ID).
// limit is the max number of requests allowed per window.
// window is the time duration of the rate limit window.
//
// Example — 10 requests per minute per IP on auth routes:
//
//	router.POST("/login", middleware.RateLimit(redis, byIP, 10, time.Minute), handler)
func RateLimit(rdb *redisinfra.Client, keyFunc func(*gin.Context) string, limit int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		key := keyFunc(c)
		rlKey := fmt.Sprintf("rl:%s", key)

		result, err := rdb.CheckRateLimit(c.Request.Context(), rlKey, limit, window)
		if err != nil {
			// On Redis failure, fail open (allow the request) to prevent outages
			// but log the error in a real scenario
			c.Next()
			return
		}

		// Set standard rate limit headers
		c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", limit))
		c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", result.Remaining))
		c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", result.ResetAt.Unix()))

		if !result.Allowed {
			c.Header("Retry-After", fmt.Sprintf("%d", int(window.Seconds())))
			c.AbortWithStatusJSON(http.StatusTooManyRequests, map[string]interface{}{
				"success": false,
				"error": map[string]string{
					"code":    "RATE_LIMITED",
					"message": "Too many requests. Please slow down.",
				},
			})
			return
		}

		c.Next()
	}
}

// ─── Key Extractors ───────────────────────────────────────────────────────────

// ByIP extracts the client IP as the rate limit key.
func ByIP(c *gin.Context) string {
	return "ip:" + c.ClientIP()
}

// ByTenant extracts the tenant ID from the authenticated context.
func ByTenant(c *gin.Context) string {
	tenantID := GetTenantID(c)
	if tenantID == "" {
		return "ip:" + c.ClientIP()
	}
	return "tenant:" + tenantID
}

// ByIPAndRoute combines IP and route path for endpoint-specific rate limits.
func ByIPAndRoute(c *gin.Context) string {
	return fmt.Sprintf("ip:%s:route:%s", c.ClientIP(), c.FullPath())
}

// PlanLimitMiddleware checks whether the tenant has exceeded a plan limit.
// It should be placed on CREATE routes that are subject to resource caps.
//
// Example:
//
//	tableRoutes.POST("", middleware.PlanLimit(mongoClient, "tables", getTenantID), handler.CreateTable)
func PlanLimitMiddleware(
	getCurrentCount func(c *gin.Context) (int64, error),
	getMaxAllowed func(c *gin.Context) int,
	resource string,
) gin.HandlerFunc {
	return func(c *gin.Context) {
		max := getMaxAllowed(c)
		if max == -1 {
			// -1 means unlimited (Growth/HotelPro plans)
			c.Next()
			return
		}

		count, err := getCurrentCount(c)
		if err != nil {
			response.InternalError(c)
			return
		}

		if count >= int64(max) {
			response.PlanLimitExceeded(c, resource)
			return
		}

		c.Next()
	}
}
