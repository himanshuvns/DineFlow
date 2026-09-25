package handlers

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	appwa "github.com/dineflow/api/internal/application/whatsapp"
	domainwa "github.com/dineflow/api/internal/domain/whatsapp"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/internal/messaging"
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

// verifyMetaSignature verifies Meta Cloud API's X-Hub-Signature-256 header.
func verifyMetaSignature(signatureHeader, appSecret string, body []byte) bool {
	if appSecret == "" {
		return true // local development without secret configured
	}
	if signatureHeader == "" || !strings.HasPrefix(signatureHeader, "sha256=") {
		return false
	}
	expectedSig := strings.TrimPrefix(signatureHeader, "sha256=")
	mac := hmac.New(sha256.New, []byte(appSecret))
	mac.Write(body)
	actualSig := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expectedSig), []byte(actualSig))
}

// verifyOpenWASignature verifies OpenWA's X-OpenWA-Signature header.
func verifyOpenWASignature(sigHeader, secret string, body []byte) bool {
	if secret == "" {
		return true // local development without secret configured
	}
	if sigHeader == "" {
		return false
	}
	expectedSig := strings.TrimPrefix(sigHeader, "sha256=")
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(body)
	actualSig := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expectedSig), []byte(actualSig))
}

// VerifyWebhook godoc
// GET /api/v1/whatsapp/webhook
// Handles Meta Cloud API Webhook subscription challenge.
func (h *WhatsAppHandler) VerifyWebhook(c *gin.Context) {
	mode := c.Query("hub.mode")
	token := c.Query("hub.verify_token")
	challenge := c.Query("hub.challenge")

	expectedToken := os.Getenv("WHATSAPP_VERIFY_TOKEN")
	if expectedToken == "" {
		expectedToken = os.Getenv("WHATSAPP_WEBHOOK_VERIFY_TOKEN")
	}
	if expectedToken == "" {
		expectedToken = "dineflow_webhook_verify_secret"
	}

	if mode == "subscribe" && token == expectedToken {
		c.String(http.StatusOK, challenge)
		return
	}

	c.AbortWithStatus(http.StatusForbidden)
}

