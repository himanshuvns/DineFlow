"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  QrCode,
  Plus,
  Download,
  Users,
  CheckCircle2,
  Sparkles,
  Printer,
  Copy,
  ExternalLink,
  Search,
  Grid,
  MessageCircle,
  Globe,
  Trash2,
  Utensils,
  Coffee,
  Flame,
  Wine,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Receipt,
  Soup,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { QRCodeImage } from "@/components/ui/qr-code-image";
import { cn, formatCurrency } from "@/lib/utils";
import { useTenantData, TableItem, KdsOrder, STARTER_TEMPLATES } from "@/lib/stores/tenant-data-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { hasTables, getCategoryConfig } from "@/lib/rbac/roles";
import { SettleBillModal } from "@/components/orders/settle-bill-modal";
import { ViewToggle, useViewMode } from "@/components/ui/view-toggle";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import NumberFlow from "@number-flow/react";

export default function TablesManagementPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { tenant } = useAuthStore();
  const isTableVertical = hasTables(tenant?.type);
  const categoryConfig = getCategoryConfig(tenant?.type);

  const {
    tenantName,
    tenantSlug,
    isDemoTenant,
    tables,
    orders,
    addTable,
    updateTableStatus,
    deleteTable,
    applyStarterTemplate,
    fetchTables,
  } = useTenantData();

  const [viewMode, setViewMode] = useViewMode("tables", "grid");
  const [selectedTable, setSelectedTable] = React.useState<TableItem | null>(null);
  const [filterZone, setFilterZone] = React.useState("all");
  const [filterStatus, setFilterStatus] = React.useState<"all" | "available" | "occupied" | "reserved">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showMobileStats, setShowMobileStats] = React.useState(false);
  const [settleOrderModal, setSettleOrderModal] = React.useState<{
    isOpen: boolean;
    order: KdsOrder | null;
    table: TableItem | null;
  }>({
    isOpen: false,
    order: null,
    table: null,
  });

  const kpiStats = React.useMemo(() => {
    const total = tables.length;
    const available = tables.filter((t) => t.status === "available").length;
    const occupied = tables.filter((t) => t.status === "occupied").length;
    const reserved = tables.filter((t) => t.status === "reserved").length;
    const totalSeats = tables.reduce((acc, t) => acc + (t.seats || 0), 0);
    return { total, available, occupied, reserved, totalSeats };
  }, [tables]);

  // QR Mode: "web" for Digital Menu, "whatsapp" for Direct WhatsApp ordering
  const [qrTarget, setQrTarget] = React.useState<"web" | "whatsapp">("web");
  const [baseUrl, setBaseUrl] = React.useState("https://dineflow-steel.vercel.app");

  // Real-time table status synchronization (BroadcastChannel, storage event, background polling)
  React.useEffect(() => {
    fetchTables?.();

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("dineflow_table_sync");
      channel.onmessage = (event) => {
        if (event.data?.type === "TABLE_STATUS_UPDATED") {
          fetchTables?.();
        }
      };
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith("dineflow_data_v2_")) {
        fetchTables?.();
      }
    };
    window.addEventListener("storage", handleStorage);

    const interval = setInterval(() => {
      fetchTables?.();
    }, 8000);

    return () => {
      channel?.close();
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [fetchTables]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.location.origin && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
        setBaseUrl(window.location.origin);
      }
      const params = new URLSearchParams(window.location.search);
      const searchParam = params.get("search");
      if (searchParam && tables.length > 0) {
        const clean = searchParam.trim().toLowerCase();
        const matched = tables.find(
          (t) => t.name.toLowerCase().includes(clean) || t.id.toLowerCase() === clean
        );
        if (matched) {
          setSelectedTable(matched);
        }
      }
    }
  }, [tables]);

  // New Table Modal
  const [isAddTableOpen, setIsAddTableOpen] = React.useState(false);
  const [newTableName, setNewTableName] = React.useState("");
  const [newTableSeats, setNewTableSeats] = React.useState("4");
  const [newTableZone, setNewTableZone] = React.useState("Main Dining");

  // Print Package Modal
  const [isPrintPackageOpen, setIsPrintPackageOpen] = React.useState(false);

  // Dynamic zones list
  const existingZones = Array.from(new Set(tables.map((t) => t.zone)));
  const zones = ["all", ...(existingZones.length > 0 ? existingZones : ["Main Dining", "Patio Terrace"])];

  const handleDownloadAll = () => {
    setIsPrintPackageOpen(true);
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;

    const created = await addTable({
      name: newTableName.trim(),
      seats: parseInt(newTableSeats) || 2,
      zone: newTableZone,
      status: "available",
    });

    setIsAddTableOpen(false);
    setNewTableName("");
    addToast(
      "success",
      "Table Added",
      `${created.name} added with dynamic QR code ready for guest orders.`
    );
  };

  const handleDeleteTable = async (tableId: string, name: string) => {
    await deleteTable(tableId);
    if (selectedTable?.id === tableId) {
      setSelectedTable(null);
    }
    addToast("info", "Table Removed", `${name} was deleted from your floor layout.`);
  };

  const handleToggleStatus = async (table: TableItem, nextStatus: TableItem["status"]) => {
    await updateTableStatus(table.id, nextStatus);
    if (selectedTable?.id === table.id) {
      setSelectedTable({ ...selectedTable, status: nextStatus });
    }
    addToast("success", "Status Updated", `${table.name} is now marked as ${nextStatus}.`);
  };

  const getQRLink = (table: TableItem, target: "web" | "whatsapp" = qrTarget) => {
    if (target === "whatsapp") {
      const msg = `Hi ${tenantName}! 👋 I am seated at ${table.name}. Please send me the live digital menu & daily specials.`;
      return `https://wa.me/919876543210?text=${encodeURIComponent(msg)}`;
    }
    const slug = tenantSlug || "the-grand-bistro";
    return `${baseUrl}/m/${slug}/${table.id.toLowerCase()}`;
  };

  const copyQRLink = (table: TableItem) => {
    navigator.clipboard?.writeText(getQRLink(table));
    addToast("info", "Link Copied", `${qrTarget === "whatsapp" ? "WhatsApp bot" : "Digital menu"} link copied to clipboard.`);
  };

  const handleApplyPreset = (key: keyof typeof STARTER_TEMPLATES) => {
    applyStarterTemplate(key);
    addToast(
      "success",
      "Tables Layout Loaded",
      `Created floor layout from ${STARTER_TEMPLATES[key].name} for ${tenantName}.`
    );
  };

  const filteredTables = tables.filter((t) => {
    if (filterZone !== "all" && t.zone !== filterZone) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = t.name.toLowerCase().includes(q);
      const matchId = t.id.toLowerCase().includes(q);
      const matchZone = t.zone.toLowerCase().includes(q);
      const matchSeats = t.seats.toString() === q;
      if (!matchName && !matchId && !matchZone && !matchSeats) return false;
    }
    return true;
  });

  if (!isTableVertical) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="h-16 w-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 shadow-lg shadow-amber-500/10">
          <Soup className="h-8 w-8" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-3">
          Cloud Kitchen Delivery Hub
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Dine-In Tables Not Required
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
          Cloud kitchens operate as delivery, takeaway, and digital dispatch hubs without physical dine-in tables. Your orders, packaging, and dispatches are handled in real-time via the Kitchen Display System (KDS).
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="w-full sm:w-auto"
          >
            Back to Dashboard
          </Button>
          <Button
            variant="glow"
            onClick={() => router.push("/dashboard/orders")}
            className="w-full sm:w-auto"
          >
            Open Live KDS & Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 gap-2.5">
      {/* ======================================================== */}
      {/* 1. FIXED TOP CONTROL AREA (Header & Toolbar)            */}
      {/* ======================================================== */}
      <div className="shrink-0 space-y-2">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Tables & QR Codes
              </h1>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                <Sparkles className="h-3 w-3" />
                <span className="truncate max-w-[120px]">{tenantName}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xl hidden sm:block">
              Generate and manage instant digital menu QR codes for each table and zone in {tenantName}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {tables.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Download className="h-3.5 w-3.5" />}
                onClick={handleDownloadAll}
                className="h-8 text-xs px-2.5"
                title="Download All QRs"
              >
                <span className="hidden sm:inline">Download All QRs</span>
              </Button>
            )}
            <Button
              variant="glow"
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => setIsAddTableOpen(true)}
              className="h-8 text-xs px-3 font-bold"
            >
              Add Table
            </Button>
          </div>
        </div>

        {/* Mobile Collapsible Stats Pill */}
        <div className="sm:hidden flex items-center justify-between px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <span>{kpiStats.total} Tables</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400">{kpiStats.available} Avail</span>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400">{kpiStats.occupied} Occ</span>
          </div>
          <button
            onClick={() => setShowMobileStats(!showMobileStats)}
            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 cursor-pointer"
          >
            Stats {showMobileStats ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {/* Sleek Compact KPI Metrics Strip */}
        <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-2 pb-0.5", !showMobileStats && "hidden sm:grid")}>
          <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Tables</span>
              <div className="h-5 w-5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Utensils className="h-3 w-3" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                <NumberFlow value={kpiStats.total} />
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                across {zones.length - 1 || 1} zones
              </span>
            </div>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Available</span>
              <div className="h-5 w-5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                <NumberFlow value={kpiStats.available} />
              </span>
              <span className="text-[10px] text-slate-400 font-medium">ready for seating</span>
            </div>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Occupied</span>
              <div className="h-5 w-5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Users className="h-3 w-3" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 tracking-tight">
                <NumberFlow value={kpiStats.occupied} />
              </span>
              <span className="text-[10px] text-slate-400 font-medium">dining now</span>
            </div>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Capacity</span>
              <div className="h-5 w-5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Sparkles className="h-3 w-3" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                <NumberFlow value={kpiStats.totalSeats} />
              </span>
              <span className="text-[10px] text-slate-400 font-medium">total covers</span>
            </div>
          </div>
        </div>

        {/* STICKY TOOLBAR: ZONES, SEARCH, STATUS & VIEW TOGGLE */}
        {tables.length > 0 && (
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-2 sm:p-2.5 shadow-2xs transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              {/* Zone Filter Chips */}
              <div className="overflow-x-auto scrollbar-none min-w-0 flex-1 pb-0.5 sm:pb-0">
                <div className="flex min-w-max items-center gap-1.5">
                  {zones.map((zone) => (
                    <button
                      key={zone}
                      onClick={() => setFilterZone(zone)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        filterZone === zone
                          ? "bg-emerald-500 text-slate-950 shadow-xs font-bold"
                          : "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                      }`}
                    >
                      {zone === "all" ? "All Locations" : zone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Search + Status Filter + View Toggle */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative w-full sm:w-44">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search tables..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs cursor-pointer font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="available">🟢 Available</option>
                  <option value="occupied">🟠 Occupied</option>
                  <option value="reserved">⚪ Reserved</option>
                </select>

                <ViewToggle view={viewMode} onViewChange={setViewMode} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. SCROLLABLE TABLES CONTAINER (Only tables scroll)      */}
      {/* ======================================================== */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-16 scrollbar-thin">

      {/* Empty State / Starter Preset Chooser */}
      {tables.length === 0 ? (
        <div className="p-10 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="max-w-md mx-auto">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-3">
              <QrCode className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No tables configured yet for {tenantName}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Add your physical dining tables with custom seating capacities, or pick a starter layout:
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Utensils className="h-3.5 w-3.5 text-emerald-500" />}
              onClick={() => handleApplyPreset("bistro")}
            >
              Bistro Tables (5 Tables)
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Coffee className="h-3.5 w-3.5 text-amber-500" />}
              onClick={() => handleApplyPreset("cafe")}
            >
              Cafe Layout (Counters & Booths)
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Flame className="h-3.5 w-3.5 text-orange-500" />}
              onClick={() => handleApplyPreset("indian")}
            >
              Family Hall & Express
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Wine className="h-3.5 w-3.5 text-indigo-500" />}
              onClick={() => handleApplyPreset("bar")}
            >
              Bar Stools & Lounges
            </Button>
          </div>

          <div className="pt-2">
            <Button variant="glow" size="sm" onClick={() => setIsAddTableOpen(true)}>
              + Add Custom Table
            </Button>
          </div>
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
          No tables match your search or filter.{" "}
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setFilterZone("all");
              setFilterStatus("all");
            }}
            className="text-emerald-600 dark:text-emerald-400 font-bold underline cursor-pointer"
          >
            Reset filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid of Tables */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredTables.map((table) => {
            const tableClean = table.name.toLowerCase().trim();
            const tableIdClean = table.id.toLowerCase().trim();
            const numOnly = tableClean.replace(/\D/g, "");

            const currentOrder = orders.find((o) => {
              if (o.status === "paid" || o.status === "cancelled") return false;
              const oTable = (o.table || "").toLowerCase().trim();
              const oNum = oTable.replace(/\D/g, "");
              return (
                oTable === tableClean ||
                oTable === tableIdClean ||
                (numOnly !== "" && (oTable === `table ${numOnly}` || oTable === `t-${numOnly}` || oNum === numOnly))
              );
            });

            const isServedAwaitingBill = currentOrder && currentOrder.status === "served";

            const statusColors = {
              occupied: isServedAwaitingBill
                ? "border-amber-500/60 bg-amber-500/10 ring-1 ring-amber-500/30"
                : "border-amber-500/40 bg-amber-500/5",
              available: "border-emerald-500/40 bg-emerald-500/5",
              reserved: "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40",
            };

            return (
              <Card
                key={table.id}
                variant="glass"
                hoverEffect
                className={`border cursor-pointer ${statusColors[table.status]}`}
                onClick={() => setSelectedTable(table)}
              >
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="min-w-0 flex-1 pr-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate" title={table.name}>
                      {table.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                      {table.zone}
                    </p>
                  </div>
                  <Badge
                    variant={
                      isServedAwaitingBill
                        ? "warning"
                        : table.status === "occupied"
                        ? "warning"
                        : table.status === "available"
                        ? "success"
                        : "neutral"
                    }
                    size="sm"
                    dot
                    className={cn(
                      "shrink-0",
                      isServedAwaitingBill && "bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/50 font-bold"
                    )}
                  >
                    {isServedAwaitingBill ? "Served • Settle Bill" : table.status}
                  </Badge>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span>{table.seats} Seats</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400 truncate max-w-[100px]">
                    {table.id}
                  </span>
                </div>

                {/* Active Order Summary */}
                {currentOrder && (
                  <div
                    className={cn(
                      "mt-3 p-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors",
                      isServedAwaitingBill
                        ? "bg-amber-500/15 border-amber-500/30 text-amber-900 dark:text-amber-100"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 font-bold truncate">
                        <span>#{currentOrder.id.slice(-4).toUpperCase()}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                          {currentOrder.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {currentOrder.customerName || "Dine-in"} • {currentOrder.items?.length || 0} items
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block font-medium">Bill Due</span>
                      <span className="font-mono font-black text-slate-900 dark:text-white">
                        {formatCurrency(currentOrder.total)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Settle Bill Action Button for Served Tickets */}
                {isServedAwaitingBill && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSettleOrderModal({
                        isOpen: true,
                        order: currentOrder,
                        table,
                      });
                    }}
                    className="w-full mt-3 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer hover:shadow-emerald-600/25"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Settle Bill ({formatCurrency(currentOrder.total)})</span>
                  </button>
                )}

                {/* Mini Preview Box */}
                <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <QrCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>View QR Stand</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    aria-label={`Delete ${table.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTable(table.id, table.name);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* ======================================================== */
        /* ENTERPRISE TABLES LIST VIEW                              */
        /* ======================================================== */
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md overflow-hidden shadow-2xs">
          <div className="overflow-x-auto scrollbar-none [-webkit-overflow-scrolling:touch]">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-slate-200/80 dark:border-slate-800/80">
                  <TableHead className="pl-4">Table & Zone</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Live Order & QR</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTables.map((table) => {
                  const tableClean = table.name.toLowerCase().trim();
                  const tableIdClean = table.id.toLowerCase().trim();
                  const numOnly = tableClean.replace(/\D/g, "");

                  const currentOrder = orders.find((o) => {
                    if (o.status === "paid" || o.status === "cancelled") return false;
                    const oTable = (o.table || "").toLowerCase().trim();
                    const oNum = oTable.replace(/\D/g, "");
                    return (
                      oTable === tableClean ||
                      oTable === tableIdClean ||
                      (numOnly !== "" && (oTable === `table ${numOnly}` || oTable === `t-${numOnly}` || oNum === numOnly))
                    );
                  });

                  const isServedAwaitingBill = currentOrder && currentOrder.status === "served";

                  return (
                    <TableRow key={table.id} className="hover:bg-slate-500/5 transition-colors">
                      {/* Table & Zone */}
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-500/20">
                            <Utensils className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {table.name}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                                ({table.id})
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                              {table.zone}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Capacity */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span>{table.seats} Guests Max</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <select
                          value={table.status}
                          onChange={(e) => handleToggleStatus(table, e.target.value as TableItem["status"])}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none transition-colors ${
                            table.status === "available"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                              : table.status === "occupied"
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                          }`}
                        >
                          <option value="available">🟢 Available</option>
                          <option value="occupied">🟠 Occupied</option>
                          <option value="reserved">⚪ Reserved</option>
                        </select>
                      </TableCell>

                      {/* Live Order & QR */}
                      <TableCell>
                        {currentOrder ? (
                          <div
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs min-w-0",
                              isServedAwaitingBill
                                ? "bg-amber-500/20 border-amber-500/40 text-amber-900 dark:text-amber-200"
                                : "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300"
                            )}
                          >
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full shrink-0",
                                isServedAwaitingBill ? "bg-amber-600 animate-ping" : "bg-amber-500 animate-pulse"
                              )}
                            />
                            <span className="font-bold truncate">#{currentOrder.id.slice(-4).toUpperCase()}</span>
                            <span className="text-[11px] opacity-80">
                              • {currentOrder.status}
                            </span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white ml-1">
                              {formatCurrency(currentOrder.total)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                            No active ticket
                          </span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {isServedAwaitingBill && (
                            <button
                              type="button"
                              onClick={() => setSettleOrderModal({ isOpen: true, order: currentOrder, table })}
                              className="h-8 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                              title="Settle Bill and Release Table"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              <span>Settle Bill</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedTable(table)}
                            className="h-8 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="View QR Stand"
                          >
                            <QrCode className="h-3.5 w-3.5" />
                            <span>QR Stand</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => copyQRLink(table)}
                            className="h-8 w-8 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-500/10 flex items-center justify-center transition-colors cursor-pointer"
                            title="Copy QR Link"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            onClick={() => handleDeleteTable(table.id, table.name)}
                            title="Delete Table"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      </div>

      {/* Selected Table QR Modal */}
      {selectedTable && (
        <Modal
          isOpen={!!selectedTable}
          onClose={() => setSelectedTable(null)}
          title={`${selectedTable.name} • Contactless Ordering QR`}
          description={`High-resolution QR code generated for ${tenantName}. Guests scan to open the live menu or trigger WhatsApp ordering.`}
        >
          <div className="flex flex-col items-center text-center p-4">
            {/* Target Selector: Web Menu vs WhatsApp Bot */}
            <div className="w-full mb-5 p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => setQrTarget("web")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  qrTarget === "web"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Globe className="h-3.5 w-3.5 text-emerald-500" />
                <span>Digital Web Menu</span>
              </button>
              <button
                type="button"
                onClick={() => setQrTarget("whatsapp")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  qrTarget === "whatsapp"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>WhatsApp Bot QR</span>
              </button>
            </div>

            {/* Authentic, High-Resolution Scannable QR Code */}
            <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200 shadow-xl relative group">
              <QRCodeImage
                value={getQRLink(selectedTable)}
                size={220}
                className="w-40 h-40 sm:w-56 sm:h-56 mx-auto"
              />
              <div className="mt-3 text-slate-900 font-extrabold text-sm tracking-tight">
                {selectedTable.name}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {qrTarget === "whatsapp" ? "Scan to Chat & Order on WhatsApp" : "Scan to Browse Menu & Order"}
              </div>
            </div>

            {/* Link Preview & Copy */}
            <div className="mt-4 w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-left">
              <span className="truncate font-mono text-[11px] text-slate-700 dark:text-slate-300 pr-2">
                {getQRLink(selectedTable)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 h-7 text-xs font-semibold"
                leftIcon={<Copy className="h-3.5 w-3.5" />}
                onClick={() => copyQRLink(selectedTable)}
              >
                Copy
              </Button>
            </div>

            {/* Quick Status Toggle */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Table Status:</span>
              <button
                onClick={() => handleToggleStatus(selectedTable, "available")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  selectedTable.status === "available"
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                Available
              </button>
              <button
                onClick={() => handleToggleStatus(selectedTable, "occupied")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  selectedTable.status === "occupied"
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                Occupied
              </button>
              <button
                onClick={() => handleToggleStatus(selectedTable, "reserved")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  selectedTable.status === "reserved"
                    ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                Reserved
              </button>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 w-full">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ExternalLink className="h-3.5 w-3.5" />}
                asChild
              >
                <a href={getQRLink(selectedTable)} target="_blank" rel="noreferrer">
                  Open Live {qrTarget === "whatsapp" ? "WhatsApp Bot" : "Menu"}
                </a>
              </Button>
              <Button
                variant="glow"
                size="sm"
                leftIcon={<Printer className="h-3.5 w-3.5" />}
                onClick={() => {
                  window.print();
                }}
              >
                Print Stand
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Table Modal */}
      <Modal
        isOpen={isAddTableOpen}
        onClose={() => setIsAddTableOpen(false)}
        title="Add Table to Dining Room"
        description={`Create a new table entry for ${tenantName}. A bespoke scannable QR code will be generated immediately.`}
      >
        <form onSubmit={handleAddTable} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Table Name / Number *
            </label>
            <input
              type="text"
              placeholder="e.g. Table 06, Booth 02, Terrace T1"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Seating Capacity
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={newTableSeats}
                onChange={(e) => setNewTableSeats(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Dining Zone
              </label>
              <input
                type="text"
                value={newTableZone}
                onChange={(e) => setNewTableZone(e.target.value)}
                placeholder="Main Dining"
                className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddTableOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="glow"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Generate Table & QR
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Print Package Modal */}
      {isPrintPackageOpen && (
        <Modal
          isOpen={isPrintPackageOpen}
          onClose={() => setIsPrintPackageOpen(false)}
          title={`Print QR Package • ${tenantName}`}
          description={`Print all ${tables.length} table stands formatted for luxury acrylic stands and table tent cards.`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto p-2">
              {tables.map((tbl) => (
                <div
                  key={tbl.id}
                  className="p-3 bg-white border border-slate-200 rounded-xl text-center text-slate-900 shadow-sm"
                >
                  <QRCodeImage
                    value={getQRLink(tbl)}
                    size={110}
                    className="w-24 h-24 mx-auto"
                  />
                  <div className="font-bold text-xs mt-2">{tbl.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{tbl.zone}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500">
                Tip: Press Print Sheet to send directly to your laser or thermal label printer.
              </span>
              <Button
                variant="glow"
                size="sm"
                leftIcon={<Printer className="h-4 w-4" />}
                onClick={() => window.print()}
              >
                Print Sheet
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reception / Manager Bill Settlement Modal */}
      {settleOrderModal.isOpen && settleOrderModal.order && (
        <SettleBillModal
          isOpen={settleOrderModal.isOpen}
          onClose={() => setSettleOrderModal({ isOpen: false, order: null, table: null })}
          order={settleOrderModal.order}
          table={settleOrderModal.table}
          onSuccess={() => {
            fetchTables?.();
          }}
        />
      )}
    </div>
  );
}
