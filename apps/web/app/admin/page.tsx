"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Building2,
  Hotel,
  AlertTriangle,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  RefreshCw,
  Users,
  UtensilsCrossed,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface TenantRecord {
  id: string;
  name: string;
  city: string;
  plan: "free" | "starter" | "growth" | "hotel_pro";
  cycle: "monthly" | "annual";
  tablesCount: number;
  roomsCount: number;
  status: "active" | "grace_period" | "cancelled";
  mrr: number;
  joinedAt: string;
}

const INITIAL_TENANTS: TenantRecord[] = [
  {
    id: "ten-001",
    name: "The Grand Bistro & Rooftop",
    city: "Mumbai",
    plan: "growth",
    cycle: "annual",
    tablesCount: 38,
    roomsCount: 0,
    status: "active",
    mrr: 2399,
    joinedAt: "Jan 2026",
  },
  {
    id: "ten-002",
    name: "Taj Heritage Palace & Suites",
    city: "Udaipur",
    plan: "hotel_pro",
    cycle: "annual",
    tablesCount: 65,
    roomsCount: 140,
    status: "active",
    mrr: 6399,
    joinedAt: "Mar 2026",
  },
  {
    id: "ten-003",
    name: "Le Petit Cafe & Bakery",
    city: "Bengaluru",
    plan: "starter",
    cycle: "monthly",
    tablesCount: 14,
    roomsCount: 0,
    status: "active",
    mrr: 999,
    joinedAt: "Jun 2026",
  },
  {
    id: "ten-004",
    name: "Seaside Haven Resort & Spa",
    city: "Goa",
    plan: "hotel_pro",
    cycle: "monthly",
    tablesCount: 45,
    roomsCount: 88,
    status: "grace_period",
    mrr: 7999,
    joinedAt: "Apr 2026",
  },
  {
    id: "ten-005",
    name: "Dhaba 1947 Highway Bistro",
    city: "Amritsar",
    plan: "starter",
    cycle: "monthly",
    tablesCount: 18,
    roomsCount: 0,
    status: "grace_period",
    mrr: 999,
    joinedAt: "Jul 2026",
  },
  {
    id: "ten-006",
    name: "Urban Wok Asian Kitchen",
    city: "New Delhi",
    plan: "growth",
    cycle: "monthly",
    tablesCount: 52,
    roomsCount: 0,
    status: "active",
    mrr: 2999,
    joinedAt: "Feb 2026",
  },
  {
    id: "ten-007",
    name: "Green Leaf Pure Veg",
    city: "Ahmedabad",
    plan: "free",
    cycle: "monthly",
    tablesCount: 5,
    roomsCount: 0,
    status: "active",
    mrr: 0,
    joinedAt: "Aug 2026",
  },
];

