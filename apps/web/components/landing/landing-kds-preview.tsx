"use client";

import * as React from "react";
import {
  ChefHat,
  Clock,
  Sparkles,
  Volume2,
  Utensils,
  Wine,
  Hotel,
  CheckCircle2,
  AlertCircle,
  Flame,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface KdsCard {
  id: string;
  location: string;
  type: "table" | "room";
  time: string;
  station: string;
  items: { name: string; qty: number; note?: string }[];
  status: "new" | "preparing" | "ready" | "completed";
}

const KDS_ORDERS: KdsCard[] = [
  {
    id: "#DF-104",
    location: "Table 04",
    type: "table",
    time: "1m ago",
    station: "Main Kitchen",
    items: [
      { name: "Wood-Fired Truffle Margherita", qty: 2, note: "Extra basil" },
      { name: "Valencia Orange Spritz", qty: 2 },
    ],
    status: "new",
  },
  {
    id: "#DF-103",
    location: "Suite 302",
    type: "room",
    time: "5m ago",
    station: "Room Service Line",
    items: [
      { name: "Truffle Mushroom Risotto", qty: 1 },
      { name: "Burrata & Heirloom Salad", qty: 1, note: "Dressing on side" },
    ],
    status: "preparing",
  },
  {
    id: "#DF-102",
    location: "Table 11",
    type: "table",
    time: "11m ago",
    station: "Grill Station",
    items: [
      { name: "Artisanal Grilled Chicken Panini", qty: 1 },
      { name: "French Truffle Fries", qty: 1 },
    ],
    status: "ready",
  },
  {
    id: "#DF-101",
    location: "Table 02",
    type: "table",
    time: "18m ago",
    station: "Pastry & Bar",
    items: [
      { name: "Belgian Chocolate Fondant", qty: 2 },
      { name: "Double Espresso", qty: 2 },
    ],
    status: "completed",
  },
];

export function LandingKdsPreview() {
  const [orders, setOrders] = React.useState<KdsCard[]>(KDS_ORDERS);

  const bumpStatus = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        if (o.status === "new") return { ...o, status: "preparing" };
        if (o.status === "preparing") return { ...o, status: "ready" };
        if (o.status === "ready") return { ...o, status: "completed" };
        return o;
      })
    );
  };

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shadow-xs">
          <ChefHat className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Real-Time Kitchen Display System (KDS)</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Eliminate Kitchen Chaos & Lost Tickets
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Route orders automatically to kitchen line stations, bar dispensers, and room service pantries. Keep chefs, expoditers, and servers in perfect sync.
        </p>
      </div>

      {/* KDS Screen Frame */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/90 bg-slate-900 text-white shadow-2xl overflow-hidden">
        {/* KDS Header Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              KDS Station: Master Expo Display
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">4 Active Tickets</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1">
              <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
              Audio Chimes On
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300 font-mono">19:42:10</span>
          </div>
        </div>

        {/* 4 Column Kanban Grid */}
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Column: New */}
          <div className="space-y-3">
            <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-between text-xs font-bold text-rose-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                New Orders
              </span>
              <span>1</span>
            </div>
            {orders
              .filter((o) => o.status === "new")
              .map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl bg-slate-800/90 border border-rose-500/40 shadow-lg space-y-3"
                >
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-mono font-bold text-white text-sm block">{order.id}</span>
                      <span className="text-rose-400 font-semibold flex items-center gap-1 mt-0.5">
                        {order.type === "room" ? <Hotel className="h-3 w-3" /> : <Utensils className="h-3 w-3" />}
                        {order.location}
                      </span>
                    </div>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono">
                      {order.time}
                    </span>
                  </div>

                  <div className="border-t border-slate-700/80 pt-2 space-y-1.5 text-xs">
                    {order.items.map((it, i) => (
                      <div key={i} className="text-slate-200">
                        <span className="font-bold text-white">{it.qty}x</span> {it.name}
                        {it.note && <p className="text-[10px] text-amber-400 italic">Note: {it.note}</p>}
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="glow"
                    size="sm"
                    onClick={() => bumpStatus(order.id)}
                    className="w-full h-8 text-xs font-bold"
                  >
                    Start Cooking →
                  </Button>
                </div>
              ))}
          </div>

          {/* Column: Preparing */}
          <div className="space-y-3">
            <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs font-bold text-amber-400">
              <span className="flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                In Preparation
              </span>
              <span>1</span>
            </div>
            {orders
              .filter((o) => o.status === "preparing")
              .map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl bg-slate-800/90 border border-amber-500/40 shadow-lg space-y-3"
                >
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-mono font-bold text-white text-sm block">{order.id}</span>
                      <span className="text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                        {order.type === "room" ? <Hotel className="h-3 w-3" /> : <Utensils className="h-3 w-3" />}
                        {order.location}
                      </span>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                      {order.time}
                    </span>
                  </div>

                  <div className="border-t border-slate-700/80 pt-2 space-y-1.5 text-xs">
                    {order.items.map((it, i) => (
                      <div key={i} className="text-slate-200">
                        <span className="font-bold text-white">{it.qty}x</span> {it.name}
                        {it.note && <p className="text-[10px] text-amber-400 italic">Note: {it.note}</p>}
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => bumpStatus(order.id)}
                    className="w-full h-8 text-xs font-bold border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                  >
                    Mark Plated ✓
                  </Button>
                </div>
              ))}
          </div>

          {/* Column: Ready */}
          <div className="space-y-3">
            <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Ready for Pickup
              </span>
              <span>1</span>
            </div>
            {orders
              .filter((o) => o.status === "ready")
              .map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl bg-slate-800/90 border border-emerald-500/40 shadow-lg space-y-3"
                >
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-mono font-bold text-white text-sm block">{order.id}</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                        {order.type === "room" ? <Hotel className="h-3 w-3" /> : <Utensils className="h-3 w-3" />}
                        {order.location}
                      </span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                      {order.time}
                    </span>
                  </div>

                  <div className="border-t border-slate-700/80 pt-2 space-y-1.5 text-xs">
                    {order.items.map((it, i) => (
                      <div key={i} className="text-slate-200">
                        <span className="font-bold text-white">{it.qty}x</span> {it.name}
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => bumpStatus(order.id)}
                    className="w-full h-8 text-xs font-bold border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                  >
                    Served to Guest
                  </Button>
                </div>
              ))}
          </div>

          {/* Column: Completed */}
          <div className="space-y-3">
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Completed Log</span>
              <span>1</span>
            </div>
            {orders
              .filter((o) => o.status === "completed")
              .map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 opacity-75 space-y-3"
                >
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-mono font-bold text-slate-300 text-sm block">{order.id}</span>
                      <span className="text-slate-400 font-medium">{order.location}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{order.time}</span>
                  </div>

                  <div className="border-t border-slate-700/60 pt-2 text-xs text-slate-400">
                    {order.items.map((it, i) => (
                      <div key={i}>
                        {it.qty}x {it.name}
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Order Fulfilled & Closed
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
