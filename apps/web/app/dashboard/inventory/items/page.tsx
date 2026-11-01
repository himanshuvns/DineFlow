"use client";

import * as React from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit2,
  Trash2,
  AlertTriangle,
  Layers,
  ArrowUpDown,
  Barcode,
  Sparkles,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ExcelBulkImportModal } from "@/components/inventory/excel-bulk-import-modal";
import { useInventoryStore, InventoryItem, StockStatus } from "@/lib/stores/inventory-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatCurrency, cn } from "@/lib/utils";

export default function InventoryItemsPage() {
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const items = useInventoryStore((s) => s.items);
  const suppliers = useInventoryStore((s) => s.suppliers);
  const addItem = useInventoryStore((s) => s.addItem);
  const updateItem = useInventoryStore((s) => s.updateItem);
  const deleteItem = useInventoryStore((s) => s.deleteItem);
  const adjustStock = useInventoryStore((s) => s.adjustStock);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");

  // Modal states
  const [itemModalOpen, setItemModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<InventoryItem | null>(null);
  const [activeTab, setActiveTab] = React.useState<"basic" | "units" | "thresholds" | "supplier" | "tracking">("basic");

  // Quick Adjust Modal state
  const [adjustModalOpen, setAdjustModalOpen] = React.useState(false);
  const [selectedAdjustItem, setSelectedAdjustItem] = React.useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = React.useState<number>(0);
  const [adjustReason, setAdjustReason] = React.useState<"Wastage" | "Correction" | "Damaged" | "Opening Stock" | "Sampling">("Wastage");
  const [adjustNotes, setAdjustNotes] = React.useState("");

  // Excel / CSV Bulk Import Modal
  const [excelImportModalOpen, setExcelImportModalOpen] = React.useState(false);

  // Add/Edit Form State
  const [formData, setFormData] = React.useState({
    name: "",
    sku: "",
    barcode: "",
    category: "Produce",
    currentStock: 0,
    minStock: 1000,
    reorderPoint: 2000,
    maxStock: 10000,
    baseUnit: "g",
    purchaseUnit: "kg",
    conversionFactor: 1000,
    averageCost: 0.2,
    purchaseCost: 200,
    storageLocation: "Dry Storage Rack A-1",
    preferredSupplierId: "sup-1",
    trackExpiry: true,
    trackBatches: false,
    shelfLifeDays: 90,
  });

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      barcode: "",
      category: "Produce",
      currentStock: 1000,
      minStock: 500,
      reorderPoint: 1000,
      maxStock: 5000,
      baseUnit: "g",
      purchaseUnit: "kg",
      conversionFactor: 1000,
      averageCost: 0.25,
      purchaseCost: 250,
      storageLocation: "Dry Storage Rack A-1",
      preferredSupplierId: suppliers[0]?.id || "sup-1",
      trackExpiry: true,
      trackBatches: false,
      shelfLifeDays: 180,
    });
    setActiveTab("basic");
    setItemModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      sku: item.sku,
      barcode: item.barcode || "",
      category: item.category,
      currentStock: item.currentStock,
      minStock: item.minStock,
      reorderPoint: item.reorderPoint,
      maxStock: item.maxStock,
      baseUnit: item.baseUnit,
      purchaseUnit: item.purchaseUnit,
      conversionFactor: item.conversionFactor,
      averageCost: item.averageCost,
      purchaseCost: item.purchaseCost,
      storageLocation: item.storageLocation,
      preferredSupplierId: item.preferredSupplierId || suppliers[0]?.id || "sup-1",
      trackExpiry: item.trackExpiry,
      trackBatches: item.trackBatches,
      shelfLifeDays: item.shelfLifeDays || 90,
    });
    setActiveTab("basic");
    setItemModalOpen(true);
  };

  // Save Item
  const handleSaveItem = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Name required", description: "Please enter an item name.", variant: "destructive" });
      return;
    }

    const preferredSupplier = suppliers.find((s) => s.id === formData.preferredSupplierId);

    // Auto calculate average cost from purchase cost & conversion factor
    const calculatedBaseCost = formData.conversionFactor > 0
      ? formData.purchaseCost / formData.conversionFactor
      : formData.averageCost;

    if (editingItem) {
      await updateItem(editingItem.id, {
        ...formData,
        averageCost: calculatedBaseCost,
        preferredSupplierName: preferredSupplier?.name,
      });
      toast({ title: "Item Updated", description: `${formData.name} was successfully modified.` });
    } else {
      await addItem({
        ...formData,
        averageCost: calculatedBaseCost,
        preferredSupplierName: preferredSupplier?.name,
      });
      toast({ title: "Item Added", description: `${formData.name} has been enrolled in the catalog.` });
    }

    setItemModalOpen(false);
  };

  // Delete Item
  const handleDeleteItem = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      await deleteItem(id);
      toast({ title: "Item Deleted", description: `${name} has been removed from inventory.` });
    }
  };

  // Quick Stock Adjustment
  const handleQuickAdjust = (item: InventoryItem) => {
    setSelectedAdjustItem(item);
    setAdjustQty(0);
    setAdjustReason("Wastage");
    setAdjustNotes("");
    setAdjustModalOpen(true);
  };

  const handleConfirmAdjust = async () => {
    if (!selectedAdjustItem || adjustQty === 0) {
      toast({ title: "Invalid Adjustment", description: "Quantity cannot be zero.", variant: "destructive" });
      return;
    }

    await adjustStock({
      itemId: selectedAdjustItem.id,
      quantityDelta: adjustQty,
      reason: adjustReason,
      notes: adjustNotes,
      actorName: user?.name || "Kitchen Controller",
      actorRole: user?.role || "Manager",
    });

    toast({
      title: "Stock Adjusted",
      description: `${selectedAdjustItem.name} updated by ${adjustQty > 0 ? `+${adjustQty}` : adjustQty} ${selectedAdjustItem.baseUnit}.`,
    });
    setAdjustModalOpen(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "SKU",
      "Item Name",
      "Category",
      "Current Stock",
      "Base Unit",
      "Reorder Point",
      "Purchase Unit",
      "Unit Cost (₹)",
      "Storage Location",
      "Status",
    ];

    const rows = filteredItems.map((i) => [
      i.sku,
      `"${i.name}"`,
      `"${i.category}"`,
      i.currentStock,
      i.baseUnit,
      i.reorderPoint,
      i.purchaseUnit,
      i.averageCost.toFixed(2),
      `"${i.storageLocation}"`,
      i.status,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dineflow_inventory_items_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Export Complete", description: "Inventory items catalog downloaded to CSV." });
  };

  // Download Starter Excel Template
  const handleDownloadTemplate = () => {
    const template = `\uFEFFItem Name,SKU,Category,Current Stock,Base Unit,Purchase Unit,Pack Conversion Factor,Purchase Cost (INR),Storage Location,Track Expiry (YES/NO),Shelf Life (Days)
Packaged Drinking Water 1L,WAT-001,Beverages,240,Bottle,Crate (24x),24,360,Bar Cellar / Beverage Bay,NO,
Fresh Full Cream Milk,MILK-001,Dairy,25000,ml,Pouch 1L,1000,64,Walk-in Chiller,YES,4
Fortune Cooking Oil,OIL-001,Oils & Fats,60000,ml,Tin 15L,15000,2100,Dry Storage Rack B,YES,180
Daawat Basmati Rice,RIC-001,Dry Pantry,100000,g,Bag 25kg,25000,2750,Dry Store Shelf A,NO,
Fresh Red Onions,VEG-001,Produce,50000,g,Sack 50kg,50000,1400,Vegetable Bins,YES,14
Kraft Meal Takeaway Box 750ml,PKG-001,Packaging & Disposables,500,pcs,Bundle 100pcs,100,650,Packaging Bay,NO,
Housekeeping Floor Disinfectant,CLN-001,Cleaning & Hygiene,20000,ml,Can 5L,5000,450,Housekeeping Store,NO,`;

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dineflow_inventory_template_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "Open in Microsoft Excel, Numbers, or Google Sheets to populate your catalog.",
    });
  };

  // Filtering
  const filteredItems = items.filter((item) => {
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchSku = item.sku.toLowerCase().includes(q);
      const matchLoc = item.storageLocation.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchLoc) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
                Items Catalog & Stock Levels
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Manage raw ingredients, unit conversions, stock health and storage allocations
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            className="gap-2 cursor-pointer border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span className="hidden sm:inline">Excel Template</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setExcelImportModalOpen(true)}
            className="gap-2 cursor-pointer border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Import Excel / CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={items.length === 0}
            className="gap-2 cursor-pointer border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Item</span>
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search items by name, SKU or storage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="in_stock">Healthy Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="expiring_soon">Expiring Soon</option>
          </select>

          {/* Toggle Table / Grid */}
          <div className="inline-flex rounded-xl p-0.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer",
                viewMode === "table" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs" : "text-slate-400"
              )}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer",
                viewMode === "grid" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs" : "text-slate-400"
              )}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* Main Catalog View */}
      {items.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-2 border-slate-300 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 p-8 sm:p-12 text-center space-y-6 shadow-xs">
          <div className="max-w-xl mx-auto space-y-3">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="h-8 w-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Your Stock Catalog is Clean & Ready
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              As a freshly registered property, your inventory ledger starts with zero static demo data.
              Easily upload your hotel&apos;s drinking water, pantry ingredients, cleaning supplies, and packaging from Excel or add them individually.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-2 text-left">
            <div
              onClick={() => setExcelImportModalOpen(true)}
              className="p-5 rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-teal-500/5 hover:border-emerald-500 transition-all cursor-pointer space-y-2 group shadow-2xs hover:shadow-md"
            >
              <div className="p-2.5 rounded-xl bg-emerald-500 text-white w-fit group-hover:scale-105 transition-transform shadow-xs">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Import from Excel / CSV
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Bulk upload your entire catalog with units, stock quantities, and pack costs in one click.
              </p>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-1 group-hover:translate-x-0.5 transition-transform">
                Open Spreadsheet Uploader &rarr;
              </span>
            </div>

            <div
              onClick={handleDownloadTemplate}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer space-y-2 group shadow-2xs hover:shadow-md"
            >
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 w-fit group-hover:scale-105 transition-transform">
                <Download className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Download Starter Template
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Pre-formatted .csv template filled with drinking water, dairy, oils, packaging & housekeeping.
              </p>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 pt-1 group-hover:translate-x-0.5 transition-transform">
                Download Template (.csv) &rarr;
              </span>
            </div>

            <div
              onClick={handleOpenAdd}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer space-y-2 group shadow-2xs hover:shadow-md"
            >
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 w-fit group-hover:scale-105 transition-transform">
                <Plus className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Add Single Item Manually
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Step-by-step entry for unit conversions, preferred suppliers, and reorder alerts.
              </p>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 pt-1 group-hover:translate-x-0.5 transition-transform">
                Create First Item &rarr;
              </span>
            </div>
          </div>
        </Card>
      ) : viewMode === "table" ? (
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  <TableHead className="font-bold text-xs">SKU & Item Name</TableHead>
                  <TableHead className="font-bold text-xs">Category</TableHead>
                  <TableHead className="font-bold text-xs">Current Stock Health</TableHead>
                  <TableHead className="font-bold text-xs">Base Unit Cost</TableHead>
                  <TableHead className="font-bold text-xs">Storage Location</TableHead>
                  <TableHead className="font-bold text-xs">Status</TableHead>
                  <TableHead className="font-bold text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                      No matching items found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => {
                    const healthPct = Math.min(100, Math.round((item.currentStock / item.maxStock) * 100));
                    return (
                      <TableRow
                        key={item.id}
                        className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                      >
                        <TableCell className="py-3">
                          <div className="font-bold text-xs text-slate-900 dark:text-white">
                            {item.name}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                            <span>{item.sku}</span>
                            {item.barcode && <span>• {item.barcode}</span>}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="neutral" size="sm">{item.category}</Badge>
                        </TableCell>

                        <TableCell className="w-64">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-extrabold text-slate-900 dark:text-white">
                              {item.currentStock.toLocaleString()} {item.baseUnit}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Max: {item.maxStock.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                item.currentStock <= 0
                                  ? "bg-slate-300 dark:bg-slate-700"
                                  : healthPct <= 20
                                  ? "bg-rose-500"
                                  : healthPct <= 40
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              )}
                              style={{ width: `${Math.max(4, healthPct)}%` }}
                            />
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-xs font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(item.averageCost)} / {item.baseUnit}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {formatCurrency(item.purchaseCost)} / {item.purchaseUnit}
                          </div>
                        </TableCell>

                        <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                          {item.storageLocation}
                        </TableCell>

                        <TableCell>
                          {item.status === "in_stock" && <Badge variant="success" size="sm" dot>In Stock</Badge>}
                          {item.status === "low_stock" && <Badge variant="warning" size="sm" dot>Low Stock</Badge>}
                          {item.status === "out_of_stock" && <Badge variant="danger" size="sm" dot>Out of Stock</Badge>}
                          {item.status === "expiring_soon" && <Badge variant="glow" size="sm" dot>Expiring</Badge>}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuickAdjust(item)}
                              title="Manual stock adjustment"
                              className="h-8 px-2 text-xs text-amber-600 dark:text-amber-400 cursor-pointer"
                            >
                              Adjust
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(item)}
                              className="h-8 w-8 p-0 cursor-pointer text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id, item.name)}
                              className="h-8 w-8 p-0 cursor-pointer text-rose-500 hover:text-rose-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const healthPct = Math.min(100, Math.round((item.currentStock / item.maxStock) * 100));
            return (
              <Card
                key={item.id}
                className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400">{item.sku}</p>
                    </div>
                    {item.status === "in_stock" && <Badge variant="success" size="sm">Healthy</Badge>}
                    {item.status === "low_stock" && <Badge variant="warning" size="sm">Low</Badge>}
                    {item.status === "out_of_stock" && <Badge variant="danger" size="sm">0 Stock</Badge>}
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Current Stock:</span>
                      <strong className="text-slate-900 dark:text-white">
                        {item.currentStock} {item.baseUnit}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cost:</span>
                      <span>{formatCurrency(item.averageCost)} / {item.baseUnit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Location:</span>
                      <span className="truncate max-w-[120px]">{item.storageLocation}</span>
                    </div>
                  </div>

                  {/* Health Bar */}
                  <div className="mt-3 w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        healthPct <= 20 ? "bg-rose-500" : healthPct <= 40 ? "bg-amber-500" : "bg-emerald-500"
                      )}
                      style={{ width: `${Math.max(4, healthPct)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuickAdjust(item)}
                    className="text-xs text-amber-600 dark:text-amber-400 font-semibold cursor-pointer"
                  >
                    Quick Adjust
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(item)}
                      className="h-8 w-8 p-0 cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id, item.name)}
                      className="h-8 w-8 p-0 cursor-pointer text-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Item Modal (5 Tabs) */}
      <Modal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        title={editingItem ? `Edit Item: ${editingItem.name}` : "Create New Inventory Item"}
        description="Configure unit conversions, procurement parameters, and automated tracking"
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setItemModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveItem} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {editingItem ? "Update Item" : "Save Item"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
            {(
              [
                { id: "basic", label: "Basic Info" },
                { id: "units", label: "Units & Conversion" },
                { id: "thresholds", label: "Stock Thresholds" },
                { id: "supplier", label: "Supplier & Storage" },
                { id: "tracking", label: "Batch & Expiry" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "px-3 py-2 text-xs font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap",
                  activeTab === t.id
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Basic Information */}
          {activeTab === "basic" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Item Name *"
                  placeholder="e.g. Buffalo Mozzarella"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="SKU Code *"
                  placeholder="e.g. DAI-MOZ-01"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="Dairy">Dairy</option>
                    <option value="Produce">Produce</option>
                    <option value="Meat & Poultry">Meat & Poultry</option>
                    <option value="Dry Pantry">Dry Pantry</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>

                <Input
                  label="Barcode / EAN (Optional)"
                  placeholder="e.g. 890123456789"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Tab 2: Units & Live Conversion Preview */}
          {activeTab === "units" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Base Recipe Unit"
                  placeholder="e.g. g, ml, pcs"
                  value={formData.baseUnit}
                  onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value })}
                />
                <Input
                  label="Purchase Unit"
                  placeholder="e.g. Box, kg, Tin"
                  value={formData.purchaseUnit}
                  onChange={(e) => setFormData({ ...formData, purchaseUnit: e.target.value })}
                />
                <Input
                  label="Conversion Factor"
                  type="number"
                  placeholder="1000"
                  value={formData.conversionFactor}
                  onChange={(e) => setFormData({ ...formData, conversionFactor: parseFloat(e.target.value) || 1 })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Purchase Cost per Purchase Unit (₹)"
                  type="number"
                  value={formData.purchaseCost}
                  onChange={(e) => setFormData({ ...formData, purchaseCost: parseFloat(e.target.value) || 0 })}
                />
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Calculated Base Cost / {formData.baseUnit}
                  </label>
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200">
                    {formatCurrency(formData.conversionFactor > 0 ? formData.purchaseCost / formData.conversionFactor : 0)} / {formData.baseUnit}
                  </div>
                </div>
              </div>

              {/* Live Conversion Preview Box */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
                <span className="font-bold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Live Unit Conversion Formula:
                </span>
                <p className="mt-1 font-mono">
                  1 {formData.purchaseUnit} = {formData.conversionFactor.toLocaleString()} {formData.baseUnit} (₹{(formData.purchaseCost / (formData.conversionFactor || 1)).toFixed(3)} per {formData.baseUnit})
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Stock Thresholds */}
          {activeTab === "thresholds" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label={`Current Opening Stock (${formData.baseUnit})`}
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  label={`Minimum Safety Stock (${formData.baseUnit})`}
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label={`Reorder Trigger Point (${formData.baseUnit})`}
                  type="number"
                  value={formData.reorderPoint}
                  onChange={(e) => setFormData({ ...formData, reorderPoint: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  label={`Maximum Storage Capacity (${formData.baseUnit})`}
                  type="number"
                  value={formData.maxStock}
                  onChange={(e) => setFormData({ ...formData, maxStock: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          )}

          {/* Tab 4: Supplier & Storage */}
          {activeTab === "supplier" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Preferred Supplier</label>
                <select
                  value={formData.preferredSupplierId}
                  onChange={(e) => setFormData({ ...formData, preferredSupplierId: e.target.value })}
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.paymentTerms})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Storage Location / Shelf"
                placeholder="e.g. Walk-in Cooler Shelf 2"
                value={formData.storageLocation}
                onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
              />
            </div>
          )}

          {/* Tab 5: Expiry & Batch Tracking */}
          {activeTab === "tracking" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Track Batch / Lot Numbers</div>
                  <div className="text-[11px] text-slate-500">Prompts for batch number during GRN intake</div>
                </div>
                <Switch
                  checked={formData.trackBatches}
                  onCheckedChange={(checked) => setFormData({ ...formData, trackBatches: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Track Expiry & Shelf Life</div>
                  <div className="text-[11px] text-slate-500">Flags item on Expiry Radar when near shelf life limit</div>
                </div>
                <Switch
                  checked={formData.trackExpiry}
                  onCheckedChange={(checked) => setFormData({ ...formData, trackExpiry: checked })}
                />
              </div>

              {formData.trackExpiry && (
                <Input
                  label="Average Shelf Life (Days)"
                  type="number"
                  value={formData.shelfLifeDays}
                  onChange={(e) => setFormData({ ...formData, shelfLifeDays: parseInt(e.target.value) || 1 })}
                />
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Quick Manual Adjustment Modal */}
      <Modal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title={selectedAdjustItem ? `Quick Stock Adjustment: ${selectedAdjustItem.name}` : "Stock Adjustment"}
        description="Record spoilage, kitchen waste, recount audit or opening discrepancy"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setAdjustModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmAdjust} className="bg-amber-600 hover:bg-amber-700 text-white">
              Post Adjustment
            </Button>
          </div>
        }
      >
        {selectedAdjustItem && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between">
              <span className="text-slate-500">Current Balance:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {selectedAdjustItem.currentStock} {selectedAdjustItem.baseUnit}
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Adjustment Reason</label>
              <select
                value={adjustReason}
                onChange={(e) =>
                  setAdjustReason(e.target.value as "Wastage" | "Correction" | "Damaged" | "Opening Stock" | "Sampling")
                }
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
              >
                <option value="Wastage">Wastage / Prep Loss (Deduct -)</option>
                <option value="Damaged">Damaged / Expired (Deduct -)</option>
                <option value="Correction">Recount Audit Correction (+ or -)</option>
                <option value="Opening Stock">Opening Stock Intake (+)</option>
                <option value="Sampling">Staff Tasting / Sampling (Deduct -)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Quantity Delta in {selectedAdjustItem.baseUnit} (use negative to deduct)
              </label>
              <Input
                type="number"
                placeholder="-500 or 1000"
                value={adjustQty}
                onChange={(e) => setAdjustQty(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between items-center font-bold">
              <span>New Projected Balance:</span>
              <span
                className={cn(
                  selectedAdjustItem.currentStock + adjustQty < 0 ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"
                )}
              >
                {Math.max(0, selectedAdjustItem.currentStock + adjustQty)} {selectedAdjustItem.baseUnit}
              </span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Notes / Remarks</label>
              <Input
                placeholder="e.g. Overheated cream during sauce reduction"
                value={adjustNotes}
                onChange={(e) => setAdjustNotes(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Excel / Spreadsheet Bulk Import Modal */}
      <ExcelBulkImportModal
        isOpen={excelImportModalOpen}
        onClose={() => setExcelImportModalOpen(false)}
      />
    </div>
  );
}
