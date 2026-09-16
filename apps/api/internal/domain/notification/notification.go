package notification

import (
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Category string

const (
	CategoryOrders       Category = "orders"
	CategoryRoomService  Category = "room_service"
	CategoryReservations Category = "reservations"
	CategoryHousekeeping Category = "housekeeping"
	CategoryPayments     Category = "payments"
	CategoryMenu         Category = "menu"
	CategoryStaff        Category = "staff"
	CategorySystem       Category = "system"
)

type Priority string

const (
	PriorityLow      Priority = "low"
	PriorityMedium   Priority = "medium"
	PriorityHigh     Priority = "high"
	PriorityCritical Priority = "critical"
)

// Notification represents a tenant-scoped notification document stored in MongoDB.
type Notification struct {
	ID        bson.ObjectID          `bson:"_id,omitempty" json:"id"`
	TenantID  bson.ObjectID          `bson:"tenantId" json:"tenantId"`
	UserID    *bson.ObjectID         `bson:"userId,omitempty" json:"userId,omitempty"`
	Category  Category               `bson:"category" json:"category"`
	Title     string                 `bson:"title" json:"title"`
	Message   string                 `bson:"message" json:"message"`
	Priority  Priority               `bson:"priority" json:"priority"`
	Read      bool                   `bson:"read" json:"read"`
	ActionURL string                 `bson:"actionUrl" json:"actionUrl"`
	Metadata  map[string]interface{} `bson:"metadata,omitempty" json:"metadata,omitempty"`
	CreatedAt time.Time              `bson:"createdAt" json:"createdAt"`
	ExpiresAt *time.Time             `bson:"expiresAt,omitempty" json:"expiresAt,omitempty"`
}

// Validate checks required fields of a notification.
func (n *Notification) Validate() error {
	if n.TenantID.IsZero() {
		return errors.New("tenantId is required")
	}
	if n.Title == "" {
		return errors.New("title is required")
	}
	if n.Message == "" {
		return errors.New("message is required")
	}
	if n.Category == "" {
		n.Category = CategorySystem
	}
	if n.Priority == "" {
		n.Priority = PriorityMedium
	}
	if n.CreatedAt.IsZero() {
		n.CreatedAt = time.Now().UTC()
	}
	return nil
}
