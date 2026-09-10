import type { Metadata } from "next";
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

/**
 * Layout raíz mínimo (html/body). El «chrome» del sitio vive en el grupo
 * (site); así la versión embebible (/embed/*) se sirve sin cabecera ni pie.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
