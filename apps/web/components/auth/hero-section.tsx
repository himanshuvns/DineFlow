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
    <div className="relative w-full h-full min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden bg-[#020617] text-[#F8FAFC] select-none">
      {/* ======================================================== */}
      {/* ATMOSPHERIC BACKGROUND: NAVY TO EMERALD & GLOWING ORBS   */}
      {/* ======================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep navy to emerald gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#071924] to-[#042421]" />

        {/* Glowing Orbs */}
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] bg-[#14F1C7]/12 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-24 w-[460px] h-[460px] bg-[#00D4AA]/10 rounded-full blur-[130px]" />
        <div className="absolute -bottom-24 left-1/4 w-[600px] h-[350px] bg-[#0F3C36]/25 rounded-full blur-[120px]" />

        {/* Subtle grid mesh overlay */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #14F1C7 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Ambient floating dust particles (subtle micro-animations) */}
        {[
          { x: "18%", y: "22%", size: 3, duration: 6, delay: 0 },
          { x: "82%", y: "15%", size: 2.5, duration: 7, delay: 1.5 },
          { x: "35%", y: "65%", size: 2, duration: 5.5, delay: 0.8 },
          { x: "70%", y: "78%", size: 3.5, duration: 8, delay: 2 },
          { x: "50%", y: "40%", size: 2, duration: 6.5, delay: 1 },
        ].map((pt, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#14F1C7]/40 blur-[0.5px]"
            style={{
              left: pt.x,
              top: pt.y,
              width: pt.size,
              height: pt.size,
            }}
            animate={{
              y: [0, -18, 0],
              opacity: [0.3, 0.85, 0.3],
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
          {/* DineFlow Logo */}
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-[#14F1C7] via-[#00D4AA] to-emerald-500 p-[1.5px] shadow-[0_0_20px_rgba(20,241,199,0.35)] transition-transform duration-200 group-hover:scale-105">
              <div className="h-full w-full bg-[#020617] rounded-[14px] flex items-center justify-center">
                <UtensilsCrossed className="h-5 w-5 text-[#14F1C7] transition-transform duration-200 group-hover:rotate-6" />
              </div>
            </div>
            <span className="text-2xl font-display font-extrabold tracking-tight text-white">
              Dine<span className="text-[#14F1C7]">Flow</span>
            </span>
          </Link>

          {/* Next-Gen Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F172A]/70 backdrop-blur-md border border-[#14F1C7]/30 text-[#14F1C7] text-xs font-semibold shadow-[0_0_14px_rgba(20,241,199,0.15)] self-start sm:self-auto">
            <Sparkles className="h-3.5 w-3.5 text-[#14F1C7]" />
            <span>Next-Generation Hospitality OS</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* HERO HEADLINE & VALUE PROP                               */}
        {/* ======================================================== */}
        <div className="mt-8 sm:mt-10 max-w-xl">
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-display font-extrabold text-white tracking-tight leading-[1.08]">
            Run Your Restaurant.
            <br />
            <span className="bg-gradient-to-r from-[#14F1C7] via-[#00E5B8] to-emerald-400 bg-clip-text text-transparent glow-teal-text">
              Delight Every Guest.
            </span>
          </h1>

          <p className="mt-4 text-[15px] sm:text-base font-body text-[#94A3B8] leading-relaxed max-w-lg">
            Everything you need to run a modern restaurant — from QR menus to
            kitchen operations, powered by smart technology.
          </p>
        </div>

        {/* ======================================================== */}
        {/* FEATURE CARDS (GLASSMORPHISM WITH HOVER GLOW)            */}
        {/* ======================================================== */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5 max-w-2xl">
          {/* Card 1: QR Menus */}
          <div className="group relative rounded-2xl p-3.5 bg-slate-900/55 backdrop-blur-xl border border-white/10 hover:border-[#14F1C7]/40 hover:bg-slate-900/75 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(20,241,199,0.2)]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center shrink-0 text-[#14F1C7] group-hover:scale-110 transition-transform">
                <QrCode className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[13px] font-semibold text-white tracking-tight truncate">
                  QR Menus
                </h4>
                <p className="text-[11px] text-slate-400 truncate">
                  Contactless dining
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: WhatsApp Orders */}
          <div className="group relative rounded-2xl p-3.5 bg-slate-900/55 backdrop-blur-xl border border-white/10 hover:border-[#14F1C7]/40 hover:bg-slate-900/75 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(20,241,199,0.2)]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center shrink-0 text-[#14F1C7] group-hover:scale-110 transition-transform">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[13px] font-semibold text-white tracking-tight truncate">
                  WhatsApp Orders
                </h4>
                <p className="text-[11px] text-slate-400 truncate">
                  More sales, less effort
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Live Kitchen Display */}
          <div className="group relative rounded-2xl p-3.5 bg-slate-900/55 backdrop-blur-xl border border-white/10 hover:border-[#14F1C7]/40 hover:bg-slate-900/75 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(20,241,199,0.2)]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center shrink-0 text-[#14F1C7] group-hover:scale-110 transition-transform">
                <ChefHat className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[13px] font-semibold text-white tracking-tight truncate">
                  Live Kitchen Display
                </h4>
                <p className="text-[11px] text-slate-400 truncate">
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
      <div className="relative z-10 my-4 sm:my-8 flex flex-col items-center justify-center min-h-[360px] lg:min-h-[420px]">
        {/* Subtle Kitchen Counter Surface Glow behind chef */}
        <div className="absolute bottom-6 w-[85%] max-w-[480px] h-12 bg-gradient-to-r from-transparent via-[#14F1C7]/15 to-transparent blur-2xl pointer-events-none" />

        <div className="relative flex items-center justify-center w-full max-w-xl">
          {/* Chef Mascot */}
          <ChefMascot isPasswordFocused={isPasswordFocused} />

          {/* FLOATING CARD 1: Table 4 / Pasta Arrabbiata (Top-Right of Chef) */}
          <div className="absolute -top-4 right-2 sm:right-6 lg:-right-4 z-30 pointer-events-auto">
            <FloatingCard
              delay={0.2}
              duration={5.2}
              floatY={9}
              rotateDeg={1.5}
              className="w-[195px] sm:w-[220px]"
            >
              <div className="flex items-start gap-3">
                {/* Pasta Dish Thumbnail */}
                <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-slate-800 border border-white/15 shrink-0 shadow-md">
                  <Image
                    src="/images/pasta-dish.png"
                    alt="Pasta Arrabbiata"
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white tracking-tight">
                      Table 4
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-[#14F1C7]/15 border border-[#14F1C7]/30 text-[10px] font-bold text-[#14F1C7]">
                      2×
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate mt-0.5 font-medium">
                    Pasta Arrabbiata
                  </p>

                  {/* Teal Progress Bar */}
                  <div className="mt-2.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#14F1C7] to-emerald-400 h-full w-[75%] rounded-full shadow-[0_0_10px_rgba(20,241,199,0.7)]" />
                  </div>
                </div>
              </div>
            </FloatingCard>
          </div>

          {/* FLOATING CARD 2: New WhatsApp Order (Bottom-Right of Chef) */}
          <div className="absolute bottom-6 right-4 sm:right-10 lg:right-0 z-30 pointer-events-auto">
            <FloatingCard
              delay={1.2}
              duration={4.6}
              floatY={7}
              rotateDeg={-1.5}
              className="w-[185px] sm:w-[205px]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {/* WhatsApp Emerald Icon */}
                  <div className="h-9 w-9 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center shrink-0 text-[#25D366] shadow-[0_0_12px_rgba(37,211,102,0.3)]">
                    <MessageSquare className="h-4 w-4 fill-[#25D366]/20" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white tracking-tight">
                      New Order
                    </h5>
                    <p className="text-[10px] text-slate-400">via WhatsApp</p>
                  </div>
                </div>

                {/* Live pulsing green status dot */}
                <div className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14F1C7] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#14F1C7]" />
                </div>
              </div>
            </FloatingCard>
          </div>
        </div>

        {/* Polished Kitchen Counter Bar Stage */}
        <div className="w-full max-w-xl h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent relative -mt-3">
          <div className="absolute inset-x-12 -top-1 h-3 bg-gradient-to-b from-white/10 to-transparent blur-xs pointer-events-none" />
        </div>
      </div>

      {/* ======================================================== */}
      {/* BOTTOM TRUST / SOCIAL PROOF SECTION                      */}
      {/* ======================================================== */}
      <div className="relative z-20 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* Avatar Stack */}
          <div className="relative h-9 w-[110px] shrink-0">
            <Image
              src="/images/avatars-stack.png"
              alt="Trusted restaurant partners"
              width={110}
              height={36}
              className="h-full w-auto object-contain drop-shadow-md"
            />
          </div>

          <p className="text-xs text-[#94A3B8] font-body leading-tight">
            Trusted by{" "}
            <span className="font-bold text-white">500+</span> restaurants,
            cafés, and hotel resorts.
          </p>
        </div>

        {/* Small subtle badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <Check className="h-3 w-3 text-[#14F1C7]" />
          <span>No credit card required</span>
        </div>
      </div>
    </div>
  );
}
