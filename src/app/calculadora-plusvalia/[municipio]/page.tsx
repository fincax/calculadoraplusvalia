import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PlusvaliaCalculator from "@/components/calculator/PlusvaliaCalculator";
import {
  getRulesForDate,
  listMunicipalities,
} from "@/lib/plusvalia/data/municipalities";
import { formatDateES, formatPct } from "@/lib/plusvalia/format";

/**
 * Páginas por municipio de la provincia (SEO local:
 * «calcular plusvalía municipal en {municipio}»). Sevilla capital se sirve
 * en la página principal /calculadora-plusvalia.
 */

export const dynamicParams = false;

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
    openGraph: {
      title: `Calculadora de Plusvalía Municipal en ${name} | FINCAX`,
      description: `Estima la plusvalía municipal de ${name} al vender, heredar o donar un inmueble, con la normativa vigente.`,
    },
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: `Calculadora de Plusvalía Municipal en ${name}`,
        url: `/calculadora-plusvalia/${municipio}`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        provider: {
          "@type": "Organization",
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
            item: "/calculadora-plusvalia",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: name,
            item: `/calculadora-plusvalia/${municipio}`,
          },
        ],
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
