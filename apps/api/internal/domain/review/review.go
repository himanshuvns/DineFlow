package review

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// GenerateReviewRequest is sent by guests on the smart review landing page to draft review text.
type GenerateReviewRequest struct {
	TenantID        string   `json:"tenantId,omitempty"`
	Rating          int      `json:"rating"`
	Tags            []string `json:"tags"`
	RestaurantName  string   `json:"restaurantName"`
	Cuisine         string   `json:"cuisine,omitempty"`
	SignatureDishes []string `json:"signatureDishes,omitempty"`
	Language        string   `json:"language,omitempty"` // "en", "hi", "es", etc.
}

// GenerateReviewResponse provides AI-drafted review texts and direct Google Maps review link.
type GenerateReviewResponse struct {
	Suggestions          []string `json:"suggestions"`
	GooglePlaceReviewURL string   `json:"googlePlaceReviewURL"`
}

// PrivateFeedback stores 1-3 star negative reviews internally to protect public Google rating.
type PrivateFeedback struct {
	ID              bson.ObjectID `bson:"_id,omitempty" json:"id"`
	TenantID        bson.ObjectID `bson:"tenantId" json:"tenantId"`
	Rating          int           `bson:"rating" json:"rating"`
	IssueCategories []string      `bson:"issueCategories" json:"issueCategories"`
	Comment         string        `bson:"comment" json:"comment"`
	GuestPhone      string        `bson:"guestPhone" json:"guestPhone"`
	Status          string        `bson:"status" json:"status"` // "new", "acknowledged", "resolved"
	CreatedAt       time.Time     `bson:"createdAt" json:"createdAt"`
}

// ReviewStats aggregates performance metrics for the Smart QR Review Stand.
type ReviewStats struct {
	TotalScans        int64   `json:"totalScans"`
	PositiveGenerated int64   `json:"positiveGenerated"`
	NegativeShielded  int64   `json:"negativeShielded"`
	ConversionRate    float64 `json:"conversionRate"` // % of scans that generated positive drafts
}

// PublicRestaurantReviewMeta provides public metadata for the guest QR review landing page.
type PublicRestaurantReviewMeta struct {
	TenantID             string   `json:"tenantId"`
	RestaurantName       string   `json:"restaurantName"`
	Slug                 string   `json:"slug"`
	Logo                 string   `json:"logo,omitempty"`
	Cuisine              string   `json:"cuisine,omitempty"`
	SignatureDishes      []string `json:"signatureDishes"`
	GooglePlaceReviewURL string   `json:"googlePlaceReviewURL"`
	City                 string   `json:"city,omitempty"`
	PopularTags          []string `json:"popularTags"`
}
