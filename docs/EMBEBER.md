# Integrar la calculadora en otras webs (embebido)

La Calculadora de Plusvalía Municipal de FINCAX puede integrarse en cualquier
web (gestorías, abogados, otras inmobiliarias, blogs del sector) mediante un
`iframe` responsivo. Sigue funcionando además como app propia en
`fincax.es/calculadora-plusvalia`.

## Cómo integrarla (lo que se le da al cliente)

Pegar esto donde quiera que aparezca la calculadora:

```html
<div id="fincax-plusvalia"></div>
<script src="https://fincax.es/embed.js" async></script>
```

Para arrancar en un municipio concreto, añadir `data-municipio` con el
identificador (slug) del municipio:

```html
<div id="fincax-plusvalia" data-municipio="dos-hermanas"></div>
<script src="https://fincax.es/embed.js" async></script>
```

El script inserta un `iframe` a `/embed/calculadora-plusvalia` y lo ajusta de
alto automáticamente (mensajes `postMessage`). No usa cookies.

## Cómo funciona por dentro

- `public/embed.js`: script de integración que crea el iframe y lo
  redimensiona escuchando el alto que envía la página embebida.
- `src/app/embed/calculadora-plusvalia/…`: versión de la calculadora **sin la
  cabecera/pie del sitio** (grupo de rutas distinto del sitio público). Se
  sirve con `frame-ancestors *` para que cualquier web pueda enmarcarla; el
  resto del sitio mantiene `X-Frame-Options: DENY`.
- `src/components/calculator/EmbedCalculator.tsx`: comunica el alto a la web
  anfitriona y registra el uso (vista y cálculos).

## Seguimiento de uso y panel

- La versión embebida envía a `/api/embed-event` un evento **sin cookies y sin
  datos personales/económicos**: tipo (vista o cálculo), municipio y dominio de
  la web anfitriona. Se guarda en `EMBED_LOG_FILE` (JSONL; por defecto
  `embed-events.jsonl`).
- Panel de uso en **`/panel`**: tabla de webs integradoras con vistas y
  cálculos. Protegido por autenticación básica con `PANEL_USER` / `PANEL_PASS`
  (si no se definen, queda cerrado). Ejemplo de acceso: abrir
  `https://fincax.es/panel` e introducir el usuario y la contraseña.
- La política de privacidad recoge esta medición propia y agregada.

## Notas

- La CSP de la web anfitriona debe permitir cargar el script e iframe de
  `fincax.es` (la mayoría no aplican CSP estricta; si la aplican, deben añadir
  `fincax.es` a `script-src` y `frame-src`).
- Recomendado servir todo por HTTPS (obligatorio para que el iframe cargue en
  webs HTTPS).
