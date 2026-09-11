import type { ExemptionRule, MunicipalityTaxRules } from "../types";
import { isOpaefManaged, OPAEF_SEDE_PLUSVALIA_URL } from "./opaef";

/**
 * Reglas fiscales por municipio (versionadas por fecha de vigencia).
 *
 * Verificados con su ordenanza (PDF oficial cotejado): Sevilla capital,
 * Alcalá de Guadaíra, Utrera, Mairena del Aljarafe y Écija. El resto de
 * municipios de la provincia de Sevilla se calcula con los MÁXIMOS LEGALES
 * (tipo 30 % y coeficientes máximos estatales) marcados como
 * `verified: false`, de modo que el resultado es una estimación de máximo
 * hasta verificar cada ordenanza. Para extender a nuevos municipios o
 * versiones basta con añadir registros a `MUNICIPALITY_RULES`.
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


/**
 * Municipios de la provincia con ordenanza COTEJADA (PDF oficial aportado el
 * 11/09/2026). Cada ficha cita el artículo del que sale cada dato; ver
 * docs/VERIFICACION_DATOS.md.
 */
const VERIFIED_AT_2026_09 = "2026-09-11";

/**
 * Alcalá de Guadaíra — texto consolidado de la ordenanza (modificaciones
 * BOP n.º 127 de 04/06/2022 y BOP n.º 86 de 08/05/2025, art. 9.3), firmado
 * el 09/05/2025. Tipo 30 % (art. 8.1); coeficientes máximos del art. 107.4
 * con actualización automática (art. 7.3); prorrateo por meses completos
 * (art. 6.4); bonificación mortis causa por vivienda habitual del causante
 * en cuatro tramos de VCS (art. 9); autoliquidación (art. 12).
 */
const ALCALA_DE_GUADAIRA: MunicipalityTaxRules = {
  municipalityCode: "alcala-de-guadaira",
  ineCode: "41004",
  municipalityName: "Alcalá de Guadaíra",
  province: "Sevilla",
  validFrom: "2022-06-05",
  taxRate: 30,
  coefficientsMode: "national_max",
  bonuses: [
    {
      id: "alcala-mortis-causa-vivienda",
      label:
        "Bonificación mortis causa por adquisición de la vivienda habitual del causante (art. 9 de la ordenanza)",
      appliesTo: ["herencia"],
      requiresPrimaryResidence: true,
      kinship:
        "Descendientes/adoptados, cónyuge y ascendientes/adoptantes (o quien reciba trato análogo para continuar en el uso de la vivienda)",
      tiers: [
        { upToLandCadastralValue: 60000, percentage: 95 },
        { upToLandCadastralValue: 100000, percentage: 75 },
        { upToLandCadastralValue: 138000, percentage: 50 },
        { percentage: 15 },
      ],
      conditions: [
        "Vivienda habitual = domicilio en el que el causante figuraba empadronado en Alcalá de Guadaíra al fallecer (o, por razones de salud acreditadas, en un centro residencial o en casa de uno de los adquirentes, si su domicilio anterior era esa vivienda).",
        "Quien adquiere debe mantener la vivienda durante los 3 años siguientes (salvo fallecimiento); si no, se paga la parte bonificada más intereses de demora.",
        "Se aplica en la propia autoliquidación y el Ayuntamiento la comprueba de oficio.",
      ],
    },
  ],
  notes: [
    "Alcalá de Guadaíra: tras una ponencia de valores general, el valor catastral del suelo se reduce un 20 % durante los 5 primeros años de efectividad de los nuevos valores (art. 7.2). Esta calculadora no aplica esa reducción: si te afecta, la cuota objetiva sería menor.",
  ],
  exemptions: COMMON_EXEMPTIONS,
  administrationMode: "self_assessment",
  officialSource:
    "Ordenanza fiscal reguladora del IIVTNU del Ayuntamiento de Alcalá de Guadaíra, texto consolidado con las modificaciones publicadas en el BOP de Sevilla n.º 127 de 04/06/2022 y n.º 86 de 08/05/2025 (PDF oficial cotejado el 11/09/2026). Oficina Virtual: https://ovc.alcaladeguadaira.es",
  publicationDate: "2025-05-08",
  lastVerifiedAt: VERIFIED_AT_2026_09,
  verified: true,
};

