import { parseLocalizedPath } from "@/utils/hreflang";
import { defaultUiLang, getUi } from "@/i18n/ui";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  current?: boolean;
};

/**
 * Single-locale site: public URLs are always unprefixed.
 * Content folder `ko/` is not a URL prefix.
 */
export function buildBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const normalized =
    pathname.replace(/\/+$/, "") === "" ? "/" : pathname.replace(/\/+$/, "");
  const { pathWithoutLocale } = parseLocalizedPath(normalized);
  const L = getUi(defaultUiLang());
  const base = "";

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