// HandleWebhook godoc
// POST /api/v1/whatsapp/webhook
// Handles incoming OpenWA and Meta Cloud API webhook events (messages and delivery statuses).
func (h *WhatsAppHandler) HandleWebhook(c *gin.Context) {
	bodyBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		response.BadRequest(c, "READ_ERROR", err.Error())
		return
	}
	c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	// Verify cryptographic signature if WHATSAPP_APP_SECRET is set
	appSecret := os.Getenv("WHATSAPP_APP_SECRET")
	sigHeader := c.GetHeader("X-Hub-Signature-256")
	if appSecret != "" && sigHeader != "" && !verifyMetaSignature(sigHeader, appSecret, bodyBytes) {
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
			"error": "Invalid Meta webhook cryptographic signature",
		})
		return
	}

	// Verify OpenWA signature if X-OpenWA-Signature is set
	openwaSecret := os.Getenv("OPENWA_WEBHOOK_SECRET")
	openwaSig := c.GetHeader("X-OpenWA-Signature")
	if openwaSecret != "" && openwaSig != "" && !verifyOpenWASignature(openwaSig, openwaSecret, bodyBytes) {
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
			"error": "Invalid OpenWA webhook cryptographic signature",
		})
		return
	}

	// 1. Try parsing OpenWA Webhook Payload
	var openwaPayload struct {
		Event          string `json:"event"`
		SessionID      string `json:"sessionId"`
		Timestamp      string `json:"timestamp"`
		IdempotencyKey string `json:"idempotencyKey"`
		Data           struct {
			ID          string `json:"id"`
			ChatID      string `json:"chatId"`
			From        string `json:"from"`
			SenderPhone string `json:"senderPhone"`
			Body        string `json:"body"`
			Type        string `json:"type"`
			FromMe      bool   `json:"fromMe"`
			Status      string `json:"status"`
			Timestamp   int64  `json:"timestamp"`
		} `json:"data"`
	}
	if err := json.Unmarshal(bodyBytes, &openwaPayload); err == nil && openwaPayload.Event != "" {
		// Log every webhook during development (Phase 4 requirement)
		var rawMap map[string]interface{}
		_ = json.Unmarshal(bodyBytes, &rawMap)
		h.waService.LogWebhookEvent(c.Request.Context(), bson.NilObjectID, openwaPayload.Event, rawMap)

		if openwaPayload.Event == "session.status" {
			status := openwaPayload.Data.Status
			if status == "" {
				status = openwaPayload.Event
			}
			if p, ok := h.waService.GetProvider().(*messaging.OpenWAProvider); ok {
				p.UpdateFromWebhook(status)
			}
			c.JSON(http.StatusOK, gin.H{"status": "session status recorded", "event": status})
			return
		}

		if openwaPayload.Event == "message.received" || openwaPayload.Event == "message:received" || openwaPayload.Event == "message" {
			// Ignore messages sent by ourselves (prevent echo reply loop)
			if openwaPayload.Data.FromMe {
				c.Status(http.StatusOK)
				return
			}

			// Destination to reply to: prefer exact chatId (preserves @lid, @c.us, @g.us)
			replyTarget := openwaPayload.Data.ChatID
			if replyTarget == "" {
				replyTarget = openwaPayload.Data.From
			}

			from := openwaPayload.Data.SenderPhone
			if from == "" {
				from = openwaPayload.Data.From
			}
			if from == "" {
				from = openwaPayload.Data.ChatID
			}
			text := strings.TrimSpace(openwaPayload.Data.Body)
			cleanFrom := messaging.CleanPhoneNumber(from)

			if replyTarget == "" {
				replyTarget = cleanFrom
			}

			// 1a. Check if sender is staff
			staff, err := h.waService.FindStaffByPhone(c.Request.Context(), cleanFrom)
			if err == nil && staff != nil {
				reply, _ := h.waService.ProcessWorkforceMessage(c.Request.Context(), staff, text, "")
				if h.waService.GetProvider() != nil && reply != "" {
					_, _ = h.waService.GetProvider().SendText(c.Request.Context(), replyTarget, reply)
				}
				c.JSON(http.StatusOK, gin.H{"handled": "workforce", "reply": reply})
				return
			}

			// 1b. Process rule-based customer commands (Hi, Menu, Order Status)
			if botReply, handled := h.waService.ProcessRuleBasedCommand(c.Request.Context(), bson.NilObjectID, cleanFrom, text); handled {
				if h.waService.GetProvider() != nil && botReply != "" {
					_, _ = h.waService.GetProvider().SendText(c.Request.Context(), replyTarget, botReply)
				}
				c.JSON(http.StatusOK, gin.H{"handled": "command", "reply": botReply})
				return
			}

			// 1c. Fallback to conversational chatbot or acknowledge
			reply, _ := h.waService.ProcessChatbotMessage(c.Request.Context(), bson.NilObjectID, cleanFrom, "Guest", text)
			if h.waService.GetProvider() != nil && reply != "" {
				_, _ = h.waService.GetProvider().SendText(c.Request.Context(), replyTarget, reply)
			}
			c.JSON(http.StatusOK, gin.H{"handled": "chatbot", "reply": reply})
			return
		}

		c.Status(http.StatusOK)
		return
	}

	// 2. Try parsing official Meta Webhook Payload
	var metaPayload domainwa.MetaWebhookPayload
	if err := json.Unmarshal(bodyBytes, &metaPayload); err == nil && metaPayload.Object != "" {
		_ = h.waService.HandleMetaWebhook(c.Request.Context(), metaPayload)
		c.Status(http.StatusOK)
		return
	}

	// 3. Fallback to legacy flat payload
	var legacyPayload struct {
		FromNumber  string `json:"fromNumber"`
		MessageText string `json:"messageText"`
		ButtonID    string `json:"buttonId"`
	}
	if err := json.Unmarshal(bodyBytes, &legacyPayload); err == nil && legacyPayload.FromNumber != "" {
		staff, err := h.waService.FindStaffByPhone(c.Request.Context(), legacyPayload.FromNumber)
		if err == nil && staff != nil {
			reply, _ := h.waService.ProcessWorkforceMessage(c.Request.Context(), staff, legacyPayload.MessageText, legacyPayload.ButtonID)
			response.OK(c, gin.H{
				"actionTaken": fmt.Sprintf("Handled by DineFlow Workforce Assistant for %s (%s).", staff.Name, staff.Role),
				"botReply":    reply,
				"isWorkforce": true,
			})
			return
		}

		result := h.waService.HandleInboundMessage(c.Request.Context(), legacyPayload.FromNumber, legacyPayload.MessageText)
		response.OK(c, result)
		return
	}

	c.Status(http.StatusOK)
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

	var req struct {
		RecipientPhone string `json:"recipientPhone" binding:"required"`
		CustomerName   string `json:"customerName"`
		Template       string `json:"template"`
	}
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
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)
	status := h.waService.GetWABAStatus(c.Request.Context(), tOID)
	response.OK(c, status)
}

