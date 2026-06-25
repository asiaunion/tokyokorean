import type { CollectionEntry } from "astro:content";
import type { UiLang } from "@/i18n/ui";

/** Infer content language from collection id (`ko/slug`) when frontmatter omits `lang`. */
export function langFromPostId(id: string): UiLang | null {
  if (id.startsWith("ko/")) return "ko";
  if (id.startsWith("ja/")) return "ja";
  if (id.startsWith("en/")) return "en";
  return null;
}

/** Resolved post language for disclaimers, JSON-LD, and `<html lang>`. */
export function resolvePostLang(
  post: Pick<CollectionEntry<"blog">, "id" | "data">
): UiLang {
  const fromId = langFromPostId(post.id);
  const declared = post.data.lang;

  if (declared && declared !== "en") return declared;
  if (fromId) return fromId;
  return declared ?? "en";
}
