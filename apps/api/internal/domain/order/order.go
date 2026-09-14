package order

import (
	"errors"
	"fmt"
	"math"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type OrderStatus string

const (
	StatusPending   OrderStatus = "pending"   // Arrived from customer QR, awaiting kitchen acceptance
	StatusPreparing OrderStatus = "preparing" // Cooking in kitchen (KDS)
	StatusReady     OrderStatus = "ready"     // Plated, ready for waiter/steward dispatch
	StatusServed    OrderStatus = "served"    // Delivered to table/room
	StatusPaid      OrderStatus = "paid"      // Bill settled
	StatusCancelled OrderStatus = "cancelled" // Cancelled
)

type OrderSource string

const (
	SourceQRTable  OrderSource = "qr_table"
	SourceQRRoom   OrderSource = "qr_room"
	SourceWhatsApp OrderSource = "whatsapp"
	SourcePOS      OrderSource = "pos"
)

type DestinationType string

const (
	DestinationDineIn      DestinationType = "dine_in"
	DestinationRoomService DestinationType = "room_service"
	DestinationTakeaway    DestinationType = "takeaway"
)

type StationType string

const (
	StationMainKitchen StationType = "main_kitchen"
	StationBar         StationType = "bar"
	StationRoomService StationType = "room_service"
	StationDessert     StationType = "dessert"
)

type PaymentStatus string

const (
	PaymentUnpaid PaymentStatus = "unpaid"
	PaymentPaid   PaymentStatus = "paid"
)

type OrderItemModifier struct {
	Name  string  `bson:"name" json:"name"`
	Price float64 `bson:"price" json:"price"`
}

type OrderItem struct {
	MenuItemID        bson.ObjectID       `bson:"menuItemId" json:"menuItemId"`
	Name              string              `bson:"name" json:"name"`
	Quantity          int                 `bson:"quantity" json:"quantity"`
	UnitPrice         float64             `bson:"unitPrice" json:"unitPrice"`
	SelectedVariant   *string             `bson:"selectedVariant,omitempty" json:"selectedVariant,omitempty"`
	SelectedModifiers []OrderItemModifier `bson:"selectedModifiers,omitempty" json:"selectedModifiers,omitempty"`
	Station           StationType         `bson:"station,omitempty" json:"station,omitempty"`
	Notes             string              `bson:"notes,omitempty" json:"notes,omitempty"`
	TotalPrice        float64             `bson:"totalPrice" json:"totalPrice"`
}

type OrderTimeline struct {
	Status    OrderStatus `bson:"status" json:"status"`
	Timestamp time.Time   `bson:"timestamp" json:"timestamp"`
	Note      string      `bson:"note,omitempty" json:"note,omitempty"`
}

type Order struct {
	ID                  bson.ObjectID   `bson:"_id,omitempty" json:"id"`
	TenantID            bson.ObjectID   `bson:"tenantId" json:"tenantId"`
	OrderNumber         string          `bson:"orderNumber" json:"orderNumber"`
	Destination         DestinationType `bson:"destination,omitempty" json:"destination,omitempty"`
	TableID             *bson.ObjectID  `bson:"tableId,omitempty" json:"tableId,omitempty"`
	TableName           string          `bson:"tableName" json:"tableName"`
	RoomNumber          string          `bson:"roomNumber,omitempty" json:"roomNumber,omitempty"`
	ChargeToFolio       bool            `bson:"chargeToFolio,omitempty" json:"chargeToFolio,omitempty"`
	RoomServiceFee      float64         `bson:"roomServiceFee,omitempty" json:"roomServiceFee,omitempty"`
	DeliverySchedule    string          `bson:"deliverySchedule,omitempty" json:"deliverySchedule,omitempty"`
	CustomerName        string          `bson:"customerName,omitempty" json:"customerName,omitempty"`
	CustomerPhone       string          `bson:"customerPhone,omitempty" json:"customerPhone,omitempty"`
	Items               []OrderItem     `bson:"items" json:"items"`
	Subtotal            float64         `bson:"subtotal" json:"subtotal"`
	TaxAmount           float64         `bson:"taxAmount" json:"taxAmount"`
	TotalAmount         float64         `bson:"totalAmount" json:"totalAmount"`
	Total               float64         `bson:"total,omitempty" json:"total"`
	Currency            string          `bson:"currency" json:"currency"`
	Source              OrderSource     `bson:"source" json:"source"`
	Status              OrderStatus     `bson:"status" json:"status"`
	PaymentStatus       PaymentStatus   `bson:"paymentStatus" json:"paymentStatus"`
	SpecialInstructions string          `bson:"specialInstructions,omitempty" json:"specialInstructions,omitempty"`
	Timeline            []OrderTimeline `bson:"timeline" json:"timeline"`
	CreatedAt           time.Time       `bson:"createdAt" json:"createdAt"`
	UpdatedAt           time.Time       `bson:"updatedAt" json:"updatedAt"`
}

// CalculateTotals computes line items, subtotal, taxes, room service fees, and final total.
func (o *Order) CalculateTotals(taxRatePercent float64) {
	var subtotal float64
	for i := range o.Items {
		item := &o.Items[i]
		if item.Quantity <= 0 {
			item.Quantity = 1
		}
		itemTotal := item.UnitPrice
		for _, mod := range item.SelectedModifiers {
			itemTotal += mod.Price
		}
		item.TotalPrice = round(itemTotal * float64(item.Quantity))
		subtotal += item.TotalPrice
	}

	o.Subtotal = round(subtotal)
	if taxRatePercent > 0 {
		o.TaxAmount = round(o.Subtotal * (taxRatePercent / 100.0))
	} else {
		o.TaxAmount = 0
	}
	o.TotalAmount = round(o.Subtotal + o.TaxAmount + o.RoomServiceFee)
	o.Total = o.TotalAmount
}

// CanTransitionTo validates state machine transitions.
func (o *Order) CanTransitionTo(next OrderStatus) bool {
	if o.Status == StatusCancelled || o.Status == StatusPaid {
		return false // terminal states
	}
	if o.Status == next {
		return true
	}

	switch o.Status {
	case StatusPending:
		return next == StatusPreparing || next == StatusCancelled
	case StatusPreparing:
		return next == StatusReady || next == StatusCancelled
	case StatusReady:
		return next == StatusServed || next == StatusCancelled
	case StatusServed:
		return next == StatusPaid || next == StatusCancelled
	default:
		return false
	}
}

// TransitionTo updates status and records timestamp in timeline.
func (o *Order) TransitionTo(next OrderStatus, note string) error {
	if !o.CanTransitionTo(next) {
		return fmt.Errorf("invalid order status transition from %s to %s", o.Status, next)
	}

	o.Status = next
	o.Timeline = append(o.Timeline, OrderTimeline{
		Status:    next,
		Timestamp: time.Now().UTC(),
		Note:      note,
	})
	o.UpdatedAt = time.Now().UTC()
	return nil
}

func (o *Order) Validate() error {
	if o.TenantID.IsZero() {
		return errors.New("tenantId is required")
	}
	if len(o.Items) == 0 {
		return errors.New("order must contain at least one item")
	}
	if o.TotalAmount < 0 {
		return errors.New("total amount cannot be negative")
	}
	return nil
}

func round(val float64) float64 {
	return math.Round(val*100) / 100
}
