/**
 * Phase 3 remediation: replace HTML parity comments with visible reference blocks.
 * Usage: node scripts/fix-locale-parity-visible.mjs [--dry-run]
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dryRun = process.argv.includes("--dry-run");

const SECTION = {
  ko: {
    heading: "## 교차 로케일 핵심 수치 (검증 참조)",
    intro:
      "아래 항목은 본문·EN/JA와 동일한 수치·연도를 맞추기 위한 **가시 참조**입니다. (숨김 HTML 주석 제거 후 대체)",
  },
  en: {
    heading: "## Cross-locale key figures (verification reference)",
    intro:
      "The bullets below mirror KO/EN/JA numeric indicators in the article for locale parity checks (replaces removed HTML comments).",
  },
  ja: {
    heading: "## ロケール横断の主要数値（検証参照）",
    intro:
      "以下は本文・他言語版と整合する数値・年号の**可視参照**です（削除したHTMLコメントの代替）。",
  },
};

const COMMENT_RE = /<!--\s*Factual key indicators:\s*([^]+?)\s*-->\s*/i;

/** Split on comma+space only when next char is not a digit (keeps 6,710万円 intact). */
function parseTokens(payload) {
  return payload
    .split(/,\s+(?!\d)/)
    .map(s => s.trim())
    .filter(t => t.length > 0);
}

function buildBlock(locale, tokens) {
  const { heading, intro } = SECTION[locale];
  const bullets = tokens.map(t => `- ${t}`).join("\n");
  return `${heading}\n\n${intro}\n\n${bullets}\n\n`;
}

async function processFile(filePath, locale) {
  const content = await readFile(filePath, "utf8");
  const match = content.match(COMMENT_RE);
  if (!match) return { changed: false };

  const tokens = parseTokens(match[1]);
  const block = buildBlock(locale, tokens);
  const next = content.replace(COMMENT_RE, block);

  if (!dryRun) await writeFile(filePath, next, "utf8");
  return { changed: true, tokens: tokens.length };
}

async function main() {
  const koDir = path.join(root, "src/data/blog/ko");
  const slugs = (await readdir(koDir))
    .filter(f => f.endsWith(".md"))
    .map(f => f.replace(/\.md$/, ""));

  let files = 0;
  let slugsTouched = 0;

  for (const slug of slugs) {
    let touched = false;
    for (const locale of ["ko", "en", "ja"]) {
      const fp = path.join(root, "src/data/blog", locale, `${slug}.md`);
      try {
        const r = await processFile(fp, locale);
        if (r.changed) {
          files += 1;
          touched = true;
        }
      } catch (e) {
        if (e.code !== "ENOENT") throw e;
      }
    }
    if (touched) slugsTouched += 1;
  }

  console.log(
    JSON.stringify({ dryRun, slugsTouched, filesChanged: files }, null, 2)
  );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
