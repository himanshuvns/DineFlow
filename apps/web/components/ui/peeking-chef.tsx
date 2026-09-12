"use client";

import * as React from "react";

interface PeekingChefProps {
  isPasswordFocused?: boolean;
}

export function PeekingChef({ isPasswordFocused = false }: PeekingChefProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [headTilt, setHeadTilt] = React.useState({ rotateX: 0, rotateY: 0, translateX: 0, translateY: 0 });

  // Smooth mouse movement tracking using requestAnimationFrame
  React.useEffect(() => {
    if (isPasswordFocused) {
      setHeadTilt({ rotateX: 0, rotateY: 0, translateX: 0, translateY: 0 });
      return;
    }

    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        // Approximate face center on screen
        const faceX = rect.left + rect.width * 0.5;
        const faceY = rect.top + rect.height * 0.45;

        const dx = e.clientX - faceX;
        const dy = e.clientY - faceY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        // Subtle, natural 3D head movement following cursor
        const maxTilt = 4.0;
        const tiltX = Math.max(-maxTilt, Math.min(maxTilt, -(dy / window.innerHeight) * 8));
        const tiltY = Math.max(-maxTilt * 1.3, Math.min(maxTilt * 1.3, (dx / window.innerWidth) * 10));
        
        const moveX = Math.max(-4, Math.min(4, (dx / dist) * Math.min(4, dist * 0.015)));
        const moveY = Math.max(-3, Math.min(3, (dy / dist) * Math.min(3, dist * 0.012)));

        setHeadTilt({ rotateX: tiltX, rotateY: tiltY, translateX: moveX, translateY: moveY });
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isPasswordFocused]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center select-none"
      aria-hidden="true"
    >
      {/* 3D Perspective Stage */}
      <div
        className="relative w-[280px] sm:w-[320px] aspect-[400/500] transition-all duration-300 ease-out"
        style={{
          perspective: "1000px",
          transform: isPasswordFocused
            ? "translateY(2px) scale(0.99)"
            : `perspective(1000px) rotateX(${headTilt.rotateX}deg) rotateY(${headTilt.rotateY}deg) translate3d(${headTilt.translateX}px, ${headTilt.translateY}px, 0)`,
        }}
      >
        {/* Soft Ambient Counter Drop Shadow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-slate-900/15 dark:bg-black/50 blur-md rounded-full pointer-events-none" />

        {/* ======================================================== */}
        {/* STATE 1: SAME CHARACTER — EYES OPEN                      */}
        {/* ======================================================== */}
        <div
          className="absolute inset-0 transition-all duration-300 ease-out"
          style={{
            opacity: isPasswordFocused ? 0 : 1,
            transform: isPasswordFocused ? "scale(0.98)" : "scale(1)",
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
          className="absolute inset-0 transition-all duration-300 ease-out"
          style={{
            opacity: isPasswordFocused ? 1 : 0,
            transform: isPasswordFocused ? "scale(1)" : "scale(0.98)",
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
