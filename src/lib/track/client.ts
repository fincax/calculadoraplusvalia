"use client";

/**
 * Envío del evento de uso desde el navegador (solo en la versión embebida).
 * Fire-and-forget, sin cookies y sin datos personales ni económicos: solo el
 * tipo de evento y el municipio; el servidor deduce la web anfitriona.
 */
import type { EmbedEventType } from "./embed";

export function trackEmbedEvent(
  type: EmbedEventType,
  municipality?: string
): void {
  try {
    const body = JSON.stringify({
      type,
      municipality,
      // Dentro del iframe, document.referrer es la web anfitriona.
      origin: document.referrer || undefined,
    });
    void fetch("/api/embed-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* nunca debe romper la calculadora */
  }
}
