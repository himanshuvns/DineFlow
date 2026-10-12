import { NextRequest, NextResponse } from "next/server";
import { getBaseURL } from "@/lib/api";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ tenantSlug: string }> }
) {
  try {
    const { tenantSlug } = await context.params;
    const base = getBaseURL();
    const res = await fetch(`${base}/offers/public/stream/${tenantSlug}`, {
      headers: {
        Accept: "text/event-stream",
      },
      cache: "no-store",
    });

    if (!res.ok || !res.body) {
      return new NextResponse("Stream unavailable", { status: 503 });
    }

    return new NextResponse(res.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    return new NextResponse("SSE connection error", { status: 500 });
  }
}
