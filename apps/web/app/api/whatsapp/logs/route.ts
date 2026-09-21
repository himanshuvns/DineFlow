import { NextResponse } from "next/server";
import { getWhatsAppLogs } from "@/lib/room-tasks";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const logs = getWhatsAppLogs();
  return NextResponse.json({
    success: true,
    data: logs,
    count: logs.length,
  });
}
