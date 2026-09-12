package menu_test

import (
	"testing"

	"github.com/dineflow/api/internal/domain/menu"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func TestCategoryValidation(t *testing.T) {
	tenantID := bson.NewObjectID()

	cat := &menu.Category{
		TenantID: tenantID,
		Name:     "Pizzas",
	}
	if err := cat.Validate(); err != nil {
		t.Fatalf("expected valid category, got error: %v", err)
	}

	// Empty name
	invalidCat := &menu.Category{
		TenantID: tenantID,
		Name:     "  ",
	}
	if err := invalidCat.Validate(); err == nil {
		t.Errorf("expected error for empty name, got nil")
	}
}

func TestMenuItemValidation(t *testing.T) {
	tenantID := bson.NewObjectID()
	catID := bson.NewObjectID()

	item := &menu.MenuItem{
		TenantID:   tenantID,
		CategoryID: catID,
		Name:       "Truffle Risotto",
		BasePrice:  850,
		ModifierGroups: []menu.ModifierGroup{
			{
				Name:          "Cheese",
				MinSelections: 0,
				MaxSelections: 2,
			},
		},
	}
	if err := item.Validate(); err != nil {
		t.Fatalf("expected valid item, got error: %v", err)
	}

	// Negative base price
	item.BasePrice = -50
	if err := item.Validate(); err == nil {
		t.Errorf("expected error for negative price, got nil")
	}
	item.BasePrice = 850

	// Invalid modifier selection range
	item.ModifierGroups[0].MinSelections = 3
	item.ModifierGroups[0].MaxSelections = 1
	if err := item.Validate(); err == nil {
		t.Errorf("expected error for invalid modifier selection limits, got nil")
	}
}
