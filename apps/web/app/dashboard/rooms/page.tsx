"use client";

import * as React from "react";
import {
  Hotel,
  Bed,
  Plus,
  Printer,
  Copy,
  ExternalLink,
  QrCode,
  ShieldCheck,
  Sparkles,
  Layers,
  Search,
  BellOff,
  CheckCircle,
  Users,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

interface RoomItem {
  id: string;
  name: string;
  roomNumber: string;
  floor: string;
  wing: string;
  type: "room" | "suite" | "penthouse" | "cabana";
  status: "occupied" | "available" | "cleaning";
  doNotDisturb: boolean;
  folioEnabled: boolean;
  activeGuest?: string;
}

const INITIAL_ROOMS: RoomItem[] = [
  { id: "rm-101", name: "Room 101", roomNumber: "101", floor: "Floor 1", wing: "East Wing", type: "room", status: "occupied", doNotDisturb: false, folioEnabled: true, activeGuest: "Aarav Sharma" },
  { id: "rm-102", name: "Room 102", roomNumber: "102", floor: "Floor 1", wing: "East Wing", type: "room", status: "available", doNotDisturb: false, folioEnabled: true },
  { id: "rm-201", name: "Deluxe Suite 201", roomNumber: "201", floor: "Floor 2", wing: "West Wing", type: "suite", status: "available", doNotDisturb: false, folioEnabled: true },
  { id: "rm-202", name: "Deluxe Suite 202", roomNumber: "202", floor: "Floor 2", wing: "West Wing", type: "suite", status: "occupied", doNotDisturb: true, folioEnabled: true, activeGuest: "Priya & Rohan" },
  { id: "rm-301", name: "Executive Suite 301", roomNumber: "301", floor: "Floor 3", wing: "Lakeview", type: "suite", status: "available", doNotDisturb: false, folioEnabled: true },
  { id: "rm-302", name: "Presidential Suite 302", roomNumber: "302", floor: "Floor 3", wing: "Lakeview", type: "suite", status: "occupied", doNotDisturb: false, folioEnabled: true, activeGuest: "Dr. Vikram Seth" },
  { id: "rm-ph1", name: "Skyline Penthouse PH-1", roomNumber: "PH-1", floor: "Penthouse", wing: "Rooftop", type: "penthouse", status: "occupied", doNotDisturb: false, folioEnabled: true, activeGuest: "Ambassador Laurent" },
  { id: "cb-01", name: "Poolside Cabana 01", roomNumber: "CAB-1", floor: "Ground", wing: "Poolside", type: "cabana", status: "available", doNotDisturb: false, folioEnabled: true },
];

export default function RoomsDirectoryPage() {
  const { addToast } = useToast();
  const [rooms, setRooms] = React.useState<RoomItem[]>(INITIAL_ROOMS);
  const [floorFilter, setFloorFilter] = React.useState("all");
  const [wingFilter, setWingFilter] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Modals
  const [selectedRoom, setSelectedRoom] = React.useState<RoomItem | null>(null);
  const [isAddRoomOpen, setIsAddRoomOpen] = React.useState(false);
  const [isBulkOpen, setIsBulkOpen] = React.useState(false);
  const [isPrintAllOpen, setIsPrintAllOpen] = React.useState(false);

  // Single Add Form
  const [newRoomName, setNewRoomName] = React.useState("");
  const [newRoomNumber, setNewRoomNumber] = React.useState("");
  const [newRoomFloor, setNewRoomFloor] = React.useState("Floor 3");
  const [newRoomWing, setNewRoomWing] = React.useState("Lakeview");
  const [newRoomType, setNewRoomType] = React.useState<RoomItem["type"]>("suite");

  // Bulk Form
  const [bulkStart, setBulkStart] = React.useState("301");
  const [bulkEnd, setBulkEnd] = React.useState("310");
  const [bulkFloor, setBulkFloor] = React.useState("Floor 3");
  const [bulkWing, setBulkWing] = React.useState("East Wing");

  const floors = ["all", "Floor 1", "Floor 2", "Floor 3", "Penthouse", "Ground"];
  const wings = ["all", "East Wing", "West Wing", "Lakeview", "Poolside"];

  const handleToggleDND = (id: string, current: boolean) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, doNotDisturb: !current } : r))
    );
    addToast(
      "info",
      "Do Not Disturb Updated",
      !current ? "Room marked DND (stewards alerted not to knock)." : "DND flag cleared for this room."
    );
  };

  const handleAddSingleRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber.trim()) return;

    const newEntry: RoomItem = {
      id: `rm-${newRoomNumber.toLowerCase()}`,
      name: newRoomName.trim() || `Suite ${newRoomNumber}`,
      roomNumber: newRoomNumber.trim(),
      floor: newRoomFloor,
      wing: newRoomWing,
      type: newRoomType,
      status: "available",
      doNotDisturb: false,
      folioEnabled: true,
    };

    setRooms([...rooms, newEntry]);
    setIsAddRoomOpen(false);
    setNewRoomNumber("");
    setNewRoomName("");
    addToast("success", "Room Created", `${newEntry.name} added to the hotel directory.`);
  };

  const handleBulkCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const start = parseInt(bulkStart);
    const end = parseInt(bulkEnd);
    if (isNaN(start) || isNaN(end) || end < start) {
      addToast("error", "Invalid Range", "Start number must be less than or equal to End number.");
      return;
    }

    const created: RoomItem[] = [];
    for (let num = start; num <= end; num++) {
      const rStr = `${num}`;
      created.push({
        id: `rm-${rStr}`,
        name: `Room ${rStr}`,
        roomNumber: rStr,
        floor: bulkFloor,
        wing: bulkWing,
        type: "room",
        status: "available",
        doNotDisturb: false,
        folioEnabled: true,
      });
    }

    setRooms([...rooms, ...created]);
    setIsBulkOpen(false);
    addToast("success", "Batch Generation Complete", `Created ${created.length} rooms on ${bulkFloor}.`);
  };

  const getRoomQRURL = (room: RoomItem) => {
    return `http://localhost:3000/m/the-grand-bistro/room/${room.roomNumber.toLowerCase()}`;
  };

  const filteredRooms = rooms.filter((r) => {
    if (floorFilter !== "all" && r.floor !== floorFilter) return false;
    if (wingFilter !== "all" && r.wing !== wingFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.roomNumber.toLowerCase().includes(q) ||
        (r.activeGuest && r.activeGuest.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-2">
            <Hotel className="h-3.5 w-3.5" /> Hotel Pro Enterprise Module
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Guest Rooms & In-Room Dining
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Manage suites, print luxury acrylic tent cards with concierge dial, and track room service orders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Printer className="h-4 w-4" />}
            onClick={() => setIsPrintAllOpen(true)}
          >
            Print In-Room Stands
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Layers className="h-4 w-4" />}
            onClick={() => setIsBulkOpen(true)}
          >
            Bulk Room Generator
          </Button>

          <Button
            variant="glow"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsAddRoomOpen(true)}
          >
            Add Room / Suite
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {floors.map((f) => (
            <button
              key={f}
              onClick={() => setFloorFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                floorFilter === f
                  ? "bg-emerald-500 text-slate-950 shadow"
                  : "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              {f === "all" ? "All Floors" : f}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search suite number, guest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Grid of Hotel Rooms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredRooms.map((room) => {
          const isOccupied = room.status === "occupied";

          return (
            <Card
              key={room.id}
              variant="glass"
              hoverEffect
              className={`border cursor-pointer transition-all ${
                room.doNotDisturb
                  ? "border-rose-500/50 bg-rose-500/5"
                  : isOccupied
                  ? "border-amber-500/40 bg-amber-500/5"
                  : "border-slate-200 dark:border-slate-800"
              }`}
              onClick={() => setSelectedRoom(room)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{room.name}</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {room.floor} • {room.wing}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant={isOccupied ? "warning" : "success"}
                    size="sm"
                    dot
                  >
                    {isOccupied ? "Guest In-House" : "Clean & Ready"}
                  </Badge>

                  {room.doNotDisturb && (
                    <Badge variant="danger" size="sm" className="text-[10px]">
                      DND Active
                    </Badge>
                  )}
                </div>
              </div>

              {/* Guest In-House pill */}
              {room.activeGuest && (
                <div className="mt-3 p-2 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <Users className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{room.activeGuest}</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">Folio OK</span>
                </div>
              )}

              {/* Room Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleDND(room.id, room.doNotDisturb);
                  }}
                  className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                    room.doNotDisturb ? "text-rose-600 dark:text-rose-400" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <BellOff className="h-3 w-3" />
                  <span>{room.doNotDisturb ? "Cancel DND" : "Set DND"}</span>
                </button>

                <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold hover:underline">
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Tent QR</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Selected Room Tent Card Modal */}
      {selectedRoom && (
        <Modal
          isOpen={!!selectedRoom}
          onClose={() => setSelectedRoom(null)}
          title={`${selectedRoom.name} — In-Room Stand`}
          description={`Direct In-Room Dining link for ${selectedRoom.floor}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Copy className="h-4 w-4" />}
                onClick={() => {
                  navigator.clipboard?.writeText(getRoomQRURL(selectedRoom));
                  addToast("info", "Link Copied", "Guest QR link copied.");
                }}
              >
                Copy URL
              </Button>

              <div className="flex items-center gap-2">
                <a
                  href={getRoomQRURL(selectedRoom)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open In-Room Menu</span>
                </a>
                <Button
                  variant="glow"
                  size="sm"
                  leftIcon={<Printer className="h-4 w-4" />}
                  onClick={() => window.print()}
                >
                  Print Tent Card
                </Button>
              </div>
            </div>
          }
        >
          <div className="flex flex-col items-center justify-center p-6 bg-slate-100/80 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 my-2">
            {/* Luxury Acrylic Room Tent Card */}
            <div className="p-6 bg-white rounded-3xl shadow-2xl flex flex-col items-center max-w-xs text-slate-950 border border-slate-200">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                The Grand Palace & Spa
              </span>
              <h3 className="text-xl font-black mt-0.5 mb-1">{selectedRoom.name}</h3>
              <p className="text-[11px] text-slate-500 font-medium mb-3">
                In-Room Dining & 24h Concierge
              </p>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <QrCode className="h-36 w-36 text-slate-900" />
              </div>

              <span className="text-xs font-bold mt-3 text-slate-900">
                Scan for Private Suite Service
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 text-center">
                Breakfast • All-Day Dining • Late Night
              </span>
              <span className="text-[9px] text-emerald-800 font-semibold mt-2">
                Wi-Fi: GrandPalace_Guest | Ext: 0
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-4 text-center font-mono">
              {getRoomQRURL(selectedRoom)}
            </p>
          </div>
        </Modal>
      )}

      {/* Bulk Generator Modal */}
      <Modal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        title="Batch Generate Hotel Rooms"
        description="Quickly generate a contiguous range of guest rooms for an entire floor."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setIsBulkOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="bulk-room-form" variant="glow" size="sm">
              Generate Rooms & QRs
            </Button>
          </div>
        }
      >
        <form id="bulk-room-form" onSubmit={handleBulkCreate} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Start Room # *
              </label>
              <input
                type="number"
                required
                value={bulkStart}
                onChange={(e) => setBulkStart(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                End Room # *
              </label>
              <input
                type="number"
                required
                value={bulkEnd}
                onChange={(e) => setBulkEnd(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Floor *
              </label>
              <input
                type="text"
                required
                value={bulkFloor}
                onChange={(e) => setBulkFloor(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Wing / Section
              </label>
              <input
                type="text"
                value={bulkWing}
                onChange={(e) => setBulkWing(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Add Single Room Modal */}
      <Modal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        title="Add Single Room or Suite"
        description="Register an individual guest suite or cabana with room service QR code."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setIsAddRoomOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="single-room-form" variant="glow" size="sm">
              Save & Generate QR
            </Button>
          </div>
        }
      >
        <form id="single-room-form" onSubmit={handleAddSingleRoom} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Room Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 402 or PH-2"
                value={newRoomNumber}
                onChange={(e) => setNewRoomNumber(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Type
              </label>
              <select
                value={newRoomType}
                onChange={(e) => setNewRoomType(e.target.value as RoomItem["type"])}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="room">Standard Room</option>
                <option value="suite">Executive Suite</option>
                <option value="penthouse">Penthouse</option>
                <option value="cabana">Poolside Cabana</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Display Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Royal Lakeview Suite 402"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Floor
              </label>
              <input
                type="text"
                value={newRoomFloor}
                onChange={(e) => setNewRoomFloor(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Wing
              </label>
              <input
                type="text"
                value={newRoomWing}
                onChange={(e) => setNewRoomWing(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Print All In-Room Stands Sheet Modal */}
      {isPrintAllOpen && (
        <Modal
          isOpen={isPrintAllOpen}
          onClose={() => setIsPrintAllOpen(false)}
          title="Print All In-Room Stands (A4 Package)"
          description="High-resolution guest suite tent cards ready to print for housekeeping and room setup."
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="ghost" size="sm" onClick={() => setIsPrintAllOpen(false)}>
                Close
              </Button>
              <Button
                variant="glow"
                size="sm"
                leftIcon={<Printer className="h-4 w-4" />}
                onClick={() => window.print()}
              >
                Print All Tent Cards
              </Button>
            </div>
          }
        >
          <div className="max-h-[60vh] overflow-y-auto p-2">
            <div className="grid grid-cols-2 gap-4">
              {rooms.map((r) => (
                <div
                  key={r.id}
                  className="p-4 bg-white rounded-2xl shadow border border-slate-300 flex flex-col items-center text-slate-950 text-center"
                >
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700">
                    The Grand Palace & Spa
                  </span>
                  <h4 className="text-sm font-black mt-0.5 mb-2">{r.name}</h4>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <QrCode className="h-24 w-24 text-slate-900" />
                  </div>
                  <span className="text-[10px] font-bold mt-2 text-slate-800">
                    In-Room Dining & Concierge
                  </span>
                  <span className="text-[8px] text-slate-500 font-mono mt-0.5">
                    {r.floor} • {r.wing}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
