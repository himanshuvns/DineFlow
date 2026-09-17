"use client";

import * as React from "react";
import {
  ShieldAlert,
  Search,
  Download,
  Filter,
  Calendar,
  Lock,
  User,
  Building2,
  Terminal,
  Clock,
  Eye,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { usePlatformStore, AuditLogEntry } from "@/lib/stores/platform-store";

export default function PlatformAuditLogsPage() {
  const { toast } = useToast();
  const { auditLogs, fetchAuditLogs, downloadCsvExport } = usePlatformStore();

  React.useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [inspectedLog, setInspectedLog] = React.useState<AuditLogEntry | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesCategory = selectedCategory === "all" || log.category === selectedCategory;
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.targetName && log.targetName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const handleExportCsv = async () => {
    try {
      await downloadCsvExport("audit_logs");
      toast({
        title: "Audit Trail Exported",
        description: `Exported verified compliance ledger entries to CSV.`,
      });
    } catch {
      const headers = "ID,Timestamp,Actor Name,Actor Email,Actor Role,Action,Category,Target,IP Address,Details\n";
      const rows = filteredLogs
        .map(
          (l) =>
            `"${l.id}","${l.timestamp}","${l.actor.name}","${l.actor.email}","${l.actor.role}","${l.action}","${l.category}","${l.targetName || l.targetId || "N/A"}","${l.ipAddress}","${l.details.replace(/"/g, '""')}"`
        )
        .join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dineflow_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();

      toast({
        title: "Audit Trail Exported",
        description: `Exported ${filteredLogs.length} verified ledger entries to CSV.`,
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-3xl">
              Platform Audit Logs & Security Trail
            </h1>
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
              Immutable Ledger
            </Badge>
          </div>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Append-only compliance audit trail recording all administrative actions, impersonations, quota edits, and system changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="border-neutral-200 dark:border-neutral-800"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export Compliance CSV
          </Button>
        </div>
      </div>

      {/* Audit Search & Filter Bar */}
      <Card className="border-neutral-200/80 dark:border-neutral-800">
        <CardHeader className="p-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by action, actor, target tenant, IP, or details..."
                className="h-8 pl-8 text-xs bg-white dark:bg-neutral-900"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-8 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
              >
                <option value="all">All Categories</option>
                <option value="subscription">Subscription & Billing</option>
                <option value="client">Client Lifecycle</option>
                <option value="security">Security & Impersonation</option>
                <option value="feature_flag">Feature Flags</option>
                <option value="system">System & Operations</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Timestamp (UTC)</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Action Event</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Target Scope</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-neutral-50/75 dark:hover:bg-neutral-900/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-[11px] text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {log.actor.name}
                      </div>
                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400 font-mono">
                        {log.actor.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-bold ${
                          log.category === "security"
                            ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                            : log.category === "subscription"
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : log.category === "feature_flag"
                            ? "border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300"
                            : "border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400"
                        }`}
                      >
                        {log.category.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                      {log.targetName || log.targetId || "Global System"}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
                      {log.ipAddress}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setInspectedLog(log)}
                        className="h-7 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Log Inspector Modal */}
      {inspectedLog && (
        <Modal
          isOpen={Boolean(inspectedLog)}
          onClose={() => setInspectedLog(null)}
          title="Audit Log Event Inspection"
        >
          <div className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div>
                <span className="text-neutral-500 font-semibold uppercase text-[10px]">Log Event ID</span>
                <p className="font-mono font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {inspectedLog.id}
                </p>
              </div>
              <div>
                <span className="text-neutral-500 font-semibold uppercase text-[10px]">Exact Timestamp</span>
                <p className="font-mono text-neutral-800 dark:text-neutral-200 mt-0.5">
                  {inspectedLog.timestamp}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div>
                <span className="text-neutral-500 font-semibold uppercase text-[10px]">Action Performed</span>
                <p className="font-mono font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {inspectedLog.action}
                </p>
              </div>
              <div>
                <span className="text-neutral-500 font-semibold uppercase text-[10px]">Security Category</span>
                <p className="font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5 uppercase">
                  {inspectedLog.category}
                </p>
              </div>
            </div>

            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <span className="text-neutral-500 font-semibold uppercase text-[10px]">Initiating Actor</span>
              <div className="mt-1 rounded-lg bg-neutral-50 dark:bg-neutral-900 p-2.5 border border-neutral-200 dark:border-neutral-800">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {inspectedLog.actor.name} ({inspectedLog.actor.role})
                </p>
                <p className="text-neutral-500 font-mono text-[11px]">{inspectedLog.actor.email}</p>
                <p className="text-neutral-500 font-mono text-[11px]">IP: {inspectedLog.ipAddress}</p>
              </div>
            </div>

            <div>
              <span className="text-neutral-500 font-semibold uppercase text-[10px]">Event Payload & Description</span>
              <p className="mt-1 rounded-lg bg-neutral-50 dark:bg-neutral-900 p-3 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 leading-relaxed font-mono text-[11px]">
                {inspectedLog.details}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setInspectedLog(null)}>
                Close Inspector
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
