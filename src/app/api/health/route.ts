import { NextResponse } from "next/server";

/**
 * Comprobación de salud para el despliegue (scripts/deploy.sh) y la
 * monitorización. Responde 200 con un cuerpo mínimo; no expone datos.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok", time: new Date().toISOString() });
}
