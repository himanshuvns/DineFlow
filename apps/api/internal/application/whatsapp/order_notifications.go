package whatsapp

import (
	"context"
	"fmt"
	"strings"

	domainorder "github.com/dineflow/api/internal/domain/order"
	domainroom "github.com/dineflow/api/internal/domain/room"
	domainuser "github.com/dineflow/api/internal/domain/user"
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

// NotifyStaffHousekeepingRequest alerts EVERY staff member with a registered phone number when a housekeeping request arrives.
func (s *Service) NotifyStaffHousekeepingRequest(ctx context.Context, tenantID bson.ObjectID, task *domainroom.HousekeepingTask, staffList []domainuser.User) {
	if s.provider == nil || len(staffList) == 0 {
		return
	}

	assigned := "Pending Assignment (All staff busy)"
	if task.AssignedToName != "" {
		assigned = task.AssignedToName
	}

	priorityUpper := strings.ToUpper(task.Priority)
	if priorityUpper == "" {
		priorityUpper = "NORMAL"
	}

	roomLoc := fmt.Sprintf("Suite %s", task.RoomNumber)

	body := fmt.Sprintf("🧹 *New Housekeeping Request*\n\n"+
		"📍 Location: %s\n"+
		"📋 Service: %s\n"+
		"⚡ Priority: %s\n"+
		"👤 Assigned To: %s\n", roomLoc, task.Title, priorityUpper, assigned)

	if task.Notes != "" {
		body += fmt.Sprintf("📝 Notes: %s\n", task.Notes)
	}
	body += fmt.Sprintf("⏰ Dispatched: %s\n\n"+
		"Please check the staff dashboard to coordinate.", task.CreatedAt.Format("03:04 PM"))

	for _, st := range staffList {
		phone := strings.TrimSpace(st.Phone)
		if phone == "" || s.IsOptedOut(phone) {
			continue
		}
		extID, _ := s.provider.SendText(ctx, phone, body)
		stName := st.Name
		if stName == "" {
			stName = "Staff Member"
		}
		_, _ = s.LogMessage(ctx, tenantID, phone, stName, domainwa.TemplateRoomService, body, roomLoc, domainwa.StatusDelivered, extID)
	}
}

// NotifyStaffTaskAssigned alerts an individual housekeeper when they are assigned a request.
func (s *Service) NotifyStaffTaskAssigned(ctx context.Context, tenantID bson.ObjectID, task *domainroom.HousekeepingTask, staffPhone, staffName string) {
	phone := strings.TrimSpace(staffPhone)
	if phone == "" || s.provider == nil || s.IsOptedOut(phone) {
		return
	}

	roomLoc := fmt.Sprintf("Suite %s", task.RoomNumber)
	body := fmt.Sprintf("🛎️ *Task Assigned to You*\n\n"+
		"Hi %s,\n"+
		"You have been assigned the following housekeeping service:\n\n"+
		"📍 Location: %s\n"+
		"📋 Service: %s\n"+
		"⚡ Priority: %s\n", staffName, roomLoc, task.Title, strings.ToUpper(task.Priority))

	if task.Notes != "" {
		body += fmt.Sprintf("📝 Notes: %s\n", task.Notes)
	}
	body += "\nPlease attend to this guest request promptly."

	extID, _ := s.provider.SendText(ctx, phone, body)
	_, _ = s.LogMessage(ctx, tenantID, phone, staffName, domainwa.TemplateRoomService, body, roomLoc, domainwa.StatusDelivered, extID)
}

