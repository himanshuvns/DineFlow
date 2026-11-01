"use client";

import * as React from "react";
import {
  FileSpreadsheet,
  Download,
  Upload,
  ClipboardPaste,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Info,
  HelpCircle,
  FileCheck,
  Search,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useInventoryStore, InventoryItem } from "@/lib/stores/inventory-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";

interface ExcelBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (stats: { createdCount: number; updatedCount: number }) => void;
}

export interface ParsedImportRow {
  rowIndex: number;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  baseUnit: string;
  purchaseUnit: string;
  conversionFactor: number;
  purchaseCost: number;
  averageCost: number;
  storageLocation: string;
  trackExpiry: boolean;
  shelfLifeDays: number;
  status: "new" | "update" | "error";
  errorMessage?: string;
}

// Pre-packaged starter CSV content formatted for immediate Excel compatibility
const EXCEL_TEMPLATE_CSV = `\uFEFFItem Name,SKU,Category,Current Stock,Base Unit,Purchase Unit,Pack Conversion Factor,Purchase Cost (INR),Storage Location,Track Expiry (YES/NO),Shelf Life (Days)
Packaged Drinking Water 1L,WAT-001,Beverages,240,Bottle,Crate (24x),24,360,Bar Cellar / Beverage Bay,NO,
Fresh Full Cream Milk,MILK-001,Dairy,25000,ml,Pouch 1L,1000,64,Walk-in Chiller,YES,4
Fortune Cooking Oil,OIL-001,Oils & Fats,60000,ml,Tin 15L,15000,2100,Dry Storage Rack B,YES,180
Daawat Basmati Rice,RIC-001,Dry Pantry,100000,g,Bag 25kg,25000,2750,Dry Store Shelf A,NO,
Fresh Red Onions,VEG-001,Produce,50000,g,Sack 50kg,50000,1400,Vegetable Bins,YES,14
Kraft Meal Takeaway Box 750ml,PKG-001,Packaging & Disposables,500,pcs,Bundle 100pcs,100,650,Packaging Bay,NO,
Housekeeping Floor Disinfectant,CLN-001,Cleaning & Hygiene,20000,ml,Can 5L,5000,450,Housekeeping Store,NO,`;

/**
 * Universal CSV & TSV delimiter sniffing parser.
 * Handles quoted fields with embedded commas, quotes, and newlines.
 */
