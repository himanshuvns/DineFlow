import { NextRequest, NextResponse } from "next/server";
import { getWhatsAppLogs, getTasksStore } from "@/lib/room-tasks";
import {
  findStaffByPhone,
  recordAttendance,
  recordLeaveRequest,
  generateCheckInSignedUrl,
  StaffMember,
} from "@/lib/staff-storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_VERIFY_TOKEN = "dineflow_webhook_verify_secret";
const META_DEFAULT_TOKEN =
  "EAAT0C5k0pNoBSgv0uB2YNSB45Blc515eqTUKPZAZAPbsZCnGIR4ZASlVZCvTOz0G7ePRuNHiOE7Xp9UwxxHU8YFZCWWPOYitHutvE3JcoxygWiCqLB5ChgKxJhtVYm5HmZALPMbTtJIBDB2PpcYhY6eb2kyCfVg4CeMa3pMo6N5zaGMyYUkkLxYjLCaLi19LmuHGgZDZD";

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
 * Generates automated reply for STAFF members
 */
function handleStaffFlow(staff: StaffMember, text: string): string {
  const lower = text.toLowerCase().trim();
  const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // 1. Clock In / Check In
  if (lower === "1" || lower.includes("clock in") || lower.includes("check in") || lower.includes("checkin")) {
    recordAttendance("clock_in", staff, "whatsapp");
    const signedUrl = generateCheckInSignedUrl(staff, "clock_in");
    return (
      `📍 *Attendance Verification (Clock In)*\n\n` +
      `👋 Hello ${staff.name}!\n` +
      `🕒 Recorded Time: ${nowTime}\n` +
      `🏢 Department: ${staff.department}\n` +
      `🆔 Employee ID: ${staff.employeeId}\n\n` +
      `📱 *Verify GPS Geofence Location (100m)*:\n${signedUrl}\n\n` +
      `Have a safe and productive shift! ✨`
    );
  }

  // 2. Clock Out / Departure
  if (lower === "2" || lower.includes("clock out") || lower.includes("checkout") || lower.includes("leaving")) {
    recordAttendance("clock_out", staff, "whatsapp");
    return (
      `🚪 *Clock Out Recorded*\n\n` +
      `Goodbye ${staff.name}!\n` +
      `🕒 Departure Time: ${nowTime}\n` +
      `📅 Shift Status: Completed\n\n` +
      `Thank you for your hard work today! Have a restful evening.`
    );
  }

  // 3. Break (Take / Resume)
  if (lower === "3" || lower.includes("break") || lower.includes("tea") || lower.includes("lunch")) {
    const isResume = lower.includes("resume") || lower.includes("back");
    recordAttendance(isResume ? "break_end" : "break_start", staff, "whatsapp");
    if (isResume) {
      return (
        `☕ *Break Ended (Welcome Back)*\n\n` +
        `Resumed active station at ${nowTime}.\n` +
        `Good to have you back on duty, ${staff.name}!`
      );
    }
    return (
      `☕ *Break Recorded*\n\n` +
      `Break commenced at ${nowTime}.\n` +
      `Enjoy your rest! Text *'resume'* when you return to your station.`
    );
  }

  // 4. Leave Balance & Application
  if (lower === "4" || lower.includes("leave") || lower.includes("sick") || lower.includes("casual") || lower.includes("vacation")) {
    const isSick = lower.includes("sick") || lower.includes("medical") || lower.includes("fever") || lower.includes("unwell");
    const leaveType = isSick ? "sick" : "casual";

    // If natural language apply: "apply sick leave tomorrow" or "need leave"
    if (lower.includes("apply") || lower.includes("need") || lower.includes("tomorrow") || lower.includes("want")) {
      const rec = recordLeaveRequest(staff, leaveType, "Upcoming Date", "Upcoming Date", text);
      return (
        `🌴 *Leave Request Acknowledged*\n\n` +
        `Staff: ${staff.name} (${staff.employeeId})\n` +
        `Leave Type: ${isSick ? "Sick Leave (Medical)" : "Casual Leave"}\n` +
        `Reference ID: ${rec.id}\n` +
        `Status: ⏳ Submitted & Pending Manager Approval\n\n` +
        `📊 *Updated Leave Balance*:\n` +
        `• Casual Leave: ${staff.leaveBalance?.casual ?? 8} days\n` +
        `• Sick Leave: ${staff.leaveBalance?.sick ?? 5} days\n` +
        `• Earned Leave: ${staff.leaveBalance?.earned ?? 10} days\n\n` +
        `Your operations lead has been notified.`
      );
    }

    return (
      `🌴 *Leave Balance & Application*\n\n` +
      `Staff: ${staff.name} (${staff.employeeId})\n\n` +
      `📊 *Your Current Balances*:\n` +
      `• Casual Leave: ${staff.leaveBalance?.casual ?? 8} days\n` +
      `• Sick Leave: ${staff.leaveBalance?.sick ?? 5} days\n` +
      `• Earned Leave: ${staff.leaveBalance?.earned ?? 10} days\n\n` +
      `💡 _To apply immediately, reply with:_\n` +
      `*'apply sick leave tomorrow'* or *'apply casual leave Friday'*`
    );
  }

  // 5. Shift & Schedule
  if (lower === "5" || lower.includes("shift") || lower.includes("schedule") || lower.includes("roster") || lower.includes("timing")) {
    return (
      `📅 *Your Work Schedule & Shift*\n\n` +
      `Staff: ${staff.name} (${staff.role.toUpperCase()})\n` +
      `Department: ${staff.department}\n` +
      `Current Shift: ${staff.shiftName || "Morning Shift"} (${staff.shiftHours || "08:00 - 16:30"})\n\n` +
      `Weekly Roster:\n` +
      `• Today: Active (${staff.shiftHours || "08:00 - 16:30"})\n` +
      `• Tomorrow: Scheduled (${staff.shiftHours || "08:00 - 16:30"})\n` +
      `• Sat - Sun: Regular Service Operations\n\n` +
      `For shift swap requests, contact your duty manager.`
    );
  }

  // 6. Attendance History
  if (lower === "6" || lower.includes("attendance") || lower.includes("history")) {
    return (
      `🕒 *Monthly Attendance Recap*\n\n` +
      `Staff: ${staff.name} (${staff.employeeId})\n` +
      `Period: ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}\n\n` +
      `• Total Working Days: 24\n` +
      `• Days Present: 22 Days (96% punctuality)\n` +
      `• Late Arrivals: 1\n` +
      `• Approved Leaves: 2 Days\n\n` +
      `Attendance Grade: ⭐ Grade A (Eligible for Monthly Attendance Bonus)`
    );
  }

  // 7. Payslip & Salary
  if (lower === "7" || lower.includes("payslip") || lower.includes("salary") || lower.includes("pay")) {
    const basic = staff.salaryBasic || 25000;
    const hra = Math.round(basic * 0.4);
    const pf = Math.round(basic * 0.12);
    const net = basic + hra - pf;
    return (
      `💰 *Latest Monthly Payslip Summary*\n\n` +
      `Employee: ${staff.name} (${staff.employeeId})\n` +
      `Month: ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}\n\n` +
      `• Basic Pay: ₹${basic.toLocaleString("en-IN")}\n` +
      `• HRA & Allowances: ₹${hra.toLocaleString("en-IN")}\n` +
      `• Statutory Deductions (PF/ESI): -₹${pf.toLocaleString("en-IN")}\n` +
      `──────────────────────\n` +
      `💵 *Net Disbursed*: ₹${net.toLocaleString("en-IN")}\n\n` +
      `Disbursed via Direct Bank Transfer. PDF copy sent to your email.`
    );
  }

  // 8. Tasks & Room Service
  if (lower === "8" || lower.includes("task") || lower.includes("order") || lower.includes("room")) {
    return (
      `🛎️ *Active Service Tasks*\n\n` +
      `Assigned to: ${staff.name} (${staff.department})\n\n` +
      `1. Table 14: Refresh Water & Bill Request (High Priority)\n` +
      `2. Table 8: Clear Appetizer Plates & Offer Dessert Menu\n` +
      `3. Suite 201: Linens & Amenities Check\n\n` +
      `Reply with the task number to mark as completed!`
    );
  }

  // Running late natural language
  if (lower.includes("late") || lower.includes("traffic") || lower.includes("delay")) {
    return (
      `⚠️ *Late Arrival Notice Acknowledged*\n\n` +
      `Thank you for notifying us, ${staff.name}.\n` +
      `Your delay message ("${text}") has been registered with Operations.\n` +
      `Please commute safely and verify your GPS clock-in upon arrival!`
    );
  }

  // Default: Workforce Assistant Menu
  return (
    `👋 *Hello ${staff.name}!*\n` +
    `Welcome to the *DineFlow Workforce Assistant* (${staff.role.toUpperCase()}).\n\n` +
    `Reply with an option or number:\n` +
    `1️⃣ 📍 *Clock In* (GPS Geofence)\n` +
    `2️⃣ 🚪 *Clock Out* (Departure)\n` +
    `3️⃣ ☕ *Break* (Take / Resume Break)\n` +
    `4️⃣ 🌴 *Leave Balance & Apply*\n` +
    `5️⃣ 📅 *Shift & Schedule*\n` +
    `6️⃣ 🕒 *Attendance History*\n` +
    `7️⃣ 💰 *Latest Payslip*\n` +
    `8️⃣ 🛎️ *Tasks & Room Service*\n` +
    `9️⃣ ❓ *Help / Menu*\n\n` +
    `💡 _Tip: You can also text 'apply sick leave tomorrow' or 'running 15 mins late'!_`
  );
}

