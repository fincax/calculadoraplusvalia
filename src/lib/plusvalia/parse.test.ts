import { describe, expect, it } from "vitest";
import { parseAmount } from "./parse";

describe("parseAmount", () => {
  it("formato es-ES con coma decimal y puntos de miles", () => {
    expect(parseAmount("150.000,50")).toBe(150000.5);
    expect(parseAmount("1.234.567,89")).toBeCloseTo(1234567.89, 2);
    expect(parseAmount("0,5")).toBe(0.5);
  });
  it("puntos como separador de miles", () => {
    expect(parseAmount("150.000")).toBe(150000);
    expect(parseAmount("1.234.567")).toBe(1234567);
    expect(parseAmount("1.234")).toBe(1234);
  });
  it("un punto con menos/más de 3 decimales se lee como decimal", () => {
    expect(parseAmount("1500.5")).toBe(1500.5);
    expect(parseAmount("12.34")).toBe(12.34);
    expect(parseAmount("12.3456")).toBe(12.3456);
  });
  it("enteros y vacío", () => {
    expect(parseAmount("120000")).toBe(120000);
    expect(parseAmount("  60000 ")).toBe(60000);
    expect(Number.isNaN(parseAmount(""))).toBe(true);
    expect(Number.isNaN(parseAmount("   "))).toBe(true);
  });
});
