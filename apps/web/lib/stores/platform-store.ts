import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "./auth-store";

export type BusinessType = "restaurant" | "hotel" | "cafe" | "cloud_kitchen" | "bar";
export type PlanTier = "trial" | "starter" | "growth" | "hotel_pro" | "enterprise";
export type ClientStatus = "active" | "trial" | "grace_period" | "suspended" | "cancelled";

export interface PlatformClient {
  id: string;
  name: string;
  legalName: string;
  slug: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  businessType: BusinessType;
  plan: PlanTier;
  billingCycle: "monthly" | "annual";
  status: ClientStatus;
  tablesCount: number;
  roomsCount: number;
  staffCount: number;
  menuCount: number;
  ordersCount: number;
  mrr: number;
  arr: number;
  trialDaysLeft?: number;
  renewalDate: string;
  joinedAt: string;
  lastActiveAt: string;
  healthScore: number; // 0-100% dynamically computed
  address: string;
  city: string;
  state: string;
  currency: string;
  activeSessions: number;
  storageUsedMb: number;
  integrations: {
    whatsapp: boolean;
    email: boolean;
    qr: boolean;
  };
  featureOverrides: Record<string, boolean>;
}

export interface SupportTicket {
  id: string;
  tenantId: string;
  tenantName: string;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved";
  category: "billing" | "technical" | "whatsapp" | "hardware" | "onboarding";
  assignedAgent: string;
  createdAt: string;
  updatedAt: string;
  internalNotes: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: {
    name: string;
    email: string;
    role: string;
  };
  action: string;
  category: "client" | "subscription" | "security" | "feature_flag" | "support" | "system";
  targetId?: string;
  targetName?: string;
  ipAddress: string;
  details: string;
}

export interface SystemServiceHealth {
  name: string;
  status: "healthy" | "degraded" | "down";
  latencyMs: number;
  uptime: string;
  details: string;
}

export interface FeatureFlagDefinition {
  key: string;
  name: string;
  description: string;
  category: "core" | "hotel" | "ai" | "growth" | "compliance";
  platformDefault: boolean;
}

export interface RevenueInvoice {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  currency: string;
  plan: PlanTier;
  date: string;
  dueDate: string;
  status: "paid" | "failed" | "pending";
  paymentMethod: string;
}

export interface DashboardMetrics {
  totalClients: number;
  activeClients: number;
  trialClients: number;
  graceClients: number;
  suspendedClients: number;
  totalMRR: number;
  totalARR: number;
  platformGMV: number;
  totalOrders: number;
  totalStaff: number;
  totalRooms: number;
  totalTables: number;
  totalMenus: number;
  hotelsCount: number;
  restaurantsCount: number;
  cafesCount: number;
  cloudKitchensCount: number;
  openTickets: number;
  avgHealthScore: number;
  collectionRate: number;
}

export interface RevenueOverview {
  mrr: number;
  arr: number;
  newRevenue: number;
  netChurnRate: number;
  activeSubscriptions: number;
  trialClients: number;
  failedPaymentsCount: number;
  failedPaymentsTotal: number;
  collectionRate: number;
  expiringIn7Days: number;
  expiringIn3Days: number;
  expiredTrials: number;
  recentInvoices: RevenueInvoice[];
}

export interface PlatformNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  target: string;
  read: boolean;
  createdAt: string;
}

export interface SecurityMetrics {
  healthScore: number;
  failedLoginsLast24h: number;
  blockedIpsCount: number;
  blockedIps: string[];
  activeSessionsCount: number;
  mfaEnforcedTenants: number;
  webhookHealth: string;
  tokenRotationStatus: string;
  zeroTrustEnforced: boolean;
  lastBackupAt: string;
  backupStatus: string;
}

export interface SecurityIncidentRecord {
  id: string;
  timestamp: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  type: string;
  sourceIp: string;
  target: string;
  details: string;
}

// ─── Initial Fallback Constants ───────────────────────────────────────────────

export const INITIAL_FEATURE_FLAGS: FeatureFlagDefinition[] = [
  {
    key: "whatsapp_automation",
    name: "WhatsApp Cloud API & Bot",
    description: "Inbound order taking, AI guest concierge, and automatic bill delivery via Meta WhatsApp.",
    category: "growth",
    platformDefault: true,
  },
  {
    key: "hotel_pms_module",
    name: "Hotel & Guest Suites PMS",
    description: "Housekeeping tracking, in-room dining QR tent stands, and guest folio management.",
    category: "hotel",
    platformDefault: true,
  },
  {
    key: "workforce_payroll",
    name: "GPS Geofenced Payroll & Shifts",
    description: "Mobile biometric clock-in, leave approval workflows, and automated payroll runs.",
    category: "core",
    platformDefault: true,
  },
  {
    key: "ai_studio",
    name: "AI Studio (Menu & Demand Forecast)",
    description: "DeepMind-powered neural menu writer, dynamic pricing alerts, and kitchen prep forecasting.",
    category: "ai",
    platformDefault: true,
  },
  {
    key: "gst_invoicing",
    name: "B2B GST Invoicing & Compliance",
    description: "Automated SAC code GST calculations with downloadable verified thermal receipts.",
    category: "compliance",
    platformDefault: true,
  },
  {
    key: "contactless_qr_ordering",
    name: "Live Contactless Table Ordering",
    description: "Instant browser menu with WhatsApp handoff and live table ordering.",
    category: "core",
    platformDefault: true,
  },
];

