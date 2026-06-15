import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { extractClaimsFromKo } from "../src/lib/validation/trustGates.ts";

const root = process.cwd();
const koDir = path.join(root, "src/data/blog/ko");

async function main() {
  const files = (await readdir(koDir)).filter(f => f.endsWith(".md"));
  const allClaims = {};

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const content = await readFile(path.join(koDir, file), "utf8");
    const claims = extractClaimsFromKo(content);
    allClaims[slug] = claims;
  }

  console.log(JSON.stringify(allClaims, null, 2));
}

main().catch(console.error);
