"use client";

import * as React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

import { motion, AnimatePresence } from "framer-motion";

type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | ToastType;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (type: ToastType, title: string, description?: string) => void;
  toast: (options: ToastOptions) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = React.useCallback(
    (type: ToastType, title: string, description?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, description }]);
      setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast]
  );

  const toast = React.useCallback(
    (options: ToastOptions) => {
      const type: ToastType =
        options.variant === "destructive" || options.variant === "error"
          ? "error"
          : options.variant === "warning"
          ? "warning"
          : options.variant === "info"
          ? "info"
          : "success";
      addToast(type, options.title, options.description);
    },
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, toast, removeToast }}>
      {children}
      <div
        className="fixed bottom-4 inset-x-4 sm:bottom-5 sm:right-5 sm:inset-x-auto sm:max-w-sm w-auto sm:w-full z-[60] flex flex-col gap-2.5 pointer-events-none pb-safe"
        role="region"
        aria-live="polite"
        aria-label="Notifications"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const iconMap = {
              success: (
                <div className="p-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              ),
              error: (
                <div className="p-1 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
              ),
              warning: (
                <div className="p-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              ),
              info: (
                <div className="p-1 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
                  <Info className="h-5 w-5" />
                </div>
              ),
            };

            const typeStyles = {
              success: "border-l-4 border-l-emerald-500 border-slate-200/90 dark:border-slate-800",
              error: "border-l-4 border-l-rose-500 border-slate-200/90 dark:border-slate-800",
              warning: "border-l-4 border-l-amber-500 border-slate-200/90 dark:border-slate-800",
              info: "border-l-4 border-l-cyan-500 border-slate-200/90 dark:border-slate-800",
            };

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92, y: -10, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={cn(
                  "pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white/95 dark:bg-[#0E131F]/95 border shadow-2xl backdrop-blur-xl",
                  typeStyles[toast.type]
                )}
              >
                {iconMap[toast.type]}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {toast.title}
                  </p>
                  {toast.description && (
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {toast.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors cursor-pointer"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
