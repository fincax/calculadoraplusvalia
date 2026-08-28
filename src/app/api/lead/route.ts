import { NextResponse } from "next/server";

/**
 * Recepción de leads de la calculadora.
 *
 * RGPD: solo se aceptan solicitudes con consentimiento explícito y se
 * transmiten los datos mínimos. Si `LEAD_WEBHOOK_URL` está configurada
 * (Zapier/Make/CRM/email-bridge), el lead se reenvía allí; si no, se
 * registra en el log del servidor para no perderlo.
 */

interface LeadPayload {
  name?: unknown;
  contact?: unknown;
  consent?: unknown;
  summary?: unknown;
}

// Límite de peticiones muy simple por IP (memoria del proceso).
const hits = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    hits.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Demasiadas solicitudes. Inténtalo en un minuto." },
      { status: 429 }
    );
  }

  let body: LeadPayload;
  try {
    body = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Cuerpo de la petición no válido." },
      { status: 400 }
    );
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const contact =
    typeof body.contact === "string" ? body.contact.trim().slice(0, 200) : "";
  const consent = body.consent === true;

  if (!name || !contact || !consent) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Faltan datos obligatorios (nombre, contacto y consentimiento expreso).",
      },
      { status: 400 }
    );
  }

  const lead = {
    source: "calculadora-plusvalia",
    receivedAt: new Date().toISOString(),
    name,
    contact,
    summary: typeof body.summary === "object" && body.summary !== null ? body.summary : undefined,
  };

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
      if (!res.ok) throw new Error(`Webhook respondió ${res.status}`);
    } catch (err) {
      console.error("[lead] error reenviando al webhook:", err);
      // Aun así registramos el lead para no perderlo.
      console.info("[lead]", JSON.stringify(lead));
      return NextResponse.json({ ok: true });
    }
  } else {
    console.info("[lead]", JSON.stringify(lead));
  }

  return NextResponse.json({ ok: true });
}
