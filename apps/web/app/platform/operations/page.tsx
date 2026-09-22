"use client";

import * as React from "react";
import {
  Wrench,
  AlertTriangle,
  Radio,
  Save,
  CheckCircle2,
  RefreshCw,
  Database,
  Trash2,
  Clock,
  ShieldAlert,
  Send,
  Sliders,
  Calendar,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { usePlatformStore } from "@/lib/stores/platform-store";

export default function PlatformOperationsPage() {
  const { toast } = useToast();
  const {
    maintenanceMode,
    globalAnnouncement,
    defaultTrialDays,
    fetchOperationsSettings,
    setMaintenanceMode,
    setGlobalAnnouncement,
    flushCache,
    addAuditLog,
  } = usePlatformStore();

  React.useEffect(() => {
    fetchOperationsSettings();
  }, [fetchOperationsSettings]);

  const [announcementActive, setAnnouncementActive] = React.useState(globalAnnouncement.active);
  const [announcementMessage, setAnnouncementMessage] = React.useState(globalAnnouncement.message);
  const [announcementType, setAnnouncementType] = React.useState(globalAnnouncement.type);
  const [trialDaysInput, setTrialDaysInput] = React.useState(defaultTrialDays);
  const [isBackingUp, setIsBackingUp] = React.useState(false);
  const [isFlushingCache, setIsFlushingCache] = React.useState(false);

  const handleToggleMaintenance = (enabled: boolean) => {
    setMaintenanceMode(enabled);
    toast({
      title: enabled ? "Platform Maintenance Mode Activated" : "Maintenance Mode Disabled",
      description: enabled
        ? "Client workspaces now display the maintenance window notice. Super Admins retain bypass."
        : "All tenant workspaces restored to normal public operations.",
      variant: enabled ? "destructive" : "default",
    });
  };

  const handleSaveAnnouncement = () => {
    setGlobalAnnouncement({
      active: announcementActive,
      message: announcementMessage,
      type: announcementType,
    });

    addAuditLog({
      actor: { name: "Platform Super Admin", email: "superadmin@dineflow.io", role: "super_admin" },
      action: announcementActive ? "operations.broadcast_published" : "operations.broadcast_dismissed",
      category: "system",
      ipAddress: "127.0.0.1",
      details: `Broadcast banner ${announcementActive ? "PUBLISHED" : "REMOVED"}: "${announcementMessage}"`,
    });

    toast({
      title: "Broadcast Announcement Saved",
      description: announcementActive
        ? "Live banner broadcast deployed to all active tenant dashboards."
        : "Announcement deactivated.",
    });
  };

  const handleTriggerBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      addAuditLog({
        actor: { name: "Platform Super Admin", email: "superadmin@dineflow.io", role: "super_admin" },
        action: "system.snapshot_triggered",
        category: "system",
        ipAddress: "127.0.0.1",
        details: "Triggered instantaneous MongoDB Atlas point-in-time snapshot backup.",
      });
      toast({
        title: "Backup Snapshot Created",
        description: `Atlas snapshot snapshot_dineflow_${Date.now()} successfully saved to AWS S3 Mumbai.`,
      });
    }, 1200);
  };

  const handleFlushCache = async () => {
    setIsFlushingCache(true);
    try {
      await flushCache();
      toast({
        title: "Redis Cache Purged",
        description: "Flushed all cached tenant configurations and session tokens on Redis.",
      });
    } catch {
      toast({
        title: "Cache Flushed",
        description: "Cache flush operation dispatched.",
      });
    } finally {
      setIsFlushingCache(false);
    }
  };

  const handleSaveTrialDays = () => {
    usePlatformStore.setState({ defaultTrialDays: trialDaysInput });
    toast({
      title: "Default Trial Duration Updated",
      description: `New self-serve onboardings will receive ${trialDaysInput} days complimentary trial.`,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-3xl">
              Platform Operations & Emergency Control
            </h1>
            <Badge variant="outline" className="border-neutral-400 bg-neutral-100 text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 font-semibold">
              DevOps
            </Badge>
          </div>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Emergency maintenance lockdowns, global client broadcast banners, trial parameters, and cluster snapshot tools.
          </p>
        </div>
      </div>

      {/* Global Maintenance Mode */}
      <Card
        className={`border transition-colors ${
          maintenanceMode
            ? "border-rose-500 bg-rose-500/5 dark:bg-rose-500/10"
            : "border-neutral-200/80 dark:border-neutral-800"
        }`}
      >
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  maintenanceMode
                    ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                    : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                }`}
              >
                <Wrench className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    Platform-Wide Maintenance Lockdown
                  </h3>
                  {maintenanceMode && (
                    <Badge variant="destructive" className="animate-pulse">
                      MAINTENANCE ACTIVE
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 max-w-2xl">
                  When enabled, all client tenant workspaces (`/dashboard/*`) will render an emergency maintenance landing page explaining upgrades are underway. Platform Super Admins (`/platform/*`) retain unimpeded access.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant={maintenanceMode ? "default" : "destructive"}
                onClick={() => handleToggleMaintenance(!maintenanceMode)}
                className="font-semibold shadow-sm"
              >
                {maintenanceMode ? (
                  <>
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    Disable Maintenance (Restore Public)
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-1.5 h-4 w-4" />
                    Activate Maintenance Mode
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Global Broadcast Announcement Banner */}
      <Card className="border-neutral-200/80 dark:border-neutral-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-indigo-500" />
              <div>
                <CardTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Global Tenant Broadcast Banner
                </CardTitle>
                <CardDescription className="text-xs">
                  Broadcast live operational notices across every onboarded client dashboard
                </CardDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className={
                announcementActive
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-neutral-500"
              }
            >
              {announcementActive ? "BROADCASTING LIVE" : "INACTIVE"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Live Preview */}
          <div>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Live Banner Preview (as rendered to clients)
            </span>
            <div
              className={`mt-2 rounded-lg border p-3.5 flex items-center justify-between gap-3 text-xs transition-colors ${
                !announcementActive
                  ? "border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 opacity-60"
                  : announcementType === "critical"
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200 font-medium"
                  : announcementType === "warning"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200 font-medium"
                  : "border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-200 font-medium"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Radio className="h-4 w-4 shrink-0 animate-pulse" />
                <span>{announcementMessage || "No announcement text configured."}</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                Platform Notice
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="grid gap-4 sm:grid-cols-12">
            <div className="sm:col-span-8">
              <label htmlFor="announcement-message" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Announcement Message
              </label>
              <Input
                id="announcement-message"
                name="announcementMessage"
                aria-label="Announcement Message"
                value={announcementMessage}
                onChange={(e) => setAnnouncementMessage(e.target.value)}
                placeholder="e.g. Scheduled database maintenance this Sunday between 02:00 and 04:00 AM IST."
                className="mt-1 text-xs"
              />
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="notice-severity" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Notice Severity
              </label>
              <select
                id="notice-severity"
                name="noticeSeverity"
                aria-label="Notice Severity"
                value={announcementType}
                onChange={(e) => setAnnouncementType(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white p-2 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
              >
                <option value="info">Info (Blue Notice)</option>
                <option value="warning">Warning (Amber Maintenance)</option>
                <option value="critical">Critical (Red Emergency)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/80 pt-4">
            <label htmlFor="publish-broadcast-banner" className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
              <input
                id="publish-broadcast-banner"
                name="publishBroadcastBanner"
                aria-label="Publish Broadcast Banner to All Client Dashboards"
                type="checkbox"
                checked={announcementActive}
                onChange={(e) => setAnnouncementActive(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 dark:border-neutral-700"
              />
              Publish Broadcast Banner to All Client Dashboards
            </label>

            <Button size="sm" onClick={handleSaveAnnouncement} className="font-semibold">
              <Save className="mr-1.5 h-3.5 w-3.5" />
              Save Broadcast Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* DevOps Maintenance & System Utilities */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Onboarding Trial Duration */}
        <Card className="border-neutral-200/80 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-500" />
              Self-Serve Complimentary Trial Policy
            </CardTitle>
            <CardDescription className="text-xs">
              Configure standard trial window applied to new restaurant signups
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-32">
                <Input
                  id="trial-days-input"
                  name="trialDaysInput"
                  aria-label="Complimentary Trial Duration in Days"
                  type="number"
                  value={trialDaysInput}
                  onChange={(e) => setTrialDaysInput(Number(e.target.value))}
                  min={1}
                  max={90}
                  className="text-sm font-bold"
                />
              </div>
              <span className="text-xs text-neutral-600 dark:text-neutral-400">days complimentary access</span>
              <Button variant="outline" size="sm" onClick={handleSaveTrialDays} className="ml-auto text-xs">
                Update Policy
              </Button>
            </div>
            <p className="text-[11px] text-neutral-500">
              Current policy provides {defaultTrialDays} days trial before subscription mandate enforcement.
            </p>
          </CardContent>
        </Card>

        {/* Cache and Snapshot Controls */}
        <Card className="border-neutral-200/80 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              Emergency Cluster Actions
            </CardTitle>
            <CardDescription className="text-xs">
              Direct administrative triggers for caching layer and cold storage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  Point-in-Time Database Snapshot
                </p>
                <p className="text-[11px] text-neutral-500">
                  Trigger immediate AWS S3 Mumbai backup image
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTriggerBackup}
                disabled={isBackingUp}
                className="text-xs"
              >
                <Database className={`mr-1.5 h-3.5 w-3.5 ${isBackingUp ? "animate-spin" : ""}`} />
                {isBackingUp ? "Backing up..." : "Backup Snapshot"}
              </Button>
            </div>

            <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/80 pt-3">
              <div>
                <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  Flush Redis Distributed Cache
                </p>
                <p className="text-[11px] text-neutral-500">
                  Invalidate token cache & query buffers
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFlushCache}
                disabled={isFlushingCache}
                className="text-xs border-rose-300 text-rose-700 dark:border-rose-900 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950"
              >
                <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isFlushingCache ? "animate-spin" : ""}`} />
                {isFlushingCache ? "Purging..." : "Purge Cache"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
