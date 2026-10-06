"use client";

import * as React from "react";
import {
  Star,
  QrCode,
  ShieldCheck,
  TrendingUp,
  Printer,
  ExternalLink,
  Save,
  MessageSquare,
  Sparkles,
  Maximize2,
  Copy,
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
import { useReviewStore, ReviewFeedback, ReviewConfig } from "@/lib/reviews/review-store";

export default function ReviewsManagementPage() {
  const { addToast } = useToast();
  const { tenant } = useAuthStore();
  const tenantSlug = tenant?.slug || "the-grand-bistro";
  const restaurantName = tenant?.name || "The Grand Bistro";

  const {
    getConfig,
    updateConfig,
    feedbacks,
    updateFeedbackStatus,
  } = useReviewStore();

  const config = getConfig(tenantSlug);

  // Studio customization state
  const [placeIdInput, setPlaceIdInput] = React.useState(config.googlePlaceId || "");
  const [reviewUrlInput, setReviewUrlInput] = React.useState(config.googleReviewUrl || "");
  const [ctaHeading, setCtaHeading] = React.useState(config.standCallToAction || "Loved your meal? Scan to rate us!");
  const [standTheme, setStandTheme] = React.useState<ReviewConfig["standTheme"]>(config.standTheme || "dark");
  const [standSize, setStandSize] = React.useState<ReviewConfig["standSize"]>(config.standSize || "a5");

  // Feedback Table filter
  const [feedbackTab, setFeedbackTab] = React.useState<"all" | "new" | "resolved">("all");
  const [selectedComplaint, setSelectedComplaint] = React.useState<ReviewFeedback | null>(null);
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

  // Filter complaints
  const tenantComplaints = feedbacks.filter((f) => f.tenantSlug === tenantSlug || !f.tenantSlug);
  const filteredComplaints = tenantComplaints.filter((item) => {
    if (feedbackTab === "new") return item.status === "new" || item.status === "in_review";
    if (feedbackTab === "resolved") return item.status === "resolved";
    return true;
  });

  const newComplaintsCount = tenantComplaints.filter((f) => f.status === "new").length;

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
            Amplify 5-star Google Maps reviews via AI-assisted guest suggestions while filtering 1–3 star dissatisfaction into your private manager shield.
          </p>
        </div>

        <div className="flex items-center gap-2">
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

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="glass" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total QR Scans</span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <QrCode className="h-4 w-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {config.totalScans}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+24% vs last week</span>
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
            {config.fiveStarCount}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <span>89.2% Google conversion rate</span>
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
            {config.shieldedCount}
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
            4.88 <span className="text-base text-amber-500">★</span>
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <span>Based on 320 customer interactions</span>
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
                    className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
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
                    className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
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

      {/* Private Complaints Shield Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Private Feedback & Complaint Shield
              </h2>
              {newComplaintsCount > 0 && (
                <Badge variant="danger" size="sm">
                  {newComplaintsCount} New
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Low-score feedback (1–3 stars) submitted by guests before reaching Google Maps.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setFeedbackTab("all")}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                feedbackTab === "all"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All ({tenantComplaints.length})
            </button>
            <button
              onClick={() => setFeedbackTab("new")}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                feedbackTab === "new"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              New & In-Review ({newComplaintsCount})
            </button>
            <button
              onClick={() => setFeedbackTab("resolved")}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                feedbackTab === "resolved"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Resolved ({tenantComplaints.length - newComplaintsCount})
            </button>
          </div>
        </div>

        {/* Complaints Table */}
        <Card variant="glass">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time & Table</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Flagged Issues</TableHead>
                <TableHead className="w-1/3">Guest Feedback</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComplaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                    <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                    No private complaints found in this view.
                  </TableCell>
                </TableRow>
              ) : (
                filteredComplaints.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white text-xs">
                        {item.tableOrRoom || "Dining Area"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      <div className="font-medium text-xs">{item.guestName || "Anonymous"}</div>
                      <div className="text-[11px] text-slate-400">{item.guestPhone || "No phone"}</div>
                    </TableCell>

                    <TableCell>
                      <div className="inline-flex items-center gap-1 font-bold text-amber-500 text-xs">
                        {item.rating} <Star className="h-3.5 w-3.5 fill-amber-500" />
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {item.categories.map((c) => (
                          <Badge key={c} variant="warning" size="sm">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {item.comment}
                      </p>
                      {item.resolutionNotes && (
                        <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Note: {item.resolutionNotes}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={item.status === "resolved" ? "success" : "danger"}
                        size="sm"
                      >
                        {item.status === "resolved" ? "Resolved" : "New"}
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
                            setSelectedComplaint(item);
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

      {/* Complaint Resolution Detail Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={Boolean(selectedComplaint)}
          onClose={() => setSelectedComplaint(null)}
          title={`Complaint Details — ${selectedComplaint.tableOrRoom || "Guest Feedback"}`}
          size="md"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">
                  Rating: {selectedComplaint.rating} ★
                </span>
                <Badge
                  variant={selectedComplaint.status === "resolved" ? "success" : "danger"}
                >
                  {selectedComplaint.status === "resolved" ? "Resolved" : "New"}
                </Badge>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-2">
                &ldquo;{selectedComplaint.comment}&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Guest Name:</span>
                <p className="font-semibold">{selectedComplaint.guestName || "Anonymous"}</p>
              </div>
              <div>
                <span className="text-slate-400">Phone Number:</span>
                <p className="font-semibold">{selectedComplaint.guestPhone || "Not provided"}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-white">
                Manager Resolution Notes:
              </label>
              <textarea
                value={resolutionNotesInput}
                onChange={(e) => setResolutionNotesInput(e.target.value)}
                placeholder="Log manager actions taken (e.g. called guest, sent dessert voucher, briefed head chef)..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant={selectedComplaint.status === "resolved" ? "outline" : "primary"}
                size="sm"
                onClick={() => {
                  const newStatus = selectedComplaint.status === "resolved" ? "new" : "resolved";
                  updateFeedbackStatus(selectedComplaint.id, newStatus, resolutionNotesInput);
                  setSelectedComplaint(null);
                  addToast(
                    "success",
                    newStatus === "resolved" ? "Marked as Resolved" : "Reopened Complaint",
                    "Status updated in manager dashboard."
                  );
                }}
              >
                {selectedComplaint.status === "resolved" ? "Reopen Complaint" : "✓ Mark as Resolved"}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedComplaint(null)}
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
