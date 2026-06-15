/**
 * scripts/notion-bootstrap.ts
 *
 * 기존 GSF-Blog KO 포스트 38개를 Notion DB에 일괄 등록하는 1회성 스크립트.
 * 실행 후 scripts/notion-page-map.json 에 { slug: notionPageId } 매핑 저장.
 *
 * 사용법:
 *   # 드라이런 (Notion API 호출 없이 변환 결과만 확인)
 *   npx tsx scripts/notion-bootstrap.ts --dry-run
 *
 *   # 실제 등록
 *   npx tsx scripts/notion-bootstrap.ts
 *
 *   # 특정 slug만 등록
 *   npx tsx scripts/notion-bootstrap.ts --slug nihonbashi-the-origin-of-japan
 */

import "dotenv/config";
import { Client } from "@notionhq/client";
import type { CreatePageParameters } from "@notionhq/client/build/src/api-endpoints";
import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";
import { loadPageMap, savePageMap, type PageMap } from "./notion-to-md";

// ── 환경변수 ──────────────────────────────────────────────────────────
const NOTION_TOKEN = process.env.NOTION_TOKEN || "";
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || "";
const BLOG_KO_DIR = path.resolve(process.cwd(), "scripts", "../src/data/blog/ko");
const DRY_RUN = process.argv.includes("--dry-run");
const SLUG_FILTER = (() => {
  const idx = process.argv.indexOf("--slug");
  return idx !== -1 ? process.argv[idx + 1] : undefined;
})();

// Rate limit: 3 req/sec
const RATE_LIMIT_MS = 350;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── 메인 ──────────────────────────────────────────────────────────────
async function main() {
  if (!DRY_RUN && !NOTION_TOKEN) {
    console.error("❌ NOTION_TOKEN 환경변수가 없습니다. --dry-run으로 먼저 테스트하세요.");
    process.exit(1);
  }
  if (!DRY_RUN && !NOTION_DATABASE_ID) {
    console.error("❌ NOTION_DATABASE_ID 환경변수가 없습니다.");
    process.exit(1);
  }

  const notion = DRY_RUN ? null : new Client({ auth: NOTION_TOKEN });
  const pageMap: PageMap = loadPageMap();

  // KO 포스트 파일 목록
  const files = fs
    .readdirSync(BLOG_KO_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .filter((f) => !SLUG_FILTER || f.replace(/\.mdx?$/, "") === SLUG_FILTER)
    .sort();

  console.log(`📋 대상 포스트: ${files.length}개${DRY_RUN ? " [DRY-RUN]" : ""}`);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    const slug = file.replace(/\.mdx?$/, "");
    const filePath = path.join(BLOG_KO_DIR, file);

    // 이미 등록된 slug는 스킵
    if (pageMap[slug]) {
      console.log(`⏭️  스킵 (이미 등록됨): ${slug}`);
      skipped++;
      continue;
    }

    // frontmatter 파싱
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data: fm, content } = matter(raw);

    if (DRY_RUN) {
      console.log(`✅ [DRY] ${slug} → title: "${fm.title}", tags: ${JSON.stringify(fm.tags ?? [])}`);
      success++;
      continue;
    }

    // Notion 페이지 생성
    try {
      const pageParams: CreatePageParameters = {
        parent: { database_id: NOTION_DATABASE_ID },
        properties: buildNotionProperties(slug, fm),
        children: markdownToNotionBlocks(content),
      };

      const page = await notion!.pages.create(pageParams);
      pageMap[slug] = page.id;
      savePageMap(pageMap); // 매 성공마다 저장 (중간 실패 대비)

      console.log(`✅ 등록됨: ${slug} → ${page.id}`);
      success++;

      await sleep(RATE_LIMIT_MS);
    } catch (err: any) {
      console.error(`❌ 실패: ${slug} — ${err.message}`);
      failed++;
      await sleep(RATE_LIMIT_MS);
    }
  }

  console.log(`\n📊 결과: 성공 ${success} / 스킵 ${skipped} / 실패 ${failed}`);
  if (!DRY_RUN) {
    console.log(`📄 Page Map 저장됨: scripts/notion-page-map.json`);
  }
}

