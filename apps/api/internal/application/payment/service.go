package payment

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"strings"
	"time"

	domainnotification "github.com/dineflow/api/internal/domain/notification"
	domainorder "github.com/dineflow/api/internal/domain/order"
	domainpayment "github.com/dineflow/api/internal/domain/payment"
	domaintable "github.com/dineflow/api/internal/domain/table"
	domaintenant "github.com/dineflow/api/internal/domain/tenant"
	mongoinfra "github.com/dineflow/api/internal/infrastructure/mongodb"
	"github.com/dineflow/api/internal/infrastructure/realtime"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type notifServiceIface interface {
	CreateNotification(ctx context.Context, input struct {
		TenantID  bson.ObjectID
		UserID    *bson.ObjectID
		Category  domainnotification.Category
		Title     string
		Message   string
		Priority  domainnotification.Priority
		ActionURL string
		Metadata  map[string]interface{}
		ExpiresAt *time.Time
	}) (*domainnotification.Notification, error)
}

type Service struct {
	db           *mongoinfra.Client
	hub          *realtime.Hub
	notifService notifServiceIface
}

func NewService(db *mongoinfra.Client, hub *realtime.Hub) *Service {
	return &Service{
		db:  db,
		hub: hub,
	}
}

func (s *Service) SetNotificationService(ns notifServiceIface) {
	s.notifService = ns
}

// CreateSession generates a dynamic UPI payment session and NPCI intent URI.
func (s *Service) CreateSession(ctx context.Context, req domainpayment.CreatePaymentSessionRequest) (*domainpayment.CreatePaymentSessionResponse, error) {
	orderIDStr := strings.TrimSpace(req.OrderID)
	if orderIDStr == "" {
		return nil, errors.New("orderId is required")
	}

	orderColl := s.db.Collection("orders")
	var ord domainorder.Order
	var findErr error

	if oid, err := bson.ObjectIDFromHex(orderIDStr); err == nil {
		findErr = orderColl.FindOne(ctx, bson.M{"_id": oid}).Decode(&ord)
	}
	if findErr != nil || ord.ID.IsZero() {
		withHash := orderIDStr
		if !strings.HasPrefix(withHash, "#") {
			withHash = "#" + withHash
		}
		withoutHash := strings.TrimPrefix(orderIDStr, "#")
		findErr = orderColl.FindOne(ctx, bson.M{
			"$or": []bson.M{
				{"orderNumber": orderIDStr},
				{"orderNumber": withHash},
				{"orderNumber": withoutHash},
			},
		}).Decode(&ord)
	}

	var tenantID bson.ObjectID
	amount := req.Amount

	if findErr == nil && !ord.ID.IsZero() {
		tenantID = ord.TenantID
		if amount <= 0 {
			if ord.TotalAmount > 0 {
				amount = ord.TotalAmount
			} else {
				amount = ord.Total
			}
		}
	} else if strings.TrimSpace(req.TenantSlug) != "" {
		var t domaintenant.Tenant
		tErr := s.db.Collection("tenants").FindOne(ctx, bson.M{"slug": strings.ToLower(strings.TrimSpace(req.TenantSlug))}).Decode(&t)
		if tErr == nil && !t.ID.IsZero() {
			tenantID = t.ID
		}
	}

	if amount <= 0 {
		return nil, errors.New("invalid payment amount, must be greater than zero")
	}

	// Fetch tenant payment config
	var config domainpayment.TenantPaymentConfig
	if !tenantID.IsZero() {
		_ = s.db.Collection("tenant_payment_configs").FindOne(ctx, bson.M{"tenantId": tenantID}).Decode(&config)
	}

	vpa := strings.TrimSpace(config.UPIVPA)
	merchantName := strings.TrimSpace(config.MerchantName)
	if vpa == "" {
		// Fallback to demo/platform VPA if tenant hasn't configured custom VPA yet
		vpa = "dineflow@icici"
	}
	if merchantName == "" {
		if !tenantID.IsZero() {
			var t domaintenant.Tenant
			if s.db.Collection("tenants").FindOne(ctx, bson.M{"_id": tenantID}).Decode(&t) == nil && t.Name != "" {
				merchantName = t.Name
			} else {
				merchantName = "DineFlow Restaurant"
			}
		} else {
			merchantName = "DineFlow Restaurant"
		}
	}

	amountFormatted := fmt.Sprintf("%.2f", amount)
	amountPaise := int64(amount * 100)

	// Build NPCI compliant UPI Intent URI
	// upi://pay?pa={vpa}&pn={merchantName}&am={amount}&tr={orderId}&tn={note}&cu=INR
	note := fmt.Sprintf("Order %s", ord.OrderNumber)
	if strings.TrimSpace(ord.OrderNumber) == "" {
		note = fmt.Sprintf("Order %s", orderIDStr)
	}

	upiURI := fmt.Sprintf(
		"upi://pay?pa=%s&pn=%s&am=%s&tr=%s&tn=%s&cu=INR",
		url.QueryEscape(vpa),
		url.QueryEscape(merchantName),
		amountFormatted,
		url.QueryEscape(orderIDStr),
		url.QueryEscape(note),
	)

	now := time.Now().UTC()
	tx := domainpayment.PaymentTransaction{
		ID:          bson.NewObjectID(),
		TenantID:    tenantID,
		OrderID:     orderIDStr,
		Amount:      amount,
		AmountPaise: amountPaise,
		Currency:    "INR",
		Provider:    domainpayment.ProviderYoupi,
		VPA:         vpa,
		Status:      domainpayment.StatusInitiated,
		CreatedAt:   now,
	}

	_, _ = s.db.Collection("payment_transactions").InsertOne(ctx, tx)

	return &domainpayment.CreatePaymentSessionResponse{
		OrderID:       orderIDStr,
		Amount:        amount,
		VPA:           vpa,
		MerchantName:  merchantName,
		UPIIntentURI:  upiURI,
		DynamicQRData: upiURI,
		GatewayURL:    config.YoupiGatewayURL,
		SessionID:     tx.ID.Hex(),
	}, nil
}

