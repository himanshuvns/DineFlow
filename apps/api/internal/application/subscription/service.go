package subscription

import (
	"context"
	"errors"
	"fmt"
	"log"
	"math"
	"time"

	domainsub "github.com/dineflow/api/internal/domain/subscription"
	"github.com/dineflow/api/internal/domain/tenant"
	"github.com/dineflow/api/internal/domain/user"
	mongoinfra "github.com/dineflow/api/internal/infrastructure/mongodb"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// EmailSender defines the transactional email contract for billing & subscription notifications.
type EmailSender interface {
	SendTrialExpiryWarning(ctx context.Context, to, name, businessName string, daysRemaining int, upgradeLink string) error
	SendTrialExpired(ctx context.Context, to, name, businessName, upgradeLink string) error
	SendPlanUpgradeConfirmation(ctx context.Context, to, name, businessName, planTier, cycle string, price float64, renewalDate time.Time, invoiceNumber string) error
}

type Service struct {
	db       *mongoinfra.Client
	emailSvc EmailSender
}

func NewService(db *mongoinfra.Client) *Service {
	return &Service{db: db}
}

func (s *Service) SetEmailService(emailSvc EmailSender) {
	s.emailSvc = emailSvc
}

type UsageMetrics struct {
	Plan           domainsub.PlanTier           `json:"plan"`
	PlanName       string                       `json:"planName"`
	Cycle          domainsub.BillingCycle       `json:"cycle"`
	Status         domainsub.SubscriptionStatus `json:"status"`
	IsTrial        bool                         `json:"isTrial"`
	DaysRemaining  int                          `json:"daysRemaining"`
	TablesUsed     int                          `json:"tablesUsed"`
	TablesMax      int                          `json:"tablesMax"`
	MenuItemsUsed  int                          `json:"menuItemsUsed"`
	MenuItemsMax   int                          `json:"menuItemsMax"`
	StaffUsed      int                          `json:"staffUsed"`
	StaffMax       int                          `json:"staffMax"`
	HasHotelModule bool                         `json:"hasHotelModule"`
	RenewalDate    time.Time                    `json:"renewalDate"`
	GracePeriodEnd *time.Time                   `json:"gracePeriodEnd,omitempty"`
}

func (s *Service) GetSubscription(ctx context.Context, tenantID bson.ObjectID) (*domainsub.Subscription, error) {
	coll := s.db.Collection("subscriptions")
	scope := mongoinfra.NewScope(coll, tenantID)

	var sub domainsub.Subscription
	err := scope.FindOne(ctx, bson.M{}, &sub)
	if err == mongo.ErrNoDocuments {
		// Auto-initialize default Starter 14-day trial
		now := time.Now().UTC()
		trialEnd := now.Add(14 * 24 * time.Hour)
		defaultSub := domainsub.Subscription{
			ID:                 bson.NewObjectID(),
			TenantID:           tenantID,
			Plan:               domainsub.PlanStarter,
			Cycle:              domainsub.CycleMonthly,
			Status:             domainsub.StatusActive,
			CurrentPeriodStart: now,
			CurrentPeriodEnd:   trialEnd,
			IsTrial:            true,
			TrialEndsAt:        &trialEnd,
			Provider:           "trial",
			CreatedAt:          now,
			UpdatedAt:          now,
		}
		_, insertErr := scope.InsertOne(ctx, &defaultSub)
		if insertErr != nil {
			return nil, insertErr
		}
		return &defaultSub, nil
	}
	if err != nil {
		return nil, err
	}

	// Auto-correct any legacy trial subscription that was created as growth to starter
	if sub.IsTrial && sub.Plan == domainsub.PlanGrowth {
		sub.Plan = domainsub.PlanStarter
		_, _ = coll.UpdateByID(ctx, sub.ID, bson.M{"$set": bson.M{"plan": domainsub.PlanStarter}})
		_, _ = s.db.Collection("tenants").UpdateOne(ctx, bson.M{"_id": tenantID}, bson.M{"$set": bson.M{"plan": "starter"}})
	}

	return &sub, nil
}

func (s *Service) GetUsage(ctx context.Context, tenantID bson.ObjectID) (*UsageMetrics, error) {
	sub, err := s.GetSubscription(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	limits := domainsub.GetLimits(sub.Plan)

	// Count tables
	tablesColl := s.db.Collection("tables")
	tableScope := mongoinfra.NewScope(tablesColl, tenantID)
	tableCount, _ := tableScope.Count(ctx, bson.M{})

	// Count menu items
	itemsColl := s.db.Collection("menu_items")
	itemScope := mongoinfra.NewScope(itemsColl, tenantID)
	itemCount, _ := itemScope.Count(ctx, bson.M{})

	// Count staff users
	usersColl := s.db.Collection("users")
	userScope := mongoinfra.NewScope(usersColl, tenantID)
	staffCount, _ := userScope.Count(ctx, bson.M{})

	daysRemaining := 0
	if sub.IsTrial && !sub.CurrentPeriodEnd.IsZero() {
		hours := time.Until(sub.CurrentPeriodEnd).Hours()
		daysRemaining = int(math.Ceil(hours / 24))
		if daysRemaining < 0 {
			daysRemaining = 0
		}
	}

	return &UsageMetrics{
		Plan:           sub.Plan,
		PlanName:       domainsub.FormatPlanName(sub.Plan),
		Cycle:          sub.Cycle,
		Status:         sub.Status,
		IsTrial:        sub.IsTrial,
		DaysRemaining:  daysRemaining,
		TablesUsed:     int(tableCount),
		TablesMax:      limits.MaxTables,
		MenuItemsUsed:  int(itemCount),
		MenuItemsMax:   limits.MaxMenuItems,
		StaffUsed:      int(staffCount),
		StaffMax:       limits.MaxStaff,
		HasHotelModule: limits.HasHotelModule,
		RenewalDate:    sub.CurrentPeriodEnd,
		GracePeriodEnd: sub.GracePeriodEnd,
	}, nil
}

type CheckoutSessionResult struct {
	SessionID   string  `json:"sessionId"`
	CheckoutURL string  `json:"checkoutUrl"`
	Amount      float64 `json:"amount"`
	Currency    string  `json:"currency"`
	Plan        string  `json:"plan"`
	Cycle       string  `json:"cycle"`
}

func (s *Service) CreateCheckoutSession(ctx context.Context, tenantID bson.ObjectID, targetPlan domainsub.PlanTier, cycle domainsub.BillingCycle) (*CheckoutSessionResult, error) {
	limits, ok := domainsub.PlanMatrix[targetPlan]
	if !ok {
		return nil, errors.New("invalid plan tier")
	}

	amount := limits.MonthlyPriceINR
	if cycle == domainsub.CycleAnnual {
		amount = limits.AnnualPriceINR * 12
	}

	sessionID := fmt.Sprintf("sub_sess_%d_%s", time.Now().Unix(), targetPlan)
	checkoutURL := fmt.Sprintf("https://checkout.dineflow.app/session/%s", sessionID)

	return &CheckoutSessionResult{
		SessionID:   sessionID,
		CheckoutURL: checkoutURL,
		Amount:      amount,
		Currency:    "INR",
		Plan:        string(targetPlan),
		Cycle:       string(cycle),
	}, nil
}

func (s *Service) ChangePlan(ctx context.Context, tenantID bson.ObjectID, targetPlan domainsub.PlanTier, cycle domainsub.BillingCycle) (*domainsub.Subscription, error) {
	sub, err := s.GetSubscription(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	limits, ok := domainsub.PlanMatrix[targetPlan]
	if !ok {
		return nil, errors.New("invalid plan tier")
	}

	now := time.Now().UTC()
	duration := 30 * 24 * time.Hour
	if cycle == domainsub.CycleAnnual {
		duration = 365 * 24 * time.Hour
	}

	sub.Plan = targetPlan
	sub.Cycle = cycle
	sub.Status = domainsub.StatusActive
	sub.CurrentPeriodStart = now
	sub.CurrentPeriodEnd = now.Add(duration)
	sub.GracePeriodEnd = nil
	sub.IsTrial = false
	sub.TrialEndsAt = nil
	sub.LastExpiryNotifDate = ""
	sub.LastExpiryNotifDays = 0
	sub.UpdatedAt = now

	subColl := s.db.Collection("subscriptions")
	subScope := mongoinfra.NewScope(subColl, tenantID)
	update := bson.M{
		"$set": bson.M{
			"plan":                sub.Plan,
			"cycle":               sub.Cycle,
			"status":              sub.Status,
			"currentPeriodStart":  sub.CurrentPeriodStart,
			"currentPeriodEnd":    sub.CurrentPeriodEnd,
			"gracePeriodEnd":      nil,
			"isTrial":             false,
			"trialEndsAt":         nil,
			"lastExpiryNotifDate": "",
			"lastExpiryNotifDays": 0,
			"updatedAt":           now,
		},
	}
	if _, err := subScope.UpdateByID(ctx, sub.ID, update); err != nil {
		return nil, err
	}

	// Record an invoice for paid tiers
	amount := limits.MonthlyPriceINR
	if cycle == domainsub.CycleAnnual {
		amount = limits.AnnualPriceINR * 12
	}

	invoiceNum := fmt.Sprintf("INV-%d", time.Now().Unix())
	if amount > 0 {
		invColl := s.db.Collection("invoices")
		invScope := mongoinfra.NewScope(invColl, tenantID)
		invoice := domainsub.Invoice{
			ID:            bson.NewObjectID(),
			TenantID:      tenantID,
			InvoiceNumber: invoiceNum,
			PlanName:      domainsub.FormatPlanName(targetPlan),
			Amount:        amount,
			Currency:      "INR",
			Status:        "paid",
			PaidAt:        now,
			PDFUrl:        fmt.Sprintf("https://invoices.dineflow.app/%s.pdf", tenantID.Hex()),
			BillingPeriod: fmt.Sprintf("%s – %s", now.Format("02 Jan 2006"), now.Add(duration).Format("02 Jan 2006")),
		}
		_, _ = invScope.InsertOne(ctx, &invoice)
	}

	// Update tenant plan field
	tenantColl := s.db.Collection("tenants")
	_, _ = tenantColl.UpdateOne(ctx, bson.M{"_id": tenantID}, bson.M{"$set": bson.M{"plan": string(targetPlan)}})

	// Send confirmation email asynchronously
	if s.emailSvc != nil {
		go func(tID bson.ObjectID, pTier string, cyc string, pPrice float64, renDate time.Time, invNum string) {
			bgCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
			defer cancel()
			var t tenant.Tenant
			if err := s.db.Collection("tenants").FindOne(bgCtx, bson.M{"_id": tID}).Decode(&t); err == nil {
				var u user.User
				if err := s.db.Collection("users").FindOne(bgCtx, bson.M{"tenantId": tID, "role": user.RoleOwner}).Decode(&u); err == nil && u.Email != "" {
					if errMail := s.emailSvc.SendPlanUpgradeConfirmation(bgCtx, u.Email, u.Name, t.Name, pTier, cyc, pPrice, renDate, invNum); errMail != nil {
						log.Printf("⚠️ [BILLING EMAIL] Failed to send upgrade confirmation to %s: %v", u.Email, errMail)
					} else {
						log.Printf("📧 [BILLING EMAIL] Sent upgrade confirmation to %s for %s (%s)", u.Email, t.Name, pTier)
					}
				}
			}
		}(tenantID, string(targetPlan), string(cycle), amount, sub.CurrentPeriodEnd, invoiceNum)
	}

	return sub, nil
}

// SendTestExpiryEmail dispatches a test expiry warning or expired email directly to the given recipient.
func (s *Service) SendTestExpiryEmail(ctx context.Context, targetEmail string, daysRemaining int) error {
	if s.emailSvc == nil {
		return errors.New("email service not configured")
	}
	if targetEmail == "" {
		targetEmail = "imhimanshuvns@gmail.com"
	}
	if daysRemaining <= 0 {
		return s.emailSvc.SendTrialExpired(ctx, targetEmail, "Himanshu Singh", "The Gourmet Bistro", "https://dine.rovixatech.com/dashboard/settings?tab=billing")
	}
	return s.emailSvc.SendTrialExpiryWarning(ctx, targetEmail, "Himanshu Singh", "The Gourmet Bistro", daysRemaining, "https://dine.rovixatech.com/dashboard/settings?tab=billing")
}

func (s *Service) ListInvoices(ctx context.Context, tenantID bson.ObjectID) ([]domainsub.Invoice, error) {
	coll := s.db.Collection("invoices")
	scope := mongoinfra.NewScope(coll, tenantID)

	opts := options.Find().SetSort(bson.D{{Key: "paidAt", Value: -1}})
	cursor, err := scope.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var invoices []domainsub.Invoice
	if err := cursor.All(ctx, &invoices); err != nil {
		return nil, err
	}
	if invoices == nil {
		invoices = []domainsub.Invoice{}
	}
	return invoices, nil
}

type PlatformMetrics struct {
	TotalTenants     int64              `json:"totalTenants"`
	TotalMRR         float64            `json:"totalMRR"`
	TotalARR         float64            `json:"totalARR"`
	ActiveSubscribers int64             `json:"activeSubscribers"`
	PlanBreakdown    map[string]int     `json:"planBreakdown"`
	GracePeriodCount int                `json:"gracePeriodCount"`
}

func (s *Service) GetPlatformMetrics(ctx context.Context) (*PlatformMetrics, error) {
	coll := s.db.Collection("subscriptions")
	cursor, err := coll.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var allSubs []domainsub.Subscription
	if err := cursor.All(ctx, &allSubs); err != nil {
		return nil, err
	}

	metrics := &PlatformMetrics{
		PlanBreakdown: map[string]int{
			"free":      0,
			"starter":   0,
			"growth":    0,
			"hotel_pro": 0,
		},
	}

	for _, sub := range allSubs {
		metrics.TotalTenants++
		planStr := string(sub.Plan)
		metrics.PlanBreakdown[planStr]++

		limits := domainsub.GetLimits(sub.Plan)
		if sub.Status == domainsub.StatusActive || sub.Status == domainsub.StatusGracePeriod {
			if sub.Plan != domainsub.PlanFree {
				metrics.ActiveSubscribers++
				metrics.TotalMRR += limits.MonthlyPriceINR
			}
		}
		if sub.Status == domainsub.StatusGracePeriod {
			metrics.GracePeriodCount++
		}
	}

	metrics.TotalARR = metrics.TotalMRR * 12
	return metrics, nil
}
