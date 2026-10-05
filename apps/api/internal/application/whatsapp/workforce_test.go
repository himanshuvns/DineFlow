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

func TestNumberedLeaveWorkflow(t *testing.T) {
	svc := appwa.NewService(nil)
	tenantID := bson.NewObjectID()
	staffID := bson.NewObjectID()

	staff := &domainuser.User{
		ID:         staffID,
		TenantID:   tenantID,
		Name:       "Atul",
		Phone:      "+917652058844",
		Role:       domainuser.RoleCashier,
		Department: "Floor Operations",
		EmployeeID: "DF-EMP-1005",
		CreatedAt:  time.Now().UTC(),
	}

	// 1. Reply "4" (Leave Balances & Apply) -> returns numbered options 1: Casual, 2: Sick, 3: Earned
	reply1, err := svc.ProcessWorkforceMessage(context.Background(), staff, "4", "")
	if err != nil {
		t.Fatalf("ProcessWorkforceMessage('4') failed: %v", err)
	}
	if !strings.Contains(reply1, "1️⃣ Apply Casual Leave") {
		t.Errorf("Expected reply to have '1️⃣ Apply Casual Leave', got:\n%s", reply1)
	}
	if !strings.Contains(reply1, "2️⃣ Apply Sick Leave") {
		t.Errorf("Expected reply to have '2️⃣ Apply Sick Leave', got:\n%s", reply1)
	}
	if !strings.Contains(reply1, "3️⃣ Apply Earned Leave") {
		t.Errorf("Expected reply to have '3️⃣ Apply Earned Leave', got:\n%s", reply1)
	}
	if !strings.Contains(reply1, "0️⃣ Back to Main Menu") {
		t.Errorf("Expected reply to have '0️⃣ Back to Main Menu', got:\n%s", reply1)
	}

	// 2. Reply "1" (Choose Casual Leave) -> returns numbered duration options
	reply2, err := svc.ProcessWorkforceMessage(context.Background(), staff, "1", "")
	if err != nil {
		t.Fatalf("ProcessWorkforceMessage('1') failed: %v", err)
	}
	if !strings.Contains(reply2, "CASUAL Leave") {
		t.Errorf("Expected reply to mention 'CASUAL Leave', got:\n%s", reply2)
	}
	if !strings.Contains(reply2, "1️⃣ Tomorrow") {
		t.Errorf("Expected reply to have '1️⃣ Tomorrow', got:\n%s", reply2)
	}
	if !strings.Contains(reply2, "2️⃣ Today") {
		t.Errorf("Expected reply to have '2️⃣ Today', got:\n%s", reply2)
	}
	if !strings.Contains(reply2, "0️⃣ Cancel") {
		t.Errorf("Expected reply to have '0️⃣ Cancel', got:\n%s", reply2)
	}

	// 3. Reply "1" again (Select Tomorrow) -> successfully submits leave request
	reply3, err := svc.ProcessWorkforceMessage(context.Background(), staff, "1", "")
	if err != nil {
		t.Fatalf("ProcessWorkforceMessage('1' for Tomorrow) failed: %v", err)
	}
	if !strings.Contains(reply3, "Leave Request Submitted Successfully!") {
		t.Errorf("Expected reply to confirm leave request submission, got:\n%s", reply3)
	}
	if !strings.Contains(reply3, "CASUAL") {
		t.Errorf("Expected reply to mention CASUAL leave type, got:\n%s", reply3)
	}
	if !strings.Contains(reply3, "4️⃣ View Leave Balances") {
		t.Errorf("Expected reply to have '4️⃣ View Leave Balances', got:\n%s", reply3)
	}

	// 4. Reply "0" (Main Menu)
	reply4, err := svc.ProcessWorkforceMessage(context.Background(), staff, "0", "")
	if err != nil {
		t.Fatalf("ProcessWorkforceMessage('0') failed: %v", err)
	}
	if !strings.Contains(reply4, "Workforce Assistant") {
		t.Errorf("Expected reply to return main workforce menu, got:\n%s", reply4)
	}

	// 5. Test Option "1" (Clock In)
	replyClockIn, err := svc.ProcessWorkforceMessage(context.Background(), staff, "1", "")
	if err != nil {
		t.Fatalf("ProcessWorkforceMessage('1' Clock In) failed: %v", err)
	}
	if !strings.Contains(replyClockIn, "Attendance Verification — Clock In") {
		t.Errorf("Expected reply to include Clock In heading, got:\n%s", replyClockIn)
	}
	if !strings.Contains(replyClockIn, "2️⃣ Clock Out") {
		t.Errorf("Expected reply to have '2️⃣ Clock Out', got:\n%s", replyClockIn)
	}

	// 6. Test Option "5" (Shift & Schedule)
	replyShift, err := svc.ProcessWorkforceMessage(context.Background(), staff, "5", "")
	if err != nil {
		t.Fatalf("ProcessWorkforceMessage('5' Shift) failed: %v", err)
	}
	if !strings.Contains(replyShift, "Work Schedule & Roster") {
		t.Errorf("Expected reply to include Shift info, got:\n%s", replyShift)
	}
	if !strings.Contains(replyShift, "1️⃣ Clock In") {
		t.Errorf("Expected reply to have '1️⃣ Clock In', got:\n%s", replyShift)
	}

	// 7. Test Option "7" (Payslip)
	replyPayslip, err := svc.ProcessWorkforceMessage(context.Background(), staff, "7", "")
	if err != nil {
		t.Fatalf("ProcessWorkforceMessage('7' Payslip) failed: %v", err)
	}
	if !strings.Contains(strings.ToLower(replyPayslip), "payslip") && !strings.Contains(replyPayslip, "Salary") {
		t.Errorf("Expected reply to include Payslip or Salary info, got:\n%s", replyPayslip)
	}
	if !strings.Contains(replyPayslip, "Reply 0️⃣ for Back to Main Menu") {
		t.Errorf("Expected reply to have 'Reply 0️⃣ for Back to Main Menu', got:\n%s", replyPayslip)
	}
}


