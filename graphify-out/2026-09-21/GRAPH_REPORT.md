# Graph Report - DineFlow  (2026-09-21)

## Corpus Check
- 319 files · ~429,712 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: (none) 6, .example 2, .toml 1)

## Summary
- 2645 nodes · 7386 edges · 145 communities (107 shown, 38 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 55 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4a9a21b7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- github.com/gin-gonic/gin.Context
- NewScope
- lucide-react
- context.Context
- menu/page.tsx
- go_pkg_time
- server/main.go
- whatsapp/whatsapp.go
- go.mongodb.org/mongo-driver/v2/bson.ObjectID
- Service
- Service
- ref_next_server
- .ProcessChatbotMessage
- useToast
- testing.T
- config.go
- OK
- Service
- forecast/page.tsx
- DineFlow — UI/UX Guidelines
- BadRequest
- Subscription
- Order
- staff/page.tsx
- web/package.json
- Scope
- redisKey
- notifications/page.tsx
- storage/storage.go
- dependencies
- compilerOptions
- app/layout.tsx
- tasks
- cn
- components.json
- main
- package.json
- WhatsAppHandler
- DineFlow — Development Plan
- video/page.tsx
- devDependencies
- scripts
- tenant/tenant.go
- time.Time
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
- react
- DineFlow — Subscription Model
- AuthHandler
- tasks/route.ts
- Collections
- useAuthStore
- Service
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
- AnalyticsHandler
- DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)
- Code Quality Standards
- handlers/table.go
- DineFlow — Antigravity (`agy`) Workspace Rules
- landing-workflow.tsx
- generate-logo/route.ts
- Service
- Ponytail: Anti-Overengineering & YAGNI Guardrails
- Ponytail Technical Debt Analysis
- Ponytail Configuration & Status
- web/README.md
- MenuItem
- handlers/room.go
- Setup
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
- middleware/auth.go
- SubscriptionHandler
- menu-nlp-engine.ts
- Service
- ui/pricing.tsx
- OrderHandler
- Phase 2 — Restaurant MVP
- dnd/route.ts
- remotion.config.ts
- rooms/page.tsx
- logs/route.ts
- extend-stay/route.ts
- README.md
- public/route.ts
- 2. Functional Requirements
- .LogMessage
- .SendInvoiceViaWhatsApp
- deploy.sh
- gen-secrets.sh
- search.go
- table/route.ts
- NewFirebaseTestProvider
- .Register
- MSG91Provider
- label.tsx
- 2. Color Palette
- 7. Layout System
- 6. Animation & Micro-Interactions
- 9. Accessibility
- .ProcessWorkforceCheckIn

## God Nodes (most connected - your core abstractions)
1. `OK()` - 157 edges
2. `BadRequest()` - 137 edges
3. `react` - 122 edges
4. `GetTenantID()` - 113 edges
5. `Unauthorized()` - 109 edges
6. `lucide-react` - 95 edges
7. `useToast()` - 91 edges
8. `InternalError()` - 88 edges
9. `cn()` - 80 edges
10. `Button` - 62 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `SetHealthDeps()`  [EXTRACTED]
  apps/api/cmd/server/main.go → apps/api/internal/interfaces/http/handlers/health.go
