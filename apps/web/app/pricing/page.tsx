"use client";

import * as React from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Check,
  Zap,
  ShieldCheck,
  Building2,
  Hotel,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Pricing, PricingPlan } from "@/components/ui/pricing";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useToast } from "@/components/ui/toast";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface PlanTier {
  id: "free" | "starter" | "growth" | "hotel_pro";
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  popular?: boolean;
  hotelSpecial?: boolean;
  features: string[];
  limits: {
    tables: string;
    dishes: string;
    staff: string;
    locations: string;
  };
}

const PLANS: PlanTier[] = [
  {
    id: "free",
    name: "Free",
    tagline: "For pop-ups, food trucks & trial operators",
    monthlyPrice: 0,
    annualMonthlyPrice: 0,
    limits: {
      tables: "5 Tables",
      dishes: "30 Dishes",
      staff: "2 Staff seats",
      locations: "1 Location",
    },
    features: [
      "Contactless QR digital menu",
      "Real-time guest mobile ordering",
      "Standard web management portal",
      "Community support",
      "Zero commission on orders",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "Essential tools for bustling bistros & cafes",
    monthlyPrice: 999,
    annualMonthlyPrice: 799,
    limits: {
      tables: "20 Tables",
      dishes: "100 Dishes",
      staff: "5 Staff seats",
      locations: "1 Location",
    },
    features: [
      "Everything in Free, plus:",
      "Custom branded QR stands & exports",
      "Direct WhatsApp order receipt alerts",
      "Sales analytics & CSV download",
      "Inventory item availability toggles",
      "14-Day zero-disruption grace period",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "Full-scale dining room & kitchen automation",
    monthlyPrice: 2999,
    annualMonthlyPrice: 2399,
    popular: true,
    limits: {
      tables: "100 Tables",
      dishes: "Unlimited Dishes",
      staff: "25 Staff seats",
      locations: "3 Locations",
    },
    features: [
      "Everything in Starter, plus:",
      "Multi-station Kitchen Display (KDS)",
      "Automated Meta Cloud WhatsApp bot",
      "Multi-course kitchen routing",
      "Live order audio chimes & notifications",
      "Priority 24/7 WhatsApp & phone SLA",
      "14-Day zero-disruption grace period",
    ],
  },
  {
    id: "hotel_pro",
    name: "Hotel Pro",
    tagline: "Luxury hospitality, in-room dining & suites",
    monthlyPrice: 7999,
    annualMonthlyPrice: 6399,
    hotelSpecial: true,
    limits: {
      tables: "Unlimited Tables",
      dishes: "Unlimited Dishes",
      staff: "Unlimited Staff",
      locations: "Multi-Property",
    },
    features: [
      "Everything in Growth, plus:",
      "Hotel In-Room Dining module",
      "Guest Digital DND & Butler calling",
      "Room service delivery routing",
      "Banquet & pool deck station support",
      "99.95% uptime SLA with dedicated TAM",
      "Custom POS / PMS integrations",
      "14-Day zero-disruption grace period",
    ],
  },
];

const COMPARISON_ROWS = [
  { feature: "Active Tables / Guest Rooms", free: "5", starter: "20", growth: "100", hotel_pro: "Unlimited" },
  { feature: "Menu Dishes & Modifiers", free: "30", starter: "100", growth: "Unlimited", hotel_pro: "Unlimited" },
  { feature: "Staff User Accounts", free: "2", starter: "5", growth: "25", hotel_pro: "Unlimited" },
  { feature: "Locations / Properties", free: "1", starter: "1", growth: "3", hotel_pro: "Unlimited" },
  { feature: "Contactless QR Menus", free: true, starter: true, growth: true, hotel_pro: true },
  { feature: "WhatsApp Order Notifications", free: false, starter: true, growth: true, hotel_pro: true },
  { feature: "Interactive Kitchen Display (KDS)", free: false, starter: false, growth: true, hotel_pro: true },
  { feature: "Hotel In-Room Dining & Suites", free: false, starter: false, growth: false, hotel_pro: true },
  { feature: "Guest Digital DND & Butler Call", free: false, starter: false, growth: false, hotel_pro: true },
  { feature: "14-Day Protection Grace Period", free: true, starter: true, growth: true, hotel_pro: true },
  { feature: "Platform Transaction Fee", free: "0%", starter: "0%", growth: "0%", hotel_pro: "0%" },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = React.useState(true);
  const [selectedPlan, setSelectedPlan] = React.useState<PlanTier | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const { tenant, updateTenant } = useAuthStore();
  const { addToast } = useToast();

  const handleSelectPlan = (plan: PlanTier) => {
    setSelectedPlan(plan);
    setIsSuccess(false);
    setIsCheckoutOpen(true);
  };

  const handleConfirmCheckout = () => {
    if (!selectedPlan) return;
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      if (tenant) {
        updateTenant({ plan: selectedPlan.id });
      }
      addToast(
        "success",
        "Subscription Activated",
        `You have successfully subscribed to the ${selectedPlan.name} plan.`
      );
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/70 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between max-w-7xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center shrink-0">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <UtensilsCrossed className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            Dine<span className="text-emerald-500 dark:text-emerald-400">Flow</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link href="/dashboard" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="glow" size="sm" className="text-xs sm:text-sm px-2.5 sm:px-3">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </header>

      {/* Pricing Section using animated Pricing Component */}
      <section className="px-3 sm:px-6 pb-12 max-w-7xl mx-auto w-full">
        <Pricing
          plans={PLANS.map((plan) => ({
            name: plan.name,
            price: plan.monthlyPrice.toString(),
            yearlyPrice: plan.annualMonthlyPrice.toString(),
            period: "month",
            features: plan.features,
            description: plan.tagline,
            buttonText:
              tenant?.plan === plan.id
                ? "Active Plan"
                : plan.monthlyPrice === 0
                ? "Get Started Free"
                : `Choose ${plan.name}`,
            href: "/register",
            isPopular: !!plan.popular,
            limits: plan.limits,
          }))}
          title="One system for restaurants, cafes & luxury resorts"
          description={"Scale effortlessly from a single table to 500 rooms. Zero commission fees on customer orders.\nEvery plan protected by our 14-day zero-disruption guarantee."}
          currency="INR"
          currencySymbol="₹"
          onSelectPlan={(plan) => {
            const matched = PLANS.find((p) => p.name === plan.name);
            if (matched) handleSelectPlan(matched);
          }}
        />
      </section>

      {/* 14-Day Grace Period Protection Banner */}
      <section className="px-3 sm:px-6 pb-16 max-w-7xl mx-auto w-full">
        <div className="rounded-2xl p-5 sm:p-8 bg-gradient-to-r from-emerald-100 dark:from-emerald-950/40 via-white dark:via-slate-900 to-teal-100 dark:to-teal-950/40 border border-emerald-300 dark:border-emerald-500/30 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="h-4 w-4" /> Zero-Disruption Dining Protection
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Never worry about sudden service interruptions
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                If a bank card renewal expires or payment fails on a busy weekend rush, DineFlow grants an automatic <strong>14-day operational grace period</strong>. Your QR menus, KDS screens, and in-room ordering stay 100% active while you update your payment method.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link href="/dashboard/settings" className="w-full sm:w-auto">
                <Button variant="glow" size="md" className="w-full sm:w-auto">
                  View Account Billing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Feature Comparison Table */}
      <section className="px-3 sm:px-6 pb-20 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Compare Plan Features</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Full breakdown of resource limits and architectural capabilities.</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <Table className="w-full min-w-[620px] text-left text-xs border-collapse">
            <TableHeader>
              <TableRow className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70">
                <TableHead className="p-4 text-slate-700 dark:text-slate-400 font-semibold w-1/3">Feature</TableHead>
                <TableHead className="p-4 text-center font-bold text-slate-900 dark:text-white">Free</TableHead>
                <TableHead className="p-4 text-center font-bold text-slate-900 dark:text-white">Starter</TableHead>
                <TableHead className="p-4 text-center font-bold text-emerald-700 dark:text-emerald-400">Growth</TableHead>
                <TableHead className="p-4 text-center font-bold text-amber-700 dark:text-amber-400">Hotel Pro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {COMPARISON_ROWS.map((row, idx) => (
                <TableRow key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <TableCell className="p-4 text-slate-800 dark:text-slate-200 font-medium">{row.feature}</TableCell>
                  {["free", "starter", "growth", "hotel_pro"].map((tier) => {
                    const val = row[tier as keyof typeof row];
                    return (
                      <TableCell key={tier} className="p-4 text-center text-slate-700 dark:text-slate-300">
                        {typeof val === "boolean" ? (
                          val ? (
                            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                          ) : (
                            <span className="text-slate-400 dark:text-slate-600">—</span>
                          )
                        ) : (
                          <span className="font-semibold text-slate-900 dark:text-white">{val}</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="px-6 pb-24 max-w-4xl mx-auto w-full space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Everything you need to know about our subscription and billing.</p>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              What happens if my renewal payment fails on a busy weekend?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              We understand dining operations cannot stop. Our system immediately grants a 14-day protection grace period. Your QR codes, KDS screens, and digital ordering will remain completely functional while your accounting team updates payment credentials.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Do you take any percentage or commission on orders?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              No. DineFlow charges a flat monthly or annual software subscription. You keep 100% of your restaurant revenue.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Can I upgrade or downgrade my tier anytime?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Yes, you can upgrade immediately from your Settings & Billing portal. Prorated credits are applied toward your new tier instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 DineFlow Hospitality Technologies. All prices listed in INR (₹) excluding statutory GST.</p>
      </footer>

      {/* Checkout Simulator Modal */}
      {selectedPlan && (
        <Modal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          title={`Subscribe to ${selectedPlan.name} Tier`}
          description={isSuccess ? "Subscription activated successfully!" : "Review your subscription details and confirm billing."}
          size="md"
        >
          {isSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Welcome to {selectedPlan.name}!</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Your workspace has been upgraded. All capacity limits have been adjusted according to your new plan.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <Link href="/dashboard">
                  <Button variant="glow" size="sm">Go to Dashboard</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => setIsCheckoutOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Selected Tier:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Billing Frequency:</span>
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">{isAnnual ? "Annual (20% Savings)" : "Monthly"}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Base Price:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    ₹{(isAnnual ? selectedPlan.annualMonthlyPrice * 12 : selectedPlan.monthlyPrice).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Estimated GST (18%):</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    ₹{Math.round((isAnnual ? selectedPlan.annualMonthlyPrice * 12 : selectedPlan.monthlyPrice) * 0.18).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between items-center text-slate-900 dark:text-white font-bold text-sm">
                  <span>Total Amount:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 text-base font-black">
                    ₹{Math.round((isAnnual ? selectedPlan.annualMonthlyPrice * 12 : selectedPlan.monthlyPrice) * 1.18).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                <Clock className="h-4 w-4 shrink-0" />
                <span>Protected by 14-day zero-disruption dining guarantee.</span>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button variant="ghost" size="sm" onClick={() => setIsCheckoutOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="glow"
                  size="sm"
                  onClick={handleConfirmCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : `Confirm & Activate ${selectedPlan.name}`}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