// GetConfig godoc
// GET /api/v1/whatsapp/config
func (h *WhatsAppHandler) GetConfig(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)
	cfg := h.waService.GetWABAStatus(c.Request.Context(), tOID)
	response.OK(c, cfg)
}

// UpdateConfig godoc
// PUT /api/v1/whatsapp/config
func (h *WhatsAppHandler) UpdateConfig(c *gin.Context) {
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

	var input domainwa.WhatsAppConfig
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	updated, err := h.waService.UpdateWABAConfig(c.Request.Context(), tOID, input)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, updated)
}

// GetSegments godoc
// GET /api/v1/whatsapp/segments
func (h *WhatsAppHandler) GetSegments(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	segments, err := h.waService.GetCustomerSegments(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, segments)
}

// ListCampaigns godoc
// GET /api/v1/whatsapp/campaigns
func (h *WhatsAppHandler) ListCampaigns(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	campaigns, err := h.waService.ListCampaigns(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, campaigns)
}

// CreateCampaign godoc
// POST /api/v1/whatsapp/campaigns
func (h *WhatsAppHandler) CreateCampaign(c *gin.Context) {
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

	var camp domainwa.Campaign
	if err := c.ShouldBindJSON(&camp); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	created, err := h.waService.CreateCampaign(c.Request.Context(), tOID, camp)
	if err != nil {
		response.BadRequest(c, "CREATION_FAILED", err.Error())
		return
	}

	response.OK(c, created)
}

// SendCampaign godoc
// POST /api/v1/whatsapp/campaigns/:id/send
func (h *WhatsAppHandler) SendCampaign(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)
	cid := c.Param("id")

	camp, err := h.waService.SendCampaign(c.Request.Context(), tOID, cid)
	if err != nil {
		response.BadRequest(c, "SEND_FAILED", err.Error())
		return
	}

	response.OK(c, camp)
}

// ListTemplates godoc
// GET /api/v1/whatsapp/templates
func (h *WhatsAppHandler) ListTemplates(c *gin.Context) {
	tmpls := domainwa.GetStandardTemplates()
	response.OK(c, tmpls)
}

