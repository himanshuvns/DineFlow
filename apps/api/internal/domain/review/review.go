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

// PrivateFeedback stores customer reviews and complaints internally.
// Negative reviews (1-3 stars) are shielded internally for manager intervention.
// Positive reviews (4-5 stars) are tracked when guests copy to Google Maps.
type PrivateFeedback struct {
	ID              bson.ObjectID `bson:"_id,omitempty" json:"id"`
	TenantID        bson.ObjectID `bson:"tenantId" json:"tenantId"`
	TenantSlug      string        `bson:"tenantSlug,omitempty" json:"tenantSlug,omitempty"`
	Rating          int           `bson:"rating" json:"rating"`
	IssueCategories []string      `bson:"issueCategories,omitempty" json:"issueCategories,omitempty"`
	VibeTags        []string      `bson:"vibeTags,omitempty" json:"vibeTags,omitempty"`
	Comment         string        `bson:"comment" json:"comment"`
	GuestName       string        `bson:"guestName,omitempty" json:"guestName,omitempty"`
	GuestPhone      string        `bson:"guestPhone,omitempty" json:"guestPhone,omitempty"`
	GuestEmail      string        `bson:"guestEmail,omitempty" json:"guestEmail,omitempty"`
	TableOrRoom     string        `bson:"tableOrRoom,omitempty" json:"tableOrRoom,omitempty"`
	Status          string        `bson:"status" json:"status"` // "new", "in_review", "resolved", "positive"
	ResolutionNotes string        `bson:"resolutionNotes,omitempty" json:"resolutionNotes,omitempty"`
	CreatedAt       time.Time     `bson:"createdAt" json:"createdAt"`
	UpdatedAt       time.Time     `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
}

// ReviewStats aggregates performance metrics for the Smart QR Review Stand.
type ReviewStats struct {
	TotalScans        int64   `json:"totalScans"`
	PositiveGenerated int64   `json:"positiveGenerated"`
	NegativeShielded  int64   `json:"negativeShielded"`
	AverageSentiment  float64 `json:"averageSentiment"` // 1.0 to 5.0
	TotalReviews      int64   `json:"totalReviews"`
	FiveStarCount     int64   `json:"fiveStarCount"`
	FourStarCount     int64   `json:"fourStarCount"`
	ThreeStarCount    int64   `json:"threeStarCount"`
	TwoStarCount      int64   `json:"twoStarCount"`
	OneStarCount      int64   `json:"oneStarCount"`
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
