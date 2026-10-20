# Graph Report - DineFlow  (2026-10-21)

## Corpus Check
- 412 files · ~786,266 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 7, .example 2, .toml 1)

## Summary
- 3382 nodes · 10022 edges · 169 communities (129 shown, 40 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 57 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9b4d4ce7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- InternalError
- context.Context
- handlers/menu.go
- Service
- staff-storage.ts
- go_pkg_go_mongodb_org_mongo_driver_v2_bson
- toast.tsx
- Service
- time.Time
- 3. Comprehensive Issue Register & Auto-Fix Log
- Service
- webhook/route.ts
- config.go
- staff/page.tsx
- testing.T
- whatsapp/service.go
- OK
- Service
- MockProvider
- DineFlow — UI/UX Guidelines
- GetTenantID
- Subscription
- useToast
- DineFlow Multi-Agent System Architecture
- web/package.json
- Scope
- github.com/gin-gonic/gin.HandlerFunc
- notification-store.ts
- platform-store.ts
- dependencies
- compilerOptions
- app/layout.tsx
- tasks
- 2. Touch Target Remediations (WCAG 2.5.5 / 2.5.8)
- components.json
- orders/page.tsx
- package.json
- github.com/gin-gonic/gin.Context
- DineFlow — Development Plan
- getBaseURL
- devDependencies
- scripts
- menu-nlp-engine.ts
- go.mongodb.org/mongo-driver/v2/bson.ObjectID
- DineFlow — System Architecture
- Client
- DineFlow — API Strategy
- eslint.config.mjs
- scripts
- Service
- 2. Exhaustive Browser QA Checklist
- menu/page.tsx
- cn
- postcss.config.mjs
- github.com/dineflow/api
- printer.go
- Service
- DineFlow — Subscription Model
- Visual Regression & Before/After Comparison
- tasks/route.ts
- Collections
- roles.ts
- Order
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
- 2. Mandatory Core Invariants
- DineFlow — WhatsApp Menu Import Architecture (Future-Ready Specification)
- Code Quality Standards
- 2. Layout Shift & Reflow Protections
- DineFlow — Antigravity (`agy`) Workspace Rules
- search/service.go
- generate-logo/route.ts
- react
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
- BadRequest
- Service
- Hub
- security-audit/main.go
- DineFlow Critical User Journeys (CUJs)
- DineFlow Engineering Principles & Shared Rules
- inventory-store.ts
- 1. Hospitality Operational Domains
- remotion.config.ts
- main
- getWhatsAppLogs
- extend-stay/route.ts
- 3. Non-Functional Requirements
- 1. Core Performance Vectors
- 2. Functional Requirements
- handlers/room.go
- Backend Invariants & Development Rules
- deploy.sh
- gen-secrets.sh
- storage/storage.go
- Phase 2 — Restaurant MVP
- response.go
- redisKey
- spotlight-cursor.tsx
- Service
- Maker
- app/page.tsx
- design-system.ts
- dnd/route.ts
- DineFlow Orchestrator Agent (`dineflow-orchestrator`)
- README.md
- DineFlow Security & Compliance Specialist Agent (`dineflow-security`)
- DineFlow Autonomous Engineering Workflow
- DineFlow DevOps & Infrastructure Agent (`dineflow-devops`)
- DineFlow Security Reviewer Agent (`dineflow-security-reviewer`)
- landing-workflow.tsx
- ref_next_server
- review/service.go
- Phase 1 — Foundation & Infrastructure
- peeking-chef.tsx
- landing-customer-journey.tsx
- OpenWAProvider
- tenant/tenant.go
- ai/ai.go
- Notification
- Service
- MenuHandler
- QROrderingDemo.tsx
- TableHandler
- offer/service_test.go
- .GenerateMenuDescription
- order/[orderId]/route.ts
- status/[orderId]/route.ts

## God Nodes (most connected - your core abstractions)
1. `OK()` - 212 edges
2. `BadRequest()` - 196 edges
3. `GetTenantID()` - 170 edges
4. `react` - 156 edges
5. `useToast()` - 130 edges
6. `cn()` - 129 edges
7. `Unauthorized()` - 122 edges
8. `lucide-react` - 121 edges
9. `InternalError()` - 119 edges
10. `Button` - 84 edges

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

## Communities (169 total, 40 thin omitted)

### Community 0 - "InternalError"
Cohesion: 0.10
Nodes (4): PlatformHandler, InternalError(), NoContent(), OKWithMeta()

### Community 1 - "context.Context"
Cohesion: 0.08
Nodes (13): seedInventoryData(), cleanGuestName(), cleanOrderNumber(), cleanTableName(), Service, NewReviewHandler(), context.Context, go.mongodb.org/mongo-driver/v2/mongo.Collection (+5 more)

### Community 2 - "handlers/menu.go"
Cohesion: 0.17
Nodes (13): NewMenuHandler(), go_pkg_github_com_dineflow_api_internal_application_menu, BulkCreateItemsRequest, BulkDeleteItemsRequest, BulkUpdateItemsRequest, CreateCategoryRequest, ScanMenuRequest, ToggleStockRequest (+5 more)

### Community 4 - "staff-storage.ts"
Cohesion: 0.15
Nodes (20): dynamic, GET(), POST(), AttendanceRecord, enrollStaff(), findStaffByPhone(), findStaffByPhoneAsync(), generateCheckInSignedUrl() (+12 more)

### Community 5 - "go_pkg_go_mongodb_org_mongo_driver_v2_bson"
Cohesion: 0.09
Nodes (44): ParseObjectID(), SendOTPRequest, go_pkg_context, go_pkg_crypto_rand, go_pkg_encoding_csv, go_pkg_errors, go_pkg_fmt, go_pkg_github_com_dineflow_api_internal_domain_menu (+36 more)

### Community 6 - "toast.tsx"
Cohesion: 0.04
Nodes (62): OrderStatus, OrderTrackingPage(), TrackingOrder, TrackingOrderItem, TrackingTab, MenuItem, RoomInfo, RoomServiceMenuPage() (+54 more)

### Community 7 - "Service"
Cohesion: 0.04
Nodes (51): Service, CalculateDistanceMeters(), BuildFeedbackRequestMessage(), BuildKitchenReadyMessage(), BuildOrderConfirmationMessage(), GetStandardTemplates(), IsOptOutKeyword(), NormalizePhoneNumber() (+43 more)

### Community 8 - "time.Time"
Cohesion: 0.07
Nodes (19): ValidateAndNormalizeIndianPhone(), NewRoomHandler(), time.Time, GRNItem, ReceiveGRNInput, FeatureFlagRecord, PlatformNotificationRecord, CheckInInput (+11 more)

### Community 9 - "3. Comprehensive Issue Register & Auto-Fix Log"
Cohesion: 0.11
Nodes (18): 1. Executive Summary & Audit Metrics, 2. Multi-Viewport Testing Matrix, 3. Comprehensive Issue Register & Auto-Fix Log, 4. Mandatory Quality Checklist Verification, 5. Deliverables & PR Details, End-to-End Frontend QA Visual & Responsive Audit Report, [ISSUE-001] Menu Management: "In Stock" Status Badge Overlapping Edit Button, [ISSUE-002] TopBar: Global Search Input Compressed at Tablet Landscape (+10 more)

### Community 10 - "Service"
Cohesion: 0.21
Nodes (8): CopilotBriefResponse, CopilotQueryRequest, CopilotQueryResponse, PricingAlert, PricingAlertsResponse, Service, mockPricingAlerts(), NewAIHandler()

### Community 11 - "webhook/route.ts"
Cohesion: 0.47
Nodes (5): dynamic, GET(), getGoBackendBase(), POST(), revalidate

### Community 12 - "config.go"
Cohesion: 0.16
Nodes (18): getEnv(), getEnvInt(), Load(), requireEnv(), AIConfig, AppConfig, Config, EmailConfig (+10 more)

### Community 13 - "staff/page.tsx"
Cohesion: 0.04
Nodes (63): ForgotPasswordContent(), Step, LoginPage(), RegisterPage(), ResetPasswordContent(), AttendanceRecord, BankDetails, calculateDistanceM() (+55 more)

### Community 14 - "testing.T"
Cohesion: 0.04
Nodes (67): NewService(), TestGenerateReviewSuggestions_AllEightHighlights(), TestGenerateReviewSuggestions_MockFallback(), TestGetReviewStats_Calculation(), TestSearchScenarios(), NewService(), TestSearchAll_EmptyQuery(), TestSearchAll_ShortQuery() (+59 more)

### Community 15 - "whatsapp/service.go"
Cohesion: 0.08
Nodes (29): geminiRequest, geminiResponse, ScannedDish, getDefaultGeminiKey(), mockScannedDishes(), Health(), SetHealthDeps(), Version() (+21 more)

### Community 16 - "OK"
Cohesion: 0.08
Nodes (5): AuthHandler, InventoryHandler, TenantHandler, NotFound(), OK()

### Community 17 - "Service"
Cohesion: 0.08
Nodes (22): CalculateHealthScore(), AnnouncementInfo, AuditActor, AuditLogRecord, BusinessType, ClientStatus, DashboardMetrics, FeatureFlagDefinition (+14 more)

### Community 18 - "MockProvider"
Cohesion: 0.12
Nodes (7): NewMetaCloudProvider(), CleanPhoneNumber(), sync.RWMutex, MetaCloudConfig, MetaCloudProvider, MockProvider, SentMessage

### Community 19 - "DineFlow — UI/UX Guidelines"
Cohesion: 0.04
Nodes (44): 10. Responsive Breakpoints, 11. Iconography, 12. Empty States, 13. Toast / Notification System, 1. Design Philosophy, 2. Color Palette, 3. Typography, 4. Spacing System (+36 more)

### Community 20 - "GetTenantID"
Cohesion: 0.06
Nodes (11): AnalyticsHandler, NotificationHandler, RoomHandler, StaffHandler, GetRole(), GetTenantID(), GetUserID(), ByTenant() (+3 more)

### Community 21 - "Subscription"
Cohesion: 0.16
Nodes (13): FormatPlanName(), GetLimits(), AdminOverrideRequest, CheckoutRequest, BillingCycle, CheckoutSessionResult, PlanLimits, PlanTier (+5 more)

### Community 22 - "useToast"
Cohesion: 0.07
Nodes (55): VerifyContent(), PricingAlertsPage(), UpsellPage(), AnalyticsPage(), GuestDiningHistoryPage(), StockCountsPage(), InventoryItemsPage(), StockMovementsPage() (+47 more)

### Community 23 - "DineFlow Multi-Agent System Architecture"
Cohesion: 0.15
Nodes (12): 1. The Eight Primary Operational Roles, 2. Preserved Domain Specialists, 3. Technology Stack & Workspace Boundaries, 4. Mandatory Architectural Invariants, 5. MANDATORY DEVOPS PRODUCTION GUARDRAILS, 6. Multi-Agent Coordination Lifecycle, 7. Agent Discovery & Invocation, A. Server-Side Multi-Tenant Data Scoping (+4 more)

### Community 24 - "web/package.json"
Cohesion: 0.09
Nodes (22): typescript, name, packageManager, private, version, axios, clsx, eslint (+14 more)

### Community 25 - "Scope"
Cohesion: 0.21
Nodes (8): ensureUpdatedAt(), go.mongodb.org/mongo-driver/v2/bson.M, go.mongodb.org/mongo-driver/v2/mongo.Cursor, go.mongodb.org/mongo-driver/v2/mongo.DeleteResult, go.mongodb.org/mongo-driver/v2/mongo.InsertManyResult, go.mongodb.org/mongo-driver/v2/mongo.InsertOneResult, go.mongodb.org/mongo-driver/v2/mongo.UpdateResult, Scope

### Community 26 - "github.com/gin-gonic/gin.HandlerFunc"
Cohesion: 0.41
Nodes (12): ChefOrAbove(), FinanceAdminOrAbove(), OwnerOnly(), OwnerOrManager(), PlatformAdminOrAbove(), RequireAnyRole(), RequirePlatformRole(), RequireRole() (+4 more)

### Community 27 - "notification-store.ts"
Cohesion: 0.15
Nodes (19): NotificationsPage(), timeAgo(), CATEGORIES, CATEGORY_META, NotifCard(), NotificationCenter(), sanitizeNotification(), timeAgo() (+11 more)

### Community 28 - "platform-store.ts"
Cohesion: 0.06
Nodes (39): PlatformAnalyticsPage(), PlatformAuditLogsPage(), PlatformDashboardPage(), PlatformFeatureFlagsPage(), PlatformLayout(), PlatformOperationsPage(), PlatformRevenuePage(), PlatformSecurityCenterPage() (+31 more)

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

### Community 35 - "orders/page.tsx"
Cohesion: 0.14
Nodes (13): CATEGORIES, CATEGORY_META, PRIORITIES, PRIORITY_BADGE, INITIAL_KDS_ORDERS, KdsItem, KdsOrder, KDSOrdersPage() (+5 more)

### Community 36 - "package.json"
Cohesion: 0.08
Nodes (23): description, devDependencies, prettier, puppeteer-core, turbo, typescript, engines, node (+15 more)

### Community 37 - "github.com/gin-gonic/gin.Context"
Cohesion: 0.11
Nodes (5): OrderHandler, WhatsAppHandler, PlanLimitMiddleware(), PlanLimitExceeded(), github.com/gin-gonic/gin.Context

### Community 38 - "DineFlow — Development Plan"
Cohesion: 0.15
Nodes (13): Definition of Done, DineFlow — Development Plan, E2E Tests (Playwright), How to Read This Plan, Integration Tests, Performance Tests (k6), Phase 0 — Planning & Architecture, Phase 3 — Hotel Module (+5 more)

### Community 39 - "getBaseURL"
Cohesion: 0.12
Nodes (14): POST(), GET(), POST(), GET(), GET(), POST(), POST(), POST() (+6 more)

### Community 40 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti, @types/node, @types/react (+2 more)

### Community 41 - "scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, test, version

### Community 42 - "menu-nlp-engine.ts"
Cohesion: 0.14
Nodes (22): callGeminiVision(), GEMINI_MODELS, getDefaultGeminiKey(), maxDuration, POST(), RawMenuItem, ScanMenuRequestBody, INDIAN_CATEGORIES (+14 more)

### Community 43 - "go.mongodb.org/mongo-driver/v2/bson.ObjectID"
Cohesion: 0.07
Nodes (35): boolPtr(), ConvertQuantity(), GetDimension(), NormalizeUnit(), go.mongodb.org/mongo-driver/v2/bson.ObjectID, CreateItemInput, CreatePOInput, CreateRecipeInput (+27 more)

### Community 44 - "DineFlow — System Architecture"
Cohesion: 0.07
Nodes (27): Application Structure, Architecture Philosophy, Backend Architecture, Clean Architecture Dependency Flow, Customer Ordering Page — SSG + ISR, Database Architecture, Deployment Architecture, Deployment Pipeline (+19 more)

### Community 45 - "Client"
Cohesion: 0.10
Nodes (6): NewService(), Client, New(), IPBlocklist(), time.Duration, RateLimitResult

### Community 46 - "DineFlow — API Strategy"
Cohesion: 0.08
Nodes (24): API Design Principles, API Rate Limits, Base URLs, Client → Server (Actions), DineFlow — API Strategy, Module 10 — Menu Items, Module 11 — Modifier Groups, Module 12 — Customer Ordering (Public API — No Auth) (+16 more)

### Community 47 - "eslint.config.mjs"
Cohesion: 0.40
Nodes (4): eslintConfig, ref_eslint_config, ref_eslint_config_next_core_web_vitals, ref_eslint_config_next_typescript

### Community 48 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, lint, start, video:preview, video:render, video:render:qr (+1 more)

### Community 49 - "Service"
Cohesion: 0.12
Nodes (14): generateSlug(), NewService(), ValidatePasswordComplexity(), OTPProvider, redis.Client, NewOTPProvider(), NormalizePhone(), AuthResponse (+6 more)

### Community 50 - "2. Exhaustive Browser QA Checklist"
Cohesion: 0.20
Nodes (9): 1. Targeted Viewports & Breakpoints, 2. Exhaustive Browser QA Checklist, 3. High-Priority User Journeys to Inspect, 4. Execution Guardrails, A. Horizontal Overflow & Layout Integrity, B. Mobile Operational Ergonomics, C. Modal & Drawer Scroll Containment, D. Dual-Theme Contrast & WCAG Compliance (+1 more)

### Community 51 - "menu/page.tsx"
Cohesion: 0.09
Nodes (45): IMAGE_PRESETS, MenuManagementPage(), CameraMenuScannerModal(), CameraMenuScannerModalProps, CapturedPage, parseItemsFromResponse(), MenuBulkToolbar(), MenuBulkToolbarProps (+37 more)

### Community 52 - "cn"
Cohesion: 0.10
Nodes (49): DatePreset, DiningRecord, HotelGuestRecord, LiveReviewItem, LiveReviewStats, HotelStats, RoomItem, CampaignItem (+41 more)

### Community 55 - "printer.go"
Cohesion: 0.26
Nodes (12): centerText(), GenerateBillText(), GenerateKOTText(), padRow(), TestGenerateBillText(), TestGenerateKOTText(), truncate(), BillData (+4 more)

### Community 56 - "Service"
Cohesion: 0.17
Nodes (7): BroadcastResult, DiscountType, Offer, OfferStats, PushSubscription, Service, TargetAudience

### Community 57 - "DineFlow — Subscription Model"
Cohesion: 0.07
Nodes (27): Billing Cycle Options, Billing Mechanics, DineFlow — Subscription Model, Downgrade Execution (Day 14), Enforcement Layers, Feature Flag System, 🆓 Free Trial — "14-Day Full Experience", Future: Platform License (+19 more)

### Community 58 - "Visual Regression & Before/After Comparison"
Cohesion: 0.29
Nodes (6): 1. Menu Items Table — Status Column & Quick Actions Overlap, 2. TopBar Global Search & KDS Pill Squeeze, 3. TopBar Mobile Title Truncation, 4. Mobile Touch Targets (WCAG 44×44px Standard), 5. Live KDS Order Card Table Name, Visual Regression & Before/After Comparison

### Community 59 - "tasks/route.ts"
Cohesion: 0.29
Nodes (14): dynamic, GET(), PATCH(), POST(), revalidate, countActiveTasksForStaff(), findAvailableHousekeeper(), getTasksStore() (+6 more)

### Community 60 - "Collections"
Cohesion: 0.13
Nodes (15): Collection: `audit_logs`, Collection: `categories`, Collection: `locations`, Collection: `menu_items`, Collection: `menus`, Collection: `modifier_groups`, Collection: `notifications`, Collection: `orders` (+7 more)

### Community 61 - "roles.ts"
Cohesion: 0.05
Nodes (59): DashboardLayout(), MobileNavSubItemsInner(), DashboardOverviewPage(), ChatMessage, CopilotDrawer(), MOCK_AI_RESPONSES, PRESET_QUERIES, CATEGORY_CONFIG (+51 more)

### Community 62 - "Order"
Cohesion: 0.11
Nodes (11): Service, Order, UpdateOrderStatusRequest, DestinationType, OrderItem, OrderItemModifier, OrderSource, OrderStatus (+3 more)

### Community 63 - "DineFlow — Feature Roadmap"
Cohesion: 0.10
Nodes (21): 2A — Business Onboarding, 2B — Menu Management, 2C — QR Code System, 2D — Customer Ordering Experience, 2E — Order Management (Staff Dashboard), 2F — Kitchen Display System, 2G — Basic Analytics, Cross-Phase Dependencies Map (+13 more)

### Community 64 - "DineFlow — Product Vision"
Cohesion: 0.09
Nodes (21): Business Metrics (12-Month Targets), Competitive Landscape, Customer Experience Metrics, DineFlow — Product Vision, Long-Term Vision (3–5 Years), Mission, Primary Segments, Problem 1 — Fragmented Software Stack (+13 more)

### Community 65 - "video/page.tsx"
Cohesion: 0.11
Nodes (17): Player, VideoType, RecordlyCursor(), RecordlyCursorProps, RecordlyFrame(), RecordlyFrameProps, defaultDineFlowPromoProps, DineFlowPromo() (+9 more)

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

### Community 74 - "2. Mandatory Core Invariants"
Cohesion: 0.22
Nodes (8): 1. Technical Stack & Workspace Scope, 2. Mandatory Core Invariants, 3. Development Workflow, A. Server-Side Multi-Tenant Data Scoping, B. Role-Based Access Control (RBAC), C. Frontend Code Standards, D. Architectural Reuse & Ponytail YAGNI, DineFlow Developer Agent (`dineflow-developer`)

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

### Community 79 - "search/service.go"
Cohesion: 0.29
Nodes (8): SearchHandler, NewSearchHandler(), go_pkg_github_com_dineflow_api_internal_application_search, SearchFilterOptions, SearchResponse, SearchResultItem, SearchResultsGrouped, Service

### Community 80 - "generate-logo/route.ts"
Cohesion: 0.22
Nodes (14): ACTIVE_GEMINI_MODELS, ARCHETYPE_CONFIGS, createArchetypeLogo(), detectMotif(), generateArchetypeProceduralSvg(), GenerateLogoRequest, generateWithGemini(), getGeminiApiKey() (+6 more)

### Community 81 - "react"
Cohesion: 0.07
Nodes (58): DAYS, ForecastPage(), generateForecast(), getIntensityClass(), HOURS, INSIGHTS, getDescription(), MenuWriterPage() (+50 more)

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
Cohesion: 0.05
Nodes (38): cleanPhoneNumber(), DefaultPermissionsForRole(), PublicProfile, User, IsPlatformRole(), NewScope(), buildMenuItemFromUpsertRequest(), UpdateStaffRequest (+30 more)

### Community 87 - "server/main.go"
Cohesion: 0.05
Nodes (45): ByIP(), ByIPAndRoute(), TestRoutesSetup_NoPanic(), go_pkg_github_com_dineflow_api_internal_application_analytics, go_pkg_github_com_dineflow_api_internal_application_auth, go_pkg_github_com_dineflow_api_internal_application_inventory, go_pkg_github_com_dineflow_api_internal_application_order, go_pkg_github_com_dineflow_api_internal_application_payment (+37 more)

### Community 88 - "DineFlow Frontend Specialist Agent (`dineflow-frontend`)"
Cohesion: 0.18
Nodes (10): 1. 21st.dev Design System Compliance, 2. Viewport & Breakpoint Testing, 3. Mobile Viewport Optimization Rules, 4. Dual-Theme Contrast Invariant, Core UI/UX & Design Invariants, DineFlow Frontend Specialist Agent (`dineflow-frontend`), Pre-Implementation Audit Protocol, Quality & Validation Checklist (+2 more)

### Community 115 - "BadRequest"
Cohesion: 0.07
Nodes (9): AIHandler, OfferHandler, PaymentHandler, ReviewHandler, SubscriptionHandler, Auth(), RateLimit(), Setup() (+1 more)

### Community 116 - "Service"
Cohesion: 0.17
Nodes (10): NewService(), NewPaymentHandler(), CreatePaymentSessionRequest, CreatePaymentSessionResponse, notifServiceIface, PaymentProvider, PaymentStatus, PaymentTransaction (+2 more)

### Community 117 - "Hub"
Cohesion: 0.13
Nodes (13): NewService(), NewService(), GetHub(), Hub, NewNotificationHandler(), NewOrderHandler(), InventoryOrderDeductor, notifServiceIface (+5 more)

### Community 118 - "security-audit/main.go"
Cohesion: 0.15
Nodes (20): main(), testCORSOriginDefense(), testMetaWebhookHMACSignature(), testNoSQLInjectionInBody(), testNoSQLInjectionInQueryParams(), testRequestIDTracing(), testSecurityHeaders(), setupTestRouter() (+12 more)

### Community 119 - "DineFlow Critical User Journeys (CUJs)"
Cohesion: 0.18
Nodes (10): 12-Step QA Execution Workflow, DineFlow Critical User Journeys (CUJs), DineFlow QA & Quality Engineering Agent (`dineflow-qa`), Empirical Reporting Standards, Journey 1: Customer Dining Experience, Journey 2: Kitchen Order Display (KDS), Journey 3: Hotel Guest & In-Room Dining, Journey 4: Workforce & Operations (+2 more)

### Community 120 - "DineFlow Engineering Principles & Shared Rules"
Cohesion: 0.18
Nodes (10): 1. System Overview & Domain Invariants, 2. Core Execution Rule, 3. Anti-Duplication & Architectural Reuse, 4. Preservation of the Existing System, 5. Real Data vs. Mock Data Policy, 6. Strict Multi-Tenant Data Isolation, 7. Security Invariants, 8. Quality & Engineering Standards (+2 more)

### Community 121 - "inventory-store.ts"
Cohesion: 0.05
Nodes (40): CustomerReviewHub(), DEFAULT_VIBES, generateAIReviewOptions(), INITIAL_FEEDBACKS, ReviewConfig, ReviewFeedback, ReviewStoreState, SHIELD_CATEGORIES (+32 more)

### Community 122 - "1. Hospitality Operational Domains"
Cohesion: 0.22
Nodes (8): 1. Hospitality Operational Domains, 2. Product Review Standards, A. Restaurant Dine-In & Quick Service (QSR), B. Hotel PMS & In-Room Guest Services, C. Workforce & Operational HRMS, D. Omnichannel Guest Communication, DineFlow Product Reviewer Agent (`dineflow-product-reviewer`), E. Multi-Tenant Platform Administration

### Community 124 - "main"
Cohesion: 0.11
Nodes (23): corsMiddleware(), main(), requestLogger(), runStartupCleanup(), NewService(), NewService(), NewService(), NewService() (+15 more)

### Community 125 - "getWhatsAppLogs"
Cohesion: 0.32
Nodes (6): dynamic, GET(), revalidate, dynamic, POST(), getWhatsAppLogs()

### Community 126 - "extend-stay/route.ts"
Cohesion: 0.38
Nodes (6): dynamic, GET(), getExtensionStore(), POST(), revalidate, StayExtensionRecord

### Community 127 - "3. Non-Functional Requirements"
Cohesion: 0.10
Nodes (19): 1. User Personas, 3.1 Performance, 3.2 Scalability, 3.3 Reliability, 3.4 Security, 3.5 Accessibility, 3.6 Internationalisation, 3. Non-Functional Requirements (+11 more)

### Community 128 - "1. Core Performance Vectors"
Cohesion: 0.25
Nodes (7): 1. Core Performance Vectors, 2. Safe Performance Audit Protocol, A. MongoDB Indexing & Query Efficiency, B. Redis Caching & Rate Limiting Strategy, C. Next.js Bundle Size & Rendering Efficiency, D. Server Resource Efficiency (Go Backend), DineFlow Performance Specialist Agent (`dineflow-performance`)

### Community 129 - "2. Functional Requirements"
Cohesion: 0.14
Nodes (14): 2.10 Staff Management, 2.11 WhatsApp Integration, 2.12 Analytics & Reporting, 2.13 Settings & Configuration, 2.1 Authentication & Multi-Tenancy, 2.2 Subscription & Billing, 2.3 Onboarding, 2.4 Menu Management (+6 more)

### Community 130 - "handlers/room.go"
Cohesion: 0.14
Nodes (13): go_pkg_github_com_dineflow_api_internal_application_room, ApproveExtensionRequestInput, BulkRoomsRequest, CreateRoomRequest, CreateTaskRequest, PublicAmenityRequest, PublicExtendStayRequest, RejectExtensionRequestInput (+5 more)

### Community 131 - "Backend Invariants & Development Rules"
Cohesion: 0.20
Nodes (9): 1. Mandatory Server-Side Multi-Tenant Scoping, 2. Standardized API Response & Error Handling, 3. Database Schema Integrity & Indexing, 4. External Webhook & Integration Guidelines, Backend Invariants & Development Rules, Backend Quality & Validation Checklist, DineFlow Backend Specialist Agent (`dineflow-backend`), Directory & Architectural Organization (+1 more)

### Community 134 - "storage/storage.go"
Cohesion: 0.15
Nodes (13): StorageService, NewService(), TestStorageValidation(), StorageHandler, NewStorageHandler(), go_pkg_crypto_sha256, go_pkg_encoding_hex, go_pkg_github_com_dineflow_api_internal_infrastructure_storage (+5 more)

### Community 135 - "Phase 2 — Restaurant MVP"
Cohesion: 0.22
Nodes (9): 2.1 — Onboarding, 2.2 — Menu Management, 2.3 — Table & QR Code Management, 2.4 — Customer Ordering Experience, 2.5 — WebSocket / Real-Time, 2.6 — Order Management (Staff Dashboard), 2.7 — Kitchen Display System, 2.8 — Basic Analytics (+1 more)

### Community 136 - "response.go"
Cohesion: 0.14
Nodes (11): clearRefreshTokenCookie(), AuthHandler, setRefreshTokenCookie(), GetTokenID(), Conflict(), FeatureNotAvailable(), TooManyRequests(), ValidationError() (+3 more)

### Community 137 - "redisKey"
Cohesion: 0.11
Nodes (16): Config, redis.Client, NewFirebaseTestProvider(), Config, redis.Client, NewMSG91Provider(), GenerateCode(), redis.Client (+8 more)

### Community 138 - "spotlight-cursor.tsx"
Cohesion: 0.32
Nodes (5): Component(), ComponentProps, SpotlightConfig, SpotlightCursor, useSpotlightEffect()

### Community 139 - "Service"
Cohesion: 0.31
Nodes (4): NewService(), Service, go_pkg_github_com_resend_resend_go_v2, resend.Client

### Community 140 - "Maker"
Cohesion: 0.33
Nodes (6): Maker, NewMaker(), TestTokenMaker(), jwt.RegisteredClaims, Claims, TokenType

### Community 141 - "app/page.tsx"
Cohesion: 0.05
Nodes (43): ChefMascot(), ChefMascotProps, FloatingCard(), FloatingCardProps, HeroSection(), HeroSectionProps, SCATTERED_FOODS, ScatteredFood (+35 more)

### Community 143 - "dnd/route.ts"
Cohesion: 0.38
Nodes (6): DNDRecord, dynamic, GET(), getDNDStore(), POST(), revalidate

### Community 144 - "DineFlow Orchestrator Agent (`dineflow-orchestrator`)"
Cohesion: 0.29
Nodes (6): 13-Step Orchestration Workflow, Delegation Rules & Specialist Routing, DineFlow Orchestrator Agent (`dineflow-orchestrator`), Operational Guardrails, Shared Invariants & Governance, Standard Agent Handoff Protocol

### Community 145 - "README.md"
Cohesion: 0.18
Nodes (5): Data Retention Policy, Design Principles, DineFlow — Database Design, Entity Relationship Overview, Index Strategy Summary

### Community 146 - "DineFlow Security & Compliance Specialist Agent (`dineflow-security`)"
Cohesion: 0.33
Nodes (5): 15-Point Security Audit Matrix, DineFlow Security & Compliance Specialist Agent (`dineflow-security`), Mandatory Tenant Isolation Verification Test, Payment & Webhook Security Invariants, Security Vulnerability Reporting Standard

### Community 147 - "DineFlow Autonomous Engineering Workflow"
Cohesion: 0.33
Nodes (5): 1. End-to-End Lifecycle Architecture, 2. The 10 Invariant Coordination Rules, 3. Standard Agent Handoff Protocol, 4. Phase-by-Phase Execution Checklist, DineFlow Autonomous Engineering Workflow

### Community 148 - "DineFlow DevOps & Infrastructure Agent (`dineflow-devops`)"
Cohesion: 0.40
Nodes (4): 1. Scope of Infrastructure, 2. MANDATORY PRODUCTION SAFETY GUARDRAILS, 3. Permitted Safe Local DevOps Operations, DineFlow DevOps & Infrastructure Agent (`dineflow-devops`)

### Community 149 - "DineFlow Security Reviewer Agent (`dineflow-security-reviewer`)"
Cohesion: 0.40
Nodes (4): 1. 10-Point Security Review Matrix, 2. Review Protocol & Severity Ratings, 3. Strict Safety Guardrails, DineFlow Security Reviewer Agent (`dineflow-security-reviewer`)

### Community 151 - "ref_next_server"
Cohesion: 0.07
Nodes (10): dynamic, dynamic, revalidate, dynamic, revalidate, dynamic, revalidate, publicConfigCache (+2 more)

### Community 153 - "review/service.go"
Cohesion: 0.16
Nodes (12): TestCopilotBrief_MockMode(), TestCopilotQuery_Classification(), NewService(), cleanReviewTag(), mockReviewSuggestions(), go_pkg_github_com_dineflow_api_internal_application_ai, go_pkg_github_com_dineflow_api_internal_domain_ai, go_pkg_net_url (+4 more)

### Community 154 - "Phase 1 — Foundation & Infrastructure"
Cohesion: 0.25
Nodes (8): 1.1 — Monorepo Setup, 1.2 — Backend Foundation (Go), 1.3 — Authentication Service, 1.4 — Multi-Tenancy Middleware, 1.5 — Frontend Foundation (Next.js), 1.6 — File Storage, 1.7 — Email Service, Phase 1 — Foundation & Infrastructure

### Community 156 - "landing-customer-journey.tsx"
Cohesion: 0.18
Nodes (8): HOTEL_LOADING_MESSAGES, HOTEL_STEPS, JourneyStep, JourneyType, LandingCustomerJourney(), RESTAURANT_LOADING_MESSAGES, RESTAURANT_STEPS, ParallaxFloat()

### Community 157 - "OpenWAProvider"
Cohesion: 0.20
Nodes (6): NewOpenWAProvider(), FormatChatID(), SessionStatus, net/http.Request, OpenWAConfig, OpenWAProvider

### Community 158 - "tenant/tenant.go"
Cohesion: 0.24
Nodes (17): seedDefaultData(), seedPlatformData(), FeaturesForPlan(), BusinessType, Tenant, LimitsForPlan(), Address, Contact (+9 more)

### Community 159 - "ai/ai.go"
Cohesion: 0.23
Nodes (12): ChatbotMessage, ChatbotResponse, ChatTurn, ForecastDay, ForecastHour, ForecastResponse, UpsellRequest, UpsellResponse (+4 more)

### Community 160 - "Notification"
Cohesion: 0.48
Nodes (5): CreateNotificationRequest, Category, CreateNotificationInput, Notification, Priority

### Community 161 - "Service"
Cohesion: 0.22
Nodes (7): CategoryShare, HourlyPoint, OverviewMetrics, Service, TopItemMetric, NewService(), NewAnalyticsHandler()

### Community 163 - "QROrderingDemo.tsx"
Cohesion: 0.22
Nodes (4): AIPresenter(), AIPresenterProps, defaultQROrderingDemoProps, QROrderingDemoProps

### Community 165 - "offer/service_test.go"
Cohesion: 0.36
Nodes (7): NewService(), TestBroadcastOffer_Mock(), TestCreateOffer(), TestTrackOfferClick_NoPanic(), TestTrackOfferConversion_NoPanic(), go_pkg_github_com_dineflow_api_internal_application_offer, go_pkg_github_com_dineflow_api_internal_domain_offer

### Community 166 - ".GenerateMenuDescription"
Cohesion: 0.83
Nodes (3): MenuDescriptionRequest, MenuDescriptionResponse, mockMenuDescription()

## Knowledge Gaps
- **915 isolated node(s):** `TestResult`, `github.com/dineflow/api`, `geminiRequest`, `geminiResponse`, `SendOTPRequest` (+910 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1133 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **40 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `toast.tsx`, `spotlight-cursor.tsx`, `staff/page.tsx`, `app/page.tsx`, `useToast`, `landing-workflow.tsx`, `web/package.json`, `peeking-chef.tsx`, `landing-customer-journey.tsx`, `notification-store.ts`, `platform-store.ts`, `app/layout.tsx`, `orders/page.tsx`, `QROrderingDemo.tsx`, `getBaseURL`, `menu/page.tsx`, `cn`, `roles.ts`, `video/page.tsx`, `TubesCursor`, `inventory-store.ts`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `RoomHandler` connect `GetTenantID` to `context.Context`, `handlers/room.go`, `Service`, `time.Time`, `OK`, `BadRequest`, `NewScope`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `Service` connect `Service` to `context.Context`, `github.com/gin-gonic/gin.Context`, `redisKey`, `testing.T`, `whatsapp/service.go`, `MockProvider`, `GetTenantID`, `NewScope`, `security-audit/main.go`, `Service`, `main`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `TestResult`, `github.com/dineflow/api`, `geminiRequest` to the rest of the system?**
  _915 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `InternalError` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `context.Context` be split into smaller, more focused modules?**
  _Cohesion score 0.08069381598793364 - nodes in this community are weakly interconnected._
- **Should `go_pkg_go_mongodb_org_mongo_driver_v2_bson` be split into smaller, more focused modules?**
  _Cohesion score 0.09297297297297297 - nodes in this community are weakly interconnected._