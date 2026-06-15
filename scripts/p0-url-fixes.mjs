/**
 * Apply tier-1 deep-link URL fixes for P0 slugs (fact sheets + blog frontmatter).
 * Usage: node scripts/p0-url-fixes.mjs
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

/** slug -> list of [fromSubstring, toUrl] applied globally in fact sheet */
const SHEET_URL_REPLACEMENTS = {
  "ginza-marunouchi-walk-dna": [
    [
      "https://www.mlit.go.jp/totikensangyo/totikensangyo_fr4_000043.html",
      "https://www.reinfolib.mlit.go.jp/landPrices_/realEstateAppraisalReport/2025/13/2025131020529.html",
    ],
  ],
  "japan-corporate-vs-personal-rental-after-tax-sketch": [
    [
      "https://www.nta.go.jp/english/index.htm",
      "https://www.nta.go.jp/taxes/shiraberu/taxanswer/joto/3211.htm",
    ],
    ["https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1440.htm", "https://www.nta.go.jp/taxes/shiraberu/taxanswer/joto/3211.htm"],
  ],
  "japan-visa-paths-permanent-business-manager-asset-holders": [
    ["https://www.moj.go.jp/isa/index.html", "https://www.moj.go.jp/isa/applications/resources/10_00237.html"],
  ],
  "nihonbashi-hamacho-walking-guide": [
    [
      "https://www.mlit.go.jp/totikensangyo/totikensangyo_fr4_000043.html",
      "https://ja.wikipedia.org/wiki/%E7%8E%89%E3%81%B2%E3%81%A7",
    ],
    ["http://www.tamahide.co.jp/", "https://ja.wikipedia.org/wiki/%E7%8E%89%E3%81%B2%E3%81%A7"],
  ],
  "tokyo-6-wards-real-estate-insight": [
    ["https://www.kantei.ne.jp/report/", "https://www.kantei.ne.jp/wp-content/uploads/c2025.pdf"],
    [
      "https://www.globalpropertyguide.com/asia/japan/price-history",
      "https://www.kantei.ne.jp/wp-content/uploads/c2025.pdf",
    ],
  ],
  "tokyo-korean-community-beyond-shinokubo": [
    [
      "https://www.moj.go.jp/isa/publications/statistics/",
      "https://www.mindan.org/index.php?bid=news&cate=news",
    ],
    ["https://www.mindan.org/", "https://www.mindan.org/index.php?bid=news&cate=news"],
  ],
  "tokyo-mansion-tsubo-chiyoda-chuo-minato": [
    ["https://www.reins.or.jp/about/", "https://www.fudousankeizai.co.jp/topSiteNews?check=1"],
    ["https://www.fudousankeizai.co.jp/", "https://www.fudousankeizai.co.jp/topSiteNews?check=1"],
    ["https://www.fudousankeizai.co.jp/report/", "https://www.fudousankeizai.co.jp/topSiteNews?check=1"],
  ],
  "tokyo-real-estate-investment-complete-guide": [
    [
      "https://www.boj.or.jp/en/statistics/index.htm/",
      "https://www.tax.metro.tokyo.lg.jp/kazei/real_estate/kotei_tosi",
    ],
    [
      "https://www.metro.tokyo.lg.jp/tosei/tax/kotei/index.html",
      "https://www.tax.metro.tokyo.lg.jp/kazei/real_estate/kotei_tosi",
    ],
  ],
  "tokyo-shinjuku-shibuya-bunkyo": [
    [
      "https://www.lifull.com/homes/about/",
      "https://www.city.shibuya.tokyo.jp/kusei/tokei_shibuya/jinko/jumin_toroku.html",
    ],
    [
      "https://www.hokeniryo.metro.tokyo.lg.jp/documents/d/hokeniryo/01-1jinkou-setai",
      "https://www.city.shibuya.tokyo.jp/kusei/tokei_shibuya/jinko/jumin_toroku.html",
    ],
    [
      "https://www.toukei.metro.tokyo.lg.jp/juukiy/2025/jy25qf0001.pdf",
      "https://www.city.shibuya.tokyo.jp/kusei/tokei_shibuya/jinko/jumin_toroku.html",
    ],
  ],
  "tokyo-ward-guide-series-prologue": [
    [
      "https://www.lifull.com/homes/about/",
      "https://www.stat.go.jp/data/idou/rireki/2501/index.html",
    ],
    [
      "https://www.toukei.metro.tokyo.lg.jp/juukiy/2025/jy25qf0001.pdf",
      "https://www.stat.go.jp/data/idou/rireki/2501/index.html",
    ],
  ],
  "weak-yen-korean-japan-asset-allocation-fx-scenarios": [
    [
      "https://www.boj.or.jp/en/statistics/index.htm/",
      "https://www.boj.or.jp/en/about/release_2026/index.htm",
    ],
    [
      "https://www.boj.or.jp/en/statistics/market/index.htm",
      "https://www.boj.or.jp/en/about/release_2026/index.htm",
    ],
    [
      "https://www.boj.or.jp/en/about/mopo_release/index.htm",
      "https://www.boj.or.jp/en/about/release_2026/index.htm",
    ],
    ["https://www.boj.or.jp/en/", "https://www.boj.or.jp/en/about/release_2026/index.htm"],
    [
      "https://www.boj.or.jp/en/statistics/dl/index.htm",
      "https://www.boj.or.jp/en/about/release_2026/index.htm",
    ],
    [
      "https://www.boj.or.jp/en/statistics/research/index.htm",
      "https://www.boj.or.jp/en/about/release_2026/index.htm",
    ],
  ],
};

