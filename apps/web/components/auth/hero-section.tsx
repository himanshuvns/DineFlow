"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  UtensilsCrossed,
  Sparkles,
  QrCode,
  MessageSquare,
  ChefHat,
  Check,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { ChefMascot } from "./chef-mascot";
import { FloatingCard } from "./floating-card";
import { ScatteredFoodParticles } from "./scattered-food-particles";

interface HeroSectionProps {
  isPasswordFocused?: boolean;
}

export function HeroSection({ isPasswordFocused = false }: HeroSectionProps) {
  return (
    <div className="relative w-full h-full lg:h-screen lg:max-h-screen flex flex-col justify-between p-6 sm:p-8 lg:p-10 overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#020617] dark:text-[#F8FAFC] select-none transition-colors duration-200">
      {/* ======================================================== */}
      {/* ATMOSPHERIC BACKGROUND: ADAPTIVE LIGHT & DARK            */}
      {/* ======================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft luxury background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-teal-50/40 to-emerald-50/30 dark:from-[#020617] dark:via-[#071924] dark:to-[#042421] transition-colors duration-300" />

        {/* Glowing Orbs */}
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-emerald-500/10 dark:bg-[#14F1C7]/12 rounded-full blur-[130px]" />
        <div className="absolute top-1/3 -right-24 w-[420px] h-[420px] bg-teal-500/8 dark:bg-[#00D4AA]/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 left-1/4 w-[500px] h-[300px] bg-emerald-500/10 dark:bg-[#0F3C36]/25 rounded-full blur-[120px]" />

        {/* Subtle grid mesh overlay */}
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #10B981 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* ======================================================== */}
      {/* SCATTERED FOOD PARTICLES (NO BUBBLE, COLOR ON HOVER)     */}
      {/* ======================================================== */}
      <ScatteredFoodParticles />

      {/* ======================================================== */}
      {/* TOP HEADER: DINEFLOW LOGO + NEXT-GEN BADGE               */}
      {/* ======================================================== */}
      <div className="relative z-20">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3.5">
          {/* DineFlow Logo */}
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 dark:from-[#14F1C7] dark:via-[#00D4AA] dark:to-emerald-500 p-[1.5px] shadow-[0_0_20px_rgba(16,185,129,0.25)] dark:shadow-[0_0_20px_rgba(20,241,199,0.35)] transition-transform duration-200 group-hover:scale-105">
              <div className="h-full w-full bg-white dark:bg-[#020617] rounded-[14px] flex items-center justify-center transition-colors">
                <UtensilsCrossed className="h-4.5 w-4.5 text-emerald-600 dark:text-[#14F1C7] transition-transform duration-200 group-hover:rotate-6" />
              </div>
            </div>
            <span className="text-2xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white">
              Dine<span className="text-emerald-600 dark:text-[#14F1C7]">Flow</span>
            </span>
          </Link>

          {/* Next-Gen Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-[#0F172A]/70 backdrop-blur-md border border-emerald-500/25 dark:border-[#14F1C7]/30 text-emerald-700 dark:text-[#14F1C7] text-xs font-semibold shadow-xs self-start sm:self-auto">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-[#14F1C7]" />
            <span>Next-Generation Hospitality OS</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* HERO HEADLINE & VALUE PROP                               */}
        {/* ======================================================== */}
        <div className="mt-4 sm:mt-6 max-w-xl">
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[46px] font-display font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
            Run Your Restaurant.
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 dark:from-[#14F1C7] dark:via-[#00E5B8] dark:to-emerald-400 bg-clip-text text-transparent glow-teal-text">
              Delight Every Guest.
            </span>
          </h1>

          <p className="mt-2 text-[13.5px] sm:text-[14.5px] font-body text-slate-600 dark:text-[#94A3B8] leading-relaxed max-w-lg">
            Everything you need to run a modern restaurant — from QR menus to
            kitchen operations, powered by smart technology.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MASCOT AREA: CHEF + 6 FLOATING CARDS + SCATTERED FOODS   */}
      {/* ======================================================== */}
      <div className="relative z-10 my-auto py-2 flex flex-col items-center justify-center">
        {/* Subtle Kitchen Counter Surface Glow behind chef */}
        <div className="absolute bottom-4 w-[85%] max-w-[480px] h-12 bg-gradient-to-r from-transparent via-emerald-500/15 dark:via-[#14F1C7]/15 to-transparent blur-xl pointer-events-none" />

        <div className="relative flex items-center justify-center w-full max-w-xl min-h-[380px] sm:min-h-[410px]">
          {/* Chef Mascot (Centered, rock-solid seated on counter) */}
          <div className="relative z-10">
            <ChefMascot isPasswordFocused={isPasswordFocused} />
          </div>

          {/* ==================================================== */}
          {/* FLOATING CARD 1: QR MENUS (Top-Left of Chef)         */}
          {/* ==================================================== */}
          <div className="absolute -top-4 left-0 sm:left-2 lg:-left-4 z-30 pointer-events-auto">
            <FloatingCard
              delay={0.1}
              duration={5.0}
              floatY={7}
              rotateDeg={-1.5}
              className="w-[155px] sm:w-[175px]"
            >
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-[#14F1C7]">
                  <QrCode className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                      QR Menus
                    </span>
                    <span className="px-1 py-0.2 rounded bg-emerald-500/15 text-[8.5px] font-bold text-emerald-600 dark:text-[#14F1C7]">
                      Live
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate">
                    Contactless dining
                  </p>
                </div>
              </div>
            </FloatingCard>
          </div>

          {/* ==================================================== */}
          {/* FLOATING CARD 2: TABLE 4 PASTA (Top-Right of Chef)   */}
          {/* ==================================================== */}
          <div className="absolute -top-3 right-0 sm:right-2 lg:-right-4 z-30 pointer-events-auto">
            <FloatingCard
              delay={0.4}
              duration={5.4}
              floatY={8}
              rotateDeg={1.5}
              className="w-[170px] sm:w-[190px]"
            >
              <div className="flex items-start gap-2">
                {/* Pasta Dish Thumbnail */}
                <div className="relative h-9 w-9 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/15 shrink-0 shadow-sm">
                  <Image
                    src="/images/pasta-dish.png"
                    alt="Pasta Arrabbiata"
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                      Table 4
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-[9px] font-bold text-emerald-600 dark:text-[#14F1C7]">
                      2×
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 truncate font-medium">
                    Pasta Arrabbiata
                  </p>

                  {/* Teal Progress Bar */}
                  <div className="mt-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-[#14F1C7] dark:to-emerald-400 h-full w-[75%] rounded-full shadow-[0_0_8px_rgba(20,241,199,0.6)]" />
                  </div>
                </div>
              </div>
            </FloatingCard>
          </div>

          {/* ==================================================== */}
          {/* FLOATING CARD 3: REVENUE / SALES (Upper-Mid Left)    */}
          {/* ==================================================== */}
          <div className="absolute top-28 -left-3 sm:left-0 lg:-left-7 z-30 pointer-events-auto">
            <FloatingCard
              delay={0.8}
              duration={4.7}
              floatY={6}
              rotateDeg={-1.0}
              className="w-[150px] sm:w-[170px]"
            >
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center shrink-0 text-teal-600 dark:text-teal-400">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11.5px] font-bold text-slate-900 dark:text-white tracking-tight block">
                    Today&apos;s Sales
                  </span>
                  <p className="text-[9.5px] text-emerald-600 dark:text-[#14F1C7] font-semibold truncate">
                    +34% vs last Sun
                  </p>
                </div>
              </div>
            </FloatingCard>
          </div>

          {/* ==================================================== */}
          {/* FLOATING CARD 4: INSTANT PAY / POS (Upper-Mid Right) */}
          {/* ==================================================== */}
          <div className="absolute top-28 -right-3 sm:right-0 lg:-right-7 z-30 pointer-events-auto">
            <FloatingCard
              delay={1.1}
              duration={5.1}
              floatY={7}
              rotateDeg={1.2}
              className="w-[155px] sm:w-[175px]"
            >
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
                  <CreditCard className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                      Table 08
                    </span>
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-[#14F1C7]">
                      Paid ✓
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate">
                    ₹1,840 • UPI Tap
                  </p>
                </div>
              </div>
            </FloatingCard>
          </div>

          {/* ==================================================== */}
          {/* FLOATING CARD 5: LIVE KDS (Bottom-Left)              */}
          {/* ==================================================== */}
          <div className="absolute bottom-4 left-0 sm:left-2 lg:-left-6 z-30 pointer-events-auto">
            <FloatingCard
              delay={1.3}
              duration={4.8}
              floatY={7}
              rotateDeg={-1.2}
              className="w-[155px] sm:w-[175px]"
            >
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
                  <ChefHat className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                      Live KDS
                    </span>
                    <span className="px-1 py-0.2 rounded bg-amber-500/15 text-[8.5px] font-bold text-amber-600 dark:text-amber-400">
                      Prep: 3m
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate">
                    Kitchen screen
                  </p>
                </div>
              </div>
            </FloatingCard>
          </div>

          {/* ==================================================== */}
          {/* FLOATING CARD 6: WHATSAPP ORDERS (Bottom-Right)      */}
          {/* ==================================================== */}
          <div className="absolute bottom-5 right-0 sm:right-2 lg:-right-6 z-30 pointer-events-auto">
            <FloatingCard
              delay={1.5}
              duration={4.6}
              floatY={6}
              rotateDeg={1.3}
              className="w-[155px] sm:w-[175px]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center shrink-0 text-[#25D366] shadow-[0_0_8px_rgba(37,211,102,0.25)]">
                    <MessageSquare className="h-3.5 w-3.5 fill-[#25D366]/20" />
                  </div>
                  <div>
                    <h5 className="text-[11.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                      WhatsApp
                    </h5>
                    <p className="text-[9.5px] text-slate-500 dark:text-slate-400">New Order</p>
                  </div>
                </div>

                {/* Live pulsing indicator dot */}
                <div className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]" />
                </div>
              </div>
            </FloatingCard>
          </div>
        </div>

        {/* Polished Kitchen Counter Bar Stage */}
        <div className="w-full max-w-lg h-[1px] bg-gradient-to-r from-transparent via-slate-300 dark:via-white/20 to-transparent relative -mt-2">
          <div className="absolute inset-x-12 -top-1 h-2.5 bg-gradient-to-b from-slate-200/50 dark:from-white/10 to-transparent blur-xs pointer-events-none" />
        </div>
      </div>

      {/* ======================================================== */}
      {/* BOTTOM TRUST / SOCIAL PROOF SECTION                      */}
      {/* ======================================================== */}
      <div className="relative z-20 pt-3 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar Stack */}
          <div className="relative h-8 w-[100px] shrink-0">
            <Image
              src="/images/avatars-stack.png"
              alt="Trusted restaurant partners"
              width={100}
              height={32}
              className="h-full w-auto object-contain drop-shadow-xs"
            />
          </div>

          <p className="text-xs text-slate-600 dark:text-[#94A3B8] font-body leading-tight">
            Trusted by{" "}
            <span className="font-bold text-slate-900 dark:text-white">500+</span> restaurants,
            cafés, and hotel resorts.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <Check className="h-3 w-3 text-emerald-600 dark:text-[#14F1C7]" />
          <span>No credit card required</span>
        </div>
      </div>
    </div>
  );
}
