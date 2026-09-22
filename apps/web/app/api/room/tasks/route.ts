import { NextRequest, NextResponse } from "next/server";
import {
  HousekeepingTask,
  StaffMember,
  getTasksStore,
  getTenantStaff,
  setTenantStaff,
  countActiveTasksForStaff,
  findAvailableHousekeeper,
  notifyAllStaffViaWhatsApp,
} from "@/lib/room-tasks";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || searchParams.get("tenantSlug") || "the-grand-bistro";
  const room = searchParams.get("room") || searchParams.get("roomNumber");
  const isAll = searchParams.get("all") === "true";

  const store = getTasksStore();

  if (isAll) {
    return NextResponse.json(
      { success: true, tasks: store, data: { tasks: store } },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
      }
    );
  }

  const cleanRoom = (room || "102").toUpperCase().replace(/^(ROOM-|SUITE-)/, "");

  const apiBase =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://api-production-f170.up.railway.app/api/v1"
      : "http://localhost:8080/api/v1");

  try {
    let res = await fetch(
      `${apiBase}/public/room-tasks/${encodeURIComponent(slug)}/${encodeURIComponent(cleanRoom)}`,
      { cache: "no-store", headers: { Accept: "application/json" } }
    );

    if (!res.ok) {
      res = await fetch(
        `${apiBase}/public/rooms/${encodeURIComponent(slug)}/${encodeURIComponent(cleanRoom)}/tasks`,
        { cache: "no-store", headers: { Accept: "application/json" } }
      );
    }

    if (res.ok) {
      const data = await res.json();
      const rawTasks = data.data?.tasks || data.tasks || [];
      const guestTasks = Array.isArray(rawTasks)
        ? rawTasks.filter((t: any) => {
            if (t.source === "staff" || t.isGuestRequest === false) return false;
            const title = (t.title || "").toLowerCase();
            if (title.includes("checkout deep clean") || title.includes("linen refresh —") || title.includes("turnover")) return false;
            return true;
          })
        : [];

      // Merge with in-memory tasks for this room
      const localRoomTasks = store.filter((t) => t.roomNumber === cleanRoom);
      const mergedMap = new Map<string, any>();
      guestTasks.forEach((t: any) => mergedMap.set(t.id || t._id, t));
      localRoomTasks.forEach((t) => mergedMap.set(t.id, t));
      const combined = Array.from(mergedMap.values());

      return NextResponse.json(
        { ...data, tasks: combined, data: { ...(data.data || {}), tasks: combined } },
        {
          status: 200,
          headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
        }
      );
    }

    const localRoomTasks = store.filter((t) => t.roomNumber === cleanRoom);
    return NextResponse.json(
      { success: true, tasks: localRoomTasks, data: { tasks: localRoomTasks }, message: "Loaded local tasks" },
      { status: 200 }
    );
  } catch (err: any) {
    const localRoomTasks = store.filter((t) => t.roomNumber === cleanRoom);
    return NextResponse.json(
      { success: true, tasks: localRoomTasks, data: { tasks: localRoomTasks } },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantSlug, roomNumber, amenityType, title, priority, notes, staffList } = body;

    const slug = tenantSlug || "the-grand-bistro";
    const cleanRoom = (roomNumber || "102").toUpperCase().replace(/^(ROOM-|SUITE-)/, "");

    // Retrieve or register real-time staff for this tenant
    if (Array.isArray(staffList) && staffList.length > 0) {
      setTenantStaff(slug, staffList);
    }
    const candidateStaff = (Array.isArray(staffList) && staffList.length > 0)
      ? staffList
      : getTenantStaff(slug);

    // 1. Workload balancing: find an available housekeeper with 0 active tasks among real staff
    const availableStaff = findAvailableHousekeeper(candidateStaff);

    // 2. Try remote/local backend API
    const apiBase =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://api-production-f170.up.railway.app/api/v1"
        : "http://localhost:8080/api/v1");

    let apiTask: any = null;
    try {
      let res = await fetch(
        `${apiBase}/public/room-tasks/${encodeURIComponent(slug)}/${encodeURIComponent(cleanRoom)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ amenityType, title, priority, notes }),
        }
      );

      if (!res.ok) {
        res = await fetch(
          `${apiBase}/public/rooms/${encodeURIComponent(slug)}/${encodeURIComponent(cleanRoom)}/amenity`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ amenityType, title, priority, notes }),
          }
        );
      }

      if (res.ok) {
        const data = await res.json().catch(() => null);
        apiTask = data?.data?.task || data?.task || data?.data;
      }
    } catch (_) {
      // Remote API unreachable
    }

    const store = getTasksStore();
    const taskId = apiTask?.id || apiTask?._id || `task_${Date.now()}`;

    // Determine final assignment with zero-double-booking guarantee
    const assignedId = apiTask?.assignedTo || (availableStaff ? availableStaff.id : "");
    const assignedName = apiTask?.assignedToName || (availableStaff ? availableStaff.name : "Pending Staff Availability");

    const newTask: HousekeepingTask = {
      id: taskId,
      roomNumber: cleanRoom,
      taskType: amenityType || "cleaning",
      title: title || "Guest Housekeeping Request",
      priority: priority || "normal",
      status: "pending",
      assignedTo: assignedId,
      assignedToName: assignedName,
      notes: notes || "",
      source: "guest",
      isGuestRequest: true,
      createdAt: new Date().toISOString(),
    };

    store.unshift(newTask);

    // 3. Notify real staff members via WhatsApp and record in message logs
    notifyAllStaffViaWhatsApp(newTask, cleanRoom, candidateStaff);

    return NextResponse.json(
      {
        success: true,
        message: availableStaff
          ? `Housekeeper ${availableStaff.name} assigned. Staff members alerted via WhatsApp.`
          : `Service request received. Staff members alerted via WhatsApp.`,
        task: newTask,
        data: { task: newTask },
        whatsappNotifiedCount: candidateStaff.length,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[proxy-room-tasks] POST error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to dispatch request" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskId, status, assignedTo, assignedToName, notes } = body;

    const store = getTasksStore();
    const target = store.find((t) => t.id === taskId);
    if (!target) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 });
    }

    // Workload Balance Guardrail: "two requests cannot go to one housekeeper"
    if (assignedTo && assignedTo !== target.assignedTo) {
      const activeCount = countActiveTasksForStaff(assignedTo, taskId);
      if (activeCount >= 1) {
        return NextResponse.json(
          {
            success: false,
            message: `Workload Limit Reached: ${assignedToName || "Staff member"} already has an active task. Two requests cannot go to one housekeeper.`,
          },
          { status: 400 }
        );
      }
    }

    if (status) {
      target.status = status;
      if (status === "completed") {
        target.completedAt = new Date().toISOString();
      }
    }
    if (assignedTo !== undefined) {
      target.assignedTo = assignedTo;
      target.assignedToName = assignedToName || target.assignedToName || "";
    }
    if (notes !== undefined) {
      target.notes = notes;
    }
    target.updatedAt = new Date().toISOString();

    return NextResponse.json(
      { success: true, task: target, data: { task: target } },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to update task" },
      { status: 500 }
    );
  }
}
