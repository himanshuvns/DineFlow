package offer_test

import (
	"context"
	"testing"
	"time"

	appoffer "github.com/dineflow/api/internal/application/offer"
	domainoffer "github.com/dineflow/api/internal/domain/offer"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func TestCreateOffer(t *testing.T) {
	svc := appoffer.NewService(nil)
	tenantID := bson.NewObjectID()

	expiry := time.Now().Add(24 * time.Hour)
	off := &domainoffer.Offer{
		Title:          "Flat 20% Weekend Special",
		Message:        "Flash weekend deal across all menus!",
		PromoCode:      "WEEKEND20",
		DiscountType:   domainoffer.DiscountTypePercentage,
		DiscountValue:  20,
		TargetAudience: domainoffer.AudienceBilledToday,
		ExpiresAt:      &expiry,
	}

	created, err := svc.CreateOffer(context.Background(), tenantID, off)
	if err != nil {
		t.Fatalf("unexpected error creating offer: %v", err)
	}

	if created.PromoCode != "WEEKEND20" {
		t.Errorf("expected promo code WEEKEND20, got %s", created.PromoCode)
	}
	if !created.IsActive {
		t.Errorf("expected offer to be active")
	}
	if created.Stats.SentCount != 0 {
		t.Errorf("expected initial sent count 0")
	}
}

func TestBroadcastOffer_Mock(t *testing.T) {
	svc := appoffer.NewService(nil)
	tenantID := bson.NewObjectID()
	offerID := bson.NewObjectID()

	res, err := svc.BroadcastOffer(context.Background(), tenantID, offerID)
	if err != nil {
		t.Fatalf("unexpected broadcast error: %v", err)
	}

	if !res.RealtimeSent {
		t.Errorf("expected realtime event broadcast")
	}
	if res.OfferID != offerID.Hex() {
		t.Errorf("expected offer ID %s, got %s", offerID.Hex(), res.OfferID)
	}
}

func TestTrackOfferClick_NoPanic(t *testing.T) {
	svc := appoffer.NewService(nil)
	err := svc.TrackOfferClick(context.Background(), bson.NewObjectID())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestTrackOfferConversion_NoPanic(t *testing.T) {
	svc := appoffer.NewService(nil)
	err := svc.TrackOfferConversion(context.Background(), bson.NewObjectID(), "RETURN10", 450.0)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}
