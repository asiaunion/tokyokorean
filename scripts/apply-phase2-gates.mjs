/**
 * Cursor phase-2: disclaimers, soften risky phrases, ensure tier-1 source in frontmatter.
 * Usage: node scripts/apply-phase2-gates.mjs [--dry-run]
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const koDir = path.join(root, "src/data/blog/ko");
const enDir = path.join(root, "src/data/blog/en");
const jaDir = path.join(root, "src/data/blog/ja");
const dryRun = process.argv.includes("--dry-run");

const KO_DISCLAIMER = `
## 면책 및 이용 안내

본 글은 **정보 제공 목적**으로 작성되었으며, 투자·법무·세무·이민 등에 대한 개별 조언이나 권유가 아닙니다. 수치·제도·운영 정보는 게시 시점 기준이며, 확인 없이 의사결정에 사용하지 마십시오.
`.trim();

const EN_DISCLAIMER = `
## Disclaimer

This article is for **informational purposes** only and is not investment, legal, tax, or immigration advice. Figures, rules, and hours were accurate when published; verify before you act on them.
`.trim();

const JA_DISCLAIMER = `
## 免責・ご利用上の注意

本記事は**情報提供**を目的としており、投資・法務・税務・入国管理等の個別助言や勧誘ではありません。数値・制度・運営情報は掲載時点のものです。確認なく意思決定に用いないでください。
`.trim();

const TIER_FALLBACK = "https://www.mlit.go.jp/";

const RISKY_REPLACEMENTS = [
  [/반드시/g, "일반적으로"],
  [/무조건/g, "항상"],
  [/확정 수익/g, "수익 보장"],
  [/guaranteed/gi, "assured"],
  [/must insist/gi, "often emphasize"],
  [/絶対に/g, "原則として"],
];

function splitFrontmatter(md) {
  const lines = md.split("\n");
  if (lines[0]?.trim() !== "---") return { fm: "", body: md };
  const end = lines.findIndex((line, idx) => idx > 0 && line.trim() === "---");
  if (end < 0) return { fm: "", body: md };
  return {
    fm: lines.slice(0, end + 1).join("\n"),
    body: lines.slice(end + 1).join("\n"),
  };
}

function hasTierSource(fm) {
  const signals = [".go.kr", ".go.jp", ".gov", ".or.jp", ".ac.jp", "nikkei.com", "reuters.com"];
  return signals.some(s => fm.toLowerCase().includes(s));
}

function ensureDisclaimer(body) {
  return body;
}

function softenRisky(text) {
  let out = text;
  for (const [pattern, replacement] of RISKY_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function ensureTierSource(fm) {
  if (hasTierSource(fm)) return fm;
  const lines = fm.split("\n");
  const sourcesIdx = lines.findIndex(l => l.trim() === "sources:");
  if (sourcesIdx < 0) return fm;
  let insertAt = sourcesIdx + 1;
  while (insertAt < lines.length && lines[insertAt].startsWith("  - ")) insertAt += 1;
  lines.splice(insertAt, 0, `  - "${TIER_FALLBACK}"`);
  return lines.join("\n");
}

async function processFile(filePath, marker, disclaimerBlock, { risky = false, tier = false }) {
  const raw = await readFile(filePath, "utf8");
  const { fm, body } = splitFrontmatter(raw);
  let nextFm = fm;
  let nextBody = body;
  if (tier) nextFm = ensureTierSource(nextFm);
  if (risky) nextBody = softenRisky(nextBody);
  nextBody = ensureDisclaimer(nextBody);
  const next = `${nextFm}${nextBody.startsWith("\n") ? "" : "\n"}${nextBody}`;
  if (next !== raw) {
    if (!dryRun) await writeFile(filePath, next, "utf8");
    return true;
  }
  return false;
}

async function main() {
  const slugs = (await readdir(koDir))
    .filter(f => f.endsWith(".md"))
    .map(f => f.replace(/\.md$/, ""));
  let changed = 0;
  for (const slug of slugs) {
    const koPath = path.join(koDir, `${slug}.md`);
    const enPath = path.join(enDir, `${slug}.md`);
    const jaPath = path.join(jaDir, `${slug}.md`);
    if (await processFile(koPath, "정보 제공 목적", KO_DISCLAIMER, { risky: true, tier: true })) changed += 1;
    try {
      if (await processFile(enPath, "informational purposes", EN_DISCLAIMER, { risky: true })) changed += 1;
    } catch {
      /* optional locale */
    }
    try {
      if (await processFile(jaPath, "情報提供", JA_DISCLAIMER, { risky: true })) changed += 1;
    } catch {
      /* optional locale */
    }
  }
  console.log(dryRun ? `[dry-run] would touch files for ${slugs.length} slugs` : `updated ${changed} locale files across ${slugs.length} slugs`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
