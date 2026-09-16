"use client";

import * as React from "react";
import {
  Sparkles,
  RefreshCw,
  Check,
  Download,
  Sun,
  Moon,
  Building,
  Crown,
  Palette,
  Layers,
  CheckCircle2,
  Sliders,
  UtensilsCrossed,
  Coffee,
  Hotel,
  Wine,
  Flame,
  ArrowRight,
  Info,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";

interface GeminiLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoApplied?: (logoDataUri: string) => void;
}

export interface LogoVariation {
  id: "minimal" | "luxury" | "artisan" | "monogram";
  title: string;
  description: string;
  svg: string;
  dataUri: string;
  source: "gemini" | "procedural";
  model?: string;
  palette: {
    primary: string;
    accent: string;
    bg: string;
  };
}

const VIBES = [
  {
    id: "royal_luxury",
    name: "Royal Luxury & Heritage",
    desc: "Regal crests, gold gradients & prestigious 5-star hospitality aura",
    icon: Crown,
  },
  {
    id: "modern_minimalist",
    name: "Modern Minimalist",
    desc: "Sleek geometric lines, contemporary typography & refined negative space",
    icon: Layers,
  },
  {
    id: "artisan_culinary",
    name: "Artisan Culinary & Craft",
    desc: "Warm terracotta & amber, handcrafted gourmet emblem & botanical motifs",
    icon: Palette,
  },
  {
    id: "vibrant_bistro",
    name: "Vibrant Bistro & Lounge",
    desc: "Energetic crimson & rose tones, iconic modern gastropub & lounge seal",
    icon: Building,
  },
];

const COLORS = [
  { id: "emerald", name: "Emerald & Jade", bg: "bg-emerald-500", primary: "#059669", accent: "#34D399" },
  { id: "gold", name: "Royal Gold", bg: "bg-amber-500", primary: "#B45309", accent: "#FBBF24" },
  { id: "sapphire", name: "Sapphire Blue", bg: "bg-blue-500", primary: "#1D4ED8", accent: "#60A5FA" },
  { id: "crimson", name: "Ruby Crimson", bg: "bg-rose-500", primary: "#BE123C", accent: "#FB7185" },
  { id: "amber", name: "Warm Amber", bg: "bg-orange-500", primary: "#C2410C", accent: "#FB923C" },
  { id: "monochrome", name: "Monochrome Slate", bg: "bg-slate-400", primary: "#94A3B8", accent: "#FFFFFF" },
];

const BUSINESS_CATEGORIES = [
  { id: "restaurant", label: "Fine Dining Restaurant", icon: UtensilsCrossed },
  { id: "hotel", label: "Luxury Hotel & Suites", icon: Hotel },
  { id: "cafe", label: "Boutique Cafe & Roastery", icon: Coffee },
  { id: "bar", label: "Cocktail Bar & Lounge", icon: Wine },
  { id: "cloud_kitchen", label: "Cloud Kitchen & Delivery", icon: Flame },
  { id: "resort", label: "Luxury Resort & Spa", icon: Crown },
];

const GENERATION_STATUS_STEPS = [
  "Analyzing brand essence & category identity...",
  "Synthesizing 4 distinct vector design archetypes...",
  "Rendering high-precision SVG paths & letterforms...",
  "Refining color gradients, contrast & negative space...",
];