/**
 * Utrera — Ordenanza fiscal n.º 3, adaptada al RD-ley 26/2021 por acuerdo
 * plenario de 04/03/2022 (publicada por el Ayuntamiento en abril de 2022).
 * Tipo 28 % (art. 13); coeficientes del art. 107.4 con actualización anual
 * (art. 8); prorrateo por meses (art. 8); bonificación mortis causa del
 * art. 14 (95 %/50 % según VCS, de oficio). La ordenanza prevé gestión por
 * DECLARACIÓN (art. 17), pero desde el 02/09/2024 la plusvalía de Utrera la
 * gestiona el OPAEF por AUTOLIQUIDACIÓN (art. 49.3 de la Ordenanza General
 * del OPAEF, BOP n.º 169 de 30/08/2024): por eso hay dos vigencias.
 */
const UTRERA_BASE: Omit<
  MunicipalityTaxRules,
  "validFrom" | "validTo" | "administrationMode" | "officialSource"
> = {
  municipalityCode: "utrera",
  ineCode: "41095",
  municipalityName: "Utrera",
  province: "Sevilla",
  taxRate: 28,
  coefficientsMode: "national_max",
  bonuses: [
    {
      id: "utrera-mortis-causa-vivienda",
      label:
        "Bonificación mortis causa por la vivienda en la que estaba empadronado el causante (art. 14 de la ordenanza)",
      appliesTo: ["herencia"],
      requiresPrimaryResidence: true,
      kinship: "Descendientes/adoptados, cónyuge y ascendientes/adoptantes",
      tiers: [
        { upToLandCadastralValue: 30000, percentage: 95 },
        { upToLandCadastralValue: 99999.99, percentage: 50 },
      ],
      conditions: [
        "El causante debía figurar empadronado en la vivienda durante el año anterior al fallecimiento.",
        "95 % si el valor catastral del suelo es ≤ 30.000 €; 50 % si está entre 30.001 € y menos de 100.000 €; sin bonificación a partir de 100.000 €.",
        "Se aplica de oficio, sin necesidad de solicitarla.",
      ],
    },
  ],
  exemptions: COMMON_EXEMPTIONS,
  publicationDate: "2022-03-04",
  lastVerifiedAt: VERIFIED_AT_2026_09,
  verified: true,
};

const UTRERA_SOURCE =
  "Ordenanza fiscal n.º 3 del Ayuntamiento de Utrera, reguladora del IIVTNU, adaptada al RD-ley 26/2021 (acuerdo plenario de 04/03/2022; PDF oficial cotejado el 11/09/2026): https://www.utrera.org/wp-content/uploads/2022/04/02-Orden_03-IIVTNU-ADAPTADA-SCT182_21-RDL26_21-BOE-09_21.pdf";

const UTRERA_2022: MunicipalityTaxRules = {
  ...UTRERA_BASE,
  validFrom: "2022-04-01",
  validTo: "2024-09-01",
  administrationMode: "assessment",
  officialSource:
    UTRERA_SOURCE +
    " Gestión por declaración ante el Ayuntamiento (art. 17) hasta el 01/09/2024.",
};

const UTRERA_OPAEF: MunicipalityTaxRules = {
  ...UTRERA_BASE,
  validFrom: "2024-09-02",
  administrationMode: "self_assessment",
  officialSource:
    UTRERA_SOURCE +
    ` Desde el 02/09/2024 la gestión está delegada en el OPAEF por autoliquidación (art. 49.3 de la Ordenanza General de Gestión, Recaudación e Inspección, BOP de Sevilla n.º 169 de 30/08/2024): ${OPAEF_SEDE_PLUSVALIA_URL}`,
};

/**
 * Mairena del Aljarafe — texto íntegro publicado en el BOP de Sevilla
 * n.º 163 de 17/07/2023 (CVE BOP-SE-2023-163006), en vigor desde su
 * publicación. Tipo 30 % (art. 12.1); coeficientes máximos legales vigentes
 * con prorrateo por meses (art. 8.2); SIN bonificaciones; gestión por
 * declaración ante el Servicio de Recaudación (Solgest), art. 14; la opción
 * por el método real solo vale si la declaración se presenta en plazo
 * (art. 8.3).
 */
