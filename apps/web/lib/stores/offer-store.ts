"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DiscountType = "percent" | "fixed" | "free_item";
export type TargetAudience = "billed_today" | "active_tables" | "past_7_days" | "all_diners";
export type OfferChannel = "web_push" | "whatsapp" | "in_menu";

export interface OfferCampaign {
  id: string;
  tenantSlug: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number; // e.g. 20 for 20%, 150 for ₹150, 0 for free item
  freeItemName?: string;
  promoCode: string;
  expiresAt: string; // ISO string
  targetAudience: TargetAudience;
  channels: OfferChannel[];
  deepLinkDestination: "table_menu" | "online_delivery";
  status: "active" | "completed" | "scheduled";
  sentCount: number;
  clickCount: number;
  convertedCount: number;
  recoveredRevenue: number;
  createdAt: string;
}

const INITIAL_CAMPAIGNS: OfferCampaign[] = [
  {
    id: "cmp-101",
    tenantSlug: "the-grand-bistro",
    title: "🍕 Craving Round Two? 20% OFF Post-Meal Re-Order!",
    description: "Enjoy 20% off drinks, artisanal pizzas, or handcrafted desserts right now. Hot & fresh to your table or doorstep!",
    discountType: "percent",
    discountValue: 20,
    promoCode: "REORDER20",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(), // 4 hours from now
    targetAudience: "billed_today",
    channels: ["whatsapp", "web_push", "in_menu"],
    deepLinkDestination: "table_menu",
    status: "active",
    sentCount: 412,
    clickCount: 158,
    convertedCount: 54,
    recoveredRevenue: 38200,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "cmp-102",
    tenantSlug: "the-grand-bistro",
    title: "🍟 Complimentary Chef's Truffle Fries on Next Round!",
    description: "Add a touch of indulgence to your table! Order any 2 drinks and receive our signature Truffle Parmesan Fries on the house.",
    discountType: "free_item",
    discountValue: 0,
    freeItemName: "Truffle Parmesan Fries",
    promoCode: "CHEFDELIGHT",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
    targetAudience: "active_tables",
    channels: ["in_menu", "web_push"],
    deepLinkDestination: "table_menu",
    status: "active",
    sentCount: 186,
    clickCount: 82,
    convertedCount: 39,
    recoveredRevenue: 31450,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "cmp-103",
    tenantSlug: "the-grand-bistro",
    title: "✨ Weekend Dining Perks: Flat ₹150 OFF!",
    description: "Thank you for dining with us! Come back this evening or order takeaway to enjoy flat ₹150 off your bill above ₹600.",
    discountType: "fixed",
    discountValue: 150,
    promoCode: "WEEKEND150",
    expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    targetAudience: "past_7_days",
    channels: ["whatsapp", "web_push"],
    deepLinkDestination: "online_delivery",
    status: "completed",
    sentCount: 822,
    clickCount: 254,
    convertedCount: 125,
    recoveredRevenue: 79000,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

interface OfferStoreState {
  campaigns: OfferCampaign[];
  getActiveOffers: (tenantSlug: string) => OfferCampaign[];
  getAllCampaigns: (tenantSlug: string) => OfferCampaign[];
  createCampaign: (
    campaign: Omit<
      OfferCampaign,
      "id" | "createdAt" | "sentCount" | "clickCount" | "convertedCount" | "recoveredRevenue" | "status"
    >
  ) => OfferCampaign;
  broadcastAgain: (campaignId: string) => void;
  deleteCampaign: (campaignId: string) => void;
  recordClick: (campaignId: string) => void;
  recordConversion: (campaignId: string, orderTotal: number) => void;
}

export const useOfferStore = create<OfferStoreState>()(
  persist(
    (set, get) => ({
      campaigns: INITIAL_CAMPAIGNS,

      getActiveOffers: (tenantSlug: string) => {
        const cleanSlug = tenantSlug || "the-grand-bistro";
        return get().campaigns.filter(
          (c) =>
            (c.tenantSlug === cleanSlug || !c.tenantSlug) &&
            c.status === "active" &&
            new Date(c.expiresAt).getTime() > Date.now()
        );
      },

      getAllCampaigns: (tenantSlug: string) => {
        const cleanSlug = tenantSlug || "the-grand-bistro";
        return get().campaigns.filter((c) => c.tenantSlug === cleanSlug || !c.tenantSlug);
      },

      createCampaign: (data) => {
        // Calculate simulated target counts based on audience selection
        const simulatedCounts: Record<TargetAudience, number> = {
          billed_today: 48,
          active_tables: 16,
          past_7_days: 340,
          all_diners: 520,
        };

        const newCampaign: OfferCampaign = {
          ...data,
          id: `cmp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          status: "active",
          sentCount: simulatedCounts[data.targetAudience] || 45,
          clickCount: 0,
          convertedCount: 0,
          recoveredRevenue: 0,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          campaigns: [newCampaign, ...state.campaigns],
        }));

        return newCampaign;
      },

      broadcastAgain: (campaignId: string) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) => {
            if (c.id === campaignId) {
              const moreSent = Math.floor(Math.random() * 30) + 20;
              return {
                ...c,
                status: "active",
                sentCount: c.sentCount + moreSent,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
              };
            }
            return c;
          }),
        }));
      },

      deleteCampaign: (campaignId: string) => {
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== campaignId),
        }));
      },

      recordClick: (campaignId: string) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === campaignId ? { ...c, clickCount: c.clickCount + 1 } : c
          ),
        }));
      },

      recordConversion: (campaignId: string, orderTotal: number) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === campaignId
              ? {
                  ...c,
                  convertedCount: c.convertedCount + 1,
                  recoveredRevenue: c.recoveredRevenue + orderTotal,
                }
              : c
          ),
        }));
      },
    }),
    {
      name: "dineflow_offers_store",
    }
  )
);

/**
 * AI-powered promotional copy generator
 */
export function generateOfferAICopy(
  restaurantName: string,
  discountType: DiscountType,
  discountValue: number,
  freeItemName?: string
): Array<{ title: string; copy: string; promoCode: string }> {
  const name = restaurantName || "our restaurant";
  const discountPhrase =
    discountType === "percent"
      ? `${discountValue}% OFF`
      : discountType === "fixed"
      ? `₹${discountValue} OFF`
      : `Free ${freeItemName || "Dessert"}`;

  return [
    {
      title: `🔥 Still Hungry? Enjoy ${discountPhrase} on your next order!`,
      copy: `Round two just got even better at ${name}! 🍕 Indulge in hot appetizers, wood-fired mains, or refreshing beverages with ${discountPhrase}. Handcrafted fresh to order.`,
      promoCode: discountType === "percent" ? `TASTY${discountValue}` : `REORDER${discountValue || "GIFT"}`,
    },
    {
      title: `✨ Sweet Ending: ${discountPhrase} at ${name}!`,
      copy: `Loved your meal today? 🥰 Top it off with handcrafted dessert or cocktails with ${discountPhrase}! Valid for the next 2 hours only. 1-click re-order right from your table.`,
      promoCode: `SWEET${discountValue || "PERK"}`,
    },
    {
      title: `⚡ Table Flash Deal: Claim ${discountPhrase} before you go!`,
      copy: `Exclusive VIP diner perk for today's guests: Tap to unlock ${discountPhrase} on your next round or takeaway. Fast kitchen turnaround guaranteed!`,
      promoCode: `FLASH${discountValue || "NOW"}`,
    },
  ];
}
