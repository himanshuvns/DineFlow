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

const SCATTERED_FOODS: ScatteredFood[] = [
  // Top header area (around logo & badge)
  { id: "f-1", emoji: "🥐", x: "6%", y: "11%", fontSize: "text-lg sm:text-xl", floatDuration: 7.2, floatY: 12, floatX: 6, delay: 0.2 },
  { id: "f-2", emoji: "☕", x: "22%", y: "8%", fontSize: "text-base sm:text-lg", floatDuration: 6.5, floatY: 10, floatX: -5, delay: 1.0 },
  { id: "f-3", emoji: "🍕", x: "78%", y: "9%", fontSize: "text-xl sm:text-2xl", floatDuration: 8.0, floatY: 14, floatX: 7, delay: 0.6 },
  { id: "f-4", emoji: "🍩", x: "92%", y: "12%", fontSize: "text-base sm:text-lg", floatDuration: 7.5, floatY: 11, floatX: -4, delay: 1.5 },

  // Upper headline & subtitle region
  { id: "f-5", emoji: "🥑", x: "4%", y: "24%", fontSize: "text-base sm:text-lg", floatDuration: 6.8, floatY: 10, floatX: 5, delay: 1.8 },
  { id: "f-6", emoji: "🌮", x: "91%", y: "22%", fontSize: "text-lg sm:text-xl", floatDuration: 7.0, floatY: 12, floatX: -6, delay: 1.2 },
  { id: "f-7", emoji: "🥪", x: "82%", y: "27%", fontSize: "text-base sm:text-lg", floatDuration: 6.9, floatY: 9, floatX: 5, delay: 0.7 },
  { id: "f-8", emoji: "🥗", x: "28%", y: "30%", fontSize: "text-base sm:text-lg", floatDuration: 7.6, floatY: 11, floatX: -5, delay: 2.1 },

  // Mid-upper area (above cards & beside chef hat)
  { id: "f-9", emoji: "🧀", x: "16%", y: "35%", fontSize: "text-sm sm:text-base", floatDuration: 6.4, floatY: 8, floatX: 4, delay: 1.3 },
  { id: "f-10", emoji: "🥞", x: "48%", y: "31%", fontSize: "text-lg sm:text-xl", floatDuration: 8.2, floatY: 13, floatX: -6, delay: 0.4 },
  { id: "f-11", emoji: "🥟", x: "72%", y: "33%", fontSize: "text-base sm:text-lg", floatDuration: 7.4, floatY: 10, floatX: 6, delay: 1.9 },
  { id: "f-12", emoji: "🍟", x: "88%", y: "38%", fontSize: "text-lg sm:text-xl", floatDuration: 7.1, floatY: 12, floatX: -5, delay: 0.9 },

  // Mid area (around chef shoulders and cards)
  { id: "f-13", emoji: "🍔", x: "8%", y: "45%", fontSize: "text-xl sm:text-2xl", floatDuration: 7.9, floatY: 14, floatX: -6, delay: 0.3 },
  { id: "f-14", emoji: "🍜", x: "93%", y: "48%", fontSize: "text-xl sm:text-2xl", floatDuration: 7.8, floatY: 13, floatX: 7, delay: 1.6 },
  { id: "f-15", emoji: "🍣", x: "5%", y: "57%", fontSize: "text-lg sm:text-xl", floatDuration: 8.4, floatY: 15, floatX: 6, delay: 1.1 },
  { id: "f-16", emoji: "🥩", x: "91%", y: "60%", fontSize: "text-base sm:text-lg", floatDuration: 7.3, floatY: 11, floatX: -5, delay: 2.3 },
  { id: "f-17", emoji: "🥨", x: "18%", y: "60%", fontSize: "text-sm sm:text-base", floatDuration: 6.7, floatY: 9, floatX: 5, delay: 0.5 },

  // Lower-mid area (beside chef arms & cards)
  { id: "f-18", emoji: "🍤", x: "12%", y: "69%", fontSize: "text-base sm:text-lg", floatDuration: 7.6, floatY: 12, floatX: -4, delay: 1.7 },
  { id: "f-19", emoji: "🍕", x: "84%", y: "70%", fontSize: "text-lg sm:text-xl", floatDuration: 8.1, floatY: 14, floatX: 6, delay: 0.8 },
  { id: "f-20", emoji: "🥯", x: "4%", y: "76%", fontSize: "text-sm sm:text-base", floatDuration: 6.9, floatY: 9, floatX: -4, delay: 2.0 },
  { id: "f-21", emoji: "🌮", x: "94%", y: "75%", fontSize: "text-base sm:text-lg", floatDuration: 7.2, floatY: 11, floatX: 5, delay: 1.4 },

  // Bottom counter & footer area
  { id: "f-22", emoji: "🍰", x: "10%", y: "83%", fontSize: "text-lg sm:text-xl", floatDuration: 7.7, floatY: 12, floatX: 5, delay: 0.6 },
  { id: "f-23", emoji: "☕", x: "24%", y: "86%", fontSize: "text-base sm:text-lg", floatDuration: 6.6, floatY: 9, floatX: -5, delay: 1.8 },
  { id: "f-24", emoji: "🍦", x: "36%", y: "88%", fontSize: "text-sm sm:text-base", floatDuration: 7.4, floatY: 10, floatX: 4, delay: 1.2 },
  { id: "f-25", emoji: "🍔", x: "50%", y: "91%", fontSize: "text-base sm:text-lg", floatDuration: 8.0, floatY: 11, floatX: -4, delay: 0.4 },
  { id: "f-26", emoji: "🍟", x: "65%", y: "87%", fontSize: "text-base sm:text-lg", floatDuration: 7.0, floatY: 10, floatX: 5, delay: 2.2 },
  { id: "f-27", emoji: "🍩", x: "77%", y: "84%", fontSize: "text-lg sm:text-xl", floatDuration: 7.8, floatY: 12, floatX: -6, delay: 1.0 },
  { id: "f-28", emoji: "🍪", x: "89%", y: "86%", fontSize: "text-sm sm:text-base", floatDuration: 6.5, floatY: 8, floatX: 4, delay: 1.5 },
  { id: "f-29", emoji: "🧋", x: "42%", y: "94%", fontSize: "text-sm sm:text-base", floatDuration: 7.2, floatY: 9, floatX: -3, delay: 2.4 },
  { id: "f-30", emoji: "🍇", x: "71%", y: "93%", fontSize: "text-sm sm:text-base", floatDuration: 6.8, floatY: 8, floatX: 3, delay: 0.8 },
];

export function ScatteredFoodParticles() {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-15">
      {SCATTERED_FOODS.map((item) => {
        const isHovered = hoveredId === item.id;

        return (
          <div
            key={item.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
            style={{
              left: item.x,
              top: item.y,
            }}
          >
            {/* Smooth sinusoidal floating drift */}
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
              <div
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="cursor-pointer select-none transition-transform duration-300 ease-out"
                style={{
                  transform: isHovered ? "scale(1.35)" : "scale(1)",
                }}
              >
                {/* 
                  Raw Food Emoji (NO outer circle or border container):
                  - Default: correlated with background (emerald/teal monochrome tint & low opacity)
                  - Hover: reveals 100% exact full vibrant food colors!
                */}
                <span
                  className={cn(
                    "block transition-all duration-300 ease-out select-none",
                    item.fontSize,
                    isHovered
                      ? "filter-none opacity-100 drop-shadow-[0_4px_12px_rgba(20,241,199,0.5)]"
                      : "grayscale contrast-125 opacity-25 dark:opacity-30 brightness-75 dark:brightness-90 sepia hue-rotate-110 dark:hue-rotate-130 hover:opacity-100"
                  )}
                >
                  {item.emoji}
                </span>
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
