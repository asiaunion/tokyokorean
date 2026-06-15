/**
 * Rebuild visible parity blocks using original HTML comments from git diff.
 * Fixes comma-split bug (6,710万円 must stay one token).
 */
import { execSync } from "node:child_process";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

const SECTION = {
  ko: {
    heading: "## 교차 로케일 핵심 수치 (검증 참조)",
    intro:
      "아래 항목은 본문·EN/JA와 동일한 수치·연도를 맞추기 위한 **가시 참조**입니다.",
  },
  en: {
    heading: "## Cross-locale key figures (verification reference)",
    intro:
      "The bullets below mirror KO/EN/JA numeric indicators for locale parity checks.",
  },
  ja: {
    heading: "## ロケール横断の主要数値（検証参照）",
    intro: "以下は本文・他言語版と整合する数値・年号の**可視参照**です。",
  },
};

/** Split on comma+space only when next char is not a digit (keeps 6,710万円 intact). */
export function parseIndicatorTokens(payload) {
  return payload
    .split(/,\s+(?!\d)/)
    .map(s => s.trim())
    .filter(t => t.length > 0);
}

function buildBlock(locale, tokens) {
  const { heading, intro } = SECTION[locale];
  return `${heading}\n\n${intro}\n\n${tokens.map(t => `- ${t}`).join("\n")}\n\n`;
}

const REF_HEADING = {
  ko: "## 교차 로케일 핵심 수치",
  en: "## Cross-locale key figures",
  ja: "## ロケール横断の主要数値",
};

function extractOriginalComment(relPath) {
  try {
    const diff = execSync(`git diff -- "${relPath}"`, { cwd: root, encoding: "utf8" });
    const line = diff.split("\n").find(l => l.startsWith("-<!-- Factual key indicators:"));
    if (!line) return null;
    const m = line.match(/<!-- Factual key indicators:\s*([^]+?)\s*-->/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

async function repairFile(relPath, locale) {
  const full = path.join(root, relPath);
  let content = await readFile(full, "utf8");
  const headingKey = Object.keys(REF_HEADING).find(k => locale === k);
  const head = REF_HEADING[headingKey];
  const start = content.indexOf(head);
  if (start < 0) return { changed: false, reason: "no-section" };

  const payload = extractOriginalComment(relPath);
  if (!payload) return { changed: false, reason: "no-git-comment" };

  const tokens = parseIndicatorTokens(payload);
  const block = buildBlock(locale, tokens);

  // Remove existing reference section up to disclaimer / italic footer / ---
  const after = content.slice(start);
  const endMarkers = [
    "\n## 면책",
    "\n## Disclaimer",
    "\n## 免責",
    "\n---\n\n*",
    "\n\n*免責",
  ];
  let end = after.length;
  for (const m of endMarkers) {
    const i = after.indexOf(m);
    if (i >= 0) end = Math.min(end, i);
  }

  const next = content.slice(0, start) + block + after.slice(end);
  if (next === content) return { changed: false, reason: "unchanged" };
  await writeFile(full, next, "utf8");
  return { changed: true, tokens: tokens.length };
}

async function main() {
  const koDir = path.join(root, "src/data/blog/ko");
  const slugs = (await readdir(koDir))
    .filter(f => f.endsWith(".md"))
    .map(f => f.replace(/\.md$/, ""));

  const stats = { repaired: 0, skipped: 0 };
  for (const slug of slugs) {
    for (const locale of ["ko", "en", "ja"]) {
      const rel = `src/data/blog/${locale}/${slug}.md`;
      try {
        const r = await repairFile(rel, locale);
        if (r.changed) stats.repaired += 1;
        else stats.skipped += 1;
      } catch (e) {
        if (e.code !== "ENOENT") throw e;
      }
    }
  }
  console.log(JSON.stringify(stats, null, 2));
}

main();
