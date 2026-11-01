"use client";

import * as React from "react";
import { Utensils, Coffee, Hotel, Soup, Palmtree, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BusinessCategory {
  id: string;
  label: string;
  tag: string;
  description: string;
  icon: LucideIcon;
}

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  { id: "restaurant", label: "Restaurant", tag: "Dine-In & QR", description: "Dining Room Tables, QR Ordering & Kitchen Displays", icon: Utensils },
  { id: "cafe", label: "Café", tag: "Counter & KDS", description: "Counter Service, Tables & Quick KDS", icon: Coffee },
  { id: "hotel", label: "Hotel", tag: "Rooms & Dining", description: "Guest Suites, Room Service & Fine Dining", icon: Hotel },
  { id: "cloud_kitchen", label: "Cloud Kitchen", tag: "Delivery Only", description: "Multi-Brand Delivery & Kitchen Display Stations", icon: Soup },
  { id: "resort", label: "Resort", tag: "Villas & Pool", description: "Villas, Cabanas, Poolside & Beach Dining", icon: Palmtree },
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
}: BusinessCategorySelectorProps) {
  const selectedCategory = React.useMemo(
    () => BUSINESS_CATEGORIES.find((c) => c.id === value) || BUSINESS_CATEGORIES[0],
    [value]
  );

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block select-none">
          Hospitality Concept
        </label>
        <span className="text-[11px] text-emerald-600 dark:text-[#14F1C7] font-medium hidden xs:inline">
          Tailors menus, floor plans & POS stations
        </span>
      </div>

      {/* 5-Column Tactile Boutique Tiles */}
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
                "group relative flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-2xl border text-center cursor-pointer transition-all duration-300 select-none",
                "hover:-translate-y-1 active:translate-y-0",
                isSelected
                  ? "bg-gradient-to-b from-emerald-500/15 via-emerald-500/5 to-transparent dark:from-emerald-500/20 dark:via-[#14F1C7]/10 dark:to-transparent border-emerald-500/80 dark:border-[#14F1C7]/80 shadow-[0_8px_20px_rgba(16,185,129,0.18)] dark:shadow-[0_8px_25px_rgba(20,241,199,0.22)] ring-1 ring-emerald-500/50"
                  : "bg-white/90 dark:bg-slate-900/70 border-slate-200/90 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850"
              )}
            >
              {/* Active beacon indicator */}
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 dark:bg-[#14F1C7] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              )}

              <div
                className={cn(
                  "p-2 rounded-xl mb-1.5 transition-all duration-200",
                  isSelected
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-[#14F1C7] shadow-inner"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 group-hover:bg-slate-200/70 dark:group-hover:bg-slate-700"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>

              <span
                className={cn(
                  "font-display font-bold text-xs tracking-tight transition-colors",
                  isSelected
                    ? "text-emerald-950 dark:text-white"
                    : "text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white"
                )}
              >
                {category.label}
              </span>

              <span
                className={cn(
                  "text-[10px] mt-0.5 font-medium transition-colors truncate max-w-full",
                  isSelected
                    ? "text-emerald-700 dark:text-[#14F1C7] font-semibold"
                    : "text-slate-400 dark:text-slate-500"
                )}
              >
                {category.tag}
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
