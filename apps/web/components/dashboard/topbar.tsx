"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  LogOut,
  User as UserIcon,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Avatar } from "@/components/ui/avatar";
import { Dropdown } from "@/components/ui/dropdown";
import { useToast } from "@/components/ui/toast";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationCenter } from "@/components/notifications/notification-center";

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
  "/admin": "Platform Admin",
};

export function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { setMobileMenuOpen } = useUIStore();
  const { user, tenant, clearAuth } = useAuthStore();
  const { addToast } = useToast();
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  const [searchValue, setSearchValue] = React.useState("");

  // Determine current page title
  const currentTitle = React.useMemo(() => {
    if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
    if (pathname.startsWith("/dashboard/rooms/")) return "Room Details & Guests";
    if (pathname.startsWith("/dashboard/ai/")) return "AI Co-Pilot Studio";
    return "Workspace Overview";
  }, [pathname]);

  // Global Cmd+K / Ctrl+K shortcut listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchValue.trim().toLowerCase();
    if (!query) return;

    if (query.includes("order") || query.includes("kds") || query.includes("kitchen") || query.includes("ticket")) {
      router.push("/dashboard/orders");
    } else if (query.includes("menu") || query.includes("dish") || query.includes("food") || query.includes("item")) {
      router.push("/dashboard/menu");
    } else if (query.includes("table") || query.includes("qr") || query.includes("seat")) {
      router.push("/dashboard/tables");
    } else if (query.includes("room") || query.includes("suite") || query.includes("hotel") || query.includes("stay") || query.includes("guest")) {
      router.push("/dashboard/rooms");
    } else if (query.includes("staff") || query.includes("employee") || query.includes("permission") || query.includes("team")) {
      router.push("/dashboard/staff");
    } else if (query.includes("analytics") || query.includes("sale") || query.includes("revenue") || query.includes("report")) {
      router.push("/dashboard/analytics");
    } else if (query.includes("ai") || query.includes("forecast") || query.includes("upsell") || query.includes("writer")) {
      router.push("/dashboard/ai");
    } else if (query.includes("whatsapp") || query.includes("bot") || query.includes("chat")) {
      router.push("/dashboard/whatsapp");
    } else if (query.includes("setting") || query.includes("bill") || query.includes("invoice") || query.includes("profile")) {
      router.push("/dashboard/settings");
    } else {
      router.push(`/dashboard/menu?search=${encodeURIComponent(query)}`);
    }
    setSearchValue("");
  };

  const handleSignOut = () => {
    clearAuth();
    addToast("info", "Signed out", "You have been securely signed out.");
    router.push("/login");
  };

  const userDisplayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
    : "Restaurant Owner";

  return (
    <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#090D16]/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8 transition-colors duration-200">
      {/* Left: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 mr-2">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          aria-label="Open navigation drawer"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 text-xs min-w-0">
          {(tenant?.logoUrl || tenant?.logo) && (
            <div className="h-6 w-6 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0F1D] flex items-center justify-center p-0.5 shrink-0 shadow-xs md:hidden">
              <img
                src={tenant.logoUrl || tenant.logo}
                alt={tenant?.name || "Logo"}
                className="h-full w-full object-contain"
              />
            </div>
          )}
          <span className="text-slate-800 dark:text-slate-300 font-bold truncate max-w-[120px] sm:max-w-[200px]">
            {tenant?.name || "Your Restaurant"}
          </span>
          <span className="text-slate-400 dark:text-slate-600 hidden sm:inline">/</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold hidden sm:inline truncate">
            {currentTitle}
          </span>
        </div>
      </div>

      {/* Middle: Quick Search */}
      <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center w-72">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search orders, rooms, menu... (⌘K)"
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all"
          />
        </div>
      </form>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Live KDS status indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span>KDS Connected</span>
        </div>

        {/* Theme Toggle (Light / Dark Mode Switcher) */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationCenter />

        {/* User profile dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer">
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
                  {user?.role || "Owner"}
                </span>
              </div>
            </button>
          }
          items={[
            {
              label: "Restaurant Profile",
              icon: <UserIcon className="h-3.5 w-3.5 text-slate-400" />,
              onClick: () => router.push("/dashboard/settings"),
            },
            {
              label: "Subscription & Invoices",
              icon: <Sparkles className="h-3.5 w-3.5 text-amber-400" />,
              onClick: () => router.push("/dashboard/settings?tab=billing"),
            },
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
          ]}
        />
      </div>
    </header>
  );
}
