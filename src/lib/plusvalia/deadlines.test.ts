import { describe, expect, it } from "vitest";
import {
  addBusinessDays,
  addMonths,
  computeSurcharge,
  getDeadline,
  monthsBetween,
} from "./deadlines";

describe("plazos de presentación", () => {
  it("herencia: 6 meses desde el devengo", () => {
    const d = getDeadline("herencia", "2025-01-15");
    expect(d.estimatedDeadline).toBe("2025-07-15");
    expect(d.legalBasis).toMatch(/110\.2/);
  });
  it("compraventa y donación: 30 días hábiles", () => {
    const d = getDeadline("compraventa", "2025-01-03"); // viernes
    // 30 días hábiles desde el viernes 3 de enero = viernes 14 de febrero de 2025
    expect(d.estimatedDeadline).toBe("2025-02-14");
  });
  it("addMonths ajusta fin de mes", () => {
    expect(addMonths("2024-08-31", 6)).toBe("2025-02-28");
    expect(addMonths("2023-08-31", 6)).toBe("2024-02-29");
  });
  it("addBusinessDays salta fines de semana", () => {
    expect(addBusinessDays("2025-01-03", 1)).toBe("2025-01-06");
  });
});

describe("recargos por extemporaneidad (art. 27 LGT)", () => {
  it("dentro de plazo: sin recargo", () => {
    const s = computeSurcharge("2025-01-10", "2025-01-10", 1000);
    expect(s.applicable).toBe(false);
  });
  it("1 % + 1 % por mes completo", () => {
    const s = computeSurcharge("2025-01-10", "2025-03-15", 1000);
    expect(s.monthsLate).toBe(2);
    expect(s.surchargePercentage).toBe(3);
    expect(s.surchargeAmount).toBe(30);
  });
  it("retraso sin mes completo: 1 % fijo", () => {
    const s = computeSurcharge("2025-01-10", "2025-01-25", 1000);
    expect(s.monthsLate).toBe(0);
    expect(s.surchargePercentage).toBe(1);
  });
  it("más de 12 meses: 15 % más intereses", () => {
    const s = computeSurcharge("2024-01-10", "2025-06-15", 1000);
    expect(s.surchargePercentage).toBe(15);
    expect(s.surchargeAmount).toBe(150);
    expect(s.interestNote).toBeTruthy();
  });
  it("monthsBetween cuenta meses completos", () => {
    expect(monthsBetween("2025-01-31", "2025-02-28")).toBe(0);
    expect(monthsBetween("2025-01-10", "2025-02-10")).toBe(1);
  });
});
