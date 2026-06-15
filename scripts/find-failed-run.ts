import "dotenv/config";
import { Client } from "@notionhq/client";

async function main() {
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  const dbId = process.env.NOTION_DATABASE_ID;

  const res = await notion.databases.query({
    database_id: dbId as string,
    filter: {
      property: "status",
      select: {
        equals: "발행실패"
      }
    }
  });

  if (res.results.length === 0) {
    console.log("발행실패 페이지가 없습니다.");
    return;
  }

  for (const page of res.results as any[]) {
    console.log(`Page ID: ${page.id}`);
    const previewUrl = page.properties["previewUrl"]?.url;
    console.log(`Preview URL (GitHub Actions Run): ${previewUrl}`);
  }
}

main().catch(console.error);
