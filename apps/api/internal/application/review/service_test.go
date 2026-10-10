package review_test

import (
	"context"
	"strings"
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

func TestGenerateReviewSuggestions_AllEightHighlights(t *testing.T) {
	svc := appreview.NewService(nil, nil)

	allTags := []string{
		"Delicious Food",
		"Great Ambience",
		"Fast Service",
		"Friendly Staff",
		"Value for Money",
		"Signature Drinks",
		"Impeccable Hygiene",
		"Cozy Vibe",
	}

	req := domainreview.GenerateReviewRequest{
		Rating:          5,
		Tags:            allTags,
		RestaurantName:  "The Grand Bistro",
		SignatureDishes: []string{"Truffle Risotto"},
		Language:        "en",
	}

	res, err := svc.GenerateReviewSuggestions(context.Background(), req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(res.Suggestions) != 3 {
		t.Fatalf("expected 3 review suggestions, got %d", len(res.Suggestions))
	}

	// Verify Option 1 weaves in food, drinks, ambience, service, staff, hygiene, and value
	opt1 := res.Suggestions[0]
	keywords := []string{"food", "drink", "ambience", "service", "staff", "clean", "value"}
	for _, kw := range keywords {
		if !strings.Contains(strings.ToLower(opt1), kw) {
			t.Errorf("expected option 1 to contain keyword %q, got: %s", kw, opt1)
		}
	}
}

