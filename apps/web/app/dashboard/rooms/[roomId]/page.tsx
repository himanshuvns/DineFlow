"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Hotel,
  ArrowLeft,
  Bed,
  Users,
  Sparkles,
  QrCode,
  Printer,
  Copy,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  BellOff,
  Phone,
  Mail,
  Receipt,
  UtensilsCrossed,
  ShieldCheck,
  Plus,
  Trash2,
  Edit3,
  Camera,
  UploadCloud,
  FileText,
  Check,
  FileCheck,
  Eye,
  MapPin,
  Calendar,
  LogOut,
  User,
  UserCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { QRCodeImage } from "@/components/ui/qr-code-image";
import { useAuthStore } from "@/lib/stores/auth-store";
import { apiClient } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { validateIndianPhone, formatIndianPhoneInput } from "@/lib/validation";
import { StaffOrderFoodModal } from "@/components/room/staff-order-food-modal";

interface RoomDetail {
  id: string;
  roomNumber: string;
  name: string;
  roomType: string;
  floor: string;
  wing: string;
  capacity: number;
  status: "vacant" | "occupied" | "reserved" | "cleaning" | "maintenance" | "out_of_service";
  doNotDisturb: boolean;
  folioEnabled: boolean;
  currentGuestId?: string;
  currentGuestName?: string;
  currentGuestPhone?: string;
  currentGuestEmail?: string;
  currentGuestAddress?: string;
  currentGuestNationality?: string;
  currentGuestIdProofType?: string;
  currentGuestIdProofUrl?: string;
  currentGuestFolioBalance?: number;
  currentGuestCheckIn?: string;
  currentGuestExpectedCheckOut?: string;
  currentGuestCount?: number;
  currentGuestSpecialRequests?: string;
  tenantSlug?: string;
  qrSlug?: string;
  amenities: string[];
  createdAt: string;
}

interface HousekeepingTask {
  id: string;
  _id?: string;
  roomNumber?: string;
  taskType: string;
  title: string;
  priority: string;
  assignedTo?: string;
  assignedToName?: string;
  status: "pending" | "in_progress" | "completed";
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  department?: string;
  phone?: string;
  employeeId?: string;
}

interface RoomOrder {
  id?: string;
  _id?: string;
  orderNumber: string;
  status: string;
  customerName?: string;
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
  totalAmount?: number;
  total?: number;
  createdAt: string;
  orderSource?: string;
  placedBy?: string;
  billingMethod?: string;
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
    checkInDate: new Date(start).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" }),
    checkInTime: new Date(start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    checkOutDate: new Date(end).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" }),
    checkOutTime: new Date(end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    nights,
    totalDays,
    currentDay,
    isProjected,
    stayDurationLabel: `${nights} Night${nights > 1 ? "s" : ""} • ${totalDays} Day${totalDays > 1 ? "s" : ""}`,
  };
};

const DEFAULT_FALLBACK_ROOMS: Record<string, Partial<RoomDetail>> = {
  "101": { id: "room-101", roomNumber: "101", name: "Deluxe King Suite 101", floor: "Floor 1", wing: "East Wing", roomType: "suite", status: "occupied", doNotDisturb: false, currentGuestName: "Vikram Malhotra" },
  "102": { id: "room-102", roomNumber: "102", name: "Executive Twin 102", floor: "Floor 1", wing: "East Wing", roomType: "room", status: "vacant", doNotDisturb: false },
  "104": { id: "room-104", roomNumber: "104", name: "Deluxe Suite 104", floor: "Floor 1", wing: "East Wing", roomType: "suite", status: "occupied", doNotDisturb: false, currentGuestName: "Guest Resident" },
  "201": { id: "room-201", roomNumber: "201", name: "Presidential Suite 201", floor: "Floor 2", wing: "Lakeview", roomType: "presidential", status: "occupied", doNotDisturb: true, currentGuestName: "Ananya Sharma" },
  "202": { id: "room-202", roomNumber: "202", name: "Garden Suite 202", floor: "Floor 2", wing: "Lakeview", roomType: "suite", status: "cleaning", doNotDisturb: false },
  "301": { id: "room-301", roomNumber: "301", name: "Sky Penthouse 301", floor: "Penthouse", wing: "Poolside", roomType: "penthouse", status: "occupied", doNotDisturb: false, currentGuestName: "Rohan Varma" },
  "302": { id: "room-302", roomNumber: "302", name: "Grand Chalet 302", floor: "Penthouse", wing: "Poolside", roomType: "chalet", status: "vacant", doNotDisturb: false },
};

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const { tenant } = useAuthStore();
  const tenantSlug = tenant?.slug || "dineflow";
  const tenantName = tenant?.name || "Your Hotel & Suites";

  const roomId = params?.roomId as string;

  const [room, setRoom] = React.useState<RoomDetail | null>(null);
  const [tasks, setTasks] = React.useState<HousekeepingTask[]>([]);
  const [staffList, setStaffList] = React.useState<StaffMember[]>([]);
  const [reassignTaskId, setReassignTaskId] = React.useState<string | null>(null);

