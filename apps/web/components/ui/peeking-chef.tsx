"use client";

import * as React from "react";

interface PeekingChefProps {
  isPasswordFocused?: boolean;
}

export function PeekingChef({ isPasswordFocused = false }: PeekingChefProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [pupilOffset, setPupilOffset] = React.useState({ x: 0, y: 0 });
  const [headTilt, setHeadTilt] = React.useState({ rotateX: 0, rotateY: 0 });
  const [blinking, setBlinking] = React.useState(false);

  // Smooth mouse movement tracking using requestAnimationFrame
  React.useEffect(() => {
    if (isPasswordFocused) {
      setPupilOffset({ x: 0, y: 0 });
      setHeadTilt({ rotateX: 0, rotateY: 0 });
      return;
    }

    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        // Approximate face center on screen
        const faceX = rect.left + rect.width * 0.65;
        const faceY = rect.top + rect.height * 0.45;

        const dx = e.clientX - faceX;
        const dy = e.clientY - faceY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        // Realistic natural pupil movement radius (max ~6.5px)
        const maxPupilTravel = 6.5;
        const travel = Math.min(maxPupilTravel, dist * 0.025);
        const pupilX = (dx / dist) * travel;
        const pupilY = (dy / dist) * travel;

        // Subtle 3D head parallax tilt (max ~3.5 deg)
        const tiltX = Math.max(-3.5, Math.min(3.5, -(dy / window.innerHeight) * 7));
        const tiltY = Math.max(-4.5, Math.min(4.5, (dx / window.innerWidth) * 9));

        setPupilOffset({ x: pupilX, y: pupilY });
        setHeadTilt({ rotateX: tiltX, rotateY: tiltY });
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isPasswordFocused]);

  // Periodic natural blinking every 4s
  React.useEffect(() => {
    if (isPasswordFocused) return;
    const interval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 140);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPasswordFocused]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center select-none"
      aria-hidden="true"
    >
      {/* 3D Perspective Stage */}
      <div
        className="relative w-[280px] sm:w-[310px] aspect-[400/500] transition-transform duration-200 ease-out"
        style={{
          perspective: "1000px",
          transform: isPasswordFocused
            ? "translateY(0px) scale(1.02)"
            : `perspective(1000px) rotateX(${headTilt.rotateX}deg) rotateY(${headTilt.rotateY}deg)`,
        }}
      >
        {/* Ambient Counter Glow / Drop Shadow */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-slate-900/15 dark:bg-black/40 blur-lg rounded-full pointer-events-none" />

        {/* ======================================================== */}
        {/* STATE 1: OPEN EYES & CURSOR TRACKING                     */}
        {/* ======================================================== */}
        <div
          className="absolute inset-0 transition-all duration-350 ease-out"
          style={{
            opacity: isPasswordFocused ? 0 : 1,
            transform: isPasswordFocused ? "scale(0.95) translateY(4px)" : "scale(1) translateY(0)",
            pointerEvents: isPasswordFocused ? "none" : "auto",
          }}
        >
          {/* Base Chef Image with Clean Eye Sclera */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/chef/chef-looking-base.webp"
            alt="Chef watching"
            className="w-full h-full object-contain pointer-events-none drop-shadow-md"
            loading="eager"
            decoding="async"
          />

          {/* Left Pupil (Viewer's Left, Character's Right) */}
          <div
            className="absolute pointer-events-none will-change-transform"
            style={{
              left: "50.75%",
              top: "47.20%",
              width: "11.0%",
              height: "8.8%",
              transform: `translate3d(${pupilOffset.x}px, ${pupilOffset.y}px, 0) ${
                blinking ? "scaleY(0.08)" : "scaleY(1)"
              }`,
              transformOrigin: "center 60%",
              transition: blinking
                ? "transform 0.08s ease-in-out"
                : "transform 110ms cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/chef/chef-pupil-left.webp"
              alt=""
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>

          {/* Right Pupil (Viewer's Right, Character's Left) */}
          <div
            className="absolute pointer-events-none will-change-transform"
            style={{
              left: "70.0%",
              top: "42.0%",
              width: "10.0%",
              height: "8.0%",
              transform: `translate3d(${pupilOffset.x * 0.95}px, ${pupilOffset.y * 0.95}px, 0) ${
                blinking ? "scaleY(0.08)" : "scaleY(1)"
              }`,
              transformOrigin: "center 60%",
              transition: blinking
                ? "transform 0.08s ease-in-out"
                : "transform 110ms cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/chef/chef-pupil-right.webp"
              alt=""
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* STATE 2: COVERING EYES WITH HANDS (PASSWORD MODE)        */}
        {/* ======================================================== */}
        <div
          className="absolute inset-0 transition-all duration-350 ease-out"
          style={{
            opacity: isPasswordFocused ? 1 : 0,
            transform: isPasswordFocused ? "scale(1) translateY(0)" : "scale(0.95) translateY(4px)",
            pointerEvents: isPasswordFocused ? "auto" : "none",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/chef/chef-covering-eyes.webp"
            alt="Chef covering eyes"
            className="w-full h-full object-contain pointer-events-none drop-shadow-md"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* Interactive Status Caption Pill                          */}
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
              <span>Not peeking, promise!</span>
            </>
          ) : (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Watching your cursor</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
