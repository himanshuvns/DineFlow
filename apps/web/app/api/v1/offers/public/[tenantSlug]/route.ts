import { NextRequest, NextResponse } from "next/server";
import { getBaseURL } from "@/lib/api";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ tenantSlug: string }> }
) {
  try {
    const { tenantSlug } = await context.params;
    const base = getBaseURL();
    const res = await fetch(`${base}/offers/public/${tenantSlug}`, {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({ success: true, data: [] });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}
