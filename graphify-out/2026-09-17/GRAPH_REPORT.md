# Graph Report - DineFlow  (2026-09-17)

## Corpus Check
- 240 files · ~276,709 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .example 2, .toml 1)

## Summary
- 1872 nodes · 4695 edges · 122 communities (87 shown, 35 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e92b686b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- github.com/gin-gonic/gin.Context
- react
- lucide-react
- tenant/tenant.go
- Hub
- go_pkg_time
- server/main.go
- go.mongodb.org/mongo-driver/v2/bson.ObjectID
- context.Context
- DineFlow — Questions, Assumptions & Risks
- ai/service.go
- ref_next_server
- Client
- utils.ts
- go_pkg_go_mongodb_org_mongo_driver_v2_bson
- config.go
- menu/page.tsx
- main
- Service
- DineFlow — UI/UX Guidelines
- 2. Functional Requirements
- Subscription
- Order
- useAuthStore
- web/package.json
- Scope
- go_pkg_fmt
- auth/service.go
- storage/storage.go
- dependencies
- compilerOptions
- app/layout.tsx
- tasks
- useToast
- components.json
- whatsapp/whatsapp.go
- package.json
- notification-center.tsx
- DineFlow — Development Plan
- Table
- devDependencies
- scripts
- Service
- github.com/gin-gonic/gin.HandlerFunc
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
- User
- DineFlow — Subscription Model
- ui/pricing.tsx
- otp.go
- Collections
- Service
- Service
- DineFlow — Feature Roadmap
- DineFlow — Product Vision
- README.md
- DineFlow
- Audit Scope & Checklist
- Responsive Verification Checklist
- Security Checklist
- NormalizePhone
- Architectural Assessment Dimensions
- Review Pillars
- Phase 2 — Restaurant MVP
- Problems Solved
- DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)
- Code Quality Standards
- generate-logo/route.ts
- DineFlow — Antigravity (`agy`) Workspace Rules
- Section 7 — Feature-Specific Risks
- menu-nlp-engine.ts
- theme-provider.tsx
- Ponytail: Anti-Overengineering & YAGNI Guardrails
- Ponytail Technical Debt Analysis
- Ponytail Configuration & Status
- web/README.md
- MenuItem
- Section 1 — Architecture Decisions
- Section 3 — Subscription & Billing
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
- Section 5 — Operations & Infrastructure
- Section 6 — Security & Compliance
- MSG91Provider
- scan/route.ts
- indian-food-database.ts
- tasks/route.ts
- extend-stay/route.ts

## God Nodes (most connected - your core abstractions)
1. `OK()` - 79 edges
2. `react` - 78 edges
3. `GetTenantID()` - 77 edges
4. `BadRequest()` - 77 edges
5. `Unauthorized()` - 74 edges
6. `useToast()` - 71 edges
7. `cn()` - 70 edges
8. `lucide-react` - 57 edges
9. `main()` - 43 edges
10. `NewScope()` - 39 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `SetHealthDeps()`  [EXTRACTED]
  apps/api/cmd/server/main.go → apps/api/internal/interfaces/http/handlers/health.go
- `UpdateOrderStatusRequest` --references--> `OrderStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/order.go → apps/api/internal/domain/order/order.go
- `TestGenerateKOTText()` --calls--> `GenerateKOTText()`  [INFERRED]
  apps/api/internal/domain/printer/printer_test.go → apps/api/internal/domain/printer/printer.go
- `TestGenerateBillText()` --calls--> `GenerateBillText()`  [INFERRED]
  apps/api/internal/domain/printer/printer_test.go → apps/api/internal/domain/printer/printer.go
- `UpdateTaskRequest` --references--> `TaskStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/room.go → apps/api/internal/domain/room/room.go

## Import Cycles
- None detected.

## Communities (122 total, 35 thin omitted)

### Community 0 - "github.com/gin-gonic/gin.Context"
Cohesion: 0.06
Nodes (44): AIHandler, AnalyticsHandler, clearRefreshTokenCookie(), AuthHandler, AuthHandler, setRefreshTokenCookie(), MenuHandler, NotificationHandler (+36 more)

### Community 1 - "react"
Cohesion: 0.05
Nodes (52): DashboardErrorProps, SettingsPage(), BUSINESS_CATEGORIES, BusinessCategory, BusinessCategorySelector(), BusinessCategorySelectorProps, ChefMascot(), ChefMascotProps (+44 more)

### Community 2 - "lucide-react"
Cohesion: 0.12
Nodes (42): INITIAL_TENANTS, TenantRecord, DAYS, ForecastPage(), generateForecast(), getIntensityClass(), HOURS, INSIGHTS (+34 more)

