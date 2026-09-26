/** URL pública del sitio (SEO, enlaces compartibles, crédito del embebido). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://fincax.es"
).replace(/\/+$/, "");

/**
 * Convierte la ruta actual en la URL pública equivalente. Dentro del iframe
 * (`/embed/calculadora-plusvalia/…`) el enlace compartible debe apuntar a la
 * página pública con cabecera, no a la versión embebida (no indexable).
 */
export function publicUrlFor(pathname: string): string {
  const path = pathname.replace(/^\/embed(?=\/)/, "");
  return SITE_URL + path;
}
