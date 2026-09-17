package handlers

import (
	"net/http"
	"strconv"
	"time"

	staffapp "github.com/dineflow/api/internal/application/staff"
	domainuser "github.com/dineflow/api/internal/domain/user"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// StaffHandler contains HTTP handlers for staff & workforce management endpoints.
type StaffHandler struct {
	staffService *staffapp.Service
}

// NewStaffHandler creates a new StaffHandler.
func NewStaffHandler(staffService *staffapp.Service) *StaffHandler {
	return &StaffHandler{staffService: staffService}
}

// ── Staff Member Management ──────────────────────────────────────────────────

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

// UpdateProfile godoc
// PUT /api/v1/staff/profiles/:userId
func (h *StaffHandler) UpdateProfile(c *gin.Context) {
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

	var input staffapp.UpdateEmployeeProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	updated, err := h.staffService.UpdateEmployeeProfile(c.Request.Context(), tOID, uOID, input)
	if err != nil {
		response.BadRequest(c, "PROFILE_UPDATE_FAILED", err.Error())
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

// ── Geofence Configuration ──────────────────────────────────────────────────

// GetGeofence godoc
// GET /api/v1/staff/geofence
func (h *StaffHandler) GetGeofence(c *gin.Context) {
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

	cfg, err := h.staffService.GetGeofence(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, cfg)
}

// UpdateGeofence godoc
// PUT /api/v1/staff/geofence
func (h *StaffHandler) UpdateGeofence(c *gin.Context) {
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

	var input domainuser.GeofenceConfig
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	updated, err := h.staffService.UpdateGeofence(c.Request.Context(), tOID, input)
	if err != nil {
		response.BadRequest(c, "UPDATE_GEOFENCE_FAILED", err.Error())
		return
	}

	response.OK(c, updated)
}

// ── Shift Management ────────────────────────────────────────────────────────

// ListShifts godoc
// GET /api/v1/staff/shifts
func (h *StaffHandler) ListShifts(c *gin.Context) {
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

	shifts, err := h.staffService.ListShifts(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, shifts)
}

// CreateShift godoc
// POST /api/v1/staff/shifts
func (h *StaffHandler) CreateShift(c *gin.Context) {
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

	var shift domainuser.Shift
	if err := c.ShouldBindJSON(&shift); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	created, err := h.staffService.CreateShift(c.Request.Context(), tOID, shift)
	if err != nil {
		response.BadRequest(c, "CREATE_SHIFT_FAILED", err.Error())
		return
	}

	response.Created(c, created)
}

// ── Attendance Engine ───────────────────────────────────────────────────────

// ClockIn godoc
// POST /api/v1/staff/attendance/clock-in
func (h *StaffHandler) ClockIn(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)
	if tenantID == "" || userID == "" {
		response.Unauthorized(c, "auth context missing")
		return
	}
	tOID, err1 := bson.ObjectIDFromHex(tenantID)
	uOID, err2 := bson.ObjectIDFromHex(userID)
	if err1 != nil || err2 != nil {
		response.BadRequest(c, "INVALID_ID", "invalid tenant or user ID")
		return
	}

	var req staffapp.ClockInRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	record, err := h.staffService.ClockIn(c.Request.Context(), tOID, uOID, req.Latitude, req.Longitude)
	if err != nil {
		response.BadRequest(c, "CLOCK_IN_FAILED", err.Error())
		return
	}

	response.OK(c, record)
}

// ClockOut godoc
// POST /api/v1/staff/attendance/clock-out
func (h *StaffHandler) ClockOut(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)
	if tenantID == "" || userID == "" {
		response.Unauthorized(c, "auth context missing")
		return
	}
	tOID, err1 := bson.ObjectIDFromHex(tenantID)
	uOID, err2 := bson.ObjectIDFromHex(userID)
	if err1 != nil || err2 != nil {
		response.BadRequest(c, "INVALID_ID", "invalid tenant or user ID")
		return
	}

	var req staffapp.ClockOutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	record, err := h.staffService.ClockOut(c.Request.Context(), tOID, uOID, req.Latitude, req.Longitude)
	if err != nil {
		response.BadRequest(c, "CLOCK_OUT_FAILED", err.Error())
		return
	}

	response.OK(c, record)
}

// ToggleBreak godoc
// POST /api/v1/staff/attendance/break
func (h *StaffHandler) ToggleBreak(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)
	if tenantID == "" || userID == "" {
		response.Unauthorized(c, "auth context missing")
		return
	}
	tOID, err1 := bson.ObjectIDFromHex(tenantID)
	uOID, err2 := bson.ObjectIDFromHex(userID)
	if err1 != nil || err2 != nil {
		response.BadRequest(c, "INVALID_ID", "invalid tenant or user ID")
		return
	}

	record, err := h.staffService.ToggleBreak(c.Request.Context(), tOID, uOID)
	if err != nil {
		response.BadRequest(c, "BREAK_TOGGLE_FAILED", err.Error())
		return
	}

	response.OK(c, record)
}

