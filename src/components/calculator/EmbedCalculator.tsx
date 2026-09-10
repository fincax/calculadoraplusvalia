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

    const postHeight = () => {
      const height = Math.ceil(
        document.documentElement.scrollHeight || document.body.scrollHeight
      );
      window.parent?.postMessage({ type: "fincax:height", height }, "*");
    };
    postHeight();
    const ro = new ResizeObserver(postHeight);
    ro.observe(document.body);
    window.addEventListener("load", postHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener("load", postHeight);
    };
  }, [initialMunicipalityCode]);

  return (
    <PlusvaliaCalculator
      initialMunicipalityCode={initialMunicipalityCode}
      onCalculate={(r) => trackEmbedEvent("calculate", r.rules.municipalityCode)}
    />
  );
}
