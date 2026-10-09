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
  const hasAmbience = cleanVibes.some((v) => /ambience|atmosphere|vibe/i.test(v));
  const hasService = cleanVibes.some((v) => /service|fast|quick/i.test(v));
  const hasStaff = cleanVibes.some((v) => /staff|friendly|hospitality/i.test(v));
  const hasValue = cleanVibes.some((v) => /value|price|money/i.test(v));
  const hasDrinks = cleanVibes.some((v) => /drink|beverage|cocktail|mocktail/i.test(v));
  const hasHygiene = cleanVibes.some((v) => /hygiene|clean|spotless/i.test(v));
  const hasCozy = cleanVibes.some((v) => /cozy|comfort/i.test(v));

  // Option 1: Direct highlight focus
  let opt1 = "";
  if (hasFood && hasAmbience) {
    opt1 = `Great experience at ${name}! The food was packed with incredible flavor and the ambience made for a wonderful dining experience.`;
  } else if (hasFood && hasService) {
    opt1 = `Delicious food and super fast turnaround at ${name}! Our dishes arrived hot, fresh, and full of flavor.`;
  } else if (hasFood && hasStaff) {
    opt1 = `Top-notch food and remarkably warm hospitality at ${name}. You can tell the team genuinely cares about their diners.`;
  } else if (hasFood) {
    opt1 = `Outstanding meal at ${name}! The food was fresh, vibrant, and bursting with rich authentic flavors.`;
  } else if (hasAmbience && hasStaff) {
    opt1 = `Wonderful atmosphere and genuine, welcoming hospitality at ${name}. Made our evening truly memorable!`;
  } else if (hasAmbience) {
    opt1 = `The ambience at ${name} is exceptional! Beautiful lighting, great mood, and an effortlessly stylish setting.`;
  } else if (hasService && hasStaff) {
    opt1 = `Incredible service at ${name}! Staff was polite and attentive, and our orders arrived without any waiting.`;
  } else if (hasService) {
    opt1 = `Remarkably prompt and efficient service at ${name}. Fast turnaround without compromising on quality!`;
  } else if (hasStaff) {
    opt1 = `The staff at ${name} was so courteous and attentive throughout our visit. Truly heartwarming hospitality!`;
  } else if (hasDrinks) {
    opt1 = `Fantastic beverages at ${name}! The signature drinks were refreshing, creative, and expertly crafted.`;
  } else if (hasHygiene) {
    opt1 = `Impressed by how clean and spotless ${name} is. Impeccable hygiene standards and a very tidy dining area.`;
  } else if (hasValue) {
    opt1 = `Generous portion sizes and great value for money at ${name}. You definitely get top quality for what you pay!`;
  } else {
    opt1 = `Had a wonderful 5-star experience at ${name}! Definitely coming back soon.`;
  }

  // Option 2: Detailed Experience
  let opt2 = "";
  if (hasFood && hasAmbience) {
    opt2 = `Every single dish was cooked to perfection and plated beautifully. Combined with the cozy lighting and relaxed music, it was easily one of the best dinners we have had.`;
  } else if (hasFood && hasHygiene) {
    opt2 = `You can immediately tell how fresh the ingredients are, and the open dining room is pristine and spotless. A fantastic culinary experience from start to finish.`;
  } else if (hasFood && hasDrinks) {
    opt2 = `The food was rich and full of flavor, and their drinks paired perfectly with the meal. Clearly a kitchen that takes its craft seriously.`;
  } else if (hasFood) {
    opt2 = `The depth of flavor in every course was phenomenal. Seasoned to perfection and served piping hot. 10/10 for food quality and taste.`;
  } else if (hasAmbience && hasCozy) {
    opt2 = `Such a cozy, charming setting with great attention to interior decor. It provides the ideal backdrop for a relaxed and unhurried meal.`;
  } else if (hasAmbience) {
    opt2 = `The aesthetic decor and ambient music create such an inviting dining atmosphere. A really chic and comfortable place to spend an evening.`;
  } else if (hasStaff && hasService) {
    opt2 = `From the greeting at the door to the swift delivery of our orders, the team handled everything with utmost professionalism and care.`;
  } else if (hasStaff) {
    opt2 = `Staff members were polite, knowledgeable about the menu, and always ready to help with a smile. First-class customer service.`;
  } else if (hasValue) {
    opt2 = `High quality ingredients combined with very reasonable pricing. Portion sizes are hearty and well worth every penny.`;
  } else if (hasHygiene) {
    opt2 = `The tables, cutlery, and entire venue are maintained to high cleanliness standards. Felt comfortable and well looked after.`;
  } else {
    opt2 = `Everything during our visit exceeded expectations. High quality standards and a very pleasant experience overall.`;
  }

  // Option 3: Warm Recommendation
  let opt3 = "";
  if (hasFood && hasAmbience) {
    opt3 = `If you appreciate exceptional food in a gorgeous, relaxing atmosphere, ${name} is an absolute must-visit. Highly recommended!`;
  } else if (hasFood && hasStaff) {
    opt3 = `Delicious food coupled with staff that treats you like family. Will definitely be recommending ${name} to friends and colleagues!`;
  } else if (hasFood && hasValue) {
    opt3 = `Top-tier flavors without breaking the bank. ${name} is our new favorite spot for great food and great value!`;
  } else if (hasFood) {
    opt3 = `A true delight for anyone who loves great food. We will definitely be returning to ${name} to try more of the menu!`;
  } else if (hasAmbience) {
    opt3 = `Can't recommend ${name} enough for anyone wanting a lovely setting for dates or gatherings. The vibe is simply unmatched!`;
  } else if (hasStaff) {
    opt3 = `A big shoutout to the wonderful team at ${name} for making us feel so valued. Exceptional hospitality all around!`;
  } else if (hasService) {
    opt3 = `Rare to find a place that respects your time with such fast and organized service. Keep up the fantastic work, ${name}!`;
  } else {
    opt3 = `5 stars all the way for ${name}! Looking forward to our next visit.`;
  }

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
