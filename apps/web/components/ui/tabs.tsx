"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabOption {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabOption[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer",
              isActive
                ? "bg-slate-800 text-white shadow-md border border-slate-700/60 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                  isActive
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-400"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
