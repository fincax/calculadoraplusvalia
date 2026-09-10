import { NextResponse } from "next/server";
import { appendFile } from "node:fs/promises";
import path from "node:path";
import { parseEmbedEvent, type StoredEmbedEvent } from "@/lib/track/embed";

/**
 * Seguimiento propio del uso de la calculadora embebida. Cookieless y sin
 * datos personales ni económicos: solo tipo de evento, municipio y dominio de
 * la web anfitriona. Se guarda en un fichero JSONL en el servidor
 * (`EMBED_LOG_FILE`, por defecto ./embed-events.jsonl) que lee el panel.
 */

export const runtime = "nodejs";

const hits = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60; // generoso: una web con tráfico genera varios/min

function rateLimited(ip: string): boolean {
  const now = Date.now();
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (now - v.windowStart > WINDOW_MS) hits.delete(k);
  }
  const e = hits.get(ip);
  if (!e || now - e.windowStart > WINDOW_MS) {
    hits.set(ip, { count: 1, windowStart: now });
    return false;
  }
  e.count += 1;
  return e.count > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) return new NextResponse(null, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const event = parseEmbedEvent(body, request.headers.get("referer"));
  if (!event) return new NextResponse(null, { status: 400 });

  const stored: StoredEmbedEvent = { ...event, ts: new Date().toISOString() };
  const file =
    process.env.EMBED_LOG_FILE ??
    path.join(process.cwd(), "embed-events.jsonl");
  try {
    await appendFile(file, JSON.stringify(stored) + "\n", "utf8");
  } catch (err) {
    console.error("[embed-event] no se pudo guardar:", err);
    console.info("[embed-event]", JSON.stringify(stored));
  }

  return new NextResponse(null, { status: 204 });
}
