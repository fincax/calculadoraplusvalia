import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fincax.es";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FINCAX — Servicios inmobiliarios en Sevilla",
    template: "%s | FINCAX",
  },
  description:
    "FINCAX: servicios inmobiliarios en Sevilla y provincia. Calculadora de Plusvalía Municipal (IIVTNU), venta y asesoramiento de inmuebles.",
  openGraph: {
    siteName: "FINCAX",
    locale: "es_ES",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-brand-700 focus:shadow-lg"
        >
          Saltar al contenido principal
        </a>

        <header className="no-print bg-brand-900 text-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight"
              aria-label="FINCAX, inicio"
            >
              FINCA<span className="text-accent-400">X</span>
            </Link>
            <nav aria-label="Principal">
              <ul className="flex items-center gap-6 text-sm">
                <li>
                  <Link
                    href="/calculadora-plusvalia"
                    className="hover:text-accent-400 transition-colors"
                  >
                    Calculadora de plusvalía
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:fincaxsevilla@gmail.com"
                    className="rounded-md bg-accent-500 px-3 py-1.5 font-semibold text-brand-950 hover:bg-accent-400 transition-colors"
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

        <footer className="no-print mt-16 border-t border-ink-300 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-ink-500">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p>
                © {new Date().getFullYear()} FINCAX · Sevilla ·{" "}
                <a
                  className="underline hover:text-brand-700"
                  href="mailto:fincaxsevilla@gmail.com"
                >
                  fincaxsevilla@gmail.com
                </a>
              </p>
              <ul className="flex gap-4">
                <li>
                  <Link
                    href="/aviso-legal"
                    className="underline hover:text-brand-700"
                  >
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
              cuota definitiva del IIVTNU la determina la administración
              competente conforme a la ordenanza fiscal vigente.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
