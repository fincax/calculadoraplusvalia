/**
 * Validación y saneamiento de leads de la calculadora. Lógica pura (sin red
 * ni sistema de ficheros) para poder testearla de forma aislada; la ruta de
 * API (`src/app/api/lead/route.ts`) la usa antes de enviar o almacenar.
 */

export interface RawLead {
  name?: unknown;
  contact?: unknown;
  consent?: unknown;
  /** Campo trampa (honeypot): los humanos lo dejan vacío; los bots lo rellenan. */
  company?: unknown;
  summary?: unknown;
}

export type ContactType = "email" | "phone";

export interface CleanLead {
  name: string;
  contact: string;
  contactType: ContactType;
  summary?: Record<string, string | number>;
}

export type ParseResult =
  | { ok: true; lead: CleanLead }
  | { ok: false; error: string; spam?: boolean };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Clasifica un contacto como email, teléfono español válido, o null. */
export function classifyContact(raw: string): ContactType | null {
  const s = raw.trim();
  if (!s) return null;
  if (EMAIL_RE.test(s)) return "email";
  // Teléfono español: 9 dígitos que empiezan por 6/7/8/9, admite +34 / 0034.
  const digits = s.replace(/[\s.\-()]/g, "");
  if (/^(?:\+34|0034)?[6789]\d{8}$/.test(digits)) return "phone";
  return null;
}

/** Conserva solo los campos esperados del resumen y acota su tamaño. */
export function sanitizeSummary(
  summary: unknown
): Record<string, string | number> | undefined {
  if (typeof summary !== "object" || summary === null) return undefined;
  const allowed = [
    "municipality",
    "transferType",
    "transferDate",
    "outcome",
    "finalTax",
  ] as const;
  const src = summary as Record<string, unknown>;
  const out: Record<string, string | number> = {};
  for (const key of allowed) {
    const v = src[key];
    if (typeof v === "string") out[key] = v.slice(0, 120);
    else if (typeof v === "number" && Number.isFinite(v)) out[key] = v;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/** Valida y limpia un lead entrante. */
export function parseLead(body: RawLead): ParseResult {
  // Honeypot: si el campo trampa viene relleno, es un bot.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return { ok: false, error: "spam", spam: true };
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const contact =
    typeof body.contact === "string" ? body.contact.trim().slice(0, 200) : "";
  const consent = body.consent === true;

  if (!name || !contact || !consent) {
    return {
      ok: false,
      error:
        "Faltan datos obligatorios (nombre, contacto y consentimiento expreso).",
    };
  }

  const contactType = classifyContact(contact);
  if (!contactType) {
    return {
      ok: false,
      error: "Introduce un email o un teléfono español válidos.",
    };
  }

  return {
    ok: true,
    lead: { name, contact, contactType, summary: sanitizeSummary(body.summary) },
  };
}
