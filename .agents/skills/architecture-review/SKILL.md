---
name: architecture-review
description: High-level system architecture evaluation covering monorepo boundaries, caching strategies, database indexing, horizontal scalability, resilience, and single points of failure.
---

# System Architecture & Scalability Review

Use this skill to evaluate end-to-end system design, service boundaries, data pipelines, and infrastructure resilience.

## Architectural Assessment Dimensions

### 1. Monorepo & Service Boundaries
- **Clear Contract**: Enforce explicit boundary separation between frontend (`apps/web`) and backend services (`apps/api`).
- **Contract Sharing**: Maintain shared types or OpenAPI specifications. Prevent tight coupling or backend business logic duplication in frontend clients.
- **Single Responsibility**: Ensure domain services (Menu, Order, Room, Billing, Notification) maintain clear ownership of their respective data aggregates.

### 2. Database Design & Indexing
- **Index Optimization**: Review query patterns and ensure compound indexes exist for high-frequency filters, especially tenant-scoped lookups (`{ tenant_id: 1, status: 1, created_at: -1 }`).
- **Data Growth & Partitioning**: Plan for time-series growth (orders, audit logs, notifications). Implement archival or TTL indexes for ephemeral records.
- **Connection Pooling**: Configure appropriate connection pool bounds (`maxPoolSize`, `minPoolSize`, `maxIdleTimeMS`) for database and Redis clients.

### 3. Caching & State Distribution
- **Caching Layer**: Use Redis for shared transient state (session tokens, live table locks, rate limits, short-lived menu caches).
- **Cache Invalidation**: Enforce deterministic invalidation keys and realistic TTLs. Guard against cache stampede / thundering herd.

### 4. Reliability & High Availability
- **Graceful Degradation**: When third-party services (payment gateways, SMS providers) fail, ensure the core application remains operable with appropriate fallback UI.
- **Graceful Shutdown**: Intercept `SIGTERM` and `SIGINT` to allow in-flight HTTP requests and database transactions to finish cleanly before process termination.
- **Health Checks**: Provide `/health` (liveness) and `/ready` (readiness checking DB and Redis connectivity) endpoints for orchestrator probes.

### 5. Observability & Tracing
- **Structured Logging**: Emit structured JSON logs containing timestamp, level, trace/request ID, tenant ID, and execution duration.
- **Correlation IDs**: Propagate `X-Request-ID` from client through web gateway to backend services for distributed debugging.
