"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Hotel,
  BellRing,
  Wifi,
  Clock,
  Sparkles,
  Search,
  Plus,
  Coffee,
  Moon,
  Wine,
  UtensilsCrossed,
  ShieldAlert,
  ChevronRight,
  Phone,
  Bed,
  CheckCircle2,
  Users,
  Copy,
  Check,
  Info,
  ShieldCheck,
  Tv,
  Wind,
  Bath,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import {
  DishCustomizerSheet,
  CustomizerDish,
  MenuItemVariant,
  MenuItemModifierGroup,
} from "@/components/customer/dish-customizer-sheet";
import { CustomerCartDrawer } from "@/components/customer/customer-cart-drawer";
import { CustomerHousekeepingSheet } from "@/components/customer/customer-housekeeping-sheet";
import { CustomerHousekeepingTracker } from "@/components/customer/customer-housekeeping-tracker";
import { useCartStore } from "@/lib/stores/cart-store";

interface RoomInfo {
  roomNumber: string;
  name: string;
  roomType: string;
  floor: string;
  wing: string;
  currentGuestName?: string;
  amenities: string[];
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl?: string;
  isVeg: boolean;
  category: string;
  categoryId?: string;
  isAvailable: boolean;
  variants?: MenuItemVariant[];
  modifierGroups?: MenuItemModifierGroup[];
}

type SuiteTab = "dining" | "housekeeping" | "info";

