"use client";

import * as React from "react";
import {
  Sparkles,
  Check,
  Building2,
  Users,
  Hotel,
  QrCode,
  Sliders,
  ChevronRight,
  Search,
  CreditCard,
  ArrowRightLeft,
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { usePlatformStore, PlanTier, PlatformClient } from "@/lib/stores/platform-store";

export default function PlatformSubscriptionsPage() {
  const { addToast } = useToast();
  const { clients, fetchClients, changeClientPlan } = usePlatformStore();

  React.useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Plan changer modal state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedClientId, setSelectedClientId] = React.useState<string>("");
  const [selectedTier, setSelectedTier] = React.useState<PlanTier>("growth");
  const [selectedCycle, setSelectedCycle] = React.useState<"monthly" | "annual">("monthly");

  // Table search & filter state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterTier, setFilterTier] = React.useState<string>("all");

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
      badge: "14-Day Free Trial",
      description: "Ideal for boutique cafes, food trucks, and single-location bistros.",
      quotas: {
        tables: "Up to 10 Tables",
        rooms: "Not Included",
        staff: "Up to 5 Staff",
        storage: "1 GB",
        support: "Standard Email (24h)",
      },
      features: [
        "14-Day Zero-Risk Free Trial",
        "Up to 10 Tables & 100 Dishes",
        "Live QR Digital Menu & Ordering",
        "Instant Kitchen KDS Display",
        "GST Invoice & Thermal Printing",
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
        tables: "Up to 50 Tables",
        rooms: "Not Included",
        staff: "Up to 20 Staff",
        storage: "5 GB",
        support: "Priority Chat & Phone",
      },
      features: [
        "Everything in Starter",
        "⭐ AI Google Maps Review Smart QR Stand",
        "Multi-Station Kitchen Routing (KDS)",
        "Meta WhatsApp Ordering & Bots",
        "GPS Geofenced Staff Attendance",
        "Automated Multi-Rate Payroll",
        "Gemini AI Brand Logo Studio",
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
        staff: "Unlimited Staff",
        storage: "20 GB",
        support: "24/7 Dedicated Concierge",
      },
      features: [
        "Everything in Growth",
        "⭐ AI Google Maps Review Smart QR Stand",
        "In-Room QR Dining & Butler Calling",
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

  const handleOpenChangePlan = (client?: PlatformClient, defaultTier?: PlanTier) => {
    if (client) {
      setSelectedClientId(client.id);
      setSelectedTier(client.plan);
      setSelectedCycle(client.billingCycle || "monthly");
    } else {
      setSelectedClientId(clients[0]?.id || "");
      if (defaultTier) {
        setSelectedTier(defaultTier);
      }
    }
    setIsModalOpen(true);
  };

  const handleConfirmPlanChange = () => {
    if (!selectedClientId) {
      addToast("error", "Selection Required", "Please select a client workspace to update.");
      return;
    }

    const targetClient = clients.find((c) => c.id === selectedClientId);
    changeClientPlan(selectedClientId, selectedTier, selectedCycle);

    addToast(
      "success",
      "Subscription Plan Updated",
      `${targetClient?.name || "Workspace"} assigned to ${selectedTier.toUpperCase()} tier (${selectedCycle}).`
    );
    setIsModalOpen(false);
  };

  const currentSelectedClient = clients.find((c) => c.id === selectedClientId);

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = filterTier === "all" || c.plan === filterTier;
    return matchesSearch && matchesTier;
  });

  const getTierBadgeStyle = (tier: PlanTier) => {
    switch (tier) {
      case "enterprise":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20";
      case "hotel_pro":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20";
      case "growth":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
      case "starter":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
      default:
        return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Subscription Tiers & Quota Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define pricing tiers, enforce feature gates, and override workspace plans with immediate effect.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="glow"
            size="sm"
            onClick={() => handleOpenChangePlan()}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
          >
            <Sliders className="h-4 w-4 mr-1.5" />
            Change Workspace Plan
          </Button>
        </div>
      </div>

      {/* ── Plan Distribution KPI Cards ───────────────────────────── */}
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

      {/* ── Tiers Grid ────────────────────────────────────────────── */}
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

              <div className="py-2 border-y border-slate-100 dark:border-slate-800/80 font-mono">
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenChangePlan(undefined, tier.tier)}
              className="w-full mt-4 text-xs font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Assign Workspaces to {tier.name}
            </Button>
          </Card>
        ))}
      </div>

      {/* ── Workspaces by Subscription Plan Directory ─────────────── */}
      <Card variant="glass" className="border-slate-200 dark:border-slate-800 overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-rose-500" />
                Active Workspaces & Assigned Plans
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Manage, review, and override current subscription plans across all onboarded restaurants and hotels.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  id="sub-workspace-search"
                  name="workspaceSearch"
                  aria-label="Search workspace or city"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search workspace or city..."
                  className="h-8 pl-8 text-xs bg-white dark:bg-slate-900"
                />
              </div>

              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="all">All Plans</option>
                <option value="trial">Free Trial</option>
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="hotel_pro">Hotel Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <TableHead className="text-xs font-bold text-slate-500">Workspace</TableHead>
                  <TableHead className="text-xs font-bold text-slate-500">Type</TableHead>
                  <TableHead className="text-xs font-bold text-slate-500">Current Plan</TableHead>
                  <TableHead className="text-xs font-bold text-slate-500">Billing Cycle</TableHead>
                  <TableHead className="text-xs font-bold text-slate-500 text-right">MRR</TableHead>
                  <TableHead className="text-xs font-bold text-slate-500">Renewal</TableHead>
                  <TableHead className="text-xs font-bold text-slate-500 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                      No workspaces found matching filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow
                      key={client.id}
                      className="border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/75 dark:hover:bg-slate-900/50"
                    >
                      <TableCell className="py-3">
                        <div className="font-bold text-xs text-slate-900 dark:text-white">{client.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {client.city} • <span className="font-mono">{client.slug}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                          {client.businessType}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${getTierBadgeStyle(client.plan)}`}>
                          {client.plan.replace("_", " ")}
                        </span>
                      </TableCell>

                      <TableCell className="py-3 text-xs capitalize text-slate-700 dark:text-slate-300">
                        {client.billingCycle || "Monthly"}
                      </TableCell>

                      <TableCell className="py-3 text-right font-mono font-bold text-xs text-slate-900 dark:text-white">
                        ₹{client.mrr.toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="py-3 text-xs text-slate-500 font-mono">
                        {client.renewalDate || "Annual"}
                      </TableCell>

                      <TableCell className="py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenChangePlan(client)}
                          className="h-7 text-[11px] font-bold px-2.5 border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                        >
                          Change Plan →
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Interactive Plan Changer Modal ───────────────────────── */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Change Workspace Subscription Plan"
          description="Override quotas, billing cycles, and feature access tier for any tenant."
          size="lg"
        >
          <div className="space-y-4 pt-2">
            {/* 1. Target Workspace Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Target Workspace
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => {
                  setSelectedClientId(e.target.value);
                  const found = clients.find((c) => c.id === e.target.value);
                  if (found) {
                    setSelectedTier(found.plan);
                    setSelectedCycle(found.billingCycle || "monthly");
                  }
                }}
                className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city}) — Currently on {c.plan.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Client Status Pill */}
            {currentSelectedClient && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Current Plan:</span>{" "}
                  <strong className="text-slate-900 dark:text-white uppercase font-mono">
                    {currentSelectedClient.plan.replace("_", " ")}
                  </strong>{" "}
                  <span className="text-slate-400">({currentSelectedClient.billingCycle})</span>
                </div>
                <div className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                  ₹{currentSelectedClient.mrr.toLocaleString("en-IN")}/mo
                </div>
              </div>
            )}

            {/* 2. Select New Plan Tier */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Select New Plan Tier
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { tier: "trial" as PlanTier, label: "14-Day Free Trial", price: "₹0", sub: "Standard trial with Starter features" },
                  { tier: "starter" as PlanTier, label: "Starter Essential", price: "₹999/mo", sub: "10 tables, basic KDS, GST receipts" },
                  { tier: "growth" as PlanTier, label: "Growth Pro", price: "₹2,999/mo", sub: "50 tables, WhatsApp Bot, AI Stand" },
                  { tier: "hotel_pro" as PlanTier, label: "Hotel Pro PMS", price: "₹7,999/mo", sub: "150 suites, In-room dining, Folios" },
                  { tier: "enterprise" as PlanTier, label: "Enterprise Custom", price: "₹14,999/mo", sub: "Unlimited multi-property & custom SLA" },
                ].map((item) => {
                  const isSelected = selectedTier === item.tier;
                  return (
                    <button
                      key={item.tier}
                      type="button"
                      onClick={() => setSelectedTier(item.tier)}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{item.label}</span>
                        <span className="font-mono font-bold text-[11px]">{item.price}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{item.sub}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Billing Cycle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Billing Cycle
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCycle("monthly")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedCycle === "monthly"
                      ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Monthly Billed
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCycle("annual")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedCycle === "annual"
                      ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Annual (20% Savings)
                </button>
              </div>
            </div>

            {/* Confirmation & Audit notice */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                <span>Immediate Quota & Feature Gate Provisioning</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Applying this change will instantly recalculate tenant quotas, adjust feature access switches, and register an entry in the immutable audit ledger.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="glow"
                size="sm"
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
                onClick={handleConfirmPlanChange}
              >
                Apply Plan Override
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
