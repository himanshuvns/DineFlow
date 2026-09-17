package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	platformapp "github.com/dineflow/api/internal/application/platform"
	domainplat "github.com/dineflow/api/internal/domain/platform"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
)

type PlatformHandler struct {
	svc *platformapp.Service
}

func NewPlatformHandler(svc *platformapp.Service) *PlatformHandler {
	return &PlatformHandler{svc: svc}
}

func (h *PlatformHandler) extractActor(c *gin.Context) domainplat.AuditActor {
	role := c.GetString("role")
	userID := c.GetString("userID")
	email := c.GetString("email")
	if email == "" {
		email = "superadmin@dineflow.io"
	}
	name := "Platform Administrator"
	if role == string(domainplat.RoleSuperAdmin) {
		name = "Platform Super Admin"
	} else if role == string(domainplat.RoleFinanceAdmin) {
		name = "Platform Finance Admin"
	} else if role == string(domainplat.RoleSupportAgent) {
		name = "Platform Support Agent"
	}

	return domainplat.AuditActor{
		ID:    userID,
		Name:  name,
		Email: email,
		Role:  role,
	}
}

// ─── Dashboard Metrics ────────────────────────────────────────────────────────

func (h *PlatformHandler) GetDashboardMetrics(c *gin.Context) {
	metrics, err := h.svc.GetDashboardMetrics(c.Request.Context())
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, metrics)
}

// ─── Clients / Tenants Directory ──────────────────────────────────────────────

func (h *PlatformHandler) ListTenants(c *gin.Context) {
	q := c.Query("q")
	status := c.Query("status")
	plan := c.Query("plan")
	bizType := c.Query("type")
	sortBy := c.DefaultQuery("sort_by", "createdAt")
	order := c.DefaultQuery("order", "desc")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	items, total, err := h.svc.ListTenants(c.Request.Context(), q, status, plan, bizType, sortBy, order, page, limit)
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

func (h *PlatformHandler) GetTenant360(c *gin.Context) {
	id := c.Param("id")
	profile, err := h.svc.GetTenant360(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "Tenant workspace")
		return
	}
	response.OK(c, profile)
}

func (h *PlatformHandler) UpdateTenant(c *gin.Context) {
	id := c.Param("id")
	var req map[string]interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_BODY", "Malformed update payload.")
		return
	}

	actor := h.extractActor(c)
	if err := h.svc.UpdateTenant(c.Request.Context(), id, req, actor, c.ClientIP()); err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, gin.H{"message": "Client profile updated successfully."})
}

func (h *PlatformHandler) SuspendTenant(c *gin.Context) {
	id := c.Param("id")
	actor := h.extractActor(c)
	if err := h.svc.SuspendTenant(c.Request.Context(), id, actor, c.ClientIP()); err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, gin.H{"message": "Client suspended successfully."})
}

func (h *PlatformHandler) ActivateTenant(c *gin.Context) {
	id := c.Param("id")
	actor := h.extractActor(c)
	if err := h.svc.ActivateTenant(c.Request.Context(), id, actor, c.ClientIP()); err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, gin.H{"message": "Client activated successfully."})
}

func (h *PlatformHandler) SoftDeleteTenant(c *gin.Context) {
	id := c.Param("id")
	actor := h.extractActor(c)
	if err := h.svc.SoftDeleteTenant(c.Request.Context(), id, actor, c.ClientIP()); err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, gin.H{"message": "Client workspace archived."})
}

func (h *PlatformHandler) ExtendTrial(c *gin.Context) {
	id := c.Param("id")
	var body struct {
		Days int `json:"days"`
	}
	_ = c.ShouldBindJSON(&body)
	if body.Days <= 0 {
		body.Days = 14
	}

	actor := h.extractActor(c)
	if err := h.svc.ExtendTrial(c.Request.Context(), id, body.Days, actor, c.ClientIP()); err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, gin.H{"message": fmt.Sprintf("Trial extended by %d days.", body.Days)})
}

