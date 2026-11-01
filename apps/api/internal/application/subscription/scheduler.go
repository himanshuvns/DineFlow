package subscription

import (
	"context"
	"math"
	"time"

	domainsub "github.com/dineflow/api/internal/domain/subscription"
	"github.com/dineflow/api/internal/domain/tenant"
	"github.com/dineflow/api/internal/domain/user"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.uber.org/zap"
)

// StartLifecycleScheduler runs the background worker that monitors trials and dispatches daily expiry emails.
func (s *Service) StartLifecycleScheduler(ctx context.Context, logger *zap.Logger) {
	logger.Info("Starting DineFlow Subscription Lifecycle Scheduler (14-day Starter trial monitor)")

	// Allow initial system boot to complete before first run
	select {
	case <-ctx.Done():
		return
	case <-time.After(15 * time.Second):
		s.processTrialExpiryCycle(ctx, logger)
	}

	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			logger.Info("Subscription lifecycle scheduler shutting down")
			return
		case <-ticker.C:
			s.processTrialExpiryCycle(ctx, logger)
		}
	}
}

// processTrialExpiryCycle iterates through active trial subscriptions and dispatches notifications for those <= 7 days.
func (s *Service) processTrialExpiryCycle(ctx context.Context, logger *zap.Logger) {
	if s.emailSvc == nil {
		logger.Warn("[SUBSCRIPTION LIFECYCLE] Email service not configured, skipping trial notification cycle")
		return
	}

	now := time.Now().UTC()
	todayStr := now.Format("2006-01-02")

	coll := s.db.Collection("subscriptions")
	filter := bson.M{
		"isTrial": true,
		"status":  domainsub.StatusActive,
	}

	cursor, err := coll.Find(ctx, filter)
	if err != nil {
		logger.Error("[SUBSCRIPTION LIFECYCLE] Failed to query trial subscriptions", zap.Error(err))
		return
	}
	defer cursor.Close(ctx)

	var trialSubs []domainsub.Subscription
	if err := cursor.All(ctx, &trialSubs); err != nil {
		logger.Error("[SUBSCRIPTION LIFECYCLE] Failed to decode trial subscriptions", zap.Error(err))
		return
	}

	if len(trialSubs) == 0 {
		return
	}

	logger.Info("[SUBSCRIPTION LIFECYCLE] Scanning active trial workspaces", zap.Int("count", len(trialSubs)))

	tenantsColl := s.db.Collection("tenants")
	usersColl := s.db.Collection("users")

	for _, sub := range trialSubs {
		// Calculate days remaining until trial ends
		hoursRemaining := time.Until(sub.CurrentPeriodEnd).Hours()
		daysRemaining := int(math.Ceil(hoursRemaining / 24))

		// Only notify when trial is within 7 days of expiry
		if daysRemaining > 7 {
			continue
		}

		// Idempotency: prevent duplicate emails on the same calendar day for the same countdown day
		if sub.LastExpiryNotifDate == todayStr && sub.LastExpiryNotifDays == daysRemaining {
			continue
		}

		// Load tenant details
		var t tenant.Tenant
		if err := tenantsColl.FindOne(ctx, bson.M{"_id": sub.TenantID}).Decode(&t); err != nil {
			logger.Warn("[SUBSCRIPTION LIFECYCLE] Tenant not found for subscription", zap.String("tenantId", sub.TenantID.Hex()), zap.Error(err))
			continue
		}

		// Load tenant owner
		var owner user.User
		if err := usersColl.FindOne(ctx, bson.M{"tenantId": sub.TenantID, "role": user.RoleOwner}).Decode(&owner); err != nil {
			logger.Warn("[SUBSCRIPTION LIFECYCLE] Owner user not found for tenant", zap.String("tenantId", sub.TenantID.Hex()), zap.Error(err))
			continue
		}

		if owner.Email == "" {
			continue
		}

		upgradeLink := "https://dine.rovixatech.com/dashboard/settings?tab=billing"

		if daysRemaining > 0 {
			// Daily warning countdown email (Days 7, 6, 5, 4, 3, 2, 1)
			err = s.emailSvc.SendTrialExpiryWarning(ctx, owner.Email, owner.Name, t.Name, daysRemaining, upgradeLink)
			if err != nil {
				logger.Error("[SUBSCRIPTION LIFECYCLE] Failed to send trial expiry warning email",
					zap.String("recipient", owner.Email),
					zap.String("tenant", t.Name),
					zap.Int("daysRemaining", daysRemaining),
					zap.Error(err),
				)
				continue
			}

			logger.Info("📧 [SUBSCRIPTION LIFECYCLE] Dispatched daily trial expiry warning email",
				zap.String("recipient", owner.Email),
				zap.String("tenant", t.Name),
				zap.Int("daysRemaining", daysRemaining),
			)
		} else {
			// Trial expired today (Day 0) — move to grace period and alert owner
			sub.EnterGracePeriod()
			err = s.emailSvc.SendTrialExpired(ctx, owner.Email, owner.Name, t.Name, upgradeLink)
			if err != nil {
				logger.Error("[SUBSCRIPTION LIFECYCLE] Failed to send trial expired email",
					zap.String("recipient", owner.Email),
					zap.String("tenant", t.Name),
					zap.Error(err),
				)
				continue
			}

			logger.Info("🚨 [SUBSCRIPTION LIFECYCLE] Dispatched trial expired notice with 14-day data protection grace period",
				zap.String("recipient", owner.Email),
				zap.String("tenant", t.Name),
			)
		}

		// Update notification status on the subscription record
		updateDoc := bson.M{
			"$set": bson.M{
				"lastExpiryNotifDate": todayStr,
				"lastExpiryNotifDays": daysRemaining,
				"status":              sub.Status,
				"gracePeriodEnd":      sub.GracePeriodEnd,
				"updatedAt":           now,
			},
		}
		_, _ = coll.UpdateByID(ctx, sub.ID, updateDoc)
	}
}
