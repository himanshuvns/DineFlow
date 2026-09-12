# DineFlow — Development Plan

---

## How to Read This Plan

- **Priority**: P0 (must-have), P1 (should-have), P2 (nice-to-have)
- **Effort**: XS (<4h), S (1d), M (2-3d), L (1w), XL (2w)
- **Status**: 🔴 Not started | 🟡 In progress | 🟢 Done | ⏸ Blocked

---

## Phase 0 — Planning & Architecture

> Goal: All planning documents done, technical decisions finalized, team aligned.

| # | Task | Priority | Effort | Dependencies | Acceptance Criteria | Status |
|---|---|---|---|---|---|---|
| 0.1 | Write PRODUCT_VISION.md | P0 | XS | None | Vision, mission, metrics defined | 🟢 |
| 0.2 | Write PRODUCT_REQUIREMENTS.md | P0 | S | 0.1 | All FRs, NFRs, personas, journeys documented | 🟢 |
| 0.3 | Write FEATURE_ROADMAP.md | P0 | S | 0.2 | All phases with priorities and efforts | 🟢 |
| 0.4 | Write SYSTEM_ARCHITECTURE.md | P0 | M | 0.2 | Architecture diagrams, stack decisions final | 🟢 |
| 0.5 | Write DATABASE_DESIGN.md | P0 | M | 0.4 | All collections with schemas and indexes | 🟢 |
| 0.6 | Write API_STRATEGY.md | P0 | M | 0.4, 0.5 | All endpoints grouped by module | 🟢 |
| 0.7 | Write UI_UX_GUIDELINES.md | P0 | M | 0.1 | Complete design system documented | 🟢 |
| 0.8 | Write SUBSCRIPTION_MODEL.md | P0 | S | 0.2 | All plans, limits, and grace period defined | 🟢 |
| 0.9 | Write DEVELOPMENT_PLAN.md | P0 | M | All above | This document | 🟢 |
| 0.10 | Write QUESTIONS_AND_ASSUMPTIONS.md | P0 | S | All above | All risks and open questions documented | 🟢 |
| 0.11 | **Stakeholder review & approval** | P0 | S | All above | Written approval to proceed to Phase 1 | 🔴 |

---

## Phase 1 — Foundation & Infrastructure

> Goal: Technical skeleton running locally and in CI. Auth working. Two isolated tenants proven.

### 1.1 — Monorepo Setup

| # | Task | Priority | Effort | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|
| 1.1.1 | Initialize monorepo (Turborepo or Nx) | P0 | S | 0.11 | `pnpm dev` boots all services |
| 1.1.2 | Configure TypeScript shared config | P0 | XS | 1.1.1 | Strict TS, path aliases working |
| 1.1.3 | Configure ESLint + Prettier + Husky | P0 | XS | 1.1.1 | Pre-commit hooks run |
| 1.1.4 | Set up GitHub Actions CI pipeline | P0 | S | 1.1.1 | Pipeline passes on PR |
| 1.1.5 | Configure Docker Compose (local dev) | P0 | S | 1.1.1 | `docker compose up` boots MongoDB + Redis + API |

### 1.2 — Backend Foundation (Go)

| # | Task | Priority | Effort | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|
| 1.2.1 | Initialize Go module with Gin framework | P0 | XS | 1.1.5 | `go run main.go` starts API on :8080 |
| 1.2.2 | Structured logger (Zap) | P0 | XS | 1.2.1 | JSON logs in production, pretty in dev |
| 1.2.3 | Error handling middleware | P0 | S | 1.2.1 | All panics captured, consistent error envelope |
| 1.2.4 | Request validation middleware (go-validator) | P0 | S | 1.2.1 | Invalid requests return 422 with field errors |
| 1.2.5 | MongoDB connection with retry | P0 | S | 1.1.5 | Connection pool established on startup |
| 1.2.6 | Redis connection | P0 | XS | 1.1.5 | Redis ping successful on startup |
| 1.2.7 | Health check endpoint (`GET /health`) | P0 | XS | 1.2.5, 1.2.6 | Returns DB + Redis status |
| 1.2.8 | Clean Architecture folder structure | P0 | S | 1.2.1 | domain/application/infra/interfaces dirs |
| 1.2.9 | Environment config loading (godotenv) | P0 | XS | 1.2.1 | .env loaded, required vars validated on start |

### 1.3 — Authentication Service

