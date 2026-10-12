package offer

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	whatsappapp "github.com/dineflow/api/internal/application/whatsapp"
	domainoffer "github.com/dineflow/api/internal/domain/offer"
	domainorder "github.com/dineflow/api/internal/domain/order"
	domaintenant "github.com/dineflow/api/internal/domain/tenant"
	mongoinfra "github.com/dineflow/api/internal/infrastructure/mongodb"
	"github.com/dineflow/api/internal/infrastructure/realtime"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type Service struct {
	db        *mongoinfra.Client
	waService *whatsappapp.Service
}

func NewService(db *mongoinfra.Client) *Service {
	return &Service{db: db}
}

func (s *Service) SetWhatsAppService(wa *whatsappapp.Service) {
	s.waService = wa
}

// CreateOffer stores a new promotional offer with zeroed statistics.
func (s *Service) CreateOffer(ctx context.Context, tenantID bson.ObjectID, off *domainoffer.Offer) (*domainoffer.Offer, error) {
	if strings.TrimSpace(off.Title) == "" {
		return nil, errors.New("offer title is required")
	}
	if strings.TrimSpace(off.PromoCode) == "" {
		return nil, errors.New("promo code is required")
	}

	off.ID = bson.NewObjectID()
	off.TenantID = tenantID
	off.PromoCode = strings.ToUpper(strings.TrimSpace(off.PromoCode))
	off.IsActive = true
	off.Stats = domainoffer.OfferStats{}
	off.CreatedAt = time.Now().UTC()
	off.UpdatedAt = off.CreatedAt

	if off.Channels == nil || len(off.Channels) == 0 {
		off.Channels = []string{"web_push", "whatsapp", "in_app"}
	}
	if off.TargetAudience == "" {
		off.TargetAudience = domainoffer.AudienceBilledToday
	}

	if s.db != nil {
		coll := s.db.Collection("offers")
		if _, err := coll.InsertOne(ctx, off); err != nil {
			return nil, err
		}
	}

	return off, nil
}

// ListOffers returns all promotional offers for the tenant sorted newest first.
func (s *Service) ListOffers(ctx context.Context, tenantID bson.ObjectID) ([]domainoffer.Offer, error) {
	if s.db == nil {
		return []domainoffer.Offer{}, nil
	}

	coll := s.db.Collection("offers")
	scope := mongoinfra.NewScope(coll, tenantID)

	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	cursor, err := scope.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var offers []domainoffer.Offer
	if err := cursor.All(ctx, &offers); err != nil {
		return nil, err
	}
	if offers == nil {
		offers = []domainoffer.Offer{}
	}

	return offers, nil
}

