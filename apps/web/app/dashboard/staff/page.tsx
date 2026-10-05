"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  UserPlus,
  Users,
  Shield,
  Mail,
  Sparkles,
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Coffee,
  Navigation,
  RefreshCw,
  Printer,
  Eye,
  Plus,
  Edit2,
  Trash2,
  Briefcase,
  Building,
  CreditCard,
  Phone,
  MessageSquare,
  CalendarCheck,
  CalendarRange,
  Download,
  UserCheck,
  Filter,
  SlidersHorizontal,
  History,
  UserCog,
  Info,
  Award,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  LayoutGrid,
  List,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import NumberFlow from "@number-flow/react";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";
import {
  validateIndianPhone,
  formatIndianPhoneInput,
  validateEmail,
  validateIFSC,
} from "@/lib/validation";

// ── Types ────────────────────────────────────────────────────────────────────

interface SalaryStructure {
  basic: number;
  hra: number;
  specialAllowance: number;
  overtimeRate: number;
}

interface BankDetails {
  accountName?: string;
  accountNumber?: string;
  ifsc?: string;
  bankName?: string;
}

interface EmergencyContact {
  name?: string;
  relation?: string;
  phone?: string;
}

interface StaffMember {
  id: string;
  employeeId?: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  status: string;
  department?: string;
  employmentType?: string;
  shiftName?: string;
  salary?: SalaryStructure;
  bankDetails?: BankDetails;
  emergencyContact?: EmergencyContact;
  aadhaarNumber?: string;
  panNumber?: string;
  joiningDate?: string;
}

interface AttendanceRecord {
  id: string;
  userId: string;
  employeeId: string;
  employeeName: string;
  department?: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  checkInDistance?: number;
  isOnBreak: boolean;
  status: "present" | "late" | "half_day" | "absent" | "leave" | "holiday" | "weekly_off";
  workingHours: number;
  breakHours: number;
  breakMinutes?: number;
  overtimeHours: number;
  isManualOverride?: boolean;
  markedByName?: string;
  manualReason?: string;
  notes?: string;
}

interface GeofenceConfig {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  address: string;
  enforceGeofence: boolean;
}

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  breakMinutes: number;
  isDefault: boolean;
}

interface LeaveRequest {
  id: string;
  userId: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  isHalfDay: boolean;
  reason: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
}

interface LeaveBalance {
  casualTotal: number;
  casualUsed: number;
  sickTotal: number;
  sickUsed: number;
  earnedTotal: number;
  earnedUsed: number;
  year: number;
}

interface PayrollRecord {
  id: string;
  userId: string;
  employeeId: string;
  employeeName: string;
  role: string;
  department: string;
  month: string;
  year: number;
  presentDays: number;
  absentDays: number;
  overtimeHours: number;
  basicSalary: number;
  hra: number;
  allowances: number;
  overtimePay: number;
  grossEarnings: number;
  deductions: number;
  netPay: number;
  paymentStatus: string;
  paidAt?: string;
  createdAt: string;
}

interface Holiday {
  id: string;
  name: string;
  date: string;
  type: string;
}

