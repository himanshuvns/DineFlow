package table

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type TableStatus string

const (
	StatusAvailable TableStatus = "available"
	StatusOccupied  TableStatus = "occupied"
	StatusReserved  TableStatus = "reserved"
	StatusCleaning  TableStatus = "cleaning"
)

type LocationType string

const (
	TypeTable   LocationType = "table"
	TypeRoom    LocationType = "room"
	TypeSuite   LocationType = "suite"
	TypeCabana  LocationType = "cabana"
	TypeBarSeat LocationType = "bar_seat"
)

// Table represents a physical dining table, bar seat, cabana, or hotel room.
type Table struct {
	ID            bson.ObjectID  `bson:"_id,omitempty" json:"id"`
	TenantID      bson.ObjectID  `bson:"tenantId" json:"tenantId"`
	Type          LocationType   `bson:"type" json:"type"`
	Name          string         `bson:"name" json:"name"`
	Zone          string         `bson:"zone" json:"zone"`
	Seats         int            `bson:"seats" json:"seats"`
	Floor         string         `bson:"floor,omitempty" json:"floor,omitempty"`
	Wing          string         `bson:"wing,omitempty" json:"wing,omitempty"`
	RoomNumber    string         `bson:"roomNumber,omitempty" json:"roomNumber,omitempty"`
	DoNotDisturb  bool           `bson:"doNotDisturb,omitempty" json:"doNotDisturb,omitempty"`
	FolioEnabled  bool           `bson:"folioEnabled,omitempty" json:"folioEnabled,omitempty"`
	QRSlug        string         `bson:"qrSlug" json:"qrSlug"`
	Status        TableStatus    `bson:"status" json:"status"`
	ActiveOrderID *bson.ObjectID `bson:"activeOrderId,omitempty" json:"activeOrderId,omitempty"`
	CreatedAt     time.Time      `bson:"createdAt" json:"createdAt"`
	UpdatedAt     time.Time      `bson:"updatedAt" json:"updatedAt"`
}

func (t *Table) Validate() error {
	if strings.TrimSpace(t.Name) == "" {
		return errors.New("table/room name is required")
	}
	if t.TenantID.IsZero() {
		return errors.New("tenantId is required")
	}
	if t.Seats <= 0 {
		t.Seats = 2
	}
	if t.Type == "" {
		t.Type = TypeTable
	}
	if t.Status == "" {
		t.Status = StatusAvailable
	}
	return nil
}

// GetCustomerQRURL generates the direct mobile dining menu landing URL.
func (t *Table) GetCustomerQRURL(baseURL, tenantSlug string) string {
	slug := t.QRSlug
	if slug == "" {
		slug = strings.ToLower(strings.ReplaceAll(t.Name, " ", "-"))
	}
	if t.Type == TypeRoom || t.Type == TypeSuite {
		room := t.RoomNumber
		if room == "" {
			room = slug
		}
		return fmt.Sprintf("%s/m/%s/room/%s", strings.TrimRight(baseURL, "/"), tenantSlug, room)
	}
	return fmt.Sprintf("%s/m/%s/%s", strings.TrimRight(baseURL, "/"), tenantSlug, slug)
}
