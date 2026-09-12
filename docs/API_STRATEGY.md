# DineFlow — API Strategy

---

## API Design Principles

1. **RESTful** — standard resource-oriented URLs
2. **Versioned** — all routes prefixed with `/api/v1/`
3. **Authenticated** — all dashboard routes require `Authorization: Bearer <JWT>`
4. **Tenant-scoped** — tenant ID extracted from JWT; never from URL params in private APIs
5. **Consistent response envelope**:
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 100 },
  "error": null
}
```
6. **Error responses**:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "MENU_ITEM_NOT_FOUND",
    "message": "Menu item with ID xyz was not found.",
    "field": null
  }
}
```
7. **Idempotency** — `POST` order creation accepts `Idempotency-Key` header
8. **Rate limited** — headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
9. **Pagination** — cursor-based for real-time feeds (orders), offset for analytics
10. **Feature-gated** — endpoints check plan features before executing

---

## Base URLs

| Environment | URL |
|---|---|
| Local | `http://localhost:8080/api/v1` |
| Staging | `https://api-staging.dineflow.app/api/v1` |
| Production | `https://api.dineflow.app/api/v1` |
| Customer Ordering (public) | `https://order.dineflow.app/api/v1` |

---

## Module 1 — Authentication

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new business account |
| POST | `/auth/verify-otp` | Public | Verify OTP sent to email/phone |
| POST | `/auth/login` | Public | Login with email+password |
| POST | `/auth/login/magic` | Public | Send magic link email |
| POST | `/auth/refresh` | Public (cookie) | Refresh access token |
| POST | `/auth/logout` | JWT | Revoke refresh token |
| GET | `/auth/me` | JWT | Get current user profile |
| POST | `/auth/forgot-password` | Public | Send password reset email |
| POST | `/auth/reset-password` | Public | Reset password with token |
| POST | `/auth/change-password` | JWT | Change password (logged in) |
| POST | `/auth/verify-email` | Public | Verify email from link |

---

## Module 2 — Tenant (Business) Management

| Method | Route | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/tenant` | JWT | Any | Get current tenant profile |
| PATCH | `/tenant` | JWT | Owner/Manager | Update tenant profile |
| POST | `/tenant/logo` | JWT | Owner | Upload business logo |
| GET | `/tenant/settings` | JWT | Any | Get business settings |
| PATCH | `/tenant/settings` | JWT | Owner | Update business settings |
| GET | `/tenant/onboarding` | JWT | Any | Get onboarding checklist state |
| PATCH | `/tenant/onboarding/:step` | JWT | Owner | Mark onboarding step complete |
| DELETE | `/tenant` | JWT | Owner | Soft-delete tenant (requires confirmation) |
| GET | `/tenant/features` | JWT | Any | Get active feature flags |

---

## Module 3 — Users & Staff

| Method | Route | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/staff` | JWT | Owner/Manager | List all staff members |
| POST | `/staff/invite` | JWT | Owner/Manager | Invite staff by email |
| GET | `/staff/:userId` | JWT | Owner/Manager | Get staff member details |
| PATCH | `/staff/:userId` | JWT | Owner/Manager | Update staff role/permissions |
| DELETE | `/staff/:userId` | JWT | Owner | Remove staff member |
| GET | `/staff/:userId/activity` | JWT | Owner/Manager | Get staff activity log |
| POST | `/auth/accept-invite/:token` | Public | — | Accept team invitation |
| POST | `/staff/pin/set` | JWT | Any | Set PIN for POS login |
| POST | `/staff/pin/verify` | JWT | Any | Verify PIN login |

---

## Module 4 — Subscription & Billing

| Method | Route | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/billing/plans` | Public | — | List all available plans with features |
| GET | `/billing/subscription` | JWT | Owner | Get current subscription status |
| POST | `/billing/subscription/create` | JWT | Owner | Create subscription (returns checkout URL) |
| POST | `/billing/subscription/upgrade` | JWT | Owner | Upgrade to higher plan |
| POST | `/billing/subscription/downgrade` | JWT | Owner | Downgrade plan |
| POST | `/billing/subscription/cancel` | JWT | Owner | Cancel at period end |
| GET | `/billing/invoices` | JWT | Owner | List payment invoices |
| GET | `/billing/invoices/:invoiceId` | JWT | Owner | Get invoice PDF |
| POST | `/webhooks/razorpay` | Public (signed) | — | Razorpay webhook handler |
| POST | `/webhooks/stripe` | Public (signed) | — | Stripe webhook handler |

---

## Module 5 — Locations

| Method | Route | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/locations` | JWT | Any | List all locations |
| POST | `/locations` | JWT | Owner | Create new location |
| GET | `/locations/:id` | JWT | Any | Get location details |
| PATCH | `/locations/:id` | JWT | Owner/Manager | Update location |
| DELETE | `/locations/:id` | JWT | Owner | Delete location |

