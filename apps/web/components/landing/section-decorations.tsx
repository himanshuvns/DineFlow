"use client";

import * as React from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * SectionDivider renders a sleek 1px hairline with a centered glowing gradient
 * to visually demarcate section boundaries on the landing page.
 */
export function SectionDivider({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`w-full flex items-center justify-center overflow-hidden pointer-events-none relative z-10 ${className}`}
    >
      <div className="w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-emerald-500/35 to-transparent relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-3 bg-emerald-500/15 blur-sm rounded-full pointer-events-none" />
      </div>
    </div>
  );
}

/**
 * ParallaxFloatingOrb renders a soft glowing ambient blur orb that glides
 * vertically as the user scrolls, creating organic depth.
 */
export function ParallaxFloatingOrb({
  className = "",
  color = "emerald",
  speed = 40,
}: {
  className?: string;
  color?: "emerald" | "amber" | "teal";
  speed?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [-speed, speed]
  );

  const colorStyles = {
    emerald: "from-emerald-500/15 via-teal-500/10 to-transparent",
    amber: "from-amber-500/15 via-orange-500/10 to-transparent",
    teal: "from-teal-500/15 via-emerald-500/10 to-transparent",
  }[color];

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <motion.div
        style={{ y }}
        className={`absolute rounded-full blur-3xl bg-gradient-to-tr ${colorStyles} pointer-events-none ${className}`}
      />
    </div>
  );
}

/**
 * ParallaxFloat wraps elements (mockups, cards, badges) to subtly translate
 * them vertically as the section scrolls into view.
 */
export function ParallaxFloat({
  children,
  offset = 24,
  className = "",
}: {
  children: React.ReactNode;
  offset?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [offset, -offset]
  );

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
