# Graph Report - DineFlow  (2026-09-21)

## Corpus Check
- 309 files · ~389,294 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .example 2, .toml 1)

## Summary
- 2571 nodes · 7202 edges · 135 communities (98 shown, 37 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 54 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `aea4dc50`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- InternalError
- OK
- lucide-react
- context.Context
- menu/page.tsx
- go_pkg_time
- server/main.go
- staff/page.tsx
- time.Time
- Service
- Service
- ref_next_server
- 2. Functional Requirements
- [roomNumber]/page.tsx
- testing.T
- config.go
- NotFound
- Service
- Client
- DineFlow — UI/UX Guidelines
- BadRequest
- Subscription
- Order
- useToast
- web/package.json
- Scope
- redisKey
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
- tenant/tenant.go
- go.mongodb.org/mongo-driver/v2/bson.ObjectID
- DineFlow — System Architecture
- whatsapp/service.go
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
- Service
- DineFlow — Subscription Model
- response.go
- handlers/room.go
- Collections
- Service
- github.com/gin-gonic/gin.HandlerFunc
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
- Service
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
- handlers/menu.go
- roles.ts
- Notification
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
- 1. User Personas
- SubscriptionHandler
- menu-nlp-engine.ts
- table/route.ts
- theme-provider.tsx
- next.config.ts
- staff-order-food-modal.tsx
- Problems Solved
- scan/route.ts
- dnd/route.ts
- search/service.go
- extend-stay/route.ts
- README.md
- Setup
- react
- [orderId]/route.ts
- public/route.ts
- deploy.sh
- gen-secrets.sh
- 3. Non-Functional Requirements

## God Nodes (most connected - your core abstractions)
1. `OK()` - 155 edges
2. `BadRequest()` - 136 edges
3. `react` - 117 edges
4. `GetTenantID()` - 112 edges
5. `Unauthorized()` - 108 edges
6. `lucide-react` - 94 edges
7. `useToast()` - 89 edges
8. `InternalError()` - 88 edges
9. `cn()` - 80 edges
10. `Button` - 62 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `seedDefaultData()`  [INFERRED]
  apps/api/cmd/server/main.go → apps/api/cmd/server/seed.go
- `main()` --calls--> `SetHealthDeps()`  [EXTRACTED]
  apps/api/cmd/server/main.go → apps/api/internal/interfaces/http/handlers/health.go
- `TestSearchScenarios()` --calls--> `NewService()`  [INFERRED]
  apps/api/internal/application/search/scenarios_test.go → apps/api/internal/application/search/service.go
- `TestDefaultPermissionsForRole()` --calls--> `DefaultPermissionsForRole()`  [INFERRED]
  apps/api/internal/domain/user/user_test.go → apps/api/internal/domain/user/user.go
- `TestUserToPublic()` --calls--> `DefaultPermissionsForRole()`  [INFERRED]
  apps/api/internal/domain/user/user_test.go → apps/api/internal/domain/user/user.go

## Import Cycles
- None detected.

## Communities (135 total, 37 thin omitted)

### Community 0 - "InternalError"
Cohesion: 0.12
Nodes (3): PlatformHandler, InternalError(), OKWithMeta()

### Community 1 - "OK"
Cohesion: 0.12
Nodes (4): StaffHandler, TenantHandler, GetUserID(), OK()

### Community 2 - "lucide-react"
Cohesion: 0.08
Nodes (60): DAYS, ForecastPage(), generateForecast(), getIntensityClass(), HOURS, INSIGHTS, getDescription(), MenuWriterPage() (+52 more)

### Community 3 - "context.Context"
Cohesion: 0.16
Nodes (8): cleanGuestName(), cleanOrderNumber(), cleanTableName(), Service, context.Context, ListFilter, Service, PlatformNotificationRecord

### Community 4 - "menu/page.tsx"
Cohesion: 0.09
Nodes (44): IMAGE_PRESETS, MenuManagementPage(), INITIAL_KDS_ORDERS, KdsItem, KdsOrder, KDSOrdersPage(), MENU_PRESETS, CameraMenuScannerModal() (+36 more)

### Community 5 - "go_pkg_time"
Cohesion: 0.11
Nodes (35): ParseObjectID(), SendOTPRequest, go_pkg_context, go_pkg_crypto_rand, go_pkg_encoding_csv, go_pkg_errors, go_pkg_fmt, go_pkg_github_com_dineflow_api_internal_domain_menu (+27 more)

### Community 6 - "server/main.go"
Cohesion: 0.06
Nodes (44): Health(), SetHealthDeps(), Version(), ByIP(), ByIPAndRoute(), go_pkg_github_com_dineflow_api_internal_application_analytics, go_pkg_github_com_dineflow_api_internal_application_auth, go_pkg_github_com_dineflow_api_internal_application_order (+36 more)

### Community 7 - "staff/page.tsx"
Cohesion: 0.13
Nodes (17): AttendanceRecord, BankDetails, calculateDistanceM(), EmergencyContact, GeofenceConfig, Holiday, LeaveBalance, LeaveRequest (+9 more)

### Community 8 - "time.Time"
Cohesion: 0.08
Nodes (20): time.Time, UpdateRoomStatusRequest, UpdateTaskRequest, FeatureFlagRecord, CheckInInput, ExtensionStatus, Guest, GuestStatus (+12 more)

### Community 9 - "Service"
Cohesion: 0.05
Nodes (50): Service, CalculateDistanceMeters(), BuildFeedbackRequestMessage(), BuildKitchenReadyMessage(), BuildOrderConfirmationMessage(), GetStandardTemplates(), IsOptOutKeyword(), NormalizePhoneNumber() (+42 more)

### Community 10 - "Service"
Cohesion: 0.13
Nodes (22): ChatbotMessage, ChatbotResponse, ChatTurn, ForecastDay, ForecastHour, ForecastResponse, MenuDescriptionRequest, MenuDescriptionResponse (+14 more)

### Community 11 - "ref_next_server"
Cohesion: 0.12
Nodes (7): dynamic, dynamic, revalidate, dynamic, revalidate, config, ref_next_server

### Community 12 - "2. Functional Requirements"
Cohesion: 0.14
Nodes (14): 2.10 Staff Management, 2.11 WhatsApp Integration, 2.12 Analytics & Reporting, 2.13 Settings & Configuration, 2.1 Authentication & Multi-Tenancy, 2.2 Subscription & Billing, 2.3 Onboarding, 2.4 Menu Management (+6 more)

### Community 13 - "[roomNumber]/page.tsx"
Cohesion: 0.14
Nodes (20): DashboardOverviewPage(), MenuItem, RoomInfo, RoomServiceMenuPage(), SuiteTab, CustomerMenuPage(), matchesTable(), CustomerCartDrawer() (+12 more)

### Community 14 - "testing.T"
Cohesion: 0.05
Nodes (58): TestSearchScenarios(), NewService(), TestApplyLeave_Validation(), TestCreateHoliday_Validation(), TestCreateShift_Validation(), TestGeneratePayslipHTML_Structure(), TestInviteStaff_Validation(), TestOrderNotificationsAndAdminAlerts() (+50 more)

### Community 15 - "config.go"
Cohesion: 0.16
Nodes (18): getEnv(), getEnvInt(), Load(), requireEnv(), AIConfig, AppConfig, Config, EmailConfig (+10 more)

### Community 17 - "Service"
Cohesion: 0.08
Nodes (22): CalculateHealthScore(), AnnouncementInfo, AuditActor, AuditLogRecord, BusinessType, ClientStatus, DashboardMetrics, FeatureFlagDefinition (+14 more)

### Community 18 - "Client"
Cohesion: 0.11
Nodes (5): NewService(), Client, New(), time.Duration, RateLimitResult

### Community 19 - "DineFlow — UI/UX Guidelines"
Cohesion: 0.04
Nodes (44): 10. Responsive Breakpoints, 11. Iconography, 12. Empty States, 13. Toast / Notification System, 1. Design Philosophy, 2. Color Palette, 3. Typography, 4. Spacing System (+36 more)

### Community 20 - "BadRequest"
Cohesion: 0.08
Nodes (11): AIHandler, AnalyticsHandler, MenuHandler, NotificationHandler, RoomHandler, TableHandler, GetRole(), GetTenantID() (+3 more)

### Community 21 - "Subscription"
Cohesion: 0.15
Nodes (14): FormatPlanName(), GetLimits(), NewSubscriptionHandler(), AdminOverrideRequest, CheckoutRequest, BillingCycle, CheckoutSessionResult, PlanLimits (+6 more)

### Community 22 - "Order"
Cohesion: 0.13
Nodes (11): Service, Order, UpdateOrderStatusRequest, DestinationType, OrderItem, OrderItemModifier, OrderSource, OrderStatus (+3 more)

### Community 23 - "useToast"
Cohesion: 0.05
Nodes (67): ForgotPasswordContent(), Step, LoginPage(), RegisterPage(), ResetPasswordContent(), PricingAlertsPage(), UpsellPage(), AnalyticsPage() (+59 more)

### Community 24 - "web/package.json"
Cohesion: 0.09
Nodes (22): typescript, name, packageManager, private, version, axios, clsx, eslint (+14 more)

### Community 25 - "Scope"
Cohesion: 0.18
Nodes (9): ensureUpdatedAt(), go.mongodb.org/mongo-driver/v2/bson.M, go.mongodb.org/mongo-driver/v2/mongo.Collection, go.mongodb.org/mongo-driver/v2/mongo.Cursor, go.mongodb.org/mongo-driver/v2/mongo.DeleteResult, go.mongodb.org/mongo-driver/v2/mongo.InsertManyResult, go.mongodb.org/mongo-driver/v2/mongo.InsertOneResult, go.mongodb.org/mongo-driver/v2/mongo.UpdateResult (+1 more)

### Community 26 - "redisKey"
Cohesion: 0.09
Nodes (20): Config, redis.Client, NewFirebaseTestProvider(), Config, redis.Client, NewMSG91Provider(), GenerateCode(), redis.Client (+12 more)

### Community 27 - "notifications/page.tsx"
Cohesion: 0.11
Nodes (24): CATEGORIES, CATEGORY_META, NotificationsPage(), PRIORITIES, PRIORITY_BADGE, timeAgo(), calculateDistanceMeters(), CheckInContent() (+16 more)

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
Cohesion: 0.18
Nodes (9): apps_web_app_globals, manrope, metadata, plusJakarta, spaceGrotesk, viewport, QueryProvider(), ref_next_font_google (+1 more)

### Community 32 - "tasks"
Cohesion: 0.11
Nodes (17): dependsOn, inputs, outputs, cache, cache, persistent, dependsOn, $schema (+9 more)

### Community 33 - "useAuthStore"
Cohesion: 0.04
Nodes (60): VerifyContent(), DashboardLayout(), RootLoading(), PlatformClientsPage(), PlatformLayout(), BroadcastBanner(), CATEGORY_CONFIG, FILTER_CHIPS (+52 more)

### Community 34 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 35 - "main"
Cohesion: 0.07
Nodes (32): corsMiddleware(), main(), requestLogger(), runStartupCleanup(), NewService(), NewService(), NewService(), NewService() (+24 more)

### Community 36 - "package.json"
Cohesion: 0.09
Nodes (21): description, devDependencies, prettier, turbo, typescript, engines, node, typescript (+13 more)

### Community 37 - "github.com/gin-gonic/gin.Context"
Cohesion: 0.14
Nodes (5): WhatsAppHandler, ByTenant(), PlanLimitMiddleware(), PlanLimitExceeded(), github.com/gin-gonic/gin.Context

### Community 38 - "DineFlow — Development Plan"
Cohesion: 0.07
Nodes (30): 1.1 — Monorepo Setup, 1.2 — Backend Foundation (Go), 1.3 — Authentication Service, 1.4 — Multi-Tenancy Middleware, 1.5 — Frontend Foundation (Next.js), 1.6 — File Storage, 1.7 — Email Service, 2.1 — Onboarding (+22 more)

### Community 39 - "cn"
Cohesion: 0.05
Nodes (54): INITIAL_INVOICES, Invoice, SettingsPage(), BUSINESS_CATEGORIES, BusinessCategory, BusinessCategorySelector(), BusinessCategorySelectorProps, ChefMascot() (+46 more)

### Community 40 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti, @types/node, @types/react (+2 more)

### Community 41 - "scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, test, version

### Community 42 - "tenant/tenant.go"
Cohesion: 0.24
Nodes (17): seedDefaultData(), seedPlatformData(), FeaturesForPlan(), BusinessType, Tenant, LimitsForPlan(), Address, Contact (+9 more)

### Community 43 - "go.mongodb.org/mongo-driver/v2/bson.ObjectID"
Cohesion: 0.08
Nodes (31): cleanPhoneNumber(), DefaultPermissionsForRole(), PublicProfile, User, IsPlatformRole(), NewScope(), go.mongodb.org/mongo-driver/v2/bson.ObjectID, UpdateStaffRequest (+23 more)

### Community 44 - "DineFlow — System Architecture"
Cohesion: 0.07
Nodes (27): Application Structure, Architecture Philosophy, Backend Architecture, Clean Architecture Dependency Flow, Customer Ordering Page — SSG + ISR, Database Architecture, Deployment Architecture, Deployment Pipeline (+19 more)

### Community 45 - "whatsapp/service.go"
Cohesion: 0.08
Nodes (33): geminiRequest, geminiResponse, main(), testCORSOriginDefense(), testMetaWebhookHMACSignature(), testNoSQLInjectionInBody(), testNoSQLInjectionInQueryParams(), testRequestIDTracing() (+25 more)

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
Cohesion: 0.15
Nodes (10): generateSlug(), NewService(), ValidatePasswordComplexity(), NormalizePhone(), AuthResponse, EmailSender, LoginRequest, RegisterRequest (+2 more)

### Community 52 - "OpenWAProvider"
Cohesion: 0.08
Nodes (12): NewMetaCloudProvider(), NewOpenWAProvider(), CleanPhoneNumber(), FormatChatID(), SessionStatus, net/http.Request, MetaCloudConfig, MetaCloudProvider (+4 more)

### Community 55 - "printer.go"
Cohesion: 0.26
Nodes (12): centerText(), GenerateBillText(), GenerateKOTText(), padRow(), TestGenerateBillText(), TestGenerateKOTText(), truncate(), BillData (+4 more)

### Community 56 - "Service"
Cohesion: 0.21
Nodes (6): buildMenuItemFromUpsertRequest(), Category, MenuItem, PublicCategorySection, PublicMenuResponse, Service

### Community 57 - "DineFlow — Subscription Model"
Cohesion: 0.07
Nodes (27): Billing Cycle Options, Billing Mechanics, DineFlow — Subscription Model, Downgrade Execution (Day 14), Enforcement Layers, Feature Flag System, 🆓 Free — "Just Getting Started", Future: Platform License (+19 more)

### Community 58 - "response.go"
Cohesion: 0.12
Nodes (13): clearRefreshTokenCookie(), AuthHandler, setRefreshTokenCookie(), GetTokenID(), Conflict(), FeatureNotAvailable(), Forbidden(), NoContent() (+5 more)

### Community 59 - "handlers/room.go"
Cohesion: 0.12
Nodes (15): NewRoomHandler(), go_pkg_encoding_base64, go_pkg_github_com_dineflow_api_internal_application_notification, go_pkg_github_com_dineflow_api_internal_application_room, go_pkg_github_com_dineflow_api_internal_domain_room, ApproveExtensionRequestInput, BulkRoomsRequest, CreateRoomRequest (+7 more)

### Community 60 - "Collections"
Cohesion: 0.13
Nodes (15): Collection: `audit_logs`, Collection: `categories`, Collection: `locations`, Collection: `menu_items`, Collection: `menus`, Collection: `modifier_groups`, Collection: `notifications`, Collection: `orders` (+7 more)

### Community 62 - "github.com/gin-gonic/gin.HandlerFunc"
Cohesion: 0.41
Nodes (12): ChefOrAbove(), FinanceAdminOrAbove(), OwnerOnly(), OwnerOrManager(), PlatformAdminOrAbove(), RequireAnyRole(), RequirePlatformRole(), RequireRole() (+4 more)

### Community 63 - "DineFlow — Feature Roadmap"
Cohesion: 0.10
Nodes (21): 2A — Business Onboarding, 2B — Menu Management, 2C — QR Code System, 2D — Customer Ordering Experience, 2E — Order Management (Staff Dashboard), 2F — Kitchen Display System, 2G — Basic Analytics, Cross-Phase Dependencies Map (+13 more)

### Community 64 - "DineFlow — Product Vision"
Cohesion: 0.14
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

### Community 74 - "Service"
Cohesion: 0.24
Nodes (6): CategoryShare, HourlyPoint, OverviewMetrics, Service, TopItemMetric, NewAnalyticsHandler()

### Community 75 - "DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)"
Cohesion: 0.25
Nodes (7): 1. Overview & Vision, 2. End-to-End Pipeline Architecture, 3.1 Inbound WhatsApp Webhook (`POST /webhooks/whatsapp`), 3.2 Staging Collection (`menu_imports_staging`), 3. Webhook Payload & Data Schema, 4. Security, Multi-Tenancy & Privacy Controls, DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)

