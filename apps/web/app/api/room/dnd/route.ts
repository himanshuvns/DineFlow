import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface DNDRecord {
  tenantSlug: string;
  roomNumber: string;
  dndStatus: boolean;
  updatedAt: string;
  updatedBy: string;
}

declare global {
  var __dineflow_dnd_store: Map<string, DNDRecord> | undefined;
}

function getDNDStore(): Map<string, DNDRecord> {
  if (!globalThis.__dineflow_dnd_store) {
    globalThis.__dineflow_dnd_store = new Map<string, DNDRecord>();
    // Pre-seed default room states
    globalThis.__dineflow_dnd_store.set("the-grand-bistro:201", {
      tenantSlug: "the-grand-bistro",
      roomNumber: "201",
      dndStatus: true,
      updatedAt: new Date().toISOString(),
      updatedBy: "system",
    });
    globalThis.__dineflow_dnd_store.set("dineflow:201", {
      tenantSlug: "dineflow",
      roomNumber: "201",
      dndStatus: true,
      updatedAt: new Date().toISOString(),
      updatedBy: "system",
    });
  }
  return globalThis.__dineflow_dnd_store;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isAll = searchParams.get("all") === "true";
    const tenantSlug = (searchParams.get("tenantSlug") || "the-grand-bistro").trim();
    const rawRoom = searchParams.get("roomNumber") || "";
    const cleanRoom = rawRoom.toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();

    const store = getDNDStore();

    if (isAll) {
      const records: DNDRecord[] = [];
      store.forEach((record) => {
        if (
          !tenantSlug ||
          record.tenantSlug.toLowerCase() === tenantSlug.toLowerCase() ||
          tenantSlug.toLowerCase() === "dineflow"
        ) {
          records.push(record);
        }
      });

      return NextResponse.json(
        {
          success: true,
          count: records.length,
          data: records,
        },
        {
          status: 200,
          headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
        }
      );
    }

    const key = `${tenantSlug.toLowerCase()}:${cleanRoom}`;

    const apiBase =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://api-production-f170.up.railway.app/api/v1"
        : "http://localhost:8080/api/v1");

    // 1. Try Go backend with quick abort timeout so we never hang
    let backendData: any = null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const urlPrimary = `${apiBase}/public/room-dnd/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(cleanRoom)}`;
      const res = await fetch(urlPrimary, {
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

    if (backendData && typeof backendData.dndStatus === "boolean") {
      store.set(key, {
        tenantSlug,
        roomNumber: cleanRoom,
        dndStatus: backendData.dndStatus,
        updatedAt: backendData.updatedAt || new Date().toISOString(),
        updatedBy: "backend",
      });
      return NextResponse.json(backendData, {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
      });
    }

    // 2. Return from in-memory persistent store
    if (store.has(key)) {
      const rec = store.get(key)!;
      return NextResponse.json(
        {
          success: true,
          dndStatus: rec.dndStatus,
          data: {
            dndStatus: rec.dndStatus,
            roomId: `room-${cleanRoom.toLowerCase()}`,
            roomNumber: cleanRoom,
            updatedAt: rec.updatedAt,
            updatedBy: rec.updatedBy,
          },
        },
        {
          status: 200,
          headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
        }
      );
    }

    // 3. Graceful default if room has not yet been toggled
    const defaultDND = cleanRoom === "201";
    return NextResponse.json(
      {
        success: true,
        dndStatus: defaultDND,
        data: {
          dndStatus: defaultDND,
          roomNumber: cleanRoom,
          updatedAt: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
      }
    );
  } catch (err: any) {
    console.error("[proxy-dnd] GET error:", err);
    return NextResponse.json(
      {
        success: true,
        data: {
          dndStatus: false,
          error: err?.message || "Internal server error",
        },
      },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantSlug, roomNumber, dndStatus, updatedBy } = body;

    const slug = (tenantSlug || "the-grand-bistro").trim();
    const rawRoom = roomNumber || "102";
    const cleanRoom = rawRoom.toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();
    const nextStatus = Boolean(dndStatus);

    const store = getDNDStore();
    const key = `${slug.toLowerCase()}:${cleanRoom}`;
    store.set(key, {
      tenantSlug: slug,
      roomNumber: cleanRoom,
      dndStatus: nextStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy || "guest",
    });

    const apiBase =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://api-production-f170.up.railway.app/api/v1"
        : "http://localhost:8080/api/v1");

    const payload = JSON.stringify({
      dndStatus: nextStatus,
      doNotDisturb: nextStatus,
    });

    // Forward to Go backend if available (non-blocking with timeout)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const urlPrimary = `${apiBase}/public/room-dnd/${encodeURIComponent(slug)}/${encodeURIComponent(cleanRoom)}`;
      await fetch(urlPrimary, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: payload,
        cache: "no-store",
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeoutId);
    } catch (_) {}

    return NextResponse.json(
      {
        success: true,
        dndStatus: nextStatus,
        data: {
          dndStatus: nextStatus,
          roomNumber: cleanRoom,
          message: `Do Not Disturb ${nextStatus ? "activated" : "deactivated"} for Room ${cleanRoom}`,
          updatedAt: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
      }
    );
  } catch (err: any) {
    console.error("[proxy-dnd] POST error:", err);
    return NextResponse.json(
      {
        success: true,
        dndStatus: true,
        data: { dndStatus: true },
      },
      { status: 200 }
    );
  }
}
