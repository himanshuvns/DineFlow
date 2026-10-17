package handlers

import (
	"io"
	"strings"

	apppayment "github.com/dineflow/api/internal/application/payment"
	domainpayment "github.com/dineflow/api/internal/domain/payment"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type PaymentHandler struct {
	paymentService *apppayment.Service
}

func NewPaymentHandler(s *apppayment.Service) *PaymentHandler {
	return &PaymentHandler{paymentService: s}
}

// CreateSession godoc
// POST /api/v1/payments/create-session
func (h *PaymentHandler) CreateSession(c *gin.Context) {
	var req domainpayment.CreatePaymentSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	res, err := h.paymentService.CreateSession(c.Request.Context(), req)
	if err != nil {
		response.BadRequest(c, "SESSION_CREATION_FAILED", err.Error())
		return
	}

	response.OK(c, res)
}

// HandleWebhook godoc
// POST /api/v1/payments/youpi/webhook
func (h *PaymentHandler) HandleWebhook(c *gin.Context) {
	bodyBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		response.BadRequest(c, "READ_ERROR", "failed to read webhook body")
		return
	}

	signature := c.GetHeader("X-YouPI-Signature")
	if signature == "" {
		signature = c.GetHeader("X-Signature")
	}
	if signature == "" {
		signature = c.GetHeader("X-Hub-Signature-256")
	}

	if err := h.paymentService.HandleYoupiWebhook(c.Request.Context(), bodyBytes, signature); err != nil {
		response.BadRequest(c, "WEBHOOK_FAILED", err.Error())
		return
	}

	response.OK(c, gin.H{
		"success": true,
		"message": "Payment verified and order settled successfully",
	})
}

// GetPaymentStatus godoc
// GET /api/v1/payments/status/:orderId
func (h *PaymentHandler) GetPaymentStatus(c *gin.Context) {
	orderID := strings.TrimSpace(c.Param("orderId"))
	if orderID == "" {
		response.BadRequest(c, "MISSING_ORDER_ID", "orderId path parameter is required")
		return
	}

	status, err := h.paymentService.GetPaymentStatus(c.Request.Context(), orderID)
	if err != nil {
		response.NotFound(c, "payment")
		return
	}

	response.OK(c, status)
}

// VerifyManualUTR godoc
// POST /api/v1/payments/verify-utr
func (h *PaymentHandler) VerifyManualUTR(c *gin.Context) {
	var req struct {
		OrderID string `json:"orderId" binding:"required"`
		UTR     string `json:"utr" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	if err := h.paymentService.VerifyManualUTR(c.Request.Context(), req.OrderID, req.UTR); err != nil {
		response.BadRequest(c, "UTR_VERIFICATION_FAILED", err.Error())
		return
	}

	response.OK(c, gin.H{
		"success": true,
		"orderId": req.OrderID,
		"utr":     req.UTR,
		"message": "Order settled successfully via UTR verification",
	})
}

// GetPaymentConfig godoc
// GET /api/v1/payments/config
func (h *PaymentHandler) GetPaymentConfig(c *gin.Context) {
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

	cfg, err := h.paymentService.GetTenantPaymentConfig(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, cfg)
}

// UpdatePaymentConfig godoc
// PUT /api/v1/payments/config
func (h *PaymentHandler) UpdatePaymentConfig(c *gin.Context) {
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

	var req domainpayment.TenantPaymentConfig
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	updated, err := h.paymentService.UpdateTenantPaymentConfig(c.Request.Context(), tOID, &req)
	if err != nil {
		response.BadRequest(c, "CONFIG_UPDATE_FAILED", err.Error())
		return
	}

	response.OK(c, updated)
}
