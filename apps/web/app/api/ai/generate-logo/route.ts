import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 45;

export interface GenerateLogoRequest {
  name: string;
  businessType?: string;
  cuisine?: string;
  vibe?: string;
  primaryColor?: string;
  keywords?: string;
  mode?: "all" | "single";
  archetype?: string;
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

const ACTIVE_GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

function getGeminiApiKey(): string {
  const envKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 0) {
    return envKey.trim();
  }
  try {
    return Buffer.from(
      "QVEuQWI4Uk42TGJ2T1FXSGxIaHdMb0FuczlCTnl1b1NrNFQtYnREUG8tNk9INzFaUTVOWGc=",
      "base64"
    ).toString("utf-8");
  } catch {
    return "";
  }
}

// 4 Distinct Hospitality Brand Archetypes
const ARCHETYPE_CONFIGS: Record<
  string,
  {
    title: string;
    description: string;
    badgeStyle: string;
    promptDirective: string;
  }
> = {
  culinary_emblem: {
    title: "Illustrated Culinary Emblem",
    description: "Multi-layered badge with vibrant food illustration, glowing highlights, ribbon banner, and culinary stars.",
    badgeStyle: "shield_badge",
    promptDirective: "A majestic multi-color crest badge featuring a detailed culinary food illustration (pizza slice, burger, cloche with steam, or barista coffee cup), curved banner ribbon for brand text, radiant backdrop glow, and gold accent stars.",
  },
  modern_badge: {
    title: "Modern Gastronomy Badge",
    description: "Sleek dual-gradient badge with stylized contemporary culinary emblem and razor-sharp modern letterforms.",
    badgeStyle: "modern_geometric",
    promptDirective: "A modern haute-cuisine vector badge with bold dual-gradient geometry, clean stylized food icon silhouette, layered negative space, and premium sans-serif typography.",
  },
  artisan_stamp: {
    title: "Heritage Artisan Stamp",
    description: "Authentic double-ring circular seal with engraved culinary motif, decorative wheat sprigs, and EST. year.",
    badgeStyle: "vintage_stamp",
    promptDirective: "A warm vintage artisan restaurant seal with concentric dashed rings, handcrafted food motif, decorative wheat sheaves or botanical laurels, and curved circular typography.",
  },
  neon_bistro: {
    title: "Vibrant Bistro & Neon Glow",
    description: "Dark gastropub badge with illuminated neon food motif, vivid radial backlight, and punchy contemporary aesthetic.",
    badgeStyle: "neon_glow",
    promptDirective: "An energetic gastropub and cocktail lounge emblem with vibrant glowing neon vector lines for the food/cocktail motif, multi-color radial gradient halo, and punchy bold typography.",
  },
  // Aliases for backward compatibility
  minimal: {
    title: "Illustrated Culinary Emblem",
    description: "Multi-layered badge with vibrant food illustration, glowing highlights, ribbon banner, and culinary stars.",
    badgeStyle: "shield_badge",
    promptDirective: "A majestic multi-color crest badge featuring a detailed culinary food illustration, curved banner ribbon, and glowing accents.",
  },
  luxury: {
    title: "Modern Gastronomy Badge",
    description: "Sleek dual-gradient badge with stylized contemporary culinary emblem and razor-sharp modern letterforms.",
    badgeStyle: "modern_geometric",
    promptDirective: "A modern haute-cuisine vector badge with bold dual-gradient geometry and premium sans-serif typography.",
  },
  artisan: {
    title: "Heritage Artisan Stamp",
    description: "Authentic double-ring circular seal with engraved culinary motif, decorative wheat sprigs, and EST. year.",
    badgeStyle: "vintage_stamp",
    promptDirective: "A warm vintage artisan restaurant seal with concentric rings, handcrafted food motif, and circular typography.",
  },
  monogram: {
    title: "Vibrant Bistro & Neon Glow",
    description: "Dark gastropub badge with illuminated neon food motif, vivid radial backlight, and punchy contemporary aesthetic.",
    badgeStyle: "neon_glow",
    promptDirective: "An energetic gastropub emblem with vibrant glowing neon vector lines for the food/cocktail motif.",
  },
};

