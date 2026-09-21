#!/usr/bin/env bash
# deploy.sh — Zero-downtime health-gated deploy for DineFlow.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "── 1. Ensuring environment configuration..."
if [ ! -f .env ]; then
  ./deploy/gen-secrets.sh
fi

# Read configured ports safely
BE_PORT=$(grep -E '^BACKEND_PORT=' .env 2>/dev/null | tr -cd '0-9' || true)
FE_PORT=$(grep -E '^FRONTEND_PORT=' .env 2>/dev/null | tr -cd '0-9' || true)
BE_PORT=${BE_PORT:-8500}
FE_PORT=${FE_PORT:-3500}

# Detect Docker Compose command safely
if docker compose version >/dev/null 2>&1; then
  DC="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  DC="docker-compose"
elif sudo -n docker compose version >/dev/null 2>&1; then
  DC="sudo -n docker compose"
elif sudo -n docker-compose version >/dev/null 2>&1; then
  DC="sudo -n docker-compose"
else
  DC="docker compose"
fi

echo "── 2. Verifying repository revision & environment..."
git log -1 --oneline
echo "Compose command: $DC"
echo "Target ports: BE_PORT=${BE_PORT}, FE_PORT=${FE_PORT}"

echo "── 3. Building and starting stack..."
$DC -f docker-compose.prod.yml up -d --build

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
  echo "── API container logs:"
  $DC -f docker-compose.prod.yml logs --tail=100 api || true
  echo "── MongoDB container logs:"
  $DC -f docker-compose.prod.yml logs --tail=50 mongo || true
  echo "── Redis container logs:"
  $DC -f docker-compose.prod.yml logs --tail=50 redis || true
  echo "── Container status:"
  $DC -f docker-compose.prod.yml ps || true
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
  echo "── Web container logs:"
  $DC -f docker-compose.prod.yml logs --tail=100 web || true
  echo "── Container status:"
  $DC -f docker-compose.prod.yml ps || true
  exit 1
fi

echo "── 5. Cleaning dangling images..."
docker image prune -f >/dev/null 2>&1 || true

echo "── 6. Status of DineFlow services:"
$DC -f docker-compose.prod.yml ps

echo "✔ DineFlow deployment complete successfully!"
