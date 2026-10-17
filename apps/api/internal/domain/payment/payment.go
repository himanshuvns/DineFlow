package payment

import (
	"errors"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// PaymentStatus indicates the lifecycle of a payment transaction.
type PaymentStatus string

const (
	StatusPending   PaymentStatus = "pending"
	StatusInitiated PaymentStatus = "initiated"
	StatusPaid      PaymentStatus = "paid"
	StatusFailed    PaymentStatus = "failed"
	StatusExpired   PaymentStatus = "expired"
)

// PaymentProvider identifies the active payment rail.
type PaymentProvider string

const (
	ProviderYoupi     PaymentProvider = "youpi"
	ProviderManualUPI PaymentProvider = "manual_upi"
	ProviderRazorpay  PaymentProvider = "razorpay"
)

// PaymentTransaction represents an immutable or stateful record of an online or UPI payment attempt.
type PaymentTransaction struct {
	ID          bson.ObjectID          `bson:"_id,omitempty" json:"id"`
	TenantID    bson.ObjectID          `bson:"tenantId" json:"tenantId"`
	OrderID     string                 `bson:"orderId" json:"orderId"`
	Amount      float64                `bson:"amount" json:"amount"`
	AmountPaise int64                  `bson:"amountPaise" json:"amountPaise"`
	Currency    string                 `bson:"currency" json:"currency"`
	Provider    PaymentProvider        `bson:"provider" json:"provider"`
	VPA         string                 `bson:"vpa" json:"vpa"`
	UTR         string                 `bson:"utr,omitempty" json:"utr,omitempty"`
	Status      PaymentStatus          `bson:"status" json:"status"`
	RawPayload  map[string]interface{} `bson:"rawPayload,omitempty" json:"rawPayload,omitempty"`
	CreatedAt   time.Time              `bson:"createdAt" json:"createdAt"`
	SettledAt   *time.Time             `bson:"settledAt,omitempty" json:"settledAt,omitempty"`
}

// TenantPaymentConfig stores restaurant-specific payment configuration and UPI credentials.
type TenantPaymentConfig struct {
	ID                  bson.ObjectID   `bson:"_id,omitempty" json:"id"`
	TenantID            bson.ObjectID   `bson:"tenantId,omitempty" json:"tenantId,omitempty"`
	TenantSlug          string          `bson:"tenantSlug,omitempty" json:"tenantSlug,omitempty"`
	DefaultProvider     PaymentProvider `bson:"defaultProvider" json:"defaultProvider"`
	UPIVPA              string          `bson:"upiVpa" json:"upiVpa"`
	MerchantName        string          `bson:"merchantName" json:"merchantName"`
	YoupiGatewayURL     string          `bson:"youpiGatewayUrl,omitempty" json:"youpiGatewayUrl,omitempty"`
	YoupiWebhookSecret  string          `bson:"youpiWebhookSecret,omitempty" json:"youpiWebhookSecret,omitempty"`
	AutoSettleOnWebhook bool            `bson:"autoSettleOnWebhook" json:"autoSettleOnWebhook"`
	ObserverStatus      string          `bson:"observerStatus,omitempty" json:"observerStatus,omitempty"`
	CreatedAt           time.Time       `bson:"createdAt,omitempty" json:"createdAt,omitempty"`
	UpdatedAt           time.Time       `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
}

// Validate ensures payment settings satisfy basic format constraints.
func (c *TenantPaymentConfig) Validate() error {
	if c.TenantID.IsZero() && strings.TrimSpace(c.TenantSlug) == "" {
		return errors.New("tenantId or tenantSlug is required")
	}
	c.UPIVPA = strings.TrimSpace(c.UPIVPA)
	if c.UPIVPA == "" {
		return errors.New("UPI VPA is required (e.g. merchant@icici)")
	}
	if !strings.Contains(c.UPIVPA, "@") {
		return errors.New("invalid UPI VPA format, must contain @")
	}
	c.MerchantName = strings.TrimSpace(c.MerchantName)
	if c.MerchantName == "" {
		c.MerchantName = "DineFlow Restaurant"
	}
	return nil
}

// YoupiWebhookPayload represents the inbound webhook payload from YouPI / UPI observer.
type YoupiWebhookPayload struct {
	Event       string `json:"event"`
	OrderID     string `json:"orderId"`
	UTR         string `json:"utr"`
	Amount      string `json:"amount"`
	AmountPaise int64  `json:"amountPaise"`
	PaymentID   string `json:"paymentId"`
	Timestamp   int64  `json:"timestamp"`
}

// CreatePaymentSessionRequest is sent by customer QR view to initiate payment.
type CreatePaymentSessionRequest struct {
	TenantSlug    string  `json:"tenantSlug"`
	OrderID       string  `json:"orderId" binding:"required"`
	Amount        float64 `json:"amount"`
	CustomerName  string  `json:"customerName,omitempty"`
	CustomerPhone string  `json:"customerPhone,omitempty"`
}

// CreatePaymentSessionResponse contains UPI intent link and dynamic QR code data.
type CreatePaymentSessionResponse struct {
	OrderID       string  `json:"orderId"`
	Amount        float64 `json:"amount"`
	VPA           string  `json:"vpa"`
	MerchantName  string  `json:"merchantName"`
	UPIIntentURI  string  `json:"upiIntentUri"`
	DynamicQRData string  `json:"dynamicQrData"`
	GatewayURL    string  `json:"gatewayUrl"`
	SessionID     string  `json:"sessionId"`
}
