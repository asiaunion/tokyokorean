/**
 * Run validation gates for all published slugs (no npm build).
 * Default: SKIP_TRUST_VERIFY=1 (T3 P0-only policy — docs/fact-audit/T3_POLICY.md).
 * Usage: SKIP_VALIDATE_BUILD=1 node scripts/batch-validate-posts.mjs
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { runBlogValidation } from "../src/lib/validation/validationGates.ts";

const root = process.cwd();
const koDir = path.join(root, "src/data/blog/ko");

async function main() {
  process.env.SKIP_VALIDATE_BUILD = "1";
  process.env.SKIP_TRUST_VERIFY = process.env.SKIP_TRUST_VERIFY ?? "1";
  const slugs = (await readdir(koDir))
    .filter(f => f.endsWith(".md") || f.endsWith(".mdx"))
    .map(f => f.replace(/\.mdx?$/, ""));

  const summary = { pass: [], fail: {} };
  async function readLocalePost(locale, slug) {
    const dir = path.join(root, "src/data/blog", locale);
    for (const ext of [".md", ".mdx"]) {
      try {
        return await readFile(path.join(dir, `${slug}${ext}`), "utf8");
      } catch {
        /* try next ext */
      }
    }
    return "";
  }

  for (const slug of slugs) {
    const ko = await readLocalePost("ko", slug);
    const en = await readLocalePost("en", slug);
    const ja = await readLocalePost("ja", slug);
    const result = await runBlogValidation(root, [ko, en, ja], { slug });
    if (result.ok) {
      summary.pass.push(slug);
    } else {
      const failed = result.checks.filter(c => !c.ok).map(c => c.name);
      summary.fail[slug] = failed;
    }
  }
  console.log(JSON.stringify({ pass: summary.pass.length, fail: Object.keys(summary.fail).length, details: summary.fail }, null, 2));
}

main();
