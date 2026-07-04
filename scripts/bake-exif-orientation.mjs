#!/usr/bin/env node

/**
 * Bake EXIF Orientation into pixel data and strip the tag.
 * iPhone photos often use Orientation 6 — browsers may render sideways if not baked.
 *
 * Usage:
 *   node scripts/bake-exif-orientation.mjs              # scan in-use post images
 *   node scripts/bake-exif-orientation.mjs --fix        # rewrite files in place
 *   node scripts/bake-exif-orientation.mjs --all --fix  # entire blog image dir
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";
import { execSync } from "node:child_process";
import sharp from "sharp";

const IMAGE_DIR = "public/assets/images/blog";
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG"]);

const args = new Set(process.argv.slice(2));
const fix = args.has("--fix");
const scanAll = args.has("--all");

function collectInUseImages() {
  const out = new Set();
  const matches = execSync(
    'rg -o --no-filename "/assets/images/blog/[^\\")\\]]+" src/data/blog || true',
    { encoding: "utf8" }
  );
  for (const line of matches.split("\n")) {
    const p = line.trim();
    if (!p.startsWith("/assets/images/blog/")) continue;
    out.add(p.replace(/^\/assets\/images\/blog\//, ""));
  }
  return [...out];
}

function listAllImages() {
  return readdirSync(IMAGE_DIR).filter(f => IMAGE_EXT.has(extname(f)));
}

async function checkOrientation(relPath) {
  const full = join(IMAGE_DIR, relPath);
  const meta = await sharp(full).metadata();
  return {
    relPath,
    orientation: meta.orientation ?? 1,
    width: meta.width,
    height: meta.height,
  };
}

async function bakeImage(relPath) {
  const full = join(IMAGE_DIR, relPath);
  const input = sharp(full);
  const meta = await input.metadata();
  const ext = extname(relPath).toLowerCase();

  let pipeline = input.rotate();

  if (ext === ".webp") {
    pipeline = pipeline.webp({ quality: 85 });
  } else if (ext === ".png") {
    pipeline = pipeline.png();
  } else {
    pipeline = pipeline.jpeg({ quality: 88, mozjpeg: true });
  }

  const buffer = await pipeline.toBuffer();
  writeFileSync(full, buffer);

  const after = await sharp(full).metadata();
  return {
    before: meta.orientation ?? 1,
    after: after.orientation ?? 1,
    size: `${after.width}x${after.height}`,
  };
}

const targets = scanAll ? listAllImages() : collectInUseImages();
const rotated = [];

for (const rel of targets) {
  try {
    const info = await checkOrientation(rel);
    if (info.orientation !== 1) rotated.push(info);
  } catch {
    console.warn(`⚠️  skip (unreadable): ${rel}`);
  }
}

if (rotated.length === 0) {
  console.log(`✅ No EXIF rotation needed (${targets.length} images scanned).`);
  process.exit(0);
}

console.log(`Found ${rotated.length} image(s) with EXIF Orientation ≠ 1:\n`);
for (const r of rotated) {
  console.log(`  • ${r.relPath}  orientation=${r.orientation}  ${r.width}x${r.height}`);
}

if (!fix) {
  console.log("\nRun with --fix to bake orientation into pixels.");
  process.exit(1);
}

console.log("\nBaking…");
for (const r of rotated) {
  const result = await bakeImage(r.relPath);
  console.log(`  ✓ ${r.relPath}  ${result.before} → ${result.after}  ${result.size}`);
}

console.log(`\n✅ Baked ${rotated.length} image(s).`);