func (h *PlatformHandler) ChangePlan(c *gin.Context) {
	id := c.Param("id")
	var body struct {
		Plan  string `json:"plan" binding:"required"`
		Cycle string `json:"cycle"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.BadRequest(c, "INVALID_PLAN", "Plan tier is required.")
		return
	}

	actor := h.extractActor(c)
	if err := h.svc.ChangeTenantPlan(c.Request.Context(), id, domainplat.PlanTier(body.Plan), body.Cycle, actor, c.ClientIP()); err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, gin.H{"message": "Client plan updated successfully."})
}

func (h *PlatformHandler) BulkAction(c *gin.Context) {
	var body struct {
		Action    string                 `json:"action" binding:"required"`
		TenantIDs []string               `json:"tenantIds" binding:"required"`
		Payload   map[string]interface{} `json:"payload"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.BadRequest(c, "INVALID_BULK_REQUEST", "Action and tenantIds are required.")
		return
	}

	actor := h.extractActor(c)
	count, err := h.svc.BulkAction(c.Request.Context(), body.Action, body.TenantIDs, body.Payload, actor, c.ClientIP())
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, gin.H{"updatedCount": count, "message": fmt.Sprintf("Applied %s to %d clients.", body.Action, count)})
}

// ─── Revenue & Invoices ───────────────────────────────────────────────────────

func (h *PlatformHandler) GetRevenueOverview(c *gin.Context) {
	overview, err := h.svc.GetRevenueOverview(c.Request.Context())
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, overview)
}

func (h *PlatformHandler) ListInvoices(c *gin.Context) {
	q := c.Query("q")
	status := c.Query("status")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	invs, total, err := h.svc.ListInvoices(c.Request.Context(), q, status, page, limit)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OKWithMeta(c, invs, &response.Meta{
		Page:    page,
		Limit:   limit,
		Total:   total,
		HasMore: int64(page*limit) < total,
	})
}

// ─── Feature Flags ────────────────────────────────────────────────────────────

func (h *PlatformHandler) ListFeatureFlags(c *gin.Context) {
	defs, overrides, err := h.svc.ListFeatureFlags(c.Request.Context())
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, gin.H{"flags": defs, "overrides": overrides})
}

func (h *PlatformHandler) ToggleGlobalFlag(c *gin.Context) {
	key := c.Param("key")
	var body struct {
		Enabled bool `json:"enabled"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.BadRequest(c, "INVALID_STATE", "Enabled state boolean required.")
		return
	}

	actor := h.extractActor(c)
	if err := h.svc.ToggleGlobalFlag(c.Request.Context(), key, body.Enabled, actor, c.ClientIP()); err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, gin.H{"message": fmt.Sprintf("Flag %s platform default set to %v.", key, body.Enabled)})
}

func (h *PlatformHandler) SetTenantFeatureOverride(c *gin.Context) {
	tenantID := c.Param("id")
	key := c.Param("key")
	var body struct {
		Enabled bool `json:"enabled"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.BadRequest(c, "INVALID_STATE", "Enabled state boolean required.")
		return
	}

	actor := h.extractActor(c)
	if err := h.svc.SetTenantFeatureOverride(c.Request.Context(), tenantID, key, body.Enabled, actor, c.ClientIP()); err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, gin.H{"message": fmt.Sprintf("Feature %s override set to %v for workspace.", key, body.Enabled)})
}

// ─── Support Tickets ──────────────────────────────────────────────────────────

func (h *PlatformHandler) ListSupportTickets(c *gin.Context) {
	q := c.Query("q")
	status := c.Query("status")
	priority := c.Query("priority")
	category := c.Query("category")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	tickets, total, err := h.svc.ListSupportTickets(c.Request.Context(), q, status, priority, category, page, limit)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OKWithMeta(c, tickets, &response.Meta{
		Page:    page,
		Limit:   limit,
		Total:   total,
		HasMore: int64(page*limit) < total,
	})
}

