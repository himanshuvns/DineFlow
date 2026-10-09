"use client";

import * as React from "react";
import { useParams, useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import {
  Star,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Send,
  ThumbsUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useToast } from "@/components/ui/toast";
import {
  useReviewStore,
  DEFAULT_VIBES,
  SHIELD_CATEGORIES,
  generateAIReviewOptions,
} from "@/lib/reviews/review-store";
import { useTenantDataStore } from "@/lib/stores/tenant-data-store";
import { getBaseURL } from "@/lib/api";

function ReviewContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const tenantSlug = (params?.tenantSlug as string) || "the-grand-bistro";
  const tableParam = searchParams.get("table") || searchParams.get("t");
  const roomParam = searchParams.get("room") || searchParams.get("r");
  const guestParam = searchParams.get("guest") || searchParams.get("name");

  const locationContext = tableParam
    ? `Table ${tableParam.toUpperCase()}`
    : roomParam
    ? `Room ${roomParam.toUpperCase()}`
    : null;

  const { tenantName: storeTenantName } = useTenantDataStore();
  const { getConfig, addFeedback, recordScan, recordFiveStar } = useReviewStore();

  const config = getConfig(tenantSlug);
  const fallbackRestaurantName =
    storeTenantName ||
    tenantSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const [dynamicRestaurantName, setDynamicRestaurantName] = React.useState<string>(fallbackRestaurantName);
  const [dynamicGoogleUrl, setDynamicGoogleUrl] = React.useState<string>(config.googleReviewUrl || "");

  // Track QR scan on first render via public backend API and local store
  React.useEffect(() => {
    recordScan(tenantSlug);

    const fetchPublicMeta = async () => {
      try {
        const base = getBaseURL();
        const res = await fetch(`${base}/reviews/public/${tenantSlug}`);
        if (res.ok) {
          const json = await res.json();
          const meta = json.data || json;
          if (meta.restaurantName) setDynamicRestaurantName(meta.restaurantName);
          if (meta.googlePlaceReviewURL) setDynamicGoogleUrl(meta.googlePlaceReviewURL);
        }
      } catch (err) {
        console.warn("Could not load public review meta:", err);
      }
    };
    fetchPublicMeta();
  }, [tenantSlug, recordScan]);

  const restaurantName = dynamicRestaurantName || fallbackRestaurantName;

  // Rating State
  const [selectedRating, setSelectedRating] = React.useState<number>(5);
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  // 4-5 Star state
  const [selectedVibes, setSelectedVibes] = React.useState<string[]>([
    "Delicious Food 🍕",
    "Fast Service ⚡",
    "Great Ambience ✨",
  ]);
  const [aiOptions, setAiOptions] = React.useState<Array<{ badge: string; tone: string; text: string }>>([]);
  const [selectedAiIndex, setSelectedAiIndex] = React.useState<number>(0);
  const [reviewText, setReviewText] = React.useState<string>("");
  const [isGeneratingAi, setIsGeneratingAi] = React.useState<boolean>(false);
  const [hasCopied, setHasCopied] = React.useState<boolean>(false);

  // 1-3 Star (Private Shield) state
  const [selectedIssues, setSelectedIssues] = React.useState<string[]>([]);
  const [complaintText, setComplaintText] = React.useState<string>("");
  const [guestName, setGuestName] = React.useState<string>(guestParam || "");
  const [guestPhone, setGuestPhone] = React.useState<string>("");
  const [isSubmittingShield, setIsSubmittingShield] = React.useState<boolean>(false);
  const [shieldSubmitted, setShieldSubmitted] = React.useState<boolean>(false);

  // Initialize default review text on mount or rating change
  React.useEffect(() => {
    if (selectedRating >= 4) {
      const generated = generateAIReviewOptions(restaurantName, selectedVibes);
      setAiOptions(generated);
      setReviewText(generated[0]?.text || "");
      setSelectedAiIndex(0);
    }
  }, [restaurantName]);

  // Handle rating click
  const handleRatingClick = (r: number) => {
    setSelectedRating(r);
    if (r >= 4) {
      const generated = generateAIReviewOptions(restaurantName, selectedVibes);
      setAiOptions(generated);
      setReviewText(generated[0]?.text || "");
      setSelectedAiIndex(0);
    }
  };

  // Toggle Vibe Chips
  const toggleVibe = (vibe: string) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  // AI Review Generator
  const handleGenerateAI = async () => {
    setIsGeneratingAi(true);
    try {
      const base = getBaseURL();
      const res = await fetch(`${base}/reviews/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: selectedRating,
          restaurantName,
          tags: selectedVibes,
          language: "en",
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const suggestions = json.data?.suggestions || json.suggestions;
        if (Array.isArray(suggestions) && suggestions.length > 0) {
          const badges = ["Foodie Favorite", "Punchy & Direct", "Warm & Heartfelt"];
          const tones = ["Sensory & Passionate", "Crisp & High Impact", "Memorable Experience"];
          const mapped = suggestions.slice(0, 3).map((text: string, i: number) => ({
            badge: badges[i] || "AI Draft",
            tone: tones[i] || "Authentic",
            text,
          }));
          setAiOptions(mapped);
          setReviewText(mapped[0]?.text || "");
          setSelectedAiIndex(0);
          setIsGeneratingAi(false);
          addToast("success", "Reviews Generated", "Authentic review styles crafted by AI.");
          return;
        }
      }
    } catch {}

    const generated = generateAIReviewOptions(restaurantName, selectedVibes);
    setAiOptions(generated);
    setReviewText(generated[0]?.text || "");
    setSelectedAiIndex(0);
    setIsGeneratingAi(false);
    addToast("success", "Reviews Generated", "3 authentic review styles crafted by AI.");
  };

  // Select AI Option card
  const handleSelectAiOption = (index: number) => {
    setSelectedAiIndex(index);
    if (aiOptions[index]) {
      setReviewText(aiOptions[index].text);
    }
  };

  // 4-5 Stars: Copy & Open Google Maps
  const handleCopyAndOpenGoogle = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(reviewText);
      }
      setHasCopied(true);
      recordFiveStar(tenantSlug);

      // Post 4-5 star review to backend API dynamically so owner/manager sees it live
      try {
        const base = getBaseURL();
        await fetch(`${base}/reviews/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantSlug,
            rating: selectedRating,
            vibeTags: selectedVibes,
            comment: reviewText,
            guestName: guestParam || undefined,
            tableOrRoom: locationContext || undefined,
            status: "positive",
          }),
        });
      } catch (err) {
        console.warn("Could not post positive review to backend:", err);
      }

      // Trigger Confetti Celebration
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#f59e0b", "#6366f1", "#ec4899"],
      });

      addToast("success", "Copied to Clipboard! 🎉", "Paste into Google Maps to post your review.");

      // Open Google Review Link in new tab
      setTimeout(() => {
        const url = dynamicGoogleUrl || config.googleReviewUrl || `https://search.google.com/local/writereview?placeid=${config.googlePlaceId}`;
        window.open(url, "_blank", "noopener,noreferrer");
      }, 700);
    } catch {
      const url = dynamicGoogleUrl || config.googleReviewUrl;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // 1-3 Stars: Toggle issue category
  const toggleIssue = (issue: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue]
    );
  };

  // 1-3 Stars: Submit Private Feedback directly to management
  const handleSubmitShield = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) {
      addToast("error", "Comment required", "Please share a few details so we can resolve this.");
      return;
    }

    setIsSubmittingShield(true);
    try {
      // 1. Send via Go REST API backend
      const base = getBaseURL();
      await fetch(`${base}/reviews/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug,
          rating: selectedRating,
          issueCategories: selectedIssues,
          comment: complaintText,
          guestName: guestName || undefined,
          guestPhone: guestPhone || undefined,
          tableOrRoom: locationContext || undefined,
          status: "new",
        }),
      });

      // 2. Also record in local store for instantaneous fallback visibility
      addFeedback({
        tenantSlug,
        rating: selectedRating,
        categories: selectedIssues.length > 0 ? selectedIssues : ["General Feedback"],
        comment: complaintText,
        guestName: guestName || undefined,
        guestPhone: guestPhone || undefined,
        tableOrRoom: locationContext || undefined,
      });

      setShieldSubmitted(true);
      addToast("info", "Feedback Sent to Management", "Our General Manager has been notified directly.");
    } catch {
      setShieldSubmitted(true);
    } finally {
      setIsSubmittingShield(false);
    }
  };

  const activeRating = hoverRating ?? selectedRating;

  const ratingDescriptions: Record<number, string> = {
    1: "Terrible 😞",
    2: "Disappointing 😕",
    3: "Average 😐",
    4: "Very Good! 😊",
    5: "Outstanding Experience! 🌟",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/60 to-white dark:from-[#090D16] dark:via-[#0F172A] dark:to-[#070A12] text-slate-900 dark:text-slate-100 flex flex-col justify-between p-3 sm:p-5 selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="max-w-xl mx-auto w-full flex items-center justify-between py-2 sm:py-3 px-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-sm flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            {restaurantName.charAt(0)}
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate leading-tight">
              {restaurantName}
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Google Maps Verified</span>
              {locationContext && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {locationContext}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto w-full my-auto py-4 sm:py-6 space-y-5">
        {/* Rating Hero Card */}
        <Card variant="glass" className="border-slate-200/80 dark:border-slate-800/80 shadow-lg text-center p-5 sm:p-7">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              How was your experience today?
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Rate your visit
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Tap a star to share quick feedback. Takes only 15 seconds.
            </p>
          </div>

          {/* Interactive 5-Star Selector */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 my-5 sm:my-6">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= activeRating;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="group p-1.5 sm:p-2 rounded-2xl transition-all duration-150 transform hover:scale-115 active:scale-95 focus:outline-hidden cursor-pointer"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`h-9 w-9 sm:h-11 sm:w-11 transition-all duration-200 ${
                      isFilled
                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                        : "text-slate-300 dark:text-slate-700 hover:text-amber-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Reaction Label */}
          <div className="inline-block px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-200">
            {ratingDescriptions[activeRating]}
          </div>
        </Card>

        {/* 4 or 5 Stars Flow */}
        {selectedRating >= 4 && (
          <div className="space-y-5 animate-in fade-in-50 slide-in-from-bottom-3 duration-300">
            {/* Vibe Chips Section */}
            <Card variant="glass" className="p-4 sm:p-5 border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />
                  What did you love most?
                </span>
                <span className="text-[11px] text-slate-400">Select any</span>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {DEFAULT_VIBES.map((vibe) => {
                  const isSelected = selectedVibes.includes(vibe);
                  return (
                    <button
                      key={vibe}
                      type="button"
                      onClick={() => toggleVibe(vibe)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border cursor-pointer ${
                        isSelected
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs"
                          : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      {vibe}
                    </button>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full mt-2"
                onClick={handleGenerateAI}
                isLoading={isGeneratingAi}
                leftIcon={<Sparkles className="h-3.5 w-3.5 text-amber-500" />}
              >
                ✨ Refresh Suggestions with AI
              </Button>
            </Card>

            {/* AI Review Cards */}
            {aiOptions.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Select a generated review draft:
                  </span>
                  <span className="text-[11px] text-slate-400">Tap to edit</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {aiOptions.map((opt, idx) => {
                    const isSelected = selectedAiIndex === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectAiOption(idx)}
                        className={`p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer text-left ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500/50 shadow-sm ring-1 ring-emerald-500/30"
                            : "bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            {opt.badge}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {opt.tone}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3">
                          {opt.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Editable Textarea */}
            <Card variant="glass" className="p-4 sm:p-5 border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-white">
                  Refine or personalize your review:
                </label>
                <span className="text-[11px] text-slate-400">
                  {reviewText.length} characters
                </span>
              </div>

              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                className="w-full text-xs sm:text-sm p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none leading-relaxed"
                placeholder="Write or edit your review before copying..."
              />

              <div className="pt-2">
                <Button
                  type="button"
                  variant="glow"
                  size="lg"
                  className="w-full font-bold shadow-lg"
                  onClick={handleCopyAndOpenGoogle}
                  leftIcon={
                    hasCopied ? (
                      <Check className="h-4 w-4 text-emerald-950" />
                    ) : (
                      <Copy className="h-4 w-4 text-emerald-950" />
                    )
                  }
                  rightIcon={<ExternalLink className="h-4 w-4 text-emerald-950" />}
                >
                  {hasCopied ? "Copied! Opening Google Maps..." : "📋 Copy & Open Google Maps"}
                </Button>

                <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 mt-2.5">
                  Tapping copies your draft and opens Google Maps review dialogue directly.
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* 1 to 3 Stars Flow: Private Manager Shield */}
        {selectedRating <= 3 && (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-3 duration-300">
            {!shieldSubmitted ? (
              <Card variant="glass" className="p-5 sm:p-6 border-amber-300/60 dark:border-amber-500/30 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/30 dark:from-[#16120b] dark:via-[#0f172a] dark:to-[#120e09]">
                <form onSubmit={handleSubmitShield} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        We are so sorry we didn&apos;t meet your expectations.
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        Your feedback goes <strong>directly to our General Management team</strong> so we can investigate and make this right for you immediately.
                      </p>
                    </div>
                  </div>

                  {/* Issue Category Badges */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      What went wrong today?
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {SHIELD_CATEGORIES.map((cat) => {
                        const isChecked = selectedIssues.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleIssue(cat)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 border cursor-pointer ${
                              isChecked
                                ? "bg-amber-500/20 border-amber-500/50 text-amber-800 dark:text-amber-300 font-semibold"
                                : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Feedback Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Please tell us what happened: <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      value={complaintText}
                      onChange={(e) => setComplaintText(e.target.value)}
                      rows={3}
                      className="w-full text-xs sm:text-sm p-3 rounded-xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none leading-relaxed"
                      placeholder="Dish taste, delay time, staff interactions, or anything else..."
                    />
                  </div>

                  {/* Optional Contact Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Your Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="e.g. Rohit"
                        className="w-full text-xs p-2.5 rounded-lg bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Phone / WhatsApp (Optional)
                      </label>
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+91..."
                        className="w-full text-xs p-2.5 rounded-lg bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 mt-1"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold"
                    isLoading={isSubmittingShield}
                    leftIcon={<Send className="h-4 w-4" />}
                  >
                    Send to Management Directly
                  </Button>
                </form>

                {/* Google Compliance Secondary Link */}
                <div className="text-center pt-4 border-t border-slate-200/80 dark:border-slate-800/80 mt-4">
                  <a
                    href={config.googleReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline underline-offset-2"
                  >
                    Still want to leave a public review on Google Maps?
                  </a>
                </div>
              </Card>
            ) : (
              /* Shield Confirmation View */
              <Card variant="glass" className="p-6 sm:p-8 border-emerald-500/30 text-center space-y-4">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Thank you for helping us improve
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Your remarks have been securely routed to our management console. If you left a phone number, our General Manager will personally follow up with you.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShieldSubmitted(false);
                      setSelectedRating(5);
                    }}
                  >
                    Done
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-xl mx-auto w-full text-center py-3 text-[11px] text-slate-400 dark:text-slate-500">
        Powered by DineFlow Smart Hospitality Experience
      </footer>
    </div>
  );
}

export default function GuestReviewPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        </div>
      }
    >
      <ReviewContent />
    </React.Suspense>
  );
}
