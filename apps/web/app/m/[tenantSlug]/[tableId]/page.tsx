"use client";

import * as React from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  Search,
  Sparkles,
  BellRing,
  Wifi,
  ChevronRight,
  Info,
  Clock,
  Heart,
  Plus,
  MessageCircle,
  X,
  Lock,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import {
  DishCustomizerSheet,
  CustomizerDish,
} from "@/components/customer/dish-customizer-sheet";
import { CustomerCartDrawer } from "@/components/customer/customer-cart-drawer";
import { useCartStore } from "@/lib/stores/cart-store";
import { useTenantDataStore } from "@/lib/stores/tenant-data-store";
import { isCategoryMatch } from "@/lib/utils/category-utils";

function matchesTable(candidateIdOrName: string, targetTableId: string): boolean {
  if (!candidateIdOrName || !targetTableId) return false;
  const c = candidateIdOrName.trim().toLowerCase();
  const t = targetTableId.trim().toLowerCase();
  if (c === t) return true;

  const cleanC = c.replace(/^(table|t|room|suite)[ -]*/i, "");
  const cleanT = t.replace(/^(table|t|room|suite)[ -]*/i, "");
  if (cleanC === cleanT) return true;

  const numC = cleanC.match(/\d+/)?.[0];
  const numT = cleanT.match(/\d+/)?.[0];
  if (numC && numT && parseInt(numC, 10) === parseInt(numT, 10)) {
    return true;
  }
  return false;
}

