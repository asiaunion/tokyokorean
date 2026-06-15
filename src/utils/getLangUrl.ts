import { canonicalizePathname } from "@/utils/hreflang";

/**
 * 대상 언어 코드와 현재 pathname을 받아 해당 언어의 URL을 반환합니다.
 * archives 페이지에서는 언어 전환 시 /archives/로 유지합니다.
 */
export function getLangUrl(
  targetLang: string,
  pathname: string,
  locale: string | undefined
): string {
  const normPath = pathname.replace(/\/+$/, "") || "/";
  const onArchivesOnly =
    normPath === "/archives" || normPath.startsWith("/archives/");

  if (onArchivesOnly) return "/archives/";

  let relativePath = pathname;

  // Strip out current locale prefix if we are in a sub-locale
  if (locale && pathname.startsWith(`/${locale}`)) {
    relativePath = pathname.replace(`/${locale}`, "") || "/";
  }

  relativePath = relativePath || "/";
  if (!relativePath.startsWith("/")) relativePath = `/${relativePath}`;

  relativePath = canonicalizePathname(relativePath);

  if (targetLang === "en") return relativePath;
  if (relativePath === "/") return `/${targetLang}/`;
  return `/${targetLang}${relativePath}`;
}
