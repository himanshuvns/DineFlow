export interface HousekeepingTask {
  id: string;
  roomNumber: string;
  taskType: string;
  title: string;
  priority: "normal" | "high" | "urgent" | string;
  status: "pending" | "in_progress" | "completed";
  assignedTo?: string;
  assignedToName?: string;
  notes?: string;
  source: string;
  isGuestRequest: boolean;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
  department?: string;
}

declare global {
  var __dineflow_tasks_store: HousekeepingTask[] | undefined;
  var __dineflow_whatsapp_logs: any[] | undefined;
  var __dineflow_tenant_staff: Record<string, StaffMember[]> | undefined;
}

export function getTasksStore(): HousekeepingTask[] {
  if (!global.__dineflow_tasks_store) {
    global.__dineflow_tasks_store = [];
  }
  return global.__dineflow_tasks_store;
}

export function getWhatsAppLogs(): any[] {
  if (!global.__dineflow_whatsapp_logs) {
    global.__dineflow_whatsapp_logs = [];
  }
  return global.__dineflow_whatsapp_logs;
}

export function getTenantStaffStore(): Record<string, StaffMember[]> {
  if (!global.__dineflow_tenant_staff) {
    global.__dineflow_tenant_staff = {};
  }
  return global.__dineflow_tenant_staff;
}

export function setTenantStaff(tenantSlug: string, staff: StaffMember[]) {
  const store = getTenantStaffStore();
  store[tenantSlug] = staff;
}

export function getTenantStaff(tenantSlug: string): StaffMember[] {
  const store = getTenantStaffStore();
  return store[tenantSlug] || [];
}

// Workload limit helper: Count active (pending or in_progress) tasks assigned to a staff member
export function countActiveTasksForStaff(staffId: string, excludeTaskId?: string): number {
  const store = getTasksStore();
  return store.filter(
    (t) =>
      t.assignedTo === staffId &&
      (t.status === "pending" || t.status === "in_progress") &&
      (!excludeTaskId || t.id !== excludeTaskId)
  ).length;
}

// Strict workload balancer: Find an available housekeeper who has exactly 0 active tasks.
// "two requests cannot go to one housekeeper, so every staff should work"
export function findAvailableHousekeeper(candidateStaff: StaffMember[] = []): StaffMember | null {
  if (!candidateStaff || candidateStaff.length === 0) {
    return null;
  }

  // 1. Prioritize dedicated housekeeping stewards with 0 active tasks
  const housekeepers = candidateStaff.filter((s) => {
    const role = (s.role || "").toLowerCase();
    const dept = (s.department || "").toLowerCase();
    return role.includes("housekeeping") || dept.includes("housekeeping") || role.includes("clean");
  });
  for (const hk of housekeepers) {
    if (countActiveTasksForStaff(hk.id) === 0) {
      return hk;
    }
  }

  // 2. Fallback to supervisor or general staff with 0 active tasks
  const otherStaff = candidateStaff.filter((s) => {
    const role = (s.role || "").toLowerCase();
    const dept = (s.department || "").toLowerCase();
    return !role.includes("housekeeping") && !dept.includes("housekeeping") && !role.includes("clean");
  });
  for (const st of otherStaff) {
    if (countActiveTasksForStaff(st.id) === 0) {
      return st;
    }
  }

  // All housekeepers/staff have at least 1 active task
  return null;
}

// WhatsApp broadcast: notify EVERY staff member about the new housekeeping request
export function notifyAllStaffViaWhatsApp(task: HousekeepingTask, cleanRoom: string, staffList: StaffMember[] = []) {
  const logs = getWhatsAppLogs();
  if (!staffList || staffList.length === 0) return;

  staffList.forEach((staff) => {
    const logItem = {
      id: `wam-hk-${Date.now()}-${staff.id}`,
      phone: staff.phone || "+91 98000 00000",
      customerName: `${staff.name} (${(staff.role || "staff").replace("_", " ")})`,
      template: `Staff Alert: Housekeeping — ${task.title} (Suite ${cleanRoom})`,
      status: "delivered",
      time: "Just now",
      location: `Suite ${cleanRoom}`,
      details: `Assigned: ${task.assignedToName || "Unassigned"} | Priority: ${task.priority}`,
      createdAt: new Date().toISOString(),
    };
    logs.unshift(logItem);
  });
}
