package handlers

import (
	"strings"
	"time"

	domaintenant "github.com/dineflow/api/internal/domain/tenant"
	mongoinfra "github.com/dineflow/api/internal/infrastructure/mongodb"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// TenantHandler contains HTTP handlers for tenant management endpoints.
type TenantHandler struct {
	db *mongoinfra.Client
}

// NewTenantHandler creates a new TenantHandler.
func NewTenantHandler(db *mongoinfra.Client) *TenantHandler {
	return &TenantHandler{db: db}
}

// Get godoc
// GET /api/v1/tenant
func (h *TenantHandler) Get(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, err := bson.ObjectIDFromHex(tenantID)
	if err != nil {
		response.BadRequest(c, "INVALID_TENANT_ID", "invalid tenant id")
		return
	}

	coll := h.db.Collection("tenants")
	var t domaintenant.Tenant
	if err := coll.FindOne(c.Request.Context(), bson.M{"_id": tOID}).Decode(&t); err != nil {
		response.NotFound(c, "tenant not found")
		return
	}

	response.OK(c, t)
}

type UpdateTenantRequest struct {
	Name         *string `json:"name"`
	Currency     *string `json:"currency"`
	Logo         *string `json:"logo"`
	LogoURL      *string `json:"logoUrl"`
	BusinessType *string `json:"businessType"`
	Timezone     *string `json:"timezone"`
}

// Update godoc
// PATCH /api/v1/tenant
func (h *TenantHandler) Update(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, err := bson.ObjectIDFromHex(tenantID)
	if err != nil {
		response.BadRequest(c, "INVALID_TENANT_ID", "invalid tenant id")
		return
	}

	var req UpdateTenantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	updateFields := bson.M{"updatedAt": time.Now().UTC()}
	if req.Name != nil && strings.TrimSpace(*req.Name) != "" {
		updateFields["name"] = strings.TrimSpace(*req.Name)
	}
	if req.Currency != nil && strings.TrimSpace(*req.Currency) != "" {
		updateFields["currency"] = strings.ToUpper(strings.TrimSpace(*req.Currency))
	}
	if req.Logo != nil {
		updateFields["logo"] = *req.Logo
	} else if req.LogoURL != nil {
		updateFields["logo"] = *req.LogoURL
	}
	if req.BusinessType != nil && strings.TrimSpace(*req.BusinessType) != "" {
		updateFields["businessType"] = strings.TrimSpace(*req.BusinessType)
	}
	if req.Timezone != nil && strings.TrimSpace(*req.Timezone) != "" {
		updateFields["timezone"] = strings.TrimSpace(*req.Timezone)
	}

	coll := h.db.Collection("tenants")
	_, err = coll.UpdateOne(c.Request.Context(), bson.M{"_id": tOID}, bson.M{"$set": updateFields})
	if err != nil {
		response.InternalError(c)
		return
	}

	var updated domaintenant.Tenant
	_ = coll.FindOne(c.Request.Context(), bson.M{"_id": tOID}).Decode(&updated)

	response.OK(c, gin.H{
		"success": true,
		"tenant":  updated,
	})
}

type UploadLogoRequest struct {
	Logo    string `json:"logo"`
	LogoURL string `json:"logoUrl"`
}

// UploadLogo godoc
// POST /api/v1/tenant/logo
func (h *TenantHandler) UploadLogo(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, err := bson.ObjectIDFromHex(tenantID)
	if err != nil {
		response.BadRequest(c, "INVALID_TENANT_ID", "invalid tenant id")
		return
	}

	var req UploadLogoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	logoVal := req.Logo
	if logoVal == "" {
		logoVal = req.LogoURL
	}

	if strings.TrimSpace(logoVal) == "" {
		response.BadRequest(c, "MISSING_LOGO", "logo payload is required")
		return
	}

	coll := h.db.Collection("tenants")
	_, err = coll.UpdateOne(
		c.Request.Context(),
		bson.M{"_id": tOID},
		bson.M{
			"$set": bson.M{
				"logo":      logoVal,
				"updatedAt": time.Now().UTC(),
			},
		},
	)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{
		"success": true,
		"logo":    logoVal,
		"logoUrl": logoVal,
	})
}

// GetFeatures godoc
// GET /api/v1/tenant/features
func (h *TenantHandler) GetFeatures(c *gin.Context) {
	response.OK(c, gin.H{"message": "Features active"})
}

// GetOnboarding godoc
// GET /api/v1/tenant/onboarding
func (h *TenantHandler) GetOnboarding(c *gin.Context) {
	response.OK(c, gin.H{"completed": true})
}

// UpdateOnboardingStep godoc
// PATCH /api/v1/tenant/onboarding/:step
func (h *TenantHandler) UpdateOnboardingStep(c *gin.Context) {
	step := c.Param("step")
	response.OK(c, gin.H{"step": step, "completed": true})
}

