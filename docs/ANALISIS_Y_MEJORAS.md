# Análisis del proyecto y hoja de ruta de mejoras

Fecha del análisis: **06/09/2026**. Rama: `claude/project-analysis-improvements-71m2zz`.

## 1. Estado actual (verificado en este análisis)

| Comprobación | Resultado |
|---|---|
| `npm test` (motor fiscal) | ✅ 43/43 tests en verde |
| `tsc --noEmit` (tipos) | ✅ sin errores |
| `npm run build` (Next.js 15.5) | ✅ 115 páginas estáticas, 122 kB de JS inicial |
| `node scripts/smoke-e2e.mjs` (Chromium) | ✅ caso de referencia 47,75 € correcto |
| `POST /api/lead` | ✅ acepta leads válidos, rechaza inválidos, rate-limit |
| Cabeceras de seguridad | ✅ nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy |
| `npm run lint` | ❌ **roto**: `next lint` está obsoleto, no hay configuración de ESLint y el comando se queda esperando una respuesta interactiva |
| `/favicon.ico` | ❌ 404 (no existe carpeta `public/` ni `icon`) |
| Imagen Open Graph | ❌ no existe: los enlaces compartidos por WhatsApp no muestran vista previa |
| `/calculadora-plusvalia/sevilla` | ⚠️ devuelve 404 en vez de redirigir a la principal |
| Node en CI y guía del VPS | ⚠️ Node 20, que llegó a fin de vida en abril de 2026 |

El motor fiscal es sólido: separa el cálculo de la interfaz, versiona las
reglas por fecha, aplica la tabla estatal correcta por devengo, prorratea
por meses en periodos inferiores a un año, valora usufructos y nuda
propiedad, detecta no sujeción y computa bonificaciones y recargos. Los
casos límite probados (valor de adquisición 0, devengos futuros, VCS
exactamente en el límite de un tramo, nuda propiedad temporal, herencia
bonificada presentada tarde) dan resultados coherentes.

## 2. Defectos y riesgos detectados

Ordenados por impacto en negocio.

### 2.1 Leads que se pueden perder (crítico)

Si `LEAD_WEBHOOK_URL` no está configurada, el lead solo se escribe en el
log de PM2. Los logs rotan y nadie los lee: **un lead sin webhook es un
lead perdido**. Además, si el webhook falla, se responde `ok` al usuario y
el dato queda igualmente solo en el log.

Propuesta:
- Envío por email con `nodemailer` (SMTP de Gmail con contraseña de
  aplicación, o un servicio como Brevo/Resend) a `fincaxsevilla@gmail.com`,
  con el resumen del cálculo en el cuerpo.
- Copia de seguridad en un fichero `leads.jsonl` en el VPS (append), fuera
  de los logs, para no perder nunca un contacto.
- Validar el formato del contacto (teléfono español o email) y añadir un
  campo trampa (honeypot) contra bots.
- Filtrar el objeto `summary` a los campos esperados antes de reenviarlo.
- Limpiar periódicamente el mapa del rate-limit (hoy crece sin límite).

### 2.2 Lint roto y sin ejecutar en CI

`next lint` desaparece en Next 16. Migrar a ESLint CLI con configuración
plana (`eslint.config.mjs` + `eslint-config-next`), y añadir el paso `npm
run lint` al workflow de CI. Sin lint, errores de accesibilidad y de hooks
de React pasan desapercibidos.

### 2.3 Sin favicon ni imagen Open Graph

- Google muestra el favicon en los resultados de búsqueda: sin él la
  página parece menos fiable. Crear `src/app/icon.svg` (la «x» roja de
  FINCAX sobre fondo negro) y `apple-icon.png`.
- WhatsApp es el canal principal de una inmobiliaria: sin
  `opengraph-image` los enlaces compartidos aparecen sin imagen. Generar
  una imagen OG con `next/og` (`src/app/opengraph-image.tsx`) con el
  wordmark y el texto «Calculadora de Plusvalía Municipal · Sevilla».

