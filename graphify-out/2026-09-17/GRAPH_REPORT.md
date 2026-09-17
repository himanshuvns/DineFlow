# Graph Report - DineFlow  (2026-09-17)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1393 nodes · 4180 edges · 55 communities (50 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b3c92ff2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- github.com/gin-gonic/gin.Context
- react
- lucide-react
- Service
- useToast
- go_pkg_fmt
- server/main.go
- context.Context
- time.Time
- menu/page.tsx
- ai/service.go
- generate-logo/route.ts
- main
- [roomNumber]/page.tsx
- go_pkg_go_mongodb_org_mongo_driver_v2_bson
- config.go
- menu-nlp-engine.ts
- go_pkg_time
- go.mongodb.org/mongo-driver/v2/bson.ObjectID
- whatsapp/whatsapp.go
- useAuthStore
- Subscription
- Order
- notification-center.tsx
- web/package.json
- Scope
- handlers/room.go
- auth/service.go
- storage/storage.go
- dependencies
- compilerOptions
- app/layout.tsx
- tasks
- handlers/menu.go
- components.json
- forecast/page.tsx
- package.json
- Hub
- printer.go
- handlers/table.go
- devDependencies
- scripts
- Service
- github.com/gin-gonic/gin.HandlerFunc
- scripts
- demo.tsx
- [orderId]/page.tsx
- eslint.config.mjs
- scripts
- web/vercel.json
- vercel.json
- peeking-chef.tsx
- next
- postcss.config.mjs
- github.com/dineflow/api

## God Nodes (most connected - your core abstractions)
1. `OK()` - 78 edges
2. `react` - 77 edges
3. `GetTenantID()` - 76 edges
4. `BadRequest()` - 76 edges
5. `Unauthorized()` - 73 edges
6. `useToast()` - 72 edges
7. `cn()` - 66 edges
8. `lucide-react` - 56 edges
9. `main()` - 41 edges
10. `NewScope()` - 39 edges

## Surprising Connections (you probably didn't know these)
- `RegisterPage()` --calls--> `useToast()`  [EXTRACTED]
  apps/web/app/(auth)/register/page.tsx → apps/web/components/ui/toast.tsx
- `OrderTrackingPage()` --calls--> `useToast()`  [EXTRACTED]
  apps/web/app/m/[tenantSlug]/order/[orderId]/page.tsx → apps/web/components/ui/toast.tsx
- `RequireRole()` --calls--> `GetRole()`  [INFERRED]
  apps/api/internal/interfaces/http/middleware/rbac.go → apps/api/internal/interfaces/http/middleware/auth.go
- `main()` --calls--> `SetHealthDeps()`  [EXTRACTED]
  apps/api/cmd/server/main.go → apps/api/internal/interfaces/http/handlers/health.go
- `TestIndianPhoneValidation()` --calls--> `ValidateAndNormalizeIndianPhone()`  [INFERRED]
  apps/api/internal/domain/room/room_test.go → apps/api/internal/domain/room/room.go

## Import Cycles
- None detected.

## Communities (55 total, 5 thin omitted)

### Community 0 - "github.com/gin-gonic/gin.Context"
Cohesion: 0.06
Nodes (44): AIHandler, AnalyticsHandler, clearRefreshTokenCookie(), AuthHandler, AuthHandler, setRefreshTokenCookie(), MenuHandler, NotificationHandler (+36 more)

### Community 1 - "react"
Cohesion: 0.05
Nodes (52): LoginPage(), RegisterPage(), SettingsPage(), BUSINESS_CATEGORIES, BusinessCategory, BusinessCategorySelector(), BusinessCategorySelectorProps, ChefMascot() (+44 more)

### Community 2 - "lucide-react"
Cohesion: 0.10
Nodes (44): INITIAL_TENANTS, TenantRecord, getDescription(), MenuWriterPage(), MOCK_DESCRIPTIONS, SAMPLE_ITEMS, TONES, AI_TOOLS (+36 more)

### Community 3 - "Service"
Cohesion: 0.05
Nodes (46): generateSlug(), FeaturesForPlan(), BusinessType, Tenant, LimitsForPlan(), DefaultPermissionsForRole(), PublicProfile, User (+38 more)

### Community 4 - "useToast"
Cohesion: 0.07
Nodes (37): PlatformAdminPage(), ForgotPasswordPage(), ResetPasswordPage(), VerifyContent(), PricingAlertsPage(), UpsellPage(), AnalyticsPage(), StaffPage() (+29 more)

### Community 5 - "go_pkg_fmt"
Cohesion: 0.08
Nodes (32): CategoryShare, HourlyPoint, OverviewMetrics, TopItemMetric, NewService(), NewService(), NewService(), NewService() (+24 more)

### Community 6 - "server/main.go"
Cohesion: 0.08
Nodes (33): corsMiddleware(), NewAnalyticsHandler(), NewNotificationHandler(), NewStaffHandler(), NewSubscriptionHandler(), NewWhatsAppHandler(), ByIP(), ByIPAndRoute() (+25 more)

