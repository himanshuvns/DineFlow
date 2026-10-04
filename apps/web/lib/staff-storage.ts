/**
 * Staff, Attendance, and Leave Storage for DineFlow
 * Provides centralized in-memory & localStorage staff management,
 * phone number normalization, and signed check-in link generation.
 */

export interface StaffMember {
  id: string;
  name: string;
  role: "waiter" | "chef" | "manager" | "cleaner" | "owner" | "cashier" | string;
  department: string;
  phone: string;
  employeeId: string;
  email?: string;
  leaveBalance?: {
    casual: number;
    sick: number;
    earned: number;
  };
  shiftName?: string;
  shiftHours?: string;
  salaryBasic?: number;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  action: "clock_in" | "clock_out" | "break_start" | "break_end";
  timestamp: string;
  date: string;
  method: "whatsapp" | "gps_mobile" | "manual";
  distanceMeters?: number;
  status: "verified" | "flagged" | "on_time" | "late";
}

export interface LeaveRequestRecord {
  id: string;
  staffId: string;
  staffName: string;
  type: "casual" | "sick" | "earned" | string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
}

declare global {
  var __dineflow_enrolled_staff: StaffMember[] | undefined;
  var __dineflow_attendance_records: AttendanceRecord[] | undefined;
  var __dineflow_leave_records: LeaveRequestRecord[] | undefined;
}

export const INITIAL_STAFF_MEMBERS: StaffMember[] = [
  {
    id: "st-himanshu",
    name: "Himanshu Singh",
    role: "owner",
    department: "Executive Management",
    phone: "+91 78888 34311",
    employeeId: "DF-EMP-1000",
    email: "himanshu@dineflow.app",
    leaveBalance: { casual: 12, sick: 8, earned: 15 },
    shiftName: "General Shift",
    shiftHours: "09:00 - 18:00",
    salaryBasic: 85000,
  },
  {
    id: "st-1",
    name: "Rahul Sharma",
    role: "waiter",
    department: "Floor Service",
    phone: "+91 98765 43210",
    employeeId: "DF-EMP-1002",
    email: "rahul.sharma@dineflow.app",
    leaveBalance: { casual: 8, sick: 5, earned: 10 },
    shiftName: "Morning Shift",
    shiftHours: "08:00 - 16:30",
    salaryBasic: 22000,
  },
  {
    id: "st-2",
    name: "Ananya Deshmukh",
    role: "chef",
    department: "Kitchen & Bakery",
    phone: "+91 98111 22334",
    employeeId: "DF-EMP-1003",
    email: "ananya.chef@dineflow.app",
    leaveBalance: { casual: 7, sick: 6, earned: 12 },
    shiftName: "Evening Shift",
    shiftHours: "15:00 - 23:30",
    salaryBasic: 35000,
  },
  {
    id: "st-3",
    name: "Vikram Malhotra",
    role: "manager",
    department: "Restaurant Operations",
    phone: "+91 99887 76655",
    employeeId: "DF-EMP-1001",
    email: "vikram.m@dineflow.app",
    leaveBalance: { casual: 10, sick: 7, earned: 14 },
    shiftName: "General Shift",
    shiftHours: "10:00 - 19:00",
    salaryBasic: 45000,
  },
  {
    id: "st-4",
    name: "Sunita Devi",
    role: "cleaner",
    department: "Housekeeping & Rooms",
    phone: "+91 97654 32109",
    employeeId: "DF-EMP-1004",
    email: "sunita@dineflow.app",
    leaveBalance: { casual: 6, sick: 4, earned: 8 },
    shiftName: "Morning Shift",
    shiftHours: "07:00 - 15:30",
    salaryBasic: 18000,
  },
];

/**
 * Normalizes phone numbers for uniform matching across formats:
 * "+91 78888 34311", "917888834311", "07888834311", "(91) 78888-34311" -> "7888834311"
 */
export function normalizePhone(phone: string): string {
  if (!phone) return "";
  let digits = phone.replace(/[^0-9]/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits;
}

export function getEnrolledStaff(): StaffMember[] {
  if (!global.__dineflow_enrolled_staff) {
    global.__dineflow_enrolled_staff = [...INITIAL_STAFF_MEMBERS];
  }
  return global.__dineflow_enrolled_staff;
}

export function setEnrolledStaff(list: StaffMember[]): void {
  global.__dineflow_enrolled_staff = list;
}

export function enrollStaff(member: StaffMember): StaffMember {
  const staff = getEnrolledStaff();
  const existingIdx = staff.findIndex(
    (s) => s.id === member.id || normalizePhone(s.phone) === normalizePhone(member.phone)
  );

  if (existingIdx !== -1) {
    staff[existingIdx] = { ...staff[existingIdx], ...member };
    return staff[existingIdx];
  } else {
    staff.push(member);
    return member;
  }
}

export function findStaffByPhone(phone: string): StaffMember | undefined {
  const norm = normalizePhone(phone);
  if (!norm) return undefined;
  return getEnrolledStaff().find((s) => normalizePhone(s.phone) === norm);
}

export function getAttendanceRecords(): AttendanceRecord[] {
  if (!global.__dineflow_attendance_records) {
    global.__dineflow_attendance_records = [];
  }
  return global.__dineflow_attendance_records;
}

export function recordAttendance(action: AttendanceRecord["action"], staff: StaffMember, method: AttendanceRecord["method"] = "whatsapp"): AttendanceRecord {
  const records = getAttendanceRecords();
  const todayStr = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const newRec: AttendanceRecord = {
    id: "att-" + Date.now().toString().slice(-6),
    staffId: staff.id,
    staffName: staff.name,
    action: action,
    timestamp: nowTime,
    date: todayStr,
    method: method,
    status: "verified",
  };

  records.unshift(newRec);
  return newRec;
}

export function getTodayAttendance(staffId: string): AttendanceRecord[] {
  const todayStr = new Date().toISOString().split("T")[0];
  return getAttendanceRecords().filter((r) => r.staffId === staffId && r.date === todayStr);
}

export function getLeaveRecords(): LeaveRequestRecord[] {
  if (!global.__dineflow_leave_records) {
    global.__dineflow_leave_records = [];
  }
  return global.__dineflow_leave_records;
}

export function recordLeaveRequest(
  staff: StaffMember,
  type: string,
  startDate: string,
  endDate: string,
  reason: string
): LeaveRequestRecord {
  const leaves = getLeaveRecords();
  const rec: LeaveRequestRecord = {
    id: "lve-" + Date.now().toString().slice(-5),
    staffId: staff.id,
    staffName: staff.name,
    type: type,
    startDate: startDate,
    endDate: endDate,
    reason: reason,
    status: "pending",
    requestedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  };

  leaves.unshift(rec);

  // Deduct from balance
  if (staff.leaveBalance) {
    const key = type.toLowerCase() as keyof typeof staff.leaveBalance;
    if (staff.leaveBalance[key] !== undefined && staff.leaveBalance[key] > 0) {
      staff.leaveBalance[key] -= 1;
    }
  }

  return rec;
}

/**
 * Generates an anti-tamper signed mobile GPS check-in link for WhatsApp dispatches.
 */
export function generateCheckInSignedUrl(staff: StaffMember, action: "clock_in" | "clock_out" = "clock_in"): string {
  const baseUrl = "https://dineflow-steel.vercel.app";
  const params = new URLSearchParams({
    action: action,
    emp: staff.employeeId || staff.id,
    name: staff.name,
    role: staff.role,
    t: Date.now().toString(),
  });
  return `${baseUrl}/m/check-in?token=${encodeURIComponent(Buffer.from(params.toString()).toString("base64"))}`;
}
