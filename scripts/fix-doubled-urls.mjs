/**
 * Fix accidental double-substitution in fact-sheet URLs.
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dir = path.join(root, "docs/fact-audit");

const FIXES = [
  ["c2025.pdfwp-content/uploads/c2025.pdf", "c2025.pdf"],
  ["jy25qf0001.pdfjuukiy/2025/jy25qf0001.pdf", "jy25qf0001.pdf"],
  [
    "index.php?bid=news&cate=newsindex.php?bid=news&cate=news",
    "index.php?bid=news&cate=news",
  ],
  ["statistics/dl/index.htmstatistics/dl/index.htm", "statistics/dl/index.htm"],
  [
    "https://www.kantei.ne.jp/wp-content/uploads/c2025.pdfwp-content/uploads/c2025.pdf",
    "https://www.kantei.ne.jp/wp-content/uploads/c2025.pdf",
  ],
  [
    "https://www.toukei.metro.tokyo.lg.jp/juukiy/2025/jy25qf0001.pdfjuukiy/2025/jy25qf0001.pdf",
    "https://www.toukei.metro.tokyo.lg.jp/juukiy/2025/jy25qf0001.pdf",
  ],
  [
    "https://www.boj.or.jp/en/statistics/dl/index.htmstatistics/dl/index.htm",
    "https://www.boj.or.jp/en/statistics/dl/index.htm",
  ],
  [
    "https://www.mindan.org/index.php?bid=news&cate=newsindex.php?bid=news&cate=news",
    "https://www.mindan.org/index.php?bid=news&cate=news",
  ],
  ["https://www.https://www.", "https://www."],
];

async function main() {
  let n = 0;
  for (const f of await readdir(dir)) {
    if (!f.endsWith(".md")) continue;
    const fp = path.join(dir, f);
    let md = await readFile(fp, "utf8");
    let next = md;
    for (const [bad, good] of FIXES) {
      next = next.split(bad).join(good);
    }
    if (next !== md) {
      await writeFile(fp, next, "utf8");
      n += 1;
    }
  }
  console.log(JSON.stringify({ fixedFiles: n }, null, 2));
}

main();
