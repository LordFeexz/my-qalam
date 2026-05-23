import type { APIRoute } from "astro";
import { getSurahByNumber, getAyahsBySurah, getTafsirsByAyahIds } from "../../../libs/db/queries/quran.queries";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const number = parseInt(params.number as string);
    if (isNaN(number)) {
      return new Response(JSON.stringify({ error: "Invalid surah number" }), { status: 400 });
    }

    const surah = await getSurahByNumber(number);
    if (!surah) {
      return new Response(JSON.stringify({ error: "Surah not found" }), { status: 404 });
    }

    const ayahs = await getAyahsBySurah(surah.id);
    const ayahIds = ayahs.map((a) => a.id);
    const tafsirs = await getTafsirsByAyahIds(ayahIds, "kemenag");

    return new Response(JSON.stringify({ surah, ayahs, tafsirs }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
