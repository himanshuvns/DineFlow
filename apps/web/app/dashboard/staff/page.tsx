"use client";

import * as React from "react";
import { UserPlus, Shield, Mail, MoreVertical, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api";
import { Trash2 } from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  status: string;
}

export default function StaffPage() {
  const { addToast } = useToast();
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [inviteName, setInviteName] = React.useState("");
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState("waiter");
  const [staffList, setStaffList] = React.useState<StaffMember[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchStaff = React.useCallback(async () => {
    try {
      const res = await apiClient.get("/staff");
      if (res.data?.data && Array.isArray(res.data.data)) {
        setStaffList(
          res.data.data.map((u: any) => ({
            id: u.id || u._id,
            name: u.name || "Staff Member",
            email: u.email || "",
            phone: u.phone || "",
            role: u.role || "waiter",
            status: u.status || "active",
          }))
        );
      }
    } catch (e) {
      console.warn("Staff fetch fallback:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post("/staff/invite", {
        name: inviteName.trim() || inviteEmail.split("@")[0],
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      addToast(
        "success",
        "Invitation Sent!",
        `Sent role invitation email to ${inviteEmail}`
      );
      setIsInviteOpen(false);
      setInviteName("");
      setInviteEmail("");
      fetchStaff();
    } catch (err: any) {
      addToast(
        "error",
        "Invite Failed",
        err?.response?.data?.error || "Could not create team invite."
      );
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    try {
      await apiClient.delete(`/staff/${id}`);
      addToast("info", "Staff Removed", `Removed ${name} from this workspace.`);
      setStaffList((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      addToast("error", "Remove Failed", "Could not remove staff member.");
    }
  };

  const displayStaff =
    staffList.length > 0
      ? staffList
      : [
          { id: "usr_1", name: "Jean Laurent", email: "laurent@thegrandbistro.com", role: "owner", status: "active" },
          { id: "usr_2", name: "Sarah Jenkins", email: "sarah.j@thegrandbistro.com", role: "manager", status: "active" },
          { id: "usr_3", name: "Chef Marco Rossi", email: "marco.kitchen@thegrandbistro.com", role: "kitchen", status: "active" },
          { id: "usr_4", name: "David Chen", email: "david.c@thegrandbistro.com", role: "waiter", status: "active" },
        ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Enterprise Role-Based Access Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Staff & Permissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Invite managers, captains, and kitchen chefs with granular workspace permissions.
          </p>
        </div>

        <Button
          variant="glow"
          size="sm"
          leftIcon={<UserPlus className="h-4 w-4" />}
          onClick={() => setIsInviteOpen(true)}
        >
          Invite Staff Member
        </Button>
      </div>

      <Card variant="glass">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 pl-6">Staff Member</th>
                <th className="py-3.5">Assigned Role</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {displayStaff.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar fallback={member.name} size="sm" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{member.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{member.email || member.phone || "No contact info"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="capitalize font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/60">
                      {member.role}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <Badge variant={member.status === "active" ? "success" : "warning"} dot size="sm">
                      {member.status === "active" ? "Active" : "Invitation Pending"}
                    </Badge>
                  </td>
                  <td className="py-3.5 text-right pr-6">
                    {member.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                        onClick={() => handleDeleteStaff(member.id, member.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Remove
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Invite Staff Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Team Member"
        description="We'll send an invitation link allowing them to join your workspace."
      >
        <form onSubmit={handleSendInvite} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Sarah Jenkins"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="colleague@restaurant.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            leftIcon={<Mail className="h-4 w-4" />}
          />

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full rounded-xl text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 outline-none focus:border-emerald-500"
            >
              <option value="manager">Manager (Can edit menus & view analytics)</option>
              <option value="chef">Kitchen Chef (KDS access only)</option>
              <option value="waiter">Floor Waiter (Table orders & status)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button variant="glow" type="submit">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
