const { Client } = require("@notionhq/client");
const fs = require("fs");

async function main() {
  const token = process.env.NOTION_TOKEN;
  const notion = new Client({ auth: token });
  
  // Database ID from wrangler.toml
  const dbId = "3719ded28b0f81109dc8e5d80c2f2c47";
  
  const response = await notion.databases.query({
    database_id: dbId,
    filter: {
      property: "slug",
      rich_text: {
        equals: "why-warm-investing-holds"
      }
    }
  });

  if (response.results.length === 0) {
    console.log("Not found.");
    return;
  }
  
  const pageId = response.results[0].id;
  await notion.pages.update({
    page_id: pageId,
    properties: {
      status: {
        select: {
          name: "발행완료"
        }
      }
    }
  });
  console.log("Updated to 발행완료!");
}

main().catch(console.error);
