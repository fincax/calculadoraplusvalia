/** Crédito discreto a FINCAX en la versión embebida (enlace a la web). */
export default function EmbedCredit() {
  return (
    <p className="mt-6 text-center text-xs text-ink-500">
      Calculadora de Plusvalía Municipal por{" "}
      <a
        href="https://fincax.es/calculadora-plusvalia"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-brand-700 underline"
      >
        FINCAX
      </a>
      . Estimación orientativa; no constituye asesoramiento fiscal.
    </p>
  );
}
