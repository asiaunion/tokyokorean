import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import { patchVercelConfig } from "./patchVercelRedirectsTrailingSlash";

/**
 * Runs last among default integrations: adapter is unshifted first, Vercel injects
 * `astro:copy-vercel-output`, then this is appended from pagefind's config:setup.
 * Ensures `.vercel/output/static/pagefind-aux/` exists after `cpSync(dist/client → static)`.
 *
 * Uses `config.root` (set in astro:config:done) — not `process.cwd()` — so monorepos and
 * Vercel builds resolve `.vercel/output/static` correctly.
 */
function pagefindVercelAuxIntegration(
  vercelStaticDir: () => string,
  blogDir: () => string,
): AstroIntegration {
  return {
    name: "pagefind-sync-aux-to-vercel-static",
    hooks: {
      "astro:build:done": ({ dir, logger }) => {
        const clientDir = fileURLToPath(dir);
        const auxSrc = path.join(clientDir, "pagefind-aux");
        const destRoot = vercelStaticDir();
        const configPath = path.join(path.dirname(destRoot), "config.json");
        if (fs.existsSync(configPath)) {
          const r = patchVercelConfig(configPath, blogDir());
          logger.info(
            `vercel-config-patch: stripped ${r.stripped} per-tag, +${r.catchAlls} catch-alls, +${r.wpLegacy} WP legacy, total ${r.total} routes`,
          );
        }
        if (!fs.existsSync(auxSrc)) {
          logger.warn(
            `pagefind-sync-aux: missing ${auxSrc} (no pagefind-aux in client output); skip`,
          );
          return;
        }
        if (!fs.existsSync(destRoot)) {
          logger.warn(
            `pagefind-sync-aux: missing ${destRoot} (.vercel/output/static); skip`,
          );
          return;
        }
        const auxDest = path.join(destRoot, "pagefind-aux");
        fs.rmSync(auxDest, { recursive: true, force: true });
        fs.cpSync(auxSrc, auxDest, { recursive: true });
        logger.info(`pagefind-sync-aux: synced to ${auxDest}`);
      },
    },
  };
}

/**
 * Run Pagefind inside the Astro build so the index lands in the same directory
 * the adapters ship to production (e.g. `.vercel/output/static`).
 *
 * A post-build `cp` to `public/pagefind` is too late: Vercel has already finalized
 * static assets, so `/pagefind/*` 404s on the live site.
 */
export function pagefindIntegration(): AstroIntegration {
  let projectRoot = process.cwd();
  let vercelStaticAbs = path.join(projectRoot, ".vercel", "output", "static");
  let blogDirAbs = path.join(projectRoot, "src", "data", "blog");

  const syncAux = pagefindVercelAuxIntegration(
    () => vercelStaticAbs,
    () => blogDirAbs,
  );

  return {
    name: "pagefind-build",
    hooks: {
      "astro:config:done": ({ config }) => {
        projectRoot = fileURLToPath(config.root);
        vercelStaticAbs = fileURLToPath(
          new URL(".vercel/output/static/", config.root),
        );
        blogDirAbs = fileURLToPath(
          new URL("src/data/blog/", config.root),
        );
      },
      "astro:config:setup": ({ updateConfig }) => {
        updateConfig({
          integrations: [syncAux],
        });
      },
      "astro:build:done": ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        const cli = path.join(
          projectRoot,
          "node_modules",
          "pagefind",
          "lib",
          "runner",
          "bin.cjs",
        );
        if (!fs.existsSync(cli)) {
          logger.warn(
            "pagefind CLI not found under node_modules; skipping search index.",
          );
          return;
        }
        logger.info(`Indexing search (Pagefind) in ${outDir}`);
        const result = spawnSync(process.execPath, [cli, "--site", outDir], {
          stdio: "inherit",
        });
        if (result.error) throw result.error;
        if (result.status !== 0) {
          throw new Error(`pagefind exited with code ${result.status ?? "unknown"}`);
        }

        /*
         * Pagefind skips mergeIndex when the merge bundle path is the same as (or a
         * prefix of) the primary bundle: primary.basePath.startsWith(indexPath).
         * The UI loads merged languages from `/pagefind-aux/` (see search.astro).
         * Do not use root `vercel.json` rewrites: they can break Astro's Vercel
         * Build Output API. `pagefind-sync-aux-to-vercel-static` runs after Vercel's
         * copy hook so `.vercel/output/static/pagefind-aux/` is present on deploy.
         * The copy below also supports `astro preview` and non-Vercel static hosts.
         */
        const pagefindDir = path.join(outDir, "pagefind");
        const auxDir = path.join(outDir, "pagefind-aux");
        if (!fs.existsSync(pagefindDir)) {
          logger.warn(`Expected ${pagefindDir} after pagefind; skip pagefind-aux copy.`);
          return;
        }
        fs.rmSync(auxDir, { recursive: true, force: true });
        fs.cpSync(pagefindDir, auxDir, { recursive: true });
        logger.info(`Copied Pagefind bundle to ${auxDir} for cross-language mergeIndex.`);
      },
    },
  };
}
