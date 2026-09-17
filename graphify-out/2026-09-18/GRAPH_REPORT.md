# Graph Report - DineFlow  (2026-09-18)

## Corpus Check
- 271 files · ~341,152 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .example 2, .toml 1)

## Summary
- 2265 nodes · 6288 edges · 129 communities (93 shown, 36 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a4e0db66`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- github.com/gin-gonic/gin.Context
- orders/page.tsx
- lucide-react
- redisKey
- useToast
- go_pkg_time
- server/main.go
- time.Time
- Service
- staff/page.tsx
- Service
- ref_next_server
- 2. Functional Requirements
- utils.ts
- testing.T
- config.go
- menu/page.tsx
- context.Context
- go.mongodb.org/mongo-driver/v2/bson.ObjectID
- DineFlow — UI/UX Guidelines
- BadRequest
- Subscription
- Order
- register/page.tsx
- web/package.json
- Scope
- whatsapp/service.go
- notifications/page.tsx
- storage/storage.go
- dependencies
- compilerOptions
- app/layout.tsx
- tasks
- useAuthStore
- components.json
- main
- package.json
- OK
- DineFlow — Development Plan
- react
- devDependencies
- scripts
- whatsapp/page.tsx
- Service
- DineFlow — System Architecture
- tenant/tenant.go
- DineFlow — API Strategy
- eslint.config.mjs
- scripts
- web/vercel.json
- vercel.json
- peeking-chef.tsx
- Maker
- postcss.config.mjs
- github.com/dineflow/api
- printer.go
- Client
- DineFlow — Subscription Model
- AuthHandler
- NotFound
- Collections
- generate-logo/route.ts
- whatsapp/whatsapp.go
- DineFlow — Feature Roadmap
- DineFlow — Product Vision
- github.com/gin-gonic/gin.HandlerFunc
- README.md
- Audit Scope & Checklist
- Responsive Verification Checklist
- Security Checklist
- DineFlow — Questions, Assumptions & Risks
- Architectural Assessment Dimensions
- Review Pillars
- Phase 2 — Restaurant MVP
- menu-nlp-engine.ts
- DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)
- Code Quality Standards
- Service
- DineFlow — Antigravity (`agy`) Workspace Rules
- Setup
- Phase 2 — Restaurant MVP
- Section 2 — Product Requirements
- Ponytail: Anti-Overengineering & YAGNI Guardrails
- Ponytail Technical Debt Analysis
- Ponytail Configuration & Status
- web/README.md
- handlers/menu.go
- next
- NewScope
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
- demo.tsx
- SubscriptionHandler
- handlers/table.go
- Problems Solved
- Section 7 — Feature-Specific Risks
- TableHandler
- scan/route.ts
- indian-food-database.ts
- theme-provider.tsx
- Section 1 — Architecture Decisions
- search.go
- Section 3 — Subscription & Billing
- tasks/route.ts
- extend-stay/route.ts

## God Nodes (most connected - your core abstractions)
1. `OK()` - 134 edges
2. `BadRequest()` - 118 edges
3. `GetTenantID()` - 109 edges
4. `Unauthorized()` - 105 edges
5. `react` - 100 edges
6. `useToast()` - 87 edges
7. `InternalError()` - 79 edges
8. `cn()` - 78 edges
9. `lucide-react` - 78 edges
10. `NewScope()` - 59 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `seedDefaultData()`  [INFERRED]
  apps/api/cmd/server/main.go → apps/api/cmd/server/seed.go
- `main()` --calls--> `SetHealthDeps()`  [EXTRACTED]
  apps/api/cmd/server/main.go → apps/api/internal/interfaces/http/handlers/health.go
- `TestCalculateDistanceMeters()` --calls--> `CalculateDistanceMeters()`  [INFERRED]
  apps/api/internal/domain/user/user_test.go → apps/api/internal/domain/user/user.go
- `TestIsOptOutKeyword()` --calls--> `IsOptOutKeyword()`  [INFERRED]
  apps/api/internal/domain/whatsapp/whatsapp_test.go → apps/api/internal/domain/whatsapp/whatsapp.go
- `TestParseRating()` --calls--> `ParseRating()`  [INFERRED]
  apps/api/internal/domain/whatsapp/whatsapp_test.go → apps/api/internal/domain/whatsapp/whatsapp.go

## Import Cycles
- None detected.

## Communities (129 total, 36 thin omitted)

### Community 0 - "github.com/gin-gonic/gin.Context"
Cohesion: 0.09
Nodes (16): AIHandler, PlatformHandler, ByTenant(), PlanLimitMiddleware(), Conflict(), FeatureNotAvailable(), InternalError(), NoContent() (+8 more)

### Community 1 - "orders/page.tsx"
Cohesion: 0.14
Nodes (13): INITIAL_KDS_ORDERS, KdsItem, KdsOrder, KDSOrdersPage(), MENU_PRESETS, ThermalPrintModal(), ThermalPrintModalProps, EmptyState() (+5 more)

### Community 2 - "lucide-react"
Cohesion: 0.14
Nodes (36): DAYS, ForecastPage(), generateForecast(), getIntensityClass(), HOURS, INSIGHTS, MOCK_DESCRIPTIONS, SAMPLE_ITEMS (+28 more)

### Community 3 - "redisKey"
Cohesion: 0.10
Nodes (19): Config, redis.Client, NewFirebaseTestProvider(), Config, redis.Client, NewMSG91Provider(), GenerateCode(), redis.Client (+11 more)

### Community 4 - "useToast"
Cohesion: 0.06
Nodes (42): ForgotPasswordPage(), VerifyContent(), getDescription(), MenuWriterPage(), PricingAlertsPage(), UpsellPage(), AnalyticsPage(), DashboardOverviewPage() (+34 more)

### Community 5 - "go_pkg_time"
Cohesion: 0.10
Nodes (42): CategoryShare, HourlyPoint, OverviewMetrics, TopItemMetric, ParseObjectID(), SendOTPRequest, go_pkg_context, go_pkg_crypto_rand (+34 more)

### Community 6 - "server/main.go"
Cohesion: 0.06
Nodes (40): corsMiddleware(), Health(), SetHealthDeps(), Version(), ByIP(), ByIPAndRoute(), TestGenerateCode(), go_pkg_github_com_dineflow_api_internal_application_ai (+32 more)

### Community 7 - "time.Time"
Cohesion: 0.07
Nodes (32): cleanPhoneNumber(), DefaultPermissionsForRole(), PublicProfile, User, IsPlatformRole(), TestDefaultPermissionsForRole(), TestUserToPublic(), time.Time (+24 more)

### Community 8 - "Service"
Cohesion: 0.10
Nodes (18): TestIndianPhoneValidation(), ValidateAndNormalizeIndianPhone(), NewRoomHandler(), CreateTaskRequest, UpdateRoomStatusRequest, UpdateTaskRequest, CheckInInput, Guest (+10 more)

### Community 9 - "staff/page.tsx"
Cohesion: 0.13
Nodes (17): AttendanceRecord, BankDetails, calculateDistanceM(), EmergencyContact, GeofenceConfig, Holiday, LeaveBalance, LeaveRequest (+9 more)

### Community 10 - "Service"
Cohesion: 0.13
Nodes (22): ChatbotMessage, ChatbotResponse, ChatTurn, ForecastDay, ForecastHour, ForecastResponse, MenuDescriptionRequest, MenuDescriptionResponse (+14 more)

### Community 11 - "ref_next_server"
Cohesion: 0.13
Nodes (7): dynamic, revalidate, dynamic, dynamic, revalidate, config, ref_next_server

### Community 12 - "2. Functional Requirements"
Cohesion: 0.06
Nodes (33): 1. User Personas, 2.10 Staff Management, 2.11 WhatsApp Integration, 2.12 Analytics & Reporting, 2.13 Settings & Configuration, 2.1 Authentication & Multi-Tenancy, 2.2 Subscription & Billing, 2.3 Onboarding (+25 more)

### Community 13 - "utils.ts"
Cohesion: 0.10
Nodes (34): LoginPage(), DEFAULT_ROOMS, getStayMetrics(), HotelStats, RoomItem, RoomsDirectoryPage(), getStayMetrics(), HousekeepingTask (+26 more)

### Community 14 - "testing.T"
Cohesion: 0.07
Nodes (36): TestSearchScenarios(), NewService(), TestSearchAll_EmptyQuery(), TestSearchAll_ShortQuery(), NewService(), TestApplyLeave_Validation(), TestCreateHoliday_Validation(), TestCreateShift_Validation() (+28 more)

### Community 15 - "config.go"
Cohesion: 0.17
Nodes (17): getEnv(), getEnvInt(), Load(), requireEnv(), AIConfig, AppConfig, Config, EmailConfig (+9 more)

### Community 16 - "menu/page.tsx"
Cohesion: 0.11
Nodes (38): IMAGE_PRESETS, MenuManagementPage(), TablesManagementPage(), CameraMenuScannerModal(), CameraMenuScannerModalProps, CapturedPage, MenuBulkToolbar(), MenuBulkToolbarProps (+30 more)

### Community 17 - "context.Context"
Cohesion: 0.10
Nodes (24): CalculateHealthScore(), NewPlatformHandler(), context.Context, AnnouncementInfo, AuditActor, AuditLogRecord, BusinessType, ClientStatus (+16 more)

### Community 18 - "go.mongodb.org/mongo-driver/v2/bson.ObjectID"
Cohesion: 0.10
Nodes (14): Service, cleanGuestName(), cleanOrderNumber(), cleanTableName(), go.mongodb.org/mongo-driver/v2/bson.ObjectID, CreateNotificationRequest, Category, CreateNotificationInput (+6 more)

### Community 19 - "DineFlow — UI/UX Guidelines"
Cohesion: 0.04
Nodes (44): 10. Responsive Breakpoints, 11. Iconography, 12. Empty States, 13. Toast / Notification System, 1. Design Philosophy, 2. Color Palette, 3. Typography, 4. Spacing System (+36 more)

### Community 20 - "BadRequest"
Cohesion: 0.10
Nodes (9): MenuHandler, NotificationHandler, RoomHandler, StaffHandler, GetTenantID(), GetUserID(), BadRequest(), Created() (+1 more)

### Community 21 - "Subscription"
Cohesion: 0.22
Nodes (10): FormatPlanName(), GetLimits(), AdminOverrideRequest, CheckoutRequest, BillingCycle, PlanLimits, PlanTier, Subscription (+2 more)

### Community 22 - "Order"
Cohesion: 0.15
Nodes (13): Order, NewOrderHandler(), UpdateOrderStatusRequest, DestinationType, notifServiceIface, OrderItem, OrderItemModifier, OrderSource (+5 more)

### Community 23 - "register/page.tsx"
Cohesion: 0.08
Nodes (29): RegisterPage(), ResetPasswordPage(), BUSINESS_CATEGORIES, BusinessCategory, BusinessCategorySelector(), BusinessCategorySelectorProps, CTAButton, CTAButtonProps (+21 more)

### Community 24 - "web/package.json"
Cohesion: 0.08
Nodes (25): typescript, name, packageManager, private, version, axios, canvas-confetti, class-variance-authority (+17 more)

### Community 25 - "Scope"
Cohesion: 0.21
Nodes (8): ensureUpdatedAt(), go.mongodb.org/mongo-driver/v2/bson.M, go.mongodb.org/mongo-driver/v2/mongo.Cursor, go.mongodb.org/mongo-driver/v2/mongo.DeleteResult, go.mongodb.org/mongo-driver/v2/mongo.InsertManyResult, go.mongodb.org/mongo-driver/v2/mongo.InsertOneResult, go.mongodb.org/mongo-driver/v2/mongo.UpdateResult, Scope

### Community 26 - "whatsapp/service.go"
Cohesion: 0.07
Nodes (34): geminiRequest, geminiResponse, NewService(), TestPhoneNumberNormalization(), TestWorkforceCheckInMessageFormat(), TestWorkforceTokens(), NewWhatsAppHandler(), setupTestRouter() (+26 more)

### Community 27 - "notifications/page.tsx"
Cohesion: 0.11
Nodes (23): CATEGORIES, CATEGORY_META, NotificationsPage(), PRIORITIES, PRIORITY_BADGE, timeAgo(), calculateDistanceMeters(), CheckInContent() (+15 more)

### Community 28 - "storage/storage.go"
Cohesion: 0.15
Nodes (13): StorageService, NewService(), TestStorageValidation(), StorageHandler, NewStorageHandler(), go_pkg_crypto_sha256, go_pkg_encoding_hex, go_pkg_github_com_dineflow_api_internal_infrastructure_storage (+5 more)

### Community 29 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, axios, canvas-confetti, class-variance-authority, clsx, framer-motion, lucide-react, next (+11 more)

### Community 30 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 31 - "app/layout.tsx"
Cohesion: 0.17
Nodes (10): apps_web_app_globals, manrope, metadata, plusJakarta, spaceGrotesk, viewport, ToastProvider(), QueryProvider() (+2 more)

### Community 32 - "tasks"
Cohesion: 0.11
Nodes (17): dependsOn, inputs, outputs, cache, cache, persistent, dependsOn, $schema (+9 more)

### Community 33 - "useAuthStore"
Cohesion: 0.09
Nodes (29): DashboardLayout(), PlatformLayout(), ImpersonationBanner(), NAV_ITEMS, Sidebar(), ROUTE_TITLES, TopBar(), NotificationCenter() (+21 more)

### Community 34 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 35 - "main"
Cohesion: 0.09
Nodes (27): main(), requestLogger(), runStartupCleanup(), NewService(), NewService(), NewService(), NewService(), NewService() (+19 more)

### Community 36 - "package.json"
Cohesion: 0.09
Nodes (21): description, devDependencies, prettier, turbo, typescript, engines, node, typescript (+13 more)

### Community 37 - "OK"
Cohesion: 0.12
Nodes (4): AuthHandler, TenantHandler, WhatsAppHandler, OK()

### Community 38 - "DineFlow — Development Plan"
Cohesion: 0.10
Nodes (21): 1.1 — Monorepo Setup, 1.2 — Backend Foundation (Go), 1.3 — Authentication Service, 1.4 — Multi-Tenancy Middleware, 1.5 — Frontend Foundation (Next.js), 1.6 — File Storage, 1.7 — Email Service, Definition of Done (+13 more)

### Community 39 - "react"
Cohesion: 0.04
Nodes (66): SettingsPage(), OrderStatus, OrderTrackingPage(), TrackingOrder, TrackingOrderItem, COMPARISON_ROWS, PLANS, PlanTier (+58 more)

### Community 40 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti, @types/node, @types/react (+2 more)

### Community 41 - "scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, test, version

### Community 42 - "whatsapp/page.tsx"
Cohesion: 0.09
Nodes (19): CampaignItem, CustomerInvoice, CustomerInvoiceItem, INITIAL_CAMPAIGNS, INITIAL_INVOICES, INITIAL_LOGS, MessageLogItem, SegmentCounts (+11 more)

### Community 43 - "Service"
Cohesion: 0.16
Nodes (11): generateSlug(), NewService(), ValidatePasswordComplexity(), NormalizePhone(), AuthResponse, EmailSender, LoginRequest, RegisterRequest (+3 more)

### Community 44 - "DineFlow — System Architecture"
Cohesion: 0.07
Nodes (27): Application Structure, Architecture Philosophy, Backend Architecture, Clean Architecture Dependency Flow, Customer Ordering Page — SSG + ISR, Database Architecture, Deployment Architecture, Deployment Pipeline (+19 more)

### Community 45 - "tenant/tenant.go"
Cohesion: 0.24
Nodes (17): seedDefaultData(), seedPlatformData(), FeaturesForPlan(), BusinessType, Tenant, LimitsForPlan(), Address, Contact (+9 more)

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

### Community 52 - "Maker"
Cohesion: 0.22
Nodes (9): Maker, NewMaker(), TestTokenMaker(), go_pkg_github_com_golang_jwt_jwt_v5, go_pkg_github_com_google_uuid, time.Duration, jwt.RegisteredClaims, Claims (+1 more)

### Community 55 - "printer.go"
Cohesion: 0.26
Nodes (12): centerText(), GenerateBillText(), GenerateKOTText(), padRow(), TestGenerateBillText(), TestGenerateKOTText(), truncate(), BillData (+4 more)

### Community 56 - "Client"
Cohesion: 0.17
Nodes (4): NewService(), Client, New(), RateLimitResult

### Community 57 - "DineFlow — Subscription Model"
Cohesion: 0.07
Nodes (27): Billing Cycle Options, Billing Mechanics, DineFlow — Subscription Model, Downgrade Execution (Day 14), Enforcement Layers, Feature Flag System, 🆓 Free — "Just Getting Started", Future: Platform License (+19 more)

### Community 58 - "AuthHandler"
Cohesion: 0.19
Nodes (6): clearRefreshTokenCookie(), AuthHandler, setRefreshTokenCookie(), GetRole(), GetTokenID(), Forbidden()

### Community 60 - "Collections"
Cohesion: 0.10
Nodes (20): Collection: `audit_logs`, Collection: `categories`, Collection: `locations`, Collection: `menu_items`, Collection: `menus`, Collection: `modifier_groups`, Collection: `notifications`, Collection: `orders` (+12 more)

### Community 61 - "generate-logo/route.ts"
Cohesion: 0.24
Nodes (11): ACTIVE_GEMINI_MODELS, ARCHETYPE_CONFIGS, createArchetypeLogo(), generateArchetypeProceduralSvg(), GenerateLogoRequest, generateWithGemini(), LogoVariation, maxDuration (+3 more)

### Community 62 - "whatsapp/whatsapp.go"
Cohesion: 0.06
Nodes (46): BuildFeedbackRequestMessage(), BuildKitchenReadyMessage(), BuildOrderConfirmationMessage(), GetStandardTemplates(), IsOptOutKeyword(), NormalizePhoneNumber(), ParseRating(), TestBuildOrderConfirmationMessage() (+38 more)

### Community 63 - "DineFlow — Feature Roadmap"
Cohesion: 0.15
Nodes (13): Cross-Phase Dependencies Map, Deliverables, Deliverables, DineFlow — Feature Roadmap, Overview, Phase 0 — Planning & Architecture, Phase 1 — Foundation & Infrastructure, Phase 3 — Hotel Module (+5 more)

### Community 64 - "DineFlow — Product Vision"
Cohesion: 0.14
Nodes (13): Business Metrics (12-Month Targets), Competitive Landscape, Customer Experience Metrics, DineFlow — Product Vision, Long-Term Vision (3–5 Years), Mission, Primary Segments, Product Metrics (+5 more)

### Community 65 - "github.com/gin-gonic/gin.HandlerFunc"
Cohesion: 0.41
Nodes (12): ChefOrAbove(), FinanceAdminOrAbove(), OwnerOnly(), OwnerOrManager(), PlatformAdminOrAbove(), RequireAnyRole(), RequirePlatformRole(), RequireRole() (+4 more)

### Community 66 - "README.md"
Cohesion: 0.12
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

### Community 70 - "DineFlow — Questions, Assumptions & Risks"
Cohesion: 0.12
Nodes (17): DineFlow — Questions, Assumptions & Risks, O1. Deployment platform, O2. Primary deployment region?, O3. How will we handle database migrations?, O4. How do we handle a tenant with 10,000 menu items or orders?, S1. Is PCI-DSS compliance required in Phase 1?, S2. GDPR compliance — are EU customers expected in Phase 1?, S3. What data does DineFlow retain about end customers (guests)? (+9 more)

### Community 71 - "Architectural Assessment Dimensions"
Cohesion: 0.25
Nodes (7): 1. Monorepo & Service Boundaries, 2. Database Design & Indexing, 3. Caching & State Distribution, 4. Reliability & High Availability, 5. Observability & Tracing, Architectural Assessment Dimensions, System Architecture & Scalability Review

### Community 72 - "Review Pillars"
Cohesion: 0.25
Nodes (7): 1. Tenant Provisioning & Lifecycle, 2. Subscription Tiers & Feature Gates, 3. Data Partitioning & Soft Delete, 4. Financial & Payment Idempotency, 5. Multi-Tenant Event & Notification Architecture, Multi-Tenant SaaS Architecture & Business Review, Review Pillars

### Community 73 - "Phase 2 — Restaurant MVP"
Cohesion: 0.25
Nodes (8): 2A — Business Onboarding, 2B — Menu Management, 2C — QR Code System, 2D — Customer Ordering Experience, 2E — Order Management (Staff Dashboard), 2F — Kitchen Display System, 2G — Basic Analytics, Phase 2 — Restaurant MVP

### Community 74 - "menu-nlp-engine.ts"
Cohesion: 0.38
Nodes (10): calculateSimilarity(), detectIsVeg(), enrichRawExtractedItems(), extractPrice(), inferCategory(), matchCatalogDish(), NON_VEG_PATTERNS, normalizeDishText() (+2 more)

### Community 75 - "DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)"
Cohesion: 0.25
Nodes (7): 1. Overview & Vision, 2. End-to-End Pipeline Architecture, 3.1 Inbound WhatsApp Webhook (`POST /webhooks/whatsapp`), 3.2 Staging Collection (`menu_imports_staging`), 3. Webhook Payload & Data Schema, 4. Security, Multi-Tenancy & Privacy Controls, DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)

### Community 76 - "Code Quality Standards"
Cohesion: 0.29
Nodes (6): 1. TypeScript & React, 2. Go (Golang), 3. API & Data Access Hygiene, 4. Code Review Output Format, Code Quality Standards, Staff Engineer Code Review Runbook

### Community 77 - "Service"
Cohesion: 0.31
Nodes (4): NewService(), Service, go_pkg_github_com_resend_resend_go_v2, resend.Client

### Community 78 - "DineFlow — Antigravity (`agy`) Workspace Rules"
Cohesion: 0.29
Nodes (6): Code Style, DineFlow — Antigravity (`agy`) Workspace Rules, Key Files, Project, Tech Stack, Workflow Rules

### Community 79 - "Setup"
Cohesion: 0.22
Nodes (4): AnalyticsHandler, Auth(), RateLimit(), Setup()

### Community 80 - "Phase 2 — Restaurant MVP"
Cohesion: 0.22
Nodes (9): 2.1 — Onboarding, 2.2 — Menu Management, 2.3 — Table & QR Code Management, 2.4 — Customer Ordering Experience, 2.5 — WebSocket / Real-Time, 2.6 — Order Management (Staff Dashboard), 2.7 — Kitchen Display System, 2.8 — Basic Analytics (+1 more)

### Community 81 - "Section 2 — Product Requirements"
Cohesion: 0.22
Nodes (9): P1. What counts as a "table" for food trucks?, P2. Customer phone number at checkout, P3. Can a customer order multiple rounds from the same table?, P4. Online payment model, P5. Unavailable item display, P6. What is the order cancellation policy?, P7. Split billing, P8. What is the ordering flow for hotel room service after midnight? (+1 more)

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

### Community 88 - "NewScope"
Cohesion: 0.09
Nodes (12): CalculateDistanceMeters(), NewScope(), buildMenuItemFromUpsertRequest(), Category, MenuItem, PublicCategorySection, PublicMenuResponse, Service (+4 more)

### Community 117 - "handlers/table.go"
Cohesion: 0.32
Nodes (7): go_pkg_github_com_dineflow_api_internal_application_table, BulkCreateRoomsRequest, CreateTableRequest, ToggleDNDRequest, UpdateTableStatusRequest, LocationType, TableStatus

### Community 118 - "Problems Solved"
Cohesion: 0.25
Nodes (8): Problem 1 — Fragmented Software Stack, Problem 2 — High Cost of Entry, Problem 3 — App Download Friction, Problem 4 — WhatsApp Chaos, Problem 5 — No Real-time Kitchen Visibility, Problem 6 — Hotels Lack F&B Cohesion, Problem 7 — No Data for Decision Making, Problems Solved

### Community 119 - "Section 7 — Feature-Specific Risks"
Cohesion: 0.25
Nodes (8): R1. WhatsApp Template Approval Delays, R2. Razorpay Subscription Webhook Reliability, R3. Customer QR Page Load on Poor Network, R4. KDS Data Accuracy During API Downtime, R5. Multi-Tenant Data Breach (Tenant Isolation Failure), R6. WhatsApp Message Costs Exceeding Revenue, R7. Competitor Response, Section 7 — Feature-Specific Risks

### Community 121 - "scan/route.ts"
Cohesion: 0.33
Nodes (6): callGeminiVision(), GEMINI_MODELS, maxDuration, POST(), RawMenuItem, ScanMenuRequestBody

### Community 122 - "indian-food-database.ts"
Cohesion: 0.29
Nodes (5): INDIAN_CATEGORIES, INDIAN_DISH_CATALOG, IndianCategory, IndianDishEntry, OCR_TYPO_CORRECTIONS

### Community 123 - "theme-provider.tsx"
Cohesion: 0.33
Nodes (5): ResolvedTheme, Theme, ThemeContext, ThemeContextType, ThemeProvider()

### Community 124 - "Section 1 — Architecture Decisions"
Cohesion: 0.33
Nodes (6): A1. Backend Language: Go vs. Node.js, A2. Monorepo Tool: Turborepo vs. Nx, A3. Database: MongoDB Only vs. MongoDB + PostgreSQL, A4. Frontend Framework: Next.js App Router vs. Pages Router, A5. WebSocket: Socket.io vs. Native WebSocket, Section 1 — Architecture Decisions

### Community 125 - "search.go"
Cohesion: 0.60
Nodes (4): SearchHandler, NewSearchHandler(), go_pkg_github_com_dineflow_api_internal_application_search, Service

### Community 126 - "Section 3 — Subscription & Billing"
Cohesion: 0.33
Nodes (6): B1. Free trial for new registrations, B2. How is proration handled on mid-cycle upgrades?, B3. Can a single tenant have multiple subscriptions (e.g., base plan + white-label add-on)?, B4. What currency should the Free plan's invoice show?, B5. Are there usage-based charges beyond the flat subscription?, Section 3 — Subscription & Billing

## Knowledge Gaps
- **662 isolated node(s):** `github.com/dineflow/api`, `geminiRequest`, `geminiResponse`, `SendOTPRequest`, `ClockInRequest` (+657 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 797 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `useAuthStore`, `lucide-react`, `orders/page.tsx`, `useToast`, `TubesCursor`, `staff/page.tsx`, `whatsapp/page.tsx`, `theme-provider.tsx`, `utils.ts`, `menu/page.tsx`, `peeking-chef.tsx`, `register/page.tsx`, `web/package.json`, `notifications/page.tsx`, `app/layout.tsx`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `lucide-react` to `useAuthStore`, `orders/page.tsx`, `useToast`, `react`, `staff/page.tsx`, `whatsapp/page.tsx`, `utils.ts`, `menu/page.tsx`, `register/page.tsx`, `web/package.json`, `notifications/page.tsx`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `Subscription` connect `Subscription` to `go.mongodb.org/mongo-driver/v2/bson.ObjectID`, `time.Time`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `github.com/dineflow/api`, `geminiRequest`, `geminiResponse` to the rest of the system?**
  _662 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `github.com/gin-gonic/gin.Context` be split into smaller, more focused modules?**
  _Cohesion score 0.09409701928696669 - nodes in this community are weakly interconnected._
- **Should `orders/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13970588235294118 - nodes in this community are weakly interconnected._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.13554987212276215 - nodes in this community are weakly interconnected._