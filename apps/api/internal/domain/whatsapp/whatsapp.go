package whatsapp

import (
	"fmt"
	"math"
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
	TypeMedia       MessageType = "media"
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
	TemplateRoomService     TemplateType = "room_service_alert"
	TemplateReservation     TemplateType = "reservation_reminder"
	TemplateFestivalOffer   TemplateType = "festival_offer"
	TemplateNewMenuLaunch   TemplateType = "new_menu_launch"
)

// MessageLog tracks all outbound and inbound message activity per tenant.
type MessageLog struct {
	ID           bson.ObjectID `bson:"_id,omitempty" json:"id"`
	TenantID     bson.ObjectID `bson:"tenantId" json:"tenantId"`
	Recipient    string        `bson:"recipient" json:"recipient"`
	CustomerName string        `bson:"customerName" json:"customerName"`
	Template     TemplateType  `bson:"template" json:"template"`
	Body         string        `bson:"body" json:"body"`
	Status       MessageStatus `bson:"status" json:"status"`
	ExternalID   string        `bson:"externalId,omitempty" json:"externalId,omitempty"`
	Location     string        `bson:"location,omitempty" json:"location,omitempty"`
	CreatedAt    time.Time     `bson:"createdAt" json:"createdAt"`
	DeliveredAt  *time.Time    `bson:"deliveredAt,omitempty" json:"deliveredAt,omitempty"`
	ReadAt       *time.Time    `bson:"readAt,omitempty" json:"readAt,omitempty"`
}

// ── Official Meta WhatsApp Cloud API Webhook Payloads ─────────────────────────

type MetaWebhookPayload struct {
	Object string      `json:"object"`
	Entry  []MetaEntry `json:"entry"`
}

type MetaEntry struct {
	ID      string       `json:"id"`
	Changes []MetaChange `json:"changes"`
}

type MetaChange struct {
	Value MetaValue `json:"value"`
	Field string    `json:"field"`
}

type MetaValue struct {
	MessagingProduct string            `json:"messaging_product"`
	Metadata         MetaMetadata      `json:"metadata"`
	Contacts         []MetaContact     `json:"contacts,omitempty"`
	Messages         []MetaMessage     `json:"messages,omitempty"`
	Statuses         []MetaStatusEvent `json:"statuses,omitempty"`
}

type MetaMetadata struct {
	DisplayPhoneNumber string `json:"display_phone_number"`
	PhoneNumberID      string `json:"phone_number_id"`
}

type MetaContact struct {
	Profile struct {
		Name string `json:"name"`
	} `json:"profile"`
	WaID string `json:"wa_id"`
}

type MetaMessage struct {
	From        string           `json:"from"`
	ID          string           `json:"id"`
	Timestamp   string           `json:"timestamp"`
	Type        string           `json:"type"`
	Text        *MetaText        `json:"text,omitempty"`
	Interactive *MetaInteractive `json:"interactive,omitempty"`
}

type MetaText struct {
	Body string `json:"body"`
}

type MetaInteractive struct {
	Type        string `json:"type"`
	ButtonReply *struct {
		ID    string `json:"id"`
		Title string `json:"title"`
	} `json:"button_reply,omitempty"`
	ListReply *struct {
		ID          string `json:"id"`
		Title       string `json:"title"`
		Description string `json:"description"`
	} `json:"list_reply,omitempty"`
}

type MetaStatusEvent struct {
	ID          string `json:"id"`
	Status      string `json:"status"` // sent, delivered, read, failed
	Timestamp   string `json:"timestamp"`
	RecipientID string `json:"recipient_id"`
}

// ── Campaign & Marketing Models ──────────────────────────────────────────────

type CampaignStatus string

const (
	CampaignStatusDraft     CampaignStatus = "draft"
	CampaignStatusScheduled CampaignStatus = "scheduled"
	CampaignStatusSending   CampaignStatus = "sending"
	CampaignStatusSent      CampaignStatus = "sent"
	CampaignStatusFailed    CampaignStatus = "failed"
)

type CampaignType string

