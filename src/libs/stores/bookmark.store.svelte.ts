export interface SurahBookmark {
  id: string; // "surah-{number}"
  type: "surah";
  number: number;
  nameLatin: string;
  nameArabic: string;
  totalAyah: number;
  savedAt: number;
}

export interface AyahBookmark {
  id: string; // "ayah-{surahNumber}-{ayahNumber}"
  type: "ayah";
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  translationSnippet: string;
  savedAt: number;
}

export interface HadithBookBookmark {
  id: string; // "hadithBook-{slug}"
  type: "hadithBook";
  slug: string;
  name: string;
  totalHadith: number | null;
  savedAt: number;
}

export interface HadithBookmark {
  id: string; // "hadith-{bookSlug}-{number}"
  type: "hadith";
  bookSlug: string;
  bookName: string;
  number: number;
  translationSnippet: string;
  grade?: string | null;
  savedAt: number;
}

export interface SirahBookmark {
  id: string; // "sirah-{slug}"
  type: "sirah";
  slug: string;
  title: string;
  yearLabel: string | null;
  savedAt: number;
}

export type BookmarkType = "surah" | "ayah" | "hadithBook" | "hadith" | "sirah";
export type AnyBookmark = SurahBookmark | AyahBookmark | HadithBookBookmark | HadithBookmark | SirahBookmark;

const STORAGE_KEY = "my-qalam-bookmarks";

class BookmarkStore {
  bookmarks = $state<Record<string, AnyBookmark>>({});

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.bookmarks = JSON.parse(stored);
        }
      } catch (e) {
        console.error("Failed to load bookmarks", e);
      }
    }
  }

  private save() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.bookmarks));
      } catch (e) {
        console.error("Failed to save bookmarks", e);
      }
    }
  }

  toggleBookmark(item: AnyBookmark) {
    if (this.bookmarks[item.id]) {
      const newBookmarks = { ...this.bookmarks };
      delete newBookmarks[item.id];
      this.bookmarks = newBookmarks;
    } else {
      this.bookmarks = { ...this.bookmarks, [item.id]: { ...item, savedAt: Date.now() } };
    }
    this.save();
  }

  isBookmarked(id: string): boolean {
    return !!this.bookmarks[id];
  }

  getBookmarksByType<T extends AnyBookmark>(type: BookmarkType): T[] {
    return Object.values(this.bookmarks)
      .filter((b) => b.type === type)
      .sort((a, b) => b.savedAt - a.savedAt) as T[];
  }

  removeBookmark(id: string) {
    const newBookmarks = { ...this.bookmarks };
    delete newBookmarks[id];
    this.bookmarks = newBookmarks;
    this.save();
  }
}

export const bookmarkStore = new BookmarkStore();
