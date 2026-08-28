# Estado de verificación de datos municipales (IIVTNU)

Última revisión: **28/08/2026**

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
| Sevilla | ✅ Verificado | Tipo 26,53 %; coeficientes máximos estatales; bonificación mortis causa vivienda habitual 95/50/30 % por tramos de VCS (≤10.000 / ≤20.000 / ≤50.000 €), caudal ≤500.000 €, empadronamiento 2 años, mantenimiento 3 años; autoliquidación (ATSe) | [Ordenanzas fiscales — Agencia Tributaria de Sevilla](https://www.sevilla.org/servicios/agencia-tributaria-de-sevilla/ordenanzas-fiscales) |
| Dos Hermanas | ⏳ Máximos | 30 % + coef. estatales | [Ordenanzas fiscales 2026 (PDF)](https://www.doshermanas.es/export/sites/ayto-dos-hermanas/concejalias/hacienda/hacienda/.galleries/DOCUMENTOS-Ordenanzas/2026/ORDENANZAS-FISCALES-Y-REGULADORAS-DE-LOS-PRECIOS-PUBLICOS-2026.pdf) |
| Alcalá de Guadaíra | ⏳ Máximos | 30 % + coef. estatales | [Oficina Virtual del Contribuyente — Ordenanzas](https://ovc.alcaladeguadaira.es/sta/CarpetaPublic/public?APP_CODE=STA&PAGE_CODE=ORDENANZAS_2024) |
| Mairena del Aljarafe | ⏳ Máximos | 30 % + coef. estatales | [Ordenanza fiscal IIVTNU (PDF)](https://www.mairenadelaljarafe.es/export/sites/mairena/.galleries/Ayuntamiento/Ordenanzas/Fiscales/03-Ordenanza-Fiscal-Reguladora-del-Impuesto-sobre-el-Incremento-de-Valor-de-los-Terrenos-de-Naturaleza-Urbana.pdf) |
| Mairena del Alcor | ⏳ Máximos | 30 % + coef. estatales | Gestión delegada en el [OPAEF](https://www.opaef.es) (Diputación de Sevilla) |
| Resto de la provincia (100 municipios) | ⏳ Máximos | 30 % + coef. estatales | Ordenanza municipal o [BOP de Sevilla](https://bop.dipusevilla.es). Muchos municipios pequeños delegan la gestión en el **OPAEF**. |

> Nota: el intento de verificación automática desde este entorno no fue
> posible porque el proxy de red bloquea los dominios municipales y los
> agregadores fiscales. Los datos pre-reforma encontrados (p. ej. Dos
> Hermanas 25,16 % en su ordenanza de 2016) **no** se han usado por
> corresponder al sistema anulado por la STC 182/2021.

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
