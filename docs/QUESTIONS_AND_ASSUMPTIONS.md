# DineFlow — Questions, Assumptions & Risks

> This document captures every open question, working assumption, identified risk, and decision that must be confirmed before implementation begins. This is a living document — update it as decisions are made.

---

## Status Legend

| Symbol | Meaning |
|---|---|
| ❓ | Open — needs decision |
| ✅ | Decided — assumption confirmed |
| ⚠️ | Risk — mitigated or accepted |
| 🔴 | Blocker — cannot proceed without resolution |

---

## Section 1 — Architecture Decisions

### A1. Backend Language: Go vs. Node.js
**Status**: ✅ Decided

**Decision**: **Go (Gin)** — best performance, concurrency, lowest memory per WebSocket connection. All API and WebSocket code will be written in Go.

---

### A2. Monorepo Tool: Turborepo vs. Nx
**Status**: ✅ Decided

**Decision**: **Turborepo** — simpler setup, Next.js native, aligns with Vercel deployment.

---

### A3. Database: MongoDB Only vs. MongoDB + PostgreSQL
**Status**: ✅ Decided

**Decision**: **MongoDB only** — simpler ops, document model fits menus/orders perfectly. Accepted risk on relational aggregations; will use MongoDB aggregation pipeline with compound indexes.

---

### A4. Frontend Framework: Next.js App Router vs. Pages Router
**Status**: ✅ Decided

**Decision**: Next.js 15 App Router. RSC for dashboard data fetching; client components for interactive UI; SSG + ISR for ordering pages.

---

### A5. WebSocket: Socket.io vs. Native WebSocket
**Status**: ✅ Decided

**Decision**: **Socket.io** for Phase 1 — auto-reconnect, rooms, event system, polling fallback. Revisit at scale.

---

## Section 2 — Product Requirements

### P1. What counts as a "table" for food trucks?
**Status**: ❓ Open

**Question**: Food trucks have no tables. Should we rename "tables" to "locations/spots/counters" with a type field? Or abstract it into a generic "ordering point"?

**Current assumption**: The `table` entity has a `type` field (`table`, `room`, `counter`, `outdoor`) — food trucks use `counter` type. The UI adapts the label accordingly.

---

### P2. Customer phone number at checkout
**Status**: ✅ Decided

**Decision**: **Smart Progressive Phone Collection.** Do NOT ask for phone number at menu entry. At checkout, if the restaurant has WhatsApp enabled, show optional phone field with copy: "Get live order updates on WhatsApp". If skipped, order placed without WhatsApp notification. Configurable per tenant (`requireGuestPhone: true/false`). Default: false.

---

### P3. Can a customer order multiple rounds from the same table?
**Status**: ❓ Open

**Question**: After placing an initial order, can a customer scan the QR again and place a follow-up order at the same table?

**Current assumption**: Yes. Each QR scan creates an independent session. Multiple orders can be linked to the same table and presented together on the staff dashboard ("Table 4 — 3 orders open").

---

### P4. Online payment model
**Status**: ✅ Decided

**Decision**: **Hybrid Payment Architecture with abstraction layer.** Dine-in: Pay at Table (default). Takeaway: Pay Before Order (configurable). Delivery (future): Pay online. Phase 2: Razorpay (UPI, Cards, Net Banking). Phase 3: Stripe for international. All payment logic behind a `PaymentProvider` interface.

---

### P5. Unavailable item display
**Status**: ✅ Decided

**Decision**: **Smart Availability — Default grayed out + configurable.** Default: show as grayed out with "Unavailable Today" label; disable ordering; suggest similar items. Tenant-level setting with 3 modes: (1) Show as Unavailable (default), (2) Hide Completely, (3) Auto-hide after X hours (future). Per-item override also supported.

---

### P6. What is the order cancellation policy?
**Status**: ❓ Open

**Questions**:
- Can a customer cancel their own order after placing it?
- Within what time window?
- Who initiates refunds if payment was collected online?

**Current assumption**: Customers cannot self-cancel (no customer login). Staff can cancel with a reason. Refund process is manual via provider dashboard (Phase 1 scope).

