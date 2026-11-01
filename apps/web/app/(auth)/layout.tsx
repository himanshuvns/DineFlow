"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UtensilsCrossed } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { HeroSection } from "@/components/auth/hero-section";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isPasswordFocused, setIsPasswordFocused] = React.useState(false);

  // Listen for custom events dispatched by password fields across auth pages
  React.useEffect(() => {
    const onFocus = () => setIsPasswordFocused(true);
    const onBlur = () => setIsPasswordFocused(false);

    window.addEventListener("password-field-focus", onFocus);
    window.addEventListener("password-field-blur", onBlur);

    return () => {
      window.removeEventListener("password-field-focus", onFocus);
      window.removeEventListener("password-field-blur", onBlur);
    };
  }, []);

  const isRegister = pathname?.includes("/register");
  const isLogin = pathname?.includes("/login");

  return (
    <main className="min-h-screen lg:h-screen lg:max-h-screen w-full grid grid-cols-1 lg:grid-cols-12 relative overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#020617] dark:text-[#F8FAFC] transition-colors duration-200">
      {/* ======================================================== */}
      {/* LEFT 42%: IMMERSIVE HERO SECTION                         */}
      {/* ======================================================== */}
      <aside className="hidden lg:flex lg:col-span-5 xl:col-span-5 w-full lg:h-full lg:max-h-screen relative z-10 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-white/10 overflow-hidden">
        <HeroSection isPasswordFocused={isPasswordFocused} />
      </aside>

      {/* ======================================================== */}
      {/* RIGHT 58%: FLOATING AUTH FORM PANE                       */}
      {/* ======================================================== */}
      <section className="col-span-1 lg:col-span-7 xl:col-span-7 w-full min-h-screen lg:h-full lg:max-h-screen flex flex-col justify-between items-center p-4 sm:p-6 lg:py-5 lg:px-8 xl:px-12 relative z-20 overflow-x-hidden overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-slate-50/90 dark:bg-[#020617]/95 transition-colors duration-200 pb-safe pt-safe touch-pan-y">
        {/* Soft Ambient Aurora Accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/10 dark:bg-[#14F1C7]/12 rounded-full blur-[140px]" />
          <div className="absolute top-1/2 -right-48 w-80 h-80 bg-cyan-500/8 dark:bg-[#00D4AA]/10 rounded-full blur-[150px]" />
          <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-teal-500/8 dark:bg-emerald-500/10 rounded-full blur-[140px]" />
        </div>

        {/* ======================================================== */}
        {/* TOP ACTION BAR: Integrates Status, Switcher & ThemeToggle */}
        {/* ======================================================== */}
        <header className="w-full flex items-center justify-between z-30 pt-1 pb-3 select-none">
          {/* Mobile brand badge (only visible when left mascot is hidden) */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/25">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
            <span className="font-display font-extrabold text-slate-900 dark:text-white text-base tracking-tight">
              DineFlow
            </span>
          </div>
          <div className="hidden lg:block" />

          {/* Luxury Integrated Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live platform status indicator */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-white/10 text-[11px] font-medium text-slate-600 dark:text-slate-400 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Cloud OS Operational</span>
            </div>

            {/* Contextual Route Switcher + Theme Toggle Pill */}
            <div className="inline-flex items-center gap-2 p-1 pl-3 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-white/10 shadow-sm">
              {isRegister && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 hidden xs:inline">Already registered?</span>
                  <Link
                    href="/login"
                    className="font-semibold text-emerald-600 dark:text-[#14F1C7] hover:text-emerald-700 dark:hover:text-[#00E5B8] transition-colors"
                  >
                    Sign In →
                  </Link>
                </div>
              )}

              {isLogin && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 hidden xs:inline">New restaurant?</span>
                  <Link
                    href="/register"
                    className="font-semibold text-emerald-600 dark:text-[#14F1C7] hover:text-emerald-700 dark:hover:text-[#00E5B8] transition-colors"
                  >
                    Create Workspace →
                  </Link>
                </div>
              )}

              {!isRegister && !isLogin && (
                <Link
                  href="/login"
                  className="text-xs font-semibold text-emerald-600 dark:text-[#14F1C7] hover:text-emerald-700 dark:hover:text-[#00E5B8] transition-colors"
                >
                  Back to Sign In
                </Link>
              )}

              <div className="h-3.5 w-[1px] bg-slate-200 dark:bg-slate-800 mx-0.5" />
              <ThemeToggle className="h-7 w-7 rounded-full border-0 shadow-none bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800" />
            </div>
          </div>
        </header>

        {/* Content Container (Flexible Width per Form Type) */}
        <div className="w-full my-auto py-2 sm:py-3 flex flex-col items-center justify-center relative z-10">
          {children}
        </div>

        {/* Bottom subtle signature quote */}
        <footer className="w-full max-w-3xl flex items-center justify-between pt-2 pb-1 text-[11px] font-body text-slate-400 dark:text-slate-500 select-none pointer-events-none">
          <span>Enterprise Multi-Tenant Hospitality OS</span>
          <span className="tracking-wide">Good Food. Greater Possibilities. —</span>
        </footer>
      </section>
    </main>
  );
}
