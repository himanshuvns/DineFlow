"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  Sparkles,
  QrCode,
  MessageSquare,
  ChefHat,
  Check,
} from "lucide-react";
import { ChefMascot } from "./chef-mascot";
import { FloatingCard } from "./floating-card";

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

        {/* Ambient floating micro-particles */}
        {[
          { x: "18%", y: "22%", size: 3, duration: 6, delay: 0 },
          { x: "82%", y: "15%", size: 2.5, duration: 7, delay: 1.5 },
          { x: "35%", y: "65%", size: 2, duration: 5.5, delay: 0.8 },
          { x: "70%", y: "78%", size: 3.5, duration: 8, delay: 2 },
        ].map((pt, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-emerald-500/35 dark:bg-[#14F1C7]/40 blur-[0.5px]"
            style={{
              left: pt.x,
              top: pt.y,
              width: pt.size,
              height: pt.size,
            }}
            animate={{
              y: [0, -16, 0],
              opacity: [0.25, 0.75, 0.25],
            }}
            transition={{
              duration: pt.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: pt.delay,
            }}
          />
        ))}
      </div>

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
        <div className="mt-5 sm:mt-7 max-w-xl">
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[48px] font-display font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
            Run Your Restaurant.
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 dark:from-[#14F1C7] dark:via-[#00E5B8] dark:to-emerald-400 bg-clip-text text-transparent glow-teal-text">
              Delight Every Guest.
            </span>
          </h1>

          <p className="mt-2.5 text-[14px] sm:text-[15px] font-body text-slate-600 dark:text-[#94A3B8] leading-relaxed max-w-lg">
            Everything you need to run a modern restaurant — from QR menus to
            kitchen operations, powered by smart technology.
          </p>
        </div>

        {/* ======================================================== */}
        {/* FEATURE CARDS (GLASSMORPHISM WITH HOVER GLOW)            */}
        {/* ======================================================== */}
        <div className="mt-4 sm:mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-2xl">
          {/* Card 1: QR Menus */}
          <div className="group relative rounded-2xl p-3 bg-white/80 dark:bg-slate-900/55 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 hover:border-emerald-500/40 dark:hover:border-[#14F1C7]/40 hover:bg-white dark:hover:bg-slate-900/75 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_8px_25px_rgba(20,241,199,0.2)]">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-[#14F1C7] group-hover:scale-110 transition-transform">
                <QrCode className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight truncate">
                  QR Menus
                </h4>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                  Contactless dining
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: WhatsApp Orders */}
          <div className="group relative rounded-2xl p-3 bg-white/80 dark:bg-slate-900/55 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 hover:border-emerald-500/40 dark:hover:border-[#14F1C7]/40 hover:bg-white dark:hover:bg-slate-900/75 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_8px_25px_rgba(20,241,199,0.2)]">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-[#14F1C7] group-hover:scale-110 transition-transform">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight truncate">
                  WhatsApp Orders
                </h4>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                  More sales, less effort
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Live Kitchen Display */}
          <div className="group relative rounded-2xl p-3 bg-white/80 dark:bg-slate-900/55 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 hover:border-emerald-500/40 dark:hover:border-[#14F1C7]/40 hover:bg-white dark:hover:bg-slate-900/75 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_8px_25px_rgba(20,241,199,0.2)]">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-[#14F1C7] group-hover:scale-110 transition-transform">
                <ChefHat className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight truncate">
                  Live Kitchen Display
                </h4>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                  Real-time operations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MASCOT AREA & FLOATING UI CARDS                          */}
      {/* ======================================================== */}
      <div className="relative z-10 my-auto py-2 flex flex-col items-center justify-center">
        {/* Subtle Kitchen Counter Surface Glow behind chef */}
        <div className="absolute bottom-3 w-[80%] max-w-[440px] h-10 bg-gradient-to-r from-transparent via-emerald-500/15 dark:via-[#14F1C7]/15 to-transparent blur-xl pointer-events-none" />

        <div className="relative flex items-center justify-center w-full max-w-lg">
          {/* Chef Mascot (Rock-solid seated, zero position jump) */}
          <ChefMascot isPasswordFocused={isPasswordFocused} />

          {/* FLOATING CARD 1: Table 4 / Pasta Arrabbiata (Top-Right of Chef) */}
          <div className="absolute -top-2 right-2 sm:right-6 lg:-right-2 z-30 pointer-events-auto">
            <FloatingCard
              delay={0.2}
              duration={5.2}
              floatY={8}
              rotateDeg={1.2}
              className="w-[185px] sm:w-[210px]"
            >
              <div className="flex items-start gap-2.5">
                {/* Pasta Dish Thumbnail */}
                <div className="relative h-11 w-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/15 shrink-0 shadow-sm">
                  <Image
                    src="/images/pasta-dish.png"
                    alt="Pasta Arrabbiata"
                    width={44}
                    height={44}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
                      Table 4
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 dark:bg-[#14F1C7]/15 border border-emerald-500/30 dark:border-[#14F1C7]/30 text-[10px] font-bold text-emerald-700 dark:text-[#14F1C7]">
                      2×
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5 font-medium">
                    Pasta Arrabbiata
                  </p>

                  {/* Teal Progress Bar */}
                  <div className="mt-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-[#14F1C7] dark:to-emerald-400 h-full w-[75%] rounded-full shadow-[0_0_8px_rgba(20,241,199,0.6)]" />
                  </div>
                </div>
              </div>
            </FloatingCard>
          </div>

          {/* FLOATING CARD 2: New WhatsApp Order (Bottom-Right of Chef) */}
          <div className="absolute bottom-4 right-3 sm:right-8 lg:right-0 z-30 pointer-events-auto">
            <FloatingCard
              delay={1.2}
              duration={4.6}
              floatY={6}
              rotateDeg={-1.2}
              className="w-[175px] sm:w-[195px]"
            >
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center shrink-0 text-[#25D366] shadow-[0_0_10px_rgba(37,211,102,0.25)]">
                    <MessageSquare className="h-3.5 w-3.5 fill-[#25D366]/20" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
                      New Order
                    </h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">via WhatsApp</p>
                  </div>
                </div>

                {/* Live pulsing indicator dot */}
                <div className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
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
