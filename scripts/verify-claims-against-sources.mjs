/**
 * Run T3 source alignment for fact-sheet claims (network).
 * Usage: node scripts/verify-claims-against-sources.mjs <slug>
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { claimsNeedingSourceCheck, loadFactSheet } from "../src/lib/validation/factSheet.ts";
import { verifyAllClaims } from "../src/lib/validation/sourceVerification.ts";

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: node scripts/verify-claims-against-sources.mjs <slug>");
  process.exit(2);
}

const root = process.cwd();
const sheet = await loadFactSheet(root, slug);
const toVerify = claimsNeedingSourceCheck(sheet.claims);
if (toVerify.length === 0) {
  console.log(JSON.stringify({ slug, ok: true, message: "no unverified claims" }, null, 2));
  process.exit(0);
}

const results = await verifyAllClaims(root, toVerify);
const blocking = results.filter(r => r.status === "FAIL" || r.status === "UNCERTAIN");
console.log(
  JSON.stringify(
    {
      slug,
      ok: blocking.length === 0,
      results: results.map(r => ({
        index: r.claim.index,
        value: r.claim.value || r.claim.quote,
        url: r.claim.sourceUrl,
        status: r.status,
        reason: r.reason,
      })),
    },
    null,
    2
  )
);
process.exit(blocking.length === 0 ? 0 : 1);