function parseUniversalSpreadsheetText(rawText: string): string[][] {
  const clean = rawText.replace(/^\uFEFF/, "").trim();
  if (!clean) return [];

  // Determine delimiter from first line (tab, comma, or semicolon)
  const firstLine = clean.split(/\r\n|\n|\r/)[0] || "";
  let delimiter = ",";
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;

  if (tabCount > commaCount && tabCount > semiCount) {
    delimiter = "\t";
  } else if (semiCount > commaCount && semiCount > tabCount) {
    delimiter = ";";
  }

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const nextChar = clean[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++; // skip \n in CRLF
      }
      currentRow.push(currentField.trim());
      if (currentRow.some((field) => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = "";
    } else {
      currentField += char;
    }
  }

  // Push final field/row if any
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

export function ExcelBulkImportModal({
  isOpen,
  onClose,
  onSuccess,
}: ExcelBulkImportModalProps) {
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const items = useInventoryStore((s) => s.items);
  const bulkUpsertItems = useInventoryStore((s) => s.bulkUpsertItems);

  const [activeTab, setActiveTab] = React.useState<"file" | "paste">("file");
  const [importMode, setImportMode] = React.useState<"upsert" | "append" | "replace">("upsert");
  const [rawText, setRawText] = React.useState("");
  const [dragOver, setDragOver] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [previewSearch, setPreviewSearch] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Download official Excel/CSV Template
  const handleDownloadTemplate = () => {
    const blob = new Blob([EXCEL_TEMPLATE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dineflow_inventory_catalog_template_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "Open in Microsoft Excel, Numbers, or Google Sheets to prepare your catalog.",
    });
  };

  // Handle file drop / select
  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setRawText(content);
        setActiveTab("file");
      }
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Parse raw text into structured preview rows
  const parsedRows: ParsedImportRow[] = React.useMemo(() => {
    if (!rawText.trim()) return [];

    const matrix = parseUniversalSpreadsheetText(rawText);
    if (matrix.length === 0) return [];

    // Header index detection
    const firstRowLower = matrix[0].map((c) => c.toLowerCase().trim());
    const hasHeader = firstRowLower.some(
      (c) =>
        c.includes("item") ||
        c.includes("name") ||
        c.includes("sku") ||
        c.includes("category") ||
        c.includes("unit") ||
        c.includes("stock")
    );

    let nameCol = 0;
    let skuCol = 1;
    let categoryCol = 2;
    let stockCol = 3;
    let baseUnitCol = 4;
    let purchaseUnitCol = 5;
    let convCol = 6;
    let costCol = 7;
    let locCol = 8;
    let expiryCol = 9;
    let shelfCol = 10;

    const dataRows = hasHeader ? matrix.slice(1) : matrix;

    if (hasHeader) {
      firstRowLower.forEach((colName, idx) => {
        if (colName.includes("name") || colName === "item") nameCol = idx;
        else if (colName.includes("sku") || colName.includes("code")) skuCol = idx;
        else if (colName.includes("cat") || colName.includes("dept")) categoryCol = idx;
        else if (colName.includes("stock") || colName.includes("qty") || colName.includes("quantity")) stockCol = idx;
        else if (colName.includes("base unit") || colName === "unit" || colName === "uom") baseUnitCol = idx;
        else if (colName.includes("purchase unit") || colName.includes("pack unit") || colName.includes("buy unit"))
          purchaseUnitCol = idx;
        else if (colName.includes("factor") || colName.includes("conversion") || colName.includes("pack"))
          convCol = idx;
        else if (colName.includes("cost") || colName.includes("price") || colName.includes("rate")) costCol = idx;
        else if (colName.includes("location") || colName.includes("shelf") || colName.includes("storage")) locCol = idx;
        else if (colName.includes("expiry") || colName.includes("exp")) expiryCol = idx;
        else if (colName.includes("shelf") || colName.includes("days")) shelfCol = idx;
      });
    }

    const result: ParsedImportRow[] = [];

    dataRows.forEach((row, idx) => {
      const name = (row[nameCol] || "").trim();
      const sku = (row[skuCol] || "").trim();
      const category = (row[categoryCol] || "Produce").trim();
      const stockRaw = parseFloat(row[stockCol] || "0");
      const currentStock = isNaN(stockRaw) ? 0 : Math.max(0, stockRaw);
      const baseUnit = (row[baseUnitCol] || "pcs").trim();
      const purchaseUnit = (row[purchaseUnitCol] || (baseUnit === "g" ? "kg" : baseUnit === "ml" ? "L" : baseUnit)).trim();
      const convRaw = parseFloat(row[convCol] || (baseUnit === "g" ? "1000" : baseUnit === "ml" ? "1000" : "1"));
      const conversionFactor = isNaN(convRaw) || convRaw <= 0 ? 1 : convRaw;
      const costRaw = parseFloat(row[costCol] || "0");
      const purchaseCost = isNaN(costRaw) ? 0 : Math.max(0, costRaw);
      const averageCost = conversionFactor > 0 ? purchaseCost / conversionFactor : purchaseCost;
      const storageLocation = (row[locCol] || "Main Storage Bay").trim();
      const expiryStr = (row[expiryCol] || "").toLowerCase().trim();
      const trackExpiry = expiryStr.includes("y") || expiryStr.includes("true") || expiryStr === "1";
      const shelfRaw = parseInt(row[shelfCol] || "0", 10);
      const shelfLifeDays = isNaN(shelfRaw) || shelfRaw <= 0 ? (trackExpiry ? 30 : 0) : shelfRaw;

      // Validation
      let status: "new" | "update" | "error" = "new";
      let errorMessage: string | undefined;

      if (!name) {
        status = "error";
        errorMessage = "Missing item name";
      } else {
        const skuKey = sku.toUpperCase();
        const nameKey = name.toLowerCase();
        const isExisting = items.some(
          (itm) => (skuKey && itm.sku.toUpperCase() === skuKey) || itm.name.toLowerCase() === nameKey
        );
        if (isExisting) {
          status = "update";
        }
      }

      result.push({
        rowIndex: idx + 1,
        name,
        sku,
        category,
        currentStock,
        baseUnit,
        purchaseUnit,
        conversionFactor,
        purchaseCost,
        averageCost,
        storageLocation,
        trackExpiry,
        shelfLifeDays,
        status,
        errorMessage,
      });
    });

    return result;
  }, [rawText, items]);

  // Statistics
  const stats = React.useMemo(() => {
    const total = parsedRows.length;
    const valid = parsedRows.filter((r) => r.status !== "error").length;
    const updates = parsedRows.filter((r) => r.status === "update").length;
    const news = parsedRows.filter((r) => r.status === "new").length;
    const errors = parsedRows.filter((r) => r.status === "error").length;
    return { total, valid, updates, news, errors };
  }, [parsedRows]);

  // Filtered preview rows
  const filteredPreview = React.useMemo(() => {
    if (!previewSearch.trim()) return parsedRows;
    const q = previewSearch.toLowerCase();
    return parsedRows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.sku.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.storageLocation.toLowerCase().includes(q)
    );
  }, [parsedRows, previewSearch]);

  // Execute Bulk Import
  const handleConfirmImport = async () => {
    const validRows = parsedRows.filter((r) => r.status !== "error");
    if (validRows.length === 0) {
      toast({
        title: "No Valid Items",
        description: "Please provide spreadsheet data with valid item names and units.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const formattedItems: Omit<InventoryItem, "id" | "status" | "updatedAt">[] = validRows.map((r, i) => ({
        name: r.name,
        sku: r.sku || `SKU-${Date.now().toString().slice(-4)}-${i + 1}`,
        category: r.category,
        currentStock: r.currentStock,
        baseUnit: r.baseUnit,
        purchaseUnit: r.purchaseUnit,
        conversionFactor: r.conversionFactor,
        purchaseCost: r.purchaseCost,
        averageCost: r.averageCost,
        storageLocation: r.storageLocation,
        trackExpiry: r.trackExpiry,
        trackBatches: false,
        shelfLifeDays: r.shelfLifeDays,
        minStock: Math.max(1, Math.round(r.currentStock * 0.2)),
        reorderPoint: Math.max(2, Math.round(r.currentStock * 0.4)),
        maxStock: Math.max(10, Math.round(r.currentStock * 2)),
      }));

      const actor = user?.name || "Inventory Manager";
      const res = await bulkUpsertItems(formattedItems, importMode, actor);
      const totalProcessed = res.createdCount + res.updatedCount;

      toast({
        title: "Bulk Catalog Import Complete",
        description: `Successfully added ${res.createdCount} new items and updated ${res.updatedCount} existing items (${totalProcessed} total).`,
      });

      onSuccess?.(res);
      handleResetAndClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to import items";
      toast({
        title: "Import Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetAndClose = () => {
    setRawText("");
    setFileName(null);
    setPreviewSearch("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title="Bulk Catalog Import & Update"
      description="Upload or paste items from Excel, Google Sheets, or CSV (Drinking water, ingredients, packaging, bar goods, housekeeping supplies)"
      size="xl"
      className="max-w-4xl"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            {stats.total > 0 ? (
              <span>
                Ready to process <strong>{stats.valid}</strong> items (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{stats.news} new</span>,{" "}
                <span className="text-amber-600 dark:text-amber-400 font-semibold">{stats.updates} update</span>
                {stats.errors > 0 && (
                  <span className="text-rose-600 dark:text-rose-400 font-semibold">, {stats.errors} skipped</span>
                )}
                )
              </span>
            ) : (
              <span>Download the Excel template or paste spreadsheet rows to get started.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button variant="outline" size="sm" onClick={handleResetAndClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmImport}
              disabled={stats.valid === 0 || isProcessing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 cursor-pointer shadow-xs"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Processing Catalog…</span>
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4" />
                  <span>
                    Import {stats.valid > 0 ? `${stats.valid} Items` : "Catalog"}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Top Banner: Action bar with template download */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-xs shrink-0">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Pre-formatted Hotel & Restaurant Inventory Template
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Includes Packaged Water, Dairy, Cooking Oils, Flours, Rice, Packaging & Chemicals.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadTemplate}
            className="gap-2 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 cursor-pointer shrink-0 font-medium text-xs h-9"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Excel Template (.csv)</span>
          </Button>
        </div>

        {/* Mode Selector & Input Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
          {/* Mode Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setImportMode("upsert")}
              className={cn(
                "flex-1 py-1.5 px-2.5 rounded-lg font-medium transition-all text-center",
                importMode === "upsert"
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              Update & Add (Upsert)
            </button>
            <button
              type="button"
              onClick={() => setImportMode("append")}
              className={cn(
                "flex-1 py-1.5 px-2.5 rounded-lg font-medium transition-all text-center",
                importMode === "append"
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              Add New Only
            </button>
            <button
              type="button"
              onClick={() => setImportMode("replace")}
              className={cn(
                "flex-1 py-1.5 px-2.5 rounded-lg font-medium transition-all text-center",
                importMode === "replace"
                  ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 shadow-2xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-rose-600"
              )}
            >
              Replace Catalog
            </button>
          </div>

          {/* Input Method Tabs */}
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("file")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border",
                activeTab === "file"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload File (.csv / .tsv)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("paste")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border",
                activeTab === "paste"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <ClipboardPaste className="h-3.5 w-3.5" />
              <span>Paste from Excel / Sheets</span>
            </button>
          </div>
        </div>

        {/* Input Area */}
        {activeTab === "file" ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[140px]",
              dragOver
                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />
            <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mb-2">
              <Upload className="h-6 w-6" />
            </div>
            {fileName ? (
              <div className="space-y-1">
                <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 justify-center">
                  <CheckCircle2 className="h-4 w-4" />
                  Loaded: {fileName}
                </span>
                <span className="text-[11px] text-slate-500">Click or drag another file to replace</span>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Drag and drop your spreadsheet file here, or <span className="text-emerald-600 underline">browse</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Supports .csv, .tsv, and exported Excel sheets (up to 5,000 items)
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Copy cells from Excel or Google Sheets and paste (Ctrl+V) directly below:</span>
              <button
                type="button"
                onClick={() => setRawText(EXCEL_TEMPLATE_CSV)}
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium text-[11px]"
              >
                Load Sample Rows
              </button>
            </div>
            <textarea
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste columns from Excel: Name [Tab] SKU [Tab] Category [Tab] Stock [Tab] Unit [Tab] Cost..."
              className="w-full p-3 rounded-xl font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        )}

        {/* Live Validation & Preview Grid */}
        {parsedRows.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            {/* KPI Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                  Total Rows: {stats.total}
                </Badge>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                  + {stats.news} New Items
                </Badge>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                  ↻ {stats.updates} Updates
                </Badge>
                {stats.errors > 0 && (
                  <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">
                    ✕ {stats.errors} Invalid
                  </Badge>
                )}
              </div>

              {/* Search in preview */}
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter preview..."
                  value={previewSearch}
                  onChange={(e) => setPreviewSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>
            </div>

            {/* Preview Table */}
            <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900/80 sticky top-0 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Item Name</th>
                    <th className="p-2.5">SKU</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5 text-right">Stock</th>
                    <th className="p-2.5">Unit</th>
                    <th className="p-2.5 text-right">Pack Cost (₹)</th>
                    <th className="p-2.5">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
                  {filteredPreview.map((row) => (
                    <tr
                      key={row.rowIndex}
                      className={cn(
                        "hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors",
                        row.status === "error" && "bg-rose-50/50 dark:bg-rose-950/20"
                      )}
                    >
                      <td className="p-2.5 whitespace-nowrap">
                        {row.status === "new" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            NEW
                          </span>
                        )}
                        {row.status === "update" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            UPDATE
                          </span>
                        )}
                        {row.status === "error" && (
                          <span
                            title={row.errorMessage}
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          >
                            ERROR
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 font-semibold text-slate-900 dark:text-white max-w-[180px] truncate">
                        {row.name || <span className="text-rose-500 italic">Missing Name</span>}
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-500">{row.sku || "Auto"}</td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-300">{row.category}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900 dark:text-white">
                        {row.currentStock}
                      </td>
                      <td className="p-2.5 text-slate-500">{row.baseUnit}</td>
                      <td className="p-2.5 text-right font-mono text-slate-900 dark:text-slate-100">
                        ₹{row.purchaseCost.toFixed(2)}
                      </td>
                      <td className="p-2.5 text-slate-500 text-[11px] max-w-[120px] truncate">
                        {row.storageLocation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
