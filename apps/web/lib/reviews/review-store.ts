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
  const vibePhrase = cleanVibes.length > 0 ? cleanVibes.join(", ") : "food and warm hospitality";

  return [
    {
      badge: "Foodie Favorite",
      tone: "Sensory & Passionate",
      text: `Had an outstanding dining experience at ${name}! Everything from the ${vibePhrase} to the presentation was top notch. The flavors were exceptionally balanced and every dish arrived fresh and piping hot. Definitely coming back soon with family and friends! Highly recommended. ⭐⭐⭐⭐⭐`,
    },
    {
      badge: "Punchy & Direct",
      tone: "Crisp & High Impact",
      text: `10/10 dining at ${name}! Impressed by their ${cleanVibes[0] || "great food"} and attentiveness. Super fast turnaround, great value, and welcoming energy throughout the meal. Will definitely be a regular here!`,
    },
    {
      badge: "Warm & Heartfelt",
      tone: "Memorable Experience",
      text: `From the moment we walked into ${name}, the hospitality was genuine and heartwarming. The ${vibePhrase} made our gathering so special. It is rare to find a place that nails both ambiance and flavor with this level of consistency. A true gem!`,
    },
  ];
}
