"use client";

import * as React from "react";
import {
  History,
  Calendar,
  Search,
  Download,
  Hotel,
  UtensilsCrossed,
  Users,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  RefreshCw,
  Sparkles,
  Phone,
  Receipt,
  Building,
  ChevronRight,
  Filter,
  FileSpreadsheet,
  Check,
  Zap,
  Radio,
  Activity,
  ChevronDown,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api";
import { useTenantData, KdsOrder } from "@/lib/stores/tenant-data-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useNotificationStore } from "@/lib/stores/notification-store";
import { cn, formatCurrency } from "@/lib/utils";
import { hasRooms, getCategoryConfig } from "@/lib/rbac/roles";
import NumberFlow from "@number-flow/react";
import {
  triggerDiningBillSettled,
  triggerHotelGuestCheckedIn,
  triggerHotelGuestCheckedOut,
  getStoredHotelGuests,
  getStoredSettledOrders,
  HistorySyncEvent,
} from "@/lib/realtime/history-events";

interface HotelGuestRecord {
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
  folioBalance: number;
  idProofType?: string;
  nationality?: string;
  address?: string;
  isLive?: boolean;
}

interface DiningRecord {
  id: string;
  table: string;
  customerName: string;
  customerPhone: string;
  destination: "dine_in" | "room_service" | "takeaway";
  status: "paid" | "served" | "cancelled" | "pending" | "preparing" | "ready";
  billingMethod?: string;
  total: number;
  items: Array<{ name: string; qty: number }>;
  createdAt: string;
  roomNumber?: string;
  isLive?: boolean;
}

type DatePreset = "today" | "yesterday" | "7d" | "30d" | "custom";

export default function GuestDiningHistoryPage() {
  const { addToast } = useToast();
  const { orders: storeOrders, tenantName, tenantSlug } = useTenantData();
  const { user, tenant } = useAuthStore();

  const hasRoomsEnabled = hasRooms(tenant?.type);
  const categoryConfig = getCategoryConfig(tenant?.type);
  const isCloudKitchen = categoryConfig.id === "cloud_kitchen";

  const [activeTab, setActiveTab] = React.useState<"all" | "hotel" | "dining">("all");
  const [datePreset, setDatePreset] = React.useState<DatePreset>("today");
  const [customStart, setCustomStart] = React.useState<string>("");
  const [customEnd, setCustomEnd] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);

  // If rooms disabled and user is on hotel tab, fallback to dining
  React.useEffect(() => {
    if (!hasRoomsEnabled && activeTab === "hotel") {
      setActiveTab("dining");
    }
  }, [hasRoomsEnabled, activeTab]);

  // Real-time synchronization state
  const [highlightedId, setHighlightedId] = React.useState<string | null>(null);
  const [liveEventCount, setLiveEventCount] = React.useState<number>(0);
  const [lastLiveMessage, setLastLiveMessage] = React.useState<string | null>(null);
  const [showSimulateMenu, setShowSimulateMenu] = React.useState<boolean>(false);

  // Raw data collections
  const [hotelGuests, setHotelGuests] = React.useState<HotelGuestRecord[]>([]);
  const [diningOrders, setDiningOrders] = React.useState<DiningRecord[]>([]);

  // Calculate current date range bounds
  const dateRangeBounds = React.useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (datePreset === "today") {
      return { start: todayStart, end: todayEnd, label: "Today" };
    }

    if (datePreset === "yesterday") {
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      const yesterdayEnd = new Date(todayEnd);
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
      return { start: yesterdayStart, end: yesterdayEnd, label: "Yesterday" };
    }

    if (datePreset === "7d") {
      const past7 = new Date(todayStart);
      past7.setDate(past7.getDate() - 6);
      return { start: past7, end: todayEnd, label: "Last 7 Days" };
    }

    if (datePreset === "30d") {
      const past30 = new Date(todayStart);
      past30.setDate(past30.getDate() - 29);
      return { start: past30, end: todayEnd, label: "Last 30 Days" };
    }

    // Custom
    const start = customStart ? new Date(`${customStart}T00:00:00`) : new Date(todayStart);
    const end = customEnd ? new Date(`${customEnd}T23:59:59`) : new Date(todayEnd);
    return { start, end, label: "Custom Range" };
  }, [datePreset, customStart, customEnd]);

  // Fetch live history from API with fallback generation for demo environments
  const loadHistoryData = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [guestsRes, ordersRes] = await Promise.allSettled([
        apiClient.get("/rooms/guests/history"),
        apiClient.get("/orders"),
      ]);

      let loadedGuests: HotelGuestRecord[] = [];
      if (guestsRes.status === "fulfilled" && Array.isArray(guestsRes.value.data?.data)) {
        loadedGuests = guestsRes.value.data.data.map((g: any) => ({
          id: g.id || g._id,
          roomNumber: g.roomNumber || "Suite",
          roomType: g.roomType || (g.roomNumber?.startsWith("3") ? "Executive Suite" : "Deluxe Room"),
          name: g.name || "Hotel Resident",
          phone: g.phone || "+91 98000 00000",
          email: g.email,
          numberOfGuests: g.numberOfGuests || 2,
          checkIn: g.checkIn || g.createdAt || new Date().toISOString(),
          expectedCheckOut: g.expectedCheckOut,
          checkOut: g.checkOut,
          status: g.status === "checked_out" ? "checked_out" : "checked_in",
          folioBalance: typeof g.folioBalance === "number" ? g.folioBalance : 0,
          idProofType: g.idProofType || "Aadhaar Card",
          nationality: g.nationality || "Indian",
          address: g.address || "Bengaluru, Karnataka",
        }));
      }

      // Merge persisted real-time guests from localStorage (from rooms dashboard check-ins)
      const storedGuests = getStoredHotelGuests(tenantSlug || "default");
      if (storedGuests.length > 0) {
        storedGuests.forEach((sg) => {
          const cleanId = String(sg.id);
          const existingIdx = loadedGuests.findIndex(
            (lg) => lg.id === cleanId || (lg.roomNumber === sg.roomNumber && lg.name === sg.name)
          );
          if (existingIdx >= 0) {
            loadedGuests[existingIdx] = { ...loadedGuests[existingIdx], ...sg };
          } else {
            loadedGuests.unshift({
              ...sg,
              folioBalance: sg.folioBalance || 0,
            });
          }
        });
      }

      // If backend has no past guests or in demo mode, supply rich realistic multi-day records
      if (loadedGuests.length === 0) {
        const now = new Date();
        const yDay = new Date(now);
        yDay.setDate(yDay.getDate() - 1);
        const day3Ago = new Date(now);
        day3Ago.setDate(day3Ago.getDate() - 3);
        const day8Ago = new Date(now);
        day8Ago.setDate(day8Ago.getDate() - 8);
        const day15Ago = new Date(now);
        day15Ago.setDate(day15Ago.getDate() - 15);
        const day24Ago = new Date(now);
        day24Ago.setDate(day24Ago.getDate() - 24);

        loadedGuests = [
          {
            id: "gst-01",
            roomNumber: "302",
            roomType: "Executive Suite",
            name: "Dr. Vikram Malhotra",
            phone: "+91 98450 12345",
            email: "vikram.m@gmail.com",
            numberOfGuests: 2,
            checkIn: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 30).toISOString(),
            expectedCheckOut: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 11, 0).toISOString(),
            status: "checked_in",
            folioBalance: 2450,
            idProofType: "Aadhaar Card",
            nationality: "Indian",
            address: "Koramangala, Bengaluru",
          },
          {
            id: "gst-02",
            roomNumber: "204",
            roomType: "Deluxe King",
            name: "Ananya Deshmukh",
            phone: "+91 99123 45678",
            email: "ananya.d@outlook.com",
            numberOfGuests: 1,
            checkIn: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 15).toISOString(),
            expectedCheckOut: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 0).toISOString(),
            status: "checked_in",
            folioBalance: 1200,
            idProofType: "Driving License",
            nationality: "Indian",
            address: "Bandra West, Mumbai",
          },
          {
            id: "gst-03",
            roomNumber: "401",
            roomType: "Presidential Penthouse",
            name: "Rajeshwar Singhania",
            phone: "+91 98200 88990",
            email: "singhania.holdings@corp.in",
            numberOfGuests: 3,
            checkIn: new Date(yDay.getFullYear(), yDay.getMonth(), yDay.getDate(), 14, 0).toISOString(),
            checkOut: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 45).toISOString(),
            status: "checked_out",
            folioBalance: 8750,
            idProofType: "Passport",
            nationality: "Indian",
            address: "Jubilee Hills, Hyderabad",
          },
          {
            id: "gst-04",
            roomNumber: "105",
            roomType: "Garden View Deluxe",
            name: "Meera Krishnan",
            phone: "+91 97401 55667",
            email: "meera.krish@techcorp.com",
            numberOfGuests: 2,
            checkIn: new Date(yDay.getFullYear(), yDay.getMonth(), yDay.getDate(), 12, 15).toISOString(),
            expectedCheckOut: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 0).toISOString(),
            status: "checked_in",
            folioBalance: 3100,
            idProofType: "Aadhaar Card",
            nationality: "Indian",
            address: "Alwarpet, Chennai",
          },
          {
            id: "gst-05",
            roomNumber: "208",
            roomType: "Executive Room",
            name: "Arjun Sen",
            phone: "+91 98310 99887",
            email: "arjun.sen@kolkata.org",
            numberOfGuests: 1,
            checkIn: new Date(day3Ago.getFullYear(), day3Ago.getMonth(), day3Ago.getDate(), 15, 30).toISOString(),
            checkOut: new Date(yDay.getFullYear(), yDay.getMonth(), yDay.getDate(), 11, 30).toISOString(),
            status: "checked_out",
            folioBalance: 4200,
            idProofType: "Voter ID",
            nationality: "Indian",
            address: "Salt Lake City, Kolkata",
          },
          {
            id: "gst-06",
            roomNumber: "305",
            roomType: "Corner Suite",
            name: "Sunil & Radhika Nair",
            phone: "+91 98470 33445",
            email: "nair.sunil@kerala.biz",
            numberOfGuests: 2,
            checkIn: new Date(day8Ago.getFullYear(), day8Ago.getMonth(), day8Ago.getDate(), 13, 0).toISOString(),
            checkOut: new Date(day3Ago.getFullYear(), day3Ago.getMonth(), day3Ago.getDate(), 10, 0).toISOString(),
            status: "checked_out",
            folioBalance: 11400,
            idProofType: "Passport",
            nationality: "Indian",
            address: "Panampilly Nagar, Kochi",
          },
          {
            id: "gst-07",
            roomNumber: "102",
            roomType: "Garden View Deluxe",
            name: "Pooja Hegde",
            phone: "+91 96111 22334",
            email: "pooja.h@studio.com",
            numberOfGuests: 2,
            checkIn: new Date(day15Ago.getFullYear(), day15Ago.getMonth(), day15Ago.getDate(), 16, 20).toISOString(),
            checkOut: new Date(day8Ago.getFullYear(), day8Ago.getMonth(), day8Ago.getDate(), 11, 0).toISOString(),
            status: "checked_out",
            folioBalance: 9600,
            idProofType: "Aadhaar Card",
            nationality: "Indian",
            address: "Indiranagar, Bengaluru",
          },
          {
            id: "gst-08",
            roomNumber: "301",
            roomType: "Presidential Penthouse",
            name: "Capt. Devendra Rathore",
            phone: "+91 94140 77889",
            email: "dev.rathore@aviation.in",
            numberOfGuests: 4,
            checkIn: new Date(day24Ago.getFullYear(), day24Ago.getMonth(), day24Ago.getDate(), 10, 0).toISOString(),
            checkOut: new Date(day15Ago.getFullYear(), day15Ago.getMonth(), day15Ago.getDate(), 12, 0).toISOString(),
            status: "checked_out",
            folioBalance: 24800,
            idProofType: "Passport",
            nationality: "Indian",
            address: "Civil Lines, Jaipur",
          },
        ];
      }
      if (!hasRoomsEnabled) {
        setHotelGuests([]);
      } else {
        setHotelGuests(loadedGuests);
      }

      // 2. Process Restaurant Dining History
      let loadedOrders: DiningRecord[] = [];
      if (ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value.data?.data)) {
        loadedOrders = ordersRes.value.data.data.map((o: any) => ({
          id: String(o.orderNumber || o.id || o._id).replace(/^#+/, ""),
          table: o.table || o.tableName || (o.roomNumber ? `Suite ${o.roomNumber}` : "Table 01"),
          customerName: o.customerName || "Dine-in Customer",
          customerPhone: o.customerPhone || "+91 99000 11222",
          destination: o.destination || (o.roomNumber ? "room_service" : "dine_in"),
          status: o.status || "paid",
          billingMethod: o.billingMethod || "Cash",
          total: o.total || o.totalAmount || 450,
          items: Array.isArray(o.items)
            ? o.items.map((it: any) => ({ name: it.name, qty: it.qty || it.quantity || 1 }))
            : [{ name: "Specialty Chef Tasting", qty: 1 }],
          createdAt: o.createdAt || new Date().toISOString(),
          roomNumber: o.roomNumber,
        }));
      }

      // Merge persisted real-time settled orders from localStorage
      const storedSettled = getStoredSettledOrders(tenantSlug || "default");
      if (storedSettled.length > 0) {
        storedSettled.forEach((so) => {
          const cleanId = String(so.id).replace(/^#+/, "");
          const existingIdx = loadedOrders.findIndex((lo) => lo.id === cleanId);
          const formatted: DiningRecord = {
            id: cleanId,
            table: so.table || "Dine-in",
            customerName: so.customerName || "Dine-in Customer",
            customerPhone: so.customerPhone || "+91 99000 11222",
            destination: so.destination || "dine_in",
            status: "paid",
            billingMethod: so.billingMethod || "UPI / QR",
            total: so.total,
            items: so.items || [],
            createdAt: so.createdAt || new Date().toISOString(),
            roomNumber: so.roomNumber,
          };
          if (existingIdx >= 0) {
            loadedOrders[existingIdx] = { ...loadedOrders[existingIdx], ...formatted };
          } else {
            loadedOrders.unshift(formatted);
          }
        });
      }

      // Merge with store orders if present
      if (storeOrders.length > 0) {
        storeOrders.forEach((so) => {
          const cleanId = String(so.id).replace(/^#+/, "");
          const existingIdx = loadedOrders.findIndex((lo) => lo.id === cleanId);
          const formatted: DiningRecord = {
            id: cleanId,
            table: so.table,
            customerName: so.customerName || "Dine-in Customer",
            customerPhone: so.customerPhone || "+91 99000 11222",
            destination: so.destination,
            status: so.status,
            billingMethod: so.billingMethod || (so.status === "paid" ? "UPI / QR" : undefined),
            total: so.total,
            items: so.items.map((it) => ({ name: it.name, qty: it.qty })),
            createdAt: so.time ? new Date().toISOString() : new Date().toISOString(),
            roomNumber: so.roomNumber,
          };
          if (existingIdx >= 0) {
            loadedOrders[existingIdx] = { ...loadedOrders[existingIdx], ...formatted };
          } else {
            loadedOrders.unshift(formatted);
          }
        });
      }

      // If still fewer than 5 orders, supply rich realistic multi-day restaurant dining history
      if (loadedOrders.length < 5) {
        const now = new Date();
        const yDay = new Date(now);
        yDay.setDate(yDay.getDate() - 1);
        const day2Ago = new Date(now);
        day2Ago.setDate(day2Ago.getDate() - 2);
        const day7Ago = new Date(now);
        day7Ago.setDate(day7Ago.getDate() - 7);
        const day14Ago = new Date(now);
        day14Ago.setDate(day14Ago.getDate() - 14);
        const day26Ago = new Date(now);
        day26Ago.setDate(day26Ago.getDate() - 26);

        const demoDining: DiningRecord[] = [
          {
            id: "1094",
            table: "Table 04",
            customerName: "Rohan Kapoor",
            customerPhone: "+91 98201 11223",
            destination: "dine_in",
            status: "paid",
            billingMethod: "UPI / QR",
            total: 1840,
            items: [
              { name: "Mysore Masala Dosa", qty: 2 },
              { name: "Filter Coffee Decoct", qty: 2 },
              { name: "Medu Vada Platter", qty: 1 },
            ],
            createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 25).toISOString(),
          },
          {
            id: "1093",
            table: "Table 02",
            customerName: "Priyanka Roy",
            customerPhone: "+91 98450 77665",
            destination: "dine_in",
            status: "paid",
            billingMethod: "Card (POS)",
            total: 1250,
            items: [
              { name: "Wood-Fired Margherita", qty: 1 },
              { name: "Valencia Orange Spritz", qty: 2 },
            ],
            createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 10).toISOString(),
          },
          {
            id: "1092",
            table: "Table 01",
            customerName: "Siddharth Joshi",
            customerPhone: "+91 98110 33445",
            destination: "dine_in",
            status: "paid",
            billingMethod: "Cash",
            total: 890,
            items: [
              { name: "Ghee Roast Dosa", qty: 1 },
              { name: "Cold Brew Tonic", qty: 1 },
            ],
            createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 40).toISOString(),
          },
          {
            id: "1088",
            table: "Table 03",
            customerName: "Kavita Rao",
            customerPhone: "+91 99002 88776",
            destination: "dine_in",
            status: "paid",
            billingMethod: "UPI / QR",
            total: 2150,
            items: [
              { name: "Truffle Mushroom Risotto", qty: 2 },
              { name: "Belgian Chocolate Fondant", qty: 1 },
            ],
            createdAt: new Date(yDay.getFullYear(), yDay.getMonth(), yDay.getDate(), 20, 15).toISOString(),
          },
          {
            id: "1085",
            table: "Table 05",
            customerName: "Aditya Nambiar",
            customerPhone: "+91 98471 44332",
            destination: "dine_in",
            status: "paid",
            billingMethod: "Cash",
            total: 1420,
            items: [
              { name: "Burrata & Heirloom Salad", qty: 1 },
              { name: "Rava Onion Dosa", qty: 2 },
            ],
            createdAt: new Date(yDay.getFullYear(), yDay.getMonth(), yDay.getDate(), 19, 30).toISOString(),
          },
          {
            id: "1080",
            table: "Suite 302",
            customerName: "Dr. Vikram Malhotra",
            customerPhone: "+91 98450 12345",
            destination: "room_service",
            status: "paid",
            billingMethod: "Room Folio",
            total: 1650,
            items: [
              { name: "Grand Club Sandwich", qty: 1 },
              { name: "Single Origin Cortado", qty: 2 },
            ],
            createdAt: new Date(yDay.getFullYear(), yDay.getMonth(), yDay.getDate(), 14, 20).toISOString(),
            roomNumber: "302",
          },
          {
            id: "1071",
            table: "Table 02",
            customerName: "Deepak Mehta",
            customerPhone: "+91 98200 44556",
            destination: "dine_in",
            status: "paid",
            billingMethod: "Card (POS)",
            total: 3200,
            items: [
              { name: "Tandoori Jheenga", qty: 2 },
              { name: "Butter Naan Basket", qty: 3 },
              { name: "Royal Mango Lassi", qty: 2 },
            ],
            createdAt: new Date(day2Ago.getFullYear(), day2Ago.getMonth(), day2Ago.getDate(), 21, 10).toISOString(),
          },
        ];

        demoDining.forEach((dd) => {
          if (!loadedOrders.some((lo) => lo.id === dd.id)) {
            loadedOrders.push(dd);
          }
        });
      }

      setDiningOrders(loadedOrders);
    } catch (e) {
      console.warn("Failed to load history data:", e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [storeOrders, tenantSlug, tenantName, hasRoomsEnabled]);

  // Initial load
  React.useEffect(() => {
    loadHistoryData();
  }, [loadHistoryData]);

  // Listen for real-time history events across tabs, same-window, and SSE notifications
  React.useEffect(() => {
    const handleHistoryEvent = (event: HistorySyncEvent) => {
      if (!event || !event.type) return;

      setLiveEventCount((prev) => prev + 1);

      if (event.type === "BILL_SETTLED" || event.type === "ORDER_CREATED") {
        const orderData = event.payload;
        const cleanId = String(orderData.id).replace(/^#+/, "");
        const formattedRecord: DiningRecord = {
          id: cleanId,
          table: orderData.table || "Dine-in",
          customerName: orderData.customerName || "Customer",
          customerPhone: orderData.customerPhone || "+91 99000 11222",
          destination: orderData.destination || "dine_in",
          status: orderData.status || (event.type === "BILL_SETTLED" ? "paid" : "pending"),
          billingMethod: orderData.billingMethod || "UPI / QR",
          total: Number(orderData.total) || 0,
          items: Array.isArray(orderData.items)
            ? orderData.items.map((it: any) => ({ name: it.name, qty: it.qty || 1 }))
            : [{ name: "Chef Tasting", qty: 1 }],
          createdAt: orderData.createdAt || orderData.settledAt || new Date().toISOString(),
          roomNumber: orderData.roomNumber,
          isLive: true,
        };

        setDiningOrders((prev) => {
          const idx = prev.findIndex((o) => o.id === cleanId);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...formattedRecord };
            return next;
          }
          return [formattedRecord, ...prev];
        });

        setHighlightedId(cleanId);
        const msg =
          event.type === "BILL_SETTLED"
            ? `Bill Settled: ${formattedRecord.table} — ${formatCurrency(formattedRecord.total)} via ${formattedRecord.billingMethod}`
            : `New Order: #${cleanId} for ${formattedRecord.table}`;
        setLastLiveMessage(msg);
        addToast("success", "⚡ Real-Time Update", msg);

        setTimeout(() => {
          setHighlightedId((curr) => (curr === cleanId ? null : curr));
        }, 5000);
      } else if (event.type === "GUEST_CHECKED_IN") {
        const g = event.payload;
        const guestId = g.id || `gst-${Date.now()}`;
        const newGuest: HotelGuestRecord = {
          id: guestId,
          roomNumber: g.roomNumber || "Suite",
          roomType: g.roomType || "Deluxe Suite",
          name: g.name || "Hotel Resident",
          phone: g.phone || "+91 98000 00000",
          email: g.email,
          numberOfGuests: g.numberOfGuests || 1,
          checkIn: g.checkIn || new Date().toISOString(),
          expectedCheckOut: g.expectedCheckOut,
          status: "checked_in",
          folioBalance: g.folioBalance || 0,
          idProofType: g.idProofType || "Aadhaar Card",
          nationality: g.nationality || "Indian",
          address: g.address || "Bengaluru, India",
          isLive: true,
        };

        setHotelGuests((prev) => {
          const idx = prev.findIndex(
            (item) => item.id === guestId || (item.roomNumber === newGuest.roomNumber && item.name === newGuest.name)
          );
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...newGuest };
            return next;
          }
          return [newGuest, ...prev];
        });

        setHighlightedId(guestId);
        const msg = `Guest Checked In: ${newGuest.name} in Room ${newGuest.roomNumber}`;
        setLastLiveMessage(msg);
        addToast("success", "⚡ Real-Time Check-In", msg);

        setTimeout(() => {
          setHighlightedId((curr) => (curr === guestId ? null : curr));
        }, 5000);
      } else if (event.type === "GUEST_CHECKED_OUT") {
        const g = event.payload;
        const checkoutId = g.id;
        const targetRoom = String(g.roomNumber || "").trim().toLowerCase();

        setHotelGuests((prev) =>
          prev.map((item) => {
            const match =
              (checkoutId && item.id === checkoutId) ||
              (item.roomNumber.toLowerCase() === targetRoom && item.status === "checked_in") ||
              (item.name.toLowerCase() === (g.name || "").toLowerCase() && item.status === "checked_in");
            if (match) {
              return {
                ...item,
                status: "checked_out",
                checkOut: g.checkOut || new Date().toISOString(),
                folioBalance: g.folioBalance ?? item.folioBalance,
                isLive: true,
              };
            }
            return item;
          })
        );

        if (checkoutId) setHighlightedId(checkoutId);
        const msg = `Guest Checked Out: ${g.name || "Resident"} from Room ${g.roomNumber || ""}`;
        setLastLiveMessage(msg);
        addToast("info", "⚡ Real-Time Check-Out", msg);

        setTimeout(() => {
          setHighlightedId((curr) => (curr === checkoutId ? null : curr));
        }, 5000);
      }
    };

    // 1. BroadcastChannel for cross-tab sync
    let channel: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel("dineflow_history_sync");
        channel.onmessage = (e) => {
          if (e.data) handleHistoryEvent(e.data);
        };
      }
    } catch {}

    // 2. CustomEvent for same-tab instant sync
    const handleCustom = (e: Event) => {
      const customEvent = e as CustomEvent<HistorySyncEvent>;
      if (customEvent.detail) handleHistoryEvent(customEvent.detail);
    };
    window.addEventListener("dineflow_history_event", handleCustom);

    // 3. Storage event listener for multi-tab fallback
    const handleStorage = (e: StorageEvent) => {
      if (e.key && (e.key.startsWith("dineflow_hotel_guests_") || e.key.startsWith("dineflow_live_settled_orders_"))) {
        loadHistoryData();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      channel?.close();
      window.removeEventListener("dineflow_history_event", handleCustom);
      window.removeEventListener("storage", handleStorage);
    };
  }, [addToast, loadHistoryData]);

  // Connect to SSE notifications stream
  React.useEffect(() => {
    const notifStore = useNotificationStore.getState();
    notifStore.connectSSE();

    const unsub = useNotificationStore.subscribe((state, prevState) => {
      if (state.notifications.length > prevState.notifications.length) {
        const latest = state.notifications[0];
        if (
          latest &&
          (latest.category === "payments" || latest.category === "orders" || latest.category === "reservations")
        ) {
          loadHistoryData();
        }
      }
    });

    return () => {
      unsub();
    };
  }, [loadHistoryData]);

  // Date Filtering Predicate
  const isDateWithinRange = React.useCallback(
    (isoDateString?: string) => {
      if (!isoDateString) return false;
      const targetTime = new Date(isoDateString).getTime();
      if (isNaN(targetTime)) return false;
      return targetTime >= dateRangeBounds.start.getTime() && targetTime <= dateRangeBounds.end.getTime();
    },
    [dateRangeBounds]
  );

  // Filtered Collections
  const filteredHotelGuests = React.useMemo(() => {
    return hotelGuests.filter((g) => {
      const dateMatch = isDateWithinRange(g.checkIn) || (g.checkOut && isDateWithinRange(g.checkOut));
      if (!dateMatch) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        g.name.toLowerCase().includes(q) ||
        g.phone.toLowerCase().includes(q) ||
        g.roomNumber.toLowerCase().includes(q) ||
        (g.idProofType && g.idProofType.toLowerCase().includes(q))
      );
    });
  }, [hotelGuests, isDateWithinRange, searchQuery]);

  const filteredDiningOrders = React.useMemo(() => {
    return diningOrders.filter((o) => {
      const dateMatch = isDateWithinRange(o.createdAt);
      if (!dateMatch) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q) ||
        o.table.toLowerCase().includes(q) ||
        (o.billingMethod && o.billingMethod.toLowerCase().includes(q))
      );
    });
  }, [diningOrders, isDateWithinRange, searchQuery]);

  // Combined Chronological Feed for "all" tab
  const combinedActivityFeed = React.useMemo(() => {
    const feed: Array<{
      id: string;
      type: "hotel_checkin" | "hotel_checkout" | "dining_order";
      timestamp: string;
      title: string;
      subtitle: string;
      detail: string;
      amount?: number;
      method?: string;
      status: string;
      isLive?: boolean;
    }> = [];

    filteredHotelGuests.forEach((g) => {
      feed.push({
        id: `h-in-${g.id}`,
        type: "hotel_checkin",
        timestamp: g.checkIn,
        title: `${g.name} checked into Suite ${g.roomNumber}`,
        subtitle: `${g.roomType || "Room"} • ${g.numberOfGuests} Guests • ${g.phone}`,
        detail: `ID: ${g.idProofType || "Verified"} • Folio: ${formatCurrency(g.folioBalance)}`,
        status: g.status === "checked_in" ? "In-House" : "Checked Out",
        isLive: g.isLive,
      });

      if (g.checkOut && isDateWithinRange(g.checkOut)) {
        feed.push({
          id: `h-out-${g.id}`,
          type: "hotel_checkout",
          timestamp: g.checkOut,
          title: `${g.name} checked out from Suite ${g.roomNumber}`,
          subtitle: `Stay settled • Folio Cleared`,
          detail: `Folio Total: ${formatCurrency(g.folioBalance)}`,
          amount: g.folioBalance,
          status: "Checked Out",
          isLive: g.isLive,
        });
      }
    });

    filteredDiningOrders.forEach((o) => {
      const itemsCount = o.items.reduce((acc, it) => acc + it.qty, 0);
      const itemsPreview = o.items.map((it) => `${it.qty}x ${it.name}`).slice(0, 2).join(", ");
      feed.push({
        id: `d-${o.id}`,
        type: "dining_order",
        timestamp: o.createdAt,
        title: `${o.customerName} dined at ${o.table}`,
        subtitle: `${itemsCount} items (${itemsPreview}${o.items.length > 2 ? "…" : ""})`,
        detail: `Method: ${o.billingMethod || "Settled"} • Ticket #${o.id}`,
        amount: o.total,
        method: o.billingMethod,
        status: o.status === "paid" ? "Paid & Settled" : o.status,
        isLive: o.isLive,
      });
    });

    return feed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [filteredHotelGuests, filteredDiningOrders, isDateWithinRange]);

  // Aggregate KPI Metrics
  const metrics = React.useMemo(() => {
    const totalHotelGuestsCount = filteredHotelGuests.reduce((acc, g) => acc + (g.numberOfGuests || 1), 0);
    const inHouseGuests = filteredHotelGuests.filter((g) => g.status === "checked_in").length;
    const departedGuests = filteredHotelGuests.filter((g) => g.status === "checked_out").length;

    const totalDiningCustomersCount = filteredDiningOrders.length;
    const totalDiningRevenue = filteredDiningOrders
      .filter((o) => o.status === "paid" || o.status === "served")
      .reduce((acc, o) => acc + o.total, 0);
    const totalFolioRevenue = filteredHotelGuests.reduce((acc, g) => acc + g.folioBalance, 0);
    const combinedRevenue = totalDiningRevenue + totalFolioRevenue;

    const averageDiningSpend =
      totalDiningCustomersCount > 0 ? Math.round(totalDiningRevenue / totalDiningCustomersCount) : 0;

    return {
      hotelCheckins: filteredHotelGuests.length,
      totalGuestsStaying: totalHotelGuestsCount,
      inHouseGuests,
      departedGuests,
      diningOrdersCount: totalDiningCustomersCount,
      totalDiningRevenue,
      totalFolioRevenue,
      combinedRevenue,
      averageDiningSpend,
    };
  }, [filteredHotelGuests, filteredDiningOrders]);

  // 1-Click Simulated Event Handlers for instant testing
  const handleSimulateSettle = () => {
    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const tables = ["Table 04", "Table 02", "Table 05", "Table 07", "Table 10"];
    const customers = ["Aarav Mehta", "Shreya Sen", "Vikrant Nair", "Rohit Singhania", "Pooja Hegde"];
    const methods = ["UPI / QR", "Cash", "Card (POS)"];
    const randomTable = tables[Math.floor(Math.random() * tables.length)];
    const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
    const randomMethod = methods[Math.floor(Math.random() * methods.length)];
    const randomTotal = Math.floor(450 + Math.random() * 2200);

    triggerDiningBillSettled(
      {
        id: String(orderNum),
        table: randomTable,
        customerName: randomCustomer,
        customerPhone: "+91 98" + Math.floor(10000000 + Math.random() * 90000000),
        destination: "dine_in",
        status: "paid",
        billingMethod: randomMethod,
        total: randomTotal,
        items: [
          { name: "Specialty Chef Tasting", qty: 2 },
          { name: "Artisanal Brew", qty: 2 },
        ],
        createdAt: new Date().toISOString(),
        settledAt: new Date().toISOString(),
        notes: `Simulated live settlement via ${randomMethod}`,
      },
      undefined,
      tenantSlug
    );
    setShowSimulateMenu(false);
  };

  const handleSimulateCheckIn = () => {
    const suites = ["305", "204", "108", "402", "206"];
    const names = ["Siddharth & Priya Verma", "Dr. Rajesh Sen", "Kavita Rao", "Aditya Nambiar"];
    const randomSuite = suites[Math.floor(Math.random() * suites.length)];
    const randomName = names[Math.floor(Math.random() * names.length)];

    triggerHotelGuestCheckedIn(
      {
        id: `gst-${Date.now()}`,
        roomNumber: randomSuite,
        roomType: "Executive Suite",
        name: randomName,
        phone: "+91 98" + Math.floor(10000000 + Math.random() * 90000000),
        email: "guest@hotelstay.in",
        numberOfGuests: 2,
        checkIn: new Date().toISOString(),
        expectedCheckOut: new Date(Date.now() + 86400000 * 2).toISOString(),
        status: "checked_in",
        folioBalance: 0,
        idProofType: "Aadhaar Card",
        nationality: "Indian",
        address: "Bengaluru, Karnataka",
      },
      undefined,
      tenantSlug
    );
    setShowSimulateMenu(false);
  };

  const handleSimulateCheckOut = () => {
    const inHouse = hotelGuests.find((g) => g.status === "checked_in");
    const targetRoom = inHouse ? inHouse.roomNumber : "302";
    const targetName = inHouse ? inHouse.name : "Dr. Vikram Malhotra";
    const targetId = inHouse ? inHouse.id : "gst-01";

    triggerHotelGuestCheckedOut(
      {
        id: targetId,
        roomNumber: targetRoom,
        name: targetName,
        checkOut: new Date().toISOString(),
        folioBalance: inHouse ? inHouse.folioBalance : 2450,
      },
      undefined,
      tenantSlug
    );
    setShowSimulateMenu(false);
  };

  // CSV Report Generator
  const handleExportCSV = () => {
    const reportTitle = hasRoomsEnabled
      ? "DineFlow — Operational Guest & Dining Audit Report"
      : isCloudKitchen
      ? "DineFlow — Cloud Kitchen Order & Dispatch Audit Report"
      : "DineFlow — Restaurant Dining & Billing Audit Report";

    const rows: Array<Array<string | number>> = [
      [reportTitle],
      [`Generated: ${new Date().toLocaleString()}`],
      [`Period: ${dateRangeBounds.label} (${dateRangeBounds.start.toLocaleDateString()} to ${dateRangeBounds.end.toLocaleDateString()})`],
      [`Tenant: ${tenantName || "DineFlow Hospitality"}`],
      [],
    ];

    if (hasRoomsEnabled) {
      rows.push(
        ["--- SECTION 1: HOTEL GUEST CHECK-IN RECORDS ---"],
        ["Room Number", "Room Type", "Guest Name", "Phone", "Email", "Guests", "Check-In", "Check-Out / Expected", "Status", "Folio Balance", "ID Proof", "Nationality"],
        ...filteredHotelGuests.map((g) => [
          `"${g.roomNumber}"`,
          `"${g.roomType || "Standard"}"`,
          `"${g.name}"`,
          `"${g.phone}"`,
          `"${g.email || ""}"`,
          g.numberOfGuests,
          `"${new Date(g.checkIn).toLocaleString()}"`,
          `"${g.checkOut ? new Date(g.checkOut).toLocaleString() : g.expectedCheckOut ? new Date(g.expectedCheckOut).toLocaleString() : "Active Stay"}"`,
          `"${g.status}"`,
          g.folioBalance,
          `"${g.idProofType || ""}"`,
          `"${g.nationality || ""}"`,
        ]),
        []
      );
    }

    const sectionTitle = hasRoomsEnabled
      ? "--- SECTION 2: RESTAURANT DINING & BILLING RECORDS ---"
      : isCloudKitchen
      ? "--- CLOUD KITCHEN ORDERS & DISPATCH RECORDS ---"
      : "--- RESTAURANT DINING & BILLING RECORDS ---";

    rows.push(
      [sectionTitle],
      ["Ticket ID", "Table / Location", "Customer Name", "Customer Phone", "Destination", "Bill Total", "Payment Method", "Order Status", "Order Timestamp", "Items Ordered"],
      ...filteredDiningOrders.map((o) => [
        `"#${o.id}"`,
        `"${o.table}"`,
        `"${o.customerName}"`,
        `"${o.customerPhone}"`,
        `"${o.destination}"`,
        o.total,
        `"${o.billingMethod || "Paid"}"`,
        `"${o.status}"`,
        `"${new Date(o.createdAt).toLocaleString()}"`,
        `"${o.items.map((it) => `${it.qty}x ${it.name}`).join(", ")}"`,
      ])
    );

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((r) => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const filePrefix = hasRoomsEnabled
      ? "dineflow-guest-dining-history"
      : isCloudKitchen
      ? "dineflow-cloud-kitchen-history"
      : "dineflow-dining-history";
    link.setAttribute("download", `${filePrefix}-${datePreset}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast("success", "History Exported", `Generated CSV report with ${rows.length} records.`);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <History className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {categoryConfig.historyTitle}
                </h1>
                {/* Real-time pulse indicator */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Live Real-Time Sync</span>
                  {liveEventCount > 0 && (
                    <Badge variant="glow" size="sm" className="ml-0.5 text-[9px] bg-emerald-600 text-white font-mono px-1 py-0">
                      +{liveEventCount} new
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {categoryConfig.historyDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Simulate Trigger Dropdown for testing */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSimulateMenu(!showSimulateMenu)}
              className="text-xs flex items-center gap-1.5 border-dashed border-amber-500/40 text-amber-700 dark:text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>⚡ Test Live Trigger</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>

            {showSimulateMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-1.5 z-50 animate-scale-in text-xs space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Simulate Real-Time Trigger
                </div>
                <button
                  type="button"
                  onClick={handleSimulateSettle}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <UtensilsCrossed className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-bold block">
                      {isCloudKitchen ? "Settle Kitchen Order" : "Settle Dining Bill"}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {isCloudKitchen ? "Order #4092 • ₹1,240 via Online" : "Table 04 • ₹1,840 via UPI"}
                    </span>
                  </div>
                </button>
                {hasRoomsEnabled && (
                  <>
                    <button
                      type="button"
                      onClick={handleSimulateCheckIn}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Hotel className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                      <div>
                        <span className="font-bold block">Hotel Guest Check-In</span>
                        <span className="text-[10px] text-slate-400 block">Suite 305 • Radhika Nair</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={handleSimulateCheckOut}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <div>
                        <span className="font-bold block">Hotel Guest Check-Out</span>
                        <span className="text-[10px] text-slate-400 block">Suite 302 • Folio Cleared</span>
                      </div>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadHistoryData}
            disabled={isRefreshing}
            className="text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="glow"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs font-bold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Live notification flash banner if an event was recently received */}
      {lastLiveMessage && (
        <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 animate-slide-up">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-emerald-600 animate-bounce" />
            <strong className="font-bold">Real-Time Trigger:</strong>
            <span>{lastLiveMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setLastLiveMessage(null)}
            className="text-xs opacity-60 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Date Filter & Search Controls Bar */}
      <Card variant="glass" className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Quick Date Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-emerald-600" /> Filter Period:
            </span>
            {[
              { id: "today", label: "Today" },
              { id: "yesterday", label: "Yesterday" },
              { id: "7d", label: "Last 7 Days" },
              { id: "30d", label: "Last 30 Days" },
              { id: "custom", label: "Custom Range" },
            ].map((p) => {
              const active = datePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setDatePreset(p.id as DatePreset)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                    active
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/25"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, phone, room, table..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Custom Date Range Pickers (shown when 'custom' is active) */}
        {datePreset === "custom" && (
          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center gap-3 animate-fade-in text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">From Date:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="font-semibold text-slate-600 dark:text-slate-300">To Date:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}
      </Card>

      {/* Aggregate KPI Metric Cards */}
      <div className={cn("grid gap-4", hasRoomsEnabled ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-3")}>
        {/* KPI 1: Hotel Check-ins (Hotels & Resorts only) */}
        {hasRoomsEnabled && (
          <Card variant="glass" className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Hotel Check-ins
              </span>
              <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Hotel className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                <NumberFlow value={metrics.hotelCheckins} />
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                ({metrics.totalGuestsStaying} total guests)
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>
                🟢 In-House: <strong className="text-slate-900 dark:text-white">{metrics.inHouseGuests}</strong>
              </span>
              <span>
                ⚪ Departed: <strong className="text-slate-900 dark:text-white">{metrics.departedGuests}</strong>
              </span>
            </div>
          </Card>
        )}

        {/* KPI 2: Restaurant Diners / Kitchen Orders */}
        <Card variant="glass" className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isCloudKitchen ? "Orders Dispatched" : "Restaurant Diners"}
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              <NumberFlow value={metrics.diningOrdersCount} />
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {isCloudKitchen ? "orders fulfilled" : "meals served"}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>Revenue:</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
              {formatCurrency(metrics.totalDiningRevenue)}
            </strong>
          </div>
        </Card>

        {/* KPI 3: Combined Realized Revenue */}
        <Card variant="glass" className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Revenue Realized
            </span>
            <div className="h-8 w-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {formatCurrency(hasRoomsEnabled ? metrics.combinedRevenue : metrics.totalDiningRevenue)}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
            {hasRoomsEnabled ? (
              <>
                <span>Dining: {formatCurrency(metrics.totalDiningRevenue)}</span>
                <span>Folio: {formatCurrency(metrics.totalFolioRevenue)}</span>
              </>
            ) : (
              <>
                <span>Settled Checks: <strong className="text-slate-900 dark:text-white font-mono">{metrics.diningOrdersCount}</strong></span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">100% Cleared</span>
              </>
            )}
          </div>
        </Card>

        {/* KPI 4: Average Spend */}
        <Card variant="glass" className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isCloudKitchen ? "Avg Order Value" : "Avg Dining Ticket"}
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {formatCurrency(metrics.averageDiningSpend)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">per order</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>Active Range:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{dateRangeBounds.label}</span>
          </div>
        </Card>
      </div>

      {/* Tabs View Switcher */}
      <div className="overflow-x-auto scrollbar-none pb-1">
        <Tabs
          tabs={[
            { id: "all", label: "All Activity Feed", badge: combinedActivityFeed.length },
            ...(hasRoomsEnabled
              ? [{ id: "hotel", label: "🏨 Hotel Guest Check-ins", badge: filteredHotelGuests.length }]
              : []),
            {
              id: "dining",
              label: isCloudKitchen ? "🍳 Kitchen Order Bills" : "🍽️ Restaurant Dining History",
              badge: filteredDiningOrders.length,
            },
          ]}
          activeTab={!hasRoomsEnabled && activeTab === "hotel" ? "dining" : activeTab}
          onChange={(id) => setActiveTab(id as any)}
        />
      </div>

      {/* Tab 1: Chronological Combined Activity Feed */}
      {activeTab === "all" && (
        <Card variant="glass" className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Chronological Guest & Dining Stream ({combinedActivityFeed.length} records)
            </h3>
            <span className="text-xs text-slate-500 font-mono">Sorted by Most Recent</span>
          </div>

          {combinedActivityFeed.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">
              No check-ins or dining orders found for <strong className="text-slate-800 dark:text-slate-200">{dateRangeBounds.label}</strong>.
            </div>
          ) : (
            <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {combinedActivityFeed.map((item) => {
                const isHotel = item.type.startsWith("hotel");
                const isCheckin = item.type === "hotel_checkin";
                const isJustUpdated = highlightedId && item.id.includes(highlightedId);

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "p-4 transition-all duration-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                      isJustUpdated ? "bg-emerald-500/15 dark:bg-emerald-500/20 ring-1 ring-emerald-500" : "hover:bg-slate-500/5"
                    )}
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border",
                          isHotel
                            ? isCheckin
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        )}
                      >
                        {isHotel ? <Hotel className="h-4 w-4" /> : <UtensilsCrossed className="h-4 w-4" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {item.title}
                          </span>
                          <Badge
                            variant={
                              item.status === "In-House" || item.status === "Paid & Settled"
                                ? "success"
                                : item.status === "Checked Out"
                                ? "neutral"
                                : "warning"
                            }
                            size="sm"
                          >
                            {item.status}
                          </Badge>
                          {(item.isLive || isJustUpdated) && (
                            <Badge variant="glow" size="sm" className="bg-emerald-500 text-white text-[9px] px-1.5 py-0 font-mono animate-pulse">
                              ● LIVE
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{item.detail}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                      {typeof item.amount === "number" && (
                        <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(item.amount)}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} •{" "}
                        {new Date(item.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Tab 2: Hotel Guest Check-ins Table */}
      {activeTab === "hotel" && (
        <Card variant="glass" className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Hotel Room Check-in Records
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Guests who checked into rooms/suites during {dateRangeBounds.label}.
              </p>
            </div>
            <Badge variant="neutral" size="sm">
              {filteredHotelGuests.length} Guests
            </Badge>
          </div>

          <div className="overflow-x-auto scrollbar-none">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-slate-200/80 dark:border-slate-800/80">
                  <TableHead className="pl-4">Room & Type</TableHead>
                  <TableHead>Guest Name & Contact</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Check-In Date</TableHead>
                  <TableHead>Check-Out / Expected</TableHead>
                  <TableHead>Folio Charges</TableHead>
                  <TableHead>ID Proof</TableHead>
                  <TableHead className="text-right pr-4">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHotelGuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-xs text-slate-400 italic">
                      No hotel guest check-in records found for {dateRangeBounds.label}.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHotelGuests.map((guest) => {
                    const checkInDate = new Date(guest.checkIn);
                    const checkOutDate = guest.checkOut
                      ? new Date(guest.checkOut)
                      : guest.expectedCheckOut
                      ? new Date(guest.expectedCheckOut)
                      : null;
                    const isRowHighlighted = highlightedId === guest.id;

                    return (
                      <TableRow
                        key={guest.id}
                        className={cn(
                          "transition-all duration-700",
                          isRowHighlighted ? "bg-emerald-500/15 dark:bg-emerald-500/20 ring-1 ring-emerald-500" : "hover:bg-slate-500/5"
                        )}
                      >
                        {/* Room & Type */}
                        <TableCell className="pl-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-500/20">
                              <Building className="h-4 w-4" />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-slate-900 dark:text-white block">
                                Suite {guest.roomNumber}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                                {guest.roomType}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Guest Name & Contact */}
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-slate-900 dark:text-white block">
                                {guest.name}
                              </span>
                              {(guest.isLive || isRowHighlighted) && (
                                <Badge variant="glow" size="sm" className="bg-emerald-500 text-white text-[9px] px-1 py-0 font-mono animate-pulse">
                                  LIVE
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                              <Phone className="h-3 w-3 text-slate-400" />
                              {guest.phone}
                            </span>
                          </div>
                        </TableCell>

                        {/* Guests Count */}
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 font-medium">
                            <Users className="h-3.5 w-3.5 text-slate-400" />
                            <span>{guest.numberOfGuests} Guests</span>
                          </div>
                        </TableCell>

                        {/* Check In Date */}
                        <TableCell>
                          <div className="text-xs">
                            <span className="font-semibold text-slate-900 dark:text-white block">
                              {checkInDate.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {checkInDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </TableCell>

                        {/* Check Out / Expected */}
                        <TableCell>
                          <div className="text-xs">
                            {checkOutDate ? (
                              <>
                                <span className="font-semibold text-slate-900 dark:text-white block">
                                  {checkOutDate.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  {guest.checkOut ? "Checked out" : "Expected checkout"}
                                </span>
                              </>
                            ) : (
                              <span className="text-slate-400 italic">—</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Folio Charges */}
                        <TableCell>
                          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                            {formatCurrency(guest.folioBalance)}
                          </span>
                        </TableCell>

                        {/* ID Proof */}
                        <TableCell>
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                            {guest.idProofType || "Verified"}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-right pr-4">
                          <Badge
                            variant={guest.status === "checked_in" ? "success" : "neutral"}
                            size="sm"
                            dot
                          >
                            {guest.status === "checked_in" ? "In-House" : "Checked Out"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Tab 3: Restaurant Dining History Table */}
      {activeTab === "dining" && (
        <Card variant="glass" className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Restaurant Dining & Billing Log
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customers who ordered food, settled bills, or dined during {dateRangeBounds.label}.
              </p>
            </div>
            <Badge variant="neutral" size="sm">
              {filteredDiningOrders.length} Dining Tickets
            </Badge>
          </div>

          <div className="overflow-x-auto scrollbar-none">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-slate-200/80 dark:border-slate-800/80">
                  <TableHead className="pl-4">Ticket & Time</TableHead>
                  <TableHead>Table / Location</TableHead>
                  <TableHead>Customer Details</TableHead>
                  <TableHead>Food & Dishes Ordered</TableHead>
                  <TableHead>Total Bill</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right pr-4">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDiningOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-xs text-slate-400 italic">
                      No dining records found for {dateRangeBounds.label}.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDiningOrders.map((order) => {
                    const orderDate = new Date(order.createdAt);
                    const isRoom = order.destination === "room_service" || order.table.toLowerCase().includes("suite");
                    const isRowHighlighted = highlightedId === order.id;

                    return (
                      <TableRow
                        key={order.id}
                        className={cn(
                          "transition-all duration-700",
                          isRowHighlighted ? "bg-emerald-500/15 dark:bg-emerald-500/20 ring-1 ring-emerald-500" : "hover:bg-slate-500/5"
                        )}
                      >
                        {/* Ticket & Time */}
                        <TableCell className="pl-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                              #{order.id.slice(-4).toUpperCase()}
                            </span>
                            {(order.isLive || isRowHighlighted) && (
                              <Badge variant="glow" size="sm" className="bg-emerald-500 text-white text-[9px] px-1 py-0 font-mono animate-pulse">
                                LIVE
                              </Badge>
                            )}
                            <span className="text-[11px] text-slate-400 font-mono">
                              {orderDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </TableCell>

                        {/* Table / Destination */}
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                              <UtensilsCrossed className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {order.table}
                            </span>
                            {isRoom && (
                              <Badge variant="warning" size="sm">
                                Room Service
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Customer Details */}
                        <TableCell>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block">
                              {order.customerName}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                              <Phone className="h-3 w-3 text-slate-400" />
                              {order.customerPhone}
                            </span>
                          </div>
                        </TableCell>

                        {/* Dishes & Food Ordered */}
                        <TableCell>
                          <div className="max-w-[280px]">
                            <div className="flex flex-wrap gap-1">
                              {order.items.map((it, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 truncate"
                                >
                                  {it.qty}x {it.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </TableCell>

                        {/* Bill Amount */}
                        <TableCell>
                          <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
                            {formatCurrency(order.total)}
                          </span>
                        </TableCell>

                        {/* Payment Method */}
                        <TableCell>
                          <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                            <CreditCard className="h-3 w-3 text-emerald-600" />
                            <span>{order.billingMethod || "Paid"}</span>
                          </div>
                        </TableCell>

                        {/* Order Status */}
                        <TableCell className="text-right pr-4">
                          <Badge
                            variant={
                              order.status === "paid"
                                ? "success"
                                : order.status === "cancelled"
                                ? "neutral"
                                : "warning"
                            }
                            size="sm"
                            dot
                          >
                            {order.status === "paid" ? "Paid & Settled" : order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
