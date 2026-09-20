package room

import (
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// RoomPreference represents guest-configurable room states such as Do Not Disturb.
type RoomPreference struct {
	ID        bson.ObjectID  `bson:"_id,omitempty" json:"id"`
	TenantID  bson.ObjectID  `bson:"tenantId" json:"tenantId"`
	RoomID    bson.ObjectID  `bson:"roomId" json:"roomId"`
	BookingID *bson.ObjectID `bson:"bookingId,omitempty" json:"bookingId,omitempty"`
	DNDStatus bool           `bson:"dndStatus" json:"dndStatus"`
	UpdatedBy string         `bson:"updatedBy" json:"updatedBy"` // "guest" | staff user ID / name
	UpdatedAt time.Time      `bson:"updatedAt" json:"updatedAt"`
}

func (p *RoomPreference) Validate() error {
	if p.TenantID.IsZero() {
		return errors.New("tenantId is required")
	}
	if p.RoomID.IsZero() {
		return errors.New("roomId is required")
	}
	if p.UpdatedAt.IsZero() {
		p.UpdatedAt = time.Now().UTC()
	}
	return nil
}
