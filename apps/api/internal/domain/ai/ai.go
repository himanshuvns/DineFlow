// Package ai defines the domain types for Phase 6 AI features.
// All structs are pure data — no external dependencies.
package ai

// ─── 6.1  Menu Description Generator ─────────────────────────────────────────

// MenuDescriptionRequest is sent when a manager wants AI-generated item copy.
type MenuDescriptionRequest struct {
	ItemName     string   `json:"itemName"`
	CategoryName string   `json:"categoryName"`
	DietaryTags  []string `json:"dietaryTags"`
	BasePrice    float64  `json:"basePrice"`
	// Tone: "poetic" | "informative" | "playful"
	Tone string `json:"tone"`
}

// MenuDescriptionResponse carries the generated description and a headline.
type MenuDescriptionResponse struct {
	Headline    string `json:"headline"`
	Description string `json:"description"`
	// TagLine is a short one-liner suitable for the menu card subtitle.
	TagLine string `json:"tagLine"`
	// Tokens used in the generation call (0 in mock mode).
	TokensUsed int `json:"tokensUsed"`
}

// ─── 6.2  Upsell Suggestions ──────────────────────────────────────────────────

// UpsellRequest contains the current cart item names.
type UpsellRequest struct {
	CartItems []string `json:"cartItems"`
	Channel   string   `json:"channel"` // "dine_in" | "in_room" | "takeaway"
}

// UpsellSuggestion is a single "Goes well with…" recommendation.
type UpsellSuggestion struct {
	Name        string  `json:"name"`
	Reason      string  `json:"reason"`
	PriceINR    float64 `json:"priceINR"`
	EstLiftPerc float64 `json:"estLiftPerc"` // Estimated AOV lift %
}

// UpsellResponse holds up to 3 complementary dish suggestions.
type UpsellResponse struct {
	Suggestions []UpsellSuggestion `json:"suggestions"`
}

// ─── 6.3  Demand Forecasting ──────────────────────────────────────────────────

// ForecastHour is a single hour-slot prediction.
type ForecastHour struct {
	Hour            string  `json:"hour"`            // e.g. "19:00"
	PredictedOrders int     `json:"predictedOrders"` // forecasted order count
	Confidence      float64 `json:"confidence"`      // 0–1 confidence score
}

// ForecastDay groups hourly predictions for a single calendar day.
type ForecastDay struct {
	DayLabel  string         `json:"dayLabel"` // e.g. "Monday"
	Date      string         `json:"date"`     // ISO 8601 date
	Hours     []ForecastHour `json:"hours"`
	PeakHour  string         `json:"peakHour"`
	TotalPred int            `json:"totalPred"`
}

// ForecastResponse is the full 7-day demand forecast.
type ForecastResponse struct {
	Days               []ForecastDay `json:"days"`
	StaffingInsights   []string      `json:"staffingInsights"`
	GeneratedAt        string        `json:"generatedAt"`
}

// ─── 6.4  WhatsApp Chatbot ────────────────────────────────────────────────────

// ChatbotMessage is an inbound guest message from WhatsApp.
type ChatbotMessage struct {
	GuestPhone   string `json:"guestPhone"`
	GuestName    string `json:"guestName"`
	MessageText  string `json:"messageText"`
	ConversationHistory []ChatTurn `json:"conversationHistory,omitempty"`
}

// ChatTurn holds one exchange in the conversation history.
type ChatTurn struct {
	Role    string `json:"role"` // "user" | "assistant"
	Content string `json:"content"`
}

// ChatbotResponse is the structured bot reply.
type ChatbotResponse struct {
	ReplyText string `json:"replyText"`
	// Intent: "reorder" | "track_order" | "menu_query" | "greeting" | "unknown"
	Intent     string   `json:"intent"`
	QuickReplies []string `json:"quickReplies,omitempty"`
}

// ─── 6.5  Smart Pricing Alerts ────────────────────────────────────────────────

// PricingAlert flags an item with a recommended action.
type PricingAlert struct {
	ItemName        string  `json:"itemName"`
	Category        string  `json:"category"`
	CurrentPrice    float64 `json:"currentPrice"`
	SuggestedPrice  float64 `json:"suggestedPrice"`
	Margin          float64 `json:"margin"`
	VolumeLastMonth int     `json:"volumeLastMonth"`
	// Severity: "high" | "medium" | "low"
	Severity string `json:"severity"`
	// AlertType: "underpriced" | "overpriced" | "low_margin" | "low_velocity"
	AlertType string `json:"alertType"`
	Rationale string `json:"rationale"`
}

// PricingAlertsResponse holds all flagged items for the tenant.
type PricingAlertsResponse struct {
	Alerts        []PricingAlert `json:"alerts"`
	TotalScanned  int            `json:"totalScanned"`
	EstRevenueGain float64      `json:"estRevenueGain"` // projected monthly uplift (INR)
}
