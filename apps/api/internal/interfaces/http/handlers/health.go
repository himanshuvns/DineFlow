package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// healthCheckDeps holds injected dependencies for liveness checks.
var healthCheckDeps struct {
	mongoPing func() error
	redisPing func() error
}

// SetHealthDeps injects the ping functions used by the health endpoint.
func SetHealthDeps(mongoPing, redisPing func() error) {
	healthCheckDeps.mongoPing = mongoPing
	healthCheckDeps.redisPing = redisPing
}

// Health godoc
// GET /health
// Returns service health including MongoDB and Redis connectivity.
func Health(c *gin.Context) {
	mongoStatus := "connected"
	redisStatus := "connected"

	if healthCheckDeps.mongoPing != nil {
		if err := healthCheckDeps.mongoPing(); err != nil {
			mongoStatus = "disconnected"
		}
	}
	if healthCheckDeps.redisPing != nil {
		if err := healthCheckDeps.redisPing(); err != nil {
			redisStatus = "disconnected"
		}
	}

	status := http.StatusOK
	if mongoStatus != "connected" || redisStatus != "connected" {
		status = http.StatusServiceUnavailable
	}

	c.JSON(status, gin.H{
		"status":    "ok",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"services": gin.H{
			"mongo": mongoStatus,
			"redis": redisStatus,
		},
	})
}

// Version godoc
// GET /api/v1/
// Returns API version information.
func Version(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"name":    "DineFlow API",
		"version": "1.0.0",
		"env":     "development",
	})
}
