import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 45;

export interface GenerateLogoRequest {
  name: string;
  businessType?: string;
  vibe?: string;
  primaryColor?: string;
  keywords?: string;
  mode?: "all" | "single";
  archetype?: "minimal" | "luxury" | "artisan" | "monogram";
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

const ACTIVE_GEMINI_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
];

const ARCHETYPE_CONFIGS: Record<
  "minimal" | "luxury" | "artisan" | "monogram",
  {
    title: string;
    description: string;
    designFocus: string;
    motifGuidelines: string;
    layoutStyle: string;
  }
> = {
  minimal: {
    title: "Modern Minimalist",
    description: "Sleek geometric line art with refined negative space and modern sans-serif letterforms.",
    designFocus: "ultra-clean contemporary vector minimalism, balanced negative space, razor-sharp vector paths",
    motifGuidelines: "a single continuous-line geometric mark, abstract silhouette, or pure geometric emblem",
    layoutStyle: "clean horizontal or stacked lockup with modern sans-serif typography (like Montserrat or Helvetica Neue)",
  },
  luxury: {
    title: "Royal Luxury & Heritage",
    description: "Prestigious crest with heraldic elements, metallic gradients, and classic serif typography.",
    designFocus: "5-star luxury hospitality crest, regal shield silhouette, opulent metallic gradient framing",
    motifGuidelines: "a refined royal crown, laurel wreath, star constellation, or heraldic shield emblem",
    layoutStyle: "centered majestic crest with high-contrast serif typography (like Playfair Display or Bodoni)",
  },
  artisan: {
    title: "Artisan Craft & Culinary",
    description: "Handcrafted gourmet motif with organic lines, culinary symbols, and warm hospitality accents.",
    designFocus: "artisan culinary seal, organic flowing curves, handcrafted gourmet warmth, bespoke mark",
    motifGuidelines: "a botanical sprig, single-origin coffee bean, artisan baker wheat, or culinary flame motif",
    layoutStyle: "circular artisan stamp or curved emblem with warm balanced character spacing",
  },
  monogram: {
    title: "Bold Monogram & Seal",
    description: "Striking interlocking initials set inside a bold geometric stamp with high-contrast framing.",
    designFocus: "powerful geometric monogram seal, interlocking stylized typography, iconic silhouette",
    motifGuidelines: "interlocking stylized letters of the brand initials enclosed in an architectural geometric ring or octagon",
    layoutStyle: "prominent central monogram badge with brand name arched or placed beneath in spaced uppercase",
  },
};

// Color palettes with primary, accent, and background tones
const PALETTES: Record<string, { primary: string; accent: string; secondary: string; bg: string }> = {
  emerald: {
    primary: "#059669",
    accent: "#34D399",
    secondary: "#10B981",
    bg: "#061510",
  },
  gold: {
    primary: "#B45309",
    accent: "#FBBF24",
    secondary: "#D97706",
    bg: "#0F0B06",
  },
  sapphire: {
    primary: "#1D4ED8",
    accent: "#60A5FA",
    secondary: "#3B82F6",
    bg: "#080F1E",
  },
  crimson: {
    primary: "#BE123C",
    accent: "#FB7185",
    secondary: "#E11D48",
    bg: "#18060B",
  },
  amber: {
    primary: "#C2410C",
    accent: "#FB923C",
    secondary: "#EA580C",
    bg: "#160904",
  },
  monochrome: {
    primary: "#94A3B8",
    accent: "#FFFFFF",
    secondary: "#CBD5E1",
    bg: "#090D16",
  },
};

