"use client";

import { create } from "zustand";

export interface UpiSettings {
  vpa: string;
  merchantName: string;
  youpiGatewayUrl: string;
  webhookSecret: string;
  autoSettleOnWebhook: boolean;
  observerStatus: "online" | "offline" | "listening";
  lastPingTime?: string;
}

interface UpiSettingsState extends UpiSettings {
  isLoading: boolean;
  isSaving: boolean;
  lastSyncedAt: string | null;
  updateLocalSettings: (settings: Partial<UpiSettings>) => void;
  saveSettings: (settings: Partial<UpiSettings>, authToken?: string) => Promise<boolean>;
  fetchSettings: (authToken?: string) => Promise<void>;
  generateUpiUri: (orderId: string, amount: number, note?: string) => string;
}

const STORAGE_KEY = "dineflow_upi_settings_v1";

const DEFAULT_SETTINGS: UpiSettings = {
  vpa: "dineflow@icici",
  merchantName: "DineFlow Restaurant",
  youpiGatewayUrl: "",
  webhookSecret: "",
  autoSettleOnWebhook: true,
  observerStatus: "offline",
};

function getSavedSettings(): UpiSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export const useUpiSettings = create<UpiSettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  ...getSavedSettings(),
  isLoading: false,
  isSaving: false,
  lastSyncedAt: null,

  updateLocalSettings: (newSettings) => {
    set((state) => {
      const merged = { ...state, ...newSettings };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              vpa: merged.vpa,
              merchantName: merged.merchantName,
              youpiGatewayUrl: merged.youpiGatewayUrl,
              webhookSecret: merged.webhookSecret,
              autoSettleOnWebhook: merged.autoSettleOnWebhook,
              observerStatus: merged.observerStatus,
            })
          );
        } catch {
          // ignore localStorage errors
        }
      }
      return newSettings;
    });
  },

  fetchSettings: async (authToken?: string) => {
    set({ isLoading: true });
    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL ||
        (process.env.NODE_ENV === "production"
          ? "https://dine.rovixatech.com/api/v1"
          : "http://localhost:8080/api/v1");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const res = await fetch(`${apiBase}/payments/config`, { headers });
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        if (data && data.upiVpa) {
          const loaded: Partial<UpiSettings> = {
            vpa: data.upiVpa,
            merchantName: data.merchantName || get().merchantName,
            youpiGatewayUrl: data.youpiGatewayUrl || "",
            webhookSecret: data.youpiWebhookSecret || "",
            autoSettleOnWebhook: data.autoSettleOnWebhook ?? true,
            observerStatus: data.observerStatus || "offline",
          };
          get().updateLocalSettings(loaded);
          set({ lastSyncedAt: new Date().toISOString() });
        }
      }
    } catch (err) {
      console.warn("Failed to fetch UPI settings from server, using local storage:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  saveSettings: async (settingsToSave, authToken) => {
    set({ isSaving: true });
    get().updateLocalSettings(settingsToSave);

    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL ||
        (process.env.NODE_ENV === "production"
          ? "https://dine.rovixatech.com/api/v1"
          : "http://localhost:8080/api/v1");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const current = get();
      const payload = {
        defaultProvider: "youpi",
        upiVpa: settingsToSave.vpa ?? current.vpa,
        merchantName: settingsToSave.merchantName ?? current.merchantName,
        youpiGatewayUrl: settingsToSave.youpiGatewayUrl ?? current.youpiGatewayUrl,
        youpiWebhookSecret: settingsToSave.webhookSecret ?? current.webhookSecret,
        autoSettleOnWebhook: settingsToSave.autoSettleOnWebhook ?? current.autoSettleOnWebhook,
        observerStatus: settingsToSave.observerStatus ?? current.observerStatus,
      };

      const res = await fetch(`${apiBase}/payments/config`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        set({ lastSyncedAt: new Date().toISOString() });
        return true;
      }
    } catch (err) {
      console.warn("Failed to persist UPI settings to server:", err);
    } finally {
      set({ isSaving: false });
    }
    return false;
  },

  generateUpiUri: (orderId: string, amount: number, note?: string) => {
    const { vpa, merchantName } = get();
    const formattedAmount = amount > 0 ? amount.toFixed(2) : "0.00";
    const paymentNote = note || `Order #${orderId}`;

    return `upi://pay?pa=${encodeURIComponent(vpa || "dineflow@icici")}&pn=${encodeURIComponent(
      merchantName || "DineFlow"
    )}&am=${formattedAmount}&tr=${encodeURIComponent(orderId)}&tn=${encodeURIComponent(
      paymentNote
    )}&cu=INR`;
  },
}));
