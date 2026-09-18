# Graph Report - DineFlow  (2026-09-18)

## Corpus Check
- 276 files · ~348,461 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .example 2, .toml 1)

## Summary
- 2322 nodes · 6492 edges · 133 communities (99 shown, 34 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `df774df7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- OK
- staff/page.tsx
- react
- go_pkg_context
- useToast
- go_pkg_go_mongodb_org_mongo_driver_v2_bson
- server/main.go
- NewScope
- go.mongodb.org/mongo-driver/v2/bson.ObjectID
- handlers/room.go
- Service
- ref_next_server
- 2. Functional Requirements
- utils.ts
- testing.T
- config.go
- menu/page.tsx
- Service
- context.Context
- DineFlow — UI/UX Guidelines
- BadRequest
- Subscription
- Order
- register/page.tsx
- web/package.json
- Scope
- go_pkg_fmt
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
- github.com/gin-gonic/gin.Context
- DineFlow — Development Plan
- cn
- devDependencies
- scripts
- ui/pricing.tsx
- time.Time
- DineFlow — System Architecture
- tenant/tenant.go
- DineFlow — API Strategy
- eslint.config.mjs
- scripts
- web/vercel.json
- vercel.json
- peeking-chef.tsx
- go_pkg_time
- postcss.config.mjs
- github.com/dineflow/api
- printer.go
- whatsapp/page.tsx
- DineFlow — Subscription Model
- response.go
- RoomHandler
- Collections
- Service
- whatsapp/whatsapp.go
- DineFlow — Feature Roadmap
- DineFlow — Product Vision
- github.com/gin-gonic/gin.HandlerFunc
- DineFlow
- Audit Scope & Checklist
- Responsive Verification Checklist
- Security Checklist
- DineFlow — Questions, Assumptions & Risks
- Architectural Assessment Dimensions
- Review Pillars
- otp.go
- security-audit/main.go
- DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)
- Code Quality Standards
- Service
- DineFlow — Antigravity (`agy`) Workspace Rules
- Setup
- generate-logo/route.ts
- 3. Non-Functional Requirements
- Ponytail: Anti-Overengineering & YAGNI Guardrails
- Ponytail Technical Debt Analysis
- Ponytail Configuration & Status
- web/README.md
- handlers/menu.go
- Service
- Service
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
- menu-nlp-engine.ts
- 1. User Personas
- README.md
- NewOTPProvider
- Phase 2 — Restaurant MVP
- Notification
- scan/route.ts
- indian-food-database.ts
- search/service.go
- 5. Component Library
- tasks/route.ts
- label.tsx
- 7. Layout System
- extend-stay/route.ts
- next.config.ts
- 6. Animation & Micro-Interactions

## God Nodes (most connected - your core abstractions)
1. `OK()` - 141 edges
2. `BadRequest()` - 123 edges
3. `GetTenantID()` - 109 edges
4. `Unauthorized()` - 105 edges
5. `react` - 101 edges
6. `useToast()` - 87 edges
7. `InternalError()` - 85 edges
8. `lucide-react` - 79 edges
9. `cn()` - 78 edges
10. `NewScope()` - 59 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `seedDefaultData()`  [INFERRED]
  apps/api/cmd/server/main.go → apps/api/cmd/server/seed.go
- `main()` --calls--> `SetHealthDeps()`  [EXTRACTED]
  apps/api/cmd/server/main.go → apps/api/internal/interfaces/http/handlers/health.go
- `UpdateRoomStatusRequest` --references--> `RoomStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/room.go → apps/api/internal/domain/room/room.go
- `UpdateTableStatusRequest` --references--> `TableStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/table.go → apps/api/internal/domain/table/table.go
- `BulkCreateRoomsRequest` --references--> `LocationType`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/table.go → apps/api/internal/domain/table/table.go

## Import Cycles
- None detected.

## Communities (133 total, 34 thin omitted)

### Community 0 - "OK"
Cohesion: 0.13
Nodes (5): AuthHandler, PlatformHandler, InternalError(), OK(), OKWithMeta()

### Community 1 - "staff/page.tsx"
Cohesion: 0.07
Nodes (28): INITIAL_KDS_ORDERS, KdsItem, KdsOrder, MENU_PRESETS, AttendanceRecord, BankDetails, calculateDistanceM(), EmergencyContact (+20 more)

### Community 2 - "react"
Cohesion: 0.12
Nodes (45): DAYS, ForecastPage(), generateForecast(), getIntensityClass(), HOURS, INSIGHTS, MOCK_DESCRIPTIONS, SAMPLE_ITEMS (+37 more)

### Community 3 - "go_pkg_context"
Cohesion: 0.16
Nodes (9): ParseTestNumbers(), TestFirebaseTestProvider(), TestNormalizePhone(), TestParseTestNumbers(), go_pkg_context, go_pkg_github_com_redis_go_redis_v9, go_pkg_go_uber_org_zap, go_pkg_go_uber_org_zap_zapcore (+1 more)

### Community 4 - "useToast"
Cohesion: 0.05
Nodes (46): ForgotPasswordPage(), VerifyContent(), getDescription(), MenuWriterPage(), PricingAlertsPage(), UpsellPage(), AnalyticsPage(), PlatformAnalyticsPage() (+38 more)

### Community 5 - "go_pkg_go_mongodb_org_mongo_driver_v2_bson"
Cohesion: 0.12
Nodes (22): TestIsOptOutKeyword(), TestParseRating(), ParseObjectID(), go_pkg_github_com_dineflow_api_internal_domain_room, go_pkg_github_com_dineflow_api_internal_domain_table, go_pkg_github_com_dineflow_api_internal_domain_tenant, go_pkg_github_com_dineflow_api_internal_infrastructure_mongodb, go_pkg_go_mongodb_org_mongo_driver_v2_bson (+14 more)

### Community 6 - "server/main.go"
Cohesion: 0.08
Nodes (26): NewTableHandler(), go_pkg_errors, go_pkg_github_com_dineflow_api_internal_application_ai, go_pkg_github_com_dineflow_api_internal_application_analytics, go_pkg_github_com_dineflow_api_internal_application_auth, go_pkg_github_com_dineflow_api_internal_application_order, go_pkg_github_com_dineflow_api_internal_application_staff, go_pkg_github_com_dineflow_api_internal_application_subscription (+18 more)

### Community 7 - "NewScope"
Cohesion: 0.07
Nodes (18): CalculateDistanceMeters(), NewScope(), buildMenuItemFromUpsertRequest(), Category, MenuItem, PublicCategorySection, PublicMenuResponse, Service (+10 more)

### Community 8 - "go.mongodb.org/mongo-driver/v2/bson.ObjectID"
Cohesion: 0.14
Nodes (14): go.mongodb.org/mongo-driver/v2/bson.ObjectID, CreateTaskRequest, UpdateTaskRequest, Guest, GuestStatus, HousekeepingTask, Room, RoomStatus (+6 more)

### Community 9 - "handlers/room.go"
Cohesion: 0.20
Nodes (9): NewRoomHandler(), go_pkg_encoding_base64, go_pkg_github_com_dineflow_api_internal_application_room, BulkRoomsRequest, CreateRoomRequest, PublicAmenityRequest, PublicExtendStayRequest, ToggleRoomDNDRequest (+1 more)

### Community 10 - "Service"
Cohesion: 0.13
Nodes (22): ChatbotMessage, ChatbotResponse, ChatTurn, ForecastDay, ForecastHour, ForecastResponse, MenuDescriptionRequest, MenuDescriptionResponse (+14 more)

### Community 11 - "ref_next_server"
Cohesion: 0.13
Nodes (7): dynamic, revalidate, dynamic, dynamic, revalidate, config, ref_next_server

### Community 12 - "2. Functional Requirements"
Cohesion: 0.14
Nodes (14): 2.10 Staff Management, 2.11 WhatsApp Integration, 2.12 Analytics & Reporting, 2.13 Settings & Configuration, 2.1 Authentication & Multi-Tenancy, 2.2 Subscription & Billing, 2.3 Onboarding, 2.4 Menu Management (+6 more)

### Community 13 - "utils.ts"
Cohesion: 0.07
Nodes (44): LoginPage(), DEFAULT_ROOMS, getStayMetrics(), HotelStats, RoomItem, RoomsDirectoryPage(), getStayMetrics(), HousekeepingTask (+36 more)

### Community 14 - "testing.T"
Cohesion: 0.06
Nodes (47): TestSearchScenarios(), NewService(), TestSearchAll_EmptyQuery(), TestSearchAll_ShortQuery(), NewService(), TestApplyLeave_Validation(), TestCreateHoliday_Validation(), TestCreateShift_Validation() (+39 more)

### Community 15 - "config.go"
Cohesion: 0.11
Nodes (25): getEnv(), getEnvInt(), Load(), requireEnv(), Maker, NewMaker(), TestTokenMaker(), AIConfig (+17 more)

### Community 16 - "menu/page.tsx"
Cohesion: 0.11
Nodes (37): IMAGE_PRESETS, MenuManagementPage(), KDSOrdersPage(), DashboardOverviewPage(), TablesManagementPage(), CameraMenuScannerModal(), CameraMenuScannerModalProps, CapturedPage (+29 more)

### Community 17 - "Service"
Cohesion: 0.08
Nodes (22): CalculateHealthScore(), AnnouncementInfo, AuditActor, AuditLogRecord, BusinessType, ClientStatus, DashboardMetrics, FeatureFlagDefinition (+14 more)

### Community 18 - "context.Context"
Cohesion: 0.09
Nodes (9): cleanGuestName(), cleanOrderNumber(), cleanTableName(), Client, New(), IPBlocklist(), context.Context, go.mongodb.org/mongo-driver/v2/mongo.Collection (+1 more)

### Community 19 - "DineFlow — UI/UX Guidelines"
Cohesion: 0.07
Nodes (29): 10. Responsive Breakpoints, 11. Iconography, 12. Empty States, 13. Toast / Notification System, 1. Design Philosophy, 2. Color Palette, 3. Typography, 4. Spacing System (+21 more)

### Community 20 - "BadRequest"
Cohesion: 0.09
Nodes (9): MenuHandler, NotificationHandler, StaffHandler, TableHandler, GetTenantID(), GetUserID(), BadRequest(), Created() (+1 more)

### Community 21 - "Subscription"
Cohesion: 0.16
Nodes (13): FormatPlanName(), GetLimits(), AdminOverrideRequest, CheckoutRequest, BillingCycle, CheckoutSessionResult, Invoice, PlanLimits (+5 more)

### Community 22 - "Order"
Cohesion: 0.16
Nodes (12): Order, UpdateOrderStatusRequest, DestinationType, notifServiceIface, OrderItem, OrderItemModifier, OrderSource, OrderStatus (+4 more)

### Community 23 - "register/page.tsx"
Cohesion: 0.07
Nodes (29): RegisterPage(), ResetPasswordPage(), BUSINESS_CATEGORIES, BusinessCategory, BusinessCategorySelector(), BusinessCategorySelectorProps, CTAButton, CTAButtonProps (+21 more)

### Community 24 - "web/package.json"
Cohesion: 0.10
Nodes (20): typescript, name, packageManager, private, version, axios, clsx, eslint (+12 more)

### Community 25 - "Scope"
Cohesion: 0.21
Nodes (8): ensureUpdatedAt(), go.mongodb.org/mongo-driver/v2/bson.M, go.mongodb.org/mongo-driver/v2/mongo.Cursor, go.mongodb.org/mongo-driver/v2/mongo.DeleteResult, go.mongodb.org/mongo-driver/v2/mongo.InsertManyResult, go.mongodb.org/mongo-driver/v2/mongo.InsertOneResult, go.mongodb.org/mongo-driver/v2/mongo.UpdateResult, Scope

### Community 26 - "go_pkg_fmt"
Cohesion: 0.11
Nodes (26): geminiRequest, geminiResponse, verifyMetaSignature(), go_pkg_bytes, go_pkg_crypto_hmac, go_pkg_crypto_sha256, go_pkg_encoding_hex, go_pkg_encoding_json (+18 more)

### Community 27 - "notifications/page.tsx"
Cohesion: 0.07
Nodes (28): CATEGORIES, CATEGORY_META, NotificationsPage(), PRIORITIES, PRIORITY_BADGE, timeAgo(), calculateDistanceMeters(), CheckInContent() (+20 more)

### Community 28 - "storage/storage.go"
Cohesion: 0.18
Nodes (11): StorageService, NewService(), TestStorageValidation(), StorageHandler, NewStorageHandler(), go_pkg_github_com_dineflow_api_internal_infrastructure_storage, go_pkg_path_filepath, PresignRequest (+3 more)

### Community 29 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, axios, canvas-confetti, class-variance-authority, clsx, framer-motion, lucide-react, next (+11 more)

### Community 30 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 31 - "app/layout.tsx"
Cohesion: 0.12
Nodes (14): apps_web_app_globals, manrope, metadata, plusJakarta, spaceGrotesk, viewport, ResolvedTheme, Theme (+6 more)

### Community 32 - "tasks"
Cohesion: 0.11
Nodes (17): dependsOn, inputs, outputs, cache, cache, persistent, dependsOn, $schema (+9 more)

### Community 33 - "useAuthStore"
Cohesion: 0.11
Nodes (25): DashboardLayout(), RootLoading(), PlatformLayout(), ImpersonationBanner(), NAV_ITEMS, Sidebar(), ROUTE_TITLES, TopBar() (+17 more)

### Community 34 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 35 - "main"
Cohesion: 0.09
Nodes (28): corsMiddleware(), main(), requestLogger(), runStartupCleanup(), NewService(), NewService(), NewService(), NewService() (+20 more)

### Community 36 - "package.json"
Cohesion: 0.09
Nodes (21): description, devDependencies, prettier, turbo, typescript, engines, node, typescript (+13 more)

### Community 37 - "github.com/gin-gonic/gin.Context"
Cohesion: 0.09
Nodes (7): AIHandler, TenantHandler, WhatsAppHandler, ByTenant(), PlanLimitMiddleware(), PlanLimitExceeded(), github.com/gin-gonic/gin.Context

### Community 38 - "DineFlow — Development Plan"
Cohesion: 0.07
Nodes (30): 1.1 — Monorepo Setup, 1.2 — Backend Foundation (Go), 1.3 — Authentication Service, 1.4 — Multi-Tenancy Middleware, 1.5 — Frontend Foundation (Next.js), 1.6 — File Storage, 1.7 — Email Service, 2.1 — Onboarding (+22 more)

### Community 39 - "cn"
Cohesion: 0.05
Nodes (40): SettingsPage(), ChefMascot(), ChefMascotProps, FloatingCard(), FloatingCardProps, HeroSection(), HeroSectionProps, SCATTERED_FOODS (+32 more)

### Community 40 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti, @types/node, @types/react (+2 more)

### Community 41 - "scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, test, version

### Community 42 - "ui/pricing.tsx"
Cohesion: 0.15
Nodes (13): COMPARISON_ROWS, PLANS, PlanTier, PricingPage(), buttonVariants, Pricing(), PricingPlan, PricingProps (+5 more)

### Community 43 - "time.Time"
Cohesion: 0.12
Nodes (26): cleanPhoneNumber(), DefaultPermissionsForRole(), PublicProfile, User, IsPlatformRole(), NormalizePhoneNumber(), time.Time, UpdateStaffRequest (+18 more)

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

### Community 52 - "go_pkg_time"
Cohesion: 0.10
Nodes (18): Health(), SetHealthDeps(), Version(), ByIP(), ByIPAndRoute(), SendOTPRequest, go_pkg_encoding_csv, go_pkg_github_com_dineflow_api_internal_application_platform (+10 more)

### Community 55 - "printer.go"
Cohesion: 0.26
Nodes (12): centerText(), GenerateBillText(), GenerateKOTText(), padRow(), TestGenerateBillText(), TestGenerateKOTText(), truncate(), BillData (+4 more)

### Community 56 - "whatsapp/page.tsx"
Cohesion: 0.09
Nodes (19): CampaignItem, CustomerInvoice, CustomerInvoiceItem, INITIAL_CAMPAIGNS, INITIAL_INVOICES, INITIAL_LOGS, MessageLogItem, SegmentCounts (+11 more)

### Community 57 - "DineFlow — Subscription Model"
Cohesion: 0.07
Nodes (27): Billing Cycle Options, Billing Mechanics, DineFlow — Subscription Model, Downgrade Execution (Day 14), Enforcement Layers, Feature Flag System, 🆓 Free — "Just Getting Started", Future: Platform License (+19 more)

### Community 58 - "response.go"
Cohesion: 0.10
Nodes (16): clearRefreshTokenCookie(), AuthHandler, setRefreshTokenCookie(), Auth(), GetRole(), GetTokenID(), Conflict(), FeatureNotAvailable() (+8 more)

### Community 60 - "Collections"
Cohesion: 0.13
Nodes (15): Collection: `audit_logs`, Collection: `categories`, Collection: `locations`, Collection: `menu_items`, Collection: `menus`, Collection: `modifier_groups`, Collection: `notifications`, Collection: `orders` (+7 more)

### Community 61 - "Service"
Cohesion: 0.14
Nodes (12): generateSlug(), NewService(), ValidatePasswordComplexity(), NewAuthHandler(), OTPProvider, NormalizePhone(), AuthResponse, EmailSender (+4 more)

### Community 62 - "whatsapp/whatsapp.go"
Cohesion: 0.06
Nodes (46): BuildFeedbackRequestMessage(), BuildKitchenReadyMessage(), BuildOrderConfirmationMessage(), GetStandardTemplates(), IsOptOutKeyword(), ParseRating(), TestBuildOrderConfirmationMessage(), TestGetStandardTemplates() (+38 more)

### Community 63 - "DineFlow — Feature Roadmap"
Cohesion: 0.15
Nodes (13): Cross-Phase Dependencies Map, Deliverables, Deliverables, DineFlow — Feature Roadmap, Overview, Phase 0 — Planning & Architecture, Phase 1 — Foundation & Infrastructure, Phase 3 — Hotel Module (+5 more)

### Community 64 - "DineFlow — Product Vision"
Cohesion: 0.09
Nodes (21): Business Metrics (12-Month Targets), Competitive Landscape, Customer Experience Metrics, DineFlow — Product Vision, Long-Term Vision (3–5 Years), Mission, Primary Segments, Problem 1 — Fragmented Software Stack (+13 more)

### Community 65 - "github.com/gin-gonic/gin.HandlerFunc"
Cohesion: 0.41
Nodes (12): ChefOrAbove(), FinanceAdminOrAbove(), OwnerOnly(), OwnerOrManager(), PlatformAdminOrAbove(), RequireAnyRole(), RequirePlatformRole(), RequireRole() (+4 more)

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

### Community 70 - "DineFlow — Questions, Assumptions & Risks"
Cohesion: 0.04
Nodes (46): A1. Backend Language: Go vs. Node.js, A2. Monorepo Tool: Turborepo vs. Nx, A3. Database: MongoDB Only vs. MongoDB + PostgreSQL, A4. Frontend Framework: Next.js App Router vs. Pages Router, A5. WebSocket: Socket.io vs. Native WebSocket, B1. Free trial for new registrations, B2. How is proration handled on mid-cycle upgrades?, B3. Can a single tenant have multiple subscriptions (e.g., base plan + white-label add-on)? (+38 more)

### Community 71 - "Architectural Assessment Dimensions"
Cohesion: 0.25
Nodes (7): 1. Monorepo & Service Boundaries, 2. Database Design & Indexing, 3. Caching & State Distribution, 4. Reliability & High Availability, 5. Observability & Tracing, Architectural Assessment Dimensions, System Architecture & Scalability Review

### Community 72 - "Review Pillars"
Cohesion: 0.25
Nodes (7): 1. Tenant Provisioning & Lifecycle, 2. Subscription Tiers & Feature Gates, 3. Data Partitioning & Soft Delete, 4. Financial & Payment Idempotency, 5. Multi-Tenant Event & Notification Architecture, Multi-Tenant SaaS Architecture & Business Review, Review Pillars

### Community 73 - "otp.go"
Cohesion: 0.14
Nodes (12): Config, redis.Client, NewFirebaseTestProvider(), GenerateCode(), redis.Client, NewService(), redisKey(), TestGenerateCode() (+4 more)

### Community 74 - "security-audit/main.go"
Cohesion: 0.23
Nodes (13): main(), testCORSOriginDefense(), testMetaWebhookHMACSignature(), testNoSQLInjectionInBody(), testNoSQLInjectionInQueryParams(), testRequestIDTracing(), testSecurityHeaders(), hasOperatorInjection() (+5 more)

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
Cohesion: 0.15
Nodes (4): AnalyticsHandler, OrderHandler, RateLimit(), Setup()

### Community 80 - "generate-logo/route.ts"
Cohesion: 0.24
Nodes (11): ACTIVE_GEMINI_MODELS, ARCHETYPE_CONFIGS, createArchetypeLogo(), generateArchetypeProceduralSvg(), GenerateLogoRequest, generateWithGemini(), LogoVariation, maxDuration (+3 more)

### Community 81 - "3. Non-Functional Requirements"
Cohesion: 0.14
Nodes (13): 3.1 Performance, 3.2 Scalability, 3.3 Reliability, 3.4 Security, 3.5 Accessibility, 3.6 Internationalisation, 3. Non-Functional Requirements, 4. User Journeys (+5 more)

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

### Community 87 - "Service"
Cohesion: 0.24
Nodes (6): CategoryShare, HourlyPoint, OverviewMetrics, Service, TopItemMetric, NewAnalyticsHandler()

### Community 88 - "Service"
Cohesion: 0.22
Nodes (5): CreateTableRequest, LocationType, Service, Table, TableStatus

### Community 117 - "menu-nlp-engine.ts"
Cohesion: 0.38
Nodes (10): calculateSimilarity(), detectIsVeg(), enrichRawExtractedItems(), extractPrice(), inferCategory(), matchCatalogDish(), NON_VEG_PATTERNS, normalizeDishText() (+2 more)

### Community 118 - "1. User Personas"
Cohesion: 0.33
Nodes (6): 1. User Personas, Persona 1 — Riya (Restaurant Owner), Persona 2 — Arjun (Hotel Operations Manager), Persona 3 — Chef Meena (Head Chef / Kitchen Staff), Persona 4 — Kai (Food Truck Operator), Persona 5 — Priya (Customer / Guest)

### Community 119 - "README.md"
Cohesion: 0.18
Nodes (5): Data Retention Policy, Design Principles, DineFlow — Database Design, Entity Relationship Overview, Index Strategy Summary

### Community 120 - "NewOTPProvider"
Cohesion: 0.22
Nodes (9): Config, redis.Client, NewMSG91Provider(), redis.Client, NewOTPProvider(), TestMSG91ProviderFallback(), net/http.Client, Config (+1 more)

### Community 121 - "Phase 2 — Restaurant MVP"
Cohesion: 0.25
Nodes (8): 2A — Business Onboarding, 2B — Menu Management, 2C — QR Code System, 2D — Customer Ordering Experience, 2E — Order Management (Staff Dashboard), 2F — Kitchen Display System, 2G — Basic Analytics, Phase 2 — Restaurant MVP

### Community 122 - "Notification"
Cohesion: 0.48
Nodes (5): CreateNotificationRequest, Category, CreateNotificationInput, Notification, Priority

### Community 123 - "scan/route.ts"
Cohesion: 0.33
Nodes (6): callGeminiVision(), GEMINI_MODELS, maxDuration, POST(), RawMenuItem, ScanMenuRequestBody

### Community 124 - "indian-food-database.ts"
Cohesion: 0.29
Nodes (5): INDIAN_CATEGORIES, INDIAN_DISH_CATALOG, IndianCategory, IndianDishEntry, OCR_TYPO_CORRECTIONS

### Community 125 - "search/service.go"
Cohesion: 0.29
Nodes (8): SearchHandler, NewSearchHandler(), go_pkg_github_com_dineflow_api_internal_application_search, SearchFilterOptions, SearchResponse, SearchResultItem, SearchResultsGrouped, Service

### Community 126 - "5. Component Library"
Cohesion: 0.33
Nodes (6): 5. Component Library, Badges / Status Chips, Button System, Cards, Input Fields, KDS Order Card

### Community 128 - "label.tsx"
Cohesion: 0.50
Nodes (4): Label, labelVariants, class-variance-authority, @radix-ui/react-label

### Community 129 - "7. Layout System"
Cohesion: 0.40
Nodes (5): 7. Layout System, Customer Ordering Page, Dashboard Layout, Grid System, KDS Layout

### Community 131 - "next.config.ts"
Cohesion: 0.50
Nodes (3): nextConfig, securityHeaders, next

### Community 132 - "6. Animation & Micro-Interactions"
Cohesion: 0.50
Nodes (4): 6. Animation & Micro-Interactions, Animation Tokens, Key Animations, Rules

## Knowledge Gaps
- **671 isolated node(s):** `TestResult`, `github.com/dineflow/api`, `geminiRequest`, `geminiResponse`, `SendOTPRequest` (+666 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 804 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `label.tsx`, `useAuthStore`, `staff/page.tsx`, `useToast`, `TubesCursor`, `cn`, `ui/pricing.tsx`, `utils.ts`, `menu/page.tsx`, `peeking-chef.tsx`, `register/page.tsx`, `whatsapp/page.tsx`, `web/package.json`, `notifications/page.tsx`, `app/layout.tsx`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `main()` connect `main` to `go_pkg_context`, `server/main.go`, `handlers/room.go`, `Service`, `security-audit/main.go`, `Service`, `tenant/tenant.go`, `testing.T`, `Setup`, `config.go`, `context.Context`, `go_pkg_time`, `search/service.go`, `handlers/menu.go`, `Service`, `NewOTPProvider`, `storage/storage.go`, `Service`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `Client` connect `main` to `go_pkg_go_mongodb_org_mongo_driver_v2_bson`, `github.com/gin-gonic/gin.Context`, `NewScope`, `go.mongodb.org/mongo-driver/v2/bson.ObjectID`, `Service`, `tenant/tenant.go`, `testing.T`, `Service`, `context.Context`, `search/service.go`, `Order`, `Service`, `Subscription`, `Service`, `Service`, `whatsapp/whatsapp.go`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `TestResult`, `github.com/dineflow/api`, `geminiRequest` to the rest of the system?**
  _671 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `OK` be split into smaller, more focused modules?**
  _Cohesion score 0.1276595744680851 - nodes in this community are weakly interconnected._
- **Should `staff/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07386363636363637 - nodes in this community are weakly interconnected._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.12136350279165442 - nodes in this community are weakly interconnected._