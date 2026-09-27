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

La vista lista para copiar está en `docs/laravel/calculadora-plusvalia.blade.php`.

1. Copiarla a `resources/views/herramientas/calculadora-plusvalia.blade.php` y
   ajustar `@extends('layouts.app')`, `@section('content')` y `@push('head')` a
   los nombres que use el layout de la web (si el layout no tiene
   `@stack('head')`, mover el `<meta>` y el `<link rel="canonical">` a donde
   el layout imprima la cabecera).
2. Añadir la ruta en `routes/web.php`:

   ```php
   Route::view('/calculadora-plusvalia', 'herramientas.calculadora-plusvalia')
       ->name('calculadora-plusvalia');
   ```
3. Enlazarla desde la tarjeta de «Herramientas profesionales»:
   `<a href="{{ route('calculadora-plusvalia') }}">`.
4. Si hay caché de rutas/vistas en producción:
   `php artisan route:cache && php artisan view:cache`.
5. Si la web Laravel envía una cabecera Content-Security-Policy (p. ej. con
   `spatie/laravel-csp` o desde su servidor web), añadir
   `https://calculadoraplusvalia.com` a `script-src` y `frame-src`. Si no hay
   CSP, no hay que tocar nada.

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
