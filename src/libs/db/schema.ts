import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  index,
  uniqueIndex,
  boolean,
  serial,
  pgEnum,
  customType,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

/* =========================================================
   VECTOR TYPE
========================================================= */

export const vector = customType<{
  data: number[];
  driverData: string;
}>({
  dataType() {
    return "vector(1536)";
  },
});

export const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

/* =========================================================
   ENUMS
========================================================= */

export const contentLanguageEnum = pgEnum("content_language", [
  "id",
  "en",
  "ar",
]);

export const tafsirSourceEnum = pgEnum("tafsir_source", [
  "kemenag",
]);

export const searchEntityEnum = pgEnum("search_entity", [
  "quran",
  "hadith",
  "sirah",
  "tafsir",
]);

/* =========================================================
   TIMESTAMPS
========================================================= */

const timestamps = {
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
};

/* =========================================================
   QURAN SURAHS
========================================================= */

export const surahs = pgTable(
  "surahs",
  {
    id: serial("id").primaryKey(),

    number: integer("number").notNull().unique(),

    nameArabic: varchar("name_arabic", {
      length: 255,
    }).notNull(),

    nameLatin: varchar("name_latin", {
      length: 255,
    }).notNull(),

    totalAyah: integer("total_ayah").notNull(),

    revelationPlace: varchar("revelation_place", {
      length: 50,
    }),

    createdAt: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  },
  (table) => ({
    numberIdx: uniqueIndex("surahs_number_idx").on(table.number),

    nameLatinTrgmIdx: index("surahs_name_latin_trgm_idx").using(
      "gin",
      sql`${table.nameLatin} gin_trgm_ops`,
    ),
  }),
);

/* =========================================================
   QURAN AYAHS
========================================================= */

export const quranAyahs = pgTable(
  "quran_ayahs",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    surahId: integer("surah_id")
      .references(() => surahs.id, {
        onDelete: "cascade",
      })
      .notNull(),

    ayahNumber: integer("ayah_number").notNull(),

    arabicText: text("arabic_text").notNull(),

    normalizedArabicText: text("normalized_arabic_text"),

    translationId: text("translation_id").notNull(),

    translationEn: text("translation_en"),

    juz: integer("juz"),

    hizb: integer("hizb"),

    page: integer("page"),

    sajda: boolean("sajda").default(false),

    searchDocument: tsvector("search_document").generatedAlwaysAs(sql`
      setweight(
        to_tsvector(
          'simple',
          f_unaccent(coalesce(arabic_text, ''))
        ),
        'A'
      )
      ||
      setweight(
        to_tsvector(
          'indonesian',
          f_unaccent(coalesce(translation_id, ''))
        ),
        'B'
      )
      ||
      setweight(
        to_tsvector(
          'english',
          f_unaccent(coalesce(translation_en, ''))
        ),
        'C'
      )
    `),

    embedding: vector("embedding"),

    createdAt: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  },
  (table) => ({
    surahAyahUnique: uniqueIndex("surah_ayah_unique_idx").on(
      table.surahId,
      table.ayahNumber,
    ),

    surahIdx: index("quran_ayahs_surah_idx").on(table.surahId),

    quranFtsIdx: index("quran_ayahs_fts_idx").using(
      "gin",
      sql`${table.searchDocument}`,
    ),

    arabicTrgmIdx: index("quran_ayahs_arabic_trgm_idx").using(
      "gin",
      sql`${table.arabicText} gin_trgm_ops`,
    ),

    translationIdTrgmIdx: index(
      "quran_ayahs_translation_id_trgm_idx",
    ).using("gin", sql`${table.translationId} gin_trgm_ops`),

    translationEnTrgmIdx: index(
      "quran_ayahs_translation_en_trgm_idx",
    ).using("gin", sql`${table.translationEn} gin_trgm_ops`),

    embeddingIdx: index("quran_ayahs_embedding_idx").using(
      "ivfflat",
      sql`${table.embedding} vector_cosine_ops`,
    ),
  }),
);

/* =========================================================
   TAFSIRS
========================================================= */

export const tafsirs = pgTable(
  "tafsirs",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    ayahId: uuid("ayah_id")
      .references(() => quranAyahs.id, {
        onDelete: "cascade",
      })
      .notNull(),

    source: tafsirSourceEnum("source").notNull(),

    sourceName: varchar("source_name", {
      length: 255,
    }).notNull(),

    sourceUrl: text("source_url"),

    language: contentLanguageEnum("language")
      .default("id")
      .notNull(),

    content: text("content").notNull(),

    searchDocument: tsvector("search_document").generatedAlwaysAs(sql`
      setweight(
        to_tsvector(
          'indonesian',
          f_unaccent(coalesce(content, ''))
        ),
        'A'
      )
    `),

    embedding: vector("embedding"),

    createdAt: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  },
  (table) => ({
    ayahSourceUnique: uniqueIndex(
      "tafsir_ayah_source_unique_idx",
    ).on(table.ayahId, table.source, table.language),

    tafsirFtsIdx: index("tafsir_fts_idx").using(
      "gin",
      sql`${table.searchDocument}`,
    ),

    tafsirTrgmIdx: index("tafsir_content_trgm_idx").using(
      "gin",
      sql`${table.content} gin_trgm_ops`,
    ),

    embeddingIdx: index("tafsir_embedding_idx").using(
      "ivfflat",
      sql`${table.embedding} vector_cosine_ops`,
    ),
  }),
);

