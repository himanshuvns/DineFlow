package handlers

import (
	apptable "github.com/dineflow/api/internal/application/table"
	domaintable "github.com/dineflow/api/internal/domain/table"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type TableHandler struct {
	tableService *apptable.Service
}

func NewTableHandler(s *apptable.Service) *TableHandler {
	return &TableHandler{tableService: s}
}

func (h *TableHandler) List(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	tables, err := h.tableService.ListTables(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, tables)
}

func (h *TableHandler) ListRooms(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	floor := c.Query("floor")
	wing := c.Query("wing")

	rooms, err := h.tableService.ListRooms(c.Request.Context(), tOID, floor, wing)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, rooms)
}

type CreateTableRequest struct {
	Name         string                   `json:"name" binding:"required"`
	Zone         string                   `json:"zone"`
	Type         domaintable.LocationType `json:"type"`
	Floor        string                   `json:"floor"`
	Wing         string                   `json:"wing"`
	RoomNumber   string                   `json:"roomNumber"`
	Seats        int                      `json:"seats"`
	Capacity     int                      `json:"capacity"`
	FolioEnabled bool                     `json:"folioEnabled"`
	Status       domaintable.TableStatus  `json:"status"`
}

func (h *TableHandler) Create(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	var req CreateTableRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	seats := req.Seats
	if seats <= 0 && req.Capacity > 0 {
		seats = req.Capacity
	}
	if seats <= 0 {
		seats = 2
	}

	t := &domaintable.Table{
		TenantID:     tOID,
		Name:         req.Name,
		Zone:         req.Zone,
		Type:         req.Type,
		Floor:        req.Floor,
		Wing:         req.Wing,
		RoomNumber:   req.RoomNumber,
		Seats:        seats,
		FolioEnabled: req.FolioEnabled,
		Status:       req.Status,
	}

	if err := h.tableService.CreateTable(c.Request.Context(), t); err != nil {
		response.BadRequest(c, "CREATION_FAILED", err.Error())
		return
	}

	response.Created(c, t)
}

type BulkCreateRoomsRequest struct {
	StartRoom int                      `json:"startRoom" binding:"required"`
	EndRoom   int                      `json:"endRoom" binding:"required"`
	Floor     string                   `json:"floor" binding:"required"`
	Wing      string                   `json:"wing" binding:"required"`
	Type      domaintable.LocationType `json:"type"`
}

func (h *TableHandler) CreateRoomsBulk(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	var req BulkCreateRoomsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	rooms, err := h.tableService.CreateRoomsBulk(c.Request.Context(), tOID, req.StartRoom, req.EndRoom, req.Floor, req.Wing, req.Type)
	if err != nil {
		response.BadRequest(c, "BULK_CREATION_FAILED", err.Error())
		return
	}

	response.Created(c, gin.H{"count": len(rooms), "rooms": rooms})
}

type ToggleDNDRequest struct {
	DoNotDisturb bool `json:"doNotDisturb"`
}

func (h *TableHandler) ToggleDND(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	id := c.Param("id")
	if id == "" {
		response.BadRequest(c, "INVALID_ID", "invalid room ID")
		return
	}

	var req ToggleDNDRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	if err := h.tableService.ToggleDND(c.Request.Context(), tOID, id, req.DoNotDisturb); err != nil {
		response.BadRequest(c, "UPDATE_FAILED", err.Error())
		return
	}

	response.OK(c, gin.H{"id": id, "doNotDisturb": req.DoNotDisturb})
}

type UpdateTableStatusRequest struct {
	Status domaintable.TableStatus `json:"status" binding:"required"`
}

func (h *TableHandler) UpdateStatus(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	id := c.Param("id")
	if id == "" {
		response.BadRequest(c, "INVALID_ID", "invalid table ID")
		return
	}

	var req UpdateTableStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	if err := h.tableService.UpdateStatus(c.Request.Context(), tOID, id, req.Status); err != nil {
		response.BadRequest(c, "UPDATE_FAILED", err.Error())
		return
	}

	response.OK(c, gin.H{"id": id, "status": req.Status})
}

func (h *TableHandler) Delete(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	id := c.Param("id")
	if id == "" {
		response.BadRequest(c, "INVALID_ID", "invalid table ID")
		return
	}

	if err := h.tableService.DeleteTable(c.Request.Context(), tOID, id); err != nil {
		response.BadRequest(c, "DELETE_FAILED", err.Error())
		return
	}

	response.OK(c, gin.H{"deleted": true})
}
