# Graph Report - DineFlow  (2026-09-21)

## Corpus Check
- 319 files · ~429,841 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: (none) 6, .example 2, .toml 1)

## Summary
- 2644 nodes · 7385 edges · 139 communities (102 shown, 37 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 55 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4a9a21b7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- InternalError
- go.mongodb.org/mongo-driver/v2/bson.ObjectID
- button.tsx
- context.Context
- lucide-react
- go_pkg_time
- server/main.go
- staff/page.tsx
- Service
- Service
- Service
- ref_next_server
- Hub
- utils.ts
- testing.T
- config.go
- OK
- Service
- Maker
- DineFlow — UI/UX Guidelines
- BadRequest
- Subscription
- Order
- [roomId]/page.tsx
- web/package.json
- Scope
- redisKey
- notifications/page.tsx
- storage/storage.go
- dependencies
- compilerOptions
- app/layout.tsx
- tasks
- Notification
- components.json
- main
- package.json
- github.com/gin-gonic/gin.Context
- DineFlow — Development Plan
- video/page.tsx
- devDependencies
- scripts
- tenant/tenant.go
- time.Time
- DineFlow — System Architecture
- handlers/whatsapp.go
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
- response.go
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
- Setup
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
- handlers/menu.go
- handlers/room.go
- github.com/gin-gonic/gin.HandlerFunc
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
- token.go
- SubscriptionHandler
- tenant-data-store.ts
- Service
- 5. Component Library
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
- 3. Typography
- deploy.sh
- gen-secrets.sh
- search/service.go
- table/route.ts
- NewService
- .Register
- MSG91Provider
- 7. Layout System

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
- `UpdateRoomStatusRequest` --references--> `RoomStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/room.go → apps/api/internal/domain/room/room.go
- `UpdateTaskRequest` --references--> `TaskStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/room.go → apps/api/internal/domain/room/room.go
- `TestIndianPhoneValidation()` --calls--> `ValidateAndNormalizeIndianPhone()`  [INFERRED]
  apps/api/internal/domain/room/room_test.go → apps/api/internal/domain/room/room.go
- `TestDefaultPermissionsForRole()` --calls--> `DefaultPermissionsForRole()`  [INFERRED]
  apps/api/internal/domain/user/user_test.go → apps/api/internal/domain/user/user.go

## Import Cycles
- None detected.

## Communities (139 total, 37 thin omitted)

### Community 0 - "InternalError"
Cohesion: 0.12
Nodes (3): PlatformHandler, InternalError(), OKWithMeta()

### Community 1 - "go.mongodb.org/mongo-driver/v2/bson.ObjectID"
Cohesion: 0.10
Nodes (17): NewScope(), buildMenuItemFromUpsertRequest(), go.mongodb.org/mongo-driver/v2/bson.ObjectID, Category, MenuItem, PublicCategorySection, PublicMenuResponse, Service (+9 more)

### Community 2 - "button.tsx"
Cohesion: 0.08
Nodes (52): MOCK_DESCRIPTIONS, SAMPLE_ITEMS, TONES, AI_TOOLS, STATS, ALERT_CONFIG, ALERTS, SEVERITY_COLOR (+44 more)

### Community 3 - "context.Context"
Cohesion: 0.08
Nodes (11): cleanGuestName(), cleanOrderNumber(), cleanTableName(), NewService(), Service, Client, New(), IPBlocklist() (+3 more)

### Community 4 - "lucide-react"
Cohesion: 0.06
Nodes (53): VerifyContent(), getDescription(), MenuWriterPage(), PricingAlertsPage(), UpsellPage(), AnalyticsPage(), IMAGE_PRESETS, MenuManagementPage() (+45 more)

### Community 5 - "go_pkg_time"
Cohesion: 0.10
Nodes (41): ParseObjectID(), SendOTPRequest, go_pkg_context, go_pkg_crypto_rand, go_pkg_encoding_csv, go_pkg_errors, go_pkg_fmt, go_pkg_github_com_dineflow_api_internal_domain_menu (+33 more)

### Community 6 - "server/main.go"
Cohesion: 0.05
Nodes (49): geminiRequest, geminiResponse, Health(), SetHealthDeps(), Version(), ByIP(), ByIPAndRoute(), TestRoutesSetup_NoPanic() (+41 more)

### Community 7 - "staff/page.tsx"
Cohesion: 0.11
Nodes (20): AttendanceRecord, BankDetails, calculateDistanceM(), EmergencyContact, GeofenceConfig, Holiday, LeaveBalance, LeaveRequest (+12 more)

### Community 8 - "Service"
Cohesion: 0.08
Nodes (15): ValidateAndNormalizeIndianPhone(), CreateTaskRequest, ExtensionStatus, Guest, GuestStatus, HousekeepingTask, Room, RoomStatus (+7 more)

### Community 9 - "Service"
Cohesion: 0.05
Nodes (49): Service, BuildFeedbackRequestMessage(), BuildKitchenReadyMessage(), BuildOrderConfirmationMessage(), CalculateGST(), GetStandardTemplates(), InterpolateTemplate(), IsOptOutKeyword() (+41 more)

### Community 10 - "Service"
Cohesion: 0.12
Nodes (24): ChatbotMessage, ChatbotResponse, ChatTurn, ForecastDay, ForecastHour, ForecastResponse, MenuDescriptionRequest, MenuDescriptionResponse (+16 more)

### Community 11 - "ref_next_server"
Cohesion: 0.13
Nodes (7): dynamic, revalidate, dynamic, dynamic, revalidate, config, ref_next_server

### Community 12 - "Hub"
Cohesion: 0.16
Nodes (9): NewService(), NewService(), GetHub(), Hub, NewNotificationHandler(), NewOrderHandler(), notifServiceIface, Service (+1 more)

### Community 13 - "utils.ts"
Cohesion: 0.11
Nodes (25): MenuItem, RoomInfo, RoomServiceMenuPage(), SuiteTab, CustomerMenuPage(), matchesTable(), CustomerCartDrawer(), CustomerCartDrawerProps (+17 more)

### Community 14 - "testing.T"
Cohesion: 0.05
Nodes (53): TestSearchScenarios(), NewService(), TestSearchAll_EmptyQuery(), TestSearchAll_ShortQuery(), NewService(), TestApplyLeave_Validation(), TestCreateHoliday_Validation(), TestCreateShift_Validation() (+45 more)

### Community 15 - "config.go"
Cohesion: 0.16
Nodes (18): getEnv(), getEnvInt(), Load(), requireEnv(), AIConfig, AppConfig, Config, EmailConfig (+10 more)

### Community 16 - "OK"
Cohesion: 0.09
Nodes (6): AuthHandler, RoomHandler, TenantHandler, GetRole(), NotFound(), OK()

### Community 17 - "Service"
Cohesion: 0.08
Nodes (22): CalculateHealthScore(), AnnouncementInfo, AuditActor, AuditLogRecord, BusinessType, ClientStatus, DashboardMetrics, FeatureFlagDefinition (+14 more)

### Community 18 - "Maker"
Cohesion: 0.44
Nodes (4): Maker, jwt.RegisteredClaims, Claims, TokenType

### Community 19 - "DineFlow — UI/UX Guidelines"
Cohesion: 0.07
Nodes (29): 10. Responsive Breakpoints, 11. Iconography, 12. Empty States, 13. Toast / Notification System, 1. Design Philosophy, 2. Color Palette, 4. Spacing System, 6. Animation & Micro-Interactions (+21 more)

### Community 20 - "BadRequest"
Cohesion: 0.10
Nodes (9): MenuHandler, NotificationHandler, StaffHandler, TableHandler, GetTenantID(), GetUserID(), BadRequest(), Created() (+1 more)

### Community 21 - "Subscription"
Cohesion: 0.19
Nodes (11): FormatPlanName(), GetLimits(), AdminOverrideRequest, CheckoutRequest, BillingCycle, PlanLimits, PlanTier, Service (+3 more)

### Community 22 - "Order"
Cohesion: 0.13
Nodes (11): Service, Order, UpdateOrderStatusRequest, DestinationType, OrderItem, OrderItemModifier, OrderSource, OrderStatus (+3 more)

### Community 23 - "[roomId]/page.tsx"
Cohesion: 0.04
Nodes (60): ForgotPasswordContent(), Step, LoginPage(), RegisterPage(), ResetPasswordContent(), DAYS, ForecastPage(), generateForecast() (+52 more)

### Community 24 - "web/package.json"
Cohesion: 0.08
Nodes (25): Player, typescript, name, packageManager, private, version, axios, clsx (+17 more)

### Community 25 - "Scope"
Cohesion: 0.17
Nodes (9): ensureUpdatedAt(), go.mongodb.org/mongo-driver/v2/bson.M, go.mongodb.org/mongo-driver/v2/mongo.Collection, go.mongodb.org/mongo-driver/v2/mongo.Cursor, go.mongodb.org/mongo-driver/v2/mongo.DeleteResult, go.mongodb.org/mongo-driver/v2/mongo.InsertManyResult, go.mongodb.org/mongo-driver/v2/mongo.InsertOneResult, go.mongodb.org/mongo-driver/v2/mongo.UpdateResult (+1 more)

### Community 26 - "redisKey"
Cohesion: 0.26
Nodes (6): GenerateCode(), redis.Client, NewService(), redisKey(), TestGenerateCode(), Service

### Community 27 - "notifications/page.tsx"
Cohesion: 0.11
Nodes (25): CATEGORIES, CATEGORY_META, NotificationsPage(), PRIORITIES, PRIORITY_BADGE, timeAgo(), calculateDistanceMeters(), CheckInContent() (+17 more)

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

### Community 33 - "Notification"
Cohesion: 0.48
Nodes (5): CreateNotificationRequest, Category, CreateNotificationInput, Notification, Priority

### Community 34 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 35 - "main"
Cohesion: 0.12
Nodes (22): corsMiddleware(), main(), requestLogger(), runStartupCleanup(), seedDefaultData(), seedPlatformData(), NewService(), NewService() (+14 more)

### Community 36 - "package.json"
Cohesion: 0.09
Nodes (21): description, devDependencies, prettier, turbo, typescript, engines, node, typescript (+13 more)

### Community 37 - "github.com/gin-gonic/gin.Context"
Cohesion: 0.14
Nodes (5): WhatsAppHandler, ByTenant(), PlanLimitMiddleware(), PlanLimitExceeded(), github.com/gin-gonic/gin.Context

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

### Community 42 - "tenant/tenant.go"
Cohesion: 0.26
Nodes (15): FeaturesForPlan(), BusinessType, Tenant, LimitsForPlan(), Address, Contact, DayHours, Features (+7 more)

### Community 43 - "time.Time"
Cohesion: 0.11
Nodes (29): cleanPhoneNumber(), CalculateDistanceMeters(), DefaultPermissionsForRole(), PublicProfile, User, IsPlatformRole(), time.Time, UpdateStaffRequest (+21 more)

### Community 44 - "DineFlow — System Architecture"
Cohesion: 0.07
Nodes (27): Application Structure, Architecture Philosophy, Backend Architecture, Clean Architecture Dependency Flow, Customer Ordering Page — SSG + ISR, Database Architecture, Deployment Architecture, Deployment Pipeline (+19 more)

### Community 45 - "handlers/whatsapp.go"
Cohesion: 0.09
Nodes (28): main(), testCORSOriginDefense(), testMetaWebhookHMACSignature(), testNoSQLInjectionInBody(), testNoSQLInjectionInQueryParams(), testRequestIDTracing(), testSecurityHeaders(), NewWhatsAppHandler() (+20 more)

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
Cohesion: 0.21
Nodes (6): NewAuthHandler(), NormalizePhone(), AuthResponse, LoginRequest, Service, VerifyOTPRequest

### Community 52 - "OpenWAProvider"
Cohesion: 0.08
Nodes (13): NewMetaCloudProvider(), NewOpenWAProvider(), CleanPhoneNumber(), FormatChatID(), SessionStatus, net/http.Request, sync.RWMutex, MetaCloudConfig (+5 more)

### Community 55 - "printer.go"
Cohesion: 0.26
Nodes (12): centerText(), GenerateBillText(), GenerateKOTText(), padRow(), TestGenerateBillText(), TestGenerateKOTText(), truncate(), BillData (+4 more)

### Community 56 - "react"
Cohesion: 0.04
Nodes (71): DashboardErrorProps, SettingsPage(), OrderStatus, OrderTrackingPage(), TrackingOrder, TrackingOrderItem, COMPARISON_ROWS, PLANS (+63 more)

### Community 57 - "DineFlow — Subscription Model"
Cohesion: 0.07
Nodes (27): Billing Cycle Options, Billing Mechanics, DineFlow — Subscription Model, Downgrade Execution (Day 14), Enforcement Layers, Feature Flag System, 🆓 Free — "Just Getting Started", Future: Platform License (+19 more)

### Community 58 - "response.go"
Cohesion: 0.13
Nodes (13): clearRefreshTokenCookie(), AuthHandler, setRefreshTokenCookie(), GetTokenID(), Conflict(), FeatureNotAvailable(), Forbidden(), NoContent() (+5 more)

### Community 59 - "tasks/route.ts"
Cohesion: 0.29
Nodes (14): dynamic, GET(), PATCH(), POST(), revalidate, countActiveTasksForStaff(), findAvailableHousekeeper(), getTasksStore() (+6 more)

### Community 60 - "Collections"
Cohesion: 0.13
Nodes (15): Collection: `audit_logs`, Collection: `categories`, Collection: `locations`, Collection: `menu_items`, Collection: `menus`, Collection: `modifier_groups`, Collection: `notifications`, Collection: `orders` (+7 more)

### Community 61 - "useAuthStore"
Cohesion: 0.04
Nodes (63): DashboardLayout(), RootLoading(), PlatformLayout(), InvoiceRecord, BroadcastBanner(), CATEGORY_CONFIG, FILTER_CHIPS, QUICK_ACTIONS (+55 more)

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

### Community 74 - "Setup"
Cohesion: 0.12
Nodes (5): AIHandler, AnalyticsHandler, Auth(), RateLimit(), Setup()

### Community 75 - "DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)"
Cohesion: 0.25
Nodes (7): 1. Overview & Vision, 2. End-to-End Pipeline Architecture, 3.1 Inbound WhatsApp Webhook (`POST /webhooks/whatsapp`), 3.2 Staging Collection (`menu_imports_staging`), 3. Webhook Payload & Data Schema, 4. Security, Multi-Tenancy & Privacy Controls, DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)

