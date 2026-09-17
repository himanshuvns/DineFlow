---
name: responsive-fix
description: Mobile, tablet, and desktop responsive layout audit and remediation runbook for Tailwind CSS and React components.
---

# Responsive Layout Diagnosis & Fix Runbook

Use this skill to diagnose and fix responsive design issues across mobile, tablet, and desktop breakpoints.

## Responsive Verification Checklist

### 1. Viewport & Breakpoint Alignment
- Ensure viewport meta is present: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
- Use mobile-first design: Unprefixed classes apply to mobile (`base`), followed by `sm:`, `md:`, `lg:`, `xl:`, `2xl:`.
- Test key breakpoints:
  - Mobile Small: 375px (iPhone SE)
  - Mobile Standard: 390px - 428px (iPhone 13-15 Pro Max)
  - Tablet: 768px - 1024px (iPad portrait/landscape)
  - Desktop: 1280px+

### 2. Horizontal Overflow Elimination
- Eliminate accidental horizontal scrollbars caused by fixed pixel widths (`w-[500px]`), negative margins, or unconstrained flex children.
- Use `max-w-full`, `w-full`, and `min-w-0` on flex/grid child elements to prevent text or table overflow.
- Use `truncate` or `break-words` on user-generated text.

### 3. Touch Targets & Mobile Ergonomics
- Ensure touch targets are at least 44x44px (`min-h-[44px] min-w-[44px]` or adequate padding `p-3`).
- Space clickable links and buttons far enough apart to prevent mis-taps.
- Inputs must have `text-base` (16px) on iOS mobile to prevent auto-zooming on focus.

### 4. Navigation & Modals on Small Screens
- Desktop sidebars must collapse to mobile slide-over drawers or bottom navigation bars.
- Modals must adjust to full-screen or bottom-sheet (`fixed inset-x-0 bottom-0 rounded-t-2xl`) on mobile screens.

### 5. Responsive Data Tables & Lists
- Convert wide data tables into responsive card grids on small screens (`hidden md:table`, `grid md:hidden`).
- If horizontal scroll is required, wrap in an explicit scroll container (`overflow-x-auto`) with subtle scroll indicators.

### 6. Sticky Footers & Action Bars
- Account for mobile browser navigation bars and notches: use `pb-safe` (safe-area-inset-bottom) and `fixed bottom-0`.
