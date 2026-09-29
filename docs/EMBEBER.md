# Integrar la calculadora en otras webs (embebido)

La Calculadora de Plusvalía Municipal de FINCAX vive en su dominio propio,
**`https://calculadoraplusvalia.com`** (app Next.js en el VPS de Clouding), y
puede integrarse en cualquier web —la propia fincax.es, gestorías, abogados,
otras inmobiliarias, blogs del sector— mediante un `iframe` responsivo.

Código de integración (el mismo para todos):

```html
<div id="fincax-plusvalia"></div>
<script src="https://calculadoraplusvalia.com/embed.js" async></script>
```

Para arrancar en un municipio concreto, añadir `data-municipio` con su
identificador (el mismo de la URL de su página, p. ej. `dos-hermanas`):

```html
<div id="fincax-plusvalia" data-municipio="dos-hermanas"></div>
<script src="https://calculadoraplusvalia.com/embed.js" async></script>
```

El script inserta un `iframe` a `/embed/calculadora-plusvalia` y lo ajusta de
alto automáticamente (mensajes `postMessage`). No usa cookies.

## En la web de FINCAX (fincax.es, hecha en Laravel)

Vista lista para copiar: `docs/laravel/calculadora-plusvalia.blade.php`.
Está **calcada a la del valorador** (`property-valuation.blade.php`, aportada
por el usuario): layout `frontend.layouts.app`, secciones `title`,
`meta_description` y `content`, misma banda roja `#a90101` con patrón, icono,
píldoras, cifras, insignias y FAQ. En lugar del formulario lleva el embebido,
superpuesto a la banda (`pb-16 -mt-24`; el embebido tiene fondo transparente).

1. Copiarla junto a `property-valuation.blade.php` con el nombre
   `calculadora-plusvalia.blade.php`.
2. Ruta en `routes/web.php`, junto a las del valorador (ajustar el prefijo de
   carpeta de la vista si `property-valuation` está en una subcarpeta, p. ej.
   `frontend.calculadora-plusvalia`):

   ```php
   Route::view('/calculadora-plusvalia', 'frontend.calculadora-plusvalia')
       ->name('calculadora-plusvalia');
   ```
3. Canonical: la vista hace `@push('head')`. Comprobar que el layout
   `resources/views/frontend/layouts/app.blade.php` tiene `@stack('head')`
   dentro de `<head>`; si no, añadir esa línea justo antes de `</head>`.
4. Enlazarla desde «Herramientas profesionales»:
   `<a href="{{ route('calculadora-plusvalia') }}">`.
5. `php artisan route:clear && php artisan view:clear`. Si la web compila
   Tailwind con Vite y algo sale sin estilo, `npm run build` (la vista usa
   las mismas clases que el valorador, así que no debería hacer falta).
6. Si la web Laravel envía una cabecera Content-Security-Policy, añadir
   `https://calculadoraplusvalia.com` a `script-src` y `frame-src`.

SEO: el contenido de un iframe **no posiciona** para la página que lo
contiene (la versión embebida es además `noindex`). Lo que posiciona es
`calculadoraplusvalia.com` (la calculadora y las 105 páginas de municipios,
con sitemap propio). Por eso la vista de Laravel lleva un
`<link rel="canonical">` hacia `https://calculadoraplusvalia.com/calculadora-plusvalia`:
Google no ve dos páginas compitiendo por la misma búsqueda y concentra el
posicionamiento en la que tiene todo el contenido. El enlace desde fincax.es
hacia el dominio de la calculadora además le transmite autoridad.

## En otras plataformas

- **WordPress** (Gutenberg): bloque «HTML personalizado». En Elementor: widget
  «HTML». Si hay un plugin de caché/optimización (WP Rocket, Autoptimize…),
  excluir `embed.js` de «retrasar/combinar JavaScript».
- **Wix / Squarespace / Webflow**: elemento «Insertar código / Embed». Estos
  constructores meten el código en su propio marco de alto fijo, así que el
  alto automático no llega: usar directamente el iframe con un alto generoso
  (1.900 px en móvil cubre formulario + resultados):

  ```html
  <iframe src="https://calculadoraplusvalia.com/embed/calculadora-plusvalia"
          title="Calculadora de Plusvalía Municipal (FINCAX)"
          allow="clipboard-write" style="width:100%;height:1900px;border:0"></iframe>
  ```

## Cómo funciona por dentro

- `public/embed.js`: script de integración que crea el iframe y lo
  redimensiona escuchando el alto que envía la página embebida.
- `src/app/embed/calculadora-plusvalia/…`: versión de la calculadora **sin la
  cabecera/pie del sitio** (grupo de rutas distinto del sitio público). Se
  sirve con `frame-ancestors *` para que cualquier web pueda enmarcarla; el
  resto del sitio mantiene `X-Frame-Options: DENY`.
- `src/components/calculator/EmbedCalculator.tsx`: comunica el alto del
  contenido a la web anfitriona y registra el uso (vista y cálculos).

## Seguimiento de uso y panel

- La versión embebida envía a `/api/embed-event` un evento **sin cookies y sin
  datos personales/económicos**: tipo (vista o cálculo), municipio y dominio de
  la web anfitriona. Se guarda en `EMBED_LOG_FILE` (JSONL; por defecto
  `embed-events.jsonl`).
- Panel de uso en **`https://calculadoraplusvalia.com/panel`**: tabla de webs
  integradoras con vistas y cálculos. Protegido por autenticación básica con
  `PANEL_USER` / `PANEL_PASS` del `.env` (si no se definen, queda cerrado).
- La política de privacidad recoge esta medición propia y agregada.

## Notas

- La CSP de la web anfitriona debe permitir cargar el script e iframe de
  `calculadoraplusvalia.com` (la mayoría no aplican CSP estricta; si la
  aplican, deben añadirlo a `script-src` y `frame-src`).
- Todo se sirve por HTTPS (obligatorio para que el iframe cargue en webs HTTPS).
