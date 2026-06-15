import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogDir = path.join(__dirname, '../src/data/blog');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(blogDir);
let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // The markdown disclaimer looks like:
  // <div class="post-disclaimer">
  // <p class="post-disclaimer__title">면책 문구</p>
  // <p>※ 본 글은 정보 제공 목적의 개인적 분석이며, 특정 투자 상품의 매수·매도를 권유하지 않습니다. 투자 판단과 책임은 독자 본인에게 있습니다. 글의 작성 시점 이후 내용이 변경될 수도 있습니다.</p>
  // </div>
  
  // We use a regex to match the entire block
  const disclaimerRegex = /<div class="post-disclaimer">[\s\S]*?<\/div>/g;
  
  if (disclaimerRegex.test(content)) {
    content = content.replace(disclaimerRegex, '');
    // clean up any trailing whitespace left over
    content = content.trimEnd() + '\n';
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`Removed hardcoded disclaimer in: ${file}`);
  }
});

console.log(`\nTotal files updated: ${modifiedCount}`);
