"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  separator?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({
  trigger,
  items,
  align = "right",
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div onClick={() => setIsOpen((prev) => !prev)}>{trigger}</div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-56 rounded-xl glass-panel border border-slate-200 dark:border-slate-700/80 p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150",
            align === "right" ? "right-0" : "left-0",
            className
          )}
        >
          {items.map((item, index) => {
            if (item.separator) {
              return <div key={index} className="my-1 border-t border-slate-200 dark:border-slate-800" />;
            }

            return (
              <button
                key={index}
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer text-left",
                  item.danger
                    ? "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {item.icon && <span className="h-4 w-4 shrink-0">{item.icon}</span>}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
