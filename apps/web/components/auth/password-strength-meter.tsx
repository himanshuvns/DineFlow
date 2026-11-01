"use client";

import * as React from "react";
import { Check, ShieldCheck } from "lucide-react";
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
  const { criteria, level } = validation;

  // Segment bar colors based on strength level
  const getSegmentColor = (segmentIndex: number) => {
    if (!hasTyped || level === "empty") {
      return "bg-slate-200 dark:bg-slate-800";
    }

    if (level === "weak") {
      return segmentIndex === 0
        ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
        : "bg-slate-200 dark:bg-slate-800";
    }

    if (level === "medium") {
      return segmentIndex <= 1
        ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
        : "bg-slate-200 dark:bg-slate-800";
    }

    if (level === "strong") {
      return segmentIndex <= 2
        ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
        : "bg-slate-200 dark:bg-slate-800";
    }

    if (level === "very-strong") {
      return "bg-gradient-to-r from-emerald-500 to-[#14F1C7] shadow-[0_0_10px_rgba(20,241,199,0.5)]";
    }

    return "bg-slate-200 dark:bg-slate-800";
  };

  const getLabelInfo = () => {
    if (!hasTyped || level === "empty") {
      return { text: "Security Level", color: "text-slate-400 dark:text-slate-500" };
    }
    if (level === "weak") {
      return { text: "Basic (Needs more criteria)", color: "text-rose-500 dark:text-rose-400 font-semibold" };
    }
    if (level === "medium") {
      return { text: "Fair (Add symbol or number)", color: "text-amber-500 dark:text-amber-400 font-semibold" };
    }
    if (level === "strong") {
      return { text: "Strong Password", color: "text-emerald-600 dark:text-emerald-400 font-bold" };
    }
    return { text: "Enterprise Grade", color: "text-teal-600 dark:text-[#14F1C7] font-bold" };
  };

  const chips = [
    { key: "minLength", label: "8+ chars", met: criteria.minLength },
    { key: "hasUpper", label: "Uppercase", met: criteria.hasUpper },
    { key: "hasNumber", label: "Number", met: criteria.hasNumber },
    { key: "hasSpecial", label: "Special (!@#)", met: criteria.hasSpecial },
  ];

  const labelInfo = getLabelInfo();

  return (
    <div
      className={cn("w-full space-y-1.5 pt-0.5 select-none transition-all duration-200", className)}
      role="status"
      aria-live="polite"
    >
      {/* 4-Segment Animated Neon Bar with Live Status */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            <span>Password Security</span>
          </span>
          <span className={cn("transition-colors duration-200 text-[11px]", labelInfo.color)}>
            {labelInfo.text}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 h-1 w-full">
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

      {/* Horizontal Micro-Chips (Zero Empty Space) */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        {chips.map((chip) => {
          const isMet = hasTyped && chip.met;
          return (
            <div
              key={chip.key}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] border transition-all duration-200",
                isMet
                  ? "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-[#14F1C7] font-medium shadow-sm shadow-emerald-500/5"
                  : "bg-slate-100/70 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-800/70 text-slate-400 dark:text-slate-500"
              )}
            >
              {isMet ? (
                <Check className="h-3 w-3 stroke-[3] text-emerald-600 dark:text-[#14F1C7]" />
              ) : (
                <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              )}
              <span>{chip.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
