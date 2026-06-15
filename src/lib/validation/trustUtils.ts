/** Shared helpers for trust / fact / translation gates */

export function stripFrontmatter(markdown: string) {
  const lines = markdown.split("\n");
  if (lines[0]?.trim() !== "---") return markdown;
  const end = lines.findIndex((line, idx) => idx > 0 && line.trim() === "---");
  if (end < 0) return markdown;
  return lines.slice(end + 1).join("\n");
}

export function stripHtmlComments(markdown: string) {
  return markdown.replace(/<!--[\s\S]*?-->/g, " ");
}

export function stripBoilerplateSections(markdown: string) {
  const markers = [
    "## 면책 및 이용 안내",
    "## Disclaimer",
    "## 免責・ご利用上の注意",
    "## 免責",
  ];
  let body = stripHtmlComments(markdown);
  for (const marker of markers) {
    const idx = body.indexOf(marker);
    if (idx >= 0) body = body.slice(0, idx);
  }
  return body;
}

export function stripCodeAndLinks(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[[^\]]*]\([^)]+\)/g, " ");
}

/** Normalize numeric claims for cross-locale / source matching */

// English month-name → month number (used by normalizeNumericToken)
const EN_MONTH: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};
const EN_MONTH_RE = Object.keys(EN_MONTH).join("|");

export function normalizeNumericToken(raw: string): string {
  // --- English date fast-path (before generic numeric processing) ---
  // "April 2026" → "20264"   /  "January 23, 2026" → "2026123"
  // These must match KO "2026년 4월" → "20264" and "2026년 1월 23일" → "2026123"
  const lower = raw.toLowerCase().trim();
  const enFull = lower.match(
    new RegExp(`^(${EN_MONTH_RE})\\s+(\\d{1,2}),?\\s+(\\d{4})$`)
  );
  if (enFull) {
    const m = EN_MONTH[enFull[1]];
    const d = parseInt(enFull[2], 10);
    const y = parseInt(enFull[3], 10);
    return `${y}${m}${d}`;   // e.g. "2026123"
  }
  const enMonth = lower.match(
    new RegExp(`^(${EN_MONTH_RE})\\s+(\\d{4})$`)
  );
  if (enMonth) {
    const m = EN_MONTH[enMonth[1]];
    const y = parseInt(enMonth[2], 10);
    return `${y}${m}`;   // e.g. "20264"
  }
  // --- Generic numeric processing ---
  let s = raw
    .toLowerCase()
    .replace(/[¥￥$,，、]/g, "")
    .replace(/\s+/g, "")           // spaces removed first → "만엔" pattern always matches
    .replace(/만엔|만원|万円|万원|億円|억원/g, "m")
    .replace(/천만|千万/g, "10m")
    .replace(/억|億/g, "100m")
    .replace(/約|약|approx\.?|~|〜|～|\-|–|—/g, "")
    .replace(/%/g, "pct")
    .replace(/년|年/g, "y")
    .replace(/월|月/g, "mo")
    .replace(/일|日/g, "d")
    .replace(/[^\d.a-z]/g, "");

  const rawLower = raw.toLowerCase();
  const num = parseFloat(s.replace(/[^\d.]/g, ""));
  if (Number.isFinite(num) && num > 0) {
    // EN "67.1 million JPY" ↔ KO/JA "6,710万円" (per-sqm / 万円-scale amounts)
    // Fix: /\b만\b/ does not work with Korean chars (JS \b is ASCII-only).
    // Use /만|万/ on rawLower instead.
    if (
      num < 10_000 &&
      (/million|백만|百万/.test(rawLower) || (num < 1000 && /만|万/.test(rawLower)))
    ) {
      const scaled = num < 1000 && /million|백만|百万/.test(rawLower) ? num * 100 : num;
      if (scaled >= 100) return String(Math.round(scaled));
    }
    if (num >= 1_000_000) return String(Math.round(num));
    if (num >= 100 && Number.isInteger(num)) return String(Math.round(num));
    if (num < 1 && s.includes(".")) return num.toFixed(3).replace(/\.?0+$/, "");
    return String(num);
  }
  return s || raw.trim().toLowerCase();
}

export function extractNumericLiterals(text: string) {
  const cleaned = stripCodeAndLinks(text);

  // Build EN month alternation once (reuses the same constant)
  const enMonthAlt = Object.keys(EN_MONTH).join("|");
  const patterns = [
    /\d{4}년\s*\d{1,2}월(?:\s*\d{1,2}일)?/g,
    /\d{4}年\d{1,2}月(?:\d{1,2}日)?/g,
    /\d{1,3}(?:,\d{3})+(?:\.\d+)?\s*(?:만|万)\s*(?:엔|円|원)?/g,
    // Avoid matching "440만" inside "4,440만 엔" (thousands comma prefix)
    /(?<!\d,)\d+(?:\.\d+)?\s*(?:만|万)\s*(?:엔|円|원)/g,
    /\d{1,3}(?:,\d{3})*(?:\.\d+)?\s*(?:억|億)\s*(?:원|円)?/g,
    /\d+(?:\.\d+)?%/g,
    /\d{4}-\d{2}-\d{2}/g,
    /¥\s*\d{1,3}(?:,\d{3})*(?:\.\d+)?/g,
    /\d{1,3}(?:,\d{3})+(?:\.\d+)?/g,
    // Option B: EN natural-language dates → same normalize result as KO/JA
    // "April 2026" → "20264"  /  "January 23, 2026" → "2026123"
    new RegExp(`(?:${enMonthAlt})\\s+\\d{1,2},?\\s+\\d{4}`, "gi"),
    new RegExp(`(?:${enMonthAlt})\\s+\\d{4}`, "gi"),
  ];

  const found = new Set<string>();
  for (const pattern of patterns) {
    for (const match of cleaned.match(pattern) ?? []) {
      const t = match.trim();
      if (t.length >= 2) found.add(t);
    }
  }
  const arr = Array.from(found);
  const hasUnitSuffix = (s: string) => /(?:만|万|억|億|엔|円|원)/.test(s);
  // Drop embedded 만/万 fragments (e.g. "440만" inside "4,440만"), not "5,000" inside "5,000억".
  return arr.filter(
    lit =>
      !arr.some(
        other =>
          other !== lit &&
          other.length > lit.length &&
          other.includes(lit) &&
          hasUnitSuffix(lit) &&
          hasUnitSuffix(other)
      )
  );
}

export function isGenericHomepageUrl(url: string) {
  try {
    const u = new URL(url);
    const p = u.pathname.replace(/\/+$/, "") || "/";
    if (p === "/" || p === "/en" || p === "/english" || p === "/index.html") return true;
    if (/^\/(en|ja|ko)?\/?$/.test(p)) return true;
  } catch {
    return true;
  }
  return false;
}

export function htmlToPlainText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ");
}

export function countH2Sections(markdown: string) {
  const body = stripBoilerplateSections(stripFrontmatter(markdown));
  return (body.match(/^##\s+/gm) ?? []).length;
}
