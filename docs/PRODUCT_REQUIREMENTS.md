# DineFlow — Product Requirements

---

## 1. User Personas

### Persona 1 — Riya (Restaurant Owner)
- **Age**: 34
- **Role**: Owner, 2-location café chain
- **Tech Savvy**: Moderate (uses Instagram, WhatsApp, Swiggy dashboard)
- **Goals**: Reduce staff confusion, understand revenue per item, let customers self-order
- **Pain Points**: Staff training overhead, handwritten orders, no sales data
- **Quote**: *"I want to run my café, not manage spreadsheets."*

### Persona 2 — Arjun (Hotel Operations Manager)
- **Age**: 42
- **Role**: F&B Operations Manager, 200-room hotel
- **Tech Savvy**: High (ERP, PMS systems)
- **Goals**: Unify room service + restaurant + bar under one dashboard, reduce service time
- **Pain Points**: 3 different software tools, no room-number linking, manual billing reconciliation
- **Quote**: *"We lose ₹50K/month to billing errors and miscommunication."*

### Persona 3 — Chef Meena (Head Chef / Kitchen Staff)
- **Age**: 38
- **Role**: Head Chef / KDS User
- **Tech Savvy**: Low-Moderate
- **Goals**: See all incoming orders clearly, mark items done without leaving the station
- **Pain Points**: Paper tickets, shouted orders, lost chits, no priority visibility
- **Quote**: *"I can't cook if I don't know what's next."*

### Persona 4 — Kai (Food Truck Operator)
- **Age**: 27
- **Role**: Solo operator, weekend food truck
- **Tech Savvy**: High (Instagram, Shopify, etc.)
- **Goals**: Zero monthly cost, QR code for weekend market, quick menu updates
- **Pain Points**: Expensive POS, no table — needs counter/pickup model
- **Quote**: *"I just need a QR code that works and doesn't charge me ₹3000/month."*

### Persona 5 — Priya (Customer / Guest)
- **Age**: 29
- **Role**: Dine-in customer
- **Tech Savvy**: High
- **Goals**: Scan QR, see menu, order, and pay without calling a waiter
- **Pain Points**: Slow service, having to flag down waitstaff, app downloads
- **Quote**: *"Just let me order from my phone. That's it."*

---

## 2. Functional Requirements

### 2.1 Authentication & Multi-Tenancy

| ID | Requirement | Priority |
|---|---|---|
| FR-001 | Business registration with email/phone + OTP | P0 |
| FR-002 | Secure login (email/password + magic link) | P0 |
| FR-003 | Each business gets an isolated workspace (tenant) | P0 |
| FR-004 | Role-based access control (Owner, Manager, Staff, Chef, Waiter) | P0 |
| FR-005 | Invite team members by email | P1 |
| FR-006 | SSO via Google (optional for dashboard login) | P2 |
| FR-007 | Session management with refresh tokens | P0 |
| FR-008 | 2FA support for admin accounts | P1 |

### 2.2 Subscription & Billing

| ID | Requirement | Priority |
|---|---|---|
| FR-010 | 4 subscription plans: Free, Starter, Growth, Hotel Pro | P0 |
| FR-011 | Plan selection during onboarding | P0 |
| FR-012 | Stripe/Razorpay integration for payments | P0 |
| FR-013 | Subscription lifecycle: active, trial, past_due, canceled | P0 |
| FR-014 | 14-day grace period after payment failure | P0 |
| FR-015 | Automatic downgrade to Free after grace period | P0 |
| FR-016 | Email notifications for upcoming renewal, payment failure | P0 |
| FR-017 | WhatsApp notifications for billing events | P1 |
| FR-018 | Invoice generation and download | P1 |
| FR-019 | Plan upgrade/downgrade self-serve | P1 |

### 2.3 Onboarding

| ID | Requirement | Priority |
|---|---|---|
| FR-020 | Guided onboarding wizard (5 steps max) | P0 |
| FR-021 | Business type selection (restaurant, café, hotel, etc.) | P0 |
| FR-022 | Business profile setup (name, logo, address, timezone) | P0 |
| FR-023 | Sample menu auto-populated on first login | P1 |
| FR-024 | QR code generated within 2 minutes of registration | P0 |
| FR-025 | Onboarding checklist with progress tracking | P1 |

### 2.4 Menu Management

