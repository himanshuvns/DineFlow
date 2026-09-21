"use client";

import * as React from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "segmented";
}

export function ThemeToggle({ className, variant = "icon" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "w-9 h-9 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 animate-pulse",
          className
        )}
      />
    );
  }

  if (variant === "segmented") {
    return (
      <div
        className={cn(
          "inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800",
          className
        )}
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
            theme === "light"
              ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          )}
        >
          <Sun className="h-3.5 w-3.5 text-amber-500" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
            theme === "dark"
              ? "bg-slate-800 text-white shadow-sm border border-slate-700"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          )}
        >
          <Moon className="h-3.5 w-3.5 text-indigo-400" />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("system")}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
            theme === "system"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-700"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          )}
        >
          <Laptop className="h-3.5 w-3.5 text-slate-400" />
          <span>System</span>
        </button>
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "relative p-2 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-center min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]",
        "bg-white/80 hover:bg-slate-100 text-slate-700 border-slate-200/80 shadow-sm",
        "dark:bg-slate-900/80 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-800 dark:shadow-none",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500/30",
        className
      )}
      title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
      aria-label="Toggle theme"
    >
      <div className="relative h-4 w-4">
        <Sun
          className={cn(
            "h-4 w-4 text-amber-500 transition-all duration-300 transform absolute inset-0",
            isDark ? "opacity-0 rotate-90 scale-50 pointer-events-none" : "opacity-100 rotate-0 scale-100"
          )}
        />
        <Moon
          className={cn(
            "h-4 w-4 text-indigo-400 transition-all duration-300 transform absolute inset-0",
            isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50 pointer-events-none"
          )}
        />
      </div>
    </button>
  );
}
