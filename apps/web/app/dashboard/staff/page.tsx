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

const STAFF_MEMBERS = [
  { id: "usr_1", name: "Jean Laurent", email: "laurent@thegrandbistro.com", role: "owner", status: "active" },
  { id: "usr_2", name: "Sarah Jenkins", email: "sarah.j@thegrandbistro.com", role: "manager", status: "active" },
  { id: "usr_3", name: "Chef Marco Rossi", email: "marco.kitchen@thegrandbistro.com", role: "kitchen", status: "active" },
  { id: "usr_4", name: "David Chen", email: "david.c@thegrandbistro.com", role: "waiter", status: "active" },
  { id: "usr_5", name: "Emily Watson", email: "emily.w@thegrandbistro.com", role: "waiter", status: "invited" },
];

export default function StaffPage() {
  const { addToast } = useToast();
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState("waiter");

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    addToast("success", "Invitation Sent!", `Sent role invitation email to ${inviteEmail}`);
    setIsInviteOpen(false);
    setInviteEmail("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Enterprise Role-Based Access Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Staff & Permissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
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
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 pl-6">Staff Member</th>
                <th className="py-3.5">Assigned Role</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {STAFF_MEMBERS.map((member) => (
                <tr key={member.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar fallback={member.name} size="sm" />
                      <div>
                        <p className="font-semibold text-white">{member.name}</p>
                        <p className="text-[11px] text-slate-400">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="capitalize font-medium text-slate-200 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                      {member.role}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <Badge variant={member.status === "active" ? "success" : "warning"} dot size="sm">
                      {member.status === "active" ? "Active" : "Invitation Pending"}
                    </Badge>
                  </td>
                  <td className="py-3.5 text-right pr-6">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
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
            label="Email Address"
            type="email"
            placeholder="colleague@restaurant.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            leftIcon={<Mail className="h-4 w-4" />}
          />

          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 block">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full rounded-xl text-sm text-slate-100 glass-input px-3.5 py-2.5 outline-none"
            >
              <option value="manager">Manager (Can edit menus & view analytics)</option>
              <option value="kitchen">Kitchen Chef (KDS access only)</option>
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