export function GeminiLogoModal({ isOpen, onClose, onLogoApplied }: GeminiLogoModalProps) {
  const { tenant, updateTenant } = useAuthStore();
  const { addToast } = useToast();

  const [brandName, setBrandName] = React.useState(tenant?.name || "The Grand Bistro");
  const [businessType, setBusinessType] = React.useState(tenant?.type || "restaurant");
  const [selectedVibe, setSelectedVibe] = React.useState("royal_luxury");
  const [selectedColor, setSelectedColor] = React.useState("emerald");
  const [keywords, setKeywords] = React.useState("");

  const [generating, setGenerating] = React.useState(false);
  const [regeneratingId, setRegeneratingId] = React.useState<string | null>(null);
  const [statusStepIdx, setStatusStepIdx] = React.useState(0);
  const [showConfig, setShowConfig] = React.useState(true);

  const [variations, setVariations] = React.useState<LogoVariation[]>([]);
  const [selectedVariationId, setSelectedVariationId] = React.useState<string>("minimal");
  const [previewMode, setPreviewMode] = React.useState<"dark" | "light">("dark");

  React.useEffect(() => {
    if (tenant?.name && !brandName) {
      setBrandName(tenant.name);
    }
    if (tenant?.type && !businessType) {
      setBusinessType(tenant.type);
    }
  }, [tenant]);

  // Status message rotation during generation
  React.useEffect(() => {
    if (!generating) return;
    const interval = setInterval(() => {
      setStatusStepIdx((prev) => (prev + 1) % GENERATION_STATUS_STEPS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [generating]);

  // Generate All 4 Variations Concurrently
  const handleGenerateAll = async () => {
    if (!brandName.trim()) {
      addToast("error", "Brand Name Required", "Please provide a name for your business.");
      return;
    }

    setGenerating(true);
    setStatusStepIdx(0);

    try {
      const res = await fetch("/api/ai/generate-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: brandName.trim(),
          businessType,
          vibe: selectedVibe,
          primaryColor: selectedColor,
          keywords: keywords.trim(),
          mode: "all",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.variations) && data.variations.length > 0) {
          setVariations(data.variations);
          setSelectedVariationId(data.variations[0].id);
          setShowConfig(false); // collapse config to focus on logo cards

          const isRealAi = data.variations.some((v: LogoVariation) => v.source === "gemini");
          addToast(
            "success",
            "4 AI Logo Variations Generated!",
            isRealAi
              ? "Bespoke vector logos crafted in real time by Google Gemini AI."
              : "Bespoke vector brand identities generated."
          );
        } else {
          throw new Error("No logo variations returned");
        }
      } else {
        throw new Error("Generation request failed");
      }
    } catch (e: any) {
      console.error("AI Logo generation failed:", e);
      addToast("error", "Generation Failed", "Could not generate logos. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // 1-Click Regenerate a Single Variation
  const handleRegenerateSingle = async (archetypeId: "minimal" | "luxury" | "artisan" | "monogram", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRegeneratingId(archetypeId);

    try {
      const res = await fetch("/api/ai/generate-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: brandName.trim(),
          businessType,
          vibe: selectedVibe,
          primaryColor: selectedColor,
          keywords: keywords.trim(),
          mode: "single",
          archetype: archetypeId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newVariation: LogoVariation = data.variations?.[0];
        if (newVariation) {
          setVariations((prev) =>
            prev.map((v) => (v.id === archetypeId ? newVariation : v))
          );
          setSelectedVariationId(archetypeId);
          addToast("success", "Variation Refreshed", `Updated ${newVariation.title} with a fresh vector design.`);
        }
      }
    } catch (err) {
      console.warn("Single variation regeneration error:", err);
      addToast("error", "Regeneration Failed", "Could not refresh this specific style. Please try again.");
    } finally {
      setRegeneratingId(null);
    }
  };

  const selectedLogo = variations.find((v) => v.id === selectedVariationId) || variations[0];

  // Apply Selected Logo as Workspace Logo
  const handleApplyLogo = async () => {
    if (!selectedLogo) return;

    // 1. Update local Zustand auth store immediately for 0ms feedback
    updateTenant({ logoUrl: selectedLogo.dataUri, logo: selectedLogo.dataUri });

    // 2. Persist to MongoDB backend
    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL ||
        (process.env.NODE_ENV === "production"
          ? "https://api-production-f170.up.railway.app/api/v1"
          : "http://localhost:8080/api/v1");

      const token = useAuthStore.getState().accessToken;
      if (token) {
        await fetch(`${apiBase}/tenant/logo`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ logoUrl: selectedLogo.dataUri }),
        });
      }
    } catch (e) {
      console.warn("Backend logo sync warning:", e);
    }

    // 3. Cache metadata in localStorage
    try {
      if (typeof window !== "undefined") {
        const tenantId = tenant?.id || "default";
        localStorage.setItem(
          `dineflow_logo_meta_${tenantId}`,
          JSON.stringify({
            tenantId,
            logoUrl: selectedLogo.dataUri,
            archetype: selectedLogo.id,
            title: selectedLogo.title,
            timestamp: new Date().toISOString(),
            brandName,
          })
        );
        window.dispatchEvent(new CustomEvent("dineflow_logo_updated", { detail: selectedLogo.dataUri }));
      }
    } catch (_) {}

    if (onLogoApplied) {
      onLogoApplied(selectedLogo.dataUri);
    }

    addToast(
      "success",
      "Brand Logo Applied!",
      `"${selectedLogo.title}" is now active across your topbar, sidebar, and digital guest menus.`
    );
    onClose();
  };

  // Download SVG
  const handleDownloadSvg = (targetSvg?: string) => {
    const svgToDownload = targetSvg || selectedLogo?.svg;
    if (!svgToDownload) return;

    const blob = new Blob([svgToDownload], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${brandName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${selectedLogo?.id || "brand"}-logo.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast("info", "SVG Downloaded", "Vector SVG saved to your downloads.");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gemini AI Brand Logo Studio"
      description="Generate 4 unique, production-grade vector brand identities tailored to your hospitality business."
      size="xl"
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Collapsible Configuration Panel */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Brand Attributes & Design Directives
              </span>
            </div>
            {variations.length > 0 && (
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {showConfig ? "Hide Controls" : "Edit Attributes"}
              </button>
            )}
          </div>

          {showConfig && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              {/* Row 1: Brand Name & Business Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Brand / Establishment Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Café Aroma, The Grand Palace"
                    className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors shadow-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Hospitality Category
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors shadow-xs cursor-pointer"
                  >
                    {BUSINESS_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Brand Vibe / Personality */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Brand Persona & Vibe
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {VIBES.map((v) => {
                    const isSelected = selectedVibe === v.id;
                    const Icon = v.icon;
                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVibe(v.id)}
                        className={cn(
                          "p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 text-left",
                          isSelected
                            ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500 shadow-xs"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950/60"
                        )}
                      >
                        <div
                          className={cn(
                            "p-1.5 rounded-lg shrink-0 transition-colors",
                            isSelected
                              ? "bg-emerald-500 text-white dark:text-slate-950"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{v.name}</p>
                            {isSelected && <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 leading-tight">
                            {v.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Color Palette & Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Primary Accent Color
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedColor(c.id)}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer",
                          selectedColor === c.id
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500 font-bold"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        )}
                      >
                        <span className={cn("h-2.5 w-2.5 rounded-full", c.bg)} />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Signature Keywords (Optional)
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g. woodfired, heritage, rooftop, organic"
                    className="w-full h-9 px-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-xs"
                  />
                </div>
              </div>

              {/* Generate All Trigger */}
              <div className="pt-2">
                <Button
                  variant="glow"
                  size="md"
                  className="w-full flex items-center justify-center gap-2 font-bold"
                  onClick={handleGenerateAll}
                  disabled={generating || !brandName.trim()}
                >
                  {generating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                      <span>Generating 4 Bespoke Vector Logos...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                      <span>{variations.length > 0 ? "Regenerate 4 New Variations" : "Generate 4 AI Logo Variations"}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── STATE 1: GENERATING SHIMMER SKELETONS ── */}
        {generating && (
          <div className="space-y-3.5 py-4 animate-in fade-in duration-300">
            {/* Active AI Status Progress Indicator */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <RefreshCw className="h-4 w-4 text-emerald-500 animate-spin shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Google Gemini 3.6 Flash Vector Engine Active
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {GENERATION_STATUS_STEPS[statusStepIdx]}
                  </p>
                </div>
              </div>
              <Badge variant="glow" size="sm" className="font-mono text-[10px]">
                Real-Time AI
              </Badge>
            </div>

            {/* 4 Shimmering Skeleton Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                "Option A: Modern Minimalist",
                "Option B: Royal Luxury & Heritage",
                "Option C: Artisan Craft & Culinary",
                "Option D: Bold Monogram & Badge",
              ].map((label, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 relative overflow-hidden shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">{label}</span>
                    <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  </div>
                  {/* Canvas Skeleton with Shimmer */}
                  <div className="h-44 w-full rounded-xl bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden border border-slate-200/80 dark:border-slate-800/80">
                    <div className="h-20 w-20 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-800 mt-3 animate-pulse" />
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STATE 2: 4 MULTI-VARIATION LOGO CARDS DISPLAY ── */}
        {!generating && variations.length > 0 && (
          <div className="space-y-4 pt-1 animate-in fade-in duration-300">
            {/* Header Control Bar: Canvas Preview & Global Actions */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Choose Your Preferred Brand Logo
                </span>
                <span className="text-[11px] text-slate-500">
                  ({variations.length} Bespoke Concepts)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Canvas Light / Dark Toggle */}
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("dark")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold transition-all cursor-pointer",
                      previewMode === "dark"
                        ? "bg-slate-950 text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    )}
                  >
                    <Moon className="h-3 w-3" />
                    <span>Dark Canvas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("light")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold transition-all cursor-pointer",
                      previewMode === "light"
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    )}
                  >
                    <Sun className="h-3 w-3 text-amber-500" />
                    <span>Light Canvas</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4-Card Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {variations.map((v, idx) => {
                const isSelected = selectedVariationId === v.id;
                const isRegeneratingThis = regeneratingId === v.id;

                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVariationId(v.id)}
                    className={cn(
                      "p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden",
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/10"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md"
                    )}
                  >
                    {/* Top Row: Option Title & Badge */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={cn(
                            "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                            isSelected
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          )}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {v.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isSelected ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                            <Check className="h-3 w-3" />
                            <span>Selected</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-medium">
                            Tap to Select
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Logo SVG Canvas Display */}
                    <div
                      className={cn(
                        "w-full h-44 rounded-xl flex items-center justify-center p-3 border transition-colors relative overflow-hidden",
                        previewMode === "dark"
                          ? "bg-[#0A0F1D] border-slate-800/90 shadow-inner"
                          : "bg-slate-100 border-slate-200"
                      )}
                    >
                      {isRegeneratingThis ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="h-6 w-6 text-emerald-500 animate-spin" />
                          <span className="text-[11px] font-medium text-slate-400">
                            Crafting new {v.title}...
                          </span>
                        </div>
                      ) : (
                        <div
                          className="h-36 w-36 flex items-center justify-center transition-transform group-hover:scale-105 duration-300"
                          dangerouslySetInnerHTML={{ __html: v.svg }}
                        />
                      )}
                    </div>

                    {/* Bottom Metadata & 1-Click Single Refresh Button */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] line-clamp-1 pr-2">
                        {v.description}
                      </p>

                      <button
                        type="button"
                        disabled={isRegeneratingThis || generating}
                        onClick={(e) => handleRegenerateSingle(v.id, e)}
                        title="Regenerate this specific style"
                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-500/15 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        <RefreshCw className={cn("h-3 w-3", isRegeneratingThis && "animate-spin")} />
                        <span>Regenerate</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Final Action Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadSvg()}
                  leftIcon={<Download className="h-3.5 w-3.5" />}
                  className="flex-1 sm:flex-initial text-xs"
                >
                  Download SVG
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="flex-1 sm:flex-initial text-xs"
                >
                  Cancel
                </Button>
              </div>

              <Button
                type="button"
                variant="glow"
                size="md"
                onClick={handleApplyLogo}
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
                className="w-full sm:w-auto font-bold min-w-[200px]"
              >
                Apply "{selectedLogo?.title || "Option"}" Logo
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

