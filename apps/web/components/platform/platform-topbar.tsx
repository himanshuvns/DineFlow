"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  ShieldAlert,
  Bell,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Building2,
  Menu,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuthStore } from "@/lib/stores/auth-store";
import { usePlatformStore } from "@/lib/stores/platform-store";
import { getRoleLabel, getRoleBadgeClass } from "@/lib/rbac/roles";

const PLATFORM_TITLES: Record<string, string> = {
  "/platform": "Platform Executive Dashboard",
  "/platform/dashboard": "Platform Executive Dashboard",
  "/platform/clients": "Clients & Workspaces Directory",
  "/platform/security": "Enterprise Security Center & Zero Trust",
  "/platform/subscriptions": "Subscription Tiers & Quotas",
  "/platform/revenue": "Revenue, ARR & Billing Health",
  "/platform/feature-flags": "Enterprise Feature Flag Engine",
  "/platform/support": "Customer Support Desk",
  "/platform/analytics": "Cross-Tenant Platform Analytics",
  "/platform/audit-logs": "Immutable Audit Ledger",
  "/platform/system-health": "Infrastructure & Telemetry Health",
  "/platform/operations": "Platform Operations & Announcements",
};

export interface PlatformTopbarProps {
  onMenuClick?: () => void;
}

export function PlatformTopbar({ onMenuClick }: PlatformTopbarProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const {
    clients,
    notifications,
    unreadNotificationsCount,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = usePlatformStore();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const pageTitle = React.useMemo(() => {
    if (PLATFORM_TITLES[pathname]) return PLATFORM_TITLES[pathname];
    if (pathname.startsWith("/platform/clients/")) return "Client 360 Profile";
    return "Platform Console";
  }, [pathname]);

  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.ownerName.toLowerCase().includes(q) ||
        c.ownerEmail.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery, clients]);

  return (
    <header className="h-16 px-4 sm:px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#070B14]/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between gap-4">
      {/* Page Title & Breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            aria-label="Open navigation drawer"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
          Platform
        </span>
        <ChevronRight className="h-3 w-3 text-slate-400 hidden sm:inline" />
        <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
          {pageTitle}
        </h1>
        <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Production
        </span>
      </div>

      {/* Center Global Search */}
      <div className="relative flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients across platform (name, owner, city)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-500 transition-all shadow-xs"
          />
        </div>

        {/* Instant Search Dropdown */}
        {searchOpen && searchResults.length > 0 && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setSearchOpen(false)}
            />
            <div className="absolute left-0 right-0 top-11 z-50 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                Matching Workspaces
              </div>
              {searchResults.map((client) => (
                <button
                  key={client.id}
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                    router.push(`/platform/clients/${client.id}`);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                      <Building2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {client.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {client.ownerName} • {client.city}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {client.plan}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        <ThemeToggle />

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            title="Platform Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </button>

          {notificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="absolute right-0 top-11 z-50 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 space-y-2">
                <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Notifications
                    </span>
                    {unreadNotificationsCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        {unreadNotificationsCount} new
                      </span>
                    )}
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={() => markAllNotificationsRead()}
                      className="text-[11px] font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (!notif.read) markNotificationRead(notif.id);
                          if (notif.target) router.push(notif.target);
                          setNotificationsOpen(false);
                        }}
                        className={`p-2.5 rounded-xl cursor-pointer transition-colors text-xs ${
                          notif.read
                            ? "bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 opacity-70"
                            : "bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {notif.title}
                          </span>
                          {!notif.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <Link
          href="/dashboard"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold transition-colors"
          title="Switch to Restaurant Dashboard"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Client App</span>
        </Link>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            SA
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {user?.name || "Super Admin"}
            </span>
            <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 uppercase font-semibold">
              {getRoleLabel(user?.role || "super_admin")}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