### Community 76 - "Code Quality Standards"
Cohesion: 0.29
Nodes (6): 1. TypeScript & React, 2. Go (Golang), 3. API & Data Access Hygiene, 4. Code Review Output Format, Code Quality Standards, Staff Engineer Code Review Runbook

### Community 77 - "Maker"
Cohesion: 0.30
Nodes (7): Maker, NewMaker(), TestTokenMaker(), go_pkg_github_com_golang_jwt_jwt_v5, jwt.RegisteredClaims, Claims, TokenType

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

### Community 86 - "handlers/menu.go"
Cohesion: 0.16
Nodes (14): NewMenuHandler(), go_pkg_github_com_dineflow_api_internal_application_ai, go_pkg_github_com_dineflow_api_internal_application_menu, BulkCreateItemsRequest, BulkDeleteItemsRequest, BulkUpdateItemsRequest, CreateCategoryRequest, ScanMenuRequest (+6 more)

### Community 87 - "roles.ts"
Cohesion: 0.17
Nodes (7): canManageSupport(), getRoleBadgeClass(), PLATFORM_ROLES, PlatformRole, TENANT_ROLES, TenantRole, UserRole

### Community 88 - "Notification"
Cohesion: 0.48
Nodes (5): CreateNotificationRequest, Category, CreateNotificationInput, Notification, Priority

