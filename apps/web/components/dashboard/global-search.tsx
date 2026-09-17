"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Loader2,
  Utensils,
  Receipt,
  Bed,
  User,
  Table as TableIcon,
  Shield,
  Tag,
  ArrowRight,
  Sparkles,
  Clock,
  SlidersHorizontal,
  History,
  Plus,
  Hotel,
  RotateCcw,
  FolderPlus,
  Bell,
  CreditCard,
  Calendar,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useTenantData } from "@/lib/stores/tenant-data-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: "menu" | "orders" | "rooms" | "customers" | "tables" | "staff" | "categories";
  badge?: string;
  actionUrl: string;
  icon?: string;
  metadata?: Record<string, unknown>;
}

export interface SearchResultsGrouped {
  menu: SearchResultItem[];
  orders: SearchResultItem[];
  rooms: SearchResultItem[];
  customers: SearchResultItem[];
  tables: SearchResultItem[];
  staff: SearchResultItem[];
  categories: SearchResultItem[];
}

interface RecentSearchItem {
  id: string;
  query: string;
  category?: string;
  timestamp: number;
}

interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ElementType;
  actionUrl: string;
  color: string;
  bg: string;
}

const FILTER_CHIPS = [
  { id: "all", label: "All" },
  { id: "orders", label: "Orders" },
  { id: "menu", label: "Menu" },
  { id: "tables", label: "Tables" },
  { id: "rooms", label: "Rooms" },
  { id: "guests", label: "Guests" },
  { id: "reservations", label: "Reservations" },
  { id: "customers", label: "Customers" },
  { id: "staff", label: "Staff" },
  { id: "payments", label: "Payments" },
  { id: "notifications", label: "Notifications" },
] as const;

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: "qa-create-order",
    title: "Create Order",
    description: "Place manual ticket for table or suite",
    category: "orders",
    icon: Plus,
    actionUrl: "/dashboard/orders",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
  },
  {
    id: "qa-add-item",
    title: "Add Menu Item",
    description: "Publish dish, drink or chef special",
    category: "menu",
    icon: Utensils,
    actionUrl: "/dashboard/menu",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
  },
  {
    id: "qa-add-table",
    title: "Add Dining Table",
    description: "Configure seats, zone, and QR stands",
    category: "tables",
    icon: TableIcon,
    actionUrl: "/dashboard/tables",
    color: "text-slate-600 dark:text-slate-300",
    bg: "bg-slate-500/10 dark:bg-slate-500/20",
  },
  {
    id: "qa-check-in",
    title: "Check In Guest",
    description: "Assign room, ID verification, and folio",
    category: "rooms",
    icon: Bed,
    actionUrl: "/dashboard/rooms",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
  },
  {
    id: "qa-today-orders",
    title: "Live KDS Tickets",
    description: "Monitor real-time kitchen orders",
    category: "orders",
    icon: Receipt,
    actionUrl: "/dashboard/orders",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
  },
  {
    id: "qa-manage-menu",
    title: "Menu Management",
    description: "Manage categories, prices & discounts",
    category: "menu",
    icon: FolderPlus,
    actionUrl: "/dashboard/menu",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
  },
  {
    id: "qa-guest-rooms",
    title: "Rooms & Suites (PMS)",
    description: "Hotel directory and guest stays",
    category: "rooms",
    icon: Hotel,
    actionUrl: "/dashboard/rooms",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
  },
  {
    id: "qa-staff",
    title: "Staff & Permissions",
    description: "Team roles, waitstaff & cashiers",
    category: "staff",
    icon: Shield,
    actionUrl: "/dashboard/staff",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
  },
  {
    id: "qa-notifications",
    title: "Notification Center",
    description: "Real-time alerts, room service & orders",
    category: "notifications",
    icon: Bell,
    actionUrl: "/dashboard/notifications",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10 dark:bg-sky-500/20",
  },
  {
    id: "qa-payments",
    title: "Subscription & Billing",
    description: "Invoices, payment history and plan",
    category: "payments",
    icon: CreditCard,
    actionUrl: "/dashboard/settings?tab=billing",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10 dark:bg-purple-500/20",
  },
];

