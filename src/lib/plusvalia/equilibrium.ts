/**
 * Cálculo inverso: a partir del resto de datos, ¿a qué precio de venta
 * cambia el resultado? Útil para fijar precio antes de vender.
 *
 *  - «Precio de no sujeción»: por debajo (o igual) del valor de adquisición
 *    no hay incremento de valor del suelo, así que la transmisión no está
 *    sujeta (art. 104.5 TRLHL).
 *  - «Precio de equilibrio»: precio de venta a partir del cual el método
 *    objetivo (cuota fija) pasa a ser más favorable que el real (que crece
 *    con el precio). Por encima, la cuota queda topada en la objetiva.
 *
 * Lógica pura, sin dependencias de UI, para poder testearla.
 */

export interface EquilibriumParams {
  acquisitionValue: number;
  cadastralValueLand: number;
  cadastralValueTotal: number;
  /** Porcentaje efectivo transmitido (titularidad × derecho real), 0–100. */
  effectiveSharePercentage: number;
  taxRate: number;
  /** Cuota íntegra por el método objetivo (fija, no depende del precio). */
  objectiveGrossTax: number;
}

export interface EquilibriumResult {
  /** Precio de transmisión igual o inferior al cual no hay sujeción. */
  nonSubjectPrice: number;
  /** Precio a partir del cual el método objetivo es el más favorable. */
  breakEvenPrice?: number;
  objectiveGrossTax: number;
}

export function computeEquilibrium(
  params: EquilibriumParams
): EquilibriumResult {
  const {
    acquisitionValue,
    cadastralValueLand,
    cadastralValueTotal,
    effectiveSharePercentage,
    taxRate,
    objectiveGrossTax,
  } = params;

  const landProportion =
    cadastralValueTotal > 0 ? cadastralValueLand / cadastralValueTotal : 1;
  const share = effectiveSharePercentage / 100;
  const rate = taxRate / 100;

  // realTax(precio) = (precio − adquisición) × landProportion × share × rate.
  // Igualando a la cuota objetiva y despejando el precio de equilibrio.
  const slope = landProportion * share * rate;
  const breakEvenPrice =
    slope > 0
      ? round2(acquisitionValue + objectiveGrossTax / slope)
      : undefined;

  return {
    nonSubjectPrice: round2(acquisitionValue),
    breakEvenPrice,
    objectiveGrossTax: round2(objectiveGrossTax),
  };
}

function round2(v: number): number {
  return Math.round((v + Number.EPSILON) * 100) / 100;
}
