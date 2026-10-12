"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import {
  Bell,
  Sparkles,
  X,
  Tag,
  CheckCircle2,
  ArrowRight,
  Clock,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/stores/cart-store";
import { useOfferStore, OfferCampaign } from "@/lib/stores/offer-store";
import { useToast } from "@/components/ui/toast";

interface OfferNotificationCenterProps {
  tenantSlug: string;
}

function OfferNotificationCenterInner({ tenantSlug }: OfferNotificationCenterProps) {
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { appliedPromo, applyPromo } = useCartStore();
  const { getActiveOffers, recordClick } = useOfferStore();

  const [dismissed, setDismissed] = React.useState(false);
  const [pushSubscribed, setPushSubscribed] = React.useState(false);
  const [activeOffer, setActiveOffer] = React.useState<OfferCampaign | null>(null);

  // Check URL param ?promo=... or active campaigns
  React.useEffect(() => {
    const promoQuery = searchParams.get("promo") || searchParams.get("offer");
    const activeList = getActiveOffers(tenantSlug);

    if (promoQuery) {
      const match = activeList.find(
        (o) => o.promoCode.toLowerCase() === promoQuery.toLowerCase()
      );
      if (match) {
        setActiveOffer(match);
        // Auto-apply promo from URL
        applyPromo(match.promoCode, match.discountType, match.discountValue, match.title);
        return;
      }
    }

    if (activeList.length > 0 && !activeOffer) {
      setActiveOffer(activeList[0]);
    }
  }, [tenantSlug, searchParams, getActiveOffers, applyPromo]);

  if (!activeOffer || dismissed) return null;

  const isAlreadyApplied = appliedPromo?.code === activeOffer.promoCode;

  const handleClaim = () => {
    recordClick(activeOffer.id);
    applyPromo(
      activeOffer.promoCode,
      activeOffer.discountType,
      activeOffer.discountValue,
      activeOffer.title
    );

    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#10b981", "#f59e0b", "#6366f1"],
      });
    } catch {}

    addToast(
      "success",
      `Coupon ${activeOffer.promoCode} Applied!`,
      activeOffer.discountType === "percent"
        ? `${activeOffer.discountValue}% discount deducted from your cart total.`
        : activeOffer.discountType === "fixed"
        ? `₹${activeOffer.discountValue} deducted from your bill.`
        : `Free item perk unlocked for your order.`
    );
  };

  const handleSubscribePush = async () => {
    setPushSubscribed(true);
    try {
      await fetch("/api/v1/offers/public/subscribe-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug,
          timestamp: Date.now(),
        }),
      });
      addToast("info", "Notifications Enabled 🔔", "You will receive exclusive VIP table perks.");
    } catch {}
  };

  const discountBadgeText =
    activeOffer.discountType === "percent"
      ? `${activeOffer.discountValue}% OFF`
      : activeOffer.discountType === "fixed"
      ? `₹${activeOffer.discountValue} OFF`
      : `FREE PERK`;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40 max-w-sm w-[calc(100%-1.5rem)] animate-in fade-in-50 slide-in-from-bottom-4 duration-300 pointer-events-auto">
      <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/95 dark:bg-[#070d18]/95 backdrop-blur-md text-white p-4 shadow-2xl shadow-emerald-500/10 space-y-3">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 items-center justify-center shrink-0">
              <Bell className="h-4 w-4 animate-bounce" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            </span>

            <div>
              <div className="flex items-center gap-1.5">
                <Badge variant="success" size="sm" className="font-mono text-[10px] font-black">
                  {discountBadgeText}
                </Badge>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Flash Offer
                </span>
              </div>
              <h4 className="text-xs font-bold text-white line-clamp-1 mt-0.5">
                {activeOffer.title}
              </h4>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Dismiss Offer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Offer Body */}
        <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
          {activeOffer.description}
        </p>

        {/* CTA Bar */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/10">
          <Button
            size="sm"
            variant={isAlreadyApplied ? "secondary" : "glow"}
            className="flex-1 text-xs font-bold h-9"
            onClick={handleClaim}
            disabled={isAlreadyApplied}
          >
            {isAlreadyApplied ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Promo Applied
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" /> Claim ({activeOffer.promoCode})
              </span>
            )}
          </Button>

          {!pushSubscribed && (
            <button
              onClick={handleSubscribePush}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-semibold transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
              title="Get Push Notifications"
            >
              <Volume2 className="h-3 w-3 text-amber-400" /> Notify Me
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function OfferNotificationCenter({ tenantSlug }: OfferNotificationCenterProps) {
  return (
    <React.Suspense fallback={null}>
      <OfferNotificationCenterInner tenantSlug={tenantSlug} />
    </React.Suspense>
  );
}
