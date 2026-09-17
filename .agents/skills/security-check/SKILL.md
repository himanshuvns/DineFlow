---
name: security-check
description: Multi-tenant SaaS security auditor covering tenant data isolation, JWT authentication, RBAC authorization, injection vulnerabilities, CORS, rate limiting, and sensitive credential protection.
---

# Multi-Tenant SaaS Security Audit Runbook

Use this skill to audit APIs, data stores, and application logic for multi-tenant isolation and security vulnerabilities.

## Security Checklist

### 1. Tenant Data Isolation (Crucial)
- **Tenant Scope Enforcement**: Every database query (Find, Update, Delete, Aggregate) MUST filter by `tenant_id` or `tenant_slug`.
- **IDOR / BOLA Prevention**: Verify that resource IDs passed in URLs (e.g. `/orders/:orderId`, `/rooms/:roomId`) are verified against the requester's authenticated tenant context.
- **Tenant Context Injection**: Ensure tenant context is set securely via authenticated JWT middleware, never accepted blindly from unverified client headers or query parameters in private routes.

### 2. Authentication & Session Management
- **JWT Verification**: Validate token signature, signing algorithm (`HS256` / `RS256`), issuer, audience, and expiration (`exp`).
- **Token Invalidation**: Ensure revoked sessions or password resets invalidate active access/refresh tokens.
- **Cookie Security**: Set `HttpOnly`, `Secure`, `SameSite=Strict` or `Lax` on auth cookies.

### 3. Role-Based Access Control (RBAC)
- Enforce least-privilege principle: Verify permissions on every endpoint (e.g., `super_admin`, `client_owner`, `manager`, `staff`, `customer`).
- Ensure customer-facing public routes (e.g. QR order placement, stay extension) cannot access staff operations (menu editing, bill settlement, staff management).

### 4. Input Sanitization & Injection Defense
- **MongoDB / NoSQL Injection**: Validate request payloads with schemas (`zod` in TypeScript, struct tags and binding in Go) to prevent `{"$gt": ""}` operator injection.
- **XSS Prevention**: Sanitize user inputs rendered in HTML or SVG (e.g., restaurant descriptions, item notes, custom branding).
- **Path Traversal**: Validate and sanitize file upload names and storage paths.

### 5. Rate Limiting & Abuse Prevention
- Protect sensitive public endpoints (login, OTP generation, order creation) with Redis-backed rate limiting.
- Enforce request payload size limits to prevent Denial of Service (DoS).

### 6. Secrets & Environment Protection
- Ensure no API keys, database passwords, or JWT secrets are hardcoded in source repositories.
- Validate that client-side bundles only receive variables prefixed with `NEXT_PUBLIC_`.
