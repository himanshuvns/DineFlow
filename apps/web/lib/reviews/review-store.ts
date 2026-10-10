"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ReviewFeedback {
  id: string;
  tenantSlug: string;
  rating: number; // 1 to 5
  categories: string[];
  comment: string;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  tableOrRoom?: string;
  status: "new" | "in_review" | "resolved";
  resolutionNotes?: string;
  createdAt: string;
}

export interface ReviewConfig {
  tenantSlug: string;
  googlePlaceId: string;
  googleReviewUrl: string;
  standCallToAction: string;
  standSubtitle: string;
  standTheme: "dark" | "emerald" | "gold" | "minimal";
  standSize: "a5" | "a6" | "dl";
  totalScans: number;
  fiveStarCount: number;
  shieldedCount: number;
}

export const DEFAULT_VIBES = [
  "Delicious Food 🍕",
  "Great Ambience ✨",
  "Fast Service ⚡",
  "Friendly Staff 🤝",
  "Value for Money 💰",
  "Signature Drinks 🍹",
  "Impeccable Hygiene 🧼",
  "Cozy Vibe 🕯️",
];

export const SHIELD_CATEGORIES = [
  "Food Quality",
  "Long Wait Time",
  "Order Error",
  "Staff Behavior",
  "Billing Issue",
  "Cleanliness / Ambience",
];

const INITIAL_FEEDBACKS: ReviewFeedback[] = [];

interface ReviewStoreState {
  configs: Record<string, ReviewConfig>;
  feedbacks: ReviewFeedback[];
  getConfig: (slug: string) => ReviewConfig;
  updateConfig: (slug: string, updates: Partial<ReviewConfig>) => void;
  addFeedback: (fb: Omit<ReviewFeedback, "id" | "createdAt" | "status">) => ReviewFeedback;
  updateFeedbackStatus: (id: string, status: "new" | "in_review" | "resolved", notes?: string) => void;
  recordScan: (slug: string) => void;
  recordFiveStar: (slug: string) => void;
}

export const useReviewStore = create<ReviewStoreState>()(
  persist(
    (set, get) => ({
      configs: {},
      feedbacks: INITIAL_FEEDBACKS,

      getConfig: (slug: string) => {
        const cleanSlug = slug || "the-grand-bistro";
        const current = get().configs[cleanSlug];
        if (current) return current;

        const defaultUrl = `https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4`;
        const newConfig: ReviewConfig = {
          tenantSlug: cleanSlug,
          googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
          googleReviewUrl: defaultUrl,
          standCallToAction: "Loved your meal? Scan to rate us!",
          standSubtitle: "Takes 15 seconds • AI Review Assistant ✨",
          standTheme: "dark",
          standSize: "a5",
          totalScans: 0,
          fiveStarCount: 0,
          shieldedCount: 0,
        };

        set((state) => ({
          configs: { ...state.configs, [cleanSlug]: newConfig },
        }));
        return newConfig;
      },

      updateConfig: (slug: string, updates: Partial<ReviewConfig>) => {
        const cleanSlug = slug || "the-grand-bistro";
        const current = get().getConfig(cleanSlug);
        set((state) => ({
          configs: {
            ...state.configs,
            [cleanSlug]: { ...current, ...updates },
          },
        }));
      },

      addFeedback: (fb) => {
        const newFeedback: ReviewFeedback = {
          ...fb,
          id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          status: "new",
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const slug = fb.tenantSlug || "the-grand-bistro";
          const currentConfig = state.configs[slug] || get().getConfig(slug);
          return {
            feedbacks: [newFeedback, ...state.feedbacks],
            configs: {
              ...state.configs,
              [slug]: {
                ...currentConfig,
                shieldedCount: (currentConfig.shieldedCount || 0) + 1,
              },
            },
          };
        });

        return newFeedback;
      },

      updateFeedbackStatus: (id, status, notes) => {
        set((state) => ({
          feedbacks: state.feedbacks.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status,
                  ...(notes !== undefined ? { resolutionNotes: notes } : {}),
                }
              : item
          ),
        }));
      },

      recordScan: (slug: string) => {
        const cleanSlug = slug || "the-grand-bistro";
        const current = get().getConfig(cleanSlug);
        set((state) => ({
          configs: {
            ...state.configs,
            [cleanSlug]: {
              ...current,
              totalScans: (current.totalScans || 0) + 1,
            },
          },
        }));
      },

      recordFiveStar: (slug: string) => {
        const cleanSlug = slug || "the-grand-bistro";
        const current = get().getConfig(cleanSlug);
        set((state) => ({
          configs: {
            ...state.configs,
            [cleanSlug]: {
              ...current,
              fiveStarCount: (current.fiveStarCount || 0) + 1,
            },
          },
        }));
      },
    }),
    {
      name: "dineflow_review_store",
    }
  )
);

