"use client";

import * as React from "react";
import {
  Calculator,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Search,
  Filter,
  DollarSign,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useInventoryStore, StockCount, StockCountItem } from "@/lib/stores/inventory-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatCurrency, cn } from "@/lib/utils";

export default function StockCountsPage() {
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const stockCounts = useInventoryStore((s) => s.stockCounts);
  const items = useInventoryStore((s) => s.items);
  const createStockCount = useInventoryStore((s) => s.createStockCount);
  const updateStockCount = useInventoryStore((s) => s.updateStockCount);
  const approveStockCount = useInventoryStore((s) => s.approveStockCount);

  const [activeCount, setActiveCount] = React.useState<StockCount | null>(stockCounts[0] || null);
  const [newCountModalOpen, setNewCountModalOpen] = React.useState(false);

  // New count session form
  const [sessionCategory, setSessionCategory] = React.useState("Dairy");
  const [sessionLocation, setSessionLocation] = React.useState("Walk-in Cooler Shelf 1");
  const [sessionTitle, setSessionTitle] = React.useState("Bi-Weekly Dairy Audit");

  const handleStartSession = async () => {
    const targetItems = items.filter((i) => i.category === sessionCategory);

    const countItems: StockCountItem[] = targetItems.map((itm) => ({
      itemId: itm.id,
      itemName: itm.name,
      sku: itm.sku,
      unit: itm.baseUnit,
      systemQty: itm.currentStock,
      countedQty: itm.currentStock,
      varianceQty: 0,
      unitCost: itm.averageCost,
      varianceValue: 0,
      notes: "",
    }));

    const newSession = await createStockCount({
      title: sessionTitle,
      category: sessionCategory,
      storageLocation: sessionLocation,
      countDate: new Date().toISOString(),
      countedBy: user?.name || "Kitchen Auditor",
      items: countItems,
      totalVarianceValue: 0,
      notes: "Routine spot audit session",
    });

    setActiveCount(newSession);
    setNewCountModalOpen(false);
    toast({
      title: "Count Session Started",
      description: `${newSession.countNumber} initialized with ${countItems.length} items.`,
    });
  };

  const handleUpdateItemCount = (itemId: string, counted: number, notes?: string) => {
    if (!activeCount) return;

    const updatedItems = activeCount.items.map((ci) => {
      if (ci.itemId !== itemId) return ci;
      const varianceQty = counted - ci.systemQty;
      const varianceValue = varianceQty * ci.unitCost;
      return {
        ...ci,
        countedQty: counted,
        varianceQty,
        varianceValue,
        notes: notes !== undefined ? notes : ci.notes,
      };
    });

    const totalVarianceValue = updatedItems.reduce((sum, ci) => sum + ci.varianceValue, 0);

    const updatedCount: StockCount = {
      ...activeCount,
      items: updatedItems,
      totalVarianceValue,
    };

    setActiveCount(updatedCount);
    updateStockCount(activeCount.id, {
      items: updatedItems,
      totalVarianceValue,
    });
  };

  const handleApproveReconciliation = async () => {
    if (!activeCount) return;
    await approveStockCount(activeCount.id, user?.name || "Operations Manager");
    toast({
      title: "Stock Reconciled & Approved",
      description: `Physical count posted. Ledger adjustments generated for ${activeCount.countNumber}.`,
    });
    setActiveCount({ ...activeCount, status: "approved" });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
              Physical Stock Counts & Variance Reconciliation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Audit actual pantry stock against system numbers and post discrepancy adjustments
            </p>
          </div>
        </div>

        <Button
          onClick={() => setNewCountModalOpen(true)}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Start Count Session</span>
        </Button>
      </div>

      {/* Main Audit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Session Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs p-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Audit Sessions</h3>
            <div className="space-y-2">
              {stockCounts.map((sc) => {
                const isSelected = activeCount?.id === sc.id;
                return (
                  <div
                    key={sc.id}
                    onClick={() => setActiveCount(sc)}
                    className={cn(
                      "p-3 rounded-xl border transition-all cursor-pointer",
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-white shadow-2xs"
                        : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-bold">{sc.countNumber}</span>
                      <Badge variant={sc.status === "approved" ? "success" : "warning"} size="sm">
                        {sc.status === "approved" ? "Approved" : "In Progress"}
                      </Badge>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white mt-1">
                      {sc.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                      <span>{sc.category}</span>
                      <span>Variance: {formatCurrency(sc.totalVarianceValue)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Count Sheet & Reconcile (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeCount ? (
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
              <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                      {activeCount.title}
                    </CardTitle>
                    <span className="font-mono text-xs text-slate-400">({activeCount.countNumber})</span>
                  </div>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    Location: {activeCount.storageLocation} • Auditor: {activeCount.countedBy}
                  </CardDescription>
                </div>

                {activeCount.status !== "approved" && (
                  <Button
                    size="sm"
                    onClick={handleApproveReconciliation}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
                  >
                    <FileCheck className="h-4 w-4" />
                    <span>Approve & Reconcile</span>
                  </Button>
                )}
              </CardHeader>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                      <TableHead className="font-bold text-xs">Item</TableHead>
                      <TableHead className="font-bold text-xs text-right">System Qty</TableHead>
                      <TableHead className="font-bold text-xs text-right">Physical Count</TableHead>
                      <TableHead className="font-bold text-xs text-right">Variance Qty</TableHead>
                      <TableHead className="font-bold text-xs text-right">Variance Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeCount.items.map((ci) => {
                      return (
                        <TableRow key={ci.itemId} className="border-b border-slate-100 dark:border-slate-800/60">
                          <TableCell className="py-2.5">
                            <div className="font-bold text-xs text-slate-900 dark:text-white">{ci.itemName}</div>
                            <div className="font-mono text-[10px] text-slate-400">{ci.sku}</div>
                          </TableCell>

                          <TableCell className="text-right text-xs text-slate-500">
                            {ci.systemQty} {ci.unit}
                          </TableCell>

                          <TableCell className="text-right">
                            {activeCount.status === "approved" ? (
                              <span className="font-bold text-xs">{ci.countedQty} {ci.unit}</span>
                            ) : (
                              <input
                                type="number"
                                value={ci.countedQty}
                                onChange={(e) =>
                                  handleUpdateItemCount(ci.itemId, parseFloat(e.target.value) || 0)
                                }
                                className="w-24 px-2 py-1 text-right rounded-lg text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                              />
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            <span
                              className={cn(
                                "text-xs font-bold",
                                ci.varianceQty < 0
                                  ? "text-rose-500"
                                  : ci.varianceQty > 0
                                  ? "text-emerald-500"
                                  : "text-slate-400"
                              )}
                            >
                              {ci.varianceQty > 0 ? `+${ci.varianceQty}` : ci.varianceQty} {ci.unit}
                            </span>
                          </TableCell>

                          <TableCell className="text-right">
                            <span
                              className={cn(
                                "text-xs font-extrabold",
                                ci.varianceValue < 0
                                  ? "text-rose-600 dark:text-rose-400"
                                  : ci.varianceValue > 0
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-slate-400"
                              )}
                            >
                              {formatCurrency(ci.varianceValue)}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Total Discrepancy Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Net Audit Discrepancy:</span>
                <span
                  className={cn(
                    "text-sm font-extrabold",
                    activeCount.totalVarianceValue < 0 ? "text-rose-500" : "text-emerald-500"
                  )}
                >
                  {formatCurrency(activeCount.totalVarianceValue)}
                </span>
              </div>
            </Card>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">No active count selected.</div>
          )}
        </div>
      </div>

      {/* Start Session Modal */}
      <Modal
        isOpen={newCountModalOpen}
        onClose={() => setNewCountModalOpen(false)}
        title="Initialize Physical Stock Count"
        description="Choose storage location or category scope for the count sheet"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setNewCountModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleStartSession} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Generate Count Sheet
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Input
            label="Session Title"
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
          />

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category Scope</label>
            <select
              value={sessionCategory}
              onChange={(e) => setSessionCategory(e.target.value)}
              className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
            >
              <option value="Dairy">Dairy</option>
              <option value="Produce">Produce</option>
              <option value="Meat & Poultry">Meat & Poultry</option>
              <option value="Dry Pantry">Dry Pantry</option>
              <option value="Bakery">Bakery</option>
              <option value="Beverages">Beverages</option>
            </select>
          </div>

          <Input
            label="Storage Location / Shelf"
            value={sessionLocation}
            onChange={(e) => setSessionLocation(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
