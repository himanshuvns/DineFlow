"use client";

import * as React from "react";
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Key,
  Lock,
  Eye,
  EyeOff,
  MoreVertical,
  Trash2,
  Edit,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Info,
  DollarSign,
  LifeBuoy,
  Sliders,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import {
  usePlatformStore,
  PlatformAdminUser,
  PlatformRole,
  CreateAdminPayload,
  UpdateAdminPayload,
} from "@/lib/stores/platform-store";

const ROLE_CONFIG: Record<
  PlatformRole,
  {
    label: string;
    description: string;
    badgeClass: string;
    icon: React.ElementType;
  }
> = {
  super_admin: {
    label: "Super Admin",
    description: "Full root control: team provisioning, tenant destruction, billing overrides & zero-trust configuration.",
    badgeClass:
      "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 font-bold",
    icon: ShieldCheck,
  },
  platform_admin: {
    label: "Platform Admin",
    description: "Operational management: client workspaces, feature flag toggles, maintenance & system health.",
    badgeClass:
      "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 font-bold",
    icon: Sliders,
  },
  finance_admin: {
    label: "Finance Admin",
    description: "Financial telemetry: ARR/MRR metrics, invoice dispute management, and subscription tier upgrades.",
    badgeClass:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold",
    icon: DollarSign,
  },
  support_agent: {
    label: "Support Agent",
    description: "Hospitality helpdesk: ticket triage, support communications, and read-only client telemetry.",
    badgeClass:
      "bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/30 font-bold",
    icon: LifeBuoy,
  },
};

