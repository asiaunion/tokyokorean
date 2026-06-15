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
  const content = fs.readFileSync(file, 'utf8');
  
  // Find <img ... /> tags
  // Uses a regex that matches `<img ` up to `/>` or `>`
  const imgRegex = /<img\s+([^>]*?)alt="([^"]+)"([^>]*?)\/?>/g;
  
  if (imgRegex.test(content)) {
    const newContent = content.replace(imgRegex, (match, beforeAlt, altText, afterAlt) => {
      // Reconstruct the original image tag (always self-closing)
      const originalImg = `<img ${beforeAlt}alt="${altText}"${afterAlt}/>`.replace(/\s+\/>/, ' />');
      
      // If it's already inside a figure block (just a safety check, though we know there are no figures)
      // Since replace operates purely on the match, we just wrap it.
      return `<figure class="my-6">\n  ${originalImg}\n  <figcaption class="text-center text-sm mt-2">${altText}</figcaption>\n</figure>`;
    });
    
    // Only write if it actually changed
    if (content !== newContent) {
      fs.writeFileSync(file, newContent, 'utf8');
      modifiedCount++;
      console.log(`Updated images in: ${file}`);
    }
  }
});

console.log(`\nTotal files with images updated: ${modifiedCount}`);
