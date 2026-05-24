import { sql } from "drizzle-orm";
import { db } from "../index";
import { quranAyahs, surahs, hadiths, hadithBooks, sirahChapters } from "../schema";

export interface SearchResultBase {
  id: string;
  entity: "quran" | "hadith" | "sirah";
  rank: number;
}

export interface QuranSearchResult extends SearchResultBase {
  entity: "quran";
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  arabicText: string;
  translationId: string;
}

export interface HadithSearchResult extends SearchResultBase {
  entity: "hadith";
  bookSlug: string;
  bookName: string;
  number: number;
  arabicText: string;
  translationId: string;
  grade: string | null;
}

export interface SirahSearchResult extends SearchResultBase {
  entity: "sirah";
  slug: string;
  title: string;
  description: string | null;
  yearLabel: string | null;
}

export type SearchResult = QuranSearchResult | HadithSearchResult | SirahSearchResult;

export async function searchAllEntities(
  query: string,
  filter: "all" | "quran" | "hadith" | "sirah" = "all"
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const limit = filter === "all" ? 10 : 30;

  // Search Quran
  if (filter === "all" || filter === "quran") {
    const quranResults = await db.execute(sql`
      SELECT 
        qa.id,
        qa.ayah_number AS "ayahNumber",
        qa.arabic_text AS "arabicText",
        qa.translation_id AS "translationId",
        s.number AS "surahNumber",
        s.name_latin AS "surahName",
        ts_rank(qa.search_document, plainto_tsquery('simple', f_unaccent(${query}))) AS rank
      FROM ${quranAyahs} qa
      JOIN ${surahs} s ON qa.surah_id = s.id
      WHERE qa.search_document @@ plainto_tsquery('simple', f_unaccent(${query}))
         OR qa.arabic_text ILIKE '%' || ${query} || '%'
         OR qa.translation_id ILIKE '%' || ${query} || '%'
      ORDER BY rank DESC
      LIMIT ${limit}
    `);

    results.push(
      ...quranResults.rows.map((row: any) => ({
        id: `quran-${row.id}`,
        entity: "quran" as const,
        rank: row.rank || 0,
        surahNumber: row.surahNumber,
        surahName: row.surahName,
        ayahNumber: row.ayahNumber,
        arabicText: row.arabicText,
        translationId: row.translationId,
      }))
    );
  }

  // Search Hadith
  if (filter === "all" || filter === "hadith") {
    const hadithResults = await db.execute(sql`
      SELECT 
        h.id,
        h.number,
        h.arabic_text AS "arabicText",
        h.translation_id AS "translationId",
        h.grade,
        b.slug AS "bookSlug",
        b.name AS "bookName",
        ts_rank(h.search_document, plainto_tsquery('simple', f_unaccent(${query}))) AS rank
      FROM ${hadiths} h
      JOIN ${hadithBooks} b ON h.book_id = b.id
      WHERE h.search_document @@ plainto_tsquery('simple', f_unaccent(${query}))
         OR h.arabic_text ILIKE '%' || ${query} || '%'
         OR h.translation_id ILIKE '%' || ${query} || '%'
      ORDER BY rank DESC
      LIMIT ${limit}
    `);

    results.push(
      ...hadithResults.rows.map((row: any) => ({
        id: `hadith-${row.id}`,
        entity: "hadith" as const,
        rank: row.rank || 0,
        bookSlug: row.bookSlug,
        bookName: row.bookName,
        number: row.number,
        arabicText: row.arabicText,
        translationId: row.translationId,
        grade: row.grade,
      }))
    );
  }

  // Search Sirah
  if (filter === "all" || filter === "sirah") {
    const sirahResults = await db.execute(sql`
      SELECT 
        id,
        slug,
        title,
        description,
        year_label AS "yearLabel",
        ts_rank(search_document, plainto_tsquery('indonesian', f_unaccent(${query}))) AS rank
      FROM ${sirahChapters}
      WHERE search_document @@ plainto_tsquery('indonesian', f_unaccent(${query}))
         OR title ILIKE '%' || ${query} || '%'
         OR description ILIKE '%' || ${query} || '%'
         OR content ILIKE '%' || ${query} || '%'
      ORDER BY rank DESC
      LIMIT ${limit}
    `);

    results.push(
      ...sirahResults.rows.map((row: any) => ({
        id: `sirah-${row.id}`,
        entity: "sirah" as const,
        rank: row.rank || 0,
        slug: row.slug,
        title: row.title,
        description: row.description,
        yearLabel: row.yearLabel,
      }))
    );
  }

  // Sort combined results by rank if filter is 'all'
  if (filter === "all") {
    results.sort((a, b) => b.rank - a.rank);
  }

  return results;
}
