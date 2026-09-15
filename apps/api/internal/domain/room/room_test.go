package room

import (
	"testing"

	"go.mongodb.org/mongo-driver/v2/bson"
)

func TestRoomValidation(t *testing.T) {
	tenantID := bson.NewObjectID()

	// Empty Room Number should fail
	r := &Room{
		TenantID: tenantID,
	}
	if err := r.Validate(); err == nil {
		t.Errorf("expected error for empty room number")
	}

	// Zero TenantID should fail
	r = &Room{
		RoomNumber: "101",
	}
	if err := r.Validate(); err == nil {
		t.Errorf("expected error for zero tenantId")
	}

	// Valid Room with defaults
	r = &Room{
		TenantID:   tenantID,
		RoomNumber: "101",
	}
	if err := r.Validate(); err != nil {
		t.Fatalf("unexpected validation error: %v", err)
	}
	if r.Name != "Room 101" {
		t.Errorf("expected default name 'Room 101', got %s", r.Name)
	}
	if r.Capacity != 2 {
		t.Errorf("expected default capacity 2, got %d", r.Capacity)
	}
	if r.Status != StatusVacant {
		t.Errorf("expected default status vacant, got %s", r.Status)
	}
	if r.QRSlug != "room-101" {
		t.Errorf("expected default qrSlug 'room-101', got %s", r.QRSlug)
	}
}

func TestGuestValidation(t *testing.T) {
	tenantID := bson.NewObjectID()
	roomID := bson.NewObjectID()

	// Missing name
	g := &Guest{
		TenantID: tenantID,
		RoomID:   roomID,
		Phone:    "+919876543210",
	}
	if err := g.Validate(); err == nil {
		t.Errorf("expected error for missing name")
	}

	// Valid guest
	g = &Guest{
		TenantID: tenantID,
		RoomID:   roomID,
		Name:     "Arjun Kapoor",
		Phone:    "+919876543210",
	}
	if err := g.Validate(); err != nil {
		t.Fatalf("unexpected validation error: %v", err)
	}
	if g.Status != GuestCheckedIn {
		t.Errorf("expected default status checked_in, got %s", g.Status)
	}
	if g.CheckIn.IsZero() {
		t.Errorf("expected checkIn timestamp to be set")
	}
}

func TestHousekeepingTaskValidation(t *testing.T) {
	tenantID := bson.NewObjectID()
	roomID := bson.NewObjectID()

	// Missing title
	task := &HousekeepingTask{
		TenantID: tenantID,
		RoomID:   roomID,
	}
	if err := task.Validate(); err == nil {
		t.Errorf("expected error for missing task title")
	}

	// Valid task
	task = &HousekeepingTask{
		TenantID:   tenantID,
		RoomID:     roomID,
		RoomNumber: "205",
		Title:      "Linen & Towel Refresh",
	}
	if err := task.Validate(); err != nil {
		t.Fatalf("unexpected validation error: %v", err)
	}
	if task.TaskType != TaskCleaning {
		t.Errorf("expected default taskType cleaning, got %s", task.TaskType)
	}
	if task.Status != TaskPending {
		t.Errorf("expected default status pending, got %s", task.Status)
	}
}

func TestIndianPhoneValidation(t *testing.T) {
	// Valid formats:
	validCases := []struct {
		input    string
		expected string
	}{
		{"9876543210", "+919876543210"},
		{"+91 98765 43210", "+919876543210"},
		{"919876543210", "+919876543210"},
		{"09876543210", "+919876543210"},
		{"+91-98765-43210", "+919876543210"},
		{"7000000000", "+917000000000"},
		{"8888888888", "+918888888888"},
		{"6123456789", "+916123456789"},
	}

	for _, tc := range validCases {
		res, err := ValidateAndNormalizeIndianPhone(tc.input)
		if err != nil {
			t.Errorf("expected valid for %s, got error: %v", tc.input, err)
		}
		if res != tc.expected {
			t.Errorf("for input %s, expected %s, got %s", tc.input, tc.expected, res)
		}
	}

	// Invalid formats:
	invalidCases := []string{
		"12345",         // too short
		"98765432100",   // too long
		"5555555555",    // invalid starting digit (5)
		"1876543210",    // invalid starting digit (1)
		"abcdefghij",    // non-numeric
		"+14155552671",  // non-Indian country code
		"",              // empty
	}

	for _, tc := range invalidCases {
		if _, err := ValidateAndNormalizeIndianPhone(tc); err == nil {
			t.Errorf("expected error for invalid input '%s', but got nil", tc)
		}
	}
}
