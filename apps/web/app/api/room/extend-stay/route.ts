import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface StayExtensionRecord {
  id: string;
  requestId: string;
  tenantSlug: string;
  roomNumber: string;
  roomId?: string;
  guestName: string;
  currentCheckout: string;
  requestedCheckout: string;
  additionalNights: number;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  managerComment?: string;
  rejectionReason?: string;
}

declare global {
  var __dineflow_extension_store: Map<string, StayExtensionRecord> | undefined;
}

function getExtensionStore(): Map<string, StayExtensionRecord> {
  if (!globalThis.__dineflow_extension_store) {
    globalThis.__dineflow_extension_store = new Map<string, StayExtensionRecord>();
  }
  return globalThis.__dineflow_extension_store;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isAll = searchParams.get("all") === "true" || searchParams.get("list") === "true";
    const statusFilter = searchParams.get("status");
    const tenantSlug = (searchParams.get("tenantSlug") || "the-grand-bistro").trim();
    const rawRoom = searchParams.get("roomNumber") || "";
    const cleanRoom = rawRoom.toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();

    const store = getExtensionStore();

    // 1. List all extension requests for client dashboard
    if (isAll) {
      const records: StayExtensionRecord[] = [];
      store.forEach((record) => {
        const matchesTenant =
          !tenantSlug ||
          record.tenantSlug.toLowerCase() === tenantSlug.toLowerCase() ||
          tenantSlug.toLowerCase() === "dineflow";
        const matchesStatus = !statusFilter || statusFilter === "all" || record.status === statusFilter;
        if (matchesTenant && matchesStatus) {
          records.push(record);
        }
      });

      // Sort newest first
      records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return NextResponse.json(
        {
          success: true,
          count: records.length,
          data: {
            requests: records,
          },
          requests: records,
        },
        {
          status: 200,
          headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
        }
      );
    }

    // 2. Fetch specific room extension status for guest room portal
    const apiBase =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://api-production-f170.up.railway.app/api/v1"
        : "http://localhost:8080/api/v1");

    // Try Go backend first with short timeout
    let backendData: any = null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const targetUrl = `${apiBase}/public/rooms/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(cleanRoom)}/extend-stay`;
      const res = await fetch(targetUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (res && res.ok) {
        backendData = await res.json().catch(() => null);
      }
    } catch (_) {}

    if (backendData && backendData.data) {
      const reqData = backendData.data.request || backendData.data;
      if (reqData && reqData.requestId) {
        store.set(reqData.requestId, {
          id: reqData.requestId,
          requestId: reqData.requestId,
          tenantSlug,
          roomNumber: cleanRoom,
          guestName: reqData.guestName || "In-House Guest",
          currentCheckout: reqData.currentCheckout,
          requestedCheckout: reqData.requestedCheckout,
          additionalNights: reqData.additionalNights || 1,
          notes: reqData.notes,
          status: reqData.status || "pending",
          createdAt: reqData.createdAt || new Date().toISOString(),
          updatedAt: reqData.updatedAt || new Date().toISOString(),
        });
      }
      return NextResponse.json(backendData, {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
      });
    }

    // Return from in-memory persistent store
    let latestForRoom: StayExtensionRecord | null = null;
    store.forEach((record) => {
      if (
        record.roomNumber === cleanRoom &&
        (!tenantSlug || record.tenantSlug.toLowerCase() === tenantSlug.toLowerCase() || tenantSlug === "dineflow")
      ) {
        if (!latestForRoom || new Date(record.createdAt).getTime() > new Date(latestForRoom.createdAt).getTime()) {
          latestForRoom = record;
        }
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          request: latestForRoom,
        },
        request: latestForRoom,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
      }
    );
  } catch (err: any) {
    console.error("[proxy-extend-stay] GET error:", err);
    return NextResponse.json(
      {
        success: true,
        data: { request: null },
      },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, requestId, tenantSlug, roomNumber, newCheckOut, notes, additionalNights, currentCheckout, guestName } = body;

    const slug = (tenantSlug || "the-grand-bistro").trim();
    const rawRoom = roomNumber || "102";
    const cleanRoom = rawRoom.toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();

    const store = getExtensionStore();

    // ── ACTION A: STAFF APPROVES EXTENSION ──
    if (action === "approve") {
      let targetRecord: StayExtensionRecord | undefined;

      if (requestId) {
        targetRecord = store.get(requestId);
      }
      if (!targetRecord) {
        // Find most recent pending request for room
        store.forEach((r) => {
          if (r.roomNumber === cleanRoom && r.status === "pending") {
            if (!targetRecord || new Date(r.createdAt).getTime() > new Date(targetRecord.createdAt).getTime()) {
              targetRecord = r;
            }
          }
        });
      }

      if (targetRecord) {
        targetRecord.status = "approved";
        targetRecord.approvedBy = body.approvedBy || "Front Desk Manager";
        targetRecord.approvedAt = new Date().toISOString();
        targetRecord.managerComment = notes || "Approved by Front Desk";
        targetRecord.updatedAt = new Date().toISOString();

        store.set(targetRecord.id, targetRecord);
      }

      // Forward to backend if available
      const apiBase =
        process.env.INTERNAL_API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        (process.env.NODE_ENV === "production"
          ? "https://api-production-f170.up.railway.app/api/v1"
          : "http://localhost:8080/api/v1");

      if (targetRecord?.id) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1200);
          await fetch(`${apiBase}/rooms/extension-requests/${encodeURIComponent(targetRecord.id)}/approve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ comment: notes || "Approved by Front Desk" }),
            signal: controller.signal,
          }).catch(() => null);
          clearTimeout(timeoutId);
        } catch (_) {}
      }

      return NextResponse.json(
        {
          success: true,
          status: "approved",
          data: { request: targetRecord },
          request: targetRecord,
          message: `Extension approved for Room ${cleanRoom}`,
        },
        {
          status: 200,
          headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
        }
      );
    }

    // ── ACTION B: STAFF REJECTS EXTENSION ──
    if (action === "reject") {
      let targetRecord: StayExtensionRecord | undefined;

      if (requestId) {
        targetRecord = store.get(requestId);
      }
      if (!targetRecord) {
        store.forEach((r) => {
          if (r.roomNumber === cleanRoom && r.status === "pending") {
            if (!targetRecord || new Date(r.createdAt).getTime() > new Date(targetRecord.createdAt).getTime()) {
              targetRecord = r;
            }
          }
        });
      }

      if (targetRecord) {
        targetRecord.status = "rejected";
        targetRecord.rejectionReason = body.reason || "Room is committed to an incoming reservation";
        targetRecord.updatedAt = new Date().toISOString();

        store.set(targetRecord.id, targetRecord);
      }

      return NextResponse.json(
        {
          success: true,
          status: "rejected",
          data: { request: targetRecord },
          request: targetRecord,
          message: `Extension request declined for Room ${cleanRoom}`,
        },
        {
          status: 200,
          headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
        }
      );
    }

    // ── ACTION C: CUSTOMER SUBMITS EXTENSION REQUEST ──
    if (!newCheckOut) {
      return NextResponse.json(
        { success: false, error: "New check-out date is required" },
        { status: 400 }
      );
    }

    const nights = Math.max(1, Number(additionalNights) || 1);
    const generatedId = `EXT-${cleanRoom}-${Date.now().toString(36).toUpperCase()}`;

    const newRecord: StayExtensionRecord = {
      id: generatedId,
      requestId: generatedId,
      tenantSlug: slug,
      roomNumber: cleanRoom,
      roomId: `room-${cleanRoom.toLowerCase()}`,
      guestName: guestName || "Valued In-House Guest",
      currentCheckout: currentCheckout || new Date().toISOString(),
      requestedCheckout: newCheckOut,
      additionalNights: nights,
      notes: notes ? String(notes).trim() : "",
      status: "pending", // STRICTLY PENDING UNTIL CLIENT APPROVAL
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.set(generatedId, newRecord);

    // Forward to Go backend if reachable (non-blocking with timeout)
    const apiBase =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://api-production-f170.up.railway.app/api/v1"
        : "http://localhost:8080/api/v1");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const targetUrl = `${apiBase}/public/rooms/${encodeURIComponent(slug)}/${encodeURIComponent(cleanRoom)}/extend-stay`;
      await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          newCheckOut,
          notes: notes || "",
          additionalNights: nights,
        }),
        cache: "no-store",
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeoutId);
    } catch (_) {}

    return NextResponse.json(
      {
        success: true,
        status: "pending",
        message: `Stay extension request for ${nights} night(s) submitted for hotel approval.`,
        requestId: generatedId,
        data: {
          request: newRecord,
        },
        request: newRecord,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
      }
    );
  } catch (err: any) {
    console.error("[proxy-extend-stay] POST error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Internal server error while extending stay",
      },
      { status: 500 }
    );
  }
}
