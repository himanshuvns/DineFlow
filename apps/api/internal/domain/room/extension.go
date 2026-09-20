package room

import (
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type ExtensionStatus string

const (
	ExtensionPending  ExtensionStatus = "pending"
	ExtensionApproved ExtensionStatus = "approved"
	ExtensionRejected ExtensionStatus = "rejected"
)

// StayExtensionRequest represents a formal guest request to extend their reservation checkout date.
type StayExtensionRequest struct {
	ID                bson.ObjectID   `bson:"_id,omitempty" json:"id"`
	RequestID         string          `bson:"requestId" json:"requestId"`
	TenantID          bson.ObjectID   `bson:"tenantId" json:"tenantId"`
	BookingID         *bson.ObjectID  `bson:"bookingId,omitempty" json:"bookingId,omitempty"`
	RoomID            bson.ObjectID   `bson:"roomId" json:"roomId"`
	RoomNumber        string          `bson:"roomNumber" json:"roomNumber"`
	GuestID           *bson.ObjectID  `bson:"guestId,omitempty" json:"guestId,omitempty"`
	GuestName         string          `bson:"guestName" json:"guestName"`
	CurrentCheckout   time.Time       `bson:"currentCheckout" json:"currentCheckout"`
	RequestedCheckout time.Time       `bson:"requestedCheckout" json:"requestedCheckout"`
	AdditionalNights  int             `bson:"additionalNights" json:"additionalNights"`
	Status            ExtensionStatus `bson:"status" json:"status"`
	Reason            string          `bson:"reason,omitempty" json:"reason,omitempty"`                 // Guest notes on submit or manager rejection note
	ManagerComment    string          `bson:"managerComment,omitempty" json:"managerComment,omitempty"` // Internal or feedback note from manager
	ApprovedBy        string          `bson:"approvedBy,omitempty" json:"approvedBy,omitempty"`
	ApprovedAt        *time.Time      `bson:"approvedAt,omitempty" json:"approvedAt,omitempty"`
	CreatedAt         time.Time       `bson:"createdAt" json:"createdAt"`
	UpdatedAt         time.Time       `bson:"updatedAt" json:"updatedAt"`
}

func (e *StayExtensionRequest) Validate() error {
	if e.TenantID.IsZero() {
		return errors.New("tenantId is required")
	}
	if e.RoomID.IsZero() {
		return errors.New("roomId is required")
	}
	if e.CurrentCheckout.IsZero() {
		return errors.New("currentCheckout is required")
	}
	if e.RequestedCheckout.IsZero() {
		return errors.New("requestedCheckout is required")
	}
	if !e.RequestedCheckout.After(e.CurrentCheckout) {
		return errors.New("requestedCheckout must be strictly after currentCheckout")
	}
	if e.Status == "" {
		e.Status = ExtensionPending
	}
	if e.CreatedAt.IsZero() {
		e.CreatedAt = time.Now().UTC()
	}
	if e.UpdatedAt.IsZero() {
		e.UpdatedAt = e.CreatedAt
	}
	return nil
}