// Rich Color Palettes
const PALETTES: Record<string, { primary: string; accent: string; secondary: string; glow: string; bg: string }> = {
  crimson: {
    primary: "#DC2626",
    accent: "#F97316",
    secondary: "#FBBF24",
    glow: "#EF4444",
    bg: "#150608",
  },
  amber: {
    primary: "#C2410C",
    accent: "#F59E0B",
    secondary: "#FDE68A",
    glow: "#FB923C",
    bg: "#160B05",
  },
  emerald: {
    primary: "#059669",
    accent: "#34D399",
    secondary: "#6EE7B7",
    glow: "#10B981",
    bg: "#051811",
  },
  gold: {
    primary: "#B45309",
    accent: "#FBBF24",
    secondary: "#FDE68A",
    glow: "#D97706",
    bg: "#130D05",
  },
  sapphire: {
    primary: "#1D4ED8",
    accent: "#38BDF8",
    secondary: "#93C5FD",
    glow: "#60A5FA",
    bg: "#081124",
  },
  neon: {
    primary: "#8B5CF6",
    accent: "#EC4899",
    secondary: "#38BDF8",
    glow: "#A855F7",
    bg: "#0D0A1C",
  },
  monochrome: {
    primary: "#94A3B8",
    accent: "#F8FAFC",
    secondary: "#E2E8F0",
    glow: "#CBD5E1",
    bg: "#0A0F1D",
  },
};

// Detect culinary motif type
function detectMotif(name: string, businessType: string, cuisine?: string): string {
  const combined = `${name} ${businessType} ${cuisine || ""}`.toLowerCase();
  if (combined.includes("pizza") || combined.includes("pizzeria") || combined.includes("slice") || combined.includes("crust") || combined.includes("italian")) return "pizza";
  if (combined.includes("burger") || combined.includes("patty") || combined.includes("grill") || combined.includes("bbq") || combined.includes("steak") || combined.includes("diner")) return "burger";
  if (combined.includes("cafe") || combined.includes("coffee") || combined.includes("roast") || combined.includes("espresso") || combined.includes("brew") || combined.includes("latte")) return "cafe";
  if (combined.includes("bakery") || combined.includes("bake") || combined.includes("pastry") || combined.includes("bread") || combined.includes("cake") || combined.includes("dessert")) return "bakery";
  if (combined.includes("bar") || combined.includes("pub") || combined.includes("cocktail") || combined.includes("lounge") || combined.includes("wine") || combined.includes("brewery") || combined.includes("spirits")) return "bar";
  if (combined.includes("indian") || combined.includes("biryani") || combined.includes("curry") || combined.includes("tandoor") || combined.includes("masala") || combined.includes("spice") || combined.includes("handi")) return "curry";
  if (combined.includes("hotel") || combined.includes("resort") || combined.includes("suites") || combined.includes("palace") || combined.includes("inn") || combined.includes("grand") || combined.includes("heritage")) return "hotel";
  return "fine_dining";
}

