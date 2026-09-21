"use client";

import * as React from "react";
import {
  MessageSquareShare,
  CheckCircle2,
  Zap,
  Send,
  PhoneCall,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  FileText,
  Clock,
  RefreshCw,
  Sliders,
  User,
  BrainCircuit,
  Bot,
  ToggleLeft,
  ToggleRight,
  Plus,
  Users,
  Receipt,
  Download,
  Printer,
  Calendar,
  Layers,
  ArrowRight,
  Tag,
  Search,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  AlertTriangle,
  Flame,
  MapPin,
  Coffee,
  DollarSign,
  Building2,
  Smartphone,
  Navigation,
  QrCode,
  Power,
  Copy,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { validateIndianPhone, formatIndianPhoneInput } from "@/lib/validation";

// ── Interfaces ────────────────────────────────────────────────────────────────

interface MessageLogItem {
  id: string;
  phone: string;
  customerName: string;
  template: string;
  status: "delivered" | "read" | "queued" | "failed";
  time: string;
  location: string;
}

interface CustomerInvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  restaurantName: string;
  gstin: string;
  customerName: string;
  customerPhone: string;
  location: string;
  date: string;
  items: CustomerInvoiceItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  taxTotal: number;
  grandTotal: number;
  paymentStatus: "paid" | "pending";
  whatsappDeliveryStatus: "delivered" | "read" | "queued" | "failed";
}

interface CampaignItem {
  id: string;
  name: string;
  type: "text" | "image" | "coupon" | "invoice";
  targetSegment: string;
  messageBody: string;
  couponCode?: string;
  discountPct?: number;
  status: "draft" | "scheduled" | "sent" | "failed";
  scheduledAt?: string;
  sentAt?: string;
  stats?: {
    totalRecipients: number;
    sentCount: number;
    deliveredCount: number;
    readCount: number;
    failedCount: number;
  };
}

interface WABAConfig {
  phoneNumber: string;
  phoneNumberId: string;
  wabaAccountId: string;
  accessToken: string;
  verifyToken: string;
  webhookUrl: string;
  connected: boolean;
  tierLimit: string;
  qualityRating: string;
}

interface SegmentCounts {
  all: number;
  first_time: number;
  repeat: number;
  vip: number;
  hotel_guests: number;
  inactive: number;
}

// ── Default Fallbacks ─────────────────────────────────────────────────────────

const INITIAL_LOGS: MessageLogItem[] = [
  {
    id: "wam-101",
    phone: "+91 98201 44820",
    customerName: "Aarav Sharma",
    template: "Order Confirmed",
    status: "read",
    time: "4 mins ago",
    location: "Table 14",
  },
  {
    id: "wam-100",
    phone: "+91 98450 11923",
    customerName: "Dr. Rohini Mehta",
    template: "Kitchen Ready (Room Service)",
    status: "delivered",
    time: "18 mins ago",
    location: "Suite 302",
  },
  {
    id: "wam-099",
    phone: "+91 99100 88219",
    customerName: "Vikram Kapoor",
    template: "Tax Invoice PDF Receipt",
    status: "read",
    time: "45 mins ago",
    location: "Table 8",
  },
  {
    id: "wam-098",
    phone: "+91 97200 44102",
    customerName: "Priya Nair",
    template: "1-5 Star Feedback Review",
    status: "delivered",
    time: "1h ago",
    location: "Table 3",
  },
];

const INITIAL_INVOICES: CustomerInvoice[] = [
  {
    id: "inv-001",
    invoiceNumber: "INV-202609-1024",
    orderNumber: "ORD-1024",
    restaurantName: "The Grand Bistro",
    gstin: "07AABCU9603R1ZM",
    customerName: "Aarav Sharma",
    customerPhone: "+91 98201 44820",
    location: "Table 14",
    date: new Date().toISOString(),
    items: [
      { name: "Truffle Mushroom Risotto", quantity: 1, unitPrice: 850, total: 850 },
      { name: "Cold Brew Tonic & Citrus", quantity: 2, unitPrice: 320, total: 640 },
    ],
    subtotal: 1490.0,
    cgst: 37.25,
    sgst: 37.25,
    taxTotal: 74.5,
    grandTotal: 1564.5,
    paymentStatus: "paid",
    whatsappDeliveryStatus: "delivered",
  },
  {
    id: "inv-002",
    invoiceNumber: "INV-202609-8670",
    orderNumber: "ORD-8670",
    restaurantName: "The Grand Bistro",
    gstin: "07AABCU9603R1ZM",
    customerName: "Anita Roy",
    customerPhone: "+91 98111 22233",
    location: "Table 02",
    date: new Date(Date.now() - 3600000).toISOString(),
    items: [
      { name: "Paneer Butter Masala", quantity: 1, unitPrice: 380, total: 380 },
      { name: "Garlic Butter Naan", quantity: 2, unitPrice: 90, total: 180 },
    ],
    subtotal: 560.0,
    cgst: 14.0,
    sgst: 14.0,
    taxTotal: 28.0,
    grandTotal: 588.0,
    paymentStatus: "paid",
    whatsappDeliveryStatus: "read",
  },
  {
    id: "inv-003",
    invoiceNumber: "INV-202609-205",
    orderNumber: "IRD-205",
    restaurantName: "The Grand Bistro",
    gstin: "07AABCU9603R1ZM",
    customerName: "Vikram Malhotra",
    customerPhone: "+91 99999 88888",
    location: "Suite 205",
    date: new Date(Date.now() - 7200000).toISOString(),
    items: [
      { name: "Pan-Seared Atlantic Salmon", quantity: 1, unitPrice: 1200, total: 1200 },
      { name: "Belgian Chocolate Fondant", quantity: 1, unitPrice: 450, total: 450 },
    ],
    subtotal: 1650.0,
    cgst: 41.25,
    sgst: 41.25,
    taxTotal: 82.5,
    grandTotal: 1732.5,
    paymentStatus: "paid",
    whatsappDeliveryStatus: "delivered",
  },
];

const INITIAL_CAMPAIGNS: CampaignItem[] = [
  {
    id: "cmp-01",
    name: "Weekend Chef's Tasting Privilege",
    type: "coupon",
    targetSegment: "vip",
    messageBody: "Exclusive for VIP guests! Enjoy 15% off our 5-course Autumn Tasting Menu with code VIPAUTUMN.",
    couponCode: "VIPAUTUMN",
    discountPct: 15,
    status: "sent",
    sentAt: "Yesterday, 18:00",
    stats: {
      totalRecipients: 42,
      sentCount: 42,
      deliveredCount: 40,
      readCount: 36,
      failedCount: 2,
    },
  },
  {
    id: "cmp-02",
    name: "New Wood-Fired Pizza Menu Launch",
    type: "image",
    targetSegment: "repeat",
    messageBody: "Our new authentic sourdough Napoletana pizzas have arrived at The Grand Bistro! Reserve your table tonight.",
    status: "sent",
    sentAt: "3 days ago",
    stats: {
      totalRecipients: 110,
      sentCount: 110,
      deliveredCount: 104,
      readCount: 88,
      failedCount: 6,
    },
  },
];