### Community 76 - "Code Quality Standards"
Cohesion: 0.29
Nodes (6): 1. TypeScript & React, 2. Go (Golang), 3. API & Data Access Hygiene, 4. Code Review Output Format, Code Quality Standards, Staff Engineer Code Review Runbook

### Community 77 - "handlers/table.go"
Cohesion: 0.32
Nodes (7): go_pkg_github_com_dineflow_api_internal_application_table, BulkCreateRoomsRequest, CreateTableRequest, ToggleDNDRequest, UpdateTableStatusRequest, LocationType, TableStatus

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

### Community 86 - "handlers/menu.go"
Cohesion: 0.17
Nodes (13): go_pkg_github_com_dineflow_api_internal_application_ai, go_pkg_github_com_dineflow_api_internal_application_menu, BulkCreateItemsRequest, BulkDeleteItemsRequest, BulkUpdateItemsRequest, CreateCategoryRequest, ScanMenuRequest, ToggleStockRequest (+5 more)

### Community 87 - "handlers/room.go"
Cohesion: 0.15
Nodes (12): NewRoomHandler(), go_pkg_encoding_base64, ApproveExtensionRequestInput, BulkRoomsRequest, CreateRoomRequest, PublicAmenityRequest, PublicExtendStayRequest, RejectExtensionRequestInput (+4 more)

