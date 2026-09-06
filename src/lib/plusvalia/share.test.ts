import { describe, expect, it } from "vitest";
import {
  decodeShareParams,
  encodeShareParams,
  hasShareParams,
  type ShareState,
} from "./share";

const full: ShareState = {
  municipalityCode: "aguadulce",
  transferType: "herencia",
  acquisitionDate: "2000-05-10",
  transferDate: "2024-03-01",
  acquisitionValue: "40.000",
  transferValue: "120.000",
  cadastralValueTotal: "50.000",
  cadastralValueLand: "9.000",
  ownershipPercentage: "50",
  rightKind: "nuda_propiedad",
  usufructuaryAge: "70",
  usufructDurationYears: "",
  underlyingUsufruct: "vitalicio",
  isPrimaryResidenceOfDeceased: true,
  isCloseRelative: true,
  isDacionEnPago: false,
  showLateFiling: false,
  filingDate: "",
};

describe("encode/decode del enlace compartible", () => {
  it("ida y vuelta conserva los campos con valor", () => {
    const qs = encodeShareParams(full);
    const back = decodeShareParams(qs);
    expect(back.municipalityCode).toBe("aguadulce");
    expect(back.transferType).toBe("herencia");
    expect(back.transferDate).toBe("2024-03-01");
    expect(back.acquisitionValue).toBe("40.000");
    expect(back.ownershipPercentage).toBe("50");
    expect(back.rightKind).toBe("nuda_propiedad");
    expect(back.underlyingUsufruct).toBe("vitalicio");
    expect(back.usufructuaryAge).toBe("70");
    expect(back.isPrimaryResidenceOfDeceased).toBe(true);
    expect(back.isCloseRelative).toBe(true);
  });

  it("omite los valores por defecto (compraventa, pleno dominio, 100 %)", () => {
    const qs = encodeShareParams({
      ...full,
      transferType: "compraventa",
      rightKind: "pleno_dominio",
      ownershipPercentage: "100",
      isPrimaryResidenceOfDeceased: false,
      isCloseRelative: false,
    });
    expect(qs).not.toMatch(/(^|&)t=/);
    expect(qs).not.toMatch(/rk=/);
    expect(qs).not.toMatch(/ow=/);
    expect(qs).not.toMatch(/pr=/);
  });

  it("ignora valores no válidos (enum, fecha, importe)", () => {
    const back = decodeShareParams("t=raro&ft=no-fecha&va=<script>&rk=x");
    expect(back.transferType).toBeUndefined();
    expect(back.transferDate).toBeUndefined();
    expect(back.acquisitionValue).toBeUndefined();
    expect(back.rightKind).toBeUndefined();
  });

  it("hasShareParams detecta parámetros reconocibles", () => {
    expect(hasShareParams("?m=aguadulce")).toBe(true);
    expect(hasShareParams("")).toBe(false);
    expect(hasShareParams("?desconocido=1")).toBe(false);
  });
});
