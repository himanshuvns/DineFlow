"use client";

import * as React from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { HeroSection } from "@/components/auth/hero-section";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <main className="min-h-screen lg:h-screen lg:max-h-screen w-full grid grid-cols-1 lg:grid-cols-12 relative overflow-x-hidden lg:overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#020617] dark:text-[#F8FAFC] transition-colors duration-200">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle className="shadow-sm dark:shadow-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-md" />
      </div>

      {/* ======================================================== */}
      {/* LEFT 50%: IMMERSIVE HERO SECTION                         */}
      {/* ======================================================== */}
      <aside className="lg:col-span-6 w-full lg:h-full lg:max-h-screen relative z-10 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-white/10 overflow-hidden">
        <HeroSection isPasswordFocused={isPasswordFocused} />
      </aside>

      {/* ======================================================== */}
      {/* RIGHT 50%: FLOATING AUTH FORM PANE                       */}
      {/* ======================================================== */}
      <section className="lg:col-span-6 w-full lg:h-full lg:max-h-screen flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative z-20 overflow-y-auto overscroll-contain bg-slate-50/90 dark:bg-[#020617]/95 transition-colors duration-200">
        {/* Soft Ambient Teal Accents */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/8 dark:bg-[#14F1C7]/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-teal-500/6 dark:bg-[#00D4AA]/8 rounded-full blur-[140px] pointer-events-none" />

        {/* Content Container (Holds Floating Registration or Login Card) */}
        <div className="w-full max-w-[500px] my-auto py-4 relative z-10">
          {children}

          {/* Bottom subtle signature quote */}
          <div className="w-full text-right mt-2 pr-2 select-none pointer-events-none">
            <p className="text-[11.5px] font-body text-slate-400 dark:text-slate-500 tracking-wide">
              Good Food. Greater Possibilities. —
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
