"use client";

import * as React from "react";
import {
  ChefHat,
  Clock,
  AlertCircle,
  CheckCircle,
  BellRing,
  Sparkles,
  Volume2,
  VolumeX,
  Flame,
  Check,
  Phone,
  MessageSquare,
  Utensils,
  Maximize2,
  Minimize2,
  Plus,
  XCircle,
  Eye,
  Hotel,
  Wine,
  Printer,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Modal } from "@/components/ui/modal";
import { ThermalPrintModal } from "@/components/orders/thermal-receipt-modal";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { useTenantData } from "@/lib/stores/tenant-data-store";
import { EmptyState } from "@/components/ui/empty-state";

interface KdsItem {
  name: string;
  qty: number;
  variant?: string;
  modifiers?: string[];
  notes?: string;
}

interface KdsOrder {
  id: string;
  table: string;
  customerName: string;
  customerPhone: string;
  secondsElapsed: number;
  station: "main_kitchen" | "bar" | "room_service";
  destination: "dine_in" | "room_service" | "takeaway";
  status: "pending" | "preparing" | "ready" | "served" | "cancelled" | "paid";
  items: KdsItem[];
  total: number;
}

const INITIAL_KDS_ORDERS: KdsOrder[] = [];

const MENU_PRESETS = [
  { name: "Wood-Fired Margherita", price: 750 },
  { name: "Truffle Mushroom Risotto", price: 850 },
  { name: "Burrata & Heirloom Salad", price: 680 },
  { name: "Valencia Orange Spritz", price: 340 },
  { name: "Belgian Chocolate Fondant", price: 450 },
  { name: "Artisanal Grand Club Sandwich", price: 780 },
];

