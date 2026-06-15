/**
 * Render public/assets/images/blog/svg/*.svg → diagrams/*.webp (resvg + sharp).
 * Prerequisite: python3 scripts/sanitize_svg_xml.py
 *
 * Usage: node scripts/render-diagrams-to-webp.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const svgDir = path.join(root, "public/assets/images/blog/svg");
const outDir = path.join(root, "public/assets/images/blog/diagrams");

const WIDTH = 780;

async function renderOne(svgName) {
  const svgPath = path.join(svgDir, svgName);
  const base = svgName.replace(/\.svg$/i, "");
  const webpPath = path.join(outDir, `${base}.webp`);

  const svgCode = fs.readFileSync(svgPath);
  const resvg = new Resvg(svgCode, {
    fitTo: { mode: "width", value: WIDTH },
  });
  const png = resvg.render().asPng();
  await sharp(png).webp({ quality: 88 }).toFile(webpPath);
  return webpPath;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const svgs = fs.readdirSync(svgDir).filter(f => f.endsWith(".svg"));
  const failures = [];

  for (const name of svgs.sort()) {
    try {
      await renderOne(name);
      console.log(`  ok ${name} → diagrams/${name.replace(/\.svg$/, ".webp")}`);
    } catch (err) {
      failures.push({ name, err: String(err?.message ?? err) });
      console.error(`  FAIL ${name}: ${err?.message ?? err}`);
    }
  }

  console.log(
    JSON.stringify(
      { rendered: svgs.length - failures.length, failed: failures.length, failures },
      null,
      2
    )
  );
  if (failures.length) process.exit(1);
}

main();
