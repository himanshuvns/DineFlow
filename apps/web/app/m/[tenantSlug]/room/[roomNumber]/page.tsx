"use client";

import * as React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import {
  DishCustomizerSheet,
  CustomizerDish,
} from "@/components/customer/dish-customizer-sheet";
import { CustomerCartDrawer } from "@/components/customer/customer-cart-drawer";
import { useCartStore } from "@/lib/stores/cart-store";

// Curated 5-Star Hotel In-Room Dining Menu
const ROOM_SERVICE_CATALOG: {
  mealPeriod: string;
  hours: string;
  icon: typeof Coffee;
  items: CustomizerDish[];
}[] = [
  {
    mealPeriod: "All-Day In-Room Dining",
    hours: "11:00 AM – 11:00 PM",
    icon: UtensilsCrossed,
    items: [
      {
        id: "ird-1",
        name: "Artisanal Grand Club Sandwich",
        description:
          "Triple-decker toasted brioche, slow-roasted chicken breast, smoked turkey bacon, aged cheddar, butter lettuce, and heirloom tomato with truffle crisps.",
        basePrice: 780,
        imageUrl:
          "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
        isVeg: false,
        variants: [
          { name: "With Truffle French Fries", price: 780 },
          { name: "With Sweet Potato Fries & Salad", price: 840 },
        ],
      },
      {
        id: "ird-2",
        name: "Handmade Wild Mushroom Tagliatelle",
        description:
          "Fresh egg tagliatelle, sautéed forest porcini and chanterelles, Parmigiano-Reggiano emulsion, and white truffle perfume.",
        basePrice: 890,
        imageUrl:
          "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
      {
        id: "ird-3",
        name: "Pan-Seared Atlantic Salmon",
        description:
          "Crispy skin Norwegian salmon fillet on saffron cauliflower purée, grilled asparagus spears, and caper-dill beurre blanc.",
        basePrice: 1350,
        imageUrl:
          "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80",
        isVeg: false,
      },
    ],
  },
  {
    mealPeriod: "Breakfast & Morning Fare",
    hours: "06:30 AM – 11:00 AM",
    icon: Coffee,
    items: [
      {
        id: "ird-4",
        name: "Truffle Eggs Royale Benedict",
        description:
          "Poached organic eggs, house-cured gravlax salmon, wilted baby spinach, and velvety black truffle hollandaise on warm brioche.",
        basePrice: 720,
        imageUrl:
          "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80",
        isVeg: false,
      },
      {
        id: "ird-5",
        name: "Parisian Bakery Basket",
        description:
          "Freshly baked butter croissant, pain au chocolat, almond escargot, accompanied by Bordier Normandy butter and artisanal strawberry preserves.",
        basePrice: 520,
        imageUrl:
          "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
    ],
  },
  {
    mealPeriod: "Late Night Comfort Supper",
    hours: "11:00 PM – 06:00 AM",
    icon: Moon,
    items: [
      {
        id: "ird-6",
        name: "Midnight Truffle Burger",
        description:
          "Dry-aged Wagyu beef patty, molten gruyère cheese, caramelized shallots, black garlic mayo on a toasted milk bun.",
        basePrice: 940,
        imageUrl:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        isVeg: false,
      },
      {
        id: "ird-7",
        name: "Warm Velvety Valrhona Chocolate Pot",
        description:
          "Decadent dark chocolate molten mousse, sea salt flakes, paired with fresh raspberries and warm vanilla milk.",
        basePrice: 460,
        imageUrl:
          "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
    ],
  },
  {
    mealPeriod: "Sommelier Cellar & Beverages",
    hours: "Available 24 Hours",
    icon: Wine,
    items: [
      {
        id: "ird-8",
        name: "Veuve Clicquot Yellow Label (750ml)",
        description:
          "Chilled Champagne served with crystal flutes in a silver ice bucket.",
        basePrice: 9800,
        imageUrl:
          "https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
      {
        id: "ird-9",
        name: "Fresh Pressed Valencia Citrus Juice",
        description:
          "100% cold pressed sweet Spanish oranges, served over ice.",
        basePrice: 320,
        imageUrl:
          "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
    ],
  },
];

export default function RoomServiceMenuPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const { setContext } = useCartStore();

  const tenantSlug = (params?.tenantSlug as string) || "the-grand-bistro";
  const rawRoomNumber = (params?.roomNumber as string) || "302";

  const roomDisplay = rawRoomNumber.toUpperCase().startsWith("ROOM-")
    ? `Room ${rawRoomNumber.slice(5)}`
    : rawRoomNumber.toUpperCase().startsWith("SUITE-")
    ? `Suite ${rawRoomNumber.slice(6)}`
    : !isNaN(Number(rawRoomNumber))
    ? `Suite ${rawRoomNumber}`
    : rawRoomNumber;

  const [activeMealPeriod, setActiveMealPeriod] = React.useState(ROOM_SERVICE_CATALOG[0].mealPeriod);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [customizingDish, setCustomizingDish] = React.useState<CustomizerDish | null>(null);

  React.useEffect(() => {
    setContext(tenantSlug, `room-${rawRoomNumber}`);
  }, [tenantSlug, rawRoomNumber, setContext]);

  // Amenity request handlers
  const handleHousekeeping = () => {
    addToast(
      "success",
      "Housekeeping Dispatched",
      `Housekeeping steward alerted for ${roomDisplay}. Fresh towels and amenities are on their way.`
    );
  };

  const handleIceBucket = () => {
    addToast(
      "success",
      "Ice Bucket Requested",
      `Silver ice bucket will be delivered to ${roomDisplay} within 10 minutes.`
    );
  };

  const handleReception = () => {
    addToast(
      "info",
      "Front Desk & Concierge",
      "Dial 0 on your in-room telephone or WhatsApp concierge at +91 98765 43210."
    );
  };

  const selectedCatalog = ROOM_SERVICE_CATALOG.find(
    (c) => c.mealPeriod === activeMealPeriod
  ) || ROOM_SERVICE_CATALOG[0];

  const filteredItems = selectedCatalog.items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-32">
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
                  The Grand Palace & Spa
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Silver tray delivery directly to your door • Complimentary setup
                </p>
              </div>
            </div>

            {/* Quick Guest Amenities Shortcuts */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleHousekeeping}
                className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 flex flex-col items-center text-center transition-colors"
              >
                <Bed className="h-4 w-4 text-emerald-400 mb-1" />
                <span className="text-[11px] font-semibold text-slate-200">Housekeeping</span>
                <span className="text-[9px] text-slate-500">Towels / Pillows</span>
              </button>

              <button
                type="button"
                onClick={handleIceBucket}
                className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 flex flex-col items-center text-center transition-colors"
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
                placeholder="Search in-room breakfast, mains, drinks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Meal Period Schedule Selector */}
      <div className="max-w-xl mx-auto px-4 mt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {ROOM_SERVICE_CATALOG.map((period) => {
            const isSelected = activeMealPeriod === period.mealPeriod;
            const Icon = period.icon;
            return (
              <button
                key={period.mealPeriod}
                type="button"
                onClick={() => setActiveMealPeriod(period.mealPeriod)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20"
                    : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{period.mealPeriod}</span>
              </button>
            );
          })}
        </div>

        {/* Operating Hours Info */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 mt-1">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-emerald-400" />
            <span>Service Hours: {selectedCatalog.hours}</span>
          </div>
          <span className="text-emerald-400 font-semibold">Silver Tray Service</span>
        </div>
      </div>

      {/* Dishes Feed */}
      <div className="max-w-xl mx-auto px-4 mt-6 space-y-3.5">
        {filteredItems.map((dish) => (
          <div
            key={dish.id}
            onClick={() => setCustomizingDish(dish)}
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

                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {dish.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/40">
                <span className="text-sm font-extrabold font-mono text-white">
                  {formatCurrency(dish.basePrice, "INR")}
                </span>

                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 px-3 text-xs font-bold text-emerald-400 hover:text-white border-emerald-500/30 hover:bg-emerald-500/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCustomizingDish(dish);
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  <span>Order to Suite</span>
                </Button>
              </div>
            </div>

            {/* Right Image */}
            {dish.imageUrl && (
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl overflow-hidden bg-slate-800 shrink-0 relative">
                <img
                  src={dish.imageUrl}
                  alt={dish.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dish Customizer Modal */}
      <DishCustomizerSheet
        dish={customizingDish}
        isOpen={!!customizingDish}
        onClose={() => setCustomizingDish(null)}
      />

      {/* In-Room Dining Cart Drawer with Room Folio support */}
      <CustomerCartDrawer
        tenantSlug={tenantSlug}
        tableSlug={`room-${rawRoomNumber}`}
        tableName={`${roomDisplay} (In-Room Dining)`}
      />
    </div>
  );
}
