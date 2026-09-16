import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantSlug, roomNumber, newCheckOut, notes, additionalNights } = body;

    if (!newCheckOut) {
      return NextResponse.json(
        { success: false, error: "New check-out date is required" },
        { status: 400 }
      );
    }

    const slug = (tenantSlug || "the-grand-bistro").trim();
    const rawRoom = roomNumber || "102";
    const cleanRoom = rawRoom.toUpperCase().replace(/^(ROOM-|SUITE-)/, "").trim();

    const apiBase =
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://api-production-f170.up.railway.app/api/v1"
        : "http://localhost:8080/api/v1");

    const targetUrl = `${apiBase}/public/rooms/${encodeURIComponent(slug)}/${encodeURIComponent(cleanRoom)}/extend-stay`;

    let res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        newCheckOut,
        notes: notes || "",
        additionalNights: additionalNights || 0,
      }),
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg =
        data?.error?.message ||
        data?.message ||
        "Failed to extend stay. Please contact front desk.";
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: res.status >= 400 && res.status < 500 ? res.status : 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        ...data,
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
