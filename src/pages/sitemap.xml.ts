import type { APIRoute } from "astro";
import { generateSitemapXml, type SitemapEntry } from "$libs/metadata";

export const GET: APIRoute = async () => {
  const DOMAIN = import.meta.env.PUBLIC_DOMAIN;
  const routes: SitemapEntry[] = [];
  const now = new Date();

  // Static Pages
  const staticPages = [
    { path: "/", priority: 1.0, freq: "daily" as const },
    { path: "/search", priority: 0.9, freq: "daily" as const },
    { path: "/ai", priority: 0.8, freq: "weekly" as const },
    { path: "/quran", priority: 0.9, freq: "weekly" as const },
    { path: "/hadith", priority: 0.9, freq: "weekly" as const },
    { path: "/sirah", priority: 0.9, freq: "weekly" as const },
    { path: "/bookmarks", priority: 0.5, freq: "yearly" as const },
    { path: "/about", priority: 0.7, freq: "yearly" as const },
    { path: "/privacy", priority: 0.3, freq: "yearly" as const },
    { path: "/terms", priority: 0.3, freq: "yearly" as const },
  ];

  for (const page of staticPages) {
    routes.push({
      url: `${DOMAIN}${page.path === "/" ? "" : page.path}`,
      lastModified: now,
      changeFrequency: page.freq,
      priority: page.priority,
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
