/**
 * scripts/sync-git-to-notion.ts
 *
 * Git main branch → Notion 역동기화 스크립트.
 * main에 KO .md 파일이 변경될 때 Notion 페이지를 업데이트한다.
 *
 * SHA Conflict Detection:
 *   Notion gitSha property가 현재 commit의 ancestor인지 확인.
 *   불일치 시 즉시 중단 + Notion 코멘트 알림.
 *
 * 사용법:
 *   # GitHub Actions에서 실행
 *   GITHUB_SHA=<sha> GITHUB_BEFORE=<before_sha> npx tsx scripts/sync-git-to-notion.ts
 *
 *   # 충돌 시나리오 테스트
 *   npx tsx scripts/sync-git-to-notion.ts --test-conflict
 *
 *   # 특정 slug만 동기화
 *   npx tsx scripts/sync-git-to-notion.ts --slug <slug>
 */

import { Client } from "@notionhq/client";
import type { PageObjectResponse, BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";
import {
  loadPageMap,
  savePageMap,
  blocksToMarkdown,
  buildFrontmatter,
} from "./notion-to-md";

// ── 환경변수 ──────────────────────────────────────────────────────────
const NOTION_TOKEN = process.env.NOTION_TOKEN || "";
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || "";
const CURRENT_SHA = process.env.GITHUB_SHA || "";
const BEFORE_SHA = process.env.GITHUB_BEFORE || ""; // push 이전 SHA
const BLOG_KO_DIR = path.resolve(process.cwd(), "scripts", "../src/data/blog/ko");

const TEST_CONFLICT = process.argv.includes("--test-conflict");
const SLUG_FILTER = (() => {
  const idx = process.argv.indexOf("--slug");
  return idx !== -1 ? process.argv[idx + 1] : undefined;
})();

// ── Notion 클라이언트 ─────────────────────────────────────────────────
function getNotionClient(): Client {
  if (!NOTION_TOKEN) throw new Error("NOTION_TOKEN 미설정");
  return new Client({ auth: NOTION_TOKEN });
}

// ── SHA Conflict Detection ────────────────────────────────────────────
/**
 * notionSha가 currentSha의 ancestor인지 확인.
 * ancestor이면 충돌 없음 (정상 업데이트).
 * ancestor가 아니면 충돌 (Notion과 Git이 독립적으로 분기됨).
 */
function isAncestor(ancestorSha: string, descendantSha: string): boolean {
  if (!ancestorSha || ancestorSha === "") return true; // Notion에 SHA 없음 → 신규 등록 취급

  try {
    // git merge-base --is-ancestor: 성공(0) = ancestor, 실패(1) = not ancestor
    execSync(`git merge-base --is-ancestor ${ancestorSha} ${descendantSha}`, {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

// ── 변경된 KO 파일 목록 취득 ─────────────────────────────────────────
function getChangedKoFiles(): string[] {
  if (SLUG_FILTER) {
    const filePath = path.join(BLOG_KO_DIR, `${SLUG_FILTER}.md`);
    return fs.existsSync(filePath) ? [filePath] : [];
  }

  if (TEST_CONFLICT) {
    // 테스트용: 첫 번째 KO 파일 반환
    const files = fs.readdirSync(BLOG_KO_DIR).filter((f) => f.endsWith(".md"));
    return files.length > 0 ? [path.join(BLOG_KO_DIR, files[0])] : [];
  }

  if (!BEFORE_SHA || !CURRENT_SHA) {
    console.error("GITHUB_SHA 또는 GITHUB_BEFORE가 설정되지 않았습니다.");
    return [];
  }

  try {
    const diff = execSync(
      `git diff --name-only ${BEFORE_SHA} ${CURRENT_SHA} -- src/data/blog/ko/`,
      { encoding: "utf-8" }
    )
      .trim()
      .split("\n")
      .filter(Boolean)
      .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
      .map((f) => path.resolve(process.cwd(), "scripts", "../", f));

    return diff;
  } catch (err) {
    console.error("git diff 실패:", err);
    return [];
  }
}

// ── Notion 페이지 현재 gitSha 취득 ───────────────────────────────────
async function getNotionGitSha(
  notion: Client,
  pageId: string
): Promise<string> {
  try {
    const page = (await notion.pages.retrieve({ page_id: pageId })) as PageObjectResponse;
    const gitShaProp = page.properties?.gitSha;
    if (gitShaProp?.type === "rich_text") {
      return gitShaProp.rich_text?.[0]?.plain_text || "";
    }
    return "";
  } catch {
    return "";
  }
}

// ── Notion 페이지 코멘트 작성 ────────────────────────────────────────
async function addComment(notion: Client, pageId: string, message: string): Promise<void> {
  try {
    await notion.comments.create({
      parent: { page_id: pageId },
      rich_text: [{ type: "text", text: { content: message } }],
    });
  } catch (err) {
    console.error(`코멘트 작성 실패 (${pageId}):`, err);
  }
}

// ── Notion 페이지 블록 전체 교체 ─────────────────────────────────────
async function replacePageBlocks(
  notion: Client,
  pageId: string,
  newMarkdown: string
): Promise<void> {
  // 1. 기존 블록 전체 삭제
  let cursor: string | undefined;
  do {
    const children = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    for (const block of children.results as BlockObjectResponse[]) {
      await notion.blocks.delete({ block_id: block.id });
    }

    cursor = children.next_cursor ?? undefined;
  } while (cursor);

  // 2. 신규 블록 삽입 (100개 제한 준수)
  const newBlocks = markdownToNotionBlocks(newMarkdown);
  if (newBlocks.length > 0) {
    // 100개씩 분할 업로드
    for (let i = 0; i < newBlocks.length; i += 100) {
      await notion.blocks.children.append({
        block_id: pageId,
        children: newBlocks.slice(i, i + 100) as any,
      });
    }
  }
}

// ── Notion Properties 업데이트 ────────────────────────────────────────
async function updateNotionProperties(
  notion: Client,
  pageId: string,
  fm: Record<string, any>,
  currentSha: string
): Promise<void> {
  const props: Record<string, any> = {
    // gitSha 갱신
    gitSha: {
      rich_text: [{ type: "text", text: { content: currentSha } }],
    },
    // translationStatus
    translationStatus: {
      select: { name: "completed" },
    },
  };

  // title
  if (fm.title) {
    props["title"] = {
      title: [{ type: "text", text: { content: fm.title } }],
    };
  }

  // description
  if (fm.description) {
    props["description"] = {
      rich_text: [{ type: "text", text: { content: fm.description } }],
    };
  }

  // tags
  if (Array.isArray(fm.tags) && fm.tags.length > 0) {
    props["tags"] = {
      multi_select: fm.tags.map((t: string) => ({ name: t })),
    };
  }

  // category
  if (fm.category) {
    props["category"] = { select: { name: fm.category } };
  }

  await notion.pages.update({
    page_id: pageId,
    properties: props,
  });
}

// ── 신규 포스트: Notion 페이지 생성 + Page Map 업데이트 ───────────────
async function createNewNotionPage(
  notion: Client,
  slug: string,
  fm: Record<string, any>,
  body: string,
  currentSha: string
): Promise<string> {
  const pageMap = loadPageMap();

  const page = await notion.pages.create({
    parent: { database_id: NOTION_DATABASE_ID },
    properties: {
      title: { title: [{ type: "text", text: { content: fm.title || slug } }] },
      slug: { rich_text: [{ type: "text", text: { content: slug } }] },
      description: { rich_text: [{ type: "text", text: { content: fm.description || "" } }] },
      status: { select: { name: "발행완료" } },
      gitSha: { rich_text: [{ type: "text", text: { content: currentSha } }] },
      translationStatus: { select: { name: "completed" } },
      voiceRewriteSkip: { checkbox: true },
      lang: { select: { name: "ko" } },
    } as any,
    children: markdownToNotionBlocks(body) as any,
  });

  pageMap[slug] = page.id;
  savePageMap(pageMap);
  console.log(`✅ 신규 Notion 페이지 생성됨: ${slug} → ${page.id}`);

  return page.id;
}

// ── 메인 처리 ────────────────────────────────────────────────────────
async function main() {
  if (!NOTION_TOKEN) {
    console.error("❌ NOTION_TOKEN 미설정");
    process.exit(1);
  }

  const notion = getNotionClient();
  const pageMap = loadPageMap();
  const changedFiles = getChangedKoFiles();

  if (changedFiles.length === 0) {
    console.log("ℹ️ 변경된 KO 파일 없음 — 역동기화 스킵");
    return;
  }

  console.log(`📋 역동기화 대상: ${changedFiles.length}개 파일`);

  let success = 0;
  let conflict = 0;
  let created = 0;
  let failed = 0;

  for (const filePath of changedFiles) {
    const filename = path.basename(filePath);
    const slug = filename.replace(/\.mdx?$/, "");

    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data: fm, content: body } = matter(raw);

      // Page Map 조회
      const pageId = pageMap[slug];

      if (!pageId) {
        // 신규 포스트: Notion 페이지 생성
        console.log(`🆕 신규 포스트 감지: ${slug} → Notion 페이지 생성`);
        await createNewNotionPage(notion, slug, fm, body, CURRENT_SHA);
        created++;
        continue;
      }

      // ── SHA Conflict Detection ─────────────────────────────────────
      const notionGitSha = TEST_CONFLICT
        ? "0000000000000000000000000000000000000000" // 테스트용 가짜 SHA
        : await getNotionGitSha(notion, pageId);

      if (!isAncestor(notionGitSha, CURRENT_SHA)) {
        console.error(`⚠️ SHA 충돌 감지: ${slug}`);
        console.error(`  Notion gitSha: ${notionGitSha}`);
        console.error(`  Current SHA:   ${CURRENT_SHA}`);

        await addComment(
          notion,
          pageId,
          `⚠️ 충돌 감지: Notion의 마지막 동기화 SHA와 Git commit이 불일치합니다.\n\n` +
            `Notion gitSha: ${notionGitSha || "(없음)"}\n` +
            `Git commit: ${CURRENT_SHA}\n\n` +
            `두 버전을 수동으로 비교하고 최신 내용을 선택하세요.\n` +
            `해결 후 gitSha property를 현재 SHA(${CURRENT_SHA})로 수동 업데이트하세요.`
        );

        conflict++;
        continue; // 다음 파일로 (abort 아님 — 다른 파일은 계속 처리)
      }

      // ── 정상 역동기화 ─────────────────────────────────────────────
      console.log(`🔄 역동기화: ${slug}`);

      // 블록 전체 교체
      await replacePageBlocks(notion, pageId, body);

      // Properties 업데이트
      await updateNotionProperties(notion, pageId, fm, CURRENT_SHA);

      console.log(`✅ 역동기화 완료: ${slug}`);
      success++;

      // Rate limit 준수
      await new Promise((r) => setTimeout(r, 350));
    } catch (err: any) {
      console.error(`❌ 역동기화 실패: ${slug} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\n📊 역동기화 결과:`);
  console.log(`  ✅ 성공: ${success}개`);
  console.log(`  🆕 신규: ${created}개`);
  console.log(`  ⚠️ 충돌: ${conflict}개`);
  console.log(`  ❌ 실패: ${failed}개`);

  // 충돌/실패가 있어도 exit 0 (부분 성공 허용)
  // GitHub Actions에서 충돌은 Notion 코멘트로 이미 알림됨
}

// ── Markdown 본문 → Notion 블록 (간략화 버전) ─────────────────────────
function markdownToNotionBlocks(content: string): any[] {
  const lines = content
    .replace(/\r\n/g, "\n")
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  const blocks: any[] = [];

  for (const para of lines) {
    const firstLine = para.split("\n")[0];

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

    if (firstLine.startsWith("> ")) {
      blocks.push({
        type: "quote",
        quote: { rich_text: [{ type: "text", text: { content: para.replace(/^> /gm, "") } }] },
      });
      continue;
    }

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

    if (firstLine.match(/^---+$/)) {
      blocks.push({ type: "divider", divider: {} });
      continue;
    }

    const text = para.slice(0, 2000);
    if (text) {
      blocks.push({
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: text } }] },
      });
    }
  }

  return blocks.slice(0, 100);
}

main().catch((err) => {
  console.error("❌ 치명적 오류:", err);
  process.exit(1);
});
