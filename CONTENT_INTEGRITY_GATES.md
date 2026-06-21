# Content Integrity Gates

The blog content schema includes integrity gates for source quality checks.

## TokyoKorean (essay / lived-experience) — default policy

TokyoKorean is a **personal essay and life-archive blog**, not an investment fact-sheet site.

| Layer | Policy |
|-------|--------|
| **CI** (`blog-content-integrity.yml`) | `CONTENT_INTEGRITY_REQUIRE_SOURCES=false` — sources optional on all posts |
| **Schema** | If `sources:` is present → still requires ≥2 unique domains; `references` ⊆ `sources` |
| **`pnpm validate:post`** | `BLOG_VALIDATION_PROFILE=essay` (default in this repo) — shorter posts OK; sources optional |
| **AdSense EEAT** | Factual posts (banking, healthcare, housing, etc.) may add `sources` voluntarily — not CI-mandatory |

Strict investment-style validation remains available:

```bash
pnpm validate:post:strict <slug>
CONTENT_INTEGRITY_REQUIRE_SOURCES=true CONTENT_INTEGRITY_MIN_SOURCES=2 pnpm exec astro check
```

## Frontmatter fields

- `sources`: URL list of collected source materials
- `references`: URL list cited in final post output

Rule:
- Every URL in `references` must exist in `sources`.

## Source diversity gate

- When `sources` is present, at least `CONTENT_INTEGRITY_MIN_SOURCES` unique domains are required.
- Default minimum: `2`

## Strict mode (GSF-Ark / investment posts only)

Set environment variables:

```bash
CONTENT_INTEGRITY_REQUIRE_SOURCES=true
CONTENT_INTEGRITY_MIN_SOURCES=3
BLOG_VALIDATION_PROFILE=investment
```

In strict mode:
- Non-draft posts require at least `CONTENT_INTEGRITY_MIN_SOURCES` source URLs.
- This runs during content schema validation (`astro check` and build).

## Local examples

Two example files are provided for quick reference:

- Pass example: `src/data/blog/_integrity-example-pass.md`
- Fail example: `src/data/blog/_integrity-example-fail.md`

Both files are excluded from content loading because they start with `_`.
