/**
 * HEAD-check tier-1 URLs from fact sheets (P3-3 maintenance).
 * Usage: node scripts/check-source-links.mjs [slug]
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { parseFactSheetClaims } from "../src/lib/validation/factSheet.ts";

const root = process.cwd();
const slugArg = process.argv[2];

async function checkUrl(url) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(url, { method: "HEAD", signal: controller.signal, redirect: "follow" });
    return { url, ok: res.ok, status: res.status };
  } catch (error) {
    return {
      url,
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : "failed",
    };
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  const slugs = slugArg
    ? [slugArg]
    : (await readdir(path.join(root, "docs/fact-audit")))
        .filter(
          f =>
            f.endsWith(".md") &&
            !["README.md", "INDEX.md", "P0_URL_SPOT_CHECKS.md"].includes(f) &&
            !f.startsWith("AG_") &&
            !f.startsWith("CURSOR_")
        )
        .map(f => f.replace(/\.md$/, ""));

  const results = [];
  for (const slug of slugs) {
    const raw = await readFile(path.join(root, "docs/fact-audit", `${slug}.md`), "utf8").catch(() => "");
    if (!raw) continue;
    const claims = parseFactSheetClaims(raw);
    const urls = [...new Set(claims.map(c => c.sourceUrl).filter(u => u.startsWith("http")))];
    for (const url of urls) {
      results.push({ slug, ...(await checkUrl(url)) });
    }
  }

  const bad = results.filter(r => !r.ok);
  console.log(JSON.stringify({ checked: results.length, bad: bad.length, results }, null, 2));
  process.exit(bad.length ? 1 : 0);
}

main();
