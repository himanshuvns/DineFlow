/**
 * Category utility functions for standardizing, formatting,
 * and deduplicating menu category names across DineFlow.
 */

/**
 * Format any category string into clean, human-readable Title Case.
 * Handles uppercase OCR output (e.g. "COFFEE" -> "Coffee", "TEA & MORE" -> "Tea & More"),
 * trims stray characters and extra spaces.
 */
export function formatCategoryName(name: string | undefined | null): string {
  if (!name || typeof name !== "string") return "General";
  const trimmed = name.trim().replace(/^[#\*\-—:_\|\s]+|[#\*\-—:_\|\s]+$/g, "");
  if (!trimmed) return "General";

  return trimmed
    .split(/\s+/)
    .map((word, idx) => {
      const lower = word.toLowerCase();
      // Keep connectors lowercase unless it's the very first word
      if (idx > 0 && ["and", "or", "of", "with", "in", "the", "&"].includes(lower)) {
        return lower === "&" ? "&" : lower;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/**
 * Returns a normalized key for case-insensitive and whitespace-insensitive category matching.
 */
export function normalizeCategoryKey(name: string | undefined | null): string {
  if (!name || typeof name !== "string") return "general";
  return name.trim().toLowerCase();
}

/**
 * Checks if two category names refer to the same category (case & space insensitive).
 */
export function isCategoryMatch(
  cat1: string | undefined | null,
  cat2: string | undefined | null
): boolean {
  return normalizeCategoryKey(cat1) === normalizeCategoryKey(cat2);
}

/**
 * Deduplicates a list of categories case-insensitively,
 * standardizing each category name to Title Case.
 * Removes empty/placeholder "General" if other valid categories exist.
 */
export function deduplicateCategories(
  categories: (string | undefined | null)[],
  options: { removePlaceholderGeneral?: boolean } = {}
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of categories) {
    if (!raw || typeof raw !== "string") continue;
    const formatted = formatCategoryName(raw);
    const key = normalizeCategoryKey(formatted);

    if (key && !seen.has(key)) {
      seen.add(key);
      result.push(formatted);
    }
  }

  if (options.removePlaceholderGeneral && result.length > 1) {
    return result.filter((c) => normalizeCategoryKey(c) !== "general");
  }

  return result.length > 0 ? result : ["General"];
}
