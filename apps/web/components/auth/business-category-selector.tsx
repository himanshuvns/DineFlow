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
  { id: "restaurant", label: "Restaurant", description: "Dining Room Tables, QR Ordering & Kitchen Displays", icon: Utensils },
  { id: "cafe", label: "Café", description: "Counter Service, Tables & Quick KDS", icon: Coffee },
  { id: "hotel", label: "Hotel", description: "Guest Suites, Room Service & Fine Dining", icon: Hotel },
  { id: "cloud_kitchen", label: "Cloud Kitchen", description: "Multi-Brand Delivery & Kitchen Display Stations", icon: Soup },
  { id: "resort", label: "Resort", description: "Villas, Cabanas, Poolside & Beach Dining", icon: Palmtree },
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
  const selectedCategory = React.useMemo(
    () => BUSINESS_CATEGORIES.find((c) => c.id === value) || BUSINESS_CATEGORIES[0],
    [value]
  );

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block select-none">
          Hospitality Vertical / Category
        </label>
        <span className="text-[11px] text-emerald-600 dark:text-[#14F1C7] font-medium hidden xs:inline">
          Adapts POS, menus & operational floor plans
        </span>
      </div>

      {/* 5-Column Responsive Category Cards (Zero Truncation) */}
      <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-2.5">
        {BUSINESS_CATEGORIES.map((category) => {
          const isSelected = value === category.id;
          const Icon = category.icon;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange(category.id)}
              className={cn(
                "group relative flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2.5 rounded-2xl border text-xs font-medium cursor-pointer transition-all duration-200 select-none",
                "hover:-translate-y-0.5 active:translate-y-0",
                isSelected
                  ? "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500 dark:border-emerald-400 text-emerald-800 dark:text-[#14F1C7] font-semibold shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-500/40"
                  : "bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-xl shrink-0 transition-colors",
                  isSelected
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-[#14F1C7]"
                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="whitespace-nowrap font-medium text-[12.5px]">
                {category.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Vertical Context Helper */}
      <div className="px-1 text-[11px] text-slate-500 dark:text-[#94A3B8] flex items-center gap-1.5">
        <span className="font-semibold text-emerald-700 dark:text-[#14F1C7]">
          {selectedCategory.label}:
        </span>
        <span>{selectedCategory.description}</span>
      </div>
    </div>
  );
}
