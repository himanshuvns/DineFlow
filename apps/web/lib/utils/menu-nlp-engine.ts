import {
  INDIAN_CATEGORIES,
  INDIAN_DISH_CATALOG,
  OCR_TYPO_CORRECTIONS,
  IndianDishEntry,
} from "../data/indian-food-database";
import type { MenuItem } from "../stores/tenant-data-store";

export interface ParsedMenuItem {
  tempId: string;
  name: string;
  hindiName?: string;
  category: string;
  price: number;
  isVeg: boolean;
  spicyLevel: number;
  prepTimeMinutes: number;
  desc: string;
  imageUrl?: string;
  rawText: string;
  confidence: number; // 0 to 1
  isDuplicate?: boolean;
  duplicateAction?: "merge" | "distinct";
  matchedExistingItem?: MenuItem;
}

/**
 * Non-Veg keywords that decisively flag an item as Non-Vegetarian.
 */
const NON_VEG_PATTERNS = [
  /\bchicken\b/i,
  /\bmurgh\b/i,
  /\bmurg\b/i,
  /\bmutton\b/i,
  /\bgosht\b/i,
  /\blamb\b/i,
  /\bfish\b/i,
  /\bprawn\b/i,
  /\bprawns\b/i,
  /\begg\b/i,
  /\banda\b/i,
  /\bkeema\b/i,
  /\bkheema\b/i,
  /\bcrabs?\b/i,
  /\bseafood\b/i,
  /\bpork\b/i,
  /\bbeef\b/i,
  /\bnon[- ]?veg\b/i,
  /\(nv\)/i,
  /\[nv\]/i,
  /🔴/,
  /🟥/,
];

/**
 * Pure Veg keywords that reinforce a vegetarian classification.
 */
const VEG_PATTERNS = [
  /\bpaneer\b/i,
  /\bpanner\b/i,
  /\bdal\b/i,
  /\bdaal\b/i,
  /\bmakhani\b/i,
  /\bmushroom\b/i,
  /\baloo\b/i,
  /\bgobi\b/i,
  /\bdosa\b/i,
  /\bidli\b/i,
  /\bvada\b/i,
  /\bupma\b/i,
  /\bpoha\b/i,
  /\bparatha\b/i,
  /\bveg\b/i,
  /\bshakahari\b/i,
  /\(v\)/i,
  /\[v\]/i,
  /🟢/,
  /🟩/,
];

/**
 * Extract clean numeric price from a line of text.
 * Matches: ₹280, Rs. 280, Rs280, 280/-, 280.00, INR 280, or trailing numbers.
 */
export function extractPrice(text: string): { price: number; cleanText: string } | null {
  // 1. Check for explicit currency symbols or markers
  const explicitRegex = /(?:₹|rs\.?|inr)\s*([0-9]+(?:\.[0-9]{1,2})?)|([0-9]+(?:\.[0-9]{1,2})?)\s*(?:\/-|\s*\/-)/i;
  const explicitMatch = text.match(explicitRegex);
  if (explicitMatch) {
    const rawVal = explicitMatch[1] || explicitMatch[2];
    const price = parseFloat(rawVal);
    if (!isNaN(price) && price > 0 && price < 50000) {
      const cleanText = text.replace(explicitMatch[0], "").trim();
      return { price, cleanText };
    }
  }

  // 2. Trailing price at the end of the line (e.g. "Paneer Tikka 290" or "Dal Makhani .... 240")
  const trailingRegex = /[\s\.\-]+([0-9]{2,5})(?:\.[0-9]{2})?\s*$/;
  const trailingMatch = text.match(trailingRegex);
  if (trailingMatch) {
    const price = parseFloat(trailingMatch[1]);
    if (!isNaN(price) && price >= 20 && price < 50000) {
      const cleanText = text.replace(trailingRegex, "").trim();
      return { price, cleanText };
    }
  }

  return null;
}

/**
 * Determine vegetarian status based on keywords and dietary indicators.
 */
export function detectIsVeg(text: string): boolean {
  for (const pattern of NON_VEG_PATTERNS) {
    if (pattern.test(text)) return false;
  }
  for (const pattern of VEG_PATTERNS) {
    if (pattern.test(text)) return true;
  }
  return true; // Default to Vegetarian for Indian restaurant menus if unspecified
}

/**
 * Cleans OCR artifacts, dashes, and autocorrects common Indian dish typos.
 */
