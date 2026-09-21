#!/usr/bin/env bash
# deploy.sh — Zero-downtime health-gated deploy for DineFlow.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "── 1. Ensuring environment configuration..."
if [ ! -f .env ]; then
  ./deploy/gen-secrets.sh
fi

# Read configured ports safely
BE_PORT=$(grep -E '^BACKEND_PORT=' .env 2>/dev/null | cut -d= -f2 | tr -d '"'"' \r' || true)
FE_PORT=$(grep -E '^FRONTEND_PORT=' .env 2>/dev/null | cut -d= -f2 | tr -d '"'"' \r' || true)
BE_PORT=${BE_PORT:-8500}
FE_PORT=${FE_PORT:-3500}

echo "── 2. Verifying repository revision..."
git log -1 --oneline

echo "── 3. Building and starting stack..."
docker compose -f docker-compose.prod.yml --env-file .env up -d --build

set +e
api_healthy=0
for i in $(seq 1 40); do
  code="000"
  if command -v curl >/dev/null 2>&1; then
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "http://127.0.0.1:${BE_PORT}/health" 2>/dev/null || echo "000")
  elif command -v wget >/dev/null 2>&1; then
    code=$(wget --spider -S "http://127.0.0.1:${BE_PORT}/health" 2>&1 | awk '/HTTP\// {print $2}' | tail -1 || echo "000")
  fi
  case "$code" in
    2*|3*)
      api_healthy=1
      echo "✔ API healthy on port ${BE_PORT} (attempt ${i}, HTTP ${code})"
      break
      ;;
    *)
      echo "  [${i}/40] API probe returned HTTP ${code}, retrying in 3s..."
      ;;
  esac
  sleep 3
done
set -e

if [ "$api_healthy" -ne 1 ]; then
  echo "✖ API health gate FAILED on http://127.0.0.1:${BE_PORT}/health"
  docker compose -f docker-compose.prod.yml logs --tail=100 api || true
  docker compose -f docker-compose.prod.yml ps || true
  exit 1
fi

set +e
web_healthy=0
for i in $(seq 1 40); do
  code="000"
  if command -v curl >/dev/null 2>&1; then
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "http://127.0.0.1:${FE_PORT}" 2>/dev/null || echo "000")
  elif command -v wget >/dev/null 2>&1; then
    code=$(wget --spider -S "http://127.0.0.1:${FE_PORT}" 2>&1 | awk '/HTTP\// {print $2}' | tail -1 || echo "000")
  fi
  case "$code" in
    2*|3*)
      web_healthy=1
      echo "✔ Frontend healthy on port ${FE_PORT} (attempt ${i}, HTTP ${code})"
      break
      ;;
    *)
      echo "  [${i}/40] Frontend probe returned HTTP ${code}, retrying in 3s..."
      ;;
  esac
  sleep 3
done
set -e

if [ "$web_healthy" -ne 1 ]; then
  echo "✖ Frontend health gate FAILED on http://127.0.0.1:${FE_PORT}"
  docker compose -f docker-compose.prod.yml logs --tail=100 web || true
  docker compose -f docker-compose.prod.yml ps || true
  exit 1
fi

echo "── 5. Cleaning dangling images..."
docker image prune -f >/dev/null 2>&1 || true

echo "── 6. Status of DineFlow services:"
docker compose -f docker-compose.prod.yml ps

echo "✔ DineFlow deployment complete successfully!"
