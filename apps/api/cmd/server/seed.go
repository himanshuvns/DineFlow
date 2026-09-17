package main

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/dineflow/api/internal/domain/menu"
	domainplat "github.com/dineflow/api/internal/domain/platform"
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
	categoriesColl := db.Collection("menu_categories")
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
			Phone:       "+919876543210",
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
				zap.String("phone", "+919876543210"),
				zap.String("email", demoEmail),
				zap.String("password", "DineFlow@2026"),
				zap.String("tenantSlug", demoTenant.Slug),
			)
		}
	} else {
		var existingUser user.User
		if err := usersColl.FindOne(ctx, bson.M{"email": demoEmail}).Decode(&existingUser); err == nil {
			tenantID = existingUser.TenantID
			// Ensure phone is set on existing demo user
			_, _ = usersColl.UpdateOne(ctx, bson.M{"_id": existingUser.ID}, bson.M{
				"$set": bson.M{
					"phone":              "+919876543210",
					"auth.phoneVerified": true,
				},
			})
		}
	}

	if tenantID.IsZero() {
		return nil
	}

	// Also ensure default UI login account admin@dineflow.io exists
	adminCount, _ := usersColl.CountDocuments(ctx, bson.M{"email": "admin@dineflow.io"})
	if adminCount == 0 {
		adminHash, _ := bcrypt.GenerateFromPassword([]byte("Password123!"), bcrypt.DefaultCost)
		adminUser := user.User{
			ID:          bson.NewObjectID(),
			TenantID:    tenantID,
			Phone:       "+919999999999",
			Email:       "admin@dineflow.io",
			Name:        "Laurent Bistro Admin",
			Role:        user.RoleOwner,
			Permissions: user.DefaultPermissionsForRole(user.RoleOwner),
			Auth: user.Auth{
				PasswordHash:  string(adminHash),
				EmailVerified: true,
				PhoneVerified: true,
			},
			Status:    user.StatusActive,
			CreatedAt: time.Now().UTC(),
			UpdatedAt: time.Now().UTC(),
		}
		if _, err := usersColl.InsertOne(ctx, adminUser); err == nil {
			log.Info("🌱 Seeded admin@dineflow.io demo account",
				zap.String("phone", "+919999999999"),
				zap.String("password", "Password123!"),
			)
		}
	} else {
		// Ensure phone is set on existing admin user
		_, _ = usersColl.UpdateOne(ctx, bson.M{"email": "admin@dineflow.io"}, bson.M{
			"$set": bson.M{
				"phone":              "+919999999999",
				"auth.phoneVerified": true,
			},
		})
	}

	// Also ensure Platform Super Admin account superadmin@dineflow.io exists
	superAdminCount, _ := usersColl.CountDocuments(ctx, bson.M{"email": "superadmin@dineflow.io"})
	if superAdminCount == 0 {
		superHash, _ := bcrypt.GenerateFromPassword([]byte("SuperAdmin@2026"), bcrypt.DefaultCost)
		superUser := user.User{
			ID:          bson.NewObjectID(),
			TenantID:    tenantID,
			Phone:       "+919888888888",
			Email:       "superadmin@dineflow.io",
			Name:        "Platform Super Admin",
			Role:        user.RoleSuperAdmin,
			Permissions: user.DefaultPermissionsForRole(user.RoleSuperAdmin),
			Auth: user.Auth{
				PasswordHash:  string(superHash),
				EmailVerified: true,
				PhoneVerified: true,
			},
			Status:    user.StatusActive,
			CreatedAt: time.Now().UTC(),
			UpdatedAt: time.Now().UTC(),
		}
		if _, err := usersColl.InsertOne(ctx, superUser); err == nil {
			log.Info("🌱 Seeded superadmin@dineflow.io account",
				zap.String("phone", "+919888888888"),
				zap.String("password", "SuperAdmin@2026"),
			)
		}
	} else {
		_, _ = usersColl.UpdateOne(ctx, bson.M{"email": "superadmin@dineflow.io"}, bson.M{
			"$set": bson.M{
				"role":               user.RoleSuperAdmin,
				"phone":              "+919888888888",
				"auth.phoneVerified": true,
			},
		})
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

	// Seed multi-tenant enterprise platform data (tenants, subscriptions, invoices, tickets, audit logs)
	if err := seedPlatformData(ctx, db, log); err != nil {
		log.Warn("Failed to seed platform data", zap.Error(err))
	}

	return nil
}

