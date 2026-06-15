#!/usr/bin/env node
/**
 * Production smoke test: every post that embeds /assets/images/blog/svg/*.svg
 * - Post returns 200, no noindex, img src present in HTML
 * - SVG asset returns 200 with image/svg+xml and xmlns on root <svg>
 *
 * Usage:
 *   node scripts/verify-svg-posts.mjs
 *   BASE_URL=https://staging.example node scripts/verify-svg-posts.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = path.join(root, "src/data/blog");
const BASE = (process.env.BASE_URL ?? "https://gsfark.com").replace(/\/$/, "");

const mdSvg = /!\[[^\]]*\]\(\/assets\/images\/blog\/svg\/([a-z]{2}-[^)\s"]+\.svg)\)/g;

function collectPosts() {
  const posts = [];
  for (const md of fs
    .readdirSync(blogDir, { recursive: true })
    .filter(f => String(f).endsWith(".md"))) {
    const full = path.join(blogDir, String(md));
    const text = fs.readFileSync(full, "utf-8");
    const locale = path.basename(path.dirname(full));
    const slug = path.basename(full, ".md");
    const svgs = [...text.matchAll(mdSvg)].map(m => m[1]);
    if (!svgs.length) continue;
    const prefix = locale === "en" ? "" : `${locale}/`;
    posts.push({
      locale,
      slug,
      url: `${BASE}/${prefix}posts/${slug}/`,
      svg: svgs[0],
    });
  }
  return posts;
}

async function head(url) {
  const res = await fetch(url, {
    method: "HEAD",
    redirect: "follow",
    headers: { "User-Agent": "GSF-SVG-Smoke/1.0" },
  });
  return res;
}

async function checkSvg(name) {
  const url = `${BASE}/assets/images/blog/svg/${name}`;
  const res = await head(url);
  if (!res.ok) return { ok: false, issue: `svg_http_${res.status}` };
  const ct = res.headers.get("content-type") ?? "";
  const get = await fetch(url, {
    headers: { "User-Agent": "GSF-SVG-Smoke/1.0" },
  });
  const headChunk = (await get.text()).slice(0, 400);
  const hasXmlns =
    headChunk.includes('xmlns="http://www.w3.org/2000/svg"') ||
    headChunk.includes("xmlns='http://www.w3.org/2000/svg'");
  if (!hasXmlns) return { ok: false, issue: "svg_no_xmlns" };
  if (!ct.toLowerCase().includes("svg")) return { ok: false, issue: "svg_bad_ct" };
  return { ok: true };
}

async function checkPost(post, svgCache) {
  const res = await fetch(post.url, {
    redirect: "follow",
    headers: { "User-Agent": "GSF-SVG-Smoke/1.0" },
  });
  if (!res.ok) return { ...post, ok: false, issue: `post_http_${res.status}` };
  const html = await res.text();
  if (/noindex/i.test(html)) return { ...post, ok: false, issue: "post_noindex" };
  const needle = `/assets/images/blog/svg/${post.svg}`;
  if (!html.includes(needle))
    return { ...post, ok: false, issue: "img_src_missing" };
  const svg = svgCache.get(post.svg) ?? (await checkSvg(post.svg));
  svgCache.set(post.svg, svg);
  if (!svg.ok) return { ...post, ok: false, issue: svg.issue };
  return { ...post, ok: true };
}

const posts = collectPosts();
const svgCache = new Map();
const failures = [];

for (const post of posts) {
  const r = await checkPost(post, svgCache);
  if (!r.ok) failures.push(r);
}

console.log(`SVG posts checked: ${posts.length} (unique SVGs: ${svgCache.size})`);
if (failures.length) {
  console.error(`FAILURES: ${failures.length}`);
  for (const f of failures) {
    console.error(`  ${f.url} — ${f.issue} (${f.svg})`);
  }
  process.exit(1);
}
console.log("All SVG post smoke checks passed.");
