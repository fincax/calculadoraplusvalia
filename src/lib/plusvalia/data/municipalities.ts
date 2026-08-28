import type { ExemptionRule, MunicipalityTaxRules } from "../types";

/**
 * Reglas fiscales por municipio (versionadas por fecha de vigencia).
 *
 * FASE 1: Sevilla capital con datos contrastados con su ordenanza fiscal;
 * el resto de municipios de la provincia de Sevilla se calcula con los
 * MÁXIMOS LEGALES (tipo 30 % y coeficientes máximos estatales) marcados
 * como `verified: false`, de modo que el resultado es una estimación de
 * máximo hasta verificar cada ordenanza. Para extender a nuevos municipios
 * o versiones basta con añadir registros a `MUNICIPALITY_RULES`.
 */

const LAST_REVIEW = "2026-08-28";

/** Supuestos estatales de no sujeción / exención que conviene conocer. */
export const COMMON_EXEMPTIONS: ExemptionRule[] = [
  {
    id: "no-incremento",
    label: "Inexistencia de incremento de valor",
    description:
      "Si el valor del suelo no ha aumentado entre la adquisición y la transmisión, la operación no está sujeta. Debe acreditarse aportando los títulos de adquisición y transmisión.",
    legalBasis: "Art. 104.5 TRLHL",
  },
  {
    id: "dacion-en-pago",
    label: "Dación en pago o ejecución hipotecaria de la vivienda habitual",
    description:
      "Exentas las transmisiones de la vivienda habitual en dación en pago o ejecución hipotecaria, si el deudor (o su garante) no dispone de otros bienes para pagar la deuda.",
    legalBasis: "Art. 105.1.c) TRLHL",
  },
  {
    id: "gananciales",
    label: "Aportaciones y disoluciones de la sociedad de gananciales",
    description:
      "No están sujetas las aportaciones de bienes entre cónyuges a la sociedad conyugal, las adjudicaciones al disolverla ni las transmisiones entre cónyuges o a favor de los hijos en cumplimiento de sentencias de nulidad, separación o divorcio.",
    legalBasis: "Art. 104.3 TRLHL",
  },
  {
    id: "terreno-rustico",
    label: "Terrenos rústicos",
    description:
      "El impuesto solo grava terrenos de naturaleza urbana (o BICE). Los terrenos rústicos a efectos del IBI no están sujetos.",
    legalBasis: "Art. 104.2 TRLHL",
  },
];

/** Ficha verificada de Sevilla capital. */
const SEVILLA_CAPITAL: MunicipalityTaxRules = {
  municipalityCode: "sevilla",
  ineCode: "41091",
  municipalityName: "Sevilla",
  province: "Sevilla",
  validFrom: "2024-01-01",
  taxRate: 26.53,
  coefficientsMode: "national_max",
  bonuses: [
    {
      id: "sevilla-mortis-causa-vivienda",
      label:
        "Bonificación mortis causa por adquisición de la vivienda habitual del causante",
      appliesTo: ["herencia"],
      requiresPrimaryResidence: true,
      kinship: "Cónyuge, descendientes o ascendientes",
      tiers: [
        { upToLandCadastralValue: 10000, percentage: 95 },
        { upToLandCadastralValue: 20000, percentage: 50 },
        { upToLandCadastralValue: 50000, percentage: 30 },
      ],
      conditions: [
        "El valor total del caudal hereditario no puede superar 500.000 €.",
        "La persona causante debía estar empadronada en la vivienda al menos los 2 años anteriores al fallecimiento.",
        "El inmueble debe mantenerse en el patrimonio de quien adquiere durante los 3 años siguientes.",
        "Debe solicitarse expresamente al presentar la autoliquidación ante la Agencia Tributaria de Sevilla.",
      ],
    },
  ],
  additionalBonusNotes: [
    "La ordenanza de Sevilla contempla además bonificaciones mortis causa del 40 % para locales afectos a la actividad económica del causante y del 10 % para otros inmuebles, con requisitos propios. No se aplican automáticamente en esta calculadora: consúltalas con la Agencia Tributaria de Sevilla.",
  ],
  exemptions: COMMON_EXEMPTIONS,
  administrationMode: "self_assessment",
  officialSource:
    "Ordenanza fiscal reguladora del IIVTNU del Ayuntamiento de Sevilla (Agencia Tributaria de Sevilla): https://www.sevilla.org/servicios/agencia-tributaria-de-sevilla/ordenanzas-fiscales",
  lastVerifiedAt: LAST_REVIEW,
  verified: true,
};

/**
 * Municipios de la provincia de Sevilla (fase 1: estimación por máximos
 * legales hasta verificar cada ordenanza fiscal municipal).
 */
