/**
 * scripts/notion-to-md.ts
 *
 * 공통 Notion → Markdown 변환 유틸리티.
 * GitHub Actions 및 deploy-from-notion 스킬에서 공용으로 사용.
 *
 * 사용법:
 *   npx tsx scripts/notion-to-md.ts --page-id <NOTION_PAGE_ID> --slug <slug> [--validate]
 *   npx tsx scripts/notion-to-md.ts --test <ko-md-file>
 */

import { Client } from "@notionhq/client";
import type {
  BlockObjectResponse,
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import * as fs from "fs";
import * as path from "path";

// ── 환경변수 ──────────────────────────────────────────────────────────
const NOTION_TOKEN = process.env.NOTION_TOKEN || "";
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || "";
const BLOG_ROOT = path.resolve(process.cwd(), "scripts", "../");
const STAGE_DIR = path.join(BLOG_ROOT, ".blog-agent-stage");
const PAGE_MAP_PATH = path.join(BLOG_ROOT, "scripts/notion-page-map.json");

// ── Notion 클라이언트 ─────────────────────────────────────────────────
function getNotionClient(): Client {
  if (!NOTION_TOKEN) {
    throw new Error("NOTION_TOKEN 환경변수가 설정되지 않았습니다.");
  }
  return new Client({ auth: NOTION_TOKEN });
}

// ── Page Map 로드/저장 ────────────────────────────────────────────────
export type PageMap = Record<string, string>; // slug → notionPageId

export function loadPageMap(): PageMap {
  if (!fs.existsSync(PAGE_MAP_PATH)) return {};
  return JSON.parse(fs.readFileSync(PAGE_MAP_PATH, "utf-8"));
}

export function savePageMap(map: PageMap): void {
  fs.writeFileSync(PAGE_MAP_PATH, JSON.stringify(map, null, 2) + "\n", "utf-8");
}

// ── Rich Text → 평문 변환 ─────────────────────────────────────────────
function richTextToMd(items: RichTextItemResponse[]): string {
  return items
    .map((item) => {
      let text = item.plain_text;
      if (item.annotations.bold) text = `**${text}**`;
      if (item.annotations.italic) text = `*${text}*`;
      if (item.annotations.code) text = `\`${text}\``;
      if (item.annotations.strikethrough) text = `~~${text}~~`;
      if ("href" in item && item.href) text = `[${text}](${item.href})`;
      return text;
    })
    .join("");
}

// ── 블록 → Markdown 변환 ─────────────────────────────────────────────
export async function blocksToMarkdown(
  notion: Client,
  blockId: string,
  depth = 0
): Promise<string> {
  const indent = "  ".repeat(depth);
  const lines: string[] = [];

  let cursor: string | undefined;
  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    for (const block of response.results as BlockObjectResponse[]) {
      const md = await blockToMarkdown(notion, block, depth);
      if (md !== null) lines.push(md);
    }

    cursor = response.next_cursor ?? undefined;
  } while (cursor);

  return lines.join("\n");
}

