package whatsapp

import (
	"context"
	"fmt"
	"strings"

	domainorder "github.com/dineflow/api/internal/domain/order"
	domainwa "github.com/dineflow/api/internal/domain/whatsapp"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// SetAdminAlertConfig configures the admin phone numbers and large order monetary threshold.
func (s *Service) SetAdminAlertConfig(numbers []string, threshold float64) {
	s.adminNumbers = numbers
	if threshold <= 0 {
		threshold = 1500.0
	}
	s.largeOrderThreshold = threshold
}

// ── Customer Notifications (Phase 5) ──────────────────────────────────────────

// NotifyOrderConfirmed sends automated confirmation message to customer.
func (s *Service) NotifyOrderConfirmed(ctx context.Context, tenantID bson.ObjectID, ord *domainorder.Order) {
	phone := strings.TrimSpace(ord.CustomerPhone)
	if phone == "" || s.IsOptedOut(phone) || s.provider == nil {
		return
	}

	custName := strings.TrimSpace(ord.CustomerName)
	if custName == "" {
		custName = "Valued Guest"
	}

	trackingURL := fmt.Sprintf("https://dineflow-steel.vercel.app/m/the-grand-bistro/order/%s", ord.OrderNumber)
	loc := ord.TableName
	if ord.RoomNumber != "" {
		loc = fmt.Sprintf("Suite %s", ord.RoomNumber)
	}

	body := fmt.Sprintf("Hi %s,\n\n"+
		"Your order %s has been confirmed.\n"+
		"Estimated preparation time: 15 minutes.\n\n"+
		"📍 Live Tracker: %s\n\n"+
		"Reply STOP to opt-out.", custName, ord.OrderNumber, trackingURL)

	extID, _ := s.provider.SendText(ctx, phone, body)
	_, _ = s.LogMessage(ctx, tenantID, phone, custName, domainwa.TemplateOrderConfirmed, body, loc, domainwa.StatusDelivered, extID)
}

// NotifyOrderReady alerts customer when kitchen finishes preparation.
func (s *Service) NotifyOrderReady(ctx context.Context, tenantID bson.ObjectID, ord *domainorder.Order) {
	phone := strings.TrimSpace(ord.CustomerPhone)
	if phone == "" || s.IsOptedOut(phone) || s.provider == nil {
		return
	}

	custName := strings.TrimSpace(ord.CustomerName)
	if custName == "" {
		custName = "Guest"
	}

	loc := ord.TableName
	if ord.RoomNumber != "" {
		loc = fmt.Sprintf("Suite %s", ord.RoomNumber)
	}

	body := fmt.Sprintf("🔔 Chef's update for %s:\n\n"+
		"Your order %s is ready for pickup at %s!\n\n"+
		"Bon appétit!", custName, ord.OrderNumber, loc)

	extID, _ := s.provider.SendText(ctx, phone, body)
	_, _ = s.LogMessage(ctx, tenantID, phone, custName, domainwa.TemplateKitchenReady, body, loc, domainwa.StatusDelivered, extID)
}

// NotifyOrderCancelled alerts customer if their order is cancelled or rejected.
func (s *Service) NotifyOrderCancelled(ctx context.Context, tenantID bson.ObjectID, ord *domainorder.Order) {
	phone := strings.TrimSpace(ord.CustomerPhone)
	if phone == "" || s.IsOptedOut(phone) || s.provider == nil {
		return
	}

	custName := strings.TrimSpace(ord.CustomerName)
	if custName == "" {
		custName = "Guest"
	}

	loc := ord.TableName
	if ord.RoomNumber != "" {
		loc = fmt.Sprintf("Suite %s", ord.RoomNumber)
	}

	body := fmt.Sprintf("❌ Hi %s,\n\n"+
		"Your order %s has been cancelled.\n"+
		"If you have any questions or need assistance, please contact restaurant staff.", custName, ord.OrderNumber)

	extID, _ := s.provider.SendText(ctx, phone, body)
	_, _ = s.LogMessage(ctx, tenantID, phone, custName, domainwa.TemplateOrderConfirmed, body, loc, domainwa.StatusDelivered, extID)
}

// ── Admin Alerts (Phase 6) ───────────────────────────────────────────────────

// NotifyAdminNewOrder sends alert to configured admin WhatsApp numbers.
func (s *Service) NotifyAdminNewOrder(ctx context.Context, tenantID bson.ObjectID, ord *domainorder.Order) {
	if len(s.adminNumbers) == 0 || s.provider == nil {
		return
	}

	loc := ord.TableName
	if ord.RoomNumber != "" {
		loc = fmt.Sprintf("Suite %s", ord.RoomNumber)
	}

	alertText := fmt.Sprintf("🔔 *New Order Received*\n\n"+
		"Table: %s\n"+
		"Order: %s\n"+
		"Amount: ₹%.0f\n"+
		"Items: %d", loc, ord.OrderNumber, ord.TotalAmount, len(ord.Items))

	for _, adminPhone := range s.adminNumbers {
		_, _ = s.provider.SendText(ctx, adminPhone, alertText)
	}
}

// NotifyAdminLargeOrder alerts admins when an order exceeds the threshold.
func (s *Service) NotifyAdminLargeOrder(ctx context.Context, tenantID bson.ObjectID, ord *domainorder.Order) {
	if len(s.adminNumbers) == 0 || s.provider == nil {
		return
	}
	if s.largeOrderThreshold <= 0 {
		s.largeOrderThreshold = 1500.0
	}
	if ord.TotalAmount < s.largeOrderThreshold {
		return
	}

	loc := ord.TableName
	if ord.RoomNumber != "" {
		loc = fmt.Sprintf("Suite %s", ord.RoomNumber)
	}

	alertText := fmt.Sprintf("⚠️ *Large Order Alert*\n\n"+
		"Table: %s\n"+
		"Order: %s\n"+
		"Amount: ₹%.0f (Threshold: ₹%.0f)\n"+
		"Items: %d", loc, ord.OrderNumber, ord.TotalAmount, s.largeOrderThreshold, len(ord.Items))

	for _, adminPhone := range s.adminNumbers {
		_, _ = s.provider.SendText(ctx, adminPhone, alertText)
	}
}

// NotifyAdminOrderCancelled alerts admins when an order is cancelled.
func (s *Service) NotifyAdminOrderCancelled(ctx context.Context, tenantID bson.ObjectID, ord *domainorder.Order) {
	if len(s.adminNumbers) == 0 || s.provider == nil {
		return
	}

	loc := ord.TableName
	if ord.RoomNumber != "" {
		loc = fmt.Sprintf("Suite %s", ord.RoomNumber)
	}

	alertText := fmt.Sprintf("❌ *Order Cancelled Alert*\n\n"+
		"Table: %s\n"+
		"Order: %s\n"+
		"Amount: ₹%.0f", loc, ord.OrderNumber, ord.TotalAmount)

	for _, adminPhone := range s.adminNumbers {
		_, _ = s.provider.SendText(ctx, adminPhone, alertText)
	}
}
