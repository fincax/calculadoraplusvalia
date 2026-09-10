import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { aggregateEmbedEvents, type StoredEmbedEvent } from "@/lib/track/embed";

/**
 * Panel de uso de la calculadora embebida (webs integradoras, vistas y
 * cálculos). Protegido por autenticación básica en `src/middleware.ts`
 * (variables PANEL_USER / PANEL_PASS). Lee el JSONL de eventos del servidor.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Panel de uso",
  robots: { index: false, follow: false },
};

async function readEvents(): Promise<StoredEmbedEvent[]> {
  const file =
    process.env.EMBED_LOG_FILE ??
    path.join(process.cwd(), "embed-events.jsonl");
  let text: string;
  try {
    text = await readFile(file, "utf8");
  } catch {
    return [];
  }
  const events: StoredEmbedEvent[] = [];
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    try {
      const e = JSON.parse(t);
      if (e && (e.type === "view" || e.type === "calculate") && typeof e.site === "string") {
        events.push(e as StoredEmbedEvent);
      }
    } catch {
      /* ignora líneas corruptas */
    }
  }
  return events;
}

function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeStyle: "short" }).format(d);
}

export default async function PanelPage() {
  const events = await readEvents();
  const stats = aggregateEmbedEvents(events);
  const totalViews = stats.reduce((a, s) => a + s.views, 0);
  const totalCalc = stats.reduce((a, s) => a + s.calculations, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-900">
        Panel de uso · Calculadora embebida
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        Seguimiento propio y sin cookies del uso de la calculadora integrada en
        webs de clientes. {stats.length} web(s) · {totalViews} vista(s) ·{" "}
        {totalCalc} cálculo(s).
      </p>

      {stats.length === 0 ? (
        <p className="mt-8 rounded-lg border border-ink-300 bg-white p-5 text-sm text-ink-700">
          Aún no hay datos de uso. Aparecerán aquí cuando alguna web integre la
          calculadora y reciba visitas.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-300 text-left text-xs uppercase tracking-wide text-ink-500">
                <th scope="col" className="py-2 pr-4 font-semibold">Web integradora</th>
                <th scope="col" className="py-2 pr-4 text-right font-semibold">Vistas</th>
                <th scope="col" className="py-2 pr-4 text-right font-semibold">Cálculos</th>
                <th scope="col" className="py-2 text-right font-semibold">Último uso</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.site} className="border-b border-ink-100">
                  <td className="py-2 pr-4 text-ink-900">{s.site}</td>
                  <td className="py-2 pr-4 text-right tabular-nums text-ink-700">{s.views}</td>
                  <td className="py-2 pr-4 text-right tabular-nums text-ink-700">{s.calculations}</td>
                  <td className="py-2 text-right tabular-nums text-ink-500">{formatDateTime(s.lastSeen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
