package handlers

import (
	"time"

	subapp "github.com/dineflow/api/internal/application/subscription"
	domainsub "github.com/dineflow/api/internal/domain/subscription"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type SubscriptionHandler struct {
	subService *subapp.Service
}

func NewSubscriptionHandler(subService *subapp.Service) *SubscriptionHandler {
	return &SubscriptionHandler{subService: subService}
}

// GetBillingStatus godoc
// GET /api/v1/billing/status
func (h *SubscriptionHandler) GetBillingStatus(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, err := bson.ObjectIDFromHex(tenantID)
	if err != nil {
		response.BadRequest(c, "INVALID_TENANT_ID", "invalid tenant ID")
		return
	}

	usage, err := h.subService.GetUsage(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, usage)
}

type CheckoutRequest struct {
	Plan  domainsub.PlanTier     `json:"plan" binding:"required"`
	Cycle domainsub.BillingCycle `json:"cycle"`
}

// CreateCheckout godoc
// POST /api/v1/billing/checkout
func (h *SubscriptionHandler) CreateCheckout(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, err := bson.ObjectIDFromHex(tenantID)
	if err != nil {
		response.BadRequest(c, "INVALID_TENANT_ID", "invalid tenant ID")
		return
	}

	var req CheckoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	if req.Cycle == "" {
		req.Cycle = domainsub.CycleMonthly
	}

	res, err := h.subService.CreateCheckoutSession(c.Request.Context(), tOID, req.Plan, req.Cycle)
	if err != nil {
		response.BadRequest(c, "CHECKOUT_FAILED", err.Error())
		return
	}

	response.OK(c, res)
}

// ChangePlan godoc
// POST /api/v1/billing/change-plan
func (h *SubscriptionHandler) ChangePlan(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, err := bson.ObjectIDFromHex(tenantID)
	if err != nil {
		response.BadRequest(c, "INVALID_TENANT_ID", "invalid tenant ID")
		return
	}

	var req CheckoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	if req.Cycle == "" {
		req.Cycle = domainsub.CycleMonthly
	}

	sub, err := h.subService.ChangePlan(c.Request.Context(), tOID, req.Plan, req.Cycle)
	if err != nil {
		response.BadRequest(c, "CHANGE_PLAN_FAILED", err.Error())
		return
	}

	response.OK(c, gin.H{
		"message":      "Plan updated successfully",
		"subscription": sub,
	})
}

// ListInvoices godoc
// GET /api/v1/billing/invoices
func (h *SubscriptionHandler) ListInvoices(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, err := bson.ObjectIDFromHex(tenantID)
	if err != nil {
		response.BadRequest(c, "INVALID_TENANT_ID", "invalid tenant ID")
		return
	}

	invoices, err := h.subService.ListInvoices(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, invoices)
}

// SimulateGracePeriod godoc
// POST /api/v1/billing/simulate-grace-period (For QA and testing grace period mechanics)
func (h *SubscriptionHandler) SimulateGracePeriod(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, err := bson.ObjectIDFromHex(tenantID)
	if err != nil {
		response.BadRequest(c, "INVALID_TENANT_ID", "invalid tenant ID")
		return
	}

	sub, err := h.subService.GetSubscription(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}

	now := time.Now().UTC()
	sub.Status = domainsub.StatusGracePeriod
	graceEnd := now.Add(14 * 24 * time.Hour)
	sub.GracePeriodEnd = &graceEnd

	response.OK(c, gin.H{
		"message":        "Subscription entered 14-day grace period. Restaurant operations continue normally.",
		"status":         sub.Status,
		"gracePeriodEnd": sub.GracePeriodEnd,
	})
}

// ── Super-Admin Platform Endpoints ─────────────────────────────────────────────

// GetPlatformOverview godoc
// GET /api/v1/admin/platform/overview
func (h *SubscriptionHandler) GetPlatformOverview(c *gin.Context) {
	metrics, err := h.subService.GetPlatformMetrics(c.Request.Context())
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, metrics)
}

type AdminOverrideRequest struct {
	TenantID string                 `json:"tenantId" binding:"required"`
	Plan     domainsub.PlanTier     `json:"plan" binding:"required"`
	Cycle    domainsub.BillingCycle `json:"cycle"`
}

// AdminOverridePlan godoc
// POST /api/v1/admin/platform/override-plan
func (h *SubscriptionHandler) AdminOverridePlan(c *gin.Context) {
	var req AdminOverrideRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	tOID, err := bson.ObjectIDFromHex(req.TenantID)
	if err != nil {
		response.BadRequest(c, "INVALID_TENANT_ID", "invalid target tenant ID")
		return
	}

	if req.Cycle == "" {
		req.Cycle = domainsub.CycleMonthly
	}

	sub, err := h.subService.ChangePlan(c.Request.Context(), tOID, req.Plan, req.Cycle)
	if err != nil {
		response.BadRequest(c, "OVERRIDE_FAILED", err.Error())
		return
	}

	response.OK(c, gin.H{
		"message":      "Tenant plan successfully overridden by Platform Admin",
		"subscription": sub,
	})
}
