package user

import (
	"math"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

func TestCalculateDistanceMeters(t *testing.T) {
	// Connaught Place, New Delhi: 28.6315, 77.2167
	// Shivaji Stadium, New Delhi (~450m away): 28.6297, 77.2119
	// Same spot: distance should be 0
	d0 := CalculateDistanceMeters(28.6315, 77.2167, 28.6315, 77.2167)
	if d0 != 0 {
		t.Errorf("expected 0 distance for identical coordinates, got %f", d0)
	}

	// Geofence center: Restaurant at 28.631500, 77.216700
	// Staff check-in inside 50m radius: 28.631700, 77.216700 (~22.2 meters north)
	dInside := CalculateDistanceMeters(28.631500, 77.216700, 28.631700, 77.216700)
	if dInside > 50 {
		t.Errorf("expected inside distance < 50m, got %f", dInside)
	}

	// Staff check-in 500m away outside geofence
	dOutside := CalculateDistanceMeters(28.631500, 77.216700, 28.636000, 77.216700)
	if dOutside < 400 || dOutside > 600 {
		t.Errorf("expected outside distance ~500m, got %f", dOutside)
	}
}

func TestDefaultPermissionsForRole(t *testing.T) {
	ownerPerms := DefaultPermissionsForRole(RoleOwner)
	if !ownerPerms.CanApproveLeave || !ownerPerms.CanViewPayroll || !ownerPerms.CanClockAttendance {
		t.Errorf("expected Owner to have leave, payroll, and attendance permissions, got %+v", ownerPerms)
	}

	mgrPerms := DefaultPermissionsForRole(RoleManager)
	if !mgrPerms.CanApproveLeave || !mgrPerms.CanViewPayroll || !mgrPerms.CanClockAttendance {
		t.Errorf("expected Manager to have leave, payroll, and attendance permissions, got %+v", mgrPerms)
	}

	waiterPerms := DefaultPermissionsForRole(RoleWaiter)
	if waiterPerms.CanApproveLeave || waiterPerms.CanViewPayroll || !waiterPerms.CanClockAttendance {
		t.Errorf("expected Waiter to have only attendance permission, got %+v", waiterPerms)
	}

	chefPerms := DefaultPermissionsForRole(RoleChef)
	if chefPerms.CanApproveLeave || chefPerms.CanViewPayroll || !chefPerms.CanClockAttendance {
		t.Errorf("expected Chef to have only attendance permission, got %+v", chefPerms)
	}
}

func TestUserToPublic(t *testing.T) {
	now := time.Now().UTC()
	uid := bson.NewObjectID()
	tid := bson.NewObjectID()

	u := User{
		ID:             uid,
		TenantID:       tid,
		Email:          "rajesh.kumar@dineflow.com",
		Phone:          "+919876543210",
		Name:           "Rajesh Kumar",
		Role:           RoleChef,
		Permissions:    DefaultPermissionsForRole(RoleChef),
		Status:         StatusActive,
		EmployeeID:     "DF-EMP-1001",
		Department:     "Kitchen",
		EmploymentType: "full_time",
		ShiftName:      "Morning (09:00 - 18:00)",
		Salary: SalaryStructure{
			Basic:            25000,
			HRA:              10000,
			SpecialAllowance: 5000,
			OvertimeRate:     200,
		},
		JoiningDate: &now,
		CreatedAt:   now,
	}

	pub := u.ToPublic()
	if pub.ID != uid.Hex() {
		t.Errorf("expected ID %s, got %s", uid.Hex(), pub.ID)
	}
	if pub.EmployeeID != "DF-EMP-1001" {
		t.Errorf("expected EmployeeID DF-EMP-1001, got %s", pub.EmployeeID)
	}
	if pub.Department != "Kitchen" {
		t.Errorf("expected Department Kitchen, got %s", pub.Department)
	}
	if pub.Salary.Basic != 25000 {
		t.Errorf("expected Salary Basic 25000, got %f", pub.Salary.Basic)
	}
	if math.Abs(pub.Salary.OvertimeRate-200) > 0.001 {
		t.Errorf("expected OvertimeRate 200, got %f", pub.Salary.OvertimeRate)
	}
}
