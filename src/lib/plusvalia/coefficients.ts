import { PlusvaliaInputError } from "./errors";
import type { CoefficientResolution } from "./types";

/**
 * Tablas de coeficientes máximos estatales del art. 107.4 TRLHL, por
 * periodo de vigencia según la fecha de devengo.
 *
 * Claves de tramo: "lt1" (inferior a 1 año), "1".."19" (años completos),
 * "gte20" (20 años o más).
 */

export interface CoefficientTable {
  id: string;
  label: string;
  source: string;
  /** Vigencia por fecha de devengo, inclusive (ISO yyyy-mm-dd). */
  validFrom: string;
  validTo?: string;
  values: Record<string, number>;
}

/** Fecha de entrada en vigor del nuevo sistema (RD-ley 26/2021). */
export const REFORM_START_DATE = "2021-11-10";

export const STATE_COEFFICIENT_TABLES: CoefficientTable[] = [
  {
    id: "rdl26-2021",
    label: "RD-ley 26/2021 (devengos del 10/11/2021 al 31/12/2022)",
    source:
      "Real Decreto-ley 26/2021, de 8 de noviembre (BOE 09/11/2021), art. 107.4 TRLHL",
    validFrom: "2021-11-10",
    validTo: "2022-12-31",
    values: {
      lt1: 0.14,
      "1": 0.13,
      "2": 0.15,
      "3": 0.16,
      "4": 0.17,
      "5": 0.17,
      "6": 0.16,
      "7": 0.12,
      "8": 0.1,
      "9": 0.09,
      "10": 0.08,
      "11": 0.08,
      "12": 0.08,
      "13": 0.08,
      "14": 0.1,
      "15": 0.12,
      "16": 0.16,
      "17": 0.2,
      "18": 0.26,
      "19": 0.36,
      gte20: 0.45,
    },
  },
  {
    id: "lpge-2023",
    label: "Ley 31/2022, de PGE 2023 (devengos de 2023)",
    source:
      "Ley 31/2022, de 23 de diciembre, de Presupuestos Generales del Estado para 2023, art. 107.4 TRLHL",
    validFrom: "2023-01-01",
    validTo: "2023-12-31",
    values: {
      lt1: 0.15,
      "1": 0.15,
      "2": 0.14,
      "3": 0.15,
      "4": 0.17,
      "5": 0.18,
      "6": 0.19,
      "7": 0.18,
      "8": 0.15,
      "9": 0.12,
      "10": 0.1,
      "11": 0.09,
      "12": 0.09,
      "13": 0.09,
      "14": 0.09,
      "15": 0.1,
      "16": 0.13,
      "17": 0.17,
      "18": 0.23,
      "19": 0.29,
      gte20: 0.45,
    },
  },
  {
    id: "rdl8-2023",
    label: "RD-ley 8/2023 (devengos desde el 01/01/2024, vigente)",
    source:
      "Real Decreto-ley 8/2023, de 27 de diciembre, art. 107.4 TRLHL. La actualización del RD-ley 16/2025 para 2026 fue derogada por el Congreso (Resolución de 27/01/2026), por lo que esta tabla sigue vigente.",
    validFrom: "2024-01-01",
    values: {
      lt1: 0.15,
      "1": 0.15,
      "2": 0.14,
      "3": 0.14,
      "4": 0.16,
      "5": 0.18,
      "6": 0.19,
      "7": 0.2,
      "8": 0.19,
      "9": 0.15,
      "10": 0.12,
      "11": 0.1,
      "12": 0.09,
      "13": 0.09,
      "14": 0.09,
      "15": 0.09,
      "16": 0.1,
      "17": 0.13,
      "18": 0.17,
      "19": 0.23,
      gte20: 0.4,
    },
  },
];

/** Devuelve la tabla estatal vigente en la fecha de devengo (ISO). */
export function getStateTableForDate(transferDateISO: string): CoefficientTable {
  const table = STATE_COEFFICIENT_TABLES.find(
    (t) =>
      transferDateISO >= t.validFrom &&
      (t.validTo === undefined || transferDateISO <= t.validTo)
  );
  if (!table) {
    throw new PlusvaliaInputError(
      `No hay tabla de coeficientes vigente para la fecha de devengo ${transferDateISO}. ` +
        `El sistema actual solo es aplicable a devengos desde el ${REFORM_START_DATE}.`
    );
  }
  return table;
}

