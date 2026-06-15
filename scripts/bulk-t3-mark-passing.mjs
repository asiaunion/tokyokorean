/**
 * Network T3 for all unverified fact-sheet claims; mark [x] on PASS.
 * Usage: node scripts/bulk-t3-mark-passing.mjs [slug...]
 *
 * Not part of CI publish bar. Default trust policy is P0-only T3 — docs/fact-audit/T3_POLICY.md.
 * Do not use bulk [x] to imply full-sheet verification.
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { claimsNeedingSourceCheck, loadFactSheet } from "../src/lib/validation/factSheet.ts";
import { verifyAllClaims } from "../src/lib/validation/sourceVerification.ts";

const root = process.cwd();
const koDir = path.join(root, "src/data/blog/ko");

function setClaimVerified(md, index, verified) {
  const lines = md.split("\n");
  let row = 0;
  for (let i = 0; i < lines.length; i++) {
    if (!/^\|\s*\d+\s*\|/.test(lines[i])) continue;
    row += 1;
    if (row === index) {
      lines[i] = lines[i].replace(/\|\s*\[(?:x| )\]\s*\|/i, verified ? "| [x] |" : "| [ ] |");
      break;
    }
  }
  return lines.join("\n");
}

async function processSlug(slug) {
  const sheetPath = path.join(root, "docs/fact-audit", `${slug}.md`);
  let md = await readFile(sheetPath, "utf8");
  const sheet = await loadFactSheet(root, slug);
  const toVerify = claimsNeedingSourceCheck(sheet.claims);
  if (toVerify.length === 0) {
    return { slug, verified: 0, pass: 0, block: 0, skip: true };
  }

  const results = await verifyAllClaims(root, toVerify);
  let marked = 0;
  for (const r of results) {
    if (r.status === "PASS") {
      md = setClaimVerified(md, r.claim.index, true);
      marked += 1;
    }
  }
  await writeFile(sheetPath, md, "utf8");

  const block = results.filter(x => x.status === "FAIL" || x.status === "UNCERTAIN").length;
  return { slug, verified: toVerify.length, pass: marked, block, skip: false };
}

async function main() {
  const argSlugs = process.argv.slice(2);
  const slugs =
    argSlugs.length > 0
      ? argSlugs
      : (await readdir(koDir)).filter(f => f.endsWith(".md")).map(f => f.replace(/\.md$/, ""));

  const summary = [];
  for (const slug of slugs) {
    summary.push(await processSlug(slug));
  }

  const totals = summary.reduce(
    (a, s) => ({
      pass: a.pass + s.pass,
      block: a.block + s.block,
      verified: a.verified + (s.verified || 0),
    }),
    { pass: 0, block: 0, verified: 0 }
  );

  console.log(JSON.stringify({ slugs: slugs.length, totals, rows: summary }, null, 2));
}

main();
