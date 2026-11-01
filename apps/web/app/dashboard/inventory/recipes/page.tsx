"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChefHat,
  Plus,
  Trash2,
  Save,
  Search,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Percent,
  Layers,
  UtensilsCrossed,
  Info,
  RotateCcw,
  FileSpreadsheet,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useInventoryStore, Recipe, RecipeIngredient } from "@/lib/stores/inventory-store";
import { useTenantDataStore } from "@/lib/stores/tenant-data-store";
import { formatCurrency, cn } from "@/lib/utils";

export default function RecipeCostingPage() {
  const { toast } = useToast();
  const recipes = useInventoryStore((s) => s.recipes);
  const items = useInventoryStore((s) => s.items);
  const saveRecipe = useInventoryStore((s) => s.saveRecipe);
  const loadDemoInventory = useInventoryStore((s) => s.loadDemoInventory);
  const menuItems = useTenantDataStore((s) => s.menuItems);

  // Combine stored recipes with tenant menu items that don't have a BOM yet
  const combinedRecipes: Recipe[] = React.useMemo(() => {
    const list: Recipe[] = [...recipes];

    if (Array.isArray(menuItems)) {
      menuItems.forEach((mi) => {
        const alreadyHasRecipe = list.some(
          (r) => r.menuItemId === mi.id || r.menuItemName.toLowerCase().trim() === mi.name.toLowerCase().trim()
        );
        if (!alreadyHasRecipe) {
          list.push({
            id: `rcp-temp-${mi.id}`,
            menuItemId: mi.id,
            menuItemName: mi.name,
            category: mi.category || "Main Course",
            portionSize: 1,
            yieldPercent: 100,
            ingredients: [],
            totalCostPerServing: 0,
            sellingPrice: mi.price || 0,
            foodCostPercent: 0,
            grossMarginPercent: 100,
            status: "missing_bom",
            lastUpdated: new Date().toISOString(),
          });
        }
      });
    }

    return list;
  }, [recipes, menuItems]);

  const [selectedRecipe, setSelectedRecipe] = React.useState<Recipe | null>(combinedRecipes[0] || null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");

  // Editable local recipe state
  const [sellingPrice, setSellingPrice] = React.useState<number>(selectedRecipe?.sellingPrice || 0);
  const [portionSize, setPortionSize] = React.useState<number>(selectedRecipe?.portionSize || 1);
  const [ingredients, setIngredients] = React.useState<RecipeIngredient[]>(selectedRecipe?.ingredients || []);

  // Sync selected recipe when combined list changes
  React.useEffect(() => {
    if (!selectedRecipe && combinedRecipes.length > 0) {
      setSelectedRecipe(combinedRecipes[0]);
    } else if (selectedRecipe) {
      const existing = combinedRecipes.find(
        (r) => r.id === selectedRecipe.id || (r.menuItemId && r.menuItemId === selectedRecipe.menuItemId)
      );
      if (existing) {
        setSelectedRecipe(existing);
      } else {
        setSelectedRecipe(combinedRecipes[0] || null);
      }
    }
  }, [combinedRecipes]);

  // Sync inputs when selected recipe changes
  React.useEffect(() => {
    if (selectedRecipe) {
      setSellingPrice(selectedRecipe.sellingPrice);
      setPortionSize(selectedRecipe.portionSize);
      setIngredients(selectedRecipe.ingredients || []);
    } else {
      setSellingPrice(0);
      setPortionSize(1);
      setIngredients([]);
    }
  }, [selectedRecipe?.id, selectedRecipe?.menuItemId]);

  // Live Ingredient Calculations
  const calculatedCostPerServing = React.useMemo(() => {
    const totalIngredientsCost = ingredients.reduce((sum, ing) => {
      const lossMultiplier = ing.yieldLossPercent > 0 ? 1 / (1 - ing.yieldLossPercent / 100) : 1;
      return sum + ing.quantity * ing.unitCost * lossMultiplier;
    }, 0);
    return portionSize > 0 ? totalIngredientsCost / portionSize : totalIngredientsCost;
  }, [ingredients, portionSize]);

  const grossProfitMargin = Math.max(0, sellingPrice - calculatedCostPerServing);
  const foodCostPercent = sellingPrice > 0 ? (calculatedCostPerServing / sellingPrice) * 100 : 0;
  const grossMarginPercent = sellingPrice > 0 ? (grossProfitMargin / sellingPrice) * 100 : 0;

  // Add ingredient line
  const handleAddIngredient = () => {
    if (items.length === 0) {
      toast({
        title: "No Raw Ingredients in Catalog",
        description: "Please add raw materials (milk, flour, oil, etc.) in the Items Catalog first.",
        variant: "destructive",
      });
      return;
    }

    const firstItem = items[0];
    const newIng: RecipeIngredient = {
      itemId: firstItem.id,
      itemName: firstItem.name,
      quantity: 100,
      unit: firstItem.baseUnit,
      unitCost: firstItem.averageCost,
      yieldLossPercent: 2,
      totalCost: 100 * firstItem.averageCost * 1.02,
    };
    setIngredients([...ingredients, newIng]);
  };

  // Update ingredient line
  const handleUpdateIngredient = (index: number, updates: Partial<RecipeIngredient>) => {
    setIngredients(
      ingredients.map((ing, i) => {
        if (i !== index) return ing;
        const updated = { ...ing, ...updates };

        // If item changed, auto-populate unit and cost
        if (updates.itemId) {
          const matched = items.find((itm) => itm.id === updates.itemId);
          if (matched) {
            updated.itemName = matched.name;
            updated.unit = matched.baseUnit;
            updated.unitCost = matched.averageCost;
          }
        }

        const lossFactor = updated.yieldLossPercent > 0 ? 1 / (1 - updated.yieldLossPercent / 100) : 1;
        updated.totalCost = updated.quantity * updated.unitCost * lossFactor;
        return updated;
      })
    );
  };

  // Remove ingredient line
  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // Save BOM
  const handleSaveBOM = async () => {
    if (!selectedRecipe) return;

    const recipeToSave: Recipe = {
      ...selectedRecipe,
      id: selectedRecipe.id.startsWith("rcp-temp-")
        ? `rcp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
        : selectedRecipe.id,
      ingredients,
      portionSize,
      sellingPrice,
      totalCostPerServing: calculatedCostPerServing,
      foodCostPercent,
      grossMarginPercent,
      status: ingredients.length > 0 ? "configured" : "missing_bom",
      lastUpdated: new Date().toISOString(),
    };

    await saveRecipe(recipeToSave);
    setSelectedRecipe(recipeToSave);

    toast({
      title: "Recipe Saved",
      description: `BOM costing for ${selectedRecipe.menuItemName} has been stored.`,
    });
  };

  // Food cost status badge style
  const getFoodCostBadge = (pct: number) => {
    if (pct === 0) return <Badge variant="neutral" size="sm">No BOM</Badge>;
    if (pct < 28) return <Badge variant="success" size="sm">High Margin ({pct.toFixed(1)}%)</Badge>;
    if (pct <= 35) return <Badge variant="warning" size="sm">Benchmark ({pct.toFixed(1)}%)</Badge>;
    return <Badge variant="danger" size="sm">High Cost Alert ({pct.toFixed(1)}%)</Badge>;
  };

  // Unique categories for filtering
  const availableCategories = React.useMemo(() => {
    const set = new Set<string>();
    combinedRecipes.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return ["all", ...Array.from(set)];
  }, [combinedRecipes]);

  // Filtered menu recipes
  const filteredRecipes = combinedRecipes.filter((r) => {
    if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
    if (searchTerm && !r.menuItemName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
            <ChefHat className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
              Food Recipe Engineering & BOM Costing
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Live portion yields, ingredient depletion formulas, and kitchen gross profit calculator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleSaveBOM}
            disabled={!selectedRecipe}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs self-start sm:self-auto disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>Save Recipe BOM</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area: Clean Slate Banner vs 2-Column Builder */}
      {combinedRecipes.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-2 border-slate-300 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 p-8 sm:p-12 text-center space-y-6 shadow-xs">
          <div className="max-w-xl mx-auto space-y-3">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 flex items-center justify-center shadow-xs">
              <ChefHat className="h-8 w-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              No Recipe Formulas (BOM) Configured Yet
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              As a newly registered property, your kitchen recipe formulas start completely clean.
              Recipe formulas (Bill of Materials) connect your restaurant menu dishes with raw kitchen stock so ingredients (dairy, cooking oils, rice, packaging) are automatically deducted when orders are placed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-2 text-left">
            <Link
              href="/dashboard/menu"
              className="p-5 rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-teal-500/5 hover:border-emerald-500 transition-all cursor-pointer space-y-2 group shadow-2xs hover:shadow-md block"
            >
              <div className="p-2.5 rounded-xl bg-emerald-500 text-white w-fit group-hover:scale-105 transition-transform shadow-xs">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Add Menu Dishes
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Create or scan your restaurant menu items so they appear here ready for ingredient recipe formulas.
              </p>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-1 group-hover:translate-x-0.5 transition-transform">
                Go to Menu Management &rarr;
              </span>
            </Link>

            <Link
              href="/dashboard/inventory/items"
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer space-y-2 group shadow-2xs hover:shadow-md block"
            >
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 w-fit group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Add Raw Ingredients
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Upload pantry goods, drinking water, oils, and packaging from Excel or enter them manually.
              </p>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 pt-1 group-hover:translate-x-0.5 transition-transform">
                Open Items Catalog &rarr;
              </span>
            </Link>

            <div
              onClick={() => {
                loadDemoInventory();
                toast({
                  title: "Sample Recipes Loaded",
                  description: "Loaded 6 sample hotel recipes for staff training and sandbox testing.",
                });
              }}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer space-y-2 group shadow-2xs hover:shadow-md"
            >
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 w-fit group-hover:scale-105 transition-transform">
                <RotateCcw className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Load Sample Hotel Recipes
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Populate 6 sample dishes (Risotto, Salmon, Truffle Pasta) to explore portion yields and margin calculations.
              </p>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 pt-1 group-hover:translate-x-0.5 transition-transform">
                Load Sample Demo BOM &rarr;
              </span>
            </div>
          </div>
        </Card>
      ) : (
        /* Two Column Layout: Recipe Directory (Left) + Interactive BOM Builder (Right) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Menu Item Directory (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
              <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800/80 space-y-3">
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                  Menu Directory ({filteredRecipes.length})
                </CardTitle>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter dishes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>

                {/* Category Pills */}
                {availableCategories.length > 1 && (
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                    {availableCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap capitalize",
                          categoryFilter === cat
                            ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950"
                            : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </CardHeader>

              <CardContent className="p-2 space-y-1 max-h-[600px] overflow-y-auto">
                {filteredRecipes.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No matching dishes found.
                  </div>
                ) : (
                  filteredRecipes.map((rcp) => {
                    const isSelected = selectedRecipe?.id === rcp.id || (selectedRecipe?.menuItemId && selectedRecipe.menuItemId === rcp.menuItemId);
                    return (
                      <div
                        key={rcp.id}
                        onClick={() => setSelectedRecipe(rcp)}
                        className={cn(
                          "p-3 rounded-xl transition-all cursor-pointer border",
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-white shadow-2xs"
                            : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                        )}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold text-xs truncate">{rcp.menuItemName}</span>
                          {rcp.status === "configured" ? (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                              {rcp.foodCostPercent.toFixed(0)}% Cost
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-500 shrink-0">No BOM</span>
                          )}
                        </div>

                        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                          <span>{rcp.category}</span>
                          <strong className="text-slate-900 dark:text-white">{formatCurrency(rcp.sellingPrice)}</strong>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Recipe Builder & Cost Matrix (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {selectedRecipe ? (
              <>
                {/* Dish Overview Card */}
                <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                          {selectedRecipe.menuItemName}
                        </h2>
                        <Badge variant="neutral" size="sm">{selectedRecipe.category}</Badge>
                        {selectedRecipe.status === "missing_bom" && (
                          <Badge variant="warning" size="sm">BOM Pending</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Bill of Materials (BOM) specifies the raw materials automatically decremented per dish served.
                      </p>
                    </div>

                    {/* Selling Price & Servings */}
                    <div className="flex items-center gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-500">Dish Selling Price (₹)</label>
                        <Input
                          type="number"
                          value={sellingPrice}
                          onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                          className="w-28 text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-500">Portions / Batch</label>
                        <Input
                          type="number"
                          value={portionSize}
                          onChange={(e) => setPortionSize(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-20 text-sm font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live Cost & Margin Calculator Ribbon */}
                  <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Cost / Serving</span>
                      <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {formatCurrency(calculatedCostPerServing)}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Gross Margin (₹)</span>
                      <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {formatCurrency(grossProfitMargin)}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Gross Margin (%)</span>
                      <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {grossMarginPercent.toFixed(1)}%
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Food Cost %</span>
                      <div className="mt-0.5">
                        {getFoodCostBadge(foodCostPercent)}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Interactive Ingredients Adder */}
                <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
                  <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                        Recipe Ingredients ({ingredients.length})
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Ingredient quantities in base units with culinary yield trim loss %
                      </CardDescription>
                    </div>

                    <Button
                      size="sm"
                      onClick={handleAddIngredient}
                      className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Ingredient</span>
                    </Button>
                  </CardHeader>

                  <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
                    {items.length === 0 && (
                      <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center justify-between">
                        <span>No raw ingredients found in stock catalog. Add pantry goods, drinking water, or oils first.</span>
                        <Link href="/dashboard/inventory/items" className="font-bold underline ml-2 shrink-0">
                          Add Items &rarr;
                        </Link>
                      </div>
                    )}

                    {ingredients.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        No ingredients configured. Click &quot;Add Ingredient&quot; to start composing the recipe BOM.
                      </div>
                    ) : (
                      ingredients.map((ing, idx) => (
                        <div key={idx} className="p-4 grid grid-cols-12 gap-3 items-center">
                          {/* Item Selector */}
                          <div className="col-span-12 sm:col-span-5">
                            <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                              Ingredient
                            </label>
                            <select
                              value={ing.itemId}
                              onChange={(e) => handleUpdateIngredient(idx, { itemId: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
                            >
                              {items.length === 0 ? (
                                <option value="">No items available</option>
                              ) : (
                                items.map((itm) => (
                                  <option key={itm.id} value={itm.id}>
                                    {itm.name} ({formatCurrency(itm.averageCost)}/{itm.baseUnit})
                                  </option>
                                ))
                              )}
                            </select>
                          </div>

                          {/* Quantity */}
                          <div className="col-span-4 sm:col-span-2">
                            <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                              Qty ({ing.unit})
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={ing.quantity}
                              onChange={(e) =>
                                handleUpdateIngredient(idx, { quantity: parseFloat(e.target.value) || 0 })
                              }
                              className="w-full px-2.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold"
                            />
                          </div>

                          {/* Trim Loss % */}
                          <div className="col-span-4 sm:col-span-2">
                            <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                              Trim Loss %
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="90"
                              value={ing.yieldLossPercent}
                              onChange={(e) =>
                                handleUpdateIngredient(idx, { yieldLossPercent: parseFloat(e.target.value) || 0 })
                              }
                              className="w-full px-2.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                            />
                          </div>

                          {/* Line Cost */}
                          <div className="col-span-3 sm:col-span-2 text-right">
                            <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                              Line Cost
                            </label>
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                              {formatCurrency(ing.totalCost)}
                            </span>
                          </div>

                          {/* Remove Action */}
                          <div className="col-span-1 sm:col-span-1 text-right">
                            <button
                              onClick={() => handleRemoveIngredient(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                              title="Remove ingredient"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs p-12 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <ChefHat className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  No Dish Selected
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Select a dish from the menu directory on the left to configure or edit its recipe ingredients and portion costing.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
