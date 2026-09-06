import { REFORM_START_DATE, resolveCoefficient } from "./coefficients";
import { computeSurcharge, getDeadline } from "./deadlines";
import { getRulesForDate } from "./data/municipalities";
import { PlusvaliaInputError } from "./errors";
import { valuateRealRight } from "./realRights";
import type {
  AppliedBonus,
  CalculationInput,
  CalculationResult,
  CalculationStep,
  MethodResult,
  MunicipalityTaxRules,
} from "./types";

/**
 * Motor de cálculo del IIVTNU conforme a los arts. 104–110 del TRLHL
 * (RD Legislativo 2/2004) en su redacción dada por el RD-ley 26/2021.
 *
 * Calcula la base por el método objetivo y por el método real
 * (estimación directa), detecta la inexistencia de incremento de valor
 * (no sujeción, art. 104.5) y aplica automáticamente la alternativa más
 * favorable (art. 107.5), además de bonificaciones municipales,
 * porcentaje de titularidad y derechos reales.
 */

export { PlusvaliaInputError };

export function calculatePlusvalia(input: CalculationInput): CalculationResult {
  validateInput(input);

  const rules = getRulesForDate(input.municipalityCode, input.transferDate);
  if (!rules) {
    throw new PlusvaliaInputError(
      `No hay reglas fiscales para el municipio "${input.municipalityCode}" en la fecha indicada.`
    );
  }

  const warnings: string[] = [];
  const sources: string[] = [
    "Arts. 104–110 del Texto Refundido de la Ley Reguladora de las Haciendas Locales (RD Legislativo 2/2004), redacción del RD-ley 26/2021",
    rules.officialSource,
  ];

  if (input.transferDate < rules.validFrom) {
    warnings.push(
      `Las reglas municipales registradas para ${rules.municipalityName} tienen vigencia desde el ${rules.validFrom}; para devengos anteriores el tipo o las bonificaciones de la ordenanza podían ser distintos.`
    );
  }

  if (!rules.verified) {
    warnings.push(
      `Los datos de la ordenanza de ${rules.municipalityName} no están verificados: el cálculo aplica el tipo máximo legal (30 %) y los coeficientes máximos estatales, por lo que la cuota real puede ser inferior. Consulta la ordenanza fiscal del municipio.`
    );
  }

  // Aviso por devengo futuro: los coeficientes del método objetivo se
  // actualizan cada año (Ley de Presupuestos), así que una simulación con
  // fecha de un año posterior al actual puede variar cuando se apruebe la
  // tabla de ese ejercicio.
  const currentYear = new Date().getUTCFullYear();
  if (Number(input.transferDate.slice(0, 4)) > currentYear) {
    warnings.push(
      "La fecha de transmisión es de un año futuro: los coeficientes del método objetivo se actualizan cada año mediante la Ley de Presupuestos, por lo que la cuota definitiva de ese ejercicio podría diferir de esta estimación (calculada con la tabla vigente)."
    );
  }

  // Coeficiente según periodo de generación y tabla vigente en el devengo.
  const coefficient = resolveCoefficient(
    input.acquisitionDate,
    input.transferDate,
    rules.coefficientsMode === "municipal_custom" ? rules.coefficients : undefined
  );
  sources.push(coefficient.tableSource);

  // Porcentaje efectivo transmitido: titularidad × valoración del derecho real.
  const ownership = input.ownershipPercentage ?? 100;
  const rightValuation = valuateRealRight(input.realRight);
  const effectiveShare = round4((ownership * rightValuation.percentage) / 100);
  if (rightValuation.percentage !== 100) {
    sources.push(
      "Art. 107.2.b) TRLHL y art. 10.2 del TR de la Ley del ITPAJD (RD Legislativo 1/1993): valoración de derechos reales"
    );
  }

  const taxRate = rules.taxRate;

  // ── Método objetivo (art. 107 TRLHL) ──────────────────────────────────
  const objectiveLandValue = input.cadastralValueLand;
  const objectiveShareValue = (objectiveLandValue * effectiveShare) / 100;
  const objectiveBase = round2(objectiveShareValue * coefficient.coefficient);
  const objectiveTax = round2((objectiveBase * taxRate) / 100);

  const objectiveSteps: CalculationStep[] = [
    {
      label: "Valor catastral del suelo",
      detail: "Valor del terreno en el recibo del IBI del año de devengo",
      amount: objectiveLandValue,
      kind: "money",
    },
    ...(effectiveShare !== 100
      ? [
          {
            label: "Parte transmitida",
            detail: `${formatPct(ownership)} de titularidad × ${formatPct(rightValuation.percentage)} del derecho = ${formatPct(effectiveShare)}`,
            amount: round2(objectiveShareValue),
            kind: "money" as const,
          },
        ]
      : []),
    {
      label: "Periodo de generación",
      detail:
        coefficient.bracket === "lt1"
          ? `Inferior a 1 año (${coefficient.monthsHeld} mes(es) completo(s))`
          : coefficient.bracket === "gte20"
            ? "20 años o más"
            : `${coefficient.yearsHeld} años completos`,
      amount: coefficient.yearsHeld,
      kind: "years",
    },
    {
      label: "Coeficiente aplicable",
      detail:
        coefficient.bracket === "lt1"
          ? `${coefficient.tableLabel}. Coeficiente anual ${coefficient.annualCoefficient} prorrateado por ${coefficient.monthsHeld}/12 meses completos (art. 107.4 TRLHL)`
          : coefficient.tableLabel,
      amount: coefficient.coefficient,
      kind: "coefficient",
    },
    {
      label: "Base imponible objetiva",
      detail: `${formatEUR(round2(objectiveShareValue))} × ${coefficient.coefficient}`,
      amount: objectiveBase,
      kind: "money",
    },
    {
      label: "Cuota íntegra (método objetivo)",
      detail: `${formatEUR(objectiveBase)} × ${formatPct(taxRate)}`,
      amount: objectiveTax,
      kind: "money",
    },
  ];

  // ── Método real / estimación directa (arts. 104.5 y 107.5 TRLHL) ─────
  const landProportion =
    input.cadastralValueTotal > 0
      ? input.cadastralValueLand / input.cadastralValueTotal
      : 1;
  const totalGain = input.transferValue - input.acquisitionValue;
  const landGain = totalGain * landProportion;
  const realGainOnLand = round2((landGain * effectiveShare) / 100);
  const realBase = Math.max(0, realGainOnLand);
  const realTax = round2((realBase * taxRate) / 100);

  const realSteps: CalculationStep[] = [
    {
      label: "Diferencia entre valores de transmisión y adquisición",
      detail: `${formatEUR(input.transferValue)} − ${formatEUR(input.acquisitionValue)} (valores que constan en los títulos, sin gastos ni tributos)`,
      amount: round2(totalGain),
      kind: "money",
    },
    {
      label: "Proporción del suelo sobre el valor catastral total",
      detail: `${formatEUR(input.cadastralValueLand)} / ${formatEUR(input.cadastralValueTotal)} = ${formatPct(round2(landProportion * 100))}`,
      kind: "info",
    },
    {
      label: "Incremento real imputable al suelo",
      detail:
        effectiveShare !== 100
          ? `${formatEUR(round2(totalGain))} × ${formatPct(round2(landProportion * 100))} × ${formatPct(effectiveShare)}`
          : `${formatEUR(round2(totalGain))} × ${formatPct(round2(landProportion * 100))}`,
      amount: realGainOnLand,
      kind: "money",
    },
    {
      label: "Cuota íntegra (método real)",
      detail: `${formatEUR(realBase)} × ${formatPct(taxRate)}`,
      amount: realTax,
      kind: "money",
    },
  ];

  const objectiveMethod: MethodResult = {
    taxableBase: objectiveBase,
    grossTax: objectiveTax,
    steps: objectiveSteps,
  };
  const realMethod: MethodResult = {
    taxableBase: realBase,
    grossTax: realTax,
    steps: realSteps,
  };

  const deadline = getDeadline(input.transferType, input.transferDate);

  const taxpayerNote =
    input.transferType === "compraventa"
      ? "En las transmisiones onerosas (compraventa) el sujeto pasivo es quien transmite (persona vendedora). Si quien vende no reside en España, el impuesto lo ingresa como sustituto quien adquiere."
      : input.transferType === "herencia"
        ? "En las transmisiones mortis causa (herencia) el sujeto pasivo es quien adquiere (persona heredera o legataria)."
        : "En las donaciones el sujeto pasivo es quien adquiere (persona donataria).";

  const exemptionNotices = rules.exemptions ?? [];

  // ── No sujeción por inexistencia de incremento (art. 104.5) ──────────
  if (realGainOnLand <= 0) {
    return {
      outcome: "not_subject_no_gain",
      input,
      rules,
      warnings: [
        ...warnings,
        "Para acreditar la inexistencia de incremento deberás aportar los títulos de adquisición y transmisión (escrituras) al ayuntamiento; la no sujeción no es automática, hay que declararla.",
        "Si quien adquiere vuelve a transmitir en el futuro, su periodo de generación se contará desde la fecha de esta transmisión no sujeta (art. 107.4 TRLHL).",
      ],
      coefficient,
      effectiveSharePercentage: effectiveShare,
      realRightValuationNote:
        rightValuation.percentage !== 100 ? rightValuation.note : undefined,
      objectiveMethod,
      realMethod,
      chosenMethod: "real",
      savingsVsOtherMethod: objectiveTax,
      realGainOnLand,
      bonusesApplied: [],
      totalBonusAmount: 0,
      grossTax: 0,
      finalTax: 0,
      exemptionNotices,
      deadline,
      surcharge: undefined,
      taxpayerNote,
      sources,
    };
  }

  // ── Exención dación en pago / ejecución hipotecaria (art. 105.1.c) ───
  if (input.isDacionEnPago) {
    return {
      outcome: "possibly_exempt",
      input,
      rules,
      warnings: [
        ...warnings,
        "La exención por dación en pago o ejecución hipotecaria exige que se trate de la vivienda habitual del deudor (o su garante) y que no disponga de otros bienes suficientes para pagar la deuda. Debe acreditarse ante el ayuntamiento.",
      ],
      coefficient,
      effectiveSharePercentage: effectiveShare,
      realRightValuationNote:
        rightValuation.percentage !== 100 ? rightValuation.note : undefined,
      objectiveMethod,
      realMethod,
      chosenMethod: realTax <= objectiveTax ? "real" : "objective",
      savingsVsOtherMethod: round2(Math.abs(objectiveTax - realTax)),
      realGainOnLand,
      bonusesApplied: [],
      totalBonusAmount: 0,
      grossTax: Math.min(objectiveTax, realTax),
      finalTax: 0,
      exemptionNotices,
      deadline,
      surcharge: undefined,
      taxpayerNote,
      sources: [...sources, "Art. 105.1.c) TRLHL: exención por dación en pago de la vivienda habitual"],
    };
  }

  // ── Alternativa más favorable (art. 107.5) ───────────────────────────
  const chosenMethod = realTax < objectiveTax ? "real" : "objective";
  const grossTax = chosenMethod === "real" ? realTax : objectiveTax;
  const savings = round2(Math.abs(objectiveTax - realTax));

  if (chosenMethod === "real") {
    warnings.push(
      "El método real es más favorable, pero para aplicarlo deberás aportar los títulos de adquisición y transmisión al ayuntamiento (art. 107.5 TRLHL)."
    );
  }

  // ── Bonificaciones ───────────────────────────────────────────────────
  const bonusesApplied = resolveBonuses(input, rules, grossTax);
  const totalBonusAmount = round2(
    bonusesApplied.reduce((acc, b) => acc + b.amount, 0)
  );
  const finalTax = round2(Math.max(0, grossTax - totalBonusAmount));

  // ── Recargos por presentación extemporánea (opcional) ────────────────
  const surcharge = input.filingDate
    ? computeSurcharge(deadline.estimatedDeadline, input.filingDate, finalTax)
    : undefined;

  return {
    outcome: "taxable",
    input,
    rules,
    warnings,
    coefficient,
    effectiveSharePercentage: effectiveShare,
    realRightValuationNote:
      rightValuation.percentage !== 100 ? rightValuation.note : undefined,
    objectiveMethod,
    realMethod,
    chosenMethod,
    savingsVsOtherMethod: savings,
    realGainOnLand,
    bonusesApplied,
    totalBonusAmount,
    grossTax,
    finalTax,
    exemptionNotices,
    deadline,
    surcharge,
    taxpayerNote,
    sources,
  };
}