### 2.4 JSON-LD con URLs relativas

Los bloques `WebApplication` y `BreadcrumbList` usan `url:
"/calculadora-plusvalia"`. Schema.org espera URLs absolutas. Construirlas
con `NEXT_PUBLIC_SITE_URL`. Añadir además un bloque `RealEstateAgent`
(nombre, dirección Ronda de Triana 14E, email, área servida) para SEO
local.

### 2.5 Las 104 páginas por municipio son casi idénticas

Solo cambia el nombre. Google lo puede tratar como *doorway pages*
(contenido de relleno) y no posicionarlas, o penalizar. Mitigación:
- Un bloque de datos propio por municipio: código INE, comarca, si delega
  la gestión en el **OPAEF** (Diputación), si el régimen es autoliquidación
  o liquidación, enlace a la sede/ordenanza y teléfono de la oficina
  tributaria. Con eso cada página aporta algo distinto.
- FAQ propia con el nombre del municipio (3–4 preguntas) y `FAQPage` en
  JSON-LD.
- Priorizar la verificación de ordenanzas de los municipios grandes (ver
  2.7): una página con datos verificados es contenido único de verdad.

### 2.6 Textos con el año fijo

«2026» aparece escrito a mano en el `title`, en el H2 de la tabla de
coeficientes y en la descripción. El 1 de enero de 2027 el sitio seguirá
diciendo 2026 hasta que alguien lo edite. Derivar el año de la fecha
actual en tiempo de build (y programar un rebuild anual, ver 4.4).

### 2.7 Datos municipales sin verificar (104 de 105)

Es la mayor limitación del producto: casi todos los usuarios ven
«estimación por máximos». Plan realista con PDFs aportados por el usuario
(el proxy del entorno bloquea las webs municipales):

1. Dos Hermanas, Alcalá de Guadaíra, Utrera, Mairena del Aljarafe,
   Écija, Los Palacios y Villafranca, La Rinconada, Carmona, Morón de la
   Frontera, Lebrija (los 10 más poblados).
2. Cinturón metropolitano: Tomares, Bormujos, Camas, San Juan de
   Aznalfarache, Coria del Río, Espartinas, Gines, Castilleja de la Cuesta,
   Mairena del Alcor, El Viso del Alcor.

Cada verificación sigue el proceso de 5 pasos de
`docs/VERIFICACION_DATOS.md` e incluye un test calculado a mano.

También conviene **confirmar que la ordenanza de Sevilla de 2025/2026 no
ha cambiado** el tipo (26,53 %) ni las bonificaciones: el texto cotejado es
el aprobado en diciembre de 2023.

### 2.8 Detalles del motor

- El campo `cadastralReductionPercentage` (reducción del art. 107.3 TRLHL
  tras una ponencia de valores) existe en el modelo pero **el motor no lo
  aplica**. Implementarlo (reducir el valor catastral del suelo antes de
  aplicar el coeficiente) o eliminarlo para no inducir a error al
  verificar municipios.
- Los errores de `realRights.ts` y de `computeYearsHeld` lanzan `Error`
  genérico en vez de `PlusvaliaInputError`, así que la interfaz muestra
  «No se ha podido completar el cálculo» en lugar del mensaje concreto.
  Unificar en `PlusvaliaInputError`.
- Devengos futuros (p. ej. 2030) se calculan con la tabla vigente sin
  avisar de que los coeficientes se actualizan cada año por la Ley de
  Presupuestos. Añadir un aviso cuando la fecha supere el año en curso.
- Método real: recordar en la interfaz que se toma **el mayor** entre el
  valor del título y el comprobado por la Administración (art. 104.5), y
  que en herencias y donaciones el valor es el declarado en el ISD.
