"use client";

import * as React from "react";
import {
  QrCode,
  UtensilsCrossed,
  Grid,
  ChefHat,
  Hotel,
  Coffee,
  Users,
  MapPin,
  CalendarCheck,
  CreditCard,
  Send,
  MessageSquare,
  Receipt,
  BellRing,
  BarChart3,
  ShieldCheck,
  Layers,
  WifiOff,
  Sparkles,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FeatureItem {
  icon: React.ElementType;
  title: string;
  description: string;
  category: "operations" | "hotel" | "staff" | "growth" | "platform";
}

const FEATURES: FeatureItem[] = [
  {
    icon: QrCode,
    title: "Contactless QR Ordering",
    description: "App-less guest ordering directly from iOS Safari and Android Chrome with instant menu loading.",
    category: "operations",
  },
  {
    icon: UtensilsCrossed,
    title: "Menu & 86 Item Control",
    description: "Multi-category menus, dynamic pricing, modifier groups, and one-tap out-of-stock toggles.",
    category: "operations",
  },
  {
    icon: Grid,
    title: "Visual Table Floor Plans",
    description: "Interactive floor layouts, dynamic QR code generation, and live table occupancy states.",
    category: "operations",
  },
  {
    icon: ChefHat,
    title: "Kitchen Display System (KDS)",
    description: "Multi-station routing, audio chimes, prep timers, allergy alerts, and bump bar status updates.",
    category: "operations",
  },
  {
    icon: Hotel,
    title: "Hotel Room Management",
    description: "Room inventory grid, housekeeping status, check-in logs, and multi-wing property oversight.",
    category: "hotel",
  },
  {
    icon: Coffee,
    title: "In-Room Dining Service",
    description: "Guest room QR menus, direct kitchen delivery routing, and automatic room folio charge settlement.",
    category: "hotel",
  },
  {
    icon: Users,
    title: "Staff Roles & Access Control",
    description: "Granular role permissions for floor captains, head chefs, waiters, cashiers, and administrators.",
    category: "staff",
  },
  {
    icon: MapPin,
    title: "Attendance & GPS Geofencing",
    description: "Perimeter-verified mobile clock-ins with biometric/selfie verification and tamper-proof logs.",
    category: "staff",
  },
  {
    icon: CalendarCheck,
    title: "Leave Management",
    description: "Staff leave requests, automated manager approvals, and real-time shift coverage tracking.",
    category: "staff",
  },
  {
    icon: CreditCard,
    title: "Payroll & Salary Structures",
    description: "Automated monthly salary calculation, overtime tracking, deductions, and downloadable pay slips.",
    category: "staff",
  },
  {
    icon: Send,
    title: "WhatsApp Marketing Campaigns",
    description: "Personalized seasonal promotions, broadcast menus, and customer re-engagement campaigns.",
    category: "growth",
  },
  {
    icon: MessageSquare,
    title: "Automated WhatsApp Alerts",
    description: "Real-time order confirmations, live kitchen progress updates, and digital payment receipts.",
    category: "growth",
  },
  {
    icon: Receipt,
    title: "Invoicing & GST Compliance",
    description: "Compliant digital tax invoices, ESC/POS thermal printer support, and instant PDF downloads.",
    category: "growth",
  },
  {
    icon: BellRing,
    title: "Real-Time Audio Notifications",
    description: "Instant audible kitchen alerts and waiter call-bell notifications with zero latency bottlenecks.",
    category: "operations",
  },
  {
    icon: BarChart3,
    title: "Reports & Business Intelligence",
    description: "Daily revenue, hourly volume peaks, dish profitability analysis, and table turnover analytics.",
    category: "growth",
  },
  {
    icon: ShieldCheck,
    title: "Platform-Grade Security",
    description: "End-to-end TLS 1.3 encryption, secure session tokens, role authorization, and audit logs.",
    category: "platform",
  },
  {
    icon: Layers,
    title: "Multi-Tenant Architecture",
    description: "Complete tenant data isolation, custom property branding, and scalable cloud infrastructure.",
    category: "platform",
  },
  {
    icon: WifiOff,
    title: "Offline & Network Resilience",
    description: "Optimistic UI mutations, background sync queues, and reconnection auto-recovery.",
    category: "platform",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full scroll-mt-24">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Complete Feature Matrix</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Engineered for high-volume service
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Eliminate communication bottlenecks between guests, floor captains, kitchen stations, and back-office management.
        </p>
      </div>

      {/* 18-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {FEATURES.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <Card
              key={i}
              variant="glass"
              hoverEffect
              className="p-5 sm:p-6 transition-all duration-200 border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between group"
            >
              <div>
                <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110 group-hover:bg-emerald-500/15">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  {feature.description}
                </CardDescription>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