---

### P7. Split billing
**Status**: ✅ Decided

**Decision**: **In scope as P2 within Phase 2** — will be built but de-prioritized. Basic split (equal split by number of people) in Phase 2. Custom split (by item selection) in Phase 5.

---

### P8. What is the ordering flow for hotel room service after midnight?
**Status**: ❓ Open

**Question**: If a hotel's "overnight menu" operates from 11 PM to 6 AM, how are scheduled menus resolved? Does the system use the hotel's local timezone?

**Current assumption**: All scheduling is timezone-aware, using the location's configured timezone. Midnight overlap handled by checking `current_time_in_location_tz` against menu schedule.

---

## Section 3 — Subscription & Billing

### B1. Free trial for new registrations
**Status**: ✅ Decided

**Decision**: **14-day Growth trial, no credit card required.** All new registrations start on Growth trial. After 14 days, auto-downgrade to Free unless subscribed. Onboarding flow must display trial countdown prominently.

---

### B2. How is proration handled on mid-cycle upgrades?
**Status**: ❓ Open

**Question**: If a Starter subscriber upgrades to Growth on day 15 of a 30-day cycle, are they charged half the Growth price + half the Starter price, or the full Growth price from day 1?

**Recommendation**: Standard proration — charge difference for remaining days. Let Razorpay/Stripe handle this natively.

---

### B3. Can a single tenant have multiple subscriptions (e.g., base plan + white-label add-on)?
**Status**: ❓ Open

**Current assumption**: One primary subscription (plan) + optional add-ons modeled as separate line items on the same subscription. White-label is an add-on to Hotel Pro.

---

### B4. What currency should the Free plan's invoice show?
**Status**: ❓ Open

**Question**: Free plan generates no invoice. But if a tenant on Free wants a receipt for their records, should they get a ₹0 invoice?

**Current assumption**: No invoice generated for Free plan. Skip for Phase 1.

---

### B5. Are there usage-based charges beyond the flat subscription?
**Status**: ❓ Open

**Question**: For example, if a Starter plan user sends 10,000 WhatsApp messages in a month (far beyond normal), do we charge extra?

**Current assumption** (Phase 1): No usage-based billing. WhatsApp messages are limited by the plan (Starter: order confirmations only). Metered billing is deferred to Phase 5.

---

## Section 4 — WhatsApp Integration

### W1 & W2. WhatsApp provider and sender strategy
**Status**: ✅ Decided

**Decision**: **Provider abstraction layer from day one.** MVP: Meta WhatsApp Cloud API with shared DineFlow business number. Phase 2+: Allow tenants to connect their own WhatsApp Business number (BYON — Bring Your Own Number) without changing the core codebase. Architecture: `WhatsAppProvider` interface with pluggable implementations.

---

### W3. What happens if a customer's number is not WhatsApp-enabled?
**Status**: ❓ Open

**Current assumption**: Silently skip WhatsApp notification; no fallback to SMS in Phase 1 (deferred to Phase 5 or add-on). Log the failure for tenant visibility.

---

## Section 5 — Operations & Infrastructure

### O1. Deployment platform
**Status**: ✅ Decided

**Decision**: **Vercel (frontend) + Railway.app (backend).** Lowest ops overhead for Phase 1. Migrate to GCP/K8s when Railway limits are hit (at scale).

---

### O2. Primary deployment region?
**Status**: ❓ Open

**Question**: India-first product — primary region should be `ap-south-1` (Mumbai). Are there any customers who would require data to stay in a specific region (EU GDPR)?

**Current assumption**: `ap-south-1` primary. No EU compliance required in Phase 1. GDPR requirements deferred to international expansion.

---

### O3. How will we handle database migrations?
**Status**: ❓ Open

**Question**: MongoDB is schema-less, but we still need to manage index creation, data migrations, and collection changes safely.

**Current assumption**: Use a migration tool (e.g., `migrate-mongo`) with versioned migration scripts. Run migrations as part of CI/CD pipeline before deploying new application version.

---

### O4. How do we handle a tenant with 10,000 menu items or orders?
**Status**: ❓ Open

