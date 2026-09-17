"use client";

import * as React from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  UtensilsCrossed,
  Hotel,
  Users,
  MessageSquare,
  Building2,
  Calendar,
  ArrowUpRight,
  ChevronRight,
  Globe,
  Sparkles,
  Layers,
  PieChart,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePlatformStore } from "@/lib/stores/platform-store";

export default function PlatformAnalyticsPage() {
  const clients = usePlatformStore((s) => s.clients);
  const fetchClients = usePlatformStore((s) => s.fetchClients);
  const fetchDashboardMetrics = usePlatformStore((s) => s.fetchDashboardMetrics);
  const [timeRange, setTimeRange] = React.useState<"30d" | "90d" | "1y">("30d");

  React.useEffect(() => {
    fetchClients();
    fetchDashboardMetrics();
  }, [fetchClients, fetchDashboardMetrics]);

  // Aggregates
  const totalOrders = clients.reduce((sum, c) => sum + c.ordersCount, 0);
  const totalTables = clients.reduce((sum, c) => sum + c.tablesCount, 0);
  const totalRooms = clients.reduce((sum, c) => sum + c.roomsCount, 0);
  const totalStaff = clients.reduce((sum, c) => sum + c.staffCount, 0);
  const totalMenus = clients.reduce((sum, c) => sum + c.menuCount, 0);

  // Estimated platform GMV based on order volumes and typical AOV
  const estimatedGmv = Math.round(totalOrders * 920); // average ~₹920 per order ticket
  const estimatedGmvFormatted = `₹${(estimatedGmv / 10000000).toFixed(2)} Cr`;

  // Sort top tenants by order volume
  const topTenantsByOrders = [...clients].sort((a, b) => b.ordersCount - a.ordersCount);

  // Business type distribution
  const businessTypesCount = clients.reduce((acc, c) => {
    acc[c.businessType] = (acc[c.businessType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-3xl">
              Cross-Tenant Platform Analytics
            </h1>
            <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold">
              Platform Intelligence
            </Badge>
          </div>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Unified ecosystem metrics, aggregate hospitality GMV, order velocities, and tenant adoption benchmarks.
          </p>
        </div>

        <div className="flex items-center rounded-lg border border-neutral-200 bg-white p-0.5 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm">
          {(["30d", "90d", "1y"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded px-3 py-1 text-xs font-semibold uppercase transition-colors ${
                timeRange === range
                  ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                  : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              }`}
            >
              {range === "30d" ? "Last 30 Days" : range === "90d" ? "Quarterly" : "Year-To-Date"}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-neutral-200/80 dark:border-neutral-800 p-5 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">Total Hospitality GMV</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-50 sm:text-3xl">
              {estimatedGmvFormatted}
            </span>
            <span className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-3.5 w-3.5" /> +24.6%
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Total dining & room service volume processed</p>
        </Card>

        <Card className="border-neutral-200/80 dark:border-neutral-800 p-5 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">Platform Orders Processed</span>
            <UtensilsCrossed className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-50 sm:text-3xl">
              {totalOrders.toLocaleString()}
            </span>
            <span className="flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400">
              <ArrowUpRight className="h-3.5 w-3.5" /> +18.2%
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">KDS dispatches & contactless table orders</p>
        </Card>

        <Card className="border-neutral-200/80 dark:border-neutral-800 p-5 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">Guest Rooms & Tables</span>
            <Hotel className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-50 sm:text-3xl">
              {totalRooms + totalTables}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              ({totalRooms} rooms, {totalTables} tables)
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Active hospitality physical nodes</p>
        </Card>

        <Card className="border-neutral-200/80 dark:border-neutral-800 p-5 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">WhatsApp Messages</span>
            <MessageSquare className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-50 sm:text-3xl">
              184.2K
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              99.8% Deliv.
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Digital thermal bills & automated bots</p>
        </Card>
      </div>

      {/* Top Performing Clients & Channels */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Tenants */}
        <Card className="lg:col-span-2 border-neutral-200/80 dark:border-neutral-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Top Hospitality Operators by Order Velocity
                </CardTitle>
                <CardDescription className="text-xs">
                  Highest volume clients processing dining transactions through DineFlow
                </CardDescription>
              </div>
              <Link href="/platform/clients">
                <Button variant="ghost" size="sm" className="text-xs">
                  All Clients <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-y border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Property Name</th>
                    <th className="px-4 py-3">Sector</th>
                    <th className="px-4 py-3">Total Orders</th>
                    <th className="px-4 py-3">Est. GMV</th>
                    <th className="px-4 py-3">Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {topTenantsByOrders.slice(0, 5).map((client, idx) => (
                    <tr key={client.id} className="hover:bg-neutral-50/75 dark:hover:bg-neutral-900/50">
                      <td className="px-4 py-3 font-mono font-bold text-neutral-400">
                        #{idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/platform/clients/${client.id}`}
                          className="font-semibold text-neutral-900 dark:text-neutral-100 hover:underline flex items-center gap-1.5"
                        >
                          {client.name}
                        </Link>
                        <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                          {client.city}
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize text-neutral-600 dark:text-neutral-400">
                        {client.businessType.replace("_", " ")}
                      </td>
                      <td className="px-4 py-3 font-bold text-neutral-900 dark:text-neutral-100 font-mono">
                        {client.ordersCount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹{((client.ordersCount * 950) / 100000).toFixed(1)} Lakh
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            client.healthScore >= 90
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : client.healthScore >= 75
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                              : "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                          }`}
                        >
                          {client.healthScore}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown by Sector & Channel */}
        <div className="space-y-6">
          <Card className="border-neutral-200/80 dark:border-neutral-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Industry Sector Breakdown
              </CardTitle>
              <CardDescription className="text-xs">
                Active tenant properties by hospitality vertical
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {Object.entries(businessTypesCount).map(([type, count]) => {
                const percentage = Math.round((count / clients.length) * 100);
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="capitalize text-neutral-700 dark:text-neutral-300">
                        {type.replace("_", " ")} ({count})
                      </span>
                      <span className="text-neutral-500">{percentage}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div
                        className="h-full bg-neutral-900 dark:bg-neutral-100 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Ordering Channels */}
          <Card className="border-neutral-200/80 dark:border-neutral-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Ordering Channel Share
              </CardTitle>
              <CardDescription className="text-xs">
                Distribution across touchpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-700 dark:text-neutral-300">Contactless QR Table Ordering</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">48.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-700 dark:text-neutral-300">Staff POS Waiter Terminal</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">29.4%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-700 dark:text-neutral-300">In-Room Hotel Folio QR</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">14.6%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-700 dark:text-neutral-300">WhatsApp Inbound Bot</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">7.8%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
