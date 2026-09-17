"use client";

import * as React from "react";
import { Radio, X, AlertTriangle, Info, Bell } from "lucide-react";
import { usePlatformStore } from "@/lib/stores/platform-store";

export function BroadcastBanner() {
  const globalAnnouncement = usePlatformStore((s) => s.globalAnnouncement);
  const [dismissed, setDismissed] = React.useState(false);

  if (!globalAnnouncement?.active || dismissed || !globalAnnouncement.message) {
    return null;
  }

  const isCritical = globalAnnouncement.type === "critical";
  const isWarning = globalAnnouncement.type === "warning";

  return (
    <div
      role="alert"
      className={`relative z-30 flex items-center justify-between px-4 py-2.5 text-xs font-medium border-b transition-all ${
        isCritical
          ? "bg-rose-500 text-white border-rose-600 shadow-sm"
          : isWarning
          ? "bg-amber-500 text-neutral-950 border-amber-600 shadow-sm"
          : "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-800 dark:border-neutral-200 shadow-sm"
      }`}
    >
      <div className="flex items-center gap-2.5 mx-auto max-w-7xl w-full">
        <Radio className="h-3.5 w-3.5 shrink-0 animate-pulse" />
        <span className="truncate">{globalAnnouncement.message}</span>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="ml-2 rounded p-1 hover:bg-black/10 dark:hover:bg-white/10 shrink-0 cursor-pointer"
        aria-label="Dismiss banner"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
