"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  QrCode,
  UtensilsCrossed,
  ShoppingBag,
  Send,
  Clock,
  Receipt,
  Hotel,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Bell,
  Smartphone,
  Wifi,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  Search,
  FileText,
  Flame,
  RotateCcw,
  Check,
  CreditCard,
  ShieldCheck,
  Volume2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ParallaxFloatingOrb, ParallaxFloat } from "@/components/landing/section-decorations";

type JourneyType = "restaurant" | "hotel";

interface JourneyStep {
  title: string;
  desc: string;
  icon: React.ElementType;
}

const RESTAURANT_STEPS: JourneyStep[] = [
  { title: "Scan Table QR", desc: "Instant camera scan opens your branded menu with zero app download.", icon: QrCode },
  { title: "Browse Menu", desc: "High-resolution dish photos, dietary badges, and custom modifier groups.", icon: UtensilsCrossed },
  { title: "Add to Cart", desc: "Custom instructions (e.g. extra crispy, less spicy) saved directly to items.", icon: ShoppingBag },
  { title: "Place Order", desc: "Instant order firing directly to kitchen station display screens with sound chime.", icon: Send },
  { title: "Track Order", desc: "Live status updates as chefs move dishes from cooking to plated.", icon: Clock },
  { title: "Digital Receipt", desc: "GST tax invoice sent instantly to WhatsApp with one-tap digital payments.", icon: Receipt },
];

const HOTEL_STEPS: JourneyStep[] = [
  { title: "Scan Room QR", desc: "Room-specific QR code securely associates guest room and folio.", icon: Hotel },
  { title: "Browse In-Room Dining", desc: "Curated 24/7 room service menus, midnight snacks, and beverage lists.", icon: UtensilsCrossed },
  { title: "Place Room Order", desc: "Guest enters delivery preference or schedules breakfast for morning.", icon: Send },
  { title: "Kitchen Routing", desc: "Dispatched directly to the room service pantry and kitchen line.", icon: Clock },
  { title: "Tray Delivery", desc: "Server delivers directly to the door with delivery confirmation alert.", icon: Bell },
  { title: "Folio Settlement", desc: "Order total automatically posted to guest room folio at check-out.", icon: Receipt },
];

const RESTAURANT_LOADING_MESSAGES = [
  "Connecting to camera & pairing Table 04…",
  "Loading Grand Bistro digital menu & daily specials…",
  "Opening item customizer & kitchen notes…",
  "Reviewing cart & calculating 5% GST taxes…",
  "Firing order ticket to Kitchen Display Station #2…",
  "Verifying UPI payment & generating tax invoice…",
];

const HOTEL_LOADING_MESSAGES = [
  "Initializing room key scanner & pairing Suite 302…",
  "Loading 24/7 In-Room dining & beverage menu…",
  "Saving room delivery preferences & notes…",
  "Routing ticket to Floor 3 service pantry line…",
  "Tracking service cart en route to Suite 302…",
  "Posting bill to Room 302 master folio…",
];

