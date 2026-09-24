"use client";

import * as React from "react";
import {
  AlertTriangle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

const ALERTS = [
  {
    itemName: "Truffle Mushroom Risotto",
    category: "Main Courses",
    currentPrice: 850,
    suggestedPrice: 980,
    margin: 72.5,
    volume: 248,
    severity: "high" as const,
    alertType: "underpriced" as const,
    rationale: "Highest-volume item with 72.5% margin and strong demand. A 15% price increase is within competitor range and unlikely to reduce volume significantly. Estimated monthly revenue gain: ₹32,000.",
  },
  {
    itemName: "Vintage Reserve Merlot",
    category: "Wines & Cocktails",
    currentPrice: 3800,
    suggestedPrice: 3200,
    margin: 55.0,
    volume: 12,
    severity: "medium" as const,
    alertType: "overpriced" as const,
    rationale: "Only 12 bottles sold last month despite significant cellar investment. Reducing price by ~16% to ₹3,200 is projected to 2× volume based on local hospitality market data.",
  },
  {
    itemName: "Cheese Garlic Bread",
    category: "Starters & Appetizers",
    currentPrice: 220,
    suggestedPrice: 280,
    margin: 42.0,
    volume: 88,
    severity: "medium" as const,
    alertType: "low_margin" as const,
    rationale: "Below 50% margin threshold. Food cost inflation on dairy and bread has eroded margins by 12% since last review. Recommend price revision to restore profitability.",
  },
  {
    itemName: "Lobster Thermidor",
    category: "Premium Mains",
    currentPrice: 2800,
    suggestedPrice: 2800,
    margin: 38.0,
    volume: 8,
    severity: "high" as const,
    alertType: "low_velocity" as const,
    rationale: "Only 8 orders in 30 days despite premium positioning. Consider featuring in WhatsApp broadcasts or upsell carousel to drive discovery. No price change needed.",
  },
];

const ALERT_CONFIG = {
  underpriced: { label: "Underpriced", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", badgeVariant: "success" as const },
  overpriced: { label: "Overpriced", icon: TrendingDown, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30", badgeVariant: "danger" as const },
  low_margin: { label: "Low Margin", icon: Activity, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", badgeVariant: "warning" as const },
  low_velocity: { label: "Slow Mover", icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30", badgeVariant: "warning" as const },
};

const SEVERITY_COLOR = {
  high: "text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/30",
  medium: "text-amber-800 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
  low: "text-slate-700 dark:text-slate-400 bg-slate-500/10 border-slate-500/30",
};

export default function PricingAlertsPage() {
  const { addToast } = useToast();
  const [isScanning, setIsScanning] = React.useState(false);
  const [appliedAlerts, setAppliedAlerts] = React.useState<string[]>([]);
  const [filter, setFilter] = React.useState<"all" | "high" | "medium">("all");

  const filtered = ALERTS.filter((a) => filter === "all" || a.severity === filter);

  const handleScan = async () => {
    setIsScanning(true);
    await new Promise((r) => setTimeout(r, 2200));
    setIsScanning(false);
    addToast("success", "Pricing Scan Complete", `Analysed 48 menu items. Found ${ALERTS.length} alerts.`);
  };

  const handleApply = (itemName: string, suggestedPrice: number, alertType: string) => {
    setAppliedAlerts((prev) => [...prev, itemName]);
    addToast("success", "Price Updated", alertType === "low_velocity" ? `"${itemName}" added to WhatsApp broadcast queue.` : `"${itemName}" price updated to ₹${suggestedPrice}.`);
  };

  const handleExport = () => {
    const csv = ["Item,Category,Current Price,Suggested Price,Margin %,Volume,Alert Type,Severity,Rationale"]
      .concat(ALERTS.map((a) => `"${a.itemName}","${a.category}",${a.currentPrice},${a.suggestedPrice},${a.margin},${a.volume},"${a.alertType}","${a.severity}","${a.rationale}"`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dineflow-pricing-alerts-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    addToast("success", "Report Exported", "Pricing alert CSV downloaded.");
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            Feature 6.5 — Smart Pricing Alerts
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Smart Pricing Alerts</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            AI scans your full menu for pricing opportunities and flags them with actionable recommendations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} leftIcon={<Download className="h-3.5 w-3.5" />}>
            Export Report
          </Button>
          <Button
            variant="glow"
            size="sm"
            onClick={handleScan}
            disabled={isScanning}
            leftIcon={isScanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          >
            {isScanning ? "Scanning Menu…" : "Run AI Scan"}
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Items Scanned", value: "48", sub: "full menu", color: "text-slate-900 dark:text-white" },
          { label: "Alerts Found", value: `${ALERTS.length}`, sub: `${ALERTS.filter((a) => a.severity === "high").length} high priority`, color: "text-rose-600 dark:text-rose-400" },
          { label: "Est. Revenue Gain", value: "₹84,500", sub: "projected / month", color: "text-emerald-700 dark:text-emerald-400" },
          { label: "Avg. Margin Gap", value: "8.4%", sub: "vs target 65%", color: "text-amber-700 dark:text-amber-400" },
        ].map((s) => (
          <Card key={s.label} variant="glass">
            <CardContent className="p-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{s.label}</p>
              <p className={`text-xl font-extrabold ${s.color} mt-1`}>{s.value}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Filter:</span>
        <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1 text-xs">
          {(["all", "high", "medium"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg font-medium transition-all capitalize ${filter === f ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-semibold" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
            >
              {f} {f !== "all" && `(${ALERTS.filter((a) => a.severity === f).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Alert cards */}
      <div className="space-y-4">
        {filtered.map((alert) => {
          const config = ALERT_CONFIG[alert.alertType];
          const Icon = config.icon;
          const isApplied = appliedAlerts.includes(alert.itemName);
          const priceDir = alert.suggestedPrice > alert.currentPrice;
          const noPriceChange = alert.suggestedPrice === alert.currentPrice;

          return (
            <Card key={alert.itemName} variant="glass" className={`border ${config.bg} transition-all ${isApplied ? "opacity-60" : ""}`}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left */}
                  <div className="flex items-start gap-3 flex-1">
                    <span className={`p-2.5 rounded-xl ${config.bg} border mt-0.5`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">{alert.itemName}</h3>
                        <Badge variant={config.badgeVariant} size="sm">{config.label}</Badge>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${SEVERITY_COLOR[alert.severity]}`}>
                          {alert.severity} priority
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{alert.category} · {alert.volume} orders/month · {alert.margin}% margin</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{alert.rationale}</p>
                    </div>
                  </div>

                  {/* Right — Price action */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Current → Suggested</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-base font-mono text-slate-400 dark:text-slate-500 line-through">₹{alert.currentPrice}</span>
                        {!noPriceChange && (
                          <>
                            {priceDir ? <ArrowUpRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : <ArrowDownRight className="h-4 w-4 text-rose-600 dark:text-rose-400" />}
                            <span className={`text-xl font-extrabold font-mono ${priceDir ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>₹{alert.suggestedPrice}</span>
                          </>
                        )}
                        {noPriceChange && <span className="text-xs text-slate-600 dark:text-slate-400">No price change</span>}
                      </div>
                    </div>

                    {!isApplied ? (
                      <Button
                        variant={alert.alertType === "low_velocity" ? "secondary" : "glow"}
                        size="sm"
                        onClick={() => handleApply(alert.itemName, alert.suggestedPrice, alert.alertType)}
                      >
                        {alert.alertType === "low_velocity" ? "Add to Broadcast" : "Apply Price"}
                      </Button>
                    ) : (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        ✓ Applied
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