/**
 * Años completos transcurridos entre adquisición y transmisión
 * (art. 107.4 TRLHL: se toman años completos, sin fracciones; máximo 20).
 */
export function computeYearsHeld(
  acquisitionISO: string,
  transferISO: string
): number {
  const a = new Date(acquisitionISO + "T00:00:00Z");
  const t = new Date(transferISO + "T00:00:00Z");
  if (Number.isNaN(a.getTime()) || Number.isNaN(t.getTime())) {
    throw new PlusvaliaInputError(
      "Fechas de adquisición o transmisión no válidas."
    );
  }
  if (t <= a) {
    throw new PlusvaliaInputError(
      "La fecha de transmisión debe ser posterior a la de adquisición."
    );
  }
  let years = t.getUTCFullYear() - a.getUTCFullYear();
  const anniversaryNotReached =
    t.getUTCMonth() < a.getUTCMonth() ||
    (t.getUTCMonth() === a.getUTCMonth() && t.getUTCDate() < a.getUTCDate());
  if (anniversaryNotReached) years -= 1;
  return Math.max(0, years);
}

/** Tramo de la tabla para un nº de años completos. */
export function bracketForYears(yearsHeld: number): string {
  if (yearsHeld < 1) return "lt1";
  if (yearsHeld >= 20) return "gte20";
  return String(yearsHeld);
}

/**
 * Meses completos transcurridos entre dos fechas ISO (sin fracciones de mes).
 * Se usa para prorratear el coeficiente anual cuando el periodo de
 * generación es inferior a un año (art. 107.4 TRLHL, párrafo tercero).
 */
export function computeFullMonths(
  acquisitionISO: string,
  transferISO: string
): number {
  const a = new Date(acquisitionISO + "T00:00:00Z");
  const t = new Date(transferISO + "T00:00:00Z");
  let months =
    (t.getUTCFullYear() - a.getUTCFullYear()) * 12 +
    (t.getUTCMonth() - a.getUTCMonth());
  if (t.getUTCDate() < a.getUTCDate()) months -= 1;
  return Math.max(0, months);
}

/**
 * Resuelve el coeficiente aplicable: usa la tabla municipal propia si existe
 * y, en su defecto, la tabla máxima estatal vigente en la fecha de devengo.
 * Si el coeficiente municipal supera el máximo estatal, prevalece el estatal
 * (art. 107.4 TRLHL: los coeficientes municipales no pueden exceder los máximos).
 * En periodos inferiores a un año, el coeficiente anual se prorratea por el
 * número de meses completos (art. 107.4 TRLHL, párrafo tercero).
 */
export function resolveCoefficient(
  acquisitionISO: string,
  transferISO: string,
  municipalCoefficients?: Record<string, number>
): CoefficientResolution {
  const yearsHeld = computeYearsHeld(acquisitionISO, transferISO);
  const bracket = bracketForYears(yearsHeld);
  const stateTable = getStateTableForDate(transferISO);
  const stateValue = stateTable.values[bracket];

  let coefficient = stateValue;
  if (municipalCoefficients && municipalCoefficients[bracket] !== undefined) {
    coefficient = Math.min(municipalCoefficients[bracket], stateValue);
  }

  if (bracket === "lt1") {
    const monthsHeld = computeFullMonths(acquisitionISO, transferISO);
    const annualCoefficient = coefficient;
    coefficient = round6((annualCoefficient * monthsHeld) / 12);
    return {
      yearsHeld,
      monthsHeld,
      annualCoefficient,
      bracket,
      coefficient,
      tableId: stateTable.id,
      tableLabel: stateTable.label,
      tableSource: stateTable.source,
    };
  }

  return {
    yearsHeld,
    bracket,
    coefficient,
    tableId: stateTable.id,
    tableLabel: stateTable.label,
    tableSource: stateTable.source,
  };
}

function round6(v: number): number {
  return Math.round((v + Number.EPSILON) * 1e6) / 1e6;
}
