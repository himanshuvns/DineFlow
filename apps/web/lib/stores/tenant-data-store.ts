import * as React from "react";
import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { useAuthStore, Tenant, User } from "./auth-store";
import { formatCategoryName, deduplicateCategories, isCategoryMatch } from "@/lib/utils/category-utils";

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
  isVeg: boolean;
  desc: string;
  imageUrl?: string;
  variantsCount?: number;
  modifiersCount?: number;
  bestseller?: boolean;
  recommended?: boolean;
  spicyLevel?: number; // 0: Mild, 1: Medium, 2: Hot, 3: Fiery
  prepTimeMinutes?: number;
  hindiName?: string;
}

export interface TableItem {
  id: string;
  name: string;
  seats: number;
  zone: string;
  status: "occupied" | "available" | "reserved";
  orderId?: string;
  qrCode?: string;
  qrSlug?: string;
}

export interface KdsOrderItem {
  name: string;
  qty: number;
  variant?: string;
  modifiers?: string[];
  notes?: string;
}

export interface KdsOrder {
  id: string;
  table: string;
  customerName: string;
  customerPhone: string;
  secondsElapsed: number;
  station: "main_kitchen" | "bar" | "room_service";
  destination: "dine_in" | "room_service" | "takeaway";
  status: "pending" | "preparing" | "ready" | "served" | "cancelled" | "paid";
  items: KdsOrderItem[];
  total: number;
  time?: string;
  createdAt?: string;
}

export interface OnboardingStep {
  id: number;
  title: string;
  completed: boolean;
  cta?: string;
  href?: string;
}

// Starter templates for new restaurants to quickly populate their dashboard
export const STARTER_TEMPLATES = {
  bistro: {
    name: "Bistro & Continental",
    categories: ["Starters", "Mains", "Pizzas", "Beverages", "Desserts"],
    menuItems: [
      {
        id: "itm_b1",
        name: "Truffle Mushroom Risotto",
        category: "Mains",
        price: 850,
        available: true,
        isVeg: true,
        desc: "Arborio rice, black truffle paste, wild forest mushrooms, Parmigiano-Reggiano.",
        imageUrl: "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=600&q=80",
        variantsCount: 0,
        modifiersCount: 2,
      },
      {
        id: "itm_b2",
        name: "Wood-Fired Margherita",
        category: "Pizzas",
        price: 750,
        available: true,
        isVeg: true,
        desc: "San Marzano tomatoes, fresh buffalo mozzarella, organic basil, extra virgin olive oil.",
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
        variantsCount: 2,
        modifiersCount: 3,
      },
      {
        id: "itm_b3",
        name: "Burrata & Heirloom Salad",
        category: "Starters",
        price: 680,
        available: true,
        isVeg: true,
        desc: "Pugliese burrata, heirloom cherry tomatoes, aged balsamic reduction, toasted pine nuts.",
        imageUrl: "https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=600&q=80",
        variantsCount: 0,
        modifiersCount: 2,
      },
      {
        id: "itm_b4",
        name: "Cold Brew Tonic & Citrus",
        category: "Beverages",
        price: 320,
        available: true,
        isVeg: true,
        desc: "Single origin 18-hour cold brew steeped with artisanal tonic and dehydrated orange slice.",
        imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
        variantsCount: 0,
        modifiersCount: 0,
      },
      {
        id: "itm_b5",
        name: "Belgian Chocolate Fondant",
        category: "Desserts",
        price: 450,
        available: true,
        isVeg: true,
        desc: "Warm molten center cake with Madagascar bourbon vanilla bean gelato.",
        imageUrl: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=600&q=80",
        variantsCount: 0,
        modifiersCount: 1,
      },
    ],
    tables: [
      { id: "T-01", name: "Table 01", seats: 2, zone: "Main Dining", status: "available" as const },
      { id: "T-02", name: "Table 02", seats: 4, zone: "Main Dining", status: "available" as const },
      { id: "T-03", name: "Table 03", seats: 4, zone: "Main Dining", status: "available" as const },
      { id: "T-04", name: "Table 04", seats: 6, zone: "Patio Terrace", status: "available" as const },
      { id: "T-05", name: "Table 05", seats: 2, zone: "Patio Terrace", status: "available" as const },
    ],
  },
  cafe: {
    name: "Cafe & Roastery",
    categories: ["Coffee", "Artisanal Toast", "Bowls", "Pastries", "Cold Drinks"],
    menuItems: [
      {
        id: "itm_c1",
        name: "Single Origin Cortado",
        category: "Coffee",
        price: 240,
        available: true,
        isVeg: true,
        desc: "Equal parts double espresso and textured oat milk with nutty cocoa notes.",
        imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "itm_c2",
        name: "Sourdough Avocado Poached Toast",
        category: "Artisanal Toast",
        price: 420,
        available: true,
        isVeg: true,
        desc: "Crushed Hass avocado, organic poached egg, microgreens, smoked chili flakes.",
        imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "itm_c3",
        name: "Acai Berry Superfood Bowl",
        category: "Bowls",
        price: 490,
        available: true,
        isVeg: true,
        desc: "Organic Brazilian acai puree topped with chia seeds, banana, blueberries and almond butter.",
        imageUrl: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "itm_c4",
        name: "Almond Frangipane Croissant",
        category: "Pastries",
        price: 280,
        available: true,
        isVeg: true,
        desc: "Double-baked flaky French croissant layered with sweet almond cream and toasted flakes.",
        imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "itm_c5",
        name: "Yuzu Cold Brew Fizz",
        category: "Cold Drinks",
        price: 310,
        available: true,
        isVeg: true,
        desc: "Japanese citrus extract infused with sparkling cold brew coffee and fresh mint.",
        imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
      },
    ],
    tables: [
      { id: "C-01", name: "Barista Counter 01", seats: 1, zone: "Espresso Bar", status: "available" as const },
      { id: "C-02", name: "Barista Counter 02", seats: 1, zone: "Espresso Bar", status: "available" as const },
      { id: "T-01", name: "Co-work Table 01", seats: 4, zone: "Lounge Area", status: "available" as const },
      { id: "T-02", name: "Sunlit Booth 02", seats: 4, zone: "Lounge Area", status: "available" as const },
      { id: "T-03", name: "Patio Table 03", seats: 2, zone: "Outdoor Deck", status: "available" as const },
    ],
  },
  indian: {
    name: "South Indian & Street Bites",
    categories: ["Dosai & Crispy Specials", "Steamed Idli & Vada", "Curries & Meals", "Beverages & Chai"],
    menuItems: [
      {
        id: "itm_i1",
        name: "Ghee Roast Masala Dosa",
        category: "Dosai & Crispy Specials",
        price: 220,
        available: true,
        isVeg: true,
        desc: "Golden crispy crepe roasted in pure cow ghee, filled with spiced potato mash, served with trio of chutneys.",
        imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "itm_i2",
        name: "Medu Vada & Button Idli Platter",
        category: "Steamed Idli & Vada",
        price: 180,
        available: true,
        isVeg: true,
        desc: "Fluffy steamed rice cakes and crispy lentil donuts steeped in piping hot drumstick sambar.",
        imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "itm_i3",
        name: "Paneer Butter Masala Meal",
        category: "Curries & Meals",
        price: 360,
        available: true,
        isVeg: true,
        desc: "Cottage cheese cubes simmered in rich creamy tomato cashew gravy with 2 buttery laccha parathas.",
        imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "itm_i4",
        name: "Degree Filter Coffee",
        category: "Beverages & Chai",
        price: 90,
        available: true,
        isVeg: true,
        desc: "Authentic Chikmagalur dark roast decoction frothed with whole milk in traditional brass dabarah.",
        imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
      },
    ],
    tables: [
      { id: "T-01", name: "Table 01", seats: 4, zone: "Family Hall", status: "available" as const },
      { id: "T-02", name: "Table 02", seats: 4, zone: "Family Hall", status: "available" as const },
      { id: "T-03", name: "Table 03", seats: 6, zone: "Family Hall", status: "available" as const },
      { id: "T-04", name: "Express Table 04", seats: 2, zone: "Quick Bites", status: "available" as const },
      { id: "T-05", name: "Express Table 05", seats: 2, zone: "Quick Bites", status: "available" as const },
    ],
  },
  bar: {
    name: "Bar & Craft Taproom",
    categories: ["Craft Cocktails", "Appetizers & Tapas", "Burgers & Sliders", "Draft Beers"],
    menuItems: [
      {
        id: "itm_x1",
        name: "Smoked Bourbon Old Fashioned",
        category: "Craft Cocktails",
        price: 650,
        available: true,
        isVeg: true,
        desc: "Kentucky bourbon, Angostura bitters, orange zest, infused with aromatic cedarwood smoke.",
        imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "itm_x2",
        name: "Parmesan Truffle Fries",
        category: "Appetizers & Tapas",
        price: 380,
        available: true,
        isVeg: true,
        desc: "Double crisp hand-cut potato fries tossed in white truffle oil, shaved parmesan and roasted garlic aioli.",
        imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "itm_x3",
        name: "Smash Cheeseburger Sliders",
        category: "Burgers & Sliders",
        price: 520,
        available: true,
        isVeg: false,
        desc: "Trio of aged cheddar smashed patties on toasted brioche with house caramelized onion jam.",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
      },
    ],
    tables: [
      { id: "BAR-01", name: "High Stool 01", seats: 1, zone: "Bar Counter", status: "available" as const },
      { id: "BAR-02", name: "High Stool 02", seats: 1, zone: "Bar Counter", status: "available" as const },
      { id: "L-01", name: "Lounge Booth 01", seats: 6, zone: "VIP Lounge", status: "available" as const },
      { id: "L-02", name: "Lounge Booth 02", seats: 6, zone: "VIP Lounge", status: "available" as const },
    ],
  },
  clean: {
    name: "Clean Slate",
    categories: ["General"],
    menuItems: [],
    tables: [],
  },
};