export default function CustomerMenuPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { setContext } = useCartStore();

  const tenantSlug = (params?.tenantSlug as string) || "the-grand-bistro";
  const tableId = (params?.tableId as string) || "t-04";

  const {
    menuItems,
    categories,
    tenantName: storeTenantName,
    tenantSlug: storeTenantSlug,
    isDemoTenant,
    tables: storeTables,
  } = useTenantDataStore();

  const [remoteMenuData, setRemoteMenuData] = React.useState<{ category: string; items: CustomizerDish[] }[] | null>(null);
  const [remoteTenant, setRemoteTenant] = React.useState<{ name?: string; slug?: string } | null>(null);
  const [isLiveSyncing, setIsLiveSyncing] = React.useState(false);
  const [tableInfo, setTableInfo] = React.useState<{
    id?: string;
    name?: string;
    status?: string;
  } | null>(null);

  const fetchPublicMenu = React.useCallback(async (rawSlug: string) => {
    if (!rawSlug) return;
    const slug =
      rawSlug.toLowerCase() === "dineflow" || rawSlug.toLowerCase() === "restaurant"
        ? "the-grand-bistro"
        : rawSlug;
    setIsLiveSyncing(true);

    // 1. Instant preview from localStorage cache if present
    if (typeof window !== "undefined") {
      try {
        const cached =
          localStorage.getItem(`dineflow_public_menu_${slug.toLowerCase()}`) ||
          localStorage.getItem(`dineflow_public_menu_${rawSlug.toLowerCase()}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.sections && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
            setRemoteMenuData(parsed.sections);
            if (parsed.tenant) setRemoteTenant(parsed.tenant);
          }
        }
      } catch {}
    }

    try {
      // 2. Fetch fresh menu data from API route proxy or direct Go backend
      let json: any = null;
      try {
        const res = await fetch(`/api/menu/public?slug=${encodeURIComponent(slug)}&_t=${Date.now()}`, {
          cache: "no-store",
        });
        if (res.ok) {
          json = await res.json();
        }
      } catch {}

      if (!json || !json.data) {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL ||
          (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
            ? "https://api-production-f170.up.railway.app/api/v1"
            : "http://localhost:8080/api/v1");

        const directRes = await fetch(`${apiBase}/public/m/${encodeURIComponent(slug)}?_t=${Date.now()}`, {
          cache: "no-store",
        });
        if (directRes.ok) {
          json = await directRes.json();
        }
      }

      if (json?.data) {
        const tenantInfo = json.data.tenant;
        const rawCategories = Array.isArray(json.data.categories) ? json.data.categories : [];

        const sections: { category: string; items: CustomizerDish[] }[] = [];
        for (const sec of rawCategories) {
          const catName = sec.category?.name || "General";
          const rawItems = Array.isArray(sec.items) ? sec.items : [];
          const dishItems: CustomizerDish[] = rawItems
            .filter((itm: any) => itm.isAvailable !== false && itm.available !== false)
            .map((itm: any) => ({
              id: String(itm.id || itm._id),
              name: itm.name,
              description:
                itm.description ||
                itm.desc ||
                (itm.hindiName ? itm.hindiName : "Freshly prepared by our culinary team."),
              basePrice:
                typeof itm.basePrice === "number" && itm.basePrice > 0
                  ? itm.basePrice
                  : typeof itm.price === "number"
                  ? itm.price
                  : 0,
              imageUrl: itm.imageUrl || itm.image,
              isVeg:
                Array.isArray(itm.dietaryTags)
                  ? itm.dietaryTags.includes("veg") || !itm.dietaryTags.includes("non_veg")
                  : itm.isVeg !== false,
              variants:
                Array.isArray(itm.variants) && itm.variants.length > 0
                  ? itm.variants.map((v: any) => ({ name: v.name, price: v.price }))
                  : undefined,
              modifierGroups:
                Array.isArray(itm.modifierGroups) && itm.modifierGroups.length > 0
                  ? itm.modifierGroups.map((mg: any) => ({
                      id: mg.id || mg.name,
                      name: mg.name,
                      minSelections: mg.minSelections ?? 0,
                      maxSelections: mg.maxSelections ?? 1,
                      options: (mg.options || []).map((o: any) => ({
                        name: o.name,
                        price: o.price,
                      })),
                    }))
                  : undefined,
            }));

          if (dishItems.length > 0) {
            sections.push({ category: catName, items: dishItems });
          }
        }

        if (sections.length > 0) {
          setRemoteMenuData(sections);
          if (tenantInfo) setRemoteTenant(tenantInfo);
          try {
            localStorage.setItem(
              `dineflow_public_menu_${slug.toLowerCase()}`,
              JSON.stringify({ tenant: tenantInfo, sections })
            );
          } catch {}
        }
      }
    } catch (e) {
      console.warn("[CustomerMenu] Live fetch public menu error:", e);
    } finally {
      setIsLiveSyncing(false);
    }
  }, []);

  // Multi-channel real-time synchronization
  React.useEffect(() => {
    fetchPublicMenu(tenantSlug);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("dineflow_menu_sync");
      channel.onmessage = (event) => {
        if (
          event.data?.type === "MENU_UPDATED" &&
          (!event.data.slug || event.data.slug.toLowerCase() === tenantSlug.toLowerCase())
        ) {
          fetchPublicMenu(tenantSlug);
        }
      };
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith("dineflow_data_v2_") || e.key?.startsWith("dineflow_public_menu_")) {
        fetchPublicMenu(tenantSlug);
      }
    };
    window.addEventListener("storage", handleStorage);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchPublicMenu(tenantSlug);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const interval = setInterval(() => {
      fetchPublicMenu(tenantSlug);
    }, 25000);

    return () => {
      channel?.close();
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, [tenantSlug, fetchPublicMenu]);

  const fetchTableStatus = React.useCallback(
    async (rawSlug: string, rawTableId: string) => {
      if (!rawSlug || !rawTableId) return;
      const slug =
        rawSlug.toLowerCase() === "dineflow" || rawSlug.toLowerCase() === "restaurant"
          ? "the-grand-bistro"
          : rawSlug;

      // 1. Check local tenant store first if matching current restaurant
      const isSameTenant =
        storeTenantSlug?.toLowerCase() === slug.toLowerCase() ||
        (slug.toLowerCase() === "the-grand-bistro" && isDemoTenant) ||
        (slug.toLowerCase() === "dineflow" && isDemoTenant) ||
        (slug.toLowerCase() === "restaurant" && isDemoTenant);

      if (isSameTenant && storeTables && storeTables.length > 0) {
        const matched = storeTables.find(
          (tbl) =>
            matchesTable(tbl.id, rawTableId) ||
            matchesTable(tbl.name, rawTableId) ||
            (tbl.qrCode && tbl.qrCode.toLowerCase().includes(rawTableId.toLowerCase()))
        );
        if (matched) {
          setTableInfo({
            id: matched.id,
            name: matched.name,
            status: matched.status,
          });
        }
      }

      // 2. Fetch fresh status from Next.js proxy route or direct Go backend
      try {
        let json: any = null;
        try {
          const res = await fetch(
            `/api/menu/table?slug=${encodeURIComponent(slug)}&table=${encodeURIComponent(rawTableId)}&_t=${Date.now()}`,
            { cache: "no-store" }
          );
          if (res.ok) {
            json = await res.json();
          }
        } catch {}

        if (!json || !json.data) {
          const apiBase =
            process.env.NEXT_PUBLIC_API_URL ||
            (typeof window !== "undefined" &&
            window.location.hostname !== "localhost" &&
            window.location.hostname !== "127.0.0.1"
              ? "https://api-production-f170.up.railway.app/api/v1"
              : "http://localhost:8080/api/v1");

          const directRes = await fetch(
            `${apiBase}/public/tables/${encodeURIComponent(slug)}/${encodeURIComponent(rawTableId)}?_t=${Date.now()}`,
            { cache: "no-store" }
          );
          if (directRes.ok) {
            json = await directRes.json();
          }
        }

        if (json?.data?.table) {
          const t = json.data.table;
          setTableInfo({
            id: t.id || t._id,
            name: t.name,
            status: t.status || "available",
          });
        }
      } catch (e) {
        console.warn("[CustomerMenu] Live fetch table status error:", e);
      }
    },
    [storeTenantSlug, isDemoTenant, storeTables]
  );

  // Multi-channel real-time table status synchronization
  React.useEffect(() => {
    fetchTableStatus(tenantSlug, tableId);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("dineflow_table_sync");
      channel.onmessage = (event) => {
        if (event.data?.type === "TABLE_STATUS_UPDATED") {
          const { tableId: updatedId, status, tenantSlug: updatedTenantSlug } = event.data;
          const isMatchingSlug =
            !updatedTenantSlug ||
            updatedTenantSlug.toLowerCase() === tenantSlug.toLowerCase() ||
            ((tenantSlug.toLowerCase() === "the-grand-bistro" || tenantSlug.toLowerCase() === "dineflow") &&
              (updatedTenantSlug.toLowerCase() === "the-grand-bistro" || updatedTenantSlug.toLowerCase() === "dineflow"));

          if (isMatchingSlug) {
            if (
              matchesTable(updatedId, tableId) ||
              (tableInfo?.id && matchesTable(updatedId, tableInfo.id))
            ) {
              setTableInfo((prev) => ({
                id: prev?.id || updatedId,
                name: prev?.name,
                status,
              }));
            }
          }
        }
      };
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith("dineflow_data_v2_")) {
        fetchTableStatus(tenantSlug, tableId);
      }
    };
    window.addEventListener("storage", handleStorage);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchTableStatus(tenantSlug, tableId);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const interval = setInterval(() => {
      fetchTableStatus(tenantSlug, tableId);
    }, 10000);

    return () => {
      channel?.close();
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, [tenantSlug, tableId, fetchTableStatus, tableInfo?.id]);

  const dynamicMenuData = React.useMemo(() => {
    // 1. Highest priority: Live remote menu from database
    if (remoteMenuData && remoteMenuData.length > 0) {
      return remoteMenuData;
    }

    // 2. Second priority: Local tenant store if matching current restaurant
    const isSameTenant =
      storeTenantSlug?.toLowerCase() === tenantSlug.toLowerCase() ||
      (tenantSlug.toLowerCase() === "the-grand-bistro" && isDemoTenant) ||
      (tenantSlug.toLowerCase() === "dineflow" && isDemoTenant) ||
      (tenantSlug.toLowerCase() === "restaurant" && isDemoTenant);

    if (isSameTenant && menuItems && menuItems.length > 0) {
      const catMap = new Map<string, CustomizerDish[]>();

      menuItems.forEach((item) => {
        // Customers only see and order available (non-86'd) dishes
        if (!item.available) return;
        const cat = item.category || "General";
        if (!catMap.has(cat)) {
          catMap.set(cat, []);
        }
        catMap.get(cat)!.push({
          id: item.id,
          name: item.name,
          description:
            item.desc ||
            (item.hindiName ? item.hindiName : "Freshly prepared by our culinary team."),
          basePrice: item.price,
          imageUrl: item.imageUrl,
          isVeg: item.isVeg,
          variants:
            item.variantsCount && item.variantsCount > 0
              ? [
                  { name: "Regular Portion", price: item.price },
                  { name: "Large / Sharing", price: Math.round(item.price * 1.5) },
                ]
              : undefined,
          modifierGroups:
            item.modifiersCount && item.modifiersCount > 0
              ? [
                  {
                    id: `mod-${item.id}`,
                    name: "Add-ons & Accompaniments",
                    minSelections: 0,
                    maxSelections: 2,
                    options: [
                      { name: "Extra Sauce / Chutney", price: 30 },
                      { name: "Extra Cheese / Butter", price: 60 },
                    ],
                  },
                ]
              : undefined,
        });
      });

      if (catMap.size > 0) {
        const result: { category: string; items: CustomizerDish[] }[] = [];
        const seen = new Set<string>();

        // First add categories in configured order
        categories.forEach((c) => {
          for (const [catName, items] of catMap.entries()) {
            if (isCategoryMatch(catName, c) && !seen.has(catName)) {
              result.push({ category: catName, items });
              seen.add(catName);
            }
          }
        });

        // Add any remaining categories not explicitly ordered
        for (const [catName, items] of catMap.entries()) {
          if (!seen.has(catName)) {
            result.push({ category: catName, items });
            seen.add(catName);
          }
        }

        return result;
      }
    }

    // 3. Return actual dishes only — no pre-defined mock menus
    return [];
  }, [remoteMenuData, menuItems, categories, storeTenantSlug, tenantSlug, isDemoTenant]);

  const restaurantDisplayName =
    remoteTenant?.name ||
    (storeTenantSlug?.toLowerCase() === tenantSlug.toLowerCase() &&
    storeTenantName &&
    storeTenantName !== "Your Restaurant"
      ? storeTenantName
      : tenantSlug === "the-grand-bistro"
      ? "The Grand Bistro & Lounge"
      : tenantSlug
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "));

  // Table status and reservation locking
  const tableStatus = (tableInfo?.status || "available").toLowerCase();
  const isTableReserved = tableStatus === "reserved";

  // Table display name
  const fallbackTableName =
    tableId.toUpperCase().startsWith("T-")
      ? `Table ${tableId.slice(2)}`
      : tableId.toUpperCase().startsWith("R-")
      ? `Room ${tableId.slice(2)}`
      : `Table ${tableId}`;

  const tableName = tableInfo?.name || fallbackTableName;

  // Initialize context in cart store
  React.useEffect(() => {
    setContext(tenantSlug, tableId);
  }, [tenantSlug, tableId, setContext]);

  // Filtering & Search
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dietaryFilter, setDietaryFilter] = React.useState<"all" | "veg" | "non-veg">("all");
  const [activeCategory, setActiveCategory] = React.useState(dynamicMenuData[0]?.category || "");

  React.useEffect(() => {
    if (dynamicMenuData.length > 0) {
      const exists = dynamicMenuData.some((sec) => sec.category === activeCategory);
      if (!exists) {
        setActiveCategory(dynamicMenuData[0].category);
      }
    }
  }, [dynamicMenuData, activeCategory]);

  // Customizer sheet modal state
  const [customizingDish, setCustomizingDish] = React.useState<CustomizerDish | null>(null);

  const handleCallWaiter = () => {
    addToast(
      "success",
      "Waiter Alerted",
      `A steward has been notified for ${tableName}. They will arrive at your table shortly.`
    );
  };

  const handleWifiInfo = () => {
    addToast(
      "info",
      "Guest Wi-Fi",
      "Network: GrandBistro_Guest | Password: dineinluxury"
    );
  };

  const handleOpenWhatsApp = () => {
    const msg = `Hi ${restaurantDisplayName}! 👋 I am browsing the digital menu for ${tableName}. Could I get some recommendations or assistance?`;
    window.open(`https://wa.me/919876543210?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Filtered dishes
  const filteredCategories = dynamicMenuData.map((cat) => {
    const items = cat.items.filter((item) => {
      // Dietary filter
      if (dietaryFilter === "veg" && !item.isVeg) return false;
      if (dietaryFilter === "non-veg" && item.isVeg) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
    return { ...cat, items };
  }).filter((cat) => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28 font-sans transition-colors duration-200">
      {/* Top Navigation & Hero Banner */}
      <div className="relative">
        <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-slate-200 dark:bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80"
            alt="Restaurant Interior"
            className="w-full h-full object-cover brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/60 dark:via-slate-950/50 to-transparent" />

          {/* Quick Action Badges */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 xs:gap-2 max-w-[calc(100%-1.5rem)] flex-wrap justify-end">
            <button
              onClick={handleOpenWhatsApp}
              className="px-2.5 xs:px-3 h-8 xs:h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 cursor-pointer"
              title="Order or Inquire on WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
              <span className="hidden xs:inline">WhatsApp</span>
            </button>
            <button
              onClick={handleWifiInfo}
              className="h-8 w-8 xs:h-9 xs:w-9 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:text-slate-900 dark:hover:text-white shadow-sm"
              title="Wi-Fi Information"
            >
              <Wifi className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
            </button>
            <button
              onClick={handleCallWaiter}
              className="px-2.5 xs:px-3 h-8 xs:h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <BellRing className="h-3.5 w-3.5" />
              <span><span className="hidden xs:inline">Call </span>Waiter</span>
            </button>
            <ThemeToggle
              className="h-8 w-8 xs:h-9 xs:w-9 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 shadow-sm"
            />
          </div>
        </div>

        {/* Restaurant Profile Card */}
        <div className="max-w-xl mx-auto px-4 -mt-16 relative z-10">
          <div className="p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-xl backdrop-blur-md">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  DineFlow Contactless Ordering
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {restaurantDisplayName}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Contactless Guest Dining & Table Ordering
                </p>
              </div>

              {/* Table Pill */}
              <div className="flex flex-col items-end shrink-0 ml-2">
                <div className="flex items-center gap-1.5">
                  {isTableReserved ? (
                    <Badge variant="outline" className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold text-xs flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      {tableName} • Reserved
                    </Badge>
                  ) : tableStatus === "occupied" ? (
                    <Badge variant="outline" className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 font-bold text-xs flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {tableName} • Occupied
                    </Badge>
                  ) : (
                    <Badge variant="glow" size="sm" className="font-mono font-bold text-xs">
                      {tableName}
                    </Badge>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                  {isTableReserved ? "Ordering Disabled" : "Direct to KDS"}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                {isTableReserved ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-amber-500 inline-block animate-pulse" />
                    <span className="font-semibold text-amber-700 dark:text-amber-400">Table Reserved</span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                    <span className="font-medium text-slate-600 dark:text-slate-300">Live Kitchen Active</span>
                  </>
                )}
              </div>
              <button
                onClick={handleOpenWhatsApp}
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Prefer WhatsApp? Tap here</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="mt-4 relative flex items-center">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search dishes, drinks, ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Dietary Filter Pills */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setDietaryFilter("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  dietaryFilter === "all"
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                All Items
              </button>

              <button
                onClick={() => setDietaryFilter("veg")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  dietaryFilter === "veg"
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800/80 text-emerald-700 dark:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                Pure Veg
              </button>

              <button
                onClick={() => setDietaryFilter("non-veg")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  dietaryFilter === "non-veg"
                    ? "bg-rose-500 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800/80 text-rose-700 dark:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
                Non-Veg
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reserved Table Warning Banner */}
      {isTableReserved && (
        <div className="max-w-xl mx-auto px-4 mt-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800/80 shadow-md flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 dark:bg-amber-500/30 border border-amber-500/40 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
                <Lock className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-black text-amber-900 dark:text-amber-200">
                    {tableName} is Reserved
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 border border-amber-400/50">
                    Orders Locked
                  </span>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-1 leading-relaxed">
                  This table is currently reserved by restaurant management and cannot accept digital QR orders at this time. Please speak with the host or alert a steward if you are seated here.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] font-medium text-amber-800 dark:text-amber-400">
                Need steward assistance?
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCallWaiter}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <BellRing className="h-3.5 w-3.5" />
                  <span>Call Steward</span>
                </button>
                <button
                  onClick={handleOpenWhatsApp}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Contact Host</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Menu Feed */}
      <div className="max-w-xl mx-auto px-4 mt-6 space-y-8">
        {filteredCategories.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800/80 my-8 shadow-sm">
            <Sparkles className="h-8 w-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">
              {searchQuery || dietaryFilter !== "all"
                ? "No matching dishes found"
                : isLiveSyncing
                ? "Loading restaurant menu…"
                : "Menu is being updated"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery || dietaryFilter !== "all"
                ? "Try adjusting your search query or dietary filters."
                : isLiveSyncing
                ? "Fetching the latest live dishes from the kitchen…"
                : "This restaurant's digital menu is currently being prepared. Please ask your server for assistance."}
            </p>
            {(searchQuery || dietaryFilter !== "all") && (
              <div className="pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  onClick={() => {
                    setSearchQuery("");
                    setDietaryFilter("all");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <section key={cat.category} className="space-y-3.5">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {cat.category}
                </h2>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800/80" />
              </div>

              <div className="space-y-3">
                {cat.items.map((dish) => (
                  <div
                    key={dish.id}
                    onClick={() => {
                      if (isTableReserved) {
                        addToast(
                          "warning",
                          "Table Reserved",
                          `${tableName} is currently reserved and cannot accept new orders. Please alert a steward.`
                        );
                        return;
                      }
                      setCustomizingDish(dish);
                    }}
                    className={`p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 transition-all flex gap-3 sm:gap-3.5 shadow-sm ${
                      isTableReserved
                        ? "opacity-85 cursor-not-allowed"
                        : "hover:border-slate-300 dark:hover:border-slate-700/80 hover:shadow-md dark:shadow-none cursor-pointer group"
                    }`}
                  >
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center justify-center h-3.5 w-3.5 rounded border ${
                              dish.isVeg
                                ? "border-emerald-500 text-emerald-500"
                                : "border-rose-500 text-rose-500"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                dish.isVeg ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                            />
                          </span>
                          <h3 className={`text-sm font-bold truncate transition-colors ${
                            isTableReserved
                              ? "text-slate-700 dark:text-slate-300"
                              : "text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                          }`}>
                            {dish.name}
                          </h3>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {dish.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/40">
                        <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">
                          {formatCurrency(dish.basePrice, "INR")}
                        </span>

                        {isTableReserved ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled
                            className="h-8 px-3 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700/50 shrink-0 cursor-not-allowed opacity-80"
                          >
                            <Lock className="h-3.5 w-3.5 mr-1" />
                            <span>Reserved</span>
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 px-3 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 dark:hover:bg-emerald-500/20 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCustomizingDish(dish);
                            }}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            <span>Add</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Right: Dish Image */}
                    {dish.imageUrl && (
                      <div className="h-20 w-20 xs:h-24 xs:w-24 sm:h-28 sm:w-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 relative">
                        <img
                          src={dish.imageUrl}
                          alt={dish.name}
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                          }}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Dish Customizer Sheet Modal */}
      <DishCustomizerSheet
        dish={customizingDish}
        isOpen={!!customizingDish}
        onClose={() => setCustomizingDish(null)}
      />

      {/* Sticky Table Reserved Floating Banner */}
      {isTableReserved && (
        <div className="fixed bottom-4 inset-x-0 z-40 px-3 xs:px-4 max-w-lg mx-auto pb-safe">
          <div className="w-full h-14 bg-amber-600/95 dark:bg-amber-900/95 backdrop-blur text-white font-bold px-4 rounded-2xl shadow-xl border border-amber-400/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-xl bg-amber-700/60 dark:bg-amber-800/60 flex items-center justify-center shrink-0">
                <Lock className="h-4 w-4 text-amber-200" />
              </div>
              <div className="text-left min-w-0">
                <span className="block text-[11px] uppercase tracking-wider text-amber-200 font-extrabold">
                  {tableName} is Reserved
                </span>
                <span className="text-xs font-semibold text-white truncate block">
                  Ordering is disabled for this table
                </span>
              </div>
            </div>

            <button
              onClick={handleCallWaiter}
              className="px-3 py-1.5 rounded-xl bg-white text-amber-950 hover:bg-amber-50 text-xs font-bold shrink-0 transition-colors shadow-sm cursor-pointer"
            >
              Call Steward
            </button>
          </div>
        </div>
      )}

      {/* Customer Sticky Cart / Checkout Drawer */}
      <CustomerCartDrawer
        tenantSlug={tenantSlug}
        tableSlug={tableId}
        tableName={tableName}
        isTableReserved={isTableReserved}
      />
    </div>
  );
}
