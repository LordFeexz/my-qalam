import type { APIRoute } from "astro";
import { getSirahBySlug } from "../../../libs/db/queries/sirah.queries";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const slug = params.slug as string;
    const chapter = await getSirahBySlug(slug);

    if (!chapter) {
      return new Response(JSON.stringify({ error: "Chapter not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(chapter), {
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
