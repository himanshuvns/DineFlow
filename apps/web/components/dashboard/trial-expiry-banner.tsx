"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, AlertTriangle, ArrowRight, X, Sparkles, Mail } from "lucide-react";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";

interface BillingStatusResponse {
  plan: string;
  planName: string;
  cycle: string;
  status: string;
  isTrial: boolean;
  daysRemaining: number;
  renewalDate: string;
}

export function TrialExpiryBanner() {
  const [billing, setBilling] = React.useState<BillingStatusResponse | null>(null);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    apiClient
      .get<{ data: BillingStatusResponse }>("/billing/status")
      .then((res) => {
        if (!mounted) return;
        const data = (res as any)?.data || res;
        if (data && typeof data.isTrial === "boolean") {
          setBilling(data);
        }
      })
      .catch(() => {
        // Silently skip if tenant context is loading or unauthenticated
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (dismissed || !billing || !billing.isTrial) {
    return null;
  }

  // Only show when 7 days or fewer remaining, or already expired
  const days = billing.daysRemaining ?? 14;
  if (days > 7) {
    return null;
  }

  const isExpired = days <= 0;
  const isUrgent = days <= 2 && !isExpired;

  return (
    <div
      role="alert"
      className={cn(
        "relative z-20 flex items-center justify-between px-3.5 py-2 sm:px-6 text-xs font-medium border-b transition-all duration-200",
        isExpired
          ? "bg-rose-500/10 dark:bg-rose-950/40 border-rose-500/30 text-rose-950 dark:text-rose-200"
          : isUrgent
          ? "bg-orange-500/10 dark:bg-orange-950/40 border-orange-500/30 text-orange-950 dark:text-orange-200"
          : "bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/30 text-amber-950 dark:text-amber-200"
      )}
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mx-auto max-w-7xl w-full">
        {isExpired ? (
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
        ) : (
          <Clock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        )}

        <div className="flex-1 min-w-0 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="font-bold">
            {isExpired
              ? "Trial Expired:"
              : isUrgent
              ? `Urgent: ${days} ${days === 1 ? "day" : "days"} left in free trial!`
              : `14-Day Starter Trial: ${days} days remaining.`}
          </span>
          <span className="hidden md:inline text-slate-700 dark:text-slate-300">
            {isExpired
              ? "Your restaurant data is safe under 14-day grace period. Reactivate to restore live QR menus and kitchen displays."
              : "Upgrade today to avoid disruption to kitchen orders, staff logins, and digital menus."}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/dashboard/settings?tab=billing"
            className={cn(
              "inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all shadow-2xs cursor-pointer",
              isExpired
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-slate-950"
            )}
          >
            <span>{isExpired ? "Reactivate Workspace" : "Renew / Upgrade Plan"}</span>
            <ArrowRight className="h-3 w-3" />
          </Link>

          {!isExpired && (
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
              aria-label="Dismiss banner for this session"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
