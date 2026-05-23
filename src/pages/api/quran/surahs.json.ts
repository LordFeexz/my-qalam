import type { APIRoute } from "astro";
import { getAllSurahs } from "../../../libs/db/queries/quran.queries";

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const surahs = await getAllSurahs();
    return new Response(JSON.stringify(surahs), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
