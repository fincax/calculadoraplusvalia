import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EmbedCalculator from "@/components/calculator/EmbedCalculator";
import EmbedCredit from "@/components/calculator/EmbedCredit";
import { listMunicipalities } from "@/lib/plusvalia/data/municipalities";

/** Embebible con un municipio preseleccionado. No indexar. */
export const dynamicParams = false;

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return listMunicipalities().map((m) => ({ municipio: m.code }));
}

export default async function EmbedMunicipioPage({
  params,
}: {
  params: Promise<{ municipio: string }>;
}) {
  const { municipio } = await params;
  const exists = listMunicipalities().some((m) => m.code === municipio);
  if (!exists) notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <EmbedCalculator initialMunicipalityCode={municipio} />
      <EmbedCredit />
    </div>
  );
}
