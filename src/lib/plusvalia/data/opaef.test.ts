import { describe, expect, it } from "vitest";
import { isOpaefManaged, plusvaliaGestor } from "./opaef";
import { getRulesForDate } from "./municipalities";

describe("clasificación del gestor de la plusvalía (OPAEF)", () => {
  it("Sevilla capital gestiona por su cuenta (agencia propia)", () => {
    expect(plusvaliaGestor("sevilla")).toBe("municipal");
    expect(isOpaefManaged("sevilla")).toBe(false);
  });

  it("marca como OPAEF los municipios cuya delegación consta", () => {
    expect(plusvaliaGestor("aguadulce")).toBe("opaef");
    expect(plusvaliaGestor("mairena-del-alcor")).toBe("opaef");
    expect(isOpaefManaged("las-cabezas-de-san-juan")).toBe(true);
  });

  it("los municipios sin constatar quedan como 'unknown' (a confirmar)", () => {
    // Dos Hermanas y Utrera no están en la lista confirmada: prudencia.
    expect(plusvaliaGestor("dos-hermanas")).toBe("unknown");
    expect(plusvaliaGestor("utrera")).toBe("unknown");
    expect(isOpaefManaged("dos-hermanas")).toBe(false);
  });
});

describe("integración OPAEF con las reglas municipales", () => {
  it("los municipios OPAEF confirmados pasan a autoliquidación", () => {
    const r = getRulesForDate("aguadulce", "2025-06-01");
    expect(r?.administrationMode).toBe("self_assessment");
    expect(r?.officialSource).toMatch(/OPAEF/);
  });

  it("no altera el tipo ni el estado de verificación (sigue por máximos)", () => {
    const r = getRulesForDate("aguadulce", "2025-06-01");
    expect(r?.taxRate).toBe(30);
    expect(r?.verified).toBe(false);
  });

  it("los municipios no constatados siguen con gestión desconocida", () => {
    const r = getRulesForDate("dos-hermanas", "2025-06-01");
    expect(r?.administrationMode).toBe("unknown");
  });

  it("Sevilla mantiene su autoliquidación propia (verificada)", () => {
    const r = getRulesForDate("sevilla", "2025-06-01");
    expect(r?.administrationMode).toBe("self_assessment");
    expect(r?.verified).toBe(true);
  });
});
