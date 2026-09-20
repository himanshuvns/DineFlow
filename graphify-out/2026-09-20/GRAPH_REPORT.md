# Graph Report - DineFlow  (2026-09-20)

## Corpus Check
- 304 files · ~374,839 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .example 2, .toml 1)

## Summary
- 2511 nodes · 6997 edges · 132 communities (95 shown, 37 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 54 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6249ea9d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- OK
- useToast
- react
- whatsapp/service.go
- toast.tsx
- go_pkg_time
- server/main.go
- security-audit/main.go
- context.Context
- Service
- Service
- ref_next_server
- 2. Functional Requirements
- [roomNumber]/page.tsx
- go_pkg_go_mongodb_org_mongo_driver_v2_bson
- config.go
- NotFound
- Service
- Client
- DineFlow — UI/UX Guidelines
- BadRequest
- Subscription
- go.mongodb.org/mongo-driver/v2/bson.ObjectID
- rooms/page.tsx
- web/package.json
- Scope
- order/service.go
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
- platform-store.ts
- NewScope
- DineFlow — System Architecture
- staff/page.tsx
- DineFlow — API Strategy
- eslint.config.mjs
- scripts
- web/vercel.json
- vercel.json
- Service
- OpenWAProvider
- postcss.config.mjs
- github.com/dineflow/api
- printer.go
- Hub
- DineFlow — Subscription Model
- response.go
- time.Time
- Collections
- Service
- Setup
- DineFlow — Feature Roadmap
- DineFlow — Product Vision
- spotlight-cursor.tsx
- DineFlow
- Audit Scope & Checklist
- Responsive Verification Checklist
- Security Checklist
- DineFlow — Questions, Assumptions & Risks
- Architectural Assessment Dimensions
- Review Pillars
- DineFlow — OpenWA Local Development & Testing Guide
- theme-provider.tsx
- DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)
- Code Quality Standards
- Maker
- DineFlow — Antigravity (`agy`) Workspace Rules
- landing-workflow.tsx
- generate-logo/route.ts
- Service
- Ponytail: Anti-Overengineering & YAGNI Guardrails
- Ponytail Technical Debt Analysis
- Ponytail Configuration & Status
- web/README.md
- menu/menu.go
- handlers/room.go
- Phase 2 — Restaurant MVP
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
- Phase 1 — Foundation & Infrastructure
- SubscriptionHandler
- menu-nlp-engine.ts
- table/route.ts
- README.md
- next.config.ts
- TableHandler
- Problems Solved
- scan/route.ts
- hub.go
- Service
- tasks/route.ts
- health.go
- demo.tsx
- app/page.tsx
- deploy.sh
- gen-secrets.sh

## God Nodes (most connected - your core abstractions)
1. `OK()` - 148 edges
2. `BadRequest()` - 130 edges
3. `react` - 115 edges
4. `GetTenantID()` - 109 edges
5. `Unauthorized()` - 105 edges
6. `lucide-react` - 91 edges
7. `InternalError()` - 87 edges
8. `useToast()` - 87 edges
9. `cn()` - 78 edges
10. `Button` - 60 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `seedDefaultData()`  [INFERRED]
  apps/api/cmd/server/main.go → apps/api/cmd/server/seed.go
- `main()` --calls--> `SetHealthDeps()`  [EXTRACTED]
  apps/api/cmd/server/main.go → apps/api/internal/interfaces/http/handlers/health.go
