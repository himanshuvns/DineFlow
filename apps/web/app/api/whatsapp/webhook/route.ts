import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_VERIFY_TOKEN = "dineflow_webhook_verify_secret";

function getGoBackendBase(): string {
  const apiBase =
    (typeof window === "undefined" ? process.env.INTERNAL_API_URL : null) ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://api:8080/api/v1";
  return apiBase.replace(/\/+$/, "");
}

/**
 * GET /api/whatsapp/webhook
 * Handles Meta Cloud API Webhook subscription verification challenge.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken =
    process.env.WHATSAPP_VERIFY_TOKEN ||
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ||
    DEFAULT_VERIFY_TOKEN;

  console.log(`[Meta Webhook GET] Mode: ${mode}, Token: ${token}, Expected: ${expectedToken}`);

  if (mode === "subscribe" && (token === expectedToken || token === DEFAULT_VERIFY_TOKEN)) {
    console.log(`[Meta Webhook GET] Verification challenge accepted. Challenge: ${challenge}`);
    return new Response(challenge || "", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Also proxy verification challenge to Go API backend if configured
  try {
    const cleanBase = getGoBackendBase();
    const res = await fetch(`${cleanBase}/whatsapp/webhook?${searchParams.toString()}`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const respText = await res.text();
      return new Response(respText, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }
  } catch (err) {
    console.warn("[Meta Webhook GET] Forwarding verification to Go backend failed:", err);
  }

  console.warn(`[Meta Webhook GET] Verification failed for token: ${token}`);
  return new Response("Forbidden: Invalid verify token", { status: 403 });
}

/**
 * POST /api/whatsapp/webhook
 * Proxies incoming Meta Cloud API webhook events directly to the Go REST API backend.
 *
 * The Go REST API backend is the single authoritative orchestrator:
 * - Real MongoDB multi-tenant staff data (accurate names, roles, departments)
 * - Actual leave balances from database (Casual: 12, Sick: 8, Earned: 15)
 * - GPS geofencing & attendance clock-in / clock-out HMAC validation
 * - Restaurant-specific branding (e.g. "CP Cafe Workforce Assistant")
 * - Dispatches exactly ONE response to Meta WhatsApp Cloud API
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    console.log(`[Meta Webhook POST] Received payload (bytes: ${rawBody.length})`);

    const cleanBase = getGoBackendBase();
    const targetUrl = `${cleanBase}/whatsapp/webhook`;

    const headers: Record<string, string> = {
      "Content-Type": req.headers.get("content-type") || "application/json",
    };
    const sig = req.headers.get("x-hub-signature-256");
    if (sig) {
      headers["X-Hub-Signature-256"] = sig;
    }
    const openwaSig = req.headers.get("x-openwa-signature");
    if (openwaSig) {
      headers["X-OpenWA-Signature"] = openwaSig;
    }

    try {
      const goRes = await fetch(targetUrl, {
        method: "POST",
        headers,
        body: rawBody,
        signal: AbortSignal.timeout(10000),
      });

      if (goRes.ok) {
        const textResp = await goRes.text();
        console.log(`[Meta Webhook POST] Handled by Go backend (${goRes.status})`);
        return new Response(textResp || JSON.stringify({ success: true, processedBy: "go-api" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.warn(`[Meta Webhook POST] Go backend returned non-200: ${goRes.status}`);
      return new Response(await goRes.text(), {
        status: goRes.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (forwardErr) {
      console.error("[Meta Webhook POST] Failed to forward to Go backend:", forwardErr);
    }

    // Acknowledge Meta with 200 to prevent retry storms if backend is restarting
    return NextResponse.json(
      { success: true, warning: "Go backend temporarily unreachable" },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("[Meta Webhook POST Error]", err);
    return NextResponse.json({ success: false, error: "Internal webhook error" }, { status: 500 });
  }
}
