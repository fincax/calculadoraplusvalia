# FINCAX — Calculadora de Plusvalía Municipal (IIVTNU)

Aplicación web de FINCAX con la **Calculadora de Plusvalía Municipal** para
Sevilla y provincia, construida con Next.js (App Router), TypeScript y
Tailwind CSS.

Ruta principal: **`/calculadora-plusvalia`**

## Qué hace

- Calcula el IIVTNU por el **método objetivo** (valor catastral del suelo ×
  coeficiente por años de tenencia × tipo de gravamen) y por el **método real**
  (incremento efectivo imputable al suelo), y aplica automáticamente el más
  favorable (art. 107.5 TRLHL).
- Detecta la **no sujeción por inexistencia de incremento** (art. 104.5 TRLHL)
  y la posible **exención por dación en pago** (art. 105.1.c TRLHL).
- Aplica la tabla de **coeficientes estatales vigente en la fecha exacta de
  devengo** (RD-ley 26/2021 → LPGE 2023 → RD-ley 8/2023, vigente en 2024–2026).
- Contempla **porcentaje de titularidad** y **derechos reales** (usufructo
  vitalicio/temporal y nuda propiedad, art. 10.2 TRLITPAJD).
- Calcula la **bonificación mortis causa** de Sevilla capital por tramos de
  valor catastral del suelo (95 % / 50 % / 30 %), mostrando sus requisitos.
- Informa de **plazos de presentación** (art. 110.2 TRLHL) y calcula
  opcionalmente los **recargos por extemporaneidad** (art. 27 LGT).
- Explica cada paso del cálculo y cita las **fuentes normativas**.
- Genera un **informe imprimible / PDF** (Imprimir → Guardar como PDF).
- Convierte tráfico en **leads** (formulario con consentimiento RGPD,
  WhatsApp y email).

## Arquitectura

```
src/
  lib/plusvalia/          ← Motor fiscal puro (sin dependencias de UI)
    types.ts              ← Modelo de dominio (MunicipalityTaxRules, etc.)
    coefficients.ts       ← Tablas estatales por fecha de devengo
    engine.ts             ← Cálculo (objetivo, real, bonificaciones…)
    realRights.ts         ← Valoración de usufructos y nuda propiedad
    deadlines.ts          ← Plazos y recargos
    data/municipalities.ts← Reglas por municipio, versionadas por vigencia
    *.test.ts             ← Tests unitarios (vitest)
  app/                    ← Next.js App Router (páginas, SEO, API de leads)
  components/             ← UI (formulario, resultados, captación)
```

El motor está **desacoplado de la interfaz**: extender la calculadora a otros
municipios de España consiste en añadir registros `MunicipalityTaxRules` en
`src/lib/plusvalia/data/municipalities.ts` (admite varias versiones por
municipio según la fecha de vigencia). No hay que tocar el motor.

### Calidad de los datos municipales

- **Sevilla capital**: tipo de gravamen (26,53 %) y bonificación mortis causa
  contrastados con la ordenanza fiscal (`verified: true`).
- **Resto de la provincia**: hasta verificar cada ordenanza, se aplican los
  **máximos legales** (tipo 30 % y coeficientes máximos estatales) con
  `verified: false`; la interfaz lo comunica como *estimación de máximo*.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # tests del motor fiscal
npm run build      # build de producción
```

Variables de entorno (ver `.env.example`): `NEXT_PUBLIC_SITE_URL`,
`NEXT_PUBLIC_WHATSAPP_NUMBER` (opcional), `LEAD_WEBHOOK_URL` (opcional).

## Despliegue

Producción en un VPS (Clouding.io) con PM2 + Nginx y despliegue automático
por GitHub Actions en cada push a `main` (tests → build → SSH deploy).
Guía completa paso a paso: **[docs/DESPLIEGUE.md](docs/DESPLIEGUE.md)**.
Estado de verificación de datos municipales:
**[docs/VERIFICACION_DATOS.md](docs/VERIFICACION_DATOS.md)**.

## RGPD y privacidad

Los cálculos se ejecutan íntegramente en el navegador: los datos económicos
del usuario **no se envían al servidor**. No hay cookies de seguimiento ni
analítica de terceros. Solo se tratan datos personales si el usuario envía el
formulario de contacto, con consentimiento expreso (ver
`/politica-privacidad`).

## Descargo

Los resultados son estimaciones orientativas y no constituyen asesoramiento
fiscal. La cuota definitiva la determina la administración competente conforme
a la ordenanza fiscal vigente.