### Community 115 - "1. User Personas"
Cohesion: 0.15
Nodes (12): 1. User Personas, 4. User Journeys, DineFlow — Product Requirements, Journey 1 — New Restaurant Onboarding, Journey 2 — Customer Orders via QR, Journey 3 — Subscription Renewal Failure, Journey 4 — Hotel Room Service, Persona 1 — Riya (Restaurant Owner) (+4 more)

### Community 117 - "menu-nlp-engine.ts"
Cohesion: 0.21
Nodes (15): INDIAN_CATEGORIES, INDIAN_DISH_CATALOG, IndianCategory, IndianDishEntry, OCR_TYPO_CORRECTIONS, calculateSimilarity(), detectIsVeg(), enrichRawExtractedItems() (+7 more)

### Community 119 - "theme-provider.tsx"
Cohesion: 0.33
Nodes (5): ResolvedTheme, Theme, ThemeContext, ThemeContextType, ThemeProvider()

### Community 120 - "next.config.ts"
Cohesion: 0.50
Nodes (3): nextConfig, securityHeaders, next

### Community 121 - "staff-order-food-modal.tsx"
Cohesion: 0.40
Nodes (4): BillingMethod, CartItem, MenuItem, StaffOrderFoodModalProps

### Community 122 - "Problems Solved"
Cohesion: 0.25
Nodes (8): Problem 1 — Fragmented Software Stack, Problem 2 — High Cost of Entry, Problem 3 — App Download Friction, Problem 4 — WhatsApp Chaos, Problem 5 — No Real-time Kitchen Visibility, Problem 6 — Hotels Lack F&B Cohesion, Problem 7 — No Data for Decision Making, Problems Solved

