package handlers

import (
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
)

// TenantHandler contains HTTP handlers for tenant management endpoints.
type TenantHandler struct{}

// NewTenantHandler creates a new TenantHandler.
func NewTenantHandler() *TenantHandler {
	return &TenantHandler{}
}

// Get godoc
// GET /api/v1/tenant
func (h *TenantHandler) Get(c *gin.Context) {
	response.OK(c, gin.H{
		"tenantId": middleware.GetTenantID(c),
		"message":  "Full tenant fetch implemented in Phase 2",
	})
}

// Update godoc
// PATCH /api/v1/tenant
func (h *TenantHandler) Update(c *gin.Context) {
	response.OK(c, gin.H{"message": "Implemented in Phase 2"})
}

// UploadLogo godoc
// POST /api/v1/tenant/logo
func (h *TenantHandler) UploadLogo(c *gin.Context) {
	response.OK(c, gin.H{"message": "Implemented in Phase 2"})
}

// GetFeatures godoc
// GET /api/v1/tenant/features
func (h *TenantHandler) GetFeatures(c *gin.Context) {
	response.OK(c, gin.H{"message": "Implemented in Phase 2"})
}

// GetOnboarding godoc
// GET /api/v1/tenant/onboarding
func (h *TenantHandler) GetOnboarding(c *gin.Context) {
	response.OK(c, gin.H{"message": "Implemented in Phase 2"})
}

// UpdateOnboardingStep godoc
// PATCH /api/v1/tenant/onboarding/:step
func (h *TenantHandler) UpdateOnboardingStep(c *gin.Context) {
	step := c.Param("step")
	response.OK(c, gin.H{"step": step, "message": "Implemented in Phase 2"})
}
