import type { APIRoute } from "astro";
import { getAllHadithBooks } from "../../../libs/db/queries/hadith.queries";

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const books = await getAllHadithBooks();
    return new Response(JSON.stringify(books), {
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
