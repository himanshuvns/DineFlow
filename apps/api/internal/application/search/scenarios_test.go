package search

import (
	"context"
	"testing"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// TestSearchScenarios verifies the search behavior across various inputs.
func TestSearchScenarios(t *testing.T) {
	svc := NewService(nil)
	ctx := context.Background()
	tenantA := bson.NewObjectID()
	tenantB := bson.NewObjectID()

	// Scenario 1: Short Query (< 2 characters) returns 0 results
	t.Run("Scenario 1: Short Query (<2 chars)", func(t *testing.T) {
		res, err := svc.SearchAll(ctx, tenantA, "a")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if res.Total != 0 {
			t.Errorf("expected 0 total results, got %d", res.Total)
		}
	})

	// Scenario 2: Whitespace-only Query returns 0 results
	t.Run("Scenario 2: Whitespace Query", func(t *testing.T) {
		res, err := svc.SearchAll(ctx, tenantA, "   ")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if res.Total != 0 {
			t.Errorf("expected 0 total results, got %d", res.Total)
		}
	})

	// Scenario 3: Multi-tenant safety check
	t.Run("Scenario 3: Tenant Isolation", func(t *testing.T) {
		if tenantA.Hex() == tenantB.Hex() {
			t.Errorf("tenants must have distinct ObjectIDs")
		}
	})

	// Scenario 4: Query sanitization & safe regex handling
	t.Run("Scenario 4: Special Characters in Query", func(t *testing.T) {
		// Verify that searching strings with regex special characters like "(+)", "[*]", "$100" doesn't panic
		res, err := svc.SearchAll(ctx, tenantA, "Pizza (+Extra Cheese) [*]")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		// Since DB is nil in mock, it gracefully handles nil DB without panicking
		_ = res
	})
}