// SimulateChatbot godoc
// POST /api/v1/whatsapp/chatbot/simulate
func (h *WhatsAppHandler) SimulateChatbot(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	var req struct {
		Phone        string `json:"phone"`
		Message      string `json:"message" binding:"required"`
		CustomerName string `json:"customerName"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	if req.Phone == "" {
		req.Phone = "+91 98000 12345"
	}
	if req.CustomerName == "" {
		req.CustomerName = "Alex Rivera"
	}

	reply, err := h.waService.ProcessChatbotMessage(c.Request.Context(), tOID, req.Phone, req.CustomerName, req.Message)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{
		"reply": reply,
		"time":  "Just now",
		"phone": req.Phone,
	})
}

// ListInvoices godoc
// GET /api/v1/whatsapp/invoices
func (h *WhatsAppHandler) ListInvoices(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	invoices, err := h.waService.ListInvoices(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, invoices)
}

// CreateInvoice godoc
// POST /api/v1/whatsapp/invoices
func (h *WhatsAppHandler) CreateInvoice(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	var req struct {
		OrderID string `json:"orderId" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	inv, err := h.waService.CreateInvoiceFromOrder(c.Request.Context(), tOID, req.OrderID)
	if err != nil {
		response.BadRequest(c, "INVOICE_FAILED", err.Error())
		return
	}

	response.OK(c, inv)
}

// SendInvoiceWhatsApp godoc
// POST /api/v1/whatsapp/invoices/:id/send
func (h *WhatsAppHandler) SendInvoiceWhatsApp(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)
	invID := c.Param("id")

	inv, err := h.waService.SendInvoiceViaWhatsApp(c.Request.Context(), tOID, invID)
	if err != nil {
		response.BadRequest(c, "DELIVERY_FAILED", err.Error())
		return
	}

	response.OK(c, inv)
}

// GetInvoiceReceiptHTML godoc
// GET /api/v1/whatsapp/invoices/:id/receipt
func (h *WhatsAppHandler) GetInvoiceReceiptHTML(c *gin.Context) {
	invID := c.Param("id")
	html, err := h.waService.GenerateInvoiceHTML(c.Request.Context(), invID)
	if err != nil {
		c.String(http.StatusNotFound, "Invoice not found or expired")
		return
	}

	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
}

// VerifyCheckInToken godoc
// GET /api/v1/public/workforce/verify-token
func (h *WhatsAppHandler) VerifyCheckInToken(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		response.BadRequest(c, "MISSING_TOKEN", "token query parameter is required")
		return
	}

	result, err := h.waService.VerifyCheckInTokenDetails(c.Request.Context(), token)
	if err != nil || !result.Valid {
		errMsg := "Invalid or expired check-in link"
		if result != nil && result.Error != "" {
			errMsg = result.Error
		}
		response.BadRequest(c, "INVALID_TOKEN", errMsg)
		return
	}

	response.OK(c, result)
}

// PublicWorkforceCheckIn godoc
// POST /api/v1/public/workforce/check-in
func (h *WhatsAppHandler) PublicWorkforceCheckIn(c *gin.Context) {
	var input domainwa.WorkforceCheckInInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	res, err := h.waService.ProcessWorkforceCheckIn(c.Request.Context(), input)
	if err != nil {
		if res != nil && !res.Success {
			response.BadRequest(c, "GEOFENCE_VIOLATION", res.Message)
			return
		}
		response.BadRequest(c, "CHECKIN_FAILED", err.Error())
		return
	}

	response.OK(c, res)
}

// ── OpenWA Session Management Endpoints ─────────────────────────────────────

func (h *WhatsAppHandler) updateGatewayURL(c *gin.Context) {
	if gatewayURL := strings.TrimSpace(c.Query("gatewayUrl")); gatewayURL != "" {
		if p, ok := h.waService.GetProvider().(*messaging.OpenWAProvider); ok {
			p.SetBaseURL(gatewayURL)
		}
	}
}

func (h *WhatsAppHandler) getGatewayURL() string {
	if p, ok := h.waService.GetProvider().(*messaging.OpenWAProvider); ok {
		return p.GetBaseURL()
	}
	return os.Getenv("OPENWA_URL")
}

