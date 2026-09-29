{{--
  FINCAX · Página de la Calculadora de Plusvalía en la web Laravel (fincax.es).

  Lo MÁS FÁCIL: duplica la vista del valorador o del simulador de hipoteca
  (ya tiene tu cabecera, la banda roja y el pie) y sustituye su formulario
  por el bloque «CALCULADORA» de abajo. Esta plantilla es la alternativa si
  prefieres partir de cero: funciona sola, con estilos propios.

  Copiar a: resources/views/herramientas/calculadora-plusvalia.blade.php
  y ajustar @extends/@section/@push a los nombres del layout de la web.
--}}
@extends('layouts.app')

@section('title', 'Calculadora de Plusvalía Municipal en Sevilla | FINCAX')

@push('head')
    <meta name="description" content="Calcula gratis la plusvalía municipal al vender, heredar o donar un inmueble en Sevilla y provincia. Método objetivo y real, bonificaciones y dónde pagar.">
    {{-- La versión completa (indexable) vive en calculadoraplusvalia.com: Google concentra ahí el posicionamiento. --}}
    <link rel="canonical" href="https://calculadoraplusvalia.com/calculadora-plusvalia">
    <style>
        .fx-plusvalia-hero { background: #990000; color: #fff; text-align: center; padding: 56px 16px 140px; }
        .fx-plusvalia-hero h1 { margin: 0; font-size: clamp(2rem, 5vw, 3rem); font-weight: 900; line-height: 1.15; }
        .fx-plusvalia-hero p { max-width: 640px; margin: 16px auto 0; font-size: 1.1rem; opacity: .9; }
        .fx-plusvalia-embed { position: relative; z-index: 1; max-width: 1000px; margin: -120px auto 0; padding: 0 8px; }
    </style>
@endpush

@section('content')
    {{-- BANDA ROJA (si duplicas el valorador, usa la suya y cambia solo los textos) --}}
    <section class="fx-plusvalia-hero">
        <h1>Calculadora de Plusvalía Municipal<br>en Sevilla y provincia</h1>
        <p>Calcula cuánto pagarías de plusvalía al vender, heredar o recibir un inmueble. Comparamos el método objetivo y el real con la normativa vigente.</p>
    </section>

    {{-- CALCULADORA: se monta sobre la banda roja (margen negativo). Su fondo es
         transparente, así que se funde con la página. El alto se ajusta solo. --}}
    <div class="fx-plusvalia-embed">
        <div id="fincax-plusvalia"></div>
        <script src="https://calculadoraplusvalia.com/embed.js" async></script>
        <noscript>
            <a href="https://calculadoraplusvalia.com/calculadora-plusvalia">Abrir la calculadora de plusvalía</a>
        </noscript>
    </div>
@endsection
