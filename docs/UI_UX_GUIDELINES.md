# DineFlow — UI/UX Guidelines

> Design philosophy: **Calm Luxury**. Like Stripe for restaurants. Every interaction should feel precise, deliberate, and delightful.

---

## 1. Design Philosophy

### Core Principles

| Principle | Implementation |
|---|---|
| **Clarity over Cleverness** | Information is never hidden. Status is always visible. |
| **Speed as a Feature** | Instant feedback. No spinners where skeletons suffice. |
| **Progressive Disclosure** | Show what's needed now. Advanced options are one click away. |
| **Calm Technology** | The UI doesn't shout. It informs quietly and acts decisively. |
| **Delight in Details** | Micro-animations, haptic metaphors, subtle gradients — premium feel. |

### Design Inspiration

- **Stripe Dashboard** — data density without clutter
- **Linear** — keyboard-first, fast, minimal, opinionated
- **Vercel** — dark mode excellence, glassmorphism, gradient accents
- **Apple HIG** — spatial consistency, typography hierarchy
- **Airbnb** — warm, human, photo-forward
- **Toast POS** — operational efficiency for kitchen environments

---

## 2. Color Palette

### Brand Colors

```css
:root {
  /* Primary Brand — Ember Orange */
  --color-brand-50:  #FFF4ED;
  --color-brand-100: #FFE6D3;
  --color-brand-200: #FFC9A3;
  --color-brand-300: #FFA368;
  --color-brand-400: #FF7231;
  --color-brand-500: #F25C1A;   /* PRIMARY */
  --color-brand-600: #D94310;
  --color-brand-700: #B52F0C;
  --color-brand-800: #922612;
  --color-brand-900: #762212;

  /* Accent — Deep Teal (for data, charts, success states) */
  --color-accent-50:  #EDFAFA;
  --color-accent-100: #D5F5F6;
  --color-accent-200: #AFECEF;
  --color-accent-300: #7EDCE2;
  --color-accent-400: #16BDCA;
  --color-accent-500: #0694A2;  /* ACCENT */
  --color-accent-600: #047481;
  --color-accent-700: #036672;
  --color-accent-800: #025F67;
  --color-accent-900: #014F59;
}
```

### Semantic Colors

```css
:root {
  /* Status Colors */
  --color-success-light: #ECFDF5;
  --color-success:       #10B981;
  --color-success-dark:  #047857;

  --color-warning-light: #FFFBEB;
  --color-warning:       #F59E0B;
  --color-warning-dark:  #B45309;

  --color-error-light:   #FEF2F2;
  --color-error:         #EF4444;
  --color-error-dark:    #DC2626;

  --color-info-light:    #EFF6FF;
  --color-info:          #3B82F6;
  --color-info-dark:     #1D4ED8;

  /* KDS Urgency Colors */
  --color-kds-fresh:     #10B981;   /* < 5 min */
  --color-kds-warning:   #F59E0B;   /* 5–10 min */
  --color-kds-urgent:    #EF4444;   /* > 10 min */
  --color-kds-critical:  #7C3AED;   /* > 20 min, pulsing */
}
```

### Dark Mode (Default Dashboard Theme)

```css
[data-theme="dark"] {
  /* Backgrounds */
  --bg-base:       #0A0A0F;     /* Deepest background */
  --bg-surface:    #111118;     /* Cards, panels */
  --bg-elevated:   #1A1A25;     /* Modals, dropdowns */
  --bg-hover:      #1E1E2C;     /* Hover states */
  --bg-active:     #252535;     /* Active/selected */

  /* Borders */
  --border-subtle:  rgba(255,255,255,0.06);
  --border-default: rgba(255,255,255,0.10);
  --border-strong:  rgba(255,255,255,0.18);

  /* Text */
  --text-primary:   #F1F0FF;
  --text-secondary: #A09DB8;
  --text-tertiary:  #6B6883;
  --text-disabled:  #3D3B52;
  --text-inverse:   #0A0A0F;

  /* Glassmorphism */
  --glass-bg:       rgba(26, 26, 37, 0.80);
  --glass-border:   rgba(255, 255, 255, 0.08);
  --glass-blur:     16px;
}

[data-theme="light"] {
  --bg-base:       #F8F7FF;
  --bg-surface:    #FFFFFF;
  --bg-elevated:   #FFFFFF;
  --bg-hover:      #F3F2FF;
  --bg-active:     #EAE9FF;

  --border-subtle:  rgba(0,0,0,0.05);
  --border-default: rgba(0,0,0,0.08);
  --border-strong:  rgba(0,0,0,0.15);

  --text-primary:   #0A0A0F;
  --text-secondary: #4A4860;
  --text-tertiary:  #8884A0;
  --text-disabled:  #C9C7DC;
  --text-inverse:   #F1F0FF;
}
```