// StartOpenWASession godoc
// POST /api/v1/whatsapp/openwa/session/start
func (h *WhatsAppHandler) StartOpenWASession(c *gin.Context) {
	h.updateGatewayURL(c)
	sessionID := c.DefaultQuery("sessionId", os.Getenv("OPENWA_SESSION_ID"))
	if sessionID == "" {
		sessionID = "dineflow-dev"
	}
	if err := h.waService.StartOpenWASession(c.Request.Context(), sessionID); err != nil {
		response.BadRequest(c, "SESSION_START_FAILED", err.Error())
		return
	}
	response.OK(c, gin.H{"status": "starting", "sessionId": sessionID, "gatewayUrl": h.getGatewayURL()})
}

// GetOpenWAQR godoc
// GET /api/v1/whatsapp/openwa/session/qr
func (h *WhatsAppHandler) GetOpenWAQR(c *gin.Context) {
	h.updateGatewayURL(c)
	sessionID := c.DefaultQuery("sessionId", os.Getenv("OPENWA_SESSION_ID"))
	if sessionID == "" {
		sessionID = "dineflow-dev"
	}
	qr, status, err := h.waService.GetOpenWAQR(c.Request.Context(), sessionID)
	errMsg := ""
	if err != nil {
		errMsg = err.Error()
	}
	response.OK(c, gin.H{
		"qr":           qr,
		"status":       status,
		"sessionId":    sessionID,
		"gatewayUrl":   h.getGatewayURL(),
		"errorMessage": errMsg,
	})
}

// GetOpenWASessionStatus godoc
// GET /api/v1/whatsapp/openwa/session/status
func (h *WhatsAppHandler) GetOpenWASessionStatus(c *gin.Context) {
	h.updateGatewayURL(c)
	sessionID := c.DefaultQuery("sessionId", os.Getenv("OPENWA_SESSION_ID"))
	if sessionID == "" {
		sessionID = "dineflow-dev"
	}
	status, err := h.waService.GetOpenWASessionStatus(c.Request.Context(), sessionID)
	if err != nil {
		response.BadRequest(c, "STATUS_FETCH_FAILED", err.Error())
		return
	}
	response.OK(c, gin.H{
		"sessionId":     status.SessionID,
		"status":        status.Status,
		"engine":        status.Engine,
		"phoneNumber":   status.PhoneNumber,
		"lastConnected": status.LastConnected,
		"updatedAt":     status.UpdatedAt,
		"errorMessage":  status.ErrorMessage,
		"gatewayUrl":    h.getGatewayURL(),
	})
}

// StopOpenWASession godoc
// POST /api/v1/whatsapp/openwa/session/disconnect
func (h *WhatsAppHandler) StopOpenWASession(c *gin.Context) {
	h.updateGatewayURL(c)
	sessionID := c.DefaultQuery("sessionId", os.Getenv("OPENWA_SESSION_ID"))
	if sessionID == "" {
		sessionID = "dineflow-dev"
	}
	if err := h.waService.StopOpenWASession(c.Request.Context(), sessionID); err != nil {
		response.BadRequest(c, "SESSION_STOP_FAILED", err.Error())
		return
	}
	response.OK(c, gin.H{"status": "disconnected", "sessionId": sessionID, "gatewayUrl": h.getGatewayURL()})
}

// RestartOpenWASession godoc
// POST /api/v1/whatsapp/openwa/session/restart
func (h *WhatsAppHandler) RestartOpenWASession(c *gin.Context) {
	h.updateGatewayURL(c)
	sessionID := c.DefaultQuery("sessionId", os.Getenv("OPENWA_SESSION_ID"))
	if sessionID == "" {
		sessionID = "dineflow-dev"
	}
	if err := h.waService.RestartOpenWASession(c.Request.Context(), sessionID); err != nil {
		response.BadRequest(c, "SESSION_RESTART_FAILED", err.Error())
		return
	}
	response.OK(c, gin.H{"status": "restarted", "sessionId": sessionID, "gatewayUrl": h.getGatewayURL()})
}