### Community 7 - "context.Context"
Cohesion: 0.13
Nodes (8): Service, NewScope(), context.Context, Category, Service, Service, Service, Table

### Community 8 - "time.Time"
Cohesion: 0.12
Nodes (15): ValidateAndNormalizeIndianPhone(), NewRoomHandler(), time.Time, CheckInInput, Guest, GuestStatus, HousekeepingTask, Room (+7 more)

### Community 9 - "menu/page.tsx"
Cohesion: 0.11
Nodes (33): IMAGE_PRESETS, MenuManagementPage(), INITIAL_KDS_ORDERS, KdsItem, KdsOrder, KDSOrdersPage(), MENU_PRESETS, DashboardOverviewPage() (+25 more)

### Community 10 - "ai/service.go"
Cohesion: 0.11
Nodes (27): ChatbotMessage, ChatbotResponse, ChatTurn, ForecastDay, ForecastHour, ForecastResponse, geminiRequest, geminiResponse (+19 more)

### Community 11 - "generate-logo/route.ts"
Cohesion: 0.06
Nodes (22): ACTIVE_GEMINI_MODELS, ARCHETYPE_CONFIGS, createArchetypeLogo(), generateArchetypeProceduralSvg(), GenerateLogoRequest, generateWithGemini(), LogoVariation, maxDuration (+14 more)

### Community 12 - "main"
Cohesion: 0.09
Nodes (16): main(), requestLogger(), runStartupCleanup(), seedDefaultData(), New(), Client, New(), New() (+8 more)

### Community 13 - "[roomNumber]/page.tsx"
Cohesion: 0.13
Nodes (25): getStayMetrics(), RoomsDirectoryPage(), getStayMetrics(), RoomDetailPage(), MenuItem, RoomInfo, RoomServiceMenuPage(), SuiteTab (+17 more)

### Community 14 - "go_pkg_go_mongodb_org_mongo_driver_v2_bson"
Cohesion: 0.10
Nodes (25): TestCategoryValidation(), TestMenuItemValidation(), TestOrderCalculations(), TestOrderStatusTransitions(), TestGuestValidation(), TestHousekeepingTaskValidation(), TestIndianPhoneValidation(), TestRoomValidation() (+17 more)

### Community 15 - "config.go"
Cohesion: 0.12
Nodes (22): getEnv(), getEnvInt(), Load(), requireEnv(), Maker, NewMaker(), AIConfig, AppConfig (+14 more)

### Community 16 - "menu-nlp-engine.ts"
Cohesion: 0.12
Nodes (26): callGeminiVision(), GEMINI_MODELS, maxDuration, POST(), RawMenuItem, ScanMenuRequestBody, CameraMenuScannerModalProps, MenuStagingPreviewModalProps (+18 more)

### Community 17 - "go_pkg_time"
Cohesion: 0.11
Nodes (20): NewService(), TestGenerateBillText(), TestGenerateKOTText(), Health(), SetHealthDeps(), Version(), NewTenantHandler(), go_pkg_github_com_dineflow_api_internal_domain_menu (+12 more)

### Community 18 - "go.mongodb.org/mongo-driver/v2/bson.ObjectID"
Cohesion: 0.18
Nodes (8): go.mongodb.org/mongo-driver/v2/bson.ObjectID, CreateNotificationRequest, Category, CreateNotificationInput, Notification, Priority, Service, Invoice

### Community 19 - "whatsapp/whatsapp.go"
Cohesion: 0.14
Nodes (15): BuildFeedbackRequestMessage(), BuildKitchenReadyMessage(), BuildOrderConfirmationMessage(), IsOptOutKeyword(), ParseRating(), TestBuildOrderConfirmationMessage(), TestIsOptOutKeyword(), TestParseRating() (+7 more)

### Community 20 - "useAuthStore"
Cohesion: 0.16
Nodes (19): DashboardLayout(), NAV_ITEMS, Sidebar(), ROUTE_TITLES, TopBar(), BUSINESS_CATEGORIES, COLORS, GeminiLogoModal() (+11 more)

### Community 21 - "Subscription"
Cohesion: 0.17
Nodes (12): FormatPlanName(), GetLimits(), AdminOverrideRequest, CheckoutRequest, BillingCycle, PlanLimits, PlanTier, PlatformMetrics (+4 more)

### Community 22 - "Order"
Cohesion: 0.17
Nodes (11): Order, DestinationType, notifServiceIface, OrderItem, OrderItemModifier, OrderSource, OrderStatus, OrderTimeline (+3 more)

### Community 23 - "notification-center.tsx"
Cohesion: 0.13
Nodes (20): CATEGORIES, CATEGORY_META, NotificationsPage(), PRIORITIES, PRIORITY_BADGE, timeAgo(), CATEGORIES, CATEGORY_META (+12 more)

### Community 24 - "web/package.json"
Cohesion: 0.09
Nodes (22): name, packageManager, private, version, axios, clsx, eslint, eslint-config-next (+14 more)

