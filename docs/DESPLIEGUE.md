# Guía de despliegue — FINCAX en Clouding.io

Flujo completo: desarrollas en tu PC (PowerShell) → subes a GitHub → al
fusionar en `main`, GitHub Actions prueba, compila y despliega solo en el
VPS de Clouding.io. Esta guía se ejecuta **una sola vez**; después todo es
automático.

## 0. Requisitos

- Un servidor en Clouding.io con **Ubuntu 24.04 o 26.04** (mínimo 2 GB de
  RAM: compilar consume ~1,1 GB; en producción: 2 vCores / 4 GB / 30 GB).
  Apunta su IP pública.
- El dominio **`calculadoraplusvalia.com`** (contratado en IONOS) apuntando
  a esa IP. En IONOS → Dominios → `calculadoraplusvalia.com` → **DNS**:
  - registro **A** con host `@` → IP del VPS;
  - registro **A** con host `www` → IP del VPS (o CNAME `www` → `@`);
  - **borra** los registros **AAAA** que IONOS crea por defecto (apuntan a su
    página de aparcamiento por IPv6 y harían fallar el certificado SSL), y
    cualquier otro **A** de `@`/`www` que no sea el del VPS.
  - Comprobar desde PowerShell: `nslookup calculadoraplusvalia.com` debe
    devolver la IP del VPS.
- En el panel de Clouding.io, en el firewall del servidor, abre solo los
  puertos **22 (SSH), 80 (HTTP) y 443 (HTTPS)**.

## 1. Conectarte al servidor desde PowerShell

Windows 10/11 trae cliente SSH integrado:

```powershell
ssh root@IP_DEL_SERVIDOR
```

(Clouding.io te da la contraseña o clave al crear el servidor.)

## 2. Instalar Node 22, PM2, Nginx y Git (en el servidor)

```bash
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs nginx git
npm install -g pm2
node -v   # debe mostrar v22.x
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
#   NEXT_PUBLIC_SITE_URL=https://calculadoraplusvalia.com
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
cp /opt/fincax/app/deploy/nginx.conf.example /etc/nginx/sites-available/calculadoraplusvalia
ln -s /etc/nginx/sites-available/calculadoraplusvalia /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default    # servidor nuevo y dedicado: sobra
nginx -t && systemctl reload nginx

# Certificado SSL gratuito (renueva solo)
apt install -y certbot python3-certbot-nginx
certbot --nginx -d calculadoraplusvalia.com -d www.calculadoraplusvalia.com
```

La calculadora ya está en `https://calculadoraplusvalia.com` ✅
(`www.` redirige al dominio sin `www`, y la raíz a `/calculadora-plusvalia`).

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
node --env-file=.env scripts/test-smtp.mjs   # prueba el email de los leads
/opt/fincax/app/scripts/deploy.sh   # despliegue manual
```

## Integración en fincax.es (sección «Herramientas profesionales»)

La calculadora vive en su **dominio propio, `calculadoraplusvalia.com`**, en
este VPS (independiente de la web Laravel de fincax.es). Su cabecera enlaza
de vuelta a fincax.es, y fincax.es la muestra dentro de una de sus páginas
mediante el embebido (`embed.js`): pasos en `docs/EMBEBER.md` y vista Blade
lista en `docs/laravel/`. No hace falta tocar el servidor de la web Laravel.

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
