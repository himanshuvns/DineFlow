import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await context.params;
  if (!orderId) {
    return NextResponse.json(
      { success: false, error: "Order ID is required" },
      { status: 400 }
    );
  }

  const apiBase =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://api-production-f170.up.railway.app/api/v1"
      : "http://localhost:8080/api/v1");

  try {
    const res = await fetch(`${apiBase}/public/orders/${encodeURIComponent(orderId)}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        data || { success: false, error: "Order not found" },
        {
          status: res.status,
          headers: {
            "Cache-Control": "no-store, max-age=0, must-revalidate",
          },
        }
      );
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (err: unknown) {
    console.error(`[order-status-proxy] Failed to fetch order ${orderId}:`, err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to communicate with order tracking service",
      },
      { status: 500 }
    );
  }
}
