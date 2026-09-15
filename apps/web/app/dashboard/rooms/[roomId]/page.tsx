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
  qrSlug: string;
  amenities: string[];
  createdAt: string;
}

interface HousekeepingTask {
  id: string;
  taskType: string;
  title: string;
  priority: string;
  assignedTo?: string;
  status: "pending" | "in_progress" | "completed";
  notes?: string;
  createdAt: string;
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
}

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
  const [orders, setOrders] = React.useState<RoomOrder[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Modals
  const [isCheckInOpen, setIsCheckInOpen] = React.useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = React.useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = React.useState(false);

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
      const [roomRes, ordersRes, tasksRes, allOrdersRes] = await Promise.allSettled([
        apiClient.get(`/rooms/${encodeURIComponent(roomId)}`),
        apiClient.get(`/rooms/${encodeURIComponent(roomId)}/orders`),
        apiClient.get(`/rooms/${encodeURIComponent(roomId)}/tasks`),
        apiClient.get("/orders"),
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
          currentGuestCheckIn: currentGuest?.checkIn,
          currentGuestExpectedCheckOut: currentGuest?.expectedCheckOut,
          currentGuestCount: currentGuest?.numberOfGuests,
          qrSlug: r.qrSlug || `room-${r.roomNumber}`,
          amenities: Array.isArray(r.amenities) && r.amenities.length > 0
            ? r.amenities
            : ["King Bed", "Ocean View", "Jacuzzi", "Mini Bar", "High-Speed Wi-Fi"],
          createdAt: r.createdAt || new Date().toISOString(),
        };
        setRoom(loadedRoom);
      }

      // Collect and merge orders from both the room-specific endpoint and the tenant KDS queue
      const orderMap = new Map<string, RoomOrder>();

      // 1. Process orders returned by /rooms/:id/orders
      if (ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value.data?.data)) {
        for (const o of ordersRes.value.data.data) {
          const key = o.orderNumber || o.id || o._id;
          if (key) {
            orderMap.set(key, {
              id: o.id || o._id,
              _id: o._id,
              orderNumber: o.orderNumber,
              status: (o.status || "pending").toLowerCase(),
              customerName: o.customerName,
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

      const mergedOrders = Array.from(orderMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(mergedOrders);

      if (tasksRes.status === "fulfilled" && Array.isArray(tasksRes.value.data?.data)) {
        const targetRoomNum = (loadedRoom?.roomNumber || room?.roomNumber || "").toUpperCase().trim();
        const targetRoomId = (loadedRoom?.id || roomId || "").trim();

        // Strictly isolate tasks to this room only
        const roomSpecificTasks = tasksRes.value.data.data.filter((t: any) => {
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

        setTasks(roomSpecificTasks);
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

  const handleToggleDND = async () => {
    if (!room) return;
    const nextDND = !room.doNotDisturb;
    try {
      await apiClient.patch(`/rooms/${encodeURIComponent(room.id)}/dnd`, { doNotDisturb: nextDND });
      setRoom({ ...room, doNotDisturb: nextDND });
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
      setRoom({
        ...room,
        status: "cleaning",
        currentGuestId: undefined,
        currentGuestName: undefined,
        currentGuestPhone: undefined,
      });
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

  const handleCompleteTask = async (taskId: string) => {
    try {
      await apiClient.patch(`/rooms/tasks/${encodeURIComponent(taskId)}`, {
        status: "completed",
      });
      addToast("success", "Task Completed", "Housekeeping task marked as finished.");
      fetchRoomData();
    } catch (e) {
      console.warn("Complete task error:", e);
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
                <Badge variant="danger" size="sm" className="text-[10px]">
                  DND Active
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
            <Button
              variant="destructive"
              size="sm"
              leftIcon={<Users className="h-4 w-4" />}
              onClick={handleInitiateCheckOut}
            >
              Guest Check-Out
            </Button>
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
                  {room.currentGuestCheckIn ? (
                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-mono">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>In: {new Date(room.currentGuestCheckIn).toLocaleDateString()}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-mono">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span>Active QR In-Room Dining Session</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{room.currentGuestName ? "Verified Guest Session" : "Guest In-House • Folio Open"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                    onClick={handleInitiateCheckOut}
                  >
                    Review Stay & Settle Check-Out
                  </Button>
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
                  Live tickets and historical dining bills charged to this room.
                </p>
              </div>
              <Badge variant="neutral" size="sm" className="font-mono">
                {orders.length} {orders.length === 1 ? "Order" : "Orders"}
              </Badge>
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
                      <div className="flex items-center gap-2">
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
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.length > 0 ? (
              tasks.map((t) => {
                const isDone = t.status === "completed";
                return (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex items-start justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {t.title}
                        </span>
                        <Badge
                          variant={isDone ? "success" : t.status === "in_progress" ? "warning" : "neutral"}
                          size="sm"
                        >
                          {t.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        {t.priority === "high" && (
                          <Badge variant="danger" size="sm" className="text-[10px]">
                            High Priority
                          </Badge>
                        )}
                      </div>

                      {t.notes && (
                        <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">
                          {t.notes}
                        </p>
                      )}

                      <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">
                        Dispatched: {new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div>
                      {!isDone && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-7 px-2.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          onClick={() => handleCompleteTask(t.id)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          <span>Done</span>
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
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Number of Guests
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={guestCount}
                onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
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

                <div className="pt-2 border-t border-amber-500/20 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Check-In:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {currentStaySummary?.checkIn
                        ? new Date(currentStaySummary.checkIn).toLocaleString()
                        : "Active Stay"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Stay Duration:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {currentStaySummary?.stayDuration || "1 Night"}
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
    </div>
  );
}