- Recargo: falta la **reducción del 25 %** del recargo si se ingresa en
  plazo y sin recurso (art. 27.5 LGT) y el cálculo de **intereses de
  demora** a partir de los 12 meses (tipo anual fijado por la LPGE; en los
  últimos ejercicios 4,0625 %, confirmar cada año).

### 2.9 Infraestructura y despliegue

- **Node 20 está en fin de vida** desde abril de 2026: pasar CI, guía de
  despliegue y VPS a Node 22 LTS. Añadir `"engines"` en `package.json` y
  un `.nvmrc`.
- Nginx: falta `Strict-Transport-Security`, un `client_max_body_size`
  pequeño para `/api/lead` y `limit_req` para frenar abusos del
  formulario.
- Falta una **Content-Security-Policy** (Next la admite con nonces vía
  middleware; a corto plazo, una política moderada sin `unsafe-eval`).
- El job de deploy no comprueba que la aplicación responde tras
  reiniciar: añadir `/api/health` y un `curl` de verificación al final de
  `deploy.sh`, además de `pm2 install pm2-logrotate` para que los logs no
  llenen el disco.
- Sin Dependabot ni Renovate: las dependencias no reciben avisos de
  seguridad. Añadir `.github/dependabot.yml` (npm, semanal).
- Sitemap sin `lastModified`.

### 2.10 Cobertura de tests

No hay tests para `parseAmount` (el parser de importes «120.000» /
«1.500,50», que vive dentro del componente), `format.ts`, `slugify`,
`getRulesForDate` con varias versiones, `realRights` con entradas
inválidas ni para la API de leads. Mover `parseAmount` a
`src/lib/plusvalia/parse.ts` y testearlo; añadir tests de la ruta de leads
con `Request` nativo; ejecutar el E2E en CI (con el paquete `playwright`
completo, que instala Chromium).

## 3. Mejoras de accesibilidad y experiencia

- Las tarjetas de «Tipo de transmisión» usan un radio oculto (`sr-only`):
  al navegar con teclado no se ve el foco. Añadir un anillo con
  `has-[:focus-visible]`.
- `min`/`max` en los campos de fecha (transmisión no anterior al
  10/11/2021).
- Botón **«Limpiar»** para reiniciar el formulario.
- Selector de municipio con búsqueda (combobox) en lugar de un `<select>`
  de 106 opciones; ayuda especialmente en móvil.
- Opción «Recordar mis datos en este navegador» (localStorage, sin
  cookies y solo si el usuario lo marca).
- Mensajes de validación en vivo al salir de cada campo, no solo al
  pulsar «Calcular».

## 4. Funcionalidades para hacerla más potente

Ordenadas por relación valor/esfuerzo.

### 4.1 Enlace compartible con los datos en la URL

Codificar el formulario en parámetros (`?m=sevilla&t=herencia&fa=…`) y
un botón «Copiar enlace al cálculo». Permite a FINCAX enviar cálculos
preparados a clientes por WhatsApp, enlazar casos concretos desde el blog
y que el cliente vuelva a su simulación. Esfuerzo bajo; todo en cliente.

### 4.2 «¿Cuándo me conviene vender?»: curva por años de tenencia

Con el mismo motor, calcular la cuota objetiva para cada año futuro
(hasta 20) y mostrarla en una tabla o gráfica sencilla. Muestra que
esperar un año puede subir o bajar la cuota (los coeficientes no son
monótonos). Es una función que ninguna calculadora de la competencia
ofrece y genera conversación con el asesor.

### 4.3 Cálculo inverso: precio de equilibrio

Dado el resto de datos, calcular el precio de venta por debajo del cual
no hay sujeción (sin incremento del suelo) y el precio a partir del cual
el método objetivo pasa a ser el más favorable. Útil para fijar precio.

### 4.4 Automatizar la actualización anual

- Un workflow programado cada enero que abra una *issue* «Revisar
  coeficientes de la LPGE» y lance un rebuild.