---

## Module 6 — Tables & Rooms

| Method | Route | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/tables` | JWT | Any | List all tables (filter by location) |
| POST | `/tables` | JWT | Owner/Manager | Create table |
| GET | `/tables/:id` | JWT | Any | Get table with current status |
| PATCH | `/tables/:id` | JWT | Owner/Manager | Update table details |
| PATCH | `/tables/:id/status` | JWT | Waiter+ | Update table status |
| DELETE | `/tables/:id` | JWT | Owner | Delete table |
| POST | `/tables/bulk` | JWT | Owner/Manager | Create multiple tables at once |
| GET | `/tables/floor-plan` | JWT | Any | Get floor plan positions |
| PATCH | `/tables/floor-plan` | JWT | Owner/Manager | Save floor plan layout |

---

## Module 7 — QR Codes

| Method | Route | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/qr-codes` | JWT | Any | List all QR codes |
| GET | `/qr-codes/:tableId` | JWT | Any | Get QR code for table |
| POST | `/qr-codes/:tableId/generate` | JWT | Owner/Manager | Generate/regenerate QR |
| PATCH | `/qr-codes/:tableId/branding` | JWT | Owner/Manager | Update QR branding |
| GET | `/qr-codes/:tableId/download` | JWT | Any | Download QR (PNG/PDF) |
| GET | `/qr-codes/bulk/download` | JWT | Owner/Manager | Download all QRs as ZIP |
| GET | `/qr-codes/:tableId/analytics` | JWT | Owner/Manager | QR scan analytics |

---

## Module 8 — Menus

| Method | Route | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/menus` | JWT | Any | List all menus |
| POST | `/menus` | JWT | Owner/Manager | Create menu |
| GET | `/menus/:menuId` | JWT | Any | Get menu with categories |
| PATCH | `/menus/:menuId` | JWT | Owner/Manager | Update menu |
| DELETE | `/menus/:menuId` | JWT | Owner | Delete menu |
| PATCH | `/menus/:menuId/status` | JWT | Owner/Manager | Enable/disable menu |

---

## Module 9 — Categories

| Method | Route | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/menus/:menuId/categories` | JWT | Any | List categories |
| POST | `/menus/:menuId/categories` | JWT | Owner/Manager | Create category |
| GET | `/menus/:menuId/categories/:id` | JWT | Any | Get category |
| PATCH | `/menus/:menuId/categories/:id` | JWT | Owner/Manager | Update category |
| DELETE | `/menus/:menuId/categories/:id` | JWT | Owner | Delete category |
| PATCH | `/menus/:menuId/categories/reorder` | JWT | Owner/Manager | Reorder categories |

---

## Module 10 — Menu Items

| Method | Route | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/menus/:menuId/items` | JWT | Any | List items (with pagination) |
| POST | `/menus/:menuId/items` | JWT | Owner/Manager | Create item |
| GET | `/menus/:menuId/items/:id` | JWT | Any | Get item details |
| PATCH | `/menus/:menuId/items/:id` | JWT | Owner/Manager | Update item |
| DELETE | `/menus/:menuId/items/:id` | JWT | Owner | Soft-delete item |
| PATCH | `/menus/:menuId/items/:id/availability` | JWT | Chef/Manager+ | Toggle item availability (86) |
| POST | `/menus/:menuId/items/:id/image` | JWT | Owner/Manager | Upload item image |
| GET | `/menus/:menuId/items/search` | JWT | Any | Search items by name |
| POST | `/menus/import` | JWT | Owner | Import items via CSV |

---

## Module 11 — Modifier Groups

| Method | Route | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/modifier-groups` | JWT | Any | List all modifier groups |
| POST | `/modifier-groups` | JWT | Owner/Manager | Create modifier group |
| GET | `/modifier-groups/:id` | JWT | Any | Get modifier group |
| PATCH | `/modifier-groups/:id` | JWT | Owner/Manager | Update modifier group |
| DELETE | `/modifier-groups/:id` | JWT | Owner | Delete modifier group |
| POST | `/menu-items/:itemId/modifier-groups` | JWT | Owner/Manager | Attach modifier group to item |
| DELETE | `/menu-items/:itemId/modifier-groups/:groupId` | JWT | Owner | Detach modifier group |

---

## Module 12 — Customer Ordering (Public API — No Auth)

