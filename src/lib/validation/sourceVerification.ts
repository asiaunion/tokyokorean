import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { FactSheetClaim } from "./factSheet.ts";
import { fetchPdfAsPlainText, isPdfUrl } from "./pdfText.ts";
import {
  extractNumericLiterals,
  htmlToPlainText,
  isGenericHomepageUrl,
  normalizeNumericToken,
} from "./trustUtils.ts";

export type SourceCheckStatus = "PASS" | "FAIL" | "UNCERTAIN" | "SKIP";

export interface SourceCheckResult {
  claim: FactSheetClaim;
  status: SourceCheckStatus;
  reason: string;
  snippet?: string;
}

const CACHE_DIR = ".cache/source-verify";

function isApproximateClaim(value: string, quote: string) {
  const merged = `${value} ${quote}`;
  return /約|약|approx|이상|이하|~|〜|～|부터|まで|between|최소|최대|>\s*|<\s*|배\s*이상/i.test(
    merged
  );
}

function numbersInText(text: string) {
  const literals = extractNumericLiterals(text);
  const fromDigits = text.match(/\d[\d,.]{0,12}\d?/g) ?? [];
  const normalized = new Set<string>();
  for (const lit of [...literals, ...fromDigits]) {
    const n = normalizeNumericToken(lit);
    if (n.length >= 1) normalized.add(n);
  }
  return normalized;
}

function claimNormVariants(norm: string) {
  const variants = [norm];
  if (norm.endsWith("pct")) variants.push(norm.slice(0, -3));
  return [...new Set(variants.filter(Boolean))];
}

function bestMatch(claimNorm: string, pageNumbers: Set<string>) {
  for (const variant of claimNormVariants(claimNorm)) {
    if (pageNumbers.has(variant)) return { kind: "exact" as const, score: 1 };
  }
  let best = 0;
  for (const pn of pageNumbers) {
    if (!pn) continue;
    for (const variant of claimNormVariants(claimNorm)) {
      if (!variant) continue;
      if (pn.includes(variant) || variant.includes(pn)) {
        const ratio =
          Math.min(pn.length, variant.length) / Math.max(pn.length, variant.length);
        if (ratio > best) best = ratio;
      }
    }
  }
  if (best >= 0.85) return { kind: "fuzzy" as const, score: best };
  if (best >= 0.55) return { kind: "weak" as const, score: best };
  return { kind: "none" as const, score: best };
}

async function readCache(projectRoot: string, url: string) {
  const key = Buffer.from(url).toString("base64url").slice(0, 120);
  const file = path.join(projectRoot, CACHE_DIR, `${key}.txt`);
  try {
    return await readFile(file, "utf8");
  } catch {
    return null;
  }
}

async function writeCache(projectRoot: string, url: string, text: string) {
  const key = Buffer.from(url).toString("base64url").slice(0, 120);
  const dir = path.join(projectRoot, CACHE_DIR);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${key}.txt`), text.slice(0, 500_000), "utf8");
}

async function fetchPageText(url: string) {
  if (isPdfUrl(url)) {
    const pdf = await fetchPdfAsPlainText(url);
    if (!pdf.ok) return { ok: false as const, error: pdf.error };
    return { ok: true as const, text: pdf.text };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "GSF-Blog-Trust-Verify/1.0 (fact-check pipeline)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) return { ok: false as const, error: `HTTP ${res.status}` };
    const html = await res.text();
    return { ok: true as const, text: htmlToPlainText(html) };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "fetch failed",
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function verifyClaimAgainstSource(
  projectRoot: string,
  claim: FactSheetClaim
): Promise<SourceCheckResult> {
  if (claim.verified) {
    return { claim, status: "SKIP", reason: "human verified in fact sheet" };
  }

  const url = claim.sourceUrl?.trim();
  if (!url?.startsWith("http")) {
    return { claim, status: "UNCERTAIN", reason: "missing tier-1 source URL in sheet" };
  }
  if (isGenericHomepageUrl(url)) {
    return {
      claim,
      status: "UNCERTAIN",
      reason: "generic homepage URL — use specific page URL in fact sheet",
    };
  }

  const claimText =
    /^verified$/i.test(claim.value?.trim() ?? "") ? claim.quote : claim.value || claim.quote;
  const claimNorm = normalizeNumericToken(claimText);
  if (!claimNorm) {
    return { claim, status: "UNCERTAIN", reason: "empty claim value" };
  }

  let pageText = await readCache(projectRoot, url);
  if (!pageText) {
    const fetched = await fetchPageText(url);
    if (!fetched.ok) {
      return {
        claim,
        status: "UNCERTAIN",
        reason: `fetch_failed: ${fetched.error}`,
      };
    }
    pageText = fetched.text;
    await writeCache(projectRoot, url, pageText);
  }

  const pageNumbers = numbersInText(pageText);
  const match = bestMatch(claimNorm, pageNumbers);

  if (match.kind === "exact" || match.score >= 0.85) {
    const idx = pageText.indexOf(claim.value) >= 0 ? pageText.indexOf(claim.value) : 0;
    return {
      claim,
      status: "PASS",
      reason: `source match (${match.kind}, score ${match.score.toFixed(2)})`,
      snippet: pageText.slice(Math.max(0, idx - 40), idx + 80).trim(),
    };
  }

  if (isApproximateClaim(claim.value, claim.quote) && match.score >= 0.55) {
    return {
      claim,
      status: "UNCERTAIN",
      reason: `approximate_claim+fuzzy_${match.score.toFixed(2)}`,
    };
  }

  if (match.kind === "weak") {
    return {
      claim,
      status: "UNCERTAIN",
      reason: `fuzzy_low: ${match.score.toFixed(2)}`,
    };
  }

  return {
    claim,
    status: "FAIL",
    reason: `no matching number on source page for "${claim.value || claim.quote}"`,
  };
}

export async function verifyAllClaims(projectRoot: string, claims: FactSheetClaim[]) {
  const results: SourceCheckResult[] = [];
  for (const claim of claims) {
    results.push(await verifyClaimAgainstSource(projectRoot, claim));
  }
  return results;
}
