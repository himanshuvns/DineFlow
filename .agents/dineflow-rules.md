# DineFlow Engineering Principles & Shared Rules

This document establishes the mandatory engineering standards, architectural invariants, and operational guardrails for all autonomous agents, subagents, and developers working within the DineFlow codebase.

---

## 1. System Overview & Domain Invariants

DineFlow is a high-performance, enterprise-grade multi-tenant SaaS platform built for the hospitality industry, serving restaurants, cafés, boutique hotels, resorts, cloud kitchens, bars, and food courts.

### Core Functional Domains
- **Digital Guest Experience**: QR code menus, contactless table ordering, room service dining, digital bill presentation, online checkout.
- **Restaurant Operations**: Dine-in table management, dynamic QR code generation, kitchen bump bars, multi-station Kitchen Display System (KDS: Main Kitchen, Bar, In-Room Dining).
- **Hotel PMS & In-Room Services**: Guest room & suite management, digital check-in/check-out, stay extensions, Do Not Disturb (DND) real-time toggling, housekeeping sanitization queues, luxury acrylic stand printing.
- **Workforce & HRMS**: Staff directory, GPS-geofenced mobile attendance, shift scheduling, leave approval workflows, statutory metadata, automated Indian payroll & salary slips.
- **Omnichannel Communication**: Meta Cloud API (WhatsApp Business Account), OpenWA gateway integration, real-time AI customer chatbot, automated order status notifications, Indian GST-compliant PDF/HTML tax invoices.
- **Intelligence & Analytics**: Real-time sales velocity, table turn time, Gross/Net revenue, covers, average order value (AOV), hourly throughput heatmaps.
- **Platform Super Admin**: Multi-tenant client onboarding, subscription tier management (Starter, Pro, Enterprise), feature flags, audit logging, system health telemetry.

> [!IMPORTANT]
> **Source of Truth Principle**: Never assume a feature exists simply because it is described above. The repository source code (`apps/web` and `apps/api`) is the sole authoritative source of truth. Always inspect existing implementations before declaring capabilities or writing code.

---

## 2. Core Execution Rule

Every task and code modification must strictly follow this sequential lifecycle:

$$\text{AUDIT} \longrightarrow \text{UNDERSTAND} \longrightarrow \text{PLAN} \longrightarrow \text{IMPLEMENT} \longrightarrow \text{TEST} \longrightarrow \text{VERIFY}$$

**Strict Invariant**: NEVER follow the anti-pattern:
$$\text{IMPLEMENT} \longrightarrow \text{DISCOVER PROBLEMS LATER}$$

1. **Audit**: Read the relevant files, routes, stores, services, models, and tests before forming assumptions.
2. **Understand**: Trace caller-callee relationships, state flows, database indexes, and tenant context.
3. **Plan**: Formulate a minimal, concrete implementation plan identifying touched files, blast radius, and invariants.
4. **Implement**: Apply the leanest possible changes adhering to existing patterns and YAGNI.
5. **Test**: Run unit tests, type checks, lint checks, and failure-path tests.
6. **Verify**: Perform end-to-end verification, verify backward compatibility, and check light/dark mode and responsive layouts.

---

## 3. Anti-Duplication & Architectural Reuse

Before creating any new:
- Frontend UI component, modal, drawer, or form
- Backend REST API route, handler, or middleware
- Domain service, command, or query
- MongoDB collection, repository, or schema model
- Custom React hook or utility function
- Notification channel or payment webhook handler

**You MUST thoroughly search the codebase for existing implementations.**
- Reuse existing components in `apps/web/components/ui/` and `apps/web/components/`.
- Extend existing Go application services in `apps/api/internal/application/`.
- Reuse existing store slices in `apps/web/lib/stores/`.
- Never create parallel abstraction layers, wrapper utilities for single-use functions, or duplicate data access models.

---

## 4. Preservation of the Existing System

