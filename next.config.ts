import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        // Sevilla capital se sirve en la página principal (no tiene página
        // por municipio, para no canibalizar la consulta). Redirigimos el
        // slug para no dejar un 404 indexable.
        source: "/calculadora-plusvalia/sevilla",
        destination: "/calculadora-plusvalia",
        permanent: true,
      },
    ];
  },
  async headers() {
    const common = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      {
        // HSTS: solo surte efecto sobre HTTPS (en producción, tras Nginx).
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
    ];
    // CSP base compartida (origen propio; inline permitido por el arranque de
    // Next y el JSON-LD). Solo cambia la directiva frame-ancestors.
    const cspBase = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ];
    return [
      {
        // Todo EXCEPTO /embed: no se puede enmarcar (anti-clickjacking).
        source: "/((?!embed).*)",
        headers: [
          ...common,
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Content-Security-Policy",
            value: [...cspBase, "frame-ancestors 'none'"].join("; "),
          },
        ],
      },
      {
        // Versión embebible: enmarcable por cualquier web de clientes.
        source: "/embed/:path*",
        headers: [
          ...common,
          {
            key: "Content-Security-Policy",
            value: [...cspBase, "frame-ancestors *"].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
