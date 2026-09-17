# Graph Report - DineFlow  (2026-09-17)

## Corpus Check
- 235 files · ~270,098 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .example 2, .toml 1)

## Summary
- 1840 nodes · 4598 edges · 115 communities (84 shown, 31 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b3c92ff2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- github.com/gin-gonic/gin.Context
- cn
- button.tsx
- tenant/tenant.go
- useToast
- go_pkg_time
- go_pkg_github_com_gin_gonic_gin
- context.Context
- time.Time
- DineFlow — Questions, Assumptions & Risks
- ai/service.go
- generate-logo/route.ts
- main
- rooms/page.tsx
- testing.T
- config.go
- tenant-data-store.ts
- Client
- Service
- DineFlow — UI/UX Guidelines
- 2. Functional Requirements
- Subscription
- Order
- useAuthStore
- web/package.json
- Scope
- handlers/room.go
- Service
- storage/storage.go
- dependencies
- compilerOptions
- app/layout.tsx
- tasks
- MenuItem
- components.json
- react
- package.json
- Hub
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
- ui/pricing.tsx
- User
- DineFlow — Subscription Model
- server/main.go
- NormalizePhone
- Collections
- analytics/service.go
- handlers/menu.go
- DineFlow — Feature Roadmap
- DineFlow — Product Vision
- README.md
- DineFlow
- Audit Scope & Checklist
- Responsive Verification Checklist
- Security Checklist
- NewFirebaseTestProvider
- Architectural Assessment Dimensions
- Review Pillars
- Phase 2 — Restaurant MVP
- Problems Solved
- DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)
- Code Quality Standards
- MSG91Provider
- DineFlow — Antigravity (`agy`) Workspace Rules
- handlers/storage.go
- handlers/whatsapp.go
- theme-provider.tsx
- Ponytail: Anti-Overengineering & YAGNI Guardrails
- Ponytail Technical Debt Analysis
- Ponytail Configuration & Status
- web/README.md
- Billing Mechanics
- Feature Flag System
- White-Label Strategy
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

## God Nodes (most connected - your core abstractions)
1. `OK()` - 78 edges
2. `react` - 77 edges
3. `GetTenantID()` - 76 edges
4. `BadRequest()` - 76 edges
5. `Unauthorized()` - 73 edges
6. `useToast()` - 71 edges
7. `cn()` - 66 edges
8. `lucide-react` - 56 edges
9. `main()` - 41 edges
10. `NewScope()` - 39 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `seedDefaultData()`  [INFERRED]
  apps/api/cmd/server/main.go → apps/api/cmd/server/seed.go
- `TestIndianPhoneValidation()` --calls--> `ValidateAndNormalizeIndianPhone()`  [INFERRED]
  apps/api/internal/domain/room/room_test.go → apps/api/internal/domain/room/room.go
