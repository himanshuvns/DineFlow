package notification

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	domainnotification "github.com/dineflow/api/internal/domain/notification"
	domainorder "github.com/dineflow/api/internal/domain/order"
	mongoinfra "github.com/dineflow/api/internal/infrastructure/mongodb"
	"github.com/dineflow/api/internal/infrastructure/realtime"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

const CollNotifications = "notifications"

type CreateNotificationInput struct {
	TenantID  bson.ObjectID                  `json:"tenantId"`
	UserID    *bson.ObjectID                 `json:"userId,omitempty"`
	Category  domainnotification.Category   `json:"category"`
	Title     string                         `json:"title"`
	Message   string                         `json:"message"`
	Priority  domainnotification.Priority   `json:"priority"`
	ActionURL string                         `json:"actionUrl"`
	Metadata  map[string]interface{}         `json:"metadata,omitempty"`
	ExpiresAt *time.Time                     `json:"expiresAt,omitempty"`
}

type ListFilter struct {
	Category string
	Priority string
	Read     *bool
	Search   string
	Page     int64
	Limit    int64
}

type Service struct {
	db  *mongoinfra.Client
	hub *realtime.Hub
}

func NewService(db *mongoinfra.Client, hub *realtime.Hub) *Service {
	return &Service{db: db, hub: hub}
}

// CreateNotification persists a notification document and dispatches it via the realtime Hub.
func (s *Service) CreateNotification(ctx context.Context, input CreateNotificationInput) (*domainnotification.Notification, error) {
	if input.TenantID.IsZero() {
		return nil, errors.New("tenantId is required")
	}

	cleanTitle := strings.TrimSpace(input.Title)
	for strings.Contains(cleanTitle, "##") {
		cleanTitle = strings.ReplaceAll(cleanTitle, "##", "#")
	}
	cleanMessage := strings.TrimSpace(input.Message)
	for strings.Contains(cleanMessage, "Table Table") {
		cleanMessage = strings.ReplaceAll(cleanMessage, "Table Table", "Table")
	}

	notif := &domainnotification.Notification{
		ID:        bson.NewObjectID(),
		TenantID:  input.TenantID,
		UserID:    input.UserID,
		Category:  input.Category,
		Title:     cleanTitle,
		Message:   cleanMessage,
		Priority:  input.Priority,
		Read:      false,
		ActionURL: strings.TrimSpace(input.ActionURL),
		Metadata:  input.Metadata,
		CreatedAt: time.Now().UTC(),
		ExpiresAt: input.ExpiresAt,
	}

	if err := notif.Validate(); err != nil {
		return nil, err
	}

	coll := s.db.Collection(CollNotifications)
	if _, err := coll.InsertOne(ctx, notif); err != nil {
		return nil, err
	}

	// Real-time broadcast to connected clients of this tenant
	if s.hub != nil {
		s.hub.BroadcastNotification(input.TenantID.Hex(), notif)
	}

	return notif, nil
}

// ListNotifications retrieves paginated notifications filtered by category, priority, read status, or search.
func (s *Service) ListNotifications(ctx context.Context, tenantID bson.ObjectID, filter ListFilter) ([]*domainnotification.Notification, int64, int64, error) {
	coll := s.db.Collection(CollNotifications)

	query := bson.M{
		"tenantId": tenantID,
	}

	if filter.Category != "" && filter.Category != "all" {
		query["category"] = filter.Category
	}
	if filter.Priority != "" && filter.Priority != "all" {
		query["priority"] = filter.Priority
	}
	if filter.Read != nil {
		query["read"] = *filter.Read
	}
	if filter.Search != "" {
		trimmed := strings.TrimSpace(filter.Search)
		query["$or"] = []bson.M{
			{"title": bson.M{"$regex": trimmed, "$options": "i"}},
			{"message": bson.M{"$regex": trimmed, "$options": "i"}},
		}
	}

	// Pagination defaults
	page := filter.Page
	if page < 1 {
		page = 1
	}
	limit := filter.Limit
	if limit < 1 || limit > 100 {
		limit = 30
	}
	skip := (page - 1) * limit

	findOpts := options.Find().
		SetSort(bson.D{{Key: "createdAt", Value: -1}}).
		SetSkip(skip).
		SetLimit(limit)

	cursor, err := coll.Find(ctx, query, findOpts)
	if err != nil {
		return nil, 0, 0, err
	}
	defer cursor.Close(ctx)

	var notifications []*domainnotification.Notification
	if err := cursor.All(ctx, &notifications); err != nil {
		return nil, 0, 0, err
	}
	if notifications == nil {
		notifications = make([]*domainnotification.Notification, 0)
	}

	totalCount, _ := coll.CountDocuments(ctx, query)

	// If workspace has no notifications at all, seed realistic initial notifications so the notification center isn't empty
	if totalCount == 0 && filter.Search == "" && (filter.Category == "" || filter.Category == "all") && (filter.Read == nil || !*filter.Read) {
		s.seedInitialNotifications(ctx, tenantID)
		// Re-run query to retrieve the newly created notifications
		cursor2, err2 := coll.Find(ctx, query, findOpts)
		if err2 == nil {
			defer cursor2.Close(ctx)
			var seeded []*domainnotification.Notification
			if err := cursor2.All(ctx, &seeded); err == nil && len(seeded) > 0 {
				notifications = seeded
				totalCount = int64(len(seeded))
			}
		}
	}

	unreadCount, _ := coll.CountDocuments(ctx, bson.M{
		"tenantId": tenantID,
		"read":     false,
	})

	return notifications, unreadCount, totalCount, nil
}

