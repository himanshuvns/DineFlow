"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScatteredFood {
  id: string;
  emoji: string;
  name: string;
  x: string;
  y: string;
  size: "sm" | "md" | "lg";
  floatDuration: number;
  floatY: number;
  floatX: number;
  delay: number;
}

const SCATTERED_FOODS: ScatteredFood[] = [
  // Top region
  { id: "croissant-1", emoji: "🥐", name: "Warm Croissant", x: "7%", y: "14%", size: "md", floatDuration: 7.2, floatY: 14, floatX: 6, delay: 0.2 },
  { id: "coffee-1", emoji: "☕", name: "Craft Espresso", x: "24%", y: "10%", size: "sm", floatDuration: 6.5, floatY: 10, floatX: -5, delay: 1.0 },
  { id: "pizza-1", emoji: "🍕", name: "Stone-fired Pizza", x: "80%", y: "12%", size: "lg", floatDuration: 8.0, floatY: 16, floatX: 8, delay: 0.6 },
  { id: "taco-1", emoji: "🌮", name: "Street Taco", x: "92%", y: "24%", size: "md", floatDuration: 7.0, floatY: 12, floatX: -6, delay: 1.4 },
  
  // Upper-mid region
  { id: "avocado-1", emoji: "🥑", name: "Fresh Avocado", x: "5%", y: "30%", size: "sm", floatDuration: 6.8, floatY: 11, floatX: 5, delay: 2.0 },
  { id: "salad-1", emoji: "🥗", name: "Crisp Salad", x: "28%", y: "36%", size: "sm", floatDuration: 7.5, floatY: 13, floatX: -4, delay: 0.8 },
  { id: "donut-1", emoji: "🍩", name: "Glazed Donut", x: "72%", y: "34%", size: "md", floatDuration: 8.2, floatY: 15, floatX: 7, delay: 1.8 },
  
  // Mid region (around chef & floating cards)
  { id: "burger-1", emoji: "🍔", name: "Smash Burger", x: "12%", y: "48%", size: "lg", floatDuration: 7.8, floatY: 14, floatX: -7, delay: 0.4 },
  { id: "fries-1", emoji: "🍟", name: "Truffle Fries", x: "88%", y: "45%", size: "md", floatDuration: 6.9, floatY: 12, floatX: 6, delay: 1.2 },
  { id: "sushi-1", emoji: "🍣", name: "Salmon Sushi", x: "6%", y: "64%", size: "md", floatDuration: 8.5, floatY: 15, floatX: 8, delay: 1.6 },
  { id: "ramen-1", emoji: "🍜", name: "Miso Ramen", x: "90%", y: "62%", size: "lg", floatDuration: 7.4, floatY: 13, floatX: -6, delay: 0.5 },
  
  // Lower region (near counter)
  { id: "cake-1", emoji: "🍰", name: "Strawberry Tart", x: "10%", y: "80%", size: "md", floatDuration: 8.1, floatY: 14, floatX: 5, delay: 2.2 },
  { id: "pizza-2", emoji: "🍕", name: "Margherita Pizza", x: "84%", y: "78%", size: "sm", floatDuration: 7.1, floatY: 11, floatX: -5, delay: 1.1 },
  { id: "burger-2", emoji: "🍔", name: "Classic Burger", x: "22%", y: "86%", size: "sm", floatDuration: 6.6, floatY: 10, floatX: 6, delay: 0.9 },
  { id: "coffee-2", emoji: "☕", name: "Hot Cappuccino", x: "74%", y: "86%", size: "md", floatDuration: 7.7, floatY: 13, floatX: -7, delay: 1.7 },
  { id: "taco-2", emoji: "🌮", name: "Crispy Taco", x: "56%", y: "90%", size: "sm", floatDuration: 7.3, floatY: 12, floatX: 4, delay: 2.5 },
];

export function ScatteredFoodParticles() {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-15">
      {SCATTERED_FOODS.map((item) => {
        const isHovered = hoveredId === item.id;

        const sizeClasses = {
          sm: "h-7 w-7 sm:h-8 sm:w-8 text-[15px] sm:text-base",
          md: "h-9 w-9 sm:h-10 sm:w-10 text-[18px] sm:text-xl",
          lg: "h-11 w-11 sm:h-12 sm:w-12 text-[22px] sm:text-2xl",
        }[item.size];

        return (
          <div
            key={item.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
            style={{
              left: item.x,
              top: item.y,
            }}
          >
            {/* Smooth sinusoidal floating animation */}
            <motion.div
              animate={{
                y: [0, -item.floatY, 0],
                x: [0, item.floatX, 0],
                rotate: [-3, 3, -3],
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
                className="group relative cursor-pointer"
              >
                {/* 
                  Food Capsule:
                  - Default: correlated with background color (dark teal/emerald silhouette, low opacity)
                  - Hover: reveals 100% exact full food color, scales up with emerald aura
                */}
                <div
                  className={cn(
                    "relative rounded-full flex items-center justify-center transition-all duration-300 ease-out",
                    sizeClasses,
                    isHovered
                      ? "scale-135 z-50 bg-white/95 dark:bg-[#0F172A]/95 border-emerald-400 dark:border-[#14F1C7] shadow-[0_0_25px_rgba(20,241,199,0.55)] ring-2 ring-emerald-400/40"
                      : "bg-emerald-500/5 dark:bg-[#14F1C7]/5 border border-emerald-500/15 dark:border-[#14F1C7]/15 shadow-xs"
                  )}
                >
                  <span
                    className={cn(
                      "transition-all duration-300 ease-out select-none",
                      isHovered
                        ? "filter-none opacity-100 scale-110"
                        : "grayscale contrast-125 opacity-30 dark:opacity-35 brightness-75 dark:brightness-90 sepia hue-rotate-110 dark:hue-rotate-130"
                    )}
                  >
                    {item.emoji}
                  </span>
                </div>

                {/* Sleek Tooltip on Hover */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.88 }}
                    animate={{ opacity: 1, y: -6, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.88 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2.5 py-1 rounded-lg bg-slate-900/95 dark:bg-[#020617]/95 border border-slate-700/80 dark:border-[#14F1C7]/40 text-[11px] font-bold text-white whitespace-nowrap shadow-xl pointer-events-none z-50 flex items-center gap-1.5"
                  >
                    <span>{item.emoji}</span>
                    <span>{item.name}</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
