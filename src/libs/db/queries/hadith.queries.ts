import { eq, asc, sql } from "drizzle-orm";
import { db } from "../index";
import { hadithBooks, hadiths } from "../schema";

export async function getAllHadithBooks() {
  return db.select().from(hadithBooks).orderBy(asc(hadithBooks.id));
}

export async function getHadithBookBySlug(slug: string) {
  const result = await db.select().from(hadithBooks).where(eq(hadithBooks.slug, slug));
  return result[0];
}

export async function getHadithsByBookPaginated(bookId: number, page: number, limit: number) {
  const offset = (page - 1) * limit;
  return db
    .select()
    .from(hadiths)
    .where(eq(hadiths.bookId, bookId))
    .orderBy(asc(hadiths.number))
    .limit(limit)
    .offset(offset);
}

export async function getTotalHadithPages(bookId: number, limit: number) {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(hadiths)
    .where(eq(hadiths.bookId, bookId));
  return Math.ceil(Number(count) / limit);
}

export async function getHadithByBookAndNumber(bookId: number, number: number) {
  const result = await db
    .select()
    .from(hadiths)
    .where(sql`${hadiths.bookId} = ${bookId} AND ${hadiths.number} = ${number}`);
  return result[0];
}
