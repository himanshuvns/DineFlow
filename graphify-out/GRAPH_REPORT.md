# Graph Report - DineFlow  (2026-09-20)

## Corpus Check
- 295 files · ~365,687 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .example 2, .toml 1)

## Summary
- 2404 nodes · 6702 edges · 134 communities (96 shown, 38 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `beaeef61`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- InternalError
- useToast
- lucide-react
- rooms/page.tsx
- NewScope
- go_pkg_time
- server/main.go
- security-audit/main.go
- go.mongodb.org/mongo-driver/v2/bson.ObjectID
- whatsapp/whatsapp.go
- Service
- ref_next_server
- 2. Functional Requirements
- toast.tsx
- testing.T
- config.go
- OK
- Service
- context.Context
- DineFlow — UI/UX Guidelines
- BadRequest
- Subscription
- Order
- [roomId]/page.tsx
- web/package.json
- Scope
- handlers/room.go
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
- staff/page.tsx
- time.Time
- DineFlow — System Architecture
- tenant/tenant.go
- DineFlow — API Strategy
- eslint.config.mjs
- scripts
- web/vercel.json
- vercel.json
- Service
- ai/service.go
- postcss.config.mjs
- github.com/dineflow/api
- printer.go
- github.com/gin-gonic/gin.HandlerFunc
- DineFlow — Subscription Model
- Setup
- Service
- Collections
- Service
- otp.go
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
- 1. User Personas
- Notification
- DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)
- Code Quality Standards
- Maker
- DineFlow — Antigravity (`agy`) Workspace Rules
- label.tsx
- generate-logo/route.ts
- Service
- Ponytail: Anti-Overengineering & YAGNI Guardrails
- Ponytail Technical Debt Analysis
- Ponytail Configuration & Status
- web/README.md
- menu/menu.go
- roles.ts
- [orderId]/route.ts
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
- public/route.ts
- SubscriptionHandler
- menu-nlp-engine.ts
- table/route.ts
- README.md
- next.config.ts
- Phase 2 — Restaurant MVP
- OrderHandler
- scan/route.ts
- Problems Solved
- search.go
- NewFirebaseTestProvider
- extend-stay/route.ts
- demo.tsx
- landing-workflow.tsx
- NewOTPProvider
- 3. Non-Functional Requirements
- deploy.sh
- gen-secrets.sh

## God Nodes (most connected - your core abstractions)
1. `OK()` - 143 edges
2. `BadRequest()` - 125 edges
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
- `TestGenerateKOTText()` --calls--> `GenerateKOTText()`  [INFERRED]
  apps/api/internal/domain/printer/printer_test.go → apps/api/internal/domain/printer/printer.go
- `TestGenerateBillText()` --calls--> `GenerateBillText()`  [INFERRED]
  apps/api/internal/domain/printer/printer_test.go → apps/api/internal/domain/printer/printer.go
- `TestDefaultPermissionsForRole()` --calls--> `DefaultPermissionsForRole()`  [INFERRED]
  apps/api/internal/domain/user/user_test.go → apps/api/internal/domain/user/user.go

## Import Cycles
- None detected.

## Communities (134 total, 38 thin omitted)

### Community 0 - "InternalError"
Cohesion: 0.12
Nodes (3): PlatformHandler, InternalError(), OKWithMeta()

### Community 1 - "useToast"
Cohesion: 0.10
Nodes (26): VerifyContent(), getDescription(), MenuWriterPage(), PricingAlertsPage(), UpsellPage(), AnalyticsPage(), KDSOrdersPage(), DashboardOverviewPage() (+18 more)

### Community 2 - "lucide-react"
Cohesion: 0.08
Nodes (57): DAYS, ForecastPage(), generateForecast(), getIntensityClass(), HOURS, INSIGHTS, MOCK_DESCRIPTIONS, SAMPLE_ITEMS (+49 more)

### Community 3 - "rooms/page.tsx"
Cohesion: 0.20
Nodes (11): DEFAULT_ROOMS, getStayMetrics(), HotelStats, RoomItem, RoomsDirectoryPage(), QRCodeImage(), QRCodeImageProps, useViewMode() (+3 more)

### Community 4 - "NewScope"
Cohesion: 0.16
Nodes (7): NewScope(), buildMenuItemFromUpsertRequest(), Category, MenuItem, PublicCategorySection, PublicMenuResponse, Service

### Community 5 - "go_pkg_time"
Cohesion: 0.13
Nodes (31): SendOTPRequest, go_pkg_context, go_pkg_encoding_csv, go_pkg_errors, go_pkg_fmt, go_pkg_github_com_dineflow_api_internal_domain_menu, go_pkg_github_com_dineflow_api_internal_domain_order, go_pkg_github_com_dineflow_api_internal_domain_platform (+23 more)