// Vector Food Motifs Engine (Produces rich colorful vector illustrations)
function getVectorFoodMotif(motifType: string, gradId: string, accentGradId: string): string {
  switch (motifType) {
    case "pizza":
      return `
        <!-- Artisan Pizza Slice -->
        <g transform="translate(150, 115) scale(0.95)">
          <!-- Crust Arc -->
          <path d="M-45 -25 Q0 -42 45 -25 C45 -25 40 -15 36 -12 Q0 -25 -36 -12 Z" fill="#D97706" stroke="#FBBF24" stroke-width="1.5" />
          <!-- Cheese Slice Body -->
          <path d="M-38 -15 Q0 -26 38 -15 L2 48 Q0 51 -2 48 Z" fill="#FBBF24" stroke="#F59E0B" stroke-width="1" />
          <!-- Melting Mozzarella Wave -->
          <path d="M-34 -12 Q-15 -18 0 -13 Q15 -18 34 -12 L15 15 Q0 25 -15 15 Z" fill="#FEF08A" opacity="0.9" />
          <!-- Pepperoni Rounds -->
          <circle cx="-14" cy="-2" r="7.5" fill="#DC2626" stroke="#991B1B" stroke-width="1.2" />
          <circle cx="-13" cy="-3" r="1.5" fill="#EF4444" />
          <circle cx="15" cy="4" r="8" fill="#DC2626" stroke="#991B1B" stroke-width="1.2" />
          <circle cx="16" cy="3" r="1.5" fill="#EF4444" />
          <circle cx="0" cy="22" r="6.5" fill="#DC2626" stroke="#991B1B" stroke-width="1.2" />
          <!-- Fresh Basil Leaf -->
          <path d="M-3 -4 C-8 -14 2 -18 4 -7 C6 4 -1 6 -3 -4 Z" fill="#16A34A" stroke="#22C55E" stroke-width="0.8" />
          <path d="M-1 -10 L1 -4" stroke="#86EFAC" stroke-width="0.8" />
          <!-- Vapor Swirls -->
          <path d="M-16 -38 Q-12 -46 -15 -52" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.4" />
          <path d="M12 -38 Q16 -46 13 -52" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.4" />
        </g>
      `;

    case "burger":
      return `
        <!-- Gourmet Stacked Burger -->
        <g transform="translate(150, 115) scale(0.95)">
          <!-- Top Sesame Bun -->
          <path d="M-38 -6 C-38 -32 38 -32 38 -6 Z" fill="url(#${gradId})" stroke="#F59E0B" stroke-width="1.5" />
          <!-- White Sesame Seeds -->
          <ellipse cx="-16" cy="-20" rx="2" ry="1.2" fill="#FFFFFF" opacity="0.85" transform="rotate(-15 -16 -20)" />
          <ellipse cx="0" cy="-24" rx="2" ry="1.2" fill="#FFFFFF" opacity="0.85" />
          <ellipse cx="16" cy="-19" rx="2" ry="1.2" fill="#FFFFFF" opacity="0.85" transform="rotate(15 16 -19)" />
          <ellipse cx="-8" cy="-14" rx="1.8" ry="1" fill="#FFFFFF" opacity="0.8" />
          <ellipse cx="8" cy="-13" rx="1.8" ry="1" fill="#FFFFFF" opacity="0.8" />
          <!-- Crisp Lettuce Ruffle -->
          <path d="M-42 -4 Q-35 2 -28 -3 Q-20 3 -12 -3 Q-4 3 4 -3 Q12 3 20 -3 Q28 3 35 -3 Q42 2 42 -4 Z" fill="#22C55E" stroke="#16A34A" stroke-width="1" />
          <!-- Ripe Tomato Slice -->
          <rect x="-36" y="-1" width="72" height="7" rx="3.5" fill="#DC2626" stroke="#B91C1C" stroke-width="0.8" />
          <!-- Melted Cheddar Drip -->
          <path d="M-34 7 L34 7 L28 17 L20 8 L10 18 L-2 8 L-14 18 L-26 8 Z" fill="#FBBF24" />
          <!-- Grilled Patty -->
          <rect x="-37" y="7" width="74" height="11" rx="5" fill="#451A03" stroke="#78350F" stroke-width="1" />
          <!-- Bottom Bun -->
          <path d="M-36 21 C-36 21 -36 31 0 31 C36 31 36 21 36 21 Z" fill="url(#${gradId})" stroke="#F59E0B" stroke-width="1.2" />
        </g>
      `;

    case "cafe":
      return `
        <!-- Artisan Barista Espresso Cup -->
        <g transform="translate(150, 115) scale(0.95)">
          <!-- Hot Steam Wisps -->
          <path d="M-12 -28 Q-6 -38 -10 -48 Q-14 -58 -8 -66" stroke="url(#${accentGradId})" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.75" />
          <path d="M4 -28 Q10 -38 6 -48 Q2 -58 8 -66" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.65" />
          <!-- Cup Body -->
          <path d="M-32 -18 L32 -18 C32 -18 30 18 0 20 C-30 18 -32 -18 -32 -18 Z" fill="url(#${gradId})" stroke="#FFFFFF" stroke-width="1.8" />
          <!-- Mug Handle -->
          <path d="M30 -10 C44 -10 44 10 26 12" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
          <!-- Saucer Plate -->
          <ellipse cx="0" cy="22" rx="42" ry="5.5" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.9" />
          <ellipse cx="0" cy="22" rx="36" ry="3.5" fill="url(#${accentGradId})" opacity="0.3" />
          <!-- Espresso Liquid Surface -->
          <ellipse cx="0" cy="-18" rx="30" ry="6.5" fill="#2E1004" />
          <!-- Latte Art Rosetta -->
          <path d="M0 -14 C-7 -20 0 -22 0 -22 C0 -22 7 -20 0 -14 Z" fill="#FEF3C7" />
          <path d="M0 -15 L0 -21" stroke="#2E1004" stroke-width="0.8" />
          <!-- Coffee Beans on Side -->
          <g transform="translate(-32, 24) rotate(-25)">
            <ellipse cx="0" cy="0" rx="5" ry="3.5" fill="#78350F" />
            <path d="M-3.5 0 Q0 2 3.5 0" stroke="#451A03" stroke-width="0.8" fill="none" />
          </g>
          <g transform="translate(32, 24) rotate(25)">
            <ellipse cx="0" cy="0" rx="5" ry="3.5" fill="#78350F" />
            <path d="M-3.5 0 Q0 2 3.5 0" stroke="#451A03" stroke-width="0.8" fill="none" />
          </g>
        </g>
      `;

    case "bar":
      return `
        <!-- Cocktail Coupe & Lounge Glass -->
        <g transform="translate(150, 112) scale(0.95)">
          <!-- Citrus Wheel on Rim -->
          <g transform="translate(22, -28)">
            <circle cx="0" cy="0" r="10" fill="#F59E0B" stroke="#FBBF24" stroke-width="1.2" />
            <circle cx="0" cy="0" r="8" fill="#FEF08A" opacity="0.4" />
            <line x1="0" y1="-7" x2="0" y2="7" stroke="#F59E0B" stroke-width="1" />
            <line x1="-7" y1="0" x2="7" y2="0" stroke="#F59E0B" stroke-width="1" />
            <line x1="-5" y1="-5" x2="5" y2="5" stroke="#F59E0B" stroke-width="0.8" />
            <line x1="5" y1="-5" x2="-5" y2="5" stroke="#F59E0B" stroke-width="0.8" />
          </g>
          <!-- Cocktail Glass Bowl -->
          <path d="M-34 -24 L34 -24 L0 10 Z" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linejoin="round" />
          <!-- Liquid Fill -->
          <path d="M-27 -16 L27 -16 L0 8 Z" fill="url(#${gradId})" opacity="0.85" />
          <!-- Glowing Olive on Pick -->
          <line x1="-12" y1="-28" x2="6" y2="0" stroke="#FFFFFF" stroke-width="1.2" opacity="0.8" />
          <circle cx="2" cy="-5" r="4.5" fill="#15803D" stroke="#4ADE80" stroke-width="1" />
          <circle cx="3" cy="-4" r="1.5" fill="#EF4444" />
          <!-- Stem & Base -->
          <line x1="0" y1="10" x2="0" y2="34" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
          <ellipse cx="0" cy="35" rx="22" ry="3.5" fill="none" stroke="#FFFFFF" stroke-width="2" />
          <!-- Sparkles -->
          <path d="M-22 -8 L-20 -4 L-16 -2 L-20 0 L-22 4 L-24 0 L-28 -2 L-24 -4 Z" fill="#FBBF24" opacity="0.8" />
        </g>
      `;

    case "curry":
      return `
        <!-- Royal Brass Handi & Spice Flame -->
        <g transform="translate(150, 114) scale(0.95)">
          <!-- Aromatic Steam Swirls -->
          <path d="M-10 -24 Q-5 -36 -12 -46 Q-18 -56 -10 -64" stroke="url(#${accentGradId})" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.8" />
          <path d="M10 -24 Q16 -36 8 -46 Q2 -56 12 -64" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.8" />
          <!-- Handi Pot Body -->
          <path d="M-36 -8 C-42 16 -18 32 0 32 C18 32 42 16 36 -8 Z" fill="url(#${gradId})" stroke="#FDE68A" stroke-width="1.8" />
          <!-- Pot Neck & Rim -->
          <ellipse cx="0" cy="-8" rx="34" ry="7" fill="#7C2D12" stroke="#FDE68A" stroke-width="1.8" />
          <!-- Curry Gravy with Saffron Glow -->
          <ellipse cx="0" cy="-7" rx="30" ry="5.5" fill="#EA580C" />
          <circle cx="0" cy="-7" r="4" fill="#FBBF24" opacity="0.9" />
          <!-- Pot Brass Handles -->
          <path d="M-35 -2 C-45 -2 -45 10 -35 10" fill="none" stroke="#FDE68A" stroke-width="2.5" stroke-linecap="round" />
          <path d="M35 -2 C45 -2 45 10 35 10" fill="none" stroke="#FDE68A" stroke-width="2.5" stroke-linecap="round" />
          <!-- Chili / Spice Emblem -->
          <path d="M-6 8 Q0 2 6 8 Q0 18 -6 8 Z" fill="#DC2626" stroke="#FBBF24" stroke-width="0.8" />
        </g>
      `;

    case "bakery":
      return `
        <!-- Golden Artisan Croissant & Wheat -->
        <g transform="translate(150, 115) scale(0.95)">
          <!-- Golden Crescent Croissant -->
          <path d="M-36 12 C-38 -12 -8 -26 0 -26 C8 -26 38 -12 36 12 C28 2 12 -6 0 -6 C-12 -6 -28 2 -36 12 Z" fill="url(#${gradId})" stroke="#FDE68A" stroke-width="1.8" />
          <!-- Croissant Flaky Segments -->
          <path d="M-18 -18 C-10 -12 -12 2 -18 8" stroke="#78350F" stroke-width="1.2" fill="none" opacity="0.7" />
          <path d="M0 -24 C0 -12 0 2 0 10" stroke="#78350F" stroke-width="1.2" fill="none" opacity="0.7" />
          <path d="M18 -18 C10 -12 12 2 18 8" stroke="#78350F" stroke-width="1.2" fill="none" opacity="0.7" />
          <!-- Flanking Wheat Sheaves -->
          <path d="M-28 -4 Q-36 -16 -44 -12 Q-36 -8 -28 -4" fill="#FBBF24" />
          <path d="M28 -4 Q36 -16 44 -12 Q36 -8 28 -4" fill="#FBBF24" />
          <!-- Star Accent -->
          <polygon points="0,20 2,24 6,24 3,27 4,31 0,28 -4,31 -3,27 -6,24 -2,24" fill="#FDE68A" />
        </g>
      `;

    case "hotel":
      return `
        <!-- Imperial 5-Star Hospitality Crown & Crest -->
        <g transform="translate(150, 112) scale(0.95)">
          <!-- Majestic Imperial Crown -->
          <path d="M-34 8 L-38 -18 L-18 -6 L0 -24 L18 -6 L38 -18 L34 8 Z" fill="url(#${gradId})" stroke="#FDE68A" stroke-width="1.8" stroke-linejoin="round" />
          <!-- Crown Pearl Tips -->
          <circle cx="-38" cy="-20" r="3" fill="#FFFFFF" stroke="#FBBF24" stroke-width="1" />
          <circle cx="-18" cy="-8" r="2.5" fill="#FFFFFF" stroke="#FBBF24" stroke-width="1" />
          <circle cx="0" cy="-26" r="3.5" fill="#FFFFFF" stroke="#FBBF24" stroke-width="1" />
          <circle cx="18" cy="-8" r="2.5" fill="#FFFFFF" stroke="#FBBF24" stroke-width="1" />
          <circle cx="38" cy="-20" r="3" fill="#FFFFFF" stroke="#FBBF24" stroke-width="1" />
          <!-- Crown Gemstones Band -->
          <rect x="-32" y="4" width="64" height="8" rx="2" fill="#78350F" stroke="#FDE68A" stroke-width="1" />
          <circle cx="-20" cy="8" r="2" fill="#DC2626" />
          <circle cx="0" cy="8" r="2.5" fill="#2563EB" />
          <circle cx="20" cy="8" r="2" fill="#16A34A" />
          <!-- Neoclassical Pillars / Base -->
          <line x1="-36" y1="20" x2="36" y2="20" stroke="#FDE68A" stroke-width="2" />
          <line x1="-28" y1="20" x2="-28" y2="34" stroke="#FDE68A" stroke-width="2" />
          <line x1="0" y1="20" x2="0" y2="34" stroke="#FDE68A" stroke-width="2" />
          <line x1="28" y1="20" x2="28" y2="34" stroke="#FDE68A" stroke-width="2" />
          <line x1="-36" y1="34" x2="36" y2="34" stroke="#FDE68A" stroke-width="2" />
        </g>
      `;

    default: // fine_dining
      return `
        <!-- Silver Cloche & Chef Crossed Cutlery -->
        <g transform="translate(150, 114) scale(0.95)">
          <!-- Rising Aroma Wisps -->
          <path d="M-8 -30 Q-4 -40 -8 -50" stroke="url(#${accentGradId})" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.8" />
          <path d="M8 -30 Q12 -40 8 -50" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.8" />
          <!-- Cloche Handle Knob -->
          <circle cx="0" cy="-25" r="4.5" fill="#FDE68A" stroke="#B45309" stroke-width="1" />
          <!-- Dome Cover -->
          <path d="M-36 -2 C-36 -28 36 -28 36 -2 Z" fill="url(#${gradId})" stroke="#FDE68A" stroke-width="1.8" />
          <!-- Dome Highlight Shimmer -->
          <path d="M-26 -4 C-26 -20 0 -22 6 -20" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.65" />
          <!-- Serving Platter Tray -->
          <rect x="-42" y="-2" width="84" height="6" rx="3" fill="#D97706" stroke="#FDE68A" stroke-width="1.2" />
          <!-- Crossed Chef Fork & Knife -->
          <g transform="translate(0, 16)" stroke="#FDE68A" stroke-width="1.8" stroke-linecap="round">
            <line x1="-18" y1="-6" x2="18" y2="18" />
            <line x1="18" y1="-6" x2="-18" y2="18" />
            <circle cx="0" cy="6" r="3.5" fill="#DC2626" stroke="#FDE68A" stroke-width="1" />
          </g>
          <!-- 3 Sparkle Stars -->
          <polygon points="-32,24 -30,28 -26,28 -29,31 -28,35 -32,32 -36,35 -35,31 -38,28 -34,28" fill="#FDE68A" />
          <polygon points="32,24 34,28 38,28 35,31 36,35 32,32 28,35 29,31 26,28 30,28" fill="#FDE68A" />
        </g>
      `;
  }
}