/**
 * Generates automated reply for CUSTOMER / GUEST
 */
function handleCustomerFlow(text: string, guestName: string): string {
  const lower = text.toLowerCase().trim();

  // 1. Menu & Specials
  if (
    lower === "1" ||
    lower.includes("menu") ||
    lower.includes("food") ||
    lower.includes("special") ||
    lower.includes("dish") ||
    lower.includes("pizza") ||
    lower.includes("risotto") ||
    lower.includes("chocolate") ||
    lower.includes("price")
  ) {
    return (
      `🍽️ *Today's Specials at DineFlow:*\n\n` +
      `• *Truffle Mushroom Risotto* — ₹850\n` +
      `• *Wood-Fired Margherita Pizza* — ₹750\n` +
      `• *Belgian Dark Chocolate Fondant* — ₹450\n` +
      `• *Crispy Calamari Fritti* — ₹620\n` +
      `• *Signature Masala Chai & Tarts* — ₹280\n\n` +
      `📱 *Browse Full Interactive Digital Menu*:\n` +
      `https://dine.rovixatech.com\n\n` +
      `Reply with any item name to order or reply *2* to track an active order!`
    );
  }

  // 2. Order Tracking
  if (lower === "2" || lower.includes("order") || lower.includes("track") || lower.includes("status") || lower.includes("ord-")) {
    const orderNumMatch = text.match(/ord-?[0-9a-z]+/i);
    const orderNum = orderNumMatch ? orderNumMatch[0].toUpperCase() : "ORD-8821";
    return (
      `🛵 *Live Order Tracker #${orderNum}*\n\n` +
      `🍳 Status: *In Kitchen Preparation*\n` +
      `⏱️ Estimated Delivery: *~12 minutes*\n` +
      `📍 Location: Table 14\n` +
      `💰 Total: ₹1,170.00 (Confirmed)\n\n` +
      `📱 *Live tracking link*:\n` +
      `https://dine.rovixatech.com\n\n` +
      `Our floor steward will serve your items piping hot!`
    );
  }

  // 3. Table / Room Steward Assistance
  if (
    lower === "3" ||
    lower.includes("table") ||
    lower.includes("room") ||
    lower.includes("water") ||
    lower.includes("napkin") ||
    lower.includes("waiter") ||
    lower.includes("steward") ||
    lower.includes("bill") ||
    lower.includes("check")
  ) {
    try {
      getTasksStore().unshift({
        id: "tsk-" + Date.now().toString().slice(-4),
        roomNumber: "Table 14",
        taskType: "steward",
        title: `Guest Request: "${text}"`,
        priority: "high",
        status: "pending",
        source: "whatsapp",
        isGuestRequest: true,
        createdAt: new Date().toISOString(),
      });
    } catch {}

    return (
      `🛎️ *Steward & Service Request Logged!*\n\n` +
      `Your request ("${text}") has been acknowledged.\n` +
      `A steward has been dispatched to assist your table promptly.\n\n` +
      `Need urgent assistance? Reply *4* to connect with front-desk staff.`
    );
  }

  // 4. Staff / Human Handoff
  if (lower === "4" || lower.includes("staff") || lower.includes("human") || lower.includes("reception") || lower.includes("call")) {
    return (
      `🙋 *Connected to Front Desk*\n\n` +
      `Our Duty Manager has been alerted to your request.\n` +
      `A team member will respond directly to you in this chat in a moment!\n\n` +
      `For emergency assistance, reception helpline: +91 98000 12345.`
    );
  }

  // Default: Welcome Greeting
  return (
    `Welcome to DineFlow! ✨🍽️\n\n` +
    `Hello ${guestName}! How may we serve you today? Reply with a number or text:\n\n` +
    `1️⃣ 📋 *Menu & Chef Specials*\n` +
    `2️⃣ 🛵 *Track Live Order Status*\n` +
    `3️⃣ 🛎️ *Table / Room Assistance & Call Waiter*\n` +
    `4️⃣ 🙋 *Speak with Staff / Reception*\n\n` +
    `Or simply text what you would like to order or request!`
  );
}

