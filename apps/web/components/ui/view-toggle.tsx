"use client";

import * as React from "react";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list";

export interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  className?: string;
  ariaLabel?: string;
  size?: "sm" | "md";
}

/**
 * Custom hook to manage persistent view mode preference per module.
 * Defaults to "grid" and hydrates seamlessly from localStorage.
 */
export function useViewMode(storageKey: string, defaultMode: ViewMode = "grid") {
  const [view, setViewState] = React.useState<ViewMode>(defaultMode);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`dineflow_view_${storageKey}`) as ViewMode | null;
        if (saved === "grid" || saved === "list") {
          setViewState(saved);
        }
      } catch {
        // Fallback gracefully if localStorage is restricted
      }
      setIsLoaded(true);
    }
  }, [storageKey]);

  const setView = React.useCallback(
    (nextView: ViewMode) => {
      setViewState(nextView);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`dineflow_view_${storageKey}`, nextView);
        } catch {}
      }
    },
    [storageKey]
  );

  return [view, setView, isLoaded] as const;
}

/**
 * Reusable segmented View Toggle component (Linear / Notion inspired).
 * Features smooth 200ms transitions, tactile active states, and full WCAG keyboard accessibility.
 */
export function ViewToggle({
  view,
  onViewChange,
  className,
  ariaLabel = "View mode selection",
  size = "md",
}: ViewToggleProps) {
  const isSm = size === "sm";

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-2xs select-none transition-colors",
        className
      )}
    >
      {/* Grid View Option */}
      <button
        type="button"
        role="radio"
        aria-checked={view === "grid"}
        tabIndex={0}
        onClick={() => onViewChange("grid")}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-200 ease-out cursor-pointer active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500/40",
          isSm ? "h-7 px-2 text-xs" : "h-8 px-2.5 text-xs",
          view === "grid"
            ? "bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700 font-semibold"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent"
        )}
        title="Switch to Grid View"
      >
        <LayoutGrid className={cn(isSm ? "h-3.5 w-3.5" : "h-4 w-4", view === "grid" ? "text-emerald-600 dark:text-emerald-400" : "text-current")} />
        <span className="hidden sm:inline">Grid</span>
      </button>

      {/* List View Option */}
      <button
        type="button"
        role="radio"
        aria-checked={view === "list"}
        tabIndex={0}
        onClick={() => onViewChange("list")}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-200 ease-out cursor-pointer active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500/40",
          isSm ? "h-7 px-2 text-xs" : "h-8 px-2.5 text-xs",
          view === "list"
            ? "bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700 font-semibold"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent"
        )}
        title="Switch to List View"
      >
        <List className={cn(isSm ? "h-3.5 w-3.5" : "h-4 w-4", view === "list" ? "text-emerald-600 dark:text-emerald-400" : "text-current")} />
        <span className="hidden sm:inline">List</span>
      </button>
    </div>
  );
}
