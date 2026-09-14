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
  const [guestIdProof, setGuestIdProof] = React.useState("Passport");
  const [specialRequests, setSpecialRequests] = React.useState("");

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
      const [roomRes, ordersRes, tasksRes] = await Promise.allSettled([
        apiClient.get(`/rooms/${encodeURIComponent(roomId)}`),
        apiClient.get(`/rooms/${encodeURIComponent(roomId)}/orders`),
        apiClient.get(`/rooms/${encodeURIComponent(roomId)}/tasks`),
      ]);

      if (roomRes.status === "fulfilled" && roomRes.value.data?.data) {
        const r = roomRes.value.data.data;
        setRoom({
          id: r.id || r._id,
          roomNumber: r.roomNumber || "",
          name: r.name || `Room ${r.roomNumber}`,
          roomType: r.roomType || "suite",
          floor: r.floor || "Floor 2",
          wing: r.wing || "Main",
          capacity: r.capacity || 2,
          status: r.status || "vacant",
          doNotDisturb: Boolean(r.doNotDisturb),
          folioEnabled: r.folioEnabled !== false,
          currentGuestId: r.currentGuestId,
          currentGuestName: r.currentGuestName,
          currentGuestPhone: r.currentGuestPhone,
          qrSlug: r.qrSlug || `room-${r.roomNumber}`,
          amenities: Array.isArray(r.amenities) && r.amenities.length > 0
            ? r.amenities
            : ["King Bed", "Ocean View", "Jacuzzi", "Mini Bar", "High-Speed Wi-Fi"],
          createdAt: r.createdAt || new Date().toISOString(),
        });
      }

      if (ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value.data?.data)) {
        setOrders(ordersRes.value.data.data);
      }

      if (tasksRes.status === "fulfilled" && Array.isArray(tasksRes.value.data?.data)) {
        setTasks(tasksRes.value.data.data);
      }
    } catch (e) {
      console.warn("Failed to load room details:", e);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  React.useEffect(() => {
    fetchRoomData();
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

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !guestName.trim() || !guestPhone.trim()) return;

    try {
      const res = await apiClient.post(`/rooms/${encodeURIComponent(room.id)}/check-in`, {
        name: guestName.trim(),
        phone: guestPhone.trim(),
        email: guestEmail.trim(),
        idProofType: guestIdProof,
        specialRequests: specialRequests.trim(),
      });

      if (res.data?.data?.room) {
        setRoom(res.data.data.room);
      } else {
        setRoom({
          ...room,
          status: "occupied",
          currentGuestName: guestName.trim(),
          currentGuestPhone: guestPhone.trim(),
        });
      }

      setIsCheckInOpen(false);
      setGuestName("");
      setGuestPhone("");
      setGuestEmail("");
      addToast("success", "Guest Checked In", `${guestName} is now in-house in ${room.name}.`);
      fetchRoomData();
    } catch (e: any) {
      addToast("error", "Check-In Failed", e?.response?.data?.message || "Could not check in guest.");
    }
  };

  const handleCheckOutSubmit = async () => {
    if (!room) return;
    try {
      await apiClient.post(`/rooms/${encodeURIComponent(room.id)}/check-out`, {});
      setRoom({
        ...room,
        status: "cleaning",
        currentGuestId: undefined,
        currentGuestName: undefined,
        currentGuestPhone: undefined,
      });
      setIsCheckOutOpen(false);
      addToast("success", "Guest Checked Out", `${room.name} marked for Housekeeping cleaning.`);
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
              onClick={() => setIsCheckOutOpen(true)}
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
            {isOccupied && room.currentGuestName ? (
              <>
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white text-base">
                    {room.currentGuestName}
                  </div>
                  {room.currentGuestPhone && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span>{room.currentGuestPhone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Verified Guest Session</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                  onClick={() => setIsCheckOutOpen(true)}
                >
                  Initiate Guest Check-Out
                </Button>
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

      {/* Check-In Modal */}
      <Modal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        title={`Guest Check-In — ${room.name}`}
        description="Assign in-house guest credentials and activate in-room dining folio."
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
        <form id="check-in-form" onSubmit={handleCheckInSubmit} className="space-y-4 py-2">
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
                placeholder="e.g. Extra pillows, feather duvet"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Check-Out Confirmation Modal */}
      <Modal
        isOpen={isCheckOutOpen}
        onClose={() => setIsCheckOutOpen(false)}
        title={`Confirm Guest Check-Out — ${room.name}`}
        description="Completes in-house stay, settles room folio, and dispatches housekeeping cleaning."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setIsCheckOutOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleCheckOutSubmit}>
              Complete Check-Out & Dispatch Cleaning
            </Button>
          </div>
        }
      >
        <div className="py-3 space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300">
            <p className="font-bold">Active Guest: {room.currentGuestName}</p>
            <p className="text-[11px] mt-0.5">
              Checking out will clear the guest session and automatically mark this suite as{" "}
              <strong>Cleaning</strong> so housekeeping stewards can prepare it for the next guest.
            </p>
          </div>
        </div>
      </Modal>

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