/* =========================================================
   HADITH BOOKS
========================================================= */

export const hadithBooks = pgTable(
  "hadith_books",
  {
    id: serial("id").primaryKey(),

    slug: varchar("slug", {
      length: 100,
    }).notNull().unique(),

    name: varchar("name", {
      length: 255,
    }).notNull(),

    totalHadith: integer("total_hadith"),

    description: text("description"),

    createdAt: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  },
  (table) => ({
    slugIdx: uniqueIndex("hadith_books_slug_idx").on(table.slug),
  }),
);

/* =========================================================
   HADITHS
========================================================= */

export const hadiths = pgTable(
  "hadiths",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    bookId: integer("book_id")
      .references(() => hadithBooks.id, {
        onDelete: "cascade",
      })
      .notNull(),

    number: integer("number").notNull(),

    arabicText: text("arabic_text").notNull(),

    translationId: text("translation_id").notNull(),

    grade: varchar("grade", {
      length: 50,
    }),

    chapter: varchar("chapter", {
      length: 255,
    }),

    searchDocument: tsvector("search_document").generatedAlwaysAs(sql`
      setweight(
        to_tsvector(
          'simple',
          f_unaccent(coalesce(arabic_text, ''))
        ),
        'A'
      )
      ||
      setweight(
        to_tsvector(
          'indonesian',
          f_unaccent(coalesce(translation_id, ''))
        ),
        'B'
      )
      ||
      setweight(
        to_tsvector(
          'simple',
          f_unaccent(coalesce(chapter, ''))
        ),
        'C'
      )
    `),

    embedding: vector("embedding"),

    createdAt: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  },
  (table) => ({
    bookNumberUnique: uniqueIndex(
      "hadith_book_number_unique_idx",
    ).on(table.bookId, table.number),

    hadithFtsIdx: index("hadiths_fts_idx").using(
      "gin",
      sql`${table.searchDocument}`,
    ),

    hadithArabicTrgmIdx: index(
      "hadiths_arabic_trgm_idx",
    ).using("gin", sql`${table.arabicText} gin_trgm_ops`),

    hadithTranslationTrgmIdx: index(
      "hadiths_translation_trgm_idx",
    ).using("gin", sql`${table.translationId} gin_trgm_ops`),

    embeddingIdx: index("hadith_embedding_idx").using(
      "ivfflat",
      sql`${table.embedding} vector_cosine_ops`,
    ),
  }),
);

/* =========================================================
   SIRAH
========================================================= */

export const sirahChapters = pgTable(
  "sirah_chapters",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    slug: varchar("slug", {
      length: 255,
    }).notNull().unique(),

    title: varchar("title", {
      length: 500,
    }).notNull(),

    description: text("description"),

    content: text("content").notNull(),

    yearLabel: varchar("year_label", {
      length: 100,
    }),

    chronologicalOrder: integer("chronological_order"),

    page: integer("page"),

    searchDocument: tsvector("search_document").generatedAlwaysAs(sql`
      setweight(
        to_tsvector(
          'indonesian',
          f_unaccent(coalesce(title, ''))
        ),
        'A'
      )
      ||
      setweight(
        to_tsvector(
          'indonesian',
          f_unaccent(coalesce(description, ''))
        ),
        'B'
      )
      ||
      setweight(
        to_tsvector(
          'indonesian',
          f_unaccent(coalesce(content, ''))
        ),
        'A'
      )
    `),

    embedding: vector("embedding"),

    createdAt: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  },
  (table) => ({
    slugIdx: uniqueIndex("sirah_slug_idx").on(table.slug),

    sirahFtsIdx: index("sirah_fts_idx").using(
      "gin",
      sql`${table.searchDocument}`,
    ),

    sirahTitleTrgmIdx: index("sirah_title_trgm_idx").using(
      "gin",
      sql`${table.title} gin_trgm_ops`,
    ),

    sirahContentTrgmIdx: index("sirah_content_trgm_idx").using(
      "gin",
      sql`${table.content} gin_trgm_ops`,
    ),

    embeddingIdx: index("sirah_embedding_idx").using(
      "ivfflat",
      sql`${table.embedding} vector_cosine_ops`,
    ),
  }),
);
