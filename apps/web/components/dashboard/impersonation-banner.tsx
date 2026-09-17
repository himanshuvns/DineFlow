"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, LogOut, ExternalLink } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";

export function ImpersonationBanner() {
  const router = useRouter();
  const { isImpersonating, tenant, stopImpersonation, originalUser } = useAuthStore();

  if (!isImpersonating) return null;

  const handleExit = () => {
    stopImpersonation();
    router.push("/platform/clients");
  };

  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-4 py-2 text-xs font-semibold shrink-0 z-50 flex flex-wrap items-center justify-between gap-2 shadow-md border-b border-amber-400/50 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 min-w-0">
        <div className="h-5 w-5 rounded-md bg-slate-950/10 flex items-center justify-center shrink-0">
          <ShieldAlert className="h-3.5 w-3.5 text-slate-950" />
        </div>
        <div className="truncate">
          <span className="font-extrabold uppercase tracking-wide">Platform Impersonation Mode:</span>{" "}
          <span className="underline decoration-slate-950/40 underline-offset-2">
            {tenant?.name || "Client Workspace"}
          </span>
          {originalUser?.email && (
            <span className="hidden sm:inline opacity-85 ml-2 font-mono text-[11px]">
              (Logged by {originalUser.email})
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => router.push("/platform/clients")}
          className="px-2.5 py-1 rounded-lg bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
        >
          <ExternalLink className="h-3 w-3" />
          <span className="hidden sm:inline">Platform Console</span>
        </button>

        <button
          type="button"
          onClick={handleExit}
          className="px-3 py-1 rounded-lg bg-slate-950 text-amber-300 hover:bg-slate-900 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Exit Impersonation</span>
        </button>
      </div>
    </div>
  );
}