export const INITIAL_CLIENTS: PlatformClient[] = [
  {
    id: "ten-001",
    name: "The Grand Bistro & Rooftop",
    legalName: "Grand Bistro Hospitality LLP",
    slug: "the-grand-bistro",
    ownerName: "Laurent D'Souza",
    ownerPhone: "+91 98765 43210",
    ownerEmail: "laurent@grandbistro.in",
    businessType: "restaurant",
    plan: "growth",
    billingCycle: "annual",
    status: "active",
    tablesCount: 38,
    roomsCount: 0,
    staffCount: 16,
    menuCount: 84,
    ordersCount: 4219,
    mrr: 2999,
    arr: 35988,
    renewalDate: "2027-01-15",
    joinedAt: "2026-01-15",
    lastActiveAt: "Just now",
    healthScore: 98,
    address: "Level 14, Palladium Tower, High Street Phoenix",
    city: "Mumbai",
    state: "Maharashtra",
    currency: "INR",
    activeSessions: 6,
    storageUsedMb: 142,
    integrations: { whatsapp: true, email: true, qr: true },
    featureOverrides: {},
  },
  {
    id: "ten-002",
    name: "Taj Heritage Palace & Suites",
    legalName: "Taj Heritage Royal Resorts Pvt Ltd",
    slug: "taj-heritage-udaipur",
    ownerName: "Maharaj Vikram Singh",
    ownerPhone: "+91 98290 12345",
    ownerEmail: "palace@tajheritage.com",
    businessType: "hotel",
    plan: "hotel_pro",
    billingCycle: "annual",
    status: "active",
    tablesCount: 65,
    roomsCount: 140,
    staffCount: 48,
    menuCount: 162,
    ordersCount: 11420,
    mrr: 7999,
    arr: 95988,
    renewalDate: "2027-03-20",
    joinedAt: "2026-03-20",
    lastActiveAt: "3 mins ago",
    healthScore: 100,
    address: "Lake Pichola Promenade",
    city: "Udaipur",
    state: "Rajasthan",
    currency: "INR",
    activeSessions: 14,
    storageUsedMb: 680,
    integrations: { whatsapp: true, email: true, qr: true },
    featureOverrides: {},
  },
  {
    id: "ten-003",
    name: "Le Petit Artisan Cafe",
    legalName: "Petit Bakeries India Ltd",
    slug: "le-petit-cafe",
    ownerName: "Camille Dupont",
    ownerPhone: "+91 98450 67890",
    ownerEmail: "camille@lepetit.co",
    businessType: "cafe",
    plan: "starter",
    billingCycle: "monthly",
    status: "active",
    tablesCount: 14,
    roomsCount: 0,
    staffCount: 6,
    menuCount: 38,
    ordersCount: 1890,
    mrr: 999,
    arr: 11988,
    renewalDate: "2026-10-05",
    joinedAt: "2026-06-05",
    lastActiveAt: "12 mins ago",
    healthScore: 92,
    address: "100 Feet Road, Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    currency: "INR",
    activeSessions: 2,
    storageUsedMb: 64,
    integrations: { whatsapp: true, email: true, qr: true },
    featureOverrides: {},
  },
  {
    id: "ten-004",
    name: "Seaside Haven Resort & Spa",
    legalName: "Goa Coastal Escapes LLP",
    slug: "seaside-haven-goa",
    ownerName: "Anthony Rodrigues",
    ownerPhone: "+91 98221 44556",
    ownerEmail: "anthony@seasidehaven.com",
    businessType: "hotel",
    plan: "hotel_pro",
    billingCycle: "monthly",
    status: "grace_period",
    tablesCount: 45,
    roomsCount: 88,
    staffCount: 32,
    menuCount: 110,
    ordersCount: 6540,
    mrr: 7999,
    arr: 95988,
    trialDaysLeft: 0,
    renewalDate: "2026-09-12",
    joinedAt: "2026-04-12",
    lastActiveAt: "1 hour ago",
    healthScore: 78,
    address: "Sunset Beach Road, Candolim",
    city: "Goa",
    state: "Goa",
    currency: "INR",
    activeSessions: 4,
    storageUsedMb: 410,
    integrations: { whatsapp: true, email: true, qr: true },
    featureOverrides: {},
  },
  {
    id: "ten-005",
    name: "Urban Wok Cloud Kitchen",
    legalName: "Urban Food Innovations Pvt Ltd",
    slug: "urban-wok-delhi",
    ownerName: "Kunal Mehra",
    ownerPhone: "+91 98100 88990",
    ownerEmail: "kunal@urbanwok.in",
    businessType: "cloud_kitchen",
    plan: "growth",
    billingCycle: "monthly",
    status: "active",
    tablesCount: 0,
    roomsCount: 0,
    staffCount: 12,
    menuCount: 75,
    ordersCount: 8940,
    mrr: 2999,
    arr: 35988,
    renewalDate: "2026-10-18",
    joinedAt: "2026-02-18",
    lastActiveAt: "5 mins ago",
    healthScore: 95,
    address: "Okhla Industrial Area Phase 2",
    city: "New Delhi",
    state: "Delhi",
    currency: "INR",
    activeSessions: 5,
    storageUsedMb: 118,
    integrations: { whatsapp: true, email: true, qr: true },
    featureOverrides: {},
  },
  {
    id: "ten-006",
    name: "Spice Garden Pure Veg",
    legalName: "Spice Garden Foods LLP",
    slug: "spice-garden-ahmedabad",
    ownerName: "Harsh Patel",
    ownerPhone: "+91 98980 11223",
    ownerEmail: "harsh@spicegarden.co.in",
    businessType: "restaurant",
    plan: "trial",
    billingCycle: "monthly",
    status: "trial",
    tablesCount: 18,
    roomsCount: 0,
    staffCount: 8,
    menuCount: 42,
    ordersCount: 310,
    mrr: 0,
    arr: 0,
    trialDaysLeft: 5,
    renewalDate: "2026-09-23",
    joinedAt: "2026-09-09",
    lastActiveAt: "25 mins ago",
    healthScore: 68,
    address: "SG Highway, Bodakdev",
    city: "Ahmedabad",
    state: "Gujarat",
    currency: "INR",
    activeSessions: 2,
    storageUsedMb: 35,
    integrations: { whatsapp: false, email: true, qr: true },
    featureOverrides: {},
  },
  {
    id: "ten-007",
    name: "Dhaba 1947 Heritage Kitchen",
    legalName: "1947 Dhabas India Pvt Ltd",
    slug: "dhaba-1947-amritsar",
    ownerName: "Gurpreet Singh",
    ownerPhone: "+91 98720 99887",
    ownerEmail: "gurpreet@dhaba1947.com",
    businessType: "restaurant",
    plan: "starter",
    billingCycle: "monthly",
    status: "suspended",
    tablesCount: 24,
    roomsCount: 0,
    staffCount: 14,
    menuCount: 56,
    ordersCount: 2450,
    mrr: 999,
    arr: 11988,
    renewalDate: "2026-08-30",
    joinedAt: "2026-05-30",
    lastActiveAt: "2 weeks ago",
    healthScore: 54,
    address: "GT Road Bypass",
    city: "Amritsar",
    state: "Punjab",
    currency: "INR",
    activeSessions: 0,
    storageUsedMb: 52,
    integrations: { whatsapp: false, email: true, qr: true },
    featureOverrides: {},
  },
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "TCK-481",
    tenantId: "ten-004",
    tenantName: "Seaside Haven Resort & Spa",
    subject: "Webhook delivery failure for WhatsApp invoices",
    description: "Invoices created at check-out are not delivering to international guest numbers.",
    priority: "high",
    status: "open",
    category: "whatsapp",
    assignedAgent: "Aarav Sharma",
    createdAt: "2026-09-17T14:30:00Z",
    updatedAt: "2026-09-17T16:45:00Z",
    internalNotes: ["Checked Meta Cloud API log. Client token expired yesterday."],
  },
  {
    id: "TCK-480",
    tenantId: "ten-002",
    tenantName: "Taj Heritage Palace & Suites",
    subject: "Requesting additional 50 room stands bulk PDF",
    description: "Opening new royal wing next week, need custom gold border tent QR stands.",
    priority: "medium",
    status: "in_progress",
    category: "hardware",
    assignedAgent: "Priya Nair",
    createdAt: "2026-09-16T11:15:00Z",
    updatedAt: "2026-09-17T09:20:00Z",
    internalNotes: ["Generated high-DPI SVG template with royal gold hex code."],
  },
  {
    id: "TCK-478",
    tenantId: "ten-006",
    tenantName: "Spice Garden Pure Veg",
    subject: "Assistance importing 40 items from Swiggy menu PDF",
    description: "AI menu writer completed 80%, need review on Jain dietary tags.",
    priority: "low",
    status: "resolved",
    category: "onboarding",
    assignedAgent: "Rohan Varma",
    createdAt: "2026-09-15T08:00:00Z",
    updatedAt: "2026-09-16T14:10:00Z",
    internalNotes: ["Manual verification completed and verified all 42 items as pure veg."],
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "aud-901",
    timestamp: "2026-09-17T18:40:00Z",
    actor: { name: "Platform Super Admin", email: "superadmin@dineflow.io", role: "super_admin" },
    action: "client.plan_override",
    category: "subscription",
    targetId: "ten-002",
    targetName: "Taj Heritage Palace & Suites",
    ipAddress: "157.34.120.91",
    details: "Assigned enterprise Hotel Pro license tier with 140 rooms quota.",
  },
  {
    id: "aud-900",
    timestamp: "2026-09-17T17:15:00Z",
    actor: { name: "Platform Admin", email: "admin@dineflow.io", role: "platform_admin" },
    action: "client.trial_extended",
    category: "client",
    targetId: "ten-006",
    targetName: "Spice Garden Pure Veg",
    ipAddress: "103.21.124.4",
    details: "Extended trial by 14 days upon request from client owner.",
  },
  {
    id: "aud-899",
    timestamp: "2026-09-17T15:22:00Z",
    actor: { name: "Platform Super Admin", email: "superadmin@dineflow.io", role: "super_admin" },
    action: "client.impersonation_started",
    category: "security",
    targetId: "ten-001",
    targetName: "The Grand Bistro & Rooftop",
    ipAddress: "157.34.120.91",
    details: "Started verified impersonation session to inspect KDS station dispatch.",
  },
];

