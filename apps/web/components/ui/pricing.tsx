"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Star, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
  limits?: {
    tables?: string;
    dishes?: string;
    staff?: string;
    locations?: string;
  };
}

export interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
  currency?: string;
  currencySymbol?: string;
  onSelectPlan?: (plan: PricingPlan) => void;
  className?: string;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support.",
  currency = "INR",
  currencySymbol = "₹",
  onSelectPlan,
  className,
}: PricingProps) {
  const [isMonthly, setIsMonthly] = React.useState(true);
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const isTablet = useMediaQuery("(min-width: 768px)");
  const switchRef = React.useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked) {
      let x = 0.5;
      let y = 0.3;
      if (switchRef.current) {
        try {
          const rect = switchRef.current.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            x = (rect.left + rect.width / 2) / window.innerWidth;
            y = (rect.top + rect.height / 2) / window.innerHeight;
          }
        } catch {}
      }

      confetti({
        particleCount: 80,
        spread: 80,
        origin: { x, y },
        zIndex: 99999,
        colors: [
          "#10B981", // primary emerald
          "#14F1C7", // teal neon
          "#00D4AA", // mint
          "#F59E0B", // amber/gold
          "#6366F1", // indigo
        ],
        ticks: 240,
        gravity: 1.1,
        decay: 0.94,
        startVelocity: 35,
        shapes: ["circle"],
      });
    }
  };

  const isFourColumns = plans.length === 4;

  return (
    <div className={cn("container py-12 sm:py-16 lg:py-20 mx-auto px-4 sm:px-6", className)}>
      {/* Header section */}
      <div className="text-center space-y-4 mb-10 sm:mb-12 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-[#14F1C7] text-xs font-semibold shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-[#14F1C7]" />
          <span>Transparent Hospitality Plans</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
          {title}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg whitespace-pre-line max-w-2xl mx-auto font-body">
          {description}
        </p>
      </div>

      {/* Monthly / Annual switch */}
      <div className="flex items-center justify-center mb-12 sm:mb-14">
        <div className="flex items-center gap-3 p-1.5 px-4 rounded-full bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-xs">
          <span
            className={cn(
              "text-xs sm:text-sm font-semibold transition-colors cursor-pointer select-none",
              isMonthly
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            onClick={() => handleToggle(false)}
          >
            Monthly
          </span>

          <label className="relative inline-flex items-center cursor-pointer">
            <Label className="sr-only">Toggle annual billing</Label>
            <Switch
              ref={switchRef}
              checked={!isMonthly}
              onCheckedChange={handleToggle}
              className="relative data-[state=checked]:bg-emerald-500 dark:data-[state=checked]:bg-[#14F1C7]"
            />
          </label>

          <span
            className={cn(
              "text-xs sm:text-sm font-semibold transition-colors cursor-pointer select-none flex items-center gap-1.5",
              !isMonthly
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            onClick={() => handleToggle(true)}
          >
            <span>Annual</span>
            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-[#14F1C7] border border-emerald-500/30">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* Plans Grid */}
      <div
        className={cn(
          "grid gap-6 items-stretch",
          isFourColumns
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
            : "grid-cols-1 md:grid-cols-3"
        )}
      >
        {plans.map((plan, index) => {
          const rawPrice = isMonthly ? plan.price : plan.yearlyPrice;
          const numericPrice = Number(rawPrice.replace(/[^0-9.]/g, "")) || 0;

          return (
            <motion.div
              key={index}
              initial={{ y: 40, opacity: 0 }}
              whileInView={
                isLargeScreen
                  ? isFourColumns
                    ? {
                        y: plan.isPopular ? -16 : 0,
                        opacity: 1,
                        scale: plan.isPopular ? 1.02 : 0.98,
                      }
                    : {
                        y: plan.isPopular ? -20 : 0,
                        opacity: 1,
                        x: index === 2 ? -24 : index === 0 ? 24 : 0,
                        scale: index === 0 || index === 2 ? 0.95 : 1.0,
                      }
                  : isTablet
                  ? {
                      y: plan.isPopular ? -10 : 0,
                      opacity: 1,
                      x: 0,
                      scale: plan.isPopular ? 1.02 : 1.0,
                    }
                  : { y: 0, opacity: 1, x: 0 }
              }
              viewport={{ once: true }}
              transition={{
                duration: 1.2,
                type: "spring",
                stiffness: 100,
                damping: 26,
                delay: index * 0.1,
                opacity: { duration: 0.4 },
              }}
              className={cn(
                "rounded-3xl border p-6 sm:p-7 flex flex-col justify-between relative transition-all duration-300",
                "bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl",
                plan.isPopular
                  ? "border-emerald-500 dark:border-[#14F1C7] border-2 shadow-[0_16px_40px_rgba(16,185,129,0.15)] dark:shadow-[0_20px_50px_rgba(20,241,199,0.2)] z-10"
                  : "border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm z-0",
                !plan.isPopular && !isFourColumns && "lg:mt-4",
                !isFourColumns && index === 0 && "lg:origin-right",
                !isFourColumns && index === 2 && "lg:origin-left"
              )}
            >
              {/* Most Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 dark:from-[#14F1C7] dark:to-emerald-400 text-slate-950 py-1 px-3.5 rounded-full flex items-center gap-1.5 shadow-md shadow-emerald-500/20">
                  <Star className="h-3.5 w-3.5 fill-current text-slate-950" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider font-sans">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex-1 flex flex-col">
                {/* Plan Name & Tagline */}
                <div className="text-center pb-2">
                  <h3 className="text-xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 min-h-[32px] font-body leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Price Display with Animated NumberFlow */}
                <div className="my-5 text-center">
                  <div className="flex items-center justify-center gap-x-1 text-slate-900 dark:text-white">
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display">
                      <NumberFlow
                        value={numericPrice}
                        prefix={currencySymbol || (currency === "USD" ? "$" : "₹")}
                        locales={currency === "INR" ? "en-IN" : "en-US"}
                        format={{
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }}
                        transformTiming={{
                          duration: 450,
                          easing: "ease-out",
                        }}
                        willChange
                        className="font-variant-numeric: tabular-nums"
                      />
                    </span>
                    {plan.period && (
                      <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                        / {plan.period}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {numericPrice === 0
                      ? "Free forever"
                      : isMonthly
                      ? "Billed monthly"
                      : `Billed annually (${currencySymbol}${(numericPrice * 12).toLocaleString("en-IN")}/yr)`}
                  </p>
                </div>

                {/* Capacity Limits (if provided) */}
                {plan.limits && (
                  <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1 mb-5 text-[11.5px] font-body">
                    {plan.limits.tables && (
                      <div className="flex justify-between text-slate-700 dark:text-slate-300">
                        <span className="text-slate-500 dark:text-slate-400">Tables:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{plan.limits.tables}</span>
                      </div>
                    )}
                    {plan.limits.dishes && (
                      <div className="flex justify-between text-slate-700 dark:text-slate-300">
                        <span className="text-slate-500 dark:text-slate-400">Menu items:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{plan.limits.dishes}</span>
                      </div>
                    )}
                    {plan.limits.staff && (
                      <div className="flex justify-between text-slate-700 dark:text-slate-300">
                        <span className="text-slate-500 dark:text-slate-400">Staff seats:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{plan.limits.staff}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Features checklist */}
                <ul className="mt-2 space-y-2.5 flex flex-col mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <div className="h-4 w-4 rounded-full bg-emerald-500/15 dark:bg-[#14F1C7]/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-2.5 w-2.5 text-emerald-600 dark:text-[#14F1C7]" />
                      </div>
                      <span className="text-left leading-normal">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                {onSelectPlan ? (
                  <button
                    type="button"
                    onClick={() => onSelectPlan(plan)}
                    className={cn(
                      buttonVariants({
                        variant: plan.isPopular ? "glow" : "outline",
                      }),
                      "w-full text-sm font-bold tracking-tight rounded-xl py-2.5 transition-all duration-200 cursor-pointer shadow-sm",
                      plan.isPopular
                        ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-slate-950 hover:shadow-emerald-500/40 hover:scale-[1.01]"
                        : "hover:border-emerald-500 dark:hover:border-[#14F1C7] hover:text-emerald-600 dark:hover:text-[#14F1C7]"
                    )}
                  >
                    {plan.buttonText}
                  </button>
                ) : (
                  <Link
                    href={plan.href}
                    className={cn(
                      buttonVariants({
                        variant: plan.isPopular ? "glow" : "outline",
                      }),
                      "w-full text-sm font-bold tracking-tight rounded-xl py-2.5 transition-all duration-200 shadow-sm flex items-center justify-center",
                      plan.isPopular
                        ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-slate-950 hover:shadow-emerald-500/40 hover:scale-[1.01]"
                        : "hover:border-emerald-500 dark:hover:border-[#14F1C7] hover:text-emerald-600 dark:hover:text-[#14F1C7]"
                    )}
                  >
                    {plan.buttonText}
                  </Link>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
