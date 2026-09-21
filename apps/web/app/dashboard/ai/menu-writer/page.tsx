"use client";

import * as React from "react";
import {
  PenLine,
  Sparkles,
  ChevronDown,
  Loader2,
  Copy,
  CheckCheck,
  Wand2,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

const SAMPLE_ITEMS = [
  { name: "Truffle Mushroom Risotto", category: "Main Courses", price: 850, tags: ["veg", "gluten_free"] },
  { name: "Pan-Seared Atlantic Salmon", category: "Main Courses", price: 1200, tags: ["non_veg"] },
  { name: "Smoked Burrata & Heirloom Salad", category: "Starters", price: 620, tags: ["veg"] },
  { name: "Grand Club Sandwich", category: "In-Room Dining", price: 650, tags: ["non_veg"] },
  { name: "Cold Brew Tonic & Citrus", category: "Beverages", price: 320, tags: ["veg", "vegan"] },
  { name: "Lobster Thermidor", category: "Premium Mains", price: 2800, tags: ["non_veg"] },
  { name: "Salted Caramel Fondant", category: "Desserts", price: 480, tags: ["veg"] },
];

const TONES = [
  { id: "poetic", label: "✨ Poetic", desc: "Evocative, sensory-rich prose" },
  { id: "informative", label: "📋 Informative", desc: "Clear ingredients & method" },
  { id: "playful", label: "😄 Playful", desc: "Fun, casual & personality-driven" },
];

const MOCK_DESCRIPTIONS: Record<string, { headline: string; description: string; tagLine: string }> = {
  "Truffle Mushroom Risotto|poetic": {
    headline: "Earth's Treasure, Perfectly Cradled in Arborio",
    description:
      "A slow-coaxed canvas of Arborio rice, kissed by a velvet cascade of aged Parmigiano and finished with hand-shaved black truffle — a dish that transforms a moment into a memory. Each spoonful carries the earthy perfume of the forest floor, elevated by our chef's two-decade mastery of the risotto flame.",
    tagLine: "The dish guests return for, again and again.",
  },
  "Pan-Seared Atlantic Salmon|informative": {
    headline: "Atlantic Salmon — Pan-Seared to Precision",
    description:
      "Wild-caught Atlantic Salmon fillet seared skin-side down at 220°C for a lacquer-crisp exterior, finished in herb butter and served with a lemon-caper emulsion, seasonal haricots verts, and smoked potato purée. Rich in Omega-3, prepared without additives.",
    tagLine: "Wild-caught. Skin-crisp. Simply perfect.",
  },
  "default|poetic": {
    headline: "A Culinary Creation Worth Savouring",
    description:
      "Prepared with the finest seasonal ingredients, each plate is a testament to our chef's decades of culinary mastery. A symphony of flavours, textures and aromas that invites you to slow down, savour, and stay a little longer.",
    tagLine: "Farm-fresh. Flame-kissed. Table-perfect.",
  },
};

function getDescription(item: string, tone: string) {
  return MOCK_DESCRIPTIONS[`${item}|${tone}`] || MOCK_DESCRIPTIONS["default|poetic"];
}

export default function MenuWriterPage() {
  const { addToast } = useToast();
  const [selectedItem, setSelectedItem] = React.useState(SAMPLE_ITEMS[0]);
  const [tone, setTone] = React.useState("poetic");
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<null | { headline: string; description: string; tagLine: string }>(null);
  const [copied, setCopied] = React.useState(false);
  const [appliedItems, setAppliedItems] = React.useState<string[]>([]);
  const [showDropdown, setShowDropdown] = React.useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setResult(null);
    // Simulate AI latency
    await new Promise((r) => setTimeout(r, 1800));
    setResult(getDescription(selectedItem.name, tone));
    setIsLoading(false);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`${result.headline}\n\n${result.description}\n\n${result.tagLine}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast("success", "Copied!", "Description copied to clipboard.");
  };

  const handleApply = () => {
    if (!result) return;
    setAppliedItems((prev) => [...prev, selectedItem.name]);
    addToast("success", "Applied to Menu!", `"${selectedItem.name}" description updated successfully.`);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-2">
            <PenLine className="h-3.5 w-3.5" />
            Feature 6.1 — AI Menu Writer
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Menu Description Generator</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Generate compelling, revenue-driving dish descriptions with one click.
          </p>
        </div>
        <Badge variant="purple" size="sm">
          <Sparkles className="h-3 w-3 mr-1" />
          Gemini AI
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left — Config */}
        <div className="lg:col-span-5 space-y-5">
          {/* Item Selector */}
          <Card variant="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">Select Menu Item</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer shadow-xs"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">{selectedItem.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{selectedItem.category} · ₹{selectedItem.price}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
                </button>

                {showDropdown && (
                  <div className="absolute z-10 top-full mt-2 w-full bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
                    {SAMPLE_ITEMS.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => { setSelectedItem(item); setShowDropdown(false); setResult(null); }}
                        className={`w-full text-left px-4 py-3 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${selectedItem.name === item.name ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold" : "text-slate-800 dark:text-slate-300"}`}
                      >
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-slate-500 dark:text-slate-400">{item.category} · ₹{item.price}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dietary tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {selectedItem.tags.map((tag) => (
                  <Badge key={tag} variant="glow" size="sm">{tag.replace("_", " ")}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tone Selector */}
          <Card variant="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">Writing Tone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTone(t.id); setResult(null); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all cursor-pointer ${
                    tone === t.id
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs"
                      : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold">{t.label}</div>
                    <div className="text-xs opacity-70">{t.desc}</div>
                  </div>
                  {tone === t.id && <CheckCheck className="h-4 w-4 text-emerald-400" />}
                </button>
              ))}
            </CardContent>
          </Card>

          <Button
            variant="glow"
            className="w-full"
            onClick={handleGenerate}
            disabled={isLoading}
            leftIcon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          >
            {isLoading ? "Generating with Gemini AI…" : "Generate Description"}
          </Button>
        </div>

        {/* Right — Result */}
        <div className="lg:col-span-7">
          <Card variant="glow" className="border-violet-500/20">
            <CardHeader className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 pb-3">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">Generated Description</CardTitle>
                <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                  {result ? "AI-generated menu copy — review and apply" : "Select an item and hit Generate"}
                </CardDescription>
              </div>
              {result && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy} leftIcon={copied ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}>
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleGenerate} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
                    Regen
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="space-y-4 animate-pulse">
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200/80 dark:bg-slate-800/60 rounded w-full" />
                    <div className="h-3 bg-slate-200/80 dark:bg-slate-800/60 rounded w-5/6" />
                    <div className="h-3 bg-slate-200/80 dark:bg-slate-800/60 rounded w-4/5" />
                  </div>
                  <div className="h-3 bg-slate-200/60 dark:bg-slate-700/40 rounded w-2/3" />
                </div>
              )}

              {!isLoading && !result && (
                <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
                  <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                    <Wand2 className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-500 text-sm font-medium">Select an item, choose a tone, and click Generate</p>
                </div>
              )}

              {!isLoading && result && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  {/* Headline */}
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1.5">Headline</p>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">{result.headline}</h3>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1.5">Description</p>
                    <p className="text-sm text-slate-800 dark:text-slate-300 leading-relaxed italic font-medium w-full break-words">"{result.description}"</p>
                  </div>

                  {/* Tag Line */}
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1.5">Tag Line</p>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{result.tagLine}</p>
                  </div>

                  {/* Apply button */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    {appliedItems.includes(selectedItem.name) ? (
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
                        <CheckCheck className="h-4 w-4" />
                        Applied to "{selectedItem.name}"
                      </div>
                    ) : (
                      <Button variant="glow" onClick={handleApply} className="w-full">
                        Apply to Menu
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Applied Items Summary */}
      {appliedItems.length > 0 && (
        <Card variant="glass" className="border-emerald-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {appliedItems.length} item{appliedItems.length > 1 ? "s" : ""} updated
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{appliedItems.join(", ")}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
