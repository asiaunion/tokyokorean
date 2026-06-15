import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export interface PublishDraftInput {
  slug: string;
  ko: string;
  en: string;
  ja: string;
}

export interface PublishPlan {
  slug: string;
  targets: Record<"ko" | "en" | "ja", string>;
  dryRunDiff: string;
}

const BLOG_ROOT = path.resolve(process.cwd(), "src/data/blog");

function blogPath(locale: "ko" | "en" | "ja", slug: string) {
  return path.join(BLOG_ROOT, locale, `${slug}.md`);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ぁ-んァ-ン一-龥\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function fileExists(filePath: string) {
  try {
    await readFile(filePath, "utf8");
    return true;
  } catch {
    return false;
  }
}

export async function ensureUniqueSlug(baseSlug: string) {
  let slug = slugify(baseSlug) || `post-${Date.now()}`;
  let suffix = 1;
  while (
    (await fileExists(blogPath("ko", slug))) ||
    (await fileExists(blogPath("en", slug))) ||
    (await fileExists(blogPath("ja", slug)))
  ) {
    slug = `${slugify(baseSlug)}-${suffix++}`;
  }
  return slug;
}

export async function preparePublishPlan(input: PublishDraftInput): Promise<PublishPlan> {
  const targets = {
    ko: blogPath("ko", input.slug),
    en: blogPath("en", input.slug),
    ja: blogPath("ja", input.slug),
  };
  const preview = [
    `+ ${targets.ko}`,
    `+ ${targets.en}`,
    `+ ${targets.ja}`,
    "",
    "KO preview:",
    input.ko.slice(0, 380),
    "",
    "EN preview:",
    input.en.slice(0, 280),
    "",
    "JA preview:",
    input.ja.slice(0, 280),
  ].join("\n");
  return { slug: input.slug, targets, dryRunDiff: preview };
}

export async function applyPublishPlan(input: PublishDraftInput) {
  const targets = {
    ko: blogPath("ko", input.slug),
    en: blogPath("en", input.slug),
    ja: blogPath("ja", input.slug),
  };
  const stageDir = path.resolve(process.cwd(), ".blog-agent-stage", input.slug);
  await mkdir(stageDir, { recursive: true });
  const staged = {
    ko: path.join(stageDir, "ko.md"),
    en: path.join(stageDir, "en.md"),
    ja: path.join(stageDir, "ja.md"),
  };
  await writeFile(staged.ko, input.ko, "utf8");
  await writeFile(staged.en, input.en, "utf8");
  await writeFile(staged.ja, input.ja, "utf8");
  try {
    await mkdir(path.dirname(targets.ko), { recursive: true });
    await mkdir(path.dirname(targets.en), { recursive: true });
    await mkdir(path.dirname(targets.ja), { recursive: true });
    await rename(staged.ko, targets.ko);
    await rename(staged.en, targets.en);
    await rename(staged.ja, targets.ja);
    await rm(stageDir, { recursive: true, force: true });
    return targets;
  } catch (error) {
    await rm(stageDir, { recursive: true, force: true });
    throw error;
  }
}