// seedInitialNotifications creates 3 introductory notifications for fresh or unseeded workspaces.
func (s *Service) seedInitialNotifications(ctx context.Context, tenantID bson.ObjectID) {
	now := time.Now().UTC()
	coll := s.db.Collection(CollNotifications)

	starterNotifications := []interface{}{
		&domainnotification.Notification{
			ID:        bson.NewObjectID(),
			TenantID:  tenantID,
			Category:  domainnotification.CategorySystem,
			Title:     "Workspace Operating System Active",
			Message:   "Digital dining, table QR menus, and kitchen display services are online.",
			Priority:  domainnotification.PriorityHigh,
			Read:      false,
			ActionURL: "/dashboard",
			CreatedAt: now.Add(-10 * time.Minute),
		},
		&domainnotification.Notification{
			ID:        bson.NewObjectID(),
			TenantID:  tenantID,
			Category:  domainnotification.CategoryOrders,
			Title:     "Real-Time Order Engine Ready",
			Message:   "Live notifications will stream here whenever guests order via table QR or room service.",
			Priority:  domainnotification.PriorityMedium,
			Read:      false,
			ActionURL: "/dashboard/orders",
			CreatedAt: now.Add(-5 * time.Minute),
		},
		&domainnotification.Notification{
			ID:        bson.NewObjectID(),
			TenantID:  tenantID,
			Category:  domainnotification.CategoryHousekeeping,
			Title:     "Hospitality & PMS Workflows Connected",
			Message:   "Guest service requests and housekeeping tasks will appear here in real-time.",
			Priority:  domainnotification.PriorityLow,
			Read:      false,
			ActionURL: "/dashboard/rooms",
			CreatedAt: now.Add(-1 * time.Minute),
		},
	}

	_, _ = coll.InsertMany(ctx, starterNotifications)
}

// GetUnreadCount returns the number of unread notifications for a tenant.
func (s *Service) GetUnreadCount(ctx context.Context, tenantID bson.ObjectID) (int64, error) {
	coll := s.db.Collection(CollNotifications)
	return coll.CountDocuments(ctx, bson.M{
		"tenantId": tenantID,
		"read":     false,
	})
}

// MarkAsRead marks a specific notification as read.
func (s *Service) MarkAsRead(ctx context.Context, tenantID bson.ObjectID, id string) error {
	oid, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("invalid notification ID")
	}

	coll := s.db.Collection(CollNotifications)
	res, err := coll.UpdateOne(
		ctx,
		bson.M{"_id": oid, "tenantId": tenantID},
		bson.M{"$set": bson.M{"read": true}},
	)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return errors.New("notification not found")
	}
	return nil
}

// MarkAllAsRead marks all notifications as read for a tenant.
func (s *Service) MarkAllAsRead(ctx context.Context, tenantID bson.ObjectID) (int64, error) {
	coll := s.db.Collection(CollNotifications)
	res, err := coll.UpdateMany(
		ctx,
		bson.M{"tenantId": tenantID, "read": false},
		bson.M{"$set": bson.M{"read": true}},
	)
	if err != nil {
		return 0, err
	}
	return res.ModifiedCount, nil
}

// ClearRead deletes all notifications marked as read for a tenant.
func (s *Service) ClearRead(ctx context.Context, tenantID bson.ObjectID) (int64, error) {
	coll := s.db.Collection(CollNotifications)
	res, err := coll.DeleteMany(
		ctx,
		bson.M{"tenantId": tenantID, "read": true},
	)
	if err != nil {
		return 0, err
	}
	return res.DeletedCount, nil
}

// ─── Domain Event Emitters ──────────────────────────────────────────────────

