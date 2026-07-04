#!/usr/bin/env node

/**
 * Fail the build if any non-draft blog post has an invalid pubDatetime:
 *  - after today (JST) — future-dated live posts
 *  - before domain registration — predates tokyokorean.net existence
 *
 * Usage: node scripts/check-future-pub-datetime.mjs
 * Exit 1 on violation.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const BLOG_ROOT = "src/data/blog";
const LOCALES = ["ko", "en", "ja"];

/**
 * tokyokorean.net registered 2026-06-16 (WHOIS).
 * Earliest plausible publish = 2026-06-17 JST (first full day on domain).
 * Override: TOKYOKOREAN_MIN_PUB_DATE=2026-06-17
 */
const MIN_PUB_DATE =
  process.env.TOKYOKOREAN_MIN_PUB_DATE?.trim() || "2026-06-17T00:00:00+09:00";
const minPubMs = new Date(MIN_PUB_DATE).getTime();

/** End of today in JST — posts dated later are rejected. */
function endOfTodayJstMs() {
  const now = new Date();
  const jst = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
  );
  jst.setHours(23, 59, 59, 999);
  return jst.getTime();
}

function parseFrontmatter(content) {
  if (!content.startsWith("---")) return null;
  const end = content.indexOf("\n---", 3);
  if (end < 0) return null;
  return content.slice(3, end);
}

function isDraft(fm) {
  return /^draft:\s*true\s*$/m.test(fm);
}

function getPubDatetime(fm) {
  const m = fm.match(/^pubDatetime:\s*(.+)$/m);
  return m?.[1]?.trim() ?? null;
}

const maxPubMs = endOfTodayJstMs();
const violations = [];

for (const locale of LOCALES) {
  const dir = join(BLOG_ROOT, locale);
  let files;
  try {
    files = readdirSync(dir).filter(f => f.endsWith(".md") || f.endsWith(".mdx"));
  } catch {
    continue;
  }

  for (const file of files) {
    const path = join(dir, file);
    const content = readFileSync(path, "utf8");
    const fm = parseFrontmatter(content);
    if (!fm || isDraft(fm)) continue;

    const raw = getPubDatetime(fm);
    if (!raw) continue;

    const pub = new Date(raw);
    if (Number.isNaN(pub.getTime())) {
      violations.push({ path, pubDatetime: raw, reason: "invalid date" });
      continue;
    }

    const pubMs = pub.getTime();

    if (pubMs > maxPubMs) {
      violations.push({
        path,
        pubDatetime: raw,
        reason: "future date (after today JST)",
      });
    } else if (pubMs < minPubMs) {
      violations.push({
        path,
        pubDatetime: raw,
        reason: `before domain min (${MIN_PUB_DATE})`,
      });
    }
  }
}

if (violations.length > 0) {
  console.error("\n🚨 INVALID pubDatetime DETECTED\n");
  for (const v of violations) {
    console.error(`  ❌ ${v.path}`);
    console.error(`     pubDatetime: ${v.pubDatetime}`);
    console.error(`     reason: ${v.reason}\n`);
  }
  console.error(
    "Dates must be on or after domain launch and not in the future.\n" +
      "Use draft: true for scheduled posts, or adjust TOKYOKOREAN_MIN_PUB_DATE if domain date changes.\n"
  );
  process.exit(1);
}

console.log(
  `✅ pubDatetime OK (≥ ${MIN_PUB_DATE.split("T")[0]}, ≤ today JST).`
);
process.exit(0);