const DEFAULT_ONBOARDING: OnboardingStep[] = [
  { id: 1, title: "Brand Identity & Workspace Profile", completed: true, cta: "Brand Setup", href: "/dashboard/settings?tab=general&openLogoModal=true" },
  { id: 2, title: "Configure Dine-in Tables & Layout", completed: false, cta: "Manage Tables", href: "/dashboard/tables" },
  { id: 3, title: "Add Your Signature Menu Items", completed: false, cta: "Add Items", href: "/dashboard/menu" },
  { id: 4, title: "Print & Display QR Code Stands", completed: false, cta: "View QRs", href: "/dashboard/tables" },
  { id: 5, title: "Connect WhatsApp Cloud API", completed: false, cta: "Connect Now", href: "/dashboard/whatsapp" },
];

interface TenantDataState {
  tenantId: string | null;
  tenantName: string;
  tenantSlug: string;
  isDemoTenant: boolean;
  categories: string[];
  menuItems: MenuItem[];
  tables: TableItem[];
  orders: KdsOrder[];
  onboardingSteps: OnboardingStep[];
  isLoading: boolean;
  initialized: boolean;

  // Actions
  initializeTenant: (tenant: Tenant | null, user: User | null) => Promise<void>;
  addCategory: (name: string) => Promise<string>;
  renameCategory: (oldName: string, newName: string) => Promise<void>;
  deleteCategory: (name: string) => Promise<void>;
  reorderCategories: (categories: string[]) => Promise<void>;
  addMenuItem: (item: Omit<MenuItem, "id">) => Promise<MenuItem>;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  bulkAddMenuItems: (items: Omit<MenuItem, "id">[], options?: { replaceExisting?: boolean }) => Promise<MenuItem[]>;
  bulkUpdateMenuItems: (ids: string[], updates: Partial<MenuItem>) => Promise<void>;
  bulkDeleteMenuItems: (ids: string[]) => Promise<void>;
  bulkAdjustPrices: (ids: string[], percentage: number) => Promise<void>;
  addTable: (table: Omit<TableItem, "id">) => Promise<TableItem>;
  updateTableStatus: (id: string, status: TableItem["status"]) => Promise<void>;
  deleteTable: (id: string) => Promise<void>;
  fetchTables: () => Promise<void>;
  addOrder: (order: Partial<KdsOrder>) => Promise<KdsOrder>;
  updateOrderStatus: (id: string, status: KdsOrder["status"], note?: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
  toggleOnboardingStep: (id: number) => void;
  applyStarterTemplate: (templateKey: keyof typeof STARTER_TEMPLATES) => Promise<void> | void;
  clearTenantData: () => void;
}

export const broadcastMenuChange = (tenantSlug?: string) => {
  if (typeof window !== "undefined") {
    try {
      const channel = new BroadcastChannel("dineflow_menu_sync");
      channel.postMessage({ type: "MENU_UPDATED", slug: tenantSlug, timestamp: Date.now() });
      channel.close();
    } catch {
      // BroadcastChannel unsupported or closed
    }
  }
};

const getStorageKey = (tenantId: string) => `dineflow_data_v2_${tenantId}`;

const persistTenantState = (
  tenantId: string | null,
  data: {
    categories?: string[];
    menuItems?: MenuItem[];
    tables?: TableItem[];
    orders?: KdsOrder[];
    onboardingSteps?: OnboardingStep[];
  }
) => {
  if (typeof window === "undefined" || !tenantId) return;
  try {
    const key = getStorageKey(tenantId);
    const existingRaw = localStorage.getItem(key);
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    const rawCategories = Array.isArray(data.categories)
      ? data.categories
      : Array.isArray(existing.categories)
      ? existing.categories
      : [];
    const rawMenuItems = Array.isArray(data.menuItems)
      ? data.menuItems
      : Array.isArray(existing.menuItems)
      ? existing.menuItems
      : [];

    const normalizedMenuItems = rawMenuItems.map((item: MenuItem) => ({
      ...item,
      category: formatCategoryName(item.category || "General"),
    }));

    const itemCats = normalizedMenuItems.map((i: MenuItem) => i.category);
    const cleanCategories = deduplicateCategories([...rawCategories, ...itemCats], {
      removePlaceholderGeneral: true,
    });

    const merged = {
      categories: cleanCategories,
      menuItems: normalizedMenuItems,
      tables: Array.isArray(data.tables)
        ? data.tables
        : Array.isArray(existing.tables)
        ? existing.tables
        : [],
      orders: Array.isArray(data.orders)
        ? data.orders
        : Array.isArray(existing.orders)
        ? existing.orders
        : [],
      onboardingSteps: Array.isArray(data.onboardingSteps)
        ? data.onboardingSteps
        : Array.isArray(existing.onboardingSteps)
        ? existing.onboardingSteps
        : DEFAULT_ONBOARDING,
    };
    localStorage.setItem(key, JSON.stringify(merged));
  } catch (err) {
    console.warn("Failed to persist tenant data to localStorage:", err);
  }
};

export const useTenantDataStore = create<TenantDataState>((set, get) => ({
  tenantId: null,
  tenantName: "The Grand Bistro",
  tenantSlug: "the-grand-bistro",
  isDemoTenant: true,
  categories: [],
  menuItems: [],
  tables: [],
  orders: [],
  onboardingSteps: DEFAULT_ONBOARDING,
  isLoading: false,
  initialized: false,

  initializeTenant: async (tenant: Tenant | null, user: User | null) => {
    if (!tenant && !user) {
      set({
        tenantId: "",
        tenantName: "",
        tenantSlug: "",
        isDemoTenant: false,
        menuItems: [],
        categories: [],
        tables: [],
        orders: [],
        isLoading: false,
        initialized: false,
      });
      return;
    }

    const tenantId = tenant?.id || "";
    const tenantName = tenant?.name || "";
    const isDemoTenant = Boolean(
      (tenant && (tenantId === "demo-tenant" || tenantId === "6aa52dd1187698227bc298ae" || tenantName.toLowerCase().includes("grand bistro"))) ||
      user?.phone === "+91 98765 43210" ||
      user?.phone === "+919876543210"
    );
    const tenantSlug = tenant?.slug || "";

    // Don't reinitialize if already loaded for same tenant
    if (get().initialized && get().tenantId === tenantId) {
      return;
    }

    set({
      tenantId,
      tenantName,
      tenantSlug,
      isDemoTenant,
      isLoading: true,
    });

    // Check localStorage cache for this tenant
    const storageKey = getStorageKey(tenantId);
    let cachedData: any = null;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) cachedData = JSON.parse(raw);
      } catch (e) {
        console.warn("Could not read cached tenant data:", e);
      }
    }

    if (cachedData && typeof cachedData === "object") {
      const rawCachedItems = Array.isArray(cachedData.menuItems) ? cachedData.menuItems : [];
      const normalizedItems: MenuItem[] = rawCachedItems.map((item: MenuItem) => ({
        ...item,
        category: formatCategoryName(item.category || "General"),
      }));
      const rawCats = Array.isArray(cachedData.categories) ? cachedData.categories : [];
      const cleanCats = deduplicateCategories(
        [...rawCats, ...normalizedItems.map((i) => i.category)],
        { removePlaceholderGeneral: true }
      );

      set({
        categories: cleanCats,
        menuItems: normalizedItems,
        tables: Array.isArray(cachedData.tables) ? cachedData.tables : [],
        orders: Array.isArray(cachedData.orders) ? cachedData.orders : [],
        onboardingSteps: Array.isArray(cachedData.onboardingSteps)
          ? cachedData.onboardingSteps
          : DEFAULT_ONBOARDING,
        isLoading: false,
        initialized: true,
      });
      // Do not return early: allow SWR background fetch to sync latest database items
    }

    // Only fetch from backend API if user has an active authenticated session
    if (!useAuthStore.getState().accessToken) {
      set({ isLoading: false });
      return;
    }

    try {

      const [itemsRes, categoriesRes, tablesRes, ordersRes] = await Promise.allSettled([
        apiClient.get("/menu/items"),
        apiClient.get("/menu/categories"),
        apiClient.get("/tables"),
        apiClient.get("/orders"),
      ]);

      let remoteItems: MenuItem[] = [];
      let remoteCategories: string[] = [];
      let remoteTables: TableItem[] = [];
      let remoteOrders: KdsOrder[] = [];

      if (categoriesRes.status === "fulfilled" && categoriesRes.value.data?.data) {
        const cats = categoriesRes.value.data.data;
        if (Array.isArray(cats) && cats.length > 0) {
          remoteCategories = cats.map((c: any) => formatCategoryName(c.name || c));
        }
      }

      if (itemsRes.status === "fulfilled" && itemsRes.value.data?.data) {
        const items = itemsRes.value.data.data;
        if (Array.isArray(items) && items.length > 0) {
          remoteItems = items.map((i: any) => ({
            id: String(i.id || i._id),
            name: i.name || "Untitled Dish",
            category: formatCategoryName(i.category || i.categoryName || "General"),
            price: typeof i.price === "number" ? i.price : (typeof i.basePrice === "number" ? i.basePrice : 0),
            available: i.available !== undefined ? i.available : (i.isAvailable !== false),
            isVeg: i.isVeg !== undefined ? i.isVeg : (Array.isArray(i.dietaryTags) ? (i.dietaryTags.includes("veg") || !i.dietaryTags.includes("non_veg")) : true),
            desc: i.desc || i.description || "",
            imageUrl: i.imageUrl || i.image,
            variantsCount: Array.isArray(i.variants) ? i.variants.length : (i.variantsCount || 0),
            modifiersCount: Array.isArray(i.modifierGroups) ? i.modifierGroups.length : (i.modifiersCount || 0),
            bestseller: i.bestseller || i.isBestseller || false,
            recommended: i.recommended || i.isRecommended || false,
            spicyLevel: typeof i.spicyLevel === "number" ? i.spicyLevel : 1,
            prepTimeMinutes: typeof i.prepTimeMinutes === "number" ? i.prepTimeMinutes : 15,
            hindiName: i.hindiName || "",
          }));
          const extractedCats = remoteItems.map((i) => i.category);
          remoteCategories = deduplicateCategories([...remoteCategories, ...extractedCats]);
        }
      }

      if (tablesRes.status === "fulfilled" && tablesRes.value.data?.data) {
        const tbls = tablesRes.value.data.data;
        if (Array.isArray(tbls) && tbls.length > 0) {
          remoteTables = tbls.map((t: any) => ({
            id: t.id || t._id,
            name: t.name || `Table ${t.number}`,
            seats: t.capacity || t.seats || 4,
            zone: t.zone || t.section || "Main Dining",
            status: t.status || "available",
          }));
        }
      }

      if (ordersRes.status === "fulfilled" && ordersRes.value.data?.data) {
        const ords = ordersRes.value.data.data;
        if (Array.isArray(ords)) {
          remoteOrders = ords.map((o: any) => ({
            id: o.orderNumber || o.id || o._id,
            table: o.tableName || (o.tableNumber ? `Table ${o.tableNumber}` : o.table || "Dine-in"),
            customerName: o.customerName || "Customer",
            customerPhone: o.customerPhone || "",
            secondsElapsed: (() => {
              if (!o.createdAt) return 60;
              const startMs = new Date(o.createdAt).getTime();
              const isFinished = o.status === "served" || o.status === "paid" || o.status === "cancelled";
              if (isFinished) {
                let endMs = o.updatedAt ? new Date(o.updatedAt).getTime() : startMs;
                if (Array.isArray(o.timeline)) {
                  const ev = o.timeline.find((t: any) => t.status === "served" || t.status === "delivered");
                  if (ev?.timestamp) endMs = new Date(ev.timestamp).getTime();
                }
                return Math.max(0, Math.floor((endMs - startMs) / 1000));
              }
              return Math.max(0, Math.floor((Date.now() - startMs) / 1000));
            })(),
            station: o.station || "main_kitchen",
            destination: o.destination || "dine_in",
            status: o.status || "pending",
            items: Array.isArray(o.items)
              ? o.items.map((it: any) => ({
                  name: it.name,
                  qty: it.quantity || it.qty || 1,
                  variant: it.selectedVariant,
                  modifiers: Array.isArray(it.selectedModifiers)
                    ? it.selectedModifiers.map((m: any) => (typeof m === "string" ? m : m.name))
                    : [],
                  notes: it.notes,
                }))
              : [],
            total: o.totalAmount || o.total || 0,
            time: o.createdAt
              ? new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Just now",
          }));
        }
      }

      // If backend returned data, use it!
      if (remoteItems.length > 0 || remoteTables.length > 0 || remoteOrders.length > 0) {
        const normalizedRemoteItems = remoteItems.map((item) => ({
          ...item,
          category: formatCategoryName(item.category || "General"),
        }));

        // Check if user previously imported dishes locally that need to be published to database
        const hasCustomLocalItems =
          Array.isArray(cachedData?.menuItems) &&
          cachedData.menuItems.some(
            (i: any) =>
              typeof i.id === "string" &&
              i.id.startsWith("itm_") &&
              !i.id.startsWith("itm_b") &&
              !i.id.startsWith("itm_c") &&
              !i.id.startsWith("itm_p") &&
              !i.id.startsWith("itm_fd")
          );

        let finalMenuItems = normalizedRemoteItems;
        if (hasCustomLocalItems && cachedData?.menuItems) {
          const customOnly: MenuItem[] = cachedData.menuItems.filter(
            (i: any) =>
              !i.id.startsWith("itm_b") &&
              !i.id.startsWith("itm_c") &&
              !i.id.startsWith("itm_p") &&
              !i.id.startsWith("itm_fd")
          );
          if (customOnly.length > 0) {
            finalMenuItems = customOnly;
            // Purge old remote items that are not in customOnly
            const seedIds = remoteItems
              .map((i) => i.id)
              .filter((id) => typeof id === "string" && id.length === 24);
            if (seedIds.length > 0) {
              apiClient.post("/menu/items/bulk-delete", { ids: seedIds }).catch(() => {});
            }
            // Auto-persist user's custom imported items to database for customer QR scans
            apiClient
              .post("/menu/items/bulk", {
                items: customOnly.map((ci) => ({
                  name: ci.name,
                  category: ci.category,
                  price: ci.price,
                  basePrice: ci.price,
                  description: ci.desc,
                  desc: ci.desc,
                  available: ci.available !== false,
                  isAvailable: ci.available !== false,
                  isVeg: ci.isVeg,
                  imageUrl: ci.imageUrl,
                  bestseller: ci.bestseller || false,
                  recommended: ci.recommended || false,
                  spicyLevel: ci.spicyLevel || 1,
                  prepTimeMinutes: ci.prepTimeMinutes || 15,
                  hindiName: ci.hindiName || "",
                })),
              })
              .catch(() => {});
          }
        }

        const rawCats =
          remoteCategories.length > 0
            ? remoteCategories
            : finalMenuItems.map((i) => i.category);
        const finalCategories = deduplicateCategories(rawCats, {
          removePlaceholderGeneral: true,
        });
        const stateToSave = {
          categories: finalCategories,
          menuItems: finalMenuItems,
          tables: remoteTables,
          orders: remoteOrders,
          onboardingSteps: DEFAULT_ONBOARDING.map((s) => {
            if (s.id === 2) return { ...s, completed: remoteTables.length > 0 };
            if (s.id === 3) return { ...s, completed: finalMenuItems.length > 0 };
            return s;
          }),
        };

        persistTenantState(tenantId, stateToSave);

        set({
          ...stateToSave,
          isLoading: false,
          initialized: true,
        });
        return;
      }
    } catch (apiErr) {
      console.warn("Failed to fetch initial data from backend API:", apiErr);
    }

    // If cached data was already loaded and remote returned empty, keep the cache
    if (cachedData && typeof cachedData === "object") {
      set({ isLoading: false, initialized: true });
      return;
    }

    // Default Fallback:
    // If it's a demo account, load Bistro preset
    // If it's a new tenant, initialize clean/empty state with real dynamic metadata
    if (isDemoTenant) {
      const demoPreset = STARTER_TEMPLATES.bistro;
      const initialOrders: KdsOrder[] = [
        {
          id: "ORD-9421",
          table: "Table 04",
          customerName: "Priya Patel",
          customerPhone: "+91 98234 56789",
          secondsElapsed: 180,
          station: "main_kitchen",
          destination: "dine_in",
          status: "preparing",
          items: [{ name: "Wood-Fired Margherita", qty: 1 }, { name: "Cold Brew Tonic & Citrus", qty: 2 }],
          total: 1390,
          time: "3 mins ago",
        },
        {
          id: "ORD-9420",
          table: "Table 02",
          customerName: "Aarav Sharma",
          customerPhone: "+91 98765 43210",
          secondsElapsed: 420,
          station: "main_kitchen",
          destination: "dine_in",
          status: "ready",
          items: [{ name: "Truffle Mushroom Risotto", qty: 1 }, { name: "Belgian Chocolate Fondant", qty: 1 }],
          total: 1300,
          time: "7 mins ago",
        },
      ];

      const initialSteps = [
        { id: 1, title: "Register Business & Workspace", completed: true },
        { id: 2, title: "Configure Dine-in Tables & Layout", completed: true, cta: "Manage Tables", href: "/dashboard/tables" },
        { id: 3, title: "Add Your Signature Menu Items", completed: true, cta: "View Menu", href: "/dashboard/menu" },
        { id: 4, title: "Print & Display QR Code Stands", completed: false, cta: "Download QRs", href: "/dashboard/tables" },
        { id: 5, title: "Connect WhatsApp Cloud API", completed: false, cta: "Connect Now", href: "/dashboard/whatsapp" },
      ];

      const demoState = {
        categories: demoPreset.categories,
        menuItems: demoPreset.menuItems,
        tables: demoPreset.tables,
        orders: initialOrders,
        onboardingSteps: initialSteps,
      };

      persistTenantState(tenantId, demoState);

      set({
        ...demoState,
        isLoading: false,
        initialized: true,
      });
    } else {
      // Clean slate for new registered user
      const cleanState = {
        categories: [],
        menuItems: [],
        tables: [],
        orders: [],
        onboardingSteps: DEFAULT_ONBOARDING,
      };

      persistTenantState(tenantId, cleanState);

      set({
        ...cleanState,
        isLoading: false,
        initialized: true,
      });
    }

  },

