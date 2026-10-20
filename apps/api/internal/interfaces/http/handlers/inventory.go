package handlers

import (
	"strconv"

	appinv "github.com/dineflow/api/internal/application/inventory"
	domaininv "github.com/dineflow/api/internal/domain/inventory"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type InventoryHandler struct {
	service *appinv.Service
}

func NewInventoryHandler(s *appinv.Service) *InventoryHandler {
	return &InventoryHandler{service: s}
}

func (h *InventoryHandler) GetDashboardSummary(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	summary, err := h.service.GetDashboardSummary(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, summary)
}

func (h *InventoryHandler) ListItems(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	filter := appinv.ListItemsFilter{
		Category: c.Query("category"),
		ItemType: c.Query("itemType"),
		LowStock: c.Query("lowStock") == "true",
		Search:   c.Query("search"),
	}
	if arch := c.Query("archived"); arch == "true" {
		t := true
		filter.IsArchived = &t
	}

	items, err := h.service.ListItems(c.Request.Context(), tOID, filter)
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, items)
}

func (h *InventoryHandler) CreateItem(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	var input appinv.CreateItemInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "INVALID_INPUT", err.Error())
		return
	}

	item, err := h.service.CreateItem(c.Request.Context(), tOID, input)
	if err != nil {
		response.BadRequest(c, "CREATE_FAILED", err.Error())
		return
	}
	response.Created(c, item)
}

func (h *InventoryHandler) GetItem(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	itemID, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "Invalid inventory item id")
		return
	}

	item, err := h.service.GetItem(c.Request.Context(), tOID, itemID)
	if err != nil {
		response.NotFound(c, "Inventory item")
		return
	}
	response.OK(c, item)
}

func (h *InventoryHandler) UpdateItem(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	itemID, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "Invalid inventory item id")
		return
	}

	var input appinv.CreateItemInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "INVALID_INPUT", err.Error())
		return
	}

	item, err := h.service.UpdateItem(c.Request.Context(), tOID, itemID, input)
	if err != nil {
		response.BadRequest(c, "UPDATE_FAILED", err.Error())
		return
	}
	response.OK(c, item)
}

func (h *InventoryHandler) DeleteItem(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	itemID, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "Invalid inventory item id")
		return
	}

	if err := h.service.DeleteItem(c.Request.Context(), tOID, itemID); err != nil {
		response.InternalError(c)
		return
	}
	response.NoContent(c)
}

type AdjustStockRequest struct {
	Quantity float64 `json:"quantity" binding:"required"`
	Unit     string  `json:"unit"`
	Reason   string  `json:"reason"`
}

func (h *InventoryHandler) AdjustStock(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)
	userID := middleware.GetUserID(c)
	uOID, _ := bson.ObjectIDFromHex(userID)

	itemID, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "Invalid inventory item id")
		return
	}

	var req AdjustStockRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_INPUT", err.Error())
		return
	}

	item, err := h.service.AdjustStock(c.Request.Context(), tOID, itemID, req.Quantity, req.Unit, req.Reason, "manual", "", uOID, "Manual Adjustment")
	if err != nil {
		response.BadRequest(c, "ADJUSTMENT_FAILED", err.Error())
		return
	}
	response.OK(c, item)
}

// ─── Recipes ───────────────────────────────────────────────────────────────

func (h *InventoryHandler) ListRecipes(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	recipes, err := h.service.ListRecipes(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, recipes)
}

func (h *InventoryHandler) CreateRecipe(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	var input appinv.CreateRecipeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "INVALID_INPUT", err.Error())
		return
	}

	rec, err := h.service.CreateRecipe(c.Request.Context(), tOID, input)
	if err != nil {
		response.BadRequest(c, "RECIPE_CREATION_FAILED", err.Error())
		return
	}
	response.Created(c, rec)
}

func (h *InventoryHandler) GetRecipe(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	recID, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "Invalid recipe id")
		return
	}

	rec, err := h.service.GetRecipe(c.Request.Context(), tOID, recID)
	if err != nil {
		response.NotFound(c, "Recipe")
		return
	}
	response.OK(c, rec)
}

