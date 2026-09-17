"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar, NAV_ITEMS } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/topbar";
import { ImpersonationBanner } from "@/components/dashboard/impersonation-banner";
import { BroadcastBanner } from "@/components/dashboard/broadcast-banner";
import { useUIStore } from "@/lib/stores/ui-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isPlatformRole } from "@/lib/rbac/roles";
import { X, UtensilsCrossed, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { HospitalityLoader } from "@/components/ui/hospitality-loader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const { tenant, isAuthenticated, accessToken, user } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = React.useState(false);

  React.useEffect(() => {
    // 1. Check live Zustand store state
    const store = useAuthStore.getState();
    let authed = Boolean(store.isAuthenticated && store.accessToken);

    // 2. Check persisted localStorage cache during initial client hydration
    let roleFromStorage: string | undefined = store.user?.role;
    if (!authed && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("dineflow_auth");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.state?.accessToken && parsed?.state?.isAuthenticated) {
            authed = true;
            roleFromStorage = parsed?.state?.user?.role;
          }
        }
      } catch {}
    }

    if (!authed) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    // 3. Platform admins must NEVER see the client dashboard — redirect to /platform
    if (isPlatformRole(roleFromStorage)) {
      router.replace("/platform");
      return;
    }

    setIsAuthorized(true);
  }, [pathname, router, isAuthenticated, accessToken, user]);

  if (!isAuthorized) {
    return (
      <HospitalityLoader
        fullscreen
        variant="cloche"
        title="Securing Dining Room Session…"
        subtitle="Verifying credentials and restaurant workspace permissions"
      />
    );
  }

  return (
    <div className="h-screen flex bg-slate-50 text-slate-900 dark:bg-[#090D16] dark:text-slate-100 transition-colors duration-200 overflow-hidden">
      {/* Pinned Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full bg-white dark:bg-[#0B0F19] border-r border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200 shadow-2xl overflow-y-auto pb-safe pt-safe">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {tenant?.logoUrl || tenant?.logo ? (
                    <div className="h-8 w-8 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0F1D] flex items-center justify-center p-0.5 shrink-0 shadow-sm">
                      <img
                        src={tenant.logoUrl || tenant.logo}
                        alt={tenant.name || "Client Logo"}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-sm shrink-0">
                      <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                        <UtensilsCrossed className="h-4 w-4 text-emerald-400" />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                      {tenant?.name || "DineFlow"}
                    </span>
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 truncate">
                      {tenant?.type
                        ? `${tenant.type.charAt(0).toUpperCase() + tenant.type.slice(1).replace("_", " ")} OS`
                        : "Restaurant OS"}
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

              <nav className="mt-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 min-h-[42px] rounded-xl text-xs font-medium transition-colors cursor-pointer",
                        isActive
                          ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 font-semibold border border-emerald-500/25 dark:border-emerald-500/30 shadow-xs"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-slate-400 dark:text-slate-400"
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase shrink-0",
                            item.badge === "Live"
                              ? "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/30 animate-pulse"
                              : "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Plan Footer in Mobile Drawer */}
            <div className="pt-4 mt-4 border-t border-slate-200/80 dark:border-slate-800/60">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white capitalize truncate">
                    {tenant?.plan || "Growth"} Plan
                  </span>
                </div>
                <Badge variant="success" size="sm">Active</Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <ImpersonationBanner />
        <BroadcastBanner />
        <TopBar />
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto pb-safe flex flex-col min-h-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