  addCategory: async (name: string) => {
    const state = get();
    const formatted = formatCategoryName(name);
    if (!formatted || formatted === "General") return formatted;
    const updated = deduplicateCategories([...state.categories, formatted], {
      removePlaceholderGeneral: true,
    });

    try {
      await apiClient.post("/menu/categories", {
        name: formatted,
        displayOrder: updated.length,
        isActive: true,
      });
    } catch (e) {
      console.warn("Backend create category skipped:", e);
    }

    const nextState = { categories: updated };
    persistTenantState(state.tenantId, nextState);
    set(nextState);
    broadcastMenuChange(state.tenantSlug);
    return formatted;
  },

  renameCategory: async (oldName: string, newName: string) => {
    const state = get();
    const formattedOld = formatCategoryName(oldName);
    const formattedNew = formatCategoryName(newName);
    if (!formattedNew || formattedOld === formattedNew) return;

    // Update categories list
    const updatedCategories = deduplicateCategories(
      state.categories.map((c) => (isCategoryMatch(c, formattedOld) ? formattedNew : c)),
      { removePlaceholderGeneral: true }
    );

    // Update all dishes assigned to old category
    const updatedItems = state.menuItems.map((item) =>
      isCategoryMatch(item.category, formattedOld) ? { ...item, category: formattedNew } : item
    );

    const affectedDishIds = updatedItems
      .filter((item) => isCategoryMatch(item.category, formattedNew))
      .map((item) => item.id);

    try {
      if (affectedDishIds.length > 0) {
        await apiClient.patch("/menu/items/bulk", {
          ids: affectedDishIds,
          updates: { category: formattedNew },
        });
      }
    } catch (e) {
      console.warn("Backend rename category dishes update skipped:", e);
    }

    const nextState = { categories: updatedCategories, menuItems: updatedItems };
    persistTenantState(state.tenantId, nextState);
    set(nextState);
    broadcastMenuChange(state.tenantSlug);
  },