async function blockToMarkdown(
  notion: Client,
  block: BlockObjectResponse,
  depth: number
): Promise<string | null> {
  const indent = "  ".repeat(depth);

  switch (block.type) {
    case "heading_1":
      return `# ${richTextToMd(block.heading_1.rich_text)}`;

    case "heading_2":
      return `## ${richTextToMd(block.heading_2.rich_text)}`;

    case "heading_3":
      return `### ${richTextToMd(block.heading_3.rich_text)}`;

    case "paragraph": {
      const text = richTextToMd(block.paragraph.rich_text);
      if (!text.trim()) return "";
      // 자식 블록이 있으면 재귀
      if (block.has_children) {
        const children = await blocksToMarkdown(notion, block.id, depth);
        return `${text}\n${children}`;
      }
      return text;
    }

    case "bulleted_list_item": {
      const text = richTextToMd(block.bulleted_list_item.rich_text);
      const prefix = `${indent}- ${text}`;
      if (block.has_children) {
        const children = await blocksToMarkdown(notion, block.id, depth + 1);
        return `${prefix}\n${children}`;
      }
      return prefix;
    }

    case "numbered_list_item": {
      const text = richTextToMd(block.numbered_list_item.rich_text);
      const prefix = `${indent}1. ${text}`;
      if (block.has_children) {
        const children = await blocksToMarkdown(notion, block.id, depth + 1);
        return `${prefix}\n${children}`;
      }
      return prefix;
    }

    case "quote":
      return `> ${richTextToMd(block.quote.rich_text)}`;

    case "code": {
      const lang = block.code.language || "";
      const code = richTextToMd(block.code.rich_text);
      return `\`\`\`${lang}\n${code}\n\`\`\``;
    }

    case "divider":
      return "\n---";

    case "image": {
      const imageBlock = block.image;
      let url =
        imageBlock.type === "external"
          ? imageBlock.external.url
          : imageBlock.file.url; // Notion S3 presigned URL

      const caption =
        imageBlock.caption?.length > 0
          ? richTextToMd(imageBlock.caption)
          : "image";

      return `![${caption}](${url})`;
    }

    case "callout": {
      const emoji =
        block.callout.icon?.type === "emoji" ? block.callout.icon.emoji : "💡";
      const text = richTextToMd(block.callout.rich_text);
      return `> ${emoji} ${text}`;
    }

    case "toggle": {
      const text = richTextToMd(block.toggle.rich_text);
      if (block.has_children) {
        const children = await blocksToMarkdown(notion, block.id, depth + 1);
        return `<details>\n<summary>${text}</summary>\n\n${children}\n</details>`;
      }
      return `<details>\n<summary>${text}</summary>\n</details>`;
    }

    case "table": {
      // 테이블은 자식 블록(table_row)을 직접 fetch
      if (!block.has_children) return null;
      const rows = await notion.blocks.children.list({ block_id: block.id });
      const mdRows: string[] = [];
      let isFirst = true;
      for (const row of rows.results as BlockObjectResponse[]) {
        if (row.type !== "table_row") continue;
        const cells = row.table_row.cells
          .map((cell) => richTextToMd(cell))
          .join(" | ");
        mdRows.push(`| ${cells} |`);
        if (isFirst) {
          const separator = row.table_row.cells
            .map(() => "---")
            .join(" | ");
          mdRows.push(`| ${separator} |`);
          isFirst = false;
        }
      }
      return mdRows.join("\n");
    }

    default:
      // 지원하지 않는 블록 타입은 무시
      return null;
  }
}

// ── Notion Properties → Frontmatter ──────────────────────────────────
export interface NotionProperties {
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  voiceRewriteSkip: boolean;
  pubDatetime?: string;
  modDatetime?: string;
  featured?: boolean;
  draft?: boolean;
  ogImage?: string;
  sources?: string[];
}

export function extractProperties(page: PageObjectResponse): NotionProperties {
  const props = page.properties;

  const getTitle = (key: string): string => {
    const prop = props[key];
    if (prop?.type === "title") return richTextToMd(prop.title);
    return "";
  };

  const getText = (key: string): string => {
    const prop = props[key];
    if (prop?.type === "rich_text") return richTextToMd(prop.rich_text);
    return "";
  };

  const getSelect = (key: string): string => {
    const prop = props[key];
    if (prop?.type === "select") return prop.select?.name ?? "";
    return "";
  };

  const getMultiSelect = (key: string): string[] => {
    const prop = props[key];
    if (prop?.type === "multi_select") return prop.multi_select.map((s) => s.name);
    return [];
  };

  const getCheckbox = (key: string): boolean => {
    const prop = props[key];
    if (prop?.type === "checkbox") return prop.checkbox;
    return false;
  };

  const getDate = (key: string): string | undefined => {
    const prop = props[key];
    if (prop?.type === "date" && prop.date) return prop.date.start;
    return undefined;
  };

  const getUrl = (key: string): string | undefined => {
    const prop = props[key];
    if (prop?.type === "url" && prop.url) return prop.url;
    return undefined;
  };

  // sources: Text property (URL 1개/줄, 줄바꿈 파싱)
  const sourcesRaw = getText("sources");
  const sources = sourcesRaw
    ? sourcesRaw
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.startsWith("http"))
    : [];

  // cover image 추출 (Notion 기본 커버 이미지)
  let coverUrl: string | undefined = undefined;
  if (page.cover) {
    if (page.cover.type === "external") coverUrl = page.cover.external.url;
    else if (page.cover.type === "file") coverUrl = page.cover.file.url;
  }

  return {
    title: getTitle("title") || getTitle("Name"),
    slug: getText("slug"),
    description: getText("description"),
    category: getSelect("category"),
    tags: getMultiSelect("tags"),
    voiceRewriteSkip: getCheckbox("voiceRewriteSkip"),
    pubDatetime: getDate("pubDatetime") || new Date().toISOString(),
    modDatetime: getDate("modDatetime"),
    featured: getCheckbox("featured"),
    draft: getCheckbox("draft"),
    ogImage: getUrl("ogImage") || coverUrl,
    sources,
  };
}

