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

echo "==> Despliegue completado: $(git rev-parse --short HEAD)"
