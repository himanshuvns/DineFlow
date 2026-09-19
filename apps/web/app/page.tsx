"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingInteractivePreview } from "@/components/landing/landing-interactive-preview";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingSolutions } from "@/components/landing/landing-solutions";
import { LandingWorkflow } from "@/components/landing/landing-workflow";
import { LandingCustomerJourney } from "@/components/landing/landing-customer-journey";
import { LandingKdsPreview } from "@/components/landing/landing-kds-preview";
import { LandingWhatsappPreview } from "@/components/landing/landing-whatsapp-preview";
import { LandingStaffHotel } from "@/components/landing/landing-staff-hotel";
import { LandingSecurity } from "@/components/landing/landing-security";
import { LandingPricing } from "@/components/landing/landing-pricing";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#090D16] dark:text-slate-100 flex flex-col relative overflow-hidden transition-colors duration-200 selection:bg-emerald-500/20 selection:text-emerald-600">
      {/* Background Ambient Glows */}
      <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-emerald-500/15 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/4 -right-48 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-2/3 -left-48 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Modern Sticky Navigation */}
      <LandingNavbar />

      {/* Main Content Sections */}
      <main className="flex-1 flex flex-col items-center w-full">
        {/* Hero with Value Proposition & Layered Product Visual */}
        <LandingHero />

        {/* Interactive Multi-Surface Dashboard Preview */}
        <LandingInteractivePreview />

        {/* 18 Real Product Capabilities */}
        <LandingFeatures />

        {/* Tailored Hospitality Solutions */}
        <LandingSolutions />

        {/* How DineFlow Works — 8-Step Pipeline */}
        <LandingWorkflow />

        {/* Customer Experience Journey (Restaurant Table vs. Hotel Suite) */}
        <LandingCustomerJourney />

        {/* Kitchen Display System (KDS) Live Kanban Preview */}
        <LandingKdsPreview />

        {/* WhatsApp Automated Communication & Invoicing */}
        <LandingWhatsappPreview />

        {/* Staff Attendance Geofencing & Hotel Room Management */}
        <LandingStaffHotel />

        {/* Enterprise Security & Multi-Tenant Architecture */}
        <LandingSecurity />

        {/* Canonical Pricing Plans */}
        <LandingPricing />

        {/* Bottom High-Converting Pre-Footer CTA Banner */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="relative rounded-3xl overflow-hidden border border-emerald-500/30 bg-gradient-to-tr from-emerald-950/80 via-slate-900 to-teal-950/80 p-8 sm:p-12 lg:p-16 text-center text-white shadow-2xl shadow-emerald-950/40">
            {/* Ambient inner glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>Modernize Your Hospitality Operations Today</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Ready to run your restaurant or hotel smarter?
              </h2>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
                Join modern dining rooms, cafés, and hotel properties streamlining guest orders, kitchen prep, and staff attendance on DineFlow.
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