- Aviso en la interfaz si `lastVerifiedAt` tiene más de 12 meses.
- Derivar el año de los textos de la fecha de build (ver 2.6).

### 4.5 Informe por email como imán de leads

«Recibe este informe en PDF en tu email» → captura el email con
consentimiento y envía el informe (HTML→PDF en el servidor o el propio
resumen en HTML). Convierte mucho mejor que «Quiero que me llaméis» y
reutiliza el envío de email del punto 2.1.

### 4.6 Reparto entre varios herederos o cotitulares

Introducir el número de personas y sus porcentajes y mostrar la cuota de
cada una. La bonificación de Sevilla se decide por el VCS de toda la
vivienda, que ya es como lo hace el motor.

### 4.7 Medir sin cookies

Umami o Plausible autoalojado en el mismo VPS (sin cookies, compatible
con la promesa de privacidad publicada). Eventos: «calcular», «lead
enviado», «clic WhatsApp», «imprimir». Sin datos no se puede optimizar la
captación.

### 4.8 Contenido local por municipio

Ver 2.5. Añadir además un cuadro «Dónde se paga la plusvalía en X»
(ayuntamiento u OPAEF, enlace a la sede electrónica y a la ordenanza).

## 5. Orden de ejecución recomendado

1. ✅ **Semana 1 (fiabilidad) — COMPLETADA (06/09/2026)**: leads por email
   SMTP + copia en fichero JSONL + reenvío a webhook, con validación de
   contacto y honeypot antispam (2.1); ESLint (flat config) con paso en CI y
   deploy (2.2); favicon `icon.svg`, `apple-icon` y `opengraph-image` (2.3);
   Node 22 en CI/deploy/guía + `.nvmrc` + `engines` (2.9); JSON-LD con URLs
   absolutas y bloque `RealEstateAgent` (2.4); redirección 308 de
   `/calculadora-plusvalia/sevilla` a la principal; `PlusvaliaInputError`
   unificado (errores concretos en la UI) y aviso por devengo futuro (2.8);
   además `/api/health` y verificación del despliegue en `deploy.sh`.
   63 tests en verde, lint/tipos/build limpios y E2E correcto.
2. ✅ **Semana 2 (potencia) — COMPLETADA (06/09/2026)**: enlace compartible
   con «Copiar enlace» y prefill desde la URL (4.1); curva «¿cuándo me
   conviene vender?» por años de tenencia (4.2); recargo con reducción del
   25 % (art. 27.5 LGT) e intereses de demora (2.8); `parseAmount`, `share` y
   `projection` extraídos a módulos puros con tests, y **E2E en CI** con
   Chromium de Playwright (2.10); foco visible en las tarjetas de tipo de
   transmisión, botón «Limpiar» y `min` en la fecha (3). 76 tests en verde;
   lint/tipos/build limpios; verificado en navegador (prefill, curva,
   reducción/intereses, copiar y limpiar).
3. **Continuo (datos)**: verificar ordenanzas de los 10 municipios más
   poblados con los PDFs que aporte el usuario (2.7) y enriquecer sus
   páginas (2.5, 4.8).
4. **Después**: informe por email (4.5), analítica sin cookies (4.7),
   cálculo inverso (4.3), reparto entre herederos (4.6), CSP (2.9).

## 6. Pendientes del lado del usuario (sin cambios)

Siguen vigentes los de `CLAUDE.md`: rama por defecto `main`, preparar el
VPS, secrets SSH, `.env` de producción (WhatsApp y webhook/SMTP de leads),
Search Console y enlace desde la home de fincax.es. Nuevo: **aportar los
PDFs de las ordenanzas** de Dos Hermanas, Alcalá de Guadaíra, Utrera,
Mairena del Aljarafe y Écija para empezar la verificación, y confirmar la
ordenanza de Sevilla vigente en 2026.
