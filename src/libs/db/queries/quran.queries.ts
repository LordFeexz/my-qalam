import { eq, inArray, asc, and } from "drizzle-orm";
import { db } from "../index";
import { surahs, quranAyahs, tafsirs } from "../schema";

export async function getAllSurahs() {
  return db.select().from(surahs).orderBy(asc(surahs.number));
}

export async function getSurahByNumber(number: number) {
  const result = await db.select().from(surahs).where(eq(surahs.number, number));
  return result[0];
}

export async function getAyahsBySurah(surahId: number) {
  return db
    .select()
    .from(quranAyahs)
    .where(eq(quranAyahs.surahId, surahId))
    .orderBy(asc(quranAyahs.ayahNumber));
}

export async function getTafsirsByAyahIds(ayahIds: string[], source?: "kemenag") {
  if (ayahIds.length === 0) return [];
  
  const conditions = [inArray(tafsirs.ayahId, ayahIds)];
  if (source) {
    conditions.push(eq(tafsirs.source, source));
  }
  
  return db.select().from(tafsirs).where(and(...conditions));
}