function resolveBonuses(
  input: CalculationInput,
  rules: MunicipalityTaxRules,
  grossTax: number
): AppliedBonus[] {
  const applied: AppliedBonus[] = [];
  for (const rule of rules.bonuses) {
    if (!rule.appliesTo.includes(input.transferType)) continue;
    if (rule.requiresPrimaryResidence && !input.isPrimaryResidenceOfDeceased)
      continue;
    if (
      rule.appliesOnlyIfNotPrimaryResidence &&
      input.isPrimaryResidenceOfDeceased
    )
      continue;
    if (input.transferType === "herencia" && !input.isCloseRelative) continue;

    const tier = rule.tiers.find(
      (t) =>
        t.upToLandCadastralValue === undefined ||
        input.cadastralValueLand <= t.upToLandCadastralValue
    );
    if (!tier || tier.percentage <= 0) continue;

    applied.push({
      rule,
      percentage: tier.percentage,
      amount: round2((grossTax * tier.percentage) / 100),
      conditional: rule.conditions.length > 0,
    });
  }
  return applied;
}

function validateInput(input: CalculationInput): void {
  const required: Array<[keyof CalculationInput, string]> = [
    ["municipalityCode", "el municipio"],
    ["acquisitionDate", "la fecha de adquisición"],
    ["transferDate", "la fecha de transmisión"],
  ];
  for (const [key, label] of required) {
    if (!input[key]) {
      throw new PlusvaliaInputError(`Falta ${label}.`);
    }
  }
  if (input.transferDate < REFORM_START_DATE) {
    throw new PlusvaliaInputError(
      `Esta calculadora aplica el sistema vigente desde el ${formatDateES(REFORM_START_DATE)} (RD-ley 26/2021). ` +
        "Para devengos anteriores, el método objetivo previo fue declarado inconstitucional (STC 182/2021): consulta a un profesional."
    );
  }
  for (const [key, label] of [
    ["acquisitionValue", "el valor de adquisición"],
    ["transferValue", "el valor de transmisión"],
    ["cadastralValueTotal", "el valor catastral total"],
    ["cadastralValueLand", "el valor catastral del suelo"],
  ] as Array<[keyof CalculationInput, string]>) {
    const v = input[key];
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0) {
      throw new PlusvaliaInputError(`Revisa ${label}: debe ser un importe válido.`);
    }
  }
  if (input.cadastralValueLand > input.cadastralValueTotal) {
    throw new PlusvaliaInputError(
      "El valor catastral del suelo no puede ser mayor que el valor catastral total."
    );
  }
  if (input.cadastralValueTotal <= 0) {
    throw new PlusvaliaInputError(
      "El valor catastral total debe ser mayor que cero (consulta tu recibo de IBI o la sede del Catastro)."
    );
  }
  const ownership = input.ownershipPercentage ?? 100;
  if (ownership <= 0 || ownership > 100) {
    throw new PlusvaliaInputError(
      "El porcentaje de titularidad debe estar entre 0 y 100."
    );
  }
}

// ── Utilidades de formato/redondeo internas ────────────────────────────
export function round2(v: number): number {
  return Math.round((v + Number.EPSILON) * 100) / 100;
}

function round4(v: number): number {
  return Math.round((v + Number.EPSILON) * 10000) / 10000;
}

function formatEUR(v: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(v);
}

function formatPct(v: number): string {
  return `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(v)} %`;
}

function formatDateES(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