### Community 3 - "tenant/tenant.go"
Cohesion: 0.26
Nodes (15): FeaturesForPlan(), BusinessType, Tenant, LimitsForPlan(), Address, Contact, DayHours, Features (+7 more)

### Community 4 - "Hub"
Cohesion: 0.13
Nodes (13): NewService(), NewService(), GetHub(), Hub, NewOrderHandler(), go_pkg_encoding_json, go_pkg_sync, sync.RWMutex (+5 more)

### Community 5 - "go_pkg_time"
Cohesion: 0.08
Nodes (36): NewService(), NewService(), NewService(), NewService(), TestGenerateKOTText(), ParseObjectID(), NewAuthHandler(), NewTenantHandler() (+28 more)

### Community 6 - "server/main.go"
Cohesion: 0.05
Nodes (50): NewAIHandler(), NewAnalyticsHandler(), Health(), SetHealthDeps(), Version(), NewMenuHandler(), NewNotificationHandler(), NewStaffHandler() (+42 more)

### Community 7 - "go.mongodb.org/mongo-driver/v2/bson.ObjectID"
Cohesion: 0.14
Nodes (8): NewScope(), go.mongodb.org/mongo-driver/v2/bson.ObjectID, go.mongodb.org/mongo-driver/v2/mongo.Collection, Category, Service, Service, Invoice, Service

### Community 8 - "context.Context"
Cohesion: 0.13
Nodes (17): ValidateAndNormalizeIndianPhone(), context.Context, time.Time, CreateTaskRequest, UpdateRoomStatusRequest, CheckInInput, Guest, GuestStatus (+9 more)

### Community 9 - "DineFlow — Questions, Assumptions & Risks"
Cohesion: 0.12
Nodes (16): DineFlow — Questions, Assumptions & Risks, P1. What counts as a "table" for food trucks?, P2. Customer phone number at checkout, P3. Can a customer order multiple rounds from the same table?, P4. Online payment model, P5. Unavailable item display, P6. What is the order cancellation policy?, P7. Split billing (+8 more)

### Community 10 - "ai/service.go"
Cohesion: 0.13
Nodes (24): ChatbotMessage, ChatbotResponse, ChatTurn, ForecastDay, ForecastHour, ForecastResponse, geminiRequest, geminiResponse (+16 more)

### Community 11 - "ref_next_server"
Cohesion: 0.13
Nodes (7): dynamic, revalidate, dynamic, dynamic, revalidate, config, ref_next_server

### Community 12 - "Client"
Cohesion: 0.16
Nodes (4): Client, New(), go_pkg_github_com_redis_go_redis_v9, RateLimitResult

### Community 13 - "utils.ts"
Cohesion: 0.09
Nodes (35): getStayMetrics(), RoomsDirectoryPage(), getStayMetrics(), HousekeepingTask, RoomDetail, RoomDetailPage(), RoomOrder, OrderStatus (+27 more)

### Community 14 - "go_pkg_go_mongodb_org_mongo_driver_v2_bson"
Cohesion: 0.09
Nodes (30): CategoryShare, HourlyPoint, OverviewMetrics, TopItemMetric, NewService(), TestSearchScenarios(), NewService(), TestSearchAll_EmptyQuery() (+22 more)

### Community 15 - "config.go"
Cohesion: 0.12
Nodes (23): getEnv(), getEnvInt(), Load(), requireEnv(), Maker, NewMaker(), AIConfig, AppConfig (+15 more)

### Community 16 - "menu/page.tsx"
Cohesion: 0.14
Nodes (29): IMAGE_PRESETS, MenuManagementPage(), CameraMenuScannerModal(), CameraMenuScannerModalProps, CapturedPage, MenuBulkToolbar(), MenuBulkToolbarProps, MenuStagingPreviewModal() (+21 more)

### Community 17 - "main"
Cohesion: 0.13
Nodes (18): main(), requestLogger(), runStartupCleanup(), seedDefaultData(), NewService(), New(), SearchHandler, NewSearchHandler() (+10 more)

### Community 18 - "Service"
Cohesion: 0.13
Nodes (11): cleanGuestName(), cleanOrderNumber(), cleanTableName(), NewService(), CreateNotificationRequest, Category, CreateNotificationInput, ListFilter (+3 more)

### Community 19 - "DineFlow — UI/UX Guidelines"
Cohesion: 0.04
Nodes (44): 10. Responsive Breakpoints, 11. Iconography, 12. Empty States, 13. Toast / Notification System, 1. Design Philosophy, 2. Color Palette, 3. Typography, 4. Spacing System (+36 more)

