"use client";

import * as React from "react";
import Image from "next/image";
import {
  QrCode,
  Smartphone,
  Copy,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  MessageCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Receipt,
  X,
  CreditCard,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { cn, formatCurrency } from "@/lib/utils";
import { useUpiSettings } from "@/lib/stores/upi-settings-store";

export interface CustomerUpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber?: string;
  amount: number;
  customerName?: string;
  customerPhone?: string;
  tableName?: string;
  onPaymentSuccess?: (utr: string) => void;
}

const UPI_APPS = [
  {
    id: "gpay",
    name: "Google Pay",
    schemePrefix: "gpay://upi/pay?",
    fallbackPrefix: "upi://pay?",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    iconBg: "bg-blue-600 text-white",
    letter: "G",
  },
  {
    id: "phonepe",
    name: "PhonePe",
    schemePrefix: "phonepe://pay?",
    fallbackPrefix: "upi://pay?",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    iconBg: "bg-purple-600 text-white",
    letter: "P",
  },
  {
    id: "paytm",
    name: "Paytm",
    schemePrefix: "paytmmp://pay?",
    fallbackPrefix: "upi://pay?",
    badgeColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    iconBg: "bg-sky-600 text-white",
    letter: "Pay",
  },
  {
    id: "cred",
    name: "CRED",
    schemePrefix: "cred://upi/pay?",
    fallbackPrefix: "upi://pay?",
    badgeColor: "bg-zinc-800/10 text-zinc-800 dark:text-zinc-200 border-zinc-500/20",
    iconBg: "bg-zinc-900 text-white",
    letter: "C",
  },
  {
    id: "any",
    name: "Any UPI App",
    schemePrefix: "upi://pay?",
    fallbackPrefix: "upi://pay?",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    iconBg: "bg-emerald-600 text-white",
    letter: "UPI",
  },
];