These routes are on the public subdomain and have heavy rate limiting.

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/public/menu/:tenantSlug` | Public | Get full menu for tenant (cached) |
| GET | `/public/menu/:tenantSlug/table/:tableId` | Public | Validate table + get menu |
| POST | `/public/orders` | Public | Place new order |
| GET | `/public/orders/:orderId/status` | Public | Get order status (polling) |
| POST | `/public/orders/:orderId/call-waiter` | Public | Send waiter call notification |
| POST | `/public/orders/:orderId/request-bill` | Public | Request bill |
| GET | `/public/tenants/:slug/info` | Public | Get basic business info (open/closed) |

---

## Module 13 — Orders (Staff Dashboard)

| Method | Route | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/orders` | JWT | Waiter+ | List orders (filter: status, table, date) |
| POST | `/orders` | JWT | Waiter+ | Create manual order |
| GET | `/orders/:id` | JWT | Waiter+ | Get order details |
| PATCH | `/orders/:id/status` | JWT | Waiter/Chef+ | Update order status |
| PATCH | `/orders/:id/items/:itemId/status` | JWT | Chef+ | Update individual item status (KDS) |
| POST | `/orders/:id/accept` | JWT | Manager+ | Accept order |
| POST | `/orders/:id/reject` | JWT | Manager+ | Reject order with reason |
| POST | `/orders/:id/discount` | JWT | Manager+ | Apply discount |
| GET | `/orders/live` | JWT (WS) | Waiter+ | WebSocket live order feed |
| GET | `/orders/kds` | JWT (WS) | Chef+ | WebSocket KDS feed |

---

## Module 14 — Analytics

| Method | Route | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/analytics/overview` | JWT | Owner/Manager | Summary cards (revenue, orders, avg value) |
| GET | `/analytics/revenue` | JWT | Owner/Manager | Revenue over time (daily/weekly/monthly) |
| GET | `/analytics/orders` | JWT | Owner/Manager | Order volume over time |
| GET | `/analytics/items/top` | JWT | Owner/Manager | Top-selling items |
| GET | `/analytics/items/performance` | JWT | Owner/Manager | All items with metrics |
| GET | `/analytics/heatmap` | JWT | Owner/Manager | Orders by hour of day |
| GET | `/analytics/tables` | JWT | Owner/Manager | Revenue per table |
| GET | `/analytics/export` | JWT | Owner | Export report (CSV/PDF) |

---

## Module 15 — WhatsApp

| Method | Route | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/whatsapp/status` | JWT | Owner | Get WhatsApp connection status |
| POST | `/whatsapp/connect` | JWT | Owner | Initiate WhatsApp Business API connection |
| DELETE | `/whatsapp/disconnect` | JWT | Owner | Disconnect WhatsApp |
| GET | `/whatsapp/templates` | JWT | Owner | List approved message templates |
| GET | `/whatsapp/messages` | JWT | Owner/Manager | List sent messages log |
| POST | `/webhooks/whatsapp` | Public (signed) | — | Meta webhook for status updates + replies |

---

## Module 16 — Notifications (Internal)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | JWT | Get unread notifications |
| PATCH | `/notifications/:id/read` | JWT | Mark notification as read |
| PATCH | `/notifications/read-all` | JWT | Mark all as read |
| DELETE | `/notifications/:id` | JWT | Delete notification |

---

## Module 17 — Admin (Internal Super-Admin)

> Accessible only with super-admin token. Not tenant-scoped.

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/admin/tenants` | SuperAdmin | List all tenants |
| GET | `/admin/tenants/:id` | SuperAdmin | Get tenant details |
| PATCH | `/admin/tenants/:id/plan` | SuperAdmin | Manually override plan |
| POST | `/admin/tenants/:id/suspend` | SuperAdmin | Suspend tenant |
| GET | `/admin/metrics` | SuperAdmin | Platform-wide metrics |
| GET | `/admin/audit-logs` | SuperAdmin | Global audit log |

---

## WebSocket Events

### Client → Server (Actions)

| Event | Payload | Description |
|---|---|---|
| `join_room` | `{ tenantId, role }` | Join tenant's room on connection |
| `order:ack` | `{ orderId }` | KDS acknowledges order seen |
| `order:item_done` | `{ orderId, itemId }` | KDS marks item complete |
| `order:complete` | `{ orderId }` | KDS marks full order complete |
| `ping` | — | Keepalive |

### Server → Client (Events)

| Event | Payload | Subscribers |
|---|---|---|
| `order:new` | Full order object | Staff dashboard, KDS |
| `order:updated` | `{ orderId, status, updatedAt }` | Staff dashboard, KDS, customer page |
| `order:item_updated` | `{ orderId, itemId, status }` | KDS |
| `table:status_changed` | `{ tableId, status }` | Staff dashboard |
| `notification:new` | Notification object | Staff |
| `menu:item_availability` | `{ itemId, isAvailable }` | Customer ordering pages |
| `pong` | — | Keepalive response |

---

## API Rate Limits

| Tier | Limit | Scope |
|---|---|---|
| Public (ordering) | 60 req/min | Per IP |
| Authenticated API | 1,000 req/min | Per tenant |
| Analytics export | 5 req/hour | Per tenant |
| WhatsApp send | Per Meta BSP limits | Per tenant |
| Auth endpoints | 10 req/min | Per IP |

---

*Last Updated: September 2026 | Version: 1.0*
