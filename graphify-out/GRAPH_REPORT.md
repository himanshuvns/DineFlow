# Graph Report - DineFlow  (2026-09-17)

## Corpus Check
- 240 files · ~284,462 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .example 2, .toml 1)

## Summary
- 1934 nodes · 4931 edges · 126 communities (93 shown, 33 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 33 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `09717ae2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- github.com/gin-gonic/gin.Context
- react
- lucide-react
- tenant/tenant.go
- whatsapp/whatsapp.go
- go_pkg_time
- server/main.go
- go.mongodb.org/mongo-driver/v2/bson.ObjectID
- time.Time
- DineFlow — Questions, Assumptions & Risks
- Service
- ref_next_server
- 2. Functional Requirements
- utils.ts
- testing.T
- config.go
- menu/page.tsx
- main
- context.Context
- DineFlow — UI/UX Guidelines
- 3. Non-Functional Requirements
- subscription/service.go
- Order
- useAuthStore
- web/package.json
- Scope
- go_pkg_fmt
- Service
- storage/storage.go
- dependencies
- compilerOptions
- app/layout.tsx
- tasks
- useToast
- components.json
- whatsapp_test.go
- package.json
- notification-center.tsx
- DineFlow — Development Plan
- handlers/table.go
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
- handlers/room.go
- README.md
- Audit Scope & Checklist
- Responsive Verification Checklist
- Security Checklist
- NewFirebaseTestProvider
- Architectural Assessment Dimensions
- Review Pillars
- Phase 2 — Restaurant MVP
- Phase 2 — Restaurant MVP
- DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)
- Code Quality Standards
- generate-logo/route.ts
- DineFlow — Antigravity (`agy`) Workspace Rules
- Phase 1 — Foundation & Infrastructure
- menu-nlp-engine.ts
- [orderId]/page.tsx
- Ponytail: Anti-Overengineering & YAGNI Guardrails
- Ponytail Technical Debt Analysis
- Ponytail Configuration & Status
- web/README.md
- handlers/menu.go
- Notification
- 1. User Personas
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
- Grace Period & Downgrade Automation
- MSG91Provider
- scan/route.ts
- indian-food-database.ts
- tasks/route.ts
- extend-stay/route.ts
- GetStandardTemplates
- otp_test.go
- Feature Flag System
- Service

## God Nodes (most connected - your core abstractions)
1. `OK()` - 90 edges
2. `GetTenantID()` - 88 edges
3. `Unauthorized()` - 84 edges
4. `BadRequest()` - 83 edges
5. `react` - 78 edges
6. `useToast()` - 71 edges
7. `cn()` - 70 edges
8. `lucide-react` - 57 edges
9. `main()` - 43 edges
10. `InternalError()` - 43 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `seedDefaultData()`  [INFERRED]
  apps/api/cmd/server/main.go → apps/api/cmd/server/seed.go
- `main()` --calls--> `SetHealthDeps()`  [EXTRACTED]
  apps/api/cmd/server/main.go → apps/api/internal/interfaces/http/handlers/health.go
- `UpdateOrderStatusRequest` --references--> `OrderStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/order.go → apps/api/internal/domain/order/order.go
- `UpdateRoomStatusRequest` --references--> `RoomStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/room.go → apps/api/internal/domain/room/room.go
- `UpdateTaskRequest` --references--> `TaskStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/room.go → apps/api/internal/domain/room/room.go

## Import Cycles
- None detected.

## Communities (126 total, 33 thin omitted)

### Community 0 - "github.com/gin-gonic/gin.Context"
Cohesion: 0.05
Nodes (44): AIHandler, AnalyticsHandler, clearRefreshTokenCookie(), AuthHandler, AuthHandler, setRefreshTokenCookie(), MenuHandler, NotificationHandler (+36 more)

### Community 1 - "react"
Cohesion: 0.05
Nodes (50): BUSINESS_CATEGORIES, BusinessCategory, BusinessCategorySelector(), BusinessCategorySelectorProps, ChefMascot(), ChefMascotProps, CTAButton, CTAButtonProps (+42 more)

### Community 2 - "lucide-react"
Cohesion: 0.09
Nodes (52): INITIAL_TENANTS, TenantRecord, DAYS, HOURS, INSIGHTS, MOCK_DESCRIPTIONS, SAMPLE_ITEMS, TONES (+44 more)

### Community 3 - "tenant/tenant.go"
Cohesion: 0.20
Nodes (18): seedDefaultData(), generateSlug(), FeaturesForPlan(), BusinessType, Tenant, LimitsForPlan(), RegisterRequest, Address (+10 more)

### Community 4 - "whatsapp/whatsapp.go"
Cohesion: 0.15
Nodes (21): BuildFeedbackRequestMessage(), BuildKitchenReadyMessage(), Campaign, CampaignStats, CampaignStatus, CampaignType, ChatbotSession, ChatbotState (+13 more)

### Community 5 - "go_pkg_time"
Cohesion: 0.13
Nodes (31): ParseObjectID(), SendOTPRequest, go_pkg_context, go_pkg_errors, go_pkg_github_com_dineflow_api_internal_domain_menu, go_pkg_github_com_dineflow_api_internal_domain_order, go_pkg_github_com_dineflow_api_internal_domain_table, go_pkg_github_com_dineflow_api_internal_domain_tenant (+23 more)

### Community 6 - "server/main.go"
Cohesion: 0.09
Nodes (31): Health(), SetHealthDeps(), Version(), ByIP(), ByIPAndRoute(), go_pkg_github_com_dineflow_api_internal_application_ai, go_pkg_github_com_dineflow_api_internal_application_analytics, go_pkg_github_com_dineflow_api_internal_application_auth (+23 more)

### Community 7 - "go.mongodb.org/mongo-driver/v2/bson.ObjectID"
Cohesion: 0.12
Nodes (12): NewScope(), buildMenuItemFromUpsertRequest(), go.mongodb.org/mongo-driver/v2/bson.ObjectID, Category, MenuItem, PublicCategorySection, PublicMenuResponse, Service (+4 more)

### Community 8 - "time.Time"
Cohesion: 0.12
Nodes (13): ValidateAndNormalizeIndianPhone(), time.Time, RateLimitResult, CheckInInput, Guest, HousekeepingTask, Room, RoomStatus (+5 more)

### Community 9 - "DineFlow — Questions, Assumptions & Risks"
Cohesion: 0.04
Nodes (46): A1. Backend Language: Go vs. Node.js, A2. Monorepo Tool: Turborepo vs. Nx, A3. Database: MongoDB Only vs. MongoDB + PostgreSQL, A4. Frontend Framework: Next.js App Router vs. Pages Router, A5. WebSocket: Socket.io vs. Native WebSocket, B1. Free trial for new registrations, B2. How is proration handled on mid-cycle upgrades?, B3. Can a single tenant have multiple subscriptions (e.g., base plan + white-label add-on)? (+38 more)

### Community 10 - "Service"
Cohesion: 0.13
Nodes (23): ChatbotMessage, ChatbotResponse, ChatTurn, ForecastDay, ForecastHour, ForecastResponse, MenuDescriptionRequest, MenuDescriptionResponse (+15 more)

### Community 11 - "ref_next_server"
Cohesion: 0.13
Nodes (7): dynamic, revalidate, dynamic, dynamic, revalidate, config, ref_next_server

### Community 12 - "2. Functional Requirements"
Cohesion: 0.14
Nodes (14): 2.10 Staff Management, 2.11 WhatsApp Integration, 2.12 Analytics & Reporting, 2.13 Settings & Configuration, 2.1 Authentication & Multi-Tenancy, 2.2 Subscription & Billing, 2.3 Onboarding, 2.4 Menu Management (+6 more)

### Community 13 - "utils.ts"
Cohesion: 0.12
Nodes (28): getStayMetrics(), RoomsDirectoryPage(), getStayMetrics(), HousekeepingTask, RoomDetail, RoomDetailPage(), RoomOrder, MenuItem (+20 more)

### Community 14 - "testing.T"
Cohesion: 0.13
Nodes (19): TestCategoryValidation(), TestMenuItemValidation(), TestOrderCalculations(), TestOrderStatusTransitions(), TestGuestValidation(), TestHousekeepingTaskValidation(), TestIndianPhoneValidation(), TestRoomValidation() (+11 more)

### Community 15 - "config.go"
Cohesion: 0.11
Nodes (25): getEnv(), getEnvInt(), Load(), requireEnv(), Maker, NewMaker(), AIConfig, AppConfig (+17 more)

### Community 16 - "menu/page.tsx"
Cohesion: 0.13
Nodes (32): IMAGE_PRESETS, MenuManagementPage(), CameraMenuScannerModal(), CameraMenuScannerModalProps, CapturedPage, MenuBulkToolbar(), MenuBulkToolbarProps, MenuStagingPreviewModal() (+24 more)

### Community 17 - "main"
Cohesion: 0.09
Nodes (26): corsMiddleware(), main(), requestLogger(), runStartupCleanup(), NewService(), NewService(), NewService(), NewService() (+18 more)

### Community 18 - "context.Context"
Cohesion: 0.11
Nodes (10): cleanGuestName(), cleanOrderNumber(), cleanTableName(), Client, New(), NewRoomHandler(), context.Context, go.mongodb.org/mongo-driver/v2/mongo.Collection (+2 more)

### Community 19 - "DineFlow — UI/UX Guidelines"
Cohesion: 0.04
Nodes (44): 10. Responsive Breakpoints, 11. Iconography, 12. Empty States, 13. Toast / Notification System, 1. Design Philosophy, 2. Color Palette, 3. Typography, 4. Spacing System (+36 more)

### Community 20 - "3. Non-Functional Requirements"
Cohesion: 0.14
Nodes (13): 3.1 Performance, 3.2 Scalability, 3.3 Reliability, 3.4 Security, 3.5 Accessibility, 3.6 Internationalisation, 3. Non-Functional Requirements, 4. User Journeys (+5 more)

### Community 21 - "subscription/service.go"
Cohesion: 0.13
Nodes (17): NewService(), FormatPlanName(), GetLimits(), NewSubscriptionHandler(), go_pkg_github_com_dineflow_api_internal_application_subscription, go_pkg_github_com_dineflow_api_internal_domain_subscription, AdminOverrideRequest, CheckoutRequest (+9 more)

### Community 22 - "Order"
Cohesion: 0.17
Nodes (11): Order, DestinationType, notifServiceIface, OrderItem, OrderItemModifier, OrderSource, OrderStatus, OrderTimeline (+3 more)

### Community 23 - "useAuthStore"
Cohesion: 0.08
Nodes (31): DashboardLayout(), CATEGORY_CONFIG, FILTER_CHIPS, QUICK_ACTIONS, QuickActionItem, RecentSearchItem, SearchResultItem, SearchResultsGrouped (+23 more)

### Community 24 - "web/package.json"
Cohesion: 0.09
Nodes (22): typescript, name, packageManager, private, version, axios, clsx, eslint (+14 more)

### Community 25 - "Scope"
Cohesion: 0.21
Nodes (8): ensureUpdatedAt(), go.mongodb.org/mongo-driver/v2/bson.M, go.mongodb.org/mongo-driver/v2/mongo.Cursor, go.mongodb.org/mongo-driver/v2/mongo.DeleteResult, go.mongodb.org/mongo-driver/v2/mongo.InsertManyResult, go.mongodb.org/mongo-driver/v2/mongo.InsertOneResult, go.mongodb.org/mongo-driver/v2/mongo.UpdateResult, Scope

### Community 26 - "go_pkg_fmt"
Cohesion: 0.11
Nodes (16): geminiRequest, geminiResponse, go_pkg_bytes, go_pkg_encoding_json, go_pkg_fmt, go_pkg_github_com_redis_go_redis_v9, go_pkg_go_uber_org_zap, go_pkg_go_uber_org_zap_zapcore (+8 more)

### Community 27 - "Service"
Cohesion: 0.22
Nodes (9): NewService(), NewAuthHandler(), OTPProvider, NormalizePhone(), AuthResponse, EmailSender, LoginRequest, Service (+1 more)

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
Nodes (10): apps_web_app_globals, manrope, metadata, plusJakarta, spaceGrotesk, viewport, ThemeProvider(), QueryProvider() (+2 more)

### Community 32 - "tasks"
Cohesion: 0.11
Nodes (17): dependsOn, inputs, outputs, cache, cache, persistent, dependsOn, $schema (+9 more)

### Community 33 - "useToast"
Cohesion: 0.08
Nodes (28): PlatformAdminPage(), ForgotPasswordPage(), LoginPage(), RegisterPage(), ResetPasswordPage(), VerifyContent(), ForecastPage(), generateForecast() (+20 more)

### Community 34 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 35 - "whatsapp_test.go"
Cohesion: 0.20
Nodes (9): BuildOrderConfirmationMessage(), CalculateGST(), InterpolateTemplate(), TestBuildOrderConfirmationMessage(), TestCalculateGST(), TestInterpolateTemplate(), TestIsOptOutKeyword(), TestParseRating() (+1 more)

### Community 36 - "package.json"
Cohesion: 0.09
Nodes (21): description, devDependencies, prettier, turbo, typescript, engines, node, typescript (+13 more)

### Community 37 - "notification-center.tsx"
Cohesion: 0.15
Nodes (19): CATEGORIES, CATEGORY_META, NotificationsPage(), PRIORITIES, PRIORITY_BADGE, timeAgo(), CATEGORIES, CATEGORY_META (+11 more)

### Community 38 - "DineFlow — Development Plan"
Cohesion: 0.15
Nodes (13): Definition of Done, DineFlow — Development Plan, E2E Tests (Playwright), How to Read This Plan, Integration Tests, Performance Tests (k6), Phase 0 — Planning & Architecture, Phase 3 — Hotel Module (+5 more)

### Community 39 - "handlers/table.go"
Cohesion: 0.29
Nodes (7): NewTableHandler(), go_pkg_github_com_dineflow_api_internal_application_table, BulkCreateRoomsRequest, CreateTableRequest, ToggleDNDRequest, UpdateTableStatusRequest, LocationType

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
Cohesion: 0.61
Nodes (7): ChefOrAbove(), OwnerOnly(), OwnerOrManager(), RequireAnyRole(), RequireRole(), WaiterOrAbove(), github.com/gin-gonic/gin.HandlerFunc

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
Cohesion: 0.26
Nodes (12): centerText(), GenerateBillText(), GenerateKOTText(), padRow(), TestGenerateBillText(), TestGenerateKOTText(), truncate(), BillData (+4 more)

### Community 56 - "User"
Cohesion: 0.28
Nodes (11): DefaultPermissionsForRole(), PublicProfile, User, UpdateStaffRequest, InviteStaffInput, Auth, NotificationPrefs, Permissions (+3 more)

### Community 57 - "DineFlow — Subscription Model"
Cohesion: 0.11
Nodes (18): Billing Cycle Options, Billing Mechanics, DineFlow — Subscription Model, 🆓 Free — "Just Getting Started", Future: Platform License, 📈 Growth — "Scaling Up" — ₹2,999/month, 🏨 Hotel Pro — "Enterprise Hospitality" — ₹7,999/month, Overview (+10 more)

### Community 58 - "ui/pricing.tsx"
Cohesion: 0.13
Nodes (15): COMPARISON_ROWS, PLANS, PlanTier, PricingPage(), buttonVariants, Label, labelVariants, Pricing() (+7 more)

### Community 59 - "otp.go"
Cohesion: 0.24
Nodes (7): GenerateCode(), redis.Client, NewService(), redisKey(), go_pkg_crypto_rand, go_pkg_math_big, Service

### Community 60 - "Collections"
Cohesion: 0.10
Nodes (20): Collection: `audit_logs`, Collection: `categories`, Collection: `locations`, Collection: `menu_items`, Collection: `menus`, Collection: `modifier_groups`, Collection: `notifications`, Collection: `orders` (+12 more)

### Community 61 - "Service"
Cohesion: 0.22
Nodes (7): CategoryShare, HourlyPoint, OverviewMetrics, Service, TopItemMetric, NewService(), NewAnalyticsHandler()

### Community 62 - "Service"
Cohesion: 0.14
Nodes (9): IsOptOutKeyword(), ParseRating(), CustomerInvoice, MessageLog, MessageStatus, NotificationEmitter, Service, TemplateType (+1 more)

### Community 63 - "DineFlow — Feature Roadmap"
Cohesion: 0.15
Nodes (13): Cross-Phase Dependencies Map, Deliverables, Deliverables, DineFlow — Feature Roadmap, Overview, Phase 0 — Planning & Architecture, Phase 1 — Foundation & Infrastructure, Phase 3 — Hotel Module (+5 more)

### Community 64 - "DineFlow — Product Vision"
Cohesion: 0.09
Nodes (21): Business Metrics (12-Month Targets), Competitive Landscape, Customer Experience Metrics, DineFlow — Product Vision, Long-Term Vision (3–5 Years), Mission, Primary Segments, Problem 1 — Fragmented Software Stack (+13 more)

### Community 65 - "handlers/room.go"
Cohesion: 0.15
Nodes (12): go_pkg_encoding_base64, go_pkg_github_com_dineflow_api_internal_application_room, go_pkg_github_com_dineflow_api_internal_domain_room, BulkRoomsRequest, CreateRoomRequest, CreateTaskRequest, PublicAmenityRequest, PublicExtendStayRequest (+4 more)

### Community 66 - "README.md"
Cohesion: 0.13
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

### Community 70 - "NewFirebaseTestProvider"
Cohesion: 0.25
Nodes (7): Config, redis.Client, NewFirebaseTestProvider(), redis.Client, NewOTPProvider(), Config, FirebaseTestProvider

### Community 71 - "Architectural Assessment Dimensions"
Cohesion: 0.25
Nodes (7): 1. Monorepo & Service Boundaries, 2. Database Design & Indexing, 3. Caching & State Distribution, 4. Reliability & High Availability, 5. Observability & Tracing, Architectural Assessment Dimensions, System Architecture & Scalability Review

### Community 72 - "Review Pillars"
Cohesion: 0.25
Nodes (7): 1. Tenant Provisioning & Lifecycle, 2. Subscription Tiers & Feature Gates, 3. Data Partitioning & Soft Delete, 4. Financial & Payment Idempotency, 5. Multi-Tenant Event & Notification Architecture, Multi-Tenant SaaS Architecture & Business Review, Review Pillars

### Community 73 - "Phase 2 — Restaurant MVP"
Cohesion: 0.25
Nodes (8): 2A — Business Onboarding, 2B — Menu Management, 2C — QR Code System, 2D — Customer Ordering Experience, 2E — Order Management (Staff Dashboard), 2F — Kitchen Display System, 2G — Basic Analytics, Phase 2 — Restaurant MVP

### Community 74 - "Phase 2 — Restaurant MVP"
Cohesion: 0.22
Nodes (9): 2.1 — Onboarding, 2.2 — Menu Management, 2.3 — Table & QR Code Management, 2.4 — Customer Ordering Experience, 2.5 — WebSocket / Real-Time, 2.6 — Order Management (Staff Dashboard), 2.7 — Kitchen Display System, 2.8 — Basic Analytics (+1 more)

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

### Community 79 - "Phase 1 — Foundation & Infrastructure"
Cohesion: 0.25
Nodes (8): 1.1 — Monorepo Setup, 1.2 — Backend Foundation (Go), 1.3 — Authentication Service, 1.4 — Multi-Tenancy Middleware, 1.5 — Frontend Foundation (Next.js), 1.6 — File Storage, 1.7 — Email Service, Phase 1 — Foundation & Infrastructure

### Community 80 - "menu-nlp-engine.ts"
Cohesion: 0.38
Nodes (10): calculateSimilarity(), detectIsVeg(), enrichRawExtractedItems(), extractPrice(), inferCategory(), matchCatalogDish(), NON_VEG_PATTERNS, normalizeDishText() (+2 more)

### Community 81 - "[orderId]/page.tsx"
Cohesion: 0.12
Nodes (15): SettingsPage(), OrderStatus, OrderTrackingPage(), TrackingOrder, TrackingOrderItem, ResolvedTheme, Theme, ThemeContext (+7 more)

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

### Community 87 - "Notification"
Cohesion: 0.48
Nodes (5): CreateNotificationRequest, Category, CreateNotificationInput, Notification, Priority

### Community 88 - "1. User Personas"
Cohesion: 0.33
Nodes (6): 1. User Personas, Persona 1 — Riya (Restaurant Owner), Persona 2 — Arjun (Hotel Operations Manager), Persona 3 — Chef Meena (Head Chef / Kitchen Staff), Persona 4 — Kai (Food Truck Operator), Persona 5 — Priya (Customer / Guest)

### Community 115 - "NewService"
Cohesion: 0.50
Nodes (4): TestSearchScenarios(), NewService(), TestSearchAll_EmptyQuery(), TestSearchAll_ShortQuery()

### Community 116 - "Grace Period & Downgrade Automation"
Cohesion: 0.40
Nodes (5): Downgrade Execution (Day 14), Grace Period & Downgrade Automation, Grace Period Flow, Grace Period Timeline, Reactivation after Downgrade

### Community 117 - "MSG91Provider"
Cohesion: 0.29
Nodes (6): Config, redis.Client, NewMSG91Provider(), TestMSG91ProviderFallback(), net/http.Client, MSG91Provider

### Community 118 - "scan/route.ts"
Cohesion: 0.33
Nodes (6): callGeminiVision(), GEMINI_MODELS, maxDuration, POST(), RawMenuItem, ScanMenuRequestBody

### Community 119 - "indian-food-database.ts"
Cohesion: 0.29
Nodes (5): INDIAN_CATEGORIES, INDIAN_DISH_CATALOG, IndianCategory, IndianDishEntry, OCR_TYPO_CORRECTIONS

### Community 122 - "GetStandardTemplates"
Cohesion: 0.50
Nodes (4): GetStandardTemplates(), TestGetStandardTemplates(), TemplateDefinition, TemplateVariable

### Community 123 - "otp_test.go"
Cohesion: 0.50
Nodes (3): TestGenerateCode(), go_pkg_github_com_dineflow_api_pkg_otp, go_pkg_strconv

### Community 124 - "Feature Flag System"
Cohesion: 0.50
Nodes (4): Enforcement Layers, Feature Flag System, Implementation, Upgrade Prompt Pattern

### Community 125 - "Service"
Cohesion: 1.00
Nodes (3): SearchHandler, NewSearchHandler(), Service

## Knowledge Gaps
- **615 isolated node(s):** `github.com/dineflow/api`, `geminiRequest`, `geminiResponse`, `SendOTPRequest`, `MessageType` (+610 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 741 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `useToast`, `lucide-react`, `notification-center.tsx`, `TubesCursor`, `utils.ts`, `menu/page.tsx`, `[orderId]/page.tsx`, `peeking-chef.tsx`, `useAuthStore`, `web/package.json`, `ui/pricing.tsx`, `app/layout.tsx`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `main()` connect `main` to `github.com/gin-gonic/gin.Context`, `tenant/tenant.go`, `server/main.go`, `handlers/table.go`, `NewFirebaseTestProvider`, `Service`, `Service`, `testing.T`, `config.go`, `context.Context`, `NewService`, `subscription/service.go`, `handlers/menu.go`, `Service`, `Service`, `storage/storage.go`, `Service`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `RoomHandler` connect `github.com/gin-gonic/gin.Context` to `time.Time`, `handlers/room.go`, `context.Context`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `github.com/dineflow/api`, `geminiRequest`, `geminiResponse` to the rest of the system?**
  _615 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `github.com/gin-gonic/gin.Context` be split into smaller, more focused modules?**
  _Cohesion score 0.05444367763208343 - nodes in this community are weakly interconnected._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.05029838022165388 - nodes in this community are weakly interconnected._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.08924050632911393 - nodes in this community are weakly interconnected._