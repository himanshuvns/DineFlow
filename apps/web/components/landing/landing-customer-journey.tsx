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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Step Selection */}
        <div className="lg:col-span-7 space-y-3">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isCurrent = activeStep === idx;
            return (
              <div
                key={step.title}
                onClick={() => setActiveStep(idx)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                  isCurrent
                    ? "bg-emerald-500/10 border-emerald-500/30 shadow-md ring-1 ring-emerald-500/30"
                    : "bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isCurrent
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <StepIcon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Step 0{idx + 1}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Phone Frame Preview */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-64 sm:w-72 rounded-[36px] border-4 border-slate-800 dark:border-slate-700 bg-slate-950 p-2.5 shadow-2xl shadow-black/40">
            {/* Phone Screen */}
            <div className="rounded-[28px] bg-slate-900 overflow-hidden border border-slate-800 min-h-[440px] flex flex-col justify-between text-white">
              {/* Screen Top Bar */}
              <div className="p-3 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="font-mono font-bold text-emerald-400">
                  {journeyType === "restaurant" ? "Table 04" : "Room 302"}
                </span>
                <span className="text-slate-400">DineFlow Mobile</span>
              </div>

              {/* Dynamic Phone Content based on Active Step */}
              <div className="p-4 space-y-4 flex-1 flex flex-col justify-center">
                <div className="text-center space-y-2">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    {React.createElement(currentStep.icon, { className: "h-6 w-6" })}
                  </div>
                  <Badge variant="success" size="sm">
                    {journeyType === "restaurant" ? "Restaurant Flow" : "Hotel Suite Flow"}
                  </Badge>
                  <h4 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                    {currentStep.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-[220px] mx-auto">
                    {currentStep.desc}
                  </p>
                </div>

                {/* Context-aware micro preview mock */}
                {activeStep === 0 ? (
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs space-y-1.5 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-semibold text-xs">
                      <QrCode className="h-4 w-4" />
                      <span>Camera Ready to Scan</span>
                    </div>
                    <p className="text-xs text-slate-400">Point at table QR stand to launch digital menu instantly</p>
                  </div>
                ) : activeStep === 1 ? (
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">Digital Menu Loaded</span>
                      <span className="text-emerald-400 font-semibold">42 Dishes</span>
                    </div>
                    <p className="text-xs text-slate-400">Zero app download • High-res photos & dietary tags</p>
                  </div>
                ) : activeStep === 2 ? (
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">Cart Ready (2 Items)</span>
                      <span className="text-emerald-400 font-semibold">₹1,450</span>
                    </div>
                    <p className="text-xs text-slate-400">Custom cooking notes added: "Extra crispy crust"</p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">
                        {activeStep === 5 ? "Digital Receipt Sent" : "Active Order"}
                      </span>
                      <span className="text-emerald-400 font-semibold">#DF-904</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">
                        {activeStep === 5 ? "Paid via UPI" : "Total Charged"}
                      </span>
                      <span className="font-bold text-white">₹1,450</span>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Screen Bottom Bar */}
              <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Powered by DineFlow OS</span>
                <span className="text-emerald-400 font-bold">Fast & App-less</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