| ID | Requirement | Priority |
|---|---|---|
| FR-030 | Create, edit, delete menu categories | P0 |
| FR-031 | Create, edit, delete menu items with image, description, price | P0 |
| FR-032 | Mark items as available / unavailable (86'd) in real-time | P0 |
| FR-033 | Add modifiers/add-ons (e.g., extra cheese, spice level) | P0 |
| FR-034 | Support item variants (size: Small/Medium/Large) | P0 |
| FR-035 | Set tax rates per item or globally | P1 |
| FR-036 | Dietary tags (Vegan, Gluten-Free, Spicy, etc.) | P1 |
| FR-037 | Scheduled availability (breakfast menu 7–11 AM) | P2 |
| FR-038 | Multi-language menu support | P3 |
| FR-039 | Menu import via CSV | P2 |
| FR-040 | Multiple menus per location (dine-in vs. takeaway vs. delivery) | P1 |

### 2.5 QR Code System

| ID | Requirement | Priority |
|---|---|---|
| FR-050 | Generate unique QR code per table or hotel room | P0 |
| FR-051 | QR codes open a mobile-optimized ordering page (no app required) | P0 |
| FR-052 | QR codes link to specific tenant's menu | P0 |
| FR-053 | Download QR codes as PNG, SVG, or print-ready PDF | P0 |
| FR-054 | Branded QR codes (logo in center, custom colors) | P1 |
| FR-055 | Regenerate QR code (invalidate old one) | P1 |
| FR-056 | QR code analytics (scan count, conversion rate) | P2 |

### 2.6 Customer Ordering Flow

| ID | Requirement | Priority |
|---|---|---|
| FR-060 | Customer scans QR → lands on mobile menu (no login required) | P0 |
| FR-061 | Customer can browse categories, view item details | P0 |
| FR-062 | Add items to cart with modifiers | P0 |
| FR-063 | Enter name and optional phone number to place order | P0 |
| FR-064 | Order confirmation with estimated prep time | P0 |
| FR-065 | Order status tracking (Received → Preparing → Ready → Served) | P0 |
| FR-066 | Customer receives WhatsApp confirmation message | P1 |
| FR-067 | Customer can reorder from WhatsApp history | P2 |
| FR-068 | Special instructions per item | P0 |
| FR-069 | Multiple rounds of ordering at the same table | P1 |
| FR-070 | Call waiter button on ordering page | P1 |
| FR-071 | Request bill button on ordering page | P1 |
| FR-072 | Online payment via Stripe/Razorpay (optional per tenant) | P1 |

### 2.7 Order Management (Staff Dashboard)

| ID | Requirement | Priority |
|---|---|---|
| FR-080 | Live order feed for staff | P0 |
| FR-081 | Accept / reject orders | P0 |
| FR-082 | Update order status in real-time | P0 |
| FR-083 | Sound/visual notification for new orders | P0 |
| FR-084 | View order history | P0 |
| FR-085 | Filter orders by status, table, date | P1 |
| FR-086 | Manual order creation by staff | P1 |
| FR-087 | Split bill functionality | P2 |
| FR-088 | Apply discount / coupon to order | P2 |
| FR-089 | Print order receipt (thermal printer support) | P1 |

### 2.8 Kitchen Display System (KDS)

| ID | Requirement | Priority |
|---|---|---|
| FR-090 | Dedicated KDS screen with all active orders | P0 |
| FR-091 | Orders displayed as cards with item list | P0 |
| FR-092 | Mark individual items as done | P0 |
| FR-093 | Mark full order as complete | P0 |
| FR-094 | Color-coded urgency (green < 5min, yellow 5–10min, red >10min) | P0 |
| FR-095 | Audio alert on new order | P0 |
| FR-096 | KDS works on tablet in full-screen mode | P0 |
| FR-097 | Multi-station KDS (e.g., grill station sees only grill items) | P2 |
| FR-098 | Bump bar support | P3 |

### 2.9 Table & Room Management

| ID | Requirement | Priority |
|---|---|---|
| FR-100 | Create floor plan with table layout (drag and drop) | P1 |
| FR-101 | View table status: Available, Occupied, Reserved, Billing | P0 |
| FR-102 | Assign orders to tables | P0 |
| FR-103 | Merge / split tables | P2 |
| FR-104 | Hotel room directory (room number, type, floor) | P1 |
| FR-105 | Room service orders linked to room number | P1 |
| FR-106 | Guest check-in/check-out status sync (PMS integration future) | P3 |

### 2.10 Staff Management

| ID | Requirement | Priority |
|---|---|---|
| FR-110 | Add staff members with roles | P0 |
| FR-111 | Role permissions matrix (what each role can see/do) | P0 |
| FR-112 | Staff shift scheduling | P2 |
| FR-113 | Staff activity log | P2 |
| FR-114 | PIN-based POS login for staff (no email needed at station) | P2 |

### 2.11 WhatsApp Integration

| ID | Requirement | Priority |
|---|---|---|
| FR-120 | Connect WhatsApp Business API (via Meta or BSP) | P0 |
| FR-121 | Send order confirmation to customer on WhatsApp | P0 |
| FR-122 | Send order status updates (Preparing, Ready) | P1 |
| FR-123 | Send billing summary on order close | P1 |
| FR-124 | Send renewal reminders to business owners | P1 |
| FR-125 | Customer can reply to initiate reorder (future AI flow) | P3 |
| FR-126 | Opt-out handling (STOP keyword) | P1 |
| FR-127 | WhatsApp message logs per tenant | P1 |

### 2.12 Analytics & Reporting

| ID | Requirement | Priority |
|---|---|---|
| FR-130 | Revenue dashboard (daily, weekly, monthly) | P0 |
| FR-131 | Top-selling items report | P0 |
| FR-132 | Orders by time-of-day heatmap | P1 |
| FR-133 | Average order value trend | P1 |
| FR-134 | Menu item performance (orders, revenue, cancellations) | P1 |
| FR-135 | Staff performance metrics | P2 |
| FR-136 | Export reports as CSV or PDF | P1 |
| FR-137 | Real-time sales counter on dashboard | P0 |

### 2.13 Settings & Configuration

| ID | Requirement | Priority |
|---|---|---|
| FR-140 | Business profile (name, logo, contact, address) | P0 |
| FR-141 | Operating hours configuration | P0 |
| FR-142 | Currency and tax configuration | P0 |
| FR-143 | Notification preferences (sound, browser, WhatsApp) | P1 |
| FR-144 | Custom domain / subdomain for ordering page | P2 |
| FR-145 | Theme customization for ordering page | P2 |
| FR-146 | Integrations page (payment, WhatsApp, printer) | P1 |

---

## 3. Non-Functional Requirements

### 3.1 Performance

| Requirement | Target |
|---|---|
| Customer ordering page load time (P95) | < 1.5 seconds |
| Dashboard initial load (P95) | < 2 seconds |
| Order event propagation (place → KDS) | < 500ms |
| API response time (P95) | < 300ms |
| Database query P99 | < 100ms |

### 3.2 Scalability

| Requirement | Target |
|---|---|
| Concurrent tenants | 10,000+ |
| Orders per second (peak) | 500+ |
| Menu items per tenant | 1,000+ |
| Tables per location | 500+ |
| API throughput | 10,000 req/sec |

### 3.3 Reliability

| Requirement | Target |
|---|---|
| Platform uptime SLA | 99.9% (< 8.7 hrs/year downtime) |
| Data durability | 99.9999% (6 nines) |
| Recovery Time Objective (RTO) | < 1 hour |
| Recovery Point Objective (RPO) | < 5 minutes |

### 3.4 Security

- All data encrypted at rest (AES-256) and in transit (TLS 1.3)
- Tenant data isolation enforced at DB query level
- OWASP Top 10 protection
- Rate limiting on all public APIs
- GDPR compliance (customer data deletion on request)
- PCI-DSS compliance for payment flows
- JWT with short-lived access tokens + refresh token rotation

### 3.5 Accessibility

- WCAG 2.1 AA compliance on customer-facing ordering pages
- Keyboard navigation throughout dashboard
- Screen reader support for KDS
- Minimum contrast ratio 4.5:1

### 3.6 Internationalisation

- Multi-currency support (INR, USD, AED, SGD, GBP)
- Timezone-aware order timestamps
- i18n-ready codebase (en, hi, ar, fr as initial targets)
- RTL layout support (Phase 3+)

---

## 4. User Journeys

### Journey 1 — New Restaurant Onboarding

```
1. Owner visits dineflow.app
2. Clicks "Start for Free"
3. Registers with email + OTP
4. Selects business type: Restaurant
5. Enters business name, location, timezone
6. Uploads logo (optional)
7. Creates first menu category + 3 items
8. Platform generates QR codes for 5 tables
9. Owner downloads QR PDF
10. Places QR on tables
11. First customer scans QR → orders
12. Owner sees order in dashboard + KDS
```

### Journey 2 — Customer Orders via QR

```
1. Customer sits at Table 4
2. Scans QR code on table
3. Opens mobile menu in browser (no app download)
4. Browses menu → adds 2 items to cart
5. Adds modifier: "Extra spicy"
6. Enters name: "Priya"
7. Taps "Place Order"
8. Receives WhatsApp message: "Order confirmed, est. 12 min"
9. Order appears on KDS in kitchen
10. Chef marks order as ready
11. Status updates: "Your order is ready!"
12. Waiter serves; customer taps "Request Bill"
13. Bill arrives at table
```

### Journey 3 — Subscription Renewal Failure

```
1. Business is on Growth plan
2. Monthly renewal fails (card expired)
3. System sends email: "Payment failed – 14 days grace period"
4. System sends WhatsApp: same alert
5. Day 7: Reminder email + WhatsApp
6. Day 13: Final warning
7. Day 14: System downgrades to Free plan
8. Business data preserved (menus, orders, staff)
9. Features restricted to Free plan limits
10. Owner can upgrade at any time to restore features
```

### Journey 4 — Hotel Room Service

```
1. Hotel guest in Room 312 scans QR on TV unit
2. Opens room service menu (filtered to hotel menu)
3. Selects items, places order
4. Kitchen receives order tagged "Room 312"
5. Staff delivers; marks order as served
6. Charge added to room folio (future PMS integration)
```

---

*Last Updated: September 2026 | Version: 1.0*
