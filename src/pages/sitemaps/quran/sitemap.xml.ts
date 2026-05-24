import type { APIRoute } from "astro";
import { generateSitemapXml, type SitemapEntry } from "$libs/metadata";
import { getAllSurahs } from "$libs/db/queries/quran.queries";

export const GET: APIRoute = async () => {
  const DOMAIN = import.meta.env.PUBLIC_DOMAIN;
  const routes: SitemapEntry[] = [];
  const now = new Date();

  const surahs = await getAllSurahs();

  for (const surah of surahs) {
    routes.push({
      url: `${DOMAIN}/quran/${surah.number}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  const xml = generateSitemapXml(routes).trim();

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400",
    },
  });
};
