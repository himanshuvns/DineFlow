"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useToast } from "@/components/ui/toast";

export function AccessDenied({
  title = "Platform Access Restricted",
  description = "The Platform Super Admin Console is strictly segregated for DineFlow platform operators, finance administrators, and system architects. Your current user role does not possess platform credentials.",
}: {
  title?: string;
  description?: string;
}) {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const { addToast } = useToast();

  const handleElevateForDemo = () => {
    updateUser({ role: "super_admin" });
    addToast("success", "Role Elevated", "Temporarily elevated to Platform Super Admin for verification.");
    router.refresh();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full bg-[#0B0F19]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-inner">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            <Lock className="h-3.5 w-3.5" /> 403 Forbidden • Multi-Tenant Isolation
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{title}</h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            {description}
          </p>
        </div>

        {user && (
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-left text-xs space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Authenticated User:</span>
              <span className="font-mono text-slate-200">{user.email || user.firstName}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Assigned Role:</span>
              <span className="font-mono text-amber-400 capitalize">{user.role || "Client Staff"}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="secondary"
            className="flex-1 text-xs"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => router.push("/dashboard")}
          >
            Return to Client Dashboard
          </Button>

          <Button
            variant="glow"
            className="flex-1 text-xs bg-rose-600 hover:bg-rose-500 text-white"
            leftIcon={<Sparkles className="h-4 w-4" />}
            onClick={handleElevateForDemo}
          >
            Authorize as Super Admin
          </Button>
        </div>
      </div>
    </div>
  );
}
