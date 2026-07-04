import { canonicalizePathname } from "@/utils/hreflang";
import { SITE } from "@/config";

/**
 * Single-locale site (tokyokorean.net): public URLs are always unprefixed.
 * Content language lives in `src/data/blog/ko/` (folder ≠ URL prefix).
 * Never invent `/ko/…` or `/ja/…` links — those caused GSC 404 discovery.
 */
export function getLangUrl(
  _targetLang: string,
  pathname: string,
  _locale: string | undefined
): string {
  const normPath = pathname.replace(/\/+$/, "") || "/";
  if (normPath === "/archives" || normPath.startsWith("/archives/")) {
    return "/archives/";
  }

  let relativePath = pathname || "/";
  // Strip any accidental legacy locale prefix
  relativePath = relativePath.replace(/^\/(ko|ja|en)(?=\/|$)/, "") || "/";
  if (!relativePath.startsWith("/")) relativePath = `/${relativePath}`;
  relativePath = canonicalizePathname(relativePath);

  // SITE.lang is the only content language; all targets resolve to the same URL.
  void SITE.lang;
  return relativePath;
}
