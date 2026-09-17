package platform

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// PlatformRole defines elevated software owner roles.
type PlatformRole string

const (
	RoleSuperAdmin    PlatformRole = "super_admin"
	RolePlatformAdmin PlatformRole = "platform_admin"
	RoleFinanceAdmin  PlatformRole = "finance_admin"
	RoleSupportAgent  PlatformRole = "support_agent"
)

// ClientStatus represents a tenant's lifecycle state on the platform.
type ClientStatus string

const (
	StatusActive      ClientStatus = "active"
	StatusTrial       ClientStatus = "trial"
	StatusGracePeriod ClientStatus = "grace_period"
	StatusSuspended   ClientStatus = "suspended"
	StatusCancelled   ClientStatus = "cancelled"
)

// PlanTier represents the subscription tier.
type PlanTier string

const (
	PlanTierTrial      PlanTier = "trial"
	PlanTierStarter    PlanTier = "starter"
	PlanTierGrowth     PlanTier = "growth"
	PlanTierHotelPro   PlanTier = "hotel_pro"
	PlanTierEnterprise PlanTier = "enterprise"
)

// BusinessType indicates the hospitality vertical.
type BusinessType string

const (
	BusinessTypeRestaurant   BusinessType = "restaurant"
	BusinessTypeHotel        BusinessType = "hotel"
	BusinessTypeCafe         BusinessType = "cafe"
	BusinessTypeCloudKitchen BusinessType = "cloud_kitchen"
	BusinessTypeBar          BusinessType = "bar"
)

// TenantListItem is the projected summary for the platform client directory.
type TenantListItem struct {
	ID               string          `json:"id"`
	Name             string          `json:"name"`
	LegalName        string          `json:"legalName"`
	Slug             string          `json:"slug"`
	OwnerName        string          `json:"ownerName"`
	OwnerPhone       string          `json:"ownerPhone"`
	OwnerEmail       string          `json:"ownerEmail"`
	BusinessType     BusinessType    `json:"businessType"`
	Plan             PlanTier        `json:"plan"`
	BillingCycle     string          `json:"billingCycle"` // "monthly" | "annual"
	Status           ClientStatus    `json:"status"`
	TablesCount      int             `json:"tablesCount"`
	RoomsCount       int             `json:"roomsCount"`
	StaffCount       int             `json:"staffCount"`
	MenuCount        int             `json:"menuCount"`
	OrdersCount      int             `json:"ordersCount"`
	MRR              float64         `json:"mrr"`
	ARR              float64         `json:"arr"`
	TrialDaysLeft    int             `json:"trialDaysLeft"`
	RenewalDate      string          `json:"renewalDate"`
	JoinedAt         string          `json:"joinedAt"`
	LastActiveAt     string          `json:"lastActiveAt"`
	HealthScore      int             `json:"healthScore"` // 0-100% dynamically computed
	Address          string          `json:"address"`
	City             string          `json:"city"`
	State            string          `json:"state"`
	Currency         string          `json:"currency"`
	ActiveSessions   int             `json:"activeSessions"`
	StorageUsedMb    float64         `json:"storageUsedMb"`
	Integrations     Integrations    `json:"integrations"`
	FeatureOverrides map[string]bool `json:"featureOverrides"`
}

type Integrations struct {
	WhatsApp bool `json:"whatsapp"`
	Email    bool `json:"email"`
	QR       bool `json:"qr"`
}

// Tenant360Profile contains the complete 360-degree inspection payload for a single tenant.
type Tenant360Profile struct {
	TenantListItem
	OnboardingCompleted bool                  `json:"onboardingCompleted"`
	TaxRate             float64               `json:"taxRate"`
	Timezone            string                `json:"timezone"`
	Country             string                `json:"country"`
	Limits              map[string]int        `json:"limits"`
	RecentAuditLogs     []AuditLogRecord      `json:"recentAuditLogs"`
	RecentInvoices      []RevenueInvoice      `json:"recentInvoices"`
	RecentTickets       []SupportTicketRecord `json:"recentTickets"`
}

