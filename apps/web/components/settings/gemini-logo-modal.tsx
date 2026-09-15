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

const VIBES = [
  {
    id: "royal_luxury",
    name: "Royal Luxury & Heritage",
    desc: "Regal crests, gold gradients & prestigious hospitality aura",
    icon: Crown,
  },
  {
    id: "modern_minimalist",
    name: "Modern Minimalist",
    desc: "Sleek geometric lines, contemporary typography & high contrast",
    icon: Layers,
  },
  {
    id: "artisan_culinary",
    name: "Artisan Culinary",
    desc: "Warm terracotta & amber, handcrafted gourmet emblem",
    icon: Palette,
  },
  {
    id: "vibrant_bistro",
    name: "Vibrant Bistro & Bar",
    desc: "Energetic crimson & rose tones, iconic urban lounge feel",
    icon: Building,
  },
];

const COLORS = [
  { id: "emerald", name: "Emerald & Jade", bg: "bg-emerald-500", border: "border-emerald-400" },
  { id: "gold", name: "Royal Gold", bg: "bg-amber-500", border: "border-amber-400" },
  { id: "sapphire", name: "Sapphire Blue", bg: "bg-blue-500", border: "border-blue-400" },
  { id: "crimson", name: "Ruby Crimson", bg: "bg-rose-500", border: "border-rose-400" },
  { id: "amber", name: "Warm Amber", bg: "bg-orange-500", border: "border-orange-400" },
];

export function GeminiLogoModal({ isOpen, onClose, onLogoApplied }: GeminiLogoModalProps) {
  const { tenant, updateTenant } = useAuthStore();
  const { addToast } = useToast();

  const [brandName, setBrandName] = React.useState(tenant?.name || "The Grand Bistro");
  const [businessType, setBusinessType] = React.useState(tenant?.type || "restaurant");
  const [selectedVibe, setSelectedVibe] = React.useState("royal_luxury");
  const [selectedColor, setSelectedColor] = React.useState("gold");
  const [keywords, setKeywords] = React.useState("");

  const [generating, setGenerating] = React.useState(false);
  const [generatedSvg, setGeneratedSvg] = React.useState<string | null>(null);
  const [generatedUri, setGeneratedUri] = React.useState<string | null>(null);
  const [previewMode, setPreviewMode] = React.useState<"dark" | "light">("dark");
  const [source, setSource] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (tenant?.name) {
      setBrandName(tenant.name);
    }
    if (tenant?.type) {
      setBusinessType(tenant.type);
    }
  }, [tenant]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: brandName,
          businessType,
          vibe: selectedVibe,
          primaryColor: selectedColor,
          keywords,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.svg && data.dataUri) {
          setGeneratedSvg(data.svg);
          setGeneratedUri(data.dataUri);
          setSource(data.source === "gemini" ? "Google Gemini AI" : "Vector Brand Studio");
          addToast(
            "success",
            "Logo Generated!",
            data.source === "gemini"
              ? "Bespoke vector SVG crafted by Gemini AI."
              : "Bespoke vector brand emblem created."
          );
        } else {
          throw new Error("Empty logo returned");
        }
      } else {
        throw new Error("Generation request failed");
      }
    } catch (e: any) {
      console.error("AI Logo generation failed:", e);
      addToast("error", "Generation Failed", "Could not generate logo. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleApplyLogo = async () => {
    if (!generatedUri) return;

    // Update local Zustand store immediately
    updateTenant({ logoUrl: generatedUri, logo: generatedUri });

    // Sync to backend
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
          body: JSON.stringify({ logoUrl: generatedUri }),
        });
      }
    } catch (e) {
      console.warn("Backend logo sync warning:", e);
    }

    if (onLogoApplied) {
      onLogoApplied(generatedUri);
    }

    addToast(
      "success",
      "Workspace Logo Updated",
      "Your new client brand logo is now displayed across the entire dashboard header."
    );
    onClose();
  };

  const handleDownloadSvg = () => {
    if (!generatedSvg) return;
    const blob = new Blob([generatedSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${brandName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-logo.svg`;
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
      description="Create a clean, production-ready vector logo for your brand using Google Gemini AI."
      size="lg"
    >
      <div className="space-y-5">
        {/* Step 1: Input Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Brand / Hotel Name"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="e.g. The Oberoi Palace"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Business Category
            </label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="restaurant">Fine Dining Restaurant</option>
              <option value="hotel">Luxury Hotel & Suites</option>
              <option value="cafe">Boutique Cafe & Bakery</option>
              <option value="bar">Cocktail Bar & Lounge</option>
              <option value="cloud_kitchen">Cloud Kitchen & Delivery</option>
            </select>
          </div>
        </div>

        {/* Step 2: Vibe / Style Preset */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Brand Identity Vibe
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {VIBES.map((v) => {
              const isSelected = selectedVibe === v.id;
              const Icon = v.icon;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVibe(v.id)}
                  className={cn(
                    "p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5",
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50"
                  )}
                >
                  <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{v.name}</p>
                      {isSelected && <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {v.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Color Palette Accent */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Primary Accent Color
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedColor(c.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all",
                  selectedColor === c.id
                    ? "border-emerald-500 bg-emerald-500/15 text-slate-900 dark:text-white ring-1 ring-emerald-500"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <span className={cn("h-2.5 w-2.5 rounded-full", c.bg)} />
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Trigger Button */}
        <div className="pt-1">
          <Button
            variant="glow"
            size="md"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGenerate}
            disabled={generating || !brandName.trim()}
          >
            {generating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                <span>Crafting Vector Brand Logo with Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span>Generate Logo with Gemini AI</span>
              </>
            )}
          </Button>
        </div>

        {/* Step 4: Preview Card */}
        {generatedSvg && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3.5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">AI Generated Logo</span>
                {source && (
                  <Badge variant="glow" size="sm">
                    {source}
                  </Badge>
                )}
              </div>

              {/* Contrast Mode Selector */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewMode("dark")}
                  className={cn(
                    "px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors",
                    previewMode === "dark" ? "bg-slate-950 text-white shadow-xs" : "text-slate-500"
                  )}
                >
                  <Moon className="h-3 w-3" />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("light")}
                  className={cn(
                    "px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors",
                    previewMode === "light" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                  )}
                >
                  <Sun className="h-3 w-3" />
                  <span>Light</span>
                </button>
              </div>
            </div>

            {/* Logo Rendering Canvas */}
            <div
              className={cn(
                "w-full h-56 rounded-xl flex items-center justify-center p-4 transition-colors border shadow-inner",
                previewMode === "dark"
                  ? "bg-[#090D16] border-slate-800"
                  : "bg-slate-100 border-slate-300"
              )}
            >
              <div
                className="h-44 w-44 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: generatedSvg }}
              />
            </div>

            {/* Application Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={generating}
                  leftIcon={<RefreshCw className={cn("h-3.5 w-3.5", generating && "animate-spin")} />}
                  className="flex-1 sm:flex-initial"
                >
                  Regenerate
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownloadSvg}
                  leftIcon={<Download className="h-3.5 w-3.5" />}
                  className="flex-1 sm:flex-initial"
                >
                  Download SVG
                </Button>
              </div>

              <Button
                variant="glow"
                size="sm"
                onClick={handleApplyLogo}
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
                className="w-full sm:w-auto font-bold"
              >
                Apply as Workspace Logo
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
