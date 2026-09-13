"use client";

import * as React from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
  QrCode,
  ChefHat,
  MessageSquare,
  CheckCircle,
  Hotel,
  Coffee,
  Soup,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pricing } from "@/components/ui/pricing";
import AetherFlowHero from "@/components/ui/aether-flow-hero";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#090D16] dark:text-slate-100 flex flex-col relative overflow-hidden transition-colors duration-200">
      {/* Background Ambient Glows */}
      <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-emerald-500/15 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-48 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="h-20 border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-40 bg-white/80 dark:bg-[#090D16]/80 backdrop-blur-xl transition-colors duration-200">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/25 flex items-center justify-center">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center group-hover:bg-transparent transition-colors">
                <UtensilsCrossed className="h-5 w-5 text-emerald-400 group-hover:text-slate-950 transition-colors" />
              </div>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Dine<span className="text-emerald-500 dark:text-emerald-400">Flow</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Features</a>
            <a href="#solutions" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Solutions</a>
            <a href="#pricing" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Pricing</a>
            <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Live Demo</Link>
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Light / Dark Mode Toggle */}
            <ThemeToggle />

            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button variant="glow" size="sm" asChild>
              <Link href="/register">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Interactive Cursor Canvas */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden min-h-[85vh] flex items-center justify-center">
        {/* Cursor interactive dynamic particle canvas matching DineFlow Emerald/Teal palette */}
        <div className="absolute inset-0 z-0">
          <AetherFlowHero
            showOverlayContent={false}
            className="h-full w-full"
            particleColor="rgba(16, 185, 129, 0.85)"
            lineColor="rgba(20, 184, 166, 0.5)"
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center pointer-events-none">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-8 backdrop-blur-md animate-in fade-in zoom-in-95 duration-500 pointer-events-auto shadow-sm">
            <Sparkles className="h-4 w-4" /> Next-Gen Multi-Tenant Restaurant & Hotel OS
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] select-none">
            The Intelligent OS for <br />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">
              Modern Hospitality
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal select-none">
            Empower your restaurants, cafés, hotels, and cloud kitchens with app-less QR code ordering, real-time Kitchen Displays (KDS), and automated WhatsApp customer billing.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
            <Button variant="glow" size="lg" className="w-full sm:w-auto h-13 px-8 text-base cursor-pointer" asChild>
              <Link href="/register">
                Create Restaurant Workspace <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto h-13 px-8 text-base cursor-pointer" asChild>
              <Link href="/dashboard">
                Explore Live Demo Dashboard
              </Link>
            </Button>
          </div>

          {/* Metric Badges */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-200 dark:border-slate-800/80">
            <div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">0 sec</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Customer App Install Time</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">40%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Faster Table Turnover</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">99.99%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Uptime SLA Guaranteed</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">&lt; 100ms</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Live KDS Sync Latency</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions / Business Types */}
      <section id="solutions" className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="success" size="sm">Purpose Built</Badge>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-3">Tailored for every hospitality model</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            One platform adapted to fine dining restaurants, fast-casual cafés, resorts, and cloud kitchens.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: UtensilsCrossed,
              title: "Fine Dining & Bistros",
              desc: "Dynamic table management, sommelier digital wine pairing, and split bills.",
            },
            {
              icon: Coffee,
              title: "Cafés & Bakeries",
              desc: "Counter-pickup queues, custom roast add-ons, and rapid repeat loyalty points.",
            },
            {
              icon: Hotel,
              title: "Hotels & Resorts",
              desc: "In-room QR service, room billing integration, pool cabana ordering.",
            },
            {
              icon: Soup,
              title: "Cloud Kitchens",
              desc: "Multi-brand virtual menus, direct delivery tracking, and central kitchen routing.",
            },
          ].map((sol, i) => (
            <Card key={i} variant="glass" hoverEffect className="relative overflow-hidden">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <sol.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white mb-2">{sol.title}</CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{sol.desc}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="purple" size="sm">Core Capabilities</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-3">
            Engineered for high-volume service
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Eliminate communication bottlenecks between guests, floor captains, and kitchen staff.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card variant="glow" hoverEffect className="border-emerald-500/30">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
              <QrCode className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Contactless Table & Room QR
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Customers scan a table QR code and browse your interactive menu instantly without downloading any app. Works on iOS Safari and Android Chrome out-of-the-box.
            </CardDescription>
          </Card>

          <Card variant="glass" hoverEffect>
            <div className="h-12 w-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
              <ChefHat className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Live Kitchen Display System (KDS)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Real-time station order routing with audio chimes, prep countdown timers, allergy flags, and one-tap bump bar status changes from cooking to plated.
            </CardDescription>
          </Card>

          <Card variant="glass" hoverEffect>
            <div className="h-12 w-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-6">
              <MessageSquare className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              WhatsApp Marketing & Invoicing
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Send automated order updates, digital GST receipts, and personalized promo campaigns right on WhatsApp with 98% open rates.
            </CardDescription>
          </Card>
        </div>
      </section>

      {/* Pricing Section with animated NumberFlow & Confetti */}
      <section id="pricing" className="py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <Pricing
          plans={[
            {
              name: "Free",
              price: "0",
              yearlyPrice: "0",
              period: "month",
              description: "For small cafés & food trucks testing digital menus",
              features: [
                "1 Location",
                "Up to 5 Tables",
                "Digital QR Menu",
                "Basic Order Log",
                "Zero commission on orders",
              ],
              buttonText: "Get Started Free",
              href: "/register",
              isPopular: false,
              limits: {
                tables: "5 Tables",
                dishes: "30 Items",
                staff: "2 Seats",
              },
            },
            {
              name: "Starter",
              price: "1999",
              yearlyPrice: "1599",
              period: "month",
              description: "For standalone diners & busy bistro restaurants",
              features: [
                "Up to 15 Tables",
                "1 Kitchen KDS Screen",
                "WhatsApp Order Notifications",
                "Staff Roles (Waiters)",
                "Daily Sales Reports",
              ],
              buttonText: "Choose Starter",
              href: "/register",
              isPopular: false,
              limits: {
                tables: "15 Tables",
                dishes: "100 Items",
                staff: "5 Seats",
              },
            },
            {
              name: "Growth",
              price: "4999",
              yearlyPrice: "3999",
              period: "month",
              description: "For high-volume restaurants & multi-station kitchens",
              features: [
                "Unlimited Tables",
                "3 Multi-Station KDS Screens",
                "WhatsApp Marketing Campaigns",
                "Full Analytics & Export",
                "Priority Support 24/7",
              ],
              buttonText: "Get Started",
              href: "/register",
              isPopular: true,
              limits: {
                tables: "Unlimited",
                dishes: "Unlimited",
                staff: "25 Seats",
              },
            },
            {
              name: "Hotel Pro",
              price: "9999",
              yearlyPrice: "7999",
              period: "month",
              description: "For hotels, resorts, & multi-outlet dining",
              features: [
                "Room QR Service & Poolside",
                "Multi-Brand Menus",
                "PMS Invoicing Integration",
                "Dedicated Success Manager",
                "Custom Domain & Branding",
              ],
              buttonText: "Contact Enterprise",
              href: "/register",
              isPopular: false,
              limits: {
                tables: "500+ Rooms",
                dishes: "Unlimited",
                staff: "Unlimited",
              },
            },
          ]}
          title="Transparent pricing for every stage"
          description={"Start free, upgrade as your table capacity and kitchen volume expands.\nAll plans include access to our contactless QR portal and 24/7 hospitality support."}
          currency="INR"
          currencySymbol="₹"
        />
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-12 px-6 bg-white dark:bg-[#070A12] mt-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <UtensilsCrossed className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              Dine<span className="text-emerald-500 dark:text-emerald-400">Flow</span>
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            © 2026 DineFlow Technologies. Enterprise Multi-Tenant Hospitality Cloud.
          </p>

          <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <a href="#" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
