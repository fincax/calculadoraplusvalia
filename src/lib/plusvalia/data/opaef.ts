/**
 * Gestión del IIVTNU en la provincia de Sevilla: el OPAEF (Organismo
 * Provincial de Asistencia Económica y Fiscal de la Diputación de Sevilla).
 *
 * Desde el 2 de septiembre de 2024, el OPAEF gestiona la plusvalía municipal
 * por AUTOLIQUIDACIÓN en 85 de los 106 municipios de la provincia (81,13 %),
 * tras modificar su Ordenanza General de Gestión, Recaudación e Inspección
 * (publicada en el BOP de Sevilla de 30/08/2024). El resto de municipios
 * —entre ellos Sevilla capital, con su Agencia Tributaria de Sevilla—
 * gestionan el impuesto por su cuenta.
 *
 * IMPORTANTE (regla de oro del proyecto): el OPAEF unifica el PROCEDIMIENTO
 * (cómo se graba, se presenta y se paga), NO las cifras. El tipo de gravamen,
 * los coeficientes y las bonificaciones los sigue fijando cada ayuntamiento
 * en su ordenanza fiscal. Por eso este dato es puramente informativo y NO
 * altera el cálculo: donde la ordenanza no está verificada, el motor sigue
 * aplicando los máximos legales, nunca cifras inventadas.
 *
 * Fuentes:
 *  - Diputación de Sevilla, «El OPAEF implanta el sistema de autoliquidación
 *    en la gestión de las plusvalías municipales» (30/08/2024).
 *    https://www.dipusevilla.es/comunicacion/noticias/El-OPAEF-implanta-el-sistema-de-autoliquidacion-en-la-gestion-de-las-plusvalias-municipales/
 *  - BOP de Sevilla de 30/08/2024 (modificación de la Ordenanza General de
 *    Gestión, Recaudación e Inspección de la Diputación de Sevilla).
 *  - Sede electrónica del OPAEF (plusvalías): https://sede.opaef.es
 *
 * Nota sobre la limitación del entorno: el proxy de egreso bloquea los
 * dominios de la Diputación y del OPAEF, por lo que la lista exacta de los 85
 * municipios delegados no pudo descargarse del BOP. Aquí solo se marcan como
 * `opaef` los municipios cuya delegación consta en fuentes citadas; el resto
 * se trata como `unknown` y la interfaz lo comunica de forma prudente (con
 * enlace a la sede del OPAEF para que la persona usuaria lo confirme).
 */

/** Sede electrónica del OPAEF para la plusvalía (autoliquidación y pago). */
export const OPAEF_SEDE_PLUSVALIA_URL =
  "https://sede.opaef.es/sede/tributos/plusvalias/index.html";

/** Fecha desde la que el OPAEF gestiona la plusvalía por autoliquidación. */
export const OPAEF_AUTOLIQUIDACION_SINCE = "2024-09-02";

/** Nº de municipios de la provincia con la plusvalía delegada en el OPAEF. */
export const OPAEF_MUNICIPIOS_COUNT = 85;

/** Nº total de municipios de la provincia de Sevilla. */
export const PROVINCE_MUNICIPIOS_COUNT = 106;

export type PlusvaliaGestor =
  /** Gestión del IIVTNU delegada en el OPAEF (autoliquidación desde 09/2024). */
  | "opaef"
  /** Gestión del IIVTNU por la propia agencia tributaria del ayuntamiento. */
  | "municipal"
  /** Sin constatar en fuentes: probablemente OPAEF (85 de 106), a confirmar. */
  | "unknown";

/**
 * Municipios cuya gestión del IIVTNU consta como delegada en el OPAEF (según
 * las fuentes citadas arriba). No es la lista completa de los 85: solo los
 * confirmados. Añadir aquí a medida que se confirmen (BOP 30/08/2024).
 */
const OPAEF_CONFIRMED: ReadonlySet<string> = new Set([
  "aguadulce",
  "alanis",
  "albaida-del-aljarafe",
  "alcala-del-rio",
  "alcolea-del-rio",
  "la-algaba",
  "algamitas",
  "almaden-de-la-plata",
  "almensilla",
  "aznalcazar",
  "aznalcollar",
  "badolatosa",
  "benacazon",
  "bollullos-de-la-mitacion",
  "brenes",
  "burguillos",
  "las-cabezas-de-san-juan",
  "mairena-del-alcor",
]);

/**
 * Municipios que gestionan el IIVTNU por su cuenta (agencia tributaria
 * propia), no a través del OPAEF. Sevilla capital lo hace mediante la
 * Agencia Tributaria de Sevilla (ATSe), dato verificado.
 */
const SELF_MANAGED_CONFIRMED: ReadonlySet<string> = new Set(["sevilla"]);

/** Clasifica cómo se gestiona la plusvalía de un municipio (procedimiento). */
export function plusvaliaGestor(municipalityCode: string): PlusvaliaGestor {
  if (SELF_MANAGED_CONFIRMED.has(municipalityCode)) return "municipal";
  if (OPAEF_CONFIRMED.has(municipalityCode)) return "opaef";
  return "unknown";
}

/** true solo si consta que la plusvalía del municipio la gestiona el OPAEF. */
export function isOpaefManaged(municipalityCode: string): boolean {
  return OPAEF_CONFIRMED.has(municipalityCode);
}