  // Active task counts per staff (Housekeeper workload balancer: max 1 active task per housekeeper)
  const staffActiveTaskCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((t) => {
      if (t.status !== "completed" && t.assignedTo) {
        counts[t.assignedTo] = (counts[t.assignedTo] || 0) + 1;
        if (t.assignedToName) {
          counts[t.assignedToName] = (counts[t.assignedToName] || 0) + 1;
        }
      }
    });
    return counts;
  }, [tasks]);

  const [orders, setOrders] = React.useState<RoomOrder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const channelRef = React.useRef<BroadcastChannel | null>(null);

  // Modals
  const [isCheckInOpen, setIsCheckInOpen] = React.useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = React.useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = React.useState(false);
  const [isExtendStayOpen, setIsExtendStayOpen] = React.useState(false);
  const [extendStayDate, setExtendStayDate] = React.useState("");
  const [extendStayNights, setExtendStayNights] = React.useState(1);
  const [extendStayNotes, setExtendStayNotes] = React.useState("");
  const [extendingStay, setExtendingStay] = React.useState(false);

  // Staff Order Food & Stay Extension Approval states
  const [isStaffOrderFoodOpen, setIsStaffOrderFoodOpen] = React.useState(false);
  const [pendingExtension, setPendingExtension] = React.useState<any | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [processingExtension, setProcessingExtension] = React.useState(false);

  // CheckIn form
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

  // Edit Stay form state
  const [isEditStayOpen, setIsEditStayOpen] = React.useState(false);
  const [editName, setEditName] = React.useState("");
  const [editPhone, setEditPhone] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");
  const [editGuestCount, setEditGuestCount] = React.useState(1);
  const [editCheckInDate, setEditCheckInDate] = React.useState("");
  const [editExpectedCheckOutDate, setEditExpectedCheckOutDate] = React.useState("");
  const [editAddress, setEditAddress] = React.useState("");
  const [editNationality, setEditNationality] = React.useState("Indian");
  const [editIdProofType, setEditIdProofType] = React.useState("Aadhaar Card");
  const [editIdProofPreview, setEditIdProofPreview] = React.useState<string | null>(null);
  const [editSpecialRequests, setEditSpecialRequests] = React.useState("");
  const [isSavingStay, setIsSavingStay] = React.useState(false);
  const editFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // CheckOut / Stay Summary / Invoice state
  const [staySummaryLoading, setStaySummaryLoading] = React.useState(false);
  const [currentStaySummary, setCurrentStaySummary] = React.useState<any | null>(null);
  const [completedInvoice, setCompletedInvoice] = React.useState<any | null>(null);

  // Housekeeping task form
  const [taskTitle, setTaskTitle] = React.useState("");
  const [taskType, setTaskType] = React.useState("cleaning");
  const [taskPriority, setTaskPriority] = React.useState("normal");
  const [taskNotes, setTaskNotes] = React.useState("");

  const [baseUrl, setBaseUrl] = React.useState("https://dineflow-steel.vercel.app");

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.location.origin) {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const fetchRoomData = React.useCallback(async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      const [roomRes, ordersRes, tasksRes, allOrdersRes, extensionsRes, staffRes] = await Promise.allSettled([
        apiClient.get(`/rooms/${encodeURIComponent(roomId)}`),
        apiClient.get(`/rooms/${encodeURIComponent(roomId)}/orders`),
        apiClient.get(`/rooms/${encodeURIComponent(roomId)}/tasks`),
        apiClient.get("/orders"),
        apiClient.get("/rooms/extension-requests"),
        apiClient.get("/staff"),
      ]);

      let loadedRoom: RoomDetail | null = null;
      if (roomRes.status === "fulfilled" && roomRes.value.data?.data) {
        const r = roomRes.value.data.data;
        const currentGuest = r.currentGuest;
        loadedRoom = {
          id: r.id || r._id,
          roomNumber: r.roomNumber || "",
          name: r.name || `Room ${r.roomNumber}`,
          roomType: r.roomType || "suite",
          floor: r.floor || "Floor 2",
          wing: r.wing || "Main",
          capacity: r.capacity || 2,
          status: r.status === "available" ? "vacant" : (r.status || "vacant"),
          doNotDisturb: Boolean(r.doNotDisturb),
          folioEnabled: r.folioEnabled !== false,
          currentGuestId: currentGuest?.id || r.currentGuestId,
          currentGuestName: currentGuest?.name || r.currentGuestName,
          currentGuestPhone: currentGuest?.phone || r.currentGuestPhone,
          currentGuestEmail: currentGuest?.email,
          currentGuestAddress: currentGuest?.address,
          currentGuestNationality: currentGuest?.nationality,
          currentGuestIdProofType: currentGuest?.idProofType,
          currentGuestIdProofUrl: currentGuest?.idProofUrl,
          currentGuestFolioBalance: currentGuest?.folioBalance,
          currentGuestCheckIn: currentGuest?.checkIn || r.currentGuestCheckIn,
          currentGuestExpectedCheckOut: currentGuest?.expectedCheckOut || r.currentGuestExpectedCheckOut,
          currentGuestCount: currentGuest?.numberOfGuests || r.currentGuestCount || r.numberOfGuests || 1,
          currentGuestSpecialRequests: currentGuest?.specialRequests || r.currentGuestSpecialRequests || r.specialRequests,
          qrSlug: r.qrSlug || `room-${r.roomNumber}`,
          amenities: Array.isArray(r.amenities) && r.amenities.length > 0
            ? r.amenities
            : ["King Bed", "Ocean View", "Jacuzzi", "Mini Bar", "High-Speed Wi-Fi"],
          createdAt: r.createdAt || new Date().toISOString(),
        };
        setRoom(loadedRoom);
      }

      if (!loadedRoom) {
        const cleanNum = roomId.toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();
        const fallback = DEFAULT_FALLBACK_ROOMS[cleanNum] || DEFAULT_FALLBACK_ROOMS[roomId];
        if (fallback) {
          loadedRoom = {
            id: fallback.id || `room-${cleanNum.toLowerCase()}`,
            roomNumber: fallback.roomNumber || cleanNum,
            name: fallback.name || `Suite ${cleanNum}`,
            roomType: fallback.roomType || "suite",
            floor: fallback.floor || "Floor 1",
            wing: fallback.wing || "East Wing",
            capacity: fallback.capacity || 2,
            status: (fallback.status as any) || "occupied",
            doNotDisturb: Boolean(fallback.doNotDisturb),
            folioEnabled: fallback.folioEnabled !== false,
            currentGuestName: fallback.currentGuestName,
            amenities: ["King Bed", "High-Speed Wi-Fi", "En-Suite Bath"],
            createdAt: new Date().toISOString(),
          };
          setRoom(loadedRoom);
        } else if (cleanNum) {
          loadedRoom = {
            id: `room-${cleanNum.toLowerCase()}`,
            roomNumber: cleanNum,
            name: `Suite ${cleanNum}`,
            roomType: "suite",
            floor: "Floor 1",
            wing: "East Wing",
            capacity: 2,
            status: "occupied",
            doNotDisturb: false,
            folioEnabled: true,
            currentGuestName: "Guest Resident",
            amenities: ["King Bed", "High-Speed Wi-Fi", "En-Suite Bath"],
            createdAt: new Date().toISOString(),
          };
          setRoom(loadedRoom);
        }
      }

      const activeRoomNum = (loadedRoom?.roomNumber || room?.roomNumber || roomId)
        .toUpperCase()
        .replace(/^(ROOM-|SUITE-)/, "")
        .trim();
      if (activeRoomNum) {
        try {
          const dndRes = await fetch(
            `/api/room/dnd?tenantSlug=${encodeURIComponent(tenantSlug)}&roomNumber=${encodeURIComponent(activeRoomNum)}`,
            { cache: "no-store" }
          ).catch(() => null);
          if (dndRes && dndRes.ok) {
            const dndJson = await dndRes.json().catch(() => null);
            const dndVal = dndJson?.data?.dndStatus ?? dndJson?.dndStatus;
            if (typeof dndVal === "boolean") {
              setRoom((prev) => (prev ? { ...prev, doNotDisturb: dndVal } : prev));
            }
          }
        } catch (_) {}
      }

      // Collect and merge orders from both the room-specific endpoint and the tenant KDS queue
      const orderMap = new Map<string, RoomOrder>();
      const isOccupied = (loadedRoom?.status || room?.status) === "occupied";
      const guestCheckInStr = loadedRoom?.currentGuestCheckIn || room?.currentGuestCheckIn;
      const guestCheckInTime = guestCheckInStr ? new Date(guestCheckInStr).getTime() : null;

      // 1. Process orders returned by /rooms/:id/orders
      if (ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value.data?.data)) {
        for (const o of ordersRes.value.data.data) {
          // If room is occupied, only show orders placed during THIS active guest's stay
          if (isOccupied && guestCheckInTime) {
            const oTime = new Date(o.createdAt || "").getTime();
            if (oTime < guestCheckInTime) continue;
          }

          const key = o.orderNumber || o.id || o._id;
          if (key) {
            orderMap.set(key, {
              id: o.id || o._id,
              _id: o._id,
              orderNumber: o.orderNumber,
              status: (o.status || "pending").toLowerCase(),
              customerName: o.customerName,
              orderSource: o.orderSource,
              placedBy: o.placedBy,
              billingMethod: o.billingMethod,
              items: Array.isArray(o.items)
                ? o.items.map((it: any) => ({
                    name: it.name,
                    quantity: it.quantity || it.qty || 1,
                    unitPrice: it.unitPrice || it.price || 0,
                  }))
                : [],
              totalAmount: o.totalAmount || o.total || 0,
              total: o.totalAmount || o.total || 0,
              createdAt: o.createdAt || new Date().toISOString(),
            });
          }
        }
      }

      // 2. Process all tenant orders from KDS (/orders)
      // This guarantees that any order displayed on KDS for this room is also visible in this suite section
      if (allOrdersRes.status === "fulfilled" && Array.isArray(allOrdersRes.value.data?.data)) {
        const roomNum = (loadedRoom?.roomNumber || room?.roomNumber || "").toUpperCase().trim();
        const currentRoomId = (loadedRoom?.id || roomId || "").trim();

        for (const o of allOrdersRes.value.data.data) {
          // If room is occupied, do NOT show orders placed before this guest checked in
          if (isOccupied && guestCheckInTime) {
            const oTime = new Date(o.createdAt || "").getTime();
            if (oTime < guestCheckInTime) continue;
          }

          const oRoomId = String(o.roomId || o.tableId || "").trim();
          const oRoomNum = String(o.roomNumber || "").toUpperCase().trim();
          const oTable = String(o.tableName || o.table || "").toUpperCase().trim();
          const isRoomService = o.destination === "room_service" || oTable.startsWith("SUITE") || oTable.startsWith("ROOM");

          const matchesRoom =
            (currentRoomId && oRoomId === currentRoomId) ||
            (roomNum && oRoomNum === roomNum) ||
            (roomNum && (oTable === `SUITE ${roomNum}` || oTable === `ROOM ${roomNum}` || oTable.includes(roomNum))) ||
            (isRoomService && roomNum && oTable.includes(roomNum));

          if (matchesRoom) {
            const key = o.orderNumber || o.id || o._id;
            if (key && !orderMap.has(key)) {
              orderMap.set(key, {
                id: o.id || o._id,
                _id: o._id,
                orderNumber: o.orderNumber,
                status: (o.status || "pending").toLowerCase(),
                customerName: o.customerName,
                orderSource: o.orderSource,
                placedBy: o.placedBy,
                billingMethod: o.billingMethod,
                items: Array.isArray(o.items)
                  ? o.items.map((it: any) => ({
                      name: it.name,
                      quantity: it.quantity || it.qty || 1,
                      unitPrice: it.unitPrice || it.price || 0,
                    }))
                  : [],
                totalAmount: o.totalAmount || o.total || 0,
                total: o.totalAmount || o.total || 0,
                createdAt: o.createdAt || new Date().toISOString(),
              });
            }
          }
        }
      }

      // 3. Process stay extension requests (Go backend + Next.js fallback store)
      let foundPending: any = null;
      let foundApproved: any = null;
      if (extensionsRes.status === "fulfilled") {
        const data = extensionsRes.value.data?.data || extensionsRes.value.data;
        const list = Array.isArray(data?.requests) ? data.requests : Array.isArray(data) ? data : [];
        const roomNum = (loadedRoom?.roomNumber || room?.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();
        const currentRoomId = (loadedRoom?.id || roomId || "").trim();
        foundPending = list.find((req: any) =>
          req.status === "pending" && (
            (currentRoomId && String(req.roomId || "").trim() === currentRoomId) ||
            (roomNum && String(req.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim() === roomNum)
          )
        );
        foundApproved = list.find((req: any) =>
          req.status === "approved" && (
            (currentRoomId && String(req.roomId || "").trim() === currentRoomId) ||
            (roomNum && String(req.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim() === roomNum)
          )
        );
      }

      if (!foundPending) {
        try {
          const localExtRes = await fetch(
            `/api/room/extend-stay?all=true&tenantSlug=${encodeURIComponent(tenantSlug || "the-grand-bistro")}`,
            { cache: "no-store" }
          ).catch(() => null);
          if (localExtRes && localExtRes.ok) {
            const extJson = await localExtRes.json().catch(() => null);
            const list = Array.isArray(extJson?.data?.requests)
              ? extJson.data.requests
              : Array.isArray(extJson?.requests)
              ? extJson.requests
              : [];
            const roomNum = (loadedRoom?.roomNumber || room?.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();
            const currentRoomId = (loadedRoom?.id || roomId || "").trim();
            foundPending = list.find((req: any) =>
              req.status === "pending" && (
                (currentRoomId && String(req.roomId || "").trim() === currentRoomId) ||
                (roomNum && String(req.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim() === roomNum)
              )
            );
            if (!foundApproved) {
              foundApproved = list.find((req: any) =>
                req.status === "approved" && (
                  (currentRoomId && String(req.roomId || "").trim() === currentRoomId) ||
                  (roomNum && String(req.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim() === roomNum)
                )
              );
            }
          }
        } catch (_) {}
      }

      setPendingExtension(foundPending || null);
      if (foundApproved?.requestedCheckout && loadedRoom) {
        loadedRoom.currentGuestExpectedCheckOut = foundApproved.requestedCheckout;
      }

      const mergedOrders = Array.from(orderMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(mergedOrders);

      if (tasksRes.status === "fulfilled" && Array.isArray(tasksRes.value.data?.data)) {
        const targetRoomNum = (loadedRoom?.roomNumber || room?.roomNumber || "").toUpperCase().trim();
        const targetRoomId = (loadedRoom?.id || roomId || "").trim();

        // Strictly isolate tasks to this room only and to the current guest's stay
        const roomSpecificTasks = tasksRes.value.data.data.filter((t: any) => {
          // If room is occupied, NEVER show turnover checkout cleaning tasks from prior guest
          if (isOccupied && (t.title.includes("Checkout Deep Clean") || t.title.includes("Linen Refresh"))) {
            return false;
          }
          if (isOccupied && guestCheckInTime) {
            const tTime = new Date(t.createdAt || "").getTime();
            if (tTime < guestCheckInTime) return false;
          }

          const tRoomId = String(t.roomId || "").trim();
          const tRoomNum = String(t.roomNumber || "").toUpperCase().trim();
          const tTitle = String(t.title || "").toUpperCase().trim();

          // Exclude tasks that explicitly belong to a different room
          if (tRoomNum && targetRoomNum && tRoomNum !== targetRoomNum) return false;
          const match = tTitle.match(/(SUITE|ROOM)\s+(\d+)/i);
          if (match && targetRoomNum && match[2] !== targetRoomNum) return false;

          // 1. Matches this room's ObjectID
          if (targetRoomId && tRoomId === targetRoomId) return true;
          // 2. Matches this room's number
          if (targetRoomNum && tRoomNum === targetRoomNum) return true;
          // 3. Title contains this suite/room designation
          if (targetRoomNum && (tTitle.includes(`SUITE ${targetRoomNum}`) || tTitle.includes(`ROOM ${targetRoomNum}`))) {
            return true;
          }

          return false;
        });

        const apiStaff = staffRes.status === "fulfilled" && Array.isArray(staffRes.value.data?.data)
          ? staffRes.value.data.data
          : [];
        const staffMap = new Map<string, StaffMember>();
        apiStaff.forEach((s: any) => {
          const id = s.id || s._id;
          if (id) {
            staffMap.set(id, {
              id,
              name: s.name || s.fullName || s.email || "Staff Member",
              role: s.role || "staff",
              department: s.department || "",
              phone: s.phone || "",
              employeeId: s.employeeId || "",
            });
          }
        });
        const currentStaffList: StaffMember[] = Array.from(staffMap.values());

        let combinedRoomTasks = [...roomSpecificTasks];

        // Also merge tasks from /api/room/tasks proxy store
        try {
          const targetCleanNum = (loadedRoom?.roomNumber || room?.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();
          const localTasksRes = await fetch(`/api/room/tasks?slug=${encodeURIComponent(tenantSlug)}&room=${encodeURIComponent(targetCleanNum)}`, { cache: "no-store" }).catch(() => null);
          if (localTasksRes && localTasksRes.ok) {
            const localJson = await localTasksRes.json().catch(() => null);
            const list = Array.isArray(localJson?.tasks) ? localJson.tasks : Array.isArray(localJson?.data?.tasks) ? localJson.data.tasks : [];
            list.forEach((lt: any) => {
              const existingIdx = combinedRoomTasks.findIndex((t: any) => (t.id || t._id) === (lt.id || lt._id));
              if (existingIdx !== -1) {
                combinedRoomTasks[existingIdx] = {
                  ...combinedRoomTasks[existingIdx],
                  assignedTo: lt.assignedTo || combinedRoomTasks[existingIdx].assignedTo,
                  assignedToName: lt.assignedToName || combinedRoomTasks[existingIdx].assignedToName,
                  status: lt.status || combinedRoomTasks[existingIdx].status,
                };
              } else {
                combinedRoomTasks.push(lt);
              }
            });
          }
        } catch (_) {}

        // Also merge tasks from localStorage for instant 0ms latency
        if (typeof window !== "undefined") {
          try {
            const targetCleanNum = (loadedRoom?.roomNumber || room?.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();
            const storageKey = `dineflow_tasks_${tenantSlug}_${targetCleanNum}`;
            const cached = localStorage.getItem(storageKey);
            if (cached) {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed)) {
                parsed.forEach((lt: any) => {
                  const existingIdx = combinedRoomTasks.findIndex((t: any) => (t.id || t._id) === (lt.id || lt._id));
                  if (existingIdx !== -1) {
                    combinedRoomTasks[existingIdx] = {
                      ...combinedRoomTasks[existingIdx],
                      assignedTo: lt.assignedTo || combinedRoomTasks[existingIdx].assignedTo,
                      assignedToName: lt.assignedToName || combinedRoomTasks[existingIdx].assignedToName,
                      status: lt.status || combinedRoomTasks[existingIdx].status,
                    };
                  } else {
                    combinedRoomTasks.push(lt);
                  }
                });
              }
            }
          } catch (_) {}
        }

        const mappedTasks = combinedRoomTasks.map((t: any) => {
          const staffObj = currentStaffList.find((s: any) => (s.id || s._id) === t.assignedTo);
          return {
            ...t,
            id: t.id || t._id,
            assignedTo: t.assignedTo || "",
            assignedToName: t.assignedToName || staffObj?.name || "",
          };
        });

        setTasks(mappedTasks);
        setStaffList(currentStaffList);
      }
    } catch (e) {
      console.warn("Failed to load room details:", e);
    } finally {
      setLoading(false);
    }
  }, [roomId, room?.roomNumber, room?.id]);

  React.useEffect(() => {
    fetchRoomData();
    const interval = setInterval(fetchRoomData, 5000);
    return () => clearInterval(interval);
  }, [fetchRoomData]);

  // Listen for real-time DND sync from customer portal or other tabs
  React.useEffect(() => {
    let channel: BroadcastChannel | null = null;
    const handleSync = (cleanRoom: string, dndVal: boolean, roomIdTarget?: string) => {
      setRoom((prev) => {
        if (!prev) return prev;
        const currentRoomNum = (prev.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();
        if (currentRoomNum === cleanRoom || (roomIdTarget && prev.id === roomIdTarget)) {
          return { ...prev, doNotDisturb: dndVal };
        }
        return prev;
      });
    };

    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        channelRef.current = new BroadcastChannel("dineflow_dnd_sync");
        channelRef.current.onmessage = (event) => {
          if (event.data?.type === "DND_STATUS_CHANGED" && event.data.roomNumber) {
            handleSync(event.data.roomNumber, Boolean(event.data.dndStatus), event.data.roomId);
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
        const rNum = parts[parts.length - 1];
        if (rNum) {
          handleSync(rNum, e.newValue === "true");
        }
      }
    };

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.roomNumber) {
        handleSync(customEvent.detail.roomNumber, Boolean(customEvent.detail.dndStatus), customEvent.detail.roomId);
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
      const targetRoom = String(data.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();
      const currentRoom = (room?.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();

      if (data.type === "STAY_EXTENSION_REQUESTED") {
        if (!targetRoom || !currentRoom || targetRoom === currentRoom) {
          if (data.request) {
            setPendingExtension(data.request);
          }
        }
        fetchRoomData();
      } else if (data.type === "STAY_EXTENSION_APPROVED" || data.type === "STAY_EXTENSION_REJECTED") {
        if (!targetRoom || !currentRoom || targetRoom === currentRoom) {
          setPendingExtension(null);
          if (data.type === "STAY_EXTENSION_APPROVED" && data.newCheckout) {
            setRoom((prev: any) => prev ? { ...prev, currentGuestExpectedCheckOut: data.newCheckout } : prev);
          }
        }
        fetchRoomData();
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
  }, [room?.roomNumber, fetchRoomData]);

  // Real-time listener for housekeeping tasks created from customer room portal
  React.useEffect(() => {
    let taskChannel: BroadcastChannel | null = null;
    const handleTaskSync = () => {
      fetchRoomData();
    };

    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        taskChannel = new BroadcastChannel("dineflow_task_sync");
        taskChannel.onmessage = () => handleTaskSync();
      }
    } catch (_) {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith("dineflow_tasks_") || e.key === "dineflow_task_created") {
        handleTaskSync();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("dineflow_task_created", handleTaskSync);

    return () => {
      if (taskChannel) {
        try { taskChannel.close(); } catch (_) {}
      }
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("dineflow_task_created", handleTaskSync);
    };
  }, [fetchRoomData]);

  const handleToggleDND = async () => {
    if (!room) return;
    const nextDND = !room.doNotDisturb;
    const cleanRoom = (room.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();

    setRoom({ ...room, doNotDisturb: nextDND });

    try {
      if (typeof window !== "undefined") {
        const payload = {
          type: "DND_STATUS_CHANGED",
          tenantSlug,
          roomNumber: cleanRoom,
          roomId: room.id,
          dndStatus: nextDND,
          timestamp: Date.now(),
        };
        if (channelRef.current) {
          channelRef.current.postMessage(payload);
        }
        localStorage.setItem(`dineflow_dnd_${tenantSlug}_${cleanRoom}`, String(nextDND));
        localStorage.setItem(`dineflow_dnd_${cleanRoom}`, String(nextDND));
        localStorage.setItem("dineflow_dnd_sync", JSON.stringify(payload));
        window.dispatchEvent(new CustomEvent("dineflow_dnd_change", { detail: payload }));
      }
    } catch (_) {}

    // Resilient server-side update
    fetch("/api/room/dnd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantSlug,
        roomNumber: cleanRoom,
        dndStatus: nextDND,
        updatedBy: "staff",
      }),
    }).catch(() => null);

    try {
      await apiClient.patch(`/rooms/${encodeURIComponent(room.id)}/dnd`, { doNotDisturb: nextDND });
      addToast(
        "info",
        "Do Not Disturb Updated",
        nextDND ? "Room marked DND (stewards alerted not to knock)." : "DND cleared for this room."
      );
    } catch (e) {
      console.warn("DND toggle error:", e);
    }
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

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !guestName.trim() || !guestPhone.trim()) return;

    const phoneValidation = validateIndianPhone(guestPhone);
    if (!phoneValidation.isValid) {
      addToast(
        "error",
        "Invalid Indian Mobile",
        phoneValidation.error || "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9."
      );
      return;
    }

    const maxCap = room.capacity || 2;
    if (guestCount > maxCap) {
      addToast(
        "error",
        "Capacity Exceeded",
        `${room.name} has a maximum capacity of ${maxCap} guest${maxCap > 1 ? "s" : ""}. Please adjust the guest count.`
      );
      return;
    }

    try {
      const res = await apiClient.post(`/rooms/${encodeURIComponent(room.id)}/check-in`, {
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

      if (res.data?.data?.room) {
        setRoom(res.data.data.room);
      } else {
        setRoom({
          ...room,
          status: "occupied",
          currentGuestName: guestName.trim(),
          currentGuestPhone: phoneValidation.normalized,
          currentGuestIdProofType: guestIdProof,
        });
      }

      setOrders([]);
      setTasks([]);
      try {
        const cleanNum = (room.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "");
        localStorage.removeItem(`dineflow_tasks_${tenantSlug}_${cleanNum}`);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("dineflow_task_created"));
        }
      } catch (_) {}

      setIsCheckInOpen(false);
      setGuestName("");
      setGuestPhone("");
      setGuestEmail("");
      setGuestAddress("");
      setIdProofFile(null);
      setIdProofPreview(null);
      setSpecialRequests("");
      addToast("success", "Guest Checked In", `${guestName} is now in-house in ${room.name} with verified ${guestIdProof}.`);
      fetchRoomData();
    } catch (e: any) {
      addToast("error", "Check-In Failed", e?.response?.data?.message || "Could not check in guest.");
    }
  };

  const handleOpenEditStay = () => {
    if (!room) return;
    setEditName(room.currentGuestName || "");
    setEditPhone(room.currentGuestPhone || "");
    setEditEmail(room.currentGuestEmail || "");
    setEditGuestCount(room.currentGuestCount || 1);

    if (room.currentGuestCheckIn) {
      try {
        const d = new Date(room.currentGuestCheckIn);
        setEditCheckInDate(d.toISOString().slice(0, 16));
      } catch {
        setEditCheckInDate(new Date().toISOString().slice(0, 16));
      }
    } else {
      setEditCheckInDate(new Date().toISOString().slice(0, 16));
    }

    if (room.currentGuestExpectedCheckOut) {
      try {
        const d = new Date(room.currentGuestExpectedCheckOut);
        setEditExpectedCheckOutDate(d.toISOString().slice(0, 16));
      } catch {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        setEditExpectedCheckOutDate(d.toISOString().slice(0, 16));
      }
    } else {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      setEditExpectedCheckOutDate(d.toISOString().slice(0, 16));
    }

    setEditAddress(room.currentGuestAddress || "");
    setEditNationality(room.currentGuestNationality || "Indian");
    setEditIdProofType(room.currentGuestIdProofType || "Aadhaar Card");
    setEditIdProofPreview(room.currentGuestIdProofUrl || null);
    setEditSpecialRequests(room.currentGuestSpecialRequests || "");
    setIsEditStayOpen(true);
  };

  const handleEditIDFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        addToast("error", "File Too Large", "ID document must be under 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setEditIdProofPreview(reader.result as string);
        addToast("info", "ID Document Attached", `${file.name} ready for saving.`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveStaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !editName.trim()) return;

    let normalizedPhone = editPhone.trim();
    if (normalizedPhone) {
      const phoneValidation = validateIndianPhone(normalizedPhone);
      if (!phoneValidation.isValid) {
        addToast(
          "error",
          "Invalid Indian Mobile",
          phoneValidation.error || "Please enter a valid 10-digit Indian mobile number."
        );
        return;
      }
      normalizedPhone = phoneValidation.normalized;
    }

    const maxCap = room.capacity || 2;
    if (editGuestCount > maxCap) {
      addToast(
        "error",
        "Capacity Exceeded",
        `${room.name} has a maximum capacity of ${maxCap} guest${maxCap > 1 ? "s" : ""}. Please adjust the guest count.`
      );
      return;
    }

    setIsSavingStay(true);
    try {
      const payload: any = {
        name: editName.trim(),
        phone: normalizedPhone || undefined,
        email: editEmail.trim() || undefined,
        numberOfGuests: Number(editGuestCount) || 1,
        checkIn: editCheckInDate ? new Date(editCheckInDate).toISOString() : undefined,
        expectedCheckOut: editExpectedCheckOutDate ? new Date(editExpectedCheckOutDate).toISOString() : undefined,
        address: editAddress.trim() || undefined,
        nationality: editNationality.trim() || "Indian",
        idProofType: editIdProofType,
        idProofUrl: editIdProofPreview || undefined,
        specialRequests: editSpecialRequests.trim() || undefined,
      };

      await apiClient.put(`/rooms/${encodeURIComponent(room.id)}/guest`, payload);

      addToast("success", "Stay Information Updated", `Guest stay details for ${editName} updated successfully.`);
      setIsEditStayOpen(false);
      fetchRoomData();
    } catch (e: any) {
      console.error("Save stay error:", e);
      addToast("error", "Update Failed", e?.response?.data?.message || "Could not update stay information.");
    } finally {
      setIsSavingStay(false);
    }
  };

  const handleClearStayHistory = async () => {
    if (!room) return;
    if (!confirm("Are you sure you want to purge all prior stay orders and housekeeping tasks for this suite?")) return;
    try {
      await apiClient.delete(`/rooms/${encodeURIComponent(room.id)}/history`);
      setOrders([]);
      setTasks([]);
      try {
        const cleanNum = (room.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "");
        localStorage.removeItem(`dineflow_tasks_${tenantSlug}_${cleanNum}`);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("dineflow_task_created"));
        }
      } catch (_) {}
      addToast("success", "Stay Records Purged", "Previous orders and housekeeping tasks have been purged.");
      fetchRoomData();
    } catch (e: any) {
      addToast("error", "Purge Failed", e?.response?.data?.message || "Could not purge history.");
    }
  };

  const handleOpenExtendStay = () => {
    if (!room) return;
    setIsExtendStayOpen(true);
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
    if (!room || !extendStayDate) return;

    try {
      setExtendingStay(true);
      const [y, m, d] = extendStayDate.split("-").map(Number);
      const isoDate = new Date(Date.UTC(y, m - 1, d, 11, 0, 0)).toISOString();

      await apiClient.post(`/rooms/${encodeURIComponent(room.id)}/extend-stay`, {
        newCheckOut: isoDate,
        additionalNights: extendStayNights,
        notes: extendStayNotes,
      });

      addToast(
        "success",
        "Stay Extended Successfully",
        `${room.name} reservation extended to ${new Date(isoDate).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })} at 11:00 AM.`
      );

      setIsExtendStayOpen(false);
      fetchRoomData();
    } catch (err: any) {
      addToast("error", "Extension Failed", err?.response?.data?.message || err?.message || "Could not extend stay.");
    } finally {
      setExtendingStay(false);
    }
  };

  const handleApproveExtension = async () => {
    if (!pendingExtension) return;
    try {
      setProcessingExtension(true);
      const cleanNum = (room?.roomNumber || pendingExtension.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "");

      // 1. Attempt Go backend (fails gracefully if local Go server is offline)
      try {
        await apiClient.post(`/rooms/extension-requests/${encodeURIComponent(pendingExtension.id)}/approve`, {
          notes: "Approved by Front Desk",
        });
      } catch (err) {
        console.warn("Go backend approve extension request offline/failed:", err);
      }

      // 2. Resilient Next.js store update
      await fetch("/api/room/extend-stay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          requestId: pendingExtension.id,
          roomNumber: cleanNum,
          tenantSlug: room?.tenantSlug || tenantSlug || "the-grand-bistro",
          newCheckout: pendingExtension.requestedCheckout,
          additionalNights: pendingExtension.additionalNights,
          notes: "Approved by Front Desk",
        }),
      }).catch((e) => console.warn("Local store approve failed:", e));

      // 3. Broadcast real-time event to customer portal and client dashboard
      const syncPayload = {
        type: "STAY_EXTENSION_APPROVED",
        requestId: pendingExtension.id,
        roomNumber: cleanNum,
        roomId: room?.id || roomId,
        newCheckout: pendingExtension.requestedCheckout,
        additionalNights: pendingExtension.additionalNights,
      };
      if (typeof window !== "undefined") {
        try {
          const ch = new BroadcastChannel("dineflow_extension_sync");
          ch.postMessage(syncPayload);
          ch.close();
        } catch (_) {}
        localStorage.setItem("dineflow_extension_sync", JSON.stringify({ ...syncPayload, _t: Date.now() }));
        window.dispatchEvent(new CustomEvent("dineflow_extension_sync", { detail: syncPayload }));
      }

      // 4. Update room checkout date immediately in state
      setRoom((prev: any) =>
        prev ? { ...prev, currentGuestExpectedCheckOut: pendingExtension.requestedCheckout } : prev
      );

      addToast(
        "success",
        "Stay Extension Approved",
        `Guest stay in ${room?.name} extended to ${new Date(pendingExtension.requestedCheckout).toLocaleDateString()}. Checkout updated.`
      );
      setPendingExtension(null);
      fetchRoomData();
    } catch (err: any) {
      console.error("Failed to approve stay extension:", err);
      addToast("error", "Approval Failed", err?.response?.data?.message || err?.message || "Could not approve extension.");
    } finally {
      setProcessingExtension(false);
    }
  };

  const handleRejectExtension = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingExtension) return;
    try {
      setProcessingExtension(true);
      const cleanNum = (room?.roomNumber || pendingExtension.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "");
      const reason = rejectionReason.trim() || "Room is committed to an incoming reservation.";

      // 1. Attempt Go backend
      try {
        await apiClient.post(`/rooms/extension-requests/${encodeURIComponent(pendingExtension.id)}/reject`, {
          reason,
        });
      } catch (err) {
        console.warn("Go backend reject extension request offline/failed:", err);
      }

      // 2. Resilient Next.js store update
      await fetch("/api/room/extend-stay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          requestId: pendingExtension.id,
          roomNumber: cleanNum,
          tenantSlug: room?.tenantSlug || tenantSlug || "the-grand-bistro",
          reason,
        }),
      }).catch((e) => console.warn("Local store reject failed:", e));

      // 3. Broadcast real-time event to customer portal and dashboard
      const syncPayload = {
        type: "STAY_EXTENSION_REJECTED",
        requestId: pendingExtension.id,
        roomNumber: cleanNum,
        roomId: room?.id || roomId,
        reason,
      };
      if (typeof window !== "undefined") {
        try {
          const ch = new BroadcastChannel("dineflow_extension_sync");
          ch.postMessage(syncPayload);
          ch.close();
        } catch (_) {}
        localStorage.setItem("dineflow_extension_sync", JSON.stringify({ ...syncPayload, _t: Date.now() }));
        window.dispatchEvent(new CustomEvent("dineflow_extension_sync", { detail: syncPayload }));
      }

      addToast(
        "info",
        "Extension Request Declined",
        "The guest stay extension request has been declined and updated."
      );
      setIsRejectModalOpen(false);
      setPendingExtension(null);
      setRejectionReason("");
      fetchRoomData();
    } catch (err: any) {
      console.error("Failed to reject stay extension:", err);
      addToast("error", "Rejection Failed", err?.response?.data?.message || err?.message || "Could not decline extension.");
    } finally {
      setProcessingExtension(false);
    }
  };

  const handleInitiateCheckOut = async () => {
    if (!room) return;
    setIsCheckOutOpen(true);
    setCurrentStaySummary(null);
    setStaySummaryLoading(true);
    try {
      const res = await apiClient.get(`/rooms/${encodeURIComponent(room.id)}/stay-summary`);
      if (res.data?.data) {
        const summary = res.data.data;
        if ((!summary.roomServiceOrders || summary.roomServiceOrders.length === 0) && orders.length > 0) {
          summary.roomServiceOrders = orders;
          summary.totalOrders = orders.length;
          let foodTotal = 0;
          for (const o of orders) {
            foodTotal += o.totalAmount || o.total || 0;
          }
          summary.totalFoodAmount = foodTotal;
          if (summary.folioBalance <= 0) {
            summary.folioBalance = foodTotal;
          }
        }
        setCurrentStaySummary(summary);
      }
    } catch (e) {
      console.warn("Could not fetch stay summary preview:", e);
      let foodTotal = 0;
      for (const o of orders) {
        foodTotal += o.totalAmount || o.total || 0;
      }
      setCurrentStaySummary({
        guestName: room.currentGuestName || (orders.length > 0 ? orders[0].customerName : undefined) || "In-House Guest",
        guestPhone: room.currentGuestPhone || "",
        roomNumber: room.roomNumber,
        roomName: room.name,
        roomType: room.roomType,
        floor: room.floor,
        wing: room.wing,
        checkIn: room.currentGuestCheckIn || room.createdAt,
        checkOut: new Date().toISOString(),
        stayDuration: "Current Stay",
        roomServiceOrders: orders,
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => o.status === "pending" || o.status === "preparing").length,
        totalFoodAmount: foodTotal,
        folioBalance: room.currentGuestFolioBalance || foodTotal,
        settlementStatus: "charged_to_folio",
      });
    } finally {
      setStaySummaryLoading(false);
    }
  };

  const handleCheckOutSubmit = async () => {
    if (!room) return;
    try {
      const res = await apiClient.post(`/rooms/${encodeURIComponent(room.id)}/check-out`, {});
      const summary = res.data?.data?.staySummary || currentStaySummary;
      setCompletedInvoice(summary);
      setOrders([]);
      setTasks([]);
      setRoom({
        ...room,
        status: "cleaning",
        currentGuestId: undefined,
        currentGuestName: undefined,
        currentGuestPhone: undefined,
        currentGuestCheckIn: undefined,
      });
      // Purge local task storage for this suite so guest portal resets to 0
      try {
        const cleanNum = (room.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "");
        localStorage.removeItem(`dineflow_tasks_${tenantSlug}_${cleanNum}`);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("dineflow_task_created"));
        }
      } catch (_) {}
      setIsCheckOutOpen(false);
      addToast("success", "Guest Checked Out", `${room.name} marked for Housekeeping. Stay summary generated.`);
      fetchRoomData();
    } catch (e: any) {
      addToast("error", "Check-Out Failed", e?.response?.data?.message || "Could not check out.");
    }
  };

  const handleMarkCleanAndReady = async () => {
    if (!room) return;
    try {
      await apiClient.patch(`/rooms/${encodeURIComponent(room.id)}/status`, { status: "vacant" });
      setRoom({ ...room, status: "vacant" });
      addToast("success", "Room Clean & Ready", `${room.name} is now vacant and available for next check-in.`);
    } catch (e) {
      console.warn("Status update error:", e);
    }
  };

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !taskTitle.trim()) return;

    try {
      await apiClient.post(`/rooms/${encodeURIComponent(room.id)}/tasks`, {
        title: taskTitle.trim(),
        taskType,
        priority: taskPriority,
        notes: taskNotes.trim(),
      });

      setIsNewTaskOpen(false);
      setTaskTitle("");
      setTaskNotes("");
      addToast("success", "Task Dispatched", "Housekeeping steward alerted.");
      fetchRoomData();
    } catch (e: any) {
      addToast("error", "Task Failed", e?.response?.data?.message || "Could not create task.");
    }
  };

  const handleApproveTask = async (taskId: string) => {
    const cleanTaskId = taskId || "";
    const targetTask = tasks.find((t) => (t.id || t._id) === cleanTaskId);

    let assignedStaffId = targetTask?.assignedTo || "";
    let assignedStaffName = targetTask?.assignedToName || "";

    // If task has no staff assigned yet, auto-assign first available housekeeper with 0 active tasks
    if (!assignedStaffId && staffList.length > 0) {
      const availStaff = staffList.find((s) => (staffActiveTaskCounts[s.id] || 0) === 0);
      if (availStaff) {
        assignedStaffId = availStaff.id;
        assignedStaffName = availStaff.name;
      }
    }

    // 1. Optimistic state update immediately for 0ms transition to "Service Started"
    setTasks((prev) =>
      prev.map((t) =>
        (t.id || t._id) === cleanTaskId
          ? {
              ...t,
              status: "in_progress",
              assignedTo: assignedStaffId || t.assignedTo,
              assignedToName: assignedStaffName || t.assignedToName,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );

    // 2. Persist to localStorage for 0ms multi-tab and live tracker synchronization
    const cleanNum = (room?.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();
    const storageKey = `dineflow_tasks_${tenantSlug}_${cleanNum}`;
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        const updated = parsed.map((t: any) =>
          (t.id || t._id) === cleanTaskId
            ? {
                ...t,
                status: "in_progress",
                assignedTo: assignedStaffId || t.assignedTo,
                assignedToName: assignedStaffName || t.assignedToName,
                updatedAt: new Date().toISOString(),
              }
            : t
        );
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
    } catch (_) {}

    // 3. Dispatch global event to notify customer suite tracker and all dashboard widgets
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("dineflow_task_created"));
    }

    addToast(
      "success",
      "Service Started",
      assignedStaffName
        ? `Housekeeping service started. ${assignedStaffName} is attending to the suite.`
        : "Housekeeping service started. Steward is attending to the suite."
    );

    // 4. Remote API calls with graceful fallbacks
    const patchPayload: any = { status: "in_progress" };
    if (assignedStaffId) {
      patchPayload.assignedTo = assignedStaffId;
      patchPayload.assignedToName = assignedStaffName;
    }

    try {
      try {
        await apiClient.patch(`/rooms/tasks/${encodeURIComponent(cleanTaskId)}`, patchPayload);
      } catch (patchErr) {
        if (room?.id) {
          await apiClient.patch(`/rooms/${encodeURIComponent(room.id)}/tasks/${encodeURIComponent(cleanTaskId)}`, patchPayload).catch(() => null);
        }
      }

      // Also sync with Next.js local task store
      await fetch("/api/room/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: cleanTaskId, ...patchPayload }),
      }).catch(() => null);

      fetchRoomData();
    } catch (e) {
      console.warn("Approve task error:", e);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    const cleanTaskId = taskId || "";
    try {
      try {
        await apiClient.patch(`/rooms/tasks/${encodeURIComponent(cleanTaskId)}`, {
          status: "completed",
        });
      } catch (patchErr) {
        if (room?.id) {
          await apiClient.patch(`/rooms/${encodeURIComponent(room.id)}/tasks/${encodeURIComponent(cleanTaskId)}`, {
            status: "completed",
          }).catch(() => null);
        }
      }

      // Also sync with Next.js local task store
      await fetch("/api/room/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: cleanTaskId, status: "completed" }),
      }).catch(() => null);

      // Update localStorage for zero latency
      const cleanNum = (room?.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();
      const storageKey = `dineflow_tasks_${tenantSlug}_${cleanNum}`;
      try {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          const updated = parsed.map((t: any) =>
            (t.id || t._id) === cleanTaskId ? { ...t, status: "completed", completedAt: new Date().toISOString() } : t
          );
          localStorage.setItem(storageKey, JSON.stringify(updated));
        }
      } catch (_) {}

      setTasks((prev) =>
        prev.map((t) =>
          (t.id || t._id) === cleanTaskId
            ? { ...t, status: "completed", completedAt: new Date().toISOString() }
            : t
        )
      );

      addToast("success", "Task Completed", "Housekeeping task marked as finished. Housekeeper is now available.");
      fetchRoomData();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("dineflow_task_created"));
      }
    } catch (e) {
      console.warn("Complete task error:", e);
    }
  };

  const handleAssignStaff = async (taskId: string, staffId: string, staffName: string) => {
    const cleanTaskId = taskId || "";
    const targetTask = tasks.find((t) => (t.id || t._id) === cleanTaskId);
    if (!targetTask) return;

    // Strict workload balance guardrail: Two requests cannot go to one housekeeper!
    const currentStaffActiveCount = staffActiveTaskCounts[staffId] || 0;
    if (staffId && currentStaffActiveCount >= 1 && targetTask.assignedTo !== staffId) {
      addToast(
        "warning",
        "Workload Limit Reached",
        `${staffName} already has an active task. Two requests cannot go to one housekeeper.`
      );
      return;
    }

    // 1. Optimistic state update immediately
    setTasks((prev) =>
      prev.map((t) =>
        (t.id || t._id) === cleanTaskId
          ? { ...t, assignedTo: staffId, assignedToName: staffName, updatedAt: new Date().toISOString() }
          : t
      )
    );

    // 2. Immediate localStorage update
    const cleanNum = (room?.roomNumber || "").toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();
    const storageKey = `dineflow_tasks_${tenantSlug}_${cleanNum}`;
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        const updated = parsed.map((t: any) =>
          (t.id || t._id) === cleanTaskId
            ? { ...t, assignedTo: staffId, assignedToName: staffName, updatedAt: new Date().toISOString() }
            : t
        );
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
    } catch (_) {}

    // 3. Dispatch global event immediately
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("dineflow_task_created"));
    }

    addToast(
      "success",
      "Staff Assigned",
      `Task assigned to ${staffName}. WhatsApp dispatch sent.`
    );

    // 4. Remote API calls
    try {
      try {
        await apiClient.patch(`/rooms/tasks/${encodeURIComponent(cleanTaskId)}`, {
          assignedTo: staffId,
          assignedToName: staffName,
        });
      } catch (patchErr) {
        if (room?.id) {
          await apiClient.patch(`/rooms/${encodeURIComponent(room.id)}/tasks/${encodeURIComponent(cleanTaskId)}`, {
            assignedTo: staffId,
            assignedToName: staffName,
          }).catch(() => null);
        }
      }

      // Also sync with Next.js local task store
      await fetch("/api/room/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: cleanTaskId, assignedTo: staffId, assignedToName: staffName }),
      }).catch(() => null);

      fetchRoomData();
    } catch (err: any) {
      console.warn("handleAssignStaff remote error:", err);
    }
  };

  const qrURL = `${baseUrl}/m/${tenantSlug}/room/${(room?.roomNumber || "").toLowerCase()}`;

  if (loading && !room) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500">Loading suite records from MongoDB...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Suite Not Found</h2>
        <p className="text-xs text-slate-500">No room records found matching this identifier.</p>
        <Button variant="secondary" size="sm" onClick={() => router.push("/dashboard/rooms")}>
          Return to Rooms Directory
        </Button>
      </div>
    );
  }

  const isOccupied = room.status === "occupied";
  const isCleaning = room.status === "cleaning";

  return (
    <div className="space-y-6 pb-20">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/rooms")}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {room.name}
              </h1>
              <Badge
                variant={isOccupied ? "warning" : isCleaning ? "danger" : "success"}
                size="sm"
                dot
              >
                {isOccupied ? "Guest In-House" : isCleaning ? "Cleaning Required" : "Clean & Ready"}
              </Badge>
              {room.doNotDisturb && (
                <Badge variant="danger" size="sm" className="text-[10px] animate-pulse">
                  🔴 DND Active
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {room.floor} • {room.wing} • Capacity: {room.capacity} Guests • Type: {room.roomType.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<BellOff className="h-4 w-4" />}
            onClick={handleToggleDND}
          >
            {room.doNotDisturb ? "Clear DND" : "Set DND"}
          </Button>

          {isOccupied ? (
            <>
              <Button
                variant="default"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                leftIcon={<Calendar className="h-4 w-4" />}
                onClick={handleOpenExtendStay}
              >
                Extend Stay
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
                leftIcon={<UtensilsCrossed className="h-4 w-4" />}
                onClick={() => setIsStaffOrderFoodOpen(true)}
              >
                Order Food for Guest
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Edit3 className="h-4 w-4 text-emerald-500" />}
                onClick={handleOpenEditStay}
              >
                Edit Stay
              </Button>
              <Button
                variant="destructive"
                size="sm"
                leftIcon={<Users className="h-4 w-4" />}
                onClick={handleInitiateCheckOut}
              >
                Guest Check-Out
              </Button>
            </>
          ) : isCleaning ? (
            <Button
              variant="glow"
              size="sm"
              leftIcon={<Sparkles className="h-4 w-4" />}
              onClick={handleMarkCleanAndReady}
            >
              Mark Clean & Ready
            </Button>
          ) : (
            <Button
              variant="glow"
              size="sm"
              leftIcon={<Users className="h-4 w-4" />}
              onClick={() => setIsCheckInOpen(true)}
            >
              Check-In Guest
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Sparkles className="h-4 w-4" />}
            onClick={() => setIsNewTaskOpen(true)}
          >
            Dispatch Task
          </Button>
        </div>
      </div>

      {/* ── Pending Stay Extension Request Approval Banner ── */}
      {pendingExtension && pendingExtension.status === "pending" && (
        <div className="p-4 rounded-2xl border-2 border-amber-500/60 bg-amber-500/10 backdrop-blur flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
              <Clock className="h-5 w-5 animate-spin" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Guest Stay Extension Request Pending Approval
                </span>
                <Badge variant="warning" size="sm" className="text-[10px] font-extrabold uppercase">
                  Pending Review
                </Badge>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                Guest <span className="font-bold">{pendingExtension.guestName || room.currentGuestName || "Resident"}</span> requested to extend checkout from{" "}
                <span className="font-semibold line-through opacity-70">
                  {new Date(pendingExtension.currentCheckout || room.currentGuestExpectedCheckOut || "").toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                </span>{" "}
                to{" "}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {new Date(pendingExtension.requestedCheckout).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                </span>{" "}
                (+{pendingExtension.additionalNights || 1} Night{pendingExtension.additionalNights > 1 ? "s" : ""}).
              </p>
              {pendingExtension.notes && (
                <p className="text-[11px] text-amber-800 dark:text-amber-300/90 italic mt-0.5">
                  Guest Note: "{pendingExtension.notes}"
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              disabled={processingExtension}
              onClick={() => setIsRejectModalOpen(true)}
              className="border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/50 text-xs font-semibold"
            >
              Decline
            </Button>
            <Button
              variant="default"
              size="sm"
              disabled={processingExtension}
              onClick={handleApproveExtension}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{processingExtension ? "Updating..." : "Approve Extension"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* 3-Column Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: Current In-House Guest */}
        <Card variant="glass" className="border border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Users className="h-4 w-4 text-emerald-500" />
                <span>Active In-House Guest</span>
              </CardTitle>
              {isOccupied && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                  Folio Active
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs pt-1">
            {isOccupied && (room.currentGuestName || orders.length > 0) ? (
              <>
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-slate-900 dark:text-white text-base">
                      {room.currentGuestName || orders[0]?.customerName || "In-Room Dining Guest"}
                    </div>
                    {room.currentGuestIdProofType ? (
                      <Badge variant="success" size="sm" className="text-[10px] font-semibold shrink-0">
                        <FileCheck className="h-3 w-3 mr-1 text-emerald-500" />
                        {room.currentGuestIdProofType}
                      </Badge>
                    ) : (
                      <Badge variant="glow" size="sm" className="text-[10px] font-semibold shrink-0">
                        <UtensilsCrossed className="h-3 w-3 mr-1 text-emerald-500" />
                        Dining Active
                      </Badge>
                    )}
                  </div>
                  {room.currentGuestPhone && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span className="font-mono">{room.currentGuestPhone}</span>
                    </div>
                  )}
                  {room.currentGuestAddress && (
                    <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400 text-[11px]">
                      <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span className="truncate">{room.currentGuestAddress}</span>
                    </div>
                  )}
                  {/* Comprehensive Stay & Timing Details */}
                  {(() => {
                    const metrics = getStayMetrics(room.currentGuestCheckIn, room.currentGuestExpectedCheckOut);
                    if (!metrics) {
                      return (
                        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-mono">
                          <Clock className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          <span>Active QR In-Room Dining Session</span>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-emerald-500" /> Check-In
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white font-mono block text-xs">
                              {metrics.checkInDate}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block">
                              {metrics.checkInTime}
                            </span>
                          </div>

                          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                              <LogOut className="h-3 w-3 text-amber-500" /> {metrics.isProjected ? "Check-Out (Est.)" : "Check-Out"}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white font-mono block text-xs">
                              {metrics.checkOutDate}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block">
                              {metrics.checkOutTime}
                            </span>
                          </div>
                        </div>

                        {/* Stay Duration & Days Pill */}
                        <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
                            <Clock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span>Stay: {metrics.stayDurationLabel}</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                            Day {metrics.currentDay} of {metrics.totalDays}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px] px-0.5">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-slate-500" />
                            <span>In-House Guests: <strong className="text-slate-900 dark:text-white font-bold">{room.currentGuestCount || 1}</strong></span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            Max Capacity: {room.capacity}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{room.currentGuestName ? "Verified Guest Session" : "Guest In-House • Folio Open"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                      onClick={handleOpenExtendStay}
                      leftIcon={<Calendar className="h-3.5 w-3.5" />}
                    >
                      Extend Stay Duration
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50"
                        onClick={handleOpenEditStay}
                        leftIcon={<Edit3 className="h-3.5 w-3.5 text-emerald-500" />}
                      >
                        Edit Stay Info
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10 font-semibold"
                        onClick={handleInitiateCheckOut}
                      >
                        Settle Check-Out
                      </Button>
                    </div>
                  </div>
                  {!room.currentGuestName && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => setIsCheckInOpen(true)}
                    >
                      Attach Government ID / Register Guest
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="py-6 text-center text-slate-500 space-y-2">
                <Bed className="h-8 w-8 mx-auto text-slate-400 opacity-60" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {isCleaning ? "Room in Housekeeping" : "No Guest In-House"}
                </p>
                <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto">
                  {isCleaning
                    ? "Sanitization and linen change in progress before next arrival."
                    : "Room is ready for guest arrival and immediate check-in."}
                </p>
                {!isCleaning && (
                  <Button
                    variant="glow"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={() => setIsCheckInOpen(true)}
                  >
                    Check In Guest
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Column 2: Suite Specifications & Amenities */}
        <Card variant="glass" className="border border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Hotel className="h-4 w-4 text-cyan-500" />
              <span>Suite Specs & Amenities</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs pt-1">
            <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Wing</span>
                <span className="font-bold text-slate-900 dark:text-white">{room.wing}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Floor</span>
                <span className="font-bold text-slate-900 dark:text-white">{room.floor}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1.5">
                Included Amenities
              </span>
              <div className="flex flex-wrap gap-1.5">
                {room.amenities.map((am) => (
                  <span
                    key={am}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300"
                  >
                    {am}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Column 3: In-Room QR Tent Stand */}
        <Card variant="glass" className="border border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <QrCode className="h-4 w-4 text-amber-500" />
              <span>In-Room Dining Tent QR</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center text-xs pt-1 space-y-2">
            <div className="p-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
              <QRCodeImage value={qrURL} size={110} alt={`${room.name} QR`} />
            </div>

            <p className="text-[10px] font-mono text-slate-500 truncate max-w-full">
              {qrURL}
            </p>

            <div className="flex items-center gap-2 pt-1 w-full">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 text-xs"
                leftIcon={<Copy className="h-3 w-3" />}
                onClick={() => {
                  navigator.clipboard?.writeText(qrURL);
                  addToast("info", "Copied", "In-Room menu URL copied.");
                }}
              >
                Copy URL
              </Button>

              <a
                href={qrURL}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:text-slate-950 dark:hover:text-white flex items-center gap-1 shrink-0"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Test QR</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2-Column Tabs: Live Room Orders & Housekeeping Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: In-Room Dining Orders */}
        <Card variant="glass" className="border border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-emerald-500" />
                  <span>Suite In-Room Dining Orders</span>
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live tickets and dining orders placed during this guest stay.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                  onClick={() => setIsStaffOrderFoodOpen(true)}
                  className="h-7 text-xs font-semibold"
                >
                  Order Food
                </Button>
                {orders.length > 0 && (
                  <button
                    onClick={handleClearStayHistory}
                    title="Purge Historical Stay Records"
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:border-rose-500/30 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <Badge variant="neutral" size="sm" className="font-mono">
                  {orders.length} {orders.length === 1 ? "Order" : "Orders"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {orders.length > 0 ? (
              orders.map((ord, idx) => {
                const total = ord.totalAmount || ord.total || 0;
                return (
                  <div
                    key={ord.id || ord._id || idx}
                    className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex items-start justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black font-mono text-slate-900 dark:text-white">
                          {ord.orderNumber}
                        </span>
                        <Badge
                          variant={
                            ord.status === "served"
                              ? "success"
                              : ord.status === "preparing"
                              ? "warning"
                              : ord.status === "cancelled"
                              ? "danger"
                              : "neutral"
                          }
                          size="sm"
                        >
                          {ord.status.toUpperCase()}
                        </Badge>
                        {ord.orderSource === "front_desk" && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                            Front Desk {ord.placedBy ? `• ${ord.placedBy}` : ""}
                          </span>
                        )}
                        {ord.billingMethod && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium">
                            {ord.billingMethod === "room_folio"
                              ? "Room Bill"
                              : ord.billingMethod === "complimentary"
                              ? "Complimentary"
                              : "Immediate"}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 space-y-0.5 text-slate-600 dark:text-slate-400">
                        {Array.isArray(ord.items) &&
                          ord.items.map((it, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <span className="text-emerald-500 font-bold">{it.quantity}x</span>
                              <span>{it.name}</span>
                            </div>
                          ))}
                      </div>

                      <span className="text-[10px] text-slate-500 font-mono mt-2 block">
                        {new Date(ord.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        • {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-black font-mono text-sm text-slate-900 dark:text-white block">
                        {formatCurrency(total, "INR")}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                        Folio Billed
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center text-slate-500 text-xs">
                <UtensilsCrossed className="h-8 w-8 mx-auto text-slate-400 opacity-50 mb-2" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  No In-Room Dining Orders Yet
                </p>
                <p className="text-[11px] text-slate-500">
                  Orders placed by the guest via the Suite QR menu will appear here in real time.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Housekeeping & Maintenance Tasks */}
        <Card variant="glass" className="border border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-500" />
                  <span>Housekeeping & Service Tasks</span>
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sanitization, linen changes, and amenity requests.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {tasks.length > 0 && (
                  <button
                    onClick={handleClearStayHistory}
                    title="Purge Historical Stay Records"
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:border-rose-500/30 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                  leftIcon={<Plus className="h-3 w-3" />}
                  onClick={() => setIsNewTaskOpen(true)}
                >
                  Add Task
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.length > 0 ? (
              tasks.map((t) => {
                const isDone = t.status === "completed";
                const cleanTaskId: string = String(t.id || (t as any)._id || "");
                const isAssigned = Boolean(t.assignedTo && t.assignedTo.trim() !== "");
                const assignedStaff = staffList.find(
                  (s) => s.id === t.assignedTo || (s as any)._id === t.assignedTo || s.name === t.assignedToName || s.name === t.assignedTo
                );
                const assignedStaffName = t.assignedToName || assignedStaff?.name || (isAssigned ? "Housekeeping Steward" : "");

                return (
                  <div
                    key={cleanTaskId}
                    className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {t.title}
                        </span>
                        <Badge
                          variant={isDone ? "success" : t.status === "in_progress" ? "warning" : "neutral"}
                          size="sm"
                        >
                          {t.status === "in_progress" ? "⚡ SERVICE STARTED" : t.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        {t.priority === "high" && (
                          <Badge variant="danger" size="sm" className="text-[10px]">
                            High Priority
                          </Badge>
                        )}
                        {t.priority === "urgent" && (
                          <Badge variant="danger" size="sm" className="text-[10px] animate-pulse">
                            🚨 Urgent
                          </Badge>
                        )}
                      </div>

                      {t.notes && (
                        <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">
                          {t.notes}
                        </p>
                      )}

                      {/* Staff Assignment Badge & WhatsApp Alert Status */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {isAssigned ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] border border-indigo-500/20 shadow-xs">
                            <User className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>Assigned: {assignedStaffName} {assignedStaff?.role ? `(${assignedStaff.role})` : ""}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold text-[11px] border border-amber-500/30">
                            <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                            <span>Pending Assignment (Choose staff below)</span>
                          </span>
                        )}

                        {t.status === "in_progress" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold text-[11px] border border-amber-500/30">
                            ⚡ Service Started • Steward Attending
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          WhatsApp Alerted
                        </span>

                        <span className="text-[10px] text-slate-500 font-mono">
                          Dispatched: {new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      {/* Staff Assignment Selector: Visible when unassigned; hidden once assigned with reassign option */}
                      {!isDone && (
                        <>
                          {!isAssigned ? (
                            <div className="mt-2.5 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                              <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                <span>Assign Housekeeper:</span>
                              </label>
                              <select
                                value={t.assignedTo || ""}
                                onChange={(e) => {
                                  const selId = e.target.value;
                                  const selStaff = staffList.find((s) => s.id === selId || (s as any)._id === selId);
                                  if (selStaff) {
                                    handleAssignStaff(cleanTaskId, selStaff.id, selStaff.name);
                                  }
                                }}
                                className="h-7 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2 py-0 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium max-w-[280px]"
                              >
                                <option value="" disabled>Choose available hotel staff...</option>
                                {staffList.length === 0 ? (
                                  <option value="" disabled>No staff members found in this hotel</option>
                                ) : (
                                  staffList.map((st) => {
                                    const isAssignedToThis = t.assignedTo === st.id;
                                    const activeCount = staffActiveTaskCounts[st.id] || staffActiveTaskCounts[st.name] || 0;
                                    const isBusy = activeCount >= 1 && !isAssignedToThis;
                                    return (
                                      <option
                                        key={st.id}
                                        value={st.id}
                                        disabled={isBusy}
                                        className={isBusy ? "text-slate-400 bg-slate-100 dark:bg-slate-800" : ""}
                                      >
                                        {st.name} ({st.role}) — {isBusy ? "🔴 Busy (1 task)" : isAssignedToThis ? "🟢 Active on this task" : "🟢 Available (0 tasks)"}
                                      </option>
                                    );
                                  })
                                )}
                              </select>
                            </div>
                          ) : reassignTaskId === cleanTaskId ? (
                            <div className="mt-2.5 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                              <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                <span>Reassign Housekeeper:</span>
                              </label>
                              <select
                                value={t.assignedTo || ""}
                                onChange={(e) => {
                                  const selId = e.target.value;
                                  const selStaff = staffList.find((s) => s.id === selId || (s as any)._id === selId);
                                  if (selStaff) {
                                    handleAssignStaff(cleanTaskId, selStaff.id, selStaff.name);
                                    setReassignTaskId(null);
                                  }
                                }}
                                className="h-7 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2 py-0 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium max-w-[280px]"
                              >
                                <option value="" disabled>Choose available hotel staff...</option>
                                {staffList.map((st) => {
                                  const isAssignedToThis = t.assignedTo === st.id;
                                  const activeCount = staffActiveTaskCounts[st.id] || staffActiveTaskCounts[st.name] || 0;
                                  const isBusy = activeCount >= 1 && !isAssignedToThis;
                                  return (
                                    <option
                                      key={st.id}
                                      value={st.id}
                                      disabled={isBusy}
                                      className={isBusy ? "text-slate-400 bg-slate-100 dark:bg-slate-800" : ""}
                                    >
                                      {st.name} ({st.role}) — {isBusy ? "🔴 Busy (1 task)" : isAssignedToThis ? "🟢 Active on this task" : "🟢 Available (0 tasks)"}
                                    </option>
                                  );
                                })}
                              </select>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                                onClick={() => setReassignTaskId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="mt-1.5 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setReassignTaskId(cleanTaskId)}
                                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                              >
                                <UserCheck className="h-3 w-3" />
                                <span>Reassign staff</span>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex flex-row sm:flex-col gap-1.5 items-end shrink-0 self-end sm:self-start">
                      {t.status === "pending" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-7 px-2.5 text-xs text-amber-600 dark:text-amber-400 border-amber-500/30"
                          onClick={() => handleApproveTask(cleanTaskId)}
                        >
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          <span>Approve & Start</span>
                        </Button>
                      )}
                      {t.status === "in_progress" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-7 px-2.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          onClick={() => handleCompleteTask(cleanTaskId)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          <span>Mark Done</span>
                        </Button>
                      )}
                      {!isDone && t.status !== "pending" && t.status !== "in_progress" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-7 px-2.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          onClick={() => handleCompleteTask(cleanTaskId)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          <span>Mark Done</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center text-slate-500 text-xs">
                <Sparkles className="h-8 w-8 mx-auto text-slate-400 opacity-50 mb-2" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  No Housekeeping Tasks Dispatched
                </p>
                <p className="text-[11px] text-slate-500">
                  All cleaning and steward tasks for this room are completed.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Complete Indian Hotel Guest Check-In Modal */}
      <Modal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        title={`Guest Check-In — ${room.name}`}
        description="Register guest with Indian ID verification, phone validation, and folio activation."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setIsCheckInOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="check-in-form" variant="glow" size="sm">
              Confirm Check-In
            </Button>
          </div>
        }
      >
        <form id="check-in-form" onSubmit={handleCheckInSubmit} className="space-y-4 py-2 text-xs">
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
                  Max: {room.capacity || 2}
                </span>
              </div>
              <input
                type="number"
                min="1"
                max={room.capacity || 2}
                value={guestCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  const maxCap = room.capacity || 2;
                  setGuestCount(Math.min(maxCap, Math.max(1, val)));
                }}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Suite capacity strictly limited to {room.capacity || 2} guest{(room.capacity || 2) > 1 ? "s" : ""}.
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

      {/* Edit Guest Stay Details Modal */}
      <Modal
        isOpen={isEditStayOpen}
        onClose={() => setIsEditStayOpen(false)}
        title={`Modify Stay Information — ${room.name}`}
        description="Update in-house guest personal details, stay duration dates, room occupancy, and identity verification."
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setIsEditStayOpen(false)} disabled={isSavingStay}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-stay-form"
              variant="glow"
              size="sm"
              disabled={isSavingStay}
              leftIcon={<Check className="h-4 w-4" />}
            >
              {isSavingStay ? "Saving Stay Details..." : "Save Stay Changes"}
            </Button>
          </div>
        }
      >
        <form id="edit-stay-form" onSubmit={handleSaveStaySubmit} className="space-y-4 text-xs py-1">
          {/* Guest Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Guest Full Name *
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Mobile Number (+91 Indian Mobile) *
              </label>
              <input
                type="tel"
                required
                value={editPhone}
                onChange={(e) => setEditPhone(formatIndianPhoneInput(e.target.value))}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
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
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="guest@example.com"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  In-House Guests Count *
                </label>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  Max Capacity: {room.capacity}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={room.capacity || 2}
                  value={editGuestCount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const maxCap = room.capacity || 2;
                    if (val > maxCap) {
                      setEditGuestCount(maxCap);
                      addToast("warning", "Max Capacity Limit", `${room.name} maximum capacity is ${maxCap} guests.`);
                    } else {
                      setEditGuestCount(Math.max(1, val));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <span className="text-slate-500 shrink-0 text-[11px]">
                  / {room.capacity} Max
                </span>
              </div>
            </div>
          </div>

          {/* Stay Timing: Check-In and Expected Check-Out */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Check-In Date & Time
              </label>
              <input
                type="datetime-local"
                value={editCheckInDate}
                onChange={(e) => setEditCheckInDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Expected Check-Out Date & Time
              </label>
              <input
                type="datetime-local"
                value={editExpectedCheckOutDate}
                onChange={(e) => setEditExpectedCheckOutDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Address & Nationality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Residential Address / City
              </label>
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="e.g. Bandra West, Mumbai, Maharashtra"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Nationality
              </label>
              <input
                type="text"
                value={editNationality}
                onChange={(e) => setEditNationality(e.target.value)}
                placeholder="Indian"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* ID Proof Type & Upload/Preview */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Government Identity Document
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={editIdProofType}
                onChange={(e) => setEditIdProofType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Aadhaar Card">Aadhaar Card (UIDAI)</option>
                <option value="Driving License">Driving License (State RTO)</option>
                <option value="Passport">International Passport</option>
                <option value="Voter ID">Voter ID (Election Commission)</option>
                <option value="PAN Card">PAN Card (Income Tax Dept)</option>
              </select>

              <div className="flex items-center gap-2">
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleEditIDFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => editFileInputRef.current?.click()}
                  leftIcon={<UploadCloud className="h-3.5 w-3.5 text-emerald-500" />}
                >
                  {editIdProofPreview ? "Replace File" : "Upload Document"}
                </Button>
                {editIdProofPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-rose-500 hover:bg-rose-500/10"
                    onClick={() => setEditIdProofPreview(null)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>

            {/* Preview if uploaded */}
            {editIdProofPreview && (
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {editIdProofPreview.startsWith("data:image") ? (
                    <img
                      src={editIdProofPreview}
                      alt="ID Preview"
                      className="h-9 w-9 object-cover rounded-lg border border-slate-200 dark:border-slate-800 shrink-0"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <FileCheck className="h-4 w-4" />
                    </div>
                  )}
                  <div className="truncate">
                    <span className="font-bold text-slate-900 dark:text-white block truncate text-xs">
                      {editIdProofType} Verified Document
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      Attached to Active Stay Folio
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Special Requests */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Special Requests & Front Desk Notes
            </label>
            <textarea
              rows={2}
              value={editSpecialRequests}
              onChange={(e) => setEditSpecialRequests(e.target.value)}
              placeholder="e.g. Late checkout approved until 2 PM, anniversary champagne requested..."
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>
        </form>
      </Modal>

      {/* Staff Extend Stay Modal */}
      {isExtendStayOpen && room && (
        <Modal
          isOpen={isExtendStayOpen}
          onClose={() => setIsExtendStayOpen(false)}
          title={`Extend Stay — ${room.name}`}
          description={`Prolong reservation for ${room.currentGuestName || "In-House Guest"}`}
          size="md"
        >
          <form onSubmit={handleConfirmExtendStay} className="space-y-4 pt-1">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Active Guest:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {room.currentGuestName || "Valued In-House Guest"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Current Check-Out:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {room.currentGuestExpectedCheckOut
                    ? new Date(room.currentGuestExpectedCheckOut).toLocaleDateString([], {
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
                        const baseDate = room.currentGuestExpectedCheckOut
                          ? new Date(room.currentGuestExpectedCheckOut)
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
                onClick={() => setIsExtendStayOpen(false)}
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

      {/* Guest Check-Out & Stay Review Modal */}
      <Modal
        isOpen={isCheckOutOpen}
        onClose={() => setIsCheckOutOpen(false)}
        title={`Confirm Check-Out — ${room.name}`}
        description="Review guest stay duration, itemized room service orders, and settle folio balance."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setIsCheckOutOpen(false)}>
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
                      {currentStaySummary?.guestName || room.currentGuestName}
                    </h3>
                    {currentStaySummary?.guestPhone && (
                      <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                        {currentStaySummary.guestPhone}
                      </p>
                    )}
                  </div>

                  <Badge variant="warning" size="sm" className="font-mono font-bold">
                    {room.name}
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
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {completedInvoice.roomServiceOrders.map((ord: any, idx: number) => (
                    <div key={idx} className="p-2 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold">{ord.orderNumber}</span>
                        <span className="text-[10px] text-slate-500 block">
                          {new Date(ord.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-emerald-700">
                        {formatCurrency(ord.totalAmount || ord.total || 0, "INR")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invoice Total */}
            <div className="p-3 bg-slate-100 rounded-xl space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Room Service F&B:</span>
                <span>{formatCurrency(completedInvoice.totalFoodAmount || 0, "INR")}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-950 text-sm pt-1.5 border-t border-slate-200">
                <span>Total Folio Settled:</span>
                <span className="text-emerald-700">{formatCurrency(completedInvoice.folioBalance || 0, "INR")}</span>
              </div>
            </div>

            <div className="text-center pt-2 text-[10px] text-slate-500">
              <p>Thank you for staying with {tenantName}. We look forward to welcoming you again.</p>
              <p className="font-mono text-[9px] mt-0.5">DineFlow Hospitality PMS • Computer-Generated Tax Invoice</p>
            </div>
          </div>
        </Modal>
      )}

      {/* New Housekeeping Task Modal */}
      <Modal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        title={`Dispatch Housekeeping Task — ${room.name}`}
        description="Create and assign cleaning, maintenance, or guest amenity jobs."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setIsNewTaskOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="task-form" variant="glow" size="sm">
              Dispatch Task
            </Button>
          </div>
        }
      >
        <form id="task-form" onSubmit={handleCreateTaskSubmit} className="space-y-4 py-2">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Deep Clean & Bed Linen Change"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Task Type
              </label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="cleaning">Cleaning & Sanitization</option>
                <option value="linen_change">Linen & Towel Refresh</option>
                <option value="maintenance">Maintenance & Repairs</option>
                <option value="amenity_request">Guest Amenity Request</option>
                <option value="inspection">Supervisor Inspection</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Priority
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent (VIP Arrival)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Notes & Special Instructions
            </label>
            <textarea
              rows={2}
              placeholder="Instructions for the steward..."
              value={taskNotes}
              onChange={(e) => setTaskNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </form>
      </Modal>

      {/* ── Front Desk Staff Order Food on Behalf of Guest Modal ── */}
      {isStaffOrderFoodOpen && room && (
        <StaffOrderFoodModal
          isOpen={isStaffOrderFoodOpen}
          onClose={() => setIsStaffOrderFoodOpen(false)}
          roomId={room.id}
          roomNumber={room.roomNumber}
          roomName={room.name}
          guestName={room.currentGuestName}
          guestPhone={room.currentGuestPhone}
          bookingId={room.currentGuestId}
          tenantSlug={tenantSlug}
          onOrderPlaced={fetchRoomData}
        />
      )}

      {/* ── Decline Stay Extension Modal ── */}
      {isRejectModalOpen && pendingExtension && (
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          title="Decline Stay Extension Request"
          description={`Explain to guest why stay in ${room?.name || "the room"} cannot be extended.`}
          size="sm"
        >
          <form onSubmit={handleRejectExtension} className="space-y-4 pt-1">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Reason for Declining
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Room is fully booked for subsequent dates by an incoming VIP reservation."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsRejectModalOpen(false)}
                disabled={processingExtension}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                disabled={processingExtension || !rejectionReason.trim()}
              >
                {processingExtension ? "Declining..." : "Decline Extension"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
