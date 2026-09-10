import { describe, expect, it } from "vitest";
import { projectObjectiveTaxByYears } from "./projection";

describe("proyección de la cuota objetiva por años de tenencia", () => {
  const params = {
    cadastralValueLand: 30000,
    effectiveSharePercentage: 100,
    taxRate: 26.53,
    transferDateISO: "2025-06-01", // tabla RD-ley 8/2023
  };

  it("devuelve 20 filas (1..20 años)", () => {
    const rows = projectObjectiveTaxByYears(params);
    expect(rows).toHaveLength(20);
    expect(rows[0].years).toBe(1);
    expect(rows[19].years).toBe(20);
  });

  it("coincide con el cálculo del motor para 15 años (caso Triana)", () => {
    const rows = projectObjectiveTaxByYears(params);
    const y15 = rows.find((r) => r.years === 15)!;
    // 30.000 × 0,09 = 2.700 → 2.700 × 26,53 % = 716,31 €
    expect(y15.coefficient).toBe(0.09);
    expect(y15.base).toBe(2700);
    expect(y15.tax).toBeCloseTo(716.31, 2);
  });

  it("aplica el porcentaje efectivo y respeta el máximo municipal", () => {
    const rows = projectObjectiveTaxByYears({
      ...params,
      effectiveSharePercentage: 50,
      municipalCoefficients: { "20": 0.5 }, // supera el máximo → se limita
    });
    const y20 = rows.find((r) => r.years === 20)!;
    expect(y20.coefficient).toBe(0.4); // máximo estatal 2024→
    expect(y20.base).toBe(round2(30000 * 0.5 * 0.4));
  });
});

function round2(v: number): number {
  return Math.round((v + Number.EPSILON) * 100) / 100;
}
