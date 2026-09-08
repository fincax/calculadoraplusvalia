import { describe, expect, it } from "vitest";
import { computeEquilibrium } from "./equilibrium";

describe("cálculo inverso (precio de no sujeción y de equilibrio)", () => {
  // Caso Triana: adq 150.000, suelo/total = 30.000/60.000 = 0,5, 100 %,
  // tipo 26,53 %, cuota objetiva 716,31 €.
  const params = {
    acquisitionValue: 150000,
    cadastralValueLand: 30000,
    cadastralValueTotal: 60000,
    effectiveSharePercentage: 100,
    taxRate: 26.53,
    objectiveGrossTax: 716.31,
  };

  it("el precio de no sujeción es el valor de adquisición", () => {
    expect(computeEquilibrium(params).nonSubjectPrice).toBe(150000);
  });

  it("el precio de equilibrio iguala real y objetivo", () => {
    const { breakEvenPrice } = computeEquilibrium(params);
    // slope = 0,5 × 1 × 0,2653 = 0,13265 → 150000 + 716,31/0,13265 ≈ 155.400 €
    expect(breakEvenPrice).toBeCloseTo(155400, 0);
  });

  it("verifica la coherencia: a ese precio, la cuota real ≈ la objetiva", () => {
    const { breakEvenPrice, objectiveGrossTax } = computeEquilibrium(params);
    const realTax =
      (breakEvenPrice! - params.acquisitionValue) *
      (params.cadastralValueLand / params.cadastralValueTotal) *
      (params.effectiveSharePercentage / 100) *
      (params.taxRate / 100);
    expect(realTax).toBeCloseTo(objectiveGrossTax, 1);
  });

  it("sin pendiente (suelo 0) no hay precio de equilibrio", () => {
    const r = computeEquilibrium({ ...params, cadastralValueLand: 0 });
    expect(r.breakEvenPrice).toBeUndefined();
  });
});
