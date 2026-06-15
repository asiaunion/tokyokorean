import { Client } from "@notionhq/client";
import { blocksToMarkdown } from "./notion-to-md.ts"; 
import { put } from "@vercel/blob";

const NOTION_TOKEN = process.env.NOTION_TOKEN || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || "";
const PAGE_ID = process.argv[2];

if (!NOTION_TOKEN || !GEMINI_API_KEY || !PAGE_ID) {
  console.error("Missing required environment variables or arguments.");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

interface DraftResult {
  draft: string;
  tags: string[];
}

async function generateDraft(text: string): Promise<DraftResult> {
  const prompt = `다음은 블로그 포스트 작성을 위한 메모 및 원본 내용입니다. 
이 내용을 바탕으로 다음 두 가지를 생성해서 반드시 JSON 형식으로만 응답해 주세요. (마크다운 백틱 등 일체 불필요)

1. "draft": 블로그 독자들이 읽기 좋은 완성된 포스트 초안 (마크다운 형식, 프론트매터(Frontmatter)나 히어로 이미지 등은 절대 포함하지 말고 순수 본문 내용만 작성할 것)
2. "tags": 이 글에 어울리는 3~5개의 핵심 태그 (문자열 배열, 예: ["도쿄", "여행"])

[원본 내용]
${text}

반드시 순수 JSON 객체( { "draft": "...", "tags": [...] } )만 출력하세요.`;

  const modelsListRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
  if (modelsListRes.ok) {
    const modelsData = await modelsListRes.json();
    const availableModels = modelsData.models?.map((m: any) => m.name) || [];
    console.log("AVAILABLE MODELS:", availableModels.join(", "));
  } else {
    console.error("Failed to fetch models list");
  }

  const models = [
    "gemini-3.1-pro-preview",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.5-pro",
    "gemini-pro-latest"
  ];

  let lastError = null;

  for (const model of models) {
    console.log(`Trying model: ${model}...`);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(`Gemini API Error with ${model}: ${JSON.stringify(data)}`);
      }
      
      let textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textContent) {
        throw new Error(`Failed to parse Gemini response with ${model}.`);
      }
      
      // 혹시라도 백틱이 붙어 오면 제거
      textContent = textContent.replace(/^```json\n/, "").replace(/^```\n/, "").replace(/\n```$/, "").trim();
      const parsed = JSON.parse(textContent) as DraftResult;
      
      console.log(`Successfully generated draft using ${model}`);
      return parsed;
    } catch (err: any) {
      console.error(err.message);
      lastError = err;
      // continue to next model
    }
  }

async function updateNotionProperties(pageId: string, tags: string[]) {
  const properties: any = {};
  if (tags && tags.length > 0) {
    properties["tags"] = {
      multi_select: tags.map(t => ({ name: t }))
    };
  }

  const payload: any = {
    page_id: pageId,
    properties
  };

  if (Object.keys(properties).length > 0) {
    console.log("Updating Notion page properties (tags)...");
    await notion.pages.update(payload);
  }
}

function parseMarkdownToBlocks(markdown: string): any[] {
  const blocks: any[] = [];
  const lines = markdown.split("\n");
  
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      // Chunk text to max 2000 chars per block to avoid Notion limits
      const text = currentParagraph.join("\n");
      const chunks = text.match(/[\s\S]{1,2000}/g) || [];
      for (const chunk of chunks) {
        blocks.push({
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: chunk } }]
          }
        });
      }
      currentParagraph = [];
    }
  };

  for (let line of lines) {
    line = line.trim();
    if (!line) {
      flushParagraph();
      continue;
    }
    
    // Check headings
    if (line.startsWith("### ")) {
      flushParagraph();
      blocks.push({
        object: "block",
        type: "heading_3",
        heading_3: { rich_text: [{ type: "text", text: { content: line.replace("### ", "") } }] }
      });
      continue;
    }
    
    if (line.startsWith("## ")) {
      flushParagraph();
      blocks.push({
        object: "block",
        type: "heading_2",
        heading_2: { rich_text: [{ type: "text", text: { content: line.replace("## ", "") } }] }
      });
      continue;
    }
    
    if (line.startsWith("# ")) {
      flushParagraph();
      blocks.push({
        object: "block",
        type: "heading_1",
        heading_1: { rich_text: [{ type: "text", text: { content: line.replace("# ", "") } }] }
      });
      continue;
    }
    
    // Bulleted list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      flushParagraph();
      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: { rich_text: [{ type: "text", text: { content: line.substring(2) } }] }
      });
      continue;
    }
    
    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      flushParagraph();
      blocks.push({
        object: "block",
        type: "numbered_list_item",
        numbered_list_item: { rich_text: [{ type: "text", text: { content: line.replace(/^\d+\.\s/, "") } }] }
      });
      continue;
    }

    // Default: accumulate to paragraph
    currentParagraph.push(line);
  }
  
  flushParagraph();
  
  return blocks;
}

async function main() {
  console.log("Fetching existing content from Notion...");
  const markdown = await blocksToMarkdown(notion, PAGE_ID);
  
  console.log("Requesting AI draft from Gemini API...");
  const result = await generateDraft(markdown);
  
  console.log("Updating Notion properties...");
  await updateNotionProperties(PAGE_ID, result.tags);
  
  console.log("Parsing draft to Notion blocks...");
  const draftBlocks = parseMarkdownToBlocks(result.draft);
  
  console.log("Creating Toggle Block for AI Draft...");
  const now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  const toggleRes = await notion.blocks.children.append({
    block_id: PAGE_ID,
    children: [
      {
        object: "block",
        type: "toggle",
        toggle: {
          rich_text: [{ type: "text", text: { content: `✨ AI 초안 (Gemini 3.1 Pro - ${now})` } }]
        }
      }
    ]
  });
  
  const toggleBlockId = toggleRes.results[0].id;
  
  console.log(`Appending ${draftBlocks.length} blocks to Toggle...`);
  // Chunk into 100 blocks per request (Notion API max children limit)
  const chunkSize = 100;
  for (let i = 0; i < draftBlocks.length; i += chunkSize) {
    const chunk = draftBlocks.slice(i, i + chunkSize);
    await notion.blocks.children.append({
      block_id: toggleBlockId,
      children: chunk
    });
  }
  
  console.log("Successfully appended AI draft and updated properties.");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