**Current assumption**: Pagination enforced on all list endpoints (max 100 per page). Analytics aggregations run on read with appropriate indexes. Very large tenants flagged for dedicated review in Phase 5.

---

## Section 6 — Security & Compliance

### S1. Is PCI-DSS compliance required in Phase 1?
**Status**: ❓ Open

**Current assumption**: Razorpay and Stripe handle all card data — DineFlow never touches raw card numbers. This means DineFlow is in **SAQ A** scope (lowest PCI-DSS tier). Full PCI-DSS audit not required for Phase 1.

---

### S2. GDPR compliance — are EU customers expected in Phase 1?
**Status**: ❓ Open

**Current assumption**: Phase 1 is India-only. No EU customers. GDPR compliance is a Phase 5+ concern. However, the codebase will be built with data deletion capability from Day 1 (customer data delete-on-request).

---

### S3. What data does DineFlow retain about end customers (guests)?
**Status**: ❓ Open

**Question**: When a guest places an order with their name and phone number, how long is that data retained? Who controls it — DineFlow or the restaurant?

**Current assumption**:
- Guest data is stored on the order document
- Retained for the duration of the restaurant's subscription + 90 days after
- Restaurant is the "data controller" per PDPB (India)
- DineFlow is the "data processor"
- Guest can request deletion via the restaurant; restaurant can delete via API

---

### S4. Admin access to tenant data
**Status**: ❓ Open

**Question**: Can DineFlow internal staff access a specific tenant's orders/menus for debugging?

**Current assumption**: Yes, via super-admin endpoints. All such accesses are logged in audit_logs with the reason. This access is restricted to specific internal roles and logged immutably.

---

## Section 7 — Feature-Specific Risks

### R1. WhatsApp Template Approval Delays
**Risk**: ⚠️ Medium

**Description**: WhatsApp message templates must be approved by Meta before use. Approval can take 24–72 hours and may be rejected. This could delay the WhatsApp integration launch.

**Mitigation**:
- Submit templates early (at Phase 4 start)
- Prepare 2 variations of each template in case one is rejected
- Fall back to email notifications if WhatsApp is delayed

---

### R2. Razorpay Subscription Webhook Reliability
**Risk**: ⚠️ High

**Description**: If Razorpay webhooks fail to reach DineFlow (network issues, deploy downtime), subscription state will be stale. A business may be incorrectly downgraded or kept active.

**Mitigation**:
- Idempotent webhook handler with `idempotencyKey` tracking
- Scheduled reconciliation job: daily compare DineFlow state vs Razorpay API
- Webhook endpoint protected but never behind auth middleware (use signature verification)
- Alert on missed webhook events

---

### R3. Customer QR Page Load on Poor Network
**Risk**: ⚠️ Medium

**Description**: Restaurants in tier-2/3 cities have customers on 2G/3G networks. A slow ordering page kills conversion.

**Mitigation**:
- ISR for menu page (served from CDN edge)
- Aggressive image optimization (WebP, next/image)
- Critical CSS inlined, JS deferred
- Lighthouse performance score target: > 90 on mobile
- Offline-capable ordering cart (service worker, Phase 5)

---

### R4. KDS Data Accuracy During API Downtime
**Risk**: ⚠️ High

**Description**: If the API is down during dinner service, the KDS goes blank. This is a critical failure mode.

**Mitigation**:
- KDS caches last received order state in localStorage
- Show "Connection lost — showing cached orders" banner
- Reconnect with exponential backoff
- Target 99.9% uptime with alerting
- Graceful degradation: orders still visible even if updates paused

---

### R5. Multi-Tenant Data Breach (Tenant Isolation Failure)
**Risk**: ⚠️ Critical

**Description**: A bug in tenant scoping middleware could expose one tenant's data to another.

**Mitigation**:
- All DB queries use a mandatory `tenantId` scoping utility — cannot be bypassed
- Integration tests explicitly attempt cross-tenant access and verify denial
- Code review checklist includes "tenant scope verified" checkbox
- No raw DB queries outside repository layer
- Penetration test before Phase 4 launch

