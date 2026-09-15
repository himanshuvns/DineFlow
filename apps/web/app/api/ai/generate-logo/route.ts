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

function generateProceduralSvg(
  name: string,
  businessType: string = "restaurant",
  vibe: string = "modern_minimalist",
  colorTheme: string = "emerald"
): string {
  const brandName = (name || "DineFlow").trim();
  const words = brandName.split(/\s+/).filter(Boolean);
  const initials = words.length > 1
    ? (words[0][0] + words[1][0]).toUpperCase()
    : brandName.slice(0, 2).toUpperCase();

  let gradStart = "#059669";
  let gradEnd = "#10B981";
  let accent = "#34D399";

  if (colorTheme === "gold" || vibe === "royal_luxury") {
    gradStart = "#B45309";
    gradEnd = "#F59E0B";
    accent = "#FCD34D";
  } else if (colorTheme === "sapphire" || vibe === "modern_minimalist") {
    gradStart = "#1D4ED8";
    gradEnd = "#3B82F6";
    accent = "#93C5FD";
  } else if (colorTheme === "crimson" || vibe === "vibrant_bistro") {
    gradStart = "#BE123C";
    gradEnd = "#F43F5E";
    accent = "#FDA4AF";
  } else if (colorTheme === "amber" || vibe === "artisan_culinary") {
    gradStart = "#C2410C";
    gradEnd = "#F97316";
    accent = "#FDBA74";
  }

  const isHotel = businessType.toLowerCase().includes("hotel") || brandName.toLowerCase().includes("hotel") || brandName.toLowerCase().includes("resort") || brandName.toLowerCase().includes("palace");
  const subtitle = isHotel ? "HOTEL & SUITES" : "HOSPITALITY";

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

  <rect x="15" y="15" width="270" height="270" rx="44" fill="#0A0F1D" stroke="${gradEnd}" stroke-width="3" stroke-opacity="0.4" />
  
  <circle cx="150" cy="125" r="75" fill="none" stroke="url(#bgGrad)" stroke-width="2.5" stroke-dasharray="4 3" opacity="0.6" />
  <circle cx="150" cy="125" r="68" fill="url(#bgGrad)" fill-opacity="0.15" stroke="${accent}" stroke-width="1.5" />

  ${isHotel ? `
  <path d="M120 100 L150 75 L180 100 L172 105 L150 86 L128 105 Z" fill="url(#goldAccent)" filter="url(#softGlow)" />
  <path d="M130 110 L150 94 L170 110 L166 114 L150 101 L134 114 Z" fill="${accent}" opacity="0.8" />
  <rect x="144" y="118" width="12" height="18" rx="2" fill="url(#goldAccent)" />
  ` : `
  <circle cx="150" cy="92" r="6" fill="url(#goldAccent)" filter="url(#softGlow)" />
  <path d="M150 78 L152 86 L160 88 L152 90 L150 98 L148 90 L140 88 L148 86 Z" fill="${accent}" />
  <path d="M132 105 C132 98 140 98 140 110 L140 120" stroke="url(#goldAccent)" stroke-width="2.5" stroke-linecap="round" fill="none" />
  <path d="M168 105 C168 98 160 98 160 110 L160 120" stroke="url(#goldAccent)" stroke-width="2.5" stroke-linecap="round" fill="none" />
  `}

  <text x="150" y="152" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" text-anchor="middle" fill="#FFFFFF" letter-spacing="2">
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

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateLogoRequest;
    const { name, businessType = "restaurant", vibe = "royal_luxury", primaryColor = "emerald", keywords = "" } = body;

    const brandName = (name || "DineFlow").trim();
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      const prompt = `You are an elite vector logo designer and SVG artist.
Create a clean, iconic, luxury vector brand logo for a hospitality brand.

Brand Info:
- Name: "${brandName}"
- Business Category: ${businessType}
- Vibe / Style: ${vibe}
- Primary Accent: ${primaryColor}
- Nuances: ${keywords || "luxury, hospitality, elegance, memorable emblem"}

TECHNICAL RULES:
1. Return ONLY pure SVG code starting with <svg and ending with </svg>. No markdown formatting or extra text.
2. The SVG MUST have viewBox="0 0 300 300", width="100%", height="100%".
3. Use a dark background (#0A0F1D) with rounded corners (rx="44").
4. Include an iconic central crest/monogram and the brand name "${brandName}" in clean typography.
5. Make sure the SVG is self-contained without external assets.`;

      for (const model of GEMINI_MODELS) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
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

    const proceduralSvg = generateProceduralSvg(brandName, businessType, vibe, primaryColor);
    const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(proceduralSvg)}`;

    return NextResponse.json({
      ok: true,
      svg: proceduralSvg,
      dataUri,
      source: "procedural",
    });
  } catch (err: any) {
    console.error("[generate-logo] Global error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to generate logo" },
      { status: 500 }
    );
  }
}
