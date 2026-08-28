import type { MetadataRoute } from "next";
import { listMunicipalities } from "@/lib/plusvalia/data/municipalities";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fincax.es";

export default function sitemap(): MetadataRoute.Sitemap {
  const municipios: MetadataRoute.Sitemap = listMunicipalities()
    .filter((m) => m.code !== "sevilla")
    .map((m) => ({
      url: `${SITE_URL}/calculadora-plusvalia/${m.code}`,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [
    {
      url: `${SITE_URL}/calculadora-plusvalia`,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...municipios,
    { url: `${SITE_URL}/aviso-legal`, changeFrequency: "yearly", priority: 0.2 },
    {
      url: `${SITE_URL}/politica-privacidad`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
