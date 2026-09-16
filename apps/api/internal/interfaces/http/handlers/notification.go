package handlers

import (
	"fmt"
	"io"
	"net/http"
	"strconv"

	appnotification "github.com/dineflow/api/internal/application/notification"
	domainnotification "github.com/dineflow/api/internal/domain/notification"
	"github.com/dineflow/api/internal/infrastructure/realtime"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type NotificationHandler struct {
	notifService *appnotification.Service
	hub          *realtime.Hub
}

func NewNotificationHandler(s *appnotification.Service, hub *realtime.Hub) *NotificationHandler {
	return &NotificationHandler{notifService: s, hub: hub}
}

// List returns a paginated list of notifications with unreadCount and totalCount.
func (h *NotificationHandler) List(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, err := bson.ObjectIDFromHex(tenantID)
	if err != nil {
		response.BadRequest(c, "INVALID_TENANT", "invalid tenant ID")
		return
	}

	page, _ := strconv.ParseInt(c.DefaultQuery("page", "1"), 10, 64)
	limit, _ := strconv.ParseInt(c.DefaultQuery("limit", "30"), 10, 64)
	category := c.Query("category")
	priority := c.Query("priority")
	search := c.Query("search")

	var readPtr *bool
	if readStr := c.Query("read"); readStr != "" {
		val := readStr == "true" || readStr == "1"
		readPtr = &val
	}

	filter := appnotification.ListFilter{
		Category: category,
		Priority: priority,
		Read:     readPtr,
		Search:   search,
		Page:     page,
		Limit:    limit,
	}

	items, unreadCount, total, err := h.notifService.ListNotifications(c.Request.Context(), tOID, filter)
	if err != nil {
		response.BadRequest(c, "FETCH_FAILED", err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"data":        items,
		"unreadCount": unreadCount,
		"total":       total,
		"page":        page,
		"limit":       limit,
	})
}

// GetUnreadCount returns just the count of unread notifications for the active tenant.
func (h *NotificationHandler) GetUnreadCount(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, err := bson.ObjectIDFromHex(tenantID)
	if err != nil {
		response.BadRequest(c, "INVALID_TENANT", "invalid tenant ID")
		return
	}

	count, err := h.notifService.GetUnreadCount(c.Request.Context(), tOID)
	if err != nil {
		response.BadRequest(c, "COUNT_FAILED", err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"unreadCount": count,
	})
}

// MarkAsRead marks a specific notification as read.
func (h *NotificationHandler) MarkAsRead(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, err := bson.ObjectIDFromHex(tenantID)
	if err != nil {
		response.BadRequest(c, "INVALID_TENANT", "invalid tenant ID")
		return
	}

	id := c.Param("id")
	if id == "" {
		response.BadRequest(c, "INVALID_ID", "notification ID required")
		return
	}

	if err := h.notifService.MarkAsRead(c.Request.Context(), tOID, id); err != nil {
		response.BadRequest(c, "MARK_READ_FAILED", err.Error())
		return
	}

	response.OK(c, gin.H{"id": id, "read": true})
}

// MarkAllAsRead marks all notifications as read for the tenant.
func (h *NotificationHandler) MarkAllAsRead(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, err := bson.ObjectIDFromHex(tenantID)
	if err != nil {
		response.BadRequest(c, "INVALID_TENANT", "invalid tenant ID")
		return
	}

	modified, err := h.notifService.MarkAllAsRead(c.Request.Context(), tOID)
	if err != nil {
		response.BadRequest(c, "MARK_ALL_FAILED", err.Error())
		return
	}

	response.OK(c, gin.H{"markedCount": modified})
}

// ClearRead deletes all notifications that are marked as read.
func (h *NotificationHandler) ClearRead(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, err := bson.ObjectIDFromHex(tenantID)
	if err != nil {
		response.BadRequest(c, "INVALID_TENANT", "invalid tenant ID")
		return
	}

	deleted, err := h.notifService.ClearRead(c.Request.Context(), tOID)
	if err != nil {
		response.BadRequest(c, "CLEAR_FAILED", err.Error())
		return
	}

	response.OK(c, gin.H{"deletedCount": deleted})
}

type CreateNotificationRequest struct {
	Category  domainnotification.Category `json:"category" binding:"required"`
	Title     string                      `json:"title" binding:"required"`
	Message   string                      `json:"message" binding:"required"`
	Priority  domainnotification.Priority `json:"priority"`
	ActionURL string                      `json:"actionUrl"`
	Metadata  map[string]interface{}      `json:"metadata"`
}

// Create allows authorized users or services to create a notification.
func (h *NotificationHandler) Create(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, err := bson.ObjectIDFromHex(tenantID)
	if err != nil {
		response.BadRequest(c, "INVALID_TENANT", "invalid tenant ID")
		return
	}

	var req CreateNotificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	notif, err := h.notifService.CreateNotification(c.Request.Context(), appnotification.CreateNotificationInput{
		TenantID:  tOID,
		Category:  req.Category,
		Title:     req.Title,
		Message:   req.Message,
		Priority:  req.Priority,
		ActionURL: req.ActionURL,
		Metadata:  req.Metadata,
	})
	if err != nil {
		response.BadRequest(c, "CREATE_FAILED", err.Error())
		return
	}

	response.Created(c, notif)
}

// Stream provides a real-time Server-Sent Events (SSE) stream of notifications.
func (h *NotificationHandler) Stream(c *gin.Context) {
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

	notify := c.Request.Context().Done()
	c.Stream(func(w io.Writer) bool {
		select {
		case <-notify:
			return false
		case msg, ok := <-messageChan:
			if !ok {
				return false
			}
			c.SSEvent("notification", string(msg))
			c.Writer.Flush()
			return true
		}
	})
}
