"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building,
  CreditCard,
  Bell,
  Sparkles,
  Save,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Download,
  FileText,
  Layers,
  Users,
  UtensilsCrossed,
  QrCode,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sun,
  Moon,
  Laptop,
  Palette,
  Upload,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { Modal } from "@/components/ui/modal";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useToast } from "@/components/ui/toast";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { GeminiLogoModal } from "@/components/settings/gemini-logo-modal";

interface Invoice {
  id: string;
  invoiceNumber: string;
  planName: string;
  amount: number;
  currency: string;
  status: "paid" | "pending";
  paidAt: string;
  billingPeriod: string;
}

const INITIAL_INVOICES: Invoice[] = [
  {
    id: "inv-101",
    invoiceNumber: "INV-2026-0901",
    planName: "Growth Tier (Annual)",
    amount: 28788,
    currency: "INR",
    status: "paid",
    paidAt: "01 Sep 2026",
    billingPeriod: "01 Sep 2026 – 01 Sep 2027",
  },
  {
    id: "inv-100",
    invoiceNumber: "INV-2025-0901",
    planName: "Starter Tier",
    amount: 11988,
    currency: "INR",
    status: "paid",
    paidAt: "01 Sep 2025",
    billingPeriod: "01 Sep 2025 – 01 Sep 2026",
  },
];

