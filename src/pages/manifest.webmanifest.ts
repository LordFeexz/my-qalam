import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const manifest = {
    name: "My Qalam - Platform Belajar Islam",
    short_name: "My Qalam",
    description: "Platform belajar Islam modern yang menyediakan Al-Quran, hadis, tafsir, dan sirah nabawiyah secara gratis dan mudah diakses.",
    start_url: "/",
    display: "standalone",
    categories: ["education", "books", "reference"],
    theme_color: "#343434",
    background_color: "#ffffff",
    icons: [
      {
        src: "/icons/192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 4), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400",
    },
  });
};
