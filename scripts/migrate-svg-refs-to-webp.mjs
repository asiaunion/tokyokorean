/**
 * Point blog markdown/mdx image refs from svg/ to diagrams/*.webp
 * Usage: node scripts/migrate-svg-refs-to-webp.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const blogDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/data/blog"
);

const REF =
  /\/assets\/images\/blog\/svg\/([a-z]{2}-[^)\s"]+\.svg)/g;

function migrateFile(fp) {
  const raw = fs.readFileSync(fp, "utf8");
  const next = raw.replace(REF, (_, name) => {
    const webp = name.replace(/\.svg$/i, ".webp");
    return `/assets/images/blog/diagrams/${webp}`;
  });
  if (next !== raw) {
    fs.writeFileSync(fp, next, "utf8");
    return true;
  }
  return false;
}

function walk(dir) {
  let n = 0;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) n += walk(p);
    else if (/\.mdx?$/.test(ent.name) && migrateFile(p)) {
      console.log(`  updated ${path.relative(blogDir, p)}`);
      n += 1;
    }
  }
  return n;
}

const count = walk(blogDir);
console.log(JSON.stringify({ filesUpdated: count }, null, 2));
