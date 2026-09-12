package handlers

import (
	"net/http"

	aiapp "github.com/dineflow/api/internal/application/ai"
	domainai "github.com/dineflow/api/internal/domain/ai"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// AIHandler serves all Phase 6 AI-powered endpoints.
type AIHandler struct {
	aiService *aiapp.Service
}

func NewAIHandler(aiService *aiapp.Service) *AIHandler {
	return &AIHandler{aiService: aiService}
}

// GetStatus godoc
// GET /api/v1/ai/status
func (h *AIHandler) GetStatus(c *gin.Context) {
	response.OK(c, gin.H{
		"mockMode": h.aiService.IsMockMode(),
		"model":    "gemini-2.0-flash-lite",
		"features": []string{
			"menu-description",
			"upsell-suggestions",
			"demand-forecast",
			"chatbot",
			"pricing-alerts",
		},
	})
}

// GenerateMenuDescription godoc
// POST /api/v1/ai/menu-description
func (h *AIHandler) GenerateMenuDescription(c *gin.Context) {
	var req domainai.MenuDescriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}
	if req.ItemName == "" {
		response.BadRequest(c, "MISSING_FIELD", "itemName is required")
		return
	}
	if req.Tone == "" {
		req.Tone = "poetic"
	}

	res, err := h.aiService.GenerateMenuDescription(c.Request.Context(), req)
	if err != nil {
		response.InternalError(c)
		return
	}
	c.JSON(http.StatusOK, res)
}

// GetUpsellSuggestions godoc
// POST /api/v1/ai/upsell
func (h *AIHandler) GetUpsellSuggestions(c *gin.Context) {
	var req domainai.UpsellRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}
	if len(req.CartItems) == 0 {
		response.BadRequest(c, "MISSING_FIELD", "cartItems cannot be empty")
		return
	}
	if req.Channel == "" {
		req.Channel = "dine_in"
	}

	res, err := h.aiService.GetUpsellSuggestions(c.Request.Context(), req)
	if err != nil {
		response.InternalError(c)
		return
	}
	c.JSON(http.StatusOK, res)
}

// GetDemandForecast godoc
// GET /api/v1/ai/forecast
func (h *AIHandler) GetDemandForecast(c *gin.Context) {
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

	res, err := h.aiService.GetDemandForecast(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}
	c.JSON(http.StatusOK, res)
}

// ChatbotReply godoc
// POST /api/v1/ai/chatbot
func (h *AIHandler) ChatbotReply(c *gin.Context) {
	var req domainai.ChatbotMessage
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}
	if req.MessageText == "" {
		response.BadRequest(c, "MISSING_FIELD", "messageText is required")
		return
	}
	if req.GuestName == "" {
		req.GuestName = "Guest"
	}

	res, err := h.aiService.ChatbotReply(c.Request.Context(), req)
	if err != nil {
		response.InternalError(c)
		return
	}
	c.JSON(http.StatusOK, res)
}

// GetPricingAlerts godoc
// GET /api/v1/ai/pricing-alerts
func (h *AIHandler) GetPricingAlerts(c *gin.Context) {
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

	res, err := h.aiService.GetPricingAlerts(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}
	c.JSON(http.StatusOK, res)
}