| # | Task | Priority | Effort | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|
| 1.3.1 | User registration endpoint | P0 | M | 1.2.5 | Creates tenant + user in DB |
| 1.3.2 | OTP generation and email delivery | P0 | M | 1.3.1 | OTP email arrives within 30 seconds |
| 1.3.3 | OTP verification endpoint | P0 | S | 1.3.2 | Returns access + refresh token on success |
| 1.3.4 | Login with email + password | P0 | S | 1.3.1 | Bcrypt comparison, rate limited |
| 1.3.5 | JWT access token generation (15 min TTL) | P0 | S | 1.3.1 | Token decoded, claims verified |
| 1.3.6 | Refresh token rotation (7 day TTL) | P0 | M | 1.3.5 | Old token invalidated on refresh |
| 1.3.7 | Auth middleware (JWT verification) | P0 | S | 1.3.5 | Unauthorized returns 401 |
| 1.3.8 | Logout endpoint (revoke refresh token) | P0 | XS | 1.3.6 | Token no longer accepted |
| 1.3.9 | Password reset flow | P0 | M | 1.3.1 | Reset email works, token expires in 1 hour |

### 1.4 — Multi-Tenancy Middleware

| # | Task | Priority | Effort | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|
| 1.4.1 | Tenant resolution from JWT claims | P0 | S | 1.3.7 | Every request has `ctx.TenantID` |
| 1.4.2 | Tenant DB query scoping utility | P0 | M | 1.4.1 | All DB calls use scoped filter |
| 1.4.3 | RBAC middleware (role check per route) | P0 | M | 1.4.1 | Chef cannot access billing routes |
| 1.4.4 | Plan feature flag check middleware | P0 | M | 1.4.1 | Free plan tenant blocked from WhatsApp API |
| 1.4.5 | Plan limit enforcement middleware | P0 | M | 1.4.1 | Creating 6th table on Free returns 403 |
| 1.4.6 | Integration test: two tenants in parallel | P0 | M | 1.4.2 | Tenant A cannot see Tenant B data |

### 1.5 — Frontend Foundation (Next.js)

| # | Task | Priority | Effort | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|
| 1.5.1 | Initialize Next.js 15 App Router project | P0 | S | 1.1.1 | `pnpm dev` runs Next.js on :3000 |
| 1.5.2 | Configure Tailwind CSS v4 + CSS variables | P0 | S | 1.5.1 | Design tokens from UI_UX_GUIDELINES applied |
| 1.5.3 | Import Google Fonts (Inter, Plus Jakarta Sans, JetBrains Mono) | P0 | XS | 1.5.2 | Fonts load from local/CDN |
| 1.5.4 | Dark mode implementation | P0 | S | 1.5.2 | Toggle persisted in localStorage |
| 1.5.5 | Set up TanStack Query (API client) | P0 | S | 1.5.1 | Query client configured, devtools in dev |
| 1.5.6 | Set up Zustand stores | P0 | XS | 1.5.1 | Auth store, UI store scaffolded |
| 1.5.7 | Auth middleware (Next.js middleware.ts) | P0 | S | 1.5.1 | Unauthenticated → redirect to login |
| 1.5.8 | Axios/Fetch API client with JWT interceptor | P0 | S | 1.5.5 | Token attached to every request, 401 → refresh |
| 1.5.9 | Base layout: Sidebar + TopBar | P0 | M | 1.5.2 | Navigation renders, active route highlighted |
| 1.5.10 | Toast notification system | P0 | S | 1.5.2 | Success/error/info toasts render correctly |
| 1.5.11 | Modal component system | P0 | S | 1.5.2 | Modal with focus trap and ESC close |
| 1.5.12 | Loading skeleton components | P1 | S | 1.5.2 | Skeleton shimmer shown during data fetch |
| 1.5.13 | Button, Input, Badge, Card components | P0 | M | 1.5.2 | All variants from design system implemented |

### 1.6 — File Storage

| # | Task | Priority | Effort | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|
| 1.6.1 | Configure Cloudflare R2 bucket | P0 | S | 1.2.1 | SDK connects, test upload succeeds |
| 1.6.2 | Presigned URL upload endpoint | P0 | M | 1.6.1 | Frontend uploads directly to R2 |
| 1.6.3 | File validation (type, size, virus scan stub) | P1 | S | 1.6.2 | Only images accepted, max 5MB |

### 1.7 — Email Service

| # | Task | Priority | Effort | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|
| 1.7.1 | Configure Resend SDK | P0 | XS | 1.2.1 | Test email delivered |
| 1.7.2 | Email template system (React Email) | P0 | S | 1.7.1 | Templates render correctly |
| 1.7.3 | OTP email template | P0 | XS | 1.7.2 | Branded OTP email |
| 1.7.4 | Welcome email template | P1 | XS | 1.7.2 | Sent after verification |
| 1.7.5 | Billing alert email templates | P0 | S | 1.7.2 | Payment failed, grace period, downgrade |

