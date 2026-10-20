"use client";

import * as React from "react";
import {
  ArrowLeftRight,
  Search,
  Filter,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useInventoryStore, StockMovement, StockMovementType } from "@/lib/stores/inventory-store";
import { formatCurrency, cn } from "@/lib/utils";

export default function StockMovementsPage() {
  const { toast } = useToast();
  const movements = useInventoryStore((s) => s.movements);

  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleExportLedgerCSV = () => {
    const headers = [
      "Timestamp",
      "Item Name",
      "SKU",
      "Movement Type",
      "Quantity Delta",
      "Unit",
      "Previous Balance",
      "New Balance",
      "Unit Cost (₹)",
      "Total Cost (₹)",
      "Reference",
      "Location",
      "Actor",
      "Reason",
    ];

    const rows = filteredMovements.map((m) => [
      `"${m.movementDate}"`,
      `"${m.itemName}"`,
      m.sku,
      m.type,
      m.deltaQty,
      m.unit,
      m.previousBalance,
      m.newBalance,
      m.unitCost.toFixed(2),
      m.totalCost.toFixed(2),
      m.referenceNumber,
      `"${m.storageLocation}"`,
      `"${m.actorName}"`,
      `"${m.reason}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dineflow_stock_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Ledger Exported", description: "Audit trail downloaded to CSV." });
  };

  const filteredMovements = movements.filter((m) => {
    if (typeFilter !== "all" && m.type !== typeFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        m.itemName.toLowerCase().includes(q) ||
        m.sku.toLowerCase().includes(q) ||
        m.referenceNumber.toLowerCase().includes(q) ||
        m.actorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <ArrowLeftRight className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
              Stock Movement Ledger
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Immutable double-entry transaction history of every gram consumed, received or written off
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportLedgerCSV}
          className="gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span>Export Ledger CSV</span>
        </Button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by dish, SKU, ref # or actor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none"
          />
        </div>

        {/* Movement Type Filter */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: "all", label: "All Types" },
            { id: "consumption", label: "Consumption" },
            { id: "receipt", label: "Receipts (GRN)" },
            { id: "wastage", label: "Wastage" },
            { id: "transfer", label: "Transfers" },
            { id: "adjustment", label: "Audits" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap",
                typeFilter === t.id
                  ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-2xs"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <TableHead className="font-bold text-xs">Date & Time</TableHead>
                <TableHead className="font-bold text-xs">Item & SKU</TableHead>
                <TableHead className="font-bold text-xs">Type</TableHead>
                <TableHead className="font-bold text-xs">Delta Qty</TableHead>
                <TableHead className="font-bold text-xs">Balance Progression</TableHead>
                <TableHead className="font-bold text-xs">Cost Impact</TableHead>
                <TableHead className="font-bold text-xs">Ref Number</TableHead>
                <TableHead className="font-bold text-xs">Actor & Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.map((m) => {
                const isPositive = m.deltaQty > 0;
                return (
                  <TableRow key={m.id} className="border-b border-slate-100 dark:border-slate-800/60">
                    <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(m.movementDate).toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{m.itemName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{m.sku}</div>
                    </TableCell>

                    <TableCell>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                          m.type === "receipt"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : m.type === "wastage"
                            ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                            : m.type === "transfer"
                            ? "bg-purple-500/10 text-purple-700 dark:text-purple-400"
                            : "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                        )}
                      >
                        {m.type}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span
                        className={cn(
                          "font-extrabold text-xs",
                          isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        )}
                      >
                        {isPositive ? `+${m.deltaQty.toLocaleString()}` : `${m.deltaQty.toLocaleString()}`} {m.unit}
                      </span>
                    </TableCell>

                    <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                      {m.previousBalance.toLocaleString()} → <strong className="text-slate-900 dark:text-white">{m.newBalance.toLocaleString()} {m.unit}</strong>
                    </TableCell>

                    <TableCell className="font-bold text-xs text-slate-900 dark:text-white">
                      {formatCurrency(m.totalCost)}
                    </TableCell>

                    <TableCell className="font-mono text-xs text-slate-500">
                      {m.referenceNumber}
                    </TableCell>

                    <TableCell className="text-xs">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{m.actorName}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{m.reason}</div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
