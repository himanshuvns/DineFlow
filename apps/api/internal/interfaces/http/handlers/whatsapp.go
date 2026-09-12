package handlers

import (
	"net/http"

	appwa "github.com/dineflow/api/internal/application/whatsapp"
	domainwa "github.com/dineflow/api/internal/domain/whatsapp"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type WhatsAppHandler struct {
	waService *appwa.Service
}

func NewWhatsAppHandler(waService *appwa.Service) *WhatsAppHandler {
	return &WhatsAppHandler{waService: waService}
}

// VerifyWebhook godoc
// GET /api/v1/whatsapp/webhook
// Handles Meta Cloud API Webhook subscription challenge.
func (h *WhatsAppHandler) VerifyWebhook(c *gin.Context) {
	mode := c.Query("hub.mode")
	token := c.Query("hub.verify_token")
	challenge := c.Query("hub.challenge")

	if mode == "subscribe" && token == "dineflow_webhook_verify_secret" {
		c.String(http.StatusOK, challenge)
		return
	}

	c.AbortWithStatus(http.StatusForbidden)
}

type InboundWebhookPayload struct {
	FromNumber  string `json:"fromNumber"`
	MessageText string `json:"messageText"`
}

// HandleWebhook godoc
// POST /api/v1/whatsapp/webhook
func (h *WhatsAppHandler) HandleWebhook(c *gin.Context) {
	var payload InboundWebhookPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		response.BadRequest(c, "INVALID_WEBHOOK_PAYLOAD", err.Error())
		return
	}

	result := h.waService.HandleInboundMessage(c.Request.Context(), payload.FromNumber, payload.MessageText)
	response.OK(c, result)
}

type SendTestRequest struct {
	RecipientPhone string `json:"recipientPhone" binding:"required"`
	CustomerName   string `json:"customerName"`
	Template       string `json:"template"`
}

// SendTestMessage godoc
// POST /api/v1/whatsapp/send-test
func (h *WhatsAppHandler) SendTestMessage(c *gin.Context) {
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

	var req SendTestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	if req.CustomerName == "" {
		req.CustomerName = "Valued Guest"
	}

	orderData := domainwa.OrderConfirmationData{
		CustomerName:   req.CustomerName,
		RestaurantName: "The Grand Bistro",
		LocationName:   "Table 14",
		OrderNumber:    "ORD-TEST",
		TotalAmount:    1170.00,
		Currency:       "INR",
		ItemCount:      2,
		TrackingURL:    "https://dineflow.app/m/the-grand-bistro/order/ORD-TEST",
	}

	log, err := h.waService.SendOrderConfirmation(c.Request.Context(), tOID, req.RecipientPhone, orderData)
	if err != nil {
		response.BadRequest(c, "SEND_FAILED", err.Error())
		return
	}

	response.OK(c, log)
}

// ListLogs godoc
// GET /api/v1/whatsapp/logs
func (h *WhatsAppHandler) ListLogs(c *gin.Context) {
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

	logs, err := h.waService.ListLogs(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, logs)
}

// GetStatus godoc
// GET /api/v1/whatsapp/status
func (h *WhatsAppHandler) GetStatus(c *gin.Context) {
	status := h.waService.GetWABAStatus(c.Request.Context())
	response.OK(c, status)
}
