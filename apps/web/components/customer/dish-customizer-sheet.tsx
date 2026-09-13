"use client";

import * as React from "react";
import { X, Plus, Minus, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/lib/stores/cart-store";

export interface MenuItemVariant {
  name: string;
  price: number;
}

export interface MenuItemModifier {
  name: string;
  price: number;
}

export interface MenuItemModifierGroup {
  id: string;
  name: string;
  minSelections: number;
  maxSelections: number;
  options: MenuItemModifier[];
}

export interface CustomizerDish {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl?: string;
  isVeg: boolean;
  variants?: MenuItemVariant[];
  modifierGroups?: MenuItemModifierGroup[];
}

interface DishCustomizerSheetProps {
  dish: CustomizerDish | null;
  isOpen: boolean;
  onClose: () => void;
  onAddedToCart?: () => void;
}

export function DishCustomizerSheet({
  dish,
  isOpen,
  onClose,
  onAddedToCart,
}: DishCustomizerSheetProps) {
  const { addItem } = useCartStore();

  const [selectedVariant, setSelectedVariant] = React.useState<MenuItemVariant | null>(null);
  const [selectedModifiers, setSelectedModifiers] = React.useState<MenuItemModifier[]>([]);
  const [quantity, setQuantity] = React.useState(1);
  const [specialInstructions, setSpecialInstructions] = React.useState("");

  // Reset choices whenever dish opens
  React.useEffect(() => {
    if (dish) {
      if (dish.variants && dish.variants.length > 0) {
        setSelectedVariant(dish.variants[0]);
      } else {
        setSelectedVariant(null);
      }
      setSelectedModifiers([]);
      setQuantity(1);
      setSpecialInstructions("");
    }
  }, [dish, isOpen]);

  if (!isOpen || !dish) return null;

  const currentBasePrice = selectedVariant ? selectedVariant.price : dish.basePrice;
  const modifiersPrice = selectedModifiers.reduce((sum, m) => sum + m.price, 0);
  const unitTotal = currentBasePrice + modifiersPrice;
  const grandTotal = unitTotal * quantity;

  const handleModifierToggle = (group: MenuItemModifierGroup, mod: MenuItemModifier) => {
    const isSelected = selectedModifiers.some((m) => m.name === mod.name);
    if (isSelected) {
      setSelectedModifiers(selectedModifiers.filter((m) => m.name !== mod.name));
    } else {
      // Check group max selections
      const currentInGroup = selectedModifiers.filter((m) =>
        group.options.some((opt) => opt.name === m.name)
      );
      if (group.maxSelections === 1) {
        // Replace selection in this single-select group
        const withoutGroup = selectedModifiers.filter(
          (m) => !group.options.some((opt) => opt.name === m.name)
        );
        setSelectedModifiers([...withoutGroup, mod]);
      } else if (currentInGroup.length < group.maxSelections) {
        setSelectedModifiers([...selectedModifiers, mod]);
      }
    }
  };

  const handleAddToCart = () => {
    addItem({
      menuItemId: dish.id,
      name: dish.name,
      unitPrice: currentBasePrice,
      quantity,
      selectedVariant: selectedVariant?.name,
      selectedModifiers,
      notes: specialInstructions.trim() || undefined,
    });
    if (onAddedToCart) onAddedToCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Container */}
      <div className="relative w-full max-w-lg max-h-[85dvh] sm:max-h-[90dvh] flex flex-col bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header with image */}
        {dish.imageUrl && (
          <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
            <img
              src={dish.imageUrl}
              alt={dish.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 h-9 w-9 rounded-full bg-slate-900/80 backdrop-blur-md text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <span
                className={`inline-flex items-center justify-center h-5 w-5 rounded border ${
                  dish.isVeg
                    ? "border-emerald-500 bg-emerald-950/80 text-emerald-400"
                    : "border-rose-500 bg-rose-950/80 text-rose-400"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    dish.isVeg ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
              </span>
              <span className="text-xs font-semibold text-white/90 drop-shadow">
                {dish.isVeg ? "Pure Veg" : "Non-Veg"}
              </span>
            </div>
          </div>
        )}

        {/* Header without image */}
        {!dish.imageUrl && (
          <div className="p-5 border-b border-slate-800 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center justify-center h-4 w-4 rounded border ${
                  dish.isVeg
                    ? "border-emerald-500 text-emerald-400"
                    : "border-rose-500 text-rose-400"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    dish.isVeg ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
              </span>
              <h3 className="text-lg font-bold text-white">{dish.name}</h3>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Scrollable Configuration Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {dish.imageUrl && (
            <div>
              <h2 className="text-xl font-bold text-white">{dish.name}</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {dish.description}
              </p>
            </div>
          )}

          {!dish.imageUrl && (
            <p className="text-xs text-slate-400 leading-relaxed">
              {dish.description}
            </p>
          )}

          {/* Variants (e.g. Size, Crust) */}
          {dish.variants && dish.variants.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Select Size / Portion <span className="text-rose-400">*</span>
                </span>
                <Badge variant="neutral" size="sm">Required</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {dish.variants.map((variant) => {
                  const isSelected = selectedVariant?.name === variant.name;
                  return (
                    <button
                      key={variant.name}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`flex flex-col p-3 rounded-xl text-left border transition-all ${
                        isSelected
                          ? "bg-emerald-500/10 border-emerald-500 text-white shadow-sm"
                          : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <span className="text-sm font-semibold">{variant.name}</span>
                      <span className="text-xs font-bold text-emerald-400 mt-1">
                        {formatCurrency(variant.price, "INR")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modifier Groups */}
          {dish.modifierGroups &&
            dish.modifierGroups.map((group) => (
              <div key={group.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      {group.name}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {group.maxSelections === 1
                        ? "Choose 1 option"
                        : `Choose up to ${group.maxSelections} options`}
                    </p>
                  </div>
                  {group.minSelections > 0 ? (
                    <Badge variant="warning" size="sm">Required</Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">Optional</Badge>
                  )}
                </div>

                <div className="space-y-2">
                  {group.options.map((opt) => {
                    const isChecked = selectedModifiers.some((m) => m.name === opt.name);
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => handleModifierToggle(group, opt)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-colors ${
                          isChecked
                            ? "bg-emerald-500/10 border-emerald-500/60 text-white"
                            : "bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-4 w-4 rounded ${
                              group.maxSelections === 1 ? "rounded-full" : "rounded"
                            } border flex items-center justify-center transition-colors ${
                              isChecked
                                ? "bg-emerald-500 border-emerald-500 text-slate-950"
                                : "border-slate-600 bg-slate-900"
                            }`}
                          >
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span>{opt.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400">
                          +{formatCurrency(opt.price, "INR")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

          {/* Cooking Instructions */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Kitchen Notes / Allergies
            </span>
            <input
              type="text"
              placeholder="e.g. Less spicy, dressing on side, no peanuts..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 pb-safe border-t border-slate-800 bg-slate-950/80 backdrop-blur flex items-center gap-3">
          {/* Quantity Controls */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-white">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-300 hover:text-white"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <Button
            variant="glow"
            className="flex-1 h-11 text-sm font-bold"
            onClick={handleAddToCart}
          >
            <span>Add to Order</span>
            <span className="ml-2 font-mono font-bold">
              • {formatCurrency(grandTotal, "INR")}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