### Community 6 - "server/main.go"
Cohesion: 0.05
Nodes (57): Health(), SetHealthDeps(), Version(), NewPlatformHandler(), NewStaffHandler(), NewSubscriptionHandler(), NewTableHandler(), ByIP() (+49 more)

### Community 7 - "security-audit/main.go"
Cohesion: 0.14
Nodes (17): main(), testCORSOriginDefense(), testMetaWebhookHMACSignature(), testNoSQLInjectionInBody(), testNoSQLInjectionInQueryParams(), testRequestIDTracing(), testSecurityHeaders(), hasOperatorInjection() (+9 more)

### Community 8 - "go.mongodb.org/mongo-driver/v2/bson.ObjectID"
Cohesion: 0.14
Nodes (14): ParseObjectID(), go.mongodb.org/mongo-driver/v2/bson.ObjectID, UpdateRoomStatusRequest, UpdateTaskRequest, Guest, GuestStatus, HotelStats, HousekeepingTask (+6 more)

### Community 9 - "whatsapp/whatsapp.go"
Cohesion: 0.06
Nodes (47): BuildFeedbackRequestMessage(), BuildKitchenReadyMessage(), BuildOrderConfirmationMessage(), GetStandardTemplates(), IsOptOutKeyword(), ParseRating(), TestBuildOrderConfirmationMessage(), TestGetStandardTemplates() (+39 more)

### Community 10 - "Service"
Cohesion: 0.13
Nodes (23): ChatbotMessage, ChatbotResponse, ChatTurn, ForecastDay, ForecastHour, ForecastResponse, MenuDescriptionRequest, MenuDescriptionResponse (+15 more)

### Community 11 - "ref_next_server"
Cohesion: 0.17
Nodes (5): dynamic, dynamic, revalidate, config, ref_next_server

### Community 12 - "2. Functional Requirements"
Cohesion: 0.14
Nodes (14): 2.10 Staff Management, 2.11 WhatsApp Integration, 2.12 Analytics & Reporting, 2.13 Settings & Configuration, 2.1 Authentication & Multi-Tenancy, 2.2 Subscription & Billing, 2.3 Onboarding, 2.4 Menu Management (+6 more)

### Community 13 - "toast.tsx"
Cohesion: 0.05
Nodes (72): IMAGE_PRESETS, MenuManagementPage(), INITIAL_KDS_ORDERS, KdsItem, KdsOrder, MENU_PRESETS, MenuItem, RoomInfo (+64 more)

### Community 14 - "testing.T"
Cohesion: 0.06
Nodes (41): TestSearchScenarios(), NewService(), TestSearchAll_EmptyQuery(), TestSearchAll_ShortQuery(), NewService(), TestApplyLeave_Validation(), TestCreateHoliday_Validation(), TestCreateShift_Validation() (+33 more)

### Community 15 - "config.go"
Cohesion: 0.17
Nodes (17): getEnv(), getEnvInt(), Load(), requireEnv(), AIConfig, AppConfig, Config, EmailConfig (+9 more)

### Community 16 - "OK"
Cohesion: 0.11
Nodes (5): AuthHandler, RoomHandler, TenantHandler, NotFound(), OK()

### Community 17 - "Service"
Cohesion: 0.08
Nodes (22): CalculateHealthScore(), AnnouncementInfo, AuditActor, AuditLogRecord, BusinessType, ClientStatus, DashboardMetrics, FeatureFlagDefinition (+14 more)

### Community 18 - "context.Context"
Cohesion: 0.09
Nodes (11): cleanGuestName(), cleanOrderNumber(), cleanTableName(), Client, New(), RateLimit(), context.Context, time.Duration (+3 more)

### Community 19 - "DineFlow — UI/UX Guidelines"
Cohesion: 0.04
Nodes (44): 10. Responsive Breakpoints, 11. Iconography, 12. Empty States, 13. Toast / Notification System, 1. Design Philosophy, 2. Color Palette, 3. Typography, 4. Spacing System (+36 more)

### Community 20 - "BadRequest"
Cohesion: 0.10
Nodes (10): MenuHandler, NotificationHandler, StaffHandler, TableHandler, GetTenantID(), GetUserID(), ByTenant(), BadRequest() (+2 more)

### Community 21 - "Subscription"
Cohesion: 0.15
Nodes (14): FormatPlanName(), GetLimits(), AdminOverrideRequest, CheckoutRequest, BillingCycle, CheckoutSessionResult, Invoice, PlanLimits (+6 more)

