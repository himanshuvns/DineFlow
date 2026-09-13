"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Square,
  Tag,
  TrendingUp,
  Percent,
  Slash,
  Trash2,
  X,
  Sparkles,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { deduplicateCategories } from "@/lib/utils/category-utils";

interface MenuBulkToolbarProps {
  selectedIds: string[];
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkUpdateCategory: (category: string) => Promise<void>;
  onBulkAdjustPrice: (percentage: number) => Promise<void>;
  onBulkToggleAvailability: (available: boolean) => Promise<void>;
  onBulkDelete: () => Promise<void>;
  existingCategories: string[];
}

export function MenuBulkToolbar({
  selectedIds,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBulkUpdateCategory,
  onBulkAdjustPrice,
  onBulkToggleAvailability,
  onBulkDelete,
  existingCategories,
}: MenuBulkToolbarProps) {
  const { addToast } = useToast();
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = React.useState(false);
  const [isPriceMenuOpen, setIsPriceMenuOpen] = React.useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState(false);
  const [customPricePercent, setCustomPricePercent] = React.useState("10");

  const categoryOptions = React.useMemo(() => {
    return deduplicateCategories(existingCategories, { removePlaceholderGeneral: true });
  }, [existingCategories]);

  if (selectedIds.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed bottom-4 sm:bottom-6 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 max-w-2xl w-full"
      >
        <div className="p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl bg-slate-900/95 dark:bg-[#0F172A]/95 backdrop-blur-xl border border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.4)] text-white flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Count & Select All */}
          <div className="flex items-center gap-2.5">
            <span className="h-6 px-2.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-xs font-semibold text-slate-200">
              Selected of {totalCount}
            </span>

            <button
              type="button"
              onClick={selectedIds.length === totalCount ? onDeselectAll : onSelectAll}
              className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
            >
              {selectedIds.length === totalCount ? "Deselect all" : "Select all"}
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* 1. Category Switcher */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                onClick={() => {
                  setIsCategoryMenuOpen(!isCategoryMenuOpen);
                  setIsPriceMenuOpen(false);
                }}
                leftIcon={<Tag className="h-3.5 w-3.5 text-emerald-400" />}
                rightIcon={<ChevronDown className="h-3 w-3" />}
              >
                Set Category
              </Button>

              {isCategoryMenuOpen && (
                <div className="absolute bottom-full mb-2 left-0 w-52 max-h-56 overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 shadow-xl p-1.5 space-y-0.5 z-50 scrollbar-none">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                    Assign Category
                  </span>
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={async () => {
                        await onBulkUpdateCategory(cat);
                        setIsCategoryMenuOpen(false);
                        addToast("success", "Category Updated", `Moved ${selectedIds.length} items to "${cat}".`);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-emerald-500 hover:text-slate-950 font-medium transition-colors cursor-pointer truncate"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Price Adjustment */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                onClick={() => {
                  setIsPriceMenuOpen(!isPriceMenuOpen);
                  setIsCategoryMenuOpen(false);
                }}
                leftIcon={<TrendingUp className="h-3.5 w-3.5 text-amber-400" />}
                rightIcon={<ChevronDown className="h-3 w-3" />}
              >
                Adjust Price
              </Button>

              {isPriceMenuOpen && (
                <div className="absolute bottom-full mb-2 left-0 sm:right-0 sm:left-auto w-56 rounded-2xl bg-slate-900 border border-slate-700 shadow-xl p-2.5 space-y-2 z-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Adjust Selected Prices
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[5, 10, 15, -5].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={async () => {
                          await onBulkAdjustPrice(pct);
                          setIsPriceMenuOpen(false);
                          addToast(
                            "success",
                            "Prices Adjusted",
                            `Adjusted prices of ${selectedIds.length} dishes by ${pct > 0 ? `+${pct}` : pct}%.`
                          );
                        }}
                        className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
                      >
                        {pct > 0 ? `+${pct}%` : `${pct}%`}
                      </button>
                    ))}
                  </div>

                  <div className="pt-1 border-t border-slate-800 flex items-center gap-1.5">
                    <input
                      type="number"
                      value={customPricePercent}
                      onChange={(e) => setCustomPricePercent(e.target.value)}
                      placeholder="%"
                      className="w-16 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                    <Button
                      variant="glow"
                      size="sm"
                      className="h-7 text-xs flex-1"
                      onClick={async () => {
                        const val = parseFloat(customPricePercent);
                        if (!isNaN(val)) {
                          await onBulkAdjustPrice(val);
                          setIsPriceMenuOpen(false);
                          addToast(
                            "success",
                            "Prices Adjusted",
                            `Adjusted prices of ${selectedIds.length} dishes by ${val > 0 ? `+${val}` : val}%.`
                          );
                        }
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Toggle In-Stock / 86'd */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
              onClick={async () => {
                await onBulkToggleAvailability(true);
                addToast("success", "Dishes In Stock", `Restocked ${selectedIds.length} dishes.`);
              }}
            >
              Restock
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700"
              onClick={async () => {
                await onBulkToggleAvailability(false);
                addToast("warning", "Dishes 86'd", `Marked ${selectedIds.length} dishes out of stock.`);
              }}
            >
              86 All
            </Button>

            {/* 4. Delete */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              onClick={async () => {
                if (window.confirm(`Are you sure you want to delete ${selectedIds.length} dishes?`)) {
                  await onBulkDelete();
                  addToast("info", "Dishes Deleted", `Removed ${selectedIds.length} dishes from the menu.`);
                }
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>

            {/* Close / Deselect */}
            <button
              type="button"
              onClick={onDeselectAll}
              className="h-7 w-7 rounded-lg text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
