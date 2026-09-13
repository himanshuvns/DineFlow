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
}

export function FloatingCard({
  children,
  className,
  delay = 0,
  duration = 5,
  floatY = 7,
  rotateDeg = 1.2,
  ...props
}: FloatingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{
        opacity: 1,
        y: [0, -floatY, 0],
        rotate: [-rotateDeg, rotateDeg, -rotateDeg],
        scale: 1,
      }}
      transition={{
        opacity: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
        scale: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
        y: {
          duration,
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
        scale: 1.03,
        rotate: 0,
        boxShadow: "0 20px 35px -5px rgba(20, 241, 199, 0.22)",
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      className={cn(
        "relative rounded-2xl p-3.5 select-none transition-colors duration-200",
        "bg-white/90 dark:bg-slate-900/75 backdrop-blur-xl",
        "border border-slate-200/90 dark:border-white/15",
        "shadow-[0_12px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.5)]",
        "text-slate-900 dark:text-white",
        className
      )}
      {...props}
    >
      {/* Subtle top-edge glossy glass highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent pointer-events-none rounded-t-2xl" />
      {children}
    </motion.div>
  );
}