// Distance helper
function calculateDistanceM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function StaffPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const { addToast } = useToast();
  const currentUser = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = React.useState<"staff" | "attendance" | "shifts" | "leaves" | "payroll" | "holidays">("staff");
  const [loading, setLoading] = React.useState(true);
  const [showMobileStats, setShowMobileStats] = React.useState(false);

  // Sync activeTab with URL tab query parameter
  React.useEffect(() => {
    if (tabParam && ["staff", "attendance", "shifts", "leaves", "payroll", "holidays"].includes(tabParam)) {
      setActiveTab(tabParam as typeof activeTab);
    } else if (!tabParam) {
      setActiveTab("staff");
    }
  }, [tabParam]);

  // ── Data States ─────────────────────────────────────────────────────────────
  const [staffList, setStaffList] = React.useState<StaffMember[]>([]);
  const [todayAttendance, setTodayAttendance] = React.useState<AttendanceRecord[]>([]);
  const [geofence, setGeofence] = React.useState<GeofenceConfig>({
    latitude: 28.6315,
    longitude: 77.2167,
    radiusMeters: 100,
    address: "Connaught Place Central, New Delhi",
    enforceGeofence: false,
  });
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [leaves, setLeaves] = React.useState<LeaveRequest[]>([]);
  const [leaveBalance, setLeaveBalance] = React.useState<LeaveBalance>({
    casualTotal: 12,
    casualUsed: 0,
    sickTotal: 8,
    sickUsed: 0,
    earnedTotal: 15,
    earnedUsed: 0,
    year: new Date().getFullYear(),
  });
  const [payrollRecords, setPayrollRecords] = React.useState<PayrollRecord[]>([]);
  const [holidays, setHolidays] = React.useState<Holiday[]>([]);

  // ── Multi-Scale Attendance & Manager Override State ─────────────────────────
  const [attendancePeriod, setAttendancePeriod] = React.useState<"day" | "week" | "month" | "year" | "custom">("month");
  const [attendanceViewMode, setAttendanceViewMode] = React.useState<"matrix" | "table">("matrix");
  const [attendanceSelectedDate, setAttendanceSelectedDate] = React.useState<string>(new Date().toISOString().substring(0, 10));
  const [attendanceSelectedMonth, setAttendanceSelectedMonth] = React.useState<string>(new Date().toISOString().substring(0, 7));
  const [attendanceSelectedYear, setAttendanceSelectedYear] = React.useState<string>(String(new Date().getFullYear()));
  const [attendanceCustomStart, setAttendanceCustomStart] = React.useState<string>("");
  const [attendanceCustomEnd, setAttendanceCustomEnd] = React.useState<string>("");
  const [attendanceFilterDept, setAttendanceFilterDept] = React.useState<string>("all");
  const [attendanceFilterStaff, setAttendanceFilterStaff] = React.useState<string>("all");
  const [attendanceFilterStatus, setAttendanceFilterStatus] = React.useState<string>("all");
  const [periodAttendance, setPeriodAttendance] = React.useState<AttendanceRecord[]>([]);
  const [attendanceLoading, setAttendanceLoading] = React.useState<boolean>(false);
  const [attendanceSummary, setAttendanceSummary] = React.useState<{
    totalRecords: number;
    presentCount: number;
    lateCount: number;
    halfDayCount: number;
    absentCount: number;
    leaveCount: number;
    totalWorkingHours: number;
    totalOvertimeHours: number;
    manualOverrideCount: number;
  } | null>(null);

  // ── Manual Attendance Override Modal State ─────────────────────────────────
  const [isManualAttendanceOpen, setIsManualAttendanceOpen] = React.useState(false);
  const [manualStaffId, setManualStaffId] = React.useState("");
  const [manualDate, setManualDate] = React.useState(new Date().toISOString().substring(0, 10));
  const [manualStatus, setManualStatus] = React.useState<string>("present");
  const [manualCheckIn, setManualCheckIn] = React.useState("09:00");
  const [manualCheckOut, setManualCheckOut] = React.useState("18:00");
  const [manualBreakMinutes, setManualBreakMinutes] = React.useState("60");
  const [manualReason, setManualReason] = React.useState("Staff WhatsApp unavailable / device failure");
  const [submittingManualAttendance, setSubmittingManualAttendance] = React.useState(false);

  // ── GPS Terminal State ──────────────────────────────────────────────────────
  const [currentCoords, setCurrentCoords] = React.useState<{ lat: number; lng: number } | null>(null);
  const [gpsDistance, setGpsDistance] = React.useState<number | null>(null);
  const [clockingIn, setClockingIn] = React.useState(false);
  const [clockingOut, setClockingOut] = React.useState(false);
  const [togglingBreak, setTogglingBreak] = React.useState(false);

  // ── Modals ──────────────────────────────────────────────────────────────────
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [inviteName, setInviteName] = React.useState("");
  const [invitePhone, setInvitePhone] = React.useState("");
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState("waiter");
  const [inviteDepartment, setInviteDepartment] = React.useState("Floor Service");
  const [inviteType, setInviteType] = React.useState("full_time");
  const [inviteSalary, setInviteSalary] = React.useState("20000");
  const [invitePhoneTouched, setInvitePhoneTouched] = React.useState(false);

  const [isEditProfileOpen, setIsEditProfileOpen] = React.useState(false);
  const [selectedStaff, setSelectedStaff] = React.useState<StaffMember | null>(null);
  const [profileName, setProfileName] = React.useState("");
  const [profilePhone, setProfilePhone] = React.useState("");
  const [profilePhoneTouched, setProfilePhoneTouched] = React.useState(false);
  const [profileEmail, setProfileEmail] = React.useState("");
  const [profileDepartment, setProfileDepartment] = React.useState("");
  const [profileEmpType, setProfileEmpType] = React.useState("full_time");
  const [profileShiftName, setProfileShiftName] = React.useState("");
  const [profileBasic, setProfileBasic] = React.useState("");
  const [profileHra, setProfileHra] = React.useState("");
  const [profileOvertimeRate, setProfileOvertimeRate] = React.useState("");
  const [profileAccNum, setProfileAccNum] = React.useState("");
  const [profileIfsc, setProfileIfsc] = React.useState("");
  const [profileBankName, setProfileBankName] = React.useState("");
  const [profileEmergName, setProfileEmergName] = React.useState("");
  const [profileEmergPhone, setProfileEmergPhone] = React.useState("");
  const [profileEmergPhoneTouched, setProfileEmergPhoneTouched] = React.useState(false);

  const [isGeofenceModalOpen, setIsGeofenceModalOpen] = React.useState(false);
  const [isMyClockInModalOpen, setIsMyClockInModalOpen] = React.useState(false);
  const [geoLat, setGeoLat] = React.useState("28.6315");
  const [geoLng, setGeoLng] = React.useState("77.2167");
  const [geoRadius, setGeoRadius] = React.useState("100");
  const [geoAddress, setGeoAddress] = React.useState("Connaught Place, New Delhi");
  const [geoEnforce, setGeoEnforce] = React.useState(false);

  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = React.useState(false);
  const [leaveStaffId, setLeaveStaffId] = React.useState("");
  const [leaveType, setLeaveType] = React.useState("casual");
  const [leaveStart, setLeaveStart] = React.useState("");
  const [leaveEnd, setLeaveEnd] = React.useState("");
  const [leaveHalfDay, setLeaveHalfDay] = React.useState(false);
  const [leaveReason, setLeaveReason] = React.useState("");
  const [leaveStatusFilter, setLeaveStatusFilter] = React.useState<"all" | "pending" | "approved" | "rejected">("all");

  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState(false);
  const [rejectingLeaveId, setRejectingLeaveId] = React.useState("");
  const [rejectionReason, setRejectionReason] = React.useState("");

  const [isPayslipModalOpen, setIsPayslipModalOpen] = React.useState(false);
  const [activePayslip, setActivePayslip] = React.useState<PayrollRecord | null>(null);

  const [selectedPayrollMonth, setSelectedPayrollMonth] = React.useState(new Date().toISOString().substring(0, 7));

  // ── Fetch Operations ────────────────────────────────────────────────────────

  const fetchStaff = React.useCallback(async () => {
    try {
      // 1. Fetch from Go API (primary source of truth in MongoDB)
      try {
        const res = await apiClient.get("/staff");
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setStaffList(res.data.data);
          return;
        }
      } catch (apiErr) {
        console.warn("Go API staff fetch fallback:", apiErr);
      }

      // 2. Fallback to /api/staff (local Next.js storage)
      const localRes = await fetch("/api/staff");
      if (localRes.ok) {
        const localData = await localRes.json();
        const list = localData?.data || localData?.staff;
        if (Array.isArray(list) && list.length > 0) {
          setStaffList(list);
        }
      }
    } catch (e) {
      console.warn("Staff fetch fallback:", e);
    }
  }, []);

  const fetchAttendance = React.useCallback(async () => {
    try {
      const res = await apiClient.get("/staff/attendance/today");
      if (res.data?.data && Array.isArray(res.data.data)) {
        setTodayAttendance(res.data.data);
      }
    } catch (e) {
      console.warn("Attendance fetch fallback:", e);
    }
  }, []);

  const getPeriodDateRange = React.useCallback(() => {
    let startDate = "";
    let endDate = "";

    if (attendancePeriod === "day") {
      startDate = attendanceSelectedDate || new Date().toISOString().substring(0, 10);
      endDate = startDate;
    } else if (attendancePeriod === "week") {
      const d = new Date(attendanceSelectedDate || new Date());
      const day = d.getDay();
      const diffToMon = d.getDate() - day + (day === 0 ? -6 : 1);
      const mon = new Date(d.setDate(diffToMon));
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      startDate = mon.toISOString().substring(0, 10);
      endDate = sun.toISOString().substring(0, 10);
    } else if (attendancePeriod === "month") {
      const parts = (attendanceSelectedMonth || new Date().toISOString().substring(0, 7)).split("-");
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const firstDay = new Date(Date.UTC(y, m - 1, 1));
      const lastDay = new Date(Date.UTC(y, m, 0));
      startDate = firstDay.toISOString().substring(0, 10);
      endDate = lastDay.toISOString().substring(0, 10);
    } else if (attendancePeriod === "year") {
      const yr = attendanceSelectedYear || String(new Date().getFullYear());
      startDate = `${yr}-01-01`;
      endDate = `${yr}-12-31`;
    } else if (attendancePeriod === "custom") {
      startDate = attendanceCustomStart;
      endDate = attendanceCustomEnd;
    }

    return { startDate, endDate };
  }, [attendancePeriod, attendanceSelectedDate, attendanceSelectedMonth, attendanceSelectedYear, attendanceCustomStart, attendanceCustomEnd]);

  const fetchPeriodAttendance = React.useCallback(async () => {
    setAttendanceLoading(true);
    try {
      const { startDate, endDate } = getPeriodDateRange();
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (attendanceFilterStaff !== "all") params.set("userId", attendanceFilterStaff);
      if (attendanceFilterDept !== "all") params.set("department", attendanceFilterDept);
      if (attendanceFilterStatus !== "all") params.set("status", attendanceFilterStatus);
      params.set("limit", "2000");

      const [resHistory, resSummary] = await Promise.allSettled([
        apiClient.get(`/staff/attendance/history?${params.toString()}`),
        apiClient.get(`/staff/attendance/summary?startDate=${startDate}&endDate=${endDate}${attendanceFilterDept !== "all" ? `&department=${encodeURIComponent(attendanceFilterDept)}` : ""}`),
      ]);

      if (resHistory.status === "fulfilled" && resHistory.value.data?.data) {
        setPeriodAttendance(resHistory.value.data.data);
      }
      if (resSummary.status === "fulfilled" && resSummary.value.data?.data) {
        setAttendanceSummary(resSummary.value.data.data);
      }
    } catch (e) {
      console.warn("Period attendance fetch error:", e);
    } finally {
      setAttendanceLoading(false);
    }
  }, [getPeriodDateRange, attendanceFilterStaff, attendanceFilterDept, attendanceFilterStatus]);

  const handleSaveManualAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualStaffId) {
      addToast("error", "Staff Member Required", "Please select a staff member to record attendance.");
      return;
    }
    if (!manualDate) {
      addToast("error", "Date Required", "Please select an attendance date.");
      return;
    }
    setSubmittingManualAttendance(true);
    try {
      let checkInISO: string | undefined;
      let checkOutISO: string | undefined;
      if (manualCheckIn && (manualStatus === "present" || manualStatus === "late" || manualStatus === "half_day")) {
        checkInISO = new Date(`${manualDate}T${manualCheckIn}:00Z`).toISOString();
      }
      if (manualCheckOut && (manualStatus === "present" || manualStatus === "late" || manualStatus === "half_day")) {
        checkOutISO = new Date(`${manualDate}T${manualCheckOut}:00Z`).toISOString();
      }

      const res = await apiClient.post("/staff/attendance/manual", {
        userId: manualStaffId,
        date: manualDate,
        status: manualStatus,
        checkInTime: checkInISO,
        checkOutTime: checkOutISO,
        breakMinutes: parseInt(manualBreakMinutes || "0", 10),
        reason: manualReason.trim() || "Manual manager override (WhatsApp unavailable)",
      });

      addToast(
        "success",
        "Attendance Recorded",
        `Marked ${manualStatus.toUpperCase()} for ${res.data?.data?.employeeName || "staff"} on ${manualDate} (Manual Override).`
      );
      setIsManualAttendanceOpen(false);
      fetchAttendance();
      fetchPeriodAttendance();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ||
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to mark manual attendance.";
      addToast("error", "Manual Attendance Failed", errorMsg);
    } finally {
      setSubmittingManualAttendance(false);
    }
  };

  const handleExportAttendanceCSV = () => {
    if (periodAttendance.length === 0) {
      addToast("warning", "No Records", "No attendance records available for the selected period.");
      return;
    }
    const headers = ["Date", "Employee ID", "Staff Name", "Department", "Check-In", "Check-Out", "Working Hours", "Overtime", "Status", "Verification Source", "Manager Notes"];
    const rows = periodAttendance.map((r) => [
      r.date,
      r.employeeId || "",
      `"${(r.employeeName || "").replace(/"/g, '""')}"`,
      `"${(r.department || "Operations").replace(/"/g, '""')}"`,
      r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
      r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
      r.workingHours || 0,
      r.overtimeHours || 0,
      r.status,
      r.isManualOverride ? `Manual Override (${r.markedByName || "Manager"})` : r.checkInDistance ? `GPS (${r.checkInDistance.toFixed(0)}m)` : "WhatsApp Bot",
      `"${(r.manualReason || r.notes || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DineFlow_Attendance_${attendancePeriod}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("success", "Report Exported", `Downloaded ${periodAttendance.length} attendance records.`);
  };

  const fetchGeofence = React.useCallback(async () => {
    try {
      const res = await apiClient.get("/staff/geofence");
      if (res.data?.data) {
        setGeofence(res.data.data);
        setGeoLat(String(res.data.data.latitude || 28.6315));
        setGeoLng(String(res.data.data.longitude || 77.2167));
        setGeoRadius(String(res.data.data.radiusMeters || 100));
        setGeoAddress(res.data.data.address || "Connaught Place Central, New Delhi");
        setGeoEnforce(Boolean(res.data.data.enforceGeofence));
      }
    } catch (e) {
      console.warn("Geofence fetch fallback:", e);
    }
  }, []);

  const fetchShifts = React.useCallback(async () => {
    try {
      const res = await apiClient.get("/staff/shifts");
      if (res.data?.data && Array.isArray(res.data.data)) {
        setShifts(res.data.data);
      }
    } catch (e) {
      console.warn("Shifts fetch fallback:", e);
    }
  }, []);

  const fetchLeaves = React.useCallback(async () => {
    try {
      const res = await apiClient.get("/staff/leaves");
      if (res.data?.data && Array.isArray(res.data.data)) {
        setLeaves(res.data.data);
      }
    } catch (e) {
      console.warn("Leaves fetch fallback:", e);
    }
  }, []);

  const fetchLeaveBalance = React.useCallback(async () => {
    try {
      const res = await apiClient.get("/staff/leaves/balance");
      if (res.data?.data) {
        setLeaveBalance(res.data.data);
      }
    } catch (e) {
      console.warn("Leave balance fetch fallback:", e);
    }
  }, []);

  const fetchPayroll = React.useCallback(async (month: string) => {
    try {
      const res = await apiClient.get(`/staff/payroll?month=${month}`);
      if (res.data?.data && Array.isArray(res.data.data)) {
        setPayrollRecords(res.data.data);
      }
    } catch (e) {
      console.warn("Payroll fetch fallback:", e);
    }
  }, []);

  const fetchHolidays = React.useCallback(async () => {
    try {
      const res = await apiClient.get("/staff/holidays");
      if (res.data?.data && Array.isArray(res.data.data)) {
        setHolidays(res.data.data);
      }
    } catch (e) {
      console.warn("Holidays fetch fallback:", e);
    }
  }, []);

  const loadAll = React.useCallback(async () => {
    setLoading(true);
    await Promise.allSettled([
      fetchStaff(),
      fetchAttendance(),
      fetchGeofence(),
      fetchShifts(),
      fetchLeaves(),
      fetchLeaveBalance(),
      fetchPayroll(selectedPayrollMonth),
      fetchHolidays(),
      fetchPeriodAttendance(),
    ]);
    setLoading(false);
  }, [fetchStaff, fetchAttendance, fetchPeriodAttendance, fetchGeofence, fetchShifts, fetchLeaves, fetchLeaveBalance, fetchPayroll, fetchHolidays, selectedPayrollMonth]);

  React.useEffect(() => {
    if (activeTab === "attendance") {
      fetchPeriodAttendance();
    }
  }, [activeTab, fetchPeriodAttendance]);

  React.useEffect(() => {
    loadAll();
    const interval = setInterval(() => {
      fetchAttendance();
      fetchStaff();
    }, 20000);
    return () => clearInterval(interval);
  }, [loadAll, fetchAttendance, fetchStaff]);

  // ── Live Geolocation Tracking ───────────────────────────────────────────────

  React.useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCurrentCoords({ lat, lng });
          if (geofence.latitude && geofence.longitude) {
            const dist = calculateDistanceM(lat, lng, geofence.latitude, geofence.longitude);
            setGpsDistance(dist);
          }
        },
        (err) => {
          console.warn("GPS lookup denied or unavailable:", err.message);
          // Fallback to default restaurant coordinates for testing
          setCurrentCoords({ lat: geofence.latitude || 28.6315, lng: geofence.longitude || 77.2167 });
          setGpsDistance(15);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, [geofence]);

  // Find current user's active attendance today
  const myAttendance = React.useMemo(() => {
    if (!currentUser?.id) return null;
    return todayAttendance.find((a) => a.userId === currentUser.id);
  }, [todayAttendance, currentUser]);

  const isClockedIn = Boolean(myAttendance?.checkInTime && !myAttendance?.checkOutTime);
  const isOnBreak = Boolean(myAttendance?.isOnBreak);

  // ── Attendance Actions ─────────────────────────────────────────────────────

  const handleClockIn = async () => {
    setClockingIn(true);
    const lat = currentCoords?.lat || geofence.latitude || 28.6315;
    const lng = currentCoords?.lng || geofence.longitude || 77.2167;

    try {
      const res = await apiClient.post("/staff/attendance/clock-in", {
        latitude: lat,
        longitude: lng,
      });
      const rec: AttendanceRecord = res.data?.data;
      const statusLabel = rec.status === "late" ? "Logged as Late Arrival" : "On Time Check-in";
      addToast("success", "Clocked In Successfully!", `${statusLabel} (${rec.checkInDistance ? `${rec.checkInDistance.toFixed(0)}m from center` : "Geofence verified"})`);
      fetchAttendance();
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Clock in failed. Ensure you are inside the geofence boundary.";
      addToast("error", "Check-in Blocked", errorMsg);
    } finally {
      setClockingIn(false);
    }
  };

  const handleClockOut = async () => {
    setClockingOut(true);
    const lat = currentCoords?.lat || geofence.latitude || 28.6315;
    const lng = currentCoords?.lng || geofence.longitude || 77.2167;

    try {
      const res = await apiClient.post("/staff/attendance/clock-out", {
        latitude: lat,
        longitude: lng,
      });
      const rec: AttendanceRecord = res.data?.data;
      addToast("success", "Clocked Out Successfully", `Total Shift: ${rec.workingHours || 0} hrs | Overtime: ${rec.overtimeHours || 0} hrs`);
      fetchAttendance();
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Clock out failed.";
      addToast("error", "Clock Out Error", errorMsg);
    } finally {
      setClockingOut(false);
    }
  };

  const handleToggleBreak = async () => {
    setTogglingBreak(true);
    try {
      const res = await apiClient.post("/staff/attendance/break");
      const rec: AttendanceRecord = res.data?.data;
      if (rec.isOnBreak) {
        addToast("info", "Break Started", "Break timer running. Enjoy your refreshment!");
      } else {
        addToast("success", "Break Finished", `Shift resumed. Total break logged: ${rec.breakHours || 0} hrs.`);
      }
      fetchAttendance();
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Could not toggle break.";
      addToast("error", "Break Toggle Error", errorMsg);
    } finally {
      setTogglingBreak(false);
    }
  };

  // ── Geofence Configuration Save ─────────────────────────────────────────────

  const handleSaveGeofence = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.put("/staff/geofence", {
        latitude: parseFloat(geoLat),
        longitude: parseFloat(geoLng),
        radiusMeters: parseFloat(geoRadius),
        address: geoAddress.trim(),
        enforceGeofence: geoEnforce,
      });
      setGeofence(res.data?.data);
      addToast("success", "Geofence Updated", `Radius set to ${geoRadius}m (${geoEnforce ? "Strict Enforcement" : "Advisory Mode"}).`);
      setIsGeofenceModalOpen(false);
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to update geofence.";
      addToast("error", "Geofence Error", errorMsg);
    }
  };

  // ── Leave Management Actions ────────────────────────────────────────────────

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/staff/leaves", {
        leaveType,
        startDate: leaveStart,
        endDate: leaveEnd,
        isHalfDay: leaveHalfDay,
        reason: leaveReason.trim(),
      });
      addToast("success", "Leave Request Submitted", "Your manager has been notified for review.");
      setIsApplyLeaveOpen(false);
      setLeaveReason("");
      fetchLeaves();
      fetchLeaveBalance();
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Could not apply for leave.";
      addToast("error", "Leave Submission Failed", errorMsg);
    }
  };

  const handleApproveLeave = async (leaveId: string) => {
    try {
      await apiClient.post(`/staff/leaves/${leaveId}/approve`, {
        approverName: currentUser?.name || "Management",
      });
      addToast("success", "Leave Approved", "Employee notified and leave balance deducted.");
      fetchLeaves();
      fetchLeaveBalance();
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Could not approve leave.";
      addToast("error", "Action Failed", errorMsg);
    }
  };

  const handleRejectLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(`/staff/leaves/${rejectingLeaveId}/reject`, {
        approverName: currentUser?.name || "Management",
        reason: rejectionReason.trim(),
      });
      addToast("info", "Leave Rejected", "Employee notified of rejection reason.");
      setIsRejectModalOpen(false);
      setRejectionReason("");
      setRejectingLeaveId("");
      fetchLeaves();
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Could not reject leave.";
      addToast("error", "Action Failed", errorMsg);
    }
  };

  // ── Payroll Actions ────────────────────────────────────────────────────────

  const handleRunPayroll = async () => {
    try {
      const res = await apiClient.post("/staff/payroll/run", {
        month: selectedPayrollMonth,
      });
      if (res.data?.data && Array.isArray(res.data.data)) {
        setPayrollRecords(res.data.data);
        addToast("success", "Payroll Completed!", `Generated ${res.data.data.length} employee payslips for ${selectedPayrollMonth}`);
      }
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Could not process payroll.";
      addToast("error", "Payroll Engine Failed", errorMsg);
    }
  };

  // ── Staff Profile & Invite Actions ─────────────────────────────────────────

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = invitePhone.trim();
    const email = inviteEmail.trim();
    if (!phone && !email) {
      addToast("warning", "Contact Required", "Please enter a WhatsApp phone number or email address.");
      return;
    }

    let normalizedPhone = phone;
    if (phone) {
      const v = validateIndianPhone(phone);
      if (!v.isValid) {
        setInvitePhoneTouched(true);
        addToast("error", "Invalid WhatsApp Number", v.error || "Please enter a valid 10-digit Indian mobile number.");
        return;
      }
      normalizedPhone = v.normalized;
    }

    if (email) {
      const ev = validateEmail(email);
      if (!ev.isValid) {
        addToast("error", "Invalid Email", ev.error || "Please enter a valid email address.");
        return;
      }
    }

    try {
      // Also register into /api/staff so WhatsApp flows can recognize this staff member immediately!
      if (normalizedPhone) {
        try {
          await fetch("/api/staff", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: inviteName.trim() || phone || email.split("@")[0],
              phone: normalizedPhone,
              role: inviteRole,
              department: inviteDepartment,
              employmentType: inviteType,
            }),
          });
        } catch (apiErr) {
          console.warn("Failed syncing to /api/staff:", apiErr);
        }
      }

      await apiClient.post("/staff/invite", {
        name: inviteName.trim() || phone || email.split("@")[0],
        phone: normalizedPhone,
        email: email.trim(),
        role: inviteRole,
        department: inviteDepartment,
        employmentType: inviteType,
        salary: {
          basic: parseFloat(inviteSalary) || 20000,
          hra: Math.round((parseFloat(inviteSalary) || 20000) * 0.4),
          specialAllowance: 2500,
          overtimeRate: 150,
        },
      });

      addToast(
        "success",
        "Staff Enrolled!",
        `Enrolled ${inviteName.trim()} with access (${phone || email}). Default login password: DineFlow@2026`
      );
      setIsInviteOpen(false);
      setInviteName("");
      setInvitePhone("");
      setInviteEmail("");
      setInvitePhoneTouched(false);
      fetchStaff();
    } catch (err: unknown) {
      const errObj = (err as { response?: { data?: { error?: { message?: string } | string; message?: string } } })?.response?.data;
      const errorMsg = (typeof errObj?.error === "object" ? errObj?.error?.message : errObj?.error) || errObj?.message || "Could not enroll staff member.";
      addToast("error", "Invite Failed", errorMsg);
    }
  };

  const handleSendStaffWhatsAppInvite = async (member: StaffMember) => {
    if (!member.phone) {
      addToast("warning", "No Phone Number", "This staff member does not have a phone number registered.");
      return;
    }
    try {
      const clean = member.phone.replace(/[^0-9]/g, "");
      const msg = `👋 Welcome to DineFlow Workforce, ${member.name}!\n\nYour profile is enrolled as *${member.role.toUpperCase()}* (${member.department || "Operations"}).\n\nReply with any of these anytime:\n• *Hi* - Main workforce command menu\n• *1* - Clock In (Attendance)\n• *2* - Clock Out\n• *3* - Start Break\n• *4* - Request Leave\n• *5* - Shift Roster\n\nNeed assistance? Contact your shift supervisor.`;

      const res = await fetch("/api/whatsapp/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientPhone: clean,
          customerName: member.name,
          message: msg,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || data?.error || "Failed to dispatch WhatsApp message");
      addToast("success", "WhatsApp Invite Dispatched", `Sent workforce onboarding to ${member.name} (${member.phone})`);
    } catch (err: unknown) {
      let errorMsg = (err as Error)?.message || "Failed to deliver WhatsApp message.";
      if (errorMsg.toLowerCase().includes("authentication error") || errorMsg.toLowerCase().includes("session has expired") || errorMsg.includes("190")) {
        errorMsg = "Meta Access Token has expired (24h limit). Please generate a fresh token in Meta Developer Console or use a Permanent System User Token.";
      }
      addToast("error", "Dispatch Failed", errorMsg);
    }
  };

  const handleOpenEditProfile = (member: StaffMember) => {
    setSelectedStaff(member);
    setProfileName(member.name);
    setProfilePhone(member.phone || "");
    setProfilePhoneTouched(false);
    setProfileEmail(member.email || "");
    setProfileDepartment(member.department || (member.role === "owner" || member.role === "manager" ? "Management" : "Floor Service"));
    setProfileEmpType(member.employmentType || "full_time");
    setProfileShiftName(member.shiftName || "Morning Shift (09:00 - 18:00)");
    setProfileBasic(member.salary?.basic?.toString() || "20000");
    setProfileHra(member.salary?.hra?.toString() || "8000");
    setProfileOvertimeRate(member.salary?.overtimeRate?.toString() || "150");
    setProfileAccNum(member.bankDetails?.accountNumber || "");
    setProfileIfsc(member.bankDetails?.ifsc || "");
    setProfileBankName(member.bankDetails?.bankName || "");
    setProfileEmergName(member.emergencyContact?.name || "");
    setProfileEmergPhone(member.emergencyContact?.phone || "");
    setProfileEmergPhoneTouched(false);
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    let normalizedPhone = profilePhone.trim();
    if (normalizedPhone) {
      const v = validateIndianPhone(normalizedPhone);
      if (!v.isValid) {
        setProfilePhoneTouched(true);
        addToast("error", "Invalid WhatsApp Number", v.error || "Please enter a valid Indian mobile number.");
        return;
      }
      normalizedPhone = v.normalized;
    }

    let normalizedEmergPhone = profileEmergPhone.trim();
    if (normalizedEmergPhone) {
      const ev = validateIndianPhone(normalizedEmergPhone);
      if (!ev.isValid) {
        setProfileEmergPhoneTouched(true);
        addToast("error", "Invalid Emergency Contact Phone", ev.error || "Please enter a valid Indian mobile number.");
        return;
      }
      normalizedEmergPhone = ev.normalized;
    }

    if (profileEmail.trim()) {
      const emv = validateEmail(profileEmail);
      if (!emv.isValid) {
        addToast("error", "Invalid Email Address", emv.error || "Please enter a valid email address.");
        return;
      }
    }

    if (profileIfsc.trim()) {
      const ifscV = validateIFSC(profileIfsc);
      if (!ifscV.isValid) {
        addToast("error", "Invalid Bank IFSC Code", ifscV.error || "Please enter a valid 11-character IFSC code.");
        return;
      }
    }

    try {
      await apiClient.put(`/staff/profiles/${selectedStaff.id}`, {
        name: profileName.trim(),
        phone: normalizedPhone,
        email: profileEmail.trim(),
        department: profileDepartment,
        employmentType: profileEmpType,
        shiftName: profileShiftName,
        salary: {
          basic: parseFloat(profileBasic) || 0,
          hra: parseFloat(profileHra) || 0,
          specialAllowance: 3000,
          overtimeRate: parseFloat(profileOvertimeRate) || 180,
        },
        bankDetails: {
          accountNumber: profileAccNum.trim(),
          ifsc: profileIfsc.trim().toUpperCase(),
          bankName: profileBankName.trim(),
        },
        emergencyContact: {
          name: profileEmergName.trim(),
          phone: normalizedEmergPhone,
        },
      });
      addToast("success", "Profile Updated", `Workforce profile updated for ${profileName.trim() || selectedStaff.name}`);
      setIsEditProfileOpen(false);
      fetchStaff();
    } catch (err: unknown) {
      const errObj = (err as { response?: { data?: { error?: { message?: string } | string; message?: string } } })?.response?.data;
      const errorMsg = (typeof errObj?.error === "object" ? errObj?.error?.message : errObj?.error) || errObj?.message || "Could not update profile.";
      addToast("error", "Update Failed", errorMsg);
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from DineFlow?`)) return;
    try {
      await apiClient.delete(`/staff/${id}`);
      addToast("info", "Staff Member Removed", `Removed ${name} from this workspace.`);
      setStaffList((prev) => prev.filter((s) => s.id !== id));
    } catch {
      addToast("error", "Remove Failed", "Could not remove staff member.");
    }
  };

  // Display staff list directly
  const displayStaff = staffList;

  // ── Monthly & Weekly Attendance Timesheet Matrix Computation ──────────────
  const todayStr = new Date().toISOString().substring(0, 10);

  const matrixDays = React.useMemo(() => {
    if (attendancePeriod === "week") {
      const d = new Date(attendanceSelectedDate || new Date());
      const day = d.getDay();
      const diffToMon = d.getDate() - day + (day === 0 ? -6 : 1);
      const mon = new Date(d.setDate(diffToMon));
      return Array.from({ length: 7 }, (_, i) => {
        const cur = new Date(mon);
        cur.setDate(mon.getDate() + i);
        const dateStr = cur.toISOString().substring(0, 10);
        const dayNum = cur.getDate();
        const dayOfWeek = cur.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const weekdayShort = cur.toLocaleDateString("en-US", { weekday: "short" });
        const weekdayLetter = weekdayShort.charAt(0);
        const isToday = dateStr === todayStr;
        return { dayNum, dateStr, isWeekend, weekdayShort, weekdayLetter, isToday };
      });
    }

    const parts = (attendanceSelectedMonth || new Date().toISOString().substring(0, 7)).split("-");
    const y = parseInt(parts[0], 10) || new Date().getFullYear();
    const m = parseInt(parts[1], 10) || new Date().getMonth() + 1;
    const totalDays = new Date(y, m, 0).getDate();

    return Array.from({ length: totalDays }, (_, i) => {
      const dayNum = i + 1;
      const dateStr = `${parts[0]}-${String(m).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      const dateObj = new Date(y, m - 1, dayNum);
      const dayOfWeek = dateObj.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const weekdayShort = dateObj.toLocaleDateString("en-US", { weekday: "short" });
      const weekdayLetter = weekdayShort.charAt(0);
      const isToday = dateStr === todayStr;
      return { dayNum, dateStr, isWeekend, weekdayShort, weekdayLetter, isToday };
    });
  }, [attendancePeriod, attendanceSelectedMonth, attendanceSelectedDate, todayStr]);

  const attendanceStaffList = React.useMemo(() => {
    const staffMap = new Map<string, { id: string; name: string; employeeId: string; department: string; role: string }>();
    for (const s of displayStaff) {
      if (attendanceFilterStaff !== "all" && s.id !== attendanceFilterStaff) continue;
      if (attendanceFilterDept !== "all" && s.department !== attendanceFilterDept) continue;
      staffMap.set(s.id, {
        id: s.id,
        name: s.name,
        employeeId: s.employeeId || "DF-EMP",
        department: s.department || "Operations",
        role: s.role || "Staff",
      });
    }
    for (const rec of periodAttendance) {
      if (rec.userId && !staffMap.has(rec.userId)) {
        if (attendanceFilterStaff !== "all" && rec.userId !== attendanceFilterStaff) continue;
        if (attendanceFilterDept !== "all" && rec.department !== attendanceFilterDept) continue;
        staffMap.set(rec.userId, {
          id: rec.userId,
          name: rec.employeeName || "Staff Member",
          employeeId: rec.employeeId || "DF-EMP",
          department: rec.department || "Operations",
          role: "Staff",
        });
      }
    }
    return Array.from(staffMap.values());
  }, [displayStaff, periodAttendance, attendanceFilterStaff, attendanceFilterDept]);

  const attendanceLookup = React.useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    for (const rec of periodAttendance) {
      if (rec.userId && rec.date) {
        map.set(`${rec.userId}_${rec.date}`, rec);
      }
    }
    return map;
  }, [periodAttendance]);

  const staffStats = React.useMemo(() => {
    const stats = new Map<string, { present: number; late: number; halfDay: number; absent: number; leave: number; totalHours: number }>();
    for (const staff of attendanceStaffList) {
      let present = 0;
      let late = 0;
      let halfDay = 0;
      let absent = 0;
      let leave = 0;
      let totalHours = 0;

      for (const d of matrixDays) {
        const rec = attendanceLookup.get(`${staff.id}_${d.dateStr}`);
        if (rec) {
          if (rec.status === "present") present++;
          else if (rec.status === "late") late++;
          else if (rec.status === "half_day") halfDay++;
          else if (rec.status === "absent") absent++;
          else if (rec.status === "leave") leave++;

          if (rec.workingHours) {
            totalHours += rec.workingHours;
          }
        }
      }
      stats.set(staff.id, { present, late, halfDay, absent, leave, totalHours: Math.round(totalHours * 10) / 10 });
    }
    return stats;
  }, [attendanceStaffList, matrixDays, attendanceLookup]);

  const handleCellClick = (staffId: string, date: string) => {
    setManualStaffId(staffId);
    setManualDate(date);
    const existing = attendanceLookup.get(`${staffId}_${date}`);
    if (existing) {
      setManualStatus(existing.status);
      if (existing.checkInTime) {
        const d = new Date(existing.checkInTime);
        setManualCheckIn(d.toTimeString().substring(0, 5));
      }
      if (existing.checkOutTime) {
        const d = new Date(existing.checkOutTime);
        setManualCheckOut(d.toTimeString().substring(0, 5));
      }
      const breakMins = existing.breakMinutes ?? (existing.breakHours ? Math.round(existing.breakHours * 60) : 60);
      setManualBreakMinutes(String(breakMins));
      setManualReason(existing.manualReason || existing.notes || "Manager manual correction");
    } else {
      setManualStatus("present");
      setManualCheckIn("09:00");
      setManualCheckOut("18:00");
      setManualBreakMinutes("60");
      setManualReason("Staff WhatsApp unavailable / device failure");
    }
    setIsManualAttendanceOpen(true);
  };

  // Geofence status calculation
  const isInsideGeofence = gpsDistance !== null ? gpsDistance <= geofence.radiusMeters : true;

  return (
    <div className="space-y-6">
      {/* ── TAB 1: STAFF DIRECTORY & PROFILES ─────────────────────────────────── */}
      {activeTab === "staff" && (
        <div className="space-y-6">
          {/* Header & Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                <span>Staff & Permissions</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Staff Directory & Profiles</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <Users className="h-7 w-7 text-emerald-500" /> Staff Directory & Profiles
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Manage employee roster, roles, statutory CTC structures, bank details, and WhatsApp onboarding.
              </p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button variant="outline" size="sm" onClick={fetchStaff} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
                Refresh
              </Button>
              <Button variant="glow" size="sm" onClick={() => setIsInviteOpen(true)} leftIcon={<UserPlus className="h-4 w-4" />}>
                Invite Staff
              </Button>
            </div>
          </div>

          {/* Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card variant="glass" hoverEffect className="min-w-0 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Workforce</span>
                <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Shield className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  <NumberFlow value={displayStaff.length} />
                </span>
                <span className="text-[11px] text-slate-400">enrolled</span>
              </div>
            </Card>

            <Card variant="glass" hoverEffect className="min-w-0 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active On Duty</span>
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                  <NumberFlow value={todayAttendance.filter((a) => a.checkInTime).length} />
                </span>
                <span className="text-[11px] text-slate-400">clocked in</span>
              </div>
            </Card>

            <Card variant="glass" hoverEffect className="min-w-0 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Departments</span>
                <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Building className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400">
                  <NumberFlow value={new Set(displayStaff.map((s) => s.department || "Operations")).size} />
                </span>
                <span className="text-[11px] text-slate-400">functional</span>
              </div>
            </Card>

            <Card variant="glass" hoverEffect className="min-w-0 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Full-Time Staff</span>
                <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Briefcase className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-purple-600 dark:text-purple-400">
                  <NumberFlow value={displayStaff.filter((s) => s.employmentType !== "part_time").length} />
                </span>
                <span className="text-[11px] text-slate-400">regular</span>
              </div>
            </Card>
          </div>

          <Card variant="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Staff Roster & Statutory Metadata</CardTitle>
              <CardDescription className="text-xs">
                Departments, shifts, CTC structures, bank verification, and emergency contacts.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="min-w-[750px]">
                <TableHeader className="sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm z-10">
                  <TableRow className="text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <TableHead className="py-3.5 pl-6">Employee</TableHead>
                    <TableHead className="py-3.5">Department</TableHead>
                    <TableHead className="py-3.5">Role</TableHead>
                    <TableHead className="py-3.5 hidden md:table-cell">Shift</TableHead>
                    <TableHead className="py-3.5 hidden md:table-cell">Basic CTC</TableHead>
                    <TableHead className="py-3.5">Status</TableHead>
                    <TableHead className="py-3.5 text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {loading && staffList.length === 0 ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={`staff-skel-${i}`} className="animate-pulse">
                        <TableCell className="py-3.5 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                            <div className="space-y-1.5">
                              <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                              <div className="h-3 w-36 bg-slate-100 dark:bg-slate-800/60 rounded" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5"><div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" /></TableCell>
                        <TableCell className="py-3.5"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" /></TableCell>
                        <TableCell className="py-3.5 hidden md:table-cell"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" /></TableCell>
                        <TableCell className="py-3.5 hidden md:table-cell"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" /></TableCell>
                        <TableCell className="py-3.5"><div className="h-5 w-14 bg-slate-200 dark:bg-slate-800 rounded-full" /></TableCell>
                        <TableCell className="py-3.5 text-right pr-6"><div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : displayStaff.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12">
                        <EmptyState
                          compact
                          icon={<Briefcase className="h-6 w-6 text-slate-400" />}
                          title="No staff members found"
                          description="Add team members to track attendance, calculate payroll, and assign shifts."
                          action={{
                            label: "Enroll Staff",
                            icon: <UserPlus className="h-3.5 w-3.5" />,
                            onClick: () => setIsInviteOpen(true),
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayStaff.map((member) => (
                    <TableRow key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <TableCell className="py-3.5 pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar fallback={member.name} size="sm" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900 dark:text-white">{member.name}</p>
                              {member.employeeId && (
                                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                  {member.employeeId}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {member.phone ? (
                                <a
                                  href={`https://wa.me/${member.phone.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                                >
                                  <MessageSquare className="w-2.5 h-2.5" />
                                  {member.phone}
                                </a>
                              ) : (
                                <span className="text-[10px] text-amber-600 dark:text-amber-400">
                                  No WhatsApp phone
                                </span>
                              )}
                              {member.email && (
                                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                  &bull; {member.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {member.department || (member.role === "owner" || member.role === "manager" ? "Management" : "Floor Service")}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span className="capitalize font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/60">
                          {member.role}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 hidden md:table-cell text-slate-600 dark:text-slate-400">
                        {member.shiftName || "Morning (09:00 - 18:00)"}
                      </TableCell>
                      <TableCell className="py-3.5 hidden md:table-cell font-semibold text-slate-900 dark:text-white">
                        {currentUser?.role !== "manager" || (member.role !== "owner" && member.role !== "manager")
                          ? `₹${(member.salary?.basic || 25000).toLocaleString("en-IN")}/mo`
                          : "Confidential"}
                      </TableCell>
                      <TableCell className="py-3.5">
                        <Badge variant={member.status === "active" ? "success" : "warning"} dot size="sm">
                          {member.status === "active" ? "Active" : "Invited"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3.5 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          {member.phone && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-500/10"
                              onClick={() => handleSendStaffWhatsAppInvite(member)}
                              title={`Send WhatsApp Workforce Onboarding to ${member.phone}`}
                            >
                              <MessageSquare className="h-3.5 w-3.5 mr-1" /> WhatsApp
                            </Button>
                          )}
                          {(currentUser?.role !== "manager" || (member.role !== "owner" && member.role !== "manager")) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-500/10"
                              onClick={() => handleOpenEditProfile(member)}
                            >
                              <Edit2 className="h-3.5 w-3.5 mr-1" /> Profile
                            </Button>
                          )}
                          {currentUser?.role !== "manager" && member.role !== "owner" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                              onClick={() => handleDeleteStaff(member.id, member.name)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 2: LIVE ATTENDANCE & MULTI-SCALE ROSTER INTELLIGENCE ─────────── */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          {/* Header & Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                <span>Staff & Permissions</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Attendance & Geofencing</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <MapPin className="h-7 w-7 text-emerald-500" /> Attendance & Geofencing Station
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Real-time GPS geofence validation, timeclock terminal, manager manual override, and monthly timesheet matrix.
              </p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Clock className={`h-3.5 w-3.5 ${isClockedIn ? "text-emerald-500" : "text-slate-500"}`} />}
                onClick={() => setIsMyClockInModalOpen(true)}
              >
                {isClockedIn ? (isOnBreak ? "On Break ☕" : "Clocked In") : "My Clock-In"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Navigation className="h-3.5 w-3.5 text-emerald-500" />}
                onClick={() => setIsGeofenceModalOpen(true)}
              >
                Geofence ({geofence.radiusMeters}m)
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={handleExportAttendanceCSV}
              >
                Export CSV
              </Button>
              <Button
                variant="glow"
                size="sm"
                leftIcon={<UserCheck className="h-4 w-4" />}
                onClick={() => {
                  setManualStaffId(displayStaff[0]?.id || "");
                  setManualDate(new Date().toISOString().substring(0, 10));
                  setManualStatus("present");
                  setManualCheckIn("09:00");
                  setManualCheckOut("18:00");
                  setManualBreakMinutes("60");
                  setManualReason("Staff WhatsApp unavailable / device failure");
                  setIsManualAttendanceOpen(true);
                }}
              >
                Manual Override
              </Button>
            </div>
          </div>

          {/* Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card variant="glass" hoverEffect className="min-w-0 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Clocked In Today</span>
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                  <NumberFlow value={todayAttendance.filter((a) => a.checkInTime).length} />
                </span>
                <span className="text-[11px] text-slate-400">active</span>
              </div>
            </Card>

            <Card variant="glass" hoverEffect className="min-w-0 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">On-Time Rate</span>
                <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-blue-600 dark:text-blue-400">
                  {todayAttendance.length > 0
                    ? Math.round((todayAttendance.filter((a) => a.status === "present").length / todayAttendance.length) * 100)
                    : 100}%
                </span>
                <span className="text-[11px] text-slate-400">punctuality</span>
              </div>
            </Card>

            <Card variant="glass" hoverEffect className="min-w-0 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Late Arrivals</span>
                <div className="h-8 w-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <AlertCircle className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400">
                  <NumberFlow value={todayAttendance.filter((a) => a.status === "late").length} />
                </span>
                <span className="text-[11px] text-slate-400">today</span>
              </div>
            </Card>

            <Card variant="glass" hoverEffect className="min-w-0 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Unmarked / Absent</span>
                <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <XCircle className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400">
                  <NumberFlow value={Math.max(0, displayStaff.length - todayAttendance.length)} />
                </span>
                <span className="text-[11px] text-slate-400">pending</span>
              </div>
            </Card>
          </div>

          {/* Attendance Register Table & Timesheet Matrix */}
          <Card variant="glass">
            <CardHeader className="space-y-3 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <span>
                      {attendancePeriod === "day"
                        ? `Daily Attendance (${attendanceSelectedDate})`
                        : attendancePeriod === "week"
                        ? "Weekly Attendance Register"
                        : attendancePeriod === "month"
                        ? `Monthly Attendance (${attendanceSelectedMonth})`
                        : attendancePeriod === "year"
                        ? `Annual Attendance (${attendanceSelectedYear})`
                        : "Custom Range Attendance"}
                    </span>
                    <Badge variant="neutral" size="sm">
                      {attendanceViewMode === "matrix" ? `${attendanceStaffList.length} staff` : `${periodAttendance.length} records`}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {attendanceViewMode === "matrix"
                      ? "Staff timesheet calendar matrix. Click any day cell to view or mark attendance."
                      : "Detailed punch timestamps, working hours, verification channel, and manager override notes."}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* View Switcher: Matrix Grid vs Detailed Audit Log */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => setAttendanceViewMode("matrix")}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        attendanceViewMode === "matrix"
                          ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Timesheet</span> Grid
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttendanceViewMode("table")}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        attendanceViewMode === "table"
                          ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      <List className="h-3.5 w-3.5" />
                      Audit Log
                    </button>
                  </div>

                  <Button variant="outline" size="sm" onClick={fetchPeriodAttendance} leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${attendanceLoading ? "animate-spin" : ""}`} />}>
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Integrated Period & Filter Toolbar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                {/* Period Selector Tabs */}
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 overflow-x-auto max-w-full">
                  {[
                    { id: "day", label: "Day", icon: Calendar },
                    { id: "week", label: "Week", icon: CalendarRange },
                    { id: "month", label: "Month", icon: CalendarCheck },
                    { id: "year", label: "Year", icon: Clock },
                    { id: "custom", label: "Custom", icon: SlidersHorizontal },
                  ].map((p) => {
                    const Icon = p.icon;
                    const isActive = attendancePeriod === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setAttendancePeriod(p.id as typeof attendancePeriod);
                          if (p.id === "month" || p.id === "week") {
                            setAttendanceViewMode("matrix");
                          } else if (p.id === "day") {
                            setAttendanceViewMode("table");
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                          isActive
                            ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                {/* Date Controls & Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                  {attendancePeriod === "day" && (
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="date"
                        value={attendanceSelectedDate}
                        onChange={(e) => setAttendanceSelectedDate(e.target.value)}
                        className="w-36 text-xs py-1 h-8"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs px-2.5"
                        onClick={() => setAttendanceSelectedDate(new Date().toISOString().substring(0, 10))}
                      >
                        Today
                      </Button>
                    </div>
                  )}

                  {attendancePeriod === "week" && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs px-2"
                        onClick={() => {
                          const d = new Date(attendanceSelectedDate || new Date());
                          d.setDate(d.getDate() - 7);
                          setAttendanceSelectedDate(d.toISOString().substring(0, 10));
                        }}
                      >
                        &larr; Prev
                      </Button>
                      <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                        {(() => {
                          const d = new Date(attendanceSelectedDate || new Date());
                          const day = d.getDay();
                          const diffToMon = d.getDate() - day + (day === 0 ? -6 : 1);
                          const mon = new Date(d.setDate(diffToMon));
                          const sun = new Date(mon);
                          sun.setDate(mon.getDate() + 6);
                          return `${mon.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${sun.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
                        })()}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs px-2"
                        onClick={() => {
                          const d = new Date(attendanceSelectedDate || new Date());
                          d.setDate(d.getDate() + 7);
                          setAttendanceSelectedDate(d.toISOString().substring(0, 10));
                        }}
                      >
                        Next &rarr;
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs px-2"
                        onClick={() => setAttendanceSelectedDate(new Date().toISOString().substring(0, 10))}
                      >
                        This Week
                      </Button>
                    </div>
                  )}

                  {attendancePeriod === "month" && (
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="month"
                        value={attendanceSelectedMonth}
                        onChange={(e) => setAttendanceSelectedMonth(e.target.value)}
                        className="w-36 text-xs py-1 h-8"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs px-2.5"
                        onClick={() => setAttendanceSelectedMonth(new Date().toISOString().substring(0, 7))}
                      >
                        This Month
                      </Button>
                    </div>
                  )}

                  {attendancePeriod === "year" && (
                    <div className="flex items-center gap-1.5">
                      <select
                        value={attendanceSelectedYear}
                        onChange={(e) => setAttendanceSelectedYear(e.target.value)}
                        className="rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-1 outline-none h-8 text-slate-900 dark:text-white"
                      >
                        {[2026, 2025, 2024, 2023].map((yr) => (
                          <option key={yr} value={String(yr)}>
                            Year {yr}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs px-2.5"
                        onClick={() => setAttendanceSelectedYear(String(new Date().getFullYear()))}
                      >
                        This Year
                      </Button>
                    </div>
                  )}

                  {attendancePeriod === "custom" && (
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="date"
                        value={attendanceCustomStart}
                        onChange={(e) => setAttendanceCustomStart(e.target.value)}
                        className="w-32 text-xs py-1 h-8"
                      />
                      <span className="text-xs text-slate-400">to</span>
                      <Input
                        type="date"
                        value={attendanceCustomEnd}
                        onChange={(e) => setAttendanceCustomEnd(e.target.value)}
                        className="w-32 text-xs py-1 h-8"
                      />
                    </div>
                  )}

                  {/* Department Filter */}
                  <select
                    value={attendanceFilterDept}
                    onChange={(e) => setAttendanceFilterDept(e.target.value)}
                    className="rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 outline-none h-8 text-slate-900 dark:text-white"
                  >
                    <option value="all">All Departments</option>
                    {Array.from(new Set(displayStaff.map((s) => s.department).filter(Boolean))).map((dept) => (
                      <option key={dept} value={dept!}>
                        {dept}
                      </option>
                    ))}
                  </select>

                  {/* Staff Member Filter */}
                  <select
                    value={attendanceFilterStaff}
                    onChange={(e) => setAttendanceFilterStaff(e.target.value)}
                    className="rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 outline-none h-8 text-slate-900 dark:text-white max-w-[140px]"
                  >
                    <option value="all">All Staff ({displayStaff.length})</option>
                    {displayStaff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>

            {attendanceViewMode === "matrix" ? (
              <div className="space-y-0">
                {/* Visual Legend Bar */}
                <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50/80 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800 text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Status Key:</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-5 h-5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center border border-emerald-500/30 text-[10px]">P</span>
                      Present
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-5 h-5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold flex items-center justify-center border border-rose-500/30 text-[10px]">A</span>
                      Absent
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-5 h-5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center border border-amber-500/30 text-[10px]">L</span>
                      Late
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-5 h-5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center border border-indigo-500/30 text-[10px]">HD</span>
                      Half Day
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-5 h-5 rounded bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center border border-teal-500/30 text-[10px]">LV</span>
                      Leave
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-5 h-5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-500 font-medium flex items-center justify-center text-[9px]">OFF</span>
                      Weekend
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    💡 Click any cell to view details or mark attendance
                  </div>
                </div>

                {/* Timesheet Matrix Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <th className="py-3 px-4 sticky left-0 z-20 bg-slate-100 dark:bg-slate-800 min-w-[200px] border-r border-slate-200 dark:border-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                          Staff Member ({attendanceStaffList.length})
                        </th>
                        {matrixDays.map((d) => (
                          <th
                            key={d.dateStr}
                            className={`py-2 px-1 text-center min-w-[36px] max-w-[40px] border-r border-slate-200/60 dark:border-slate-800/60 ${
                              d.isToday
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold ring-1 ring-inset ring-emerald-500/40"
                                : d.isWeekend
                                ? "bg-slate-200/40 dark:bg-slate-800/40 text-slate-400"
                                : ""
                            }`}
                          >
                            <div className="text-[12px] font-mono leading-tight">{d.dayNum}</div>
                            <div className="text-[9px] font-normal uppercase text-slate-400 dark:text-slate-500 leading-tight">
                              {d.weekdayShort}
                            </div>
                          </th>
                        ))}
                        <th className="py-3 px-2 text-center min-w-[36px] bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold border-l border-slate-200 dark:border-slate-800" title="Total Present Days">
                          P
                        </th>
                        <th className="py-3 px-2 text-center min-w-[36px] bg-rose-50/60 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 font-bold" title="Total Absent Days">
                          A
                        </th>
                        <th className="py-3 px-2 text-center min-w-[36px] bg-amber-50/60 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-bold" title="Total Late Days">
                          L
                        </th>
                        <th className="py-3 px-2 text-center min-w-[36px] bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 font-bold" title="Total Half Days">
                          HD
                        </th>
                        <th className="py-3 px-2 text-center min-w-[36px] bg-teal-50/60 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 font-bold" title="Total Leave Days">
                          LV
                        </th>
                        <th className="py-3 px-3 text-right min-w-[70px] bg-slate-100/90 dark:bg-slate-800/90 font-bold border-l border-slate-200 dark:border-slate-800" title="Total Working Hours">
                          Hrs
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {attendanceStaffList.length === 0 ? (
                        <tr>
                          <td colSpan={matrixDays.length + 7} className="py-12">
                            <EmptyState
                              compact
                              icon={<Clock className="h-6 w-6 text-slate-400" />}
                              title="No staff members found"
                              description="Try adjusting your department or staff filter to view attendance."
                            />
                          </td>
                        </tr>
                      ) : (
                        attendanceStaffList.map((st) => {
                          const stats = staffStats.get(st.id) || { present: 0, late: 0, halfDay: 0, absent: 0, leave: 0, totalHours: 0 };
                          return (
                            <tr key={st.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-2.5 px-4 sticky left-0 z-10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/90 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                <div className="flex items-center gap-2.5">
                                  <Avatar fallback={st.name} size="sm" />
                                  <div className="min-w-0">
                                    <p className="font-semibold text-slate-900 dark:text-white text-xs truncate max-w-[130px]">{st.name}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="text-[10px] text-slate-400 font-mono">{st.employeeId}</span>
                                      <span className="text-[9px] px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 truncate max-w-[70px]">
                                        {st.department}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              {matrixDays.map((d) => {
                                const rec = attendanceLookup.get(`${st.id}_${d.dateStr}`);
                                const isPast = d.dateStr <= todayStr;
                                return (
                                  <td
                                    key={d.dateStr}
                                    className={`py-1.5 px-0.5 text-center border-r border-slate-200/50 dark:border-slate-800/50 ${
                                      d.isToday
                                        ? "bg-emerald-500/5 dark:bg-emerald-500/10"
                                        : d.isWeekend
                                        ? "bg-slate-100/30 dark:bg-slate-900/40"
                                        : ""
                                    }`}
                                  >
                                    {rec ? (
                                      <button
                                        type="button"
                                        onClick={() => handleCellClick(st.id, d.dateStr)}
                                        title={`${st.name} - ${d.dateStr}: ${
                                          rec.status === "present"
                                            ? "Present"
                                            : rec.status === "late"
                                            ? "Late"
                                            : rec.status === "half_day"
                                            ? "Half Day"
                                            : rec.status === "leave"
                                            ? "Leave"
                                            : "Absent"
                                        } (In: ${rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"} | Out: ${
                                          rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"
                                        } | ${rec.workingHours || 0}h) • Click to edit`}
                                        className={`w-7 h-7 mx-auto rounded-md font-bold text-[11px] flex items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-2xs ${
                                          rec.status === "present"
                                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500"
                                            : rec.status === "absent"
                                            ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 hover:border-rose-500"
                                            : rec.status === "late"
                                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:border-amber-500"
                                            : rec.status === "half_day"
                                            ? "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 hover:border-indigo-500"
                                            : "bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 hover:border-teal-500"
                                        }`}
                                      >
                                        {rec.status === "present"
                                          ? "P"
                                          : rec.status === "absent"
                                          ? "A"
                                          : rec.status === "late"
                                          ? "L"
                                          : rec.status === "half_day"
                                          ? "HD"
                                          : "LV"}
                                      </button>
                                    ) : isPast ? (
                                      d.isWeekend ? (
                                        <button
                                          type="button"
                                          onClick={() => handleCellClick(st.id, d.dateStr)}
                                          title={`${st.name} - ${d.dateStr}: Weekend • Click to record attendance`}
                                          className="w-7 h-7 mx-auto rounded-md text-[9px] font-semibold text-slate-400 dark:text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
                                        >
                                          OFF
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleCellClick(st.id, d.dateStr)}
                                          title={`${st.name} - ${d.dateStr}: Not Recorded • Click to mark attendance`}
                                          className="w-7 h-7 mx-auto rounded-md text-slate-300 dark:text-slate-600 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 flex items-center justify-center transition-colors border border-dashed border-transparent hover:border-emerald-500/30 text-xs"
                                        >
                                          —
                                        </button>
                                      )
                                    ) : (
                                      <span className="w-7 h-7 mx-auto flex items-center justify-center text-slate-300 dark:text-slate-700 text-xs">
                                        —
                                      </span>
                                    )}
                                  </td>
                                );
                              })}
                              <td className="py-2.5 px-2 text-center font-bold text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/10 border-l border-slate-200 dark:border-slate-800">
                                {stats.present}
                              </td>
                              <td className="py-2.5 px-2 text-center font-bold text-xs text-rose-600 dark:text-rose-400 bg-rose-50/30 dark:bg-rose-950/10">
                                {stats.absent}
                              </td>
                              <td className="py-2.5 px-2 text-center font-bold text-xs text-amber-600 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-950/10">
                                {stats.late}
                              </td>
                              <td className="py-2.5 px-2 text-center font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/10">
                                {stats.halfDay}
                              </td>
                              <td className="py-2.5 px-2 text-center font-bold text-xs text-teal-600 dark:text-teal-400 bg-teal-50/30 dark:bg-teal-950/10">
                                {stats.leave}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-xs text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 border-l border-slate-200 dark:border-slate-800">
                                {stats.totalHours.toFixed(1)}h
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <CardContent className="p-0 overflow-x-auto">
                <Table className="min-w-[850px]">
                  <TableHeader className="sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm z-10">
                    <TableRow className="text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <TableHead className="py-3.5 pl-6">Date</TableHead>
                      <TableHead className="py-3.5">Staff Member</TableHead>
                      <TableHead className="py-3.5">Department</TableHead>
                      <TableHead className="py-3.5">Check-In</TableHead>
                      <TableHead className="py-3.5">Check-Out</TableHead>
                      <TableHead className="py-3.5">Working Hours</TableHead>
                      <TableHead className="py-3.5">Status</TableHead>
                      <TableHead className="py-3.5">Verification Source</TableHead>
                      <TableHead className="py-3.5 text-right pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {periodAttendance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="py-12">
                          <EmptyState
                            compact
                            icon={<Clock className="h-6 w-6 text-slate-400" />}
                            title="No attendance records found for this period"
                            description="Staff members can clock in via WhatsApp or GPS, or you can record attendance manually using 'Mark Staff Attendance'."
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      periodAttendance.map((rec) => (
                        <TableRow key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <TableCell className="py-3.5 pl-6 font-mono text-xs text-slate-700 dark:text-slate-300">
                            {rec.date}
                          </TableCell>
                          <TableCell className="py-3.5">
                            <div className="flex items-center gap-2.5">
                              <Avatar fallback={rec.employeeName} size="sm" />
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white text-xs">{rec.employeeName}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{rec.employeeId}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3.5 text-xs text-slate-600 dark:text-slate-400">
                            {rec.department || "Operations"}
                          </TableCell>
                          <TableCell className="py-3.5 font-mono text-xs text-slate-800 dark:text-slate-200">
                            {rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                          </TableCell>
                          <TableCell className="py-3.5 font-mono text-xs text-slate-800 dark:text-slate-200">
                            {rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : (rec.isOnBreak ? "On Break ☕" : "In Progress")}
                          </TableCell>
                          <TableCell className="py-3.5 font-semibold text-xs text-slate-900 dark:text-white">
                            {rec.workingHours ? `${rec.workingHours}h` : "—"}
                            {rec.overtimeHours > 0 && <span className="text-[10px] text-emerald-500 ml-1">(+{rec.overtimeHours} OT)</span>}
                          </TableCell>
                          <TableCell className="py-3.5">
                            <Badge
                              variant={
                                rec.status === "present"
                                  ? "success"
                                  : rec.status === "late"
                                  ? "warning"
                                  : rec.status === "half_day"
                                  ? "warning"
                                  : rec.status === "leave"
                                  ? "info"
                                  : "danger"
                              }
                              dot
                              size="sm"
                            >
                              {rec.status === "late"
                                ? "Late"
                                : rec.status === "present"
                                ? "Present"
                                : rec.status === "half_day"
                                ? "Half Day"
                                : rec.status === "leave"
                                ? "Leave"
                                : "Absent"}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3.5 text-xs">
                            {rec.isManualOverride ? (
                              <span
                                title={rec.manualReason || rec.notes || "Marked by manager"}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-semibold text-[10px]"
                              >
                                <UserCog className="h-3 w-3" />
                                Manual ({rec.markedByName || "Manager"})
                              </span>
                            ) : rec.checkInDistance ? (
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                                <MapPin className="h-3 w-3" />
                                GPS ({rec.checkInDistance.toFixed(0)}m)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                                <MessageSquare className="h-3 w-3 text-emerald-500" />
                                WhatsApp Bot
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="py-3.5 text-right pr-6">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs px-2"
                              onClick={() => {
                                setManualStaffId(rec.userId);
                                setManualDate(rec.date);
                                setManualStatus(rec.status);
                                if (rec.checkInTime) {
                                  const d = new Date(rec.checkInTime);
                                  setManualCheckIn(d.toTimeString().substring(0, 5));
                                }
                                if (rec.checkOutTime) {
                                  const d = new Date(rec.checkOutTime);
                                  setManualCheckOut(d.toTimeString().substring(0, 5));
                                }
                                setManualReason(rec.manualReason || "Manager manual correction");
                                setIsManualAttendanceOpen(true);
                              }}
                            >
                              <Edit2 className="h-3 w-3 mr-1" /> Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* ── TAB 3: SHIFT SCHEDULING ───────────────────────────────────────────── */}
      {activeTab === "shifts" && (
        <div className="space-y-6">
          {/* Header & Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                <span>Staff & Permissions</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Shift Scheduling</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <Clock className="h-7 w-7 text-emerald-500" /> Shift Scheduling & Rostering
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Define working hours, grace periods, lunch breaks, and automated staff shift rosters.
              </p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                variant="glow"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => addToast("info", "Add Shift", "Shift templates are active. Select any staff profile to assign them to shifts.")}
              >
                Add Shift
              </Button>
            </div>
          </div>

          {/* Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card variant="glass" hoverEffect className="min-w-0 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Configured Shifts</span>
                <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <CalendarRange className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  <NumberFlow value={shifts.length || 3} />
                </span>
                <span className="text-[11px] text-slate-400">templates</span>
              </div>
            </Card>

            <Card variant="glass" hoverEffect className="min-w-0 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Morning Shift</span>
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                  <NumberFlow value={displayStaff.filter((s) => !s.shiftName || s.shiftName.toLowerCase().includes("morning")).length} />
                </span>
                <span className="text-[11px] text-slate-400">assigned</span>
              </div>
            </Card>

            <Card variant="glass" hoverEffect className="min-w-0 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Evening / Night</span>
                <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Coffee className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-purple-600 dark:text-purple-400">
                  <NumberFlow value={displayStaff.filter((s) => s.shiftName && (s.shiftName.toLowerCase().includes("evening") || s.shiftName.toLowerCase().includes("night"))).length} />
                </span>
                <span className="text-[11px] text-slate-400">assigned</span>
              </div>
            </Card>

            <Card variant="glass" hoverEffect className="min-w-0 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Grace Standard</span>
                <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400">
                  15
                </span>
                <span className="text-[11px] text-slate-400">mins standard</span>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(shifts.length > 0
              ? shifts
              : [
                  { id: "s1", name: "Morning Shift", startTime: "09:00", endTime: "18:00", graceMinutes: 15, breakMinutes: 60, isDefault: true },
                  { id: "s2", name: "Evening Shift", startTime: "14:00", endTime: "23:00", graceMinutes: 15, breakMinutes: 45, isDefault: false },
                  { id: "s3", name: "Night Shift", startTime: "22:00", endTime: "07:00", graceMinutes: 15, breakMinutes: 60, isDefault: false },
                ]
            ).map((sh) => (
              <Card key={sh.id} variant="glass" className={sh.isDefault ? "border-emerald-500/30" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{sh.name}</CardTitle>
                    {sh.isDefault && <Badge variant="success" size="sm">Default</Badge>}
                  </div>
                  <CardDescription className="text-xs">
                    Standard shift hours with automated late arrival detection.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Working Hours</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                      {sh.startTime} – {sh.endTime}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center">
                      <p className="text-slate-400 text-[10px]">Grace Period</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{sh.graceMinutes} mins</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center">
                      <p className="text-slate-400 text-[10px]">Break Allowance</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{sh.breakMinutes} mins</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: LEAVE MANAGEMENT ───────────────────────────────────────────── */}
      {activeTab === "leaves" && (
        <div className="space-y-6">
          {/* Header & Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                <span>Staff & Permissions</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Leave Management</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <CalendarCheck className="h-7 w-7 text-emerald-500" /> Leave Management & Approval Desk
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Review pending time-off requests, statutory leave balances, and approval audit registers.
              </p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                variant="glow"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setIsApplyLeaveOpen(true)}
              >
                + Record Staff Leave
              </Button>
            </div>
          </div>

          {/* Management Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card variant="glass" hoverEffect className="min-w-0 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Approvals</span>
                <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <CalendarCheck className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400">
                  <NumberFlow value={leaves.filter((l) => l.status === "pending").length} />
                </span>
                <span className="text-[11px] text-slate-400">action required</span>
              </div>
            </Card>

            <Card variant="glass" hoverEffect className="min-w-0 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">On Leave Today</span>
                <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Coffee className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-blue-600 dark:text-blue-400">
                  <NumberFlow value={leaves.filter((l) => l.status === "approved" && l.startDate <= todayStr && l.endDate >= todayStr).length} />
                </span>
                <span className="text-[11px] text-slate-400">absent</span>
              </div>
            </Card>

            <Card variant="glass" hoverEffect className="min-w-0 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Approved This Month</span>
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                  <NumberFlow value={leaves.filter((l) => l.status === "approved" && l.startDate.startsWith(new Date().toISOString().substring(0, 7))).length} />
                </span>
                <span className="text-[11px] text-slate-400">scheduled</span>
              </div>
            </Card>

            <Card variant="glass" hoverEffect className="min-w-0 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Processed Requests</span>
                <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Shield className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-purple-600 dark:text-purple-400">
                  <NumberFlow value={leaves.filter((l) => l.status !== "pending").length} />
                </span>
                <span className="text-[11px] text-slate-400">completed</span>
              </div>
            </Card>
          </div>

          {/* Leave Requests Table */}
          <Card variant="glass">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
              <div>
                <CardTitle className="text-base sm:text-lg">Leave Applications & Approvals Queue</CardTitle>
                <CardDescription className="text-xs">
                  Review, approve, or reject employee leave requests. Approvals automatically sync with payroll deductions.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Filter Tabs: All, Pending, Approved, Rejected */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
                  {(["all", "pending", "approved", "rejected"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setLeaveStatusFilter(st)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                        leaveStatusFilter === st
                          ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      <span>{st === "all" ? "All" : st}</span>
                      {st === "pending" && leaves.filter((l) => l.status === "pending").length > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                          {leaves.filter((l) => l.status === "pending").length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader className="sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm z-10">
                  <TableRow className="text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <TableHead className="py-3.5 pl-6">Employee</TableHead>
                    <TableHead className="py-3.5">Leave Type</TableHead>
                    <TableHead className="py-3.5">Duration</TableHead>
                    <TableHead className="py-3.5">Reason</TableHead>
                    <TableHead className="py-3.5">Status</TableHead>
                    <TableHead className="py-3.5 text-right pr-6">Manager Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {(() => {
                    const filteredLeaves = leaves.filter((lv) => leaveStatusFilter === "all" || lv.status === leaveStatusFilter);
                    if (filteredLeaves.length === 0) {
                      return (
                        <TableRow>
                          <TableCell colSpan={6} className="py-12">
                            <EmptyState
                              compact
                              icon={<CalendarCheck className="h-6 w-6 text-slate-400" />}
                              title={leaveStatusFilter === "all" ? "No leave applications yet" : `No ${leaveStatusFilter} leave applications`}
                              description="Staff leave requests submitted via WhatsApp or dashboard will show here."
                              action={{
                                label: "+ Record Staff Leave",
                                icon: <Plus className="h-3.5 w-3.5" />,
                                onClick: () => setIsApplyLeaveOpen(true),
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    }
                    return filteredLeaves.map((lv) => (
                      <TableRow key={lv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <TableCell className="py-3.5 pl-6">
                          <p className="font-semibold text-slate-900 dark:text-white">{lv.employeeName || "Employee"}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{lv.employeeId || "DF-EMP"}</p>
                        </TableCell>
                        <TableCell className="py-3.5 capitalize font-medium text-slate-700 dark:text-slate-300">
                          {lv.leaveType} {lv.isHalfDay && "(Half-Day)"}
                        </TableCell>
                        <TableCell className="py-3.5 text-slate-800 dark:text-slate-200">
                          <span className="font-medium">{lv.startDate}</span> to <span className="font-medium">{lv.endDate}</span>
                          <span className="text-slate-400 text-[11px] block">{lv.daysCount} days</span>
                        </TableCell>
                        <TableCell className="py-3.5 max-w-[200px] truncate text-slate-600 dark:text-slate-400">
                          {lv.reason || "Personal"}
                        </TableCell>
                        <TableCell className="py-3.5">
                          <Badge
                            variant={lv.status === "approved" ? "success" : lv.status === "rejected" ? "danger" : "warning"}
                            dot
                            size="sm"
                          >
                            {lv.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3.5 text-right pr-6">
                          {lv.status === "pending" ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="glow"
                                size="sm"
                                className="h-7 text-xs px-2.5"
                                onClick={() => handleApproveLeave(lv.id)}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs px-2.5 text-rose-500 hover:bg-rose-500/10"
                                onClick={() => {
                                  setRejectingLeaveId(lv.id);
                                  setIsRejectModalOpen(true);
                                }}
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              {lv.approvedBy ? `By ${lv.approvedBy}` : "Completed"}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ));
                  })()}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 5: PAYROLL & PAYSLIPS ─────────────────────────────────────────── */}
      {activeTab === "payroll" && (
        <div className="space-y-6">
          {/* Header & Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                <span>Staff & Permissions</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Payroll & Payslips</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <DollarSign className="h-7 w-7 text-emerald-500" /> Indian Payroll & Digital Payslips
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Automated salary calculation based on verified attendance, statutory EPF/ESI deductions, and digital payslips.
              </p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <input
                type="month"
                value={selectedPayrollMonth}
                onChange={(e) => {
                  setSelectedPayrollMonth(e.target.value);
                  fetchPayroll(e.target.value);
                }}
                className="rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 outline-none shadow-2xs"
              />
              <Button
                variant="glow"
                size="sm"
                leftIcon={<Sparkles className="h-3.5 w-3.5" />}
                onClick={handleRunPayroll}
              >
                Run Payroll
              </Button>
            </div>
          </div>

          {/* Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card variant="glass" hoverEffect className="min-w-0 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gross Payroll Outflow</span>
                <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  ₹{payrollRecords.reduce((acc, r) => acc + (r.grossEarnings || 0), 0).toLocaleString("en-IN")}
                </span>
                <span className="text-[11px] text-slate-400">gross</span>
              </div>
            </Card>

            <Card variant="glass" hoverEffect className="min-w-0 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Net Disbursed</span>
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CreditCard className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                  ₹{payrollRecords.reduce((acc, r) => acc + (r.netPay || 0), 0).toLocaleString("en-IN")}
                </span>
                <span className="text-[11px] text-slate-400">net pay</span>
              </div>
            </Card>

            <Card variant="glass" hoverEffect className="min-w-0 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Deductions</span>
                <div className="h-8 w-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <FileText className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400">
                  ₹{payrollRecords.reduce((acc, r) => acc + (r.deductions || 0), 0).toLocaleString("en-IN")}
                </span>
                <span className="text-[11px] text-slate-400">PF + PT</span>
              </div>
            </Card>

            <Card variant="glass" hoverEffect className="min-w-0 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Processed Slips</span>
                <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Award className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-purple-600 dark:text-purple-400">
                  <NumberFlow value={payrollRecords.length} />
                </span>
                <span className="text-[11px] text-slate-400">generated</span>
              </div>
            </Card>
          </div>

          {/* Payroll Register Table */}
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base sm:text-lg">Generated Payslips &bull; {selectedPayrollMonth}</CardTitle>
                <CardDescription className="text-xs">
                  Official employee salary statements with statutory deductions and net disbursements.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader className="sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm z-10">
                  <TableRow className="text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <TableHead className="py-3.5 pl-6">Employee</TableHead>
                    <TableHead className="py-3.5">Designation</TableHead>
                    <TableHead className="py-3.5">Days / OT</TableHead>
                    <TableHead className="py-3.5">Gross Pay</TableHead>
                    <TableHead className="py-3.5">Deductions (PF+PT)</TableHead>
                    <TableHead className="py-3.5">Net Pay (INR)</TableHead>
                    <TableHead className="py-3.5">Status</TableHead>
                    <TableHead className="py-3.5 text-right pr-6">Payslip</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {payrollRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12">
                        <EmptyState
                          compact
                          icon={<CreditCard className="h-6 w-6 text-slate-400" />}
                          title={`No payroll executed for ${selectedPayrollMonth} yet`}
                          description="Generate monthly staff compensation statements with PF, PT, and overtime."
                          action={{
                            label: "Run Payroll",
                            icon: <Sparkles className="h-3.5 w-3.5" />,
                            onClick: handleRunPayroll,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    payrollRecords.map((pay) => (
                      <TableRow key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <TableCell className="py-3.5 pl-6">
                          <p className="font-semibold text-slate-900 dark:text-white">{pay.employeeName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{pay.employeeId}</p>
                        </TableCell>
                        <TableCell className="py-3.5 capitalize text-slate-600 dark:text-slate-400">{pay.role}</TableCell>
                        <TableCell className="py-3.5 text-slate-800 dark:text-slate-200">
                          {pay.presentDays} days
                          {pay.overtimeHours > 0 && <span className="text-[10px] text-emerald-500 block">+{pay.overtimeHours}h OT</span>}
                        </TableCell>
                        <TableCell className="py-3.5 font-medium text-slate-900 dark:text-white">
                          ₹{pay.grossEarnings.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="py-3.5 text-rose-500 font-medium">
                          -₹{pay.deductions.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="py-3.5 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          ₹{pay.netPay.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="py-3.5">
                          <Badge variant="success" dot size="sm">
                            {pay.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3.5 text-right pr-6">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            leftIcon={<Eye className="h-3 w-3" />}
                            onClick={() => {
                              setActivePayslip(pay);
                              setIsPayslipModalOpen(true);
                            }}
                          >
                            View Payslip
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 6: HOLIDAYS CALENDAR ──────────────────────────────────────────── */}
      {activeTab === "holidays" && (
        <div className="space-y-6">
          {/* Header & Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                <span>Staff & Permissions</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Holidays Calendar</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <Award className="h-7 w-7 text-emerald-500" /> Company & Gazetted Holidays Calendar
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Official gazetted Indian national holidays, regional festivals, and restaurant scheduled off-days.
              </p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => addToast("info", "Add Holiday", "National gazetted holidays are synchronized for the current calendar year.")}
              >
                Add Custom Holiday
              </Button>
            </div>
          </div>

          {/* Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card variant="glass" hoverEffect className="min-w-0 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Holidays</span>
                <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Award className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  <NumberFlow value={holidays.length || 7} />
                </span>
                <span className="text-[11px] text-slate-400">scheduled</span>
              </div>
            </Card>

            <Card variant="glass" hoverEffect className="min-w-0 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Upcoming Holiday</span>
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-sm font-bold truncate text-emerald-600 dark:text-emerald-400">
                  {holidays.find((h) => h.date >= todayStr)?.name || "Diwali"}
                </span>
              </div>
            </Card>

            <Card variant="glass" hoverEffect className="min-w-0 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">National Gazetted</span>
                <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Shield className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-purple-600 dark:text-purple-400">
                  <NumberFlow value={holidays.filter((h) => h.type === "national").length || 3} />
                </span>
                <span className="text-[11px] text-slate-400">mandatory</span>
              </div>
            </Card>

            <Card variant="glass" hoverEffect className="min-w-0 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Festive & Custom</span>
                <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400">
                  <NumberFlow value={holidays.filter((h) => h.type !== "national").length || 4} />
                </span>
                <span className="text-[11px] text-slate-400">observances</span>
              </div>
            </Card>
          </div>
          <Card variant="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Official Holidays Calendar</CardTitle>
              <CardDescription className="text-xs">
                National and restaurant holidays integrated with attendance shift requirements.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader className="sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm z-10">
                  <TableRow className="text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <TableHead className="py-3.5 pl-6">Holiday Name</TableHead>
                    <TableHead className="py-3.5">Date</TableHead>
                    <TableHead className="py-3.5">Type</TableHead>
                    <TableHead className="py-3.5 text-right pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {holidays.map((h) => (
                    <TableRow key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <TableCell className="py-3.5 pl-6 font-semibold text-slate-900 dark:text-white">{h.name}</TableCell>
                      <TableCell className="py-3.5 font-mono text-slate-700 dark:text-slate-300">{h.date}</TableCell>
                      <TableCell className="py-3.5 capitalize">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium">
                          {h.type}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 text-right pr-6">
                        <Badge variant="info" size="sm">Scheduled</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── MODAL: INVITE STAFF ──────────────────────────────────────────────── */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Enroll Workforce Team Member"
        description="Add a staff member with WhatsApp access for attendance, shift rosters, leave requests, and GPS clock-in."
      >
        <form onSubmit={handleSendInvite} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Ramesh Kumar"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            required
          />

          <div>
            <Input
              label="WhatsApp Phone Number"
              placeholder="+91 98765 43210"
              value={invitePhone}
              onChange={(e) => {
                setInvitePhone(formatIndianPhoneInput(e.target.value));
                setInvitePhoneTouched(true);
              }}
              onBlur={() => setInvitePhoneTouched(true)}
              error={
                invitePhoneTouched && invitePhone && !validateIndianPhone(invitePhone).isValid
                  ? validateIndianPhone(invitePhone).error
                  : undefined
              }
              isSuccess={!!invitePhone && validateIndianPhone(invitePhone).isValid}
              required
              leftIcon={<MessageSquare className="h-4 w-4 text-emerald-600" />}
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Staff will use this number on WhatsApp to clock in via GPS, apply for leave, and view payslips.
            </p>
          </div>

          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="colleague@restaurant.com (Optional)"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => {
                  const role = e.target.value;
                  setInviteRole(role);
                  if (role === "manager") setInviteDepartment("Management");
                  else if (role === "chef") setInviteDepartment("Kitchen");
                  else if (role === "cashier") setInviteDepartment("Front Desk & Billing");
                  else if (role === "housekeeping") setInviteDepartment("Housekeeping");
                  else setInviteDepartment("Floor Service");
                }}
                className="w-full rounded-xl text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 outline-none"
              >
                {currentUser?.role !== "manager" && <option value="manager">Manager</option>}
                <option value="chef">Kitchen Chef</option>
                <option value="waiter">Floor Waiter</option>
                <option value="cashier">Cashier</option>
                <option value="housekeeping">Housekeeping</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Department</label>
              <select
                value={inviteDepartment}
                onChange={(e) => setInviteDepartment(e.target.value)}
                className="w-full rounded-xl text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 outline-none"
              >
                <option value="Kitchen">Kitchen</option>
                <option value="Floor Service">Floor Service</option>
                <option value="Front Desk & Billing">Front Desk & Billing</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Bar & Beverage">Bar & Beverage</option>
                <option value="Management">Management</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Employment Type</label>
              <select
                value={inviteType}
                onChange={(e) => setInviteType(e.target.value)}
                className="w-full rounded-xl text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 outline-none"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
              </select>
            </div>

            <Input
              label="Basic Salary (₹/mo)"
              type="number"
              placeholder="25000"
              value={inviteSalary}
              onChange={(e) => setInviteSalary(e.target.value)}
            />
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-700 dark:text-slate-300">
            <span className="font-bold text-emerald-700 dark:text-emerald-400">Login Credentials:</span> Initial password will be <code className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-emerald-500/30 font-mono font-bold text-emerald-600 dark:text-emerald-400">DineFlow@2026</code>. The member can log in at <span className="font-semibold text-slate-900 dark:text-white">/login</span> using their mobile number and change their password anytime.
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button variant="glow" type="submit" leftIcon={<UserPlus className="h-4 w-4" />}>
              Enroll Staff (WhatsApp)
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: EDIT EMPLOYEE PROFILE ─────────────────────────────────────── */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title={`Edit Profile: ${selectedStaff?.name || ""}`}
        description="Update workforce allocations, salary components, bank details, and emergency contacts."
        size="lg"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Full Name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              required
            />
            <Input
              label="WhatsApp Phone Number"
              value={profilePhone}
              onChange={(e) => {
                setProfilePhone(formatIndianPhoneInput(e.target.value));
                setProfilePhoneTouched(true);
              }}
              onBlur={() => setProfilePhoneTouched(true)}
              error={
                profilePhoneTouched && profilePhone && !validateIndianPhone(profilePhone).isValid
                  ? validateIndianPhone(profilePhone).error
                  : undefined
              }
              isSuccess={!!profilePhone && validateIndianPhone(profilePhone).isValid}
              placeholder="+91 98765 43210"
              leftIcon={<MessageSquare className="h-3.5 w-3.5 text-emerald-600" />}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            value={profileEmail}
            onChange={(e) => setProfileEmail(e.target.value)}
            placeholder="colleague@restaurant.com"
            leftIcon={<Mail className="h-3.5 w-3.5" />}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">Department</label>
              <select
                value={profileDepartment}
                onChange={(e) => setProfileDepartment(e.target.value)}
                className="w-full rounded-xl text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 outline-none"
              >
                <option value="Kitchen">Kitchen</option>
                <option value="Floor Service">Floor Service</option>
                <option value="Front Desk & Billing">Front Desk & Billing</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Bar & Beverage">Bar & Beverage</option>
                <option value="Management">Management</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">Employment Type</label>
              <select
                value={profileEmpType}
                onChange={(e) => setProfileEmpType(e.target.value)}
                className="w-full rounded-xl text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 outline-none"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
          </div>

          <Input
            label="Assigned Shift"
            value={profileShiftName}
            onChange={(e) => setProfileShiftName(e.target.value)}
            placeholder="Morning Shift (09:00 - 18:00)"
          />

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
            <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-emerald-500" /> Salary Structure (INR)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Input
                label="Basic (₹)"
                type="number"
                value={profileBasic}
                onChange={(e) => setProfileBasic(e.target.value)}
              />
              <Input
                label="HRA (₹)"
                type="number"
                value={profileHra}
                onChange={(e) => setProfileHra(e.target.value)}
              />
              <Input
                label="OT Rate (₹/h)"
                type="number"
                value={profileOvertimeRate}
                onChange={(e) => setProfileOvertimeRate(e.target.value)}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
            <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-blue-500" /> Bank Details (Salary Transfer)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Input
                label="Bank Name"
                value={profileBankName}
                onChange={(e) => setProfileBankName(e.target.value)}
                placeholder="HDFC Bank"
              />
              <Input
                label="Account Number"
                value={profileAccNum}
                onChange={(e) => setProfileAccNum(e.target.value)}
                placeholder="50100234567890"
              />
              <Input
                label="IFSC Code"
                value={profileIfsc}
                onChange={(e) => setProfileIfsc(e.target.value)}
                placeholder="HDFC0001234"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
            <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-amber-500" /> Emergency Contact
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Contact Person Name"
                value={profileEmergName}
                onChange={(e) => setProfileEmergName(e.target.value)}
                placeholder="Spouse / Parent Name"
              />
              <Input
                label="Contact Phone"
                value={profileEmergPhone}
                onChange={(e) => {
                  setProfileEmergPhone(formatIndianPhoneInput(e.target.value));
                  setProfileEmergPhoneTouched(true);
                }}
                onBlur={() => setProfileEmergPhoneTouched(true)}
                error={
                  profileEmergPhoneTouched && profileEmergPhone && !validateIndianPhone(profileEmergPhone).isValid
                    ? validateIndianPhone(profileEmergPhone).error
                    : undefined
                }
                isSuccess={!!profileEmergPhone && validateIndianPhone(profileEmergPhone).isValid}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsEditProfileOpen(false)}>
              Cancel
            </Button>
            <Button variant="glow" type="submit">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: PERSONAL CLOCK-IN TERMINAL ────────────────────────────────── */}
      <Modal
        isOpen={isMyClockInModalOpen}
        onClose={() => setIsMyClockInModalOpen(false)}
        title="Personal Timeclock Terminal"
        description="GPS-verified clock-in and work break management for your shift."
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <p className="text-slate-500 dark:text-slate-400">Workplace Boundary</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                Radius: {geofence.radiusMeters}m &bull; {geofence.address}
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {currentCoords ? `GPS: ${currentCoords.lat.toFixed(5)}, ${currentCoords.lng.toFixed(5)}` : "Detecting GPS..."}
              </p>
            </div>
            <div className="text-right">
              <Badge variant={isInsideGeofence ? "success" : "danger"} dot size="sm">
                {isInsideGeofence ? "Inside Geofence" : "Outside Boundary"}
              </Badge>
              <p className={`text-xs font-bold mt-1.5 ${isInsideGeofence ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {gpsDistance !== null ? `${gpsDistance}m away` : "Calculating..."}
              </p>
            </div>
          </div>

          {geofence.enforceGeofence && !isInsideGeofence && !isClockedIn && (
            <p className="text-xs text-rose-500 flex items-center gap-1.5 font-medium bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Strict geofence enforcement active: You must be within {geofence.radiusMeters}m of the restaurant to clock in.
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            {!isClockedIn ? (
              <Button
                variant="glow"
                size="default"
                className="w-full"
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
                isLoading={clockingIn}
                disabled={geofence.enforceGeofence && !isInsideGeofence}
                onClick={async () => {
                  await handleClockIn();
                  setIsMyClockInModalOpen(false);
                }}
              >
                Clock In Now
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="default"
                  className={`flex-1 ${isOnBreak ? "bg-amber-500 text-white hover:bg-amber-600" : ""}`}
                  leftIcon={<Coffee className="h-4 w-4" />}
                  isLoading={togglingBreak}
                  onClick={handleToggleBreak}
                >
                  {isOnBreak ? "Resume Work" : "Take Break"}
                </Button>
                <Button
                  variant="destructive"
                  size="default"
                  className="flex-1"
                  leftIcon={<XCircle className="h-4 w-4" />}
                  isLoading={clockingOut}
                  onClick={async () => {
                    await handleClockOut();
                    setIsMyClockInModalOpen(false);
                  }}
                >
                  Clock Out
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal>

      {/* ── MODAL: GEOFENCE SETTINGS ─────────────────────────────────────────── */}
      <Modal
        isOpen={isGeofenceModalOpen}
        onClose={() => setIsGeofenceModalOpen(false)}
        title="Workplace Geofence Configuration"
        description="Specify GPS coordinates and allowable radius for real-time mobile attendance clock-in."
      >
        <form onSubmit={handleSaveGeofence} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Latitude"
              value={geoLat}
              onChange={(e) => setGeoLat(e.target.value)}
              required
            />
            <Input
              label="Longitude"
              value={geoLng}
              onChange={(e) => setGeoLng(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
              Allowed Radius
            </label>
            <select
              value={geoRadius}
              onChange={(e) => setGeoRadius(e.target.value)}
              className="w-full rounded-xl text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 outline-none"
            >
              <option value="50">50 meters (Strict dining hall boundary)</option>
              <option value="100">100 meters (Standard restaurant & parking)</option>
              <option value="200">200 meters (Large resort & premises)</option>
              <option value="500">500 meters (Campus wide)</option>
            </select>
          </div>

          <Input
            label="Location Address"
            value={geoAddress}
            onChange={(e) => setGeoAddress(e.target.value)}
            placeholder="e.g. Connaught Place Central, New Delhi"
          />

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Strict Out-of-Bounds Rejection</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Prevent staff from clocking in when outside the radius.
              </p>
            </div>
            <input
              type="checkbox"
              checked={geoEnforce}
              onChange={(e) => setGeoEnforce(e.target.checked)}
              className="h-4 w-4 rounded accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="pt-2 flex justify-between gap-2">
            <Button
              variant="outline"
              type="button"
              size="sm"
              onClick={() => {
                if (currentCoords) {
                  setGeoLat(String(currentCoords.lat));
                  setGeoLng(String(currentCoords.lng));
                  addToast("info", "Coordinates Updated", "Filled with your current device GPS position.");
                }
              }}
            >
              Use My Current GPS
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" type="button" onClick={() => setIsGeofenceModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="glow" type="submit">
                Save Geofence
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: MANUAL ATTENDANCE OVERRIDE ───────────────────────────────── */}
      <Modal
        isOpen={isManualAttendanceOpen}
        onClose={() => setIsManualAttendanceOpen(false)}
        title="Mark Staff Attendance (Manager Override)"
        description="Record or override attendance on behalf of a team member when WhatsApp is unavailable or device fails."
      >
        <form onSubmit={handleSaveManualAttendance} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
              Staff Member <span className="text-rose-500">*</span>
            </label>
            <select
              value={manualStaffId}
              onChange={(e) => setManualStaffId(e.target.value)}
              required
              className="w-full rounded-xl text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2.5 outline-none"
            >
              <option value="">Select Staff Member...</option>
              {displayStaff.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} &bull; {st.role.toUpperCase()} ({st.employeeId || "No ID"}) &bull; {st.department || "Operations"}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Attendance Date"
              type="date"
              value={manualDate}
              onChange={(e) => setManualDate(e.target.value)}
              required
            />
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={manualStatus}
                onChange={(e) => setManualStatus(e.target.value)}
                className="w-full rounded-xl text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 outline-none h-10"
              >
                <option value="present">Present (On-Time)</option>
                <option value="late">Late Arrival</option>
                <option value="half_day">Half Day (4h)</option>
                <option value="absent">Absent (Unexcused)</option>
                <option value="leave">On Leave</option>
              </select>
            </div>
          </div>

          {(manualStatus === "present" || manualStatus === "late" || manualStatus === "half_day") && (
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <Input
                label="Check-In Time"
                type="time"
                value={manualCheckIn}
                onChange={(e) => setManualCheckIn(e.target.value)}
              />
              <Input
                label="Check-Out Time"
                type="time"
                value={manualCheckOut}
                onChange={(e) => setManualCheckOut(e.target.value)}
              />
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                  Break Duration
                </label>
                <select
                  value={manualBreakMinutes}
                  onChange={(e) => setManualBreakMinutes(e.target.value)}
                  className="w-full rounded-xl text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 outline-none h-10"
                >
                  <option value="0">0 mins (No Break)</option>
                  <option value="30">30 mins</option>
                  <option value="45">45 mins</option>
                  <option value="60">60 mins (Standard)</option>
                  <option value="90">90 mins</option>
                </select>
              </div>
            </div>
          )}

          <Input
            label="Manager Override Reason"
            value={manualReason}
            onChange={(e) => setManualReason(e.target.value)}
            placeholder="e.g. Staff's WhatsApp unavailable / battery dead / phone glitch"
            required
          />

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-semibold">Compliance & Audit Trail Notice</p>
              <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                This entry will be logged under your manager account with the reason specified above. GPS geofencing will be exempted for this manual override.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsManualAttendanceOpen(false)}>
              Cancel
            </Button>
            <Button variant="glow" type="submit" isLoading={submittingManualAttendance}>
              Save Attendance Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: APPLY LEAVE ──────────────────────────────────────────────── */}
      <Modal
        isOpen={isApplyLeaveOpen}
        onClose={() => setIsApplyLeaveOpen(false)}
        title="Record Staff Leave Request"
        description="Log or submit a time-off request for review and automatic payroll deduction."
      >
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">Staff Member</label>
            <select
              value={leaveStaffId}
              onChange={(e) => setLeaveStaffId(e.target.value)}
              className="w-full rounded-xl text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 outline-none"
            >
              <option value="">{currentUser?.name ? `${currentUser.name} (Myself)` : "Select staff member"}</option>
              {displayStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.employeeId || s.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">Leave Category</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full rounded-xl text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 outline-none"
            >
              <option value="casual">Casual Leave (CL)</option>
              <option value="sick">Sick Leave (SL)</option>
              <option value="earned">Earned Leave (EL)</option>
              <option value="unpaid">Unpaid Leave</option>
              <option value="comp_off">Compensatory Off</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={leaveStart}
              onChange={(e) => setLeaveStart(e.target.value)}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={leaveEnd}
              onChange={(e) => setLeaveEnd(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              id="halfDay"
              checked={leaveHalfDay}
              onChange={(e) => setLeaveHalfDay(e.target.checked)}
              className="h-3.5 w-3.5 rounded accent-emerald-500"
            />
            <label htmlFor="halfDay" className="cursor-pointer">This is a Half-Day leave (0.5 days count)</label>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">Reason for Leave</label>
            <textarea
              rows={3}
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="e.g. Family medical emergency / personal travel"
              className="w-full rounded-xl text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsApplyLeaveOpen(false)}>
              Cancel
            </Button>
            <Button variant="glow" type="submit">
              Record Leave
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: REJECT LEAVE ──────────────────────────────────────────────── */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Decline Leave Application"
        description="Please provide a clear reason for the employee."
      >
        <form onSubmit={handleRejectLeave} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">Reason for Rejection</label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Critical banquet event scheduled on this date; please coordinate replacement."
              className="w-full rounded-xl text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 outline-none focus:border-rose-500"
              required
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" type="submit">
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: VIEW / PRINT PAYSLIP ───────────────────────────────────────── */}
      <Modal
        isOpen={isPayslipModalOpen}
        onClose={() => setIsPayslipModalOpen(false)}
        title="Official Salary Payslip"
        description="Statutory Indian format with earnings, deductions, and net pay."
        size="lg"
      >
        {activePayslip && (
          <div className="space-y-4 text-slate-900 dark:text-slate-100">
            {/* Header / Printable container */}
            <div id="payslip-preview" className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">DINEFLOW HOSPITALITY</h2>
                  <p className="text-xs text-slate-500">Payslip for Month: {activePayslip.month}</p>
                </div>
                <div className="text-right">
                  <Badge variant="success" size="sm">PAID</Badge>
                  <p className="text-[10px] text-slate-400 mt-1">Generated: {new Date(activePayslip.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Employee Bio Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Employee Name</span>
                  <span className="font-bold">{activePayslip.employeeName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Employee ID</span>
                  <span className="font-mono font-bold">{activePayslip.employeeId}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Department / Role</span>
                  <span className="font-medium">{activePayslip.department} ({activePayslip.role})</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Days Present</span>
                  <span className="font-semibold">{activePayslip.presentDays} Days</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Overtime Hours</span>
                  <span className="font-semibold">{activePayslip.overtimeHours} Hrs</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Payment Mode</span>
                  <span className="font-semibold">Direct Bank Transfer</span>
                </div>
              </div>

              {/* Earnings & Deductions Tables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px]">
                        <th className="pb-1 text-left">Earnings</th>
                        <th className="pb-1 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                      <tr><td className="py-1.5">Basic Salary</td><td className="text-right font-medium">₹{activePayslip.basicSalary.toLocaleString("en-IN")}</td></tr>
                      <tr><td className="py-1.5">House Rent Allowance (HRA)</td><td className="text-right font-medium">₹{activePayslip.hra.toLocaleString("en-IN")}</td></tr>
                      <tr><td className="py-1.5">Special Allowance</td><td className="text-right font-medium">₹{activePayslip.allowances.toLocaleString("en-IN")}</td></tr>
                      <tr><td className="py-1.5">Overtime Pay</td><td className="text-right font-medium">₹{activePayslip.overtimePay.toLocaleString("en-IN")}</td></tr>
                      <tr className="font-bold border-t border-slate-200 dark:border-slate-800">
                        <td className="pt-2">Gross Earnings</td>
                        <td className="pt-2 text-right">₹{activePayslip.grossEarnings.toLocaleString("en-IN")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px]">
                        <th className="pb-1 text-left">Deductions</th>
                        <th className="pb-1 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                      <tr><td className="py-1.5">Provident Fund (PF)</td><td className="text-right font-medium">₹{(activePayslip.deductions - 200).toLocaleString("en-IN")}</td></tr>
                      <tr><td className="py-1.5">Professional Tax (PT)</td><td className="text-right font-medium">₹200</td></tr>
                      <tr className="font-bold border-t border-slate-200 dark:border-slate-800">
                        <td className="pt-2">Total Deductions</td>
                        <td className="pt-2 text-right text-rose-500">₹{activePayslip.deductions.toLocaleString("en-IN")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Net Pay Highlight */}
              <div className="mt-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 text-center">
                <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Net Salary Payable
                </p>
                <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                  ₹{activePayslip.netPay.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 flex justify-between text-[10px] text-slate-400">
                <span>System Generated Payslip &bull; No signature required</span>
                <span>Authorized Signatory &bull; DineFlow HR</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="glow"
                size="sm"
                leftIcon={<Printer className="h-4 w-4" />}
                onClick={() => window.print()}
              >
                Print / Download PDF
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setIsPayslipModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function StaffPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Loading workforce workspace...</div>}>
      <StaffPageContent />
    </React.Suspense>
  );
}

