import { describe, expect, it } from "vitest";
import { calculatePlusvalia } from "../engine";
import type { CalculationInput } from "../types";
import { getRulesForDate, listMunicipalities } from "./municipalities";

/**
 * Casos calculados A MANO a partir de las ordenanzas cotejadas el
 * 11/09/2026 (ver docs/VERIFICACION_DATOS.md). Coeficientes estatales del
 * RD-ley 8/2023 (devengos desde 2024): 15 años → 0,09; ≥20 años → 0,40.
 * En todos los casos el valor real de venta es muy superior para que el
 * método objetivo sea el más favorable y la cuota salga de él.
 */
function herencia(
  municipalityCode: string,
  cadastralValueLand: number,
  overrides: Partial<CalculationInput> = {}
): CalculationInput {
  return {
    municipalityCode,
    transferType: "herencia",
    acquisitionDate: "2000-05-10",
    transferDate: "2025-06-01", // ≥ 20 años → coeficiente 0,40
    acquisitionValue: 10000,
    transferValue: 500000,
    cadastralValueTotal: cadastralValueLand * 2,
    cadastralValueLand,
    isPrimaryResidenceOfDeceased: true,
    isCloseRelative: true,
    ...overrides,
  };
}

describe("Alcalá de Guadaíra (ordenanza cotejada): 30 %, 4 tramos mortis causa", () => {
  it("ficha verificada, autoliquidación, coeficientes estatales", () => {
    const r = getRulesForDate("alcala-de-guadaira", "2025-06-01");
    expect(r?.verified).toBe(true);
    expect(r?.taxRate).toBe(30);
    expect(r?.coefficientsMode).toBe("national_max");
    expect(r?.administrationMode).toBe("self_assessment");
  });

  it("VCS 50.000 € → 95 %: 50.000 × 0,40 = 20.000 → 6.000 → 300 €", () => {
    const r = calculatePlusvalia(herencia("alcala-de-guadaira", 50000));
    expect(r.chosenMethod).toBe("objective");
    expect(r.grossTax).toBeCloseTo(6000, 2);
    expect(r.bonusesApplied[0]?.percentage).toBe(95);
    expect(r.finalTax).toBeCloseTo(300, 2);
  });

  it("VCS 80.000 € → 75 %: 32.000 → 9.600 → 2.400 €", () => {
    const r = calculatePlusvalia(herencia("alcala-de-guadaira", 80000));
    expect(r.bonusesApplied[0]?.percentage).toBe(75);
    expect(r.finalTax).toBeCloseTo(2400, 2);
  });

  it("VCS 120.000 € → 50 %: 48.000 → 14.400 → 7.200 €", () => {
    const r = calculatePlusvalia(herencia("alcala-de-guadaira", 120000));
    expect(r.bonusesApplied[0]?.percentage).toBe(50);
    expect(r.finalTax).toBeCloseTo(7200, 2);
  });

  it("VCS 200.000 € → 15 % (sin límite superior): 80.000 → 24.000 → 20.400 €", () => {
    const r = calculatePlusvalia(herencia("alcala-de-guadaira", 200000));
    expect(r.bonusesApplied[0]?.percentage).toBe(15);
    expect(r.finalTax).toBeCloseTo(20400, 2);
  });

  it("sin vivienda habitual no hay bonificación (no existe la del 10 % de Sevilla)", () => {
    const r = calculatePlusvalia(
      herencia("alcala-de-guadaira", 50000, { isPrimaryResidenceOfDeceased: false })
    );
    expect(r.bonusesApplied).toHaveLength(0);
    expect(r.finalTax).toBeCloseTo(6000, 2);
  });

  it("muestra la nota de la reducción catastral del 20 % tras ponencia", () => {
    const r = calculatePlusvalia(herencia("alcala-de-guadaira", 50000));
    expect(r.warnings.some((w) => w.includes("20 %"))).toBe(true);
  });
});

