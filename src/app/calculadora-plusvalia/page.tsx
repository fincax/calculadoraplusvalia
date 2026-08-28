import type { Metadata } from "next";
import PlusvaliaCalculator from "@/components/calculator/PlusvaliaCalculator";

export const metadata: Metadata = {
  title:
    "Calculadora de Plusvalía Municipal (IIVTNU) en Sevilla y provincia — gratis",
  description:
    "Calcula cuánto podrías pagar de plusvalía municipal al vender, heredar o recibir un inmueble en Sevilla y provincia. Compara método objetivo y real, detecta la no sujeción y aplica bonificaciones. Con normativa vigente y fuentes oficiales.",
  alternates: { canonical: "/calculadora-plusvalia" },
  openGraph: {
    title: "Calculadora de Plusvalía Municipal (IIVTNU) | FINCAX",
    description:
      "Calcula la plusvalía municipal en Sevilla y provincia: método objetivo vs. incremento real, bonificaciones, plazos y recargos. Gratis y sin registro.",
  },
};

const faqs = [
  {
    q: "¿Qué es la plusvalía municipal (IIVTNU)?",
    a: "Es el Impuesto sobre el Incremento de Valor de los Terrenos de Naturaleza Urbana: un impuesto municipal que grava el aumento de valor del suelo urbano cuando se transmite un inmueble por compraventa, herencia o donación. No grava la construcción, solo el suelo.",
  },
  {
    q: "¿Quién paga la plusvalía municipal?",
    a: "En una compraventa la paga quien vende. En herencias y donaciones la paga quien adquiere (heredero o donatario). Si el vendedor no reside en España, el comprador actúa como sustituto del contribuyente.",
  },
  {
    q: "¿Y si vendo con pérdidas?",
    a: "Desde la reforma de 2021 (art. 104.5 TRLHL), si no existe incremento de valor del suelo entre la adquisición y la transmisión, la operación no está sujeta al impuesto. Debes acreditarlo aportando las escrituras de compra y de venta al ayuntamiento.",
  },
  {
    q: "¿Qué plazo tengo para pagar?",
    a: "En transmisiones inter vivos (compraventa o donación), 30 días hábiles desde la transmisión. En herencias, 6 meses desde el fallecimiento, prorrogables hasta un año si se solicita antes de que venza el plazo.",
  },
  {
    q: "¿Cómo se elige entre el método objetivo y el real?",
    a: "La ley permite tributar por la menor de las dos bases: la objetiva (valor catastral del suelo × coeficiente según años de tenencia) o la real (ganancia efectiva imputable al suelo). Esta calculadora computa ambas y aplica automáticamente la más favorable.",
  },
  {
    q: "¿El resultado de la calculadora es definitivo?",
    a: "No. Es una estimación orientativa basada en la normativa vigente y en los datos que introduces. La cuota definitiva la determina el ayuntamiento conforme a su ordenanza fiscal. Para casos con bonificaciones, exenciones o dudas, consulta con un profesional.",
  },
];

export default function CalculadoraPlusvaliaPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Calculadora de Plusvalía Municipal (IIVTNU)",
        url: "/calculadora-plusvalia",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        provider: {
          "@type": "Organization",
          name: "FINCAX",
          url: "https://fincax.es",
        },
        areaServed: "Sevilla y provincia, España",
        inLanguage: "es",
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="no-print max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
          Herramientas profesionales · Servicios que te ayudan a decidir
        </p>
        <h1 className="mt-2 text-3xl font-bold text-brand-900 sm:text-4xl">
          Calculadora de Plusvalía Municipal
        </h1>
        <p className="mt-3 text-lg text-ink-700">
          Calcula cuánto podrías pagar de plusvalía municipal al vender,
          heredar o recibir un inmueble.
        </p>
        <p className="mt-2 text-sm text-ink-500">
          Sevilla y provincia · Normativa vigente (RD-ley 26/2021 y
          actualizaciones) · Gratis y sin registro · Tus datos no salen de tu
          navegador
        </p>
      </header>

      <PlusvaliaCalculator />

      <section
        aria-labelledby="como-funciona"
        className="no-print mt-16 max-w-3xl"
      >
        <h2 id="como-funciona" className="text-2xl font-bold text-brand-900">
          Cómo calcula la plusvalía esta herramienta
        </h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-ink-700">
          <li>
            <strong>Método objetivo:</strong> valor catastral del suelo ×
            coeficiente estatal o municipal según los años de tenencia × tipo de
            gravamen del municipio (art. 107 TRLHL).
          </li>
          <li>
            <strong>Método real:</strong> diferencia entre el valor de
            transmisión y el de adquisición, en la proporción que el suelo
            representa sobre el valor catastral total (arts. 104.5 y 107.5
            TRLHL).
          </li>
          <li>
            <strong>Comparación automática:</strong> si no hay incremento, la
            operación no está sujeta; si lo hay, se aplica la base más
            favorable.
          </li>
          <li>
            <strong>Bonificaciones y plazos:</strong> aplica las bonificaciones
            municipales cuando hay información suficiente e informa de plazos y
            posibles recargos por presentación fuera de plazo (art. 27 LGT).
          </li>
        </ol>
      </section>

      <section aria-labelledby="faq" className="no-print mt-16 max-w-3xl">
        <h2 id="faq" className="text-2xl font-bold text-brand-900">
          Preguntas frecuentes
        </h2>
        <dl className="mt-6 space-y-6">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-brand-800">{f.q}</dt>
              <dd className="mt-1 leading-relaxed text-ink-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