---

## Phase 2 — Restaurant MVP

> Goal: Full ordering flow from QR scan to KDS. Two restaurants can operate independently.

### 2.1 — Onboarding

| # | Task | Priority | Effort | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|
| 2.1.1 | Registration page (UI) | P0 | M | 1.5.9 | Form validates, OTP sent |
| 2.1.2 | OTP verification page (UI) | P0 | S | 2.1.1 | Correct OTP → dashboard |
| 2.1.3 | Business setup wizard (UI + API) | P0 | M | 1.3.1 | Wizard saves to DB, onboarding tracked |
| 2.1.4 | Onboarding checklist widget | P1 | S | 2.1.3 | Progress visible on dashboard |
| 2.1.5 | Sample menu seeding on first login | P1 | S | 2.1.3 | 3 categories, 10 items pre-populated |

### 2.2 — Menu Management

| # | Task | Priority | Effort | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|
| 2.2.1 | Menu CRUD API | P0 | M | 1.2.5 | Create/read/update/delete menus |
| 2.2.2 | Category CRUD API | P0 | M | 2.2.1 | Categories ordered by sortOrder |
| 2.2.3 | Menu item CRUD API | P0 | L | 2.2.2 | Items with images, modifiers, variants |
| 2.2.4 | Menu management UI (category list) | P0 | M | 2.2.2 | Drag-to-reorder categories |
| 2.2.5 | Menu item creation/edit form (UI) | P0 | L | 2.2.3 | All fields, image upload, modifier builder |
| 2.2.6 | Item availability toggle (86 feature) | P0 | S | 2.2.3 | Toggle reflected on customer menu within 5s |
| 2.2.7 | Modifier group builder (UI + API) | P0 | M | 2.2.3 | Groups with options, min/max, prices |
| 2.2.8 | Dietary tags & search filter | P1 | S | 2.2.3 | Filter by vegetarian, gluten-free, etc. |

### 2.3 — Table & QR Code Management

| # | Task | Priority | Effort | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|
| 2.3.1 | Table CRUD API | P0 | S | 1.2.5 | Tables created with name, capacity, section |
| 2.3.2 | QR code generation (API) | P0 | M | 2.3.1 | Unique URL per table, stored in DB |
| 2.3.3 | QR code download (PNG) | P0 | S | 2.3.2 | PNG downloadable from dashboard |
| 2.3.4 | QR code download (PDF print sheet) | P0 | S | 2.3.2 | Multi-table PDF with labels |
| 2.3.5 | Table management UI | P0 | M | 2.3.1 | List with status indicators |
| 2.3.6 | QR code management UI | P0 | M | 2.3.2 | Preview, download, regenerate |
| 2.3.7 | Branded QR codes (logo in center) | P1 | M | 2.3.2 | Logo embedded in QR center [Growth+] |

### 2.4 — Customer Ordering Experience

| # | Task | Priority | Effort | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|
| 2.4.1 | Public menu API (cached) | P0 | M | 2.2.1 | Returns full menu for tenant, ISR cached |
| 2.4.2 | QR landing page (Next.js SSG) | P0 | L | 2.4.1 | Loads in < 1.5s on 4G, mobile-first |
| 2.4.3 | Category navigation (sticky tabs) | P0 | M | 2.4.2 | Smooth scroll to category on tap |
| 2.4.4 | Item detail modal (UI) | P0 | M | 2.4.2 | Image, description, modifiers, add to cart |
| 2.4.5 | Cart component (sticky bottom bar) | P0 | M | 2.4.2 | Persistent across menu navigation |
| 2.4.6 | Cart summary / review page (UI) | P0 | M | 2.4.5 | Edit quantities, remove items, add notes |
| 2.4.7 | Order placement API (public) | P0 | M | 2.2.3, 2.3.1 | Creates order in DB, emits WebSocket event |
| 2.4.8 | Order confirmation page (UI) | P0 | S | 2.4.7 | Shows order ID, items, estimated time |
| 2.4.9 | Order status polling / real-time (UI) | P0 | M | 2.4.7 | Status updates visible to customer |
| 2.4.10 | Call waiter button | P1 | S | 2.4.8 | Triggers staff notification |
| 2.4.11 | Request bill button | P1 | S | 2.4.8 | Triggers staff notification |
| 2.4.12 | Business closed state (ordering page) | P0 | S | 2.4.1 | Shows "We're closed" with hours |