### Community 25 - "Scope"
Cohesion: 0.21
Nodes (8): ensureUpdatedAt(), go.mongodb.org/mongo-driver/v2/bson.M, go.mongodb.org/mongo-driver/v2/mongo.Cursor, go.mongodb.org/mongo-driver/v2/mongo.DeleteResult, go.mongodb.org/mongo-driver/v2/mongo.InsertManyResult, go.mongodb.org/mongo-driver/v2/mongo.InsertOneResult, go.mongodb.org/mongo-driver/v2/mongo.UpdateResult, Scope

### Community 26 - "handlers/room.go"
Cohesion: 0.11
Nodes (15): go_pkg_bytes, go_pkg_encoding_base64, go_pkg_encoding_json, go_pkg_github_com_dineflow_api_internal_application_room, go_pkg_github_com_joho_godotenv, go_pkg_io, go_pkg_net_url, BulkRoomsRequest (+7 more)

### Community 27 - "auth/service.go"
Cohesion: 0.14
Nodes (15): NewService(), NewAuthHandler(), OTPProvider, redis.Client, NewOTPProvider(), EmailSender, LoginRequest, SendOTPRequest (+7 more)

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
Cohesion: 0.12
Nodes (14): apps_web_app_globals, manrope, metadata, plusJakarta, spaceGrotesk, viewport, ResolvedTheme, Theme (+6 more)

### Community 32 - "tasks"
Cohesion: 0.11
Nodes (17): dependsOn, inputs, outputs, cache, cache, persistent, dependsOn, $schema (+9 more)

### Community 33 - "handlers/menu.go"
Cohesion: 0.18
Nodes (14): buildMenuItemFromUpsertRequest(), go_pkg_github_com_dineflow_api_internal_application_menu, BulkCreateItemsRequest, BulkDeleteItemsRequest, BulkUpdateItemsRequest, CreateCategoryRequest, ScanMenuRequest, ToggleStockRequest (+6 more)

### Community 34 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 35 - "forecast/page.tsx"
Cohesion: 0.18
Nodes (9): DAYS, ForecastPage(), generateForecast(), getIntensityClass(), HOURS, INSIGHTS, DEFAULT_HOSPITALITY_MESSAGES, HospitalityLoader() (+1 more)

### Community 36 - "package.json"
Cohesion: 0.13
Nodes (14): description, devDependencies, prettier, turbo, typescript, engines, node, typescript (+6 more)

### Community 37 - "Hub"
Cohesion: 0.20
Nodes (8): NewService(), GetHub(), Hub, NewOrderHandler(), sync.RWMutex, EventType, NotificationEvent, OrderEvent

### Community 38 - "printer.go"
Cohesion: 0.36
Nodes (10): centerText(), GenerateBillText(), GenerateKOTText(), padRow(), truncate(), BillData, BillItem, KOTData (+2 more)

### Community 39 - "handlers/table.go"
Cohesion: 0.27
Nodes (8): NewTableHandler(), go_pkg_github_com_dineflow_api_internal_application_table, BulkCreateRoomsRequest, CreateTableRequest, ToggleDNDRequest, UpdateTableStatusRequest, LocationType, TableStatus

### Community 40 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti, @types/node, @types/react (+2 more)

### Community 41 - "scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, test, version

### Community 42 - "Service"
Cohesion: 0.39
Nodes (3): NewService(), Service, resend.Client

### Community 43 - "github.com/gin-gonic/gin.HandlerFunc"
Cohesion: 0.61
Nodes (7): ChefOrAbove(), OwnerOnly(), OwnerOrManager(), RequireAnyRole(), RequireRole(), WaiterOrAbove(), github.com/gin-gonic/gin.HandlerFunc

### Community 44 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, clean, dev, format, lint, test

### Community 46 - "[orderId]/page.tsx"
Cohesion: 0.40
Nodes (4): OrderStatus, OrderTrackingPage(), TrackingOrder, TrackingOrderItem

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

## Knowledge Gaps
- **289 isolated node(s):** `BusinessCategory`, `BusinessCategorySelectorProps`, `ChefMascotProps`, `CTAButtonProps`, `FloatingCardProps` (+284 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 377 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `lucide-react`, `forecast/page.tsx`, `useToast`, `menu/page.tsx`, `[roomNumber]/page.tsx`, `[orderId]/page.tsx`, `peeking-chef.tsx`, `useAuthStore`, `notification-center.tsx`, `web/package.json`, `app/layout.tsx`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `lucide-react` to `react`, `forecast/page.tsx`, `useToast`, `menu/page.tsx`, `[roomNumber]/page.tsx`, `[orderId]/page.tsx`, `useAuthStore`, `notification-center.tsx`, `web/package.json`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `RoomHandler` connect `github.com/gin-gonic/gin.Context` to `time.Time`, `handlers/room.go`, `go.mongodb.org/mongo-driver/v2/bson.ObjectID`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `BusinessCategory`, `BusinessCategorySelectorProps`, `ChefMascotProps` to the rest of the system?**
  _289 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `github.com/gin-gonic/gin.Context` be split into smaller, more focused modules?**
  _Cohesion score 0.05777253763830945 - nodes in this community are weakly interconnected._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.05411392405063291 - nodes in this community are weakly interconnected._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.10464231354642313 - nodes in this community are weakly interconnected._