### Customer Ordering Page — Light + Warm

```css
/* Ordering page uses a warmer, more approachable palette */
.ordering-page {
  --ordering-bg:         #FAFAFA;
  --ordering-surface:    #FFFFFF;
  --ordering-brand:      var(--color-brand-500);
  --ordering-text:       #1A1A2E;
  --ordering-text-muted: #6B6883;
}
```

---

## 3. Typography

### Font Stack

```css
/* Import in global CSS */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --font-sans:    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-display: 'Plus Jakarta Sans', var(--font-sans);
  --font-mono:    'JetBrains Mono', 'Fira Code', monospace;
}
```

- **Inter** — UI text, body copy, labels
- **Plus Jakarta Sans** — Headings, hero text, brand moments
- **JetBrains Mono** — Order numbers, IDs, codes

### Type Scale

```css
:root {
  --text-xs:   0.75rem;   /* 12px — labels, badges */
  --text-sm:   0.875rem;  /* 14px — body secondary, captions */
  --text-base: 1rem;      /* 16px — body primary */
  --text-lg:   1.125rem;  /* 18px — card titles */
  --text-xl:   1.25rem;   /* 20px — section headers */
  --text-2xl:  1.5rem;    /* 24px — page titles */
  --text-3xl:  1.875rem;  /* 30px — dashboard headlines */
  --text-4xl:  2.25rem;   /* 36px — marketing hero */
  --text-5xl:  3rem;      /* 48px — landing page hero */

  /* Line Heights */
  --leading-tight:  1.25;
  --leading-snug:   1.375;
  --leading-normal: 1.5;
  --leading-relaxed:1.625;

  /* Font Weights */
  --font-light:    300;
  --font-regular:  400;
  --font-medium:   500;
  --font-semibold: 600;
  --font-bold:     700;
  --font-extrabold:800;

  /* Letter Spacing */
  --tracking-tight:  -0.025em;
  --tracking-normal:  0em;
  --tracking-wide:    0.025em;
  --tracking-wider:   0.05em;
  --tracking-widest:  0.1em;   /* Use for all-caps labels */
}
```

### Typography Usage Rules

| Context | Font | Size | Weight | Color |
|---|---|---|---|---|
| Page Title | Plus Jakarta Sans | 2xl | 700 | text-primary |
| Section Header | Inter | xl | 600 | text-primary |
| Card Title | Inter | lg | 600 | text-primary |
| Body Text | Inter | base | 400 | text-primary |
| Secondary Text | Inter | sm | 400 | text-secondary |
| Label / Caption | Inter | xs | 500 | text-tertiary |
| Metric Number | Plus Jakarta Sans | 3xl | 700 | text-primary |
| Order Number | JetBrains Mono | sm | 500 | text-secondary |
| Button Text | Inter | sm | 600 | depends on variant |
| Tab Label | Inter | sm | 500 | text-secondary/primary |

---

## 4. Spacing System

```css
:root {
  --space-0:    0px;
  --space-1:    4px;
  --space-2:    8px;
  --space-3:    12px;
  --space-4:    16px;
  --space-5:    20px;
  --space-6:    24px;
  --space-7:    28px;
  --space-8:    32px;
  --space-10:   40px;
  --space-12:   48px;
  --space-16:   64px;
  --space-20:   80px;
  --space-24:   96px;

  /* Component-Specific */
  --sidebar-width:     240px;
  --sidebar-collapsed: 64px;
  --topbar-height:     60px;
  --kds-card-min-width: 280px;
  --kds-card-max-width: 360px;
}
```

### Border Radius

```css
:root {
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-2xl:  20px;
  --radius-full: 9999px;
}
```

### Shadows

```css
:root {
  --shadow-xs:  0 1px 2px rgba(0,0,0,0.05);
  --shadow-sm:  0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md:  0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06);
  --shadow-lg:  0 10px 15px rgba(0,0,0,0.10), 0 4px 6px rgba(0,0,0,0.05);
  --shadow-xl:  0 20px 25px rgba(0,0,0,0.10), 0 10px 10px rgba(0,0,0,0.04);
  --shadow-glow: 0 0 20px rgba(242, 92, 26, 0.25);   /* Brand glow */
  --shadow-kds-card: 0 2px 8px rgba(0,0,0,0.20);
}
```

---

## 5. Component Library

### Button System

```
Variants: primary | secondary | ghost | danger | success
Sizes:    xs | sm | md | lg | icon
States:   default | hover | active | disabled | loading
```

**Visual Specs:**

| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| Primary | brand-500 | white | none | brand-600, scale(1.01) |
| Secondary | bg-elevated | text-primary | border-default | bg-hover |
| Ghost | transparent | text-secondary | none | bg-hover |
| Danger | error | white | none | error-dark |
| Success | success | white | none | success-dark |

