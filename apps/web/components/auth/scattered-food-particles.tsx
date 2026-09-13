"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScatteredFood {
  id: string;
  emoji: string;
  x: string;
  y: string;
  fontSize: string;
  floatDuration: number;
  floatY: number;
  floatX: number;
  delay: number;
}

// 26 food items positioned strictly OUTSIDE the text zone (x: 0-74%, y: 0-44% is kept 100% pristine)
const SCATTERED_FOODS: ScatteredFood[] = [
  // Top-Right cluster (well clear of header & headline, x: 75% - 96%, y: 5% - 28%)
  { id: "f-1", emoji: "🍕", x: "75%", y: "8%", fontSize: "text-xl sm:text-2xl", floatDuration: 7.8, floatY: 12, floatX: 6, delay: 0.2 },
  { id: "f-2", emoji: "☕", x: "86%", y: "6%", fontSize: "text-base sm:text-lg", floatDuration: 6.5, floatY: 9, floatX: -4, delay: 1.0 },
  { id: "f-3", emoji: "🍩", x: "95%", y: "11%", fontSize: "text-lg sm:text-xl", floatDuration: 8.2, floatY: 13, floatX: 5, delay: 0.5 },
  { id: "f-4", emoji: "🌮", x: "89%", y: "19%", fontSize: "text-lg sm:text-xl", floatDuration: 7.1, floatY: 11, floatX: -6, delay: 1.4 },
  { id: "f-5", emoji: "🥐", x: "96%", y: "27%", fontSize: "text-base sm:text-lg", floatDuration: 6.9, floatY: 10, floatX: 4, delay: 0.8 },

  // Right Periphery (flanking the right side, x: 84% - 96%, y: 34% - 74%)
  { id: "f-6", emoji: "🥟", x: "84%", y: "34%", fontSize: "text-base sm:text-lg", floatDuration: 8.0, floatY: 12, floatX: 5, delay: 0.7 },
  { id: "f-7", emoji: "🍟", x: "94%", y: "37%", fontSize: "text-lg sm:text-xl", floatDuration: 7.3, floatY: 11, floatX: -5, delay: 1.2 },
  { id: "f-8", emoji: "🍜", x: "92%", y: "47%", fontSize: "text-xl sm:text-2xl", floatDuration: 7.9, floatY: 14, floatX: 6, delay: 1.5 },
  { id: "f-9", emoji: "🥩", x: "87%", y: "57%", fontSize: "text-base sm:text-lg", floatDuration: 7.2, floatY: 10, floatX: -4, delay: 2.0 },
  { id: "f-10", emoji: "🍣", x: "95%", y: "66%", fontSize: "text-lg sm:text-xl", floatDuration: 8.3, floatY: 13, floatX: 5, delay: 0.9 },
  { id: "f-11", emoji: "🥞", x: "86%", y: "74%", fontSize: "text-base sm:text-lg", floatDuration: 7.5, floatY: 11, floatX: -5, delay: 2.1 },

  // Left Periphery STRICTLY BELOW Subtitle (x: 3% - 15%, y: 45% - 79%)
  { id: "f-12", emoji: "🥑", x: "4%", y: "45%", fontSize: "text-base sm:text-lg", floatDuration: 7.0, floatY: 10, floatX: 3, delay: 1.6 },
  { id: "f-13", emoji: "🍋", x: "13%", y: "51%", fontSize: "text-sm sm:text-base", floatDuration: 6.4, floatY: 8, floatX: 4, delay: 0.3 },
  { id: "f-14", emoji: "🍔", x: "4%", y: "58%", fontSize: "text-xl sm:text-2xl", floatDuration: 7.7, floatY: 13, floatX: -4, delay: 0.4 },
  { id: "f-15", emoji: "🥨", x: "14%", y: "65%", fontSize: "text-sm sm:text-base", floatDuration: 6.8, floatY: 9, floatX: 4, delay: 1.1 },
  { id: "f-16", emoji: "🍤", x: "6%", y: "73%", fontSize: "text-base sm:text-lg", floatDuration: 7.4, floatY: 11, floatX: -4, delay: 1.7 },
  { id: "f-17", emoji: "🥯", x: "15%", y: "79%", fontSize: "text-sm sm:text-base", floatDuration: 6.7, floatY: 8, floatX: -3, delay: 2.2 },

  // Bottom Counter & Trust Footer Periphery (y: 86% - 95%)
  { id: "f-18", emoji: "🍰", x: "8%", y: "87%", fontSize: "text-lg sm:text-xl", floatDuration: 7.6, floatY: 12, floatX: 5, delay: 0.5 },
  { id: "f-19", emoji: "☕", x: "22%", y: "89%", fontSize: "text-base sm:text-lg", floatDuration: 6.6, floatY: 9, floatX: -4, delay: 1.9 },
  { id: "f-20", emoji: "🍦", x: "36%", y: "91%", fontSize: "text-sm sm:text-base", floatDuration: 7.3, floatY: 10, floatX: 4, delay: 1.0 },
  { id: "f-21", emoji: "🍔", x: "48%", y: "93%", fontSize: "text-base sm:text-lg", floatDuration: 8.0, floatY: 11, floatX: -4, delay: 0.3 },
  { id: "f-22", emoji: "🧋", x: "60%", y: "92%", fontSize: "text-sm sm:text-base", floatDuration: 7.1, floatY: 9, floatX: -3, delay: 2.3 },
  { id: "f-23", emoji: "🍟", x: "72%", y: "89%", fontSize: "text-base sm:text-lg", floatDuration: 7.0, floatY: 10, floatX: 5, delay: 2.4 },
  { id: "f-24", emoji: "🍩", x: "82%", y: "86%", fontSize: "text-lg sm:text-xl", floatDuration: 7.8, floatY: 12, floatX: -5, delay: 0.8 },
  { id: "f-25", emoji: "🍪", x: "92%", y: "87%", fontSize: "text-sm sm:text-base", floatDuration: 6.5, floatY: 8, floatX: 4, delay: 1.4 },
  { id: "f-26", emoji: "🍇", x: "95%", y: "77%", fontSize: "text-sm sm:text-base", floatDuration: 6.9, floatY: 8, floatX: 3, delay: 0.9 },
];

