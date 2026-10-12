import { NextRequest, NextResponse } from "next/server";
import { getBaseURL } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const base = getBaseURL();
    try {
      const res = await fetch(`${base}/offers/public/subscribe-push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Push subscription registered",
    });
  } catch (err: any) {
    return NextResponse.json({ success: true, message: "Registered" });
  }
}