### Community 22 - "Order"
Cohesion: 0.09
Nodes (20): Order, GetHub(), Hub, NewNotificationHandler(), NewOrderHandler(), sync.RWMutex, UpdateOrderStatusRequest, DestinationType (+12 more)

### Community 23 - "[roomId]/page.tsx"
Cohesion: 0.06
Nodes (44): ForgotPasswordContent(), Step, LoginPage(), RegisterPage(), ResetPasswordContent(), getStayMetrics(), HousekeepingTask, RoomDetail (+36 more)

### Community 24 - "web/package.json"
Cohesion: 0.10
Nodes (20): typescript, name, packageManager, private, version, axios, clsx, eslint (+12 more)

### Community 25 - "Scope"
Cohesion: 0.18
Nodes (9): ensureUpdatedAt(), go.mongodb.org/mongo-driver/v2/bson.M, go.mongodb.org/mongo-driver/v2/mongo.Collection, go.mongodb.org/mongo-driver/v2/mongo.Cursor, go.mongodb.org/mongo-driver/v2/mongo.DeleteResult, go.mongodb.org/mongo-driver/v2/mongo.InsertManyResult, go.mongodb.org/mongo-driver/v2/mongo.InsertOneResult, go.mongodb.org/mongo-driver/v2/mongo.UpdateResult (+1 more)

### Community 26 - "handlers/room.go"
Cohesion: 0.17
Nodes (11): NewRoomHandler(), go_pkg_encoding_base64, go_pkg_github_com_dineflow_api_internal_application_room, go_pkg_github_com_dineflow_api_internal_domain_room, BulkRoomsRequest, CreateRoomRequest, CreateTaskRequest, PublicAmenityRequest (+3 more)

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
Cohesion: 0.12
Nodes (14): apps_web_app_globals, manrope, metadata, plusJakarta, spaceGrotesk, viewport, ResolvedTheme, Theme (+6 more)

### Community 32 - "tasks"
Cohesion: 0.11
Nodes (17): dependsOn, inputs, outputs, cache, cache, persistent, dependsOn, $schema (+9 more)

### Community 33 - "useAuthStore"
Cohesion: 0.06
Nodes (51): DashboardLayout(), RootLoading(), PlatformLayout(), CATEGORY_CONFIG, FILTER_CHIPS, QUICK_ACTIONS, QuickActionItem, RecentSearchItem (+43 more)

### Community 34 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 35 - "main"
Cohesion: 0.13
Nodes (20): main(), requestLogger(), runStartupCleanup(), NewService(), NewService(), NewService(), NewService(), NewService() (+12 more)

### Community 36 - "package.json"
Cohesion: 0.09
Nodes (21): description, devDependencies, prettier, turbo, typescript, engines, node, typescript (+13 more)

### Community 37 - "github.com/gin-gonic/gin.Context"
Cohesion: 0.10
Nodes (6): AIHandler, AnalyticsHandler, WhatsAppHandler, PlanLimitMiddleware(), PlanLimitExceeded(), github.com/gin-gonic/gin.Context

### Community 38 - "DineFlow — Development Plan"
Cohesion: 0.07
Nodes (30): 1.1 — Monorepo Setup, 1.2 — Backend Foundation (Go), 1.3 — Authentication Service, 1.4 — Multi-Tenancy Middleware, 1.5 — Frontend Foundation (Next.js), 1.6 — File Storage, 1.7 — Email Service, 2.1 — Onboarding (+22 more)

### Community 39 - "react"
Cohesion: 0.03
Nodes (75): SettingsPage(), COMPARISON_ROWS, PLANS, PlanTier, PricingPage(), BUSINESS_CATEGORIES, BusinessCategory, BusinessCategorySelector() (+67 more)

### Community 40 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti, @types/node, @types/react (+2 more)

### Community 41 - "scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, test, version

### Community 42 - "staff/page.tsx"
Cohesion: 0.11
Nodes (20): AttendanceRecord, BankDetails, calculateDistanceM(), EmergencyContact, GeofenceConfig, Holiday, LeaveBalance, LeaveRequest (+12 more)

### Community 43 - "time.Time"
Cohesion: 0.06
Nodes (37): cleanPhoneNumber(), CalculateDistanceMeters(), DefaultPermissionsForRole(), PublicProfile, User, IsPlatformRole(), TestCalculateDistanceMeters(), time.Time (+29 more)

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

### Community 51 - "Service"
Cohesion: 0.13
Nodes (12): generateSlug(), NewService(), ValidatePasswordComplexity(), NewAuthHandler(), OTPProvider, NormalizePhone(), AuthResponse, EmailSender (+4 more)