**Loading state**: Replace text with spinner + "..." — never disable-flash.

### Input Fields

```css
.input {
  height: 40px;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.input:focus {
  border-color: var(--color-brand-500);
  box-shadow: 0 0 0 3px rgba(242, 92, 26, 0.15);
  outline: none;
}

.input.error {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
}
```

### Cards

```css
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 200ms ease, border-color 200ms ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border-default);
}
```

### Badges / Status Chips

```
Colors:
  green  → available, paid, active, ready
  yellow → pending, preparing, trial, warning
  red    → occupied, unpaid, error, cancelled
  blue   → reserved, info
  purple → critical, KDS overdue
  gray   → inactive, disabled, draft
```

### KDS Order Card

```
┌──────────────────────────────────┐
│  Table 4          ●  12:34       │  ← table + timestamp
│  PP-2026-0047               7m  │  ← order# + elapsed time
├──────────────────────────────────┤
│  ⬜ Margherita Pizza (Lg)         │  ← item with checkbox
│     + Extra Cheese                │
│     + No olives                  │
│  ⬜ Garlic Bread ×2              │
│  ✅ Caesar Salad                  │  ← completed item
├──────────────────────────────────┤
│  💬 Extra crispy please          │
├──────────────────────────────────┤
│  [ Mark All Done ✓ ]             │
└──────────────────────────────────┘
```

Border-left color indicates urgency:
- Green (< 5 min): `border-left: 4px solid var(--color-kds-fresh)`
- Yellow (5–10 min): `border-left: 4px solid var(--color-kds-warning)`
- Red (> 10 min): `border-left: 4px solid var(--color-kds-urgent)` + subtle pulse

---

## 6. Animation & Micro-Interactions

### Animation Tokens

```css
:root {
  --duration-instant:  50ms;
  --duration-fast:    150ms;
  --duration-normal:  250ms;
  --duration-slow:    400ms;
  --duration-slower:  600ms;

  --ease-default:     cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring:      cubic-bezier(0.34, 1.56, 0.64, 1);  /* Springy for success */
  --ease-smooth:      cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-in:          cubic-bezier(0.4, 0, 1, 1);
  --ease-out:         cubic-bezier(0, 0, 0.2, 1);
}
```

### Key Animations

| Interaction | Animation | Duration | Easing |
|---|---|---|---|
| Button click | Scale 0.97 → 1 | 150ms | ease-out |
| Card appear | Fade + slide up 8px | 250ms | ease-out |
| Modal open | Scale 0.96 → 1 + fade | 300ms | ease-spring |
| Toast appear | Slide in from bottom | 300ms | ease-spring |
| New KDS order | Flash border + slide in | 400ms | ease-spring |
| Order complete | Checkmark stroke + green fill | 600ms | ease-spring |
| Page transition | Cross-fade 150ms | 150ms | ease-default |
| Sidebar collapse | Width + opacity | 250ms | ease-smooth |
| Skeleton loading | Shimmer sweep 1.5s | Loop | linear |
| Number counter | Count up animation | 800ms | ease-out |

### Rules

- ❌ Never animate `width/height` directly — use `transform: scale()`
- ✅ Always animate on `transform` and `opacity` (GPU composited)
- ❌ No animations for users with `prefers-reduced-motion: reduce`
- ✅ Add `will-change: transform` only to elements that animate frequently

---

## 7. Layout System

### Dashboard Layout

```
┌──────────────────────────────────────────────────────────┐
│  TOPBAR (h-60px): Logo | Breadcrumb | Search | User      │
├─────────────────┬────────────────────────────────────────┤
│                 │                                        │
│  SIDEBAR        │   MAIN CONTENT AREA                    │
│  (w-240px)      │   Max-width: 1440px                    │
│                 │   Padding: 24px                        │
│  Nav items      │                                        │
│  with icons     │                                        │
│  + labels       │                                        │
│                 │                                        │
│  [Collapsed:    │                                        │
│   64px, icons]  │                                        │
│                 │                                        │
└─────────────────┴────────────────────────────────────────┘
```

### Grid System

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);
}

/* Metric cards: 3 per row → 4 per row on wide */
.metric-card { grid-column: span 3; }

/* Charts: 6 columns */
.chart-full  { grid-column: span 12; }
.chart-half  { grid-column: span 6; }
.chart-third { grid-column: span 4; }
```

### KDS Layout

```
Grid: masonry-like, auto-fill columns
Min card width: 280px
Max card width: 360px
Gap: 16px
Background: near-black (kitchen visibility)
```

### Customer Ordering Page

```
Single column, mobile-first
Max width: 428px (iPhone 14 Pro max width)
Centered on desktop with subtle background
Sticky: cart summary bar at bottom
Sticky: category nav tabs at top (scrolls with)
```

---

## 8. Dark Mode

- **Dashboard**: Dark by default. Users can toggle to light in settings.
- **Customer Ordering Page**: Always light (better legibility in varied restaurant lighting).
- **KDS**: Always dark (kitchen environment, glare reduction).

### Dark Mode Implementation

```css
/* Default = dark */
:root { [data-theme="dark"] tokens }

