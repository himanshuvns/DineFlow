"use client";

import * as React from "react";
import { Pricing, PricingPlan } from "@/components/ui/pricing";
import { ParallaxFloatingOrb } from "@/components/landing/section-decorations";

const CANONICAL_PLANS: PricingPlan[] = [
  {
    name: "Free",
    price: "0",
    yearlyPrice: "0",
    period: "month",
    description: "For pop-ups, food trucks & trial operators",
    features: [
      "1 Location • 5 Active Tables",
      "Digital Contactless QR Menu",
      "Guest Mobile Ordering (No App)",
      "Standard Web Management Portal",
      "Zero commission on orders",
    ],
    buttonText: "Get Started Free",
    href: "/register",
    isPopular: false,
    limits: {
      tables: "5 Tables",
      dishes: "30 Dishes",
      staff: "2 Seats",
      locations: "1 Location",
    },
  },
  {
    name: "Starter",
    price: "999",
    yearlyPrice: "799",
    period: "month",
    description: "Essential tools for bustling bistros & cafés",
    features: [
      "Everything in Free, plus:",
      "Up to 20 Tables & 100 Dishes",
      "1 Kitchen KDS Screen with Sound Chimes",
      "Automated WhatsApp Order Receipts",
      "Staff Roles & Daily CSV Sales Export",
    ],
    buttonText: "Choose Starter",
    href: "/register",
    isPopular: false,
    limits: {
      tables: "20 Tables",
      dishes: "100 Dishes",
      staff: "5 Seats",
      locations: "1 Location",
    },
  },
  {
    name: "Growth",
    price: "2999",
    yearlyPrice: "2399",
    period: "month",
    description: "Full-scale dining room & kitchen automation",
    features: [
      "Everything in Starter, plus:",
      "Up to 100 Tables & Unlimited Dishes",
      "Multi-Station Kitchen Routing (KDS)",
      "Automated Meta Cloud WhatsApp Bot",
      "Priority 24/7 Phone & WhatsApp Support",
    ],
    buttonText: "Start Growth Trial",
    href: "/register",
    isPopular: true,
    limits: {
      tables: "100 Tables",
      dishes: "Unlimited",
      staff: "25 Seats",
      locations: "3 Locations",
    },
  },
  {
    name: "Hotel Pro",
    price: "7999",
    yearlyPrice: "6399",
    period: "month",
    description: "For luxury hospitality, in-room dining & suites",
    features: [
      "Everything in Growth, plus:",
      "Unlimited Tables & Guest Rooms",
      "In-Room QR Dining & Butler Calling",
      "Digital DND & Housekeeping Requests",
      "Consolidated Guest Room Folio Billing",
    ],
    buttonText: "Get Hotel Pro",
    href: "/register",
    isPopular: false,
    limits: {
      tables: "Unlimited",
      dishes: "Unlimited",
      staff: "Unlimited",
      locations: "Multi-Property",
    },
  },
];

export function LandingPricing() {
  return (
    <section
      id="pricing"
      className="relative w-full py-8 sm:py-12 bg-gradient-to-b from-slate-50 via-emerald-50/25 to-slate-50 dark:from-[#090D16] dark:via-emerald-950/20 dark:to-[#090D16] scroll-mt-24 overflow-hidden"
    >
      {/* Parallax Floating Ambient Emerald Glows */}
      <ParallaxFloatingOrb color="emerald" speed={50} className="top-1/3 -left-48 w-96 h-96" />
      <ParallaxFloatingOrb color="teal" speed={40} className="bottom-1/4 -right-48 w-96 h-96" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <Pricing
          plans={CANONICAL_PLANS}
          title="Transparent pricing for every hospitality stage"
          description="Start free, upgrade as your table capacity, hotel rooms, and kitchen volume expands. No hidden setup fees or order commissions."
          currency="INR"
          currencySymbol="₹"
        />
      </div>
    </section>
  );
}
