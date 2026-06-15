/**
 * Refresh validate column in docs/fact-audit/INDEX.md from batch validation.
 * Usage: SKIP_VALIDATE_BUILD=1 SKIP_TRUST_VERIFY=1 node scripts/update-fact-audit-index.mjs
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { runBlogValidation } from "../src/lib/validation/validationGates.ts";

const root = process.cwd();
const koDir = path.join(root, "src/data/blog/ko");
const indexPath = path.join(root, "docs/fact-audit/INDEX.md");

process.env.SKIP_VALIDATE_BUILD = "1";
process.env.SKIP_TRUST_VERIFY = process.env.SKIP_TRUST_VERIFY ?? "1";

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

const slugs = (await readdir(koDir))
  .filter(f => f.endsWith(".md") || f.endsWith(".mdx"))
  .map(f => f.replace(/\.mdx?$/, ""));

const statusBySlug = new Map();
for (const slug of slugs) {
  const ko = await readLocalePost("ko", slug);
  const en = await readLocalePost("en", slug);
  const ja = await readLocalePost("ja", slug);
  const result = await runBlogValidation(root, [ko, en, ja], { slug });
  statusBySlug.set(slug, result.ok ? "PASS" : `FAIL (${result.checks.filter(c => !c.ok).map(c => c.name).join(", ")})`);
}

let index = await readFile(indexPath, "utf8");
for (const [slug, validate] of statusBySlug) {
  const rowRe = new RegExp(
    `(\\| \`${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\` \\|[^|]*\\|)\\s*[^|]*\\s*(\\|)`,
    "g"
  );
  if (rowRe.test(index)) {
    index = index.replace(rowRe, `$1 ${validate} $2`);
  } else {
    console.warn(`  INDEX missing row for slug: ${slug} (add manually or extend script)`);
  }
}

const banner = `> **Cursor validate sync (${new Date().toISOString().slice(0, 10)}):** Gates batch — trust ${process.env.SKIP_TRUST_VERIFY === "1" ? "skipped (T3 P0-only policy)" : "fetch ON"}.\n\n`;
if (!index.includes("Cursor validate sync")) {
  index = index.replace(
    /^(# GSF-Blog Fact[^\n]*\n\n)(>[^\n]*\n\n)?/m,
    `$1${banner}`
  );
}

await writeFile(indexPath, index, "utf8");
console.log(JSON.stringify({ updated: slugs.length, pass: [...statusBySlug.values()].filter(v => v === "PASS").length }, null, 2));