// GetTodayAttendance godoc
// GET /api/v1/staff/attendance/today
func (h *StaffHandler) GetTodayAttendance(c *gin.Context) {
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

	list, err := h.staffService.GetTodayAttendance(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, list)
}

// GetAttendanceHistory godoc
// GET /api/v1/staff/attendance/history
func (h *StaffHandler) GetAttendanceHistory(c *gin.Context) {
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

	var uOID *bson.ObjectID
	userParam := c.Query("userId")
	if userParam != "" {
		parsed, err := bson.ObjectIDFromHex(userParam)
		if err == nil {
			uOID = &parsed
		}
	}

	startDate := c.Query("startDate")
	endDate := c.Query("endDate")

	list, err := h.staffService.GetAttendanceHistory(c.Request.Context(), tOID, uOID, startDate, endDate)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, list)
}

// ── Leave Management ────────────────────────────────────────────────────────

// ApplyLeave godoc
// POST /api/v1/staff/leaves
func (h *StaffHandler) ApplyLeave(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)
	if tenantID == "" || userID == "" {
		response.Unauthorized(c, "auth context missing")
		return
	}
	tOID, err1 := bson.ObjectIDFromHex(tenantID)
	uOID, err2 := bson.ObjectIDFromHex(userID)
	if err1 != nil || err2 != nil {
		response.BadRequest(c, "INVALID_ID", "invalid tenant or user ID")
		return
	}

	var req domainuser.LeaveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	created, err := h.staffService.ApplyLeave(c.Request.Context(), tOID, uOID, req)
	if err != nil {
		response.BadRequest(c, "APPLY_LEAVE_FAILED", err.Error())
		return
	}

	response.Created(c, created)
}

// ListLeaves godoc
// GET /api/v1/staff/leaves
func (h *StaffHandler) ListLeaves(c *gin.Context) {
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

	var uOID *bson.ObjectID
	userParam := c.Query("userId")
	if userParam != "" {
		parsed, err := bson.ObjectIDFromHex(userParam)
		if err == nil {
			uOID = &parsed
		}
	}

	list, err := h.staffService.ListLeaves(c.Request.Context(), tOID, uOID)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, list)
}

type ApproveRejectRequest struct {
	ApproverName string `json:"approverName"`
	Reason       string `json:"reason"`
}

// ApproveLeave godoc
// POST /api/v1/staff/leaves/:id/approve
func (h *StaffHandler) ApproveLeave(c *gin.Context) {
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

	leaveID := c.Param("id")
	lOID, err := bson.ObjectIDFromHex(leaveID)
	if err != nil {
		response.BadRequest(c, "INVALID_LEAVE_ID", "invalid leave ID")
		return
	}

	var req ApproveRejectRequest
	_ = c.ShouldBindJSON(&req)
	if req.ApproverName == "" {
		req.ApproverName = "Management"
	}

	updated, err := h.staffService.ApproveLeave(c.Request.Context(), tOID, lOID, req.ApproverName)
	if err != nil {
		response.BadRequest(c, "APPROVE_FAILED", err.Error())
		return
	}

	response.OK(c, updated)
}

// RejectLeave godoc
// POST /api/v1/staff/leaves/:id/reject
func (h *StaffHandler) RejectLeave(c *gin.Context) {
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

	leaveID := c.Param("id")
	lOID, err := bson.ObjectIDFromHex(leaveID)
	if err != nil {
		response.BadRequest(c, "INVALID_LEAVE_ID", "invalid leave ID")
		return
	}

	var req ApproveRejectRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.Reason == "" {
		response.BadRequest(c, "REASON_REQUIRED", "rejection reason is required")
		return
	}
	if req.ApproverName == "" {
		req.ApproverName = "Management"
	}

	updated, err := h.staffService.RejectLeave(c.Request.Context(), tOID, lOID, req.ApproverName, req.Reason)
	if err != nil {
		response.BadRequest(c, "REJECT_FAILED", err.Error())
		return
	}

	response.OK(c, updated)
}

