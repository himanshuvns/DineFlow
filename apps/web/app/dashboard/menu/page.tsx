"use client";

import * as React from "react";
import {
  Plus,
  Search,
  Sparkles,
  Filter,
  Edit2,
  Trash2,
  Check,
  X,
  Sliders,
  DollarSign,
  Tag,
  ToggleLeft,
  ToggleRight,
  FolderPlus,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";

interface DishItem {
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

const INITIAL_MENU_ITEMS: DishItem[] = [
  {
    id: "itm_1",
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
    id: "itm_2",
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
    id: "itm_3",
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
    id: "itm_4",
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
    id: "itm_5",
    name: "Belgian Chocolate Fondant",
    category: "Desserts",
    price: 450,
    available: false,
    isVeg: true,
    desc: "Warm molten center cake with Madagascar bourbon vanilla bean gelato.",
    imageUrl: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=600&q=80",
    variantsCount: 0,
    modifiersCount: 1,
  },
  {
    id: "itm_6",
    name: "Spicy Diavola Pizza",
    category: "Pizzas",
    price: 820,
    available: true,
    isVeg: false,
    desc: "Calabrian salami, chili oil, San Marzano sauce, fresh mozzarella.",
    imageUrl: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80",
    variantsCount: 2,
    modifiersCount: 2,
  },
];

const INITIAL_CATEGORIES = [
  "Starters",
  "Mains",
  "Pizzas",
  "Beverages",
  "Desserts",
];

const IMAGE_PRESETS = [
  { label: "Gourmet Pasta", url: "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=600&q=80" },
  { label: "Wood-Fired Pizza", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80" },
  { label: "Appetizer Salad", url: "https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=600&q=80" },
  { label: "Artisanal Drink", url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80" },
];

export default function MenuManagementPage() {
  const { addToast } = useToast();
  const [items, setItems] = React.useState<DishItem[]>(INITIAL_MENU_ITEMS);
  const [categoryList, setCategoryList] = React.useState<string[]>(INITIAL_CATEGORIES);
  const [activeCategory, setActiveCategory] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Modal State for New Dish
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [newDishName, setNewDishName] = React.useState("");
  const [newDishCategory, setNewDishCategory] = React.useState("Starters");
  const [newDishPrice, setNewDishPrice] = React.useState("");
  const [newDishDesc, setNewDishDesc] = React.useState("");
  const [newDishImageUrl, setNewDishImageUrl] = React.useState("");
  const [newDishIsVeg, setNewDishIsVeg] = React.useState(true);
  const [hasVariants, setHasVariants] = React.useState(false);
  const [hasModifiers, setHasModifiers] = React.useState(false);

  // Modal State for New Category
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState("");

  const categoriesTabs = [
    { id: "all", label: "All Items", badge: items.length },
    ...categoryList.map((cat) => ({
      id: cat,
      label: cat,
      badge: items.filter((i) => i.category === cat).length,
    })),
  ];

  // Instant 86 / Out of Stock Toggle
  const handleToggleAvailability = (dishId: string, current: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === dishId ? { ...item, available: !current } : item
      )
    );
    if (current) {
      addToast(
        "warning",
        "Dish 86'd / Sold Out",
        "Dish marked unavailable. Live QR menus updated instantaneously."
      );
    } else {
      addToast(
        "success",
        "Dish Back in Stock",
        "Dish restored to live digital ordering menu."
      );
    }
  };

  const handleDelete = (dishId: string, name: string) => {
    setItems((prev) => prev.filter((item) => item.id !== dishId));
    addToast("info", "Dish Deleted", `${name} was removed from the menu.`);
  };

  const handleCreateDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName.trim() || !newDishPrice) {
      addToast("error", "Missing Fields", "Please enter dish name and valid price.");
      return;
    }

    const newDish: DishItem = {
      id: `itm_${Date.now()}`,
      name: newDishName.trim(),
      category: newDishCategory,
      price: parseFloat(newDishPrice),
      available: true,
      isVeg: newDishIsVeg,
      desc: newDishDesc.trim() || "Prepared fresh by the culinary team.",
      imageUrl: newDishImageUrl.trim() || undefined,
      variantsCount: hasVariants ? 2 : 0,
      modifiersCount: hasModifiers ? 2 : 0,
    };

    setItems([newDish, ...items]);
    setIsAddModalOpen(false);
    // Reset
    setNewDishName("");
    setNewDishPrice("");
    setNewDishDesc("");
    setNewDishImageUrl("");
    setHasVariants(false);
    setHasModifiers(false);

    addToast(
      "success",
      "Menu Item Created",
      `${newDish.name} added to ${newDish.category}. Available on QR menu.`
    );
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const catTrimmed = newCategoryName.trim();
    if (!catTrimmed) return;
    if (categoryList.includes(catTrimmed)) {
      addToast("error", "Duplicate Category", "This category already exists.");
      return;
    }

    setCategoryList([...categoryList, catTrimmed]);
    setIsCategoryModalOpen(false);
    setNewCategoryName("");
    addToast("success", "Category Added", `Category "${catTrimmed}" created.`);
  };

  const handleSeedMenu = () => {
    setItems(INITIAL_MENU_ITEMS);
    addToast("success", "Sample Menu Populated", "6 gourmet chef signature dishes loaded into your catalog.");
  };

  const filteredItems = items.filter((item) => {
    if (activeCategory !== "all" && item.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Interactive Digital Menu Manager
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Menu Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Configure dishes, portions, modifier groups, and instant one-click 86/sold-out toggles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FolderPlus className="h-4 w-4" />}
            onClick={() => setIsCategoryModalOpen(true)}
          >
            Add Category
          </Button>

          <Button
            variant="glow"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add New Dish
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Tabs tabs={categoriesTabs} activeTab={activeCategory} onChange={setActiveCategory} />

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 shadow-xs"
          />
        </div>
      </div>

      {/* Menu Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No dishes found in this category</p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" size="sm" onClick={handleSeedMenu}>
              Seed Sample Menu
            </Button>
            <Button variant="glow" size="sm" onClick={() => setIsAddModalOpen(true)}>
              Add First Dish
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              variant="glass"
              className={`flex flex-col justify-between transition-all overflow-hidden ${
                !item.available ? "opacity-70 border-rose-300 dark:border-rose-900/30" : "hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {/* Thumbnail banner if available */}
              {item.imageUrl && (
                <div className="h-32 -mx-6 -mt-6 mb-4 relative overflow-hidden bg-slate-100 dark:bg-slate-950">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent dark:from-slate-900" />
                </div>
              )}

              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center justify-center h-4 w-4 rounded border ${
                        item.isVeg
                          ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                          : "border-rose-500 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          item.isVeg ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                      />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {item.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Instant 86 Status Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleAvailability(item.id, item.available)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <Badge variant={item.available ? "success" : "danger"} size="sm" dot>
                      {item.available ? "In Stock" : "86'd (Sold Out)"}
                    </Badge>
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed line-clamp-2 font-medium">{item.desc}</p>

                {/* Badges for configured Variants / Modifiers */}
                <div className="flex items-center gap-2 mt-3">
                  {item.variantsCount && item.variantsCount > 0 ? (
                    <Badge variant="neutral" size="sm">
                      {item.variantsCount} Sizes
                    </Badge>
                  ) : null}
                  {item.modifiersCount && item.modifiersCount > 0 ? (
                    <Badge variant="neutral" size="sm">
                      {item.modifiersCount} Modifiers
                    </Badge>
                  ) : null}
                </div>
              </div>

              {/* Pricing & Management Actions */}
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                    {formatCurrency(item.price, "INR")}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium"
                    onClick={() => handleToggleAvailability(item.id, item.available)}
                  >
                    {item.available ? "86 Item" : "Restock"}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-500/10"
                    onClick={() => handleDelete(item.id, item.name)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Add Menu Category"
        description="Create a new section for your digital menu (e.g. Chef Tasting, Artisanal Mocktails)."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-category-form"
              variant="glow"
              size="sm"
            >
              Create Category
            </Button>
          </div>
        }
      >
        <form id="add-category-form" onSubmit={handleAddCategory} className="space-y-4 py-2">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Signature Mocktails or Wood-Fired Breads"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>
        </form>
      </Modal>

      {/* Add New Dish Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Dish"
        description="Add a culinary dish to your digital menu with pricing and dietary configuration."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-dish-form"
              variant="glow"
              size="sm"
            >
              Save & Publish Dish
            </Button>
          </div>
        }
      >
        <form id="create-dish-form" onSubmit={handleCreateDish} className="space-y-4 py-2">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Dish Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Handmade Truffle Tagliolini"
              value={newDishName}
              onChange={(e) => setNewDishName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Category *
              </label>
              <select
                value={newDishCategory}
                onChange={(e) => setNewDishCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs"
              >
                {categoryList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Base Price (₹ INR) *
              </label>
              <input
                type="number"
                step="1"
                min="0"
                required
                placeholder="e.g. 750"
                value={newDishPrice}
                onChange={(e) => setNewDishPrice(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Dietary Classification
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNewDishIsVeg(true)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                  newDishIsVeg
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Pure Vegetarian
              </button>
              <button
                type="button"
                onClick={() => setNewDishIsVeg(false)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                  !newDishIsVeg
                    ? "bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-400"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Non-Vegetarian
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={newDishImageUrl}
              onChange={(e) => setNewDishImageUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto">
              <span className="text-[10px] text-slate-500 shrink-0">Quick presets:</span>
              {IMAGE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setNewDishImageUrl(p.url)}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-transparent text-[10px] whitespace-nowrap cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Description & Culinary Notes
            </label>
            <textarea
              rows={2}
              placeholder="Highlight ingredients, flavor profiles, and allergen notes..."
              value={newDishDesc}
              onChange={(e) => setNewDishDesc(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-none shadow-xs"
            />
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={hasVariants}
                onChange={(e) => setHasVariants(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-emerald-600 focus:ring-0"
              />
              <span>Enable Size / Portion Variants (e.g. Regular / Large)</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={hasModifiers}
                onChange={(e) => setHasModifiers(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0"
              />
              <span>Enable Modifier Groups (e.g. Add-on toppings, dressings)</span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
