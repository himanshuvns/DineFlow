# Graph Report - DineFlow  (2026-09-18)

## Corpus Check
- 271 files · ~341,989 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .example 2, .toml 1)

## Summary
- 2267 nodes · 6300 edges · 123 communities (90 shown, 33 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e447f966`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- OK
- orders/page.tsx
- lucide-react
- go_pkg_context
- useToast
- go_pkg_time
- server/main.go
- go.mongodb.org/mongo-driver/v2/bson.ObjectID
- Service
- whatsapp/service.go
- ai/service.go
- generate-logo/route.ts
- 2. Functional Requirements
- utils.ts
- go_pkg_go_mongodb_org_mongo_driver_v2_bson
- config.go
- menu/page.tsx
- context.Context
- Service
- DineFlow — UI/UX Guidelines
- BadRequest
- Subscription
- Order
- staff/page.tsx
- web/package.json
- Scope
- handlers/whatsapp.go
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
- react
- devDependencies
- scripts
- toast.tsx
- time.Time
- DineFlow — System Architecture
- Service
- DineFlow — API Strategy
- eslint.config.mjs
- scripts
- web/vercel.json
- vercel.json
- peeking-chef.tsx
- Service
- postcss.config.mjs
- github.com/dineflow/api
- printer.go
- .ProcessChatbotMessage
- DineFlow — Subscription Model
- response.go
- RoomHandler
- Collections
- .LogMessage
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
- .SendInvoiceViaWhatsApp
- roles.ts
- DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)
- Code Quality Standards
- Service
- DineFlow — Antigravity (`agy`) Workspace Rules
- Setup
- Phase 2 — Restaurant MVP
- README.md
- Ponytail: Anti-Overengineering & YAGNI Guardrails
- Ponytail Technical Debt Analysis
- Ponytail Configuration & Status
- web/README.md
- MenuItem
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
- 3. Non-Functional Requirements
- 1. User Personas
- Feature Flag System
- Frontend Architecture
- theme-provider.tsx
- search/service.go

## God Nodes (most connected - your core abstractions)
1. `OK()` - 135 edges
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
- `UpdateOrderStatusRequest` --references--> `OrderStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/order.go → apps/api/internal/domain/order/order.go
- `TestGenerateKOTText()` --calls--> `GenerateKOTText()`  [INFERRED]
  apps/api/internal/domain/printer/printer_test.go → apps/api/internal/domain/printer/printer.go
- `TestGenerateBillText()` --calls--> `GenerateBillText()`  [INFERRED]
  apps/api/internal/domain/printer/printer_test.go → apps/api/internal/domain/printer/printer.go

## Import Cycles
- None detected.

## Communities (123 total, 33 thin omitted)

### Community 0 - "OK"
Cohesion: 0.12
Nodes (5): PlatformHandler, TenantHandler, InternalError(), OK(), OKWithMeta()

### Community 1 - "orders/page.tsx"
Cohesion: 0.16
Nodes (11): INITIAL_KDS_ORDERS, KdsItem, KdsOrder, KDSOrdersPage(), MENU_PRESETS, EmptyState(), EmptyStateAction, EmptyStateProps (+3 more)

### Community 2 - "lucide-react"
Cohesion: 0.14
Nodes (36): DAYS, ForecastPage(), generateForecast(), getIntensityClass(), HOURS, INSIGHTS, MOCK_DESCRIPTIONS, SAMPLE_ITEMS (+28 more)

### Community 3 - "go_pkg_context"
Cohesion: 0.08
Nodes (21): Client, New(), Config, redis.Client, NewFirebaseTestProvider(), Config, redis.Client, NewMSG91Provider() (+13 more)

### Community 4 - "useToast"
Cohesion: 0.06
Nodes (43): ForgotPasswordPage(), VerifyContent(), getDescription(), MenuWriterPage(), PricingAlertsPage(), UpsellPage(), AnalyticsPage(), DashboardOverviewPage() (+35 more)

### Community 5 - "go_pkg_time"
Cohesion: 0.07
Nodes (40): CategoryShare, HourlyPoint, OverviewMetrics, TopItemMetric, NewService(), NewService(), NewService(), NewService() (+32 more)

### Community 6 - "server/main.go"
Cohesion: 0.06
Nodes (44): corsMiddleware(), NewAIHandler(), NewAnalyticsHandler(), NewAuthHandler(), Health(), SetHealthDeps(), Version(), NewPlatformHandler() (+36 more)

### Community 7 - "go.mongodb.org/mongo-driver/v2/bson.ObjectID"
Cohesion: 0.11
Nodes (14): NewScope(), go.mongodb.org/mongo-driver/v2/bson.ObjectID, Category, Service, NotificationEmitter, Service, Invoice, AttendanceRecord (+6 more)

### Community 8 - "Service"
Cohesion: 0.10
Nodes (17): NewService(), TestIndianPhoneValidation(), ValidateAndNormalizeIndianPhone(), go_pkg_errors, CheckInInput, Guest, GuestStatus, HotelStats (+9 more)

### Community 9 - "whatsapp/service.go"
Cohesion: 0.07
Nodes (28): NewRoomHandler(), NewStaffHandler(), go_pkg_crypto_hmac, go_pkg_encoding_base64, go_pkg_github_com_dineflow_api_internal_application_notification, go_pkg_github_com_dineflow_api_internal_application_order, go_pkg_github_com_dineflow_api_internal_application_room, go_pkg_github_com_dineflow_api_internal_application_staff (+20 more)

### Community 10 - "ai/service.go"
Cohesion: 0.12
Nodes (25): ChatbotMessage, ChatbotResponse, ChatTurn, ForecastDay, ForecastHour, ForecastResponse, geminiRequest, geminiResponse (+17 more)

### Community 11 - "generate-logo/route.ts"
Cohesion: 0.06
Nodes (22): ACTIVE_GEMINI_MODELS, ARCHETYPE_CONFIGS, createArchetypeLogo(), generateArchetypeProceduralSvg(), GenerateLogoRequest, generateWithGemini(), LogoVariation, maxDuration (+14 more)

### Community 12 - "2. Functional Requirements"
Cohesion: 0.14
Nodes (14): 2.10 Staff Management, 2.11 WhatsApp Integration, 2.12 Analytics & Reporting, 2.13 Settings & Configuration, 2.1 Authentication & Multi-Tenancy, 2.2 Subscription & Billing, 2.3 Onboarding, 2.4 Menu Management (+6 more)

### Community 13 - "utils.ts"
Cohesion: 0.07
Nodes (47): LoginPage(), DEFAULT_ROOMS, getStayMetrics(), HotelStats, RoomItem, RoomsDirectoryPage(), getStayMetrics(), HousekeepingTask (+39 more)

### Community 14 - "go_pkg_go_mongodb_org_mongo_driver_v2_bson"
Cohesion: 0.10
Nodes (29): TestSearchScenarios(), NewService(), TestSearchAll_EmptyQuery(), TestSearchAll_ShortQuery(), NewService(), TestApplyLeave_Validation(), TestCreateHoliday_Validation(), TestCreateShift_Validation() (+21 more)

### Community 15 - "config.go"
Cohesion: 0.12
Nodes (23): getEnv(), getEnvInt(), Load(), requireEnv(), Maker, NewMaker(), AIConfig, AppConfig (+15 more)

### Community 16 - "menu/page.tsx"
Cohesion: 0.08
Nodes (52): callGeminiVision(), GEMINI_MODELS, maxDuration, POST(), RawMenuItem, ScanMenuRequestBody, IMAGE_PRESETS, MenuManagementPage() (+44 more)

### Community 17 - "context.Context"
Cohesion: 0.11
Nodes (21): CalculateHealthScore(), context.Context, AnnouncementInfo, AuditActor, AuditLogRecord, BusinessType, ClientStatus, DashboardMetrics (+13 more)

### Community 18 - "Service"
Cohesion: 0.13
Nodes (11): cleanGuestName(), cleanOrderNumber(), cleanTableName(), NewService(), CreateNotificationRequest, Category, CreateNotificationInput, ListFilter (+3 more)

### Community 19 - "DineFlow — UI/UX Guidelines"
Cohesion: 0.04
Nodes (44): 10. Responsive Breakpoints, 11. Iconography, 12. Empty States, 13. Toast / Notification System, 1. Design Philosophy, 2. Color Palette, 3. Typography, 4. Spacing System (+36 more)

### Community 20 - "BadRequest"
Cohesion: 0.09
Nodes (9): MenuHandler, NotificationHandler, StaffHandler, TableHandler, GetTenantID(), GetUserID(), BadRequest(), Created() (+1 more)

### Community 21 - "Subscription"
Cohesion: 0.19
Nodes (11): FormatPlanName(), GetLimits(), AdminOverrideRequest, CheckoutRequest, BillingCycle, PlanLimits, PlanTier, Service (+3 more)

### Community 22 - "Order"
Cohesion: 0.20
Nodes (9): Order, DestinationType, OrderItem, OrderItemModifier, OrderSource, OrderStatus, OrderTimeline, PaymentStatus (+1 more)

### Community 23 - "staff/page.tsx"
Cohesion: 0.04
Nodes (51): RegisterPage(), ResetPasswordPage(), AttendanceRecord, BankDetails, calculateDistanceM(), EmergencyContact, GeofenceConfig, Holiday (+43 more)

### Community 24 - "web/package.json"
Cohesion: 0.08
Nodes (23): typescript, name, packageManager, private, version, axios, class-variance-authority, clsx (+15 more)

### Community 25 - "Scope"
Cohesion: 0.21
Nodes (8): ensureUpdatedAt(), go.mongodb.org/mongo-driver/v2/bson.M, go.mongodb.org/mongo-driver/v2/mongo.Cursor, go.mongodb.org/mongo-driver/v2/mongo.DeleteResult, go.mongodb.org/mongo-driver/v2/mongo.InsertManyResult, go.mongodb.org/mongo-driver/v2/mongo.InsertOneResult, go.mongodb.org/mongo-driver/v2/mongo.UpdateResult, Scope

### Community 26 - "handlers/whatsapp.go"
Cohesion: 0.13
Nodes (16): NewService(), TestWorkforceCheckInMessageFormat(), TestWorkforceTokens(), NewWhatsAppHandler(), setupTestRouter(), TestDualModeWebhookRouter(), TestVerifyCheckInTokenHandler(), TestVerifyWebhookChallenge() (+8 more)

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
Cohesion: 0.14
Nodes (11): apps_web_app_globals, manrope, metadata, plusJakarta, spaceGrotesk, viewport, nextConfig, QueryProvider() (+3 more)

### Community 32 - "tasks"
Cohesion: 0.11
Nodes (17): dependsOn, inputs, outputs, cache, cache, persistent, dependsOn, $schema (+9 more)

### Community 33 - "useAuthStore"
Cohesion: 0.10
Nodes (28): DashboardLayout(), PlatformLayout(), CATEGORY_CONFIG, FILTER_CHIPS, QUICK_ACTIONS, QuickActionItem, RecentSearchItem, SearchResultItem (+20 more)

### Community 34 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 35 - "main"
Cohesion: 0.08
Nodes (26): main(), requestLogger(), runStartupCleanup(), NewService(), NewService(), New(), GetHub(), Hub (+18 more)

### Community 36 - "package.json"
Cohesion: 0.09
Nodes (21): description, devDependencies, prettier, turbo, typescript, engines, node, typescript (+13 more)

### Community 37 - "github.com/gin-gonic/gin.Context"
Cohesion: 0.09
Nodes (7): AIHandler, AuthHandler, WhatsAppHandler, ByTenant(), PlanLimitMiddleware(), PlanLimitExceeded(), github.com/gin-gonic/gin.Context

### Community 38 - "DineFlow — Development Plan"
Cohesion: 0.10
Nodes (21): 1.1 — Monorepo Setup, 1.2 — Backend Foundation (Go), 1.3 — Authentication Service, 1.4 — Multi-Tenancy Middleware, 1.5 — Frontend Foundation (Next.js), 1.6 — File Storage, 1.7 — Email Service, Definition of Done (+13 more)

### Community 39 - "react"
Cohesion: 0.05
Nodes (44): BUSINESS_CATEGORIES, BusinessCategory, BusinessCategorySelector(), BusinessCategorySelectorProps, ChefMascot(), ChefMascotProps, FloatingCard(), FloatingCardProps (+36 more)

### Community 40 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti, @types/node, @types/react (+2 more)

### Community 41 - "scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, test, version

### Community 42 - "toast.tsx"
Cohesion: 0.07
Nodes (27): COMPARISON_ROWS, PLANS, PlanTier, PricingPage(), CustomerExtendStayModal(), CustomerExtendStayModalProps, CustomerHousekeepingSheetProps, SERVICE_OPTIONS (+19 more)

### Community 43 - "time.Time"
Cohesion: 0.13
Nodes (26): cleanPhoneNumber(), CalculateDistanceMeters(), DefaultPermissionsForRole(), PublicProfile, User, IsPlatformRole(), TestCalculateDistanceMeters(), time.Time (+18 more)

### Community 44 - "DineFlow — System Architecture"
Cohesion: 0.09
Nodes (23): Architecture Philosophy, Backend Architecture, Clean Architecture Dependency Flow, Database Architecture, Deployment Architecture, Deployment Pipeline, DineFlow — System Architecture, High-Level Architecture Diagram (+15 more)

### Community 45 - "Service"
Cohesion: 0.07
Nodes (34): seedDefaultData(), seedPlatformData(), generateSlug(), ValidatePasswordComplexity(), FeaturesForPlan(), BusinessType, Tenant, LimitsForPlan() (+26 more)

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

### Community 52 - "Service"
Cohesion: 0.13
Nodes (6): NotificationEmitter, Service, WhatsAppConfig, WorkforceCheckInInput, WorkforceCheckInResult, WorkforceTokenVerifyResult

### Community 55 - "printer.go"
Cohesion: 0.36
Nodes (10): centerText(), GenerateBillText(), GenerateKOTText(), padRow(), truncate(), BillData, BillItem, KOTData (+2 more)

### Community 56 - ".ProcessChatbotMessage"
Cohesion: 0.21
Nodes (7): TestPhoneNumberNormalization(), IsOptOutKeyword(), NormalizePhoneNumber(), ParseRating(), TestIsOptOutKeyword(), TestParseRating(), InboundResult

### Community 57 - "DineFlow — Subscription Model"
Cohesion: 0.08
Nodes (23): Billing Cycle Options, Billing Mechanics, DineFlow — Subscription Model, Downgrade Execution (Day 14), 🆓 Free — "Just Getting Started", Future: Platform License, Grace Period & Downgrade Automation, Grace Period Flow (+15 more)

### Community 58 - "response.go"
Cohesion: 0.10
Nodes (16): clearRefreshTokenCookie(), AuthHandler, setRefreshTokenCookie(), Auth(), GetRole(), GetTokenID(), Conflict(), FeatureNotAvailable() (+8 more)

### Community 60 - "Collections"
Cohesion: 0.10
Nodes (20): Collection: `audit_logs`, Collection: `categories`, Collection: `locations`, Collection: `menu_items`, Collection: `menus`, Collection: `modifier_groups`, Collection: `notifications`, Collection: `orders` (+12 more)

### Community 61 - ".LogMessage"
Cohesion: 0.26
Nodes (7): BuildFeedbackRequestMessage(), BuildKitchenReadyMessage(), BuildOrderConfirmationMessage(), MessageLog, MessageStatus, OrderConfirmationData, TemplateType

### Community 62 - "whatsapp/whatsapp.go"
Cohesion: 0.13
Nodes (26): Campaign, CampaignStats, CampaignStatus, CampaignType, ChatbotSession, ChatbotState, InteractiveButton, InteractiveRow (+18 more)

### Community 63 - "DineFlow — Feature Roadmap"
Cohesion: 0.10
Nodes (21): 2A — Business Onboarding, 2B — Menu Management, 2C — QR Code System, 2D — Customer Ordering Experience, 2E — Order Management (Staff Dashboard), 2F — Kitchen Display System, 2G — Basic Analytics, Cross-Phase Dependencies Map (+13 more)

### Community 64 - "DineFlow — Product Vision"
Cohesion: 0.10
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

### Community 73 - ".SendInvoiceViaWhatsApp"
Cohesion: 0.19
Nodes (9): CalculateGST(), GetStandardTemplates(), InterpolateTemplate(), TestBuildOrderConfirmationMessage(), TestCalculateGST(), TestGetStandardTemplates(), TestInterpolateTemplate(), CustomerInvoice (+1 more)

### Community 74 - "roles.ts"
Cohesion: 0.17
Nodes (8): canManageSupport(), getRoleBadgeClass(), isPlatformRole(), PLATFORM_ROLES, PlatformRole, TENANT_ROLES, TenantRole, UserRole

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
Cohesion: 0.14
Nodes (4): AnalyticsHandler, OrderHandler, RateLimit(), Setup()

### Community 80 - "Phase 2 — Restaurant MVP"
Cohesion: 0.22
Nodes (9): 2.1 — Onboarding, 2.2 — Menu Management, 2.3 — Table & QR Code Management, 2.4 — Customer Ordering Experience, 2.5 — WebSocket / Real-Time, 2.6 — Order Management (Staff Dashboard), 2.7 — Kitchen Display System, 2.8 — Basic Analytics (+1 more)

### Community 81 - "README.md"
Cohesion: 0.15
Nodes (6): 4. User Journeys, DineFlow — Product Requirements, Journey 1 — New Restaurant Onboarding, Journey 2 — Customer Orders via QR, Journey 3 — Subscription Renewal Failure, Journey 4 — Hotel Room Service

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

### Community 86 - "MenuItem"
Cohesion: 0.42
Nodes (7): buildMenuItemFromUpsertRequest(), UpsertItemRequest, DietaryTag, MenuItem, ModifierGroup, ModifierOption, Variant

### Community 88 - "Service"
Cohesion: 0.21
Nodes (6): BulkCreateRoomsRequest, CreateTableRequest, LocationType, Service, Table, TableStatus

### Community 117 - "3. Non-Functional Requirements"
Cohesion: 0.29
Nodes (7): 3.1 Performance, 3.2 Scalability, 3.3 Reliability, 3.4 Security, 3.5 Accessibility, 3.6 Internationalisation, 3. Non-Functional Requirements

### Community 118 - "1. User Personas"
Cohesion: 0.33
Nodes (6): 1. User Personas, Persona 1 — Riya (Restaurant Owner), Persona 2 — Arjun (Hotel Operations Manager), Persona 3 — Chef Meena (Head Chef / Kitchen Staff), Persona 4 — Kai (Food Truck Operator), Persona 5 — Priya (Customer / Guest)

### Community 119 - "Feature Flag System"
Cohesion: 0.50
Nodes (4): Enforcement Layers, Feature Flag System, Implementation, Upgrade Prompt Pattern

### Community 120 - "Frontend Architecture"
Cohesion: 0.50
Nodes (4): Application Structure, Customer Ordering Page — SSG + ISR, Frontend Architecture, Stack

### Community 123 - "theme-provider.tsx"
Cohesion: 0.33
Nodes (5): ResolvedTheme, Theme, ThemeContext, ThemeContextType, ThemeProvider()

### Community 125 - "search/service.go"
Cohesion: 0.29
Nodes (8): SearchHandler, NewSearchHandler(), go_pkg_github_com_dineflow_api_internal_application_search, SearchFilterOptions, SearchResponse, SearchResultItem, SearchResultsGrouped, Service

## Knowledge Gaps
- **662 isolated node(s):** `github.com/dineflow/api`, `geminiRequest`, `geminiResponse`, `SendOTPRequest`, `ClockInRequest` (+657 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 797 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `useAuthStore`, `lucide-react`, `orders/page.tsx`, `useToast`, `TubesCursor`, `toast.tsx`, `theme-provider.tsx`, `utils.ts`, `menu/page.tsx`, `peeking-chef.tsx`, `staff/page.tsx`, `web/package.json`, `notifications/page.tsx`, `app/layout.tsx`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `Service` connect `Service` to `main`, `github.com/gin-gonic/gin.Context`, `go.mongodb.org/mongo-driver/v2/bson.ObjectID`, `whatsapp/service.go`, `.SendInvoiceViaWhatsApp`, `Service`, `.ProcessChatbotMessage`, `handlers/whatsapp.go`, `.LogMessage`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `lucide-react` to `useAuthStore`, `orders/page.tsx`, `useToast`, `react`, `toast.tsx`, `utils.ts`, `menu/page.tsx`, `staff/page.tsx`, `web/package.json`, `notifications/page.tsx`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `github.com/dineflow/api`, `geminiRequest`, `geminiResponse` to the rest of the system?**
  _662 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `OK` be split into smaller, more focused modules?**
  _Cohesion score 0.1246376811594203 - nodes in this community are weakly interconnected._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.13623188405797101 - nodes in this community are weakly interconnected._
- **Should `go_pkg_context` be split into smaller, more focused modules?**
  _Cohesion score 0.0761904761904762 - nodes in this community are weakly interconnected._