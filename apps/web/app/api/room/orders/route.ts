import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantSlug = (searchParams.get("tenantSlug") || searchParams.get("slug") || "the-grand-bistro").trim();
    const rawRoom = searchParams.get("roomNumber") || "102";
    const cleanRoom = rawRoom.toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();

    const apiBase =
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://api-production-f170.up.railway.app/api/v1"
        : "http://localhost:8080/api/v1");

    const targetUrl = `${apiBase}/public/rooms/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(cleanRoom)}/orders`;

    const res = await fetch(targetUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: data?.error?.message || data?.message || "Failed to fetch room orders" },
        { status: res.status >= 400 && res.status < 500 ? res.status : 400 }
      );
    }

    return NextResponse.json(data, {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
    });
  } catch (err: any) {
    console.error("[proxy-room-orders] GET error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