// HandleYoupiWebhook verifies inbound HMAC signature and marks order & payment as paid.
func (s *Service) HandleYoupiWebhook(ctx context.Context, rawPayload []byte, signature string) error {
	var payload domainpayment.YoupiWebhookPayload
	if err := json.Unmarshal(rawPayload, &payload); err != nil {
		return fmt.Errorf("invalid json payload: %w", err)
	}

	orderIDStr := strings.TrimSpace(payload.OrderID)
	if orderIDStr == "" {
		return errors.New("missing orderId in webhook payload")
	}

	// Find order
	orderColl := s.db.Collection("orders")
	var ord domainorder.Order
	var findErr error

	if oid, err := bson.ObjectIDFromHex(orderIDStr); err == nil {
		findErr = orderColl.FindOne(ctx, bson.M{"_id": oid}).Decode(&ord)
	}
	if findErr != nil || ord.ID.IsZero() {
		withHash := orderIDStr
		if !strings.HasPrefix(withHash, "#") {
			withHash = "#" + withHash
		}
		withoutHash := strings.TrimPrefix(orderIDStr, "#")
		findErr = orderColl.FindOne(ctx, bson.M{
			"$or": []bson.M{
				{"orderNumber": orderIDStr},
				{"orderNumber": withHash},
				{"orderNumber": withoutHash},
			},
		}).Decode(&ord)
	}

	if findErr != nil || ord.ID.IsZero() {
		return errors.New("order not found for webhook settlement")
	}

	// Fetch tenant payment config to verify signature if secret configured
	var config domainpayment.TenantPaymentConfig
	_ = s.db.Collection("tenant_payment_configs").FindOne(ctx, bson.M{"tenantId": ord.TenantID}).Decode(&config)

	if strings.TrimSpace(config.YoupiWebhookSecret) != "" {
		mac := hmac.New(sha256.New, []byte(strings.TrimSpace(config.YoupiWebhookSecret)))
		mac.Write(rawPayload)
		expectedSig := hex.EncodeToString(mac.Sum(nil))

		cleanSig := strings.TrimSpace(signature)
		if strings.HasPrefix(cleanSig, "sha256=") {
			cleanSig = strings.TrimPrefix(cleanSig, "sha256=")
		}

		if !hmac.Equal([]byte(expectedSig), []byte(cleanSig)) {
			return errors.New("webhook signature verification failed")
		}
	}

	now := time.Now().UTC()
	var rawMap map[string]interface{}
	_ = json.Unmarshal(rawPayload, &rawMap)

	// Update Payment Transaction record
	_, _ = s.db.Collection("payment_transactions").UpdateOne(ctx,
		bson.M{"orderId": orderIDStr},
		bson.M{
			"$set": bson.M{
				"status":     domainpayment.StatusPaid,
				"utr":        payload.UTR,
				"settledAt":  now,
				"rawPayload": rawMap,
			},
		},
		options.UpdateOne().SetUpsert(true),
	)

	// Transition Order to Paid
	_ = ord.TransitionTo(domainorder.StatusPaid, fmt.Sprintf("Settled via YouPI 0%% UPI (UTR: %s)", payload.UTR))
	ord.PaymentUTR = payload.UTR
	ord.BillingMethod = "UPI"
	ord.SettledAt = &now

	setFields := bson.M{
		"status":        domainorder.StatusPaid,
		"paymentStatus": domainorder.PaymentPaid,
		"paymentUtr":    payload.UTR,
		"billingMethod": "UPI",
		"settledAt":     now,
		"timeline":      ord.Timeline,
		"updatedAt":     now,
	}

	_, updateErr := orderColl.UpdateOne(ctx, bson.M{"_id": ord.ID}, bson.M{"$set": setFields})
	if updateErr != nil {
		return fmt.Errorf("failed to update order: %w", updateErr)
	}

	// Auto-release table if dine-in
	if ord.TableID != nil && !ord.TableID.IsZero() {
		_, _ = s.db.Collection("tables").UpdateOne(ctx,
			bson.M{"_id": *ord.TableID, "tenantId": ord.TenantID},
			bson.M{"$set": bson.M{
				"status":        domaintable.StatusAvailable,
				"activeOrderId": nil,
				"updatedAt":     now,
			}},
		)
	}

	// Broadcast SSE bump to active POS/KDS screens
	if s.hub != nil {
		s.hub.Broadcast(&realtime.OrderEvent{
			TenantID:  ord.TenantID.Hex(),
			EventType: realtime.EventOrderBumped,
			Order:     &ord,
		})
	}

	return nil
}