  deleteCategory: async (name: string) => {
    const state = get();
    const formatted = formatCategoryName(name);

    const remainingCats = state.categories.filter((c) => !isCategoryMatch(c, formatted));
    const fallbackCategory = remainingCats[0] || "General";
    const cleanCats = deduplicateCategories(
      remainingCats.length > 0 ? remainingCats : ["General"],
      { removePlaceholderGeneral: false }
    );

    // Reassign items from deleted category to fallback category
    const updatedItems = state.menuItems.map((item) =>
      isCategoryMatch(item.category, formatted) ? { ...item, category: fallbackCategory } : item
    );

    const nextState = { categories: cleanCats, menuItems: updatedItems };
    persistTenantState(state.tenantId, nextState);
    set(nextState);
    broadcastMenuChange(state.tenantSlug);
  },

  reorderCategories: async (newOrder: string[]) => {
    const state = get();
    const cleanCats = deduplicateCategories(newOrder, { removePlaceholderGeneral: true });
    const nextState = { categories: cleanCats };
    persistTenantState(state.tenantId, nextState);
    set(nextState);
    broadcastMenuChange(state.tenantSlug);
  },

  addMenuItem: async (newItemData) => {
    const state = get();
    const id = `itm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const createdItem: MenuItem = {
      ...newItemData,
      id,
      category: formatCategoryName(newItemData.category),
    };

    // Post to backend API
    try {
      const res = await apiClient.post("/menu/items", {
        name: createdItem.name,
        category: createdItem.category,
        price: createdItem.price,
        description: createdItem.desc,
        isVeg: createdItem.isVeg,
        available: createdItem.available,
        imageUrl: createdItem.imageUrl,
        bestseller: createdItem.bestseller,
        recommended: createdItem.recommended,
        spicyLevel: createdItem.spicyLevel,
        prepTimeMinutes: createdItem.prepTimeMinutes,
        hindiName: createdItem.hindiName,
      });
      if (res.data?.data?.id) {
        createdItem.id = String(res.data.data.id);
      }
    } catch (e) {
      console.warn("Backend save skipped or offline:", e);
    }

    const updatedCategories = deduplicateCategories(
      [...state.categories, createdItem.category],
      { removePlaceholderGeneral: true }
    );

    const updatedItems = [createdItem, ...state.menuItems];
    const updatedSteps = state.onboardingSteps.map((s) =>
      s.id === 3 ? { ...s, completed: true } : s
    );

    const nextState = {
      categories: updatedCategories,
      menuItems: updatedItems,
      onboardingSteps: updatedSteps,
    };

    persistTenantState(state.tenantId, nextState);
    set(nextState);
    broadcastMenuChange(state.tenantSlug);
    return createdItem;
  },

  updateMenuItem: async (id, updates) => {
    const state = get();
    const cleanUpdates = { ...updates };
    if (cleanUpdates.category) {
      cleanUpdates.category = formatCategoryName(cleanUpdates.category);
    }

    const updatedItems = state.menuItems.map((item) =>
      item.id === id ? { ...item, ...cleanUpdates } : item
    );

    let updatedCategories = state.categories;
    if (cleanUpdates.category) {
      updatedCategories = deduplicateCategories(
        [...state.categories, cleanUpdates.category],
        { removePlaceholderGeneral: true }
      );
    }

    // Call backend PUT endpoint to persist
    try {
      await apiClient.put(`/menu/items/${id}`, {
        name: cleanUpdates.name,
        category: cleanUpdates.category,
        price: cleanUpdates.price,
        description: cleanUpdates.desc,
        isVeg: cleanUpdates.isVeg,
        available: cleanUpdates.available,
        imageUrl: cleanUpdates.imageUrl,
        bestseller: cleanUpdates.bestseller,
        recommended: cleanUpdates.recommended,
        spicyLevel: cleanUpdates.spicyLevel,
        prepTimeMinutes: cleanUpdates.prepTimeMinutes,
        hindiName: cleanUpdates.hindiName,
      });
    } catch (e) {
      console.warn("Backend update skipped or offline:", e);
    }

    const nextState = { categories: updatedCategories, menuItems: updatedItems };
    persistTenantState(state.tenantId, nextState);
    set(nextState);
    broadcastMenuChange(state.tenantSlug);
  },

  deleteMenuItem: async (id) => {
    const state = get();
    try {
      await apiClient.delete(`/menu/items/${id}`);
    } catch (e) {
      console.warn("Backend delete skipped or offline:", e);
    }

    const updatedItems = state.menuItems.filter((i) => i.id !== id);
    persistTenantState(state.tenantId, { menuItems: updatedItems });
    set({ menuItems: updatedItems });
    broadcastMenuChange(state.tenantSlug);
  },

  bulkAddMenuItems: async (itemsData, options) => {
    const state = get();
    // Default replaceExisting to true if all current items are starter template items or explicitly requested
    const isOnlyStarterItems =
      state.menuItems.length > 0 &&
      state.menuItems.every((i) =>
        i.id.startsWith("itm_b") ||
        i.id.startsWith("itm_c") ||
        i.id.startsWith("itm_p") ||
        i.id.startsWith("itm_fd")
      );
    const shouldReplace = options?.replaceExisting ?? (isOnlyStarterItems || state.menuItems.length === 0);

    // 1. Skip backend persistence if unauthenticated
    if (!useAuthStore.getState().accessToken) {
      return [];
    }

    // 2. If replacing existing menu, purge old items from backend database
    if (shouldReplace) {
      try {
        const existingRes = await apiClient.get("/menu/items");
        const existingItems = existingRes.data?.data;
        if (Array.isArray(existingItems) && existingItems.length > 0) {
          const idsToDelete = existingItems
            .map((i: any) => i.id || i._id)
            .filter((id: string) => typeof id === "string" && id.length === 24);
          if (idsToDelete.length > 0) {
            await apiClient.post("/menu/items/bulk-delete", { ids: idsToDelete });
          }
        }
      } catch (delErr) {
        console.warn("[tenant-store] Bulk-delete existing backend items skipped:", delErr);
      }
    }

    const createdItems: MenuItem[] = itemsData.map((item, idx) => ({
      ...item,
      category: formatCategoryName(item.category),
      id: `itm_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
    }));

    // 3. Bulk sync new items to backend MongoDB
    try {
      const res = await apiClient.post("/menu/items/bulk", {
        items: createdItems.map((ci) => ({
          name: ci.name,
          category: ci.category,
          price: ci.price,
          basePrice: ci.price,
          description: ci.desc,
          desc: ci.desc,
          available: ci.available !== false,
          isAvailable: ci.available !== false,
          isVeg: ci.isVeg,
          imageUrl: ci.imageUrl,
          bestseller: ci.bestseller || false,
          recommended: ci.recommended || false,
          spicyLevel: ci.spicyLevel || 1,
          prepTimeMinutes: ci.prepTimeMinutes || 15,
          hindiName: ci.hindiName || "",
        })),
      });
      if (res.data?.data?.items && Array.isArray(res.data.data.items)) {
        res.data.data.items.forEach((srvItm: any, idx: number) => {
          if (createdItems[idx] && (srvItm.id || srvItm._id)) {
            createdItems[idx].id = String(srvItm.id || srvItm._id);
          }
        });
      }
    } catch (e) {
      console.warn("Backend bulk save skipped or offline:", e);
    }

    // 4. Update categories and items in state
    const newCats = createdItems.map((ci) => ci.category);
    const updatedCategories = deduplicateCategories(
      shouldReplace ? newCats : [...state.categories, ...newCats],
      { removePlaceholderGeneral: true }
    );

    const updatedItems = shouldReplace
      ? createdItems
      : [...createdItems, ...state.menuItems];

    const updatedSteps = state.onboardingSteps.map((s) =>
      s.id === 3 ? { ...s, completed: true } : s
    );

    const nextState = {
      categories: updatedCategories,
      menuItems: updatedItems,
      onboardingSteps: updatedSteps,
    };

    persistTenantState(state.tenantId, nextState);
    set(nextState);

    // 5. Update local public menu cache for instant UI and tab sync
    try {
      if (typeof window !== "undefined") {
        const catMap = new Map<string, any[]>();
        updatedItems.forEach((itm) => {
          if (!itm.available) return;
          const c = itm.category || "General";
          if (!catMap.has(c)) catMap.set(c, []);
          catMap.get(c)!.push({
            id: itm.id,
            name: itm.name,
            description: itm.desc || "Freshly prepared by our culinary team.",
            basePrice: itm.price,
            imageUrl: itm.imageUrl,
            isVeg: itm.isVeg,
          });
        });
        const sections = Array.from(catMap.entries()).map(([category, items]) => ({
          category,
          items,
        }));
        localStorage.setItem(
          `dineflow_public_menu_${state.tenantSlug.toLowerCase()}`,
          JSON.stringify({
            tenant: { name: state.tenantName, slug: state.tenantSlug },
            sections,
          })
        );
      }
    } catch {}

    broadcastMenuChange(state.tenantSlug);
    return createdItems;
  },

  bulkUpdateMenuItems: async (ids, updates) => {
    const state = get();
    const idSet = new Set(ids);
    const cleanUpdates = { ...updates };
    if (cleanUpdates.category) {
      cleanUpdates.category = formatCategoryName(cleanUpdates.category);
    }

    const updatedItems = state.menuItems.map((item) =>
      idSet.has(item.id) ? { ...item, ...cleanUpdates } : item
    );

    // Merge new categories if category was updated
    let updatedCategories = state.categories;
    if (cleanUpdates.category) {
      updatedCategories = deduplicateCategories(
        [...state.categories, cleanUpdates.category],
        { removePlaceholderGeneral: true }
      );
    }

    try {
      await apiClient.patch("/menu/items/bulk", { ids, updates });
    } catch (e) {
      console.warn("Backend bulk update skipped:", e);
    }

    const nextState = {
      categories: updatedCategories,
      menuItems: updatedItems,
    };

    persistTenantState(state.tenantId, nextState);
    set(nextState);
    broadcastMenuChange(state.tenantSlug);
  },

  bulkDeleteMenuItems: async (ids) => {
    const state = get();
    const idSet = new Set(ids);
    try {
      await apiClient.post("/menu/items/bulk-delete", { ids });
    } catch (e) {
      console.warn("Backend bulk delete skipped:", e);
    }

    const updatedItems = state.menuItems.filter((i) => !idSet.has(i.id));
    persistTenantState(state.tenantId, { menuItems: updatedItems });
    set({ menuItems: updatedItems });
    broadcastMenuChange(state.tenantSlug);
  },

  bulkAdjustPrices: async (ids, percentage) => {
    const state = get();
    const idSet = new Set(ids);
    const multiplier = 1 + percentage / 100;

    const updatedItems = state.menuItems.map((item) => {
      if (idSet.has(item.id)) {
        // Round to nearest multiple of 5 for clean restaurant menus
        const newPrice = Math.max(10, Math.round((item.price * multiplier) / 5) * 5);
        return { ...item, price: newPrice };
      }
      return item;
    });

    try {
      await Promise.all(
        updatedItems
          .filter((item) => idSet.has(item.id))
          .map((item) =>
            apiClient.put(`/menu/items/${item.id}`, {
              name: item.name,
              category: item.category,
              price: item.price,
              description: item.desc,
              available: item.available,
              isVeg: item.isVeg,
            })
          )
      );
    } catch (e) {
      console.warn("Backend bulk adjust prices skipped:", e);
    }

    persistTenantState(state.tenantId, { menuItems: updatedItems });
    set({ menuItems: updatedItems });
    broadcastMenuChange(state.tenantSlug);
  },

  addTable: async (tableData) => {
    const state = get();
    const fallbackId = tableData.name.toUpperCase().replace(/\s+/g, "-");
    let createdTable: TableItem = {
      ...tableData,
      id: fallbackId,
    };

    try {
      const res = await apiClient.post("/tables", {
        name: createdTable.name,
        capacity: createdTable.seats,
        seats: createdTable.seats,
        zone: createdTable.zone,
        status: createdTable.status || "available",
      });
      if (res.data?.data?.id || res.data?.data?._id) {
        createdTable.id = res.data.data.id || res.data.data._id;
      }
    } catch (e) {
      console.warn("Backend table save skipped or offline:", e);
    }

    const updatedTables = [...state.tables, createdTable];
    const updatedSteps = state.onboardingSteps.map((s) =>
      s.id === 2 ? { ...s, completed: true } : s
    );

    const nextState = {
      tables: updatedTables,
      onboardingSteps: updatedSteps,
    };

    persistTenantState(state.tenantId, nextState);

    set(nextState);
    return createdTable;
  },

  updateTableStatus: async (id, status) => {
    const state = get();
    try {
      await apiClient.patch(`/tables/${encodeURIComponent(id)}/status`, { status });
    } catch (e) {
      console.warn("Backend table status update failed:", e);
    }

    const updatedTables = state.tables.map((tbl) =>
      tbl.id === id ? { ...tbl, status } : tbl
    );

    persistTenantState(state.tenantId, { tables: updatedTables });

    try {
      if (typeof window !== "undefined") {
        const ch = new BroadcastChannel("dineflow_table_sync");
        ch.postMessage({
          type: "TABLE_STATUS_UPDATED",
          tableId: id,
          status,
          tenantSlug: state.tenantSlug,
          timestamp: Date.now(),
        });
        ch.close();
      }
    } catch {}

    set({ tables: updatedTables });
  },

  fetchTables: async () => {
    if (!useAuthStore.getState().accessToken) return;
    try {
      const res = await apiClient.get("/tables");
      if (res.data?.data && Array.isArray(res.data.data)) {
        const remoteTables: TableItem[] = res.data.data.map((t: any) => ({
          id: t.id || t._id,
          name: t.name || `Table ${t.number}`,
          seats: t.capacity || t.seats || 4,
          zone: t.zone || t.section || "Main Dining",
          status: t.status || "available",
        }));
        const state = get();
        persistTenantState(state.tenantId, { tables: remoteTables });
        set({ tables: remoteTables });
      }
    } catch (e) {
      console.warn("Failed to fetch tables:", e);
    }
  },

  deleteTable: async (id) => {
    const state = get();
    try {
      await apiClient.delete(`/tables/${encodeURIComponent(id)}`);
    } catch (e) {
      console.warn("Backend table delete skipped:", e);
    }

    const updatedTables = state.tables.filter((t) => t.id !== id);

    persistTenantState(state.tenantId, { tables: updatedTables });

    set({ tables: updatedTables });
  },

  addOrder: async (orderData) => {
    const state = get();
    let orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const res = await apiClient.post("/public/orders", {
        tenantSlug: state.tenantSlug,
        tableSlug: orderData.table || "Dine-in",
        tableQRSlug: orderData.table || "Dine-in",
        customerName: orderData.customerName || "Customer",
        customerPhone: orderData.customerPhone || "",
        items: (orderData.items || []).map((it) => {
          const matchedItem = state.menuItems.find(
            (m) => m.name.toLowerCase() === it.name.toLowerCase()
          );
          return {
            menuItemId: matchedItem?.id || it.name,
            quantity: it.qty || 1,
            selectedVariant: it.variant,
            modifierNames: it.modifiers || [],
            notes: it.notes,
          };
        }),
      });
      if (res.data?.data?.orderNumber || res.data?.data?.id) {
        orderId = res.data.data.orderNumber || res.data.data.id;
      }
    } catch (e) {
      console.warn("Backend manual order creation failed:", e);
    }

    const newOrder: KdsOrder = {
      id: orderId,
      table: orderData.table || "Table 01",
      customerName: orderData.customerName || "Customer",
      customerPhone: orderData.customerPhone || "",
      secondsElapsed: 0,
      station: orderData.station || "main_kitchen",
      destination: orderData.destination || "dine_in",
      status: "pending",
      items: orderData.items || [],
      total: orderData.total || 0,
      time: "Just now",
      createdAt: new Date().toISOString(),
    };

    const updatedOrders = [newOrder, ...state.orders];

    // Automatically transition ordered table to occupied
    const targetTableClean = (orderData.table || "").toLowerCase().trim();
    const updatedTables = state.tables.map((tbl) => {
      const tName = tbl.name.toLowerCase().trim();
      const tId = tbl.id.toLowerCase().trim();
      if (
        tId === targetTableClean ||
        tName === targetTableClean ||
        (targetTableClean.replace(/\D/g, "") !== "" &&
          tName === `table ${targetTableClean.replace(/\D/g, "")}`) ||
        (targetTableClean.replace(/\D/g, "") !== "" &&
          tId === `t-${targetTableClean.replace(/\D/g, "")}`)
      ) {
        return { ...tbl, status: "occupied" as const, orderId };
      }
      return tbl;
    });

    try {
      if (typeof window !== "undefined") {
        const ch = new BroadcastChannel("dineflow_table_sync");
        ch.postMessage({
          type: "TABLE_STATUS_UPDATED",
          tableId: orderData.table,
          status: "occupied",
          orderId,
          tenantSlug: state.tenantSlug,
          timestamp: Date.now(),
        });
        ch.close();
      }
    } catch {}

    persistTenantState(state.tenantId, { orders: updatedOrders, tables: updatedTables });

    // Ensure notification center is updated in real-time
    const isRoom = orderData.destination === "room_service" || (orderData.table || "").toLowerCase().includes("suite") || (orderData.table || "").toLowerCase().includes("room");
    apiClient.post("/notifications", {
      category: isRoom ? "room_service" : "orders",
      title: isRoom ? `Room Service Order — #${orderId}` : `New Order Received — #${orderId}`,
      message: `${orderData.table || "Dine-in"} • ${(orderData.items || []).length} item(s) • ₹${orderData.total || 0}`,
      priority: "high",
      actionUrl: isRoom ? "/dashboard/rooms" : "/dashboard/orders",
      metadata: { orderId, table: orderData.table, total: orderData.total },
    }).catch(() => {});

    set({ orders: updatedOrders, tables: updatedTables });
    return newOrder;
  },

  updateOrderStatus: async (id, status, note) => {
    const state = get();
    try {
      await apiClient.patch(`/orders/${encodeURIComponent(id)}/status`, { status, note });
    } catch (e) {
      console.warn("Backend order status update failed:", e);
    }

    const updatedOrders = state.orders.map((o) =>
      o.id === id ? { ...o, status } : o
    );

    // If order is served or cancelled, free up table occupancy
    let updatedTables = state.tables;
    if (status === "served" || status === "cancelled") {
      const order = state.orders.find((o) => o.id === id);
      if (order && order.table) {
        updatedTables = state.tables.map((t) =>
          t.name === order.table || t.id === order.table
            ? { ...t, status: "available" }
            : t
        );
      }
    }

    // Emit notification on status transitions (delivered, paid, cancelled)
    if (status === "served" || status === "cancelled" || status === "paid") {
      const order = state.orders.find((o) => o.id === id);
      const isRoom = order?.destination === "room_service" || (order?.table || "").toLowerCase().includes("suite");
      const cleanId = String(id || "").replace(/^#+/, "").trim();
      const rawTable = (order?.table || "").trim();
      const cleanTable = rawTable
        ? (rawTable.toLowerCase().startsWith("table") ? rawTable : `Table ${rawTable}`)
        : "Table";
      const titleMap: Record<string, string> = {
        served: `Order Delivered — #${cleanId}`,
        cancelled: `Order Cancelled — #${cleanId}`,
        paid: `Payment Received — #${cleanId}`,
      };
      apiClient.post("/notifications", {
        category: status === "paid" ? "payments" : (isRoom ? "room_service" : "orders"),
        title: titleMap[status] || `Order ${status} — #${cleanId}`,
        message: `${cleanTable} order marked as ${status}.`,
        priority: status === "cancelled" ? "high" : "medium",
        actionUrl: isRoom ? "/dashboard/rooms" : "/dashboard/orders",
        metadata: { orderId: cleanId, status },
      }).catch(() => {});
    }

    persistTenantState(state.tenantId, { orders: updatedOrders, tables: updatedTables });

    set({ orders: updatedOrders, tables: updatedTables });
  },

  refreshOrders: async () => {
    try {
      const ordersRes = await apiClient.get("/orders");
      if (ordersRes.data?.data && Array.isArray(ordersRes.data.data)) {
        const remoteOrders: KdsOrder[] = ordersRes.data.data.map((o: any) => ({
          id: o.orderNumber || o.id || o._id,
          table: o.tableName || (o.tableNumber ? `Table ${o.tableNumber}` : o.table || "Dine-in"),
          customerName: o.customerName || "Customer",
          customerPhone: o.customerPhone || "",
          secondsElapsed: (() => {
            if (!o.createdAt) return 60;
            const startMs = new Date(o.createdAt).getTime();
            const isFinished = o.status === "served" || o.status === "paid" || o.status === "cancelled";
            if (isFinished) {
              let endMs = o.updatedAt ? new Date(o.updatedAt).getTime() : startMs;
              if (Array.isArray(o.timeline)) {
                const ev = o.timeline.find((t: any) => t.status === "served" || t.status === "delivered");
                if (ev?.timestamp) endMs = new Date(ev.timestamp).getTime();
              }
              return Math.max(0, Math.floor((endMs - startMs) / 1000));
            }
            return Math.max(0, Math.floor((Date.now() - startMs) / 1000));
          })(),
          station: o.station || "main_kitchen",
          destination: o.destination || "dine_in",
          status: o.status || "pending",
          items: Array.isArray(o.items)
            ? o.items.map((it: any) => ({
                name: it.name,
                qty: it.quantity || it.qty || 1,
                variant: it.selectedVariant,
                modifiers: Array.isArray(it.selectedModifiers)
                  ? it.selectedModifiers.map((m: any) => (typeof m === "string" ? m : m.name))
                  : [],
                notes: it.notes,
              }))
            : [],
          total: o.totalAmount || o.total || 0,
          time: o.createdAt
            ? new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Just now",
        }));

        set({ orders: remoteOrders });
      }
    } catch (e) {
      console.warn("Failed to refresh orders from backend:", e);
    }
  },

  toggleOnboardingStep: (stepId) => {
    const state = get();
    const updated = state.onboardingSteps.map((s) =>
      s.id === stepId ? { ...s, completed: !s.completed } : s
    );

    persistTenantState(state.tenantId, { onboardingSteps: updated });

    set({ onboardingSteps: updated });
  },

  applyStarterTemplate: async (templateKey) => {
    const state = get();
    const template = STARTER_TEMPLATES[templateKey];
    if (!template) return;

    const nextState = {
      categories: [...template.categories],
      menuItems: [...template.menuItems],
      tables: [...template.tables],
      onboardingSteps: state.onboardingSteps.map((s) => {
        if (s.id === 2) return { ...s, completed: template.tables.length > 0 };
        if (s.id === 3) return { ...s, completed: template.menuItems.length > 0 };
        return s;
      }),
    };

    persistTenantState(state.tenantId, nextState);
    set(nextState);
    broadcastMenuChange(state.tenantSlug);

    // Sync template items and categories to backend
    try {
      if (template.menuItems.length > 0) {
        await apiClient.post("/menu/items/bulk", {
          items: template.menuItems.map((ci) => ({
            name: ci.name,
            category: ci.category,
            price: ci.price,
            basePrice: ci.price,
            description: ci.desc,
            desc: ci.desc,
            available: ci.available !== false,
            isAvailable: ci.available !== false,
            isVeg: ci.isVeg,
            imageUrl: ci.imageUrl,
          })),
        });
      }
      for (const cat of template.categories) {
        await apiClient.post("/menu/categories", {
          name: cat,
          isActive: true,
        }).catch(() => {});
      }
    } catch (e) {
      console.warn("Backend starter template sync skipped:", e);
    }
  },

  clearTenantData: () => {
    set({
      tenantId: null,
      tenantName: "The Grand Bistro",
      tenantSlug: "the-grand-bistro",
      isDemoTenant: true,
      categories: [],
      menuItems: [],
      tables: [],
      orders: [],
      onboardingSteps: DEFAULT_ONBOARDING,
      initialized: false,
    });
  },
}));

/**
 * Hook to automatically connect any component to the active tenant's isolated data.
 */
export function useTenantData() {
  const { tenant, user, isAuthenticated } = useAuthStore();
  const store = useTenantDataStore();

  React.useEffect(() => {
    store.initializeTenant(tenant, user);
  }, [tenant?.id, user?.id]);

  return {
    ...store,
    tenant,
    user,
    isAuthenticated,
  };
}

