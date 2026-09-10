import { describe, expect, it } from "vitest";
import { classifyContact, parseLead, sanitizeSummary } from "./validation";

describe("classifyContact", () => {
  it("reconoce emails", () => {
    expect(classifyContact("hola@fincax.es")).toBe("email");
    expect(classifyContact("  a.b-c@dominio.co  ")).toBe("email");
  });
  it("reconoce teléfonos españoles (con y sin prefijo)", () => {
    expect(classifyContact("600123123")).toBe("phone");
    expect(classifyContact("+34 600 12 31 23")).toBe("phone");
    expect(classifyContact("0034600123123")).toBe("phone");
    expect(classifyContact("954-11-22-33")).toBe("phone");
  });
  it("rechaza lo que no es ni email ni teléfono", () => {
    expect(classifyContact("")).toBeNull();
    expect(classifyContact("12345")).toBeNull();
    expect(classifyContact("hola")).toBeNull();
    expect(classifyContact("100123123")).toBeNull(); // no empieza por 6/7/8/9
  });
});

describe("sanitizeSummary", () => {
  it("conserva solo los campos esperados y acota strings", () => {
    const s = sanitizeSummary({
      municipality: "Sevilla",
      finalTax: 716.31,
      evil: "<script>",
      note: "x".repeat(500),
    });
    expect(s).toEqual({ municipality: "Sevilla", finalTax: 716.31 });
  });
  it("devuelve undefined si no hay nada válido", () => {
    expect(sanitizeSummary(null)).toBeUndefined();
    expect(sanitizeSummary("texto")).toBeUndefined();
    expect(sanitizeSummary({ evil: "x" })).toBeUndefined();
  });
});

describe("parseLead", () => {
  const base = { name: "Ana", contact: "600123123", consent: true };

  it("acepta un lead válido", () => {
    const r = parseLead(base);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.lead.contactType).toBe("phone");
      expect(r.lead.name).toBe("Ana");
    }
  });
  it("detecta el honeypot como spam", () => {
    const r = parseLead({ ...base, company: "Acme SL" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.spam).toBe(true);
  });
  it("exige nombre, contacto y consentimiento", () => {
    expect(parseLead({ ...base, consent: false }).ok).toBe(false);
    expect(parseLead({ ...base, name: "" }).ok).toBe(false);
    expect(parseLead({ ...base, contact: "" }).ok).toBe(false);
  });
  it("rechaza un contacto con formato inválido", () => {
    const r = parseLead({ ...base, contact: "no-vale" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.spam).toBeUndefined();
  });
});
