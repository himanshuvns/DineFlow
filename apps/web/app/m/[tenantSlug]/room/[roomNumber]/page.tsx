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
  X,
  CalendarDays,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
import { CustomerExtendStayModal } from "@/components/customer/customer-extend-stay-modal";
import { useCartStore } from "@/lib/stores/cart-store";

interface RoomInfo {
  roomNumber: string;
  name: string;
  roomType: string;
  floor: string;
  wing: string;
  currentGuestName?: string;
  currentGuestCheckIn?: string;
  currentGuestExpectedCheckOut?: string;
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
  const [hotelLogo, setHotelLogo] = React.useState<string | null>(null);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [isVegOnly, setIsVegOnly] = React.useState(false);
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [customizingDish, setCustomizingDish] = React.useState<CustomizerDish | null>(null);
  const [isHousekeepingSheetOpen, setIsHousekeepingSheetOpen] = React.useState(false);
  const [housekeepingRefreshSignal, setHousekeepingRefreshSignal] = React.useState(0);
  const [isExtendStayModalOpen, setIsExtendStayModalOpen] = React.useState(false);
  const [roomRefreshSignal, setRoomRefreshSignal] = React.useState(0);
  const [activeTasksCount, setActiveTasksCount] = React.useState(0);
  const [latestActiveTask, setLatestActiveTask] = React.useState<{ title: string; status: string } | null>(null);
  const [copiedWifi, setCopiedWifi] = React.useState(false);
  const [dndStatus, setDndStatus] = React.useState(false);
  const [dndLoading, setDndLoading] = React.useState(false);
  const [extensionRequest, setExtensionRequest] = React.useState<{
    id?: string;
    status: "pending" | "approved" | "rejected";
    currentCheckout?: string;
    requestedCheckout: string;
    reason?: string;
  } | null>(null);
  const [roomOrders, setRoomOrders] = React.useState<any[]>([]);

  React.useEffect(() => {
    setContext(tenantSlug, `room-${cleanRoomNum.toLowerCase()}`);
  }, [tenantSlug, cleanRoomNum, setContext]);

