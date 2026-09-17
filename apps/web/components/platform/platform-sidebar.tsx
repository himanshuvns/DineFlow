"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Sparkles,
  DollarSign,
  Flag,
  LifeBuoy,
  BarChart3,
  ShieldAlert,
  Activity,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlatformStore } from "@/lib/stores/platform-store";

export const PLATFORM_NAV_ITEMS = [
  { href: "/platform/dashboard", label: "Executive Overview", icon: LayoutDashboard },
  { href: "/platform/clients", label: "Clients & Workspaces", icon: Building2, badge: "Tenants" },
  { href: "/platform/subscriptions", label: "Subscription Tiers", icon: Sparkles },
  { href: "/platform/revenue", label: "Revenue & ARR", icon: DollarSign },
  { href: "/platform/feature-flags", label: "Feature Flags", icon: Flag, badge: "Rules" },
  { href: "/platform/support", label: "Support Desk", icon: LifeBuoy },
  { href: "/platform/analytics", label: "Platform Analytics", icon: BarChart3 },
  { href: "/platform/audit-logs", label: "Audit Ledger", icon: ShieldAlert, badge: "Immutable" },
  { href: "/platform/system-health", label: "System Health", icon: Activity },
  { href: "/platform/operations", label: "Platform Operations", icon: Sliders },
];

export function PlatformSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const clients = usePlatformStore((s) => s.clients);

  const activeClientsCount = clients.filter((c) => c.status === "active").length;

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col justify-between border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070B14] transition-all duration-300 z-30 sticky top-0 h-screen overflow-hidden",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col min-h-0">
        {/* Platform Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200/80 dark:border-slate-800/60 shrink-0">
          <Link href="/platform/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center p-1 shrink-0 shadow-md text-white font-black text-sm">
              DF
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-sm text-slate-900 dark:text-white tracking-tight truncate">
                    Platform Admin
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    Console
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  Software Owner Portal
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Live Network Health Pill */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-1">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                  All Systems Operational
                </span>
              </div>
              <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {activeClientsCount} Live
              </span>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {PLATFORM_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/platform/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group",
                  isActive
                    ? "bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 font-bold border border-rose-500/25 dark:border-rose-500/30 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
                )}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110",
                      isActive
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-slate-500 dark:text-slate-400"
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!collapsed && item.badge && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 tracking-wider",
                      item.badge === "Immutable"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Switcher back to Client Dashboard */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/60 shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center justify-between p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all group"
          title="Open Client Dashboard"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white" />
            {!collapsed && <span className="truncate">Client Dashboard</span>}
          </div>
          {!collapsed && <span className="text-[10px] text-slate-400 font-mono">↗</span>}
        </Link>
      </div>
    </aside>
  );
}
