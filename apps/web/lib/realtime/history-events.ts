/**
 * DineFlow History & Multi-Tenant Event Hub
 * Provides zero-latency real-time event broadcasting and multi-tab synchronization
 * for dining bill settlements, customer orders, and hotel guest check-ins/check-outs.
 */

export type HistoryEventType =
  | "BILL_SETTLED"
  | "ORDER_CREATED"
  | "GUEST_CHECKED_IN"
  | "GUEST_CHECKED_OUT"
  | "GUEST_EXTENDED";

export interface DiningEventPayload {
  id: string;
  table: string;
  customerName?: string;
  customerPhone?: string;
  destination?: "dine_in" | "room_service" | "takeaway";
  status: "paid" | "served" | "cancelled" | "pending" | "preparing" | "ready";
  billingMethod?: string;
  total: number;
  items: Array<{ name: string; qty: number }>;
  createdAt: string;
  settledAt?: string;
  roomNumber?: string;
  notes?: string;
}

export interface HotelGuestEventPayload {
  id: string;
  roomNumber: string;
  roomType?: string;
  name: string;
  phone: string;
  email?: string;
  numberOfGuests: number;
  checkIn: string;
  expectedCheckOut?: string;
  checkOut?: string;
  status: "checked_in" | "checked_out";
  folioBalance?: number;
  idProofType?: string;
  nationality?: string;
  address?: string;
}

export interface HistorySyncEvent {
  type: HistoryEventType;
  payload: DiningEventPayload | HotelGuestEventPayload | any;
  tenantSlug?: string | null;
  tenantId?: string | null;
  timestamp: number;
}

const BROADCAST_CHANNEL_NAME = "dineflow_history_sync";
const EVENT_NAME = "dineflow_history_event";

/**
 * Dispatches an event through BroadcastChannel (cross-tab) and CustomEvent (same-window)
 */
export function dispatchHistoryEvent(event: HistorySyncEvent): void {
  if (typeof window === "undefined") return;

  // 1. BroadcastChannel for other tabs/windows
  try {
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.postMessage(event);
      channel.close();
    }
  } catch (err) {
    console.warn("[HistoryEventHub] BroadcastChannel dispatch failed:", err);
  }

  // 2. CustomEvent for immediate same-window subscribers
  try {
    const customEvent = new CustomEvent(EVENT_NAME, { detail: event });
    window.dispatchEvent(customEvent);
  } catch (err) {
    console.warn("[HistoryEventHub] CustomEvent dispatch failed:", err);
  }

  // 3. LocalStorage persistence for demo / offline session durability
  try {
    const tenantKey = event.tenantId || event.tenantSlug || "default";
    if (event.type === "GUEST_CHECKED_IN" || event.type === "GUEST_CHECKED_OUT") {
      const guest = event.payload as HotelGuestEventPayload;
      const storageKey = `dineflow_hotel_guests_${tenantKey}`;
      const existing: HotelGuestEventPayload[] = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const idx = existing.findIndex((g) => g.id === guest.id || (g.roomNumber === guest.roomNumber && g.name === guest.name));
      if (idx >= 0) {
        existing[idx] = { ...existing[idx], ...guest };
      } else {
        existing.unshift(guest);
      }
      localStorage.setItem(storageKey, JSON.stringify(existing.slice(0, 100)));
    } else if (event.type === "BILL_SETTLED") {
      const order = event.payload as DiningEventPayload;
      const storageKey = `dineflow_live_settled_orders_${tenantKey}`;
      const existing: DiningEventPayload[] = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const idx = existing.findIndex((o) => o.id === order.id);
      if (idx >= 0) {
        existing[idx] = { ...existing[idx], ...order };
      } else {
        existing.unshift(order);
      }
      localStorage.setItem(storageKey, JSON.stringify(existing.slice(0, 100)));
    }
  } catch (err) {
    // Non-critical local storage fallback
  }
}

/**
 * Triggers a Dining Bill Settled event
 */
export function triggerDiningBillSettled(order: DiningEventPayload, tenantId?: string | null, tenantSlug?: string | null): void {
  dispatchHistoryEvent({
    type: "BILL_SETTLED",
    payload: {
      ...order,
      status: "paid",
      settledAt: order.settledAt || new Date().toISOString(),
    },
    tenantId,
    tenantSlug,
    timestamp: Date.now(),
  });
}

/**
 * Triggers a Customer Order Created event
 */
export function triggerCustomerOrderCreated(order: DiningEventPayload, tenantId?: string | null, tenantSlug?: string | null): void {
  dispatchHistoryEvent({
    type: "ORDER_CREATED",
    payload: order,
    tenantId,
    tenantSlug,
    timestamp: Date.now(),
  });
}

/**
 * Triggers a Hotel Guest Checked In event
 */
export function triggerHotelGuestCheckedIn(guest: HotelGuestEventPayload, tenantId?: string | null, tenantSlug?: string | null): void {
  dispatchHistoryEvent({
    type: "GUEST_CHECKED_IN",
    payload: {
      ...guest,
      status: "checked_in",
      checkIn: guest.checkIn || new Date().toISOString(),
    },
    tenantId,
    tenantSlug,
    timestamp: Date.now(),
  });
}

/**
 * Triggers a Hotel Guest Checked Out event
 */
export function triggerHotelGuestCheckedOut(guest: Partial<HotelGuestEventPayload> & { id?: string; roomNumber: string; name: string }, tenantId?: string | null, tenantSlug?: string | null): void {
  dispatchHistoryEvent({
    type: "GUEST_CHECKED_OUT",
    payload: {
      ...guest,
      status: "checked_out",
      checkOut: guest.checkOut || new Date().toISOString(),
    },
    tenantId,
    tenantSlug,
    timestamp: Date.now(),
  });
}

/**
 * Retrieves persisted guests from LocalStorage for seamless fallback
 */
export function getStoredHotelGuests(tenantKey = "default"): HotelGuestEventPayload[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`dineflow_hotel_guests_${tenantKey}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Retrieves persisted settled orders from LocalStorage
 */
export function getStoredSettledOrders(tenantKey = "default"): DiningEventPayload[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`dineflow_live_settled_orders_${tenantKey}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
