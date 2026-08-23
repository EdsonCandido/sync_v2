#!/usr/bin/env sh
# Roda CLI do server: prefer dist (prod/Docker); fallback tsx (dev local).
set -e
name="$1"
if [ -z "$name" ]; then
	echo "Uso: run-cli.sh <seed|backfillFinanceiroDefaults|grantAllCompanyModules>" >&2
	exit 1
fi

root="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
dist="$root/dist/${name}.mjs"
src="$root/src/${name}.ts"

if [ -f "$dist" ]; then
	exec node "$dist"
fi

if command -v tsx >/dev/null 2>&1; then
	exec tsx "$src"
fi

if [ -x "$root/../../node_modules/.bin/tsx" ]; then
	exec "$root/../../node_modules/.bin/tsx" "$src"
fi

if [ -x "$root/node_modules/.bin/tsx" ]; then
	exec "$root/node_modules/.bin/tsx" "$src"
fi

echo "CLI '$name': nem dist/${name}.mjs nem tsx encontrados. Rode 'npm run build -w server' no container/imagem." >&2
exit 127