const (
	CampaignTypeText    CampaignType = "text"
	CampaignTypeImage   CampaignType = "image"
	CampaignTypePDF     CampaignType = "pdf"
	CampaignTypeCoupon  CampaignType = "coupon"
	CampaignTypeInvoice CampaignType = "invoice"
)

type TargetSegment string

const (
	SegmentAll        TargetSegment = "all"
	SegmentFirstTime  TargetSegment = "first_time"
	SegmentRepeat     TargetSegment = "repeat"
	SegmentVIP        TargetSegment = "vip"
	SegmentHotelGuest TargetSegment = "hotel_guests"
	SegmentInactive   TargetSegment = "inactive"
)

type CampaignStats struct {
	TotalRecipients int `bson:"totalRecipients" json:"totalRecipients"`
	SentCount       int `bson:"sentCount" json:"sentCount"`
	DeliveredCount  int `bson:"deliveredCount" json:"deliveredCount"`
	ReadCount       int `bson:"readCount" json:"readCount"`
	FailedCount     int `bson:"failedCount" json:"failedCount"`
}

type Campaign struct {
	ID            bson.ObjectID  `bson:"_id,omitempty" json:"id"`
	TenantID      bson.ObjectID  `bson:"tenantId" json:"tenantId"`
	Name          string         `bson:"name" json:"name"`
	Type          CampaignType   `bson:"type" json:"type"`
	TargetSegment TargetSegment  `bson:"targetSegment" json:"targetSegment"`
	TemplateID    string         `bson:"templateId,omitempty" json:"templateId,omitempty"`
	MessageBody   string         `bson:"messageBody" json:"messageBody"`
	MediaURL      string         `bson:"mediaUrl,omitempty" json:"mediaUrl,omitempty"`
	CouponCode    string         `bson:"couponCode,omitempty" json:"couponCode,omitempty"`
	DiscountPct   float64        `bson:"discountPct,omitempty" json:"discountPct,omitempty"`
	Status        CampaignStatus `bson:"status" json:"status"`
	ScheduledAt   *time.Time     `bson:"scheduledAt,omitempty" json:"scheduledAt,omitempty"`
	SentAt        *time.Time     `bson:"sentAt,omitempty" json:"sentAt,omitempty"`
	Stats         CampaignStats  `bson:"stats" json:"stats"`
	CreatedAt     time.Time      `bson:"createdAt" json:"createdAt"`
	UpdatedAt     time.Time      `bson:"updatedAt" json:"updatedAt"`
}

// ── Real-Time Chatbot Session Models ─────────────────────────────────────────

type ChatbotState string

const (
	ChatStateIdle        ChatbotState = "idle"
	ChatStateMenu        ChatbotState = "menu"
	ChatStateOrderStatus ChatbotState = "order_status"
	ChatStateRoomService ChatbotState = "room_service"
	ChatStateFeedback    ChatbotState = "feedback"
	ChatStateEscalated   ChatbotState = "escalated"
)

type ChatbotSession struct {
	ID               bson.ObjectID `bson:"_id,omitempty" json:"id"`
	TenantID         bson.ObjectID `bson:"tenantId" json:"tenantId"`
	CustomerPhone    string        `bson:"customerPhone" json:"customerPhone"`
	CustomerName     string        `bson:"customerName" json:"customerName"`
	State            ChatbotState  `bson:"state" json:"state"`
	ActiveOrderID    string        `bson:"activeOrderId,omitempty" json:"activeOrderId,omitempty"`
	RoomNumber       string        `bson:"roomNumber,omitempty" json:"roomNumber,omitempty"`
	EscalatedToStaff bool          `bson:"escalatedToStaff" json:"escalatedToStaff"`
	EscalationReason string        `bson:"escalationReason,omitempty" json:"escalationReason,omitempty"`
	LastMessageAt    time.Time     `bson:"lastMessageAt" json:"lastMessageAt"`
	CreatedAt        time.Time     `bson:"createdAt" json:"createdAt"`
	UpdatedAt        time.Time     `bson:"updatedAt" json:"updatedAt"`
}

// ── Customer GST Invoicing Models ─────────────────────────────────────────────