### Community 123 - "scan/route.ts"
Cohesion: 0.33
Nodes (6): callGeminiVision(), GEMINI_MODELS, maxDuration, POST(), RawMenuItem, ScanMenuRequestBody

### Community 124 - "dnd/route.ts"
Cohesion: 0.38
Nodes (6): DNDRecord, dynamic, GET(), getDNDStore(), POST(), revalidate

### Community 125 - "search/service.go"
Cohesion: 0.21
Nodes (11): NewService(), TestSearchAll_EmptyQuery(), TestSearchAll_ShortQuery(), SearchHandler, NewSearchHandler(), go_pkg_github_com_dineflow_api_internal_application_search, SearchFilterOptions, SearchResponse (+3 more)

### Community 126 - "extend-stay/route.ts"
Cohesion: 0.38
Nodes (6): dynamic, GET(), getExtensionStore(), POST(), revalidate, StayExtensionRecord

### Community 127 - "README.md"
Cohesion: 0.18
Nodes (5): Data Retention Policy, Design Principles, DineFlow — Database Design, Entity Relationship Overview, Index Strategy Summary

### Community 128 - "Setup"
Cohesion: 0.18
Nodes (5): OrderHandler, Auth(), RateLimit(), Setup(), contextKey

### Community 129 - "react"
Cohesion: 0.05
Nodes (42): DashboardErrorProps, OrderStatus, OrderTrackingPage(), TrackingOrder, TrackingOrderItem, COMPARISON_ROWS, PLANS, PlanTier (+34 more)

