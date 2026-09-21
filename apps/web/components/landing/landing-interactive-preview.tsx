"use client";

import * as React from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Grid,
  Hotel,
  Users,
  BarChart3,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Flame,
  ShieldCheck,
  Check,
  Search,
  Filter,
  DollarSign,
  Coffee,
  Wine,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type TabKey = "overview" | "orders" | "menu" | "tables" | "rooms" | "staff" | "analytics";

interface TabDef {
  key: TabKey;
  label: string;
  icon: React.ElementType;
}

const TABS: TabDef[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "orders", label: "Live KDS", icon: ShoppingBag },
  { key: "menu", label: "Menu", icon: UtensilsCrossed },
  { key: "tables", label: "Tables & QR", icon: Grid },
  { key: "rooms", label: "Rooms & Suites", icon: Hotel },
  { key: "staff", label: "Staff & HR", icon: Users },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
];

export function LandingInteractivePreview() {
  const [activeTab, setActiveTab] = React.useState<TabKey>("overview");

  return (
    <section
      id="interactive-demo"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full scroll-mt-24"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Interactive Product Exploration</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Everything you need to run your hospitality business
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Switch between operational surfaces to see how DineFlow streamlines front-of-house, kitchen, rooms, and back-office management.
        </p>
      </div>

      {/* Interactive Tabs Bar */}
      <div className="flex items-center justify-start lg:justify-center overflow-x-auto lg:overflow-visible flex-nowrap lg:flex-wrap gap-2 pb-2 px-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer border ${
                isActive
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/30"
                  : "bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-800/80"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-emerald-500"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Preview Container */}
      <div className="mt-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/90 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl shadow-xl overflow-hidden transition-all duration-300">
        {/* Mock Window Header */}
        <div className="px-4 sm:px-6 lg:px-8 py-3 border-b border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-300 ml-2 hidden sm:inline">
              DineFlow Operations Hub
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium capitalize">
              {activeTab} Module
            </span>
          </div>

          <Badge variant="outline" size="sm" className="text-xs text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700">
            Interactive Preview
          </Badge>
        </div>

        {/* Tab Specific Content Panels */}
        <div className="p-4 sm:p-6 lg:p-8 min-h-[420px] flex flex-col justify-center">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Total Sales Today</span>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">₹1,42,850</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">↑ 24% vs last week</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Active Tables</span>
                    <UtensilsCrossed className="h-4 w-4 text-teal-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">18 / 24</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">75% Occupancy</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Hotel Rooms</span>
                    <Hotel className="h-4 w-4 text-indigo-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">28 / 32</p>
                  <p className="text-xs text-indigo-500 font-medium mt-1">87.5% Capacity</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Orders Completed</span>
                    <ShoppingBag className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">142</p>
                  <p className="text-xs text-amber-500 font-medium mt-1">Avg Ticket ₹1,005</p>
                </div>
              </div>

              {/* Activity & Highlights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>Hourly Order Volume Peak (Today)</span>
                    <span className="text-emerald-500">Live Traffic</span>
                  </div>
                  <div className="h-32 flex items-end gap-2 pt-4">
                    {[35, 45, 60, 95, 80, 50, 65, 100, 85, 70, 90, 60].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <div
                          className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-teal-400 transition-all duration-500 hover:opacity-80"
                          style={{ height: `${h}%` }}
                        />
                        <span className="text-[9px] text-slate-400">{i + 12}:00</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 space-y-3">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Quick Operational Actions
                  </span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                      <span className="font-medium">Generate Table QR Stands</span>
                      <Badge variant="outline" size="sm" className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30">Ready</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                      <span className="font-medium">Broadcast WhatsApp Offer</span>
                      <Badge variant="success" size="sm" className="text-xs">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                      <span className="font-medium">Kitchen Bump Bar Sync</span>
                      <Badge variant="success" size="sm" className="text-xs">Live</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS (KDS) */}
          {activeTab === "orders" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Kitchen Display System (KDS) • Station: All Stations
                </span>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Chime Enabled
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Column: New Orders */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-600 dark:text-rose-400">
                    <span>New Orders (2)</span>
                    <span className="text-[10px]">Avg 1m</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">#DF-901 • Table 07</span>
                      <span className="text-[10px] font-semibold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">
                        Just now
                      </span>
                    </div>
                    <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      <li>• 2x Wood-Fired Margherita</li>
                      <li>• 1x Burrata & Heirloom Salad (No onion)</li>
                    </ul>
                    <div className="pt-2 flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-600">₹1,430</span>
                      <Button variant="outline" size="sm" className="h-7 text-[11px] text-emerald-600">
                        Accept Order →
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Column: Preparing */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <span>In Kitchen (3)</span>
                    <span className="text-[10px]">Station: Main</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">#DF-898 • Room 302</span>
                      <span className="text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        Prep 6m / 12m
                      </span>
                    </div>
                    <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      <li>• 1x Truffle Mushroom Risotto</li>
                      <li>• 1x Valencia Orange Spritz</li>
                    </ul>
                    <div className="pt-2 flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-600">₹1,190</span>
                      <Button variant="glow" size="sm" className="h-7 text-[11px]">
                        Mark Ready ✓
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Column: Ready / Delivery */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span>Ready for Service (2)</span>
                    <span className="text-[10px]">Notify Floor</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">#DF-895 • Table 02</span>
                      <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        Plated
                      </span>
                    </div>
                    <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      <li>• 1x Belgian Chocolate Fondant</li>
                      <li>• 2x Double Espresso</li>
                    </ul>
                    <div className="pt-2 flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-600">₹790</span>
                      <Button variant="outline" size="sm" className="h-7 text-[11px] text-slate-600">
                        Served & Close
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MENU */}
          {activeTab === "menu" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Catalog Items (48 Active)</span>
                  <Badge variant="purple" size="sm">Dynamic Pricing Enabled</Badge>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer">
                    + Add New Dish
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { name: "Wood-Fired Truffle Margherita", cat: "Pizza", price: "₹750", veg: true, avail: true },
                  { name: "Burrata & Heirloom Tomato Salad", cat: "Starters", price: "₹680", veg: true, avail: true },
                  { name: "Artisanal Grilled Chicken Panini", cat: "Mains", price: "₹620", veg: false, avail: true },
                  { name: "Truffle Wild Mushroom Risotto", cat: "Mains", price: "₹850", veg: true, avail: true },
                  { name: "Belgian Molten Chocolate Cake", cat: "Desserts", price: "₹450", veg: true, avail: false },
                  { name: "Valencia Cold-Pressed Spritz", cat: "Beverages", price: "₹340", veg: true, avail: true },
                ].map((dish, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${dish.veg ? "bg-emerald-500" : "bg-rose-500"}`} />
                        <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{dish.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{dish.cat}</span>
                        <span>•</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{dish.price}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        dish.avail
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-500"
                      }`}>
                        {dish.avail ? "In Stock" : "86'd"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TABLES */}
          {activeTab === "tables" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Floor Layout • Dining Hall & Terrace (18 Tables)
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Available</span>
                  <span className="flex items-center gap-1 text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-500" /> Seated</span>
                  <span className="flex items-center gap-1 text-indigo-600"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Bill Sent</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                  { name: "Table 01", seats: 4, status: "available" },
                  { name: "Table 02", seats: 2, status: "occupied", order: "₹1,420" },
                  { name: "Table 03", seats: 6, status: "available" },
                  { name: "Table 04", seats: 4, status: "occupied", order: "₹2,100" },
                  { name: "Table 05", seats: 2, status: "bill", order: "₹890" },
                  { name: "Table 06", seats: 4, status: "available" },
                  { name: "Table 07", seats: 8, status: "occupied", order: "₹3,450" },
                  { name: "Table 08", seats: 2, status: "available" },
                  { name: "Table 09", seats: 4, status: "available" },
                  { name: "Table 10", seats: 6, status: "occupied", order: "₹1,850" },
                  { name: "Table 11", seats: 2, status: "bill", order: "₹620" },
                  { name: "Table 12", seats: 4, status: "available" },
                ].map((tbl, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border flex flex-col justify-between text-xs space-y-2 ${
                      tbl.status === "available"
                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-900 dark:text-emerald-100"
                        : tbl.status === "occupied"
                        ? "bg-amber-500/5 border-amber-500/20 text-amber-900 dark:text-amber-100"
                        : "bg-indigo-500/5 border-indigo-500/20 text-indigo-900 dark:text-indigo-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{tbl.name}</span>
                      <QrCode className="h-3.5 w-3.5 opacity-70" />
                    </div>
                    <div className="text-[11px] opacity-80">
                      <span>{tbl.seats} Seats</span>
                      {tbl.order && <p className="font-bold mt-0.5">{tbl.order}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ROOMS */}
          {activeTab === "rooms" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Hotel Wing • 32 Luxury Suites & Deluxe Rooms
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-indigo-600 font-semibold">In-Room Dining Module Enabled</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { num: "Suite 101", guest: "Alexander Wright", status: "Occupied", service: "Dining Order #DF-88" },
                  { num: "Suite 102", guest: "Vacant", status: "Available", service: "Ready for check-in" },
                  { num: "Deluxe 201", guest: "Dr. Evelyn Reed", status: "Occupied", service: "DND Active" },
                  { num: "Deluxe 202", guest: "Housekeeping", status: "Cleaning", service: "Inspection pending" },
                  { num: "Suite 301", guest: "Vikram Mehta", status: "Occupied", service: "Butler Request" },
                  { num: "Suite 302", guest: "Marcus Thorne", status: "Occupied", service: "Dining Order #DF-92" },
                  { num: "Deluxe 401", guest: "Vacant", status: "Available", service: "Ready for check-in" },
                  { num: "Presidential", guest: "VIP Guest", status: "Occupied", service: "Airport Transfer 8pm" },
                ].map((rm, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{rm.num}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        rm.status === "Occupied"
                          ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                          : rm.status === "Available"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-600"
                      }`}>
                        {rm.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300">
                      <p className="font-medium">{rm.guest}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{rm.service}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: STAFF */}
          {activeTab === "staff" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Today's Staff Attendance • GPS Geofenced Perimeter
                </span>
                <div className="flex gap-2">
                  <span className="text-emerald-600 font-semibold">18 Present • 1 Late • 0 Absent</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { name: "Chef Marco Rossi", role: "Head Chef", shift: "Morning (09:00 - 17:00)", status: "Clocked In", geo: "0m verified" },
                  { name: "Priya Sharma", role: "Floor Captain", shift: "General (11:00 - 20:00)", status: "Clocked In", geo: "12m verified" },
                  { name: "Carlos Mendes", role: "Lead Bartender", shift: "Evening (16:00 - 01:00)", status: "Upcoming", geo: "Scheduled" },
                  { name: "Amina Khan", role: "Front Desk Mgr", shift: "Morning (08:00 - 16:00)", status: "Clocked In", geo: "5m verified" },
                ].map((member, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{member.name}</span>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {member.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300">
                      <p className="font-medium text-emerald-600 dark:text-emerald-400">{member.role}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{member.shift}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">GPS: {member.geo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Performance Intelligence & Sales Insights
                </span>
                <span className="text-emerald-600 font-semibold">Last 30 Days</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs text-slate-500">Gross Monthly Revenue</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">₹38,45,000</p>
                  <p className="text-xs text-emerald-600 font-semibold">+31.2% Month-over-Month</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs text-slate-500">Average Table Turnover</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">42 Minutes</p>
                  <p className="text-xs text-teal-600 font-semibold">28% Faster with QR Ordering</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs text-slate-500">WhatsApp Receipt Engagement</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">96.4%</p>
                  <p className="text-xs text-indigo-600 font-semibold">Zero Paper Waste</p>
                </div>
              </div>

              {/* Top Selling Items */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Top Volume Dishes
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/60">
                    <span className="font-semibold block">Truffle Margherita</span>
                    <span className="text-slate-400 text-[11px]">842 orders (₹6.3L)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/60">
                    <span className="font-semibold block">Wild Risotto</span>
                    <span className="text-slate-400 text-[11px]">614 orders (₹5.2L)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/60">
                    <span className="font-semibold block">Valencia Spritz</span>
                    <span className="text-slate-400 text-[11px]">1,120 orders (₹3.8L)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/60">
                    <span className="font-semibold block">Chocolate Fondant</span>
                    <span className="text-slate-400 text-[11px]">520 orders (₹2.3L)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
