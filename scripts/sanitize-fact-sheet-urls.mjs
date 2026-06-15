/**
 * Repair corrupted tier-1 URLs in fact sheets (double scheme/host prefixes).
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dir = path.join(root, "docs/fact-audit");

function sanitizeUrls(md) {
  return md.replace(/https:\/\/www\.https:\/\/www\./g, "https://www.");
}

async function main() {
  let n = 0;
  for (const f of await readdir(dir)) {
    if (!f.endsWith(".md")) continue;
    const fp = path.join(dir, f);
    const md = await readFile(fp, "utf8");
    const next = sanitizeUrls(md);
    if (next !== md) {
      await writeFile(fp, next, "utf8");
      n += 1;
    }
  }
  console.log(JSON.stringify({ sanitizedFiles: n }, null, 2));
}

main();
