"use client";

import * as React from "react";
import {
  Tag,
  Sparkles,
  Send,
  Smartphone,
  MessageSquare,
  Bell,
  TrendingUp,
  RotateCcw,
  Plus,
  CheckCircle2,
  Users,
  DollarSign,
  Percent,
  Clock,
  ArrowRight,
  Eye,
  Trash2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  useOfferStore,
  OfferCampaign,
  DiscountType,
  TargetAudience,
  OfferChannel,
  generateOfferAICopy,
} from "@/lib/stores/offer-store";
import { formatCurrency } from "@/lib/utils";

export default function OffersStudioPage() {
  const { addToast } = useToast();
  const { tenant } = useAuthStore();
  const tenantSlug = tenant?.slug || "the-grand-bistro";
  const restaurantName = tenant?.name || "The Grand Bistro";

  const {
    getAllCampaigns,
    createCampaign,
    broadcastAgain,
    deleteCampaign,
  } = useOfferStore();

  const campaigns = getAllCampaigns(tenantSlug);

  // Composer Form State
  const [title, setTitle] = React.useState("🍕 Craving Round Two? 20% OFF Post-Meal Re-Order!");
  const [description, setDescription] = React.useState(
    "Enjoy 20% off drinks, artisanal pizzas, or handcrafted desserts right now. Hot & fresh to your table or doorstep!"
  );
  const [discountType, setDiscountType] = React.useState<DiscountType>("percent");
  const [discountValue, setDiscountValue] = React.useState<number>(20);
  const [freeItemName, setFreeItemName] = React.useState("Truffle Fries");
  const [promoCode, setPromoCode] = React.useState("REORDER20");
  const [targetAudience, setTargetAudience] = React.useState<TargetAudience>("billed_today");
  const [channels, setChannels] = React.useState<OfferChannel[]>(["whatsapp", "web_push", "in_menu"]);
  const [deepLinkDestination, setDeepLinkDestination] = React.useState<"table_menu" | "online_delivery">("table_menu");
  const [isPolishingAI, setIsPolishingAI] = React.useState(false);

  // Simulator Preview Tab
  const [simulatorTab, setSimulatorTab] = React.useState<"lockscreen" | "whatsapp" | "inmenu">("lockscreen");

  // Telemetry Aggregations
  const totalCampaigns = campaigns.length;
  const totalDinersReached = campaigns.reduce((acc, c) => acc + c.sentCount, 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + c.clickCount, 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + c.convertedCount, 0);
  const totalRecoveredRevenue = campaigns.reduce((acc, c) => acc + c.recoveredRevenue, 0);
  const averageCTR = totalDinersReached > 0 ? ((totalClicks / totalDinersReached) * 100).toFixed(1) : "34.8";

  // Channel toggle helper
  const toggleChannel = (ch: OfferChannel) => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((item) => item !== ch) : [...prev, ch]
    );
  };

  // AI Copy Polish Action
  const handlePolishWithAI = async () => {
    setIsPolishingAI(true);
    await new Promise((r) => setTimeout(r, 650));
    const generated = generateOfferAICopy(restaurantName, discountType, discountValue, freeItemName);
    const pick = generated[Math.floor(Math.random() * generated.length)];
    setTitle(pick.title);
    setDescription(pick.copy);
    setPromoCode(pick.promoCode);
    setIsPolishingAI(false);
    addToast("success", "AI Copy Generated ✨", "Mouthwatering ad copy & promo code crafted.");
  };

  // Submit Broadcast
  const handleLaunchBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !promoCode.trim()) {
      addToast("error", "Missing Information", "Title and promo code are required.");
      return;
    }

    createCampaign({
      tenantSlug,
      title: title.trim(),
      description: description.trim(),
      discountType,
      discountValue: Number(discountValue) || 0,
      freeItemName: discountType === "free_item" ? freeItemName : undefined,
      promoCode: promoCode.trim().toUpperCase(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
      targetAudience,
      channels,
      deepLinkDestination,
    });

    addToast(
      "success",
      "Campaign Broadcasted! 🚀",
      `Dispatched across ${channels.join(", ")} to ${targetAudience.replace("_", " ")}.`
    );
  };

  const discountBadgeText =
    discountType === "percent"
      ? `${discountValue}% OFF`
      : discountType === "fixed"
      ? `₹${discountValue} OFF`
      : `Free ${freeItemName || "Perk"}`;

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/20">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            Post-Dining Re-Engagement & Push Broadcast Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Offers & Promotional Broadcasts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Recover lost diner revenue and trigger high-margin re-orders with 1-click WhatsApp, Web Push, and In-Menu promotional blasts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="glow"
            size="sm"
            onClick={() => {
              const el = document.getElementById("broadcast-composer");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create New Broadcast
          </Button>
        </div>
      </div>

      {/* KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card variant="glass" className="p-4 sm:p-5">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Campaigns</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {totalCampaigns}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <CheckCircle2 className="h-3 w-3" /> Live & Historical
          </span>
        </Card>

        <Card variant="glass" className="p-4 sm:p-5">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Diners Reached</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {totalDinersReached.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across Push & WhatsApp
          </span>
        </Card>

        <Card variant="glass" className="p-4 sm:p-5">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Click-Through Rate</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {averageCTR}%
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" /> +14.2% vs industry avg
          </span>
        </Card>

        <Card variant="glass" className="p-4 sm:p-5">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Re-Orders Converted</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {totalConversions}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Tables & Online delivery
          </span>
        </Card>

        <Card variant="glass" className="p-4 sm:p-5 border-emerald-500/30 bg-emerald-500/5">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Recovered Revenue</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalRecoveredRevenue, "INR")}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <Zap className="h-3 w-3" /> Direct attribution
          </span>
        </Card>
      </div>

      {/* Main Studio Split: Broadcast Composer & Interactive Simulator */}
      <div id="broadcast-composer" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Broadcast Form / Active Offer Customizer (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Tag className="h-4 w-4 text-emerald-500" />
                  Live Broadcast Composer
                </CardTitle>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handlePolishWithAI}
                  isLoading={isPolishingAI}
                  leftIcon={<Sparkles className="h-3.5 w-3.5 text-amber-500" />}
                >
                  ✨ Polish Copy with AI
                </Button>
              </div>
              <CardDescription className="text-xs">
                Compose offer headline and target dining audience. Edits update the live phone simulator in real-time.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLaunchBroadcast} className="space-y-4">
                {/* Offer Headline */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Offer Title & Emoji Headline
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 🍕 Craving Round Two? 20% OFF Re-Order!"
                    className="text-xs font-semibold"
                    required
                  />
                </div>

                {/* Ad Copy Body */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Appetizing Ad Copy Body
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none leading-relaxed"
                    placeholder="Describe the mouthwatering food perk..."
                    required
                  />
                </div>

                {/* Discount Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Discount Type
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                      className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                    >
                      <option value="percent">Percentage (%)</option>
                      <option value="fixed">Flat Amount (₹)</option>
                      <option value="free_item">Free Item Perk</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      {discountType === "free_item" ? "Item Name" : "Discount Value"}
                    </label>
                    {discountType === "free_item" ? (
                      <Input
                        value={freeItemName}
                        onChange={(e) => setFreeItemName(e.target.value)}
                        placeholder="e.g. Truffle Fries"
                        className="text-xs"
                      />
                    ) : (
                      <Input
                        type="number"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(Number(e.target.value))}
                        className="text-xs font-mono"
                      />
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Coupon Code
                    </label>
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="e.g. REORDER20"
                      className="text-xs font-mono font-bold uppercase"
                      required
                    />
                  </div>
                </div>

                {/* Target Audience Selector */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Target Diner Segment
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: "billed_today", label: "🎯 Diners Billed Today", sub: "Warmest intent for dessert/drinks" },
                      { id: "active_tables", label: "🎯 Active Tables Now", sub: "In-dining room round 2 upsell" },
                      { id: "past_7_days", label: "🎯 Past 7 Days Diners", sub: "Weekend win-back re-orders" },
                    ].map((seg) => (
                      <button
                        key={seg.id}
                        type="button"
                        onClick={() => setTargetAudience(seg.id as TargetAudience)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          targetAudience === seg.id
                            ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-800 dark:text-emerald-300 font-semibold shadow-xs"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-xs font-bold block">{seg.label}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{seg.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Channel Checkboxes & Destination */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Dispatch Channels
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "web_push", label: "Web Push 🔔" },
                        { id: "whatsapp", label: "WhatsApp 💬" },
                        { id: "in_menu", label: "In-Menu 🏷️" },
                      ].map((ch) => (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => toggleChannel(ch.id as OfferChannel)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                            channels.includes(ch.id as OfferChannel)
                              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"
                          }`}
                        >
                          {ch.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Deep-Link Destination
                    </label>
                    <select
                      value={deepLinkDestination}
                      onChange={(e) => setDeepLinkDestination(e.target.value as any)}
                      className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                    >
                      <option value="table_menu">Table Menu Ordering (/m/:slug/:tableId)</option>
                      <option value="online_delivery">Takeaway / Delivery Portal (/m/:slug)</option>
                    </select>
                  </div>
                </div>

                {/* Submit Launch CTA */}
                <Button
                  type="submit"
                  variant="glow"
                  size="md"
                  className="w-full mt-4 font-bold"
                  leftIcon={<Send className="h-4 w-4" />}
                >
                  🚀 Broadcast Offer Now
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right: Interactive 3-Tab Live Phone Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-emerald-500" />
              Live Diner Mobile Simulator
            </h2>

            {/* Simulator Switcher Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSimulatorTab("lockscreen")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  simulatorTab === "lockscreen"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Push 🔔
              </button>
              <button
                type="button"
                onClick={() => setSimulatorTab("whatsapp")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  simulatorTab === "whatsapp"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                WhatsApp 💬
              </button>
              <button
                type="button"
                onClick={() => setSimulatorTab("inmenu")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  simulatorTab === "inmenu"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                In-Menu 🏷️
              </button>
            </div>
          </div>

          {/* Smartphone Frame Mockup */}
          <div className="mx-auto w-full max-w-[340px] rounded-[44px] p-3.5 bg-slate-900 dark:bg-slate-950 shadow-2xl border-4 border-slate-700/60 ring-1 ring-slate-800 select-none">
            {/* Screen Glass Bezel */}
            <div className="relative w-full aspect-[9/18.5] rounded-[34px] overflow-hidden flex flex-col justify-between bg-gradient-to-b from-slate-950 via-slate-900 to-[#070b14] text-white p-4">
              {/* Dynamic Island Notch */}
              <div className="absolute top-2.5 inset-x-0 flex justify-center z-30">
                <div className="h-4 w-20 bg-black rounded-full flex items-center justify-between px-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-800" />
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/80" />
                </div>
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 pt-1 z-20">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px]">5G</span>
                  <div className="w-4 h-2 rounded-xs border border-slate-400 p-0.5">
                    <div className="h-full w-full bg-white rounded-2xs" />
                  </div>
                </div>
              </div>

              {/* SIMULATOR TAB 1: LOCKSCREEN PUSH */}
              {simulatorTab === "lockscreen" && (
                <div className="my-auto space-y-4 pt-4">
                  <div className="text-center space-y-1">
                    <span className="text-4xl font-extralight tracking-tight">09:41</span>
                    <p className="text-[10px] text-slate-400">Wednesday, October 14</p>
                  </div>

                  {/* Lock Screen Notification Banner */}
                  <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 p-3.5 shadow-xl space-y-2 animate-in fade-in-50 slide-in-from-top-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <div className="h-4 w-4 rounded-md bg-emerald-500 flex items-center justify-center text-white text-[9px] font-black">
                          D
                        </div>
                        <span className="font-bold text-white">{restaurantName}</span>
                      </div>
                      <span className="text-[9px] text-slate-400">now</span>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white line-clamp-1">
                        {title}
                      </p>
                      <p className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed">
                        {description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <Badge variant="glow" size="sm" className="font-mono text-[9px]">
                        {promoCode} ({discountBadgeText})
                      </Badge>
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        Order Now <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* SIMULATOR TAB 2: WHATSAPP BUBBLE */}
              {simulatorTab === "whatsapp" && (
                <div className="my-auto space-y-3 pt-4">
                  {/* WhatsApp Header Mock */}
                  <div className="p-2.5 rounded-xl bg-emerald-900/40 border border-emerald-500/30 flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center font-black text-white text-xs">
                      {restaurantName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                        {restaurantName}
                        <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                      </p>
                      <p className="text-[9px] text-emerald-300">Official Business Account</p>
                    </div>
                  </div>

                  {/* Chat Message Bubble */}
                  <div className="p-3.5 rounded-2xl bg-[#1f2c34] border border-[#2a3942] text-slate-200 text-xs space-y-2 shadow-lg">
                    <p className="font-bold text-white text-xs">
                      🎁 Exclusive Diner Offer from {restaurantName}
                    </p>
                    <p className="text-[11px] leading-relaxed text-slate-300">
                      {description}
                    </p>
                    <div className="p-2 rounded-lg bg-black/30 border border-white/5 space-y-0.5 font-mono text-[10px]">
                      <p className="text-emerald-400 font-bold">🎟️ Coupon: {promoCode}</p>
                      <p className="text-slate-400">Discount: {discountBadgeText}</p>
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <button
                        type="button"
                        className="w-full py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs"
                      >
                        🍽️ Order Now with Offer
                      </button>
                    </div>
                    <div className="text-right text-[8px] text-slate-500">
                      09:41 AM • Read
                    </div>
                  </div>
                </div>
              )}

              {/* SIMULATOR TAB 3: IN-MENU TOAST */}
              {simulatorTab === "inmenu" && (
                <div className="my-auto space-y-3 pt-4">
                  <div className="p-2 rounded-xl bg-slate-800/60 border border-white/10 text-center">
                    <span className="text-[10px] text-slate-400">Diner browsing /m/{tenantSlug}/t-04</span>
                  </div>

                  {/* Floating In-Menu Toast Banner */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/40 text-white shadow-2xl space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Bell className="h-3.5 w-3.5 animate-bounce" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge variant="success" size="sm" className="font-mono text-[9px]">
                          {discountBadgeText}
                        </Badge>
                        <h4 className="text-[11px] font-bold text-white truncate mt-0.5">
                          {title}
                        </h4>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed">
                      {description}
                    </p>
                    <Button size="sm" variant="glow" className="w-full text-xs font-bold h-7">
                      Claim ({promoCode})
                    </Button>
                  </div>
                </div>
              )}

              {/* Home Indicator Bar */}
              <div className="flex justify-center pb-1">
                <div className="h-1 w-24 bg-white/40 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign History & Re-Send Table */}
      <Card variant="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Broadcast Campaign History</CardTitle>
              <CardDescription className="text-xs">
                Performance tracking, click-through rates, and 1-click re-broadcasting for completed offers.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Campaign & Headline</TableHead>
                  <TableHead className="text-xs">Audience</TableHead>
                  <TableHead className="text-xs">Channels</TableHead>
                  <TableHead className="text-xs">Coupon Code</TableHead>
                  <TableHead className="text-xs">Diners Reached</TableHead>
                  <TableHead className="text-xs">Clicks (CTR)</TableHead>
                  <TableHead className="text-xs">Orders Converted</TableHead>
                  <TableHead className="text-xs">Revenue</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((c) => {
                  const ctr = c.sentCount > 0 ? ((c.clickCount / c.sentCount) * 100).toFixed(1) : "0.0";
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="max-w-[220px]">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {c.title}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {c.description}
                        </p>
                      </TableCell>

                      <TableCell className="text-xs">
                        <Badge variant="outline" size="sm" className="capitalize text-[10px]">
                          {c.targetAudience.replace("_", " ")}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1">
                          {c.channels.map((ch) => (
                            <span
                              key={ch}
                              className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono"
                            >
                              {ch === "whatsapp" ? "WA" : ch === "web_push" ? "Push" : "Menu"}
                            </span>
                          ))}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {c.promoCode}
                      </TableCell>

                      <TableCell className="text-xs font-mono">
                        {c.sentCount.toLocaleString()}
                      </TableCell>

                      <TableCell className="text-xs">
                        <span className="font-mono font-semibold">{c.clickCount}</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 ml-1">
                          ({ctr}%)
                        </span>
                      </TableCell>

                      <TableCell className="text-xs font-mono font-semibold">
                        {c.convertedCount}
                      </TableCell>

                      <TableCell className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(c.recoveredRevenue, "INR")}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 text-[11px]"
                            onClick={() => {
                              broadcastAgain(c.id);
                              addToast(
                                "success",
                                "Campaign Re-Dispatched",
                                `Fresh notifications queued for ${c.promoCode}.`
                              );
                            }}
                            leftIcon={<RotateCcw className="h-3 w-3" />}
                          >
                            Broadcast Again
                          </Button>

                          <button
                            type="button"
                            onClick={() => deleteCampaign(c.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete Campaign"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
