# Content Integrity Gates

The blog content schema includes integrity gates for source quality checks.

## Frontmatter fields

- `sources`: URL list of collected source materials
- `references`: URL list cited in final post output

Rule:
- Every URL in `references` must exist in `sources`.

## Source diversity gate

- When `sources` is present, at least `CONTENT_INTEGRITY_MIN_SOURCES` unique domains are required.
- Default minimum: `2`

## Strict mode (recommended for production workflows)

Set environment variables:

```bash
CONTENT_INTEGRITY_REQUIRE_SOURCES=true
CONTENT_INTEGRITY_MIN_SOURCES=3
```

In strict mode:
- Non-draft posts require at least `CONTENT_INTEGRITY_MIN_SOURCES` source URLs.
- This runs during content schema validation (`astro check` and build).

## Local examples

Two example files are provided for quick reference:

- Pass example: `src/data/blog/_integrity-example-pass.md`
- Fail example: `src/data/blog/_integrity-example-fail.md`

Both files are excluded from content loading because they start with `_`.

