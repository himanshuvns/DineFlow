/**
 * DineFlow Unified Design System Tokens
 * 
 * Standards for typography, spacing, colors, surfaces, and micro-interactions
 * based on 21st.dev enterprise SaaS design patterns.
 */

export const DESIGN_SYSTEM = {
  // 8px-based spacing grid
  spacing: {
    xs: "0.25rem",   // 4px
    sm: "0.5rem",    // 8px
    md: "1rem",      // 16px
    lg: "1.5rem",    // 24px
    xl: "2rem",      // 32px
    "2xl": "3rem",   // 48px
    "3xl": "4rem",   // 64px
  },

  // Typography Scale (Space Grotesk for headings, Plus Jakarta Sans for body)
  typography: {
    fonts: {
      display: "var(--font-display), var(--font-sans), system-ui, sans-serif",
      body: "var(--font-sans), system-ui, sans-serif",
    },
    headings: {
      h1: "text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white",
      h2: "text-xl sm:text-2xl font-bold tracking-tight font-display text-slate-900 dark:text-white",
      h3: "text-lg sm:text-xl font-bold tracking-tight font-display text-slate-900 dark:text-white",
      h4: "text-base sm:text-lg font-semibold text-slate-900 dark:text-white",
    },
    body: {
      lg: "text-base leading-relaxed text-slate-600 dark:text-slate-300 font-body",
      default: "text-sm leading-normal text-slate-700 dark:text-slate-200 font-body",
      sm: "text-xs leading-normal text-slate-600 dark:text-slate-400 font-body",
      caption: "text-[11px] leading-tight text-slate-500 dark:text-slate-400 font-body",
    },
  },

  // Semantic Colors
  colors: {
    primary: {
      DEFAULT: "#10b981", // Emerald 500
      hover: "#059669",   // Emerald 600
      glow: "rgba(16, 185, 129, 0.2)",
    },
    secondary: {
      DEFAULT: "#f59e0b", // Amber 500
      hover: "#d97706",   // Amber 600
      glow: "rgba(245, 158, 11, 0.2)",
    },
    accent: {
      DEFAULT: "#6366f1", // Indigo 500
      hover: "#4f46e5",   // Indigo 600
      glow: "rgba(99, 102, 241, 0.2)",
    },
    status: {
      success: {
        text: "text-emerald-700 dark:text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        dot: "bg-emerald-500",
      },
      warning: {
        text: "text-amber-800 dark:text-amber-400",
        bg: "bg-amber-500/15",
        border: "border-amber-500/30",
        dot: "bg-amber-500",
      },
      danger: {
        text: "text-rose-700 dark:text-rose-400",
        bg: "bg-rose-500/10",
        border: "border-rose-500/30",
        dot: "bg-rose-500",
      },
      info: {
        text: "text-cyan-700 dark:text-cyan-400",
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/30",
        dot: "bg-cyan-500",
      },
      neutral: {
        text: "text-slate-700 dark:text-slate-300",
        bg: "bg-slate-100 dark:bg-slate-800/80",
        border: "border-slate-200 dark:border-slate-700",
        dot: "bg-slate-500",
      },
    },
    surfaces: {
      light: {
        canvas: "#f8fafc",
        card: "#ffffff",
        cardMuted: "#f1f5f9",
        border: "#e2e8f0",
      },
      dark: {
        canvas: "#090d16",
        card: "#0f172a",
        cardMuted: "#1e293b",
        border: "#1e293b",
      },
    },
  },

  // Standard Interaction Durations
  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    normal: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
    spring: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
} as const;
