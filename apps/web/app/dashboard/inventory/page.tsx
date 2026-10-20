"use client";

import * as React from "react";
import Link from "next/link";
import {
  Boxes,
  Package,
  AlertTriangle,
  XCircle,
  Clock,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Plus,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Layers,
  ArrowLeftRight,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useInventoryStore, InventoryItem } from "@/lib/stores/inventory-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatCurrency, cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";

export default function InventoryDashboardPage() {
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const items = useInventoryStore((s) => s.items);
  const purchaseOrders = useInventoryStore((s) => s.purchaseOrders);
  const movements = useInventoryStore((s) => s.movements);
  const suppliers = useInventoryStore((s) => s.suppliers);
  const getMetrics = useInventoryStore((s) => s.getMetrics);
  const createPurchaseOrder = useInventoryStore((s) => s.createPurchaseOrder);
  const filters = useInventoryStore((s) => s.filters);
  const setFilter = useInventoryStore((s) => s.setFilter);

  const metrics = getMetrics();
  const [mobileStatsOpen, setMobileStatsOpen] = React.useState(false);
  const [reorderItem, setReorderItem] = React.useState<InventoryItem | null>(null);
  const [reorderQty, setReorderQty] = React.useState<number>(1);
  const [isSubmittingPO, setIsSubmittingPO] = React.useState(false);

  // Categories distribution
  const categoryStats = React.useMemo(() => {
    const map = new Map<string, { count: number; value: number }>();
    items.forEach((item) => {
      const cur = map.get(item.category) || { count: 0, value: 0 };
      map.set(item.category, {
        count: cur.count + 1,
        value: cur.value + item.currentStock * item.averageCost,
      });
    });
    return Array.from(map.entries()).map(([cat, data]) => ({
      category: cat,
      ...data,
      pct: metrics.totalStockValue > 0 ? (data.value / metrics.totalStockValue) * 100 : 0,
    }));
  }, [items, metrics.totalStockValue]);

  // Low Stock Items for radar
  const lowStockItems = React.useMemo(() => {
    return items.filter((i) => i.currentStock <= i.reorderPoint);
  }, [items]);

  // Recent movements
  const recentMovements = movements.slice(0, 6);

  // Top consumed ingredients
  const topConsumed = React.useMemo(() => {
    const consumptionMap = new Map<string, { name: string; qty: number; unit: string; cost: number }>();
    movements
      .filter((m) => m.type === "consumption")
      .forEach((m) => {
        const cur = consumptionMap.get(m.itemId) || { name: m.itemName, qty: 0, unit: m.unit, cost: 0 };
        consumptionMap.set(m.itemId, {
          name: m.itemName,
          qty: cur.qty + Math.abs(m.deltaQty),
          unit: m.unit,
          cost: cur.cost + m.totalCost,
        });
      });
    return Array.from(consumptionMap.values())
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);
  }, [movements]);

  // 1-Click quick reorder handler
  const handleQuickReorder = (item: InventoryItem) => {
    setReorderItem(item);
    setReorderQty(Math.ceil((item.maxStock - item.currentStock) / item.conversionFactor) || 1);
  };

  const handleConfirmReorder = async () => {
    if (!reorderItem) return;
    setIsSubmittingPO(true);

    try {
      const supplier = suppliers.find((s) => s.id === reorderItem.preferredSupplierId) || suppliers[0];
      const lineCost = reorderQty * reorderItem.purchaseCost;
      const taxCost = (lineCost * 5) / 100;

      await createPurchaseOrder({
        supplierId: supplier?.id || "sup-1",
        supplierName: supplier?.name || "Preferred Vendor",
        orderDate: new Date().toISOString(),
        expectedDeliveryDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        items: [
          {
            itemId: reorderItem.id,
            itemName: reorderItem.name,
            sku: reorderItem.sku,
            purchaseUnit: reorderItem.purchaseUnit,
            quantity: reorderQty,
            unitPrice: reorderItem.purchaseCost,
            taxPercent: 5,
            total: lineCost + taxCost,
          },
        ],
        subtotal: lineCost,
        taxTotal: taxCost,
        shippingCost: 0,
        grandTotal: lineCost + taxCost,
        deliveryLocation: reorderItem.storageLocation || "Central Store",
        notes: `Automated replenishment PO for ${reorderItem.name}`,
      });

      toast({
        title: "Purchase Order Created",
        description: `Draft PO generated for ${reorderQty}x ${reorderItem.purchaseUnit} of ${reorderItem.name}.`,
      });
      setReorderItem(null);
    } catch {
      toast({
        title: "Reorder Failed",
        description: "Could not create automated purchase order.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingPO(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
                Inventory & Stock Central
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Live ERP stock valuation, consumption ledger & replenishment radar
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/dashboard/inventory/items">
            <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
              <Plus className="h-4 w-4" />
              <span>New Item</span>
            </Button>
          </Link>
          <Link href="/dashboard/inventory/purchase-orders">
            <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Create PO</span>
            </Button>
          </Link>
          <Link href="/dashboard/inventory/receiving">
            <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
              <ClipboardCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Receive GRN</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilter("category", e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Dairy">Dairy</option>
            <option value="Produce">Produce</option>
            <option value="Meat & Poultry">Meat & Poultry</option>
            <option value="Dry Pantry">Dry Pantry</option>
            <option value="Bakery">Bakery</option>
            <option value="Beverages">Beverages</option>
            <option value="Packaging">Packaging</option>
          </select>

          {/* Stock Level Filter */}
          <select
            value={filters.stockStatus}
            onChange={(e) => setFilter("stockStatus", e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="all">All Stock Levels</option>
            <option value="low_stock">Low Stock Alerts</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="expiring_soon">Expiring Soon</option>
            <option value="in_stock">Healthy Stock</option>
          </select>

          {/* Department / Outlet */}
          <select
            value={filters.outlet}
            onChange={(e) => setFilter("outlet", e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="all">All Departments / Outlets</option>
            <option value="main_kitchen">Central Commissary</option>
            <option value="bar">Central Bar</option>
            <option value="pastry">Pastry Bakery</option>
            <option value="banquet">Banquet Storage</option>
          </select>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="font-medium">Period:</span>
          <div className="inline-flex rounded-xl p-0.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            {(["this_month", "last_30_days", "7d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilter("dateRange", r)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer capitalize",
                  filters.dateRange === r
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                {r.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Pill Bar */}
      <div className="sm:hidden">
        <button
          onClick={() => setMobileStatsOpen(!mobileStatsOpen)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          <span>
            {metrics.totalItems} Items • Value: {formatCurrency(metrics.totalStockValue)} • {metrics.lowStockCount} Low
          </span>
          {mobileStatsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4", !mobileStatsOpen && "hidden sm:grid")}>
        {/* Total Valuation */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Stock Value</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {formatCurrency(metrics.totalStockValue)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Across {metrics.totalItems} registered active inventory SKUs
            </p>
          </CardContent>
        </Card>

        {/* Low Stock Warning */}
        <Card className="rounded-2xl border-amber-500/30 dark:border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-800 dark:text-amber-400">Low Stock Alert</span>
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4 animate-pulse" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-amber-900 dark:text-amber-300">
                {metrics.lowStockCount}
              </span>
              <Badge variant="warning" size="sm">Action Req</Badge>
            </div>
            <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
              Items under minimum threshold point
            </p>
          </CardContent>
        </Card>

        {/* Out of Stock Alert */}
        <Card className="rounded-2xl border-rose-500/30 dark:border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-rose-700 dark:text-rose-400">Out of Stock</span>
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
                <XCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-rose-800 dark:text-rose-300">
                {metrics.outOfStockCount}
              </span>
              <Badge variant="danger" size="sm">0 Stock</Badge>
            </div>
            <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
              Kitchen dishes cannot be prepared
            </p>
          </CardContent>
        </Card>

        {/* Monthly Consumption */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Monthly Consumption</span>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <TrendingDown className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {formatCurrency(metrics.monthlyConsumedValue)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Received: {formatCurrency(metrics.monthlyReceivedValue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Low Stock Alert Radar & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Radar with 1-Click Reorder (2 Columns on large) */}
        <Card className="lg:col-span-2 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Low Stock Alert Radar
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Ingredients at risk of stockout. 1-click creates supplier replenishment purchase order.
              </CardDescription>
            </div>
            <Badge variant="warning" size="sm">{lowStockItems.length} Critical</Badge>
          </CardHeader>
          <CardContent className="p-0">
            {lowStockItems.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                All inventory levels are currently above reorder thresholds.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {lowStockItems.map((item) => {
                  const healthPct = Math.min(100, Math.round((item.currentStock / item.maxStock) * 100));
                  return (
                    <div
                      key={item.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                            {item.sku}
                          </span>
                          {item.currentStock <= 0 ? (
                            <Badge variant="danger" size="sm">Empty</Badge>
                          ) : (
                            <Badge variant="warning" size="sm">Low</Badge>
                          )}
                        </div>

                        <div className="mt-1.5 flex items-center gap-4 text-xs text-slate-500">
                          <span>
                            Current:{" "}
                            <strong className="text-slate-800 dark:text-slate-200">
                              {item.currentStock} {item.baseUnit}
                            </strong>
                          </span>
                          <span>
                            Min / Reorder: {item.minStock} / {item.reorderPoint} {item.baseUnit}
                          </span>
                          <span>Loc: {item.storageLocation}</span>
                        </div>

                        {/* Health Bar */}
                        <div className="mt-2 w-full max-w-md h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              healthPct <= 15 ? "bg-rose-500" : "bg-amber-500"
                            )}
                            style={{ width: `${Math.max(4, healthPct)}%` }}
                          />
                        </div>
                      </div>

                      {/* 1-Click Reorder Action */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleQuickReorder(item)}
                          className="bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs px-3 py-1.5 rounded-xl cursor-pointer shadow-xs"
                        >
                          1-Click Reorder
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800/80">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-500" />
              Category Valuation
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Holding capital distributed by category
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {categoryStats.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {cat.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{cat.count} items</span>
                    <strong className="text-slate-900 dark:text-white">
                      {formatCurrency(cat.value)}
                    </strong>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    style={{ width: `${Math.max(3, cat.pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Grid: Recent Movement Feed & Top Consumed Ingredients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Ledger Movements Feed */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4 text-cyan-500" />
                Live Stock Movement Feed
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Recent receipts, POS dish decrements & audit adjustments
              </CardDescription>
            </div>
            <Link href="/dashboard/inventory/movements">
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-emerald-600 dark:text-emerald-400 cursor-pointer">
                <span>View Full Ledger</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
            {recentMovements.map((m) => {
              const isPositive = m.deltaQty > 0;
              return (
                <div key={m.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "p-2 rounded-xl text-xs font-bold shrink-0",
                        m.type === "receipt"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : m.type === "wastage"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          : m.type === "transfer"
                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                      )}
                    >
                      {m.type.toUpperCase().slice(0, 4)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {m.itemName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {m.reason} • Ref: {m.referenceNumber}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={cn(
                        "text-xs font-extrabold",
                        isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      )}
                    >
                      {isPositive ? `+${m.deltaQty}` : `${m.deltaQty}`} {m.unit}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {formatCurrency(m.totalCost)}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Top Consumed Ingredients */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800/80">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Top Consumed Ingredients
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Highest cost drivers depleted via kitchen orders
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
            {topConsumed.map((ing, idx) => (
              <div key={ing.name} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {ing.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Total used: {ing.qty} {ing.unit}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(ing.cost)}
                  </span>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    High Volume
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 1-Click Reorder Quick Modal */}
      <Modal
        isOpen={Boolean(reorderItem)}
        onClose={() => setReorderItem(null)}
        title="Quick Replenishment Reorder"
        description={reorderItem ? `Generate emergency PO for ${reorderItem.name}` : ""}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setReorderItem(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmReorder}
              disabled={isSubmittingPO}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmittingPO ? "Creating PO…" : "Issue Purchase Order"}
            </Button>
          </div>
        }
      >
        {reorderItem && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Item:</span>
                <span className="font-bold text-slate-900 dark:text-white">{reorderItem.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Stock:</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {reorderItem.currentStock} {reorderItem.baseUnit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unit Price:</span>
                <span>{formatCurrency(reorderItem.purchaseCost)} / {reorderItem.purchaseUnit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vendor:</span>
                <span>{reorderItem.preferredSupplierName || "Apex Agro Fresh"}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Quantity to Order ({reorderItem.purchaseUnit})
              </label>
              <Input
                type="number"
                min="1"
                value={reorderQty}
                onChange={(e) => setReorderQty(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex justify-between items-center font-bold">
              <span>Estimated Total PO Cost:</span>
              <span className="text-sm">
                {formatCurrency(reorderQty * reorderItem.purchaseCost * 1.05)} (incl. 5% GST)
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
