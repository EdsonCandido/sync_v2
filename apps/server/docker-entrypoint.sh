#!/bin/sh
set -e

if [ "$SEED_ON_START" = "true" ]; then
  echo "Entrypoint: rodando seed bootstrap…"
  cd /app && npm run db:seed -w server
fi

cd /app/apps/server
exec node dist/index.mjs
