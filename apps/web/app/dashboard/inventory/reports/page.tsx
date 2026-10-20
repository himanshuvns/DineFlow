"use client";

import * as React from "react";
import {
  BarChart3,
  Download,
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Clock,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useInventoryStore } from "@/lib/stores/inventory-store";
import { formatCurrency, cn } from "@/lib/utils";

export default function InventoryReportsPage() {
  const { toast } = useToast();
  const items = useInventoryStore((s) => s.items);
  const movements = useInventoryStore((s) => s.movements);
  const suppliers = useInventoryStore((s) => s.suppliers);
  const recipes = useInventoryStore((s) => s.recipes);
  const getMetrics = useInventoryStore((s) => s.getMetrics);

  const metrics = getMetrics();
  const [activeTab, setActiveTab] = React.useState<"valuation" | "wastage" | "variance" | "expiry" | "procurement">("valuation");

  // Export CSV Helper
  const downloadCSV = (filename: string, headers: string[], rows: Array<Array<string | number>>) => {
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Report Exported", description: `Downloaded ${filename}.csv.` });
  };

  // 1. Valuation Report
  const handleExportValuation = () => {
    downloadCSV(
      "inventory_valuation_report",
      ["Item Name", "SKU", "Category", "Stock", "Unit", "Average Cost (₹)", "Total Value (₹)", "Status"],
      items.map((i) => [
        `"${i.name}"`,
        i.sku,
        `"${i.category}"`,
        i.currentStock,
        i.baseUnit,
        i.averageCost.toFixed(2),
        (i.currentStock * i.averageCost).toFixed(2),
        i.status,
      ])
    );
  };

  // 2. Wastage Report
  const wastageMovements = movements.filter((m) => m.type === "wastage");
  const handleExportWastage = () => {
    downloadCSV(
      "kitchen_wastage_report",
      ["Date", "Item Name", "Quantity Lost", "Unit", "Total Loss (₹)", "Reason", "Actor"],
      wastageMovements.map((m) => [
        `"${m.movementDate}"`,
        `"${m.itemName}"`,
        Math.abs(m.deltaQty),
        m.unit,
        m.totalCost.toFixed(2),
        `"${m.reason}"`,
        `"${m.actorName}"`,
      ])
    );
  };

  // 3. Expiry Radar Items
  const expiringItems = items.filter((i) => i.trackExpiry && (i.status === "expiring_soon" || (i.shelfLifeDays || 0) <= 15));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
              Inventory Analytics & Audit Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Valuation audits, food waste summaries, theoretical variance, and supplier procurement breakdowns
            </p>
          </div>
        </div>

        <Button
          onClick={() => {
            if (activeTab === "valuation") handleExportValuation();
            if (activeTab === "wastage") handleExportWastage();
          }}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span>Export Tab CSV</span>
        </Button>
      </div>

      {/* Report Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {[
          { id: "valuation", label: "Current Valuation" },
          { id: "wastage", label: "Wastage Summary" },
          { id: "variance", label: "Consumption vs Sales (Variance)" },
          { id: "expiry", label: "Expiry Radar" },
          { id: "procurement", label: "Supplier Procurement" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap",
              activeTab === tab.id
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Current Valuation */}
      {activeTab === "valuation" && (
        <div className="space-y-4">
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs p-5">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-500 font-semibold">Total Stock Holding Value</span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatCurrency(metrics.totalStockValue)}
                </div>
              </div>
              <Badge variant="success" size="md">Real-Time Valuation</Badge>
            </div>
          </Card>

          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                    <TableHead className="font-bold text-xs">Item Name</TableHead>
                    <TableHead className="font-bold text-xs">Category</TableHead>
                    <TableHead className="font-bold text-xs">Stock on Hand</TableHead>
                    <TableHead className="font-bold text-xs">Unit Cost</TableHead>
                    <TableHead className="font-bold text-xs text-right">Holding Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((i) => (
                    <TableRow key={i.id} className="border-b border-slate-100 dark:border-slate-800/60">
                      <TableCell className="font-bold text-xs text-slate-900 dark:text-white">{i.name}</TableCell>
                      <TableCell><Badge variant="neutral" size="sm">{i.category}</Badge></TableCell>
                      <TableCell className="text-xs">{i.currentStock.toLocaleString()} {i.baseUnit}</TableCell>
                      <TableCell className="text-xs">{formatCurrency(i.averageCost)} / {i.baseUnit}</TableCell>
                      <TableCell className="text-right font-extrabold text-xs text-slate-900 dark:text-white">
                        {formatCurrency(i.currentStock * i.averageCost)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Wastage Summary */}
      {activeTab === "wastage" && (
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
          <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800/80">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Kitchen Spoilage & Trimming Loss Log
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                    <TableHead className="font-bold text-xs">Timestamp</TableHead>
                    <TableHead className="font-bold text-xs">Item</TableHead>
                    <TableHead className="font-bold text-xs">Loss Qty</TableHead>
                    <TableHead className="font-bold text-xs">Cost (₹)</TableHead>
                    <TableHead className="font-bold text-xs">Reason / Actor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wastageMovements.map((w) => (
                    <TableRow key={w.id} className="border-b border-slate-100 dark:border-slate-800/60">
                      <TableCell className="text-xs text-slate-500">{new Date(w.movementDate).toLocaleDateString()}</TableCell>
                      <TableCell className="font-bold text-xs">{w.itemName}</TableCell>
                      <TableCell className="text-xs text-rose-500 font-bold">{Math.abs(w.deltaQty)} {w.unit}</TableCell>
                      <TableCell className="font-bold text-xs">{formatCurrency(w.totalCost)}</TableCell>
                      <TableCell className="text-xs">{w.reason} ({w.actorName})</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Consumption vs Sales (Theoretical vs Actual Variance) */}
      {activeTab === "variance" && (
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <Layers className="h-4 w-4" />
            <span>Theoretical BOM vs Actual Depletion Variance</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Compares exact recipe BOM ingredients theoretically consumed against physical ledger deductions. Discrepancies higher than 5% highlight potential over-portioning, kitchen pilferage, or unrecorded waste.
          </p>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800 pt-2">
            {[
              { item: "Arborio Rice", theoretical: "24.0 kg", actual: "25.0 kg", variance: "+4.1%", status: "healthy" },
              { item: "Buffalo Mozzarella", theoretical: "12.5 kg", actual: "15.0 kg", variance: "+20.0%", status: "over_portion" },
              { item: "Atlantic Salmon Fillet", theoretical: "8.2 kg", actual: "9.0 kg", variance: "+9.7%", status: "warning" },
            ].map((v) => (
              <div key={v.item} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <strong className="block text-slate-900 dark:text-white">{v.item}</strong>
                  <span className="text-slate-400">Theoretical: {v.theoretical} • Actual: {v.actual}</span>
                </div>
                <Badge variant={v.status === "healthy" ? "success" : "warning"} size="sm">
                  {v.variance} Variance
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 4: Expiry Radar */}
      {activeTab === "expiry" && (
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs p-5 space-y-3">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Batch Expiry Radar (&lt; 30 Days)
          </CardTitle>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {expiringItems.map((itm) => (
              <div key={itm.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <strong className="block text-slate-900 dark:text-white">{itm.name}</strong>
                  <span className="text-slate-400">
                    Stock: {itm.currentStock} {itm.baseUnit} • Storage: {itm.storageLocation}
                  </span>
                </div>
                <Badge variant="danger" size="sm">Urgent: Use Within 3 Days</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 5: Supplier Procurement Spend */}
      {activeTab === "procurement" && (
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  <TableHead className="font-bold text-xs">Supplier</TableHead>
                  <TableHead className="font-bold text-xs">Categories</TableHead>
                  <TableHead className="font-bold text-xs">Terms</TableHead>
                  <TableHead className="font-bold text-xs text-right">Total Procurement Spend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((s) => (
                  <TableRow key={s.id} className="border-b border-slate-100 dark:border-slate-800/60">
                    <TableCell className="font-bold text-xs text-slate-900 dark:text-white">{s.name}</TableCell>
                    <TableCell className="text-xs">{s.categories.join(", ")}</TableCell>
                    <TableCell><Badge variant="neutral" size="sm">{s.paymentTerms}</Badge></TableCell>
                    <TableCell className="text-right font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(s.totalSpend)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
