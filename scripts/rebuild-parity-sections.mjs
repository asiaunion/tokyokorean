/**
 * Rebuild cross-locale parity reference sections from body numerics (union).
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  extractNumericLiterals,
  normalizeNumericToken,
  stripBoilerplateSections,
  stripFrontmatter,
} from "../src/lib/validation/trustUtils.ts";
const root = process.cwd();

const SECTION = {
  ko: {
    heading: "## 교차 로케일 핵심 수치 (검증 참조)",
    intro: "아래 항목은 KO/EN/JA 본문 수치·연도의 교차 검증용 **가시 참조**입니다.",
  },
  en: {
    heading: "## Cross-locale key figures (verification reference)",
    intro: "Visible numeric cross-check list aligned with KO/EN/JA article bodies.",
  },
  ja: {
    heading: "## ロケール横断の主要数値（検証参照）",
    intro: "KO/EN/JA本文の数値・年号を揃えるための**可視参照**です。",
  },
};

const REF_START = {
  ko: "## 교차 로케일 핵심 수치",
  en: "## Cross-locale key figures",
  ja: "## ロケール横断の主要数値",
};

const END_MARKERS = ["\n## 면책", "\n## Disclaimer", "\n## 免責", "\n---\n\n*", "\n\n*免責"];

function stripRefSection(content, locale) {
  const start = content.indexOf(REF_START[locale]);
  if (start < 0) return content;
  const tail = content.slice(start);
  let end = tail.length;
  for (const m of END_MARKERS) {
    const i = tail.indexOf(m);
    if (i >= 0) end = Math.min(end, i);
  }
  return content.slice(0, start) + content.slice(start + end);
}

function bodyLiterals(md) {
  return extractNumericLiterals(stripBoilerplateSections(stripFrontmatter(md)));
}

function buildUnionBullets(ko, en, ja) {
  const byNorm = new Map();
  for (const raw of [...bodyLiterals(ko), ...bodyLiterals(en), ...bodyLiterals(ja)]) {
    const norm = normalizeNumericToken(raw);
    if (!norm || norm.length < 2) continue;
    if (!byNorm.has(norm) || raw.length < byNorm.get(norm).length) {
      byNorm.set(norm, raw);
    }
  }
  // Prefer non-hangul display for JA when duplicate norms exist
  const sorted = Array.from(byNorm.values()).sort((a, b) => a.localeCompare(b));
  return sorted;
}

function buildBlock(locale, bullets) {
  const { heading, intro } = SECTION[locale];
  return `${heading}\n\n${intro}\n\n${bullets.map(t => `- ${t}`).join("\n")}\n\n`;
}

async function processSlug(slug) {
  const paths = { ko: "", en: "", ja: "" };
  const bodies = {};
  for (const loc of ["ko", "en", "ja"]) {
    const fp = path.join(root, "src/data/blog", loc, `${slug}.md`);
    try {
      bodies[loc] = await readFile(fp, "utf8");
      paths[loc] = fp;
    } catch {
      bodies[loc] = "";
    }
  }
  if (!bodies.ko) return false;

  const stripped = {
    ko: stripRefSection(bodies.ko, "ko"),
    en: stripRefSection(bodies.en, "en"),
    ja: stripRefSection(bodies.ja, "ja"),
  };
  const bullets = buildUnionBullets(stripped.ko, stripped.en, stripped.ja);
  if (bullets.length === 0) return false;

  for (const loc of ["ko", "en", "ja"]) {
    if (!paths[loc]) continue;
    let jaBullets = bullets;
    if (loc === "ja") {
      jaBullets = bullets.filter(b => !/[가-힣]/.test(b));
    }
    const block = buildBlock(loc, jaBullets);
    let content = stripped[loc];
    const insertAt = (() => {
      for (const m of END_MARKERS) {
        const i = content.indexOf(m.trim() === "*免責" ? "\n\n*免責" : m);
        if (i >= 0) return i;
      }
      return content.length;
    })();
    content = content.slice(0, insertAt) + block + content.slice(insertAt);
    await writeFile(paths[loc], content, "utf8");
  }
  return true;
}

async function main() {
  const only = process.argv[2];
  const slugs = only
    ? [only]
    : (await readdir(path.join(root, "src/data/blog/ko")))
        .filter(f => f.endsWith(".md"))
        .map(f => f.replace(/\.md$/, ""));

  let n = 0;
  for (const slug of slugs) {
    if (await processSlug(slug)) n += 1;
  }
  console.log(JSON.stringify({ rebuilt: n, slug: only ?? "all" }, null, 2));
}

main();
