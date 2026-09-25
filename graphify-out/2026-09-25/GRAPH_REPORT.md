# Graph Report - DineFlow  (2026-09-24)

## Corpus Check
- 339 files · ~683,404 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 6, .example 2, .toml 1)

## Summary
- 2815 nodes · 7872 edges · 153 communities (115 shown, 38 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 56 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e5660b3c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- OK
- time.Time
- orders/page.tsx
- react
- ai/service.go
- go_pkg_time
- cn
- Service
- go.mongodb.org/mongo-driver/v2/bson.ObjectID
- 3. Comprehensive Issue Register & Auto-Fix Log
- Service
- ref_next_server
- landing-customer-journey.tsx
- menu/page.tsx
- testing.T
- config.go
- github.com/gin-gonic/gin.Context
- context.Context
- OpenWAProvider
- DineFlow — UI/UX Guidelines
- BadRequest
- Subscription
- Order
- toast.tsx
- web/package.json
- Scope
- useToast
- notification-store.ts
- handlers/room.go
- dependencies
- compilerOptions
- app/layout.tsx
- tasks
- 2. Touch Target Remediations (WCAG 2.5.5 / 2.5.8)
- components.json
- platform-store.ts
- package.json
- WhatsAppHandler
- DineFlow — Development Plan
- redisKey
- devDependencies
- scripts
- whatsapp/whatsapp.go
- lucide-react
- DineFlow — System Architecture
- tenant/tenant.go
- DineFlow — API Strategy
- eslint.config.mjs
- scripts
- web/vercel.json
- vercel.json
- Service
- [roomId]/page.tsx
- postcss.config.mjs
- github.com/dineflow/api
- printer.go
- Phase 2 — Restaurant MVP
- DineFlow — Subscription Model
- Visual Regression & Before/After Comparison
- tasks/route.ts
- Collections
- useAuthStore
- .LogMessage
- DineFlow — Feature Roadmap
- DineFlow — Product Vision
- video/page.tsx
- DineFlow
- Audit Scope & Checklist
- Responsive Verification Checklist
- Security Checklist
- DineFlow — Questions, Assumptions & Risks
- Architectural Assessment Dimensions
- Review Pillars
- DineFlow — OpenWA Local Development & Testing Guide
- Setup
- DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)
- Code Quality Standards
- 2. Layout Shift & Reflow Protections
- DineFlow — Antigravity (`agy`) Workspace Rules
- Service
- generate-logo/route.ts
- Service
- Ponytail: Anti-Overengineering & YAGNI Guardrails
- Ponytail Technical Debt Analysis
- Ponytail Configuration & Status
- web/README.md
- NewScope
- server/main.go
- DineFlow Frontend Specialist Agent (`dineflow-frontend`)
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
- github.com/gin-gonic/gin.HandlerFunc
- SubscriptionHandler
- menu-nlp-engine.ts
- search/service.go
- DineFlow Critical User Journeys (CUJs)
- DineFlow Engineering Principles & Shared Rules
- README.md
- .SendInvoiceViaWhatsApp
- remotion.config.ts
- response.go
- logs/route.ts
- extend-stay/route.ts
- Maker
- MenuItem
- 3. Non-Functional Requirements
- .ProcessChatbotMessage
- Backend Invariants & Development Rules
- deploy.sh
- gen-secrets.sh
- main
- table/route.ts
- Phase 1 — Foundation & Infrastructure
- 2. Functional Requirements
- spotlight-cursor.tsx
- Service
- NewOTPProvider
- dnd/route.ts
- design-system.ts
- Problems Solved
- DineFlow Orchestrator Agent (`dineflow-orchestrator`)
- order/order.go
- DineFlow Security & Compliance Specialist Agent (`dineflow-security`)
- DineFlow Autonomous Engineering Workflow
- label.tsx
- public/route.ts
- landing-workflow.tsx
- Plan Definitions
- demo/page.tsx

## God Nodes (most connected - your core abstractions)
1. `OK()` - 158 edges
2. `BadRequest()` - 137 edges
3. `react` - 127 edges
4. `GetTenantID()` - 114 edges
5. `Unauthorized()` - 110 edges
6. `cn()` - 106 edges
7. `lucide-react` - 97 edges
8. `useToast()` - 94 edges
9. `InternalError()` - 89 edges
10. `Button` - 64 edges

