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
  Camera,
  UploadCloud,
  FileText,
  Check,
  Receipt,
  Calendar,
  MapPin,
  Globe,
  FileCheck,
  Eye,
  RefreshCw,
  X,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { QRCodeImage } from "@/components/ui/qr-code-image";
import { useAuthStore } from "@/lib/stores/auth-store";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { validateIndianPhone, formatIndianPhoneInput } from "@/lib/validation";
import { ViewToggle, useViewMode } from "@/components/ui/view-toggle";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import NumberFlow from "@number-flow/react";

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
  capacity?: number;
  currentGuestCheckIn?: string;
  currentGuestExpectedCheckOut?: string;
  currentGuestCount?: number;
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

const getStayMetrics = (checkInStr?: string, checkOutStr?: string) => {
  if (!checkInStr) return null;
  const start = new Date(checkInStr).getTime();
  if (isNaN(start)) return null;

  let end: number;
  let isProjected = false;
  if (checkOutStr && !isNaN(new Date(checkOutStr).getTime())) {
    end = new Date(checkOutStr).getTime();
  } else {
    end = start + 24 * 60 * 60 * 1000;
    isProjected = true;
  }

  const diffMs = Math.max(0, end - start);
  const nights = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  const totalDays = nights + 1;

  const elapsedMs = Math.max(0, Date.now() - start);
  const currentDay = Math.min(totalDays, Math.max(1, Math.ceil(elapsedMs / (1000 * 60 * 60 * 24))));

  return {
    checkInDate: new Date(start).toLocaleDateString([], { day: "2-digit", month: "short" }),
    checkOutDate: new Date(end).toLocaleDateString([], { day: "2-digit", month: "short" }),
    nights,
    totalDays,
    currentDay,
    isProjected,
    stayDurationLabel: `${nights}N • ${totalDays}D`,
  };
};

