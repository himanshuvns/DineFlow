import { NextRequest, NextResponse } from "next/server";
import { getBaseURL } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const base = getBaseURL();
    const res = await fetch(`${base}/offers`, {
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({ success: true, data: [] });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("Authorization");
    const base = getBaseURL();
    const res = await fetch(`${base}/offers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json({ success: true, data: body });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
