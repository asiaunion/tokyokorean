#!/usr/bin/env node
/**
 * @astrojs/sitemap overwrites public/robots.txt at build time.
 * Re-apply WP disallow rules after `astro build`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const content = `User-agent: *
Allow: /

# Legacy WordPress paths — no longer served (410/403 at edge)
Disallow: /wp-admin/
Disallow: /wp-includes/
Disallow: /wp-content/
Disallow: /wp-json/
Disallow: /wp-login.php

Sitemap: https://gsfark.com/sitemap-index.xml
`;

const targets = [
  path.join(root, "dist/client/robots.txt"),
  path.join(root, ".vercel/output/static/robots.txt"),
];

for (const file of targets) {
  if (!fs.existsSync(path.dirname(file))) continue;
  fs.writeFileSync(file, content);
  console.log(`patch-robots-txt: wrote ${file}`);
}