// ── frontmatter → Notion Properties 변환 ─────────────────────────────
function buildNotionProperties(slug: string, fm: Record<string, any>): CreatePageParameters["properties"] {
  const props: CreatePageParameters["properties"] = {
    // Title (Name)
    title: {
      title: [{ type: "text", text: { content: fm.title || slug } }],
    },
    // Slug
    slug: {
      rich_text: [{ type: "text", text: { content: slug } }],
    },
    // Description
    description: {
      rich_text: [{ type: "text", text: { content: fm.description || "" } }],
    },
    // Status: 기존 포스트는 "발행완료"로 초기화
    status: {
      select: { name: "발행완료" },
    },
    // voiceRewriteSkip: 기존 포스트는 이미 발행됐으므로 true
    voiceRewriteSkip: {
      checkbox: true,
    },
    // lang
    lang: {
      select: { name: "ko" },
    },
    // translationStatus
    translationStatus: {
      select: { name: "completed" },
    },
  };

  // Category (optional)
  if (fm.category) {
    (props as any).category = { select: { name: fm.category } };
  }

  // Tags
  if (Array.isArray(fm.tags) && fm.tags.length > 0) {
    (props as any).tags = {
      multi_select: fm.tags.map((t: string) => ({ name: t })),
    };
  }

  // pubDatetime
  if (fm.pubDatetime) {
    (props as any).pubDatetime = {
      date: { start: new Date(fm.pubDatetime).toISOString() },
    };
  }

  // modDatetime
  if (fm.modDatetime) {
    (props as any).modDatetime = {
      date: { start: new Date(fm.modDatetime).toISOString() },
    };
  }

  // ogImage
  if (fm.ogImage && typeof fm.ogImage === "string" && fm.ogImage.startsWith("http")) {
    (props as any).ogImage = { url: fm.ogImage };
  }

  // sources: URL 배열 → 줄바꿈으로 합쳐서 Text property에 저장
  if (Array.isArray(fm.sources) && fm.sources.length > 0) {
    (props as any).sources = {
      rich_text: [{ type: "text", text: { content: fm.sources.join("\n") } }],
    };
  }

  // featured
  if (fm.featured) {
    (props as any).featured = { checkbox: true };
  }

  // draft
  if (fm.draft !== undefined) {
    (props as any).draft = { checkbox: Boolean(fm.draft) };
  }

  return props;
}

// ── Markdown 본문 → Notion 블록 (간략화 버전) ─────────────────────────
// 부트스트랩 목적: 기존 KO 포스트 본문을 Notion에 삽입.
// 복잡한 MD 파싱보다 단순한 단락 분리로 처리.
function markdownToNotionBlocks(content: string): CreatePageParameters["children"] {
  const lines = content
    .replace(/\r\n/g, "\n")
    .split("\n\n") // 빈 줄 기준 단락 분리
    .map((p) => p.trim())
    .filter(Boolean);

  const blocks: CreatePageParameters["children"] = [];

  for (const para of lines) {
    const firstLine = para.split("\n")[0];

    // 코드 블록
    if (firstLine.startsWith("```")) {
      const langMatch = firstLine.match(/^```(\w*)/);
      const lang = langMatch?.[1] || "plain text";
      const codeContent = para.replace(/^```\w*\n?/, "").replace(/```$/, "").trim();
      blocks.push({
        type: "code",
        code: {
          language: lang as any,
          rich_text: [{ type: "text", text: { content: codeContent.slice(0, 2000) } }],
        },
      });
      continue;
    }

    // 제목
    if (firstLine.startsWith("### ")) {
      blocks.push({
        type: "heading_3",
        heading_3: { rich_text: [{ type: "text", text: { content: firstLine.slice(4) } }] },
      });
      continue;
    }
    if (firstLine.startsWith("## ")) {
      blocks.push({
        type: "heading_2",
        heading_2: { rich_text: [{ type: "text", text: { content: firstLine.slice(3) } }] },
      });
      continue;
    }
    if (firstLine.startsWith("# ")) {
      blocks.push({
        type: "heading_1",
        heading_1: { rich_text: [{ type: "text", text: { content: firstLine.slice(2) } }] },
      });
      continue;
    }

    // 인용
    if (firstLine.startsWith("> ")) {
      blocks.push({
        type: "quote",
        quote: { rich_text: [{ type: "text", text: { content: para.replace(/^> /gm, "") } }] },
      });
      continue;
    }

    // 이미지
    const imgMatch = para.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      const url = imgMatch[2];
      if (!url.startsWith("http")) {
        blocks.push({
          type: "paragraph",
          paragraph: { rich_text: [{ type: "text", text: { content: para } }] },
        });
      } else {
        blocks.push({
          type: "image",
          image: { type: "external", external: { url } },
        });
      }
      continue;
    }

    // 불릿 리스트
    if (firstLine.startsWith("- ") || firstLine.startsWith("* ")) {
      const items = para.split("\n").filter((l) => l.match(/^[-*] /));
      for (const item of items) {
        blocks.push({
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: item.replace(/^[-*] /, "") } }],
          },
        });
      }
      continue;
    }

    // 구분선
    if (firstLine.match(/^---+$/)) {
      blocks.push({ type: "divider", divider: {} });
      continue;
    }

    // 일반 단락 (2000자 제한)
    const text = para.slice(0, 2000);
    if (text) {
      blocks.push({
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: text } }] },
      });
    }
  }

  // Notion API: 한 번에 최대 100 블록
  return blocks.slice(0, 100);
}

main().catch((err) => {
  console.error("❌ 치명적 오류:", err);
  process.exit(1);
});
