/**
 * Remove published "cross-locale key figures" QA blocks (not reader-facing).
 * Usage: node scripts/remove-parity-reference-sections.mjs [slug]
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

const REF_START = {
  ko: "## 교차 로케일 핵심 수치",
  en: "## Cross-locale key figures",
  ja: "## ロケール横断の主要数値",
};

const END_MARKERS = ["\n## 면책", "\n## Disclaimer", "\n## 免責", "\n---\n\n*", "\n\n*免責"];

function stripRefSection(content, locale) {
  const start = content.indexOf(REF_START[locale]);
  if (start < 0) return content;
  const tail = content.slice(start);
  let end = tail.length;
  for (const m of END_MARKERS) {
    const i = tail.indexOf(m);
    if (i >= 0) end = Math.min(end, i);
  }
  return content.slice(0, start).replace(/\n{3,}/g, "\n\n") + content.slice(start + end);
}

async function main() {
  const only = process.argv[2];
  const slugs = only
    ? [only]
    : (await readdir(path.join(root, "src/data/blog/ko")))
        .filter(f => f.endsWith(".md"))
        .map(f => f.replace(/\.md$/, ""));

  let changed = 0;
  for (const slug of slugs) {
    for (const locale of ["ko", "en", "ja"]) {
      const fp = path.join(root, "src/data/blog", locale, `${slug}.md`);
      try {
        const md = await readFile(fp, "utf8");
        const next = stripRefSection(md, locale);
        if (next !== md) {
          await writeFile(fp, next, "utf8");
          changed += 1;
        }
      } catch {
        /* skip */
      }
    }
  }
  console.log(JSON.stringify({ filesUpdated: changed, slug: only ?? "all" }, null, 2));
}

main();
