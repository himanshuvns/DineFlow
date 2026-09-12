"use client";

import * as React from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  MessageSquare,
  Plus,
  QrCode,
  ChefHat,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";

interface OrderFeedItem {
  id: string;
  table: string;
  items: string;
  total: number;
  source: string;
  time: string;
  status: "preparing" | "ready" | "served";
}

const INITIAL_RECENT_ORDERS: OrderFeedItem[] = [
  {
    id: "ORD-9421",
    table: "Table 04",
    items: "2x Truffle Burger, 1x Sweet Potato Fries, 2x Cold Brew",
    total: 1840,
    source: "QR Scan",
    time: "2 mins ago",
    status: "preparing",
  },
  {
    id: "ORD-9420",
    table: "Table 12",
    items: "1x Wood-fired Margherita, 1x Burrata Salad, 1x Tiramisu",
    total: 2150,
    source: "WhatsApp",
    time: "6 mins ago",
    status: "ready",
  },
  {
    id: "ORD-9419",
    table: "Room 302",
    items: "1x Club Sandwich, 1x Fresh Orange Juice",
    total: 920,
    source: "QR Room",
    time: "14 mins ago",
    status: "served",
  },
  {
    id: "ORD-9418",
    table: "Table 07",
    items: "3x Grilled Salmon, 2x Pinot Grigio Bottle",
    total: 5400,
    source: "POS Counter",
    time: "22 mins ago",
    status: "served",
  },
  {
    id: "ORD-9417",
    table: "Table 02",
    items: "1x Matcha Latte, 1x Avocado Sourdough Toast",
    total: 780,
    source: "QR Scan",
    time: "29 mins ago",
    status: "served",
  },
];

const DEFAULT_ONBOARDING_STEPS = [
  { id: 1, title: "Register Business & Workspace", completed: true },
  { id: 2, title: "Configure Dine-in Tables & Hotel Rooms", completed: true },
  { id: 3, title: "Add Your Signature Menu Items", completed: true, cta: "View Menu", href: "/dashboard/menu" },
  { id: 4, title: "Print & Display QR Code Stands", completed: false, cta: "Download QRs", href: "/dashboard/tables" },
  { id: 5, title: "Connect WhatsApp Cloud API", completed: false, cta: "Connect Now", href: "/dashboard/whatsapp" },
];

