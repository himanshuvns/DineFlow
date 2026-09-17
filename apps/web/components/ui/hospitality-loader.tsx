"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, Sparkles, ChefHat, Bell, Hotel, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HospitalityLoaderProps {
  /** Optional main status title */
  title?: string;
  /** Optional secondary subtitle or description */
  subtitle?: string;
  /** Variant of the loader: 'cloche' (gourmet platter) | 'bell' (concierge service bell) | 'minimal' | 'platform' (super admin control plane) */
  variant?: "cloche" | "bell" | "minimal" | "platform";
  /** Color theme: 'emerald' (restaurant green) | 'rose' (super admin crimson red) */
  colorTheme?: "emerald" | "rose";
  /** Fullscreen overlay or inline container */
  fullscreen?: boolean;
  /** Custom progress percentage (0 - 100) or undefined for continuous pulse */
  progress?: number;
  /** Whether to automatically cycle through hospitality status messages */
  cycleMessages?: boolean;
  /** Custom list of status messages to cycle through */
  messages?: string[];
  className?: string;
}

const DEFAULT_HOSPITALITY_MESSAGES = [
  "Preparing your dining room…",
  "Polishing cutlery & tasting menus…",
  "Warming up live kitchen display screens…",
  "Connecting floor captains & table QR stands…",
  "Ready to welcome guests!",
];

