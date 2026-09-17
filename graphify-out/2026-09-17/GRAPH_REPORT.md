# Graph Report - DineFlow  (2026-09-17)

## Corpus Check
- 242 files · ~297,209 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .example 2, .toml 1)

## Summary
- 2020 nodes · 5295 edges · 124 communities (88 shown, 36 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e76fc706`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- github.com/gin-gonic/gin.Context
- react
- lucide-react
- Service
- whatsapp/whatsapp.go
- go_pkg_time
- server/main.go
- NewScope
- go.mongodb.org/mongo-driver/v2/bson.ObjectID
- DineFlow — Questions, Assumptions & Risks
- ai/service.go
- ref_next_server
- 2. Functional Requirements
- utils.ts
- go_pkg_go_mongodb_org_mongo_driver_v2_bson
- config.go
- menu/page.tsx
- main
- Service
- DineFlow — UI/UX Guidelines
- GetTenantID
- Subscription
- Order
- cn
- web/package.json
- Scope
- whatsapp/service.go
- BadRequest
- handlers/room.go
- dependencies
- compilerOptions
- app/layout.tsx
- tasks
- useToast
- components.json
- OK
- package.json
- notification-center.tsx
- DineFlow — Development Plan
- order/service.go
- devDependencies
- scripts
- Service
- Setup
- DineFlow — System Architecture
- demo.tsx
- DineFlow — API Strategy
- eslint.config.mjs
- scripts
- web/vercel.json
- vercel.json
- peeking-chef.tsx
- next
- postcss.config.mjs
- github.com/dineflow/api
- printer.go
- time.Time
- DineFlow — Subscription Model
- ui/pricing.tsx
- staff/page.tsx
- Collections
- Service
- context.Context
- DineFlow — Feature Roadmap
- DineFlow — Product Vision
- README.md
- DineFlow
- Audit Scope & Checklist
- Responsive Verification Checklist
- Security Checklist
- Section 2 — Product Requirements
- Architectural Assessment Dimensions
- Review Pillars
- Phase 2 — Restaurant MVP
- SubscriptionHandler
- DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)
- Code Quality Standards
- generate-logo/route.ts
- DineFlow — Antigravity (`agy`) Workspace Rules
- gemini-logo-modal.tsx
- menu-nlp-engine.ts
- theme-provider.tsx
- Ponytail: Anti-Overengineering & YAGNI Guardrails
- Ponytail Technical Debt Analysis
- Ponytail Configuration & Status
- web/README.md
- handlers/menu.go
- Section 7 — Feature-Specific Risks
- NotificationHandler
- Graphify Knowledge Graph Query
- Graphify Knowledge Graph Generation
- Graphify Incremental Update
- OmniRoute Model Routing & Fallback Chains
- OmniRoute AI Gateway Management
- Ponytail Codebase Audit
- Ponytail Code Review: Anti-Overengineering & YAGNI
- AGENTS.md
- graphify/rules/AGENTS.md
- omniroute/rules/AGENTS.md
- rules/graphify.md
- workflows/graphify.md
- web/AGENTS.md
- TubesCursor
- Section 3 — Subscription & Billing
- Grace Period & Downgrade Automation
- Section 6 — Security & Compliance
- scan/route.ts
- indian-food-database.ts
- tasks/route.ts
- extend-stay/route.ts
- White-Label Strategy
- search/service.go

## God Nodes (most connected - your core abstractions)
1. `GetTenantID()` - 109 edges
2. `OK()` - 107 edges
3. `Unauthorized()` - 105 edges
4. `BadRequest()` - 104 edges
5. `react` - 78 edges
6. `useToast()` - 71 edges
7. `cn()` - 70 edges
8. `NewScope()` - 59 edges
9. `lucide-react` - 57 edges
10. `InternalError()` - 51 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `seedDefaultData()`  [INFERRED]
  apps/api/cmd/server/main.go → apps/api/cmd/server/seed.go
- `main()` --calls--> `SetHealthDeps()`  [EXTRACTED]
  apps/api/cmd/server/main.go → apps/api/internal/interfaces/http/handlers/health.go
- `UpdateOrderStatusRequest` --references--> `OrderStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/order.go → apps/api/internal/domain/order/order.go
- `TestGenerateKOTText()` --calls--> `GenerateKOTText()`  [INFERRED]
  apps/api/internal/domain/printer/printer_test.go → apps/api/internal/domain/printer/printer.go
- `TestGenerateBillText()` --calls--> `GenerateBillText()`  [INFERRED]
  apps/api/internal/domain/printer/printer_test.go → apps/api/internal/domain/printer/printer.go

## Import Cycles
- None detected.

## Communities (124 total, 36 thin omitted)

### Community 0 - "github.com/gin-gonic/gin.Context"
Cohesion: 0.09
Nodes (20): AIHandler, clearRefreshTokenCookie(), AuthHandler, setRefreshTokenCookie(), TenantHandler, ByTenant(), PlanLimitMiddleware(), Conflict() (+12 more)

### Community 1 - "react"
Cohesion: 0.06
Nodes (35): LoginPage(), RegisterPage(), BUSINESS_CATEGORIES, BusinessCategory, BusinessCategorySelector(), BusinessCategorySelectorProps, ChefMascot(), ChefMascotProps (+27 more)

### Community 2 - "lucide-react"
Cohesion: 0.10
Nodes (46): INITIAL_TENANTS, TenantRecord, DAYS, ForecastPage(), generateForecast(), getIntensityClass(), HOURS, INSIGHTS (+38 more)

### Community 3 - "Service"
Cohesion: 0.06
Nodes (37): seedDefaultData(), generateSlug(), FeaturesForPlan(), BusinessType, Tenant, LimitsForPlan(), Config, redis.Client (+29 more)

### Community 4 - "whatsapp/whatsapp.go"
Cohesion: 0.11
Nodes (28): BuildFeedbackRequestMessage(), BuildKitchenReadyMessage(), BuildOrderConfirmationMessage(), GetStandardTemplates(), TestBuildOrderConfirmationMessage(), TestGetStandardTemplates(), Campaign, CampaignStats (+20 more)

### Community 5 - "go_pkg_time"
Cohesion: 0.06
Nodes (51): CategoryShare, HourlyPoint, OverviewMetrics, TopItemMetric, NewService(), NewService(), NewService(), NewService() (+43 more)

### Community 6 - "server/main.go"
Cohesion: 0.06
Nodes (40): corsMiddleware(), NewAIHandler(), NewAnalyticsHandler(), NewAuthHandler(), Health(), SetHealthDeps(), Version(), NewNotificationHandler() (+32 more)

### Community 7 - "NewScope"
Cohesion: 0.08
Nodes (15): NewScope(), buildMenuItemFromUpsertRequest(), Category, MenuItem, Service, NotificationEmitter, Service, AttendanceRecord (+7 more)

### Community 8 - "go.mongodb.org/mongo-driver/v2/bson.ObjectID"
Cohesion: 0.12
Nodes (17): TestIndianPhoneValidation(), ValidateAndNormalizeIndianPhone(), go.mongodb.org/mongo-driver/v2/bson.ObjectID, CreateTaskRequest, UpdateRoomStatusRequest, UpdateTaskRequest, Guest, GuestStatus (+9 more)

### Community 9 - "DineFlow — Questions, Assumptions & Risks"
Cohesion: 0.11
Nodes (18): A1. Backend Language: Go vs. Node.js, A2. Monorepo Tool: Turborepo vs. Nx, A3. Database: MongoDB Only vs. MongoDB + PostgreSQL, A4. Frontend Framework: Next.js App Router vs. Pages Router, A5. WebSocket: Socket.io vs. Native WebSocket, DineFlow — Questions, Assumptions & Risks, O1. Deployment platform, O2. Primary deployment region? (+10 more)

### Community 10 - "ai/service.go"
Cohesion: 0.13
Nodes (24): ChatbotMessage, ChatbotResponse, ChatTurn, ForecastDay, ForecastHour, ForecastResponse, geminiRequest, geminiResponse (+16 more)

### Community 11 - "ref_next_server"
Cohesion: 0.13
Nodes (7): dynamic, revalidate, dynamic, dynamic, revalidate, config, ref_next_server

### Community 12 - "2. Functional Requirements"
Cohesion: 0.06
Nodes (33): 1. User Personas, 2.10 Staff Management, 2.11 WhatsApp Integration, 2.12 Analytics & Reporting, 2.13 Settings & Configuration, 2.1 Authentication & Multi-Tenancy, 2.2 Subscription & Billing, 2.3 Onboarding (+25 more)

### Community 13 - "utils.ts"
Cohesion: 0.10
Nodes (32): getStayMetrics(), HotelStats, RoomItem, RoomsDirectoryPage(), getStayMetrics(), HousekeepingTask, RoomDetail, RoomDetailPage() (+24 more)

### Community 14 - "go_pkg_go_mongodb_org_mongo_driver_v2_bson"
Cohesion: 0.07
Nodes (38): TestSearchScenarios(), NewService(), TestSearchAll_EmptyQuery(), TestSearchAll_ShortQuery(), NewService(), TestApplyLeave_Validation(), TestCreateHoliday_Validation(), TestCreateShift_Validation() (+30 more)

### Community 15 - "config.go"
Cohesion: 0.10
Nodes (24): getEnv(), getEnvInt(), Load(), requireEnv(), Maker, NewMaker(), TestTokenMaker(), AIConfig (+16 more)

### Community 16 - "menu/page.tsx"
Cohesion: 0.08
Nodes (45): IMAGE_PRESETS, MenuManagementPage(), INITIAL_KDS_ORDERS, KdsItem, KdsOrder, KDSOrdersPage(), MENU_PRESETS, DashboardOverviewPage() (+37 more)

### Community 17 - "main"
Cohesion: 0.10
Nodes (16): main(), requestLogger(), runStartupCleanup(), NewService(), New(), Client, New(), NewTenantHandler() (+8 more)

### Community 18 - "Service"
Cohesion: 0.14
Nodes (10): cleanGuestName(), cleanOrderNumber(), cleanTableName(), CreateNotificationRequest, Category, CreateNotificationInput, ListFilter, Notification (+2 more)

### Community 19 - "DineFlow — UI/UX Guidelines"
Cohesion: 0.04
Nodes (44): 10. Responsive Breakpoints, 11. Iconography, 12. Empty States, 13. Toast / Notification System, 1. Design Philosophy, 2. Color Palette, 3. Typography, 4. Spacing System (+36 more)

### Community 20 - "GetTenantID"
Cohesion: 0.11
Nodes (6): AnalyticsHandler, MenuHandler, StaffHandler, GetTenantID(), GetUserID(), Unauthorized()

### Community 21 - "Subscription"
Cohesion: 0.17
Nodes (12): FormatPlanName(), GetLimits(), AdminOverrideRequest, CheckoutRequest, BillingCycle, Invoice, PlanLimits, PlanTier (+4 more)

### Community 22 - "Order"
Cohesion: 0.20
Nodes (9): Order, DestinationType, OrderItem, OrderItemModifier, OrderSource, OrderStatus, OrderTimeline, PaymentStatus (+1 more)

### Community 23 - "cn"
Cohesion: 0.09
Nodes (33): DashboardLayout(), SettingsPage(), CATEGORY_CONFIG, FILTER_CHIPS, GlobalSearch(), renderDropdownContent(), renderFilterChips(), QUICK_ACTIONS (+25 more)

### Community 24 - "web/package.json"
Cohesion: 0.09
Nodes (22): typescript, name, packageManager, private, version, axios, clsx, eslint (+14 more)

### Community 25 - "Scope"
Cohesion: 0.17
Nodes (9): ensureUpdatedAt(), go.mongodb.org/mongo-driver/v2/bson.M, go.mongodb.org/mongo-driver/v2/mongo.Collection, go.mongodb.org/mongo-driver/v2/mongo.Cursor, go.mongodb.org/mongo-driver/v2/mongo.DeleteResult, go.mongodb.org/mongo-driver/v2/mongo.InsertManyResult, go.mongodb.org/mongo-driver/v2/mongo.InsertOneResult, go.mongodb.org/mongo-driver/v2/mongo.UpdateResult (+1 more)

### Community 26 - "whatsapp/service.go"
Cohesion: 0.12
Nodes (16): NewService(), GetHub(), NewWhatsAppHandler(), go_pkg_bytes, go_pkg_encoding_json, go_pkg_github_com_dineflow_api_internal_application_whatsapp, go_pkg_github_com_dineflow_api_internal_domain_whatsapp, go_pkg_github_com_joho_godotenv (+8 more)

### Community 27 - "BadRequest"
Cohesion: 0.14
Nodes (4): RoomHandler, BadRequest(), Created(), NotFound()

### Community 28 - "handlers/room.go"
Cohesion: 0.09
Nodes (21): StorageService, NewService(), TestStorageValidation(), NewRoomHandler(), StorageHandler, NewStorageHandler(), go_pkg_crypto_sha256, go_pkg_encoding_base64 (+13 more)

### Community 29 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, axios, canvas-confetti, class-variance-authority, clsx, framer-motion, lucide-react, next (+11 more)

### Community 30 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 31 - "app/layout.tsx"
Cohesion: 0.18
Nodes (9): apps_web_app_globals, manrope, metadata, plusJakarta, spaceGrotesk, viewport, QueryProvider(), ref_next_font_google (+1 more)

### Community 32 - "tasks"
Cohesion: 0.11
Nodes (17): dependsOn, inputs, outputs, cache, cache, persistent, dependsOn, $schema (+9 more)

### Community 33 - "useToast"
Cohesion: 0.07
Nodes (31): PlatformAdminPage(), ForgotPasswordPage(), ResetPasswordPage(), VerifyContent(), getDescription(), MenuWriterPage(), PricingAlertsPage(), UpsellPage() (+23 more)

### Community 34 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 35 - "OK"
Cohesion: 0.13
Nodes (4): AuthHandler, TableHandler, WhatsAppHandler, OK()

### Community 36 - "package.json"
Cohesion: 0.09
Nodes (21): description, devDependencies, prettier, turbo, typescript, engines, node, typescript (+13 more)

### Community 37 - "notification-center.tsx"
Cohesion: 0.15
Nodes (20): CATEGORIES, CATEGORY_META, NotificationsPage(), PRIORITIES, PRIORITY_BADGE, timeAgo(), CATEGORIES, CATEGORY_META (+12 more)

### Community 38 - "DineFlow — Development Plan"
Cohesion: 0.07
Nodes (30): 1.1 — Monorepo Setup, 1.2 — Backend Foundation (Go), 1.3 — Authentication Service, 1.4 — Multi-Tenancy Middleware, 1.5 — Frontend Foundation (Next.js), 1.6 — File Storage, 1.7 — Email Service, 2.1 — Onboarding (+22 more)

### Community 39 - "order/service.go"
Cohesion: 0.11
Nodes (16): NewService(), NewService(), Hub, NewOrderHandler(), NewTableHandler(), go_pkg_github_com_dineflow_api_internal_application_table, go_pkg_github_com_dineflow_api_internal_domain_table, go_pkg_math_rand (+8 more)

### Community 40 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti, @types/node, @types/react (+2 more)

### Community 41 - "scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, test, version

### Community 42 - "Service"
Cohesion: 0.21
Nodes (5): CreateTableRequest, LocationType, Service, Table, TableStatus

### Community 43 - "Setup"
Cohesion: 0.16
Nodes (15): OrderHandler, Auth(), GetRole(), GetTokenID(), RateLimit(), ChefOrAbove(), OwnerOnly(), OwnerOrManager() (+7 more)

### Community 44 - "DineFlow — System Architecture"
Cohesion: 0.07
Nodes (27): Application Structure, Architecture Philosophy, Backend Architecture, Clean Architecture Dependency Flow, Customer Ordering Page — SSG + ISR, Database Architecture, Deployment Architecture, Deployment Pipeline (+19 more)

### Community 46 - "DineFlow — API Strategy"
Cohesion: 0.08
Nodes (24): API Design Principles, API Rate Limits, Base URLs, Client → Server (Actions), DineFlow — API Strategy, Module 10 — Menu Items, Module 11 — Modifier Groups, Module 12 — Customer Ordering (Public API — No Auth) (+16 more)

### Community 47 - "eslint.config.mjs"
Cohesion: 0.40
Nodes (4): eslintConfig, ref_eslint_config, ref_eslint_config_next_core_web_vitals, ref_eslint_config_next_typescript

### Community 48 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 49 - "web/vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, framework, installCommand, $schema

### Community 50 - "vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, framework, installCommand, $schema

### Community 55 - "printer.go"
Cohesion: 0.16
Nodes (14): centerText(), GenerateBillText(), GenerateKOTText(), padRow(), truncate(), NewService(), Service, go_pkg_github_com_resend_resend_go_v2 (+6 more)

### Community 56 - "time.Time"
Cohesion: 0.16
Nodes (21): CalculateDistanceMeters(), DefaultPermissionsForRole(), PublicProfile, User, TestCalculateDistanceMeters(), time.Time, UpdateStaffRequest, InviteStaffInput (+13 more)

### Community 57 - "DineFlow — Subscription Model"
Cohesion: 0.11
Nodes (18): Billing Cycle Options, Billing Mechanics, DineFlow — Subscription Model, Enforcement Layers, Feature Flag System, 🆓 Free — "Just Getting Started", 📈 Growth — "Scaling Up" — ₹2,999/month, 🏨 Hotel Pro — "Enterprise Hospitality" — ₹7,999/month (+10 more)

### Community 58 - "ui/pricing.tsx"
Cohesion: 0.13
Nodes (15): COMPARISON_ROWS, PLANS, PlanTier, PricingPage(), buttonVariants, Label, labelVariants, Pricing() (+7 more)

### Community 59 - "staff/page.tsx"
Cohesion: 0.15
Nodes (13): AttendanceRecord, BankDetails, calculateDistanceM(), EmergencyContact, GeofenceConfig, Holiday, LeaveBalance, LeaveRequest (+5 more)

### Community 60 - "Collections"
Cohesion: 0.13
Nodes (15): Collection: `audit_logs`, Collection: `categories`, Collection: `locations`, Collection: `menu_items`, Collection: `menus`, Collection: `modifier_groups`, Collection: `notifications`, Collection: `orders` (+7 more)

### Community 62 - "context.Context"
Cohesion: 0.16
Nodes (10): IsOptOutKeyword(), ParseRating(), context.Context, CustomerInvoice, MessageLog, MessageStatus, NotificationEmitter, Service (+2 more)

### Community 63 - "DineFlow — Feature Roadmap"
Cohesion: 0.15
Nodes (13): Cross-Phase Dependencies Map, Deliverables, Deliverables, DineFlow — Feature Roadmap, Overview, Phase 0 — Planning & Architecture, Phase 1 — Foundation & Infrastructure, Phase 3 — Hotel Module (+5 more)

### Community 64 - "DineFlow — Product Vision"
Cohesion: 0.09
Nodes (21): Business Metrics (12-Month Targets), Competitive Landscape, Customer Experience Metrics, DineFlow — Product Vision, Long-Term Vision (3–5 Years), Mission, Primary Segments, Problem 1 — Fragmented Software Stack (+13 more)

### Community 65 - "README.md"
Cohesion: 0.18
Nodes (5): Data Retention Policy, Design Principles, DineFlow — Database Design, Entity Relationship Overview, Index Strategy Summary

### Community 66 - "DineFlow"
Cohesion: 0.18
Nodes (11): 1. Clone & Install, 2. Configure Environment, 3. Run Development Servers, 4. Health Check, Development Status, DineFlow, Documentation, Getting Started (+3 more)

### Community 67 - "Audit Scope & Checklist"
Cohesion: 0.20
Nodes (9): 1. Visual Hierarchy & Spacing, 2. Light & Dark Theme Contrast, 3. Interactive States & Affordance, 4. Forms & Validation, 5. Modals, Sheets & Dropdowns, 6. Empty & Error States, Audit Scope & Checklist, Report Template (+1 more)

### Community 68 - "Responsive Verification Checklist"
Cohesion: 0.22
Nodes (8): 1. Viewport & Breakpoint Alignment, 2. Horizontal Overflow Elimination, 3. Touch Targets & Mobile Ergonomics, 4. Navigation & Modals on Small Screens, 5. Responsive Data Tables & Lists, 6. Sticky Footers & Action Bars, Responsive Layout Diagnosis & Fix Runbook, Responsive Verification Checklist

### Community 69 - "Security Checklist"
Cohesion: 0.22
Nodes (8): 1. Tenant Data Isolation (Crucial), 2. Authentication & Session Management, 3. Role-Based Access Control (RBAC), 4. Input Sanitization & Injection Defense, 5. Rate Limiting & Abuse Prevention, 6. Secrets & Environment Protection, Multi-Tenant SaaS Security Audit Runbook, Security Checklist

### Community 70 - "Section 2 — Product Requirements"
Cohesion: 0.22
Nodes (9): P1. What counts as a "table" for food trucks?, P2. Customer phone number at checkout, P3. Can a customer order multiple rounds from the same table?, P4. Online payment model, P5. Unavailable item display, P6. What is the order cancellation policy?, P7. Split billing, P8. What is the ordering flow for hotel room service after midnight? (+1 more)

### Community 71 - "Architectural Assessment Dimensions"
Cohesion: 0.25
Nodes (7): 1. Monorepo & Service Boundaries, 2. Database Design & Indexing, 3. Caching & State Distribution, 4. Reliability & High Availability, 5. Observability & Tracing, Architectural Assessment Dimensions, System Architecture & Scalability Review

### Community 72 - "Review Pillars"
Cohesion: 0.25
Nodes (7): 1. Tenant Provisioning & Lifecycle, 2. Subscription Tiers & Feature Gates, 3. Data Partitioning & Soft Delete, 4. Financial & Payment Idempotency, 5. Multi-Tenant Event & Notification Architecture, Multi-Tenant SaaS Architecture & Business Review, Review Pillars

### Community 73 - "Phase 2 — Restaurant MVP"
Cohesion: 0.25
Nodes (8): 2A — Business Onboarding, 2B — Menu Management, 2C — QR Code System, 2D — Customer Ordering Experience, 2E — Order Management (Staff Dashboard), 2F — Kitchen Display System, 2G — Basic Analytics, Phase 2 — Restaurant MVP

### Community 75 - "DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)"
Cohesion: 0.25
Nodes (7): 1. Overview & Vision, 2. End-to-End Pipeline Architecture, 3.1 Inbound WhatsApp Webhook (`POST /webhooks/whatsapp`), 3.2 Staging Collection (`menu_imports_staging`), 3. Webhook Payload & Data Schema, 4. Security, Multi-Tenancy & Privacy Controls, DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)

