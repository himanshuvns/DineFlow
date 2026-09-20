# DineFlow — OpenWA Local Development & Testing Guide

This guide details how to run, test, and develop with the **OpenWA WhatsApp Gateway** in your local DineFlow environment (MacBook Apple Silicon M-series & x86).

---

## 🏗️ Architecture Summary

DineFlow uses a clean, modular provider abstraction (`messaging.WhatsAppProvider`):

```
┌────────────────────────────────────────────────────────┐
│                   DineFlow Backend                     │
│   • Customer Orders (Confirmed / Ready / Cancelled)    │
│   • Admin Alerts (New Order / Large Order / Cancel)    │
│   • Inbound WhatsApp Commands (Hi / Menu / Status)     │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
          WhatsAppProvider (Go Interface)
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│OpenWAProvider│    │MetaCloudProv.│    │ MockProvider │
│ (Local Dev)  │    │ (Production) │    │  (Unit Test) │
│  Port :2785  │    │ Graph API 21 │    │  Zero Docker │
└──────────────┘    └──────────────┘    └──────────────┘
```

- **Local Dev**: OpenWA runs via `docker-compose.openwa.yml` on port `2785`, automating WhatsApp Web through headless Chromium (`whatsapp-web.js`).
- **Production**: Switching to Meta's Official WhatsApp Cloud API requires only setting `WHATSAPP_PROVIDER=meta` in your `.env` file — zero business logic changes required.

---

## 🚀 Quick Start (Local Setup)

### Step 1: Start Primary Databases (MongoDB & Redis)
In your workspace terminal:
```bash
docker compose up -d
```
*Runs MongoDB (`27017`) and Redis (`6379`).*

### Step 2: Start OpenWA Gateway Container
In a separate terminal (or detached):
```bash
docker compose -f docker-compose.openwa.yml up -d
```
*Spawns the `dineflow-openwa` container (`rmyndharis/openwa:latest`) on port `2785` with persistent volume `dineflow_openwa_data`.*

