// Local simulator for `.vercel/output/config.json` routing: feeds verify-matrix
// URLs through Vercel's route phases (sequential evaluation, status short-circuit,
// `filesystem` handle stops on static file hit). Approximates production behavior
// without deploying.
import fs from "node:fs";
import path from "node:path";

const CONFIG = ".vercel/output/config.json";
const STATIC_ROOT = ".vercel/output/static";

const cfg = JSON.parse(fs.readFileSync(CONFIG, "utf-8"));
const routes = cfg.routes;
const fsIdx = routes.findIndex(r => r.handle === "filesystem");

/**
 * @param {string} url
 * @returns {{ status: number, location?: string, matchedSrc?: string }}
 */
function evaluate(url) {
  // Vercel does case-sensitive regex matching against the raw URL.
  // alternation explicitly enumerates upper + lower percent forms.
  const candidates = [url];

  // Phase 1: routes BEFORE filesystem handle.
  for (let i = 0; i < fsIdx; i++) {
    const r = routes[i];
    if (r.handle) continue;
    if (!r.src) continue;
    const re = new RegExp(r.src);
    for (const u of candidates) {
      if (re.test(u)) {
        if (r.status && r.headers?.Location) {
          let loc = r.headers.Location;
          // Vercel-style $1 substitution
          const m = u.match(re);
          if (m) {
            loc = loc.replace(/\$(\d+)/g, (_, n) => m[+n] ?? "");
          }
          return { status: r.status, location: loc, matchedSrc: r.src };
        }
        if (r.dest) {
          // SSR/_render — treat as 200 (we don't actually execute it)
          return { status: 200, matchedSrc: r.src };
        }
      }
    }
  }

  // Phase 2: filesystem handle — check if a static file exists.
  // Try /foo/ -> /foo/index.html, /foo -> /foo.html, /foo.json etc.
  for (const u of candidates) {
    const decoded = (() => { try { return decodeURI(u); } catch { return u; } })();
    const candidatesFs = [
      path.join(STATIC_ROOT, decoded),
      path.join(STATIC_ROOT, decoded.replace(/\/$/, "") + ".html"),
      path.join(STATIC_ROOT, decoded.replace(/\/$/, ""), "index.html"),
    ];
    for (const p of candidatesFs) {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        return { status: 200, matchedSrc: `filesystem: ${path.relative(STATIC_ROOT, p)}` };
      }
    }
  }

  // Phase 3: routes AFTER filesystem handle.
  for (let i = fsIdx + 1; i < routes.length; i++) {
    const r = routes[i];
    if (r.handle) continue;
    if (!r.src) continue;
    const re = new RegExp(r.src);
    for (const u of candidates) {
      if (re.test(u)) {
        if (r.status && r.headers?.Location) {
          return { status: r.status, location: r.headers.Location, matchedSrc: r.src };
        }
        if (r.status === 404) {
          return { status: 404, matchedSrc: r.src };
        }
        if (r.dest) {
          return { status: 200, matchedSrc: r.src };
        }
      }
    }
  }

  return { status: 404 };
}

