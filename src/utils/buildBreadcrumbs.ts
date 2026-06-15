import { parseLocalizedPath } from "@/utils/hreflang";
import { defaultUiLang, getUi, type UiLang } from "@/i18n/ui";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  current?: boolean;
};

/**
 * Locale-aware crumbs from URL (matches [...locale] routing: en unprefixed).
 */
export function buildBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const normalized =
    pathname.replace(/\/+$/, "") === "" ? "/" : pathname.replace(/\/+$/, "");
  const { locale, pathWithoutLocale } = parseLocalizedPath(normalized);
  const isArchivesPath =
    pathWithoutLocale === "/archives" ||
    pathWithoutLocale.startsWith("/archives/");
  /** /archives/ has no locale prefix; align crumb + home link with SITE.lang chrome. */
  const chromeLang = (isArchivesPath ? defaultUiLang() : locale) as UiLang;
  const L = getUi(chromeLang);
  const base = chromeLang === "en" ? "" : `/${chromeLang}`;

  const segments =
    pathWithoutLocale === "/"
      ? []
      : pathWithoutLocale.split("/").filter(Boolean);

  const items: BreadcrumbItem[] = [
    { label: L.breadcrumbHome, href: `${base}/` },
  ];

  if (segments.length === 0) {
    return items;
  }

  const [a, b, c] = segments;

  if (a === "posts") {
    if (b !== undefined && /^\d+$/.test(b)) {
      items.push({
        label: L.breadcrumbPostsPage.replace("{page}", b),
        current: true,
      });
    } else {
      items.push({ label: L.navPosts, current: true });
    }
    return items;
  }

  if (a === "tags") {
    items.push({ label: L.navTags, href: `${base}/tags/` });
    if (!b) {
      return items;
    }
    const tagDecoded = decodeURIComponent(b);
    if (c !== undefined && /^\d+$/.test(c)) {
      const p = Number(c);
      const label =
        p === 1
          ? tagDecoded
          : L.breadcrumbTagPaged
              .replace("{tag}", tagDecoded)
              .replace("{page}", c);
      items.push({ label, current: true });
    } else {
      items.push({ label: tagDecoded, current: true });
    }
    return items;
  }

  const named: Record<string, string> = {
    about: L.navAbout,
    search: L.navSearch,
    topics: L.navTopics,
    contact: L.footerContact,
    "privacy-policy": L.footerPrivacy,
    archives: L.navArchives,
  };

  if (segments.length === 1 && named[a]) {
    items.push({ label: named[a]!, current: true });
    return items;
  }

  let acc = "";
  for (let i = 0; i < segments.length; i++) {
    acc += `/${segments[i]}`;
    const isLast = i === segments.length - 1;
    const seg = decodeURIComponent(segments[i]!);
    items.push({
      label: seg,
      href: isLast ? undefined : `${base}${acc}/`,
      current: isLast,
    });
  }

  return items;
}
