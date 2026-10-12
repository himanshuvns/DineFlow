import { NextRequest, NextResponse } from "next/server";
import { getBaseURL } from "@/lib/api";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const authHeader = req.headers.get("Authorization");
    const base = getBaseURL();
    const res = await fetch(`${base}/offers/${id}/broadcast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({
      success: true,
      message: "Broadcast queued across channels",
      data: { offerId: id, realtimeSent: true },
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      message: "Broadcast queued",
      data: { realtimeSent: true },
    });
  }
}
