"use client";

import * as React from "react";
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
  Battery,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  Search,
  FileText,
  Star,
  Flame,
  RotateCcw,
  Check,
  CreditCard,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

export function LandingCustomerJourney() {
  const [journeyType, setJourneyType] = React.useState<JourneyType>("restaurant");
  const [activeStep, setActiveStep] = React.useState(0);

  const steps = journeyType === "restaurant" ? RESTAURANT_STEPS : HOTEL_STEPS;
  const currentStep = steps[activeStep] || steps[0];

  const handleNextStep = () => {
    setActiveStep((prev) => (prev + 1) % steps.length);
  };

  const handlePrevStep = () => {
    setActiveStep((prev) => (prev - 1 + steps.length) % steps.length);
  };

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
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
              setActiveStep(0);
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
              setActiveStep(0);
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
        {/* Left: Step Selection List */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-3">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isCurrent = activeStep === idx;
            return (
              <div
                key={step.title}
                onClick={() => setActiveStep(idx)}
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
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-center justify-center">
          {/* Realistic iPhone Pro Hardware Mockup Container */}
          <div className="relative group">
            {/* Outer Titanium Chassis */}
            <div className="relative w-[305px] sm:w-[325px] h-[635px] sm:h-[655px] rounded-[50px] p-[10px] bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-2xl shadow-black/60 border border-slate-600/60 ring-1 ring-white/15">
              
              {/* Hardware Side Buttons */}
              {/* Left Side: Action Button */}
              <div className="absolute -left-[4.5px] top-[102px] w-[4px] h-[24px] bg-slate-700 rounded-l-sm border-y border-l border-slate-600 shadow-xs" />
              {/* Left Side: Volume Up */}
              <div className="absolute -left-[4.5px] top-[140px] w-[4px] h-[46px] bg-slate-700 rounded-l-sm border-y border-l border-slate-600 shadow-xs" />
              {/* Left Side: Volume Down */}
              <div className="absolute -left-[4.5px] top-[198px] w-[4px] h-[46px] bg-slate-700 rounded-l-sm border-y border-l border-slate-600 shadow-xs" />
              {/* Right Side: Power / Side Button */}
              <div className="absolute -right-[4.5px] top-[155px] w-[4px] h-[64px] bg-slate-700 rounded-r-sm border-y border-r border-slate-600 shadow-xs" />

              {/* iPhone Inner Screen Display Bezel */}
              <div className="relative w-full h-full rounded-[40px] bg-slate-950 overflow-hidden border border-slate-900 flex flex-col justify-between select-none shadow-inner">
                
                {/* Screen Glass Corner Reflection Highlight */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-white/10 via-white/2 to-transparent pointer-events-none rounded-tr-[40px] z-30" />

                {/* Dynamic Island Pill */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40 w-24 h-[22px] bg-black rounded-full flex items-center justify-between px-2.5 shadow-md border border-slate-900/60">
                  {/* Camera lens */}
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-950 ring-1 ring-slate-800 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-indigo-900/80" />
                  </div>
                  {/* Subtle sensor / audio activity dot */}
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/90 animate-pulse" />
                </div>

                {/* iOS Status Bar */}
                <div className="h-10 pt-2 px-6 flex items-center justify-between text-white text-[11px] font-semibold shrink-0 z-30">
                  <span className="font-medium tracking-tight">9:41</span>
                  <div className="flex items-center gap-1.5 text-white/90">
                    <div className="flex items-end gap-[1.5px] h-2.5">
                      <div className="w-[2.5px] h-1 bg-white rounded-[0.5px]" />
                      <div className="w-[2.5px] h-1.5 bg-white rounded-[0.5px]" />
                      <div className="w-[2.5px] h-2 bg-white rounded-[0.5px]" />
                      <div className="w-[2.5px] h-2.5 bg-white rounded-[0.5px]" />
                    </div>
                    <Wifi className="h-3 w-3 stroke-[2.5]" />
                    <div className="w-5 h-2.5 rounded-[3px] border border-white/70 p-[1px] flex items-center">
                      <div className="h-full w-3.5 bg-emerald-400 rounded-[1.5px]" />
                    </div>
                  </div>
                </div>

                {/* Screen Sub-Header / Location Info */}
                <div className="px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px] z-20">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-mono font-bold text-emerald-400">
                      {journeyType === "restaurant" ? "Table 04" : "Room 302"}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300 font-medium truncate max-w-[100px]">
                      {journeyType === "restaurant" ? "Grand Bistro" : "Grand Palace"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevStep();
                      }}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Previous Step"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-emerald-400/90 px-1 font-semibold">
                      {activeStep + 1}/6
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextStep();
                      }}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Next Step"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Dynamic Screen Content Body (DineFlow Interactive App Experience) */}
                <div className="flex-1 overflow-y-auto px-3.5 py-2.5 flex flex-col justify-between text-white text-xs relative z-10">
                  
                  {/* ==================== RESTAURANT JOURNEY SCREENS ==================== */}
                  {journeyType === "restaurant" ? (
                    <>
                      {/* STEP 1: Scan Table QR */}
                      {activeStep === 0 && (
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div className="text-center space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                              Camera Viewfinder
                            </span>
                            <h4 className="text-sm font-extrabold text-white">Scan Table QR Stand</h4>
                            <p className="text-[11px] text-slate-400">
                              Instant digital ordering, zero app install
                            </p>
                          </div>

                          {/* Interactive QR Stand Target */}
                          <div 
                            onClick={handleNextStep}
                            className="relative my-auto mx-auto w-44 h-44 rounded-2xl bg-slate-900 border-2 border-emerald-500/40 p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-400 hover:scale-[1.02] transition-all shadow-lg shadow-emerald-500/10 group/qr"
                          >
                            {/* Scanning Laser Line */}
                            <div className="absolute inset-x-2 top-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_#10b981] animate-pulse" />
                            
                            {/* Four Corner Finder Brackets */}
                            <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-emerald-400 rounded-tl-sm" />
                            <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-emerald-400 rounded-tr-sm" />
                            <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-emerald-400 rounded-bl-sm" />
                            <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-emerald-400 rounded-br-sm" />

                            <div className="p-2.5 rounded-xl bg-white text-slate-950 mb-1.5 group-hover/qr:scale-105 transition-transform">
                              <QrCode className="h-16 w-16" />
                            </div>
                            <span className="text-[10px] font-mono font-bold text-emerald-400">
                              TABLE 04 • SCAN
                            </span>
                          </div>

                          {/* Clickable Mobile CTA */}
                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
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
                          {/* Search & Categories */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                              <Search className="h-3.5 w-3.5" />
                              <span className="truncate">Search margherita, pasta...</span>
                            </div>
                            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold shrink-0">
                                🔥 Popular
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 shrink-0">
                                🍕 Pizza
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 shrink-0">
                                🍝 Pasta
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 shrink-0">
                                🍹 Drinks
                              </span>
                            </div>
                          </div>

                          {/* Menu Cards */}
                          <div className="space-y-2 flex-1 my-1">
                            {/* Item 1 */}
                            <div 
                              onClick={handleNextStep}
                              className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500/70 transition-all cursor-pointer flex gap-2.5 items-center group/item"
                            >
                              <div className="h-14 w-14 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center shrink-0">
                                <span className="text-xl">🍕</span>
                                <span className="text-[8px] font-bold text-amber-400">WOOD FIRE</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Vegetarian" />
                                  <h5 className="font-bold text-xs text-white truncate">Margherita Pizza</h5>
                                </div>
                                <p className="text-[10px] text-slate-400 truncate">Bufala mozzarella, basil</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="font-mono font-bold text-emerald-400 text-xs">₹550</span>
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold group-hover/item:bg-emerald-500 group-hover/item:text-slate-950 transition-colors">
                                    + Add
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Item 2 */}
                            <div 
                              onClick={handleNextStep}
                              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex gap-2.5 items-center"
                            >
                              <div className="h-14 w-14 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center shrink-0">
                                <span className="text-xl">🍝</span>
                                <span className="text-[8px] font-bold text-emerald-400">TRUFFLE</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                  <h5 className="font-bold text-xs text-white truncate">Wild Mushroom Risotto</h5>
                                </div>
                                <p className="text-[10px] text-slate-400 truncate">Arborio rice, parmesan</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="font-mono font-bold text-slate-300 text-xs">₹680</span>
                                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold">
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
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs flex items-center justify-between shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                          >
                            <span>Customize Margherita</span>
                            <span className="flex items-center gap-1">
                              ₹550 <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          </button>
                        </div>
                      )}

                      {/* STEP 3: Add to Cart (Customizer Sheet) */}
                      {activeStep === 2 && (
                        <div className="flex-1 flex flex-col justify-between py-1 space-y-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                              Item Customizer
                            </span>
                            <h4 className="text-sm font-extrabold text-white">Wood-Fired Margherita</h4>
                            <p className="text-[11px] text-slate-400">Customize toppings & kitchen instructions</p>
                          </div>

                          {/* Customizer Drawer Box */}
                          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 flex-1 my-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                              Add Modifiers
                            </span>
                            
                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-emerald-500/30">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center text-slate-950">
                                  <Check className="h-3 w-3 stroke-[3]" />
                                </div>
                                <span className="text-[11px] font-medium text-white">Extra Bufala Mozzarella</span>
                              </div>
                              <span className="font-mono text-emerald-400 text-[11px] font-bold">+₹120</span>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700/60">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center text-slate-950">
                                  <Check className="h-3 w-3 stroke-[3]" />
                                </div>
                                <span className="text-[11px] font-medium text-white">Fresh Garlic Basil Dip</span>
                              </div>
                              <span className="font-mono text-emerald-400 text-[11px] font-bold">+₹60</span>
                            </div>

                            <div className="pt-1">
                              <span className="text-[10px] text-slate-400 block mb-1">Kitchen Note</span>
                              <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-emerald-400 font-mono italic">
                                "Extra crispy crust, please!"
                              </div>
                            </div>
                          </div>

                          {/* Clickable Mobile CTA */}
                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs flex items-center justify-between shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <ShoppingBag className="h-3.5 w-3.5" />
                              <span>Add to Order (1 Item)</span>
                            </span>
                            <span className="font-extrabold flex items-center gap-1">
                              ₹730 <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          </button>
                        </div>
                      )}

                      {/* STEP 4: Place Order */}
                      {activeStep === 3 && (
                        <div className="flex-1 flex flex-col justify-between py-1 space-y-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                              Checkout Summary
                            </span>
                            <h4 className="text-sm font-extrabold text-white">Order Review • Table 04</h4>
                            <p className="text-[11px] text-slate-400">Dispatched directly to Kitchen Display</p>
                          </div>

                          {/* Order Billing Card */}
                          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 flex-1 my-1">
                            <div className="flex justify-between items-start text-[11px]">
                              <div>
                                <span className="font-bold text-white">1x Margherita (Custom)</span>
                                <p className="text-[9px] text-slate-400">Extra Mozzarella, Basil Dip</p>
                              </div>
                              <span className="font-mono font-bold text-slate-200">₹730.00</span>
                            </div>
                            <div className="flex justify-between items-start text-[11px]">
                              <div>
                                <span className="font-bold text-white">1x Wild Mushroom Risotto</span>
                                <p className="text-[9px] text-slate-400">Chef Special</p>
                              </div>
                              <span className="font-mono font-bold text-slate-200">₹680.00</span>
                            </div>

                            <div className="border-t border-slate-800 pt-2 space-y-1 text-[10px] text-slate-400">
                              <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₹1,410.00</span>
                              </div>
                              <div className="flex justify-between">
                                <span>GST (5%)</span>
                                <span>₹70.50</span>
                              </div>
                              <div className="flex justify-between font-bold text-white text-xs pt-1 border-t border-slate-800">
                                <span>Total Amount</span>
                                <span className="text-emerald-400 font-mono">₹1,480.50</span>
                              </div>
                            </div>
                          </div>

                          {/* Clickable Mobile CTA */}
                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer animate-pulse"
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
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                              Live Kitchen Display
                            </span>
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-extrabold text-white">Order #DF-904</h4>
                              <Badge variant="warning" size="sm" className="text-[9px]">
                                🔥 Cooking
                              </Badge>
                            </div>
                            <p className="text-[11px] text-slate-400">Estimated Ready: ~6 mins</p>
                          </div>

                          {/* Timeline Progress */}
                          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex-1 my-1">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] text-slate-400">
                                <span>Station 2: Pizza Oven</span>
                                <span className="text-emerald-400 font-bold">75% Complete</span>
                              </div>
                              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full w-3/4 animate-pulse rounded-full" />
                              </div>
                            </div>

                            <div className="space-y-2 text-[11px]">
                              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                <span>Order Received by Kitchen</span>
                              </div>
                              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                <span>Dough Tossed & Hand-Stretched</span>
                              </div>
                              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                                <Clock className="h-3.5 w-3.5 shrink-0 animate-spin" />
                                <span>Baking in Wood-Fire Oven (450°C)</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-500">
                                <div className="h-3.5 w-3.5 rounded-full border border-slate-700 shrink-0" />
                                <span>Garnish & Table Service</span>
                              </div>
                            </div>
                          </div>

                          {/* Clickable Mobile CTA */}
                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] border border-slate-700 text-emerald-400 font-bold text-xs flex items-center justify-between shadow-md transition-all cursor-pointer"
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
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                              Payment & Tax Invoice
                            </span>
                            <h4 className="text-sm font-extrabold text-white">WhatsApp Digital Receipt</h4>
                            <p className="text-[11px] text-slate-400">Paperless GST compliant billing</p>
                          </div>

                          {/* WhatsApp Invoice Preview Bubble */}
                          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2 flex-1 my-1">
                            <div className="flex items-center gap-2 pb-1 border-b border-emerald-500/20">
                              <div className="h-6 w-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-[10px]">
                                DF
                              </div>
                              <div>
                                <span className="font-bold text-[11px] text-white">Grand Bistro Bot</span>
                                <span className="text-[9px] text-emerald-400 block">Verified Business</span>
                              </div>
                            </div>

                            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1 text-[10px]">
                              <p className="text-slate-300">
                                Thank you for dining with us! Here is your GST Invoice:
                              </p>
                              <div className="font-mono text-emerald-400 font-bold">
                                Inv: #DF-904 • ₹1,480.50 (Paid)
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-400 pt-1">
                                <FileText className="h-3 w-3 text-emerald-400" />
                                <span>tax-invoice-df904.pdf (48 KB)</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-emerald-300 font-medium px-1">
                              <span className="flex items-center gap-1">
                                <ShieldCheck className="h-3.5 w-3.5" /> 100% Paperless
                              </span>
                              <span>Earned 148 Points ⭐</span>
                            </div>
                          </div>

                          {/* Clickable Mobile CTA */}
                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
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
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                              Hotel Room Service
                            </span>
                            <h4 className="text-sm font-extrabold text-white">Scan Room 302 Stand</h4>
                            <p className="text-[11px] text-slate-400">
                              Keycard / bedside QR instantly pairs suite folio
                            </p>
                          </div>

                          <div 
                            onClick={handleNextStep}
                            className="relative my-auto mx-auto w-44 h-44 rounded-2xl bg-slate-900 border-2 border-emerald-500/40 p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-400 hover:scale-[1.02] transition-all shadow-lg shadow-emerald-500/10 group/hotel"
                          >
                            <div className="absolute inset-x-2 top-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_#10b981] animate-pulse" />
                            <div className="p-2.5 rounded-xl bg-white text-slate-950 mb-1.5 group-hotel:scale-105 transition-transform">
                              <Hotel className="h-16 w-16 text-slate-900" />
                            </div>
                            <span className="text-[10px] font-mono font-bold text-emerald-400">
                              SUITE 302 • FOLIO READY
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
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
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                              24/7 Room Dining
                            </span>
                            <h4 className="text-sm font-extrabold text-white">Curated Suite Menu</h4>
                            <p className="text-[11px] text-slate-400">Breakfast, midnight bites & beverage lists</p>
                          </div>

                          <div className="space-y-2 flex-1 my-1">
                            <div 
                              onClick={handleNextStep}
                              className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500/70 transition-all cursor-pointer flex gap-2.5 items-center group/item"
                            >
                              <div className="h-14 w-14 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center shrink-0">
                                <span className="text-xl">🥪</span>
                                <span className="text-[8px] font-bold text-amber-400">CLUB</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-xs text-white truncate">Gourmet Club Sandwich</h5>
                                <p className="text-[10px] text-slate-400 truncate">Smoked chicken, avocado, fries</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="font-mono font-bold text-emerald-400 text-xs">₹480</span>
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold group-hover/item:bg-emerald-500 group-hover/item:text-slate-950 transition-colors">
                                    + Add
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div 
                              onClick={handleNextStep}
                              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex gap-2.5 items-center"
                            >
                              <div className="h-14 w-14 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center shrink-0">
                                <span className="text-xl">☕</span>
                                <span className="text-[8px] font-bold text-indigo-400">BREW</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-xs text-white truncate">Artisan Cappuccino & Croissant</h5>
                                <p className="text-[10px] text-slate-400 truncate">French butter croissant, espresso</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="font-mono font-bold text-slate-300 text-xs">₹320</span>
                                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold">
                                    + Add
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs flex items-center justify-between shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
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
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                              Delivery Preferences
                            </span>
                            <h4 className="text-sm font-extrabold text-white">Suite 302 Delivery</h4>
                            <p className="text-[11px] text-slate-400">Instant preparation or morning schedule</p>
                          </div>

                          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 flex-1 my-1">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                              <span className="text-[11px] text-white font-medium">⚡ Deliver Asap (~20m)</span>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            </div>
                            <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/50 text-[10px] text-slate-400">
                              Guest Note: "Please leave on table near balcony."
                            </div>
                            <div className="pt-2 border-t border-slate-800 flex justify-between text-xs font-bold">
                              <span>Total to Room Folio:</span>
                              <span className="text-emerald-400 font-mono">₹800.00</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
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
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                              Pantry Dispatch
                            </span>
                            <h4 className="text-sm font-extrabold text-white">Dispatched to Pantry Line</h4>
                            <p className="text-[11px] text-slate-400">Direct KDS audio chime & ticket print</p>
                          </div>

                          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 flex-1 my-1">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px]">
                              <Bell className="h-4 w-4 animate-bounce" />
                              <span>Pantry Station Acknowledged</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                              Order dispatched to Floor 3 service elevator station. Chef is assembling hot tray with insulated covers.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs flex items-center justify-between shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
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
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                              Door Delivery
                            </span>
                            <h4 className="text-sm font-extrabold text-white">Tray En Route to Suite</h4>
                            <p className="text-[11px] text-slate-400">Server is arriving at Door 302</p>
                          </div>

                          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 flex-1 my-1 text-center flex flex-col justify-center">
                            <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-1">
                              <Bell className="h-6 w-6" />
                            </div>
                            <span className="font-bold text-xs text-white">Doorbell Alert</span>
                            <p className="text-[10px] text-slate-400">
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
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                              Check-out Billing
                            </span>
                            <h4 className="text-sm font-extrabold text-white">Room Folio Settled</h4>
                            <p className="text-[11px] text-slate-400">Automatic room ledger posting</p>
                          </div>

                          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 flex-1 my-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-400">Suite Folio</span>
                              <span className="font-mono font-bold text-emerald-400">#FOLIO-302</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-400">In-Room Dining Total</span>
                              <span className="font-mono font-bold text-white">₹840.00</span>
                            </div>
                            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400">
                              ✓ Added to master invoice for express check-out
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
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
                    className="w-28 h-1 bg-white/30 rounded-full hover:bg-white/50 transition-colors cursor-pointer"
                    title="Tap to advance"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Navigation Hint */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 font-medium">
              <Smartphone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Tap the mobile screen or select steps on the left to navigate</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

