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
  Utensils,
  Coffee,
  Flame,
  Wine,
  HelpCircle,
  Hotel,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useTenantData, STARTER_TEMPLATES } from "@/lib/stores/tenant-data-store";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { HospitalityLoader } from "@/components/ui/hospitality-loader";
import { getRoleLabel, canViewFinancials, isOwner, isManager } from "@/lib/rbac/roles";
import NumberFlow from "@number-flow/react";

export default function DashboardOverviewPage() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const {
    tenantName,
    tenantSlug,
    isDemoTenant,
    user,
    tenant,
    menuItems,
    tables,
    orders,
    onboardingSteps,
    addOrder,
    toggleOnboardingStep,
    applyStarterTemplate,
  } = useTenantData();

  const { addToast } = useToast();

  const userDisplayName =
    user?.firstName || user?.name || (isDemoTenant ? "Laurent" : getRoleLabel(user?.role));

  // Track first login vs returning login - defaults to true so initial view is always "Welcome, {name}"
  const [isFirstLogin, setIsFirstLogin] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (!mounted) return;
    const userId = user?.id || (user as any)?._id || "";
    const storageKey = userId ? `dineflow_has_logged_in_${userId}` : "dineflow_has_logged_in";

    // 1. Explicit backend first login flag takes precedence
    if (user?.isFirstLogin === true) {
      setIsFirstLogin(true);
      return;
    }

    // 2. Check localStorage session history: only show "Welcome back" if user previously logged out
    try {
      const hasLoggedInBefore = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
      if (hasLoggedInBefore === "true") {
        setIsFirstLogin(false);
      } else {
        setIsFirstLogin(true);
      }
    } catch {
      setIsFirstLogin(true);
    }
  }, [mounted, user?.id, user?.isFirstLogin]);

  const [isNewOrderOpen, setIsNewOrderOpen] = React.useState(false);

  // Safe normalized arrays
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeTables = Array.isArray(tables) ? tables : [];
  const safeMenuItems = Array.isArray(menuItems) ? menuItems : [];
  const safeOnboardingSteps = Array.isArray(onboardingSteps) ? onboardingSteps : [];

  // Quick order state
  const [orderTable, setOrderTable] = React.useState("Table 01");
  const [orderItemsText, setOrderItemsText] = React.useState("1x House Special, 1x Beverage");
  const [orderAmount, setOrderAmount] = React.useState("450");

  // Keep orderTable aligned with available tables if present
  React.useEffect(() => {
    if (safeTables.length > 0 && !safeTables.some((t) => t?.name === orderTable)) {
      setOrderTable(safeTables[0].name);
    }
  }, [safeTables, orderTable]);

  const completedCount = safeOnboardingSteps.filter((s) => s?.completed).length;
  const progressPct =
    safeOnboardingSteps.length > 0
      ? Math.round((completedCount / safeOnboardingSteps.length) * 100)
      : 0;

  // Calculate live dynamic metrics from tenant data
  const calculatedRevenue = safeOrders.reduce(
    (acc, o) => acc + (typeof o?.total === "number" ? o.total : 0),
    0
  );
  const displayRevenue = calculatedRevenue;

  const preparingCount = safeOrders.filter((o) => o?.status === "preparing").length;
  const readyCount = safeOrders.filter((o) => o?.status === "ready").length;
  const activeCount = preparingCount + readyCount;

  const occupiedCount = safeTables.filter((t) => t?.status === "occupied").length;
  const totalTables = safeTables.length;
  const occupancyPct = totalTables > 0 ? Math.round((occupiedCount / totalTables) * 100) : 0;

  const handleCreateQuickOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(orderAmount) || 250;
    const created = await addOrder({
      table: orderTable,
      customerName: "Walk-in Guest",
      customerPhone: "",
      destination: "dine_in",
      station: "main_kitchen",
      status: "preparing",
      total: amount,
      items: [
        {
          name: orderItemsText.trim() || "1x Chef Special Course",
          qty: 1,
        },
      ],
    });

    setIsNewOrderOpen(false);
    addToast(
      "success",
      "Order Created",
      `Ticket ${created.id} dispatched to kitchen for ${orderTable}.`
    );
  };

  const handleApplyPreset = (key: keyof typeof STARTER_TEMPLATES) => {
    applyStarterTemplate(key);
    addToast(
      "success",
      "Starter Template Applied",
      `Loaded ${STARTER_TEMPLATES[key].name} menu items and tables into your workspace.`
    );
  };

  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <HospitalityLoader
          variant="cloche"
          title="Loading Workspace…"
          subtitle="Connecting live orders, table reservations & kitchen display systems"
        />
      </div>
    );
  }


  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isDemoTenant ? "Live Demo Showcase" : `${tenantName} Workspace`}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isFirstLogin ? `Welcome, ${userDisplayName} 👋` : `Welcome back, ${userDisplayName} 👋`}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Here is your live service overview for{" "}
            <span className="text-slate-900 dark:text-white font-semibold">{tenantName}</span> today.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {user?.role === "chef" ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<ChefHat className="h-4 w-4" />}
                asChild
              >
                <Link href="/dashboard/orders">Open KDS Screen</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Utensils className="h-4 w-4 text-emerald-500" />}
                asChild
              >
                <Link href="/dashboard/menu">Menu Catalog</Link>
              </Button>
            </>
          ) : user?.role === "housekeeping" ? (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Hotel className="h-4 w-4 text-emerald-500" />}
              asChild
            >
              <Link href="/dashboard/rooms">Hotel Suites & Rooms</Link>
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<QrCode className="h-4 w-4" />}
                asChild
              >
                <Link href="/dashboard/tables">Table QRs</Link>
              </Button>
              {(isOwner(user?.role) || isManager(user?.role)) && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Hotel className="h-4 w-4 text-emerald-500" />}
                  asChild
                >
                  <Link href="/dashboard/rooms">Hotel Suites</Link>
                </Button>
              )}
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
            </>
          )}
        </div>
      </div>

      {/* Quick Starter Preset Banner if New Tenant has no items (Owner & Manager only) */}
      {!isDemoTenant && (isOwner(user?.role) || isManager(user?.role)) && safeMenuItems.length === 0 && (
        <Card variant="glass" className="border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="glow" size="sm">Quick Setup</Badge>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Get your {tenantName} dashboard running in seconds
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Select a starter preset to populate sample signature dishes and QR tables, or build from scratch.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Utensils className="h-3.5 w-3.5 text-emerald-500" />}
                onClick={() => handleApplyPreset("bistro")}
              >
                Bistro & Pizza
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Coffee className="h-3.5 w-3.5 text-amber-500" />}
                onClick={() => handleApplyPreset("cafe")}
              >
                Cafe & Coffee
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Flame className="h-3.5 w-3.5 text-orange-500" />}
                onClick={() => handleApplyPreset("indian")}
              >
                Dosa & Diner
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Wine className="h-3.5 w-3.5 text-indigo-500" />}
                onClick={() => handleApplyPreset("bar")}
              >
                Bar & Taproom
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Today's Revenue (Owner only) vs Total Orders Processed (Manager, Waiter, Chef, Cashier, Staff) */}
        {!canViewFinancials(user?.role) ? (
          <Card variant="glass" hoverEffect className="min-w-0 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Total Orders Processed</span>
              <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <ShoppingBag className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                <NumberFlow value={safeOrders.length} willChange />
                <span>Orders</span>
              </h2>
              <div className="flex items-center gap-1.5 mt-1 text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> {safeOrders.filter((o) => o?.status === "served" || o?.status === "paid").length} done
                </span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  • {activeCount} active
                </span>
              </div>
            </div>
          </Card>
        ) : (
          <Card variant="glass" hoverEffect className="min-w-0 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Today&apos;s Revenue</span>
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center">
                <NumberFlow
                  value={displayRevenue}
                  prefix={
                    tenant?.currency === "USD"
                      ? "$"
                      : tenant?.currency === "EUR"
                      ? "€"
                      : tenant?.currency === "GBP"
                      ? "£"
                      : tenant?.currency === "INR" || !tenant?.currency
                      ? "₹"
                      : `${tenant.currency} `
                  }
                  locales={tenant?.currency === "INR" || !tenant?.currency ? "en-IN" : "en-US"}
                  format={{ minimumFractionDigits: 0, maximumFractionDigits: 0 }}
                  willChange
                />
              </h2>
              <div className="flex items-center gap-1.5 mt-1 text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                  <ArrowUpRight className="h-3.5 w-3.5" /> {safeOrders.length > 0 ? "+100%" : "+0%"}
                </span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  {safeOrders.length > 0 ? `across ${safeOrders.length} orders` : "ready for sales"}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Metric 2 */}
        <Card variant="glass" hoverEffect className="min-w-0 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Active Kitchen Orders</span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <NumberFlow value={activeCount} willChange />
              <span>Orders</span>
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <span className="text-amber-600 dark:text-amber-400 font-semibold">{preparingCount} preparing</span>
              <span>•</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{readyCount} ready</span>
            </div>
          </div>
        </Card>

        {/* Metric 3 */}
        <Card variant="glass" hoverEffect className="min-w-0 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Table Occupancy</span>
            <div className="h-8 w-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              {totalTables > 0 ? (
                <>
                  <NumberFlow value={occupiedCount} willChange />
                  <span>/</span>
                  <span>{totalTables}</span>
                </>
              ) : (
                "0 Tables"
              )}
            </h2>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {totalTables > 0 ? `${occupancyPct}% capacity` : "Setup required"}
              </span>
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {totalTables > 0 ? `(${totalTables - occupiedCount} free)` : ""}
              </span>
            </div>
          </div>
        </Card>

        {/* Metric 4 */}
        <Card variant="glass" hoverEffect className="min-w-0 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Menu Catalog</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Utensils className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <NumberFlow value={safeMenuItems.length} willChange />
              <span>Dishes</span>
            </h2>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {safeMenuItems.filter((i) => i?.available).length} Live
              </span>
              <span className="text-slate-600 dark:text-slate-400 font-medium">on contactless QR</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Onboarding Checklist Widget (Owner & Manager only) */}
      {(isOwner(user?.role) || isManager(user?.role)) && (
        <Card variant="glow" className="border-emerald-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Workspace Setup Progress
                </CardTitle>
                <Badge variant="success" size="sm">{completedCount} of {safeOnboardingSteps.length} Completed</Badge>
              </div>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Complete these setup steps to launch contactless QR menus, live KDS, and WhatsApp marketing for {tenantName}.
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
            {safeOnboardingSteps.map((step) => (
              <div
                key={step.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleOnboardingStep(step.id)}
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
      )}

      {/* Main Bottom Section: Live Order Feed & Quick Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Orders Table (8 Cols) */}
        <Card variant="glass" className="lg:col-span-8">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Live Kitchen & Table Feed</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
              </CardTitle>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                Orders arriving via contactless QR codes, WhatsApp bot, and register for {tenantName}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/orders" className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                View All Orders
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            {safeOrders.length === 0 ? (
              <div className="py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400 mb-3">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Orders in Kitchen Queue</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Place a new quick order using the button above, or scan one of your table QR stands to simulate a guest order.
                </p>
                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="glow"
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => setIsNewOrderOpen(true)}
                  >
                    Place First Order
                  </Button>
                </div>
              </div>
            ) : (
              <table className="w-full min-w-[540px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/60 dark:bg-transparent">
                    <th className="py-2.5 pl-2">Order ID</th>
                    <th className="py-2.5">Location</th>
                    <th className="py-2.5">Items Summary</th>
                    <th className="py-2.5">Amount</th>
                    <th className="py-2.5 text-right pr-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {safeOrders.slice(0, 6).map((order) => {
                    const statusBadges = {
                      pending: <Badge variant="warning" dot size="sm">Pending</Badge>,
                      preparing: <Badge variant="warning" dot size="sm">Preparing</Badge>,
                      ready: <Badge variant="info" dot size="sm">Ready</Badge>,
                      served: <Badge variant="success" size="sm">Served</Badge>,
                    };

                    const itemsSummary =
                      order?.items && Array.isArray(order.items) && order.items.length > 0
                        ? order.items
                            .map((i) =>
                              typeof i === "string"
                                ? i
                                : `${i?.qty || 1}x ${i?.name || "Dish"}`
                            )
                            .join(", ")
                        : "Special Order";

                    return (
                      <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 pl-2 font-medium">
                          <div className="text-slate-900 dark:text-white font-bold">{order.id}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <span className="font-medium">{order.destination === "room_service" ? "Room QR" : "Table QR"}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" /> {order.time || "Recent"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 font-bold text-emerald-700 dark:text-emerald-300">{order.table}</td>
                        <td className="py-3 text-slate-700 dark:text-slate-300 max-w-[200px] truncate font-medium">
                          {itemsSummary}
                        </td>
                        <td className="py-3 font-bold text-slate-900 dark:text-white font-mono">
                          {formatCurrency(order?.total, tenant?.currency || "INR")}
                        </td>
                        <td className="py-3 text-right pr-2">
                          {statusBadges[order.status as keyof typeof statusBadges] || (
                            <Badge variant="neutral" size="sm">{order.status}</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Right Insights Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Top Selling Items / Catalog preview */}
          <Card variant="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                Signature Catalog Items
              </CardTitle>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                Active dishes displayed to guests in {tenantName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {safeMenuItems.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  <p>No dishes added to your catalog yet.</p>
                  <Link
                    href="/dashboard/menu"
                    className="inline-block mt-2 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    + Add your first dish
                  </Link>
                </div>
              ) : (
                safeMenuItems.slice(0, 4).map((dish) => (
                  <div
                    key={dish.id}
                    className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/40 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-slate-800 dark:text-slate-200 font-semibold truncate">{dish.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{dish.category}</p>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white ml-2 font-mono">
                      {formatCurrency(dish?.price, tenant?.currency || "INR")}
                    </span>
                  </div>
                ))
              )}
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
                  <span>Hot Kitchen (Grill & Cooking)</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">
                    {activeCount > 0 ? "Active Load" : "Idle"}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 dark:bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(activeCount * 25, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  <span>Beverage & Bar Station</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Ready</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full w-[25%]" />
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
        title="Create Quick POS / Dine-in Order"
        description="Dispatch an immediate food order directly to the kitchen display screen."
      >
        <form onSubmit={handleCreateQuickOrder} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Table / Location
            </label>
            {safeTables.length > 0 ? (
              <select
                value={orderTable}
                onChange={(e) => setOrderTable(e.target.value)}
                className="w-full px-3 py-2 text-base sm:text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                {safeTables.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name} ({t.zone})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={orderTable}
                onChange={(e) => setOrderTable(e.target.value)}
                className="w-full px-3 py-2 text-base sm:text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                placeholder="Table 01"
              />
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Ordered Items (Summary)
            </label>
            <input
              type="text"
              value={orderItemsText}
              onChange={(e) => setOrderItemsText(e.target.value)}
              placeholder="e.g. 1x Special Thali, 2x Cold Brew"
              required
              className="w-full px-3 py-2 text-base sm:text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Total Amount ({tenant?.currency || "INR"})
            </label>
            <input
              type="number"
              value={orderAmount}
              onChange={(e) => setOrderAmount(e.target.value)}
              placeholder="450"
              min="0"
              required
              className="w-full px-3 py-2 text-base sm:text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewOrderOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="glow"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Send to Kitchen
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
