"use client";

import * as React from "react";

interface PeekingChefProps {
  isPasswordFocused?: boolean;
}

export function PeekingChef({ isPasswordFocused = false }: PeekingChefProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });

  // Smooth damped parallax cursor tracking (lerp physics)
  React.useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (isPasswordFocused) return;
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const chefCenterX = rect.left + rect.width * 0.5;
      const chefCenterY = rect.top + rect.height * 0.45;

      const dx = e.clientX - chefCenterX;
      const dy = e.clientY - chefCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      // Gentle, subtle organic parallax travel (max 4px)
      const maxTravel = 4.0;
      targetX = (dx / dist) * Math.min(maxTravel, dist * 0.015);
      targetY = (dy / dist) * Math.min(maxTravel * 0.75, dist * 0.012);
    };

    // 60fps physics loop with gentle deceleration (lerp factor 0.08)
    const updateMotion = () => {
      if (!isPasswordFocused) {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
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
  }, [isPasswordFocused]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center select-none"
      aria-hidden="true"
    >
      {/* Character Stage with Gentle Breathing and Organic Parallax */}
      <div
        className="relative w-[280px] sm:w-[320px] aspect-[400/500] will-change-transform"
        style={{
          transform: isPasswordFocused
            ? "translate3d(0, 0, 0)"
            : `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          transition: isPasswordFocused ? "transform 0.4s ease-out" : "none",
        }}
      >
        {/* Soft Ambient Counter Drop Shadow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-slate-900/15 dark:bg-black/50 blur-md rounded-full pointer-events-none" />

        {/* ======================================================== */}
        {/* STATE 1: SAME CHARACTER — EYES OPEN                      */}
        {/* ======================================================== */}
        <div
          className="absolute inset-0 transition-opacity duration-300 ease-in-out"
          style={{
            opacity: isPasswordFocused ? 0 : 1,
            pointerEvents: isPasswordFocused ? "none" : "auto",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/chef/chef-open.webp"
            alt="Little chef watching"
            className="w-full h-full object-contain pointer-events-none drop-shadow-md"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* ======================================================== */}
        {/* STATE 2: SAME CHARACTER — EYES CLOSED (PASSWORD MODE)    */}
        {/* ======================================================== */}
        <div
          className="absolute inset-0 transition-opacity duration-300 ease-in-out"
          style={{
            opacity: isPasswordFocused ? 1 : 0,
            pointerEvents: isPasswordFocused ? "auto" : "none",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/chef/chef-closed.webp"
            alt="Little chef with eyes closed"
            className="w-full h-full object-contain pointer-events-none drop-shadow-md"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* Interactive Status Badge Pill                            */}
      {/* ======================================================== */}
      <div className="mt-3 min-h-[32px] flex items-center justify-center">
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
            isPasswordFocused
              ? "bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 shadow-sm scale-105"
              : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {isPasswordFocused ? (
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
    </div>
  );
}
