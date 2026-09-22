"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  LogOut,
  User as UserIcon,
  HelpCircle,
  Sparkles,
  Search,
} from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { getRoleLabel, isOwner, isManager } from "@/lib/rbac/roles";
import { Avatar } from "@/components/ui/avatar";
import { Dropdown } from "@/components/ui/dropdown";
import { useToast } from "@/components/ui/toast";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { GlobalSearch } from "./global-search";

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "Workspace Overview",
  "/dashboard/orders": "Live KDS & Orders",
  "/dashboard/menu": "Menu Management",
  "/dashboard/tables": "Tables & QR Codes",
  "/dashboard/rooms": "Rooms & Suites (PMS)",
  "/dashboard/whatsapp": "WhatsApp Connect",
  "/dashboard/staff": "Staff & Permissions",
  "/dashboard/analytics": "Analytics & Sales",
  "/dashboard/ai": "AI Studio",
  "/dashboard/ai/menu-writer": "AI Menu Writer",
  "/dashboard/ai/upsell": "Upsell Engine",
  "/dashboard/ai/forecast": "Demand Forecast",
  "/dashboard/ai/pricing": "Smart Pricing Alerts",
  "/dashboard/notifications": "Notification Center",
  "/dashboard/settings": "Settings & Billing",
  "/pricing": "Subscription Plans",
};

export function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { setMobileMenuOpen, setSearchOpen } = useUIStore();
  const { user, tenant, clearAuth } = useAuthStore();
  const { addToast } = useToast();

  const isOwnerUser = isOwner(user?.role);
  const isManagerUser = isManager(user?.role);
  const canAccessSettings = isOwnerUser || isManagerUser;

  // Determine current page title
  const currentTitle = React.useMemo(() => {
    if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
    if (pathname.startsWith("/dashboard/rooms/")) return "Room Details & Guests";
    if (pathname.startsWith("/dashboard/ai/")) return "AI Co-Pilot Studio";
    return "Workspace Overview";
  }, [pathname]);

  const handleSignOut = () => {
    if (typeof window !== "undefined" && user?.id) {
      try {
        localStorage.setItem(`dineflow_has_logged_in_${user.id}`, "true");
      } catch {}
    }
    clearAuth();
    addToast("info", "Signed out", "You have been securely signed out.");
    router.push("/login");
  };

  const userDisplayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || getRoleLabel(user.role)
    : "Staff";

  const dropdownItems = [
    ...(canAccessSettings
      ? [
          {
            label: "Restaurant Profile",
            icon: <UserIcon className="h-3.5 w-3.5 text-slate-400" />,
            onClick: () => router.push("/dashboard/settings"),
          },
        ]
      : []),
    ...(isOwnerUser
      ? [
          {
            label: "Subscription & Invoices",
            icon: <Sparkles className="h-3.5 w-3.5 text-amber-400" />,
            onClick: () => router.push("/dashboard/settings?tab=billing"),
          },
        ]
      : []),
    {
      label: "Documentation & Support",
      icon: <HelpCircle className="h-3.5 w-3.5 text-slate-400" />,
      onClick: () => window.open("https://docs.dineflow.app", "_blank"),
    },
    { separator: true, label: "" },
    {
      label: "Sign Out",
      icon: <LogOut className="h-3.5 w-3.5" />,
      danger: true,
      onClick: handleSignOut,
    },
  ];

  return (
    <header className="h-14 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#090D16]/95 backdrop-blur-md sticky top-0 z-40 flex items-center px-3 sm:px-5 gap-3 transition-colors duration-200">

      {/* Left: Mobile menu trigger + Breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0 flex-1 md:flex-initial">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 -ml-1 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
          aria-label="Open navigation drawer"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-1.5 text-xs min-w-0">
          {(tenant?.logoUrl || tenant?.logo) && (
            <div className="hidden md:flex h-6 w-6 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0F1D] items-center justify-center p-0.5 shrink-0 shadow-xs">
              <img
                src={tenant.logoUrl || tenant.logo}
                alt={tenant?.name || "Logo"}
                className="h-full w-full object-contain"
              />
            </div>
          )}
          <span className="hidden md:inline text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[100px] sm:max-w-[140px]">
            {tenant?.name || "Your Restaurant"}
          </span>
          <span className="hidden md:inline text-slate-300 dark:text-slate-600">/</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold truncate text-sm sm:text-base md:text-xs">
            {currentTitle}
          </span>
        </div>
      </div>

      {/* Center: Global Search — takes all remaining space and is truly centered */}
      <div className="flex-1 hidden md:flex justify-center px-2 sm:px-4">
        <div className="w-full max-w-[180px] lg:max-w-sm xl:max-w-md">
          <GlobalSearch />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Mobile Search Button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          aria-label="Open global search"
          title="Search (⌘K)"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Live KDS status - visible at xl+ so 1024px has plenty of space */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold whitespace-nowrap">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          KDS Connected
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationCenter />

        {/* User profile dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer min-h-[44px]">
              <Avatar
                fallback={userDisplayName}
                src={user?.avatarUrl}
                size="sm"
                status="online"
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                  {userDisplayName}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                  {getRoleLabel(user?.role)}
                </span>
              </div>
            </button>
          }
          items={dropdownItems}
        />
      </div>
    </header>
  );
}
