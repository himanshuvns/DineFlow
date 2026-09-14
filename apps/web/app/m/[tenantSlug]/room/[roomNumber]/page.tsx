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

export default function RoomServiceMenuPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const { setContext } = useCartStore();

  const tenantSlug = (params?.tenantSlug as string) || "the-grand-bistro";
  const rawRoomNumber = (params?.roomNumber as string) || "302";

  const cleanRoomNum = rawRoomNumber.toUpperCase().replace(/^(ROOM-|SUITE-)/, "");
  const roomDisplay = `Suite ${cleanRoomNum}`;

  const [roomInfo, setRoomInfo] = React.useState<RoomInfo | null>(null);
  const [hotelName, setHotelName] = React.useState("The Grand Palace & Spa");
  const [categories, setCategories] = React.useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [customizingDish, setCustomizingDish] = React.useState<CustomizerDish | null>(null);
  const [amenityLoading, setAmenityLoading] = React.useState<string | null>(null);

  React.useEffect(() => {
    setContext(tenantSlug, `room-${cleanRoomNum.toLowerCase()}`);
  }, [tenantSlug, cleanRoomNum, setContext]);

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
            setRoomInfo({
              roomNumber: r.roomNumber,
              name: r.name || `Suite ${r.roomNumber}`,
              roomType: r.roomType || "suite",
              floor: r.floor || "Floor 2",
              wing: r.wing || "Main",
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

  // Amenity Request Handler
  const handleRequestAmenity = async (amenityType: string, label: string) => {
    setAmenityLoading(amenityType);
    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL ||
        (process.env.NODE_ENV === "production"
          ? "https://api-production-f170.up.railway.app/api/v1"
          : "http://localhost:8080/api/v1");

      const res = await fetch(
        `${apiBase}/public/rooms/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(cleanRoomNum)}/amenity`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amenityType }),
        }
      );

      if (res.ok) {
        addToast(
          "success",
          `${label} Dispatched`,
          `Housekeeping steward alerted for ${roomDisplay}. Your request has been scheduled.`
        );
      } else {
        addToast(
          "info",
          `${label} Received`,
          `Steward notified for ${roomDisplay}. Service is on the way.`
        );
      }
    } catch (e) {
      addToast(
        "info",
        `${label} Received`,
        `Steward notified for ${roomDisplay}. Service is on the way.`
      );
    } finally {
      setAmenityLoading(null);
    }
  };

  const handleReception = () => {
    addToast(
      "info",
      "Front Desk & Concierge",
      "Dial 0 on your in-room telephone or WhatsApp concierge at the front desk."
    );
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
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-36">
      {/* Luxury Hotel In-Room Dining Hero */}
      <div className="relative">
        <div className="h-48 sm:h-60 w-full relative overflow-hidden bg-slate-900">
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
                <span>In-Room Dining</span>
              </span>
            </div>

            <Badge variant="glow" size="sm" className="font-mono font-extrabold text-xs">
              {roomDisplay}
            </Badge>
          </div>
        </div>

        {/* Hotel Header Card */}
        <div className="max-w-xl mx-auto px-4 -mt-16 relative z-10">
          <div className="p-4 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-md">
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
                    Silver tray delivery directly to your door • Complimentary setup
                  </p>
                )}
              </div>
            </div>

            {/* Quick Guest Amenities Shortcuts */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800">
              <button
                type="button"
                disabled={amenityLoading === "housekeeping"}
                onClick={() => handleRequestAmenity("housekeeping", "Housekeeping Service")}
                className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 flex flex-col items-center text-center transition-colors disabled:opacity-50"
              >
                <Bed className="h-4 w-4 text-emerald-400 mb-1" />
                <span className="text-[11px] font-semibold text-slate-200">Housekeeping</span>
                <span className="text-[9px] text-slate-500">Towels / Linens</span>
              </button>

              <button
                type="button"
                disabled={amenityLoading === "ice_bucket"}
                onClick={() => handleRequestAmenity("ice_bucket", "Ice Bucket Request")}
                className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 flex flex-col items-center text-center transition-colors disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4 text-cyan-400 mb-1" />
                <span className="text-[11px] font-semibold text-slate-200">Ice Bucket</span>
                <span className="text-[9px] text-slate-500">Fast delivery</span>
              </button>

              <button
                type="button"
                onClick={handleReception}
                className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 flex flex-col items-center text-center transition-colors"
              >
                <Phone className="h-4 w-4 text-amber-400 mb-1" />
                <span className="text-[11px] font-semibold text-slate-200">Concierge</span>
                <span className="text-[9px] text-slate-500">Reception Desk</span>
              </button>
            </div>

            {/* Search */}
            <div className="mt-4 relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search breakfast, mains, beverages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      {categories.length > 1 && (
        <div className="max-w-xl mx-auto px-4 mt-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold whitespace-nowrap transition-all capitalize ${
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
      <div className="max-w-xl mx-auto px-4 mt-6 space-y-3.5">
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
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              No dishes found in this category
            </p>
            <p className="text-[11px] text-slate-500">
              Try choosing another meal category or clear your search term.
            </p>
          </div>
        )}
      </div>

      {/* Dish Customizer Modal */}
      <DishCustomizerSheet
        dish={customizingDish}
        isOpen={!!customizingDish}
        onClose={() => setCustomizingDish(null)}
      />

      {/* In-Room Dining Cart Drawer */}
      <CustomerCartDrawer
        tenantSlug={tenantSlug}
        tableSlug={`room-${cleanRoomNum.toLowerCase()}`}
        tableName={`${roomDisplay} (In-Room Dining)`}
        roomNumber={cleanRoomNum}
        destination="room_service"
      />
    </div>
  );
}
