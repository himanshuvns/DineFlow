import * as React from "react";
import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { useAuthStore, Tenant, User } from "./auth-store";

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
}

export interface TableItem {
  id: string;
  name: string;
  seats: number;
  zone: string;
  status: "occupied" | "available" | "reserved";
  orderId?: string;
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
  status: "pending" | "preparing" | "ready" | "served";
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
  { id: 1, title: "Register Business & Workspace", completed: true },
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
  addMenuItem: (item: Omit<MenuItem, "id">) => Promise<MenuItem>;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  addTable: (table: Omit<TableItem, "id">) => Promise<TableItem>;
  updateTableStatus: (id: string, status: TableItem["status"]) => Promise<void>;
  deleteTable: (id: string) => Promise<void>;
  addOrder: (order: Partial<KdsOrder>) => Promise<KdsOrder>;
  updateOrderStatus: (id: string, status: KdsOrder["status"]) => Promise<void>;
  toggleOnboardingStep: (id: number) => void;
  applyStarterTemplate: (templateKey: keyof typeof STARTER_TEMPLATES) => void;
  clearTenantData: () => void;
}

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
    const merged = {
      categories: Array.isArray(data.categories)
        ? data.categories
        : Array.isArray(existing.categories)
        ? existing.categories
        : [],
      menuItems: Array.isArray(data.menuItems)
        ? data.menuItems
        : Array.isArray(existing.menuItems)
        ? existing.menuItems
        : [],
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
  tenantName: "Your Restaurant",
  tenantSlug: "restaurant",
  isDemoTenant: false,
  categories: [],
  menuItems: [],
  tables: [],
  orders: [],
  onboardingSteps: DEFAULT_ONBOARDING,
  isLoading: false,
  initialized: false,

  initializeTenant: async (tenant: Tenant | null, user: User | null) => {
    const tenantId = tenant?.id || "demo-tenant";
    const tenantName = tenant?.name || "Your Restaurant";
    const tenantSlug = tenant?.slug || "dineflow";
    const isDemoTenant =
      !tenant ||
      tenantId === "demo-tenant" ||
      user?.phone === "+91 98765 43210" ||
      tenantName.toLowerCase().includes("grand bistro");

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
      set({
        categories: Array.isArray(cachedData.categories) ? cachedData.categories : [],
        menuItems: Array.isArray(cachedData.menuItems) ? cachedData.menuItems : [],
        tables: Array.isArray(cachedData.tables) ? cachedData.tables : [],
        orders: Array.isArray(cachedData.orders) ? cachedData.orders : [],
        onboardingSteps: Array.isArray(cachedData.onboardingSteps)
          ? cachedData.onboardingSteps
          : DEFAULT_ONBOARDING,
        isLoading: false,
        initialized: true,
      });
      return;
    }

    // Try to fetch from backend API if user is authenticated
    try {
      const [itemsRes, tablesRes, ordersRes] = await Promise.allSettled([
        apiClient.get("/menu/items"),
        apiClient.get("/tables"),
        apiClient.get("/orders"),
      ]);

      let remoteItems: MenuItem[] = [];
      let remoteCategories: string[] = [];
      let remoteTables: TableItem[] = [];
      let remoteOrders: KdsOrder[] = [];

      if (itemsRes.status === "fulfilled" && itemsRes.value.data?.data) {
        const items = itemsRes.value.data.data;
        if (Array.isArray(items) && items.length > 0) {
          remoteItems = items.map((i: any) => ({
            id: i.id || i._id,
            name: i.name,
            category: i.category || "General",
            price: i.price,
            available: i.available !== false,
            isVeg: i.isVeg ?? true,
            desc: i.description || i.desc || "",
            imageUrl: i.imageUrl || i.image,
          }));
          remoteCategories = Array.from(new Set(remoteItems.map((i) => i.category)));
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
        if (Array.isArray(ords) && ords.length > 0) {
          remoteOrders = ords.map((o: any) => ({
            id: o.orderNumber || o.id || o._id,
            table: o.tableNumber ? `Table ${o.tableNumber}` : o.table || "Dine-in",
            customerName: o.customerName || "Customer",
            customerPhone: o.customerPhone || "",
            secondsElapsed: 120,
            station: "main_kitchen",
            destination: "dine_in",
            status: o.status || "pending",
            items: o.items || [],
            total: o.totalAmount || o.total || 0,
            time: "Just now",
          }));
        }
      }

      // If backend returned data, use it!
      if (remoteItems.length > 0 || remoteTables.length > 0 || remoteOrders.length > 0) {
        const finalCategories = remoteCategories.length > 0 ? remoteCategories : ["General"];
        const stateToSave = {
          categories: finalCategories,
          menuItems: remoteItems,
          tables: remoteTables,
          orders: remoteOrders,
          onboardingSteps: DEFAULT_ONBOARDING.map((s) => {
            if (s.id === 2) return { ...s, completed: remoteTables.length > 0 };
            if (s.id === 3) return { ...s, completed: remoteItems.length > 0 };
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

  addMenuItem: async (newItemData) => {
    const state = get();
    const id = `itm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const createdItem: MenuItem = {
      ...newItemData,
      id,
    };

    // Try posting to API
    try {
      await apiClient.post("/menu/items", {
        name: createdItem.name,
        category: createdItem.category,
        price: createdItem.price,
        description: createdItem.desc,
        isVeg: createdItem.isVeg,
      });
    } catch (e) {
      console.warn("Backend save skipped or offline:", e);
    }

    const updatedCategories = state.categories.includes(createdItem.category)
      ? state.categories
      : [...state.categories, createdItem.category];

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
    return createdItem;
  },

  updateMenuItem: async (id, updates) => {
    const state = get();
    const updatedItems = state.menuItems.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );

    persistTenantState(state.tenantId, { menuItems: updatedItems });

    set({ menuItems: updatedItems });
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
  },

  addTable: async (tableData) => {
    const state = get();
    const id = tableData.name.toUpperCase().replace(/\s+/g, "-");
    const createdTable: TableItem = {
      ...tableData,
      id,
    };

    try {
      await apiClient.post("/tables", {
        name: createdTable.name,
        capacity: createdTable.seats,
        zone: createdTable.zone,
      });
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
    const updatedTables = state.tables.map((tbl) =>
      tbl.id === id ? { ...tbl, status } : tbl
    );

    persistTenantState(state.tenantId, { tables: updatedTables });

    set({ tables: updatedTables });
  },

  deleteTable: async (id) => {
    const state = get();
    try {
      await apiClient.delete(`/tables/${id}`);
    } catch (e) {
      console.warn("Backend table delete skipped:", e);
    }

    const updatedTables = state.tables.filter((t) => t.id !== id);

    persistTenantState(state.tenantId, { tables: updatedTables });

    set({ tables: updatedTables });
  },

  addOrder: async (orderData) => {
    const state = get();
    const id = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: KdsOrder = {
      id,
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

    persistTenantState(state.tenantId, { orders: updatedOrders });

    set({ orders: updatedOrders });
    return newOrder;
  },

  updateOrderStatus: async (id, status) => {
    const state = get();
    const updatedOrders = state.orders.map((o) =>
      o.id === id ? { ...o, status } : o
    );

    persistTenantState(state.tenantId, { orders: updatedOrders });

    set({ orders: updatedOrders });
  },

  toggleOnboardingStep: (stepId) => {
    const state = get();
    const updated = state.onboardingSteps.map((s) =>
      s.id === stepId ? { ...s, completed: !s.completed } : s
    );

    persistTenantState(state.tenantId, { onboardingSteps: updated });

    set({ onboardingSteps: updated });
  },

  applyStarterTemplate: (templateKey) => {
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
  },

  clearTenantData: () => {
    set({
      tenantId: null,
      tenantName: "Your Restaurant",
      tenantSlug: "restaurant",
      isDemoTenant: false,
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

