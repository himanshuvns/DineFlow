"use client";

import * as React from "react";
import { Utensils, Coffee, Hotel, Soup, Palmtree, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BusinessCategory {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  { id: "restaurant", label: "Restaurant", icon: Utensils },
  { id: "cafe", label: "Café", icon: Coffee },
  { id: "hotel", label: "Hotel / Rooms", icon: Hotel },
  { id: "cloud_kitchen", label: "Cloud Kitchen", icon: Soup },
  { id: "resort", label: "Resort", icon: Palmtree },
];

interface BusinessCategorySelectorProps {
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export function BusinessCategorySelector({
  value,
  onChange,
  className,
}: BusinessCategorySelectorProps) {
  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block select-none">
        Business Category
      </label>

      {/* Row 1: 3 columns (Restaurant, Café, Hotel / Rooms) */}
      <div className="grid grid-cols-3 gap-2">
        {BUSINESS_CATEGORIES.slice(0, 3).map((category) => {
          const isSelected = value === category.id;
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange(category.id)}
              className={cn(
                "group relative flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all duration-200",
                "hover:-translate-y-0.5 select-none",
                isSelected
                  ? "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500 dark:border-emerald-400/60 text-emerald-700 dark:text-[#14F1C7] font-semibold shadow-[0_0_15px_rgba(16,185,129,0.15)] dark:shadow-[0_0_18px_rgba(20,241,199,0.25)] ring-1 ring-emerald-500/30 dark:ring-emerald-400/40"
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

      {/* Row 2: 2 columns (Cloud Kitchen, Resort) */}
      <div className="grid grid-cols-2 gap-2">
        {BUSINESS_CATEGORIES.slice(3).map((category) => {
          const isSelected = value === category.id;
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange(category.id)}
              className={cn(
                "group relative flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all duration-200",
                "hover:-translate-y-0.5 select-none",
                isSelected
                  ? "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500 dark:border-emerald-400/60 text-emerald-700 dark:text-[#14F1C7] font-semibold shadow-[0_0_15px_rgba(16,185,129,0.15)] dark:shadow-[0_0_18px_rgba(20,241,199,0.25)] ring-1 ring-emerald-500/30 dark:ring-emerald-400/40"
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
