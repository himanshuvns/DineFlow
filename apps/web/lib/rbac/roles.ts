/**
 * DineFlow Centralized Role-Based Access Control (RBAC) System
 *
 * Clearly segregates:
 * 1. Platform Roles (Software Owner / Platform Super Admin Console)
 * 2. Tenant Roles (Hospitality Client Workspaces)
 */

import {
  isRouteAllowedForCategory,
  hasRooms,
  hasTables,
  getCategoryConfig,
  normalizeCategory,
  type BusinessCategory,
  type CategoryConfig,
} from "./category-features";

export {
  isRouteAllowedForCategory,
  hasRooms,
  hasTables,
  getCategoryConfig,
  normalizeCategory,
  type BusinessCategory,
  type CategoryConfig,
};

export type PlatformRole =
  | "super_admin"
  | "platform_admin"
  | "finance_admin"
  | "support_agent";

export type TenantRole =
  | "owner"
  | "manager"
  | "cashier"
  | "chef"
  | "waiter"
  | "housekeeping"
  | "staff";

export type UserRole = PlatformRole | TenantRole | string;

export const PLATFORM_ROLES: PlatformRole[] = [
  "super_admin",
  "platform_admin",
  "finance_admin",
  "support_agent",
];

export const TENANT_ROLES: TenantRole[] = [
  "owner",
  "manager",
  "cashier",
  "chef",
  "waiter",
  "housekeeping",
  "staff",
];

/**
 * Checks if a given role is an elevated Platform-level role.
 */
export function isPlatformRole(role?: string | null): boolean {
  if (!role) return false;
  return PLATFORM_ROLES.includes(role as PlatformRole);
}

/**
 * Checks if a user has Business Owner privileges.
 */
export function isOwner(role?: string | null): boolean {
  return role === "owner" || isPlatformAdmin(role);
}

/**
 * Checks if a user has General Manager privileges.
 */
export function isManager(role?: string | null): boolean {
  return role === "manager";
}

/**
 * Checks if a user can invite, manage, or delete Managers.
 * Only Owners (or platform admins) can manage Managers.
 */
export function canManageManagers(role?: string | null): boolean {
  return isOwner(role);
}

/**
 * Checks if a user can view financial revenue, profit margins, and payouts.
 */
export function canViewFinancials(role?: string | null): boolean {
  return isOwner(role);
}

/**
 * Checks if a user can manage SaaS billing, upgrade plans, and view invoices.
 */
export function canManageBilling(role?: string | null): boolean {
  return isOwner(role);
}

/**
 * Checks if a user has Super Admin platform privileges.
 */
export function isSuperAdmin(role?: string | null): boolean {
  return role === "super_admin";
}

/**
 * Checks if a user has Platform Admin or Super Admin privileges.
 */
export function isPlatformAdmin(role?: string | null): boolean {
  return role === "super_admin" || role === "platform_admin";
}

/**
 * Checks if a user can manage billing and financial subscriptions.
 */
export function canManageSubscriptions(role?: string | null): boolean {
  return (
    role === "super_admin" ||
    role === "platform_admin" ||
    role === "finance_admin"
  );
}

/**
 * Checks if a user can securely impersonate client workspaces.
 */
export function canImpersonate(role?: string | null): boolean {
  return role === "super_admin" || role === "platform_admin";
}

/**
 * Checks if a user can view or respond to support tickets.
 */
export function canManageSupport(role?: string | null): boolean {
  return isPlatformRole(role);
}

/**
 * Human-readable role label.
 */
export function getRoleLabel(role?: string | null): string {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "platform_admin":
      return "Platform Admin";
    case "finance_admin":
      return "Finance Admin";
    case "support_agent":
      return "Support Agent";
    case "owner":
      return "Business Owner";
    case "manager":
      return "General Manager";
    case "cashier":
      return "Cashier";
    case "chef":
      return "Head Chef";
    case "waiter":
      return "Floor Waiter";
    case "housekeeping":
      return "Housekeeping";
    case "staff":
      return "Staff";
    default:
      return role ? role.replace("_", " ").toUpperCase() : "Staff";
  }
}

/**
 * Badge styling class for roles.
 */
export function getRoleBadgeClass(role?: string | null): string {
  switch (role) {
    case "super_admin":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    case "platform_admin":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    case "finance_admin":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "support_agent":
      return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
    case "owner":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "manager":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case "chef":
      return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
    case "waiter":
      return "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20";
    case "cashier":
      return "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20";
    case "housekeeping":
      return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20";
    default:
      return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
  }
}

/**
 * Whitelist of allowed routes per role.
 */
export const ROLE_ALLOWED_ROUTES: Record<string, string[]> = {
  owner: [
    "/dashboard",
    "/dashboard/orders",
    "/dashboard/menu",
    "/dashboard/tables",
    "/dashboard/rooms",
    "/dashboard/history",
    "/dashboard/whatsapp",
    "/dashboard/video",
    "/dashboard/staff",
    "/dashboard/analytics",
    "/dashboard/ai",
    "/pricing",
    "/dashboard/settings",
    "/dashboard/notifications",
  ],
  manager: [
    "/dashboard",
    "/dashboard/orders",
    "/dashboard/menu",
    "/dashboard/tables",
    "/dashboard/rooms",
    "/dashboard/history",
    "/dashboard/whatsapp",
    "/dashboard/video",
    "/dashboard/staff",
    "/dashboard/analytics",
    "/dashboard/ai",
    "/dashboard/settings",
    "/dashboard/notifications",
  ],
  chef: [
    "/dashboard",
    "/dashboard/orders",
    "/dashboard/menu",
    "/dashboard/notifications",
  ],
  waiter: [
    "/dashboard",
    "/dashboard/tables",
    "/dashboard/orders",
    "/dashboard/menu",
    "/dashboard/notifications",
  ],
  cashier: [
    "/dashboard",
    "/dashboard/orders",
    "/dashboard/tables",
    "/dashboard/menu",
    "/dashboard/notifications",
  ],
  housekeeping: [
    "/dashboard",
    "/dashboard/rooms",
    "/dashboard/notifications",
  ],
  staff: [
    "/dashboard",
    "/dashboard/orders",
    "/dashboard/tables",
    "/dashboard/notifications",
  ],
};

/**
 * Checks if a role and business category are permitted to view or navigate to a given route.
 */
export function isRouteAllowed(
  pathname: string,
  role?: string | null,
  category?: string | null
): boolean {
  if (!role) return false;

  // Platform super admins and platform admins bypass category gating for system debugging
  if (isPlatformAdmin(role)) return true;

  // Enforce vertical business category gating (e.g. Restaurants have no Rooms; Cloud Kitchens have neither Rooms nor Tables)
  if (category && !isRouteAllowedForCategory(pathname, category)) {
    return false;
  }

  // Business Owner has access to all category-permitted workspace routes
  if (isOwner(role)) return true;

  const allowedRoutes = ROLE_ALLOWED_ROUTES[role] || ROLE_ALLOWED_ROUTES["staff"];

  // Exact match or subroute prefix match (e.g. /dashboard/rooms/101 or /dashboard/ai/forecast)
  return allowedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`) || pathname.startsWith(`${route}?`)
  );
}

/**
 * Returns the primary landing route for a specific role.
 */
export function getPrimaryRouteForRole(role?: string | null): string {
  switch (role) {
    case "chef":
      return "/dashboard/orders";
    case "waiter":
      return "/dashboard/tables";
    case "cashier":
      return "/dashboard/orders";
    case "housekeeping":
      return "/dashboard/rooms";
    default:
      return "/dashboard";
  }
}

