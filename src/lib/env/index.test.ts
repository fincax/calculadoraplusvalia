import { afterEach, describe, expect, it } from "vitest";
import { env } from "./index";

describe("env", () => {
  afterEach(() => {
    delete process.env.FINCAX_TEST_VAR;
  });

  it("devuelve undefined si la variable no existe", () => {
    expect(env("FINCAX_TEST_VAR")).toBeUndefined();
  });

  it("trata el valor vacío o en blanco como no definido (plantilla .env)", () => {
    process.env.FINCAX_TEST_VAR = "";
    expect(env("FINCAX_TEST_VAR")).toBeUndefined();
    process.env.FINCAX_TEST_VAR = "   ";
    expect(env("FINCAX_TEST_VAR")).toBeUndefined();
    expect(env("FINCAX_TEST_VAR") ?? "defecto").toBe("defecto");
  });

  it("devuelve el valor recortado si existe", () => {
    process.env.FINCAX_TEST_VAR = " leads.jsonl ";
    expect(env("FINCAX_TEST_VAR")).toBe("leads.jsonl");
  });
});
