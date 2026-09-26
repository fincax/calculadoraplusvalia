import { describe, expect, it } from "vitest";
import { publicUrlFor, SITE_URL } from "./url";

describe("publicUrlFor", () => {
  it("quita el prefijo /embed de la versión embebida", () => {
    expect(publicUrlFor("/embed/calculadora-plusvalia/utrera")).toBe(
      `${SITE_URL}/calculadora-plusvalia/utrera`
    );
    expect(publicUrlFor("/embed/calculadora-plusvalia")).toBe(
      `${SITE_URL}/calculadora-plusvalia`
    );
  });

  it("deja igual las rutas públicas", () => {
    expect(publicUrlFor("/calculadora-plusvalia")).toBe(
      `${SITE_URL}/calculadora-plusvalia`
    );
  });
});
