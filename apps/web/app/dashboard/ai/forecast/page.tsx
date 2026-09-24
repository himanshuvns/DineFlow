"use client";

import * as React from "react";
import {
  TrendingUp,
  Sparkles,
  RefreshCw,
  Users,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { HospitalityLoader } from "@/components/ui/hospitality-loader";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = Array.from({ length: 14 }, (_, i) => `${i + 10}:00`);

// Mock 7-day forecast data
function generateForecast() {
  const peakMultipliers = [0.7, 0.75, 0.85, 0.8, 1.0, 1.2, 1.1];
  return DAYS.map((day, di) => ({
    day,
    total: Math.round(peakMultipliers[di] * 280),
    hourly: HOURS.map((hour) => {
      const h = parseInt(hour);
      let base = 0;
      if (h >= 12 && h <= 14) base = 45;
      else if (h >= 19 && h <= 21) base = 68;
      else if (h >= 17 && h <= 18) base = 28;
      else if (h >= 22) base = 10;
      else base = 8;
      return { hour, orders: Math.round(base * peakMultipliers[di]), confidence: 0.72 + di * 0.02 };
    }),
    peakHour: "20:00",
  }));
}

const INSIGHTS = [
  { icon: Users, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", text: "Add 2 extra servers Friday–Saturday 7–10 PM (predicted 92 orders/hr peak)" },
  { icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", text: "Wednesday lunch trending +18% week-over-week — pre-position kitchen prep staff" },
  { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", text: "Monday 3–5 PM consistently slow — rotate staff breaks to this window" },
];

function getIntensityClass(orders: number): string {
  if (orders >= 60) return "bg-violet-500 text-white";
  if (orders >= 40) return "bg-violet-500/60 text-white";
  if (orders >= 25) return "bg-violet-500/35 text-slate-900 dark:text-slate-200";
  if (orders >= 12) return "bg-violet-500/15 text-slate-800 dark:text-slate-300";
  return "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400";
}

export default function ForecastPage() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [forecast, setForecast] = React.useState(generateForecast());
  const [selectedDay, setSelectedDay] = React.useState<string | null>(null);
  const [view, setView] = React.useState<"heatmap" | "bars">("heatmap");

  const handleRegenerate = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setForecast(generateForecast().map((d) => ({
      ...d,
      hourly: d.hourly.map((h) => ({ ...h, orders: h.orders + Math.floor(Math.random() * 5 - 2) })),
    })));
    setIsLoading(false);
    addToast("success", "Forecast Updated", "7-day demand forecast regenerated with latest order patterns.");
  };

  const activeDay = selectedDay ? forecast.find((d) => d.day === selectedDay) : null;

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-700 dark:text-violet-400 text-xs font-semibold mb-2">
            <TrendingUp className="h-3.5 w-3.5" />
            Feature 6.3 — Demand Forecasting
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">7-Day Demand Forecast</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            AI-predicted order volumes by hour to optimise staffing and prep.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1 text-xs">
            {(["heatmap", "bars"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all capitalize cursor-pointer ${view === v ? "bg-violet-500/20 text-violet-800 dark:text-violet-300 border border-violet-500/30 font-bold shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
              >
                {v}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isLoading}
            leftIcon={isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          >
            {isLoading ? "Forecasting…" : "Regenerate"}
          </Button>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Predicted Orders", value: forecast.reduce((a, d) => a + d.total, 0).toLocaleString(), color: "text-violet-700 dark:text-violet-400" },
          { label: "Peak Day", value: "Saturday", color: "text-emerald-700 dark:text-emerald-400" },
          { label: "Peak Hour", value: "8:00 PM", color: "text-amber-700 dark:text-amber-400" },
          { label: "Forecast Confidence", value: "78%", color: "text-cyan-700 dark:text-cyan-400" },
        ].map((stat) => (
          <Card key={stat.label} variant="glass">
            <CardContent className="p-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{stat.label}</p>
              <p className={`text-xl font-extrabold ${stat.color} mt-1`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Heatmap or Bar View */}
      <Card variant="glass" className="border-violet-500/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              {view === "heatmap" ? "Demand Heat Map — Orders by Hour × Day" : "Daily Order Volume Forecast"}
            </CardTitle>
            <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
              {view === "heatmap" ? "Click a day column to drill into hourly detail" : "Total predicted orders per day, next 7 days"}
            </CardDescription>
          </div>
          <Badge variant="purple" size="sm">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Generated
          </Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 flex items-center justify-center">
              <HospitalityLoader
                variant="cloche"
                title="Simulating Table Footfall & Kitchen Demand…"
                subtitle="Analyzing peak dinner seating, preparation velocity & table turnover"
              />
            </div>
          ) : view === "heatmap" ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-slate-500 font-medium w-16">Hour</th>
                    {forecast.map((d) => (
                      <th
                        key={d.day}
                        className={`p-2 text-center text-xs font-semibold cursor-pointer transition-colors ${selectedDay === d.day ? "text-violet-700 dark:text-violet-300 font-bold" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                        onClick={() => setSelectedDay(selectedDay === d.day ? null : d.day)}
                      >
                        {d.day.slice(0, 3)}
                        {selectedDay === d.day && <div className="h-0.5 bg-violet-500 dark:bg-violet-400 rounded mt-1 mx-auto w-4" />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HOURS.map((hour) => (
                    <tr key={hour}>
                      <td className="p-1 text-slate-500 font-mono">{hour}</td>
                      {forecast.map((d) => {
                        const slot = d.hourly.find((h) => h.hour === hour);
                        return (
                          <td key={d.day} className="p-1 text-center">
                            <div className={`mx-auto w-10 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-[11px] transition-all ${getIntensityClass(slot?.orders || 0)} ${selectedDay === d.day ? "ring-1 ring-violet-400/50" : ""}`}>
                              {slot?.orders || 0}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center gap-3 mt-4 text-[11px] text-slate-400">
                <span>Intensity:</span>
                {["≥60", "40–59", "25–39", "12–24", "<12"].map((label, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className={`h-3 w-5 rounded ${["bg-violet-500", "bg-violet-500/60", "bg-violet-500/35", "bg-violet-500/15", "bg-slate-800/60"][i]}`} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-end gap-3 h-52 pb-4 border-b border-slate-800 pt-4">
              {forecast.map((d) => {
                const maxTotal = Math.max(...forecast.map((x) => x.total));
                const pct = Math.round((d.total / maxTotal) * 100);
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-mono text-violet-700 dark:text-violet-300 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">{d.total}</span>
                    <div
                      style={{ height: `${pct}%` }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-violet-700/80 to-violet-400 group-hover:from-violet-600 group-hover:to-violet-300 transition-all duration-200"
                    />
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors font-medium">{d.day.slice(0, 3)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Staffing Insights */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          AI Staffing Recommendations
        </h2>
        <div className="space-y-3">
          {INSIGHTS.map((insight, idx) => {
            const Icon = insight.icon;
            return (
              <div key={idx} className={`flex items-start gap-3 p-4 rounded-xl border ${insight.bg} text-sm`}>
                <Icon className={`h-4 w-4 ${insight.color} shrink-0 mt-0.5`} />
                <p className="text-slate-800 dark:text-slate-300 font-medium">{insight.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
