/**
 * workers/notion-poller/src/index.ts
 *
 * Cloudflare Worker — Notion Webhook / Polling + GitHub Actions dispatch
 *
 * 환경:
 *   - BLOGS_CONFIG (var): JSON 배열, 블로그별 설정 (token 제외)
 *   - DATABASE_ID_TO_BLOG (var): (Optional) JSON 객체, Notion DB ID -> blog_id 맵핑
 *   - NOTION_TOKEN (secret): GSF-Blog Notion Integration Token
 *   - WIFE_NOTION_TOKEN (secret): 아내 블로그 Notion Integration Token
 *   - CF_WORKER_GITHUB_TOKEN (secret): GitHub Fine-grained PAT (actions:write)
 */

export interface Env {
  BLOGS_CONFIG: string;
  DATABASE_ID_TO_BLOG?: string;
  NOTION_TOKEN: string;
  WIFE_NOTION_TOKEN?: string;
  CF_WORKER_GITHUB_TOKEN: string;
}

interface BlogConfig {
  id: string;
  notionDatabaseId: string;
  githubRepo: string;
  imageStorage: "vercel-blob" | "cf-r2";
  domain: string;
}

// ── 1. 상태 기반 선언형 라우팅 (STATUS_ROUTES) ──────────────────────────
const STATUS_ROUTES: Record<string, { workflowFile: string; processingStatus: string }> = {
  "AI초안요청": { workflowFile: "notion-ai-draft.yml", processingStatus: "AI초안작성중" },
  "발행요청": { workflowFile: "notion-publish.yml", processingStatus: "번역중" },
  "번역재요청": { workflowFile: "notion-publish.yml", processingStatus: "번역중" },
  "발행승인": { workflowFile: "notion-merge.yml", processingStatus: "머지중" },
};

// ── Notion Token 선택 ─────────────────────────────────────────────────
function getNotionToken(blogId: string, env: Env): string {
  if (blogId === "wife-blog" && env.WIFE_NOTION_TOKEN) {
    return env.WIFE_NOTION_TOKEN;
  }
  return env.NOTION_TOKEN;
}

// ── Notion API 호출 ───────────────────────────────────────────────────
async function notionRequest(
  path: string,
  method: string,
  token: string,
  body?: unknown
): Promise<Response> {
  return fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ── Notion DB 쿼리 (Polling fallback) ─────────────────────────────────
async function queryNotionByStatus(
  databaseId: string,
  status: string,
  token: string
): Promise<Array<{ id: string; slug: string; properties: Record<string, any> }>> {
  const res = await notionRequest(
    `/databases/${databaseId}/query`,
    "POST",
    token,
    {
      filter: {
        property: "status",
        select: { equals: status },
      },
      page_size: 10,
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error(`Notion DB 쿼리 실패 (${res.status}): ${err}`);
    return [];
  }

  const data = await res.json();
  return (data.results || []).map((page: any) => {
    const slugProp = page.properties?.slug;
    const slug =
      slugProp?.type === "rich_text"
        ? slugProp.rich_text?.[0]?.plain_text || ""
        : "";
    return { id: page.id, slug, properties: page.properties };
  });
}

// ── 2. Optimistic Locking: Notion 페이지 status 즉각 업데이트 ───────────
async function updateNotionStatus(
  pageId: string,
  status: string,
  token: string
): Promise<void> {
  const res = await notionRequest(`/pages/${pageId}`, "PATCH", token, {
    properties: {
      status: { select: { name: status } },
    },
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`Notion status 업데이트 실패 (${pageId}): ${err}`);
  }
}

// ── Notion 페이지 코멘트 작성 ─────────────────────────────────────────
async function addNotionComment(
  pageId: string,
  message: string,
  token: string
): Promise<void> {
  await notionRequest("/comments", "POST", token, {
    parent: { page_id: pageId },
    rich_text: [{ type: "text", text: { content: message } }],
  });
}

// ── GitHub Actions workflow_dispatch 트리거 ───────────────────────────
async function triggerGitHubWorkflow(
  repo: string,
  workflowFile: string,
  inputs: Record<string, string>,
  githubToken: string
): Promise<boolean> {
  const [owner, repoName] = repo.split("/");
  const url = `https://api.github.com/repos/${owner}/${repoName}/actions/workflows/${workflowFile}/dispatches`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "User-Agent": "gsf-notion-poller/1.0",
    },
    body: JSON.stringify({ ref: "main", inputs }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`GitHub Actions 트리거 실패 (${res.status}): ${err}`);
    return false;
  }

  return true;
}

// ── 3. 동적 DB 식별 로직 ──────────────────────────────────────────────
function identifyBlogId(databaseId: string, env: Env, configs: BlogConfig[]): string {
  const normalizedPayloadDb = databaseId.replace(/-/g, "");

  if (env.DATABASE_ID_TO_BLOG) {
    try {
      const dbMap = JSON.parse(env.DATABASE_ID_TO_BLOG);
      for (const [keyDb, mappedBlog] of Object.entries(dbMap)) {
        if (keyDb.replace(/-/g, "") === normalizedPayloadDb) {
          return mappedBlog as string;
        }
      }
    } catch (e) {
      console.error("DATABASE_ID_TO_BLOG parse error", e);
    }
  }

  // Fallback: search in BLOGS_CONFIG
  const matchedConfig = configs.find(
    (c) => c.notionDatabaseId.replace(/-/g, "") === normalizedPayloadDb
  );
  if (matchedConfig) {
    return matchedConfig.id;
  }

  return "";
}

