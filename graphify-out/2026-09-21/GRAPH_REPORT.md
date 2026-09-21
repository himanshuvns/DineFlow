# Graph Report - DineFlow  (2026-09-21)

## Corpus Check
- 309 files · ~390,799 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .example 2, .toml 1)

## Summary
- 2578 nodes · 7229 edges · 141 communities (104 shown, 37 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 54 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1ce173c1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- OK
- useToast
- react
- go.mongodb.org/mongo-driver/v2/bson.ObjectID
- menu/page.tsx
- go_pkg_time
- server/main.go
- staff/page.tsx
- time.Time
- whatsapp/whatsapp.go
- Service
- ref_next_server
- 2. Functional Requirements
- toast.tsx
- testing.T
- config.go
- NotFound
- Service
- context.Context
- DineFlow — UI/UX Guidelines
- BadRequest
- Subscription
- Order
- [roomId]/page.tsx
- web/package.json
- Scope
- otp.go
- notifications/page.tsx
- handlers/room.go
- dependencies
- compilerOptions
- app/layout.tsx
- tasks
- cn
- components.json
- main
- package.json
- github.com/gin-gonic/gin.Context
- DineFlow — Development Plan
- hero-section.tsx
- devDependencies
- scripts
- tenant/tenant.go
- NewScope
- DineFlow — System Architecture
- ai/service.go
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
- .LogMessage
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
- analytics/service.go
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
- forecast/page.tsx
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
- NewService
- SubscriptionHandler
- menu-nlp-engine.ts
- table/route.ts
- rooms/page.tsx
- next.config.ts
- .SendOrderConfirmation
- Problems Solved
- scan/route.ts
- dnd/route.ts
- Hub
- extend-stay/route.ts
- README.md
- Setup
- ui/pricing.tsx
- [orderId]/route.ts
- public/route.ts
- deploy.sh
- gen-secrets.sh
- .HandleInboundMessage
- Phase 2 — Restaurant MVP
- TableHandler
- Phase 1 — Foundation & Infrastructure
- Phase 2 — Restaurant MVP
- CustomerInvoice
- Grace Period & Downgrade Automation

## God Nodes (most connected - your core abstractions)
1. `OK()` - 157 edges
2. `BadRequest()` - 138 edges
3. `react` - 117 edges
4. `GetTenantID()` - 114 edges
5. `Unauthorized()` - 110 edges
6. `lucide-react` - 94 edges
7. `useToast()` - 91 edges
8. `InternalError()` - 88 edges
9. `cn()` - 80 edges
10. `Button` - 62 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `seedDefaultData()`  [INFERRED]
  apps/api/cmd/server/main.go → apps/api/cmd/server/seed.go
- `main()` --calls--> `SetHealthDeps()`  [EXTRACTED]
  apps/api/cmd/server/main.go → apps/api/internal/interfaces/http/handlers/health.go
- `TestGenerateKOTText()` --calls--> `GenerateKOTText()`  [INFERRED]
  apps/api/internal/domain/printer/printer_test.go → apps/api/internal/domain/printer/printer.go
- `TestGenerateBillText()` --calls--> `GenerateBillText()`  [INFERRED]
  apps/api/internal/domain/printer/printer_test.go → apps/api/internal/domain/printer/printer.go
- `UpdateRoomStatusRequest` --references--> `RoomStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/room.go → apps/api/internal/domain/room/room.go

## Import Cycles
- None detected.

## Communities (141 total, 37 thin omitted)

### Community 0 - "OK"
Cohesion: 0.12
Nodes (5): PlatformHandler, TenantHandler, InternalError(), OK(), OKWithMeta()

### Community 1 - "useToast"
Cohesion: 0.06
Nodes (44): VerifyContent(), getDescription(), MenuWriterPage(), PricingAlertsPage(), UpsellPage(), AnalyticsPage(), PlatformAnalyticsPage(), PlatformAuditLogsPage() (+36 more)

### Community 2 - "react"
Cohesion: 0.07
Nodes (60): MOCK_DESCRIPTIONS, SAMPLE_ITEMS, TONES, AI_TOOLS, STATS, ALERT_CONFIG, ALERTS, SEVERITY_COLOR (+52 more)

### Community 3 - "go.mongodb.org/mongo-driver/v2/bson.ObjectID"
Cohesion: 0.11
Nodes (15): cleanGuestName(), cleanOrderNumber(), cleanTableName(), ParseObjectID(), go.mongodb.org/mongo-driver/v2/bson.ObjectID, CreateNotificationRequest, Category, CreateNotificationInput (+7 more)

### Community 4 - "menu/page.tsx"
Cohesion: 0.07
Nodes (53): IMAGE_PRESETS, MenuManagementPage(), INITIAL_KDS_ORDERS, KdsItem, KdsOrder, KDSOrdersPage(), MENU_PRESETS, DashboardOverviewPage() (+45 more)

### Community 5 - "go_pkg_time"
Cohesion: 0.14
Nodes (30): SendOTPRequest, go_pkg_context, go_pkg_encoding_csv, go_pkg_errors, go_pkg_fmt, go_pkg_github_com_dineflow_api_internal_domain_menu, go_pkg_github_com_dineflow_api_internal_domain_notification, go_pkg_github_com_dineflow_api_internal_domain_order (+22 more)

### Community 6 - "server/main.go"
Cohesion: 0.05
Nodes (46): corsMiddleware(), NewAnalyticsHandler(), Health(), SetHealthDeps(), Version(), NewNotificationHandler(), NewPlatformHandler(), SearchHandler (+38 more)

### Community 7 - "staff/page.tsx"
Cohesion: 0.11
Nodes (20): AttendanceRecord, BankDetails, calculateDistanceM(), EmergencyContact, GeofenceConfig, Holiday, LeaveBalance, LeaveRequest (+12 more)

### Community 8 - "time.Time"
Cohesion: 0.09
Nodes (22): ValidateAndNormalizeIndianPhone(), time.Time, CreateTaskRequest, UpdateTaskRequest, FeatureFlagRecord, RateLimitResult, CheckInInput, ExtensionStatus (+14 more)

### Community 9 - "whatsapp/whatsapp.go"
Cohesion: 0.11
Nodes (27): BuildKitchenReadyMessage(), Campaign, CampaignStats, CampaignStatus, CampaignType, ChatbotSession, ChatbotState, InteractiveButton (+19 more)

### Community 10 - "Service"
Cohesion: 0.13
Nodes (23): ChatbotMessage, ChatbotResponse, ChatTurn, ForecastDay, ForecastHour, ForecastResponse, MenuDescriptionRequest, MenuDescriptionResponse (+15 more)

### Community 11 - "ref_next_server"
Cohesion: 0.12
Nodes (7): dynamic, dynamic, revalidate, dynamic, revalidate, config, ref_next_server

### Community 12 - "2. Functional Requirements"
Cohesion: 0.06
Nodes (33): 1. User Personas, 2.10 Staff Management, 2.11 WhatsApp Integration, 2.12 Analytics & Reporting, 2.13 Settings & Configuration, 2.1 Authentication & Multi-Tenancy, 2.2 Subscription & Billing, 2.3 Onboarding (+25 more)

### Community 13 - "toast.tsx"
Cohesion: 0.05
Nodes (49): OrderStatus, OrderTrackingPage(), TrackingOrder, TrackingOrderItem, MenuItem, RoomInfo, RoomServiceMenuPage(), SuiteTab (+41 more)

### Community 14 - "testing.T"
Cohesion: 0.06
Nodes (48): TestSearchScenarios(), NewService(), TestSearchAll_EmptyQuery(), TestSearchAll_ShortQuery(), NewService(), TestApplyLeave_Validation(), TestCreateHoliday_Validation(), TestCreateShift_Validation() (+40 more)

### Community 15 - "config.go"
Cohesion: 0.16
Nodes (18): getEnv(), getEnvInt(), Load(), requireEnv(), AIConfig, AppConfig, Config, EmailConfig (+10 more)

### Community 17 - "Service"
Cohesion: 0.08
Nodes (23): CalculateHealthScore(), AnnouncementInfo, AuditActor, AuditLogRecord, BusinessType, ClientStatus, DashboardMetrics, FeatureFlagDefinition (+15 more)

### Community 18 - "context.Context"
Cohesion: 0.07
Nodes (13): Service, Client, New(), RateLimit(), NewMetaCloudProvider(), CleanPhoneNumber(), context.Context, sync.RWMutex (+5 more)

### Community 19 - "DineFlow — UI/UX Guidelines"
Cohesion: 0.04
Nodes (44): 10. Responsive Breakpoints, 11. Iconography, 12. Empty States, 13. Toast / Notification System, 1. Design Philosophy, 2. Color Palette, 3. Typography, 4. Spacing System (+36 more)

### Community 20 - "BadRequest"
Cohesion: 0.08
Nodes (11): AnalyticsHandler, MenuHandler, NotificationHandler, RoomHandler, StaffHandler, GetRole(), GetTenantID(), GetUserID() (+3 more)

### Community 21 - "Subscription"
Cohesion: 0.14
Nodes (15): NewService(), FormatPlanName(), GetLimits(), NewSubscriptionHandler(), AdminOverrideRequest, CheckoutRequest, BillingCycle, CheckoutSessionResult (+7 more)

### Community 22 - "Order"
Cohesion: 0.10
Nodes (15): Service, Order, NewOrderHandler(), UpdateOrderStatusRequest, DestinationType, notifServiceIface, OrderItem, OrderItemModifier (+7 more)

### Community 23 - "[roomId]/page.tsx"
Cohesion: 0.06
Nodes (50): ForgotPasswordContent(), Step, LoginPage(), RegisterPage(), ResetPasswordContent(), DEFAULT_FALLBACK_ROOMS, getStayMetrics(), HousekeepingTask (+42 more)

### Community 24 - "web/package.json"
Cohesion: 0.10
Nodes (20): typescript, name, packageManager, private, version, axios, clsx, eslint (+12 more)

### Community 25 - "Scope"
Cohesion: 0.21
Nodes (8): ensureUpdatedAt(), go.mongodb.org/mongo-driver/v2/bson.M, go.mongodb.org/mongo-driver/v2/mongo.Cursor, go.mongodb.org/mongo-driver/v2/mongo.DeleteResult, go.mongodb.org/mongo-driver/v2/mongo.InsertManyResult, go.mongodb.org/mongo-driver/v2/mongo.InsertOneResult, go.mongodb.org/mongo-driver/v2/mongo.UpdateResult, Scope

### Community 26 - "otp.go"
Cohesion: 0.16
Nodes (11): Config, redis.Client, NewFirebaseTestProvider(), GenerateCode(), redis.Client, NewService(), redisKey(), go_pkg_crypto_rand (+3 more)

### Community 27 - "notifications/page.tsx"
Cohesion: 0.11
Nodes (26): CATEGORIES, CATEGORY_META, NotificationsPage(), PRIORITIES, PRIORITY_BADGE, timeAgo(), calculateDistanceMeters(), CheckInContent() (+18 more)

### Community 28 - "handlers/room.go"
Cohesion: 0.08
Nodes (25): StorageService, NewService(), TestStorageValidation(), NewRoomHandler(), StorageHandler, NewStorageHandler(), go_pkg_encoding_base64, go_pkg_encoding_hex (+17 more)

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

### Community 33 - "cn"
Cohesion: 0.06
Nodes (49): DashboardLayout(), SettingsPage(), RootLoading(), PlatformLayout(), BUSINESS_CATEGORIES, BusinessCategory, BusinessCategorySelector(), BusinessCategorySelectorProps (+41 more)

### Community 34 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 35 - "main"
Cohesion: 0.10
Nodes (22): main(), requestLogger(), runStartupCleanup(), NewService(), NewService(), NewService(), New(), NewAuthHandler() (+14 more)

### Community 36 - "package.json"
Cohesion: 0.09
Nodes (21): description, devDependencies, prettier, turbo, typescript, engines, node, typescript (+13 more)

### Community 37 - "github.com/gin-gonic/gin.Context"
Cohesion: 0.13
Nodes (5): WhatsAppHandler, ByTenant(), PlanLimitMiddleware(), PlanLimitExceeded(), github.com/gin-gonic/gin.Context

### Community 38 - "DineFlow — Development Plan"
Cohesion: 0.15
Nodes (13): Definition of Done, DineFlow — Development Plan, E2E Tests (Playwright), How to Read This Plan, Integration Tests, Performance Tests (k6), Phase 0 — Planning & Architecture, Phase 3 — Hotel Module (+5 more)

### Community 39 - "hero-section.tsx"
Cohesion: 0.16
Nodes (10): ChefMascot(), ChefMascotProps, FloatingCard(), FloatingCardProps, HeroSection(), HeroSectionProps, SCATTERED_FOODS, ScatteredFood (+2 more)

### Community 40 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti, @types/node, @types/react (+2 more)

### Community 41 - "scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, test, version

### Community 42 - "tenant/tenant.go"
Cohesion: 0.20
Nodes (19): seedDefaultData(), seedPlatformData(), generateSlug(), FeaturesForPlan(), BusinessType, Tenant, LimitsForPlan(), RegisterRequest (+11 more)

### Community 43 - "NewScope"
Cohesion: 0.06
Nodes (37): cleanPhoneNumber(), CalculateDistanceMeters(), DefaultPermissionsForRole(), PublicProfile, User, IsPlatformRole(), TestCalculateDistanceMeters(), NewScope() (+29 more)

### Community 44 - "DineFlow — System Architecture"
Cohesion: 0.07
Nodes (27): Application Structure, Architecture Philosophy, Backend Architecture, Clean Architecture Dependency Flow, Customer Ordering Page — SSG + ISR, Database Architecture, Deployment Architecture, Deployment Pipeline (+19 more)

### Community 45 - "ai/service.go"
Cohesion: 0.09
Nodes (30): geminiRequest, geminiResponse, main(), testCORSOriginDefense(), testMetaWebhookHMACSignature(), testNoSQLInjectionInBody(), testNoSQLInjectionInQueryParams(), testRequestIDTracing() (+22 more)

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
Cohesion: 0.17
Nodes (7): ValidatePasswordComplexity(), NormalizePhone(), AuthResponse, LoginRequest, Service, VerifyOTPRequest, go.mongodb.org/mongo-driver/v2/mongo.Collection

### Community 52 - "OpenWAProvider"
Cohesion: 0.18
Nodes (6): NewOpenWAProvider(), FormatChatID(), SessionStatus, net/http.Request, OpenWAConfig, OpenWAProvider

### Community 55 - "printer.go"
Cohesion: 0.36
Nodes (10): centerText(), GenerateBillText(), GenerateKOTText(), padRow(), truncate(), BillData, BillItem, KOTData (+2 more)

### Community 56 - "Service"
Cohesion: 0.10
Nodes (6): Service, SessionManager, WhatsAppProvider, NotificationEmitter, WhatsAppConfig, WorkforceTokenVerifyResult

### Community 57 - "DineFlow — Subscription Model"
Cohesion: 0.09
Nodes (22): Billing Cycle Options, Billing Mechanics, DineFlow — Subscription Model, Enforcement Layers, Feature Flag System, 🆓 Free — "Just Getting Started", Future: Platform License, 📈 Growth — "Scaling Up" — ₹2,999/month (+14 more)

### Community 58 - "response.go"
Cohesion: 0.12
Nodes (13): clearRefreshTokenCookie(), AuthHandler, setRefreshTokenCookie(), GetTokenID(), Conflict(), FeatureNotAvailable(), Forbidden(), NoContent() (+5 more)

### Community 59 - ".LogMessage"
Cohesion: 0.24
Nodes (4): BuildFeedbackRequestMessage(), MessageLog, MessageStatus, TemplateType

### Community 60 - "Collections"
Cohesion: 0.13
Nodes (15): Collection: `audit_logs`, Collection: `categories`, Collection: `locations`, Collection: `menu_items`, Collection: `menus`, Collection: `modifier_groups`, Collection: `notifications`, Collection: `orders` (+7 more)

### Community 61 - "Service"
Cohesion: 0.14
Nodes (11): NewService(), NewTableHandler(), go_pkg_github_com_dineflow_api_internal_application_table, BulkCreateRoomsRequest, CreateTableRequest, ToggleDNDRequest, UpdateTableStatusRequest, LocationType (+3 more)

### Community 62 - "github.com/gin-gonic/gin.HandlerFunc"
Cohesion: 0.41
Nodes (12): ChefOrAbove(), FinanceAdminOrAbove(), OwnerOnly(), OwnerOrManager(), PlatformAdminOrAbove(), RequireAnyRole(), RequirePlatformRole(), RequireRole() (+4 more)

### Community 63 - "DineFlow — Feature Roadmap"
Cohesion: 0.15
Nodes (13): Cross-Phase Dependencies Map, Deliverables, Deliverables, DineFlow — Feature Roadmap, Overview, Phase 0 — Planning & Architecture, Phase 1 — Foundation & Infrastructure, Phase 3 — Hotel Module (+5 more)

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

### Community 74 - "analytics/service.go"
Cohesion: 0.25
Nodes (7): CategoryShare, HourlyPoint, OverviewMetrics, Service, TopItemMetric, NewService(), go_pkg_sort

### Community 75 - "DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)"
Cohesion: 0.25
Nodes (7): 1. Overview & Vision, 2. End-to-End Pipeline Architecture, 3.1 Inbound WhatsApp Webhook (`POST /webhooks/whatsapp`), 3.2 Staging Collection (`menu_imports_staging`), 3. Webhook Payload & Data Schema, 4. Security, Multi-Tenancy & Privacy Controls, DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)

### Community 76 - "Code Quality Standards"
Cohesion: 0.29
Nodes (6): 1. TypeScript & React, 2. Go (Golang), 3. API & Data Access Hygiene, 4. Code Review Output Format, Code Quality Standards, Staff Engineer Code Review Runbook

### Community 77 - "Maker"
Cohesion: 0.33
Nodes (6): Maker, NewMaker(), go_pkg_github_com_golang_jwt_jwt_v5, jwt.RegisteredClaims, Claims, TokenType

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
Cohesion: 0.17
Nodes (13): NewMenuHandler(), go_pkg_github_com_dineflow_api_internal_application_menu, BulkCreateItemsRequest, BulkDeleteItemsRequest, BulkUpdateItemsRequest, CreateCategoryRequest, ScanMenuRequest, ToggleStockRequest (+5 more)

### Community 87 - "roles.ts"
Cohesion: 0.17
Nodes (7): canManageSupport(), getRoleBadgeClass(), PLATFORM_ROLES, PlatformRole, TENANT_ROLES, TenantRole, UserRole

### Community 88 - "forecast/page.tsx"
Cohesion: 0.16
Nodes (9): DAYS, ForecastPage(), generateForecast(), getIntensityClass(), HOURS, INSIGHTS, DEFAULT_HOSPITALITY_MESSAGES, HospitalityLoader() (+1 more)

### Community 115 - "NewService"
Cohesion: 0.15
Nodes (12): NewService(), Config, redis.Client, NewMSG91Provider(), OTPProvider, redis.Client, NewOTPProvider(), TestMSG91ProviderFallback() (+4 more)

### Community 117 - "menu-nlp-engine.ts"
Cohesion: 0.21
Nodes (15): INDIAN_CATEGORIES, INDIAN_DISH_CATALOG, IndianCategory, IndianDishEntry, OCR_TYPO_CORRECTIONS, calculateSimilarity(), detectIsVeg(), enrichRawExtractedItems() (+7 more)

### Community 119 - "rooms/page.tsx"
Cohesion: 0.20
Nodes (11): DEFAULT_ROOMS, getStayMetrics(), HotelStats, RoomItem, RoomsDirectoryPage(), QRCodeImage(), QRCodeImageProps, useViewMode() (+3 more)

### Community 120 - "next.config.ts"
Cohesion: 0.50
Nodes (3): nextConfig, securityHeaders, next

### Community 121 - ".SendOrderConfirmation"
Cohesion: 0.20
Nodes (9): BuildOrderConfirmationMessage(), GetStandardTemplates(), InterpolateTemplate(), TestBuildOrderConfirmationMessage(), TestGetStandardTemplates(), TestInterpolateTemplate(), OrderConfirmationData, TemplateDefinition (+1 more)

### Community 122 - "Problems Solved"
Cohesion: 0.25
Nodes (8): Problem 1 — Fragmented Software Stack, Problem 2 — High Cost of Entry, Problem 3 — App Download Friction, Problem 4 — WhatsApp Chaos, Problem 5 — No Real-time Kitchen Visibility, Problem 6 — Hotels Lack F&B Cohesion, Problem 7 — No Data for Decision Making, Problems Solved

### Community 123 - "scan/route.ts"
Cohesion: 0.33
Nodes (6): callGeminiVision(), GEMINI_MODELS, maxDuration, POST(), RawMenuItem, ScanMenuRequestBody

### Community 124 - "dnd/route.ts"
Cohesion: 0.38
Nodes (6): DNDRecord, dynamic, GET(), getDNDStore(), POST(), revalidate

### Community 125 - "Hub"
Cohesion: 0.14
Nodes (13): NewService(), NewService(), GetHub(), Hub, go_pkg_sync, EventType, NotificationEvent, OrderEvent (+5 more)

### Community 126 - "extend-stay/route.ts"
Cohesion: 0.38
Nodes (6): dynamic, GET(), getExtensionStore(), POST(), revalidate, StayExtensionRecord

### Community 127 - "README.md"
Cohesion: 0.18
Nodes (5): Data Retention Policy, Design Principles, DineFlow — Database Design, Entity Relationship Overview, Index Strategy Summary

### Community 128 - "Setup"
Cohesion: 0.12
Nodes (5): AIHandler, OrderHandler, Auth(), Setup(), contextKey

### Community 129 - "ui/pricing.tsx"
Cohesion: 0.13
Nodes (15): CANONICAL_PLANS, LandingPricing(), buttonVariants, Label, labelVariants, Pricing(), PricingPlan, PricingProps (+7 more)

### Community 134 - ".HandleInboundMessage"
Cohesion: 0.20
Nodes (7): TestPhoneNumberNormalization(), IsOptOutKeyword(), NormalizePhoneNumber(), ParseRating(), TestIsOptOutKeyword(), TestParseRating(), InboundResult

### Community 135 - "Phase 2 — Restaurant MVP"
Cohesion: 0.22
Nodes (9): 2.1 — Onboarding, 2.2 — Menu Management, 2.3 — Table & QR Code Management, 2.4 — Customer Ordering Experience, 2.5 — WebSocket / Real-Time, 2.6 — Order Management (Staff Dashboard), 2.7 — Kitchen Display System, 2.8 — Basic Analytics (+1 more)

### Community 137 - "Phase 1 — Foundation & Infrastructure"
Cohesion: 0.25
Nodes (8): 1.1 — Monorepo Setup, 1.2 — Backend Foundation (Go), 1.3 — Authentication Service, 1.4 — Multi-Tenancy Middleware, 1.5 — Frontend Foundation (Next.js), 1.6 — File Storage, 1.7 — Email Service, Phase 1 — Foundation & Infrastructure

### Community 138 - "Phase 2 — Restaurant MVP"
Cohesion: 0.25
Nodes (8): 2A — Business Onboarding, 2B — Menu Management, 2C — QR Code System, 2D — Customer Ordering Experience, 2E — Order Management (Staff Dashboard), 2F — Kitchen Display System, 2G — Basic Analytics, Phase 2 — Restaurant MVP

### Community 139 - "CustomerInvoice"
Cohesion: 0.40
Nodes (4): CalculateGST(), TestCalculateGST(), CustomerInvoice, CustomerInvoiceItem

### Community 140 - "Grace Period & Downgrade Automation"
Cohesion: 0.40
Nodes (5): Downgrade Execution (Day 14), Grace Period & Downgrade Automation, Grace Period Flow, Grace Period Timeline, Reactivation after Downgrade

## Knowledge Gaps
- **729 isolated node(s):** `TestResult`, `github.com/dineflow/api`, `geminiRequest`, `geminiResponse`, `SendOTPRequest` (+724 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 888 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `cn`, `useToast`, `ui/pricing.tsx`, `menu/page.tsx`, `spotlight-cursor.tsx`, `TubesCursor`, `hero-section.tsx`, `staff/page.tsx`, `toast.tsx`, `landing-workflow.tsx`, `rooms/page.tsx`, `[roomId]/page.tsx`, `forecast/page.tsx`, `web/package.json`, `notifications/page.tsx`, `app/layout.tsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `Service` connect `Service` to `main`, `go_pkg_time`, `.HandleInboundMessage`, `github.com/gin-gonic/gin.Context`, `whatsapp/whatsapp.go`, `NewScope`, `CustomerInvoice`, `ai/service.go`, `testing.T`, `context.Context`, `NewService`, `OpenWAProvider`, `.SendOrderConfirmation`, `.LogMessage`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `main()` connect `main` to `Setup`, `server/main.go`, `Service`, `testing.T`, `config.go`, `context.Context`, `Subscription`, `Order`, `handlers/room.go`, `tenant/tenant.go`, `ai/service.go`, `OpenWAProvider`, `Service`, `analytics/service.go`, `Maker`, `Service`, `handlers/menu.go`, `NewService`, `Hub`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `TestResult`, `github.com/dineflow/api`, `geminiRequest` to the rest of the system?**
  _729 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `OK` be split into smaller, more focused modules?**
  _Cohesion score 0.11836734693877551 - nodes in this community are weakly interconnected._
- **Should `useToast` be split into smaller, more focused modules?**
  _Cohesion score 0.05585106382978723 - nodes in this community are weakly interconnected._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.07172799254774104 - nodes in this community are weakly interconnected._