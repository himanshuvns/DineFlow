"use client";

import * as React from "react";
import { Pricing, PricingPlan } from "@/components/ui/pricing";

const CANONICAL_PLANS: PricingPlan[] = [
  {
    name: "Starter",
    price: "999",
    yearlyPrice: "799",
    period: "month",
    description: "Essential tools for bustling bistros & cafés (14-Day Free Trial)",
    features: [
      "14-Day Zero-Risk Free Trial",
      "Up to 10 Tables & 100 Dishes",
      "1 Kitchen KDS Screen with Sound Chimes",
      "Digital Contactless QR Menu & Ordering",
      "Automated WhatsApp Order Receipts",
      "Staff Roles & Daily CSV Sales Export",
    ],
    buttonText: "Start 14-Day Free Trial",
    href: "/register",
    isPopular: false,
    limits: {
      tables: "10 Tables",
      dishes: "100 Dishes",
      staff: "5 Seats",
      locations: "1 Location",
    },
  },
  {
    name: "Growth Pro",
    price: "2999",
    yearlyPrice: "2399",
    period: "month",
    description: "Full-scale dining room, kitchen automation & AI review growth",
    features: [
      "Everything in Starter, plus:",
      "Up to 50 Tables & Unlimited Dishes",
      "⭐ AI Google Maps Review Smart QR & Copilot",
      "Multi-Station Kitchen Routing (KDS)",
      "Automated Meta Cloud WhatsApp Bot",
      "GPS Geofenced Staff Attendance & Payroll",
      "Gemini AI Brand Logo & Demand Studio",
      "Priority 24/7 Phone & WhatsApp Support",
    ],
    buttonText: "Choose Growth Pro",
    href: "/register",
    isPopular: true,
    limits: {
      tables: "50 Tables",
      dishes: "Unlimited",
      staff: "20 Seats",
      locations: "3 Locations",
    },
  },
  {
    name: "Hotel Pro PMS",
    price: "7999",
    yearlyPrice: "6399",
    period: "month",
    description: "For luxury hospitality, in-room dining, suites & chalets",
    features: [
      "Everything in Growth Pro, plus:",
      "Unlimited Tables & Up to 150 Suites",
      "⭐ AI Google Maps Review Smart QR Stand",
      "In-Room QR Dining & Butler Calling",
      "Digital DND & Housekeeping Requests",
      "Consolidated Guest Room Folio Billing",
      "Multi-Property Centralized Management",
      "Dedicated Hospitality Account Manager",
    ],
    buttonText: "Choose Hotel Pro",
    href: "/register",
    isPopular: false,
    limits: {
      tables: "Unlimited",
      dishes: "Unlimited",
      staff: "Unlimited",
      locations: "Multi-Property",
    },
  },
  {
    name: "Enterprise Custom",
    price: "14999",
    yearlyPrice: "11999",
    period: "month",
    description: "For national restaurant chains, hotel groups & franchises",
    features: [
      "Everything in Hotel Pro, plus:",
      "Unlimited Multi-Branch & Properties",
      "Custom ERP/SAP & POS API Connectors",
      "White-label Custom Domain & SSL",
      "Dedicated Database & 99.99% Financial SLA",
    ],
    buttonText: "Contact Enterprise",
    href: "/register",
    isPopular: false,
    limits: {
      tables: "Unlimited",
      dishes: "Unlimited",
      staff: "Unlimited",
      locations: "Unlimited",
    },
  },
];

export function LandingPricing() {
  return (
    <section
      id="pricing"
      className="relative w-full py-12 sm:py-16 bg-transparent scroll-mt-32 overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <Pricing
          plans={CANONICAL_PLANS}
          title="Transparent pricing for every hospitality stage"
          description="Start with our 14-day free trial, upgrade as your table capacity, hotel rooms, and kitchen volume expands. No hidden setup fees or order commissions."
          currency="INR"
          currencySymbol="₹"
        />
      </div>
    </section>
  );
}
