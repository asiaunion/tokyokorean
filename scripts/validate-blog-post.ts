/**
 * Pre-publish validation for Cursor workflow (same gates as apply_publish).
 *
 * Usage:
 *   pnpm validate:post <slug>
 *   pnpm validate:post --stage <slug>
 *   pnpm validate:post --ko path --en path --ja path
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { runBlogValidation } from "../src/lib/validation/validationGates.ts";

const root = process.cwd();
const blogRoot = path.join(root, "src/data/blog");

async function readOptional(filePath: string) {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

function parseArgs(argv: string[]) {
  const args = argv.slice(2);
  let slug = "";
  let stage = false;
  let koPath = "";
  let enPath = "";
  let jaPath = "";

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--stage") {
      stage = true;
      slug = args[++i] ?? "";
      continue;
    }
    if (arg === "--ko") {
      koPath = args[++i] ?? "";
      continue;
    }
    if (arg === "--en") {
      enPath = args[++i] ?? "";
      continue;
    }
    if (arg === "--ja") {
      jaPath = args[++i] ?? "";
      continue;
    }
    if (!arg.startsWith("-") && !slug) {
      slug = arg;
    }
  }

  return { slug, stage, koPath, enPath, jaPath };
}

async function loadBySlug(slug: string, stage: boolean) {
  const base = stage
    ? path.join(root, ".blog-agent-stage", slug)
    : blogRoot;
  const ko = await readOptional(
    stage ? path.join(base, "ko.md") : path.join(base, "ko", `${slug}.md`)
  );
  const en = await readOptional(
    stage ? path.join(base, "en.md") : path.join(base, "en", `${slug}.md`)
  );
  const ja = await readOptional(
    stage ? path.join(base, "ja.md") : path.join(base, "ja", `${slug}.md`)
  );
  return { ko, en, ja };
}

function printResult(result: Awaited<ReturnType<typeof runBlogValidation>>) {
  const failed = result.checks.filter(c => !c.ok);
  console.log(
    JSON.stringify(
      {
        ok: result.ok,
        hardGatePassed: result.hardGatePassed,
        scorePassed: result.scorePassed,
        score: result.score,
        minimumScore: result.minimumScore,
        failed: failed.map(f => ({ name: f.name, output: f.output })),
      },
      null,
      2
    )
  );
}

async function main() {
  const { slug, stage, koPath, enPath, jaPath } = parseArgs(process.argv);

  let ko: string | null;
  let en: string | null;
  let ja: string | null;

  if (koPath || enPath || jaPath) {
    ko = koPath ? await readOptional(path.resolve(koPath)) : "";
    en = enPath ? await readOptional(path.resolve(enPath)) : "";
    ja = jaPath ? await readOptional(path.resolve(jaPath)) : "";
  } else if (slug) {
    ({ ko, en, ja } = await loadBySlug(slug, stage));
  } else {
    console.error(
      "Usage: pnpm validate:post <slug> | --stage <slug> | --ko <p> --en <p> --ja <p>"
    );
    process.exit(2);
  }

  if (!ko?.trim()) {
    console.error("KO markdown missing or empty.");
    process.exit(2);
  }

  const candidates = [ko, en ?? "", ja ?? ""];
  const result = await runBlogValidation(root, candidates, slug ? { slug } : undefined);
  printResult(result);
  process.exit(result.ok ? 0 : 1);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(2);
});
