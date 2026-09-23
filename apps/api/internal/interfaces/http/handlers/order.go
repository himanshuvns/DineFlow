package handlers

import (
	"fmt"
	"io"
	"net/http"

	apporder "github.com/dineflow/api/internal/application/order"
	domainorder "github.com/dineflow/api/internal/domain/order"
	"github.com/dineflow/api/internal/infrastructure/realtime"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type OrderHandler struct {
	orderService *apporder.Service
	hub          *realtime.Hub
}

func NewOrderHandler(s *apporder.Service, hub *realtime.Hub) *OrderHandler {
	return &OrderHandler{orderService: s, hub: hub}
}

// ─── Public Customer QR Order Endpoints ───────────────────────────────────────

func (h *OrderHandler) CreateCustomerOrder(c *gin.Context) {
	var input apporder.CreateOrderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	ord, err := h.orderService.CreateCustomerOrder(c.Request.Context(), input)
	if err != nil {
		response.BadRequest(c, "ORDER_FAILED", err.Error())
		return
	}

	response.Created(c, ord)
}

func (h *OrderHandler) GetCustomerOrder(c *gin.Context) {
	orderID := c.Param("orderId")
	if orderID == "" {
		response.BadRequest(c, "INVALID_ID", "order ID is required")
		return
	}

	ord, err := h.orderService.GetOrderByID(c.Request.Context(), orderID)
	if err != nil {
		response.NotFound(c, err.Error())
		return
	}

	response.OK(c, ord)
}

// ─── Protected Dashboard & KDS Endpoints ──────────────────────────────────────

func (h *OrderHandler) List(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	var statusFilter *domainorder.OrderStatus
	if s := c.Query("status"); s != "" {
		st := domainorder.OrderStatus(s)
		statusFilter = &st
	}

	orders, err := h.orderService.ListOrders(c.Request.Context(), tOID, statusFilter)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, orders)
}

type UpdateOrderStatusRequest struct {
	Status        domainorder.OrderStatus `json:"status" binding:"required"`
	Note          string                  `json:"note"`
	BillingMethod string                  `json:"billingMethod,omitempty"`
}

func (h *OrderHandler) UpdateStatus(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	orderID := c.Param("orderId")
	if orderID == "" {
		response.BadRequest(c, "INVALID_ID", "order ID is required")
		return
	}

	var req UpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	ord, err := h.orderService.UpdateOrderStatus(c.Request.Context(), tOID, orderID, req.Status, req.Note, req.BillingMethod)
	if err != nil {
		response.BadRequest(c, "STATUS_UPDATE_FAILED", err.Error())
		return
	}

	response.OK(c, ord)
}

// ─── Real-Time Server-Sent Events (SSE) Stream ────────────────────────────────

func (h *OrderHandler) StreamOrders(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		tenantID = c.Query("tenantId")
		if tenantID == "" {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
	}

	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Transfer-Encoding", "chunked")

	messageChan := make(chan []byte, 10)
	h.hub.Register(tenantID, messageChan)
	defer h.hub.Unregister(tenantID, messageChan)

	c.SSEvent("connected", fmt.Sprintf(`{"status":"connected","tenantId":"%s"}`, tenantID))
	c.Writer.Flush()

	c.Stream(func(w io.Writer) bool {
		select {
		case msg, ok := <-messageChan:
			if !ok {
				return false
			}
			c.SSEvent("order", string(msg))
			return true
		case <-c.Request.Context().Done():
			return false
		}
	})
}
