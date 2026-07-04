#!/usr/bin/env node

/**
 * Fail the build if any non-draft blog post has pubDatetime in the future (JST).
 * Prevents live sitemap/RSS from showing future-dated posts (AdSense trust risk).
 *
 * Usage: node scripts/check-future-pub-datetime.mjs
 * Exit 1 if any future date found.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const BLOG_ROOT = "src/data/blog";
const LOCALES = ["ko", "en", "ja"];

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

const cutoff = endOfTodayJstMs();
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

    if (pub.getTime() > cutoff) {
      violations.push({
        path,
        pubDatetime: raw,
        reason: "future date (after today JST)",
      });
    }
  }
}

if (violations.length > 0) {
  console.error("\n🚨 FUTURE pubDatetime DETECTED\n");
  for (const v of violations) {
    console.error(`  ❌ ${v.path}`);
    console.error(`     pubDatetime: ${v.pubDatetime} (${v.reason})\n`);
  }
  console.error(
    "Fix dates to today or earlier, or set draft: true until ready to publish.\n"
  );
  process.exit(1);
}

console.log("✅ No future pubDatetime in published blog posts.");
process.exit(0);