// GetPaymentStatus checks real-time status of payment for a given order.
func (s *Service) GetPaymentStatus(ctx context.Context, orderID string) (*domainpayment.PaymentTransaction, error) {
	cleanID := strings.TrimSpace(orderID)
	if cleanID == "" {
		return nil, errors.New("orderId is required")
	}

	var tx domainpayment.PaymentTransaction
	err := s.db.Collection("payment_transactions").FindOne(ctx, bson.M{"orderId": cleanID}).Decode(&tx)
	if err == nil {
		return &tx, nil
	}

	// If not found in payment_transactions, check orders collection directly
	orderColl := s.db.Collection("orders")
	var ord domainorder.Order
	var findErr error

	if oid, oErr := bson.ObjectIDFromHex(cleanID); oErr == nil {
		findErr = orderColl.FindOne(ctx, bson.M{"_id": oid}).Decode(&ord)
	}
	if findErr != nil || ord.ID.IsZero() {
		findErr = orderColl.FindOne(ctx, bson.M{"orderNumber": cleanID}).Decode(&ord)
	}

	if findErr == nil && !ord.ID.IsZero() {
		if ord.PaymentStatus == domainorder.PaymentPaid || ord.Status == domainorder.StatusPaid {
			return &domainpayment.PaymentTransaction{
				OrderID:   cleanID,
				TenantID:  ord.TenantID,
				Amount:    ord.TotalAmount,
				Status:    domainpayment.StatusPaid,
				UTR:       ord.PaymentUTR,
				SettledAt: ord.SettledAt,
			}, nil
		}
		return &domainpayment.PaymentTransaction{
			OrderID:  cleanID,
			TenantID: ord.TenantID,
			Amount:   ord.TotalAmount,
			Status:   domainpayment.StatusPending,
		}, nil
	}

	return nil, errors.New("payment session or order not found")
}