type CustomerInvoiceItem struct {
	Name      string  `bson:"name" json:"name"`
	Quantity  int     `bson:"quantity" json:"quantity"`
	UnitPrice float64 `bson:"unitPrice" json:"unitPrice"`
	Total     float64 `bson:"total" json:"total"`
}

type CustomerInvoice struct {
	ID                     bson.ObjectID         `bson:"_id,omitempty" json:"id"`
	TenantID               bson.ObjectID         `bson:"tenantId" json:"tenantId"`
	InvoiceNumber          string                `bson:"invoiceNumber" json:"invoiceNumber"`
	OrderID                *bson.ObjectID        `bson:"orderId,omitempty" json:"orderId,omitempty"`
	OrderNumber            string                `bson:"orderNumber" json:"orderNumber"`
	RestaurantName         string                `bson:"restaurantName" json:"restaurantName"`
	GSTIN                  string                `bson:"gstin" json:"gstin"`
	Address                string                `bson:"address,omitempty" json:"address,omitempty"`
	Phone                  string                `bson:"phone,omitempty" json:"phone,omitempty"`
	CustomerName           string                `bson:"customerName" json:"customerName"`
	CustomerPhone          string                `bson:"customerPhone" json:"customerPhone"`
	Location               string                `bson:"location" json:"location"` // Table 14 or Suite 302
	Date                   time.Time             `bson:"date" json:"date"`
	Items                  []CustomerInvoiceItem `bson:"items" json:"items"`
	Subtotal               float64               `bson:"subtotal" json:"subtotal"`
	CGST                   float64               `bson:"cgst" json:"cgst"`         // 2.5%
	SGST                   float64               `bson:"sgst" json:"sgst"`         // 2.5%
	TaxTotal               float64               `bson:"taxTotal" json:"taxTotal"` // 5.0%
	RoomServiceFee         float64               `bson:"roomServiceFee,omitempty" json:"roomServiceFee,omitempty"`
	GrandTotal             float64               `bson:"grandTotal" json:"grandTotal"`
	PaymentStatus          string                `bson:"paymentStatus" json:"paymentStatus"` // "paid", "pending"
	WhatsAppDeliveryStatus MessageStatus         `bson:"whatsappDeliveryStatus" json:"whatsappDeliveryStatus"`
	CreatedAt              time.Time             `bson:"createdAt" json:"createdAt"`
	UpdatedAt              time.Time             `bson:"updatedAt" json:"updatedAt"`
}

// CalculateGST calculates 5% GST split into CGST (2.5%) and SGST (2.5%).
func CalculateGST(subtotal float64) (cgst float64, sgst float64, totalTax float64) {
	cgst = math.Round(subtotal*0.025*100) / 100
	sgst = math.Round(subtotal*0.025*100) / 100
	totalTax = cgst + sgst
	return
}

// ── WhatsApp Connection Config Model ──────────────────────────────────────────

type WhatsAppConfig struct {
	ID            bson.ObjectID `bson:"_id,omitempty" json:"id"`
	TenantID      bson.ObjectID `bson:"tenantId" json:"tenantId"`
	PhoneNumber   string        `bson:"phoneNumber" json:"phoneNumber"`
	PhoneNumberID string        `bson:"phoneNumberId" json:"phoneNumberId"`
	WABAAccountID string        `bson:"wabaAccountId" json:"wabaAccountId"`
	AccessToken   string        `bson:"accessToken,omitempty" json:"accessToken,omitempty"`
	VerifyToken   string        `bson:"verifyToken" json:"verifyToken"`
	WebhookURL    string        `bson:"webhookUrl" json:"webhookUrl"`
	Connected     bool          `bson:"connected" json:"connected"`
	TierLimit     string        `bson:"tierLimit" json:"tierLimit"`
	QualityRating string        `bson:"qualityRating" json:"qualityRating"`
	UpdatedAt     time.Time     `bson:"updatedAt" json:"updatedAt"`
}

// ── Message Templates Registry ───────────────────────────────────────────────

type TemplateVariable struct {
	Key   string `json:"key"`
	Label string `json:"label"`
}