## Surprising Connections (you probably didn't know these)
- `Pre-Implementation Audit Protocol` --references--> `useTenantData()`  [INFERRED]
  .agents/agents/dineflow-frontend.md → apps/web/lib/stores/tenant-data-store.ts
- `main()` --calls--> `seedDefaultData()`  [INFERRED]
  apps/api/cmd/server/main.go → apps/api/cmd/server/seed.go
- `main()` --calls--> `SetHealthDeps()`  [EXTRACTED]
  apps/api/cmd/server/main.go → apps/api/internal/interfaces/http/handlers/health.go
- `UpdateRoomStatusRequest` --references--> `RoomStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/room.go → apps/api/internal/domain/room/room.go
- `TestIndianPhoneValidation()` --calls--> `ValidateAndNormalizeIndianPhone()`  [INFERRED]
  apps/api/internal/domain/room/room_test.go → apps/api/internal/domain/room/room.go

## Import Cycles
- None detected.

## Communities (153 total, 38 thin omitted)

### Community 0 - "OK"
Cohesion: 0.12
Nodes (5): PlatformHandler, TenantHandler, InternalError(), OK(), OKWithMeta()

### Community 1 - "time.Time"
Cohesion: 0.14
Nodes (23): cleanPhoneNumber(), DefaultPermissionsForRole(), PublicProfile, User, IsPlatformRole(), time.Time, UpdateStaffRequest, FeatureFlagRecord (+15 more)

### Community 2 - "orders/page.tsx"
Cohesion: 0.09
Nodes (18): CATEGORIES, CATEGORY_META, PRIORITIES, PRIORITY_BADGE, INITIAL_KDS_ORDERS, KdsItem, KdsOrder, KDSOrdersPage() (+10 more)

### Community 3 - "react"
Cohesion: 0.07
Nodes (30): DashboardErrorProps, LandingFooter(), LandingHero(), LandingInteractivePreview(), TabDef, TabKey, TABS, LandingNavbar() (+22 more)

### Community 4 - "ai/service.go"
Cohesion: 0.10
Nodes (21): geminiRequest, geminiResponse, GetHub(), NewWhatsAppHandler(), verifyMetaSignature(), verifyOpenWASignature(), setupTestRouter(), TestDualModeWebhookRouter() (+13 more)

### Community 5 - "go_pkg_time"
Cohesion: 0.11
Nodes (37): SendOTPRequest, go_pkg_context, go_pkg_crypto_rand, go_pkg_encoding_csv, go_pkg_errors, go_pkg_fmt, go_pkg_github_com_dineflow_api_internal_domain_menu, go_pkg_github_com_dineflow_api_internal_domain_notification (+29 more)

### Community 6 - "cn"
Cohesion: 0.04
Nodes (74): AnalyticsPage(), SettingsPage(), OrderStatus, OrderTrackingPage(), TrackingOrder, TrackingOrderItem, MenuItem, RoomInfo (+66 more)

### Community 7 - "Service"
Cohesion: 0.11
Nodes (5): Service, SessionManager, WhatsAppProvider, NotificationEmitter, WorkforceTokenVerifyResult

### Community 8 - "go.mongodb.org/mongo-driver/v2/bson.ObjectID"
Cohesion: 0.08
Nodes (21): ValidateAndNormalizeIndianPhone(), ParseObjectID(), go.mongodb.org/mongo-driver/v2/bson.ObjectID, CreateTaskRequest, UpdateTaskRequest, ExtensionStatus, Guest, GuestStatus (+13 more)

### Community 9 - "3. Comprehensive Issue Register & Auto-Fix Log"
Cohesion: 0.11
Nodes (18): 1. Executive Summary & Audit Metrics, 2. Multi-Viewport Testing Matrix, 3. Comprehensive Issue Register & Auto-Fix Log, 4. Mandatory Quality Checklist Verification, 5. Deliverables & PR Details, End-to-End Frontend QA Visual & Responsive Audit Report, [ISSUE-001] Menu Management: "In Stock" Status Badge Overlapping Edit Button, [ISSUE-002] TopBar: Global Search Input Compressed at Tablet Landscape (+10 more)

### Community 10 - "Service"
Cohesion: 0.13
Nodes (22): ChatbotMessage, ChatbotResponse, ChatTurn, ForecastDay, ForecastHour, ForecastResponse, MenuDescriptionRequest, MenuDescriptionResponse (+14 more)

### Community 11 - "ref_next_server"
Cohesion: 0.13
Nodes (7): dynamic, revalidate, dynamic, dynamic, revalidate, config, ref_next_server

### Community 12 - "landing-customer-journey.tsx"
Cohesion: 0.17
Nodes (9): HOTEL_LOADING_MESSAGES, HOTEL_STEPS, JourneyStep, JourneyType, LandingCustomerJourney(), RESTAURANT_LOADING_MESSAGES, RESTAURANT_STEPS, ParallaxFloat() (+1 more)

### Community 13 - "menu/page.tsx"
Cohesion: 0.09
Nodes (44): GuestDiningHistoryPage(), IMAGE_PRESETS, MenuManagementPage(), CameraMenuScannerModal(), CameraMenuScannerModalProps, CapturedPage, MenuBulkToolbar(), MenuBulkToolbarProps (+36 more)

### Community 14 - "testing.T"
Cohesion: 0.06
Nodes (43): TestSearchScenarios(), NewService(), TestSearchAll_EmptyQuery(), TestSearchAll_ShortQuery(), NewService(), TestApplyLeave_Validation(), TestCreateHoliday_Validation(), TestCreateShift_Validation() (+35 more)

### Community 15 - "config.go"
Cohesion: 0.16
Nodes (18): getEnv(), getEnvInt(), Load(), requireEnv(), AIConfig, AppConfig, Config, EmailConfig (+10 more)

### Community 16 - "github.com/gin-gonic/gin.Context"
Cohesion: 0.10
Nodes (6): AuthHandler, RoomHandler, GetRole(), ByTenant(), NotFound(), github.com/gin-gonic/gin.Context

### Community 17 - "context.Context"
Cohesion: 0.06
Nodes (29): Service, CalculateHealthScore(), Client, New(), IPBlocklist(), context.Context, time.Duration, AnnouncementInfo (+21 more)

### Community 18 - "OpenWAProvider"
Cohesion: 0.06
Nodes (18): NewService(), NewMetaCloudProvider(), NewOpenWAProvider(), CleanPhoneNumber(), FormatChatID(), SessionStatus, TestCleanPhoneNumber(), Service (+10 more)

### Community 19 - "DineFlow — UI/UX Guidelines"
Cohesion: 0.04
Nodes (44): 10. Responsive Breakpoints, 11. Iconography, 12. Empty States, 13. Toast / Notification System, 1. Design Philosophy, 2. Color Palette, 3. Typography, 4. Spacing System (+36 more)

### Community 20 - "BadRequest"
Cohesion: 0.08
Nodes (10): AnalyticsHandler, MenuHandler, NotificationHandler, StaffHandler, TableHandler, GetTenantID(), GetUserID(), BadRequest() (+2 more)

### Community 21 - "Subscription"
Cohesion: 0.15
Nodes (14): FormatPlanName(), GetLimits(), NewSubscriptionHandler(), AdminOverrideRequest, CheckoutRequest, BillingCycle, CheckoutSessionResult, PlanLimits (+6 more)

### Community 22 - "Order"
Cohesion: 0.12
Nodes (10): Service, Order, UpdateOrderStatusRequest, CreateOrderInput, CustomerItemInput, DestinationType, OrderSource, OrderStatus (+2 more)

### Community 23 - "toast.tsx"
Cohesion: 0.04
Nodes (61): ForgotPasswordContent(), Step, LoginPage(), RegisterPage(), ResetPasswordContent(), AttendanceRecord, BankDetails, calculateDistanceM() (+53 more)

### Community 24 - "web/package.json"
Cohesion: 0.08
Nodes (23): Player, typescript, name, packageManager, private, version, axios, clsx (+15 more)

### Community 25 - "Scope"
Cohesion: 0.21
Nodes (8): ensureUpdatedAt(), go.mongodb.org/mongo-driver/v2/bson.M, go.mongodb.org/mongo-driver/v2/mongo.Cursor, go.mongodb.org/mongo-driver/v2/mongo.DeleteResult, go.mongodb.org/mongo-driver/v2/mongo.InsertManyResult, go.mongodb.org/mongo-driver/v2/mongo.InsertOneResult, go.mongodb.org/mongo-driver/v2/mongo.UpdateResult, Scope

### Community 26 - "useToast"
Cohesion: 0.10
Nodes (27): VerifyContent(), DAYS, ForecastPage(), generateForecast(), getIntensityClass(), HOURS, INSIGHTS, getDescription() (+19 more)

### Community 27 - "notification-store.ts"
Cohesion: 0.11
Nodes (23): NotificationsPage(), timeAgo(), calculateDistanceMeters(), CheckInContent(), CheckInResult, TokenInfo, CATEGORIES, CATEGORY_META (+15 more)

### Community 28 - "handlers/room.go"
Cohesion: 0.08
Nodes (26): StorageService, NewService(), TestStorageValidation(), NewRoomHandler(), StorageHandler, NewStorageHandler(), go_pkg_crypto_sha256, go_pkg_encoding_base64 (+18 more)

### Community 29 - "dependencies"
Cohesion: 0.09
Nodes (22): dependencies, axios, canvas-confetti, class-variance-authority, clsx, framer-motion, lucide-react, next (+14 more)

### Community 30 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 31 - "app/layout.tsx"
Cohesion: 0.10
Nodes (16): apps_web_app_globals, metadata, plusJakarta, spaceGrotesk, viewport, ResolvedTheme, Theme, ThemeContext (+8 more)

### Community 32 - "tasks"
Cohesion: 0.11
Nodes (17): dependsOn, inputs, outputs, cache, cache, persistent, dependsOn, $schema (+9 more)

### Community 33 - "2. Touch Target Remediations (WCAG 2.5.5 / 2.5.8)"
Cohesion: 0.22
Nodes (8): 1. Executive Summary, 2.1 Mobile Navigation Drawer Trigger (`topbar.tsx`), 2.2 Theme Toggle Button (`theme-toggle.tsx`), 2.3 Notification Bell Button (`notification-center.tsx`), 2.4 Button Component Variants (`button.tsx`), 2. Touch Target Remediations (WCAG 2.5.5 / 2.5.8), 3. Contrast Ratios (Sample Measurements), Accessibility (a11y) & Contrast Audit Report

### Community 34 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 35 - "platform-store.ts"
Cohesion: 0.09
Nodes (21): AuditLogEntry, BusinessType, ClientStatus, DashboardMetrics, FeatureFlagDefinition, INITIAL_AUDIT_LOGS, INITIAL_CLIENTS, INITIAL_FEATURE_FLAGS (+13 more)

### Community 36 - "package.json"
Cohesion: 0.08
Nodes (23): description, devDependencies, prettier, puppeteer-core, turbo, typescript, engines, node (+15 more)

### Community 38 - "DineFlow — Development Plan"
Cohesion: 0.15
Nodes (13): Definition of Done, DineFlow — Development Plan, E2E Tests (Playwright), How to Read This Plan, Integration Tests, Performance Tests (k6), Phase 0 — Planning & Architecture, Phase 3 — Hotel Module (+5 more)

### Community 39 - "redisKey"
Cohesion: 0.15
Nodes (10): Config, redis.Client, NewFirebaseTestProvider(), GenerateCode(), redis.Client, NewService(), redisKey(), TestGenerateCode() (+2 more)

### Community 40 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti, @types/node, @types/react (+2 more)

### Community 41 - "scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, test, version

### Community 42 - "whatsapp/whatsapp.go"
Cohesion: 0.12
Nodes (26): Campaign, CampaignStats, CampaignStatus, CampaignType, ChatbotSession, ChatbotState, InteractiveButton, InteractiveRow (+18 more)

### Community 43 - "lucide-react"
Cohesion: 0.08
Nodes (72): MOCK_DESCRIPTIONS, SAMPLE_ITEMS, TONES, AI_TOOLS, STATS, ALERT_CONFIG, ALERTS, SEVERITY_COLOR (+64 more)

### Community 44 - "DineFlow — System Architecture"
Cohesion: 0.07
Nodes (27): Application Structure, Architecture Philosophy, Backend Architecture, Clean Architecture Dependency Flow, Customer Ordering Page — SSG + ISR, Database Architecture, Deployment Architecture, Deployment Pipeline (+19 more)

### Community 45 - "tenant/tenant.go"
Cohesion: 0.20
Nodes (19): seedDefaultData(), seedPlatformData(), generateSlug(), FeaturesForPlan(), BusinessType, Tenant, LimitsForPlan(), RegisterRequest (+11 more)

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
Nodes (11): NewService(), ValidatePasswordComplexity(), NewAuthHandler(), OTPProvider, NormalizePhone(), AuthResponse, EmailSender, LoginRequest (+3 more)

### Community 52 - "[roomId]/page.tsx"
Cohesion: 0.13
Nodes (15): DEFAULT_FALLBACK_ROOMS, getStayMetrics(), HousekeepingTask, RoomDetail, RoomDetailPage(), RoomOrder, StaffMember, BillingMethod (+7 more)

### Community 55 - "printer.go"
Cohesion: 0.26
Nodes (12): centerText(), GenerateBillText(), GenerateKOTText(), padRow(), TestGenerateBillText(), TestGenerateKOTText(), truncate(), BillData (+4 more)

### Community 56 - "Phase 2 — Restaurant MVP"
Cohesion: 0.22
Nodes (9): 2.1 — Onboarding, 2.2 — Menu Management, 2.3 — Table & QR Code Management, 2.4 — Customer Ordering Experience, 2.5 — WebSocket / Real-Time, 2.6 — Order Management (Staff Dashboard), 2.7 — Kitchen Display System, 2.8 — Basic Analytics (+1 more)

### Community 57 - "DineFlow — Subscription Model"
Cohesion: 0.09
Nodes (22): Billing Cycle Options, Billing Mechanics, DineFlow — Subscription Model, Downgrade Execution (Day 14), Enforcement Layers, Feature Flag System, Future: Platform License, Grace Period & Downgrade Automation (+14 more)

### Community 58 - "Visual Regression & Before/After Comparison"
Cohesion: 0.29
Nodes (6): 1. Menu Items Table — Status Column & Quick Actions Overlap, 2. TopBar Global Search & KDS Pill Squeeze, 3. TopBar Mobile Title Truncation, 4. Mobile Touch Targets (WCAG 44×44px Standard), 5. Live KDS Order Card Table Name, Visual Regression & Before/After Comparison

### Community 59 - "tasks/route.ts"
Cohesion: 0.29
Nodes (14): dynamic, GET(), PATCH(), POST(), revalidate, countActiveTasksForStaff(), findAvailableHousekeeper(), getTasksStore() (+6 more)

### Community 60 - "Collections"
Cohesion: 0.13
Nodes (15): Collection: `audit_logs`, Collection: `categories`, Collection: `locations`, Collection: `menu_items`, Collection: `menus`, Collection: `modifier_groups`, Collection: `notifications`, Collection: `orders` (+7 more)

### Community 61 - "useAuthStore"
Cohesion: 0.06
Nodes (57): DashboardLayout(), DashboardOverviewPage(), getStayMetrics(), RoomsDirectoryPage(), TablesManagementPage(), RootLoading(), PlatformLayout(), CATEGORY_CONFIG (+49 more)

### Community 62 - ".LogMessage"
Cohesion: 0.20
Nodes (9): BuildFeedbackRequestMessage(), BuildKitchenReadyMessage(), BuildOrderConfirmationMessage(), MessageLog, MessageStatus, OrderConfirmationData, TemplateType, WorkforceCheckInInput (+1 more)

### Community 63 - "DineFlow — Feature Roadmap"
Cohesion: 0.10
Nodes (21): 2A — Business Onboarding, 2B — Menu Management, 2C — QR Code System, 2D — Customer Ordering Experience, 2E — Order Management (Staff Dashboard), 2F — Kitchen Display System, 2G — Basic Analytics, Cross-Phase Dependencies Map (+13 more)

### Community 64 - "DineFlow — Product Vision"
Cohesion: 0.14
Nodes (13): Business Metrics (12-Month Targets), Competitive Landscape, Customer Experience Metrics, DineFlow — Product Vision, Long-Term Vision (3–5 Years), Mission, Primary Segments, Product Metrics (+5 more)

### Community 65 - "video/page.tsx"
Cohesion: 0.12
Nodes (12): VideoType, AIPresenter(), AIPresenterProps, defaultDineFlowPromoProps, DineFlowPromo(), DineFlowPromoProps, defaultQROrderingDemoProps, QROrderingDemo() (+4 more)

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

### Community 74 - "Setup"
Cohesion: 0.13
Nodes (5): AIHandler, OrderHandler, Auth(), RateLimit(), Setup()

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

### Community 79 - "Service"
Cohesion: 0.17
Nodes (8): NewTableHandler(), BulkCreateRoomsRequest, CreateTableRequest, UpdateTableStatusRequest, LocationType, Service, Table, TableStatus

### Community 80 - "generate-logo/route.ts"
Cohesion: 0.24
Nodes (11): ACTIVE_GEMINI_MODELS, ARCHETYPE_CONFIGS, createArchetypeLogo(), generateArchetypeProceduralSvg(), GenerateLogoRequest, generateWithGemini(), LogoVariation, maxDuration (+3 more)

### Community 81 - "Service"
Cohesion: 0.24
Nodes (6): CategoryShare, HourlyPoint, OverviewMetrics, Service, TopItemMetric, NewAnalyticsHandler()

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

### Community 86 - "NewScope"
Cohesion: 0.07
Nodes (17): CalculateDistanceMeters(), TestCalculateDistanceMeters(), NewScope(), NewStaffHandler(), Service, NotificationEmitter, Service, AttendanceRecord (+9 more)

### Community 87 - "server/main.go"
Cohesion: 0.05
Nodes (55): corsMiddleware(), Health(), SetHealthDeps(), Version(), NewMenuHandler(), NewPlatformHandler(), ByIP(), ByIPAndRoute() (+47 more)

### Community 88 - "DineFlow Frontend Specialist Agent (`dineflow-frontend`)"
Cohesion: 0.18
Nodes (10): 1. 21st.dev Design System Compliance, 2. Viewport & Breakpoint Testing, 3. Mobile Viewport Optimization Rules, 4. Dual-Theme Contrast Invariant, Core UI/UX & Design Invariants, DineFlow Frontend Specialist Agent (`dineflow-frontend`), Pre-Implementation Audit Protocol, Quality & Validation Checklist (+2 more)

### Community 115 - "github.com/gin-gonic/gin.HandlerFunc"
Cohesion: 0.17
Nodes (24): main(), testCORSOriginDefense(), testMetaWebhookHMACSignature(), testNoSQLInjectionInBody(), testNoSQLInjectionInQueryParams(), testRequestIDTracing(), testSecurityHeaders(), ChefOrAbove() (+16 more)

### Community 117 - "menu-nlp-engine.ts"
Cohesion: 0.15
Nodes (21): callGeminiVision(), GEMINI_MODELS, maxDuration, POST(), RawMenuItem, ScanMenuRequestBody, INDIAN_CATEGORIES, INDIAN_DISH_CATALOG (+13 more)

### Community 118 - "search/service.go"
Cohesion: 0.29
Nodes (8): SearchHandler, NewSearchHandler(), go_pkg_github_com_dineflow_api_internal_application_search, SearchFilterOptions, SearchResponse, SearchResultItem, SearchResultsGrouped, Service

### Community 119 - "DineFlow Critical User Journeys (CUJs)"
Cohesion: 0.18
Nodes (10): 12-Step QA Execution Workflow, DineFlow Critical User Journeys (CUJs), DineFlow QA & Quality Engineering Agent (`dineflow-qa`), Empirical Reporting Standards, Journey 1: Customer Dining Experience, Journey 2: Kitchen Order Display (KDS), Journey 3: Hotel Guest & In-Room Dining, Journey 4: Workforce & Operations (+2 more)

### Community 120 - "DineFlow Engineering Principles & Shared Rules"
Cohesion: 0.18
Nodes (10): 1. System Overview & Domain Invariants, 2. Core Execution Rule, 3. Anti-Duplication & Architectural Reuse, 4. Preservation of the Existing System, 5. Real Data vs. Mock Data Policy, 6. Strict Multi-Tenant Data Isolation, 7. Security Invariants, 8. Quality & Engineering Standards (+2 more)

### Community 121 - "README.md"
Cohesion: 0.20
Nodes (5): Data Retention Policy, Design Principles, DineFlow — Database Design, Entity Relationship Overview, Index Strategy Summary

### Community 122 - ".SendInvoiceViaWhatsApp"
Cohesion: 0.19
Nodes (9): CalculateGST(), GetStandardTemplates(), InterpolateTemplate(), TestBuildOrderConfirmationMessage(), TestCalculateGST(), TestGetStandardTemplates(), TestInterpolateTemplate(), CustomerInvoice (+1 more)

### Community 124 - "response.go"
Cohesion: 0.12
Nodes (15): clearRefreshTokenCookie(), AuthHandler, setRefreshTokenCookie(), GetTokenID(), PlanLimitMiddleware(), Conflict(), FeatureNotAvailable(), Forbidden() (+7 more)

### Community 125 - "logs/route.ts"
Cohesion: 0.50
Nodes (4): dynamic, GET(), revalidate, getWhatsAppLogs()

### Community 126 - "extend-stay/route.ts"
Cohesion: 0.38
Nodes (6): dynamic, GET(), getExtensionStore(), POST(), revalidate, StayExtensionRecord

### Community 127 - "Maker"
Cohesion: 0.30
Nodes (7): Maker, NewMaker(), TestTokenMaker(), go_pkg_github_com_golang_jwt_jwt_v5, jwt.RegisteredClaims, Claims, TokenType

### Community 128 - "MenuItem"
Cohesion: 0.22
Nodes (10): buildMenuItemFromUpsertRequest(), UpsertItemRequest, Category, DietaryTag, MenuItem, ModifierGroup, ModifierOption, PublicCategorySection (+2 more)

### Community 129 - "3. Non-Functional Requirements"
Cohesion: 0.10
Nodes (19): 1. User Personas, 3.1 Performance, 3.2 Scalability, 3.3 Reliability, 3.4 Security, 3.5 Accessibility, 3.6 Internationalisation, 3. Non-Functional Requirements (+11 more)

### Community 130 - ".ProcessChatbotMessage"
Cohesion: 0.21
Nodes (7): TestPhoneNumberNormalization(), IsOptOutKeyword(), NormalizePhoneNumber(), ParseRating(), TestIsOptOutKeyword(), TestParseRating(), InboundResult

### Community 131 - "Backend Invariants & Development Rules"
Cohesion: 0.20
Nodes (9): 1. Mandatory Server-Side Multi-Tenant Scoping, 2. Standardized API Response & Error Handling, 3. Database Schema Integrity & Indexing, 4. External Webhook & Integration Guidelines, Backend Invariants & Development Rules, Backend Quality & Validation Checklist, DineFlow Backend Specialist Agent (`dineflow-backend`), Directory & Architectural Organization (+1 more)

### Community 134 - "main"
Cohesion: 0.09
Nodes (26): main(), requestLogger(), runStartupCleanup(), NewService(), NewService(), NewService(), NewService(), NewService() (+18 more)

### Community 136 - "Phase 1 — Foundation & Infrastructure"
Cohesion: 0.25
Nodes (8): 1.1 — Monorepo Setup, 1.2 — Backend Foundation (Go), 1.3 — Authentication Service, 1.4 — Multi-Tenancy Middleware, 1.5 — Frontend Foundation (Next.js), 1.6 — File Storage, 1.7 — Email Service, Phase 1 — Foundation & Infrastructure

### Community 137 - "2. Functional Requirements"
Cohesion: 0.14
Nodes (14): 2.10 Staff Management, 2.11 WhatsApp Integration, 2.12 Analytics & Reporting, 2.13 Settings & Configuration, 2.1 Authentication & Multi-Tenancy, 2.2 Subscription & Billing, 2.3 Onboarding, 2.4 Menu Management (+6 more)

### Community 138 - "spotlight-cursor.tsx"
Cohesion: 0.32
Nodes (5): Component(), ComponentProps, SpotlightConfig, SpotlightCursor, useSpotlightEffect()

### Community 139 - "Service"
Cohesion: 0.11
Nodes (10): cleanGuestName(), cleanOrderNumber(), cleanTableName(), CreateNotificationRequest, Category, CreateNotificationInput, ListFilter, Notification (+2 more)

### Community 140 - "NewOTPProvider"
Cohesion: 0.22
Nodes (9): Config, redis.Client, NewMSG91Provider(), redis.Client, NewOTPProvider(), TestMSG91ProviderFallback(), net/http.Client, Config (+1 more)

### Community 141 - "dnd/route.ts"
Cohesion: 0.38
Nodes (6): DNDRecord, dynamic, GET(), getDNDStore(), POST(), revalidate

### Community 143 - "Problems Solved"
Cohesion: 0.25
Nodes (8): Problem 1 — Fragmented Software Stack, Problem 2 — High Cost of Entry, Problem 3 — App Download Friction, Problem 4 — WhatsApp Chaos, Problem 5 — No Real-time Kitchen Visibility, Problem 6 — Hotels Lack F&B Cohesion, Problem 7 — No Data for Decision Making, Problems Solved

### Community 144 - "DineFlow Orchestrator Agent (`dineflow-orchestrator`)"
Cohesion: 0.29
Nodes (6): 13-Step Orchestration Workflow, Delegation Rules & Specialist Routing, DineFlow Orchestrator Agent (`dineflow-orchestrator`), Operational Guardrails, Shared Invariants & Governance, Standard Agent Handoff Protocol

### Community 145 - "order/order.go"
Cohesion: 0.60
Nodes (3): OrderItem, OrderItemModifier, StationType

### Community 146 - "DineFlow Security & Compliance Specialist Agent (`dineflow-security`)"
Cohesion: 0.33
Nodes (5): 15-Point Security Audit Matrix, DineFlow Security & Compliance Specialist Agent (`dineflow-security`), Mandatory Tenant Isolation Verification Test, Payment & Webhook Security Invariants, Security Vulnerability Reporting Standard

### Community 147 - "DineFlow Autonomous Engineering Workflow"
Cohesion: 0.33
Nodes (5): 1. End-to-End Lifecycle Architecture, 2. The 10 Invariant Coordination Rules, 3. Standard Agent Handoff Protocol, 4. Phase-by-Phase Execution Checklist, DineFlow Autonomous Engineering Workflow

### Community 148 - "label.tsx"
Cohesion: 0.50
Nodes (4): Label, labelVariants, class-variance-authority, @radix-ui/react-label

### Community 151 - "Plan Definitions"
Cohesion: 0.40
Nodes (5): 🆓 Free — "Just Getting Started", 📈 Growth — "Scaling Up" — ₹2,999/month, 🏨 Hotel Pro — "Enterprise Hospitality" — ₹7,999/month, Plan Definitions, 🚀 Starter — "Open for Business" — ₹999/month

## Knowledge Gaps
- **829 isolated node(s):** `TestResult`, `github.com/dineflow/api`, `geminiRequest`, `geminiResponse`, `SendOTPRequest` (+824 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1013 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `video/page.tsx`, `orders/page.tsx`, `cn`, `TubesCursor`, `spotlight-cursor.tsx`, `lucide-react`, `landing-customer-journey.tsx`, `menu/page.tsx`, `[roomId]/page.tsx`, `label.tsx`, `landing-workflow.tsx`, `toast.tsx`, `web/package.json`, `useToast`, `notification-store.ts`, `useAuthStore`, `app/layout.tsx`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `RoomHandler` connect `github.com/gin-gonic/gin.Context` to `Service`, `go.mongodb.org/mongo-driver/v2/bson.ObjectID`, `Setup`, `Service`, `BadRequest`, `NewScope`, `handlers/room.go`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `Order` connect `Order` to `time.Time`, `ai/service.go`, `main`, `go.mongodb.org/mongo-driver/v2/bson.ObjectID`, `Service`, `Service`, `order/order.go`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `TestResult`, `github.com/dineflow/api`, `geminiRequest` to the rest of the system?**
  _829 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `OK` be split into smaller, more focused modules?**
  _Cohesion score 0.11989795918367346 - nodes in this community are weakly interconnected._
- **Should `time.Time` be split into smaller, more focused modules?**
  _Cohesion score 0.14482758620689656 - nodes in this community are weakly interconnected._
- **Should `orders/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._