// BroadcastOffer queries the targeted guest audience, dispatches WhatsApp alerts, and pushes live SSE broadcasts.
func (s *Service) BroadcastOffer(ctx context.Context, tenantID, offerID bson.ObjectID) (*domainoffer.BroadcastResult, error) {
	var off domainoffer.Offer

	if s.db != nil {
		coll := s.db.Collection("offers")
		scope := mongoinfra.NewScope(coll, tenantID)
		if err := scope.FindByID(ctx, offerID, &off); err != nil {
			return nil, errors.New("offer not found")
		}
	} else {
		off = domainoffer.Offer{
			ID:             offerID,
			TenantID:       tenantID,
			Title:          "Special Treat",
			Message:        "Enjoy 20% off on your next visit!",
			PromoCode:      "RETURN20",
			DiscountType:   domainoffer.DiscountTypePercentage,
			DiscountValue:  20,
			TargetAudience: domainoffer.AudienceBilledToday,
			Channels:       []string{"web_push", "whatsapp", "in_app"},
		}
	}

	// 1. Query targeted orders audience
	now := time.Now().UTC()
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	pastWeekStart := now.AddDate(0, 0, -7)

	ordersFilter := bson.M{
		"tenantId":  tenantID,
		"deletedAt": bson.M{"$exists": false},
	}

	switch off.TargetAudience {
	case domainoffer.AudienceBilledToday:
		ordersFilter["status"] = domainorder.StatusPaid
		ordersFilter["createdAt"] = bson.M{"$gte": todayStart}
	case domainoffer.AudienceServedToday:
		ordersFilter["status"] = bson.M{"$in": []string{string(domainorder.StatusServed), string(domainorder.StatusPaid)}}
		ordersFilter["createdAt"] = bson.M{"$gte": todayStart}
	case domainoffer.AudiencePastWeek:
		ordersFilter["status"] = bson.M{"$in": []string{string(domainorder.StatusServed), string(domainorder.StatusPaid)}}
		ordersFilter["createdAt"] = bson.M{"$gte": pastWeekStart}
	case domainoffer.AudienceAllGuests:
		ordersFilter["status"] = bson.M{"$in": []string{string(domainorder.StatusServed), string(domainorder.StatusPaid)}}
	}

	uniquePhones := make(map[string]bool)
	if s.db != nil {
		cursor, err := s.db.Collection("orders").Find(ctx, ordersFilter)
		if err == nil {
			var orders []domainorder.Order
			if cursor.All(ctx, &orders) == nil {
				for _, ord := range orders {
					phone := strings.TrimSpace(ord.CustomerPhone)
					if phone != "" {
						uniquePhones[phone] = true
					}
				}
			}
		}
	}

	// 2. Fetch Restaurant Name for message branding
	restaurantName := "Our Restaurant"
	if s.db != nil {
		var t domaintenant.Tenant
		if err := s.db.Collection("tenants").FindOne(ctx, bson.M{"_id": tenantID}).Decode(&t); err == nil {
			restaurantName = t.Name
		}
	}

	// 3. Dispatch WhatsApp notifications to unique guest phones
	waSentCount := 0
	if s.waService != nil && len(uniquePhones) > 0 {
		discountText := fmt.Sprintf("%.0f%% OFF", off.DiscountValue)
		if off.DiscountType == domainoffer.DiscountTypeFixedAmount {
			discountText = fmt.Sprintf("₹%.0f OFF", off.DiscountValue)
		} else if off.DiscountType == domainoffer.DiscountTypeFreeItem {
			discountText = "Free Special Item"
		}

		for phone := range uniquePhones {
			msg := fmt.Sprintf("🎁 *Exclusive Offer from %s* 🎁\n\n"+
				"*%s*\n"+
				"%s\n\n"+
				"🎟️ Use Promo Code: *%s* (%s)\n"+
				"Order now directly from your table or online: %s",
				restaurantName, off.Title, off.Message,
				off.PromoCode, discountText, off.DeepLinkURL,
			)
			_, err := s.waService.SendDirectMessage(ctx, tenantID, phone, msg)
			if err == nil {
				waSentCount++
			}
		}
	}

	// 4. Broadcast live Server-Sent Events (SSE) via realtime Hub
	hub := realtime.GetHub()
	eventPayload := map[string]interface{}{
		"tenantId": tenantID.Hex(),
		"type":     "offer.broadcast",
		"offer":    off,
	}
	rawBytes, _ := json.Marshal(eventPayload)
	hub.BroadcastRaw(tenantID.Hex(), rawBytes)

	// 5. Update offer delivery statistics
	totalSent := int64(len(uniquePhones))
	if totalSent == 0 {
		totalSent = 1 // At least 1 realtime SSE broadcast channel
	}

	if s.db != nil {
		coll := s.db.Collection("offers")
		_, _ = coll.UpdateOne(ctx,
			bson.M{"_id": offerID, "tenantId": tenantID},
			bson.M{
				"$inc": bson.M{
					"stats.sentCount":      totalSent,
					"stats.deliveredCount": totalSent,
				},
				"$set": bson.M{"updatedAt": time.Now().UTC()},
			},
		)
	}

	return &domainoffer.BroadcastResult{
		OfferID:           offerID.Hex(),
		TargetAudience:    string(off.TargetAudience),
		AudienceCount:     len(uniquePhones),
		WhatsAppSentCount: waSentCount,
		RealtimeSent:      true,
		DispatchedAt:      now.Format(time.RFC3339),
		Channels:          off.Channels,
	}, nil
}

