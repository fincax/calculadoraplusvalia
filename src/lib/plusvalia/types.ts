/**
 * Modelo de dominio del motor de cálculo del IIVTNU (Plusvalía Municipal).
 *
 * Este módulo es una librería pura de TypeScript: no depende de React,
 * Next.js ni de ningún componente de interfaz. Está diseñado para poder
 * extenderse a cualquier municipio de España añadiendo registros de
 * `MunicipalityTaxRules` sin tocar el motor.
 */

/** Tipo de transmisión que origina el devengo del impuesto. */
export type TransferType =
  | "compraventa" // transmisión onerosa inter vivos
  | "herencia" // transmisión lucrativa mortis causa
  | "donacion"; // transmisión lucrativa inter vivos

/** Derecho transmitido sobre el inmueble. */
export type RightKind =
  | "pleno_dominio"
  | "usufructo_vitalicio"
  | "usufructo_temporal"
  | "nuda_propiedad";

export interface RealRightInput {
  kind: RightKind;
  /** Edad del usufructuario en la fecha de devengo (usufructo vitalicio y nuda propiedad con usufructo vitalicio). */
  usufructuaryAge?: number;
  /** Duración en años del usufructo temporal (usufructo temporal y nuda propiedad con usufructo temporal). */
  usufructDurationYears?: number;
  /** Para nuda propiedad: naturaleza del usufructo que la grava. */
  underlyingUsufruct?: "vitalicio" | "temporal";
}

/** Regla de bonificación municipal sobre la cuota. */
export interface BonusRule {
  id: string;
  /** Descripción legible para el usuario. */
  label: string;
  /** Solo aplica a este tipo de transmisión (p. ej. mortis causa). */
  appliesTo: TransferType[];
  /**
   * Tramos por valor catastral del suelo. Si `upToLandCadastralValue` se
   * omite, el tramo aplica sin límite superior.
   */
  tiers: Array<{
    upToLandCadastralValue?: number;
    percentage: number; // 0..100
  }>;
  /** Condiciones que el usuario debe cumplir (se muestran, no se infieren). */
  conditions: string[];
  /** Solo vivienda habitual del causante. */
  requiresPrimaryResidence?: boolean;
  /** Parentescos admitidos, texto informativo. */
  kinship?: string;
}

/** Supuesto de exención o no sujeción que la calculadora sabe detectar o advertir. */
export interface ExemptionRule {
  id: string;
  label: string;
  description: string;
  legalBasis: string;
}

export type CoefficientsMode =
  /** El municipio aplica por remisión los coeficientes máximos estatales (art. 107.4 TRLHL). */
  | "national_max"
  /** El municipio aprueba coeficientes propios (≤ máximos estatales). */
  | "municipal_custom";

export type AdministrationMode = "self_assessment" | "assessment" | "unknown";

/**
 * Reglas fiscales de un municipio en un periodo de vigencia.
 * Un municipio puede tener varias versiones (vigencias) de sus reglas.
 */
export interface MunicipalityTaxRules {
  /** Código interno estable (slug). */
  municipalityCode: string;
  /** Código INE de 5 dígitos. */
  ineCode?: string;
  municipalityName: string;
  province: string;

  /** Vigencia (ISO yyyy-mm-dd, inclusive). */
  validFrom: string;
  validTo?: string;

  /** Tipo de gravamen en porcentaje (máximo legal: 30). */
  taxRate: number;

  /** Reducción potestativa del valor catastral tras ponencia (art. 107.3 TRLHL), en %. */
  cadastralReductionPercentage?: number;

  coefficientsMode: CoefficientsMode;
  /** Solo si coefficientsMode === "municipal_custom". Clave: años ("lt1", "1".."19", "gte20"). */
  coefficients?: Record<string, number>;

  bonuses: BonusRule[];
  exemptions?: ExemptionRule[];

  administrationMode?: AdministrationMode;

  /** Bonificaciones existentes que la calculadora no computa automáticamente (se muestran como aviso). */
  additionalBonusNotes?: string[];

  /** Fuente normativa (ordenanza fiscal, BOP…). */
  officialSource: string;
  publicationDate?: string;
  lastVerifiedAt: string;

  /**
   * true: datos contrastados con la ordenanza fiscal del municipio.
   * false: se aplican los máximos legales (tipo 30 % + coeficientes estatales)
   * como estimación de máximo, hasta verificar la ordenanza.
   */
  verified: boolean;
}

/** Datos de entrada del cálculo. */
export interface CalculationInput {
  municipalityCode: string;

  transferType: TransferType;

