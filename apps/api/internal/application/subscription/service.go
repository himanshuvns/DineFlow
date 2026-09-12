package subscription

import (
	"context"
	"errors"
	"fmt"
	"time"

	domainsub "github.com/dineflow/api/internal/domain/subscription"
	mongoinfra "github.com/dineflow/api/internal/infrastructure/mongodb"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type Service struct {
	db *mongoinfra.Client
}

func NewService(db *mongoinfra.Client) *Service {
	return &Service{db: db}
}

type UsageMetrics struct {
	Plan           domainsub.PlanTier   `json:"plan"`
	PlanName       string               `json:"planName"`
	Cycle          domainsub.BillingCycle `json:"cycle"`
	Status         domainsub.SubscriptionStatus `json:"status"`
	TablesUsed     int                  `json:"tablesUsed"`
	TablesMax      int                  `json:"tablesMax"`
	MenuItemsUsed  int                  `json:"menuItemsUsed"`
	MenuItemsMax   int                  `json:"menuItemsMax"`
	StaffUsed      int                  `json:"staffUsed"`
	StaffMax       int                  `json:"staffMax"`
	HasHotelModule bool                 `json:"hasHotelModule"`
	RenewalDate    time.Time            `json:"renewalDate"`
	GracePeriodEnd *time.Time           `json:"gracePeriodEnd,omitempty"`
}

func (s *Service) GetSubscription(ctx context.Context, tenantID bson.ObjectID) (*domainsub.Subscription, error) {
	coll := s.db.Collection("subscriptions")
	scope := mongoinfra.NewScope(coll, tenantID)

	var sub domainsub.Subscription
	err := scope.FindOne(ctx, bson.M{}, &sub)
	if err == mongo.ErrNoDocuments {
		// Auto-initialize default Free subscription
		now := time.Now().UTC()
		defaultSub := domainsub.Subscription{
			ID:                 bson.NewObjectID(),
			TenantID:           tenantID,
			Plan:               domainsub.PlanFree,
			Cycle:              domainsub.CycleMonthly,
			Status:             domainsub.StatusActive,
			CurrentPeriodStart: now,
			CurrentPeriodEnd:   now.Add(365 * 24 * time.Hour),
			Provider:           "system",
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

	return &UsageMetrics{
		Plan:           sub.Plan,
		PlanName:       domainsub.FormatPlanName(sub.Plan),
		Cycle:          sub.Cycle,
		Status:         sub.Status,
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
	sub.UpdatedAt = now

	subColl := s.db.Collection("subscriptions")
	subScope := mongoinfra.NewScope(subColl, tenantID)
	update := bson.M{
		"$set": bson.M{
			"plan":               sub.Plan,
			"cycle":              sub.Cycle,
			"status":             sub.Status,
			"currentPeriodStart": sub.CurrentPeriodStart,
			"currentPeriodEnd":   sub.CurrentPeriodEnd,
			"gracePeriodEnd":     nil,
			"updatedAt":          now,
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

	if amount > 0 {
		invColl := s.db.Collection("invoices")
		invScope := mongoinfra.NewScope(invColl, tenantID)
		invoice := domainsub.Invoice{
			ID:            bson.NewObjectID(),
			TenantID:      tenantID,
			InvoiceNumber: fmt.Sprintf("INV-%d", time.Now().Unix()),
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

	return sub, nil
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
