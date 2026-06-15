/**
 * Cursor AG verification helper — JSON only to stdout
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { runBlogValidation } from "../src/lib/validation/validationGates.ts";
import { runTrustValidation } from "../src/lib/validation/trustGates.ts";

const root = process.cwd();
const slugs = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      "coredo-nihonbashi-mitsui-redevelopment",
      "ginza-marunouchi-walk-dna",
      "japan-corporate-vs-personal-rental-after-tax-sketch",
      "japan-visa-paths-permanent-business-manager-asset-holders",
      "nihonbashi-hamacho-walking-guide",
      "tokyo-6-wards-real-estate-insight",
      "tokyo-korean-community-beyond-shinokubo",
    ];

async function load(slug) {
  const read = async locale =>
    readFile(path.join(root, "src/data/blog", locale, `${slug}.md`), "utf8").catch(
      () => ""
    );
  return { ko: await read("ko"), en: await read("en"), ja: await read("ja") };
}

const report = [];
for (const slug of slugs) {
  const { ko, en, ja } = await load(slug);
  process.env.SKIP_VALIDATE_BUILD = "1";
  process.env.SKIP_TRUST_VERIFY = "1";
  const format = await runBlogValidation(root, [ko, en, ja], { slug });
  delete process.env.SKIP_TRUST_VERIFY;
  process.env.TRUST_SKIP_SOURCE_FETCH = "1";
  const trust = await runTrustValidation({ projectRoot: root, slug, ko, en, ja });
  report.push({
    slug,
    formatOk: format.ok,
    formatFailed: format.checks.filter(c => !c.ok).map(c => c.name),
    trustOk: trust.ok,
    trustFailed: trust.hardGates.filter(g => !g.ok).map(g => g.name),
  });
}

console.log(JSON.stringify({ slugs: report.length, report }, null, 2));
