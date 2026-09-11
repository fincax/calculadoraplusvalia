import { describe, expect, it } from "vitest";
import {
  isOpaefManaged,
  opaefMunicipalityCodes,
  OPAEF_MUNICIPIOS_COUNT,
  plusvaliaGestor,
  PROVINCE_MUNICIPIOS_COUNT,
} from "./opaef";
import { getRulesForDate, listMunicipalities } from "./municipalities";

describe("clasificación del gestor de la plusvalía (OPAEF)", () => {
  it("Sevilla capital gestiona por su cuenta (agencia propia)", () => {
    expect(plusvaliaGestor("sevilla")).toBe("municipal");
    expect(isOpaefManaged("sevilla")).toBe(false);
  });

  it("marca como OPAEF los municipios de la relación de 30/08/2024", () => {
    expect(plusvaliaGestor("aguadulce")).toBe("opaef");
    expect(plusvaliaGestor("mairena-del-alcor")).toBe("opaef");
    expect(plusvaliaGestor("utrera")).toBe("opaef");
    expect(plusvaliaGestor("el-palmar-de-troya")).toBe("opaef");
    expect(isOpaefManaged("las-cabezas-de-san-juan")).toBe(true);
  });

  it("las grandes ciudades que no delegaron quedan como gestión municipal", () => {
    for (const code of [
      "dos-hermanas",
      "alcala-de-guadaira",
      "mairena-del-aljarafe",
      "ecija",
      "carmona",
      "la-rinconada",
    ]) {
      expect(plusvaliaGestor(code)).toBe("municipal");
      expect(isOpaefManaged(code)).toBe(false);
    }
  });

  it("no confunde municipios de nombre parecido", () => {
    // Alcalá del Río y Mairena del Alcor SÍ están; sus homónimos no.
    expect(isOpaefManaged("alcala-del-rio")).toBe(true);
    expect(isOpaefManaged("alcala-de-guadaira")).toBe(false);
    expect(isOpaefManaged("mairena-del-alcor")).toBe(true);
    expect(isOpaefManaged("mairena-del-aljarafe")).toBe(false);
  });

  it("la relación tiene 85 municipios y todos existen en la provincia", () => {
    const codes = opaefMunicipalityCodes();
    expect(codes).toHaveLength(OPAEF_MUNICIPIOS_COUNT);
    expect(new Set(codes).size).toBe(OPAEF_MUNICIPIOS_COUNT);
    const known = new Set(listMunicipalities().map((m) => m.code));
    for (const code of codes) expect(known.has(code), code).toBe(true);
  });

  it("85 delegados + 21 propios = 106 municipios de la provincia", () => {
    const all = listMunicipalities();
    expect(all).toHaveLength(PROVINCE_MUNICIPIOS_COUNT);
    const opaef = all.filter((m) => isOpaefManaged(m.code)).length;
    expect(opaef).toBe(OPAEF_MUNICIPIOS_COUNT);
    expect(all.length - opaef).toBe(21);
  });
});

describe("integración OPAEF con las reglas municipales", () => {
  it("los municipios OPAEF pasan a autoliquidación", () => {
    const r = getRulesForDate("utrera", "2025-06-01");
    expect(r?.administrationMode).toBe("self_assessment");
    expect(r?.officialSource).toMatch(/OPAEF/);
  });

  it("no altera el tipo ni el estado de verificación (sigue por máximos)", () => {
    const r = getRulesForDate("utrera", "2025-06-01");
    expect(r?.taxRate).toBe(30);
    expect(r?.verified).toBe(false);
  });

  it("los municipios con gestión propia y ordenanza sin verificar mantienen régimen desconocido", () => {
    const r = getRulesForDate("dos-hermanas", "2025-06-01");
    expect(r?.administrationMode).toBe("unknown");
    expect(r?.officialSource).not.toMatch(/OPAEF/);
  });

  it("Sevilla mantiene su autoliquidación propia (verificada)", () => {
    const r = getRulesForDate("sevilla", "2025-06-01");
    expect(r?.administrationMode).toBe("self_assessment");
    expect(r?.verified).toBe(true);
  });
});
