import type { APIRoute } from "astro";
import { getHadithBookBySlug, getHadithsByBookPaginated, getTotalHadithPages } from "../../../libs/db/queries/hadith.queries";

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const slug = params.book as string;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "100");

    const book = await getHadithBookBySlug(slug);
    if (!book) {
      return new Response(JSON.stringify({ error: "Book not found" }), { status: 404 });
    }

    const hadiths = await getHadithsByBookPaginated(book.id, page, limit);
    const totalPages = await getTotalHadithPages(book.id, limit);

    return new Response(JSON.stringify({ book, hadiths, page, limit, totalPages }), {
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