// VerifyManualUTR allows waiter or customer to enter the 12-digit bank UTR for instant verification.
func (s *Service) VerifyManualUTR(ctx context.Context, orderID string, utr string) error {
	cleanID := strings.TrimSpace(orderID)
	cleanUTR := strings.TrimSpace(utr)

	if cleanID == "" {
		return errors.New("orderId is required")
	}
	if len(cleanUTR) < 6 {
		return errors.New("invalid UTR, must be at least 6 characters")
	}

	orderColl := s.db.Collection("orders")
	var ord domainorder.Order
	var findErr error

	if oid, err := bson.ObjectIDFromHex(cleanID); err == nil {
		findErr = orderColl.FindOne(ctx, bson.M{"_id": oid}).Decode(&ord)
	}
	if findErr != nil || ord.ID.IsZero() {
		findErr = orderColl.FindOne(ctx, bson.M{"orderNumber": cleanID}).Decode(&ord)
	}

	if findErr != nil || ord.ID.IsZero() {
		return errors.New("order not found")
	}

	now := time.Now().UTC()
	_ = ord.TransitionTo(domainorder.StatusPaid, fmt.Sprintf("Settled via Manual UPI UTR (%s)", cleanUTR))
	ord.PaymentUTR = cleanUTR
	ord.BillingMethod = "UPI"
	ord.SettledAt = &now

	setFields := bson.M{
		"status":        domainorder.StatusPaid,
		"paymentStatus": domainorder.PaymentPaid,
		"paymentUtr":    cleanUTR,
		"billingMethod": "UPI",
		"settledAt":     now,
		"timeline":      ord.Timeline,
		"updatedAt":     now,
	}

	if _, err := orderColl.UpdateOne(ctx, bson.M{"_id": ord.ID}, bson.M{"$set": setFields}); err != nil {
		return err
	}

	// Update or insert transaction
	_, _ = s.db.Collection("payment_transactions").UpdateOne(ctx,
		bson.M{"orderId": cleanID},
		bson.M{
			"$set": bson.M{
				"status":    domainpayment.StatusPaid,
				"utr":       cleanUTR,
				"provider":  domainpayment.ProviderManualUPI,
				"settledAt": now,
			},
		},
		options.UpdateOne().SetUpsert(true),
	)

	// Release table if dine-in
	if ord.TableID != nil && !ord.TableID.IsZero() {
		_, _ = s.db.Collection("tables").UpdateOne(ctx,
			bson.M{"_id": *ord.TableID, "tenantId": ord.TenantID},
			bson.M{"$set": bson.M{
				"status":        domaintable.StatusAvailable,
				"activeOrderId": nil,
				"updatedAt":     now,
			}},
		)
	}

	if s.hub != nil {
		s.hub.Broadcast(&realtime.OrderEvent{
			TenantID:  ord.TenantID.Hex(),
			EventType: realtime.EventOrderBumped,
			Order:     &ord,
		})
	}

	return nil
}