### Community 76 - "Code Quality Standards"
Cohesion: 0.29
Nodes (6): 1. TypeScript & React, 2. Go (Golang), 3. API & Data Access Hygiene, 4. Code Review Output Format, Code Quality Standards, Staff Engineer Code Review Runbook

### Community 77 - "generate-logo/route.ts"
Cohesion: 0.24
Nodes (11): ACTIVE_GEMINI_MODELS, ARCHETYPE_CONFIGS, createArchetypeLogo(), generateArchetypeProceduralSvg(), GenerateLogoRequest, generateWithGemini(), LogoVariation, maxDuration (+3 more)

### Community 78 - "DineFlow — Antigravity (`agy`) Workspace Rules"
Cohesion: 0.29
Nodes (6): Code Style, DineFlow — Antigravity (`agy`) Workspace Rules, Key Files, Project, Tech Stack, Workflow Rules

### Community 79 - "gemini-logo-modal.tsx"
Cohesion: 0.25
Nodes (7): BUSINESS_CATEGORIES, COLORS, GeminiLogoModal(), GeminiLogoModalProps, GENERATION_STATUS_STEPS, LogoVariation, VIBES

### Community 80 - "menu-nlp-engine.ts"
Cohesion: 0.38
Nodes (10): calculateSimilarity(), detectIsVeg(), enrichRawExtractedItems(), extractPrice(), inferCategory(), matchCatalogDish(), NON_VEG_PATTERNS, normalizeDishText() (+2 more)

