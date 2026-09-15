package handlers

import (
	"encoding/base64"
	"fmt"
	"io"
	"path/filepath"
	"strings"
	"time"

	roomapp "github.com/dineflow/api/internal/application/room"
	domainroom "github.com/dineflow/api/internal/domain/room"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type RoomHandler struct {
	roomService *roomapp.Service
}

func NewRoomHandler(roomService *roomapp.Service) *RoomHandler {
	return &RoomHandler{roomService: roomService}
}

// List returns rooms for the current tenant.
func (h *RoomHandler) List(c *gin.Context) {
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

	floor := c.Query("floor")
	wing := c.Query("wing")
	status := domainroom.RoomStatus(c.Query("status"))
	query := c.Query("q")

	rooms, err := h.roomService.ListRooms(c.Request.Context(), tOID, floor, wing, status, query)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, rooms)
}

// Get returns room details.
func (h *RoomHandler) Get(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	id := c.Param("id")
	if id == "" {
		response.BadRequest(c, "INVALID_ID", "room ID is required")
		return
	}

	room, err := h.roomService.GetRoomByID(c.Request.Context(), tOID, id)
	if err != nil {
		response.NotFound(c, "room not found")
		return
	}

	response.OK(c, room)
}

type CreateRoomRequest struct {
	RoomNumber   string   `json:"roomNumber" binding:"required"`
	Name         string   `json:"name"`
	RoomType     string   `json:"roomType"`
	Floor        string   `json:"floor"`
	Wing         string   `json:"wing"`
	Capacity     int      `json:"capacity"`
	FolioEnabled bool     `json:"folioEnabled"`
	Amenities    []string `json:"amenities"`
	Images       []string `json:"images"`
}

// Create adds a new room.
func (h *RoomHandler) Create(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	var req CreateRoomRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	capacity := req.Capacity
	if capacity <= 0 {
		capacity = 2
	}
	name := req.Name
	if name == "" {
		name = "Room " + req.RoomNumber
	}

	r := &domainroom.Room{
		TenantID:     tOID,
		RoomNumber:   req.RoomNumber,
		Name:         name,
		RoomType:     req.RoomType,
		Floor:        req.Floor,
		Wing:         req.Wing,
		Capacity:     capacity,
		Status:       domainroom.StatusVacant,
		FolioEnabled: req.FolioEnabled,
		Amenities:    req.Amenities,
		Images:       req.Images,
	}

	if err := h.roomService.CreateRoom(c.Request.Context(), r); err != nil {
		response.BadRequest(c, "CREATION_FAILED", err.Error())
		return
	}

	response.Created(c, r)
}

// Update updates room details.
func (h *RoomHandler) Update(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	id := c.Param("id")
	var input roomapp.UpdateRoomInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	updated, err := h.roomService.UpdateRoom(c.Request.Context(), tOID, id, input)
	if err != nil {
		response.BadRequest(c, "UPDATE_FAILED", err.Error())
		return
	}

	response.OK(c, updated)
}

// Delete removes a room.
func (h *RoomHandler) Delete(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	id := c.Param("id")
	if err := h.roomService.DeleteRoom(c.Request.Context(), tOID, id); err != nil {
		response.BadRequest(c, "DELETE_FAILED", err.Error())
		return
	}

	response.OK(c, gin.H{"deleted": true})
}

type BulkRoomsRequest struct {
	StartRoom int      `json:"startRoom" binding:"required"`
	EndRoom   int      `json:"endRoom" binding:"required"`
	Floor     string   `json:"floor" binding:"required"`
	Wing      string   `json:"wing" binding:"required"`
	RoomType  string   `json:"type"`
	Amenities []string `json:"amenities"`
}

// BulkCreate generates contiguous rooms for a floor.
func (h *RoomHandler) BulkCreate(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	var req BulkRoomsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	created, err := h.roomService.BulkCreateRooms(c.Request.Context(), tOID, req.StartRoom, req.EndRoom, req.Floor, req.Wing, req.RoomType, req.Amenities)
	if err != nil {
		response.BadRequest(c, "BULK_FAILED", err.Error())
		return
	}

	response.Created(c, gin.H{"count": len(created), "rooms": created})
}

type ToggleRoomDNDRequest struct {
	DoNotDisturb bool `json:"doNotDisturb"`
}

