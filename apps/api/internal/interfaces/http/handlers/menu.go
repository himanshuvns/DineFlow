package handlers

import (
	appmenu "github.com/dineflow/api/internal/application/menu"
	domainmenu "github.com/dineflow/api/internal/domain/menu"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type MenuHandler struct {
	menuService *appmenu.Service
}

func NewMenuHandler(s *appmenu.Service) *MenuHandler {
	return &MenuHandler{menuService: s}
}

// ─── Public Customer QR Menu Endpoint ─────────────────────────────────────────

func (h *MenuHandler) GetPublicMenu(c *gin.Context) {
	slug := c.Param("slug")
	if slug == "" {
		response.BadRequest(c, "MISSING_SLUG", "restaurant slug is required")
		return
	}

	menuData, err := h.menuService.GetPublicMenuBySlug(c.Request.Context(), slug)
	if err != nil {
		response.NotFound(c, err.Error())
		return
	}

	response.OK(c, menuData)
}

// ─── Admin Categories ─────────────────────────────────────────────────────────

func (h *MenuHandler) ListCategories(c *gin.Context) {
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

	categories, err := h.menuService.ListCategories(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, categories)
}

type CreateCategoryRequest struct {
	Name         string `json:"name" binding:"required"`
	Description  string `json:"description"`
	DisplayOrder int    `json:"displayOrder"`
	IsActive     bool   `json:"isActive"`
}

func (h *MenuHandler) CreateCategory(c *gin.Context) {
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

	var req CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	cat := &domainmenu.Category{
		TenantID:     tOID,
		Name:         req.Name,
		Description:  req.Description,
		DisplayOrder: req.DisplayOrder,
		IsActive:     true,
	}

	if err := h.menuService.CreateCategory(c.Request.Context(), cat); err != nil {
		response.BadRequest(c, "CREATION_FAILED", err.Error())
		return
	}

	response.Created(c, cat)
}

func (h *MenuHandler) DeleteCategory(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	catID := c.Param("id")
	cOID, err := bson.ObjectIDFromHex(catID)
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "invalid category ID")
		return
	}

	if err := h.menuService.DeleteCategory(c.Request.Context(), tOID, cOID); err != nil {
		response.BadRequest(c, "DELETE_FAILED", err.Error())
		return
	}

	response.OK(c, gin.H{"deleted": true})
}

// ─── Admin Menu Items ─────────────────────────────────────────────────────────

func (h *MenuHandler) ListItems(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	var catOID *bson.ObjectID
	if catParam := c.Query("categoryId"); catParam != "" {
		if oid, err := bson.ObjectIDFromHex(catParam); err == nil {
			catOID = &oid
		}
	}

	items, err := h.menuService.ListItems(c.Request.Context(), tOID, catOID)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, items)
}

func (h *MenuHandler) CreateItem(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	var item domainmenu.MenuItem
	if err := c.ShouldBindJSON(&item); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	item.TenantID = tOID
	item.IsAvailable = true
	if item.Currency == "" {
		item.Currency = "INR"
	}

	if err := h.menuService.CreateItem(c.Request.Context(), &item); err != nil {
		response.BadRequest(c, "CREATION_FAILED", err.Error())
		return
	}

	response.Created(c, item)
}

type ToggleStockRequest struct {
	IsAvailable bool `json:"isAvailable"`
}

func (h *MenuHandler) ToggleAvailability(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	itemID := c.Param("id")
	iOID, err := bson.ObjectIDFromHex(itemID)
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "invalid item ID")
		return
	}

	var req ToggleStockRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	if err := h.menuService.ToggleAvailability(c.Request.Context(), tOID, iOID, req.IsAvailable); err != nil {
		response.BadRequest(c, "UPDATE_FAILED", err.Error())
		return
	}

	response.OK(c, gin.H{"id": itemID, "isAvailable": req.IsAvailable})
}

func (h *MenuHandler) DeleteItem(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	itemID := c.Param("id")
	iOID, err := bson.ObjectIDFromHex(itemID)
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "invalid item ID")
		return
	}

	if err := h.menuService.DeleteItem(c.Request.Context(), tOID, iOID); err != nil {
		response.BadRequest(c, "DELETE_FAILED", err.Error())
		return
	}

	response.OK(c, gin.H{"deleted": true})
}
