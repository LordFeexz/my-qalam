import type { APIRoute } from "astro";
import { generateRobotsTxt } from "$libs/metadata";
import { getAllHadithBooks } from "$libs/db/queries/hadith.queries";

export const GET: APIRoute = async () => {
  const host = import.meta.env.PUBLIC_DOMAIN;
  
  const books = await getAllHadithBooks();
  const hadithSitemaps = books.map(
    (book) => `${host}/sitemaps/hadith/${book.slug}/sitemap.xml`
  );

  const content = generateRobotsTxt(
    [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/*", "/_astro/*"],
      },
    ],
    [
      `${host}/sitemap.xml`,
      `${host}/sitemaps/quran/sitemap.xml`,
      `${host}/sitemaps/sirah/sitemap.xml`,
      ...hadithSitemaps,
    ],
    host
  );

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400",
    },
  });
};