const MATRIX = [
  // 日本橋 (JA canonical, 5 posts -> 2 pages)
  ["/tags/日本橋/2/", 308, "/ja/tags/%E6%97%A5%E6%9C%AC%E6%A9%8B/"],
  ["/tags/日本橋/2", 308, "/ja/tags/%E6%97%A5%E6%9C%AC%E6%A9%8B/"],
  ["/tags/%E6%97%A5%E6%9C%AC%E6%A9%8B/2/", 308, "/ja/tags/%E6%97%A5%E6%9C%AC%E6%A9%8B/"],
  ["/tags/%e6%97%a5%e6%9c%ac%e6%a9%8b/2/", 308, "/ja/tags/%E6%97%A5%E6%9C%AC%E6%A9%8B/"],
  ["/ko/tags/日本橋/", 308, "/ja/tags/%E6%97%A5%E6%9C%AC%E6%A9%8B/"],
  ["/tags/日本橋/", 308, "/ja/tags/%E6%97%A5%E6%9C%AC%E6%A9%8B/"],
  ["/ja/tags/%E6%97%A5%E6%9C%AC%E6%A9%8B/", 200],
  ["/ja/tags/%E6%97%A5%E6%9C%AC%E6%A9%8B/2/", 200],
  // Investment (EN canonical)
  ["/tags/Investment/", 308, "/tags/investment/"],
  ["/ko/tags/Investment/", 308, "/tags/investment/"],
  ["/ja/tags/Investment/", 308, "/tags/investment/"],
  ["/tags/investment/", 200],
  ["/tags/Real%20Estate/", 308, "/tags/real-estate/"],
  ["/tags/real-estate/", 200],
  // KO canonical
  ["/tags/부동산/", 308, "/ko/tags/%EB%B6%80%EB%8F%99%EC%82%B0/"],
  ["/tags/%EB%B6%80%EB%8F%99%EC%82%B0/", 308, "/ko/tags/%EB%B6%80%EB%8F%99%EC%82%B0/"],
  ["/ja/tags/%EB%B6%80%EB%8F%99%EC%82%B0/", 308, "/ko/tags/%EB%B6%80%EB%8F%99%EC%82%B0/"],
  ["/ko/tags/%EB%B6%80%EB%8F%99%EC%82%B0/", 200],
  // nihonbashi (EN canonical, multi-page)
  ["/tags/nihonbashi/", 200],
  ["/tags/nihonbashi/2/", 200],
  // WP legacy
  ["/author/gsf/", 308, "/about/"],
  ["/feed/", 308, "/rss.xml"],
  ["/wp-admin/foo/", 308, "/"],
  ["/wp-login.php", 308, "/"],
  ["/wp-json/foo/", 308, "/"],
  // Safety net
  ["/tags/완전임의새태그/", 308, "/tags/"],
  ["/ko/tags/zzzunknown/", 308, "/tags/"],
  // Sitemap & robots
  ["/robots.txt", 200],
  ["/sitemap-index.xml", 200],
  ["/sitemap.xml", 308, "/sitemap-index.xml"],
];

/** Follow up to 5 redirect hops (mirrors real crawler behavior). */
function resolveChain(url, maxHops = 5) {
  let cur = url;
  let last;
  const chain = [url];
  for (let i = 0; i < maxHops; i++) {
    last = evaluate(cur);
    if (last.status === 308 && last.location) {
      cur = last.location;
      chain.push(cur);
      continue;
    }
    break;
  }
  return { ...last, finalUrl: cur, chain };
}

let pass = 0, fail = 0;
const fails = [];
for (const [url, wantStatus, wantLoc] of MATRIX) {
  const r = resolveChain(url);
  // For 308-expected: check that any hop landed on wantLoc (i.e. final URL includes it).
  // For 200-expected: check terminal status is 200.
  const okStatus = wantStatus === 200 ? r.status === 200 : r.chain.length > 1;
  const okLoc = !wantLoc || r.finalUrl.includes(wantLoc) ||
    r.chain.some(u => u.includes(wantLoc));
  if (okStatus && okLoc) {
    pass++;
    const hopInfo = r.chain.length > 1 ? ` → ${r.finalUrl}` : "";
    console.log(`  OK   ${r.status} ${url}${hopInfo}`);
  } else {
    fail++;
    fails.push({ url, wantStatus, wantLoc, got: r });
    console.log(`  FAIL ${r.status} ${url}`);
    console.log(`        want ${wantStatus} ${wantLoc ?? ""}`);
    console.log(`        chain: ${r.chain.join(" → ")}`);
    console.log(`        matched: ${r.matchedSrc ?? "(none)"}`);
  }
}
console.log(`\n=== Result: ${pass} pass, ${fail} fail ===`);
process.exit(fail ? 1 : 0);
