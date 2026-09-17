"use client";

import * as React from "react";
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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { QRCodeImage } from "@/components/ui/qr-code-image";
import { useTenantData, TableItem, STARTER_TEMPLATES } from "@/lib/stores/tenant-data-store";

export default function TablesManagementPage() {
  const { addToast } = useToast();
  const {
    tenantName,
    tenantSlug,
    isDemoTenant,
    tables,
    addTable,
    updateTableStatus,
    deleteTable,
    applyStarterTemplate,
  } = useTenantData();

  const [selectedTable, setSelectedTable] = React.useState<TableItem | null>(null);
  const [filterZone, setFilterZone] = React.useState("all");

  // QR Mode: "web" for Digital Menu, "whatsapp" for Direct WhatsApp ordering
  const [qrTarget, setQrTarget] = React.useState<"web" | "whatsapp">("web");
  const [baseUrl, setBaseUrl] = React.useState("https://dineflow-steel.vercel.app");

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
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{tenantName} Contactless QR Ordering</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Tables & QR Codes
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Generate and manage instant digital menu QR codes for each table and zone in {tenantName}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {tables.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={handleDownloadAll}
            >
              Download All QRs
            </Button>
          )}
          <Button
            variant="glow"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsAddTableOpen(true)}
          >
            Add Table
          </Button>
        </div>
      </div>

      {/* Zone Filters */}
      {tables.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {zones.map((zone) => (
            <button
              key={zone}
              onClick={() => setFilterZone(zone)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer ${
                filterZone === zone
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white shadow-xs"
              }`}
            >
              {zone === "all" ? "All Locations" : zone}
            </button>
          ))}
        </div>
      )}

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
      ) : (
        /* Grid of Tables */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTables.map((table) => {
            const statusColors = {
              occupied: "border-amber-500/40 bg-amber-500/5",
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
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{table.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{table.zone}</p>
                  </div>
                  <Badge
                    variant={
                      table.status === "occupied"
                        ? "warning"
                        : table.status === "available"
                        ? "success"
                        : "neutral"
                    }
                    size="sm"
                    dot
                  >
                    {table.status}
                  </Badge>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span>{table.seats} Seats</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">{table.id}</span>
                </div>

                {/* Mini Preview Box */}
                <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <QrCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>View QR Stand</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
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
      )}

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
                className="w-40 h-40 xs:w-48 xs:h-48 sm:w-56 sm:h-56 mx-auto"
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
    </div>
  );
}
