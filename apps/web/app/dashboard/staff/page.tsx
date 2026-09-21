"use client";

import * as React from "react";
import {
  UserPlus,
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
  Award,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth-store";
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
  overtimeHours: number;
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

export default function StaffPage() {
  const { addToast } = useToast();
  const currentUser = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = React.useState<"staff" | "attendance" | "shifts" | "leaves" | "payroll" | "holidays">("staff");
  const [loading, setLoading] = React.useState(true);

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
  const [geoLat, setGeoLat] = React.useState("28.6315");
  const [geoLng, setGeoLng] = React.useState("77.2167");
  const [geoRadius, setGeoRadius] = React.useState("100");
  const [geoAddress, setGeoAddress] = React.useState("Connaught Place, New Delhi");
  const [geoEnforce, setGeoEnforce] = React.useState(false);

  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = React.useState(false);
  const [leaveType, setLeaveType] = React.useState("casual");
  const [leaveStart, setLeaveStart] = React.useState("");
  const [leaveEnd, setLeaveEnd] = React.useState("");
  const [leaveHalfDay, setLeaveHalfDay] = React.useState(false);
  const [leaveReason, setLeaveReason] = React.useState("");

  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState(false);
  const [rejectingLeaveId, setRejectingLeaveId] = React.useState("");
  const [rejectionReason, setRejectionReason] = React.useState("");

  const [isPayslipModalOpen, setIsPayslipModalOpen] = React.useState(false);
  const [activePayslip, setActivePayslip] = React.useState<PayrollRecord | null>(null);

  const [selectedPayrollMonth, setSelectedPayrollMonth] = React.useState(new Date().toISOString().substring(0, 7));

  // ── Fetch Operations ────────────────────────────────────────────────────────

  const fetchStaff = React.useCallback(async () => {
    try {
      const res = await apiClient.get("/staff");
      if (res.data?.data && Array.isArray(res.data.data)) {
        setStaffList(res.data.data);
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
    ]);
    setLoading(false);
  }, [fetchStaff, fetchAttendance, fetchGeofence, fetchShifts, fetchLeaves, fetchLeaveBalance, fetchPayroll, fetchHolidays, selectedPayrollMonth]);

  React.useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Read ?tab= from URL on initial mount if provided
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      if (tabParam && ["staff", "attendance", "shifts", "leaves", "payroll", "holidays"].includes(tabParam)) {
        setActiveTab(tabParam as typeof activeTab);
      }
    }
  }, []);

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
      await apiClient.post("/staff/invite", {
        name: inviteName.trim() || phone || email.split("@")[0],
        phone: normalizedPhone,
        email: email,
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

  const handleOpenEditProfile = (member: StaffMember) => {
    setSelectedStaff(member);
    setProfileName(member.name);
    setProfilePhone(member.phone || "");
    setProfilePhoneTouched(false);
    setProfileEmail(member.email || "");
    setProfileDepartment(member.department || "Floor Service");
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

  // Geofence status calculation
  const isInsideGeofence = gpsDistance !== null ? gpsDistance <= geofence.radiusMeters : true;

  return (
    <div className="space-y-6">
      {/* ── Top Header & Hero ────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Enterprise Workforce Management & HRMS
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Workforce & Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Real-time geofenced attendance, shift scheduling, leave approval queues, and automated Indian payroll.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Navigation className="h-3.5 w-3.5 text-emerald-500" />}
            onClick={() => setIsGeofenceModalOpen(true)}
          >
            Geofence ({geofence.radiusMeters}m)
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Calendar className="h-3.5 w-3.5 text-amber-500" />}
            onClick={() => setIsApplyLeaveOpen(true)}
          >
            Apply Leave
          </Button>
          <Button
            variant="glow"
            size="sm"
            leftIcon={<UserPlus className="h-4 w-4" />}
            onClick={() => setIsInviteOpen(true)}
          >
            Invite Staff
          </Button>
        </div>
      </div>

      {/* ── Tab Navigation ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        {[
          { id: "staff", label: "Staff Directory & Profiles", icon: Shield, badge: loading && staffList.length === 0 ? undefined : `${displayStaff.length}` },
          { id: "attendance", label: "Live Attendance & Geofencing", icon: MapPin, badge: `${todayAttendance.length} Today` },
          { id: "shifts", label: "Shift Scheduling", icon: Clock, badge: `${shifts.length || 3}` },
          { id: "leaves", label: "Leave Management", icon: CalendarCheck, badge: `${leaves.filter((l) => l.status === "pending").length} Pending` },
          { id: "payroll", label: "Payroll & Payslips", icon: DollarSign, badge: "Automated" },
          { id: "holidays", label: "Holidays Calendar", icon: Award, badge: `${holidays.length || 7}` },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-sm border border-slate-900 dark:border-emerald-500"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400 dark:text-white" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: STAFF DIRECTORY & PROFILES ─────────────────────────────────── */}
      {activeTab === "staff" && (
        <div className="space-y-6">
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base sm:text-lg">Staff Roster & Statutory Metadata</CardTitle>
                <CardDescription className="text-xs">
                  Departments, shifts, CTC structures, bank verification, and emergency contacts.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchStaff} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-xs">
                <thead className="sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm z-10">
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 pl-6">Employee</th>
                    <th className="py-3.5">Department</th>
                    <th className="py-3.5">Role</th>
                    <th className="py-3.5">Shift</th>
                    <th className="py-3.5">Basic CTC</th>
                    <th className="py-3.5">Status</th>
                    <th className="py-3.5 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {loading && staffList.length === 0 ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={`staff-skel-${i}`} className="animate-pulse">
                        <td className="py-3.5 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                            <div className="space-y-1.5">
                              <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                              <div className="h-3 w-36 bg-slate-100 dark:bg-slate-800/60 rounded" />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5"><div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" /></td>
                        <td className="py-3.5"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                        <td className="py-3.5"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                        <td className="py-3.5"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                        <td className="py-3.5"><div className="h-5 w-14 bg-slate-200 dark:bg-slate-800 rounded-full" /></td>
                        <td className="py-3.5 text-right pr-6"><div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded ml-auto" /></td>
                      </tr>
                    ))
                  ) : displayStaff.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12">
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
                      </td>
                    </tr>
                  ) : (
                    displayStaff.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 pl-6">
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
                      </td>
                      <td className="py-3.5">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {member.department || "Floor Service"}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="capitalize font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/60">
                          {member.role}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-400">
                        {member.shiftName || "Morning (09:00 - 18:00)"}
                      </td>
                      <td className="py-3.5 font-semibold text-slate-900 dark:text-white">
                        {currentUser?.role !== "manager" || (member.role !== "owner" && member.role !== "manager")
                          ? `₹${(member.salary?.basic || 25000).toLocaleString("en-IN")}/mo`
                          : "Confidential"}
                      </td>
                      <td className="py-3.5">
                        <Badge variant={member.status === "active" ? "success" : "warning"} dot size="sm">
                          {member.status === "active" ? "Active" : "Invited"}
                        </Badge>
                      </td>
                      <td className="py-3.5 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
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
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 2: LIVE ATTENDANCE & GEOFENCING ────────────────────────────────── */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          {/* Quick Attendance Terminal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="glass" className="md:col-span-2 border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">GPS Geofence Clock-in Terminal</CardTitle>
                      <CardDescription className="text-xs">
                        Workplace Radius: {geofence.radiusMeters}m &bull; {geofence.address}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={isInsideGeofence ? "success" : "danger"} dot size="sm">
                    {isInsideGeofence ? "Inside Geofence" : "Outside Boundary"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Your Current Geolocation</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {currentCoords ? `${currentCoords.lat.toFixed(5)}, ${currentCoords.lng.toFixed(5)}` : "Detecting GPS..."}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 dark:text-slate-400">Distance to Workplace</p>
                    <p className={`font-bold ${isInsideGeofence ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {gpsDistance !== null ? `${gpsDistance} meters` : "Calculating..."}
                    </p>
                  </div>
                </div>

                {/* Clock-in / Out / Break Control Buttons */}
                <div className="flex items-center gap-3 flex-wrap">
                  {!isClockedIn ? (
                    <Button
                      variant="glow"
                      size="default"
                      className="flex-1 sm:flex-none"
                      leftIcon={<CheckCircle2 className="h-4 w-4" />}
                      isLoading={clockingIn}
                      disabled={geofence.enforceGeofence && !isInsideGeofence}
                      onClick={handleClockIn}
                    >
                      Clock In Now
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        size="default"
                        className={isOnBreak ? "bg-amber-500 text-white hover:bg-amber-600" : ""}
                        leftIcon={<Coffee className="h-4 w-4" />}
                        isLoading={togglingBreak}
                        onClick={handleToggleBreak}
                      >
                        {isOnBreak ? "Resume Work (End Break)" : "Take Break"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="default"
                        leftIcon={<XCircle className="h-4 w-4" />}
                        isLoading={clockingOut}
                        onClick={handleClockOut}
                      >
                        Clock Out
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outline"
                    size="default"
                    leftIcon={<Navigation className="h-4 w-4 text-emerald-500" />}
                    onClick={() => setIsGeofenceModalOpen(true)}
                  >
                    Adjust Geofence
                  </Button>
                </div>

                {geofence.enforceGeofence && !isInsideGeofence && !isClockedIn && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Geofence enforcement active: You must be within {geofence.radiusMeters}m of the restaurant to clock in.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Today's Metrics */}
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Total Clocked In Today</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {loading && staffList.length === 0 ? "—" : `${todayAttendance.filter((a) => a.checkInTime).length} / ${displayStaff.length}`}
                </p>
                <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Real-time active workforce
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Late Arrivals Today</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {todayAttendance.filter((a) => a.status === "late").length}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Grace period: 15 mins</p>
              </div>
            </div>
          </div>

          {/* Today's Attendance Register Table */}
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base sm:text-lg">Today&apos;s Attendance Register</CardTitle>
                <CardDescription className="text-xs">
                  Real-time clock-in/out stamps, break timers, and GPS distances for {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchAttendance} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead className="sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm z-10">
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 pl-6">Staff Member</th>
                    <th className="py-3.5">Department</th>
                    <th className="py-3.5">Check-In</th>
                    <th className="py-3.5">Check-Out</th>
                    <th className="py-3.5">Working Hours</th>
                    <th className="py-3.5">Status</th>
                    <th className="py-3.5 text-right pr-6">GPS Distance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {todayAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12">
                        <EmptyState
                          compact
                          icon={<Clock className="h-6 w-6 text-slate-400" />}
                          title="No check-ins recorded yet today"
                          description="Staff members can clock in using GPS or the WhatsApp Workforce Assistant."
                        />
                      </td>
                    </tr>
                  ) : (
                    todayAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 pl-6">
                          <div className="flex items-center gap-2.5">
                            <Avatar fallback={rec.employeeName} size="sm" />
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{rec.employeeName}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{rec.employeeId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 text-slate-600 dark:text-slate-400">{rec.department || "Floor Service"}</td>
                        <td className="py-3.5 font-mono text-slate-800 dark:text-slate-200">
                          {rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                        </td>
                        <td className="py-3.5 font-mono text-slate-800 dark:text-slate-200">
                          {rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : (rec.isOnBreak ? "On Break ☕" : "In Progress")}
                        </td>
                        <td className="py-3.5 font-semibold text-slate-900 dark:text-white">
                          {rec.workingHours ? `${rec.workingHours} hrs` : "—"}
                          {rec.overtimeHours > 0 && <span className="text-[10px] text-emerald-500 ml-1">(+{rec.overtimeHours} OT)</span>}
                        </td>
                        <td className="py-3.5">
                          <Badge
                            variant={rec.status === "present" ? "success" : rec.status === "late" ? "warning" : "neutral"}
                            dot
                            size="sm"
                          >
                            {rec.status === "late" ? "Late" : "Present"}
                          </Badge>
                        </td>
                        <td className="py-3.5 text-right pr-6 font-mono text-[11px] text-slate-500">
                          {rec.checkInDistance ? `${rec.checkInDistance.toFixed(0)}m` : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 3: SHIFT SCHEDULING ───────────────────────────────────────────── */}
      {activeTab === "shifts" && (
        <div className="space-y-6">
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
          {/* Balances Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Casual Leave (CL)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                  {leaveBalance.casualTotal - leaveBalance.casualUsed} Left
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                {leaveBalance.casualUsed} / {leaveBalance.casualTotal} <span className="text-xs font-normal text-slate-400">Days Taken</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Sick Leave (SL)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  {leaveBalance.sickTotal - leaveBalance.sickUsed} Left
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                {leaveBalance.sickUsed} / {leaveBalance.sickTotal} <span className="text-xs font-normal text-slate-400">Days Taken</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Earned / Annual Leave (EL)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                  {leaveBalance.earnedTotal - leaveBalance.earnedUsed} Left
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                {leaveBalance.earnedUsed} / {leaveBalance.earnedTotal} <span className="text-xs font-normal text-slate-400">Days Taken</span>
              </p>
            </div>
          </div>

          {/* Leave Requests Table */}
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base sm:text-lg">Leave Applications & Approvals Queue</CardTitle>
                <CardDescription className="text-xs">
                  Review, approve, or reject employee leave requests. Approvals automatically sync with payroll deductions.
                </CardDescription>
              </div>
              <Button variant="glow" size="sm" onClick={() => setIsApplyLeaveOpen(true)} leftIcon={<Plus className="h-3.5 w-3.5" />}>
                Apply Leave
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead className="sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm z-10">
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 pl-6">Employee</th>
                    <th className="py-3.5">Leave Type</th>
                    <th className="py-3.5">Duration</th>
                    <th className="py-3.5">Reason</th>
                    <th className="py-3.5">Status</th>
                    <th className="py-3.5 text-right pr-6">Manager Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {leaves.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12">
                        <EmptyState
                          compact
                          icon={<CalendarCheck className="h-6 w-6 text-slate-400" />}
                          title="No leave applications yet"
                          description="Staff leave requests submitted via WhatsApp or dashboard will show here."
                          action={{
                            label: "Apply Leave",
                            icon: <Plus className="h-3.5 w-3.5" />,
                            onClick: () => setIsApplyLeaveOpen(true),
                          }}
                        />
                      </td>
                    </tr>
                  ) : (
                    leaves.map((lv) => (
                      <tr key={lv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 pl-6">
                          <p className="font-semibold text-slate-900 dark:text-white">{lv.employeeName || "Employee"}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{lv.employeeId || "DF-EMP"}</p>
                        </td>
                        <td className="py-3.5 capitalize font-medium text-slate-700 dark:text-slate-300">
                          {lv.leaveType} {lv.isHalfDay && "(Half-Day)"}
                        </td>
                        <td className="py-3.5 text-slate-800 dark:text-slate-200">
                          <span className="font-medium">{lv.startDate}</span> to <span className="font-medium">{lv.endDate}</span>
                          <span className="text-slate-400 text-[11px] block">{lv.daysCount} days</span>
                        </td>
                        <td className="py-3.5 max-w-[200px] truncate text-slate-600 dark:text-slate-400">
                          {lv.reason || "Personal"}
                        </td>
                        <td className="py-3.5">
                          <Badge
                            variant={lv.status === "approved" ? "success" : lv.status === "rejected" ? "danger" : "warning"}
                            dot
                            size="sm"
                          >
                            {lv.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 text-right pr-6">
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
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 5: PAYROLL & PAYSLIPS ─────────────────────────────────────────── */}
      {activeTab === "payroll" && (
        <div className="space-y-6">
          {/* Payroll Control Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Monthly Payroll Processing Engine</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Calculates Basic, HRA, Overtime Pay, PF (~12% max 1800), and Professional Tax (₹200).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="month"
                value={selectedPayrollMonth}
                onChange={(e) => {
                  setSelectedPayrollMonth(e.target.value);
                  fetchPayroll(e.target.value);
                }}
                className="rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 outline-none"
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
              <table className="w-full min-w-[800px] text-left text-xs">
                <thead className="sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm z-10">
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 pl-6">Employee</th>
                    <th className="py-3.5">Designation</th>
                    <th className="py-3.5">Days / OT</th>
                    <th className="py-3.5">Gross Pay</th>
                    <th className="py-3.5">Deductions (PF+PT)</th>
                    <th className="py-3.5">Net Pay (INR)</th>
                    <th className="py-3.5">Status</th>
                    <th className="py-3.5 text-right pr-6">Payslip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {payrollRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12">
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
                      </td>
                    </tr>
                  ) : (
                    payrollRecords.map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 pl-6">
                          <p className="font-semibold text-slate-900 dark:text-white">{pay.employeeName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{pay.employeeId}</p>
                        </td>
                        <td className="py-3.5 capitalize text-slate-600 dark:text-slate-400">{pay.role}</td>
                        <td className="py-3.5 text-slate-800 dark:text-slate-200">
                          {pay.presentDays} days
                          {pay.overtimeHours > 0 && <span className="text-[10px] text-emerald-500 block">+{pay.overtimeHours}h OT</span>}
                        </td>
                        <td className="py-3.5 font-medium text-slate-900 dark:text-white">
                          ₹{pay.grossEarnings.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 text-rose-500 font-medium">
                          -₹{pay.deductions.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          ₹{pay.netPay.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5">
                          <Badge variant="success" dot size="sm">
                            {pay.paymentStatus}
                          </Badge>
                        </td>
                        <td className="py-3.5 text-right pr-6">
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
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 6: HOLIDAYS CALENDAR ──────────────────────────────────────────── */}
      {activeTab === "holidays" && (
        <div className="space-y-6">
          <Card variant="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Official Holidays Calendar</CardTitle>
              <CardDescription className="text-xs">
                National and restaurant holidays integrated with attendance shift requirements.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-xs">
                <thead className="sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm z-10">
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 pl-6">Holiday Name</th>
                    <th className="py-3.5">Date</th>
                    <th className="py-3.5">Type</th>
                    <th className="py-3.5 text-right pr-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {holidays.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 pl-6 font-semibold text-slate-900 dark:text-white">{h.name}</td>
                      <td className="py-3.5 font-mono text-slate-700 dark:text-slate-300">{h.date}</td>
                      <td className="py-3.5 capitalize">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium">
                          {h.type}
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-6">
                        <Badge variant="info" size="sm">Scheduled</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                onChange={(e) => setInviteRole(e.target.value)}
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

      {/* ── MODAL: APPLY LEAVE ──────────────────────────────────────────────── */}
      <Modal
        isOpen={isApplyLeaveOpen}
        onClose={() => setIsApplyLeaveOpen(false)}
        title="Apply for Leave"
        description="Submit leave request for management approval. Balances update upon approval."
      >
        <form onSubmit={handleApplyLeave} className="space-y-4">
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
              Submit Application
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