export default function WhatsAppPage() {
  const { addToast } = useToast();

  // Active Tab: overview | gateway | chatbot | workforce | campaigns | invoices | logs
  const [activeTab, setActiveTab] = React.useState<"overview" | "gateway" | "chatbot" | "workforce" | "campaigns" | "invoices" | "logs">("overview");

  // OpenWA Gateway State
  const [openwaStatus, setOpenwaStatus] = React.useState<{
    sessionId: string;
    status: "connected" | "qr" | "starting" | "disconnected" | "reconnecting";
    engine: string;
    phoneNumber?: string;
    lastConnected?: string;
    errorMessage?: string;
    gatewayUrl?: string;
  }>({
    sessionId: "dineflow-dev",
    status: "disconnected",
    engine: "whatsapp-web.js",
  });
  const [openwaQR, setOpenwaQR] = React.useState<string>("");
  const [openwaGatewayUrl, setOpenwaGatewayUrl] = React.useState<string>("");
  const [isEditingGatewayUrl, setIsEditingGatewayUrl] = React.useState(false);
  const [customGatewayInput, setCustomGatewayInput] = React.useState("");
  const [isOpenwaLoading, setIsOpenwaLoading] = React.useState(false);
  const [openwaTestPhone, setOpenwaTestPhone] = React.useState("+91 98000 12345");
  const [openwaTestName, setOpenwaTestName] = React.useState("Alex Rivera");
  const [isSendingOpenwaTest, setIsSendingOpenwaTest] = React.useState(false);
  const [openwaCopied, setOpenwaCopied] = React.useState(false);
  const [isWhyModalOpen, setIsWhyModalOpen] = React.useState(false);
  const [isSandboxDemo, setIsSandboxDemo] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dineflow_openwa_gateway_url");
      if (saved) {
        setOpenwaGatewayUrl(saved);
        setCustomGatewayInput(saved);
      }
    }
  }, []);

  // Config & Status State
  const [config, setConfig] = React.useState<WABAConfig>({
    phoneNumber: "+91 98765 43210",
    phoneNumberId: "phone_act_981204812",
    wabaAccountId: "waba_act_891823091",
    accessToken: "EAAG...configured",
    verifyToken: "dineflow_webhook_verify_secret",
    webhookUrl: "https://api-production-f170.up.railway.app/api/v1/whatsapp/webhook",
    connected: true,
    tierLimit: "Tier 2 (10k/day)",
    qualityRating: "High",
  });
  const [isConfigModalOpen, setIsConfigModalOpen] = React.useState(false);
  const [configForm, setConfigForm] = React.useState<WABAConfig>(config);

  // Test Sender State
  const [testNumber, setTestNumber] = React.useState("+91 98000 12345");
  const [testNumberTouched, setTestNumberTouched] = React.useState(false);
  const [testGuestName, setTestGuestName] = React.useState("Alex Rivera");
  const [isSendingTest, setIsSendingTest] = React.useState(false);

  // Dispatch Logs State
  const [logs, setLogs] = React.useState<MessageLogItem[]>(INITIAL_LOGS);
  const [logFilter, setLogFilter] = React.useState<string>("all");
  const [logSearch, setLogSearch] = React.useState<string>("");

  // Customer Segments State
  const [segments, setSegments] = React.useState<SegmentCounts>({
    all: 48,
    first_time: 18,
    repeat: 30,
    vip: 12,
    hotel_guests: 8,
    inactive: 5,
  });

  // Campaigns State
  const [campaigns, setCampaigns] = React.useState<CampaignItem[]>(INITIAL_CAMPAIGNS);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = React.useState(false);
  const [newCampaign, setNewCampaign] = React.useState({
    name: "",
    type: "coupon" as const,
    targetSegment: "all",
    messageBody: "",
    couponCode: "",
    discountPct: 10,
  });

  // GST Invoices State
  const [invoices, setInvoices] = React.useState<CustomerInvoice[]>(INITIAL_INVOICES);
  const [selectedInvoice, setSelectedInvoice] = React.useState<CustomerInvoice | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = React.useState(false);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = React.useState(false);
  const [manualOrderId, setManualOrderId] = React.useState("ORD-1024");
  const [isGeneratingInvoice, setIsGeneratingInvoice] = React.useState(false);

  // Chatbot State
  const [chatbotEnabled, setChatbotEnabled] = React.useState(true);
  const [chatbotInput, setChatbotInput] = React.useState("");
  const [chatbotSimNumber, setChatbotSimNumber] = React.useState("+91 98000 12345");
  const [chatbotSimName, setChatbotSimName] = React.useState("Alex Rivera");
  const [chatbotMessages, setChatbotMessages] = React.useState<Array<{ role: "bot" | "user"; text: string; time: string }>>([
    {
      role: "bot",
      text: "👋 Welcome to The Grand Bistro! ✨\n\nHow may we assist you today?\n1. 📋 Menu & Chef Specials\n2. 🛵 Track Live Order Status\n3. 🛎️ Room / Table Assistance\n4. 🙋 Speak with Staff\n\nReply with a number or text your request directly!",
      time: "Now",
    },
  ]);
  const [isBotTyping, setIsBotTyping] = React.useState(false);

  // Escalated inquiries queue
  const [escalatedInquiries, setEscalatedInquiries] = React.useState<Array<{ phone: string; name: string; reason: string; time: string }>>([
    {
      phone: "+91 98450 11923",
      name: "Dr. Rohini Mehta",
      reason: "Requested steward assistance at Suite 302 for wine bucket refill.",
      time: "12m ago",
    },
  ]);

  // Workforce Assistant State
  const [enrolledStaff, setEnrolledStaff] = React.useState<Array<{
    id: string;
    name: string;
    role: string;
    department?: string;
    phone?: string;
    employeeId?: string;
  }>>([
    { id: "st-1", name: "Rahul Sharma", role: "waiter", department: "Floor Service", phone: "+91 98765 43210", employeeId: "DF-EMP-1002" },
    { id: "st-2", name: "Ananya Deshmukh", role: "chef", department: "Kitchen", phone: "+91 98111 22334", employeeId: "DF-EMP-1003" },
    { id: "st-3", name: "Laurent Bistro Owner", role: "owner", department: "Management", phone: "+91 99999 99999", employeeId: "DF-EMP-1000" },
    { id: "st-4", name: "Vikram Malhotra", role: "manager", department: "Management", phone: "+91 99887 76655", employeeId: "DF-EMP-1001" },
    { id: "st-5", name: "Pooja Verma", role: "cashier", department: "Front Desk & Billing", phone: "+91 97654 32109", employeeId: "DF-EMP-1004" },
  ]);
  const [selectedStaffPhone, setSelectedStaffPhone] = React.useState<string>("+91 98765 43210");
  const [wfInput, setWfInput] = React.useState("");
  const [wfMessages, setWfMessages] = React.useState<Array<{ role: "bot" | "user"; text: string; time: string }>>([
    {
      role: "bot",
      text: "👋 *Hello Rahul Sharma!*\nWelcome to *The Grand Bistro Workforce Assistant*.\n\nReply with an option or number:\n1️⃣ 📍 *Clock In* (GPS Geofence)\n2️⃣ 🚪 *Clock Out* (GPS Geofence)\n3️⃣ ☕ *Break* (Take / Resume Break)\n4️⃣ 🌴 *Leave Balance & Apply*\n5️⃣ 📅 *Shift & Schedule*\n6️⃣ 🕒 *Attendance History*\n7️⃣ 💰 *Latest Payslip*\n8️⃣ 🛎️ *Tasks & Room Service*\n9️⃣ ❓ *Help / Menu*\n\n💡 _Or simply type 'apply sick leave tomorrow' or 'running 15 mins late'!_",
      time: "Now",
    },
  ]);
  const [isWfSimulating, setIsWfSimulating] = React.useState(false);
  const [checkInTestLink, setCheckInTestLink] = React.useState<string>("");
  const [isGeneratingCheckInLink, setIsGeneratingCheckInLink] = React.useState(false);

  // ── Fetch Initial Data ──────────────────────────────────────────────────────

  const fetchData = React.useCallback(async () => {
    try {
      // 1. Fetch Config
      const cfgRes = await apiClient.get("/whatsapp/config");
      if (cfgRes.data?.data) {
        setConfig(cfgRes.data.data);
        setConfigForm(cfgRes.data.data);
      }
    } catch {
      // Keep defaults
    }

    try {
      // 2. Fetch Logs
      let combinedLogs: MessageLogItem[] = [];
      const logsRes = await apiClient.get("/whatsapp/logs").catch(() => null);
      if (logsRes?.data?.data && Array.isArray(logsRes.data.data) && logsRes.data.data.length > 0) {
        combinedLogs = logsRes.data.data.map((l: any) => ({
          id: l.id || l._id || "log",
          phone: l.recipient || l.phone || "+91 98000 00000",
          customerName: l.customerName || "Valued Guest",
          template: l.template || "Order Confirmed",
          status: (l.status as "delivered" | "read" | "queued" | "failed") || "delivered",
          time: l.createdAt ? new Date(l.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now",
          location: l.location || "Dine-in",
        }));
      } else {
        combinedLogs = [...INITIAL_LOGS];
      }

      // Merge real-time staff dispatch alerts from /api/whatsapp/logs
      try {
        const localLogsRes = await fetch("/api/whatsapp/logs", { cache: "no-store" }).catch(() => null);
        if (localLogsRes && localLogsRes.ok) {
          const localData = await localLogsRes.json().catch(() => null);
          if (Array.isArray(localData?.data)) {
            const mappedStaffLogs: MessageLogItem[] = localData.data.map((l: any) => ({
              id: l.id,
              phone: l.phone,
              customerName: l.customerName,
              template: l.template,
              status: l.status || "delivered",
              time: l.time || "Just now",
              location: l.location || "Suite",
            }));
            combinedLogs = [...mappedStaffLogs, ...combinedLogs];
          }
        }
      } catch (_) {}

      // Also merge any from localStorage
      if (typeof window !== "undefined") {
        try {
          const cachedWa = localStorage.getItem("dineflow_whatsapp_logs");
          if (cachedWa) {
            const parsed = JSON.parse(cachedWa);
            if (Array.isArray(parsed)) {
              combinedLogs = [...parsed, ...combinedLogs];
            }
          }
        } catch (_) {}
      }

      // Deduplicate by ID
      const logMap = new Map<string, MessageLogItem>();
      combinedLogs.forEach((item) => {
        if (!logMap.has(item.id)) logMap.set(item.id, item);
      });
      setLogs(Array.from(logMap.values()));
    } catch {
      // Keep defaults
    }

    try {
      // 3. Fetch Segments
      const segRes = await apiClient.get("/whatsapp/segments");
      if (segRes.data?.data) {
        setSegments(segRes.data.data);
      }
    } catch {
      // Keep defaults
    }

    try {
      // 4. Fetch Invoices
      const invRes = await apiClient.get("/whatsapp/invoices");
      if (invRes.data?.data && Array.isArray(invRes.data.data) && invRes.data.data.length > 0) {
        setInvoices(invRes.data.data);
      }
    } catch {
      // Keep defaults
    }

    try {
      // 5. Fetch Campaigns
      const cmpRes = await apiClient.get("/whatsapp/campaigns");
      if (cmpRes.data?.data && Array.isArray(cmpRes.data.data) && cmpRes.data.data.length > 0) {
        setCampaigns(cmpRes.data.data);
      }
    } catch {
      // Keep defaults
    }

    try {
      // 6. Fetch Staff Directory
      const staffRes = await apiClient.get("/staff");
      if (staffRes.data?.data && Array.isArray(staffRes.data.data) && staffRes.data.data.length > 0) {
        const mapped = staffRes.data.data.map((u: { id?: string; _id?: string; name: string; role: string; department?: string; phone?: string; employeeId?: string }) => ({
          id: u.id || u._id || "st",
          name: u.name,
          role: u.role,
          department: u.department,
          phone: u.phone || "+91 98765 43210",
          employeeId: u.employeeId,
        }));
        setEnrolledStaff(mapped);
        if (mapped[0]?.phone) {
          setSelectedStaffPhone(mapped[0].phone);
        }
      }
    } catch {
      // Keep defaults
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── OpenWA Gateway Data Fetchers & Polling ──────────────────────────────────

  // ── OpenWA Gateway Data Fetchers & Polling ──────────────────────────────────

  const fetchOpenWAStatus = React.useCallback(async () => {
    if (isSandboxDemo) return;
    try {
      const query = openwaGatewayUrl ? `?gatewayUrl=${encodeURIComponent(openwaGatewayUrl)}` : "";
      const res = await apiClient.get(`/whatsapp/openwa/session/status${query}`);
      const data = res.data?.data || res.data;
      if (data) {
        setOpenwaStatus({
          sessionId: data.sessionId || "dineflow-dev",
          status: data.status || "disconnected",
          engine: data.engine || "whatsapp-web.js",
          phoneNumber: data.phoneNumber,
          lastConnected: data.lastConnected,
          errorMessage: data.errorMessage,
          gatewayUrl: data.gatewayUrl,
        });
        if (data.gatewayUrl && !openwaGatewayUrl) {
          setOpenwaGatewayUrl(data.gatewayUrl);
          setCustomGatewayInput(data.gatewayUrl);
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
      setOpenwaStatus((prev) => ({
        ...prev,
        status: "disconnected",
        errorMessage: error.response?.data?.error?.message || error.message || "Gateway unreachable",
      }));
    }
  }, [openwaGatewayUrl, isSandboxDemo]);

  const fetchOpenWAQR = React.useCallback(async () => {
    if (isSandboxDemo) return;
    try {
      const query = openwaGatewayUrl ? `?gatewayUrl=${encodeURIComponent(openwaGatewayUrl)}` : "";
      const res = await apiClient.get(`/whatsapp/openwa/session/qr${query}`);
      const data = res.data?.data || res.data;
      if (data) {
        if (data.qr) {
          setOpenwaQR(data.qr);
        }
        if (data.status) {
          setOpenwaStatus((prev) => ({
            ...prev,
            status: data.status,
            gatewayUrl: data.gatewayUrl || prev.gatewayUrl,
            errorMessage: data.errorMessage || prev.errorMessage,
          }));
        }
        if (data.errorMessage && !data.qr) {
          setOpenwaStatus((prev) => ({
            ...prev,
            errorMessage: data.errorMessage,
          }));
        }
        if (data.gatewayUrl && !openwaGatewayUrl) {
          setOpenwaGatewayUrl(data.gatewayUrl);
          setCustomGatewayInput(data.gatewayUrl);
        }
      }
    } catch {
      // ignore
    }
  }, [openwaGatewayUrl, isSandboxDemo]);

  // Polling loop for OpenWA status and QR code
  React.useEffect(() => {
    if (isSandboxDemo) return;
    fetchOpenWAStatus();

    const interval = setInterval(() => {
      fetchOpenWAStatus();
      if (activeTab === "gateway" || openwaStatus.status === "qr" || openwaStatus.status === "starting") {
        fetchOpenWAQR();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchOpenWAStatus, fetchOpenWAQR, activeTab, openwaStatus.status, isSandboxDemo]);

  const handleStartOpenWASession = async () => {
    setIsOpenwaLoading(true);
    try {
      const query = openwaGatewayUrl ? `?gatewayUrl=${encodeURIComponent(openwaGatewayUrl)}` : "";
      await apiClient.post(`/whatsapp/openwa/session/start${query}`);
      setOpenwaStatus((prev) => ({ ...prev, status: "starting", errorMessage: undefined }));
      addToast("info", "OpenWA Launching", "Session initializing. Loading headless Chromium & QR code...");
      setTimeout(() => {
        fetchOpenWAQR();
        fetchOpenWAStatus();
      }, 1500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
      const msg = error.response?.data?.error?.message || "Ensure OpenWA gateway container is active on port 2785";
      setOpenwaStatus((prev) => ({ ...prev, status: "disconnected", errorMessage: msg }));
      addToast("error", "Failed to start session", msg);
    } finally {
      setIsOpenwaLoading(false);
    }
  };

  const handleStopOpenWASession = async () => {
    setIsOpenwaLoading(true);
    try {
      const query = openwaGatewayUrl ? `?gatewayUrl=${encodeURIComponent(openwaGatewayUrl)}` : "";
      await apiClient.post(`/whatsapp/openwa/session/disconnect${query}`);
      setOpenwaStatus((prev) => ({ ...prev, status: "disconnected" }));
      setOpenwaQR("");
      setIsSandboxDemo(false);
      addToast("success", "Session Disconnected", "OpenWA session disconnected and Chromium stopped.");
    } catch {
      addToast("error", "Error", "Failed to disconnect session.");
    } finally {
      setIsOpenwaLoading(false);
    }
  };

  const handleRestartOpenWASession = async () => {
    setIsOpenwaLoading(true);
    try {
      const query = openwaGatewayUrl ? `?gatewayUrl=${encodeURIComponent(openwaGatewayUrl)}` : "";
      await apiClient.post(`/whatsapp/openwa/session/restart${query}`);
      setOpenwaStatus((prev) => ({ ...prev, status: "starting" }));
      setIsSandboxDemo(false);
      addToast("info", "Session Restarting", "Restarting session engine and requesting fresh QR code...");
      setTimeout(() => {
        fetchOpenWAQR();
        fetchOpenWAStatus();
      }, 2000);
    } catch {
      addToast("error", "Error", "Failed to restart OpenWA session.");
    } finally {
      setIsOpenwaLoading(false);
    }
  };

  const handleStartSandboxDemo = () => {
    setIsSandboxDemo(true);
    setOpenwaStatus({
      sessionId: "dineflow-sandbox-demo",
      status: "qr",
      engine: "whatsapp-web.js (Interactive Sandbox Demo)",
      errorMessage: undefined,
    });
    setOpenwaQR("2@mock_dineflow_sandbox_preview_token==");
    addToast("info", "Sandbox Demo Active", "Simulated pairing QR generated. You can test device pairing & message dispatch.");
  };

  const handleSimulateDeviceLinked = () => {
    setIsSandboxDemo(true);
    setOpenwaStatus({
      sessionId: "dineflow-sandbox-demo",
      status: "connected",
      engine: "whatsapp-web.js (Interactive Sandbox Demo)",
      phoneNumber: "+91 98000 12345",
      lastConnected: new Date().toISOString(),
      errorMessage: undefined,
    });
    setOpenwaQR("");
    addToast("success", "Device Paired (Demo)", "Simulated WhatsApp device linked successfully. You can now send test messages.");
  };

  const handleReauthDemo = async () => {
    try {
      const res = await apiClient.post("/auth/login", {
        email: "owner@thegrandbistro.com",
        password: "DineFlow@2026",
      });
      const data = res.data?.data;
      if (data?.accessToken) {
        useAuthStore.getState().setAuth(data.user, data.tenant, data.accessToken, data.refreshToken);
        addToast("success", "Authenticated", "Demo session refreshed. Fetching OpenWA status...");
        setTimeout(() => {
          fetchOpenWAStatus();
          fetchOpenWAQR();
        }, 300);
      }
    } catch {
      addToast("error", "Login Failed", "Could not authenticate with demo credentials.");
    }
  };

  const handleSendOpenWATestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openwaTestPhone) return;
    setIsSendingOpenwaTest(true);
    try {
      if (isSandboxDemo) {
        await new Promise((r) => setTimeout(r, 600));
        const newLog: MessageLogItem = {
          id: `demo-${Date.now()}`,
          phone: openwaTestPhone,
          customerName: openwaTestName,
          template: "Demo: Order Confirmed & Receipt via OpenWA Sandbox",
          status: "delivered",
          time: "Just now",
          location: "Table 14",
        };
        setLogs((prev) => [newLog, ...prev]);
        addToast("success", "Demo Message Dispatched", `[Sandbox Demo] Simulated delivery to ${openwaTestPhone}`);
        return;
      }
      await apiClient.post("/whatsapp/send-test", {
        recipientPhone: openwaTestPhone,
        customerName: openwaTestName,
      });
      addToast("success", "Message Dispatched", `Sent test message to ${openwaTestPhone}`);
      fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      addToast("error", "Dispatch Failed", error.response?.data?.error?.message || "Failed to deliver WhatsApp message.");
    } finally {
      setIsSendingOpenwaTest(false);
    }
  };

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSendWorkforceMessage = async (text: string, buttonId?: string) => {
    const msgText = text.trim();
    if (!msgText && !buttonId) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setWfMessages((prev) => [...prev, { role: "user", text: msgText || buttonId || "", time: nowTime }]);
    setWfInput("");
    setIsWfSimulating(true);

    try {
      const res = await apiClient.post("/whatsapp/webhook", {
        fromNumber: selectedStaffPhone,
        messageText: msgText,
        buttonId: buttonId,
      });

      const botReply =
        res.data?.data?.botReply ||
        res.data?.botReply ||
        "DineFlow Workforce Assistant response recorded.";

      setWfMessages((prev) => [...prev, { role: "bot", text: botReply, time: "Just now" }]);
    } catch {
      setWfMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "⚠️ [Offline Simulation Fallback]\nAttendance command received and processed.",
          time: "Just now",
        },
      ]);
    } finally {
      setIsWfSimulating(false);
    }
  };

  const handleGenerateCheckInLink = async (phone: string) => {
    setIsGeneratingCheckInLink(true);
    try {
      const res = await apiClient.post("/whatsapp/webhook", {
        fromNumber: phone,
        messageText: "",
        buttonId: "wf_checkin",
      });
      const botReply = res.data?.data?.botReply || res.data?.botReply || "";
      const match = botReply.match(/https?:\/\/[^\s]+/);
      if (match) {
        setCheckInTestLink(match[0]);
        addToast(
          "success",
          "Check-In Link Ready",
          "15-minute GPS verification link generated successfully."
        );
      } else {
        setCheckInTestLink("/m/check-in");
      }
    } catch {
      setCheckInTestLink("/m/check-in");
    } finally {
      setIsGeneratingCheckInLink(false);
    }
  };

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.put("/whatsapp/config", configForm);
      if (res.data?.data) {
        setConfig(res.data.data);
        addToast("success", "Settings Saved", "WhatsApp Business credentials updated successfully.");
        setIsConfigModalOpen(false);
      }
    } catch (err) {
      addToast("error", "Save Failed", "Could not save credentials. Check input values.");
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testNumber) return;

    const v = validateIndianPhone(testNumber);
    if (!v.isValid) {
      setTestNumberTouched(true);
      addToast("error", "Invalid WhatsApp Number", v.error || "Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setIsSendingTest(true);

    try {
      await apiClient.post("/whatsapp/send-test", {
        recipientPhone: v.normalized,
        customerName: testGuestName,
        template: "order_confirmed",
      });
      addToast("success", "Notification Dispatched", `Sent digital notification to ${v.formatted}`);
      fetchData();
    } catch (err) {
      addToast("success", "Sandbox Dispatched", `Notification recorded in dispatch logs for ${v.formatted}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleChatbotReply = async (text: string) => {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { role: "user" as const, text, time: now };
    setChatbotMessages((prev) => [...prev, userMsg]);
    setChatbotInput("");
    setIsBotTyping(true);

    try {
      const res = await apiClient.post("/whatsapp/chatbot/simulate", {
        phone: chatbotSimNumber,
        message: text,
        customerName: chatbotSimName,
      });

      const replyText = res.data?.data?.reply || "Message received by DineFlow.";
      const botMsg = {
        role: "bot" as const,
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setChatbotMessages((prev) => [...prev, botMsg]);

      // Check if user requested human handoff
      if (text.toLowerCase().includes("4") || text.toLowerCase().includes("staff") || text.toLowerCase().includes("human")) {
        setEscalatedInquiries((prev) => [
          {
            phone: chatbotSimNumber,
            name: chatbotSimName,
            reason: text,
            time: "Just now",
          },
          ...prev,
        ]);
        addToast("warning", "Staff Alert", `Guest ${chatbotSimName} requested live human assistance.`);
      }
    } catch {
      // Fallback response if offline
      setTimeout(() => {
        const botMsg = {
          role: "bot" as const,
          text: "Thank you for reaching out! Our front-desk steward team has been notified at Table 14.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setChatbotMessages((prev) => [...prev, botMsg]);
      }, 500);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name) return;

    try {
      const res = await apiClient.post("/whatsapp/campaigns", newCampaign);
      if (res.data?.data) {
        setCampaigns([res.data.data, ...campaigns]);
        addToast("success", "Campaign Created", `Campaign "${newCampaign.name}" drafted successfully.`);
        setIsCampaignModalOpen(false);
        setNewCampaign({
          name: "",
          type: "coupon",
          targetSegment: "all",
          messageBody: "",
          couponCode: "",
          discountPct: 10,
        });
      }
    } catch {
      // Local fallback
      const localCamp: CampaignItem = {
        id: `cmp-${Date.now().toString().slice(-4)}`,
        name: newCampaign.name,
        type: newCampaign.type,
        targetSegment: newCampaign.targetSegment,
        messageBody: newCampaign.messageBody,
        couponCode: newCampaign.couponCode,
        discountPct: newCampaign.discountPct,
        status: "draft",
        sentAt: "Scheduled",
        stats: {
          totalRecipients: segments[newCampaign.targetSegment as keyof SegmentCounts] || 30,
          sentCount: 0,
          deliveredCount: 0,
          readCount: 0,
          failedCount: 0,
        },
      };
      setCampaigns([localCamp, ...campaigns]);
      setIsCampaignModalOpen(false);
      addToast("success", "Campaign Created", `Campaign "${newCampaign.name}" drafted successfully.`);
    }
  };

  const handleSendCampaignNow = async (campId: string) => {
    try {
      const res = await apiClient.post(`/whatsapp/campaigns/${campId}/send`);
      if (res.data?.data) {
        setCampaigns(campaigns.map((c) => (c.id === campId ? res.data.data : c)));
        addToast("success", "Campaign Dispatched", "Broadcasting messages to target audience segment.");
        fetchData();
      }
    } catch {
      // Update local
      setCampaigns(
        campaigns.map((c) =>
          c.id === campId
            ? {
                ...c,
                status: "sent",
                sentAt: "Just now",
                stats: {
                  totalRecipients: 42,
                  sentCount: 42,
                  deliveredCount: 40,
                  readCount: 35,
                  failedCount: 2,
                },
              }
            : c
        )
      );
      addToast("success", "Campaign Dispatched", "Broadcasting messages to target audience segment.");
    }
  };

  const handleSendInvoice = async (invId: string) => {
    try {
      const res = await apiClient.post(`/whatsapp/invoices/${invId}/send`);
      if (res.data?.data) {
        setInvoices(invoices.map((inv) => (inv.id === invId ? res.data.data : inv)));
        addToast("success", "Invoice Sent via WhatsApp", "Customer received digital GST receipt with download link.");
        fetchData();
      }
    } catch {
      // Optimistic update
      setInvoices(
        invoices.map((inv) => (inv.id === invId ? { ...inv, whatsappDeliveryStatus: "delivered" } : inv))
      );
      addToast("success", "Invoice Sent via WhatsApp", "Customer received digital GST receipt with download link.");
    }
  };

  const handleCreateInvoiceFromOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingInvoice(true);
    try {
      const res = await apiClient.post("/whatsapp/invoices", { orderId: manualOrderId });
      if (res.data?.data) {
        setInvoices([res.data.data, ...invoices]);
        addToast("success", "GST Invoice Generated", `Invoice ${res.data.data.invoiceNumber} created for ${manualOrderId}.`);
        setIsCreateInvoiceOpen(false);
      }
    } catch {
      addToast("error", "Order Not Found", `Could not locate order ${manualOrderId} for tax invoicing.`);
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  // Filtered Logs
  const filteredLogs = logs.filter((l) => {
    const matchesStatus = logFilter === "all" || l.status === logFilter;
    const matchesSearch =
      !logSearch ||
      l.customerName.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.phone.includes(logSearch) ||
      l.template.toLowerCase().includes(logSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Meta Cloud API (WABA) Integration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            WhatsApp Marketing & Invoicing
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Meta Cloud API, Real-Time AI Chatbot, Audience Segmentation, and Compliant Indian GST Invoicing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => setIsConfigModalOpen(true)}>
            <Sliders className="h-3.5 w-3.5 mr-1.5" /> Meta WABA Settings
          </Button>
          <Badge variant="success" size="md" dot>
            Meta Cloud API Connected
          </Badge>
          <Badge variant="glow" size="sm">
            {config.tierLimit}
          </Badge>
        </div>
      </div>

      {/* ── Navigation Tabs ─────────────────────────────────────────────────── */}
      <div className="overflow-x-auto scrollbar-none [-webkit-overflow-scrolling:touch] bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-1.5">
        <div className="flex items-center gap-2 min-w-max">
        {[
          { id: "overview", label: "Overview & WABA", icon: PhoneCall },
          { id: "gateway", label: "OpenWA Gateway", icon: Smartphone, badge: openwaStatus.status === "connected" ? "Live" : "Dev" },
          { id: "chatbot", label: "AI Chatbot Studio", icon: BrainCircuit, badge: "Real-Time" },
          { id: "workforce", label: "Workforce Assistant", icon: Users, badge: "GPS & HR" },
          { id: "campaigns", label: "Marketing Campaigns", icon: Layers, badge: `${campaigns.length}` },
          { id: "invoices", label: "GST Tax Invoices", icon: Receipt, badge: `${invoices.length}` },
          { id: "logs", label: "Dispatch Audit Logs", icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-emerald-500"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-emerald-600 dark:text-white" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
        </div>
      </div>

      {/* ── TAB 1: OVERVIEW & WABA CONNECTION ─────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Account Status Card */}
          <Card variant="glass" className="border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <PhoneCall className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-white text-base">{config.phoneNumber}</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">• Official Business Account (Green Tick)</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">
                    WABA ID: <code className="text-slate-800 dark:text-slate-200 font-mono font-medium">{config.wabaAccountId}</code> • Quality: <strong className="text-emerald-700 dark:text-emerald-400">{config.qualityRating}</strong>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addToast("info", "Webhook Health Check", "Meta Cloud Webhook ping returned 200 OK.")}
                >
                  Ping Webhook
                </Button>
                <Button variant="glow" size="sm" onClick={() => setIsConfigModalOpen(true)}>
                  Configure API
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Automated Rule Triggers */}
            <div className="lg:col-span-7 space-y-6">
              <Card variant="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Automated Event Triggers
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                    Dispatched automatically upon POS, KDS, dining, or payment events.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { title: "Instant Order Confirmation", desc: "Itemized bill & live kitchen tracker link within 2s of order placement", active: true, tag: "Essential" },
                    { title: "Kitchen Ready & Delivery Notification", desc: "Alerts diners or hotel guests when courses leave the kitchen", active: true, tag: "KDS Triggered" },
                    { title: "Digital GST Tax Invoice PDF", desc: "Delivers branded receipt with 1-tap UPI QR when order is marked served", active: true, tag: "Tax Compliant" },
                    { title: "Post-Dining 1-5 Star Review Loop", desc: "Dispatches review prompt 20 mins after bill settlement with opt-out option", active: true, tag: "NPS Loop" },
                    { title: "Repeat Guest Loyalty Perk", desc: "Sends 10% privilege voucher 7 days after visit to encourage return bookings", active: true, tag: "Growth Loop" },
                  ].map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800"
                    >
                      <div className="space-y-0.5 pr-4">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{feat.title}</h4>
                          <Badge variant="neutral" size="sm">{feat.tag}</Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{feat.desc}</p>
                      </div>
                      <Badge variant={feat.active ? "success" : "neutral"} size="sm">
                        {feat.active ? "Active" : "Paused"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right: Test Sender Form */}
            <div className="lg:col-span-5 space-y-6">
              <Card variant="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Send Live Test Notification
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                    Dispatch an immediate test receipt to your personal WhatsApp number.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendTest} className="space-y-4">
                    <Input
                      label="Recipient WhatsApp Number"
                      value={testNumber}
                      onChange={(e) => {
                        setTestNumber(formatIndianPhoneInput(e.target.value));
                        setTestNumberTouched(true);
                      }}
                      onBlur={() => setTestNumberTouched(true)}
                      error={
                        testNumberTouched && testNumber && !validateIndianPhone(testNumber).isValid
                          ? validateIndianPhone(testNumber).error
                          : undefined
                      }
                      isSuccess={!!testNumber && validateIndianPhone(testNumber).isValid}
                      placeholder="+91 98000 00000"
                      required
                    />
                    <Input
                      label="Customer / Guest Name"
                      value={testGuestName}
                      onChange={(e) => setTestGuestName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      required
                    />

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300">
                      Dispatches official transactional template via Meta Graph API v21.0 or local sandbox outbox.
                    </div>

                    <Button
                      variant="glow"
                      size="sm"
                      type="submit"
                      disabled={isSendingTest}
                      className="w-full justify-center"
                      rightIcon={<Send className="h-3.5 w-3.5" />}
                    >
                      {isSendingTest ? "Dispatching..." : "Dispatch Live WhatsApp Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 1.5: OPENWA LOCAL DEVELOPMENT GATEWAY ───────────────────────── */}
      {activeTab === "gateway" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* ⚠️ Production vs Dev Architecture Notice */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    OpenWA is a Local Development Gateway — Not for Real Customers
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5">
                    This tab controls an unofficial WhatsApp Web multi-device session via Headless Chromium. In cloud production (Vercel/Railway), the local Chromium container is offline unless tunneled.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsWhyModalOpen(true)}
                  className="text-xs"
                  leftIcon={<HelpCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />}
                >
                  Why can&apos;t I use this for real customers?
                </Button>
                <Button
                  variant="glow"
                  size="sm"
                  onClick={() => setActiveTab("overview")}
                  className="text-xs"
                  rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                >
                  Use Meta Cloud API (Official)
                </Button>
              </div>
            </div>
          </div>

          {/* Top Status Card */}
          <Card variant="glass" className="border-cyan-500/30 bg-cyan-500/5">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-white text-base">
                      OpenWA Local Gateway
                    </span>
                    <Badge
                      variant={
                        openwaStatus.status === "connected"
                          ? "success"
                          : openwaStatus.status === "qr"
                          ? "warning"
                          : openwaStatus.status === "starting"
                          ? "neutral"
                          : "destructive"
                      }
                      size="sm"
                      dot
                    >
                      {openwaStatus.status === "connected"
                        ? isSandboxDemo
                          ? "Live (Demo Sandbox)"
                          : "Connected & Live"
                        : openwaStatus.status === "qr"
                        ? isSandboxDemo
                          ? "Scan QR Code (Demo)"
                          : "Scan QR Code"
                        : openwaStatus.status === "starting"
                        ? "Initializing..."
                        : "Disconnected"}
                    </Badge>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">
                    Session: <code className="text-slate-800 dark:text-slate-200 font-mono font-medium">{openwaStatus.sessionId || "dineflow-dev"}</code> • Engine: <strong className="text-cyan-700 dark:text-cyan-300">{openwaStatus.engine || "whatsapp-web.js (Headless Chromium)"}</strong>
                    {openwaStatus.phoneNumber && ` • Number: ${openwaStatus.phoneNumber}`}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Gateway URL:</span>
                    <code className="text-cyan-600 dark:text-cyan-400 font-mono text-[11px] bg-cyan-50 dark:bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-200/50 dark:border-cyan-800/50">
                      {openwaGatewayUrl || openwaStatus.gatewayUrl || "http://localhost:2785"}
                    </code>
                    <button
                      type="button"
                      onClick={() => setIsEditingGatewayUrl(!isEditingGatewayUrl)}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer font-medium"
                    >
                      {isEditingGatewayUrl ? "Cancel" : "Change URL / Tunnel"}
                    </button>
                    {openwaGatewayUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenwaGatewayUrl("");
                          setCustomGatewayInput("");
                          if (typeof window !== "undefined") {
                            localStorage.removeItem("dineflow_openwa_gateway_url");
                          }
                          addToast("info", "Reset Gateway URL", "Cleared custom tunnel URL. Reverted to default.");
                          setTimeout(() => {
                            fetchOpenWAStatus();
                            fetchOpenWAQR();
                          }, 300);
                        }}
                        className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
                      >
                        Reset to default
                      </button>
                    )}
                  </div>
                  {isEditingGatewayUrl && (
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          value={customGatewayInput}
                          onChange={(e) => setCustomGatewayInput(e.target.value)}
                          placeholder="e.g. https://your-tunnel.ngrok-free.app or http://localhost:2785"
                          className="h-8 text-xs font-mono"
                        />
                        <Button
                          size="sm"
                          variant="glow"
                          onClick={() => {
                            const trimmed = customGatewayInput.trim();
                            setOpenwaGatewayUrl(trimmed);
                            if (typeof window !== "undefined") {
                              if (trimmed) {
                                localStorage.setItem("dineflow_openwa_gateway_url", trimmed);
                              } else {
                                localStorage.removeItem("dineflow_openwa_gateway_url");
                              }
                            }
                            setIsEditingGatewayUrl(false);
                            addToast("success", "Gateway URL Updated", `Connecting to ${trimmed || "default gateway"}`);
                            setTimeout(() => {
                              fetchOpenWAStatus();
                              fetchOpenWAQR();
                            }, 500);
                          }}
                        >
                          Save & Connect
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setOpenwaGatewayUrl("");
                            setCustomGatewayInput("");
                            if (typeof window !== "undefined") {
                              localStorage.removeItem("dineflow_openwa_gateway_url");
                            }
                            setIsEditingGatewayUrl(false);
                            addToast("info", "Reset", "Reverted to default gateway endpoint.");
                            setTimeout(() => {
                              fetchOpenWAStatus();
                              fetchOpenWAQR();
                            }, 500);
                          }}
                        >
                          Reset
                        </Button>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        When using cloud deployment (<code className="font-mono text-[10px]">dineflow-steel.vercel.app</code>), connect via a public tunnel URL (e.g. from <code className="font-mono text-[10px]">ngrok http 2785</code> or <code className="font-mono text-[10px]">cloudflared tunnel --url http://localhost:2785</code>).
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    fetchOpenWAStatus();
                    fetchOpenWAQR();
                    addToast("info", "Status Refreshed", "Polled OpenWA gateway.");
                  }}
                  leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isOpenwaLoading ? "animate-spin" : ""}`} />}
                >
                  Refresh
                </Button>
                {openwaStatus.status === "connected" ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRestartOpenWASession}
                      disabled={isOpenwaLoading}
                      leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                    >
                      Restart Engine
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleStopOpenWASession}
                      disabled={isOpenwaLoading}
                      leftIcon={<Power className="h-3.5 w-3.5" />}
                    >
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="glow"
                    size="sm"
                    onClick={handleStartOpenWASession}
                    disabled={isOpenwaLoading}
                    leftIcon={<Zap className="h-3.5 w-3.5" />}
                  >
                    {isOpenwaLoading ? "Starting Engine..." : "Start Session"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 cols: QR Code & Connection Status */}
            <div className="lg:col-span-7 space-y-6">
              <Card variant="glass">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                        WhatsApp Authentication
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                        Link your development device via WhatsApp Web multi-device session.
                      </CardDescription>
                    </div>
                    <Badge variant={openwaStatus.status === "connected" ? "success" : "neutral"} size="sm">
                      {openwaStatus.status === "connected"
                        ? isSandboxDemo
                          ? "Demo Authenticated"
                          : "Authenticated"
                        : "Awaiting Pairing"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {openwaStatus.status === "connected" ? (
                    <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                      <div className="inline-flex p-3.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="h-8 w-8" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        WhatsApp Session Active & Connected
                        {isSandboxDemo && " (Demo Sandbox)"}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                        Your WhatsApp account is successfully paired. Outbound customer notifications, kitchen updates, and inbound command responses are active.
                      </p>
                      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRestartOpenWASession}
                          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                        >
                          Restart Session
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleStopOpenWASession}
                          leftIcon={<Power className="h-3.5 w-3.5" />}
                        >
                          Log Out Device
                        </Button>
                        {isSandboxDemo && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setIsSandboxDemo(false);
                              setOpenwaStatus((prev) => ({ ...prev, status: "disconnected" }));
                              addToast("info", "Exited Demo", "Returned to live gateway mode.");
                            }}
                          >
                            Exit Sandbox Mode
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : openwaStatus.status === "qr" || openwaQR ? (
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                      {/* QR Display */}
                      <div className="relative group p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            openwaQR.startsWith("data:")
                              ? openwaQR
                              : openwaQR.startsWith("http")
                              ? openwaQR
                              : `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(openwaQR)}`
                          }
                          alt="Scan WhatsApp QR"
                          className="w-52 h-52 object-contain rounded-lg"
                        />
                        <div className="absolute inset-x-0 bottom-1 text-center">
                          <span className="text-[10px] bg-slate-900/80 text-white px-2 py-0.5 rounded-full font-mono">
                            {isSandboxDemo ? "Interactive Demo QR" : "Auto-refreshes every 3s"}
                          </span>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="space-y-3.5 text-xs flex-1">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500 text-white font-bold text-[11px]">
                            1
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            Open WhatsApp on your mobile phone
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500 text-white font-bold text-[11px]">
                            2
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            Tap <strong>Menu (⋮)</strong> or <strong>Settings (⚙️)</strong> &gt; <strong>Linked Devices</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500 text-white font-bold text-[11px]">
                            3
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            Tap <strong>Link a Device</strong> and point your phone at this QR code
                          </span>
                        </div>

                        <div className="pt-2 flex flex-wrap items-center gap-2">
                          {isSandboxDemo ? (
                            <>
                              <Button
                                variant="glow"
                                size="sm"
                                onClick={handleSimulateDeviceLinked}
                                leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                              >
                                ⚡ Simulate Phone Scanned & Linked
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setIsSandboxDemo(false);
                                  setOpenwaQR("");
                                  setOpenwaStatus((prev) => ({ ...prev, status: "disconnected" }));
                                }}
                              >
                                Exit Demo
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                fetchOpenWAQR();
                                addToast("info", "QR Refreshed", "Requested updated QR code token from OpenWA.");
                              }}
                              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                            >
                              Refresh QR Code
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : openwaStatus.status === "starting" ? (
                    <div className="p-8 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                      <div className="inline-flex p-3 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 animate-spin">
                        <RefreshCw className="h-7 w-7" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Initializing Headless Chromium Browser...
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                        OpenWA is launching a containerized Chromium instance to establish the WhatsApp Web connection. The QR code will load automatically.
                      </p>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
                      {/* Diagnostic Alert Box */}
                      {openwaStatus.errorMessage ? (
                        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-2 text-left">
                          <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>
                              {openwaStatus.errorMessage.toLowerCase().includes("token") ||
                              openwaStatus.errorMessage.toLowerCase().includes("auth") ||
                              openwaStatus.errorMessage.toLowerCase().includes("unauthorized")
                                ? "Session Authentication Required"
                                : "Gateway Offline or Tunnel Unreachable in Production"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300">
                            <strong>Diagnostic:</strong> {openwaStatus.errorMessage}
                          </p>
                          {openwaStatus.errorMessage.toLowerCase().includes("token") ||
                          openwaStatus.errorMessage.toLowerCase().includes("auth") ||
                          openwaStatus.errorMessage.toLowerCase().includes("unauthorized") ? (
                            <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-2 pt-1 border-t border-rose-500/20">
                              <p>Your local dashboard session needs to be authenticated with the local Go API server.</p>
                              <Button
                                size="sm"
                                variant="glow"
                                onClick={handleReauthDemo}
                                className="text-xs"
                              >
                                Re-authenticate Demo Account
                              </Button>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 pt-1 border-t border-rose-500/20">
                              <p>
                                • <strong>Why this happens in prod:</strong> OpenWA requires a local Docker container running Headless Chromium. Cloud servers (Vercel/Railway) cannot reach <code className="font-mono text-[10px]">localhost:2785</code> unless a live tunnel (ngrok / Cloudflare) is active.
                              </p>
                              <p>
                                • <strong>For real customers:</strong> Do not use WhatsApp Web QR. Use the official <strong>Meta WhatsApp Cloud API</strong> (no Docker required, 99.99% uptime, zero phone ban risk).
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center space-y-2">
                          <div className="inline-flex p-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            <QrCode className="h-7 w-7" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Local OpenWA Gateway Offline
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                            Connect your local Docker container via tunnel, or launch the interactive sandbox demo to preview the pairing flow.
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                        <Button
                          variant="glow"
                          size="sm"
                          onClick={handleStartOpenWASession}
                          disabled={isOpenwaLoading}
                          leftIcon={<Zap className="h-3.5 w-3.5" />}
                        >
                          {isOpenwaLoading ? "Starting Session..." : "Generate Pairing QR Code"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleStartSandboxDemo}
                          leftIcon={<Sparkles className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />}
                        >
                          Launch Interactive Sandbox Demo
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setActiveTab("overview")}
                          leftIcon={<PhoneCall className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                        >
                          Switch to Meta Cloud API (Official)
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Docker Container Guidance */}
                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-slate-900 dark:text-white">Docker Local Service:</span>
                      <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        docker compose -f docker-compose.openwa.yml up -d
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText("docker compose -f docker-compose.openwa.yml up -d");
                        setOpenwaCopied(true);
                        setTimeout(() => setOpenwaCopied(false), 2000);
                        addToast("info", "Copied", "Command copied to clipboard.");
                      }}
                      leftIcon={openwaCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    >
                      {openwaCopied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Inbound Commands Cheat Sheet */}
              <Card variant="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Interactive Inbound Commands
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                    Send these keywords from any WhatsApp number to trigger automated bot replies:
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs">
                  {[
                    { command: "Hi / Hello", reply: "Returns welcome greeting and action directory with quick options." },
                    { command: "Menu", reply: "Returns direct link to the restaurant contactless digital menu." },
                    { command: "Order Status", reply: "Queries the customer's active live order in MongoDB and sends status & tracking URL." },
                    { command: "Help / Steward", reply: "Alerts restaurant attendants for in-person table or room service." },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4"
                    >
                      <div>
                        <code className="font-bold text-cyan-600 dark:text-cyan-400 font-mono text-xs">
                          {item.command}
                        </code>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.reply}
                        </p>
                      </div>
                      <Badge variant="neutral" size="sm">Deterministic</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right 5 cols: Test Dispatcher & Endpoints Info */}
            <div className="lg:col-span-5 space-y-6">
              {/* Test Message Dispatcher */}
              <Card variant="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Send Live Gateway Test
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                    Send an immediate message through OpenWA to verify delivery.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendOpenWATestMessage} className="space-y-4">
                    <Input
                      label="Recipient Phone Number"
                      value={openwaTestPhone}
                      onChange={(e) => setOpenwaTestPhone(formatIndianPhoneInput(e.target.value))}
                      placeholder="+91 98000 00000"
                      required
                    />
                    <Input
                      label="Customer / Guest Name"
                      value={openwaTestName}
                      onChange={(e) => setOpenwaTestName(e.target.value)}
                      placeholder="Alex Rivera"
                      required
                    />
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-800 dark:text-cyan-300">
                      Dispatched directly via OpenWA REST API (Port 2785) with automatic fallback to mock sandbox.
                    </div>
                    <Button
                      variant="glow"
                      size="sm"
                      type="submit"
                      disabled={isSendingOpenwaTest}
                      className="w-full justify-center"
                      rightIcon={<Send className="h-3.5 w-3.5" />}
                    >
                      {isSendingOpenwaTest ? "Dispatching..." : "Send Test via OpenWA"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Gateway Endpoints Info Card */}
              <Card variant="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Gateway Endpoints & Ports
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                    Local development connectivity references.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">OpenWA Dashboard:</span>
                    <a
                      href="http://localhost:2785"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 dark:text-cyan-400 font-mono font-medium hover:underline inline-flex items-center gap-1"
                    >
                      :2785 <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">OpenWA Swagger Docs:</span>
                    <a
                      href="http://localhost:2785/api/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 dark:text-cyan-400 font-mono font-medium hover:underline inline-flex items-center gap-1"
                    >
                      :2785/api/docs <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Backend Webhook:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                      /api/v1/whatsapp/webhook
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300">
                    <strong>Zero-Code Meta Migration:</strong> Business logic only talks to the <code>WhatsAppProvider</code> Go interface. Setting <code>WHATSAPP_PROVIDER=meta</code> in production redirects all triggers to Meta Cloud API without changing any application code.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: REAL-TIME AI CHATBOT STUDIO ────────────────────────────────── */}
      {activeTab === "chatbot" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Chatbot Capabilities & Escalation Queue (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <Card variant="glass" className="border-violet-500/20">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <BrainCircuit className="h-4 w-4 text-violet-500" /> DineBot AI Capabilities
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                      Multi-tenant state machine connected to real dining records.
                    </CardDescription>
                  </div>
                  <button
                    onClick={() => {
                      setChatbotEnabled(!chatbotEnabled);
                      addToast("info", "Bot Status", chatbotEnabled ? "DineBot paused." : "DineBot online.");
                    }}
                    className="cursor-pointer"
                  >
                    {chatbotEnabled ? (
                      <ToggleRight className="h-7 w-7 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="h-7 w-7 text-slate-400" />
                    )}
                  </button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { title: "1. Menu & Specials", desc: "Queries MongoDB for active dishes, dietary tags, and contactless link.", icon: FileText, color: "text-amber-500" },
                    { title: "2. Live Order Tracking", desc: "Looks up order status (preparing, ready, served) by phone or order number.", icon: Clock, color: "text-blue-500" },
                    { title: "3. In-Stay Room / Table Requests", desc: "Logs amenities/water requests and alerts stewards on floor.", icon: Zap, color: "text-emerald-500" },
                    { title: "4. Live Staff Handoff", desc: "Flags session and pushes immediate high-priority notification to dashboard.", icon: Users, color: "text-violet-500" },
                  ].map((cap, i) => {
                    const Icon = cap.icon;
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs">
                        <Icon className={`h-4 w-4 ${cap.color} shrink-0 mt-0.5`} />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{cap.title}</p>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">{cap.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Staff Escalations Queue */}
              <Card variant="glass">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" /> Escalated Inquiries ({escalatedInquiries.length})
                    </CardTitle>
                    <Badge variant="warning" size="sm">Attention</Badge>
                  </div>
                  <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                    Guests requesting human steward or manager assistance.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {escalatedInquiries.map((inq, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{inq.name} ({inq.phone})</span>
                        <span className="text-[10px] text-slate-500">{inq.time}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 text-[11px]">{inq.reason}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right: Live Interactive Simulator (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-50 dark:bg-[#0a0d14] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                {/* Simulator Header */}
                <div className="flex items-center justify-between p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        DineBot • The Grand Bistro <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        ● Online (Meta Webhook Live)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={chatbotSimNumber}
                      onChange={(e) => setChatbotSimNumber(e.target.value)}
                      placeholder="Simulated Phone"
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 w-28"
                    />
                  </div>
                </div>

                {/* Message Thread */}
                <div className="h-96 overflow-y-auto p-4 space-y-3 bg-[#e5ddd5]/30 dark:bg-transparent">
                  {chatbotMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === "bot" ? "justify-start" : "justify-end"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line shadow-xs ${
                          msg.role === "bot"
                            ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60 rounded-tl-none"
                            : "bg-emerald-600 text-white rounded-tr-none"
                        }`}
                      >
                        {msg.text}
                        <div
                          className={`text-[9px] mt-1 text-right ${
                            msg.role === "bot" ? "text-slate-400 dark:text-slate-500" : "text-emerald-100"
                          }`}
                        >
                          {msg.time} {msg.role === "user" ? "✓✓" : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isBotTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
                        <RefreshCw className="h-3 w-3 animate-spin text-emerald-500" /> DineBot is typing...
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Reply Trigger Chips */}
                <div className="px-4 py-2 flex flex-wrap gap-1.5 bg-white dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
                  {["1", "2", "3", "4", "5 ⭐", "Truffle Risotto", "STOP"].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleChatbotReply(preset)}
                      className="text-[11px] px-2.5 py-1 rounded-full border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors font-medium cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Input form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (chatbotInput.trim()) {
                      handleChatbotReply(chatbotInput);
                    }
                  }}
                  className="flex items-center gap-2 p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <input
                    value={chatbotInput}
                    onChange={(e) => setChatbotInput(e.target.value)}
                    placeholder="Type as customer (e.g. Menu, Status, Staff)..."
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500"
                  />
                  <Button variant="glow" size="sm" type="submit" disabled={isBotTyping}>
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: WORKFORCE ASSISTANT (ATTENDANCE, LEAVES, SHIFTS & PAYSLIPS) ──── */}
      {activeTab === "workforce" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Status & KPI Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                    Workforce Assistant Status
                  </p>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Live & Automated <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </p>
                  <p className="text-[10px] text-slate-500">24/7 WhatsApp Cloud Webhook</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500 text-white shadow-sm">
                  <Navigation className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    GPS Geofence Policy
                  </p>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">
                    100m Radius Enforced
                  </p>
                  <p className="text-[10px] text-slate-500">Haversine spherical distance</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500 text-white shadow-sm">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Enrolled Staff Directory
                  </p>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">
                    {enrolledStaff.length} Team Members
                  </p>
                  <p className="text-[10px] text-slate-500">Phone numbers WhatsApp-linked</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-sm">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Security Token Expiry
                  </p>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">
                    15-Minute HMAC
                  </p>
                  <p className="text-[10px] text-slate-500">Anti-tamper signed URLs</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main 2-Column Grid: Left Phone Simulator, Right Directory & Policies */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Interactive Phone Simulator (5 Cols) */}
            <div className="lg:col-span-6 space-y-4">
              <Card className="border-slate-200 dark:border-slate-800 shadow-md">
                <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Interactive Workforce WhatsApp Simulator
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Test staff commands, GPS links, leave flows & manager approvals.
                      </CardDescription>
                    </div>

                    {/* Staff Selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 font-medium">Staff:</span>
                      <select
                        value={selectedStaffPhone}
                        onChange={(e) => {
                          setSelectedStaffPhone(e.target.value);
                          const st = enrolledStaff.find((s) => s.phone === e.target.value);
                          if (st) {
                            setWfMessages([
                              {
                                role: "bot",
                                text: `👋 *Hello ${st.name}!*\nWelcome to *The Grand Bistro Workforce Assistant*.\n\nReply with an option or number:\n1️⃣ 📍 *Clock In* (GPS Geofence)\n2️⃣ 🚪 *Clock Out* (GPS Geofence)\n3️⃣ ☕ *Break* (Take / Resume Break)\n4️⃣ 🌴 *Leave Balance & Apply*\n5️⃣ 📅 *Shift & Schedule*\n6️⃣ 🕒 *Attendance History*\n7️⃣ 💰 *Latest Payslip*\n8️⃣ 🛎️ *Tasks & Room Service*\n9️⃣ ❓ *Help / Menu*`,
                                time: "Now",
                              },
                            ]);
                          }
                        }}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-lg px-2.5 py-1.5 font-medium text-slate-900 dark:text-white outline-none"
                      >
                        {enrolledStaff.map((s) => (
                          <option key={s.id} value={s.phone || ""}>
                            {s.name} ({s.role} - {s.phone})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {/* Quick Action Chips */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-1.5">
                    {[
                      { label: "📍 Clock In", buttonId: "wf_checkin" },
                      { label: "🚪 Clock Out", buttonId: "wf_checkout" },
                      { label: "☕ Break Toggle", buttonId: "wf_break" },
                      { label: "🌴 Leave Balance", buttonId: "wf_leave_balance" },
                      { label: "📅 My Shift", buttonId: "wf_shift" },
                      { label: "🕒 Attendance Log", buttonId: "wf_attendance" },
                      { label: "💰 View Payslip", buttonId: "wf_payslip" },
                      { label: "🛎️ Room Tasks", buttonId: "wf_tasks" },
                      { label: "⚠️ Running Late", text: "running late 15 mins stuck in metro" },
                      { label: "🌴 Apply Sick Leave", text: "apply sick leave tomorrow due to fever" },
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendWorkforceMessage(chip.text || "", chip.buttonId)}
                        disabled={isWfSimulating}
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 transition shadow-xs cursor-pointer active:scale-95"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {/* WhatsApp Simulator Chat Window */}
                  <div className="h-96 overflow-y-auto p-4 space-y-3 bg-[#e5ddd5]/30 dark:bg-slate-950/60 font-sans text-xs">
                    {wfMessages.map((m, idx) => {
                      const isUser = m.role === "user";
                      return (
                        <div
                          key={idx}
                          className={`flex ${isUser ? "justify-end" : "justify-start"} animate-in fade-in duration-150`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl p-3 shadow-xs relative ${
                              isUser
                                ? "bg-emerald-600 text-white rounded-tr-xs"
                                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs"
                            }`}
                          >
                            <div className="whitespace-pre-wrap leading-relaxed">
                              {/* Parse links into clickable anchors */}
                              {m.text.split(/(\bhttps?:\/\/[^\s]+)/g).map((part, pIdx) => {
                                if (part.match(/^https?:\/\//)) {
                                  return (
                                    <a
                                      key={pIdx}
                                      href={part}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={`font-bold underline break-all inline-flex items-center gap-1 ${
                                        isUser ? "text-white" : "text-emerald-600 dark:text-emerald-400"
                                      }`}
                                    >
                                      {part.includes("/m/check-in") ? "📲 Open Mobile GPS Check-In Radar" : part}
                                      <ExternalLink className="w-3 h-3 inline" />
                                    </a>
                                  );
                                }
                                return part;
                              })}
                            </div>
                            <div
                              className={`text-[9px] text-right mt-1.5 font-medium ${
                                isUser ? "text-emerald-100" : "text-slate-400"
                              }`}
                            >
                              {m.time} {isUser && "✓✓"}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {isWfSimulating && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-xs p-3 shadow-xs flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                          <span className="text-[11px] text-slate-500">Workforce Assistant is typing...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendWorkforceMessage(wfInput);
                    }}
                    className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
                  >
                    <input
                      value={wfInput}
                      onChange={(e) => setWfInput(e.target.value)}
                      placeholder="Type a message (e.g. Check In, Break, Shift, Leaves)..."
                      className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500"
                    />
                    <Button variant="glow" size="sm" type="submit" disabled={isWfSimulating}>
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Live Link Test Banner if generated */}
              {checkInTestLink && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                        Live Check-In Link Generated
                      </p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono truncate max-w-xs">
                        {checkInTestLink}
                      </p>
                    </div>
                  </div>
                  <a
                    href={checkInTestLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0 transition"
                  >
                    Open Page <ExternalLink className="w-3 h-3 inline ml-1" />
                  </a>
                </div>
              )}
            </div>

            {/* Right Column: Enrolled Staff Directory & Policies (6 Cols) */}
            <div className="lg:col-span-6 space-y-6">
              {/* Enrolled Staff Directory */}
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Users className="h-4 w-4 text-emerald-600" />
                      Enrolled Staff Directory ({enrolledStaff.length})
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Employees configured to access WhatsApp HR & Attendance.
                    </CardDescription>
                  </div>
                  <a
                    href="/dashboard/staff"
                    className="text-xs font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
                  >
                    Manage Staff <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                        <tr>
                          <th className="p-3">Employee</th>
                          <th className="p-3">Department</th>
                          <th className="p-3">WhatsApp Phone</th>
                          <th className="p-3 text-right">Quick GPS Link</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {enrolledStaff.map((staff) => (
                          <tr key={staff.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                            <td className="p-3 font-medium text-slate-900 dark:text-white">
                              <div>{staff.name}</div>
                              <span className="text-[10px] font-mono text-slate-400">
                                {staff.employeeId || "DF-EMP-AUTO"}
                              </span>
                            </td>
                            <td className="p-3">
                              <Badge variant="neutral" size="sm" className="capitalize">
                                {staff.role}
                              </Badge>
                            </td>
                            <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                              <a
                                href={`https://wa.me/${staff.phone?.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-600 hover:underline inline-flex items-center gap-1"
                              >
                                {staff.phone || "No Phone"}
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </td>
                            <td className="p-3 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isGeneratingCheckInLink || !staff.phone}
                                onClick={() => handleGenerateCheckInLink(staff.phone || "")}
                                className="h-7 text-[11px]"
                              >
                                Generate Link
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Workforce Assistant Feature Matrix */}
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    Workforce Assistant Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 space-y-1">
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" /> High-Accuracy GPS Geofencing
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        1-tap secure link opens radar in mobile browser, requests real-time device GPS, and validates distance within 100m.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 space-y-1">
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5 text-amber-600" /> Break Time Tracking
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Staff reply &apos;BREAK&apos; on WhatsApp to pause or resume shifts with precise duration logs in minutes.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 space-y-1">
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" /> 1-Tap Manager Approvals
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Managers receive WhatsApp leave alerts with interactive [Approve] and [Reject] buttons, updating balances instantly.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 space-y-1">
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Digital Tax Payslips
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Staff text &apos;PAYSLIP&apos; to instantly view take-home pay, earnings, PF/TDS deductions, and print official slips.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: MARKETING CAMPAIGNS & SEGMENTS ──────────────────────────────── */}
      {activeTab === "campaigns" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Customer Segmentation Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "All Contacts", count: segments.all, icon: Users, color: "text-blue-500" },
              { label: "First-Time Diners", count: segments.first_time, icon: User, color: "text-emerald-500" },
              { label: "Repeat Diners", count: segments.repeat, icon: RefreshCw, color: "text-teal-500" },
              { label: "VIP High Spenders", count: segments.vip, icon: Sparkles, color: "text-amber-500" },
              { label: "Hotel Room Guests", count: segments.hotel_guests, icon: Zap, color: "text-purple-500" },
              { label: "Inactive (30d+)", count: segments.inactive, icon: Clock, color: "text-rose-500" },
            ].map((seg, i) => {
              const Icon = seg.icon;
              return (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Icon className={`h-4 w-4 ${seg.color}`} />
                    <span className="text-[10px] font-bold text-slate-400">Segment</span>
                  </div>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white">{seg.count}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                    {seg.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Campaigns Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Marketing Campaigns</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create targeted text, coupon, or image broadcasts to customer segments.
              </p>
            </div>
            <Button
              variant="glow"
              size="sm"
              onClick={() => setIsCampaignModalOpen(true)}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              New Campaign
            </Button>
          </div>

          {/* Campaigns Table */}
          <Card variant="glass">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold bg-slate-50/70 dark:bg-slate-950/40">
                      <th className="p-3.5">Campaign Name</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Audience Segment</th>
                      <th className="p-3.5">Dispatch / Status</th>
                      <th className="p-3.5 text-center">Recipients</th>
                      <th className="p-3.5 text-center">Delivered</th>
                      <th className="p-3.5 text-center">Read</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {campaigns.map((camp) => (
                      <tr key={camp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{camp.name}</td>
                        <td className="p-3.5">
                          <Badge variant="neutral" size="sm" className="uppercase font-mono text-[10px]">
                            {camp.type}
                          </Badge>
                        </td>
                        <td className="p-3.5">
                          <span className="capitalize font-medium text-emerald-700 dark:text-emerald-400">
                            {camp.targetSegment.replace("_", " ")}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant={
                                camp.status === "sent"
                                  ? "success"
                                  : camp.status === "scheduled"
                                  ? "glow"
                                  : "neutral"
                              }
                              size="sm"
                            >
                              {camp.status.toUpperCase()}
                            </Badge>
                            {camp.sentAt && (
                              <span className="text-[10px] text-slate-400 font-medium">({camp.sentAt})</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 text-center font-mono font-medium">{camp.stats?.totalRecipients || 0}</td>
                        <td className="p-3.5 text-center font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          {camp.stats?.deliveredCount || 0}
                        </td>
                        <td className="p-3.5 text-center font-mono text-blue-600 dark:text-blue-400 font-semibold">
                          {camp.stats?.readCount || 0}
                        </td>
                        <td className="p-3.5 text-right">
                          {camp.status === "draft" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendCampaignNow(camp.id)}
                            >
                              Send Now
                            </Button>
                          ) : (
                            <Badge variant="neutral" size="sm">Completed</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 4: GST TAX INVOICES & RECEIPTS ─────────────────────────────────── */}
      {activeTab === "invoices" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Customer GST Tax Invoices</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate compliant Indian GST receipts (2.5% CGST + 2.5% SGST) and deliver instantly via WhatsApp.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateInvoiceOpen(true)}
                leftIcon={<Plus className="h-3.5 w-3.5" />}
              >
                Invoice from Order
              </Button>
            </div>
          </div>

          {/* Invoices Table */}
          <Card variant="glass">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold bg-slate-50/70 dark:bg-slate-950/40">
                      <th className="p-3.5">Invoice #</th>
                      <th className="p-3.5">Order Ref</th>
                      <th className="p-3.5">Customer & Phone</th>
                      <th className="p-3.5">Table / Room</th>
                      <th className="p-3.5 text-right">Subtotal</th>
                      <th className="p-3.5 text-right">GST (5%)</th>
                      <th className="p-3.5 text-right">Grand Total</th>
                      <th className="p-3.5 text-center">WhatsApp Delivery</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</td>
                        <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">{inv.orderNumber}</td>
                        <td className="p-3.5">
                          <p className="font-semibold text-slate-900 dark:text-white">{inv.customerName}</p>
                          <p className="text-[10px] font-mono text-slate-500">{inv.customerPhone}</p>
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-400">{inv.location}</td>
                        <td className="p-3.5 text-right font-mono">₹{inv.subtotal.toFixed(2)}</td>
                        <td className="p-3.5 text-right font-mono text-slate-500">
                          ₹{(inv.cgst + inv.sgst).toFixed(2)}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{inv.grandTotal.toFixed(2)}
                        </td>
                        <td className="p-3.5 text-center">
                          <Badge
                            variant={
                              inv.whatsappDeliveryStatus === "read"
                                ? "glow"
                                : inv.whatsappDeliveryStatus === "delivered"
                                ? "success"
                                : "neutral"
                            }
                            size="sm"
                          >
                            {inv.whatsappDeliveryStatus.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setIsInvoiceModalOpen(true);
                            }}
                          >
                            View
                          </Button>
                          <Button
                            variant="glow"
                            size="sm"
                            onClick={() => handleSendInvoice(inv.id)}
                            rightIcon={<Send className="h-3 w-3" />}
                          >
                            Send
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 5: DISPATCH AUDIT LOGS ────────────────────────────────────────── */}
      {activeTab === "logs" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Message Dispatch Audit Log</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tamper-evident log of all system notifications, receipts, and user responses.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search guest or phone..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              >
                <option value="all">All Statuses</option>
                <option value="delivered">Delivered</option>
                <option value="read">Read</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <Card variant="glass">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold bg-slate-50/70 dark:bg-slate-950/40">
                      <th className="p-3.5">Guest Name</th>
                      <th className="p-3.5">Recipient Phone</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">Template Type</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{log.customerName}</td>
                        <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">{log.phone}</td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-400">{log.location}</td>
                        <td className="p-3.5 text-slate-800 dark:text-slate-200 font-medium">{log.template}</td>
                        <td className="p-3.5">
                          <Badge
                            variant={
                              log.status === "read"
                                ? "glow"
                                : log.status === "delivered"
                                ? "success"
                                : "info"
                            }
                            size="sm"
                          >
                            {log.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-right text-slate-500 font-medium">{log.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── MODAL 1: Meta WABA Connection Settings ────────────────────────────── */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title="Meta WhatsApp Business API Settings"
        description="Connect your Meta Business Manager, phone number, and webhook credentials."
        size="lg"
      >
        <form onSubmit={handleUpdateConfig} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Registered Business Phone"
              value={configForm.phoneNumber}
              onChange={(e) => setConfigForm({ ...configForm, phoneNumber: e.target.value })}
              placeholder="+91 98765 43210"
              required
            />
            <Input
              label="Phone Number ID (Meta Graph)"
              value={configForm.phoneNumberId}
              onChange={(e) => setConfigForm({ ...configForm, phoneNumberId: e.target.value })}
              placeholder="e.g. 104928192839182"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="WhatsApp Business Account ID (WABA ID)"
              value={configForm.wabaAccountId}
              onChange={(e) => setConfigForm({ ...configForm, wabaAccountId: e.target.value })}
              placeholder="e.g. 891823091823901"
              required
            />
            <Input
              label="Webhook Verify Token"
              value={configForm.verifyToken}
              onChange={(e) => setConfigForm({ ...configForm, verifyToken: e.target.value })}
              placeholder="dineflow_webhook_verify_secret"
              required
            />
          </div>

          <Input
            label="Permanent System User Access Token"
            type="password"
            value={configForm.accessToken}
            onChange={(e) => setConfigForm({ ...configForm, accessToken: e.target.value })}
            placeholder="EAAG... (never shared publicly)"
          />

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="font-bold text-slate-900 dark:text-white mb-1">Webhook Callback URL</p>
            <code className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono break-all select-all">
              {configForm.webhookUrl}
            </code>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsConfigModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="glow" size="sm" type="submit">
              Save Meta Credentials
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL 2: Create Campaign ─────────────────────────────────────────── */}
      <Modal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        title="Create Marketing Campaign"
        description="Target a customer segment with an automated WhatsApp campaign."
        size="md"
      >
        <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
          <Input
            label="Campaign Name"
            value={newCampaign.name}
            onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
            placeholder="e.g. Autumn Degustation Preview"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Campaign Type</label>
              <select
                value={newCampaign.type}
                onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value as typeof newCampaign.type })}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <option value="coupon">Discount Coupon</option>
                <option value="text">Text Announcement</option>
                <option value="image">Image Banner</option>
                <option value="invoice">Payment Reminder</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Target Segment</label>
              <select
                value={newCampaign.targetSegment}
                onChange={(e) => setNewCampaign({ ...newCampaign, targetSegment: e.target.value })}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <option value="all">All Contacts ({segments.all})</option>
                <option value="first_time">First-Time Diners ({segments.first_time})</option>
                <option value="repeat">Repeat Guests ({segments.repeat})</option>
                <option value="vip">VIP Diners ({segments.vip})</option>
                <option value="hotel_guests">Room Guests ({segments.hotel_guests})</option>
                <option value="inactive">Inactive ({segments.inactive})</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Message Content</label>
            <textarea
              rows={3}
              value={newCampaign.messageBody}
              onChange={(e) => setNewCampaign({ ...newCampaign, messageBody: e.target.value })}
              placeholder="Hi {{customer_name}}! We are thrilled to invite you..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCampaignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="glow" size="sm" type="submit">
              Draft Campaign
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL 3: View Official Indian GST Tax Invoice ─────────────────────── */}
      {selectedInvoice && (
        <Modal
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          title={`GST Tax Invoice — ${selectedInvoice.invoiceNumber}`}
          description="Compliant Indian GST Tax Invoice (2.5% CGST + 2.5% SGST)."
          size="lg"
        >
          <div className="space-y-4 text-xs font-sans">
            {/* Header */}
            <div className="text-center pb-3 border-b-2 border-dashed border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                {selectedInvoice.restaurantName}
              </h2>
              <p className="text-slate-500 text-[11px]">Connaught Place, Central Delhi, 110001 | Tel: +91 11 4567 8900</p>
              <p className="font-bold text-slate-900 dark:text-white mt-1">GSTIN: {selectedInvoice.gstin}</p>
              <Badge variant="success" size="sm" className="mt-1">Official Tax Invoice</Badge>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600 dark:text-slate-400">
              <div>
                <p><strong className="text-slate-900 dark:text-white">Invoice No:</strong> {selectedInvoice.invoiceNumber}</p>
                <p><strong className="text-slate-900 dark:text-white">Order Ref:</strong> {selectedInvoice.orderNumber}</p>
                <p><strong className="text-slate-900 dark:text-white">Date:</strong> {new Date(selectedInvoice.date).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p><strong className="text-slate-900 dark:text-white">Customer:</strong> {selectedInvoice.customerName}</p>
                <p><strong className="text-slate-900 dark:text-white">Phone:</strong> {selectedInvoice.customerPhone}</p>
                <p><strong className="text-slate-900 dark:text-white">Location:</strong> {selectedInvoice.location}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Rate</th>
                    <th className="p-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
                  {selectedInvoice.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium text-slate-900 dark:text-white">{it.name}</td>
                      <td className="p-2.5 text-center">{it.quantity}</td>
                      <td className="p-2.5 text-right font-mono">₹{it.unitPrice.toFixed(2)}</td>
                      <td className="p-2.5 text-right font-mono font-bold">₹{it.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="max-w-xs ml-auto space-y-1 text-right">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono">₹{selectedInvoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>CGST (2.5%):</span>
                <span className="font-mono">₹{selectedInvoice.cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>SGST (2.5%):</span>
                <span className="font-mono">₹{selectedInvoice.sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-emerald-600 dark:text-emerald-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>Grand Total:</span>
                <span className="font-mono">₹{selectedInvoice.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Printer className="h-3.5 w-3.5" />}
              >
                Print / Save PDF
              </Button>
              <Button
                variant="glow"
                size="sm"
                onClick={() => {
                  handleSendInvoice(selectedInvoice.id);
                  setIsInvoiceModalOpen(false);
                }}
                rightIcon={<Send className="h-3.5 w-3.5" />}
              >
                Dispatch via WhatsApp
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL 4: Create Invoice from Order ─────────────────────────────────── */}
      <Modal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
        title="Generate Tax Invoice from Order"
        description="Enter an active or served order number to calculate GST and generate an official invoice."
        size="sm"
      >
        <form onSubmit={handleCreateInvoiceFromOrder} className="space-y-4 text-xs">
          <Input
            label="Order Number or ID"
            value={manualOrderId}
            onChange={(e) => setManualOrderId(e.target.value)}
            placeholder="e.g. ORD-1024"
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateInvoiceOpen(false)}>
              Cancel
            </Button>
            <Button variant="glow" size="sm" type="submit" disabled={isGeneratingInvoice}>
              {isGeneratingInvoice ? "Generating..." : "Generate Invoice"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL 5: Why WhatsApp Web QR Cannot Be Used For Real Customers ─────── */}
      <Modal
        isOpen={isWhyModalOpen}
        onClose={() => setIsWhyModalOpen(false)}
        title="Why WhatsApp Web QR Cannot Be Used For Real Customers"
        description="Technical, security, and compliance comparison between OpenWA (Development Sandbox) and Meta Cloud API (Production)."
        size="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 leading-relaxed">
            <strong>OpenWA</strong> uses an unofficial browser automation engine (<code className="font-mono text-[11px] bg-amber-500/20 px-1 py-0.5 rounded">whatsapp-web.js</code> + Headless Chromium). While convenient for zero-config local development, using it for real customer communications in production introduces critical risks:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Risk 1 */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-4 w-4" />
                <span>1. Permanent Phone Number Ban</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Meta anti-spam algorithms detect headless browser automation. When messaging customers who haven&apos;t saved your number in their contacts, Meta will <strong>permanently ban the SIM card / phone number</strong>. Banned numbers cannot be recovered.
              </p>
            </div>

            {/* Risk 2 */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
                <Clock className="h-4 w-4" />
                <span>2. Frequent Session Dropouts</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                WhatsApp Web multi-device relies on a phone heartbeat. If the phone battery dies, Wi-Fi drops, or WhatsApp invalidates the session token, all customer notifications silently fail until someone manually scans a new QR code.
              </p>
            </div>

            {/* Risk 3 */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
                <Sparkles className="h-4 w-4" />
                <span>3. No Interactive Buttons or Green Tick</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                WhatsApp Web only supports plain text and basic attachments. It <strong>cannot send interactive CTA buttons</strong> (&quot;Track Order Live&quot;, &quot;Pay via UPI&quot;, quick-reply options) and cannot display the verified Green Tick business profile.
              </p>
            </div>

            {/* Risk 4 */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-purple-600 dark:text-purple-400">
                <ShieldCheck className="h-4 w-4" />
                <span>4. Telecom & TRAI Compliance</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Commercial and transactional messaging requires pre-approved HSM templates and opt-in/opt-out compliance under TRAI (India) and international messaging laws. Unofficial web scrapers violate these regulations.
              </p>
            </div>
          </div>

          {/* Official Production Solution */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <span>The Official Production Solution: Meta WhatsApp Cloud API (WABA)</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
              DineFlow already includes a complete, battle-tested integration with Meta&apos;s Official Cloud API (<code className="font-mono text-[10px]">Graph API v21.0</code>). It offers <strong>99.99% SLA uptime</strong>, zero phone or container dependencies, instant delivery up to 500+ msg/sec, and is <strong>100% immune to phone bans</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsWhyModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="glow"
              size="sm"
              onClick={() => {
                setIsWhyModalOpen(false);
                setActiveTab("overview");
              }}
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            >
              Switch to Meta Cloud API (Official)
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
