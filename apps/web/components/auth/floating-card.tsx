"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  floatY?: number;
  rotateDeg?: number;
  isHighlighted?: boolean;
}

export function FloatingCard({
  children,
  className,
  delay = 0,
  duration = 5,
  floatY = 7,
  rotateDeg = 1.2,
  isHighlighted = false,
  ...props
}: FloatingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{
        opacity: 1,
        y: isHighlighted ? [0, -floatY - 4, 0] : [0, -floatY, 0],
        rotate: isHighlighted ? [0, 0, 0] : [-rotateDeg, rotateDeg, -rotateDeg],
        scale: isHighlighted ? 1.06 : 1,
      }}
      transition={{
        opacity: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
        scale: { duration: 0.3, ease: "easeOut" },
        y: {
          duration: isHighlighted ? 2.5 : duration,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
          delay,
        },
        rotate: {
          duration: duration * 1.3,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
          delay,
        },
      }}
      whileHover={{
        scale: 1.05,
        rotate: 0,
        boxShadow: "0 20px 35px -5px rgba(20, 241, 199, 0.28)",
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "relative rounded-2xl p-3.5 select-none transition-all duration-300",
        "bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl",
        isHighlighted
          ? "border-emerald-500 dark:border-[#14F1C7] shadow-[0_0_28px_rgba(20,241,199,0.45)] ring-2 ring-emerald-500/30 dark:ring-[#14F1C7]/30"
          : "border border-slate-200/90 dark:border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.5)]",
        "text-slate-900 dark:text-white",
        className
      )}
      {...props}
    >
      {/* Subtle top-edge glossy glass highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 dark:via-white/30 to-transparent pointer-events-none rounded-t-2xl" />
      {children}
    </motion.div>
  );
}