/**
 * Generates 3 authentic, varied review drafts tailored to selected vibes and restaurant name.
 */
export function generateAIReviewOptions(restaurantName: string, vibes: string[]): Array<{
  badge: string;
  tone: string;
  text: string;
}> {
  const name = restaurantName || "this restaurant";
  const cleanVibes = vibes.map((v) => v.replace(/[^\w\s]/g, "").trim()).filter(Boolean);

  const hasFood = cleanVibes.some((v) => /food|delicious|taste|flavor/i.test(v));
  const hasAmbience = cleanVibes.some((v) => /ambience|atmosphere/i.test(v));
  const hasService = cleanVibes.some((v) => /service|fast|quick/i.test(v));
  const hasStaff = cleanVibes.some((v) => /staff|friendly|hospitality/i.test(v));
  const hasValue = cleanVibes.some((v) => /value|price|money/i.test(v));
  const hasDrinks = cleanVibes.some((v) => /drink|beverage|cocktail|mocktail/i.test(v));
  const hasHygiene = cleanVibes.some((v) => /hygiene|clean|spotless/i.test(v));
  const hasCozy = cleanVibes.some((v) => /cozy|comfort/i.test(v));

  // Clean fallback when no tags are selected
  if (cleanVibes.length === 0) {
    return [
      {
        badge: "Foodie Favorite",
        tone: "Sensory & Passionate",
        text: `Had an outstanding dining experience at ${name}! Everything exceeded expectations. Definitely coming back soon with family and friends!`,
      },
      {
        badge: "Punchy & Direct",
        tone: "Crisp & High Impact",
        text: `10/10 dining at ${name}! Great quality, attentive care, and welcoming energy throughout. Highly recommended!`,
      },
      {
        badge: "Warm & Heartfelt",
        tone: "Memorable Experience",
        text: `From the moment we walked into ${name}, the experience was memorable. A true gem that nails consistency and quality!`,
      },
    ];
  }

  // --- Option 1: Complete Experience (Foodie & Passionate) ---
  const s1Sentences: string[] = [];

  if (hasFood && hasDrinks) {
    s1Sentences.push(`The food was prepared to absolute perfection with incredible flavors, and the signature drinks were creative and refreshing.`);
  } else if (hasFood) {
    s1Sentences.push(`The food was prepared to absolute perfection, with rich, authentic flavors in every single dish.`);
  } else if (hasDrinks) {
    s1Sentences.push(`The signature drinks were expertly crafted, refreshing, and full of flavor.`);
  }

  if (hasAmbience && hasCozy) {
    s1Sentences.push(`The ambience is gorgeous with warm, cozy lighting that creates an intimate, relaxing vibe.`);
  } else if (hasAmbience) {
    s1Sentences.push(`The aesthetic decor and ambient music create a wonderfully stylish dining atmosphere.`);
  } else if (hasCozy) {
    s1Sentences.push(`The seating is wonderfully comfortable and the cozy vibe makes you want to linger.`);
  }

  if (hasService && hasStaff) {
    s1Sentences.push(`Service was remarkably fast and efficient, and the staff treated us with genuine warmth and attentiveness.`);
  } else if (hasService) {
    s1Sentences.push(`Service was remarkably fast and efficient without feeling rushed.`);
  } else if (hasStaff) {
    s1Sentences.push(`The team greeted us with genuine smiles and provided thoughtful, attentive hospitality.`);
  }

  if (hasHygiene && hasValue) {
    s1Sentences.push(`On top of that, the entire venue was spotlessly clean, and the generous portions offer fantastic value for money.`);
  } else if (hasHygiene) {
    s1Sentences.push(`We were especially impressed by the spotless hygiene and how clean and tidy everything was kept.`);
  } else if (hasValue) {
    s1Sentences.push(`The generous portion sizes and reasonable pricing offer fantastic value for money.`);
  }

  const opt1 = `Outstanding visit to ${name}! ${s1Sentences.join(" ")} Highly recommended to anyone looking for a top-tier dining experience!`;

  // --- Option 2: Detailed Breakdown (Crisp & High Impact) ---
  const s2Points: string[] = [];
  if (hasFood) {
    s2Points.push(`Every course was packed with flavor and cooked with evident culinary skill.`);
  }
  if (hasDrinks) {
    s2Points.push(`Their craft beverages are top-notch and pair wonderfully with the meal.`);
  }
  if (hasAmbience || hasCozy) {
    s2Points.push(`The atmosphere is stylish, beautifully lit, and exceptionally inviting.`);
  }
  if (hasService) {
    s2Points.push(`Turnaround from kitchen to table was impressively quick.`);
  }
  if (hasStaff) {
    s2Points.push(`The staff was courteous, polite, and on top of every detail.`);
  }
  if (hasHygiene) {
    s2Points.push(`Strict hygiene standards are obvious—the space is immaculate from corner to corner.`);
  }
  if (hasValue) {
    s2Points.push(`Portions are generous and pricing is very fair for the quality.`);
  }

  const opt2 = `10/10 across the board at ${name}! ${s2Points.join(" ")} Easily one of the best dining decisions we've made recently.`;

  // --- Option 3: Warm Recommendation (Memorable & Heartfelt) ---
  const s3Sentences: string[] = [];
  const activeHighlights: string[] = [];
  if (hasFood) activeHighlights.push("mouthwatering food");
  if (hasDrinks) activeHighlights.push("crafted drinks");
  if (hasAmbience || hasCozy) activeHighlights.push("captivating atmosphere");
  if (hasStaff) activeHighlights.push("heartfelt hospitality");
  if (hasService) activeHighlights.push("swift service");
  if (hasHygiene) activeHighlights.push("spotless hygiene");
  if (hasValue) activeHighlights.push("unbeatable value");

  const highlightPhrase = activeHighlights.length > 1
    ? `${activeHighlights.slice(0, -1).join(", ")} and ${activeHighlights[activeHighlights.length - 1]}`
    : activeHighlights[0] || "great dining";

  s3Sentences.push(`It is rare to find a place like ${name} that checks every single box, delivering ${highlightPhrase}.`);

  if (hasFood && (hasAmbience || hasCozy)) {
    s3Sentences.push(`The combination of exceptional culinary flavors and an unhurried, comfortable setting made our gathering truly special.`);
  } else if (hasFood) {
    s3Sentences.push(`The depth of flavor in every dish left a lasting impression on our entire table.`);
  } else if (hasAmbience || hasCozy) {
    s3Sentences.push(`The relaxed, inviting setting provides the ideal backdrop for a memorable evening.`);
  }

  if (hasStaff && hasService) {
    s3Sentences.push(`The team's dedication to fast service and gracious care made us feel genuinely valued.`);
  } else if (hasStaff) {
    s3Sentences.push(`A big shoutout to the staff for making us feel so welcomed and looked after.`);
  } else if (hasService) {
    s3Sentences.push(`Service was prompt and flawless from the moment we sat down.`);
  }

  if (hasHygiene || hasValue) {
    s3Sentences.push(`You can dine with complete confidence knowing the place is pristine and the pricing is completely fair.`);
  }

  const opt3 = `${s3Sentences.join(" ")} We will definitely be regular diners here and can't recommend it enough!`;

  return [
    {
      badge: "Foodie Favorite",
      tone: "Sensory & Passionate",
      text: opt1,
    },
    {
      badge: "Punchy & Direct",
      tone: "Crisp & High Impact",
      text: opt2,
    },
    {
      badge: "Warm & Heartfelt",
      tone: "Memorable Experience",
      text: opt3,
    },
  ];
}
