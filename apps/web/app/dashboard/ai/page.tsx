"use client";

import * as React from "react";
import Link from "next/link";
import {
  BrainCircuit,
  Sparkles,
  PenLine,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  MessageSquare,
  ArrowRight,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AI_TOOLS = [
  {
    href: "/dashboard/ai/menu-writer",
    icon: PenLine,
    title: "AI Menu Writer",
    description: "Generate compelling, revenue-driving descriptions for every dish — in seconds.",
    badge: "6.1",
    badgeVariant: "success" as const,
    gradient: "from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/20 dark:to-teal-500/10",
    border: "border-emerald-200 dark:border-emerald-500/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    metrics: "↑ 18% higher add-to-cart rate",
  },
  {
    href: "/dashboard/ai/upsell",
    icon: ShoppingCart,
    title: "Upsell Engine",
    description: "\"Goes well with…\" AI suggestions shown on the customer ordering page to lift AOV.",
    badge: "6.2",
    badgeVariant: "info" as const,
    gradient: "from-blue-500/10 to-cyan-500/5 dark:from-blue-500/20 dark:to-cyan-500/10",
    border: "border-blue-200 dark:border-blue-500/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
    metrics: "↑ 12.4% average order value",
  },
  {
    href: "/dashboard/ai/forecast",
    icon: TrendingUp,
    title: "Demand Forecast",
    description: "7-day predicted order volume by hour with AI-powered staffing recommendations.",
    badge: "6.3",
    badgeVariant: "purple" as const,
    gradient: "from-violet-500/10 to-purple-500/5 dark:from-violet-500/20 dark:to-purple-500/10",
    border: "border-violet-200 dark:border-violet-500/30",
    iconColor: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-500/10 dark:bg-violet-500/20",
    metrics: "78% forecast accuracy",
  },
  {
    href: "/dashboard/whatsapp",
    icon: MessageSquare,
    title: "WhatsApp Chatbot",
    description: "Let guests reorder their last meal, track orders, or browse specials — all via WhatsApp.",
    badge: "6.4",
    badgeVariant: "success" as const,
    gradient: "from-green-500/10 to-emerald-500/5 dark:from-green-500/20 dark:to-emerald-500/10",
    border: "border-green-200 dark:border-green-500/30",
    iconColor: "text-green-600 dark:text-green-400",
    iconBg: "bg-green-500/10 dark:bg-green-500/20",
    metrics: "3× faster reorder time",
  },
  {
    href: "/dashboard/ai/pricing",
    icon: AlertTriangle,
    title: "Smart Pricing Alerts",
    description: "AI scans your full menu for underpriced stars, overpriced slow-movers, and margin leaks.",
    badge: "6.5",
    badgeVariant: "warning" as const,
    gradient: "from-amber-500/10 to-orange-500/5 dark:from-amber-500/20 dark:to-orange-500/10",
    border: "border-amber-200 dark:border-amber-500/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
    metrics: "₹84,500 projected monthly uplift",
  },
];

const STATS = [
  { label: "AI Calls Today", value: "1,284", sub: "mock mode" },
  { label: "Revenue Attributed", value: "₹2.4L", sub: "via AI upsells" },
  { label: "Descriptions Generated", value: "48", sub: "menu items" },
  { label: "Forecast Accuracy", value: "78%", sub: "last 7 days" },
];

export default function AIStudioPage() {
  return (
    <div className="space-y-8 w-full">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-violet-200 dark:border-violet-500/20 bg-gradient-to-br from-violet-50/80 via-white to-indigo-50/60 dark:from-[#0d0f1a] dark:via-[#111526] dark:to-[#0b0d18] p-8 shadow-xs">
        {/* Background glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-500/8 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/30 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by Gemini 2.0 Flash Lite
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            AI Studio
            <span className="ml-3 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-600 dark:from-violet-400 dark:to-cyan-400">
              — Phase 6
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl leading-relaxed font-medium">
            Five intelligent tools that learn from your menu, orders, and guests to drive more revenue
            with less effort. All AI features run in <strong className="text-slate-900 dark:text-white">mock mode</strong> by
            default — add your <code className="text-violet-700 dark:text-violet-300 bg-violet-500/10 px-1 rounded">GEMINI_API_KEY</code> to
            go live.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Mock mode active — fully functional
            </div>
            <div className="flex items-center gap-1.5 text-xs text-violet-700 dark:text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-full font-semibold">
              <Zap className="h-3.5 w-3.5" />
              Zero extra infrastructure
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <Card key={stat.label} variant="glass">
            <CardContent className="p-5">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{stat.label}</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stat.value}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tool Cards */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          AI-Powered Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {AI_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.href} href={tool.href} className="group block">
                <Card
                  variant="glass"
                  className={`h-full border ${tool.border} bg-gradient-to-br ${tool.gradient} transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-xl shadow-xs`}
                >
                  <CardContent className="p-6 flex flex-col gap-4 h-full">
                    <div className="flex items-start justify-between">
                      <span className={`p-3 rounded-xl ${tool.iconBg}`}>
                        <Icon className={`h-5 w-5 ${tool.iconColor}`} />
                      </span>
                      <Badge variant={tool.badgeVariant} size="sm">
                        Feature {tool.badge}
                      </Badge>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">{tool.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{tool.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/60">
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">{tool.metrics}</span>
                      <ArrowRight className={`h-4 w-4 ${tool.iconColor} transition-transform group-hover:translate-x-1`} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Integration Banner */}
      <Card variant="glass" className="border-slate-200 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            Enable Live AI Mode
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Currently running in mock mode with realistic demo data. To connect real Gemini AI:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 font-mono text-xs">
            <span className="text-slate-500"># apps/api/.env</span>
            <br />
            <span className="text-emerald-600 dark:text-emerald-400">GEMINI_API_KEY</span>
            <span className="text-slate-500 dark:text-slate-400">=</span>
            <span className="text-amber-600 dark:text-amber-300">AIza...</span>
            <span className="ml-2 text-slate-500"># from aistudio.google.com/app/apikey</span>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Free tier includes 1,500 requests/day. The service auto-detects the key and switches from mock to live with zero code changes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
