/**
 * Gestión del IIVTNU en la provincia de Sevilla: el OPAEF (Organismo
 * Provincial de Asistencia Económica y Fiscal de la Diputación de Sevilla).
 *
 * Desde el 2 de septiembre de 2024, el OPAEF gestiona la plusvalía municipal
 * por AUTOLIQUIDACIÓN en 85 de los 106 municipios de la provincia (81,13 %),
 * tras modificar su Ordenanza General de Gestión, Recaudación e Inspección
 * (publicada en el BOP de Sevilla de 30/08/2024; su art. 49 regula la
 * autoliquidación del IIVTNU en los municipios que han delegado la gestión).
 * Los 21 restantes —entre ellos Sevilla capital, con su Agencia Tributaria
 * de Sevilla, y las grandes ciudades como Dos Hermanas, Alcalá de Guadaíra,
 * Mairena del Aljarafe o Écija— gestionan el impuesto por su cuenta.
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
 *    en la gestión de las plusvalías municipales» (30/08/2024), con la
 *    relación nominal de los 85 municipios (transcrita e incorporada el
 *    11/09/2026; ver docs/VERIFICACION_DATOS.md).
 *    https://www.dipusevilla.es/comunicacion/noticias/El-OPAEF-implanta-el-sistema-de-autoliquidacion-en-la-gestion-de-las-plusvalias-municipales/
 *  - BOP de Sevilla n.º 169, de 30/08/2024 (modificación de la Ordenanza
 *    General de Gestión, Recaudación e Inspección de la Diputación).
 *  - Sede electrónica del OPAEF (plusvalías): https://sede.opaef.es
 *
 * Nota temporal: la relación es una FOTO del 30/08/2024. Las delegaciones
 * pueden cambiar (nuevas delegaciones o revocaciones), por lo que la interfaz
 * siempre remite a confirmar en la sede del OPAEF o en el ayuntamiento.
 */

/** Sede electrónica del OPAEF para la plusvalía (autoliquidación y pago). */
export const OPAEF_SEDE_PLUSVALIA_URL =
  "https://sede.opaef.es/sede/tributos/plusvalias/index.html";

/** Fecha desde la que el OPAEF gestiona la plusvalía por autoliquidación. */
export const OPAEF_AUTOLIQUIDACION_SINCE = "2024-09-02";

/** Fecha de la relación oficial de municipios delegados (Diputación). */
export const OPAEF_LIST_AS_OF = "2024-08-30";

/** Nº de municipios de la provincia con la plusvalía delegada en el OPAEF. */
export const OPAEF_MUNICIPIOS_COUNT = 85;

/** Nº total de municipios de la provincia de Sevilla. */
export const PROVINCE_MUNICIPIOS_COUNT = 106;

export type PlusvaliaGestor =
  /** Gestión del IIVTNU delegada en el OPAEF (autoliquidación desde 09/2024). */
  | "opaef"
  /**
   * Gestión del IIVTNU por el propio ayuntamiento (no figura en la relación
   * de municipios delegados de 30/08/2024).
   */
  | "municipal";

/**
 * Los 85 municipios cuya gestión del IIVTNU está delegada en el OPAEF según
 * la relación publicada por la Diputación de Sevilla el 30/08/2024
 * (códigos = slug del nombre oficial, igual que en `municipalities.ts`).
 */
