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
  CornerDownLeft,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useTenantData } from "@/lib/stores/tenant-data-store";
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

export function GlobalSearch() {
  const router = useRouter();
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const [query, setQuery] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);

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

  // In-memory store data for instant local search enhancement
  const { menuItems, orders, tables, categories } = useTenantData();

  // Global Cmd+K / Ctrl+K shortcut listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
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

  // Compute flattened list of results for keyboard navigation
  const flattenedResults = React.useMemo(() => {
    const list: SearchResultItem[] = [];
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
      if (groupedResults[key]?.length > 0) {
        list.push(...groupedResults[key]);
      }
    }
    return list;
  }, [groupedResults]);

  const totalResultsCount = flattenedResults.length;

  // Local synchronous search matcher for immediate zero-latency feedback
  const performLocalSearch = React.useCallback(
    (q: string): SearchResultsGrouped => {
      const clean = q.trim().toLowerCase();
      if (clean.length < 2) {
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
        .filter(
          (m) =>
            m.name.toLowerCase().includes(clean) ||
            m.category.toLowerCase().includes(clean) ||
            (m.desc && m.desc.toLowerCase().includes(clean))
        )
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
        .filter(
          (o) =>
            o.id.toLowerCase().includes(cleanNum) ||
            (o.customerName && o.customerName.toLowerCase().includes(clean)) ||
            (o.customerPhone && o.customerPhone.includes(clean)) ||
            (o.table && o.table.toLowerCase().includes(clean)) ||
            (o.status && o.status.toLowerCase().includes(clean))
        )
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
        .filter(
          (t) =>
            t.name.toLowerCase().includes(clean) ||
            (t.zone && t.zone.toLowerCase().includes(clean))
        )
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
    [menuItems, orders, tables, categories]
  );

  // Debounced search query dispatcher with AbortController
  React.useEffect(() => {
    const clean = query.trim();
    if (clean.length < 2) {
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
        const res = await apiClient.get(`/search?q=${encodeURIComponent(clean)}`, {
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
        if ((err as { name?: string })?.name !== "CanceledError" && (err as { code?: string })?.code !== "ERR_CANCELED") {
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
  }, [query, performLocalSearch]);

  const handleSelectResult = (item: SearchResultItem) => {
    setIsOpen(false);
    setMobileSearchOpen(false);
    setQuery("");
    router.push(item.actionUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (flattenedResults.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % flattenedResults.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (flattenedResults.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + flattenedResults.length) % flattenedResults.length);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flattenedResults.length > 0 && flattenedResults[selectedIndex]) {
        handleSelectResult(flattenedResults[selectedIndex]);
      } else if (query.trim()) {
        // Fallback: search menu
        router.push(`/dashboard/menu?search=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
        setMobileSearchOpen(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setMobileSearchOpen(false);
      searchInputRef.current?.blur();
    }
  };

  let cumulativeIndex = 0;

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Mobile / Tablet search icon button */}
      <button
        onClick={() => {
          setMobileSearchOpen(true);
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
              if (query.trim().length >= 2) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search orders, rooms, menu... (⌘K)"
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            aria-expanded={isOpen}
            aria-autocomplete="list"
          />
          {isLoading ? (
            <Loader2 className="absolute right-3 top-2.5 h-3.5 w-3.5 animate-spin text-emerald-500 pointer-events-none" />
          ) : query ? (
            <button
              onClick={() => {
                setQuery("");
                setIsOpen(false);
                searchInputRef.current?.focus();
              }}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Mobile Search Modal Overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/60 backdrop-blur-sm flex flex-col p-4">
          <div className="bg-white dark:bg-[#0B0F19] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
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
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />}
              <button
                onClick={() => {
                  setMobileSearchOpen(false);
                  setIsOpen(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
              {renderDropdownContent()}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Dropdown Popover */}
      {isOpen && query.trim().length >= 2 && !mobileSearchOpen && (
        <div className="hidden lg:block absolute left-0 top-full mt-2 w-[480px] xl:w-[540px] max-w-[calc(100vw-2rem)] bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="max-h-[68vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1.5">
            {renderDropdownContent()}
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#090D16]/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                {totalResultsCount} result{totalResultsCount === 1 ? "" : "s"} found
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

  function renderDropdownContent() {
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
            Try searching by food dish name, order # (e.g. 1024), guest name, room number, or table.
          </p>
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
      <>
        {categoriesList.map((catKey) => {
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
            <div key={catKey} className="py-1.5">
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
                            {item.title}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {item.subtitle}
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
      </>
    );
  }
}
