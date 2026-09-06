#!/usr/bin/env bash
#
# Script de despliegue que se ejecuta EN EL SERVIDOR (Clouding.io).
# Lo invoca GitHub Actions por SSH tras cada push a main, y también
# puede lanzarse a mano: /opt/fincax/app/scripts/deploy.sh
#
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/fincax/app}"
BRANCH="${BRANCH:-main}"

echo "==> Desplegando FINCAX desde origin/${BRANCH} en ${APP_DIR}"
cd "$APP_DIR"

git fetch origin "$BRANCH"
git reset --hard "origin/${BRANCH}"

echo "==> Instalando dependencias"
npm ci

echo "==> Compilando"
npm run build

echo "==> Recargando la aplicación con PM2"
pm2 startOrReload ecosystem.config.js
pm2 save

echo "==> Verificando que la aplicación responde (/api/health)"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/api/health}"
ok=""
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS --max-time 5 "$HEALTH_URL" >/dev/null 2>&1; then
    ok="yes"
    break
  fi
  echo "    intento $i: aún no responde, reintentando en 2s…"
  sleep 2
done
if [ -z "$ok" ]; then
  echo "!! La aplicación no respondió en $HEALTH_URL tras el despliegue." >&2
  pm2 logs fincax-web --lines 30 --nostream || true
  exit 1
fi

echo "==> Despliegue completado y verificado: $(git rev-parse --short HEAD)"
