"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { HospitalityLoader } from "@/components/ui/hospitality-loader";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isPlatformRole } from "@/lib/rbac/roles";

export default function RootLoading() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  // Determine if this is a platform session or route
  let isPlatform = false;

  if (typeof window !== "undefined") {
    if (window.location.pathname.startsWith("/platform")) {
      isPlatform = true;
    }
    if (!isPlatform) {
      try {
        const raw = localStorage.getItem("dineflow_auth");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (isPlatformRole(parsed?.state?.user?.role)) {
            isPlatform = true;
          }
        }
      } catch {}
    }
  }

  if (!isPlatform) {
    isPlatform =
      Boolean(pathname && pathname.startsWith("/platform")) ||
      isPlatformRole(user?.role);
  }

  if (isPlatform) {
    return (
      <HospitalityLoader
        fullscreen
        variant="platform"
        colorTheme="rose"
        title="Securing Platform Console…"
        subtitle="Verifying cryptographic token and elevated platform permissions"
        messages={[
          "Verifying cryptographic security token…",
          "Initializing multi-tenant control plane…",
          "Synchronizing cluster telemetry & health ledgers…",
          "Access granted — entering Super Admin Console…",
        ]}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070A12]">
      <HospitalityLoader
        variant="cloche"
        fullscreen={false}
        title="DineFlow Hospitality Cloud"
        subtitle="Setting up your dining environment…"
      />
    </div>
  );
}

