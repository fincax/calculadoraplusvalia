/** Utilidades de formato es-ES compartidas por la interfaz. */

export function formatEUR(v: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(v);
}

export function formatNumber(v: number, decimals = 2): string {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(v);
}

export function formatPct(v: number): string {
  return `${formatNumber(v)} %`;
}

export function formatDateES(iso?: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
