import { NextRequest, NextResponse } from "next/server";
import { getEnrolledStaff, enrollStaff, StaffMember } from "@/lib/staff-storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const staff = getEnrolledStaff();
    return NextResponse.json({
      success: true,
      data: staff,
      staff: staff,
      count: staff.length,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch staff directory" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role = "waiter", department = "Floor Service", phone, employeeId, email } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: "Staff name and phone number are required" },
        { status: 400 }
      );
    }

    const newStaff: StaffMember = {
      id: "st-" + Date.now().toString().slice(-6),
      name: name.trim(),
      role: role.trim().toLowerCase(),
      department: department.trim(),
      phone: phone.trim(),
      employeeId: employeeId || `DF-EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      email: email?.trim(),
      leaveBalance: { casual: 10, sick: 7, earned: 12 },
      shiftName: "General Shift",
      shiftHours: "09:00 - 18:00",
      salaryBasic: 25000,
    };

    const saved = enrollStaff(newStaff);

    return NextResponse.json({
      success: true,
      data: saved,
      message: `Enrolled ${saved.name} (${saved.role}) with WhatsApp: ${saved.phone}`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: "Failed to enroll staff member" },
      { status: 500 }
    );
  }
}
