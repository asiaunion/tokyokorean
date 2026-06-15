import { readFileSync } from "fs";
import { join } from "path";

/**
 * Pass 1: Translate the source markdown text using Ollama chat API.
 * @param {string} sourceContent Raw source markdown content.
 * @param {string} targetLang Target language code ('en' or 'ja').
 * @param {string} modelName Ollama model name (default: 'gemma2:9b').
 * @returns {Promise<string>} The drafted translation markdown.
 */
export async function pass1Translate(sourceContent, targetLang, modelName = "gemma2:9b") {
  const rootDir = process.cwd();
  const personaPath = join(rootDir, "scripts", "translate", "persona", `${targetLang}.json`);
  
  let personaConfig;
  try {
    const rawPersona = readFileSync(personaPath, "utf-8");
    personaConfig = JSON.parse(rawPersona);
  } catch (error) {
    throw new Error(`Failed to load persona configuration for target language '${targetLang}': ${error.message}`);
  }

  const systemInstructions = `
You are the translation engine for GSF-Blog.
Target Language: ${personaConfig.languageName} (${personaConfig.language})
Your Persona: ${personaConfig.persona}

Here are the Translation Rules you MUST follow:
${personaConfig.translationRules.map((rule, idx) => `${idx + 1}. ${rule}`).join("\n")}

Here are the Structural Rules you MUST follow:
${personaConfig.structuralRules.map((rule, idx) => `${idx + 1}. ${rule}`).join("\n")}

CRITICAL INSTRUCTIONS:
1. Translate the entire post body and specified frontmatter values ('title' and 'description').
2. Keep all Markdown formatting intact.
3. Keep Astro components (e.g. <MacroBarrierChart />) and HTML tags (<strong>, etc.) intact. Do not inline large SVG charts in markdown—use components instead.
4. Do NOT output any preamble, commentary, explanations, or notes. ONLY output the translated markdown file starting with "---" and ending with "---" or the conclusion.
5. In the frontmatter, you MUST set 'lang: ${targetLang}' and preserve all other keys and arrays ('sources', 'references', 'category', 'pubDatetime', etc.) exactly as is.
6. Translate the 'macroMicroMatrix' content inside frontmatter values if present, but DO NOT translate its keys ('leftTitle', 'leftItems', 'rightTitle', 'rightItems').
`;

  console.log(`[Pass 1] Requesting draft translation to ${personaConfig.languageName} using model '${modelName}'...`);

  const ollamaBaseUrl = process.env.OLLAMA_HOST || "http://localhost:11434";
  const normalizedBase = ollamaBaseUrl.startsWith("http") ? ollamaBaseUrl : `http://${ollamaBaseUrl}`;
  const endpoint = `${normalizedBase}/api/chat`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        {
          role: "system",
          content: systemInstructions.trim()
        },
        {
          role: "user",
          content: sourceContent
        }
      ],
      stream: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error (Pass 1): ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const draft = result.message?.content?.trim();

  if (!draft) {
    throw new Error("Ollama returned an empty draft translation response.");
  }

  return draft;
}
