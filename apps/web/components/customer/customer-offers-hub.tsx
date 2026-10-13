"use client";

import * as React from "react";
import {
  Tag,
  Sparkles,
  Ticket,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Percent,
  Clock,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/stores/cart-store";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";

interface CustomerOffersHubProps {
  tenantSlug: string;
  restaurantName: string;
  onOpenMenu: () => void;
  onOpenCart?: () => void;
}

interface OfferItem {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  discountType: "percent" | "fixed" | "free_item";
  discountValue: number;
  promoCode: string;
  minOrderValue?: number;
  expiresAt?: string;
}

export function CustomerOffersHub({
  tenantSlug,
  restaurantName,
  onOpenMenu,
  onOpenCart,
}: CustomerOffersHubProps) {
  const { addToast } = useToast();
  const { appliedPromo, applyPromo, removePromo, getSubtotal, getItemCount } = useCartStore();

  const [offers, setOffers] = React.useState<OfferItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const subtotal = getSubtotal();
  const itemCount = getItemCount();

  React.useEffect(() => {
    let isMounted = true;
    const fetchOffers = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/v1/offers/public/${encodeURIComponent(tenantSlug)}?_t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
          const normalized: OfferItem[] = list.map((o: any) => ({
            ...o,
            description: o.description || o.message || "",
            discountType:
              o.discountType === "fixed" || o.discountType === "fixed_amount" || o.discountType === "flat"
                ? "fixed"
                : o.discountType === "free_item"
                ? "free_item"
                : "percent",
            discountValue: Number(o.discountValue) || 0,
          }));
          if (isMounted) setOffers(normalized);
        }
      } catch (err) {
        console.warn("[CustomerOffersHub] error loading offers:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchOffers();

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("dineflow_menu_sync");
      bc.onmessage = () => fetchOffers();
    } catch {}

    return () => {
      isMounted = false;
      bc?.close();
    };
  }, [tenantSlug]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    addToast("info", "Code Copied", `Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApply = (offer: OfferItem) => {
    if (offer.minOrderValue && subtotal < offer.minOrderValue) {
      addToast(
        "error",
        "Minimum Order Required",
        `Add dishes worth at least ${formatCurrency(offer.minOrderValue, "INR")} to use this offer.`
      );
      return;
    }

    applyPromo(
      offer.promoCode,
      offer.discountType,
      offer.discountValue,
      offer.description || offer.title
    );

    addToast(
      "success",
      `Coupon ${offer.promoCode} Applied!`,
      `Enjoy ${offer.discountType === "percent" ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`} on your table order!`
    );
  };

  return (
    <div className="space-y-4 pb-mobile-nav max-w-xl mx-auto px-4 pt-4 animate-in fade-in duration-200">
      {/* Hero Offers Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white p-5 shadow-xl">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 h-36 w-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur border border-white/30 text-white flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Flash Deals & Promotions
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Special Offers & Deals
          </h2>
          <p className="text-xs text-white/80 mt-1 max-w-sm">
            Exclusive discounts and seasonal culinary perks available for dining at {restaurantName}.
          </p>

          {itemCount > 0 ? (
            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
              <span className="text-white/90">
                Cart: <strong className="font-mono">{formatCurrency(subtotal, "INR")}</strong> ({itemCount} {itemCount === 1 ? "item" : "items"})
              </span>
              {appliedPromo ? (
                <span className="text-emerald-200 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Code {appliedPromo.code} Active
                </span>
              ) : (
                <span className="text-emerald-200 font-medium">Select a coupon below to apply</span>
              )}
            </div>
          ) : (
            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
              <span className="text-[11px] text-white/70">Pick a deal, then order your favorites!</span>
              <button
                type="button"
                onClick={onOpenMenu}
                className="text-xs font-bold text-white hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Browse Menu</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Offers List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Ticket className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Available Deals ({offers.length})</span>
          </h3>
          <span className="text-[11px] text-slate-500">Instant in-cart discount</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Checking latest restaurant offers...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Tag className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Active Broadcasts Right Now</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Check back shortly! The culinary team regularly broadcasts flash happy-hour specials and seasonal discounts.
              </p>
            </div>
            <Button
              onClick={onOpenMenu}
              variant="glow"
              size="sm"
              className="mt-2 font-bold text-xs"
            >
              <UtensilsCrossed className="h-3.5 w-3.5 mr-1.5" />
              Explore Menu Items
            </Button>
          </div>
        ) : (
          offers.map((offer, idx) => {
            const isApplied = appliedPromo?.code.toUpperCase() === offer.promoCode.toUpperCase();
            return (
              <div
                key={offer.id || offer._id || idx}
                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 ${
                  isApplied
                    ? "border-emerald-500 shadow-md ring-1 ring-emerald-500/30"
                    : "border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-500/30"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                        {offer.promoCode}
                      </span>
                      <Badge variant="glow" size="sm" className="font-extrabold text-[10px]">
                        {offer.discountType === "percent"
                          ? `${offer.discountValue}% OFF`
                          : `₹${offer.discountValue} OFF`}
                      </Badge>
                      {offer.minOrderValue ? (
                        <span className="text-[10px] text-slate-500 font-medium">
                          Min. order: {formatCurrency(offer.minOrderValue, "INR")}
                        </span>
                      ) : null}
                    </div>

                    <h4 className="text-sm font-black text-slate-900 dark:text-white mt-2">
                      {offer.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {offer.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyCode(offer.promoCode)}
                    className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {copiedCode === offer.promoCode ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-slate-400" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>

                  {isApplied ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Applied
                      </span>
                      <button
                        type="button"
                        onClick={removePromo}
                        className="text-[11px] font-semibold text-rose-500 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="glow"
                      onClick={() => handleApply(offer)}
                      className="h-8 px-4 font-bold text-xs rounded-xl"
                    >
                      Apply to Order
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