// ── Webhook 핸들러 ───────────────────────────────────────────────────
async function processWebhook(payload: any, env: Env): Promise<Response> {
  const databaseId = payload?.parent?.database_id;
  const pageId = payload?.id;

  if (!databaseId || !pageId) {
    return new Response("Invalid payload: Missing database_id or page_id", { status: 400 });
  }

  let configs: BlogConfig[] = [];
  try {
    configs = JSON.parse(env.BLOGS_CONFIG);
  } catch (err) {
    return new Response("Internal Server Error: BLOGS_CONFIG error", { status: 500 });
  }

  const blogId = identifyBlogId(databaseId, env, configs);
  if (!blogId) {
    return new Response(`Unrecognized database_id: ${databaseId}`, { status: 404 });
  }

  const config = configs.find((c) => c.id === blogId);
  if (!config) {
    return new Response(`Config not found for blog_id: ${blogId}`, { status: 500 });
  }

  const statusProp = payload?.properties?.status;
  const currentStatus = statusProp?.select?.name || statusProp?.status?.name || "";

  const slugProp = payload?.properties?.slug;
  const slug = slugProp?.rich_text?.[0]?.plain_text || "";

  console.log(`[${blogId}] Webhook received - pageId: ${pageId}, status: ${currentStatus}`);

  const route = STATUS_ROUTES[currentStatus];
  if (!route) {
    return new Response(`Ignored status: ${currentStatus}`, { status: 200 });
  }

  const token = getNotionToken(blogId, env);

  // Optimistic Locking
  await updateNotionStatus(pageId, route.processingStatus, token);

  // Trigger Action
  const triggered = await triggerGitHubWorkflow(
    config.githubRepo,
    route.workflowFile,
    {
      notion_page_id: pageId,
      slug: slug,
      blog_id: blogId,
    },
    env.CF_WORKER_GITHUB_TOKEN
  );

  if (!triggered) {
    // 실패 시 발행실패로 되돌리기 (안전장치)
    await updateNotionStatus(pageId, "발행실패", token);
    await addNotionComment(pageId, `❌ GitHub Actions 트리거에 실패했습니다. (Workflow: ${route.workflowFile})`, token);
    return new Response("GitHub Actions trigger failed", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}

// ── Polling 핸들러 (Fallback) ──────────────────────────────────────────
async function processBlogPolling(config: BlogConfig, env: Env): Promise<void> {
  const token = getNotionToken(config.id, env);

  for (const [triggerStatus, route] of Object.entries(STATUS_ROUTES)) {
    const pages = await queryNotionByStatus(config.notionDatabaseId, triggerStatus, token);
    
    for (const page of pages) {
      console.log(`📄 [${config.id}] Polling 감지: ${page.slug} (${page.id}) -> ${triggerStatus}`);
      
      // Optimistic Locking
      await updateNotionStatus(page.id, route.processingStatus, token);
      
      const triggered = await triggerGitHubWorkflow(
        config.githubRepo,
        route.workflowFile,
        {
          notion_page_id: page.id,
          slug: page.slug,
          blog_id: config.id,
        },
        env.CF_WORKER_GITHUB_TOKEN
      );

      if (!triggered) {
        await updateNotionStatus(page.id, "발행실패", token);
        await addNotionComment(
          page.id,
          `❌ GitHub Actions 트리거에 실패했습니다. (Workflow: ${route.workflowFile})`,
          token
        );
      } else {
        console.log(`✅ [${config.id}] GitHub Actions 트리거 성공`);
      }
    }
  }
}

// ── Cloudflare Worker 진입점 ──────────────────────────────────────────
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return new Response("OK", { status: 200 });
    }

    if (request.method === "POST" && url.pathname === "/webhook") {
      try {
        const payload = await request.json();
        return await processWebhook(payload, env);
      } catch (err) {
        return new Response("Invalid JSON payload", { status: 400 });
      }
    }

    if (request.method === "POST" && url.pathname === "/trigger") {
      await this.scheduled(null as any, env, null as any);
      return new Response("Polling Triggered", { status: 200 });
    }

    return new Response("GSF Notion CF Worker v2.0", { status: 200 });
  },

  async scheduled(_event: any, env: Env, _ctx: any): Promise<void> {
    let configs: BlogConfig[];
    try {
      configs = JSON.parse(env.BLOGS_CONFIG);
    } catch {
      console.error("BLOGS_CONFIG 파싱 실패");
      return;
    }

    for (const config of configs) {
      try {
        await processBlogPolling(config, env);
      } catch (err) {
        console.error(`[${config.id}] Polling 오류:`, err);
      }
    }
  },
};
