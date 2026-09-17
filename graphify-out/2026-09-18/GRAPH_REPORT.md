# Graph Report - DineFlow  (2026-09-18)

## Corpus Check
- 268 files · ~330,949 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .example 2, .toml 1)

## Summary
- 2164 nodes · 5902 edges · 112 communities (80 shown, 32 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6b7304c2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- go_pkg_context
- lucide-react
- button.tsx
- Service
- useToast
- go_pkg_time
- go_pkg_go_mongodb_org_mongo_driver_v2_bson
- NewScope
- context.Context
- staff/page.tsx
- ai/service.go
- generate-logo/route.ts
- 2. Functional Requirements
- utils.ts
- testing.T
- config.go
- tenant-data-store.ts
- whatsapp/whatsapp.go
- go.mongodb.org/mongo-driver/v2/bson.ObjectID
- DineFlow — UI/UX Guidelines
- github.com/gin-gonic/gin.Context
- Subscription
- Order
- whatsapp/service.go
- web/package.json
- Scope
- go_pkg_fmt
- notifications/page.tsx
- handlers/room.go
- dependencies
- compilerOptions
- app/layout.tsx
- tasks
- useAuthStore
- components.json
- main
- package.json
- settings/page.tsx
- DineFlow — Development Plan
- react
- devDependencies
- scripts
- roles.ts
- 1. User Personas
- DineFlow — System Architecture
- README.md
- DineFlow — API Strategy
- eslint.config.mjs
- scripts
- web/vercel.json
- vercel.json
- peeking-chef.tsx
- 3. Non-Functional Requirements
- postcss.config.mjs
- github.com/dineflow/api
- printer.go
- time.Time
- DineFlow — Subscription Model
- label.tsx
- Frontend Architecture
- Collections
- error.tsx
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
- DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)
- Code Quality Standards
- DineFlow — Antigravity (`agy`) Workspace Rules
- Ponytail: Anti-Overengineering & YAGNI Guardrails
- Ponytail Technical Debt Analysis
- Ponytail Configuration & Status
- web/README.md
- go_pkg_errors
- next
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
- search/service.go

## God Nodes (most connected - your core abstractions)
1. `GetTenantID()` - 109 edges
2. `OK()` - 109 edges
3. `BadRequest()` - 106 edges
4. `Unauthorized()` - 105 edges
5. `react` - 100 edges
6. `useToast()` - 87 edges
7. `cn()` - 78 edges
8. `lucide-react` - 78 edges
9. `NewScope()` - 59 edges
10. `InternalError()` - 51 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `SetHealthDeps()`  [EXTRACTED]
  apps/api/cmd/server/main.go → apps/api/internal/interfaces/http/handlers/health.go