// GetActiveOffersForMenu returns active promotional offers for the digital menu landing page.
func (s *Service) GetActiveOffersForMenu(ctx context.Context, tenantSlug string) ([]domainoffer.Offer, error) {
	if s.db == nil {
		return []domainoffer.Offer{}, nil
	}

	var t domaintenant.Tenant
	err := s.db.Collection("tenants").FindOne(ctx, bson.M{
		"slug":      tenantSlug,
		"deletedAt": bson.M{"$exists": false},
	}).Decode(&t)
	if err != nil {
		return nil, errors.New("restaurant not found")
	}

	now := time.Now().UTC()
	filter := bson.M{
		"tenantId": t.ID,
		"isActive": true,
		"$or": []bson.M{
			{"expiresAt": nil},
			{"expiresAt": bson.M{"$exists": false}},
			{"expiresAt": bson.M{"$gt": now}},
		},
	}

	coll := s.db.Collection("offers")
	cursor, err := coll.Find(ctx, filter, options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var offers []domainoffer.Offer
	if err := cursor.All(ctx, &offers); err != nil {
		return nil, err
	}
	if offers == nil {
		offers = []domainoffer.Offer{}
	}

	return offers, nil
}

// SavePushSubscription upserts a customer's Web Push registration.
func (s *Service) SavePushSubscription(ctx context.Context, sub *domainoffer.PushSubscription) error {
	if sub.Endpoint == "" || sub.P256dhKey == "" || sub.AuthKey == "" {
		return errors.New("invalid push subscription payload")
	}

	if s.db == nil {
		return nil
	}

	coll := s.db.Collection("push_subscriptions")
	filter := bson.M{
		"tenantId": sub.TenantID,
		"endpoint": sub.Endpoint,
	}
	update := bson.M{
		"$set": bson.M{
			"p256dhKey":     sub.P256dhKey,
			"authKey":       sub.AuthKey,
			"customerPhone": sub.CustomerPhone,
			"tableSlug":     sub.TableSlug,
			"updatedAt":     time.Now().UTC(),
		},
		"$setOnInsert": bson.M{
			"_id":       bson.NewObjectID(),
			"createdAt": time.Now().UTC(),
		},
	}

	_, err := coll.UpdateOne(ctx, filter, update, options.UpdateOne().SetUpsert(true))
	return err
}

// TrackOfferClick increments the click interaction counter for analytics.
func (s *Service) TrackOfferClick(ctx context.Context, offerID bson.ObjectID) error {
	if s.db == nil {
		return nil
	}

	coll := s.db.Collection("offers")
	_, err := coll.UpdateOne(ctx,
		bson.M{"_id": offerID},
		bson.M{
			"$inc": bson.M{"stats.clickedCount": 1},
			"$set": bson.M{"updatedAt": time.Now().UTC()},
		},
	)
	return err
}

// TrackOfferConversion increments order conversions and revenue attributed to the promo code.
func (s *Service) TrackOfferConversion(ctx context.Context, tenantID bson.ObjectID, promoCode string, orderTotal float64) error {
	if s.db == nil || strings.TrimSpace(promoCode) == "" {
		return nil
	}

	coll := s.db.Collection("offers")
	_, err := coll.UpdateOne(ctx,
		bson.M{
			"tenantId":  tenantID,
			"promoCode": strings.ToUpper(strings.TrimSpace(promoCode)),
			"isActive":  true,
		},
		bson.M{
			"$inc": bson.M{
				"stats.ordersCount":      1,
				"stats.revenueGenerated": orderTotal,
			},
			"$set": bson.M{"updatedAt": time.Now().UTC()},
		},
	)
	return err
}
