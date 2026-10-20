package inventory_test

import (
	"testing"

	"github.com/dineflow/api/internal/domain/inventory"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func TestConvertQuantity_StandardUnits(t *testing.T) {
	// Mass conversions
	qty, err := inventory.ConvertQuantity(2.5, "kg", "g", 0)
	require.NoError(t, err)
	assert.Equal(t, 2500.0, qty)

	qty, err = inventory.ConvertQuantity(500, "g", "kg", 0)
	require.NoError(t, err)
	assert.Equal(t, 0.5, qty)

	// Volume conversions
	qty, err = inventory.ConvertQuantity(1.5, "l", "ml", 0)
	require.NoError(t, err)
	assert.Equal(t, 1500.0, qty)

	qty, err = inventory.ConvertQuantity(750, "ml", "l", 0)
	require.NoError(t, err)
	assert.Equal(t, 0.75, qty)

	// Count conversions
	qty, err = inventory.ConvertQuantity(2, "dozen", "pcs", 0)
	require.NoError(t, err)
	assert.Equal(t, 24.0, qty)

	qty, err = inventory.ConvertQuantity(36, "pcs", "dozen", 0)
	require.NoError(t, err)
	assert.Equal(t, 3.0, qty)
}

func TestConvertQuantity_PackagingCustomFactors(t *testing.T) {
	// 2 boxes of 12 pcs each -> 24 pcs
	qty, err := inventory.ConvertQuantity(2, "box", "pcs", 12.0)
	require.NoError(t, err)
	assert.Equal(t, 24.0, qty)

	// 24 pcs into boxes with factor 12 -> 2 boxes
	qty, err = inventory.ConvertQuantity(24, "pcs", "box", 12.0)
	require.NoError(t, err)
	assert.Equal(t, 2.0, qty)

	// 3 cans of 330 ml each -> 990 ml
	qty, err = inventory.ConvertQuantity(3, "can", "ml", 330.0)
	require.NoError(t, err)
	assert.Equal(t, 990.0, qty)

	// 990 ml into cans of 330 ml -> 3 cans
	qty, err = inventory.ConvertQuantity(990, "ml", "can", 330.0)
	require.NoError(t, err)
	assert.Equal(t, 3.0, qty)
}

func TestConvertQuantity_IncompatibleDimensionsWithoutFactor(t *testing.T) {
	// Volume to mass without custom factor must fail strictly
	_, err := inventory.ConvertQuantity(500, "ml", "g", 0)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "requires positive custom conversion factor")

	// Packaging to mass without custom factor must fail strictly
	_, err = inventory.ConvertQuantity(2, "pack", "kg", 0)
	assert.Error(t, err)
}

func TestRecipe_Recalculate(t *testing.T) {
	rec := inventory.Recipe{
		ID:            bson.NewObjectID(),
		MenuItemID:    bson.NewObjectID(),
		Name:          "Bruschetta",
		YieldServings: 2.0,
		SellingPrice:  400.0,
		Ingredients: []inventory.RecipeIngredient{
			{
				InventoryItemName: "Bread",
				Quantity:          100, // 100g
				Unit:              "g",
				PrepLossPercent:   0,
				UnitCost:          0.2, // 0.2 / g -> 20.0
			},
			{
				InventoryItemName: "Mushrooms",
				Quantity:          100,
				Unit:              "g",
				PrepLossPercent:   10, // 10% prep loss -> 110g effective
				UnitCost:          0.5, // 110 * 0.5 = 55.0
			},
		},
	}

	rec.Recalculate()

	assert.Equal(t, 20.0, rec.Ingredients[0].IngredientCost)
	assert.Equal(t, 55.0, rec.Ingredients[1].IngredientCost)
	assert.Equal(t, 75.0, rec.TotalCost)
	assert.Equal(t, 37.5, rec.CostPerServing)
	assert.InDelta(t, 9.38, rec.FoodCostPercent, 0.05) // (37.5 / 400) * 100
	assert.Equal(t, 362.5, rec.GrossMargin)
}
