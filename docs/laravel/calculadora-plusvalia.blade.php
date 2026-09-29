{{--
  FINCAX · Calculadora de Plusvalía Municipal dentro de fincax.es
  Vista calcada al valorador (property-valuation.blade.php): misma banda
  roja, píldoras, cifras, tarjeta superpuesta, insignias y FAQ. En lugar del
  formulario lleva la calculadora embebida desde calculadoraplusvalia.com
  (fondo transparente: su tarjeta blanca se monta sobre la banda roja).

  Guardar junto a property-valuation.blade.php con el nombre
  calculadora-plusvalia.blade.php. Ruta y pasos: docs/EMBEBER.md.
--}}
@extends('frontend.layouts.app')

@section('title', 'Calculadora de Plusvalía Municipal en Sevilla - Fincax')
@section('meta_description', 'Calcula gratis la plusvalía municipal al vender, heredar o donar un inmueble en Sevilla y provincia. Método objetivo y real, bonificaciones y plazos.')

{{-- Canonical: la versión completa (indexable) vive en calculadoraplusvalia.com.
     Requiere @stack('head') dentro de <head> del layout (ver docs/EMBEBER.md). --}}
@push('head')
    <link rel="canonical" href="https://calculadoraplusvalia.com/calculadora-plusvalia">
@endpush

@section('content')
<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

    {{-- Hero Section --}}
    <div class="relative overflow-hidden text-white" style="background-color: #a90101">
        <div class="absolute inset-0 bg-black opacity-10"></div>
        <div class="absolute inset-0" style="background-image: url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.05&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>

        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div class="text-center">
                <!-- Icono animado -->
                <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 animate-bounce">
                    <svg class="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                </div>

                <h1 class="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                    Calculadora de Plusvalía
                    <span class="block bg-clip-text">Municipal en Sevilla</span>
                </h1>

                <p class="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                    Descubre cuánto pagarás al vender, heredar o recibir un inmueble. Comparamos el método objetivo y el real con la normativa vigente y aplicamos las bonificaciones de tu municipio
                </p>

                <!-- Features pills -->
                <div class="flex flex-wrap justify-center gap-3 mb-8">
                    <span class="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                        100% Gratuito
                    </span>
                    <span class="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"></path>
                        </svg>
                        Normativa 2026
                    </span>
                    <span class="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                        </svg>
                        Sevilla y Provincia
                    </span>
                    <span class="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                        </svg>
                        Sin Registro
                    </span>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto">
                    <div class="text-center">
                        <div class="text-3xl md:text-4xl font-bold mb-1">106</div>
                        <div class="text-sm text-blue-100">Municipios</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl md:text-4xl font-bold mb-1">2</div>
                        <div class="text-sm text-blue-100">Métodos comparados</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl md:text-4xl font-bold mb-1">0 €</div>
                        <div class="text-sm text-blue-100">Coste</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Calculadora (embebida desde calculadoraplusvalia.com). Su tarjeta blanca
         se monta sobre la banda roja y el alto se ajusta solo. --}}
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 -mt-24 relative z-10">

        <div id="fincax-plusvalia"></div>
        <script src="https://calculadoraplusvalia.com/embed.js" async></script>
        <noscript>
            <p class="text-center">
                <a href="https://calculadoraplusvalia.com/calculadora-plusvalia" class="font-semibold underline">Abrir la Calculadora de Plusvalía</a>
            </p>
        </noscript>

        {{-- Trust Badges --}}
        <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div class="p-6">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                </div>
                <h3 class="font-bold text-gray-900 mb-2">100% Privado</h3>
                <p class="text-sm text-gray-600">El cálculo se hace en tu navegador: tus datos no se envían ni se guardan</p>
            </div>

            <div class="p-6">
                <div class="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </div>
                <h3 class="font-bold text-gray-900 mb-2">Normativa Oficial</h3>
                <p class="text-sm text-gray-600">Coeficientes del BOE y ordenanzas fiscales municipales</p>
            </div>

            <div class="p-6">
                <div class="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                </div>
                <h3 class="font-bold text-gray-900 mb-2">Resultado Inmediato</h3>
                <p class="text-sm text-gray-600">Con informe en PDF descargable</p>
            </div>
        </div>
    </div>

    {{-- FAQ Section --}}
    <div class="bg-white py-16">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Preguntas Frecuentes</h2>

            <div class="space-y-4">
                <details class="group bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition cursor-pointer">
                    <summary class="font-semibold text-gray-900 flex justify-between items-center">
                        ¿Quién paga la plusvalía municipal?
                        <svg class="w-5 h-5 text-gray-500 group-open:rotate-180 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </summary>
                    <p class="mt-4 text-gray-600">
                        En una compraventa la paga quien vende. En una herencia o donación, quien recibe el inmueble.
                    </p>
                </details>

                <details class="group bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition cursor-pointer">
                    <summary class="font-semibold text-gray-900 flex justify-between items-center">
                        ¿Tengo que pagar si vendo con pérdidas?
                        <svg class="w-5 h-5 text-gray-500 group-open:rotate-180 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </summary>
                    <p class="mt-4 text-gray-600">
                        No. Si no hay incremento de valor del suelo, la operación no está sujeta al impuesto (art. 104.5 TRLHL). Hay que acreditarlo con las escrituras. La calculadora lo detecta automáticamente.
                    </p>
                </details>

                <details class="group bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition cursor-pointer">
                    <summary class="font-semibold text-gray-900 flex justify-between items-center">
                        ¿Qué plazo tengo para presentarla?
                        <svg class="w-5 h-5 text-gray-500 group-open:rotate-180 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </summary>
                    <p class="mt-4 text-gray-600">
                        30 días hábiles en compraventas y donaciones, y 6 meses en herencias (prorrogables hasta un año si se solicita). Presentarla tarde conlleva recargos.
                    </p>
                </details>

                <details class="group bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition cursor-pointer">
                    <summary class="font-semibold text-gray-900 flex justify-between items-center">
                        ¿Puede FINCAX ayudarme con la plusvalía?
                        <svg class="w-5 h-5 text-gray-500 group-open:rotate-180 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </summary>
                    <p class="mt-4 text-gray-600">
                        Sí. Revisamos tu caso, preparamos la autoliquidación con el método más favorable y, si vas a vender, te acompañamos en toda la operación. Déjanos tus datos al final del cálculo y te llamamos.
                    </p>
                </details>
            </div>
        </div>
    </div>
</div>
@endsection