function sanitizeSvg(rawSvg: string): string {
  const match = rawSvg.match(/<svg[\s\S]*?<\/svg>/i);
  if (!match) return "";
  let svg = match[0].trim();

  // Normalize viewBox and namespaces
  if (!svg.includes("viewBox")) {
    svg = svg.replace(/<svg/i, '<svg viewBox="0 0 300 300"');
  }
  if (!svg.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svg = svg.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  // Remove markdown tags if any leaked inside
  svg = svg.replace(/```[a-z]*\s*/gi, "").replace(/```/g, "");

  return svg;
}

// Fallback procedural generator ensuring 0% failure rate
function generateArchetypeProceduralSvg(
  name: string,
  businessType: string,
  archetype: "minimal" | "luxury" | "artisan" | "monogram",
  colorTheme: string,
  seed: number
): string {
  const brandName = (name || "DineFlow").trim();
  const words = brandName.split(/\s+/).filter(Boolean);
  const initials = words.length > 1
    ? (words[0][0] + words[1][0]).toUpperCase()
    : brandName.slice(0, 2).toUpperCase();

  const pal = PALETTES[colorTheme] || PALETTES.emerald;
  const isHotel = businessType.toLowerCase().includes("hotel") || brandName.toLowerCase().includes("hotel") || brandName.toLowerCase().includes("resort");
  const isCafe = businessType.toLowerCase().includes("cafe") || brandName.toLowerCase().includes("cafe") || brandName.toLowerCase().includes("coffee");
  const subtitle = isHotel ? "HOTEL & SUITES" : isCafe ? "CAFE & ROASTERY" : "HOSPITALITY";

  const gradId = `grad_${archetype}_${seed}`;
  const accentGradId = `accent_${archetype}_${seed}`;

  if (archetype === "minimal") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${pal.primary}" />
      <stop offset="100%" stop-color="${pal.accent}" />
    </linearGradient>
  </defs>
  <rect width="300" height="300" rx="36" fill="${pal.bg}" stroke="${pal.primary}" stroke-width="1.5" stroke-opacity="0.3" />
  
  <g transform="translate(150, 118)">
    <rect x="-42" y="-42" width="84" height="84" rx="20" fill="none" stroke="url(#${gradId})" stroke-width="2" transform="rotate(45)" opacity="0.8" />
    <circle cx="0" cy="0" r="28" fill="${pal.primary}" fill-opacity="0.12" stroke="${pal.accent}" stroke-width="1.5" />
    <text x="0" y="8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" text-anchor="middle" fill="#FFFFFF" letter-spacing="1">${initials}</text>
  </g>

  <text x="150" y="218" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${brandName.length > 15 ? 13 : 16}" font-weight="800" text-anchor="middle" fill="#FFFFFF" letter-spacing="2">${brandName.toUpperCase()}</text>
  <text x="150" y="238" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="600" text-anchor="middle" fill="${pal.accent}" letter-spacing="4">${subtitle}</text>
</svg>`;
  }

  if (archetype === "luxury") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${pal.accent}" />
      <stop offset="50%" stop-color="${pal.primary}" />
      <stop offset="100%" stop-color="${pal.accent}" />
    </linearGradient>
    <linearGradient id="${accentGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="${pal.accent}" />
    </linearGradient>
  </defs>
  <rect width="300" height="300" rx="36" fill="${pal.bg}" stroke="${pal.primary}" stroke-width="2" stroke-opacity="0.4" />
  
  <path d="M150 48 L195 72 L195 130 C195 162 150 182 150 182 C150 182 105 162 105 130 L105 72 Z" fill="url(#${gradId})" fill-opacity="0.1" stroke="url(#${gradId})" stroke-width="2" />
  
  <path d="M138 78 L150 64 L162 78 L156 82 L150 74 L144 82 Z" fill="url(#${accentGradId})" />
  <circle cx="150" cy="85" r="2.5" fill="#FFFFFF" />
  <text x="150" y="132" font-family="'Playfair Display', Georgia, serif" font-size="30" font-weight="900" text-anchor="middle" fill="#FFFFFF" letter-spacing="1.5">${initials}</text>
  
  <line x1="60" y1="202" x2="110" y2="202" stroke="${pal.primary}" stroke-width="1" opacity="0.6" />
  <circle cx="150" cy="202" r="3" fill="${pal.accent}" />
  <line x1="190" y1="202" x2="240" y2="202" stroke="${pal.primary}" stroke-width="1" opacity="0.6" />

  <text x="150" y="226" font-family="'Playfair Display', Georgia, serif" font-size="${brandName.length > 15 ? 13 : 16}" font-weight="700" text-anchor="middle" fill="#FFFFFF" letter-spacing="2">${brandName.toUpperCase()}</text>
  <text x="150" y="246" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="700" text-anchor="middle" fill="${pal.accent}" letter-spacing="3.5">${subtitle}</text>
</svg>`;
  }

  if (archetype === "artisan") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${pal.primary}" />
      <stop offset="100%" stop-color="${pal.accent}" />
    </linearGradient>
  </defs>
  <rect width="300" height="300" rx="36" fill="${pal.bg}" stroke="${pal.accent}" stroke-width="1.5" stroke-opacity="0.3" />
  
  <circle cx="150" cy="116" r="54" fill="none" stroke="url(#${gradId})" stroke-width="2" stroke-dasharray="4 3" opacity="0.7" />
  <circle cx="150" cy="116" r="46" fill="${pal.primary}" fill-opacity="0.14" stroke="${pal.accent}" stroke-width="1.5" />
  
  <path d="M150 78 C144 88 136 94 136 104 C136 114 143 120 150 120 C157 120 164 114 164 104 C164 94 156 88 150 78 Z" fill="url(#${gradId})" opacity="0.85" />
  <text x="150" y="148" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" text-anchor="middle" fill="#FFFFFF" letter-spacing="2">${initials}</text>
  
  <text x="150" y="218" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${brandName.length > 15 ? 13 : 16}" font-weight="800" text-anchor="middle" fill="#FFFFFF" letter-spacing="1.5">${brandName.toUpperCase()}</text>
  <text x="150" y="238" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="600" text-anchor="middle" fill="${pal.accent}" letter-spacing="3">${subtitle} • EST. 2025</text>
</svg>`;
  }

  // Monogram & Stamp
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${pal.primary}" />
      <stop offset="100%" stop-color="${pal.accent}" />
    </linearGradient>
  </defs>
  <rect width="300" height="300" rx="36" fill="${pal.bg}" stroke="${pal.primary}" stroke-width="2" stroke-opacity="0.4" />
  
  <polygon points="150,55 198,75 218,123 198,171 150,191 102,171 82,123 102,75" fill="url(#${gradId})" fill-opacity="0.12" stroke="url(#${gradId})" stroke-width="2" />
  <circle cx="150" cy="123" r="40" fill="none" stroke="${pal.accent}" stroke-width="1.5" stroke-dasharray="3 2" />
  <text x="150" y="136" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" text-anchor="middle" fill="#FFFFFF" letter-spacing="2">${initials}</text>
  
  <text x="150" y="226" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${brandName.length > 15 ? 13 : 16}" font-weight="900" text-anchor="middle" fill="#FFFFFF" letter-spacing="2">${brandName.toUpperCase()}</text>
  <text x="150" y="246" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="700" text-anchor="middle" fill="${pal.accent}" letter-spacing="4">${subtitle}</text>
</svg>`;
}

