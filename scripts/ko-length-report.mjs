import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const koDir = path.join(process.cwd(), "src/data/blog/ko");
const slugs = (await readdir(koDir)).filter(f => f.endsWith(".md")).map(f => f.replace(/\.md$/, ""));

for (const slug of slugs.sort()) {
  const md = await readFile(path.join(koDir, `${slug}.md`), "utf8");
  const body = md.replace(/^---[\s\S]*?---\n/, "");
  const n = (body.match(/[가-힣]/g) ?? []).length;
  const flag = n < 1800 ? "SHORT" : n > 2300 ? "LONG" : "OK";
  if (flag !== "OK") console.log(`${flag}\t${n}\t${slug}`);
}
