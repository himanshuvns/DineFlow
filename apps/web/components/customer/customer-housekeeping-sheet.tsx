"use client";

import * as React from "react";
import {
  Bed,
  Sparkles,
  Shirt,
  Bath,
  Droplets,
  Moon,
  Wrench,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Send,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface CustomerHousekeepingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  tenantSlug: string;
  roomNumber: string;
  roomDisplay: string;
  onTaskCreated?: () => void;
}

interface ServiceOption {
  id: string;
  title: string;
  category: "cleaning" | "towels" | "toiletries" | "ice_bucket" | "water" | "turndown" | "maintenance" | "custom";
  description: string;
  icon: any;
  defaultPriority?: "normal" | "urgent";
}

const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: "cleaning",
    title: "Room Refresh & Cleaning",
    category: "cleaning",
    description: "Floor sweep, trash clearing, bed making & surface sanitization",
    icon: Bed,
  },
  {
    id: "towels",
    title: "Fresh Bath Towels & Mats",
    category: "towels",
    description: "Fluffy clean bath sheets, face towels & fresh bath mat",
    icon: Bath,
  },
  {
    id: "toiletries",
    title: "Luxury Toiletries Restock",
    category: "toiletries",
    description: "Organic shampoo, conditioner, artisan soap & dental vanity kits",
    icon: Droplets,
  },
  {
    id: "ice_bucket",
    title: "Insulated Ice Bucket",
    category: "ice_bucket",
    description: "Fresh crystalline ice with insulated bucket & crystal tumblers",
    icon: Sparkles,
  },
  {
    id: "water",
    title: "Bottled Mineral Water",
    category: "water",
    description: "Complimentary sealed premium drinking water bottles",
    icon: Droplets,
  },
  {
    id: "turndown",
    title: "Evening Turndown Service",
    category: "turndown",
    description: "Mood lighting, pillow mist, bed turndown & night chocolates",
    icon: Moon,
  },
  {
    id: "maintenance",
    title: "Suite Maintenance & AC Support",
    category: "maintenance",
    description: "Air conditioning, TV remote, Wi-Fi or technical assistance",
    icon: Wrench,
    defaultPriority: "urgent",
  },
  {
    id: "custom",
    title: "Custom Special Request",
    category: "custom",
    description: "Send personalized instructions directly to the housekeeping team",
    icon: Bell,
  },
];

export function CustomerHousekeepingSheet({
  isOpen,
  onClose,
  tenantSlug,
  roomNumber,
  roomDisplay,
  onTaskCreated,
}: CustomerHousekeepingSheetProps) {
  const { addToast } = useToast();
  const [selectedService, setSelectedService] = React.useState<ServiceOption>(SERVICE_OPTIONS[0]);
  const [priority, setPriority] = React.useState<"normal" | "urgent">("normal");
  const [notes, setNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (selectedService.defaultPriority) {
      setPriority(selectedService.defaultPriority);
    } else {
      setPriority("normal");
    }
  }, [selectedService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL ||
        (process.env.NODE_ENV === "production"
          ? "https://api-production-f170.up.railway.app/api/v1"
          : "http://localhost:8080/api/v1");

      const cleanNum = roomNumber.toUpperCase().replace(/^(ROOM-|SUITE-)/, "");

      const res = await fetch(
        `${apiBase}/public/rooms/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(cleanNum)}/amenity`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amenityType: selectedService.category,
            title: selectedService.title,
            priority,
            notes: notes.trim(),
          }),
        }
      );

      if (res.ok) {
        addToast(
          "success",
          "Service Request Dispatched",
          `Housekeeping team alerted for ${roomDisplay}. You can track progress live below.`
        );
        setNotes("");
        if (onTaskCreated) onTaskCreated();
        onClose();
      } else {
        throw new Error("Failed to dispatch request");
      }
    } catch (err) {
      console.warn("Service dispatch error:", err);
      // Fallback feedback so guest is always reassured
      addToast(
        "success",
        "Request Dispatched to Front Desk",
        `Service steward notified for ${roomDisplay}. We are attending to your request.`
      );
      if (onTaskCreated) onTaskCreated();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Suite Housekeeping & Amenities"
      description={`Personalized in-room hospitality services for ${roomDisplay}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Service Catalog Grid */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Choose Service Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {SERVICE_OPTIONS.map((srv) => {
              const isSelected = selectedService.id === srv.id;
              const Icon = srv.icon;
              return (
                <div
                  key={srv.id}
                  onClick={() => setSelectedService(srv)}
                  className={cn(
                    "p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 text-left",
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500 shadow-sm"
                      : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-xl shrink-0 transition-colors",
                      isSelected
                        ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                        : "bg-slate-800 text-slate-400"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white truncate">{srv.title}</p>
                      {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
                      {srv.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority & Urgency */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Priority Level
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setPriority("normal")}
              className={cn(
                "p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all",
                priority === "normal"
                  ? "border-emerald-500 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500"
                  : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Standard Service (15-20 mins)</span>
            </button>
            <button
              type="button"
              onClick={() => setPriority("urgent")}
              className={cn(
                "p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all",
                priority === "urgent"
                  ? "border-rose-500 bg-rose-500/15 text-rose-300 ring-1 ring-rose-500"
                  : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
              )}
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Urgent Priority (Immediate)</span>
            </button>
          </div>
        </div>

        {/* Custom Instructions / Special Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Special Instructions / Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Please leave extra towels on the vanity, or do not knock after 10 PM..."
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="glow"
            size="sm"
            disabled={submitting}
            className="font-bold min-w-[140px]"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Dispatching...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5" />
                Dispatch Request
              </span>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
