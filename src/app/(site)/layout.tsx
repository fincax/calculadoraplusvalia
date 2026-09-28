import Image from "next/image";
import Link from "next/link";

/**
 * Layout del sitio público (cabecera + pie de FINCAX). La versión embebible
 * (`/embed/*`) NO usa este layout: se sirve sin «chrome» para integrarse en
 * webs de terceros mediante un iframe.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-brand-700 focus:shadow-lg"
      >
        Saltar al contenido principal
      </a>

      <header className="no-print sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <a href="https://fincax.es" aria-label="FINCAX Agencia Inmobiliaria, ir a la web principal">
            <Image
              src="/fincax-logo.png"
              alt="FINCAX Agencia Inmobiliaria"
              width={298}
              height={97}
              priority
              unoptimized
              className="h-11 w-auto"
            />
          </a>
          <nav aria-label="Principal">
            <ul className="flex items-center gap-5 text-sm font-semibold text-ink-700">
              <li className="hidden sm:block">
                <a
                  href="https://fincax.es/propiedades"
                  className="transition-colors hover:text-fincax-700"
                >
                  Propiedades
                </a>
              </li>
              <li className="hidden sm:block">
                <a
                  href="https://fincax.es/blog"
                  className="transition-colors hover:text-fincax-700"
                >
                  Blog
                </a>
              </li>
              <li className="hidden sm:block">
                <a
                  href="https://fincax.es"
                  className="transition-colors hover:text-fincax-700"
                >
                  fincax.es
                </a>
              </li>
              <li>
                <a
                  href="mailto:fincaxsevilla@gmail.com"
                  className="rounded-full bg-fincax-700 px-4 py-2 font-bold text-white shadow-sm transition-colors hover:bg-fincax-900"
                >
                  Contactar
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main id="contenido" className="flex-1">
        {children}
      </main>

      <footer className="no-print mt-20 border-t border-ink-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-ink-500">
          <a href="https://fincax.es" aria-label="FINCAX, ir a la web principal">
            <Image
              src="/fincax-logo.png"
              alt="FINCAX Agencia Inmobiliaria"
              width={298}
              height={97}
              unoptimized
              className="mb-5 h-10 w-auto"
            />
          </a>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} FINCAX · Sevilla ·{" "}
              <a className="underline hover:text-brand-700" href="https://fincax.es">
                fincax.es
              </a>{" "}
              ·{" "}
              <a
                className="underline hover:text-brand-700"
                href="mailto:fincaxsevilla@gmail.com"
              >
                fincaxsevilla@gmail.com
              </a>
            </p>
            <ul className="flex gap-4">
              <li>
                <Link href="/aviso-legal" className="underline hover:text-brand-700">
                  Aviso legal
                </Link>
              </li>
              <li>
                <Link
                  href="/politica-privacidad"
                  className="underline hover:text-brand-700"
                >
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>
          <p className="mt-4 max-w-3xl text-xs leading-relaxed">
            La información y los cálculos de este sitio tienen carácter
            orientativo y no constituyen asesoramiento fiscal ni jurídico. La
            cuota definitiva del IIVTNU la determina la administración competente
            conforme a la ordenanza fiscal vigente.
          </p>
        </div>
      </footer>
    </>
  );
}