### Community 88 - "github.com/gin-gonic/gin.HandlerFunc"
Cohesion: 0.41
Nodes (12): ChefOrAbove(), FinanceAdminOrAbove(), OwnerOnly(), OwnerOrManager(), PlatformAdminOrAbove(), RequireAnyRole(), RequirePlatformRole(), RequireRole() (+4 more)

### Community 115 - "token.go"
Cohesion: 0.29
Nodes (5): NewMaker(), TestTokenMaker(), go_pkg_github_com_dineflow_api_pkg_token, go_pkg_github_com_golang_jwt_jwt_v5, go_pkg_github_com_google_uuid

### Community 117 - "tenant-data-store.ts"
Cohesion: 0.09
Nodes (43): callGeminiVision(), GEMINI_MODELS, maxDuration, POST(), RawMenuItem, ScanMenuRequestBody, CameraMenuScannerModalProps, MenuStagingPreviewModal() (+35 more)

### Community 119 - "5. Component Library"
Cohesion: 0.33
Nodes (6): 5. Component Library, Badges / Status Chips, Button System, Cards, Input Fields, KDS Order Card

### Community 121 - "Phase 2 — Restaurant MVP"
Cohesion: 0.25
Nodes (8): 2A — Business Onboarding, 2B — Menu Management, 2C — QR Code System, 2D — Customer Ordering Experience, 2E — Order Management (Staff Dashboard), 2F — Kitchen Display System, 2G — Basic Analytics, Phase 2 — Restaurant MVP

