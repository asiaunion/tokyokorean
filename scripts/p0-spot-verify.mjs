/**
 * P0: uncheck bulk [x], run network T3 on one primary claim per P0 slug, re-check if PASS.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadFactSheet } from "../src/lib/validation/factSheet.ts";
import { verifyClaimAgainstSource } from "../src/lib/validation/sourceVerification.ts";

const root = process.cwd();

/** slug -> primary claim match (needle in quote; optional fixed index) */
const P0_PRIMARY = {
  "coredo-nihonbashi-mitsui-redevelopment": { needle: "1673" },
  "ginza-marunouchi-walk-dna": { needle: "44,400,000", index: 38 },
  "japan-corporate-vs-personal-rental-after-tax-sketch": { needle: "30%", index: 39 },
  "japan-visa-paths-permanent-business-manager-asset-holders": { needle: "3,000" },
  "nihonbashi-hamacho-walking-guide": { needle: "1760" },
  "tokyo-6-wards-real-estate-insight": { needle: "34.6", index: 31 },
  "tokyo-korean-community-beyond-shinokubo": { needle: "2026" },
  "tokyo-mansion-tsubo-chiyoda-chuo-minato": { needle: "2025" },
  "tokyo-real-estate-investment-complete-guide": { needle: "1.4", index: 56 },
  "tokyo-shinjuku-shibuya-bunkyo": { needle: "231,402", index: 1 },
  "tokyo-ward-guide-series-prologue": { needle: "2025", index: 1 },
  "weak-yen-korean-japan-asset-allocation-fx-scenarios": {
    needle: "2026",
    index: 1,
  },
};

function uncheckAllClaims(md) {
  return md.replace(/\|\s*\[x\]\s*\|/gi, "| [ ] |");
}

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

async function main() {
  const results = [];
  for (const [slug, spec] of Object.entries(P0_PRIMARY)) {
    const { needle, index: fixedIndex } =
      typeof spec === "string" ? { needle: spec, index: undefined } : spec;
    const sheetPath = path.join(root, "docs/fact-audit", `${slug}.md`);
    let md = await readFile(sheetPath, "utf8");
    md = uncheckAllClaims(md);

    const sheet = await loadFactSheet(root, slug);
    const primary =
      (fixedIndex != null ? sheet.claims.find(c => c.index === fixedIndex) : null) ??
      sheet.claims.find(
        c =>
          (c.quote && c.quote.includes(needle)) ||
          (c.value && c.value.includes(needle))
      ) ??
      sheet.claims.find(c => c.sourceUrl?.startsWith("http")) ??
      sheet.claims[0];

    if (!primary) {
      results.push({ slug, ok: false, reason: "no claim row" });
      continue;
    }

    const check = await verifyClaimAgainstSource(root, { ...primary, verified: false });
    if (check.status === "PASS") {
      md = setClaimVerified(md, primary.index, true);
    }
    await writeFile(sheetPath, md, "utf8");

    results.push({
      slug,
      index: primary.index,
      value: primary.value || primary.quote,
      url: primary.sourceUrl,
      status: check.status,
      reason: check.reason,
    });
  }

  const pass = results.filter(r => r.status === "PASS").length;
  console.log(JSON.stringify({ p0: results.length, pass, results }, null, 2));
}

main();
