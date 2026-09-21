"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  QrCode,
  ChefHat,
  BellRing,
  TrendingUp,
  ShoppingBag,
  Users,
  Hotel,
  ShieldCheck,
  Utensils,
  Flame,
  MessageSquare,
  Clock,
  Coffee,
  Wine,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AetherFlowHero from "@/components/ui/aether-flow-hero";

export function LandingHero() {
  return (
    <section className="relative w-full overflow-hidden min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center">
      {/* Interactive Cursor Dynamic Particle Canvas - Full Hero Section Coverage */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AetherFlowHero
          showOverlayContent={false}
          className="h-full w-full"
          particleColor="rgba(16, 185, 129, 0.85)"
          lineColor="rgba(20, 184, 166, 0.5)"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 pb-20 sm:pt-12 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
        {/* Left Column: Value Proposition & Conversion CTAs */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          {/* Product Badge with Hospitality vibe */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold backdrop-blur-md shadow-xs">
            <UtensilsCrossed className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>The Operating System for Modern Dining & Stays</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
            Run Your Restaurant & Hotel{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">
              Smarter with DineFlow
            </span>
          </h1>

          {/* Supporting Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
            From bustling dining tables to luxury resort suites: Delight guests with app-less QR ordering, empower chefs with live Kitchen Displays (KDS), and automate WhatsApp billing and staff attendance in one unified platform.
          </p>

          {/* Hospitality Vibe Tags */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-medium flex items-center gap-1.5">
              🍕 Fine Dining & Bistros
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-1.5">
              ☕ Specialty Cafés
            </span>
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-medium flex items-center gap-1.5">
              🛎️ Hotels & In-Room Dining
            </span>
            <span className="px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-medium flex items-center gap-1.5">
              🍸 Cocktail Lounges
            </span>
          </div>

          {/* CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
            <Button
              variant="glow"
              size="lg"
              className="w-full sm:w-auto h-12 sm:h-13 px-7 text-sm sm:text-base font-bold shadow-lg shadow-emerald-500/25 cursor-pointer"
              asChild
            >
              <Link href="/register" className="flex items-center justify-center gap-2">
                <span>Start Free Trial</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12 sm:h-13 px-7 text-sm sm:text-base font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer"
              asChild
            >
              <Link href="/dashboard">
                Explore Live Demo
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Instant 5-minute setup</span>
            </div>
          </div>
        </div>

        {/* Right Column: Layered Dashboard & Mobile Customer Ordering Visual */}
        <div className="lg:col-span-6 relative w-full flex items-center justify-center">
          {/* Ambient Glows */}
          <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500/20 via-amber-500/10 to-teal-500/20 rounded-3xl blur-2xl pointer-events-none -z-10" />

          {/* Main Desktop Dashboard Preview */}
          <div className="w-full max-w-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/90 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-xl shadow-2xl shadow-slate-900/10 dark:shadow-black/60 overflow-hidden">
            {/* Window Topbar */}
            <div className="px-4 py-3 border-b border-slate-200/70 dark:border-slate-800/70 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 ml-2 flex items-center gap-1.5">
                  <Utensils className="h-3.5 w-3.5 text-emerald-500" />
                  The Grand Mirage Bistro & Resort
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Kitchen Sync Live
                </span>
              </div>
            </div>

            {/* Dashboard Content Mockup */}
            <div className="p-4 sm:p-5 space-y-4">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Today Sales</span>
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">₹48,250</p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">+18% vs yday</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Active Tables</span>
                    <Utensils className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">14 / 18</p>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">78% Seated</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Suites</span>
                    <Hotel className="h-3.5 w-3.5 text-indigo-500" />
                  </div>
                  <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">28 / 32</p>
                  <span className="text-[10px] text-indigo-500 font-medium">88% Occupied</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Live KDS</span>
                    <Flame className="h-3.5 w-3.5 text-rose-500" />
                  </div>
                  <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">7 Orders</p>
                  <span className="text-[10px] text-rose-500 font-medium">Avg Prep 8m</span>
                </div>
              </div>

              {/* Live Order Queue Snippet */}
              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <ChefHat className="h-3.5 w-3.5 text-amber-500" />
                    Kitchen Station Queue
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Expo Screen 1</span>
                </div>

                {/* Mini Order Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800/80 border border-emerald-500/30 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">#DF-802 • Table 04</span>
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                        Cooking 4m
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                      1x Truffle Risotto, 1x Valencia Spritz
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800/80 border border-teal-500/30 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">#DF-801 • Suite 204</span>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        Plated for Room Service
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                      1x Artisanal Club Sandwich, 1x Fresh Juice
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Layered Mobile Customer QR Ordering Phone Mockup — safely positioned without right overflow */}
          <div className="absolute -bottom-6 sm:-bottom-8 right-0 sm:right-2 lg:-right-2 xl:-right-4 w-48 sm:w-56 lg:w-60 rounded-3xl border-4 border-slate-800 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl shadow-black/40 overflow-hidden transform rotate-1 sm:rotate-2 hover:rotate-0 transition-transform duration-300 hidden sm:block">
            {/* Phone Notch & Header */}
            <div className="bg-slate-900 text-white p-2.5 pt-3 text-center space-y-1">
              <div className="w-12 h-3.5 bg-black rounded-full mx-auto mb-1" />
              <div className="flex items-center justify-between px-1 text-[10px] font-medium text-slate-300">
                <span className="flex items-center gap-1">
                  <QrCode className="h-3 w-3 text-emerald-400" />
                  Table 04 • QR Menu
                </span>
                <span className="text-emerald-400 font-semibold">● Online</span>
              </div>
            </div>

            {/* Mobile Menu Preview */}
            <div className="p-3 space-y-2.5 bg-slate-50 dark:bg-slate-950">
              <div className="flex gap-1.5 overflow-hidden text-[9px] font-medium">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white">Chef Special</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Pizzas</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Bar</span>
              </div>

              {/* Item Card */}
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white block">Truffle Margherita</span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">₹750</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">
                    + Add
                  </span>
                </div>
              </div>

              {/* Floating Bottom Cart Bar */}
              <div className="p-2 rounded-xl bg-emerald-600 text-white flex items-center justify-between text-[10px] font-bold shadow-md shadow-emerald-500/30">
                <span>2 Items • ₹1,200</span>
                <span className="flex items-center gap-1">
                  View Cart <ArrowRight className="h-2.5 w-2.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Floating Trust Pills */}
          <div className="absolute -top-4 -left-4 sm:left-2 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-full px-3.5 py-1.5 shadow-lg flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span>⚡ Instant QR • Zero App Install</span>
          </div>

          <div className="absolute -bottom-4 left-4 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-full px-3.5 py-1.5 shadow-lg flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hidden sm:flex">
            <MessageSquare className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Instant WhatsApp Receipts</span>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
