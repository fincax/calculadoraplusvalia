import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protege el panel de uso (/panel) con autenticación básica HTTP. Credenciales
 * en variables de entorno PANEL_USER / PANEL_PASS. Si no están configuradas,
 * se deniega el acceso (mejor cerrado que abierto).
 */
export const config = { matcher: ["/panel/:path*"] };

export function middleware(request: NextRequest) {
  const user = process.env.PANEL_USER;
  const pass = process.env.PANEL_PASS;
  const deny = (msg: string) =>
    new NextResponse(msg, {
      status: user && pass ? 401 : 503,
      headers: { "WWW-Authenticate": 'Basic realm="FINCAX panel", charset="UTF-8"' },
    });

  if (!user || !pass) {
    return deny("Panel no configurado: define PANEL_USER y PANEL_PASS.");
  }

  const header = request.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme !== "Basic" || !encoded) return deny("Autenticación requerida.");

  let decoded = "";
  try {
    decoded = atob(encoded);
  } catch {
    return deny("Autenticación no válida.");
  }
  const sep = decoded.indexOf(":");
  const u = decoded.slice(0, sep);
  const p = decoded.slice(sep + 1);
  if (u !== user || p !== pass) return deny("Credenciales incorrectas.");

  return NextResponse.next();
}
