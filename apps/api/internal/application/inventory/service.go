package inventory

import (
	"context"
	"errors"
	"fmt"
	"math"
	"strings"
	"time"

	domaininv "github.com/dineflow/api/internal/domain/inventory"
	domainorder "github.com/dineflow/api/internal/domain/order"
	mongoinfra "github.com/dineflow/api/internal/infrastructure/mongodb"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type Service struct {
	db *mongoinfra.Client
}

func NewService(db *mongoinfra.Client) *Service {
	return &Service{db: db}
}

// ─── Inventory Items ────────────────────────────────────────────────────────

type CreateItemInput struct {
	OutletID            *string            `json:"outletId,omitempty"`
	Name                string             `json:"name"`
	SKU                 string             `json:"sku"`
	Barcode             string             `json:"barcode,omitempty"`
	Description         string             `json:"description,omitempty"`
	Category            string             `json:"category"`
	ItemType            domaininv.ItemType `json:"itemType"`
	Brand               string             `json:"brand,omitempty"`
	ImageURL            string             `json:"imageUrl,omitempty"`
	BaseUnit            string             `json:"baseUnit"`
	PurchaseUnit        string             `json:"purchaseUnit"`
	ConversionFactor    float64            `json:"conversionFactor"`
	CurrentQuantity     float64            `json:"currentQuantity"`
	MinStockLevel       float64            `json:"minStockLevel"`
	ReorderQuantity     float64            `json:"reorderQuantity"`
	MaxStockLevel       float64            `json:"maxStockLevel"`
	AvgPurchaseCost     float64            `json:"avgPurchaseCost"`
	LastPurchasePrice   float64            `json:"lastPurchasePrice"`
	PreferredSupplierID *string            `json:"preferredSupplierId,omitempty"`
	StorageLocation     string             `json:"storageLocation,omitempty"`
	Department          string             `json:"department,omitempty"`
	ExpiryTracking      bool               `json:"expiryTracking"`
	BatchTracking       bool               `json:"batchTracking"`
}

func (s *Service) CreateItem(ctx context.Context, tenantID bson.ObjectID, input CreateItemInput) (*domaininv.InventoryItem, error) {
	name := strings.TrimSpace(input.Name)
	if name == "" {
		return nil, errors.New("item name is required")
	}
	baseUnit := domaininv.NormalizeUnit(input.BaseUnit)
	if baseUnit == "" {
		return nil, errors.New("baseUnit is required")
	}
	purchUnit := domaininv.NormalizeUnit(input.PurchaseUnit)
	if purchUnit == "" {
		purchUnit = baseUnit
	}
	factor := input.ConversionFactor
	if factor <= 0 {
		factor = 1.0
	}

	sku := strings.TrimSpace(input.SKU)
	if sku == "" {
		sku = fmt.Sprintf("SKU-%d", time.Now().Unix()%100000)
	}

	var outletOID *bson.ObjectID
	if input.OutletID != nil && *input.OutletID != "" {
		if oid, err := bson.ObjectIDFromHex(*input.OutletID); err == nil {
			outletOID = &oid
		}
	}

	var suppOID *bson.ObjectID
	if input.PreferredSupplierID != nil && *input.PreferredSupplierID != "" {
		if oid, err := bson.ObjectIDFromHex(*input.PreferredSupplierID); err == nil {
			suppOID = &oid
		}
	}

	now := time.Now().UTC()
	item := &domaininv.InventoryItem{
		ID:                  bson.NewObjectID(),
		TenantID:            tenantID,
		OutletID:            outletOID,
		Name:                name,
		SKU:                 sku,
		Barcode:             input.Barcode,
		Description:         input.Description,
		Category:            input.Category,
		ItemType:            input.ItemType,
		Brand:               input.Brand,
		ImageURL:            input.ImageURL,
		BaseUnit:            baseUnit,
		PurchaseUnit:        purchUnit,
		ConversionFactor:    factor,
		CurrentQuantity:     input.CurrentQuantity,
		MinStockLevel:       input.MinStockLevel,
		ReorderQuantity:     input.ReorderQuantity,
		MaxStockLevel:       input.MaxStockLevel,
		AvgPurchaseCost:     input.AvgPurchaseCost,
		LastPurchasePrice:   input.LastPurchasePrice,
		PreferredSupplierID: suppOID,
		StorageLocation:     input.StorageLocation,
		Department:          input.Department,
		ExpiryTracking:      input.ExpiryTracking,
		BatchTracking:       input.BatchTracking,
		IsArchived:          false,
		CreatedAt:           now,
		UpdatedAt:           now,
	}

	coll := s.db.Collection("inventory_items")
	if _, err := coll.InsertOne(ctx, item); err != nil {
		return nil, err
	}

	// If initial quantity > 0, log opening stock movement
	if item.CurrentQuantity > 0 {
		_ = s.logMovement(ctx, tenantID, item.ID, item.Name, item.OutletID, domaininv.MovementOpeningStock,
			item.CurrentQuantity, item.BaseUnit, 0, item.CurrentQuantity, item.AvgPurchaseCost,
			item.CurrentQuantity*item.AvgPurchaseCost, "", "", "", "initial_setup", item.ID.Hex(), "Initial opening stock balance", bson.NilObjectID, "System")
	}

	return item, nil
}

func (s *Service) GetItem(ctx context.Context, tenantID, itemID bson.ObjectID) (*domaininv.InventoryItem, error) {
	var item domaininv.InventoryItem
	err := s.db.Collection("inventory_items").FindOne(ctx, bson.M{
		"_id":      itemID,
		"tenantId": tenantID,
	}).Decode(&item)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

type ListItemsFilter struct {
	Category   string
	ItemType   string
	LowStock   bool
	Search     string
	IsArchived *bool
}

func (s *Service) ListItems(ctx context.Context, tenantID bson.ObjectID, filter ListItemsFilter) ([]domaininv.InventoryItem, error) {
	q := bson.M{"tenantId": tenantID}
	if filter.Category != "" {
		q["category"] = filter.Category
	}
	if filter.ItemType != "" {
		q["itemType"] = filter.ItemType
	}
	if filter.IsArchived != nil {
		q["isArchived"] = *filter.IsArchived
	} else {
		q["isArchived"] = false
	}
	if filter.Search != "" {
		q["$or"] = []bson.M{
			{"name": bson.M{"$regex": filter.Search, "$options": "i"}},
			{"sku": bson.M{"$regex": filter.Search, "$options": "i"}},
			{"barcode": bson.M{"$regex": filter.Search, "$options": "i"}},
		}
	}

	opts := options.Find().SetSort(bson.D{{Key: "name", Value: 1}})
	cursor, err := s.db.Collection("inventory_items").Find(ctx, q, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var items []domaininv.InventoryItem
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}
	if items == nil {
		items = []domaininv.InventoryItem{}
	}

	if filter.LowStock {
		var filtered []domaininv.InventoryItem
		for _, item := range items {
			if item.IsLowStock() {
				filtered = append(filtered, item)
			}
		}
		return filtered, nil
	}

	return items, nil
}

func (s *Service) UpdateItem(ctx context.Context, tenantID, itemID bson.ObjectID, input CreateItemInput) (*domaininv.InventoryItem, error) {
	now := time.Now().UTC()
	setFields := bson.M{
		"name":            input.Name,
		"category":        input.Category,
		"itemType":        input.ItemType,
		"brand":           input.Brand,
		"imageUrl":        input.ImageURL,
		"description":     input.Description,
		"minStockLevel":   input.MinStockLevel,
		"reorderQuantity": input.ReorderQuantity,
		"maxStockLevel":   input.MaxStockLevel,
		"storageLocation": input.StorageLocation,
		"department":      input.Department,
		"expiryTracking":  input.ExpiryTracking,
		"batchTracking":   input.BatchTracking,
		"updatedAt":       now,
	}

	if input.SKU != "" {
		setFields["sku"] = input.SKU
	}
	if input.Barcode != "" {
		setFields["barcode"] = input.Barcode
	}
	if input.BaseUnit != "" {
		setFields["baseUnit"] = domaininv.NormalizeUnit(input.BaseUnit)
	}
	if input.PurchaseUnit != "" {
		setFields["purchaseUnit"] = domaininv.NormalizeUnit(input.PurchaseUnit)
	}
	if input.ConversionFactor > 0 {
		setFields["conversionFactor"] = input.ConversionFactor
	}
	if input.PreferredSupplierID != nil && *input.PreferredSupplierID != "" {
		if oid, err := bson.ObjectIDFromHex(*input.PreferredSupplierID); err == nil {
			setFields["preferredSupplierId"] = oid
		}
	}

	_, err := s.db.Collection("inventory_items").UpdateOne(ctx,
		bson.M{"_id": itemID, "tenantId": tenantID},
		bson.M{"$set": setFields},
	)
	if err != nil {
		return nil, err
	}
	return s.GetItem(ctx, tenantID, itemID)
}

func (s *Service) DeleteItem(ctx context.Context, tenantID, itemID bson.ObjectID) error {
	// Soft delete / archive item to preserve audit trail
	_, err := s.db.Collection("inventory_items").UpdateOne(ctx,
		bson.M{"_id": itemID, "tenantId": tenantID},
		bson.M{"$set": bson.M{"isArchived": true, "updatedAt": time.Now().UTC()}},
	)
	return err
}

func (s *Service) AdjustStock(ctx context.Context, tenantID, itemID bson.ObjectID, delta float64, unit, reason, refType, refID string, userOID bson.ObjectID, userName string) (*domaininv.InventoryItem, error) {
	item, err := s.GetItem(ctx, tenantID, itemID)
	if err != nil {
		return nil, err
	}

	// Convert delta to base unit if necessary
	baseDelta := delta
	if unit != "" && domaininv.NormalizeUnit(unit) != item.BaseUnit {
		conv, cErr := domaininv.ConvertQuantity(delta, unit, item.BaseUnit, item.ConversionFactor)
		if cErr != nil {
			return nil, cErr
		}
		baseDelta = conv
	}

	newQty := math.Round((item.CurrentQuantity+baseDelta)*1000) / 1000

	settings, _ := s.GetSettings(ctx, tenantID)
	if newQty < 0 && !settings.AllowNegativeStock {
		return nil, fmt.Errorf("insufficient stock for '%s' (current: %.2f %s, requested reduction: %.2f %s)",
			item.Name, item.CurrentQuantity, item.BaseUnit, math.Abs(baseDelta), item.BaseUnit)
	}

	now := time.Now().UTC()
	_, err = s.db.Collection("inventory_items").UpdateOne(ctx,
		bson.M{"_id": itemID, "tenantId": tenantID},
		bson.M{
			"$inc": bson.M{"currentQuantity": baseDelta},
			"$set": bson.M{"updatedAt": now},
		},
	)
	if err != nil {
		return nil, err
	}

	movType := domaininv.MovementCorrection
	if baseDelta < 0 {
		if strings.Contains(strings.ToLower(reason), "waste") {
			movType = domaininv.MovementWastage
		} else if strings.Contains(strings.ToLower(reason), "damage") {
			movType = domaininv.MovementDamaged
		} else if strings.Contains(strings.ToLower(reason), "expire") {
			movType = domaininv.MovementExpired
		}
	}

	_ = s.logMovement(ctx, tenantID, item.ID, item.Name, item.OutletID, movType,
		baseDelta, item.BaseUnit, item.CurrentQuantity, newQty, item.AvgPurchaseCost,
		math.Abs(baseDelta)*item.AvgPurchaseCost, "", "", "", refType, refID, reason, userOID, userName)

	// Auto 86 on zero stock check
	if settings.Auto86OnZeroStock && newQty <= 0 {
		s.checkAndTriggerAuto86(ctx, tenantID, item.ID)
	}

	return s.GetItem(ctx, tenantID, itemID)
}

// ─── Recipes & Costing ──────────────────────────────────────────────────────

type CreateRecipeInput struct {
	MenuItemID    string                       `json:"menuItemId"`
	MenuItemName  string                       `json:"menuItemName"`
	Name          string                       `json:"name"`
	YieldServings float64                      `json:"yieldServings"`
	SellingPrice  float64                      `json:"sellingPrice"`
	Notes         string                       `json:"notes,omitempty"`
	Ingredients   []domaininv.RecipeIngredient `json:"ingredients"`
}

func (s *Service) CreateRecipe(ctx context.Context, tenantID bson.ObjectID, input CreateRecipeInput) (*domaininv.Recipe, error) {
	menuOID, err := bson.ObjectIDFromHex(input.MenuItemID)
	if err != nil {
		return nil, errors.New("invalid menuItemId")
	}

	// Deactivate any existing active recipe for this menu item
	_, _ = s.db.Collection("recipes").UpdateMany(ctx,
		bson.M{"tenantId": tenantID, "menuItemId": menuOID},
		bson.M{"$set": bson.M{"isActive": false, "updatedAt": time.Now().UTC()}},
	)

	// Fetch item costs from inventory items
	for i := range input.Ingredients {
		ing := &input.Ingredients[i]
		if invItem, err := s.GetItem(ctx, tenantID, ing.InventoryItemID); err == nil {
			ing.InventoryItemName = invItem.Name
			// Convert cost from baseUnit to recipe ingredient unit
			costPerBase := invItem.AvgPurchaseCost
			if costPerBase <= 0 {
				costPerBase = invItem.LastPurchasePrice
			}
			// Recipe unit cost
			factor := invItem.ConversionFactor
			if factor <= 0 {
				factor = 1.0
			}
			convFactor, cErr := domaininv.ConvertQuantity(1.0, ing.Unit, invItem.BaseUnit, factor)
			if cErr == nil {
				ing.UnitCost = convFactor * costPerBase
			} else {
				ing.UnitCost = costPerBase
			}
		}
	}

	now := time.Now().UTC()
	rec := &domaininv.Recipe{
		ID:            bson.NewObjectID(),
		TenantID:      tenantID,
		MenuItemID:    menuOID,
		MenuItemName:  input.MenuItemName,
		Name:          input.Name,
		YieldServings: input.YieldServings,
		Ingredients:   input.Ingredients,
		SellingPrice:  input.SellingPrice,
		Version:       1,
		IsActive:      true,
		Notes:         input.Notes,
		CreatedAt:     now,
		UpdatedAt:     now,
	}
	rec.Recalculate()

	_, err = s.db.Collection("recipes").InsertOne(ctx, rec)
	if err != nil {
		return nil, err
	}
	return rec, nil
}

func (s *Service) GetRecipe(ctx context.Context, tenantID, recipeID bson.ObjectID) (*domaininv.Recipe, error) {
	var rec domaininv.Recipe
	err := s.db.Collection("recipes").FindOne(ctx, bson.M{
		"_id":      recipeID,
		"tenantId": tenantID,
	}).Decode(&rec)
	if err != nil {
		return nil, err
	}
	return &rec, nil
}

func (s *Service) GetRecipeByMenuItem(ctx context.Context, tenantID, menuItemID bson.ObjectID) (*domaininv.Recipe, error) {
	var rec domaininv.Recipe
	err := s.db.Collection("recipes").FindOne(ctx, bson.M{
		"tenantId":   tenantID,
		"menuItemId": menuItemID,
		"isActive":   true,
	}).Decode(&rec)
	if err != nil {
		return nil, err
	}
	return &rec, nil
}

func (s *Service) ListRecipes(ctx context.Context, tenantID bson.ObjectID) ([]domaininv.Recipe, error) {
	cursor, err := s.db.Collection("recipes").Find(ctx, bson.M{
		"tenantId": tenantID,
		"isActive": true,
	}, options.Find().SetSort(bson.D{{Key: "name", Value: 1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var list []domaininv.Recipe
	if err := cursor.All(ctx, &list); err != nil {
		return nil, err
	}
	if list == nil {
		list = []domaininv.Recipe{}
	}
	return list, nil
}

func (s *Service) DeleteRecipe(ctx context.Context, tenantID, recipeID bson.ObjectID) error {
	_, err := s.db.Collection("recipes").UpdateOne(ctx,
		bson.M{"_id": recipeID, "tenantId": tenantID},
		bson.M{"$set": bson.M{"isActive": false, "updatedAt": time.Now().UTC()}},
	)
	return err
}

// ─── Suppliers ──────────────────────────────────────────────────────────────

func (s *Service) CreateSupplier(ctx context.Context, tenantID bson.ObjectID, input domaininv.Supplier) (*domaininv.Supplier, error) {
	if strings.TrimSpace(input.Name) == "" {
		return nil, errors.New("supplier name is required")
	}
	now := time.Now().UTC()
	input.ID = bson.NewObjectID()
	input.TenantID = tenantID
	input.IsActive = true
	input.CreatedAt = now
	input.UpdatedAt = now

	_, err := s.db.Collection("suppliers").InsertOne(ctx, input)
	if err != nil {
		return nil, err
	}
	return &input, nil
}

func (s *Service) GetSupplier(ctx context.Context, tenantID, supplierID bson.ObjectID) (*domaininv.Supplier, error) {
	var supp domaininv.Supplier
	err := s.db.Collection("suppliers").FindOne(ctx, bson.M{
		"_id":      supplierID,
		"tenantId": tenantID,
	}).Decode(&supp)
	if err != nil {
		return nil, err
	}
	return &supp, nil
}

func (s *Service) ListSuppliers(ctx context.Context, tenantID bson.ObjectID) ([]domaininv.Supplier, error) {
	cursor, err := s.db.Collection("suppliers").Find(ctx, bson.M{
		"tenantId": tenantID,
		"isActive": true,
	}, options.Find().SetSort(bson.D{{Key: "name", Value: 1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var list []domaininv.Supplier
	if err := cursor.All(ctx, &list); err != nil {
		return nil, err
	}
	if list == nil {
		list = []domaininv.Supplier{}
	}
	return list, nil
}

func (s *Service) UpdateSupplier(ctx context.Context, tenantID, supplierID bson.ObjectID, input domaininv.Supplier) (*domaininv.Supplier, error) {
	now := time.Now().UTC()
	update := bson.M{
		"$set": bson.M{
			"name":               input.Name,
			"contactPerson":      input.ContactPerson,
			"phone":              input.Phone,
			"email":              input.Email,
			"address":            input.Address,
			"gstin":              input.GSTIN,
			"paymentTerms":       input.PaymentTerms,
			"notes":              input.Notes,
			"suppliedCategories": input.SuppliedCategories,
			"updatedAt":          now,
		},
	}
	_, err := s.db.Collection("suppliers").UpdateOne(ctx,
		bson.M{"_id": supplierID, "tenantId": tenantID},
		update,
	)
	if err != nil {
		return nil, err
	}
	return s.GetSupplier(ctx, tenantID, supplierID)
}

func (s *Service) DeleteSupplier(ctx context.Context, tenantID, supplierID bson.ObjectID) error {
	_, err := s.db.Collection("suppliers").UpdateOne(ctx,
		bson.M{"_id": supplierID, "tenantId": tenantID},
		bson.M{"$set": bson.M{"isActive": false, "updatedAt": time.Now().UTC()}},
	)
	return err
}

// ─── Purchase Orders & Goods Received Notes ─────────────────────────────────

type CreatePOInput struct {
	OutletID             *string            `json:"outletId,omitempty"`
	SupplierID           string             `json:"supplierId"`
	ExpectedDeliveryDate *time.Time         `json:"expectedDeliveryDate,omitempty"`
	ShippingCost         float64            `json:"shippingCost,omitempty"`
	Notes                string             `json:"notes,omitempty"`
	Items                []domaininv.POItem `json:"items"`
}

func (s *Service) CreatePO(ctx context.Context, tenantID bson.ObjectID, userOID bson.ObjectID, userName string, input CreatePOInput) (*domaininv.PurchaseOrder, error) {
	suppOID, err := bson.ObjectIDFromHex(input.SupplierID)
	if err != nil {
		return nil, errors.New("invalid supplierId")
	}
	supp, err := s.GetSupplier(ctx, tenantID, suppOID)
	if err != nil {
		return nil, errors.New("supplier not found")
	}

	var outletOID *bson.ObjectID
	if input.OutletID != nil && *input.OutletID != "" {
		if oid, err := bson.ObjectIDFromHex(*input.OutletID); err == nil {
			outletOID = &oid
		}
	}

	now := time.Now().UTC()
	poNumber := fmt.Sprintf("PO-%s-%04d", now.Format("20060102"), time.Now().Unix()%10000)

	var subtotal, totalTax float64
	for i := range input.Items {
		item := &input.Items[i]
		if item.ConversionFactor <= 0 {
			item.ConversionFactor = 1.0
		}
		item.BaseQuantity = item.OrderQuantity * item.ConversionFactor
		lineNet := (item.OrderQuantity * item.UnitPrice) - item.DiscountAmount
		if item.TaxRatePercent > 0 {
			item.TaxAmount = math.Round((lineNet*(item.TaxRatePercent/100.0))*100) / 100
		}
		item.TotalPrice = math.Round((lineNet+item.TaxAmount)*100) / 100
		subtotal += lineNet
		totalTax += item.TaxAmount
	}

	totalAmount := math.Round((subtotal+totalTax+input.ShippingCost)*100) / 100

	po := &domaininv.PurchaseOrder{
		ID:                   bson.NewObjectID(),
		TenantID:             tenantID,
		OutletID:             outletOID,
		PONumber:             poNumber,
		SupplierID:           supp.ID,
		SupplierName:         supp.Name,
		Items:                input.Items,
		Subtotal:             subtotal,
		TaxAmount:            totalTax,
		ShippingCost:         input.ShippingCost,
		TotalAmount:          totalAmount,
		Status:               domaininv.POStatusDraft,
		ExpectedDeliveryDate: input.ExpectedDeliveryDate,
		Notes:                input.Notes,
		CreatedBy:            userOID,
		CreatedByName:        userName,
		CreatedAt:            now,
		UpdatedAt:            now,
	}

	_, err = s.db.Collection("purchase_orders").InsertOne(ctx, po)
	if err != nil {
		return nil, err
	}
	return po, nil
}

func (s *Service) ApprovePO(ctx context.Context, tenantID, poID, approverOID bson.ObjectID) (*domaininv.PurchaseOrder, error) {
	now := time.Now().UTC()
	_, err := s.db.Collection("purchase_orders").UpdateOne(ctx,
		bson.M{"_id": poID, "tenantId": tenantID, "status": domaininv.POStatusDraft},
		bson.M{"$set": bson.M{
			"status":     domaininv.POStatusApproved,
			"approvedBy": approverOID,
			"approvedAt": now,
			"updatedAt":  now,
		}},
	)
	if err != nil {
		return nil, err
	}
	return s.GetPO(ctx, tenantID, poID)
}

func (s *Service) OrderPO(ctx context.Context, tenantID, poID bson.ObjectID) (*domaininv.PurchaseOrder, error) {
	now := time.Now().UTC()
	_, err := s.db.Collection("purchase_orders").UpdateOne(ctx,
		bson.M{"_id": poID, "tenantId": tenantID},
		bson.M{"$set": bson.M{
			"status":    domaininv.POStatusOrdered,
			"updatedAt": now,
		}},
	)
	if err != nil {
		return nil, err
	}
	return s.GetPO(ctx, tenantID, poID)
}

func (s *Service) CancelPO(ctx context.Context, tenantID, poID bson.ObjectID, reason string) error {
	now := time.Now().UTC()
	_, err := s.db.Collection("purchase_orders").UpdateOne(ctx,
		bson.M{"_id": poID, "tenantId": tenantID},
		bson.M{"$set": bson.M{
			"status":    domaininv.POStatusCancelled,
			"notes":     reason,
			"updatedAt": now,
		}},
	)
	return err
}

func (s *Service) GetPO(ctx context.Context, tenantID, poID bson.ObjectID) (*domaininv.PurchaseOrder, error) {
	var po domaininv.PurchaseOrder
	err := s.db.Collection("purchase_orders").FindOne(ctx, bson.M{
		"_id":      poID,
		"tenantId": tenantID,
	}).Decode(&po)
	if err != nil {
		return nil, err
	}
	return &po, nil
}

func (s *Service) ListPOs(ctx context.Context, tenantID bson.ObjectID, status *domaininv.POStatus) ([]domaininv.PurchaseOrder, error) {
	q := bson.M{"tenantId": tenantID}
	if status != nil && *status != "" {
		q["status"] = *status
	}
	cursor, err := s.db.Collection("purchase_orders").Find(ctx, q, options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var list []domaininv.PurchaseOrder
	if err := cursor.All(ctx, &list); err != nil {
		return nil, err
	}
	if list == nil {
		list = []domaininv.PurchaseOrder{}
	}
	return list, nil
}

type ReceiveGRNInput struct {
	PurchaseOrderID *string             `json:"purchaseOrderId,omitempty"`
	SupplierID      string              `json:"supplierId"`
	OutletID        *string             `json:"outletId,omitempty"`
	InvoiceNumber   string              `json:"invoiceNumber,omitempty"`
	InvoiceDate     *time.Time          `json:"invoiceDate,omitempty"`
	Notes           string              `json:"notes,omitempty"`
	Items           []domaininv.GRNItem `json:"items"`
}

// ReceiveGRN receives goods, updates stock balances, recalculates weighted average costs, and records movements.
func (s *Service) ReceiveGRN(ctx context.Context, tenantID bson.ObjectID, userOID bson.ObjectID, userName string, input ReceiveGRNInput) (*domaininv.GoodsReceivedNote, error) {
	suppOID, err := bson.ObjectIDFromHex(input.SupplierID)
	if err != nil {
		return nil, errors.New("invalid supplierId")
	}
	supp, err := s.GetSupplier(ctx, tenantID, suppOID)
	if err != nil {
		return nil, errors.New("supplier not found")
	}

	var poOID *bson.ObjectID
	var poNumber string
	var po *domaininv.PurchaseOrder
	if input.PurchaseOrderID != nil && *input.PurchaseOrderID != "" {
		if oid, err := bson.ObjectIDFromHex(*input.PurchaseOrderID); err == nil {
			poOID = &oid
			if p, pErr := s.GetPO(ctx, tenantID, oid); pErr == nil {
				po = p
				poNumber = p.PONumber
			}
		}
	}

	var outletOID *bson.ObjectID
	if input.OutletID != nil && *input.OutletID != "" {
		if oid, err := bson.ObjectIDFromHex(*input.OutletID); err == nil {
			outletOID = &oid
		}
	} else if po != nil {
		outletOID = po.OutletID
	}

	now := time.Now().UTC()
	grnNumber := fmt.Sprintf("GRN-%s-%04d", now.Format("20060102"), time.Now().Unix()%10000)

	var totalGRNValue float64

	// Process each received item
	for i := range input.Items {
		item := &input.Items[i]
		if item.ReceivedQuantity <= 0 {
			continue
		}

		invItem, err := s.GetItem(ctx, tenantID, item.InventoryItemID)
		if err != nil {
			continue
		}

		item.ItemName = invItem.Name
		lineValue := item.ReceivedQuantity * item.UnitCost
		totalGRNValue += lineValue

		// Convert received quantity to BaseUnit
		baseReceivedQty, _ := domaininv.ConvertQuantity(item.ReceivedQuantity, item.Unit, invItem.BaseUnit, invItem.ConversionFactor)
		if baseReceivedQty <= 0 {
			baseReceivedQty = item.ReceivedQuantity
		}

		// Cost per base unit
		costPerBaseUnit := lineValue / baseReceivedQty

		// Calculate Weighted Average Cost:
		// newAvg = ((currentQty * oldAvg) + (receivedQty * costPerBaseUnit)) / (currentQty + receivedQty)
		var newAvgCost float64
		newTotalQty := invItem.CurrentQuantity + baseReceivedQty
		if newTotalQty > 0 {
			currentTotalValue := invItem.CurrentQuantity * invItem.AvgPurchaseCost
			if currentTotalValue < 0 {
				currentTotalValue = 0
			}
			newAvgCost = math.Round(((currentTotalValue+lineValue)/newTotalQty)*1000) / 1000
		} else {
			newAvgCost = costPerBaseUnit
		}

		// Atomically update inventory item quantity and cost
		_, _ = s.db.Collection("inventory_items").UpdateOne(ctx,
			bson.M{"_id": invItem.ID, "tenantId": tenantID},
			bson.M{
				"$inc": bson.M{"currentQuantity": baseReceivedQty},
				"$set": bson.M{
					"avgPurchaseCost":   newAvgCost,
					"lastPurchasePrice": item.UnitCost,
					"updatedAt":         now,
				},
			},
		)

		// Record StockMovement
		_ = s.logMovement(ctx, tenantID, invItem.ID, invItem.Name, outletOID, domaininv.MovementPurchaseReceipt,
			baseReceivedQty, invItem.BaseUnit, invItem.CurrentQuantity, newTotalQty, costPerBaseUnit,
			lineValue, item.BatchNumber, "", item.StorageLocation, "grn", grnNumber, "Goods Receipt Note delivery", userOID, userName)

		// If linked to PO, update PO line item received quantities
		if po != nil {
			for pIdx := range po.Items {
				poLine := &po.Items[pIdx]
				if poLine.InventoryItemID == invItem.ID {
					poLine.ReceivedQuantity += item.ReceivedQuantity
					poLine.RejectedQuantity += item.RejectedQuantity
				}
			}
		}
	}

	// Create GRN Document
	grn := &domaininv.GoodsReceivedNote{
		ID:              bson.NewObjectID(),
		TenantID:        tenantID,
		OutletID:        outletOID,
		GRNNumber:       grnNumber,
		PurchaseOrderID: poOID,
		PONumber:        poNumber,
		SupplierID:      supp.ID,
		SupplierName:    supp.Name,
		InvoiceNumber:   input.InvoiceNumber,
		InvoiceDate:     input.InvoiceDate,
		Items:           input.Items,
		TotalValue:      math.Round(totalGRNValue*100) / 100,
		ReceivedBy:      userOID,
		ReceivedByName:  userName,
		Notes:           input.Notes,
		ReceivedAt:      now,
	}

	if _, err := s.db.Collection("goods_received_notes").InsertOne(ctx, grn); err != nil {
		return nil, err
	}

	// Update supplier totals
	_, _ = s.db.Collection("suppliers").UpdateOne(ctx,
		bson.M{"_id": supp.ID, "tenantId": tenantID},
		bson.M{
			"$inc": bson.M{
				"totalPurchases":     grn.TotalValue,
				"outstandingBalance": grn.TotalValue,
			},
			"$set": bson.M{"updatedAt": now},
		},
	)

	// Update PO status if applicable
	if po != nil {
		allReceived := true
		anyReceived := false
		for _, poLine := range po.Items {
			if poLine.ReceivedQuantity > 0 {
				anyReceived = true
			}
			if poLine.ReceivedQuantity < poLine.OrderQuantity {
				allReceived = false
			}
		}
		newStatus := domaininv.POStatusPartiallyReceived
		if allReceived {
			newStatus = domaininv.POStatusReceived
		} else if !anyReceived {
			newStatus = po.Status
		}
		_, _ = s.db.Collection("purchase_orders").UpdateOne(ctx,
			bson.M{"_id": po.ID, "tenantId": tenantID},
			bson.M{"$set": bson.M{
				"status":    newStatus,
				"items":     po.Items,
				"updatedAt": now,
			}},
		)
	}

	return grn, nil
}

func (s *Service) GetGRN(ctx context.Context, tenantID, grnID bson.ObjectID) (*domaininv.GoodsReceivedNote, error) {
	var grn domaininv.GoodsReceivedNote
	err := s.db.Collection("goods_received_notes").FindOne(ctx, bson.M{
		"_id":      grnID,
		"tenantId": tenantID,
	}).Decode(&grn)
	if err != nil {
		return nil, err
	}
	return &grn, nil
}

func (s *Service) ListGRNs(ctx context.Context, tenantID bson.ObjectID, poID *bson.ObjectID) ([]domaininv.GoodsReceivedNote, error) {
	q := bson.M{"tenantId": tenantID}
	if poID != nil {
		q["purchaseOrderId"] = *poID
	}
	cursor, err := s.db.Collection("goods_received_notes").Find(ctx, q, options.Find().SetSort(bson.D{{Key: "receivedAt", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var list []domaininv.GoodsReceivedNote
	if err := cursor.All(ctx, &list); err != nil {
		return nil, err
	}
	if list == nil {
		list = []domaininv.GoodsReceivedNote{}
	}
	return list, nil
}

// ─── Stock Counts (Physical Stocktaking) ────────────────────────────────────

type CreateStockCountInput struct {
	Name            string   `json:"name"`
	OutletID        *string  `json:"outletId,omitempty"`
	Categories      []string `json:"categories,omitempty"`
	StorageLocation string   `json:"storageLocation,omitempty"`
}

func (s *Service) CreateStockCount(ctx context.Context, tenantID, userOID bson.ObjectID, input CreateStockCountInput) (*domaininv.StockCount, error) {
	var outletOID *bson.ObjectID
	if input.OutletID != nil && *input.OutletID != "" {
		if oid, err := bson.ObjectIDFromHex(*input.OutletID); err == nil {
			outletOID = &oid
		}
	}

	// Snapshot all items matching categories
	itemFilter := ListItemsFilter{IsArchived: boolPtr(false)}
	items, err := s.ListItems(ctx, tenantID, itemFilter)
	if err != nil {
		return nil, err
	}

	var countItems []domaininv.StockCountItem
	for _, it := range items {
		if len(input.Categories) > 0 {
			matched := false
			for _, c := range input.Categories {
				if strings.EqualFold(it.Category, c) {
					matched = true
					break
				}
			}
			if !matched {
				continue
			}
		}
		if input.StorageLocation != "" && !strings.EqualFold(it.StorageLocation, input.StorageLocation) {
			continue
		}
		countItems = append(countItems, domaininv.StockCountItem{
			InventoryItemID:  it.ID,
			ItemName:         it.Name,
			BaseUnit:         it.BaseUnit,
			SystemQuantity:   it.CurrentQuantity,
			PhysicalQuantity: it.CurrentQuantity, // Defaults to system until counted
			QuantityVariance: 0,
			UnitCost:         it.AvgPurchaseCost,
			ValueVariance:    0,
		})
	}

	now := time.Now().UTC()
	countNumber := fmt.Sprintf("SC-%s-%04d", now.Format("20060102"), time.Now().Unix()%10000)

	name := input.Name
	if strings.TrimSpace(name) == "" {
		name = fmt.Sprintf("Stock Audit %s", now.Format("02 Jan 2006"))
	}

	doc := &domaininv.StockCount{
		ID:                 bson.NewObjectID(),
		TenantID:           tenantID,
		OutletID:           outletOID,
		CountNumber:        countNumber,
		Name:               name,
		Categories:         input.Categories,
		StorageLocation:    input.StorageLocation,
		Items:              countItems,
		TotalValueVariance: 0,
		Status:             domaininv.StockCountDraft,
		ConductedBy:        userOID,
		CreatedAt:          now,
		UpdatedAt:          now,
	}

	_, err = s.db.Collection("stock_counts").InsertOne(ctx, doc)
	if err != nil {
		return nil, err
	}
	return doc, nil
}

func (s *Service) UpdateStockCountItems(ctx context.Context, tenantID, countID bson.ObjectID, items []domaininv.StockCountItem) (*domaininv.StockCount, error) {
	var totalVariance float64
	for i := range items {
		item := &items[i]
		item.QuantityVariance = math.Round((item.PhysicalQuantity-item.SystemQuantity)*1000) / 1000
		item.ValueVariance = math.Round(item.QuantityVariance*item.UnitCost*100) / 100
		totalVariance += item.ValueVariance
	}

	now := time.Now().UTC()
	_, err := s.db.Collection("stock_counts").UpdateOne(ctx,
		bson.M{"_id": countID, "tenantId": tenantID},
		bson.M{"$set": bson.M{
			"items":              items,
			"totalValueVariance": math.Round(totalVariance*100) / 100,
			"status":             domaininv.StockCountInProgress,
			"updatedAt":          now,
		}},
	)
	if err != nil {
		return nil, err
	}
	return s.GetStockCount(ctx, tenantID, countID)
}

func (s *Service) SubmitStockCount(ctx context.Context, tenantID, countID bson.ObjectID) error {
	now := time.Now().UTC()
	_, err := s.db.Collection("stock_counts").UpdateOne(ctx,
		bson.M{"_id": countID, "tenantId": tenantID},
		bson.M{"$set": bson.M{
			"status":    domaininv.StockCountSubmitted,
			"updatedAt": now,
		}},
	)
	return err
}

func (s *Service) ApproveStockCount(ctx context.Context, tenantID, countID, approverOID bson.ObjectID, approverName string) (*domaininv.StockCount, error) {
	sc, err := s.GetStockCount(ctx, tenantID, countID)
	if err != nil {
		return nil, err
	}

	now := time.Now().UTC()

	// Apply physical counts to inventory items and log movements
	for _, it := range sc.Items {
		if it.QuantityVariance == 0 {
			continue
		}

		invItem, err := s.GetItem(ctx, tenantID, it.InventoryItemID)
		if err != nil {
			continue
		}

		_, _ = s.db.Collection("inventory_items").UpdateOne(ctx,
			bson.M{"_id": invItem.ID, "tenantId": tenantID},
			bson.M{"$set": bson.M{
				"currentQuantity": it.PhysicalQuantity,
				"updatedAt":       now,
			}},
		)

		movType := domaininv.MovementCorrection
		if it.QuantityVariance < 0 {
			movType = domaininv.MovementWastage
		}

		_ = s.logMovement(ctx, tenantID, invItem.ID, invItem.Name, sc.OutletID, movType,
			it.QuantityVariance, invItem.BaseUnit, invItem.CurrentQuantity, it.PhysicalQuantity, it.UnitCost,
			math.Abs(it.ValueVariance), "", "", "", "stock_count", sc.CountNumber, it.VarianceReason, approverOID, approverName)
	}

	_, err = s.db.Collection("stock_counts").UpdateOne(ctx,
		bson.M{"_id": countID, "tenantId": tenantID},
		bson.M{"$set": bson.M{
			"status":     domaininv.StockCountApproved,
			"approvedBy": approverOID,
			"approvedAt": now,
			"updatedAt":  now,
		}},
	)
	if err != nil {
		return nil, err
	}

	return s.GetStockCount(ctx, tenantID, countID)
}

func (s *Service) GetStockCount(ctx context.Context, tenantID, countID bson.ObjectID) (*domaininv.StockCount, error) {
	var sc domaininv.StockCount
	err := s.db.Collection("stock_counts").FindOne(ctx, bson.M{
		"_id":      countID,
		"tenantId": tenantID,
	}).Decode(&sc)
	if err != nil {
		return nil, err
	}
	return &sc, nil
}

func (s *Service) ListStockCounts(ctx context.Context, tenantID bson.ObjectID) ([]domaininv.StockCount, error) {
	cursor, err := s.db.Collection("stock_counts").Find(ctx, bson.M{"tenantId": tenantID},
		options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var list []domaininv.StockCount
	if err := cursor.All(ctx, &list); err != nil {
		return nil, err
	}
	if list == nil {
		list = []domaininv.StockCount{}
	}
	return list, nil
}

// ─── Stock Transfers ────────────────────────────────────────────────────────

type CreateTransferInput struct {
	SourceOutletID      string                   `json:"sourceOutletId"`
	DestinationOutletID string                   `json:"destinationOutletId"`
	Notes               string                   `json:"notes,omitempty"`
	Items               []domaininv.TransferItem `json:"items"`
}

func (s *Service) CreateTransfer(ctx context.Context, tenantID, userOID bson.ObjectID, input CreateTransferInput) (*domaininv.StockTransfer, error) {
	srcOID, err := bson.ObjectIDFromHex(input.SourceOutletID)
	if err != nil {
		return nil, errors.New("invalid sourceOutletId")
	}
	destOID, err := bson.ObjectIDFromHex(input.DestinationOutletID)
	if err != nil {
		return nil, errors.New("invalid destinationOutletId")
	}

	srcOutlet, _ := s.GetOutlet(ctx, tenantID, srcOID)
	destOutlet, _ := s.GetOutlet(ctx, tenantID, destOID)

	srcName := "Source Outlet"
	if srcOutlet != nil {
		srcName = srcOutlet.Name
	}
	destName := "Destination Outlet"
	if destOutlet != nil {
		destName = destOutlet.Name
	}

	now := time.Now().UTC()
	transferNum := fmt.Sprintf("TR-%s-%04d", now.Format("20060102"), time.Now().Unix()%10000)

	doc := &domaininv.StockTransfer{
		ID:                    bson.NewObjectID(),
		TenantID:              tenantID,
		TransferNumber:        transferNum,
		SourceOutletID:        srcOID,
		SourceOutletName:      srcName,
		DestinationOutletID:   destOID,
		DestinationOutletName: destName,
		Items:                 input.Items,
		Status:                domaininv.TransferRequested,
		RequestedBy:           userOID,
		Notes:                 input.Notes,
		CreatedAt:             now,
		UpdatedAt:             now,
	}

	_, err = s.db.Collection("stock_transfers").InsertOne(ctx, doc)
	if err != nil {
		return nil, err
	}
	return doc, nil
}

func (s *Service) ApproveTransfer(ctx context.Context, tenantID, transferID bson.ObjectID) error {
	now := time.Now().UTC()
	_, err := s.db.Collection("stock_transfers").UpdateOne(ctx,
		bson.M{"_id": transferID, "tenantId": tenantID},
		bson.M{"$set": bson.M{
			"status":    domaininv.TransferApproved,
			"updatedAt": now,
		}},
	)
	return err
}

func (s *Service) DispatchTransfer(ctx context.Context, tenantID, transferID, userOID bson.ObjectID, userName string) (*domaininv.StockTransfer, error) {
	tr, err := s.GetTransfer(ctx, tenantID, transferID)
	if err != nil {
		return nil, err
	}

	now := time.Now().UTC()
	// Deduct items from source outlet
	for i := range tr.Items {
		item := &tr.Items[i]
		if item.DispatchedQuantity <= 0 {
			item.DispatchedQuantity = item.RequestedQuantity
		}

		invItem, err := s.GetItem(ctx, tenantID, item.InventoryItemID)
		if err != nil {
			continue
		}

		baseQty, _ := domaininv.ConvertQuantity(item.DispatchedQuantity, item.Unit, invItem.BaseUnit, invItem.ConversionFactor)
		if baseQty <= 0 {
			baseQty = item.DispatchedQuantity
		}

		newQty := invItem.CurrentQuantity - baseQty
		_, _ = s.db.Collection("inventory_items").UpdateOne(ctx,
			bson.M{"_id": invItem.ID, "tenantId": tenantID},
			bson.M{
				"$inc": bson.M{"currentQuantity": -baseQty},
				"$set": bson.M{"updatedAt": now},
			},
		)

		_ = s.logMovement(ctx, tenantID, invItem.ID, invItem.Name, &tr.SourceOutletID, domaininv.MovementStockTransferOut,
			-baseQty, invItem.BaseUnit, invItem.CurrentQuantity, newQty, invItem.AvgPurchaseCost,
			baseQty*invItem.AvgPurchaseCost, "", tr.SourceOutletName, tr.DestinationOutletName, "transfer", tr.TransferNumber, "Transfer dispatched", userOID, userName)
	}

	_, err = s.db.Collection("stock_transfers").UpdateOne(ctx,
		bson.M{"_id": transferID, "tenantId": tenantID},
		bson.M{"$set": bson.M{
			"status":       domaininv.TransferDispatched,
			"items":        tr.Items,
			"dispatchedBy": userOID,
			"updatedAt":    now,
		}},
	)
	if err != nil {
		return nil, err
	}

	return s.GetTransfer(ctx, tenantID, transferID)
}

func (s *Service) ReceiveTransfer(ctx context.Context, tenantID, transferID, userOID bson.ObjectID, userName string, receivedItems []domaininv.TransferItem) (*domaininv.StockTransfer, error) {
	tr, err := s.GetTransfer(ctx, tenantID, transferID)
	if err != nil {
		return nil, err
	}

	now := time.Now().UTC()

	// Add items to destination outlet and record discrepancies
	for i := range tr.Items {
		line := &tr.Items[i]
		for _, recv := range receivedItems {
			if recv.InventoryItemID == line.InventoryItemID {
				line.ReceivedQuantity = recv.ReceivedQuantity
				line.Discrepancy = math.Round((line.ReceivedQuantity-line.DispatchedQuantity)*1000) / 1000
				line.DiscrepancyReason = recv.DiscrepancyReason
			}
		}

		invItem, err := s.GetItem(ctx, tenantID, line.InventoryItemID)
		if err != nil {
			continue
		}

		baseQty, _ := domaininv.ConvertQuantity(line.ReceivedQuantity, line.Unit, invItem.BaseUnit, invItem.ConversionFactor)
		if baseQty <= 0 {
			baseQty = line.ReceivedQuantity
		}

		newQty := invItem.CurrentQuantity + baseQty
		_, _ = s.db.Collection("inventory_items").UpdateOne(ctx,
			bson.M{"_id": invItem.ID, "tenantId": tenantID},
			bson.M{
				"$inc": bson.M{"currentQuantity": baseQty},
				"$set": bson.M{"updatedAt": now},
			},
		)

		_ = s.logMovement(ctx, tenantID, invItem.ID, invItem.Name, &tr.DestinationOutletID, domaininv.MovementStockTransferIn,
			baseQty, invItem.BaseUnit, invItem.CurrentQuantity, newQty, invItem.AvgPurchaseCost,
			baseQty*invItem.AvgPurchaseCost, "", tr.SourceOutletName, tr.DestinationOutletName, "transfer", tr.TransferNumber, "Transfer received", userOID, userName)
	}

	_, err = s.db.Collection("stock_transfers").UpdateOne(ctx,
		bson.M{"_id": transferID, "tenantId": tenantID},
		bson.M{"$set": bson.M{
			"status":     domaininv.TransferReceived,
			"items":      tr.Items,
			"receivedBy": userOID,
			"updatedAt":  now,
		}},
	)
	if err != nil {
		return nil, err
	}

	return s.GetTransfer(ctx, tenantID, transferID)
}

func (s *Service) GetTransfer(ctx context.Context, tenantID, transferID bson.ObjectID) (*domaininv.StockTransfer, error) {
	var tr domaininv.StockTransfer
	err := s.db.Collection("stock_transfers").FindOne(ctx, bson.M{
		"_id":      transferID,
		"tenantId": tenantID,
	}).Decode(&tr)
	if err != nil {
		return nil, err
	}
	return &tr, nil
}

func (s *Service) ListTransfers(ctx context.Context, tenantID bson.ObjectID) ([]domaininv.StockTransfer, error) {
	cursor, err := s.db.Collection("stock_transfers").Find(ctx, bson.M{"tenantId": tenantID},
		options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var list []domaininv.StockTransfer
	if err := cursor.All(ctx, &list); err != nil {
		return nil, err
	}
	if list == nil {
		list = []domaininv.StockTransfer{}
	}
	return list, nil
}

// ─── Outlets ────────────────────────────────────────────────────────────────

func (s *Service) CreateOutlet(ctx context.Context, tenantID bson.ObjectID, input domaininv.Outlet) (*domaininv.Outlet, error) {
	if strings.TrimSpace(input.Name) == "" {
		return nil, errors.New("outlet name is required")
	}
	code := strings.TrimSpace(input.Code)
	if code == "" {
		code = strings.ToUpper(strings.ReplaceAll(input.Name, " ", "_"))
	}
	input.ID = bson.NewObjectID()
	input.TenantID = tenantID
	input.Code = code
	input.IsActive = true
	input.CreatedAt = time.Now().UTC()

	_, err := s.db.Collection("inventory_outlets").InsertOne(ctx, input)
	if err != nil {
		return nil, err
	}
	return &input, nil
}

func (s *Service) GetOutlet(ctx context.Context, tenantID, outletID bson.ObjectID) (*domaininv.Outlet, error) {
	var out domaininv.Outlet
	err := s.db.Collection("inventory_outlets").FindOne(ctx, bson.M{
		"_id":      outletID,
		"tenantId": tenantID,
	}).Decode(&out)
	if err != nil {
		return nil, err
	}
	return &out, nil
}

func (s *Service) ListOutlets(ctx context.Context, tenantID bson.ObjectID) ([]domaininv.Outlet, error) {
	cursor, err := s.db.Collection("inventory_outlets").Find(ctx, bson.M{
		"tenantId": tenantID,
		"isActive": true,
	}, options.Find().SetSort(bson.D{{Key: "name", Value: 1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var list []domaininv.Outlet
	if err := cursor.All(ctx, &list); err != nil {
		return nil, err
	}
	if list == nil {
		list = []domaininv.Outlet{}
	}
	return list, nil
}

// ─── Settings ───────────────────────────────────────────────────────────────

func (s *Service) GetSettings(ctx context.Context, tenantID bson.ObjectID) (*domaininv.InventorySettings, error) {
	var st domaininv.InventorySettings
	err := s.db.Collection("inventory_settings").FindOne(ctx, bson.M{"tenantId": tenantID}).Decode(&st)
	if err == mongo.ErrNoDocuments {
		// Create default settings
		st = domaininv.InventorySettings{
			ID:                     bson.NewObjectID(),
			TenantID:               tenantID,
			DeductionTrigger:       domaininv.DeductionOnOrderPreparing,
			AllowNegativeStock:     false,
			StrictStockEnforcement: false,
			Auto86OnZeroStock:      true,
			ExpiryAlertDays:        7,
			ReversalPolicy:         "return_to_stock",
			UpdatedAt:              time.Now().UTC(),
		}
		_, _ = s.db.Collection("inventory_settings").InsertOne(ctx, st)
		return &st, nil
	}
	if err != nil {
		return nil, err
	}
	return &st, nil
}

func (s *Service) UpdateSettings(ctx context.Context, tenantID bson.ObjectID, input domaininv.InventorySettings) (*domaininv.InventorySettings, error) {
	if err := input.Validate(); err != nil {
		return nil, err
	}
	now := time.Now().UTC()
	_, err := s.db.Collection("inventory_settings").UpdateOne(ctx,
		bson.M{"tenantId": tenantID},
		bson.M{"$set": bson.M{
			"deductionTrigger":       input.DeductionTrigger,
			"allowNegativeStock":     input.AllowNegativeStock,
			"strictStockEnforcement": input.StrictStockEnforcement,
			"auto86OnZeroStock":      input.Auto86OnZeroStock,
			"expiryAlertDays":        input.ExpiryAlertDays,
			"reversalPolicy":         input.ReversalPolicy,
			"updatedAt":              now,
		}},
		options.UpdateOne().SetUpsert(true),
	)
	if err != nil {
		return nil, err
	}
	return s.GetSettings(ctx, tenantID)
}

// ─── Order Deduction Engine (Idempotent POS/KDS integration) ────────────────

func (s *Service) DeductForOrder(ctx context.Context, ord *domainorder.Order) error {
	if ord == nil || ord.TenantID.IsZero() || ord.ID.IsZero() {
		return nil
	}

	settings, err := s.GetSettings(ctx, ord.TenantID)
	if err != nil {
		return err
	}

	// Idempotency check: verify this order has not already been deducted
	deductionsColl := s.db.Collection("inventory_order_deductions")
	count, err := deductionsColl.CountDocuments(ctx, bson.M{
		"tenantId": ord.TenantID,
		"orderId":  ord.ID,
	})
	if err != nil {
		return err
	}
	if count > 0 {
		return nil // Already processed, return immediately
	}

	var loggedDeductions []domaininv.DeductionItemRecord
	now := time.Now().UTC()

	// For each ordered menu item, find active recipe and deduct raw ingredients
	for _, orderItem := range ord.Items {
		if orderItem.Quantity <= 0 {
			continue
		}

		var recipe domaininv.Recipe
		err := s.db.Collection("recipes").FindOne(ctx, bson.M{
			"tenantId":   ord.TenantID,
			"menuItemId": orderItem.MenuItemID,
			"isActive":   true,
		}).Decode(&recipe)

		if err != nil {
			// No recipe attached to this menu item
			continue
		}

		// Calculate multiplier for servings
		servingsYield := recipe.YieldServings
		if servingsYield <= 0 {
			servingsYield = 1.0
		}
		multiplier := float64(orderItem.Quantity) / servingsYield

		for _, ing := range recipe.Ingredients {
			invItem, err := s.GetItem(ctx, ord.TenantID, ing.InventoryItemID)
			if err != nil {
				continue
			}

			// Required quantity in recipe unit (including prep loss)
			grossReq := ing.Quantity * multiplier * (1.0 + (ing.PrepLossPercent / 100.0))

			// Convert required quantity to inventory item's BaseUnit
			baseQtyDeducted, cErr := domaininv.ConvertQuantity(grossReq, ing.Unit, invItem.BaseUnit, invItem.ConversionFactor)
			if cErr != nil {
				baseQtyDeducted = grossReq
			}

			baseQtyDeducted = math.Round(baseQtyDeducted*1000) / 1000

			// Decrement inventory atomically
			_, _ = s.db.Collection("inventory_items").UpdateOne(ctx,
				bson.M{"_id": invItem.ID, "tenantId": ord.TenantID},
				bson.M{
					"$inc": bson.M{"currentQuantity": -baseQtyDeducted},
					"$set": bson.M{"updatedAt": now},
				},
			)

			newQty := invItem.CurrentQuantity - baseQtyDeducted

			// Log movement
			_ = s.logMovement(ctx, ord.TenantID, invItem.ID, invItem.Name, invItem.OutletID, domaininv.MovementIngredientConsumption,
				-baseQtyDeducted, invItem.BaseUnit, invItem.CurrentQuantity, newQty, invItem.AvgPurchaseCost,
				baseQtyDeducted*invItem.AvgPurchaseCost, "", "", "", "order", ord.OrderNumber,
				fmt.Sprintf("Consumption for %d x %s", orderItem.Quantity, orderItem.Name), bson.NilObjectID, "KDS Auto-Deduction")

			loggedDeductions = append(loggedDeductions, domaininv.DeductionItemRecord{
				MenuItemID:        orderItem.MenuItemID,
				MenuItemName:      orderItem.Name,
				InventoryItemID:   invItem.ID,
				InventoryItemName: invItem.Name,
				QuantityDeducted:  baseQtyDeducted,
				Unit:              invItem.BaseUnit,
			})

			// Check auto 86 condition
			if settings.Auto86OnZeroStock && newQty <= 0 {
				s.checkAndTriggerAuto86(ctx, ord.TenantID, invItem.ID)
			}
		}
	}

	// Record deduction event to guarantee idempotency
	record := domaininv.OrderDeductionRecord{
		ID:          bson.NewObjectID(),
		TenantID:    ord.TenantID,
		OrderID:     ord.ID,
		OrderNumber: ord.OrderNumber,
		Trigger:     string(settings.DeductionTrigger),
		DeductedAt:  now,
		Items:       loggedDeductions,
	}
	_, _ = deductionsColl.InsertOne(ctx, record)

	return nil
}

// ─── Dashboard Summary & Reports ────────────────────────────────────────────

type DashboardSummary struct {
	TotalInventoryValue float64                   `json:"totalInventoryValue"`
	TotalItemsCount     int64                     `json:"totalItemsCount"`
	LowStockCount       int64                     `json:"lowStockCount"`
	OutOfStockCount     int64                     `json:"outOfStockCount"`
	OpenPOCount         int64                     `json:"openPoCount"`
	RecentMovements     []domaininv.StockMovement `json:"recentMovements"`
	LowStockItems       []domaininv.InventoryItem `json:"lowStockItems"`
}

func (s *Service) GetDashboardSummary(ctx context.Context, tenantID bson.ObjectID) (*DashboardSummary, error) {
	items, err := s.ListItems(ctx, tenantID, ListItemsFilter{IsArchived: boolPtr(false)})
	if err != nil {
		return nil, err
	}

	var totalVal float64
	var lowStockItems []domaininv.InventoryItem
	var outOfStockCount, lowStockCount int64

	for _, it := range items {
		totalVal += it.TotalValue()
		if it.CurrentQuantity <= 0 {
			outOfStockCount++
			lowStockCount++
			lowStockItems = append(lowStockItems, it)
		} else if it.IsLowStock() {
			lowStockCount++
			lowStockItems = append(lowStockItems, it)
		}
	}

	poCount, _ := s.db.Collection("purchase_orders").CountDocuments(ctx, bson.M{
		"tenantId": tenantID,
		"status":   bson.M{"$in": []string{"approved", "ordered", "partially_received"}},
	})

	movements, _ := s.ListMovements(ctx, tenantID, 10)

	return &DashboardSummary{
		TotalInventoryValue: math.Round(totalVal*100) / 100,
		TotalItemsCount:     int64(len(items)),
		LowStockCount:       lowStockCount,
		OutOfStockCount:     outOfStockCount,
		OpenPOCount:         poCount,
		RecentMovements:     movements,
		LowStockItems:       lowStockItems,
	}, nil
}

type ValuationItem struct {
	Category   string  `json:"category"`
	ItemCount  int     `json:"itemCount"`
	TotalValue float64 `json:"totalValue"`
}

func (s *Service) GetValuationReport(ctx context.Context, tenantID bson.ObjectID) ([]ValuationItem, error) {
	items, err := s.ListItems(ctx, tenantID, ListItemsFilter{IsArchived: boolPtr(false)})
	if err != nil {
		return nil, err
	}

	catMap := make(map[string]*ValuationItem)
	for _, it := range items {
		cat := it.Category
		if cat == "" {
			cat = "General"
		}
		if _, ok := catMap[cat]; !ok {
			catMap[cat] = &ValuationItem{Category: cat}
		}
		catMap[cat].ItemCount++
		catMap[cat].TotalValue += it.TotalValue()
	}

	var result []ValuationItem
	for _, v := range catMap {
		v.TotalValue = math.Round(v.TotalValue*100) / 100
		result = append(result, *v)
	}
	return result, nil
}

func (s *Service) ListMovements(ctx context.Context, tenantID bson.ObjectID, limit int64) ([]domaininv.StockMovement, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	opts := options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}}).SetLimit(limit)
	cursor, err := s.db.Collection("stock_movements").Find(ctx, bson.M{"tenantId": tenantID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var list []domaininv.StockMovement
	if err := cursor.All(ctx, &list); err != nil {
		return nil, err
	}
	if list == nil {
		list = []domaininv.StockMovement{}
	}
	return list, nil
}

// ─── Helpers ────────────────────────────────────────────────────────────────

func (s *Service) logMovement(ctx context.Context, tenantID, itemID bson.ObjectID, itemName string, outletID *bson.ObjectID,
	movType domaininv.MovementType, qty float64, unit string, prevQty, newQty, unitCost, totalCost float64,
	batchNum, srcLoc, destLoc, refType, refID, reason string, userOID bson.ObjectID, userName string) error {

	movement := domaininv.StockMovement{
		ID:                  bson.NewObjectID(),
		TenantID:            tenantID,
		OutletID:            outletID,
		InventoryItemID:     itemID,
		ItemName:            itemName,
		MovementType:        movType,
		Quantity:            qty,
		Unit:                unit,
		PreviousQuantity:    prevQty,
		NewQuantity:         newQty,
		UnitCost:            unitCost,
		TotalCost:           math.Round(totalCost*100) / 100,
		BatchNumber:         batchNum,
		SourceLocation:      srcLoc,
		DestinationLocation: destLoc,
		ReferenceType:       refType,
		ReferenceID:         refID,
		Reason:              reason,
		PerformedBy:         userOID,
		PerformedByName:     userName,
		Timestamp:           time.Now().UTC(),
	}

	_, err := s.db.Collection("stock_movements").InsertOne(ctx, movement)
	return err
}

func (s *Service) checkAndTriggerAuto86(ctx context.Context, tenantID, inventoryItemID bson.ObjectID) {
	// Look up all active recipes containing this inventory item
	cursor, err := s.db.Collection("recipes").Find(ctx, bson.M{
		"tenantId":                    tenantID,
		"isActive":                    true,
		"ingredients.inventoryItemId": inventoryItemID,
	})
	if err != nil {
		return
	}
	defer cursor.Close(ctx)

	var recipes []domaininv.Recipe
	if err := cursor.All(ctx, &recipes); err != nil {
		return
	}

	now := time.Now().UTC()
	for _, r := range recipes {
		// Mark linked menu item unavailable
		_, _ = s.db.Collection("menu_items").UpdateOne(ctx,
			bson.M{"_id": r.MenuItemID, "tenantId": tenantID},
			bson.M{"$set": bson.M{"isAvailable": false, "updatedAt": now}},
		)
	}
}

func boolPtr(b bool) *bool {
	return &b
}