- `UpdateTableStatusRequest` --references--> `TableStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/table.go → apps/api/internal/domain/table/table.go
- `BulkCreateRoomsRequest` --references--> `LocationType`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/table.go → apps/api/internal/domain/table/table.go
- `RequireRole()` --calls--> `GetRole()`  [INFERRED]
  apps/api/internal/interfaces/http/middleware/rbac.go → apps/api/internal/interfaces/http/middleware/auth.go

## Import Cycles
- None detected.

## Communities (115 total, 31 thin omitted)

### Community 0 - "github.com/gin-gonic/gin.Context"
Cohesion: 0.06
Nodes (44): AIHandler, AnalyticsHandler, clearRefreshTokenCookie(), AuthHandler, AuthHandler, setRefreshTokenCookie(), MenuHandler, NotificationHandler (+36 more)

### Community 1 - "cn"
Cohesion: 0.05
Nodes (41): SettingsPage(), OrderStatus, OrderTrackingPage(), TrackingOrder, TrackingOrderItem, ChefMascot(), ChefMascotProps, FloatingCard() (+33 more)

### Community 2 - "button.tsx"
Cohesion: 0.12
Nodes (35): INITIAL_TENANTS, TenantRecord, getDescription(), MenuWriterPage(), MOCK_DESCRIPTIONS, SAMPLE_ITEMS, TONES, AI_TOOLS (+27 more)

### Community 3 - "tenant/tenant.go"
Cohesion: 0.20
Nodes (18): seedDefaultData(), generateSlug(), FeaturesForPlan(), BusinessType, Tenant, LimitsForPlan(), RegisterRequest, Address (+10 more)

### Community 4 - "useToast"
Cohesion: 0.08
Nodes (42): PlatformAdminPage(), ForgotPasswordPage(), ResetPasswordPage(), VerifyContent(), PricingAlertsPage(), UpsellPage(), AnalyticsPage(), IMAGE_PRESETS (+34 more)

### Community 5 - "go_pkg_time"
Cohesion: 0.11
Nodes (34): SendOTPRequest, go_pkg_bytes, go_pkg_context, go_pkg_crypto_rand, go_pkg_errors, go_pkg_fmt, go_pkg_github_com_dineflow_api_internal_domain_menu, go_pkg_github_com_dineflow_api_internal_domain_notification (+26 more)

### Community 6 - "go_pkg_github_com_gin_gonic_gin"
Cohesion: 0.10
Nodes (18): NewAnalyticsHandler(), Health(), Version(), NewStaffHandler(), NewSubscriptionHandler(), ByIP(), ByIPAndRoute(), TestTokenMaker() (+10 more)

### Community 7 - "context.Context"
Cohesion: 0.10
Nodes (18): NewService(), FormatPlanName(), NewScope(), ParseObjectID(), context.Context, go.mongodb.org/mongo-driver/v2/bson.ObjectID, CreateTableRequest, Category (+10 more)

### Community 8 - "time.Time"
Cohesion: 0.10
Nodes (19): ValidateAndNormalizeIndianPhone(), time.Time, CreateTaskRequest, UpdateRoomStatusRequest, UpdateTaskRequest, RateLimitResult, CheckInInput, Guest (+11 more)

### Community 9 - "DineFlow — Questions, Assumptions & Risks"
Cohesion: 0.04
Nodes (46): A1. Backend Language: Go vs. Node.js, A2. Monorepo Tool: Turborepo vs. Nx, A3. Database: MongoDB Only vs. MongoDB + PostgreSQL, A4. Frontend Framework: Next.js App Router vs. Pages Router, A5. WebSocket: Socket.io vs. Native WebSocket, B1. Free trial for new registrations, B2. How is proration handled on mid-cycle upgrades?, B3. Can a single tenant have multiple subscriptions (e.g., base plan + white-label add-on)? (+38 more)

### Community 10 - "ai/service.go"
Cohesion: 0.13
Nodes (24): ChatbotMessage, ChatbotResponse, ChatTurn, ForecastDay, ForecastHour, ForecastResponse, geminiRequest, geminiResponse (+16 more)

### Community 11 - "generate-logo/route.ts"
Cohesion: 0.06
Nodes (22): ACTIVE_GEMINI_MODELS, ARCHETYPE_CONFIGS, createArchetypeLogo(), generateArchetypeProceduralSvg(), GenerateLogoRequest, generateWithGemini(), LogoVariation, maxDuration (+14 more)

### Community 12 - "main"
Cohesion: 0.16
Nodes (8): corsMiddleware(), main(), requestLogger(), runStartupCleanup(), Client, New(), SetHealthDeps(), go.uber.org/zap.Logger

### Community 13 - "rooms/page.tsx"
Cohesion: 0.10
Nodes (33): getStayMetrics(), HotelStats, RoomItem, RoomsDirectoryPage(), getStayMetrics(), HousekeepingTask, RoomDetail, RoomDetailPage() (+25 more)

### Community 14 - "testing.T"
Cohesion: 0.05
Nodes (50): NewService(), TestCategoryValidation(), TestMenuItemValidation(), TestOrderCalculations(), TestOrderStatusTransitions(), centerText(), GenerateBillText(), GenerateKOTText() (+42 more)

### Community 15 - "config.go"
Cohesion: 0.11
Nodes (23): getEnv(), getEnvInt(), Load(), requireEnv(), Maker, NewMaker(), AIConfig, AppConfig (+15 more)

### Community 16 - "tenant-data-store.ts"
Cohesion: 0.08
Nodes (44): callGeminiVision(), GEMINI_MODELS, maxDuration, POST(), RawMenuItem, ScanMenuRequestBody, MenuManagementPage(), CameraMenuScannerModalProps (+36 more)

### Community 17 - "Client"
Cohesion: 0.16
Nodes (11): NewService(), NewService(), NewService(), NewService(), NewService(), New(), NewTenantHandler(), go.mongodb.org/mongo-driver/v2/mongo.Client (+3 more)

### Community 18 - "Service"
Cohesion: 0.19
Nodes (10): cleanGuestName(), cleanOrderNumber(), cleanTableName(), NewNotificationHandler(), CreateNotificationRequest, Category, CreateNotificationInput, Notification (+2 more)

### Community 19 - "DineFlow — UI/UX Guidelines"
Cohesion: 0.04
Nodes (44): 10. Responsive Breakpoints, 11. Iconography, 12. Empty States, 13. Toast / Notification System, 1. Design Philosophy, 2. Color Palette, 3. Typography, 4. Spacing System (+36 more)

### Community 20 - "2. Functional Requirements"
Cohesion: 0.06
Nodes (33): 1. User Personas, 2.10 Staff Management, 2.11 WhatsApp Integration, 2.12 Analytics & Reporting, 2.13 Settings & Configuration, 2.1 Authentication & Multi-Tenancy, 2.2 Subscription & Billing, 2.3 Onboarding (+25 more)

### Community 21 - "Subscription"
Cohesion: 0.20
Nodes (10): GetLimits(), AdminOverrideRequest, CheckoutRequest, BillingCycle, CheckoutSessionResult, PlanLimits, PlanTier, Subscription (+2 more)

### Community 22 - "Order"
Cohesion: 0.14
Nodes (14): NewService(), Order, go_pkg_math, UpdateOrderStatusRequest, DestinationType, notifServiceIface, OrderItem, OrderItemModifier (+6 more)

### Community 23 - "useAuthStore"
Cohesion: 0.10
Nodes (34): DashboardLayout(), CATEGORIES, CATEGORY_META, NotificationsPage(), PRIORITIES, PRIORITY_BADGE, timeAgo(), NAV_ITEMS (+26 more)

### Community 24 - "web/package.json"
Cohesion: 0.08
Nodes (23): typescript, name, packageManager, private, version, axios, clsx, eslint (+15 more)

### Community 25 - "Scope"
Cohesion: 0.21
Nodes (8): ensureUpdatedAt(), go.mongodb.org/mongo-driver/v2/bson.M, go.mongodb.org/mongo-driver/v2/mongo.Cursor, go.mongodb.org/mongo-driver/v2/mongo.DeleteResult, go.mongodb.org/mongo-driver/v2/mongo.InsertManyResult, go.mongodb.org/mongo-driver/v2/mongo.InsertOneResult, go.mongodb.org/mongo-driver/v2/mongo.UpdateResult, Scope

### Community 26 - "handlers/room.go"
Cohesion: 0.18
Nodes (10): NewRoomHandler(), go_pkg_encoding_base64, go_pkg_github_com_dineflow_api_internal_application_notification, go_pkg_github_com_dineflow_api_internal_application_room, go_pkg_github_com_dineflow_api_internal_domain_room, BulkRoomsRequest, CreateRoomRequest, PublicAmenityRequest (+2 more)

### Community 27 - "Service"
Cohesion: 0.23
Nodes (8): NewService(), OTPProvider, AuthResponse, EmailSender, LoginRequest, Service, VerifyOTPRequest, go.mongodb.org/mongo-driver/v2/mongo.Collection

### Community 28 - "storage/storage.go"
Cohesion: 0.27
Nodes (7): NewService(), go_pkg_crypto_sha256, go_pkg_encoding_hex, go_pkg_path_filepath, Config, PresignedUploadResponse, Service

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

### Community 33 - "MenuItem"
Cohesion: 0.31
Nodes (9): buildMenuItemFromUpsertRequest(), UpsertItemRequest, DietaryTag, MenuItem, ModifierGroup, ModifierOption, PublicCategorySection, PublicMenuResponse (+1 more)

### Community 34 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 35 - "react"
Cohesion: 0.09
Nodes (26): LoginPage(), RegisterPage(), DAYS, ForecastPage(), generateForecast(), getIntensityClass(), HOURS, INSIGHTS (+18 more)

### Community 36 - "package.json"
Cohesion: 0.09
Nodes (21): description, devDependencies, prettier, turbo, typescript, engines, node, typescript (+13 more)

### Community 37 - "Hub"
Cohesion: 0.18
Nodes (9): GetHub(), Hub, NewOrderHandler(), go_pkg_encoding_json, go_pkg_sync, sync.RWMutex, EventType, NotificationEvent (+1 more)

### Community 38 - "DineFlow — Development Plan"
Cohesion: 0.07
Nodes (30): 1.1 — Monorepo Setup, 1.2 — Backend Foundation (Go), 1.3 — Authentication Service, 1.4 — Multi-Tenancy Middleware, 1.5 — Frontend Foundation (Next.js), 1.6 — File Storage, 1.7 — Email Service, 2.1 — Onboarding (+22 more)

### Community 39 - "handlers/table.go"
Cohesion: 0.33
Nodes (5): NewTableHandler(), go_pkg_github_com_dineflow_api_internal_application_table, BulkCreateRoomsRequest, ToggleDNDRequest, UpdateTableStatusRequest

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

### Community 55 - "ui/pricing.tsx"
Cohesion: 0.14
Nodes (14): COMPARISON_ROWS, PLANS, PlanTier, PricingPage(), buttonVariants, Label, labelVariants, Pricing() (+6 more)

### Community 56 - "User"
Cohesion: 0.28
Nodes (11): DefaultPermissionsForRole(), PublicProfile, User, UpdateStaffRequest, InviteStaffInput, Auth, NotificationPrefs, Permissions (+3 more)

### Community 57 - "DineFlow — Subscription Model"
Cohesion: 0.12
Nodes (15): DineFlow — Subscription Model, Downgrade Execution (Day 14), 🆓 Free — "Just Getting Started", Grace Period & Downgrade Automation, Grace Period Flow, Grace Period Timeline, 📈 Growth — "Scaling Up" — ₹2,999/month, 🏨 Hotel Pro — "Enterprise Hospitality" — ₹7,999/month (+7 more)

### Community 58 - "server/main.go"
Cohesion: 0.14
Nodes (12): NewAuthHandler(), New(), go_pkg_github_com_dineflow_api_internal_application_auth, go_pkg_github_com_dineflow_api_internal_application_order, go_pkg_github_com_dineflow_api_internal_infrastructure_email, go_pkg_github_com_dineflow_api_internal_interfaces_http_routes, go_pkg_github_com_dineflow_api_pkg_config, go_pkg_github_com_dineflow_api_pkg_logger (+4 more)

### Community 59 - "NormalizePhone"
Cohesion: 0.21
Nodes (6): GenerateCode(), redis.Client, NewService(), redisKey(), NormalizePhone(), Service

### Community 60 - "Collections"
Cohesion: 0.13
Nodes (15): Collection: `audit_logs`, Collection: `categories`, Collection: `locations`, Collection: `menu_items`, Collection: `menus`, Collection: `modifier_groups`, Collection: `notifications`, Collection: `orders` (+7 more)

### Community 61 - "analytics/service.go"
Cohesion: 0.25
Nodes (7): CategoryShare, HourlyPoint, OverviewMetrics, Service, TopItemMetric, NewService(), go_pkg_sort

### Community 62 - "handlers/menu.go"
Cohesion: 0.15
Nodes (11): NewAIHandler(), NewMenuHandler(), go_pkg_github_com_dineflow_api_internal_application_ai, go_pkg_github_com_dineflow_api_internal_application_menu, go_pkg_github_com_dineflow_api_internal_domain_ai, BulkCreateItemsRequest, BulkDeleteItemsRequest, BulkUpdateItemsRequest (+3 more)

### Community 63 - "DineFlow — Feature Roadmap"
Cohesion: 0.15
Nodes (13): Cross-Phase Dependencies Map, Deliverables, Deliverables, DineFlow — Feature Roadmap, Overview, Phase 0 — Planning & Architecture, Phase 1 — Foundation & Infrastructure, Phase 3 — Hotel Module (+5 more)

### Community 64 - "DineFlow — Product Vision"
Cohesion: 0.15
Nodes (13): Business Metrics (12-Month Targets), Competitive Landscape, Customer Experience Metrics, DineFlow — Product Vision, Long-Term Vision (3–5 Years), Mission, Primary Segments, Product Metrics (+5 more)

### Community 65 - "README.md"
Cohesion: 0.18
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

### Community 74 - "Problems Solved"
Cohesion: 0.25
Nodes (8): Problem 1 — Fragmented Software Stack, Problem 2 — High Cost of Entry, Problem 3 — App Download Friction, Problem 4 — WhatsApp Chaos, Problem 5 — No Real-time Kitchen Visibility, Problem 6 — Hotels Lack F&B Cohesion, Problem 7 — No Data for Decision Making, Problems Solved

### Community 75 - "DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)"
Cohesion: 0.25
Nodes (7): 1. Overview & Vision, 2. End-to-End Pipeline Architecture, 3.1 Inbound WhatsApp Webhook (`POST /webhooks/whatsapp`), 3.2 Staging Collection (`menu_imports_staging`), 3. Webhook Payload & Data Schema, 4. Security, Multi-Tenancy & Privacy Controls, DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)

### Community 76 - "Code Quality Standards"
Cohesion: 0.29
Nodes (6): 1. TypeScript & React, 2. Go (Golang), 3. API & Data Access Hygiene, 4. Code Review Output Format, Code Quality Standards, Staff Engineer Code Review Runbook

### Community 77 - "MSG91Provider"
Cohesion: 0.33
Nodes (6): Config, redis.Client, NewMSG91Provider(), TestMSG91ProviderFallback(), net/http.Client, MSG91Provider

### Community 78 - "DineFlow — Antigravity (`agy`) Workspace Rules"
Cohesion: 0.29
Nodes (6): Code Style, DineFlow — Antigravity (`agy`) Workspace Rules, Key Files, Project, Tech Stack, Workflow Rules

### Community 79 - "handlers/storage.go"
Cohesion: 0.47
Nodes (5): StorageService, StorageHandler, NewStorageHandler(), go_pkg_github_com_dineflow_api_internal_infrastructure_storage, PresignRequest

### Community 80 - "handlers/whatsapp.go"
Cohesion: 0.33
Nodes (5): NewWhatsAppHandler(), go_pkg_github_com_dineflow_api_internal_application_whatsapp, go_pkg_github_com_dineflow_api_internal_domain_whatsapp, InboundWebhookPayload, SendTestRequest

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

### Community 86 - "Billing Mechanics"
Cohesion: 0.50
Nodes (4): Billing Cycle Options, Billing Mechanics, Payment Providers, Upgrade / Downgrade Rules

### Community 87 - "Feature Flag System"
Cohesion: 0.50
Nodes (4): Enforcement Layers, Feature Flag System, Implementation, Upgrade Prompt Pattern

### Community 88 - "White-Label Strategy"
Cohesion: 0.50
Nodes (4): Future: Platform License, What White-Label Does NOT Include, What White-Label Includes, White-Label Strategy

## Knowledge Gaps
- **602 isolated node(s):** `github.com/dineflow/api`, `geminiRequest`, `geminiResponse`, `SendOTPRequest`, `MessageType` (+597 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 725 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `cn`, `button.tsx`, `useToast`, `TubesCursor`, `rooms/page.tsx`, `tenant-data-store.ts`, `theme-provider.tsx`, `peeking-chef.tsx`, `ui/pricing.tsx`, `useAuthStore`, `web/package.json`, `app/layout.tsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `main()` connect `main` to `github.com/gin-gonic/gin.Context`, `tenant/tenant.go`, `go_pkg_github_com_gin_gonic_gin`, `context.Context`, `ai/service.go`, `testing.T`, `config.go`, `Client`, `Service`, `Order`, `handlers/room.go`, `Service`, `storage/storage.go`, `Hub`, `handlers/table.go`, `Service`, `server/main.go`, `analytics/service.go`, `handlers/menu.go`, `NewFirebaseTestProvider`, `handlers/storage.go`, `handlers/whatsapp.go`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `Setup()` connect `github.com/gin-gonic/gin.Context` to `go_pkg_github_com_gin_gonic_gin`, `github.com/gin-gonic/gin.HandlerFunc`, `main`, `config.go`, `handlers/storage.go`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `github.com/dineflow/api`, `geminiRequest`, `geminiResponse` to the rest of the system?**
  _602 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `github.com/gin-gonic/gin.Context` be split into smaller, more focused modules?**
  _Cohesion score 0.05777253763830945 - nodes in this community are weakly interconnected._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.05137844611528822 - nodes in this community are weakly interconnected._
- **Should `button.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12390414962010521 - nodes in this community are weakly interconnected._