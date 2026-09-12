package whatsapp

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type MessageType string

const (
	TypeText        MessageType = "text"
	TypeTemplate    MessageType = "template"
	TypeInteractive MessageType = "interactive"
)

type MessageStatus string

const (
	StatusQueued    MessageStatus = "queued"
	StatusSent      MessageStatus = "sent"
	StatusDelivered MessageStatus = "delivered"
	StatusRead      MessageStatus = "read"
	StatusFailed    MessageStatus = "failed"
)

type TemplateType string

const (
	TemplateOrderConfirmed  TemplateType = "order_confirmed"
	TemplateKitchenReady    TemplateType = "kitchen_ready"
	TemplateTaxInvoice      TemplateType = "tax_invoice"
	TemplateFeedbackRequest TemplateType = "feedback_request"
)

type MessageLog struct {
	ID          bson.ObjectID `bson:"_id,omitempty" json:"id"`
	TenantID    bson.ObjectID `bson:"tenantId" json:"tenantId"`
	Recipient   string        `bson:"recipient" json:"recipient"`
	CustomerName string       `bson:"customerName" json:"customerName"`
	Template    TemplateType  `bson:"template" json:"template"`
	Body        string        `bson:"body" json:"body"`
	Status      MessageStatus `bson:"status" json:"status"`
	ExternalID  string        `bson:"externalId,omitempty" json:"externalId,omitempty"`
	CreatedAt   time.Time     `bson:"createdAt" json:"createdAt"`
	DeliveredAt *time.Time    `bson:"deliveredAt,omitempty" json:"deliveredAt,omitempty"`
	ReadAt      *time.Time    `bson:"readAt,omitempty" json:"readAt,omitempty"`
}

type OrderConfirmationData struct {
	CustomerName   string
	RestaurantName string
	LocationName   string // e.g. "Table 4" or "Suite 302"
	OrderNumber    string
	TotalAmount    float64
	Currency       string
	ItemCount      int
	TrackingURL    string
}

// BuildOrderConfirmationMessage formats a luxury WhatsApp order receipt.
func BuildOrderConfirmationMessage(data OrderConfirmationData) string {
	curr := data.Currency
	if curr == "INR" || curr == "" {
		curr = "₹"
	}

	return fmt.Sprintf(
		"Hello %s! ✨ Your order #%s at %s (%s) has been confirmed and is being freshly prepared in our kitchen.\n\n"+
			"📋 %d Course(s) | Total: %s%.2f\n"+
			"📍 Live Kitchen Tracker: %s\n\n"+
			"Reply STOP to unsubscribe from automated dining alerts.",
		data.CustomerName,
		data.OrderNumber,
		data.RestaurantName,
		data.LocationName,
		data.ItemCount,
		curr,
		data.TotalAmount,
		data.TrackingURL,
	)
}

// BuildKitchenReadyMessage formats an alert when an order is ready for service or delivery.
func BuildKitchenReadyMessage(customerName, restaurantName, locationName string) string {
	return fmt.Sprintf(
		"🔔 Chef's update for %s: Your freshly prepared courses at %s are ready and on their way to %s! Enjoy your meal.\n\nReply STOP to unsubscribe.",
		customerName,
		restaurantName,
		locationName,
	)
}

// BuildFeedbackRequestMessage formats a post-dining 1-5 star review prompt.
func BuildFeedbackRequestMessage(customerName, restaurantName string) string {
	return fmt.Sprintf(
		"Thank you for dining at %s today, %s! ⭐\n\n"+
			"How was your culinary experience? Reply with a number from 1 (Poor) to 5 (Exceptional) to share your feedback.\n\n"+
			"Reply STOP to opt-out.",
		restaurantName,
		customerName,
	)
}

// IsOptOutKeyword checks if an incoming message is requesting to unsubscribe.
func IsOptOutKeyword(text string) bool {
	clean := strings.TrimSpace(strings.ToUpper(text))
	switch clean {
	case "STOP", "UNSUBSCRIBE", "CANCEL", "OPT OUT", "OPTOUT", "QUIT":
		return true
	default:
		return false
	}
}

// ParseRating extracts an integer rating (1 to 5) from guest responses.
func ParseRating(text string) (int, bool) {
	clean := strings.TrimSpace(text)
	if len(clean) == 1 {
		val, err := strconv.Atoi(clean)
		if err == nil && val >= 1 && val <= 5 {
			return val, true
		}
	}
	// Check for emoji star count
	starCount := strings.Count(text, "⭐") + strings.Count(text, "★")
	if starCount >= 1 && starCount <= 5 {
		return starCount, true
	}

	return 0, false
}
