import type { APIRoute } from "astro";
import { getHadithBookBySlug, getHadithByBookAndNumber } from "../../../../libs/db/queries/hadith.queries";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const slug = params.book as string;
    const number = parseInt(params.number as string);

    if (isNaN(number)) {
      return new Response(JSON.stringify({ error: "Invalid hadith number" }), { status: 400 });
    }

    const book = await getHadithBookBySlug(slug);
    if (!book) {
      return new Response(JSON.stringify({ error: "Book not found" }), { status: 404 });
    }

    const hadith = await getHadithByBookAndNumber(book.id, number);
    if (!hadith) {
      return new Response(JSON.stringify({ error: "Hadith not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ book, hadith }), {
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
