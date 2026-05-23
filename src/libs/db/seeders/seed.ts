import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { db } from "../index";
import {
	surahs,
	quranAyahs,
	tafsirs,
	hadithBooks,
	hadiths,
	sirahChapters,
} from "../schema";

// Helper for chunking array into smaller arrays
function chunkArray<T>(array: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}
	return chunks;
}

// Helper to generate slugs
function slugify(text: string): string {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-") // Replace spaces with -
		.replace(/[^\w\-]+/g, "") // Remove all non-word chars
		.replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

const DATA_DIR = join(process.cwd(), "data");

async function seedQuran() {
	console.log("Seeding Quran (Surahs, Ayahs, and Tafsirs)...");
	const surahDir = join(DATA_DIR, "surah");
	const files = readdirSync(surahDir).filter((f) => f.endsWith(".json"));

	for (const file of files) {
		const filePath = join(surahDir, file);
		const data = JSON.parse(readFileSync(filePath, "utf-8"));

		// The JSON is wrapped in an object with the surah number as the key
		const surahNumber = Object.keys(data)[0];
		const surahData = data[surahNumber];

		// 1. Insert Surah
		const [insertedSurah] = await db
			.insert(surahs)
			.values({
				number: parseInt(surahData.number, 10),
				nameArabic: surahData.name,
				nameLatin: surahData.name_latin,
				totalAyah: parseInt(surahData.number_of_ayah, 10),
			})
			.onConflictDoNothing()
			.returning({ id: surahs.id });

		if (!insertedSurah) {
			console.log(`Surah ${surahNumber} already exists. Skipping...`);
			continue;
		}

		console.log(`Inserted Surah ${surahData.name_latin}`);

		// 2. Prepare Ayahs
		const ayahsToInsert: typeof quranAyahs.$inferInsert[] = [];
		const tafsirsToInsert: typeof tafsirs.$inferInsert[] = [];

		const totalAyahs = parseInt(surahData.number_of_ayah, 10);
		for (let i = 1; i <= totalAyahs; i++) {
			const ayahNumStr = i.toString();
			const arabicText = surahData.text[ayahNumStr] || "";
			const translationId = surahData.translations?.id?.text?.[ayahNumStr] || "";

			ayahsToInsert.push({
				surahId: insertedSurah.id,
				ayahNumber: i,
				arabicText,
				translationId,
			});
		}

		// Insert Ayahs
		const insertedAyahs = await db
			.insert(quranAyahs)
			.values(ayahsToInsert)
			.returning({ id: quranAyahs.id, ayahNumber: quranAyahs.ayahNumber });

		// 3. Prepare Tafsirs
		// Map ayah numbers to their new UUIDs
		const ayahIdMap = new Map<number, string>();
		insertedAyahs.forEach((a) => ayahIdMap.set(a.ayahNumber, a.id));

		const kemenagTafsir = surahData.tafsir?.id?.kemenag;
		if (kemenagTafsir && kemenagTafsir.text) {
			for (let i = 1; i <= totalAyahs; i++) {
				const ayahNumStr = i.toString();
				const content = kemenagTafsir.text[ayahNumStr];
				const ayahId = ayahIdMap.get(i);

				if (content && ayahId) {
					tafsirsToInsert.push({
						ayahId: ayahId,
						source: "kemenag",
						sourceName: kemenagTafsir.source || "Kementerian Agama RI",
						language: "id",
						content: content,
					});
				}
			}
		}

		if (tafsirsToInsert.length > 0) {
			// Insert in chunks
			for (const chunk of chunkArray(tafsirsToInsert, 100)) {
				await db.insert(tafsirs).values(chunk);
			}
		}
	}
	console.log("Finished seeding Quran!");
}

async function seedHadiths() {
	console.log("Seeding Hadith Books and Hadiths...");
	const booksDir = join(DATA_DIR, "books");
	const files = readdirSync(booksDir).filter((f) => f.endsWith(".json"));

	const BOOK_NAMES: Record<string, string> = {
		"abu-daud": "Sunan Abu Daud",
		ahmad: "Musnad Ahmad",
		bukhari: "Sahih Bukhari",
		darimi: "Sunan Ad-Darimi",
		"ibnu-majah": "Sunan Ibnu Majah",
		malik: "Muwaththa Malik",
		muslim: "Sahih Muslim",
		nasai: "Sunan An-Nasai",
		tirmidzi: "Jami At-Tirmidzi",
	};

	for (const file of files) {
		const slug = file.replace(".json", "");
		const bookName = BOOK_NAMES[slug] || slug;

		console.log(`Processing Hadith Book: ${bookName}`);
		const filePath = join(booksDir, file);
		const data: any[] = JSON.parse(readFileSync(filePath, "utf-8"));

		// Insert Book
		const [insertedBook] = await db
			.insert(hadithBooks)
			.values({
				slug,
				name: bookName,
				totalHadith: data.length,
			})
			.onConflictDoNothing()
			.returning({ id: hadithBooks.id });

		if (!insertedBook) {
			console.log(`Book ${bookName} already exists. Skipping hadiths...`);
			continue;
		}

		// Prepare Hadiths
		const hadithsToInsert = data.map((h: any) => ({
			bookId: insertedBook.id,
			number: typeof h.number === "string" ? parseInt(h.number, 10) : h.number,
			arabicText: h.arab,
			translationId: h.id,
			grade: h.grade || null,
			chapter: h.chapter || null,
		}));

		// Insert Hadiths in chunks
		const chunks = chunkArray(hadithsToInsert, 1000);
		for (const chunk of chunks) {
			await db.insert(hadiths).values(chunk);
		}
		console.log(`Inserted ${hadithsToInsert.length} hadiths for ${bookName}`);
	}
	console.log("Finished seeding Hadiths!");
}

async function seedSirah() {
	console.log("Seeding Sirah...");
	const sirahFile = join(DATA_DIR, "sirah", "data.json");
	const data: any[] = JSON.parse(readFileSync(sirahFile, "utf-8"));

	const chaptersToInsert = data.map((s: any, index: number) => ({
		slug: slugify(s.title),
		title: s.title,
		description: s.description || null,
		content: s.sirah,
		yearLabel: s.year || null,
		chronologicalOrder: index + 1,
		page: s.page || null,
	}));

	const chunks = chunkArray(chaptersToInsert, 50);
	for (const chunk of chunks) {
		await db.insert(sirahChapters).values(chunk).onConflictDoNothing();
	}
	console.log(`Inserted ${chaptersToInsert.length} Sirah chapters!`);
}

async function run() {
	try {
		await seedSirah();
		await seedHadiths();
		await seedQuran();
		console.log("Seeding complete!");
		process.exit(0);
	} catch (error) {
		console.error("Error during seeding:", error);
		process.exit(1);
	}
}

run();