func (h *InventoryHandler) GetRecipeByMenuItem(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	menuItemID, err := bson.ObjectIDFromHex(c.Param("menuItemId"))
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "Invalid menuItemId")
		return
	}

	rec, err := h.service.GetRecipeByMenuItem(c.Request.Context(), tOID, menuItemID)
	if err != nil {
		response.NotFound(c, "Recipe for menu item")
		return
	}
	response.OK(c, rec)
}

func (h *InventoryHandler) DeleteRecipe(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	recID, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "Invalid recipe id")
		return
	}

	if err := h.service.DeleteRecipe(c.Request.Context(), tOID, recID); err != nil {
		response.InternalError(c)
		return
	}
	response.NoContent(c)
}

// ─── Suppliers ─────────────────────────────────────────────────────────────

func (h *InventoryHandler) ListSuppliers(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	suppliers, err := h.service.ListSuppliers(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, suppliers)
}

func (h *InventoryHandler) CreateSupplier(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	var input domaininv.Supplier
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "INVALID_INPUT", err.Error())
		return
	}

	supp, err := h.service.CreateSupplier(c.Request.Context(), tOID, input)
	if err != nil {
		response.BadRequest(c, "CREATE_FAILED", err.Error())
		return
	}
	response.Created(c, supp)
}

func (h *InventoryHandler) GetSupplier(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	suppID, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "Invalid supplier id")
		return
	}

	supp, err := h.service.GetSupplier(c.Request.Context(), tOID, suppID)
	if err != nil {
		response.NotFound(c, "Supplier")
		return
	}
	response.OK(c, supp)
}

func (h *InventoryHandler) UpdateSupplier(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	suppID, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "Invalid supplier id")
		return
	}

	var input domaininv.Supplier
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "INVALID_INPUT", err.Error())
		return
	}

	supp, err := h.service.UpdateSupplier(c.Request.Context(), tOID, suppID, input)
	if err != nil {
		response.BadRequest(c, "UPDATE_FAILED", err.Error())
		return
	}
	response.OK(c, supp)
}

func (h *InventoryHandler) DeleteSupplier(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	suppID, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "Invalid supplier id")
		return
	}

	if err := h.service.DeleteSupplier(c.Request.Context(), tOID, suppID); err != nil {
		response.InternalError(c)
		return
	}
	response.NoContent(c)
}

// ─── Purchase Orders & GRN ──────────────────────────────────────────────────

func (h *InventoryHandler) ListPurchaseOrders(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	var st *domaininv.POStatus
	if s := c.Query("status"); s != "" {
		stat := domaininv.POStatus(s)
		st = &stat
	}

	pos, err := h.service.ListPOs(c.Request.Context(), tOID, st)
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, pos)
}

func (h *InventoryHandler) CreatePurchaseOrder(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)
	userID := middleware.GetUserID(c)
	uOID, _ := bson.ObjectIDFromHex(userID)

	var input appinv.CreatePOInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "INVALID_INPUT", err.Error())
		return
	}

	po, err := h.service.CreatePO(c.Request.Context(), tOID, uOID, "Authorized Staff", input)
	if err != nil {
		response.BadRequest(c, "CREATE_PO_FAILED", err.Error())
		return
	}
	response.Created(c, po)
}

func (h *InventoryHandler) GetPurchaseOrder(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	poID, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "Invalid PO id")
		return
	}

	po, err := h.service.GetPO(c.Request.Context(), tOID, poID)
	if err != nil {
		response.NotFound(c, "Purchase order")
		return
	}
	response.OK(c, po)
}

func (h *InventoryHandler) ApprovePurchaseOrder(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)
	userID := middleware.GetUserID(c)
	uOID, _ := bson.ObjectIDFromHex(userID)

	poID, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "Invalid PO id")
		return
	}

	po, err := h.service.ApprovePO(c.Request.Context(), tOID, poID, uOID)
	if err != nil {
		response.BadRequest(c, "APPROVAL_FAILED", err.Error())
		return
	}
	response.OK(c, po)
}

