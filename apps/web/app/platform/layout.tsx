"use client";

import * as React from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isPlatformRole } from "@/lib/rbac/roles";
import { PlatformSidebar } from "@/components/platform/platform-sidebar";
import { PlatformTopbar } from "@/components/platform/platform-topbar";
import { AccessDenied } from "@/components/platform/access-denied";
import { HospitalityLoader } from "@/components/ui/hospitality-loader";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <HospitalityLoader
        fullscreen
        variant="platform"
        colorTheme="rose"
        title="Securing Platform Console…"
        subtitle="Verifying cryptographic token and elevated platform permissions"
        messages={[
          "Verifying cryptographic token…",
          "Mounting elevated platform security gates…",
          "Connecting global telemetry cluster…",
        ]}
      />
    );
  }

  // Security Check: Strictly enforce Platform-level RBAC
  const hasPlatformAccess = isPlatformRole(user?.role);

  if (!hasPlatformAccess) {
    return <AccessDenied />;
  }

  return (
    <div className="h-screen flex bg-slate-50 text-slate-900 dark:bg-[#070B14] dark:text-slate-100 transition-colors duration-200 overflow-hidden font-sans">
      {/* Platform Sidebar */}
      <PlatformSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <PlatformTopbar />
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto pb-safe flex flex-col min-h-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
