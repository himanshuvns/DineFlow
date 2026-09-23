"use client";

import * as React from "react";
import {
  UtensilsCrossed,
  Coffee,
  Hotel,
  Soup,
  Truck,
  Building2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  QrCode,
  ChefHat,
  MessageSquare,
  Users,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ParallaxFloatingOrb } from "@/components/landing/section-decorations";

interface SolutionItem {
  id: string;
  name: string;
  icon: React.ElementType;
  tagline: string;
  description: string;
  features: string[];
  metrics: { label: string; value: string }[];
  highlight: string;
}

const SOLUTIONS: SolutionItem[] = [
  {
    id: "restaurant",
    name: "Restaurants & Bistros",
    icon: UtensilsCrossed,
    tagline: "Fine dining, casual diners & family bistros",
    description:
      "Accelerate table turnover and eliminate order entry mistakes with instant QR menus, multi-course kitchen routing, and split check settlements.",
    features: [
      "Dynamic table floor plan & live occupancy states",
      "Course-by-course kitchen order ticket (KOT) firing",
      "Sommelier digital wine pairing & chef recommendations",
      "Instant WhatsApp GST billing & digital receipts",
    ],
    metrics: [
      { label: "Turnover Speed", value: "+38%" },
      { label: "Order Errors", value: "0%" },
    ],
    highlight: "Ideal for 10 to 150 table dining rooms",
  },
  {
    id: "cafe",
    name: "Cafés & Bakeries",
    icon: Coffee,
    tagline: "Specialty coffee shops, roasters & bakeries",
    description:
      "Handle morning rushes with ease. Let guests scan counter QR codes or table stands to customize roasts, milk options, and pastry combos.",
    features: [
      "Rapid counter pickup queues with real-time screen display",
      "Modifier groups for roasts, milks, and syrup additions",
      "Automated WhatsApp repeat loyalty rewards",
      "86-item quick stock toggles for seasonal pastries",
    ],
    metrics: [
      { label: "Rush Hour Throughput", value: "2.4x" },
      { label: "Repeat Customers", value: "+45%" },
    ],
    highlight: "Optimized for fast-paced grab & go counters",
  },
  {
    id: "hotel",
    name: "Hotels & Resorts",
    icon: Hotel,
    tagline: "Boutique hotels, luxury suites & beachfront resorts",
    description:
      "Elevate guest stays with in-room QR dining, digital concierge butler requests, pool cabana ordering, and unified folio charge settlement.",
    features: [
      "Room-specific QR code stands for suites & villas",
      "Direct room-service kitchen dispatch with delivery routing",
      "Digital Do Not Disturb (DND) & housekeeping requests",
      "Consolidated guest invoicing charged to room folio",
    ],
    metrics: [
      { label: "In-Room Order Vol", value: "+52%" },
      { label: "Guest Satisfaction", value: "4.9/5" },
    ],
    highlight: "Scales from 15-room boutique stays to 500+ key resorts",
  },
  {
    id: "cloud_kitchen",
    name: "Cloud Kitchens",
    icon: Soup,
    tagline: "Multi-brand ghost kitchens & delivery hubs",
    description:
      "Run multiple virtual delivery concepts from a single centralized kitchen. Consolidate orders, recipes, and prep stations onto one screen.",
    features: [
      "Multi-brand menu management from a single dashboard",
      "Central kitchen station routing (Grill, Fryer, Salad)",
      "Direct customer WhatsApp ordering with zero aggregator commission",
      "Unified ingredient usage and margin tracking",
    ],
    metrics: [
      { label: "Commission Saved", value: "100%" },
      { label: "Prep Coordination", value: "<8 mins" },
    ],
    highlight: "Designed for high-throughput multi-brand prep",
  },
  {
    id: "food_truck",
    name: "Food Trucks & Pop-Ups",
    icon: Truck,
    tagline: "Mobile catering, festival pop-ups & kiosks",
    description:
      "Deploy instant QR ordering with zero hardware footprint. Let customers order while standing in line and get notified on WhatsApp when ready.",
    features: [
      "App-less mobile QR menu setup in under 5 minutes",
      "Offline and weak signal resilient queueing",
      "SMS & WhatsApp order ready ping notifications",
      "Unified UPI & digital wallet payments",
    ],
    metrics: [
      { label: "Setup Time", value: "5 mins" },
      { label: "Hardware Cost", value: "₹0" },
    ],
    highlight: "Zero terminal requirements — runs on your phone",
  },
  {
    id: "multi_outlet",
    name: "Multi-Outlet Chains",
    icon: Building2,
    tagline: "Restaurant franchises & multi-property hospitality groups",
    description:
      "Maintain brand consistency across all branches. Centralize menu catalogs, regional pricing, staff access, and comparative branch analytics.",
    features: [
      "Multi-tenant hierarchy with regional manager delegation",
      "Global menu catalog with branch-level price overrides",
      "Comparative sales, margin, and turnover benchmarks",
      "Centralized staff attendance and consolidated payroll",
    ],
    metrics: [
      { label: "Reporting Aggr", value: "Real-time" },
      { label: "Multi-Location", value: "Unlimited" },
    ],
    highlight: "Enterprise scale with multi-tenant isolation",
  },
];