const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  menu: {
    label: "Menu Items",
    icon: Utensils,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
  },
  orders: {
    label: "Live Orders",
    icon: Receipt,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
  },
  rooms: {
    label: "Guest Rooms & Suites",
    icon: Bed,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
  },
  customers: {
    label: "Customers & Guests",
    icon: User,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10 dark:bg-sky-500/20",
  },
  tables: {
    label: "Dining Tables",
    icon: TableIcon,
    color: "text-slate-600 dark:text-slate-300",
    bg: "bg-slate-500/10 dark:bg-slate-500/20",
  },
  staff: {
    label: "Staff & Team",
    icon: Shield,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
  },
  categories: {
    label: "Menu Categories",
    icon: Tag,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10 dark:bg-purple-500/20",
  },
};

/**
 * Helper component that renders text with matching search query highlighted.
 */
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query || !query.trim() || !text) {
    return <span className="truncate">{text}</span>;
  }
  const cleanQ = query.trim();
  const escaped = cleanQ.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return (
    <span className="truncate">
      {parts.map((part, i) =>
        part.toLowerCase() === cleanQ.toLowerCase() ? (
          <mark
            key={i}
            className="bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 font-bold px-0.5 rounded-xs"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

export function GlobalSearch() {
  const router = useRouter();
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const { tenant, user } = useAuthStore();
  const { menuItems, orders, tables, categories } = useTenantData();

  // State
  const [query, setQuery] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);
  const [activeChip, setActiveChip] = React.useState<string>("all");

  // Advanced Filters State
  const [isFilterPanelOpen, setIsFilterPanelOpen] = React.useState(false);
  const [filterDate, setFilterDate] = React.useState<string>("all");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [filterType, setFilterType] = React.useState<string>("all");
  const [filterPrice, setFilterPrice] = React.useState<string>("default");
  const [filterRoom, setFilterRoom] = React.useState<string>("all");

  // Recent searches per user & tenant
  const [recentSearches, setRecentSearches] = React.useState<RecentSearchItem[]>([]);

  // Search Results
  const [groupedResults, setGroupedResults] = React.useState<SearchResultsGrouped>({
    menu: [],
    orders: [],
    rooms: [],
    customers: [],
    tables: [],
    staff: [],
    categories: [],
  });

  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Storage key for user/tenant scoped recent searches
  const recentStorageKey = React.useMemo(() => {
    const tId = tenant?.id || "default";
    const uId = user?.id || "anonymous";
    return `dineflow_recent_searches_v2_${tId}_${uId}`;
  }, [tenant?.id, user?.id]);

  // Load recent searches on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(recentStorageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setRecentSearches(parsed.slice(0, 5));
          }
        }
      } catch (e) {
        console.warn("Could not load recent searches:", e);
      }
    }
  }, [recentStorageKey]);

  // Save recent search
  const saveRecentSearch = React.useCallback(
    (searchTerm: string, category?: string) => {
      const trimmed = searchTerm.trim();
      if (!trimmed) return;

      setRecentSearches((prev) => {
        const filtered = prev.filter(
          (item) => item.query.toLowerCase() !== trimmed.toLowerCase()
        );
        const updated: RecentSearchItem[] = [
          {
            id: `rc_${Date.now()}`,
            query: trimmed,
            category: category || activeChip !== "all" ? activeChip : undefined,
            timestamp: Date.now(),
          },
          ...filtered,
        ].slice(0, 5);

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(recentStorageKey, JSON.stringify(updated));
          } catch (e) {
            console.warn("Could not save recent search:", e);
          }
        }
        return updated;
      });
    },
    [recentStorageKey, activeChip]
  );

  const removeRecentSearch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(recentStorageKey, JSON.stringify(updated));
        } catch (err) {
          console.warn("Could not remove recent search:", err);
        }
      }
      return updated;
    });
  };

  const clearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(recentStorageKey);
      } catch (err) {
        console.warn("Could not clear recent searches:", err);
      }
    }
  };

  // Count active advanced filters
  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (filterDate !== "all") count++;
    if (filterStatus !== "all") count++;
    if (filterType !== "all") count++;
    if (filterPrice !== "default") count++;
    if (filterRoom !== "all") count++;
    return count;
  }, [filterDate, filterStatus, filterType, filterPrice, filterRoom]);

  const resetAllFilters = () => {
    setActiveChip("all");
    setFilterDate("all");
    setFilterStatus("all");
    setFilterType("all");
    setFilterPrice("default");
    setFilterRoom("all");
  };

  // Global Cmd+K / Ctrl+K shortcut listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setMobileSearchOpen(true);
        setTimeout(() => {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        }, 50);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to dismiss dropdown
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter quick actions based on active chip
  const filteredQuickActions = React.useMemo(() => {
    if (activeChip === "all") return QUICK_ACTIONS;
    if (activeChip === "orders" || activeChip === "payments") {
      return QUICK_ACTIONS.filter(
        (qa) => qa.category === "orders" || qa.category === "payments"
      );
    }
    if (activeChip === "menu") {
      return QUICK_ACTIONS.filter((qa) => qa.category === "menu");
    }
    if (activeChip === "rooms" || activeChip === "guests" || activeChip === "reservations") {
      return QUICK_ACTIONS.filter((qa) => qa.category === "rooms");
    }
    if (activeChip === "tables") {
      return QUICK_ACTIONS.filter((qa) => qa.category === "tables");
    }
    if (activeChip === "staff") {
      return QUICK_ACTIONS.filter((qa) => qa.category === "staff");
    }
    if (activeChip === "notifications") {
      return QUICK_ACTIONS.filter((qa) => qa.category === "notifications");
    }
    return QUICK_ACTIONS;
  }, [activeChip]);

  // Compute flattened list of items for keyboard navigation
  const flattenedItems = React.useMemo(() => {
    if (!query.trim()) {
      // Return recent searches + quick actions
      const list: Array<
        | { type: "recent"; item: RecentSearchItem }
        | { type: "action"; item: QuickActionItem }
      > = [];
      for (const r of recentSearches) {
        list.push({ type: "recent", item: r });
      }
      for (const qa of filteredQuickActions) {
        list.push({ type: "action", item: qa });
      }
      return list;
    }

    // When query is present: flattened list of search result items
    const list: Array<{ type: "result"; item: SearchResultItem }> = [];
    const keys: (keyof SearchResultsGrouped)[] = [
      "menu",
      "orders",
      "rooms",
      "customers",
      "tables",
      "staff",
      "categories",
    ];

    for (const key of keys) {
      if (activeChip !== "all") {
        if (activeChip === "menu" && key !== "menu" && key !== "categories") continue;
        if (activeChip === "orders" && key !== "orders") continue;
        if (activeChip === "tables" && key !== "tables") continue;
        if (
          (activeChip === "rooms" || activeChip === "guests" || activeChip === "reservations") &&
          key !== "rooms" &&
          key !== "customers"
        )
          continue;
        if (activeChip === "staff" && key !== "staff") continue;
      }
      if (groupedResults[key]?.length > 0) {
        for (const item of groupedResults[key]) {
          list.push({ type: "result", item });
        }
      }
    }
    return list;
  }, [query, recentSearches, filteredQuickActions, groupedResults, activeChip]);

  const totalResultsCount = flattenedItems.filter((i) => i.type === "result").length;

  // Local synchronous search matcher for immediate zero-latency feedback
  const performLocalSearch = React.useCallback(
    (q: string): SearchResultsGrouped => {
      const clean = q.trim().toLowerCase();
      if (clean.length < 1) {
        return {
          menu: [],
          orders: [],
          rooms: [],
          customers: [],
          tables: [],
          staff: [],
          categories: [],
        };
      }

      const cleanNum = clean.replace(/^#/, "");

      // 1. Menu
      const matchedMenu = menuItems
        .filter((m) => {
          if (filterType === "veg" && !m.isVeg) return false;
          if (filterType === "non_veg" && m.isVeg) return false;
          return (
            m.name.toLowerCase().includes(clean) ||
            m.category.toLowerCase().includes(clean) ||
            (m.desc && m.desc.toLowerCase().includes(clean))
          );
        })
        .sort((a, b) => {
          if (filterPrice === "price_asc") return a.price - b.price;
          if (filterPrice === "price_desc") return b.price - a.price;
          return 0;
        })
        .slice(0, 5)
        .map(
          (m): SearchResultItem => ({
            id: m.id,
            title: m.name,
            subtitle: `${m.category} • ${m.isVeg ? "Veg" : "Non-Veg"} • ${m.available ? "Available" : "Sold Out"}`,
            category: "menu",
            badge: `₹${m.price}`,
            actionUrl: `/dashboard/menu?search=${encodeURIComponent(m.name)}`,
            icon: "utensils",
          })
        );

      // 2. Orders
      const matchedOrders = orders
        .filter((o) => {
          if (filterStatus !== "all" && o.status !== filterStatus) return false;
          return (
            o.id.toLowerCase().includes(cleanNum) ||
            (o.customerName && o.customerName.toLowerCase().includes(clean)) ||
            (o.customerPhone && o.customerPhone.includes(clean)) ||
            (o.table && o.table.toLowerCase().includes(clean)) ||
            (o.status && o.status.toLowerCase().includes(clean))
          );
        })
        .slice(0, 5)
        .map(
          (o): SearchResultItem => ({
            id: o.id,
            title: `#${o.id.replace(/^#/, "")}`,
            subtitle: `${o.table || "Dine-in"} • ${o.customerName || "Guest"} • ₹${o.total}`,
            category: "orders",
            badge: o.status?.toUpperCase() || "PENDING",
            actionUrl: `/dashboard/orders?search=${encodeURIComponent(o.id.replace(/^#/, ""))}`,
            icon: "receipt",
          })
        );

      // 3. Tables
      const matchedTables = tables
        .filter((t) => {
          if (filterStatus !== "all" && t.status !== filterStatus) return false;
          return (
            t.name.toLowerCase().includes(clean) ||
            (t.zone && t.zone.toLowerCase().includes(clean))
          );
        })
        .slice(0, 5)
        .map(
          (t): SearchResultItem => ({
            id: t.id,
            title: t.name,
            subtitle: `${t.zone || "Main Dining"} • ${t.seats} Seats`,
            category: "tables",
            badge: t.status?.toUpperCase() || "AVAILABLE",
            actionUrl: `/dashboard/tables?search=${encodeURIComponent(t.name)}`,
            icon: "table",
          })
        );

      // 4. Categories
      const matchedCats = categories
        .filter((c) => c.toLowerCase().includes(clean))
        .slice(0, 5)
        .map(
          (c): SearchResultItem => ({
            id: `cat-${c}`,
            title: c,
            subtitle: "Menu Category",
            category: "categories",
            badge: "Category",
            actionUrl: `/dashboard/menu?category=${encodeURIComponent(c)}`,
            icon: "tag",
          })
        );

      return {
        menu: matchedMenu,
        orders: matchedOrders,
        rooms: [],
        customers: [],
        tables: matchedTables,
        staff: [],
        categories: matchedCats,
      };
    },
    [menuItems, orders, tables, categories, filterType, filterPrice, filterStatus]
  );

  // Debounced search query dispatcher with AbortController
  React.useEffect(() => {
    const clean = query.trim();
    if (!clean) {
      setGroupedResults({
        menu: [],
        orders: [],
        rooms: [],
        customers: [],
        tables: [],
        staff: [],
        categories: [],
      });
      setIsLoading(false);
      return;
    }

    // Immediately run local search so user sees matches with 0 delay
    const local = performLocalSearch(clean);
    setGroupedResults(local);
    setSelectedIndex(0);

    setIsLoading(true);
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const searchParams = new URLSearchParams({
          q: clean,
          category: activeChip !== "all" ? activeChip : "",
          status: filterStatus !== "all" ? filterStatus : "",
          type: filterType !== "all" ? filterType : "",
          date: filterDate !== "all" ? filterDate : "",
          sort: filterPrice !== "default" ? filterPrice : "",
        });

        const res = await apiClient.get(`/search?${searchParams.toString()}`, {
          signal: controller.signal,
        });

        if (res.data?.data?.results) {
          const apiResults = res.data.data.results as SearchResultsGrouped;

          // Merge API results with local results (deduplicate by id)
          const mergeGroup = (
            apiList: SearchResultItem[] = [],
            localList: SearchResultItem[] = []
          ) => {
            const seen = new Set<string>();
            const combined: SearchResultItem[] = [];
            for (const itm of apiList) {
              if (itm.id && !seen.has(itm.id)) {
                seen.add(itm.id);
                combined.push(itm);
              }
            }
            for (const itm of localList) {
              if (itm.id && !seen.has(itm.id)) {
                seen.add(itm.id);
                combined.push(itm);
              }
            }
            return combined.slice(0, 5);
          };

          setGroupedResults({
            menu: mergeGroup(apiResults.menu, local.menu),
            orders: mergeGroup(apiResults.orders, local.orders),
            rooms: apiResults.rooms || [],
            customers: apiResults.customers || [],
            tables: mergeGroup(apiResults.tables, local.tables),
            staff: apiResults.staff || [],
            categories: mergeGroup(apiResults.categories, local.categories),
          });
        }
      } catch (err: unknown) {
        if (
          (err as { name?: string })?.name !== "CanceledError" &&
          (err as { code?: string })?.code !== "ERR_CANCELED"
        ) {
          console.warn("Global search backend fetch fallback to local:", err);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    query,
    activeChip,
    filterStatus,
    filterType,
    filterDate,
    filterPrice,
    performLocalSearch,
  ]);

  const handleSelectResult = (item: SearchResultItem) => {
    saveRecentSearch(item.title, item.category);
    setIsOpen(false);
    setMobileSearchOpen(false);
    setQuery("");
    router.push(item.actionUrl);
  };

  const handleSelectQuickAction = (qa: QuickActionItem) => {
    setIsOpen(false);
    setMobileSearchOpen(false);
    setQuery("");
    router.push(qa.actionUrl);
  };

  const handleSelectRecentSearch = (item: RecentSearchItem) => {
    setQuery(item.query);
    if (item.category && item.category !== "all") {
      setActiveChip(item.category);
    }
    setIsOpen(true);
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (flattenedItems.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % flattenedItems.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (flattenedItems.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + flattenedItems.length) % flattenedItems.length);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flattenedItems.length > 0 && flattenedItems[selectedIndex]) {
        const selected = flattenedItems[selectedIndex];
        if (selected.type === "result") {
          handleSelectResult(selected.item);
        } else if (selected.type === "recent") {
          handleSelectRecentSearch(selected.item);
        } else if (selected.type === "action") {
          handleSelectQuickAction(selected.item);
        }
      } else if (query.trim()) {
        saveRecentSearch(query.trim());
        router.push(`/dashboard/menu?search=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
        setMobileSearchOpen(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setMobileSearchOpen(false);
      setIsFilterPanelOpen(false);
      searchInputRef.current?.blur();
    }
  };

  let cumulativeIndex = 0;

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Mobile / Tablet search trigger button */}
      <button
        onClick={() => {
          setMobileSearchOpen(true);
          setIsOpen(true);
          setTimeout(() => searchInputRef.current?.focus(), 50);
        }}
        className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
        aria-label="Open global search"
        title="Search (⌘K)"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Desktop Search Input Form */}
      <div className="hidden lg:flex items-center w-72 xl:w-80">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              setIsOpen(true);
            }}
            onClick={() => {
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search orders, rooms, menu... (⌘K)"
            className="w-full pl-9 pr-14 py-1.5 text-xs bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            aria-expanded={isOpen}
            aria-autocomplete="list"
          />

          <div className="absolute right-2.5 top-2 flex items-center gap-1">
            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
                setIsFilterPanelOpen((prev) => !prev);
              }}
              title="Advanced Filters"
              className={cn(
                "p-1 rounded-md transition-colors cursor-pointer relative",
                isFilterPanelOpen || activeFiltersCount > 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500 pointer-events-none" />
            ) : query ? (
              <button
                onClick={() => {
                  setQuery("");
                  searchInputRef.current?.focus();
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile Search Modal Overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/60 backdrop-blur-sm flex flex-col p-3 sm:p-4">
          <div className="bg-white dark:bg-[#0B0F19] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <Search className="h-4 w-4 text-emerald-500 shrink-0" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search orders, rooms, menu, guests..."
                className="flex-1 text-sm bg-transparent border-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
              />

              <button
                type="button"
                onClick={() => setIsFilterPanelOpen((prev) => !prev)}
                className={cn(
                  "p-1.5 rounded-lg border text-xs flex items-center gap-1",
                  isFilterPanelOpen || activeFiltersCount > 0
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-slate-200 dark:border-slate-800 text-slate-500"
                )}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {activeFiltersCount > 0 && <span>({activeFiltersCount})</span>}
              </button>

              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />}

              <button
                onClick={() => {
                  setMobileSearchOpen(false);
                  setIsOpen(false);
                  setIsFilterPanelOpen(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Chips Bar */}
            {renderFilterChips()}

            {/* Advanced Filters Panel */}
            {isFilterPanelOpen && renderAdvancedFilterPanel()}

            <div className="overflow-y-auto flex-1 p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
              {renderDropdownContent()}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Dropdown Popover */}
      {isOpen && !mobileSearchOpen && (
        <div className="hidden lg:block absolute left-0 top-full mt-2 w-[520px] xl:w-[560px] max-w-[calc(100vw-2rem)] bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Filter Chips Bar */}
          {renderFilterChips()}

          {/* Advanced Filters Panel */}
          {isFilterPanelOpen && renderAdvancedFilterPanel()}

          <div className="max-h-[65vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
            {renderDropdownContent()}
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#090D16]/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                {query.trim()
                  ? `${totalResultsCount} result${totalResultsCount === 1 ? "" : "s"} found`
                  : `${filteredQuickActions.length} quick action${filteredQuickActions.length === 1 ? "" : "s"}`}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-[10px] font-mono">
                  ↑↓
                </kbd>{" "}
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-[10px] font-mono">
                  ↵
                </kbd>{" "}
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-[10px] font-mono">
                  esc
                </kbd>{" "}
                close
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function renderFilterChips() {
    return (
      <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
        {FILTER_CHIPS.map((chip) => {
          const isActive = activeChip === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setActiveChip(chip.id)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer",
                isActive
                  ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    );
  }

  function renderAdvancedFilterPanel() {
    return (
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/80 text-xs space-y-3 shrink-0 animate-in slide-in-from-top-2 duration-150">
        <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 text-xs">
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" />
            Advanced Filter Controls
          </span>
          <button
            type="button"
            onClick={resetAllFilters}
            className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
          >
            <RotateCcw className="w-3 h-3" />
            Reset all
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="delivered">Delivered / Served</option>
              <option value="occupied">Occupied</option>
              <option value="vacant">Vacant</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">
              Dietary / Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Items</option>
              <option value="veg">Pure Veg</option>
              <option value="non_veg">Non-Veg</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">
              Date
            </label>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Price Sort Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">
              Price Sort
            </label>
            <select
              value={filterPrice}
              onChange={(e) => setFilterPrice(e.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="default">Default</option>
              <option value="price_asc">Low to High</option>
              <option value="price_desc">High to Low</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  function renderDropdownContent() {
    // ── EMPTY QUERY: Show Recent Searches & Quick Access ───────────────────────
    if (!query.trim()) {
      return (
        <div className="space-y-4 py-1">
          {/* Phase 3: Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-1.5">
              <div className="px-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  Recent Searches
                </span>
                <button
                  type="button"
                  onClick={clearAllRecentSearches}
                  className="text-[10px] text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 font-semibold cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-0.5">
                {recentSearches.map((item) => {
                  const itemIndex = cumulativeIndex++;
                  const isSelected = itemIndex === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectRecentSearch(item)}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={cn(
                        "group px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer",
                        isSelected
                          ? "bg-emerald-500/10 dark:bg-emerald-500/15 text-slate-900 dark:text-white ring-1 ring-emerald-500/30"
                          : "hover:bg-slate-100/70 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-medium">{item.query}</span>
                        {item.category && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 capitalize">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => removeRecentSearch(item.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded-md transition-opacity"
                        title="Remove from history"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Phase 4: Quick Access Actions */}
          <div className="space-y-1.5">
            <div className="px-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                Quick Actions
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                {filteredQuickActions.length} actions
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {filteredQuickActions.map((qa) => {
                const itemIndex = cumulativeIndex++;
                const isSelected = itemIndex === selectedIndex;
                const Icon = qa.icon;
                return (
                  <button
                    key={qa.id}
                    type="button"
                    onClick={() => handleSelectQuickAction(qa)}
                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                    className={cn(
                      "text-left p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer",
                      isSelected
                        ? "border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-500/15 ring-1 ring-emerald-500/30 shadow-xs"
                        : "border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/60 bg-white dark:bg-[#0A0E18]"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        qa.bg,
                        qa.color
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {qa.title}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {qa.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // ── ACTIVE QUERY: Show Search Results or Empty State ──────────────────────
    if (totalResultsCount === 0 && !isLoading) {
      return (
        <div className="py-10 px-6 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No matches found for &ldquo;{query}&rdquo;
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Try searching food dishes, order numbers, room numbers, or clearing active filters.
          </p>
          {(activeChip !== "all" || activeFiltersCount > 0) && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-500/20 transition-colors cursor-pointer"
            >
              Reset Filters & Chips
            </button>
          )}
        </div>
      );
    }

    const categoriesList: (keyof SearchResultsGrouped)[] = [
      "menu",
      "orders",
      "rooms",
      "customers",
      "tables",
      "staff",
      "categories",
    ];

    return (
      <div className="space-y-2 py-1">
        {categoriesList.map((catKey) => {
          // Check active chip filter
          if (activeChip !== "all") {
            if (activeChip === "menu" && catKey !== "menu" && catKey !== "categories") return null;
            if (activeChip === "orders" && catKey !== "orders") return null;
            if (activeChip === "tables" && catKey !== "tables") return null;
            if (
              (activeChip === "rooms" || activeChip === "guests" || activeChip === "reservations") &&
              catKey !== "rooms" &&
              catKey !== "customers"
            )
              return null;
            if (activeChip === "staff" && catKey !== "staff") return null;
          }

          const items = groupedResults[catKey];
          if (!items || items.length === 0) return null;

          const config = CATEGORY_CONFIG[catKey] || {
            label: catKey,
            icon: Tag,
            color: "text-slate-500",
            bg: "bg-slate-500/10",
          };
          const Icon = config.icon;

          return (
            <div key={catKey} className="py-1">
              <div className="px-3 py-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  {config.label}
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {items.length}
                </span>
              </div>

              <div className="mt-1 space-y-0.5">
                {items.map((item) => {
                  const itemIndex = cumulativeIndex++;
                  const isSelected = itemIndex === selectedIndex;

                  return (
                    <button
                      key={`${catKey}-${item.id}`}
                      type="button"
                      onClick={() => handleSelectResult(item)}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-xl flex items-center justify-between gap-3 transition-colors cursor-pointer group",
                        isSelected
                          ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-slate-900 dark:text-white ring-1 ring-emerald-500/30 shadow-xs"
                          : "hover:bg-slate-100/70 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            config.bg,
                            config.color
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            <HighlightMatch text={item.title} query={query} />
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            <HighlightMatch text={item.subtitle} query={query} />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.badge && (
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                              isSelected
                                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                                : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                        <ArrowRight
                          className={cn(
                            "w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5",
                            isSelected
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-slate-300 dark:text-slate-600"
                          )}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
