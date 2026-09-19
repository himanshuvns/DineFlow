"use client";

import * as React from "react";
import {
  Users,
  Hotel,
  MapPin,
  Clock,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Bed,
  Sparkles,
  QrCode,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function LandingStaffHotel() {
  const [activeModule, setActiveModule] = React.useState<"staff" | "hotel">("staff");

  return (
    <section
      id="hospitality-modules"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full scroll-mt-24"
    >
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Advanced Hospitality Modules</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Staff Operations & Hotel Management
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Scale beyond simple dining rooms with dedicated tools for staff attendance geofencing, leave tracking, and full-property hotel room operations.
        </p>

        {/* Module Switcher Buttons */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mt-4">
          <button
            type="button"
            onClick={() => setActiveModule("staff")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeModule === "staff"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Staff, Attendance & Payroll</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveModule("hotel")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeModule === "hotel"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Hotel className="h-4 w-4" />
            <span>Hotel Rooms & In-Room Dining</span>
          </button>
        </div>
      </div>

      {/* Module Container */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/90 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl p-6 sm:p-8 lg:p-10 shadow-xl transition-all duration-300">
        {/* MODULE 1: STAFF MANAGEMENT */}
        {activeModule === "staff" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <Badge variant="purple" size="sm">Staff Operating Suite</Badge>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  GPS Geofenced Attendance & Automated Payroll
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  Ensure staff are physically at the venue before clocking in. Track shifts, manage leave approvals, and calculate accurate monthly salaries with overtime and deductions.
                </p>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">GPS Perimeter Verification</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Staff mobile check-in is strictly verified against your restaurant’s coordinates with zero proxy punching.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Leave & Shift Management</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      One-tap manager approvals for sick leaves and casual leaves with live roster coverage updates.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Automated Salary & Payslips</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Basic pay, HRA, overtime rates, and statutory deductions auto-compiled into exportable PDF slips.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Mockup: Today's Attendance & Geofence Verification */}
            <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Today's Attendance Roster</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                  ● Geofence Active (50m Radius)
                </span>
              </div>

              {/* Attendance KPI Pills */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">Present</span>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">18</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">Late</span>
                  <p className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">1</p>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <span className="text-[10px] text-rose-700 dark:text-rose-300 font-medium">Absent</span>
                  <p className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5">0</p>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-medium">On Leave</span>
                  <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">2</p>
                </div>
              </div>

              {/* Live Punch Verification Snippet */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Recent Mobile Punch</span>
                  <Badge variant="success" size="sm">GPS Verified</Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                  <span>Priya Sharma (Captain)</span>
                  <span className="font-mono">Clock In: 10:58 AM</span>
                </div>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                  Coordinates: 28.6139° N, 77.2090° E (Accuracy: 4.2m)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 2: HOTEL MANAGEMENT */}
        {activeModule === "hotel" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <Badge variant="info" size="sm">Hotel & Resort Suite</Badge>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  Comprehensive Room Inventory & In-Room Dining
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  Give guests luxury digital room service. Maintain housekeeping inspection schedules, automate butler requests, and post all in-room orders directly to the guest room folio.
                </p>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <Bed className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Live Room Status Grid</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Color-coded visibility into Vacant, Occupied, Cleaning, and Maintenance states across all floors.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <QrCode className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Room-Specific QR Service</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Each room has a unique QR code stand. Guests order without downloading apps or dialing reception.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileCheck className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">PMS Folio Integration</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Seamlessly post food, beverage, and laundry totals directly to guest check-out invoices.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Mockup: Hotel Room Grid & Service Status */}
            <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Wing A • Rooms & In-Room Service</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold font-mono">
                  88% Occupancy
                </span>
              </div>

              {/* Room Grid */}
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                {[
                  { num: "Suite 101", status: "Occupied", service: "Dining Order #88" },
                  { num: "Suite 102", status: "Available", service: "Cleaned & Inspected" },
                  { num: "Deluxe 201", status: "Occupied", service: "DND Active" },
                  { num: "Deluxe 202", status: "Cleaning", service: "Housekeeping 12m" },
                  { num: "Suite 301", status: "Occupied", service: "Butler Alert" },
                  { num: "Suite 302", status: "Occupied", service: "Dining Order #92" },
                ].map((r, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white">{r.num}</span>
                      <span className={`w-2 h-2 rounded-full ${
                        r.status === "Occupied" ? "bg-indigo-500" : r.status === "Available" ? "bg-emerald-500" : "bg-amber-500"
                      }`} />
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block line-clamp-1">
                      {r.service}
                    </span>
                  </div>
                ))}
              </div>

              {/* In-room Dining Quick Status */}
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-indigo-700 dark:text-indigo-300">Room Service Line Active</span>
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5">2 Orders in preparation</p>
                </div>
                <Badge variant="purple" size="sm">Avg Delivery 14m</Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
