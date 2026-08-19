#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

git pull

VITE_APP_VERSION="$(git rev-parse --short HEAD)"
export VITE_APP_VERSION
echo "versão ${VITE_APP_VERSION}"

docker compose up -d --build
docker compose exec -T server sh -c 'cd /app/packages/db && npm run db:push'