export default function RoomsDirectoryPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { tenant } = useAuthStore();
  const tenantSlug = tenant?.slug || "dineflow";
  const tenantName = tenant?.name || "Your Hotel & Suites";

  const [rooms, setRooms] = React.useState<RoomItem[]>([]);
  const [loading, setLoading] = React.useState(true);
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

  const [viewMode, setViewMode] = useViewMode("rooms", "grid");
  const [floorFilter, setFloorFilter] = React.useState("all");
  const [wingFilter, setWingFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [pendingExtensionRooms, setPendingExtensionRooms] = React.useState<Map<string, any>>(new Map());
  const [pendingHousekeepingRooms, setPendingHousekeepingRooms] = React.useState<Map<string, any>>(new Map());

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const s = params.get("search");
      if (s) setSearchQuery(s);
    }
  }, []);

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
  const [guestCount, setGuestCount] = React.useState(2);
  const [checkInDate, setCheckInDate] = React.useState(() => new Date().toISOString().slice(0, 16));
  const [expectedCheckOutDate, setExpectedCheckOutDate] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 16);
  });
  const [guestAddress, setGuestAddress] = React.useState("");
  const [guestNationality, setGuestNationality] = React.useState("Indian");
  const [guestIdProof, setGuestIdProof] = React.useState("Aadhaar Card");
  const [idProofFile, setIdProofFile] = React.useState<File | null>(null);
  const [idProofPreview, setIdProofPreview] = React.useState<string | null>(null);
  const [specialRequests, setSpecialRequests] = React.useState("");

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const cameraInputRef = React.useRef<HTMLInputElement | null>(null);

  // CheckOut Modal
  const [checkOutRoom, setCheckOutRoom] = React.useState<RoomItem | null>(null);
  const [staySummaryLoading, setStaySummaryLoading] = React.useState(false);
  const [currentStaySummary, setCurrentStaySummary] = React.useState<any | null>(null);
  const [completedInvoice, setCompletedInvoice] = React.useState<any | null>(null);

  // Extend Stay Modal
  const [extendStayRoom, setExtendStayRoom] = React.useState<RoomItem | null>(null);
  const [extendStayDate, setExtendStayDate] = React.useState("");
  const [extendStayNights, setExtendStayNights] = React.useState(1);
  const [extendStayNotes, setExtendStayNotes] = React.useState("");
  const [extendingStay, setExtendingStay] = React.useState(false);

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
      const [roomsRes, statsRes, extensionsRes, tasksRes] = await Promise.allSettled([
        apiClient.get("/rooms"),
        apiClient.get("/rooms/stats"),
        apiClient.get("/rooms/extension-requests"),
        apiClient.get("/rooms/tasks"),
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
          capacity: r.capacity || 2,
          currentGuestCheckIn: r.currentGuestCheckIn || r.currentGuest?.checkIn,
          currentGuestExpectedCheckOut: r.currentGuestExpectedCheckOut || r.currentGuest?.expectedCheckOut,
          currentGuestCount: r.currentGuestCount || r.currentGuest?.numberOfGuests || 1,
          amenities: Array.isArray(r.amenities) ? r.amenities : [],
        }));
        setRooms(loaded);
      }

      if (statsRes.status === "fulfilled" && statsRes.value.data?.data) {
        setStats(statsRes.value.data.data);
      }

      const extMap = new Map<string, any>();
      if (extensionsRes.status === "fulfilled") {
        const data = extensionsRes.value.data?.data || extensionsRes.value.data;
        const list = Array.isArray(data?.requests) ? data.requests : Array.isArray(data) ? data : [];
        list.forEach((req: any) => {
          if (req.status === "pending") {
            if (req.roomId) extMap.set(String(req.roomId).trim(), req);
            if (req.roomNumber) {
              const clean = String(req.roomNumber).toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();
              extMap.set(clean, req);
            }
          }
        });
      }

      const hkMap = new Map<string, any>();
      if (tasksRes.status === "fulfilled") {
        const tData = tasksRes.value.data?.data || tasksRes.value.data;
        const tList = Array.isArray(tData) ? tData : [];
        tList.forEach((task: any) => {
          if (task.status === "pending" || task.status === "in_progress") {
            if (task.roomId) hkMap.set(String(task.roomId).trim(), task);
            if (task.roomNumber) {
              const clean = String(task.roomNumber).toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();
              hkMap.set(clean, task);
              hkMap.set(String(task.roomNumber).trim(), task);
            }
          }
        });
      }

      // Also query resilient Next.js /api/room/tasks store
      try {
        const localTasksRes = await fetch(
          `/api/room/tasks?all=true&tenantSlug=${encodeURIComponent(tenantSlug)}`,
          { cache: "no-store" }
        ).catch(() => null);
        if (localTasksRes && localTasksRes.ok) {
          const tasksJson = await localTasksRes.json().catch(() => null);
          const tList = Array.isArray(tasksJson?.tasks) ? tasksJson.tasks : Array.isArray(tasksJson?.data?.tasks) ? tasksJson.data.tasks : [];
          tList.forEach((task: any) => {
            if (task.status === "pending" || task.status === "in_progress") {
              if (task.roomId) hkMap.set(String(task.roomId).trim(), task);
              if (task.roomNumber) {
                const clean = String(task.roomNumber).toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();
                hkMap.set(clean, task);
                hkMap.set(String(task.roomNumber).trim(), task);
              }
            }
          });
        }
      } catch (_) {}

      // Also query localStorage for any instant client-side tasks
      if (typeof window !== "undefined") {
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`dineflow_tasks_${tenantSlug}_`)) {
              const parsed = JSON.parse(localStorage.getItem(key) || "[]");
              if (Array.isArray(parsed)) {
                parsed.forEach((task: any) => {
                  if (task.status === "pending" || task.status === "in_progress") {
                    const clean = String(task.roomNumber || key.replace(`dineflow_tasks_${tenantSlug}_`, "")).toUpperCase().trim();
                    if (clean) hkMap.set(clean, task);
                  }
                });
              }
            }
          }
        } catch (_) {}
      }

      setPendingHousekeepingRooms(hkMap);

      // Also query resilient Next.js /api/room/extend-stay store
      try {
        const localExtRes = await fetch(
          `/api/room/extend-stay?all=true&tenantSlug=${encodeURIComponent(tenantSlug)}`,
          { cache: "no-store" }
        ).catch(() => null);
        if (localExtRes && localExtRes.ok) {
          const extJson = await localExtRes.json().catch(() => null);
          const list = Array.isArray(extJson?.data?.requests)
            ? extJson.data.requests
            : Array.isArray(extJson?.requests)
            ? extJson.requests
            : [];
          list.forEach((req: any) => {
            const clean = String(req.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();
            if (req.status === "pending") {
              if (req.roomId) extMap.set(String(req.roomId).trim(), req);
              if (clean) extMap.set(clean, req);
            } else if (req.status === "approved" && req.requestedCheckout) {
              setRooms((currentRooms) =>
                currentRooms.map((r) => {
                  const rNum = (r.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();
                  if (rNum === clean) {
                    return { ...r, currentGuestExpectedCheckOut: req.requestedCheckout };
                  }
                  return r;
                })
              );
            }
          });
        }
      } catch (_) {}
      setPendingExtensionRooms(extMap);
      // Also query the resilient /api/room/dnd store for any customer toggles
      try {
        const dndRes = await fetch(
          `/api/room/dnd?all=true&tenantSlug=${encodeURIComponent(tenantSlug)}`,
          { cache: "no-store" }
        ).catch(() => null);
        if (dndRes && dndRes.ok) {
          const dndJson = await dndRes.json().catch(() => null);
          if (Array.isArray(dndJson?.data)) {
            setRooms((currentRooms) => {
              const updated = [...currentRooms];
              dndJson.data.forEach((rec: any) => {
                const recRoom = String(rec.roomNumber || "")
                  .toUpperCase()
                  .replace(/^(ROOM-|SUITE-)/, "")
                  .trim();
                const recDND = Boolean(rec.dndStatus);
                const idx = updated.findIndex((r) => {
                  const rNum = (r.roomNumber || "")
                    .toUpperCase()
                    .replace(/^(ROOM-|SUITE-)/, "")
                    .trim();
                  return rNum === recRoom;
                });
                if (idx >= 0) {
                  updated[idx] = { ...updated[idx], doNotDisturb: recDND };
                } else if (recDND) {
                  updated.unshift({
                    id: `room-${recRoom.toLowerCase()}`,
                    name: `Suite ${recRoom}`,
                    roomNumber: recRoom,
                    floor: "Floor 1",
                    wing: "East Wing",
                    type: "suite",
                    status: "occupied",
                    doNotDisturb: true,
                    folioEnabled: true,
                    activeGuest: "Guest Resident",
                    currentGuestName: "Guest Resident",
                    capacity: 2,
                    amenities: ["King Bed", "High-Speed Wi-Fi", "En-Suite Bath"],
                  });
                }
              });
              return updated;
            });
          }
        }
      } catch (_) {}
    } catch (e) {
      console.warn("Rooms fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [tenantSlug]);

  React.useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 4000);
    return () => clearInterval(interval);
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

  const channelRef = React.useRef<BroadcastChannel | null>(null);

  // Listen for real-time DND sync from customer portal or other tabs
  React.useEffect(() => {
    const handleSync = (cleanRoom: string, dndVal: boolean, roomId?: string) => {
      setRooms((prev) => {
        const existingIdx = prev.findIndex((r) => {
          const rNum = (r.roomNumber || "")
            .toUpperCase()
            .replace(/^(ROOM-|SUITE-)/, "")
            .trim();
          return rNum === cleanRoom || (roomId && r.id === roomId);
        });

        if (existingIdx >= 0) {
          const copy = [...prev];
          copy[existingIdx] = { ...copy[existingIdx], doNotDisturb: dndVal };
          return copy;
        }

        // Room is not in current list: dynamically insert it
        const newRoom: RoomItem = {
          id: roomId || `room-${cleanRoom.toLowerCase()}`,
          name: `Suite ${cleanRoom}`,
          roomNumber: cleanRoom,
          floor: "Floor 1",
          wing: "East Wing",
          type: "suite",
          status: "occupied",
          doNotDisturb: dndVal,
          folioEnabled: true,
          activeGuest: "Guest Resident",
          currentGuestName: "Guest Resident",
          capacity: 2,
          amenities: ["King Bed", "High-Speed Wi-Fi", "En-Suite Bath"],
        };
        return [newRoom, ...prev];
      });
    };

    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        channelRef.current = new BroadcastChannel("dineflow_dnd_sync");
        channelRef.current.onmessage = (event) => {
          if (event.data?.type === "DND_STATUS_CHANGED" && event.data.roomNumber) {
            handleSync(
              event.data.roomNumber,
              Boolean(event.data.dndStatus),
              event.data.roomId
            );
          }
        };
      }
    } catch (_) {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "dineflow_dnd_sync" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.roomNumber) {
            handleSync(parsed.roomNumber, Boolean(parsed.dndStatus), parsed.roomId);
          }
        } catch (_) {}
      } else if (e.key?.startsWith("dineflow_dnd_") && e.newValue !== null) {
        const parts = e.key.split("_");
        const roomNum = parts[parts.length - 1];
        if (roomNum) {
          handleSync(roomNum, e.newValue === "true");
        }
      }
    };

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.roomNumber) {
        handleSync(
          customEvent.detail.roomNumber,
          Boolean(customEvent.detail.dndStatus),
          customEvent.detail.roomId
        );
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("dineflow_dnd_change", handleCustomEvent);

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("dineflow_dnd_change", handleCustomEvent);
    };
  }, []);

  React.useEffect(() => {
    let extChannel: BroadcastChannel | null = null;

    const handleExtensionSync = (data: any) => {
      if (!data) return;
      const clean = String(data.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();

      if (data.type === "STAY_EXTENSION_REQUESTED") {
        if (clean && data.request) {
          setPendingExtensionRooms((prev) => {
            const next = new Map(prev);
            next.set(clean, data.request);
            if (data.request.roomId) next.set(String(data.request.roomId).trim(), data.request);
            return next;
          });
        }
        fetchRooms();
      } else if (data.type === "STAY_EXTENSION_APPROVED") {
        if (clean) {
          setPendingExtensionRooms((prev) => {
            const next = new Map(prev);
            next.delete(clean);
            if (data.roomId) next.delete(String(data.roomId).trim());
            return next;
          });
          if (data.newCheckout) {
            setRooms((currentRooms) =>
              currentRooms.map((r) => {
                const rNum = (r.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();
                if (rNum === clean) {
                  return { ...r, currentGuestExpectedCheckOut: data.newCheckout };
                }
                return r;
              })
            );
          }
        }
        fetchRooms();
      } else if (data.type === "STAY_EXTENSION_REJECTED") {
        if (clean) {
          setPendingExtensionRooms((prev) => {
            const next = new Map(prev);
            next.delete(clean);
            if (data.roomId) next.delete(String(data.roomId).trim());
            return next;
          });
        }
        fetchRooms();
      }
    };

    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        extChannel = new BroadcastChannel("dineflow_extension_sync");
        extChannel.onmessage = (e) => {
          handleExtensionSync(e.data);
        };
      }
    } catch (_) {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "dineflow_extension_sync" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          handleExtensionSync(parsed);
        } catch (_) {}
      }
    };

    const handleCustomEvent = (e: Event) => {
      const ce = e as CustomEvent;
      if (ce.detail) {
        handleExtensionSync(ce.detail);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("dineflow_extension_sync", handleCustomEvent);

    return () => {
      if (extChannel) {
        try { extChannel.close(); } catch (_) {}
      }
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("dineflow_extension_sync", handleCustomEvent);
    };
  }, [fetchRooms]);

  React.useEffect(() => {
    let taskChannel: BroadcastChannel | null = null;
    const handleTaskSync = () => {
      fetchRooms();
    };

    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        taskChannel = new BroadcastChannel("dineflow_task_sync");
        taskChannel.onmessage = () => handleTaskSync();
      }
    } catch (_) {}

    window.addEventListener("dineflow_task_created", handleTaskSync);
    window.addEventListener("storage", (e) => {
      if (e.key?.startsWith("dineflow_tasks_") || e.key === "dineflow_task_created") {
        handleTaskSync();
      }
    });

    return () => {
      if (taskChannel) {
        try { taskChannel.close(); } catch (_) {}
      }
      window.removeEventListener("dineflow_task_created", handleTaskSync);
    };
  }, [fetchRooms]);

  const broadcastDNDUpdate = React.useCallback(
    (roomNum: string, dndVal: boolean, roomId?: string) => {
      try {
        if (typeof window !== "undefined") {
          const cleanRoom = roomNum
            .toUpperCase()
            .replace(/^(ROOM-|SUITE-)/, "")
            .trim();
          const payload = {
            type: "DND_STATUS_CHANGED",
            tenantSlug,
            roomNumber: cleanRoom,
            roomId,
            dndStatus: dndVal,
            timestamp: Date.now(),
          };
          if (channelRef.current) {
            channelRef.current.postMessage(payload);
          }
          localStorage.setItem(`dineflow_dnd_${tenantSlug}_${cleanRoom}`, String(dndVal));
          localStorage.setItem(`dineflow_dnd_${cleanRoom}`, String(dndVal));
          localStorage.setItem("dineflow_dnd_sync", JSON.stringify(payload));
          window.dispatchEvent(new CustomEvent("dineflow_dnd_change", { detail: payload }));
        }
      } catch (_) {}
    },
    [tenantSlug]
  );

  const handleToggleDND = async (id: string, current: boolean) => {
    const targetRoom = rooms.find((r) => r.id === id);
    const roomNum = targetRoom?.roomNumber || "";
    const nextStatus = !current;

    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, doNotDisturb: nextStatus } : r))
    );

    broadcastDNDUpdate(roomNum, nextStatus, id);

    // Resilient server-side update
    fetch("/api/room/dnd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantSlug,
        roomNumber: roomNum,
        dndStatus: nextStatus,
        updatedBy: "staff",
      }),
    }).catch(() => null);

    try {
      await apiClient.patch(`/rooms/${encodeURIComponent(id)}/dnd`, { doNotDisturb: nextStatus });
    } catch (e) {
      console.warn("DND toggle api error:", e);
    }
    addToast(
      "info",
      "Do Not Disturb Updated",
      nextStatus ? "Room marked DND (stewards alerted not to knock)." : "DND flag cleared for this room."
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

    const phoneValidation = validateIndianPhone(guestPhone);
    if (!phoneValidation.isValid) {
      addToast(
        "error",
        "Invalid Indian Mobile",
        phoneValidation.error || "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9."
      );
      return;
    }

    const maxCap = checkInRoom.capacity || 2;
    if (guestCount > maxCap) {
      addToast(
        "error",
        "Capacity Exceeded",
        `${checkInRoom.name} has a maximum capacity of ${maxCap} guest${maxCap > 1 ? "s" : ""}. Please adjust the guest count.`
      );
      return;
    }

    try {
      await apiClient.post(`/rooms/${encodeURIComponent(checkInRoom.id)}/check-in`, {
        name: guestName.trim(),
        phone: phoneValidation.normalized,
        email: guestEmail.trim() || undefined,
        numberOfGuests: Number(guestCount) || 1,
        checkIn: checkInDate ? new Date(checkInDate).toISOString() : new Date().toISOString(),
        expectedCheckOut: expectedCheckOutDate ? new Date(expectedCheckOutDate).toISOString() : undefined,
        address: guestAddress.trim() || undefined,
        nationality: guestNationality.trim() || "Indian",
        idProofType: guestIdProof,
        idProofUrl: idProofPreview || undefined,
        specialRequests: specialRequests.trim() || undefined,
      });

      addToast(
        "success",
        "Guest Checked In",
        `${guestName} is now in-house in ${checkInRoom.name} with verified ${guestIdProof}.`
      );
      setCheckInRoom(null);
      setGuestName("");
      setGuestPhone("");
      setGuestEmail("");
      setGuestAddress("");
      setIdProofFile(null);
      setIdProofPreview(null);
      setSpecialRequests("");
      fetchRooms();
    } catch (e: any) {
      addToast("error", "Check-In Failed", e?.response?.data?.message || "Could not check in guest.");
    }
  };

  const handleStartCheckIn = (room: RoomItem) => {
    setCheckInRoom(room);
    setGuestName("");
    setGuestPhone("");
    setGuestEmail("");
    setGuestAddress("");
    setGuestCount(Math.min(2, room.capacity || 2));
    setCheckInDate(new Date().toISOString().slice(0, 16));
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    tmrw.setHours(11, 0, 0, 0);
    setExpectedCheckOutDate(tmrw.toISOString().slice(0, 16));
  };

  const handleIDFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        addToast("error", "File Too Large", "ID document must be under 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setIdProofFile(file);
        setIdProofPreview(reader.result as string);
        addToast("info", "ID Document Attached", `${file.name} ready for check-in.`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInitiateCheckOut = async (room: RoomItem) => {
    setCheckOutRoom(room);
    setCurrentStaySummary(null);
    setStaySummaryLoading(true);
    try {
      const res = await apiClient.get(`/rooms/${encodeURIComponent(room.id)}/stay-summary`);
      if (res.data?.data) {
        setCurrentStaySummary(res.data.data);
      }
    } catch (e) {
      console.warn("Could not fetch stay summary preview:", e);
    } finally {
      setStaySummaryLoading(false);
    }
  };

  const handleCheckOutSubmit = async () => {
    if (!checkOutRoom) return;

    try {
      const res = await apiClient.post(`/rooms/${encodeURIComponent(checkOutRoom.id)}/check-out`, {});
      const summary = res.data?.data?.staySummary || currentStaySummary;
      setCompletedInvoice(summary);
      setCheckOutRoom(null);
      addToast(
        "success",
        "Guest Checked Out",
        `${checkOutRoom.name} marked for Housekeeping. Stay summary generated.`
      );
      fetchRooms();
    } catch (e: any) {
      addToast("error", "Check-Out Failed", e?.response?.data?.message || "Could not check out.");
    }
  };

  const handleOpenExtendStay = (room: RoomItem) => {
    setExtendStayRoom(room);
    setExtendStayNotes("");
    setExtendStayNights(1);
    const baseDate = room.currentGuestExpectedCheckOut ? new Date(room.currentGuestExpectedCheckOut) : new Date();
    if (isNaN(baseDate.getTime())) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      baseDate.setTime(tomorrow.getTime());
    }
    const nextDay = new Date(baseDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const y = nextDay.getFullYear();
    const m = String(nextDay.getMonth() + 1).padStart(2, "0");
    const d = String(nextDay.getDate()).padStart(2, "0");
    setExtendStayDate(`${y}-${m}-${d}`);
  };

  const handleConfirmExtendStay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendStayRoom || !extendStayDate) return;

    try {
      setExtendingStay(true);
      const [y, m, d] = extendStayDate.split("-").map(Number);
      const isoDate = new Date(Date.UTC(y, m - 1, d, 11, 0, 0)).toISOString();

      await apiClient.post(`/rooms/${encodeURIComponent(extendStayRoom.id)}/extend-stay`, {
        newCheckOut: isoDate,
        additionalNights: extendStayNights,
        notes: extendStayNotes,
      });

      addToast(
        "success",
        "Stay Extended Successfully",
        `${extendStayRoom.name} reservation extended to ${new Date(isoDate).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })} at 11:00 AM.`
      );

      setExtendStayRoom(null);
      fetchRooms();
    } catch (err: any) {
      addToast("error", "Extension Failed", err?.response?.data?.message || err?.message || "Could not extend stay.");
    } finally {
      setExtendingStay(false);
    }
  };

  const handleMarkClean = async (id: string, name: string) => {
    const targetRoom = rooms.find((r) => r.id === id);
    if (targetRoom?.doNotDisturb) {
      addToast(
        "error",
        "Action Blocked by DND",
        `Cannot mark ${name} clean & service-ready while Do Not Disturb (DND) is active. Please clear DND first.`
      );
      return;
    }
    try {
      await apiClient.patch(`/rooms/${encodeURIComponent(id)}/status`, { status: "vacant" });
      addToast("success", "Room Clean & Ready", `${name} is now vacant and ready for next guest.`);
      fetchRooms();
    } catch (e: any) {
      addToast("error", "Status Update Failed", e?.response?.data?.message || e?.message || "Could not update room status.");
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
    <div className="flex flex-col h-full min-h-0 gap-2.5">
      {/* ======================================================== */}
      {/* 1. FIXED TOP CONTROL AREA (Header, KPIs, Toolbar)       */}
      {/* ======================================================== */}
      <div className="shrink-0 space-y-2">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Guest Rooms & In-Room Dining
              </h1>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold">
                <Hotel className="h-3 w-3" /> Hotel Pro Enterprise
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 hidden sm:block">
              Manage hotel suites, guest check-ins, housekeeping sanitization, and luxury acrylic in-room QR tent stands.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="h-8 text-xs font-semibold px-2.5"
              leftIcon={<Printer className="h-3.5 w-3.5" />}
              onClick={() => setIsPrintAllOpen(true)}
            >
              Print In-Room Stands
            </Button>

            <Button
              variant="secondary"
              size="sm"
              className="h-8 text-xs font-semibold px-2.5"
              leftIcon={<Layers className="h-3.5 w-3.5" />}
              onClick={() => setIsBulkOpen(true)}
            >
              Bulk Generator
            </Button>

            <Button
              variant="glow"
              size="sm"
              className="h-8 text-xs font-bold px-3"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => setIsAddRoomOpen(true)}
            >
              Add Room / Suite
            </Button>
          </div>
        </div>

        {/* Hotel PMS KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 pb-0.5 shrink-0">
          <Card variant="glass" className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 min-w-[140px] sm:min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
              Occupied Rooms
            </span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {loading && rooms.length === 0 ? "—" : <NumberFlow value={stats.occupiedRooms || rooms.filter((r) => r.status === "occupied").length} />}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {loading && rooms.length === 0 ? "—" : <><NumberFlow value={Math.round(stats.occupancyRate || 0)} />% Occ</>}
              </span>
            </div>
          </Card>

          <Card variant="glass" className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 min-w-[140px] sm:min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
              Clean & Ready
            </span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {loading && rooms.length === 0 ? "—" : <NumberFlow value={stats.vacantRooms || rooms.filter((r) => r.status === "vacant").length} />}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Vacant</span>
            </div>
          </Card>

          <Card variant="glass" className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 min-w-[140px] sm:min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
              Housekeeping
            </span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {loading && rooms.length === 0 ? "—" : <NumberFlow value={stats.cleaningRooms || rooms.filter((r) => r.status === "cleaning").length} />}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Cleaning</span>
            </div>
          </Card>

          <Card variant="glass" className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 min-w-[140px] sm:min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
              Do Not Disturb
            </span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {loading && rooms.length === 0 ? "—" : <NumberFlow value={rooms.filter((r) => r.doNotDisturb).length} />}
              </span>
              <span className="text-[10px] text-rose-500 font-mono font-bold">🔴 Active</span>
            </div>
          </Card>

          <Card variant="glass" className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 min-w-[140px] sm:min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
              Check-Ins Today
            </span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-lg sm:text-xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                {loading && rooms.length === 0 ? "—" : <NumberFlow value={stats.checkInsToday || 0} />}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Arrivals</span>
            </div>
          </Card>

          <Card variant="glass" className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 min-w-[140px] sm:min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
              Pending Dining
            </span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {loading && rooms.length === 0 ? "—" : <NumberFlow value={stats.pendingRoomService || 0} />}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Active</span>
            </div>
          </Card>
        </div>

        {/* Toolbar: Floors, Statuses, Search & View Toggle */}
        <div className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="overflow-x-auto pb-1 sm:pb-0 scrollbar-none min-w-0 flex-1">
              <div className="flex min-w-max items-center gap-1.5">
                {floors.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFloorFilter(f)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      floorFilter === f
                        ? "bg-emerald-500 text-slate-950 shadow font-bold"
                        : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
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
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer capitalize ${
                      statusFilter === s
                        ? "bg-indigo-500 text-white shadow font-bold"
                        : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                    }`}
                  >
                    {s === "all" ? "All Statuses" : s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative w-full sm:w-52">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search suite number, guest..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              <ViewToggle view={viewMode} onViewChange={setViewMode} />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SCROLLABLE ROOMS CONTAINER (Only rooms scroll)         */}
      {/* ======================================================== */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-16 scrollbar-thin">

      {/* Pending Extension Review Notification Banner */}
      {pendingExtensionRooms.size > 0 && (
        <div className="mb-4 p-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 animate-pulse" />
            </span>
            <div>
              <p className="text-xs sm:text-sm font-bold flex items-center gap-2">
                <span>{pendingExtensionRooms.size} Stay Extension Request{pendingExtensionRooms.size > 1 ? "s" : ""} Pending Review</span>
                <Badge variant="warning" size="sm" className="font-extrabold text-[9px] uppercase tracking-wider">
                  Action Required
                </Badge>
              </p>
              <p className="text-[11px] opacity-80 mt-0.5">
                In-house guest(s) have requested stay extensions. Review requested dates and approve or decline.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const firstKey = Array.from(pendingExtensionRooms.keys())[0];
              const matchingRoom = rooms.find(
                (r) =>
                  r.id === firstKey ||
                  (r.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim() === firstKey
              );
              if (matchingRoom) {
                router.push(`/dashboard/rooms/${matchingRoom.id}`);
              }
            }}
            className="border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 rounded-xl text-xs font-bold shrink-0 self-end sm:self-auto cursor-pointer"
          >
            Review Request →
          </Button>
        </div>
      )}

      {/* Pending Housekeeping / Guest Service Request Notification Banner */}
      {pendingHousekeepingRooms.size > 0 && (
        <div className="mb-4 p-3 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 dark:bg-cyan-950/30 text-cyan-950 dark:text-cyan-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </span>
            <div>
              <p className="text-xs sm:text-sm font-bold flex items-center gap-2">
                <span>{pendingHousekeepingRooms.size} Housekeeping Request{pendingHousekeepingRooms.size > 1 ? "s" : ""} Active</span>
                <Badge variant="neutral" size="sm" className="bg-cyan-500/20 text-cyan-800 dark:text-cyan-200 font-extrabold text-[9px] uppercase tracking-wider">
                  Guest Dispatched
                </Badge>
              </p>
              <p className="text-[11px] opacity-80 mt-0.5">
                In-house guests have requested room refresh, amenities, or assistance. Check assigned housekeepers and workloads.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const firstKey = Array.from(pendingHousekeepingRooms.keys())[0];
              const matchingRoom = rooms.find(
                (r) =>
                  r.id === firstKey ||
                  (r.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim() === firstKey
              );
              if (matchingRoom) {
                router.push(`/dashboard/rooms/${matchingRoom.id}`);
              }
            }}
            className="border-cyan-500/40 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 rounded-xl text-xs font-bold shrink-0 self-end sm:self-auto cursor-pointer"
          >
            View Tasks →
          </Button>
        </div>
      )}

      {/* Hotel Rooms: Loading Skeleton OR Empty State OR Grid / List View */}
      {loading && rooms.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`room-skel-${i}`}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 p-4 space-y-3 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
              </div>
              <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800/60 rounded" />
              <div className="h-16 bg-slate-100 dark:bg-slate-800/40 rounded-xl" />
              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="h-8 flex-1 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-8 flex-1 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="py-8">
          <EmptyState
            icon={<Hotel className="h-8 w-8 text-slate-400 dark:text-slate-500" />}
            title={searchQuery || floorFilter !== "all" || statusFilter !== "all" ? "No suites match your filter" : "No suites configured yet"}
            description={
              searchQuery || floorFilter !== "all" || statusFilter !== "all"
                ? "Try resetting filters or searching with a different room number."
                : "Add your hotel rooms, luxury suites, or chalets to enable contactless QR service."
            }
            action={
              searchQuery || floorFilter !== "all" || statusFilter !== "all"
                ? {
                    label: "Reset Filters",
                    onClick: () => {
                      setSearchQuery("");
                      setFloorFilter("all");
                      setStatusFilter("all");
                    },
                  }
                : {
                    label: "Add Room",
                    icon: <Plus className="h-4 w-4" />,
                    onClick: () => setIsAddRoomOpen(true),
                  }
            }
          />
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500 text-white shadow-xs animate-pulse">
                        🔴 DND Active
                      </span>
                    )}

                    {(pendingExtensionRooms.has(room.id) ||
                      pendingExtensionRooms.has(room.roomNumber) ||
                      pendingExtensionRooms.has((room.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim())) && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/rooms/${room.id}`);
                        }}
                        title="Click to review stay extension request"
                        className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs animate-pulse flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Clock className="h-3 w-3" />
                        <span>Extension Req</span>
                      </span>
                    )}

                    {(pendingHousekeepingRooms.has(room.id) ||
                      pendingHousekeepingRooms.has(room.roomNumber) ||
                      pendingHousekeepingRooms.has((room.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim())) && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/rooms/${room.id}`);
                        }}
                        title="Click to view active housekeeping request"
                        className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500 hover:bg-cyan-600 text-white shadow-xs animate-pulse flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Service Req</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Guest In-House pill with Stay Dates & Duration */}
                {isOccupied && (room.activeGuest || room.currentGuestName) ? (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <Users className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span className="text-slate-900 dark:text-white font-bold truncate max-w-full">
                          {room.activeGuest || room.currentGuestName}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        Folio OK
                      </span>
                    </div>

                    {/* Stay Dates & Duration */}
                    {(() => {
                      const metrics = getStayMetrics(room.currentGuestCheckIn, room.currentGuestExpectedCheckOut);
                      if (!metrics) return null;
                      return (
                        <div className="pt-1.5 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                            <Calendar className="h-3 w-3 text-emerald-500 shrink-0" />
                            <span>{metrics.checkInDate} → {metrics.checkOutDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                              {metrics.stayDurationLabel}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenExtendStay(room);
                              }}
                              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline bg-emerald-500/10 px-1.5 py-0.5 rounded cursor-pointer"
                            >
                              Extend
                            </button>
                          </div>
                        </div>
                      );
                    })()}
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
                    <span className="text-[11px]">Suite vacant & ready</span>
                    <button
                      onClick={() => handleStartCheckIn(room)}
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

                <div className="flex items-center justify-between gap-1.5 pt-1 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] px-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    onClick={() => router.push(`/dashboard/rooms/${room.id}`)}
                  >
                    <span>Manage</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>

                  {isOccupied ? (
                    <div className="flex items-center gap-1 flex-wrap justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] px-2 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 font-bold flex items-center gap-1"
                        onClick={() => handleOpenExtendStay(room)}
                      >
                        <Calendar className="h-3 w-3" />
                        <span>Extend Stay</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] px-2 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                        onClick={() => handleInitiateCheckOut(room)}
                      >
                        Check-Out
                      </Button>
                    </div>
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
                      onClick={() => handleStartCheckIn(room)}
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
      ) : (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md overflow-hidden shadow-2xs">
          <div className="overflow-x-auto scrollbar-none [-webkit-overflow-scrolling:touch]">
            <Table className="min-w-[850px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-slate-200/80 dark:border-slate-800/80">
                  <TableHead className="pl-4">Room</TableHead>
                  <TableHead>Type / Floor</TableHead>
                  <TableHead>Guest & Stay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => {
                  const isOccupied = room.status === "occupied";
                  const isCleaning = room.status === "cleaning";
                  const isMaintenance = room.status === "maintenance";
                  const metrics = getStayMetrics(room.currentGuestCheckIn, room.currentGuestExpectedCheckOut);

                  return (
                    <TableRow
                      key={room.id}
                      className={`transition-colors ${
                        room.doNotDisturb
                          ? "bg-rose-500/5 dark:bg-rose-500/10"
                          : isOccupied
                          ? "bg-amber-500/5 dark:bg-amber-500/10"
                          : ""
                      }`}
                    >
                      {/* Room */}
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isOccupied ? "bg-amber-500/10 text-amber-500" : isCleaning ? "bg-cyan-500/10 text-cyan-500" : "bg-emerald-500/10 text-emerald-500"
                          }`}>
                            <Hotel className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{room.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{room.floor} · {room.wing}</p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Type / Floor */}
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 capitalize w-fit">
                            {room.type || "Standard"}
                          </span>
                          {room.capacity && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                              <Users className="h-3 w-3" />
                              {room.capacity} guests
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Guest & Stay */}
                      <TableCell>
                        {isOccupied && (room.activeGuest || room.currentGuestName) ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Users className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              <span className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-full">
                                {room.activeGuest || room.currentGuestName}
                              </span>
                              {room.currentGuestCount && room.currentGuestCount > 1 && (
                                <span className="text-xs text-slate-500">+{room.currentGuestCount - 1}</span>
                              )}
                            </div>
                            {metrics && (
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                                <span>{metrics.checkInDate} → {metrics.checkOutDate}</span>
                                <span className="font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-semibold">
                                  {metrics.nights}N
                                </span>
                                {room.folioEnabled && (
                                  <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                                    <FileCheck className="h-3 w-3" />Folio OK
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className={`text-xs ${isCleaning ? "text-cyan-600 dark:text-cyan-400" : isMaintenance ? "text-orange-500" : "text-slate-400 dark:text-slate-500"}`}>
                            {isCleaning ? "Housekeeping in progress" : isMaintenance ? "Under maintenance" : "Suite vacant & ready"}
                          </span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <Badge
                            variant={isOccupied ? "warning" : isCleaning ? "danger" : "success"}
                            size="sm"
                            dot
                          >
                            {isOccupied ? "Guest In-House" : isCleaning ? "Cleaning" : isMaintenance ? "Maintenance" : "Clean & Ready"}
                          </Badge>
                          {room.doNotDisturb && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500 text-white shadow-xs animate-pulse">
                              🔴 DND
                            </span>
                          )}

                          {(pendingExtensionRooms.has(room.id) ||
                            pendingExtensionRooms.has(room.roomNumber) ||
                            pendingExtensionRooms.has((room.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim())) && (
                            <Badge
                              variant="warning"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/rooms/${room.id}`);
                              }}
                              className="text-[10px] font-bold animate-pulse cursor-pointer hover:opacity-85 transition-opacity"
                              title="Click to review stay extension request"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Extension Req
                            </Badge>
                          )}

                          {(pendingHousekeepingRooms.has(room.id) ||
                            pendingHousekeepingRooms.has(room.roomNumber) ||
                            pendingHousekeepingRooms.has((room.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim())) && (
                            <Badge
                              variant="neutral"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/rooms/${room.id}`);
                              }}
                              className="text-[10px] font-bold animate-pulse cursor-pointer bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 hover:opacity-85 transition-opacity"
                              title="Click to view active housekeeping request"
                            >
                              <Sparkles className="h-3 w-3 mr-1" />
                              Service Req
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {isOccupied ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-[11px] px-2 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                                onClick={() => handleOpenExtendStay(room)}
                              >
                                <Calendar className="h-3 w-3 mr-1" />Extend
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-[11px] px-2 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                                onClick={() => handleInitiateCheckOut(room)}
                              >
                                Check-Out
                              </Button>
                            </>
                          ) : isCleaning ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[11px] px-2 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                              onClick={() => handleMarkClean(room.id, room.name)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />Mark Ready
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[11px] px-2 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                              onClick={() => handleStartCheckIn(room)}
                            >
                              Check-In
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            title={room.doNotDisturb ? "Cancel DND" : "Set DND"}
                            onClick={() => handleToggleDND(room.id, room.doNotDisturb)}
                          >
                            <BellOff className={`h-3.5 w-3.5 ${room.doNotDisturb ? "text-rose-500" : ""}`} />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            title="Tent QR"
                            onClick={() => setSelectedRoom(room)}
                          >
                            <QrCode className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            title="Manage Room"
                            onClick={() => router.push(`/dashboard/rooms/${room.id}`)}
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
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

      {/* Complete Indian Hotel Guest Check-In Modal */}
      {checkInRoom && (
        <Modal
          isOpen={!!checkInRoom}
          onClose={() => setCheckInRoom(null)}
          title={`Guest Check-In — ${checkInRoom.name}`}
          description="Register guest with Indian ID verification, phone validation, and folio activation."
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
          <form id="checkin-modal-form" onSubmit={handleCheckInSubmit} className="space-y-4 py-2 text-xs">
            {/* Guest Name & Indian Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arjun Kapoor"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Mobile Number (India +91) *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    placeholder="+91 98765 43210"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(formatIndianPhoneInput(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  {guestPhone && (
                    <div className="absolute right-2.5 top-2.5">
                      {validateIndianPhone(guestPhone).isValid ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          <Check className="h-3.5 w-3.5 stroke-[3]" /> Valid
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-amber-500">
                          10 digits
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {guestPhone && !validateIndianPhone(guestPhone).isValid && (
                  <p className="text-[10px] text-rose-500 mt-1">
                    {validateIndianPhone(guestPhone).error}
                  </p>
                )}
              </div>
            </div>

            {/* Email & Guests Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="guest@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    Number of Guests *
                  </label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                    Max: {checkInRoom?.capacity || 2}
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max={checkInRoom?.capacity || 2}
                  value={guestCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    const maxCap = checkInRoom?.capacity || 2;
                    setGuestCount(Math.min(maxCap, Math.max(1, val)));
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Suite capacity strictly limited to {checkInRoom?.capacity || 2} guest{(checkInRoom?.capacity || 2) > 1 ? "s" : ""}.
                </p>
              </div>
            </div>

            {/* Check-In Date & Expected Check-Out Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Check-In Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Expected Check-Out Date *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={expectedCheckOutDate}
                  onChange={(e) => setExpectedCheckOutDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Address & Nationality */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 42 Park Street, Kolkata, West Bengal 700016"
                  value={guestAddress}
                  onChange={(e) => setGuestAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Nationality
                </label>
                <input
                  type="text"
                  value={guestNationality}
                  onChange={(e) => setGuestNationality(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Indian ID Proof Section */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <FileCheck className="h-4 w-4 text-emerald-500" />
                    <span>Indian ID Proof Verification</span>
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Required for Indian hospitality compliance. Supported: Aadhaar, Passport, DL, Voter ID, PAN.
                  </p>
                </div>

                <select
                  value={guestIdProof}
                  onChange={(e) => setGuestIdProof(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Passport">Passport</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="PAN Card">PAN Card</option>
                </select>
              </div>

              {/* Upload & Camera Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={handleIDFileChange}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleIDFileChange}
                />

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                  leftIcon={<UploadCloud className="h-3.5 w-3.5" />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload File / PDF
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                  leftIcon={<Camera className="h-3.5 w-3.5" />}
                  onClick={() => cameraInputRef.current?.click()}
                >
                  Capture with Camera
                </Button>

                <span className="text-[10px] text-slate-500">
                  Max 10MB (JPG, PNG, PDF, WEBP)
                </span>
              </div>

              {/* ID Proof Preview */}
              {idProofPreview && (
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 truncate">
                    {idProofPreview.startsWith("data:image") ? (
                      <img
                        src={idProofPreview}
                        alt="ID Preview"
                        className="h-10 w-10 object-cover rounded-lg border border-slate-200 dark:border-slate-800 shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                    )}
                    <div className="truncate">
                      <span className="font-bold text-slate-900 dark:text-white block truncate">
                        {idProofFile?.name || `${guestIdProof} Attached`}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                        Ready for Verification • {idProofFile ? `${Math.round(idProofFile.size / 1024)} KB` : "Document Loaded"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[10px] text-slate-500 hover:text-rose-500"
                      onClick={() => {
                        setIdProofFile(null);
                        setIdProofPreview(null);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Special Requests */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Special Requests / Dietary Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Non-smoking room, extra plush pillows, vegetarian breakfast setup"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Guest Check-Out & Stay Review Modal */}
      {checkOutRoom && (
        <Modal
          isOpen={!!checkOutRoom}
          onClose={() => setCheckOutRoom(null)}
          title={`Confirm Check-Out — ${checkOutRoom.name}`}
          description="Review guest stay duration, itemized room service orders, and settle folio balance."
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="ghost" size="sm" onClick={() => setCheckOutRoom(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCheckOutSubmit}
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
              >
                Confirm Check-Out & Settle Folio
              </Button>
            </div>
          }
        >
          <div className="py-2 space-y-4 text-xs">
            {staySummaryLoading ? (
              <div className="py-12 text-center space-y-3">
                <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
                <p className="text-slate-500">Calculating stay summary & room service billing...</p>
              </div>
            ) : (
              <>
                {/* In-House Guest Overview */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-950 dark:text-amber-200 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 block">
                        Departing Guest
                      </span>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {currentStaySummary?.guestName || checkOutRoom.activeGuest || checkOutRoom.currentGuestName}
                      </h3>
                      {currentStaySummary?.guestPhone && (
                        <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                          {currentStaySummary.guestPhone}
                        </p>
                      )}
                    </div>

                    <Badge variant="warning" size="sm" className="font-mono font-bold">
                      {checkOutRoom.name}
                    </Badge>
                  </div>

                  <div className="pt-2 border-t border-amber-500/20 grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block font-semibold">Check-In:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {currentStaySummary?.checkIn
                          ? new Date(currentStaySummary.checkIn).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" })
                          : "Active Stay"}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        {currentStaySummary?.checkIn
                          ? new Date(currentStaySummary.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : ""}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">Check-Out:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {currentStaySummary?.checkOut
                          ? new Date(currentStaySummary.checkOut).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" })
                          : new Date().toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        {currentStaySummary?.checkOut
                          ? new Date(currentStaySummary.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">Stay Duration:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400 font-mono block">
                        {currentStaySummary?.stayDuration || "1 Night"}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Folio Billable
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pending Room Service Warning */}
                {currentStaySummary && currentStaySummary.pendingOrders > 0 && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>
                      <strong>Warning:</strong> {currentStaySummary.pendingOrders} room service order(s) are still preparing. Check with kitchen before clearing.
                    </span>
                  </div>
                )}

                {/* Itemized Room Service Orders */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      In-Room Dining Orders ({currentStaySummary?.totalOrders || 0})
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Charged to Room Folio
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-950/40">
                    {currentStaySummary?.roomServiceOrders && currentStaySummary.roomServiceOrders.length > 0 ? (
                      currentStaySummary.roomServiceOrders.map((ord: any, idx: number) => (
                        <div
                          key={ord.orderNumber || idx}
                          className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-900 dark:text-white">
                                {ord.orderNumber}
                              </span>
                              <Badge variant={ord.status === "served" ? "success" : "neutral"} size="sm">
                                {ord.status}
                              </Badge>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                              {new Date(ord.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>

                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                            {formatCurrency(ord.totalAmount || ord.total || 0, "INR")}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-4 text-slate-500 text-[11px]">
                        No in-room dining orders charged during this stay.
                      </p>
                    )}
                  </div>
                </div>

                {/* Bill Breakdown & Folio Settlement */}
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Room Service F&B Charges:</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(currentStaySummary?.totalFoodAmount || 0, "INR")}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Folio Balance Settled:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(currentStaySummary?.folioBalance || 0, "INR")}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-slate-900 dark:text-white text-sm">
                    <span>Total Amount Payable:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(currentStaySummary?.folioBalance || 0, "INR")}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Upon confirmation, guest folio is closed, room status is updated to <strong>Cleaning</strong>, and an automated housekeeping deep-clean task will be dispatched.
                </p>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* Staff Extend Stay Modal */}
      {extendStayRoom && (
        <Modal
          isOpen={!!extendStayRoom}
          onClose={() => setExtendStayRoom(null)}
          title={`Extend Stay — ${extendStayRoom.name}`}
          description={`Prolong reservation for ${extendStayRoom.activeGuest || extendStayRoom.currentGuestName || "In-House Guest"}`}
          size="md"
        >
          <form onSubmit={handleConfirmExtendStay} className="space-y-4 pt-1">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Active Guest:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {extendStayRoom.activeGuest || extendStayRoom.currentGuestName || "Valued In-House Guest"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Current Check-Out:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {extendStayRoom.currentGuestExpectedCheckOut
                    ? new Date(extendStayRoom.currentGuestExpectedCheckOut).toLocaleDateString([], {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }) + " • 11:00 AM"
                    : "Standard 11:00 AM"}
                </span>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Quick Extension Presets
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 5, 7].map((n) => {
                  const isSelected = extendStayNights === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        setExtendStayNights(n);
                        const baseDate = extendStayRoom.currentGuestExpectedCheckOut
                          ? new Date(extendStayRoom.currentGuestExpectedCheckOut)
                          : new Date();
                        if (isNaN(baseDate.getTime())) {
                          baseDate.setTime(Date.now() + 24 * 3600 * 1000);
                        }
                        const target = new Date(baseDate);
                        target.setDate(target.getDate() + n);
                        const y = target.getFullYear();
                        const m = String(target.getMonth() + 1).padStart(2, "0");
                        const d = String(target.getDate()).padStart(2, "0");
                        setExtendStayDate(`${y}-${m}-${d}`);
                      }}
                      className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-sm font-black">+{n}</span>
                      <span className="text-[9px] opacity-75">{n === 1 ? "Night" : "Nights"}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Select Exact Check-Out Date
              </label>
              <input
                type="date"
                value={extendStayDate}
                onChange={(e) => setExtendStayDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Standard check-out is set to 11:00 AM UTC.
              </p>
            </div>

            {/* Staff notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Staff / Folio Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={extendStayNotes}
                onChange={(e) => setExtendStayNotes(e.target.value)}
                placeholder="e.g. Extended at front desk upon guest request. Digital keys renewed."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setExtendStayRoom(null)}
                disabled={extendingStay}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5"
                disabled={extendingStay || !extendStayDate}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>{extendingStay ? "Updating Stay..." : "Confirm Extension"}</span>
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Completed Stay Tax Invoice / Summary Modal */}
      {completedInvoice && (
        <Modal
          isOpen={!!completedInvoice}
          onClose={() => setCompletedInvoice(null)}
          title="Guest Stay Summary & Tax Invoice"
          description="Official checkout receipt with itemized room service and stay billing."
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] text-slate-500 font-mono">
                Status: Settled & Checked Out
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCompletedInvoice(null)}
                >
                  Done
                </Button>
                <Button
                  variant="glow"
                  size="sm"
                  leftIcon={<Printer className="h-4 w-4" />}
                  onClick={() => window.print()}
                >
                  Print Tax Invoice
                </Button>
              </div>
            </div>
          }
        >
          <div className="p-5 bg-white text-slate-950 rounded-2xl border border-slate-200 space-y-4 my-1 text-xs">
            {/* Hotel Letterhead */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-emerald-700 block">
                  {tenantName}
                </span>
                <h2 className="text-lg font-black tracking-tight mt-0.5">Guest Stay Invoice</h2>
                <p className="text-[11px] text-slate-500">
                  Hospitality & In-Room Dining Services
                </p>
              </div>
              <div className="text-right text-[11px] text-slate-600">
                <span className="font-mono font-bold block">
                  INV-{completedInvoice.roomNumber}-{Date.now().toString().slice(-6)}
                </span>
                <span>Date: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Guest & Suite Details */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-[11px]">
              <div>
                <span className="text-slate-500 block">Guest Name:</span>
                <span className="font-bold text-slate-900 block">{completedInvoice.guestName}</span>
                {completedInvoice.guestPhone && (
                  <span className="text-slate-600 font-mono">{completedInvoice.guestPhone}</span>
                )}
                {completedInvoice.idProofType && (
                  <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                    ID Verified: {completedInvoice.idProofType}
                  </span>
                )}
              </div>

              <div className="text-right">
                <span className="text-slate-500 block">Suite / Room:</span>
                <span className="font-bold text-slate-900 block">Suite {completedInvoice.roomNumber}</span>
                <span className="text-slate-600 block">
                  Stay Duration: {completedInvoice.stayDuration}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block">
                  {new Date(completedInvoice.checkIn).toLocaleDateString()} → {new Date(completedInvoice.checkOut).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Room Service Line Items */}
            {completedInvoice.roomServiceOrders && completedInvoice.roomServiceOrders.length > 0 && (
              <div className="space-y-2">
                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block">
                  Itemized Room Service Orders
                </span>
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="pb-1">Order #</th>
                      <th className="pb-1">Time</th>
                      <th className="pb-1 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {completedInvoice.roomServiceOrders.map((ord: any, i: number) => (
                      <tr key={i}>
                        <td className="py-1 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                        <td className="py-1 text-slate-500 font-mono">
                          {new Date(ord.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="py-1 text-right font-mono font-bold">
                          {formatCurrency(ord.totalAmount || ord.total || 0, "INR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Total Settle */}
            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Total Folio Settled</span>
                <span className="text-[10px] text-emerald-700 font-semibold">
                  Paid at reception via UPI / Card / Cash
                </span>
              </div>
              <span className="text-xl font-black font-mono text-emerald-700">
                {formatCurrency(completedInvoice.folioBalance || completedInvoice.totalFoodAmount || 0, "INR")}
              </span>
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