export const INITIAL_SYSTEM_SERVICES: SystemServiceHealth[] = [
  {
    name: "Next.js Web Edge Gateway",
    status: "healthy",
    latencyMs: 14,
    uptime: "99.98%",
    details: "Vercel Edge Network serving worldwide static & dynamic routes.",
  },
  {
    name: "Go Core REST API (Gin Engine)",
    status: "healthy",
    latencyMs: 22,
    uptime: "99.95%",
    details: "Railway US-East cluster handling multi-tenant RPCs.",
  },
  {
    name: "MongoDB Atlas Primary Cluster",
    status: "healthy",
    latencyMs: 18,
    uptime: "100.0%",
    details: "Dedicated M10 3-node replica set with auto-sharding.",
  },
  {
    name: "Upstash Redis Cache & Rate Limiter",
    status: "healthy",
    latencyMs: 8,
    uptime: "99.99%",
    details: "In-memory token JTI verification & distributed rate limits.",
  },
  {
    name: "Meta WhatsApp Cloud API Gateway",
    status: "healthy",
    latencyMs: 95,
    uptime: "99.92%",
    details: "Webhook listener active for inbound order bots & receipts.",
  },
  {
    name: "DeepMind AI Studio Inference Server",
    status: "healthy",
    latencyMs: 240,
    uptime: "99.94%",
    details: "Gemini 2.5 Flash pipeline for menu extraction & forecasting.",
  },
];

