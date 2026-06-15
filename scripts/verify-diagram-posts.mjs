#!/usr/bin/env node
/**
 * Smoke test: posts embedding /assets/images/blog/diagrams/*.webp
 * Usage: BASE_URL=https://gsfark.com node scripts/verify-diagram-posts.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = path.join(root, "src/data/blog");
const BASE = (process.env.BASE_URL ?? "https://gsfark.com").replace(/\/$/, "");

const mdWebp =
  /!\[[^\]]*\]\(\/assets\/images\/blog\/diagrams\/([a-z]{2}-[^)\s"]+\.webp)\)/g;

function collectPosts() {
  const posts = [];
  for (const rel of fs.readdirSync(blogDir, { recursive: true })) {
    const s = String(rel);
    if (!/\.mdx?$/.test(s)) continue;
    const full = path.join(blogDir, s);
    const text = fs.readFileSync(full, "utf8");
    const assets = [...text.matchAll(mdWebp)].map(m => m[1]);
    if (!assets.length) continue;
    const locale = path.basename(path.dirname(full));
    const slug = path.basename(full).replace(/\.mdx?$/, "");
    const prefix = locale === "en" ? "" : `${locale}/`;
    posts.push({
      locale,
      slug,
      url: `${BASE}/${prefix}posts/${slug}/`,
      webp: assets[0],
    });
  }
  return posts;
}

async function checkWebp(name) {
  const url = `${BASE}/assets/images/blog/diagrams/${name}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "GSF-Diagram-Smoke/1.0" },
  });
  if (!res.ok) return { ok: false, issue: `webp_http_${res.status}` };
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("image")) return { ok: false, issue: "webp_bad_ct" };
  return { ok: true };
}

async function checkPost(post, cache) {
  const res = await fetch(post.url, {
    headers: { "User-Agent": "GSF-Diagram-Smoke/1.0" },
  });
  if (!res.ok) return { ...post, ok: false, issue: `post_http_${res.status}` };
  const html = await res.text();
  const needle = `/assets/images/blog/diagrams/${post.webp}`;
  if (!html.includes(needle))
    return { ...post, ok: false, issue: "img_src_missing" };
  const asset = cache.get(post.webp) ?? (await checkWebp(post.webp));
  cache.set(post.webp, asset);
  if (!asset.ok) return { ...post, ok: false, issue: asset.issue };
  return { ...post, ok: true };
}

const posts = collectPosts();
const cache = new Map();
const failures = [];

for (const post of posts) {
  const r = await checkPost(post, cache);
  if (!r.ok) failures.push(r);
}

console.log(
  `Diagram posts checked: ${posts.length} (unique WebPs: ${cache.size})`
);
if (failures.length) {
  console.error(`FAILURES: ${failures.length}`);
  for (const f of failures) console.error(`  ${f.url} — ${f.issue}`);
  process.exit(1);
}
console.log("All diagram post smoke checks passed.");