async function generateWithGemini(
  apiKey: string,
  model: string,
  prompt: string
): Promise<string | null> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 8192,
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini ${model} returned ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  const cleaned = sanitizeSvg(text);
  return cleaned && cleaned.length > 150 ? cleaned : null;
}

async function createArchetypeLogo(
  archetypeKey: "minimal" | "luxury" | "artisan" | "monogram",
  brandName: string,
  businessType: string,
  vibe: string,
  primaryColor: string,
  keywords: string,
  apiKey?: string
): Promise<LogoVariation> {
  const arc = ARCHETYPE_CONFIGS[archetypeKey];
  const pal = PALETTES[primaryColor] || PALETTES.emerald;
  const uniqueSeed = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const prompt = `You are an elite vector brand identity designer. Craft an iconic, production-ready vector logo for:
Brand Name: "${brandName}"
Business Category: ${businessType}
Vibe / Brand Essence: ${vibe}
Creative Archetype: ${arc.title} (${arc.designFocus})
Primary Palette: Primary: ${pal.primary}, Accent: ${pal.accent}, Background: ${pal.bg}
Specific Directives:
- Motif direction: ${arc.motifGuidelines}
- Typography layout: ${arc.layoutStyle}
- Keywords: ${keywords || "luxury, memorable, modern, premium branding"}
- Unique Session Salt: ${uniqueSeed}

STRICT TECHNICAL RULES:
1. Output ONLY pure valid SVG markup enclosed in <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"> ... </svg>.
2. No markdown wrapper (do NOT write \`\`\`xml or \`\`\`svg), no explanation text.
3. Use a rich dark background rect (#0A0F1D, #081018, or ${pal.bg}) with rounded corners (rx="36").
4. Embed self-contained <linearGradient> or <radialGradient> definitions inside <defs>.
5. Include the brand name "${brandName}" rendered with clean, balanced, high-contrast typography.
6. Scalable, sharp vector paths with balanced negative space.`;

  if (apiKey) {
    for (const model of ACTIVE_GEMINI_MODELS) {
      try {
        const svg = await generateWithGemini(apiKey, model, prompt);
        if (svg) {
          const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
          return {
            id: archetypeKey,
            title: arc.title,
            description: arc.description,
            svg,
            dataUri,
            source: "gemini",
            model,
            palette: {
              primary: pal.primary,
              accent: pal.accent,
              bg: pal.bg,
            },
          };
        }
      } catch (err) {
        console.warn(`[generate-logo] Model ${model} failed for archetype ${archetypeKey}:`, err);
      }
    }
  }

  // Resilient fallback with distinct visual archetype styling
  const proceduralSvg = generateArchetypeProceduralSvg(
    brandName,
    businessType,
    archetypeKey,
    primaryColor,
    Date.now() + Math.floor(Math.random() * 1000)
  );
  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(proceduralSvg)}`;

  return {
    id: archetypeKey,
    title: arc.title,
    description: arc.description,
    svg: proceduralSvg,
    dataUri,
    source: "procedural",
    palette: {
      primary: pal.primary,
      accent: pal.accent,
      bg: pal.bg,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateLogoRequest;
    const {
      name,
      businessType = "restaurant",
      vibe = "royal_luxury",
      primaryColor = "emerald",
      keywords = "",
      mode = "all",
      archetype = "minimal",
    } = body;

    const brandName = (name || "DineFlow").trim();
    const apiKey = process.env.GEMINI_API_KEY;

    if (mode === "single") {
      // Regenerate a single specific variation
      const singleVariation = await createArchetypeLogo(
        archetype,
        brandName,
        businessType,
        vibe,
        primaryColor,
        keywords,
        apiKey
      );

      return NextResponse.json({
        ok: true,
        variations: [singleVariation],
        svg: singleVariation.svg,
        dataUri: singleVariation.dataUri,
        source: singleVariation.source,
      });
    }

    // Generate all 4 distinct creative archetypes concurrently
    const archetypes: Array<"minimal" | "luxury" | "artisan" | "monogram"> = [
      "minimal",
      "luxury",
      "artisan",
      "monogram",
    ];

    const results = await Promise.allSettled(
      archetypes.map((arc) =>
        createArchetypeLogo(
          arc,
          brandName,
          businessType,
          vibe,
          primaryColor,
          keywords,
          apiKey
        )
      )
    );

    const variations: LogoVariation[] = results.map((res, index) => {
      if (res.status === "fulfilled") {
        return res.value;
      }
      // Safety fallback if a promise threw an uncaught error
      const arc = archetypes[index];
      const pal = PALETTES[primaryColor] || PALETTES.emerald;
      const fallbackSvg = generateArchetypeProceduralSvg(brandName, businessType, arc, primaryColor, Date.now() + index);
      return {
        id: arc,
        title: ARCHETYPE_CONFIGS[arc].title,
        description: ARCHETYPE_CONFIGS[arc].description,
        svg: fallbackSvg,
        dataUri: `data:image/svg+xml;utf8,${encodeURIComponent(fallbackSvg)}`,
        source: "procedural",
        palette: {
          primary: pal.primary,
          accent: pal.accent,
          bg: pal.bg,
        },
      };
    });

    const primaryVariation = variations[0];

    return NextResponse.json({
      ok: true,
      variations,
      // Backward compatibility fields
      svg: primaryVariation.svg,
      dataUri: primaryVariation.dataUri,
      source: primaryVariation.source,
      model: primaryVariation.model,
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