Never modify or degrade existing production functionality unless the user explicitly requests a behavioral modification:
- **Zero Regressions**: Existing customer ordering flows (`/m/[tenantSlug]/[tableId]`), room service portals (`/m/[tenantSlug]/room/[roomNumber]`), staff attendance terminals, KDS bump bars, and admin dashboards must remain fully functional.
- **Contract Stability**: Existing API request/response contracts (`/api/v1/...`) must remain strictly backward-compatible.
- **Database Safety**: Never execute destructive database schema migrations or drop collections.
- **Routing & Navigation**: Preserve Next.js App Router route hierarchy and Go Gin router groupings.

---

## 5. Real Data vs. Mock Data Policy

- **Production Code**: All production components, pages, handlers, and services must communicate with real backend APIs and MongoDB/Redis persistent storage.
- **Prohibited**: Never introduce mock objects, dummy arrays, or hardcoded fake responses into production code merely to give the visual illusion of a working feature.
- **Permitted Mocking**: Mocks are strictly quarantined to unit test fixtures (`*_test.go`, `*.test.ts`) and explicitly documented offline UI preview sandboxes.

---

## 6. Strict Multi-Tenant Data Isolation

DineFlow is a multi-tenant SaaS application. Tenant boundary violations constitute severe security failures.

- **Server-Side Enforcement**: Every tenant-sensitive API endpoint must extract the authenticated `tenantId` from verified JWT claims or session middleware.
- **Zero Frontend Trust**: Never trust client-supplied `tenantId` in URL parameters, request bodies, or headers for authorization.
- **Resource Ownership Verification**: Every query, update, and delete operation on tables, orders, rooms, menu items, staff, and invoices must explicitly filter by `tenantId`:
  ```go
  filter := bson.M{"_id": resourceID, "tenantId": authenticatedTenantID}
  ```
- **Cross-Tenant IDOR Prevention**: Ensure an authenticated user of Tenant A cannot view, mutate, or delete resources belonging to Tenant B by substituting IDs.

---

## 7. Security Invariants

All agents must uphold these mandatory security protocols:
1. **Authentication & Session Tokens**:
   - Access tokens (JWT) have a short 15-minute TTL; Refresh tokens have a 7-day TTL with real-time Redis token revocation.
   - Passwords must be hashed using `bcrypt` (cost $\ge 12$).
   - OTP codes must be verified server-side with sliding-window rate limiting in Redis.
2. **Role-Based Access Control (RBAC)**:
   - Server-side enforcement using middleware: `OwnerOnly()`, `OwnerOrManager()`, `RequireRole(...)`, and `PlatformAdminOnly()`.
   - Never rely on frontend UI hiding for security; every endpoint must independently validate permissions.
3. **Injection & Input Hygiene**:
   - MongoDB queries must use typed BSON maps, avoiding raw string query interpolation to prevent NoSQL injection.
   - Input strings must be sanitized using `NoSQLSanitizer()` middleware.
4. **Secret Protection**:
   - Never commit or log API keys (`RESEND_API_KEY`, `GEMINI_API_KEY`, `RAZORPAY_KEY_SECRET`), JWT secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`), database URIs, or webhook signing secrets.
5. **Webhook Integrity**:
   - External webhooks (WhatsApp Meta Cloud API, OpenWA, Razorpay) must strictly verify cryptographic payload signatures before processing.

---

## 8. Quality & Engineering Standards

- **TypeScript**: Strict mode enabled, zero `any` types. All props and API responses must have explicit interfaces.
- **Go**: Idiomatic Go, explicit error checking (`if err != nil`), proper context propagation (`ctx context.Context`), zero goroutine leaks.
- **Responsive Layouts**: Mobile-first design supporting viewports from 320px to 1920px. Mobile viewports must have high vertical efficiency without horizontal overflow.
- **Themes & Contrast**: Complete support for both Light Mode and Dark Mode with high contrast ratios (WCAG AA compliant).
- **Build Verification**: Any change to `apps/web` must verify clean with `pnpm --filter web run build`. Any change to `apps/api` must build with `go build ./...`.