const OPAEF_DELEGATED: ReadonlySet<string> = new Set([
  "aguadulce", // Aguadulce
  "alanis", // Alanís
  "albaida-del-aljarafe", // Albaida del Aljarafe
  "alcala-del-rio", // Alcalá del Río
  "alcolea-del-rio", // Alcolea del Río
  "la-algaba", // La Algaba
  "algamitas", // Algámitas
  "almaden-de-la-plata", // Almadén de la Plata
  "almensilla", // Almensilla
  "aznalcazar", // Aznalcázar
  "aznalcollar", // Aznalcóllar
  "badolatosa", // Badolatosa
  "benacazon", // Benacazón
  "bollullos-de-la-mitacion", // Bollullos de la Mitación
  "brenes", // Brenes
  "burguillos", // Burguillos
  "las-cabezas-de-san-juan", // Las Cabezas de San Juan
  "camas", // Camas
  "cantillana", // Cantillana
  "carrion-de-los-cespedes", // Carrión de los Céspedes
  "castilblanco-de-los-arroyos", // Castilblanco de los Arroyos
  "castilleja-de-guzman", // Castilleja de Guzmán
  "castilleja-de-la-cuesta", // Castilleja de la Cuesta
  "castilleja-del-campo", // Castilleja del Campo
  "el-castillo-de-las-guardas", // El Castillo de las Guardas
  "cazalla-de-la-sierra", // Cazalla de la Sierra
  "constantina", // Constantina
  "coria-del-rio", // Coria del Río
  "coripe", // Coripe
  "el-coronil", // El Coronil
  "los-corrales", // Los Corrales
  "espartinas", // Espartinas
  "estepa", // Estepa
  "el-garrobo", // El Garrobo
  "gelves", // Gelves
  "gerena", // Gerena
  "gilena", // Gilena
  "gines", // Gines
  "guadalcanal", // Guadalcanal
  "guillena", // Guillena
  "herrera", // Herrera
  "huevar-del-aljarafe", // Huévar del Aljarafe
  "lantejuela", // Lantejuela
  "lora-de-estepa", // Lora de Estepa
  "lora-del-rio", // Lora del Río
  "la-luisiana", // La Luisiana
  "el-madrono", // El Madroño
  "mairena-del-alcor", // Mairena del Alcor
  "marinaleda", // Marinaleda
  "martin-de-la-jara", // Martín de la Jara
  "los-molares", // Los Molares
  "las-navas-de-la-concepcion", // Las Navas de la Concepción
  "olivares", // Olivares
  "los-palacios-y-villafranca", // Los Palacios y Villafranca
  "palomares-del-rio", // Palomares del Río
  "paradas", // Paradas
  "pedrera", // Pedrera
  "el-pedroso", // El Pedroso
  "penaflor", // Peñaflor
  "pilas", // Pilas
  "pruna", // Pruna
  "la-puebla-de-los-infantes", // La Puebla de los Infantes
  "la-puebla-del-rio", // La Puebla del Río
  "el-real-de-la-jara", // El Real de la Jara
  "la-roda-de-andalucia", // La Roda de Andalucía
  "el-rubio", // El Rubio
  "salteras", // Salteras
  "san-juan-de-aznalfarache", // San Juan de Aznalfarache
  "sanlucar-la-mayor", // Sanlúcar la Mayor
  "san-nicolas-del-puerto", // San Nicolás del Puerto
  "el-saucejo", // El Saucejo
  "tomares", // Tomares
  "umbrete", // Umbrete
  "utrera", // Utrera
  "valencina-de-la-concepcion", // Valencina de la Concepción
  "villamanrique-de-la-condesa", // Villamanrique de la Condesa
  "villanueva-del-ariscal", // Villanueva del Ariscal
  "villanueva-del-rio-y-minas", // Villanueva del Río y Minas
  "villanueva-de-san-juan", // Villanueva de San Juan
  "villaverde-del-rio", // Villaverde del Río
  "el-viso-del-alcor", // El Viso del Alcor
  "canada-rosal", // Cañada Rosal
  "isla-mayor", // Isla Mayor
  "el-cuervo-de-sevilla", // El Cuervo de Sevilla
  "el-palmar-de-troya", // El Palmar de Troya
]);

/** Clasifica cómo se gestiona la plusvalía de un municipio (procedimiento). */
export function plusvaliaGestor(municipalityCode: string): PlusvaliaGestor {
  return OPAEF_DELEGATED.has(municipalityCode) ? "opaef" : "municipal";
}

/** true si consta que la plusvalía del municipio la gestiona el OPAEF. */
export function isOpaefManaged(municipalityCode: string): boolean {
  return OPAEF_DELEGATED.has(municipalityCode);
}

/** Códigos de los municipios delegados en el OPAEF (solo lectura). */
export function opaefMunicipalityCodes(): readonly string[] {
  return [...OPAEF_DELEGATED];
}