### Community 135 - "3. Non-Functional Requirements"
Cohesion: 0.29
Nodes (7): 3.1 Performance, 3.2 Scalability, 3.3 Reliability, 3.4 Security, 3.5 Accessibility, 3.6 Internationalisation, 3. Non-Functional Requirements

## Knowledge Gaps
- **728 isolated node(s):** `TestResult`, `github.com/dineflow/api`, `geminiRequest`, `geminiResponse`, `SendOTPRequest` (+723 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 887 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `useAuthStore`, `lucide-react`, `spotlight-cursor.tsx`, `menu/page.tsx`, `TubesCursor`, `cn`, `staff/page.tsx`, `[roomNumber]/page.tsx`, `landing-workflow.tsx`, `theme-provider.tsx`, `useToast`, `web/package.json`, `staff-order-food-modal.tsx`, `notifications/page.tsx`, `app/layout.tsx`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `main()` connect `main` to `Setup`, `server/main.go`, `Service`, `testing.T`, `config.go`, `Client`, `Subscription`, `redisKey`, `storage/storage.go`, `tenant/tenant.go`, `whatsapp/service.go`, `Service`, `OpenWAProvider`, `handlers/room.go`, `Service`, `Maker`, `Service`, `handlers/menu.go`, `search/service.go`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `Service` connect `Service` to `main`, `github.com/gin-gonic/gin.Context`, `go.mongodb.org/mongo-driver/v2/bson.ObjectID`, `whatsapp/service.go`, `testing.T`, `redisKey`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `TestResult`, `github.com/dineflow/api`, `geminiRequest` to the rest of the system?**
  _728 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `InternalError` be split into smaller, more focused modules?**
  _Cohesion score 0.11951219512195121 - nodes in this community are weakly interconnected._
- **Should `OK` be split into smaller, more focused modules?**
  _Cohesion score 0.12096774193548387 - nodes in this community are weakly interconnected._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.07515151515151515 - nodes in this community are weakly interconnected._