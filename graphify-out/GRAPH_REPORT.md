# Graph Report - DineFlow  (2026-10-13)

## Corpus Check
- 384 files · ~738,238 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 6, .example 2, .toml 1)

## Summary
- 3104 nodes · 8727 edges · 162 communities (123 shown, 39 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 57 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8e8c913e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- InternalError
- Order
- handlers/menu.go
- NewScope
- staff-storage.ts
- go_pkg_time
- useToast
- Service
- context.Context
- 3. Comprehensive Issue Register & Auto-Fix Log
- Service
- webhook/route.ts
- config.go
- register/page.tsx
- testing.T
- security-audit/main.go
- OK
- Service
- OpenWAProvider
- DineFlow — UI/UX Guidelines
- BadRequest
- Subscription
- AIHandler
- DineFlow Multi-Agent System Architecture
- web/package.json
- Scope
- github.com/gin-gonic/gin.HandlerFunc
- notification-store.ts
- otp/provider.go
- dependencies
- compilerOptions
- app/layout.tsx
- tasks
- 2. Touch Target Remediations (WCAG 2.5.5 / 2.5.8)
- components.json
- useAuthStore
- package.json
- github.com/gin-gonic/gin.Context
- DineFlow — Development Plan
- api.ts
- devDependencies
- scripts
- menu-nlp-engine.ts
- Section 2 — Product Requirements
- DineFlow — System Architecture
- Setup
- DineFlow — API Strategy
- eslint.config.mjs
- scripts
- Service
- 2. Exhaustive Browser QA Checklist
- tenant/tenant.go
- redisKey
- postcss.config.mjs
- github.com/dineflow/api
- printer.go
- Service
- DineFlow — Subscription Model
- Visual Regression & Before/After Comparison
- tasks/route.ts
- Collections
- platform-store.ts
- customer-review-hub.tsx
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
- Service
- generate-logo/route.ts
- review/service_test.go
- Ponytail: Anti-Overengineering & YAGNI Guardrails
- Ponytail Technical Debt Analysis
- Ponytail Configuration & Status
- web/README.md
- time.Time
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
- SubscriptionHandler
- Service
- menu/page.tsx
- notifications/page.tsx
- DineFlow Critical User Journeys (CUJs)
- DineFlow Engineering Principles & Shared Rules
- cn
- 1. Hospitality Operational Domains
- remotion.config.ts
- main
- getWhatsAppLogs
- extend-stay/route.ts
- 2. Functional Requirements
- 1. Core Performance Vectors
- RoomServiceMenuPage
- Client
- Backend Invariants & Development Rules
- deploy.sh
- gen-secrets.sh
- handlers/room.go
- Section 3 — Subscription & Billing
- AuthHandler
- NewFirebaseTestProvider
- spotlight-cursor.tsx
- go.mongodb.org/mongo-driver/v2/bson.ObjectID
- Maker
- react
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
- 5. Component Library
- ui/pricing.tsx
- peeking-chef.tsx
- .QueryCopilot
- Section 5 — Operations & Infrastructure
- 7. Layout System
- ai/service.go
- orders/route.ts
- Service

## God Nodes (most connected - your core abstractions)
1. `OK()` - 174 edges
2. `BadRequest()` - 156 edges
3. `react` - 140 edges
4. `GetTenantID()` - 124 edges
5. `Unauthorized()` - 120 edges
6. `lucide-react` - 108 edges
7. `cn()` - 107 edges
8. `useToast()` - 106 edges
9. `InternalError()` - 99 edges
10. `Button` - 72 edges

## Surprising Connections (you probably didn't know these)
- `Pre-Implementation Audit Protocol` --references--> `useTenantData()`  [INFERRED]
  .agents/agents/dineflow-frontend.md → apps/web/lib/stores/tenant-data-store.ts
- `main()` --calls--> `SetHealthDeps()`  [EXTRACTED]
  apps/api/cmd/server/main.go → apps/api/internal/interfaces/http/handlers/health.go
- `UpdateOrderStatusRequest` --references--> `OrderStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/order.go → apps/api/internal/domain/order/order.go
- `TestIndianPhoneValidation()` --calls--> `ValidateAndNormalizeIndianPhone()`  [INFERRED]
  apps/api/internal/domain/room/room_test.go → apps/api/internal/domain/room/room.go
- `UpdateTableStatusRequest` --references--> `TableStatus`  [EXTRACTED]
  apps/api/internal/interfaces/http/handlers/table.go → apps/api/internal/domain/table/table.go

## Import Cycles
- None detected.

## Communities (162 total, 39 thin omitted)

### Community 0 - "InternalError"
Cohesion: 0.10
Nodes (4): PlatformHandler, ReviewHandler, InternalError(), OKWithMeta()

### Community 1 - "Order"
Cohesion: 0.12
Nodes (10): Service, Order, DestinationType, OrderItem, OrderItemModifier, OrderSource, OrderStatus, OrderTimeline (+2 more)

### Community 2 - "handlers/menu.go"
Cohesion: 0.17
Nodes (13): NewMenuHandler(), go_pkg_github_com_dineflow_api_internal_application_menu, BulkCreateItemsRequest, BulkDeleteItemsRequest, BulkUpdateItemsRequest, CreateCategoryRequest, ScanMenuRequest, ToggleStockRequest (+5 more)

### Community 3 - "NewScope"
Cohesion: 0.11
Nodes (10): NewScope(), buildMenuItemFromUpsertRequest(), Category, MenuItem, PublicCategorySection, PublicMenuResponse, Service, Service (+2 more)

### Community 4 - "staff-storage.ts"
Cohesion: 0.15
Nodes (20): dynamic, GET(), POST(), AttendanceRecord, enrollStaff(), findStaffByPhone(), findStaffByPhoneAsync(), generateCheckInSignedUrl() (+12 more)

### Community 5 - "go_pkg_time"
Cohesion: 0.08
Nodes (51): ParseObjectID(), SendOTPRequest, go_pkg_bytes, go_pkg_context, go_pkg_crypto_rand, go_pkg_encoding_csv, go_pkg_encoding_json, go_pkg_errors (+43 more)

### Community 6 - "useToast"
Cohesion: 0.07
Nodes (55): VerifyContent(), PricingAlertsPage(), UpsellPage(), OffersStudioPage(), OrderStatus, OrderTrackingPage(), TrackingOrder, TrackingOrderItem (+47 more)

### Community 7 - "Service"
Cohesion: 0.04
Nodes (51): Service, BuildFeedbackRequestMessage(), BuildKitchenReadyMessage(), BuildOrderConfirmationMessage(), GetStandardTemplates(), IsOptOutKeyword(), NormalizePhoneNumber(), ParseRating() (+43 more)

### Community 8 - "context.Context"
Cohesion: 0.09
Nodes (19): ValidateAndNormalizeIndianPhone(), SessionStatus, context.Context, CreateTaskRequest, UpdateRoomStatusRequest, UpdateTaskRequest, ExtensionStatus, Guest (+11 more)

### Community 9 - "3. Comprehensive Issue Register & Auto-Fix Log"
Cohesion: 0.11
Nodes (18): 1. Executive Summary & Audit Metrics, 2. Multi-Viewport Testing Matrix, 3. Comprehensive Issue Register & Auto-Fix Log, 4. Mandatory Quality Checklist Verification, 5. Deliverables & PR Details, End-to-End Frontend QA Visual & Responsive Audit Report, [ISSUE-001] Menu Management: "In Stock" Status Badge Overlapping Edit Button, [ISSUE-002] TopBar: Global Search Input Compressed at Tablet Landscape (+10 more)

### Community 10 - "Service"
Cohesion: 0.14
Nodes (20): ChatbotMessage, ChatbotResponse, ChatTurn, ForecastDay, ForecastHour, ForecastResponse, MenuDescriptionRequest, MenuDescriptionResponse (+12 more)

### Community 11 - "webhook/route.ts"
Cohesion: 0.47
Nodes (5): dynamic, GET(), getGoBackendBase(), POST(), revalidate

### Community 12 - "config.go"
Cohesion: 0.18
Nodes (16): getEnv(), getEnvInt(), Load(), requireEnv(), AIConfig, AppConfig, Config, EmailConfig (+8 more)

### Community 13 - "register/page.tsx"
Cohesion: 0.07
Nodes (29): ForgotPasswordContent(), Step, RegisterPage(), ResetPasswordContent(), CTAButton, FormInput, FormInputProps, apps_web_components_auth_index_businesscategoryselector (+21 more)

### Community 14 - "testing.T"
Cohesion: 0.04
Nodes (68): NewService(), TestBroadcastOffer_Mock(), TestCreateOffer(), TestTrackOfferClick_NoPanic(), TestTrackOfferConversion_NoPanic(), TestSearchScenarios(), NewService(), TestSearchAll_EmptyQuery() (+60 more)

### Community 15 - "security-audit/main.go"
Cohesion: 0.25
Nodes (12): main(), testCORSOriginDefense(), testMetaWebhookHMACSignature(), testNoSQLInjectionInBody(), testNoSQLInjectionInQueryParams(), testRequestIDTracing(), testSecurityHeaders(), hasOperatorInjection() (+4 more)

### Community 16 - "OK"
Cohesion: 0.09
Nodes (5): AuthHandler, RoomHandler, TenantHandler, NotFound(), OK()

### Community 17 - "Service"
Cohesion: 0.08
Nodes (22): CalculateHealthScore(), AnnouncementInfo, AuditActor, AuditLogRecord, BusinessType, ClientStatus, DashboardMetrics, FeatureFlagDefinition (+14 more)

### Community 18 - "OpenWAProvider"
Cohesion: 0.08
Nodes (12): NewMetaCloudProvider(), NewOpenWAProvider(), CleanPhoneNumber(), FormatChatID(), net/http.Request, sync.RWMutex, MetaCloudConfig, MetaCloudProvider (+4 more)

### Community 19 - "DineFlow — UI/UX Guidelines"
Cohesion: 0.06
Nodes (33): 10. Responsive Breakpoints, 11. Iconography, 12. Empty States, 13. Toast / Notification System, 1. Design Philosophy, 2. Color Palette, 3. Typography, 4. Spacing System (+25 more)

### Community 20 - "BadRequest"
Cohesion: 0.09
Nodes (12): MenuHandler, NotificationHandler, StaffHandler, TableHandler, GetRole(), GetTenantID(), GetUserID(), ByTenant() (+4 more)

### Community 21 - "Subscription"
Cohesion: 0.16
Nodes (13): FormatPlanName(), GetLimits(), AdminOverrideRequest, CheckoutRequest, BillingCycle, CheckoutSessionResult, Invoice, PlanLimits (+5 more)

### Community 23 - "DineFlow Multi-Agent System Architecture"
Cohesion: 0.15
Nodes (12): 1. The Eight Primary Operational Roles, 2. Preserved Domain Specialists, 3. Technology Stack & Workspace Boundaries, 4. Mandatory Architectural Invariants, 5. MANDATORY DEVOPS PRODUCTION GUARDRAILS, 6. Multi-Agent Coordination Lifecycle, 7. Agent Discovery & Invocation, A. Server-Side Multi-Tenant Data Scoping (+4 more)

### Community 24 - "web/package.json"
Cohesion: 0.08
Nodes (24): Player, typescript, name, packageManager, private, version, axios, clsx (+16 more)

### Community 25 - "Scope"
Cohesion: 0.21
Nodes (8): ensureUpdatedAt(), go.mongodb.org/mongo-driver/v2/bson.M, go.mongodb.org/mongo-driver/v2/mongo.Cursor, go.mongodb.org/mongo-driver/v2/mongo.DeleteResult, go.mongodb.org/mongo-driver/v2/mongo.InsertManyResult, go.mongodb.org/mongo-driver/v2/mongo.InsertOneResult, go.mongodb.org/mongo-driver/v2/mongo.UpdateResult, Scope

### Community 26 - "github.com/gin-gonic/gin.HandlerFunc"
Cohesion: 0.32
Nodes (14): corsMiddleware(), requestLogger(), ChefOrAbove(), FinanceAdminOrAbove(), OwnerOnly(), OwnerOrManager(), PlatformAdminOrAbove(), RequireAnyRole() (+6 more)

### Community 27 - "notification-store.ts"
Cohesion: 0.17
Nodes (17): CATEGORIES, CATEGORY_META, NotifCard(), NotificationCenter(), sanitizeNotification(), timeAgo(), addDeletedIds(), combineNotificationMessages() (+9 more)

### Community 28 - "otp/provider.go"
Cohesion: 0.28
Nodes (8): Config, redis.Client, NewMSG91Provider(), OTPProvider, redis.Client, NewOTPProvider(), TestMSG91ProviderFallback(), Config

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

### Community 35 - "useAuthStore"
Cohesion: 0.05
Nodes (89): LoginPage(), AnalyticsPage(), DatePreset, DiningRecord, GuestDiningHistoryPage(), HotelGuestRecord, DashboardOverviewPage(), LiveReviewItem (+81 more)

### Community 36 - "package.json"
Cohesion: 0.08
Nodes (23): description, devDependencies, prettier, puppeteer-core, turbo, typescript, engines, node (+15 more)

### Community 37 - "github.com/gin-gonic/gin.Context"
Cohesion: 0.10
Nodes (12): WhatsAppHandler, PlanLimitMiddleware(), Conflict(), FeatureNotAvailable(), NoContent(), PlanLimitExceeded(), TooManyRequests(), ValidationError() (+4 more)

### Community 38 - "DineFlow — Development Plan"
Cohesion: 0.07
Nodes (30): 1.1 — Monorepo Setup, 1.2 — Backend Foundation (Go), 1.3 — Authentication Service, 1.4 — Multi-Tenancy Middleware, 1.5 — Frontend Foundation (Next.js), 1.6 — File Storage, 1.7 — Email Service, 2.1 — Onboarding (+22 more)

### Community 39 - "api.ts"
Cohesion: 0.11
Nodes (17): POST(), GET(), POST(), GET(), GET(), POST(), POST(), POST() (+9 more)

### Community 40 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti, @types/node, @types/react (+2 more)

### Community 41 - "scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, test, version

### Community 42 - "menu-nlp-engine.ts"
Cohesion: 0.13
Nodes (24): callGeminiVision(), GEMINI_MODELS, getDefaultGeminiKey(), maxDuration, POST(), RawMenuItem, ScanMenuRequestBody, MenuUploadModal() (+16 more)

### Community 43 - "Section 2 — Product Requirements"
Cohesion: 0.22
Nodes (9): P1. What counts as a "table" for food trucks?, P2. Customer phone number at checkout, P3. Can a customer order multiple rounds from the same table?, P4. Online payment model, P5. Unavailable item display, P6. What is the order cancellation policy?, P7. Split billing, P8. What is the ordering flow for hotel room service after midnight? (+1 more)

### Community 44 - "DineFlow — System Architecture"
Cohesion: 0.07
Nodes (27): Application Structure, Architecture Philosophy, Backend Architecture, Clean Architecture Dependency Flow, Customer Ordering Page — SSG + ISR, Database Architecture, Deployment Architecture, Deployment Pipeline (+19 more)

### Community 45 - "Setup"
Cohesion: 0.10
Nodes (6): AnalyticsHandler, OfferHandler, OrderHandler, Auth(), RateLimit(), Setup()

### Community 46 - "DineFlow — API Strategy"
Cohesion: 0.08
Nodes (24): API Design Principles, API Rate Limits, Base URLs, Client → Server (Actions), DineFlow — API Strategy, Module 10 — Menu Items, Module 11 — Modifier Groups, Module 12 — Customer Ordering (Public API — No Auth) (+16 more)

### Community 47 - "eslint.config.mjs"
Cohesion: 0.40
Nodes (4): eslintConfig, ref_eslint_config, ref_eslint_config_next_core_web_vitals, ref_eslint_config_next_typescript

### Community 48 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, start, video:preview, video:render, video:render:qr

### Community 49 - "Service"
Cohesion: 0.15
Nodes (9): generateSlug(), ValidatePasswordComplexity(), NormalizePhone(), AuthResponse, LoginRequest, RegisterRequest, Service, VerifyOTPRequest (+1 more)

### Community 50 - "2. Exhaustive Browser QA Checklist"
Cohesion: 0.20
Nodes (9): 1. Targeted Viewports & Breakpoints, 2. Exhaustive Browser QA Checklist, 3. High-Priority User Journeys to Inspect, 4. Execution Guardrails, A. Horizontal Overflow & Layout Integrity, B. Mobile Operational Ergonomics, C. Modal & Drawer Scroll Containment, D. Dual-Theme Contrast & WCAG Compliance (+1 more)

### Community 51 - "tenant/tenant.go"
Cohesion: 0.26
Nodes (15): FeaturesForPlan(), BusinessType, Tenant, LimitsForPlan(), Address, Contact, DayHours, Features (+7 more)

### Community 52 - "redisKey"
Cohesion: 0.18
Nodes (8): GenerateCode(), redis.Client, NewService(), redisKey(), TestGenerateCode(), net/http.Client, MSG91Provider, Service

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

### Community 61 - "platform-store.ts"
Cohesion: 0.03
Nodes (83): DashboardLayout(), MobileNavSubItemsInner(), RootLoading(), PlatformLayout(), ChatMessage, CopilotDrawer(), MOCK_AI_RESPONSES, PRESET_QUERIES (+75 more)

### Community 62 - "customer-review-hub.tsx"
Cohesion: 0.12
Nodes (15): CustomerReviewHub(), useTheme(), AetherParticleCanvas(), AetherParticleCanvasProps, ThemeToggle(), ThemeToggleProps, DEFAULT_VIBES, generateAIReviewOptions() (+7 more)

### Community 63 - "DineFlow — Feature Roadmap"
Cohesion: 0.10
Nodes (21): 2A — Business Onboarding, 2B — Menu Management, 2C — QR Code System, 2D — Customer Ordering Experience, 2E — Order Management (Staff Dashboard), 2F — Kitchen Display System, 2G — Basic Analytics, Cross-Phase Dependencies Map (+13 more)

### Community 64 - "DineFlow — Product Vision"
Cohesion: 0.09
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
Cohesion: 0.07
Nodes (26): A1. Backend Language: Go vs. Node.js, A2. Monorepo Tool: Turborepo vs. Nx, A3. Database: MongoDB Only vs. MongoDB + PostgreSQL, A4. Frontend Framework: Next.js App Router vs. Pages Router, A5. WebSocket: Socket.io vs. Native WebSocket, DineFlow — Questions, Assumptions & Risks, R1. WhatsApp Template Approval Delays, R2. Razorpay Subscription Webhook Reliability (+18 more)

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

### Community 79 - "Service"
Cohesion: 0.31
Nodes (4): NewService(), Service, go_pkg_github_com_resend_resend_go_v2, resend.Client

### Community 80 - "generate-logo/route.ts"
Cohesion: 0.22
Nodes (14): ACTIVE_GEMINI_MODELS, ARCHETYPE_CONFIGS, createArchetypeLogo(), detectMotif(), generateArchetypeProceduralSvg(), GenerateLogoRequest, generateWithGemini(), getGeminiApiKey() (+6 more)

### Community 81 - "review/service_test.go"
Cohesion: 0.32
Nodes (6): NewService(), TestGenerateReviewSuggestions_AllEightHighlights(), TestGenerateReviewSuggestions_MockFallback(), TestGetReviewStats_Calculation(), TestReviewDomainTypes(), go_pkg_github_com_dineflow_api_internal_domain_review

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

### Community 86 - "time.Time"
Cohesion: 0.06
Nodes (35): cleanPhoneNumber(), CalculateDistanceMeters(), PublicProfile, User, IsPlatformRole(), TestCalculateDistanceMeters(), time.Time, UpdateStaffRequest (+27 more)

### Community 87 - "server/main.go"
Cohesion: 0.04
Nodes (60): NewAuthHandler(), Health(), SetHealthDeps(), Version(), NewOfferHandler(), NewPlatformHandler(), NewReviewHandler(), SearchHandler (+52 more)

### Community 88 - "DineFlow Frontend Specialist Agent (`dineflow-frontend`)"
Cohesion: 0.18
Nodes (10): 1. 21st.dev Design System Compliance, 2. Viewport & Breakpoint Testing, 3. Mobile Viewport Optimization Rules, 4. Dual-Theme Contrast Invariant, Core UI/UX & Design Invariants, DineFlow Frontend Specialist Agent (`dineflow-frontend`), Pre-Implementation Audit Protocol, Quality & Validation Checklist (+2 more)

### Community 116 - "Service"
Cohesion: 0.22
Nodes (7): CategoryShare, HourlyPoint, OverviewMetrics, Service, TopItemMetric, NewService(), NewAnalyticsHandler()

### Community 117 - "menu/page.tsx"
Cohesion: 0.14
Nodes (29): IMAGE_PRESETS, MenuManagementPage(), CameraMenuScannerModal(), CameraMenuScannerModalProps, CapturedPage, parseItemsFromResponse(), MenuBulkToolbar(), MenuBulkToolbarProps (+21 more)

### Community 118 - "notifications/page.tsx"
Cohesion: 0.33
Nodes (6): CATEGORIES, CATEGORY_META, NotificationsPage(), PRIORITIES, PRIORITY_BADGE, timeAgo()

### Community 119 - "DineFlow Critical User Journeys (CUJs)"
Cohesion: 0.18
Nodes (10): 12-Step QA Execution Workflow, DineFlow Critical User Journeys (CUJs), DineFlow QA & Quality Engineering Agent (`dineflow-qa`), Empirical Reporting Standards, Journey 1: Customer Dining Experience, Journey 2: Kitchen Order Display (KDS), Journey 3: Hotel Guest & In-Room Dining, Journey 4: Workforce & Operations (+2 more)

### Community 120 - "DineFlow Engineering Principles & Shared Rules"
Cohesion: 0.18
Nodes (10): 1. System Overview & Domain Invariants, 2. Core Execution Rule, 3. Anti-Duplication & Architectural Reuse, 4. Preservation of the Existing System, 5. Real Data vs. Mock Data Policy, 6. Strict Multi-Tenant Data Isolation, 7. Security Invariants, 8. Quality & Engineering Standards (+2 more)

### Community 121 - "cn"
Cohesion: 0.04
Nodes (74): INITIAL_KDS_ORDERS, KdsItem, KdsOrder, KDSOrdersPage(), MENU_PRESETS, INITIAL_INVOICES, Invoice, SettingsPage() (+66 more)

### Community 122 - "1. Hospitality Operational Domains"
Cohesion: 0.22
Nodes (8): 1. Hospitality Operational Domains, 2. Product Review Standards, A. Restaurant Dine-In & Quick Service (QSR), B. Hotel PMS & In-Room Guest Services, C. Workforce & Operational HRMS, D. Omnichannel Guest Communication, DineFlow Product Reviewer Agent (`dineflow-product-reviewer`), E. Multi-Tenant Platform Administration

### Community 124 - "main"
Cohesion: 0.07
Nodes (33): main(), runStartupCleanup(), seedDefaultData(), seedPlatformData(), NewService(), NewService(), NewService(), NewService() (+25 more)

### Community 125 - "getWhatsAppLogs"
Cohesion: 0.32
Nodes (6): dynamic, GET(), revalidate, dynamic, POST(), getWhatsAppLogs()

### Community 126 - "extend-stay/route.ts"
Cohesion: 0.38
Nodes (6): dynamic, GET(), getExtensionStore(), POST(), revalidate, StayExtensionRecord

### Community 127 - "2. Functional Requirements"
Cohesion: 0.06
Nodes (33): 1. User Personas, 2.10 Staff Management, 2.11 WhatsApp Integration, 2.12 Analytics & Reporting, 2.13 Settings & Configuration, 2.1 Authentication & Multi-Tenancy, 2.2 Subscription & Billing, 2.3 Onboarding (+25 more)

### Community 128 - "1. Core Performance Vectors"
Cohesion: 0.25
Nodes (7): 1. Core Performance Vectors, 2. Safe Performance Audit Protocol, A. MongoDB Indexing & Query Efficiency, B. Redis Caching & Rate Limiting Strategy, C. Next.js Bundle Size & Rendering Efficiency, D. Server Resource Efficiency (Go Backend), DineFlow Performance Specialist Agent (`dineflow-performance`)

### Community 130 - "Client"
Cohesion: 0.09
Nodes (8): NewService(), Client, New(), IPBlocklist(), JWTConfig, ServerConfig, time.Duration, RateLimitResult

### Community 131 - "Backend Invariants & Development Rules"
Cohesion: 0.20
Nodes (9): 1. Mandatory Server-Side Multi-Tenant Scoping, 2. Standardized API Response & Error Handling, 3. Database Schema Integrity & Indexing, 4. External Webhook & Integration Guidelines, Backend Invariants & Development Rules, Backend Quality & Validation Checklist, DineFlow Backend Specialist Agent (`dineflow-backend`), Directory & Architectural Organization (+1 more)

### Community 134 - "handlers/room.go"
Cohesion: 0.07
Nodes (28): StorageService, NewService(), TestStorageValidation(), NewRoomHandler(), StorageHandler, NewStorageHandler(), NewWhatsAppHandler(), verifyMetaSignature() (+20 more)

### Community 135 - "Section 3 — Subscription & Billing"
Cohesion: 0.33
Nodes (6): B1. Free trial for new registrations, B2. How is proration handled on mid-cycle upgrades?, B3. Can a single tenant have multiple subscriptions (e.g., base plan + white-label add-on)?, B4. What currency should the Free plan's invoice show?, B5. Are there usage-based charges beyond the flat subscription?, Section 3 — Subscription & Billing

### Community 136 - "AuthHandler"
Cohesion: 0.33
Nodes (4): clearRefreshTokenCookie(), AuthHandler, setRefreshTokenCookie(), GetTokenID()

### Community 137 - "NewFirebaseTestProvider"
Cohesion: 0.40
Nodes (4): Config, redis.Client, NewFirebaseTestProvider(), FirebaseTestProvider

### Community 138 - "spotlight-cursor.tsx"
Cohesion: 0.32
Nodes (5): Component(), ComponentProps, SpotlightConfig, SpotlightCursor, useSpotlightEffect()

### Community 139 - "go.mongodb.org/mongo-driver/v2/bson.ObjectID"
Cohesion: 0.10
Nodes (14): cleanGuestName(), cleanOrderNumber(), cleanTableName(), Service, go.mongodb.org/mongo-driver/v2/bson.ObjectID, CreateNotificationRequest, Category, CreateNotificationInput (+6 more)

### Community 140 - "Maker"
Cohesion: 0.30
Nodes (7): Maker, NewMaker(), TestTokenMaker(), go_pkg_github_com_golang_jwt_jwt_v5, jwt.RegisteredClaims, Claims, TokenType

### Community 141 - "react"
Cohesion: 0.05
Nodes (77): DAYS, ForecastPage(), generateForecast(), getIntensityClass(), HOURS, INSIGHTS, getDescription(), MenuWriterPage() (+69 more)

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
Cohesion: 0.10
Nodes (9): dynamic, revalidate, dynamic, dynamic, revalidate, dynamic, revalidate, config (+1 more)

### Community 153 - "5. Component Library"
Cohesion: 0.33
Nodes (6): 5. Component Library, Badges / Status Chips, Button System, Cards, Input Fields, KDS Order Card

### Community 154 - "ui/pricing.tsx"
Cohesion: 0.09
Nodes (19): HOTEL_LOADING_MESSAGES, HOTEL_STEPS, JourneyStep, JourneyType, LandingCustomerJourney(), RESTAURANT_LOADING_MESSAGES, RESTAURANT_STEPS, CANONICAL_PLANS (+11 more)

### Community 156 - ".QueryCopilot"
Cohesion: 0.50
Nodes (3): CopilotBriefResponse, CopilotQueryRequest, CopilotQueryResponse

### Community 157 - "Section 5 — Operations & Infrastructure"
Cohesion: 0.40
Nodes (5): O1. Deployment platform, O2. Primary deployment region?, O3. How will we handle database migrations?, O4. How do we handle a tenant with 10,000 menu items or orders?, Section 5 — Operations & Infrastructure

### Community 158 - "7. Layout System"
Cohesion: 0.40
Nodes (5): 7. Layout System, Customer Ordering Page, Dashboard Layout, Grid System, KDS Layout

### Community 159 - "ai/service.go"
Cohesion: 0.19
Nodes (11): geminiRequest, geminiResponse, ScannedDish, TestCopilotBrief_MockMode(), TestCopilotQuery_Classification(), getDefaultGeminiKey(), mockScannedDishes(), NewService() (+3 more)

### Community 162 - "Service"
Cohesion: 0.15
Nodes (8): cleanReviewTag(), mockReviewSuggestions(), GenerateReviewRequest, GenerateReviewResponse, PrivateFeedback, PublicRestaurantReviewMeta, ReviewStats, Service

## Knowledge Gaps
- **890 isolated node(s):** `TestResult`, `github.com/dineflow/api`, `geminiRequest`, `geminiResponse`, `SendOTPRequest` (+885 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1096 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Service` connect `Service` to `Service`, `go_pkg_time`, `github.com/gin-gonic/gin.Context`, `handlers/room.go`, `context.Context`, `testing.T`, `OK`, `OpenWAProvider`, `redisKey`, `time.Time`, `Service`, `main`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `video/page.tsx`, `useAuthStore`, `useToast`, `api.ts`, `TubesCursor`, `spotlight-cursor.tsx`, `peeking-chef.tsx`, `register/page.tsx`, `menu/page.tsx`, `notifications/page.tsx`, `landing-workflow.tsx`, `web/package.json`, `cn`, `ui/pricing.tsx`, `notification-store.ts`, `platform-store.ts`, `customer-review-hub.tsx`, `app/layout.tsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `RoomHandler` connect `OK` to `handlers/room.go`, `Service`, `context.Context`, `go.mongodb.org/mongo-driver/v2/bson.ObjectID`, `Setup`, `BadRequest`, `time.Time`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `TestResult`, `github.com/dineflow/api`, `geminiRequest` to the rest of the system?**
  _890 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `InternalError` be split into smaller, more focused modules?**
  _Cohesion score 0.0975177304964539 - nodes in this community are weakly interconnected._
- **Should `Order` be split into smaller, more focused modules?**
  _Cohesion score 0.1206896551724138 - nodes in this community are weakly interconnected._
- **Should `NewScope` be split into smaller, more focused modules?**
  _Cohesion score 0.11201079622132254 - nodes in this community are weakly interconnected._