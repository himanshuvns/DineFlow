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
    <div className={cn("w-full space-y-2", className)}>
      <label className="text-[13px] font-medium text-slate-300 block">
        Business Category
      </label>

      {/* Row 1: 3 columns (Restaurant, Café, Hotel / Rooms) */}
      <div className="grid grid-cols-3 gap-2.5">
        {BUSINESS_CATEGORIES.slice(0, 3).map((category) => {
          const isSelected = value === category.id;
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange(category.id)}
              className={cn(
                "group relative flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all duration-200",
                "hover:-translate-y-0.5 select-none",
                isSelected
                  ? "bg-emerald-500/15 border-emerald-400/60 text-[#14F1C7] font-semibold shadow-[0_0_18px_rgba(20,241,199,0.25)] ring-1 ring-emerald-400/40"
                  : "bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-800/70 hover:border-slate-600 hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isSelected
                    ? "text-[#14F1C7]"
                    : "text-slate-400 group-hover:text-slate-200"
                )}
              />
              <span className="truncate">{category.label}</span>
            </button>
          );
        })}
      </div>

      {/* Row 2: 2 columns (Cloud Kitchen, Resort) */}
      <div className="grid grid-cols-2 gap-2.5">
        {BUSINESS_CATEGORIES.slice(3).map((category) => {
          const isSelected = value === category.id;
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange(category.id)}
              className={cn(
                "group relative flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all duration-200",
                "hover:-translate-y-0.5 select-none",
                isSelected
                  ? "bg-emerald-500/15 border-emerald-400/60 text-[#14F1C7] font-semibold shadow-[0_0_18px_rgba(20,241,199,0.25)] ring-1 ring-emerald-400/40"
                  : "bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-800/70 hover:border-slate-600 hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isSelected
                    ? "text-[#14F1C7]"
                    : "text-slate-400 group-hover:text-slate-200"
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
