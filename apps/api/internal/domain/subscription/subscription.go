package subscription

import (
	"errors"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type PlanTier string

const (
	PlanFree     PlanTier = "free"
	PlanStarter  PlanTier = "starter"
	PlanGrowth   PlanTier = "growth"
	PlanHotelPro PlanTier = "hotel_pro"
)

type BillingCycle string

const (
	CycleMonthly BillingCycle = "monthly"
	CycleAnnual  BillingCycle = "annual"
)

type SubscriptionStatus string

const (
	StatusActive      SubscriptionStatus = "active"
	StatusPastDue     SubscriptionStatus = "past_due"
	StatusGracePeriod SubscriptionStatus = "grace_period"
	StatusCancelled   SubscriptionStatus = "cancelled"
)

type PlanLimits struct {
	MaxTables         int     `json:"maxTables"`         // -1 indicates unlimited
	MaxMenuItems      int     `json:"maxMenuItems"`      // -1 indicates unlimited
	MaxStaff          int     `json:"maxStaff"`          // -1 indicates unlimited
	MaxLocations      int     `json:"maxLocations"`      // -1 indicates unlimited
	MonthlyPriceINR   float64 `json:"monthlyPriceINR"`
	AnnualPriceINR    float64 `json:"annualPriceINR"`    // Monthly price when billed annually
	HasHotelModule    bool    `json:"hasHotelModule"`
	HasMultiKDS       bool    `json:"hasMultiKDS"`
	HasWhatsAppAlerts bool    `json:"hasWhatsAppAlerts"`
	HasWhiteLabel     bool    `json:"hasWhiteLabel"`
}

var PlanMatrix = map[PlanTier]PlanLimits{
	PlanFree: {
		MaxTables:         5,
		MaxMenuItems:      30,
		MaxStaff:          2,
		MaxLocations:      1,
		MonthlyPriceINR:   0,
		AnnualPriceINR:    0,
		HasHotelModule:    false,
		HasMultiKDS:       false,
		HasWhatsAppAlerts: false,
		HasWhiteLabel:     false,
	},
	PlanStarter: {
		MaxTables:         20,
		MaxMenuItems:      100,
		MaxStaff:          5,
		MaxLocations:      1,
		MonthlyPriceINR:   999,
		AnnualPriceINR:    799,
		HasHotelModule:    false,
		HasMultiKDS:       false,
		HasWhatsAppAlerts: true,
		HasWhiteLabel:     false,
	},
	PlanGrowth: {
		MaxTables:         100,
		MaxMenuItems:      -1,
		MaxStaff:          25,
		MaxLocations:      3,
		MonthlyPriceINR:   2999,
		AnnualPriceINR:    2399,
		HasHotelModule:    false,
		HasMultiKDS:       true,
		HasWhatsAppAlerts: true,
		HasWhiteLabel:     false,
	},
	PlanHotelPro: {
		MaxTables:         -1,
		MaxMenuItems:      -1,
		MaxStaff:          -1,
		MaxLocations:      -1,
		MonthlyPriceINR:   7999,
		AnnualPriceINR:    6399,
		HasHotelModule:    true,
		HasMultiKDS:       true,
		HasWhatsAppAlerts: true,
		HasWhiteLabel:     true,
	},
}

type Subscription struct {
	ID                 bson.ObjectID      `bson:"_id,omitempty" json:"id"`
	TenantID           bson.ObjectID      `bson:"tenantId" json:"tenantId"`
	Plan               PlanTier           `bson:"plan" json:"plan"`
	Cycle              BillingCycle       `bson:"cycle" json:"cycle"`
	Status             SubscriptionStatus `bson:"status" json:"status"`
	CurrentPeriodStart time.Time          `bson:"currentPeriodStart" json:"currentPeriodStart"`
	CurrentPeriodEnd   time.Time          `bson:"currentPeriodEnd" json:"currentPeriodEnd"`
	GracePeriodEnd     *time.Time         `bson:"gracePeriodEnd,omitempty" json:"gracePeriodEnd,omitempty"`
	Provider           string             `bson:"provider" json:"provider"` // "razorpay" or "stripe"
	ProviderSubID      string             `bson:"providerSubId,omitempty" json:"providerSubId,omitempty"`
	CreatedAt          time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt          time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type Invoice struct {
	ID            bson.ObjectID `bson:"_id,omitempty" json:"id"`
	TenantID      bson.ObjectID `bson:"tenantId" json:"tenantId"`
	InvoiceNumber string        `bson:"invoiceNumber" json:"invoiceNumber"`
	PlanName      string        `bson:"planName" json:"planName"`
	Amount        float64       `bson:"amount" json:"amount"`
	Currency      string        `bson:"currency" json:"currency"`
	Status        string        `bson:"status" json:"status"` // "paid", "open", "void"
	PaidAt        time.Time     `bson:"paidAt" json:"paidAt"`
	PDFUrl        string        `bson:"pdfUrl" json:"pdfUrl"`
	BillingPeriod string        `bson:"billingPeriod" json:"billingPeriod"`
}

func GetLimits(plan PlanTier) PlanLimits {
	if limits, ok := PlanMatrix[plan]; ok {
		return limits
	}
	return PlanMatrix[PlanFree]
}

func (s *Subscription) Validate() error {
	if s.TenantID.IsZero() {
		return errors.New("tenantId is required")
	}
	if s.Plan == "" {
		s.Plan = PlanFree
	}
	if s.Cycle == "" {
		s.Cycle = CycleMonthly
	}
	if s.Status == "" {
		s.Status = StatusActive
	}
	return nil
}

// CanAddTable checks if adding another table exceeds the subscription limit.
func (s *Subscription) CanAddTable(currentTableCount int) bool {
	limits := GetLimits(s.Plan)
	if limits.MaxTables == -1 {
		return true
	}
	return currentTableCount < limits.MaxTables
}

// CanAddMenuItem checks if adding another dish exceeds the plan limit.
func (s *Subscription) CanAddMenuItem(currentCount int) bool {
	limits := GetLimits(s.Plan)
	if limits.MaxMenuItems == -1 {
		return true
	}
	return currentCount < limits.MaxMenuItems
}

// EnterGracePeriod starts the 14-day protection window on payment failure.
func (s *Subscription) EnterGracePeriod() {
	now := time.Now().UTC()
	graceEnd := now.Add(14 * 24 * time.Hour)
	s.Status = StatusGracePeriod
	s.GracePeriodEnd = &graceEnd
	s.UpdatedAt = now
}

// IsGracePeriodExpired checks whether the 14-day grace period has lapsed.
func (s *Subscription) IsGracePeriodExpired() bool {
	if s.Status != StatusGracePeriod || s.GracePeriodEnd == nil {
		return false
	}
	return time.Now().UTC().After(*s.GracePeriodEnd)
}

func (s *Subscription) GetPrice() float64 {
	limits := GetLimits(s.Plan)
	if s.Cycle == CycleAnnual {
		return limits.AnnualPriceINR * 12
	}
	return limits.MonthlyPriceINR
}

func FormatPlanName(plan PlanTier) string {
	switch plan {
	case PlanFree:
		return "Free Tier"
	case PlanStarter:
		return "Starter"
	case PlanGrowth:
		return "Growth"
	case PlanHotelPro:
		return "Hotel Pro"
	default:
		return fmt.Sprintf("%s", plan)
	}
}