### 2.5 — WebSocket / Real-Time

| # | Task | Priority | Effort | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|
| 2.5.1 | WebSocket hub (Go — tenant rooms) | P0 | L | 1.2.6 | Hub routes messages to correct tenant |
| 2.5.2 | Redis Pub/Sub integration with hub | P0 | M | 2.5.1 | Messages survive multi-instance API |
| 2.5.3 | Order event emitter (on order create) | P0 | M | 2.5.1 | KDS and dashboard receive within 500ms |
| 2.5.4 | Order status update events | P0 | M | 2.5.3 | Status changes propagate in real-time |
| 2.5.5 | WebSocket client (Next.js, Socket.io) | P0 | M | 2.5.1 | Auto-reconnect, exponential backoff |
| 2.5.6 | New order notification (sound + visual) | P0 | S | 2.5.5 | Audio plays, toast appears on new order |

### 2.6 — Order Management (Staff Dashboard)

| # | Task | Priority | Effort | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|
| 2.6.1 | Orders API (list, get, update status) | P0 | M | 2.4.7 | CRUD with tenant scoping |
| 2.6.2 | Live orders page (UI) | P0 | L | 2.5.5, 2.6.1 | Real-time updates, grouped by status |
| 2.6.3 | Accept / reject order flow (UI + API) | P0 | M | 2.6.1 | Manager can accept/reject with reason |
| 2.6.4 | Order status update (waiter) | P0 | S | 2.6.1 | Waiter marks order as served |
| 2.6.5 | Order history page (UI) | P0 | M | 2.6.1 | Filterable, searchable order list |
| 2.6.6 | Manual order creation (UI + API) | P1 | M | 2.6.1 | Staff creates order for table |

### 2.7 — Kitchen Display System

| # | Task | Priority | Effort | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|
| 2.7.1 | KDS page route (full-screen) | P0 | S | 2.5.5 | `/kds` route, dark background, tablet-optimized |
| 2.7.2 | Order card component | P0 | M | 2.7.1 | Items, time elapsed, table number |
| 2.7.3 | Urgency color coding | P0 | S | 2.7.2 | Green/yellow/red by elapsed time |
| 2.7.4 | Mark item done (API + UI) | P0 | M | 2.7.2, 2.6.1 | Strikethrough item, update DB |
| 2.7.5 | Mark order complete (API + UI) | P0 | S | 2.7.4 | Order removed from KDS, status updated |
| 2.7.6 | Audio alert on new order | P0 | XS | 2.7.1 | Notification sound plays on new order arrival |

### 2.8 — Basic Analytics

| # | Task | Priority | Effort | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|
| 2.8.1 | Analytics aggregation API | P0 | M | 2.4.7 | Revenue, orders, avg value by date range |
| 2.8.2 | Dashboard overview page (UI) | P0 | L | 2.8.1 | 4 metric cards, revenue chart, top items |
| 2.8.3 | Top-selling items widget | P0 | S | 2.8.1 | Top 5 items by order count |

---

## Phase 3 — Hotel Module

