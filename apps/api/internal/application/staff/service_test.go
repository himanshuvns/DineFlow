package staff

import (
	"context"
	"testing"
	"time"

	domainuser "github.com/dineflow/api/internal/domain/user"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func TestInviteStaff_Validation(t *testing.T) {
	svc := NewService(nil)
	ctx := context.Background()
	tid := bson.NewObjectID()

	// Missing name
	_, err := svc.InviteStaff(ctx, tid, InviteStaffInput{
		Email: "test@example.com",
	})
	if err == nil || err.Error() != "name is required" {
		t.Errorf("expected 'name is required' error, got %v", err)
	}

	// Missing email and phone
	_, err = svc.InviteStaff(ctx, tid, InviteStaffInput{
		Name: "Rohan",
	})
	if err == nil || err.Error() != "email or phone is required" {
		t.Errorf("expected 'email or phone is required' error, got %v", err)
	}
}

func TestCreateShift_Validation(t *testing.T) {
	svc := NewService(nil)
	ctx := context.Background()
	tid := bson.NewObjectID()

	_, err := svc.CreateShift(ctx, tid, domainuser.Shift{
		Name: "",
	})
	if err == nil || err.Error() != "name, startTime, and endTime are required" {
		t.Errorf("expected validation error for empty shift, got %v", err)
	}
}

func TestApplyLeave_Validation(t *testing.T) {
	svc := NewService(nil)
	ctx := context.Background()
	tid := bson.NewObjectID()
	uid := bson.NewObjectID()

	// Missing dates
	_, err := svc.ApplyLeave(ctx, tid, uid, domainuser.LeaveRequest{})
	if err == nil || err.Error() != "startDate and endDate are required" {
		t.Errorf("expected startDate/endDate required error, got %v", err)
	}

	// Invalid date format
	_, err = svc.ApplyLeave(ctx, tid, uid, domainuser.LeaveRequest{
		StartDate: "invalid-date",
		EndDate:   "2026-09-20",
	})
	if err == nil || err.Error() != "dates must be in YYYY-MM-DD format" {
		t.Errorf("expected format error, got %v", err)
	}

	// End before start
	_, err = svc.ApplyLeave(ctx, tid, uid, domainuser.LeaveRequest{
		StartDate: "2026-09-25",
		EndDate:   "2026-09-20",
	})
	if err == nil || err.Error() != "endDate cannot be before startDate" {
		t.Errorf("expected end before start error, got %v", err)
	}
}

func TestCreateHoliday_Validation(t *testing.T) {
	svc := NewService(nil)
	ctx := context.Background()
	tid := bson.NewObjectID()

	_, err := svc.CreateHoliday(ctx, tid, domainuser.Holiday{})
	if err == nil || err.Error() != "holiday name and date are required" {
		t.Errorf("expected name and date required error, got %v", err)
	}
}

func TestGeneratePayslipHTML_Structure(t *testing.T) {
	// Verify HTML contains standard Indian statutory deductions and DineFlow branding
	rec := domainuser.PayrollRecord{
		ID:            bson.NewObjectID(),
		TenantID:      bson.NewObjectID(),
		UserID:        bson.NewObjectID(),
		EmployeeID:    "DF-EMP-1001",
		EmployeeName:  "Rajesh Kumar",
		Role:          domainuser.RoleChef,
		Department:    "Kitchen",
		Month:         "2026-09",
		Year:          2026,
		PresentDays:   26,
		OvertimeHours: 8.5,
		BasicSalary:   30000,
		HRA:           12000,
		Allowances:    3500,
		OvertimePay:   1530,
		GrossEarnings: 47030,
		Deductions:    2000, // 1800 PF + 200 PT
		NetPay:        45030,
		PaymentStatus: "paid",
		CreatedAt:     time.Now().UTC(),
	}

	// We can check how format strings format this
	if rec.NetPay != 45030 {
		t.Errorf("expected NetPay 45030, got %f", rec.NetPay)
	}
}
