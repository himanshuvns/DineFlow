"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
  ChevronDown,
  Sparkles,
  BrainCircuit,
  Video,
  History,
  MapPin,
  Clock,
  CalendarCheck,
  DollarSign,
  Award,
} from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isRouteAllowed, isOwner, getCategoryConfig } from "@/lib/rbac/roles";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface NavSubItem {
  href: string;
  tab: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  ownerOnly?: boolean;
  children?: NavSubItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export function getNavSections(category?: string | null): NavSection[] {
  const config = getCategoryConfig(category);
  const secondSectionTitle =
    config.id === "hotel" || config.id === "resort"
      ? "Hospitality & Guest"
      : config.id === "cloud_kitchen"
      ? "Dispatch & Growth"
      : "Customer & Dining";

  return [
    {
      title: "Operations",
      items: [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/orders", label: "Live KDS & Orders", icon: ChefHat, badge: "Live" },
        { href: "/dashboard/menu", label: "Menu Management", icon: UtensilsCrossed },
        ...(config.hasTables
          ? [{ href: "/dashboard/tables", label: config.tableLabel || "Tables & QR Codes", icon: QrCode }]
          : []),
      ],
    },
    {
      title: secondSectionTitle,
      items: [
        ...(config.hasRooms
          ? [
              {
                href: "/dashboard/rooms",
                label: config.roomLabel || "Rooms & Suites",
                icon: Hotel,
                badge: config.id === "resort" ? "Resort" : "Hotel",
              },
            ]
          : []),
        { href: "/dashboard/history", label: config.historyTitle, icon: History, badge: "Log" },
        { href: "/dashboard/whatsapp", label: "WhatsApp Connect", icon: MessageSquareShare, badge: "AI" },
        { href: "/dashboard/video", label: "Video Studio", icon: Video, badge: "Remotion" },
      ],
    },
    {
      title: "Management & Growth",
      items: [
        {
          href: "/dashboard/staff",
          label: "Staff & Permissions",
          icon: Users,
          children: [
            { href: "/dashboard/staff?tab=staff", tab: "staff", label: "Staff Directory", icon: Users },
            { href: "/dashboard/staff?tab=attendance", tab: "attendance", label: "Attendance & Geofence", icon: MapPin },
            { href: "/dashboard/staff?tab=shifts", tab: "shifts", label: "Shift Scheduling", icon: Clock },
            { href: "/dashboard/staff?tab=leaves", tab: "leaves", label: "Leave Management", icon: CalendarCheck },
            { href: "/dashboard/staff?tab=payroll", tab: "payroll", label: "Payroll & Payslips", icon: DollarSign },
            { href: "/dashboard/staff?tab=holidays", tab: "holidays", label: "Holidays Calendar", icon: Award },
          ],
        },
        { href: "/dashboard/analytics", label: "Analytics & Sales", icon: BarChart3 },
        { href: "/dashboard/ai", label: "AI Studio", icon: BrainCircuit, badge: "New" },
        { href: "/pricing", label: "Subscription Plans", icon: Sparkles, badge: "SaaS", ownerOnly: true },
        { href: "/dashboard/settings", label: "Settings & Billing", icon: Settings },
      ],
    },
  ];
}

export const NAV_SECTIONS = getNavSections("restaurant");

export const NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

function NavSubItemsList({
  items,
  isParentActive,
  sidebarCollapsed,
}: {
  items: NavSubItem[];
  isParentActive: boolean;
  sidebarCollapsed: boolean;
}) {
  return (
    <React.Suspense fallback={null}>
      <NavSubItemsListInner
        items={items}
        isParentActive={isParentActive}
        sidebarCollapsed={sidebarCollapsed}
      />
    </React.Suspense>
  );
}

function NavSubItemsListInner({
  items,
  isParentActive,
  sidebarCollapsed,
}: {
  items: NavSubItem[];
  isParentActive: boolean;
  sidebarCollapsed: boolean;
}) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "staff";

  if (sidebarCollapsed) return null;

  return (
    <div className="ml-5 pl-2.5 border-l border-slate-200 dark:border-slate-800 space-y-0.5 my-1">
      {items.map((sub) => {
        const isSubActive = isParentActive && currentTab === sub.tab;
        const SubIcon = sub.icon;

        return (
          <Link
            key={sub.href}
            href={sub.href}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all group relative cursor-pointer",
              isSubActive
                ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 font-semibold border border-emerald-500/25 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
            )}
          >
            {isSubActive && (
              <span className="absolute -left-[11px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            )}
            <SubIcon
              className={cn(
                "h-3.5 w-3.5 shrink-0 transition-colors",
                isSubActive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
              )}
            />
            <span className="truncate">{sub.label}</span>
            {sub.badge && (
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                {sub.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const tenant = useAuthStore((state) => state.tenant);
  const user = useAuthStore((state) => state.user);
  const isOwnerUser = isOwner(user?.role);
  const categoryConfig = getCategoryConfig(tenant?.type);
  const navSections = React.useMemo(() => getNavSections(tenant?.type), [tenant?.type]);
  const [staffExpanded, setStaffExpanded] = React.useState(true);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col justify-between border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-gradient-to-b dark:from-[#0B0F19] dark:to-[#070A12] transition-all duration-300 z-30 sticky top-0 h-screen overflow-hidden",
        sidebarCollapsed ? "w-20" : "w-20 lg:w-64"
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
              <div className="hidden lg:flex flex-col min-w-0">
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                  {tenant?.name || "DineFlow"}
                </span>
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 truncate flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {categoryConfig.tagline}
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

        {/* Navigation grouped by section */}
        <nav className="p-3 space-y-3">
          {navSections.map((section) => {
            const visibleItems = section.items.filter((item) => isRouteAllowed(item.href, user?.role, tenant?.type));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                {!sidebarCollapsed && (
                  <div className="hidden lg:block px-3 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
                    {section.title}
                  </div>
                )}
                {sidebarCollapsed && (
                  <div className="my-1 border-t border-slate-200/50 dark:border-slate-800/50" />
                )}
                {visibleItems.map((item) => {
                  const isExactActive = pathname === item.href;
                  const hasChildren = Boolean(item.children && item.children.length > 0);
                  const isParentActive = hasChildren ? pathname.startsWith(item.href) : isExactActive;
                  const Icon = item.icon;
                  const displayLabel = item.href === "/dashboard/settings" && !isOwnerUser ? "Settings" : item.label;

                  return (
                    <div key={item.href} className="space-y-0.5">
                      <div className="flex items-center gap-1">
                        <Link
                          href={item.href}
                          className={cn(
                            "flex-1 flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group relative cursor-pointer",
                            isParentActive
                              ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 font-semibold border border-emerald-500/25 dark:border-emerald-500/30 shadow-xs"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
                          )}
                          title={sidebarCollapsed ? displayLabel : undefined}
                          onClick={() => {
                            if (hasChildren && !staffExpanded) {
                              setStaffExpanded(true);
                            }
                          }}
                        >
                          {isParentActive && (
                            <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                          )}
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-colors",
                              isParentActive
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-slate-400 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"
                            )}
                          />
                          {!sidebarCollapsed && (
                            <span className="hidden lg:inline flex-1 truncate">{displayLabel}</span>
                          )}
                          {!sidebarCollapsed && item.badge && (
                            <span
                              className={cn(
                                "hidden lg:inline-block px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase",
                                item.badge === "Live"
                                  ? "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/30 animate-pulse"
                                  : "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                        {hasChildren && !sidebarCollapsed && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setStaffExpanded((prev) => !prev);
                            }}
                            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title={staffExpanded ? "Collapse subcategories" : "Expand subcategories"}
                          >
                            <ChevronDown
                              className={cn(
                                "h-3.5 w-3.5 transition-transform duration-200",
                                staffExpanded ? "rotate-0" : "-rotate-90"
                              )}
                            />
                          </button>
                        )}
                      </div>

                      {hasChildren && staffExpanded && item.children && (
                        <NavSubItemsList
                          items={item.children}
                          isParentActive={isParentActive}
                          sidebarCollapsed={sidebarCollapsed}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Plan & Footer Badge */}
      {!sidebarCollapsed && (
        <div className="hidden lg:block p-4 border border-slate-200/80 dark:border-slate-800/60 m-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
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
