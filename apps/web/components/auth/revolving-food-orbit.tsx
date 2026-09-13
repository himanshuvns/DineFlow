"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FoodItem {
  id: string;
  emoji: string;
  name: string;
  price?: string;
}

const FOOD_ITEMS: FoodItem[] = [
  { id: "pizza", emoji: "🍕", name: "Artisan Pizza" },
  { id: "burger", emoji: "🍔", name: "Smash Burger" },
  { id: "fries", emoji: "🍟", name: "Truffle Fries" },
  { id: "sushi", emoji: "🍣", name: "Salmon Sushi" },
  { id: "taco", emoji: "🌮", name: "Street Taco" },
  { id: "croissant", emoji: "🥐", name: "Bakery Croissant" },
  { id: "coffee", emoji: "☕", name: "Craft Latte" },
  { id: "ramen", emoji: "🍜", name: "Miso Ramen" },
];

interface RevolvingFoodOrbitProps {
  className?: string;
  radius?: number; // Distance from center in px
  duration?: number; // Seconds per 360 deg rotation
  direction?: 1 | -1; // 1 = clockwise, -1 = counter-clockwise
}

export function RevolvingFoodOrbit({
  className,
  radius = 185,
  duration = 45,
  direction = 1,
}: RevolvingFoodOrbitProps) {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center pointer-events-none select-none z-20",
        className
      )}
    >
      {/* Faint subtle orbital ring track */}
      <div
        className="absolute rounded-full border border-dashed border-emerald-500/15 dark:border-[#14F1C7]/20 pointer-events-none"
        style={{
          width: radius * 2,
          height: radius * 2,
        }}
      />

      {/* Orbit Container that rotates 360° continuously */}
      <motion.div
        className="relative"
        style={{
          width: radius * 2,
          height: radius * 2,
        }}
        animate={{
          rotate: direction * 360,
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {FOOD_ITEMS.map((item, index) => {
          // Calculate angle for each item evenly around circle
          const angle = (index / FOOD_ITEMS.length) * 2 * Math.PI;
          const x = radius + radius * Math.cos(angle);
          const y = radius + radius * Math.sin(angle);

          return (
            <div
              key={item.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              style={{
                left: `${x}px`,
                top: `${y}px`,
              }}
            >
              {/* Counter-rotate each item so the food emoji stays upright */}
              <motion.div
                animate={{
                  rotate: direction * -360,
                }}
                transition={{
                  duration,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <div
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="group relative cursor-pointer"
                >
                  {/* Food Badge Orb */}
                  <div className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-white/90 dark:bg-[#0F172A]/85 backdrop-blur-md border border-slate-200/90 dark:border-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-200 group-hover:scale-125 group-hover:border-emerald-400 dark:group-hover:border-[#14F1C7] group-hover:shadow-[0_0_20px_rgba(20,241,199,0.4)]">
                    <span className="text-lg sm:text-xl transform group-hover:scale-110 transition-transform">
                      {item.emoji}
                    </span>
                  </div>

                  {/* Tooltip Pill on Hover */}
                  {hoveredId === item.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.9 }}
                      animate={{ opacity: 1, y: -4, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 rounded-md bg-slate-900/90 dark:bg-[#020617]/95 border border-slate-700/80 dark:border-[#14F1C7]/30 text-[10px] font-semibold text-white whitespace-nowrap shadow-lg pointer-events-none z-50"
                    >
                      {item.name}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
