"use client";

import * as React from "react";
import {
  ShieldCheck,
  Lock,
  Database,
  KeyRound,
  FileCheck,
  Server,
  Sparkles,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

interface SecurityPoint {
  icon: React.ElementType;
  title: string;
  desc: string;
}

const SECURITY_POINTS: SecurityPoint[] = [
  {
    icon: Database,
    title: "Multi-Tenant Data Partitioning",
    desc: "Every restaurant and hotel property operates with complete data isolation. Cross-tenant leakage is architecturally impossible.",
  },
  {
    icon: KeyRound,
    title: "Role-Based Access Control (RBAC)",
    desc: "Granular permissions for Waiters, Chefs, Floor Captains, Accountants, and General Managers with scoped token privileges.",
  },
  {
    icon: Lock,
    title: "End-to-End TLS 1.3 Encryption",
    desc: "All network traffic, guest transactions, and API payloads are encrypted with modern cryptographic standards in transit and at rest.",
  },
  {
    icon: FileCheck,
    title: "Tamper-Proof Audit Logging",
    desc: "Critical operations such as bill voids, inventory adjustments, and discount overrides are logged with immutable timestamps.",
  },
  {
    icon: Server,
    title: "Isolated Media & QR Storage",
    desc: "Property assets, menus, and generated QR graphics are stored in private, securely signed storage buckets.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Session Hardening",
    desc: "HttpOnly cookie mechanisms, CSRF protection, and automatic session refresh mitigate unauthorized session replay.",
  },
];

export function LandingSecurity() {
  return (
    <section id="security" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full scroll-mt-24">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shadow-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Enterprise Reliability & Trust</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Built on Platform-Grade Security
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          DineFlow is engineered from the ground up for high-availability multi-tenant hospitality operations.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SECURITY_POINTS.map((item, i) => {
          const Icon = item.icon;
          return (
            <Card
              key={i}
              variant="glass"
              hoverEffect
              className="p-6 transition-all duration-200 border-slate-200/80 dark:border-slate-800/80"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {item.title}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.desc}
              </CardDescription>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
