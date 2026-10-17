import { NextRequest, NextResponse } from "next/server";

// In-memory runtime cache for fast cross-device sync during dev/server runtime
const publicConfigCache: Record<
  string,
  {
    upiVpa: string;
    merchantName: string;
    autoSettleOnWebhook: boolean;
    observerStatus: string;
    updatedAt: string;
  }
> = {};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug || "").trim().toLowerCase();

  if (!cleanSlug) {
    return NextResponse.json(
      { success: false, error: { message: "tenant slug is required" } },
      { status: 400 }
    );
  }

  // 1. If server memory has an updated config for this tenant slug, prefer it
  if (publicConfigCache[cleanSlug]) {
    return NextResponse.json({
      success: true,
      data: publicConfigCache[cleanSlug],
    });
  }

  // 2. Fetch from Go Backend API
  const apiBase =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://dine.rovixatech.com/api/v1"
      : "http://127.0.0.1:8080/api/v1");

  try {
    const res = await fetch(`${apiBase}/payments/public-config/${encodeURIComponent(cleanSlug)}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      const cfg = data.data || data;
      if (cfg && cfg.upiVpa) {
        publicConfigCache[cleanSlug] = {
          upiVpa: cfg.upiVpa,
          merchantName: cfg.merchantName || "DineFlow Restaurant",
          autoSettleOnWebhook: cfg.autoSettleOnWebhook ?? true,
          observerStatus: cfg.observerStatus || "offline",
          updatedAt: new Date().toISOString(),
        };
        return NextResponse.json({ success: true, data: publicConfigCache[cleanSlug] });
      }
    }
  } catch {
    // Backend offline / network fallback
  }

  // 3. Fallback defaults for new tenants
  return NextResponse.json({
    success: true,
    data: {
      upiVpa: "dineflow@icici",
      merchantName: "DineFlow Restaurant",
      autoSettleOnWebhook: true,
      observerStatus: "offline",
      updatedAt: new Date().toISOString(),
    },
  });
}

// POST endpoint allows updating the public cache across devices immediately when settings are saved
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug || "").trim().toLowerCase();

  try {
    const body = await request.json();
    const { upiVpa, merchantName, autoSettleOnWebhook, observerStatus } = body || {};

    if (!cleanSlug) {
      return NextResponse.json(
        { success: false, error: { message: "tenant slug is required" } },
        { status: 400 }
      );
    }

    publicConfigCache[cleanSlug] = {
      upiVpa: String(upiVpa || "").trim() || "dineflow@icici",
      merchantName: String(merchantName || "").trim() || "DineFlow Restaurant",
      autoSettleOnWebhook: autoSettleOnWebhook ?? true,
      observerStatus: observerStatus || "offline",
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: publicConfigCache[cleanSlug],
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: { message: "Failed to update public config cache" } },
      { status: 500 }
    );
  }
}