export function LandingCustomerJourney() {
  const [journeyType, setJourneyType] = React.useState<JourneyType>("restaurant");
  const [activeStep, setActiveStep] = React.useState(0);
  const [isScreenLoading, setIsScreenLoading] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState("");
  const [iosNotification, setIosNotification] = React.useState<string | null>(null);

  // Interactive in-screen states
  const [selectedCategory, setSelectedCategory] = React.useState<"popular" | "pizza" | "pasta" | "drinks">("popular");
  const [hasExtraCheese, setHasExtraCheese] = React.useState(true);
  const [hasGarlicDip, setHasGarlicDip] = React.useState(true);
  const [quantity, setQuantity] = React.useState(1);
  const [paymentMethod, setPaymentMethod] = React.useState<"upi" | "card" | "cash">("upi");
  const [kdsSecondsRemaining, setKdsSecondsRemaining] = React.useState(372); // ~6 mins

  const steps = journeyType === "restaurant" ? RESTAURANT_STEPS : HOTEL_STEPS;
  const currentStep = steps[activeStep] || steps[0];
  const loadingMessages = journeyType === "restaurant" ? RESTAURANT_LOADING_MESSAGES : HOTEL_LOADING_MESSAGES;

  // Countdown timer for Step 5 (KDS)
  React.useEffect(() => {
    if (activeStep !== 4) return;
    const interval = setInterval(() => {
      setKdsSecondsRemaining((prev) => (prev > 10 ? prev - 1 : 360));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeStep]);

  // Dynamic price calculation
  const basePizzaPrice = 550;
  const cheeseModifierPrice = hasExtraCheese ? 120 : 0;
  const dipModifierPrice = hasGarlicDip ? 60 : 0;
  const itemUnitPrice = basePizzaPrice + cheeseModifierPrice + dipModifierPrice;
  const itemTotalPrice = itemUnitPrice * quantity;
  const risottoPrice = 680;
  const subtotalPrice = itemTotalPrice + risottoPrice;
  const gstAmount = subtotalPrice * 0.05;
  const grandTotal = subtotalPrice + gstAmount;

  // Notification helper
  const triggerIosNotification = (msg: string) => {
    setIosNotification(msg);
    setTimeout(() => {
      setIosNotification(null);
    }, 2800);
  };

  // Step transition with realistic mobile delay & loader
  const goToStep = (targetStep: number, customMessage?: string) => {
    if (isScreenLoading) return;
    const nextIdx = (targetStep + steps.length) % steps.length;
    setIsScreenLoading(true);
    setLoadingMessage(customMessage || loadingMessages[nextIdx] || "Loading…");

    // Confetti celebration on Step 6
    if (nextIdx === 5) {
      setTimeout(() => {
        try {
          confetti({
            particleCount: 45,
            spread: 65,
            origin: { y: 0.62 },
            colors: ["#10b981", "#3b82f6", "#f59e0b", "#a855f7"],
          });
        } catch {}
      }, 550);
    }

    setTimeout(() => {
      setActiveStep(nextIdx);
      setIsScreenLoading(false);
    }, 580);
  };

  const handleNextStep = () => {
    goToStep(activeStep + 1);
  };

  const handlePrevStep = () => {
    goToStep(activeStep - 1);
  };

  return (
    <section
      id="customer-journey"
      className="relative w-full py-16 sm:py-24 bg-white/85 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800/80 scroll-mt-24 overflow-hidden"
    >
      {/* Radial Spotlight Aura behind the phone stage */}
      <div 
        aria-hidden="true" 
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_45%,rgba(16,185,129,0.07),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_45%,rgba(16,185,129,0.14),rgba(9,13,22,0))] pointer-events-none" 
      />
      <ParallaxFloatingOrb color="emerald" speed={55} className="-top-24 right-1/4 w-80 h-80" />
      <ParallaxFloatingOrb color="teal" speed={40} className="bottom-12 -left-20 w-80 h-80" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Frictionless Guest Experience</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          The Modern Customer Journey
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Say goodbye to faded paper menus and slow service. Give your guests an intuitive, app-less mobile experience.
        </p>

        {/* Toggle between Restaurant & Hotel */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mt-4">
          <button
            type="button"
            onClick={() => {
              setJourneyType("restaurant");
              goToStep(0, "Switching to Restaurant Table Dining…");
            }}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              journeyType === "restaurant"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Restaurant Table Dining
          </button>
          <button
            type="button"
            onClick={() => {
              setJourneyType("hotel");
              goToStep(0, "Switching to Hotel In-Room Dining…");
            }}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              journeyType === "hotel"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Hotel In-Room Dining
          </button>
        </div>
      </div>

      {/* Interactive Journey Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left: Step Selection List (Desktop Only, hidden on mobile) */}
        <div className="hidden lg:block lg:col-span-6 xl:col-span-7 space-y-3">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isCurrent = activeStep === idx;
            return (
              <div
                key={step.title}
                onClick={() => goToStep(idx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  isCurrent
                    ? "bg-emerald-500/10 border-emerald-500/40 shadow-md ring-1 ring-emerald-500/40 scale-[1.01]"
                    : "bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div
                  className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isCurrent
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <StepIcon className="h-5 w-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Step 0{idx + 1}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {step.title}
                      </h3>
                    </div>
                    {isCurrent && (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        Active Screen <ChevronRight className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Realistic iPhone Pro Device Frame */}
        <div className="w-full lg:col-span-6 xl:col-span-5 flex flex-col items-center justify-center">
          
          {/* Mobile-Only Step Navigation Bar (< lg) */}
          <div className="lg:hidden mb-5 w-full max-w-[325px] space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Step 0{activeStep + 1} of 0{steps.length}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {currentStep.title}
              </span>
            </div>

            {/* Horizontal Step Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {steps.map((step, idx) => {
                const isCurrent = activeStep === idx;
                const StepIcon = step.icon;
                return (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => goToStep(idx)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-1 ring-emerald-500 scale-[1.02]"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <StepIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>0{idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Realistic iPhone Pro Hardware Mockup Container (Theme-Aware Titanium Chassis) with Parallax Float */}
          <ParallaxFloat offset={16} className="relative group">
            {/* Outer Titanium Chassis: Silver/Natural Titanium in Light Mode, Space Black Titanium in Dark Mode */}
            <div className="relative w-[295px] sm:w-[325px] h-[620px] sm:h-[655px] rounded-[48px] sm:rounded-[50px] p-[8px] sm:p-[10px] bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 shadow-2xl shadow-slate-400/30 dark:shadow-black/70 border border-slate-300/80 dark:border-slate-600/60 ring-1 ring-slate-900/10 dark:ring-white/15 transition-colors">
              
              {/* Hardware Side Buttons */}
              <div className="absolute -left-[4.5px] top-[102px] w-[4px] h-[24px] bg-slate-300 dark:bg-slate-700 rounded-l-sm border-y border-l border-slate-400 dark:border-slate-600 shadow-xs" />
              <div className="absolute -left-[4.5px] top-[140px] w-[4px] h-[46px] bg-slate-300 dark:bg-slate-700 rounded-l-sm border-y border-l border-slate-400 dark:border-slate-600 shadow-xs" />
              <div className="absolute -left-[4.5px] top-[198px] w-[4px] h-[46px] bg-slate-300 dark:bg-slate-700 rounded-l-sm border-y border-l border-slate-400 dark:border-slate-600 shadow-xs" />
              <div className="absolute -right-[4.5px] top-[155px] w-[4px] h-[64px] bg-slate-300 dark:bg-slate-700 rounded-r-sm border-y border-r border-slate-400 dark:border-slate-600 shadow-xs" />

              {/* iPhone Inner Screen Display Bezel Outline */}
              <div className="relative w-full h-full rounded-[40px] bg-slate-50 dark:bg-slate-950 overflow-hidden border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between select-none shadow-inner transition-colors">
                
                {/* Screen Glass Corner Reflection Highlight */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-white/20 via-white/5 to-transparent dark:from-white/10 dark:via-white/2 pointer-events-none rounded-tr-[40px] z-30" />

                {/* 21st.dev Style Dynamic Island with Razor-Sharp Contrast Notch */}
                {activeStep === 4 ? (
                  // Live Activity: Kitchen Cooking
                  <motion.div
                    key="island-cooking"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, width: 180, height: 26 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="absolute top-2 left-1/2 -translate-x-1/2 z-40 bg-black text-white rounded-full flex items-center justify-between px-3 shadow-md border border-slate-800/80 ring-1 ring-black/40 text-[10px]"
                  >
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <Flame className="h-3 w-3 animate-pulse" />
                      <span>Station 2</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-emerald-400 font-semibold text-[10px]">
                      <span>{Math.floor(kdsSecondsRemaining / 60)}m left</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                  </motion.div>
                ) : activeStep === 5 ? (
                  // Live Activity: Payment Verified
                  <motion.div
                    key="island-paid"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, width: 165, height: 26 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="absolute top-2 left-1/2 -translate-x-1/2 z-40 bg-black text-white rounded-full flex items-center justify-between px-3 shadow-md border border-slate-800/80 ring-1 ring-black/40 text-[10px]"
                  >
                    <div className="flex items-center gap-1 text-emerald-400 font-bold">
                      <Check className="h-3 w-3 stroke-[3]" />
                      <span>Paid UPI</span>
                    </div>
                    <span className="font-mono text-white text-[10px] font-bold">
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </motion.div>
                ) : (
                  // Default High-Contrast Black Dynamic Island Pill
                  <motion.div
                    key="island-default"
                    animate={{ width: 96, height: 22 }}
                    className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40 bg-black rounded-full flex items-center justify-between px-2.5 shadow-md border border-slate-900/60 dark:border-slate-800/80 ring-1 ring-black/40"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-950 ring-1 ring-slate-800 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-indigo-900/80" />
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/90 animate-pulse" />
                  </motion.div>
                )}

                {/* Simulated iOS Notification Banner */}
                <AnimatePresence>
                  {iosNotification && (
                    <motion.div
                      initial={{ y: -45, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -45, opacity: 0 }}
                      className="absolute top-12 left-3 right-3 z-50 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs text-slate-900 dark:text-white"
                    >
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-[11px] block text-emerald-600 dark:text-emerald-400">DineFlow OS Alert</span>
                        <span className="text-[10px] text-slate-600 dark:text-slate-300 truncate block">{iosNotification}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* iOS Status Bar (Theme Adaptive Contrast) */}
                <div className="h-10 pt-2 px-6 flex items-center justify-between text-slate-900 dark:text-white text-[11px] font-semibold shrink-0 z-30 transition-colors">
                  <span className="font-medium tracking-tight">9:41</span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-end gap-[1.5px] h-2.5">
                      <div className="w-[2.5px] h-1 bg-slate-800 dark:bg-white rounded-[0.5px]" />
                      <div className="w-[2.5px] h-1.5 bg-slate-800 dark:bg-white rounded-[0.5px]" />
                      <div className="w-[2.5px] h-2 bg-slate-800 dark:bg-white rounded-[0.5px]" />
                      <div className="w-[2.5px] h-2.5 bg-slate-800 dark:bg-white rounded-[0.5px]" />
                    </div>
                    <Wifi className="h-3 w-3 stroke-[2.5] stroke-slate-800 dark:stroke-white" />
                    <div className="w-5 h-2.5 rounded-[3px] border border-slate-800/80 dark:border-white/70 p-[1px] flex items-center">
                      <div className="h-full w-3.5 bg-emerald-500 rounded-[1.5px]" />
                    </div>
                  </div>
                </div>

                {/* Top PWA / Safari Loading Bar */}
                <div className="h-[2.5px] w-full bg-slate-200 dark:bg-slate-900 overflow-hidden relative z-40 transition-colors">
                  {isScreenLoading && (
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "0%" }}
                      transition={{ duration: 0.55, ease: "easeInOut" }}
                      className="h-full w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-[0_0_8px_#10b981]"
                    />
                  )}
                </div>

                {/* Screen Sub-Header / Location Info */}
                <div className="px-3.5 py-1.5 bg-white/95 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] z-20 transition-colors">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {journeyType === "restaurant" ? "Table 04" : "Room 302"}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[100px]">
                      {journeyType === "restaurant" ? "Grand Bistro" : "Grand Palace"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevStep();
                      }}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                      title="Previous Step"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400/90 px-1 font-semibold">
                      {activeStep + 1}/6
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextStep();
                      }}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                      title="Next Step"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Dynamic Screen Content Body (DineFlow Interactive App Experience) */}
                <div className="flex-1 overflow-y-auto px-3.5 py-2.5 flex flex-col justify-between text-slate-900 dark:text-white text-xs relative z-10 transition-colors">
                  
                  {/* Contextual Hospitality Micro-Loader Overlay */}
                  <AnimatePresence>
                    {isScreenLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 bg-white/90 dark:bg-slate-950/85 backdrop-blur-xs z-30 flex flex-col items-center justify-center p-5 text-center select-none"
                      >
                        <div className="relative w-14 h-14 flex items-center justify-center mb-3">
                          <div className="absolute inset-0 rounded-full bg-emerald-500/15 animate-ping" />
                          <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin flex items-center justify-center">
                            <UtensilsCrossed className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white tracking-wide leading-snug">
                          {loadingMessage}
                        </p>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400/90 font-mono mt-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          DineFlow OS • Fast Connect
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ==================== RESTAURANT JOURNEY SCREENS ==================== */}
                  {journeyType === "restaurant" ? (
                    <>
                      {/* STEP 1: Scan Table QR */}
                      {activeStep === 0 && (
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div className="text-center space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              Camera Viewfinder
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Scan Table QR Stand</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Instant digital ordering, zero app install
                            </p>
                          </div>

                          {/* Interactive QR Stand Target */}
                          <div 
                            onClick={handleNextStep}
                            className="relative my-auto mx-auto w-44 h-44 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-emerald-500/10 group/qr"
                          >
                            {/* Scanning Laser Line */}
                            <div className="absolute inset-x-2 top-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_10px_#10b981] animate-pulse" />
                            
                            {/* Four Corner Finder Brackets */}
                            <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-emerald-500 rounded-tl-sm" />
                            <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-emerald-500 rounded-tr-sm" />
                            <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-emerald-500 rounded-bl-sm" />
                            <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-emerald-500 rounded-br-sm" />

                            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white text-slate-900 dark:text-slate-950 mb-1.5 group-hover/qr:scale-105 transition-transform border border-slate-200 dark:border-transparent">
                              <QrCode className="h-16 w-16" />
                            </div>
                            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              TABLE 04 • SCAN
                            </span>
                          </div>

                          {/* Clickable Mobile CTA */}
                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                          >
                            <QrCode className="h-4 w-4" />
                            <span>Tap to Scan Table 04</span>
                            <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                          </button>
                        </div>
                      )}

                      {/* STEP 2: Browse Menu */}
                      {activeStep === 1 && (
                        <div className="flex-1 flex flex-col justify-between py-1 space-y-2">
                          {/* Search & Interactive Category Tabs */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 shadow-2xs">
                              <Search className="h-3.5 w-3.5 text-slate-400" />
                              <span className="truncate">Search margherita, pasta...</span>
                            </div>
                            
                            {/* Clickable Category Filter Tabs */}
                            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
                              <button
                                type="button"
                                onClick={() => setSelectedCategory("popular")}
                                className={`px-2 py-0.5 rounded-full font-bold shrink-0 transition-colors cursor-pointer ${
                                  selectedCategory === "popular"
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                                }`}
                              >
                                🔥 Popular
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedCategory("pizza")}
                                className={`px-2 py-0.5 rounded-full font-bold shrink-0 transition-colors cursor-pointer ${
                                  selectedCategory === "pizza"
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                                }`}
                              >
                                🍕 Pizza
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedCategory("pasta")}
                                className={`px-2 py-0.5 rounded-full font-bold shrink-0 transition-colors cursor-pointer ${
                                  selectedCategory === "pasta"
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                                }`}
                              >
                                🍝 Pasta
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedCategory("drinks")}
                                className={`px-2 py-0.5 rounded-full font-bold shrink-0 transition-colors cursor-pointer ${
                                  selectedCategory === "drinks"
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                                }`}
                              >
                                🍹 Drinks
                              </button>
                            </div>
                          </div>

                          {/* Dynamic Menu Cards Based on Selected Category */}
                          <div className="space-y-2 flex-1 my-1">
                            {/* Dish 1: Margherita */}
                            <div 
                              onClick={handleNextStep}
                              className="p-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-emerald-500/30 hover:border-emerald-500 active:scale-[0.99] transition-all cursor-pointer flex gap-2.5 items-center group/item shadow-xs"
                            >
                              <div className="h-14 w-14 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center shrink-0">
                                <span className="text-xl">🍕</span>
                                <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400">WOOD FIRE</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Vegetarian" />
                                  <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">Margherita Pizza</h5>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Bufala mozzarella, basil</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">₹550</span>
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold group-hover/item:bg-emerald-600 group-hover/item:text-white transition-colors border border-emerald-200 dark:border-transparent">
                                    + Add
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Dish 2: Changes depending on Category */}
                            <div 
                              onClick={handleNextStep}
                              className="p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-slate-700 active:scale-[0.99] transition-all cursor-pointer flex gap-2.5 items-center group/item2 shadow-xs"
                            >
                              <div className="h-14 w-14 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center shrink-0">
                                <span className="text-xl">
                                  {selectedCategory === "drinks" ? "🍹" : selectedCategory === "pizza" ? "🧀" : "🍝"}
                                </span>
                                <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400">
                                  {selectedCategory === "drinks" ? "SPRITZ" : selectedCategory === "pizza" ? "FOUR CHEESE" : "TRUFFLE"}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                  <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                    {selectedCategory === "drinks" 
                                      ? "Blood Orange Spritz"
                                      : selectedCategory === "pizza"
                                      ? "Quattro Formaggi"
                                      : "Wild Mushroom Risotto"}
                                  </h5>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                  {selectedCategory === "drinks"
                                    ? "Fresh citrus, sparkling tonic"
                                    : selectedCategory === "pizza"
                                    ? "Gorgonzola, parmesan, taleggio"
                                    : "Arborio rice, porcini, parmesan"}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">
                                    {selectedCategory === "drinks" ? "₹280" : "₹680"}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold group-hover/item2:bg-emerald-600 group-hover/item2:text-white transition-colors border border-slate-200 dark:border-transparent">
                                    + Add
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Clickable Mobile CTA */}
                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-between shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                          >
                            <span>Customize Margherita</span>
                            <span className="flex items-center gap-1">
                              ₹550 <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          </button>
                        </div>
                      )}

                      {/* STEP 3: Add to Cart (Item Customizer) */}
                      {activeStep === 2 && (
                        <div className="flex-1 flex flex-col justify-between py-1 space-y-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              Item Customizer
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Wood-Fired Margherita</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Select live modifiers & kitchen instructions</p>
                          </div>

                          {/* Customizer Drawer Box with Real Interactive Controls */}
                          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 flex-1 my-1 shadow-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                Interactive Toppings
                              </span>
                              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">Click to toggle</span>
                            </div>
                            
                            {/* Interactive Modifier Checkbox 1 */}
                            <div 
                              onClick={() => setHasExtraCheese(!hasExtraCheese)}
                              className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                                hasExtraCheese 
                                  ? "bg-emerald-50/80 dark:bg-slate-800/90 border-emerald-500/50" 
                                  : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                                  hasExtraCheese ? "bg-emerald-600 text-white" : "border border-slate-400 dark:border-slate-600"
                                }`}>
                                  {hasExtraCheese && <Check className="h-3 w-3 stroke-[3]" />}
                                </div>
                                <span className="text-[11px] font-medium text-slate-900 dark:text-white">Extra Bufala Mozzarella</span>
                              </div>
                              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">+₹120</span>
                            </div>

                            {/* Interactive Modifier Checkbox 2 */}
                            <div 
                              onClick={() => setHasGarlicDip(!hasGarlicDip)}
                              className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                                hasGarlicDip 
                                  ? "bg-emerald-50/80 dark:bg-slate-800/90 border-emerald-500/50" 
                                  : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                                  hasGarlicDip ? "bg-emerald-600 text-white" : "border border-slate-400 dark:border-slate-600"
                                }`}>
                                  {hasGarlicDip && <Check className="h-3 w-3 stroke-[3]" />}
                                </div>
                                <span className="text-[11px] font-medium text-slate-900 dark:text-white">Fresh Garlic Basil Dip</span>
                              </div>
                              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">+₹60</span>
                            </div>

                            {/* Interactive Quantity Stepper */}
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">Portions</span>
                              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (quantity > 1) setQuantity(quantity - 1);
                                  }}
                                  className="w-5 h-5 rounded flex items-center justify-center bg-white hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white cursor-pointer active:scale-95 border border-slate-200 dark:border-transparent shadow-2xs"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="font-mono font-bold text-xs text-slate-900 dark:text-white px-1">
                                  {quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (quantity < 9) setQuantity(quantity + 1);
                                  }}
                                  className="w-5 h-5 rounded flex items-center justify-center bg-white hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white cursor-pointer active:scale-95 border border-slate-200 dark:border-transparent shadow-2xs"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Clickable Mobile CTA */}
                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-between shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <ShoppingBag className="h-3.5 w-3.5" />
                              <span>Add to Order ({quantity} Item{quantity > 1 ? "s" : ""})</span>
                            </span>
                            <span className="font-extrabold flex items-center gap-1">
                              ₹{itemTotalPrice} <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          </button>
                        </div>
                      )}

                      {/* STEP 4: Place Order (Checkout Summary) */}
                      {activeStep === 3 && (
                        <div className="flex-1 flex flex-col justify-between py-1 space-y-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              Checkout Summary
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Order Review • Table 04</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Dispatched directly to Kitchen Display</p>
                          </div>

                          {/* Order Billing Card with Live Calculations */}
                          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 flex-1 my-1 shadow-xs">
                            <div className="flex justify-between items-start text-[11px]">
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white">{quantity}x Margherita Pizza</span>
                                <p className="text-[9px] text-slate-500 dark:text-slate-400">
                                  {hasExtraCheese ? "Extra Bufala" : ""}
                                  {hasExtraCheese && hasGarlicDip ? ", " : ""}
                                  {hasGarlicDip ? "Garlic Dip" : ""}
                                  {!hasExtraCheese && !hasGarlicDip ? "Standard Crust" : ""}
                                </p>
                              </div>
                              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">₹{itemTotalPrice.toFixed(2)}</span>
                            </div>
                            
                            <div className="flex justify-between items-start text-[11px]">
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white">1x Wild Mushroom Risotto</span>
                                <p className="text-[9px] text-slate-500 dark:text-slate-400">Chef Special</p>
                              </div>
                              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">₹680.00</span>
                            </div>

                            {/* Payment Method Selector */}
                            <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
                              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">
                                Payment Method
                              </span>
                              <div className="grid grid-cols-3 gap-1">
                                <button
                                  type="button"
                                  onClick={() => setPaymentMethod("upi")}
                                  className={`py-1 px-1.5 rounded-md text-[9px] font-bold border transition-colors cursor-pointer text-center ${
                                    paymentMethod === "upi"
                                      ? "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                                  }`}
                                >
                                  ⚡ UPI Fast
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPaymentMethod("card")}
                                  className={`py-1 px-1.5 rounded-md text-[9px] font-bold border transition-colors cursor-pointer text-center ${
                                    paymentMethod === "card"
                                      ? "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                                  }`}
                                >
                                  💳 Card
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPaymentMethod("cash")}
                                  className={`py-1 px-1.5 rounded-md text-[9px] font-bold border transition-colors cursor-pointer text-center ${
                                    paymentMethod === "cash"
                                      ? "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                                  }`}
                                >
                                  💵 Cash
                                </button>
                              </div>
                            </div>

                            {/* Subtotal & Taxes */}
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5 space-y-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                              <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₹{subtotalPrice.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>GST (5%)</span>
                                <span>₹{gstAmount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-bold text-slate-900 dark:text-white text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                                <span>Total Amount</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-mono">₹{grandTotal.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Clickable Mobile CTA */}
                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer animate-pulse"
                          >
                            <Send className="h-4 w-4" />
                            <span>Confirm & Fire to Kitchen</span>
                            <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                          </button>
                        </div>
                      )}

                      {/* STEP 5: Track Order (Live Kitchen KDS) */}
                      {activeStep === 4 && (
                        <div className="flex-1 flex flex-col justify-between py-1 space-y-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                              Live Kitchen Display
                            </span>
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Order #DF-904</h4>
                              <Badge variant="warning" size="sm" className="text-[9px]">
                                🔥 Cooking
                              </Badge>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Estimated Ready: ~{Math.floor(kdsSecondsRemaining / 60)}m {kdsSecondsRemaining % 60}s
                            </p>
                          </div>

                          {/* Timeline Progress */}
                          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 flex-1 my-1 shadow-xs">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                                <span>Station 2: Pizza Oven</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">75% Complete</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full w-3/4 animate-pulse rounded-full" />
                              </div>
                            </div>

                            <div className="space-y-1.5 text-[10px]">
                              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                                <CheckCircle2 className="h-3 w-3 shrink-0" />
                                <span>Order Received by Kitchen (19:42)</span>
                              </div>
                              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                                <CheckCircle2 className="h-3 w-3 shrink-0" />
                                <span>Dough Hand-Stretched & Sauced</span>
                              </div>
                              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
                                <Clock className="h-3 w-3 shrink-0 animate-spin" />
                                <span>Baking in Wood-Fire Oven (450°C)</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                                <div className="h-3 w-3 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                                <span>Plating & Table Service</span>
                              </div>
                            </div>

                            {/* Interactive Ping Server Button */}
                            <button
                              type="button"
                              onClick={() => triggerIosNotification("Server notified for Table 04 water / service request")}
                              className="w-full py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                            >
                              <Volume2 className="h-3 w-3 text-amber-500" />
                              <span>Ping Floor Server (Table 04)</span>
                            </button>
                          </div>

                          {/* Clickable Mobile CTA */}
                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98] border border-slate-700 text-emerald-400 font-bold text-xs flex items-center justify-between shadow-md transition-all cursor-pointer"
                          >
                            <span>Ready to Settle Bill?</span>
                            <span className="flex items-center gap-1 text-white">
                              Pay & Receipt <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          </button>
                        </div>
                      )}

                      {/* STEP 6: Digital Receipt (WhatsApp & UPI Tax Invoice) */}
                      {activeStep === 5 && (
                        <div className="flex-1 flex flex-col justify-between py-1 space-y-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              Payment & Tax Invoice
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">WhatsApp Digital Receipt</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Paperless GST compliant billing</p>
                          </div>

                          {/* WhatsApp Invoice Preview Bubble */}
                          <div className="p-3 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-500/30 space-y-2 flex-1 my-1 shadow-xs">
                            <div className="flex items-center gap-2 pb-1 border-b border-emerald-200 dark:border-emerald-500/20">
                              <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                                DF
                              </div>
                              <div>
                                <span className="font-bold text-[11px] text-slate-900 dark:text-white">Grand Bistro Bot</span>
                                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block font-medium">Verified Business</span>
                              </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-[10px] shadow-2xs">
                              <p className="text-slate-700 dark:text-slate-300">
                                Thank you for dining with us! Here is your GST Invoice:
                              </p>
                              <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                Inv: #DF-904 • ₹{grandTotal.toFixed(2)} (Paid)
                              </div>
                              <button
                                type="button"
                                onClick={() => triggerIosNotification("tax-invoice-df904.pdf downloaded to Files")}
                                className="w-full flex items-center justify-between text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white pt-1 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-md cursor-pointer transition-colors border border-slate-200 dark:border-transparent"
                              >
                                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                  <FileText className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                  <span>tax-invoice-df904.pdf</span>
                                </span>
                                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">Download</span>
                              </button>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-emerald-700 dark:text-emerald-300 font-medium px-1">
                              <span className="flex items-center gap-1">
                                <ShieldCheck className="h-3.5 w-3.5" /> 100% Paperless
                              </span>
                              <span>Earned 148 Points ⭐</span>
                            </div>
                          </div>

                          {/* Clickable Mobile CTA */}
                          <button
                            type="button"
                            onClick={() => goToStep(0, "Resetting interactive customer journey…")}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Restart Experience</span>
                            <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    /* ==================== HOTEL SUITE JOURNEY SCREENS ==================== */
                    <>
                      {/* HOTEL STEP 1: Scan Room QR */}
                      {activeStep === 0 && (
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div className="text-center space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              Hotel Room Service
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Scan Room 302 Stand</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Keycard / bedside QR instantly pairs suite folio
                            </p>
                          </div>

                          <div 
                            onClick={handleNextStep}
                            className="relative my-auto mx-auto w-44 h-44 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-emerald-500/10 group/hotel"
                          >
                            <div className="absolute inset-x-2 top-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_10px_#10b981] animate-pulse" />
                            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white text-slate-900 dark:text-slate-950 mb-1.5 group-hotel:scale-105 transition-transform border border-slate-200 dark:border-transparent">
                              <Hotel className="h-16 w-16 text-slate-900" />
                            </div>
                            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              SUITE 302 • FOLIO READY
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                          >
                            <Hotel className="h-4 w-4" />
                            <span>Scan Room 302 QR</span>
                            <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                          </button>
                        </div>
                      )}

                      {/* HOTEL STEP 2: Browse In-Room Dining */}
                      {activeStep === 1 && (
                        <div className="flex-1 flex flex-col justify-between py-1 space-y-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              24/7 Room Dining
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Curated Suite Menu</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Breakfast, midnight bites & beverage lists</p>
                          </div>

                          <div className="space-y-2 flex-1 my-1">
                            <div 
                              onClick={handleNextStep}
                              className="p-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-emerald-500/30 hover:border-emerald-500 active:scale-[0.99] transition-all cursor-pointer flex gap-2.5 items-center group/item shadow-xs"
                            >
                              <div className="h-14 w-14 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center shrink-0">
                                <span className="text-xl">🥪</span>
                                <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400">CLUB</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">Gourmet Club Sandwich</h5>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Smoked chicken, avocado, fries</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">₹480</span>
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold group-hover/item:bg-emerald-600 group-hover/item:text-white transition-colors border border-emerald-200 dark:border-transparent">
                                    + Add
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div 
                              onClick={handleNextStep}
                              className="p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-slate-700 active:scale-[0.99] transition-all cursor-pointer flex gap-2.5 items-center shadow-xs"
                            >
                              <div className="h-14 w-14 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center shrink-0">
                                <span className="text-xl">☕</span>
                                <span className="text-[8px] font-bold text-indigo-600 dark:text-indigo-400">BREW</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">Artisan Cappuccino & Croissant</h5>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">French butter croissant, espresso</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">₹320</span>
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold border border-slate-200 dark:border-transparent">
                                    + Add
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-between shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                          >
                            <span>Add Club Sandwich</span>
                            <span className="flex items-center gap-1">
                              ₹480 <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          </button>
                        </div>
                      )}

                      {/* HOTEL STEP 3: Place Room Order */}
                      {activeStep === 2 && (
                        <div className="flex-1 flex flex-col justify-between py-1 space-y-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              Delivery Preferences
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Suite 302 Delivery</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Instant preparation or morning schedule</p>
                          </div>

                          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 flex-1 my-1 shadow-xs">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/30">
                              <span className="text-[11px] text-slate-900 dark:text-white font-medium">⚡ Deliver Asap (~20m)</span>
                              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 text-[10px] text-slate-600 dark:text-slate-400">
                              Guest Note: "Please leave on table near balcony."
                            </div>
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs font-bold">
                              <span>Total to Room Folio:</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-mono">₹800.00</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                          >
                            <Send className="h-4 w-4" />
                            <span>Confirm Room 302 Order</span>
                            <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                          </button>
                        </div>
                      )}

                      {/* HOTEL STEP 4: Kitchen Routing */}
                      {activeStep === 3 && (
                        <div className="flex-1 flex flex-col justify-between py-1 space-y-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              Pantry Dispatch
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Dispatched to Pantry Line</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Direct KDS audio chime & ticket print</p>
                          </div>

                          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 flex-1 my-1 shadow-xs">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                              <Bell className="h-4 w-4 animate-bounce" />
                              <span>Pantry Station Acknowledged</span>
                            </div>
                            <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                              Order dispatched to Floor 3 service elevator station. Chef is assembling hot tray with insulated covers.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-between shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                          >
                            <span>Tray Preparation</span>
                            <span className="flex items-center gap-1 font-bold">
                              Track Delivery <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          </button>
                        </div>
                      )}

                      {/* HOTEL STEP 5: Tray Delivery */}
                      {activeStep === 4 && (
                        <div className="flex-1 flex flex-col justify-between py-1 space-y-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                              Door Delivery
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Tray En Route to Suite</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Server is arriving at Door 302</p>
                          </div>

                          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 flex-1 my-1 text-center flex flex-col justify-center shadow-xs">
                            <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-1">
                              <Bell className="h-6 w-6" />
                            </div>
                            <span className="font-bold text-xs text-slate-900 dark:text-white">Doorbell Alert</span>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              Room service server has arrived with your fresh tray.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] border border-slate-700 text-emerald-400 font-bold text-xs flex items-center justify-between shadow-md transition-all cursor-pointer"
                          >
                            <span>Tray Received</span>
                            <span className="flex items-center gap-1 text-white">
                              Check Folio <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          </button>
                        </div>
                      )}

                      {/* HOTEL STEP 6: Folio Settlement */}
                      {activeStep === 5 && (
                        <div className="flex-1 flex flex-col justify-between py-1 space-y-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              Check-out Billing
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Room Folio Settled</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Automatic room ledger posting</p>
                          </div>

                          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 flex-1 my-1 shadow-xs">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-500 dark:text-slate-400">Suite Folio</span>
                              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">#FOLIO-302</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-500 dark:text-slate-400">In-Room Dining Total</span>
                              <span className="font-mono font-bold text-slate-900 dark:text-white">₹840.00</span>
                            </div>
                            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[10px] text-emerald-700 dark:text-emerald-400">
                              ✓ Added to master invoice for express check-out
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => goToStep(0, "Resetting interactive customer journey…")}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Restart Experience</span>
                            <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Bottom Screen Indicator Bar (iOS Home Bar) */}
                <div className="h-6 pb-2 flex items-center justify-center shrink-0 z-30">
                  <div 
                    onClick={handleNextStep}
                    className="w-28 h-1 bg-slate-400/60 hover:bg-slate-500 dark:bg-white/30 dark:hover:bg-white/50 rounded-full transition-colors cursor-pointer"
                    title="Tap to advance"
                  />
                </div>
              </div>
            </div>
          </ParallaxFloat>

          {/* Interactive Navigation Hint */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 font-medium">
              <Smartphone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Tap the mobile screen or select steps on the left to navigate</span>
            </p>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