// GetTenantPaymentConfig fetches the merchant's 0% UPI gateway settings.
func (s *Service) GetTenantPaymentConfig(ctx context.Context, tenantID bson.ObjectID) (*domainpayment.TenantPaymentConfig, error) {
	if tenantID.IsZero() {
		return nil, errors.New("tenantId is required")
	}

	var cfg domainpayment.TenantPaymentConfig
	err := s.db.Collection("tenant_payment_configs").FindOne(ctx, bson.M{"tenantId": tenantID}).Decode(&cfg)
	if err != nil {
		// Return sensible defaults if not yet configured
		return &domainpayment.TenantPaymentConfig{
			TenantID:            tenantID,
			DefaultProvider:     domainpayment.ProviderYoupi,
			UPIVPA:              "dineflow@icici",
			MerchantName:        "DineFlow Restaurant",
			AutoSettleOnWebhook: true,
			ObserverStatus:      "offline",
		}, nil
	}

	return &cfg, nil
}

// UpdateTenantPaymentConfig updates or saves restaurant UPI credentials.
func (s *Service) UpdateTenantPaymentConfig(ctx context.Context, tenantID bson.ObjectID, cfg *domainpayment.TenantPaymentConfig) (*domainpayment.TenantPaymentConfig, error) {
	if tenantID.IsZero() {
		return nil, errors.New("tenantId is required")
	}
	cfg.TenantID = tenantID

	if err := cfg.Validate(); err != nil {
		return nil, err
	}

	now := time.Now().UTC()
	cfg.UpdatedAt = now

	_, err := s.db.Collection("tenant_payment_configs").UpdateOne(ctx,
		bson.M{"tenantId": tenantID},
		bson.M{
			"$set": bson.M{
				"defaultProvider":     cfg.DefaultProvider,
				"upiVpa":              strings.TrimSpace(cfg.UPIVPA),
				"merchantName":        strings.TrimSpace(cfg.MerchantName),
				"youpiGatewayUrl":     strings.TrimSpace(cfg.YoupiGatewayURL),
				"youpiWebhookSecret":  strings.TrimSpace(cfg.YoupiWebhookSecret),
				"autoSettleOnWebhook": cfg.AutoSettleOnWebhook,
				"observerStatus":      cfg.ObserverStatus,
				"updatedAt":           now,
			},
			"$setOnInsert": bson.M{
				"createdAt": now,
			},
		},
		options.UpdateOne().SetUpsert(true),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to save payment config: %w", err)
	}

	return cfg, nil
}

// GetPublicPaymentConfig fetches the public UPI VPA and Merchant Name for an unauthenticated diner by tenant slug.
func (s *Service) GetPublicPaymentConfig(ctx context.Context, tenantSlug string) (*domainpayment.TenantPaymentConfig, error) {
	cleanSlug := strings.ToLower(strings.TrimSpace(tenantSlug))
	if cleanSlug == "" {
		return nil, errors.New("tenant slug is required")
	}

	var t domaintenant.Tenant
	err := s.db.Collection("tenants").FindOne(ctx, bson.M{"slug": cleanSlug}).Decode(&t)
	if err != nil || t.ID.IsZero() {
		// Return standard defaults if tenant not in DB yet
		return &domainpayment.TenantPaymentConfig{
			DefaultProvider:     domainpayment.ProviderYoupi,
			UPIVPA:              "dineflow@icici",
			MerchantName:        "DineFlow Restaurant",
			AutoSettleOnWebhook: true,
			ObserverStatus:      "offline",
		}, nil
	}

	var cfg domainpayment.TenantPaymentConfig
	cErr := s.db.Collection("tenant_payment_configs").FindOne(ctx, bson.M{"tenantId": t.ID}).Decode(&cfg)
	if cErr != nil || strings.TrimSpace(cfg.UPIVPA) == "" {
		merchantName := t.Name
		if strings.TrimSpace(merchantName) == "" {
			merchantName = "DineFlow Restaurant"
		}
		return &domainpayment.TenantPaymentConfig{
			TenantID:            t.ID,
			DefaultProvider:     domainpayment.ProviderYoupi,
			UPIVPA:              "dineflow@icici",
			MerchantName:        merchantName,
			AutoSettleOnWebhook: true,
			ObserverStatus:      "offline",
		}, nil
	}

	// Never leak private webhook secret in public endpoint
	cfg.YoupiWebhookSecret = ""
	return &cfg, nil
}

