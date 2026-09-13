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
  ScanLine,
} from "lucide-react";
import { ChefMascot } from "./chef-mascot";
import { FloatingCard } from "./floating-card";
import { ScatteredFoodParticles } from "./scattered-food-particles";

interface HeroSectionProps {
  isPasswordFocused?: boolean;
}

export function HeroSection({ isPasswordFocused = false }: HeroSectionProps) {
  // Connected feature highlight state (text <-> cards)
  const [highlightedFeature, setHighlightedFeature] = React.useState<
    "qr" | "kds" | "sales" | "pay" | "whatsapp" | "pasta" | null
  >(null);

  // Interactive state for Floating Cards
  const [qrScanned, setQrScanned] = React.useState(false);
  const [table4Stage, setTable4Stage] = React.useState<0 | 1 | 2>(0);
  const [salesMetricIndex, setSalesMetricIndex] = React.useState<0 | 1 | 2>(0);
  const [payStage, setPayStage] = React.useState(false);
  const [kdsStage, setKdsStage] = React.useState<0 | 1 | 2>(0);
  const [showWhatsappBubble, setShowWhatsappBubble] = React.useState(false);

  // Mouse coordinate spotlight
  const [mousePos, setMousePos] = React.useState({ x: 300, y: 300 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative w-full h-full lg:h-screen lg:max-h-screen flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12 overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#020617] dark:text-[#F8FAFC] select-none transition-colors duration-200"
    >
      {/* ======================================================== */}
      {/* ATMOSPHERIC BACKGROUND: ADAPTIVE LIGHT & DARK            */}
      {/* ======================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft luxury background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-teal-50/40 to-emerald-50/30 dark:from-[#020617] dark:via-[#071924] dark:to-[#042421] transition-colors duration-300" />

        {/* Glowing Ambient Orbs */}
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-emerald-500/10 dark:bg-[#14F1C7]/12 rounded-full blur-[130px]" />
        <div className="absolute top-1/3 -right-24 w-[420px] h-[420px] bg-teal-500/8 dark:bg-[#00D4AA]/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 left-1/4 w-[500px] h-[300px] bg-emerald-500/10 dark:bg-[#0F3C36]/25 rounded-full blur-[120px]" />

        {/* Interactive Mouse Spotlight Glow */}
        <div
          className="absolute inset-0 transition-opacity duration-500 opacity-60 dark:opacity-80"
          style={{
            background: `radial-gradient(550px circle at ${mousePos.x}px ${mousePos.y}px, rgba(20, 241, 199, 0.07), transparent 80%)`,
          }}
        />

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
      {/* SCATTERED FOOD PARTICLES (CLEAN TEXT EXCLUSION ZONE)     */}
      {/* ======================================================== */}
      <ScatteredFoodParticles />

      {/* ======================================================== */}
      {/* TOP HEADER: DINEFLOW LOGO + NEXT-GEN BADGE               */}
      {/* ======================================================== */}
      <div className="relative z-20">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 sm:gap-4">
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-[#0F172A]/80 backdrop-blur-md border border-emerald-500/25 dark:border-[#14F1C7]/30 text-emerald-700 dark:text-[#14F1C7] text-xs font-semibold shadow-xs self-start sm:self-auto hover:border-emerald-500/40 dark:hover:border-[#14F1C7]/50 transition-colors">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 dark:bg-[#14F1C7]" />
            </span>
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-[#14F1C7]" />
            <span>Next-Generation Hospitality OS</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* HERO HEADLINE & VALUE PROP (PERFECT LUXURY SPACING)      */}
        {/* ======================================================== */}
        <div className="mt-8 sm:mt-10 lg:mt-11 max-w-xl">
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] xl:text-[50px] font-display font-extrabold text-slate-900 dark:text-white tracking-[-0.03em] leading-[1.14] sm:leading-[1.12]">
            Run Your Restaurant.
            <span className="block mt-2 sm:mt-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 dark:from-[#14F1C7] dark:via-[#00E5B8] dark:to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_2px_18px_rgba(20,241,199,0.25)]">
              Delight Every Guest.
            </span>
          </h1>

          <p className="mt-4 sm:mt-5 text-[15px] sm:text-[16px] font-body text-slate-600 dark:text-slate-400 leading-[1.7] max-w-lg font-normal">
            Everything you need to run a modern restaurant — from{" "}
            <span
              onMouseEnter={() => setHighlightedFeature("qr")}
              onMouseLeave={() => setHighlightedFeature(null)}
              className="text-slate-900 dark:text-white font-medium underline decoration-emerald-500/40 hover:decoration-emerald-500 dark:decoration-[#14F1C7]/40 dark:hover:decoration-[#14F1C7] underline-offset-4 cursor-pointer transition-colors"
            >
              contactless QR menus
            </span>{" "}
            to{" "}
            <span
              onMouseEnter={() => setHighlightedFeature("kds")}
              onMouseLeave={() => setHighlightedFeature(null)}
              className="text-slate-900 dark:text-white font-medium underline decoration-emerald-500/40 hover:decoration-emerald-500 dark:decoration-[#14F1C7]/40 dark:hover:decoration-[#14F1C7] underline-offset-4 cursor-pointer transition-colors"
            >
              live kitchen displays
            </span>
            , powered by{" "}
            <span
              onMouseEnter={() => setHighlightedFeature("sales")}
              onMouseLeave={() => setHighlightedFeature(null)}
              className="text-slate-900 dark:text-white font-medium underline decoration-emerald-500/40 hover:decoration-emerald-500 dark:decoration-[#14F1C7]/40 dark:hover:decoration-[#14F1C7] underline-offset-4 cursor-pointer transition-colors"
            >
              smart analytics
            </span>
            .
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MASCOT AREA: CHEF + 6 HIGHLY INTERACTIVE FLOATING CARDS  */}
      {/* ======================================================== */}
      <div className="relative z-10 my-auto py-3 flex flex-col items-center justify-center">
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
          <div
            onClick={() => {
              setQrScanned(!qrScanned);
            }}
            onMouseEnter={() => setHighlightedFeature("qr")}
            onMouseLeave={() => setHighlightedFeature(null)}
            className="absolute -top-4 left-0 sm:left-2 lg:-left-4 z-30 pointer-events-auto cursor-pointer"
            title="Click to simulate guest QR scan"
          >
            <FloatingCard
              delay={0.1}
              duration={5.0}
              floatY={7}
              rotateDeg={-1.5}
              isHighlighted={highlightedFeature === "qr"}
              className="w-[160px] sm:w-[180px]"
            >
              <div className="flex items-center gap-2.5">
                <div className="relative h-8 w-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-[#14F1C7] overflow-hidden">
                  {qrScanned ? (
                    <ScanLine className="h-4 w-4 animate-pulse" />
                  ) : (
                    <QrCode className="h-4 w-4" />
                  )}
                  {/* Subtle animated scan beam */}
                  <div className="absolute inset-x-0 h-[2px] bg-emerald-400 dark:bg-[#14F1C7] shadow-[0_0_8px_rgba(20,241,199,1)] animate-bounce opacity-40 pointer-events-none" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-bold text-slate-900 dark:text-white tracking-tight truncate">
                      {qrScanned ? "Table 12" : "QR Menus"}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-[8.5px] font-bold text-emerald-600 dark:text-[#14F1C7]">
                      {qrScanned ? "Scanned ✓" : "Live"}
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate">
                    {qrScanned ? "Menu opened (3s)" : "Contactless dining"}
                  </p>
                </div>
              </div>
            </FloatingCard>
          </div>

          {/* ==================================================== */}
          {/* FLOATING CARD 2: TABLE 4 PASTA (Top-Right of Chef)   */}
          {/* ==================================================== */}
          <div
            onClick={() => {
              setTable4Stage(((table4Stage + 1) % 3) as 0 | 1 | 2);
            }}
            onMouseEnter={() => setHighlightedFeature("pasta")}
            onMouseLeave={() => setHighlightedFeature(null)}
            className="absolute -top-3 right-0 sm:right-2 lg:-right-4 z-30 pointer-events-auto cursor-pointer"
            title="Click to advance dish status"
          >
            <FloatingCard
              delay={0.4}
              duration={5.4}
              floatY={8}
              rotateDeg={1.5}
              isHighlighted={highlightedFeature === "pasta"}
              className="w-[175px] sm:w-[195px]"
            >
              <div className="flex items-start gap-2.5">
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
                      {table4Stage === 0
                        ? "2×"
                        : table4Stage === 1
                        ? "Plated ✓"
                        : "Served 🎉"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 truncate font-medium">
                    Pasta Arrabbiata
                  </p>

                  {/* Dynamic Progress Bar */}
                  <div className="mt-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-[#14F1C7] dark:to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{
                        width:
                          table4Stage === 0
                            ? "70%"
                            : table4Stage === 1
                            ? "100%"
                            : "100%",
                      }}
                    />
                  </div>
                </div>
              </div>
            </FloatingCard>
          </div>

          {/* ==================================================== */}
          {/* FLOATING CARD 3: REVENUE / SALES (Upper-Mid Left)    */}
          {/* ==================================================== */}
          <div
            onClick={() => {
              setSalesMetricIndex(((salesMetricIndex + 1) % 3) as 0 | 1 | 2);
            }}
            onMouseEnter={() => setHighlightedFeature("sales")}
            onMouseLeave={() => setHighlightedFeature(null)}
            className="absolute top-28 -left-3 sm:left-0 lg:-left-7 z-30 pointer-events-auto cursor-pointer"
            title="Click to cycle live analytics metrics"
          >
            <FloatingCard
              delay={0.8}
              duration={4.7}
              floatY={6}
              rotateDeg={-1.0}
              isHighlighted={highlightedFeature === "sales"}
              className="w-[155px] sm:w-[175px]"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center shrink-0 text-teal-600 dark:text-teal-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11.5px] font-bold text-slate-900 dark:text-white tracking-tight block truncate">
                    {salesMetricIndex === 0
                      ? "Today's Sales"
                      : salesMetricIndex === 1
                      ? "Active Tables"
                      : "Table Turn"}
                  </span>
                  <p className="text-[9.5px] text-emerald-600 dark:text-[#14F1C7] font-semibold truncate">
                    {salesMetricIndex === 0
                      ? "₹84,200 (+34%)"
                      : salesMetricIndex === 1
                      ? "18 of 20 (90%)"
                      : "38 min avg"}
                  </p>
                </div>
              </div>
            </FloatingCard>
          </div>

          {/* ==================================================== */}
          {/* FLOATING CARD 4: INSTANT PAY / POS (Upper-Mid Right) */}
          {/* ==================================================== */}
          <div
            onClick={() => setPayStage(!payStage)}
            onMouseEnter={() => setHighlightedFeature("pay")}
            onMouseLeave={() => setHighlightedFeature(null)}
            className="absolute top-28 -right-3 sm:right-0 lg:-right-7 z-30 pointer-events-auto cursor-pointer"
            title="Click to toggle payment confirmation"
          >
            <FloatingCard
              delay={1.1}
              duration={5.1}
              floatY={7}
              rotateDeg={1.2}
              isHighlighted={highlightedFeature === "pay"}
              className="w-[160px] sm:w-[180px]"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                      Table 08
                    </span>
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-[#14F1C7]">
                      {payStage ? "SMS Sent ✓" : "Paid ✓"}
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate">
                    {payStage ? "Bill #4092 SMS Sent" : "₹1,840 • UPI Tap"}
                  </p>
                </div>
              </div>
            </FloatingCard>
          </div>

          {/* ==================================================== */}
          {/* FLOATING CARD 5: LIVE KDS (Bottom-Left)              */}
          {/* ==================================================== */}
          <div
            onClick={() => {
              setKdsStage(((kdsStage + 1) % 3) as 0 | 1 | 2);
            }}
            onMouseEnter={() => setHighlightedFeature("kds")}
            onMouseLeave={() => setHighlightedFeature(null)}
            className="absolute bottom-4 left-0 sm:left-2 lg:-left-6 z-30 pointer-events-auto cursor-pointer"
            title="Click to cycle kitchen display ticket"
          >
            <FloatingCard
              delay={1.3}
              duration={4.8}
              floatY={7}
              rotateDeg={-1.2}
              isHighlighted={highlightedFeature === "kds"}
              className="w-[160px] sm:w-[180px]"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
                  <ChefHat className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                      Live KDS
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-[8.5px] font-bold text-amber-600 dark:text-amber-400">
                      {kdsStage === 0
                        ? "Prep: 3m"
                        : kdsStage === 1
                        ? "Plated ✓"
                        : "Ready 🔔"}
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate">
                    {kdsStage === 0
                      ? "Kitchen screen"
                      : kdsStage === 1
                      ? "Chef Antonio done"
                      : "Server called"}
                  </p>
                </div>
              </div>
            </FloatingCard>
          </div>

          {/* ==================================================== */}
          {/* FLOATING CARD 6: WHATSAPP ORDERS (Bottom-Right)      */}
          {/* ==================================================== */}
          <div
            onClick={() => setShowWhatsappBubble(!showWhatsappBubble)}
            onMouseEnter={() => setHighlightedFeature("whatsapp")}
            onMouseLeave={() => setHighlightedFeature(null)}
            className="absolute bottom-5 right-0 sm:right-2 lg:-right-6 z-30 pointer-events-auto cursor-pointer relative"
            title="Click to preview incoming WhatsApp order"
          >
            {/* Interactive Preview Chat Bubble on Click */}
            {showWhatsappBubble && (
              <div className="absolute -top-12 right-0 z-40 px-2.5 py-1 rounded-xl text-[10px] font-medium bg-emerald-600 text-white shadow-lg pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
                💬 Table 6: 2× Arrabbiata, 1× Tiramisu
              </div>
            )}

            <FloatingCard
              delay={1.5}
              duration={4.6}
              floatY={6}
              rotateDeg={1.3}
              isHighlighted={highlightedFeature === "whatsapp"}
              className="w-[160px] sm:w-[180px]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center shrink-0 text-[#25D366] shadow-[0_0_8px_rgba(37,211,102,0.25)]">
                    <MessageSquare className="h-4 w-4 fill-[#25D366]/20" />
                  </div>
                  <div>
                    <h5 className="text-[11.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                      WhatsApp
                    </h5>
                    <p className="text-[9.5px] text-slate-500 dark:text-slate-400">
                      {showWhatsappBubble ? "Previewing" : "New Order"}
                    </p>
                  </div>
                </div>

                {/* Live pulsing indicator dot */}
                <div className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25D366]" />
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
      <div className="relative z-20 pt-3.5 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-[#14F1C7]" />
          <span>No credit card required</span>
        </div>
      </div>
    </div>
  );
}
