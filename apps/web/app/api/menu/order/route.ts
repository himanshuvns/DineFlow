import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const apiBase =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://api-production-f170.up.railway.app/api/v1"
        : "http://localhost:8080/api/v1");

    // Resolve tenantSlug alias if provided
    if (body.tenantSlug) {
      const slug = String(body.tenantSlug).toLowerCase();
      if (slug === "dineflow" || slug === "restaurant" || slug === "demo") {
        body.tenantSlug = "the-grand-bistro";
      }
    }

    const res = await fetch(`${apiBase}/public/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        data || { success: false, error: "Failed to create order" },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    console.error("[order-api-proxy] Failed to create order:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error connecting to dining engine",
      },
      { status: 500 }
    );
  }
}
