import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';

const artifactsDir = '/Users/gsf/.gemini/antigravity/brain/a4c06275-897a-49c2-8202-c723f2f92f3d';
const svgDir = 'public/assets/images/blog/svg';

async function renderSvg(filename, outputName) {
  const svgPath = path.join(svgDir, filename);
  const outputPath = path.join(artifactsDir, outputName);
  
  try {
    const svgCode = fs.readFileSync(svgPath);
    const resvg = new Resvg(svgCode, {
      fitTo: {
        mode: 'width',
        value: 780,
      },
    });
    
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    
    fs.writeFileSync(outputPath, pngBuffer);
    console.log(`✅ Rendered ${filename} -> ${outputName}`);
  } catch (error) {
    console.error(`❌ Failed to render ${filename}:`, error);
  }
}

async function main() {
  await renderSvg('ko-japan-real-estate-three-things.svg', 'ko-japan-real-estate-three-things.png');
  await renderSvg('en-japan-real-estate-three-things.svg', 'en-japan-real-estate-three-things.png');
  await renderSvg('ja-japan-real-estate-three-things.svg', 'ja-japan-real-estate-three-things.png');
}

main();
