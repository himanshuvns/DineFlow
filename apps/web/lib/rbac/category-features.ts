/**
 * DineFlow Category-Based Dynamic Feature Configuration
 *
 * Configures navigation and module availability for:
 * - Hotel & Resort: Rooms & Suites + Dining Tables + Live KDS + Menu
 * - Restaurant & Café: Dining Tables + Live KDS + Menu (Rooms hidden)
 * - Cloud Kitchen: Live KDS + Menu (Rooms and Dine-in Tables hidden; delivery/takeaway focus)
 */

export type BusinessCategory =
  | "restaurant"
  | "cafe"
  | "hotel"
  | "cloud_kitchen"
  | "resort";

export interface CategoryConfig {
  id: BusinessCategory;
  label: string;
  tagline: string;
  badge: string;
  hasRooms: boolean;
  hasTables: boolean;
  hasKds: boolean;
  hasMenu: boolean;
  hasRoomService: boolean;
  historyTitle: string;
  historyDescription: string;
  tableLabel?: string;
  roomLabel?: string;
}

export const CATEGORY_CONFIGS: Record<BusinessCategory, CategoryConfig> = {
  hotel: {
    id: "hotel",
    label: "Hotel",
    tagline: "Hotel OS",
    badge: "🏨 Hotel Workspace",
    hasRooms: true,
    hasTables: true,
    hasKds: true,
    hasMenu: true,
    hasRoomService: true,
    historyTitle: "Guest & Dining History",
    historyDescription: "Live operational log of hotel guest stays and settled restaurant bills.",
    tableLabel: "Tables & Dining",
    roomLabel: "Rooms & Suites",
  },
  resort: {
    id: "resort",
    label: "Resort",
    tagline: "Resort OS",
    badge: "🌴 Resort Workspace",
    hasRooms: true,
    hasTables: true,
    hasKds: true,
    hasMenu: true,
    hasRoomService: true,
    historyTitle: "Guest & Dining History",
    historyDescription: "Live operational log of villa stays and poolside dining bills.",
    tableLabel: "Dining & Cabanas",
    roomLabel: "Villas & Suites",
  },
  restaurant: {
    id: "restaurant",
    label: "Restaurant",
    tagline: "Restaurant OS",
    badge: "🍽️ Restaurant Workspace",
    hasRooms: false,
    hasTables: true,
    hasKds: true,
    hasMenu: true,
    hasRoomService: false,
    historyTitle: "Dining & Billing History",
    historyDescription: "Real-time records of dining room covers, orders, and settled table checks.",
    tableLabel: "Tables & QR Codes",
  },
  cafe: {
    id: "cafe",
    label: "Café",
    tagline: "Café OS",
    badge: "☕ Café Workspace",
    hasRooms: false,
    hasTables: true,
    hasKds: true,
    hasMenu: true,
    hasRoomService: false,
    historyTitle: "Dining & Billing History",
    historyDescription: "Real-time stream of café register receipts, QR orders, and barista tickets.",
    tableLabel: "Counter & Seating",
  },
  cloud_kitchen: {
    id: "cloud_kitchen",
    label: "Cloud Kitchen",
    tagline: "Cloud Kitchen OS",
    badge: "🍳 Cloud Kitchen Workspace",
    hasRooms: false,
    hasTables: false,
    hasKds: true,
    hasMenu: true,
    hasRoomService: false,
    historyTitle: "Order & Dispatch History",
    historyDescription: "Real-time log of delivery partner dispatches, takeaway pickups, and kitchen tickets.",
  },
};

/**
 * Normalizes any category string into one of the 5 supported BusinessCategory keys.
 */
export function normalizeCategory(category?: string | null): BusinessCategory {
  if (!category) return "restaurant";
  const clean = category.toLowerCase().trim();
  if (clean === "hotel") return "hotel";
  if (clean === "resort") return "resort";
  if (clean === "cafe" || clean === "café") return "cafe";
  if (clean === "cloud_kitchen" || clean === "cloudkitchen" || clean === "cloud") return "cloud_kitchen";
  return "restaurant";
}

/**
 * Returns configuration for a given business category.
 */
export function getCategoryConfig(category?: string | null): CategoryConfig {
  return CATEGORY_CONFIGS[normalizeCategory(category)];
}

/**
 * Checks whether the category supports hotel/resort rooms and suites.
 */
export function hasRooms(category?: string | null): boolean {
  return getCategoryConfig(category).hasRooms;
}

/**
 * Checks whether the category supports dine-in tables and QR stands.
 */
export function hasTables(category?: string | null): boolean {
  return getCategoryConfig(category).hasTables;
}

/**
 * Determines whether a route is permitted for the business category.
 */
export function isRouteAllowedForCategory(route: string, category?: string | null): boolean {
  const config = getCategoryConfig(category);
  if (route === "/dashboard/rooms" || route.startsWith("/dashboard/rooms/")) {
    return config.hasRooms;
  }
  if (route === "/dashboard/tables" || route.startsWith("/dashboard/tables/")) {
    return config.hasTables;
  }
  return true;
}
