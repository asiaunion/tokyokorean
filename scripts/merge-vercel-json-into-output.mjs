#!/usr/bin/env node
/**
 * Prebuilt deploy does not apply project vercel.json. This script:
 * 1) Adds trailing-slash variants for Astro redirect routes (^/path$ → ^/path/$).
 * 2) Merges non-tag vercel.json redirects (WP, /en, feed, author, …) — tag rules
 *    stay in astro.config only to stay under Vercel's 2048 route limit.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const configPath = path.join(root, ".vercel", "output", "config.json");
const vercelJsonPath = path.join(root, "vercel.json");
const goneRoutesPath = path.join(root, "scripts/vercel-gone-routes.json");

/** Tag slug redirects come from astro.config; skip duplicate vercel.json rows */
function isTagRedirect(source) {
  return /\/tags\/[^/]+/.test(source) && !/\/tags\/archive\/?$/.test(source);
}

function sourceToSrc(source) {
  let pattern = source
    .replace(/:path\*/g, "___PATHSTAR___")
    .replace(/:path/g, "___PATH___");
  pattern = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  pattern = pattern
    .replace(/___PATHSTAR___/g, "(.*)")
    .replace(/___PATH___/g, "([^/]+)");
  return `^${pattern}$`;
}

function vercelDestination(dest) {
  return dest.replace(/:path\*/g, "$1").replace(/:path/g, "$1");
}

function vercelRedirectToRoute({ source, destination, permanent }) {
  return {
    src: sourceToSrc(source),
    status: permanent === false ? 307 : 308,
    headers: { Location: vercelDestination(destination) },
  };
}

function trailingSlashVariant(route) {
  if (route.status !== 308 && route.status !== 307) return null;
  const { src } = route;
  if (!src?.startsWith("^") || !src.endsWith("$")) return null;
  const inner = src.slice(1, -1);
  if (inner.endsWith("/") || inner.endsWith("/?")) return null;
  return { ...route, src: `^${inner}/$` };
}

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, "utf8"));
const fromVercel = (vercelJson.redirects ?? [])
  .filter(r => !isTagRedirect(r.source))
  .map(vercelRedirectToRoute);

const goneSources = JSON.parse(fs.readFileSync(goneRoutesPath, "utf-8"));
const fromGone = goneSources.map(source => ({
  src: sourceToSrc(source),
  status: 410,
}));

const existing = config.routes ?? [];

/** Astro adapter trailing-slash normalizers — must run after explicit 308 rules */
function isFrameworkSlashRule(route) {
  const src = route.src ?? "";
  return (
    src.includes("(?:[^/]+/)*[^/") ||
    src.includes("[^/]+\\.\\w+")
  );
}

const redirects = existing.filter(
  r =>
    (r.status === 308 || r.status === 307) && !isFrameworkSlashRule(r)
);
const frameworkSlash = existing.filter(
  r =>
    (r.status === 308 || r.status === 307) && isFrameworkSlashRule(r)
);
const gone = existing.filter(r => r.status === 410);
const other = existing.filter(
  r => r.status !== 308 && r.status !== 307 && r.status !== 410
);

const seen = new Set();
const merged = [];

function push(route) {
  const key = `${route.src}|${route.status ?? ""}|${route.headers?.Location ?? route.dest ?? ""}`;
  if (seen.has(key)) return;
  seen.add(key);
  merged.push(route);
}

/** Site uses trailingSlash: "always" — only emit /path/ patterns to save route budget */
function pushTrailingSlashOnly(route) {
  const slash = trailingSlashVariant(route);
  push(slash ?? route);
}

// Explicit 308 rules first (tag cross-locale, legacy slugs, author, feed).
for (const r of fromVercel) pushTrailingSlashOnly(r);
for (const r of redirects) pushTrailingSlashOnly(r);
// WP legacy 410 before static filesystem.
for (const r of fromGone) push(r);
for (const r of gone) push(r);
for (const r of other) push(r);
for (const r of frameworkSlash) push(r);

config.routes = merged;
fs.writeFileSync(configPath, JSON.stringify(config));
console.log(
  `merge-vercel-json: ${fromVercel.length} redirects, ${fromGone.length} gone, ${merged.length} total routes`,
);
