"use client";

import * as React from "react";
import {
  Star,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  Printer,
  ExternalLink,
  Save,
  MessageSquare,
  Sparkles,
  Maximize2,
  Copy,
  RefreshCw,
  ThumbsUp,
  Clock,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { QRCodeImage } from "@/components/ui/qr-code-image";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useReviewStore, ReviewConfig } from "@/lib/reviews/review-store";
import { apiClient } from "@/lib/api";

interface LiveReviewItem {
  id: string;
  tenantId?: string;
  tenantSlug?: string;
  rating: number;
  issueCategories?: string[];
  vibeTags?: string[];
  comment: string;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  tableOrRoom?: string;
  status: "new" | "in_review" | "resolved" | "positive";
  resolutionNotes?: string;
  createdAt: string;
}

interface LiveReviewStats {
  totalScans: number;
  positiveGenerated: number;
  negativeShielded: number;
  averageSentiment: number;
  totalReviews: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
  conversionRate: number;
}

export default function ReviewsManagementPage() {
  const { addToast } = useToast();
  const { tenant } = useAuthStore();
  const tenantSlug = tenant?.slug || "the-grand-bistro";
  const restaurantName = tenant?.name || "The Grand Bistro";

  const { getConfig, updateConfig } = useReviewStore();
  const config = getConfig(tenantSlug);

  // Dynamic Live State
  const [stats, setStats] = React.useState<LiveReviewStats>({
    totalScans: 0,
    positiveGenerated: 0,
    negativeShielded: 0,
    averageSentiment: 5.0,
    totalReviews: 0,
    fiveStarCount: 0,
    fourStarCount: 0,
    threeStarCount: 0,
    twoStarCount: 0,
    oneStarCount: 0,
    conversionRate: 0,
  });
  const [reviewsList, setReviewsList] = React.useState<LiveReviewItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Studio customization state
  const [placeIdInput, setPlaceIdInput] = React.useState(config.googlePlaceId || "");
  const [reviewUrlInput, setReviewUrlInput] = React.useState(config.googleReviewUrl || "");
  const [ctaHeading, setCtaHeading] = React.useState(config.standCallToAction || "Loved your meal? Scan to rate us!");
  const [standTheme, setStandTheme] = React.useState<ReviewConfig["standTheme"]>(config.standTheme || "dark");
  const [standSize, setStandSize] = React.useState<ReviewConfig["standSize"]>(config.standSize || "a5");

  // Feedback Table filter
  const [feedbackTab, setFeedbackTab] = React.useState<"all" | "shielded" | "positive" | "resolved">("all");
  const [selectedReview, setSelectedReview] = React.useState<LiveReviewItem | null>(null);
  const [resolutionNotesInput, setResolutionNotesInput] = React.useState("");

  // Stand Preview Fullscreen Modal
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  // Dynamic Public Review URL
  const [publicReviewUrl, setPublicReviewUrl] = React.useState("");
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setPublicReviewUrl(`${window.location.origin}/m/${tenantSlug}/review`);
    }
  }, [tenantSlug]);

  // Fetch live telemetry from Go API
  const fetchTelemetry = React.useCallback(async (showFeedback = false) => {
    try {
      setIsRefreshing(true);

      // 1. Fetch live dynamic stats
      try {
        const statsRes = await apiClient.get("/reviews/stats");
        if (statsRes.data?.data) {
          setStats(statsRes.data.data);
        } else if (statsRes.data) {
          setStats(statsRes.data);
        }
      } catch (err) {
        console.warn("Could not fetch /reviews/stats:", err);
      }

      // 2. Fetch live reviews & feedback list
      try {
        const listRes = await apiClient.get("/reviews/feedback", {
          params: { limit: 100 },
        });
        const items = listRes.data?.data || listRes.data?.items || listRes.data;
        if (Array.isArray(items)) {
          setReviewsList(items);
        }
      } catch (err) {
        console.warn("Could not fetch /reviews/feedback:", err);
      }

      if (showFeedback) {
        addToast("success", "Telemetry Synced", "Live scan and review metrics updated.");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [addToast]);

  // Initial fetch and 15s auto-polling
  React.useEffect(() => {
    fetchTelemetry(false);

    const interval = setInterval(() => {
      fetchTelemetry(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  // Save Settings
  const handleSaveSettings = () => {
    let finalUrl = reviewUrlInput.trim();
    if (placeIdInput && !finalUrl) {
      finalUrl = `https://search.google.com/local/writereview?placeid=${placeIdInput.trim()}`;
    }

    updateConfig(tenantSlug, {
      googlePlaceId: placeIdInput.trim(),
      googleReviewUrl: finalUrl || config.googleReviewUrl,
      standCallToAction: ctaHeading,
      standTheme,
      standSize,
    });

    setReviewUrlInput(finalUrl || config.googleReviewUrl);
    addToast("success", "Stand Settings Saved", "Google Place ID and Acrylic Studio configurations updated.");
  };

  // Invoke Browser Print
  const handlePrint = () => {
    window.print();
  };

  // Copy Public QR link
  const handleCopyLink = () => {
    if (publicReviewUrl) {
      navigator.clipboard.writeText(publicReviewUrl);
      addToast("info", "Link Copied", publicReviewUrl);
    }
  };

  // Filter reviews
  const filteredReviews = reviewsList.filter((item) => {
    if (feedbackTab === "shielded") {
      return item.rating <= 3 && item.status !== "resolved";
    }
    if (feedbackTab === "positive") {
      return item.rating >= 4 || item.status === "positive";
    }
    if (feedbackTab === "resolved") {
      return item.status === "resolved";
    }
    return true;
  });

  const shieldedCount = reviewsList.filter((f) => f.rating <= 3 && f.status !== "resolved").length;
  const positiveCount = reviewsList.filter((f) => f.rating >= 4 || f.status === "positive").length;
  const resolvedCount = reviewsList.filter((f) => f.status === "resolved").length;

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto">
      {/* Print CSS Injection */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: auto;
                margin: 10mm;
              }
              body * {
                visibility: hidden !important;
              }
              #printable-acrylic-stand,
              #printable-acrylic-stand * {
                visibility: visible !important;
              }
              #printable-acrylic-stand {
                position: fixed !important;
                left: 50% !important;
                top: 50% !important;
                transform: translate(-50%, -50%) !important;
                width: 148mm !important;
                min-height: 200mm !important;
                box-shadow: none !important;
                border: 2px solid #0f172a !important;
                background: #ffffff !important;
                color: #0f172a !important;
                margin: 0 !important;
                padding: 24px !important;
                page-break-inside: avoid !important;
              }
            }
          `,
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            AI Google Maps Review & Acrylic Stand Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Reviews & Smart QR Stand
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Live telemetry synced with your reception and table stands. Amplify 5-star Google reviews while catching 1–3 star complaints before they go public.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTelemetry(true)}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(publicReviewUrl, "_blank")}
            leftIcon={<ExternalLink className="h-4 w-4" />}
          >
            Open Guest View
          </Button>
          <Button
            variant="glow"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="h-4 w-4" />}
          >
            Print Stand / PDF
          </Button>
        </div>
      </div>

      {/* Dynamic KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="glass" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total QR Scans</span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <QrCode className="h-4 w-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {stats.totalScans}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Live telemetry recorded</span>
          </div>
        </Card>

        <Card variant="glass" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">5-Star Reviews Generated</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Star className="h-4 w-4 fill-amber-500" />
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {stats.positiveGenerated}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <span>{stats.conversionRate > 0 ? `${stats.conversionRate}%` : "0%"} Google conversion rate</span>
          </div>
        </Card>

        <Card variant="glass" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Complaints Shielded</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {stats.negativeShielded}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            <span>100% intercepted from Google Maps</span>
          </div>
        </Card>

        <Card variant="glass" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Average Sentiment</span>
            <span className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Sparkles className="h-4 w-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {(stats.averageSentiment || 5.0).toFixed(1)} <span className="text-base text-amber-500">★</span>
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <span>Based on {stats.totalReviews} guest review{stats.totalReviews === 1 ? "" : "s"}</span>
          </div>
        </Card>
      </div>

      {/* Main Grid: Acrylic Studio & Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Configuration Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <QrCode className="h-4 w-4 text-emerald-500" />
                Google Maps Connection
              </CardTitle>
              <CardDescription className="text-xs">
                Link your official Google Business profile to route 5-star guests directly to your write-review dialog.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Google Place ID
                </label>
                <Input
                  value={placeIdInput}
                  onChange={(e) => setPlaceIdInput(e.target.value)}
                  placeholder="e.g. ChIJN1t_tDeuEmsRUsoyG83frY4"
                  className="font-mono text-xs"
                />
                <p className="text-[11px] text-slate-400">
                  Found on Google Maps Place ID Finder. Auto-generates the verified direct link.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Custom Direct Review URL (Override)
                </label>
                <Input
                  value={reviewUrlInput}
                  onChange={(e) => setReviewUrlInput(e.target.value)}
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Acrylic Stand Heading
                </label>
                <Input
                  value={ctaHeading}
                  onChange={(e) => setCtaHeading(e.target.value)}
                  placeholder="Loved your meal? Scan to rate us!"
                  className="text-xs"
                />
              </div>

              {/* Theme & Size Selection */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Stand Theme
                  </label>
                  <select
                    value={standTheme}
                    onChange={(e) => setStandTheme(e.target.value as ReviewConfig["standTheme"])}
                    className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="dark">Onyx Glass (High Contrast)</option>
                    <option value="emerald">Emerald Prestige</option>
                    <option value="gold">Luxury Gold</option>
                    <option value="minimal">Minimalist Crisp White</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Stand Size
                  </label>
                  <select
                    value={standSize}
                    onChange={(e) => setStandSize(e.target.value as ReviewConfig["standSize"])}
                    className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="a5">A5 Table Stand (148 × 210 mm)</option>
                    <option value="a6">A6 Compact (105 × 148 mm)</option>
                    <option value="dl">DL Table Tent (99 × 210 mm)</option>
                  </select>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                className="w-full mt-2"
                onClick={handleSaveSettings}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save Stand Configurations
              </Button>
            </CardContent>
          </Card>

          {/* Quick QR Sharing & Table Tents */}
          <Card variant="glass" className="p-5">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Public Portal Link
            </h3>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-mono truncate flex-1 text-slate-600 dark:text-slate-400">
                {publicReviewUrl || "Generating URL..."}
              </span>
              <Button variant="ghost" size="sm" onClick={handleCopyLink}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Guests who scan this QR will automatically see the 5-star AI generator or private complaint shield.
            </p>
          </Card>
        </div>

        {/* Right Column: Acrylic Stand Realistic Mockup (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Printer className="h-4 w-4 text-emerald-500" />
              Printable Acrylic Stand Preview ({standSize.toUpperCase()})
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewOpen(true)}
                leftIcon={<Maximize2 className="h-3.5 w-3.5" />}
              >
                Fullscreen
              </Button>
              <Button
                variant="glow"
                size="sm"
                onClick={handlePrint}
                leftIcon={<Printer className="h-4 w-4" />}
              >
                Print Stand
              </Button>
            </div>
          </div>

          {/* Stand Mockup Wrapper with Realistic Acrylic Stand Frame */}
          <div className="p-6 sm:p-10 rounded-3xl bg-slate-200/60 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800/80 flex items-center justify-center">
            {/* The Acrylic Stand Physical Card (Also target for print) */}
            <div
              id="printable-acrylic-stand"
              className={`relative w-full max-w-sm rounded-2xl p-6 sm:p-8 text-center transition-all duration-300 shadow-2xl border ${
                standTheme === "dark"
                  ? "bg-slate-950 text-white border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                  : standTheme === "emerald"
                  ? "bg-gradient-to-b from-[#062c22] to-[#041d17] text-white border-emerald-500/40"
                  : standTheme === "gold"
                  ? "bg-gradient-to-b from-[#2b210b] to-[#1a1406] text-amber-50 border-amber-500/40"
                  : "bg-white text-slate-900 border-slate-200 shadow-xl"
              }`}
            >
              {/* Acrylic Stand Clear Glass Border & Standoff Mockups */}
              <div className="absolute top-3 left-3 h-2.5 w-2.5 rounded-full bg-slate-400/40 border border-slate-300 shadow-inner" />
              <div className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-slate-400/40 border border-slate-300 shadow-inner" />
              <div className="absolute bottom-3 left-3 h-2.5 w-2.5 rounded-full bg-slate-400/40 border border-slate-300 shadow-inner" />
              <div className="absolute bottom-3 right-3 h-2.5 w-2.5 rounded-full bg-slate-400/40 border border-slate-300 shadow-inner" />

              {/* Glossy Reflection Sheen */}
              <div className="pointer-events-none absolute -top-12 -left-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

              {/* Stand Header: Restaurant Branding */}
              <div className="space-y-2 mb-5">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg">
                  {restaurantName.charAt(0)}
                </div>
                <h3 className="text-lg font-black tracking-tight">{restaurantName}</h3>
                <div className="flex items-center justify-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
              </div>

              {/* Call To Action */}
              <div className="my-4 space-y-1">
                <h4 className="text-base sm:text-lg font-black leading-snug">
                  {ctaHeading}
                </h4>
                <p className="text-[11px] opacity-75">
                  Takes 15 seconds • AI Review Assistant ✨
                </p>
              </div>

              {/* Scannable High-Res QR Code */}
              <div className="my-5 inline-block p-3.5 rounded-2xl bg-white shadow-xl border border-slate-100">
                <QRCodeImage
                  value={publicReviewUrl || "https://dineflow.app"}
                  size={140}
                  darkColor="#0f172a"
                  lightColor="#ffffff"
                  alt={`${restaurantName} Review QR`}
                />
              </div>

              {/* Step instructions */}
              <div className="space-y-2 mt-4 text-[11px] opacity-90">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/40 border border-white/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Scan with Phone Camera</span>
                </div>
                <p className="text-[10px] opacity-60">
                  Review on Google Maps • DineFlow Smart Experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Feedback & Complaints Shield Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Live Guest Reviews & Complaint Shield
              </h2>
              {shieldedCount > 0 && (
                <Badge variant="danger" size="sm">
                  {shieldedCount} New Complaint{shieldedCount === 1 ? "" : "s"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time feed of guest ratings. Low scores (1–3★) are shielded privately, while 5★ reviews are guided to Google Maps.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex-wrap">
            <button
              onClick={() => setFeedbackTab("all")}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                feedbackTab === "all"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All ({reviewsList.length})
            </button>
            <button
              onClick={() => setFeedbackTab("shielded")}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                feedbackTab === "shielded"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Shielded Complaints ({shieldedCount})
            </button>
            <button
              onClick={() => setFeedbackTab("positive")}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                feedbackTab === "positive"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Google 5★ Conversions ({positiveCount})
            </button>
            <button
              onClick={() => setFeedbackTab("resolved")}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                feedbackTab === "resolved"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Resolved ({resolvedCount})
            </button>
          </div>
        </div>

        {/* Reviews & Complaints Table */}
        <Card variant="glass">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time & Table</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Tags / Issues</TableHead>
                <TableHead className="w-1/3">Guest Review</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    Loading live review records...
                  </TableCell>
                </TableRow>
              ) : filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-36 text-center text-slate-400 p-6">
                    <div className="max-w-md mx-auto space-y-2">
                      <ShieldCheck className="h-9 w-9 text-emerald-500 mx-auto opacity-70" />
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                        No reviews found in this view
                      </p>
                      <p className="text-xs text-slate-400">
                        {reviewsList.length === 0
                          ? "Place your acrylic stand on dining tables or reception. Scans and reviews will appear here live in real-time."
                          : "No records match the current filter selection."}
                      </p>
                      {reviewsList.length === 0 && (
                        <div className="pt-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => window.open(publicReviewUrl, "_blank")}
                            leftIcon={<ExternalLink className="h-3.5 w-3.5" />}
                          >
                            Test Guest Review Link
                          </Button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white text-xs">
                        {item.tableOrRoom || "Dining Area"}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      <div className="font-medium text-xs flex items-center gap-1">
                        <User className="h-3 w-3 text-slate-400" />
                        {item.guestName || "Anonymous Diner"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.guestPhone || item.guestEmail || "No contact info"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className={`inline-flex items-center gap-1 font-bold text-xs ${
                        item.rating >= 4 ? "text-emerald-500" : "text-amber-500"
                      }`}>
                        {item.rating} <Star className={`h-3.5 w-3.5 ${item.rating >= 4 ? "fill-emerald-500" : "fill-amber-500"}`} />
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {item.rating >= 4 && item.vibeTags && item.vibeTags.length > 0
                          ? item.vibeTags.map((v) => (
                              <Badge key={v} variant="success" size="sm">
                                {v}
                              </Badge>
                            ))
                          : item.issueCategories && item.issueCategories.length > 0
                          ? item.issueCategories.map((c) => (
                              <Badge key={c} variant="warning" size="sm">
                                {c}
                              </Badge>
                            ))
                          : (
                            <span className="text-[11px] text-slate-400">General</span>
                          )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {item.comment || "No written remarks."}
                      </p>
                      {item.resolutionNotes && (
                        <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Note: {item.resolutionNotes}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          item.status === "positive" || item.rating >= 4
                            ? "glow"
                            : item.status === "resolved"
                            ? "success"
                            : "danger"
                        }
                        size="sm"
                      >
                        {item.status === "positive" || item.rating >= 4
                          ? "Google 5★"
                          : item.status === "resolved"
                          ? "Resolved"
                          : "New"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.guestPhone && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              window.open(
                                `https://wa.me/${item.guestPhone?.replace(/[^\d]/g, "")}`,
                                "_blank"
                              )
                            }
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedReview(item);
                            setResolutionNotesInput(item.resolutionNotes || "");
                          }}
                        >
                          Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Complaint / Review Resolution Detail Modal */}
      {selectedReview && (
        <Modal
          isOpen={Boolean(selectedReview)}
          onClose={() => setSelectedReview(null)}
          title={`Review Details — ${selectedReview.tableOrRoom || "Dining Area"}`}
          size="md"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                  Rating: {selectedReview.rating} <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                </span>
                <Badge
                  variant={
                    selectedReview.status === "positive" || selectedReview.rating >= 4
                      ? "glow"
                      : selectedReview.status === "resolved"
                      ? "success"
                      : "danger"
                  }
                >
                  {selectedReview.status === "positive" || selectedReview.rating >= 4
                    ? "Google 5★ Conversion"
                    : selectedReview.status === "resolved"
                    ? "Resolved"
                    : "Shielded Complaint"}
                </Badge>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-2 whitespace-pre-wrap">
                &ldquo;{selectedReview.comment}&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Guest Name:</span>
                <p className="font-semibold">{selectedReview.guestName || "Anonymous Diner"}</p>
              </div>
              <div>
                <span className="text-slate-400">Phone / Email:</span>
                <p className="font-semibold">{selectedReview.guestPhone || selectedReview.guestEmail || "Not provided"}</p>
              </div>
            </div>

            {selectedReview.rating <= 3 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 dark:text-white">
                  Manager Resolution Notes:
                </label>
                <textarea
                  value={resolutionNotesInput}
                  onChange={(e) => setResolutionNotesInput(e.target.value)}
                  placeholder="Log actions taken (e.g. called guest, issued voucher, briefed head chef)..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              {selectedReview.rating <= 3 ? (
                <Button
                  variant={selectedReview.status === "resolved" ? "outline" : "primary"}
                  size="sm"
                  onClick={async () => {
                    const newStatus = selectedReview.status === "resolved" ? "new" : "resolved";
                    try {
                      await apiClient.patch(`/reviews/feedback/${selectedReview.id}/status`, {
                        status: newStatus,
                        notes: resolutionNotesInput,
                      });
                      addToast(
                        "success",
                        newStatus === "resolved" ? "Marked as Resolved" : "Reopened Complaint",
                        "Status updated in database."
                      );
                      setSelectedReview(null);
                      fetchTelemetry(false);
                    } catch (err) {
                      addToast("error", "Update Failed", "Could not update status.");
                    }
                  }}
                >
                  {selectedReview.status === "resolved" ? "Reopen Complaint" : "✓ Mark as Resolved"}
                </Button>
              ) : (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  Positive 5★ Review guided to Google Maps
                </div>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedReview(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Stand Fullscreen Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Physical Acrylic Stand Display"
        size="lg"
      >
        <div className="flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl p-8 bg-slate-950 text-white text-center shadow-2xl border border-slate-800 space-y-4">
            <h3 className="text-xl font-bold">{restaurantName}</h3>
            <p className="text-xs opacity-75">{ctaHeading}</p>
            <div className="p-3 bg-white rounded-xl inline-block">
              <QRCodeImage value={publicReviewUrl || "https://dineflow.app"} size={160} />
            </div>
            <p className="text-[11px] opacity-70">Scan with your phone to rate our food & service</p>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <Button variant="glow" onClick={handlePrint} leftIcon={<Printer className="h-4 w-4" />}>
              Print Now
            </Button>
            <Button variant="secondary" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
