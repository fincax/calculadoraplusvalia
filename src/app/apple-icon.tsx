import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Icono para iOS/Safari (marca FINCAX: fondo negro, «x» roja). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#231f20",
          borderRadius: 36,
        }}
      >
        <div style={{ fontSize: 120, fontWeight: 800, color: "#ee2629" }}>x</div>
      </div>
    ),
    size
  );
}
