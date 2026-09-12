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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

interface TableItem {
  id: string;
  name: string;
  seats: number;
  zone: string;
  status: "occupied" | "available" | "reserved";
  orderId?: string;
}

const INITIAL_TABLES: TableItem[] = [
  { id: "T-01", name: "Table 01", seats: 2, zone: "Main Dining", status: "occupied", orderId: "ORD-9417" },
  { id: "T-02", name: "Table 02", seats: 4, zone: "Main Dining", status: "occupied", orderId: "ORD-9421" },
  { id: "T-03", name: "Table 03", seats: 4, zone: "Main Dining", status: "available" },
  { id: "T-04", name: "Table 04", seats: 6, zone: "Patio Terrace", status: "occupied", orderId: "ORD-9418" },
  { id: "T-05", name: "Table 05", seats: 2, zone: "Patio Terrace", status: "available" },
  { id: "R-301", name: "Room 301", seats: 2, zone: "Hotel Suites", status: "available" },
  { id: "R-302", name: "Room 302", seats: 4, zone: "Hotel Suites", status: "occupied", orderId: "ORD-9419" },
  { id: "R-303", name: "Room 303", seats: 2, zone: "Hotel Suites", status: "reserved" },
];

export default function TablesPage() {
  const { addToast } = useToast();
  const [tables, setTables] = React.useState<TableItem[]>(INITIAL_TABLES);
  const [selectedTable, setSelectedTable] = React.useState<TableItem | null>(null);
  const [filterZone, setFilterZone] = React.useState("all");

  // New Table Modal
  const [isAddTableOpen, setIsAddTableOpen] = React.useState(false);
  const [newTableName, setNewTableName] = React.useState("");
  const [newTableSeats, setNewTableSeats] = React.useState("4");
  const [newTableZone, setNewTableZone] = React.useState("Main Dining");

  // Print Package Modal
  const [isPrintPackageOpen, setIsPrintPackageOpen] = React.useState(false);

  const zones = ["all", "Main Dining", "Patio Terrace", "Hotel Suites"];

  const handleDownloadAll = () => {
    setIsPrintPackageOpen(true);
  };

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;

    const newId = newTableName.toUpperCase().replace(/\s+/g, "-");
    const newEntry: TableItem = {
      id: newId,
      name: newTableName.trim(),
      seats: parseInt(newTableSeats) || 2,
      zone: newTableZone,
      status: "available",
    };

    setTables([...tables, newEntry]);
    setIsAddTableOpen(false);
    setNewTableName("");
    addToast(
      "success",
      "Location Created",
      `${newEntry.name} added with dynamic QR code ready for customer ordering.`
    );
  };

  const getQRLink = (table: TableItem) => {
    return `http://localhost:3000/m/the-grand-bistro/${table.id.toLowerCase()}`;
  };

  const copyQRLink = (table: TableItem) => {
    navigator.clipboard?.writeText(getQRLink(table));
    addToast("info", "Link Copied", "Direct customer ordering link copied to clipboard.");
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Contactless QR Digital Ordering
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Tables & Hotel Rooms
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Generate and manage instant digital menu QR codes for each table, suite, and zone.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleDownloadAll}
          >
            Download All QRs
          </Button>
          <Button
            variant="glow"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsAddTableOpen(true)}
          >
            Add Table / Room
          </Button>
        </div>
      </div>

      {/* Zone Filters */}
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

      {/* Grid of Tables */}
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

              {table.orderId && (
                <div className="mt-3 text-[11px] font-mono text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 inline-block font-semibold">
                  Active: {table.orderId}
                </div>
              )}

              <div className="mt-5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 pt-3">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-slate-500" />
                  <span className="font-medium">{table.seats} Seats</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold hover:underline">
                  <QrCode className="h-3.5 w-3.5" /> View QR
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Table QR Stand Preview & Print Modal */}
      {selectedTable && (
        <Modal
          isOpen={!!selectedTable}
          onClose={() => setSelectedTable(null)}
          title={`${selectedTable.name} — QR Stand`}
          description={`Direct QR order link for ${selectedTable.zone}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Copy className="h-4 w-4" />}
                onClick={() => copyQRLink(selectedTable)}
              >
                Copy Menu URL
              </Button>
              <div className="flex items-center gap-2">
                <a
                  href={getQRLink(selectedTable)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white dark:border-transparent transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open Customer View</span>
                </a>
                <Button
                  variant="glow"
                  size="sm"
                  leftIcon={<Printer className="h-4 w-4" />}
                  onClick={() => {
                    window.print();
                  }}
                >
                  Print Acrylic Stand
                </Button>
              </div>
            </div>
          }
        >
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 my-2">
            {/* Elegant Table Stand Card representation */}
            <div className="p-6 bg-white rounded-3xl shadow-2xl flex flex-col items-center max-w-xs text-slate-950 border border-slate-200">
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600">
                The Grand Bistro
              </span>
              <h4 className="text-xl font-black mt-0.5 mb-3">{selectedTable.name}</h4>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <QrCode className="h-40 w-40 text-slate-900" />
              </div>

              <span className="text-xs font-bold mt-3 text-slate-900">
                Scan to Order & Pay
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 text-center">
                No app installation required
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mt-4 text-center font-mono">
              {getQRLink(selectedTable)}
            </p>
          </div>
        </Modal>
      )}

      {/* Print All QR Stands Package Modal */}
      {isPrintPackageOpen && (
        <Modal
          isOpen={isPrintPackageOpen}
          onClose={() => setIsPrintPackageOpen(false)}
          title="Print QR Stands Package"
          description="High-resolution acrylic table stand inserts ready to print for all dining locations."
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="ghost" size="sm" onClick={() => setIsPrintPackageOpen(false)}>
                Close
              </Button>
              <Button
                variant="glow"
                size="sm"
                leftIcon={<Printer className="h-4 w-4" />}
                onClick={() => window.print()}
              >
                Print Stand Sheet (A4 / Letter)
              </Button>
            </div>
          }
        >
          <div className="max-h-[60vh] overflow-y-auto p-2">
            <div className="grid grid-cols-2 gap-4">
              {tables.map((t) => (
                <div
                  key={t.id}
                  className="p-4 bg-white rounded-2xl shadow border border-slate-300 flex flex-col items-center text-slate-950 text-center"
                >
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">
                    The Grand Bistro
                  </span>
                  <h5 className="text-sm font-black mt-0.5 mb-2">{t.name}</h5>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <QrCode className="h-24 w-24 text-slate-900" />
                  </div>
                  <span className="text-[10px] font-bold mt-2 text-slate-800">
                    Scan to Order
                  </span>
                  <span className="text-[8px] text-slate-400 font-mono mt-0.5">
                    {t.zone} • {t.seats} Seats
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Add Table / Room Modal */}
      <Modal
        isOpen={isAddTableOpen}
        onClose={() => setIsAddTableOpen(false)}
        title="Add Table or Hotel Room"
        description="Create a new dine-in table, outdoor cabana, or hotel room for QR ordering."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddTableOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-table-form"
              variant="glow"
              size="sm"
            >
              Generate QR & Add Location
            </Button>
          </div>
        }
      >
        <form id="add-table-form" onSubmit={handleAddTable} className="space-y-4 py-2">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Table / Room Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Table 06 or Suite 402"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Zone / Section *
              </label>
              <select
                value={newTableZone}
                onChange={(e) => setNewTableZone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs"
              >
                <option value="Main Dining">Main Dining</option>
                <option value="Patio Terrace">Patio Terrace</option>
                <option value="Hotel Suites">Hotel Suites</option>
                <option value="Rooftop Lounge">Rooftop Lounge</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Seating Capacity
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={newTableSeats}
                onChange={(e) => setNewTableSeats(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono shadow-xs"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