  // Monitor active tasks in real-time (strictly guest requests)
  const checkActiveTasks = React.useCallback(() => {
    try {
      const storageKey = `dineflow_tasks_${tenantSlug}_${cleanRoomNum}`;
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const active = parsed.filter((t: any) => {
            if (t.source === "staff" || t.isGuestRequest === false) return false;
            const title = (t.title || "").toLowerCase();
            if (title.includes("checkout deep clean") || title.includes("linen refresh —") || title.includes("turnover")) {
              return false;
            }
            return t.status === "pending" || t.status === "in_progress";
          });
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
              currentGuestCheckIn: r.currentGuestCheckIn,
              currentGuestExpectedCheckOut: r.currentGuestExpectedCheckOut,
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
  }, [tenantSlug, cleanRoomNum, roomRefreshSignal]);

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
          if (data.tenant?.logo || data.tenant?.logoUrl) {
            setHotelLogo(data.tenant.logo || data.tenant.logoUrl);
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

  // Fetch DND Status
  React.useEffect(() => {
    let isMounted = true;
    async function loadDND() {
      try {
        const res = await fetch(
          `/api/room/dnd?tenantSlug=${encodeURIComponent(tenantSlug)}&roomNumber=${encodeURIComponent(cleanRoomNum)}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const json = await res.json();
          if (json.data && typeof json.data.dndStatus === "boolean" && isMounted) {
            setDndStatus(json.data.dndStatus);
          }
        }
      } catch (_) {}
    }
    loadDND();
    const interval = setInterval(loadDND, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [tenantSlug, cleanRoomNum, roomRefreshSignal]);

  const handleToggleDND = async () => {
    const nextStatus = !dndStatus;
    setDndStatus(nextStatus);
    setDndLoading(true);
    try {
      const res = await fetch("/api/room/dnd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug,
          roomNumber: cleanRoomNum,
          dndStatus: nextStatus,
          updatedBy: "guest",
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setDndStatus(!nextStatus);
        addToast("error", "DND Update Failed", data?.error || "Could not update Do Not Disturb status");
      } else {
        if (nextStatus) {
          addToast(
            "success",
            "🔴 Do Not Disturb Activated",
            "Housekeeping and room visits are paused. Dining orders and emergency alerts remain active."
          );
        } else {
          addToast(
            "success",
            "🟢 Service Available",
            "Housekeeping and suite service are welcome."
          );
        }
      }
    } catch (err) {
      setDndStatus(!nextStatus);
      addToast("error", "Error", "Failed to update Do Not Disturb");
    } finally {
      setDndLoading(false);
    }
  };

  // Fetch Stay Extension Request Status
  React.useEffect(() => {
    let isMounted = true;
    async function loadExtension() {
      try {
        const res = await fetch(
          `/api/room/extend-stay?tenantSlug=${encodeURIComponent(tenantSlug)}&roomNumber=${encodeURIComponent(cleanRoomNum)}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const json = await res.json();
          if (json.data?.request && isMounted) {
            setExtensionRequest(json.data.request);
          } else if (isMounted) {
            setExtensionRequest(null);
          }
        }
      } catch (_) {}
    }
    loadExtension();
    const interval = setInterval(loadExtension, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [tenantSlug, cleanRoomNum, roomRefreshSignal]);

  // Fetch Live Room In-Room Dining Orders
  React.useEffect(() => {
    let isMounted = true;
    async function loadOrders() {
      try {
        const res = await fetch(
          `/api/room/orders?tenantSlug=${encodeURIComponent(tenantSlug)}&roomNumber=${encodeURIComponent(cleanRoomNum)}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const json = await res.json();
          const orders = json.data?.orders || json.orders || [];
          if (Array.isArray(orders) && isMounted) {
            setRoomOrders(orders);
          }
        }
      } catch (_) {}
    }
    loadOrders();
    const interval = setInterval(loadOrders, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [tenantSlug, cleanRoomNum]);

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
    if (isVegOnly && !item.isVeg) return false;
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-36 font-sans transition-colors duration-200">
      {/* ── Luxury Hotel In-Room Dining Hero ── */}
      <div className="relative">
        <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-slate-200 dark:bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80"
            alt="Hotel Suite"
            className="w-full h-full object-cover brightness-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/60 dark:via-slate-950/60 to-transparent" />

          {/* Top Bar Indicators */}
          <div className="absolute top-4 inset-x-4 max-w-xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-700 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 shadow-sm">
                <Hotel className="h-3.5 w-3.5" />
                <span>Guest Hospitality Portal</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExtendStayModalOpen(true)}
                className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all hover:scale-105 cursor-pointer"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Extend Stay</span>
              </button>
              <ThemeToggle className="h-8 w-8 rounded-full bg-white/90 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm" />
              <Badge variant="glow" size="sm" className="font-mono font-extrabold text-xs">
                {roomDisplay}
              </Badge>
            </div>
          </div>
        </div>

        {/* Hotel Header Card */}
        <div className="max-w-xl mx-auto px-4 -mt-14 relative z-10">
          <div className="p-4 sm:p-5 rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-2xl backdrop-blur-md">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Private Guest Suite Service
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {hotelName}
                </h1>
                {roomInfo?.currentGuestName ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 truncate">
                    Welcome, {roomInfo.currentGuestName} • Silver tray delivery to your door
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Silver tray delivery directly to your door • 24/7 Butler care
                  </p>
                )}

                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsExtendStayModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all hover:scale-105 cursor-pointer"
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>Extend Stay</span>
                    {roomInfo?.currentGuestExpectedCheckOut && (
                      <span className="text-[10px] opacity-90 border-l border-white/40 pl-1.5 font-medium">
                        Until {new Date(roomInfo.currentGuestExpectedCheckOut).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </button>
                </div>
              </div>
              {hotelLogo && (
                <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700/80 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                  <img src={hotelLogo} alt={hotelName} className="h-full w-full object-contain" />
                </div>
              )}
            </div>

            {/* Quick Guest Amenities Shortcuts (4 columns) */}
            <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("housekeeping")}
                className={`p-2 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer group ${
                  activeTab === "housekeeping"
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
                    : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="relative">
                  <Bed className="h-4 w-4 text-emerald-500 dark:text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                  {activeTasksCount > 0 && (
                    <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping absolute -top-1 -right-1" />
                  )}
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold">Suite Flow</span>
                <span className="text-[8px] sm:text-[9px] text-slate-500">
                  {activeTasksCount > 0 ? `${activeTasksCount} Active` : "Status"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("dining")}
                className={`p-2 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer group ${
                  activeTab === "dining"
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
                    : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <UtensilsCrossed className="h-4 w-4 text-cyan-600 dark:text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] sm:text-[11px] font-bold">Dining</span>
                <span className="text-[8px] sm:text-[9px] text-slate-500">Food Menu</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExtendStayModalOpen(true)}
                className="p-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 flex flex-col items-center text-center transition-all cursor-pointer group shadow-xs"
              >
                <CalendarDays className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] sm:text-[11px] font-bold">Extend Stay</span>
                <span className="text-[8px] sm:text-[9px] text-emerald-600/80 dark:text-emerald-400/80">Add Nights</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("info")}
                className={`p-2 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer group ${
                  activeTab === "info"
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
                    : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <Wifi className="h-4 w-4 text-amber-500 dark:text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] sm:text-[11px] font-bold">Suite Info</span>
                <span className="text-[8px] sm:text-[9px] text-slate-500">Wi-Fi</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Persistent Stay Status & Extend Bar (Always Visible Across All Tabs) ── */}
      <div className="max-w-xl mx-auto px-4 mt-3 space-y-2.5">
        <div className="p-3 sm:p-3.5 rounded-2xl border border-emerald-500/30 bg-white/95 dark:bg-slate-900/95 shadow-md backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {roomDisplay} Stay
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                  In-House
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                {roomInfo?.currentGuestExpectedCheckOut
                  ? `Check-out: ${new Date(roomInfo.currentGuestExpectedCheckOut).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} • 11:00 AM`
                  : "Scheduled Check-out: 11:00 AM UTC"}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setIsExtendStayModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 shadow-md rounded-xl h-8 px-3 gap-1.5 cursor-pointer"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            <span>Extend Stay</span>
          </Button>
        </div>

        {/* ── Customer DND (Do Not Disturb) Control Card ── */}
        <div
          className={`p-3 sm:p-3.5 rounded-2xl border transition-all shadow-sm ${
            dndStatus
              ? "bg-rose-50/90 dark:bg-rose-950/40 border-rose-400/50 dark:border-rose-800"
              : "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300/60 dark:border-emerald-900/50"
          } flex items-center justify-between gap-3`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${
                dndStatus
                  ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30"
                  : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              }`}
            >
              {dndStatus ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  Do Not Disturb (DND)
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                    dndStatus
                      ? "bg-rose-500 text-white shadow-xs"
                      : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      dndStatus ? "bg-white animate-pulse" : "bg-emerald-500"
                    }`}
                  />
                  {dndStatus ? "🔴 DND Active" : "🟢 Available"}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                {dndStatus
                  ? "Housekeeping paused • Dining orders & emergency permitted"
                  : "Suite ready for housekeeping and routine service"}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={dndLoading}
            onClick={handleToggleDND}
            aria-label="Toggle Do Not Disturb"
            className={`min-h-[44px] min-w-[76px] px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center cursor-pointer ${
              dndStatus
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
            }`}
          >
            {dndLoading ? (
              <span className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
            ) : dndStatus ? (
              "Turn OFF"
            ) : (
              "Set DND"
            )}
          </button>
        </div>

        {/* ── Stay Extension Pending / Confirmed Alert Banner ── */}
        {extensionRequest && (
          <div
            className={`p-3 rounded-2xl border transition-all text-xs flex items-start gap-2.5 ${
              extensionRequest.status === "pending"
                ? "bg-amber-50 dark:bg-amber-950/40 border-amber-400/60 dark:border-amber-800 text-amber-900 dark:text-amber-200"
                : extensionRequest.status === "approved"
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400/60 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                : "bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {extensionRequest.status === "pending" ? (
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-spin" />
              ) : extensionRequest.status === "approved" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <ShieldAlert className="h-4 w-4 text-slate-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold">
                  {extensionRequest.status === "pending"
                    ? "Stay Extension Pending Review"
                    : extensionRequest.status === "approved"
                    ? "Stay Extension Approved"
                    : "Stay Extension Request"}
                </span>
                <Badge
                  variant={
                    extensionRequest.status === "pending"
                      ? "warning"
                      : extensionRequest.status === "approved"
                      ? "success"
                      : "secondary"
                  }
                  size="sm"
                  className="text-[9px] uppercase tracking-wider font-extrabold"
                >
                  {extensionRequest.status}
                </Badge>
              </div>
              <p className="text-[11px] opacity-90 mt-0.5">
                {extensionRequest.status === "pending"
                  ? `Requested checkout: ${new Date(
                      extensionRequest.requestedCheckout
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}. Front desk has been notified.`
                  : extensionRequest.status === "approved"
                  ? `Your checkout date has been extended to ${new Date(
                      extensionRequest.requestedCheckout
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}.`
                  : extensionRequest.reason ||
                    "Unable to extend dates due to full occupancy. Please contact front desk."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Segmented Navigation Control ── */}
      <div className="max-w-xl mx-auto px-4 mt-4 sticky top-2 z-30">
        <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveTab("dining")}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "dining"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Bed className="h-3.5 w-3.5" />
            <span>Housekeeping</span>
            {activeTasksCount > 0 ? (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[9px] font-extrabold animate-pulse">
                {activeTasksCount}
              </span>
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "info"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
            className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-emerald-50 dark:from-emerald-950/90 dark:via-slate-900 dark:to-emerald-950/90 border-2 border-emerald-500/60 flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-all shadow-lg shadow-emerald-500/10 group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                  <span className="text-slate-600 dark:text-slate-300">Live Service:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">{latestActiveTask?.title}</span>
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {latestActiveTask?.status === "in_progress"
                    ? "Steward attending to your suite right now"
                    : "Request received • Housekeeping dispatched"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0 ml-2">
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
            <div className="p-4 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300">
                    Additional Suite Amenities
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Complimentary for all staying guests in {roomDisplay}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsHousekeepingSheetOpen(true)}
                  className="h-7 text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  More Options
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div
                  onClick={() => setIsHousekeepingSheetOpen(true)}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition-colors flex items-center gap-2"
                >
                  <Moon className="h-4 w-4 text-purple-500 dark:text-purple-400 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Extra Pillows</p>
                    <p className="text-[9px] text-slate-500">Hypoallergenic</p>
                  </div>
                </div>

                <div
                  onClick={() => setIsHousekeepingSheetOpen(true)}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition-colors flex items-center gap-2"
                >
                  <Bath className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Bath Slippers</p>
                    <p className="text-[9px] text-slate-500">Plush cotton</p>
                  </div>
                </div>

                <div
                  onClick={handleReception}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition-colors flex items-center gap-2"
                >
                  <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Late Checkout</p>
                    <p className="text-[9px] text-slate-500">Inquire desk</p>
                  </div>
                </div>

                <div
                  onClick={handleReception}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition-colors flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Luggage Butler</p>
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
          {/* ── Active In-Room Dining Orders Tracker ── */}
          {roomOrders.length > 0 && (
            <div className="max-w-xl mx-auto px-4 mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <UtensilsCrossed className="h-3.5 w-3.5 text-emerald-500" />
                  Live Suite Orders ({roomOrders.length})
                </span>
              </div>
              {roomOrders.slice(0, 3).map((ord) => (
                <div
                  key={ord.id || ord._id}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        #{ord.orderNumber || (ord.id || ord._id).slice(-4)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                          ord.status === "delivered" || ord.status === "completed"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : ord.status === "preparing" || ord.status === "in_progress"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 animate-pulse"
                            : "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                        }`}
                      >
                        {ord.status}
                      </span>
                      {ord.orderSource === "front_desk" && (
                        <span className="px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 text-[9px] font-bold">
                          Front Desk Placed
                        </span>
                      )}
                      {ord.billingMethod && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-medium">
                          {ord.billingMethod === "room_folio"
                            ? "Room Bill"
                            : ord.billingMethod === "complimentary"
                            ? "Complimentary"
                            : "Paid"}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {Array.isArray(ord.items)
                        ? ord.items.map((i: any) => `${i.quantity}x ${i.name}`).join(", ")
                        : "Suite Dining Delivery"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(ord.totalAmount || ord.total || 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search Bar */}
          <div className="max-w-xl mx-auto px-4 mt-4">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search breakfast, chef specials, beverages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors shadow-xs"
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
          </div>

          {/* Category Tabs & Veg Filter */}
          {categories.length > 0 && (
            <div className="max-w-xl mx-auto px-4 mt-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {/* 1-Tap Pure Veg Toggle */}
                <button
                  type="button"
                  onClick={() => setIsVegOnly(!isVegOnly)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isVegOnly
                      ? "bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-md shadow-emerald-500/20"
                      : "bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${isVegOnly ? "bg-slate-950" : "bg-emerald-500 dark:bg-emerald-400"}`} />
                  <span>Veg Only</span>
                </button>

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
                          : "bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <UtensilsCrossed className="h-3 w-3" />
                      <span>{cat === "all" ? "All Dishes" : cat}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 mt-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
                  <span>24/7 Suite Service Available</span>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
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
                <p className="text-xs text-slate-500 dark:text-slate-400">Loading fresh dishes from the hotel kitchen...</p>
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
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all flex gap-3.5 cursor-pointer group shadow-sm hover:shadow-md dark:shadow-none"
                >
                  {/* Left Info */}
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
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                          {dish.name}
                        </h3>
                      </div>

                      {dish.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {dish.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/40">
                      <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">
                        {formatCurrency(dish.basePrice, "INR")}
                      </span>

                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 px-2.5 xs:px-3 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 dark:hover:bg-emerald-500/20 shrink-0"
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
                    <div className="h-20 w-20 xs:h-24 xs:w-24 sm:h-28 sm:w-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 relative">
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
              <div className="py-16 text-center text-slate-500 text-xs space-y-2">
                <UtensilsCrossed className="h-8 w-8 mx-auto text-slate-400 opacity-50 mb-2" />
                <p className="font-semibold text-slate-800 dark:text-slate-300">
                  No dishes found matching your selection
                </p>
                <p className="text-[11px] text-slate-500">
                  Try choosing another category or clearing your search / veg filter.
                </p>
                {(searchQuery || isVegOnly || selectedCategory !== "all") && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      onClick={() => {
                        setSearchQuery("");
                        setIsVegOnly(false);
                        setSelectedCategory("all");
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                )}
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
          {/* Your Stay & Check-out Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center border border-primary/30">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Your Stay & Reservation</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {roomDisplay} • {roomInfo?.currentGuestName || "Active Reservation"}
                  </p>
                </div>
              </div>
              <Badge variant="success" dot size="sm" className="text-[10px] font-bold">
                In-House
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">
                  Check-In
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {roomInfo?.currentGuestCheckIn
                    ? new Date(roomInfo.currentGuestCheckIn).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Current Stay"}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">
                  Scheduled Check-Out
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {roomInfo?.currentGuestExpectedCheckOut
                    ? `${new Date(roomInfo.currentGuestExpectedCheckOut).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })} • 11:00 AM`
                    : "11:00 AM UTC"}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsExtendStayModalOpen(true)}
              className="w-full text-xs font-bold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 rounded-xl cursor-pointer"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Extend Your Stay</span>
            </Button>
            <p className="text-[10px] text-center text-slate-400 dark:text-slate-500">
              Stays can only be extended from the portal. Early departures are handled by Front Desk.
            </p>
          </div>

          {/* Wi-Fi Credentials Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Wifi className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Complimentary High-Speed Wi-Fi</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Unlimited 500 Mbps connection for {roomDisplay}</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Network</span>
                <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">GrandPalace_Guest_5G</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Password</span>
                <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">GrandSuite@2025</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyWifi}
              className="w-full text-xs font-bold border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 bg-white hover:bg-emerald-50 dark:bg-transparent dark:hover:bg-emerald-500/10 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              {copiedWifi ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-500 dark:text-emerald-400" />
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
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Direct Hotel Extensions</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Pick up your room telephone or dial extension</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Front Desk</p>
                  <p className="text-[10px] text-slate-500">24/7 Reception</p>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
                  Ext 0
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">In-Room Dining</p>
                  <p className="text-[10px] text-slate-500">Kitchen order</p>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
                  Ext 1
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Housekeeping</p>
                  <p className="text-[10px] text-slate-500">Linen & butler</p>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
                  Ext 2
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Concierge & Travel</p>
                  <p className="text-[10px] text-slate-500">Cabs & tours</p>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
                  Ext 3
                </span>
              </div>
            </div>
          </div>

          {/* Key Timings */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Hotel Hours & Timings</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Meal and facility operational schedules</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Breakfast Buffet (Dining Room)</span>
                <span className="font-mono text-slate-500 dark:text-slate-400">07:00 AM – 10:30 AM</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60">
                <span className="text-slate-700 dark:text-slate-300 font-medium">In-Room Dining Kitchen</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Open 24 Hours</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Swimming Pool & Spa</span>
                <span className="font-mono text-slate-500 dark:text-slate-400">06:00 AM – 10:00 PM</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Standard Check-out Time</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">11:00 AM</span>
              </div>
            </div>
          </div>

          {/* Suite Features Checklist */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {roomDisplay} Amenities
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60">
                <Tv className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>55" 4K Smart TV</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60">
                <Wind className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>Climate Control AC</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60">
                <Coffee className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>Nespresso Coffee Maker</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60">
                <Bath className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
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

      {/* ── Customer Extend Stay Modal ── */}
      <CustomerExtendStayModal
        isOpen={isExtendStayModalOpen}
        onClose={() => setIsExtendStayModalOpen(false)}
        tenantSlug={tenantSlug}
        roomNumber={cleanRoomNum}
        roomDisplay={roomDisplay}
        currentGuestName={roomInfo?.currentGuestName}
        currentCheckIn={roomInfo?.currentGuestCheckIn}
        currentCheckOut={roomInfo?.currentGuestExpectedCheckOut}
        onStayExtended={() => {
          setRoomRefreshSignal((prev) => prev + 1);
        }}
      />
    </div>
  );
}
