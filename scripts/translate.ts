import { parseArgs } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    ko: { type: 'string' },
    slug: { type: 'string' }
  }
});

const inputPath = values.ko;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

async function translateText(text: string, lang: string): Promise<string> {
  const prompt = `Translate the following markdown text into ${lang === "en" ? "English" : "Japanese"}.
Maintain all markdown formatting, including headers, bold, italics, links, and code blocks.
For the frontmatter (between ---), ONLY translate the 'title' and 'description' fields if they are present. DO NOT change keys.
Update 'lang: ko' to 'lang: ${lang}'.
Do not add any additional explanations, just output the translated markdown.

[Markdown Text]
${text}`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: "You are an expert translator. Preserve markdown structure perfectly." }] }
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  
  let translated = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!translated) throw new Error("No text returned from Gemini");
  
  // Remove markdown codeblock markers if Gemini wraps the response
  if (translated.startsWith("```markdown\n")) {
    translated = translated.substring(12, translated.length - 3);
  } else if (translated.startsWith("```\n")) {
    translated = translated.substring(4, translated.length - 3);
  }
  
  return translated.trim() + "\n";
}

async function main() {
  if (!inputPath || !fs.existsSync(inputPath)) {
    console.error("Input file not found:", inputPath);
    process.exit(1);
  }

  const content = fs.readFileSync(inputPath, 'utf-8');
  const slug = values.slug || path.basename(inputPath, '.ko.md');
  
  const koDest = `src/data/blog/ko/${slug}.md`;
  const enDest = `src/data/blog/en/${slug}.md`;
  const jaDest = `src/data/blog/ja/${slug}.md`;
  
  fs.mkdirSync(path.dirname(koDest), { recursive: true });
  fs.mkdirSync(path.dirname(enDest), { recursive: true });
  fs.mkdirSync(path.dirname(jaDest), { recursive: true });
  
  // Copy Korean as is
  fs.writeFileSync(koDest, content);
  
  if (!GEMINI_API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY missing. Falling back to stub copy for EN/JA.");
    fs.writeFileSync(enDest, content);
    fs.writeFileSync(jaDest, content);
    return;
  }

  try {
    console.log("🌐 Translating to English...");
    const enContent = await translateText(content, "en");
    fs.writeFileSync(enDest, enContent);
    
    console.log("🌐 Translating to Japanese...");
    const jaContent = await translateText(content, "ja");
    fs.writeFileSync(jaDest, jaContent);
    
    console.log(`✅ Translations saved: ${enDest}, ${jaDest}`);
  } catch (err: any) {
    console.error("❌ Translation failed:", err.message);
    process.exit(1);
  }
}

main().catch(console.error);
