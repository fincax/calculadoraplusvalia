import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fincax.es";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/calculadora-plusvalia`,
      changeFrequency: "weekly",
      priority: 1,
    },
    { url: `${SITE_URL}/aviso-legal`, changeFrequency: "yearly", priority: 0.2 },
    {
      url: `${SITE_URL}/politica-privacidad`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
