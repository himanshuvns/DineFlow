package order

import (
	"context"
	"errors"
	"fmt"
	"math/rand"
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
	MenuItemID      string   `json:"menuItemId"`
	Quantity        int      `json:"quantity"`
	SelectedVariant *string  `json:"selectedVariant,omitempty"`
	ModifierNames   []string `json:"modifierNames,omitempty"`
	Notes           string   `json:"notes,omitempty"`
}

type CreateOrderInput struct {
	TenantSlug          string              `json:"tenantSlug"`
	TableQRSlug         string              `json:"tableQRSlug"`
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

	// 1. Locate Tenant
	tenantColl := s.db.Collection("tenants")
	var t tenant.Tenant
	err := tenantColl.FindOne(ctx, bson.M{"slug": input.TenantSlug}).Decode(&t)
	if err == mongo.ErrNoDocuments {
		return nil, errors.New("restaurant workspace not found")
	}
	if err != nil {
		return nil, err
	}

	// 2. Locate Table (if QR ordering)
	var tableID *bson.ObjectID
	tableName := "Dine-in"
	if input.TableQRSlug != "" {
		tableColl := s.db.Collection("tables")
		var tbl domaintable.Table
		err := tableColl.FindOne(ctx, bson.M{"tenantId": t.ID, "qrSlug": input.TableQRSlug}).Decode(&tbl)
		if err == nil {
			tableID = &tbl.ID
			tableName = tbl.Name
		}
	}

	// 3. Build verified OrderItems from database
	menuColl := s.db.Collection("menu_items")
	var orderItems []domainorder.OrderItem

	for _, reqItem := range input.Items {
		itemOID, err := bson.ObjectIDFromHex(reqItem.MenuItemID)
		if err != nil {
			return nil, fmt.Errorf("invalid menu item id: %s", reqItem.MenuItemID)
		}

		var mItem domainmenu.MenuItem
		err = menuColl.FindOne(ctx, bson.M{"tenantId": t.ID, "_id": itemOID}).Decode(&mItem)
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("menu item not found: %s", reqItem.MenuItemID)
		}
		if err != nil {
			return nil, err
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

		// Calculate modifiers
		var matchedModifiers []domainorder.OrderItemModifier
		for _, modName := range reqItem.ModifierNames {
			for _, grp := range mItem.ModifierGroups {
				for _, opt := range grp.Options {
					if opt.Name == modName {
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

	// 4. Generate human-readable order number #ORD-XXXX
	rNum := rand.Intn(9000) + 1000
	orderNum := fmt.Sprintf("#ORD-%d", rNum)

	now := time.Now().UTC()
	ord := &domainorder.Order{
		ID:                  bson.NewObjectID(),
		TenantID:            t.ID,
		OrderNumber:         orderNum,
		TableID:             tableID,
		TableName:           tableName,
		CustomerName:        input.CustomerName,
		CustomerPhone:       input.CustomerPhone,
		Items:               orderItems,
		Currency:            t.Currency,
		Source:              domainorder.SourceQRTable,
		Status:              domainorder.StatusPending,
		PaymentStatus:       domainorder.PaymentUnpaid,
		SpecialInstructions: input.SpecialInstructions,
		Timeline: []domainorder.OrderTimeline{
			{
				Status:    domainorder.StatusPending,
				Timestamp: now,
				Note:      "Order placed via digital QR menu",
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

	// 6. Update table active order and occupancy
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

	// 7. Broadcast real-time event to KDS screens
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

func (s *Service) UpdateOrderStatus(ctx context.Context, tenantID, orderID bson.ObjectID, nextStatus domainorder.OrderStatus, note string) (*domainorder.Order, error) {
	orderColl := s.db.Collection("orders")
	scope := mongoinfra.NewScope(orderColl, tenantID)

	var ord domainorder.Order
	if err := scope.FindByID(ctx, orderID, &ord); err != nil {
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
	if _, err := scope.UpdateByID(ctx, orderID, update); err != nil {
		return nil, err
	}

	// Broadcast update to KDS and Customer tracking screens
	s.hub.Broadcast(&realtime.OrderEvent{
		TenantID:  tenantID.Hex(),
		EventType: realtime.EventOrderBumped,
		Order:     &ord,
	})

	return &ord, nil
}

func (s *Service) GetOrderByID(ctx context.Context, orderID bson.ObjectID) (*domainorder.Order, error) {
	orderColl := s.db.Collection("orders")
	var ord domainorder.Order
	err := orderColl.FindOne(ctx, bson.M{"_id": orderID}).Decode(&ord)
	if err == mongo.ErrNoDocuments {
		return nil, errors.New("order not found")
	}
	if err != nil {
		return nil, err
	}
	return &ord, nil
}
