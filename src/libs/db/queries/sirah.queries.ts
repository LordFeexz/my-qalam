import { eq, asc } from "drizzle-orm";
import { db } from "../index";
import { sirahChapters } from "../schema";

export async function getAllSirahChapters() {
  return db
    .select()
    .from(sirahChapters)
    .orderBy(asc(sirahChapters.chronologicalOrder));
}

export async function getSirahBySlug(slug: string) {
  const result = await db
    .select()
    .from(sirahChapters)
    .where(eq(sirahChapters.slug, slug));
  return result[0];
}
