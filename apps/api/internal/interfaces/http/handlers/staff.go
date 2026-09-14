package handlers

import (
	staffapp "github.com/dineflow/api/internal/application/staff"
	domainuser "github.com/dineflow/api/internal/domain/user"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// StaffHandler contains HTTP handlers for staff management endpoints.
type StaffHandler struct {
	staffService *staffapp.Service
}

// NewStaffHandler creates a new StaffHandler.
func NewStaffHandler(staffService *staffapp.Service) *StaffHandler {
	return &StaffHandler{staffService: staffService}
}

// List godoc
// GET /api/v1/staff
func (h *StaffHandler) List(c *gin.Context) {
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

	users, err := h.staffService.ListStaff(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, users)
}

// Invite godoc
// POST /api/v1/staff/invite
func (h *StaffHandler) Invite(c *gin.Context) {
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

	var input staffapp.InviteStaffInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	newUser, err := h.staffService.InviteStaff(c.Request.Context(), tOID, input)
	if err != nil {
		response.BadRequest(c, "INVITE_FAILED", err.Error())
		return
	}

	response.Created(c, newUser)
}

// Get godoc
// GET /api/v1/staff/:userId
func (h *StaffHandler) Get(c *gin.Context) {
	response.OK(c, gin.H{"userId": c.Param("userId")})
}

type UpdateStaffRequest struct {
	Role   domainuser.Role   `json:"role"`
	Status domainuser.Status `json:"status"`
}

// Update godoc
// PATCH /api/v1/staff/:userId
func (h *StaffHandler) Update(c *gin.Context) {
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

	userID := c.Param("userId")
	uOID, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		response.BadRequest(c, "INVALID_USER_ID", "invalid user ID")
		return
	}

	var req UpdateStaffRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	updated, err := h.staffService.UpdateStaff(c.Request.Context(), tOID, uOID, req.Role, req.Status)
	if err != nil {
		response.BadRequest(c, "UPDATE_FAILED", err.Error())
		return
	}

	response.OK(c, updated)
}

// Delete godoc
// DELETE /api/v1/staff/:userId
func (h *StaffHandler) Delete(c *gin.Context) {
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

	userID := c.Param("userId")
	uOID, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		response.BadRequest(c, "INVALID_USER_ID", "invalid user ID")
		return
	}

	if err := h.staffService.DeleteStaff(c.Request.Context(), tOID, uOID); err != nil {
		response.BadRequest(c, "DELETE_FAILED", err.Error())
		return
	}

	response.OK(c, gin.H{"deleted": true})
}
