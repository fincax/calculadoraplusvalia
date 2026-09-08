import type { RightKind, TransferType } from "./types";

/**
 * Enlace compartible del cálculo: serializa el estado del formulario a
 * parámetros de URL y lo reconstruye. Permite a FINCAX enviar un cálculo ya
 * preparado por WhatsApp/email y que la persona vuelva a su simulación.
 * Lógica pura (sin depender de la UI) para poder testearla.
 */

/** Campos serializables del formulario (todos como texto/booleano). */
export interface ShareState {
  municipalityCode: string;
  transferType: TransferType;
  acquisitionDate: string;
  transferDate: string;
  acquisitionValue: string;
  transferValue: string;
  cadastralValueTotal: string;
  cadastralValueLand: string;
  ownershipPercentage: string;
  rightKind: RightKind;
  usufructuaryAge: string;
  usufructDurationYears: string;
  underlyingUsufruct: "vitalicio" | "temporal";
  isPrimaryResidenceOfDeceased: boolean;
  isCloseRelative: boolean;
  isDacionEnPago: boolean;
  showLateFiling: boolean;
  filingDate: string;
  /** Nº de personas que adquieren a partes iguales (reparto de la cuota). */
  numberOfAcquirers: string;
}

// Campos de ShareState cuyo tipo es exactamente `string` (no una unión de
// literales como transferType/rightKind) y campos booleanos.
type StringField = {
  [K in keyof ShareState]: ShareState[K] extends string
    ? string extends ShareState[K]
      ? K
      : never
    : never;
}[keyof ShareState];
type BoolField = {
  [K in keyof ShareState]: ShareState[K] extends boolean ? K : never;
}[keyof ShareState];

// Mapa campo → clave corta en la URL.
const STRING_KEYS: Array<[StringField, string]> = [
  ["municipalityCode", "m"],
  ["acquisitionDate", "fa"],
  ["transferDate", "ft"],
  ["acquisitionValue", "va"],
  ["transferValue", "vt"],
  ["cadastralValueTotal", "ct"],
  ["cadastralValueLand", "cs"],
  ["ownershipPercentage", "ow"],
  ["usufructuaryAge", "ua"],
  ["usufructDurationYears", "ud"],
  ["filingDate", "fd"],
  ["numberOfAcquirers", "np"],
];
const BOOL_KEYS: Array<[BoolField, string]> = [
  ["isPrimaryResidenceOfDeceased", "pr"],
  ["isCloseRelative", "cr"],
  ["isDacionEnPago", "dp"],
  ["showLateFiling", "lf"],
];

const TRANSFER_TYPES: TransferType[] = ["compraventa", "herencia", "donacion"];
const RIGHT_KINDS: RightKind[] = [
  "pleno_dominio",
  "usufructo_vitalicio",
  "usufructo_temporal",
  "nuda_propiedad",
];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const AMOUNT_RE = /^[\d.,]{1,20}$/;

/** Serializa el estado a query string (solo campos con valor no trivial). */
export function encodeShareParams(state: ShareState): string {
  const p = new URLSearchParams();
  for (const [field, key] of STRING_KEYS) {
    const v = String(state[field] ?? "").trim();
    // No incluimos titularidad al 100 % (valor por defecto) para acortar.
    if (!v) continue;
    if (field === "ownershipPercentage" && v === "100") continue;
    if (field === "numberOfAcquirers" && v === "1") continue;
    p.set(key, v);
  }
  if (state.transferType !== "compraventa") p.set("t", state.transferType);
  if (state.rightKind !== "pleno_dominio") {
    p.set("rk", state.rightKind);
    if (state.rightKind === "nuda_propiedad") p.set("uu", state.underlyingUsufruct);
  }
  for (const [field, key] of BOOL_KEYS) {
    if (state[field]) p.set(key, "1");
  }
  return p.toString();
}

/** Reconstruye un estado parcial desde la query string, validando valores. */
export function decodeShareParams(search: string): Partial<ShareState> {
  const p = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search
  );
  const out: Partial<ShareState> = {};

  for (const [field, key] of STRING_KEYS) {
    const v = p.get(key);
    if (v === null) continue;
    if (field === "acquisitionDate" || field === "transferDate" || field === "filingDate") {
      if (DATE_RE.test(v)) out[field] = v;
    } else if (field === "numberOfAcquirers") {
      if (/^\d{1,2}$/.test(v) && Number(v) >= 1) out[field] = v;
    } else if (
      field === "acquisitionValue" ||
      field === "transferValue" ||
      field === "cadastralValueTotal" ||
      field === "cadastralValueLand" ||
      field === "ownershipPercentage" ||
      field === "usufructuaryAge" ||
      field === "usufructDurationYears"
    ) {
      if (AMOUNT_RE.test(v)) out[field] = v;
    } else {
      out[field] = v.slice(0, 64);
    }
  }

  const t = p.get("t");
  if (t && (TRANSFER_TYPES as string[]).includes(t)) {
    out.transferType = t as TransferType;
  }
  const rk = p.get("rk");
  if (rk && (RIGHT_KINDS as string[]).includes(rk)) {
    out.rightKind = rk as RightKind;
  }
  const uu = p.get("uu");
  if (uu === "vitalicio" || uu === "temporal") out.underlyingUsufruct = uu;

  for (const [field, key] of BOOL_KEYS) {
    if (p.get(key) === "1") out[field] = true;
  }

  return out;
}

/** true si la query string contiene al menos un parámetro reconocible. */
export function hasShareParams(search: string): boolean {
  return Object.keys(decodeShareParams(search)).length > 0;
}
