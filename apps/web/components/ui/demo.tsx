"use client";

import * as React from "react";
import Link from "next/link";
import {
  QrCode,
  ChefHat,
  Hotel,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  UtensilsCrossed,
  Layers,
  Smartphone,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface DemoModule {
  id: string;
  name: string;
  tagline: string;
  category: string;
  icon: React.ElementType;
  demoUrl: string;
  badge: string;
  features: string[];
  metrics: string;
  color: string;
  gradient: string;
}

const DEMO_MODULES: DemoModule[] = [
  {
    id: "qr-ordering",
    name: "Customer QR Ordering",
    tagline: "Ultra-fast digital menus with dietary filters, add-ons, and instant steward calls.",
    category: "Guest Experience",
    icon: Smartphone,
    demoUrl: "/m/the-grand-bistro/t-04",
    badge: "Contactless",
    features: [
      "Zero app install — instant web load in under 1 second",
      "Dynamic allergen and vegetarian/non-vegetarian filters",
      "Multi-variant dish modifiers with real-time pricing",
      "One-tap call steward & guest Wi-Fi access",
    ],
    metrics: "⚡ 2.4× faster table turn-times",
    color: "emerald",
    gradient: "from-emerald-500/15 via-teal-500/5 to-transparent",
  },
  {
    id: "live-kds",
    name: "Kitchen Display (KDS)",
    tagline: "Real-time ticket bump bar with multi-station routing and audio alerts.",
    category: "Kitchen Automation",
    icon: ChefHat,
    demoUrl: "/dashboard/orders",
    badge: "Live Sync",
    features: [
      "Station routing: Main Kitchen, In-Room Dining & Bar",
      "Urgency color-coded timers (>8m amber, >15m red pulse)",
      "Instant bump-bar transitions: New → Cooking → Plated → Done",
      "One-click thermal KOT & guest receipt printing",
    ],
    metrics: "🍳 0 missing tickets or kitchen delays",
    color: "amber",
    gradient: "from-amber-500/15 via-orange-500/5 to-transparent",
  },
  {
    id: "hotel-suite",
    name: "Hotel Suite Guest Portal",
    tagline: "In-room dining, dynamic DND toggle, and stay extension approval lifecycle.",
    category: "Hospitality & PMS",
    icon: Hotel,
    demoUrl: "/m/the-grand-bistro/room/302",
    badge: "Hotel Edition",
    features: [
      "Live Do Not Disturb (DND) toggle guarding housekeeping",
      "Stay extension request workflow with front desk approval",
      "Room folio charging & complimentary order billing",
      "Real-time guest order and housekeeping tracking",
    ],
    metrics: "🏨 +34% in-room dining spend per occupied room",
    color: "purple",
    gradient: "from-indigo-500/15 via-purple-500/5 to-transparent",
  },
  {
    id: "executive-dashboard",
    name: "Manager Overview & Analytics",
    tagline: "Central command center with real-time revenue telemetry and AI Studio.",
    category: "Operations & SaaS",
    icon: TrendingUp,
    demoUrl: "/dashboard",
    badge: "Owner Console",
    features: [
      "Live gross/net sales telemetry & occupancy breakdown",
      "AI Menu Writer, Demand Forecasting, and Smart Pricing Alerts",
      "Staff attendance, shifts, leave approval, and payroll",
      "WhatsApp automated marketing campaigns and billing receipts",
    ],
    metrics: "📈 18% higher average check value",
    color: "cyan",
    gradient: "from-cyan-500/15 via-blue-500/5 to-transparent",
  },
];

export function DemoOne() {
  const [selectedId, setSelectedId] = React.useState<string>("qr-ordering");
  const selectedModule = DEMO_MODULES.find((m) => m.id === selectedId) || DEMO_MODULES[0];
  const Icon = selectedModule.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#070B14]/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-sm">
            <div className="h-full w-full bg-slate-950 rounded-[9px] flex items-center justify-center">
              <UtensilsCrossed className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
            DineFlow <span className="text-emerald-500 font-bold text-xs uppercase ml-1">Showcase</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="secondary" size="sm" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button variant="glow" size="sm" asChild>
            <Link href="/register">Get Started Free</Link>
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Interactive Multi-Role Hospitality OS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Explore DineFlow in Action
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Test drive every role — from guest contactless ordering to kitchen bump bars and hotel room folio automation.
          </p>
        </div>

        {/* Module Switcher Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {DEMO_MODULES.map((mod) => {
            const isSelected = mod.id === selectedId;
            const ModIcon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => setSelectedId(mod.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-white dark:bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20"
                    : "bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? "bg-emerald-500 text-slate-950 font-bold"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <ModIcon className="h-4.5 w-4.5" />
                    </div>
                    <Badge variant={isSelected ? "glow" : "neutral"} size="sm">
                      {mod.badge}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {mod.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {mod.tagline}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold">
                  <span className={isSelected ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400"}>
                    {isSelected ? "Active Preview" : "Select Module"}
                  </span>
                  <ArrowRight className={`h-3 w-3 ${isSelected ? "text-emerald-500" : "text-slate-400"}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Module Detail & Live Launcher Card */}
        <Card variant="glass" padding="none" className="overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
            {/* Left: Overview & Features */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="purple" size="sm">
                    {selectedModule.category}
                  </Badge>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {selectedModule.metrics}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {selectedModule.name}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {selectedModule.tagline}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Included Capabilities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedModule.features.map((feat, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-700 dark:text-slate-300 font-medium"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button variant="glow" size="lg" asChild>
                  <Link href={selectedModule.demoUrl} target="_blank">
                    <span className="flex items-center gap-2">
                      Launch Interactive Screen
                      <ExternalLink className="h-4 w-4" />
                    </span>
                  </Link>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <Link href="/login">
                    Sign in to Full Workspace
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: Interactive Sandbox Preview Card */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Quick Sandbox Access
                  </span>
                  <Badge variant="success" size="sm" dot>
                    Sandbox Ready
                  </Badge>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Demo Restaurant</span>
                    <span className="font-bold text-slate-900 dark:text-white">The Grand Bistro</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Demo Mobile</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+91 98765 43210</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Demo Password</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">DineFlow@2026</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Pre-configured with 20 sample dishes, live tables, active orders, and simulated kitchen tickets.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Zero installation required. Runs seamlessly in modern desktop, tablet, and mobile browsers.</span>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

export const PricingBasic = DemoOne;
export default DemoOne;
