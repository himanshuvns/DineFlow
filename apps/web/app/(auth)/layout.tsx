"use client";

import * as React from "react";
import Link from "next/link";
import { UtensilsCrossed, Sparkles, CheckCircle, Zap, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen grid lg:grid-cols-12 relative overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#090D16] dark:text-slate-100 transition-colors duration-200">
      {/* Top right absolute theme toggle */}
      <div className="absolute top-5 right-5 z-50">
        <ThemeToggle />
      </div>

      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Left Showcase Pane (Hidden on mobile) */}
      <aside className="hidden lg:flex lg:col-span-5 xl:col-span-6 flex-col justify-between p-12 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-gradient-to-b dark:from-slate-900/60 dark:to-slate-950/90 relative z-10">
        <div>
          {/* Brand */}
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/25 flex items-center justify-center">
              <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center group-hover:bg-transparent transition-colors">
                <UtensilsCrossed className="h-5 w-5 text-emerald-400 group-hover:text-slate-950 transition-colors" />
              </div>
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Dine<span className="text-emerald-500 dark:text-emerald-400">Flow</span>
            </span>
          </Link>

          {/* Value Prop */}
          <div className="mt-20 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-6">
              <Sparkles className="h-3.5 w-3.5" /> Next-Generation Hospitality OS
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Streamline operations. <br />
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                Delight your diners.
              </span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-4 leading-relaxed text-sm">
              Unified multi-tenant platform for contactless QR table ordering, lightning-fast
              Kitchen Display (KDS), and automated WhatsApp marketing.
            </p>

            {/* Feature Pills */}
            <div className="mt-8 space-y-3.5">
              {[
                { icon: Zap, text: "Zero-lag live order routing to kitchen stations" },
                { icon: ShieldCheck, text: "Strict tenant data isolation & enterprise RBAC" },
                { icon: CheckCircle, text: "Direct WhatsApp order tracking & receipts" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 text-sm">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 dark:border-emerald-500/30 flex items-center justify-center shrink-0">
                    <item.icon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Social Proof */}
        <div className="pt-8 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2 overflow-hidden">
              {["MK", "RS", "AJ"].map((initials, i) => (
                <div
                  key={i}
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300"
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Trusted by <span className="font-semibold text-slate-900 dark:text-white">500+</span> restaurants,
              cafés, and hotel resorts.
            </p>
          </div>
        </div>
      </aside>

      {/* Right Content Pane (Auth Card Form) */}
      <section className="lg:col-span-7 xl:col-span-6 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10 min-h-screen">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}
