package table

import (
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

func TestTableValidationAndStatuses(t *testing.T) {
	tenantID := bson.NewObjectID()

	// 1. Validate table requires name
	invalidTbl := Table{
		TenantID: tenantID,
		Name:     "",
		Seats:    2,
	}
	if err := invalidTbl.Validate(); err == nil {
		t.Error("expected error for empty table name, got nil")
	}

	// 2. Validate table requires tenantID
	noTenantTbl := Table{
		Name:  "Table 1",
		Seats: 4,
	}
	if err := noTenantTbl.Validate(); err == nil {
		t.Error("expected error for empty tenantID, got nil")
	}

	// 3. Status constants verification
	if StatusAvailable != "available" {
		t.Errorf("expected StatusAvailable to be 'available', got %s", StatusAvailable)
	}
	if StatusOccupied != "occupied" {
		t.Errorf("expected StatusOccupied to be 'occupied', got %s", StatusOccupied)
	}
	if StatusReserved != "reserved" {
		t.Errorf("expected StatusReserved to be 'reserved', got %s", StatusReserved)
	}

	// 4. Successful table instantiation
	validTbl := Table{
		ID:        bson.NewObjectID(),
		TenantID:  tenantID,
		Name:      "Table 04",
		Seats:     4,
		Zone:      "Main Dining",
		QRSlug:    "t-04",
		Status:    StatusReserved,
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	}
	if err := validTbl.Validate(); err != nil {
		t.Errorf("expected valid table, got error: %v", err)
	}
}
