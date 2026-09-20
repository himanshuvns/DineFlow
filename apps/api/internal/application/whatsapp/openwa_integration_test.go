package whatsapp

import (
	"context"
	"testing"

	domainorder "github.com/dineflow/api/internal/domain/order"
	"github.com/dineflow/api/internal/messaging"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func TestRuleBasedCommands(t *testing.T) {
	svc := NewService(nil)
	ctx := context.Background()

	// Test "Hi"
	reply, handled := svc.ProcessRuleBasedCommand(ctx, bson.NilObjectID, "+91 98000 12345", "Hi")
	if !handled {
		t.Fatalf("Expected 'Hi' to be handled")
	}
	if reply == "" {
		t.Errorf("Expected non-empty reply for 'Hi'")
	}

	// Test "Menu"
	reply, handled = svc.ProcessRuleBasedCommand(ctx, bson.NilObjectID, "+91 98000 12345", "menu")
	if !handled {
		t.Fatalf("Expected 'menu' to be handled")
	}
	if reply == "" {
		t.Errorf("Expected menu link in reply")
	}

	// Test unhandled command
	_, handled = svc.ProcessRuleBasedCommand(ctx, bson.NilObjectID, "+91 98000 12345", "random text")
	if handled {
		t.Errorf("Expected 'random text' not to be handled by rule-based commands")
	}
}

func TestOrderNotificationsAndAdminAlerts(t *testing.T) {
	mockProv := messaging.NewMockProvider()
	svc := NewService(nil)
	svc.SetProvider(mockProv)
	svc.SetAdminAlertConfig([]string{"+91 99999 00000"}, 1000.0)

	ctx := context.Background()
	ord := &domainorder.Order{
		ID:            bson.NewObjectID(),
		OrderNumber:   "ORD-1234",
		CustomerName:  "Rahul",
		CustomerPhone: "+91 98000 12345",
		TableName:     "Table 5",
		TotalAmount:   1650.0, // Exceeds 1000 threshold
		Items: []domainorder.OrderItem{
			{Name: "Paneer Tikka", Quantity: 2, UnitPrice: 350},
			{Name: "Butter Naan", Quantity: 4, UnitPrice: 60},
		},
	}

	// 1. Customer Order Confirmed
	svc.NotifyOrderConfirmed(ctx, bson.NilObjectID, ord)
	// 2. Admin New Order & Large Order
	svc.NotifyAdminNewOrder(ctx, bson.NilObjectID, ord)
	svc.NotifyAdminLargeOrder(ctx, bson.NilObjectID, ord)

	msgs := mockProv.GetSentMessages()
	if len(msgs) != 3 {
		t.Fatalf("Expected 3 messages sent, got %d", len(msgs))
	}

	// Check customer message
	custMsg := msgs[0]
	if custMsg.To != "919800012345" {
		t.Errorf("Expected customer recipient 919800012345, got %s", custMsg.To)
	}

	// Check admin message
	adminMsg := msgs[1]
	if adminMsg.To != "919999900000" {
		t.Errorf("Expected admin recipient 919999900000, got %s", adminMsg.To)
	}

	// Check large order alert
	largeMsg := msgs[2]
	if largeMsg.To != "919999900000" {
		t.Errorf("Expected large order alert recipient 919999900000, got %s", largeMsg.To)
	}
}