const PROVINCE_MUNICIPALITY_NAMES: string[] = [
  "Aguadulce",
  "Alanís",
  "Albaida del Aljarafe",
  "Alcalá de Guadaíra",
  "Alcalá del Río",
  "Alcolea del Río",
  "La Algaba",
  "Algámitas",
  "Almadén de la Plata",
  "Almensilla",
  "Arahal",
  "Aznalcázar",
  "Aznalcóllar",
  "Badolatosa",
  "Benacazón",
  "Bollullos de la Mitación",
  "Bormujos",
  "Brenes",
  "Burguillos",
  "Las Cabezas de San Juan",
  "Camas",
  "La Campana",
  "Cantillana",
  "Cañada Rosal",
  "Carmona",
  "Carrión de los Céspedes",
  "Casariche",
  "Castilblanco de los Arroyos",
  "El Castillo de las Guardas",
  "Castilleja de Guzmán",
  "Castilleja de la Cuesta",
  "Castilleja del Campo",
  "Cazalla de la Sierra",
  "Constantina",
  "Coria del Río",
  "Coripe",
  "El Coronil",
  "Los Corrales",
  "El Cuervo de Sevilla",
  "Dos Hermanas",
  "Écija",
  "Espartinas",
  "Estepa",
  "Fuentes de Andalucía",
  "El Garrobo",
  "Gelves",
  "Gerena",
  "Gilena",
  "Gines",
  "Guadalcanal",
  "Guillena",
  "Herrera",
  "Huévar del Aljarafe",
  "Isla Mayor",
  "Lantejuela",
  "Lebrija",
  "Lora de Estepa",
  "Lora del Río",
  "La Luisiana",
  "El Madroño",
  "Mairena del Alcor",
  "Mairena del Aljarafe",
  "Marchena",
  "Marinaleda",
  "Martín de la Jara",
  "Los Molares",
  "Montellano",
  "Morón de la Frontera",
  "Las Navas de la Concepción",
  "Olivares",
  "Osuna",
  "Los Palacios y Villafranca",
  "Palomares del Río",
  "El Palmar de Troya",
  "Paradas",
  "Pedrera",
  "El Pedroso",
  "Peñaflor",
  "Pilas",
  "Pruna",
  "La Puebla de Cazalla",
  "La Puebla de los Infantes",
  "La Puebla del Río",
  "El Real de la Jara",
  "La Rinconada",
  "La Roda de Andalucía",
  "El Ronquillo",
  "El Rubio",
  "Salteras",
  "San Juan de Aznalfarache",
  "San Nicolás del Puerto",
  "Sanlúcar la Mayor",
  "Santiponce",
  "El Saucejo",
  "Tocina",
  "Tomares",
  "Umbrete",
  "Utrera",
  "Valencina de la Concepción",
  "Villamanrique de la Condesa",
  "Villanueva de San Juan",
  "Villanueva del Ariscal",
  "Villanueva del Río y Minas",
  "Villaverde del Río",
  "El Viso del Alcor",
];

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function legalMaximumRules(name: string): MunicipalityTaxRules {
  return {
    municipalityCode: slugify(name),
    municipalityName: name,
    province: "Sevilla",
    validFrom: "2024-01-01",
    // Máximos legales como estimación conservadora (art. 108.1 TRLHL).
    taxRate: 30,
    coefficientsMode: "national_max",
    bonuses: [],
    exemptions: COMMON_EXEMPTIONS,
    administrationMode: "unknown",
    officialSource:
      "Estimación con los límites del TRLHL (tipo máximo 30 %, coeficientes máximos estatales). Ordenanza fiscal municipal pendiente de verificación: consulta la del ayuntamiento correspondiente o el Boletín Oficial de la Provincia de Sevilla.",
    lastVerifiedAt: LAST_REVIEW,
    verified: false,
  };
}

export const MUNICIPALITY_RULES: MunicipalityTaxRules[] = [
  SEVILLA_CAPITAL,
  ...PROVINCE_MUNICIPALITY_NAMES.map(legalMaximumRules),
];

/** Listado para el selector de la interfaz, orden alfabético con Sevilla primero. */
export function listMunicipalities(): Array<{
  code: string;
  name: string;
  verified: boolean;
}> {
  const seen = new Map<string, { code: string; name: string; verified: boolean }>();
  for (const r of MUNICIPALITY_RULES) {
    const existing = seen.get(r.municipalityCode);
    if (!existing || (r.verified && !existing.verified)) {
      seen.set(r.municipalityCode, {
        code: r.municipalityCode,
        name: r.municipalityName,
        verified: r.verified,
      });
    }
  }
  const all = [...seen.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "es")
  );
  const sevilla = all.filter((m) => m.code === "sevilla");
  return [...sevilla, ...all.filter((m) => m.code !== "sevilla")];
}

/**
 * Devuelve la versión de reglas del municipio vigente en la fecha indicada.
 * Si hay varias versiones, gana la de `validFrom` más reciente que cubra la fecha.
 */
export function getRulesForDate(
  municipalityCode: string,
  dateISO: string
): MunicipalityTaxRules | undefined {
  const candidates = MUNICIPALITY_RULES.filter(
    (r) =>
      r.municipalityCode === municipalityCode &&
      r.validFrom <= dateISO &&
      (r.validTo === undefined || dateISO <= r.validTo)
  ).sort((a, b) => b.validFrom.localeCompare(a.validFrom));
  if (candidates.length > 0) return candidates[0];

  // Devengos anteriores a la primera vigencia registrada: se usa la versión
  // más antigua disponible (el motor ya avisa de límites por fecha).
  const fallback = MUNICIPALITY_RULES.filter(
    (r) => r.municipalityCode === municipalityCode
  ).sort((a, b) => a.validFrom.localeCompare(b.validFrom));
  return fallback[0];
}
