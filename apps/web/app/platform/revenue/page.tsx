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

const MOCK_INVOICES: InvoiceRecord[] = [
  {
    id: "INV-2026-089",
    clientId: "ten-002",
    clientName: "Taj Heritage Palace & Suites",
    amount: 7999,
    currency: "INR",
    plan: "hotel_pro",
    date: "2026-09-15",
    dueDate: "2026-09-20",
    status: "paid",
    paymentMethod: "HDFC Corp NetBanking (•••• 4912)",
  },
  {
    id: "INV-2026-088",
    clientId: "ten-001",
    clientName: "The Grand Bistro & Rooftop",
    amount: 2999,
    currency: "INR",
    plan: "growth",
    date: "2026-09-15",
    dueDate: "2026-09-15",
    status: "paid",
    paymentMethod: "ICICI Auto-Debit (•••• 1029)",
  },
  {
    id: "INV-2026-087",
    clientId: "ten-005",
    clientName: "Urban Wok Cloud Kitchen",
    amount: 2999,
    currency: "INR",
    plan: "growth",
    date: "2026-09-14",
    dueDate: "2026-09-14",
    status: "paid",
    paymentMethod: "Razorpay UPI (kunal@okhla)",
  },
  {
    id: "INV-2026-086",
    clientId: "ten-004",
    clientName: "Seaside Haven Resort & Spa",
    amount: 7999,
    currency: "INR",
    plan: "hotel_pro",
    date: "2026-09-12",
    dueDate: "2026-09-12",
    status: "failed",
    paymentMethod: "Axis Visa Card (•••• 8821 - Card Expired)",
  },
  {
    id: "INV-2026-085",
    clientId: "ten-003",
    clientName: "Le Petit Artisan Cafe",
    amount: 999,
    currency: "INR",
    plan: "starter",
    date: "2026-09-05",
    dueDate: "2026-09-05",
    status: "paid",
    paymentMethod: "Axis Corporate Card (•••• 3311)",
  },
  {
    id: "INV-2026-084",
    clientId: "ten-007",
    clientName: "Dhaba 1947 Heritage Kitchen",
    amount: 999,
    currency: "INR",
    plan: "starter",
    date: "2026-08-30",
    dueDate: "2026-08-30",
    status: "failed",
    paymentMethod: "PNB Auto-Debit (Insufficient Balance)",
  },
];

export default function PlatformRevenuePage() {
  const { toast } = useToast();
  const clients = usePlatformStore((s) => s.clients);
  const [currency, setCurrency] = React.useState<"INR" | "USD">("INR");
  const [dateRange, setDateRange] = React.useState("This Month");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [invoices, setInvoices] = React.useState<InvoiceRecord[]>(MOCK_INVOICES);

  // Financial aggregates
  const totalMrr = clients
    .filter((c) => c.status === "active" || c.status === "grace_period")
    .reduce((sum, c) => sum + c.mrr, 0);
  const totalArr = totalMrr * 12;
  const payingClientsCount = clients.filter(
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
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: "pending" } : inv
      )
    );
  };

  const handleExportCsv = () => {
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
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Seaside Haven Resort & Spa
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                    Card expired · Grace period ends in 4 days
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-700 dark:text-amber-300">
                  ₹7,999
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRetryPayment("INV-2026-086", "Seaside Haven Resort & Spa")}
                className="mt-2.5 h-7 w-full text-xs font-medium border-amber-500/30 text-amber-800 dark:text-amber-200 hover:bg-amber-500/20"
              >
                Send Direct Payment Link
              </Button>
            </div>

            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    Spice Garden Pure Veg
                  </p>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                    Free Trial expiring in 5 days (Sep 23)
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Trial
                </Badge>
              </div>
              <Link href="/platform/clients/ten-006">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2.5 h-7 w-full text-xs text-neutral-700 dark:text-neutral-300"
                >
                  View Client Conversion Pipeline →
                </Button>
              </Link>
            </div>
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
                {filteredInvoices.map((inv) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
