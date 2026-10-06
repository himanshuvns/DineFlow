package ai_test

import (
	"context"
	"testing"

	aiapp "github.com/dineflow/api/internal/application/ai"
	domainai "github.com/dineflow/api/internal/domain/ai"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func TestCopilotBrief_MockMode(t *testing.T) {
	svc := aiapp.NewService("", nil)

	brief, err := svc.GetCopilotBrief(context.Background(), bson.NewObjectID())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if brief.YesterdayRevenue <= 0 {
		t.Errorf("expected positive revenue")
	}
	if len(brief.TopDishes) == 0 {
		t.Errorf("expected top dishes")
	}
	if len(brief.ActionableInsights) != 3 {
		t.Errorf("expected 3 actionable insights, got %d", len(brief.ActionableInsights))
	}
}

func TestCopilotQuery_Classification(t *testing.T) {
	svc := aiapp.NewService("", nil)

	// Test dishes query
	resDishes, err := svc.QueryCopilot(context.Background(), bson.NewObjectID(), domainai.CopilotQueryRequest{
		Query: "What are our most popular dishes?",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resDishes.AnswerMarkdown == "" {
		t.Errorf("expected answer markdown")
	}

	// Test feedback query
	resFeedback, err := svc.QueryCopilot(context.Background(), bson.NewObjectID(), domainai.CopilotQueryRequest{
		Query: "Show our Google Maps reviews and shielded feedback",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resFeedback.MetricSummary["conversionRate"] == nil {
		t.Errorf("expected conversionRate metric")
	}
}
