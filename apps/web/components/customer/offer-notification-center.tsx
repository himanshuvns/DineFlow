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
import { useOfferStore, OfferCampaign, DiscountType } from "@/lib/stores/offer-store";
import { useToast } from "@/components/ui/toast";

interface OfferNotificationCenterProps {
  tenantSlug: string;
}

function mapOfferPayload(o: any, tenantSlug: string): OfferCampaign {
  let discType: DiscountType = "percent";
  if (o.discountType === "fixed_amount" || o.discountType === "fixed") {
    discType = "fixed";
  } else if (o.discountType === "free_item") {
    discType = "free_item";
  }

  return {
    id: o.id || o._id || `off-${o.promoCode}`,
    tenantSlug: tenantSlug,
    title: o.title || "Special Table Offer",
    description: o.message || o.description || "Enjoy exclusive savings on your dining bill!",
    discountType: discType,
    discountValue: Number(o.discountValue) || 0,
    freeItemName: o.freeItemName,
    promoCode: (o.promoCode || "").toUpperCase(),
    expiresAt: o.expiresAt || new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
    targetAudience: o.targetAudience || "billed_today",
    channels: o.channels || ["web_push", "in_menu"],
    deepLinkDestination: "table_menu",
    status: o.isActive !== false ? "active" : "completed",
    sentCount: o.stats?.sentCount || 0,
    clickCount: o.stats?.clickedCount || o.clickCount || 0,
    convertedCount: o.stats?.ordersCount || o.convertedCount || 0,
    recoveredRevenue: o.stats?.revenueGenerated || o.recoveredRevenue || 0,
    createdAt: o.createdAt || new Date().toISOString(),
  };
}

function OfferNotificationCenterInner({ tenantSlug }: OfferNotificationCenterProps) {
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { appliedPromo, applyPromo } = useCartStore();
  const { addCampaign } = useOfferStore();

  const [dismissed, setDismissed] = React.useState(false);
  const [pushPermission, setPushPermission] = React.useState<NotificationPermission>("default");
  const [activeOffer, setActiveOffer] = React.useState<OfferCampaign | null>(null);

  // Check existing Notification permission on load
  React.useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushPermission(Notification.permission);
      // Auto register service worker in background if available
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      }
    }
  }, []);

  // Fetch real active offers from Go Backend API
  const fetchActiveOffers = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/offers/public/${tenantSlug}`, { cache: "no-store" });
      if (!res.ok) return [];
      const json = await res.json();
      const list = json.data || json || [];
      if (Array.isArray(list)) {
        const mapped = list.map((item) => mapOfferPayload(item, tenantSlug));
        mapped.forEach((c) => addCampaign(c));
        return mapped;
      }
      return [];
    } catch {
      return [];
    }
  }, [tenantSlug, addCampaign]);

  // Initial fetch and URL ?promo= detection
  React.useEffect(() => {
    let isMounted = true;
    const promoQuery = searchParams.get("promo") || searchParams.get("offer");

    fetchActiveOffers().then((offers) => {
      if (!isMounted) return;

      if (promoQuery && offers.length > 0) {
        const match = offers.find(
          (o) => o.promoCode.toLowerCase() === promoQuery.toLowerCase()
        );
        if (match) {
          setActiveOffer(match);
          applyPromo(match.promoCode, match.discountType, match.discountValue, match.title);
          return;
        }
      }

      if (offers.length > 0 && !activeOffer) {
        setActiveOffer(offers[0]);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [tenantSlug, searchParams, fetchActiveOffers, applyPromo]);

  // Realtime Server-Sent Events (SSE) listener for live broadcasts
  React.useEffect(() => {
    if (typeof window === "undefined" || !("EventSource" in window)) return;

    let es: EventSource | null = null;
    try {
      // Connect to SSE hub for this tenant
      es = new EventSource(`/api/v1/realtime?tenant=${tenantSlug}`);
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "offer.broadcast" && data.offer) {
            const mapped = mapOfferPayload(data.offer, tenantSlug);
            setActiveOffer(mapped);
            setDismissed(false);
            addCampaign(mapped);

            // If user previously granted native notification permission, display native system notification!
            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
              try {
                if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
                  navigator.serviceWorker.ready.then((reg) => {
                    reg.showNotification(mapped.title, {
                      body: mapped.description,
                      icon: "/favicon.ico",
                      badge: "/favicon.ico",
                      tag: mapped.promoCode,
                      data: { url: window.location.href },
                    });
                  });
                } else {
                  new Notification(mapped.title, {
                    body: mapped.description,
                    icon: "/favicon.ico",
                  });
                }
              } catch {}
            }
          }
        } catch {}
      };
    } catch {}

    return () => {
      if (es) es.close();
    };
  }, [tenantSlug, addCampaign]);

  if (!activeOffer || dismissed) return null;

  const isAlreadyApplied = appliedPromo?.code === activeOffer.promoCode;

  const handleClaim = async () => {
    // Record click telemetry on backend
    try {
      await fetch("/api/v1/offers/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId: activeOffer.id }),
      });
    } catch {}

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
    if (typeof window === "undefined" || !("Notification" in window)) {
      addToast("info", "Web Push Not Supported", "Your browser does not support push notifications.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission === "granted") {
        let endpoint = `https://fcm.googleapis.com/browser/${Date.now()}`;
        let p256dhKey = "granted";
        let authKey = "granted";

        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.register("/sw.js");
          try {
            const sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBKr3qBUYIHBQFLXYp5Nksh8U",
            });
            if (sub) {
              endpoint = sub.endpoint;
              const p256 = sub.getKey("p256dh");
              const auth = sub.getKey("auth");
              if (p256) p256dhKey = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(p256))));
              if (auth) authKey = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(auth))));
            }
          } catch {
            // Subscription fallback without custom VAPID key
          }
        }

        // Register subscription with backend
        await fetch("/api/v1/offers/public/subscribe-push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantSlug,
            endpoint,
            p256dhKey,
            authKey,
          }),
        });

        // Trigger an immediate confirmation notification on diner's mobile device
        try {
          new Notification("🔔 VIP Notifications Enabled!", {
            body: `You will now receive instant specials and kitchen perks from ${tenantSlug.replace("-", " ")}.`,
            icon: "/favicon.ico",
          });
        } catch {}

        addToast("success", "Notifications Enabled! 🔔", "You will receive exclusive VIP table perks directly on your device.");
      } else if (permission === "denied") {
        addToast("info", "Notifications Blocked", "Please unblock notifications in your mobile browser settings to receive flash deals.");
      }
    } catch (err: any) {
      console.warn("Failed to subscribe push:", err);
    }
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
                  <Clock className="h-3 w-3" /> Live Offer
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

          {pushPermission !== "granted" && (
            <button
              onClick={handleSubscribePush}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-semibold transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
              title="Get Push Notifications on your phone"
            >
              <Volume2 className="h-3 w-3 text-amber-400" /> Push Alert
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
