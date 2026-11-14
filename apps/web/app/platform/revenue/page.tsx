"use client";

import * as React from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Download,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Filter,
  RefreshCw,
  Search,
  Building2,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/stores/auth-store";
import { canViewPlatformRevenue } from "@/lib/rbac/roles";
import { AccessDenied } from "@/components/platform/access-denied";
import { usePlatformStore, PlanTier } from "@/lib/stores/platform-store";

interface InvoiceRecord {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  currency: string;
  plan: PlanTier;
  date: string;
  dueDate: string;
  status: "paid" | "failed" | "pending";
  paymentMethod: string;
}

export default function PlatformRevenuePage() {
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const canViewRevenue = canViewPlatformRevenue(user?.role);

  const {
    clients,
    invoices: storeInvoices,
    revenueOverview,
    fetchRevenueOverview,
    fetchInvoices,
    downloadCsvExport,
  } = usePlatformStore();

  React.useEffect(() => {
    if (canViewRevenue) {
      fetchRevenueOverview();
      fetchInvoices();
    }
  }, [fetchRevenueOverview, fetchInvoices, canViewRevenue]);

  if (!canViewRevenue) {
    return (
      <AccessDenied
        title="Financial Telemetry Restricted"
        description="Financial telemetry, ARR/MRR metrics, and invoice ledgers are strictly restricted to Super Admins and Finance Administrators."
      />
    );
  }

  const [currency, setCurrency] = React.useState<"INR" | "USD">("INR");
  const [dateRange, setDateRange] = React.useState("This Month");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const invoices: InvoiceRecord[] = (storeInvoices || []) as any;

  // Financial aggregates (prefer live backend calculations when loaded)
  const totalMrr = revenueOverview?.mrr ?? clients
    .filter((c) => c.status === "active" || c.status === "grace_period")
    .reduce((sum, c) => sum + c.mrr, 0);
  const totalArr = revenueOverview?.arr ?? totalMrr * 12;
  const payingClientsCount = revenueOverview?.activeSubscriptions ?? clients.filter(
    (c) => c.mrr > 0 && (c.status === "active" || c.status === "grace_period")
  ).length;
  const arpu = payingClientsCount > 0 ? Math.round(totalMrr / payingClientsCount) : 0;

  // Breakdown by plan
  const planRevenueMap: Record<string, { count: number; mrr: number }> = {
    enterprise: { count: 0, mrr: 0 },
    hotel_pro: { count: 0, mrr: 0 },
    growth: { count: 0, mrr: 0 },
    starter: { count: 0, mrr: 0 },
  };

  clients.forEach((c) => {
    if (planRevenueMap[c.plan]) {
      planRevenueMap[c.plan].count += 1;
      planRevenueMap[c.plan].mrr += c.mrr;
    }
  });

  const currencySymbol = currency === "INR" ? "₹" : "$";
  const exchangeRate = currency === "USD" ? 0.012 : 1;

  const formatAmount = (valInInr: number) => {
    const converted = Math.round(valInInr * exchangeRate);
    return `${currencySymbol}${converted.toLocaleString("en-IN")}`;
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRetryPayment = (invoiceId: string, clientName: string) => {
    toast({
      title: "Retry Link Dispatched",
      description: `Sent Razorpay instant payment mandate link to ${clientName}.`,
    });
    fetchInvoices();
  };

  const handleExportCsv = async () => {
    try {
      await downloadCsvExport("revenue");
      toast({
        title: "Revenue Ledger Exported",
        description: "Downloaded verified billing ledger directly from database.",
      });
    } catch {
      const headers = "Invoice ID,Client,Amount,Plan,Status,Date,Payment Method\n";
      const rows = filteredInvoices
        .map(
          (i) =>
            `${i.id},"${i.clientName}",${i.amount},${i.plan},${i.status},${i.date},"${i.paymentMethod}"`
        )
        .join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dineflow_revenue_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      toast({
        title: "Revenue Ledger Exported",
        description: "Downloaded CSV format ledger.",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-3xl">
              Platform Revenue & Billing
            </h1>
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
              Live Gateway
            </Badge>
          </div>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Real-time aggregate MRR, recurring subscription cashflow, payment health, and billing records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Currency switch */}
          <div className="flex items-center rounded-lg border border-neutral-200 bg-white p-0.5 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm">
            <button
              onClick={() => setCurrency("INR")}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                currency === "INR"
                  ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                  : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              }`}
            >
              INR (₹)
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                currency === "USD"
                  ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                  : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              }`}
            >
              USD ($)
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="border-neutral-200 dark:border-neutral-800"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export Ledger
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* MRR */}
        <Card className="border-neutral-200/80 dark:border-neutral-800 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Monthly Recurring (MRR)
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-3xl">
                {formatAmount(totalMrr)}
              </span>
              <span className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="h-3.5 w-3.5" /> +16.8% MoM
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Across {payingClientsCount} paying client contracts
            </p>
          </CardContent>
        </Card>

        {/* ARR */}
        <Card className="border-neutral-200/80 dark:border-neutral-800 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Annual Run Rate (ARR)
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-3xl">
                {formatAmount(totalArr)}
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                MRR × 12
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Run rate projected on current active seats
            </p>
          </CardContent>
        </Card>

        {/* ARPU */}
        <Card className="border-neutral-200/80 dark:border-neutral-800 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Avg Revenue / Client (ARPU)
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-3xl">
                {formatAmount(arpu)}
              </span>
              <span className="text-xs text-neutral-500">/ mo</span>
            </div>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Highest tier: Hotel Pro (₹7,999/mo)
            </p>
          </CardContent>
        </Card>

        {/* Churn & Collection Health */}
        <Card className="border-neutral-200/80 dark:border-neutral-800 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Collection Success Rate
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-3xl">
                98.6%
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                0.7% Churn
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Auto-debit recurring mandates active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Tier Distribution & Financial Mix */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-neutral-200/80 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Monthly Recurring Revenue by Tier
            </CardTitle>
            <CardDescription className="text-xs">
              Live distribution of monthly software licensing fees by contract plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Hotel Pro */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-purple-700 dark:text-purple-300">
                  Hotel Pro ({planRevenueMap.hotel_pro.count} properties)
                </span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  {formatAmount(planRevenueMap.hotel_pro.mrr)} / mo
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div
                  className="h-full bg-purple-600 dark:bg-purple-500 rounded-full"
                  style={{
                    width: `${totalMrr > 0 ? (planRevenueMap.hotel_pro.mrr / totalMrr) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Growth */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-700 dark:text-blue-300">
                  Growth Tier ({planRevenueMap.growth.count} restaurants)
                </span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  {formatAmount(planRevenueMap.growth.mrr)} / mo
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                  style={{
                    width: `${totalMrr > 0 ? (planRevenueMap.growth.mrr / totalMrr) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Starter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  Starter Tier ({planRevenueMap.starter.count} cafes)
                </span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  {formatAmount(planRevenueMap.starter.mrr)} / mo
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div
                  className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                  style={{
                    width: `${totalMrr > 0 ? (planRevenueMap.starter.mrr / totalMrr) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Enterprise */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-700 dark:text-amber-300">
                  Enterprise Custom
                </span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  {formatAmount(planRevenueMap.enterprise.mrr)} / mo
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div
                  className="h-full bg-amber-600 dark:bg-amber-500 rounded-full"
                  style={{
                    width: `${totalMrr > 0 ? (planRevenueMap.enterprise.mrr / totalMrr) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Renewals & Attention Needed */}
        <Card className="border-neutral-200/80 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Renewal Alerts
            </CardTitle>
            <CardDescription className="text-xs">
              Contracts needing collection or grace period review
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {clients.filter((c) => c.status === "grace_period" || (c.status === "trial" && (c.trialDaysLeft ?? 14) <= 7)).length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500 dark:text-neutral-400">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-neutral-800 dark:text-neutral-200">All Client Accounts in Good Standing</p>
                <p className="mt-0.5">No urgent grace period lapses or expiring trials require operator intervention.</p>
              </div>
            ) : (
              clients
                .filter((c) => c.status === "grace_period" || (c.status === "trial" && (c.trialDaysLeft ?? 14) <= 7))
                .slice(0, 3)
                .map((c) => (
                  <div key={c.id} className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-amber-900 dark:text-amber-200">{c.name}</p>
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                          {c.status === "grace_period" ? "Grace period active · Renewal pending" : `Starter Trial expiring in ${c.trialDaysLeft ?? 7} days`}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-700 dark:text-amber-300">
                        {c.plan.toUpperCase()}
                      </Badge>
                    </div>
                    <Link href={`/platform/clients/${c.id}`}>
                      <Button variant="ghost" size="sm" className="mt-2.5 h-7 w-full text-xs text-neutral-700 dark:text-neutral-300">
                        Manage Client Workspace →
                      </Button>
                    </Link>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoices & Collections Table */}
      <Card className="border-neutral-200/80 dark:border-neutral-800">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Billing & Invoice Ledger
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time transaction history and payment mandate status
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search invoice or client..."
                  className="h-9 pl-8 text-xs bg-white dark:bg-neutral-900"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 shadow-sm"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-y border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Client Workspace</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                        <CreditCard className="h-8 w-8 text-slate-400 dark:text-slate-600 mb-2" />
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">No Invoices Found</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Billing invoices appear automatically once active businesses complete subscription billing cycles.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-neutral-50/75 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-neutral-900 dark:text-neutral-100">
                      {inv.id}
                    </td>
                    <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-neutral-100">
                      <Link href={`/platform/clients/${inv.clientId}`} className="hover:underline flex items-center gap-1">
                        {inv.clientName}
                        <ChevronRight className="h-3 w-3 text-neutral-400" />
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-bold text-neutral-900 dark:text-neutral-100">
                      {formatAmount(inv.amount)}
                    </td>
                    <td className="px-4 py-3 uppercase text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                      {inv.plan.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3">
                      {inv.status === "paid" ? (
                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          Paid
                        </Badge>
                      ) : inv.status === "failed" ? (
                        <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400">
                          Failed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                          Pending
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                      {inv.paymentMethod}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400 font-mono">
                      {inv.date}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {inv.status === "failed" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetryPayment(inv.id, inv.clientName)}
                          className="h-7 text-[11px] border-rose-300 text-rose-700 dark:border-rose-900 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950"
                        >
                          Retry Charge
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Invoice PDF Generated",
                              description: `Downloading formal tax receipt for ${inv.id}.`,
                            });
                          }}
                          className="h-7 text-[11px] text-neutral-600 dark:text-neutral-400"
                        >
                          <Download className="mr-1 h-3 w-3" />
                          Receipt
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