const MAIRENA_DEL_ALJARAFE: MunicipalityTaxRules = {
  municipalityCode: "mairena-del-aljarafe",
  ineCode: "41059",
  municipalityName: "Mairena del Aljarafe",
  province: "Sevilla",
  validFrom: "2023-07-17",
  taxRate: 30,
  coefficientsMode: "national_max",
  bonuses: [],
  additionalBonusNotes: [
    "La ordenanza de Mairena del Aljarafe no establece ninguna bonificación en la cuota (tampoco en herencias).",
  ],
  notes: [
    "Mairena del Aljarafe: para que se aplique el método real (plusvalía real inferior a la objetiva) hay que optar por él en la declaración presentada DENTRO de plazo; si se presenta fuera de plazo, se liquida por el método objetivo (art. 8.3 de la ordenanza).",
  ],
  exemptions: COMMON_EXEMPTIONS,
  administrationMode: "assessment",
  officialSource:
    "Ordenanza fiscal reguladora del IIVTNU del Ayuntamiento de Mairena del Aljarafe, texto íntegro en el BOP de Sevilla n.º 163 de 17/07/2023 (CVE BOP-SE-2023-163006; PDF cotejado el 11/09/2026). Se presenta por declaración ante el Servicio de Recaudación municipal (Solgest).",
  publicationDate: "2023-07-17",
  lastVerifiedAt: VERIFIED_AT_2026_09,
  verified: true,
};

/**
 * Écija — texto íntegro en el BOP de Sevilla n.º 102 de 06/05/2022 (en vigor
 * el mismo día). Tipo 28 % (art. 9); coeficientes máximos del art. 107.4 con
 * actualización automática (art. 8.3); prorrateo por meses (art. 7.4);
 * bonificación mortis causa del 95 % si el VCS ≤ 35.000 € (art. 10);
 * gestión por declaración ante el Ayuntamiento (art. 13).
 */
const ECIJA: MunicipalityTaxRules = {
  municipalityCode: "ecija",
  ineCode: "41039",
  municipalityName: "Écija",
  province: "Sevilla",
  validFrom: "2022-05-06",
  taxRate: 28,
  coefficientsMode: "national_max",
  bonuses: [
    {
      id: "ecija-mortis-causa-vivienda",
      label:
        "Bonificación mortis causa del 95 % por la vivienda habitual del causante con valor catastral del suelo ≤ 35.000 € (art. 10 de la ordenanza)",
      appliesTo: ["herencia"],
      requiresPrimaryResidence: true,
      kinship: "Descendientes y ascendientes (por naturaleza o adopción) y cónyuge",
      tiers: [{ upToLandCadastralValue: 35000, percentage: 95 }],
      conditions: [
        "Solo si el valor catastral del suelo del inmueble es igual o inferior a 35.000 €.",
        "Debe acreditarse con certificado de empadronamiento que era la vivienda habitual del causante.",
        "Quien adquiere debe mantener la vivienda durante los 3 años siguientes al fallecimiento; si no, se gira liquidación complementaria con intereses.",
        "Es rogada: hay que solicitarla en el impreso de la declaración dentro del plazo (6 meses desde el fallecimiento, prorrogables hasta un año).",
      ],
    },
  ],
  additionalBonusNotes: [
    "Écija contempla además un 95 % en transmisiones de terrenos sobre los que se desarrollen actividades económicas declaradas de especial interés o utilidad municipal por el Pleno (art. 10). No se aplica automáticamente.",
  ],
  notes: [
    "Écija: tras una ponencia de valores general, el valor catastral del suelo se reduce un 60/55/50/45/40 % en cada uno de los 5 primeros años de efectividad de los nuevos valores (art. 8.2). Esta calculadora no aplica esa reducción: si te afecta, la cuota objetiva sería menor.",
  ],
  exemptions: COMMON_EXEMPTIONS,
  administrationMode: "assessment",
  officialSource:
    "Ordenanza fiscal reguladora del IIVTNU del Ayuntamiento de Écija, texto íntegro en el BOP de Sevilla n.º 102 de 06/05/2022, págs. 17-23 (PDF cotejado el 11/09/2026). Se presenta por declaración ante el Ayuntamiento de Écija (art. 13).",
  publicationDate: "2022-05-06",
  lastVerifiedAt: VERIFIED_AT_2026_09,
  verified: true,
};

/** Municipios con ficha verificada propia (se excluyen del cálculo por máximos). */
const VERIFIED_PROVINCE_RULES: MunicipalityTaxRules[] = [
  ALCALA_DE_GUADAIRA,
  UTRERA_2022,
  UTRERA_OPAEF,
  MAIRENA_DEL_ALJARAFE,
  ECIJA,
];
const VERIFIED_CODES = new Set(VERIFIED_PROVINCE_RULES.map((r) => r.municipalityCode));

export const MUNICIPALITY_RULES: MunicipalityTaxRules[] = [
  SEVILLA_CAPITAL,
  ...VERIFIED_PROVINCE_RULES,
  ...PROVINCE_MUNICIPALITY_NAMES.filter(
    (name) => !VERIFIED_CODES.has(slugify(name))
  ).map(legalMaximumRules),
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
