"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "outline" | "glow";
  icon?: React.ReactNode;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  compact?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  compact = false,
  className,
  children,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30",
        compact ? "p-6 sm:p-8" : "p-8 sm:p-14",
        className
      )}
    >
      {icon && (
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 blur-xl pointer-events-none" />
          <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
            {icon}
          </div>
        </div>
      )}

      <h3
        className={cn(
          "font-bold text-slate-900 dark:text-white tracking-tight",
          compact ? "text-sm sm:text-base" : "text-base sm:text-lg"
        )}
      >
        {title}
      </h3>

      {description && (
        <p
          className={cn(
            "text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm sm:max-w-md leading-relaxed",
            compact ? "text-xs" : "text-xs sm:text-sm"
          )}
        >
          {description}
        </p>
      )}

      {children && <div className="mt-4 w-full flex justify-center">{children}</div>}

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
          {secondaryAction && (
            secondaryAction.href ? (
              <Button
                variant={secondaryAction.variant || "outline"}
                size={compact ? "sm" : "md"}
                leftIcon={secondaryAction.icon}
                asChild
              >
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            ) : (
              <Button
                variant={secondaryAction.variant || "outline"}
                size={compact ? "sm" : "md"}
                leftIcon={secondaryAction.icon}
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )
          )}

          {action && (
            action.href ? (
              <Button
                variant={action.variant || "primary"}
                size={compact ? "sm" : "md"}
                leftIcon={action.icon}
                asChild
              >
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ) : (
              <Button
                variant={action.variant || "primary"}
                size={compact ? "sm" : "md"}
                leftIcon={action.icon}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )
          )}
        </div>
      )}
    </motion.div>
  );
}
