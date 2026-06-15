/**
 * Remove markdown footer disclaimers; site uses top PostDisclaimer only.
 * Usage: node scripts/remove-bottom-disclaimer-sections.mjs [--dry-run]
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const blogRoot = path.join(root, "src/data/blog");
const dryRun = process.argv.includes("--dry-run");

const SECTION_HEADINGS = [
  "## 면책 및 이용 안내",
  "## Disclaimer",
  "## 免責・ご利用上の注意",
  "## 免責",
];

const BLOCKQUOTE_LEGACY =
  /\n\n> \*\*(?:면책(?: 조항)?(?:\(Disclaimer\))?|Disclaimer|免責事項)[^*]*\*\*:[\s\S]*?(?=\n\n(?!>)|$)/g;

function stripDisclaimerSection(body) {
  let next = body;
  for (const heading of SECTION_HEADINGS) {
    const idx = next.indexOf(`\n${heading}`);
    if (idx >= 0) {
      next = next.slice(0, idx).trimEnd();
    }
  }
  next = next.replace(BLOCKQUOTE_LEGACY, "").trimEnd();
  return `${next}\n`;
}

async function main() {
  let updated = 0;
  for (const locale of ["ko", "en", "ja"]) {
    const dir = path.join(blogRoot, locale);
    for (const file of await readdir(dir)) {
      if (!file.endsWith(".md")) continue;
      const fp = path.join(dir, file);
      const md = await readFile(fp, "utf8");
      const lines = md.split("\n");
      if (lines[0]?.trim() !== "---") continue;
      const end = lines.findIndex((line, idx) => idx > 0 && line.trim() === "---");
      if (end < 0) continue;
      const fm = lines.slice(0, end + 1).join("\n");
      const body = lines.slice(end + 1).join("\n");
      const nextBody = stripDisclaimerSection(body);
      if (nextBody === body) continue;
      const next = `${fm}\n${nextBody}`;
      if (!dryRun) await writeFile(fp, next, "utf8");
      updated += 1;
    }
  }
  console.log(JSON.stringify({ dryRun, filesUpdated: updated }, null, 2));
}

main();