export function HospitalityLoader({
  title,
  subtitle,
  variant = "cloche",
  colorTheme = "emerald",
  fullscreen = false,
  progress,
  cycleMessages = true,
  messages = DEFAULT_HOSPITALITY_MESSAGES,
  className,
}: HospitalityLoaderProps) {
  const isRose = colorTheme === "rose" || variant === "platform";
  const isPlatformVariant = variant === "platform" || (isRose && variant === "cloche");
  const [messageIndex, setMessageIndex] = React.useState(0);

  // Cycle through hospitality status messages (800ms interval so 2.4s window shows 3 messages)
  React.useEffect(() => {
    if (!cycleMessages || messages.length <= 1) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 800);
    return () => clearInterval(interval);
  }, [cycleMessages, messages]);

  const activeMessage = messages[messageIndex] || DEFAULT_HOSPITALITY_MESSAGES[0];

  const content = (
    <div className="flex flex-col items-center justify-center text-center max-w-sm mx-auto px-6 select-none">
      {/* Animation Stage */}
      <div className="relative w-36 h-36 flex items-center justify-center mb-6">
        {/* Soft radial background aura */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: isRose ? [0.45, 0.75, 0.45] : [0.35, 0.65, 0.35],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={cn(
            "absolute inset-0 rounded-full blur-xl pointer-events-none",
            isRose
              ? "bg-gradient-to-tr from-rose-600/35 via-red-500/25 to-amber-500/10"
              : "bg-gradient-to-tr from-emerald-500/20 via-teal-400/20 to-amber-500/10"
          )}
        />

        {/* Super Admin Platform Control Plane Stage */}
        {isPlatformVariant && (
          <div className="relative w-28 h-28 flex flex-col items-center justify-center">
            {/* Concentric radar pulse rings */}
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.8],
                  opacity: [0.6, 0],
                }}
                transition={{
                  duration: 2.0,
                  repeat: Infinity,
                  delay: i * 1.0,
                  ease: "easeOut",
                }}
                className="absolute inset-2 rounded-full border border-rose-500/50 pointer-events-none"
              />
            ))}

            {/* Floating Telemetry Sparkles */}
            <motion.div
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.5, 1, 0.5],
                rotate: [0, 90, 180],
              }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-1 -right-1 text-rose-400"
            >
              <Sparkles className="h-4 w-4" />
            </motion.div>

            {/* Central Super Admin Shield Core */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 20px rgba(244, 63, 94, 0.3)",
                  "0 0 35px rgba(244, 63, 94, 0.55)",
                  "0 0 20px rgba(244, 63, 94, 0.3)",
                ],
              }}
              transition={{
                duration: 2.0,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative z-10 h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-900 via-[#1F0A12] to-slate-950 border-2 border-rose-500/70 flex items-center justify-center shadow-xl shadow-rose-950/60"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-rose-500/15 via-transparent to-rose-400/25 pointer-events-none" />
              <ShieldCheck className="h-8 w-8 text-rose-500 animate-pulse" />
            </motion.div>

            {/* Platform Core Stand Base */}
            <div className="relative z-0 w-24 h-2.5 rounded-full bg-gradient-to-r from-slate-800 via-rose-950 to-slate-800 border border-rose-900/50 shadow-md flex items-center justify-center mt-3">
              <div className="w-16 h-1 rounded-full bg-gradient-to-r from-rose-500 to-red-400 blur-[0.5px]" />
            </div>
          </div>
        )}

        {variant === "cloche" && !isPlatformVariant && (
          <div className="relative w-28 h-28 flex flex-col items-center justify-end pb-2">
            {/* Steam ribbons floating out when cloche lifts */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-12 flex justify-between px-2 pointer-events-none">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [6, -16],
                    opacity: [0, 0.85, 0],
                    scaleX: [0.8, 1.3, 0.6],
                    x: [0, i === 0 ? -4 : i === 2 ? 4 : 0],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    delay: i * 0.45,
                    ease: "easeOut",
                  }}
                  className="w-1 h-6 rounded-full bg-gradient-to-t from-emerald-500/40 via-teal-300/60 to-transparent blur-[0.5px]"
                />
              ))}
            </div>

            {/* Sparkles floating around */}
            <motion.div
              animate={{
                scale: [0.7, 1.2, 0.7],
                opacity: [0.4, 1, 0.4],
                rotate: [0, 90, 180],
              }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-1 -right-1 text-amber-500/80"
            >
              <Sparkles className="h-4 w-4" />
            </motion.div>

            {/* Lifting Cloche Dome (Food Dome Platter) */}
            <motion.div
              animate={{
                y: [0, -14, 0],
                rotate: [0, -2, 0],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative z-10 flex flex-col items-center"
            >
              {/* Cloche Knob / Handle */}
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 shadow-sm border border-amber-300/60" />
              <div className="w-1 h-1.5 bg-gradient-to-b from-amber-400 to-slate-400 -mt-0.5" />

              {/* Cloche Dome Shell */}
              <div className="w-22 h-12 rounded-t-full bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 border-t-2 border-x border-amber-400/40 dark:border-emerald-400/30 shadow-lg shadow-emerald-500/10 relative overflow-hidden flex items-center justify-center">
                {/* Metallic Sheen Highlight */}
                <div className="absolute top-1 left-3 w-4 h-8 rounded-full bg-white/40 blur-[1px] transform -rotate-12" />
                <ChefHat className="h-4 w-4 text-emerald-600 dark:text-emerald-400/80 opacity-70" />
              </div>
            </motion.div>

            {/* Cloche Platter Base / Serving Plate */}
            <div className="relative z-0 w-26 h-3 rounded-full bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 border border-slate-300 dark:border-slate-600 shadow-md flex items-center justify-center -mt-0.5">
              <div className="w-18 h-1 rounded-full bg-gradient-to-r from-emerald-500/60 to-teal-400/60 blur-[0.5px]" />
            </div>
          </div>
        )}

        {variant === "bell" && (
          <div className="relative w-28 h-28 flex flex-col items-center justify-end pb-3">
            {/* Chime Ring Waves */}
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.8],
                  opacity: [0.6, 0],
                }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: "easeOut",
                }}
                className="absolute inset-2 rounded-full border-2 border-amber-400/40 pointer-events-none"
              />
            ))}

            {/* Concierge Service Bell */}
            <motion.div
              animate={{
                scale: [1, 1.05, 0.98, 1],
                rotate: [0, -3, 3, 0],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex flex-col items-center z-10"
            >
              {/* Bell Tapper Knob */}
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border border-amber-200 shadow-sm" />
              <div className="w-1 h-2 bg-amber-600 -mt-0.5" />

              {/* Bell Dome */}
              <div className="w-18 h-10 rounded-t-full bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 border border-amber-200/80 shadow-lg shadow-amber-500/20 relative flex items-center justify-center">
                <div className="absolute top-1 left-2.5 w-3 h-6 rounded-full bg-white/50 blur-[0.5px] -rotate-12" />
                <Bell className="h-4 w-4 text-amber-950/40" />
              </div>

              {/* Bell Stand Base */}
              <div className="w-22 h-3 rounded-full bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 border border-amber-600 shadow-md flex items-center justify-center -mt-0.5">
                <div className="w-16 h-1 rounded-full bg-amber-400/30" />
              </div>
            </motion.div>
          </div>
        )}

        {variant === "minimal" && (
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/20"
            >
              <div className="h-full w-full rounded-[14px] bg-white dark:bg-slate-950 flex items-center justify-center">
                <UtensilsCrossed className="h-7 w-7 text-emerald-500 animate-pulse" />
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Culinary Status Typography */}
      {title ? (
        <div className="flex flex-col items-center mb-3">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-2">
            {title}
          </h3>
          <div className="min-h-[2rem] flex items-center justify-center px-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMessage}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  "inline-flex items-center gap-2 px-3.5 py-1 rounded-full shadow-xs",
                  isRose
                    ? "bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/70"
                    : "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/70"
                )}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full animate-pulse inline-block flex-shrink-0",
                    isRose ? "bg-rose-500" : "bg-emerald-500"
                  )}
                />
                <span
                  className={cn(
                    "text-xs sm:text-sm font-semibold tracking-tight",
                    isRose
                      ? "text-rose-800 dark:text-rose-300"
                      : "text-emerald-800 dark:text-emerald-300"
                  )}
                >
                  {activeMessage}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center mb-2">
          <div className="h-8 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.h3
                key={activeMessage}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight"
              >
                {activeMessage}
              </motion.h3>
            </AnimatePresence>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto mb-2 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Progressive Meter Bar */}
      <div className="w-48 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800/80 overflow-hidden relative mt-2">
        {progress !== undefined ? (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            transition={{ duration: 0.3 }}
            className={cn(
              "h-full rounded-full",
              isRose
                ? "bg-gradient-to-r from-rose-600 via-red-500 to-rose-400"
                : "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500"
            )}
          />
        ) : (
          <motion.div
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={cn(
              "w-1/2 h-full rounded-full",
              isRose
                ? "bg-gradient-to-r from-rose-600 via-red-500 to-rose-400"
                : "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500"
            )}
          />
        )}
      </div>

      {/* DineFlow Brand Tag */}
      {isRose ? (
        <div className="flex items-center gap-1.5 mt-5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
          <span>
            Dine<span className="text-rose-600 dark:text-rose-400">Flow</span> Platform OS
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 mt-5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <UtensilsCrossed className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          <span>
            Dine<span className="text-emerald-600 dark:text-emerald-400">Flow</span> Restaurant OS
          </span>
        </div>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-white/90 dark:bg-[#070A12]/92 transition-all duration-300",
          className
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "py-12 flex items-center justify-center transition-all duration-200",
        className
      )}
    >
      {content}
    </div>
  );
}
