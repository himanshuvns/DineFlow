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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [internalPasswordFocus, setInternalPasswordFocus] = React.useState(false);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });

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

  // Natural damped cursor tracking with requestAnimationFrame (8-12px max movement)
  React.useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (isClosed) return;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const chefCenterX = rect.left + rect.width * 0.5;
      const chefCenterY = rect.top + rect.height * 0.45;

      const dx = e.clientX - chefCenterX;
      const dy = e.clientY - chefCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      // Smooth organic travel (max 8-10px travel)
      const maxTravel = 8.5;
      targetX = (dx / dist) * Math.min(maxTravel, dist * 0.025);
      targetY = (dy / dist) * Math.min(maxTravel * 0.75, dist * 0.02);
    };

    // 60fps lerp physics loop (lerp factor 0.085 for responsive yet buttery-smooth tracking)
    const updateMotion = () => {
      if (!isClosed) {
        currentX += (targetX - currentX) * 0.085;
        currentY += (targetY - currentY) * 0.085;
        setOffset({
          x: Math.round(currentX * 100) / 100,
          y: Math.round(currentY * 100) / 100,
        });
      } else {
        // Smoothly return to center when password field is focused
        currentX += (0 - currentX) * 0.15;
        currentY += (0 - currentY) * 0.15;
        setOffset({
          x: Math.round(currentX * 100) / 100,
          y: Math.round(currentY * 100) / 100,
        });
      }
      animFrameId = requestAnimationFrame(updateMotion);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    animFrameId = requestAnimationFrame(updateMotion);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animFrameId);
    };
  }, [isClosed]);

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col items-center select-none relative", className)}
      aria-hidden="true"
    >
      {/* 3D Chef Character Stage */}
      <div
        className="relative w-[280px] sm:w-[320px] md:w-[340px] aspect-[400/500] will-change-transform"
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          transition: isClosed ? "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
        }}
      >
        {/* Soft Ambient Counter Drop Shadow */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-black/60 blur-lg rounded-full pointer-events-none" />

        {/* ======================================================== */}
        {/* STATE 1: EYES OPEN (CURSOR TRACKING)                     */}
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
            className="w-full h-full object-contain pointer-events-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* ======================================================== */}
        {/* STATE 2: EYES CLOSED (PASSWORD ENTERING)                 */}
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
            alt="DineFlow Little Chef covering eyes"
            className="w-full h-full object-contain pointer-events-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]"
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
                ? "bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 shadow-[0_0_15px_rgba(20,241,199,0.3)] scale-105"
                : "bg-slate-900/60 border border-white/10 text-slate-300"
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
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14F1C7] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#14F1C7]" />
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