// ToggleDND updates Do Not Disturb flag.
func (h *RoomHandler) ToggleDND(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	id := c.Param("id")
	var req ToggleRoomDNDRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	if err := h.roomService.ToggleDND(c.Request.Context(), tOID, id, req.DoNotDisturb); err != nil {
		response.BadRequest(c, "UPDATE_FAILED", err.Error())
		return
	}

	response.OK(c, gin.H{"id": id, "doNotDisturb": req.DoNotDisturb})
}

type UpdateRoomStatusRequest struct {
	Status domainroom.RoomStatus `json:"status" binding:"required"`
}

// UpdateStatus updates room status.
func (h *RoomHandler) UpdateStatus(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	id := c.Param("id")
	var req UpdateRoomStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	if err := h.roomService.UpdateStatus(c.Request.Context(), tOID, id, req.Status); err != nil {
		response.BadRequest(c, "UPDATE_FAILED", err.Error())
		return
	}

	response.OK(c, gin.H{"id": id, "status": req.Status})
}

// CheckIn checks in a guest to a room.
func (h *RoomHandler) CheckIn(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	id := c.Param("id")
	var input roomapp.CheckInInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	guest, updatedRoom, err := h.roomService.CheckInGuest(c.Request.Context(), tOID, id, input)
	if err != nil {
		response.BadRequest(c, "CHECKIN_FAILED", err.Error())
		return
	}

	response.Created(c, gin.H{"guest": guest, "room": updatedRoom})
}

// CheckOut checks out the active guest, generates stay summary, and sends room to housekeeping.
func (h *RoomHandler) CheckOut(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	id := c.Param("id")
	updatedRoom, task, staySummary, err := h.roomService.CheckOutGuest(c.Request.Context(), tOID, id)
	if err != nil {
		response.BadRequest(c, "CHECKOUT_FAILED", err.Error())
		return
	}

	response.OK(c, gin.H{"room": updatedRoom, "task": task, "staySummary": staySummary})
}

// GetStaySummary returns the stay summary and itemized room service bill for a room.
func (h *RoomHandler) GetStaySummary(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	id := c.Param("id")
	summary, err := h.roomService.GetStaySummary(c.Request.Context(), tOID, id)
	if err != nil {
		response.BadRequest(c, "SUMMARY_FAILED", err.Error())
		return
	}

	response.OK(c, summary)
}

// UploadIDProof handles guest ID proof uploads (Aadhaar, Passport, DL, Voter ID, PAN).
func (h *RoomHandler) UploadIDProof(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		response.BadRequest(c, "INVALID_FILE", "file is required")
		return
	}

	// 10MB limit
	if file.Size > 10*1024*1024 {
		response.BadRequest(c, "FILE_TOO_LARGE", "file exceeds 10MB maximum limit")
		return
	}

	// Validate extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExts := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".pdf": true}
	if !allowedExts[ext] {
		response.BadRequest(c, "UNSUPPORTED_FORMAT", "supported formats: JPG, PNG, PDF, WEBP")
		return
	}

	// Open and read file bytes
	f, err := file.Open()
	if err != nil {
		response.InternalError(c)
		return
	}
	defer f.Close()

	data, err := io.ReadAll(f)
	if err != nil {
		response.InternalError(c)
		return
	}

	mimeType := "image/jpeg"
	switch ext {
	case ".png":
		mimeType = "image/png"
	case ".webp":
		mimeType = "image/webp"
	case ".pdf":
		mimeType = "application/pdf"
	}

	base64Data := base64.StdEncoding.EncodeToString(data)
	dataURL := fmt.Sprintf("data:%s;base64,%s", mimeType, base64Data)

	now := time.Now().UTC()
	response.Created(c, gin.H{
		"fileUrl":    dataURL,
		"fileName":   file.Filename,
		"fileSize":   file.Size,
		"uploadedAt": now,
	})
}

// GetOrders returns active and historical orders for a room.
func (h *RoomHandler) GetOrders(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	id := c.Param("id")
	roomNum := c.Query("roomNumber")
	orders, err := h.roomService.GetRoomOrders(c.Request.Context(), tOID, id, roomNum)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, orders)
}

// ListTasks returns housekeeping tasks.
func (h *RoomHandler) ListTasks(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	roomID := c.Param("id")
	if roomID == "" {
		roomID = c.Query("roomId")
	}
	status := domainroom.TaskStatus(c.Query("status"))

	tasks, err := h.roomService.ListHousekeepingTasks(c.Request.Context(), tOID, roomID, status)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, tasks)
}