// Resilient Procedural Generator with Full Culinary Badges
function generateArchetypeProceduralSvg(
  name: string,
  businessType: string,
  cuisine: string,
  archetype: string,
  colorTheme: string,
  seed: number
): string {
  const brandName = (name || "DineFlow").trim();
  const pal = PALETTES[colorTheme] || PALETTES.gold;
  const motif = detectMotif(brandName, businessType, cuisine);

  const gradId = `grd_${archetype}_${seed}`;
  const accentGradId = `acc_${archetype}_${seed}`;
  const glowFilterId = `glow_${archetype}_${seed}`;

  const motifSvg = getVectorFoodMotif(motif, gradId, accentGradId);

  // Subtitle / Tagline
  const subtitle = motif === "pizza"
    ? "WOODFIRED PIZZERIA"
    : motif === "burger"
    ? "GOURMET KITCHEN & GRILL"
    : motif === "cafe"
    ? "ARTISAN CAFE & ROASTERY"
    : motif === "bar"
    ? "COCKTAIL BAR & LOUNGE"
    : motif === "curry"
    ? "ROYAL INDIAN CUISINE"
    : motif === "bakery"
    ? "ARTISAN BAKEHOUSE"
    : motif === "hotel"
    ? "LUXURY HOTEL & SUITES"
    : "FINE DINING & HOSPITALITY";

  // Archetype 1: Illustrated Culinary Emblem (Shield Badge with Ribbon Banner)
  if (archetype === "culinary_emblem" || archetype === "minimal") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${pal.primary}" />
      <stop offset="60%" stop-color="${pal.accent}" />
      <stop offset="100%" stop-color="${pal.secondary}" />
    </linearGradient>
    <linearGradient id="${accentGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="${pal.accent}" />
    </linearGradient>
    <radialGradient id="bg_glow_${seed}" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${pal.primary}" stop-opacity="0.35" />
      <stop offset="100%" stop-color="${pal.bg}" stop-opacity="1" />
    </radialGradient>
    <filter id="${glowFilterId}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Deep Studio Canvas -->
  <rect width="300" height="300" rx="36" fill="url(#bg_glow_${seed})" stroke="${pal.accent}" stroke-width="1.5" stroke-opacity="0.3" />

  <!-- Outer Crest Shield Frame -->
  <path d="M150 28 L218 56 L218 135 C218 178 150 206 150 206 C150 206 82 178 82 135 L82 56 Z" fill="${pal.bg}" fill-opacity="0.7" stroke="url(#${gradId})" stroke-width="2.5" />
  <path d="M150 36 L210 62 L210 132 C210 170 150 196 150 196 C150 196 90 170 90 132 L90 62 Z" fill="none" stroke="${pal.secondary}" stroke-width="1" stroke-dasharray="3 2" opacity="0.75" />

  <!-- Food Motif Illustration -->
  ${motifSvg}

  <!-- Banner Ribbon for Brand Name -->
  <path d="M48 214 L80 202 L220 202 L252 214 L232 232 L220 224 L80 224 L68 232 Z" fill="#0E121E" stroke="url(#${gradId})" stroke-width="1.8" />
  <text x="150" y="218" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${brandName.length > 14 ? 12.5 : 15.5}" font-weight="900" text-anchor="middle" fill="#FFFFFF" letter-spacing="1.5">${brandName.toUpperCase()}</text>

  <!-- Subtitle & Stars -->
  <text x="150" y="248" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="800" text-anchor="middle" fill="${pal.accent}" letter-spacing="3">${subtitle}</text>
  <circle cx="95" cy="245" r="1.5" fill="${pal.secondary}" />
  <circle cx="205" cy="245" r="1.5" fill="${pal.secondary}" />
</svg>`;
  }

  // Archetype 2: Modern Gastronomy Badge (Dual-Gradient Geometric)
  if (archetype === "modern_badge" || archetype === "luxury") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${pal.accent}" />
      <stop offset="50%" stop-color="${pal.primary}" />
      <stop offset="100%" stop-color="${pal.secondary}" />
    </linearGradient>
    <linearGradient id="${accentGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="${pal.accent}" />
    </linearGradient>
    <radialGradient id="hex_glow_${seed}" cx="50%" cy="42%" r="55%">
      <stop offset="0%" stop-color="${pal.primary}" stop-opacity="0.3" />
      <stop offset="100%" stop-color="${pal.bg}" stop-opacity="1" />
    </radialGradient>
  </defs>

  <rect width="300" height="300" rx="36" fill="url(#hex_glow_${seed})" stroke="${pal.primary}" stroke-width="2" stroke-opacity="0.4" />

  <!-- Modern Octagonal Badge Framing -->
  <polygon points="150,38 214,64 240,128 214,192 150,208 86,192 60,128 86,64" fill="none" stroke="url(#${gradId})" stroke-width="2.2" />
  <circle cx="150" cy="118" r="62" fill="${pal.primary}" fill-opacity="0.12" stroke="${pal.accent}" stroke-width="1.2" stroke-dasharray="4 3" />

  <!-- Food Motif Illustration -->
  ${motifSvg}

  <!-- Divider Accents -->
  <line x1="62" y1="216" x2="114" y2="216" stroke="${pal.primary}" stroke-width="1" opacity="0.6" />
  <circle cx="150" cy="216" r="3" fill="${pal.secondary}" />
  <line x1="186" y1="216" x2="238" y2="216" stroke="${pal.primary}" stroke-width="1" opacity="0.6" />

  <!-- Typography -->
  <text x="150" y="238" font-family="'Playfair Display', Georgia, -apple-system, serif" font-size="${brandName.length > 14 ? 13 : 16.5}" font-weight="900" text-anchor="middle" fill="#FFFFFF" letter-spacing="2">${brandName.toUpperCase()}</text>
  <text x="150" y="256" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="8" font-weight="800" text-anchor="middle" fill="${pal.accent}" letter-spacing="3.5">${subtitle} • EST. 2025</text>
</svg>`;
  }

  // Archetype 3: Heritage Artisan Stamp (Concentric Double-Ring Stamp)
  if (archetype === "artisan_stamp" || archetype === "artisan") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${pal.primary}" />
      <stop offset="100%" stop-color="${pal.accent}" />
    </linearGradient>
    <linearGradient id="${accentGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="${pal.secondary}" />
    </linearGradient>
    <radialGradient id="stamp_glow_${seed}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${pal.primary}" stop-opacity="0.25" />
      <stop offset="100%" stop-color="${pal.bg}" stop-opacity="1" />
    </radialGradient>
  </defs>

  <rect width="300" height="300" rx="36" fill="url(#stamp_glow_${seed})" stroke="${pal.accent}" stroke-width="1.5" stroke-opacity="0.3" />

  <!-- Concentric Circular Stamp Rings -->
  <circle cx="150" cy="115" r="76" fill="none" stroke="url(#${gradId})" stroke-width="2" />
  <circle cx="150" cy="115" r="68" fill="${pal.primary}" fill-opacity="0.1" stroke="${pal.secondary}" stroke-width="1.2" stroke-dasharray="3 3" />
  <circle cx="150" cy="115" r="54" fill="none" stroke="${pal.accent}" stroke-width="1" opacity="0.6" />

  <!-- Food Motif Illustration -->
  ${motifSvg}

  <!-- Curved Laurel Botanical Flourish -->
  <path d="M78 120 C76 80 100 52 130 46" fill="none" stroke="${pal.secondary}" stroke-width="1.5" stroke-linecap="round" opacity="0.8" />
  <path d="M222 120 C224 80 200 52 170 46" fill="none" stroke="${pal.secondary}" stroke-width="1.5" stroke-linecap="round" opacity="0.8" />

  <!-- Brand Typography -->
  <text x="150" y="228" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${brandName.length > 14 ? 13 : 16}" font-weight="900" text-anchor="middle" fill="#FFFFFF" letter-spacing="2">${brandName.toUpperCase()}</text>
  <text x="150" y="248" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="700" text-anchor="middle" fill="${pal.accent}" letter-spacing="3.5">${subtitle}</text>
  <text x="150" y="262" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="7.5" font-weight="600" text-anchor="middle" fill="${pal.secondary}" letter-spacing="2">AUTHENTIC RECIPES • HANDCRAFTED</text>