const BLOG_SOURCE_REPLACEMENTS = {
  "ginza-marunouchi-walk-dna": SHEET_URL_REPLACEMENTS["ginza-marunouchi-walk-dna"],
  "japan-corporate-vs-personal-rental-after-tax-sketch": [
    ["https://www.nta.go.jp/english/index.htm", "https://www.nta.go.jp/taxes/shiraberu/taxanswer/joto/3211.htm"],
  ],
  "japan-visa-paths-permanent-business-manager-asset-holders":
    SHEET_URL_REPLACEMENTS["japan-visa-paths-permanent-business-manager-asset-holders"],
  "tokyo-6-wards-real-estate-insight": [
    ["https://www.globalpropertyguide.com/", "https://www.kantei.ne.jp/wp-content/uploads/c2025.pdf"],
    ["https://www.kantei.ne.jp/", "https://www.kantei.ne.jp/wp-content/uploads/c2025.pdf"],
  ],
  "tokyo-korean-community-beyond-shinokubo":
    SHEET_URL_REPLACEMENTS["tokyo-korean-community-beyond-shinokubo"],
  "tokyo-mansion-tsubo-chiyoda-chuo-minato": SHEET_URL_REPLACEMENTS["tokyo-mansion-tsubo-chiyoda-chuo-minato"],
  "tokyo-real-estate-investment-complete-guide":
    SHEET_URL_REPLACEMENTS["tokyo-real-estate-investment-complete-guide"],
  "tokyo-shinjuku-shibuya-bunkyo": SHEET_URL_REPLACEMENTS["tokyo-shinjuku-shibuya-bunkyo"],
  "weak-yen-korean-japan-asset-allocation-fx-scenarios":
    SHEET_URL_REPLACEMENTS["weak-yen-korean-japan-asset-allocation-fx-scenarios"],
};

function applyReplacements(text, pairs) {
  let out = text;
  for (const [from, to] of pairs) {
    if (!from || out.includes(to)) continue;
    out = out.split(from).join(to);
  }
  return out;
}

async function patchBlogSources(slug, pairs) {
  if (!pairs?.length) return 0;
  let n = 0;
  for (const locale of ["ko", "en", "ja"]) {
    const fp = path.join(root, "src/data/blog", locale, `${slug}.md`);
    try {
      let md = await readFile(fp, "utf8");
      const next = applyReplacements(md, pairs);
      if (next !== md) {
        await writeFile(fp, next, "utf8");
        n += 1;
      }
    } catch {
      /* skip */
    }
  }
  return n;
}

