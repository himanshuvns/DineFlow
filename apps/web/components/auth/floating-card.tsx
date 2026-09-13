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
  floatY = 8,
  rotateDeg = 1.5,
  ...props
}: FloatingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: [0, -floatY, 0],
        rotate: [-rotateDeg, rotateDeg, -rotateDeg],
        scale: 1,
      }}
      transition={{
        opacity: { duration: 0.6, delay },
        scale: { duration: 0.6, delay },
        y: {
          duration,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
          delay,
        },
        rotate: {
          duration: duration * 1.25,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
          delay,
        },
      }}
      whileHover={{
        scale: 1.04,
        rotate: 0,
        boxShadow: "0 20px 35px -5px rgba(20, 241, 199, 0.25)",
        transition: { duration: 0.25 },
      }}
      className={cn(
        "relative rounded-2xl bg-slate-900/75 backdrop-blur-xl border border-white/15 p-3.5 shadow-2xl text-white select-none transition-colors duration-200",
        className
      )}
      {...props}
    >
      {/* Subtle top-edge glossy glass highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none rounded-t-2xl" />
      {children}
    </motion.div>
  );
}
