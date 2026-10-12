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

interface OfferStoreState {
  campaigns: OfferCampaign[];
  setCampaigns: (campaigns: OfferCampaign[]) => void;
  getActiveOffers: (tenantSlug: string) => OfferCampaign[];
  getAllCampaigns: (tenantSlug: string) => OfferCampaign[];
  addCampaign: (campaign: OfferCampaign) => void;
  deleteCampaign: (campaignId: string) => void;
  recordClick: (campaignId: string) => void;
  recordConversion: (campaignId: string, orderTotal: number) => void;
}

export const useOfferStore = create<OfferStoreState>()(
  persist(
    (set, get) => ({
      // Zero mock data - 100% dynamic DB backed
      campaigns: [],

      setCampaigns: (campaigns) => set({ campaigns }),

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

      addCampaign: (campaign) => {
        set((state) => ({
          campaigns: [campaign, ...state.campaigns.filter((c) => c.id !== campaign.id)],
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