// ── Frontmatter YAML 생성 ─────────────────────────────────────────────
export function buildFrontmatter(props: NotionProperties): string {
  const lines = [
    "---",
    `title: "${props.title.replace(/"/g, '\\"')}"`,
    `description: "${props.description.replace(/"/g, '\\"')}"`,
    `pubDatetime: ${props.pubDatetime}`,
  ];

  if (props.modDatetime) lines.push(`modDatetime: ${props.modDatetime}`);
  lines.push(`author: GSF`);
  lines.push(`draft: ${props.draft ?? false}`);
  lines.push(`lang: ko`);
  lines.push(`aiModel: "Gemini 3.1 Pro"`);
  if (props.category) lines.push(`category: ${props.category}`);
  if (props.featured) lines.push(`featured: true`);
  if (props.ogImage) lines.push(`ogImage: "${props.ogImage}"`);

  if (props.tags.length > 0) {
    lines.push("tags:");
    props.tags.forEach((tag) => lines.push(`  - "${tag}"`));
  } else {
    lines.push('tags:\n  - "others"');
  }

  if (props.sources.length > 0) {
    lines.push("sources:");
    props.sources.forEach((url) => lines.push(`  - "${url}"`));
  }

  lines.push("---");
  return lines.join("\n");
}

// ── Notion S3 presigned URL 감지 ──────────────────────────────────────
export function extractNotionImageUrls(markdown: string): string[] {
  const regex = /!\[[^\]]*\]\((https:\/\/prod-files-secure\.s3[^)]+)\)/g;
  const urls: string[] = [];
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    urls.push(match[1]);
  }
  return regex.exec ? urls : urls; // ESLint workaround
}

// ── 메인: Notion 페이지 → KO .md 파일 생성 ───────────────────────────
export async function notionPageToMarkdown(
  pageId: string,
  slug: string,
  outputPath?: string
): Promise<{ markdown: string; properties: NotionProperties }> {
  const notion = getNotionClient();

  // 1. 페이지 properties 취득
  const page = await notion.pages.retrieve({ page_id: pageId }) as PageObjectResponse;
  const properties = extractProperties(page);

  // 2. 블록 트리 → Markdown 변환
  let body = await blocksToMarkdown(notion, pageId);

  // Ensure horizontal rules always have a blank line before them to avoid being parsed as headings
  body = body.replace(/([^\n])\n---(\n|$)/g, '$1\n\n---$2');

  // 3. Frontmatter 생성
  const frontmatter = buildFrontmatter({
    ...properties,
    slug,
  });

  const markdown = `${frontmatter}\n\n${body}\n`;

  // 4. 파일 저장 (outputPath 지정 시)
  if (outputPath) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, markdown, "utf-8");
    console.log(`✅ 저장됨: ${outputPath}`);
  }

  return { markdown, properties };
}

// ── CLI 진입점 ────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const getArg = (flag: string) => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };

  const pageId = getArg("--page-id");
  const slug = getArg("--slug");
  const validate = args.includes("--validate");
  const testFile = getArg("--test");

  if (testFile) {
    // --test 모드: 기존 KO .md 파일 Zod 검증만 수행
    console.log(`🔍 Zod 검증 테스트: ${testFile}`);
    const content = fs.readFileSync(testFile, "utf-8");
    console.log("파일 내용 (첫 20줄):");
    console.log(content.split("\n").slice(0, 20).join("\n"));
    console.log("\n✅ 파일 읽기 성공 (Astro build에서 Zod 검증됩니다)");
    return;
  }

  if (!pageId || !slug) {
    console.error("사용법: npx tsx scripts/notion-to-md.ts --page-id <ID> --slug <slug> [--validate]");
    process.exit(1);
  }

  const outputPath = path.join(STAGE_DIR, `${slug}.ko.md`);

  try {
    const { properties } = await notionPageToMarkdown(pageId, slug, outputPath);
    console.log(`📄 slug: ${properties.slug}`);
    console.log(`📝 voiceRewriteSkip: ${properties.voiceRewriteSkip}`);

    if (validate) {
      console.log("\n🔍 Zod 검증 (Astro build 통해 수행)...");
      console.log("→ npx astro check 명령으로 검증하세요.");
    }
  } catch (err) {
    console.error("❌ 변환 실패:", err);
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].includes("notion-to-md.ts")) {
  main().catch(console.error);
}
