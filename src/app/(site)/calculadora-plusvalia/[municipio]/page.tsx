import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PlusvaliaCalculator from "@/components/calculator/PlusvaliaCalculator";
import {
  getRulesForDate,
  listMunicipalities,
} from "@/lib/plusvalia/data/municipalities";
import {
  OPAEF_SEDE_PLUSVALIA_URL,
  plusvaliaGestor,
} from "@/lib/plusvalia/data/opaef";
import { formatDateES, formatPct } from "@/lib/plusvalia/format";

/**
 * Páginas por municipio de la provincia (SEO local:
 * «calcular plusvalía municipal en {municipio}»). Sevilla capital se sirve
 * en la página principal /calculadora-plusvalia.
 */

export const dynamicParams = false;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fincax.es";

function provinceMunicipalities() {
  return listMunicipalities().filter((m) => m.code !== "sevilla");
}

export function generateStaticParams() {
  return provinceMunicipalities().map((m) => ({ municipio: m.code }));
}

const TODAY_ISO = new Date().toISOString().slice(0, 10);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ municipio: string }>;
}): Promise<Metadata> {
  const { municipio } = await params;
  const rules = getRulesForDate(municipio, TODAY_ISO);
  if (!rules || rules.municipalityCode === "sevilla") return {};
  const name = rules.municipalityName;
  return {
    title: `Calcular la Plusvalía Municipal en ${name} — Calculadora gratuita`,
    description: `Calcula la plusvalía municipal (IIVTNU) de ${name} (Sevilla) en 1 minuto: método objetivo y real, coeficientes vigentes, plazos y detección de no sujeción si vendes con pérdidas. Gratis y sin registro.`,
    alternates: { canonical: `/calculadora-plusvalia/${municipio}` },
    // Sin `openGraph` explícito: así Next.js aplica la imagen del fichero
    // global `opengraph-image.tsx` (declararlo la suprimiría). El og:title y
    // og:description se derivan de `title`/`description`.
  };
}