Verify OpenWA is running:
- **Web Dashboard**: [http://localhost:2785](http://localhost:2785)
- **API Swagger Docs**: [http://localhost:2785/api/docs](http://localhost:2785/api/docs)
- **Container Logs**:
  ```bash
  docker logs -f dineflow-openwa
  ```

### Step 3: Start Go Backend API
From `apps/api`:
```bash
cd apps/api
go run cmd/server/main.go
```
*API starts on `http://localhost:8080`. You will see:*
`Initialized OpenWA WhatsApp Provider (Local Dev Gateway)`

### Step 4: Start Next.js Frontend
From the workspace root:
```bash
pnpm --filter web run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 📱 Linking WhatsApp (QR Scan Flow)

1. Open your browser and navigate to the DineFlow Dashboard:
   👉 **http://localhost:3000/dashboard/whatsapp**
2. Click the **OpenWA Gateway** tab.
3. Click **"Generate Pairing QR Code"** or **"Start Session"**.
4. A pairing QR code will render on screen (auto-refreshing every 3 seconds).
5. On your phone:
   - Open **WhatsApp**.
   - Tap **Settings (⚙️)** (iOS) or **Menu (⋮)** (Android) > **Linked Devices**.
   - Tap **Link a Device** and scan the QR code displayed on the screen.
6. Once paired, the status pill immediately switches to **"Connected & Live"** without reloading the page.

---

## 🧪 Comprehensive Testing Scenarios

### 1. Send Live Test Message
1. In the **OpenWA Gateway** tab, go to the **Send Live Gateway Test** panel on the right.
2. Enter your personal phone number (e.g. `+91 98000 12345`) and guest name.
3. Click **"Send Test via OpenWA"**.
4. Check WhatsApp on your phone — the confirmation message should arrive in seconds.

### 2. Inbound WhatsApp Commands
From your phone, send a message to the linked WhatsApp number:

| What you send | What DineFlow replies |
| :--- | :--- |
| `Hi` or `Hello` | Welcome greeting with menu of quick options |
| `Menu` | Direct link to restaurant's contactless digital menu |
| `Order Status` | Queries MongoDB for your active order & returns live tracker link |
| `Help` | Confirmation that floor staff/steward has been alerted |

### 3. Customer Order Notifications (Automated Triggers)
1. Navigate to the customer QR menu in your browser:
   👉 `http://localhost:3000/m/the-grand-bistro/table-14`
2. Add dishes to cart and enter your WhatsApp phone number during checkout.
3. Submit the order.
4. **Trigger 1 (Order Confirmed)**: You will receive:
   > *"Hi [Name], your order #ORD-XXXX has been confirmed. Estimated preparation time: 15 minutes. 📍 Live Tracker: ..."*
5. Open the Kitchen Display System (KDS) or Live Orders:
   👉 `http://localhost:3000/dashboard/orders`
6. Click **Ready** or **Served** on the order:
   - **Trigger 2 (Order Ready)**:
     > *"🔔 Chef's update: Your order #ORD-XXXX is ready for pickup at Table 14! Bon appétit."*
7. If an order is rejected or cancelled:
   - **Trigger 3 (Order Cancelled)**:
     > *"❌ Hi [Name], your order #ORD-XXXX has been cancelled."*

### 4. Admin Alerts (Staff & Owner Notifications)
Configure your admin phone numbers in `apps/api/.env`:
```env
WHATSAPP_ADMIN_NUMBERS=+919800012345
WHATSAPP_LARGE_ORDER_THRESHOLD=1500
```
- When any customer places an order, admins receive:
  > *"🔔 New Order Received — Table: 14 • Order: #ORD-XXXX • Amount: ₹640 • Items: 2"*
- When an order exceeds ₹1,500:
  > *"⚠️ Large Order Alert — Table: 14 • Amount: ₹2,400 (Threshold: ₹1,500)"*
- When an order is cancelled:
  > *"❌ Order Cancelled Alert — Table: 14 • Order: #ORD-XXXX • Amount: ₹640"*

### 5. Webhook Signature Verification (HMAC)
OpenWA signs every outbound webhook with HMAC-SHA256:
- Header: `X-OpenWA-Signature: sha256=<hash>`
- Key: `OPENWA_WEBHOOK_SECRET=dineflow_openwa_webhook_secret`
- If an unauthorized request is sent without or with an invalid signature, the backend rejects it with `403 Forbidden`.

---

## 🔒 Security & Safe-Sending Guardrails

1. **Development Only**: OpenWA is designed for local development and testing. Never expose port `2785` publicly to the internet.
2. **Dedicated Number**: Always use a secondary / test phone number for local gateway automation, never your primary personal account.
3. **No Secrets in Git**: All tokens (`OPENWA_API_KEY`, `OPENWA_WEBHOOK_SECRET`) are loaded from environment variables.
4. **Rate Limiting**: Sliding-window rate limiters are active on all public `/api/v1/*` endpoints.

---

## 🚢 Future Production Migration (Meta Cloud API)

When moving to production:
1. Obtain official Meta WhatsApp Business credentials from [developers.facebook.com](https://developers.facebook.com).
2. Update environment variables in production (Vercel / Railway):
   ```env
   WHATSAPP_PROVIDER=meta
   WHATSAPP_PHONE_NUMBER_ID=<your_phone_id>
   WHATSAPP_ACCESS_TOKEN=<your_system_user_token>
   WHATSAPP_WEBHOOK_VERIFY_TOKEN=<your_verify_token>
   WHATSAPP_BUSINESS_ACCOUNT_ID=<your_waba_id>
   ```
3. Stop the OpenWA container. DineFlow automatically routes all order notifications, admin alerts, and webhooks through Meta Graph API v21.0 without a single code change.
