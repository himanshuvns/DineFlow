package offer

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type DiscountType string

const (
	DiscountTypePercentage  DiscountType = "percentage"
	DiscountTypeFixedAmount DiscountType = "fixed_amount"
	DiscountTypeFreeItem    DiscountType = "free_item"
)

type TargetAudience string

const (
	AudienceBilledToday TargetAudience = "billed_today"
	AudienceServedToday TargetAudience = "served_today"
	AudiencePastWeek    TargetAudience = "past_week"
	AudienceAllGuests   TargetAudience = "all_guests"
)

// OfferStats tracks real-time engagement and conversion metrics.
type OfferStats struct {
	SentCount        int64   `bson:"sentCount" json:"sentCount"`
	DeliveredCount   int64   `bson:"deliveredCount" json:"deliveredCount"`
	ClickedCount     int64   `bson:"clickedCount" json:"clickedCount"`
	OrdersCount      int64   `bson:"ordersCount" json:"ordersCount"`
	RevenueGenerated float64 `bson:"revenueGenerated" json:"revenueGenerated"`
}

// Offer represents a promotional or post-dining re-engagement offer.
type Offer struct {
	ID             bson.ObjectID  `bson:"_id,omitempty" json:"id"`
	TenantID       bson.ObjectID  `bson:"tenantId" json:"tenantId"`
	Title          string         `bson:"title" json:"title"`
	Message        string         `bson:"message" json:"message"`
	PromoCode      string         `bson:"promoCode" json:"promoCode"`
	DiscountType   DiscountType   `bson:"discountType" json:"discountType"`
	DiscountValue  float64        `bson:"discountValue" json:"discountValue"`
	TargetAudience TargetAudience `bson:"targetAudience" json:"targetAudience"`
	Channels       []string       `bson:"channels" json:"channels"` // "web_push", "whatsapp", "in_app"
	DeepLinkURL    string         `bson:"deepLinkUrl" json:"deepLinkUrl"`
	MinOrderValue  float64        `bson:"minOrderValue" json:"minOrderValue"`
	ExpiresAt      *time.Time     `bson:"expiresAt,omitempty" json:"expiresAt,omitempty"`
	IsActive       bool           `bson:"isActive" json:"isActive"`
	Stats          OfferStats     `bson:"stats" json:"stats"`
	CreatedAt      time.Time      `bson:"createdAt" json:"createdAt"`
	UpdatedAt      time.Time      `bson:"updatedAt" json:"updatedAt"`
}

// PushSubscription holds Web Push notification tokens for guest browser devices.
type PushSubscription struct {
	ID            bson.ObjectID `bson:"_id,omitempty" json:"id"`
	TenantID      bson.ObjectID `bson:"tenantId" json:"tenantId"`
	Endpoint      string        `bson:"endpoint" json:"endpoint"`
	P256dhKey     string        `bson:"p256dhKey" json:"p256dhKey"`
	AuthKey       string        `bson:"authKey" json:"authKey"`
	CustomerPhone string        `bson:"customerPhone,omitempty" json:"customerPhone,omitempty"`
	TableSlug     string        `bson:"tableSlug,omitempty" json:"tableSlug,omitempty"`
	CreatedAt     time.Time     `bson:"createdAt" json:"createdAt"`
	UpdatedAt     time.Time     `bson:"updatedAt" json:"updatedAt"`
}

// BroadcastResult summarizes the outcome of a promotional dispatch.
type BroadcastResult struct {
	OfferID           string   `json:"offerId"`
	TargetAudience    string   `json:"targetAudience"`
	AudienceCount     int      `json:"audienceCount"`
	WhatsAppSentCount int      `json:"whatsappSentCount"`
	RealtimeSent      bool     `json:"realtimeSent"`
	DispatchedAt      string   `json:"dispatchedAt"`
	Channels          []string `json:"channels"`
}
