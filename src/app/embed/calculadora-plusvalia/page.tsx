import type { Metadata } from "next";
import EmbedCalculator from "@/components/calculator/EmbedCalculator";
import EmbedCredit from "@/components/calculator/EmbedCredit";

/** Versión embebible (iframe) para integrar en webs de terceros. No indexar. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function EmbedCalculadoraPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <EmbedCalculator />
      <EmbedCredit />
    </div>
  );
}
