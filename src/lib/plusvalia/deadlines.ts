import type {
  DeadlineInfo,
  SurchargeResult,
  TransferType,
} from "./types";

/**
 * Plazos de presentación (art. 110.2 TRLHL) y recargos por presentación
 * extemporánea sin requerimiento previo (art. 27 LGT, redacción de la
 * Ley 11/2021: 1 % fijo más 1 % adicional por cada mes completo de
 * retraso; a partir de 12 meses, 15 % más intereses de demora).
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Suma días hábiles (lunes–viernes) a una fecha ISO. No descuenta festivos. */
export function addBusinessDays(iso: string, businessDays: number): string {
  const d = new Date(iso + "T00:00:00Z");
  let remaining = businessDays;
  while (remaining > 0) {
    d.setTime(d.getTime() + MS_PER_DAY);
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) remaining -= 1;
  }
  return d.toISOString().slice(0, 10);
}

/** Suma meses naturales a una fecha ISO (equivalencia de fecha a fecha). */
export function addMonths(iso: string, months: number): string {
  const d = new Date(iso + "T00:00:00Z");
  const targetMonth = d.getUTCMonth() + months;
  const result = new Date(
    Date.UTC(d.getUTCFullYear(), targetMonth, d.getUTCDate())
  );
  // Si el día no existe en el mes destino (p. ej. 31 → febrero), retrocede al último día.
  if (result.getUTCMonth() !== ((targetMonth % 12) + 12) % 12) {
    result.setUTCDate(0);
  }
  return result.toISOString().slice(0, 10);
}

export function getDeadline(
  transferType: TransferType,
  transferDateISO: string
): DeadlineInfo {
  if (transferType === "herencia") {
    return {
      description:
        "Transmisión mortis causa: 6 meses desde el fallecimiento, prorrogables hasta un año a solicitud del sujeto pasivo antes del vencimiento.",
      estimatedDeadline: addMonths(transferDateISO, 6),
      legalBasis: "Art. 110.2.b) TRLHL (RD Legislativo 2/2004)",
    };
  }
  return {
    description:
      "Transmisión inter vivos: 30 días hábiles desde la fecha de devengo (la estimación no descuenta festivos locales o nacionales).",
    estimatedDeadline: addBusinessDays(transferDateISO, 30),
    legalBasis: "Art. 110.2.a) TRLHL (RD Legislativo 2/2004)",
  };
}

/** Meses completos de retraso entre el fin de plazo y la presentación. */
export function monthsBetween(fromISO: string, toISO: string): number {
  const from = new Date(fromISO + "T00:00:00Z");
  const to = new Date(toISO + "T00:00:00Z");
  if (to <= from) return 0;
  let months =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    (to.getUTCMonth() - from.getUTCMonth());
  if (to.getUTCDate() < from.getUTCDate()) months -= 1;
  return Math.max(0, months);
}

export function computeSurcharge(
  deadlineISO: string | undefined,
  filingISO: string | undefined,
  taxDue: number
): SurchargeResult {
  const legalBasis = "Art. 27 LGT (Ley 58/2003, redacción Ley 11/2021)";

  if (!deadlineISO || !filingISO || filingISO <= deadlineISO) {
    return {
      applicable: false,
      legalBasis,
      description:
        "Presentación dentro de plazo: no se devengan recargos por extemporaneidad.",
    };
  }

  const monthsLate = monthsBetween(deadlineISO, filingISO);

  if (monthsLate >= 12) {
    const pct = 15;
    return {
      applicable: true,
      monthsLate,
      surchargePercentage: pct,
      surchargeAmount: round2((taxDue * pct) / 100),
      interestNote:
        "Además del recargo del 15 %, se exigen intereses de demora desde el día siguiente al duodécimo mes de retraso (no incluidos en esta estimación).",
      legalBasis,
      description: `Presentación con más de 12 meses de retraso: recargo del 15 % más intereses de demora.`,
    };
  }

  // 1 % fijo + 1 % por cada mes completo de retraso.
  const pct = 1 + monthsLate;
  return {
    applicable: true,
    monthsLate,
    surchargePercentage: pct,
    surchargeAmount: round2((taxDue * pct) / 100),
    legalBasis,
    description: `Presentación extemporánea sin requerimiento previo con ${monthsLate} mes(es) completo(s) de retraso: recargo del ${pct} % (1 % fijo + 1 % por mes completo).`,
  };
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
