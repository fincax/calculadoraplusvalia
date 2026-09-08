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
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
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
          {
            // Política de seguridad de contenido. Todo el sitio es de origen
            // propio; se permite inline en scripts/estilos porque Next.js
            // inyecta arranque e hidratación sin nonce, y el JSON-LD va inline.
            // Se bloquean marcos, objetos, y se acota base-uri y form-action.
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data:",
              "font-src 'self'",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
