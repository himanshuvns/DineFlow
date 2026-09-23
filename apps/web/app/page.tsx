"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2, UtensilsCrossed, Hotel, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingInteractivePreview } from "@/components/landing/landing-interactive-preview";
import { LandingSolutions } from "@/components/landing/landing-solutions";
import { LandingCustomerJourney } from "@/components/landing/landing-customer-journey";
import { LandingPricing } from "@/components/landing/landing-pricing";
import { LandingFooter } from "@/components/landing/landing-footer";
import { SectionDivider } from "@/components/landing/section-decorations";
import { PeekingChef } from "@/components/ui/peeking-chef";
import { SpotlightCursor } from "@/components/ui/spotlight-cursor";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#090D16] dark:text-slate-100 flex flex-col relative transition-colors duration-200 selection:bg-emerald-500/20 selection:text-emerald-600">
      {/* Interactive DineFlow Brand Spotlight Cursor throughout the home page */}
      <SpotlightCursor />

      {/* Background Ambient Glows - Contained to prevent horizontal spill without breaking position: sticky */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-emerald-500/15 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-48 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-2/3 -left-48 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Modern Sticky Navigation */}
      <LandingNavbar />

      {/* Main Content Flow */}
      <main className="flex-1 flex flex-col items-center w-full">
        {/* 1. Hero with Interactive AetherFlow Cursor Particles & Layered Hospitality Mockup */}
        <LandingHero />

        {/* 2. Interactive Multi-Surface Dashboard ("Everything you need to run your hospitality business") */}
        <LandingInteractivePreview />

        {/* Glowing Gradient Hairline Divider */}
        <SectionDivider />

        {/* 3. Tailored Hospitality Solutions (Fine Dining, Cafés, Hotels, Cloud Kitchens) */}
        <LandingSolutions />

        {/* Glowing Gradient Hairline Divider */}
        <SectionDivider />

        {/* 4. The Modern Customer Journey (Dine-in Table QR vs. Hotel In-Room Dining) */}
        <LandingCustomerJourney />

        {/* Glowing Gradient Hairline Divider */}
        <SectionDivider />

        {/* 5. Transparent Pricing with Animated NumberFlow & Confetti Poppers */}
        <LandingPricing />

        {/* Glowing Gradient Hairline Divider */}
        <SectionDivider />

        {/* 6. Pre-Footer Hospitality Conversion Banner with Interactive Peeking Chef */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative">
          {/* Peeking Chef Mascot with Smooth Cursor-Tracking Physics */}
          <div className="flex justify-center -mb-8 relative z-20 pointer-events-auto">
            <PeekingChef />
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-emerald-500/30 bg-gradient-to-tr from-emerald-950 via-slate-900 to-amber-950/70 p-8 sm:p-12 lg:p-16 text-center text-white shadow-2xl shadow-emerald-950/40">
            {/* Ambient inner glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-emerald-500/10 to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-xs">
                <ChefHat className="h-3.5 w-3.5 text-amber-400" />
                <span>Crafted for Exceptional Dining & Hotel Hospitality</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Ready to elevate your dining room & hotel service?
              </h2>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
                Join forward-thinking restaurants, boutique cafés, and luxury hotels automating table orders, kitchen tickets, and guest billing with DineFlow.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  variant="glow"
                  size="lg"
                  className="w-full sm:w-auto h-12 sm:h-13 px-8 text-sm sm:text-base font-bold shadow-lg shadow-emerald-500/30 cursor-pointer"
                  asChild
                >
                  <Link href="/register" className="flex items-center justify-center gap-2">
                    <span>Start 14-Day Free Trial</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-12 sm:h-13 px-8 text-sm sm:text-base font-semibold border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-white cursor-pointer"
                  asChild
                >
                  <Link href="/dashboard">
                    Explore Live Demo
                  </Link>
                </Button>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Setup in 5 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Comprehensive SaaS Footer */}
      <LandingFooter />
    </div>
  );
}
