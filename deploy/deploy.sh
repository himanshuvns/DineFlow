#!/usr/bin/env bash
# deploy.sh — Zero-downtime health-gated deploy for DineFlow.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "── 1. Ensuring environment configuration..."
if [ ! -f .env ]; then
  ./deploy/gen-secrets.sh
fi

# Read configured ports safely
BE_PORT=$(grep -E '^BACKEND_PORT=' .env 2>/dev/null | cut -d= -f2 | tr -d '"'"' \r' || echo 8500)
FE_PORT=$(grep -E '^FRONTEND_PORT=' .env 2>/dev/null | cut -d= -f2 | tr -d '"'"' \r' || echo 3500)
BE_PORT=${BE_PORT:-8500}
FE_PORT=${FE_PORT:-3500}

echo "── 2. Updating repository from origin/main..."
git fetch origin main
git reset --hard origin/main

echo "── 3. Building and starting stack..."
docker compose -f docker-compose.prod.yml --env-file .env up -d --build

echo "── 4. Health Gate Verification..."
echo "Waiting for API (port ${BE_PORT}) and Frontend (port ${FE_PORT})..."

probe() {
  local url="$1"
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$url" || echo "000")
  case "$code" in
    2*|3*) return 0 ;;
    *) return 1 ;;
  esac
}

api_healthy=0
for i in $(seq 1 35); do
  if probe "http://127.0.0.1:${BE_PORT}/health"; then
    api_healthy=1
    echo "✔ API healthy on port ${BE_PORT} (attempt ${i})"
    break
  fi
  sleep 3
done

if [ "$api_healthy" -ne 1 ]; then
  echo "✖ API health gate FAILED on http://127.0.0.1:${BE_PORT}/health"
  docker compose -f docker-compose.prod.yml logs --tail=40 api
  exit 1
fi

web_healthy=0
for i in $(seq 1 35); do
  if probe "http://127.0.0.1:${FE_PORT}"; then
    web_healthy=1
    echo "✔ Frontend healthy on port ${FE_PORT} (attempt ${i})"
    break
  fi
  sleep 3
done

if [ "$web_healthy" -ne 1 ]; then
  echo "✖ Frontend health gate FAILED on http://127.0.0.1:${FE_PORT}"
  docker compose -f docker-compose.prod.yml logs --tail=40 web
  exit 1
fi

echo "── 5. Cleaning dangling images..."
docker image prune -f >/dev/null 2>&1 || true

echo "── 6. Status of DineFlow services:"
docker compose -f docker-compose.prod.yml ps

echo "✔ DineFlow deployment complete successfully!"