| # | Task | Priority | Effort | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|
| 3.1 | Hotel Pro plan feature gate | P0 | S | Phase 1 | Non-hotel plans blocked from hotel routes |
| 3.2 | Room directory CRUD (API + UI) | P0 | M | Phase 2 | Rooms with number, type, floor |
| 3.3 | QR codes for rooms | P0 | S | 3.2 | Each room gets a QR code |
| 3.4 | Multi-outlet (location) support API | P0 | L | Phase 2 | Orders from multiple locations isolated |
| 3.5 | Multi-outlet dashboard UI | P0 | M | 3.4 | Switch between outlets in sidebar |
| 3.6 | Room service ordering flow | P0 | M | 3.2, 3.4 | Ordering page shows room # in order |
| 3.7 | Room orders in KDS (tagged with room #) | P0 | S | 3.6 | KDS card shows "Room 312" |
| 3.8 | Multi-outlet analytics | P1 | M | 3.4 | Per-outlet revenue breakdown |
| 3.9 | Scheduled menus (breakfast 7–11AM) | P1 | M | Phase 2 | Menu only accessible during schedule |

---

## Phase 4 — SaaS Billing

| # | Task | Priority | Effort | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|
| 4.1 | Razorpay subscription integration | P0 | L | Phase 1 | Subscription created, webhook received |
| 4.2 | Stripe subscription integration | P1 | L | Phase 1 | Stripe checkout works end-to-end |
| 4.3 | Pricing page (UI) | P0 | M | Phase 1 | All 4 plans with feature comparison |
| 4.4 | Checkout flow (select plan → pay) | P0 | M | 4.1 | Redirects to provider, returns activated |
| 4.5 | Webhook handler (payment events) | P0 | L | 4.1 | Idempotent, handles all lifecycle events |
| 4.6 | Grace period scheduler (cron job) | P0 | M | 4.5 | Runs daily, sends alerts on schedule |
| 4.7 | Auto-downgrade executor | P0 | M | 4.6 | Executes downgrade after 14 days |
| 4.8 | Feature flag recalculation on plan change | P0 | S | 4.5 | Flags updated atomically on webhook |
| 4.9 | Billing portal UI | P1 | M | 4.1 | View invoices, change plan, cancel |
| 4.10 | Invoice PDF generation | P1 | M | 4.5 | PDF downloadable from dashboard |
| 4.11 | WhatsApp billing notifications | P1 | M | Phase 5 WhatsApp | Alerts on payment failure, downgrade |
| 4.12 | Internal admin dashboard | P1 | L | Phase 1 | View all tenants, plans, override |

---

## Phase 5 — Scale, Analytics & WhatsApp

| # | Task | Priority | Effort | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|
| 5.1 | WhatsApp Business API integration | P0 | XL | Phase 2 | Order confirmation sent to customer |
| 5.2 | WhatsApp order status updates | P1 | M | 5.1 | Ready/Preparing alerts sent |
| 5.3 | WhatsApp opt-out handling | P1 | S | 5.1 | STOP keyword respected |
| 5.4 | Advanced analytics API | P0 | L | Phase 2 | Heatmap, retention, item performance |
| 5.5 | Advanced analytics UI | P0 | L | 5.4 | Charts, heatmap, date range picker |
| 5.6 | Export (CSV + PDF) | P1 | M | 5.4 | Downloads correct filtered data |
| 5.7 | Thermal printer API (ESC/POS) | P1 | M | Phase 2 | Order prints on Epson/Star printers |
| 5.8 | Load testing (k6) | P0 | M | Phase 4 | 500 concurrent orders pass without degradation |
| 5.9 | Security audit (OWASP ZAP) | P0 | M | Phase 4 | No critical findings |
| 5.10 | Custom subdomain (Cloudflare) | P2 | L | Phase 1 | `order.pizzapalace.com` resolves correctly |
| 5.11 | Customer feedback (1-5 star) | P2 | M | Phase 2 | Rating submitted after order completion |
| 5.12 | Multi-location support (Growth tier) | P1 | L | Phase 3 | Growth plan: up to 3 locations |

---

## Phase 6 — AI Features

| # | Task | Priority | Effort | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|
| 6.1 | AI menu description generator | P1 | M | Phase 5, 3+ months data | Generates compelling item descriptions |
| 6.2 | AI upsell suggestions (order page) | P1 | L | Phase 5 | "Goes well with..." recommendation shown |
| 6.3 | Demand forecasting dashboard | P1 | XL | Phase 5 | Predicts busy times with 70% accuracy |
| 6.4 | WhatsApp ordering chatbot | P2 | XL | Phase 5, 5.1 | Customer can reorder via WhatsApp reply |
| 6.5 | Smart pricing alerts | P2 | L | Phase 5 | Flags underperforming/overpriced items |

---

## Testing Strategy

### Unit Tests
- Domain entities and business rules: 100% coverage
- Use case logic: 90% coverage
- Utility functions: 100% coverage

### Integration Tests
- API endpoints: every route has at least one integration test
- Multi-tenant isolation: explicit cross-tenant access attempt tests
- WebSocket event delivery
- Webhook handling (Razorpay/Stripe)

### E2E Tests (Playwright)
- Full ordering flow: QR scan → order → KDS
- Subscription lifecycle: signup → pay → grace → downgrade
- Auth: register → verify → login → logout

### Performance Tests (k6)
- 500 concurrent order placements
- KDS rendering with 200 active orders
- Menu page load under load

---

## Definition of Done

Every task is Done when:
- [ ] Code reviewed by at least 1 other engineer
- [ ] Unit tests written and passing
- [ ] Integration test covers the happy path
- [ ] No TypeScript errors
- [ ] No `console.log` left in production code
- [ ] Tenant isolation verified for this feature
- [ ] Plan feature flag respected
- [ ] Documented in API_STRATEGY.md if new endpoint

---

*Last Updated: September 2026 | Version: 1.0*
