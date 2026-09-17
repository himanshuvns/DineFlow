---
name: ui-audit
description: Comprehensive UI/UX and accessibility audit covering visual hierarchy, design system adherence, contrast, typography, component alignment, interactive feedback, and empty/error states across light and dark modes.
---

# UI/UX & Accessibility Audit Runbook

Use this skill to systematically evaluate user interfaces for visual consistency, user experience, and accessibility compliance.

## Audit Scope & Checklist

### 1. Visual Hierarchy & Spacing
- Verify standardized spacing scale (e.g. Tailwind `gap-2`, `gap-4`, `p-4`, `p-6`). Ensure no arbitrary misaligned margins.
- Check typography scale: Headings (`h1`, `h2`, `h3`) must follow distinct size and weight progression (`font-semibold`, `font-bold`).
- Ensure consistent border radius (`rounded-lg`, `rounded-xl`) and shadow elevations across cards and modals.

### 2. Light & Dark Theme Contrast
- Verify WCAG 2.1 AA compliance: Minimum 4.5:1 contrast ratio for normal text, 3:1 for large text and UI components.
- Check every UI component has explicit `dark:` variants for backgrounds (`bg-white dark:bg-slate-900`), borders (`border-slate-200 dark:border-slate-800`), and text (`text-slate-900 dark:text-slate-100`).
- Ensure muted text remains readable in dark mode (`text-slate-500 dark:text-slate-400`, never invisible or washed out).

### 3. Interactive States & Affordance
- Buttons and clickable elements must have defined `:hover`, `:focus-visible`, and `:active` states.
- Disabled buttons must have `disabled:opacity-50 cursor-not-allowed` and appropriate `aria-disabled` attributes.
- Loading states: Buttons must show spinners or skeleton loaders; prevent duplicate submissions.

### 4. Forms & Validation
- Every input must have an accessible label (`htmlFor` / `id` or `aria-label`).
- Inline error messages must be clearly colored (`text-red-600 dark:text-red-400`) and linked via `aria-describedby`.
- Tab order must follow a logical reading sequence.

### 5. Modals, Sheets & Dropdowns
- Ensure focus trap inside open modals. Pressing `Escape` or clicking outside must dismiss cleanly.
- Background scrolling must be locked when modal is open (`overflow-hidden` on body).

### 6. Empty & Error States
- Provide helpful empty states with clear iconography, informative copy, and a primary call-to-action button.
- Error states must offer an actionable recovery path (e.g. "Try Again" or "Reload").

## Report Template
Produce a categorized audit report:
- **Severity**: Critical (blocks usage) | High (confusing/broken) | Medium (visual defect) | Low (polish)
- **Component / File**: Path and line number
- **Issue Description**: Observed behavior vs expected behavior
- **Remediation Code**: Concrete Tailwind / React code fix
