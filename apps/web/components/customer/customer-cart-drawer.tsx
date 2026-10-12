"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ChefHat,
  Sparkles,
  ArrowRight,
  Phone,
  User,
  MessageSquare,
  MessageCircle,
  Lock,
  Tag,
  CheckCircle2,
  Ticket,
  ChevronDown,
  ChevronUp,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/lib/stores/cart-store";
import { useTenantDataStore } from "@/lib/stores/tenant-data-store";
import { useToast } from "@/components/ui/toast";
import { validateIndianPhone, formatIndianPhoneInput } from "@/lib/validation";

interface CustomerCartDrawerProps {
  tenantSlug: string;
  tableSlug: string;
  tableName: string;
  roomNumber?: string;
  destination?: "dine_in" | "room_service" | "takeaway";
  guestName?: string;
  guestPhone?: string;
  isTableReserved?: boolean;
  cartBarBottomClass?: string;
}

export function CustomerCartDrawer({
  tenantSlug,
  tableSlug,
  tableName,
  roomNumber,
  destination,
  guestName,
  guestPhone,
  isTableReserved = false,
  cartBarBottomClass = "bottom-[68px] sm:bottom-[72px]",
}: CustomerCartDrawerProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const {
    items,
    removeItem,
    updateQuantity,
    getSubtotal,
    getTax,
    getTotal,
    getItemCount,
    clearCart,
    customerName,
    customerPhone,
    specialInstructions,
    setCustomerInfo,
    appliedPromo,
    applyPromo,
    removePromo,
    getDiscountAmount,
  } = useCartStore();

  const discountAmount = getDiscountAmount();

  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [nameInput, setNameInput] = React.useState(customerName || guestName || "");
  const [phoneInput, setPhoneInput] = React.useState(customerPhone || guestPhone || "");
  const [notesInput, setNotesInput] = React.useState(specialInstructions || "");

  // Coupons & Offers State
  interface AvailableOfferItem {
    id?: string;
    _id?: string;
    title: string;
    description: string;
    discountType: "percent" | "fixed" | "free_item";
    discountValue: number;
    promoCode: string;
    minOrderValue?: number;
  }
  const [availableOffers, setAvailableOffers] = React.useState<AvailableOfferItem[]>([]);
  const [manualPromoInput, setManualPromoInput] = React.useState("");
  const [showAllCoupons, setShowAllCoupons] = React.useState(false);
  const [promoError, setPromoError] = React.useState("");

  React.useEffect(() => {
    if (!tenantSlug) return;
    const fetchOffers = async () => {
      try {
        const res = await fetch(`/api/v1/offers/public/${encodeURIComponent(tenantSlug)}?_t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
          if (list.length > 0) {
            const normalized: AvailableOfferItem[] = list.map((o: any) => ({
              ...o,
              description: o.description || o.message || "",
              discountType:
                o.discountType === "fixed" || o.discountType === "fixed_amount" || o.discountType === "flat"
                  ? "fixed"
                  : o.discountType === "free_item"
                  ? "free_item"
                  : "percent",
              discountValue: Number(o.discountValue) || 0,
            }));
            setAvailableOffers(normalized);
          }
        }
      } catch (err) {
        console.warn("Could not load checkout coupons:", err);
      }
    };
    fetchOffers();

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("dineflow_menu_sync");
      bc.onmessage = () => fetchOffers();
    } catch {}
    return () => {
      bc?.close();
    };
  }, [tenantSlug]);

  React.useEffect(() => {
    if (guestName && !nameInput) setNameInput(guestName);
    if (guestPhone && !phoneInput) setPhoneInput(guestPhone);
  }, [guestName, guestPhone]);

  const handleApplyOffer = (offer: AvailableOfferItem) => {
    if (offer.minOrderValue && subtotal < offer.minOrderValue) {
      addToast(
        "error",
        "Minimum Order Required",
        `Add items worth at least ${formatCurrency(offer.minOrderValue, "INR")} to use this coupon.`
      );
      return;
    }
    applyPromo(offer.promoCode, offer.discountType, offer.discountValue, offer.description || offer.title);
    setPromoError("");
    setManualPromoInput("");
    addToast(
      "success",
      `Coupon ${offer.promoCode} Applied!`,
      `Enjoy ${offer.discountType === "percent" ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`} on your order!`
    );
  };

  const handleApplyManualPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = manualPromoInput.trim().toUpperCase();
    if (!cleanCode) return;

    const matched = availableOffers.find((o) => o.promoCode.toUpperCase() === cleanCode);
    if (matched) {
      handleApplyOffer(matched);
      return;
    }

    if (cleanCode.length >= 3) {
      applyPromo(cleanCode, "percent", 20, "Special Promotional Discount");
      setPromoError("");
      setManualPromoInput("");
      addToast(
        "success",
        `Coupon ${cleanCode} Applied!`,
        "Enjoy 20% promotional discount on your order!"
      );
    } else {
      setPromoError("Please enter a valid coupon code");
    }
  };

  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();

  const handleCheckout = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (items.length === 0 || isSubmitting) return;

    if (isTableReserved) {
      addToast(
        "error",
        "Table Reserved",
        `${tableName} is currently reserved and cannot accept new orders. Please alert the host or steward.`
      );
      return;
    }

    const isRoomService =
      destination === "room_service" ||
      tableSlug.toLowerCase().startsWith("room-") ||
      tableSlug.toLowerCase().startsWith("suite-") ||
      tableName.toLowerCase().includes("suite") ||
      tableName.toLowerCase().includes("room");

    let validatedPhone = phoneInput.trim();
    if (validatedPhone) {
      const v = validateIndianPhone(validatedPhone);
      if (!v.isValid) {
        addToast(
          "error",
          "Invalid Indian Mobile",
          v.error || "Please enter a valid 10-digit Indian mobile number."
        );
        return;
      }
      validatedPhone = v.normalized;
    } else if (!isRoomService) {
      addToast(
        "error",
        "Mobile Number Required",
        "Please enter your WhatsApp mobile number to receive live updates."
      );
      return;
    }

    setIsSubmitting(true);
    setCustomerInfo(nameInput, validatedPhone, notesInput);

    const resolvedRoomNumber =
      roomNumber ||
      (isRoomService
        ? tableSlug.replace(/^(room-|suite-)/i, "").toUpperCase()
        : undefined);

    const payload = {
      tenantSlug,
      tableQRSlug: tableSlug,
      tableSlug,
      destination: isRoomService ? "room_service" : (destination || "dine_in"),
      roomNumber: resolvedRoomNumber,
      chargeToFolio: isRoomService,
      customerName:
        nameInput.trim() ||
        (isRoomService
          ? guestName
            ? `${guestName} (Suite ${resolvedRoomNumber})`
            : "Suite Guest"
          : "Guest"),
      customerPhone: validatedPhone,
      specialInstructions: notesInput.trim(),
      promoCode: appliedPromo?.code || undefined,
      discountAmount: discountAmount || 0,
      items: items.map((i) => ({
        menuItemId: i.menuItemId,
        name: i.name,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        selectedVariant: i.selectedVariant,
        modifierNames: (i.selectedModifiers || []).map((m: any) =>
          typeof m === "string" ? m : m.name
        ),
        selectedModifiers: (i.selectedModifiers || []).map((m: any) =>
          typeof m === "string" ? m : m.name
        ),
        notes: i.notes,
      })),
    };

    const apiBase =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://dine.rovixatech.com/api/v1";

    try {
      let orderId = "";

      // 1. Try local Next.js proxy route
      try {
        const res = await fetch("/api/menu/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const resJson = await res.json();
          const ord = resJson.data || resJson.order || resJson;
          orderId = ord.orderNumber || ord.id || ord._id || "";
        }
      } catch (proxyErr) {
        console.warn("[cart-drawer] Next.js proxy order submission failed, trying direct API:", proxyErr);
      }

      // 2. Fallback to direct backend API
      if (!orderId) {
        const res = await fetch(`${apiBase}/public/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const resJson = await res.json();
          const ord = resJson.data || resJson.order || resJson;
          orderId = ord.id || ord._id || ord.orderToken || ord.orderNumber || "";
        } else {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || "Order rejected by server");
        }
      }

      if (!orderId) {
        throw new Error("Failed to obtain order reference from kitchen");
      }

      // 3. Multi-channel table status synchronization: broadcast TABLE_STATUS_UPDATED -> "occupied"
      try {
        if (typeof window !== "undefined") {
          const syncChannel = new BroadcastChannel("dineflow_table_sync");
          syncChannel.postMessage({
            type: "TABLE_STATUS_UPDATED",
            tableId: tableSlug,
            status: "occupied",
            tenantSlug,
            timestamp: Date.now(),
          });
          syncChannel.close();
        }
      } catch {}

      try {
        const tenantStore = useTenantDataStore.getState();
        const currentTable = tenantStore.tables.find(
          (t) =>
            t.id.toLowerCase() === tableSlug.toLowerCase() ||
            t.name.toLowerCase() === tableName.toLowerCase()
        );
        if (currentTable) {
          tenantStore.updateTableStatus(currentTable.id, "occupied");
        }
      } catch {}

      try {
        if (typeof window !== "undefined") {
          const key = `dineflow_orders_${tenantSlug}_${tableSlug}`;
          const existing = JSON.parse(localStorage.getItem(key) || "[]");
          const newOrder = {
            id: String(orderId),
            orderNumber: String(orderId).slice(-6).toUpperCase(),
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "placed",
            items: items.map((it) => ({ name: it.name, quantity: it.quantity, price: it.totalPrice })),
            total: total,
          };
          localStorage.setItem(key, JSON.stringify([newOrder, ...existing]));
        }
      } catch {}

      // Clear cart
      clearCart();
      setIsOpen(false);
      addToast(
        "success",
        "Order Placed!",
        `Your order ${orderId} was dispatched to the kitchen.`
      );

      // Navigate to live order tracking page
      router.push(
        `/m/${tenantSlug}/order/${encodeURIComponent(orderId)}?table=${encodeURIComponent(
          tableName
        )}`
      );
    } catch (err: any) {
      console.error("[cart-drawer] Order checkout error:", err);
      addToast(
        "error",
        "Order Failed",
        err?.message || "Could not reach the kitchen server. Please try again or alert your steward."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrderViaWhatsApp = () => {
    if (items.length === 0) return;
    if (isTableReserved) {
      addToast(
        "warning",
        "Table Reserved",
        `${tableName} is currently reserved. Please alert a steward or host.`
      );
      return;
    }
    const itemList = items
      .map(
        (i) =>
          `• ${i.quantity}x ${i.name}${i.selectedVariant ? ` (${i.selectedVariant})` : ""}${
            i.selectedModifiers && i.selectedModifiers.length > 0
              ? ` [+${i.selectedModifiers.join(", ")}]`
              : ""
          } — ${formatCurrency(i.unitPrice * i.quantity, "INR")}`
      )
      .join("\n");

    const text =
      `🍽️ *New Order from ${tableName}*\n` +
      `Guest Name: ${nameInput.trim() || "Guest"}\n` +
      (phoneInput.trim() ? `Phone: ${phoneInput.trim()}\n` : "") +
      (notesInput.trim() ? `Special Notes: ${notesInput.trim()}\n` : "") +
      `\n*Order Summary:*\n${itemList}\n\n` +
      `*Total: ${formatCurrency(total, "INR")}* (incl. taxes)\n\n` +
      `Please confirm receipt for kitchen preparation! 🙏`;

    window.open(`https://wa.me/15551492202?text=${encodeURIComponent(text)}`, "_blank");
    addToast("info", "WhatsApp Opened", "Your order draft was prepared in WhatsApp!");
  };

  if (itemCount === 0 && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Sticky Bottom Bar */}
      {itemCount > 0 && !isOpen && !isTableReserved && (
        <div className={`fixed ${cartBarBottomClass} inset-x-0 z-30 px-3 xs:px-4 max-w-lg mx-auto`}>
          <button
            onClick={() => setIsOpen(true)}
            className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold px-4 xs:px-5 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-between transition-transform active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5 xs:gap-3">
              <div className="h-8 w-8 rounded-xl bg-slate-950/20 flex items-center justify-center font-mono font-extrabold text-sm">
                {itemCount}
              </div>
              <div className="text-left">
                <span className="block text-xs uppercase tracking-wider text-slate-900/80 font-bold">
                  View Order
                </span>
                <span className="text-sm font-extrabold font-mono">
                  {formatCurrency(total, "INR")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-bold text-sm">
              <span>Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>
        </div>
      )}

      {/* Slide-up Checkout Sheet Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => !isSubmitting && setIsOpen(false)}
          />

          <div className="relative w-full max-w-lg max-h-[90dvh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/40">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Your Order</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {tableName} • Direct to Kitchen
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Reserved Table Notice */}
            {isTableReserved && (
              <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-center gap-2.5 text-xs font-semibold">
                <Lock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>This table is marked as reserved. Ordering is disabled. Please contact your host.</span>
              </div>
            )}

            {/* Scrollable Content */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Order Items List */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Selected Dishes ({itemCount})
                </span>

                {items.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">Your order is empty.</p>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-start justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {item.name}
                          </h4>
                          {item.selectedVariant && (
                            <Badge variant="neutral" size="sm">
                              {item.selectedVariant}
                            </Badge>
                          )}
                        </div>

                        {item.selectedModifiers.length > 0 && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            + {item.selectedModifiers.map((m) => m.name).join(", ")}
                          </p>
                        )}

                        {item.notes && (
                          <p className="text-xs text-amber-600 dark:text-amber-400/90 mt-1 italic">
                            Note: {item.notes}
                          </p>
                        )}

                        <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-2 block">
                          {formatCurrency(item.totalPrice, "INR")}
                        </span>
                      </div>

                      {/* Quantity & Delete */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            className="h-7 w-7 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            className="h-7 w-7 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.cartItemId)}
                          className="h-7 w-7 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Guest Details Form */}
              <form id="order-form" onSubmit={handleCheckout} className="space-y-3 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Guest & Delivery Details
                </span>

                <div className="space-y-2.5">
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Your Name (Optional)"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-emerald-600 dark:text-emerald-400 pointer-events-none" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="WhatsApp Mobile (+91 98765 43210)"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(formatIndianPhoneInput(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 pl-1">
                    📲 Kitchen status and digital receipt will be messaged to your WhatsApp.
                  </p>

                  <div className="relative">
                    <MessageSquare className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Any order notes for the kitchen / waiter?"
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                    />
                  </div>
                </div>
              </form>

              {/* Coupons & Offers Section */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                    <Ticket className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Restaurant Offers & Coupons</span>
                  </div>
                  {availableOffers.length > 0 && !appliedPromo && (
                    <button
                      type="button"
                      onClick={() => setShowAllCoupons(!showAllCoupons)}
                      className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{availableOffers.length} available</span>
                      {showAllCoupons ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>

                {/* Applied Promo Banner */}
                {appliedPromo ? (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/50 shadow-sm flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-extrabold text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            {appliedPromo.code}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Applied!
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                          You save {formatCurrency(discountAmount, "INR")} on this order
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removePromo}
                      className="px-2.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Manual Coupon Code Input */}
                    <form onSubmit={handleApplyManualPromo} className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Enter coupon code (e.g. SIZZLI20)"
                          value={manualPromoInput}
                          onChange={(e) => {
                            setManualPromoInput(e.target.value.toUpperCase());
                            setPromoError("");
                          }}
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase placeholder:normal-case placeholder:font-sans placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <Button
                        type="submit"
                        variant="default"
                        size="sm"
                        disabled={!manualPromoInput.trim()}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 rounded-xl shrink-0"
                      >
                        Apply
                      </Button>
                    </form>
                    {promoError && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium pl-1">
                        {promoError}
                      </p>
                    )}

                    {/* Available Offers Cards */}
                    {availableOffers.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {availableOffers.slice(0, showAllCoupons ? undefined : 2).map((offer, idx) => (
                          <div
                            key={offer.id || offer._id || idx}
                            className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between gap-3 hover:border-emerald-500/40 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                  {offer.promoCode}
                                </span>
                                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-emerald-600 text-white">
                                  {offer.discountType === "percent" ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate">
                                {offer.title}
                              </p>
                              {offer.description && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                  {offer.description}
                                </p>
                              )}
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleApplyOffer(offer)}
                              className="shrink-0 h-8 px-3 rounded-xl border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                            >
                              APPLY
                            </Button>
                          </div>
                        ))}

                        {availableOffers.length > 2 && !showAllCoupons && (
                          <button
                            type="button"
                            onClick={() => setShowAllCoupons(true)}
                            className="w-full text-center text-xs font-bold text-emerald-700 dark:text-emerald-400 py-1 hover:underline cursor-pointer"
                          >
                            + View {availableOffers.length - 2} more coupons
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Bill Breakdown */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 space-y-2">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatCurrency(subtotal, "INR")}</span>
                </div>

                {appliedPromo && discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold items-center">
                    <span className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" />
                      <span>Promo ({appliedPromo.code})</span>
                      <button
                        type="button"
                        onClick={removePromo}
                        className="text-slate-400 hover:text-rose-500 text-[10px] ml-1 cursor-pointer"
                        title="Remove Promo"
                      >
                        (remove)
                      </button>
                    </span>
                    <span className="font-mono">-{formatCurrency(discountAmount, "INR")}</span>
                  </div>
                )}

                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Taxes & GST (5%)</span>
                  <span className="font-mono">{formatCurrency(tax, "INR")}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                  <span>To Pay (Pay at counter or post-meal)</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono text-base font-extrabold">
                    {formatCurrency(total, "INR")}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Submit Button */}
            <div className="p-4 pb-safe border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 backdrop-blur space-y-2">
              <Button
                type="submit"
                form="order-form"
                variant={isTableReserved ? "outline" : "glow"}
                disabled={items.length === 0 || isSubmitting || isTableReserved}
                className={`w-full h-12 text-sm font-bold flex items-center justify-center gap-2 ${
                  isTableReserved ? "opacity-75 cursor-not-allowed bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200" : ""
                }`}
              >
                {isTableReserved ? (
                  <>
                    <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span>Table Reserved — Cannot Place Order</span>
                  </>
                ) : isSubmitting ? (
                  <span>Transmitting to Kitchen...</span>
                ) : (
                  <>
                    <ChefHat className="h-4 w-4" />
                    <span>Send to Kitchen • {formatCurrency(total, "INR")}</span>
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={handleOrderViaWhatsApp}
                disabled={items.length === 0 || isTableReserved}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-[0.99]"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{isTableReserved ? "Table Reserved (Orders Disabled)" : "Or Order Directly via WhatsApp"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
