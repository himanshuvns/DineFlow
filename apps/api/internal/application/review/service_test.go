package review_test

import (
	"context"
	"testing"

	appreview "github.com/dineflow/api/internal/application/review"
	domainreview "github.com/dineflow/api/internal/domain/review"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func TestGenerateReviewSuggestions_MockFallback(t *testing.T) {
	svc := appreview.NewService(nil, nil)

	req := domainreview.GenerateReviewRequest{
		Rating:          5,
		Tags:            []string{"Quick Service", "Great Ambience"},
		RestaurantName:  "Royal Taj Palace",
		SignatureDishes: []string{"Butter Chicken", "Garlic Naan"},
		Language:        "en",
	}

	res, err := svc.GenerateReviewSuggestions(context.Background(), req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(res.Suggestions) != 3 {
		t.Fatalf("expected 3 review suggestions, got %d", len(res.Suggestions))
	}

	for _, s := range res.Suggestions {
		if s == "" {
			t.Errorf("expected non-empty suggestion")
		}
	}
}

func TestGetReviewStats_Calculation(t *testing.T) {
	svc := appreview.NewService(nil, nil)

	stats, err := svc.GetReviewStats(context.Background(), bson.NewObjectID())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if stats.TotalScans <= 0 {
		t.Errorf("expected positive total scans")
	}
	if stats.ConversionRate <= 0 {
		t.Errorf("expected positive conversion rate")
	}
}
