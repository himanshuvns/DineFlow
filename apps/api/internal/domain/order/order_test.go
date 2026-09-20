package order_test

import (
	"testing"

	"github.com/dineflow/api/internal/domain/order"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func TestOrderCalculations(t *testing.T) {
	ord := &order.Order{
		TenantID: bson.NewObjectID(),
		Items: []order.OrderItem{
			{
				Name:      "Truffle Burger",
				UnitPrice: 500,
				Quantity:  2,
				SelectedModifiers: []order.OrderItemModifier{
					{Name: "Extra Cheddar", Price: 50},
					{Name: "Truffle Mayo", Price: 30},
				},
			},
			{
				Name:      "Cold Brew",
				UnitPrice: 200,
				Quantity:  1,
			},
		},
	}

	// (500 + 50 + 30) * 2 = 1160
	// 200 * 1 = 200
	// Subtotal = 1360
	// Tax (5%) = 68
	// Total = 1428
	ord.CalculateTotals(5.0)

	if ord.Subtotal != 1360.0 {
		t.Errorf("expected subtotal 1360.0, got %f", ord.Subtotal)
	}
	if ord.TaxAmount != 68.0 {
		t.Errorf("expected tax 68.0, got %f", ord.TaxAmount)
	}
	if ord.TotalAmount != 1428.0 {
		t.Errorf("expected total 1428.0, got %f", ord.TotalAmount)
	}
}

func TestOrderStatusTransitions(t *testing.T) {
	ord := &order.Order{
		Status: order.StatusPending,
	}

	// Pending -> Preparing should succeed
	if err := ord.TransitionTo(order.StatusPreparing, "Started cooking"); err != nil {
		t.Fatalf("expected valid transition, got: %v", err)
	}
	if ord.Status != order.StatusPreparing {
		t.Errorf("expected status preparing, got %s", ord.Status)
	}

	// Preparing -> Served should fail (must be Ready first)
	if err := ord.TransitionTo(order.StatusServed, "Direct serve"); err == nil {
		t.Errorf("expected error for illegal jump from preparing to served, got nil")
	}

	// Preparing -> Ready should succeed
	if err := ord.TransitionTo(order.StatusReady, "Plated"); err != nil {
		t.Fatalf("expected valid transition, got: %v", err)
	}

	// Ready -> Served should succeed
	if err := ord.TransitionTo(order.StatusServed, "Delivered"); err != nil {
		t.Fatalf("expected valid transition, got: %v", err)
	}

	// Served -> Paid should succeed
	if err := ord.TransitionTo(order.StatusPaid, "Cash payment"); err != nil {
		t.Fatalf("expected valid transition, got: %v", err)
	}

	// Paid is terminal -> cannot go to Preparing
	if ord.CanTransitionTo(order.StatusPreparing) {
		t.Errorf("paid order should not transition to preparing")
	}
}

func TestStaffRoomOrderFields(t *testing.T) {
	roomID := bson.NewObjectID()
	bookingID := bson.NewObjectID()

	ord := &order.Order{
		TenantID:      bson.NewObjectID(),
		OrderNumber:   "#IRD-1092",
		Destination:   order.DestinationRoomService,
		Source:        order.SourceFrontDesk,
		OrderSource:   "front_desk",
		PlacedBy:      "Front Desk - Rahul",
		RoomID:        &roomID,
		RoomNumber:    "204",
		BookingID:     &bookingID,
		BillingMethod: "charge_to_room",
		ChargeToFolio: true,
	}

	if ord.OrderSource != "front_desk" {
		t.Errorf("expected orderSource 'front_desk', got %s", ord.OrderSource)
	}
	if ord.PlacedBy != "Front Desk - Rahul" {
		t.Errorf("expected placedBy 'Front Desk - Rahul', got %s", ord.PlacedBy)
	}
	if ord.BillingMethod != "charge_to_room" {
		t.Errorf("expected billingMethod 'charge_to_room', got %s", ord.BillingMethod)
	}
	if ord.BookingID == nil || *ord.BookingID != bookingID {
		t.Errorf("expected bookingId to match")
	}
}

