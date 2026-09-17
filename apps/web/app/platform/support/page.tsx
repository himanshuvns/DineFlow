"use client";

import * as React from "react";
import {
  LifeBuoy,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  Send,
  Building2,
  User,
  Tag,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { usePlatformStore, SupportTicket } from "@/lib/stores/platform-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useRouter } from "next/navigation";

export default function PlatformSupportPage() {
  const { toast } = useToast();
  const router = useRouter();
  const {
    supportTickets,
    clients,
    fetchSupportTickets,
    fetchClients,
    createSupportTicket,
    updateSupportTicketStatus,
    addTicketInternalNote,
  } = usePlatformStore();
  const startImpersonation = useAuthStore((s) => s.startImpersonation);

  React.useEffect(() => {
    fetchSupportTickets();
    fetchClients();
  }, [fetchSupportTickets, fetchClients]);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all");
  const [selectedTicket, setSelectedTicket] = React.useState<SupportTicket | null>(null);
  const [newNote, setNewNote] = React.useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  // New ticket state
  const [newTenantId, setNewTenantId] = React.useState(clients[0]?.id || "");
  const [newSubject, setNewSubject] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");
  const [newPriority, setNewPriority] = React.useState<SupportTicket["priority"]>("medium");
  const [newCategory, setNewCategory] = React.useState<SupportTicket["category"]>("technical");

  const openCount = supportTickets.filter((t) => t.status === "open").length;
  const inProgressCount = supportTickets.filter((t) => t.status === "in_progress").length;
  const resolvedCount = supportTickets.filter((t) => t.status === "resolved").length;
  const urgentCount = supportTickets.filter((t) => t.priority === "urgent" && t.status !== "resolved").length;

  const filteredTickets = supportTickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleStatusChange = (ticketId: string, newStatus: SupportTicket["status"]) => {
    updateSupportTicketStatus(ticketId, newStatus);
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
    toast({
      title: "Status Updated",
      description: `Ticket ${ticketId} status changed to ${newStatus.toUpperCase().replace("_", " ")}.`,
    });
  };

  const handleAddNote = () => {
    if (!selectedTicket || !newNote.trim()) return;
    addTicketInternalNote(selectedTicket.id, newNote.trim());
    setSelectedTicket({
      ...selectedTicket,
      internalNotes: [...selectedTicket.internalNotes, newNote.trim()],
    });
    setNewNote("");
    toast({
      title: "Internal Note Appended",
      description: "Note saved to ticket history.",
    });
  };

  const handleImpersonateClient = (tenantId: string) => {
    const client = clients.find((c) => c.id === tenantId);
    if (!client) return;

    startImpersonation({
      id: client.id,
      name: client.name,
      slug: client.slug,
      type: client.businessType,
      plan: client.plan,
      currency: client.currency,
      onboardingCompleted: true,
    } as any);

    toast({
      title: "Entering Impersonation",
      description: `Logging into ${client.name} workspace with full audit trail.`,
    });

    router.push("/dashboard");
  };

  const handleCreateTicket = async () => {
    if (!newSubject.trim() || !newDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a subject and detailed description.",
        variant: "destructive",
      });
      return;
    }

    try {
      const ticket = await createSupportTicket({
        tenantId: newTenantId,
        subject: newSubject,
        description: newDescription,
        priority: newPriority,
        category: newCategory,
        assignedAgent: "Aarav Sharma",
      });

      toast({
        title: "Ticket Logged",
        description: `Support inquiry ${ticket?.id || "TCK"} assigned to Level 2 support and persisted to database.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Could not create support ticket.",
        variant: "destructive",
      });
    }

    setIsCreateModalOpen(false);
    setNewSubject("");
    setNewDescription("");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-3xl">
              Support Desk & Incident Queue
            </h1>
            <Badge variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold">
              Live Queue
            </Badge>
          </div>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Omni-channel ticket resolution, client diagnostics, and direct workspace impersonation assistance.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Log Incident Ticket
        </Button>
      </div>

      {/* SLA & Status KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-neutral-200/80 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Open Tickets</span>
            <AlertCircle className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{openCount}</span>
            {urgentCount > 0 && (
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                ({urgentCount} urgent)
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">Pending agent assignment</p>
        </Card>

        <Card className="border-neutral-200/80 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">In Progress</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {inProgressCount}
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">Under investigation</p>
        </Card>

        <Card className="border-neutral-200/80 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Resolved (30d)</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {resolvedCount}
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">100% CSAT feedback</p>
        </Card>

        <Card className="border-neutral-200/80 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Avg Resolution SLA</span>
            <LifeBuoy className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            18 mins
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            Exceeding 60m SLA target
          </p>
        </Card>
      </div>

      {/* Main Layout: Ticket List & Drawer */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Ticket List */}
        <Card className="lg:col-span-7 border-neutral-200/80 dark:border-neutral-800">
          <CardHeader className="p-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tickets by ID, subject, tenant..."
                  className="h-8 pl-8 text-xs bg-white dark:bg-neutral-900"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-8 rounded-lg border border-neutral-200 bg-white px-2 text-xs text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="h-8 rounded-lg border border-neutral-200 bg-white px-2 text-xs text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 divide-y divide-neutral-200 dark:divide-neutral-800 max-h-[600px] overflow-y-auto">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`cursor-pointer p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50 ${
                  selectedTicket?.id === ticket.id
                    ? "bg-neutral-100/80 dark:bg-neutral-900 border-l-4 border-l-neutral-900 dark:border-l-neutral-100"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        {ticket.id}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-bold ${
                          ticket.priority === "urgent"
                            ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                            : ticket.priority === "high"
                            ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            : "border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400"
                        }`}
                      >
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] uppercase text-neutral-600 dark:text-neutral-400">
                        {ticket.category}
                      </Badge>
                    </div>

                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {ticket.subject}
                    </h3>

                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        ticket.status === "open"
                          ? "bg-sky-500/10 text-sky-700 dark:text-sky-400"
                          : ticket.status === "in_progress"
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      }`}
                    >
                      {ticket.status.replace("_", " ")}
                    </span>
                    <div className="mt-1 text-[10px] text-neutral-600 dark:text-neutral-400">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-400">
                  <span className="flex items-center gap-1 font-medium text-neutral-700 dark:text-neutral-300">
                    <Building2 className="h-3 w-3" /> {ticket.tenantName}
                  </span>
                  <span>Assigned: {ticket.assignedAgent}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Ticket Inspector Detail Drawer */}
        <Card className="lg:col-span-5 border-neutral-200/80 dark:border-neutral-800">
          {selectedTicket ? (
            <div className="flex h-full flex-col">
              <CardHeader className="p-4 border-b border-neutral-200 dark:border-neutral-800 pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100">
                        {selectedTicket.id}
                      </span>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {selectedTicket.category}
                      </Badge>
                    </div>
                    <CardTitle className="mt-1 text-base font-bold text-neutral-900 dark:text-neutral-100">
                      {selectedTicket.subject}
                    </CardTitle>
                  </div>
                </div>

                {/* Status switcher */}
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-neutral-100 dark:border-neutral-800/80 pt-2">
                  <span className="text-xs font-medium text-neutral-500">Status:</span>
                  <div className="flex items-center gap-1">
                    {(["open", "in_progress", "resolved"] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(selectedTicket.id, st)}
                        className={`rounded px-2 py-0.5 text-[11px] font-semibold uppercase transition-colors ${
                          selectedTicket.status === st
                            ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400"
                        }`}
                      >
                        {st.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto">
                {/* Description */}
                <div>
                  <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Client Inbound Report
                  </h4>
                  <p className="mt-1 text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed bg-neutral-50 dark:bg-neutral-900/60 p-3 rounded-lg border border-neutral-200/60 dark:border-neutral-800">
                    {selectedTicket.description}
                  </p>
                </div>

                {/* Tenant Context & Quick Impersonate */}
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50/50 dark:bg-neutral-900/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                        {selectedTicket.tenantName}
                      </span>
                      <p className="text-[11px] text-neutral-500 font-mono">
                        Tenant ID: {selectedTicket.tenantId}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleImpersonateClient(selectedTicket.tenantId)}
                      className="h-7 text-xs border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
                    >
                      <ShieldAlert className="mr-1 h-3.5 w-3.5" />
                      Impersonate Workspace
                    </Button>
                  </div>
                </div>

                {/* Internal Notes History */}
                <div>
                  <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                    Internal Agent Notes ({selectedTicket.internalNotes.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedTicket.internalNotes.map((note, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg bg-neutral-100 dark:bg-neutral-800/80 p-2.5 text-xs text-neutral-700 dark:text-neutral-300"
                      >
                        {note}
                      </div>
                    ))}
                  </div>

                  {/* Add note */}
                  <div className="mt-3 flex gap-2">
                    <Input
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add private staff note..."
                      className="h-8 text-xs bg-white dark:bg-neutral-900"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddNote();
                      }}
                    />
                    <Button size="sm" onClick={handleAddNote} className="h-8 px-3">
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center p-8 text-center text-neutral-500">
              <LifeBuoy className="h-8 w-8 stroke-1 text-neutral-400 mb-2" />
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                No Ticket Selected
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Select a support incident from the queue to view full audit logs, add internal staff notes, or impersonate the client workspace.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Log Ticket Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Log Inbound Support Incident"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Client Workspace
            </label>
            <select
              value={newTenantId}
              onChange={(e) => setNewTenantId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 bg-white p-2 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.city})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white p-2 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white p-2 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
              >
                <option value="technical">Technical</option>
                <option value="whatsapp">WhatsApp Bot</option>
                <option value="billing">Billing</option>
                <option value="hardware">Hardware / QR</option>
                <option value="onboarding">Onboarding</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Subject
            </label>
            <Input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="e.g. Inbound WhatsApp orders failing delivery"
              className="mt-1 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Description & Reproduction Steps
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
              placeholder="Detailed description of the customer issue..."
              className="mt-1 w-full rounded-lg border border-neutral-300 bg-white p-2 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateTicket}>
              Create Ticket
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
