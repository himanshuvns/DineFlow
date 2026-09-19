"use client";

import * as React from "react";
import { Pricing, PricingPlan } from "@/components/ui/pricing";

const CANONICAL_PLANS: PricingPlan[] = [
  {
    name: "Free",
    price: "0",
    yearlyPrice: "0",
    period: "month",
    description: "For pop-ups, food trucks & trial operators",
    features: [
      "1 Location / Outlet",
      "Up to 5 Active Tables",
      "Digital Contactless QR Menu",
      "Real-Time Guest Mobile Ordering",
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
      "Up to 20 Active Tables",
      "1 Kitchen KDS Screen",
      "Custom Branded QR Stands",
      "WhatsApp Order Receipt Alerts",
      "Staff Roles & Waiter Accounts",
      "Daily Sales Reports & CSV Export",
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
      "Up to 100 Active Tables",
      "Multi-Station Kitchen Display (KDS)",
      "Automated Meta Cloud WhatsApp Bot",
      "Multi-Course Kitchen Routing",
      "Live Order Audio Chimes",
      "Priority 24/7 WhatsApp & Phone Support",
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
      "Unlimited Tables & Guest Rooms",
      "Hotel In-Room Dining Module",
      "Guest Digital DND & Butler Calling",
      "Room Service Delivery Routing",
      "Consolidated Room Folio Billing",
      "Custom POS / PMS Integrations",
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
    <section id="pricing" className="scroll-mt-24 w-full">
      <Pricing
        plans={CANONICAL_PLANS}
        title="Transparent pricing for every hospitality stage"
        description="Start free, upgrade as your table capacity, hotel rooms, and kitchen volume expands. No hidden setup fees or order commissions."
        currency="INR"
        currencySymbol="₹"
      />
    </section>
  );
}
