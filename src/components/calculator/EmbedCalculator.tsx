"use client";

import { useEffect } from "react";
import PlusvaliaCalculator from "@/components/calculator/PlusvaliaCalculator";
import { trackEmbedEvent } from "@/lib/track/client";

/**
 * Envoltura de la calculadora para la versión embebible (iframe):
 *  - comunica su altura a la página anfitriona (postMessage) para que el
 *    script `embed.js` redimensione el iframe;
 *  - registra el uso (vista y cálculos) mediante el seguimiento propio.
 */
export default function EmbedCalculator({
  initialMunicipalityCode,
}: {
  initialMunicipalityCode?: string;
}) {
  useEffect(() => {
    trackEmbedEvent("view", initialMunicipalityCode);

    // Se mide el CONTENIDO (el fondo del último hijo del body), no el
    // documento: el body tiene `min-h-screen`, así que su alto sigue al del
    // iframe y medirlo provocaría un bucle de crecimiento infinito.
    let last = 0;
    const postHeight = () => {
      const children = Array.from(document.body.children);
      const bottom = Math.max(
        0,
        ...children.map((el) => el.getBoundingClientRect().bottom)
      );
      const height = Math.ceil(bottom + window.scrollY);
      if (height === last) return;
      last = height;
      window.parent?.postMessage({ type: "fincax:height", height }, "*");
    };
    postHeight();
    const ro = new ResizeObserver(postHeight);
    Array.from(document.body.children).forEach((el) => ro.observe(el));
    window.addEventListener("load", postHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener("load", postHeight);
    };
  }, [initialMunicipalityCode]);

  return (
    <PlusvaliaCalculator
      initialMunicipalityCode={initialMunicipalityCode}
      embedded
      onCalculate={(r) => trackEmbedEvent("calculate", r.rules.municipalityCode)}
    />
  );
}
