"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ChefMascotProps {
  isPasswordFocused?: boolean;
  className?: string;
  showBadge?: boolean;
}

export function ChefMascot({
  isPasswordFocused: controlledPasswordFocus,
  className,
  showBadge = false,
}: ChefMascotProps) {
  const [internalPasswordFocus, setInternalPasswordFocus] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isClicked, setIsClicked] = React.useState(false);

  // Listen for global custom events from password fields
  React.useEffect(() => {
    const handleFocus = () => setInternalPasswordFocus(true);
    const handleBlur = () => setInternalPasswordFocus(false);

    window.addEventListener("password-field-focus", handleFocus);
    window.addEventListener("password-field-blur", handleBlur);

    return () => {
      window.removeEventListener("password-field-focus", handleFocus);
      window.removeEventListener("password-field-blur", handleBlur);
    };
  }, []);

  const isClosed = controlledPasswordFocus ?? internalPasswordFocus;

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 500);
  };

  return (
    <div
      className={cn("flex flex-col items-center select-none", className)}
      style={{ position: "relative" }}
      aria-hidden="true"
    >
      {/* Interactive Speech Bubble Tooltip on Hover — z-50 escapes floating card z-30 context */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md shadow-lg transition-all duration-300 pointer-events-none",
          "bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-white/15 text-slate-800 dark:text-white",
          isHovered
            ? "opacity-100 scale-100 shadow-[0_8px_20px_rgba(20,241,199,0.3)]"
            : "opacity-0 scale-95"
        )}
        style={{ bottom: "calc(100% + 10px)", zIndex: 60 }}
      >
        {isClosed ? (
          <span className="flex items-center gap-1.5">
            <span>🙈</span>
            <span>Eyes closed! Your password is secure</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <span>👨‍🍳</span>
            <span>Chef Antonio • Ready to serve!</span>
            <span className="text-emerald-500">✨</span>
          </span>
        )}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-white/95 dark:bg-slate-900/90 border-r border-b border-slate-200 dark:border-white/15 -mt-1" />
      </div>

      {/* 3D Chef Character Stage: Rock-solid anchored on counter (zero translation jump) */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        className={cn(
          "relative w-[260px] sm:w-[290px] lg:w-[310px] aspect-[400/500] cursor-pointer transition-transform duration-300",
          isClicked ? "scale-95" : isHovered ? "scale-[1.02]" : "scale-100"
        )}
      >
        {/* Soft Ambient Counter Drop Shadow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-6 bg-black/40 dark:bg-black/70 blur-md rounded-full pointer-events-none" />

        {/* ======================================================== */}
        {/* STATE 1: EYES OPEN (AWAKE & ATTENTIVE)                   */}
        {/* ======================================================== */}
        <div
          className="absolute inset-0 transition-opacity duration-300 ease-in-out"
          style={{
            opacity: isClosed ? 0 : 1,
            pointerEvents: isClosed ? "none" : "auto",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/chef/chef-open.webp"
            alt="DineFlow Little Chef"
            className="w-full h-full object-contain pointer-events-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] dark:drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* ======================================================== */}
        {/* STATE 2: EYES CLOSED (SEAMLESS PIXEL-REGISTERED BLINK)   */}
        {/* ======================================================== */}
        <div
          className="absolute inset-0 transition-opacity duration-300 ease-in-out"
          style={{
            opacity: isClosed ? 1 : 0,
            pointerEvents: isClosed ? "auto" : "none",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/chef/chef-closed.webp"
            alt="DineFlow Little Chef closing eyes"
            className="w-full h-full object-contain pointer-events-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] dark:drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>

      {/* Optional interactive badge */}
      {showBadge && (
        <div className="mt-2 min-h-[30px] flex items-center justify-center">
          <div
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-300",
              isClosed
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 shadow-[0_0_15px_rgba(20,241,199,0.3)] scale-105"
                : "bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
            )}
          >
            {isClosed ? (
              <>
                <span className="text-sm">🙈</span>
                <span>Eyes closed! Not peeking</span>
              </>
            ) : (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>Watching over your workspace</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
