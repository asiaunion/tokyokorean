/**
 * Trust gates (T1 coverage, T2 parity, optional T3 source fetch).
 *
 * Production policy: CI sets TRUST_SKIP_SOURCE_FETCH=1 and SKIP_TRUST_VERIFY=1.
 * Network T3 is P0-only (p0-spot-verify.mjs), not batch row-by-row — see docs/fact-audit/T3_POLICY.md.
 */
import {
  claimsNeedingSourceCheck,
  loadFactSheet,
  matchExtractedToSheet,
  sheetHasOnlyGenericUrls,
} from "./factSheet.ts";
import { verifyAllClaims, type SourceCheckResult } from "./sourceVerification.ts";
import {
  countH2Sections,
  extractNumericLiterals,
  normalizeNumericToken,
  stripBoilerplateSections,
  stripCodeAndLinks,
  stripFrontmatter,
} from "./trustUtils.ts";

export interface TrustGateCheck {
  name: string;
  ok: boolean;
  output: string;
}

export interface TrustValidationResult {
  ok: boolean;
  hardGates: TrustGateCheck[];
  uncertain: Array<{ claim: string; url: string; reason: string }>;
  extractedClaims: string[];
}

export function extractClaimsFromKo(koMarkdown: string) {
  const body = stripBoilerplateSections(stripFrontmatter(koMarkdown));
  return extractNumericLiterals(body);
}

function localeNumericSets(ko: string, en: string, ja: string) {
  const toSet = (md: string) =>
    new Set(
      extractNumericLiterals(stripBoilerplateSections(stripFrontmatter(md))).map(normalizeNumericToken)
    );
  return {
    ko: toSet(ko),
    en: toSet(en),
    ja: toSet(ja),
  };
}

function diffSets(base: Set<string>, other: Set<string>) {
  return Array.from(base).filter(token => token.length >= 2 && !other.has(token));
}

function translationLint(en: string, ja: string) {
  const enBody = stripBoilerplateSections(stripFrontmatter(en));
  const jaBody = stripBoilerplateSections(stripFrontmatter(ja));
  const enClean = stripCodeAndLinks(enBody);
  const jaClean = stripCodeAndLinks(jaBody);

  const enWe = /\b(We|Our|our)\b/.test(enClean);
  const jaHangul = /[가-힣]{2,}/.test(jaClean);
  const enSections = countH2Sections(en);
  const jaSections = countH2Sections(ja);
  const sectionDrift = Math.abs(enSections - jaSections);

  return { enWe, jaHangul, enSections, jaSections, sectionDrift };
}

function formatSourceResults(results: SourceCheckResult[]) {
  const lines = results.map(r => {
    const label = r.claim.value || r.claim.quote || `#${r.claim.index}`;
    return `${r.status}: ${label} — ${r.reason}`;
  });
  return lines.join("\n");
}

export async function runTrustValidation(options: {
  projectRoot: string;
  slug: string;
  ko: string;
  en?: string;
  ja?: string;
}) {
  const { projectRoot, slug, ko, en = "", ja = "" } = options;
  const hardGates: TrustGateCheck[] = [];
  const uncertain: TrustValidationResult["uncertain"] = [];

  const extracted = extractClaimsFromKo(ko);
  const sheet = await loadFactSheet(projectRoot, slug);

  if (extracted.length > 0 && !sheet.exists) {
    hardGates.push({
      name: "trust-fact-sheet-exists",
      ok: false,
      output: `missing docs/fact-audit/${slug}.md (${extracted.length} numeric claims in KO)`,
    });
  }

  if (sheet.exists && extracted.length > 0) {
    const sheetClaims = sheet.claims.filter(c => !/^present$/i.test(c.value.trim()));
    const coverage = matchExtractedToSheet(extracted, sheetClaims.length ? sheetClaims : sheet.claims);
    hardGates.push({
      name: "trust-fact-sheet-coverage",
      ok: coverage.ok,
      output: coverage.ok
        ? `all ${extracted.length} extracted claims listed in sheet`
        : `missing from Claims table: ${coverage.missing.join(", ")}`,
    });

    if (sheetClaims.length > 0 && sheetHasOnlyGenericUrls(sheetClaims)) {
      hardGates.push({
        name: "trust-tier1-url-specificity",
        ok: false,
        output:
          "Claims use generic homepages only (e.g. mlit.go.jp/) — replace with specific page URLs",
      });
    }

    const toVerify = claimsNeedingSourceCheck(sheetClaims);
    if (toVerify.length > 0 && process.env.TRUST_SKIP_SOURCE_FETCH !== "1") {
      const sourceResults = await verifyAllClaims(projectRoot, toVerify);
      const blocking = sourceResults.filter(r => r.status === "FAIL" || r.status === "UNCERTAIN");
      for (const r of blocking) {
        uncertain.push({
          claim: r.claim.value || r.claim.quote,
          url: r.claim.sourceUrl,
          reason: r.reason,
        });
      }
      hardGates.push({
        name: "trust-source-alignment",
        ok: blocking.length === 0,
        output:
          blocking.length === 0
            ? `verified ${sourceResults.filter(r => r.status === "PASS").length} claims against sources`
            : formatSourceResults(blocking),
      });
    } else if (toVerify.length > 0 && process.env.TRUST_SKIP_SOURCE_FETCH === "1") {
      hardGates.push({
        name: "trust-source-alignment",
        ok: true,
        output: `skipped network T3 (${toVerify.length} unverified claims; run trust:verify-sources)`,
      });
    }
  }

  if (extracted.length > 0 && en.trim().length > 40 && ja.trim().length > 40) {
    const sets = localeNumericSets(ko, en, ja);
    const koOnly = diffSets(sets.ko, sets.en);
    const enOnly = diffSets(sets.en, sets.ko);
    const jaOnly = diffSets(sets.ja, sets.ko);
    const parityOk = koOnly.length === 0 && enOnly.length === 0 && jaOnly.length === 0;
    hardGates.push({
      name: "trust-locale-numeric-parity",
      ok: parityOk,
      output: parityOk
        ? "ko/en/ja numeric tokens aligned"
        : `drift ko-only:${koOnly.join(",")} en-only:${enOnly.join(",")} ja-only:${jaOnly.join(",")}`,
    });
  }

  const lint = translationLint(en, ja);
  if (en.trim().length > 40) {
    hardGates.push({
      name: "trust-en-no-we",
      ok: !lint.enWe,
      output: lint.enWe ? 'EN body contains "We/Our" — use first-person I' : "ok",
    });
  }
  if (ja.trim().length > 40) {
    hardGates.push({
      name: "trust-ja-no-hangul",
      ok: !lint.jaHangul,
      output: lint.jaHangul ? "JA body contains Korean hangul" : "ok",
    });
    hardGates.push({
      name: "trust-section-parity",
      ok: lint.sectionDrift <= 1,
      output: `en ## count ${lint.enSections}, ja ## count ${lint.jaSections} (max drift 1)`,
    });
  }

  const ok = hardGates.every(g => g.ok);
  return { ok, hardGates, uncertain, extractedClaims: extracted };
}
