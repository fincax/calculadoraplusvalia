/**
 * Seguimiento propio del uso de la calculadora embebida en webs de clientes.
 * Sin cookies, sin datos personales ni económicos: solo el TIPO de evento
 * (vista o cálculo), el MUNICIPIO seleccionado y la WEB que la integra
 * (dominio de la página anfitriona). Lógica pura y testeable; la ruta de API
 * (`/api/embed-event`) añade la marca de tiempo y persiste el evento.
 */

export type EmbedEventType = "view" | "calculate";

export interface EmbedEvent {
  type: EmbedEventType;
  /** Dominio de la web que integra la calculadora (o "(desconocido)"). */
  site: string;
  municipality?: string;
}

export interface StoredEmbedEvent extends EmbedEvent {
  ts: string;
}

/** Extrae el dominio anfitrión de un origin/URL/hostname. */
export function siteFromOrigin(origin?: string | null): string {
  if (!origin || typeof origin !== "string") return "(desconocido)";
  const raw = origin.trim();
  if (!raw) return "(desconocido)";
  try {
    return new URL(raw).hostname || "(desconocido)";
  } catch {
    const h = raw.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
    return h || "(desconocido)";
  }
}

/** Valida y normaliza el cuerpo de un evento entrante. */
export function parseEmbedEvent(
  body: unknown,
  refererHeader?: string | null
): EmbedEvent | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  if (b.type !== "view" && b.type !== "calculate") return null;
  const origin = typeof b.origin === "string" ? b.origin : refererHeader ?? undefined;
  const municipality =
    typeof b.municipality === "string" && b.municipality.trim()
      ? b.municipality.trim().slice(0, 60)
      : undefined;
  return { type: b.type, site: siteFromOrigin(origin), municipality };
}

export interface SiteStats {
  site: string;
  views: number;
  calculations: number;
  total: number;
  lastSeen?: string;
}

/** Agrega eventos por web integradora (para el panel). */
export function aggregateEmbedEvents(
  events: Array<{ type: string; site: string; ts?: string }>
): SiteStats[] {
  const map = new Map<string, SiteStats>();
  for (const e of events) {
    const s =
      map.get(e.site) ??
      { site: e.site, views: 0, calculations: 0, total: 0 };
    if (e.type === "view") s.views += 1;
    else if (e.type === "calculate") s.calculations += 1;
    s.total = s.views + s.calculations;
    if (e.ts && (!s.lastSeen || e.ts > s.lastSeen)) s.lastSeen = e.ts;
    map.set(e.site, s);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}
