"use client";

import * as React from "react";
import Link from "next/link";
import { UtensilsCrossed, Sparkles, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070A12] mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center">
                <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <UtensilsCrossed className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Dine<span className="text-emerald-500 dark:text-emerald-400">Flow</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              The operating system for modern hospitality. Unifying contactless QR ordering, real-time Kitchen Displays (KDS), hotel room dining, staff geofencing, and automated WhatsApp billing.
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational (99.99% Uptime)</span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Product
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  QR Ordering
                </a>
              </li>
              <li>
                <a href="#interactive-demo" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Kitchen Display (KDS)
                </a>
              </li>
              <li>
                <a href="#hospitality-modules" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Hotel Room Service
                </a>
              </li>
              <li>
                <a href="#hospitality-modules" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Staff Geofencing
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Pricing Plans
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Live Demo Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Solutions */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Solutions
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <a href="#solutions" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Fine Dining & Bistros
                </a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Cafés & Bakeries
                </a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Hotels & Resorts
                </a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Cloud Kitchens
                </a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Food Trucks & Pop-ups
                </a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Multi-Outlet Chains
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Legal */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Platform & Trust
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <a href="#security" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Security Architecture
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Sign In to Workspace
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Create Workspace
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 DineFlow Technologies Inc. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span>Multi-Tenant Hospitality Cloud</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
