/**
 * Summarize trust gate failures for all slugs (no HTTP fetch if TRUST_SKIP_SOURCE_FETCH=1).
 * Usage: TRUST_SKIP_SOURCE_FETCH=1 node scripts/trust-batch-summary.mjs
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { runTrustValidation } from "../src/lib/validation/trustGates.ts";

const root = process.cwd();
const koDir = path.join(root, "src/data/blog/ko");

async function main() {
  if (!process.env.TRUST_SKIP_SOURCE_FETCH) {
    process.env.TRUST_SKIP_SOURCE_FETCH = "1";
  }
  const slugs = (await readdir(koDir))
    .filter(f => f.endsWith(".md"))
    .map(f => f.replace(/\.md$/, ""));

  const pass = [];
  const fail = {};

  for (const slug of slugs) {
    const ko = await readFile(path.join(koDir, `${slug}.md`), "utf8");
    const en = await readFile(path.join(root, "src/data/blog/en", `${slug}.md`), "utf8").catch(() => "");
    const ja = await readFile(path.join(root, "src/data/blog/ja", `${slug}.md`), "utf8").catch(() => "");
    const trust = await runTrustValidation({ projectRoot: root, slug, ko, en, ja });
    if (trust.ok) pass.push(slug);
    else {
      fail[slug] = trust.hardGates.filter(g => !g.ok).map(g => g.name);
    }
  }

  console.log(
    JSON.stringify(
      {
        trustPass: pass.length,
        trustFail: Object.keys(fail).length,
        note: "TRUST_SKIP_SOURCE_FETCH=1 skips network T3",
        fail,
      },
      null,
      2
    )
  );
}

main();
