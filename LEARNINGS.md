# GSF-Blog Learnings

## 2026-04-22 - GSF-Blog Stabilization Session
- **Markdown Strikethrough Rendering**: The `~` character in Astro/Markdown-it can trigger strikethrough even without double tildes in some configurations. Numeric ranges (e.g., `18~25㎡`) must be escaped as `\~` to prevent unwanted horizontal lines.
- **Multilingual Layout Flow**: Avoid `absolute` positioning for core header elements like logos. Language-specific text length variations (e.g., "Posts" vs "記事一覧") can cause silent overlaps on narrow screens if elements are removed from the standard flex/grid flow.
- **YAML Integrity**: Automated scripts are essential for syncing `references` and `sources` across 40+ multilingual files to pass strict Astro content collection schema validation.
- **Deployment Safety**: When performing bulk regex replacements (e.g., escaping tildes), ensure the target range excludes YAML frontmatter to prevent build-breaking syntax errors.
