import { describe, expect, it } from "vitest";
import {
  bracketForYears,
  computeYearsHeld,
  getStateTableForDate,
  resolveCoefficient,
} from "./coefficients";
import { calculatePlusvalia, PlusvaliaInputError } from "./engine";
import type { CalculationInput } from "./types";

const baseInput: CalculationInput = {
  municipalityCode: "sevilla",
  transferType: "compraventa",
  acquisitionDate: "2010-01-15",
  transferDate: "2025-06-01",
  acquisitionValue: 150000,
  transferValue: 250000,
  cadastralValueTotal: 60000,
  cadastralValueLand: 30000,
};

describe("computeYearsHeld", () => {
  it("cuenta años completos", () => {
    expect(computeYearsHeld("2010-01-15", "2025-06-01")).toBe(15);
  });
  it("no cuenta el año si no se alcanzó el aniversario", () => {
    expect(computeYearsHeld("2010-06-15", "2025-06-01")).toBe(14);
    expect(computeYearsHeld("2010-06-15", "2025-06-15")).toBe(15);
  });
  it("periodos inferiores a un año devuelven 0", () => {
    expect(computeYearsHeld("2024-03-01", "2024-09-01")).toBe(0);
  });
  it("rechaza transmisión anterior a adquisición", () => {
    expect(() => computeYearsHeld("2025-01-01", "2024-01-01")).toThrow();
  });
});

describe("tablas estatales de coeficientes", () => {
  it("selecciona la tabla por fecha de devengo", () => {
    expect(getStateTableForDate("2021-11-10").id).toBe("rdl26-2021");
    expect(getStateTableForDate("2022-12-31").id).toBe("rdl26-2021");
    expect(getStateTableForDate("2023-06-01").id).toBe("lpge-2023");
    expect(getStateTableForDate("2024-01-01").id).toBe("rdl8-2023");
    expect(getStateTableForDate("2026-08-28").id).toBe("rdl8-2023");
  });
  it("lanza error para devengos anteriores a la reforma", () => {
    expect(() => getStateTableForDate("2021-11-09")).toThrow();
  });
  it("tramos", () => {
    expect(bracketForYears(0)).toBe("lt1");
    expect(bracketForYears(1)).toBe("1");
    expect(bracketForYears(19)).toBe("19");
    expect(bracketForYears(20)).toBe("gte20");
    expect(bracketForYears(35)).toBe("gte20");
  });
  it("coeficientes clave de cada tabla", () => {
    expect(getStateTableForDate("2022-06-01").values["gte20"]).toBe(0.45);
    expect(getStateTableForDate("2023-06-01").values["1"]).toBe(0.15);
    expect(getStateTableForDate("2025-06-01").values["gte20"]).toBe(0.4);
    expect(getStateTableForDate("2025-06-01").values["15"]).toBe(0.09);
  });
  it("el coeficiente municipal propio no puede superar el máximo estatal", () => {
    const r = resolveCoefficient("2010-01-15", "2025-06-01", { "15": 0.5 });
    expect(r.coefficient).toBe(0.09);
    const r2 = resolveCoefficient("2010-01-15", "2025-06-01", { "15": 0.05 });
    expect(r2.coefficient).toBe(0.05);
  });
});

describe("calculatePlusvalia — método objetivo vs real", () => {
  it("elige el método objetivo cuando es más favorable (Sevilla, 26,53 %)", () => {
    const r = calculatePlusvalia(baseInput);
    expect(r.outcome).toBe("taxable");
    // Objetivo: 30.000 × 0,09 = 2.700 → 2.700 × 26,53 % = 716,31 €
    expect(r.objectiveMethod.taxableBase).toBe(2700);
    expect(r.objectiveMethod.grossTax).toBeCloseTo(716.31, 2);
    // Real: (250.000 − 150.000) × 0,5 = 50.000 → 13.265 €
    expect(r.realMethod.taxableBase).toBe(50000);
    expect(r.realMethod.grossTax).toBeCloseTo(13265, 2);
    expect(r.chosenMethod).toBe("objective");
    expect(r.finalTax).toBeCloseTo(716.31, 2);
    expect(r.savingsVsOtherMethod).toBeCloseTo(12548.69, 2);
  });

  it("elige el método real cuando es más favorable", () => {
    const r = calculatePlusvalia({
      ...baseInput,
      acquisitionValue: 248000,
      transferValue: 250000,
    });
    // Real: 2.000 × 0,5 = 1.000 → 265,30 € < 716,31 €
    expect(r.chosenMethod).toBe("real");
    expect(r.finalTax).toBeCloseTo(265.3, 2);
  });

  it("detecta la no sujeción cuando no hay incremento (art. 104.5)", () => {
    const r = calculatePlusvalia({
      ...baseInput,
      acquisitionValue: 250000,
      transferValue: 200000,
    });
    expect(r.outcome).toBe("not_subject_no_gain");
    expect(r.finalTax).toBe(0);
    expect(r.realGainOnLand).toBeLessThan(0);
  });

  it("venta sin ganancia exacta también es no sujeta", () => {
    const r = calculatePlusvalia({
      ...baseInput,
      acquisitionValue: 250000,
      transferValue: 250000,
    });
    expect(r.outcome).toBe("not_subject_no_gain");
  });
});

