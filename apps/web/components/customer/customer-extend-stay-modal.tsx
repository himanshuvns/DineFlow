"use client";

import * as React from "react";
import {
  CalendarDays,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Building,
  User,
  HeartHandshake,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface CustomerExtendStayModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantSlug: string;
  roomNumber: string;
  roomDisplay: string;
  currentGuestName?: string;
  currentCheckIn?: string;
  currentCheckOut?: string;
  onStayExtended?: (newCheckOut: string, additionalNights: number) => void;
}

export function CustomerExtendStayModal({
  isOpen,
  onClose,
  tenantSlug,
  roomNumber,
  roomDisplay,
  currentGuestName,
  currentCheckIn,
  currentCheckOut,
  onStayExtended,
}: CustomerExtendStayModalProps) {
  const { addToast } = useToast();
  const [submitting, setSubmitting] = React.useState(false);
  const [notes, setNotes] = React.useState("");

  // Parse baseline current checkout date
  const baseCheckoutDate = React.useMemo(() => {
    if (currentCheckOut) {
      const d = new Date(currentCheckOut);
      if (!isNaN(d.getTime())) return d;
    }
    // Default fallback: tomorrow 11:00 AM UTC
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);
    return tomorrow;
  }, [currentCheckOut]);

  // Earliest date customer can extend to: strictly currentCheckOut + 1 day
  const minExtensionDate = React.useMemo(() => {
    const d = new Date(baseCheckoutDate);
    d.setDate(d.getDate() + 1);
    return d;
  }, [baseCheckoutDate]);

  const minDateString = React.useMemo(() => {
    const y = minExtensionDate.getFullYear();
    const m = String(minExtensionDate.getMonth() + 1).padStart(2, "0");
    const d = String(minExtensionDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [minExtensionDate]);

  // Selected new checkout date (defaults to +1 night from current checkout)
  const [selectedDateStr, setSelectedDateStr] = React.useState<string>(minDateString);

  // Re-sync default date whenever baseline checkout changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedDateStr(minDateString);
      setNotes("");
    }
  }, [isOpen, minDateString]);

  // Calculate selected date object and nights added
  const selectedDate = React.useMemo(() => {
    if (!selectedDateStr) return minExtensionDate;
    const [y, m, d] = selectedDateStr.split("-").map(Number);
    if (!y || !m || !d) return minExtensionDate;
    return new Date(y, m - 1, d, 11, 0, 0);
  }, [selectedDateStr, minExtensionDate]);

  const additionalNights = React.useMemo(() => {
    const msDiff = selectedDate.getTime() - baseCheckoutDate.getTime();
    const nights = Math.round(msDiff / (1000 * 60 * 60 * 24));
    return Math.max(1, nights);
  }, [selectedDate, baseCheckoutDate]);

  const isExtensionValid = React.useMemo(() => {
    return selectedDate.getTime() > baseCheckoutDate.getTime();
  }, [selectedDate, baseCheckoutDate]);

  // Quick preset pills (+1, +2, +3, +5, +7 nights)
  const applyPresetNights = (nights: number) => {
    const target = new Date(baseCheckoutDate);
    target.setDate(target.getDate() + nights);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, "0");
    const d = String(target.getDate()).padStart(2, "0");
    setSelectedDateStr(`${y}-${m}-${d}`);
  };

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isExtensionValid) {
      addToast(
        "error",
        "Invalid Check-Out Date",
        "Your new check-out date must be later than your current check-out date. Stays cannot be shortened."
      );
      return;
    }

    try {
      setSubmitting(true);
      const cleanNum = roomNumber.toUpperCase().replace(/^(ROOM-|SUITE-)/, "");

      // Format ISO 8601 checkout time (11:00 AM)
      const isoCheckout = selectedDate.toISOString();

      const res = await fetch("/api/room/extend-stay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          tenantSlug,
          roomNumber: cleanNum,
          newCheckOut: isoCheckout,
          notes: notes.trim(),
          additionalNights,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to extend stay. Please contact front desk.");
      }

      addToast(
        "success",
        "Stay Extended Successfully!",
        `Your reservation in ${roomDisplay} has been extended by +${additionalNights} night(s) until ${formatDateDisplay(selectedDate)} at 11:00 AM.`
      );

      if (onStayExtended) {
        onStayExtended(isoCheckout, additionalNights);
      }

      onClose();
    } catch (err: any) {
      console.error("[CustomerExtendStayModal] submit error:", err);
      addToast(
        "error",
        "Stay Extension Request Failed",
        err.message || "An error occurred while extending your stay. Please speak with the Front Desk."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Extend Your Stay"
      description={`Conveniently prolong your luxury experience in ${roomDisplay}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Guest & Current Stay Snapshot */}
        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary" />
              Registered Guest
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {currentGuestName || "Valued In-House Guest"}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
            <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              Current Check-out
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {formatDateDisplay(baseCheckoutDate)} • 11:00 AM
            </span>
          </div>
        </div>

        {/* Quick Night Add Pills */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Quick Extension Presets
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {[1, 2, 3, 5, 7].map((n) => {
              const isSelected = additionalNights === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => applyPresetNights(n)}
                  className={cn(
                    "py-2 px-1 text-xs font-bold rounded-xl border transition-all text-center flex flex-col items-center justify-center gap-0.5",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <span className="text-sm leading-none font-extrabold">+{n}</span>
                  <span className="text-[10px] font-medium opacity-80">{n === 1 ? "Night" : "Nights"}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Picker Input */}
        <div>
          <label
            htmlFor="newCheckoutDate"
            className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
          >
            Or Select Exact New Check-Out Date
          </label>
          <div className="relative">
            <input
              id="newCheckoutDate"
              type="date"
              min={minDateString}
              value={selectedDateStr}
              onChange={(e) => setSelectedDateStr(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
              required
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Standard check-out is at 11:00 AM UTC. Earliest selectable extension is tomorrow.
          </p>
        </div>

        {/* Extension Summary Card */}
        <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  New Check-out: {formatDateDisplay(selectedDate)}
                </span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                +{additionalNights} extra {additionalNights === 1 ? "night" : "nights"} added to your stay
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-600 text-white font-bold shrink-0 text-[11px] px-2 py-0.5">
            11:00 AM Check-out
          </Badge>
        </div>

        {/* Special Notes / Requests */}
        <div>
          <label
            htmlFor="extensionNotes"
            className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
          >
            Special Instructions or Notes (Optional)
          </label>
          <textarea
            id="extensionNotes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Please keep existing digital keycards active; need quiet room for business calls."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none shadow-sm"
          />
        </div>

        {/* Policy Notice: Strict Can Only Increase */}
        <div className="flex items-start gap-2.5 p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-[11px] leading-relaxed">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            <strong>Policy Notice:</strong> Stay durations can only be extended from the guest portal. To arrange an early departure, kindly consult the Front Desk directly.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl font-semibold text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || !isExtensionValid}
            className="rounded-xl font-bold text-xs gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirming Extension...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Confirm +{additionalNights} {additionalNights === 1 ? "Night" : "Nights"} Extension
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
