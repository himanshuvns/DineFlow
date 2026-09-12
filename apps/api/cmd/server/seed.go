package main

import (
	"context"
	"strings"
	"time"

	"github.com/dineflow/api/internal/domain/menu"
	"github.com/dineflow/api/internal/domain/table"
	"github.com/dineflow/api/internal/domain/tenant"
	"github.com/dineflow/api/internal/domain/user"
	mongoinfra "github.com/dineflow/api/internal/infrastructure/mongodb"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
)

// seedDefaultData ensures a live demo owner account and tenant exist for testing and preview.
func seedDefaultData(ctx context.Context, db *mongoinfra.Client, log *zap.Logger) error {
	tenantsColl := db.Collection("tenants")
	usersColl := db.Collection("users")
	categoriesColl := db.Collection("categories")
	itemsColl := db.Collection("menu_items")
	tablesColl := db.Collection("tables")

	demoEmail := strings.ToLower("owner@thegrandbistro.com")

	// Check if demo user already exists
	count, err := usersColl.CountDocuments(ctx, bson.M{"email": demoEmail})
	if err != nil {
		return err
	}

	var tenantID bson.ObjectID

	if count == 0 {
		now := time.Now().UTC()
		tenantID = bson.NewObjectID()
		plan := tenant.PlanGrowth

		// 1. Create Demo Tenant
		demoTenant := tenant.Tenant{
			ID:           tenantID,
			Slug:         "the-grand-bistro",
			Name:         "The Grand Bistro",
			BusinessType: tenant.BusinessTypeRestaurant,
			Plan:         plan,
			Status:       tenant.StatusActive,
			Timezone:     "Asia/Kolkata",
			Currency:     "INR",
			Country:      "IN",
			TaxRate:      5.0,
			Contact: tenant.Contact{
				Email: demoEmail,
				Phone: "+91 98765 43210",
			},
			Address: tenant.Address{
				Line1:   "12 Heritage Boulevard, Connaught Place",
				City:    "New Delhi",
				State:   "Delhi",
				Pincode: "110001",
				Country: "IN",
			},
			Settings: tenant.Settings{
				OrderingEnabled:        true,
				RequireGuestPhone:      false,
				AutoAcceptOrders:       false,
				PreparationTimeMinutes: 15,
				OrderingPageTheme:      "default",
				ItemUnavailableMode:    "gray_out",
			},
			Features: tenant.FeaturesForPlan(plan),
			Limits:   tenant.LimitsForPlan(plan),
			Onboarding: tenant.Onboarding{
				Completed: true,
				Steps: tenant.OnboardingSteps{
					Profile:  true,
					Menu:     true,
					Tables:   true,
					QRCodes:  true,
					WhatsApp: true,
				},
			},
			CreatedAt: now,
			UpdatedAt: now,
		}

		if _, err := tenantsColl.InsertOne(ctx, demoTenant); err != nil {
			log.Warn("Failed to insert demo tenant", zap.Error(err))
		}

		// 2. Create Demo User
		hash, err := bcrypt.GenerateFromPassword([]byte("DineFlow@2026"), bcrypt.DefaultCost)
		if err != nil {
			return err
		}

		demoUser := user.User{
			ID:          bson.NewObjectID(),
			TenantID:    tenantID,
			Email:       demoEmail,
			Name:        "Laurent Bistro",
			Role:        user.RoleOwner,
			Permissions: user.DefaultPermissionsForRole(user.RoleOwner),
			Auth: user.Auth{
				PasswordHash:  string(hash),
				EmailVerified: true,
				PhoneVerified: true,
			},
			Status:    user.StatusActive,
			CreatedAt: now,
			UpdatedAt: now,
		}

		if _, err := usersColl.InsertOne(ctx, demoUser); err != nil {
			log.Warn("Failed to insert demo user", zap.Error(err))
		} else {
			log.Info("🌱 Seeded live demo account",
				zap.String("email", demoEmail),
				zap.String("password", "DineFlow@2026"),
				zap.String("tenantSlug", demoTenant.Slug),
			)
		}
	} else {
		// Retrieve existing tenantID
		var existingUser user.User
		if err := usersColl.FindOne(ctx, bson.M{"email": demoEmail}).Decode(&existingUser); err == nil {
			tenantID = existingUser.TenantID
		}
	}

	if tenantID.IsZero() {
		return nil
	}

	// 3. Seed Sample Categories and Menu Items if none exist for this tenant
	itemCount, _ := itemsColl.CountDocuments(ctx, bson.M{"tenantId": tenantID})
	if itemCount == 0 {
		now := time.Now().UTC()

		catStartersID := bson.NewObjectID()
		catMainsID := bson.NewObjectID()
		catDessertsID := bson.NewObjectID()
		catDrinksID := bson.NewObjectID()

		cats := []interface{}{
			menu.Category{
				ID:           catStartersID,
				TenantID:     tenantID,
				Name:         "Starters & Tapas",
				Slug:         "starters-tapas",
				Description:  "Artisanal small plates to start your culinary journey",
				DisplayOrder: 1,
				IsActive:     true,
				CreatedAt:    now,
				UpdatedAt:    now,
			},
			menu.Category{
				ID:           catMainsID,
				TenantID:     tenantID,
				Name:         "Signature Mains",
				Slug:         "signature-mains",
				Description:  "Chef Laurent's signature woodfired and slow-cooked creations",
				DisplayOrder: 2,
				IsActive:     true,
				CreatedAt:    now,
				UpdatedAt:    now,
			},
			menu.Category{
				ID:           catDessertsID,
				TenantID:     tenantID,
				Name:         "Artisanal Desserts",
				Slug:         "artisanal-desserts",
				Description:  "Decadent house-made sweets",
				DisplayOrder: 3,
				IsActive:     true,
				CreatedAt:    now,
				UpdatedAt:    now,
			},
			menu.Category{
				ID:           catDrinksID,
				TenantID:     tenantID,
				Name:         "Beverages & Mocktails",
				Slug:         "beverages-mocktails",
				Description:  "Cold pressed juices, botanical infusions and craft brews",
				DisplayOrder: 4,
				IsActive:     true,
				CreatedAt:    now,
				UpdatedAt:    now,
			},
		}
		_, _ = categoriesColl.InsertMany(ctx, cats)

		items := []interface{}{
			menu.MenuItem{
				ID:              bson.NewObjectID(),
				TenantID:        tenantID,
				CategoryID:      catStartersID,
				Name:            "Truffle Wild Mushroom Bruschetta",
				Slug:            "truffle-wild-mushroom-bruschetta",
				Description:     "Toasted sourdough topped with sautéed wild forest mushrooms, black truffle oil, and aged parmesan shavings.",
				BasePrice:       420,
				Currency:        "INR",
				DietaryTags:     []menu.DietaryTag{menu.TagVeg},
				IsAvailable:     true,
				PrepTimeMinutes: 12,
				DisplayOrder:    1,
				CreatedAt:       now,
				UpdatedAt:       now,
			},
			menu.MenuItem{
				ID:              bson.NewObjectID(),
				TenantID:        tenantID,
				CategoryID:      catMainsID,
				Name:            "Pan-Seared Herb Butter Sea Bass",
				Slug:            "pan-seared-sea-bass",
				Description:     "Crispy skin Chilean sea bass served over saffron risotto, glazed baby asparagus, and lemon-herb velouté.",
				BasePrice:       890,
				Currency:        "INR",
				DietaryTags:     []menu.DietaryTag{menu.TagNonVeg},
				IsAvailable:     true,
				PrepTimeMinutes: 20,
				DisplayOrder:    1,
				CreatedAt:       now,
				UpdatedAt:       now,
			},
			menu.MenuItem{
				ID:              bson.NewObjectID(),
				TenantID:        tenantID,
				CategoryID:      catMainsID,
				Name:            "Artisanal Woodfired Burrata Pizza",
				Slug:            "artisanal-woodfired-burrata-pizza",
				Description:     "San Marzano tomato base, creamy whole burrata, fresh sweet basil, and extra virgin olive oil.",
				BasePrice:       680,
				Currency:        "INR",
				DietaryTags:     []menu.DietaryTag{menu.TagVeg},
				IsAvailable:     true,
				PrepTimeMinutes: 15,
				DisplayOrder:    2,
				CreatedAt:       now,
				UpdatedAt:       now,
			},
			menu.MenuItem{
				ID:              bson.NewObjectID(),
				TenantID:        tenantID,
				CategoryID:      catDessertsID,
				Name:            "Valrhona Dark Chocolate Lava Cake",
				Slug:            "valrhona-dark-chocolate-lava-cake",
				Description:     "Molten center 70% French dark chocolate cake with house-churned Madagascar vanilla bean gelato.",
				BasePrice:       380,
				Currency:        "INR",
				DietaryTags:     []menu.DietaryTag{menu.TagVeg},
				IsAvailable:     true,
				PrepTimeMinutes: 15,
				DisplayOrder:    1,
				CreatedAt:       now,
				UpdatedAt:       now,
			},
		}
		_, _ = itemsColl.InsertMany(ctx, items)
		log.Info("🌱 Seeded initial menu items and categories for demo tenant")
	}

	// 4. Seed Sample Tables if none exist
	tableCount, _ := tablesColl.CountDocuments(ctx, bson.M{"tenantId": tenantID})
	if tableCount == 0 {
		now := time.Now().UTC()
		sampleTables := []interface{}{
			table.Table{
				ID:        bson.NewObjectID(),
				TenantID:  tenantID,
				Type:      table.TypeTable,
				Name:      "Table 1",
				Zone:      "Main Dining",
				Seats:     4,
				QRSlug:    "the-grand-bistro-t1",
				Status:    table.StatusAvailable,
				CreatedAt: now,
				UpdatedAt: now,
			},
			table.Table{
				ID:        bson.NewObjectID(),
				TenantID:  tenantID,
				Type:      table.TypeTable,
				Name:      "Table 2",
				Zone:      "Main Dining",
				Seats:     2,
				QRSlug:    "the-grand-bistro-t2",
				Status:    table.StatusOccupied,
				CreatedAt: now,
				UpdatedAt: now,
			},
			table.Table{
				ID:        bson.NewObjectID(),
				TenantID:  tenantID,
				Type:      table.TypeTable,
				Name:      "Table 3",
				Zone:      "Terrace",
				Seats:     6,
				QRSlug:    "the-grand-bistro-t3",
				Status:    table.StatusAvailable,
				CreatedAt: now,
				UpdatedAt: now,
			},
		}
		_, _ = tablesColl.InsertMany(ctx, sampleTables)
		log.Info("🌱 Seeded initial tables for demo tenant")
	}

	return nil
}
