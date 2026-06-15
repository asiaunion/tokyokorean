import fs from "fs";
import path from "path";

// GSF-Blog 마크다운 포스팅 내 중복 섹션 탐지기
// 목적: 동일한 .md 파일 내에서 완전히 동일한 Header(## ...)가 2번 이상 쓰였는지 검사하여 실수를 방지합니다.

const BLOG_DIR = path.resolve(process.cwd(), "src/data/blog");

function getAllMarkdownFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.resolve(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllMarkdownFiles(filePath));
    } else if (file.endsWith(".md")) {
      results.push(filePath);
    }
  }
  return results;
}

const markdownFiles = getAllMarkdownFiles(BLOG_DIR);

let hasErrors = false;

console.log(`🔍 [Duplicate Section Scanner] Scanning ${markdownFiles.length} markdown files...`);

for (const file of markdownFiles) {
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split("\n");

  const headers = new Set();
  const duplicates = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // "#" 로 시작하는 모든 헤더 추출 (예: ## Community Insight)
    if (line.match(/^#{1,6}\s+.+/)) {
      if (headers.has(line)) {
        duplicates.push({ lineNum: i + 1, content: line });
      } else {
        headers.add(line);
      }
    }
  }

  if (duplicates.length > 0) {
    hasErrors = true;
    const relPath = path.relative(process.cwd(), file);
    console.error(`\n🚨 Error: Duplicated headers found in [${relPath}]`);
    duplicates.forEach((dup) => {
      console.error(`   - Line ${dup.lineNum}: "${dup.content}"`);
    });
  }
}

if (hasErrors) {
  console.error("\n❌ Scan failed: Please fix the duplicated markdown headers above.");
  process.exit(1);
} else {
  console.log("✅ All clear! No duplicated sections found.");
  process.exit(0);
}
