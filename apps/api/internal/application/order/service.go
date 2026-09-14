package order

import (
	"context"
	"errors"
	"fmt"
	"math/rand"
	"regexp"
	"strings"
	"time"

	domainmenu "github.com/dineflow/api/internal/domain/menu"
	domainorder "github.com/dineflow/api/internal/domain/order"
	domaintable "github.com/dineflow/api/internal/domain/table"
	"github.com/dineflow/api/internal/domain/tenant"
	mongoinfra "github.com/dineflow/api/internal/infrastructure/mongodb"
	"github.com/dineflow/api/internal/infrastructure/realtime"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type Service struct {
	db  *mongoinfra.Client
	hub *realtime.Hub
}

func NewService(db *mongoinfra.Client, hub *realtime.Hub) *Service {
	return &Service{db: db, hub: hub}
}

type CustomerItemInput struct {
	MenuItemID        string   `json:"menuItemId"`
	Quantity          int      `json:"quantity"`
	SelectedVariant   *string  `json:"selectedVariant,omitempty"`
	ModifierNames     []string `json:"modifierNames,omitempty"`
	SelectedModifiers []string `json:"selectedModifiers,omitempty"`
	Notes             string   `json:"notes,omitempty"`
}

type CreateOrderInput struct {
	TenantSlug          string              `json:"tenantSlug"`
	TableQRSlug         string              `json:"tableQRSlug"`
	TableSlug           string              `json:"tableSlug"`
	Destination         string              `json:"destination,omitempty"`
	RoomNumber          string              `json:"roomNumber,omitempty"`
	ChargeToFolio       bool                `json:"chargeToFolio,omitempty"`
	CustomerName        string              `json:"customerName"`
	CustomerPhone       string              `json:"customerPhone"`
	Items               []CustomerItemInput `json:"items"`
	SpecialInstructions string              `json:"specialInstructions"`
}

// CreateCustomerOrder processes a contactless QR order with server-side price verification.
func (s *Service) CreateCustomerOrder(ctx context.Context, input CreateOrderInput) (*domainorder.Order, error) {
	if len(input.Items) == 0 {
		return nil, errors.New("order must contain at least one item")
	}

	// 1. Locate Tenant (case-insensitive with alias fallback)
	tenantColl := s.db.Collection("tenants")
	slug := strings.TrimSpace(input.TenantSlug)
	if slug == "" {
		slug = "the-grand-bistro"
	}

	var t tenant.Tenant
	err := tenantColl.FindOne(ctx, bson.M{
		"slug": bson.M{"$regex": "^" + regexp.QuoteMeta(slug) + "$", "$options": "i"},
	}).Decode(&t)

	if err == mongo.ErrNoDocuments && (slug == "dineflow" || slug == "restaurant" || slug == "demo") {
		err = tenantColl.FindOne(ctx, bson.M{"slug": "the-grand-bistro"}).Decode(&t)
	}
	if err == mongo.ErrNoDocuments {
		err = tenantColl.FindOne(ctx, bson.M{}).Decode(&t)
	}
	if err != nil {
		return nil, errors.New("restaurant workspace not found")
	}

	// 2. Locate Table (if QR ordering)
	targetTableSlug := strings.TrimSpace(input.TableQRSlug)
	if targetTableSlug == "" {
		targetTableSlug = strings.TrimSpace(input.TableSlug)
	}

	var tableID *bson.ObjectID
	tableName := "Dine-in"
	if targetTableSlug != "" {
		tableColl := s.db.Collection("tables")
		var tbl domaintable.Table

		filter := bson.M{
			"tenantId": t.ID,
			"$or": []bson.M{
				{"qrSlug": targetTableSlug},
				{"qrSlug": strings.ToLower(targetTableSlug)},
				{"name": bson.M{"$regex": "^" + regexp.QuoteMeta(targetTableSlug) + "$", "$options": "i"}},
			},
		}
		if tblOID, oErr := bson.ObjectIDFromHex(targetTableSlug); oErr == nil {
			filter["$or"] = append(filter["$or"].([]bson.M), bson.M{"_id": tblOID})
		}

		if err := tableColl.FindOne(ctx, filter).Decode(&tbl); err == nil {
			tableID = &tbl.ID
			tableName = tbl.Name
		} else {
			tableName = targetTableSlug
		}
	}

	// 3. Build verified OrderItems from database
	menuColl := s.db.Collection("menu_items")
	var orderItems []domainorder.OrderItem

	for _, reqItem := range input.Items {
		var mItem domainmenu.MenuItem
		var found bool

		// Check by ObjectID if valid hex
		if itemOID, err := bson.ObjectIDFromHex(reqItem.MenuItemID); err == nil {
			if err := menuColl.FindOne(ctx, bson.M{"tenantId": t.ID, "_id": itemOID}).Decode(&mItem); err == nil {
				found = true
			}
		}

		// Fallback: Check by slug or name
		if !found {
			err := menuColl.FindOne(ctx, bson.M{
				"tenantId": t.ID,
				"$or": []bson.M{
					{"slug": reqItem.MenuItemID},
					{"name": bson.M{"$regex": "^" + regexp.QuoteMeta(reqItem.MenuItemID) + "$", "$options": "i"}},
				},
			}).Decode(&mItem)
			if err == nil {
				found = true
			}
		}

		if !found {
			return nil, fmt.Errorf("menu item not found: %s", reqItem.MenuItemID)
		}
		if !mItem.IsAvailable {
			return nil, fmt.Errorf("item '%s' is currently sold out", mItem.Name)
		}

		// Calculate unit price based on base price + variant
		unitPrice := mItem.BasePrice
		if reqItem.SelectedVariant != nil {
			for _, v := range mItem.Variants {
				if v.Name == *reqItem.SelectedVariant {
					unitPrice += v.Price
					break
				}
			}
		}

		// Collect modifier names from either field
		allModNames := append([]string{}, reqItem.ModifierNames...)
		allModNames = append(allModNames, reqItem.SelectedModifiers...)

		var matchedModifiers []domainorder.OrderItemModifier
		for _, modName := range allModNames {
			for _, grp := range mItem.ModifierGroups {
				for _, opt := range grp.Options {
					if strings.EqualFold(opt.Name, modName) {
						matchedModifiers = append(matchedModifiers, domainorder.OrderItemModifier{
							Name:  opt.Name,
							Price: opt.Price,
						})
					}
				}
			}
		}

		qty := reqItem.Quantity
		if qty <= 0 {
			qty = 1
		}

		orderItems = append(orderItems, domainorder.OrderItem{
			MenuItemID:        mItem.ID,
			Name:              mItem.Name,
			Quantity:          qty,
			UnitPrice:         unitPrice,
			SelectedVariant:   reqItem.SelectedVariant,
			SelectedModifiers: matchedModifiers,
			Notes:             reqItem.Notes,
		})
	}

	// 4. Generate order number (#IRD-XXXX for In-Room Dining, #ORD-XXXX for Restaurant Tables)
	rNum := rand.Intn(9000) + 1000
	orderNum := fmt.Sprintf("#ORD-%d", rNum)
	orderSource := domainorder.SourceQRTable
	orderDest := domainorder.DestinationDineIn
	roomNum := strings.TrimSpace(input.RoomNumber)

	slugLower := strings.ToLower(targetTableSlug)
	if input.Destination == "room_service" || roomNum != "" || strings.HasPrefix(slugLower, "room-") || strings.HasPrefix(slugLower, "suite-") {
		orderDest = domainorder.DestinationRoomService
		orderSource = domainorder.SourceQRRoom
		orderNum = fmt.Sprintf("#IRD-%d", rNum)
		if roomNum == "" {
			roomNum = strings.TrimPrefix(strings.TrimPrefix(slugLower, "room-"), "suite-")
		}
	}

	orderTimelineNote := "Order placed via digital QR menu"
	if orderDest == domainorder.DestinationRoomService {
		orderTimelineNote = fmt.Sprintf("In-Room Dining order placed for Suite %s", strings.ToUpper(roomNum))
	}

	now := time.Now().UTC()
	ord := &domainorder.Order{
		ID:                  bson.NewObjectID(),
		TenantID:            t.ID,
		OrderNumber:         orderNum,
		Destination:         orderDest,
		TableID:             tableID,
		TableName:           tableName,
		RoomNumber:          strings.ToUpper(roomNum),
		ChargeToFolio:       input.ChargeToFolio,
		CustomerName:        input.CustomerName,
		CustomerPhone:       input.CustomerPhone,
		Items:               orderItems,
		Currency:            t.Currency,
		Source:              orderSource,
		Status:              domainorder.StatusPending,
		PaymentStatus:       domainorder.PaymentUnpaid,
		SpecialInstructions: input.SpecialInstructions,
		Timeline: []domainorder.OrderTimeline{
			{
				Status:    domainorder.StatusPending,
				Timestamp: now,
				Note:      orderTimelineNote,
			},
		},
		CreatedAt: now,
		UpdatedAt: now,
	}

	// Calculate totals with 5% standard dining tax or tenant tax
	ord.CalculateTotals(5.0)

	// 5. Insert order
	orderColl := s.db.Collection("orders")
	scope := mongoinfra.NewScope(orderColl, t.ID)
	if _, err := scope.InsertOne(ctx, ord); err != nil {
		return nil, err
	}

	// 6. Update table/room active order and occupancy
	if tableID != nil {
		tableColl := s.db.Collection("tables")
		_, _ = tableColl.UpdateOne(ctx,
			bson.M{"_id": *tableID},
			bson.M{"$set": bson.M{
				"status":        domaintable.StatusOccupied,
				"activeOrderId": ord.ID,
				"updatedAt":     now,
			}},
		)
	}
	if roomNum != "" {
		roomsColl := s.db.Collection("rooms")
		_, _ = roomsColl.UpdateOne(ctx,
			bson.M{"tenantId": t.ID, "$or": []bson.M{
				{"roomNumber": strings.ToUpper(roomNum)},
				{"roomNumber": roomNum},
			}},
			bson.M{"$set": bson.M{
				"status":    "occupied",
				"updatedAt": now,
			}},
		)
	}

	// 7. Upsert Customer in CRM Collection
	if input.CustomerPhone != "" || input.CustomerName != "" {
		custColl := s.db.Collection("customers")
		custFilter := bson.M{"tenantId": t.ID}
		if input.CustomerPhone != "" {
			custFilter["phone"] = input.CustomerPhone
		} else {
			custFilter["name"] = input.CustomerName
		}
		custUpdate := bson.M{
			"$set": bson.M{
				"name":        input.CustomerName,
				"phone":       input.CustomerPhone,
				"lastOrderAt": now,
				"updatedAt":   now,
			},
			"$inc": bson.M{
				"totalOrders": 1,
				"totalSpent":  ord.TotalAmount,
			},
			"$setOnInsert": bson.M{
				"_id":       bson.NewObjectID(),
				"tenantId":  t.ID,
				"createdAt": now,
			},
		}
		_, _ = custColl.UpdateOne(ctx, custFilter, custUpdate, options.UpdateOne().SetUpsert(true))
	}

	// 8. Broadcast real-time event to KDS screens
	s.hub.Broadcast(&realtime.OrderEvent{
		TenantID:  t.ID.Hex(),
		EventType: realtime.EventOrderCreated,
		Order:     ord,
	})

	return ord, nil
}

func (s *Service) ListOrders(ctx context.Context, tenantID bson.ObjectID, status *domainorder.OrderStatus) ([]domainorder.Order, error) {
	orderColl := s.db.Collection("orders")
	scope := mongoinfra.NewScope(orderColl, tenantID)

	filter := bson.M{}
	if status != nil && *status != "" {
		filter["status"] = *status
	}

	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	cursor, err := scope.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var orders []domainorder.Order
	if err := cursor.All(ctx, &orders); err != nil {
		return nil, err
	}
	if orders == nil {
		orders = []domainorder.Order{}
	}
	return orders, nil
}

func (s *Service) UpdateOrderStatus(ctx context.Context, tenantID bson.ObjectID, orderIDStr string, nextStatus domainorder.OrderStatus, note string) (*domainorder.Order, error) {
	orderColl := s.db.Collection("orders")
	cleanID := strings.TrimSpace(orderIDStr)

	var ord domainorder.Order
	var findErr error

	if oid, err := bson.ObjectIDFromHex(cleanID); err == nil {
		findErr = orderColl.FindOne(ctx, bson.M{"tenantId": tenantID, "_id": oid}).Decode(&ord)
	}

	if findErr != nil || ord.ID.IsZero() {
		withHash := cleanID
		if !strings.HasPrefix(withHash, "#") {
			withHash = "#" + withHash
		}
		withoutHash := strings.TrimPrefix(cleanID, "#")

		findErr = orderColl.FindOne(ctx, bson.M{
			"tenantId": tenantID,
			"$or": []bson.M{
				{"orderNumber": cleanID},
				{"orderNumber": withHash},
				{"orderNumber": withoutHash},
			},
		}).Decode(&ord)
	}

	if findErr != nil {
		return nil, errors.New("order not found")
	}

	if err := ord.TransitionTo(nextStatus, note); err != nil {
		return nil, err
	}

	update := bson.M{
		"$set": bson.M{
			"status":    ord.Status,
			"timeline":  ord.Timeline,
			"updatedAt": ord.UpdatedAt,
		},
	}
	if _, err := orderColl.UpdateOne(ctx, bson.M{"_id": ord.ID}, update); err != nil {
		return nil, err
	}

	// If served, completed, or cancelled, release the table
	if ord.TableID != nil && (nextStatus == domainorder.StatusServed || nextStatus == domainorder.StatusPaid || nextStatus == domainorder.StatusCancelled) {
		tableColl := s.db.Collection("tables")
		_, _ = tableColl.UpdateOne(ctx,
			bson.M{"_id": *ord.TableID, "activeOrderId": ord.ID},
			bson.M{"$set": bson.M{
				"status":        domaintable.StatusAvailable,
				"activeOrderId": nil,
				"updatedAt":     time.Now().UTC(),
			}},
		)
	}

	// Broadcast update to KDS and Customer tracking screens
	s.hub.Broadcast(&realtime.OrderEvent{
		TenantID:  tenantID.Hex(),
		EventType: realtime.EventOrderBumped,
		Order:     &ord,
	})

	return &ord, nil
}

func (s *Service) GetOrderByID(ctx context.Context, orderIDStr string) (*domainorder.Order, error) {
	orderColl := s.db.Collection("orders")
	cleanID := strings.TrimSpace(orderIDStr)

	var ord domainorder.Order
	var err error

	if oid, hexErr := bson.ObjectIDFromHex(cleanID); hexErr == nil {
		err = orderColl.FindOne(ctx, bson.M{"_id": oid}).Decode(&ord)
		if err == nil {
			return &ord, nil
		}
	}

	withHash := cleanID
	if !strings.HasPrefix(withHash, "#") {
		withHash = "#" + withHash
	}
	withoutHash := strings.TrimPrefix(cleanID, "#")

	err = orderColl.FindOne(ctx, bson.M{
		"$or": []bson.M{
			{"orderNumber": cleanID},
			{"orderNumber": withHash},
			{"orderNumber": withoutHash},
		},
	}).Decode(&ord)

	if err == mongo.ErrNoDocuments {
		return nil, errors.New("order not found")
	}
	if err != nil {
		return nil, err
	}
	return &ord, nil
}
