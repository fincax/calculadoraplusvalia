{{--
  FINCAX · Página de la Calculadora de Plusvalía en la web Laravel (fincax.es).
  Copiar a: resources/views/herramientas/calculadora-plusvalia.blade.php
  Ajustar @extends/@section/@push a los nombres del layout de la web
  (abre resources/views/layouts/ para ver cómo se llaman).
--}}
@extends('layouts.app')

@section('title', 'Calculadora de Plusvalía Municipal en Sevilla | FINCAX')

@push('head')
    <meta name="description" content="Calcula gratis la plusvalía municipal al vender, heredar o donar un inmueble en Sevilla y provincia. Método objetivo y real, bonificaciones y dónde pagar.">
    {{-- La versión completa (indexable) vive en calculadoraplusvalia.com: Google concentra ahí el posicionamiento. --}}
    <link rel="canonical" href="https://calculadoraplusvalia.com/calculadora-plusvalia">
@endpush

@section('content')
<section class="container" style="max-width: 960px; margin: 0 auto; padding: 32px 16px;">
    <h1>Calculadora de Plusvalía Municipal en Sevilla</h1>
    <p>
        Calcula cuánto pagarías de plusvalía al vender, heredar o recibir un inmueble en
        Sevilla y los 105 municipios de la provincia. Comparamos el método objetivo y el
        real con la normativa vigente y te avisamos si no tienes que pagar.
    </p>

    <div id="fincax-plusvalia"></div>
    <script src="https://calculadoraplusvalia.com/embed.js" async></script>
    <noscript>
        <a href="https://calculadoraplusvalia.com/calculadora-plusvalia">Abrir la calculadora de plusvalía</a>
    </noscript>

    <p style="margin-top: 16px;">
        ¿Prefieres verla a pantalla completa?
        <a href="https://calculadoraplusvalia.com/calculadora-plusvalia">Abrir la calculadora en su propia página</a>.
    </p>
</section>
@endsection