func (h *PlatformHandler) CreateSupportTicket(c *gin.Context) {
	var body struct {
		TenantID      string `json:"tenantId" binding:"required"`
		Subject       string `json:"subject" binding:"required"`
		Description   string `json:"description" binding:"required"`
		Priority      string `json:"priority"`
		Category      string `json:"category"`
		AssignedAgent string `json:"assignedAgent"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.BadRequest(c, "INVALID_TICKET", "TenantID, Subject, and Description are required.")
		return
	}

	if body.Priority == "" {
		body.Priority = "medium"
	}
	if body.Category == "" {
		body.Category = "technical"
	}
	if body.AssignedAgent == "" {
		body.AssignedAgent = "Platform Support"
	}

	actor := h.extractActor(c)
	ticket, err := h.svc.CreateSupportTicket(
		c.Request.Context(),
		body.TenantID,
		body.Subject,
		body.Description,
		body.Priority,
		body.Category,
		body.AssignedAgent,
		actor,
		c.ClientIP(),
	)
	if err != nil {
		response.InternalError(c)
		return
	}
	response.Created(c, ticket)
}

func (h *PlatformHandler) UpdateTicketStatus(c *gin.Context) {
	id := c.Param("id")
	var body struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.BadRequest(c, "INVALID_STATUS", "Status field is required.")
		return
	}

	actor := h.extractActor(c)
	if err := h.svc.UpdateTicketStatus(c.Request.Context(), id, body.Status, actor, c.ClientIP()); err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, gin.H{"message": "Ticket status updated."})
}

func (h *PlatformHandler) AddTicketNote(c *gin.Context) {
	id := c.Param("id")
	var body struct {
		Note string `json:"note" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.BadRequest(c, "INVALID_NOTE", "Note text is required.")
		return
	}

	actor := h.extractActor(c)
	if err := h.svc.AddTicketNote(c.Request.Context(), id, body.Note, actor, c.ClientIP()); err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, gin.H{"message": "Internal note appended to ticket."})
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

func (h *PlatformHandler) ListAuditLogs(c *gin.Context) {
	q := c.Query("q")
	category := c.Query("category")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	logs, total, err := h.svc.ListAuditLogs(c.Request.Context(), q, category, page, limit)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OKWithMeta(c, logs, &response.Meta{
		Page:    page,
		Limit:   limit,
		Total:   total,
		HasMore: int64(page*limit) < total,
	})
}

func (h *PlatformHandler) CreateAuditLog(c *gin.Context) {
	var body struct {
		Action     string `json:"action" binding:"required"`
		Category   string `json:"category" binding:"required"`
		TargetID   string `json:"targetId"`
		TargetName string `json:"targetName"`
		Details    string `json:"details" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.BadRequest(c, "INVALID_AUDIT_LOG", "Action, Category, and Details are required.")
		return
	}

	actor := h.extractActor(c)
	entry := domainplat.AuditLogRecord{
		Timestamp:  time.Now().UTC(),
		Actor:      actor,
		Action:     body.Action,
		Category:   body.Category,
		TargetID:   body.TargetID,
		TargetName: body.TargetName,
		IPAddress:  c.ClientIP(),
		Details:    body.Details,
	}

	if err := h.svc.RecordAuditLog(c.Request.Context(), entry); err != nil {
		response.InternalError(c)
		return
	}
	response.Created(c, entry)
}

// ─── System Health ────────────────────────────────────────────────────────────

func (h *PlatformHandler) GetSystemHealth(c *gin.Context) {
	health, err := h.svc.GetSystemHealth(c.Request.Context())
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, health)
}

// ─── Platform Operations ──────────────────────────────────────────────────────

func (h *PlatformHandler) GetOperationsSettings(c *gin.Context) {
	settings, err := h.svc.GetOperationsSettings(c.Request.Context())
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, settings)
}

func (h *PlatformHandler) SetMaintenanceMode(c *gin.Context) {
	var body struct {
		Enabled bool `json:"enabled"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", "Enabled boolean is required.")
		return
	}

	actor := h.extractActor(c)
	if err := h.svc.SetMaintenanceMode(c.Request.Context(), body.Enabled, actor, c.ClientIP()); err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, gin.H{"message": fmt.Sprintf("Maintenance mode set to %v.", body.Enabled)})
}

