# Graph Report - DineFlow  (2026-09-23)

## Corpus Check
- 335 files · ~671,489 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 6, .example 2, .toml 1)

## Summary
- 2779 nodes · 7679 edges · 152 communities (113 shown, 39 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 56 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cc95fded`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- InternalError
- context.Context
- staff/page.tsx
- ref_next_link
- user.go
- go_pkg_time
- platform-store.ts
- OK
- time.Time
- 3. Comprehensive Issue Register & Auto-Fix Log
- Service
- ref_next_server
- Client
- useToast
- testing.T
- config.go
- NotFound
- Service
- redisKey
- DineFlow — UI/UX Guidelines
- BadRequest
- Subscription
- Order
- reset-password/page.tsx
- web/package.json
- Scope
- forecast/page.tsx
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
- Hub
- devDependencies
- scripts
- Service
- lucide-react
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
- react
- DineFlow — Subscription Model
- Visual Regression & Before/After Comparison
- tasks/route.ts
- Collections
- useAuthStore
- toast.tsx
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
- handlers/room.go
- DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)
- Code Quality Standards
- 2. Layout Shift & Reflow Protections
- DineFlow — Antigravity (`agy`) Workspace Rules
- 1. User Personas
- generate-logo/route.ts
- NewOTPProvider
- Ponytail: Anti-Overengineering & YAGNI Guardrails
- Ponytail Technical Debt Analysis
- Ponytail Configuration & Status
- web/README.md
- Service
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
- ai/service.go
- SubscriptionHandler
- menu-nlp-engine.ts
- 3. Non-Functional Requirements
- DineFlow Critical User Journeys (CUJs)
- DineFlow Engineering Principles & Shared Rules
- README.md
- Service
- remotion.config.ts
- Setup
- logs/route.ts
- extend-stay/route.ts
- Maker
- MenuItem
- 2. Functional Requirements
- github.com/gin-gonic/gin.HandlerFunc
- Backend Invariants & Development Rules
- deploy.sh
- gen-secrets.sh
- search.go
- table/route.ts
- response.go
- handlers/table.go
- spotlight-cursor.tsx
- go.mongodb.org/mongo-driver/v2/bson.ObjectID
- demo/page.tsx
- dnd/route.ts
- design-system.ts
- Service
- DineFlow Orchestrator Agent (`dineflow-orchestrator`)
- Phase 2 — Restaurant MVP
- DineFlow Security & Compliance Specialist Agent (`dineflow-security`)
- DineFlow Autonomous Engineering Workflow
- gemini-logo-modal.tsx
- public/route.ts
- landing-workflow.tsx
- Phase 1 — Foundation & Infrastructure

## God Nodes (most connected - your core abstractions)
1. `OK()` - 157 edges
2. `BadRequest()` - 137 edges
3. `react` - 125 edges
4. `GetTenantID()` - 113 edges
5. `Unauthorized()` - 109 edges
6. `cn()` - 103 edges
7. `lucide-react` - 95 edges
8. `useToast()` - 91 edges
9. `InternalError()` - 88 edges
10. `Button` - 62 edges

## Surprising Connections (you probably didn't know these)
- `Pre-Implementation Audit Protocol` --references--> `useTenantData()`  [INFERRED]
  .agents/agents/dineflow-frontend.md → apps/web/lib/stores/tenant-data-store.ts
- `main()` --calls--> `seedDefaultData()`  [INFERRED]
  apps/api/cmd/server/main.go → apps/api/cmd/server/seed.go
- `main()` --calls--> `SetHealthDeps()`  [EXTRACTED]
  apps/api/cmd/server/main.go → apps/api/internal/interfaces/http/handlers/health.go
- `UpdateRoomStatusRequest` --references--> `RoomStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/room.go → apps/api/internal/domain/room/room.go
- `UpdateTaskRequest` --references--> `TaskStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/room.go → apps/api/internal/domain/room/room.go

## Import Cycles
- None detected.

## Communities (152 total, 39 thin omitted)

### Community 0 - "InternalError"
Cohesion: 0.12
Nodes (3): PlatformHandler, InternalError(), OKWithMeta()

### Community 1 - "context.Context"
Cohesion: 0.10
Nodes (12): cleanPhoneNumber(), NewScope(), context.Context, go.mongodb.org/mongo-driver/v2/mongo.Collection, Service, NotificationEmitter, Service, AttendanceRecord (+4 more)

### Community 2 - "staff/page.tsx"
Cohesion: 0.10
Nodes (19): CATEGORIES, CATEGORY_META, PRIORITIES, PRIORITY_BADGE, AttendanceRecord, BankDetails, calculateDistanceM(), EmergencyContact (+11 more)

### Community 3 - "ref_next_link"
Cohesion: 0.05
Nodes (36): DashboardErrorProps, SettingsPage(), OrderStatus, OrderTrackingPage(), TrackingOrder, TrackingOrderItem, HOTEL_LOADING_MESSAGES, HOTEL_STEPS (+28 more)

### Community 4 - "user.go"
Cohesion: 0.15
Nodes (22): DefaultPermissionsForRole(), PublicProfile, User, IsPlatformRole(), UpdateStaffRequest, InviteStaffInput, UpdateEmployeeProfileInput, AttendanceStatus (+14 more)

### Community 5 - "go_pkg_time"
Cohesion: 0.11
Nodes (37): ParseObjectID(), SendOTPRequest, go_pkg_context, go_pkg_crypto_rand, go_pkg_encoding_csv, go_pkg_errors, go_pkg_fmt, go_pkg_github_com_dineflow_api_internal_domain_menu (+29 more)

### Community 6 - "platform-store.ts"
Cohesion: 0.09
Nodes (22): AuditLogEntry, BusinessType, ClientStatus, DashboardMetrics, FeatureFlagDefinition, INITIAL_AUDIT_LOGS, INITIAL_CLIENTS, INITIAL_FEATURE_FLAGS (+14 more)

### Community 7 - "OK"
Cohesion: 0.12
Nodes (4): StaffHandler, TenantHandler, GetUserID(), OK()

### Community 8 - "time.Time"
Cohesion: 0.09
Nodes (18): ValidateAndNormalizeIndianPhone(), time.Time, CreateTaskRequest, CheckInInput, ExtensionStatus, Guest, GuestStatus, HousekeepingTask (+10 more)

### Community 9 - "3. Comprehensive Issue Register & Auto-Fix Log"
Cohesion: 0.11
Nodes (18): 1. Executive Summary & Audit Metrics, 2. Multi-Viewport Testing Matrix, 3. Comprehensive Issue Register & Auto-Fix Log, 4. Mandatory Quality Checklist Verification, 5. Deliverables & PR Details, End-to-End Frontend QA Visual & Responsive Audit Report, [ISSUE-001] Menu Management: "In Stock" Status Badge Overlapping Edit Button, [ISSUE-002] TopBar: Global Search Input Compressed at Tablet Landscape (+10 more)

### Community 10 - "Service"
Cohesion: 0.13
Nodes (23): ChatbotMessage, ChatbotResponse, ChatTurn, ForecastDay, ForecastHour, ForecastResponse, MenuDescriptionRequest, MenuDescriptionResponse (+15 more)

### Community 11 - "ref_next_server"
Cohesion: 0.13
Nodes (7): dynamic, revalidate, dynamic, dynamic, revalidate, config, ref_next_server

### Community 13 - "useToast"
Cohesion: 0.05
Nodes (61): LoginPage(), getDescription(), MenuWriterPage(), PricingAlertsPage(), UpsellPage(), MenuManagementPage(), getStayMetrics(), RoomsDirectoryPage() (+53 more)

### Community 14 - "testing.T"
Cohesion: 0.05
Nodes (53): TestSearchScenarios(), NewService(), TestSearchAll_EmptyQuery(), TestSearchAll_ShortQuery(), NewService(), TestApplyLeave_Validation(), TestCreateHoliday_Validation(), TestCreateShift_Validation() (+45 more)

### Community 15 - "config.go"
Cohesion: 0.16
Nodes (18): getEnv(), getEnvInt(), Load(), requireEnv(), AIConfig, AppConfig, Config, EmailConfig (+10 more)

### Community 16 - "NotFound"
Cohesion: 0.15
Nodes (3): AuthHandler, OrderHandler, NotFound()

### Community 17 - "Service"
Cohesion: 0.07
Nodes (24): CalculateHealthScore(), AnnouncementInfo, AuditActor, AuditLogRecord, BusinessType, ClientStatus, DashboardMetrics, FeatureFlagDefinition (+16 more)

### Community 18 - "redisKey"
Cohesion: 0.16
Nodes (10): Config, redis.Client, NewFirebaseTestProvider(), GenerateCode(), redis.Client, NewService(), redisKey(), TestGenerateCode() (+2 more)

### Community 19 - "DineFlow — UI/UX Guidelines"
Cohesion: 0.04
Nodes (44): 10. Responsive Breakpoints, 11. Iconography, 12. Empty States, 13. Toast / Notification System, 1. Design Philosophy, 2. Color Palette, 3. Typography, 4. Spacing System (+36 more)

### Community 20 - "BadRequest"
Cohesion: 0.08
Nodes (11): AnalyticsHandler, MenuHandler, NotificationHandler, RoomHandler, TableHandler, GetRole(), GetTenantID(), BadRequest() (+3 more)

### Community 21 - "Subscription"
Cohesion: 0.15
Nodes (15): NewService(), FormatPlanName(), GetLimits(), NewSubscriptionHandler(), AdminOverrideRequest, CheckoutRequest, BillingCycle, CheckoutSessionResult (+7 more)

### Community 22 - "Order"
Cohesion: 0.12
Nodes (11): Service, Order, UpdateOrderStatusRequest, DestinationType, OrderItem, OrderItemModifier, OrderSource, OrderStatus (+3 more)

### Community 23 - "reset-password/page.tsx"
Cohesion: 0.06
Nodes (35): ForgotPasswordContent(), Step, RegisterPage(), ResetPasswordContent(), VerifyContent(), CTAButton, CTAButtonProps, apps_web_components_auth_index_businesscategoryselector (+27 more)

### Community 24 - "web/package.json"
Cohesion: 0.08
Nodes (24): Player, typescript, name, packageManager, private, version, axios, clsx (+16 more)

### Community 25 - "Scope"
Cohesion: 0.21
Nodes (8): ensureUpdatedAt(), go.mongodb.org/mongo-driver/v2/bson.M, go.mongodb.org/mongo-driver/v2/mongo.Cursor, go.mongodb.org/mongo-driver/v2/mongo.DeleteResult, go.mongodb.org/mongo-driver/v2/mongo.InsertManyResult, go.mongodb.org/mongo-driver/v2/mongo.InsertOneResult, go.mongodb.org/mongo-driver/v2/mongo.UpdateResult, Scope

### Community 26 - "forecast/page.tsx"
Cohesion: 0.38
Nodes (6): DAYS, ForecastPage(), generateForecast(), getIntensityClass(), HOURS, INSIGHTS

### Community 27 - "notification-center.tsx"
Cohesion: 0.12
Nodes (22): NotificationsPage(), timeAgo(), calculateDistanceMeters(), CheckInContent(), CheckInResult, TokenInfo, CATEGORIES, CATEGORY_META (+14 more)

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

### Community 35 - "main"
Cohesion: 0.12
Nodes (20): corsMiddleware(), main(), requestLogger(), runStartupCleanup(), NewService(), NewService(), NewService(), NewService() (+12 more)

### Community 36 - "package.json"
Cohesion: 0.08
Nodes (23): description, devDependencies, prettier, puppeteer-core, turbo, typescript, engines, node (+15 more)

### Community 37 - "github.com/gin-gonic/gin.Context"
Cohesion: 0.11
Nodes (6): AIHandler, WhatsAppHandler, ByTenant(), PlanLimitMiddleware(), PlanLimitExceeded(), github.com/gin-gonic/gin.Context

### Community 38 - "DineFlow — Development Plan"
Cohesion: 0.15
Nodes (13): Definition of Done, DineFlow — Development Plan, E2E Tests (Playwright), How to Read This Plan, Integration Tests, Performance Tests (k6), Phase 0 — Planning & Architecture, Phase 3 — Hotel Module (+5 more)

### Community 39 - "Hub"
Cohesion: 0.17
Nodes (9): NewService(), NewService(), GetHub(), Hub, NewNotificationHandler(), NewOrderHandler(), notifServiceIface, Service (+1 more)

### Community 40 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti, @types/node, @types/react (+2 more)

### Community 41 - "scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, test, version

### Community 42 - "Service"
Cohesion: 0.04
Nodes (50): Service, CalculateDistanceMeters(), BuildFeedbackRequestMessage(), BuildKitchenReadyMessage(), BuildOrderConfirmationMessage(), CalculateGST(), GetStandardTemplates(), InterpolateTemplate() (+42 more)

### Community 43 - "lucide-react"
Cohesion: 0.07
Nodes (76): MOCK_DESCRIPTIONS, SAMPLE_ITEMS, TONES, AI_TOOLS, STATS, ALERT_CONFIG, ALERTS, SEVERITY_COLOR (+68 more)

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
Cohesion: 0.16
Nodes (10): NewService(), ValidatePasswordComplexity(), NewAuthHandler(), OTPProvider, NormalizePhone(), AuthResponse, EmailSender, LoginRequest (+2 more)

### Community 52 - "OpenWAProvider"
Cohesion: 0.08
Nodes (13): NewMetaCloudProvider(), NewOpenWAProvider(), CleanPhoneNumber(), FormatChatID(), SessionStatus, net/http.Request, sync.RWMutex, MetaCloudConfig (+5 more)

### Community 55 - "printer.go"
Cohesion: 0.26
Nodes (12): centerText(), GenerateBillText(), GenerateKOTText(), padRow(), TestGenerateBillText(), TestGenerateKOTText(), truncate(), BillData (+4 more)

### Community 56 - "react"
Cohesion: 0.05
Nodes (54): BUSINESS_CATEGORIES, BusinessCategory, BusinessCategorySelector(), BusinessCategorySelectorProps, ChefMascot(), ChefMascotProps, FloatingCard(), FloatingCardProps (+46 more)

### Community 57 - "DineFlow — Subscription Model"
Cohesion: 0.07
Nodes (27): Billing Cycle Options, Billing Mechanics, DineFlow — Subscription Model, Downgrade Execution (Day 14), Enforcement Layers, Feature Flag System, 🆓 Free — "Just Getting Started", Future: Platform License (+19 more)

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
Nodes (56): AnalyticsPage(), DashboardLayout(), KDSOrdersPage(), DashboardOverviewPage(), TablesManagementPage(), RootLoading(), PlatformLayout(), PricingPage() (+48 more)

### Community 62 - "toast.tsx"
Cohesion: 0.10
Nodes (32): CameraMenuScannerModal(), CameraMenuScannerModalProps, CapturedPage, MenuBulkToolbar(), MenuBulkToolbarProps, MenuStagingPreviewModal(), MenuStagingPreviewModalProps, MenuUploadModal() (+24 more)

### Community 63 - "DineFlow — Feature Roadmap"
Cohesion: 0.10
Nodes (21): 2A — Business Onboarding, 2B — Menu Management, 2C — QR Code System, 2D — Customer Ordering Experience, 2E — Order Management (Staff Dashboard), 2F — Kitchen Display System, 2G — Basic Analytics, Cross-Phase Dependencies Map (+13 more)

### Community 64 - "DineFlow — Product Vision"
Cohesion: 0.10
Nodes (21): Business Metrics (12-Month Targets), Competitive Landscape, Customer Experience Metrics, DineFlow — Product Vision, Long-Term Vision (3–5 Years), Mission, Primary Segments, Problem 1 — Fragmented Software Stack (+13 more)

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

### Community 74 - "handlers/room.go"
Cohesion: 0.14
Nodes (13): NewRoomHandler(), go_pkg_encoding_base64, go_pkg_github_com_dineflow_api_internal_domain_room, ApproveExtensionRequestInput, BulkRoomsRequest, CreateRoomRequest, PublicAmenityRequest, PublicExtendStayRequest (+5 more)

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

### Community 79 - "1. User Personas"
Cohesion: 0.33
Nodes (6): 1. User Personas, Persona 1 — Riya (Restaurant Owner), Persona 2 — Arjun (Hotel Operations Manager), Persona 3 — Chef Meena (Head Chef / Kitchen Staff), Persona 4 — Kai (Food Truck Operator), Persona 5 — Priya (Customer / Guest)

### Community 80 - "generate-logo/route.ts"
Cohesion: 0.24
Nodes (11): ACTIVE_GEMINI_MODELS, ARCHETYPE_CONFIGS, createArchetypeLogo(), generateArchetypeProceduralSvg(), GenerateLogoRequest, generateWithGemini(), LogoVariation, maxDuration (+3 more)

### Community 81 - "NewOTPProvider"
Cohesion: 0.20
Nodes (9): Config, redis.Client, NewMSG91Provider(), redis.Client, NewOTPProvider(), TestMSG91ProviderFallback(), net/http.Client, Config (+1 more)

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

### Community 87 - "server/main.go"
Cohesion: 0.05
Nodes (56): Health(), SetHealthDeps(), Version(), NewMenuHandler(), ByIP(), ByIPAndRoute(), TestRoutesSetup_NoPanic(), go_pkg_github_com_dineflow_api_internal_application_ai (+48 more)

### Community 88 - "DineFlow Frontend Specialist Agent (`dineflow-frontend`)"
Cohesion: 0.18
Nodes (10): 1. 21st.dev Design System Compliance, 2. Viewport & Breakpoint Testing, 3. Mobile Viewport Optimization Rules, 4. Dual-Theme Contrast Invariant, Core UI/UX & Design Invariants, DineFlow Frontend Specialist Agent (`dineflow-frontend`), Pre-Implementation Audit Protocol, Quality & Validation Checklist (+2 more)

### Community 115 - "ai/service.go"
Cohesion: 0.09
Nodes (31): geminiRequest, geminiResponse, main(), testCORSOriginDefense(), testMetaWebhookHMACSignature(), testNoSQLInjectionInBody(), testNoSQLInjectionInQueryParams(), testRequestIDTracing() (+23 more)

### Community 117 - "menu-nlp-engine.ts"
Cohesion: 0.15
Nodes (21): callGeminiVision(), GEMINI_MODELS, maxDuration, POST(), RawMenuItem, ScanMenuRequestBody, INDIAN_CATEGORIES, INDIAN_DISH_CATALOG (+13 more)

### Community 118 - "3. Non-Functional Requirements"
Cohesion: 0.29
Nodes (7): 3.1 Performance, 3.2 Scalability, 3.3 Reliability, 3.4 Security, 3.5 Accessibility, 3.6 Internationalisation, 3. Non-Functional Requirements

### Community 119 - "DineFlow Critical User Journeys (CUJs)"
Cohesion: 0.18
Nodes (10): 12-Step QA Execution Workflow, DineFlow Critical User Journeys (CUJs), DineFlow QA & Quality Engineering Agent (`dineflow-qa`), Empirical Reporting Standards, Journey 1: Customer Dining Experience, Journey 2: Kitchen Order Display (KDS), Journey 3: Hotel Guest & In-Room Dining, Journey 4: Workforce & Operations (+2 more)

### Community 120 - "DineFlow Engineering Principles & Shared Rules"
Cohesion: 0.18
Nodes (10): 1. System Overview & Domain Invariants, 2. Core Execution Rule, 3. Anti-Duplication & Architectural Reuse, 4. Preservation of the Existing System, 5. Real Data vs. Mock Data Policy, 6. Strict Multi-Tenant Data Isolation, 7. Security Invariants, 8. Quality & Engineering Standards (+2 more)

### Community 121 - "README.md"
Cohesion: 0.18
Nodes (5): Data Retention Policy, Design Principles, DineFlow — Database Design, Entity Relationship Overview, Index Strategy Summary

### Community 122 - "Service"
Cohesion: 0.22
Nodes (7): CategoryShare, HourlyPoint, OverviewMetrics, Service, TopItemMetric, NewService(), NewAnalyticsHandler()

### Community 124 - "Setup"
Cohesion: 0.18
Nodes (8): clearRefreshTokenCookie(), AuthHandler, setRefreshTokenCookie(), Auth(), GetTokenID(), RateLimit(), Setup(), contextKey

### Community 125 - "logs/route.ts"
Cohesion: 0.50
Nodes (4): dynamic, GET(), revalidate, getWhatsAppLogs()

### Community 126 - "extend-stay/route.ts"
Cohesion: 0.38
Nodes (6): dynamic, GET(), getExtensionStore(), POST(), revalidate, StayExtensionRecord

### Community 127 - "Maker"
Cohesion: 0.18
Nodes (9): Maker, NewMaker(), TestTokenMaker(), go_pkg_github_com_golang_jwt_jwt_v5, time.Duration, jwt.RegisteredClaims, RateLimitResult, Claims (+1 more)

### Community 128 - "MenuItem"
Cohesion: 0.26
Nodes (10): buildMenuItemFromUpsertRequest(), UpsertItemRequest, Category, DietaryTag, MenuItem, ModifierGroup, ModifierOption, PublicCategorySection (+2 more)

### Community 129 - "2. Functional Requirements"
Cohesion: 0.10
Nodes (20): 2.10 Staff Management, 2.11 WhatsApp Integration, 2.12 Analytics & Reporting, 2.13 Settings & Configuration, 2.1 Authentication & Multi-Tenancy, 2.2 Subscription & Billing, 2.3 Onboarding, 2.4 Menu Management (+12 more)

### Community 130 - "github.com/gin-gonic/gin.HandlerFunc"
Cohesion: 0.41
Nodes (12): ChefOrAbove(), FinanceAdminOrAbove(), OwnerOnly(), OwnerOrManager(), PlatformAdminOrAbove(), RequireAnyRole(), RequirePlatformRole(), RequireRole() (+4 more)

### Community 131 - "Backend Invariants & Development Rules"
Cohesion: 0.20
Nodes (9): 1. Mandatory Server-Side Multi-Tenant Scoping, 2. Standardized API Response & Error Handling, 3. Database Schema Integrity & Indexing, 4. External Webhook & Integration Guidelines, Backend Invariants & Development Rules, Backend Quality & Validation Checklist, DineFlow Backend Specialist Agent (`dineflow-backend`), Directory & Architectural Organization (+1 more)

### Community 134 - "search.go"
Cohesion: 0.25
Nodes (8): SearchHandler, NewSearchHandler(), go_pkg_github_com_dineflow_api_internal_application_search, SearchFilterOptions, SearchResponse, SearchResultItem, SearchResultsGrouped, Service

### Community 136 - "response.go"
Cohesion: 0.24
Nodes (8): Conflict(), FeatureNotAvailable(), NoContent(), TooManyRequests(), ValidationError(), APIError, APIResponse, Meta

### Community 137 - "handlers/table.go"
Cohesion: 0.32
Nodes (7): go_pkg_github_com_dineflow_api_internal_application_table, BulkCreateRoomsRequest, CreateTableRequest, ToggleDNDRequest, UpdateTableStatusRequest, LocationType, TableStatus

### Community 138 - "spotlight-cursor.tsx"
Cohesion: 0.32
Nodes (5): Component(), ComponentProps, SpotlightConfig, SpotlightCursor, useSpotlightEffect()

### Community 139 - "go.mongodb.org/mongo-driver/v2/bson.ObjectID"
Cohesion: 0.12
Nodes (13): cleanGuestName(), cleanOrderNumber(), cleanTableName(), Service, go.mongodb.org/mongo-driver/v2/bson.ObjectID, CreateNotificationRequest, Category, CreateNotificationInput (+5 more)

### Community 141 - "dnd/route.ts"
Cohesion: 0.38
Nodes (6): DNDRecord, dynamic, GET(), getDNDStore(), POST(), revalidate

### Community 143 - "Service"
Cohesion: 0.31
Nodes (4): NewService(), Service, go_pkg_github_com_resend_resend_go_v2, resend.Client

### Community 144 - "DineFlow Orchestrator Agent (`dineflow-orchestrator`)"
Cohesion: 0.29
Nodes (6): 13-Step Orchestration Workflow, Delegation Rules & Specialist Routing, DineFlow Orchestrator Agent (`dineflow-orchestrator`), Operational Guardrails, Shared Invariants & Governance, Standard Agent Handoff Protocol

### Community 145 - "Phase 2 — Restaurant MVP"
Cohesion: 0.22
Nodes (9): 2.1 — Onboarding, 2.2 — Menu Management, 2.3 — Table & QR Code Management, 2.4 — Customer Ordering Experience, 2.5 — WebSocket / Real-Time, 2.6 — Order Management (Staff Dashboard), 2.7 — Kitchen Display System, 2.8 — Basic Analytics (+1 more)

### Community 146 - "DineFlow Security & Compliance Specialist Agent (`dineflow-security`)"
Cohesion: 0.33
Nodes (5): 15-Point Security Audit Matrix, DineFlow Security & Compliance Specialist Agent (`dineflow-security`), Mandatory Tenant Isolation Verification Test, Payment & Webhook Security Invariants, Security Vulnerability Reporting Standard

### Community 147 - "DineFlow Autonomous Engineering Workflow"
Cohesion: 0.33
Nodes (5): 1. End-to-End Lifecycle Architecture, 2. The 10 Invariant Coordination Rules, 3. Standard Agent Handoff Protocol, 4. Phase-by-Phase Execution Checklist, DineFlow Autonomous Engineering Workflow

### Community 148 - "gemini-logo-modal.tsx"
Cohesion: 0.25
Nodes (7): BUSINESS_CATEGORIES, COLORS, GeminiLogoModal(), GeminiLogoModalProps, GENERATION_STATUS_STEPS, LogoVariation, VIBES

### Community 151 - "Phase 1 — Foundation & Infrastructure"
Cohesion: 0.25
Nodes (8): 1.1 — Monorepo Setup, 1.2 — Backend Foundation (Go), 1.3 — Authentication Service, 1.4 — Multi-Tenancy Middleware, 1.5 — Frontend Foundation (Next.js), 1.6 — File Storage, 1.7 — Email Service, Phase 1 — Foundation & Infrastructure

## Knowledge Gaps
- **822 isolated node(s):** `TestResult`, `github.com/dineflow/api`, `geminiRequest`, `geminiResponse`, `SendOTPRequest` (+817 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1004 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `video/page.tsx`, `staff/page.tsx`, `ref_next_link`, `TubesCursor`, `spotlight-cursor.tsx`, `lucide-react`, `useToast`, `gemini-logo-modal.tsx`, `landing-workflow.tsx`, `reset-password/page.tsx`, `web/package.json`, `forecast/page.tsx`, `notification-center.tsx`, `useAuthStore`, `toast.tsx`, `app/layout.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `RoomHandler` connect `BadRequest` to `context.Context`, `time.Time`, `handlers/room.go`, `go.mongodb.org/mongo-driver/v2/bson.ObjectID`, `Service`, `NotFound`, `Setup`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `Service` connect `Service` to `context.Context`, `main`, `go_pkg_time`, `github.com/gin-gonic/gin.Context`, `testing.T`, `NewOTPProvider`, `ai/service.go`, `OpenWAProvider`, `BadRequest`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `TestResult`, `github.com/dineflow/api`, `geminiRequest` to the rest of the system?**
  _822 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `InternalError` be split into smaller, more focused modules?**
  _Cohesion score 0.11951219512195121 - nodes in this community are weakly interconnected._
- **Should `context.Context` be split into smaller, more focused modules?**
  _Cohesion score 0.10064935064935066 - nodes in this community are weakly interconnected._
- **Should `staff/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09956709956709957 - nodes in this community are weakly interconnected._