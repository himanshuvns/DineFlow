package tenant

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// BusinessType categorises what kind of hospitality business this tenant is.
type BusinessType string

const (
	BusinessTypeRestaurant BusinessType = "restaurant"
	BusinessTypeCafe       BusinessType = "cafe"
	BusinessTypeHotel      BusinessType = "hotel"
	BusinessTypeCloudKitchen BusinessType = "cloud_kitchen"
	BusinessTypeFoodTruck  BusinessType = "food_truck"
	BusinessTypeResort      BusinessType = "resort"
)

// Plan represents a DineFlow subscription tier.
type Plan string

const (
	PlanFree     Plan = "free"
	PlanStarter  Plan = "starter"
	PlanGrowth   Plan = "growth"
	PlanHotelPro Plan = "hotel_pro"
)

// Status represents the tenant account state.
type Status string

const (
	StatusActive    Status = "active"
	StatusSuspended Status = "suspended"
	StatusDeleted   Status = "deleted"
)

// Contact holds communication details for the business.
type Contact struct {
	Email         string `bson:"email,omitempty" json:"email,omitempty"`
	Phone         string `bson:"phone,omitempty" json:"phone,omitempty"`
	WhatsAppPhone string `bson:"whatsappPhone,omitempty" json:"whatsappPhone,omitempty"`
}

// Address holds the physical address.
type Address struct {
	Line1   string `bson:"line1" json:"line1"`
	Line2   string `bson:"line2,omitempty" json:"line2,omitempty"`
	City    string `bson:"city" json:"city"`
	State   string `bson:"state" json:"state"`
	Pincode string `bson:"pincode" json:"pincode"`
	Country string `bson:"country" json:"country"`
}

// DayHours represents opening hours for a single day.
type DayHours struct {
	Open   string `bson:"open" json:"open"`     // "09:00"
	Close  string `bson:"close" json:"close"`   // "23:00"
	IsOpen bool   `bson:"isOpen" json:"isOpen"`
}

// OperatingHours maps weekdays to their hours.
type OperatingHours struct {
	Monday    DayHours `bson:"monday" json:"monday"`
	Tuesday   DayHours `bson:"tuesday" json:"tuesday"`
	Wednesday DayHours `bson:"wednesday" json:"wednesday"`
	Thursday  DayHours `bson:"thursday" json:"thursday"`
	Friday    DayHours `bson:"friday" json:"friday"`
	Saturday  DayHours `bson:"saturday" json:"saturday"`
	Sunday    DayHours `bson:"sunday" json:"sunday"`
}

// Settings holds tenant-configurable operational settings.
type Settings struct {
	OperatingHours         OperatingHours `bson:"operatingHours" json:"operatingHours"`
	OrderingEnabled        bool           `bson:"orderingEnabled" json:"orderingEnabled"`
	RequireGuestPhone      bool           `bson:"requireGuestPhone" json:"requireGuestPhone"`
	AutoAcceptOrders       bool           `bson:"autoAcceptOrders" json:"autoAcceptOrders"`
	PreparationTimeMinutes int            `bson:"preparationTimeMinutes" json:"preparationTimeMinutes"`
	OrderingPageTheme      string         `bson:"orderingPageTheme" json:"orderingPageTheme"`
	ItemUnavailableMode    string         `bson:"itemUnavailableMode" json:"itemUnavailableMode"` // "gray_out" | "hide"
}

// Features holds the feature flags determined by the subscription plan.
// These are recalculated on every plan change.
type Features struct {
	KDS                bool `bson:"kds" json:"kds"`
	WhatsApp           bool `bson:"whatsapp" json:"whatsapp"`
	AnalyticsAdvanced  bool `bson:"analyticsAdvanced" json:"analyticsAdvanced"`
	AnalyticsRetDays   int  `bson:"analyticsRetentionDays" json:"analyticsRetentionDays"`
	MultiLocation      bool `bson:"multiLocation" json:"multiLocation"`
	HotelModule        bool `bson:"hotelModule" json:"hotelModule"`
	CustomDomain       bool `bson:"customDomain" json:"customDomain"`
	BrandedQR          bool `bson:"brandedQr" json:"brandedQr"`
	OnlinePayment      bool `bson:"onlinePayment" json:"onlinePayment"`
	AISuggestions      bool `bson:"aiSuggestions" json:"aiSuggestions"`
	ExportCSV          bool `bson:"exportCsv" json:"exportCsv"`
	ExportPDF          bool `bson:"exportPdf" json:"exportPdf"`
	FloorPlan          bool `bson:"floorPlan" json:"floorPlan"`
	ThermalPrinter     bool `bson:"thermalPrinter" json:"thermalPrinter"`
	WhiteLabel         bool `bson:"whiteLabel" json:"whiteLabel"`
}