func (h *PlatformHandler) SetGlobalAnnouncement(c *gin.Context) {
	var body domainplat.AnnouncementInfo
	if err := c.ShouldBindJSON(&body); err != nil {
		response.BadRequest(c, "INVALID_ANNOUNCEMENT", "Announcement payload is required.")
		return
	}

	actor := h.extractActor(c)
	if err := h.svc.SetGlobalAnnouncement(c.Request.Context(), body, actor, c.ClientIP()); err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, gin.H{"message": "Global announcement broadcast updated."})
}

func (h *PlatformHandler) FlushCache(c *gin.Context) {
	actor := h.extractActor(c)
	if err := h.svc.FlushCache(c.Request.Context(), actor, c.ClientIP()); err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, gin.H{"message": "Cache flushed successfully."})
}

// ─── Platform Notifications ───────────────────────────────────────────────────

func (h *PlatformHandler) ListNotifications(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	notifs, total, unread, err := h.svc.ListNotifications(c.Request.Context(), page, limit)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{
		"notifications": notifs,
		"unreadCount":   unread,
		"total":         total,
	})
}

func (h *PlatformHandler) MarkNotificationRead(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.MarkNotificationRead(c.Request.Context(), id); err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, gin.H{"message": "Notification marked as read."})
}

func (h *PlatformHandler) MarkAllNotificationsRead(c *gin.Context) {
	if err := h.svc.MarkAllNotificationsRead(c.Request.Context()); err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, gin.H{"message": "All notifications marked as read."})
}

// ─── CSV Exports ──────────────────────────────────────────────────────────────

func (h *PlatformHandler) ExportCSV(c *gin.Context) {
	entity := c.Param("entity")
	data, filename, err := h.svc.ExportCSV(c.Request.Context(), entity)
	if err != nil {
		response.BadRequest(c, "EXPORT_FAILED", err.Error())
		return
	}

	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	c.Header("Content-Type", "text/csv")
	c.Data(http.StatusOK, "text/csv", data)
}

// ─── Impersonation Flow ───────────────────────────────────────────────────────

func (h *PlatformHandler) ImpersonateTenant(c *gin.Context) {
	tenantID := c.Param("id")
	actor := h.extractActor(c)

	profile, err := h.svc.GetTenant360(c.Request.Context(), tenantID)
	if err != nil {
		response.NotFound(c, "Tenant workspace")
		return
	}

	h.svc.RecordAuditLog(c.Request.Context(), domainplat.AuditLogRecord{
		Timestamp:  time.Now().UTC(),
		Actor:      actor,
		Action:     "client.impersonation_started",
		Category:   "security",
		TargetID:   tenantID,
		TargetName: profile.Name,
		IPAddress:  c.ClientIP(),
		Details:    fmt.Sprintf("Started audited impersonation for workspace '%s'.", profile.Name),
	})

	response.OK(c, gin.H{
		"tenant":  profile,
		"message": fmt.Sprintf("Entered impersonation for %s.", profile.Name),
	})
}

func (h *PlatformHandler) ExitImpersonation(c *gin.Context) {
	actor := h.extractActor(c)
	tenantID := c.Query("tenantId")

	h.svc.RecordAuditLog(c.Request.Context(), domainplat.AuditLogRecord{
		Timestamp: time.Now().UTC(),
		Actor:     actor,
		Action:    "client.impersonation_ended",
		Category:  "security",
		TargetID:  tenantID,
		IPAddress: c.ClientIP(),
		Details:   "Ended impersonation session; restored administrator permissions.",
	})

	response.OK(c, gin.H{"message": "Impersonation session concluded."})
}

// Logout godoc
// POST /api/v1/platform/auth/logout
// Securely terminates the platform super admin session, revokes tokens, and records audit trail.
func (h *PlatformHandler) Logout(c *gin.Context) {
	tokenID := middleware.GetTokenID(c)
	actor := h.extractActor(c)

	_ = h.svc.Logout(c.Request.Context(), tokenID, actor, c.ClientIP())

	// Clear HttpOnly refresh token cookie
	c.SetCookie(
		"refresh_token",
		"",
		-1,
		"/",
		"",
		false,
		true,
	)

	response.OK(c, gin.H{"message": "Super Admin signed out successfully."})
}
