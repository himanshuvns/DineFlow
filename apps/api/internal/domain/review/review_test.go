package review_test

import (
	"testing"
	"time"

	"github.com/dineflow/api/internal/domain/review"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func TestReviewDomainTypes(t *testing.T) {
	req := review.GenerateReviewRequest{
		Rating:          5,
		Tags:            []string{"Delicious Food", "Great Ambience"},
		RestaurantName:  "DineFlow Bistro",
		Cuisine:         "Italian",
		SignatureDishes: []string{"Truffle Risotto"},
		Language:        "en",
	}

	if req.Rating != 5 || req.RestaurantName != "DineFlow Bistro" {
		t.Fatalf("unexpected request properties: %+v", req)
	}

	feedback := review.PrivateFeedback{
		ID:              bson.NewObjectID(),
		TenantID:        bson.NewObjectID(),
		Rating:          2,
		IssueCategories: []string{"Slow Service"},
		Comment:         "Waited 45 mins",
		GuestPhone:      "+919876543210",
		Status:          "new",
		CreatedAt:       time.Now().UTC(),
	}

	if feedback.Rating != 2 || feedback.Status != "new" {
		t.Fatalf("unexpected feedback: %+v", feedback)
	}
}