### Community 122 - "dnd/route.ts"
Cohesion: 0.38
Nodes (6): DNDRecord, dynamic, GET(), getDNDStore(), POST(), revalidate

### Community 124 - "rooms/page.tsx"
Cohesion: 0.22
Nodes (10): getStayMetrics(), HotelStats, RoomItem, RoomsDirectoryPage(), QRCodeImage(), QRCodeImageProps, useViewMode(), ViewMode (+2 more)

### Community 125 - "logs/route.ts"
Cohesion: 0.50
Nodes (4): dynamic, GET(), revalidate, getWhatsAppLogs()

### Community 126 - "extend-stay/route.ts"
Cohesion: 0.38
Nodes (6): dynamic, GET(), getExtensionStore(), POST(), revalidate, StayExtensionRecord

### Community 127 - "README.md"
Cohesion: 0.17
Nodes (5): Data Retention Policy, Design Principles, DineFlow — Database Design, Entity Relationship Overview, Index Strategy Summary

### Community 129 - "2. Functional Requirements"
Cohesion: 0.06
Nodes (33): 1. User Personas, 2.10 Staff Management, 2.11 WhatsApp Integration, 2.12 Analytics & Reporting, 2.13 Settings & Configuration, 2.1 Authentication & Multi-Tenancy, 2.2 Subscription & Billing, 2.3 Onboarding (+25 more)

