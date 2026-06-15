import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { generateOgImageForPost } from "@/utils/generateOgImages";
import { SITE } from "@/config";

export const prerender = true;

export async function getStaticPaths() {
  if (!SITE.dynamicOgImage) {
    return [];
  }

  const posts = await getCollection("blog").then(p =>
    p.filter(({ data }) => !data.draft && !data.ogImage)
  );
  const locales = ["en", "ko", "ja"];

  return locales.flatMap(locale => {
    const lang = locale;
    const langPosts = posts.filter(post => post.id.startsWith(`${lang}/`));

    return langPosts.map(post => ({
      params: { 
        locale: locale === "en" ? undefined : locale, 
        slug: post.id.substring(lang.length + 1) || undefined
      },
      props: post,
    }));
  });
}

export const GET: APIRoute = async ({ props }) => {
  if (!SITE.dynamicOgImage) {
    return new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }

  const buffer = await generateOgImageForPost(props as CollectionEntry<"blog">);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