type CreateTaskRequest struct {
	TaskType   domainroom.TaskType `json:"taskType"`
	Title      string              `json:"title" binding:"required"`
	Priority   string              `json:"priority"`
	AssignedTo string              `json:"assignedTo"`
	Notes      string              `json:"notes"`
}

// CreateTask creates a housekeeping task for a room.
func (h *RoomHandler) CreateTask(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	id := c.Param("id")
	room, err := h.roomService.GetRoomByID(c.Request.Context(), tOID, id)
	if err != nil {
		response.NotFound(c, "room not found")
		return
	}

	var req CreateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	task := &domainroom.HousekeepingTask{
		TenantID:   tOID,
		RoomID:     room.ID,
		RoomNumber: room.RoomNumber,
		TaskType:   req.TaskType,
		Title:      req.Title,
		Priority:   req.Priority,
		AssignedTo: req.AssignedTo,
		Status:     domainroom.TaskPending,
		Notes:      req.Notes,
	}

	if err := h.roomService.CreateHousekeepingTask(c.Request.Context(), task); err != nil {
		response.BadRequest(c, "TASK_CREATION_FAILED", err.Error())
		return
	}

	response.Created(c, task)
}

type UpdateTaskRequest struct {
	Status domainroom.TaskStatus `json:"status" binding:"required"`
	Notes  string                `json:"notes"`
}

// UpdateTask updates a housekeeping task status.
func (h *RoomHandler) UpdateTask(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	taskIDStr := c.Param("taskId")
	taskOID, err := bson.ObjectIDFromHex(taskIDStr)
	if err != nil {
		response.BadRequest(c, "INVALID_TASK_ID", "invalid task ID")
		return
	}

	var req UpdateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	updated, err := h.roomService.UpdateHousekeepingTask(c.Request.Context(), tOID, taskOID, req.Status, req.Notes)
	if err != nil {
		response.BadRequest(c, "TASK_UPDATE_FAILED", err.Error())
		return
	}

	response.OK(c, updated)
}

// GetStats returns hotel PMS overview metrics.
func (h *RoomHandler) GetStats(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	stats, err := h.roomService.GetHotelStats(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, stats)
}

// GetPublicRoom returns public room info for QR scanning.
func (h *RoomHandler) GetPublicRoom(c *gin.Context) {
	tenantSlug := c.Param("tenantSlug")
	roomNumber := c.Param("roomNumber")

	room, hotelName, err := h.roomService.GetPublicRoom(c.Request.Context(), tenantSlug, roomNumber)
	if err != nil {
		response.NotFound(c, "suite or room not found")
		return
	}

	response.OK(c, gin.H{
		"room":      room,
		"hotelName": hotelName,
	})
}

type PublicAmenityRequest struct {
	AmenityType string `json:"amenityType" binding:"required"` // "housekeeping", "ice_bucket", "towels", "concierge"
	Notes       string `json:"notes"`
}

// RequestPublicAmenity creates an in-room service or amenity request from mobile QR.
func (h *RoomHandler) RequestPublicAmenity(c *gin.Context) {
	tenantSlug := c.Param("tenantSlug")
	roomNumber := c.Param("roomNumber")

	room, _, err := h.roomService.GetPublicRoom(c.Request.Context(), tenantSlug, roomNumber)
	if err != nil {
		response.NotFound(c, "room not found")
		return
	}

	var req PublicAmenityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	titleMap := map[string]string{
		"housekeeping": "Guest Requested Housekeeping",
		"ice_bucket":   "Guest Requested Ice Bucket",
		"towels":       "Guest Requested Extra Fresh Towels",
		"concierge":    "Guest Requested Concierge Assistance",
	}
	title := titleMap[req.AmenityType]
	if title == "" {
		title = "Guest Suite Request: " + req.AmenityType
	}

	task := &domainroom.HousekeepingTask{
		TenantID:   room.TenantID,
		RoomID:     room.ID,
		RoomNumber: room.RoomNumber,
		TaskType:   domainroom.TaskAmenityRequest,
		Title:      title,
		Priority:   "high",
		Status:     domainroom.TaskPending,
		Notes:      req.Notes,
	}

	if err := h.roomService.CreateHousekeepingTask(c.Request.Context(), task); err != nil {
		response.BadRequest(c, "REQUEST_FAILED", err.Error())
		return
	}

	response.Created(c, gin.H{
		"success": true,
		"message": "Service steward alerted for " + room.Name,
		"task":    task,
	})
}
