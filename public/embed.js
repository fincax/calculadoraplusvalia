/*
 * FINCAX · Calculadora de Plusvalía Municipal — script de integración.
 *
 * Uso en cualquier web:
 *   <div id="fincax-plusvalia" data-municipio="dos-hermanas"></div>
 *   <script src="https://fincax.es/embed.js" async></script>
 *
 * (data-municipio es opcional; si se omite, arranca en Sevilla.)
 * Inserta un iframe responsivo que se ajusta de alto automáticamente.
 */
(function () {
  var script = document.currentScript;
  // Origen desde el que se sirve este script (dominio de FINCAX).
  var origin = "https://fincax.es";
  try {
    origin = new URL(script.src).origin;
  } catch {}

  function mount(container) {
    if (!container || container.getAttribute("data-fincax-ready") === "1") return;
    container.setAttribute("data-fincax-ready", "1");

    var municipio = container.getAttribute("data-municipio");
    var src =
      origin +
      "/embed/calculadora-plusvalia" +
      (municipio ? "/" + encodeURIComponent(municipio) : "");

    var iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.title = "Calculadora de Plusvalía Municipal (FINCAX)";
    iframe.loading = "lazy";
    iframe.setAttribute("scrolling", "no");
    iframe.style.width = "100%";
    iframe.style.border = "0";
    iframe.style.overflow = "hidden";
    iframe.style.minHeight = "820px";
    container.appendChild(iframe);

    window.addEventListener("message", function (ev) {
      if (ev.origin !== origin) return;
      var data = ev.data || {};
      if (data.type === "fincax:height" && typeof data.height === "number") {
        iframe.style.height = Math.max(300, data.height + 8) + "px";
        iframe.style.minHeight = "0px";
      }
    });
  }

  function init() {
    var container = document.getElementById("fincax-plusvalia");
    if (!container && script && script.parentNode) {
      // Sin contenedor explícito: se crea uno junto al <script>.
      container = document.createElement("div");
      script.parentNode.insertBefore(container, script.nextSibling);
    }
    mount(container);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