export default function PlatformAdminPage() {
  const [tenants, setTenants] = React.useState<TenantRecord[]>(INITIAL_TENANTS);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [planFilter, setPlanFilter] = React.useState<string>("all");
  const [selectedTenant, setSelectedTenant] = React.useState<TenantRecord | null>(null);
  const [newPlan, setNewPlan] = React.useState<"free" | "starter" | "growth" | "hotel_pro">("growth");
  const [isOverrideModalOpen, setIsOverrideModalOpen] = React.useState(false);

  const { addToast } = useToast();

  // Metrics calculation
  const totalMRR = tenants.reduce((sum, t) => sum + (t.status !== "cancelled" ? t.mrr : 0), 0);
  const totalARR = totalMRR * 12;
  const activeCount = tenants.filter((t) => t.status === "active").length;
  const graceCount = tenants.filter((t) => t.status === "grace_period").length;

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = planFilter === "all" || t.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  const handleOpenOverride = (t: TenantRecord) => {
    setSelectedTenant(t);
    setNewPlan(t.plan);
    setIsOverrideModalOpen(true);
  };

  const handleConfirmOverride = () => {
    if (!selectedTenant) return;

    const mrrMap = {
      free: 0,
      starter: selectedTenant.cycle === "annual" ? 799 : 999,
      growth: selectedTenant.cycle === "annual" ? 2399 : 2999,
      hotel_pro: selectedTenant.cycle === "annual" ? 6399 : 7999,
    };

    setTenants((prev) =>
      prev.map((t) =>
        t.id === selectedTenant.id
          ? {
              ...t,
              plan: newPlan,
              mrr: mrrMap[newPlan],
              status: "active",
            }
          : t
      )
    );

    setIsOverrideModalOpen(false);
    addToast(
      "success",
      "Plan Override Applied",
      `${selectedTenant.name} subscription successfully updated to ${newPlan.toUpperCase()}.`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 p-3 sm:p-6 md:p-10 font-sans selection:bg-emerald-500/30 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5" /> Platform Super-Admin
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">• DineFlow Core Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              SaaS Platform & Revenue Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Real-time platform financial health, multi-tenant billing status, and plan control.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Return to Restaurant
              </Button>
            </Link>
            <Link href="/pricing" className="hidden xs:inline-flex">
              <Button variant="ghost" size="sm">
                Public Matrix
              </Button>
            </Link>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="glass" className="border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Monthly Run Rate (MRR)</span>
                <span className="p-2 rounded-lg bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                ₹{totalMRR.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +24.8% vs last month
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Annualized ARR</span>
                <span className="p-2 rounded-lg bg-teal-500/15 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400">
                  <TrendingUp className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                ₹{totalARR.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Contracted annualized recurring value
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Active Dining Tenants</span>
                <span className="p-2 rounded-lg bg-blue-500/15 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                  <Building2 className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                {activeCount}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Across {tenants.length} registered properties
              </p>
            </CardContent>
          </Card>

          <Card variant="glass" className={graceCount > 0 ? "border-amber-500/40 bg-amber-500/5" : ""}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Grace Period Retries</span>
                <span className="p-2 rounded-lg bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                {graceCount}
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300/90 font-medium mt-1">
                Protected by 14-day zero-downtime policy
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tier Distribution Bar */}
        <Card variant="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Tenant Subscription Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Free Tier</span>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {tenants.filter((t) => t.plan === "free").length}
                </p>
                <span className="text-[10px] text-slate-500">Trial / Pop-up stores</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Starter Tier</span>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {tenants.filter((t) => t.plan === "starter").length}
                </p>
                <span className="text-[10px] text-slate-500">Single-location bistros</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Growth Tier</span>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {tenants.filter((t) => t.plan === "growth").length}
                </p>
                <span className="text-[10px] text-slate-500">Multi-KDS restaurants</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-amber-600 dark:text-amber-400 font-semibold">Hotel Pro</span>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {tenants.filter((t) => t.plan === "hotel_pro").length}
                </p>
                <span className="text-[10px] text-slate-500">Luxury resorts & suites</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tenants Management Table */}
        <Card variant="glass">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Multi-Tenant Directory
              </CardTitle>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Inspect subscriber status, MRR contributions, and execute plan overrides.
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              <div className="w-full sm:w-64">
                <Input
                  placeholder="Search restaurant or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-3.5 w-3.5 text-slate-500" />}
                />
              </div>

              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-300 focus:outline-none focus:border-emerald-500 shadow-2xs"
              >
                <option value="all">All Plans</option>
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="hotel_pro">Hotel Pro</option>
              </select>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold bg-slate-100/70 dark:bg-slate-950/40">
                    <th className="p-3">Restaurant / Property</th>
                    <th className="p-3">City</th>
                    <th className="p-3">Plan Tier</th>
                    <th className="p-3">Cycle</th>
                    <th className="p-3">Capacity</th>
                    <th className="p-3">Monthly Contribution</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {filteredTenants.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-100/60 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          {t.roomsCount > 0 ? (
                            <Hotel className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0" />
                          ) : (
                            <UtensilsCrossed className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          )}
                          <span>{t.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{t.city}</td>
                      <td className="p-3">
                        <Badge
                          variant={
                            t.plan === "hotel_pro"
                              ? "glow"
                              : t.plan === "growth"
                              ? "success"
                              : t.plan === "starter"
                              ? "info"
                              : "neutral"
                          }
                          size="sm"
                        >
                          {t.plan.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 capitalize">{t.cycle}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">
                        {t.tablesCount} Tables {t.roomsCount > 0 && `• ${t.roomsCount} Rooms`}
                      </td>
                      <td className="p-3 font-mono font-semibold text-slate-900 dark:text-white">
                        ₹{t.mrr.toLocaleString("en-IN")}/mo
                      </td>
                      <td className="p-3">
                        {t.status === "grace_period" ? (
                          <Badge variant="warning" size="sm">Grace (14d)</Badge>
                        ) : (
                          <Badge variant="success" size="sm">Nominal</Badge>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenOverride(t)}
                          className="text-xs"
                        >
                          Override Plan
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

      {/* Plan Override Modal */}
      {selectedTenant && (
        <Modal
          isOpen={isOverrideModalOpen}
          onClose={() => setIsOverrideModalOpen(false)}
          title={`Override Plan: ${selectedTenant.name}`}
          description="Directly assign an operational subscription tier with platform super-admin privileges."
          size="md"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Tenant ID:</span>
                <span className="font-mono text-slate-900 dark:text-white">{selectedTenant.id}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Current Plan:</span>
                <span className="font-bold text-slate-900 dark:text-white capitalize">{selectedTenant.plan}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Subscription Tier</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "free", label: "Free (5 Tables)" },
                  { id: "starter", label: "Starter (20 Tables)" },
                  { id: "growth", label: "Growth (100 Tables)" },
                  { id: "hotel_pro", label: "Hotel Pro (Unlimited)" },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setNewPlan(tier.id as any)}
                    className={`p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                      newPlan === tier.id
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-white font-bold"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setIsOverrideModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="glow" size="sm" onClick={handleConfirmOverride}>
                Apply Override
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
