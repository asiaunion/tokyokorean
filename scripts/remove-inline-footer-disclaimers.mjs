/**
 * Remove legacy italic / blockquote footer disclaimers (top PostDisclaimer is canonical).
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const blogRoot = path.join(process.cwd(), "src/data/blog");

const PATTERNS = [
  /\n---\n\n\*(?:Disclaimer|면책|免責)[\s\S]*?\*\s*$/m,
  /\n\n\*(?:Disclaimer|면책 조항|免責事項)[\s\S]*?\*\s*$/m,
  /\n\n> \*\*(?:Disclaimer|면책|免責)[\s\S]*?\n/g,
];

async function main() {
  let updated = 0;
  for (const locale of ["ko", "en", "ja"]) {
    const dir = path.join(blogRoot, locale);
    for (const file of await readdir(dir)) {
      if (!/\.mdx?$/.test(file)) continue;
      const fp = path.join(dir, file);
      let md = await readFile(fp, "utf8");
      let next = md;
      for (const re of PATTERNS) next = next.replace(re, "\n");
      next = next.replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
      if (next !== md) {
        await writeFile(fp, next, "utf8");
        updated += 1;
        console.log(`  removed footer disclaimer: ${locale}/${file}`);
      }
    }
  }
  console.log(JSON.stringify({ filesUpdated: updated }, null, 2));
}

main();