### Community 52 - "ai/service.go"
Cohesion: 0.11
Nodes (20): geminiRequest, geminiResponse, NewService(), TestPhoneNumberNormalization(), TestWorkforceCheckInMessageFormat(), TestWorkforceTokens(), NormalizePhoneNumber(), NewWhatsAppHandler() (+12 more)

### Community 55 - "printer.go"
Cohesion: 0.36
Nodes (10): centerText(), GenerateBillText(), GenerateKOTText(), padRow(), truncate(), BillData, BillItem, KOTData (+2 more)

### Community 56 - "github.com/gin-gonic/gin.HandlerFunc"
Cohesion: 0.32
Nodes (14): corsMiddleware(), ChefOrAbove(), FinanceAdminOrAbove(), OwnerOnly(), OwnerOrManager(), PlatformAdminOrAbove(), RequireAnyRole(), RequirePlatformRole() (+6 more)

### Community 57 - "DineFlow — Subscription Model"
Cohesion: 0.07
Nodes (27): Billing Cycle Options, Billing Mechanics, DineFlow — Subscription Model, Downgrade Execution (Day 14), Enforcement Layers, Feature Flag System, 🆓 Free — "Just Getting Started", Future: Platform License (+19 more)

### Community 58 - "Setup"
Cohesion: 0.10
Nodes (17): clearRefreshTokenCookie(), AuthHandler, setRefreshTokenCookie(), Auth(), GetRole(), GetTokenID(), Setup(), Conflict() (+9 more)

### Community 59 - "Service"
Cohesion: 0.24
Nodes (6): CategoryShare, HourlyPoint, OverviewMetrics, Service, TopItemMetric, NewAnalyticsHandler()

### Community 60 - "Collections"
Cohesion: 0.13
Nodes (15): Collection: `audit_logs`, Collection: `categories`, Collection: `locations`, Collection: `menu_items`, Collection: `menus`, Collection: `modifier_groups`, Collection: `notifications`, Collection: `orders` (+7 more)

### Community 61 - "Service"
Cohesion: 0.22
Nodes (4): UpdateTableStatusRequest, Service, Table, TableStatus

### Community 62 - "otp.go"
Cohesion: 0.17
Nodes (10): GenerateCode(), redis.Client, NewService(), redisKey(), TestGenerateCode(), go_pkg_crypto_rand, go_pkg_math_big, net/http.Client (+2 more)

### Community 63 - "DineFlow — Feature Roadmap"
Cohesion: 0.15
Nodes (13): Cross-Phase Dependencies Map, Deliverables, Deliverables, DineFlow — Feature Roadmap, Overview, Phase 0 — Planning & Architecture, Phase 1 — Foundation & Infrastructure, Phase 3 — Hotel Module (+5 more)

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

### Community 73 - "1. User Personas"
Cohesion: 0.15
Nodes (12): 1. User Personas, 4. User Journeys, DineFlow — Product Requirements, Journey 1 — New Restaurant Onboarding, Journey 2 — Customer Orders via QR, Journey 3 — Subscription Renewal Failure, Journey 4 — Hotel Room Service, Persona 1 — Riya (Restaurant Owner) (+4 more)

### Community 74 - "Notification"
Cohesion: 0.48
Nodes (5): CreateNotificationRequest, Category, CreateNotificationInput, Notification, Priority

### Community 75 - "DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)"
Cohesion: 0.25
Nodes (7): 1. Overview & Vision, 2. End-to-End Pipeline Architecture, 3.1 Inbound WhatsApp Webhook (`POST /webhooks/whatsapp`), 3.2 Staging Collection (`menu_imports_staging`), 3. Webhook Payload & Data Schema, 4. Security, Multi-Tenancy & Privacy Controls, DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)

### Community 76 - "Code Quality Standards"
Cohesion: 0.29
Nodes (6): 1. TypeScript & React, 2. Go (Golang), 3. API & Data Access Hygiene, 4. Code Review Output Format, Code Quality Standards, Staff Engineer Code Review Runbook

### Community 77 - "Maker"
Cohesion: 0.44
Nodes (4): Maker, jwt.RegisteredClaims, Claims, TokenType

### Community 78 - "DineFlow — Antigravity (`agy`) Workspace Rules"
Cohesion: 0.29
Nodes (6): Code Style, DineFlow — Antigravity (`agy`) Workspace Rules, Key Files, Project, Tech Stack, Workflow Rules

### Community 79 - "label.tsx"
Cohesion: 0.50
Nodes (4): Label, labelVariants, class-variance-authority, @radix-ui/react-label

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