### Community 130 - "3. Typography"
Cohesion: 0.50
Nodes (4): 3. Typography, Font Stack, Type Scale, Typography Usage Rules

### Community 134 - "search/service.go"
Cohesion: 0.29
Nodes (8): SearchHandler, NewSearchHandler(), go_pkg_github_com_dineflow_api_internal_application_search, SearchFilterOptions, SearchResponse, SearchResultItem, SearchResultsGrouped, Service

### Community 136 - "NewService"
Cohesion: 0.18
Nodes (10): NewService(), Config, redis.Client, NewFirebaseTestProvider(), OTPProvider, redis.Client, NewOTPProvider(), EmailSender (+2 more)

### Community 137 - ".Register"
Cohesion: 0.40
Nodes (3): generateSlug(), ValidatePasswordComplexity(), RegisterRequest

### Community 138 - "MSG91Provider"
Cohesion: 0.29
Nodes (6): Config, redis.Client, NewMSG91Provider(), TestMSG91ProviderFallback(), net/http.Client, MSG91Provider

### Community 141 - "7. Layout System"
Cohesion: 0.40
Nodes (5): 7. Layout System, Customer Ordering Page, Dashboard Layout, Grid System, KDS Layout

## Knowledge Gaps
- **741 isolated node(s):** `TestResult`, `github.com/dineflow/api`, `geminiRequest`, `geminiResponse`, `SendOTPRequest` (+736 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 911 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `spotlight-cursor.tsx`, `button.tsx`, `lucide-react`, `TubesCursor`, `staff/page.tsx`, `video/page.tsx`, `utils.ts`, `landing-workflow.tsx`, `tenant-data-store.ts`, `[roomId]/page.tsx`, `web/package.json`, `notifications/page.tsx`, `rooms/page.tsx`, `useAuthStore`, `app/layout.tsx`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `RoomHandler` connect `OK` to `go.mongodb.org/mongo-driver/v2/bson.ObjectID`, `context.Context`, `Service`, `Service`, `Setup`, `BadRequest`, `handlers/room.go`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `Client` connect `main` to `go.mongodb.org/mongo-driver/v2/bson.ObjectID`, `context.Context`, `go_pkg_time`, `search/service.go`, `NewService`, `Service`, `Service`, `Service`, `Hub`, `testing.T`, `OK`, `Service`, `Service`, `Subscription`, `Service`, `Service`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `TestResult`, `github.com/dineflow/api`, `geminiRequest` to the rest of the system?**
  _741 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `InternalError` be split into smaller, more focused modules?**
  _Cohesion score 0.12179487179487179 - nodes in this community are weakly interconnected._
- **Should `go.mongodb.org/mongo-driver/v2/bson.ObjectID` be split into smaller, more focused modules?**
  _Cohesion score 0.09643483343074226 - nodes in this community are weakly interconnected._
- **Should `button.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07955088389870998 - nodes in this community are weakly interconnected._