/* Light override */
:root[data-theme="light"] { [data-theme="light"] tokens }

/* System preference fallback */
@media (prefers-color-scheme: light) {
  :root:not([data-theme]) { [data-theme="light"] tokens }
}
```

---

## 9. Accessibility

### Standards

- WCAG 2.1 Level AA compliance
- Minimum color contrast ratio: **4.5:1** for text, **3:1** for UI components
- All interactive elements: minimum 44×44px touch target
- Focus styles: visible `box-shadow` ring on all focusable elements

### Implementation

```css
/* Global focus visible */
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px var(--color-brand-500);
  border-radius: var(--radius-sm);
}

/* Skip to main content */
.skip-link {
  position: absolute;
  transform: translateY(-100%);
  transition: transform 200ms;
}
.skip-link:focus { transform: translateY(0); }
```

### ARIA Patterns

| Component | ARIA Pattern |
|---|---|
| Modal | `role="dialog"`, `aria-modal="true"`, focus trap |
| KDS Order Card | `role="article"`, `aria-label="Order for Table 4"` |
| Status Badge | `aria-label="Status: Preparing"` |
| Live Orders | `aria-live="polite"` region |
| New Order Alert | `aria-live="assertive"` |
| Loading skeleton | `aria-busy="true"` |

---

## 10. Responsive Breakpoints

```css
:root {
  --bp-sm:  640px;   /* Mobile landscape */
  --bp-md:  768px;   /* Tablet portrait */
  --bp-lg:  1024px;  /* Tablet landscape / small laptop */
  --bp-xl:  1280px;  /* Desktop */
  --bp-2xl: 1536px;  /* Wide desktop */
}

/* Usage */
@media (min-width: 768px) { /* tablet+ */ }
@media (min-width: 1024px) { /* desktop */ }
```

### Per-Screen Strategy

| Screen | Dashboard | KDS | Ordering Page |
|---|---|---|---|
| Mobile (< 768px) | Hamburger sidebar | Not optimized (tablet needed) | Fully optimized |
| Tablet (768–1024) | Collapsible sidebar | Optimized | Works |
| Desktop (> 1024px) | Full sidebar | Multi-column view | Centered, max 428px |

---

## 11. Iconography

**Library**: Lucide React (consistent stroke width, clean, open-source)

```
Navigation Icons:
  LayoutDashboard → Overview
  ClipboardList   → Orders
  UtensilsCrossed → Menu
  Grid3x3         → Tables
  ChefHat         → KDS
  Users           → Staff
  BarChart3       → Analytics
  Settings        → Settings
  CreditCard      → Billing
  QrCode          → QR Codes

Action Icons:
  Plus            → Create
  Pencil          → Edit
  Trash2          → Delete
  Eye             → View
  Download        → Download
  RefreshCw       → Refresh/Regenerate
  Check           → Complete/Confirm
  X               → Cancel/Close
  AlertTriangle   → Warning
  Bell            → Notifications
  MessageCircle   → WhatsApp/Chat
```

**Rules:**
- Always 20×20px in navigation (stroke-width: 1.5)
- 16×16px in dense UI (tables, badges)
- 24×24px in empty states and feature cards
- Never mix Lucide with other icon libraries

---

## 12. Empty States

Every list page must have a thoughtful empty state:

```
┌─────────────────────────────────────┐
│                                     │
│         [Illustration]              │
│                                     │
│      No orders yet                  │
│   Share your QR code with           │
│   customers to start receiving      │
│   orders.                           │
│                                     │
│      [ Download QR Codes ↗ ]        │
│                                     │
└─────────────────────────────────────┘
```

Rules:
- Each empty state is unique to its context (not a generic "Nothing here" message)
- Always include a primary action to resolve the empty state
- Use illustrated SVGs (not stock photos)

---

## 13. Toast / Notification System

### Types

| Type | Color | Icon | Duration |
|---|---|---|---|
| Success | Green | CheckCircle | 4 seconds |
| Error | Red | XCircle | 6 seconds (with retry) |
| Warning | Amber | AlertTriangle | 5 seconds |
| Info | Blue | Info | 4 seconds |
| New Order | Brand | Bell | Persistent until dismissed |

### Positioning

- Desktop: Bottom-right, stacked, max 3 visible
- Mobile: Bottom-center, full-width

---

*Last Updated: September 2026 | Version: 1.0*
