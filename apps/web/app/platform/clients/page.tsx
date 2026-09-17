"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  Filter,
  Download,
  Plus,
  ShieldAlert,
  SlidersHorizontal,
  ExternalLink,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Trash2,
  PauseCircle,
  PlayCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/stores/auth-store";
import { usePlatformStore, PlatformClient, PlanTier, ClientStatus } from "@/lib/stores/platform-store";

export default function PlatformClientsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { startImpersonation } = useAuthStore();
  const {
    clients,
    fetchClients,
    downloadCsvExport,
    activateClient,
    suspendClient,
    changeClientPlan,
    extendClientTrial,
    deleteClient,
    bulkActivate,
    bulkSuspend,
    bulkChangePlan,
    addAuditLog,
    isLoading,
  } = usePlatformStore();

  React.useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [planFilter, setPlanFilter] = React.useState<string>("all");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");

  // Selection state
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Modal states
  const [planChangeClient, setPlanChangeClient] = React.useState<PlatformClient | null>(null);
  const [selectedPlanTier, setSelectedPlanTier] = React.useState<PlanTier>("growth");
  const [selectedCycle, setSelectedCycle] = React.useState<"monthly" | "annual">("annual");

  const [impersonateClient, setImpersonateClient] = React.useState<PlatformClient | null>(null);

  // Filtered clients
  const filteredClients = React.useMemo(() => {
    return clients.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (planFilter !== "all" && c.plan !== planFilter) return false;
      if (typeFilter !== "all" && c.businessType !== typeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = c.name.toLowerCase().includes(q);
        const matchOwner = c.ownerName.toLowerCase().includes(q);
        const matchEmail = c.ownerEmail.toLowerCase().includes(q);
        const matchPhone = c.ownerPhone.toLowerCase().includes(q);
        const matchCity = c.city.toLowerCase().includes(q);
        if (!matchName && !matchOwner && !matchEmail && !matchPhone && !matchCity) {
          return false;
        }
      }
      return true;
    });
  }, [clients, searchQuery, statusFilter, planFilter, typeFilter]);

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredClients.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Impersonation trigger
  const handleStartImpersonation = (client: PlatformClient) => {
    // Map PlatformClient to Tenant
    const targetTenant = {
      id: client.id,
      name: client.name,
      slug: client.slug,
      type: client.businessType,
      plan: client.plan,
      currency: client.currency,
      onboardingCompleted: true,
    };

    addAuditLog({
      actor: { name: "Platform Super Admin", email: "superadmin@dineflow.io", role: "super_admin" },
      action: "client.impersonation_started",
      category: "security",
      targetId: client.id,
      targetName: client.name,
      ipAddress: "127.0.0.1",
      details: `Started audited impersonation session for workspace ${client.name}.`,
    });

    startImpersonation(targetTenant as any);
    addToast("info", "Impersonation Active", `Entering workspace for ${client.name}`);
    setImpersonateClient(null);
    router.push("/dashboard");
  };

  const handleConfirmPlanChange = () => {
    if (!planChangeClient) return;
    changeClientPlan(planChangeClient.id, selectedPlanTier, selectedCycle);
    addToast("success", "Plan Updated", `${planChangeClient.name} is now on ${selectedPlanTier.toUpperCase()} tier.`);
    setPlanChangeClient(null);
  };

  const handleExportCSV = async () => {
    try {
      await downloadCsvExport("clients");
      addToast("success", "Export Complete", "Live client directory exported to CSV.");
    } catch {
      const headers = "ID,Name,Owner,Phone,Email,Type,Plan,Status,MRR,City,HealthScore\n";
      const rows = filteredClients
        .map(
          (c) =>
            `"${c.id}","${c.name}","${c.ownerName}","${c.ownerPhone}","${c.ownerEmail}","${c.businessType}","${c.plan}","${c.status}",${c.mrr},"${c.city}",${c.healthScore}`
        )
        .join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dineflow_clients_${Date.now()}.csv`;
      a.click();
      addToast("info", "Export Complete", "Client directory exported to CSV.");
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 gap-3">
      {/* ── Fixed Top Control Area ──────────────────────────────── */}
      <div className="shrink-0 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Client Workspaces Directory
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage enterprise tenants, trigger audited impersonations, and override subscription quotas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="text-xs"
              leftIcon={<Download className="h-3.5 w-3.5" />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Instant search by business, owner, phone, email, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-500 shadow-xs"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">🟢 Active</option>
                <option value="trial">🔵 Trial</option>
                <option value="grace_period">🟠 Grace Period</option>
                <option value="suspended">🔴 Suspended</option>
              </select>

              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="all">All Plans</option>
                <option value="trial">Free Trial</option>
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="hotel_pro">Hotel Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="restaurant">Restaurants</option>
                <option value="hotel">Hotels & Resorts</option>
                <option value="cafe">Cafes</option>
                <option value="cloud_kitchen">Cloud Kitchens</option>
              </select>
            </div>
          </div>

          {/* Bulk Selection Bar */}
          {selectedIds.length > 0 && (
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between gap-2 text-xs">
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {selectedIds.length} workspace{selectedIds.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-[11px]"
                  onClick={() => {
                    bulkActivate(selectedIds);
                    setSelectedIds([]);
                    addToast("success", "Bulk Activated", `Activated ${selectedIds.length} workspaces.`);
                  }}
                >
                  Activate All
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-[11px] text-rose-600 dark:text-rose-400"
                  onClick={() => {
                    bulkSuspend(selectedIds);
                    setSelectedIds([]);
                    addToast("info", "Bulk Suspended", `Suspended ${selectedIds.length} workspaces.`);
                  }}
                >
                  Suspend All
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-[11px]"
                  onClick={() => setSelectedIds([])}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Scrollable Clients Directory ────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-16 scrollbar-thin">
        <div className="rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/95 dark:bg-[#090D16]/95 backdrop-blur-md text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px] sticky top-0 z-10">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredClients.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-700 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3">Business & City</th>
                  <th className="px-4 py-3">Owner & Contact</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Health Score</th>
                  <th className="px-4 py-3">Scale</th>
                  <th className="px-4 py-3 text-right">MRR</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-500">
                      No client workspaces match the selected search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => {
                    const isSelected = selectedIds.includes(client.id);
                    return (
                      <tr
                        key={client.id}
                        className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                          isSelected ? "bg-rose-500/5 dark:bg-rose-500/10" : ""
                        }`}
                      >
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(client.id)}
                            className="rounded border-slate-300 dark:border-slate-700 text-rose-600 focus:ring-rose-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                              {client.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/platform/clients/${client.id}`}
                                className="font-bold text-slate-900 dark:text-white hover:text-rose-500 dark:hover:text-rose-400 transition-colors truncate block text-sm"
                              >
                                {client.name}
                              </Link>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {client.city}, {client.state}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div>
                            <span className="text-slate-900 dark:text-slate-200 block font-semibold">{client.ownerName}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{client.ownerPhone}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 capitalize text-slate-600 dark:text-slate-400">
                          {client.businessType.replace("_", " ")}
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => {
                              setPlanChangeClient(client);
                              setSelectedPlanTier(client.plan);
                              setSelectedCycle(client.billingCycle);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors cursor-pointer"
                            title="Click to override subscription plan"
                          >
                            <span>{client.plan.replace("_", " ")}</span>
                            <span className="text-[9px] opacity-75">({client.billingCycle})</span>
                          </button>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              client.status === "active"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : client.status === "grace_period"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                : client.status === "trial"
                                ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {client.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  client.healthScore >= 90
                                    ? "bg-emerald-500"
                                    : client.healthScore >= 70
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                }`}
                                style={{ width: `${client.healthScore}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {client.healthScore}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                          {client.tablesCount} Tables {client.roomsCount > 0 && `• ${client.roomsCount} Rooms`}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                          ₹{client.mrr.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setImpersonateClient(client)}
                              className="h-7 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                              title="Secure Impersonation (audited session)"
                            >
                              <ShieldAlert className="h-3 w-3" />
                              <span className="hidden sm:inline">Impersonate</span>
                            </button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-[11px]"
                              onClick={() => router.push(`/platform/clients/${client.id}`)}
                            >
                              Details
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modal: Change Subscription Plan ───────────────────────── */}
      {planChangeClient && (
        <Modal
          isOpen={!!planChangeClient}
          onClose={() => setPlanChangeClient(null)}
          title={`Override Plan • ${planChangeClient.name}`}
          description="Adjust tier, quotas, and billing cycle directly with platform super-admin authority."
        >
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Select Subscription Tier
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["starter", "growth", "hotel_pro", "enterprise"] as PlanTier[]).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setSelectedPlanTier(tier)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedPlanTier === tier
                        ? "border-rose-500 bg-rose-500/10 text-slate-900 dark:text-white font-bold shadow-xs"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <div className="text-xs font-black capitalize">{tier.replace("_", " ")}</div>
                    <div className="text-[11px] opacity-75 font-mono">
                      {tier === "starter"
                        ? "₹999/mo"
                        : tier === "growth"
                        ? "₹2,999/mo"
                        : tier === "hotel_pro"
                        ? "₹7,999/mo"
                        : "₹14,999/mo"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Billing Cycle
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCycle("monthly")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    selectedCycle === "monthly"
                      ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCycle("annual")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    selectedCycle === "annual"
                      ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Annual (20% Discount)
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setPlanChangeClient(null)}>
                Cancel
              </Button>
              <Button variant="glow" size="sm" className="bg-rose-600 hover:bg-rose-500 text-white" onClick={handleConfirmPlanChange}>
                Apply Plan Override
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Confirm Impersonation ─────────────────────────── */}
      {impersonateClient && (
        <Modal
          isOpen={!!impersonateClient}
          onClose={() => setImpersonateClient(null)}
          title={`Secure Impersonation • ${impersonateClient.name}`}
          description="You are about to enter this client's workspace with elevated Super Admin authority."
        >
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                <span>Audited Administrative Session</span>
              </div>
              <p className="leading-relaxed">
                Every action taken while impersonating <strong>{impersonateClient.name}</strong> will be cryptographically attributed to your platform account in the immutable audit ledger. A persistent exit banner will be displayed throughout the session.
              </p>
            </div>

            <div className="text-xs space-y-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Target Workspace:</span>
                <span className="font-bold text-slate-900 dark:text-white">{impersonateClient.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Workspace Slug:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{impersonateClient.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Owner Contact:</span>
                <span className="text-slate-700 dark:text-slate-300">{impersonateClient.ownerEmail}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setImpersonateClient(null)}>
                Cancel
              </Button>
              <Button
                variant="glow"
                size="sm"
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold"
                onClick={() => handleStartImpersonation(impersonateClient)}
              >
                Enter Workspace
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
