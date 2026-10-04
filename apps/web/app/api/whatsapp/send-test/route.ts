import { NextRequest, NextResponse } from "next/server";
import { getWhatsAppLogs } from "@/lib/room-tasks";

export const dynamic = "force-dynamic";

const META_DEFAULT_TOKEN =
  "EAAT0C5k0pNoBSoxLeSngBEIhGDmBXkJZBKBcgjmZAOOTIyUUqbkDm1tRzjCgvlvCZARc76EBUvCCRRGlxf3hMQpKoXFRxdfUTD0vt4H69ML2L6ZAtMHZC6Jxd0lUiz9o3Q1WgoP9x1ZBWL4Cd5rDRWXpHZAXwI1tT5ipSvFUgCKGiv0zC0M3DxwR4tpaJQPDS2mFJ5ZBVrzeOVnZAKG0Bi6ycKuwKX2gRxIR7HYL7B3wUyQeW8CT678ZA8tZBSHlpdZCjdUuSbVEZCYiAmXlvZAF2YpNt4TlLz";

/**
 * POST /api/whatsapp/send-test
 * Dispatches a test WhatsApp notification via Meta Graph API v21.0
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recipientPhone, customerName = "Valued Guest", phoneId = "1382709818253532", accessToken, message } = body;

    if (!recipientPhone) {
      return NextResponse.json(
        { success: false, error: "Recipient phone number is required" },
        { status: 400 }
      );
    }

    let cleanPhone = recipientPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length === 10) {
      cleanPhone = "91" + cleanPhone;
    }

    const resolvedPhoneId = (phoneId || process.env.WHATSAPP_PHONE_NUMBER_ID || "1382709818253532").trim();
    const rawToken = accessToken || process.env.WHATSAPP_ACCESS_TOKEN || META_DEFAULT_TOKEN;
    const token = (rawToken || "").trim().replace(/^Bearer\s+/i, "");

    console.log(`[Send Test WhatsApp] Dispatching to ${cleanPhone} via PhoneID ${resolvedPhoneId}`);

    if (token && !token.startsWith("EAAG...")) {
      const url = `https://graph.facebook.com/v21.0/${resolvedPhoneId}/messages`;
      
      let graphRes: Response;
      let graphData: any;

      if (message) {
        // Send custom freeform text message
        const textPayload = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cleanPhone,
          type: "text",
          text: {
            body: message,
          },
        };

        graphRes = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(textPayload),
        });
        graphData = await graphRes.json().catch(() => null);
      } else {
        // Try sending pre-approved template first (works outside & inside 24h conversation window)
        const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const templatePayload = {
          messaging_product: "whatsapp",
          to: cleanPhone,
          type: "template",
          template: {
            name: "jaspers_market_order_confirmation_v1",
            language: { code: "en_US" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: customerName },
                  { type: "text", text: "ORD-" + Math.floor(1000 + Math.random() * 9000) },
                  { type: "text", text: dateStr },
                ],
              },
            ],
          },
        };

        graphRes = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(templatePayload),
        });

        graphData = await graphRes.json().catch(() => null);

        // If template fails, fallback to freeform text message
        if (!graphRes.ok) {
          console.warn("[Send Test WhatsApp Template failed, falling back to text]", graphData);
          const textPayload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: cleanPhone,
            type: "text",
            text: {
              body: `Hi ${customerName}! 🍽️✨ Your test order from DineFlow Hospitality OS has been confirmed.\n\nTotal: ₹1,170.00\nStatus: Preparing in Kitchen\n\nLive tracking: https://dineflow-steel.vercel.app`,
            },
          };

          graphRes = await fetch(url, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(textPayload),
          });

          graphData = await graphRes.json().catch(() => null);
        }
      }

      if (!graphRes.ok) {
        console.error("[Send Test WhatsApp Meta Error]", graphData);
        const metaErrorMsg =
          graphData?.error?.message || `Meta API Error (${graphData?.error?.code || graphRes.status})`;
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "META_API_ERROR",
              message: metaErrorMsg,
            },
          },
          { status: 400 }
        );
      }

      const msgId = graphData?.messages?.[0]?.id || "wam-" + Date.now();
      
      // Record to in-memory WhatsApp log store
      try {
        getWhatsAppLogs().unshift({
          id: msgId,
          phone: "+" + cleanPhone,
          customerName: customerName,
          template: "Order Confirmation (Live Meta)",
          status: "delivered",
          time: "Just now",
          location: "Table 14",
        });
      } catch {}

      return NextResponse.json({
        success: true,
        data: {
          id: msgId,
          recipient: cleanPhone,
          status: "delivered",
          raw: graphData,
        },
      });
    }

    // Simulated sandbox response if no token
    return NextResponse.json({
      success: true,
      data: {
        id: "wam-sim-" + Date.now(),
        recipient: cleanPhone,
        status: "delivered",
      },
    });
  } catch (err: unknown) {
    console.error("[Send Test WhatsApp Error]", err);
    const msg = (err as Error)?.message || String(err) || "Failed to dispatch test notification";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
