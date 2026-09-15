import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 45;

interface GenerateLogoRequest {
  name: string;
  businessType?: string;
  vibe?: string;
  primaryColor?: string;
  keywords?: string;
}

const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
];

function sanitizeSvg(rawSvg: string): string {
  const match = rawSvg.match(/<svg[\s\S]*?<\/svg>/i);
  if (!match) return "";
  let svg = match[0].trim();
  if (!svg.includes("viewBox")) {
    svg = svg.replace(/<svg/i, '<svg viewBox="0 0 300 300"');
  }
  if (!svg.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svg = svg.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  return svg;
}

// Seeded pseudo-random (LCG) for consistent-within-request but varied-across-requests output
function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateProceduralSvg(
  name: string,
  businessType: string = "restaurant",
  vibe: string = "modern_minimalist",
  colorTheme: string = "emerald",
  seed?: number
): string {
  const brandName = (name || "DineFlow").trim();
  const words = brandName.split(/\s+/).filter(Boolean);
  const initials = words.length > 1
    ? (words[0][0] + words[1][0]).toUpperCase()
    : brandName.slice(0, 2).toUpperCase();

  // Use a time-based seed if not provided — ensures each call is unique
  const rng = seededRand(seed ?? (Date.now() ^ (Math.random() * 0x7fffffff)));
  const r1 = rng(); const r2 = rng(); const r3 = rng();
  const r4 = rng(); const r5 = rng(); const r6 = rng();

  let gradStart = "#059669";
  let gradEnd = "#10B981";
  let accent = "#34D399";

  if (colorTheme === "gold" || vibe === "royal_luxury") {
    gradStart = "#B45309"; gradEnd = "#F59E0B"; accent = "#FCD34D";
  } else if (colorTheme === "sapphire" || vibe === "modern_minimalist") {
    gradStart = "#1D4ED8"; gradEnd = "#3B82F6"; accent = "#93C5FD";
  } else if (colorTheme === "crimson" || vibe === "vibrant_bistro") {
    gradStart = "#BE123C"; gradEnd = "#F43F5E"; accent = "#FDA4AF";
  } else if (colorTheme === "amber" || vibe === "artisan_culinary") {
    gradStart = "#C2410C"; gradEnd = "#F97316"; accent = "#FDBA74";
  }

  const isHotel = businessType.toLowerCase().includes("hotel")
    || brandName.toLowerCase().includes("hotel")
    || brandName.toLowerCase().includes("resort")
    || brandName.toLowerCase().includes("palace");
  const subtitle = isHotel ? "HOTEL & SUITES" : "HOSPITALITY";

  // Varied border radius for the outer frame (35–55)
  const rx = Math.round(35 + r1 * 20);
  // Varied inner ring radius (65–80)
  const innerR = Math.round(65 + r2 * 15);
  // Varied center Y offset for monogram (-5 to +5)
  const centreY = Math.round(125 + (r3 - 0.5) * 10);
  // Stroke dash variation
  const dashA = Math.round(3 + r4 * 4);
  const dashB = Math.round(2 + r5 * 3);
  // Background colour tint (pure black vs very dark navy)
  const bgOptions = ["#090D16", "#0A0F1D", "#06080F", "#0D1117", "#080C14"];
  const bg = bgOptions[Math.floor(r6 * bgOptions.length)];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${gradStart}" />
      <stop offset="100%" stop-color="${gradEnd}" />
    </linearGradient>
    <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accent}" />
      <stop offset="100%" stop-color="#FFFFFF" />
    </linearGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <rect x="15" y="15" width="270" height="270" rx="${rx}" fill="${bg}" stroke="${gradEnd}" stroke-width="3" stroke-opacity="0.4" />
  
  <circle cx="150" cy="${centreY}" r="${innerR + 7}" fill="none" stroke="url(#bgGrad)" stroke-width="2.5" stroke-dasharray="${dashA} ${dashB}" opacity="0.6" />
  <circle cx="150" cy="${centreY}" r="${innerR}" fill="url(#bgGrad)" fill-opacity="0.15" stroke="${accent}" stroke-width="1.5" />

  ${isHotel ? `
  <path d="M120 ${centreY - 25} L150 ${centreY - 50} L180 ${centreY - 25} L172 ${centreY - 20} L150 ${centreY - 39} L128 ${centreY - 20} Z" fill="url(#goldAccent)" filter="url(#softGlow)" />
  <path d="M130 ${centreY - 15} L150 ${centreY - 31} L170 ${centreY - 15} L166 ${centreY - 11} L150 ${centreY - 24} L134 ${centreY - 11} Z" fill="${accent}" opacity="0.8" />
  <rect x="144" y="${centreY - 7}" width="12" height="18" rx="2" fill="url(#goldAccent)" />
  ` : `
  <circle cx="150" cy="${centreY - 33}" r="6" fill="url(#goldAccent)" filter="url(#softGlow)" />
  <path d="M150 ${centreY - 47} L152 ${centreY - 39} L160 ${centreY - 37} L152 ${centreY - 35} L150 ${centreY - 27} L148 ${centreY - 35} L140 ${centreY - 37} L148 ${centreY - 39} Z" fill="${accent}" />
  <path d="M132 ${centreY - 20} C132 ${centreY - 27} 140 ${centreY - 27} 140 ${centreY - 15} L140 ${centreY - 5}" stroke="url(#goldAccent)" stroke-width="2.5" stroke-linecap="round" fill="none" />
  <path d="M168 ${centreY - 20} C168 ${centreY - 27} 160 ${centreY - 27} 160 ${centreY - 15} L160 ${centreY - 5}" stroke="url(#goldAccent)" stroke-width="2.5" stroke-linecap="round" fill="none" />
  `}

  <text x="150" y="${centreY + 27}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" text-anchor="middle" fill="#FFFFFF" letter-spacing="2">
    ${initials}
  </text>

  <line x1="50" y1="205" x2="110" y2="205" stroke="${gradEnd}" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />
  <circle cx="150" cy="205" r="3" fill="${accent}" />
  <line x1="190" y1="205" x2="250" y2="205" stroke="${gradEnd}" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />

  <text x="150" y="232" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${brandName.length > 16 ? 13 : 16}" font-weight="800" text-anchor="middle" fill="#FFFFFF" letter-spacing="1.5">
    ${brandName.toUpperCase()}
  </text>

  <text x="150" y="252" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="700" text-anchor="middle" fill="${accent}" letter-spacing="3">
    ${subtitle}
  </text>
</svg>`;
}

// Varied design directive pools injected into the Gemini prompt
const DESIGN_LAYOUTS = [
  "a bold circular crest with the brand initials centered, surrounded by a thin decorative ring",
  "a shield/coat-of-arms silhouette with the brand name arched beneath a monogram",
  "a minimalist square badge with the brand initials in oversized typography, flanked by thin horizontal lines",
  "a diamond/rhombus frame with the initials inside and the brand name below in spaced caps",
  "an octagonal seal with concentric rings, central monogram, and subtle radial lines",
  "a classic hotel key-and-crown emblem with the brand name in elegant serifs below",
];

const MOTIF_DETAILS = [
  "Use a subtle chevron or arch above the initials",
  "Add thin horizontal rules flanking the brand name",
  "Include a small 5-pointed star or fleur-de-lis accent above the monogram",
  "Draw decorative corner flourishes inside the outer frame",
  "Add a thin dotted or dashed inner circle behind the central emblem",
  "Include a thin laurel wreath framing the initials",
];

const TYPOGRAPHY_STYLES = [
  "serif (Playfair Display style) for the brand name",
  "bold geometric sans-serif (Montserrat style) for the brand name",
  "condensed uppercase tracking-widest for the brand name",
  "italic script for the brand name with a contrasting subtitle",
  "ultra-heavy display weight with wide letter-spacing",
];

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateLogoRequest;
    const { name, businessType = "restaurant", vibe = "royal_luxury", primaryColor = "emerald", keywords = "" } = body;

    const brandName = (name || "DineFlow").trim();
    const apiKey = process.env.GEMINI_API_KEY;

    // Randomisation seed — changes every call so even same inputs produce fresh results
    const uniqueSeed = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    if (apiKey) {
      // Pick random varied directive strings
      const layout = DESIGN_LAYOUTS[Math.floor(Math.random() * DESIGN_LAYOUTS.length)];
      const motif = MOTIF_DETAILS[Math.floor(Math.random() * MOTIF_DETAILS.length)];
      const typo = TYPOGRAPHY_STYLES[Math.floor(Math.random() * TYPOGRAPHY_STYLES.length)];

      const prompt = `You are an elite vector logo designer and SVG artist. Create a visually unique, production-ready vector brand logo.

Brand Info:
- Name: "${brandName}"
- Business Category: ${businessType}
- Vibe / Style: ${vibe}
- Primary Accent: ${primaryColor}
- Keywords: ${keywords || "luxury, hospitality, elegance, memorable"}

Design Directives (follow these exactly for THIS iteration):
- Layout concept: ${layout}
- Decorative motif: ${motif}
- Typography style: ${typo}
- Unique session seed (incorporate as creative variation): ${uniqueSeed}

TECHNICAL RULES:
1. Return ONLY pure SVG code starting with <svg and ending with </svg>. No markdown, no backticks, no extra text.
2. The SVG MUST have viewBox="0 0 300 300", width="100%", height="100%".
3. Use a dark background (#0A0F1D or similar deep navy/black) with rounded corners.
4. Include an iconic central crest/monogram and the brand name "${brandName}" in clean typography.
5. Make it visually DISTINCT from any generic hospitality logo — this brand must look unique.
6. The SVG must be self-contained without external assets or CSS classes.`;

      for (const model of GEMINI_MODELS) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 1.0,      // High creativity — ensures unique output each time
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 4096,
              },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
            const cleanSvg = sanitizeSvg(text);
            if (cleanSvg && cleanSvg.length > 100) {
              const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(cleanSvg)}`;
              return NextResponse.json({
                ok: true,
                svg: cleanSvg,
                dataUri,
                source: "gemini",
                model,
              });
            }
          }
        } catch (e) {
          console.warn(`[generate-logo] Model ${model} failed:`, e);
        }
      }
    }

    // Procedural fallback — uses time-based seed for uniqueness
    const proceduralSvg = generateProceduralSvg(brandName, businessType, vibe, primaryColor, Date.now());
    const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(proceduralSvg)}`;

    return NextResponse.json({
      ok: true,
      svg: proceduralSvg,
      dataUri,
      source: "procedural",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to generate logo";
    console.error("[generate-logo] Global error:", err);
    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500 }
    );
  }
}