export default function DashboardOverviewPage() {
  const { user, tenant } = useAuthStore();
  const { addToast } = useToast();

  const userDisplayName = user?.firstName || "Laurent";
  const tenantName = tenant?.name || "The Grand Bistro";

  const [orders, setOrders] = React.useState<OrderFeedItem[]>(INITIAL_RECENT_ORDERS);
  const [onboardingSteps, setOnboardingSteps] = React.useState(DEFAULT_ONBOARDING_STEPS);
  const [isNewOrderOpen, setIsNewOrderOpen] = React.useState(false);

  // Quick order state
  const [orderTable, setOrderTable] = React.useState("Table 03");
  const [orderItemsText, setOrderItemsText] = React.useState("1x Truffle Mushroom Risotto, 1x Cold Brew Tonic");
  const [orderAmount, setOrderAmount] = React.useState("1170");

  const completedCount = onboardingSteps.filter((s) => s.completed).length;
  const progressPct = Math.round((completedCount / onboardingSteps.length) * 100);

  const handleCreateQuickOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEntry: OrderFeedItem = {
      id: newId,
      table: orderTable,
      items: orderItemsText.trim() || "1x Chef Special Course",
      total: parseFloat(orderAmount) || 850,
      source: "POS Counter",
      time: "Just now",
      status: "preparing",
    };

    setOrders([newEntry, ...orders]);
    setIsNewOrderOpen(false);
    addToast("success", "Order Created", `Ticket ${newId} dispatched to kitchen for ${orderTable}.`);
  };

  const handleStepClick = (stepId: number) => {
    setOnboardingSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, completed: !s.completed } : s))
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Live Restaurant Telemetry
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {userDisplayName} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Here is your live service overview for <span className="text-slate-900 dark:text-white font-medium">{tenantName}</span> today.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<QrCode className="h-4 w-4" />}
            asChild
          >
            <Link href="/dashboard/tables">Table QRs</Link>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ChefHat className="h-4 w-4" />}
            asChild
          >
            <Link href="/dashboard/orders">Open KDS Screen</Link>
          </Button>
          <Button
            variant="glow"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsNewOrderOpen(true)}
          >
            New Order
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card variant="glass" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Today&apos;s Revenue</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(84250, tenant?.currency || "INR")}
            </h2>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                <ArrowUpRight className="h-3.5 w-3.5" /> +18.4%
              </span>
              <span className="text-slate-500 dark:text-slate-400">vs yesterday</span>
            </div>
          </div>
        </Card>

        {/* Metric 2 */}
        <Card variant="glass" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Kitchen Orders</span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">12 Orders</h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="text-amber-600 dark:text-amber-400 font-semibold">4 preparing</span>
              <span>•</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-semibold">3 ready</span>
            </div>
          </div>
        </Card>

        {/* Metric 3 */}
        <Card variant="glass" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Table Occupancy</span>
            <div className="h-8 w-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">18 / 24</h2>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">75% capacity</span>
              <span className="text-slate-500 dark:text-slate-400">(6 tables free)</span>
            </div>
          </div>
        </Card>

        {/* Metric 4 */}
        <Card variant="glass" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">WhatsApp Orders</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">34 Orders</h2>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">62% share</span>
              <span className="text-slate-500 dark:text-slate-400">of digital orders</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Onboarding Checklist Widget */}
      <Card variant="glow" className="border-emerald-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Workspace Setup Progress
              </CardTitle>
              <Badge variant="success" size="sm">{completedCount} of {onboardingSteps.length} Completed</Badge>
            </div>
            <CardDescription className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Complete these setup steps to unlock maximum customer table turns and automated marketing.
            </CardDescription>
          </div>
          <div className="w-full sm:w-48 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              style={{ width: `${progressPct}%` }}
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
          {onboardingSteps.map((step) => (
            <div
              key={step.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs"
            >
              <button
                type="button"
                onClick={() => handleStepClick(step.id)}
                className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer"
              >
                {step.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-slate-400 dark:border-slate-600 shrink-0" />
                )}
                <span
                  className={`text-xs font-semibold truncate ${
                    step.completed
                      ? "text-slate-400 dark:text-slate-500 line-through"
                      : "text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {step.title}
                </span>
              </button>
              {step.cta && step.href && (
                <Link
                  href={step.href}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 ml-2 shrink-0 flex items-center gap-1"
                >
                  {step.cta} <ExternalLink className="h-2.5 w-2.5" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Main Bottom Section: Live Order Feed & Quick Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Orders Table (8 Cols) */}
        <Card variant="glass" className="lg:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Live Kitchen & Table Feed</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
              </CardTitle>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                Orders arriving via contactless QR codes, WhatsApp bot, and register
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/orders" className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                View All Orders
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/60 dark:bg-transparent">
                  <th className="py-2.5 pl-2">Order ID & Source</th>
                  <th className="py-2.5">Location</th>
                  <th className="py-2.5">Items Summary</th>
                  <th className="py-2.5">Amount</th>
                  <th className="py-2.5 text-right pr-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {orders.map((order) => {
                  const statusBadges = {
                    preparing: <Badge variant="warning" dot size="sm">Preparing</Badge>,
                    ready: <Badge variant="info" dot size="sm">Ready</Badge>,
                    served: <Badge variant="success" size="sm">Served</Badge>,
                  };

                  return (
                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 pl-2 font-medium">
                        <div className="text-slate-900 dark:text-white font-bold">{order.id}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <span className="font-medium">{order.source}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" /> {order.time}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 font-bold text-emerald-700 dark:text-emerald-300">{order.table}</td>
                      <td className="py-3 text-slate-700 dark:text-slate-300 max-w-[200px] truncate font-medium">
                        {order.items}
                      </td>
                      <td className="py-3 font-bold text-slate-900 dark:text-white font-mono">
                        {formatCurrency(order.total, tenant?.currency || "INR")}
                      </td>
                      <td className="py-3 text-right pr-2">
                        {statusBadges[order.status as keyof typeof statusBadges]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Right Insights Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Top Selling Items */}
          <Card variant="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                Top Performing Dishes Today
              </CardTitle>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                Highest ordered items across digital menus
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Truffle Mushroom Risotto", count: 42, rev: 35700 },
                { name: "Wood-Fired Margherita", count: 38, rev: 28500 },
                { name: "Cold Brew Tonic", count: 29, rev: 8700 },
                { name: "Belgian Chocolate Fondant", count: 24, rev: 10800 },
              ].map((dish, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/40 last:border-0">
                  <div className="min-w-0">
                    <p className="text-slate-800 dark:text-slate-200 font-semibold truncate">{dish.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{dish.count} orders</p>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white ml-2 font-mono">
                    {formatCurrency(dish.rev, tenant?.currency || "INR")}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Kitchen Station Telemetry */}
          <Card variant="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                Station Workload
              </CardTitle>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                Live Kitchen Display queue load
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  <span>Hot Kitchen (Grill & Pasta)</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">85% load</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 dark:bg-amber-400 rounded-full w-[85%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  <span>Cold Prep & Salads</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">35% load</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full w-[35%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  <span>Beverage & Bar Counter</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">50% load</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 dark:bg-cyan-400 rounded-full w-[50%]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Order Modal */}
      <Modal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        title="Create Direct / Phone Order"
        description="Quickly queue an order for dine-in tables, room service, or counter takeaway."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setIsNewOrderOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="quick-order-form" variant="glow" size="sm">
              Dispatch to Kitchen
            </Button>
          </div>
        }
      >
        <form id="quick-order-form" onSubmit={handleCreateQuickOrder} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Table / Room *
              </label>
              <select
                value={orderTable}
                onChange={(e) => setOrderTable(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs"
              >
                <option value="Table 01">Table 01</option>
                <option value="Table 02">Table 02</option>
                <option value="Table 03">Table 03</option>
                <option value="Table 04">Table 04</option>
                <option value="Room 301">Room 301</option>
                <option value="Room 302">Room 302</option>
                <option value="Takeaway Counter">Takeaway Counter</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Estimated Amount (₹)
              </label>
              <input
                type="number"
                value={orderAmount}
                onChange={(e) => setOrderAmount(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Order Items & Quantities
            </label>
            <textarea
              rows={3}
              value={orderItemsText}
              onChange={(e) => setOrderItemsText(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-none shadow-xs"
              placeholder="e.g. 2x Truffle Burger, 1x Sweet Potato Fries"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