// DashboardMetrics represents the executive command center summary.
type DashboardMetrics struct {
	TotalClients       int     `json:"totalClients"`
	ActiveClients      int     `json:"activeClients"`
	TrialClients       int     `json:"trialClients"`
	GraceClients       int     `json:"graceClients"`
	SuspendedClients   int     `json:"suspendedClients"`
	TotalMRR           float64 `json:"totalMRR"`
	TotalARR           float64 `json:"totalARR"`
	PlatformGMV        float64 `json:"platformGMV"`
	TotalOrders        int     `json:"totalOrders"`
	TotalStaff         int     `json:"totalStaff"`
	TotalRooms         int     `json:"totalRooms"`
	TotalTables        int     `json:"totalTables"`
	TotalMenus         int     `json:"totalMenus"`
	HotelsCount        int     `json:"hotelsCount"`
	RestaurantsCount   int     `json:"restaurantsCount"`
	CafesCount         int     `json:"cafesCount"`
	CloudKitchensCount int     `json:"cloudKitchensCount"`
	OpenTickets        int     `json:"openTickets"`
	AvgHealthScore     int     `json:"avgHealthScore"`
	CollectionRate     float64 `json:"collectionRate"` // e.g. 98.4%
}

// RevenueOverview aggregates financial metrics for the revenue console.
type RevenueOverview struct {
	MRR                 float64          `json:"mrr"`
	ARR                 float64          `json:"arr"`
	NewRevenue          float64          `json:"newRevenue"`
	NetChurnRate        float64          `json:"netChurnRate"`
	ActiveSubscriptions int              `json:"activeSubscriptions"`
	TrialClients        int              `json:"trialClients"`
	FailedPaymentsCount int              `json:"failedPaymentsCount"`
	FailedPaymentsTotal float64          `json:"failedPaymentsTotal"`
	CollectionRate      float64          `json:"collectionRate"`
	ExpiringIn7Days     int              `json:"expiringIn7Days"`
	ExpiringIn3Days     int              `json:"expiringIn3Days"`
	ExpiredTrials       int              `json:"expiredTrials"`
	RecentInvoices      []RevenueInvoice `json:"recentInvoices"`
}

// RevenueInvoice represents an invoice record in the billing ledger.
type RevenueInvoice struct {
	ID            string     `bson:"_id,omitempty" json:"id"`
	TenantID      string     `bson:"tenantId" json:"clientId"`
	ClientName    string     `bson:"clientName,omitempty" json:"clientName"`
	InvoiceNumber string     `bson:"invoiceNumber" json:"invoiceNumber"`
	Plan          PlanTier   `bson:"plan" json:"plan"`
	Amount        float64    `bson:"amount" json:"amount"`
	Currency      string     `bson:"currency" json:"currency"`
	Status        string     `bson:"status" json:"status"` // "paid" | "failed" | "pending"
	PaymentMethod string     `bson:"paymentMethod" json:"paymentMethod"`
	Date          string     `bson:"date" json:"date"`
	DueDate       string     `bson:"dueDate" json:"dueDate"`
	PaidAt        *time.Time `bson:"paidAt,omitempty" json:"paidAt,omitempty"`
	CreatedAt     time.Time  `bson:"createdAt" json:"createdAt"`
}

// FeatureFlagRecord stores platform defaults and tenant-specific feature overrides in MongoDB.
type FeatureFlagRecord struct {
	ID        bson.ObjectID  `bson:"_id,omitempty" json:"id"`
	TenantID  *bson.ObjectID `bson:"tenantId,omitempty" json:"tenantId,omitempty"` // nil indicates platform-wide default
	Feature   string         `bson:"feature" json:"feature"`
	Enabled   bool           `bson:"enabled" json:"enabled"`
	UpdatedAt time.Time      `bson:"updatedAt" json:"updatedAt"`
	UpdatedBy string         `bson:"updatedBy" json:"updatedBy"`
}

// FeatureFlagDefinition describes a platform feature toggle for UI display.
type FeatureFlagDefinition struct {
	Key             string `json:"key"`
	Name            string `json:"name"`
	Description     string `json:"description"`
	Category        string `json:"category"` // "core" | "hotel" | "ai" | "growth" | "compliance"
	PlatformDefault bool   `json:"platformDefault"`
}

// SupportTicketRecord models customer support tickets in MongoDB.
type SupportTicketRecord struct {
	ID            bson.ObjectID `bson:"_id,omitempty" json:"id"`
	TicketID      string        `bson:"ticketId" json:"ticketId"` // e.g. "TCK-481"
	TenantID      bson.ObjectID `bson:"tenantId" json:"tenantId"`
	TenantName    string        `bson:"tenantName" json:"tenantName"`
	Subject       string        `bson:"subject" json:"subject"`
	Description   string        `bson:"description" json:"description"`
	Priority      string        `bson:"priority" json:"priority"` // "low" | "medium" | "high" | "urgent"
	Status        string        `bson:"status" json:"status"`     // "open" | "in_progress" | "resolved"
	Category      string        `bson:"category" json:"category"` // "billing" | "technical" | "whatsapp" | "hardware" | "onboarding"
	AssignedAgent string        `bson:"assignedAgent" json:"assignedAgent"`
	InternalNotes []string      `bson:"internalNotes" json:"internalNotes"`
	CreatedAt     time.Time     `bson:"createdAt" json:"createdAt"`
	UpdatedAt     time.Time     `bson:"updatedAt" json:"updatedAt"`
}

