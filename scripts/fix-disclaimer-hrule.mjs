import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".md")) {
      let s = readFileSync(p, "utf8");
      const fixed = s.replace(
        /\n---\n\n<div class="post-disclaimer">/g,
        "\n\n<div class=\"post-disclaimer\">"
      );
      if (fixed !== s) writeFileSync(p, fixed);
    }
  }
}

walk(fileURLToPath(new URL("../src/data/blog", import.meta.url)));
