"use client";

import * as React from "react";
import { Check, X, Circle, ShieldCheck } from "lucide-react";
import { PasswordValidationResult } from "@/lib/validation";
import { cn } from "@/lib/utils";

export interface PasswordStrengthMeterProps {
  validation: PasswordValidationResult;
  hasTyped: boolean;
  className?: string;
}

export function PasswordStrengthMeter({
  validation,
  hasTyped,
  className,
}: PasswordStrengthMeterProps) {
  const { criteria, level, label } = validation;

  // Segment bar colors based on strength level
  const getSegmentColor = (segmentIndex: number) => {
    if (!hasTyped || level === "empty") {
      return "bg-slate-200 dark:bg-slate-800";
    }

    if (level === "weak") {
      return segmentIndex === 0
        ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
        : "bg-slate-200 dark:bg-slate-800";
    }

    if (level === "medium") {
      return segmentIndex <= 1
        ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
        : "bg-slate-200 dark:bg-slate-800";
    }

    if (level === "strong") {
      return segmentIndex <= 2
        ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
        : "bg-slate-200 dark:bg-slate-800";
    }

    if (level === "very-strong") {
      return "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_10px_rgba(20,241,199,0.4)]";
    }

    return "bg-slate-200 dark:bg-slate-800";
  };

  const getLabelColor = () => {
    if (!hasTyped || level === "empty") return "text-slate-400 dark:text-slate-500";
    if (level === "weak") return "text-rose-500 dark:text-rose-400 font-semibold";
    if (level === "medium") return "text-amber-500 dark:text-amber-400 font-semibold";
    if (level === "strong") return "text-emerald-600 dark:text-emerald-400 font-bold";
    if (level === "very-strong") return "text-cyan-600 dark:text-[#14F1C7] font-bold";
    return "text-slate-400";
  };

  const checklistItems = [
    { key: "minLength", label: "At least 8 characters", met: criteria.minLength },
    { key: "hasUpper", label: "At least one uppercase letter (A-Z)", met: criteria.hasUpper },
    { key: "hasLower", label: "At least one lowercase letter (a-z)", met: criteria.hasLower },
    { key: "hasNumber", label: "At least one number (0-9)", met: criteria.hasNumber },
    { key: "hasSpecial", label: "At least one special character (!@#$...)", met: criteria.hasSpecial },
  ];

  return (
    <div
      className={cn("w-full space-y-2 pt-1 transition-all duration-200", className)}
      role="status"
      aria-live="polite"
    >
      {/* 4-Segment Strength Indicator */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium select-none">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
            Password Strength
          </span>
          <span className={cn("transition-colors duration-200", getLabelColor())}>
            {hasTyped && label ? label : "Enter password"}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={cn(
                "h-full rounded-full transition-all duration-300",
                getSegmentColor(idx)
              )}
            />
          ))}
        </div>
      </div>

      {/* 5-Criteria Live Checklist */}
      <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 space-y-1 text-[11px]">
        {checklistItems.map((item) => {
          let icon = <Circle className="h-3 w-3 text-slate-300 dark:text-slate-600 fill-slate-300/30" />;
          let textColor = "text-slate-500 dark:text-slate-400";

          if (hasTyped) {
            if (item.met) {
              icon = <Check className="h-3.5 w-3.5 text-emerald-500 dark:text-[#14F1C7] stroke-[3]" />;
              textColor = "text-emerald-700 dark:text-emerald-300 font-medium";
            } else {
              icon = <X className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400 stroke-[2.5]" />;
              textColor = "text-rose-600 dark:text-rose-400";
            }
          }

          return (
            <div
              key={item.key}
              className="flex items-center gap-1.5 transition-colors duration-150"
            >
              <span className="shrink-0 flex items-center justify-center">{icon}</span>
              <span className={cn("truncate select-none leading-none", textColor)}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
