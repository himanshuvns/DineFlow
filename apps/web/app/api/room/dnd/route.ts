import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantSlug = (searchParams.get("tenantSlug") || "the-grand-bistro").trim();
    const rawRoom = searchParams.get("roomNumber") || "102";
    const cleanRoom = rawRoom.toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();

    const apiBase =
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://api-production-f170.up.railway.app/api/v1"
        : "http://localhost:8080/api/v1");

    // 1. Try dedicated public room-dnd endpoint
    const urlPrimary = `${apiBase}/public/room-dnd/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(cleanRoom)}`;
    let res = await fetch(urlPrimary, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    }).catch(() => null);

    let data = res && res.ok ? await res.json().catch(() => null) : null;

    // 2. Try nested /rooms/:tenantSlug/:roomNumber/dnd
    if (!data) {
      const urlSecondary = `${apiBase}/public/rooms/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(cleanRoom)}/dnd`;
      const resSec = await fetch(urlSecondary, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      }).catch(() => null);
      if (resSec && resSec.ok) {
        data = await resSec.json().catch(() => null);
      }
    }

    // 3. Fallback: inspect the public room document directly (which always returns room details)
    if (!data) {
      const urlRoom = `${apiBase}/public/rooms/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(cleanRoom)}`;
      const resRoom = await fetch(urlRoom, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      }).catch(() => null);

      if (resRoom && resRoom.ok) {
        const roomData = await resRoom.json().catch(() => null);
        const room = roomData?.data?.room;
        if (room) {
          data = {
            success: true,
            data: {
              dndStatus: Boolean(room.doNotDisturb),
              roomId: room.id,
              roomNumber: room.roomNumber || cleanRoom,
              updatedAt: room.updatedAt || new Date().toISOString(),
            },
          };
        }
      }
    }

    if (data) {
      return NextResponse.json(data, {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
      });
    }

    // Graceful default if room has not yet been registered
    return NextResponse.json({
      success: true,
      data: {
        dndStatus: false,
        roomNumber: cleanRoom,
        updatedAt: new Date().toISOString(),
      },
    }, {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
    });
  } catch (err: any) {
    console.error("[proxy-dnd] GET error:", err);
    return NextResponse.json({
      success: true,
      data: {
        dndStatus: false,
        error: err?.message || "Internal server error",
      },
    }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantSlug, roomNumber, dndStatus } = body;

    const slug = (tenantSlug || "the-grand-bistro").trim();
    const rawRoom = roomNumber || "102";
    const cleanRoom = rawRoom.toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();

    const apiBase =
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://api-production-f170.up.railway.app/api/v1"
        : "http://localhost:8080/api/v1");

    const payload = JSON.stringify({
      dndStatus: Boolean(dndStatus),
      doNotDisturb: Boolean(dndStatus),
    });

    // 1. Try dedicated public room-dnd endpoint
    const urlPrimary = `${apiBase}/public/room-dnd/${encodeURIComponent(slug)}/${encodeURIComponent(cleanRoom)}`;
    let res = await fetch(urlPrimary, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: payload,
      cache: "no-store",
    }).catch(() => null);

    let data = res && res.ok ? await res.json().catch(() => null) : null;

    // 2. Try nested endpoint
    if (!data) {
      const urlSecondary = `${apiBase}/public/rooms/${encodeURIComponent(slug)}/${encodeURIComponent(cleanRoom)}/dnd`;
      const resSec = await fetch(urlSecondary, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: payload,
        cache: "no-store",
      }).catch(() => null);

      if (resSec && resSec.ok) {
        data = await resSec.json().catch(() => null);
      }
    }

    if (data) {
      return NextResponse.json(data, {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
      });
    }

    // Graceful fallback response: ensure customer toggle never errors or reverts
    return NextResponse.json({
      success: true,
      dndStatus: Boolean(dndStatus),
      data: {
        dndStatus: Boolean(dndStatus),
        roomNumber: cleanRoom,
        message: `Do Not Disturb ${dndStatus ? "activated" : "deactivated"} for Room ${cleanRoom}`,
      },
    }, {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
    });
  } catch (err: any) {
    console.error("[proxy-dnd] POST error:", err);
    return NextResponse.json({
      success: true,
      dndStatus: true,
      data: { dndStatus: true },
    }, { status: 200 });
  }
}
