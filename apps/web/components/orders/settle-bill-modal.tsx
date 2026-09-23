"use client";

import * as React from "react";
import {
  Banknote,
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  Printer,
  MessageCircle,
  Receipt,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Clock,
  Utensils,
  Check,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { cn, formatCurrency } from "@/lib/utils";
import { useTenantData, KdsOrder, TableItem } from "@/lib/stores/tenant-data-store";
import { ThermalPrintModal } from "@/components/orders/thermal-receipt-modal";
import { triggerDiningBillSettled } from "@/lib/realtime/history-events";

export interface SettleBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: KdsOrder | null;
  table?: TableItem | null;
  onSuccess?: () => void;
}

type PaymentMethod = "cash" | "upi" | "card" | "room_folio";

export function SettleBillModal({
  isOpen,
  onClose,
  order,
  table,
  onSuccess,
}: SettleBillModalProps) {
  const { addToast } = useToast();
  const { settleOrderBill, tenantName, tenantSlug, tenantId } = useTenantData();

  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("cash");
  const [cashTendered, setCashTendered] = React.useState<string>("");
  const [upiRef, setUpiRef] = React.useState<string>("");
  const [cardLast4, setCardLast4] = React.useState<string>("");
  const [cardAuthCode, setCardAuthCode] = React.useState<string>("");
  const [roomNumber, setRoomNumber] = React.useState<string>("");
  const [guestName, setGuestName] = React.useState<string>("");
  const [settlementNote, setSettlementNote] = React.useState<string>("");
  const [isSettling, setIsSettling] = React.useState<boolean>(false);
  const [isThermalOpen, setIsThermalOpen] = React.useState<boolean>(false);

  // Sync state whenever active order changes
  React.useEffect(() => {
    if (order) {
      setCashTendered(order.total ? String(order.total) : "");
      setUpiRef("");
      setCardLast4("");
      setCardAuthCode("");
      setRoomNumber(order.roomNumber || (order.table?.toLowerCase().includes("suite") ? order.table : ""));
      setGuestName(order.customerName || "");
      setSettlementNote("");
      // Default to room_folio if room service order, otherwise cash
      if (order.destination === "room_service" || order.billingMethod === "charge_to_room") {
        setPaymentMethod("room_folio");
      } else {
        setPaymentMethod("cash");
      }
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const totalAmount = order.total || 0;
  const tenderedNum = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, tenderedNum - totalAmount);
  const shortfall = Math.max(0, totalAmount - tenderedNum);

  // Quick Cash denomination suggestions (pure calculation, zero extra hooks)
  const quickCashList = [totalAmount];
  const denominationSteps = [100, 200, 500, 1000, 2000];
  for (const step of denominationSteps) {
    const nextRound = Math.ceil(totalAmount / step) * step;
    if (nextRound > totalAmount && !quickCashList.includes(nextRound)) {
      quickCashList.push(nextRound);
    }
  }
  const quickCashOptions = quickCashList.slice(0, 4);

  const handleSettle = async () => {
    if (isSettling) return;

    if (paymentMethod === "cash" && tenderedNum < totalAmount) {
      addToast(
        "error",
        "Insufficient Tender Amount",
        `Guest bill is ${formatCurrency(totalAmount)}. Tendered cash is ${formatCurrency(tenderedNum)} (${formatCurrency(shortfall)} short).`
      );
      return;
    }

    if (paymentMethod === "room_folio" && !roomNumber.trim()) {
      addToast("error", "Room Number Required", "Please specify the guest room/suite number to charge.");
      return;
    }

    setIsSettling(true);
    try {
      let methodLabel = "Cash";
      let detailNote = settlementNote.trim();

      if (paymentMethod === "cash") {
        methodLabel = "Cash";
        detailNote = `Paid in Cash. Received: ${formatCurrency(tenderedNum)}${changeDue > 0 ? `, Change Due: ${formatCurrency(changeDue)}` : ""}${detailNote ? ` • ${detailNote}` : ""}`;
      } else if (paymentMethod === "upi") {
        methodLabel = "UPI / QR";
        detailNote = `Paid via UPI${upiRef ? ` (Ref: ${upiRef})` : ""}${detailNote ? ` • ${detailNote}` : ""}`;
      } else if (paymentMethod === "card") {
        methodLabel = "Card (POS)";
        detailNote = `Paid via POS Card${cardLast4 ? ` (Card **${cardLast4})` : ""}${cardAuthCode ? ` (Auth: ${cardAuthCode})` : ""}${detailNote ? ` • ${detailNote}` : ""}`;
      } else if (paymentMethod === "room_folio") {
        methodLabel = "Room Folio";
        detailNote = `Charged to ${roomNumber}${guestName ? ` (${guestName})` : ""}${detailNote ? ` • ${detailNote}` : ""}`;
      }

      await settleOrderBill(order.id, methodLabel, paymentMethod === "cash" ? tenderedNum : totalAmount, detailNote);

      // Real-time history synchronization trigger
      triggerDiningBillSettled(
        {
          id: String(order.id).replace(/^#+/, ""),
          table: order.table,
          customerName: order.customerName || "Dine-in Customer",
          customerPhone: order.customerPhone || "",
          destination: order.destination || "dine_in",
          status: "paid",
          billingMethod: methodLabel,
          total: totalAmount,
          items: (order.items || []).map((it) => ({ name: it.name, qty: it.qty })),
          createdAt: order.createdAt || new Date().toISOString(),
          settledAt: new Date().toISOString(),
          roomNumber: roomNumber.trim() || order.roomNumber,
          notes: detailNote,
        },
        tenantId,
        tenantSlug
      );

      addToast(
        "success",
        "Bill Settled & Table Released! 🟢",
        `Order #${order.id.slice(-4).toUpperCase()} settled for ${formatCurrency(totalAmount)} via ${methodLabel}. ${order.table} is now Available.`
      );

      onSuccess?.();
      onClose();
    } catch (err: any) {
      addToast("error", "Settlement Failed", err?.message || "Could not settle bill. Please try again.");
    } finally {
      setIsSettling(false);
    }
  };

  const handleSendWhatsAppReceipt = () => {
    const phone = (order.customerPhone || "").replace(/\D/g, "");
    const cleanId = order.id.slice(-4).toUpperCase();
    const itemsList = (order.items || [])
      .map((it) => `• ${it.qty}x ${it.name}`)
      .join("\n");

    const message = encodeURIComponent(
      `🧾 *${tenantName || "DineFlow Restaurant"} Tax Invoice*\n` +
      `--------------------------------\n` +
      `Ticket: #${cleanId} | Table: ${order.table}\n` +
      `Customer: ${order.customerName || "Valued Guest"}\n\n` +
      `*Order Summary:*\n${itemsList}\n\n` +
      `*Total Amount Paid:* ${formatCurrency(totalAmount)}\n` +
      `*Payment Method:* ${paymentMethod.toUpperCase()}\n` +
      `*Status:* PAID & COMPLETED\n` +
      `--------------------------------\n` +
      `Thank you for dining with us! Have a wonderful day! 🙏`
    );

    const waUrl = phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;
    window.open(waUrl, "_blank");
    addToast("info", "WhatsApp Receipt Dispatched", "Opened WhatsApp invoice dispatch window.");
  };

  const thermalOrder = {
    id: order.id,
    locationName: order.table || (table ? table.name : "Table"),
    items: (order.items || []).map((it) => ({
      name: it.name,
      quantity: it.qty,
      price: totalAmount > 0 && order.items.length > 0 ? Math.round(totalAmount / order.items.length) : totalAmount,
    })),
    subtotal: totalAmount,
    tax: Math.round(totalAmount * 0.05),
    total: totalAmount,
    stationName: "CASHIER RECEPTION",
    createdAt: order.createdAt || new Date().toLocaleString(),
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settle Guest Bill & Release Table"
        description="Verify order items, collect payment at counter or table, and release dining occupancy."
        size="lg"
      >
        <div className="space-y-5">
          {/* Header Banner: Table, Ticket & Order details */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
                <Utensils className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {order.table || (table ? table.name : "Table")}
                  </h3>
                  <Badge variant="warning" size="sm" dot>
                    Food Served • Awaiting Payment
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Ticket #{order.id.slice(-6).toUpperCase()} • Guest:{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {order.customerName || "Dine-in Guest"}
                  </span>
                  {order.customerPhone && ` (${order.customerPhone})`}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Due
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          {/* Itemized Order Breakdown */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4">
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <Receipt className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Itemized Bill Summary ({order.items?.length || 0} items)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsThermalOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Tax Bill</span>
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  type="button"
                  onClick={handleSendWhatsAppReceipt}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>WhatsApp Bill</span>
                </button>
              </div>
            </div>

            <div className="max-h-40 overflow-y-auto divide-y divide-slate-200/60 dark:divide-slate-800/60 pr-1">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[11px]">
                        {item.qty}x
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white truncate">
                        {item.name}
                      </span>
                      {item.variant && (
                        <span className="text-[10px] text-slate-400">({item.variant})</span>
                      )}
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                      {/* Sub-item price or calculated distribution */}
                      {item.qty} serving
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-3 text-center text-xs text-slate-400 italic">
                  Standard Food & Beverage Service Ticket
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Taxes & Service GST (Included)
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: "cash", label: "Cash", icon: Banknote, desc: "Cash drawer" },
                { id: "upi", label: "UPI / QR", icon: QrCode, desc: "Dynamic QR" },
                { id: "card", label: "Card POS", icon: CreditCard, desc: "Terminal tap/swipe" },
                { id: "room_folio", label: "Room Folio", icon: Building, desc: "Hotel suite folio" },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer relative",
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500/30"
                        : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 mb-1.5", isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400")} />
                    <span className="text-xs font-bold">{m.label}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{m.desc}</span>
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional Method Inputs */}
          {paymentMethod === "cash" && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Cash Received / Tender Amount:
                </label>
                {/* Quick denomination pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {quickCashOptions.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashTendered(String(amt))}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer",
                        tenderedNum === amt
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                      )}
                    >
                      {amt === totalAmount ? `Exact (${formatCurrency(amt)})` : formatCurrency(amt)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  placeholder="Enter cash given by customer..."
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Real-time change / shortfall calculator */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">
                    Bill Total: <strong className="text-slate-900 dark:text-white">{formatCurrency(totalAmount)}</strong>
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">
                    Tendered: <strong className="text-slate-900 dark:text-white">{formatCurrency(tenderedNum)}</strong>
                  </span>
                </div>

                <div className="text-right">
                  {tenderedNum >= totalAmount ? (
                    <div>
                      <span className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block">
                        Change to Return
                      </span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(changeDue)}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[11px] font-bold uppercase text-rose-500 block">
                        Remaining Shortfall
                      </span>
                      <span className="text-lg font-black text-rose-500">
                        {formatCurrency(shortfall)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "upi" && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold shrink-0">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Dynamic UPI Payment
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Guest scans UPI QR code via PhonePe, Google Pay, Paytm, or BHIM.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  UPI UTR / Reference ID (Optional):
                </label>
                <input
                  type="text"
                  value={upiRef}
                  onChange={(e) => setUpiRef(e.target.value)}
                  placeholder="e.g. 429188201948 or UPI Transaction ID"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {paymentMethod === "card" && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Credit / Debit Card Terminal
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Card swiped or tapped on physical POS EDC card terminal.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Card Last 4 Digits (Optional):
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={cardLast4}
                    onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 4242"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Approval / Auth Code (Optional):
                  </label>
                  <input
                    type="text"
                    value={cardAuthCode}
                    onChange={(e) => setCardAuthCode(e.target.value)}
                    placeholder="e.g. AUTH-88219"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "room_folio" && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Post to Guest Room Folio
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Charge dining amount directly to hotel PMS room account for checkout billing.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Room / Suite Number: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. Suite 304"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Guest Name on Folio:
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Mr. Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Settlement Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Internal Reception Note (Optional):
            </label>
            <input
              type="text"
              value={settlementNote}
              onChange={(e) => setSettlementNote(e.target.value)}
              placeholder="e.g. Settle at front desk, customer requested bill split, discount voucher applied..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-xs"
                onClick={onClose}
                disabled={isSettling}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto text-xs flex items-center gap-1.5"
                onClick={() => setIsThermalOpen(true)}
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Thermal Bill</span>
              </Button>
            </div>

            <Button
              variant="glow"
              size="md"
              className="w-full sm:w-auto text-xs font-bold px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 flex items-center justify-center gap-2"
              onClick={handleSettle}
              disabled={isSettling || (paymentMethod === "cash" && tenderedNum < totalAmount)}
            >
              {isSettling ? (
                <span>Settling Bill...</span>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Confirm & Settle ({formatCurrency(totalAmount)})</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ESC/POS Thermal Receipt Preview Modal */}
      <ThermalPrintModal
        isOpen={isThermalOpen}
        onClose={() => setIsThermalOpen(false)}
        type="bill"
        restaurantName={tenantName}
        order={thermalOrder}
      />
    </>
  );
}
