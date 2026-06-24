/**
 * Post-build patch of `.vercel/output/config.json`:
 *
 * 1. STRIP per-tag redirects emitted by Astro from any prior build path (the
 *    1881-rule explosion that nudged Vercel's 2048 route limit).
 * 2. INJECT WP legacy + tag catch-all BEFORE the `filesystem` handle.
 */

import fs from "node:fs";
import path from "node:path";
import {
  TAG_SAFETY_NET,
  WP_LEGACY_ROUTES,
  type VercelRoute,
} from "./tagCanonicalRedirects";

const FILESYSTEM_HANDLE: VercelRoute = { handle: "filesystem" };

/** Astro emits per-tag 308s with src matching this. Strip them. */
function isPerTagRedirect(route: VercelRoute): boolean {
  if (route.status !== 308 || !route.src) return false;
  // Astro emits ^/[locale/]tags/<segment>(/<page>)?$
  return /^\^(?:\/(?:ko|ja))?\/tags\/[^/(]+(?:\/\d+|\/\\d\+)?\$?$/.test(
    route.src.replace(/\/\?\$$/, "$"),
  );
}

/** Cross-locale variant: `/tags/<utf8>` 또는 `/ko/tags/Title-Case` 등 */
function isLegacyTagAlias(route: VercelRoute): boolean {
  if (route.status !== 308 || !route.src) return false;
  if (!route.src.includes("/tags/")) return false;
  const loc = route.headers?.Location ?? "";
  return loc.includes("/tags/");
}

export function patchVercelConfig(
  configPath: string,
  blogDir: string,
): {
  stripped: number;
  catchAlls: number;
  wpLegacy: number;
  total: number;
} {
  const raw = fs.readFileSync(configPath, "utf-8");
  const cfg = JSON.parse(raw) as { version: number; routes: VercelRoute[] };

  // 1) Strip per-tag redirects (cross-locale + pagination tables).
  const kept: VercelRoute[] = [];
  let stripped = 0;
  for (const r of cfg.routes) {
    if (isPerTagRedirect(r) || isLegacyTagAlias(r)) {
      stripped++;
      continue;
    }
    kept.push(r);
  }

  // 2) Locate filesystem handle. Required for safe placement.
  const fsIdx = kept.findIndex(r => r.handle === "filesystem");
  if (fsIdx < 0) {
    throw new Error(
      "patchVercelConfig: filesystem handle not found in Vercel config.json",
    );
  }

  // 3) Inject WP legacy + TAG_SAFETY_NET BEFORE filesystem.
  kept.splice(fsIdx, 0, ...WP_LEGACY_ROUTES, TAG_SAFETY_NET);

  cfg.routes = kept;
  fs.writeFileSync(configPath, JSON.stringify(cfg));

  return {
    stripped,
    catchAlls: 1, // TAG_SAFETY_NET 1개
    wpLegacy: WP_LEGACY_ROUTES.length,
    total: cfg.routes.length,
  };
}

export function defaultVercelConfigPath(projectRoot: string): string {
  return path.join(projectRoot, ".vercel", "output", "config.json");
}

export function defaultBlogDir(projectRoot: string): string {
  return path.join(projectRoot, "src", "data", "blog");
}
