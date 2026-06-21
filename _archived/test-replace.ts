import fs from 'node:fs';

const content = fs.readFileSync('.blog-agent-stage/test-post.ko.md', 'utf-8');
const regexBody = /!\[([^\]]*)\]\((https:\/\/prod-files-secure\.s3[^)]+)\)/g;

let match;
let newContent = content;
let found = 0;
while ((match = regexBody.exec(content)) !== null) {
  const originalUrl = match[2];
  console.log("Found S3 URL:", originalUrl.substring(0, 50) + "...");
  newContent = newContent.split(originalUrl).join("https://mock-vercel-blob.com/image.jpg");
  found++;
}
console.log("Found count:", found);
if (found > 0) {
  console.log("Replacement test:", newContent.includes("https://mock-vercel-blob.com/image.jpg"));
  console.log("Original still exists:", newContent.includes("prod-files-secure.s3"));
}