- `UpdateOrderStatusRequest` --references--> `OrderStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/order.go → apps/api/internal/domain/order/order.go
- `UpdateRoomStatusRequest` --references--> `RoomStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/room.go → apps/api/internal/domain/room/room.go
- `UpdateTaskRequest` --references--> `TaskStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/room.go → apps/api/internal/domain/room/room.go
- `TestIndianPhoneValidation()` --calls--> `ValidateAndNormalizeIndianPhone()`  [INFERRED]
  apps/api/internal/domain/room/room_test.go → apps/api/internal/domain/room/room.go

## Import Cycles
- None detected.

## Communities (145 total, 38 thin omitted)

### Community 0 - "github.com/gin-gonic/gin.Context"
Cohesion: 0.10
Nodes (15): AIHandler, PlatformHandler, PlanLimitMiddleware(), Conflict(), FeatureNotAvailable(), InternalError(), NoContent(), OKWithMeta() (+7 more)

### Community 1 - "NewScope"
Cohesion: 0.06
Nodes (33): cleanPhoneNumber(), DefaultPermissionsForRole(), PublicProfile, User, IsPlatformRole(), TestDefaultPermissionsForRole(), TestUserToPublic(), NewScope() (+25 more)

### Community 2 - "lucide-react"
Cohesion: 0.10
Nodes (43): getDescription(), MenuWriterPage(), MOCK_DESCRIPTIONS, SAMPLE_ITEMS, TONES, AI_TOOLS, STATS, ALERT_CONFIG (+35 more)

### Community 3 - "context.Context"
Cohesion: 0.08
Nodes (12): cleanGuestName(), cleanOrderNumber(), cleanTableName(), NewService(), Service, Client, New(), IPBlocklist() (+4 more)

### Community 4 - "menu/page.tsx"
Cohesion: 0.09
Nodes (42): IMAGE_PRESETS, MenuManagementPage(), INITIAL_KDS_ORDERS, KdsItem, KdsOrder, KDSOrdersPage(), MENU_PRESETS, CameraMenuScannerModal() (+34 more)

### Community 5 - "go_pkg_time"
Cohesion: 0.12
Nodes (31): SendOTPRequest, go_pkg_context, go_pkg_crypto_rand, go_pkg_encoding_csv, go_pkg_errors, go_pkg_fmt, go_pkg_github_com_dineflow_api_internal_domain_notification, go_pkg_github_com_dineflow_api_internal_domain_order (+23 more)

### Community 6 - "server/main.go"
Cohesion: 0.06
Nodes (47): corsMiddleware(), NewAuthHandler(), Health(), SetHealthDeps(), Version(), NewPlatformHandler(), TestGenerateCode(), go_pkg_github_com_dineflow_api_internal_application_ai (+39 more)

### Community 7 - "whatsapp/whatsapp.go"
Cohesion: 0.12
Nodes (26): Campaign, CampaignStats, CampaignStatus, CampaignType, ChatbotSession, ChatbotState, InteractiveButton, InteractiveRow (+18 more)

### Community 8 - "go.mongodb.org/mongo-driver/v2/bson.ObjectID"
Cohesion: 0.10
Nodes (15): ValidateAndNormalizeIndianPhone(), ParseObjectID(), go.mongodb.org/mongo-driver/v2/bson.ObjectID, ExtensionStatus, Guest, GuestStatus, HotelStats, HousekeepingTask (+7 more)

### Community 9 - "Service"
Cohesion: 0.10
Nodes (6): Service, SessionManager, WhatsAppProvider, NotificationEmitter, WhatsAppConfig, WorkforceTokenVerifyResult

### Community 10 - "Service"
Cohesion: 0.12
Nodes (24): ChatbotMessage, ChatbotResponse, ChatTurn, ForecastDay, ForecastHour, ForecastResponse, MenuDescriptionRequest, MenuDescriptionResponse (+16 more)

### Community 11 - "ref_next_server"
Cohesion: 0.13
Nodes (7): dynamic, revalidate, dynamic, dynamic, revalidate, config, ref_next_server

### Community 12 - ".ProcessChatbotMessage"
Cohesion: 0.21
Nodes (7): TestPhoneNumberNormalization(), IsOptOutKeyword(), NormalizePhoneNumber(), ParseRating(), TestIsOptOutKeyword(), TestParseRating(), InboundResult

### Community 13 - "useToast"
Cohesion: 0.05
Nodes (53): VerifyContent(), PricingAlertsPage(), UpsellPage(), AnalyticsPage(), DashboardOverviewPage(), OrderTrackingPage(), MenuItem, RoomInfo (+45 more)

### Community 14 - "testing.T"
Cohesion: 0.06
Nodes (49): TestSearchScenarios(), NewService(), TestSearchAll_EmptyQuery(), TestSearchAll_ShortQuery(), NewService(), TestApplyLeave_Validation(), TestCreateHoliday_Validation(), TestCreateShift_Validation() (+41 more)

### Community 15 - "config.go"
Cohesion: 0.16
Nodes (18): getEnv(), getEnvInt(), Load(), requireEnv(), AIConfig, AppConfig, Config, EmailConfig (+10 more)

### Community 16 - "OK"
Cohesion: 0.09
Nodes (6): AuthHandler, RoomHandler, TenantHandler, GetRole(), NotFound(), OK()

### Community 17 - "Service"
Cohesion: 0.08
Nodes (23): CalculateHealthScore(), AnnouncementInfo, AuditActor, AuditLogRecord, BusinessType, ClientStatus, DashboardMetrics, FeatureFlagDefinition (+15 more)

### Community 18 - "forecast/page.tsx"
Cohesion: 0.16
Nodes (9): DAYS, ForecastPage(), generateForecast(), getIntensityClass(), HOURS, INSIGHTS, DEFAULT_HOSPITALITY_MESSAGES, HospitalityLoader() (+1 more)

### Community 19 - "DineFlow — UI/UX Guidelines"
Cohesion: 0.08
Nodes (26): 10. Responsive Breakpoints, 11. Iconography, 12. Empty States, 13. Toast / Notification System, 1. Design Philosophy, 3. Typography, 4. Spacing System, 5. Component Library (+18 more)

### Community 20 - "BadRequest"
Cohesion: 0.09
Nodes (10): buildMenuItemFromUpsertRequest(), MenuHandler, NotificationHandler, StaffHandler, TableHandler, GetTenantID(), GetUserID(), BadRequest() (+2 more)

### Community 21 - "Subscription"
Cohesion: 0.15
Nodes (14): FormatPlanName(), GetLimits(), NewSubscriptionHandler(), AdminOverrideRequest, CheckoutRequest, BillingCycle, CheckoutSessionResult, PlanLimits (+6 more)

### Community 22 - "Order"
Cohesion: 0.11
Nodes (13): Service, Order, DestinationType, notifServiceIface, OrderItem, OrderItemModifier, OrderSource, OrderStatus (+5 more)

### Community 23 - "staff/page.tsx"
Cohesion: 0.04
Nodes (68): ForgotPasswordContent(), Step, LoginPage(), RegisterPage(), ResetPasswordContent(), DEFAULT_FALLBACK_ROOMS, getStayMetrics(), HousekeepingTask (+60 more)

### Community 24 - "web/package.json"
Cohesion: 0.09
Nodes (21): typescript, name, packageManager, private, version, axios, clsx, eslint (+13 more)

### Community 25 - "Scope"
Cohesion: 0.21
Nodes (8): ensureUpdatedAt(), go.mongodb.org/mongo-driver/v2/bson.M, go.mongodb.org/mongo-driver/v2/mongo.Cursor, go.mongodb.org/mongo-driver/v2/mongo.DeleteResult, go.mongodb.org/mongo-driver/v2/mongo.InsertManyResult, go.mongodb.org/mongo-driver/v2/mongo.InsertOneResult, go.mongodb.org/mongo-driver/v2/mongo.UpdateResult, Scope

### Community 26 - "redisKey"
Cohesion: 0.29
Nodes (5): GenerateCode(), redis.Client, NewService(), redisKey(), Service

### Community 27 - "notifications/page.tsx"
Cohesion: 0.11
Nodes (26): CATEGORIES, CATEGORY_META, NotificationsPage(), PRIORITIES, PRIORITY_BADGE, timeAgo(), calculateDistanceMeters(), CheckInContent() (+18 more)

### Community 28 - "storage/storage.go"
Cohesion: 0.15
Nodes (13): StorageService, NewService(), TestStorageValidation(), StorageHandler, NewStorageHandler(), go_pkg_crypto_sha256, go_pkg_encoding_hex, go_pkg_github_com_dineflow_api_internal_infrastructure_storage (+5 more)

### Community 29 - "dependencies"
Cohesion: 0.09
Nodes (22): dependencies, axios, canvas-confetti, class-variance-authority, clsx, framer-motion, lucide-react, next (+14 more)

### Community 30 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 31 - "app/layout.tsx"
Cohesion: 0.10
Nodes (17): apps_web_app_globals, manrope, metadata, plusJakarta, spaceGrotesk, viewport, ResolvedTheme, Theme (+9 more)

### Community 32 - "tasks"
Cohesion: 0.11
Nodes (17): dependsOn, inputs, outputs, cache, cache, persistent, dependsOn, $schema (+9 more)

### Community 33 - "cn"
Cohesion: 0.07
Nodes (29): SettingsPage(), BUSINESS_CATEGORIES, BusinessCategory, BusinessCategorySelector(), BusinessCategorySelectorProps, CATEGORY_CONFIG, FILTER_CHIPS, GlobalSearch() (+21 more)

### Community 34 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 35 - "main"
Cohesion: 0.10
Nodes (25): main(), requestLogger(), runStartupCleanup(), seedDefaultData(), seedPlatformData(), NewService(), NewService(), NewService() (+17 more)

### Community 36 - "package.json"
Cohesion: 0.09
Nodes (21): description, devDependencies, prettier, turbo, typescript, engines, node, typescript (+13 more)

### Community 37 - "WhatsAppHandler"
Cohesion: 0.12
Nodes (3): WhatsAppHandler, verifyMetaSignature(), verifyOpenWASignature()

### Community 38 - "DineFlow — Development Plan"
Cohesion: 0.07
Nodes (30): 1.1 — Monorepo Setup, 1.2 — Backend Foundation (Go), 1.3 — Authentication Service, 1.4 — Multi-Tenancy Middleware, 1.5 — Frontend Foundation (Next.js), 1.6 — File Storage, 1.7 — Email Service, 2.1 — Onboarding (+22 more)

### Community 39 - "video/page.tsx"
Cohesion: 0.11
Nodes (14): Player, VideoType, AIPresenter(), AIPresenterProps, defaultDineFlowPromoProps, DineFlowPromo(), DineFlowPromoProps, defaultQROrderingDemoProps (+6 more)

### Community 40 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti, @types/node, @types/react (+2 more)

### Community 41 - "scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, test, version

### Community 42 - "tenant/tenant.go"
Cohesion: 0.26
Nodes (15): FeaturesForPlan(), BusinessType, Tenant, LimitsForPlan(), Address, Contact, DayHours, Features (+7 more)

### Community 43 - "time.Time"
Cohesion: 0.15
Nodes (14): time.Time, CreateNotificationRequest, Category, CreateNotificationInput, Notification, Priority, FeatureFlagRecord, RateLimitResult (+6 more)

### Community 44 - "DineFlow — System Architecture"
Cohesion: 0.07
Nodes (27): Application Structure, Architecture Philosophy, Backend Architecture, Clean Architecture Dependency Flow, Customer Ordering Page — SSG + ISR, Database Architecture, Deployment Architecture, Deployment Pipeline (+19 more)

### Community 45 - "ai/service.go"
Cohesion: 0.08
Nodes (33): geminiRequest, geminiResponse, main(), testCORSOriginDefense(), testMetaWebhookHMACSignature(), testNoSQLInjectionInBody(), testNoSQLInjectionInQueryParams(), testRequestIDTracing() (+25 more)

### Community 46 - "DineFlow — API Strategy"
Cohesion: 0.08
Nodes (24): API Design Principles, API Rate Limits, Base URLs, Client → Server (Actions), DineFlow — API Strategy, Module 10 — Menu Items, Module 11 — Modifier Groups, Module 12 — Customer Ordering (Public API — No Auth) (+16 more)

### Community 47 - "eslint.config.mjs"
Cohesion: 0.40
Nodes (4): eslintConfig, ref_eslint_config, ref_eslint_config_next_core_web_vitals, ref_eslint_config_next_typescript

### Community 48 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, start, video:preview, video:render, video:render:qr

### Community 49 - "web/vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, framework, installCommand, $schema

### Community 50 - "vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, framework, installCommand, $schema

### Community 51 - "Service"
Cohesion: 0.17
Nodes (9): NewService(), ValidatePasswordComplexity(), OTPProvider, NormalizePhone(), AuthResponse, EmailSender, LoginRequest, Service (+1 more)

### Community 52 - "OpenWAProvider"
Cohesion: 0.09
Nodes (9): CleanPhoneNumber(), FormatChatID(), SessionStatus, net/http.Request, sync.RWMutex, MetaCloudProvider, MockProvider, OpenWAProvider (+1 more)

### Community 55 - "printer.go"
Cohesion: 0.26
Nodes (12): centerText(), GenerateBillText(), GenerateKOTText(), padRow(), TestGenerateBillText(), TestGenerateKOTText(), truncate(), BillData (+4 more)

### Community 56 - "react"
Cohesion: 0.05
Nodes (45): DashboardErrorProps, OrderStatus, TrackingOrder, TrackingOrderItem, COMPARISON_ROWS, PLANS, PlanTier, PricingPage() (+37 more)

### Community 57 - "DineFlow — Subscription Model"
Cohesion: 0.07
Nodes (27): Billing Cycle Options, Billing Mechanics, DineFlow — Subscription Model, Downgrade Execution (Day 14), Enforcement Layers, Feature Flag System, 🆓 Free — "Just Getting Started", Future: Platform License (+19 more)

### Community 58 - "AuthHandler"
Cohesion: 0.29
Nodes (5): clearRefreshTokenCookie(), AuthHandler, setRefreshTokenCookie(), GetTokenID(), Forbidden()

### Community 59 - "tasks/route.ts"
Cohesion: 0.29
Nodes (14): dynamic, GET(), PATCH(), POST(), revalidate, countActiveTasksForStaff(), findAvailableHousekeeper(), getTasksStore() (+6 more)

### Community 60 - "Collections"
Cohesion: 0.13
Nodes (15): Collection: `audit_logs`, Collection: `categories`, Collection: `locations`, Collection: `menu_items`, Collection: `menus`, Collection: `modifier_groups`, Collection: `notifications`, Collection: `orders` (+7 more)

### Community 61 - "useAuthStore"
Cohesion: 0.05
Nodes (62): DashboardLayout(), RootLoading(), PlatformAnalyticsPage(), ClientDetailsPage(), PlatformClientsPage(), PlatformDashboardPage(), PlatformLayout(), PlatformSubscriptionsPage() (+54 more)

### Community 62 - "Service"
Cohesion: 0.22
Nodes (7): CategoryShare, HourlyPoint, OverviewMetrics, Service, TopItemMetric, NewService(), NewAnalyticsHandler()

### Community 63 - "DineFlow — Feature Roadmap"
Cohesion: 0.15
Nodes (13): Cross-Phase Dependencies Map, Deliverables, Deliverables, DineFlow — Feature Roadmap, Overview, Phase 0 — Planning & Architecture, Phase 1 — Foundation & Infrastructure, Phase 3 — Hotel Module (+5 more)

### Community 64 - "DineFlow — Product Vision"
Cohesion: 0.09
Nodes (21): Business Metrics (12-Month Targets), Competitive Landscape, Customer Experience Metrics, DineFlow — Product Vision, Long-Term Vision (3–5 Years), Mission, Primary Segments, Problem 1 — Fragmented Software Stack (+13 more)

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

### Community 75 - "DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)"
Cohesion: 0.25
Nodes (7): 1. Overview & Vision, 2. End-to-End Pipeline Architecture, 3.1 Inbound WhatsApp Webhook (`POST /webhooks/whatsapp`), 3.2 Staging Collection (`menu_imports_staging`), 3. Webhook Payload & Data Schema, 4. Security, Multi-Tenancy & Privacy Controls, DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)

### Community 76 - "Code Quality Standards"
Cohesion: 0.29
Nodes (6): 1. TypeScript & React, 2. Go (Golang), 3. API & Data Access Hygiene, 4. Code Review Output Format, Code Quality Standards, Staff Engineer Code Review Runbook

### Community 77 - "handlers/table.go"
Cohesion: 0.24
Nodes (9): NewTableHandler(), go_pkg_github_com_dineflow_api_internal_application_table, go_pkg_github_com_dineflow_api_internal_domain_table, BulkCreateRoomsRequest, CreateTableRequest, ToggleDNDRequest, UpdateTableStatusRequest, LocationType (+1 more)

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

### Community 86 - "MenuItem"
Cohesion: 0.23
Nodes (9): UpsertItemRequest, Category, DietaryTag, MenuItem, ModifierGroup, ModifierOption, PublicCategorySection, PublicMenuResponse (+1 more)

### Community 87 - "handlers/room.go"
Cohesion: 0.12
Nodes (15): NewRoomHandler(), go_pkg_encoding_base64, go_pkg_github_com_dineflow_api_internal_application_room, ApproveExtensionRequestInput, BulkRoomsRequest, CreateRoomRequest, CreateTaskRequest, PublicAmenityRequest (+7 more)

### Community 88 - "Setup"
Cohesion: 0.20
Nodes (19): Auth(), RateLimit(), ChefOrAbove(), FinanceAdminOrAbove(), OwnerOnly(), OwnerOrManager(), PlatformAdminOrAbove(), RequireAnyRole() (+11 more)

### Community 115 - "middleware/auth.go"
Cohesion: 0.12
Nodes (12): ByIP(), ByIPAndRoute(), ByTenant(), NewMaker(), TestTokenMaker(), go_pkg_github_com_dineflow_api_internal_infrastructure_redis, go_pkg_github_com_dineflow_api_pkg_token, go_pkg_github_com_golang_jwt_jwt_v5 (+4 more)

### Community 117 - "menu-nlp-engine.ts"
Cohesion: 0.15
Nodes (21): callGeminiVision(), GEMINI_MODELS, maxDuration, POST(), RawMenuItem, ScanMenuRequestBody, INDIAN_CATEGORIES, INDIAN_DISH_CATALOG (+13 more)

### Community 118 - "Service"
Cohesion: 0.23
Nodes (3): NewService(), Service, Table

### Community 119 - "ui/pricing.tsx"
Cohesion: 0.17
Nodes (11): CANONICAL_PLANS, LandingPricing(), buttonVariants, Pricing(), PricingPlan, PricingProps, Switch, useMediaQuery() (+3 more)

### Community 121 - "Phase 2 — Restaurant MVP"
Cohesion: 0.25
Nodes (8): 2A — Business Onboarding, 2B — Menu Management, 2C — QR Code System, 2D — Customer Ordering Experience, 2E — Order Management (Staff Dashboard), 2F — Kitchen Display System, 2G — Basic Analytics, Phase 2 — Restaurant MVP

### Community 122 - "dnd/route.ts"
Cohesion: 0.38
Nodes (6): DNDRecord, dynamic, GET(), getDNDStore(), POST(), revalidate

### Community 124 - "rooms/page.tsx"
Cohesion: 0.18
Nodes (12): DEFAULT_ROOMS, getStayMetrics(), HotelStats, RoomItem, RoomsDirectoryPage(), TablesManagementPage(), QRCodeImage(), QRCodeImageProps (+4 more)

### Community 125 - "logs/route.ts"
Cohesion: 0.50
Nodes (4): dynamic, GET(), revalidate, getWhatsAppLogs()

### Community 126 - "extend-stay/route.ts"
Cohesion: 0.38
Nodes (6): dynamic, GET(), getExtensionStore(), POST(), revalidate, StayExtensionRecord

### Community 127 - "README.md"
Cohesion: 0.18
Nodes (5): Data Retention Policy, Design Principles, DineFlow — Database Design, Entity Relationship Overview, Index Strategy Summary

### Community 129 - "2. Functional Requirements"
Cohesion: 0.06
Nodes (33): 1. User Personas, 2.10 Staff Management, 2.11 WhatsApp Integration, 2.12 Analytics & Reporting, 2.13 Settings & Configuration, 2.1 Authentication & Multi-Tenancy, 2.2 Subscription & Billing, 2.3 Onboarding (+25 more)

### Community 130 - ".LogMessage"
Cohesion: 0.26
Nodes (7): BuildFeedbackRequestMessage(), BuildKitchenReadyMessage(), BuildOrderConfirmationMessage(), MessageLog, MessageStatus, OrderConfirmationData, TemplateType

### Community 131 - ".SendInvoiceViaWhatsApp"
Cohesion: 0.19
Nodes (9): CalculateGST(), GetStandardTemplates(), InterpolateTemplate(), TestBuildOrderConfirmationMessage(), TestCalculateGST(), TestGetStandardTemplates(), TestInterpolateTemplate(), CustomerInvoice (+1 more)

### Community 134 - "search.go"
Cohesion: 0.25
Nodes (8): SearchHandler, NewSearchHandler(), go_pkg_github_com_dineflow_api_internal_application_search, SearchFilterOptions, SearchResponse, SearchResultItem, SearchResultsGrouped, Service

### Community 136 - "NewFirebaseTestProvider"
Cohesion: 0.25
Nodes (7): Config, redis.Client, NewFirebaseTestProvider(), redis.Client, NewOTPProvider(), Config, FirebaseTestProvider

### Community 137 - ".Register"
Cohesion: 0.25
Nodes (3): generateSlug(), RegisterRequest, go.mongodb.org/mongo-driver/v2/mongo.Collection

### Community 138 - "MSG91Provider"
Cohesion: 0.29
Nodes (6): Config, redis.Client, NewMSG91Provider(), TestMSG91ProviderFallback(), net/http.Client, MSG91Provider

### Community 139 - "label.tsx"
Cohesion: 0.50
Nodes (4): Label, labelVariants, class-variance-authority, @radix-ui/react-label

### Community 140 - "2. Color Palette"
Cohesion: 0.40
Nodes (5): 2. Color Palette, Brand Colors, Customer Ordering Page — Light + Warm, Dark Mode (Default Dashboard Theme), Semantic Colors

### Community 141 - "7. Layout System"
Cohesion: 0.40
Nodes (5): 7. Layout System, Customer Ordering Page, Dashboard Layout, Grid System, KDS Layout

### Community 142 - "6. Animation & Micro-Interactions"
Cohesion: 0.50
Nodes (4): 6. Animation & Micro-Interactions, Animation Tokens, Key Animations, Rules

### Community 143 - "9. Accessibility"
Cohesion: 0.50
Nodes (4): 9. Accessibility, ARIA Patterns, Implementation, Standards

## Knowledge Gaps
- **742 isolated node(s):** `TestResult`, `github.com/dineflow/api`, `geminiRequest`, `geminiResponse`, `SendOTPRequest` (+737 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 912 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `cn`, `lucide-react`, `spotlight-cursor.tsx`, `menu/page.tsx`, `TubesCursor`, `video/page.tsx`, `label.tsx`, `useToast`, `landing-workflow.tsx`, `forecast/page.tsx`, `ui/pricing.tsx`, `staff/page.tsx`, `web/package.json`, `notifications/page.tsx`, `rooms/page.tsx`, `useAuthStore`, `app/layout.tsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `RoomHandler` connect `OK` to `NewScope`, `context.Context`, `go.mongodb.org/mongo-driver/v2/bson.ObjectID`, `Service`, `BadRequest`, `handlers/room.go`, `Setup`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `Service` connect `Service` to `NewScope`, `.LogMessage`, `main`, `.SendInvoiceViaWhatsApp`, `go_pkg_time`, `WhatsAppHandler`, `whatsapp/whatsapp.go`, `MSG91Provider`, `.ProcessChatbotMessage`, `ai/service.go`, `testing.T`, `.ProcessWorkforceCheckIn`, `OK`, `OpenWAProvider`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `TestResult`, `github.com/dineflow/api`, `geminiRequest` to the rest of the system?**
  _742 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `github.com/gin-gonic/gin.Context` be split into smaller, more focused modules?**
  _Cohesion score 0.09781420765027322 - nodes in this community are weakly interconnected._
- **Should `NewScope` be split into smaller, more focused modules?**
  _Cohesion score 0.06198198198198198 - nodes in this community are weakly interconnected._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.0972461273666093 - nodes in this community are weakly interconnected._