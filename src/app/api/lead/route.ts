import { NextResponse } from "next/server";
import { appendFile } from "node:fs/promises";
import path from "node:path";
import { parseLead, type CleanLead } from "@/lib/leads/validation";

/**
 * Recepción de leads de la calculadora.
 *
 * RGPD: solo se aceptan solicitudes con consentimiento explícito y se
 * transmiten los datos mínimos. Para no perder NUNCA un contacto, el lead se
 * entrega por varias vías redundantes (todas opcionales según el entorno):
 *   1. Email a FINCAX vía SMTP, si `LEAD_SMTP_*` está configurado (nodemailer).
 *   2. Copia en un fichero JSONL (`LEAD_LOG_FILE`, por defecto ./leads.jsonl).
 *   3. Reenvío a `LEAD_WEBHOOK_URL` (Zapier/Make/CRM), si existe.
 * Si nada está configurado, al menos queda registrado en el log del proceso.
 */

export const runtime = "nodejs";

interface StoredLead {
  source: "calculadora-plusvalia";
  receivedAt: string;
  name: string;
  contact: string;
  contactType: CleanLead["contactType"];
  summary?: Record<string, string | number>;
}

// Límite de peticiones simple por IP (memoria del proceso), con purga de
// entradas caducadas para que el mapa no crezca de forma indefinida.
const hits = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function pruneHits(now: number): void {
  for (const [ip, entry] of hits) {
    if (now - entry.windowStart > WINDOW_MS) hits.delete(ip);
  }
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  if (hits.size > 5000) pruneHits(now);
  const entry = hits.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    hits.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

async function deliverByEmail(lead: StoredLead): Promise<boolean> {
  const host = process.env.LEAD_SMTP_HOST;
  const user = process.env.LEAD_SMTP_USER;
  const pass = process.env.LEAD_SMTP_PASS;
  if (!host || !user || !pass) return false;

  const { createTransport } = await import("nodemailer");
  const transport = createTransport({
    host,
    port: Number(process.env.LEAD_SMTP_PORT ?? 587),
    secure: process.env.LEAD_SMTP_SECURE === "true",
    auth: { user, pass },
  });

  const to = process.env.LEAD_TO ?? "fincaxsevilla@gmail.com";
  const summaryLines = lead.summary
    ? Object.entries(lead.summary)
        .map(([k, v]) => `  · ${k}: ${v}`)
        .join("\n")
    : "  (sin resumen)";

  await transport.sendMail({
    from: process.env.LEAD_FROM ?? user,
    to,
    replyTo: lead.contactType === "email" ? lead.contact : undefined,
    subject: `Nuevo lead — Calculadora de Plusvalía (${lead.summary?.municipality ?? "Sevilla"})`,
    text:
      `Nuevo contacto desde la calculadora de plusvalía:\n\n` +
      `Nombre: ${lead.name}\n` +
      `Contacto (${lead.contactType}): ${lead.contact}\n` +
      `Recibido: ${lead.receivedAt}\n\n` +
      `Resumen del cálculo:\n${summaryLines}\n`,
  });
  return true;
}

async function backupToFile(lead: StoredLead): Promise<void> {
  const file =
    process.env.LEAD_LOG_FILE ?? path.join(process.cwd(), "leads.jsonl");
  await appendFile(file, JSON.stringify(lead) + "\n", "utf8");
}

async function forwardToWebhook(lead: StoredLead): Promise<void> {
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (!webhook) return;
  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });
  if (!res.ok) throw new Error(`Webhook respondió ${res.status}`);
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

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Cuerpo de la petición no válido." },
      { status: 400 }
    );
  }

  const parsed = parseLead(raw as Record<string, unknown>);
  if (!parsed.ok) {
    // Al spam se le responde ok para no darle pistas; no se procesa.
    if (parsed.spam) return NextResponse.json({ ok: true });
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  const lead: StoredLead = {
    source: "calculadora-plusvalia",
    receivedAt: new Date().toISOString(),
    name: parsed.lead.name,
    contact: parsed.lead.contact,
    contactType: parsed.lead.contactType,
    summary: parsed.lead.summary,
  };

  // Se intentan todas las vías; basta con que una tenga éxito. Los fallos se
  // registran pero no se ocultan datos: el lead siempre acaba en algún sitio.
  const outcomes = await Promise.allSettled([
    deliverByEmail(lead),
    backupToFile(lead),
    forwardToWebhook(lead),
  ]);
  const anyDelivered = outcomes.some(
    (o) => o.status === "fulfilled" && o.value !== false
  );
  for (const o of outcomes) {
    if (o.status === "rejected") console.error("[lead] vía fallida:", o.reason);
  }

  if (!anyDelivered) {
    // Última red de seguridad: al log del proceso.
    console.info("[lead]", JSON.stringify(lead));
  }

  return NextResponse.json({ ok: true });
}
