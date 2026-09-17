"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getBaseURL } from "@/lib/api";
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Navigation,
  ShieldCheck,
  Building2,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Check,
} from "lucide-react";

interface TokenInfo {
  valid: boolean;
  employeeName: string;
  employeeId: string;
  action: "clock_in" | "clock_out" | string;
  workplaceName: string;
  workplaceLat: number;
  workplaceLng: number;
  radiusMeters: number;
  expiresInSecs: number;
  error?: string;
}

interface CheckInResult {
  success: boolean;
  action: string;
  status: string;
  employeeName: string;
  employeeId: string;
  distanceMeters: number;
  allowedRadius: number;
  withinGeofence: boolean;
  timestamp: string;
  message: string;
}

function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const rLat1 = (lat1 * Math.PI) / 180;
  const rLat2 = (lat2 * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function CheckInContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState<boolean>(true);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [tokenError, setTokenError] = useState<string>("");

  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string>("");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [submitError, setSubmitError] = useState<string>("");

  // 1. Verify token on load
  useEffect(() => {
    if (!token) {
      setTokenError("Missing attendance token in URL. Please tap the link sent in WhatsApp.");
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`${getBaseURL()}/workforce/verify-token?token=${encodeURIComponent(token)}`);
        const json = await res.json();

        if (res.ok && json.data?.valid) {
          setTokenInfo(json.data);
          requestLocation(json.data.workplaceLat, json.data.workplaceLng);
        } else {
          setTokenError(
            json.error?.message ||
              json.data?.error ||
              "This check-in link is invalid or has expired (15-min limit). Please request a fresh link on WhatsApp."
          );
        }
      } catch {
        setTokenError("Unable to reach DineFlow server. Please check your internet connection.");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  // 2. Request GPS coordinates
  const requestLocation = (targetLat?: number, targetLng?: number) => {
    setGpsLoading(true);
    setGpsError("");

    if (!("geolocation" in navigator)) {
      setGpsError("Geolocation is not supported by your browser.");
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy;
        setCoords({ lat, lng, accuracy: Math.round(acc) });

        const wLat = targetLat ?? tokenInfo?.workplaceLat;
        const wLng = targetLng ?? tokenInfo?.workplaceLng;

        if (typeof wLat === "number" && typeof wLng === "number" && (wLat !== 0 || wLng !== 0)) {
          const dist = calculateDistanceMeters(lat, lng, wLat, wLng);
          setDistance(dist);
        }
        setGpsLoading(false);
      },
      (err) => {
        let msg = "Could not fetch GPS location.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Location access was denied. Please enable Location Services in your phone browser settings to verify your attendance.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "GPS position is currently unavailable. Please ensure GPS/Location is toggled on.";
        } else if (err.code === err.TIMEOUT) {
          msg = "GPS request timed out. Tap retry below.";
        }
        setGpsError(msg);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // 3. Submit check-in
  const handleSubmit = async () => {
    if (!token || !coords) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch(`${getBaseURL()}/workforce/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          latitude: coords.lat,
          longitude: coords.lng,
          accuracy: coords.accuracy,
          deviceInfo: navigator.userAgent,
        }),
      });

      const json = await res.json();
      if (res.ok && json.data?.success) {
        setResult(json.data);
      } else {
        setSubmitError(json.error?.message || json.data?.message || "Failed to record attendance. Please try again.");
      }
    } catch {
      setSubmitError("Network connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isWithinGeofence =
    distance !== null && tokenInfo ? distance <= tokenInfo.radiusMeters : false;
  const isClockIn = tokenInfo?.action !== "clock_out";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/15 backdrop-blur-md mb-2 shadow-inner">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            {tokenInfo?.workplaceName || "DineFlow"}
          </h1>
          <p className="text-xs text-emerald-100 font-medium tracking-wide uppercase mt-1">
            Workforce Attendance Verification
          </p>
        </div>

        {/* Loading Token State */}
        {loading && (
          <div className="p-8 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Verifying attendance security token...
            </p>
          </div>
        )}

        {/* Token Error State */}
        {!loading && tokenError && (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Link Expired or Invalid
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {tokenError}
            </p>
            <div className="pt-2">
              <a
                href="whatsapp://"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-md active:scale-95"
              >
                <Smartphone className="w-4 h-4" /> Return to WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* Success Confirmed Screen */}
        {!loading && result && (
          <div className="p-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50 dark:ring-emerald-950/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 mb-1">
                {result.status === "late" ? "Late Arrival Recorded" : "Verified Successfully"}
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {result.action === "clock_out" ? "Clock-Out Confirmed!" : "Clock-In Confirmed!"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {result.employeeName} ({result.employeeId})
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">Timestamp:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{result.timestamp}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">Distance:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {result.distanceMeters}m from workplace (Radius: {result.allowedRadius}m)
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 dark:text-slate-400">Confirmation:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> WhatsApp Dispatched
                </span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="whatsapp://"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md active:scale-95"
              >
                <Smartphone className="w-4 h-4" /> Back to WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* Active GPS Check-In Screen */}
        {!loading && !tokenError && !result && tokenInfo && (
          <div className="p-6 space-y-5">
            {/* Employee Profile Card */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Employee</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {tokenInfo.employeeName}
                </p>
                <p className="text-[11px] font-mono text-slate-500">{tokenInfo.employeeId}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isClockIn
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
              }`}>
                {isClockIn ? "Clock In" : "Clock Out"}
              </span>
            </div>

            {/* GPS Distance Radar Box */}
            <div className="relative rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 text-center overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
              {gpsLoading ? (
                <div className="space-y-3 py-4">
                  <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500/30 animate-ping" />
                    <Navigation className="w-8 h-8 text-emerald-600 animate-pulse" />
                  </div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Acquiring High-Precision GPS...
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Please allow location permission in your browser
                  </p>
                </div>
              ) : gpsError ? (
                <div className="space-y-3">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
                    {gpsError}
                  </p>
                  <button
                    onClick={() => requestLocation()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retry GPS
                  </button>
                </div>
              ) : coords ? (
                <div className="space-y-3">
                  {/* Radar Pulse Visual */}
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    <div
                      className={`absolute inset-0 rounded-full ${
                        isWithinGeofence
                          ? "bg-emerald-500/15 border-2 border-emerald-500/40 animate-pulse"
                          : "bg-amber-500/15 border-2 border-amber-500/40"
                      }`}
                    />
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isWithinGeofence
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                          : "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                      }`}
                    >
                      <MapPin className="w-6 h-6" />
                    </div>
                  </div>

                  {distance !== null && (
                    <div>
                      <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        {distance}m
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Distance from workplace premises
                      </p>
                    </div>
                  )}

                  {/* Geofence Indicator Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold">
                    {isWithinGeofence ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Inside Workplace Geofence (Radius: {tokenInfo.radiusMeters}m)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Outside Allowed Geofence (Allowed: {tokenInfo.radiusMeters}m)
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                    <Navigation className="w-3 h-3" /> GPS accuracy: ±{coords.accuracy}m
                  </p>
                </div>
              ) : null}
            </div>

            {/* Error banner if submission failed */}
            {submitError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 font-medium">
                {submitError}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                disabled={submitting || gpsLoading || !coords || (!isWithinGeofence && !tokenInfo.radiusMeters)}
                onClick={handleSubmit}
                className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                  isWithinGeofence
                    ? isClockIn
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25"
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/25"
                    : "bg-slate-400 dark:bg-slate-700 cursor-not-allowed"
                }`}
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Verifying & Recording...
                  </>
                ) : isWithinGeofence ? (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    {isClockIn ? "Verify GPS & Clock In" : "Verify GPS & Clock Out"}
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" /> Move Closer to Workplace to Clock In
                  </>
                )}
              </button>

              <button
                onClick={() => requestLocation()}
                disabled={gpsLoading}
                className="w-full py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${gpsLoading ? "animate-spin" : ""}`} /> Refresh GPS Coordinates
              </button>
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Clock className="w-3.5 h-3.5" /> 15-min HMAC signed token • Anti-spoofing enabled
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MobileCheckInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      }
    >
      <CheckInContent />
    </Suspense>
  );
}