export function LandingSolutions() {
  const [selectedId, setSelectedId] = React.useState("restaurant");
  const currentSolution = SOLUTIONS.find((s) => s.id === selectedId) || SOLUTIONS[0];
  const Icon = currentSolution.icon;

  return (
    <section
      id="solutions"
      className="relative w-full py-16 sm:py-24 bg-gradient-to-b from-slate-50 via-amber-50/25 to-slate-50 dark:from-[#090D16] dark:via-amber-950/10 dark:to-[#090D16] scroll-mt-24 overflow-hidden"
    >
      {/* Parallax Floating Warm Hospitality Glows */}
      <ParallaxFloatingOrb color="amber" speed={45} className="top-1/4 -right-40 w-96 h-96" />
      <ParallaxFloatingOrb color="emerald" speed={35} className="bottom-10 -left-40 w-96 h-96" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Tailored Industry Solutions</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          One platform. Built for every hospitality business.
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Discover how DineFlow adapts to your exact business format with specialized workflows.
        </p>
      </div>

      {/* Solutions Category Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-3 sm:mb-4">
        {SOLUTIONS.map((sol) => {
          const SolIcon = sol.icon;
          const isSelected = sol.id === selectedId;
          return (
            <button
              key={sol.id}
              type="button"
              onClick={() => setSelectedId(sol.id)}
              className={`p-3.5 rounded-xl text-left flex flex-col items-center sm:items-start gap-2.5 transition-all cursor-pointer border ${
                isSelected
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500/30"
                  : "bg-white dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  isSelected ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                <SolIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-center sm:text-left leading-tight">
                {sol.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Solution Detail Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/90 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl p-6 sm:p-8 lg:p-10 shadow-xl transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Detailed Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Icon className="h-4 w-4" />
                <span>{currentSolution.tagline}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {currentSolution.name}
                </h3>
                <Badge variant="outline" size="sm" className="text-xs text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700">
                  {currentSolution.highlight}
                </Badge>
              </div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {currentSolution.description}
              </p>
            </div>

            {/* Feature Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentSolution.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-4 flex items-center gap-4">
              <Button variant="glow" size="sm" asChild className="h-10 px-5 text-xs sm:text-sm font-bold">
                <Link href="/register">
                  Start Free for {currentSolution.name} <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: Realistic Metrics & Workflow Preview */}
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Expected Operational Impact
              </span>
              <Badge variant="success" size="sm">Verified Benchmark</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {currentSolution.metrics.map((m, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">{m.label}</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {m.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Mini Visual Flow */}
            <div className="space-y-2 pt-2 border-t border-slate-200/70 dark:border-slate-800/70">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                Workflow Orchestration
              </span>
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="flex items-center gap-1.5">
                  <QrCode className="h-3.5 w-3.5 text-emerald-500" /> QR Scan
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0 stroke-[2.5]" aria-hidden="true" />
                <span className="flex items-center gap-1.5">
                  <ChefHat className="h-3.5 w-3.5 text-amber-500" /> KDS
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0 stroke-[2.5]" aria-hidden="true" />
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-teal-500" /> WhatsApp
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
