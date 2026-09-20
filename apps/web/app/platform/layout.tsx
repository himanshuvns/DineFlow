"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X, ExternalLink } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { usePlatformStore } from "@/lib/stores/platform-store";
import { isPlatformRole } from "@/lib/rbac/roles";
import { PlatformSidebar, PLATFORM_NAV_ITEMS } from "@/components/platform/platform-sidebar";
import { PlatformTopbar } from "@/components/platform/platform-topbar";
import { AccessDenied } from "@/components/platform/access-denied";
import { HospitalityLoader } from "@/components/ui/hospitality-loader";
import { cn } from "@/lib/utils";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const logoutPlatform = usePlatformStore((s) => s.logoutPlatform);
  const clients = usePlatformStore((s) => s.clients);
  const [mounted, setMounted] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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

  const handleLogout = async () => {
    try {
      await logoutPlatform();
    } catch {}
    router.push("/login");
  };

  const activeClientsCount = clients.filter((c) => c.status === "active").length;

  return (
    <div className="h-screen flex bg-slate-50 text-slate-900 dark:bg-[#070B14] dark:text-slate-100 transition-colors duration-200 overflow-hidden font-sans">
      {/* Pinned Desktop Platform Sidebar */}
      <PlatformSidebar />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full bg-white dark:bg-[#070B14] border-r border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200 shadow-2xl overflow-y-auto pb-safe pt-safe">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
                    DF
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Platform Admin
                    </span>
                    <span className="text-[10px] text-rose-500 font-semibold uppercase tracking-wider">
                      Control Plane
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Status Pill */}
              <div className="py-3">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Telemetry Active
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {activeClientsCount} Live
                  </span>
                </div>
              </div>

              {/* Nav links */}
              <nav className="space-y-1">
                {PLATFORM_NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/platform/dashboard" && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 min-h-[42px] rounded-xl text-xs font-semibold transition-colors",
                        isActive
                          ? "bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 font-bold border border-rose-500/25 dark:border-rose-500/30"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-slate-400 dark:text-slate-400"
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer */}
            <div className="pt-4 mt-4 border-t border-slate-200/80 dark:border-slate-800/60 space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-slate-500" />
                  <span>Client Dashboard</span>
                </div>
                <span className="text-[10px] text-slate-400">↗</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold cursor-pointer border border-rose-200/60 dark:border-rose-900/40 min-h-[44px]"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <PlatformTopbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto pb-safe flex flex-col min-h-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
