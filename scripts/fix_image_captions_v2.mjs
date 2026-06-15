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

  // 1. Revert the invalid <figure> block
  const brokenFigureRegex = /<figure class="my-6">\s*(<img[^>]*?>)\s*<figcaption[^>]*?>.*?<\/figcaption>\s*<\/figure>/g;
  if (brokenFigureRegex.test(content)) {
    content = content.replace(brokenFigureRegex, '$1');
    changed = true;
  }

  // 2. Wrap <picture> blocks correctly
  // The regex finds <picture> ... <img alt="ALT"> ... </picture>
  const pictureRegex = /(<picture>[\s\S]*?<img\s+[^>]*?alt="([^"]+)"[^>]*?>[\s\S]*?<\/picture>)/g;
  if (pictureRegex.test(content)) {
    content = content.replace(pictureRegex, (match, pictureBlock, altText) => {
      return `<figure class="my-6">\n  ${pictureBlock}\n  <figcaption class="text-center text-sm text-foreground/75 mt-2">${altText}</figcaption>\n</figure>`;
    });
    changed = true;
  }

  // 3. For any standalone <img> tags not inside <picture> and not inside <figure>
  // (We skip this complex regex logic here because we saw they are all <picture> blocks in the output, 
  // but if any exist, they will be left alone for manual fixing. It's safer to just handle <picture> blocks.)

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`Fixed images in: ${file}`);
  }
});

console.log(`\nTotal files fixed: ${modifiedCount}`);