func (h *InventoryHandler) OrderPurchaseOrder(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	poID, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "Invalid PO id")
		return
	}

	po, err := h.service.OrderPO(c.Request.Context(), tOID, poID)
	if err != nil {
		response.BadRequest(c, "ORDER_FAILED", err.Error())
		return
	}
	response.OK(c, po)
}

func (h *InventoryHandler) CancelPurchaseOrder(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	poID, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "Invalid PO id")
		return
	}

	var req struct {
		Reason string `json:"reason"`
	}
	_ = c.ShouldBindJSON(&req)

	if err := h.service.CancelPO(c.Request.Context(), tOID, poID, req.Reason); err != nil {
		response.InternalError(c)
		return
	}
	response.NoContent(c)
}

func (h *InventoryHandler) ReceiveGRN(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)
	userID := middleware.GetUserID(c)
	uOID, _ := bson.ObjectIDFromHex(userID)

	var input appinv.ReceiveGRNInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "INVALID_INPUT", err.Error())
		return
	}

	grn, err := h.service.ReceiveGRN(c.Request.Context(), tOID, uOID, "Receiving Clerk", input)
	if err != nil {
		response.BadRequest(c, "GRN_RECEIPT_FAILED", err.Error())
		return
	}
	response.Created(c, grn)
}

func (h *InventoryHandler) ListGRN(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	var poOID *bson.ObjectID
	if poIDStr := c.Query("purchaseOrderId"); poIDStr != "" {
		if oid, err := bson.ObjectIDFromHex(poIDStr); err == nil {
			poOID = &oid
		}
	}

	grns, err := h.service.ListGRNs(c.Request.Context(), tOID, poOID)
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, grns)
}

func (h *InventoryHandler) GetGRN(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	grnID, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "Invalid GRN id")
		return
	}

	grn, err := h.service.GetGRN(c.Request.Context(), tOID, grnID)
	if err != nil {
		response.NotFound(c, "GRN")
		return
	}
	response.OK(c, grn)
}

// ─── Stock Movements & Counts ───────────────────────────────────────────────

func (h *InventoryHandler) ListMovements(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	limit, _ := strconv.ParseInt(c.DefaultQuery("limit", "50"), 10, 64)
	movements, err := h.service.ListMovements(c.Request.Context(), tOID, limit)
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, movements)
}

func (h *InventoryHandler) ListStockCounts(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	counts, err := h.service.ListStockCounts(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, counts)
}

func (h *InventoryHandler) CreateStockCount(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)
	userID := middleware.GetUserID(c)
	uOID, _ := bson.ObjectIDFromHex(userID)

	var input appinv.CreateStockCountInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "INVALID_INPUT", err.Error())
		return
	}

	sc, err := h.service.CreateStockCount(c.Request.Context(), tOID, uOID, input)
	if err != nil {
		response.BadRequest(c, "COUNT_CREATION_FAILED", err.Error())
		return
	}
	response.Created(c, sc)
}

func (h *InventoryHandler) GetStockCount(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	scID, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "Invalid stock count id")
		return
	}

	sc, err := h.service.GetStockCount(c.Request.Context(), tOID, scID)
	if err != nil {
		response.NotFound(c, "Stock count")
		return
	}
	response.OK(c, sc)
}

