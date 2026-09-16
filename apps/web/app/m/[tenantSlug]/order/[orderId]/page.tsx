"use client";

import * as React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  ChefHat,
  BellRing,
  Sparkles,
  ArrowLeft,
  Receipt,
  MessageCircle,
  PlusCircle,
  HelpCircle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";

type OrderStatus = "pending" | "preparing" | "ready" | "served" | "paid" | "cancelled";

interface TrackingOrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  selectedVariant?: string;
  selectedModifiers?: Array<{ name: string; price: number } | string>;
  notes?: string;
}

interface TrackingOrder {
  id?: string;
  orderNumber?: string;
  status: OrderStatus;
  tableName?: string;
  customerName?: string;
  items: TrackingOrderItem[];
  subtotal: number;
  taxAmount: number;
  roomServiceFee?: number;
  totalAmount: number;
  createdAt?: string;
}

export default function OrderTrackingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useToast();

  const tenantSlug = (params?.tenantSlug as string) || "the-grand-bistro";
  const orderId = (params?.orderId as string) || "ORD-9421";
  const urlTable = searchParams.get("table");

  const [order, setOrder] = React.useState<TrackingOrder | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [status, setStatus] = React.useState<OrderStatus>("pending");
  const [secondsElapsed, setSecondsElapsed] = React.useState(0);
  const [selectedRating, setSelectedRating] = React.useState(5);
  const [selectedTags, setSelectedTags] = React.useState<string[]>(["Delicious Food", "Lightning Fast"]);

  const tableName = order?.tableName || urlTable || "Dine-in";

  // Fetch real order from database via proxy route
  const fetchOrder = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/menu/order/${encodeURIComponent(orderId)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json.order || json;
        if (data && (data.id || data.orderNumber)) {
          setOrder({
            id: data.id,
            orderNumber: data.orderNumber || orderId,
            status: data.status || "pending",
            tableName: data.tableName || urlTable || "Dine-in",
            customerName: data.customerName,
            items: Array.isArray(data.items) ? data.items : [],
            subtotal: data.subtotal || 0,
            taxAmount: data.taxAmount || 0,
            roomServiceFee: data.roomServiceFee || 0,
            totalAmount: data.totalAmount || data.total || 0,
            createdAt: data.createdAt,
          });
          const orderStatus = (data.status || "pending") as OrderStatus;
          setStatus(orderStatus);
          if (data.createdAt) {
            const isDelivered = orderStatus === "served" || orderStatus === "paid" || orderStatus === "cancelled";
            const startMs = new Date(data.createdAt).getTime();
            if (isDelivered) {
              let endMs = data.updatedAt ? new Date(data.updatedAt).getTime() : startMs;
              if (Array.isArray(data.timeline)) {
                const servedEvent = data.timeline.find((t: any) => t.status === "served" || t.status === "delivered");
                if (servedEvent?.timestamp) {
                  endMs = new Date(servedEvent.timestamp).getTime();
                }
              }
              setSecondsElapsed(Math.max(0, Math.floor((endMs - startMs) / 1000)));
            } else {
              setSecondsElapsed(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
            }
          }
        }
      }
    } catch (e) {
      console.warn("[order-track] Live fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [orderId, urlTable]);

  React.useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 4000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  // Live timer tick - stops once order is served/delivered, paid, or cancelled
  React.useEffect(() => {
    if (status === "served" || status === "paid" || status === "cancelled") {
      return;
    }
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}m ${remainder < 10 ? "0" : ""}${remainder}s`;
  };

  const isRoomService =
    orderId.toUpperCase().includes("IRD") ||
    tableName.toLowerCase().includes("suite") ||
    tableName.toLowerCase().includes("room");

  const steps = [
    {
      id: "pending",
      label: isRoomService ? "Order Received" : "Order Placed",
      sublabel: isRoomService ? "Private dining station alerted" : "Received by Kitchen",
      icon: CheckCircle2,
    },
    {
      id: "preparing",
      label: isRoomService ? "Culinary Prep" : "Cooking in Kitchen",
      sublabel: isRoomService ? "Chef crafting private suite course" : "Chef is crafting your meal",
      icon: ChefHat,
    },
    {
      id: "ready",
      label: isRoomService ? "Butler En Route" : "Plated & Ready",
      sublabel: isRoomService ? "Silver tray delivery to your door" : "Steward dispatching to table",
      icon: BellRing,
    },
    {
      id: "served",
      label: isRoomService ? "Delivered to Suite" : "Served",
      sublabel: isRoomService ? "Enjoy your in-room dining!" : "Bon appétit!",
      icon: Sparkles,
    },
  ];

  const getStepState = (stepId: string) => {
    const orderLevels: Record<OrderStatus, number> = {
      pending: 0,
      preparing: 1,
      ready: 2,
      served: 3,
      paid: 4,
      cancelled: -1,
    };
    const currentLevel = orderLevels[status];
    const stepLevel = orderLevels[stepId as OrderStatus];

    if (stepLevel < currentLevel) return "completed";
    if (stepLevel === currentLevel) return "active";
    return "upcoming";
  };

  const handleCallSteward = () => {
    addToast(
      "success",
      isRoomService ? "Butler Alerted" : "Steward Alerted",
      isRoomService
        ? `In-room concierge alerted for ${tableName}. Steward arriving shortly.`
        : `A server has been requested for ${tableName}. Arriving in ~60 seconds.`
    );
  };

  const handleRequestBill = () => {
    addToast(
      "info",
      isRoomService ? "Folio Billing" : "Bill Requested",
      isRoomService
        ? `This order has been automatically charged to ${tableName} folio.`
        : `Printed bill with cash/card/UPI terminal requested for ${tableName}.`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 font-sans transition-colors duration-200">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => {
              if (isRoomService) {
                const rNum = tableName.replace(/[^0-9]/g, "");
                if (rNum) {
                  router.push(`/m/${tenantSlug}/room/${rNum}`);
                  return;
                }
              }
              if (urlTable) {
                router.push(`/m/${tenantSlug}/${encodeURIComponent(urlTable.toLowerCase().replace(/\s+/g, "-"))}`);
              } else {
                router.push(`/m/${tenantSlug}`);
              }
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Menu</span>
          </button>

          <div className="text-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block">
              {isRoomService ? "Suite Service Live Tracking" : "DineFlow Live Tracking"}
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">{orderId}</span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm" />
            <Badge variant="glow" size="sm" className="font-mono font-bold">
              {tableName}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        {/* Status Hero Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-3xl -z-0 pointer-events-none" />

          <div className="relative z-10 text-center">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold mb-3 border ${
                status === "served" || status === "paid"
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  : "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300"
              }`}
            >
              {status === "served" || status === "paid" ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              )}
              <span>
                {status === "served" || status === "paid"
                  ? `Delivered in: ${formatTimer(secondsElapsed)}`
                  : `Elapsed: ${formatTimer(secondsElapsed)}`}
              </span>
            </div>

            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {status === "pending" && (isRoomService ? "Dispatching to Suite Chef..." : "Sending to Kitchen...")}
              {status === "preparing" && (isRoomService ? "Chef Preparing Your Suite Dining" : "Chef is Preparing Your Food")}
              {status === "ready" && (isRoomService ? "Butler En Route to Your Suite" : "Your Food is Ready!")}
              {status === "served" && (isRoomService ? "Delivered to Your Door" : "Served at Your Table")}
            </h1>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs mx-auto">
              {status === "preparing"
                ? (isRoomService
                    ? "Your order was sent directly to the room service station. Fresh course is being plated on a silver tray."
                    : "Your order was sent directly to the kitchen display. Fresh ingredients are on the flame.")
                : status === "ready"
                ? (isRoomService
                    ? "Your meal has left the kitchen on a silver tray and is heading up to your suite door."
                    : "Plated and hot. A server is bringing it directly to your table right now.")
                : status === "served"
                ? (isRoomService
                    ? "Your in-room dining course has been delivered. Enjoy your meal!"
                    : "Delivered to your table. Let us know if you need anything else.")
                : (isRoomService
                    ? "Your order is being queued by the private suite chef station."
                    : "Your order is in the kitchen queue. Cooking starts momentarily.")}
            </p>

            {/* WhatsApp Alert Banner */}
            <div className="mt-5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
              <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-medium">
                Live alerts active on WhatsApp for this order.
              </span>
            </div>
          </div>
        </div>

        {/* Visual Progress Steps */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 shadow-md space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
            Order Progress
          </span>

          <div className="space-y-6 relative pl-3">
            {/* Connecting Vertical Line */}
            <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />

            {steps.map((step) => {
              const state = getStepState(step.id);
              const Icon = step.icon;

              return (
                <div key={step.id} className="relative z-10 flex items-start gap-4">
                  {/* Step Icon Circle */}
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 border text-xs transition-colors ${
                      state === "completed"
                        ? "bg-emerald-500 border-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                        : state === "active"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-4 ring-emerald-500/10 animate-pulse"
                        : "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600"
                    }`}
                  >
                    {state === "completed" ? (
                      <Check className="h-4 w-4 stroke-[3]" />
                    ) : (
                      <Icon className="h-3.5 w-3.5" />
                    )}
                  </div>

                  {/* Step Description */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-bold ${
                        state === "upcoming" ? "text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {step.sublabel}
                    </p>
                  </div>

                  {state === "active" && (
                    <Badge variant="glow" size="sm">
                      Current
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Ordered Items Summary */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Ordered Items
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {order?.items?.length || 0} {order?.items?.length === 1 ? "Item" : "Items"}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {order?.items && order.items.length > 0 ? (
              order.items.map((it, idx) => {
                const itemPrice = it.totalPrice || it.unitPrice * (it.quantity || 1);
                const modNames = Array.isArray(it.selectedModifiers)
                  ? it.selectedModifiers
                      .map((m) => (typeof m === "string" ? m : m.name))
                      .join(", ")
                  : "";

                return (
                  <div
                    key={idx}
                    className={`flex items-start justify-between text-sm ${
                      idx < (order.items?.length || 0) - 1 ? "border-b border-slate-100 dark:border-slate-800/60 pb-3" : ""
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        <span className="text-emerald-600 dark:text-emerald-400 mr-2">{it.quantity || 1}x</span>
                        {it.name}
                      </span>
                      {(it.selectedVariant || modNames || it.notes) && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {[it.selectedVariant, modNames, it.notes]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                      )}
                    </div>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      ₹{itemPrice.toFixed(0)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-2 text-center text-xs text-slate-500">
                {loading ? "Loading order details..." : "Items submitted to kitchen."}
              </div>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono">
                ₹{(order?.subtotal || (order?.totalAmount ? order.totalAmount / 1.05 : 0)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>GST & Taxes (5%)</span>
              <span className="font-mono">
                ₹{(order?.taxAmount || (order?.totalAmount ? order.totalAmount - (order.totalAmount / 1.05) : 0)).toFixed(2)}
              </span>
            </div>
            {Boolean(order?.roomServiceFee) && (
              <div className="flex justify-between">
                <span>Room Service Fee</span>
                <span className="font-mono">₹{order?.roomServiceFee?.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
              <span>Total Payable</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-base font-extrabold">
                ₹{(order?.totalAmount || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Post-Dining Guest Feedback Card (Phase 5) ──────────────────── */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-md">
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">How was your dining experience?</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Your feedback helps our culinary team maintain 5-star standards.</p>
          </div>

          {/* Star Rating Selectors */}
          <div className="flex justify-center items-center gap-2 py-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setSelectedRating(star);
                  addToast("success", "Rating Selected", `You gave ${star} out of 5 stars.`);
                }}
                className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-amber-400 transition-transform active:scale-125 cursor-pointer"
              >
                <Sparkles
                  className={`h-7 w-7 transition-colors ${
                    star <= selectedRating
                      ? "text-amber-400 fill-amber-400 drop-shadow-md"
                      : "text-slate-300 dark:text-slate-600 hover:text-amber-400"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Compliment Chips */}
          <div className="flex flex-wrap justify-center gap-1.5 pt-1">
            {["Delicious Food", "Lightning Fast", "Polite Staff", "Luxury Vibe", "Cold Drinks"].map((chip) => {
              const isSelected = selectedTags.includes(chip);
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setSelectedTags((prev) =>
                      isSelected ? prev.filter((t) => t !== chip) : [...prev, chip]
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs font-semibold border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => {
              addToast("success", "Feedback Recorded", "Thank you! Your feedback has been shared with the head chef.");
            }}
          >
            Submit Feedback Review
          </Button>
        </div>

        {/* Quick Hospitality Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="secondary"
            className="h-12 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs"
            onClick={handleCallSteward}
          >
            <BellRing className="h-4 w-4 mr-2 text-emerald-500 dark:text-emerald-400" />
            <span>Call Steward</span>
          </Button>

          <Button
            variant="secondary"
            className="h-12 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs"
            onClick={handleRequestBill}
          >
            <Receipt className="h-4 w-4 mr-2 text-amber-500 dark:text-amber-400" />
            <span>Request Bill</span>
          </Button>

          <Button
            variant="glow"
            className="col-span-2 h-12 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
            onClick={() => {
              if (isRoomService) {
                const rNum = tableName.replace(/[^0-9]/g, "");
                if (rNum) {
                  router.push(`/m/${tenantSlug}/room/${rNum}`);
                  return;
                }
              }
              if (urlTable) {
                router.push(`/m/${tenantSlug}/${encodeURIComponent(urlTable.toLowerCase().replace(/\s+/g, "-"))}`);
              } else {
                router.push(`/m/${tenantSlug}`);
              }
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            <span>Order More Drinks or Food</span>
          </Button>
        </div>
      </main>
    </div>
  );
}
