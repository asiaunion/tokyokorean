/**
 * One-off spot check for tokyo-real-estate headline sources (Phase 0).
 * Run: node scripts/tokyo-source-url-spot.mjs
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fetchPdfAsPlainText } from "../src/lib/validation/pdfText.ts";
import { htmlToPlainText } from "../src/lib/validation/trustUtils.ts";

const root = process.cwd();

const CHECKS = [
  {
    id: "mlit-foreign-buyer",
    url: "https://www.mlit.go.jp/report/press/content/001970012.pdf",
    needles: ["3.5", "7.5", "3.2"],
    type: "pdf",
  },
  {
    id: "reins-marketwatch",
    url: "https://www.reins.or.jp/pdf/trend/mw/mw_202604_summary.pdf",
    needles: ["137", "140"],
    type: "pdf",
  },
  {
    id: "miki-office-vacancy-xlsx",
    url: "https://www.e-miki.com/rent/assets/market/tokyo.xlsx",
    archivePath: "/assets/sources/miki-202603-tokyo-office-market.xlsx",
    needles: ["2.22"],
    type: "xlsx-archive",
  },
];

async function fetchHtmlText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "GSF-Blog-Trust-Verify/1.0" },
    redirect: "follow",
  });
  if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
  return { ok: true, text: htmlToPlainText(await res.text()) };
}

function xlsxSheetText(archivePath) {
  const file = path.join(root, "public", archivePath.replace(/^\//, ""));
  try {
    const xml = execSync(`unzip -p "${file}" xl/worksheets/sheet1.xml`, {
      encoding: "utf8",
      maxBuffer: 2_000_000,
    });
    return { ok: true, text: xml };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "xlsx extract failed",
    };
  }
}

async function main() {
  const report = [];
  for (const c of CHECKS) {
    let body;
    if (c.type === "pdf") body = await fetchPdfAsPlainText(c.url);
    else if (c.type === "xlsx-archive") {
      const head = await fetch(c.url, { method: "HEAD", redirect: "follow" });
      if (!head.ok) body = { ok: false, error: `HTTP ${head.status}` };
      else body = xlsxSheetText(c.archivePath);
    } else body = await fetchHtmlText(c.url);
    const hits = body.ok
      ? c.needles.map(n => ({ needle: n, found: body.text.includes(n) }))
      : [];
    const pass = body.ok && hits.every(h => h.found);
    report.push({ id: c.id, url: c.url, ok: pass, error: body.ok ? undefined : body.error, hits });
    console.log(JSON.stringify({ id: c.id, pass, hits, error: body.error }));
  }
  return report.every(r => r.ok) ? 0 : 1;
}

process.exit(await main());
