/**
 * Conversión de importes escritos por la persona usuaria (formato es-ES o
 * neutro) a número. Vive en el motor (no en la UI) para poder testearlo:
 *   "150.000,50" → 150000.5 · "150.000" → 150000 · "1500.5" → 1500.5
 *   "1.234.567"  → 1234567  · "1.234"    → 1234    · "12.34"  → 12.34
 */
export function parseAmount(raw: string): number {
  const s = raw.trim();
  if (!s) return NaN;
  // Si hay coma, es el separador decimal es-ES y los puntos son de miles.
  if (s.includes(",")) return Number(s.replace(/\./g, "").replace(",", "."));
  const dots = s.match(/\./g)?.length ?? 0;
  if (dots > 1) return Number(s.replace(/\./g, ""));
  if (dots === 1) {
    const decimals = s.split(".")[1];
    // Un solo punto con exactamente tres dígitos detrás se lee como miles.
    return decimals.length === 3 ? Number(s.replace(".", "")) : Number(s);
  }
  return Number(s);
}
