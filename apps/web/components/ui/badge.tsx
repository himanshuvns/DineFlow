import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "purple" | "glow";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "neutral",
  size = "md",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-semibold",
    glow: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 shadow-xs dark:shadow-emerald-500/20 font-semibold",
    warning: "bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-500/30 font-semibold",
    danger: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 font-semibold",
    info: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30 font-semibold",
    neutral: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700",
    purple: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 font-semibold",
  };

  const dotColors = {
    success: "bg-emerald-600 dark:bg-emerald-400 animate-pulse",
    glow: "bg-emerald-600 dark:bg-emerald-400 animate-pulse",
    warning: "bg-amber-500 dark:bg-amber-400",
    danger: "bg-rose-500 dark:bg-rose-400",
    info: "bg-cyan-500 dark:bg-cyan-400",
    neutral: "bg-slate-500 dark:bg-slate-400",
    purple: "bg-indigo-500 dark:bg-indigo-400",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant])} />}
      {children}
    </div>
  );
}