func cleanOrderNumber(num string) string {
	clean := strings.TrimSpace(num)
	for strings.HasPrefix(clean, "#") {
		clean = strings.TrimPrefix(clean, "#")
	}
	if clean == "" {
		return "ORD"
	}
	return clean
}

func cleanTableName(tbl string) string {
	trimmed := strings.TrimSpace(tbl)
	if trimmed == "" {
		return "Table"
	}
	for strings.HasPrefix(strings.ToLower(trimmed), "table table") {
		trimmed = strings.TrimPrefix(trimmed, "Table ")
		trimmed = strings.TrimPrefix(trimmed, "table ")
	}
	if strings.HasPrefix(strings.ToLower(trimmed), "table") {
		return trimmed
	}
	return "Table " + trimmed
}

func cleanGuestName(name string) string {
	trimmed := strings.TrimSpace(name)
	if trimmed == "" {
		return "Guest"
	}
	// Detect raw hex ID strings (e.g. 6 to 24 hex characters)
	if len(trimmed) >= 6 && len(trimmed) <= 24 {
		isHex := true
		for _, c := range trimmed {
			if !((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F')) {
				isHex = false
				break
			}
		}
		if isHex {
			return "Guest"
		}
	}
	return trimmed
}

// EmitOrderCreated fires a notification when a customer places a new order.
func (s *Service) EmitOrderCreated(ctx context.Context, tenantID bson.ObjectID, ord *domainorder.Order) error {
	category := domainnotification.CategoryOrders
	priority := domainnotification.PriorityHigh
	cleanOrdNum := cleanOrderNumber(ord.OrderNumber)
	cleanTbl := cleanTableName(ord.TableName)
	title := fmt.Sprintf("New Order Received — #%s", cleanOrdNum)
	message := fmt.Sprintf("%s • %d item(s) • ₹%.0f", cleanTbl, len(ord.Items), ord.TotalAmount)
	actionURL := "/dashboard/orders"

	if ord.Destination == "room_service" {
		category = domainnotification.CategoryRoomService
		title = fmt.Sprintf("Room Service Order — #%s", cleanOrdNum)
		message = fmt.Sprintf("Room %s • %d item(s) • ₹%.0f", ord.RoomNumber, len(ord.Items), ord.TotalAmount)
		actionURL = "/dashboard/rooms"
	}

	_, err := s.CreateNotification(ctx, CreateNotificationInput{
		TenantID:  tenantID,
		Category:  category,
		Title:     title,
		Message:   message,
		Priority:  priority,
		ActionURL: actionURL,
		Metadata: map[string]interface{}{
			"orderId":     ord.ID.Hex(),
			"orderNumber": cleanOrdNum,
			"table":       cleanTbl,
			"destination": string(ord.Destination),
		},
	})
	return err
}

// EmitOrderUpdated fires a notification when an order status changes.
func (s *Service) EmitOrderUpdated(ctx context.Context, tenantID bson.ObjectID, ord *domainorder.Order) error {
	var title, message string
	priority := domainnotification.PriorityMedium
	category := domainnotification.CategoryOrders
	cleanOrdNum := cleanOrderNumber(ord.OrderNumber)
	cleanTbl := cleanTableName(ord.TableName)

	switch ord.Status {
	case domainorder.StatusServed:
		title = fmt.Sprintf("Order Delivered — #%s", cleanOrdNum)
		message = fmt.Sprintf("%s order has been delivered to the customer.", cleanTbl)
	case domainorder.StatusCancelled:
		title = fmt.Sprintf("Order Cancelled — #%s", cleanOrdNum)
		message = fmt.Sprintf("Order #%s has been cancelled.", cleanOrdNum)
		priority = domainnotification.PriorityHigh
	case domainorder.StatusPaid:
		category = domainnotification.CategoryPayments
		title = fmt.Sprintf("Payment Received — #%s", cleanOrdNum)
		message = fmt.Sprintf("₹%.0f payment recorded for Order #%s.", ord.TotalAmount, cleanOrdNum)
		priority = domainnotification.PriorityMedium
	default:
		return nil // no notification for other status transitions
	}

	_, err := s.CreateNotification(ctx, CreateNotificationInput{
		TenantID:  tenantID,
		Category:  category,
		Title:     title,
		Message:   message,
		Priority:  priority,
		ActionURL: "/dashboard/orders",
		Metadata: map[string]interface{}{
			"orderId":     ord.ID.Hex(),
			"orderNumber": cleanOrdNum,
			"status":      string(ord.Status),
		},
	})
	return err
}

// EmitGuestCheckedIn fires when a guest checks into a room.
func (s *Service) EmitGuestCheckedIn(ctx context.Context, tenantID bson.ObjectID, guestName, roomNumber, roomID string) error {
	gName := cleanGuestName(guestName)
	_, err := s.CreateNotification(ctx, CreateNotificationInput{
		TenantID:  tenantID,
		Category:  domainnotification.CategoryReservations,
		Title:     fmt.Sprintf("Guest Checked In — Room %s", roomNumber),
		Message:   fmt.Sprintf("%s has checked in to Room %s.", gName, roomNumber),
		Priority:  domainnotification.PriorityHigh,
		ActionURL: fmt.Sprintf("/dashboard/rooms/%s", roomID),
		Metadata:  map[string]interface{}{"roomId": roomID, "roomNumber": roomNumber, "guestName": gName},
	})
	return err
}

// EmitGuestCheckedOut fires when a guest checks out of a room.
func (s *Service) EmitGuestCheckedOut(ctx context.Context, tenantID bson.ObjectID, guestName, roomNumber, roomID string) error {
	gName := cleanGuestName(guestName)
	_, err := s.CreateNotification(ctx, CreateNotificationInput{
		TenantID:  tenantID,
		Category:  domainnotification.CategoryReservations,
		Title:     fmt.Sprintf("Guest Checked Out — Room %s", roomNumber),
		Message:   fmt.Sprintf("%s has checked out from Room %s.", gName, roomNumber),
		Priority:  domainnotification.PriorityMedium,
		ActionURL: fmt.Sprintf("/dashboard/rooms/%s", roomID),
		Metadata:  map[string]interface{}{"roomId": roomID, "roomNumber": roomNumber, "guestName": gName},
	})
	return err
}

// EmitGuestStayExtended fires when an in-house guest extends their stay from the customer portal.
func (s *Service) EmitGuestStayExtended(ctx context.Context, tenantID bson.ObjectID, guestName, roomNumber, roomID string, oldCheckOut, newCheckOut time.Time, nights int) error {
	gName := cleanGuestName(guestName)
	formattedDate := newCheckOut.Format("02 Jan 2006, 03:04 PM")
	title := fmt.Sprintf("Stay Extended — Suite %s", roomNumber)
	message := fmt.Sprintf("%s extended stay until %s (+%d night(s)).", gName, formattedDate, nights)

	_, err := s.CreateNotification(ctx, CreateNotificationInput{
		TenantID:  tenantID,
		Category:  domainnotification.CategoryReservations,
		Title:     title,
		Message:   message,
		Priority:  domainnotification.PriorityHigh,
		ActionURL: fmt.Sprintf("/dashboard/rooms/%s", roomID),
		Metadata: map[string]interface{}{
			"roomId":           roomID,
			"roomNumber":       roomNumber,
			"guestName":        gName,
			"oldCheckOut":      oldCheckOut.Format(time.RFC3339),
			"newCheckOut":      newCheckOut.Format(time.RFC3339),
			"additionalNights": nights,
		},
	})
	return err
}

// EmitHousekeepingRequested fires when a guest requests a housekeeping service.
func (s *Service) EmitHousekeepingRequested(ctx context.Context, tenantID bson.ObjectID, taskTitle, roomNumber, roomID string) error {
	msg := strings.TrimSpace(taskTitle)
	if msg == "" {
		msg = fmt.Sprintf("Service request submitted for Room %s", roomNumber)
	}
	_, err := s.CreateNotification(ctx, CreateNotificationInput{
		TenantID:  tenantID,
		Category:  domainnotification.CategoryHousekeeping,
		Title:     fmt.Sprintf("Housekeeping Request — Room %s", roomNumber),
		Message:   msg,
		Priority:  domainnotification.PriorityHigh,
		ActionURL: fmt.Sprintf("/dashboard/rooms/%s", roomID),
		Metadata:  map[string]interface{}{"roomId": roomID, "roomNumber": roomNumber, "taskTitle": msg},
	})
	return err
}

// EmitHousekeepingCompleted fires when a staff member marks a housekeeping task as done.
func (s *Service) EmitHousekeepingCompleted(ctx context.Context, tenantID bson.ObjectID, taskTitle, roomNumber, roomID string) error {
	msg := strings.TrimSpace(taskTitle)
	if msg == "" {
		msg = fmt.Sprintf("Housekeeping service completed for Room %s", roomNumber)
	}
	_, err := s.CreateNotification(ctx, CreateNotificationInput{
		TenantID:  tenantID,
		Category:  domainnotification.CategoryHousekeeping,
		Title:     fmt.Sprintf("Housekeeping Done — Room %s", roomNumber),
		Message:   msg,
		Priority:  domainnotification.PriorityMedium,
		ActionURL: fmt.Sprintf("/dashboard/rooms/%s", roomID),
		Metadata:  map[string]interface{}{"roomId": roomID, "roomNumber": roomNumber},
	})
	return err
}