export const INITIAL_SECURITY_METRICS: SecurityMetrics = {
  healthScore: 98,
  failedLoginsLast24h: 3,
  blockedIpsCount: 1,
  blockedIps: ["185.220.101.42"],
  activeSessionsCount: 42,
  mfaEnforcedTenants: 16,
  webhookHealth: "verified",
  tokenRotationStatus: "active",
  zeroTrustEnforced: true,
  lastBackupAt: new Date(Date.now() - 3600000).toISOString(),
  backupStatus: "verified",
};

export const INITIAL_SECURITY_EVENTS: SecurityIncidentRecord[] = [
  {
    id: "sec-evt-1",
    timestamp: new Date(Date.now() - 900000).toISOString(),
    severity: "info",
    type: "token_revoked",
    sourceIp: "127.0.0.1",
    target: "Redis Token Blacklist",
    details: "Automated sliding window token rotation and JTI verification succeeded",
  },
  {
    id: "sec-evt-2",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    severity: "medium",
    type: "rate_limited",
    sourceIp: "194.26.29.112",
    target: "/api/v1/auth/login",
    details: "Public sliding window rate limit triggered (exceeded 60 req/min)",
  },
  {
    id: "sec-evt-3",
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    severity: "high",
    type: "operator_injection_blocked",
    sourceIp: "185.220.101.42",
    target: "/api/v1/orders",
    details: "NoSQL operator injection key detected ($where) and rejected by edge firewall",
  },
  {
    id: "sec-evt-4",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    severity: "info",
    type: "webhook_signature_verified",
    sourceIp: "157.240.199.36",
    target: "/api/v1/webhooks/whatsapp",
    details: "Meta Cloud API HMAC-SHA256 signature cryptographic verification valid",
  },
];

// ─── Store Interface ──────────────────────────────────────────────────────────

interface PlatformState {
  clients: PlatformClient[];
  totalClientsCount: number;
  selectedClient360: any | null;
  supportTickets: SupportTicket[];
  totalTicketsCount: number;
  auditLogs: AuditLogEntry[];
  totalAuditLogsCount: number;
  featureFlags: FeatureFlagDefinition[];
  tenantOverrides: Record<string, Record<string, boolean>>;
  systemServices: SystemServiceHealth[];
  maintenanceMode: boolean;
  globalAnnouncement: {
    active: boolean;
    message: string;
    type: "info" | "warning" | "critical";
  };
  defaultTrialDays: number;
  revenueOverview: RevenueOverview | null;
  invoices: RevenueInvoice[];
  totalInvoicesCount: number;
  dashboardMetrics: DashboardMetrics | null;
  notifications: PlatformNotification[];
  unreadNotificationsCount: number;
  isLoading: boolean;
  securityMetrics: SecurityMetrics | null;
  securityEvents: SecurityIncidentRecord[];

