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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function LandingHero() {
  return (
    <section className="relative pt-8 pb-20 sm:pt-12 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Value Proposition & Conversion CTAs */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          {/* Product Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold backdrop-blur-md shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Next-Gen Multi-Tenant Restaurant & Hotel OS</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
            Run Your Hospitality Business{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">
              Smarter with DineFlow
            </span>
          </h1>

          {/* Supporting Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
            One unified operating system for restaurants, cafés, hotels, and cloud kitchens to manage QR digital ordering, real-time Kitchen Displays (KDS), table & in-room dining, staff attendance, WhatsApp billing, and automated analytics.
          </p>

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
          <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
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
              <span>5-minute instant setup</span>
            </div>
          </div>
        </div>

        {/* Right Column: Layered Dashboard & Mobile Customer Ordering Visual */}
        <div className="lg:col-span-6 relative w-full flex items-center justify-center">
          {/* Ambient Glows */}
          <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-indigo-500/20 rounded-3xl blur-2xl pointer-events-none -z-10" />

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
                <span className="font-semibold text-slate-700 dark:text-slate-300 ml-2">
                  The Grand Mirage Bistro & Hotel
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
            </div>

            {/* Dashboard Content Mockup */}
            <div className="p-4 sm:p-5 space-y-4">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Revenue</span>
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">₹48,250</p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">+18% vs yday</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Tables</span>
                    <Utensils className="h-3.5 w-3.5 text-teal-500" />
                  </div>
                  <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">14 / 18</p>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">78% Occupied</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Rooms</span>
                    <Hotel className="h-3.5 w-3.5 text-indigo-500" />
                  </div>
                  <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">28 / 32</p>
                  <span className="text-[10px] text-indigo-500 font-medium">88% Capacity</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Active KDS</span>
                    <Flame className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">7 Orders</p>
                  <span className="text-[10px] text-amber-500 font-medium">Avg Prep 8m</span>
                </div>
              </div>

              {/* Live Order Queue Snippet */}
              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <ChefHat className="h-3.5 w-3.5 text-emerald-500" />
                    Live Kitchen Queue
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">KDS Screen 1</span>
                </div>

                {/* Mini Order Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800/80 border border-emerald-500/30 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">#DF-802 • Table 04</span>
                      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">
                        Preparing 4m
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1">
                      1x Truffle Risotto, 1x Orange Spritz
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800/80 border border-teal-500/30 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">#DF-801 • Room 204</span>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                        Ready for Delivery
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1">
                      1x Artisanal Club Sandwich, 1x Fresh Juice
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Layered Mobile Customer QR Ordering Phone Mockup */}
          <div className="absolute -bottom-6 sm:-bottom-8 -right-2 sm:-right-6 w-52 sm:w-64 rounded-3xl border-4 border-slate-800 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl shadow-black/40 overflow-hidden transform rotate-1 sm:rotate-2 hover:rotate-0 transition-transform duration-300 hidden sm:block">
            {/* Phone Notch & Header */}
            <div className="bg-slate-900 text-white p-2.5 pt-3 text-center space-y-1">
              <div className="w-12 h-3.5 bg-black rounded-full mx-auto mb-1" />
              <div className="flex items-center justify-between px-1 text-[10px] font-medium text-slate-300">
                <span className="flex items-center gap-1">
                  <QrCode className="h-3 w-3 text-emerald-400" />
                  Table 04
                </span>
                <span className="text-emerald-400 font-semibold">● Online Menu</span>
              </div>
            </div>

            {/* Mobile Menu Preview */}
            <div className="p-3 space-y-2.5 bg-slate-50 dark:bg-slate-950">
              <div className="flex gap-1.5 overflow-hidden text-[9px] font-medium">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white">Popular</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Pizzas</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Drinks</span>
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
          <div className="absolute -top-4 -left-4 sm:left-2 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>⚡ 0s App Install Time</span>
          </div>

          <div className="absolute -bottom-4 left-4 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hidden sm:flex">
            <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
            <span>📲 Instant WhatsApp Receipt</span>
          </div>
        </div>
      </div>
    </section>
  );
}
