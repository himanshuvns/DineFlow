package user

import (
	"math"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// Role defines the permission level of a user.
type Role string

const (
	// Platform Roles (Software Owner / Super Admin Console)
	RoleSuperAdmin    Role = "super_admin"
	RolePlatformAdmin Role = "platform_admin"
	RoleFinanceAdmin  Role = "finance_admin"
	RoleSupportAgent  Role = "support_agent"

	// Tenant Roles (Client Workspace)
	RoleOwner        Role = "owner"
	RoleManager      Role = "manager"
	RoleChef         Role = "chef"
	RoleWaiter       Role = "waiter"
	RoleCashier      Role = "cashier"
	RoleHousekeeping Role = "housekeeping"
	RoleStaff        Role = "staff"
)

// IsPlatformRole returns true if the given role is an elevated platform-level role.
func IsPlatformRole(r Role) bool {
	switch r {
	case RoleSuperAdmin, RolePlatformAdmin, RoleFinanceAdmin, RoleSupportAgent:
		return true
	default:
		return false
	}
}

// Status is the user account state.
type Status string

const (
	StatusActive   Status = "active"
	StatusInactive Status = "inactive"
	StatusInvited  Status = "invited"
)

// Permissions specifies granular access control for a user.
type Permissions struct {
	CanManageMenu      bool `bson:"canManageMenu" json:"canManageMenu"`
	CanManageStaff     bool `bson:"canManageStaff" json:"canManageStaff"`
	CanViewAnalytics   bool `bson:"canViewAnalytics" json:"canViewAnalytics"`
	CanManageBilling   bool `bson:"canManageBilling" json:"canManageBilling"`
	CanManageOrders    bool `bson:"canManageOrders" json:"canManageOrders"`
	CanAccessKDS       bool `bson:"canAccessKDS" json:"canAccessKDS"`
	CanManageTables    bool `bson:"canManageTables" json:"canManageTables"`
	CanApproveLeave    bool `bson:"canApproveLeave,omitempty" json:"canApproveLeave"`
	CanViewPayroll     bool `bson:"canViewPayroll,omitempty" json:"canViewPayroll"`
	CanClockAttendance bool `bson:"canClockAttendance,omitempty" json:"canClockAttendance"`
}

// RefreshToken represents a stored refresh token entry.
type RefreshToken struct {
	TokenID     string    `bson:"tokenId" json:"-"`
	HashedToken string    `bson:"hashedToken" json:"-"`
	ExpiresAt   time.Time `bson:"expiresAt" json:"-"`
	DeviceInfo  string    `bson:"deviceInfo" json:"-"`
	CreatedAt   time.Time `bson:"createdAt" json:"-"`
}

// Auth holds sensitive authentication data (never exposed in JSON responses).
type Auth struct {
	PasswordHash        string         `bson:"passwordHash" json:"-"`
	RefreshTokens       []RefreshToken `bson:"refreshTokens" json:"-"`
	LastLoginAt         *time.Time     `bson:"lastLoginAt" json:"-"`
	FailedLoginAttempts int            `bson:"failedLoginAttempts" json:"-"`
	LockedUntil         *time.Time     `bson:"lockedUntil" json:"-"`
	EmailVerified       bool           `bson:"emailVerified" json:"emailVerified"`
	PhoneVerified       bool           `bson:"phoneVerified" json:"phoneVerified"`
}

// NotificationPrefs per channel per event type.
type NotificationPrefs struct {
	NewOrder struct {
		Sound   bool `bson:"sound" json:"sound"`
		Browser bool `bson:"browser" json:"browser"`
	} `bson:"newOrder" json:"newOrder"`
	Billing struct {
		Email    bool `bson:"email" json:"email"`
		WhatsApp bool `bson:"whatsapp" json:"whatsapp"`
	} `bson:"billing" json:"billing"`
}

// ── Workforce & Employee Profile Models ───────────────────────────────────────

type SalaryStructure struct {
	Basic            float64 `bson:"basic" json:"basic"`
	HRA              float64 `bson:"hra" json:"hra"`
	SpecialAllowance float64 `bson:"specialAllowance" json:"specialAllowance"`
	OvertimeRate     float64 `bson:"overtimeRate" json:"overtimeRate"` // per hour rate
}

type BankDetails struct {
	AccountName   string `bson:"accountName" json:"accountName"`
	AccountNumber string `bson:"accountNumber" json:"accountNumber"`
	IFSC          string `bson:"ifsc" json:"ifsc"`
	BankName      string `bson:"bankName" json:"bankName"`
}

type EmergencyContact struct {
	Name     string `bson:"name" json:"name"`
	Relation string `bson:"relation" json:"relation"`
	Phone    string `bson:"phone" json:"phone"`
}

// User is a staff member or owner associated with a single tenant.
type User struct {
	ID                bson.ObjectID      `bson:"_id,omitempty" json:"id"`
	TenantID          bson.ObjectID      `bson:"tenantId" json:"tenantId"`
	Email             string             `bson:"email,omitempty" json:"email,omitempty"`
	Phone             string             `bson:"phone,omitempty" json:"phone,omitempty"`
	Name              string             `bson:"name" json:"name"`
	Avatar            string             `bson:"avatar,omitempty" json:"avatar,omitempty"`
	Role              Role               `bson:"role" json:"role"`
	Permissions       Permissions        `bson:"permissions" json:"permissions"`
	Auth              Auth               `bson:"auth" json:"-"`
	NotificationPrefs NotificationPrefs  `bson:"notificationPrefs" json:"notificationPrefs"`
	InvitedBy         *bson.ObjectID     `bson:"invitedBy,omitempty" json:"invitedBy,omitempty"`
	InviteToken       string             `bson:"inviteToken,omitempty" json:"-"`
	InviteExpiresAt   *time.Time         `bson:"inviteExpiresAt,omitempty" json:"-"`
	Status            Status             `bson:"status" json:"status"`
	EmployeeID        string             `bson:"employeeId,omitempty" json:"employeeId,omitempty"`
	Department        string             `bson:"department,omitempty" json:"department,omitempty"` // Kitchen, Floor Service, Bar, Management, Housekeeping
	EmploymentType    string             `bson:"employmentType,omitempty" json:"employmentType,omitempty"` // full_time, part_time, contract
	JoiningDate       *time.Time         `bson:"joiningDate,omitempty" json:"joiningDate,omitempty"`
	ShiftID           *bson.ObjectID     `bson:"shiftId,omitempty" json:"shiftId,omitempty"`
	ShiftName         string             `bson:"shiftName,omitempty" json:"shiftName,omitempty"`
	Salary            SalaryStructure    `bson:"salary,omitempty" json:"salary,omitempty"`
	BankDetails       BankDetails        `bson:"bankDetails,omitempty" json:"bankDetails,omitempty"`
	EmergencyContact  EmergencyContact   `bson:"emergencyContact,omitempty" json:"emergencyContact,omitempty"`
	AadhaarNumber     string             `bson:"aadhaarNumber,omitempty" json:"aadhaarNumber,omitempty"`
	PANNumber         string             `bson:"panNumber,omitempty" json:"panNumber,omitempty"`
	CreatedAt         time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt         time.Time          `bson:"updatedAt" json:"updatedAt"`
}

// DefaultPermissionsForRole returns the default permission set for a role.
func DefaultPermissionsForRole(role Role) Permissions {
	switch role {
	case RoleSuperAdmin, RolePlatformAdmin:
		return Permissions{
			CanManageMenu: true, CanManageStaff: true, CanViewAnalytics: true,
			CanManageBilling: true, CanManageOrders: true, CanAccessKDS: true, CanManageTables: true,
			CanApproveLeave: true, CanViewPayroll: true, CanClockAttendance: true,
		}
	case RoleFinanceAdmin:
		return Permissions{
			CanManageMenu: false, CanManageStaff: false, CanViewAnalytics: true,
			CanManageBilling: true, CanManageOrders: false, CanAccessKDS: false, CanManageTables: false,
			CanApproveLeave: false, CanViewPayroll: true, CanClockAttendance: false,
		}
	case RoleSupportAgent:
		return Permissions{
			CanManageMenu: true, CanManageStaff: false, CanViewAnalytics: true,
			CanManageBilling: false, CanManageOrders: true, CanAccessKDS: true, CanManageTables: true,
			CanApproveLeave: false, CanViewPayroll: false, CanClockAttendance: false,
		}
	case RoleOwner:
		return Permissions{
			CanManageMenu: true, CanManageStaff: true, CanViewAnalytics: true,
			CanManageBilling: true, CanManageOrders: true, CanAccessKDS: true, CanManageTables: true,
			CanApproveLeave: true, CanViewPayroll: true, CanClockAttendance: true,
		}
	case RoleManager:
		return Permissions{
			CanManageMenu: true, CanManageStaff: true, CanViewAnalytics: true,
			CanManageBilling: false, CanManageOrders: true, CanAccessKDS: true, CanManageTables: true,
			CanApproveLeave: true, CanViewPayroll: true, CanClockAttendance: true,
		}
	case RoleChef:
		return Permissions{
			CanManageMenu: false, CanManageStaff: false, CanViewAnalytics: false,
			CanManageBilling: false, CanManageOrders: false, CanAccessKDS: true, CanManageTables: false,
			CanApproveLeave: false, CanViewPayroll: false, CanClockAttendance: true,
		}
	case RoleWaiter, RoleStaff:
		return Permissions{
			CanManageMenu: false, CanManageStaff: false, CanViewAnalytics: false,
			CanManageBilling: false, CanManageOrders: true, CanAccessKDS: false, CanManageTables: true,
			CanApproveLeave: false, CanViewPayroll: false, CanClockAttendance: true,
		}
	case RoleCashier:
		return Permissions{
			CanManageMenu: false, CanManageStaff: false, CanViewAnalytics: true,
			CanManageBilling: false, CanManageOrders: true, CanAccessKDS: false, CanManageTables: false,
			CanApproveLeave: false, CanViewPayroll: false, CanClockAttendance: true,
		}
	case RoleHousekeeping:
		return Permissions{
			CanManageMenu: false, CanManageStaff: false, CanViewAnalytics: false,
			CanManageBilling: false, CanManageOrders: false, CanAccessKDS: false, CanManageTables: false,
			CanApproveLeave: false, CanViewPayroll: false, CanClockAttendance: true,
		}
	default:
		return Permissions{CanClockAttendance: true}
	}
}

// IsLocked returns true if the user account is temporarily locked due to failed logins.
func (u *User) IsLocked() bool {
	if u.Auth.LockedUntil == nil {
		return false
	}
	return time.Now().UTC().Before(*u.Auth.LockedUntil)
}

// PublicProfile returns a safe representation (no auth data) for API responses.
type PublicProfile struct {
	ID             string          `json:"id"`
	TenantID       string          `json:"tenantId"`
	Email          string          `json:"email,omitempty"`
	Phone          string          `json:"phone,omitempty"`
	Name           string          `json:"name"`
	Avatar         string          `json:"avatar,omitempty"`
	Role           Role            `json:"role"`
	Permissions    Permissions     `json:"permissions"`
	Status         Status          `json:"status"`
	EmployeeID     string          `json:"employeeId,omitempty"`
	Department     string          `json:"department,omitempty"`
	EmploymentType string          `json:"employmentType,omitempty"`
	ShiftName      string          `json:"shiftName,omitempty"`
	Salary         SalaryStructure `json:"salary,omitempty"`
	JoiningDate    *time.Time      `json:"joiningDate,omitempty"`
	CreatedAt      time.Time       `json:"createdAt"`
	IsFirstLogin   bool            `json:"isFirstLogin"`
}

// ToPublic converts a User to a PublicProfile safe for API serialization.
func (u *User) ToPublic() PublicProfile {
	return PublicProfile{
		ID:             u.ID.Hex(),
		TenantID:       u.TenantID.Hex(),
		Email:          u.Email,
		Phone:          u.Phone,
		Name:           u.Name,
		Avatar:         u.Avatar,
		Role:           u.Role,
		Permissions:    u.Permissions,
		Status:         u.Status,
		EmployeeID:     u.EmployeeID,
		Department:     u.Department,
		EmploymentType: u.EmploymentType,
		ShiftName:      u.ShiftName,
		Salary:         u.Salary,
		JoiningDate:    u.JoiningDate,
		CreatedAt:      u.CreatedAt,
		IsFirstLogin:   u.Auth.LastLoginAt == nil,
	}
}

// ── Attendance & Geofencing Models ───────────────────────────────────────────

type AttendanceStatus string

const (
	AttendancePresent   AttendanceStatus = "present"
	AttendanceLate      AttendanceStatus = "late"
	AttendanceHalfDay   AttendanceStatus = "half_day"
	AttendanceAbsent    AttendanceStatus = "absent"
	AttendanceOnLeave   AttendanceStatus = "leave"
	AttendanceHoliday   AttendanceStatus = "holiday"
	AttendanceWeeklyOff AttendanceStatus = "weekly_off"
)

type BreakLog struct {
	StartTime time.Time  `bson:"startTime" json:"startTime"`
	EndTime   *time.Time `bson:"endTime,omitempty" json:"endTime,omitempty"`
	Minutes   int        `bson:"minutes" json:"minutes"`
}

type AttendanceRecord struct {
	ID              bson.ObjectID    `bson:"_id,omitempty" json:"id"`
	TenantID        bson.ObjectID    `bson:"tenantId" json:"tenantId"`
	UserID          bson.ObjectID    `bson:"userId" json:"userId"`
	EmployeeID      string           `bson:"employeeId" json:"employeeId"`
	EmployeeName    string           `bson:"employeeName" json:"employeeName"`
	Department      string           `bson:"department,omitempty" json:"department,omitempty"`
	Date            string           `bson:"date" json:"date"` // YYYY-MM-DD
	CheckInTime     *time.Time       `bson:"checkInTime,omitempty" json:"checkInTime,omitempty"`
	CheckInLat      float64          `bson:"checkInLat,omitempty" json:"checkInLat,omitempty"`
	CheckInLng      float64          `bson:"checkInLng,omitempty" json:"checkInLng,omitempty"`
	CheckInDistance float64          `bson:"checkInDistance,omitempty" json:"checkInDistance,omitempty"`
	CheckOutTime    *time.Time       `bson:"checkOutTime,omitempty" json:"checkOutTime,omitempty"`
	CheckOutLat     float64          `bson:"checkOutLat,omitempty" json:"checkOutLat,omitempty"`
	CheckOutLng     float64          `bson:"checkOutLng,omitempty" json:"checkOutLng,omitempty"`
	Breaks          []BreakLog       `bson:"breaks,omitempty" json:"breaks,omitempty"`
	IsOnBreak       bool             `bson:"isOnBreak" json:"isOnBreak"`
	Status          AttendanceStatus `bson:"status" json:"status"`
	WorkingHours    float64          `bson:"workingHours" json:"workingHours"`
	BreakHours      float64          `bson:"breakHours" json:"breakHours"`
	OvertimeHours   float64          `bson:"overtimeHours" json:"overtimeHours"`
	Notes           string           `bson:"notes,omitempty" json:"notes,omitempty"`
	CreatedAt       time.Time        `bson:"createdAt" json:"createdAt"`
	UpdatedAt       time.Time        `bson:"updatedAt" json:"updatedAt"`
}

type GeofenceConfig struct {
	ID              bson.ObjectID `bson:"_id,omitempty" json:"id"`
	TenantID        bson.ObjectID `bson:"tenantId" json:"tenantId"`
	Latitude        float64       `bson:"latitude" json:"latitude"`
	Longitude       float64       `bson:"longitude" json:"longitude"`
	RadiusMeters    float64       `bson:"radiusMeters" json:"radiusMeters"` // e.g. 100 meters
	Address         string        `bson:"address" json:"address"`
	EnforceGeofence bool          `bson:"enforceGeofence" json:"enforceGeofence"`
	UpdatedAt       time.Time     `bson:"updatedAt" json:"updatedAt"`
}

type Shift struct {
	ID           bson.ObjectID `bson:"_id,omitempty" json:"id"`
	TenantID     bson.ObjectID `bson:"tenantId" json:"tenantId"`
	Name         string        `bson:"name" json:"name"`                 // Morning, Evening, Night
	StartTime    string        `bson:"startTime" json:"startTime"`       // "09:00"
	EndTime      string        `bson:"endTime" json:"endTime"`           // "18:00"
	GraceMinutes int           `bson:"graceMinutes" json:"graceMinutes"` // e.g. 15 mins
	BreakMinutes int           `bson:"breakMinutes" json:"breakMinutes"` // e.g. 60 mins
	IsDefault    bool          `bson:"isDefault" json:"isDefault"`
	CreatedAt    time.Time     `bson:"createdAt" json:"createdAt"`
}

// ── Leave Management Models ──────────────────────────────────────────────────

type LeaveType string

const (
	LeaveCasual  LeaveType = "casual"
	LeaveSick    LeaveType = "sick"
	LeaveEarned  LeaveType = "earned"
	LeaveUnpaid  LeaveType = "unpaid"
	LeaveCompOff LeaveType = "comp_off"
)

type LeaveStatus string

const (
	LeavePending  LeaveStatus = "pending"
	LeaveApproved LeaveStatus = "approved"
	LeaveRejected LeaveStatus = "rejected"
)

type LeaveRequest struct {
	ID              bson.ObjectID `bson:"_id,omitempty" json:"id"`
	TenantID        bson.ObjectID `bson:"tenantId" json:"tenantId"`
	UserID          bson.ObjectID `bson:"userId" json:"userId"`
	EmployeeID      string        `bson:"employeeId" json:"employeeId"`
	EmployeeName    string        `bson:"employeeName" json:"employeeName"`
	LeaveType       LeaveType     `bson:"leaveType" json:"leaveType"`
	StartDate       string        `bson:"startDate" json:"startDate"` // YYYY-MM-DD
	EndDate         string        `bson:"endDate" json:"endDate"`     // YYYY-MM-DD
	DaysCount       float64       `bson:"daysCount" json:"daysCount"`
	IsHalfDay       bool          `bson:"isHalfDay" json:"isHalfDay"`
	Reason          string        `bson:"reason" json:"reason"`
	Status          LeaveStatus   `bson:"status" json:"status"`
	ApprovedBy      string        `bson:"approvedBy,omitempty" json:"approvedBy,omitempty"`
	ApprovedAt      *time.Time    `bson:"approvedAt,omitempty" json:"approvedAt,omitempty"`
	RejectionReason string        `bson:"rejectionReason,omitempty" json:"rejectionReason,omitempty"`
	CreatedAt       time.Time     `bson:"createdAt" json:"createdAt"`
	UpdatedAt       time.Time     `bson:"updatedAt" json:"updatedAt"`
}

type LeaveBalance struct {
	ID          bson.ObjectID `bson:"_id,omitempty" json:"id"`
	TenantID    bson.ObjectID `bson:"tenantId" json:"tenantId"`
	UserID      bson.ObjectID `bson:"userId" json:"userId"`
	CasualTotal float64       `bson:"casualTotal" json:"casualTotal"`
	CasualUsed  float64       `bson:"casualUsed" json:"casualUsed"`
	SickTotal   float64       `bson:"sickTotal" json:"sickTotal"`
	SickUsed    float64       `bson:"sickUsed" json:"sickUsed"`
	EarnedTotal float64       `bson:"earnedTotal" json:"earnedTotal"`
	EarnedUsed  float64       `bson:"earnedUsed" json:"earnedUsed"`
	Year        int           `bson:"year" json:"year"`
}

// ── Payroll & Payslip Models ──────────────────────────────────────────────────

type PayrollRecord struct {
	ID            bson.ObjectID `bson:"_id,omitempty" json:"id"`
	TenantID      bson.ObjectID `bson:"tenantId" json:"tenantId"`
	UserID        bson.ObjectID `bson:"userId" json:"userId"`
	EmployeeID    string        `bson:"employeeId" json:"employeeId"`
	EmployeeName  string        `bson:"employeeName" json:"employeeName"`
	Role          Role          `bson:"role" json:"role"`
	Department    string        `bson:"department" json:"department"`
	Month         string        `bson:"month" json:"month"` // "2026-09"
	Year          int           `bson:"year" json:"year"`
	PresentDays   int           `bson:"presentDays" json:"presentDays"`
	AbsentDays    int           `bson:"absentDays" json:"absentDays"`
	LeaveDays     float64       `bson:"leaveDays" json:"leaveDays"`
	OvertimeHours float64       `bson:"overtimeHours" json:"overtimeHours"`
	BasicSalary   float64       `bson:"basicSalary" json:"basicSalary"`
	HRA           float64       `bson:"hra" json:"hra"`
	Allowances    float64       `bson:"allowances" json:"allowances"`
	OvertimePay   float64       `bson:"overtimePay" json:"overtimePay"`
	Bonus         float64       `bson:"bonus" json:"bonus"`
	GrossEarnings float64       `bson:"grossEarnings" json:"grossEarnings"`
	Deductions    float64       `bson:"deductions" json:"deductions"`
	NetPay        float64       `bson:"netPay" json:"netPay"`
	PaymentStatus string        `bson:"paymentStatus" json:"paymentStatus"` // "paid", "pending"
	PaidAt        *time.Time    `bson:"paidAt,omitempty" json:"paidAt,omitempty"`
	CreatedAt     time.Time     `bson:"createdAt" json:"createdAt"`
}

type Holiday struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	TenantID  bson.ObjectID `bson:"tenantId" json:"tenantId"`
	Name      string        `bson:"name" json:"name"`
	Date      string        `bson:"date" json:"date"` // YYYY-MM-DD
	Type      string        `bson:"type" json:"type"` // "national", "state", "restaurant"
	CreatedAt time.Time     `bson:"createdAt" json:"createdAt"`
}

// ── Geofencing Distance Calculation ──────────────────────────────────────────

// CalculateDistanceMeters computes the spherical distance in meters using Haversine formula.
func CalculateDistanceMeters(lat1, lon1, lat2, lon2 float64) float64 {
	const earthRadius = 6371000.0 // Earth radius in meters
	dLat := (lat2 - lat1) * (math.Pi / 180.0)
	dLon := (lon2 - lon1) * (math.Pi / 180.0)
	rLat1 := lat1 * (math.Pi / 180.0)
	rLat2 := lat2 * (math.Pi / 180.0)

	a := math.Sin(dLat/2.0)*math.Sin(dLat/2.0) +
		math.Cos(rLat1)*math.Cos(rLat2)*math.Sin(dLon/2.0)*math.Sin(dLon/2.0)
	c := 2.0 * math.Atan2(math.Sqrt(a), math.Sqrt(1.0-a))
	return math.Round(earthRadius*c*100) / 100
}