### Community 81 - "theme-provider.tsx"
Cohesion: 0.33
Nodes (5): ResolvedTheme, Theme, ThemeContext, ThemeContextType, ThemeProvider()

### Community 82 - "Ponytail: Anti-Overengineering & YAGNI Guardrails"
Cohesion: 0.40
Nodes (4): Intensity Modes, Ponytail: Anti-Overengineering & YAGNI Guardrails, Red Flags / Prohibited Antipatterns, The 7-Rung Decision Ladder

### Community 83 - "Ponytail Technical Debt Analysis"
Cohesion: 0.50
Nodes (3): Actionable Output, Debt Detection Categories, Ponytail Technical Debt Analysis

### Community 84 - "Ponytail Configuration & Status"
Cohesion: 0.50
Nodes (3): Available Profiles, Ponytail Configuration & Status, Usage

### Community 85 - "web/README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 86 - "handlers/menu.go"
Cohesion: 0.17
Nodes (13): NewMenuHandler(), go_pkg_github_com_dineflow_api_internal_application_menu, BulkCreateItemsRequest, BulkDeleteItemsRequest, BulkUpdateItemsRequest, CreateCategoryRequest, ScanMenuRequest, ToggleStockRequest (+5 more)

### Community 87 - "Section 7 — Feature-Specific Risks"
Cohesion: 0.25
Nodes (8): R1. WhatsApp Template Approval Delays, R2. Razorpay Subscription Webhook Reliability, R3. Customer QR Page Load on Poor Network, R4. KDS Data Accuracy During API Downtime, R5. Multi-Tenant Data Breach (Tenant Isolation Failure), R6. WhatsApp Message Costs Exceeding Revenue, R7. Competitor Response, Section 7 — Feature-Specific Risks

