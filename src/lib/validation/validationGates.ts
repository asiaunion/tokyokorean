import { execFile } from "node:child_process";
import { runTrustValidation } from "./trustGates.ts";
import { scoreSourcesList } from "./tiering.ts";

function runCommand(command: string, args: string[], cwd: string) {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    execFile(command, args, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || stdout || error.message));
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

export interface ValidationResult {
  ok: boolean;
  checks: Array<{ name: string; ok: boolean; output: string }>;
  hardGatePassed: boolean;
  scorePassed: boolean;
  score: number;
  minimumScore: number;
  hardGates: Array<{ name: string; ok: boolean; output: string }>;
  scoreChecks: Array<{ name: string; ok: boolean; output: string; weight: number }>;
}

function stripFrontmatter(markdown: string) {
  const lines = markdown.split("\n");
  if (lines[0]?.trim() !== "---") return markdown;
  const end = lines.findIndex((line, idx) => idx > 0 && line.trim() === "---");
  if (end < 0) return markdown;
  return lines.slice(end + 1).join("\n");
}

function countExternalLinks(markdown: string) {
  const links = markdown.match(/https?:\/\/[^\s)"]+/g) || [];
  return links.length;
}

function hasRiskyClaims(markdown: string) {
  const riskyPatterns = [
    /반드시/g,
    /무조건/g,
    /확정 수익/g,
    /guaranteed/gi,
    /must insist/gi,
    /絶対に/gi,
  ];
  return riskyPatterns.some(pattern => pattern.test(markdown));
}

function similarityScore(a: string, b: string) {
  const aa = a.replace(/\s+/g, " ").trim().toLowerCase();
  const bb = b.replace(/\s+/g, " ").trim().toLowerCase();
  if (!aa || !bb) return 0;
  const tokensA = new Set(aa.split(" "));
  const tokensB = new Set(bb.split(" "));
  const overlap = Array.from(tokensA).filter(token => tokensB.has(token)).length;
  return overlap / Math.max(tokensA.size, tokensB.size);
}

function extractFrontmatterList(markdown: string, key: "sources" | "references") {
  const lines = markdown.split("\n");
  const start = lines.findIndex(line => line.trim() === `${key}:`);
  if (start < 0) return [];
  const values: string[] = [];
  for (let idx = start + 1; idx < lines.length; idx += 1) {
    const line = lines[idx];
    if (!line.startsWith("  - ")) break;
    values.push(line.replace("  - ", "").replaceAll('"', "").trim());
  }
  return values;
}

function extractFrontmatterValue(markdown: string, key: "title" | "description") {
  const match = markdown.match(new RegExp(`^${key}:\\s*"([^"]+)"`, "m"));
  return match?.[1]?.trim() ?? "";
}

function normalizeToken(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(value: string) {
  return new Set(normalizeToken(value).split(" ").filter(token => token.length >= 2));
}

function stripBoilerplateSections(markdown: string) {
  const markers = [
    "## 면책 및 이용 안내",
    "## Disclaimer",
    "## 免責・ご利用上の注意",
    "## 免責",
  ];
  let body = markdown;
  for (const marker of markers) {
    const idx = body.indexOf(marker);
    if (idx >= 0) body = body.slice(0, idx);
  }
  return body;
}

function countKoreanChars(text: string) {
  const match = stripBoilerplateSections(text).match(/[가-힣]/g);
  return match?.length ?? 0;
}

function countJapaneseChars(text: string) {
  const match = text.match(/[ぁ-ゔァ-ヴー々〆〤一-龥]/g);
  return match?.length ?? 0;
}

function hasFormalKoEnding(text: string) {
  return /(습니다|입니다|합니다|됩니다|있습니다|보입니다|필요합니다|가능합니다)/.test(text);
}

function hasFormalJaEnding(text: string) {
  return /(です。|ます。|と考えられます。|と言えます。|必要があります。)/.test(text);
}

function hasInformalKoPattern(text: string) {
  const matches = text.match(/[가-힣]+다\./g) ?? [];
  return matches.some(token => {
    const word = token.slice(0, -1);
    if (/니다$|습니다$|합니다$|됩니다$|랍니다$|겠습니다$|드립니다$/.test(word)) return false;
    if (/있습니다$|보입니다$|필요합니다$|가능합니다$|없습니다$|같습니다$/.test(word)) return false;
    return true;
  });
}

function hasInformalJaPattern(text: string) {
  return /(\Sだ。|\Sである。)/.test(text);
}

function hasTierSource(urls: string[]) {
  const signals = [".go.kr", ".go.jp", ".lg.jp", ".gov", ".or.jp", ".ac.jp", "nikkei.com", "reuters.com", "bloomberg.com", "wsj.com", "bbc.com"];
  const merged = urls.join(" ").toLowerCase();
  return signals.some(signal => merged.includes(signal));
}

/** GSF-Ark investment posts vs TokyoKorean essay / lived-experience posts */
function getValidationProfile(): "investment" | "essay" {
  const profile = process.env.BLOG_VALIDATION_PROFILE?.trim().toLowerCase();
  return profile === "essay" ? "essay" : "investment";
}

export function validateReferenceSubset(markdown: string) {
  const sources = new Set(extractFrontmatterList(markdown, "sources"));
  const references = extractFrontmatterList(markdown, "references");
  const invalid = references.filter(ref => !sources.has(ref));
  return {
    ok: invalid.length === 0,
    invalid,
  };
}

export async function runBlogValidation(
  projectRoot: string,
  markdownCandidates: string[],
  options?: { slug?: string }
) {
  const hardGates: ValidationResult["hardGates"] = [];
  const scoreChecks: ValidationResult["scoreChecks"] = [];
  const minimumScore = 80;

  markdownCandidates.forEach((content, index) => {
    const subset = validateReferenceSubset(content);
    hardGates.push({
      name: `reference-subset-${index + 1}`,
      ok: subset.ok,
      output: subset.ok ? "ok" : `invalid refs: ${subset.invalid.join(", ")}`,
    });
  });

  const koBody = stripFrontmatter(markdownCandidates[0] ?? "");
  const enBody = stripFrontmatter(markdownCandidates[1] ?? "");
  const jaBody = stripFrontmatter(markdownCandidates[2] ?? "");
  const hasEnContent = enBody.trim().length > 40;
  const hasJaContent = jaBody.trim().length > 40;
  const koSources = extractFrontmatterList(markdownCandidates[0] ?? "", "sources");
  const koTitle = extractFrontmatterValue(markdownCandidates[0] ?? "", "title");
  const profile = getValidationProfile();
  const isEssayProfile = profile === "essay";

  const externalLinks = countExternalLinks(koBody);
  scoreChecks.push({
    name: "adsense-link-density",
    ok: externalLinks <= 20,
    output: `external links in KO body: ${externalLinks}`,
    weight: 10,
  });

  const risky = hasRiskyClaims(koBody) || hasRiskyClaims(enBody) || hasRiskyClaims(jaBody);
  hardGates.push({
    name: "adsense-risky-claims",
    ok: !risky,
    output: risky ? "risky certainty claim pattern detected" : "ok",
  });

  const enJaSimilarity = similarityScore(enBody, jaBody);
  scoreChecks.push({
    name: "translation-duplication-feel",
    ok: enJaSimilarity < 0.92,
    output: `en-ja lexical similarity: ${enJaSimilarity.toFixed(3)}`,
    weight: 10,
  });

  const koLen = countKoreanChars(koBody);
  const koLenMin = isEssayProfile ? 500 : 1200;
  const koLenMax = isEssayProfile ? 8000 : 4000;
  hardGates.push({
    name: "ko-length-target",
    ok: koLen >= koLenMin && koLen <= koLenMax,
    output: `ko chars: ${koLen} (target ${koLenMin}~${koLenMax}, ${profile} profile, disclaimer excluded)`,
  });

  const koPolite = hasFormalKoEnding(koBody) && !hasInformalKoPattern(koBody);
  hardGates.push({
    name: "ko-formal-tone",
    ok: koPolite,
    output: koPolite ? "ok" : "non-formal Korean endings detected",
  });

  const jaPolite =
    !hasJaContent ||
    countJapaneseChars(jaBody) < 120 ||
    (hasFormalJaEnding(jaBody) && !hasInformalJaPattern(jaBody));
  hardGates.push({
    name: "ja-formal-tone",
    ok: jaPolite,
    output: jaPolite ? "ok" : "non-formal Japanese endings detected",
  });

  const titleTokens = tokenSet(koTitle);
  const bodyTokens = tokenSet(koBody);
  const titleOverlap = titleTokens.size
    ? Array.from(titleTokens).filter(token => bodyTokens.has(token)).length / titleTokens.size
    : 1;
  hardGates.push({
    name: "title-body-alignment",
    ok: titleOverlap >= 0.45,
    output: `title token overlap: ${titleOverlap.toFixed(2)}`,
  });

  const tierSourceOk =
    isEssayProfile
      ? koSources.length === 0 || hasTierSource(koSources)
      : hasTierSource(koSources);
  hardGates.push({
    name: "tier-source-minimum",
    ok: tierSourceOk,
    output: tierSourceOk
      ? isEssayProfile && koSources.length === 0
        ? "ok (essay profile; sources optional)"
        : "ok"
      : "missing government/public/media source in sources frontmatter",
  });

  const sourceQuality = scoreSourcesList(koSources);
  const enforceSourceQuality = process.env.ENFORCE_TIER_SOURCE_QUALITY === "1";
  scoreChecks.push({
    name: "tier-source-quality",
    ok:
      !enforceSourceQuality ||
      koSources.length === 0 ||
      sourceQuality.ok,
    output:
      koSources.length === 0
        ? "no sources in frontmatter"
        : `avg ${sourceQuality.average.toFixed(0)}, min ${sourceQuality.min}${
            enforceSourceQuality ? " (enforce on)" : " (advisory; set ENFORCE_TIER_SOURCE_QUALITY=1)"
          }`,
    weight: enforceSourceQuality ? 8 : 3,
  });

  hardGates.push({
    name: "disclaimer-present",
    ok: true,
    output:
      "PostDisclaimer at top of article (PostDetails); markdown footer disclaimer not required",
  });

  if (options?.slug && process.env.SKIP_TRUST_VERIFY !== "1") {
    const trust = await runTrustValidation({
      projectRoot,
      slug: options.slug,
      ko: markdownCandidates[0] ?? "",
      en: markdownCandidates[1] ?? "",
      ja: markdownCandidates[2] ?? "",
    });
    for (const gate of trust.hardGates) {
      hardGates.push(gate);
    }
  } else if (options?.slug) {
    hardGates.push({
      name: "trust-verify",
      ok: true,
      output: "skipped (SKIP_TRUST_VERIFY=1)",
    });
  }

  if (process.env.SKIP_VALIDATE_BUILD === "1") {
    hardGates.push({ name: "build", ok: true, output: "skipped (SKIP_VALIDATE_BUILD=1)" });
  } else {
    try {
      const { stdout } = await runCommand("npm", ["run", "build"], projectRoot);
      hardGates.push({ name: "build", ok: true, output: stdout.slice(-1200) });
    } catch (error) {
      hardGates.push({
        name: "build",
        ok: false,
        output: error instanceof Error ? error.message : "build failed",
      });
    }
  }

  const hardGatePassed = hardGates.every(check => check.ok);
  const totalWeight = scoreChecks.reduce((sum, item) => sum + item.weight, 0) || 1;
  const scoreRaw = scoreChecks
    .filter(item => item.ok)
    .reduce((sum, item) => sum + item.weight, 0);
  const score = Math.round((scoreRaw / totalWeight) * 100);
  const scorePassed = score >= minimumScore;
  const checks: ValidationResult["checks"] = [
    ...hardGates,
    ...scoreChecks.map(({ weight, ...rest }) => rest),
  ];

  return {
    ok: hardGatePassed && scorePassed,
    checks,
    hardGatePassed,
    scorePassed,
    score,
    minimumScore,
    hardGates,
    scoreChecks,
  };
}