### Community 20 - "2. Functional Requirements"
Cohesion: 0.06
Nodes (33): 1. User Personas, 2.10 Staff Management, 2.11 WhatsApp Integration, 2.12 Analytics & Reporting, 2.13 Settings & Configuration, 2.1 Authentication & Multi-Tenancy, 2.2 Subscription & Billing, 2.3 Onboarding (+25 more)

### Community 21 - "Subscription"
Cohesion: 0.19
Nodes (11): FormatPlanName(), GetLimits(), AdminOverrideRequest, CheckoutRequest, BillingCycle, PlanLimits, PlanTier, Service (+3 more)

### Community 22 - "Order"
Cohesion: 0.17
Nodes (11): Order, DestinationType, notifServiceIface, OrderItem, OrderItemModifier, OrderSource, OrderStatus, OrderTimeline (+3 more)

### Community 23 - "useAuthStore"
Cohesion: 0.09
Nodes (31): DashboardLayout(), CATEGORY_CONFIG, FILTER_CHIPS, QUICK_ACTIONS, QuickActionItem, RecentSearchItem, SearchResultItem, SearchResultsGrouped (+23 more)

### Community 24 - "web/package.json"
Cohesion: 0.08
Nodes (23): typescript, name, packageManager, private, version, axios, clsx, eslint (+15 more)

### Community 25 - "Scope"
Cohesion: 0.21
Nodes (8): ensureUpdatedAt(), go.mongodb.org/mongo-driver/v2/bson.M, go.mongodb.org/mongo-driver/v2/mongo.Cursor, go.mongodb.org/mongo-driver/v2/mongo.DeleteResult, go.mongodb.org/mongo-driver/v2/mongo.InsertManyResult, go.mongodb.org/mongo-driver/v2/mongo.InsertOneResult, go.mongodb.org/mongo-driver/v2/mongo.UpdateResult, Scope

### Community 26 - "go_pkg_fmt"
Cohesion: 0.10
Nodes (17): NewRoomHandler(), ByIP(), ByIPAndRoute(), go_pkg_bytes, go_pkg_encoding_base64, go_pkg_fmt, go_pkg_github_com_dineflow_api_internal_application_room, go_pkg_github_com_joho_godotenv (+9 more)

### Community 27 - "auth/service.go"
Cohesion: 0.23
Nodes (9): generateSlug(), NewService(), AuthResponse, EmailSender, LoginRequest, RegisterRequest, SendOTPRequest, Service (+1 more)

### Community 28 - "storage/storage.go"
Cohesion: 0.16
Nodes (13): StorageService, NewService(), TestStorageValidation(), StorageHandler, NewStorageHandler(), go_pkg_crypto_sha256, go_pkg_encoding_hex, go_pkg_github_com_dineflow_api_internal_infrastructure_storage (+5 more)

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
Cohesion: 0.06
Nodes (35): PlatformAdminPage(), ForgotPasswordPage(), LoginPage(), RegisterPage(), ResetPasswordPage(), VerifyContent(), getDescription(), MenuWriterPage() (+27 more)

### Community 34 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 35 - "whatsapp/whatsapp.go"
Cohesion: 0.12
Nodes (15): BuildFeedbackRequestMessage(), BuildKitchenReadyMessage(), BuildOrderConfirmationMessage(), IsOptOutKeyword(), ParseRating(), TestBuildOrderConfirmationMessage(), TestIsOptOutKeyword(), TestParseRating() (+7 more)

### Community 36 - "package.json"
Cohesion: 0.09
Nodes (21): description, devDependencies, prettier, turbo, typescript, engines, node, typescript (+13 more)

### Community 37 - "notification-center.tsx"
Cohesion: 0.15
Nodes (20): CATEGORIES, CATEGORY_META, NotificationsPage(), PRIORITIES, PRIORITY_BADGE, timeAgo(), CATEGORIES, CATEGORY_META (+12 more)

### Community 38 - "DineFlow — Development Plan"
Cohesion: 0.07
Nodes (30): 1.1 — Monorepo Setup, 1.2 — Backend Foundation (Go), 1.3 — Authentication Service, 1.4 — Multi-Tenancy Middleware, 1.5 — Frontend Foundation (Next.js), 1.6 — File Storage, 1.7 — Email Service, 2.1 — Onboarding (+22 more)

### Community 39 - "Table"
Cohesion: 0.36
Nodes (4): CreateTableRequest, LocationType, Table, TableStatus

### Community 40 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti, @types/node, @types/react (+2 more)

### Community 41 - "scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, test, version

