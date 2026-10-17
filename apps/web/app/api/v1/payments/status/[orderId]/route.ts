import { NextRequest, NextResponse } from "next/server";

// Fallback in-memory status cache for offline development or client simulation
const simulatedPaidOrders = new Set<string>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const cleanId = decodeURIComponent(orderId || "").trim();

  if (!cleanId) {
    return NextResponse.json(
      { success: false, error: { message: "orderId is required" } },
      { status: 400 }
    );
  }

  // If order was simulated as paid in current session
  if (simulatedPaidOrders.has(cleanId)) {
    return NextResponse.json({
      success: true,
      data: {
        orderId: cleanId,
        status: "paid",
        utr: "YOUPI" + Math.floor(1000000000 + Math.random() * 9000000000),
        settledAt: new Date().toISOString(),
      },
    });
  }

  // Try fetching from Go backend API if reachable
  const apiBase =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://dine.rovixatech.com/api/v1"
      : "http://127.0.0.1:8080/api/v1");

  try {
    const res = await fetch(`${apiBase}/payments/status/${encodeURIComponent(cleanId)}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // If backend isn't reachable during pure frontend dev, return pending
  }

  return NextResponse.json({
    success: true,
    data: {
      orderId: cleanId,
      status: "pending",
    },
  });
}

// POST endpoint allows simulating or mocking payment completion in sandbox/demo
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const cleanId = decodeURIComponent(orderId || "").trim();

  if (!cleanId) {
    return NextResponse.json(
      { success: false, error: { message: "orderId is required" } },
      { status: 400 }
    );
  }

  simulatedPaidOrders.add(cleanId);

  return NextResponse.json({
    success: true,
    data: {
      orderId: cleanId,
      status: "paid",
      utr: "YOUPI" + Math.floor(1000000000 + Math.random() * 9000000000),
      settledAt: new Date().toISOString(),
    },
  });
}
