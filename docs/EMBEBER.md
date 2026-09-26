# Integrar la calculadora en otras webs (embebido)

La Calculadora de Plusvalía Municipal de FINCAX puede integrarse en cualquier
web (gestorías, abogados, otras inmobiliarias, blogs del sector) mediante un
`iframe` responsivo. Sigue funcionando además como app propia en
`fincax.es/calculadora-plusvalia`.

## En la propia web de FINCAX (fincax.es)

La calculadora es una app Next.js que corre en el VPS; la web principal puede
estar hecha con otra herramienta (WordPress, Wix, etc.). La forma más sencilla
y robusta de unirlas es:

1. **Publicar la app en un subdominio**: `calculadora.fincax.es` (Opción A de
   `docs/DESPLIEGUE.md`), con `NEXT_PUBLIC_SITE_URL=https://calculadora.fincax.es`
   en el `.env` (si no, las canónicas y el enlace «FINCAX» del crédito apuntarían
   a una ruta que no existe en la web principal).
2. **Crear en fincax.es una página** «Calculadora de plusvalía» (p. ej.
   `fincax.es/calculadora-plusvalia`) dentro de «Herramientas profesionales» y
   pegar en ella un bloque de HTML personalizado con:

   ```html
   <div id="fincax-plusvalia"></div>
   <script src="https://calculadora.fincax.es/embed.js" async></script>
   ```

   - **WordPress** (Gutenberg): bloque «HTML personalizado». En Elementor:
     widget «HTML». Si hay un plugin de caché/optimización (WP Rocket,
     Autoptimize…), excluir `embed.js` de «retrasar/combinar JavaScript».
   - **Wix / Squarespace / Webflow**: elemento «Insertar código / Embed».
     Estos constructores meten el código en su propio marco de alto fijo, así
     que el alto automático no llega: usar directamente el iframe con un alto
     generoso (1.900 px en móvil cubre formulario + resultados):

     ```html
     <iframe src="https://calculadora.fincax.es/embed/calculadora-plusvalia"
             title="Calculadora de Plusvalía Municipal (FINCAX)"
             allow="clipboard-write" style="width:100%;height:1900px;border:0"></iframe>
     ```
3. En la tarjeta de «Herramientas profesionales» de la home, enlazar a esa
   página.

SEO: el contenido de un iframe **no posiciona** para la página que lo contiene
(la versión embebida es además `noindex`). Lo que posiciona son las páginas de
la app (`calculadora.fincax.es/calculadora-plusvalia` y las 105 de municipios,
con sitemap propio). Por eso conviene dar de alta el subdominio en Search
Console y que la página de fincax.es tenga su propio texto (título H1, una
explicación breve) y un enlace a la versión completa.

Si la web principal se sirve desde el mismo Nginx del VPS, la alternativa es
la Opción B (`fincax.es/calculadora-plusvalia` directamente, sin iframe; mejor
para SEO). En ese caso el snippet para terceros usa `https://fincax.es/embed.js`.

## Cómo integrarla en webs de terceros (lo que se le da al cliente)

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

> El dominio del snippet es el de la app: `https://fincax.es` con la Opción B
> del despliegue o `https://calculadora.fincax.es` con la Opción A.

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
