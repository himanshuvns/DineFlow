import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "./auth-store";

export type BusinessType = "restaurant" | "hotel" | "cafe" | "cloud_kitchen" | "bar";
export type PlanTier = "trial" | "starter" | "growth" | "hotel_pro" | "enterprise";
export type ClientStatus = "active" | "trial" | "grace_period" | "suspended" | "cancelled";
export type PlatformRole = "super_admin" | "platform_admin" | "finance_admin" | "support_agent";

export interface PlatformAdminUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: PlatformRole;
  status: "active" | "suspended";
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminPayload {
  name: string;
  email: string;
  phone?: string;
  role: PlatformRole;
  password: string;
}

export interface UpdateAdminPayload {
  name?: string;
  phone?: string;
  role?: PlatformRole;
  status?: "active" | "suspended";
}

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

export const INITIAL_CLIENTS: PlatformClient[] = [];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];

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
    details: "Production VPS Docker cluster handling multi-tenant RPCs.",
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
  healthScore: 100,
  failedLoginsLast24h: 0,
  blockedIpsCount: 0,
  blockedIps: [],
  activeSessionsCount: 1,
  mfaEnforcedTenants: 0,
  webhookHealth: "verified",
  tokenRotationStatus: "active",
  zeroTrustEnforced: true,
  lastBackupAt: new Date().toISOString(),
  backupStatus: "verified",
};

export const INITIAL_SECURITY_EVENTS: SecurityIncidentRecord[] = [];

// ─── Store Interface ──────────────────────────────────────────────────────────

interface PlatformState {
  // Platform Administrators
  platformAdmins: PlatformAdminUser[];
  isLoadingAdmins: boolean;
  fetchPlatformAdmins: () => Promise<void>;
  createPlatformAdmin: (payload: CreateAdminPayload) => Promise<boolean>;
  updatePlatformAdmin: (id: string, payload: UpdateAdminPayload) => Promise<boolean>;
  resetPlatformAdminPassword: (id: string, password: string) => Promise<boolean>;
  deletePlatformAdmin: (id: string) => Promise<boolean>;

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
      platformAdmins: [],
      isLoadingAdmins: false,

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

      
      // ─── Platform Administrators Management ──────────────────────────────
      fetchPlatformAdmins: async () => {
        set({ isLoadingAdmins: true });
        try {
          const res = await apiClient.get("/platform/admins");
          if (res.data?.success && Array.isArray(res.data?.data)) {
            set({ platformAdmins: res.data.data });
          }
        } catch {
          // Keep current state
        } finally {
          set({ isLoadingAdmins: false });
        }
      },

      createPlatformAdmin: async (payload: CreateAdminPayload) => {
        try {
          const res = await apiClient.post("/platform/admins", payload);
          if (res.data?.success && res.data?.data) {
            set((s) => ({
              platformAdmins: [res.data.data, ...s.platformAdmins],
            }));
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      updatePlatformAdmin: async (id: string, payload: UpdateAdminPayload) => {
        try {
          const res = await apiClient.patch(`/platform/admins/${id}`, payload);
          if (res.data?.success) {
            set((s) => ({
              platformAdmins: s.platformAdmins.map((a) =>
                a.id === id ? { ...a, ...payload } : a
              ),
            }));
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      resetPlatformAdminPassword: async (id: string, password: string) => {
        try {
          const res = await apiClient.post(`/platform/admins/${id}/reset-password`, { password });
          return !!res.data?.success;
        } catch {
          return false;
        }
      },

      deletePlatformAdmin: async (id: string) => {
        try {
          const res = await apiClient.delete(`/platform/admins/${id}`);
          if (res.data?.success) {
            set((s) => ({
              platformAdmins: s.platformAdmins.filter((a) => a.id !== id),
            }));
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

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
          selectedClient360:
            state.selectedClient360 && state.selectedClient360.id === id
              ? {
                  ...state.selectedClient360,
                  plan,
                  billingCycle,
                  mrr,
                  arr,
                  status: plan === "trial" ? ("trial" as ClientStatus) : ("active" as ClientStatus),
                }
              : state.selectedClient360,
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
          tenantOverrides: {
            ...state.tenantOverrides,
            [clientId]: {
              ...(state.tenantOverrides[clientId] || {}),
              [featureKey]: enabled,
            },
          },
          clients: state.clients.map((c) =>
            c.id === clientId
              ? {
                  ...c,
                  featureOverrides: {
                    ...(c.featureOverrides || {}),
                    [featureKey]: enabled,
                  },
                }
              : c
          ),
          selectedClient360:
            state.selectedClient360 && state.selectedClient360.id === clientId
              ? {
                  ...state.selectedClient360,
                  featureOverrides: {
                    ...(state.selectedClient360.featureOverrides || {}),
                    [featureKey]: enabled,
                  },
                }
              : state.selectedClient360,
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
      name: "dineflow-platform-store-v2",
      partialize: (state) => ({
        maintenanceMode: state.maintenanceMode,
        defaultTrialDays: state.defaultTrialDays,
        auditLogs: state.auditLogs.slice(0, 100),
      }),
    }
  )
);
