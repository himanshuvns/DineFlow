# Graph Report - DineFlow  (2026-09-22)

## Corpus Check
- 326 files · ~659,154 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 6, .example 2, .toml 1)

## Summary
- 2707 nodes · 7583 edges · 140 communities (103 shown, 37 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 55 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6c6bc5ab`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- InternalError
- go.mongodb.org/mongo-driver/v2/bson.ObjectID
- lucide-react
- context.Context
- orders/page.tsx
- go_pkg_time
- ai/service.go
- time.Time
- Service
- 3. Comprehensive Issue Register & Auto-Fix Log
- Service
- ref_next_server
- Setup
- useToast
- testing.T
- config.go
- OK
- Service
- redisKey
- DineFlow — UI/UX Guidelines
- BadRequest
- Subscription
- Order
- [roomId]/page.tsx
- web/package.json
- Scope
- react
- notification-center.tsx
- storage/storage.go
- dependencies
- compilerOptions
- app/layout.tsx
- tasks
- 2. Touch Target Remediations (WCAG 2.5.5 / 2.5.8)
- components.json
- main
- package.json
- github.com/gin-gonic/gin.Context
- DineFlow — Development Plan
- video/page.tsx
- devDependencies
- scripts
- 2. Functional Requirements
- platform-store.ts
- DineFlow — System Architecture
- tenant/tenant.go
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
- menu/page.tsx
- DineFlow — Subscription Model
- Visual Regression & Before/After Comparison
- tasks/route.ts
- Collections
- useAuthStore
- Service
- DineFlow — Feature Roadmap
- DineFlow — Product Vision
- spotlight-cursor.tsx
- README.md
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
- 2. Layout Shift & Reflow Protections
- DineFlow — Antigravity (`agy`) Workspace Rules
- landing-workflow.tsx
- generate-logo/route.ts
- handlers/table.go
- Ponytail: Anti-Overengineering & YAGNI Guardrails
- Ponytail Technical Debt Analysis
- Ponytail Configuration & Status
- web/README.md
- handlers/menu.go
- server/main.go
- staff/page.tsx
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
- Phase 2 — Restaurant MVP
- SubscriptionHandler
- menu-nlp-engine.ts
- Service
- Hub
- github.com/gin-gonic/gin.HandlerFunc
- Grace Period & Downgrade Automation
- dnd/route.ts
- remotion.config.ts
- AuthHandler
- logs/route.ts
- extend-stay/route.ts
- Maker
- public/route.ts
- 3. Non-Functional Requirements
- Service
- deploy.sh
- gen-secrets.sh
- search/service.go
- table/route.ts
- response.go
- Problems Solved
- Notification
- next.config.ts
- design-system.ts

## God Nodes (most connected - your core abstractions)
1. `OK()` - 157 edges
2. `BadRequest()` - 137 edges
3. `react` - 123 edges
4. `GetTenantID()` - 113 edges
5. `Unauthorized()` - 109 edges
6. `lucide-react` - 95 edges
7. `useToast()` - 91 edges
8. `cn()` - 91 edges
9. `InternalError()` - 88 edges
10. `Button` - 63 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `seedDefaultData()`  [INFERRED]
  apps/api/cmd/server/main.go → apps/api/cmd/server/seed.go
- `main()` --calls--> `SetHealthDeps()`  [EXTRACTED]
  apps/api/cmd/server/main.go → apps/api/internal/interfaces/http/handlers/health.go
- `TestSearchScenarios()` --calls--> `NewService()`  [INFERRED]
  apps/api/internal/application/search/scenarios_test.go → apps/api/internal/application/search/service.go
- `UpdateRoomStatusRequest` --references--> `RoomStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/room.go → apps/api/internal/domain/room/room.go
- `UpdateTaskRequest` --references--> `TaskStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/room.go → apps/api/internal/domain/room/room.go

## Import Cycles
- None detected.

## Communities (140 total, 37 thin omitted)

### Community 0 - "InternalError"
Cohesion: 0.12
Nodes (3): PlatformHandler, InternalError(), OKWithMeta()

### Community 1 - "go.mongodb.org/mongo-driver/v2/bson.ObjectID"
Cohesion: 0.09
Nodes (18): cleanPhoneNumber(), NewScope(), buildMenuItemFromUpsertRequest(), go.mongodb.org/mongo-driver/v2/bson.ObjectID, Category, MenuItem, PublicCategorySection, PublicMenuResponse (+10 more)

### Community 2 - "lucide-react"
Cohesion: 0.07
Nodes (63): DAYS, ForecastPage(), generateForecast(), getIntensityClass(), HOURS, INSIGHTS, getDescription(), MenuWriterPage() (+55 more)

### Community 3 - "context.Context"
Cohesion: 0.09
Nodes (10): cleanGuestName(), cleanOrderNumber(), cleanTableName(), Service, Client, New(), IPBlocklist(), context.Context (+2 more)

### Community 4 - "orders/page.tsx"
Cohesion: 0.10
Nodes (19): CATEGORIES, CATEGORY_META, NotificationsPage(), PRIORITIES, PRIORITY_BADGE, timeAgo(), INITIAL_KDS_ORDERS, KdsItem (+11 more)

### Community 5 - "go_pkg_time"
Cohesion: 0.09
Nodes (43): ParseObjectID(), SendOTPRequest, go_pkg_context, go_pkg_crypto_rand, go_pkg_encoding_csv, go_pkg_errors, go_pkg_fmt, go_pkg_github_com_dineflow_api_internal_domain_menu (+35 more)

### Community 6 - "ai/service.go"
Cohesion: 0.07
Nodes (33): geminiRequest, geminiResponse, main(), testCORSOriginDefense(), testMetaWebhookHMACSignature(), testNoSQLInjectionInBody(), testNoSQLInjectionInQueryParams(), testRequestIDTracing() (+25 more)

### Community 7 - "time.Time"
Cohesion: 0.13
Nodes (27): DefaultPermissionsForRole(), PublicProfile, User, IsPlatformRole(), time.Time, UpdateStaffRequest, FeatureFlagRecord, RateLimitResult (+19 more)

### Community 8 - "Service"
Cohesion: 0.10
Nodes (10): ValidateAndNormalizeIndianPhone(), Guest, HousekeepingTask, Room, RoomStatus, Service, StayExtensionRequest, StaySummary (+2 more)

### Community 9 - "3. Comprehensive Issue Register & Auto-Fix Log"
Cohesion: 0.11
Nodes (18): 1. Executive Summary & Audit Metrics, 2. Multi-Viewport Testing Matrix, 3. Comprehensive Issue Register & Auto-Fix Log, 4. Mandatory Quality Checklist Verification, 5. Deliverables & PR Details, End-to-End Frontend QA Visual & Responsive Audit Report, [ISSUE-001] Menu Management: "In Stock" Status Badge Overlapping Edit Button, [ISSUE-002] TopBar: Global Search Input Compressed at Tablet Landscape (+10 more)

### Community 10 - "Service"
Cohesion: 0.13
Nodes (23): ChatbotMessage, ChatbotResponse, ChatTurn, ForecastDay, ForecastHour, ForecastResponse, MenuDescriptionRequest, MenuDescriptionResponse (+15 more)

### Community 11 - "ref_next_server"
Cohesion: 0.13
Nodes (7): dynamic, revalidate, dynamic, dynamic, revalidate, config, ref_next_server

### Community 12 - "Setup"
Cohesion: 0.13
Nodes (5): AnalyticsHandler, OrderHandler, Auth(), RateLimit(), Setup()

### Community 13 - "useToast"
Cohesion: 0.06
Nodes (52): VerifyContent(), PricingAlertsPage(), UpsellPage(), getStayMetrics(), RoomsDirectoryPage(), OrderStatus, OrderTrackingPage(), TrackingOrder (+44 more)

### Community 14 - "testing.T"
Cohesion: 0.05
Nodes (59): TestSearchScenarios(), NewService(), TestApplyLeave_Validation(), TestCreateHoliday_Validation(), TestCreateShift_Validation(), TestGeneratePayslipHTML_Structure(), TestInviteStaff_Validation(), TestOrderNotificationsAndAdminAlerts() (+51 more)

### Community 15 - "config.go"
Cohesion: 0.16
Nodes (18): getEnv(), getEnvInt(), Load(), requireEnv(), AIConfig, AppConfig, Config, EmailConfig (+10 more)

### Community 16 - "OK"
Cohesion: 0.09
Nodes (5): AuthHandler, RoomHandler, TenantHandler, NotFound(), OK()

### Community 17 - "Service"
Cohesion: 0.08
Nodes (23): CalculateHealthScore(), AnnouncementInfo, AuditActor, AuditLogRecord, BusinessType, ClientStatus, DashboardMetrics, FeatureFlagDefinition (+15 more)

### Community 18 - "redisKey"
Cohesion: 0.10
Nodes (19): Config, redis.Client, NewFirebaseTestProvider(), Config, redis.Client, NewMSG91Provider(), GenerateCode(), redis.Client (+11 more)

### Community 19 - "DineFlow — UI/UX Guidelines"
Cohesion: 0.04
Nodes (44): 10. Responsive Breakpoints, 11. Iconography, 12. Empty States, 13. Toast / Notification System, 1. Design Philosophy, 2. Color Palette, 3. Typography, 4. Spacing System (+36 more)

### Community 20 - "BadRequest"
Cohesion: 0.10
Nodes (11): MenuHandler, NotificationHandler, StaffHandler, TableHandler, GetTenantID(), GetUserID(), ByTenant(), BadRequest() (+3 more)

### Community 21 - "Subscription"
Cohesion: 0.17
Nodes (11): FormatPlanName(), GetLimits(), AdminOverrideRequest, CheckoutRequest, BillingCycle, PlanLimits, PlanTier, Service (+3 more)

### Community 22 - "Order"
Cohesion: 0.13
Nodes (11): Service, Order, UpdateOrderStatusRequest, DestinationType, OrderItem, OrderItemModifier, OrderSource, OrderStatus (+3 more)

### Community 23 - "[roomId]/page.tsx"
Cohesion: 0.06
Nodes (45): ForgotPasswordContent(), Step, LoginPage(), RegisterPage(), ResetPasswordContent(), DEFAULT_FALLBACK_ROOMS, getStayMetrics(), HousekeepingTask (+37 more)

### Community 24 - "web/package.json"
Cohesion: 0.08
Nodes (26): Player, Label, labelVariants, typescript, name, packageManager, private, version (+18 more)

### Community 25 - "Scope"
Cohesion: 0.18
Nodes (9): ensureUpdatedAt(), go.mongodb.org/mongo-driver/v2/bson.M, go.mongodb.org/mongo-driver/v2/mongo.Collection, go.mongodb.org/mongo-driver/v2/mongo.Cursor, go.mongodb.org/mongo-driver/v2/mongo.DeleteResult, go.mongodb.org/mongo-driver/v2/mongo.InsertManyResult, go.mongodb.org/mongo-driver/v2/mongo.InsertOneResult, go.mongodb.org/mongo-driver/v2/mongo.UpdateResult (+1 more)

### Community 26 - "react"
Cohesion: 0.04
Nodes (68): SettingsPage(), BUSINESS_CATEGORIES, BusinessCategory, BusinessCategorySelector(), BusinessCategorySelectorProps, ChefMascot(), ChefMascotProps, FloatingCard() (+60 more)

### Community 27 - "notification-center.tsx"
Cohesion: 0.13
Nodes (20): calculateDistanceMeters(), CheckInContent(), CheckInResult, TokenInfo, CATEGORIES, CATEGORY_META, NotifCard(), NotificationCenter() (+12 more)

### Community 28 - "storage/storage.go"
Cohesion: 0.16
Nodes (12): StorageService, NewService(), TestStorageValidation(), StorageHandler, NewStorageHandler(), go_pkg_crypto_sha256, go_pkg_github_com_dineflow_api_internal_infrastructure_storage, go_pkg_path_filepath (+4 more)

### Community 29 - "dependencies"
Cohesion: 0.09
Nodes (22): dependencies, axios, canvas-confetti, class-variance-authority, clsx, framer-motion, lucide-react, next (+14 more)

### Community 30 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 31 - "app/layout.tsx"
Cohesion: 0.13
Nodes (13): apps_web_app_globals, metadata, plusJakarta, spaceGrotesk, viewport, ResolvedTheme, Theme, ThemeContext (+5 more)

### Community 32 - "tasks"
Cohesion: 0.11
Nodes (17): dependsOn, inputs, outputs, cache, cache, persistent, dependsOn, $schema (+9 more)

### Community 33 - "2. Touch Target Remediations (WCAG 2.5.5 / 2.5.8)"
Cohesion: 0.22
Nodes (8): 1. Executive Summary, 2.1 Mobile Navigation Drawer Trigger (`topbar.tsx`), 2.2 Theme Toggle Button (`theme-toggle.tsx`), 2.3 Notification Bell Button (`notification-center.tsx`), 2.4 Button Component Variants (`button.tsx`), 2. Touch Target Remediations (WCAG 2.5.5 / 2.5.8), 3. Contrast Ratios (Sample Measurements), Accessibility (a11y) & Contrast Audit Report

### Community 34 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 35 - "main"
Cohesion: 0.11
Nodes (23): main(), requestLogger(), runStartupCleanup(), NewService(), NewService(), NewService(), NewService(), NewService() (+15 more)

### Community 36 - "package.json"
Cohesion: 0.08
Nodes (23): description, devDependencies, prettier, puppeteer-core, turbo, typescript, engines, node (+15 more)

### Community 37 - "github.com/gin-gonic/gin.Context"
Cohesion: 0.11
Nodes (5): AIHandler, WhatsAppHandler, PlanLimitMiddleware(), PlanLimitExceeded(), github.com/gin-gonic/gin.Context

### Community 38 - "DineFlow — Development Plan"
Cohesion: 0.07
Nodes (30): 1.1 — Monorepo Setup, 1.2 — Backend Foundation (Go), 1.3 — Authentication Service, 1.4 — Multi-Tenancy Middleware, 1.5 — Frontend Foundation (Next.js), 1.6 — File Storage, 1.7 — Email Service, 2.1 — Onboarding (+22 more)

### Community 39 - "video/page.tsx"
Cohesion: 0.12
Nodes (12): VideoType, AIPresenter(), AIPresenterProps, defaultDineFlowPromoProps, DineFlowPromo(), DineFlowPromoProps, defaultQROrderingDemoProps, QROrderingDemo() (+4 more)

### Community 40 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti, @types/node, @types/react (+2 more)

### Community 41 - "scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, test, version

### Community 42 - "2. Functional Requirements"
Cohesion: 0.14
Nodes (14): 2.10 Staff Management, 2.11 WhatsApp Integration, 2.12 Analytics & Reporting, 2.13 Settings & Configuration, 2.1 Authentication & Multi-Tenancy, 2.2 Subscription & Billing, 2.3 Onboarding, 2.4 Menu Management (+6 more)

### Community 43 - "platform-store.ts"
Cohesion: 0.08
Nodes (24): InvoiceRecord, AuditLogEntry, BusinessType, ClientStatus, DashboardMetrics, FeatureFlagDefinition, INITIAL_AUDIT_LOGS, INITIAL_CLIENTS (+16 more)

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
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, start, video:preview, video:render, video:render:qr

### Community 49 - "web/vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, framework, installCommand, $schema

### Community 50 - "vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, framework, installCommand, $schema

### Community 51 - "Service"
Cohesion: 0.14
Nodes (11): generateSlug(), NewService(), ValidatePasswordComplexity(), OTPProvider, NormalizePhone(), AuthResponse, EmailSender, LoginRequest (+3 more)

### Community 52 - "OpenWAProvider"
Cohesion: 0.08
Nodes (12): NewMetaCloudProvider(), NewOpenWAProvider(), CleanPhoneNumber(), FormatChatID(), SessionStatus, net/http.Request, MetaCloudConfig, MetaCloudProvider (+4 more)

### Community 55 - "printer.go"
Cohesion: 0.26
Nodes (12): centerText(), GenerateBillText(), GenerateKOTText(), padRow(), TestGenerateBillText(), TestGenerateKOTText(), truncate(), BillData (+4 more)

### Community 56 - "menu/page.tsx"
Cohesion: 0.08
Nodes (56): IMAGE_PRESETS, MenuManagementPage(), HotelStats, RoomItem, TablesManagementPage(), CampaignItem, CustomerInvoice, CustomerInvoiceItem (+48 more)

### Community 57 - "DineFlow — Subscription Model"
Cohesion: 0.09
Nodes (22): Billing Cycle Options, Billing Mechanics, DineFlow — Subscription Model, Enforcement Layers, Feature Flag System, 🆓 Free — "Just Getting Started", Future: Platform License, 📈 Growth — "Scaling Up" — ₹2,999/month (+14 more)

### Community 58 - "Visual Regression & Before/After Comparison"
Cohesion: 0.29
Nodes (6): 1. Menu Items Table — Status Column & Quick Actions Overlap, 2. TopBar Global Search & KDS Pill Squeeze, 3. TopBar Mobile Title Truncation, 4. Mobile Touch Targets (WCAG 44×44px Standard), 5. Live KDS Order Card Table Name, Visual Regression & Before/After Comparison

### Community 59 - "tasks/route.ts"
Cohesion: 0.29
Nodes (14): dynamic, GET(), PATCH(), POST(), revalidate, countActiveTasksForStaff(), findAvailableHousekeeper(), getTasksStore() (+6 more)

### Community 60 - "Collections"
Cohesion: 0.10
Nodes (20): Collection: `audit_logs`, Collection: `categories`, Collection: `locations`, Collection: `menu_items`, Collection: `menus`, Collection: `modifier_groups`, Collection: `notifications`, Collection: `orders` (+12 more)

### Community 61 - "useAuthStore"
Cohesion: 0.07
Nodes (49): AnalyticsPage(), DashboardLayout(), DashboardOverviewPage(), RootLoading(), PlatformLayout(), CATEGORY_CONFIG, FILTER_CHIPS, QUICK_ACTIONS (+41 more)

### Community 62 - "Service"
Cohesion: 0.24
Nodes (6): CategoryShare, HourlyPoint, OverviewMetrics, Service, TopItemMetric, NewAnalyticsHandler()

### Community 63 - "DineFlow — Feature Roadmap"
Cohesion: 0.15
Nodes (13): Cross-Phase Dependencies Map, Deliverables, Deliverables, DineFlow — Feature Roadmap, Overview, Phase 0 — Planning & Architecture, Phase 1 — Foundation & Infrastructure, Phase 3 — Hotel Module (+5 more)

### Community 64 - "DineFlow — Product Vision"
Cohesion: 0.14
Nodes (13): Business Metrics (12-Month Targets), Competitive Landscape, Customer Experience Metrics, DineFlow — Product Vision, Long-Term Vision (3–5 Years), Mission, Primary Segments, Product Metrics (+5 more)

### Community 65 - "spotlight-cursor.tsx"
Cohesion: 0.32
Nodes (5): Component(), ComponentProps, SpotlightConfig, SpotlightCursor, useSpotlightEffect()

### Community 66 - "README.md"
Cohesion: 0.12
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
Cohesion: 0.05
Nodes (50): Service, CalculateDistanceMeters(), BuildFeedbackRequestMessage(), BuildKitchenReadyMessage(), BuildOrderConfirmationMessage(), CalculateGST(), GetStandardTemplates(), InterpolateTemplate() (+42 more)

### Community 75 - "DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)"
Cohesion: 0.25
Nodes (7): 1. Overview & Vision, 2. End-to-End Pipeline Architecture, 3.1 Inbound WhatsApp Webhook (`POST /webhooks/whatsapp`), 3.2 Staging Collection (`menu_imports_staging`), 3. Webhook Payload & Data Schema, 4. Security, Multi-Tenancy & Privacy Controls, DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)

### Community 76 - "Code Quality Standards"
Cohesion: 0.29
Nodes (6): 1. TypeScript & React, 2. Go (Golang), 3. API & Data Access Hygiene, 4. Code Review Output Format, Code Quality Standards, Staff Engineer Code Review Runbook

### Community 77 - "2. Layout Shift & Reflow Protections"
Cohesion: 0.29
Nodes (6): 1. Core Web Vitals UI Impact, 2.1 Fixed Aspect Ratios & Dimensions, 2.2 Font Display & Fallbacks, 2.3 Horizontal Overflow Prevention, 2. Layout Shift & Reflow Protections, UI Performance & Layout Stability Audit Report

### Community 78 - "DineFlow — Antigravity (`agy`) Workspace Rules"
Cohesion: 0.29
Nodes (6): Code Style, DineFlow — Antigravity (`agy`) Workspace Rules, Key Files, Project, Tech Stack, Workflow Rules

### Community 80 - "generate-logo/route.ts"
Cohesion: 0.24
Nodes (11): ACTIVE_GEMINI_MODELS, ARCHETYPE_CONFIGS, createArchetypeLogo(), generateArchetypeProceduralSvg(), GenerateLogoRequest, generateWithGemini(), LogoVariation, maxDuration (+3 more)

### Community 81 - "handlers/table.go"
Cohesion: 0.32
Nodes (7): go_pkg_github_com_dineflow_api_internal_application_table, BulkCreateRoomsRequest, CreateTableRequest, ToggleDNDRequest, UpdateTableStatusRequest, LocationType, TableStatus

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
Nodes (13): go_pkg_github_com_dineflow_api_internal_application_ai, go_pkg_github_com_dineflow_api_internal_application_menu, BulkCreateItemsRequest, BulkDeleteItemsRequest, BulkUpdateItemsRequest, CreateCategoryRequest, ScanMenuRequest, ToggleStockRequest (+5 more)

### Community 87 - "server/main.go"
Cohesion: 0.05
Nodes (52): NewRoomHandler(), ByIP(), ByIPAndRoute(), go_pkg_encoding_base64, go_pkg_github_com_dineflow_api_internal_application_analytics, go_pkg_github_com_dineflow_api_internal_application_auth, go_pkg_github_com_dineflow_api_internal_application_notification, go_pkg_github_com_dineflow_api_internal_application_platform (+44 more)

### Community 88 - "staff/page.tsx"
Cohesion: 0.13
Nodes (17): AttendanceRecord, BankDetails, calculateDistanceM(), EmergencyContact, GeofenceConfig, Holiday, LeaveBalance, LeaveRequest (+9 more)

### Community 115 - "Phase 2 — Restaurant MVP"
Cohesion: 0.25
Nodes (8): 2A — Business Onboarding, 2B — Menu Management, 2C — QR Code System, 2D — Customer Ordering Experience, 2E — Order Management (Staff Dashboard), 2F — Kitchen Display System, 2G — Basic Analytics, Phase 2 — Restaurant MVP

### Community 117 - "menu-nlp-engine.ts"
Cohesion: 0.12
Nodes (26): callGeminiVision(), GEMINI_MODELS, maxDuration, POST(), RawMenuItem, ScanMenuRequestBody, CameraMenuScannerModalProps, MenuStagingPreviewModalProps (+18 more)

### Community 119 - "Hub"
Cohesion: 0.15
Nodes (10): NewService(), NewService(), GetHub(), Hub, NewNotificationHandler(), NewOrderHandler(), sync.RWMutex, notifServiceIface (+2 more)

### Community 120 - "github.com/gin-gonic/gin.HandlerFunc"
Cohesion: 0.36
Nodes (13): corsMiddleware(), ChefOrAbove(), FinanceAdminOrAbove(), OwnerOnly(), OwnerOrManager(), PlatformAdminOrAbove(), RequireAnyRole(), RequirePlatformRole() (+5 more)

### Community 121 - "Grace Period & Downgrade Automation"
Cohesion: 0.40
Nodes (5): Downgrade Execution (Day 14), Grace Period & Downgrade Automation, Grace Period Flow, Grace Period Timeline, Reactivation after Downgrade

### Community 122 - "dnd/route.ts"
Cohesion: 0.38
Nodes (6): DNDRecord, dynamic, GET(), getDNDStore(), POST(), revalidate

### Community 124 - "AuthHandler"
Cohesion: 0.21
Nodes (5): clearRefreshTokenCookie(), AuthHandler, setRefreshTokenCookie(), GetRole(), GetTokenID()

### Community 125 - "logs/route.ts"
Cohesion: 0.50
Nodes (4): dynamic, GET(), revalidate, getWhatsAppLogs()

### Community 126 - "extend-stay/route.ts"
Cohesion: 0.38
Nodes (6): dynamic, GET(), getExtensionStore(), POST(), revalidate, StayExtensionRecord

### Community 127 - "Maker"
Cohesion: 0.30
Nodes (7): Maker, NewMaker(), TestTokenMaker(), go_pkg_github_com_golang_jwt_jwt_v5, jwt.RegisteredClaims, Claims, TokenType

### Community 129 - "3. Non-Functional Requirements"
Cohesion: 0.10
Nodes (19): 1. User Personas, 3.1 Performance, 3.2 Scalability, 3.3 Reliability, 3.4 Security, 3.5 Accessibility, 3.6 Internationalisation, 3. Non-Functional Requirements (+11 more)

### Community 130 - "Service"
Cohesion: 0.31
Nodes (4): NewService(), Service, go_pkg_github_com_resend_resend_go_v2, resend.Client

### Community 134 - "search/service.go"
Cohesion: 0.21
Nodes (11): NewService(), TestSearchAll_EmptyQuery(), TestSearchAll_ShortQuery(), SearchHandler, NewSearchHandler(), go_pkg_github_com_dineflow_api_internal_application_search, SearchFilterOptions, SearchResponse (+3 more)

### Community 136 - "response.go"
Cohesion: 0.24
Nodes (8): Conflict(), FeatureNotAvailable(), NoContent(), TooManyRequests(), ValidationError(), APIError, APIResponse, Meta

### Community 137 - "Problems Solved"
Cohesion: 0.25
Nodes (8): Problem 1 — Fragmented Software Stack, Problem 2 — High Cost of Entry, Problem 3 — App Download Friction, Problem 4 — WhatsApp Chaos, Problem 5 — No Real-time Kitchen Visibility, Problem 6 — Hotels Lack F&B Cohesion, Problem 7 — No Data for Decision Making, Problems Solved

### Community 139 - "Notification"
Cohesion: 0.48
Nodes (5): CreateNotificationRequest, Category, CreateNotificationInput, Notification, Priority

### Community 141 - "next.config.ts"
Cohesion: 0.50
Nodes (3): nextConfig, securityHeaders, next

## Knowledge Gaps
- **775 isolated node(s):** `TestResult`, `github.com/dineflow/api`, `geminiRequest`, `geminiResponse`, `SendOTPRequest` (+770 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 949 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `spotlight-cursor.tsx`, `lucide-react`, `orders/page.tsx`, `TubesCursor`, `video/page.tsx`, `notification-center.tsx`, `useToast`, `landing-workflow.tsx`, `[roomId]/page.tsx`, `menu/page.tsx`, `web/package.json`, `staff/page.tsx`, `useAuthStore`, `app/layout.tsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `RoomHandler` connect `OK` to `go.mongodb.org/mongo-driver/v2/bson.ObjectID`, `context.Context`, `Service`, `Service`, `Setup`, `BadRequest`, `server/main.go`, `AuthHandler`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `main()` connect `main` to `Service`, `context.Context`, `search/service.go`, `ai/service.go`, `Service`, `Setup`, `tenant/tenant.go`, `testing.T`, `config.go`, `redisKey`, `Service`, `OpenWAProvider`, `server/main.go`, `Hub`, `github.com/gin-gonic/gin.HandlerFunc`, `storage/storage.go`, `Service`, `Maker`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `TestResult`, `github.com/dineflow/api`, `geminiRequest` to the rest of the system?**
  _775 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `InternalError` be split into smaller, more focused modules?**
  _Cohesion score 0.12179487179487179 - nodes in this community are weakly interconnected._
- **Should `go.mongodb.org/mongo-driver/v2/bson.ObjectID` be split into smaller, more focused modules?**
  _Cohesion score 0.0882936507936508 - nodes in this community are weakly interconnected._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.06700758243695998 - nodes in this community are weakly interconnected._