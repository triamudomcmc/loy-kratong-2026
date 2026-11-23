#!/bin/sh
set -e

# Apply pending Prisma migrations before the server starts (set SKIP_MIGRATIONS=1 to opt out).
if [ -z "$SKIP_MIGRATIONS" ]; then
  if [ -z "$DATABASE_URL" ]; then
    echo "DATABASE_URL is not set; skipping prisma migrate deploy" >&2
  else
    echo "Running prisma migrate deploy..."
    (cd /migrate && node node_modules/prisma/build/index.js migrate deploy)
  fi
fi

exec "$@"