// AuditActor encapsulates the identity of the administrator who performed a sensitive action.
type AuditActor struct {
	ID    string `bson:"id,omitempty" json:"id,omitempty"`
	Name  string `bson:"name" json:"name"`
	Email string `bson:"email" json:"email"`
	Role  string `bson:"role" json:"role"`
}

// AuditLogRecord models immutable platform audit trail entries.
type AuditLogRecord struct {
	ID         bson.ObjectID  `bson:"_id,omitempty" json:"id"`
	Timestamp  time.Time      `bson:"timestamp" json:"timestamp"`
	Actor      AuditActor     `bson:"actor" json:"actor"`
	Action     string         `bson:"action" json:"action"`
	Category   string         `bson:"category" json:"category"` // "client" | "subscription" | "security" | "feature_flag" | "support" | "system"
	TargetID   string         `bson:"targetId,omitempty" json:"targetId,omitempty"`
	TargetName string         `bson:"targetName,omitempty" json:"targetName,omitempty"`
	IPAddress  string         `bson:"ipAddress" json:"ipAddress"`
	Details    string         `bson:"details" json:"details"`
	Metadata   map[string]any `bson:"metadata,omitempty" json:"metadata,omitempty"`
}

// PlatformNotificationRecord models alerts dispatched to platform admins.
type PlatformNotificationRecord struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Type      string        `bson:"type" json:"type"` // "tenant_signup" | "payment_failed" | "trial_expiring" | "system_alert"
	Title     string        `bson:"title" json:"title"`
	Message   string        `bson:"message" json:"message"`
	Target    string        `bson:"target" json:"target"` // URL to navigate to
	Read      bool          `bson:"read" json:"read"`
	CreatedAt time.Time     `bson:"createdAt" json:"createdAt"`
}

// SystemServiceHealth represents live edge and infrastructure component status.
type SystemServiceHealth struct {
	Name      string `json:"name"`
	Status    string `json:"status"` // "healthy" | "degraded" | "down"
	LatencyMs int64  `json:"latencyMs"`
	Uptime    string `json:"uptime"`
	Details   string `json:"details"`
}

// PlatformSettingsRecord stores singleton operational flags in MongoDB.
type PlatformSettingsRecord struct {
	ID                 string           `bson:"_id" json:"id"` // "singleton"
	MaintenanceMode    bool             `bson:"maintenanceMode" json:"maintenanceMode"`
	GlobalAnnouncement AnnouncementInfo `bson:"globalAnnouncement" json:"globalAnnouncement"`
	DefaultTrialDays   int              `bson:"defaultTrialDays" json:"defaultTrialDays"`
	UpdatedAt          time.Time        `bson:"updatedAt" json:"updatedAt"`
}

type AnnouncementInfo struct {
	Active  bool   `bson:"active" json:"active"`
	Message string `bson:"message" json:"message"`
	Type    string `bson:"type" json:"type"` // "info" | "warning" | "critical"
}

// ─── Dynamic Client Health Score Calculator ───────────────────────────────────

// CalculateHealthScore dynamically scores a client workspace from 0 to 100 based on onboarding
// completion and operational velocity.
func CalculateHealthScore(
	hasLogo bool,
	menuItemCount int,
	tableCount int,
	roomCount int,
	staffCount int,
	orderCount int,
	hasWhatsApp bool,
	hasQR bool,
) int {
	score := 0

	// 1. Branding (15 pts)
	if hasLogo {
		score += 15
	}

	// 2. Menu Setup (20 pts)
	if menuItemCount > 0 {
		score += 15
		if menuItemCount >= 10 {
			score += 5
		}
	}

	// 3. Infrastructure: Tables or Hotel Rooms (15 pts)
	if tableCount > 0 || roomCount > 0 {
		score += 15
	}

	// 4. Staff Workforce (20 pts)
	if staffCount > 0 {
		score += 15
		if staffCount >= 3 {
			score += 5
		}
	}

	// 5. Active Order Processing (15 pts)
	if orderCount > 0 {
		score += 15
	}

	// 6. Integrations: WhatsApp (10 pts)
	if hasWhatsApp {
		score += 10
	}

	// 7. Contactless QR Enabled (10 pts bonus / fallback)
	if hasQR {
		score += 5
	}

	if score > 100 {
		score = 100
	}
	return score
}
