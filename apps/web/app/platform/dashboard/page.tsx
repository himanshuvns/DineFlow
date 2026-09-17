"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  TrendingUp,
  Building2,
  Users,
  Hotel,
  ChefHat,
  Coffee,
  Bike,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  LifeBuoy,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePlatformStore } from "@/lib/stores/platform-store";

export default function PlatformDashboardPage() {
  const router = useRouter();
  const { clients, supportTickets, auditLogs, systemServices } = usePlatformStore();

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "active").length;
  const trialClients = clients.filter((c) => c.status === "trial").length;
  const graceClients = clients.filter((c) => c.status === "grace_period").length;
  const suspendedClients = clients.filter((c) => c.status === "suspended").length;

  const totalMRR = clients
    .filter((c) => c.status === "active" || c.status === "grace_period")
    .reduce((sum, c) => sum + c.mrr, 0);

  const totalARR = totalMRR * 12;

  const totalOrders = clients.reduce((sum, c) => sum + c.ordersCount, 0);
  const totalStaff = clients.reduce((sum, c) => sum + c.staffCount, 0);
  const totalRooms = clients.reduce((sum, c) => sum + c.roomsCount, 0);
  const totalTables = clients.reduce((sum, c) => sum + c.tablesCount, 0);

  // Sector breakdown
  const hotelsCount = clients.filter((c) => c.businessType === "hotel").length;
  const restaurantsCount = clients.filter((c) => c.businessType === "restaurant").length;
  const cafesCount = clients.filter((c) => c.businessType === "cafe").length;
  const cloudKitchensCount = clients.filter((c) => c.businessType === "cloud_kitchen").length;

  const openTickets = supportTickets.filter((t) => t.status === "open").length;

  return (
    <div className="space-y-6">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold mb-2">
            <ShieldCheck className="h-3.5 w-3.5" /> DineFlow SaaS Core • Platform Owner Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Executive Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time multi-tenant health, recurring revenue telemetry, and client lifecycle management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/platform/revenue")}
            leftIcon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
          >
            Billing Analytics
          </Button>

          <Button
            variant="glow"
            size="sm"
            className="bg-rose-600 hover:bg-rose-500 text-white"
            onClick={() => router.push("/platform/clients")}
            leftIcon={<Building2 className="h-4 w-4" />}
          >
            Manage Clients ({totalClients})
          </Button>
        </div>
      </div>

      {/* ── Key Executive Metrics ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card variant="glass" className="p-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total MRR
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
              ₹
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              ₹{totalMRR.toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +18.4% MoM
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">
            ARR: ₹{totalARR.toLocaleString("en-IN")}
          </span>
        </Card>

        <Card variant="glass" className="p-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Clients
            </span>
            <div className="h-8 w-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {activeClients}
              <span className="text-sm font-medium text-slate-400">/{totalClients}</span>
            </span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {trialClients} on Trial
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
            <span className="text-emerald-500 font-semibold">{activeClients} active</span> •{" "}
            <span className="text-amber-500 font-semibold">{graceClients} grace</span> •{" "}
            <span className="text-rose-500 font-semibold">{suspendedClients} suspended</span>
          </div>
        </Card>

        <Card variant="glass" className="p-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Platform Orders
            </span>
            <div className="h-8 w-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-black">
              <ChefHat className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {totalOrders.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
              Across all tenants
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {totalTables} Tables • {totalRooms} Hotel Suites
          </span>
        </Card>

        <Card variant="glass" className="p-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Support & Health
            </span>
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
              99.96%
            </span>
            <span className="text-[11px] font-bold text-amber-500">
              {openTickets} Open Tickets
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            6/6 Core microservices operational
          </span>
        </Card>
      </div>

      {/* ── Business Types Distribution ────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ChefHat className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Fine Dining & Bistros</span>
            <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{restaurantsCount}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Hotel className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Hotels & Resorts</span>
            <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{hotelsCount}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Coffee className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Cafes & Bakeries</span>
            <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{cafesCount}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <Bike className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Cloud Kitchens</span>
            <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{cloudKitchensCount}</span>
          </div>
        </div>
      </div>

      {/* ── Client Overview Table & Quick Actions ──────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Onboarded Client Workspaces
            </h2>
            <p className="text-xs text-slate-500">
              Live enterprise client list with computed health score and operational tier.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/platform/clients")}
            rightIcon={<ChevronRight className="h-4 w-4" />}
          >
            View All ({totalClients})
          </Button>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Client / Business</th>
                  <th className="px-4 py-3">Owner / Contact</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Health</th>
                  <th className="px-4 py-3 text-right">MRR</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {clients.slice(0, 5).map((client) => {
                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                            {client.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/platform/clients/${client.id}`}
                              className="font-bold text-slate-900 dark:text-white hover:text-rose-500 dark:hover:text-rose-400 transition-colors truncate block"
                            >
                              {client.name}
                            </Link>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {client.city}, {client.state}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-slate-900 dark:text-slate-200 block">{client.ownerName}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{client.ownerPhone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-400">
                        {client.businessType.replace("_", " ")}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          {client.plan.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            client.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : client.status === "grace_period"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : client.status === "trial"
                              ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {client.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                client.healthScore >= 90
                                  ? "bg-emerald-500"
                                  : client.healthScore >= 70
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              }`}
                              style={{ width: `${client.healthScore}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {client.healthScore}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        ₹{client.mrr.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[11px] px-2"
                          onClick={() => router.push(`/platform/clients/${client.id}`)}
                        >
                          Details →
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── System Telemetry & Audit Strip ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Live Infrastructure Status */}
        <Card variant="glass" className="p-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                Live Infrastructure Status
              </span>
            </div>
            <Link
              href="/platform/system-health"
              className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              Full Telemetry →
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
            {systemServices.slice(0, 4).map((svc) => (
              <div key={svc.name} className="py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{svc.name}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400 shrink-0">
                  <span>{svc.latencyMs}ms</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{svc.uptime}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Immutable Audit Events */}
        <Card variant="glass" className="p-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-rose-500" />
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                Recent Audit Ledger Entries
              </span>
            </div>
            <Link
              href="/platform/audit-logs"
              className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              View Audit Logs →
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
            {auditLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="py-2 text-xs space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-[11px]">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                  {log.details}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
