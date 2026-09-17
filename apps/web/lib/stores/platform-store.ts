import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  healthScore: number; // 0-100%
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
    latencyMs: 38,
    uptime: "99.95%",
    details: "Railway US-East cluster handling multi-tenant RPCs.",
  },
  {
    name: "MongoDB Atlas Primary Cluster",
    status: "healthy",
    latencyMs: 22,
    uptime: "100.0%",
    details: "Dedicated M10 3-node replica set with auto-sharding.",
  },
  {
    name: "Upstash Redis Cache & Rate Limiter",
    status: "healthy",
    latencyMs: 9,
    uptime: "99.99%",
    details: "In-memory token JTI verification & distributed rate limits.",
  },
  {
    name: "Meta WhatsApp Cloud API Gateway",
    status: "healthy",
    latencyMs: 110,
    uptime: "99.92%",
    details: "Webhook listener active for inbound order bots & receipts.",
  },
  {
    name: "DeepMind AI Studio Inference Server",
    status: "healthy",
    latencyMs: 280,
    uptime: "99.94%",
    details: "Gemini 2.5 Flash pipeline for menu extraction & forecasting.",
  },
];

interface PlatformState {
  clients: PlatformClient[];
  supportTickets: SupportTicket[];
  auditLogs: AuditLogEntry[];
  featureFlags: FeatureFlagDefinition[];
  systemServices: SystemServiceHealth[];
  maintenanceMode: boolean;
  globalAnnouncement: {
    active: boolean;
    message: string;
    type: "info" | "warning" | "critical";
  };
  defaultTrialDays: number;

  // Actions
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
  updateSupportTicketStatus: (ticketId: string, status: SupportTicket["status"]) => void;
  addTicketInternalNote: (ticketId: string, note: string) => void;
  addAuditLog: (entry: Omit<AuditLogEntry, "id" | "timestamp">) => void;
  setMaintenanceMode: (enabled: boolean) => void;
  setGlobalAnnouncement: (announcement: PlatformState["globalAnnouncement"]) => void;
}

export const usePlatformStore = create<PlatformState>()(
  persist(
    (set, get) => ({
      clients: INITIAL_CLIENTS,
      supportTickets: INITIAL_SUPPORT_TICKETS,
      auditLogs: INITIAL_AUDIT_LOGS,
      featureFlags: INITIAL_FEATURE_FLAGS,
      systemServices: INITIAL_SYSTEM_SERVICES,
      maintenanceMode: false,
      globalAnnouncement: {
        active: false,
        message: "Scheduled platform upgrade on Sunday at 02:00 AM IST.",
        type: "info",
      },
      defaultTrialDays: 14,

      activateClient: (id) => {
        const client = get().clients.find((c) => c.id === id);
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, status: "active" as ClientStatus } : c
          ),
        }));
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

        get().addAuditLog({
          actor: { name: "Platform Super Admin", email: "superadmin@dineflow.io", role: "super_admin" },
          action: "client.plan_override",
          category: "subscription",
          targetId: id,
          targetName: client?.name,
          ipAddress: "127.0.0.1",
          details: `Changed subscription plan to ${plan.toUpperCase()} (${billingCycle}).`,
        });
      },

      extendClientTrial: (id, days) => {
        const client = get().clients.find((c) => c.id === id);
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status: "trial" as ClientStatus,
                  trialDaysLeft: (c.trialDaysLeft || 0) + days,
                }
              : c
          ),
        }));

        get().addAuditLog({
          actor: { name: "Platform Admin", email: "admin@dineflow.io", role: "platform_admin" },
          action: "client.trial_extended",
          category: "client",
          targetId: id,
          targetName: client?.name,
          ipAddress: "127.0.0.1",
          details: `Extended client trial by +${days} days.`,
        });
      },

      deleteClient: (id) => {
        const client = get().clients.find((c) => c.id === id);
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
        }));

        get().addAuditLog({
          actor: { name: "Platform Super Admin", email: "superadmin@dineflow.io", role: "super_admin" },
          action: "client.soft_deleted",
          category: "security",
          targetId: id,
          targetName: client?.name,
          ipAddress: "127.0.0.1",
          details: `Client ${client?.name || id} soft deleted from platform records.`,
        });
      },

      bulkActivate: (ids) => {
        set((state) => ({
          clients: state.clients.map((c) =>
            ids.includes(c.id) ? { ...c, status: "active" as ClientStatus } : c
          ),
        }));
        get().addAuditLog({
          actor: { name: "Platform Admin", email: "admin@dineflow.io", role: "platform_admin" },
          action: "bulk.activate",
          category: "client",
          ipAddress: "127.0.0.1",
          details: `Bulk activated ${ids.length} client workspaces.`,
        });
      },

      bulkSuspend: (ids) => {
        set((state) => ({
          clients: state.clients.map((c) =>
            ids.includes(c.id) ? { ...c, status: "suspended" as ClientStatus } : c
          ),
        }));
        get().addAuditLog({
          actor: { name: "Platform Super Admin", email: "superadmin@dineflow.io", role: "super_admin" },
          action: "bulk.suspend",
          category: "security",
          ipAddress: "127.0.0.1",
          details: `Bulk suspended ${ids.length} client workspaces.`,
        });
      },

      bulkChangePlan: (ids, plan) => {
        ids.forEach((id) => get().changeClientPlan(id, plan));
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
        get().addAuditLog({
          actor: { name: "Platform Super Admin", email: "superadmin@dineflow.io", role: "super_admin" },
          action: "feature_flag.override",
          category: "feature_flag",
          targetId: clientId,
          ipAddress: "127.0.0.1",
          details: `Set feature flag override for ${featureKey}: ${enabled ? "ENABLED" : "DISABLED"}.`,
        });
      },

      togglePlatformDefaultFlag: (featureKey) => {
        set((state) => ({
          featureFlags: state.featureFlags.map((f) =>
            f.key === featureKey ? { ...f, platformDefault: !f.platformDefault } : f
          ),
        }));
        get().addAuditLog({
          actor: { name: "Platform Super Admin", email: "superadmin@dineflow.io", role: "super_admin" },
          action: "feature_flag.platform_default_toggled",
          category: "feature_flag",
          ipAddress: "127.0.0.1",
          details: `Toggled platform default for flag ${featureKey}.`,
        });
      },

      updateSupportTicketStatus: (ticketId, status) => {
        set((state) => ({
          supportTickets: state.supportTickets.map((t) =>
            t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString() } : t
          ),
        }));
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
      },

      addAuditLog: (entry) => {
        const newLog: AuditLogEntry = {
          ...entry,
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          auditLogs: [newLog, ...state.auditLogs],
        }));
      },

      setMaintenanceMode: (enabled) => {
        set({ maintenanceMode: enabled });
        get().addAuditLog({
          actor: { name: "Platform Super Admin", email: "superadmin@dineflow.io", role: "super_admin" },
          action: enabled ? "operations.maintenance_enabled" : "operations.maintenance_disabled",
          category: "system",
          ipAddress: "127.0.0.1",
          details: `Platform maintenance mode set to ${enabled ? "ACTIVE" : "INACTIVE"}.`,
        });
      },

      setGlobalAnnouncement: (globalAnnouncement) => {
        set({ globalAnnouncement });
      },
    }),
    {
      name: "dineflow_platform_store",
    }
  )
);