### Community 115 - "Section 3 — Subscription & Billing"
Cohesion: 0.33
Nodes (6): B1. Free trial for new registrations, B2. How is proration handled on mid-cycle upgrades?, B3. Can a single tenant have multiple subscriptions (e.g., base plan + white-label add-on)?, B4. What currency should the Free plan's invoice show?, B5. Are there usage-based charges beyond the flat subscription?, Section 3 — Subscription & Billing

### Community 116 - "Grace Period & Downgrade Automation"
Cohesion: 0.40
Nodes (5): Downgrade Execution (Day 14), Grace Period & Downgrade Automation, Grace Period Flow, Grace Period Timeline, Reactivation after Downgrade

### Community 117 - "Section 6 — Security & Compliance"
Cohesion: 0.40
Nodes (5): S1. Is PCI-DSS compliance required in Phase 1?, S2. GDPR compliance — are EU customers expected in Phase 1?, S3. What data does DineFlow retain about end customers (guests)?, S4. Admin access to tenant data, Section 6 — Security & Compliance

### Community 118 - "scan/route.ts"
Cohesion: 0.33
Nodes (6): callGeminiVision(), GEMINI_MODELS, maxDuration, POST(), RawMenuItem, ScanMenuRequestBody

### Community 119 - "indian-food-database.ts"
Cohesion: 0.29
Nodes (5): INDIAN_CATEGORIES, INDIAN_DISH_CATALOG, IndianCategory, IndianDishEntry, OCR_TYPO_CORRECTIONS