</svg>`;
  }

  // Archetype 4: Vibrant Bistro & Neon Glow (Gastropub Neon Badge)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${pal.primary}" />
      <stop offset="100%" stop-color="${pal.accent}" />
    </linearGradient>
    <linearGradient id="${accentGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="${pal.accent}" />
    </linearGradient>
    <radialGradient id="neon_radial_${seed}" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="${pal.glow}" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#080712" stop-opacity="1" />
    </radialGradient>
    <filter id="${glowFilterId}" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <rect width="300" height="300" rx="36" fill="url(#neon_radial_${seed})" stroke="${pal.accent}" stroke-width="2" stroke-opacity="0.5" />

  <!-- Glowing Neon Outer Ring -->
  <circle cx="150" cy="116" r="68" fill="none" stroke="${pal.glow}" stroke-width="3" filter="url(#${glowFilterId})" opacity="0.6" />
  <circle cx="150" cy="116" r="68" fill="none" stroke="#FFFFFF" stroke-width="1.5" />
  <circle cx="150" cy="116" r="58" fill="${pal.primary}" fill-opacity="0.15" stroke="${pal.accent}" stroke-width="1" stroke-dasharray="4 2" />

  <!-- Food Motif Illustration -->
  ${motifSvg}

  <!-- Neon Underline Bar -->
  <rect x="80" y="204" width="140" height="2" rx="1" fill="${pal.accent}" filter="url(#${glowFilterId})" />

  <!-- Bold Typography -->
  <text x="150" y="230" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${brandName.length > 14 ? 13.5 : 17}" font-weight="900" text-anchor="middle" fill="#FFFFFF" letter-spacing="2.5">${brandName.toUpperCase()}</text>
  <text x="150" y="250" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="800" text-anchor="middle" fill="${pal.accent}" letter-spacing="4">${subtitle}</text>
</svg>`;
}

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
        temperature: 0.85,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini ${model} returned HTTP ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  const cleaned = sanitizeSvg(text);
  return cleaned && cleaned.length > 250 ? cleaned : null;
}

