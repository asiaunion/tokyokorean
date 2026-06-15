/**
 * Remove duplicate legacy italic disclaimer paragraphs; keep ## Disclaimer sections.
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const blogRoot = path.join(root, "src/data/blog");

const LEGACY_BLOCK =
  /\n\*(?:Disclaimer|면책 조항|免責事項)[\s\S]*?\*\n+/g;

async function main() {
  let updated = 0;
  for (const locale of ["ko", "en", "ja"]) {
    const dir = path.join(blogRoot, locale);
    for (const file of await readdir(dir)) {
      if (!file.endsWith(".md")) continue;
      const fp = path.join(dir, file);
      const md = await readFile(fp, "utf8");
      const next = md.replace(LEGACY_BLOCK, "\n\n").replace(/\n{3,}/g, "\n\n");
      if (next !== md) {
        await writeFile(fp, next, "utf8");
        updated += 1;
      }
    }
  }
  console.log(JSON.stringify({ filesUpdated: updated }, null, 2));
}

main();
