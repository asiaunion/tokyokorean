/**
 * Normalize tier-1 URL cells in fact-sheet claim tables to [url](url).
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dir = path.join(root, "docs/fact-audit");

const CONCAT_FIXES = [
  [
    "https://www.toukei.metro.tokyo.lg.jp/juukiy/2025/https://www.stat.go.jp/data/idou/rireki/2501/index.html",
    "https://www.stat.go.jp/data/idou/rireki/2501/index.html",
  ],
  [
    "https://www.boj.or.jp/en/about/release_2026/index.htmhttps://www.boj.or.jp/en/about/release_2026/index.htmstatistics/research/index.htm",
    "https://www.boj.or.jp/en/about/release_2026/index.htm",
  ],
];

function firstUrl(text) {
  const m = text.match(/https?:\/\/[^\s|)\]]+/);
  return m ? m[0] : null;
}

function repairClaimRow(line) {
  if (!/^\|\s*\d+\s*\|/.test(line)) return line;
  const parts = line.split("|");
  if (parts.length < 7) return line;
  const urlCell = parts[4];
  const url = firstUrl(urlCell);
  if (!url) return line;
  parts[4] = ` [${url}](${url}) `;
  return parts.join("|");
}

function repair(md) {
  let out = md;
  for (const [bad, good] of CONCAT_FIXES) {
    out = out.split(bad).join(good);
  }
  out = out
    .split("\n")
    .map(line => repairClaimRow(line))
    .join("\n");
  // Sources table rows (no claim index)
  out = out.replace(
    /^\| (\[[^\|]+\| [^\|]+ \| \[x\] \|)$/gm,
    line => {
      const url = firstUrl(line);
      if (!url) return line;
      return `| [${url}](${url}) | public | [ ] |`;
    }
  );
  return out;
}

async function main() {
  let n = 0;
  for (const f of await readdir(dir)) {
    if (!f.endsWith(".md")) continue;
    const fp = path.join(dir, f);
    const md = await readFile(fp, "utf8");
    const next = repair(md);
    if (next !== md) {
      await writeFile(fp, next, "utf8");
      n += 1;
    }
  }
  console.log(JSON.stringify({ repairedFiles: n }, null, 2));
}

main();
