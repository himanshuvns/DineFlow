---
name: saas-review
description: Review multi-tenant SaaS architecture, subscription tier limits, tenant provisioning, data partitioning, soft delete, idempotency, and webhook/event reliability.
---

# Multi-Tenant SaaS Architecture & Business Review

Use this skill to review SaaS features, lifecycle workflows, subscription enforcement, and data architecture.

## Review Pillars

### 1. Tenant Provisioning & Lifecycle
- **Tenant Onboarding**: Automated workspace creation, unique slug reservation, default data seeding (categories, tables, settings).
- **Tenant Status Handling**: Graceful handling of states: `pending_activation`, `active`, `suspended`, `cancelled`, `archived`.
- **Tenant Deactivation**: Immediate revocation of API tokens and session termination upon suspension.

### 2. Subscription Tiers & Feature Gates
- **Quota & Limit Enforcement**:
  - Enforce limits per plan (e.g., Starter: up to 20 menu items, 5 tables; Pro: unlimited menu, 50 tables; Enterprise: multi-location, API access).
  - Pre-flight checks before resource creation (e.g., check `count(items) < plan.maxItems`).
- **Feature Flagging**: Conditionally enable premium modules (Room Service, Valet, Housekeeping, WhatsApp integration) based on tenant subscription features.

### 3. Data Partitioning & Soft Delete
- **Partitioning Model**: Consistent tenant identifier index on all multi-tenant collections (e.g. `{ tenantId: 1, _id: 1 }`).
- **Soft Deletion**: Use `isDeleted: true` and `deletedAt: timestamp` on critical records (orders, transactions, menu items) with query filters to ensure audit trail preservation.

### 4. Financial & Payment Idempotency
- **Idempotency Keys**: Guarantee that retried payment captures or order submissions do not create duplicate charges or inventory reductions.
- **Webhook Reliability**: Verify webhook signatures (e.g. Stripe, Razorpay) and maintain an event ledger to prevent replay attacks.

### 5. Multi-Tenant Event & Notification Architecture
- **Tenant-Scoped Channels**: SSE or WebSocket events must be partitioned by tenant ID (`tenant:{tenantId}:notifications`).
- **Audit Logging**: Maintain immutable audit logs for administrative operations (price modifications, role changes, refund approvals).