### Community 42 - "Service"
Cohesion: 0.31
Nodes (4): NewService(), Service, go_pkg_github_com_resend_resend_go_v2, resend.Client

### Community 43 - "github.com/gin-gonic/gin.HandlerFunc"
Cohesion: 0.50
Nodes (8): corsMiddleware(), ChefOrAbove(), OwnerOnly(), OwnerOrManager(), RequireAnyRole(), RequireRole(), WaiterOrAbove(), github.com/gin-gonic/gin.HandlerFunc

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
Cohesion: 0.36
Nodes (10): centerText(), GenerateBillText(), GenerateKOTText(), padRow(), truncate(), BillData, BillItem, KOTData (+2 more)

### Community 56 - "User"
Cohesion: 0.32
Nodes (10): DefaultPermissionsForRole(), PublicProfile, User, UpdateStaffRequest, Auth, NotificationPrefs, Permissions, RefreshToken (+2 more)

### Community 57 - "DineFlow — Subscription Model"
Cohesion: 0.07
Nodes (27): Billing Cycle Options, Billing Mechanics, DineFlow — Subscription Model, Downgrade Execution (Day 14), Enforcement Layers, Feature Flag System, 🆓 Free — "Just Getting Started", Future: Platform License (+19 more)

### Community 58 - "ui/pricing.tsx"
Cohesion: 0.14
Nodes (14): COMPARISON_ROWS, PLANS, PlanTier, PricingPage(), buttonVariants, Label, labelVariants, Pricing() (+6 more)

### Community 59 - "otp.go"
Cohesion: 0.24
Nodes (7): GenerateCode(), redis.Client, NewService(), redisKey(), go_pkg_crypto_rand, go_pkg_math_big, Service

### Community 60 - "Collections"
Cohesion: 0.13
Nodes (15): Collection: `audit_logs`, Collection: `categories`, Collection: `locations`, Collection: `menu_items`, Collection: `menus`, Collection: `modifier_groups`, Collection: `notifications`, Collection: `orders` (+7 more)

### Community 63 - "DineFlow — Feature Roadmap"
Cohesion: 0.15
Nodes (13): Cross-Phase Dependencies Map, Deliverables, Deliverables, DineFlow — Feature Roadmap, Overview, Phase 0 — Planning & Architecture, Phase 1 — Foundation & Infrastructure, Phase 3 — Hotel Module (+5 more)

### Community 64 - "DineFlow — Product Vision"
Cohesion: 0.15
Nodes (13): Business Metrics (12-Month Targets), Competitive Landscape, Customer Experience Metrics, DineFlow — Product Vision, Long-Term Vision (3–5 Years), Mission, Primary Segments, Product Metrics (+5 more)

### Community 65 - "README.md"
Cohesion: 0.17
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

### Community 70 - "NormalizePhone"
Cohesion: 0.15
Nodes (13): Config, redis.Client, NewFirebaseTestProvider(), OTPProvider, redis.Client, NewOTPProvider(), NormalizePhone(), ParseTestNumbers() (+5 more)

### Community 71 - "Architectural Assessment Dimensions"
Cohesion: 0.25
Nodes (7): 1. Monorepo & Service Boundaries, 2. Database Design & Indexing, 3. Caching & State Distribution, 4. Reliability & High Availability, 5. Observability & Tracing, Architectural Assessment Dimensions, System Architecture & Scalability Review

### Community 72 - "Review Pillars"
Cohesion: 0.25
Nodes (7): 1. Tenant Provisioning & Lifecycle, 2. Subscription Tiers & Feature Gates, 3. Data Partitioning & Soft Delete, 4. Financial & Payment Idempotency, 5. Multi-Tenant Event & Notification Architecture, Multi-Tenant SaaS Architecture & Business Review, Review Pillars

### Community 73 - "Phase 2 — Restaurant MVP"
Cohesion: 0.25
Nodes (8): 2A — Business Onboarding, 2B — Menu Management, 2C — QR Code System, 2D — Customer Ordering Experience, 2E — Order Management (Staff Dashboard), 2F — Kitchen Display System, 2G — Basic Analytics, Phase 2 — Restaurant MVP

### Community 74 - "Problems Solved"
Cohesion: 0.25
Nodes (8): Problem 1 — Fragmented Software Stack, Problem 2 — High Cost of Entry, Problem 3 — App Download Friction, Problem 4 — WhatsApp Chaos, Problem 5 — No Real-time Kitchen Visibility, Problem 6 — Hotels Lack F&B Cohesion, Problem 7 — No Data for Decision Making, Problems Solved

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

