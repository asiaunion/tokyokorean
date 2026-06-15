/**
 * List numeric/date claims extracted from KO body (disclaimer excluded).
 * Usage: node scripts/extract-claims-from-ko.mjs <slug>
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { extractClaimsFromKo } from "../src/lib/validation/trustGates.ts";

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: node scripts/extract-claims-from-ko.mjs <slug>");
  process.exit(2);
}

const root = process.cwd();
const koPath = path.join(root, "src/data/blog/ko", `${slug}.md`);
const ko = await readFile(koPath, "utf8");
const claims = extractClaimsFromKo(ko);
console.log(JSON.stringify({ slug, count: claims.length, claims }, null, 2));