export default function SettingsPage() {
  const { tenant, updateTenant } = useAuthStore();
  const { addToast } = useToast();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = React.useState("billing");

  // General settings state
  const [name, setName] = React.useState(tenant?.name || "The Grand Bistro");
  const [currency, setCurrency] = React.useState(tenant?.currency || "INR");
  const [logoUrl, setLogoUrl] = React.useState(tenant?.logoUrl || tenant?.logo || "");
  const [isLogoModalOpen, setIsLogoModalOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (tenant?.logoUrl || tenant?.logo) {
      setLogoUrl(tenant.logoUrl || tenant.logo || "");
    }
  }, [tenant]);

  // Billing & Subscription state
  const currentPlan = tenant?.plan || "growth";
  const [isGracePeriod, setIsGracePeriod] = React.useState(false);
  const [invoices, setInvoices] = React.useState<Invoice[]>(INITIAL_INVOICES);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = React.useState(false);
  const [targetUpgradePlan, setTargetUpgradePlan] = React.useState<"free" | "starter" | "growth" | "hotel_pro">("hotel_pro");
  const [isUpgrading, setIsUpgrading] = React.useState(false);

  // Resource usage metrics
  const usage = {
    free: { tables: { used: 4, max: 5 }, dishes: { used: 24, max: 30 }, staff: { used: 2, max: 2 }, price: 0 },
    starter: { tables: { used: 14, max: 20 }, dishes: { used: 68, max: 100 }, staff: { used: 4, max: 5 }, price: 999 },
    growth: { tables: { used: 38, max: 100 }, dishes: { used: 142, max: 9999 }, staff: { used: 11, max: 25 }, price: 2999 },
    hotel_pro: { tables: { used: 120, max: 9999 }, dishes: { used: 280, max: 9999 }, staff: { used: 34, max: 9999 }, price: 7999 },
  }[currentPlan as "free" | "starter" | "growth" | "hotel_pro"] || {
    tables: { used: 14, max: 20 },
    dishes: { used: 48, max: 100 },
    staff: { used: 3, max: 5 },
    price: 999,
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast("error", "File Too Large", "Please select an image smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUri = evt.target?.result as string;
      if (!dataUri) return;

      setLogoUrl(dataUri);
      updateTenant({ logoUrl: dataUri, logo: dataUri });

      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL ||
          (process.env.NODE_ENV === "production"
            ? "https://api-production-f170.up.railway.app/api/v1"
            : "http://localhost:8080/api/v1");
        const token = useAuthStore.getState().accessToken;
        if (token) {
          await fetch(`${apiBase}/tenant/logo`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ logoUrl: dataUri }),
          });
        }
      } catch (err) {
        console.warn("Backend logo sync warning:", err);
      }

      addToast("success", "Logo Uploaded", "Your workspace logo has been updated.");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveLogo = async () => {
    setLogoUrl("");
    updateTenant({ logoUrl: "", logo: "" });

    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL ||
        (process.env.NODE_ENV === "production"
          ? "https://api-production-f170.up.railway.app/api/v1"
          : "http://localhost:8080/api/v1");
      const token = useAuthStore.getState().accessToken;
      if (token) {
        await fetch(`${apiBase}/tenant/logo`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ logoUrl: "" }),
        });
      }
    } catch (err) {
      console.warn("Backend logo remove warning:", err);
    }

    addToast("info", "Logo Removed", "Reverted to default DineFlow logo.");
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    updateTenant({ name, currency, logoUrl, logo: logoUrl });

    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL ||
        (process.env.NODE_ENV === "production"
          ? "https://api-production-f170.up.railway.app/api/v1"
          : "http://localhost:8080/api/v1");
      const token = useAuthStore.getState().accessToken;
      if (token) {
        await fetch(`${apiBase}/tenant`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, currency, logoUrl }),
        });
      }
    } catch (err) {
      console.warn("Backend tenant update warning:", err);
    }

    addToast("success", "Settings Saved", "Your restaurant workspace profile was updated.");
  };

  const handleConfirmUpgrade = () => {
    setIsUpgrading(true);
    setTimeout(() => {
      setIsUpgrading(false);
      setIsUpgradeModalOpen(false);
      updateTenant({ plan: targetUpgradePlan });

      const newInv: Invoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        planName: `${targetUpgradePlan.toUpperCase()} Plan Upgrade`,
        amount: targetUpgradePlan === "hotel_pro" ? 7999 : targetUpgradePlan === "growth" ? 2999 : 999,
        currency: "INR",
        status: "paid",
        paidAt: "Today",
        billingPeriod: "Immediate – 30 Days",
      };
      setInvoices([newInv, ...invoices]);
      setIsGracePeriod(false);

      addToast(
        "success",
        "Subscription Upgraded",
        `Your workspace has been successfully upgraded to ${targetUpgradePlan.toUpperCase()}.`
      );
    }, 1000);
  };

  const handleSimulateGracePeriod = () => {
    setIsGracePeriod(true);
    addToast(
      "warning",
      "Grace Period Activated (Simulated)",
      "Payment failure detected. DineFlow's 14-day zero-disruption dining protection is active."
    );
  };

  const handleResolvePayment = () => {
    setIsGracePeriod(false);
    addToast(
      "success",
      "Payment Method Verified",
      "Subscription restored to normal active status. All systems fully nominal."
    );
  };

  const handleDownloadInvoice = (inv: Invoice) => {
    addToast(
      "info",
      "Downloading Tax Invoice",
      `Generating official PDF for invoice ${inv.invoiceNumber} (Amount: ₹${inv.amount.toLocaleString("en-IN")}).`
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
          <Sparkles className="h-3.5 w-3.5" /> Workspace Configuration
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Settings & Billing
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Manage your brand profile, tax registrations, subscription plans, and invoice recipients.
        </p>
      </div>

      <Tabs
        tabs={[
          { id: "billing", label: "Subscription & Invoices" },
          { id: "general", label: "Business Details" },
          { id: "appearance", label: "Appearance & Theme" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* ── Tab: Appearance & Theme ────────────────────────────────────────── */}
      {activeTab === "appearance" && (
        <div className="space-y-6">
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Display Appearance
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Choose how DineFlow appears on your device. Changes are saved automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Light Mode Option */}
                <div
                  onClick={() => {
                    setTheme("light");
                    addToast("info", "Theme Changed", "Switched to Light mode.");
                  }}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-3 group",
                    theme === "light"
                      ? "border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/10"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <div className="h-28 rounded-xl bg-slate-100 border border-slate-200 p-2.5 flex flex-col gap-2 overflow-hidden shadow-inner">
                    <div className="h-3 w-16 rounded bg-slate-300" />
                    <div className="flex gap-2 flex-1">
                      <div className="w-12 rounded bg-white border border-slate-200" />
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="h-4 rounded bg-white border border-slate-200 shadow-xs" />
                        <div className="h-8 rounded bg-white border border-slate-200 shadow-xs" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Light Mode</span>
                    </div>
                    {theme === "light" && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    Clean high-contrast daytime UI for well-lit dining areas.
                  </p>
                </div>

                {/* Dark Mode Option */}
                <div
                  onClick={() => {
                    setTheme("dark");
                    addToast("info", "Theme Changed", "Switched to Dark mode.");
                  }}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-3 group",
                    theme === "dark"
                      ? "border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/10"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <div className="h-28 rounded-xl bg-[#090D16] border border-slate-800 p-2.5 flex flex-col gap-2 overflow-hidden shadow-inner">
                    <div className="h-3 w-16 rounded bg-slate-800" />
                    <div className="flex gap-2 flex-1">
                      <div className="w-12 rounded bg-slate-900 border border-slate-800" />
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="h-4 rounded bg-slate-900 border border-slate-800" />
                        <div className="h-8 rounded bg-slate-900 border border-slate-800" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-indigo-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Dark Mode</span>
                    </div>
                    {theme === "dark" && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    Sleek dark theme for night service, bar terminals, and KDS.
                  </p>
                </div>

                {/* System Mode Option */}
                <div
                  onClick={() => {
                    setTheme("system");
                    addToast("info", "Theme Changed", "Synchronized with system appearance.");
                  }}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-3 group",
                    theme === "system"
                      ? "border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/10"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <div className="h-28 rounded-xl bg-gradient-to-r from-slate-100 to-[#090D16] border border-slate-300 dark:border-slate-700 p-2.5 flex flex-col gap-2 overflow-hidden shadow-inner">
                    <div className="h-3 w-16 rounded bg-slate-400/50" />
                    <div className="flex gap-2 flex-1">
                      <div className="w-12 rounded bg-white/50 dark:bg-slate-900/60 border border-slate-400/30" />
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="h-4 rounded bg-white/50 dark:bg-slate-900/60 border border-slate-400/30" />
                        <div className="h-8 rounded bg-white/50 dark:bg-slate-900/60 border border-slate-400/30" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Laptop className="h-4 w-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">System Sync</span>
                    </div>
                    {theme === "system" && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    Automatically adapts with your operating system appearance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Tab: Business Details ────────────────────────────────────────── */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveGeneral} className="space-y-6">
          {/* ── Brand Logo & Visual Identity Card ───────────────────────────── */}
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Brand Logo & Visual Identity
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Displayed at the extreme top-left of your dashboard, guest QR digital menus, and tax receipts.
                  </CardDescription>
                </div>
                {logoUrl && (
                  <Badge variant="glow" size="sm">
                    Custom Logo Active
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Hidden file input for logo upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
                onChange={handleLogoUpload}
              />

              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                {/* Logo Display Box */}
                <div className="h-24 w-24 rounded-2xl overflow-hidden border-2 border-emerald-500/30 bg-white dark:bg-[#0A0F1D] flex items-center justify-center p-2 shrink-0 shadow-md">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={name || "Client Logo"}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-2 text-slate-400">
                      <UtensilsCrossed className="h-8 w-8 text-emerald-500/50 mb-1" />
                      <span className="text-[10px] font-semibold">DineFlow</span>
                    </div>
                  )}
                </div>

                {/* Actions & Info */}
                <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {logoUrl ? "Active Workspace Logo" : "No Custom Logo Uploaded"}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {logoUrl
                        ? "Your custom logo is currently visible at the extreme top-left of the sidebar and customer menu."
                        : "Upload your official restaurant/hotel logo, or let Gemini AI design a bespoke vector logo for you."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      leftIcon={<Upload className="h-3.5 w-3.5" />}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {logoUrl ? "Upload New Logo" : "Upload Logo"}
                    </Button>

                    <Button
                      type="button"
                      variant="glow"
                      size="sm"
                      leftIcon={<Sparkles className="h-3.5 w-3.5" />}
                      onClick={() => setIsLogoModalOpen(true)}
                    >
                      Generate with Gemini AI
                    </Button>

                    {logoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        leftIcon={<Trash2 className="h-3.5 w-3.5 text-rose-400" />}
                        onClick={handleRemoveLogo}
                        className="text-rose-600 hover:text-rose-700 dark:text-rose-400"
                      >
                        Remove Logo
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">General Information</CardTitle>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                Shown to diners on digital menus, printed QR stands, and WhatsApp bills.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Restaurant / Brand Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Display Currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  helperText="e.g. INR (₹), USD ($), EUR (€)"
                />
                <Input
                  label="GSTIN / Tax ID"
                  placeholder="27AABCU9603R1ZM"
                  helperText="Printed on digital tax receipts"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="glow" size="sm" type="submit" leftIcon={<Save className="h-3.5 w-3.5" />}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {/* ── Tab: Subscription & Invoices ─────────────────────────────────── */}
      {activeTab === "billing" && (
        <div className="space-y-6">
          {/* 14-Day Grace Period Alert Banner (if simulated or active) */}
          {isGracePeriod ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-300">
                    Payment Issue — 14-Day Zero-Disruption Grace Period Active
                  </h4>
                  <p className="text-xs text-amber-200/80 mt-0.5 max-w-xl">
                    Your scheduled renewal could not be processed. Under DineFlow&apos;s protection policy, your live QR menus, Kitchen Displays, and guest ordering remain <strong>100% operational</strong>. Please update your billing method within 14 days.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="primary" size="sm" onClick={handleResolvePayment}>
                  Update & Retry Payment
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
                <span>Account protected by DineFlow 14-day zero-disruption guarantee.</span>
              </div>
              <button
                onClick={handleSimulateGracePeriod}
                className="text-[11px] text-slate-400 hover:text-amber-400 underline transition-colors cursor-pointer"
                title="Test payment failure grace period flow"
              >
                Simulate Payment Retry Window
              </button>
            </div>
          )}

          {/* Active Plan Card */}
          <Card variant="glow" className="border-emerald-500/30">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                    {currentPlan.replace("_", " ")} Tier
                  </CardTitle>
                  <Badge variant={isGracePeriod ? "warning" : "success"} size="sm">
                    {isGracePeriod ? "Grace Period (14 Days)" : "Active"}
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Next automated renewal: <strong className="text-slate-800 dark:text-slate-300">October 12, 2026</strong> (Auto-renewal via Card ending in 4242)
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    ₹{usage.price.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">per month</p>
                </div>
                <Button
                  variant="glow"
                  size="sm"
                  onClick={() => setIsUpgradeModalOpen(true)}
                  leftIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
                >
                  Change Plan
                </Button>
              </div>
            </CardHeader>

            {/* Visual Resource Usage Meters */}
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-4">
                  Plan Resource Utilization
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tables Meter */}
                  <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-400 flex items-center gap-1.5 font-semibold">
                        <QrCode className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Active Tables & Rooms
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {usage.tables.used} / {usage.tables.max === 9999 ? "∞" : usage.tables.max}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.round((usage.tables.used / (usage.tables.max === 9999 ? 200 : usage.tables.max)) * 100))}%`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {usage.tables.max === 9999 ? "Unlimited tables capacity" : `${usage.tables.max - usage.tables.used} tables remaining`}
                    </p>
                  </div>

                  {/* Dishes Meter */}
                  <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-400 flex items-center gap-1.5 font-semibold">
                        <UtensilsCrossed className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" /> Menu Dishes & Items
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {usage.dishes.used} / {usage.dishes.max === 9999 ? "∞" : usage.dishes.max}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.round((usage.dishes.used / (usage.dishes.max === 9999 ? 500 : usage.dishes.max)) * 100))}%`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {usage.dishes.max === 9999 ? "Unlimited digital catalog" : `${usage.dishes.max - usage.dishes.used} items remaining`}
                    </p>
                  </div>

                  {/* Staff Meter */}
                  <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-400 flex items-center gap-1.5 font-semibold">
                        <Users className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" /> Staff Accounts
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {usage.staff.used} / {usage.staff.max === 9999 ? "∞" : usage.staff.max}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.round((usage.staff.used / (usage.staff.max === 9999 ? 50 : usage.staff.max)) * 100))}%`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {usage.staff.max === 9999 ? "Unlimited team seats" : `${usage.staff.max - usage.staff.used} staff seats available`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/80">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Need to compare all architecture specs?
                </div>
                <Link href="/pricing">
                  <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="h-3 w-3" />}>
                    View Public Pricing Matrix
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Invoices & Receipts History */}
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Billing History & Invoices
                </CardTitle>
                <CardDescription className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Tax-compliant GST invoices for your hospitality accounting team.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold bg-slate-50/60 dark:bg-transparent">
                      <th className="py-2.5 pl-2">Invoice Number</th>
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Description</th>
                      <th className="py-2.5">Amount</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right pr-2">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 pl-2 font-mono font-medium text-slate-900 dark:text-white">{inv.invoiceNumber}</td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">{inv.paidAt}</td>
                        <td className="py-3 text-slate-800 dark:text-slate-300 font-medium">{inv.planName}</td>
                        <td className="py-3 font-semibold text-slate-900 dark:text-white font-mono">₹{inv.amount.toLocaleString("en-IN")}</td>
                        <td className="py-3">
                          <Badge variant="success" size="sm">Paid</Badge>
                        </td>
                        <td className="py-3 text-right pr-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadInvoice(inv)}
                            leftIcon={<Download className="h-3 w-3" />}
                            className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium"
                          >
                            PDF
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upgrade Subscription Modal */}
      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Switch Subscription Plan"
        description="Select a new tier to adjust your operational capacities instantly."
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "starter" as const, name: "Starter", price: "₹999/mo", desc: "20 Tables, 100 Dishes, 5 Staff" },
              { id: "growth" as const, name: "Growth", price: "₹2,999/mo", desc: "100 Tables, Unlimited Dishes, 25 Staff" },
              { id: "hotel_pro" as const, name: "Hotel Pro", price: "₹7,999/mo", desc: "Unlimited Rooms & Tables, In-Room Dining" },
            ].map((p) => {
              const isSelected = targetUpgradePlan === p.id;
              const isCurrent = currentPlan === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => !isCurrent && setTargetUpgradePlan(p.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isCurrent
                      ? "border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/40 opacity-50 cursor-not-allowed"
                      : isSelected
                      ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-950/60 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</span>
                    {isCurrent && <Badge variant="neutral" size="sm">Current</Badge>}
                  </div>
                  <p className="text-emerald-700 dark:text-emerald-400 font-extrabold text-sm mb-2">{p.price}</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">{p.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Plan upgrades take effect immediately. Remaining days on your current cycle will be prorated.</span>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setIsUpgradeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="glow"
              size="sm"
              onClick={handleConfirmUpgrade}
              disabled={isUpgrading || targetUpgradePlan === currentPlan}
            >
              {isUpgrading ? "Updating Plan..." : `Upgrade to ${targetUpgradePlan.toUpperCase()}`}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Gemini AI Logo Generation Studio Modal */}
      <GeminiLogoModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        onLogoApplied={(newLogo) => setLogoUrl(newLogo)}
      />
    </div>
  );
}
