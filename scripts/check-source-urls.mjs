/**
 * HEAD-check URLs from docs/fact-audit/sources/*.sources.yaml manifests.
 * Verifies local archive files exist under public/.
 *
 * Usage:
 *   node scripts/check-source-urls.mjs
 *   node scripts/check-source-urls.mjs tokyo-real-estate-investment-complete-guide
 */
import { readFile, readdir, access } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const slugArg = process.argv[2];

function extractUrls(yamlText) {
  const urls = [];
  for (const line of yamlText.split("\n")) {
    const m = line.match(/^\s*(?:primaryUrl|primaryPdf|portalUrl):\s*(https:\S+)/);
    if (m) urls.push(m[1]);
    const arch = line.match(/^\s*archivePath:\s*(\/assets\/sources\/\S+)/);
    if (arch) urls.push({ archive: arch[1] });
  }
  return urls;
}

async function checkUrl(url) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "GSF-Blog-Trust-Verify/1.0" },
    });
    return { url, ok: res.ok, status: res.status };
  } catch (error) {
    return {
      url,
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : "failed",
    };
  } finally {
    clearTimeout(t);
  }
}

async function checkArchive(archivePath) {
  const file = path.join(root, "public", archivePath.replace(/^\//, ""));
  try {
    await access(file);
    return { archivePath, ok: true, file };
  } catch {
    return { archivePath, ok: false, file };
  }
}

async function main() {
  const dir = path.join(root, "docs/fact-audit/sources");
  const files = (await readdir(dir).catch(() => [])).filter(f => f.endsWith(".sources.yaml"));
  const selected = slugArg
    ? files.filter(f => f.startsWith(`${slugArg}.`))
    : files;

  if (selected.length === 0) {
    console.error("No manifest files found", slugArg ? `for slug ${slugArg}` : "");
    process.exit(1);
  }

  const results = [];
  for (const file of selected) {
    const slug = file.replace(/\.sources\.yaml$/, "");
    const yaml = await readFile(path.join(dir, file), "utf8");
    const entries = extractUrls(yaml);
    for (const entry of entries) {
      if (typeof entry === "string") {
        results.push({ slug, type: "remote", ...(await checkUrl(entry)) });
      } else if (entry.archive) {
        results.push({ slug, type: "archive", ...(await checkArchive(entry.archive)) });
      }
    }
  }

  const bad = results.filter(r => !r.ok);
  console.log(JSON.stringify({ manifests: selected.length, checked: results.length, bad: bad.length, results }, null, 2));
  process.exit(bad.length ? 1 : 0);
}

main();