- `UpdateRoomStatusRequest` --references--> `RoomStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/room.go → apps/api/internal/domain/room/room.go
- `TestDefaultPermissionsForRole()` --calls--> `DefaultPermissionsForRole()`  [INFERRED]
  apps/api/internal/domain/user/user_test.go → apps/api/internal/domain/user/user.go
- `TestUserToPublic()` --calls--> `DefaultPermissionsForRole()`  [INFERRED]
  apps/api/internal/domain/user/user_test.go → apps/api/internal/domain/user/user.go

## Import Cycles
- None detected.

## Communities (132 total, 37 thin omitted)

### Community 0 - "OK"
Cohesion: 0.12
Nodes (5): PlatformHandler, TenantHandler, InternalError(), OK(), OKWithMeta()

### Community 1 - "useToast"
Cohesion: 0.08
Nodes (30): VerifyContent(), getDescription(), MenuWriterPage(), PricingAlertsPage(), UpsellPage(), AnalyticsPage(), OrderStatus, OrderTrackingPage() (+22 more)

### Community 2 - "react"
Cohesion: 0.10
Nodes (43): DAYS, ForecastPage(), generateForecast(), getIntensityClass(), HOURS, INSIGHTS, MOCK_DESCRIPTIONS, SAMPLE_ITEMS (+35 more)

### Community 3 - "whatsapp/service.go"
Cohesion: 0.11
Nodes (18): SendOTPRequest, go_pkg_crypto_rand, go_pkg_encoding_csv, go_pkg_encoding_hex, go_pkg_github_com_dineflow_api_internal_application_notification, go_pkg_github_com_dineflow_api_internal_application_staff, go_pkg_github_com_dineflow_api_internal_domain_notification, go_pkg_github_com_dineflow_api_internal_domain_tenant (+10 more)

### Community 4 - "toast.tsx"
Cohesion: 0.08
Nodes (45): IMAGE_PRESETS, MenuManagementPage(), INITIAL_KDS_ORDERS, KdsItem, KdsOrder, KDSOrdersPage(), MENU_PRESETS, DashboardOverviewPage() (+37 more)

### Community 5 - "go_pkg_time"
Cohesion: 0.13
Nodes (19): geminiRequest, geminiResponse, go_pkg_bytes, go_pkg_context, go_pkg_encoding_json, go_pkg_fmt, go_pkg_github_com_dineflow_api_internal_domain_table, go_pkg_github_com_dineflow_api_internal_domain_whatsapp (+11 more)

### Community 6 - "server/main.go"
Cohesion: 0.06
Nodes (42): go_pkg_github_com_dineflow_api_internal_application_ai, go_pkg_github_com_dineflow_api_internal_application_analytics, go_pkg_github_com_dineflow_api_internal_application_auth, go_pkg_github_com_dineflow_api_internal_application_menu, go_pkg_github_com_dineflow_api_internal_application_order, go_pkg_github_com_dineflow_api_internal_application_platform, go_pkg_github_com_dineflow_api_internal_application_search, go_pkg_github_com_dineflow_api_internal_application_subscription (+34 more)

### Community 7 - "security-audit/main.go"
Cohesion: 0.23
Nodes (13): main(), testCORSOriginDefense(), testMetaWebhookHMACSignature(), testNoSQLInjectionInBody(), testNoSQLInjectionInQueryParams(), testRequestIDTracing(), testSecurityHeaders(), hasOperatorInjection() (+5 more)

### Community 8 - "context.Context"
Cohesion: 0.13
Nodes (15): Service, context.Context, CreateTaskRequest, UpdateTaskRequest, Guest, GuestStatus, HousekeepingTask, Room (+7 more)

### Community 9 - "Service"
Cohesion: 0.04
Nodes (55): Service, BuildFeedbackRequestMessage(), BuildKitchenReadyMessage(), BuildOrderConfirmationMessage(), CalculateGST(), GetStandardTemplates(), InterpolateTemplate(), IsOptOutKeyword() (+47 more)

### Community 10 - "Service"
Cohesion: 0.12
Nodes (24): ChatbotMessage, ChatbotResponse, ChatTurn, ForecastDay, ForecastHour, ForecastResponse, MenuDescriptionRequest, MenuDescriptionResponse (+16 more)

### Community 11 - "ref_next_server"
Cohesion: 0.11
Nodes (9): dynamic, revalidate, dynamic, dynamic, revalidate, dynamic, revalidate, config (+1 more)

### Community 12 - "2. Functional Requirements"
Cohesion: 0.06
Nodes (33): 1. User Personas, 2.10 Staff Management, 2.11 WhatsApp Integration, 2.12 Analytics & Reporting, 2.13 Settings & Configuration, 2.1 Authentication & Multi-Tenancy, 2.2 Subscription & Billing, 2.3 Onboarding (+25 more)

### Community 13 - "[roomNumber]/page.tsx"
Cohesion: 0.13
Nodes (23): MenuItem, RoomInfo, RoomServiceMenuPage(), SuiteTab, CustomerMenuPage(), matchesTable(), CustomerCartDrawer(), CustomerCartDrawerProps (+15 more)

### Community 14 - "go_pkg_go_mongodb_org_mongo_driver_v2_bson"
Cohesion: 0.06
Nodes (53): TestSearchScenarios(), NewService(), TestSearchAll_EmptyQuery(), TestSearchAll_ShortQuery(), NewService(), TestApplyLeave_Validation(), TestCreateHoliday_Validation(), TestCreateShift_Validation() (+45 more)

### Community 15 - "config.go"
Cohesion: 0.16
Nodes (18): getEnv(), getEnvInt(), Load(), requireEnv(), AIConfig, AppConfig, Config, EmailConfig (+10 more)

### Community 17 - "Service"
Cohesion: 0.08
Nodes (23): CalculateHealthScore(), AnnouncementInfo, AuditActor, AuditLogRecord, BusinessType, ClientStatus, DashboardMetrics, FeatureFlagDefinition (+15 more)

### Community 18 - "Client"
Cohesion: 0.11
Nodes (4): Client, New(), time.Duration, RateLimitResult

### Community 19 - "DineFlow — UI/UX Guidelines"
Cohesion: 0.04
Nodes (44): 10. Responsive Breakpoints, 11. Iconography, 12. Empty States, 13. Toast / Notification System, 1. Design Philosophy, 2. Color Palette, 3. Typography, 4. Spacing System (+36 more)

### Community 20 - "BadRequest"
Cohesion: 0.09
Nodes (10): MenuHandler, NotificationHandler, RoomHandler, StaffHandler, GetTenantID(), GetUserID(), ByTenant(), BadRequest() (+2 more)

### Community 21 - "Subscription"
Cohesion: 0.17
Nodes (12): FormatPlanName(), GetLimits(), AdminOverrideRequest, CheckoutRequest, BillingCycle, Invoice, PlanLimits, PlanTier (+4 more)

### Community 22 - "go.mongodb.org/mongo-driver/v2/bson.ObjectID"
Cohesion: 0.07
Nodes (22): Service, cleanGuestName(), cleanOrderNumber(), cleanTableName(), Service, Order, go.mongodb.org/mongo-driver/v2/bson.ObjectID, CreateNotificationRequest (+14 more)

### Community 23 - "rooms/page.tsx"
Cohesion: 0.06
Nodes (51): ForgotPasswordContent(), Step, LoginPage(), RegisterPage(), ResetPasswordContent(), DEFAULT_ROOMS, getStayMetrics(), HotelStats (+43 more)

### Community 24 - "web/package.json"
Cohesion: 0.09
Nodes (21): typescript, name, packageManager, private, version, clsx, eslint, eslint-config-next (+13 more)

### Community 25 - "Scope"
Cohesion: 0.21
Nodes (8): ensureUpdatedAt(), go.mongodb.org/mongo-driver/v2/bson.M, go.mongodb.org/mongo-driver/v2/mongo.Cursor, go.mongodb.org/mongo-driver/v2/mongo.DeleteResult, go.mongodb.org/mongo-driver/v2/mongo.InsertManyResult, go.mongodb.org/mongo-driver/v2/mongo.InsertOneResult, go.mongodb.org/mongo-driver/v2/mongo.UpdateResult, Scope

### Community 26 - "order/service.go"
Cohesion: 0.09
Nodes (28): CategoryShare, HourlyPoint, OverviewMetrics, TopItemMetric, TestOrderCalculations(), TestOrderStatusTransitions(), ParseObjectID(), go_pkg_errors (+20 more)

### Community 27 - "notifications/page.tsx"
Cohesion: 0.11
Nodes (23): CATEGORIES, CATEGORY_META, NotificationsPage(), PRIORITIES, PRIORITY_BADGE, timeAgo(), calculateDistanceMeters(), CheckInContent() (+15 more)

### Community 28 - "storage/storage.go"
Cohesion: 0.16
Nodes (12): StorageService, NewService(), TestStorageValidation(), StorageHandler, NewStorageHandler(), go_pkg_crypto_sha256, go_pkg_github_com_dineflow_api_internal_infrastructure_storage, go_pkg_path_filepath (+4 more)

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

### Community 33 - "useAuthStore"
Cohesion: 0.06
Nodes (39): DashboardLayout(), RootLoading(), PlatformLayout(), CATEGORY_CONFIG, FILTER_CHIPS, QUICK_ACTIONS, QuickActionItem, RecentSearchItem (+31 more)

### Community 34 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 35 - "main"
Cohesion: 0.11
Nodes (23): corsMiddleware(), main(), requestLogger(), runStartupCleanup(), NewService(), NewService(), NewService(), NewService() (+15 more)

### Community 36 - "package.json"
Cohesion: 0.09
Nodes (21): description, devDependencies, prettier, turbo, typescript, engines, node, typescript (+13 more)

### Community 37 - "github.com/gin-gonic/gin.Context"
Cohesion: 0.09
Nodes (8): AIHandler, AnalyticsHandler, WhatsAppHandler, verifyMetaSignature(), verifyOpenWASignature(), ByIP(), ByIPAndRoute(), github.com/gin-gonic/gin.Context

### Community 38 - "DineFlow — Development Plan"
Cohesion: 0.15
Nodes (13): Definition of Done, DineFlow — Development Plan, E2E Tests (Playwright), How to Read This Plan, Integration Tests, Performance Tests (k6), Phase 0 — Planning & Architecture, Phase 3 — Hotel Module (+5 more)

### Community 39 - "cn"
Cohesion: 0.04
Nodes (58): INITIAL_INVOICES, Invoice, SettingsPage(), CampaignItem, CustomerInvoice, CustomerInvoiceItem, INITIAL_CAMPAIGNS, INITIAL_INVOICES (+50 more)

### Community 40 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti, @types/node, @types/react (+2 more)

### Community 41 - "scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, test, version

### Community 42 - "platform-store.ts"
Cohesion: 0.09
Nodes (22): AuditLogEntry, BusinessType, ClientStatus, DashboardMetrics, FeatureFlagDefinition, INITIAL_AUDIT_LOGS, INITIAL_CLIENTS, INITIAL_FEATURE_FLAGS (+14 more)

### Community 43 - "NewScope"
Cohesion: 0.07
Nodes (20): CalculateDistanceMeters(), NewScope(), buildMenuItemFromUpsertRequest(), Category, MenuItem, PublicCategorySection, PublicMenuResponse, Service (+12 more)

### Community 44 - "DineFlow — System Architecture"
Cohesion: 0.07
Nodes (27): Application Structure, Architecture Philosophy, Backend Architecture, Clean Architecture Dependency Flow, Customer Ordering Page — SSG + ISR, Database Architecture, Deployment Architecture, Deployment Pipeline (+19 more)

### Community 45 - "staff/page.tsx"
Cohesion: 0.11
Nodes (20): AttendanceRecord, BankDetails, calculateDistanceM(), EmergencyContact, GeofenceConfig, Holiday, LeaveBalance, LeaveRequest (+12 more)

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

### Community 51 - "Service"
Cohesion: 0.05
Nodes (46): seedDefaultData(), seedPlatformData(), generateSlug(), ValidatePasswordComplexity(), FeaturesForPlan(), BusinessType, Tenant, LimitsForPlan() (+38 more)

### Community 52 - "OpenWAProvider"
Cohesion: 0.08
Nodes (14): NewMetaCloudProvider(), NewOpenWAProvider(), CleanPhoneNumber(), FormatChatID(), SessionStatus, net/http.Client, net/http.Request, sync.RWMutex (+6 more)

### Community 55 - "printer.go"
Cohesion: 0.26
Nodes (12): centerText(), GenerateBillText(), GenerateKOTText(), padRow(), TestGenerateBillText(), TestGenerateKOTText(), truncate(), BillData (+4 more)

### Community 56 - "Hub"
Cohesion: 0.15
Nodes (10): NewService(), NewService(), GetHub(), Hub, NewNotificationHandler(), OrderHandler, NewOrderHandler(), notifServiceIface (+2 more)

### Community 57 - "DineFlow — Subscription Model"
Cohesion: 0.07
Nodes (27): Billing Cycle Options, Billing Mechanics, DineFlow — Subscription Model, Downgrade Execution (Day 14), Enforcement Layers, Feature Flag System, 🆓 Free — "Just Getting Started", Future: Platform License (+19 more)

### Community 58 - "response.go"
Cohesion: 0.11
Nodes (16): clearRefreshTokenCookie(), AuthHandler, setRefreshTokenCookie(), GetRole(), GetTokenID(), PlanLimitMiddleware(), Conflict(), FeatureNotAvailable() (+8 more)

### Community 59 - "time.Time"
Cohesion: 0.16
Nodes (21): cleanPhoneNumber(), DefaultPermissionsForRole(), PublicProfile, User, IsPlatformRole(), time.Time, UpdateStaffRequest, FeatureFlagRecord (+13 more)

### Community 60 - "Collections"
Cohesion: 0.13
Nodes (15): Collection: `audit_logs`, Collection: `categories`, Collection: `locations`, Collection: `menu_items`, Collection: `menus`, Collection: `modifier_groups`, Collection: `notifications`, Collection: `orders` (+7 more)

### Community 61 - "Service"
Cohesion: 0.21
Nodes (4): NewService(), NewTableHandler(), Service, Table

### Community 62 - "Setup"
Cohesion: 0.35
Nodes (15): Auth(), RateLimit(), ChefOrAbove(), FinanceAdminOrAbove(), OwnerOnly(), OwnerOrManager(), PlatformAdminOrAbove(), RequireAnyRole() (+7 more)

### Community 63 - "DineFlow — Feature Roadmap"
Cohesion: 0.10
Nodes (21): 2A — Business Onboarding, 2B — Menu Management, 2C — QR Code System, 2D — Customer Ordering Experience, 2E — Order Management (Staff Dashboard), 2F — Kitchen Display System, 2G — Basic Analytics, Cross-Phase Dependencies Map (+13 more)

### Community 64 - "DineFlow — Product Vision"
Cohesion: 0.15
Nodes (13): Business Metrics (12-Month Targets), Competitive Landscape, Customer Experience Metrics, DineFlow — Product Vision, Long-Term Vision (3–5 Years), Mission, Primary Segments, Product Metrics (+5 more)

### Community 65 - "spotlight-cursor.tsx"
Cohesion: 0.32
Nodes (5): Component(), ComponentProps, SpotlightConfig, SpotlightCursor, useSpotlightEffect()

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

### Community 73 - "DineFlow — OpenWA Local Development & Testing Guide"
Cohesion: 0.12
Nodes (16): 1. Send Live Test Message, 2. Inbound WhatsApp Commands, 3. Customer Order Notifications (Automated Triggers), 4. Admin Alerts (Staff & Owner Notifications), 5. Webhook Signature Verification (HMAC), 🏗️ Architecture Summary, 🧪 Comprehensive Testing Scenarios, DineFlow — OpenWA Local Development & Testing Guide (+8 more)

### Community 74 - "theme-provider.tsx"
Cohesion: 0.33
Nodes (5): ResolvedTheme, Theme, ThemeContext, ThemeContextType, ThemeProvider()

### Community 75 - "DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)"
Cohesion: 0.25
Nodes (7): 1. Overview & Vision, 2. End-to-End Pipeline Architecture, 3.1 Inbound WhatsApp Webhook (`POST /webhooks/whatsapp`), 3.2 Staging Collection (`menu_imports_staging`), 3. Webhook Payload & Data Schema, 4. Security, Multi-Tenancy & Privacy Controls, DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)

### Community 76 - "Code Quality Standards"
Cohesion: 0.29
Nodes (6): 1. TypeScript & React, 2. Go (Golang), 3. API & Data Access Hygiene, 4. Code Review Output Format, Code Quality Standards, Staff Engineer Code Review Runbook

### Community 77 - "Maker"
Cohesion: 0.33
Nodes (6): Maker, NewMaker(), TestTokenMaker(), jwt.RegisteredClaims, Claims, TokenType

### Community 78 - "DineFlow — Antigravity (`agy`) Workspace Rules"
Cohesion: 0.29
Nodes (6): Code Style, DineFlow — Antigravity (`agy`) Workspace Rules, Key Files, Project, Tech Stack, Workflow Rules

### Community 80 - "generate-logo/route.ts"
Cohesion: 0.24
Nodes (11): ACTIVE_GEMINI_MODELS, ARCHETYPE_CONFIGS, createArchetypeLogo(), generateArchetypeProceduralSvg(), GenerateLogoRequest, generateWithGemini(), LogoVariation, maxDuration (+3 more)

### Community 81 - "Service"
Cohesion: 0.31
Nodes (4): NewService(), Service, go_pkg_github_com_resend_resend_go_v2, resend.Client

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

### Community 86 - "menu/menu.go"
Cohesion: 0.43
Nodes (6): BulkCreateItemsRequest, UpsertItemRequest, DietaryTag, ModifierGroup, ModifierOption, Variant

### Community 87 - "handlers/room.go"
Cohesion: 0.20
Nodes (9): NewRoomHandler(), go_pkg_encoding_base64, go_pkg_github_com_dineflow_api_internal_application_room, BulkRoomsRequest, CreateRoomRequest, PublicAmenityRequest, PublicExtendStayRequest, ToggleRoomDNDRequest (+1 more)

### Community 88 - "Phase 2 — Restaurant MVP"
Cohesion: 0.22
Nodes (9): 2.1 — Onboarding, 2.2 — Menu Management, 2.3 — Table & QR Code Management, 2.4 — Customer Ordering Experience, 2.5 — WebSocket / Real-Time, 2.6 — Order Management (Staff Dashboard), 2.7 — Kitchen Display System, 2.8 — Basic Analytics (+1 more)

### Community 115 - "Phase 1 — Foundation & Infrastructure"
Cohesion: 0.25
Nodes (8): 1.1 — Monorepo Setup, 1.2 — Backend Foundation (Go), 1.3 — Authentication Service, 1.4 — Multi-Tenancy Middleware, 1.5 — Frontend Foundation (Next.js), 1.6 — File Storage, 1.7 — Email Service, Phase 1 — Foundation & Infrastructure

### Community 117 - "menu-nlp-engine.ts"
Cohesion: 0.21
Nodes (15): INDIAN_CATEGORIES, INDIAN_DISH_CATALOG, IndianCategory, IndianDishEntry, OCR_TYPO_CORRECTIONS, calculateSimilarity(), detectIsVeg(), enrichRawExtractedItems() (+7 more)

### Community 119 - "README.md"
Cohesion: 0.18
Nodes (5): Data Retention Policy, Design Principles, DineFlow — Database Design, Entity Relationship Overview, Index Strategy Summary

### Community 120 - "next.config.ts"
Cohesion: 0.50
Nodes (3): nextConfig, securityHeaders, next

### Community 122 - "Problems Solved"
Cohesion: 0.25
Nodes (8): Problem 1 — Fragmented Software Stack, Problem 2 — High Cost of Entry, Problem 3 — App Download Friction, Problem 4 — WhatsApp Chaos, Problem 5 — No Real-time Kitchen Visibility, Problem 6 — Hotels Lack F&B Cohesion, Problem 7 — No Data for Decision Making, Problems Solved

### Community 123 - "scan/route.ts"
Cohesion: 0.23
Nodes (11): callGeminiVision(), GEMINI_MODELS, maxDuration, POST(), RawMenuItem, ScanMenuRequestBody, CameraMenuScannerModalProps, MenuStagingPreviewModalProps (+3 more)

### Community 124 - "hub.go"
Cohesion: 0.50
Nodes (4): go_pkg_sync, EventType, NotificationEvent, OrderEvent

### Community 125 - "Service"
Cohesion: 0.43
Nodes (5): SearchHandler, NewSearchHandler(), SearchFilterOptions, SearchResponse, Service

### Community 127 - "health.go"
Cohesion: 0.50
Nodes (3): Health(), SetHealthDeps(), Version()

### Community 129 - "app/page.tsx"
Cohesion: 0.06
Nodes (30): COMPARISON_ROWS, PLANS, PlanTier, PricingPage(), HOTEL_STEPS, JourneyStep, JourneyType, LandingCustomerJourney() (+22 more)

## Knowledge Gaps
- **712 isolated node(s):** `TestResult`, `github.com/dineflow/api`, `geminiRequest`, `geminiResponse`, `SendOTPRequest` (+707 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 865 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `useAuthStore`, `useToast`, `app/page.tsx`, `toast.tsx`, `spotlight-cursor.tsx`, `TubesCursor`, `cn`, `platform-store.ts`, `theme-provider.tsx`, `staff/page.tsx`, `[roomNumber]/page.tsx`, `landing-workflow.tsx`, `rooms/page.tsx`, `web/package.json`, `notifications/page.tsx`, `app/layout.tsx`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `Service` connect `Service` to `main`, `whatsapp/service.go`, `github.com/gin-gonic/gin.Context`, `NewScope`, `go_pkg_go_mongodb_org_mongo_driver_v2_bson`, `OpenWAProvider`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `main()` connect `main` to `server/main.go`, `security-audit/main.go`, `Service`, `Maker`, `go_pkg_go_mongodb_org_mongo_driver_v2_bson`, `config.go`, `Service`, `Client`, `Service`, `OpenWAProvider`, `Service`, `handlers/room.go`, `Hub`, `storage/storage.go`, `Service`, `Setup`, `health.go`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `TestResult`, `github.com/dineflow/api`, `geminiRequest` to the rest of the system?**
  _712 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `OK` be split into smaller, more focused modules?**
  _Cohesion score 0.11673469387755102 - nodes in this community are weakly interconnected._
- **Should `useToast` be split into smaller, more focused modules?**
  _Cohesion score 0.0784313725490196 - nodes in this community are weakly interconnected._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.10413080895008606 - nodes in this community are weakly interconnected._