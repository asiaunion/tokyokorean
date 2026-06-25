const fs = require('fs');
const path = require('path');

const mappings = {
  "japan-garbage-disposal-rules": "practical",
  "japan-banking-credit-card": "practical",
  "tokyo-housing-rental-process": "practical",
  "japan-healthcare-hospital-visit": "practical",
  "tokyo-public-transportation-tips": "practical",
  "japan-korea-work-culture-diff": "culture",
  "japan-married-to-japanese-culture-diff": "culture",
  "japan-life-8years-honest": "culture",
  "japan-language-learning-survival-japanese": "culture",
  "japan-seasons-matsuri-culture": "culture",
  "nihonbashi-history-and-modern-life": "local",
  "nihonbashi-why-i-live-here": "local",
  "nihonbashi-hidden-cafes": "local",
  "tokyo-supermarket-guide": "local",
  "japan-convenience-store-must-buys": "local",
  "tokyo-weekend-getaway-spots": "local",
  "nihonbashi-buying-property-foreigner": "essay",
  "tokyo-life-cost-of-living": "essay",
  "tokyo-korean-community-culture": "essay",
  "japan-elderly-care-frontline": "essay"
};

const dir = path.join(__dirname, 'src', 'data', 'blog', 'ko');

for (const [slug, category] of Object.entries(mappings)) {
  const file = path.join(dir, `${slug}.md`);
  if (!fs.existsSync(file)) {
    console.error('File not found:', file);
    continue;
  }
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.match(/^category:/m)) {
    content = content.replace(/^category:.*$/m, `category: ${category}`);
  } else {
    content = content.replace(/^(lang: ko)$/m, `category: ${category}\n$1`);
  }
  
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Done');
