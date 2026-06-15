/**
 * Tag URL catch-all: **one route per slug** folds the 5-dimensional variant
 * grid (locale × encoding × case × pagination × trailing-slash) into a single
 * 308 → canonical `{locale}/tags/{slug}/`.
 *
 * Per-slug src is a union of three locale-prefix branches that all redirect
 * to the same dest:
 *   wrong-locale-1 + any form  OR  wrong-locale-2 + any form  OR  canon-locale + variant form
 *
 * The canon-locale branch excludes canonical forms so the canonical URL
 * passes through to its static page (no self-redirect loop).
 */

import { slugifyStr } from "../utils/slugify";
import {
  collectTagsByLocale,
  getTagSlugPrimaryLocaleMap,
} from "./crossLocaleTagRedirects";

export type VercelRoute = {
  src?: string;
  status?: number;
  headers?: { Location?: string };
  handle?: string;
  dest?: string;
  continue?: boolean;
};

type TagLang = "en" | "ko" | "ja";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Every URL form a tag could appear as: labels × {raw, encoded, encoded.lower}. */
function allForms(labels: Iterable<string>, slug: string): string[] {
  const slugEnc = encodeURIComponent(slug);
  const out = new Set<string>([slug, slugEnc, slugEnc.toLowerCase()]);
  for (const label of labels) {
    if (!label) continue;
    out.add(label);
    const lEnc = encodeURIComponent(label);
    out.add(lEnc);
    out.add(lEnc.toLowerCase());
  }
  return Array.from(out);
}

/** Non-canonical forms only — for same-locale catch-all that must not self-loop. */
function nonCanonicalForms(labels: Iterable<string>, slug: string): string[] {
  const canonical = new Set<string>([slug, encodeURIComponent(slug)]);
  return allForms(labels, slug).filter(f => !canonical.has(f));
}

function alt(forms: string[]): string {
  return forms.map(escapeRegex).join("|");
}

export function buildTagCatchAlls(blogDir: string): VercelRoute[] {
  const tagsByLocale = collectTagsByLocale(blogDir);
  const slugPrimary = getTagSlugPrimaryLocaleMap(tagsByLocale);

  type SlugInfo = { labels: Set<string>; locale: TagLang };
  const slugMap = new Map<string, SlugInfo>();
  for (const loc of ["en", "ko", "ja"] as const) {
    for (const tag of tagsByLocale[loc]) {
      const slug = slugifyStr(tag);
      let entry = slugMap.get(slug);
      if (!entry) {
        entry = {
          labels: new Set<string>(),
          locale: slugPrimary.get(slug) ?? loc,
        };
        slugMap.set(slug, entry);
      }
      entry.labels.add(tag);
    }
  }

  const ALL_PREFIXES = ["", "/ko", "/ja"] as const;
  const routes: VercelRoute[] = [];
  for (const [slug, { labels, locale }] of slugMap) {
    const slugEnc = encodeURIComponent(slug);
    const canonPrefix = locale === "en" ? "" : `/${locale}`;
    const dest = `${canonPrefix}/tags/${slugEnc}/`;

    const variantsAlt = alt(nonCanonicalForms(labels, slug));
    const allFormsAlt = alt(allForms(labels, slug));

    // For each locale prefix, decide which alternation to accept:
    //  - canon prefix → variants only (excludes canonical form, no self-loop)
    //  - wrong prefix → all forms (including canonical encoded slug)
    const branches: string[] = [];
    for (const prefix of ALL_PREFIXES) {
      const formsAlt = prefix === canonPrefix ? variantsAlt : allFormsAlt;
      if (!formsAlt) continue;
      branches.push(`${prefix}/tags/(?:${formsAlt})`);
    }
    if (branches.length === 0) continue;

    routes.push({
      src: `^(?:${branches.join("|")})(?:/\\d+)?/?$`,
      headers: { Location: dest },
      status: 308,
    });
  }
  return routes;
}

/** Final fallback for unknown tag URLs — keeps GSC from ever seeing 404. */
export const TAG_SAFETY_NET: VercelRoute = {
  src: "^(?:/(?:ko|ja))?/tags/[^/]+(?:/\\d+)?/?$",
  headers: { Location: "/tags/" },
  status: 308,
};

/** Legacy WordPress / Yoast paths still in GSC index from the prior site. */
export const WP_LEGACY_ROUTES: VercelRoute[] = [
  {
    src: "^/author/?$",
    headers: { Location: "/about/" },
    status: 308,
  },
  {
    src: "^/author/.+",
    headers: { Location: "/about/" },
    status: 308,
  },
  {
    src: "^/feed/?$",
    headers: { Location: "/rss.xml" },
    status: 308,
  },
  {
    src: "^/.+?/feed/?$",
    headers: { Location: "/" },
    status: 308,
  },
  /** Gone — tell crawlers to drop legacy WP system URLs (not 308 to home). */
  {
    src: "^/wp-(?:admin|content|includes|json|login\\.php)(?:/.*)?$",
    status: 410,
  },
];
