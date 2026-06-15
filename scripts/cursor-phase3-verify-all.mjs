/**
 * Cursor Phase 3 — full 35 verification report (JSON stdout only)
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { runBlogValidation } from "../src/lib/validation/validationGates.ts";
import { runTrustValidation } from "../src/lib/validation/trustGates.ts";
import { isGenericHomepageUrl } from "../src/lib/validation/trustUtils.ts";
import { parseFactSheetClaims } from "../src/lib/validation/factSheet.ts";

const root = process.cwd();
const koDir = path.join(root, "src/data/blog/ko");

async function main() {
  const slugs = (await readdir(koDir))
    .filter(f => f.endsWith(".md"))
    .map(f => f.replace(/\.md$/, ""));

  const report = {
    formatPass: [],
    formatFail: {},
    trustPass: [],
    trustFail: {},
    hasParityComment: [],
    sheetGenericUrlClaims: {},
    allClaimsVerified: [],
  };

  for (const slug of slugs) {
    const ko = await readFile(path.join(koDir, `${slug}.md`), "utf8");
    const en = await readFile(path.join(root, "src/data/blog/en", `${slug}.md`), "utf8").catch(() => "");
    const ja = await readFile(path.join(root, "src/data/blog/ja", `${slug}.md`), "utf8").catch(() => "");

    if (/<!--\s*Factual key indicators:/i.test(ko + en + ja)) {
      report.hasParityComment.push(slug);
    }

    process.env.SKIP_VALIDATE_BUILD = "1";
    delete process.env.SKIP_TRUST_VERIFY;
    const format = await runBlogValidation(root, [ko, en, ja], { slug });
    if (format.ok) report.formatPass.push(slug);
    else report.formatFail[slug] = format.checks.filter(c => !c.ok).map(c => c.name);

    const trust = await runTrustValidation({ projectRoot: root, slug, ko, en, ja });
    if (trust.ok) report.trustPass.push(slug);
    else report.trustFail[slug] = trust.hardGates.filter(g => !g.ok).map(g => g.name);

    const sheet = await readFile(path.join(root, "docs/fact-audit", `${slug}.md`), "utf8").catch(() => "");
    const claims = parseFactSheetClaims(sheet);
    const generic = claims.filter(c => c.sourceUrl?.startsWith("http") && isGenericHomepageUrl(c.sourceUrl));
    if (generic.length) report.sheetGenericUrlClaims[slug] = generic.length;
    if (claims.length > 0 && claims.every(c => c.verified)) {
      report.allClaimsVerified.push(slug);
    }
  }

  console.log(
    JSON.stringify(
      {
        total: slugs.length,
        formatPass: report.formatPass.length,
        trustPass: report.trustPass.length,
        parityCommentSlugs: report.hasParityComment.length,
        allVerifiedSheets: report.allClaimsVerified.length,
        genericUrlClaimSlugs: Object.keys(report.sheetGenericUrlClaims).length,
        trustFail: report.trustFail,
        formatFail: report.formatFail,
      },
      null,
      2
    )
  );
}

main();
