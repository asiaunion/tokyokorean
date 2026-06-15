import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import path from "path";

// .env 로드
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
  console.error("❌ NOTION_TOKEN 또는 NOTION_DATABASE_ID가 설정되지 않았습니다.");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

async function setupDatabase() {
  console.log("🚀 Notion 데이터베이스 스키마 설정을 시작합니다...");

  try {
    const currentTitleName = "title";
    console.log(`Title 컬럼 이름: ${currentTitleName}`);

    // 2. 데이터베이스 스키마 업데이트
    const response = await notion.databases.update({
      database_id: NOTION_DATABASE_ID!,
      properties: {
        // 기본 Title 컬럼 이름
        [currentTitleName]: {
          name: "title",
          title: {}
        },
        "slug": { name: "slug", rich_text: {} },
        "description": { name: "description", rich_text: {} },
        "status": { 
          name: "status", 
          select: { 
            options: [
              { name: "AI초안요청" },
              { name: "AI초안작성중" },
              { name: "초안검토대기" },
              { name: "발행요청" },
              { name: "번역중" },
              { name: "발행승인대기" },
              { name: "번역재요청" },
              { name: "머지중" },
              { name: "발행승인" },
              { name: "발행실패" },
              { name: "발행완료" }
            ]
          } 
        },
        "voiceRewriteSkip": { name: "voiceRewriteSkip", checkbox: {} },
        "lang": { 
          name: "lang", 
          select: { 
            options: [{ name: "ko" }, { name: "en" }, { name: "ja" }] 
          } 
        },
        "translationStatus": { 
          name: "translationStatus", 
          select: { 
            options: [{ name: "pending" }, { name: "completed" }] 
          } 
        },
        "category": { name: "category", select: {} },
        "tags": { name: "tags", multi_select: {} },
        "pubDatetime": { name: "pubDatetime", date: {} },
        "modDatetime": { name: "modDatetime", date: {} },
        "ogImage": { name: "ogImage", url: {} },
        "sources": { name: "sources", rich_text: {} },
        "featured": { name: "featured", checkbox: {} },
        "draft": { name: "draft", checkbox: {} },
        "gitSha": { name: "gitSha", rich_text: {} },
        "previewUrl": { name: "previewUrl", url: {} }
      }
    });

    console.log("✅ 데이터베이스 스키마가 성공적으로 업데이트되었습니다!");
    console.log(`생성된 컬럼 수: ${Object.keys(response.properties).length}개`);
  } catch (error: any) {
    console.error("❌ 스키마 업데이트 중 오류 발생:", error.message);
  }
}

setupDatabase();