describe("Utrera (ordenanza cotejada): 28 %, 95/50 % mortis causa, OPAEF desde 09/2024", () => {
  const utrera15 = (vcs: number): CalculationInput =>
    herencia("utrera", vcs, {
      acquisitionDate: "2010-01-15", // 15 años → 0,09
    });

  it("tipo 28 % y dos vigencias: declaración hasta 09/2024, autoliquidación OPAEF después", () => {
    const antes = getRulesForDate("utrera", "2024-06-01");
    const despues = getRulesForDate("utrera", "2025-06-01");
    expect(antes?.taxRate).toBe(28);
    expect(antes?.administrationMode).toBe("assessment");
    expect(despues?.taxRate).toBe(28);
    expect(despues?.administrationMode).toBe("self_assessment");
    expect(despues?.officialSource).toMatch(/OPAEF/);
    expect(despues?.verified).toBe(true);
  });

  it("compraventa 15 años, VCS 30.000 €: 2.700 × 28 % = 756 €", () => {
    const r = calculatePlusvalia({
      ...utrera15(30000),
      transferType: "compraventa",
      isPrimaryResidenceOfDeceased: undefined,
      isCloseRelative: undefined,
    });
    expect(r.objectiveMethod.taxableBase).toBe(2700);
    expect(r.finalTax).toBeCloseTo(756, 2);
  });

  it("herencia VCS 25.000 € → 95 %: 2.250 → 630 → 31,50 €", () => {
    const r = calculatePlusvalia(utrera15(25000));
    expect(r.grossTax).toBeCloseTo(630, 2);
    expect(r.bonusesApplied[0]?.percentage).toBe(95);
    expect(r.finalTax).toBeCloseTo(31.5, 2);
  });

  it("herencia VCS 60.000 € → 50 %: 5.400 → 1.512 → 756 €", () => {
    const r = calculatePlusvalia(utrera15(60000));
    expect(r.bonusesApplied[0]?.percentage).toBe(50);
    expect(r.finalTax).toBeCloseTo(756, 2);
  });

  it("herencia VCS 100.000 € → sin bonificación (el tramo del 50 % es < 100.000)", () => {
    const r = calculatePlusvalia(utrera15(100000));
    expect(r.bonusesApplied).toHaveLength(0);
    expect(r.finalTax).toBeCloseTo(2520, 2);
  });
});

describe("Mairena del Aljarafe (ordenanza cotejada): 30 % sin bonificaciones", () => {
  it("herencia de vivienda habitual VCS 9.000 €: 3.600 → 1.080 € sin bonificar", () => {
    const r = calculatePlusvalia(herencia("mairena-del-aljarafe", 9000));
    expect(r.rules.verified).toBe(true);
    expect(r.rules.administrationMode).toBe("assessment");
    expect(r.grossTax).toBeCloseTo(1080, 2);
    expect(r.bonusesApplied).toHaveLength(0);
    expect(r.finalTax).toBeCloseTo(1080, 2);
  });

  it("avisa de que el método real exige declarar en plazo (art. 8.3)", () => {
    const r = calculatePlusvalia(herencia("mairena-del-aljarafe", 9000));
    expect(r.warnings.some((w) => w.includes("art. 8.3"))).toBe(true);
  });
});

describe("Écija (ordenanza cotejada): 28 %, 95 % mortis causa si VCS ≤ 35.000 €", () => {
  it("VCS 35.000 € → 95 %: 14.000 × 28 % = 3.920 → 196 €", () => {
    const r = calculatePlusvalia(herencia("ecija", 35000));
    expect(r.rules.taxRate).toBe(28);
    expect(r.rules.administrationMode).toBe("assessment");
    expect(r.grossTax).toBeCloseTo(3920, 2);
    expect(r.bonusesApplied[0]?.percentage).toBe(95);
    expect(r.finalTax).toBeCloseTo(196, 2);
  });

  it("VCS 35.001 € → sin bonificación: 3.920,11 €", () => {
    const r = calculatePlusvalia(herencia("ecija", 35001));
    expect(r.bonusesApplied).toHaveLength(0);
    expect(r.finalTax).toBeCloseTo(3920.11, 2);
  });

  it("si no era la vivienda habitual, no hay bonificación", () => {
    const r = calculatePlusvalia(
      herencia("ecija", 20000, { isPrimaryResidenceOfDeceased: false })
    );
    expect(r.bonusesApplied).toHaveLength(0);
  });
});

describe("integridad del directorio tras añadir municipios verificados", () => {
  it("sigue habiendo 106 municipios, 5 verificados, sin duplicados", () => {
    const all = listMunicipalities();
    expect(all).toHaveLength(106);
    expect(new Set(all.map((m) => m.code)).size).toBe(106);
    const verified = all.filter((m) => m.verified).map((m) => m.code).sort();
    expect(verified).toEqual([
      "alcala-de-guadaira",
      "ecija",
      "mairena-del-aljarafe",
      "sevilla",
      "utrera",
    ]);
  });

  it("Dos Hermanas sigue por máximos hasta recibir su ordenanza", () => {
    const r = getRulesForDate("dos-hermanas", "2025-06-01");
    expect(r?.verified).toBe(false);
    expect(r?.taxRate).toBe(30);
  });
});
