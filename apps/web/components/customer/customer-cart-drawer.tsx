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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/lib/stores/cart-store";
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
}

export function CustomerCartDrawer({
  tenantSlug,
  tableSlug,
  tableName,
  roomNumber,
  destination,
  guestName,
  guestPhone,
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
  } = useCartStore();

  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [nameInput, setNameInput] = React.useState(customerName || guestName || "");
  const [phoneInput, setPhoneInput] = React.useState(customerPhone || guestPhone || "");
  const [notesInput, setNotesInput] = React.useState(specialInstructions || "");

  React.useEffect(() => {
    if (guestName && !nameInput) setNameInput(guestName);
    if (guestPhone && !phoneInput) setPhoneInput(guestPhone);
  }, [guestName, guestPhone]);

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
      "https://api-production-f170.up.railway.app/api/v1";

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
          orderId = ord.orderNumber || ord.id || ord._id || "";
        } else {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || "Order rejected by server");
        }
      }

      if (!orderId) {
        throw new Error("Failed to obtain order reference from kitchen");
      }

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

    window.open(`https://wa.me/919876543210?text=${encodeURIComponent(text)}`, "_blank");
    addToast("info", "WhatsApp Opened", "Your order draft was prepared in WhatsApp!");
  };

  if (itemCount === 0 && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Sticky Bottom Bar */}
      {itemCount > 0 && !isOpen && (
        <div className="fixed bottom-4 inset-x-0 z-40 px-3 xs:px-4 max-w-lg mx-auto pb-safe">
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

          <div className="relative w-full max-w-lg max-h-[90dvh] flex flex-col bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Your Order</h3>
                  <p className="text-[11px] text-slate-400">
                    {tableName} • Direct to Kitchen
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="h-8 w-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Order Items List */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Selected Dishes ({itemCount})
                </span>

                {items.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">Your order is empty.</p>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate">
                            {item.name}
                          </h4>
                          {item.selectedVariant && (
                            <Badge variant="neutral" size="sm">
                              {item.selectedVariant}
                            </Badge>
                          )}
                        </div>

                        {item.selectedModifiers.length > 0 && (
                          <p className="text-xs text-slate-400 mt-1">
                            + {item.selectedModifiers.map((m) => m.name).join(", ")}
                          </p>
                        )}

                        {item.notes && (
                          <p className="text-xs text-amber-400/90 mt-1 italic">
                            Note: {item.notes}
                          </p>
                        )}

                        <span className="text-xs font-mono font-semibold text-emerald-400 mt-2 block">
                          {formatCurrency(item.totalPrice, "INR")}
                        </span>
                      </div>

                      {/* Quantity & Delete */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-white"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-white"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.cartItemId)}
                          className="h-7 w-7 rounded-lg text-slate-500 hover:text-rose-400 flex items-center justify-center"
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
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Guest & Delivery Details
                </span>

                <div className="space-y-2.5">
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Your Name (Optional)"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-emerald-400" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="WhatsApp Mobile (+91 98765 43210)"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(formatIndianPhoneInput(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 pl-1">
                    📲 Kitchen status and digital receipt will be messaged to your WhatsApp.
                  </p>

                  <div className="relative">
                    <MessageSquare className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Any order notes for the waiter?"
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </form>

              {/* Bill Breakdown */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatCurrency(subtotal, "INR")}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Taxes & GST (5%)</span>
                  <span className="font-mono">{formatCurrency(tax, "INR")}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                  <span>To Pay (Pay at counter or post-meal)</span>
                  <span className="text-emerald-400 font-mono text-base">
                    {formatCurrency(total, "INR")}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Submit Button */}
            <div className="p-4 pb-safe border-t border-slate-800 bg-slate-950/90 backdrop-blur space-y-2">
              <Button
                type="submit"
                form="order-form"
                variant="glow"
                disabled={items.length === 0 || isSubmitting}
                className="w-full h-12 text-sm font-bold flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
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
                disabled={items.length === 0}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-[0.99]"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Or Order Directly via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
