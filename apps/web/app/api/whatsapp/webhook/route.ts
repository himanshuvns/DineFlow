import { NextRequest, NextResponse } from "next/server";
import { getWhatsAppLogs } from "@/lib/room-tasks";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_VERIFY_TOKEN = "dineflow_webhook_verify_secret";
const META_DEFAULT_TOKEN =
  "EAAT0C5k0pNoBSoxLeSngBEIhGDmBXkJZBKBcgjmZAOOTIyUUqbkDm1tRzjCgvlvCZARc76EBUvCCRRGlxf3hMQpKoXFRxdfUTD0vt4H69ML2L6ZAtMHZC6Jxd0lUiz9o3Q1WgoP9x1ZBWL4Cd5rDRWXpHZAXwI1tT5ipSvFUgCKGiv0zC0M3DxwR4tpaJQPDS2mFJ5ZBVrzeOVnZAKG0Bi6ycKuwKX2gRxIR7HYL7B3wUyQeW8CT678ZA8tZBSHlpdZCjdUuSbVEZCYiAmXlvZAF2YpNt4TlLz";

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

  console.warn(`[Meta Webhook GET] Verification failed for token: ${token}`);
  return new Response("Forbidden: Invalid verify token", { status: 403 });
}

/**
 * POST /api/whatsapp/webhook
 * Handles incoming Meta Cloud API webhook events (messages, status updates).
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);

    console.log("[Meta Webhook POST] Received payload:", JSON.stringify(payload).slice(0, 500));

    // Try forwarding to Go API backend if running
    const goBackendUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://api-production-f170.up.railway.app/api/v1";

    fetch(`${goBackendUrl}/whatsapp/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: rawBody,
    }).catch(() => {
      // Backend may be cold or waking up; continue with edge handling
    });

    if (payload.object === "whatsapp_business_account" && Array.isArray(payload.entry)) {
      for (const entry of payload.entry) {
        for (const change of entry.changes || []) {
          const value = change.value;
          if (!value || !Array.isArray(value.messages)) continue;

          const phoneId = value.metadata?.phone_number_id || process.env.WHATSAPP_PHONE_NUMBER_ID || "1382709818253532";

          for (const msg of value.messages) {
            const from = msg.from;
            const text = (msg.text?.body || msg.interactive?.button_reply?.title || "").trim();
            const lower = text.toLowerCase();

            console.log(`[Meta Inbound Message] From: ${from}, PhoneID: ${phoneId}, Text: "${text}"`);

            // Record inbound message
            try {
              getWhatsAppLogs().unshift({
                id: msg.id || "wam-in-" + Date.now(),
                phone: "+" + from,
                customerName: value.contacts?.[0]?.profile?.name || "Customer",
                template: `Guest: "${text}"`,
                status: "read",
                time: "Just now",
                location: "Table 14",
              });
            } catch {}

            // Generate intelligent auto-reply
            let replyText = "";
            if (lower === "hi" || lower === "hello" || lower === "hey" || lower === "start" || lower === "help") {
              replyText =
                "Welcome to DineFlow! ✨🍽️\n\nHow may we serve you today? Reply with a number:\n\n" +
                "1. 📋 Menu & Chef Specials\n" +
                "2. 🛵 Track Live Order Status\n" +
                "3. 🛎️ Room / Table Assistance\n" +
                "4. 🙋 Speak with Staff\n\n" +
                "Or simply text your request!";
            } else if (lower === "1" || lower.includes("menu") || lower.includes("special") || lower.includes("food")) {
              replyText =
                "🍽️ Today's Specials at DineFlow:\n\n" +
                "• Truffle Mushroom Risotto — ₹850\n" +
                "• Wood-Fired Margherita Pizza — ₹750\n" +
                "• Belgian Dark Chocolate Fondant — ₹450\n\n" +
                "📱 Browse our full interactive menu:\nhttps://dineflow-steel.vercel.app\n\n" +
                "Reply with an item name to order or STATUS to track your food!";
            } else if (lower === "2" || lower.includes("status") || lower.includes("track") || lower.includes("ord-")) {
              replyText =
                "🛵 Order Tracker:\n\nPlease reply with your Order Number (e.g. ORD-1024) to see real-time preparation & delivery status!";
            } else if (lower === "3" || lower.includes("room") || lower.includes("table") || lower.includes("water") || lower.includes("towel")) {
              replyText =
                `🛎️ Request acknowledged! Our steward team has received your message ("${text}") and will deliver assistance promptly.`;
            } else if (lower === "4" || lower.includes("staff") || lower.includes("human") || lower.includes("waiter")) {
              replyText =
                "🙋 You are now connected with our front-desk steward team. A staff member will respond directly to you in a moment!\n\nFor urgent queries, feel free to call our reception.";
            } else {
              replyText =
                "Thank you for contacting DineFlow! 😊\n\n" +
                "Reply with:\n" +
                "• MENU — View specials & menu link\n" +
                "• STATUS — Check your active order\n" +
                "• STAFF — Request live human assistance";
            }

            // Dispatch response back via Meta Graph API
            const rawToken = process.env.WHATSAPP_ACCESS_TOKEN || META_DEFAULT_TOKEN;
            const token = rawToken.replace(/^Bearer\s+/i, "");

            if (token && phoneId && from) {
              const cleanFrom = from.replace(/[^0-9]/g, "");
              const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;

              try {
                const graphRes = await fetch(url, {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: cleanFrom,
                    type: "text",
                    text: { body: replyText },
                  }),
                });

                const graphData = await graphRes.json().catch(() => null);
                console.log(`[Meta Auto-Reply Outbound] Status: ${graphRes.status}`, graphData);

                // Record outbound auto-reply in log store
                try {
                  getWhatsAppLogs().unshift({
                    id: graphData?.messages?.[0]?.id || "wam-rep-" + Date.now(),
                    phone: "+" + cleanFrom,
                    customerName: value.contacts?.[0]?.profile?.name || "Customer",
                    template: `Auto-Reply: "${replyText.split("\n")[0]}"`,
                    status: "delivered",
                    time: "Just now",
                    location: "Table 14",
                  });
                } catch {}
              } catch (dispatchErr) {
                console.error("[Meta Auto-Reply Error] Failed to send via Graph API:", dispatchErr);
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processed" }, { status: 200 });
  } catch (err: unknown) {
    console.error("[Meta Webhook Error]", err);
    return NextResponse.json({ success: false, error: "Internal processing error" }, { status: 500 });
  }
}
