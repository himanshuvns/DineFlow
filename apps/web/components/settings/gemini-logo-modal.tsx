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
  Pizza,
  FileText,
  QrCode,
  Smartphone,
  ImageIcon,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
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
  id: string;
  title: string;
  description: string;
  svg: string;
  dataUri: string;
  source: "gemini" | "procedural";
  model?: string;
  palette: {
    primary: string;
    accent: string;
    secondary: string;
    bg: string;
  };
}

const CUISINES = [
  { id: "pizza", label: "Pizzeria & Italian", icon: Pizza, defaultType: "restaurant" },
  { id: "cafe", label: "Cafe & Roastery", icon: Coffee, defaultType: "cafe" },
  { id: "burger", label: "Burgers & Grill", icon: Flame, defaultType: "restaurant" },
  { id: "fine_dining", label: "Fine Dining & Bistro", icon: UtensilsCrossed, defaultType: "restaurant" },
  { id: "curry", label: "Indian Curry & Tandoor", icon: Flame, defaultType: "restaurant" },
  { id: "bar", label: "Cocktail Bar & Lounge", icon: Wine, defaultType: "bar" },
  { id: "hotel", label: "Luxury Hotel & Resort", icon: Hotel, defaultType: "hotel" },
];

const VIBES = [
  {
    id: "culinary_excellence",
    name: "Culinary Heritage & Craft",
    desc: "Authentic food motifs, rich multi-color gradients & artisanal badge stamps",
    icon: Palette,
  },
  {
    id: "royal_luxury",
    name: "Royal Luxury & 5-Star",
    desc: "Opulent gold crests, heraldic laurel shields & prestigious hospitality aura",
    icon: Crown,
  },
  {
    id: "vibrant_gastropub",
    name: "Vibrant Bistro & Gastropub",
    desc: "Glowing neon badges, contemporary styling & energetic hospitality identity",
    icon: Building,
  },
  {
    id: "modern_minimalist",
    name: "Modern Minimalist",
    desc: "Sleek geometric lines, refined negative space & contemporary typography",
    icon: Layers,
  },
];

const COLORS = [
  { id: "crimson", name: "Tuscan Flame", bg: "bg-red-500", primary: "#DC2626", accent: "#F97316" },
  { id: "amber", name: "Artisan Roast", bg: "bg-amber-600", primary: "#C2410C", accent: "#F59E0B" },
  { id: "emerald", name: "Fresh Botanical", bg: "bg-emerald-500", primary: "#059669", accent: "#34D399" },
  { id: "gold", name: "Royal Gold", bg: "bg-amber-500", primary: "#B45309", accent: "#FBBF24" },
  { id: "neon", name: "Neon Gastropub", bg: "bg-purple-500", primary: "#8B5CF6", accent: "#EC4899" },
  { id: "sapphire", name: "Ocean Coastal", bg: "bg-blue-500", primary: "#1D4ED8", accent: "#38BDF8" },
];

const GENERATION_STATUS_STEPS = [
  "Gemini Brand Architect analyzing establishment concept & cuisine...",
  "Synthesizing authentic culinary food emblems & multi-stop gradients...",
  "Rendering 4 bespoke brand archetypes (Emblems, Badges, Stamps, Neon)...",
  "Refining vector typography, curved banners & high-resolution lighting...",
];