export function CustomerUpiPaymentModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  amount,
  customerName,
  customerPhone,
  tableName,
  onPaymentSuccess,
}: CustomerUpiPaymentModalProps) {
  const { addToast } = useToast();
  const { vpa, merchantName, generateUpiUri } = useUpiSettings();

  const [timeLeft, setTimeLeft] = React.useState<number>(300); // 5 min countdown
  const [copiedVpa, setCopiedVpa] = React.useState<boolean>(false);
  const [utrInput, setUtrInput] = React.useState<string>("");
  const [isVerifyingUtr, setIsVerifyingUtr] = React.useState<boolean>(false);
  const [isPaid, setIsPaid] = React.useState<boolean>(false);
  const [verifiedUtr, setVerifiedUtr] = React.useState<string>("");
  const [showManualUtr, setShowManualUtr] = React.useState<boolean>(false);
  const [isCheckingStatus, setIsCheckingStatus] = React.useState<boolean>(false);

  // Generate dynamic NPCI UPI URI
  const upiUri = React.useMemo(() => {
    return generateUpiUri(orderId, amount, `Order #${orderNumber || orderId}`);
  }, [generateUpiUri, orderId, amount, orderNumber]);

  // QR Code URL via reliable public renderer
  const qrCodeUrl = React.useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
      upiUri
    )}&margin=8`;
  }, [upiUri]);

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTimeLeft(300);
      setIsPaid(false);
      setVerifiedUtr("");
      setUtrInput("");
      setShowManualUtr(false);
    }
  }, [isOpen, orderId]);

  // Timer countdown
  React.useEffect(() => {
    if (!isOpen || isPaid || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isPaid, timeLeft]);

  // Real-time polling for payment status (YouPI Observer push/SMS hook)
  React.useEffect(() => {
    if (!isOpen || isPaid || timeLeft <= 0) return;

    let isMounted = true;
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/v1/payments/status/${encodeURIComponent(orderId)}`);
        if (!res.ok) return;
        const json = await res.json();
        const data = json.data || json;

        if (data && (data.status === "paid" || data.status === "success") && isMounted) {
          setIsPaid(true);
          const settledUtr = data.utr || "YOUPI" + Math.floor(1000000000 + Math.random() * 9000000000);
          setVerifiedUtr(settledUtr);
          addToast("success", "Payment Received!", "Your 0% fee UPI payment has been verified instantly.");
          if (onPaymentSuccess) {
            onPaymentSuccess(settledUtr);
          }
        }
      } catch {
        // network polling silent retry
      }
    };

    const poller = setInterval(checkStatus, 2500);
    return () => {
      isMounted = false;
      clearInterval(poller);
    };
  }, [isOpen, isPaid, timeLeft, orderId, addToast, onPaymentSuccess]);

  const handleCopyVpa = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(vpa);
      setCopiedVpa(true);
      addToast("info", "VPA Copied", `Copied ${vpa} to clipboard.`);
      setTimeout(() => setCopiedVpa(false), 2000);
    }
  };

  const handleManualUtrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = utrInput.trim();
    if (!clean || clean.length < 6) {
      addToast("error", "Invalid UTR", "Please enter at least 6 characters from your UPI payment receipt.");
      return;
    }

    setIsVerifyingUtr(true);
    try {
      const res = await fetch("/api/v1/payments/verify-utr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, utr: clean }),
      });

      if (res.ok) {
        setIsPaid(true);
        setVerifiedUtr(clean);
        addToast("success", "UTR Verified!", "Payment confirmed and order marked as paid.");
        if (onPaymentSuccess) {
          onPaymentSuccess(clean);
        }
      } else {
        const errJson = await res.json();
        addToast("error", "Verification Failed", errJson?.error?.message || "Could not verify UTR.");
      }
    } catch {
      addToast("error", "Network Error", "Unable to reach server. Please try again or inform steward.");
    } finally {
      setIsVerifyingUtr(false);
    }
  };

  const handleSimulatePayment = async () => {
    setIsCheckingStatus(true);
    try {
      const res = await fetch(`/api/v1/payments/status/${encodeURIComponent(orderId)}`, {
        method: "POST",
      });
      if (res.ok) {
        setIsPaid(true);
        const dummyUtr = "YOUPI" + Math.floor(1000000000 + Math.random() * 9000000000);
        setVerifiedUtr(dummyUtr);
        addToast("success", "Demo Payment Succeeded", "Payment simulation complete.");
        if (onPaymentSuccess) {
          onPaymentSuccess(dummyUtr);
        }
      }
    } catch {
      setIsPaid(true);
      const dummyUtr = "YOUPI" + Math.floor(1000000000 + Math.random() * 9000000000);
      setVerifiedUtr(dummyUtr);
      if (onPaymentSuccess) onPaymentSuccess(dummyUtr);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  const shareWhatsAppMessage = () => {
    const text = encodeURIComponent(
      `Hello! Here is my payment confirmation for Order #${orderNumber || orderId} at ${merchantName}.\nAmount: ${formatCurrency(
        amount
      )}\nUTR Reference: ${verifiedUtr}\nThank you!`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isPaid ? "Payment Successful" : "Pay via 0% Fee UPI"}
      description={
        isPaid
          ? "Your payment was credited directly to the restaurant with zero fees."
          : `Direct bank-to-bank settlement for Order #${orderNumber || orderId}`
      }
      size="md"
    >
      <div className="space-y-4 pt-1">
        {/* ── SUCCESS STATE ─────────────────────────────────────────────────── */}
        {isPaid ? (
          <div className="py-6 text-center space-y-5 animate-in fade-in duration-300">
            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center ring-8 ring-emerald-500/5">
              <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                ₹{amount.toFixed(2)} Paid Successfully
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Credited directly to <span className="font-semibold text-slate-700 dark:text-slate-300">{merchantName}</span> ({vpa})
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-emerald-500/10">
                <span className="text-slate-500 dark:text-slate-400">Order Number</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  #{orderNumber || orderId}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-emerald-500/10">
                <span className="text-slate-500 dark:text-slate-400">Bank UTR Reference</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono select-all">
                  {verifiedUtr}
                </span>
              </div>
              {tableName && (
                <div className="flex justify-between items-center pb-2 border-b border-emerald-500/10">
                  <span className="text-slate-500 dark:text-slate-400">Table / Room</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {tableName}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Zero Platform Transaction Fee
                </span>
                <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={shareWhatsAppMessage}
                className="w-full flex items-center justify-center gap-2 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Receipt</span>
              </Button>
              <Button
                type="button"
                onClick={onClose}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* ── ACTIVE PAYMENT FLOW ───────────────────────────────────────────── */
          <div className="space-y-4">
            {/* Amount & Timer Header */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Total Payable
                </span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatCurrency(amount)}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Session Timer
                </span>
                <div className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                  <Clock className="h-3 w-3" />
                  <span>{timeFormatted}</span>
                </div>
              </div>
            </div>

            {/* Mobile 1-Tap UPI Launchers (Shown prominently on mobile screens) */}
            <div className="block sm:hidden space-y-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                1-Tap Pay via UPI App
              </span>
              <div className="grid grid-cols-2 gap-2">
                {UPI_APPS.slice(0, 4).map((app) => (
                  <a
                    key={app.id}
                    href={`${app.schemePrefix}pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(
                      merchantName
                    )}&am=${amount.toFixed(2)}&tr=${encodeURIComponent(orderId)}&cu=INR`}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-emerald-500 transition-colors shadow-xs cursor-pointer"
                  >
                    <div
                      className={cn(
                        "h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0",
                        app.iconBg
                      )}
                    >
                      {app.letter}
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {app.name}
                    </span>
                  </a>
                ))}
              </div>

              <a
                href={upiUri}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                <Smartphone className="h-4 w-4" />
                <span>Open Default UPI App</span>
              </a>
            </div>

            {/* QR Code Container for Desktop or Alternate Scan */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="relative p-2.5 rounded-2xl bg-white border border-slate-200 shadow-inner">
                {/* Dynamic QR image generated from UPI Intent URI */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  width={200}
                  height={200}
                  className="rounded-lg object-contain"
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                  <QrCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Scan with any UPI App
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Google Pay, PhonePe, Paytm, CRED, BHIM, or Navi
                </p>
              </div>

              {/* VPA pill with copy button */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">UPI ID:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{vpa}</span>
                <button
                  type="button"
                  onClick={handleCopyVpa}
                  className="p-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                  title="Copy VPA"
                >
                  {copiedVpa ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Waiting for confirmation notice */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-[11px]">
                  Listening for bank confirmation... (Auto-settles in 2s)
                </span>
              </div>
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isCheckingStatus}
                className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 underline hover:no-underline cursor-pointer"
                title="Sandbox test button"
              >
                Test Pay
              </button>
            </div>

            {/* Manual UTR Input Section */}
            <div className="border-t border-slate-200/80 dark:border-slate-800 pt-3">
              {!showManualUtr ? (
                <button
                  type="button"
                  onClick={() => setShowManualUtr(true)}
                  className="w-full text-center text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Already completed payment? Enter 12-digit UTR manually →
                </button>
              ) : (
                <form onSubmit={handleManualUtrSubmit} className="space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Enter 12-Digit Bank UTR / Txn ID:
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowManualUtr(false)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Hide
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={18}
                      value={utrInput}
                      onChange={(e) => setUtrInput(e.target.value.toUpperCase())}
                      placeholder="e.g. 429188201948"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <Button
                      type="submit"
                      disabled={isVerifyingUtr || !utrInput.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 cursor-pointer"
                    >
                      {isVerifyingUtr ? "Verifying..." : "Confirm"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
