#!/usr/bin/env bash
set -euo pipefail
[ "${CONFIRM_DEMO_SEED:-}" = yes ]||{ echo "Set CONFIRM_DEMO_SEED=yes." >&2;exit 1;};[ "${NODE_ENV:-development}" != production ]||{ echo "Disabled in production." >&2;exit 1;};root="$(cd "$(dirname "$0")/.."&&pwd)";psql "${DATABASE_URL:?DATABASE_URL required}" -v ON_ERROR_STOP=1 -f "$root/backend/db/seed.sql"