export function normalizeDishText(text: string): string {
  let cleaned = text
    .replace(/[•\*\_\~\|\…\.\.\.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Word-by-word typo correction
  const words = cleaned.split(" ");
  const corrected = words.map((w) => {
    const lower = w.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (OCR_TYPO_CORRECTIONS[lower]) {
      return OCR_TYPO_CORRECTIONS[lower];
    }
    return w;
  });

  return corrected.join(" ");
}

/**
 * Match a dish name against our catalog to infer category, descriptions, and spice levels.
 */
export function matchCatalogDish(dishName: string): IndianDishEntry | null {
  const normInput = dishName.toLowerCase().replace(/[^a-z0-9]/g, "");

  // 1. Direct exact or alias match
  for (const entry of INDIAN_DISH_CATALOG) {
    const normCatalog = entry.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normInput === normCatalog) return entry;

    if (entry.aliases) {
      for (const alias of entry.aliases) {
        if (normInput === alias.toLowerCase().replace(/[^a-z0-9]/g, "")) {
          return entry;
        }
      }
    }
  }

  // 2. Substring or keyword match
  for (const entry of INDIAN_DISH_CATALOG) {
    const catalogTokens = entry.name.toLowerCase().split(" ");
    const matchCount = catalogTokens.filter((token) =>
      dishName.toLowerCase().includes(token)
    ).length;

    if (matchCount >= 2 || (catalogTokens.length === 1 && matchCount === 1)) {
      return entry;
    }
  }

  return null;
}

/**
 * Classify text into one of the 12 Indian Categories.
 */
export function inferCategory(text: string, dishMatch?: IndianDishEntry | null): string {
  if (dishMatch) return dishMatch.category;

  const lower = text.toLowerCase();

  if (/poha|upma|idli|vada|dosa|paratha|bhature|breakfast|morning/i.test(lower)) return "Breakfast";
  if (/paneer|butter chicken|dal makhani|kadhai|naan|roti|shahi|tikka|curry|masala/i.test(lower)) return "North Indian";
  if (/dosa|uttapam|appam|sambar|rasam|south|chutney|curd rice/i.test(lower)) return "South Indian";
  if (/puri|bhel|sev|chaat|pav bhaji|vada pav|dabeli|kathi|roll|street/i.test(lower)) return "Street Food";
  if (/noodles|fried rice|manchurian|chilli|chowmein|chinese|schezwan|hakka/i.test(lower)) return "Indian Chinese";
  if (/biryani|pulao|rice|dum/i.test(lower)) return "Biryani";
  if (/samosa|pakoda|fries|toast|garlic bread|snack/i.test(lower)) return "Snacks";
  if (/chai|tea|coffee|lassi|chaas|buttermilk|shake|soda|mocktail|drink|beverage/i.test(lower)) return "Beverages";
  if (/gulab jamun|rasmalai|jalebi|kulfi|ice cream|halwa|dessert|sweet/i.test(lower)) return "Desserts";
  if (/pizza|margherita|crust/i.test(lower)) return "Pizza";
  if (/burger|patty|bun/i.test(lower)) return "Burgers";
  if (/thali|combo|platter|family pack|meal box/i.test(lower)) return "Combo Meals";

  return "North Indian";
}

/**
 * Fuzzy similarity comparison between two strings (Dice coefficient on bigrams).
 */
export function calculateSimilarity(s1: string, s2: string): number {
  const clean1 = s1.toLowerCase().replace(/[^a-z0-9]/g, "");
  const clean2 = s2.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (clean1 === clean2) return 1.0;
  if (clean1.length < 2 || clean2.length < 2) return 0.0;

  const getBigrams = (str: string) => {
    const s = new Set<string>();
    for (let i = 0; i < str.length - 1; i++) {
      s.add(str.slice(i, i + 2));
    }
    return s;
  };

  const b1 = getBigrams(clean1);
  const b2 = getBigrams(clean2);

  let intersection = 0;
  b1.forEach((bg) => {
    if (b2.has(bg)) intersection++;
  });

  return (2.0 * intersection) / (b1.size + b2.size);
}

/**
 * Main parser: takes raw OCR text output and converts into structured candidate dishes.
 */
export function parseMenuOcrText(
  rawOcrText: string,
  existingItems: MenuItem[] = []
): ParsedMenuItem[] {
  const lines = rawOcrText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const results: ParsedMenuItem[] = [];

  let currentCategory = "North Indian";

  for (const line of lines) {
    // 1. Check if the line is a section/category header
    const cleanHeader = line.replace(/^[#\*\-—\s]+|[#\*\-—\s]+$/g, "").trim();
    const matchedCategory = INDIAN_CATEGORIES.find(
      (cat) => cat.toLowerCase() === cleanHeader.toLowerCase() ||
               cleanHeader.toLowerCase().includes(cat.toLowerCase())
    );

    if (matchedCategory && !/[0-9]/.test(cleanHeader)) {
      currentCategory = matchedCategory;
      continue;
    }

    // 2. Check if line contains a dish + price
    const priceExtraction = extractPrice(line);
    if (!priceExtraction) continue;

    const { price, cleanText } = priceExtraction;
    const normalizedName = normalizeDishText(cleanText);

    // Discard lines that are too short or just numbers
    if (normalizedName.length < 3 || /^\d+$/.test(normalizedName)) continue;

    // 3. Match against catalog for rich defaults
    const catalogMatch = matchCatalogDish(normalizedName);
    const category = catalogMatch ? catalogMatch.category : inferCategory(normalizedName, catalogMatch) || currentCategory;
    const isVeg = catalogMatch ? catalogMatch.isVeg : detectIsVeg(line);
    const spicyLevel = catalogMatch ? catalogMatch.spicyLevel : (isVeg ? 1 : 2);
    const prepTimeMinutes = catalogMatch ? catalogMatch.prepTimeMinutes : 15;
    const desc = catalogMatch ? catalogMatch.desc : "Prepared fresh to order by the culinary team.";
    const imageUrl = catalogMatch?.imageUrl;
    const hindiName = catalogMatch?.hindiName;

    // 4. Check for duplicates against existing menu
    let isDuplicate = false;
    let matchedExisting: MenuItem | undefined;

    for (const existing of existingItems) {
      const sim = calculateSimilarity(normalizedName, existing.name);
      if (sim >= 0.78) {
        isDuplicate = true;
        matchedExisting = existing;
        break;
      }
    }

    results.push({
      tempId: `parsed_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: catalogMatch ? catalogMatch.name : normalizedName,
      hindiName,
      category,
      price,
      isVeg,
      spicyLevel,
      prepTimeMinutes,
      desc,
      imageUrl,
      rawText: line,
      confidence: catalogMatch ? 0.96 : 0.85,
      isDuplicate,
      duplicateAction: isDuplicate ? "merge" : "distinct",
      matchedExistingItem: matchedExisting,
    });
  }

  return results;
}

/**
 * Enriches raw items extracted via Gemini Multimodal Vision with catalog presets and duplicate detection.
 */
export function enrichRawExtractedItems(
  items: Array<{
    name: string;
    hindiName?: string;
    category?: string;
    price?: number;
    isVeg?: boolean;
    description?: string;
    spicyLevel?: number;
  }>,
  existingItems: MenuItem[] = []
): ParsedMenuItem[] {
  return items.map((raw) => {
    const cleanName = normalizeDishText(raw.name);
    const catalogMatch = matchCatalogDish(cleanName);

    const name = catalogMatch ? catalogMatch.name : (raw.name || cleanName);
    const hindiName = raw.hindiName || catalogMatch?.hindiName || "";
    const category = raw.category || catalogMatch?.category || "North Indian";
    const price = typeof raw.price === "number" && !isNaN(raw.price) ? raw.price : 0;
    const isVeg = typeof raw.isVeg === "boolean" ? raw.isVeg : (catalogMatch?.isVeg ?? detectIsVeg(cleanName));
    const spicyLevel = typeof raw.spicyLevel === "number" ? raw.spicyLevel : (catalogMatch?.spicyLevel ?? (isVeg ? 1 : 2));
    const prepTimeMinutes = catalogMatch?.prepTimeMinutes ?? 15;
    const desc = raw.description || catalogMatch?.desc || "Authentic recipe prepared fresh to order.";
    const imageUrl = catalogMatch?.imageUrl;

    // Check duplicate against existing menu items
    let isDuplicate = false;
    let matchedExisting: MenuItem | undefined;

    for (const existing of existingItems) {
      const sim = calculateSimilarity(name, existing.name);
      if (sim >= 0.78) {
        isDuplicate = true;
        matchedExisting = existing;
        break;
      }
    }

    return {
      tempId: `parsed_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      hindiName,
      category,
      price,
      isVeg,
      spicyLevel,
      prepTimeMinutes,
      desc,
      imageUrl,
      rawText: `${name} ${price > 0 ? `₹${price}` : ""}`,
      confidence: 0.98,
      isDuplicate,
      duplicateAction: isDuplicate ? "merge" : "distinct",
      matchedExistingItem: matchedExisting,
    };
  });
}
