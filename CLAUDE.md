# CLAUDE.md — Memoria del proyecto FINCAX Plusvalía

Contexto persistente para sesiones de Claude Code. Última actualización: 2026-08-28.

## Qué es esto

Calculadora de Plusvalía Municipal (IIVTNU) para Sevilla y provincia, de
**FINCAX** (agencia inmobiliaria de Sevilla, Ronda de Triana 14E, fundada
2024; contacto: fincaxsevilla@gmail.com). Es una herramienta de la sección
**«Herramientas Profesionales · Servicios que te ayudan a decidir»** de
[fincax.es](https://fincax.es), junto a la valoración con IA, la calculadora
hipotecaria y el comparador. Objetivo de negocio: captar leads de alta
intención; objetivo SEO: primera página de Google para «calcular plusvalía
municipal en Sevilla».

## Stack y comandos

Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 + Vitest. Sin base de
datos. Este repo empezó VACÍO: todo se construyó aquí desde cero.

```bash
npm run dev / build / start
npm test                      # 43 tests unitarios del motor
node scripts/smoke-e2e.mjs    # E2E en Chromium (requiere servidor en :3000;
                              # ejecutable en /opt/pw-browsers/chromium)
```

## Arquitectura (regla de oro: motor desacoplado de la UI)

- `src/lib/plusvalia/` — motor fiscal **puro** (sin React/Next):
  - `types.ts` modelo de dominio (`MunicipalityTaxRules` versionable por
    `validFrom`/`validTo`, `BonusRule` con tramos por valor catastral del
    suelo, etc.).
  - `coefficients.ts` tablas estatales por fecha de devengo + prorrateo.
  - `engine.ts` cálculo (objetivo vs real, no sujeción, bonificaciones).
  - `realRights.ts` usufructos y nuda propiedad; `deadlines.ts` plazos y
    recargos LGT; `data/municipalities.ts` datos por municipio.
- `src/app/calculadora-plusvalia/page.tsx` — página principal (Sevilla).
- `src/app/calculadora-plusvalia/[municipio]/page.tsx` — 105 páginas SSG
  por municipio de la provincia (SEO local). Sevilla capital NO tiene
  página propia: vive en la principal para no canibalizar la consulta.
- `src/app/api/lead/route.ts` — leads (rate-limit; reenvía a
  `LEAD_WEBHOOK_URL` si existe, si no los deja en el log).
- Extender a nuevos municipios/años = añadir registros de datos. NUNCA
  acoplar lógica fiscal a componentes.

## Datos fiscales: qué está verificado y cómo

Ver `docs/VERIFICACION_DATOS.md` (estado por municipio y proceso de 5 pasos
para verificar uno). Resumen:

- **Estatal (BOE cotejado, PDF aportado por el usuario)**: tablas de
  coeficientes RD-ley 26/2021 (devengos 10/11/2021–2022), Ley 31/2022
  (2023) y RD-ley 8/2023 (2024→vigente; el RD-ley 16/2025 para 2026 fue
  DEROGADO por el Congreso el 27/01/2026, así que la tabla de 2024 sigue en
  2026). **Periodos <1 año: el coeficiente anual se prorratea por meses
  completos** (art. 107.4 párr. 3.º — esto fue un bug corregido; no fiarse
  de resúmenes, siempre fuente primaria). Devengos anteriores al
  10/11/2021 se rechazan (STC 182/2021).
- **Sevilla capital (ordenanza íntegra cotejada, PDF aportado; aprobada
  02/11/2023, definitiva 22/12/2023)**: tipo 26,53 %; coeficientes máximos
  estatales; bonificaciones mortis causa a cónyuge/descendientes/
  ascendientes con caudal ≤500.000 €: vivienda habitual 95/50/30 % por
  tramos de VCS (≤10.000 / ≤20.000 / ≤50.000 €, VCS de TODA la vivienda) y
  10 % otros inmuebles (excluyentes entre sí; ambas computadas); 40 %
  locales afectos y 80 % interés social solo se informan. Autoliquidación
  (Agencia Tributaria de Sevilla).
- **Resto de la provincia (104 municipios)**: `verified: false` →
  estimación por MÁXIMOS legales (tipo 30 % + coeficientes estatales),
  comunicado en la UI como cota superior. NO inventar tipos municipales:
  o fuente primaria o máximos. Datos pre-reforma (p. ej. Dos Hermanas
  25,16 % de 2016) NO sirven.

## Entorno remoto: limitación de red importante

El proxy de egreso BLOQUEA los dominios municipales, el BOE y los
agregadores fiscales (solo funciona WebSearch, y npm/GitHub). Para verificar
ordenanzas, **pedir al usuario que suba el PDF** (ya lo hizo dos veces con
éxito). `pdftotext`/`pdftoppm` disponibles vía `apt install poppler-utils`.

## Identidad visual (manual de marca fincax.cdr 2024, colores muestreados)

- Negro `#231f20`, **rojo FINCAX `#ee2629`** (la «x» del logo), grises
  `#4f4c4d / #7b7979 / #918f8f / #aaabac / #d3d2d2`, blanco.
- Tokens en `globals.css`: escala `brand-*` = neutros de marca; `accent-*`
  = rojo (usar `accent-600 #d21418` para botones con texto blanco —
  contraste AA; el rojo puro solo para acentos/hovers). Wordmark en
  minúsculas: `finca` + `x` roja. Botón principal negro.

## Flujo de trabajo git/CI/CD

- Desarrollo en la rama `claude/fincax-plusvalia-calculator-opghd8` →
  PR a `main` → merge cuando la CI esté verde (el usuario delegó el merge:
  «decide tú»; PRs #1–#4 fusionados así).
- CI (`ci.yml`): tests+build en cada PR. Deploy (`deploy.yml`): en cada
  push a `main`, tests+build y SSH al VPS de Clouding.io ejecutando
  `scripts/deploy.sh` (PM2+Nginx; ver `docs/DESPLIEGUE.md`). El job de
  deploy FALLA de forma esperada hasta que existan los secrets
  `SSH_HOST/SSH_USER/SSH_KEY` — no es un bug.
- Commits SIN identificadores de modelo; autoría `FINCAX
  <fincaxsevilla@gmail.com>` con el trailer Co-Authored-By de Claude.

## El usuario (perfil y preferencias)

Trabaja en Windows con **PowerShell**, GitHub y un VPS de **Clouding.io**.
No es desarrollador profesional: explicar con claridad, darle los comandos
exactos, y encargarse Claude de todo lo automatizable. Habla español —
responder siempre en español. Aporta documentos oficiales en PDF cuando se
le pide (¡pedírselos es la vía para desbloquear datos!).

## Pendientes (lado usuario — recordárselo si procede)

1. GitHub → Settings → Default branch → `main` (+ protección de rama).
2. Preparar el VPS con `docs/DESPLIEGUE.md` (secciones 1–5) y decidir URL
   definitiva: **recomendado `fincax.es/calculadora-plusvalia`** (ruta, no
   subdominio); opciones A/B documentadas en la guía.
3. Secrets SSH en GitHub Actions (sección 6) → activa el deploy automático.
4. `.env` de producción: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`
   (activa el botón de WhatsApp), `LEAD_WEBHOOK_URL` (destino de leads).
5. SEO off-page: Search Console (sitemap + indexación), enlace desde la
   home de fincax.es (tarjeta redactada en `docs/DESPLIEGUE.md`), Google
   Business Profile, nota de prensa local, enlaces de gestorías/abogados.

## SEO (plan y estado)

Consulta objetivo: «calcular plusvalía municipal en Sevilla». Competencia
débil (Housfy, Vivenzia, AZ Hogar, calcularplusvalia.com, Máxima). Hecho
on-page: title/description optimizados, JSON-LD (WebApplication + FAQPage +
BreadcrumbList), tabla de coeficientes 2026 en página, ejemplo resuelto
(Triana: 716,31 € objetivo vs 13.265 € real), 105 páginas por municipio +
directorio + sitemap. Siguiente iteración: artículos del blog de fincax.es
enlazando la herramienta, municipios verificados, actualización anual de
coeficientes (enero) con el año en el H2 de la tabla.

## Principios no negociables del producto

- Cálculos 100 % en el navegador; sin cookies ni analítica de terceros
  (promesa RGPD publicada — si se añade analítica, que sea cookieless).
- Siempre citar fuentes normativas y mostrar avisos de estimación.
- Datos no verificados → máximos legales + aviso, nunca cifras inventadas.
- Tests calculados a mano para cada regla fiscal nueva (caso de referencia
  E2E: herencia Sevilla VCS 9.000 € → cuota 47,75 €).