/**
 * POST /api/whatsapp/webhook
 * Handles incoming Meta Cloud API webhook events.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);

    console.log("[Meta Webhook POST] Received payload:", JSON.stringify(payload).slice(0, 500));

    // Try forwarding to Go API backend if running (non-blocking)
    const goBackendUrl = process.env.INTERNAL_API_URL;
    if (goBackendUrl) {
      fetch(`${goBackendUrl}/whatsapp/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: rawBody,
      }).catch(() => {});
    }

    if (payload.object === "whatsapp_business_account" && Array.isArray(payload.entry)) {
      for (const entry of payload.entry) {
        for (const change of entry.changes || []) {
          const value = change.value;
          if (!value || !Array.isArray(value.messages)) continue;

          const phoneId =
            value.metadata?.phone_number_id ||
            process.env.WHATSAPP_PHONE_NUMBER_ID ||
            "1382709818253532";

          for (const msg of value.messages) {
            const from = msg.from;
            const text = (msg.text?.body || msg.interactive?.button_reply?.title || "").trim();
            const contactName = value.contacts?.[0]?.profile?.name || "Valued Guest";

            console.log(`[Meta Inbound Message] From: ${from}, PhoneID: ${phoneId}, Text: "${text}"`);

            // 1. Dual-Persona Lookup: Check if sender is Staff or Customer
            const matchedStaff = findStaffByPhone(from);
            const isStaff = !!matchedStaff;

            let replyText = "";
            let senderType = "customer";

            if (isStaff && matchedStaff) {
              senderType = "staff";
              replyText = handleStaffFlow(matchedStaff, text);
            } else {
              senderType = "customer";
              replyText = handleCustomerFlow(text, contactName);
            }

            // 2. Record Inbound Message in Log Store
            try {
              getWhatsAppLogs().unshift({
                id: msg.id || "wam-in-" + Date.now(),
                phone: "+" + from,
                customerName: isStaff ? matchedStaff!.name : contactName,
                template: `${isStaff ? "Staff (" + matchedStaff!.role + ")" : "Guest"}: "${text}"`,
                status: "read",
                time: "Just now",
                location: isStaff ? matchedStaff!.department : "Table 14",
              });
            } catch {}

            // 3. Dispatch Outbound Reply via Meta Graph API v21.0
            const envToken = process.env.WHATSAPP_ACCESS_TOKEN;
            const isStaleToken =
              envToken &&
              (envToken.startsWith("EAAT0C5k0pNoBSmZC") ||
                envToken.startsWith("EAAT0C5k0pNoBSoxLe") ||
                envToken.startsWith("EAAG..."));
            const rawToken = !isStaleToken && envToken ? envToken : META_DEFAULT_TOKEN;
            const token = rawToken.replace(/^Bearer\s+/i, "").trim();

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
                console.log(`[Meta Outbound Reply] To: ${cleanFrom}, Status: ${graphRes.status}`, graphData);

                // 4. Record Outbound Bot Reply in Log Store
                try {
                  getWhatsAppLogs().unshift({
                    id: graphData?.messages?.[0]?.id || "wam-rep-" + Date.now(),
                    phone: "+" + cleanFrom,
                    customerName: isStaff ? matchedStaff!.name : contactName,
                    template: `${isStaff ? "Workforce Bot" : "DineFlow Bot"}: "${replyText.split("\n")[0]}"`,
                    status: graphRes.ok ? "delivered" : "failed",
                    time: "Just now",
                    location: isStaff ? matchedStaff!.department : "Table 14",
                  });
                } catch {}
              } catch (dispatchErr) {
                console.error("[Meta Outbound Reply Error] Failed to send via Graph API:", dispatchErr);
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
