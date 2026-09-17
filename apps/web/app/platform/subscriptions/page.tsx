"use client";

import * as React from "react";
import { Sparkles, Check, Building2, Users, Hotel, QrCode, Sliders, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePlatformStore, PlanTier } from "@/lib/stores/platform-store";

export default function PlatformSubscriptionsPage() {
  const { clients, fetchClients } = usePlatformStore();

  React.useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const planCounts = {
    trial: clients.filter((c) => c.plan === "trial").length,
    starter: clients.filter((c) => c.plan === "starter").length,
    growth: clients.filter((c) => c.plan === "growth").length,
    hotel_pro: clients.filter((c) => c.plan === "hotel_pro").length,
    enterprise: clients.filter((c) => c.plan === "enterprise").length,
  };

  const TIERS: {
    tier: PlanTier;
    name: string;
    priceMonthly: number;
    priceAnnual: number;
    badge?: string;
    description: string;
    quotas: {
      tables: string;
      rooms: string;
      staff: string;
      storage: string;
      support: string;
    };
    features: string[];
  }[] = [
    {
      tier: "starter",
      name: "Starter Essential",
      priceMonthly: 999,
      priceAnnual: 9590,
      description: "Ideal for boutique cafes, food trucks, and single-location bistros.",
      quotas: {
        tables: "Up to 20 Tables",
        rooms: "Not Included",
        staff: "Up to 5 Staff",
        storage: "1 GB",
        support: "Standard Email (24h)",
      },
      features: [
        "Live QR Digital Menu",
        "Instant Kitchen KDS Display",
        "Basic Daily Sales Reports",
        "GST Invoice Generator",
      ],
    },
    {
      tier: "growth",
      name: "Growth Pro",
      priceMonthly: 2999,
      priceAnnual: 28790,
      badge: "Most Popular",
      description: "For high-volume multi-zone restaurants, rooftop bars, and lounges.",
      quotas: {
        tables: "Unlimited Tables",
        rooms: "Not Included",
        staff: "Up to 25 Staff",
        storage: "5 GB",
        support: "Priority Chat & Phone",
      },
      features: [
        "Everything in Starter",
        "Meta WhatsApp Ordering & Bots",
        "GPS Geofenced Staff Attendance",
        "AI Demand Forecasting & Upsell",
        "Automated Multi-Rate Payroll",
      ],
    },
    {
      tier: "hotel_pro",
      name: "Hotel Pro PMS",
      priceMonthly: 7999,
      priceAnnual: 76790,
      badge: "Enterprise Hospitality",
      description: "Full property management for luxury resorts, boutique hotels, and chalets.",
      quotas: {
        tables: "Unlimited Tables",
        rooms: "Up to 150 Suites",
        staff: "Up to 100 Staff",
        storage: "20 GB",
        support: "24/7 Dedicated Concierge",
      },
      features: [
        "Everything in Growth",
        "In-Room QR Acrylic Tent Stands",
        "Housekeeping Sanitization Flow",
        "Guest Folio Room Billing",
        "Extend-Stay & Late Check-Out",
      ],
    },
    {
      tier: "enterprise",
      name: "Enterprise Custom",
      priceMonthly: 14999,
      priceAnnual: 143990,
      badge: "Custom SLA",
      description: "For national restaurant chains, multi-property hotel groups, and franchises.",
      quotas: {
        tables: "Unlimited Multi-Branch",
        rooms: "Unlimited Multi-Property",
        staff: "Unlimited Staff",
        storage: "100 GB Dedicated",
        support: "Dedicated Account Director",
      },
      features: [
        "Everything in Hotel Pro",
        "Custom ERP & SAP API Connector",
        "White-label Custom Domain & SSL",
        "Custom Machine Learning Pipeline",
        "99.99% Financial Uptime SLA",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Subscription Tiers & Quota Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define pricing tiers, enforce feature gates, and monitor client distribution across plans.
          </p>
        </div>
      </div>

      {/* Plan Distribution KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(["trial", "starter", "growth", "hotel_pro", "enterprise"] as PlanTier[]).map((tier) => (
          <Card key={tier} variant="glass" className="p-3 border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {tier.replace("_", " ")}
            </span>
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-0.5 block">
              {planCounts[tier] || 0}
            </span>
            <span className="text-[10px] text-slate-400">Workspaces</span>
          </Card>
        ))}
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TIERS.map((tier) => (
          <Card
            key={tier.tier}
            variant="glass"
            className="p-5 border-slate-200 dark:border-slate-800 flex flex-col justify-between relative overflow-hidden"
          >
            {tier.badge && (
              <div className="absolute top-0 right-0 px-3 py-1 bg-rose-500 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-bl-xl shadow-xs">
                {tier.badge}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">{tier.name}</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{tier.description}</p>
              </div>

              <div className="py-2 border-y border-slate-100 dark:divide-slate-800/60 font-mono">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  ₹{tier.priceMonthly.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-slate-400"> /month</span>
                <span className="text-[10px] text-slate-500 block">
                  or ₹{tier.priceAnnual.toLocaleString("en-IN")}/yr billed annually
                </span>
              </div>

              {/* Quotas */}
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Tables:</span>
                  <span className="font-semibold">{tier.quotas.tables}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Rooms:</span>
                  <span className="font-semibold">{tier.quotas.rooms}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Staff:</span>
                  <span className="font-semibold">{tier.quotas.staff}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Storage:</span>
                  <span className="font-semibold">{tier.quotas.storage}</span>
                </div>
              </div>

              {/* Features */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px]">
                {tier.features.map((feat) => (
                  <div key={feat} className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
