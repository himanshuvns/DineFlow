#!/usr/bin/env bash
# gen-secrets.sh — one-time random secret generation for DineFlow deployment.
set -euo pipefail

cd "$(dirname "$0")/.."

DOMAIN="${1:-dine.rovixatech.com}"

if [ -f .env ]; then
  echo "✔ .env already exists — preserving existing secrets."
  exit 0
fi

command -v openssl >/dev/null || { echo "✖ openssl required but not found"; exit 1; }

gen_hex() { openssl rand -hex "$1"; }

JWT_ACCESS_SECRET="$(gen_hex 32)"
JWT_REFRESH_SECRET="$(gen_hex 32)"
SUPER_ADMIN_SECRET="$(gen_hex 24)"

cat << ENV_FILE > .env
# DineFlow Production Environment Configuration
APP_ENV=production
NODE_ENV=production

# Server Ports
FRONTEND_PORT=3500
BACKEND_PORT=8500

# Public URLs
NEXT_PUBLIC_APP_NAME=DineFlow
NEXT_PUBLIC_APP_URL=https://${DOMAIN}
NEXT_PUBLIC_API_URL=https://${DOMAIN}/api/v1
NEXT_PUBLIC_WS_URL=wss://${DOMAIN}
NEXT_PUBLIC_ORDERING_URL=https://${DOMAIN}/order
INTERNAL_API_URL=http://api:8080/api/v1
ALLOWED_ORIGINS=https://${DOMAIN},http://localhost:3000

# Auth Secrets (Generated)
JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_ACCESS_TTL_MINUTES=15
JWT_REFRESH_TTL_DAYS=7
SUPER_ADMIN_SECRET=${SUPER_ADMIN_SECRET}

# Database & Cache (Docker internal)
MONGODB_URI=mongodb://dineflow-mongo:27017/dineflow
MONGODB_DATABASE=dineflow
REDIS_URL=redis://dineflow-redis:6379

# Email & Notifications (Optional)
RESEND_API_KEY=
EMAIL_FROM=noreply@${DOMAIN}
EMAIL_FROM_NAME=DineFlow

# AI
GEMINI_API_KEY=${GEMINI_API_KEY:-}

# WhatsApp Cloud API (Meta)
WHATSAPP_PROVIDER=meta
WHATSAPP_PHONE_NUMBER_ID=1382709818253532
WHATSAPP_BUSINESS_ACCOUNT_ID=1065968646215350
WHATSAPP_WEBHOOK_VERIFY_TOKEN=dineflow_webhook_verify_secret
WHATSAPP_ACCESS_TOKEN=EAAT0C5k0pNoBSoxLeSngBEIhGDmBXkJZBKBcgjmZAOOTIyUUqbkDm1tRzjCgvlvCZARc76EBUvCCRRGlxf3hMQpKoXFRxdfUTD0vt4H69ML2L6ZAtMHZC6Jxd0lUiz9o3Q1WgoP9x1ZBWL4Cd5rDRWXpHZAXwI1tT5ipSvFUgCKGiv0zC0M3DxwR4tpaJQPDS2mFJ5ZBVrzeOVnZAKG0Bi6ycKuwKX2gRxIR7HYL7B3wUyQeW8CT678ZA8tZBSHlpdZCjdUuSbVEZCYiAmXlvZAF2YpNt4TlLz
ENV_FILE

chmod 600 .env
echo "✔ Generated fresh discrete secrets in .env for ${DOMAIN}"
