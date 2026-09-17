"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  ShieldAlert,
  Sparkles,
  DollarSign,
  Hotel,
  Users,
  ChefHat,
  QrCode,
  MessageSquareShare,
  Calendar,
  Clock,
  HardDrive,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Sliders,
  FileText,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/stores/auth-store";
import { usePlatformStore, PlatformClient, PlanTier } from "@/lib/stores/platform-store";

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const { startImpersonation } = useAuthStore();
  const {
    clients,
    fetchClient360,
    selectedClient360,
    activateClient,
    suspendClient,
    changeClientPlan,
    extendClientTrial,
    setClientFeatureOverride,
    featureFlags,
    auditLogs,
    addAuditLog,
  } = usePlatformStore();

  const clientId = params?.id as string;

  React.useEffect(() => {
    if (clientId) {
      fetchClient360(clientId);
    }
  }, [clientId, fetchClient360]);

  const client = (selectedClient360 && selectedClient360.id === clientId)
    ? selectedClient360
    : clients.find((c) => c.id === clientId) || clients[0];

  const [activeTab, setActiveTab] = React.useState<"profile" | "subscription" | "usage" | "integrations" | "flags" | "audit">("profile");

  if (!client) {
    return (
      <div className="p-8 text-center space-y-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Client Not Found</h2>
        <Button onClick={() => router.push("/platform/clients")}>Return to Directory</Button>
      </div>
    );
  }

  const handleImpersonate = () => {
    addAuditLog({
      actor: { name: "Platform Super Admin", email: "superadmin@dineflow.io", role: "super_admin" },
      action: "client.impersonation_started",
      category: "security",
      targetId: client.id,
      targetName: client.name,
      ipAddress: "127.0.0.1",
      details: `Started audited impersonation for workspace ${client.name}.`,
    });

    startImpersonation({
      id: client.id,
      name: client.name,
      slug: client.slug,
      type: client.businessType,
      plan: client.plan,
      currency: client.currency,
      onboardingCompleted: true,
    } as any);

    addToast("info", "Impersonation Started", `Entered ${client.name} workspace.`);
    router.push("/dashboard");
  };

  const clientLogs = auditLogs.filter((l) => l.targetId === client.id);

  return (
    <div className="space-y-5">
      {/* ── Header Dossier ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => router.push("/platform/clients")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
            {client.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                {client.name}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                {client.plan} ({client.billingCycle})
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  client.status === "active"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                }`}
              >
                {client.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">
              Workspace ID: {client.id} • Slug: /{client.slug} • Joined {client.joinedAt}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="glow"
            size="sm"
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs"
            leftIcon={<ShieldAlert className="h-3.5 w-3.5" />}
            onClick={handleImpersonate}
          >
            Impersonate Client
          </Button>

          {client.status === "active" ? (
            <Button
              variant="secondary"
              size="sm"
              className="text-xs text-rose-600 dark:text-rose-400"
              onClick={() => {
                suspendClient(client.id);
                addToast("info", "Client Suspended", `${client.name} has been suspended.`);
              }}
            >
              Suspend Workspace
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="text-xs text-emerald-600 dark:text-emerald-400"
              onClick={() => {
                activateClient(client.id);
                addToast("success", "Client Activated", `${client.name} is now active.`);
              }}
            >
              Reactivate Workspace
            </Button>
          )}
        </div>
      </div>

      {/* ── Dossier Navigation Tabs ───────────────────────────────── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        {[
          { id: "profile", label: "Business Profile", icon: Building2 },
          { id: "subscription", label: "Subscription & Billing", icon: DollarSign },
          { id: "usage", label: "Operational Scale", icon: Activity },
          { id: "integrations", label: "Integrations & QR", icon: QrCode },
          { id: "flags", label: "Feature Overrides", icon: Sliders },
          { id: "audit", label: "Audit Timeline", icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "border-b-2 border-rose-500 text-rose-600 dark:text-rose-400 font-bold bg-rose-500/5"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ───────────────────────────────────────────── */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
          <Card variant="glass" className="p-4 border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Legal & Organization</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Legal Business Name:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{client.legalName}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Business Category:</span>
                <span className="font-semibold capitalize">{client.businessType.replace("_", " ")}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Registered City:</span>
                <span className="font-semibold">{client.city}, {client.state}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Full Address:</span>
                <span className="font-semibold text-right max-w-xs">{client.address}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Currency Default:</span>
                <span className="font-mono font-bold">{client.currency} (₹)</span>
              </div>
            </div>
          </Card>

          <Card variant="glass" className="p-4 border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Primary Executive Contact</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Owner Name:</span>
                <span className="font-semibold">{client.ownerName}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Phone (WhatsApp Verified):</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{client.ownerPhone}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Email Address:</span>
                <span className="font-mono">{client.ownerEmail}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Active Device Sessions:</span>
                <span className="font-bold font-mono text-cyan-600">{client.activeSessions} active</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Cloud Storage Allocated:</span>
                <span className="font-mono">{client.storageUsedMb} MB / 5,000 MB</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "subscription" && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card variant="glass" className="p-4 border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Current MRR</span>
              <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                ₹{client.mrr.toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] text-slate-400">ARR: ₹{client.arr.toLocaleString("en-IN")}</span>
            </Card>

            <Card variant="glass" className="p-4 border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Renewal Date</span>
              <span className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1 block">
                {new Date(client.renewalDate).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}
              </span>
              <span className="text-[11px] text-slate-400">Auto-renews annually</span>
            </Card>

            <Card variant="glass" className="p-4 border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Quick Quota Extend</span>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1 text-[11px]"
                  onClick={() => {
                    extendClientTrial(client.id, 14);
                    addToast("success", "Trial Extended", "+14 days added to client.");
                  }}
                >
                  +14 Days
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1 text-[11px]"
                  onClick={() => {
                    extendClientTrial(client.id, 30);
                    addToast("success", "Trial Extended", "+30 days added to client.");
                  }}
                >
                  +30 Days
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "usage" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <Card variant="glass" className="p-4 border-slate-200 dark:border-slate-800 text-center">
            <ChefHat className="h-6 w-6 mx-auto text-amber-500 mb-1" />
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">{client.menuCount}</span>
            <span className="text-slate-500 block">Menu Items</span>
          </Card>

          <Card variant="glass" className="p-4 border-slate-200 dark:border-slate-800 text-center">
            <QrCode className="h-6 w-6 mx-auto text-emerald-500 mb-1" />
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">{client.tablesCount}</span>
            <span className="text-slate-500 block">Tables & QR Stands</span>
          </Card>

          <Card variant="glass" className="p-4 border-slate-200 dark:border-slate-800 text-center">
            <Hotel className="h-6 w-6 mx-auto text-indigo-500 mb-1" />
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">{client.roomsCount}</span>
            <span className="text-slate-500 block">Hotel Suites</span>
          </Card>

          <Card variant="glass" className="p-4 border-slate-200 dark:border-slate-800 text-center">
            <Users className="h-6 w-6 mx-auto text-cyan-500 mb-1" />
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">{client.staffCount}</span>
            <span className="text-slate-500 block">Staff Profiles</span>
          </Card>
        </div>
      )}

      {activeTab === "integrations" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <Card variant="glass" className="p-4 border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Meta WhatsApp Cloud API</span>
              <Badge variant={client.integrations.whatsapp ? "success" : "secondary"}>
                {client.integrations.whatsapp ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            <p className="text-slate-500 text-[11px]">
              Webhook live for inbound orders, daily staff clock-ins, and guest receipts.
            </p>
          </Card>

          <Card variant="glass" className="p-4 border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Public QR Menu</span>
              <Badge variant="success">Active</Badge>
            </div>
            <p className="text-slate-500 text-[11px]">
              https://dineflow-steel.vercel.app/m/{client.slug}
            </p>
          </Card>

          <Card variant="glass" className="p-4 border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Transactional Email</span>
              <Badge variant="success">Verified</Badge>
            </div>
            <p className="text-slate-500 text-[11px]">
              DKIM & SPF verified on SendGrid edge gateway.
            </p>
          </Card>
        </div>
      )}

      {activeTab === "flags" && (
        <Card variant="glass" className="p-4 border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Client-Specific Feature Flag Overrides
          </h3>
          <p className="text-xs text-slate-500">
            Explicitly enable or disable features for {client.name}, overriding global platform defaults.
          </p>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {featureFlags.map((flag) => {
              const hasOverride = client.featureOverrides[flag.key] !== undefined;
              const isEnabled = hasOverride ? client.featureOverrides[flag.key] : flag.platformDefault;

              return (
                <div key={flag.key} className="py-2.5 flex items-center justify-between">
                  <div className="min-w-0 pr-4">
                    <span className="font-bold text-slate-900 dark:text-white block">{flag.name}</span>
                    <span className="text-[11px] text-slate-500">{flag.description}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setClientFeatureOverride(client.id, flag.key, !isEnabled)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isEnabled
                          ? "bg-emerald-500 text-white shadow-xs"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {isEnabled ? "ENABLED" : "DISABLED"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {activeTab === "audit" && (
        <Card variant="glass" className="p-4 border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Workspace Audit Timeline</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {clientLogs.length === 0 ? (
              <div className="py-4 text-center text-slate-500">No sensitive actions logged for this workspace yet.</div>
            ) : (
              clientLogs.map((log) => (
                <div key={log.id} className="py-2.5 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{log.action}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{log.details}</p>
                  <span className="text-[10px] text-slate-400">Actor: {log.actor.email} ({log.actor.role})</span>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