export default function PlatformTeamPage() {
  const { toast } = useToast();
  const {
    platformAdmins,
    isLoadingAdmins,
    fetchPlatformAdmins,
    createPlatformAdmin,
    updatePlatformAdmin,
    resetPlatformAdminPassword,
    deletePlatformAdmin,
  } = usePlatformStore();

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // Add Admin Modal State
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [addForm, setAddForm] = React.useState<CreateAdminPayload>({
    name: "",
    email: "",
    phone: "",
    role: "platform_admin",
    password: "",
  });
  const [showAddPassword, setShowAddPassword] = React.useState(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = React.useState(false);

  // Edit Admin Modal State
  const [editAdmin, setEditAdmin] = React.useState<PlatformAdminUser | null>(null);
  const [editForm, setEditForm] = React.useState<UpdateAdminPayload>({
    name: "",
    phone: "",
    role: "platform_admin",
    status: "active",
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = React.useState(false);

  // Reset Password Modal State
  const [resetAdmin, setResetAdmin] = React.useState<PlatformAdminUser | null>(null);
  const [newPassword, setNewPassword] = React.useState("");
  const [showResetPassword, setShowResetPassword] = React.useState(false);
  const [isSubmittingReset, setIsSubmittingReset] = React.useState(false);

  // Revoke / Delete Confirm Modal State
  const [revokeAdmin, setRevokeAdmin] = React.useState<PlatformAdminUser | null>(null);
  const [isSubmittingRevoke, setIsSubmittingRevoke] = React.useState(false);

  React.useEffect(() => {
    fetchPlatformAdmins();
  }, [fetchPlatformAdmins]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPlatformAdmins();
    setIsRefreshing(false);
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*";
    let pwd = "";
    for (let i = 0; i < 14; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  };

  // Handlers
  const handleOpenAddModal = () => {
    setAddForm({
      name: "",
      email: "",
      phone: "",
      role: "platform_admin",
      password: generateRandomPassword(),
    });
    setShowAddPassword(true);
    setIsAddModalOpen(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.password.trim()) {
      toast({
        title: "Validation Error",
        description: "Administrator name, work email, and initial password are required.",
        variant: "destructive",
      });
      return;
    }
    if (addForm.password.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long for platform administrators.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingAdd(true);
    const success = await createPlatformAdmin({
      name: addForm.name.trim(),
      email: addForm.email.trim().toLowerCase(),
      phone: addForm.phone?.trim() || undefined,
      role: addForm.role,
      password: addForm.password,
    });
    setIsSubmittingAdd(false);

    if (success) {
      toast({
        title: "Administrator Provisioned",
        description: `Successfully provisioned ${addForm.name} as ${ROLE_CONFIG[addForm.role].label}.`,
      });
      setIsAddModalOpen(false);
      fetchPlatformAdmins();
    } else {
      toast({
        title: "Failed to Add Administrator",
        description: "An account with this email may already exist, or check your Super Admin session.",
        variant: "destructive",
      });
    }
  };

  const handleOpenEdit = (admin: PlatformAdminUser) => {
    setEditAdmin(admin);
    setEditForm({
      name: admin.name,
      phone: admin.phone || "",
      role: admin.role,
      status: admin.status,
    });
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAdmin) return;

    setIsSubmittingEdit(true);
    const success = await updatePlatformAdmin(editAdmin.id, {
      name: editForm.name?.trim(),
      phone: editForm.phone?.trim(),
      role: editForm.role,
      status: editForm.status,
    });
    setIsSubmittingEdit(false);

    if (success) {
      toast({
        title: "Profile Updated",
        description: `Updated access permissions for ${editAdmin.name}.`,
      });
      setEditAdmin(null);
      fetchPlatformAdmins();
    } else {
      toast({
        title: "Update Failed",
        description: "Could not update administrator profile.",
        variant: "destructive",
      });
    }
  };

  const handleOpenReset = (admin: PlatformAdminUser) => {
    setResetAdmin(admin);
    setNewPassword(generateRandomPassword());
    setShowResetPassword(true);
  };

  const handleSubmitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetAdmin) return;
    if (newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "New password must contain at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReset(true);
    const success = await resetPlatformAdminPassword(resetAdmin.id, newPassword);
    setIsSubmittingReset(false);

    if (success) {
      toast({
        title: "Password Reset Succeeded",
        description: `Password for ${resetAdmin.email} has been updated. All active sessions have been revoked.`,
      });
      setResetAdmin(null);
    } else {
      toast({
        title: "Password Reset Failed",
        description: "Failed to reset password. Please verify permissions.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmRevoke = async () => {
    if (!revokeAdmin) return;
    setIsSubmittingRevoke(true);
    const success = await deletePlatformAdmin(revokeAdmin.id);
    setIsSubmittingRevoke(false);

    if (success) {
      toast({
        title: "Administrator Revoked",
        description: `Platform privileges have been revoked for ${revokeAdmin.name}.`,
      });
      setRevokeAdmin(null);
      fetchPlatformAdmins();
    } else {
      toast({
        title: "Revocation Failed",
        description: "Could not revoke administrator. Root superadmin@dineflow.io cannot be deleted.",
        variant: "destructive",
      });
    }
  };

  // Filtered List
  const filteredAdmins = platformAdmins.filter((a) => {
    if (roleFilter !== "all" && a.role !== roleFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = a.name.toLowerCase().includes(q);
      const matchEmail = a.email.toLowerCase().includes(q);
      return matchName || matchEmail;
    }
    return true;
  });

  const superAdminsCount = platformAdmins.filter((a) => a.role === "super_admin").length;
  const platformAdminsCount = platformAdmins.filter((a) => a.role === "platform_admin").length;
  const financeAndSupportCount = platformAdmins.filter(
    (a) => a.role === "finance_admin" || a.role === "support_agent"
  ).length;

  return (
    <div className="space-y-6">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold mb-2">
            <ShieldCheck className="h-3.5 w-3.5" /> Platform Governance • RBAC Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Platform Administrators & Access Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Provision elevated platform operators, manage administrative privileges, reset credentials, and enforce zero-trust access.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-rose-500" : ""}`} />}
          >
            {isRefreshing ? "Syncing..." : "Sync Directory"}
          </Button>

          <Button
            variant="glow"
            size="sm"
            onClick={handleOpenAddModal}
            leftIcon={<UserPlus className="h-4 w-4" />}
            className="font-bold shadow-lg shadow-rose-500/20"
          >
            + Add Platform Admin
          </Button>
        </div>
      </div>

      {/* ── Super Admin Credentials & Authority Explainer ───────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0B0F19] to-slate-900 border border-slate-800 text-slate-200 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Root Super Admin Guide
              </span>
              <span className="text-xs font-mono text-slate-400">
                Seeded Identity: <strong className="text-white">superadmin@dineflow.io</strong>
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              As a <strong>Super Admin</strong>, you hold master platform authority. You can add new personal Super Admins, assign delegated roles (Platform Ops, Finance, Support), and reset credentials anytime. Root account <code className="px-1.5 py-0.5 rounded bg-slate-800 text-rose-300 font-mono text-[11px]">superadmin@dineflow.io</code> is locked to prevent accidental lockout.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleOpenAddModal}
              className="bg-white/10 hover:bg-white/20 text-white border-white/15 text-xs font-semibold"
              leftIcon={<Sparkles className="h-3.5 w-3.5 text-rose-400" />}
            >
              Provision New Admin
            </Button>
          </div>
        </div>
      </div>

      {/* ── Summary Stat Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Administrators
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {platformAdmins.length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All authorized for Platform Console
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Super Admins
                </p>
                <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                  {superAdminsCount}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-3 font-semibold">
              Root Authority & Team Control
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Operations & Security
                </p>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  {platformAdminsCount}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Sliders className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-3 font-semibold">
              Tenant & System Maintenance
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Finance & Support
                </p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {financeAndSupportCount}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-3 font-semibold">
              Revenue & Guest Inquiries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Table & Filter Container ────────────────────────────────── */}
      <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-200/80 dark:border-slate-800/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Platform Administrators Directory
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Manage all authorized accounts permitted to authenticate into the DineFlow Platform control plane.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search admin name or email..."
                  className="h-8 pl-8 text-xs bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2.5 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="platform_admin">Platform Admin</option>
                <option value="finance_admin">Finance Admin</option>
                <option value="support_agent">Support Agent</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2.5 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200/80 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Administrator</th>
                  <th className="px-5 py-3">Platform Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Joined Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60">
                {isLoadingAdmins && platformAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                      <RefreshCw className="h-6 w-6 animate-spin text-rose-500 mx-auto mb-2" />
                      Loading platform administrators...
                    </td>
                  </tr>
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                        <Users className="h-8 w-8 text-slate-400 dark:text-slate-600 mb-2" />
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          No Administrators Match Filter
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Try adjusting your search criteria or add a new administrator.
                        </p>
                        <Button
                          variant="glow"
                          size="sm"
                          onClick={handleOpenAddModal}
                          className="mt-3 font-bold"
                          leftIcon={<UserPlus className="h-3.5 w-3.5" />}
                        >
                          + Add Administrator
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => {
                    const roleInfo = ROLE_CONFIG[admin.role] || ROLE_CONFIG.platform_admin;
                    const RoleIcon = roleInfo.icon;
                    const isRoot = admin.email === "superadmin@dineflow.io";

                    return (
                      <tr
                        key={admin.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-rose-500/20 to-indigo-500/20 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 font-black text-xs uppercase shrink-0">
                              {admin.name.slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white truncate">
                                  {admin.name}
                                </span>
                                {isRoot && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30">
                                    Root Seed
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                                {admin.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] ${roleInfo.badgeClass}`}
                          >
                            <RoleIcon className="h-3 w-3" />
                            {roleInfo.label}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          {admin.status === "active" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              Suspended
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-400">
                          {admin.phone || "—"}
                        </td>

                        <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "Active"}
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(admin)}
                              className="h-7 px-2 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                              title="Edit Role & Permissions"
                            >
                              <Edit className="h-3.5 w-3.5 mr-1" />
                              Edit
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenReset(admin)}
                              className="h-7 px-2 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                              title="Reset Password"
                            >
                              <Key className="h-3.5 w-3.5 mr-1" />
                              Reset
                            </Button>

                            {!isRoot ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRevokeAdmin(admin)}
                                className="h-7 px-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                title="Revoke Administrator Access"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            ) : (
                              <span
                                className="text-[10px] font-mono text-slate-400 px-2"
                                title="Root Super Admin account cannot be revoked to prevent platform lockout."
                              >
                                [Protected]
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Modal: Add Administrator ────────────────────────────────── */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Provision Platform Administrator"
        description="Create an elevated platform administrator account with specific role-based permissions."
        size="lg"
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="e.g. Himanshu Singh"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Work Email <span className="text-rose-500">*</span>
              </label>
              <Input
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                placeholder="admin@yourcompany.com"
                className="h-9 text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Phone Number (Optional)
              </label>
              <Input
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Platform Role <span className="text-rose-500">*</span>
              </label>
              <select
                value={addForm.role}
                onChange={(e) => setAddForm({ ...addForm, role: e.target.value as PlatformRole })}
                className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs text-slate-900 dark:text-slate-100 font-semibold"
              >
                <option value="super_admin">Super Admin (Full Root Authority)</option>
                <option value="platform_admin">Platform Admin (Operations & Tenants)</option>
                <option value="finance_admin">Finance Admin (Revenue & Invoices)</option>
                <option value="support_agent">Support Agent (Triage & Helpdesk)</option>
              </select>
            </div>
          </div>

          {/* Role Description Callout */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-xs flex items-start gap-2.5">
            <Info className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                {ROLE_CONFIG[addForm.role].label} Authority
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                {ROLE_CONFIG[addForm.role].description}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Initial Password <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setAddForm({ ...addForm, password: generateRandomPassword() })}
                className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-semibold flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" /> Generate Secure Password
              </button>
            </div>
            <div className="relative">
              <Input
                type={showAddPassword ? "text" : "password"}
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                placeholder="At least 8 characters"
                className="h-9 pr-10 text-xs font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowAddPassword(!showAddPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showAddPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Provide this temporary password securely to the administrator. They can sign in at <strong className="text-slate-700 dark:text-slate-300">/platform/login</strong>.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="glow"
              size="sm"
              disabled={isSubmittingAdd}
              leftIcon={<ShieldCheck className="h-4 w-4" />}
              className="font-bold"
            >
              {isSubmittingAdd ? "Provisioning..." : "Provision Administrator"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Edit Administrator ───────────────────────────────── */}
      <Modal
        isOpen={!!editAdmin}
        onClose={() => setEditAdmin(null)}
        title="Edit Administrator Permissions"
        description={`Modify administrative role and status for ${editAdmin?.name}.`}
        size="md"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Full Name
            </label>
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Phone Number
            </label>
            <Input
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Platform Role
            </label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value as PlatformRole })}
              className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs text-slate-900 dark:text-slate-100 font-semibold"
            >
              <option value="super_admin">Super Admin (Full Root Authority)</option>
              <option value="platform_admin">Platform Admin (Operations & Tenants)</option>
              <option value="finance_admin">Finance Admin (Revenue & Invoices)</option>
              <option value="support_agent">Support Agent (Triage & Helpdesk)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Account Status
            </label>
            <select
              value={editForm.status}
              onChange={(e) =>
                setEditForm({ ...editForm, status: e.target.value as "active" | "suspended" })
              }
              className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs text-slate-900 dark:text-slate-100 font-semibold"
            >
              <option value="active">Active (Access Allowed)</option>
              <option value="suspended">Suspended (Access Blocked)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setEditAdmin(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="glow"
              size="sm"
              disabled={isSubmittingEdit}
              className="font-bold"
            >
              {isSubmittingEdit ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Reset Password ───────────────────────────────────── */}
      <Modal
        isOpen={!!resetAdmin}
        onClose={() => setResetAdmin(null)}
        title="Reset Administrator Password"
        description={`Set a new secure password for ${resetAdmin?.name} (${resetAdmin?.email}).`}
        size="md"
      >
        <form onSubmit={handleSubmitReset} className="space-y-4 pt-2">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p>
              Resetting this password will <strong>immediately revoke all active browser sessions</strong> for this administrator across all devices.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <button
                type="button"
                onClick={() => setNewPassword(generateRandomPassword())}
                className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-semibold flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" /> Generate Secure
              </button>
            </div>
            <div className="relative">
              <Input
                type={showResetPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="h-9 pr-10 text-xs font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowResetPassword(!showResetPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setResetAdmin(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="glow"
              size="sm"
              disabled={isSubmittingReset}
              className="font-bold bg-amber-600 hover:bg-amber-500 text-white"
            >
              {isSubmittingReset ? "Updating..." : "Update Password & Revoke Sessions"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Confirm Revoke / Delete ──────────────────────────── */}
      <Modal
        isOpen={!!revokeAdmin}
        onClose={() => setRevokeAdmin(null)}
        title="Revoke Administrator Access"
        description="Are you sure you want to revoke platform access for this user?"
        size="md"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-200 space-y-1">
            <p className="font-bold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              Revocation Notice
            </p>
            <p className="text-[11px] leading-relaxed">
              This action will deactivate <strong>{revokeAdmin?.name}</strong> ({revokeAdmin?.email}) and instantly blacklist all active session tokens in Redis. They will no longer be able to log in to the Platform Console.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setRevokeAdmin(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isSubmittingRevoke}
              onClick={handleConfirmRevoke}
              className="font-bold"
            >
              {isSubmittingRevoke ? "Revoking..." : "Revoke Access"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
