#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cleanup() {
  echo "\nShutting down development services..."
  pkill -P $$ || true
}

trap cleanup EXIT INT TERM

echo "Starting backend (wrangler dev)..."
(cd "$ROOT_DIR/backend" && npm run dev) &
BACKEND_PID=$!

echo "Starting frontend (npm run dev)..."
(cd "$ROOT_DIR/frontend" && npm run dev) &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Both services are running. Press Ctrl+C to stop."

wait