export default function RoomServiceMenuPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const { setContext } = useCartStore();

  const tenantSlug = (params?.tenantSlug as string) || "the-grand-bistro";
  const rawRoomNumber = (params?.roomNumber as string) || "302";

  const cleanRoomNum = rawRoomNumber.toUpperCase().replace(/^(ROOM-|SUITE-)/, "");
  const roomDisplay = `Suite ${cleanRoomNum}`;

  const [activeTab, setActiveTab] = React.useState<SuiteTab>("dining");
  const [roomInfo, setRoomInfo] = React.useState<RoomInfo | null>(null);
  const [hotelName, setHotelName] = React.useState("The Grand Palace & Spa");
  const [categories, setCategories] = React.useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [customizingDish, setCustomizingDish] = React.useState<CustomizerDish | null>(null);
  const [isHousekeepingSheetOpen, setIsHousekeepingSheetOpen] = React.useState(false);
  const [housekeepingRefreshSignal, setHousekeepingRefreshSignal] = React.useState(0);
  const [activeTasksCount, setActiveTasksCount] = React.useState(0);
  const [latestActiveTask, setLatestActiveTask] = React.useState<{ title: string; status: string } | null>(null);
  const [copiedWifi, setCopiedWifi] = React.useState(false);

  React.useEffect(() => {
    setContext(tenantSlug, `room-${cleanRoomNum.toLowerCase()}`);
  }, [tenantSlug, cleanRoomNum, setContext]);

  // Monitor active tasks in real-time
  const checkActiveTasks = React.useCallback(() => {
    try {
      const storageKey = `dineflow_tasks_${tenantSlug}_${cleanRoomNum}`;
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const active = parsed.filter(
            (t: any) => t.status === "pending" || t.status === "in_progress"
          );
          setActiveTasksCount(active.length);
          if (active.length > 0) {
            setLatestActiveTask({ title: active[0].title, status: active[0].status });
          } else {
            setLatestActiveTask(null);
          }
        }
      }
    } catch (e) {
      // Ignore
    }
  }, [tenantSlug, cleanRoomNum]);

  React.useEffect(() => {
    checkActiveTasks();
    const interval = setInterval(checkActiveTasks, 2500);
    window.addEventListener("dineflow_task_created", checkActiveTasks);
    window.addEventListener("storage", checkActiveTasks);
    return () => {
      clearInterval(interval);
      window.removeEventListener("dineflow_task_created", checkActiveTasks);
      window.removeEventListener("storage", checkActiveTasks);
    };
  }, [checkActiveTasks, housekeepingRefreshSignal]);

  // Fetch Room & Hotel Info
  React.useEffect(() => {
    async function loadRoomDetails() {
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL ||
          (process.env.NODE_ENV === "production"
            ? "https://api-production-f170.up.railway.app/api/v1"
            : "http://localhost:8080/api/v1");

        const res = await fetch(
          `${apiBase}/public/rooms/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(cleanRoomNum)}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const json = await res.json();
          if (json.data?.room) {
            const r = json.data.room;
            // Purge previous guest's cached requests if a new/different guest is now checked in
            try {
              const guestKey = `dineflow_guest_${tenantSlug}_${cleanRoomNum}`;
              const lastKnownGuest = localStorage.getItem(guestKey);
              const currentGuest = r.currentGuestName || "";
              if (lastKnownGuest && lastKnownGuest !== currentGuest) {
                const storageKey = `dineflow_tasks_${tenantSlug}_${cleanRoomNum}`;
                localStorage.removeItem(storageKey);
                window.dispatchEvent(new CustomEvent("dineflow_task_created"));
              }
              if (currentGuest) {
                localStorage.setItem(guestKey, currentGuest);
              } else {
                localStorage.removeItem(guestKey);
              }
            } catch (_) {}

            setRoomInfo({
              roomNumber: r.roomNumber,
              name: r.name || `Suite ${r.roomNumber}`,
              roomType: r.roomType || "suite",
              floor: r.floor || "Floor 2",
              wing: r.wing || "Main Wing",
              currentGuestName: r.currentGuestName,
              amenities: Array.isArray(r.amenities) ? r.amenities : [],
            });
          }
          if (json.data?.hotelName) {
            setHotelName(json.data.hotelName);
          }
        }
      } catch (e) {
        console.warn("Public room fetch error:", e);
      }
    }
    loadRoomDetails();
  }, [tenantSlug, cleanRoomNum]);

  // Fetch Live Tenant Menu
  React.useEffect(() => {
    async function loadMenu() {
      try {
        setLoading(true);
        const res = await fetch(`/api/menu/public?slug=${encodeURIComponent(tenantSlug)}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;

          if (data.tenant?.name) {
            setHotelName(data.tenant.name);
          }

          let itemsList: MenuItem[] = [];
          const catList: string[] = [];

          const mapGroups = (raw: any[] | undefined): MenuItemModifierGroup[] | undefined => {
            if (!Array.isArray(raw)) return undefined;
            return raw.map((g: any, idx: number) => ({
              id: g.id || `mg-${idx}`,
              name: g.name || "Customization",
              minSelections: g.minSelections ?? g.minSelection ?? 0,
              maxSelections: g.maxSelections ?? g.maxSelection ?? (Array.isArray(g.options) ? g.options.length : 1),
              options: Array.isArray(g.options) ? g.options : [],
            }));
          };

          if (Array.isArray(data.categories)) {
            data.categories.forEach((catEntry: any) => {
              const catName = catEntry.category?.name || "All-Day Dining";
              if (!catList.includes(catName)) catList.push(catName);

              if (Array.isArray(catEntry.items)) {
                catEntry.items.forEach((it: any) => {
                  if (it.isAvailable !== false) {
                    itemsList.push({
                      id: it.id || it._id,
                      name: it.name,
                      description: it.description || "",
                      basePrice: it.basePrice || it.price || 0,
                      imageUrl: it.imageUrl || it.image,
                      isVeg: it.dietaryTags?.includes("veg") || it.isVeg === true,
                      category: catName,
                      categoryId: it.categoryId,
                      isAvailable: it.isAvailable !== false,
                      variants: it.variants,
                      modifierGroups: mapGroups(it.modifierGroups),
                    });
                  }
                });
              }
            });
          } else if (Array.isArray(data.menuItems)) {
            itemsList = data.menuItems.map((it: any) => ({
              id: it.id || it._id,
              name: it.name,
              description: it.description || "",
              basePrice: it.basePrice || it.price || 0,
              imageUrl: it.imageUrl || it.image,
              isVeg: it.dietaryTags?.includes("veg") || it.isVeg === true,
              category: it.category || "All-Day Dining",
              categoryId: it.categoryId,
              isAvailable: it.isAvailable !== false,
              variants: it.variants,
              modifierGroups: mapGroups(it.modifierGroups),
            }));
            itemsList.forEach((it) => {
              if (it.category && !catList.includes(it.category)) {
                catList.push(it.category);
              }
            });
          }

          setCategories(["all", ...catList]);
          setMenuItems(itemsList);
        }
      } catch (e) {
        console.warn("Public menu fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, [tenantSlug]);

  const handleReception = () => {
    addToast(
      "info",
      "Front Desk & Concierge Hotline",
      "Dial 0 from your in-room telephone or contact concierge desk on WhatsApp."
    );
  };

  const handleCopyWifi = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("GrandSuite@2025");
      setCopiedWifi(true);
      addToast("success", "Wi-Fi Password Copied", "Password 'GrandSuite@2025' copied to clipboard.");
      setTimeout(() => setCopiedWifi(false), 3000);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== "all" && item.category !== selectedCategory) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-36 font-sans">
      {/* ── Luxury Hotel In-Room Dining Hero ── */}
      <div className="relative">
        <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80"
            alt="Hotel Suite"
            className="w-full h-full object-cover brightness-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Top Bar Indicators */}
          <div className="absolute top-4 inset-x-4 max-w-xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur border border-slate-700 text-xs font-bold text-emerald-400 flex items-center gap-1.5 shadow">
                <Hotel className="h-3.5 w-3.5" />
                <span>Guest Hospitality Portal</span>
              </span>
            </div>

            <Badge variant="glow" size="sm" className="font-mono font-extrabold text-xs">
              {roomDisplay}
            </Badge>
          </div>
        </div>

        {/* Hotel Header Card */}
        <div className="max-w-xl mx-auto px-4 -mt-14 relative z-10">
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-md">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  Private Guest Suite Service
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {hotelName}
                </h1>
                {roomInfo?.currentGuestName ? (
                  <p className="text-xs text-emerald-400 font-medium mt-0.5">
                    Welcome, {roomInfo.currentGuestName} • Silver tray delivery to your door
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Silver tray delivery directly to your door • 24/7 Butler care
                  </p>
                )}
              </div>
            </div>

            {/* Quick Guest Amenities Shortcuts */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("housekeeping")}
                className={`p-2.5 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer group ${
                  activeTab === "housekeeping"
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300"
                }`}
              >
                <div className="relative">
                  <Bed className="h-4 w-4 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                  {activeTasksCount > 0 && (
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping absolute -top-1 -right-1" />
                  )}
                </div>
                <span className="text-[11px] font-bold">Suite Flow</span>
                <span className="text-[9px] text-slate-500">
                  {activeTasksCount > 0 ? `${activeTasksCount} In Flight` : "Live Status"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("dining")}
                className={`p-2.5 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer group ${
                  activeTab === "dining"
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300"
                }`}
              >
                <UtensilsCrossed className="h-4 w-4 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Dining Menu</span>
                <span className="text-[9px] text-slate-500">In-Room Food</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("info")}
                className={`p-2.5 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer group ${
                  activeTab === "info"
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300"
                }`}
              >
                <Wifi className="h-4 w-4 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Suite Info</span>
                <span className="text-[9px] text-slate-500">Wi-Fi & Concierge</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Segmented Navigation Control ── */}
      <div className="max-w-xl mx-auto px-4 mt-4 sticky top-2 z-30">
        <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveTab("dining")}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "dining"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UtensilsCrossed className="h-3.5 w-3.5" />
            <span>In-Room Dining</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("housekeeping")}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative cursor-pointer ${
              activeTab === "housekeeping"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Bed className="h-3.5 w-3.5" />
            <span>Housekeeping</span>
            {activeTasksCount > 0 ? (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[9px] font-extrabold animate-pulse">
                {activeTasksCount}
              </span>
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "info"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Info className="h-3.5 w-3.5" />
            <span>Suite & Wi-Fi</span>
          </button>
        </div>
      </div>

      {/* ── Active Service Alert Banner (Visible when outside Housekeeping tab) ── */}
      {activeTasksCount > 0 && activeTab !== "housekeeping" && (
        <div className="max-w-xl mx-auto px-4 mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div
            onClick={() => setActiveTab("housekeeping")}
            className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/90 border-2 border-emerald-500/60 flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-all shadow-lg shadow-emerald-500/10 group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                  <span className="text-slate-300">Live Service:</span>
                  <span className="text-emerald-400 font-black">{latestActiveTask?.title}</span>
                </p>
                <p className="text-[10px] text-slate-400">
                  {latestActiveTask?.status === "in_progress"
                    ? "Steward attending to your suite right now"
                    : "Request received • Housekeeping dispatched"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0 ml-2">
              <span>Track Flow</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 1: HOUSEKEEPING & SUITE FLOW (Dedicated Live Multi-Step Status View)
          ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "housekeeping" && (
        <div className="animate-in fade-in duration-300 space-y-5">
          {/* Spotlight Real-Time Multi-Step Flow Tracker */}
          <CustomerHousekeepingTracker
            tenantSlug={tenantSlug}
            roomNumber={cleanRoomNum}
            roomDisplay={roomDisplay}
            onRequestNewService={() => setIsHousekeepingSheetOpen(true)}
            refreshSignal={housekeepingRefreshSignal}
          />

          {/* Hospitality Concierge & Express Suite Assistance */}
          <div className="max-w-xl mx-auto px-4">
            <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Additional Suite Amenities
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Complimentary for all staying guests in {roomDisplay}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsHousekeepingSheetOpen(true)}
                  className="h-7 text-xs border-slate-700 text-slate-300 hover:text-white"
                >
                  More Options
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div
                  onClick={() => setIsHousekeepingSheetOpen(true)}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition-colors flex items-center gap-2"
                >
                  <Moon className="h-4 w-4 text-purple-400 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-200">Extra Pillows</p>
                    <p className="text-[9px] text-slate-500">Hypoallergenic</p>
                  </div>
                </div>

                <div
                  onClick={() => setIsHousekeepingSheetOpen(true)}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition-colors flex items-center gap-2"
                >
                  <Bath className="h-4 w-4 text-cyan-400 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-200">Bath Slippers</p>
                    <p className="text-[9px] text-slate-500">Plush cotton</p>
                  </div>
                </div>

                <div
                  onClick={handleReception}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition-colors flex items-center gap-2"
                >
                  <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-200">Late Checkout</p>
                    <p className="text-[9px] text-slate-500">Inquire desk</p>
                  </div>
                </div>

                <div
                  onClick={handleReception}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition-colors flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-200">Luggage Butler</p>
                    <p className="text-[9px] text-slate-500">Baggage pickup</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 2: IN-ROOM DINING (Browse Menu, Customizer, Cart)
          ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "dining" && (
        <div className="animate-in fade-in duration-300">
          {/* Search Bar */}
          <div className="max-w-xl mx-auto px-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search breakfast, chef specials, beverages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category Tabs */}
          {categories.length > 1 && (
            <div className="max-w-xl mx-auto px-4 mt-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold whitespace-nowrap transition-all capitalize cursor-pointer ${
                        isSelected
                          ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20"
                          : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <UtensilsCrossed className="h-3 w-3" />
                      <span>{cat === "all" ? "All Dishes" : cat}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 mt-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-emerald-400" />
                  <span>24/7 Suite Service Available</span>
                </div>
                <span className="text-emerald-400 font-semibold font-mono">
                  {filteredItems.length} {filteredItems.length === 1 ? "Option" : "Options"}
                </span>
              </div>
            </div>
          )}

          {/* Dishes Feed */}
          <div className="max-w-xl mx-auto px-4 mt-4 space-y-3.5">
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Loading fresh dishes from the hotel kitchen...</p>
              </div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((dish) => (
                <div
                  key={dish.id}
                  onClick={() =>
                    setCustomizingDish({
                      id: dish.id,
                      name: dish.name,
                      description: dish.description,
                      basePrice: dish.basePrice,
                      imageUrl: dish.imageUrl,
                      isVeg: dish.isVeg,
                      variants: dish.variants,
                      modifierGroups: dish.modifierGroups,
                    })
                  }
                  className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 transition-all flex gap-3.5 cursor-pointer group"
                >
                  {/* Left Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center justify-center h-3.5 w-3.5 rounded border ${
                            dish.isVeg
                              ? "border-emerald-500 text-emerald-400"
                              : "border-rose-500 text-rose-400"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              dish.isVeg ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                        </span>
                        <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                          {dish.name}
                        </h3>
                      </div>

                      {dish.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {dish.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/40">
                      <span className="text-sm font-extrabold font-mono text-white">
                        {formatCurrency(dish.basePrice, "INR")}
                      </span>

                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 px-2.5 xs:px-3 text-xs font-bold text-emerald-400 hover:text-white border-emerald-500/30 hover:bg-emerald-500/20 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomizingDish({
                            id: dish.id,
                            name: dish.name,
                            description: dish.description,
                            basePrice: dish.basePrice,
                            imageUrl: dish.imageUrl,
                            isVeg: dish.isVeg,
                            variants: dish.variants,
                            modifierGroups: dish.modifierGroups,
                          });
                        }}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        <span>Order<span className="hidden xs:inline"> to Suite</span></span>
                      </Button>
                    </div>
                  </div>

                  {/* Right Image */}
                  {dish.imageUrl && (
                    <div className="h-20 w-20 xs:h-24 xs:w-24 sm:h-28 sm:w-28 rounded-xl overflow-hidden bg-slate-800 shrink-0 relative">
                      <img
                        src={dish.imageUrl}
                        alt={dish.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs">
                <UtensilsCrossed className="h-8 w-8 mx-auto text-slate-400 opacity-50 mb-2" />
                <p className="font-semibold text-slate-300">
                  No dishes found in this category
                </p>
                <p className="text-[11px] text-slate-500">
                  Try choosing another meal category or clear your search term.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 3: SUITE INFO & WI-FI (Password, Concierge, Amenities)
          ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "info" && (
        <div className="max-w-xl mx-auto px-4 mt-4 space-y-4 animate-in fade-in duration-300">
          {/* Wi-Fi Credentials Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Wifi className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Complimentary High-Speed Wi-Fi</h3>
                <p className="text-[11px] text-slate-400">Unlimited 500 Mbps connection for {roomDisplay}</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Network</span>
                <p className="text-xs font-mono font-bold text-slate-200">GrandPalace_Guest_5G</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</span>
                <p className="text-xs font-mono font-bold text-emerald-400">GrandSuite@2025</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyWifi}
              className="w-full text-xs font-bold border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-slate-200 hover:text-emerald-400"
            >
              {copiedWifi ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                  <span>Password Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  <span>Copy Wi-Fi Password</span>
                </>
              )}
            </Button>
          </div>

          {/* Concierge & Hotel Contacts */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Direct Hotel Extensions</h3>
                <p className="text-[11px] text-slate-400">Pick up your room telephone or dial extension</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Front Desk</p>
                  <p className="text-[10px] text-slate-500">24/7 Reception</p>
                </div>
                <span className="font-mono font-bold text-emerald-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  Ext 0
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">In-Room Dining</p>
                  <p className="text-[10px] text-slate-500">Kitchen order</p>
                </div>
                <span className="font-mono font-bold text-emerald-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  Ext 1
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Housekeeping</p>
                  <p className="text-[10px] text-slate-500">Linen & butler</p>
                </div>
                <span className="font-mono font-bold text-emerald-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  Ext 2
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Concierge & Travel</p>
                  <p className="text-[10px] text-slate-500">Cabs & tours</p>
                </div>
                <span className="font-mono font-bold text-emerald-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  Ext 3
                </span>
              </div>
            </div>
          </div>

          {/* Key Timings */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Hotel Hours & Timings</h3>
                <p className="text-[11px] text-slate-400">Meal and facility operational schedules</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60">
                <span className="text-slate-300 font-medium">Breakfast Buffet (Dining Room)</span>
                <span className="font-mono text-slate-400">07:00 AM – 10:30 AM</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60">
                <span className="text-slate-300 font-medium">In-Room Dining Kitchen</span>
                <span className="font-mono text-emerald-400 font-bold">Open 24 Hours</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60">
                <span className="text-slate-300 font-medium">Swimming Pool & Spa</span>
                <span className="font-mono text-slate-400">06:00 AM – 10:00 PM</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60">
                <span className="text-slate-300 font-medium">Standard Check-out Time</span>
                <span className="font-mono text-amber-400 font-bold">11:00 AM</span>
              </div>
            </div>
          </div>

          {/* Suite Features Checklist */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {roomDisplay} Amenities
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/40">
                <Tv className="h-3.5 w-3.5 text-emerald-400" />
                <span>55" 4K Smart TV</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/40">
                <Wind className="h-3.5 w-3.5 text-emerald-400" />
                <span>Climate Control AC</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/40">
                <Coffee className="h-3.5 w-3.5 text-emerald-400" />
                <span>Nespresso Coffee Maker</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/40">
                <Bath className="h-3.5 w-3.5 text-emerald-400" />
                <span>Rainforest Shower</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Dish Customizer Modal ── */}
      <DishCustomizerSheet
        dish={customizingDish}
        isOpen={!!customizingDish}
        onClose={() => setCustomizingDish(null)}
      />

      {/* ── In-Room Dining Cart Drawer ── */}
      <CustomerCartDrawer
        tenantSlug={tenantSlug}
        tableSlug={`room-${cleanRoomNum.toLowerCase()}`}
        tableName={`${roomDisplay} (In-Room Dining)`}
        roomNumber={cleanRoomNum}
        destination="room_service"
        guestName={roomInfo?.currentGuestName}
      />

      {/* ── Suite Housekeeping & Amenities Request Sheet ── */}
      <CustomerHousekeepingSheet
        isOpen={isHousekeepingSheetOpen}
        onClose={() => setIsHousekeepingSheetOpen(false)}
        tenantSlug={tenantSlug}
        roomNumber={cleanRoomNum}
        roomDisplay={roomDisplay}
        onTaskCreated={() => {
          setHousekeepingRefreshSignal((prev) => prev + 1);
          setActiveTab("housekeeping");
        }}
      />
    </div>
  );
}