type TemplateDefinition struct {
	ID        string             `json:"id"`
	Name      string             `json:"name"`
	Category  string             `json:"category"`
	Body      string             `json:"body"`
	Variables []TemplateVariable `json:"variables"`
	Status    string             `json:"status"` // "APPROVED", "PENDING"
}

func GetStandardTemplates() []TemplateDefinition {
	return []TemplateDefinition{
		{
			ID:       string(TemplateOrderConfirmed),
			Name:     "Order Confirmed",
			Category: "TRANSACTIONAL",
			Body:     "Hello {{customer_name}}! ✨ Your order #{{order_number}} at {{restaurant_name}} ({{location}}) has been confirmed and is being freshly prepared.\n\n📋 Total: {{total_amount}}\n📍 Live Kitchen Tracker: {{tracking_url}}\n\nReply STOP to opt-out.",
			Variables: []TemplateVariable{
				{Key: "customer_name", Label: "Customer Name"},
				{Key: "order_number", Label: "Order Number"},
				{Key: "restaurant_name", Label: "Restaurant Name"},
				{Key: "location", Label: "Table / Room"},
				{Key: "total_amount", Label: "Total Amount"},
				{Key: "tracking_url", Label: "Tracker URL"},
			},
			Status: "APPROVED",
		},
		{
			ID:       string(TemplateKitchenReady),
			Name:     "Kitchen Ready",
			Category: "UTILITY",
			Body:     "🔔 Chef's update for {{customer_name}}: Your freshly prepared courses at {{restaurant_name}} are ready and on their way to {{location}}! Bon appétit.\n\nReply STOP to unsubscribe.",
			Variables: []TemplateVariable{
				{Key: "customer_name", Label: "Customer Name"},
				{Key: "restaurant_name", Label: "Restaurant Name"},
				{Key: "location", Label: "Table / Room"},
			},
			Status: "APPROVED",
		},
		{
			ID:       string(TemplateTaxInvoice),
			Name:     "Tax Invoice Delivery",
			Category: "TRANSACTIONAL",
			Body:     "Dear {{customer_name}}, thank you for dining at {{restaurant_name}}! 🧾 Your digital GST Tax Invoice #{{invoice_number}} for {{total_amount}} is ready.\n\n📄 Download Receipt: {{invoice_url}}\n\nWe look forward to welcoming you back!",
			Variables: []TemplateVariable{
				{Key: "customer_name", Label: "Customer Name"},
				{Key: "restaurant_name", Label: "Restaurant Name"},
				{Key: "invoice_number", Label: "Invoice Number"},
				{Key: "total_amount", Label: "Total Amount"},
				{Key: "invoice_url", Label: "Invoice URL"},
			},
			Status: "APPROVED",
		},
		{
			ID:       string(TemplateFeedbackRequest),
			Name:     "Feedback & Review",
			Category: "MARKETING",
			Body:     "Thank you for visiting {{restaurant_name}} today, {{customer_name}}! ⭐\n\nHow was your culinary experience? Reply with a number from 1 (Poor) to 5 (Exceptional) to share your feedback.\n\nReply STOP to opt-out.",
			Variables: []TemplateVariable{
				{Key: "customer_name", Label: "Customer Name"},
				{Key: "restaurant_name", Label: "Restaurant Name"},
			},
			Status: "APPROVED",
		},
		{
			ID:       string(TemplateRoomService),
			Name:     "Room Service Dispatch",
			Category: "UTILITY",
			Body:     "🛎️ In-Room Dining Update: Your room service request for {{location}} at {{restaurant_name}} has been received and steward dispatch is in progress.",
			Variables: []TemplateVariable{
				{Key: "restaurant_name", Label: "Restaurant Name"},
				{Key: "location", Label: "Room Number"},
			},
			Status: "APPROVED",
		},
		{
			ID:       string(TemplateFestivalOffer),
			Name:     "Special Privilege Offer",
			Category: "MARKETING",
			Body:     "Exclusive perk for you, {{customer_name}}! 🎁 Enjoy {{discount_pct}}% off your next dining experience at {{restaurant_name}} with promo code {{coupon_code}}.\n\nValid until {{expiry_date}}. Table reservations: {{booking_url}}\n\nReply STOP to unsubscribe.",
			Variables: []TemplateVariable{
				{Key: "customer_name", Label: "Customer Name"},
				{Key: "discount_pct", Label: "Discount Percentage"},
				{Key: "restaurant_name", Label: "Restaurant Name"},
				{Key: "coupon_code", Label: "Coupon Code"},
				{Key: "expiry_date", Label: "Expiry Date"},
				{Key: "booking_url", Label: "Booking Link"},
			},
			Status: "APPROVED",
		},
	}
}

