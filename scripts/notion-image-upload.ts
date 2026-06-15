import { parseArgs } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { put } from '@vercel/blob';

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    input: { type: 'string' }
  }
});

const inputPath = values.input;

// Extract Notion S3 image URLs from markdown (both body images and ogImage in frontmatter)
function extractNotionImageUrls(markdown: string): string[] {
  const urls: string[] = [];
  
  // 1. Markdown body images: ![alt](url)
  const regexBody = /!\[([^\]]*)\]\((https:\/\/prod-files-secure\.s3[^)]+)\)/g;
  let match;
  while ((match = regexBody.exec(markdown)) !== null) {
    urls.push(match[2]);
  }
  
  // 2. Frontmatter ogImage: "url"
  const regexOg = /ogImage:\s*"(https:\/\/prod-files-secure\.s3[^"]+)"/g;
  while ((match = regexOg.exec(markdown)) !== null) {
    urls.push(match[1]);
  }
  
  return urls;
}

async function uploadImageToBlob(url: string, prefix: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  
  const buffer = await response.arrayBuffer();
  
  // Try to get filename from URL or Content-Disposition
  let filename = 'image.png';
  const urlPath = new URL(url).pathname;
  if (urlPath) {
    filename = path.basename(urlPath);
  }
  
  const finalFilename = `${prefix}-${filename}`;
  
  const blob = await put(`notion-uploads/${finalFilename}`, buffer, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN!.trim(),
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  
  return blob.url;
}

async function main() {
  if (!inputPath || !fs.existsSync(inputPath)) {
    console.error("Input file not found:", inputPath);
    process.exit(1);
  }

  const slug = path.basename(inputPath, '.ko.md');
  let content = fs.readFileSync(inputPath, 'utf-8');

  const urls = extractNotionImageUrls(content);
  if (urls.length === 0) {
    console.log("🖼️ No Notion images found to upload.");
    return;
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("❌ BLOB_READ_WRITE_TOKEN is not set. Cannot upload images. Please add it to GitHub Secrets.");
    process.exit(1);
  }

  console.log(`🖼️ Found ${urls.length} images. Uploading to Vercel Blob...`);
  
  for (let i = 0; i < urls.length; i++) {
    const originalUrl = urls[i];
    try {
      console.log(`  Uploading image ${i + 1}/${urls.length}...`);
      const newUrl = await uploadImageToBlob(originalUrl, `${slug}-${i}`);
      // Replace original URL with new Blob URL globally in the markdown content
      content = content.split(originalUrl).join(newUrl);
      console.log(`  ✅ Uploaded: ${newUrl}`);
    } catch (error: any) {
      console.error(`  ❌ Failed to upload image ${originalUrl}:`, error);
      fs.writeFileSync('upload_error.log', `이미지 업로드 실패: ${error.message}`);
      process.exit(1);
    }
  }

  // Save the updated markdown
  fs.writeFileSync(inputPath, content);
  console.log("✅ Markdown updated with Vercel Blob URLs.");
}

main().catch(console.error);
