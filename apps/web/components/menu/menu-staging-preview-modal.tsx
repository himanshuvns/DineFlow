"use client";

import * as React from "react";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Check,
  Trash2,
  Plus,
  AlertTriangle,
  RefreshCw,
  Flame,
  Clock,
  CheckCircle2,
  ChevronDown,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { INDIAN_CATEGORIES } from "@/lib/data/indian-food-database";
import type { ParsedMenuItem } from "@/lib/utils/menu-nlp-engine";
import type { MenuItem } from "@/lib/stores/tenant-data-store";

interface MenuStagingPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ParsedMenuItem[];
  onCommit: (approvedItems: ParsedMenuItem[]) => Promise<void>;
  existingCategories: string[];
}

export function MenuStagingPreviewModal({
  isOpen,
  onClose,
  items: initialItems,
  onCommit,
  existingCategories,
}: MenuStagingPreviewModalProps) {
  const { addToast } = useToast();
  const [stagedItems, setStagedItems] = React.useState<ParsedMenuItem[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Available categories list
  const categoryOptions = React.useMemo(() => {
    const set = new Set([...existingCategories, ...INDIAN_CATEGORIES]);
    return Array.from(set);
  }, [existingCategories]);

  React.useEffect(() => {
    if (initialItems.length > 0) {
      setStagedItems(initialItems);
    }
  }, [initialItems]);

  // Update item field
  const handleUpdateItem = (tempId: string, updates: Partial<ParsedMenuItem>) => {
    setStagedItems((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, ...updates } : item))
    );
  };

  // Remove single item
  const handleRemoveItem = (tempId: string) => {
    setStagedItems((prev) => prev.filter((i) => i.tempId !== tempId));
  };

  // Add a blank item row
  const handleAddBlankRow = () => {
    const newItem: ParsedMenuItem = {
      tempId: `manual_${Date.now()}`,
      name: "New Indian Specialty",
      category: categoryOptions[0] || "North Indian",
      price: 250,
      isVeg: true,
      spicyLevel: 1,
      prepTimeMinutes: 15,
      desc: "Prepared fresh with chef's signature spices.",
      rawText: "Manual entry",
      confidence: 1,
      isDuplicate: false,
    };
    setStagedItems((prev) => [newItem, ...prev]);
  };

  // Summary statistics
  const totalCount = stagedItems.length;
  const vegCount = stagedItems.filter((i) => i.isVeg).length;
  const nonVegCount = totalCount - vegCount;
  const duplicateCount = stagedItems.filter((i) => i.isDuplicate).length;
  const avgPrice =
    totalCount > 0
      ? Math.round(stagedItems.reduce((sum, i) => sum + (i.price || 0), 0) / totalCount)
      : 0;

  const handleCommitAll = async () => {
    if (stagedItems.length === 0) {
      addToast("warning", "No Items to Import", "Please keep at least one valid item.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onCommit(stagedItems);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#14F1C7", "#f59e0b"],
      });
      addToast(
        "success",
        "Menu Successfully Updated!",
        `Imported ${stagedItems.length} dishes to your live menu.`
      );
      onClose();
    } catch (err: any) {
      addToast("error", "Import Failed", err?.message || "Could not save dishes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Menu Staging & Review"
      description="Verify extracted dishes, adjust pricing, and resolve duplicates before publishing to your live QR menu."
      className="max-w-4xl"
      footer={
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{totalCount} dishes staged</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{vegCount} Pure Veg</span>
            <span>•</span>
            <span className="text-rose-600 dark:text-rose-400 font-semibold">{nonVegCount} Non-Veg</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Discard
            </Button>
            <Button
              variant="glow"
              size="sm"
              onClick={handleCommitAll}
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
            >
              Publish {totalCount} Items to Menu
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {/* Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Total Extracted</span>
            <span className="font-bold text-slate-900 dark:text-white text-base">{totalCount} items</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Dietary Split</span>
            <span className="font-bold text-slate-900 dark:text-white text-base">
              <span className="text-emerald-600 dark:text-emerald-400">{vegCount}V</span> /{" "}
              <span className="text-rose-600 dark:text-rose-400">{nonVegCount}NV</span>
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Est. Average Price</span>
            <span className="font-bold text-slate-900 dark:text-white text-base font-mono">₹{avgPrice}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Duplicate Alerts</span>
            <span className={`font-bold text-base ${duplicateCount > 0 ? "text-amber-500" : "text-emerald-500"}`}>
              {duplicateCount} detected
            </span>
          </div>
        </div>

        {/* Duplicate Warning Banner */}
        {duplicateCount > 0 && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div className="space-y-0.5">
              <p className="font-semibold">
                {duplicateCount} item{duplicateCount > 1 ? "s" : ""} match dishes already on your menu
              </p>
              <p className="text-[11.5px] text-amber-600/90 dark:text-amber-300/80">
                You can choose to merge and update the existing price, or add as a distinct separate listing.
              </p>
            </div>
          </div>
        )}

        {/* Top actions */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Staged Menu Items
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
            onClick={handleAddBlankRow}
          >
            Add Item
          </Button>
        </div>

        {/* Staging List */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 pb-safe scrollbar-none">
          {stagedItems.map((item, index) => (
            <div
              key={item.tempId}
              className={`p-3.5 rounded-2xl border transition-all ${
                item.isDuplicate
                  ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60"
                  : "bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {/* Duplicate Badge & Selector */}
              {item.isDuplicate && item.matchedExistingItem && (
                <div className="mb-2.5 pb-2 border-b border-amber-200 dark:border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-medium">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>
                      Matches existing dish: <strong>{item.matchedExistingItem.name}</strong> (₹
                      {item.matchedExistingItem.price})
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateItem(item.tempId, { duplicateAction: "merge" })}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                        item.duplicateAction === "merge"
                          ? "bg-amber-500 text-slate-950 shadow-xs"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      Update Price
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateItem(item.tempId, { duplicateAction: "distinct" })}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                        item.duplicateAction === "distinct"
                          ? "bg-amber-500 text-slate-950 shadow-xs"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      Keep Both
                    </button>
                  </div>
                </div>
              )}

              {/* Row 1: Name, Price, Veg/Non-Veg, Category, Delete */}
              <div className="grid grid-cols-12 gap-2 items-center">
                {/* Veg / Non-Veg Toggle Pill */}
                <div className="col-span-3 xs:col-span-2 sm:col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleUpdateItem(item.tempId, { isVeg: !item.isVeg })}
                    title={item.isVeg ? "Pure Veg (Click to change to Non-Veg)" : "Non-Veg (Click to change to Veg)"}
                    className={`h-7 w-7 rounded-lg border flex items-center justify-center cursor-pointer transition-all active:scale-95 ${
                      item.isVeg
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        item.isVeg ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />
                  </button>
                </div>

                {/* Dish Name */}
                <div className="col-span-9 xs:col-span-10 sm:col-span-5">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(item.tempId, { name: e.target.value })}
                    placeholder="Dish name"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                  {item.hindiName && (
                    <span className="text-[10px] text-slate-400 font-sans pl-1">
                      {item.hindiName}
                    </span>
                  )}
                </div>

                {/* Category Dropdown */}
                <div className="col-span-6 sm:col-span-3">
                  <select
                    value={item.category}
                    onChange={(e) => handleUpdateItem(item.tempId, { category: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Input */}
                <div className="col-span-4 sm:col-span-2">
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-xs text-slate-400 font-mono">₹</span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={item.price}
                      onChange={(e) =>
                        handleUpdateItem(item.tempId, { price: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full pl-5 pr-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Delete Button */}
                <div className="col-span-2 sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.tempId)}
                    className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Row 2: Description & Quick Attributes */}
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
                <input
                  type="text"
                  value={item.desc}
                  onChange={(e) => handleUpdateItem(item.tempId, { desc: e.target.value })}
                  placeholder="Culinary notes, ingredients, allergen warnings..."
                  className="w-full text-[11px] text-slate-600 dark:text-slate-400 bg-transparent outline-none border-b border-transparent focus:border-slate-300 dark:focus:border-slate-700 py-0.5"
                />

                {/* Spice Level Selector */}
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] text-slate-400 mr-1">Spice:</span>
                  {[0, 1, 2, 3].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleUpdateItem(item.tempId, { spicyLevel: lvl })}
                      className={`h-5 w-5 rounded text-[10px] font-bold flex items-center justify-center cursor-pointer transition-colors ${
                        item.spicyLevel === lvl
                          ? "bg-amber-500 text-slate-950"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      }`}
                      title={lvl === 0 ? "Mild" : lvl === 1 ? "Medium" : lvl === 2 ? "Hot" : "Fiery"}
                    >
                      {lvl === 0 ? "0" : "🌶️".repeat(lvl)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