  // Fetching Actions
  fetchDashboardMetrics: () => Promise<void>;
  fetchClients: (params?: {
    q?: string;
    status?: string;
    plan?: string;
    type?: string;
    sort_by?: string;
    order?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  fetchClient360: (id: string) => Promise<any>;
  fetchRevenueOverview: () => Promise<void>;
  fetchInvoices: (params?: { q?: string; status?: string; page?: number; limit?: number }) => Promise<void>;
  fetchFeatureFlags: () => Promise<void>;
  fetchSupportTickets: (params?: {
    q?: string;
    status?: string;
    priority?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  fetchAuditLogs: (params?: { q?: string; category?: string; page?: number; limit?: number }) => Promise<void>;
  fetchSystemHealth: () => Promise<void>;
  fetchOperationsSettings: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchSecurityMetrics: () => Promise<void>;
  fetchSecurityEvents: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Mutating Actions (Synchronous signatures for backwards compatibility + asynchronous API execution)
  activateClient: (id: string) => void;
  suspendClient: (id: string) => void;
  changeClientPlan: (id: string, plan: PlanTier, billingCycle?: "monthly" | "annual") => void;
  extendClientTrial: (id: string, days: number) => void;
  deleteClient: (id: string) => void;
  bulkActivate: (ids: string[]) => void;
  bulkSuspend: (ids: string[]) => void;
  bulkChangePlan: (ids: string[], plan: PlanTier) => void;
  setClientFeatureOverride: (clientId: string, featureKey: string, enabled: boolean) => void;
  togglePlatformDefaultFlag: (featureKey: string) => void;
  createSupportTicket: (ticket: {
    tenantId: string;
    subject: string;
    description: string;
    priority?: string;
    category?: string;
    assignedAgent?: string;
  }) => Promise<any>;
  updateSupportTicketStatus: (ticketId: string, status: SupportTicket["status"]) => void;
  addTicketInternalNote: (ticketId: string, note: string) => void;
  addAuditLog: (entry: Omit<AuditLogEntry, "id" | "timestamp">) => void;
  setMaintenanceMode: (enabled: boolean) => void;
  setGlobalAnnouncement: (announcement: PlatformState["globalAnnouncement"]) => void;
  flushCache: () => Promise<void>;
  downloadCsvExport: (entity: string) => Promise<void>;
  logoutPlatform: () => Promise<void>;
  blockIP: (ip: string, reason: string) => Promise<void>;
  unblockIP: (ip: string) => Promise<void>;
  revokeUserSessions: (userId: string) => Promise<void>;
}

export const usePlatformStore = create<PlatformState>()(
  persist(
    (set, get) => ({
      clients: INITIAL_CLIENTS,
      totalClientsCount: INITIAL_CLIENTS.length,
      selectedClient360: null,
      supportTickets: INITIAL_SUPPORT_TICKETS,
      totalTicketsCount: INITIAL_SUPPORT_TICKETS.length,
      auditLogs: INITIAL_AUDIT_LOGS,
      totalAuditLogsCount: INITIAL_AUDIT_LOGS.length,
      featureFlags: INITIAL_FEATURE_FLAGS,
      tenantOverrides: {},
      systemServices: INITIAL_SYSTEM_SERVICES,
      maintenanceMode: false,
      globalAnnouncement: {
        active: false,
        message: "Scheduled platform maintenance window Sunday at 02:00 AM IST.",
        type: "info",
      },
      defaultTrialDays: 14,
      revenueOverview: null,
      invoices: [],
      totalInvoicesCount: 0,
      dashboardMetrics: null,
      notifications: [],
      unreadNotificationsCount: 0,
      isLoading: false,
      securityMetrics: INITIAL_SECURITY_METRICS,
      securityEvents: INITIAL_SECURITY_EVENTS,

      // ─── API Fetchers ────────────────────────────────────────────────────────

      fetchDashboardMetrics: async () => {
        try {
          const res = await apiClient.get("/platform/dashboard/metrics");
          if (res.data?.success && res.data?.data) {
            set({ dashboardMetrics: res.data.data });
          }
        } catch {
          // Keep sensible fallback in local state
        }
      },

      fetchClients: async (params = {}) => {
        set({ isLoading: true });
        try {
          const res = await apiClient.get("/platform/tenants", { params });
          if (res.data?.success && Array.isArray(res.data?.data)) {
            set({
              clients: res.data.data,
              totalClientsCount: res.data?.meta?.total ?? res.data.data.length,
            });
          }
        } catch {
          // Retain state
        } finally {
          set({ isLoading: false });
        }
      },

      fetchClient360: async (id: string) => {
        try {
          const res = await apiClient.get(`/platform/tenants/${id}`);
          if (res.data?.success && res.data?.data) {
            set({ selectedClient360: res.data.data });
            return res.data.data;
          }
        } catch {
          return null;
        }
      },

      fetchRevenueOverview: async () => {
        try {
          const res = await apiClient.get("/platform/revenue/overview");
          if (res.data?.success && res.data?.data) {
            set({
              revenueOverview: res.data.data,
              invoices: res.data.data.recentInvoices || get().invoices,
            });
          }
        } catch {
          // Fallback
        }
      },

      fetchInvoices: async (params = {}) => {
        try {
          const res = await apiClient.get("/platform/revenue/invoices", { params });
          if (res.data?.success && Array.isArray(res.data?.data)) {
            set({
              invoices: res.data.data,
              totalInvoicesCount: res.data?.meta?.total ?? res.data.data.length,
            });
          }
        } catch {
          // Fallback
        }
      },

      fetchFeatureFlags: async () => {
        try {
          const res = await apiClient.get("/platform/feature-flags");
          if (res.data?.success && res.data?.data) {
            set({
              featureFlags: res.data.data.flags || get().featureFlags,
              tenantOverrides: res.data.data.overrides || {},
            });
          }
        } catch {
          // Fallback
        }
      },

      fetchSupportTickets: async (params = {}) => {
        try {
          const res = await apiClient.get("/platform/support/tickets", { params });
          if (res.data?.success && Array.isArray(res.data?.data)) {
            set({
              supportTickets: res.data.data,
              totalTicketsCount: res.data?.meta?.total ?? res.data.data.length,
            });
          }
        } catch {
          // Fallback
        }
      },

      fetchAuditLogs: async (params = {}) => {
        try {
          const res = await apiClient.get("/platform/audit-logs", { params });
          if (res.data?.success && Array.isArray(res.data?.data)) {
            set({
              auditLogs: res.data.data,
              totalAuditLogsCount: res.data?.meta?.total ?? res.data.data.length,
            });
          }
        } catch {
          // Fallback
        }
      },

      fetchSystemHealth: async () => {
        try {
          const res = await apiClient.get("/platform/system-health");
          if (res.data?.success && Array.isArray(res.data?.data)) {
            set({ systemServices: res.data.data });
          }
        } catch {
          // Fallback
        }
      },

      fetchOperationsSettings: async () => {
        try {
          const res = await apiClient.get("/platform/operations/settings");
          if (res.data?.success && res.data?.data) {
            const data = res.data.data;
            set({
              maintenanceMode: data.maintenanceMode ?? false,
              defaultTrialDays: data.defaultTrialDays ?? 14,
              globalAnnouncement: data.globalAnnouncement ?? get().globalAnnouncement,
            });
          }
        } catch {
          // Fallback
        }
      },

      fetchNotifications: async () => {
        try {
          const res = await apiClient.get("/platform/notifications");
          if (res.data?.success && res.data?.data) {
            set({
              notifications: res.data.data.notifications || [],
              unreadNotificationsCount: res.data.data.unreadCount || 0,
            });
          }
        } catch {
          // Fallback
        }
      },

      markNotificationRead: async (id: string) => {
        try {
          await apiClient.patch(`/platform/notifications/${id}/read`);
          set((state) => ({
            notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
            unreadNotificationsCount: Math.max(0, state.unreadNotificationsCount - 1),
          }));
        } catch {
          // Optimistic local update
        }
      },

      markAllNotificationsRead: async () => {
        try {
          await apiClient.post("/platform/notifications/mark-all-read");
          set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
            unreadNotificationsCount: 0,
          }));
        } catch {
          // Optimistic local update
        }
      },

      // ─── Mutations ────────────────────────────────────────────────────────────

      activateClient: (id) => {
        const client = get().clients.find((c) => c.id === id);
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, status: "active" as ClientStatus } : c
          ),
        }));
        apiClient.post(`/platform/tenants/${id}/activate`).catch(() => {});
        get().addAuditLog({
          actor: { name: "Platform Admin", email: "admin@dineflow.io", role: "platform_admin" },
          action: "client.activated",
          category: "client",
          targetId: id,
          targetName: client?.name,
          ipAddress: "127.0.0.1",
          details: `Client workspace ${client?.name || id} was reactivated.`,
        });
      },

      suspendClient: (id) => {
        const client = get().clients.find((c) => c.id === id);
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, status: "suspended" as ClientStatus } : c
          ),
        }));
        apiClient.post(`/platform/tenants/${id}/suspend`).catch(() => {});
        get().addAuditLog({
          actor: { name: "Platform Admin", email: "admin@dineflow.io", role: "platform_admin" },
          action: "client.suspended",
          category: "client",
          targetId: id,
          targetName: client?.name,
          ipAddress: "127.0.0.1",
          details: `Client workspace ${client?.name || id} suspended by platform administrator.`,
        });
      },

      changeClientPlan: (id, plan, billingCycle = "monthly") => {
        const client = get().clients.find((c) => c.id === id);
        const planMrrMap: Record<PlanTier, number> = {
          trial: 0,
          starter: 999,
          growth: 2999,
          hotel_pro: 7999,
          enterprise: 14999,
        };
        const mrr = planMrrMap[plan] || 0;
        const arr = mrr * 12;

        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id
              ? {
                  ...c,
                  plan,
                  billingCycle,
                  mrr,
                  arr,
                  status: plan === "trial" ? ("trial" as ClientStatus) : ("active" as ClientStatus),
                }
              : c
          ),
        }));

        apiClient.post(`/platform/tenants/${id}/plan`, { plan, cycle: billingCycle }).catch(() => {});

        get().addAuditLog({
          actor: { name: "Platform Admin", email: "admin@dineflow.io", role: "platform_admin" },
          action: "client.plan_override",
          category: "subscription",
          targetId: id,
          targetName: client?.name,
          ipAddress: "127.0.0.1",
          details: `Updated subscription plan of ${client?.name} to ${plan.toUpperCase()} (${billingCycle}).`,
        });
      },

      extendClientTrial: (id, days) => {
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id
              ? {
                  ...c,
                  trialDaysLeft: (c.trialDaysLeft || 0) + days,
                  status: "trial" as ClientStatus,
                }
              : c
          ),
        }));

        apiClient.post(`/platform/tenants/${id}/extend-trial`, { days }).catch(() => {});

        const client = get().clients.find((c) => c.id === id);
        get().addAuditLog({
          actor: { name: "Platform Admin", email: "admin@dineflow.io", role: "platform_admin" },
          action: "client.trial_extended",
          category: "subscription",
          targetId: id,
          targetName: client?.name,
          ipAddress: "127.0.0.1",
          details: `Extended trial for ${client?.name || id} by ${days} days.`,
        });
      },

      deleteClient: (id) => {
        const client = get().clients.find((c) => c.id === id);
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
        }));

        apiClient.delete(`/platform/tenants/${id}`).catch(() => {});

        get().addAuditLog({
          actor: { name: "Platform Super Admin", email: "superadmin@dineflow.io", role: "super_admin" },
          action: "client.deleted",
          category: "client",
          targetId: id,
          targetName: client?.name,
          ipAddress: "127.0.0.1",
          details: `Client ${client?.name} was soft-deleted.`,
        });
      },

      bulkActivate: (ids) => {
        set((state) => ({
          clients: state.clients.map((c) =>
            ids.includes(c.id) ? { ...c, status: "active" as ClientStatus } : c
          ),
        }));
        apiClient.post("/platform/tenants/bulk", { action: "activate", tenantIds: ids }).catch(() => {});
        get().addAuditLog({
          actor: { name: "Platform Admin", email: "admin@dineflow.io", role: "platform_admin" },
          action: "client.bulk_activate",
          category: "client",
          ipAddress: "127.0.0.1",
          details: `Bulk reactivated ${ids.length} client workspaces.`,
        });
      },

      bulkSuspend: (ids) => {
        set((state) => ({
          clients: state.clients.map((c) =>
            ids.includes(c.id) ? { ...c, status: "suspended" as ClientStatus } : c
          ),
        }));
        apiClient.post("/platform/tenants/bulk", { action: "suspend", tenantIds: ids }).catch(() => {});
        get().addAuditLog({
          actor: { name: "Platform Admin", email: "admin@dineflow.io", role: "platform_admin" },
          action: "client.bulk_suspend",
          category: "client",
          ipAddress: "127.0.0.1",
          details: `Bulk suspended ${ids.length} client workspaces.`,
        });
      },

      bulkChangePlan: (ids, plan) => {
        const planMrrMap: Record<PlanTier, number> = {
          trial: 0,
          starter: 999,
          growth: 2999,
          hotel_pro: 7999,
          enterprise: 14999,
        };
        const mrr = planMrrMap[plan] || 0;
        const arr = mrr * 12;

        set((state) => ({
          clients: state.clients.map((c) =>
            ids.includes(c.id)
              ? {
                  ...c,
                  plan,
                  mrr,
                  arr,
                  status: plan === "trial" ? ("trial" as ClientStatus) : ("active" as ClientStatus),
                }
              : c
          ),
        }));

        apiClient.post("/platform/tenants/bulk", { action: "change_plan", tenantIds: ids, payload: { plan } }).catch(() => {});
        get().addAuditLog({
          actor: { name: "Platform Admin", email: "admin@dineflow.io", role: "platform_admin" },
          action: "client.bulk_plan_change",
          category: "subscription",
          ipAddress: "127.0.0.1",
          details: `Bulk upgraded/changed ${ids.length} workspaces to ${plan.toUpperCase()}.`,
        });
      },

      setClientFeatureOverride: (clientId, featureKey, enabled) => {
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === clientId
              ? {
                  ...c,
                  featureOverrides: {
                    ...c.featureOverrides,
                    [featureKey]: enabled,
                  },
                }
              : c
          ),
        }));

        apiClient.put(`/platform/feature-flags/tenants/${clientId}/${featureKey}`, { enabled }).catch(() => {});

        const client = get().clients.find((c) => c.id === clientId);
        get().addAuditLog({
          actor: { name: "Platform Admin", email: "admin@dineflow.io", role: "platform_admin" },
          action: "feature_flag.override",
          category: "feature_flag",
          targetId: clientId,
          targetName: client?.name,
          ipAddress: "127.0.0.1",
          details: `Toggled feature override [${featureKey} = ${enabled}] for client ${client?.name}.`,
        });
      },

      togglePlatformDefaultFlag: (featureKey) => {
        let flagName = featureKey;
        let nextVal = false;
        set((state) => ({
          featureFlags: state.featureFlags.map((f) => {
            if (f.key === featureKey) {
              flagName = f.name;
              nextVal = !f.platformDefault;
              return { ...f, platformDefault: nextVal };
            }
            return f;
          }),
        }));

        apiClient.put(`/platform/feature-flags/${featureKey}/default`, { enabled: nextVal }).catch(() => {});

        get().addAuditLog({
          actor: { name: "Platform Admin", email: "admin@dineflow.io", role: "platform_admin" },
          action: "feature_flag.default_change",
          category: "feature_flag",
          ipAddress: "127.0.0.1",
          details: `Changed global default for ${flagName} to ${nextVal ? "ENABLED" : "DISABLED"}.`,
        });
      },

      createSupportTicket: async (ticket) => {
        try {
          const res = await apiClient.post("/platform/support/tickets", ticket);
          if (res.data?.success && res.data?.data) {
            set((state) => ({
              supportTickets: [res.data.data, ...state.supportTickets],
            }));
            return res.data.data;
          }
        } catch {
          // Fallback local create
          const newT: SupportTicket = {
            id: `TCK-${Math.floor(100 + Math.random() * 900)}`,
            tenantId: ticket.tenantId,
            tenantName: "Client Workspace",
            subject: ticket.subject,
            description: ticket.description,
            priority: (ticket.priority as any) || "medium",
            status: "open",
            category: (ticket.category as any) || "technical",
            assignedAgent: ticket.assignedAgent || "Platform Support",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            internalNotes: [],
          };
          set((state) => ({ supportTickets: [newT, ...state.supportTickets] }));
          return newT;
        }
      },

      updateSupportTicketStatus: (ticketId, status) => {
        set((state) => ({
          supportTickets: state.supportTickets.map((t) =>
            t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString() } : t
          ),
        }));

        apiClient.patch(`/platform/support/tickets/${ticketId}/status`, { status }).catch(() => {});

        get().addAuditLog({
          actor: { name: "Platform Support", email: "support@dineflow.io", role: "support_agent" },
          action: "support.status_change",
          category: "support",
          targetId: ticketId,
          ipAddress: "127.0.0.1",
          details: `Ticket ${ticketId} status set to ${status.toUpperCase()}.`,
        });
      },

      addTicketInternalNote: (ticketId, note) => {
        set((state) => ({
          supportTickets: state.supportTickets.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  internalNotes: [...t.internalNotes, note],
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));

        apiClient.post(`/platform/support/tickets/${ticketId}/notes`, { note }).catch(() => {});
      },

      addAuditLog: (entry) => {
        const fullEntry: AuditLogEntry = {
          ...entry,
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          auditLogs: [fullEntry, ...state.auditLogs].slice(0, 100),
        }));

        apiClient.post("/platform/audit-logs", entry).catch(() => {});
      },

      setMaintenanceMode: (enabled) => {
        set({ maintenanceMode: enabled });
        apiClient.put("/platform/operations/maintenance", { enabled }).catch(() => {});
        get().addAuditLog({
          actor: { name: "Platform Super Admin", email: "superadmin@dineflow.io", role: "super_admin" },
          action: "operations.maintenance_mode",
          category: "system",
          ipAddress: "127.0.0.1",
          details: `Platform maintenance mode was ${enabled ? "ACTIVATED" : "DEACTIVATED"}.`,
        });
      },

      setGlobalAnnouncement: (announcement) => {
        set({ globalAnnouncement: announcement });
        apiClient.put("/platform/operations/announcement", announcement).catch(() => {});
        get().addAuditLog({
          actor: { name: "Platform Super Admin", email: "superadmin@dineflow.io", role: "super_admin" },
          action: "operations.global_announcement",
          category: "system",
          ipAddress: "127.0.0.1",
          details: `Global announcement updated: "${announcement.message}" (${announcement.type}).`,
        });
      },

      flushCache: async () => {
        await apiClient.post("/platform/operations/flush-cache");
      },

      downloadCsvExport: async (entity: string) => {
        try {
          const res = await apiClient.get(`/platform/export/${entity}`, {
            responseType: "blob",
          });
          const blob = new Blob([res.data], { type: "text/csv" });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `dineflow_${entity}_${new Date().toISOString().slice(0, 10)}.csv`);
          document.body.appendChild(link);
          link.click();
          link.remove();
        } catch {
          // Fallback handled in component if needed
        }
      },

      logoutPlatform: async () => {
        try {
          await apiClient.post("/platform/auth/logout");
        } catch {
          // Ignore network errors on logout
        }
        useAuthStore.getState().clearAuth();
      },

      fetchSecurityMetrics: async () => {
        try {
          const res = await apiClient.get("/platform/security/metrics");
          if (res.data?.data) {
            set({ securityMetrics: res.data.data });
          }
        } catch {
          // Keep resilient fallback
        }
      },

      fetchSecurityEvents: async () => {
        try {
          const res = await apiClient.get("/platform/security/events");
          if (res.data?.data) {
            set({ securityEvents: res.data.data });
          }
        } catch {
          // Keep resilient fallback
        }
      },

      blockIP: async (ip: string, reason: string) => {
        await apiClient.post("/platform/security/block-ip", { ip, reason });
        set((s) => ({
          securityMetrics: s.securityMetrics ? {
            ...s.securityMetrics,
            blockedIpsCount: s.securityMetrics.blockedIpsCount + 1,
            blockedIps: [ip, ...s.securityMetrics.blockedIps.filter((x) => x !== ip)],
          } : null,
          securityEvents: [
            {
              id: `sec-${Date.now()}`,
              timestamp: new Date().toISOString(),
              severity: "high",
              type: "ip_blocked",
              sourceIp: ip,
              target: "Security Firewall",
              details: `IP ${ip} manually added to blocklist: ${reason}`,
            },
            ...s.securityEvents,
          ],
        }));
      },

      unblockIP: async (ip: string) => {
        await apiClient.delete(`/platform/security/block-ip/${encodeURIComponent(ip)}`);
        set((s) => ({
          securityMetrics: s.securityMetrics ? {
            ...s.securityMetrics,
            blockedIpsCount: Math.max(0, s.securityMetrics.blockedIpsCount - 1),
            blockedIps: s.securityMetrics.blockedIps.filter((x) => x !== ip),
          } : null,
          securityEvents: [
            {
              id: `sec-${Date.now()}`,
              timestamp: new Date().toISOString(),
              severity: "info",
              type: "ip_unblocked",
              sourceIp: ip,
              target: "Security Firewall",
              details: `IP ${ip} removed from blocklist`,
            },
            ...s.securityEvents,
          ],
        }));
      },

      revokeUserSessions: async (userId: string) => {
        await apiClient.post("/platform/security/revoke-user-sessions", { userId });
        set((s) => ({
          securityEvents: [
            {
              id: `sec-${Date.now()}`,
              timestamp: new Date().toISOString(),
              severity: "high",
              type: "token_revoked",
              sourceIp: "Platform Admin Console",
              target: `User:${userId}`,
              details: `All active sessions revoked immediately for user ${userId}`,
            },
            ...s.securityEvents,
          ],
        }));
      },
    }),
    {
      name: "dineflow-platform-store",
    }
  )
);
