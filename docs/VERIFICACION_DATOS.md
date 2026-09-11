# Estado de verificación de datos municipales (IIVTNU)

Última revisión: **11/09/2026**

La calculadora distingue dos niveles de calidad de datos por municipio
(`verified` en `src/lib/plusvalia/data/municipalities.ts`):

- **Verificado** (`verified: true`): tipo de gravamen, coeficientes y
  bonificaciones contrastados con la ordenanza fiscal vigente.
- **Estimación por máximos** (`verified: false`): se aplican el tipo máximo
  legal (30 %, art. 108.1 TRLHL) y los coeficientes máximos estatales. El
  resultado es una **cota superior** de la cuota; la interfaz lo comunica.

## Normativa estatal (verificada)

| Norma | Vigencia (devengos) | Estado |
|---|---|---|
| RD-ley 26/2021 (coeficientes) | 10/11/2021 – 31/12/2022 | ✅ Verificada (BOE) |
| Ley 31/2022, PGE 2023 | 01/01/2023 – 31/12/2023 | ✅ Verificada (BOE) |
| RD-ley 8/2023 | desde 01/01/2024 | ✅ Verificada (BOE). El RD-ley 16/2025 (coeficientes 2026) fue **derogado** por Resolución del Congreso de 27/01/2026, por lo que esta tabla sigue vigente en 2026. |

## Municipios

