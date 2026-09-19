"use client";

import * as React from "react";
import {
  Building2,
  UtensilsCrossed,
  QrCode,
  Smartphone,
  ChefHat,
  Clock,
  MessageSquare,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface StepItem {
  step: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

const STEPS: StepItem[] = [
  {
    step: "01",
    icon: Building2,
    title: "Create your business",
    description: "Sign up in 60 seconds. Set your restaurant or hotel profile, currency, taxes, and branding.",
  },
  {
    step: "02",
    icon: UtensilsCrossed,
    title: "Add menu, tables & rooms",
    description: "Import your menu items, pricing, floor tables, and hotel rooms with one-click presets.",
  },
  {
    step: "03",
    icon: QrCode,
    title: "Generate QR codes",
    description: "Instantly download high-res printable QR stands for tables, bar counters, and guest rooms.",
  },
  {
    step: "04",
    icon: Smartphone,
    title: "Customers scan & order",
    description: "Guests scan the QR code and browse your rich visual menu with zero app installation required.",
  },
  {
    step: "05",
    icon: ChefHat,
    title: "Kitchen receives order",
    description: "Orders instantly appear on multi-station KDS displays with audible chimes and prep timers.",
  },
  {
    step: "06",
    icon: Clock,
    title: "Staff prepares & updates",
    description: "Chefs bump status from cooking to plated with one tap; floor captains are notified to serve.",
  },
  {
    step: "07",
    icon: MessageSquare,
    title: "Customer receives updates",
    description: "Automated WhatsApp notifications deliver order progress and digital GST tax invoices.",
  },
  {
    step: "08",
    icon: TrendingUp,
    title: "Track revenue & operations",
    description: "Owners and managers track live sales, table turnover, inventory, and staff attendance in real-time.",
  },
];

export function LandingWorkflow() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Streamlined Hospitality Flow</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How DineFlow Works
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          From guest scan to kitchen dispatch and financial reconciliation, experience a seamless 8-step pipeline.
        </p>
      </div>

      {/* 8-Step Grid with Connecting Lines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {STEPS.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="relative p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-200 group hover:-translate-y-1"
            >
              {/* Step Number Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {item.step}
                </span>
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.description}
              </p>

              {/* Step Connector Arrow (hidden on last item) */}
              {index < STEPS.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-300 dark:text-slate-700">
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