  /** Fecha de adquisición (ISO yyyy-mm-dd). */
  acquisitionDate: string;
  /** Fecha de transmisión / devengo (ISO yyyy-mm-dd). */
  transferDate: string;

  /** Valor de adquisición según título (escritura o valor ISD/ITP), en euros. */
  acquisitionValue: number;
  /** Valor de transmisión, en euros. */
  transferValue: number;

  /** Valor catastral total del inmueble en el año de devengo, en euros. */
  cadastralValueTotal: number;
  /** Valor catastral del suelo en el año de devengo, en euros. */
  cadastralValueLand: number;

  /** Porcentaje de titularidad transmitido (0–100]. Por defecto 100. */
  ownershipPercentage?: number;

  /** Derecho real transmitido. Por defecto pleno dominio. */
  realRight?: RealRightInput;

  /** Para bonificación mortis causa: ¿era la vivienda habitual del causante? */
  isPrimaryResidenceOfDeceased?: boolean;
  /** Para bonificación mortis causa: ¿el adquirente es cónyuge, descendiente o ascendiente? */
  isCloseRelative?: boolean;

  /** Dación en pago o ejecución hipotecaria de la vivienda habitual (exención art. 105.1.c TRLHL). */
  isDacionEnPago?: boolean;

  /** Fecha real/prevista de presentación, para calcular recargos (opcional, ISO). */
  filingDate?: string;
}

export interface CoefficientResolution {
  yearsHeld: number;
  /** Clave de la tabla aplicada ("lt1", "1".."19", "gte20"). */
  bracket: string;
  coefficient: number;
  /** Identificador de la tabla estatal aplicada según fecha de devengo. */
  tableId: string;
  tableLabel: string;
  tableSource: string;
}

export interface MethodResult {
  /** Base imponible del método, en euros (>= 0). */
  taxableBase: number;
  /** Cuota íntegra (base × tipo), en euros. */
  grossTax: number;
  /** Desglose paso a paso, legible. */
  steps: CalculationStep[];
}

export interface CalculationStep {
  label: string;
  /** Expresión o valor mostrado al usuario. */
  detail: string;
  /** Valor numérico en euros o coeficiente, para mostrar formateado. */
  amount?: number;
  kind?: "money" | "percent" | "coefficient" | "years" | "info";
}

export interface AppliedBonus {
  rule: BonusRule;
  percentage: number;
  amount: number;
  /** La bonificación está sujeta a requisitos que la calculadora no puede verificar. */
  conditional: boolean;
}

export interface DeadlineInfo {
  /** Plazo legal de presentación. */
  description: string;
  /** Fecha límite estimada (ISO), si es computable. */
  estimatedDeadline?: string;
  legalBasis: string;
}

export interface SurchargeResult {
  applicable: boolean;
  monthsLate?: number;
  surchargePercentage?: number;
  surchargeAmount?: number;
  interestNote?: string;
  legalBasis: string;
  description: string;
}

export type CalculationOutcome =
  /** No sujeto: no hay incremento de valor (art. 104.5 TRLHL). */
  | "not_subject_no_gain"
  /** Posible exención (p. ej. dación en pago de vivienda habitual). */
  | "possibly_exempt"
  /** Sujeto: cuota calculada. */
  | "taxable";

export interface CalculationResult {
  outcome: CalculationOutcome;

  input: CalculationInput;
  rules: MunicipalityTaxRules;

  /** Advertencias importantes (datos no verificados, límites del cálculo…). */
  warnings: string[];

  coefficient: CoefficientResolution;

  /** Porcentaje efectivo del derecho transmitido (titularidad × derecho real), 0–100. */
  effectiveSharePercentage: number;
  realRightValuationNote?: string;

  objectiveMethod: MethodResult;
  realMethod: MethodResult;

  /** Método aplicado (el más favorable). */
  chosenMethod: "objective" | "real";
  /** Ahorro por elegir el método más favorable. */
  savingsVsOtherMethod: number;

  /** Incremento real de valor del suelo imputable al derecho transmitido. */
  realGainOnLand: number;

  bonusesApplied: AppliedBonus[];
  totalBonusAmount: number;

  /** Cuota íntegra del método elegido. */
  grossTax: number;
  /** Cuota final tras bonificaciones. */
  finalTax: number;

  exemptionNotices: ExemptionRule[];

  deadline: DeadlineInfo;
  surcharge?: SurchargeResult;

  /** ¿Quién es el sujeto pasivo? */
  taxpayerNote: string;

  /** Fuentes normativas utilizadas. */
  sources: string[];
}
