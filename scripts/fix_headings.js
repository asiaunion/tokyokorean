const fs = require('fs');
const path = require('path');

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
  // Match <p class="post-section-heading">text</p>
  const regex = /<p class="post-section-heading">\s*(.*?)\s*<\/p>/g;
  
  if (regex.test(content)) {
    const newContent = content.replace(regex, '## $1');
    fs.writeFileSync(file, newContent, 'utf8');
    modifiedCount++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`\nTotal files updated: ${modifiedCount}`);
