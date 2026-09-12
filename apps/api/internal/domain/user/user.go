package user

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// Role defines the permission level of a user within a tenant.
type Role string

const (
	RoleOwner   Role = "owner"
	RoleManager Role = "manager"
	RoleChef    Role = "chef"
	RoleWaiter  Role = "waiter"
	RoleCashier Role = "cashier"
)

// Status is the user account state.
type Status string

const (
	StatusActive   Status = "active"
	StatusInactive Status = "inactive"
	StatusInvited  Status = "invited"
)

// Permissions specifies granular access control for a user.
type Permissions struct {
	CanManageMenu    bool `bson:"canManageMenu" json:"canManageMenu"`
	CanManageStaff   bool `bson:"canManageStaff" json:"canManageStaff"`
	CanViewAnalytics bool `bson:"canViewAnalytics" json:"canViewAnalytics"`
	CanManageBilling bool `bson:"canManageBilling" json:"canManageBilling"`
	CanManageOrders  bool `bson:"canManageOrders" json:"canManageOrders"`
	CanAccessKDS     bool `bson:"canAccessKDS" json:"canAccessKDS"`
	CanManageTables  bool `bson:"canManageTables" json:"canManageTables"`
}

// RefreshToken represents a stored refresh token entry.
type RefreshToken struct {
	TokenID    string    `bson:"tokenId" json:"-"`    // JTI from JWT
	HashedToken string   `bson:"hashedToken" json:"-"` // bcrypt of the raw refresh token
	ExpiresAt  time.Time `bson:"expiresAt" json:"-"`
	DeviceInfo string    `bson:"deviceInfo" json:"-"`
	CreatedAt  time.Time `bson:"createdAt" json:"-"`
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

// User is a staff member or owner associated with a single tenant.
type User struct {
	ID                bson.ObjectID `bson:"_id,omitempty" json:"id"`
	TenantID          bson.ObjectID `bson:"tenantId" json:"tenantId"`
	Email             string        `bson:"email,omitempty" json:"email,omitempty"`
	Phone             string        `bson:"phone,omitempty" json:"phone,omitempty"`
	Name              string             `bson:"name" json:"name"`
	Avatar            string             `bson:"avatar,omitempty" json:"avatar,omitempty"`
	Role              Role               `bson:"role" json:"role"`
	Permissions       Permissions        `bson:"permissions" json:"permissions"`
	Auth              Auth               `bson:"auth" json:"-"`
	NotificationPrefs NotificationPrefs  `bson:"notificationPrefs" json:"notificationPrefs"`
	InvitedBy         *bson.ObjectID `bson:"invitedBy,omitempty" json:"invitedBy,omitempty"`
	InviteToken       string             `bson:"inviteToken,omitempty" json:"-"`
	InviteExpiresAt   *time.Time         `bson:"inviteExpiresAt,omitempty" json:"-"`
	Status            Status             `bson:"status" json:"status"`
	CreatedAt         time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt         time.Time          `bson:"updatedAt" json:"updatedAt"`
}

// DefaultPermissionsForRole returns the default permission set for a role.
func DefaultPermissionsForRole(role Role) Permissions {
	switch role {
	case RoleOwner:
		return Permissions{
			CanManageMenu: true, CanManageStaff: true, CanViewAnalytics: true,
			CanManageBilling: true, CanManageOrders: true, CanAccessKDS: true, CanManageTables: true,
		}
	case RoleManager:
		return Permissions{
			CanManageMenu: true, CanManageStaff: false, CanViewAnalytics: true,
			CanManageBilling: false, CanManageOrders: true, CanAccessKDS: true, CanManageTables: true,
		}
	case RoleChef:
		return Permissions{
			CanManageMenu: false, CanManageStaff: false, CanViewAnalytics: false,
			CanManageBilling: false, CanManageOrders: false, CanAccessKDS: true, CanManageTables: false,
		}
	case RoleWaiter:
		return Permissions{
			CanManageMenu: false, CanManageStaff: false, CanViewAnalytics: false,
			CanManageBilling: false, CanManageOrders: true, CanAccessKDS: false, CanManageTables: true,
		}
	case RoleCashier:
		return Permissions{
			CanManageMenu: false, CanManageStaff: false, CanViewAnalytics: true,
			CanManageBilling: false, CanManageOrders: true, CanAccessKDS: false, CanManageTables: false,
		}
	default:
		return Permissions{}
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
	ID          string      `json:"id"`
	TenantID    string      `json:"tenantId"`
	Email       string      `json:"email,omitempty"`
	Phone       string      `json:"phone,omitempty"`
	Name        string      `json:"name"`
	Avatar      string      `json:"avatar,omitempty"`
	Role        Role        `json:"role"`
	Permissions Permissions `json:"permissions"`
	Status      Status      `json:"status"`
	CreatedAt   time.Time   `json:"createdAt"`
}

// ToPublic converts a User to a PublicProfile safe for API serialization.
func (u *User) ToPublic() PublicProfile {
	return PublicProfile{
		ID:          u.ID.Hex(),
		TenantID:    u.TenantID.Hex(),
		Email:       u.Email,
		Phone:       u.Phone,
		Name:        u.Name,
		Avatar:      u.Avatar,
		Role:        u.Role,
		Permissions: u.Permissions,
		Status:      u.Status,
		CreatedAt:   u.CreatedAt,
	}
}
