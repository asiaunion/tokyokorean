/**
 * Old Korean URL slugs → current Latin slugs (same path for en/ko/ja).
 * Used by astro.config redirects so Vercel receives 308 rules in output config.
 */
const LEGACY_SLUG_PAIRS: [string, string][] = [
  [
    "일본-리츠j-reits-투자-알아야-할-5가지",
    "j-reit-five-things-to-know",
  ],
  ["일본-부동산-투자-알아야-할-3가지", "japan-real-estate-three-things"],
  [
    "일본-도쿄-지진에서-취약한-5곳",
    "tokyo-earthquake-vulnerable-five-areas",
  ],
  ["일본-도쿄의-세련된-명소-5곳", "tokyo-five-sophisticated-spots"],
  [
    "도쿄와-요코하마-후지산까지-이용-가능한-교통-패스",
    "tokyo-yokohama-fuji-transport-pass",
  ],
  [
    "코레도-니혼바시-무로마치-미쓰이-재개발",
    "coredo-nihonbashi-mitsui-redevelopment",
  ],
];

const PREFIXES = ["/posts/", "/ko/posts/", "/ja/posts/"] as const;

export function getLegacyPostRedirects(): Record<
  string,
  { status: 308; destination: string }
> {
  const out: Record<string, { status: 308; destination: string }> = {};
  for (const [fromSlug, toSlug] of LEGACY_SLUG_PAIRS) {
    for (const p of PREFIXES) {
      // Single canonical path per slug (trailingSlash: "always") — avoids duplicate Astro routes.
      const dest = `${p}${toSlug}/`.replace(/\/{2,}/g, "/");
      const from = `${p}${fromSlug}/`.replace(/\/{2,}/g, "/");
      out[from] = { status: 308, destination: dest };
    }
  }
  return out;
}