### Community 79 - "Section 7 — Feature-Specific Risks"
Cohesion: 0.25
Nodes (8): R1. WhatsApp Template Approval Delays, R2. Razorpay Subscription Webhook Reliability, R3. Customer QR Page Load on Poor Network, R4. KDS Data Accuracy During API Downtime, R5. Multi-Tenant Data Breach (Tenant Isolation Failure), R6. WhatsApp Message Costs Exceeding Revenue, R7. Competitor Response, Section 7 — Feature-Specific Risks

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

### Community 86 - "MenuItem"
Cohesion: 0.36
Nodes (8): buildMenuItemFromUpsertRequest(), BulkCreateItemsRequest, UpsertItemRequest, DietaryTag, MenuItem, ModifierGroup, ModifierOption, Variant

### Community 87 - "Section 1 — Architecture Decisions"
Cohesion: 0.33
Nodes (6): A1. Backend Language: Go vs. Node.js, A2. Monorepo Tool: Turborepo vs. Nx, A3. Database: MongoDB Only vs. MongoDB + PostgreSQL, A4. Frontend Framework: Next.js App Router vs. Pages Router, A5. WebSocket: Socket.io vs. Native WebSocket, Section 1 — Architecture Decisions

### Community 88 - "Section 3 — Subscription & Billing"
Cohesion: 0.33
Nodes (6): B1. Free trial for new registrations, B2. How is proration handled on mid-cycle upgrades?, B3. Can a single tenant have multiple subscriptions (e.g., base plan + white-label add-on)?, B4. What currency should the Free plan's invoice show?, B5. Are there usage-based charges beyond the flat subscription?, Section 3 — Subscription & Billing

### Community 115 - "Section 5 — Operations & Infrastructure"
Cohesion: 0.40
Nodes (5): O1. Deployment platform, O2. Primary deployment region?, O3. How will we handle database migrations?, O4. How do we handle a tenant with 10,000 menu items or orders?, Section 5 — Operations & Infrastructure

### Community 116 - "Section 6 — Security & Compliance"
Cohesion: 0.40
Nodes (5): S1. Is PCI-DSS compliance required in Phase 1?, S2. GDPR compliance — are EU customers expected in Phase 1?, S3. What data does DineFlow retain about end customers (guests)?, S4. Admin access to tenant data, Section 6 — Security & Compliance

### Community 117 - "MSG91Provider"
Cohesion: 0.29
Nodes (6): Config, redis.Client, NewMSG91Provider(), TestMSG91ProviderFallback(), net/http.Client, MSG91Provider

### Community 118 - "scan/route.ts"
Cohesion: 0.33
Nodes (6): callGeminiVision(), GEMINI_MODELS, maxDuration, POST(), RawMenuItem, ScanMenuRequestBody

### Community 119 - "indian-food-database.ts"
Cohesion: 0.29
Nodes (5): INDIAN_CATEGORIES, INDIAN_DISH_CATALOG, IndianCategory, IndianDishEntry, OCR_TYPO_CORRECTIONS

## Knowledge Gaps
- **609 isolated node(s):** `github.com/dineflow/api`, `geminiRequest`, `geminiResponse`, `SendOTPRequest`, `MessageType` (+604 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 734 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `useToast`, `lucide-react`, `notification-center.tsx`, `TubesCursor`, `utils.ts`, `menu/page.tsx`, `theme-provider.tsx`, `peeking-chef.tsx`, `useAuthStore`, `web/package.json`, `ui/pricing.tsx`, `app/layout.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `Client` connect `main` to `github.com/gin-gonic/gin.Context`, `Hub`, `go_pkg_time`, `go.mongodb.org/mongo-driver/v2/bson.ObjectID`, `context.Context`, `ai/service.go`, `go_pkg_go_mongodb_org_mongo_driver_v2_bson`, `Service`, `Subscription`, `Order`, `auth/service.go`, `Service`, `Service`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `main()` connect `main` to `github.com/gin-gonic/gin.Context`, `Hub`, `go_pkg_time`, `server/main.go`, `NormalizePhone`, `ai/service.go`, `github.com/gin-gonic/gin.HandlerFunc`, `Service`, `Client`, `go_pkg_go_mongodb_org_mongo_driver_v2_bson`, `config.go`, `Service`, `go_pkg_fmt`, `auth/service.go`, `storage/storage.go`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `github.com/dineflow/api`, `geminiRequest`, `geminiResponse` to the rest of the system?**
  _609 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `github.com/gin-gonic/gin.Context` be split into smaller, more focused modules?**
  _Cohesion score 0.057539149888143175 - nodes in this community are weakly interconnected._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.04660493827160494 - nodes in this community are weakly interconnected._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.11668928086838534 - nodes in this community are weakly interconnected._