---

### R6. WhatsApp Message Costs Exceeding Revenue
**Risk**: ⚠️ Medium

**Description**: If Free plan users generate many orders with WhatsApp confirmations, the messaging cost may exceed plan revenue.

**Mitigation**: WhatsApp notifications are a Starter+ feature — Free plan has no WhatsApp. Cost is absorbed into Starter revenue margins.

---

### R7. Competitor Response
**Risk**: ⚠️ Low-Medium

**Description**: Established players (Petpooja, Dotpe) could copy features or undercut pricing.

**Mitigation**: Focus on UX quality and full-stack integration (no competitor offers KDS + Hotel Module + WhatsApp natively). Build moat through network effects and switching costs.

---

## Section 8 — Open Decisions Register

| # | Decision | Owner | Deadline | Status |
|---|---|---|---|---|
| D1 | Backend language: Go vs Node.js | CTO | Week 1 | ✅ **Go (Gin)** |
| D2 | Monorepo tool: Turborepo vs Nx | Lead Dev | Week 1 | ✅ **Turborepo** |
| D3 | DB strategy: MongoDB-only vs hybrid | CTO | Week 1 | ✅ **MongoDB only** |
| D4 | WhatsApp provider: BSP vs Meta direct | Product | Week 2 | ✅ **Meta Cloud API + abstraction layer** |
| D5 | Tenant's own WhatsApp vs shared number | Product | Week 2 | ✅ **Shared MVP → BYON Phase 2+** |
| D6 | Free trial: yes/no and duration | Founder | Week 1 | ✅ **14-day Growth trial, no card** |
| D7 | Deployment: Railway vs GCP vs AWS | DevOps | Week 1 | ✅ **Vercel + Railway.app** |
| D8 | Primary payment provider for India | Founder | Week 1 | ✅ **Razorpay (abstracted)** |
| D9 | Customer phone number: required or optional | Product | Week 1 | ✅ **Optional, progressive at checkout** |
| D10 | Unavailable item: hide vs gray out | UX | Week 2 | ✅ **Grayed out (default) + configurable** |
| D11 | Split billing: in scope or deferred | Product | Week 1 | ✅ **P2 in Phase 2 (basic split)** |
| D12 | Online payment: pay-at-order vs pay-at-table | Product | Week 1 | ✅ **Hybrid by order type, abstracted** |
| D13 | GDPR scope: India-only vs global from day 1 | Legal | Week 2 | ❓ Open |
| D14 | WebSocket: Socket.io vs native | Lead Dev | Week 1 | ✅ **Socket.io** |
| D15 | Analytics data architecture: real-time vs batch | Lead Dev | Week 3 | ❓ Open |

---

## Section 9 — Working Assumptions (Accepted Without Explicit Confirmation)

These assumptions are documented for record. If any is wrong, it may require rework:

| # | Assumption |
|---|---|
| WA1 | MongoDB is sufficient for all data storage needs in Phase 1 |
| WA2 | Cloudflare R2 is used for file storage (no AWS S3) |
| WA3 | Resend is used for transactional email |
| WA4 | All amounts are stored in smallest currency unit (paise for INR) |
| WA5 | JWT access tokens expire in 15 minutes; refresh tokens in 7 days |
| WA6 | The ordering page requires no customer authentication |
| WA7 | QR codes are non-expiring by default; only invalidated on explicit regeneration |
| WA8 | KDS is accessed on a shared device (no per-chef login needed) |
| WA9 | The platform is India-first; INR is the primary currency for Phase 1 |
| WA10 | All timestamps stored in UTC; displayed in tenant's local timezone |
| WA11 | Order numbers are human-readable (e.g., `PP-20260912-0047`) |
| WA12 | The customer ordering page is a PWA-ready static page (no Next.js SSR at runtime) |
| WA13 | The grace period is always 14 days, not configurable per plan |
| WA14 | Super-admin dashboard is internal-only and not exposed to tenants |
| WA15 | Phase 1 does not include PMS (Property Management System) integration |

---

*Last Updated: September 2026 | Version: 1.0 | Owner: Product + Engineering*
