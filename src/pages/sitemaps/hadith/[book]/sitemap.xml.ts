import type { APIRoute } from "astro";
import { generateSitemapXml, type SitemapEntry } from "$libs/metadata";
import { getAllHadithBooks } from "$libs/db/queries/hadith.queries";
import { db } from "$libs/db/index";
import { hadiths as hadithSchema } from "$libs/db/schema";
import { eq } from "drizzle-orm";

export async function getStaticPaths() {
  const books = await getAllHadithBooks();
  return books.map((book) => ({
    params: { book: book.slug },
    props: { book },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { book } = props;
  const DOMAIN = import.meta.env.PUBLIC_DOMAIN;
  const routes: SitemapEntry[] = [];
  const now = new Date();

  // Add the main book list page (starts at page 1)
  routes.push({
    url: `${DOMAIN}/hadith/${book.slug}/1`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  });

  // Query all hadith numbers for this book to generate their individual pages
  const hadithNumbers = await db
    .select({ number: hadithSchema.number })
    .from(hadithSchema)
    .where(eq(hadithSchema.bookId, book.id));

  for (const h of hadithNumbers) {
    routes.push({
      url: `${DOMAIN}/hadith/${book.slug}/hadith/${h.number}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  // Generate pagination links
  // The site groups hadith by pages of 50 or 100, we don't exactly know the pagination size here,
  // but usually Google will crawl links from page 1, so it's less critical to list all pagination URLs.
  // The main individual hadith URLs are the most important for SEO.

  const xml = generateSitemapXml(routes).trim();

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400",
    },
  });
};
