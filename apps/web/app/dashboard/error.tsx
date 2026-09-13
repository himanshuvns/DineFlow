"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  React.useEffect(() => {
    // Log the error to console
    console.error("Dashboard error caught by route boundary:", error);
  }, [error]);

  const handleClearCacheAndReset = () => {
    try {
      if (typeof window !== "undefined") {
        // Clear any potentially corrupted tenant store caches
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith("dineflow_data_") || key === "dineflow_auth")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      }
    } catch (e) {
      console.warn("Could not clear localStorage:", e);
    }
    // Attempt re-render
    reset();
    window.location.reload();
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 select-none">
      <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-slate-900/80 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl">
        {/* Glowing Alert Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.2)]">
          <AlertTriangle className="h-8 w-8" />
          <div className="absolute -top-1 -right-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
            </span>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Unable to Load Workspace
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            A temporary synchronization issue occurred while connecting to your restaurant workspace data.
          </p>
          {error?.message && (
            <div className="mt-3 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate text-left">
              Error: {error.message}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="glow"
            size="sm"
            onClick={() => reset()}
            leftIcon={<RotateCcw className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            Try Again
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCacheAndReset}
            leftIcon={<Trash2 className="h-4 w-4 text-rose-500" />}
            className="w-full sm:w-auto"
            title="Clear cached browser data and re-initialize demo workspace"
          >
            Reset Workspace Data
          </Button>

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="w-full sm:w-auto"
          >
            <Link href="/">
              <Home className="h-4 w-4 mr-1.5" />
              Home
            </Link>
          </Button>
        </div>

        {/* Footer brand note */}
        <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-2">
          DineFlow Restaurant OS • Multi-Tenant Isolation
        </p>
      </div>
    </div>
  );
}
