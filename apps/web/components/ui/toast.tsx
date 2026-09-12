"use client";

import * as React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (type: ToastType, title: string, description?: string) => void;
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

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const iconMap = {
            success: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />,
            error: <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />,
            warning: <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />,
            info: <Info className="h-5 w-5 text-cyan-400 shrink-0" />,
          };

          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 p-4 rounded-xl glass-panel-glow border shadow-2xl",
                "animate-in slide-in-from-bottom-5 duration-200 transition-all",
                toast.type === "success" && "border-emerald-500/30",
                toast.type === "error" && "border-rose-500/30",
                toast.type === "warning" && "border-amber-500/30",
                toast.type === "info" && "border-cyan-500/30"
              )}
            >
              {iconMap[toast.type]}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
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
