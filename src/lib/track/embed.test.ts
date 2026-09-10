import { describe, expect, it } from "vitest";
import {
  aggregateEmbedEvents,
  parseEmbedEvent,
  siteFromOrigin,
} from "./embed";

describe("siteFromOrigin", () => {
  it("extrae el dominio de una URL", () => {
    expect(siteFromOrigin("https://inmobiliaria-lopez.es/venta/piso")).toBe(
      "inmobiliaria-lopez.es"
    );
    expect(siteFromOrigin("http://localhost:3000/x")).toBe("localhost");
  });
  it("acepta un hostname suelto y maneja vacíos", () => {
    expect(siteFromOrigin("gestoria.com")).toBe("gestoria.com");
    expect(siteFromOrigin("")).toBe("(desconocido)");
    expect(siteFromOrigin(undefined)).toBe("(desconocido)");
  });
});

describe("parseEmbedEvent", () => {
  it("valida el tipo y toma el municipio y el origen", () => {
    const e = parseEmbedEvent({
      type: "calculate",
      municipality: "aguadulce",
      origin: "https://clienteweb.es/",
    });
    expect(e).toEqual({
      type: "calculate",
      site: "clienteweb.es",
      municipality: "aguadulce",
    });
  });
  it("usa la cabecera Referer si no viene origin en el cuerpo", () => {
    const e = parseEmbedEvent({ type: "view" }, "https://socio.example/pagina");
    expect(e?.site).toBe("socio.example");
  });
  it("rechaza tipos no válidos", () => {
    expect(parseEmbedEvent({ type: "hack" })).toBeNull();
    expect(parseEmbedEvent(null)).toBeNull();
  });
});

describe("aggregateEmbedEvents", () => {
  it("cuenta vistas y cálculos por web y ordena por uso", () => {
    const stats = aggregateEmbedEvents([
      { type: "view", site: "a.es", ts: "2026-09-01T10:00:00Z" },
      { type: "calculate", site: "a.es", ts: "2026-09-02T10:00:00Z" },
      { type: "view", site: "b.es", ts: "2026-09-03T10:00:00Z" },
    ]);
    expect(stats).toHaveLength(2);
    expect(stats[0].site).toBe("a.es");
    expect(stats[0].views).toBe(1);
    expect(stats[0].calculations).toBe(1);
    expect(stats[0].total).toBe(2);
    expect(stats[0].lastSeen).toBe("2026-09-02T10:00:00Z");
    expect(stats[1].site).toBe("b.es");
  });
});