export function GeminiLogoModal({ isOpen, onClose, onLogoApplied }: GeminiLogoModalProps) {
  const { tenant, updateTenant } = useAuthStore();
  const { addToast } = useToast();

  const [brandName, setBrandName] = React.useState(tenant?.name || "The Grand Bistro");
  const [selectedCuisine, setSelectedCuisine] = React.useState("fine_dining");
  const [selectedVibe, setSelectedVibe] = React.useState("culinary_excellence");
  const [selectedColor, setSelectedColor] = React.useState("gold");
  const [keywords, setKeywords] = React.useState("");

  const [generating, setGenerating] = React.useState(false);
  const [regeneratingId, setRegeneratingId] = React.useState<string | null>(null);
  const [statusStepIdx, setStatusStepIdx] = React.useState(0);
  const [showConfig, setShowConfig] = React.useState(true);

  const [variations, setVariations] = React.useState<LogoVariation[]>([]);
  const [selectedVariationId, setSelectedVariationId] = React.useState<string>("culinary_emblem");
  const [canvasTheme, setCanvasTheme] = React.useState<"dark" | "light">("dark");
  const [activeMockup, setActiveMockup] = React.useState<"canvas" | "menu" | "stand" | "mobile">("canvas");

  // Sync tenant name
  React.useEffect(() => {
    if (tenant?.name && !brandName) {
      setBrandName(tenant.name);
    }
  }, [tenant]);

  // Status message rotation during generation
  React.useEffect(() => {
    if (!generating) return;
    const interval = setInterval(() => {
      setStatusStepIdx((prev) => (prev + 1) % GENERATION_STATUS_STEPS.length);
    }, 2200);
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
          cuisine: selectedCuisine,
          businessType: tenant?.type || "restaurant",
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
          setShowConfig(false); // collapse config to focus on brand assets

          const isGeminiAi = data.variations.some((v: LogoVariation) => v.source === "gemini");
          addToast(
            "success",
            "4 AI Brand Logos Generated!",
            isGeminiAi
              ? "Bespoke culinary identities crafted in real time by Google Gemini AI."
              : "Bespoke vector culinary identities ready with rich food motifs."
          );
        } else {
          throw new Error("No logo variations returned");
        }
      } else {
        throw new Error("Generation request failed");
      }
    } catch (e: unknown) {
      console.error("AI Logo generation failed:", e);
      addToast("error", "Generation Failed", "Could not generate logos. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // 1-Click Regenerate a Single Variation
  const handleRegenerateSingle = async (archetypeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRegeneratingId(archetypeId);

    try {
      const res = await fetch("/api/ai/generate-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: brandName.trim(),
          cuisine: selectedCuisine,
          businessType: tenant?.type || "restaurant",
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
          addToast("success", "Concept Refreshed", `Updated ${newVariation.title} with a fresh design.`);
        }
      }
    } catch (err) {
      console.warn("Single concept regeneration error:", err);
      addToast("error", "Regeneration Failed", "Could not refresh this specific style. Please try again.");
    } finally {
      setRegeneratingId(null);
    }
  };

  const selectedLogo = variations.find((v) => v.id === selectedVariationId) || variations[0];

  // Apply Selected Logo as Workspace Logo
  const handleApplyLogo = async () => {
    if (!selectedLogo) return;

    // 1. Update local Zustand auth store immediately
    updateTenant({ logoUrl: selectedLogo.dataUri, logo: selectedLogo.dataUri });

    // 2. Persist to MongoDB backend
    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL ||
        (process.env.NODE_ENV === "production"
          ? "https://dine.rovixatech.com/api/v1"
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

  // Download High-Resolution PNG (via HTML5 Canvas rasterizer)
  const handleDownloadPng = async (targetSvg?: string) => {
    const svgToDownload = targetSvg || selectedLogo?.svg;
    if (!svgToDownload) return;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not create canvas context");

      const img = new Image();
      const svgBlob = new Blob([svgToDownload], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0, 1024, 1024);
        URL.revokeObjectURL(url);
        const pngUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `${brandName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${selectedLogo?.id || "brand"}-1024px.png`;
        link.href = pngUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast("success", "PNG Downloaded", "High-resolution 1024x1024 brand PNG saved to your downloads.");
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        handleDownloadSvg(svgToDownload);
      };

      img.src = url;
    } catch (err) {
      console.warn("PNG rasterization fallback:", err);
      handleDownloadSvg(svgToDownload);
    }
  };

  // Download Vector SVG
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
      description="Create distinctive, colorful hospitality identities with culinary food motifs, real-world mockups, and high-res PNG/SVG export."
      size="xl"
    >
      <div className="space-y-4 max-h-[78vh] overflow-y-auto pr-1">
        {/* Collapsible Configuration Panel */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Establishment Attributes & Culinary Directives
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
              {/* Row 1: Brand Name & Cuisine / Specialty Quick-Select */}
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Brand / Establishment Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Napoli Woodfired Pizza, The Grand Roast, Aroma Bistro"
                    className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors shadow-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Cuisine / Specialty Food Iconography
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {CUISINES.map((c) => {
                      const Icon = c.icon;
                      const isSelected = selectedCuisine === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedCuisine(c.id)}
                          className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer",
                            isSelected
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500 font-bold"
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          )}
                        >
                          <Icon className={cn("h-3.5 w-3.5", isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400")} />
                          <span>{c.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Row 2: Brand Persona / Vibe */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Brand Persona & Aesthetic Aura
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
                    Signature Color Harmony
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
                        <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", c.bg)} />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Custom Keywords / Tagline Notes
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g. woodfired, organic, sourdough, rooftop, 24k gold"
                    className="w-full h-9 px-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-xs"
                  />
                </div>
              </div>

              {/* Generate All Button */}
              <div className="pt-2">
                <Button
                  variant="glow"
                  size="md"
                  className="w-full flex items-center justify-center gap-2 font-bold cursor-pointer"
                  onClick={handleGenerateAll}
                  disabled={generating || !brandName.trim()}
                >
                  {generating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                      <span>Google Gemini Brand Architect at Work...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                      <span>{variations.length > 0 ? "Regenerate 4 New AI Variations" : "Generate 4 Bespoke AI Logo Variations"}</span>
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
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <RefreshCw className="h-4 w-4 text-emerald-500 animate-spin shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Google Gemini 2.5 Flash Brand Engine Active
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {GENERATION_STATUS_STEPS[statusStepIdx]}
                  </p>
                </div>
              </div>
              <Badge variant="glow" size="sm" className="font-mono text-[10px]">
                Active AI
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                "Archetype 1: Illustrated Culinary Emblem",
                "Archetype 2: Modern Gastronomy Badge",
                "Archetype 3: Heritage Artisan Stamp",
                "Archetype 4: Vibrant Bistro & Neon Glow",
              ].map((label, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 relative overflow-hidden shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">{label}</span>
                    <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  </div>
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

        {/* ── STATE 2: 4 MULTI-VARIATION DISPLAY + REAL-WORLD MOCKUPS ── */}
        {!generating && variations.length > 0 && (
          <div className="space-y-4 pt-1 animate-in fade-in duration-300">
            {/* Header Control Bar: Canvas Preview & Global Actions */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  4 Bespoke Brand Concepts
                </span>
                <span className="text-[11px] text-slate-500">
                  (Tap any concept to preview & apply)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Mockup Switcher Tabs */}
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveMockup("canvas")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold transition-all cursor-pointer",
                      activeMockup === "canvas"
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    )}
                  >
                    <ImageIcon className="h-3 w-3" />
                    <span>Concepts Grid</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMockup("menu")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold transition-all cursor-pointer",
                      activeMockup === "menu"
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    )}
                  >
                    <FileText className="h-3 w-3 text-amber-500" />
                    <span>Menu Mockup</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMockup("stand")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold transition-all cursor-pointer",
                      activeMockup === "stand"
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    )}
                  >
                    <QrCode className="h-3 w-3 text-emerald-500" />
                    <span>Table QR Stand</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMockup("mobile")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold transition-all cursor-pointer",
                      activeMockup === "mobile"
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    )}
                  >
                    <Smartphone className="h-3 w-3 text-blue-500" />
                    <span>App Header</span>
                  </button>
                </div>

                {/* Canvas Theme Toggle */}
                {activeMockup === "canvas" && (
                  <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setCanvasTheme("dark")}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors cursor-pointer",
                        canvasTheme === "dark" ? "bg-slate-950 text-white shadow-xs" : "text-slate-400 hover:text-slate-900"
                      )}
                      title="Dark Canvas"
                    >
                      <Moon className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCanvasTheme("light")}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors cursor-pointer",
                        canvasTheme === "light" ? "bg-white text-slate-900 shadow-xs" : "text-slate-400 hover:text-slate-900"
                      )}
                      title="Light Canvas"
                    >
                      <Sun className="h-3 w-3 text-amber-500" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* VIEW A: 4-Card Responsive Grid */}
            {activeMockup === "canvas" && (
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
                              Select
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Logo SVG Canvas Display */}
                      <div
                        className={cn(
                          "w-full h-44 rounded-xl flex items-center justify-center p-3 border transition-colors relative overflow-hidden",
                          canvasTheme === "dark"
                            ? "bg-[#090D18] border-slate-800/90 shadow-inner"
                            : "bg-slate-100 border-slate-200"
                        )}
                      >
                        {isRegeneratingThis ? (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <RefreshCw className="h-6 w-6 text-emerald-500 animate-spin" />
                            <span className="text-[11px] font-medium text-slate-400">
                              Designing new {v.title}...
                            </span>
                          </div>
                        ) : (
                          <div
                            className="h-36 w-36 flex items-center justify-center transition-transform group-hover:scale-105 duration-300"
                            dangerouslySetInnerHTML={{ __html: v.svg }}
                          />
                        )}
                      </div>

                      {/* Bottom Metadata & Single Refresh Button */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] line-clamp-1 pr-2">
                          {v.description}
                        </p>

                        <button
                          type="button"
                          disabled={isRegeneratingThis || generating}
                          onClick={(e) => handleRegenerateSingle(v.id, e)}
                          title="Regenerate this specific concept"
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
            )}

            {/* VIEW B: RESTAURANT MENU CARD MOCKUP */}
            {activeMockup === "menu" && selectedLogo && (
              <div className="p-6 rounded-2xl bg-[#FBF9F5] text-slate-900 border border-amber-200/80 shadow-xl max-w-lg mx-auto flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
                {/* Menu Header with Logo */}
                <div className="w-28 h-28 flex items-center justify-center">
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: selectedLogo.svg }}
                  />
                </div>
                <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-700 to-transparent opacity-40 my-1" />
                <h3 className="font-serif text-xl font-bold tracking-widest uppercase text-slate-900">
                  {brandName}
                </h3>
                <p className="text-[11px] font-serif italic text-amber-800/80 tracking-wider">
                  Artisanal Tasting Menu & Daily Curations
                </p>

                {/* Sample Menu Items Preview */}
                <div className="w-full space-y-3 pt-2 text-left text-xs border-t border-amber-200/60">
                  <div className="flex justify-between items-baseline border-b border-dotted border-amber-300 pb-1">
                    <span className="font-serif font-bold text-slate-800">Signature Chef Selection</span>
                    <span className="font-mono font-bold text-amber-900">$28.50</span>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">Fresh seasonal harvest, truffle emulsion & aged herbs</p>

                  <div className="flex justify-between items-baseline border-b border-dotted border-amber-300 pb-1 pt-1">
                    <span className="font-serif font-bold text-slate-800">Woodfired Specialty</span>
                    <span className="font-mono font-bold text-amber-900">$22.00</span>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">Artisan hand-stretched dough, buffalo mozzarella & basil</p>
                </div>
                <p className="text-[9px] uppercase tracking-widest text-slate-400 pt-2 font-mono">
                  Live DineFlow Digital Menu Preview
                </p>
              </div>
            )}

            {/* VIEW C: ACRYLIC TABLE QR STAND MOCKUP */}
            {activeMockup === "stand" && selectedLogo && (
              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700 text-white shadow-2xl max-w-sm mx-auto flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
                <Badge variant="glow" size="sm" className="text-[10px] uppercase font-bold tracking-wider">
                  Table 04 • DineFlow QR Ordering
                </Badge>

                {/* Logo on Acrylic Stand */}
                <div className="w-24 h-24 flex items-center justify-center p-1 bg-white/5 rounded-2xl border border-white/10 shadow-lg">
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: selectedLogo.svg }}
                  />
                </div>

                <div>
                  <h4 className="font-black text-sm tracking-wide uppercase text-white">{brandName}</h4>
                  <p className="text-[11px] text-emerald-400 font-medium">Scan to View Menu & Pay at Table</p>
                </div>

                {/* Simulated QR Code on stand */}
                <div className="p-3 bg-white rounded-xl shadow-lg flex items-center justify-center">
                  <QrCode className="h-28 w-28 text-slate-950" />
                </div>

                <p className="text-[10px] text-slate-400">
                  No app download needed • Instant ordering via camera
                </p>
              </div>
            )}

            {/* VIEW D: MOBILE APP TOPBAR MOCKUP */}
            {activeMockup === "mobile" && selectedLogo && (
              <div className="max-w-sm mx-auto rounded-3xl border-4 border-slate-800 bg-slate-950 shadow-2xl overflow-hidden text-white animate-in zoom-in-95 duration-200">
                {/* Mobile Status Bar */}
                <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800">
                  <span>9:41</span>
                  <span className="font-bold">5G • 100%</span>
                </div>

                {/* App Header with Logo */}
                <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 p-1 flex items-center justify-center shrink-0 shadow-sm">
                    <div
                      className="w-full h-full flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: selectedLogo.svg }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black truncate">{brandName}</h4>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Kitchen Open • Avg 15m
                    </span>
                  </div>
                </div>

                {/* Body Content Placeholder */}
                <div className="p-4 space-y-3">
                  <div className="h-20 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 p-3 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">Welcome to {brandName}</span>
                    <span className="text-xs font-bold text-white">Order your favorites directly to table #04</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-8 rounded-lg bg-slate-900 border border-slate-800 animate-pulse" />
                    <div className="h-8 rounded-lg bg-slate-900 border border-slate-800 animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Final Action Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPng()}
                  leftIcon={<Download className="h-3.5 w-3.5" />}
                  className="text-xs cursor-pointer"
                >
                  Download PNG (1024px)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadSvg()}
                  leftIcon={<Download className="h-3.5 w-3.5" />}
                  className="text-xs cursor-pointer"
                >
                  Download SVG
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-xs cursor-pointer"
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
                className="w-full sm:w-auto font-bold min-w-[220px] cursor-pointer"
              >
                Apply "{selectedLogo?.title || "Brand"}" Logo
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