async function patchGinzaLandPriceCopy() {
  const fixes = [
    {
      locale: "ko",
      from: "**평방미터(㎡)당 6,710만 엔**",
      to: "**평방미터(㎡)당 약 4,440만 엔(44,400,000円/㎡)**",
    },
    {
      locale: "ko",
      from: "https://www.mlit.go.jp/totikensangyo/totikensangyo_fr4_000043.html",
      to: "https://www.reinfolib.mlit.go.jp/landPrices_/realEstateAppraisalReport/2025/13/2025131020529.html",
    },
    {
      locale: "en",
      from: "**¥67.1 million per square meter**",
      to: "**about ¥44.4 million per square meter (44,400,000円/㎡)**",
    },
    {
      locale: "ja",
      from: "**1平方メートルあたり6,710万円**",
      to: "**1平方メートルあたり4,440万円（44,400,000円/㎡）**",
    },
  ];
  let n = 0;
  for (const { locale, from, to } of fixes) {
    const fp = path.join(root, "src/data/blog", locale, "ginza-marunouchi-walk-dna.md");
    let md = await readFile(fp, "utf8");
    if (md.includes(from)) {
      md = md.replace(from, to);
      await writeFile(fp, md, "utf8");
      n += 1;
    }
  }
  return n;
}

async function main() {
  const stats = { sheets: 0, blogFiles: 0, ginzaCopy: 0 };
  for (const [slug, pairs] of Object.entries(SHEET_URL_REPLACEMENTS)) {
    const fp = path.join(root, "docs/fact-audit", `${slug}.md`);
    let md = await readFile(fp, "utf8");
    const next = applyReplacements(md, pairs);
    if (next !== md) {
      await writeFile(fp, next, "utf8");
      stats.sheets += 1;
    }
    stats.blogFiles += await patchBlogSources(slug, BLOG_SOURCE_REPLACEMENTS[slug]);
  }
  stats.ginzaCopy = await patchGinzaLandPriceCopy();
  await patchGinzaFactSheetClaims();
  await patchShibuyaPrimaryClaim();
  await patchWardGuideClaimYear();
  console.log(JSON.stringify(stats, null, 2));
}

async function patchWardGuideClaimYear() {
  const fp = path.join(root, "docs/fact-audit", "tokyo-ward-guide-series-prologue.md");
  let md = await readFile(fp, "utf8");
  md = md.replace("| 1 | 2026년 | Verified |", "| 1 | 2025년 (都人口表) | Verified |");
  await writeFile(fp, md, "utf8");
}

async function patchShibuyaPrimaryClaim() {
  const fp = path.join(root, "docs/fact-audit", "tokyo-shinjuku-shibuya-bunkyo.md");
  let md = await readFile(fp, "utf8");
  const shibuyaUrl =
    "https://www.city.shibuya.tokyo.jp/kusei/tokei_shibuya/jinko/jumin_toroku.html";
  md = md.replaceAll(
    "https://www.hokeniryo.metro.tokyo.lg.jp/documents/d/hokeniryo/01-1jinkou-setai",
    shibuyaUrl
  );
  md = md.replaceAll(
    "https://www.toukei.metro.tokyo.lg.jp/juukiy/2025/jy25qf0001.pdf",
    shibuyaUrl
  );
  if (!/\| 1 \| 231,402 \|/.test(md)) {
    md = md.replace(/\| 1 \| [^|]+ \| Verified \|/, "| 1 | 231,402 | Verified |", 1);
  }
  await writeFile(fp, md, "utf8");
}

async function patchGinzaFactSheetClaims() {
  const fp = path.join(root, "docs/fact-audit/ginza-marunouchi-walk-dna.md");
  let md = await readFile(fp, "utf8");
  const replacements = [
    ["| 21 | 6,710만 엔 |", "| 21 | 44,400,000円/㎡ |"],
    ["| 23 | 6,710万円 |", "| 23 | 44,400,000円/㎡ |"],
    ["| 38 | 6,710 |", "| 38 | 44,400,000 |"],
  ];
  for (const [from, to] of replacements) {
    md = md.replaceAll(from, to);
  }
  await writeFile(fp, md, "utf8");
}

main();
