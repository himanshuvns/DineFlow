"use client";

import * as React from "react";
import { Utensils, Coffee, Hotel, Soup, Palmtree, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BusinessCategory {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  { id: "restaurant", label: "Restaurant", description: "Tables, KDS & Menu", icon: Utensils },
  { id: "cafe", label: "Café", description: "Counter, Tables & KDS", icon: Coffee },
  { id: "hotel", label: "Hotel", description: "Rooms, Suites & Dining", icon: Hotel },
  { id: "cloud_kitchen", label: "Cloud Kitchen", description: "Delivery KDS (No Tables/Rooms)", icon: Soup },
  { id: "resort", label: "Resort", description: "Villas, Cabanas & Dining", icon: Palmtree },
];

interface BusinessCategorySelectorProps {
  value: string;
  onChange: (id: string) => void;
  className?: string;
  detailed?: boolean;
}

export function BusinessCategorySelector({
  value,
  onChange,
  className,
  detailed = false,
}: BusinessCategorySelectorProps) {
  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block select-none">
          Hospitality Vertical / Category
        </label>
        {detailed && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Adapts dashboard menus and navigation
          </span>
        )}
      </div>

      {/* Responsive columns grid */}
      <div className={cn(
        "grid gap-2",
        detailed
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-3 sm:grid-cols-5 gap-1.5"
      )}>
        {BUSINESS_CATEGORIES.map((category) => {
          const isSelected = value === category.id;
          const Icon = category.icon;

          if (detailed) {
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onChange(category.id)}
                className={cn(
                  "p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex items-start gap-3 group relative select-none",
                  isSelected
                    ? "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500 dark:border-emerald-400/60 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                    : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-xl border shrink-0 transition-colors",
                    isSelected
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-[#14F1C7] border-emerald-500/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-xs font-bold truncate",
                        isSelected ? "text-emerald-700 dark:text-emerald-300" : "text-slate-900 dark:text-white"
                      )}
                    >
                      {category.label}
                    </span>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {category.description}
                  </p>
                </div>
              </button>
            );
          }

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange(category.id)}
              title={`${category.label} — ${category.description}`}
              className={cn(
                "group relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-xl border text-[11px] sm:text-xs font-medium cursor-pointer transition-all duration-200 min-h-[42px]",
                "hover:-translate-y-0.5 select-none",
                isSelected
                  ? "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500 dark:border-emerald-400/60 text-emerald-700 dark:text-[#14F1C7] font-semibold shadow-[0_0_12px_rgba(16,185,129,0.15)] dark:shadow-[0_0_15px_rgba(20,241,199,0.22)] ring-1 ring-emerald-500/30 dark:ring-emerald-400/40"
                  : "bg-slate-100/90 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800/70 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-colors",
                  isSelected
                    ? "text-emerald-600 dark:text-[#14F1C7]"
                    : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                )}
              />
              <span className="truncate">{category.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