export default async function MunicipioPage({
  params,
}: {
  params: Promise<{ municipio: string }>;
}) {
  const { municipio } = await params;
  const rules = getRulesForDate(municipio, TODAY_ISO);
  if (!rules || rules.municipalityCode === "sevilla") notFound();

  const name = rules.municipalityName;
  const all = provinceMunicipalities();
  const index = all.findIndex((m) => m.code === municipio);
  const nearby = [
    ...all.slice(Math.max(0, index - 3), index),
    ...all.slice(index + 1, index + 4),
  ];

  const gestor = plusvaliaGestor(municipio);
  const dondeSePaga =
    gestor === "opaef"
      ? `En ${name} la gestión de la plusvalía municipal está delegada en el OPAEF (Organismo Provincial de Asistencia Económica y Fiscal de la Diputación de Sevilla). Desde el 2 de septiembre de 2024 se presenta y paga por autoliquidación en la sede electrónica del OPAEF.`
      : `${name} no figura entre los 85 municipios de la provincia que, según la relación publicada por la Diputación de Sevilla el 30 de agosto de 2024, tienen delegada la gestión de la plusvalía en el OPAEF. Por tanto, el impuesto se presenta y paga ante la propia agencia tributaria o tesorería del Ayuntamiento de ${name}. Como las delegaciones pueden cambiar, confírmalo en el ayuntamiento o en la sede electrónica del OPAEF.`;

  const faqs = [
    {
      q: `¿Dónde se paga la plusvalía municipal en ${name}?`,
      a: `${dondeSePaga} El OPAEF unifica cómo se presenta y se paga el impuesto, pero el tipo de gravamen y las bonificaciones los fija la ordenanza fiscal de cada ayuntamiento.`,
    },
    {
      q: `¿Y si vendo con pérdidas en ${name}?`,
      a: `Igual que en el resto de España: si no ha habido incremento de valor del suelo entre la compra y la venta, la transmisión no está sujeta al impuesto (art. 104.5 TRLHL). Debes acreditarlo aportando las escrituras de adquisición y transmisión.`,
    },
    {
      q: `¿Qué plazo tengo para pagar la plusvalía en ${name}?`,
      a: `30 días hábiles desde la transmisión en compraventas y donaciones, y 6 meses desde el fallecimiento en herencias (prorrogables hasta un año si se solicita antes de que venza el plazo).`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: `Calculadora de Plusvalía Municipal en ${name}`,
        url: `${SITE_URL}/calculadora-plusvalia/${municipio}`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        provider: {
          "@type": "RealEstateAgent",
          "@id": `${SITE_URL}/#organization`,
          name: "FINCAX",
          url: "https://fincax.es",
        },
        areaServed: `${name}, provincia de Sevilla, España`,
        inLanguage: "es",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Calculadora de Plusvalía Municipal",
            item: `${SITE_URL}/calculadora-plusvalia`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: name,
            item: `${SITE_URL}/calculadora-plusvalia/${municipio}`,
          },
        ],
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

      <nav aria-label="Miga de pan" className="no-print text-sm text-ink-500">
        <Link
          href="/calculadora-plusvalia"
          className="underline hover:text-accent-600"
        >
          Calculadora de Plusvalía Municipal
        </Link>{" "}
        / <span className="text-ink-900">{name}</span>
      </nav>

      <header className="no-print mt-4 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-600">
          Herramientas profesionales · Servicios que te ayudan a decidir
        </p>
        <h1 className="mt-2 text-3xl font-bold text-brand-900 sm:text-4xl">
          Calculadora de Plusvalía Municipal en {name}
        </h1>
        <p className="mt-3 text-lg text-ink-700">
          Calcula cuánto podrías pagar de plusvalía (IIVTNU) al vender, heredar
          o recibir un inmueble en {name}.
        </p>
      </header>

      <section
        aria-label={`Datos fiscales de ${name}`}
        className="no-print mt-6 max-w-3xl rounded-xl border border-ink-300 bg-white p-5 text-sm"
      >
        {rules.verified ? (
          <p className="text-ink-700">
            Datos contrastados con la ordenanza fiscal de {name}: tipo de
            gravamen del {formatPct(rules.taxRate)}.
          </p>
        ) : (
          <p className="text-ink-700">
            <strong className="text-ink-900">
              Estimación por máximos legales.
            </strong>{" "}
            La ordenanza fiscal de {name} está pendiente de verificación, por lo
            que esta calculadora aplica el tipo máximo legal (
            {formatPct(rules.taxRate)}) y los coeficientes máximos estatales: el
            resultado es <strong>lo máximo que podrías pagar</strong> y la cuota
            real puede ser inferior. Consulta la ordenanza del Ayuntamiento de{" "}
            {name} o el Boletín Oficial de la Provincia de Sevilla para el dato
            exacto.
          </p>
        )}
        <p className="mt-2 text-xs text-ink-500">
          Igual que en toda España: si no hay incremento de valor del suelo, la
          transmisión no está sujeta (art. 104.5 TRLHL); plazos de 30 días
          hábiles (compraventa/donación) o 6 meses (herencia). Datos revisados
          el {formatDateES(rules.lastVerifiedAt)}.
        </p>
      </section>

      <PlusvaliaCalculator initialMunicipalityCode={municipio} />

      <section
        aria-labelledby="donde-se-paga"
        className="no-print mt-16 max-w-3xl"
      >
        <h2 id="donde-se-paga" className="text-2xl font-bold text-brand-900">
          Dónde y cómo se paga la plusvalía en {name}
        </h2>
        <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-5">
          <p className="text-ink-700">{dondeSePaga}</p>
          <p className="mt-3 text-sm text-ink-700">
            <strong className="text-ink-900">Importante:</strong> el OPAEF
            unifica el <em>procedimiento</em> (cómo se graba, se presenta y se
            paga), pero el tipo de gravamen, los coeficientes y las
            bonificaciones los sigue fijando la ordenanza fiscal de cada
            ayuntamiento. Por eso, mientras no verifiquemos la ordenanza de{" "}
            {name}, esta calculadora estima por los máximos legales.
          </p>
          <a
            href={OPAEF_SEDE_PLUSVALIA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-lg border border-brand-700 px-5 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-white"
          >
            Ir a la sede del OPAEF (plusvalía) →
          </a>
        </div>
      </section>

      <section aria-labelledby="faq-municipio" className="no-print mt-16 max-w-3xl">
        <h2 id="faq-municipio" className="text-2xl font-bold text-brand-900">
          Preguntas frecuentes sobre la plusvalía en {name}
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

      <section aria-labelledby="otros-municipios" className="no-print mt-16">
        <h2 id="otros-municipios" className="text-xl font-bold text-brand-900">
          Plusvalía municipal en otros municipios cercanos
        </h2>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {nearby.map((m) => (
            <li key={m.code}>
              <Link
                href={`/calculadora-plusvalia/${m.code}`}
                className="text-ink-700 underline decoration-ink-300 underline-offset-2 hover:text-accent-600"
              >
                {m.name}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/calculadora-plusvalia"
              className="font-semibold text-brand-900 underline underline-offset-2 hover:text-accent-600"
            >
              Sevilla capital y todos los municipios →
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
