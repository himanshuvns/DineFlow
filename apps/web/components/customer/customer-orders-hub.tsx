"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Receipt,
  UtensilsCrossed,
  ShoppingBag,
  ArrowRight,
  Flame,
  Check,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/stores/cart-store";
import { formatCurrency } from "@/lib/utils";

interface CustomerOrdersHubProps {
  tenantSlug: string;
  tableId: string;
  tableName: string;
  onOpenMenu: () => void;
  onOpenCheckout: () => void;
}

interface PlacedOrder {
  id: string;
  orderNumber: string;
  timestamp: string;
  status: "placed" | "preparing" | "ready" | "served" | "paid";
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
}

export function CustomerOrdersHub({
  tenantSlug,
  tableId,
  tableName,
  onOpenMenu,
  onOpenCheckout,
}: CustomerOrdersHubProps) {
  const { items, getItemCount, getTotal } = useCartStore();
  const cartItemCount = getItemCount();
  const cartTotal = getTotal();

  const [placedOrders, setPlacedOrders] = React.useState<PlacedOrder[]>([]);

  React.useEffect(() => {
    // Load table orders from storage
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`dineflow_orders_${tenantSlug}_${tableId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPlacedOrders(parsed);
          }
        }
      } catch {}
    }
  }, [tenantSlug, tableId]);

  const stages = [
    { key: "placed", label: "Received", icon: Clock },
    { key: "preparing", label: "Cooking (KDS)", icon: Flame },
    { key: "ready", label: "Ready", icon: CheckCircle2 },
    { key: "served", label: "Served", icon: UtensilsCrossed },
  ];

  const getStageIndex = (status: string) => {
    switch (status) {
      case "placed":
        return 0;
      case "preparing":
        return 1;
      case "ready":
        return 2;
      case "served":
      case "paid":
        return 3;
      default:
        return 1;
    }
  };

  return (
    <div className="space-y-4 pb-mobile-nav max-w-xl mx-auto px-4 pt-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Live Kitchen Tracker
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {tableName} Orders
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time synchronization with kitchen display screens
            </p>
          </div>
          <Badge variant="glow" size="sm" className="font-mono text-xs font-bold">
            Live KDS Active
          </Badge>
        </div>
      </div>

      {/* Unsubmitted Cart Card (if items present) */}
      {cartItemCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-500/30 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold text-sm">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Cart Ready for Kitchen
                </h4>
                <p className="text-xs text-slate-500">
                  {cartItemCount} {cartItemCount === 1 ? "dish" : "dishes"} • {formatCurrency(cartTotal, "INR")}
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="glow"
              onClick={onOpenCheckout}
              className="font-bold text-xs rounded-xl h-8 px-3"
            >
              Checkout
            </Button>
          </div>

          <div className="pt-2 border-t border-emerald-500/20 flex flex-wrap gap-1.5">
            {items.map((item) => (
              <span
                key={item.cartItemId}
                className="text-[11px] font-semibold bg-white dark:bg-slate-900 border border-emerald-500/20 px-2 py-0.5 rounded-lg text-slate-800 dark:text-slate-200"
              >
                {item.quantity}× {item.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-3">
        {placedOrders.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Table Orders Placed Yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Once you send dishes to the kitchen, their live cooking status and chef progress will appear right here.
              </p>
            </div>
            <Button
              onClick={onOpenMenu}
              variant="glow"
              size="sm"
              className="mt-2 font-bold text-xs"
            >
              <UtensilsCrossed className="h-3.5 w-3.5 mr-1.5" />
              Browse Menu & Start Order
            </Button>
          </div>
        ) : (
          placedOrders.map((ord, idx) => {
            const currentIdx = getStageIndex(ord.status);
            return (
              <div
                key={ord.id || idx}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      #{ord.orderNumber || `DF-${idx + 1}`}
                    </span>
                    <span className="text-[11px] text-slate-400">• {ord.timestamp || "Just now"}</span>
                  </div>
                  <Badge
                    variant={ord.status === "served" ? "neutral" : "glow"}
                    size="sm"
                    className="font-bold text-[10px] capitalize"
                  >
                    {ord.status}
                  </Badge>
                </div>

                {/* Progress Tracker */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    {stages.map((stg, sIdx) => {
                      const isComplete = sIdx <= currentIdx;
                      return (
                        <div
                          key={stg.key}
                          className={`flex items-center gap-1 ${
                            isComplete ? "text-emerald-600 dark:text-emerald-400 font-extrabold" : "text-slate-400"
                          }`}
                        >
                          <span>{stg.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress Bar Line */}
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${((currentIdx + 1) / stages.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Ordered Items */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  {ord.items.map((it, itIdx) => (
                    <div key={itIdx} className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
                      <span>{it.quantity}× {it.name}</span>
                      <span className="font-mono font-semibold">{formatCurrency(it.price, "INR")}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span>Order Total</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
                      {formatCurrency(ord.total, "INR")}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <Link
                    href={`/m/${tenantSlug}/order/${encodeURIComponent(ord.id || `#${ord.orderNumber}`)}?table=${encodeURIComponent(tableName)}&tableSlug=${encodeURIComponent(tableId)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
                  >
                    <span>Open Live Kitchen Tracker</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}

        {/* Order More Action Button */}
        <div className="pt-2">
          <Button
            type="button"
            onClick={onOpenMenu}
            variant="outline"
            className="w-full h-11 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
          >
            <UtensilsCrossed className="h-4 w-4" />
            <span>Add More Dishes to {tableName}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
