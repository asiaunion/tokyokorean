import type { ParsedAuthorNotes } from "@/lib/author-notes/types";
import { softenHardClaims } from "@/lib/content-engine/rules";
import { polishKoBody } from "@/lib/content-engine/generator";
import type { ResearchPack } from "@/lib/research-adapter/types";

type Provider = "template" | "anthropic" | "openai" | "gemini";

export interface LlmKoDraftResult {
  body: string;
  provider: Provider;
  model: string;
}

function resolveProvider(): Provider {
  const raw = String(process.env.BLOG_KO_WRITER_PROVIDER ?? "template").toLowerCase();
  if (raw === "anthropic" || raw === "openai" || raw === "gemini") return raw;
  return "template";
}

function sectionPrompt(pack: ResearchPack, notes: ParsedAuthorNotes, revisionMemo: string) {
  const mustInclude = notes.mustInclude.length > 0 ? notes.mustInclude.join(", ") : "핵심 사용자 메모";
  const mustAvoid = notes.mustAvoid.length > 0 ? notes.mustAvoid.join(", ") : "단정/보장형 표현";
  const references = pack.items
    .slice(0, 8)
    .map(
      (item, idx) =>
        `${idx + 1}. [${item.tier}] ${item.title} | ${item.domain} | ${item.url} | ${item.excerpt ?? ""}`
    )
    .join("\n");
  return `
당신은 Joseph 전용 블로그 에디터입니다.
반드시 한국어로만 작성하고 아래 5개 섹션 제목을 정확히 사용하세요.

## 1) 문제 제기
## 2) 핵심 사실/데이터
## 3) 해석과 인사이트
## 4) 실무적 시사점
## 5) 결론

하드 규칙:
- 공손체(합니다/입니다) 유지
- 단정/보장형 표현 금지
- 본문 길이 목표: 1800~2300자
- 제목/주제 이탈 금지
- 부동산/투자/라이프스타일 맥락 유지
- 결론에서 제목 키워드 재연결
- 본문 끝에 면책·Disclaimer 섹션을 넣지 마세요 (사이트 상단 PostDisclaimer로 표시됨)

주제 키워드: ${pack.keyword}
반영할 요소: ${mustInclude}
피할 요소: ${mustAvoid}
추가 수정 메모: ${revisionMemo || "없음"}

근거 자료:
${references}

출력 형식:
- 마크다운 본문만 출력
- 코드펜스, JSON, 설명문 금지
`.trim();
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 45000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function callAnthropic(prompt: string, pack: ResearchPack): Promise<LlmKoDraftResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");
  const model = process.env.BLOG_KO_WRITER_MODEL ?? "claude-3-5-sonnet-latest";
  const res = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2400,
      temperature: 0.35,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}`);
  const json = (await res.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const text = json.content?.find(item => item.type === "text")?.text?.trim();
  if (!text) throw new Error("anthropic empty body");
  return {
    body: polishKoBody(softenHardClaims(text), pack.keyword, pack),
    provider: "anthropic",
    model,
  };
}

async function callOpenAI(prompt: string, pack: ResearchPack): Promise<LlmKoDraftResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");
  const model = process.env.BLOG_KO_WRITER_MODEL ?? "gpt-4o-mini";
  const res = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`openai ${res.status}`);
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("openai empty body");
  return {
    body: polishKoBody(softenHardClaims(text), pack.keyword, pack),
    provider: "openai",
    model,
  };
}

async function callGemini(prompt: string, pack: ResearchPack): Promise<LlmKoDraftResult> {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");
  const model = process.env.BLOG_KO_WRITER_MODEL ?? "gemini-1.5-flash";
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetchWithTimeout(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.35 },
    }),
  });
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error("gemini empty body");
  return {
    body: polishKoBody(softenHardClaims(text), pack.keyword, pack),
    provider: "gemini",
    model,
  };
}

export async function tryGenerateKoDraftWithLlm(
  pack: ResearchPack,
  notes: ParsedAuthorNotes,
  revisionMemo = ""
) {
  const provider = resolveProvider();
  if (provider === "template") return null;
  const prompt = sectionPrompt(pack, notes, revisionMemo);
  if (provider === "anthropic") return callAnthropic(prompt, pack);
  if (provider === "openai") return callOpenAI(prompt, pack);
  return callGemini(prompt, pack);
}
