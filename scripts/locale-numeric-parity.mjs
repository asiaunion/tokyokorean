/**
 * Check ko/en/ja numeric token parity for a slug.
 * Usage: node scripts/locale-numeric-parity.mjs <slug>
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { runTrustValidation } from "../src/lib/validation/trustGates.ts";

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: node scripts/locale-numeric-parity.mjs <slug>");
  process.exit(2);
}

const root = process.cwd();
const read = async locale =>
  readFile(path.join(root, "src/data/blog", locale, `${slug}.md`), "utf8").catch(() => "");

const ko = await read("ko");
const en = await read("en");
const ja = await read("ja");
const trust = await runTrustValidation({ projectRoot: root, slug, ko, en, ja });
const gate = trust.hardGates.find(g => g.name === "trust-locale-numeric-parity");
if (!gate) {
  console.log(JSON.stringify({ slug, ok: true, output: "skipped (missing en/ja or no numerics)" }, null, 2));
  process.exit(0);
}
console.log(JSON.stringify({ slug, ok: gate.ok, output: gate.output }, null, 2));
process.exit(gate.ok ? 0 : 1);
