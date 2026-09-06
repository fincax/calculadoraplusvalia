import type { ExemptionRule, MunicipalityTaxRules } from "../types";
import { isOpaefManaged, OPAEF_SEDE_PLUSVALIA_URL } from "./opaef";

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

/**
 * Ficha de Sevilla capital, contrastada con el texto íntegro de la
 * Ordenanza fiscal reguladora del IIVTNU (aprobada por el Pleno el
 * 02/11/2023, definitiva por Resolución de 22/12/2023): tipo del 26,53 %
 * (art. 12.1), coeficientes máximos estatales vigentes (art. 8.2),
 * bonificaciones mortis causa del art. 12.3 y autoliquidación (art. 14).
 */
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
        "Bonificación mortis causa por adquisición de la vivienda habitual del causante (art. 12.3.a-c de la ordenanza)",
      appliesTo: ["herencia"],
      requiresPrimaryResidence: true,
      kinship: "Cónyuge, descendientes/adoptados o ascendientes/adoptantes",
      tiers: [
        { upToLandCadastralValue: 10000, percentage: 95 },
        { upToLandCadastralValue: 20000, percentage: 50 },
        { upToLandCadastralValue: 50000, percentage: 30 },
      ],
      conditions: [
        "El valor total de la herencia no puede superar 500.000 € (se acredita con la declaración del ISD o la escritura de adjudicación).",
        "La persona causante debía figurar empadronada en la vivienda al menos los 2 años anteriores al fallecimiento (o desde su adquisición si fue posterior; si residía en un centro asistencial, el requisito puede retrotraerse hasta 3 años a su última vivienda).",
        "El tramo se determina por el valor catastral del suelo de TODA la vivienda, no por la parte de cada heredero.",
        "Quien adquiere debe mantener la vivienda en su patrimonio al menos 3 años desde el devengo (salvo transmisión a descendientes, ascendientes o cónyuge del causante).",
        "Es una bonificación rogada: hay que solicitarla y autoliquidar dentro del plazo voluntario (6 meses, prorrogables) ante la Agencia Tributaria de Sevilla.",
      ],
    },
    {
      id: "sevilla-mortis-causa-otros-inmuebles",
      label:
        "Bonificación mortis causa del 10 % por otros inmuebles del causante (art. 12.3.e de la ordenanza)",
      appliesTo: ["herencia"],
      appliesOnlyIfNotPrimaryResidence: true,
      kinship: "Cónyuge, descendientes/adoptados o ascendientes/adoptantes",
      tiers: [{ percentage: 10 }],
      conditions: [
        "El valor total de la herencia no puede superar 500.000 €.",
        "Es una bonificación rogada: hay que solicitarla y autoliquidar dentro del plazo voluntario.",
        "Si el inmueble era un local afecto a la actividad económica del causante, puede corresponder un 40 % en lugar del 10 % (art. 12.3.d, con requisitos propios): consúltalo con la Agencia Tributaria de Sevilla.",
      ],
    },
  ],
  additionalBonusNotes: [
    "La ordenanza contempla además: 40 % mortis causa para inmuebles afectos a la actividad económica del causante (art. 12.3.d, requisitos de la exención del art. 4.Ocho de la Ley del IP y mantenimiento 3 años) y 80 % en transmisiones lucrativas para actividades de carácter benéfico o interés social declaradas de especial interés municipal por el Pleno (art. 12.7). Ninguna se aplica automáticamente en esta calculadora.",
  ],
  exemptions: COMMON_EXEMPTIONS,
  administrationMode: "self_assessment",
  officialSource:
    "Ordenanza fiscal reguladora del IIVTNU del Ayuntamiento de Sevilla, aprobada definitivamente el 22/12/2023 (texto íntegro cotejado). Publicación: https://www.sevilla.org/servicios/agencia-tributaria-de-sevilla/ordenanzas-fiscales",
  publicationDate: "2023-12-22",
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

/**
 * URLs oficiales donde consultar la ordenanza del IIVTNU de los principales
 * municipios, para acelerar su verificación (ver docs/VERIFICACION_DATOS.md).
 */
const OFFICIAL_ORDINANCE_URLS: Record<string, string> = {
  "dos-hermanas":
    "https://www.doshermanas.es/export/sites/ayto-dos-hermanas/concejalias/hacienda/hacienda/.galleries/DOCUMENTOS-Ordenanzas/2026/ORDENANZAS-FISCALES-Y-REGULADORAS-DE-LOS-PRECIOS-PUBLICOS-2026.pdf",
  "alcala-de-guadaira":
    "https://ovc.alcaladeguadaira.es/sta/CarpetaPublic/public?APP_CODE=STA&PAGE_CODE=ORDENANZAS_2024",
  "mairena-del-aljarafe":
    "https://www.mairenadelaljarafe.es/export/sites/mairena/.galleries/Ayuntamiento/Ordenanzas/Fiscales/03-Ordenanza-Fiscal-Reguladora-del-Impuesto-sobre-el-Incremento-de-Valor-de-los-Terrenos-de-Naturaleza-Urbana.pdf",
  "mairena-del-alcor":
    "https://ayuda.mairenadelalcor.es/hc/es/articles/32356338429202 (gestión delegada en el OPAEF)",
};

function legalMaximumRules(name: string): MunicipalityTaxRules {
  const code = slugify(name);
  const ordinanceUrl = OFFICIAL_ORDINANCE_URLS[code];
  // Donde consta que la plusvalía la gestiona el OPAEF, el régimen es de
  // autoliquidación (desde el 02/09/2024). Esto es un dato de PROCEDIMIENTO:
  // no cambia el tipo ni las bonificaciones, que siguen estimándose por
  // máximos legales hasta verificar la ordenanza municipal.
  const opaef = isOpaefManaged(code);
  return {
    municipalityCode: code,
    municipalityName: name,
    province: "Sevilla",
    validFrom: "2024-01-01",
    // Máximos legales como estimación conservadora (art. 108.1 TRLHL).
    taxRate: 30,
    coefficientsMode: "national_max",
    bonuses: [],
    exemptions: COMMON_EXEMPTIONS,
    administrationMode: opaef ? "self_assessment" : "unknown",
    officialSource:
      "Estimación con los límites del TRLHL (tipo máximo 30 %, coeficientes máximos estatales). Ordenanza fiscal municipal pendiente de verificación: " +
      (ordinanceUrl
        ? `consulta ${ordinanceUrl}`
        : "consulta la del ayuntamiento correspondiente o el Boletín Oficial de la Provincia de Sevilla (bop.dipusevilla.es).") +
      (opaef
        ? ` La gestión del IIVTNU está delegada en el OPAEF (autoliquidación desde el 02/09/2024): ${OPAEF_SEDE_PLUSVALIA_URL}`
        : ""),
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
