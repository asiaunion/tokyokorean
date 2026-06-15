import { readFile } from "node:fs/promises";
import path from "node:path";
import { isGenericHomepageUrl, normalizeNumericToken } from "./trustUtils.ts";

export interface FactSheetClaim {
  index: number;
  quote: string;
  value: string;
  sourceUrl: string;
  verified: boolean;
  section: string;
}

export async function loadFactSheet(projectRoot: string, slug: string) {
  const sheetPath = path.join(projectRoot, "docs/fact-audit", `${slug}.md`);
  try {
    const raw = await readFile(sheetPath, "utf8");
    return { path: sheetPath, exists: true, claims: parseFactSheetClaims(raw) };
  } catch {
    return { path: sheetPath, exists: false, claims: [] as FactSheetClaim[] };
  }
}

export function parseFactSheetClaims(markdown: string): FactSheetClaim[] {
  const claimsStart = markdown.indexOf("## Claims");
  if (claimsStart < 0) return [];
  const afterClaims = markdown.slice(claimsStart + "## Claims".length);
  const nextHeading = afterClaims.search(/\n## /);
  const section =
    nextHeading >= 0
      ? markdown.slice(claimsStart, claimsStart + "## Claims".length + nextHeading)
      : markdown.slice(claimsStart);
  const lines = section.split("\n");
  const claims: FactSheetClaim[] = [];

  for (const line of lines) {
    if (!line.trim().startsWith("|")) continue;
    if (line.includes("Claim in KO") || line.includes("---") || line.includes("Item (KO)"))
      continue;
    const cells = line
      .split("|")
      .map(c => c.trim())
      .filter(Boolean);
    if (cells.length < 4) continue;
    const index = Number.parseInt(cells[0], 10);
    if (!Number.isFinite(index)) continue;
    const quote = cells[1] ?? "";
    // AG 2.5b sheets sometimes put literal "Verified" in Value and URL in the next column.
    let value = cells[2] ?? "";
    let urlCell = cells[3] ?? "";
    let verifiedCell = cells[4] ?? "";
    let sectionName = cells[5] ?? "";
    if (/^verified$/i.test(value.trim()) && (urlCell.startsWith("http") || urlCell.includes("]("))) {
      value = quote;
    }
    const sourceUrl = urlCell.replace(/\[([^\]]*)\]\(([^)]+)\)/, "$2").trim() || urlCell;
    const verified = /\[x\]|✓/i.test(verifiedCell);
    claims.push({ index, quote, value, sourceUrl, verified, section: sectionName });
  }
  return claims;
}

export function matchExtractedToSheet(extracted: string[], sheetClaims: FactSheetClaim[]) {
  const missing: string[] = [];
  for (const literal of extracted) {
    const norm = normalizeNumericToken(literal);
    const hit = sheetClaims.some(
      c =>
        normalizeNumericToken(c.value || c.quote) === norm ||
        c.quote.includes(literal) ||
        c.value.includes(literal) ||
        (c.quote && literal.includes(c.quote.slice(0, 8)))
    );
    if (!hit) missing.push(literal);
  }
  return { ok: missing.length === 0, missing };
}

export function claimsNeedingSourceCheck(sheetClaims: FactSheetClaim[]) {
  return sheetClaims.filter(c => !c.verified);
}

export function sheetHasOnlyGenericUrls(sheetClaims: FactSheetClaim[]) {
  const withUrl = sheetClaims.filter(c => c.sourceUrl?.startsWith("http"));
  if (withUrl.length === 0) return true;
  return withUrl.every(c => isGenericHomepageUrl(c.sourceUrl));
}
