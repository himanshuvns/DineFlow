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
    <main className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 relative overflow-x-hidden bg-[#020617] text-[#F8FAFC]">
      {/* Top right theme toggle */}
      <div className="absolute top-5 right-5 z-50">
        <ThemeToggle />
      </div>

      {/* ======================================================== */}
      {/* LEFT 50%: IMMERSIVE HERO SECTION                         */}
      {/* ======================================================== */}
      <aside className="lg:col-span-6 w-full relative z-10 border-b lg:border-b-0 lg:border-r border-white/10">
        <HeroSection isPasswordFocused={isPasswordFocused} />
      </aside>

      {/* ======================================================== */}
      {/* RIGHT 50%: FLOATING AUTH FORM PANE                       */}
      {/* ======================================================== */}
      <section className="lg:col-span-6 w-full flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 relative z-20 min-h-screen bg-[#020617]/95">
        {/* Soft Ambient Teal Accents */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#14F1C7]/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-[#00D4AA]/8 rounded-full blur-[140px] pointer-events-none" />

        {/* Content Container (Holds Floating Registration or Login Card) */}
        <div className="w-full max-w-[540px] my-auto py-6 relative z-10">
          {children}
        </div>

        {/* Bottom subtle signature quote */}
        <div className="w-full max-w-[540px] text-right mt-3 pr-2 select-none pointer-events-none">
          <p className="text-[12px] font-body text-slate-500 tracking-wide">
            Good Food. Greater Possibilities. —
          </p>
        </div>
      </section>
    </main>
  );
}