- `UpdateOrderStatusRequest` --references--> `OrderStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/order.go → apps/api/internal/domain/order/order.go
- `UpdateTaskRequest` --references--> `TaskStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/room.go → apps/api/internal/domain/room/room.go
- `UpdateTableStatusRequest` --references--> `TableStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/table.go → apps/api/internal/domain/table/table.go
- `BulkCreateRoomsRequest` --references--> `LocationType`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/table.go → apps/api/internal/domain/table/table.go

## Import Cycles
- None detected.

## Communities (112 total, 32 thin omitted)

### Community 0 - "go_pkg_context"
Cohesion: 0.12
Nodes (19): TestSearchScenarios(), NewService(), TestSearchAll_EmptyQuery(), TestSearchAll_ShortQuery(), Config, NewFirebaseTestProvider(), Config, redis.Client (+11 more)

### Community 1 - "lucide-react"
Cohesion: 0.08
Nodes (34): IMAGE_PRESETS, INITIAL_KDS_ORDERS, KdsItem, KdsOrder, MENU_PRESETS, COMPARISON_ROWS, PLANS, PlanTier (+26 more)

### Community 2 - "button.tsx"
Cohesion: 0.14
Nodes (34): DAYS, ForecastPage(), generateForecast(), getIntensityClass(), HOURS, INSIGHTS, getDescription(), MenuWriterPage() (+26 more)

### Community 3 - "Service"
Cohesion: 0.06
Nodes (35): generateSlug(), ValidatePasswordComplexity(), FeaturesForPlan(), BusinessType, Tenant, LimitsForPlan(), NewService(), redis.Client (+27 more)

### Community 4 - "useToast"
Cohesion: 0.07
Nodes (37): ForgotPasswordPage(), VerifyContent(), PricingAlertsPage(), UpsellPage(), AnalyticsPage(), KDSOrdersPage(), DashboardOverviewPage(), TablesManagementPage() (+29 more)

### Community 5 - "go_pkg_time"
Cohesion: 0.09
Nodes (26): NewService(), NewService(), TestCategoryValidation(), TestMenuItemValidation(), NewTenantHandler(), TestGenerateCode(), EmailSender, LoginRequest (+18 more)

### Community 6 - "go_pkg_go_mongodb_org_mongo_driver_v2_bson"
Cohesion: 0.05
Nodes (51): corsMiddleware(), NewAnalyticsHandler(), NewAuthHandler(), Health(), SetHealthDeps(), Version(), NewNotificationHandler(), NewOrderHandler() (+43 more)

### Community 7 - "NewScope"
Cohesion: 0.07
Nodes (19): CalculateDistanceMeters(), NewScope(), buildMenuItemFromUpsertRequest(), Category, MenuItem, Service, NotificationEmitter, Service (+11 more)

### Community 8 - "context.Context"
Cohesion: 0.13
Nodes (15): TestIndianPhoneValidation(), ValidateAndNormalizeIndianPhone(), context.Context, UpdateRoomStatusRequest, Guest, GuestStatus, HousekeepingTask, Room (+7 more)

### Community 9 - "staff/page.tsx"
Cohesion: 0.04
Nodes (60): LoginPage(), RegisterPage(), ResetPasswordPage(), DEFAULT_ROOMS, getStayMetrics(), HotelStats, RoomItem, RoomsDirectoryPage() (+52 more)

### Community 10 - "ai/service.go"
Cohesion: 0.12
Nodes (26): ChatbotMessage, ChatbotResponse, ChatTurn, ForecastDay, ForecastHour, ForecastResponse, geminiRequest, geminiResponse (+18 more)

### Community 11 - "generate-logo/route.ts"
Cohesion: 0.06
Nodes (22): ACTIVE_GEMINI_MODELS, ARCHETYPE_CONFIGS, createArchetypeLogo(), generateArchetypeProceduralSvg(), GenerateLogoRequest, generateWithGemini(), LogoVariation, maxDuration (+14 more)

### Community 12 - "2. Functional Requirements"
Cohesion: 0.14
Nodes (14): 2.10 Staff Management, 2.11 WhatsApp Integration, 2.12 Analytics & Reporting, 2.13 Settings & Configuration, 2.1 Authentication & Multi-Tenancy, 2.2 Subscription & Billing, 2.3 Onboarding, 2.4 Menu Management (+6 more)

### Community 13 - "utils.ts"
Cohesion: 0.11
Nodes (28): OrderStatus, OrderTrackingPage(), TrackingOrder, TrackingOrderItem, MenuItem, RoomInfo, RoomServiceMenuPage(), SuiteTab (+20 more)

### Community 14 - "testing.T"
Cohesion: 0.07
Nodes (39): NewService(), TestApplyLeave_Validation(), TestCreateHoliday_Validation(), TestCreateShift_Validation(), TestGeneratePayslipHTML_Structure(), TestInviteStaff_Validation(), NewService(), TestPhoneNumberNormalization() (+31 more)

### Community 15 - "config.go"
Cohesion: 0.07
Nodes (27): Client, New(), getEnv(), getEnvInt(), Load(), requireEnv(), Maker, NewMaker() (+19 more)

### Community 16 - "tenant-data-store.ts"
Cohesion: 0.08
Nodes (44): callGeminiVision(), GEMINI_MODELS, maxDuration, POST(), RawMenuItem, ScanMenuRequestBody, MenuManagementPage(), CameraMenuScannerModalProps (+36 more)

### Community 17 - "whatsapp/whatsapp.go"
Cohesion: 0.08
Nodes (36): BuildFeedbackRequestMessage(), BuildKitchenReadyMessage(), BuildOrderConfirmationMessage(), GetStandardTemplates(), TestBuildOrderConfirmationMessage(), TestGetStandardTemplates(), Campaign, CampaignStats (+28 more)

### Community 18 - "go.mongodb.org/mongo-driver/v2/bson.ObjectID"
Cohesion: 0.14
Nodes (10): Service, cleanGuestName(), go.mongodb.org/mongo-driver/v2/bson.ObjectID, CreateNotificationRequest, Category, CreateNotificationInput, Notification, Priority (+2 more)

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
Cohesion: 0.17
Nodes (11): Order, DestinationType, notifServiceIface, OrderItem, OrderItemModifier, OrderSource, OrderStatus, OrderTimeline (+3 more)

### Community 23 - "whatsapp/service.go"
Cohesion: 0.09
Nodes (20): cleanOrderNumber(), cleanTableName(), NewService(), NewService(), TestOrderCalculations(), TestOrderStatusTransitions(), GetHub(), Hub (+12 more)

### Community 24 - "web/package.json"
Cohesion: 0.09
Nodes (21): typescript, name, packageManager, private, version, axios, clsx, eslint (+13 more)

### Community 25 - "Scope"
Cohesion: 0.15
Nodes (10): ensureUpdatedAt(), ParseObjectID(), go.mongodb.org/mongo-driver/v2/bson.M, go.mongodb.org/mongo-driver/v2/mongo.Collection, go.mongodb.org/mongo-driver/v2/mongo.Cursor, go.mongodb.org/mongo-driver/v2/mongo.DeleteResult, go.mongodb.org/mongo-driver/v2/mongo.InsertManyResult, go.mongodb.org/mongo-driver/v2/mongo.InsertOneResult (+2 more)

### Community 26 - "go_pkg_fmt"
Cohesion: 0.11
Nodes (16): NewWhatsAppHandler(), go_pkg_bytes, go_pkg_crypto_rand, go_pkg_fmt, go_pkg_github_com_dineflow_api_internal_application_whatsapp, go_pkg_github_com_dineflow_api_internal_domain_whatsapp, go_pkg_github_com_joho_godotenv, go_pkg_github_com_redis_go_redis_v9 (+8 more)

### Community 27 - "notifications/page.tsx"
Cohesion: 0.11
Nodes (24): CATEGORIES, CATEGORY_META, NotificationsPage(), PRIORITIES, PRIORITY_BADGE, timeAgo(), calculateDistanceMeters(), CheckInContent() (+16 more)

### Community 28 - "handlers/room.go"
Cohesion: 0.09
Nodes (22): StorageService, NewService(), TestStorageValidation(), NewRoomHandler(), StorageHandler, NewStorageHandler(), go_pkg_crypto_sha256, go_pkg_encoding_hex (+14 more)

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
Cohesion: 0.07
Nodes (39): DashboardLayout(), PlatformLayout(), apps_web_components_auth_index_businesscategoryselector, apps_web_components_auth_index_ctabutton, apps_web_components_auth_index_forminput, apps_web_components_auth_index_passwordfield, apps_web_components_auth_index_passwordstrengthmeter, PasswordField (+31 more)

### Community 34 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 35 - "main"
Cohesion: 0.09
Nodes (26): CategoryShare, HourlyPoint, OverviewMetrics, TopItemMetric, main(), requestLogger(), runStartupCleanup(), seedDefaultData() (+18 more)

### Community 36 - "package.json"
Cohesion: 0.09
Nodes (21): description, devDependencies, prettier, turbo, typescript, engines, node, typescript (+13 more)

### Community 37 - "settings/page.tsx"
Cohesion: 0.18
Nodes (11): INITIAL_INVOICES, Invoice, SettingsPage(), BUSINESS_CATEGORIES, COLORS, GeminiLogoModal(), GeminiLogoModalProps, GENERATION_STATUS_STEPS (+3 more)

### Community 38 - "DineFlow — Development Plan"
Cohesion: 0.07
Nodes (30): 1.1 — Monorepo Setup, 1.2 — Backend Foundation (Go), 1.3 — Authentication Service, 1.4 — Multi-Tenancy Middleware, 1.5 — Frontend Foundation (Next.js), 1.6 — File Storage, 1.7 — Email Service, 2.1 — Onboarding (+22 more)

### Community 39 - "react"
Cohesion: 0.05
Nodes (44): BUSINESS_CATEGORIES, BusinessCategory, BusinessCategorySelector(), BusinessCategorySelectorProps, ChefMascot(), ChefMascotProps, CTAButton, CTAButtonProps (+36 more)

### Community 40 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti, @types/node, @types/react (+2 more)

### Community 41 - "scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, test, version

### Community 42 - "roles.ts"
Cohesion: 0.17
Nodes (8): canManageSupport(), getRoleBadgeClass(), isPlatformRole(), PLATFORM_ROLES, PlatformRole, TENANT_ROLES, TenantRole, UserRole

### Community 43 - "1. User Personas"
Cohesion: 0.15
Nodes (12): 1. User Personas, 4. User Journeys, DineFlow — Product Requirements, Journey 1 — New Restaurant Onboarding, Journey 2 — Customer Orders via QR, Journey 3 — Subscription Renewal Failure, Journey 4 — Hotel Room Service, Persona 1 — Riya (Restaurant Owner) (+4 more)

### Community 44 - "DineFlow — System Architecture"
Cohesion: 0.09
Nodes (23): Architecture Philosophy, Backend Architecture, Clean Architecture Dependency Flow, Database Architecture, Deployment Architecture, Deployment Pipeline, DineFlow — System Architecture, High-Level Architecture Diagram (+15 more)

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

### Community 52 - "3. Non-Functional Requirements"
Cohesion: 0.29
Nodes (7): 3.1 Performance, 3.2 Scalability, 3.3 Reliability, 3.4 Security, 3.5 Accessibility, 3.6 Internationalisation, 3. Non-Functional Requirements

### Community 55 - "printer.go"
Cohesion: 0.26
Nodes (12): centerText(), GenerateBillText(), GenerateKOTText(), padRow(), TestGenerateBillText(), TestGenerateKOTText(), truncate(), BillData (+4 more)

### Community 56 - "time.Time"
Cohesion: 0.19
Nodes (19): cleanPhoneNumber(), DefaultPermissionsForRole(), PublicProfile, User, IsPlatformRole(), NormalizePhoneNumber(), time.Time, UpdateStaffRequest (+11 more)

### Community 57 - "DineFlow — Subscription Model"
Cohesion: 0.07
Nodes (27): Billing Cycle Options, Billing Mechanics, DineFlow — Subscription Model, Downgrade Execution (Day 14), Enforcement Layers, Feature Flag System, 🆓 Free — "Just Getting Started", Future: Platform License (+19 more)

### Community 58 - "label.tsx"
Cohesion: 0.50
Nodes (4): Label, labelVariants, class-variance-authority, @radix-ui/react-label

### Community 59 - "Frontend Architecture"
Cohesion: 0.50
Nodes (4): Application Structure, Customer Ordering Page — SSG + ISR, Frontend Architecture, Stack

### Community 60 - "Collections"
Cohesion: 0.13
Nodes (15): Collection: `audit_logs`, Collection: `categories`, Collection: `locations`, Collection: `menu_items`, Collection: `menus`, Collection: `modifier_groups`, Collection: `notifications`, Collection: `orders` (+7 more)

### Community 62 - "Service"
Cohesion: 0.13
Nodes (9): IsOptOutKeyword(), ParseRating(), CustomerInvoice, CustomerInvoiceItem, MessageLog, MessageStatus, NotificationEmitter, Service (+1 more)

### Community 63 - "DineFlow — Feature Roadmap"
Cohesion: 0.15
Nodes (13): Cross-Phase Dependencies Map, Deliverables, Deliverables, DineFlow — Feature Roadmap, Overview, Phase 0 — Planning & Architecture, Phase 1 — Foundation & Infrastructure, Phase 3 — Hotel Module (+5 more)

### Community 64 - "DineFlow — Product Vision"
Cohesion: 0.09
Nodes (21): Business Metrics (12-Month Targets), Competitive Landscape, Customer Experience Metrics, DineFlow — Product Vision, Long-Term Vision (3–5 Years), Mission, Primary Segments, Problem 1 — Fragmented Software Stack (+13 more)

### Community 65 - "github.com/gin-gonic/gin.HandlerFunc"
Cohesion: 0.41
Nodes (12): ChefOrAbove(), FinanceAdminOrAbove(), OwnerOnly(), OwnerOrManager(), PlatformAdminOrAbove(), RequireAnyRole(), RequirePlatformRole(), RequireRole() (+4 more)

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

### Community 75 - "DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)"
Cohesion: 0.25
Nodes (7): 1. Overview & Vision, 2. End-to-End Pipeline Architecture, 3.1 Inbound WhatsApp Webhook (`POST /webhooks/whatsapp`), 3.2 Staging Collection (`menu_imports_staging`), 3. Webhook Payload & Data Schema, 4. Security, Multi-Tenancy & Privacy Controls, DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)

### Community 76 - "Code Quality Standards"
Cohesion: 0.29
Nodes (6): 1. TypeScript & React, 2. Go (Golang), 3. API & Data Access Hygiene, 4. Code Review Output Format, Code Quality Standards, Staff Engineer Code Review Runbook

### Community 78 - "DineFlow — Antigravity (`agy`) Workspace Rules"
Cohesion: 0.29
Nodes (6): Code Style, DineFlow — Antigravity (`agy`) Workspace Rules, Key Files, Project, Tech Stack, Workflow Rules

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

### Community 86 - "go_pkg_errors"
Cohesion: 0.36
Nodes (7): go_pkg_errors, BulkCreateItemsRequest, UpsertItemRequest, DietaryTag, ModifierGroup, ModifierOption, Variant

### Community 88 - "Service"
Cohesion: 0.21
Nodes (5): CreateTableRequest, LocationType, Service, Table, TableStatus

### Community 125 - "search/service.go"
Cohesion: 0.39
Nodes (6): go_pkg_regexp, SearchFilterOptions, SearchResponse, SearchResultItem, SearchResultsGrouped, Service

## Knowledge Gaps
- **657 isolated node(s):** `github.com/dineflow/api`, `geminiRequest`, `geminiResponse`, `SendOTPRequest`, `ClockInRequest` (+652 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 790 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `useAuthStore`, `button.tsx`, `lucide-react`, `useToast`, `settings/page.tsx`, `TubesCursor`, `staff/page.tsx`, `utils.ts`, `tenant-data-store.ts`, `peeking-chef.tsx`, `web/package.json`, `label.tsx`, `notifications/page.tsx`, `error.tsx`, `app/layout.tsx`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `RoomHandler` connect `github.com/gin-gonic/gin.Context` to `context.Context`, `go.mongodb.org/mongo-driver/v2/bson.ObjectID`, `handlers/room.go`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `lucide-react` to `useAuthStore`, `button.tsx`, `useToast`, `settings/page.tsx`, `react`, `staff/page.tsx`, `utils.ts`, `web/package.json`, `notifications/page.tsx`, `error.tsx`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `github.com/dineflow/api`, `geminiRequest`, `geminiResponse` to the rest of the system?**
  _657 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `go_pkg_context` be split into smaller, more focused modules?**
  _Cohesion score 0.11956521739130435 - nodes in this community are weakly interconnected._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.07955596669750231 - nodes in this community are weakly interconnected._
- **Should `button.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13978494623655913 - nodes in this community are weakly interconnected._