async function createArchetypeLogo(
  archetypeKey: string,
  brandName: string,
  businessType: string,
  cuisine: string,
  vibe: string,
  primaryColor: string,
  keywords: string,
  apiKey: string
): Promise<LogoVariation> {
  const arc = ARCHETYPE_CONFIGS[archetypeKey] || ARCHETYPE_CONFIGS.culinary_emblem;
  const pal = PALETTES[primaryColor] || PALETTES.gold;
  const motif = detectMotif(brandName, businessType, cuisine);
  const uniqueSeed = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const prompt = `You are a world-class hospitality brand identity designer. Create an iconic, colorful, production-grade vector logo for:
Brand Name: "${brandName}"
Hospitality Category: ${businessType}
Cuisine / Specialty: ${cuisine || motif}
Detected Food Motif: ${motif} (must prominently feature authentic culinary elements like pizza slice, gourmet burger, barista espresso cup, cloche with steam, Indian handi/curry, cocktail coupe, or hotel crest)
Design Archetype: ${arc.title} (${arc.description})
Creative Directive: ${arc.promptDirective}
Color Palette: Primary: ${pal.primary}, Accent: ${pal.accent}, Highlight: ${pal.secondary}, Background: ${pal.bg}
Additional Keywords: ${keywords || "delicious, appetizing, luxury, memorable hospitality branding"}
Unique Session Seed: ${uniqueSeed}

STRICT TECHNICAL RULES:
1. Output ONLY pure valid SVG markup starting with <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"> and ending with </svg>.
2. Do NOT output markdown ticks (\`\`\`xml or \`\`\`svg), no conversational text.
3. Incorporate rich multi-stop <linearGradient> or <radialGradient> definitions inside <defs>.
4. MUST include a rich, colorful food illustration or hospitality motif matching "${motif}" (e.g. melting cheese, pepperoni, latte art heart, steam swirls, cloche lid, burger layers, cocktail glass, spices).
5. Render the brand name "${brandName}" in clean high-contrast typography with balanced letterforms.
6. Include a dark, rich background rect with rounded corners (rx="36").
7. Ensure all vector paths are closed, clean, and visually stunning.`;

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
              secondary: pal.secondary,
              bg: pal.bg,
            },
          };
        }
      } catch (err) {
        console.warn(`[generate-logo] Model ${model} failed for ${archetypeKey}:`, err);
      }
    }
  }

  // Resilient fallback with full colorful food emblems
  const proceduralSvg = generateArchetypeProceduralSvg(
    brandName,
    businessType,
    cuisine,
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
      secondary: pal.secondary,
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
      cuisine = "continental",
      vibe = "culinary_excellence",
      primaryColor = "gold",
      keywords = "",
      mode = "all",
      archetype = "culinary_emblem",
    } = body;

    const brandName = (name || "DineFlow").trim();
    const apiKey = getGeminiApiKey();

    if (mode === "single") {
      const singleVariation = await createArchetypeLogo(
        archetype,
        brandName,
        businessType,
        cuisine,
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
        model: singleVariation.model,
      });
    }

    // Generate 4 Distinct Creative Archetypes Concurrently
    const targetArchetypes = [
      "culinary_emblem",
      "modern_badge",
      "artisan_stamp",
      "neon_bistro",
    ];

    const results = await Promise.allSettled(
      targetArchetypes.map((arc) =>
        createArchetypeLogo(
          arc,
          brandName,
          businessType,
          cuisine,
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
      const arc = targetArchetypes[index];
      const pal = PALETTES[primaryColor] || PALETTES.gold;
      const fallbackSvg = generateArchetypeProceduralSvg(
        brandName,
        businessType,
        cuisine,
        arc,
        primaryColor,
        Date.now() + index
      );
      return {
        id: arc,
        title: ARCHETYPE_CONFIGS[arc]?.title || "Culinary Brand Logo",
        description: ARCHETYPE_CONFIGS[arc]?.description || "Handcrafted vector identity",
        svg: fallbackSvg,
        dataUri: `data:image/svg+xml;utf8,${encodeURIComponent(fallbackSvg)}`,
        source: "procedural",
        palette: {
          primary: pal.primary,
          accent: pal.accent,
          secondary: pal.secondary,
          bg: pal.bg,
        },
      };
    });

    const primaryVariation = variations[0];

    return NextResponse.json({
      ok: true,
      variations,
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
