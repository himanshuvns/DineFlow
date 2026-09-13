"use client";

import * as React from "react";
import {
  Plus,
  Search,
  Sparkles,
  Edit2,
  Trash2,
  FolderPlus,
  Coffee,
  Utensils,
  Flame,
  Wine,
  Camera,
  UploadCloud,
  Copy,
  Star,
  CheckSquare,
  Square,
  SlidersHorizontal,
  ArrowUpDown,
  Clock,
  Filter,
  Check,
  ChevronDown,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { useTenantData, STARTER_TEMPLATES, MenuItem } from "@/lib/stores/tenant-data-store";
import { formatCategoryName, deduplicateCategories, isCategoryMatch } from "@/lib/utils/category-utils";
import { ParsedMenuItem } from "@/lib/utils/menu-nlp-engine";
import { CameraMenuScannerModal } from "@/components/menu/camera-menu-scanner-modal";
import { MenuUploadModal } from "@/components/menu/menu-upload-modal";
import { MenuStagingPreviewModal } from "@/components/menu/menu-staging-preview-modal";
import { MenuBulkToolbar } from "@/components/menu/menu-bulk-toolbar";

const IMAGE_PRESETS = [
  { label: "Paneer Butter Masala", url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80" },
  { label: "Hyderabadi Biryani", url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80" },
  { label: "Crispy Masala Dosa", url: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80" },
  { label: "Dal Makhani", url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80" },
  { label: "Butter Chicken", url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80" },
  { label: "Punjabi Samosa", url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80" },
  { label: "Degree Filter Coffee", url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80" },
  { label: "Wood-Fired Pizza", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80" },
];

export default function MenuManagementPage() {
  const { addToast } = useToast();
  const {
    tenantName,
    tenant,
    isDemoTenant,
    menuItems,
    categories,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    bulkAddMenuItems,
    bulkUpdateMenuItems,
    bulkDeleteMenuItems,
    bulkAdjustPrices,
    applyStarterTemplate,
  } = useTenantData();

  // Search & Navigation
  const [activeCategory, setActiveCategory] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Multi-Filter Options
  const [dietaryFilter, setDietaryFilter] = React.useState<"all" | "veg" | "non_veg">("all");
  const [availabilityFilter, setAvailabilityFilter] = React.useState<"all" | "available" | "unavailable">("all");
  const [highlightFilter, setHighlightFilter] = React.useState<"all" | "bestseller" | "recommended">("all");
  const [priceSort, setPriceSort] = React.useState<"none" | "low_to_high" | "high_to_low">("none");

  // Multi-Select State
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // AI Scanner & Upload Modals
  const [isScannerOpen, setIsScannerOpen] = React.useState(false);
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [isStagingOpen, setIsStagingOpen] = React.useState(false);
  const [stagedExtractedItems, setStagedExtractedItems] = React.useState<ParsedMenuItem[]>([]);

  // Dynamic category list derived from actual dishes and user-added categories
  const categoryList = React.useMemo(() => {
    const itemCats = menuItems.map((i) => i.category);
    const combined = deduplicateCategories([...itemCats, ...categories], {
      removePlaceholderGeneral: menuItems.length > 0,
    });
    return combined.length > 0 ? combined : ["General"];
  }, [menuItems, categories]);

  // Modal State for New Dish
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [newDishName, setNewDishName] = React.useState("");
  const [newDishHindiName, setNewDishHindiName] = React.useState("");
  const [newDishCategory, setNewDishCategory] = React.useState(categoryList[0] || "General");
  const [newDishPrice, setNewDishPrice] = React.useState("");
  const [newDishDesc, setNewDishDesc] = React.useState("");
  const [newDishImageUrl, setNewDishImageUrl] = React.useState("");
  const [newDishIsVeg, setNewDishIsVeg] = React.useState(true);
  const [newDishSpicyLevel, setNewDishSpicyLevel] = React.useState<number>(1);
  const [newDishPrepTime, setNewDishPrepTime] = React.useState<number>(15);
  const [newDishBestseller, setNewDishBestseller] = React.useState(false);
  const [newDishRecommended, setNewDishRecommended] = React.useState(false);
  const [hasVariants, setHasVariants] = React.useState(false);
  const [hasModifiers, setHasModifiers] = React.useState(false);

  // Modal State for New Category
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState("");

  const categoriesTabs = React.useMemo(() => {
    return [
      { id: "all", label: "All Items", badge: menuItems.length },
      ...categoryList
        .filter((cat) => {
          const badgeCount = menuItems.filter((i) => isCategoryMatch(i.category, cat)).length;
          return badgeCount > 0 || categories.some((c) => isCategoryMatch(c, cat));
        })
        .map((cat) => ({
          id: cat,
          label: cat,
          badge: menuItems.filter((i) => isCategoryMatch(i.category, cat)).length,
        })),
    ];
  }, [categoryList, menuItems, categories]);

  // Instant 86 / Out of Stock Toggle
  const handleToggleAvailability = async (dishId: string, current: boolean) => {
    await updateMenuItem(dishId, { available: !current });
    if (current) {
      addToast("warning", "Dish 86'd / Sold Out", "Dish marked unavailable. Live QR menus updated instantaneously.");
    } else {
      addToast("success", "Dish Back in Stock", "Dish restored to live digital ordering menu.");
    }
  };

  const handleDelete = async (dishId: string, name: string) => {
    await deleteMenuItem(dishId);
    setSelectedIds((prev) => prev.filter((id) => id !== dishId));
    addToast("info", "Dish Deleted", `${name} was removed from the menu.`);
  };

  // Duplicate Dish
  const handleDuplicateDish = async (dish: MenuItem) => {
    const copyName = `${dish.name} (Copy)`;
    const created = await addMenuItem({
      name: copyName,
      category: dish.category,
      price: dish.price,
      available: true,
      isVeg: dish.isVeg,
      desc: dish.desc,
      imageUrl: dish.imageUrl,
      variantsCount: dish.variantsCount,
      modifiersCount: dish.modifiersCount,
      bestseller: dish.bestseller,
      recommended: dish.recommended,
      spicyLevel: dish.spicyLevel,
      prepTimeMinutes: dish.prepTimeMinutes,
      hindiName: dish.hindiName,
    });
    addToast("success", "Dish Duplicated", `Created copy "${copyName}".`);
  };

  // Multi-Select helpers
  const handleToggleSelectDish = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(filteredItems.map((i) => i.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  // Create Dish Handler
  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName.trim() || !newDishPrice) {
      addToast("error", "Missing Fields", "Please enter dish name and valid price.");
      return;
    }

    const created = await addMenuItem({
      name: newDishName.trim(),
      category: formatCategoryName(newDishCategory),
      price: parseFloat(newDishPrice),
      available: true,
      isVeg: newDishIsVeg,
      desc: newDishDesc.trim() || "Prepared fresh by the culinary team.",
      imageUrl: newDishImageUrl.trim() || undefined,
      variantsCount: hasVariants ? 2 : 0,
      modifiersCount: hasModifiers ? 2 : 0,
      bestseller: newDishBestseller,
      recommended: newDishRecommended,
      spicyLevel: newDishSpicyLevel,
      prepTimeMinutes: newDishPrepTime,
      hindiName: newDishHindiName.trim() || undefined,
    });

    setIsAddModalOpen(false);
    // Reset
    setNewDishName("");
    setNewDishHindiName("");
    setNewDishPrice("");
    setNewDishDesc("");
    setNewDishImageUrl("");
    setNewDishSpicyLevel(1);
    setNewDishPrepTime(15);
    setNewDishBestseller(false);
    setNewDishRecommended(false);
    setHasVariants(false);
    setHasModifiers(false);

    addToast(
      "success",
      "Menu Item Created",
      `${created.name} added to ${created.category}. Available on QR menu.`
    );
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = formatCategoryName(newCategoryName);
    if (!formatted || formatted === "General") return;
    if (categoryList.some((c) => isCategoryMatch(c, formatted))) {
      addToast("error", "Duplicate Category", `Category "${formatted}" already exists.`);
      return;
    }

    setNewDishCategory(formatted);
    setIsCategoryModalOpen(false);
    setNewCategoryName("");
    addToast("success", "Category Added", `Category "${formatted}" created.`);
  };

  const handleApplyPreset = (key: keyof typeof STARTER_TEMPLATES) => {
    applyStarterTemplate(key);
    addToast(
      "success",
      "Starter Dishes Loaded",
      `Loaded signature items from ${STARTER_TEMPLATES[key].name} into ${tenantName}.`
    );
  };

  // Handle OCR extraction complete
  const handleOcrComplete = (extracted: ParsedMenuItem[]) => {
    setStagedExtractedItems(extracted);
    setIsStagingOpen(true);
  };

  // Commit approved staged items
  const handleCommitStagedItems = async (approvedItems: ParsedMenuItem[]) => {
    const toCreate: Omit<MenuItem, "id">[] = [];

    for (const item of approvedItems) {
      const cleanCategory = formatCategoryName(item.category);
      if (item.isDuplicate && item.duplicateAction === "merge" && item.matchedExistingItem) {
        // Merge & update existing item's price
        await updateMenuItem(item.matchedExistingItem.id, {
          price: item.price,
          category: cleanCategory,
          isVeg: item.isVeg,
          desc: item.desc,
          spicyLevel: item.spicyLevel,
        });
      } else {
        toCreate.push({
          name: item.name,
          category: cleanCategory,
          price: item.price,
          available: true,
          isVeg: item.isVeg,
          desc: item.desc,
          imageUrl: item.imageUrl,
          spicyLevel: item.spicyLevel,
          prepTimeMinutes: item.prepTimeMinutes,
          hindiName: item.hindiName,
        });
      }
    }

    if (toCreate.length > 0) {
      await bulkAddMenuItems(toCreate);
    }
  };

  // Filtered & Sorted items
  const filteredItems = React.useMemo(() => {
    let result = menuItems.filter((item) => {
      // Category filter (case-insensitive)
      if (activeCategory !== "all" && !isCategoryMatch(item.category, activeCategory)) return false;

      // Dietary filter
      if (dietaryFilter === "veg" && !item.isVeg) return false;
      if (dietaryFilter === "non_veg" && item.isVeg) return false;

      // Availability filter
      if (availabilityFilter === "available" && !item.available) return false;
      if (availabilityFilter === "unavailable" && item.available) return false;

      // Highlight filter
      if (highlightFilter === "bestseller" && !item.bestseller) return false;
      if (highlightFilter === "recommended" && !item.recommended) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.hindiName && item.hindiName.includes(q))
        );
      }
      return true;
    });

    // Price sort
    if (priceSort === "low_to_high") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (priceSort === "high_to_low") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [
    menuItems,
    activeCategory,
    dietaryFilter,
    availabilityFilter,
    highlightFilter,
    searchQuery,
    priceSort,
  ]);

  return (
    <div className="space-y-6 pb-16">
      {/* ======================================================== */}
      {/* 1. HEADER & THREE CREATION METHODS                      */}
      {/* ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#14F1C7] text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{tenantName} AI Menu Operating System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Menu Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Scan physical menus, upload PDFs, or build signature dishes manually. Live QR menus and kitchen displays update instantaneously.
          </p>
        </div>

        {/* Action Group: 3 Creation Options + Add Category */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Option 1: Mobile Camera Scan */}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Camera className="h-4 w-4 text-emerald-500" />}
            onClick={() => setIsScannerOpen(true)}
            className="border-emerald-500/40 hover:bg-emerald-500/10 text-slate-800 dark:text-white"
          >
            Scan Menu
          </Button>

          {/* Option 2: Upload Menu (PDF/Images) */}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<UploadCloud className="h-4 w-4 text-teal-500" />}
            onClick={() => setIsUploadOpen(true)}
            className="border-teal-500/40 hover:bg-teal-500/10 text-slate-800 dark:text-white"
          >
            Upload Menu
          </Button>

          {/* Option 3: Manual Entry (Existing Flow) */}
          <Button
            variant="glow"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add New Dish
          </Button>

          <Button
            variant="ghost"
            size="sm"
            leftIcon={<FolderPlus className="h-4 w-4" />}
            onClick={() => setIsCategoryModalOpen(true)}
            className="text-slate-600 dark:text-slate-400"
          >
            Category
          </Button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. CATEGORY TABS & SEARCH BAR                           */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Tabs tabs={categoriesTabs} activeTab={activeCategory} onChange={setActiveCategory} />
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search dishes or Hindi name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 shadow-xs"
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MULTI-FILTER CHIPS BAR                               */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 text-xs">
        {/* Left: Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3" /> Filters:
          </span>

          {/* Dietary Filter */}
          {(["all", "veg", "non_veg"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setDietaryFilter(mode)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                dietaryFilter === mode
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-300 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {mode === "all" ? "All Diets" : mode === "veg" ? "Pure Veg 🟢" : "Non-Veg 🔴"}
            </button>
          ))}

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Availability Filter */}
          {(["all", "available", "unavailable"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setAvailabilityFilter(mode)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                availabilityFilter === mode
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-300 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {mode === "all" ? "All Stock" : mode === "available" ? "In Stock" : "86'd (Sold Out)"}
            </button>
          ))}

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Highlights Filter */}
          {(["all", "bestseller", "recommended"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setHighlightFilter(mode)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                highlightFilter === mode
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-300 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {mode === "all" ? "All Items" : mode === "bestseller" ? "⭐ Bestsellers" : "✨ Recommended"}
            </button>
          ))}
        </div>

        {/* Right: Price Sorter */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="h-3 w-3 text-slate-400" />
          <select
            value={priceSort}
            onChange={(e) => setPriceSort(e.target.value as any)}
            className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs"
          >
            <option value="none">Sort by: Default</option>
            <option value="low_to_high">Price: Low to High</option>
            <option value="high_to_low">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. DISHES GRID OR STARTER TEMPLATE EMPTY STATE           */}
      {/* ======================================================== */}
      {filteredItems.length === 0 ? (
        <div className="p-10 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No dishes found {activeCategory !== "all" ? `in "${activeCategory}"` : `for ${tenantName}`}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Scan your printed menu, upload a PDF/photo, or instantly populate your menu with a curated starter template:
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Camera className="h-3.5 w-3.5 text-emerald-500" />}
              onClick={() => setIsScannerOpen(true)}
            >
              Scan Menu Camera
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<UploadCloud className="h-3.5 w-3.5 text-teal-500" />}
              onClick={() => setIsUploadOpen(true)}
            >
              Upload Menu PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Flame className="h-3.5 w-3.5 text-orange-500" />}
              onClick={() => handleApplyPreset("indian")}
            >
              Load Indian Specials
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Utensils className="h-3.5 w-3.5 text-emerald-500" />}
              onClick={() => handleApplyPreset("bistro")}
            >
              Load Bistro & Continental
            </Button>
          </div>

          <div className="pt-2">
            <Button variant="glow" size="sm" onClick={() => setIsAddModalOpen(true)}>
              + Create Custom Dish
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);

            return (
              <Card
                key={item.id}
                variant="glass"
                className={`flex flex-col justify-between transition-all overflow-hidden relative group ${
                  isSelected
                    ? "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/5"
                    : !item.available
                    ? "opacity-70 border-rose-300 dark:border-rose-900/30"
                    : "hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {/* Multi-select checkbox badge */}
                <button
                  type="button"
                  onClick={() => handleToggleSelectDish(item.id)}
                  className={`absolute top-3 left-3 z-20 h-6 w-6 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-500 text-slate-950 shadow-md"
                      : "bg-slate-900/60 backdrop-blur text-white/80 hover:text-white border border-white/20"
                  }`}
                  title={isSelected ? "Deselect item" : "Select item"}
                >
                  {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                </button>

                {/* Thumbnail banner if available */}
                {item.imageUrl ? (
                  <div className="h-36 -mx-6 -mt-6 mb-4 relative overflow-hidden bg-slate-100 dark:bg-slate-950">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent dark:from-slate-900" />
                  </div>
                ) : null}

                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      {/* Veg / Non-Veg Dot Box */}
                      <span
                        className={`inline-flex items-center justify-center h-4 w-4 rounded border shrink-0 mt-0.5 ${
                          item.isVeg
                            ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                            : "border-rose-500 text-rose-600 dark:text-rose-400"
                        }`}
                        title={item.isVeg ? "Pure Vegetarian" : "Non-Vegetarian"}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item.isVeg ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight truncate">
                            {item.name}
                          </h3>
                        </div>

                        {item.hindiName && (
                          <span className="text-[11px] text-slate-400 font-sans block">
                            {item.hindiName}
                          </span>
                        )}

                        <span className="text-[11px] font-semibold text-emerald-700 dark:text-[#14F1C7]">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    {/* Instant 86 Status Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(item.id, item.available)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <Badge variant={item.available ? "success" : "danger"} size="sm" dot>
                        {item.available ? "In Stock" : "86'd"}
                      </Badge>
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed line-clamp-2 font-medium">
                    {item.desc}
                  </p>

                  {/* Highlights & Culinary Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    {item.bestseller && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        <Star className="h-3 w-3 fill-amber-500" /> Bestseller
                      </span>
                    )}
                    {item.recommended && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="h-3 w-3" /> Chef Pick
                      </span>
                    )}
                    {item.spicyLevel && item.spicyLevel > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                        {"🌶️".repeat(item.spicyLevel)}
                      </span>
                    ) : null}
                    {item.prepTimeMinutes ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                        <Clock className="h-3 w-3" /> {item.prepTimeMinutes}m
                      </span>
                    ) : null}
                    {item.variantsCount && item.variantsCount > 0 ? (
                      <Badge variant="neutral" size="sm">
                        {item.variantsCount} Sizes
                      </Badge>
                    ) : null}
                  </div>
                </div>

                {/* Pricing & Item Actions */}
                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                      {formatCurrency(item.price, tenant?.currency || "INR")}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Duplicate Action */}
                    <button
                      type="button"
                      onClick={() => handleDuplicateDish(item)}
                      className="h-8 w-8 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-500/10 flex items-center justify-center transition-colors cursor-pointer"
                      title="Duplicate dish"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>

                    {/* Quick Restock / 86 button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium"
                      onClick={() => handleToggleAvailability(item.id, item.available)}
                    >
                      {item.available ? "86" : "Restock"}
                    </Button>

                    {/* Delete Action */}
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.name)}
                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer"
                      title="Delete dish"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. FLOATING BULK EDIT TOOLBAR                           */}
      {/* ======================================================== */}
      <MenuBulkToolbar
        selectedIds={selectedIds}
        totalCount={filteredItems.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onBulkUpdateCategory={async (category) => {
          await bulkUpdateMenuItems(selectedIds, { category });
        }}
        onBulkAdjustPrice={async (percentage) => {
          await bulkAdjustPrices(selectedIds, percentage);
        }}
        onBulkToggleAvailability={async (available) => {
          await bulkUpdateMenuItems(selectedIds, { available });
        }}
        onBulkDelete={async () => {
          await bulkDeleteMenuItems(selectedIds);
          setSelectedIds([]);
        }}
        existingCategories={categoryList}
      />

      {/* ======================================================== */}
      {/* 6. MODALS                                               */}
      {/* ======================================================== */}

      {/* Camera Menu Scanner Modal */}
      <CameraMenuScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onExtracted={handleOcrComplete}
        existingItems={menuItems}
      />

      {/* Menu File Upload Modal */}
      <MenuUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onExtracted={handleOcrComplete}
        existingItems={menuItems}
      />

      {/* Menu Staging Preview Modal */}
      <MenuStagingPreviewModal
        isOpen={isStagingOpen}
        onClose={() => setIsStagingOpen(false)}
        items={stagedExtractedItems}
        onCommit={handleCommitStagedItems}
        existingCategories={categoryList}
      />

      {/* Add Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Add Menu Category"
        description="Create a new section for your digital menu (e.g. Tandoori Starters, Biryani, Artisanal Beverages)."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setIsCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="add-category-form" variant="glow" size="sm">
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
              placeholder="e.g. Tandoori Breads or South Indian Tiffin"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>
        </form>
      </Modal>

      {/* Extended Manual Add New Dish Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Signature Dish"
        description={`Add a culinary creation to ${tenantName}'s digital menu.`}
        className="max-w-2xl"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="create-dish-form" variant="glow" size="sm">
              Save & Publish Dish
            </Button>
          </div>
        }
      >
        <form id="create-dish-form" onSubmit={handleCreateDish} className="space-y-4 py-1">
          {/* Dish Name & Hindi Script */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Dish Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Paneer Butter Masala"
                value={newDishName}
                onChange={(e) => setNewDishName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 shadow-xs font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Hindi / Regional Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. पनीर बटर मसाला"
                value={newDishHindiName}
                onChange={(e) => setNewDishHindiName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 shadow-xs"
              />
            </div>
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                Price ({tenant?.currency || "INR"}) *
              </label>
              <input
                type="number"
                step="1"
                min="0"
                required
                placeholder="e.g. 280"
                value={newDishPrice}
                onChange={(e) => setNewDishPrice(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono shadow-xs font-bold"
              />
            </div>
          </div>

          {/* Dietary Classification & Spice Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Dietary Classification
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewDishIsVeg(true)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    newDishIsVeg
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Pure Veg 🟢
                </button>
                <button
                  type="button"
                  onClick={() => setNewDishIsVeg(false)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    !newDishIsVeg
                      ? "bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-400"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Non-Veg 🔴
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Spice Level & Prep Time
              </label>
              <div className="flex items-center gap-2">
                {/* Spice buttons */}
                <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-slate-50 dark:bg-slate-950 flex-1 justify-around">
                  {[0, 1, 2, 3].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setNewDishSpicyLevel(lvl)}
                      className={`h-7 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        newDishSpicyLevel === lvl
                          ? "bg-amber-500 text-slate-950 shadow-xs"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      }`}
                      title={lvl === 0 ? "Mild" : lvl === 1 ? "Medium" : lvl === 2 ? "Hot" : "Fiery"}
                    >
                      {lvl === 0 ? "0" : "🌶️".repeat(lvl)}
                    </button>
                  ))}
                </div>

                {/* Prep time */}
                <div className="relative w-24">
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={newDishPrepTime}
                    onChange={(e) => setNewDishPrepTime(parseInt(e.target.value) || 15)}
                    className="w-full pl-2 pr-7 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-2 top-2.5 text-[10px] text-slate-400 font-medium">min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Highlights Switchers */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={newDishBestseller}
                onChange={(e) => setNewDishBestseller(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-emerald-600 focus:ring-0"
              />
              <span>⭐ Mark as Bestseller</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={newDishRecommended}
                onChange={(e) => setNewDishRecommended(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-emerald-600 focus:ring-0"
              />
              <span>✨ Chef Recommended</span>
            </label>
          </div>

          {/* Image URL & Quick Indian Presets */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Food Photography (Optional)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={newDishImageUrl}
              onChange={(e) => setNewDishImageUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-none pb-1">
              <span className="text-[10px] text-slate-500 shrink-0">Indian presets:</span>
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

          {/* Description & Culinary Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Description & Culinary Notes
            </label>
            <textarea
              rows={2}
              placeholder="Highlight signature ingredients, spice blend, or allergen warnings..."
              value={newDishDesc}
              onChange={(e) => setNewDishDesc(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-none shadow-xs"
            />
          </div>

          {/* Variants & Modifiers */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={hasVariants}
                onChange={(e) => setHasVariants(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-emerald-600 focus:ring-0"
              />
              <span>Enable Size / Portion Variants (e.g. Half / Full)</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={hasModifiers}
                onChange={(e) => setHasModifiers(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-emerald-600 focus:ring-0"
              />
              <span>Enable Add-on Modifier Groups (e.g. Extra Butter, Extra Raita)</span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