func (h *InventoryHandler) UpdateStockCountItems(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	scID, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "Invalid stock count id")
		return
	}

	var req struct {
		Items []domaininv.StockCountItem `json:"items" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_INPUT", err.Error())
		return
	}

	sc, err := h.service.UpdateStockCountItems(c.Request.Context(), tOID, scID, req.Items)
	if err != nil {
		response.BadRequest(c, "UPDATE_FAILED", err.Error())
		return
	}
	response.OK(c, sc)
}

func (h *InventoryHandler) SubmitStockCount(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	scID, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "Invalid stock count id")
		return
	}

	if err := h.service.SubmitStockCount(c.Request.Context(), tOID, scID); err != nil {
		response.InternalError(c)
		return
	}
	response.NoContent(c)
}

func (h *InventoryHandler) ApproveStockCount(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)
	userID := middleware.GetUserID(c)
	uOID, _ := bson.ObjectIDFromHex(userID)

	scID, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "Invalid stock count id")
		return
	}

	sc, err := h.service.ApproveStockCount(c.Request.Context(), tOID, scID, uOID, "Inventory Manager")
	if err != nil {
		response.BadRequest(c, "APPROVAL_FAILED", err.Error())
		return
	}
	response.OK(c, sc)
}

// ─── Transfers & Outlets ────────────────────────────────────────────────────

func (h *InventoryHandler) ListTransfers(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	transfers, err := h.service.ListTransfers(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, transfers)
}

func (h *InventoryHandler) CreateTransfer(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)
	userID := middleware.GetUserID(c)
	uOID, _ := bson.ObjectIDFromHex(userID)

	var input appinv.CreateTransferInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "INVALID_INPUT", err.Error())
		return
	}

	tr, err := h.service.CreateTransfer(c.Request.Context(), tOID, uOID, input)
	if err != nil {
		response.BadRequest(c, "TRANSFER_FAILED", err.Error())
		return
	}
	response.Created(c, tr)
}

func (h *InventoryHandler) GetTransfer(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	trID, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "Invalid transfer id")
		return
	}

	tr, err := h.service.GetTransfer(c.Request.Context(), tOID, trID)
	if err != nil {
		response.NotFound(c, "Transfer")
		return
	}
	response.OK(c, tr)
}

func (h *InventoryHandler) ApproveTransfer(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	trID, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "Invalid transfer id")
		return
	}

	if err := h.service.ApproveTransfer(c.Request.Context(), tOID, trID); err != nil {
		response.InternalError(c)
		return
	}
	response.NoContent(c)
}

func (h *InventoryHandler) DispatchTransfer(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)
	userID := middleware.GetUserID(c)
	uOID, _ := bson.ObjectIDFromHex(userID)

	trID, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "Invalid transfer id")
		return
	}

	tr, err := h.service.DispatchTransfer(c.Request.Context(), tOID, trID, uOID, "Dispatch Steward")
	if err != nil {
		response.BadRequest(c, "DISPATCH_FAILED", err.Error())
		return
	}
	response.OK(c, tr)
}

func (h *InventoryHandler) ReceiveTransfer(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)
	userID := middleware.GetUserID(c)
	uOID, _ := bson.ObjectIDFromHex(userID)

	trID, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "INVALID_ID", "Invalid transfer id")
		return
	}

	var req struct {
		Items []domaininv.TransferItem `json:"items" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_INPUT", err.Error())
		return
	}

	tr, err := h.service.ReceiveTransfer(c.Request.Context(), tOID, trID, uOID, "Receiving Steward", req.Items)
	if err != nil {
		response.BadRequest(c, "RECEIPT_FAILED", err.Error())
		return
	}
	response.OK(c, tr)
}

func (h *InventoryHandler) ListOutlets(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	outlets, err := h.service.ListOutlets(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, outlets)
}

func (h *InventoryHandler) CreateOutlet(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	var input domaininv.Outlet
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "INVALID_INPUT", err.Error())
		return
	}

	out, err := h.service.CreateOutlet(c.Request.Context(), tOID, input)
	if err != nil {
		response.BadRequest(c, "CREATE_OUTLET_FAILED", err.Error())
		return
	}
	response.Created(c, out)
}

// ─── Settings & Reports ─────────────────────────────────────────────────────

func (h *InventoryHandler) GetSettings(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	settings, err := h.service.GetSettings(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, settings)
}

func (h *InventoryHandler) UpdateSettings(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	var input domaininv.InventorySettings
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "INVALID_INPUT", err.Error())
		return
	}

	st, err := h.service.UpdateSettings(c.Request.Context(), tOID, input)
	if err != nil {
		response.BadRequest(c, "UPDATE_SETTINGS_FAILED", err.Error())
		return
	}
	response.OK(c, st)
}

func (h *InventoryHandler) GetValuationReport(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	tOID, _ := bson.ObjectIDFromHex(tenantID)

	val, err := h.service.GetValuationReport(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, val)
}
