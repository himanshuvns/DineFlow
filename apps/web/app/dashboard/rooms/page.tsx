"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
  CheckCircle2,
  Trash2,
  Edit3,
  UtensilsCrossed,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { QRCodeImage } from "@/components/ui/qr-code-image";
import { useAuthStore } from "@/lib/stores/auth-store";
import { apiClient } from "@/lib/api";

interface RoomItem {
  id: string;
  name: string;
  roomNumber: string;
  floor: string;
  wing: string;
  type: string;
  status: "vacant" | "occupied" | "reserved" | "cleaning" | "maintenance" | "out_of_service";
  doNotDisturb: boolean;
  folioEnabled: boolean;
  activeGuest?: string;
  currentGuestName?: string;
  currentGuestPhone?: string;
  amenities?: string[];
}

interface HotelStats {
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  cleaningRooms: number;
  maintenanceRooms: number;
  occupancyRate: number;
  checkInsToday: number;
  checkOutsToday: number;
  pendingRoomService: number;
  activeHousekeepingTasks: number;
}

export default function RoomsDirectoryPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { tenant } = useAuthStore();
  const tenantSlug = tenant?.slug || "dineflow";
  const tenantName = tenant?.name || "Your Hotel & Suites";

  const [rooms, setRooms] = React.useState<RoomItem[]>([]);
  const [stats, setStats] = React.useState<HotelStats>({
    totalRooms: 0,
    occupiedRooms: 0,
    vacantRooms: 0,
    cleaningRooms: 0,
    maintenanceRooms: 0,
    occupancyRate: 0,
    checkInsToday: 0,
    checkOutsToday: 0,
    pendingRoomService: 0,
    activeHousekeepingTasks: 0,
  });

  const [floorFilter, setFloorFilter] = React.useState("all");
  const [wingFilter, setWingFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Modals
  const [selectedRoom, setSelectedRoom] = React.useState<RoomItem | null>(null);
  const [isAddRoomOpen, setIsAddRoomOpen] = React.useState(false);
  const [isBulkOpen, setIsBulkOpen] = React.useState(false);
  const [isPrintAllOpen, setIsPrintAllOpen] = React.useState(false);

  // CheckIn Modal
  const [checkInRoom, setCheckInRoom] = React.useState<RoomItem | null>(null);
  const [guestName, setGuestName] = React.useState("");
  const [guestPhone, setGuestPhone] = React.useState("");
  const [guestEmail, setGuestEmail] = React.useState("");
  const [guestIdProof, setGuestIdProof] = React.useState("Passport");
  const [specialRequests, setSpecialRequests] = React.useState("");

  // CheckOut Modal
  const [checkOutRoom, setCheckOutRoom] = React.useState<RoomItem | null>(null);

  // Edit Room Modal
  const [editingRoom, setEditingRoom] = React.useState<RoomItem | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editType, setEditType] = React.useState("suite");
  const [editFloor, setEditFloor] = React.useState("Floor 2");
  const [editWing, setEditWing] = React.useState("East Wing");

  const [baseUrl, setBaseUrl] = React.useState("https://dineflow-steel.vercel.app");

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.location.origin) {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const fetchRooms = React.useCallback(async () => {
    try {
      const [roomsRes, statsRes] = await Promise.allSettled([
        apiClient.get("/rooms"),
        apiClient.get("/rooms/stats"),
      ]);

      if (roomsRes.status === "fulfilled" && Array.isArray(roomsRes.value.data?.data)) {
        const loaded = roomsRes.value.data.data.map((r: any) => ({
          id: r.id || r._id,
          name: r.name || `Room ${r.roomNumber}`,
          roomNumber: r.roomNumber || "",
          floor: r.floor || "Floor 1",
          wing: r.wing || "Main",
          type: r.roomType || r.type || "room",
          status: r.status === "available" ? "vacant" : (r.status || "vacant"),
          doNotDisturb: Boolean(r.doNotDisturb),
          folioEnabled: r.folioEnabled !== false,
          activeGuest: r.currentGuestName || r.activeGuest || undefined,
          currentGuestName: r.currentGuestName,
          currentGuestPhone: r.currentGuestPhone,
          amenities: Array.isArray(r.amenities) ? r.amenities : [],
        }));
        setRooms(loaded);
      }

      if (statsRes.status === "fulfilled" && statsRes.value.data?.data) {
        setStats(statsRes.value.data.data);
      }
    } catch (e) {
      console.warn("Rooms fetch error:", e);
    }
  }, []);

  React.useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Single Add Form
  const [newRoomName, setNewRoomName] = React.useState("");
  const [newRoomNumber, setNewRoomNumber] = React.useState("");
  const [newRoomFloor, setNewRoomFloor] = React.useState("Floor 3");
  const [newRoomWing, setNewRoomWing] = React.useState("Lakeview");
  const [newRoomType, setNewRoomType] = React.useState("suite");

  // Bulk Form
  const [bulkStart, setBulkStart] = React.useState("301");
  const [bulkEnd, setBulkEnd] = React.useState("310");
  const [bulkFloor, setBulkFloor] = React.useState("Floor 3");
  const [bulkWing, setBulkWing] = React.useState("East Wing");

  const floors = ["all", "Floor 1", "Floor 2", "Floor 3", "Penthouse", "Ground"];
  const wings = ["all", "East Wing", "West Wing", "Lakeview", "Poolside"];
  const statuses = ["all", "vacant", "occupied", "cleaning", "maintenance"];

  const handleToggleDND = async (id: string, current: boolean) => {
    try {
      await apiClient.patch(`/rooms/${encodeURIComponent(id)}/dnd`, { doNotDisturb: !current });
    } catch (e) {
      console.warn("DND toggle api error:", e);
    }
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, doNotDisturb: !current } : r))
    );
    addToast(
      "info",
      "Do Not Disturb Updated",
      !current ? "Room marked DND (stewards alerted not to knock)." : "DND flag cleared for this room."
    );
  };

  const handleAddSingleRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber.trim()) return;

    const roomName = newRoomName.trim() || `Suite ${newRoomNumber}`;

    try {
      await apiClient.post("/rooms", {
        name: roomName,
        roomNumber: newRoomNumber.trim(),
        floor: newRoomFloor,
        wing: newRoomWing,
        roomType: newRoomType,
        capacity: 2,
        folioEnabled: true,
        amenities: ["King Bed", "High-Speed Wi-Fi", "En-Suite Bath", "Mini Bar"],
      });
      addToast("success", "Room Created", `${roomName} added to the hotel directory.`);
      setIsAddRoomOpen(false);
      setNewRoomNumber("");
      setNewRoomName("");
      fetchRooms();
    } catch (e: any) {
      addToast("error", "Failed to Add Room", e?.response?.data?.message || "Could not save room.");
    }
  };

  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const start = parseInt(bulkStart);
    const end = parseInt(bulkEnd);
    if (isNaN(start) || isNaN(end) || end < start) {
      addToast("error", "Invalid Range", "Start number must be less than or equal to End number.");
      return;
    }

    try {
      await apiClient.post("/rooms/bulk", {
        startRoom: start,
        endRoom: end,
        floor: bulkFloor,
        wing: bulkWing,
        type: "room",
      });
      addToast("success", "Batch Generation Complete", `Created rooms on ${bulkFloor}.`);
      setIsBulkOpen(false);
      fetchRooms();
    } catch (e: any) {
      addToast("error", "Batch Failed", e?.response?.data?.message || "Could not generate rooms.");
    }
  };

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInRoom || !guestName.trim() || !guestPhone.trim()) return;

    try {
      await apiClient.post(`/rooms/${encodeURIComponent(checkInRoom.id)}/check-in`, {
        name: guestName.trim(),
        phone: guestPhone.trim(),
        email: guestEmail.trim(),
        idProofType: guestIdProof,
        specialRequests: specialRequests.trim(),
      });

      addToast("success", "Guest Checked In", `${guestName} is now in-house in ${checkInRoom.name}.`);
      setCheckInRoom(null);
      setGuestName("");
      setGuestPhone("");
      setGuestEmail("");
      fetchRooms();
    } catch (e: any) {
      addToast("error", "Check-In Failed", e?.response?.data?.message || "Could not check in guest.");
    }
  };

  const handleCheckOutSubmit = async () => {
    if (!checkOutRoom) return;

    try {
      await apiClient.post(`/rooms/${encodeURIComponent(checkOutRoom.id)}/check-out`, {});
      addToast("success", "Guest Checked Out", `${checkOutRoom.name} marked for Housekeeping cleaning.`);
      setCheckOutRoom(null);
      fetchRooms();
    } catch (e: any) {
      addToast("error", "Check-Out Failed", e?.response?.data?.message || "Could not check out.");
    }
  };

  const handleMarkClean = async (id: string, name: string) => {
    try {
      await apiClient.patch(`/rooms/${encodeURIComponent(id)}/status`, { status: "vacant" });
      addToast("success", "Room Clean & Ready", `${name} is now vacant and ready for next guest.`);
      fetchRooms();
    } catch (e) {
      console.warn("Status update error:", e);
    }
  };

  const handleDeleteRoom = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await apiClient.delete(`/rooms/${encodeURIComponent(id)}`);
      addToast("info", "Room Deleted", `${name} has been removed.`);
      fetchRooms();
    } catch (e) {
      console.warn("Delete room error:", e);
    }
  };

  const getRoomQRURL = (room: RoomItem) => {
    return `${baseUrl}/m/${tenantSlug}/room/${room.roomNumber.toLowerCase()}`;
  };

  const filteredRooms = rooms.filter((r) => {
    if (floorFilter !== "all" && r.floor !== floorFilter) return false;
    if (wingFilter !== "all" && r.wing !== wingFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
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
    <div className="space-y-6 pb-20">
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
            Manage hotel suites, guest check-ins, housekeeping sanitization, and luxury acrylic in-room QR tent stands.
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

      {/* Hotel PMS KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card variant="glass" className="p-3.5 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Occupied Rooms
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {stats.occupiedRooms || rooms.filter((r) => r.status === "occupied").length}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {Math.round(stats.occupancyRate || 0)}% Occ
            </span>
          </div>
        </Card>

        <Card variant="glass" className="p-3.5 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Clean & Ready
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {stats.vacantRooms || rooms.filter((r) => r.status === "vacant").length}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Vacant</span>
          </div>
        </Card>

        <Card variant="glass" className="p-3.5 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Housekeeping
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {stats.cleaningRooms || rooms.filter((r) => r.status === "cleaning").length}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Cleaning</span>
          </div>
        </Card>

        <Card variant="glass" className="p-3.5 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Check-Ins Today
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
              {stats.checkInsToday || 0}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Arrivals</span>
          </div>
        </Card>

        <Card variant="glass" className="p-3.5 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Pending In-Room Dining
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-emerald-500 font-mono">
              {stats.pendingRoomService || 0}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Active</span>
          </div>
        </Card>
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

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-800 shrink-0 mx-1" />

          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors capitalize ${
                statusFilter === s
                  ? "bg-cyan-500 text-slate-950 shadow"
                  : "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              {s === "all" ? "All Statuses" : s}
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
          const isCleaning = room.status === "cleaning";

          return (
            <Card
              key={room.id}
              variant="glass"
              hoverEffect
              className={`border transition-all flex flex-col justify-between ${
                room.doNotDisturb
                  ? "border-rose-500/50 bg-rose-500/5"
                  : isOccupied
                  ? "border-amber-500/40 bg-amber-500/5"
                  : isCleaning
                  ? "border-cyan-500/40 bg-cyan-500/5"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-lg font-black text-slate-900 dark:text-white">{room.name}</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {room.floor} • {room.wing}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant={isOccupied ? "warning" : isCleaning ? "danger" : "success"}
                      size="sm"
                      dot
                    >
                      {isOccupied ? "Guest In-House" : isCleaning ? "Cleaning" : "Clean & Ready"}
                    </Badge>

                    {room.doNotDisturb && (
                      <Badge variant="danger" size="sm" className="text-[10px]">
                        DND Active
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Guest In-House pill */}
                {isOccupied && (room.activeGuest || room.currentGuestName) ? (
                  <div className="mt-3 p-2 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <Users className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                        {room.activeGuest || room.currentGuestName}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                      Folio OK
                    </span>
                  </div>
                ) : isCleaning ? (
                  <div className="mt-3 p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs flex items-center justify-between text-cyan-800 dark:text-cyan-300">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                      <span className="font-semibold text-[11px]">Housekeeping Sanitizing</span>
                    </div>
                    <button
                      onClick={() => handleMarkClean(room.id, room.name)}
                      className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 underline"
                    >
                      Mark Ready
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between text-slate-500">
                    <span className="text-[11px]">Suite vacant & available</span>
                    <button
                      onClick={() => {
                        setCheckInRoom(room);
                        setGuestName("");
                        setGuestPhone("");
                      }}
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Check-In
                    </button>
                  </div>
                )}
              </div>

              {/* Room Card Action Controls */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <button
                    type="button"
                    onClick={() => handleToggleDND(room.id, room.doNotDisturb)}
                    className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                      room.doNotDisturb
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <BellOff className="h-3 w-3" />
                    <span>{room.doNotDisturb ? "Cancel DND" : "Set DND"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRoom(room)}
                    className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold hover:underline text-[11px]"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    <span>Tent QR</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-1 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] px-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    onClick={() => router.push(`/dashboard/rooms/${room.id}`)}
                  >
                    <span>Manage Suite</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>

                  {isOccupied ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[10px] px-2 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                      onClick={() => setCheckOutRoom(room)}
                    >
                      Check-Out
                    </Button>
                  ) : isCleaning ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 text-[10px] px-2 text-emerald-600 dark:text-emerald-400"
                      onClick={() => handleMarkClean(room.id, room.name)}
                    >
                      Ready
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 text-[10px] px-2 text-emerald-600 dark:text-emerald-400"
                      onClick={() => {
                        setCheckInRoom(room);
                        setGuestName("");
                        setGuestPhone("");
                      }}
                    >
                      Check-In
                    </Button>
                  )}
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                leftIcon={<Copy className="h-3.5 w-3.5" />}
                onClick={() => {
                  navigator.clipboard?.writeText(getRoomQRURL(selectedRoom));
                  addToast("info", "Link Copied", "Room dining URL copied to clipboard.");
                }}
              >
                Copy Menu Link
              </Button>

              <div className="flex items-center gap-2">
                <a
                  href={getRoomQRURL(selectedRoom)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:text-slate-950 dark:hover:text-white flex items-center gap-1"
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
                {tenantName}
              </span>
              <h3 className="text-xl font-black mt-0.5 mb-1">{selectedRoom.name}</h3>
              <p className="text-[11px] text-slate-500 font-medium mb-3">
                In-Room Dining & 24h Concierge
              </p>

              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
                <QRCodeImage
                  value={getRoomQRURL(selectedRoom)}
                  size={144}
                  alt={`${selectedRoom.name} QR Code`}
                />
              </div>

              <span className="text-xs font-bold mt-3 text-slate-900">
                Scan for Private Suite Service
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 text-center">
                Breakfast • All-Day Dining • Late Night
              </span>
              <span className="text-[9px] text-emerald-800 font-semibold mt-2">
                Silver Tray Delivery to Your Door
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-4 text-center font-mono">
              {getRoomQRURL(selectedRoom)}
            </p>
          </div>
        </Modal>
      )}

      {/* Guest Check-In Modal */}
      {checkInRoom && (
        <Modal
          isOpen={!!checkInRoom}
          onClose={() => setCheckInRoom(null)}
          title={`Guest Check-In — ${checkInRoom.name}`}
          description="Register in-house guest details and activate room dining folio."
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="ghost" size="sm" onClick={() => setCheckInRoom(null)}>
                Cancel
              </Button>
              <Button type="submit" form="checkin-modal-form" variant="glow" size="sm">
                Confirm Check-In
              </Button>
            </div>
          }
        >
          <form id="checkin-modal-form" onSubmit={handleCheckInSubmit} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Guest Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Arjun Kapoor"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="guest@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  ID Proof Type
                </label>
                <select
                  value={guestIdProof}
                  onChange={(e) => setGuestIdProof(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                  <option value="National ID">National ID / Aadhaar</option>
                  <option value="Corporate ID">Corporate ID</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Special Requests
                </label>
                <input
                  type="text"
                  placeholder="e.g. High floor, extra towels"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Guest Check-Out Modal */}
      {checkOutRoom && (
        <Modal
          isOpen={!!checkOutRoom}
          onClose={() => setCheckOutRoom(null)}
          title={`Confirm Check-Out — ${checkOutRoom.name}`}
          description="Settle guest folio and dispatch housekeeping cleaning."
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="ghost" size="sm" onClick={() => setCheckOutRoom(null)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleCheckOutSubmit}>
                Complete Check-Out
              </Button>
            </div>
          }
        >
          <div className="py-3 space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300">
              <p className="font-bold">In-House Guest: {checkOutRoom.activeGuest || checkOutRoom.currentGuestName}</p>
              <p className="text-[11px] mt-0.5">
                Checking out will complete the stay, clear active guest credentials, and mark this suite as{" "}
                <strong>Cleaning</strong> so housekeeping stewards are automatically dispatched.
              </p>
            </div>
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
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
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
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Floor Designation
              </label>
              <input
                type="text"
                value={bulkFloor}
                onChange={(e) => setBulkFloor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
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
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Add Single Room Modal */}
      <Modal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        title="Add Single Room / Luxury Suite"
        description="Register an individual room, suite, or cabana in the property management system."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setIsAddRoomOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="single-room-form" variant="glow" size="sm">
              Save Suite & Generate QR
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
                placeholder="e.g. 205 or PH-1"
                value={newRoomNumber}
                onChange={(e) => setNewRoomNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Room Display Name
              </label>
              <input
                type="text"
                placeholder="e.g. Deluxe Suite 205"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Type
              </label>
              <select
                value={newRoomType}
                onChange={(e) => setNewRoomType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="room">Standard Room</option>
                <option value="suite">Deluxe Suite</option>
                <option value="penthouse">Penthouse</option>
                <option value="cabana">Pool Cabana</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Floor
              </label>
              <input
                type="text"
                value={newRoomFloor}
                onChange={(e) => setNewRoomFloor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Wing / Section
              </label>
              <input
                type="text"
                value={newRoomWing}
                onChange={(e) => setNewRoomWing(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Print All Stands Modal */}
      {isPrintAllOpen && (
        <Modal
          isOpen={isPrintAllOpen}
          onClose={() => setIsPrintAllOpen(false)}
          title="Print All In-Room Dining Stands"
          description={`High-resolution printable sheet with QR codes for all ${filteredRooms.length} suites.`}
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="ghost" size="sm" onClick={() => setIsPrintAllOpen(false)}>
                Cancel
              </Button>
              <Button variant="glow" size="sm" leftIcon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
                Send to Printer
              </Button>
            </div>
          }
        >
          <div className="max-h-96 overflow-y-auto space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              {filteredRooms.map((r) => (
                <div key={r.id} className="p-3 bg-white rounded-xl border border-slate-200 text-slate-950 flex items-center gap-3">
                  <QRCodeImage value={getRoomQRURL(r)} size={64} alt={r.name} />
                  <div>
                    <span className="font-bold text-xs block">{r.name}</span>
                    <span className="text-[10px] text-slate-500 block">{r.floor}</span>
                    <span className="text-[9px] text-emerald-700 font-mono">In-Room Dining</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
