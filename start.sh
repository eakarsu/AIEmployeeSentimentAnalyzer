#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")"&&pwd)";cd "$root";[ -f .env ]||{ echo "Missing .env; copy .env.example." >&2;exit 1;};[ -d backend/node_modules ]&&[ -d frontend/node_modules ]||{ echo "Run scripts/bootstrap.sh first." >&2;exit 1;}
set -a;. "$root/.env";set +a
backend_port="${BACKEND_PORT:-3001}";frontend_port="${FRONTEND_PORT:-5173}"
for port in "$backend_port" "$frontend_port";do ! lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1||{ echo "Port $port is already in use." >&2;exit 1;};done
if [[ "${MIGRATE_ON_START:-false}" == "true" ]];then
  [[ "${ALLOW_SCHEMA_MIGRATION:-}" == "1"||"${ALLOW_SCHEMA_MIGRATION:-}" == "true" ]]||{ echo "MIGRATE_ON_START requires ALLOW_SCHEMA_MIGRATION=1." >&2;exit 1;}
  bash "$root/scripts/migrate.sh";(cd "$root/backend"&&npm run create-admin)
fi
backend_pid='';frontend_pid='';cleanup(){ [ -z "$backend_pid" ]||kill "$backend_pid" 2>/dev/null||true;[ -z "$frontend_pid" ]||kill "$frontend_pid" 2>/dev/null||true;};trap cleanup EXIT INT TERM
(cd backend&&npm start)&backend_pid=$!;(cd frontend&&./node_modules/.bin/vite --host 127.0.0.1 --port "$frontend_port")&frontend_pid=$!;wait "$backend_pid" "$frontend_pid"