### Community 122 - "White-Label Strategy"
Cohesion: 0.50
Nodes (4): Future: Platform License, What White-Label Does NOT Include, What White-Label Includes, White-Label Strategy

### Community 125 - "search/service.go"
Cohesion: 0.29
Nodes (8): SearchHandler, NewSearchHandler(), go_pkg_github_com_dineflow_api_internal_application_search, SearchFilterOptions, SearchResponse, SearchResultItem, SearchResultsGrouped, Service

## Knowledge Gaps
- **629 isolated node(s):** `github.com/dineflow/api`, `geminiRequest`, `geminiResponse`, `SendOTPRequest`, `ClockInRequest` (+624 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 755 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `useToast`, `lucide-react`, `notification-center.tsx`, `TubesCursor`, `utils.ts`, `gemini-logo-modal.tsx`, `menu/page.tsx`, `theme-provider.tsx`, `peeking-chef.tsx`, `cn`, `web/package.json`, `ui/pricing.tsx`, `staff/page.tsx`, `app/layout.tsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `main()` connect `main` to `Service`, `go_pkg_time`, `server/main.go`, `order/service.go`, `ai/service.go`, `Setup`, `go_pkg_go_mongodb_org_mongo_driver_v2_bson`, `config.go`, `handlers/menu.go`, `printer.go`, `whatsapp/service.go`, `handlers/room.go`, `search/service.go`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `Client` connect `main` to `github.com/gin-gonic/gin.Context`, `Service`, `go_pkg_time`, `order/service.go`, `NewScope`, `go.mongodb.org/mongo-driver/v2/bson.ObjectID`, `ai/service.go`, `Service`, `go_pkg_go_mongodb_org_mongo_driver_v2_bson`, `Service`, `search/service.go`, `Subscription`, `whatsapp/service.go`, `Service`, `context.Context`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `github.com/dineflow/api`, `geminiRequest`, `geminiResponse` to the rest of the system?**
  _629 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `github.com/gin-gonic/gin.Context` be split into smaller, more focused modules?**
  _Cohesion score 0.09082125603864734 - nodes in this community are weakly interconnected._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.06298701298701298 - nodes in this community are weakly interconnected._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.0968944099378882 - nodes in this community are weakly interconnected._