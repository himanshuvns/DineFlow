package inventory

import (
	"errors"
	"fmt"
	"math"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// ─── Unit Types & Dimensions ────────────────────────────────────────────────

type UnitDimension string

const (
	DimensionMass      UnitDimension = "mass"
	DimensionVolume    UnitDimension = "volume"
	DimensionCount     UnitDimension = "count"
	DimensionPackaging UnitDimension = "packaging"
	DimensionUnknown   UnitDimension = "unknown"
)

// Standard conversion factors to base unit (Mass base: g, Volume base: ml, Count base: pcs)
var massFactors = map[string]float64{
	"g":  1.0,
	"kg": 1000.0,
}

var volumeFactors = map[string]float64{
	"ml": 1.0,
	"l":  1000.0,
}

var countFactors = map[string]float64{
	"pcs":   1.0,
	"dozen": 12.0,
}

var packagingUnits = map[string]bool{
	"pack":   true,
	"box":    true,
	"carton": true,
	"bottle": true,
	"bag":    true,
	"can":    true,
}

// NormalizeUnit normalizes aliases and plurals to standardized unit keys.
func NormalizeUnit(u string) string {
	clean := strings.ToLower(strings.TrimSpace(u))
	switch clean {
	case "g", "gram", "grams", "gm":
		return "g"
	case "kg", "kilogram", "kilograms", "kgs":
		return "kg"
	case "ml", "milliliter", "milliliters", "milli":
		return "ml"
	case "l", "liter", "liters", "ltr", "ltrs":
		return "l"
	case "pcs", "pc", "piece", "pieces", "ea", "each", "nos", "no":
		return "pcs"
	case "dozen", "doz", "dz":
		return "dozen"
	case "pack", "packs", "pkt", "pkts":
		return "pack"
	case "box", "boxes", "bx":
		return "box"
	case "carton", "cartons", "ctn":
		return "carton"
	case "bottle", "bottles", "btl":
		return "bottle"
	case "bag", "bags":
		return "bag"
	case "can", "cans", "tin", "tins":
		return "can"
	default:
		return clean
	}
}

// GetDimension returns the unit dimension category for a given unit.
func GetDimension(u string) UnitDimension {
	norm := NormalizeUnit(u)
	if _, ok := massFactors[norm]; ok {
		return DimensionMass
	}
	if _, ok := volumeFactors[norm]; ok {
		return DimensionVolume
	}
	if _, ok := countFactors[norm]; ok {
		return DimensionCount
	}
	if packagingUnits[norm] {
		return DimensionPackaging
	}
	return DimensionUnknown
}

// ConvertQuantity converts a quantity from fromUnit to toUnit.
// Supports Mass (g, kg), Volume (ml, l), Count (pcs, dozen), and Packaging (pack, box, carton, bottle, bag, can).
// Custom factor is required when converting across packaging units or differing dimensions.
func ConvertQuantity(qty float64, fromUnit, toUnit string, customFactor float64) (float64, error) {
	from := NormalizeUnit(fromUnit)
	to := NormalizeUnit(toUnit)

	if from == to {
		return qty, nil
	}

	fromDim := GetDimension(from)
	toDim := GetDimension(to)

	// Case 1: Same Dimension standard conversions
	if fromDim == DimensionMass && toDim == DimensionMass {
		fromFactor := massFactors[from]
		toFactor := massFactors[to]
		return (qty * fromFactor) / toFactor, nil
	}

	if fromDim == DimensionVolume && toDim == DimensionVolume {
		fromFactor := volumeFactors[from]
		toFactor := volumeFactors[to]
		return (qty * fromFactor) / toFactor, nil
	}

	if fromDim == DimensionCount && toDim == DimensionCount {
		fromFactor := countFactors[from]
		toFactor := countFactors[to]
		return (qty * fromFactor) / toFactor, nil
	}

	// Case 2: Packaging conversions or cross-dimension conversions require a positive custom factor
	if customFactor <= 0 {
		return 0, fmt.Errorf("incompatible unit conversion from '%s' (%s) to '%s' (%s): requires positive custom conversion factor", fromUnit, fromDim, toUnit, toDim)
	}

	// If converting from a packaging/composite container unit to a base dimension:
	// e.g. 2 boxes * 12 pcs/box = 24 pcs; 3 cans * 330 ml/can = 990 ml.
	if fromDim == DimensionPackaging || fromDim == DimensionUnknown {
		return qty * customFactor, nil
	}

	// If converting from base dimension to packaging container unit:
	// e.g. 24 pcs / 12 pcs/box = 2 boxes; 990 ml / 330 ml/can = 3 cans.
	if toDim == DimensionPackaging || toDim == DimensionUnknown {
		return qty / customFactor, nil
	}

	// General cross-dimension with explicit multiplier
	return qty * customFactor, nil
}

// ─── Enums & Constants ──────────────────────────────────────────────────────

type ItemType string

const (
	ItemTypeRawIngredient ItemType = "raw_ingredient"
	ItemTypePackaging     ItemType = "packaging"
	ItemTypeCleaning      ItemType = "cleaning"
	ItemTypeGuestAmenity  ItemType = "guest_amenity"
	ItemTypeBeverage      ItemType = "beverage"
	ItemTypeOperational   ItemType = "operational"
	ItemTypeOther         ItemType = "other"
)

type POStatus string

const (
	POStatusDraft             POStatus = "draft"
	POStatusPendingApproval   POStatus = "pending_approval"
	POStatusApproved          POStatus = "approved"
	POStatusOrdered           POStatus = "ordered"
	POStatusPartiallyReceived POStatus = "partially_received"
	POStatusReceived          POStatus = "received"
	POStatusCancelled         POStatus = "cancelled"
)

type MovementType string

const (
	MovementPurchaseReceipt       MovementType = "purchase_receipt"
	MovementIngredientConsumption MovementType = "ingredient_consumption"
	MovementStockTransferIn       MovementType = "stock_transfer_in"
	MovementStockTransferOut      MovementType = "stock_transfer_out"
	MovementWastage               MovementType = "wastage"
	MovementDamaged               MovementType = "damaged"
	MovementExpired               MovementType = "expired"
	MovementCorrection            MovementType = "correction"
	MovementReturnToSupplier      MovementType = "return_to_supplier"
	MovementCustomerReturn        MovementType = "customer_return"
	MovementOpeningStock          MovementType = "opening_stock"
)

type StockCountStatus string

const (
	StockCountDraft      StockCountStatus = "draft"
	StockCountInProgress StockCountStatus = "in_progress"
	StockCountSubmitted  StockCountStatus = "submitted"
	StockCountApproved   StockCountStatus = "approved"
	StockCountRejected   StockCountStatus = "rejected"
)

type TransferStatus string

const (
	TransferRequested  TransferStatus = "requested"
	TransferApproved   TransferStatus = "approved"
	TransferDispatched TransferStatus = "dispatched"
	TransferReceived   TransferStatus = "received"
	TransferRejected   TransferStatus = "rejected"
	TransferCancelled  TransferStatus = "cancelled"
)

type DeductionTriggerType string

const (
	DeductionOnOrderPreparing DeductionTriggerType = "on_order_preparing"
	DeductionOnOrderPaid      DeductionTriggerType = "on_order_paid"
)

// ─── Domain Models ──────────────────────────────────────────────────────────

// InventoryItem represents a physical SKU stocked in a restaurant/hotel.
type InventoryItem struct {
	ID                  bson.ObjectID  `bson:"_id,omitempty" json:"id"`
	TenantID            bson.ObjectID  `bson:"tenantId" json:"tenantId"`
	OutletID            *bson.ObjectID `bson:"outletId,omitempty" json:"outletId,omitempty"`
	Name                string         `bson:"name" json:"name"`
	SKU                 string         `bson:"sku" json:"sku"`
	Barcode             string         `bson:"barcode,omitempty" json:"barcode,omitempty"`
	Description         string         `bson:"description,omitempty" json:"description,omitempty"`
	Category            string         `bson:"category" json:"category"`
	ItemType            ItemType       `bson:"itemType" json:"itemType"`
	Brand               string         `bson:"brand,omitempty" json:"brand,omitempty"`
	ImageURL            string         `bson:"imageUrl,omitempty" json:"imageUrl,omitempty"`
	BaseUnit            string         `bson:"baseUnit" json:"baseUnit"`
	PurchaseUnit        string         `bson:"purchaseUnit" json:"purchaseUnit"`
	ConversionFactor    float64        `bson:"conversionFactor" json:"conversionFactor"` // 1 PurchaseUnit = ConversionFactor BaseUnits
	CurrentQuantity     float64        `bson:"currentQuantity" json:"currentQuantity"`
	MinStockLevel       float64        `bson:"minStockLevel" json:"minStockLevel"`
	ReorderQuantity     float64        `bson:"reorderQuantity" json:"reorderQuantity"`
	MaxStockLevel       float64        `bson:"maxStockLevel" json:"maxStockLevel"`
	AvgPurchaseCost     float64        `bson:"avgPurchaseCost" json:"avgPurchaseCost"` // cost per BaseUnit
	LastPurchasePrice   float64        `bson:"lastPurchasePrice" json:"lastPurchasePrice"`
	PreferredSupplierID *bson.ObjectID `bson:"preferredSupplierId,omitempty" json:"preferredSupplierId,omitempty"`
	StorageLocation     string         `bson:"storageLocation,omitempty" json:"storageLocation,omitempty"`
	Department          string         `bson:"department,omitempty" json:"department,omitempty"`
	ExpiryTracking      bool           `bson:"expiryTracking" json:"expiryTracking"`
	BatchTracking       bool           `bson:"batchTracking" json:"batchTracking"`
	IsArchived          bool           `bson:"isArchived" json:"isArchived"`
	CreatedAt           time.Time      `bson:"createdAt" json:"createdAt"`
	UpdatedAt           time.Time      `bson:"updatedAt" json:"updatedAt"`
}

func (i *InventoryItem) IsLowStock() bool {
	return i.CurrentQuantity <= i.MinStockLevel
}

func (i *InventoryItem) TotalValue() float64 {
	return math.Round(i.CurrentQuantity*i.AvgPurchaseCost*100) / 100
}

// RecipeIngredient represents an ingredient required for a recipe dish.
type RecipeIngredient struct {
	InventoryItemID   bson.ObjectID `bson:"inventoryItemId" json:"inventoryItemId"`
	InventoryItemName string        `bson:"inventoryItemName" json:"inventoryItemName"`
	Quantity          float64       `bson:"quantity" json:"quantity"`
	Unit              string        `bson:"unit" json:"unit"`
	PrepLossPercent   float64       `bson:"prepLossPercent" json:"prepLossPercent"` // Waste % during prep
	UnitCost          float64       `bson:"unitCost" json:"unitCost"`               // Cost per recipe unit
	IngredientCost    float64       `bson:"ingredientCost" json:"ingredientCost"`   // (Quantity * (1 + loss%)) * UnitCost
}

// Recipe maps a POS/Menu item to raw ingredient stock deductions and food cost ratios.
type Recipe struct {
	ID                 bson.ObjectID      `bson:"_id,omitempty" json:"id"`
	TenantID           bson.ObjectID      `bson:"tenantId" json:"tenantId"`
	MenuItemID         bson.ObjectID      `bson:"menuItemId" json:"menuItemId"`
	MenuItemName       string             `bson:"menuItemName" json:"menuItemName"`
	Name               string             `bson:"name" json:"name"`
	YieldServings      float64            `bson:"yieldServings" json:"yieldServings"` // Default 1.0
	Ingredients        []RecipeIngredient `bson:"ingredients" json:"ingredients"`
	TotalCost          float64            `bson:"totalCost" json:"totalCost"`
	CostPerServing     float64            `bson:"costPerServing" json:"costPerServing"`
	SellingPrice       float64            `bson:"sellingPrice" json:"sellingPrice"`
	FoodCostPercent    float64            `bson:"foodCostPercent" json:"foodCostPercent"`
	GrossMargin        float64            `bson:"grossMargin" json:"grossMargin"`
	GrossMarginPercent float64            `bson:"grossMarginPercent" json:"grossMarginPercent"`
	Version            int                `bson:"version" json:"version"`
	IsActive           bool               `bson:"isActive" json:"isActive"`
	Notes              string             `bson:"notes,omitempty" json:"notes,omitempty"`
	CreatedAt          time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt          time.Time          `bson:"updatedAt" json:"updatedAt"`
}

func (r *Recipe) Recalculate() {
	if r.YieldServings <= 0 {
		r.YieldServings = 1.0
	}
	var total float64
	for i := range r.Ingredients {
		ing := &r.Ingredients[i]
		effectiveQty := ing.Quantity * (1.0 + (ing.PrepLossPercent / 100.0))
		ing.IngredientCost = math.Round(effectiveQty*ing.UnitCost*100) / 100
		total += ing.IngredientCost
	}
	r.TotalCost = math.Round(total*100) / 100
	r.CostPerServing = math.Round((r.TotalCost/r.YieldServings)*100) / 100

	if r.SellingPrice > 0 {
		r.FoodCostPercent = math.Round((r.CostPerServing/r.SellingPrice)*10000) / 100
		r.GrossMargin = math.Round((r.SellingPrice-r.CostPerServing)*100) / 100
		r.GrossMarginPercent = math.Round((100.0-r.FoodCostPercent)*100) / 100
	} else {
		r.FoodCostPercent = 0
		r.GrossMargin = 0
		r.GrossMarginPercent = 0
	}
}

// Supplier represents an approved vendor supplying food and beverage ingredients.
type Supplier struct {
	ID                 bson.ObjectID `bson:"_id,omitempty" json:"id"`
	TenantID           bson.ObjectID `bson:"tenantId" json:"tenantId"`
	Name               string        `bson:"name" json:"name"`
	ContactPerson      string        `bson:"contactPerson,omitempty" json:"contactPerson,omitempty"`
	Phone              string        `bson:"phone,omitempty" json:"phone,omitempty"`
	Email              string        `bson:"email,omitempty" json:"email,omitempty"`
	Address            string        `bson:"address,omitempty" json:"address,omitempty"`
	GSTIN              string        `bson:"gstin,omitempty" json:"gstin,omitempty"`
	PaymentTerms       string        `bson:"paymentTerms,omitempty" json:"paymentTerms,omitempty"`
	Notes              string        `bson:"notes,omitempty" json:"notes,omitempty"`
	SuppliedCategories []string      `bson:"suppliedCategories,omitempty" json:"suppliedCategories,omitempty"`
	TotalPurchases     float64       `bson:"totalPurchases" json:"totalPurchases"`
	OutstandingBalance float64       `bson:"outstandingBalance" json:"outstandingBalance"`
	IsActive           bool          `bson:"isActive" json:"isActive"`
	CreatedAt          time.Time     `bson:"createdAt" json:"createdAt"`
	UpdatedAt          time.Time     `bson:"updatedAt" json:"updatedAt"`
}

// POItem is an item within a Purchase Order.
type POItem struct {
	InventoryItemID  bson.ObjectID `bson:"inventoryItemId" json:"inventoryItemId"`
	ItemName         string        `bson:"itemName" json:"itemName"`
	SKU              string        `bson:"sku,omitempty" json:"sku,omitempty"`
	OrderUnit        string        `bson:"orderUnit" json:"orderUnit"`
	OrderQuantity    float64       `bson:"orderQuantity" json:"orderQuantity"`
	ConversionFactor float64       `bson:"conversionFactor" json:"conversionFactor"`
	BaseQuantity     float64       `bson:"baseQuantity" json:"baseQuantity"` // OrderQuantity * ConversionFactor
	UnitPrice        float64       `bson:"unitPrice" json:"unitPrice"`       // Price per OrderUnit
	TaxRatePercent   float64       `bson:"taxRatePercent" json:"taxRatePercent"`
	TaxAmount        float64       `bson:"taxAmount" json:"taxAmount"`
	DiscountAmount   float64       `bson:"discountAmount" json:"discountAmount"`
	TotalPrice       float64       `bson:"totalPrice" json:"totalPrice"`
	ReceivedQuantity float64       `bson:"receivedQuantity" json:"receivedQuantity"`
	RejectedQuantity float64       `bson:"rejectedQuantity" json:"rejectedQuantity"`
}

// PurchaseOrder represents an official PO issued to a supplier.
type PurchaseOrder struct {
	ID                   bson.ObjectID  `bson:"_id,omitempty" json:"id"`
	TenantID             bson.ObjectID  `bson:"tenantId" json:"tenantId"`
	OutletID             *bson.ObjectID `bson:"outletId,omitempty" json:"outletId,omitempty"`
	PONumber             string         `bson:"poNumber" json:"poNumber"`
	SupplierID           bson.ObjectID  `bson:"supplierId" json:"supplierId"`
	SupplierName         string         `bson:"supplierName" json:"supplierName"`
	Items                []POItem       `bson:"items" json:"items"`
	Subtotal             float64        `bson:"subtotal" json:"subtotal"`
	TaxAmount            float64        `bson:"taxAmount" json:"taxAmount"`
	ShippingCost         float64        `bson:"shippingCost" json:"shippingCost"`
	TotalAmount          float64        `bson:"totalAmount" json:"totalAmount"`
	Status               POStatus       `bson:"status" json:"status"`
	ExpectedDeliveryDate *time.Time     `bson:"expectedDeliveryDate,omitempty" json:"expectedDeliveryDate,omitempty"`
	Notes                string         `bson:"notes,omitempty" json:"notes,omitempty"`
	ApprovedBy           *bson.ObjectID `bson:"approvedBy,omitempty" json:"approvedBy,omitempty"`
	ApprovedAt           *time.Time     `bson:"approvedAt,omitempty" json:"approvedAt,omitempty"`
	CreatedBy            bson.ObjectID  `bson:"createdBy" json:"createdBy"`
	CreatedByName        string         `bson:"createdByName,omitempty" json:"createdByName,omitempty"`
	CreatedAt            time.Time      `bson:"createdAt" json:"createdAt"`
	UpdatedAt            time.Time      `bson:"updatedAt" json:"updatedAt"`
}

// GRNItem is an item received against a Goods Received Note.
type GRNItem struct {
	InventoryItemID  bson.ObjectID `bson:"inventoryItemId" json:"inventoryItemId"`
	ItemName         string        `bson:"itemName" json:"itemName"`
	ReceivedQuantity float64       `bson:"receivedQuantity" json:"receivedQuantity"`
	RejectedQuantity float64       `bson:"rejectedQuantity" json:"rejectedQuantity"`
	Unit             string        `bson:"unit" json:"unit"`
	UnitCost         float64       `bson:"unitCost" json:"unitCost"` // Per received unit
	BatchNumber      string        `bson:"batchNumber,omitempty" json:"batchNumber,omitempty"`
	MfgDate          *time.Time    `bson:"mfgDate,omitempty" json:"mfgDate,omitempty"`
	ExpiryDate       *time.Time    `bson:"expiryDate,omitempty" json:"expiryDate,omitempty"`
	StorageLocation  string        `bson:"storageLocation,omitempty" json:"storageLocation,omitempty"`
	RejectionReason  string        `bson:"rejectionReason,omitempty" json:"rejectionReason,omitempty"`
}

// GoodsReceivedNote records delivery receipts and updates stock balances and weighted average costs.
type GoodsReceivedNote struct {
	ID              bson.ObjectID  `bson:"_id,omitempty" json:"id"`
	TenantID        bson.ObjectID  `bson:"tenantId" json:"tenantId"`
	OutletID        *bson.ObjectID `bson:"outletId,omitempty" json:"outletId,omitempty"`
	GRNNumber       string         `bson:"grnNumber" json:"grnNumber"`
	PurchaseOrderID *bson.ObjectID `bson:"purchaseOrderId,omitempty" json:"purchaseOrderId,omitempty"`
	PONumber        string         `bson:"poNumber,omitempty" json:"poNumber,omitempty"`
	SupplierID      bson.ObjectID  `bson:"supplierId" json:"supplierId"`
	SupplierName    string         `bson:"supplierName" json:"supplierName"`
	InvoiceNumber   string         `bson:"invoiceNumber,omitempty" json:"invoiceNumber,omitempty"`
	InvoiceDate     *time.Time     `bson:"invoiceDate,omitempty" json:"invoiceDate,omitempty"`
	Items           []GRNItem      `bson:"items" json:"items"`
	TotalValue      float64        `bson:"totalValue" json:"totalValue"`
	ReceivedBy      bson.ObjectID  `bson:"receivedBy" json:"receivedBy"`
	ReceivedByName  string         `bson:"receivedByName,omitempty" json:"receivedByName,omitempty"`
	Notes           string         `bson:"notes,omitempty" json:"notes,omitempty"`
	ReceivedAt      time.Time      `bson:"receivedAt" json:"receivedAt"`
}

// StockMovement is an immutable audit log entry for every stock balance alteration.
type StockMovement struct {
	ID                  bson.ObjectID  `bson:"_id,omitempty" json:"id"`
	TenantID            bson.ObjectID  `bson:"tenantId" json:"tenantId"`
	OutletID            *bson.ObjectID `bson:"outletId,omitempty" json:"outletId,omitempty"`
	InventoryItemID     bson.ObjectID  `bson:"inventoryItemId" json:"inventoryItemId"`
	ItemName            string         `bson:"itemName" json:"itemName"`
	MovementType        MovementType   `bson:"movementType" json:"movementType"`
	Quantity            float64        `bson:"quantity" json:"quantity"` // delta (positive or negative)
	Unit                string         `bson:"unit" json:"unit"`
	PreviousQuantity    float64        `bson:"previousQuantity" json:"previousQuantity"`
	NewQuantity         float64        `bson:"newQuantity" json:"newQuantity"`
	UnitCost            float64        `bson:"unitCost" json:"unitCost"`
	TotalCost           float64        `bson:"totalCost" json:"totalCost"`
	BatchNumber         string         `bson:"batchNumber,omitempty" json:"batchNumber,omitempty"`
	SourceLocation      string         `bson:"sourceLocation,omitempty" json:"sourceLocation,omitempty"`
	DestinationLocation string         `bson:"destinationLocation,omitempty" json:"destinationLocation,omitempty"`
	ReferenceType       string         `bson:"referenceType,omitempty" json:"referenceType,omitempty"`
	ReferenceID         string         `bson:"referenceId,omitempty" json:"referenceId,omitempty"`
	Reason              string         `bson:"reason,omitempty" json:"reason,omitempty"`
	PerformedBy         bson.ObjectID  `bson:"performedBy,omitempty" json:"performedBy,omitempty"`
	PerformedByName     string         `bson:"performedByName,omitempty" json:"performedByName,omitempty"`
	Timestamp           time.Time      `bson:"timestamp" json:"timestamp"`
}

// StockCountItem is an item within a physical stocktaking audit.
type StockCountItem struct {
	InventoryItemID  bson.ObjectID `bson:"inventoryItemId" json:"inventoryItemId"`
	ItemName         string        `bson:"itemName" json:"itemName"`
	BaseUnit         string        `bson:"baseUnit" json:"baseUnit"`
	SystemQuantity   float64       `bson:"systemQuantity" json:"systemQuantity"`
	PhysicalQuantity float64       `bson:"physicalQuantity" json:"physicalQuantity"`
	QuantityVariance float64       `bson:"quantityVariance" json:"quantityVariance"` // Physical - System
	UnitCost         float64       `bson:"unitCost" json:"unitCost"`
	ValueVariance    float64       `bson:"valueVariance" json:"valueVariance"` // QuantityVariance * UnitCost
	VarianceReason   string        `bson:"varianceReason,omitempty" json:"varianceReason,omitempty"`
}

// StockCount represents a physical inventory reconciliation session.
type StockCount struct {
	ID                 bson.ObjectID    `bson:"_id,omitempty" json:"id"`
	TenantID           bson.ObjectID    `bson:"tenantId" json:"tenantId"`
	OutletID           *bson.ObjectID   `bson:"outletId,omitempty" json:"outletId,omitempty"`
	CountNumber        string           `bson:"countNumber" json:"countNumber"`
	Name               string           `bson:"name" json:"name"`
	Categories         []string         `bson:"categories,omitempty" json:"categories,omitempty"`
	StorageLocation    string           `bson:"storageLocation,omitempty" json:"storageLocation,omitempty"`
	Items              []StockCountItem `bson:"items" json:"items"`
	TotalValueVariance float64          `bson:"totalValueVariance" json:"totalValueVariance"`
	Status             StockCountStatus `bson:"status" json:"status"`
	ConductedBy        bson.ObjectID    `bson:"conductedBy,omitempty" json:"conductedBy,omitempty"`
	ApprovedBy         *bson.ObjectID   `bson:"approvedBy,omitempty" json:"approvedBy,omitempty"`
	ApprovedAt         *time.Time       `bson:"approvedAt,omitempty" json:"approvedAt,omitempty"`
	CreatedAt          time.Time        `bson:"createdAt" json:"createdAt"`
	UpdatedAt          time.Time        `bson:"updatedAt" json:"updatedAt"`
}

// TransferItem is an item transferred between outlets/departments.
type TransferItem struct {
	InventoryItemID    bson.ObjectID `bson:"inventoryItemId" json:"inventoryItemId"`
	ItemName           string        `bson:"itemName" json:"itemName"`
	RequestedQuantity  float64       `bson:"requestedQuantity" json:"requestedQuantity"`
	DispatchedQuantity float64       `bson:"dispatchedQuantity" json:"dispatchedQuantity"`
	ReceivedQuantity   float64       `bson:"receivedQuantity" json:"receivedQuantity"`
	Unit               string        `bson:"unit" json:"unit"`
	UnitCost           float64       `bson:"unitCost" json:"unitCost"`
	Discrepancy        float64       `bson:"discrepancy" json:"discrepancy"` // Received - Dispatched
	DiscrepancyReason  string        `bson:"discrepancyReason,omitempty" json:"discrepancyReason,omitempty"`
}

// StockTransfer tracks inter-outlet stock movement and transit variances.
type StockTransfer struct {
	ID                    bson.ObjectID  `bson:"_id,omitempty" json:"id"`
	TenantID              bson.ObjectID  `bson:"tenantId" json:"tenantId"`
	TransferNumber        string         `bson:"transferNumber" json:"transferNumber"`
	SourceOutletID        bson.ObjectID  `bson:"sourceOutletId" json:"sourceOutletId"`
	SourceOutletName      string         `bson:"sourceOutletName" json:"sourceOutletName"`
	DestinationOutletID   bson.ObjectID  `bson:"destinationOutletId" json:"destinationOutletId"`
	DestinationOutletName string         `bson:"destinationOutletName" json:"destinationOutletName"`
	Items                 []TransferItem `bson:"items" json:"items"`
	Status                TransferStatus `bson:"status" json:"status"`
	RequestedBy           bson.ObjectID  `bson:"requestedBy,omitempty" json:"requestedBy,omitempty"`
	DispatchedBy          *bson.ObjectID `bson:"dispatchedBy,omitempty" json:"dispatchedBy,omitempty"`
	ReceivedBy            *bson.ObjectID `bson:"receivedBy,omitempty" json:"receivedBy,omitempty"`
	Notes                 string         `bson:"notes,omitempty" json:"notes,omitempty"`
	CreatedAt             time.Time      `bson:"createdAt" json:"createdAt"`
	UpdatedAt             time.Time      `bson:"updatedAt" json:"updatedAt"`
}

// Outlet represents a restaurant kitchen, bar, central warehouse, or floor pantry.
type Outlet struct {
	ID         bson.ObjectID `bson:"_id,omitempty" json:"id"`
	TenantID   bson.ObjectID `bson:"tenantId" json:"tenantId"`
	Name       string        `bson:"name" json:"name"`
	Code       string        `bson:"code" json:"code"`
	Department string        `bson:"department,omitempty" json:"department,omitempty"`
	IsPrimary  bool          `bson:"isPrimary" json:"isPrimary"`
	IsActive   bool          `bson:"isActive" json:"isActive"`
	CreatedAt  time.Time     `bson:"createdAt" json:"createdAt"`
}

// InventorySettings defines tenant-level automation policies for inventory operations.
type InventorySettings struct {
	ID                     bson.ObjectID        `bson:"_id,omitempty" json:"id"`
	TenantID               bson.ObjectID        `bson:"tenantId" json:"tenantId"`
	DeductionTrigger       DeductionTriggerType `bson:"deductionTrigger" json:"deductionTrigger"`
	AllowNegativeStock     bool                 `bson:"allowNegativeStock" json:"allowNegativeStock"`
	StrictStockEnforcement bool                 `bson:"strictStockEnforcement" json:"strictStockEnforcement"`
	Auto86OnZeroStock      bool                 `bson:"auto86OnZeroStock" json:"auto86OnZeroStock"`
	ExpiryAlertDays        int                  `bson:"expiryAlertDays" json:"expiryAlertDays"`
	ReversalPolicy         string               `bson:"reversalPolicy" json:"reversalPolicy"` // return_to_stock, write_off
	UpdatedAt              time.Time            `bson:"updatedAt" json:"updatedAt"`
}

// DeductionItemRecord logs an individual deduction within an order deduction audit log.
type DeductionItemRecord struct {
	MenuItemID        bson.ObjectID `bson:"menuItemId" json:"menuItemId"`
	MenuItemName      string        `bson:"menuItemName" json:"menuItemName"`
	InventoryItemID   bson.ObjectID `bson:"inventoryItemId" json:"inventoryItemId"`
	InventoryItemName string        `bson:"inventoryItemName" json:"inventoryItemName"`
	QuantityDeducted  float64       `bson:"quantityDeducted" json:"quantityDeducted"`
	Unit              string        `bson:"unit" json:"unit"`
}

// OrderDeductionRecord guarantees idempotency for order ingredient consumption.
type OrderDeductionRecord struct {
	ID          bson.ObjectID         `bson:"_id,omitempty" json:"id"`
	TenantID    bson.ObjectID         `bson:"tenantId" json:"tenantId"`
	OrderID     bson.ObjectID         `bson:"orderId" json:"orderId"`
	OrderNumber string                `bson:"orderNumber" json:"orderNumber"`
	Trigger     string                `bson:"trigger" json:"trigger"`
	DeductedAt  time.Time             `bson:"deductedAt" json:"deductedAt"`
	Items       []DeductionItemRecord `bson:"items" json:"items"`
}

func (s *InventorySettings) Validate() error {
	if s.TenantID.IsZero() {
		return errors.New("tenantId is required")
	}
	if s.ExpiryAlertDays <= 0 {
		s.ExpiryAlertDays = 7
	}
	if s.DeductionTrigger == "" {
		s.DeductionTrigger = DeductionOnOrderPreparing
	}
	if s.ReversalPolicy == "" {
		s.ReversalPolicy = "return_to_stock"
	}
	return nil
}