// GetLeaveBalances godoc
// GET /api/v1/staff/leaves/balance
func (h *StaffHandler) GetLeaveBalances(c *gin.Context) {
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

	targetUserID := c.Query("userId")
	if targetUserID == "" {
		targetUserID = middleware.GetUserID(c)
	}
	uOID, err := bson.ObjectIDFromHex(targetUserID)
	if err != nil {
		response.BadRequest(c, "INVALID_USER_ID", "invalid user ID")
		return
	}

	bal, err := h.staffService.GetLeaveBalances(c.Request.Context(), tOID, uOID)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, bal)
}

// ── Payroll & Payslips ──────────────────────────────────────────────────────

type RunPayrollRequest struct {
	Month string `json:"month"` // "2026-09"
}

// RunPayroll godoc
// POST /api/v1/staff/payroll/run
func (h *StaffHandler) RunPayroll(c *gin.Context) {
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

	var req RunPayrollRequest
	_ = c.ShouldBindJSON(&req)
	if req.Month == "" {
		req.Month = time.Now().UTC().Format("2006-01")
	}

	records, err := h.staffService.RunPayroll(c.Request.Context(), tOID, req.Month)
	if err != nil {
		response.BadRequest(c, "PAYROLL_RUN_FAILED", err.Error())
		return
	}

	response.OK(c, records)
}

// ListPayslips godoc
// GET /api/v1/staff/payroll
func (h *StaffHandler) ListPayslips(c *gin.Context) {
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

	month := c.Query("month")
	records, err := h.staffService.ListPayslips(c.Request.Context(), tOID, month)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, records)
}

// GetPayslip godoc
// GET /api/v1/staff/payslips/:id
func (h *StaffHandler) GetPayslip(c *gin.Context) {
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

	pID := c.Param("id")
	pOID, err := bson.ObjectIDFromHex(pID)
	if err != nil {
		response.BadRequest(c, "INVALID_PAYSLIP_ID", "invalid payslip ID")
		return
	}

	rec, err := h.staffService.GetPayslip(c.Request.Context(), tOID, pOID)
	if err != nil {
		response.NotFound(c, "payslip not found")
		return
	}

	response.OK(c, rec)
}

// GetPayslipHTML godoc
// GET /api/v1/staff/payslips/:id/view
func (h *StaffHandler) GetPayslipHTML(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		tenantID = c.Query("tenantId")
	}
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, err := bson.ObjectIDFromHex(tenantID)
	if err != nil {
		response.BadRequest(c, "INVALID_TENANT_ID", "invalid tenant ID")
		return
	}

	pID := c.Param("id")
	pOID, err := bson.ObjectIDFromHex(pID)
	if err != nil {
		response.BadRequest(c, "INVALID_PAYSLIP_ID", "invalid payslip ID")
		return
	}

	htmlContent, err := h.staffService.GeneratePayslipHTML(c.Request.Context(), tOID, pOID)
	if err != nil {
		response.NotFound(c, "payslip not found")
		return
	}

	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(htmlContent))
}

// ── Holiday Management ──────────────────────────────────────────────────────

// ListHolidays godoc
// GET /api/v1/staff/holidays
func (h *StaffHandler) ListHolidays(c *gin.Context) {
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

	year := time.Now().UTC().Year()
	if yrStr := c.Query("year"); yrStr != "" {
		if parsed, err := strconv.Atoi(yrStr); err == nil {
			year = parsed
		}
	}

	list, err := h.staffService.ListHolidays(c.Request.Context(), tOID, year)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, list)
}

// CreateHoliday godoc
// POST /api/v1/staff/holidays
func (h *StaffHandler) CreateHoliday(c *gin.Context) {
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

	var holiday domainuser.Holiday
	if err := c.ShouldBindJSON(&holiday); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	created, err := h.staffService.CreateHoliday(c.Request.Context(), tOID, holiday)
	if err != nil {
		response.BadRequest(c, "CREATE_HOLIDAY_FAILED", err.Error())
		return
	}

	response.Created(c, created)
}