// seedPlatformData populates all enterprise multi-tenant records across the platform
func seedPlatformData(ctx context.Context, db *mongoinfra.Client, log *zap.Logger) error {
	tenantsColl := db.Collection("tenants")
	usersColl := db.Collection("users")
	invColl := db.Collection("invoices")
	ticketColl := db.Collection("support_tickets")
	auditColl := db.Collection("audit_logs")
	notifColl := db.Collection("platform_notifications")
	settingsColl := db.Collection("platform_settings")

	// Ensure platform settings singleton exists
	settingsCount, _ := settingsColl.CountDocuments(ctx, bson.M{"_id": "singleton"})
	if settingsCount == 0 {
		_, _ = settingsColl.InsertOne(ctx, domainplat.PlatformSettingsRecord{
			ID:               "singleton",
			MaintenanceMode:  false,
			DefaultTrialDays: 14,
			GlobalAnnouncement: domainplat.AnnouncementInfo{
				Active:  false,
				Message: "Scheduled platform maintenance window Sunday at 02:00 AM IST.",
				Type:    "info",
			},
			UpdatedAt: time.Now().UTC(),
		})
	}

	// Data definition for the 6 additional platform tenants
	type TenantSeedConfig struct {
		Name         string
		Slug         string
		BusinessType tenant.BusinessType
		Plan         tenant.Plan
		Status       tenant.Status
		City         string
		State        string
		OwnerName    string
		OwnerEmail   string
		OwnerPhone   string
	}

	extraTenants := []TenantSeedConfig{
		{
			Name:         "Taj Heritage Palace & Suites",
			Slug:         "taj-heritage-udaipur",
			BusinessType: tenant.BusinessTypeHotel,
			Plan:         tenant.PlanHotelPro,
			Status:       tenant.StatusActive,
			City:         "Udaipur",
			State:        "Rajasthan",
			OwnerName:    "Maharaj Vikram Singh",
			OwnerEmail:   "palace@tajheritage.com",
			OwnerPhone:   "+919829012345",
		},
		{
			Name:         "Le Petit Artisan Cafe",
			Slug:         "le-petit-cafe",
			BusinessType: tenant.BusinessTypeCafe,
			Plan:         tenant.PlanStarter,
			Status:       tenant.StatusActive,
			City:         "Bengaluru",
			State:        "Karnataka",
			OwnerName:    "Camille Dupont",
			OwnerEmail:   "camille@lepetit.co",
			OwnerPhone:   "+919845067890",
		},
		{
			Name:         "Seaside Haven Resort & Spa",
			Slug:         "seaside-haven-goa",
			BusinessType: tenant.BusinessTypeHotel,
			Plan:         tenant.PlanHotelPro,
			Status:       tenant.StatusActive, // grace period in UI
			City:         "Goa",
			State:        "Goa",
			OwnerName:    "Anthony Rodrigues",
			OwnerEmail:   "anthony@seasidehaven.com",
			OwnerPhone:   "+919822144556",
		},
		{
			Name:         "Urban Wok Cloud Kitchen",
			Slug:         "urban-wok-delhi",
			BusinessType: tenant.BusinessTypeCloudKitchen,
			Plan:         tenant.PlanGrowth,
			Status:       tenant.StatusActive,
			City:         "New Delhi",
			State:        "Delhi",
			OwnerName:    "Kunal Mehra",
			OwnerEmail:   "kunal@urbanwok.in",
			OwnerPhone:   "+919810088990",
		},
		{
			Name:         "Spice Garden Pure Veg",
			Slug:         "spice-garden-ahmedabad",
			BusinessType: tenant.BusinessTypeRestaurant,
			Plan:         tenant.PlanFree,
			Status:       tenant.StatusActive, // trial
			City:         "Ahmedabad",
			State:        "Gujarat",
			OwnerName:    "Harsh Patel",
			OwnerEmail:   "harsh@spicegarden.co.in",
			OwnerPhone:   "+919898011223",
		},
		{
			Name:         "Dhaba 1947 Heritage Kitchen",
			Slug:         "dhaba-1947-amritsar",
			BusinessType: tenant.BusinessTypeRestaurant,
			Plan:         tenant.PlanStarter,
			Status:       tenant.StatusSuspended,
			City:         "Amritsar",
			State:        "Punjab",
			OwnerName:    "Gurpreet Singh",
			OwnerEmail:   "gurpreet@dhaba1947.com",
			OwnerPhone:   "+919872099887",
		},
	}

	hash, _ := bcrypt.GenerateFromPassword([]byte("DineFlow@2026"), bcrypt.DefaultCost)
	now := time.Now().UTC()

	for _, cfg := range extraTenants {
		tCount, _ := tenantsColl.CountDocuments(ctx, bson.M{"slug": cfg.Slug})
		var tID bson.ObjectID
		if tCount == 0 {
			tID = bson.NewObjectID()
			tDoc := tenant.Tenant{
				ID:           tID,
				Slug:         cfg.Slug,
				Name:         cfg.Name,
				BusinessType: cfg.BusinessType,
				Plan:         cfg.Plan,
				Status:       cfg.Status,
				Timezone:     "Asia/Kolkata",
				Currency:     "INR",
				Country:      "IN",
				TaxRate:      5.0,
				Contact: tenant.Contact{
					Email:         cfg.OwnerEmail,
					Phone:         cfg.OwnerPhone,
					WhatsAppPhone: cfg.OwnerPhone,
				},
				Address: tenant.Address{
					Line1:   "Main Hospitality Avenue",
					City:    cfg.City,
					State:   cfg.State,
					Pincode: "400001",
					Country: "IN",
				},
				Settings: tenant.Settings{
					OrderingEnabled:        true,
					RequireGuestPhone:      false,
					AutoAcceptOrders:       true,
					PreparationTimeMinutes: 20,
					OrderingPageTheme:      "default",
					ItemUnavailableMode:    "gray_out",
				},
				Features: tenant.FeaturesForPlan(cfg.Plan),
				Limits:   tenant.LimitsForPlan(cfg.Plan),
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
				CreatedAt: now.AddDate(0, -3, 0),
				UpdatedAt: now,
			}
			_, _ = tenantsColl.InsertOne(ctx, tDoc)

			// Create Owner User
			uDoc := user.User{
				ID:          bson.NewObjectID(),
				TenantID:    tID,
				Phone:       cfg.OwnerPhone,
				Email:       cfg.OwnerEmail,
				Name:        cfg.OwnerName,
				Role:        user.RoleOwner,
				Permissions: user.DefaultPermissionsForRole(user.RoleOwner),
				Auth: user.Auth{
					PasswordHash:  string(hash),
					EmailVerified: true,
					PhoneVerified: true,
				},
				Status:    user.StatusActive,
				CreatedAt: now.AddDate(0, -3, 0),
				UpdatedAt: now,
			}
			_, _ = usersColl.InsertOne(ctx, uDoc)
		} else {
			var existingT tenant.Tenant
			_ = tenantsColl.FindOne(ctx, bson.M{"slug": cfg.Slug}).Decode(&existingT)
			tID = existingT.ID
		}

		// Ensure Invoices for this tenant
		invCount, _ := invColl.CountDocuments(ctx, bson.M{"tenantId": tID.Hex()})
		if invCount == 0 {
			price := 999.0
			planStr := domainplat.PlanTierStarter
			status := "paid"
			if cfg.Plan == tenant.PlanGrowth {
				price = 2999.0
				planStr = domainplat.PlanTierGrowth
			} else if cfg.Plan == tenant.PlanHotelPro {
				price = 7999.0
				planStr = domainplat.PlanTierHotelPro
			}
			if cfg.Slug == "seaside-haven-goa" || cfg.Slug == "dhaba-1947-amritsar" {
				status = "failed"
			}

			invDoc := domainplat.RevenueInvoice{
				ID:            bson.NewObjectID().Hex(),
				TenantID:      tID.Hex(),
				ClientName:    cfg.Name,
				InvoiceNumber: fmt.Sprintf("INV-2026-%d", time.Now().Unix()%1000+int64(len(cfg.Name))),
				Plan:          planStr,
				Amount:        price,
				Currency:      "INR",
				Status:        status,
				PaymentMethod: "Auto-Debit NetBanking (•••• 4912)",
				Date:          now.Format("2006-01-02"),
				DueDate:       now.Format("2006-01-02"),
				CreatedAt:     now,
			}
			_, _ = invColl.InsertOne(ctx, invDoc)
		}
	}

	// Seed Sample Support Tickets
	ticketCount, _ := ticketColl.CountDocuments(ctx, bson.M{})
	if ticketCount == 0 {
		var grandBistro tenant.Tenant
		_ = tenantsColl.FindOne(ctx, bson.M{"slug": "the-grand-bistro"}).Decode(&grandBistro)

		tickets := []interface{}{
			domainplat.SupportTicketRecord{
				ID:            bson.NewObjectID(),
				TicketID:      "TCK-481",
				TenantID:      grandBistro.ID,
				TenantName:    "The Grand Bistro & Rooftop",
				Subject:       "Webhook delivery failure for WhatsApp invoices",
				Description:   "Invoices created at check-out are not delivering to international guest numbers.",
				Priority:      "high",
				Status:        "open",
				Category:      "whatsapp",
				AssignedAgent: "Aarav Sharma",
				InternalNotes: []string{"Checked Meta Cloud API log. Client token expired yesterday."},
				CreatedAt:     now.Add(-2 * time.Hour),
				UpdatedAt:     now,
			},
			domainplat.SupportTicketRecord{
				ID:            bson.NewObjectID(),
				TicketID:      "TCK-480",
				TenantID:      grandBistro.ID,
				TenantName:    "Taj Heritage Palace & Suites",
				Subject:       "Requesting additional 50 room stands bulk PDF",
				Description:   "Opening new royal wing next week, need custom gold border tent QR stands.",
				Priority:      "medium",
				Status:        "in_progress",
				Category:      "hardware",
				AssignedAgent: "Priya Nair",
				InternalNotes: []string{"Generated high-DPI SVG template with royal gold hex code."},
				CreatedAt:     now.Add(-24 * time.Hour),
				UpdatedAt:     now,
			},
			domainplat.SupportTicketRecord{
				ID:            bson.NewObjectID(),
				TicketID:      "TCK-478",
				TenantID:      grandBistro.ID,
				TenantName:    "Spice Garden Pure Veg",
				Subject:       "Assistance importing 40 items from Swiggy menu PDF",
				Description:   "AI menu writer completed 80%, need review on Jain dietary tags.",
				Priority:      "low",
				Status:        "resolved",
				Category:      "onboarding",
				AssignedAgent: "Rohan Varma",
				InternalNotes: []string{"Manual verification completed and verified all 42 items as pure veg."},
				CreatedAt:     now.Add(-48 * time.Hour),
				UpdatedAt:     now,
			},
		}
		_, _ = ticketColl.InsertMany(ctx, tickets)
	}

	// Seed Sample Audit Logs
	auditCount, _ := auditColl.CountDocuments(ctx, bson.M{})
	if auditCount == 0 {
		adminActor := domainplat.AuditActor{
			Name:  "Platform Super Admin",
			Email: "superadmin@dineflow.io",
			Role:  "super_admin",
		}
		logs := []interface{}{
			domainplat.AuditLogRecord{
				ID:         bson.NewObjectID(),
				Timestamp:  now.Add(-1 * time.Hour),
				Actor:      adminActor,
				Action:     "client.plan_override",
				Category:   "subscription",
				TargetName: "Taj Heritage Palace & Suites",
				IPAddress:  "157.34.120.91",
				Details:    "Assigned enterprise Hotel Pro license tier with 140 rooms quota.",
			},
			domainplat.AuditLogRecord{
				ID:         bson.NewObjectID(),
				Timestamp:  now.Add(-5 * time.Hour),
				Actor:      adminActor,
				Action:     "client.trial_extended",
				Category:   "client",
				TargetName: "Spice Garden Pure Veg",
				IPAddress:  "103.21.124.4",
				Details:    "Extended trial by 14 days upon request from client owner.",
			},
			domainplat.AuditLogRecord{
				ID:         bson.NewObjectID(),
				Timestamp:  now.Add(-20 * time.Hour),
				Actor:      adminActor,
				Action:     "client.impersonation_started",
				Category:   "security",
				TargetName: "The Grand Bistro & Rooftop",
				IPAddress:  "157.34.120.91",
				Details:    "Started verified impersonation session to inspect KDS station dispatch.",
			},
		}
		_, _ = auditColl.InsertMany(ctx, logs)
	}

	// Seed Sample Platform Notifications
	notifCount, _ := notifColl.CountDocuments(ctx, bson.M{})
	if notifCount == 0 {
		notifs := []interface{}{
			domainplat.PlatformNotificationRecord{
				ID:        bson.NewObjectID(),
				Type:      "tenant_signup",
				Title:     "New Client Onboarded",
				Message:   "Spice Garden Pure Veg registered on Trial tier.",
				Target:    "/platform/clients",
				Read:      false,
				CreatedAt: now.Add(-30 * time.Minute),
			},
			domainplat.PlatformNotificationRecord{
				ID:        bson.NewObjectID(),
				Type:      "payment_failed",
				Title:     "Subscription Payment Failed",
				Message:   "Seaside Haven Resort & Spa monthly auto-debit renewal declined.",
				Target:    "/platform/revenue",
				Read:      false,
				CreatedAt: now.Add(-2 * time.Hour),
			},
			domainplat.PlatformNotificationRecord{
				ID:        bson.NewObjectID(),
				Type:      "system_alert",
				Title:     "Infrastructure Telemetry Healthy",
				Message:   "All 6 distributed microservices and third-party APIs responding within SLA.",
				Target:    "/platform/system-health",
				Read:      true,
				CreatedAt: now.Add(-6 * time.Hour),
			},
		}
		_, _ = notifColl.InsertMany(ctx, notifs)
	}

	log.Info("🌱 Seeded production multi-tenant platform records")
	return nil
}

