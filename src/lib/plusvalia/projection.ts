import { bracketForYears, getStateTableForDate } from "./coefficients";

/**
 * Proyección de la cuota por el MÉTODO OBJETIVO según los años de tenencia
 * (1 a 20), con la tabla de coeficientes vigente en la fecha de devengo.
 *
 * Responde a «¿cuándo me conviene vender?»: como los coeficientes del
 * art. 107.4 TRLHL no son monótonos, esperar un año puede subir o bajar la
 * cuota objetiva. No sustituye al cálculo real (que depende del precio de
 * venta), solo ilustra la componente objetiva a igualdad del resto de datos.
 */

export interface ProjectionRow {
  years: number;
  coefficient: number;
  base: number;
  tax: number;
}

export interface ProjectionParams {
  cadastralValueLand: number;
  /** Porcentaje efectivo transmitido (titularidad × derecho real), 0–100. */
  effectiveSharePercentage: number;
  /** Tipo de gravamen del municipio, en %. */
  taxRate: number;
  /** Fecha de devengo (ISO) para elegir la tabla estatal aplicable. */
  transferDateISO: string;
  /** Coeficientes municipales propios (si los hubiera); nunca superan el máximo. */
  municipalCoefficients?: Record<string, number>;
  /** Número máximo de años a proyectar (por defecto 20). */
  maxYears?: number;
}

export function projectObjectiveTaxByYears(
  params: ProjectionParams
): ProjectionRow[] {
  const {
    cadastralValueLand,
    effectiveSharePercentage,
    taxRate,
    transferDateISO,
    municipalCoefficients,
    maxYears = 20,
  } = params;

  const table = getStateTableForDate(transferDateISO);
  const shareValue = (cadastralValueLand * effectiveSharePercentage) / 100;
  const rows: ProjectionRow[] = [];

  for (let years = 1; years <= maxYears; years++) {
    const bracket = bracketForYears(years);
    const stateValue = table.values[bracket];
    let coefficient = stateValue;
    if (
      municipalCoefficients &&
      municipalCoefficients[bracket] !== undefined
    ) {
      coefficient = Math.min(municipalCoefficients[bracket], stateValue);
    }
    const base = round2(shareValue * coefficient);
    const tax = round2((base * taxRate) / 100);
    rows.push({ years, coefficient, base, tax });
  }
  return rows;
}

function round2(v: number): number {
  return Math.round((v + Number.EPSILON) * 100) / 100;
}
