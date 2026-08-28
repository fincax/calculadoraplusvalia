import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FINCAX — Servicios inmobiliarios en Sevilla",
  description:
    "Vende, hereda o dona tu inmueble con seguridad. Calcula gratis la plusvalía municipal (IIVTNU) en Sevilla y provincia con la calculadora de FINCAX.",
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <section className="rounded-2xl bg-brand-900 px-8 py-14 text-white">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent-400">
          FINCAX · Sevilla y provincia
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
          ¿Vas a vender o has heredado un inmueble?
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-brand-100">
          Antes de firmar, conoce cuánto podrías pagar de plusvalía municipal.
          Nuestra calculadora aplica la normativa vigente, compara el método
          objetivo y el real, y te dice si tu operación podría no estar sujeta
          al impuesto.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/calculadora-plusvalia"
            className="rounded-lg bg-accent-500 px-6 py-3 font-semibold text-brand-950 shadow-lg transition-colors hover:bg-accent-400"
          >
            Calcular mi plusvalía gratis
          </Link>
          <a
            href="mailto:fincaxsevilla@gmail.com"
            className="rounded-lg border border-brand-300 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-800"
          >
            Hablar con FINCAX
          </a>
        </div>
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-3">
        {[
          {
            title: "Normativa al día",
            body: "Coeficientes estatales vigentes según la fecha exacta de devengo y ordenanza de Sevilla capital contrastada.",
          },
          {
            title: "El método más favorable",
            body: "Comparamos automáticamente el método objetivo y el incremento real, y detectamos si no hay incremento (no sujeción).",
          },
          {
            title: "Explicado paso a paso",
            body: "Cada cifra con su fórmula, su fuente normativa y los plazos de presentación. Imprime o guarda el informe en PDF.",
          },
        ].map((c) => (
          <article
            key={c.title}
            className="rounded-xl border border-ink-300 bg-white p-6"
          >
            <h2 className="font-semibold text-brand-800">{c.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">{c.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
