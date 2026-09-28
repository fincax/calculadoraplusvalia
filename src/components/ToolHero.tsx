import type { ReactNode } from "react";

/**
 * Cabecera de herramienta al estilo de fincax.es (valorador, simulador de
 * hipoteca): banda roja burdeos a todo lo ancho con patrón sutil, icono en
 * círculo blanco, título grande, subtítulo y «píldoras» de ventajas. El
 * contenido siguiente se superpone a su borde inferior (margen negativo).
 */
export default function ToolHero({
  eyebrow,
  title,
  subtitle,
  pills,
  stats,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
  pills: string[];
  stats?: { value: string; label: string }[];
  children?: ReactNode;
}) {
  return (
    <section className="fincax-hero no-print text-white">
      <div className="mx-auto max-w-4xl px-4 pb-28 pt-12 text-center sm:pt-14">
        {children}
        <div
          aria-hidden="true"
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-fincax-800 shadow-lg"
        >
          {/* Icono: calculadora */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="5" y="2.5" width="14" height="19" rx="2.5" />
            <rect x="8" y="5.5" width="8" height="4" rx="1" />
            <path d="M8.5 13h.01M12 13h.01M15.5 13h.01M8.5 16.5h.01M12 16.5h.01M15.5 16.5h.01" />
          </svg>
        </div>
        {eyebrow && (
          <p className="mt-6 text-xs font-bold uppercase tracking-widest text-white/75">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/90">
          {subtitle}
        </p>
        <ul className="mt-6 flex flex-wrap justify-center gap-2">
          {pills.map((p) => (
            <li
              key={p}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold ring-1 ring-white/20"
            >
              <svg
                aria-hidden="true"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
              {p}
            </li>
          ))}
        </ul>
        {stats && (
          <dl className="mx-auto mt-8 grid max-w-xl grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="text-xs text-white/80">{s.label}</dt>
                <dd className="text-2xl font-black sm:text-3xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