export function ScatteredFoodParticles() {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [poppedId, setPoppedId] = React.useState<string | null>(null);

  const handlePop = (id: string) => {
    setPoppedId(id);
    setTimeout(() => setPoppedId(null), 600);
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-15">
      {SCATTERED_FOODS.map((item) => {
        const isHovered = hoveredId === item.id;
        const isPopped = poppedId === item.id;

        return (
          <div
            key={item.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
            style={{
              left: item.x,
              top: item.y,
            }}
          >
            {/* Smooth floating drift */}
            <motion.div
              animate={{
                y: [0, -item.floatY, 0],
                x: [0, item.floatX, 0],
                rotate: [-4, 4, -4],
              }}
              transition={{
                duration: item.floatDuration,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                delay: item.delay,
              }}
            >
              {/* Interactive Click Pop / Spin Animation */}
              <motion.div
                animate={
                  isPopped
                    ? {
                        scale: [1, 1.6, 1],
                        rotate: [0, 360],
                      }
                    : {
                        scale: isHovered ? 1.4 : 1,
                        rotate: 0,
                      }
                }
                transition={
                  isPopped
                    ? { duration: 0.5, ease: "backOut" }
                    : { duration: 0.25, ease: "easeOut" }
                }
                onClick={() => handlePop(item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="cursor-pointer select-none relative p-2"
                title=""
              >
                {/* 
                  Raw Food Emoji (NO outer circle or border container):
                  - Default: correlated with background (emerald/teal tint & low opacity)
                  - Hover: reveals 100% exact full vibrant food colors with neon glow
                */}
                <span
                  className={cn(
                    "block transition-all duration-300 ease-out select-none",
                    item.fontSize,
                    isHovered || isPopped
                      ? "filter-none opacity-100 drop-shadow-[0_4px_16px_rgba(20,241,199,0.7)]"
                      : "grayscale contrast-125 opacity-25 dark:opacity-30 brightness-75 dark:brightness-90 sepia hue-rotate-110 dark:hue-rotate-130"
                  )}
                >
                  {item.emoji}
                </span>

                {/* Subtle micro sparkle on pop */}
                {isPopped && (
                  <motion.span
                    initial={{ opacity: 1, scale: 0.5, y: 0 }}
                    animate={{ opacity: 0, scale: 1.5, y: -16 }}
                    transition={{ duration: 0.5 }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs pointer-events-none text-emerald-400 font-bold"
                  >
                    ✨
                  </motion.span>
                )}
              </motion.div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
