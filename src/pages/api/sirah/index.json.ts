import type { APIRoute } from "astro";
import { getAllSirahChapters } from "../../../libs/db/queries/sirah.queries";

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const chapters = await getAllSirahChapters();
    return new Response(JSON.stringify(chapters), {
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