### Community 87 - "roles.ts"
Cohesion: 0.17
Nodes (7): canManageSupport(), getRoleBadgeClass(), PLATFORM_ROLES, PlatformRole, TENANT_ROLES, TenantRole, UserRole

### Community 117 - "menu-nlp-engine.ts"
Cohesion: 0.21
Nodes (15): INDIAN_CATEGORIES, INDIAN_DISH_CATALOG, IndianCategory, IndianDishEntry, OCR_TYPO_CORRECTIONS, calculateSimilarity(), detectIsVeg(), enrichRawExtractedItems() (+7 more)

### Community 119 - "README.md"
Cohesion: 0.18
Nodes (5): Data Retention Policy, Design Principles, DineFlow — Database Design, Entity Relationship Overview, Index Strategy Summary

### Community 120 - "next.config.ts"
Cohesion: 0.50
Nodes (3): nextConfig, securityHeaders, next

### Community 121 - "Phase 2 — Restaurant MVP"
Cohesion: 0.25
Nodes (8): 2A — Business Onboarding, 2B — Menu Management, 2C — QR Code System, 2D — Customer Ordering Experience, 2E — Order Management (Staff Dashboard), 2F — Kitchen Display System, 2G — Basic Analytics, Phase 2 — Restaurant MVP

### Community 123 - "scan/route.ts"
Cohesion: 0.33
Nodes (6): callGeminiVision(), GEMINI_MODELS, maxDuration, POST(), RawMenuItem, ScanMenuRequestBody

### Community 124 - "Problems Solved"
Cohesion: 0.25
Nodes (8): Problem 1 — Fragmented Software Stack, Problem 2 — High Cost of Entry, Problem 3 — App Download Friction, Problem 4 — WhatsApp Chaos, Problem 5 — No Real-time Kitchen Visibility, Problem 6 — Hotels Lack F&B Cohesion, Problem 7 — No Data for Decision Making, Problems Solved

### Community 125 - "search.go"
Cohesion: 0.25
Nodes (8): SearchHandler, NewSearchHandler(), go_pkg_github_com_dineflow_api_internal_application_search, SearchFilterOptions, SearchResponse, SearchResultItem, SearchResultsGrouped, Service

### Community 126 - "NewFirebaseTestProvider"
Cohesion: 0.33
Nodes (4): Config, redis.Client, NewFirebaseTestProvider(), FirebaseTestProvider

### Community 130 - "NewOTPProvider"
Cohesion: 0.29
Nodes (7): Config, redis.Client, NewMSG91Provider(), redis.Client, NewOTPProvider(), TestMSG91ProviderFallback(), Config

### Community 131 - "3. Non-Functional Requirements"
Cohesion: 0.29
Nodes (7): 3.1 Performance, 3.2 Scalability, 3.3 Reliability, 3.4 Security, 3.5 Accessibility, 3.6 Internationalisation, 3. Non-Functional Requirements

## Knowledge Gaps
- **700 isolated node(s):** `TestResult`, `github.com/dineflow/api`, `geminiRequest`, `geminiResponse`, `SendOTPRequest` (+695 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 843 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `useAuthStore`, `lucide-react`, `rooms/page.tsx`, `useToast`, `landing-workflow.tsx`, `spotlight-cursor.tsx`, `TubesCursor`, `staff/page.tsx`, `toast.tsx`, `label.tsx`, `[roomId]/page.tsx`, `web/package.json`, `notifications/page.tsx`, `app/layout.tsx`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `Client` connect `main` to `NewScope`, `go_pkg_time`, `go.mongodb.org/mongo-driver/v2/bson.ObjectID`, `whatsapp/whatsapp.go`, `Service`, `time.Time`, `tenant/tenant.go`, `testing.T`, `OK`, `Service`, `context.Context`, `Service`, `ai/service.go`, `Subscription`, `Order`, `Service`, `Service`, `search.go`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `Service` connect `whatsapp/whatsapp.go` to `main`, `NewScope`, `github.com/gin-gonic/gin.Context`, `server/main.go`, `time.Time`, `ai/service.go`, `Order`, `otp.go`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `TestResult`, `github.com/dineflow/api`, `geminiRequest` to the rest of the system?**
  _700 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `InternalError` be split into smaller, more focused modules?**
  _Cohesion score 0.11951219512195121 - nodes in this community are weakly interconnected._
- **Should `useToast` be split into smaller, more focused modules?**
  _Cohesion score 0.10052910052910052 - nodes in this community are weakly interconnected._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.07636363636363637 - nodes in this community are weakly interconnected._