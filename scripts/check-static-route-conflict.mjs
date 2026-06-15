#!/usr/bin/env node

/**
 * check-static-route-conflict.mjs
 *
 * Detects conflicts between public/ static files and src/pages/ dynamic routes.
 * In Astro, if both exist for the same output path, the src/pages/ route silently
 * overwrites the public/ file at build time — with NO warning.
 *
 * Incident: public/robots.txt (18 Disallow rules) was silently overwritten by
 * src/pages/robots.txt.ts (prerender, 4 lines) for 7 days.
 *
 * Usage: node scripts/check-static-route-conflict.mjs
 * Exit code: 1 if conflicts found, 0 if clean.
 */

import { readdirSync, statSync, existsSync } from "node:fs";
import { join, extname, basename, relative } from "node:path";

const PUBLIC_DIR = "public";
const PAGES_DIR = "src/pages";

// Extensions that Astro uses to generate routes
const ROUTE_EXTENSIONS = new Set([".ts", ".js", ".astro", ".mjs"]);

// Directories to skip in public/ (not conflictable with routes)
const SKIP_DIRS = new Set(["pagefind", "assets", "fonts", "toggle-theme.js"]);

/**
 * Recursively collect all files in a directory, returning relative paths.
 */
function walkDir(dir, base = dir) {
  const results = [];
  if (!existsSync(dir)) return results;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (base === dir && SKIP_DIRS.has(entry.name)) continue;
      results.push(...walkDir(fullPath, base));
    } else {
      results.push(relative(base, fullPath));
    }
  }
  return results;
}

/**
 * Given a public file path like "robots.txt" or "feed/index.xml",
 * find candidate route files in src/pages/ that would output the same path.
 */
function findConflictingRoutes(publicRelPath) {
  const candidates = [];

  // "robots.txt" → look for src/pages/robots.txt.{ts,js,astro}
  for (const ext of ROUTE_EXTENSIONS) {
    const routePath = join(PAGES_DIR, publicRelPath + ext);
    if (existsSync(routePath)) {
      candidates.push(routePath);
    }
  }

  // Also check if the base name without extension has a route
  // e.g., "feed.xml" → src/pages/feed.xml.ts
  const dir = join(PAGES_DIR, publicRelPath.replace(/\/[^/]+$/, ""));
  const name = basename(publicRelPath);
  const nameNoExt = name.replace(extname(name), "");

  // "index.html" → src/pages/index.astro
  if (name === "index.html") {
    for (const ext of ROUTE_EXTENSIONS) {
      const routePath = join(
        PAGES_DIR,
        publicRelPath.replace("index.html", `index${ext}`)
      );
      if (existsSync(routePath)) {
        candidates.push(routePath);
      }
    }
  }

  return [...new Set(candidates)];
}

// ── Main ──

const publicFiles = walkDir(PUBLIC_DIR);
const conflicts = [];

for (const pubFile of publicFiles) {
  const routes = findConflictingRoutes(pubFile);
  if (routes.length > 0) {
    conflicts.push({ publicFile: `public/${pubFile}`, routes });
  }
}

if (conflicts.length > 0) {
  console.error("\n🚨 STATIC/ROUTE CONFLICT DETECTED\n");
  console.error(
    "Astro prerender silently overwrites public/ files when src/pages/ routes"
  );
  console.error("generate the same output path. This causes silent data loss.\n");

  for (const { publicFile, routes } of conflicts) {
    console.error(`  ❌ ${publicFile}`);
    for (const route of routes) {
      console.error(`     ↔ ${route}  (this WINS at build time)`);
    }
    console.error("");
  }

  console.error("Fix: keep only ONE source. See AGENTS.md § 충돌 방지 규칙.\n");
  process.exit(1);
} else {
  console.log("✅ No static/route file conflicts detected.");
  process.exit(0);
}
