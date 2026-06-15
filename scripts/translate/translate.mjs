#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, basename, dirname, join } from "path";
import { pass1Translate } from "./pass1-translate.mjs";
import { pass2Inspect } from "./pass2-inspect.mjs";
import { renderDiff, renderFrontmatterReport, askApproval } from "./pass3-diff-report.mjs";

async function main() {
  const rawArgs = process.argv.slice(2);
  const hasYesFlag = rawArgs.includes("--yes") || rawArgs.includes("-y");
  const args = rawArgs.filter(arg => arg !== "--yes" && arg !== "-y");
  
  if (args.length < 2) {
    console.error("\x1b[31mError: Missing required arguments.\x1b[0m");
    console.log("Usage: node scripts/translate/translate.mjs <source_file_path> <target_lang> [model_name] [--yes]");
    console.log("Example: node scripts/translate/translate.mjs src/data/blog/ko/my-post.md ja gemma2:9b --yes");
    process.exit(1);
  }

  const sourcePath = resolve(args[0]);
  const targetLang = args[1].toLowerCase();
  const modelName = args[2] || "gemma2:9b";

  if (targetLang !== "en" && targetLang !== "ja") {
    console.error(`\x1b[31mError: Target language must be either 'en' or 'ja'. Received: '${targetLang}'\x1b[0m`);
    process.exit(1);
  }

  console.log(`\n\x1b[1;34m=== GSF-Blog 3-Pass Translation Pipeline Initiated ===\x1b[0m`);
  console.log(`Source File: ${sourcePath}`);
  console.log(`Target Language: ${targetLang.toUpperCase()}`);
  console.log(`Ollama Model: ${modelName}`);
  console.log(`Auto Approve (--yes): ${hasYesFlag}`);

  let sourceContent;
  try {
    sourceContent = readFileSync(sourcePath, "utf-8");
  } catch (error) {
    console.error(`\x1b[31mError reading source file: ${error.message}\x1b[0m`);
    process.exit(1);
  }

  // 1. Parse Frontmatter vs Body for preview/report purposes
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---/;
  const match = sourceContent.match(frontmatterRegex);
  const sourceFrontmatter = match ? match[1] : "";

  try {
    // --- Pass 1: Translate ---
    console.log(`\n\x1b[33m[Pass 1/3] Translating original content...\x1b[0m`);
    const draftContent = await pass1Translate(sourceContent, targetLang, modelName);
    console.log(`\x1b[32m✔ Pass 1 completed successfully.\x1b[0m`);

    // --- Pass 2: Inspect and Refine ---
    console.log(`\n\x1b[33m[Pass 2/3] Inspecting and polishing draft...\x1b[0m`);
    const finalContent = await pass2Inspect(sourceContent, draftContent, targetLang, modelName);
    console.log(`\x1b[32m✔ Pass 2 completed successfully.\x1b[0m`);

    // --- Pass 3: Diff Report and HITL Gate ---
    console.log(`\n\x1b[33m[Pass 3/3] Preparing reports and awaiting approval...\x1b[0m`);
    
    // Parse refined frontmatter for report
    const transMatch = finalContent.match(frontmatterRegex);
    const transFrontmatter = transMatch ? transMatch[1] : "";

    // Show reports
    renderFrontmatterReport(sourceFrontmatter, transFrontmatter);
    renderDiff(draftContent, finalContent);

    // Formulate target save path
    const fileBase = basename(sourcePath);
    // Find target base directory based on typical GSF-Blog layout
    // Source: src/data/blog/ko/filename.md -> Target: src/data/blog/ja/filename.md
    const sourceDir = dirname(sourcePath);
    const blogDataDir = dirname(sourceDir); // points to src/data/blog
    const targetDir = join(blogDataDir, targetLang);
    const targetPath = join(targetDir, fileBase);

    console.log(`Destination Path: ${targetPath}`);

    let approved = false;
    if (hasYesFlag) {
      console.log(`\n\x1b[32m✔ --yes flag detected. Skipping interactive approval and saving directly.\x1b[0m`);
      approved = true;
    } else {
      approved = await askApproval("Do you approve and want to save this translation? [Y/n] : ");
    }

    if (approved) {
      mkdirSync(targetDir, { recursive: true });
      writeFileSync(targetPath, finalContent, "utf-8");
      console.log(`\n\x1b[1;32m✔ Success! Translation successfully written to: ${targetPath}\x1b[0m\n`);
    } else {
      console.log(`\n\x1b[33m⚠️ Save cancelled by user. Translation NOT saved.\x1b[0m\n`);
      process.exit(1);
    }

  } catch (error) {
    console.error(`\n\x1b[31m❌ Pipeline execution failed: ${error.message}\x1b[0m\n`);
    process.exit(1);
  }
}

main();
