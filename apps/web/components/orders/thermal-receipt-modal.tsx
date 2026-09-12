"use client";

import * as React from "react";
import { Printer, X, Download, Copy, Check, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

import { useAuthStore } from "@/lib/stores/auth-store";

export interface ThermalPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "kot" | "bill";
  restaurantName?: string;
  order: {
    id: string;
    locationName: string; // e.g. "Table 14" or "Suite 302"
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      notes?: string;
    }>;
    subtotal: number;
    tax: number;
    roomServiceFee?: number;
    total: number;
    specialInstructions?: string;
    stationName?: string;
    createdAt?: string;
  };
}

export function ThermalPrintModal({
  isOpen,
  onClose,
  type,
  restaurantName,
  order,
}: ThermalPrintModalProps) {
  const { tenant } = useAuthStore();
  const displayName = restaurantName || tenant?.name || "RESTAURANT";
  const { addToast } = useToast();
  const [copied, setCopied] = React.useState(false);
  const [paperWidth, setPaperWidth] = React.useState<"80mm" | "58mm">("80mm");

  const timestamp = order.createdAt || "12 Sep 2026 14:32:05";
  const station = order.stationName || (order.locationName.includes("Suite") ? "IN-ROOM DINING" : "MAIN KITCHEN");

  const handlePrint = () => {
    window.print();
    addToast("success", "Thermal Print Dispatched", `Sent ${type.toUpperCase()} ticket to local thermal printer.`);
  };

  const handleCopyText = () => {
    const rawText = document.getElementById("thermal-receipt-text")?.innerText || "";
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast("info", "Copied to Clipboard", "Thermal ASCII payload copied for POS serial terminal.");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === "kot" ? "Kitchen Order Ticket (KOT)" : "Guest Tax Receipt (ESC/POS)"}
      description={`Thermal format preview for 80mm & 58mm thermal receipt printers.`}
      size="md"
    >
      <div className="space-y-4">
        {/* Width Switcher */}
        <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium px-2">Thermal Paper Roll:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPaperWidth("80mm")}
              className={`px-3 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                paperWidth === "80mm"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              80mm Standard
            </button>
            <button
              onClick={() => setPaperWidth("58mm")}
              className={`px-3 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                paperWidth === "58mm"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              58mm Compact
            </button>
          </div>
        </div>

        {/* Paper Thermal Receipt Container */}
        <div className="flex justify-center p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 max-h-[420px] overflow-y-auto">
          <div
            id="thermal-receipt-text"
            className={`bg-[#fdfbf7] text-slate-950 font-mono text-[11px] leading-tight p-4 shadow-xl border-t-4 border-slate-400 selection:bg-slate-300 transition-all ${
              paperWidth === "80mm" ? "w-[340px]" : "w-[260px]"
            }`}
            style={{
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
            }}
          >
            {type === "kot" ? (
              // ── KOT TICKET FORMAT ──────────────────────────────
              <div className="space-y-2">
                <div className="text-center font-bold text-xs tracking-wider border-b-2 border-dashed border-slate-800 pb-1.5">
                  *** KITCHEN ORDER TICKET ***
                </div>
                <div className="text-center font-extrabold text-sm py-0.5 uppercase">
                  {station}
                </div>
                <div className="border-b border-dashed border-slate-800 pb-2 space-y-0.5 text-[10px]">
                  <div className="flex justify-between font-bold text-xs">
                    <span>LOCATION:</span>
                    <span className="text-sm">{order.locationName.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ORDER #:</span>
                    <span>{order.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TIME:</span>
                    <span>{timestamp}</span>
                  </div>
                </div>

                <div className="py-1 space-y-1.5">
                  <div className="flex justify-between font-bold border-b border-slate-400 pb-1 text-[10px]">
                    <span>QTY  ITEM</span>
                    <span>TYPE</span>
                  </div>
                  {order.items.map((it, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between font-bold text-xs">
                        <span>{it.quantity}x {it.name}</span>
                      </div>
                      {it.notes && (
                        <div className="text-[10px] text-slate-700 pl-4 italic">
                          &gt;&gt; Note: {it.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {order.specialInstructions && (
                  <div className="border-t border-dashed border-slate-800 pt-2 text-[10px]">
                    <div className="font-bold">INSTRUCTIONS:</div>
                    <div>{order.specialInstructions}</div>
                  </div>
                )}

                <div className="border-t-2 border-dashed border-slate-800 pt-2 text-center text-[10px] text-slate-600">
                  [ END OF KOT TICKET ]
                </div>
              </div>
            ) : (
              // ── GUEST TAX BILL FORMAT ──────────────────────────
              <div className="space-y-2">
                <div className="text-center space-y-0.5">
                  <div className="font-extrabold text-sm uppercase">{displayName}</div>
                  <div className="text-[10px] text-slate-600">DineFlow Verified Restaurant</div>
                  <div className="text-[10px] text-slate-600">GSTIN: 27AABCU9603R1ZM</div>
                  <div className="border-b-2 border-dashed border-slate-800 pt-1" />
                </div>

                <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-800 pb-1.5">
                  <div className="flex justify-between">
                    <span>BILL NO:</span>
                    <span className="font-bold">{order.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>LOCATION:</span>
                    <span className="font-bold">{order.locationName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DATE:</span>
                    <span>{timestamp}</span>
                  </div>
                </div>

                <div className="py-1 space-y-1">
                  <div className="flex justify-between font-bold border-b border-slate-400 pb-1 text-[10px]">
                    <span>ITEM</span>
                    <span>QTY</span>
                    <span>AMOUNT</span>
                  </div>
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span className="truncate max-w-[140px]">{it.name}</span>
                      <span>{it.quantity}</span>
                      <span>₹{(it.price * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-slate-800 pt-1.5 space-y-0.5 text-[10px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CGST (2.5%):</span>
                    <span>₹{(order.tax / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST (2.5%):</span>
                    <span>₹{(order.tax / 2).toFixed(2)}</span>
                  </div>
                  {order.roomServiceFee ? (
                    <div className="flex justify-between font-medium">
                      <span>Room Delivery Fee:</span>
                      <span>₹{order.roomServiceFee.toFixed(2)}</span>
                    </div>
                  ) : null}
                  <div className="border-t-2 border-slate-800 pt-1 flex justify-between font-extrabold text-xs">
                    <span>GRAND TOTAL:</span>
                    <span>₹{order.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-800 pt-2 text-center text-[10px] text-slate-600 space-y-1">
                  <div>Thank you for dining with us!</div>
                  <div>Scan table QR to reorder or pay via UPI</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyText}
            leftIcon={copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          >
            {copied ? "Copied" : "Copy ASCII"}
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="glow"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="h-3.5 w-3.5" />}
            >
              Print to ESC/POS
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
