import { ImageResponse } from "next/og";

export const alt =
  "FINCAX · Calculadora de Plusvalía Municipal en Sevilla y provincia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagen para compartir en redes/WhatsApp (Open Graph por defecto). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#231f20",
          padding: 80,
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 56, fontWeight: 800 }}>
          <span style={{ color: "#ffffff" }}>finca</span>
          <span style={{ color: "#ee2629" }}>x</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>
            Calculadora de Plusvalia Municipal
          </div>
          <div style={{ marginTop: 24, fontSize: 40, color: "#d3d2d2" }}>
            Sevilla y provincia · Gratis y sin registro
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#aaabac" }}>
          Metodo objetivo vs. real · Detecta si no tienes que pagar
        </div>
      </div>
    ),
    size
  );
}