export default function KDSOrdersPage() {
  const { addToast } = useToast();
  const {
    tenantName,
    tenantSlug,
    isDemoTenant,
    orders,
    addOrder,
    updateOrderStatus,
    refreshOrders,
    menuItems,
    tables,
  } = useTenantData();

  const prevOrderCountRef = React.useRef(orders.length);

  // Poll for incoming orders every 5s
  React.useEffect(() => {
    if (refreshOrders) {
      refreshOrders();
      const interval = setInterval(refreshOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [refreshOrders]);

  const [activeTab, setActiveTab] = React.useState("all");
  const [stationFilter, setStationFilter] = React.useState("all");
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const s = params.get("search");
      if (s) {
        setSearchQuery(s);
      }
    }
  }, []);

  // Manual Order Modal
  const [isManualModalOpen, setIsManualModalOpen] = React.useState(false);
  const [manualDestination, setManualDestination] = React.useState<"dine_in" | "room_service">("dine_in");
  const [manualTable, setManualTable] = React.useState("Table 01");
  const [manualCustomer, setManualCustomer] = React.useState("Walk-in Guest");
  const [manualPhone, setManualPhone] = React.useState("");
  const [selectedItems, setSelectedItems] = React.useState<{ [key: string]: number }>({
    "Wood-Fired Margherita": 1,
    "Valencia Orange Spritz": 1,
  });
  const [manualNotes, setManualNotes] = React.useState("");

  // Thermal Print state
  const [thermalOrder, setThermalOrder] = React.useState<any | null>(null);
  const [thermalType, setThermalType] = React.useState<"kot" | "bill">("kot");
  const [isThermalOpen, setIsThermalOpen] = React.useState(false);

  const handleOpenThermal = (order: KdsOrder, type: "kot" | "bill" = "kot") => {
    setThermalType(type);
    setThermalOrder({
      id: order.id,
      locationName: order.table,
      items: order.items.map((it) => ({
        name: it.name,
        quantity: it.qty,
        price: 650,
        notes: it.notes,
      })),
      subtotal: order.total > 0 ? order.total : 1650,
      tax: (order.total > 0 ? order.total : 1650) * 0.05,
      roomServiceFee: order.destination === "room_service" ? 150 : 0,
      total: (order.total > 0 ? order.total : 1650) * 1.05 + (order.destination === "room_service" ? 150 : 0),
      stationName: order.station === "room_service" ? "IN-ROOM DINING" : "MAIN KITCHEN",
    });
    setIsThermalOpen(true);
  };

  const stations = [
    { id: "all", label: "All Stations" },
    { id: "main_kitchen", label: "🍳 Main Kitchen" },
    { id: "room_service", label: "🏨 In-Room Dining" },
    { id: "bar", label: "🍸 Bar & Beverage" },
  ];

  // Play audio chime synthesis for new incoming orders / alerts
  const playAlertChime = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // AudioContext unavailable or blocked by browser policy
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Live timer tick every second
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}m ${remainder < 10 ? "0" : ""}${remainder}s`;
  };

  const getUrgencyClass = (secs: number, status: string) => {
    if (status === "ready") return "text-blue-700 dark:text-blue-400 bg-blue-500/10 border-blue-500/30";
    if (status === "served") return "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
    if (secs > 900) {
      // > 15 mins (urgent red)
      return "text-rose-700 dark:text-rose-400 bg-rose-500/15 border-rose-500/40 animate-pulse";
    }
    if (secs > 480) {
      // 8 - 15 mins (amber warning)
      return "text-amber-700 dark:text-amber-400 bg-amber-500/15 border-amber-500/30";
    }
    // < 8 mins (normal emerald)
    return "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  };

  // Bump bar transitions: pending -> preparing -> ready -> served
  const handleBump = async (orderId: string, currentStatus: KdsOrder["status"]) => {
    let nextStatus: KdsOrder["status"] = "preparing";
    if (currentStatus === "pending") nextStatus = "preparing";
    else if (currentStatus === "preparing") nextStatus = "ready";
    else if (currentStatus === "ready") nextStatus = "served";

    await updateOrderStatus(orderId, nextStatus);
    playAlertChime();

    const statusLabels: Record<string, string> = {
      preparing: "Moved to Kitchen Station (Cooking)",
      ready: "Marked Plated & Ready for Steward",
      served: "Completed & Dispatched",
    };

    addToast("success", `Ticket ${orderId}`, statusLabels[nextStatus]);
  };

  const handleRejectOrder = async (orderId: string) => {
    if (!window.confirm(`Are you sure you want to reject and cancel Order ${orderId}?`)) {
      return;
    }
    await updateOrderStatus(orderId, "cancelled", "Rejected from KDS bump bar");
    addToast("warning", `Order ${orderId} Rejected`, "Ticket rejected and removed from active kitchen display.");
  };

  const handleSimulateNewOrder = async () => {
    const isRoom = Math.random() > 0.5;
    const sampleDish = menuItems.length > 0 ? menuItems[Math.floor(Math.random() * menuItems.length)] : null;
    const sampleTable = tables.length > 0 ? tables[Math.floor(Math.random() * tables.length)].name : "Table 01";

    const created = await addOrder({
      table: isRoom ? `Suite ${Math.floor(301 + Math.random() * 8)}` : sampleTable,
      customerName: isRoom ? "In-House Hotel Guest" : "Online QR Guest",
      customerPhone: "+91 99000 11222",
      secondsElapsed: 0,
      station: isRoom ? "room_service" : "main_kitchen",
      destination: isRoom ? "room_service" : "dine_in",
      status: "pending",
      total: sampleDish ? sampleDish.price : 450,
      items: [
        {
          name: sampleDish ? sampleDish.name : "House Signature Specialty",
          qty: 1,
        },
      ],
    });

    playAlertChime();
    addToast(
      "info",
      isRoom ? "In-Room Dining Order!" : "New Table Order!",
      `Ticket ${created.id} received for ${created.table}.`
    );
  };

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemsList: KdsItem[] = Object.entries(selectedItems)
      .filter(([_, qty]) => qty > 0)
      .map(([name, qty]) => ({
        name,
        qty,
        notes: manualNotes.trim() || undefined,
      }));

    if (itemsList.length === 0) {
      addToast("error", "No Items Selected", "Please select at least 1 item for this order.");
      return;
    }

    let calculatedTotal = 0;
    for (const itm of itemsList) {
      const match = menuItems.find((p) => p.name === itm.name) || MENU_PRESETS.find((p) => p.name === itm.name);
      calculatedTotal += (match ? match.price : 450) * itm.qty;
    }

    const created = await addOrder({
      table: manualTable,
      customerName: manualCustomer.trim() || (manualDestination === "room_service" ? "Suite Guest" : "Walk-in Guest"),
      customerPhone: manualPhone.trim() || "+91 98000 00000",
      secondsElapsed: 0,
      station: manualDestination === "room_service" ? "room_service" : "main_kitchen",
      destination: manualDestination,
      status: "pending",
      total: calculatedTotal,
      items: itemsList,
    });

    setIsManualModalOpen(false);
    playAlertChime();
    addToast("success", "Order Created", `Ticket ${created.id} queued for ${manualTable}.`);
  };

  const filteredOrders = orders.filter((o) => {
    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase().replace(/^#/, "");
      const matches =
        o.id.toLowerCase().includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.includes(q)) ||
        (o.table && o.table.toLowerCase().includes(q));
      if (!matches) return false;
      return true;
    }

    // Status Filter
    if (activeTab === "all") {
      if (o.status === "served" || o.status === "cancelled" || o.status === "paid") return false;
    } else if (o.status !== activeTab) {
      return false;
    }

    // Station Filter
    if (stationFilter !== "all") {
      if (stationFilter === "room_service") {
        const isRoom =
          o.station === "room_service" ||
          o.destination === "room_service" ||
          o.id.includes("IRD") ||
          o.table.toLowerCase().includes("suite") ||
          o.table.toLowerCase().includes("room");
        if (!isRoom) return false;
      } else if (o.station !== stationFilter) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-2">
            <Flame className="h-3.5 w-3.5 text-amber-500" /> Multi-Station Kitchen Display (KDS)
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Live Kitchen Display
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Real-time station routing for Main Kitchen, In-Room Dining (Room Service), and Bar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-xs flex items-center gap-1.5 text-xs font-semibold"
            title="Toggle KDS Fullscreen Display"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playAlertChime();
            }}
            className={`h-9 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-colors shadow-xs ${
              soundEnabled
                ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-4 w-4" />
                <span>Chime On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4" />
                <span>Muted</span>
              </>
            )}
          </button>

          {/* Manual Order Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsManualModalOpen(true)}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Create Order
          </Button>

          {/* Test Order Simulator Button */}
          <Button
            variant="glow"
            size="sm"
            onClick={handleSimulateNewOrder}
            leftIcon={<BellRing className="h-3.5 w-3.5" />}
          >
            Simulate Order
          </Button>
        </div>
      </div>

      {/* Global Search Filter Active Banner */}
      {searchQuery && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
          <span className="text-emerald-800 dark:text-emerald-300 font-medium">
            Filtering orders matching <strong>&ldquo;{searchQuery}&rdquo;</strong> ({filteredOrders.length} found)
          </span>
          <button
            onClick={() => setSearchQuery("")}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 font-semibold hover:bg-emerald-500/30 cursor-pointer transition-colors"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Station Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {stations.map((st) => (
          <button
            key={st.id}
            type="button"
            onClick={() => setStationFilter(st.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors shadow-xs ${
              stationFilter === st.id
                ? "bg-emerald-500 text-slate-950 shadow"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="flex items-center justify-between">
        <Tabs
          tabs={[
            { id: "all", label: "Active Tickets", badge: orders.filter((o) => o.status !== "served" && o.status !== "cancelled" && o.status !== "paid").length },
            { id: "pending", label: "New / Pending", badge: orders.filter((o) => o.status === "pending").length },
            { id: "preparing", label: "Cooking / Plating", badge: orders.filter((o) => o.status === "preparing").length },
            { id: "ready", label: "Ready to Dispatch", badge: orders.filter((o) => o.status === "ready").length },
            { id: "served", label: "Served History", badge: orders.filter((o) => o.status === "served").length },
            { id: "cancelled", label: "Rejected / Cancelled", badge: orders.filter((o) => o.status === "cancelled").length },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* KDS Ticket Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full py-6">
            <EmptyState
              icon={<ChefHat className="h-8 w-8 text-slate-400 dark:text-slate-500" />}
              title="All Clear in this Station!"
              description="No active tickets waiting in the selected queue."
              action={{
                label: "Manual Ticket",
                icon: <Plus className="h-4 w-4" />,
                onClick: () => setIsManualModalOpen(true),
              }}
            />
          </div>
        ) : (
          filteredOrders.map((order) => {
            const urgencyBadge = getUrgencyClass(order.secondsElapsed, order.status);
            const isRed = order.secondsElapsed > 900 && order.status === "preparing";
            const isRoomService = order.destination === "room_service" || order.station === "room_service";

            return (
              <Card
                key={order.id}
                variant="glass"
                className={`flex flex-col justify-between border-2 transition-all ${
                  isRed
                    ? "border-rose-500/70 shadow-lg shadow-rose-500/10"
                    : isRoomService
                    ? "border-amber-500/50 bg-gradient-to-b from-amber-500/5 to-transparent"
                    : order.status === "pending"
                    ? "border-amber-500/60 bg-amber-500/5"
                    : order.status === "ready"
                    ? "border-blue-500/60"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                {/* Ticket Header */}
                <CardHeader className="p-4 pb-3 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-row items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                        {order.table}
                      </span>
                      {isRoomService && (
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Hotel className="h-2.5 w-2.5" /> Room Service
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-semibold">
                        {order.id}
                      </span>
                      <span className="text-slate-400 dark:text-slate-600">•</span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-[90px]">
                        {order.customerName}
                      </span>
                    </div>
                  </div>

                  {/* Urgency Time Elapsed Pill */}
                  <div
                    className={`flex items-center gap-1 text-xs font-mono font-bold px-2 py-1 rounded-lg border ${urgencyBadge}`}
                  >
                    {order.status === "served" ? (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Clock className="h-3.5 w-3.5" />
                    )}
                    <span>{order.status === "served" ? `Delivered: ${formatTimer(order.secondsElapsed)}` : formatTimer(order.secondsElapsed)}</span>
                  </div>
                </CardHeader>

                {/* Ticket Items List */}
                <CardContent className="p-4 space-y-3 flex-1">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="border-b border-slate-100 dark:border-slate-800/50 pb-2.5 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between text-sm">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold mr-2 text-base">
                            {item.qty}x
                          </span>
                          <span>{item.name}</span>
                        </div>
                      </div>

                      {item.variant && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6 mt-0.5">
                          Size: {item.variant}
                        </p>
                      )}

                      {item.modifiers && item.modifiers.length > 0 && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400/90 pl-6 mt-0.5">
                          + {item.modifiers.join(", ")}
                        </p>
                      )}

                      {item.notes && (
                        <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium pl-6 mt-1 italic bg-amber-500/10 p-1 rounded">
                          ↳ Note: {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>

                {/* Ticket Footer / Bump Bar */}
                <div className="p-3 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Badge
                      variant={
                        order.status === "pending"
                          ? "warning"
                          : order.status === "preparing"
                          ? "glow"
                          : order.status === "ready"
                          ? "info"
                          : order.status === "cancelled"
                          ? "danger"
                          : "success"
                      }
                      dot={order.status !== "cancelled"}
                      size="sm"
                    >
                      {order.status === "pending"
                        ? "New"
                        : order.status === "preparing"
                        ? "Cooking"
                        : order.status === "ready"
                        ? "Ready"
                        : order.status === "cancelled"
                        ? "Rejected"
                        : "Served"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {(order.status === "pending" || order.status === "preparing") && (
                      <button
                        type="button"
                        onClick={() => handleRejectOrder(order.id)}
                        className="p-1.5 rounded-lg text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                        title="Reject / Cancel Order"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenThermal(order, order.status === "served" ? "bill" : "kot")}
                      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title={order.status === "served" ? "Print Guest Tax Bill" : "Print Kitchen KOT"}
                    >
                      <Printer className="h-4 w-4" />
                    </button>

                    {order.status === "cancelled" ? (
                      <span className="text-xs font-semibold text-rose-500 flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" /> Rejected
                      </span>
                    ) : order.status !== "served" ? (
                      <Button
                        variant={
                          order.status === "pending"
                            ? "glow"
                            : order.status === "preparing"
                            ? "glow"
                            : "secondary"
                        }
                        size="sm"
                        className="text-xs font-bold"
                        onClick={() => handleBump(order.id, order.status)}
                      >
                        {order.status === "pending" && "Start Cooking"}
                        {order.status === "preparing" && (isRoomService ? "Plated for Tray" : "Mark Ready")}
                        {order.status === "ready" && (isRoomService ? "Deliver to Suite" : "Dispatch")}
                      </Button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Done
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Manual / Walk-In / Room Service Order Creation Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Create Order for Table or Suite"
        description="Place an order on behalf of a dining table guest or in-house hotel room."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setIsManualModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="manual-order-form" variant="glow" size="sm">
              Send to Kitchen Station
            </Button>
          </div>
        }
      >
        <form id="manual-order-form" onSubmit={handleCreateManualOrder} className="space-y-4 py-2">
          {/* Destination Type Toggle */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Order Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setManualDestination("dine_in");
                  setManualTable("Table 01");
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  manualDestination === "dine_in"
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                🍽️ Restaurant Table
              </button>
              <button
                type="button"
                onClick={() => {
                  setManualDestination("room_service");
                  setManualTable("Suite 302");
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  manualDestination === "room_service"
                    ? "bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                🏨 In-Room Dining (Suite)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                {manualDestination === "room_service" ? "Suite / Room *" : "Table *"}
              </label>
              {manualDestination === "room_service" ? (
                <select
                  value={manualTable}
                  onChange={(e) => setManualTable(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Suite 101">Suite 101</option>
                  <option value="Suite 201">Suite 201</option>
                  <option value="Suite 202">Suite 202</option>
                  <option value="Suite 301">Suite 301</option>
                  <option value="Suite 302">Suite 302</option>
                  <option value="Penthouse PH-1">Penthouse PH-1</option>
                </select>
              ) : (
                <select
                  value={manualTable}
                  onChange={(e) => setManualTable(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  {tables.length > 0 ? (
                    tables.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.zone})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Table 01">Table 01</option>
                      <option value="Table 02">Table 02</option>
                      <option value="Table 03">Table 03</option>
                      <option value="Counter / Bar">Counter / Bar</option>
                    </>
                  )}
                </select>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Guest Name
              </label>
              <input
                type="text"
                placeholder={manualDestination === "room_service" ? "In-House Guest" : "Walk-in Guest"}
                value={manualCustomer}
                onChange={(e) => setManualCustomer(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
              Select Dishes
            </label>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {(menuItems.length > 0 ? menuItems : MENU_PRESETS).map((dish) => {
                const qty = selectedItems[dish.name] || 0;
                return (
                  <div
                    key={dish.name}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">{dish.name}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono ml-2">₹{dish.price}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedItems({
                            ...selectedItems,
                            [dish.name]: Math.max(0, qty - 1),
                          })
                        }
                        className="h-6 w-6 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-bold text-slate-900 dark:text-white">{qty}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedItems({
                            ...selectedItems,
                            [dish.name]: qty + 1,
                          })
                        }
                        className="h-6 w-6 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Delivery Notes / Folio Billing Instructions
            </label>
            <input
              type="text"
              placeholder="e.g. Extra napkins, deliver hot on tray"
              value={manualNotes}
              onChange={(e) => setManualNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </form>
      </Modal>

      {/* Thermal Print Modal */}
      {thermalOrder && (
        <ThermalPrintModal
          isOpen={isThermalOpen}
          onClose={() => setIsThermalOpen(false)}
          type={thermalType}
          restaurantName={tenantName}
          order={thermalOrder}
        />
      )}
    </div>
  );
}