describe("periodos inferiores a un año (prorrateo por meses completos, art. 107.4)", () => {
  it("prorratea el coeficiente anual por los meses completos", () => {
    const r = calculatePlusvalia({
      ...baseInput,
      acquisitionDate: "2024-03-10",
      transferDate: "2024-10-20",
    });
    // 7 meses completos → 0,15 × 7/12 = 0,0875 → 30.000 × 0,0875 = 2.625 €
    expect(r.coefficient.monthsHeld).toBe(7);
    expect(r.coefficient.annualCoefficient).toBe(0.15);
    expect(r.coefficient.coefficient).toBeCloseTo(0.0875, 6);
    expect(r.objectiveMethod.taxableBase).toBeCloseTo(2625, 2);
    expect(r.objectiveMethod.grossTax).toBeCloseTo(696.41, 2);
  });

  it("sin ningún mes completo, la base objetiva es cero", () => {
    const r = calculatePlusvalia({
      ...baseInput,
      acquisitionDate: "2024-03-10",
      transferDate: "2024-03-25",
    });
    expect(r.coefficient.monthsHeld).toBe(0);
    expect(r.objectiveMethod.taxableBase).toBe(0);
    expect(r.chosenMethod).toBe("objective");
    expect(r.finalTax).toBe(0);
  });

  it("no prorratea cuando hay al menos un año completo", () => {
    const r = calculatePlusvalia({
      ...baseInput,
      acquisitionDate: "2023-05-01",
      transferDate: "2024-06-01",
    });
    expect(r.coefficient.monthsHeld).toBeUndefined();
    expect(r.coefficient.coefficient).toBe(0.15); // 1 año, tabla 2024
  });
});

describe("titularidad y derechos reales", () => {
  it("aplica el porcentaje de titularidad", () => {
    const r = calculatePlusvalia({ ...baseInput, ownershipPercentage: 50 });
    expect(r.effectiveSharePercentage).toBe(50);
    expect(r.objectiveMethod.taxableBase).toBe(1350);
  });

  it("valora el usufructo vitalicio (89 − edad)", () => {
    const r = calculatePlusvalia({
      ...baseInput,
      realRight: { kind: "usufructo_vitalicio", usufructuaryAge: 70 },
    });
    expect(r.effectiveSharePercentage).toBe(19);
    expect(r.objectiveMethod.taxableBase).toBeCloseTo(30000 * 0.19 * 0.09, 2);
  });

  it("la nuda propiedad es el complemento del usufructo", () => {
    const r = calculatePlusvalia({
      ...baseInput,
      realRight: {
        kind: "nuda_propiedad",
        underlyingUsufruct: "vitalicio",
        usufructuaryAge: 70,
      },
    });
    expect(r.effectiveSharePercentage).toBe(81);
  });

  it("usufructo temporal: 2 % por año, máximo 70 %", () => {
    const r = calculatePlusvalia({
      ...baseInput,
      realRight: { kind: "usufructo_temporal", usufructDurationYears: 10 },
    });
    expect(r.effectiveSharePercentage).toBe(20);
    const r2 = calculatePlusvalia({
      ...baseInput,
      realRight: { kind: "usufructo_temporal", usufructDurationYears: 50 },
    });
    expect(r2.effectiveSharePercentage).toBe(70);
  });

  it("clampa el usufructo vitalicio entre 10 % y 70 %", () => {
    const old = calculatePlusvalia({
      ...baseInput,
      realRight: { kind: "usufructo_vitalicio", usufructuaryAge: 85 },
    });
    expect(old.effectiveSharePercentage).toBe(10);
    const young = calculatePlusvalia({
      ...baseInput,
      realRight: { kind: "usufructo_vitalicio", usufructuaryAge: 15 },
    });
    expect(young.effectiveSharePercentage).toBe(70);
  });
});

