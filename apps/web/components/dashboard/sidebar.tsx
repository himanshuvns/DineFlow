"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ChefHat,
  QrCode,
  Hotel,
  MessageSquareShare,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BrainCircuit,
} from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Live KDS & Orders", icon: ChefHat, badge: "Live" },
  { href: "/dashboard/menu", label: "Menu Management", icon: UtensilsCrossed },
  { href: "/dashboard/tables", label: "Tables & QR Codes", icon: QrCode },
  { href: "/dashboard/rooms", label: "Rooms & Suites", icon: Hotel, badge: "Hotel" },
  { href: "/dashboard/whatsapp", label: "WhatsApp Connect", icon: MessageSquareShare, badge: "AI" },
  { href: "/dashboard/staff", label: "Staff & Permissions", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics & Sales", icon: BarChart3 },
  { href: "/dashboard/ai", label: "AI Studio", icon: BrainCircuit, badge: "New" },
  { href: "/pricing", label: "Subscription Plans", icon: Sparkles, badge: "SaaS" },
  { href: "/dashboard/settings", label: "Settings & Billing", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const tenant = useAuthStore((state) => state.tenant);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col justify-between border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-gradient-to-b dark:from-[#0B0F19] dark:to-[#070A12] transition-all duration-300 z-30 sticky top-0 h-screen overflow-hidden",
        sidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col min-h-0">
        {/* Logo & Workspace Title */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200/80 dark:border-slate-800/60 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            {tenant?.logoUrl || tenant?.logo ? (
              <div className="h-9 w-9 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0F1D] flex items-center justify-center p-1 shrink-0 shadow-sm">
                <img
                  src={tenant.logoUrl || tenant.logo}
                  alt={tenant.name || "Client Logo"}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center shrink-0">
                <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <UtensilsCrossed className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
            )}
            {!sidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                  {tenant?.name || "DineFlow"}
                </span>
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 truncate flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {tenant?.type
                    ? `${tenant.type.charAt(0).toUpperCase() + tenant.type.slice(1).replace("_", " ")} OS`
                    : "Restaurant OS"}
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group relative cursor-pointer",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 font-semibold border border-emerald-500/25 dark:border-emerald-500/30 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                )}
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"
                  )}
                />
                {!sidebarCollapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
                {!sidebarCollapsed && item.badge && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase",
                      item.badge === "Live"
                        ? "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/30 animate-pulse"
                        : "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30"
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

      {/* Plan & Footer Badge */}
      {!sidebarCollapsed && (
        <div className="p-4 border border-slate-200/80 dark:border-slate-800/60 m-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white capitalize">
                {tenant?.plan || "Growth"} Plan
              </span>
            </div>
            <Badge variant="success" size="sm">Active</Badge>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            Unlimited QR scans & 3 KDS display screens active.
          </p>
        </div>
      )}
    </aside>
  );
}
