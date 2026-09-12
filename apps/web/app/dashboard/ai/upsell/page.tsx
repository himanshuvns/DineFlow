"use client";

import * as React from "react";
import {
  ShoppingCart,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  ChevronRight,
  Plus,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

const UPSELL_RULES = [
  {
    id: "risotto",
    trigger: "Truffle Mushroom Risotto",
    suggestions: [
      { name: "Smoked Burrata & Heirloom Salad", reason: "Light acidity balances rich truffle flavours", price: 620, lift: 8.4 },
      { name: "Vintage Merlot 2019", reason: "Classic pairing — earthy wine echoes the truffle", price: 1200, lift: 12.1 },
      { name: "Salted Caramel Fondant", reason: "Sweet finish guests consistently order with this dish", price: 480, lift: 6.8 },
    ],
    enabled: true,
  },
  {
    id: "salmon",
    trigger: "Pan-Seared Atlantic Salmon",
    suggestions: [
      { name: "Cold Brew Tonic & Citrus", reason: "Citrus notes complement the lemon-caper emulsion", price: 320, lift: 5.2 },
      { name: "Roasted Asparagus Side", reason: "Classic fish accompaniment, high-margin add-on", price: 280, lift: 4.1 },
    ],
    enabled: true,
  },
  {
    id: "sandwich",
    trigger: "Grand Club Sandwich",
    suggestions: [
      { name: "Skin-On Truffle Fries", reason: "Top-requested pairing in room-service orders", price: 350, lift: 9.2 },
      { name: "Fresh Fruit Platter", reason: "Lighter option for health-conscious in-room diners", price: 420, lift: 3.8 },
    ],
    enabled: false,
  },
];

export default function UpsellPage() {
  const { addToast } = useToast();
  const [rules, setRules] = React.useState(UPSELL_RULES);
  const [previewCart, setPreviewCart] = React.useState(["Truffle Mushroom Risotto"]);
  const [previewItemInput, setPreviewItemInput] = React.useState("");

  const activeRule = rules.find((r) => r.enabled && previewCart.some((c) => c.toLowerCase().includes(r.trigger.toLowerCase().split(" ")[0].toLowerCase())));

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
    const rule = rules.find((r) => r.id === id);
    addToast("info", "Rule Updated", `Upsell for "${rule?.trigger}" ${rule?.enabled ? "disabled" : "enabled"}.`);
  };

  const totalLift = rules.filter((r) => r.enabled).reduce((acc, r) => acc + r.suggestions.reduce((a, s) => a + s.lift, 0) / r.suggestions.length, 0);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-semibold mb-2">
            <ShoppingCart className="h-3.5 w-3.5" />
            Feature 6.2 — AI Upsell Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Upsell Engine Studio</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Configure AI-powered "Goes well with…" suggestions shown on the customer ordering page.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">+{totalLift.toFixed(1)}%</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Est. AOV Lift</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Rules */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Upsell Rules
          </h2>

          {rules.map((rule) => (
            <Card key={rule.id} variant="glass" className={`border ${rule.enabled ? "border-blue-500/30" : "border-slate-200 dark:border-slate-800/60"} transition-all`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">When guest orders</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{rule.trigger}</p>
                  </div>
                  <button onClick={() => toggleRule(rule.id)} className="flex items-center gap-2 text-xs font-semibold transition-colors cursor-pointer">
                    {rule.enabled ? (
                      <>
                        <ToggleRight className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        <span className="text-blue-600 dark:text-blue-400 font-bold">Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                        <span className="text-slate-500">Inactive</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">AI Suggestions</p>
                  {rule.suggestions.map((s, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-xl text-xs transition-all ${rule.enabled ? "bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs" : "bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200/60 dark:border-slate-800/30 opacity-60"}`}>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 dark:text-white">{s.name}</p>
                        <p className="text-slate-600 dark:text-slate-400 mt-0.5">{s.reason}</p>
                      </div>
                      <div className="text-right ml-3 shrink-0">
                        <p className="font-mono font-bold text-slate-900 dark:text-white">₹{s.price}</p>
                        <p className="text-emerald-600 dark:text-emerald-400 font-semibold">+{s.lift}% AOV</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Right: Live Preview Simulator */}
        <div className="lg:col-span-5">
          <Card variant="glow" className="border-blue-500/20 sticky top-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Customer Cart Preview
              </CardTitle>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                Simulates what the guest sees on the ordering page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart items */}
              <div className="space-y-2">
                {previewCart.map((item) => (
                  <div key={item} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs shadow-xs">
                    <span className="font-bold text-slate-900 dark:text-white">{item}</span>
                    <Badge variant="success" size="sm">In Cart</Badge>
                  </div>
                ))}
              </div>

              {/* AI Upsell suggestions */}
              {activeRule && (
                <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                  <div className="flex items-center gap-1.5 text-[11px] text-blue-700 dark:text-blue-400 font-bold mb-3">
                    <Sparkles className="h-3.5 w-3.5" />
                    Goes well with…
                  </div>
                  <div className="space-y-2">
                    {activeRule.suggestions.slice(0, 2).map((s, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 dark:text-white">{s.name}</span>
                          <span className="font-mono font-bold text-blue-700 dark:text-blue-300">₹{s.price}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px]">{s.reason}</p>
                        <button className="mt-2 flex items-center gap-1 text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold text-[11px] transition-colors cursor-pointer">
                          <Plus className="h-3 w-3" /> Add to order
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!activeRule && (
                <div className="flex flex-col items-center text-center gap-2 py-6 text-slate-500">
                  <Info className="h-5 w-5" />
                  <p className="text-xs">Enable a rule above to see the upsell preview</p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Estimated AOV boost</span>
                  <span className="font-bold text-emerald-400">+₹{activeRule ? Math.round(activeRule.suggestions.slice(0, 2).reduce((a, s) => a + s.price * s.lift / 100, 0)) : 0}/order</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
