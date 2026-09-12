package handlers

import (
	"fmt"
	"net/http"
	"time"

	appanalytics "github.com/dineflow/api/internal/application/analytics"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type AnalyticsHandler struct {
	analyticsService *appanalytics.Service
}

func NewAnalyticsHandler(analyticsService *appanalytics.Service) *AnalyticsHandler {
	return &AnalyticsHandler{analyticsService: analyticsService}
}

// GetOverview godoc
// GET /api/v1/analytics/overview
func (h *AnalyticsHandler) GetOverview(c *gin.Context) {
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

	timeframe := c.DefaultQuery("timeframe", "30d")
	metrics, err := h.analyticsService.GetOverview(c.Request.Context(), tOID, timeframe)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, metrics)
}

// GetHourlyVelocity godoc
// GET /api/v1/analytics/hourly
func (h *AnalyticsHandler) GetHourlyVelocity(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	points := h.analyticsService.GetHourlyVelocity(c.Request.Context(), tOID)
	response.OK(c, points)
}

// GetTopItems godoc
// GET /api/v1/analytics/items
func (h *AnalyticsHandler) GetTopItems(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	items := h.analyticsService.GetTopItems(c.Request.Context(), tOID)
	response.OK(c, items)
}

// GetCategoryBreakdown godoc
// GET /api/v1/analytics/categories
func (h *AnalyticsHandler) GetCategoryBreakdown(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	shares := h.analyticsService.GetCategoryShare(c.Request.Context(), tOID)
	response.OK(c, shares)
}

// ExportCSV godoc
// GET /api/v1/analytics/export
func (h *AnalyticsHandler) ExportCSV(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	csvContent := h.analyticsService.GenerateCSV(c.Request.Context(), tOID)
	filename := fmt.Sprintf("dineflow-sales-%s.csv", time.Now().Format("2006-01-02"))

	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))
	c.Data(http.StatusOK, "text/csv; charset=utf-8", []byte(csvContent))
}
