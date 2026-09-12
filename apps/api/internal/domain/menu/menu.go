package menu

import (
	"errors"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// DietaryTag denotes food preparation types.
type DietaryTag string

const (
	TagVeg        DietaryTag = "veg"
	TagNonVeg     DietaryTag = "non_veg"
	TagVegan      DietaryTag = "vegan"
	TagGlutenFree DietaryTag = "gluten_free"
	TagJain       DietaryTag = "jain"
	TagSpicy      DietaryTag = "spicy"
)

// Category groups dishes on the digital menu.
type Category struct {
	ID           bson.ObjectID `bson:"_id,omitempty" json:"id"`
	TenantID     bson.ObjectID `bson:"tenantId" json:"tenantId"`
	Name         string        `bson:"name" json:"name"`
	Slug         string        `bson:"slug" json:"slug"`
	Description  string        `bson:"description,omitempty" json:"description,omitempty"`
	DisplayOrder int           `bson:"displayOrder" json:"displayOrder"`
	IsActive     bool          `bson:"isActive" json:"isActive"`
	CreatedAt    time.Time     `bson:"createdAt" json:"createdAt"`
	UpdatedAt    time.Time     `bson:"updatedAt" json:"updatedAt"`
}

// Variant allows size or portion pricing (e.g., "Regular", "Large").
type Variant struct {
	ID    string  `bson:"id" json:"id"`
	Name  string  `bson:"name" json:"name"`
	Price float64 `bson:"price" json:"price"` // Price added or replacement price
}

// ModifierOption is an individual add-on inside a ModifierGroup.
type ModifierOption struct {
	ID    string  `bson:"id" json:"id"`
	Name  string  `bson:"name" json:"name"`
	Price float64 `bson:"price" json:"price"`
}

// ModifierGroup represents customizable add-ons (e.g., "Choose Toppings", "Choice of Dressing").
type ModifierGroup struct {
	ID            string           `bson:"id" json:"id"`
	Name          string           `bson:"name" json:"name"`
	MinSelections int              `bson:"minSelections" json:"minSelections"`
	MaxSelections int              `bson:"maxSelections" json:"maxSelections"`
	Options       []ModifierOption `bson:"options" json:"options"`
}

// MenuItem represents a single dish or drink.
type MenuItem struct {
	ID              bson.ObjectID    `bson:"_id,omitempty" json:"id"`
	TenantID        bson.ObjectID    `bson:"tenantId" json:"tenantId"`
	CategoryID      bson.ObjectID    `bson:"categoryId" json:"categoryId"`
	Name            string           `bson:"name" json:"name"`
	Slug            string           `bson:"slug" json:"slug"`
	Description     string           `bson:"description,omitempty" json:"description,omitempty"`
	BasePrice       float64          `bson:"basePrice" json:"basePrice"`
	Currency        string           `bson:"currency" json:"currency"`
	ImageURL        string           `bson:"imageUrl,omitempty" json:"imageUrl,omitempty"`
	IsAvailable     bool             `bson:"isAvailable" json:"isAvailable"`
	PrepTimeMinutes int              `bson:"prepTimeMinutes" json:"prepTimeMinutes"`
	DietaryTags     []DietaryTag     `bson:"dietaryTags,omitempty" json:"dietaryTags,omitempty"`
	Variants        []Variant        `bson:"variants,omitempty" json:"variants,omitempty"`
	ModifierGroups  []ModifierGroup  `bson:"modifierGroups,omitempty" json:"modifierGroups,omitempty"`
	TaxRatePercent  float64          `bson:"taxRatePercent" json:"taxRatePercent"`
	DisplayOrder    int              `bson:"displayOrder" json:"displayOrder"`
	CreatedAt       time.Time        `bson:"createdAt" json:"createdAt"`
	UpdatedAt       time.Time        `bson:"updatedAt" json:"updatedAt"`
}

// Validate checks business rules for a Category.
func (c *Category) Validate() error {
	if strings.TrimSpace(c.Name) == "" {
		return errors.New("category name is required")
	}
	if c.TenantID.IsZero() {
		return errors.New("tenantId is required")
	}
	return nil
}

// Validate checks business rules for a MenuItem.
func (m *MenuItem) Validate() error {
	if strings.TrimSpace(m.Name) == "" {
		return errors.New("menu item name is required")
	}
	if m.TenantID.IsZero() {
		return errors.New("tenantId is required")
	}
	if m.CategoryID.IsZero() {
		return errors.New("categoryId is required")
	}
	if m.BasePrice < 0 {
		return errors.New("basePrice cannot be negative")
	}
	for _, grp := range m.ModifierGroups {
		if grp.MinSelections > grp.MaxSelections && grp.MaxSelections > 0 {
			return errors.New("minSelections cannot exceed maxSelections in modifier group")
		}
	}
	return nil
}
