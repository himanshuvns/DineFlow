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
import { useTenantDataStore } from "@/lib/stores/tenant-data-store";
import { isCategoryMatch } from "@/lib/utils/category-utils";

// Gourmet mock menu with rich data and high-res photography
const MENU_DATA: {
  category: string;
  items: CustomizerDish[];
}[] = [
  {
    category: "Chef's Signatures & Starters",
    items: [
      {
        id: "dish-1",
        name: "Truffle Burrata & Heirloom Salad",
        description:
          "Artisanal Pugliese burrata on roasted heirloom tomatoes, Modena aged balsamic caviar, basil emulsion, and toasted pine nuts.",
        basePrice: 680,
        imageUrl:
          "https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
        modifierGroups: [
          {
            id: "mod-cheese",
            name: "Cheese & Additions",
            minSelections: 0,
            maxSelections: 2,
            options: [
              { name: "Extra Burrata (100g)", price: 220 },
              { name: "Shaved Black Truffle", price: 350 },
            ],
          },
        ],
      },
      {
        id: "dish-2",
        name: "Smoked Salmon Crostini",
        description:
          "Norwegian cold-smoked salmon on sourdough crisps with whipped dill ricotta, caper berries, and lemon zest.",
        basePrice: 720,
        imageUrl:
          "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80",
        isVeg: false,
        variants: [
          { name: "Regular (3 pcs)", price: 720 },
          { name: "Platter (6 pcs)", price: 1280 },
        ],
      },
      {
        id: "dish-3",
        name: "Wild Mushroom Arancini",
        description:
          "Crispy saffron risotto balls stuffed with smoked provolone and porcini mushrooms, served with roasted garlic aioli.",
        basePrice: 540,
        imageUrl:
          "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
    ],
  },
  {
    category: "Artisanal Wood-Fired Pizzas",
    items: [
      {
        id: "dish-4",
        name: "Diavola & Calabrian Hot Honey",
        description:
          "San Marzano tomato sauce, fior di latte mozzarella, spicy spianata calabrese, and a generous drizzle of hot chili honey.",
        basePrice: 820,
        imageUrl:
          "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80",
        isVeg: false,
        variants: [
          { name: "11-Inch Hand-Tossed", price: 820 },
          { name: "14-Inch Sharing Size", price: 1190 },
        ],
        modifierGroups: [
          {
            id: "mod-crust",
            name: "Crust Selection",
            minSelections: 0,
            maxSelections: 1,
            options: [
              { name: "Classic Neapolitan Crust", price: 0 },
              { name: "Gluten-Free Cauliflower Crust", price: 150 },
            ],
          },
          {
            id: "mod-cheese-toppings",
            name: "Extra Toppings",
            minSelections: 0,
            maxSelections: 3,
            options: [
              { name: "Double Mozzarella", price: 120 },
              { name: "Fresh Jalapeños", price: 60 },
              { name: "Gorgonzola Crumbles", price: 140 },
            ],
          },
        ],
      },
      {
        id: "dish-5",
        name: "Tartufata Bianca (White Truffle)",
        description:
          "Taleggio and fontina cream base, roasted wild mushrooms, thyme, white truffle oil, and baby arugula.",
        basePrice: 890,
        imageUrl:
          "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
        variants: [
          { name: "11-Inch Hand-Tossed", price: 890 },
          { name: "14-Inch Sharing Size", price: 1250 },
        ],
      },
    ],
  },
  {
    category: "Mains & Pastas",
    items: [
      {
        id: "dish-6",
        name: "Handmade Truffle Tagliolini",
        description:
          "Egg ribbon pasta spun in 24-month aged Parmigiano wheel with European butter and freshly shaved seasonal truffle.",
        basePrice: 940,
        imageUrl:
          "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
      {
        id: "dish-7",
        name: "Herb-Crusted New Zealand Lamb Chops",
        description:
          "Sous-vide and seared lamb chops with rosemary jus, parsnip purée, and glazed baby carrots.",
        basePrice: 1450,
        imageUrl:
          "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
        isVeg: false,
      },
    ],
  },
  {
    category: "Craft Drinks & Beverages",
    items: [
      {
        id: "dish-8",
        name: "Valencia Orange & Rosemary Spritz",
        description:
          "Fresh pressed Valencia citrus, craft rosemary syrup, sparkling tonic water, and charred rosemary sprig.",
        basePrice: 340,
        imageUrl:
          "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
      {
        id: "dish-9",
        name: "Cold Brew Tonic with Yuzu",
        description:
          "Single-estate Chikmagalur arabica brewed cold for 20 hours, topped with Japanese yuzu essence and crisp soda.",
        basePrice: 320,
        imageUrl:
          "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
    ],
  },
  {
    category: "Artisanal Desserts",
    items: [
      {
        id: "dish-10",
        name: "Valrhona Molten Chocolate Sphere",
        description:
          "Dark chocolate dome with molten center, accompanied by Madagascar bourbon vanilla bean gelato.",
        basePrice: 480,
        imageUrl:
          "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
    ],
  },
];

export default function CustomerMenuPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { setContext } = useCartStore();

  const tenantSlug = (params?.tenantSlug as string) || "the-grand-bistro";
  const tableId = (params?.tableId as string) || "t-04";

  const { menuItems, categories, tenantName: storeTenantName, tenantSlug: storeTenantSlug } = useTenantDataStore();

  const dynamicMenuData = React.useMemo(() => {
    // If tenant has menu items in store, transform and group them dynamically
    if (menuItems && menuItems.length > 0) {
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

    // Fallback to static gourmet demo menu
    return MENU_DATA;
  }, [menuItems, categories]);

  const restaurantDisplayName =
    storeTenantSlug === tenantSlug && storeTenantName && storeTenantName !== "Your Restaurant"
      ? storeTenantName
      : tenantSlug === "the-grand-bistro"
      ? "The Grand Bistro & Lounge"
      : tenantSlug
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

  // Table display name
  const tableName =
    tableId.toUpperCase().startsWith("T-")
      ? `Table ${tableId.slice(2)}`
      : tableId.toUpperCase().startsWith("R-")
      ? `Room ${tableId.slice(2)}`
      : `Table ${tableId}`;

  // Initialize context in cart store
  React.useEffect(() => {
    setContext(tenantSlug, tableId);
  }, [tenantSlug, tableId, setContext]);

  // Filtering & Search
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dietaryFilter, setDietaryFilter] = React.useState<"all" | "veg" | "non-veg">("all");
  const [activeCategory, setActiveCategory] = React.useState(dynamicMenuData[0]?.category || "");

  React.useEffect(() => {
    if (dynamicMenuData.length > 0 && !activeCategory) {
      setActiveCategory(dynamicMenuData[0].category);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28">
      {/* Top Navigation & Hero Banner */}
      <div className="relative">
        <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80"
            alt="Restaurant Interior"
            className="w-full h-full object-cover brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

          {/* Quick Action Badges */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 xs:gap-2">
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
              className="h-8 w-8 xs:h-9 xs:w-9 rounded-full bg-slate-900/80 backdrop-blur border border-slate-700/60 text-slate-300 flex items-center justify-center hover:text-white"
              title="Wi-Fi Information"
            >
              <Wifi className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
            </button>
            <button
              onClick={handleCallWaiter}
              className="px-2.5 xs:px-3 h-8 xs:h-9 rounded-full bg-emerald-500/90 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <BellRing className="h-3.5 w-3.5" />
              <span><span className="hidden xs:inline">Call </span>Waiter</span>
            </button>
          </div>
        </div>

        {/* Restaurant Profile Card */}
        <div className="max-w-xl mx-auto px-4 -mt-16 relative z-10">
          <div className="p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-xl backdrop-blur-md">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  DineFlow Contactless Ordering
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {restaurantDisplayName}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Contactless Guest Dining & Table Ordering
                </p>
              </div>

              {/* Table Pill */}
              <div className="flex flex-col items-end shrink-0 ml-2">
                <Badge variant="glow" size="sm" className="font-mono font-bold text-xs">
                  {tableName}
                </Badge>
                <span className="text-[10px] text-slate-500 mt-1">Direct to KDS</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-medium text-slate-300">Live Kitchen Active</span>
              </div>
              <button
                onClick={handleOpenWhatsApp}
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Prefer WhatsApp? Tap here</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="mt-4 relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search dishes, drinks, ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Dietary Filter Pills */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setDietaryFilter("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  dietaryFilter === "all"
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                }`}
              >
                All Items
              </button>

              <button
                onClick={() => setDietaryFilter("veg")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  dietaryFilter === "veg"
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-slate-800/80 text-emerald-400 hover:bg-slate-800"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                Pure Veg
              </button>

              <button
                onClick={() => setDietaryFilter("non-veg")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  dietaryFilter === "non-veg"
                    ? "bg-rose-500 text-white"
                    : "bg-slate-800/80 text-rose-400 hover:bg-slate-800"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
                Non-Veg
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Menu Feed */}
      <div className="max-w-xl mx-auto px-4 mt-6 space-y-8">
        {filteredCategories.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800/80 my-8">
            <Sparkles className="h-8 w-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No dishes found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or dietary filters.
            </p>
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <section key={cat.category} className="space-y-3.5">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {cat.category}
                </h2>
                <div className="h-px flex-1 bg-slate-800/80" />
              </div>

              <div className="space-y-3">
                {cat.items.map((dish) => (
                  <div
                    key={dish.id}
                    onClick={() => setCustomizingDish(dish)}
                    className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 transition-all flex gap-3 sm:gap-3.5 cursor-pointer group"
                  >
                    {/* Left: Info */}
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
                          className="h-8 px-3 text-xs font-bold text-emerald-400 hover:text-white border-emerald-500/30 hover:bg-emerald-500/20 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomizingDish(dish);
                          }}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          <span>Add</span>
                        </Button>
                      </div>
                    </div>

                    {/* Right: Dish Image */}
                    {dish.imageUrl && (
                      <div className="h-20 w-20 xs:h-24 xs:w-24 sm:h-28 sm:w-28 rounded-xl overflow-hidden bg-slate-800 shrink-0 relative">
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

      {/* Customer Sticky Cart / Checkout Drawer */}
      <CustomerCartDrawer
        tenantSlug={tenantSlug}
        tableSlug={tableId}
        tableName={tableName}
      />
    </div>
  );
}