// runStartupCleanup removes orphaned documents and compacts MongoDB collections
// to reclaim disk space on the Railway volume. It is non-fatal and runs in the background.
func runStartupCleanup(ctx context.Context, db *mongoinfra.Client, log *zap.Logger) error {
	log.Info("🧹 Starting MongoDB disk cleanup...")

	tenantsColl := db.Collection("tenants")
	usersColl := db.Collection("users")

	// ── Remove orphaned tenants (no matching owner user) ───────────────────
	cursor, err := tenantsColl.Find(ctx, bson.M{})
	if err != nil {
		return err
	}
	var tenants []struct {
		ID   bson.ObjectID `bson:"_id"`
		Name string        `bson:"name"`
		Slug string        `bson:"slug"`
	}
	if err := cursor.All(ctx, &tenants); err != nil {
		return err
	}

	var orphanedIDs []bson.ObjectID
	for _, t := range tenants {
		count, err := usersColl.CountDocuments(ctx, bson.M{"tenantId": t.ID})
		if err != nil {
			continue
		}
		if count == 0 {
			log.Info("🗑️  Removing orphaned tenant", zap.String("slug", t.Slug), zap.String("name", t.Name))
			orphanedIDs = append(orphanedIDs, t.ID)
		}
	}
	if len(orphanedIDs) > 0 {
		res, err := tenantsColl.DeleteMany(ctx, bson.M{"_id": bson.M{"$in": orphanedIDs}})
		if err != nil {
			log.Warn("Failed to delete orphaned tenants", zap.Error(err))
		} else {
			log.Info("🗑️  Deleted orphaned tenants", zap.Int64("count", res.DeletedCount))
		}
	}

	// ── Remove stale unverified users (invited, older than 24h) ────────────
	cutoff := time.Now().UTC().Add(-24 * time.Hour)
	res, err := usersColl.DeleteMany(ctx, bson.M{
		"status":    "invited",
		"createdAt": bson.M{"$lt": cutoff},
	})
	if err != nil {
		log.Warn("Failed to delete stale unverified users", zap.Error(err))
	} else if res.DeletedCount > 0 {
		log.Info("🗑️  Deleted stale unverified users", zap.Int64("count", res.DeletedCount))
	}

	// ── Compact all collections to reclaim disk ─────────────────────────────
	collections := []string{"tenants", "users", "menu_items", "menu_categories", "tables", "orders", "qr_codes"}
	for _, coll := range collections {
		var result bson.M
		err := db.DB().RunCommand(ctx, bson.D{{Key: "compact", Value: coll}}).Decode(&result)
		if err != nil {
			log.Warn("Compact failed (non-fatal)", zap.String("collection", coll), zap.Error(err))
		} else {
			log.Info("✅ Compacted collection", zap.String("collection", coll))
		}
	}

	log.Info("🧹 MongoDB disk cleanup complete")
	return nil
}

