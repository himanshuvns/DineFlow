package handlers

import (
	"strconv"

	appreview "github.com/dineflow/api/internal/application/review"
	domainreview "github.com/dineflow/api/internal/domain/review"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type ReviewHandler struct {
	reviewService *appreview.Service
}

func NewReviewHandler(reviewService *appreview.Service) *ReviewHandler {
	return &ReviewHandler{reviewService: reviewService}
}

// GetPublicMeta godoc
// GET /api/v1/reviews/public/:slug
func (h *ReviewHandler) GetPublicMeta(c *gin.Context) {
	slug := c.Param("slug")
	if slug == "" {
		response.BadRequest(c, "MISSING_SLUG", "restaurant slug is required")
		return
	}

	meta, err := h.reviewService.GetPublicRestaurantReviewMeta(c.Request.Context(), slug)
	if err != nil {
		response.NotFound(c, "Restaurant")
		return
	}

	response.OK(c, meta)
}

// GenerateReviewSuggestions godoc
// POST /api/v1/reviews/generate
func (h *ReviewHandler) GenerateReviewSuggestions(c *gin.Context) {
	var req domainreview.GenerateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	if req.Rating < 1 || req.Rating > 5 {
		req.Rating = 5
	}

	res, err := h.reviewService.GenerateReviewSuggestions(c.Request.Context(), req)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, res)
}

// SubmitFeedback godoc
// POST /api/v1/reviews/feedback
func (h *ReviewHandler) SubmitFeedback(c *gin.Context) {
	var input struct {
		TenantID        string   `json:"tenantId"`
		TenantSlug      string   `json:"tenantSlug"`
		Rating          int      `json:"rating" binding:"required"`
		IssueCategories []string `json:"issueCategories"`
		VibeTags        []string `json:"vibeTags"`
		Comment         string   `json:"comment"`
		GuestName       string   `json:"guestName"`
		GuestPhone      string   `json:"guestPhone"`
		GuestEmail      string   `json:"guestEmail"`
		TableOrRoom     string   `json:"tableOrRoom"`
		Status          string   `json:"status"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	if input.Rating < 1 || input.Rating > 5 {
		response.BadRequest(c, "INVALID_RATING", "rating must be between 1 and 5")
		return
	}

	var tenantOID bson.ObjectID
	if input.TenantID != "" {
		var err error
		tenantOID, err = bson.ObjectIDFromHex(input.TenantID)
		if err != nil {
			response.BadRequest(c, "INVALID_TENANT_ID", "invalid tenant ID")
			return
		}
	} else if input.TenantSlug != "" {
		meta, err := h.reviewService.GetPublicRestaurantReviewMeta(c.Request.Context(), input.TenantSlug)
		if err == nil && meta.TenantID != "" {
			tenantOID, _ = bson.ObjectIDFromHex(meta.TenantID)
		}
	}

	if tenantOID == bson.NilObjectID {
		response.BadRequest(c, "MISSING_TENANT", "tenantId or tenantSlug is required")
		return
	}

	fb := &domainreview.PrivateFeedback{
		TenantID:        tenantOID,
		TenantSlug:      input.TenantSlug,
		Rating:          input.Rating,
		IssueCategories: input.IssueCategories,
		VibeTags:        input.VibeTags,
		Comment:         input.Comment,
		GuestName:       input.GuestName,
		GuestPhone:      input.GuestPhone,
		GuestEmail:      input.GuestEmail,
		TableOrRoom:     input.TableOrRoom,
		Status:          input.Status,
	}

	if err := h.reviewService.SubmitPrivateFeedback(c.Request.Context(), fb); err != nil {
		response.InternalError(c)
		return
	}

	response.Created(c, gin.H{
		"message": "Feedback submitted successfully",
		"id":      fb.ID.Hex(),
	})
}

// RecordScan godoc
// POST /api/v1/reviews/public/:slug/scan
func (h *ReviewHandler) RecordScan(c *gin.Context) {
	slug := c.Param("slug")
	if slug == "" {
		response.BadRequest(c, "MISSING_SLUG", "restaurant slug is required")
		return
	}

	scans, err := h.reviewService.RecordScan(c.Request.Context(), slug)
	if err != nil {
		response.NotFound(c, "Restaurant")
		return
	}

	response.OK(c, gin.H{
		"slug":       slug,
		"totalScans": scans,
	})
}

// GetStats godoc
// GET /api/v1/reviews/stats
func (h *ReviewHandler) GetStats(c *gin.Context) {
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

	stats, err := h.reviewService.GetReviewStats(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, stats)
}

// ListFeedback godoc
// GET /api/v1/reviews/feedback
func (h *ReviewHandler) ListFeedback(c *gin.Context) {
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

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if limit < 1 || limit > 100 {
		limit = 20
	}
	status := c.Query("status")

	items, total, err := h.reviewService.ListPrivateFeedback(c.Request.Context(), tOID, page, limit, status)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OKWithMeta(c, items, &response.Meta{
		Page:    page,
		Limit:   limit,
		Total:   total,
		HasMore: int64(page*limit) < total,
	})
}

// UpdateFeedbackStatus godoc
// PATCH /api/v1/reviews/feedback/:id/status
func (h *ReviewHandler) UpdateFeedbackStatus(c *gin.Context) {
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

	fbOID, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "INVALID_FEEDBACK_ID", "invalid feedback ID")
		return
	}

	var body struct {
		Status string `json:"status" binding:"required"`
		Notes  string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	if err := h.reviewService.UpdateFeedbackStatus(c.Request.Context(), tOID, fbOID, body.Status, body.Notes); err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{"message": "Feedback status updated"})
}
