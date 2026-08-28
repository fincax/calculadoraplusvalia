# Guía de despliegue — FINCAX en Clouding.io

Flujo completo: desarrollas en tu PC (PowerShell) → subes a GitHub → al
fusionar en `main`, GitHub Actions prueba, compila y despliega solo en el
VPS de Clouding.io. Esta guía se ejecuta **una sola vez**; después todo es
automático.

## 0. Requisitos

- Un servidor en Clouding.io con **Ubuntu 22.04 o 24.04** (2 GB RAM es
  suficiente). Apunta su IP pública.
- Un dominio (p. ej. `fincax.es`) con un registro **A** apuntando a esa IP
  (y otro para `www` si lo quieres).
- En el panel de Clouding.io, en el firewall del servidor, abre solo los
  puertos **22 (SSH), 80 (HTTP) y 443 (HTTPS)**.

## 1. Conectarte al servidor desde PowerShell

Windows 10/11 trae cliente SSH integrado:

```powershell
ssh root@IP_DEL_SERVIDOR
```

(Clouding.io te da la contraseña o clave al crear el servidor.)

## 2. Instalar Node 20, PM2, Nginx y Git (en el servidor)

```bash
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs nginx git
npm install -g pm2
node -v   # debe mostrar v20.x
```

## 3. Dar acceso al servidor al repositorio (deploy key)

En el servidor, genera una clave SSH de solo lectura para GitHub:

```bash
ssh-keygen -t ed25519 -C "deploy-fincax" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
```

Copia esa línea `ssh-ed25519 …` y en GitHub:
**repo → Settings → Deploy keys → Add deploy key** → pégala (sin marcar
«Allow write access»).

## 4. Clonar la aplicación y configurarla

```bash
mkdir -p /opt/fincax
git clone git@github.com:fincax/calculadoraplusvalia.git /opt/fincax/app
cd /opt/fincax/app

# Variables de entorno de producción
cp .env.example .env
nano .env
#   NEXT_PUBLIC_SITE_URL=https://fincax.es
#   NEXT_PUBLIC_WHATSAPP_NUMBER=34XXXXXXXXX   (opcional)
#   LEAD_WEBHOOK_URL=                          (opcional)

npm ci
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # ejecuta el comando que te imprima, para arrancar tras reinicios
```

Comprueba que responde: `curl -I http://localhost:3000` → `200 OK`.

## 5. Nginx + SSL

```bash
cp /opt/fincax/app/deploy/nginx.conf.example /etc/nginx/sites-available/fincax
nano /etc/nginx/sites-available/fincax    # ajusta server_name a tu dominio
ln -s /etc/nginx/sites-available/fincax /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Certificado SSL gratuito (renueva solo)
apt install -y certbot python3-certbot-nginx
certbot --nginx -d fincax.es -d www.fincax.es
```

Tu web ya está en `https://tudominio` ✅

## 6. Despliegue automático desde GitHub Actions

El workflow `.github/workflows/deploy.yml` entra por SSH y ejecuta
`scripts/deploy.sh` en cada push a `main`. Necesita una clave SSH **de
GitHub hacia el servidor**:

En el servidor:

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/gh_actions -N ""
cat ~/.ssh/gh_actions.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/gh_actions        # ⚠️ clave PRIVADA: cópiala entera
```

En GitHub: **repo → Settings → Secrets and variables → Actions → New
repository secret**, crea:

| Secret | Valor |
|---|---|
| `SSH_HOST` | IP del servidor |
| `SSH_USER` | `root` (o el usuario que uses) |
| `SSH_KEY`  | el contenido completo de `~/.ssh/gh_actions` (la privada) |
| `SSH_PORT` | solo si no usas el 22 |

Prueba el circuito: en GitHub → pestaña **Actions** → «Desplegar en
producción» → **Run workflow**. Si termina en verde, cada merge a `main`
desplegará solo a partir de ahora.

## 7. Día a día desde tu PC (PowerShell)

```powershell
git clone https://github.com/fincax/calculadoraplusvalia.git
cd calculadoraplusvalia
npm install
npm run dev                 # desarrollo en http://localhost:3000

# Proponer un cambio:
git checkout -b mi-cambio
# …editas…
git add . ; git commit -m "Descripción del cambio"
git push -u origin mi-cambio
# → abre el Pull Request en GitHub; al fusionarlo en main, se despliega solo.
```

## Operación y diagnóstico en el servidor

```bash
pm2 status                # estado de la app
pm2 logs fincax-web       # logs en vivo (aquí aparecen los leads si no hay webhook)
pm2 restart fincax-web    # reinicio manual
/opt/fincax/app/scripts/deploy.sh   # despliegue manual
```

## Integración en fincax.es (sección «Herramientas profesionales»)

Esta aplicación está pensada como **una herramienta más** de la sección
«Herramientas profesionales · Servicios que te ayudan a decidir» de
fincax.es (junto a la valoración con IA, la calculadora hipotecaria y el
comparador). Su raíz `/` redirige a `/calculadora-plusvalia` y su cabecera
enlaza de vuelta a fincax.es. Dos formas de publicarla bajo tu dominio:

### Opción A — Subdominio (la más simple)

1. Crea un registro **A**: `calculadora.fincax.es → IP del VPS`.
2. En `deploy/nginx.conf.example`, usa `server_name calculadora.fincax.es;`.
3. `certbot --nginx -d calculadora.fincax.es`.
4. `.env`: `NEXT_PUBLIC_SITE_URL=https://calculadora.fincax.es`.
5. En la web principal, añade la tarjeta de la herramienta enlazando a
   `https://calculadora.fincax.es`.

### Opción B — Misma URL que la web principal (`fincax.es/calculadora-plusvalia`)

Solo si la web principal de fincax.es se sirve desde el **mismo Nginx** (o
puedes tocar su configuración). En el `server {}` del dominio principal,
añade un proxy de esa ruta hacia esta app:

```nginx
location /calculadora-plusvalia {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
}
location /_next/ {          # estáticos de la app Next.js
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
}
location /api/lead {        # API de leads de la calculadora
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
}
```

> Ojo: si la web principal también usa Next.js, el `location /_next/`
> entraría en conflicto; en ese caso usa la Opción A (subdominio).

### Texto sugerido para la tarjeta de la herramienta

> **Calculadora de Plusvalía Municipal**
> Calcula cuánto pagarías de plusvalía al vender, heredar o recibir un
> inmueble en Sevilla y provincia. Compara el método objetivo y el real
> con la normativa vigente y detecta si no tienes que pagar.

## Recomendado en GitHub (una vez creada `main`)

1. **Settings → General → Default branch** → cambiar a `main`.
2. **Settings → Branches → Add branch protection rule** para `main`:
   marca «Require a pull request before merging» y «Require status checks»
   (elige el check *CI (tests y build)*).