describe("bonificaciones (Sevilla, mortis causa vivienda habitual)", () => {
  const herencia: CalculationInput = {
    municipalityCode: "sevilla",
    transferType: "herencia",
    acquisitionDate: "2000-05-10",
    transferDate: "2024-03-01",
    acquisitionValue: 40000,
    transferValue: 120000,
    cadastralValueTotal: 50000,
    cadastralValueLand: 9000,
    isPrimaryResidenceOfDeceased: true,
    isCloseRelative: true,
  };

  it("aplica el 95 % si el valor catastral del suelo ≤ 10.000 €", () => {
    const r = calculatePlusvalia(herencia);
    // Objetivo: 9.000 × 0,40 (≥20 años) = 3.600 → 955,08 €
    expect(r.grossTax).toBeCloseTo(955.08, 2);
    expect(r.bonusesApplied).toHaveLength(1);
    expect(r.bonusesApplied[0].percentage).toBe(95);
    expect(r.finalTax).toBeCloseTo(47.75, 1);
    expect(r.bonusesApplied[0].conditional).toBe(true);
  });

  it("aplica el tramo del 50 % entre 10.000 y 20.000 €", () => {
    const r = calculatePlusvalia({
      ...herencia,
      cadastralValueLand: 15000,
      cadastralValueTotal: 60000,
    });
    expect(r.bonusesApplied[0]?.percentage).toBe(50);
  });

  it("sin bonificación por encima de 50.000 € de suelo", () => {
    const r = calculatePlusvalia({
      ...herencia,
      cadastralValueLand: 60000,
      cadastralValueTotal: 200000,
    });
    expect(r.bonusesApplied).toHaveLength(0);
  });

  it("si no es vivienda habitual, aplica el 10 % de otros inmuebles (no el 95 %)", () => {
    const r = calculatePlusvalia({
      ...herencia,
      isPrimaryResidenceOfDeceased: false,
    });
    expect(r.bonusesApplied).toHaveLength(1);
    expect(r.bonusesApplied[0].percentage).toBe(10);
    expect(r.bonusesApplied[0].amount).toBeCloseTo(95.51, 2);
  });

  it("las bonificaciones de vivienda habitual y de otros inmuebles son excluyentes", () => {
    const r = calculatePlusvalia(herencia);
    expect(r.bonusesApplied).toHaveLength(1);
    expect(r.bonusesApplied[0].percentage).toBe(95);
  });

  it("sin parentesco directo no hay bonificación alguna", () => {
    expect(
      calculatePlusvalia({ ...herencia, isCloseRelative: false }).bonusesApplied
    ).toHaveLength(0);
  });

  it("no aplica bonificación de herencia a una compraventa", () => {
    const r = calculatePlusvalia({
      ...herencia,
      transferType: "compraventa",
    });
    expect(r.bonusesApplied).toHaveLength(0);
  });
});

describe("exención por dación en pago", () => {
  it("marca la operación como posiblemente exenta con cuota final 0", () => {
    const r = calculatePlusvalia({ ...baseInput, isDacionEnPago: true });
    expect(r.outcome).toBe("possibly_exempt");
    expect(r.finalTax).toBe(0);
    expect(r.warnings.join(" ")).toMatch(/vivienda habitual/i);
  });
});

describe("municipios no verificados (máximos legales)", () => {
  it("usa tipo 30 % y avisa de que es estimación de máximo", () => {
    const r = calculatePlusvalia({
      ...baseInput,
      municipalityCode: "dos-hermanas",
    });
    expect(r.rules.taxRate).toBe(30);
    expect(r.rules.verified).toBe(false);
    expect(r.warnings.join(" ")).toMatch(/no están verificados/i);
    expect(r.objectiveMethod.grossTax).toBeCloseTo(2700 * 0.3, 2);
  });
});

describe("aviso por devengo futuro", () => {
  it("avisa cuando la transmisión es de un año posterior al actual", () => {
    const futureYear = new Date().getUTCFullYear() + 3;
    const r = calculatePlusvalia({
      ...baseInput,
      transferDate: `${futureYear}-06-01`,
    });
    expect(r.warnings.join(" ")).toMatch(/año futuro|actualizan cada año/i);
  });
  it("no avisa para un devengo del año en curso o pasado", () => {
    const r = calculatePlusvalia(baseInput); // 2025
    expect(r.warnings.join(" ")).not.toMatch(/año futuro/i);
  });
});

describe("errores de derecho real como PlusvaliaInputError", () => {
  it("usufructo vitalicio sin edad lanza PlusvaliaInputError (mensaje concreto)", () => {
    expect(() =>
      calculatePlusvalia({
        ...baseInput,
        realRight: { kind: "usufructo_vitalicio" },
      })
    ).toThrow(PlusvaliaInputError);
  });
  it("usufructo temporal sin duración lanza PlusvaliaInputError", () => {
    expect(() =>
      calculatePlusvalia({
        ...baseInput,
        realRight: { kind: "usufructo_temporal" },
      })
    ).toThrow(PlusvaliaInputError);
  });
});

describe("validación de entradas", () => {
  it("rechaza devengos anteriores a la reforma de 2021", () => {
    expect(() =>
      calculatePlusvalia({ ...baseInput, transferDate: "2021-06-01" })
    ).toThrow(PlusvaliaInputError);
  });
  it("rechaza suelo mayor que el valor catastral total", () => {
    expect(() =>
      calculatePlusvalia({
        ...baseInput,
        cadastralValueLand: 70000,
        cadastralValueTotal: 60000,
      })
    ).toThrow(PlusvaliaInputError);
  });
  it("rechaza titularidad fuera de rango", () => {
    expect(() =>
      calculatePlusvalia({ ...baseInput, ownershipPercentage: 0 })
    ).toThrow(PlusvaliaInputError);
    expect(() =>
      calculatePlusvalia({ ...baseInput, ownershipPercentage: 120 })
    ).toThrow(PlusvaliaInputError);
  });
  it("rechaza municipio desconocido", () => {
    expect(() =>
      calculatePlusvalia({ ...baseInput, municipalityCode: "narnia" })
    ).toThrow(PlusvaliaInputError);
  });
});