| Municipio | Estado | Datos aplicados | Fuente a verificar |
|---|---|---|---|
| Sevilla | ✅ Verificado (texto íntegro cotejado) | Tipo 26,53 % (art. 12.1); coeficientes máximos estatales (art. 8.2); bonificaciones mortis causa: vivienda habitual 95/50/30 % por tramos de VCS de toda la vivienda (≤10.000 / 10.001–20.000 / 20.001–50.000 €) y 10 % otros inmuebles — ambas computadas; 40 % locales afectos y 80 % interés social solo informadas; caudal ≤500.000 €, empadronamiento 2 años (o desde adquisición; centros asistenciales: retrotraíble 3 años), mantenimiento 3 años, carácter rogado; autoliquidación (art. 14) | Ordenanza fiscal IIVTNU, aprobada por el Pleno el 02/11/2023 y definitiva por Resolución de 22/12/2023 (texto íntegro cotejado el 28/08/2026). [Web ATSe](https://www.sevilla.org/servicios/agencia-tributaria-de-sevilla/ordenanzas-fiscales) |
| Alcalá de Guadaíra | ✅ Verificado (PDF oficial cotejado el 11/09/2026) | Tipo **30 %** (art. 8.1); coeficientes máximos del art. 107.4 con actualización automática (art. 7.3); prorrateo por meses (art. 6.4); bonificación mortis causa por vivienda habitual del causante a descendientes/cónyuge/ascendientes en 4 tramos de VCS: ≤60.000 € 95 % · 60.001–100.000 € 75 % · 100.001–138.000 € 50 % · >138.000 € 15 % (art. 9); sin límite de caudal; empadronamiento del causante al fallecer (art. 9.3, modificado 2025); mantenimiento 3 años (art. 9.4); se aplica en la autoliquidación (art. 12). Reducción del 20 % del VCS los 5 años siguientes a una ponencia general (art. 7.2), solo informada | Texto consolidado con modificaciones del BOP n.º 127 (04/06/2022) y BOP n.º 86 (08/05/2025, art. 9.3), firmado 09/05/2025. [OVC Alcalá](https://ovc.alcaladeguadaira.es) |
| Utrera | ✅ Verificado (PDF oficial cotejado el 11/09/2026) | Tipo **28 %** (art. 13); coeficientes del art. 107.4 con actualización anual (art. 8); prorrateo por meses (art. 8); bonificación mortis causa (art. 14) a descendientes/cónyuge/ascendientes por la vivienda en la que el causante estuvo empadronado el año anterior: 95 % si VCS ≤ 30.000 €, 50 % si 30.001 ≤ VCS < 100.000 €, nada desde 100.000 €; **de oficio**; sin caudal ni mantenimiento. Gestión: la ordenanza dice declaración (art. 17), pero desde el 02/09/2024 la gestiona el **OPAEF por autoliquidación** (dos vigencias en el código) | Ordenanza n.º 3 adaptada al RD-ley 26/2021, acuerdo plenario 04/03/2022 ([PDF](https://www.utrera.org/wp-content/uploads/2022/04/02-Orden_03-IIVTNU-ADAPTADA-SCT182_21-RDL26_21-BOE-09_21.pdf)). **Pendiente:** confirmar que no hay modificación posterior a 2022 |
| Mairena del Aljarafe | ✅ Verificado (PDF del BOP cotejado el 11/09/2026) | Tipo **30 %** (art. 12.1); coeficientes máximos legales vigentes, prorrateo por meses (art. 8.2); **sin bonificaciones**; gestión por declaración ante el Servicio de Recaudación (Solgest), 30 días / 6 meses prorrogables (art. 14); la opción por el método real solo si se declara en plazo (art. 8.3, informado como aviso) | BOP de Sevilla n.º 163 de 17/07/2023, CVE BOP-SE-2023-163006 ([PDF](https://admbop.dipusevilla.es/export/sites/bop/.galleries/Documentos-Anuncios-en-PDF/firmado-1689548502645-final-791f0bfe-1.pdf)) |
| Écija | ✅ Verificado (PDF del BOP cotejado el 11/09/2026) | Tipo **28 %** (art. 9); coeficientes máximos del art. 107.4 con actualización automática (art. 8.3); prorrateo por meses (art. 7.4); bonificación mortis causa del **95 % solo si VCS ≤ 35.000 €**, vivienda habitual del causante (certificado de empadronamiento), descendientes/ascendientes/cónyuge, mantenimiento 3 años, rogada en la declaración (art. 10); 95 % actividades de especial interés municipal (solo informada); reducciones del VCS 60/55/50/45/40 % los 5 años tras ponencia general (art. 8.2, solo informada); gestión por declaración, 30 días hábiles / 6 meses prorrogables (art. 13) | BOP de Sevilla n.º 102 de 06/05/2022, págs. 17-23 ([PDF](https://www.dipusevilla.es/system/modules/com.saga.sagasuite.theme.diputacion.sevilla.corporativo/handlers/download-bop.pdf?id=cffd9f99-cc5e-11ec-a4b1-0050569fe27b)). **Pendiente:** confirmar que no hay modificación posterior a 2022 |
| Dos Hermanas | ⏳ Máximos | 30 % + coef. estatales. Un resumen no oficial indica 26,40 % en las Ordenanzas Fiscales 2026 (art. 2), **sin cotejar** | [Ordenanzas fiscales 2026 (PDF, IIVTNU desde la pág. impresa 47 = pág. PDF 51)](https://www.doshermanas.es/export/sites/ayto-dos-hermanas/concejalias/hacienda/hacienda/.galleries/DOCUMENTOS-Ordenanzas/2026/ORDENANZAS-FISCALES-Y-REGULADORAS-DE-LOS-PRECIOS-PUBLICOS-2026.pdf) |
| Mairena del Alcor | ⏳ Máximos | 30 % + coef. estatales | Gestión delegada en el [OPAEF](https://www.opaef.es) (Diputación de Sevilla) |
| Resto de la provincia (99 municipios) | ⏳ Máximos | 30 % + coef. estatales | Ordenanza municipal o [BOP de Sevilla](https://bop.dipusevilla.es). 85 municipios delegan la gestión en el **OPAEF**. |

> Nota: el intento de verificación automática desde este entorno no fue
> posible porque el proxy de red bloquea los dominios municipales y los
> agregadores fiscales. Los datos pre-reforma encontrados (p. ej. Dos
> Hermanas 25,16 % en su ordenanza de 2016) **no** se han usado por
> corresponder al sistema anulado por la STC 182/2021.
>
> Sevilla capital se verificó cotejando el **texto íntegro de su ordenanza**
> y el **BOE del RD-ley 26/2021** (documentos aportados el 28/08/2026). Ese
> cotejo confirmó además el **prorrateo del coeficiente anual por meses
> completos en periodos inferiores a un año** (art. 107.4 TRLHL, párr. 3.º),
> que el motor aplica desde entonces.

## Gestión del impuesto: el OPAEF (Diputación de Sevilla)

Dato de **procedimiento**, no de cuantía. Desde el **2 de septiembre de
2024**, el OPAEF gestiona la plusvalía municipal por **autoliquidación** en
**85 de los 106 municipios** de la provincia (81,13 %), tras modificar su
Ordenanza General de Gestión, Recaudación e Inspección (BOP de Sevilla de
30/08/2024). El resto —entre ellos **Sevilla capital**, con su Agencia
Tributaria de Sevilla— gestionan el impuesto por su cuenta.

**Clave:** el OPAEF unifica cómo se presenta y se paga, **no** el tipo de
gravamen, los coeficientes ni las bonificaciones, que los sigue fijando cada
ayuntamiento en su ordenanza. Por eso este dato **no altera el cálculo**: la
calculadora sigue estimando por máximos legales donde la ordenanza no está
verificada. Solo se usa para informar a la persona usuaria de dónde y cómo
presentar (con enlace a la sede del OPAEF).

Implementación: `src/lib/plusvalia/data/opaef.ts` clasifica cada municipio
como `opaef` (figura en la relación de 85 municipios delegados) o
`municipal` (no figura: gestión por el propio ayuntamiento, p. ej. Sevilla).
Los municipios `opaef` pasan a `administrationMode: "self_assessment"`.

- **Relación completa incorporada el 11/09/2026** (85 municipios, transcrita
  de la noticia de la Diputación de 30/08/2024 y aportada por el usuario):
  Aguadulce, Alanís, Albaida del Aljarafe, Alcalá del Río, Alcolea del Río,
  La Algaba, Algámitas, Almadén de la Plata, Almensilla, Aznalcázar,
  Aznalcóllar, Badolatosa, Benacazón, Bollullos de la Mitación, Brenes,
  Burguillos, Las Cabezas de San Juan, Camas, Cantillana, Carrión de los
  Céspedes, Castilblanco de los Arroyos, Castilleja de Guzmán, Castilleja de
  la Cuesta, Castilleja del Campo, El Castillo de las Guardas, Cazalla de la
  Sierra, Constantina, Coria del Río, Coripe, El Coronil, Los Corrales,
  Espartinas, Estepa, El Garrobo, Gelves, Gerena, Gilena, Gines, Guadalcanal,
  Guillena, Herrera, Huévar del Aljarafe, Lantejuela, Lora de Estepa, Lora
  del Río, La Luisiana, El Madroño, Mairena del Alcor, Marinaleda, Martín de
  la Jara, Los Molares, Las Navas de la Concepción, Olivares, Los Palacios y
  Villafranca, Palomares del Río, Paradas, Pedrera, El Pedroso, Peñaflor,
  Pilas, Pruna, La Puebla de los Infantes, La Puebla del Río, El Real de la
  Jara, La Roda de Andalucía, El Rubio, Salteras, San Juan de Aznalfarache,
  Sanlúcar la Mayor, San Nicolás del Puerto, El Saucejo, Tomares, Umbrete,
  Utrera, Valencina de la Concepción, Villamanrique de la Condesa,
  Villanueva del Ariscal, Villanueva del Río y Minas, Villanueva de San Juan,
  Villaverde del Río, El Viso del Alcor, Cañada Rosal, Isla Mayor, El Cuervo
  de Sevilla y El Palmar de Troya.
- **Los 21 municipios con gestión propia** (no delegada a 30/08/2024):
  Sevilla, Alcalá de Guadaíra, Arahal, Bormujos, La Campana, Carmona,
  Casariche, Dos Hermanas, Écija, Fuentes de Andalucía, Lebrija, Mairena del
  Aljarafe, Marchena, Montellano, Morón de la Frontera, Osuna, La Puebla de
  Cazalla, La Rinconada, El Ronquillo, Santiponce y Tocina.
- Ojo con los homónimos: **Alcalá del Río** (OPAEF) ≠ Alcalá de Guadaíra
  (propia); **Mairena del Alcor** (OPAEF) ≠ Mairena del Aljarafe (propia).
- Fuente: [Diputación de Sevilla — «El OPAEF implanta el sistema de
  autoliquidación en la gestión de las plusvalías municipales» (30/08/2024)](https://www.dipusevilla.es/comunicacion/noticias/El-OPAEF-implanta-el-sistema-de-autoliquidacion-en-la-gestion-de-las-plusvalias-municipales/)
  y BOP de Sevilla n.º 169 de 30/08/2024 (CVE BOP-SE-2024-169001; PDF
  cotejado el 11/09/2026). Su **art. 49.3** establece la autoliquidación del
  IIVTNU en los municipios delegados, con plazos de 30 días hábiles (inter
  vivos) y 6 meses desde el fallecimiento (prorrogables hasta un año si se
  pide antes de vencer; la prórroga se entiende concedida tácitamente).
- **Nota temporal:** la relación es una foto del 30/08/2024. Las delegaciones
  pueden cambiar; por eso la interfaz remite siempre a confirmar en la sede
  del OPAEF o en el ayuntamiento. Revisar anualmente.

> Nota: el proxy de red del entorno bloquea `dipusevilla.es` y `opaef.es`
> (solo funciona WebSearch), así que la relación se incorporó a partir de la
> transcripción aportada por el usuario, no de una descarga directa.

## Cómo verificar un municipio (proceso)

1. Localiza la ordenanza fiscal del IIVTNU vigente (web municipal o BOP).
2. Anota: tipo de gravamen, si aprueba coeficientes propios (y su tabla),
   reducción del art. 107.3 si existe, bonificaciones (porcentajes, tramos y
   requisitos) y si el régimen es autoliquidación o liquidación.
3. En `src/lib/plusvalia/data/municipalities.ts`, sustituye la entrada
   generada por `legalMaximumRules(...)` por un objeto `MunicipalityTaxRules`
   explícito con `verified: true`, `officialSource` (URL + fecha de
   publicación) y `lastVerifiedAt`.
4. Si el municipio cambió de reglas en el tiempo, añade **varias versiones**
   con `validFrom`/`validTo`: el motor selecciona la vigente en la fecha de
   devengo.
5. Añade un test en `src/lib/plusvalia/engine.test.ts` con un caso calculado
   a mano para ese municipio y ejecuta `npm test`.
