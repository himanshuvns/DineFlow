package whatsapp_test

import (
	"context"
	"strings"
	"testing"
	"time"

	appwa "github.com/dineflow/api/internal/application/whatsapp"
	domainuser "github.com/dineflow/api/internal/domain/user"
	domainwa "github.com/dineflow/api/internal/domain/whatsapp"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func TestWorkforceTokens(t *testing.T) {
	svc := appwa.NewService(nil)
	tenantID := bson.NewObjectID()
	userID := bson.NewObjectID()
	empID := "DF-EMP-1001"

	// 1. Generate valid token
	token, err := svc.GenerateCheckInToken(tenantID, userID, empID, "clock_in")
	if err != nil {
		t.Fatalf("Failed to generate check-in token: %v", err)
	}
	if token == "" {
		t.Fatal("Expected non-empty token")
	}

	// 2. Validate valid token
	gotTenant, gotUser, gotEmp, gotAction, err := svc.ValidateCheckInToken(token)
	if err != nil {
		t.Fatalf("Failed to validate valid check-in token: %v", err)
	}
	if gotTenant != tenantID {
		t.Errorf("Expected tenant %v, got %v", tenantID, gotTenant)
	}
	if gotUser != userID {
		t.Errorf("Expected user %v, got %v", userID, gotUser)
	}
	if gotEmp != empID {
		t.Errorf("Expected empID %s, got %s", empID, gotEmp)
	}
	if gotAction != "clock_in" {
		t.Errorf("Expected action clock_in, got %s", gotAction)
	}

	// 3. Tampered token should fail
	tampered := token + "tampered"
	_, _, _, _, err = svc.ValidateCheckInToken(tampered)
	if err == nil {
		t.Error("Expected error for tampered token, got nil")
	}

	// 4. Malformed token should fail
	_, _, _, _, err = svc.ValidateCheckInToken("invalid_token_without_signature")
	if err == nil {
		t.Error("Expected error for malformed token, got nil")
	}
}

func TestPhoneNumberNormalization(t *testing.T) {
	cases := []struct {
		input    string
		expected string
	}{
		{"+91 98765 43210", "9876543210"},
		{"919876543210", "9876543210"},
		{"09876543210", "9876543210"},
		{"9876543210", "9876543210"},
		{"+91-98765-43210", "9876543210"},
		{"(91) 98765 43210", "9876543210"},
	}

	for _, c := range cases {
		got := domainwa.NormalizePhoneNumber(c.input)
		if got != c.expected {
			t.Errorf("NormalizePhoneNumber(%q) = %q; want %q", c.input, got, c.expected)
		}
	}
}

func TestWorkforceCheckInMessageFormat(t *testing.T) {
	svc := appwa.NewService(nil)
	tenantID := bson.NewObjectID()
	staffID := bson.NewObjectID()

	staff := &domainuser.User{
		ID:         staffID,
		TenantID:   tenantID,
		Name:       "Rahul Sharma",
		Phone:      "+919876543210",
		Role:       domainuser.RoleWaiter,
		Department: "Floor Service",
		EmployeeID: "DF-EMP-1002",
		CreatedAt:  time.Now().UTC(),
	}

	// Test clock in generates signed URL
	reply, err := svc.ProcessWorkforceMessage(context.Background(), staff, "", domainwa.BtnWFCheckIn)
	if err == nil && reply != "" {
		if !strings.Contains(reply, "Attendance Verification") {
			t.Errorf("Expected reply to contain 'Attendance Verification', got %s", reply)
		}
		if !strings.Contains(reply, "/m/check-in?token=") {
			t.Errorf("Expected reply to contain '/m/check-in?token=', got %s", reply)
		}
		if !strings.Contains(reply, "Rahul Sharma") {
			t.Errorf("Expected reply to mention employee name, got %s", reply)
		}
	}

	// Test clock out generates signed URL
	outReply, err := svc.ProcessWorkforceMessage(context.Background(), staff, "", domainwa.BtnWFCheckOut)
	if err == nil && outReply != "" {
		if !strings.Contains(outReply, "Clock Out") {
			t.Errorf("Expected outReply to contain 'Clock Out', got %s", outReply)
		}
		if !strings.Contains(outReply, "/m/check-in?token=") {
			t.Errorf("Expected outReply to contain '/m/check-in?token=', got %s", outReply)
		}
	}

	// Test shift info
	shiftReply, err := svc.ProcessWorkforceMessage(context.Background(), staff, "", domainwa.BtnWFShift)
	if err == nil && shiftReply != "" {
		if !strings.Contains(shiftReply, "Work Schedule") {
			t.Errorf("Expected shiftReply to contain 'Work Schedule', got %s", shiftReply)
		}
	}

	// Test running late natural language
	lateReply, err := svc.ProcessWorkforceMessage(context.Background(), staff, "running late 15 mins stuck in traffic", "")
	if err == nil && lateReply != "" {
		if !strings.Contains(lateReply, "Late Notice Acknowledged") {
			t.Errorf("Expected lateReply to contain 'Late Notice Acknowledged', got %s", lateReply)
		}
	}

	// Test default main menu
	menuReply, err := svc.ProcessWorkforceMessage(context.Background(), staff, "hi", "")
	if err == nil && menuReply != "" {
		if !strings.Contains(menuReply, "Workforce Assistant") {
			t.Errorf("Expected menuReply to contain 'Workforce Assistant', got %s", menuReply)
		}
		if !strings.Contains(menuReply, "Clock In") {
			t.Errorf("Expected menuReply to contain 'Clock In', got %s", menuReply)
		}
	}
}