// Limits holds numeric plan limits.
type Limits struct {
	MaxTables          int `bson:"maxTables" json:"maxTables"`
	MaxMenuItems       int `bson:"maxMenuItems" json:"maxMenuItems"`
	MaxStaff           int `bson:"maxStaff" json:"maxStaff"`
	MaxLocations       int `bson:"maxLocations" json:"maxLocations"`
	MaxOrdersPerMonth  int `bson:"maxOrdersPerMonth" json:"maxOrdersPerMonth"`
}

// OnboardingSteps tracks completion of the onboarding checklist.
type OnboardingSteps struct {
	Profile  bool `bson:"profile" json:"profile"`
	Menu     bool `bson:"menu" json:"menu"`
	Tables   bool `bson:"tables" json:"tables"`
	QRCodes  bool `bson:"qrCodes" json:"qrCodes"`
	WhatsApp bool `bson:"whatsapp" json:"whatsapp"`
}

// Onboarding tracks the business's onboarding progress.
type Onboarding struct {
	Completed bool            `bson:"completed" json:"completed"`
	Steps     OnboardingSteps `bson:"steps" json:"steps"`
}

// Tenant is the root multi-tenant domain entity.
// Every other collection references this via TenantID.
type Tenant struct {
	ID           bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Slug         string             `bson:"slug" json:"slug"`
	Name         string             `bson:"name" json:"name"`
	BusinessType BusinessType       `bson:"businessType" json:"businessType"`
	Plan         Plan               `bson:"plan" json:"plan"`
	Status       Status             `bson:"status" json:"status"`
	Logo         string             `bson:"logo,omitempty" json:"logo,omitempty"`
	Timezone     string             `bson:"timezone" json:"timezone"`
	Currency     string             `bson:"currency" json:"currency"`
	Country      string             `bson:"country" json:"country"`
	TaxRate      float64            `bson:"taxRate" json:"taxRate"`
	Contact      Contact            `bson:"contact" json:"contact"`
	Address      Address            `bson:"address" json:"address"`
	Settings     Settings           `bson:"settings" json:"settings"`
	Features     Features           `bson:"features" json:"features"`
	Limits       Limits             `bson:"limits" json:"limits"`
	Onboarding   Onboarding         `bson:"onboarding" json:"onboarding"`
	CreatedAt    time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt    time.Time          `bson:"updatedAt" json:"updatedAt"`
	DeletedAt    *time.Time         `bson:"deletedAt,omitempty" json:"deletedAt,omitempty"`
}

// ─── Plan Feature Factories ────────────────────────────────────────────────────

// FeaturesForPlan returns the feature flags for a given subscription plan.
func FeaturesForPlan(plan Plan) Features {
	switch plan {
	case PlanStarter:
		return Features{
			KDS: true, FloorPlan: true, ThermalPrinter: true,
			OnlinePayment: true, WhatsApp: true,
			AnalyticsRetDays: 30,
		}
	case PlanGrowth:
		return Features{
			KDS: true, WhatsApp: true, FloorPlan: true, ThermalPrinter: true,
			OnlinePayment: true, AnalyticsAdvanced: true, MultiLocation: true,
			CustomDomain: true, BrandedQR: true, ExportCSV: true,
			AnalyticsRetDays: 365,
		}
	case PlanHotelPro:
		return Features{
			KDS: true, WhatsApp: true, FloorPlan: true, ThermalPrinter: true,
			OnlinePayment: true, AnalyticsAdvanced: true, MultiLocation: true,
			CustomDomain: true, BrandedQR: true, ExportCSV: true, ExportPDF: true,
			HotelModule: true, AISuggestions: true,
			AnalyticsRetDays: -1, // unlimited
		}
	default: // PlanFree
		return Features{
			KDS:              true,
			AnalyticsRetDays: 7,
		}
	}
}

// LimitsForPlan returns the numeric limits for a given subscription plan.
func LimitsForPlan(plan Plan) Limits {
	switch plan {
	case PlanStarter:
		return Limits{MaxTables: 20, MaxMenuItems: 100, MaxStaff: 5, MaxLocations: 1, MaxOrdersPerMonth: -1}
	case PlanGrowth:
		return Limits{MaxTables: 100, MaxMenuItems: -1, MaxStaff: 25, MaxLocations: 3, MaxOrdersPerMonth: -1}
	case PlanHotelPro:
		return Limits{MaxTables: -1, MaxMenuItems: -1, MaxStaff: -1, MaxLocations: -1, MaxOrdersPerMonth: -1}
	default: // PlanFree
		return Limits{MaxTables: 5, MaxMenuItems: 30, MaxStaff: 2, MaxLocations: 1, MaxOrdersPerMonth: 200}
	}
}
