import type { APIRoute } from "astro";
import { searchAllEntities } from "$libs/db/queries/search.queries";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() || "";
  const filterParam = url.searchParams.get("filter");
  
  let filter: "all" | "quran" | "hadith" | "sirah" = "all";
  if (filterParam === "quran" || filterParam === "hadith" || filterParam === "sirah") {
    filter = filterParam;
  }

  if (!query) {
    return new Response(JSON.stringify({ results: [], query, total: 0 }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const results = await searchAllEntities(query, filter);
    
    return new Response(JSON.stringify({ results, query, total: results.length }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Search API error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
