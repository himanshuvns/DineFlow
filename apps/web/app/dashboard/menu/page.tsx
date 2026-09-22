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
  ArrowUp,
  ArrowDown,
  ImagePlus,
  AlertTriangle,
  Layers,
  CheckCircle2,
  IndianRupee,
  X,
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
import { ViewToggle, useViewMode } from "@/components/ui/view-toggle";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import NumberFlow from "@number-flow/react";

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
    isLoading,
    initialized,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    bulkAddMenuItems,
    bulkUpdateMenuItems,
    bulkDeleteMenuItems,
    bulkAdjustPrices,
    applyStarterTemplate,
    addCategory,
    renameCategory,
    deleteCategory,
    reorderCategories,
  } = useTenantData();

  // Search & Navigation
  const [viewMode, setViewMode] = useViewMode("menu", "grid");
  const [activeCategory, setActiveCategory] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const s = params.get("search");
      if (s) setSearchQuery(s);
      const c = params.get("category");
      if (c) setActiveCategory(c);
    }
  }, []);

  // Multi-Filter Options
  const [dietaryFilter, setDietaryFilter] = React.useState<"all" | "veg" | "non_veg">("all");
  const [availabilityFilter, setAvailabilityFilter] = React.useState<"all" | "available" | "unavailable">("all");
  const [highlightFilter, setHighlightFilter] = React.useState<"all" | "bestseller" | "recommended">("all");
  const [priceSort, setPriceSort] = React.useState<"none" | "low_to_high" | "high_to_low" | "name_asc" | "name_desc">("none");

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

  // KPI Metrics calculation
  const kpiStats = React.useMemo(() => {
    const total = menuItems.length;
    const inStock = menuItems.filter((i) => i.available).length;
    const outOfStock = total - inStock;
    const veg = menuItems.filter((i) => i.isVeg).length;
    const nonVeg = total - veg;
    const avg = total > 0 ? Math.round(menuItems.reduce((acc, i) => acc + (i.price || 0), 0) / total) : 0;
    return {
      total,
      inStock,
      outOfStock,
      veg,
      nonVeg,
      avg,
      categoriesCount: categoryList.length,
    };
  }, [menuItems, categoryList]);

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

  // Category Manager Modal State
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = React.useState(false);
  const [newCatInput, setNewCatInput] = React.useState("");
  const [editingCategoryOld, setEditingCategoryOld] = React.useState<string | null>(null);
  const [editingCategoryNew, setEditingCategoryNew] = React.useState("");

  // Delete Dish Confirmation State
  const [dishToDelete, setDishToDelete] = React.useState<{ id: string; name: string } | null>(null);

  // File Input References for Direct Image Upload
  const addDishFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const editDishFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleDishPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addToast("error", "Invalid File", "Please upload a valid image file (JPEG, PNG, WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast("error", "File Too Large", "Dish photography must be under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (isEdit) {
        setEditDishImageUrl(dataUrl);
      } else {
        setNewDishImageUrl(dataUrl);
      }
      addToast("info", "Photo Loaded", "Dish photo ready to save.");
    };
    reader.readAsDataURL(file);
  };

  // Modal State for Edit Dish
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editDishId, setEditDishId] = React.useState("");
  const [editDishName, setEditDishName] = React.useState("");
  const [editDishHindiName, setEditDishHindiName] = React.useState("");
  const [editDishCategory, setEditDishCategory] = React.useState("");
  const [editDishPrice, setEditDishPrice] = React.useState("");
  const [editDishDesc, setEditDishDesc] = React.useState("");
  const [editDishImageUrl, setEditDishImageUrl] = React.useState("");
  const [editDishIsVeg, setEditDishIsVeg] = React.useState(true);
  const [editDishSpicyLevel, setEditDishSpicyLevel] = React.useState<number>(1);
  const [editDishPrepTime, setEditDishPrepTime] = React.useState<number>(15);
  const [editDishBestseller, setEditDishBestseller] = React.useState(false);
  const [editDishRecommended, setEditDishRecommended] = React.useState(false);
  const [editDishAvailable, setEditDishAvailable] = React.useState(true);
  const [editHasVariants, setEditHasVariants] = React.useState(false);
  const [editHasModifiers, setEditHasModifiers] = React.useState(false);

  const handleOpenEditDish = (item: MenuItem) => {
    setEditDishId(item.id);
    setEditDishName(item.name);
    setEditDishHindiName(item.hindiName || "");
    setEditDishCategory(item.category);
    setEditDishPrice(item.price.toString());
    setEditDishDesc(item.desc || "");
    setEditDishImageUrl(item.imageUrl || "");
    setEditDishIsVeg(item.isVeg ?? true);
    setEditDishSpicyLevel(item.spicyLevel ?? 1);
    setEditDishPrepTime(item.prepTimeMinutes ?? 15);
    setEditDishBestseller(item.bestseller ?? false);
    setEditDishRecommended(item.recommended ?? false);
    setEditDishAvailable(item.available ?? true);
    setEditHasVariants((item.variantsCount ?? 0) > 0);
    setEditHasModifiers((item.modifiersCount ?? 0) > 0);
    setIsEditModalOpen(true);
  };

  const handleUpdateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = editDishName.trim();
    if (!cleanName) {
      addToast("error", "Dish Name Required", "Please enter a name for the dish.");
      return;
    }
    if (cleanName.length > 100) {
      addToast("error", "Name Too Long", "Dish name must be 100 characters or fewer.");
      return;
    }

    const priceNum = parseFloat(editDishPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      addToast("error", "Invalid Price", "Price must be a valid non-negative number.");
      return;
    }
    if (priceNum > 50000) {
      addToast("error", "Price Exceeds Limit", "Price cannot exceed ₹50,000.");
      return;
    }

    if (editDishPrepTime < 1 || editDishPrepTime > 180) {
      addToast("error", "Invalid Prep Time", "Preparation time must be between 1 and 180 minutes.");
      return;
    }

    if (editDishDesc.trim().length > 400) {
      addToast("error", "Description Too Long", "Description must be 400 characters or fewer.");
      return;
    }

    const cleanCategory = formatCategoryName(editDishCategory);
    await updateMenuItem(editDishId, {
      name: cleanName,
      category: cleanCategory,
      price: priceNum,
      available: editDishAvailable,
      isVeg: editDishIsVeg,
      desc: editDishDesc.trim() || "Prepared fresh by the culinary team.",
      imageUrl: editDishImageUrl.trim() || undefined,
      variantsCount: editHasVariants ? 2 : 0,
      modifiersCount: editHasModifiers ? 2 : 0,
      bestseller: editDishBestseller,
      recommended: editDishRecommended,
      spicyLevel: editDishSpicyLevel,
      prepTimeMinutes: editDishPrepTime,
      hindiName: editDishHindiName.trim() || undefined,
    });

    setIsEditModalOpen(false);
    addToast(
      "success",
      "Dish Updated",
      `${cleanName} updated in ${cleanCategory}. Available on QR menu.`
    );
  };

  const categoriesTabs = React.useMemo(() => {
    return [
      { id: "all", label: "All Items", badge: isLoading && menuItems.length === 0 ? undefined : menuItems.length },
      ...categoryList
        .filter((cat) => {
          const badgeCount = menuItems.filter((i) => isCategoryMatch(i.category, cat)).length;
          return badgeCount > 0 || categories.some((c) => isCategoryMatch(c, cat));
        })
        .map((cat) => ({
          id: cat,
          label: cat,
          badge: isLoading && menuItems.length === 0 ? undefined : menuItems.filter((i) => isCategoryMatch(i.category, cat)).length,
        })),
    ];
  }, [categoryList, menuItems, categories, isLoading]);

  // Instant 86 / Out of Stock Toggle
  const handleToggleAvailability = async (dishId: string, current: boolean) => {
    await updateMenuItem(dishId, { available: !current });
    if (current) {
      addToast("warning", "Dish 86'd / Sold Out", "Dish marked unavailable. Live QR menus updated instantaneously.");
    } else {
      addToast("success", "Dish Back in Stock", "Dish restored to live digital ordering menu.");
    }
  };

  const confirmDeleteDish = async () => {
    if (!dishToDelete) return;
    await deleteMenuItem(dishToDelete.id);
    setSelectedIds((prev) => prev.filter((id) => id !== dishToDelete.id));
    addToast("info", "Dish Deleted", `${dishToDelete.name} was removed from the menu.`);
    setDishToDelete(null);
  };

  // Duplicate Dish
  const handleDuplicateDish = async (dish: MenuItem) => {
    const copyName = `${dish.name} (Copy)`;
    await addMenuItem({
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
    const cleanName = newDishName.trim();
    if (!cleanName) {
      addToast("error", "Dish Name Required", "Please enter a name for the dish.");
      return;
    }
    if (cleanName.length > 100) {
      addToast("error", "Name Too Long", "Dish name must be 100 characters or fewer.");
      return;
    }

    const priceNum = parseFloat(newDishPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      addToast("error", "Invalid Price", "Price must be a valid non-negative number.");
      return;
    }
    if (priceNum > 50000) {
      addToast("error", "Price Exceeds Limit", "Price cannot exceed ₹50,000.");
      return;
    }

    if (newDishPrepTime < 1 || newDishPrepTime > 180) {
      addToast("error", "Invalid Prep Time", "Preparation time must be between 1 and 180 minutes.");
      return;
    }

    if (newDishDesc.trim().length > 400) {
      addToast("error", "Description Too Long", "Description must be 400 characters or fewer.");
      return;
    }

    const created = await addMenuItem({
      name: cleanName,
      category: formatCategoryName(newDishCategory),
      price: priceNum,
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

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = formatCategoryName(newCatInput);
    if (!formatted || formatted === "General") {
      addToast("error", "Invalid Name", "Please enter a valid category name.");
      return;
    }
    if (categoryList.some((c) => isCategoryMatch(c, formatted))) {
      addToast("error", "Duplicate Category", `Category "${formatted}" already exists.`);
      return;
    }

    await addCategory(formatted);
    setNewDishCategory(formatted);
    setNewCatInput("");
    addToast("success", "Category Added", `Category "${formatted}" created.`);
  };

  const handleStartRenameCategory = (cat: string) => {
    setEditingCategoryOld(cat);
    setEditingCategoryNew(cat);
  };

  const handleSaveRenameCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategoryOld) return;
    const formatted = formatCategoryName(editingCategoryNew);
    if (!formatted || formatted === "General") {
      addToast("error", "Invalid Name", "Please enter a valid category name.");
      return;
    }
    if (
      !isCategoryMatch(editingCategoryOld, formatted) &&
      categoryList.some((c) => isCategoryMatch(c, formatted))
    ) {
      addToast("error", "Duplicate Category", `Category "${formatted}" already exists.`);
      return;
    }

    await renameCategory(editingCategoryOld, formatted);
    if (activeCategory === editingCategoryOld) {
      setActiveCategory(formatted);
    }
    setEditingCategoryOld(null);
    setEditingCategoryNew("");
    addToast("success", "Category Renamed", `Updated "${editingCategoryOld}" to "${formatted}".`);
  };

  const handleDeleteCategory = async (cat: string) => {
    const dishCount = menuItems.filter((i) => isCategoryMatch(i.category, cat)).length;
    await deleteCategory(cat);
    if (activeCategory === cat) {
      setActiveCategory("all");
    }
    if (dishCount > 0) {
      addToast("info", "Category Deleted", `"${cat}" deleted. ${dishCount} dishes reassigned to General.`);
    } else {
      addToast("info", "Category Deleted", `"${cat}" was deleted.`);
    }
  };

  const handleMoveCategory = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categoryList.length) return;
    const newOrder = [...categoryList];
    const [removed] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, removed);
    await reorderCategories(newOrder);
    addToast("success", "Order Updated", "Menu category sequence updated.");
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
  const handleCommitStagedItems = async (
    approvedItems: ParsedMenuItem[],
    replaceExisting?: boolean
  ) => {
    const toCreate: Omit<MenuItem, "id">[] = [];

    for (const item of approvedItems) {
      const cleanCategory = formatCategoryName(item.category);
      if (!replaceExisting && item.isDuplicate && item.duplicateAction === "merge" && item.matchedExistingItem) {
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
      await bulkAddMenuItems(toCreate, { replaceExisting });
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

    // Sort
    if (priceSort === "low_to_high") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (priceSort === "high_to_low") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (priceSort === "name_asc") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (priceSort === "name_desc") {
      result = [...result].sort((a, b) => b.name.localeCompare(a.name));
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
    <div className="flex flex-col h-full min-h-0 gap-2.5">
      {/* ======================================================== */}
      {/* 1. FIXED TOP CONTROL AREA (Header, KPIs, Toolbar)       */}
      {/* ======================================================== */}
      <div className="shrink-0 space-y-2">
        {/* 1. Header & Creation Methods */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Menu Management
              </h1>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#14F1C7] text-[11px] font-semibold">
                <Sparkles className="h-3 w-3" />
                <span className="truncate max-w-[120px]">{tenantName}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
              Scan menus, upload PDFs, or build signature dishes manually. Live QR menus update instantaneously.
            </p>
          </div>

          {/* Action Group: 3 Creation Options + Add Category */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Camera className="h-3.5 w-3.5 text-emerald-500" />}
              onClick={() => setIsScannerOpen(true)}
              className="h-8 text-xs px-2.5 border-emerald-500/40 hover:bg-emerald-500/10 text-slate-800 dark:text-white"
            >
              Scan
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<UploadCloud className="h-3.5 w-3.5 text-teal-500" />}
              onClick={() => setIsUploadOpen(true)}
              className="h-8 text-xs px-2.5 border-teal-500/40 hover:bg-teal-500/10 text-slate-800 dark:text-white"
            >
              Upload
            </Button>

            <Button
              variant="glow"
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => setIsAddModalOpen(true)}
              className="h-8 text-xs px-3 font-bold"
            >
              Add Dish
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Layers className="h-3.5 w-3.5 text-indigo-500" />}
              onClick={() => setIsCategoryManagerOpen(true)}
              className="h-8 text-xs px-2.5 border-indigo-500/30 hover:bg-indigo-500/10 text-slate-800 dark:text-white"
            >
              Categories
            </Button>
          </div>
        </div>

        {/* 1.5. Sleek Compact KPI Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pb-0.5">
          <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-2xs min-w-[130px] sm:min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Dishes</span>
              <div className="h-5 w-5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Utensils className="h-3 w-3" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {isLoading && menuItems.length === 0 ? "—" : <NumberFlow value={kpiStats.total} />}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {isLoading && menuItems.length === 0 ? "loading..." : `in ${kpiStats.categoriesCount} cats`}
              </span>
            </div>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-2xs min-w-[130px] sm:min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Categories</span>
              <div className="h-5 w-5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Layers className="h-3 w-3" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {isLoading && menuItems.length === 0 ? "—" : <NumberFlow value={kpiStats.categoriesCount} />}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">sections</span>
            </div>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-2xs min-w-[130px] sm:min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Availability</span>
              <div className="h-5 w-5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {isLoading && menuItems.length === 0 ? "—" : <NumberFlow value={kpiStats.inStock} />}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {isLoading && menuItems.length === 0 ? "—" : (kpiStats.outOfStock > 0 ? `${kpiStats.outOfStock} 86'd` : "100% In Stock")}
              </span>
            </div>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-2xs min-w-[130px] sm:min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Dietary</span>
              <div className="h-5 w-5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Flame className="h-3 w-3" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
                {isLoading && menuItems.length === 0 ? "—" : <><NumberFlow value={kpiStats.veg} />V</>}
              </span>
              <span className="text-xs text-slate-300 dark:text-slate-700">/</span>
              <span className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400">
                {isLoading && menuItems.length === 0 ? "—" : <><NumberFlow value={kpiStats.nonVeg} />NV</>}
              </span>
              <span className="text-[10px] text-slate-400 font-medium ml-1">
                {isLoading && menuItems.length === 0 ? "" : `(${kpiStats.total > 0 ? Math.round((kpiStats.veg / kpiStats.total) * 100) : 0}% Veg)`}
              </span>
            </div>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-2xs min-w-[130px] sm:min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Average Price</span>
              <div className="h-5 w-5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <IndianRupee className="h-3 w-3" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {isLoading && menuItems.length === 0 ? "—" : <>₹<NumberFlow value={kpiStats.avg} /></>}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">avg</span>
            </div>
          </div>
        </div>

        {/* 2. Unified Toolbar: Category Tabs + Search + Multi-Filter Chips + ViewToggle */}
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-2 sm:p-2.5 space-y-2 shadow-2xs">
          {/* Top Row: Category Tabs + Search Bar + View Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="min-w-0 flex-1 overflow-x-auto scrollbar-none [-webkit-overflow-scrolling:touch]">
              <div className="min-w-max">
                <Tabs tabs={categoriesTabs} activeTab={activeCategory} onChange={setActiveCategory} />
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search dishes or Hindi name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              {/* Linear / Notion style Grid & List view toggle */}
              <ViewToggle view={viewMode} onViewChange={setViewMode} />
            </div>
          </div>

          {/* Bottom Row: Dietary Chips + Stock Chips + Bestseller Chips + Sorter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            {/* Left: Filter Chips Group */}
            <div className="flex-1 overflow-x-auto scrollbar-none [-webkit-overflow-scrolling:touch]">
              <div className="flex items-center gap-1.5 min-w-max pb-0.5">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 shrink-0 mr-1 flex items-center gap-1">
                  <SlidersHorizontal className="h-3 w-3" />
                  <span className="hidden sm:inline">Filters:</span>
                </span>

                {/* Dietary Filter */}
                {(["all", "veg", "non_veg"] as const).map((diet) => (
                  <button
                    key={diet}
                    type="button"
                    onClick={() => setDietaryFilter(diet)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      dietaryFilter === diet
                        ? "bg-emerald-500 text-slate-950 shadow-xs font-bold"
                        : "bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {diet === "all" ? "All Diets" : diet === "veg" ? "Pure Veg 🟢" : "Non-Veg 🔴"}
                  </button>
                ))}

                <span className="h-3 w-px bg-slate-200 dark:bg-slate-800 shrink-0 mx-0.5" />

                {/* Stock Filter */}
                {(["all", "available", "unavailable"] as const).map((stock) => (
                  <button
                    key={stock}
                    type="button"
                    onClick={() => setAvailabilityFilter(stock)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      availabilityFilter === stock
                        ? "bg-emerald-500 text-slate-950 shadow-xs font-bold"
                        : "bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {stock === "all" ? "All Stock" : stock === "available" ? "In Stock" : "86'd (Sold Out)"}
                  </button>
                ))}
              <span className="h-3 w-px bg-slate-200 dark:bg-slate-800 shrink-0 mx-0.5" />

              {/* Bestseller Filter */}
              {(["all", "bestseller", "recommended"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setHighlightFilter(mode)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    highlightFilter === mode
                      ? "bg-amber-500 text-slate-950 shadow-xs font-bold"
                      : "bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {mode === "all" ? "All Items" : mode === "bestseller" ? "⭐ Bestsellers" : "✨ Recommended"}
                </button>
              ))}
              </div>
            </div>

            {/* Right: Price Sorter */}
            <div className="flex items-center gap-1.5 shrink-0">
              <ArrowUpDown className="h-3 w-3 text-slate-400" />
              <select
                value={priceSort}
                onChange={(e) => setPriceSort(e.target.value as any)}
                className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs cursor-pointer font-medium"
              >
                <option value="none">Sort by: Default</option>
                <option value="low_to_high">Price: Low to High</option>
                <option value="high_to_low">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SCROLLABLE FOOD ITEMS CONTAINER (Only dishes scroll)  */}
      {/* ======================================================== */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-16 scrollbar-thin">

      {/* ======================================================== */}
      {/* 4. DISHES LOADING SKELETON / EMPTY STATE / GRID / LIST    */}
      {/* ======================================================== */}
      {isLoading && menuItems.length === 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`menu-skel-${i}`}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 overflow-hidden animate-pulse flex flex-col justify-between"
              >
                <div className="h-44 bg-slate-200 dark:bg-slate-800" />
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-5 w-14 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  </div>
                  <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800/60 rounded" />
                  <div className="h-3.5 w-2/3 bg-slate-100 dark:bg-slate-800/60 rounded" />
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`menu-skel-row-${i}`}
                className="h-16 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 animate-pulse px-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-800" />
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800/60 rounded" />
                  </div>
                </div>
                <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        )
      ) : filteredItems.length === 0 ? (
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
      ) : viewMode === "grid" ? (
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
                  className={`absolute top-3 left-3 z-[2] h-6 w-6 rounded-md flex items-center justify-center transition-all cursor-pointer ${
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
                  <div className="h-40 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 mb-4 relative overflow-hidden bg-slate-100 dark:bg-slate-950">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
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

                      <div
                        className="min-w-0 cursor-pointer group/title"
                        onClick={() => handleOpenEditDish(item)}
                        title="Click to edit dish"
                      >
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight truncate group-hover/title:text-emerald-600 dark:group-hover/title:text-[#14F1C7] transition-colors">
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
                      <Badge variant={item.available ? "success" : "danger"} size="sm" dot className="whitespace-nowrap">
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
                    {/* Edit Dish Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditDish(item)}
                      className="h-8 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Edit dish details"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>

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
                      onClick={() => setDishToDelete({ id: item.id, name: item.name })}
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
      ) : (
        /* ======================================================== */
        /* ENTERPRISE MENU LIST VIEW                                */
        /* ======================================================== */
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md overflow-hidden shadow-2xs">
          <div className="overflow-x-auto scrollbar-none [-webkit-overflow-scrolling:touch]">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-slate-200/80 dark:border-slate-800/80">
                  <TableHead className="w-12 pl-4">
                    <button
                      type="button"
                      onClick={selectedIds.length === filteredItems.length && filteredItems.length > 0 ? handleDeselectAll : handleSelectAll}
                      className="text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
                      title={selectedIds.length === filteredItems.length ? "Deselect All" : "Select All"}
                    >
                      {selectedIds.length > 0 && selectedIds.length === filteredItems.length ? (
                        <CheckSquare className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Dish & Culinary Details</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-4">Quick Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <TableRow
                      key={item.id}
                      className={`transition-colors ${
                        isSelected
                          ? "bg-emerald-500/5 dark:bg-emerald-500/10"
                          : !item.available
                          ? "opacity-75 bg-slate-50/40 dark:bg-slate-900/20"
                          : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <TableCell className="pl-4">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectDish(item.id)}
                          className="h-5 w-5 rounded flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
                          title={isSelected ? "Deselect" : "Select"}
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </TableCell>

                      {/* Dish details */}
                      <TableCell>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-11 w-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/80 dark:border-slate-700/60 relative">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = "none";
                                }}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-400">
                                <Utensils className="h-4 w-4" />
                              </div>
                            )}
                          </div>

                          {/* Veg dot */}
                          <span
                            className={`inline-flex items-center justify-center h-4 w-4 rounded border shrink-0 ${
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

                          {/* Titles & Highlights */}
                          <div
                            className="min-w-0 flex-1 cursor-pointer"
                            onClick={() => handleOpenEditDish(item)}
                            title="Click to edit dish"
                          >
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-bold text-slate-900 dark:text-white truncate hover:text-emerald-600 dark:hover:text-[#14F1C7] transition-colors">
                                {item.name}
                              </span>
                              {item.bestseller && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                  <Star className="h-2.5 w-2.5 fill-amber-500" /> Bestseller
                                </span>
                              )}
                              {item.recommended && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                  <Sparkles className="h-2.5 w-2.5" /> Chef Pick
                                </span>
                              )}
                              {item.spicyLevel && item.spicyLevel > 0 ? (
                                <span className="text-[10px]" title={`Spicy Level: ${item.spicyLevel}`}>
                                  {"🌶️".repeat(item.spicyLevel)}
                                </span>
                              ) : null}
                            </div>

                            {item.hindiName ? (
                              <span className="text-[11px] text-slate-400 block truncate">
                                {item.hindiName}
                              </span>
                            ) : null}

                            {item.desc ? (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[240px] truncate block">
                                {item.desc}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                            {item.category}
                          </span>
                          {item.prepTimeMinutes ? (
                            <span className="text-[10px] text-slate-500 shrink-0 flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" /> {item.prepTimeMinutes}m
                            </span>
                          ) : null}
                        </div>
                      </TableCell>

                      {/* Price */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                            {formatCurrency(item.price, tenant?.currency || "INR")}
                          </span>
                          {item.variantsCount && item.variantsCount > 0 ? (
                            <Badge variant="neutral" size="sm" className="text-[10px] py-0 px-1.5">
                              {item.variantsCount} sizes
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(item.id, item.available)}
                          className="cursor-pointer"
                          title={`Click to mark as ${item.available ? "86'd" : "In Stock"}`}
                        >
                          <Badge variant={item.available ? "success" : "danger"} size="sm" dot className="whitespace-nowrap">
                            {item.available ? "In Stock" : "86'd"}
                          </Badge>
                        </button>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditDish(item)}
                            className="h-8 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            title="Edit dish details"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicateDish(item)}
                            className="h-8 w-8 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-500/10 flex items-center justify-center transition-colors cursor-pointer"
                            title="Duplicate dish"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium px-2"
                            onClick={() => handleToggleAvailability(item.id, item.available)}
                          >
                            {item.available ? "86" : "Restock"}
                          </Button>

                          <button
                            type="button"
                            onClick={() => setDishToDelete({ id: item.id, name: item.name })}
                            className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer"
                            title="Delete dish"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      </div>

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

      {/* Category Manager Modal */}
      <Modal
        isOpen={isCategoryManagerOpen}
        onClose={() => {
          setIsCategoryManagerOpen(false);
          setEditingCategoryOld(null);
          setEditingCategoryNew("");
          setNewCatInput("");
        }}
        title="Manage Menu Categories"
        description="Organize, rename, reorder, or delete categories. The sequence below directly affects customer QR ordering."
        className="max-w-xl"
        footer={
          <div className="flex items-center justify-end w-full">
            <Button
              variant="glow"
              size="sm"
              onClick={() => {
                setIsCategoryManagerOpen(false);
                setEditingCategoryOld(null);
                setEditingCategoryNew("");
              }}
            >
              Done
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-1">
          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Artisanal Breads or Mocktails"
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
            <Button type="submit" variant="glow" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Add
            </Button>
          </form>

          {/* Categories List */}
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {categoryList.map((cat, idx) => {
              const dishCount = menuItems.filter((i) => isCategoryMatch(i.category, cat)).length;
              const isEditing = editingCategoryOld === cat;

              return (
                <div
                  key={cat}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
                >
                  {isEditing ? (
                    <form onSubmit={handleSaveRenameCategory} className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editingCategoryNew}
                        onChange={(e) => setEditingCategoryNew(e.target.value)}
                        autoFocus
                        className="flex-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-950 border border-emerald-500 text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                      <Button type="submit" variant="glow" size="sm" className="h-7 px-2.5 text-xs">
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setEditingCategoryOld(null)}
                      >
                        Cancel
                      </Button>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Reorder Buttons */}
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveCategory(idx, "up")}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 disabled:cursor-not-allowed"
                            title="Move category up"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === categoryList.length - 1}
                            onClick={() => handleMoveCategory(idx, "down")}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 disabled:cursor-not-allowed"
                            title="Move category down"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>

                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {cat}
                          </span>
                          <span className="ml-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            ({dishCount} {dishCount === 1 ? "dish" : "dishes"})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartRenameCategory(cat)}
                          className="h-7 w-7 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-500/10 flex items-center justify-center transition-colors cursor-pointer"
                          title="Rename category"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer"
                          title="Delete category"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* Delete Dish Confirmation Modal */}
      <Modal
        isOpen={!!dishToDelete}
        onClose={() => setDishToDelete(null)}
        title="Delete Menu Dish"
        description="Are you sure you want to permanently remove this dish?"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setDishToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white border-transparent"
              onClick={confirmDeleteDish}
            >
              Delete Dish
            </Button>
          </div>
        }
      >
        <div className="py-2 space-y-2">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            You are about to delete <strong className="text-slate-900 dark:text-white font-bold">{dishToDelete?.name}</strong>.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This will immediately remove it from all active customer QR menus, waiter POS terminals, and kitchen displays.
          </p>
        </div>
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

          {/* Dish Photography Upload, Dropzone & Presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Food Photography (Optional)
              </label>
              <input
                ref={addDishFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleDishPhotoSelect(e, false)}
              />
            </div>

            {newDishImageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 mb-2 group">
                <div className="h-32 w-full bg-slate-950">
                  <img
                    src={newDishImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => addDishFileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold backdrop-blur cursor-pointer shadow-md"
                  >
                    Replace Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewDishImageUrl("")}
                    className="h-7 w-7 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white flex items-center justify-center backdrop-blur cursor-pointer shadow-md"
                    title="Remove Photo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => addDishFileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/70 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-950/50 mb-2"
              >
                <ImagePlus className="h-6 w-6 text-slate-400 mx-auto mb-1.5" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Click to upload high-res food photo
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  PNG, JPG or WEBP up to 5MB
                </span>
              </div>
            )}

            <input
              type="url"
              placeholder="Or paste image URL (https://...)"
              value={newDishImageUrl}
              onChange={(e) => setNewDishImageUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-none pb-1">
              <span className="text-[10px] text-slate-500 shrink-0">Presets:</span>
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

      {/* Edit Dish Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Dish Details"
        description={`Modify recipe details, pricing, dietary flags, or category for "${editDishName}".`}
        className="max-w-2xl"
        footer={
          <div className="flex items-center justify-between gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
              onClick={() => {
                setIsEditModalOpen(false);
                setDishToDelete({ id: editDishId, name: editDishName });
              }}
            >
              Delete Dish
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="edit-dish-form" variant="glow" size="sm">
                Save Changes
              </Button>
            </div>
          </div>
        }
      >
        <form id="edit-dish-form" onSubmit={handleUpdateDish} className="space-y-4 py-1">
          {/* Dish Name & Hindi Script */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Dish Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Espresso or Paneer Butter Masala"
                value={editDishName}
                onChange={(e) => setEditDishName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 shadow-xs font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Hindi / Regional Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. एस्प्रेसो"
                value={editDishHindiName}
                onChange={(e) => setEditDishHindiName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 shadow-xs"
              />
            </div>
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Category *
                </label>
                <button
                  type="button"
                  onClick={() => setIsCategoryManagerOpen(true)}
                  className="text-[11px] text-emerald-600 dark:text-[#14F1C7] hover:underline font-semibold cursor-pointer"
                >
                  Manage Categories
                </button>
              </div>
              <select
                value={editDishCategory}
                onChange={(e) => {
                  if (e.target.value === "__create_new__") {
                    setIsCategoryManagerOpen(true);
                  } else {
                    setEditDishCategory(e.target.value);
                  }
                }}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs font-medium"
              >
                {categoryList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__create_new__" className="text-emerald-600 font-bold">
                  + Manage Categories…
                </option>
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
                placeholder="e.g. 140"
                value={editDishPrice}
                onChange={(e) => setEditDishPrice(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono shadow-xs font-bold"
              />
            </div>
          </div>

          {/* Dietary Classification & Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Dietary Classification
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEditDishIsVeg(true)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    editDishIsVeg
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Pure Veg 🟢
                </button>
                <button
                  type="button"
                  onClick={() => setEditDishIsVeg(false)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    !editDishIsVeg
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
                Stock Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEditDishAvailable(true)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    editDishAvailable
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  In Stock ✓
                </button>
                <button
                  type="button"
                  onClick={() => setEditDishAvailable(false)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    !editDishAvailable
                      ? "bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-400"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  86'd / Sold Out
                </button>
              </div>
            </div>
          </div>

          {/* Spice Level & Prep Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Spice Level
              </label>
              <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-slate-50 dark:bg-slate-950 justify-around">
                {[0, 1, 2, 3].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setEditDishSpicyLevel(lvl)}
                    className={`h-7 px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      editDishSpicyLevel === lvl
                        ? "bg-amber-500 text-slate-950 shadow-xs"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    }`}
                    title={lvl === 0 ? "Mild" : lvl === 1 ? "Medium" : lvl === 2 ? "Hot" : "Fiery"}
                  >
                    {lvl === 0 ? "0 (None)" : "🌶️".repeat(lvl)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Preparation Time
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={editDishPrepTime}
                  onChange={(e) => setEditDishPrepTime(parseInt(e.target.value) || 15)}
                  className="w-full pl-3 pr-9 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">min</span>
              </div>
            </div>
          </div>

          {/* Highlights Switchers */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={editDishBestseller}
                onChange={(e) => setEditDishBestseller(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-emerald-600 focus:ring-0"
              />
              <span>⭐ Mark as Bestseller</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={editDishRecommended}
                onChange={(e) => setEditDishRecommended(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-emerald-600 focus:ring-0"
              />
              <span>✨ Chef Recommended</span>
            </label>
          </div>

          {/* Dish Photography Upload, Dropzone & Presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Food Photography (Optional)
              </label>
              <input
                ref={editDishFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleDishPhotoSelect(e, true)}
              />
            </div>

            {editDishImageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 mb-2 group">
                <div className="h-32 w-full bg-slate-950">
                  <img
                    src={editDishImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => editDishFileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold backdrop-blur cursor-pointer shadow-md"
                  >
                    Replace Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditDishImageUrl("")}
                    className="h-7 w-7 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white flex items-center justify-center backdrop-blur cursor-pointer shadow-md"
                    title="Remove Photo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => editDishFileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/70 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-950/50 mb-2"
              >
                <ImagePlus className="h-6 w-6 text-slate-400 mx-auto mb-1.5" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Click to upload high-res food photo
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  PNG, JPG or WEBP up to 5MB
                </span>
              </div>
            )}

            <input
              type="url"
              placeholder="Or paste image URL (https://...)"
              value={editDishImageUrl}
              onChange={(e) => setEditDishImageUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-none pb-1">
              <span className="text-[10px] text-slate-500 shrink-0">Presets:</span>
              {IMAGE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setEditDishImageUrl(p.url)}
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
              value={editDishDesc}
              onChange={(e) => setEditDishDesc(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-none shadow-xs"
            />
          </div>

          {/* Variants & Modifiers */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={editHasVariants}
                onChange={(e) => setEditHasVariants(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-emerald-600 focus:ring-0"
              />
              <span>Enable Size / Portion Variants (e.g. Half / Full)</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={editHasModifiers}
                onChange={(e) => setEditHasModifiers(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-emerald-600 focus:ring-0"
              />
              <span>Enable Add-on Modifier Groups (e.g. Extra Butter, Extra Shot)</span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
