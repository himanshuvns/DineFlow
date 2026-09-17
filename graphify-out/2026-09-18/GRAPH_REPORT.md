# Graph Report - DineFlow  (2026-09-17)

## Corpus Check
- 248 files · ~313,003 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .example 2, .toml 1)

## Summary
- 2088 nodes · 5550 edges · 118 communities (86 shown, 32 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `84b86aa0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- NormalizePhone
- gemini-logo-modal.tsx
- lucide-react
- tenant/tenant.go
- auth/service.go
- go_pkg_time
- server/main.go
- NewScope
- context.Context
- staff/page.tsx
- ai/service.go
- ref_next_server
- 2. Functional Requirements
- utils.ts
- go_pkg_go_mongodb_org_mongo_driver_v2_bson
- config.go
- useToast
- whatsapp/whatsapp.go
- go.mongodb.org/mongo-driver/v2/bson.ObjectID
- DineFlow — UI/UX Guidelines
- github.com/gin-gonic/gin.Context
- Subscription
- Order
- Maker
- web/package.json
- Scope
- whatsapp/service.go
- orders/page.tsx
- handlers/room.go
- dependencies
- compilerOptions
- app/layout.tsx
- tasks
- notifications/page.tsx
- components.json
- main
- package.json
- redisKey
- DineFlow — Development Plan
- react
- devDependencies
- scripts
- Phase 2 — Restaurant MVP
- MSG91Provider
- DineFlow — System Architecture
- README.md
- DineFlow — API Strategy
- eslint.config.mjs
- scripts
- web/vercel.json
- vercel.json
- peeking-chef.tsx
- Phase 1 — Foundation & Infrastructure
- postcss.config.mjs
- github.com/dineflow/api
- printer.go
- time.Time
- DineFlow — Subscription Model
- ui/pricing.tsx
- Problems Solved
- Collections
- Service
- Service
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
- Phase 2 — Restaurant MVP
- Client
- DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)
- Code Quality Standards
- generate-logo/route.ts
- DineFlow — Antigravity (`agy`) Workspace Rules
- menu-nlp-engine.ts
- Ponytail: Anti-Overengineering & YAGNI Guardrails
- Ponytail Technical Debt Analysis
- Ponytail Configuration & Status
- web/README.md
- handlers/menu.go
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
- scan/route.ts
- indian-food-database.ts
- tasks/route.ts
- extend-stay/route.ts
- search/service.go

## God Nodes (most connected - your core abstractions)
1. `GetTenantID()` - 109 edges
2. `OK()` - 109 edges
3. `BadRequest()` - 106 edges
4. `Unauthorized()` - 105 edges
5. `react` - 82 edges
6. `cn()` - 76 edges
7. `useToast()` - 71 edges
8. `lucide-react` - 62 edges
9. `NewScope()` - 59 edges
10. `InternalError()` - 51 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `SetHealthDeps()`  [EXTRACTED]
  apps/api/cmd/server/main.go → apps/api/internal/interfaces/http/handlers/health.go
- `UpdateOrderStatusRequest` --references--> `OrderStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/order.go → apps/api/internal/domain/order/order.go
- `TestIndianPhoneValidation()` --calls--> `ValidateAndNormalizeIndianPhone()`  [INFERRED]
  apps/api/internal/domain/room/room_test.go → apps/api/internal/domain/room/room.go
- `UpdateTableStatusRequest` --references--> `TableStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/table.go → apps/api/internal/domain/table/table.go
- `BulkCreateRoomsRequest` --references--> `LocationType`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/table.go → apps/api/internal/domain/table/table.go

## Import Cycles
- None detected.

## Communities (118 total, 32 thin omitted)

### Community 0 - "NormalizePhone"
Cohesion: 0.14
Nodes (14): Config, redis.Client, NewFirebaseTestProvider(), OTPProvider, redis.Client, NewOTPProvider(), NormalizePhone(), ParseTestNumbers() (+6 more)

### Community 1 - "gemini-logo-modal.tsx"
Cohesion: 0.25
Nodes (7): BUSINESS_CATEGORIES, COLORS, GeminiLogoModal(), GeminiLogoModalProps, GENERATION_STATUS_STEPS, LogoVariation, VIBES

### Community 2 - "lucide-react"
Cohesion: 0.10
Nodes (44): INITIAL_TENANTS, TenantRecord, DAYS, ForecastPage(), generateForecast(), getIntensityClass(), HOURS, INSIGHTS (+36 more)

### Community 3 - "tenant/tenant.go"
Cohesion: 0.26
Nodes (15): FeaturesForPlan(), BusinessType, Tenant, LimitsForPlan(), Address, Contact, DayHours, Features (+7 more)

### Community 4 - "auth/service.go"
Cohesion: 0.23
Nodes (10): generateSlug(), NewService(), ValidatePasswordComplexity(), AuthResponse, EmailSender, LoginRequest, RegisterRequest, SendOTPRequest (+2 more)

### Community 5 - "go_pkg_time"
Cohesion: 0.09
Nodes (30): NewService(), NewService(), NewService(), NewService(), ParseObjectID(), NewTenantHandler(), TestTokenMaker(), go_pkg_crypto_rand (+22 more)

### Community 6 - "server/main.go"
Cohesion: 0.05
Nodes (48): corsMiddleware(), NewAIHandler(), NewAnalyticsHandler(), NewAuthHandler(), Health(), SetHealthDeps(), Version(), NewStaffHandler() (+40 more)

### Community 7 - "NewScope"
Cohesion: 0.07
Nodes (16): NewScope(), buildMenuItemFromUpsertRequest(), Category, MenuItem, Service, NotificationEmitter, Service, AttendanceRecord (+8 more)

### Community 8 - "context.Context"
Cohesion: 0.13
Nodes (16): ValidateAndNormalizeIndianPhone(), context.Context, CreateTaskRequest, UpdateRoomStatusRequest, UpdateTaskRequest, Guest, GuestStatus, HousekeepingTask (+8 more)

### Community 9 - "staff/page.tsx"
Cohesion: 0.04
Nodes (62): LoginPage(), RegisterPage(), ResetPasswordPage(), getStayMetrics(), RoomsDirectoryPage(), getStayMetrics(), HousekeepingTask, RoomDetail (+54 more)

### Community 10 - "ai/service.go"
Cohesion: 0.13
Nodes (23): ChatbotMessage, ChatbotResponse, ChatTurn, ForecastDay, ForecastHour, ForecastResponse, geminiRequest, geminiResponse (+15 more)

### Community 11 - "ref_next_server"
Cohesion: 0.13
Nodes (7): dynamic, revalidate, dynamic, dynamic, revalidate, config, ref_next_server

### Community 12 - "2. Functional Requirements"
Cohesion: 0.06
Nodes (33): 1. User Personas, 2.10 Staff Management, 2.11 WhatsApp Integration, 2.12 Analytics & Reporting, 2.13 Settings & Configuration, 2.1 Authentication & Multi-Tenancy, 2.2 Subscription & Billing, 2.3 Onboarding (+25 more)

### Community 13 - "utils.ts"
Cohesion: 0.09
Nodes (34): MenuItem, RoomInfo, RoomServiceMenuPage(), SuiteTab, CustomerMenuPage(), CustomerCartDrawer(), CustomerCartDrawerProps, CustomerExtendStayModal() (+26 more)

### Community 14 - "go_pkg_go_mongodb_org_mongo_driver_v2_bson"
Cohesion: 0.07
Nodes (48): TestSearchScenarios(), NewService(), TestSearchAll_EmptyQuery(), TestSearchAll_ShortQuery(), NewService(), TestApplyLeave_Validation(), TestCreateHoliday_Validation(), TestCreateShift_Validation() (+40 more)

### Community 15 - "config.go"
Cohesion: 0.18
Nodes (16): getEnv(), getEnvInt(), Load(), requireEnv(), AIConfig, AppConfig, Config, EmailConfig (+8 more)

### Community 16 - "useToast"
Cohesion: 0.08
Nodes (49): PlatformAdminPage(), ForgotPasswordPage(), VerifyContent(), PricingAlertsPage(), UpsellPage(), AnalyticsPage(), IMAGE_PRESETS, MenuManagementPage() (+41 more)

### Community 17 - "whatsapp/whatsapp.go"
Cohesion: 0.08
Nodes (39): TestPhoneNumberNormalization(), BuildFeedbackRequestMessage(), BuildKitchenReadyMessage(), BuildOrderConfirmationMessage(), GetStandardTemplates(), NormalizePhoneNumber(), TestBuildOrderConfirmationMessage(), TestGetStandardTemplates() (+31 more)

### Community 18 - "go.mongodb.org/mongo-driver/v2/bson.ObjectID"
Cohesion: 0.14
Nodes (12): Service, cleanGuestName(), cleanOrderNumber(), cleanTableName(), go.mongodb.org/mongo-driver/v2/bson.ObjectID, CreateNotificationRequest, Category, CreateNotificationInput (+4 more)

### Community 19 - "DineFlow — UI/UX Guidelines"
Cohesion: 0.04
Nodes (44): 10. Responsive Breakpoints, 11. Iconography, 12. Empty States, 13. Toast / Notification System, 1. Design Philosophy, 2. Color Palette, 3. Typography, 4. Spacing System (+36 more)

### Community 20 - "github.com/gin-gonic/gin.Context"
Cohesion: 0.05
Nodes (43): AIHandler, AnalyticsHandler, clearRefreshTokenCookie(), AuthHandler, AuthHandler, setRefreshTokenCookie(), MenuHandler, NotificationHandler (+35 more)

### Community 21 - "Subscription"
Cohesion: 0.17
Nodes (12): FormatPlanName(), GetLimits(), AdminOverrideRequest, CheckoutRequest, BillingCycle, Invoice, PlanLimits, PlanTier (+4 more)

### Community 22 - "Order"
Cohesion: 0.20
Nodes (9): Order, DestinationType, OrderItem, OrderItemModifier, OrderSource, OrderStatus, OrderTimeline, PaymentStatus (+1 more)

### Community 23 - "Maker"
Cohesion: 0.29
Nodes (8): Maker, NewMaker(), go_pkg_github_com_golang_jwt_jwt_v5, go_pkg_github_com_google_uuid, time.Duration, jwt.RegisteredClaims, Claims, TokenType

### Community 24 - "web/package.json"
Cohesion: 0.10
Nodes (20): typescript, name, packageManager, private, version, axios, clsx, eslint (+12 more)

### Community 25 - "Scope"
Cohesion: 0.17
Nodes (9): ensureUpdatedAt(), go.mongodb.org/mongo-driver/v2/bson.M, go.mongodb.org/mongo-driver/v2/mongo.Collection, go.mongodb.org/mongo-driver/v2/mongo.Cursor, go.mongodb.org/mongo-driver/v2/mongo.DeleteResult, go.mongodb.org/mongo-driver/v2/mongo.InsertManyResult, go.mongodb.org/mongo-driver/v2/mongo.InsertOneResult, go.mongodb.org/mongo-driver/v2/mongo.UpdateResult (+1 more)

### Community 26 - "whatsapp/service.go"
Cohesion: 0.10
Nodes (22): NewWhatsAppHandler(), setupTestRouter(), TestDualModeWebhookRouter(), TestVerifyCheckInTokenHandler(), TestVerifyWebhookChallenge(), New(), go_pkg_bytes, go_pkg_crypto_hmac (+14 more)

### Community 27 - "orders/page.tsx"
Cohesion: 0.18
Nodes (10): INITIAL_KDS_ORDERS, KdsItem, KdsOrder, MENU_PRESETS, EmptyState(), EmptyStateAction, EmptyStateProps, TabOption (+2 more)

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
Cohesion: 0.10
Nodes (16): apps_web_app_globals, manrope, metadata, plusJakarta, spaceGrotesk, viewport, ResolvedTheme, Theme (+8 more)

### Community 32 - "tasks"
Cohesion: 0.11
Nodes (17): dependsOn, inputs, outputs, cache, cache, persistent, dependsOn, $schema (+9 more)

### Community 33 - "notifications/page.tsx"
Cohesion: 0.11
Nodes (23): CATEGORIES, CATEGORY_META, NotificationsPage(), PRIORITIES, PRIORITY_BADGE, timeAgo(), calculateDistanceMeters(), CheckInContent() (+15 more)

### Community 34 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 35 - "main"
Cohesion: 0.09
Nodes (24): CategoryShare, HourlyPoint, OverviewMetrics, TopItemMetric, main(), runStartupCleanup(), seedDefaultData(), NewService() (+16 more)

### Community 36 - "package.json"
Cohesion: 0.09
Nodes (21): description, devDependencies, prettier, turbo, typescript, engines, node, typescript (+13 more)

### Community 37 - "redisKey"
Cohesion: 0.29
Nodes (5): GenerateCode(), redis.Client, NewService(), redisKey(), Service

### Community 38 - "DineFlow — Development Plan"
Cohesion: 0.15
Nodes (13): Definition of Done, DineFlow — Development Plan, E2E Tests (Playwright), How to Read This Plan, Integration Tests, Performance Tests (k6), Phase 0 — Planning & Architecture, Phase 3 — Hotel Module (+5 more)

### Community 39 - "react"
Cohesion: 0.05
Nodes (62): DashboardLayout(), SettingsPage(), OrderStatus, TrackingOrder, TrackingOrderItem, COMPARISON_ROWS, PLANS, PlanTier (+54 more)

### Community 40 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti, @types/node, @types/react (+2 more)

### Community 41 - "scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, test, version

### Community 42 - "Phase 2 — Restaurant MVP"
Cohesion: 0.22
Nodes (9): 2.1 — Onboarding, 2.2 — Menu Management, 2.3 — Table & QR Code Management, 2.4 — Customer Ordering Experience, 2.5 — WebSocket / Real-Time, 2.6 — Order Management (Staff Dashboard), 2.7 — Kitchen Display System, 2.8 — Basic Analytics (+1 more)

### Community 43 - "MSG91Provider"
Cohesion: 0.29
Nodes (6): Config, redis.Client, NewMSG91Provider(), TestMSG91ProviderFallback(), net/http.Client, MSG91Provider

### Community 44 - "DineFlow — System Architecture"
Cohesion: 0.07
Nodes (27): Application Structure, Architecture Philosophy, Backend Architecture, Clean Architecture Dependency Flow, Customer Ordering Page — SSG + ISR, Database Architecture, Deployment Architecture, Deployment Pipeline (+19 more)

### Community 45 - "README.md"
Cohesion: 0.18
Nodes (5): Data Retention Policy, Design Principles, DineFlow — Database Design, Entity Relationship Overview, Index Strategy Summary

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

### Community 52 - "Phase 1 — Foundation & Infrastructure"
Cohesion: 0.25
Nodes (8): 1.1 — Monorepo Setup, 1.2 — Backend Foundation (Go), 1.3 — Authentication Service, 1.4 — Multi-Tenancy Middleware, 1.5 — Frontend Foundation (Next.js), 1.6 — File Storage, 1.7 — Email Service, Phase 1 — Foundation & Infrastructure

### Community 55 - "printer.go"
Cohesion: 0.26
Nodes (12): centerText(), GenerateBillText(), GenerateKOTText(), padRow(), TestGenerateBillText(), TestGenerateKOTText(), truncate(), BillData (+4 more)

### Community 56 - "time.Time"
Cohesion: 0.18
Nodes (19): cleanPhoneNumber(), DefaultPermissionsForRole(), PublicProfile, User, time.Time, UpdateStaffRequest, InviteStaffInput, UpdateEmployeeProfileInput (+11 more)

### Community 57 - "DineFlow — Subscription Model"
Cohesion: 0.07
Nodes (27): Billing Cycle Options, Billing Mechanics, DineFlow — Subscription Model, Downgrade Execution (Day 14), Enforcement Layers, Feature Flag System, 🆓 Free — "Just Getting Started", Future: Platform License (+19 more)

### Community 58 - "ui/pricing.tsx"
Cohesion: 0.15
Nodes (13): buttonVariants, Label, labelVariants, Pricing(), PricingPlan, PricingProps, Switch, useMediaQuery() (+5 more)

### Community 59 - "Problems Solved"
Cohesion: 0.25
Nodes (8): Problem 1 — Fragmented Software Stack, Problem 2 — High Cost of Entry, Problem 3 — App Download Friction, Problem 4 — WhatsApp Chaos, Problem 5 — No Real-time Kitchen Visibility, Problem 6 — Hotels Lack F&B Cohesion, Problem 7 — No Data for Decision Making, Problems Solved

### Community 60 - "Collections"
Cohesion: 0.13
Nodes (15): Collection: `audit_logs`, Collection: `categories`, Collection: `locations`, Collection: `menu_items`, Collection: `menus`, Collection: `modifier_groups`, Collection: `notifications`, Collection: `orders` (+7 more)

### Community 61 - "Service"
Cohesion: 0.31
Nodes (4): NewService(), Service, go_pkg_github_com_resend_resend_go_v2, resend.Client

### Community 62 - "Service"
Cohesion: 0.12
Nodes (9): IsOptOutKeyword(), ParseRating(), CustomerInvoice, MessageLog, MessageStatus, NotificationEmitter, Service, TemplateType (+1 more)

### Community 63 - "DineFlow — Feature Roadmap"
Cohesion: 0.15
Nodes (13): Cross-Phase Dependencies Map, Deliverables, Deliverables, DineFlow — Feature Roadmap, Overview, Phase 0 — Planning & Architecture, Phase 1 — Foundation & Infrastructure, Phase 3 — Hotel Module (+5 more)

### Community 64 - "DineFlow — Product Vision"
Cohesion: 0.15
Nodes (13): Business Metrics (12-Month Targets), Competitive Landscape, Customer Experience Metrics, DineFlow — Product Vision, Long-Term Vision (3–5 Years), Mission, Primary Segments, Product Metrics (+5 more)

### Community 65 - "github.com/gin-gonic/gin.HandlerFunc"
Cohesion: 0.50
Nodes (8): requestLogger(), ChefOrAbove(), OwnerOnly(), OwnerOrManager(), RequireAnyRole(), RequireRole(), WaiterOrAbove(), github.com/gin-gonic/gin.HandlerFunc

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

### Community 73 - "Phase 2 — Restaurant MVP"
Cohesion: 0.25
Nodes (8): 2A — Business Onboarding, 2B — Menu Management, 2C — QR Code System, 2D — Customer Ordering Experience, 2E — Order Management (Staff Dashboard), 2F — Kitchen Display System, 2G — Basic Analytics, Phase 2 — Restaurant MVP

### Community 74 - "Client"
Cohesion: 0.16
Nodes (4): Client, New(), go_pkg_go_uber_org_zap, RateLimitResult

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

### Community 80 - "menu-nlp-engine.ts"
Cohesion: 0.38
Nodes (10): calculateSimilarity(), detectIsVeg(), enrichRawExtractedItems(), extractPrice(), inferCategory(), matchCatalogDish(), NON_VEG_PATTERNS, normalizeDishText() (+2 more)

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
Cohesion: 0.18
Nodes (11): NewMenuHandler(), go_pkg_github_com_dineflow_api_internal_application_menu, BulkCreateItemsRequest, BulkDeleteItemsRequest, BulkUpdateItemsRequest, CreateCategoryRequest, ScanMenuRequest, ToggleStockRequest (+3 more)

### Community 88 - "Service"
Cohesion: 0.21
Nodes (5): CreateTableRequest, LocationType, Service, Table, TableStatus

### Community 118 - "scan/route.ts"
Cohesion: 0.33
Nodes (6): callGeminiVision(), GEMINI_MODELS, maxDuration, POST(), RawMenuItem, ScanMenuRequestBody

### Community 119 - "indian-food-database.ts"
Cohesion: 0.29
Nodes (5): INDIAN_CATEGORIES, INDIAN_DISH_CATALOG, IndianCategory, IndianDishEntry, OCR_TYPO_CORRECTIONS

### Community 125 - "search/service.go"
Cohesion: 0.26
Nodes (9): SearchHandler, NewSearchHandler(), go_pkg_github_com_dineflow_api_internal_application_search, go_pkg_regexp, SearchFilterOptions, SearchResponse, SearchResultItem, SearchResultsGrouped (+1 more)

## Knowledge Gaps
- **641 isolated node(s):** `github.com/dineflow/api`, `geminiRequest`, `geminiResponse`, `SendOTPRequest`, `ClockInRequest` (+636 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 769 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `notifications/page.tsx`, `lucide-react`, `gemini-logo-modal.tsx`, `TubesCursor`, `staff/page.tsx`, `utils.ts`, `useToast`, `peeking-chef.tsx`, `web/package.json`, `ui/pricing.tsx`, `orders/page.tsx`, `app/layout.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `Service` connect `Service` to `main`, `NewScope`, `MSG91Provider`, `go_pkg_go_mongodb_org_mongo_driver_v2_bson`, `github.com/gin-gonic/gin.Context`, `whatsapp/service.go`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `RoomHandler` connect `github.com/gin-gonic/gin.Context` to `context.Context`, `go.mongodb.org/mongo-driver/v2/bson.ObjectID`, `handlers/room.go`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `github.com/dineflow/api`, `geminiRequest`, `geminiResponse` to the rest of the system?**
  _641 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `NormalizePhone` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.09761295822676896 - nodes in this community are weakly interconnected._
- **Should `go_pkg_time` be split into smaller, more focused modules?**
  _Cohesion score 0.0859465737514518 - nodes in this community are weakly interconnected._