func InterpolateTemplate(templateBody string, vars map[string]string) string {
	res := templateBody
	for k, v := range vars {
		res = strings.ReplaceAll(res, "{{"+k+"}}", v)
	}
	return res
}

// ── Legacy Helpers Preserved for Backward Compatibility ───────────────────────

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

func BuildKitchenReadyMessage(customerName, restaurantName, locationName string) string {
	return fmt.Sprintf(
		"🔔 Chef's update for %s: Your freshly prepared courses at %s are ready and on their way to %s! Enjoy your meal.\n\nReply STOP to unsubscribe.",
		customerName,
		restaurantName,
		locationName,
	)
}

func BuildFeedbackRequestMessage(customerName, restaurantName string) string {
	return fmt.Sprintf(
		"Thank you for dining at %s today, %s! ⭐\n\n"+
			"How was your culinary experience? Reply with a number from 1 (Poor) to 5 (Exceptional) to share your feedback.\n\n"+
			"Reply STOP to opt-out.",
		restaurantName,
		customerName,
	)
}

func IsOptOutKeyword(text string) bool {
	clean := strings.TrimSpace(strings.ToUpper(text))
	switch clean {
	case "STOP", "UNSUBSCRIBE", "CANCEL", "OPT OUT", "OPTOUT", "QUIT":
		return true
	default:
		return false
	}
}

func ParseRating(text string) (int, bool) {
	clean := strings.TrimSpace(text)
	if len(clean) == 1 {
		val, err := strconv.Atoi(clean)
		if err == nil && val >= 1 && val <= 5 {
			return val, true
		}
	}
	starCount := strings.Count(text, "⭐") + strings.Count(text, "★")
	if starCount >= 1 && starCount <= 5 {
		return starCount, true
	}

	return 0, false
}

// ── Workforce Assistant Models & Constants ───────────────────────────────────

type WorkforceState string

const (
	WFStateIdle                WorkforceState = "idle"
	WFStateAwaitingLeaveDates  WorkforceState = "awaiting_leave_dates"
	WFStateAwaitingLeaveReason WorkforceState = "awaiting_leave_reason"
	WFStateAwaitingLateReason  WorkforceState = "awaiting_late_reason"
)

const (
	BtnWFCheckIn      = "wf_checkin"
	BtnWFCheckOut     = "wf_checkout"
	BtnWFBreak        = "wf_break"
	BtnWFLeave        = "wf_leave"
	BtnWFLeaveBalance = "wf_leave_balance"
	BtnWFAttendance   = "wf_attendance"
	BtnWFShift        = "wf_shift"
	BtnWFPayslip      = "wf_payslip"
	BtnWFTasks        = "wf_tasks"
	BtnWFHelp         = "wf_help"
	BtnWFMainMenu     = "wf_main_menu"
)

type WorkforceSession struct {
	ID              bson.ObjectID  `bson:"_id,omitempty" json:"id"`
	TenantID        bson.ObjectID  `bson:"tenantId" json:"tenantId"`
	UserID          bson.ObjectID  `bson:"userId" json:"userId"`
	EmployeeID      string         `bson:"employeeId" json:"employeeId"`
	Phone           string         `bson:"phone" json:"phone"`
	State           WorkforceState `bson:"state" json:"state"`
	DraftLeaveType  string         `bson:"draftLeaveType,omitempty" json:"draftLeaveType,omitempty"`
	DraftLeaveStart string         `bson:"draftLeaveStart,omitempty" json:"draftLeaveStart,omitempty"`
	DraftLeaveEnd   string         `bson:"draftLeaveEnd,omitempty" json:"draftLeaveEnd,omitempty"`
	LastMessageAt   time.Time      `bson:"lastMessageAt" json:"lastMessageAt"`
	CreatedAt       time.Time      `bson:"createdAt" json:"createdAt"`
	UpdatedAt       time.Time      `bson:"updatedAt" json:"updatedAt"`
}

