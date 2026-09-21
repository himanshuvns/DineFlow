package handlers

import (
	"context"

	appai "github.com/dineflow/api/internal/application/ai"
	appmenu "github.com/dineflow/api/internal/application/menu"
	domainmenu "github.com/dineflow/api/internal/domain/menu"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type MenuHandler struct {
	menuService *appmenu.Service
	aiService   *appai.Service
}

func NewMenuHandler(s *appmenu.Service, ai *appai.Service) *MenuHandler {
	return &MenuHandler{menuService: s, aiService: ai}
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

func (h *MenuHandler) UpdateCategory(c *gin.Context) {
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

	catID := c.Param("id")
	cOID, err := bson.ObjectIDFromHex(catID)
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "invalid category ID")
		return
	}

	var req CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	if err := h.menuService.UpdateCategory(c.Request.Context(), tOID, cOID, req.Name, req.Description, req.DisplayOrder, req.IsActive); err != nil {
		response.BadRequest(c, "UPDATE_FAILED", err.Error())
		return
	}

	response.OK(c, gin.H{"id": catID, "name": req.Name, "updated": true})
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

type UpsertItemRequest struct {
	CategoryID      string                     `json:"categoryId"`
	Category        string                     `json:"category"`
	Name            string                     `json:"name" binding:"required"`
	Description     string                     `json:"description"`
	Desc            string                     `json:"desc"`
	BasePrice       float64                    `json:"basePrice"`
	Price           float64                    `json:"price"`
	Currency        string                     `json:"currency"`
	ImageURL        string                     `json:"imageUrl"`
	IsAvailable     *bool                      `json:"isAvailable"`
	Available       *bool                      `json:"available"`
	PrepTimeMinutes int                        `json:"prepTimeMinutes"`
	DietaryTags     []domainmenu.DietaryTag    `json:"dietaryTags"`
	IsVeg           *bool                      `json:"isVeg"`
	Variants        []domainmenu.Variant       `json:"variants"`
	ModifierGroups  []domainmenu.ModifierGroup `json:"modifierGroups"`
	TaxRatePercent  float64                    `json:"taxRatePercent"`
	DisplayOrder    int                        `json:"displayOrder"`
	IsBestseller    bool                       `json:"isBestseller"`
	Bestseller      bool                       `json:"bestseller"`
	IsRecommended   bool                       `json:"isRecommended"`
	Recommended     bool                       `json:"recommended"`
	SpicyLevel      int                        `json:"spicyLevel"`
	HindiName       string                     `json:"hindiName"`
}

func buildMenuItemFromUpsertRequest(req *UpsertItemRequest, tOID bson.ObjectID, menuService *appmenu.Service, ctx context.Context) (*domainmenu.MenuItem, error) {
	price := req.BasePrice
	if price == 0 && req.Price > 0 {
		price = req.Price
	}

	desc := req.Description
	if desc == "" && req.Desc != "" {
		desc = req.Desc
	}

	isAvailable := true
	if req.IsAvailable != nil {
		isAvailable = *req.IsAvailable
	} else if req.Available != nil {
		isAvailable = *req.Available
	}

	isBestseller := req.IsBestseller || req.Bestseller
	isRecommended := req.IsRecommended || req.Recommended

	tags := req.DietaryTags
	if req.IsVeg != nil {
		hasVegTag := false
		hasNonVegTag := false
		for _, t := range tags {
			if t == domainmenu.TagVeg {
				hasVegTag = true
			}
			if t == domainmenu.TagNonVeg {
				hasNonVegTag = true
			}
		}
		if *req.IsVeg && !hasVegTag {
			tags = append(tags, domainmenu.TagVeg)
		} else if !*req.IsVeg && !hasNonVegTag {
			tags = append(tags, domainmenu.TagNonVeg)
		}
	}

	currency := req.Currency
	if currency == "" {
		currency = "INR"
	}

	var catOID bson.ObjectID
	catName := req.Category
	if req.CategoryID != "" {
		if oid, err := bson.ObjectIDFromHex(req.CategoryID); err == nil {
			catOID = oid
		}
	}
	if catOID.IsZero() {
		if catName == "" {
			catName = "General"
		}
		resolvedID, resolvedName, err := menuService.FindOrCreateCategoryByName(ctx, tOID, catName)
		if err != nil {
			return nil, err
		}
		catOID = resolvedID
		catName = resolvedName
	}

	item := &domainmenu.MenuItem{
		TenantID:        tOID,
		CategoryID:      catOID,
		CategoryName:    catName,
		Name:            req.Name,
		Description:     desc,
		BasePrice:       price,
		Currency:        currency,
		ImageURL:        req.ImageURL,
		IsAvailable:     isAvailable,
		PrepTimeMinutes: req.PrepTimeMinutes,
		DietaryTags:     tags,
		Variants:        req.Variants,
		ModifierGroups:  req.ModifierGroups,
		TaxRatePercent:  req.TaxRatePercent,
		DisplayOrder:    req.DisplayOrder,
		IsBestseller:    isBestseller,
		IsRecommended:   isRecommended,
		SpicyLevel:      req.SpicyLevel,
		HindiName:       req.HindiName,
	}
	return item, nil
}

func (h *MenuHandler) CreateItem(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	var req UpsertItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	item, err := buildMenuItemFromUpsertRequest(&req, tOID, h.menuService, c.Request.Context())
	if err != nil {
		response.BadRequest(c, "CREATION_FAILED", err.Error())
		return
	}

	if err := h.menuService.CreateItem(c.Request.Context(), item); err != nil {
		response.BadRequest(c, "CREATION_FAILED", err.Error())
		return
	}

	response.Created(c, item)
}

func (h *MenuHandler) UpdateItem(c *gin.Context) {
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

	var req UpsertItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	item, err := buildMenuItemFromUpsertRequest(&req, tOID, h.menuService, c.Request.Context())
	if err != nil {
		response.BadRequest(c, "UPDATE_FAILED", err.Error())
		return
	}
	item.ID = iOID

	if err := h.menuService.UpdateItem(c.Request.Context(), tOID, iOID, item); err != nil {
		response.BadRequest(c, "UPDATE_FAILED", err.Error())
		return
	}

	response.OK(c, item)
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

type BulkCreateItemsRequest struct {
	Items []*UpsertItemRequest `json:"items" binding:"required"`
}

func (h *MenuHandler) BulkCreateItems(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	var req BulkCreateItemsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	domainItems := make([]*domainmenu.MenuItem, 0, len(req.Items))
	for _, itmReq := range req.Items {
		itm, err := buildMenuItemFromUpsertRequest(itmReq, tOID, h.menuService, c.Request.Context())
		if err != nil {
			response.BadRequest(c, "INVALID_ITEM", err.Error())
			return
		}
		domainItems = append(domainItems, itm)
	}

	if err := h.menuService.BulkCreateItems(c.Request.Context(), tOID, domainItems); err != nil {
		response.InternalError(c)
		return
	}

	response.Created(c, gin.H{"count": len(domainItems), "items": domainItems})
}

type BulkUpdateItemsRequest struct {
	IDs     []string               `json:"ids" binding:"required"`
	Updates map[string]interface{} `json:"updates" binding:"required"`
}

func (h *MenuHandler) BulkUpdateItems(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	var req BulkUpdateItemsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	oids := make([]bson.ObjectID, 0, len(req.IDs))
	for _, idStr := range req.IDs {
		if oid, err := bson.ObjectIDFromHex(idStr); err == nil {
			oids = append(oids, oid)
		}
	}

	updateMap := bson.M{}
	for k, v := range req.Updates {
		updateMap[k] = v
	}

	if err := h.menuService.BulkUpdateItems(c.Request.Context(), tOID, oids, updateMap); err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{"updated": len(oids)})
}

type BulkDeleteItemsRequest struct {
	IDs []string `json:"ids" binding:"required"`
}

func (h *MenuHandler) BulkDeleteItems(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	var req BulkDeleteItemsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	oids := make([]bson.ObjectID, 0, len(req.IDs))
	for _, idStr := range req.IDs {
		if oid, err := bson.ObjectIDFromHex(idStr); err == nil {
			oids = append(oids, oid)
		}
	}

	if err := h.menuService.BulkDeleteItems(c.Request.Context(), tOID, oids); err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{"deleted": len(oids)})
}

type ScanMenuRequest struct {
	ImageBase64 string `json:"imageBase64"`
	RawText     string `json:"rawText"`
}

func (h *MenuHandler) ScanMenu(c *gin.Context) {
	var req ScanMenuRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	if h.aiService != nil && req.ImageBase64 != "" {
		dishes, err := h.aiService.ScanMenuWithVision(c.Request.Context(), req.ImageBase64)
		if err == nil && len(dishes) > 0 {
			response.OK(c, gin.H{
				"status":  "success",
				"success": true,
				"source":  "gemini_vision",
				"count":   len(dishes),
				"items":   dishes,
			})
			return
		}
	}

	response.OK(c, gin.H{
		"status":  "success",
		"success": true,
		"source":  "fallback",
		"message": "Processed payload",
		"items":   []interface{}{},
	})
}
