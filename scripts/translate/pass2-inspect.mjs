import { readFileSync } from "fs";
import { join } from "path";

/**
 * Pass 2: Inspect and refine the draft translation using Ollama chat API.
 * @param {string} sourceContent Raw source markdown content.
 * @param {string} draftContent Translated draft from Pass 1.
 * @param {string} targetLang Target language code ('en' or 'ja').
 * @param {string} modelName Ollama model name.
 * @returns {Promise<string>} The refined translation markdown.
 */
export async function pass2Inspect(sourceContent, draftContent, targetLang, modelName = "gemma2:9b") {
  const rootDir = process.cwd();
  const personaPath = join(rootDir, "scripts", "translate", "persona", `${targetLang}.json`);
  
  let personaConfig;
  try {
    const rawPersona = readFileSync(personaPath, "utf-8");
    personaConfig = JSON.parse(rawPersona);
  } catch (error) {
    throw new Error(`Failed to load persona configuration for target language '${targetLang}': ${error.message}`);
  }

  const inspectorInstructions = `
You are the Translation Inspector and Editor for GSF-Blog.
Target Language: ${personaConfig.languageName} (${personaConfig.language})
Your Role: Review, refine, and perform quality checks on the drafted translation below.

Here is the quality checklist you MUST apply:
1. FRONTMATTER INTEGRITY:
   - Frontmatter keys must NEVER be translated (e.g. title, description, pubDatetime, sources, references, macroMicroMatrix).
   - Only 'title' and 'description' values should be translated.
   - The 'lang' field must be exactly '${targetLang}'.
   - 'macroMicroMatrix' keys (leftTitle, leftItems, rightTitle, rightItems) must NOT be modified. Only translate their string values.
   
2. HTML & SVG STRUCTURAL SOUNDNESS:
   - All HTML container tags (like <div class="macro-chart-container">) must be completely intact and properly closed.
   - All SVG elements (title, desc, lines, paths, gradients, coordinate values, circle elements, axes, labels, and legends) must remain structurally 100% identical to the source. Absolutely no broken or chopped-up markup.
   
3. TRANSLATION ACCURACY & EEAT STANDARDS:
   - Check if any residues of the source language (like Hangul/Japanese characters mixed into the wrong translation) remain.
   - For Japanese: Ensure particles like 'の' are not excessively repeated. Eliminate any accidental Korean particles (like '의', '가', '결정' remaining as Korean letters).
   - Ensure the tone remains highly professional, objective, and authoritative.
   - Review Post-Processing Checks:
     ${personaConfig.postprocessingChecks.map((check, idx) => `- ${check}`).join("\n")}

If the draft is already close to perfect, make minor refinements and return it.
If there are errors, correct them decisively.

Output ONLY the corrected and polished markdown document starting with "---" and ending with "---" or the conclusion. No explanatory text, notes, or preambles.
`;

  const userPrompt = `
### Source Markdown (Original):
\`\`\`markdown
${sourceContent}
\`\`\`

### Draft Markdown (Pass 1 Translation):
\`\`\`markdown
${draftContent}
\`\`\`
`;

  console.log(`[Pass 2] Inspecting and refining the translation using model '${modelName}'...`);

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
          content: inspectorInstructions.trim()
        },
        {
          role: "user",
          content: userPrompt.trim()
        }
      ],
      stream: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error (Pass 2): ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const refined = result.message?.content?.trim();

  if (!refined) {
    throw new Error("Ollama returned an empty refined translation response.");
  }

  // Double check that it does not contain MD block headers
  let cleanRefined = refined;
  if (cleanRefined.startsWith("```markdown")) {
    cleanRefined = cleanRefined.substring("```markdown".length).trim();
  }
  if (cleanRefined.endsWith("```")) {
    cleanRefined = cleanRefined.substring(0, cleanRefined.length - 3).trim();
  }

  return cleanRefined;
}