// NormalizePhoneNumber normalizes phone strings into standard digits for deterministic employee matching.
// Handles +91, 91, leading 0, dashes, spaces, and brackets.
func NormalizePhoneNumber(phone string) string {
	var sb strings.Builder
	for _, ch := range phone {
		if ch >= '0' && ch <= '9' {
			sb.WriteRune(ch)
		}
	}
	digits := sb.String()

	// If 12 digits starting with 91 (e.g. 919876543210), strip 91
	if len(digits) == 12 && strings.HasPrefix(digits, "91") {
		return digits[2:]
	}
	// If 11 digits starting with 0 (e.g. 09876543210), strip 0
	if len(digits) == 11 && strings.HasPrefix(digits, "0") {
		return digits[1:]
	}

	return digits
}

// ── Outbound Meta Interactive Payloads ────────────────────────────────────────

type InteractiveButton struct {
	Type  string `json:"type"` // "reply"
	Reply struct {
		ID    string `json:"id"`
		Title string `json:"title"`
	} `json:"reply"`
}

type InteractiveRow struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description,omitempty"`
}

type InteractiveSection struct {
	Title string           `json:"title"`
	Rows  []InteractiveRow `json:"rows"`
}

type OutboundInteractivePayload struct {
	MessagingProduct string `json:"messaging_product"`
	RecipientType    string `json:"recipient_type"`
	To               string `json:"to"`
	Type             string `json:"type"` // "interactive"
	Interactive      struct {
		Type   string `json:"type"` // "button" or "list"
		Header *struct {
			Type string `json:"type"` // "text"
			Text string `json:"text"`
		} `json:"header,omitempty"`
		Body struct {
			Text string `json:"text"`
		} `json:"body"`
		Footer *struct {
			Text string `json:"text"`
		} `json:"footer,omitempty"`
		Action struct {
			Button   string               `json:"button,omitempty"` // For list: e.g. "Select Option"
			Buttons  []InteractiveButton  `json:"buttons,omitempty"`
			Sections []InteractiveSection `json:"sections,omitempty"`
		} `json:"action"`
	} `json:"interactive"`
}

type WorkforceCheckInInput struct {
	Token      string  `json:"token" binding:"required"`
	Latitude   float64 `json:"latitude"`
	Longitude  float64 `json:"longitude"`
	Accuracy   float64 `json:"accuracy"`
	DeviceInfo string  `json:"deviceInfo"`
}

type WorkforceCheckInResult struct {
	Success        bool    `json:"success"`
	Action         string  `json:"action"` // "clock_in" or "clock_out"
	Status         string  `json:"status"` // "present", "late", etc.
	EmployeeName   string  `json:"employeeName"`
	EmployeeID     string  `json:"employeeId"`
	DistanceMeters float64 `json:"distanceMeters"`
	AllowedRadius  float64 `json:"allowedRadius"`
	WithinGeofence bool    `json:"withinGeofence"`
	Timestamp      string  `json:"timestamp"`
	Message        string  `json:"message"`
}

type WorkforceTokenVerifyResult struct {
	Valid         bool    `json:"valid"`
	EmployeeName  string  `json:"employeeName"`
	EmployeeID    string  `json:"employeeId"`
	Action        string  `json:"action"`
	WorkplaceName string  `json:"workplaceName"`
	WorkplaceLat  float64 `json:"workplaceLat"`
	WorkplaceLng  float64 `json:"workplaceLng"`
	RadiusMeters  float64 `json:"radiusMeters"`
	ExpiresInSecs int64   `json:"expiresInSecs"`
	Error         string  `json:"error,omitempty"`
}


