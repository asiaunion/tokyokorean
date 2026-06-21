import fs from 'fs';
const data = fs.readFileSync(
  "src/data/blog/ko/tokyo-earthquake-vulnerable-five-areas.md",
  "utf-8"
);
console.log(data.length);
