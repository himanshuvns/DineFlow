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
  phone: string;
}

export const DEFAULT_STAFF: StaffMember[] = [
  { id: "st-hk-1", name: "Ramesh Kumar", role: "housekeeping", phone: "+91 98111 22334" },
  { id: "st-hk-2", name: "Sunita Sharma", role: "housekeeping", phone: "+91 98222 33445" },
  { id: "st-hk-3", name: "Vikram Singh", role: "lead_housekeeping", phone: "+91 98333 44556" },
  { id: "st-sv-1", name: "Amit Patel", role: "supervisor", phone: "+91 98444 55667" },
];

declare global {
  var __dineflow_tasks_store: HousekeepingTask[] | undefined;
  var __dineflow_whatsapp_logs: any[] | undefined;
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
export function findAvailableHousekeeper(): StaffMember | null {
  // 1. Prioritize dedicated housekeeping stewards
  const housekeepers = DEFAULT_STAFF.filter((s) => s.role.includes("housekeeping"));
  for (const hk of housekeepers) {
    if (countActiveTasksForStaff(hk.id) === 0) {
      return hk;
    }
  }

  // 2. Fallback to supervisor or general staff with 0 active tasks
  const otherStaff = DEFAULT_STAFF.filter((s) => !s.role.includes("housekeeping"));
  for (const st of otherStaff) {
    if (countActiveTasksForStaff(st.id) === 0) {
      return st;
    }
  }

  // All housekeepers/staff have at least 1 active task
  return null;
}

// WhatsApp broadcast: notify EVERY staff member about the new housekeeping request
export function notifyAllStaffViaWhatsApp(task: HousekeepingTask, cleanRoom: string) {
  const logs = getWhatsAppLogs();
  DEFAULT_STAFF.forEach((staff) => {
    const logItem = {
      id: `wam-hk-${Date.now()}-${staff.id}`,
      phone: staff.phone,
      customerName: `${staff.name} (${staff.role.replace("_", " ")})`,
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
