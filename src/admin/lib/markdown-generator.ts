export function generateMarkdown(frontmatter: any, bodyMd: string): string {
  const yamlLines = [];
  yamlLines.push("---");
  
  for (const [key, value] of Object.entries(frontmatter)) {
    if (Array.isArray(value)) {
      yamlLines.push(`${key}:`);
      for (const item of value) {
        yamlLines.push(`  - "${String(item).replace(/"/g, '\\"')}"`);
      }
    } else if (typeof value === "string") {
      // Escape quotes if needed
      if (value.includes('"') || value.includes(':') || value.includes('\\n')) {
        yamlLines.push(`${key}: "${value.replace(/"/g, '\\"')}"`);
      } else {
        yamlLines.push(`${key}: ${value}`);
      }
    } else {
      yamlLines.push(`${key}: ${value}`);
    }
  }
  
  yamlLines.push("---");
  yamlLines.push("");
  yamlLines.push(bodyMd);
  yamlLines.push("");
  
  return yamlLines.join("\n");
}
