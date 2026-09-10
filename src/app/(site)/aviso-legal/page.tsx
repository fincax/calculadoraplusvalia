import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso legal",
  description:
    "Aviso legal de FINCAX y condiciones de uso de la Calculadora de Plusvalía Municipal.",
  robots: { index: true, follow: true },
};

export default function AvisoLegalPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 leading-relaxed text-ink-700">
      <h1 className="text-3xl font-bold text-brand-900">Aviso legal</h1>

      <h2 className="mt-8 text-xl font-semibold text-brand-900">Titularidad</h2>
      <p className="mt-2">
        Este sitio web es titularidad de FINCAX (Sevilla). Contacto:
        fincaxsevilla@gmail.com.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-brand-900">
        Carácter orientativo de la calculadora
      </h2>
      <p className="mt-2">
        La Calculadora de Plusvalía Municipal (IIVTNU) ofrece estimaciones
        basadas en la normativa estatal vigente (arts. 104–110 del TRLHL, en la
        redacción del RD-ley 26/2021 y sus actualizaciones) y en los datos de
        las ordenanzas fiscales municipales de que disponemos, junto con la
        información introducida por la persona usuaria. Los resultados{" "}
        <strong>no constituyen asesoramiento fiscal ni jurídico</strong> y no
        sustituyen a la liquidación o autoliquidación oficial: la cuota
        definitiva la determina la administración competente. Cuando los datos
        de una ordenanza municipal no están verificados, la herramienta lo
        indica y aplica los máximos legales como estimación prudente.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-brand-900">
        Responsabilidad
      </h2>
      <p className="mt-2">
        FINCAX no se hace responsable de las decisiones adoptadas exclusivamente
        sobre la base de los resultados de la herramienta ni de posibles
        divergencias con la liquidación administrativa. Para casos con
        bonificaciones, exenciones, derechos reales o cualquier duda, consulta
        con un profesional o con el ayuntamiento competente.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-brand-900">
        Propiedad intelectual
      </h2>
      <p className="mt-2">
        Los contenidos, marca y diseño de este sitio pertenecen a FINCAX. Los
        textos legales citados proceden de fuentes oficiales (BOE, boletines
        provinciales y sedes municipales).
      </p>
    </div>
  );
}
