import { createInterface } from "readline";

/**
 * Perform a line-by-line diff between two strings.
 * Renders changes with ANSI colors.
 * @param {string} oldText Previous version of text (Pass 1).
 * @param {string} newText Refined version of text (Pass 2).
 */
export function renderDiff(oldText, newText) {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  
  let oldIdx = 0;
  let newIdx = 0;

  console.log("\n\x1b[1;36m=== Inspector Refinement Diff (Pass 1 Draft vs Pass 2 Refinement) ===\x1b[0m");

  // A very simplified line diff approach
  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    const oldLine = oldLines[oldIdx] !== undefined ? oldLines[oldIdx] : null;
    const newLine = newLines[newIdx] !== undefined ? newLines[newIdx] : null;

    if (oldLine === newLine) {
      // Unchanged lines (we only print context lines to keep output clean, similar to git diff)
      // Print context only if it is within 2 lines of a change, otherwise skip
      let hasNearbyChange = false;
      for (let i = -2; i <= 2; i++) {
        const oL = oldLines[oldIdx + i];
        const nL = newLines[newIdx + i];
        if (oL !== undefined && nL !== undefined && oL !== nL) {
          hasNearbyChange = true;
          break;
        }
      }

      if (hasNearbyChange) {
        console.log(`  ${oldLine}`);
      }
      oldIdx++;
      newIdx++;
    } else {
      // Mismatch
      if (oldLine !== null && !newLines.slice(newIdx, newIdx + 5).includes(oldLine)) {
        // Line was deleted or changed
        console.log(`\x1b[31m- ${oldLine}\x1b[0m`);
        oldIdx++;
      } else if (newLine !== null) {
        // Line was added or changed
        console.log(`\x1b[32m+ ${newLine}\x1b[0m`);
        newIdx++;
      } else {
        oldIdx++;
      }
    }
  }
  console.log("\x1b[1;36m=====================================================================\x1b[0m\n");
}

/**
 * Display side-by-side comparison of Frontmatter metadata.
 * @param {string} srcMeta Source frontmatter string.
 * @param {string} transMeta Translated frontmatter string.
 */
export function renderFrontmatterReport(srcMeta, transMeta) {
  console.log("\x1b[1;33m=== Metadata Translation Review ===\x1b[0m");
  
  const parseYaml = (yamlStr) => {
    const lines = yamlStr.split("\n");
    const obj = {};
    for (const line of lines) {
      const idx = line.indexOf(":");
      if (idx !== -1) {
        const key = line.substring(0, idx).trim();
        const val = line.substring(idx + 1).trim();
        if (key && !key.startsWith("-")) {
          obj[key] = val;
        }
      }
    }
    return obj;
  };

  const srcObj = parseYaml(srcMeta);
  const transObj = parseYaml(transMeta);

  const keysToReview = ["title", "description", "lang", "category"];
  for (const key of keysToReview) {
    console.log(`\x1b[1m[${key.toUpperCase()}]\x1b[0m`);
    console.log(`  Original:   \x1b[90m${srcObj[key] || "N/A"}\x1b[0m`);
    console.log(`  Translated: \x1b[32m${transObj[key] || "N/A"}\x1b[0m`);
  }
  console.log("\x1b[1;33m====================================\x1b[0m\n");
}

/**
 * Launch interactive readline HITL gate.
 * @param {string} promptMessage Question to display.
 * @returns {Promise<boolean>} Resolves to true if approved, false otherwise.
 */
export function askApproval(promptMessage) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`\x1b[1;35m${promptMessage}\x1b[0m`, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      if (normalized === "y" || normalized === "yes" || normalized === "") {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}
