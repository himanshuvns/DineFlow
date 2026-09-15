import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || searchParams.get("tenantSlug") || "the-grand-bistro";
  const room = searchParams.get("room") || searchParams.get("roomNumber") || "102";

  const cleanRoom = room.toUpperCase().replace(/^(ROOM-|SUITE-)/, "");

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://api-production-f170.up.railway.app/api/v1"
      : "http://localhost:8080/api/v1");

  try {
    // Try clean endpoint first, then fallback to nested endpoint
    let res = await fetch(
      `${apiBase}/public/room-tasks/${encodeURIComponent(slug)}/${encodeURIComponent(cleanRoom)}`,
      {
        cache: "no-store",
        headers: { Accept: "application/json" },
      }
    );

    if (!res.ok) {
      res = await fetch(
        `${apiBase}/public/rooms/${encodeURIComponent(slug)}/${encodeURIComponent(cleanRoom)}/tasks`,
        {
          cache: "no-store",
          headers: { Accept: "application/json" },
        }
      );
    }

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
      });
    }

    return NextResponse.json(
      { success: true, tasks: [], message: "No active tasks" },
      { status: 200 }
    );
  } catch (err: any) {
    console.warn("[proxy-room-tasks] GET error:", err);
    return NextResponse.json(
      { success: true, tasks: [], error: err?.message || "Failed to fetch room tasks" },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantSlug, roomNumber, amenityType, title, priority, notes } = body;

    const slug = tenantSlug || "the-grand-bistro";
    const cleanRoom = (roomNumber || "102").toUpperCase().replace(/^(ROOM-|SUITE-)/, "");

    const apiBase =
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://api-production-f170.up.railway.app/api/v1"
        : "http://localhost:8080/api/v1");

    let res = await fetch(
      `${apiBase}/public/room-tasks/${encodeURIComponent(slug)}/${encodeURIComponent(cleanRoom)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ amenityType, title, priority, notes }),
      }
    );

    if (!res.ok) {
      res = await fetch(
        `${apiBase}/public/rooms/${encodeURIComponent(slug)}/${encodeURIComponent(cleanRoom)}/amenity`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ amenityType, title, priority, notes }),
        }
      );
    }

    const data = await res.json().catch(() => null);

    if (res.ok) {
      return NextResponse.json(data || { success: true }, { status: 200 });
    }

    return NextResponse.json(
      data || { success: false, error: "Failed to dispatch service request" },
      { status: res.status || 400 }
    );
  } catch (err: any) {
    console.error("[proxy-room-tasks] POST error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to dispatch request" },
      { status: 500 }
    );
  }
}
