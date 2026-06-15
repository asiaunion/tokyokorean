# Fact audit (AG → Cursor)

**Start here for trust ops:** [`../BLOG_TRUST_AND_QUALITY_ROADMAP.md`](../BLOG_TRUST_AND_QUALITY_ROADMAP.md)  
**Session archive (2026-05-25):** [`../GSF_BLOG_SESSION_ARCHIVE_20260525.md`](../GSF_BLOG_SESSION_ARCHIVE_20260525.md)

## Lifecycle

| Phase | Owner | Output |
|-------|--------|--------|
| 1 | **AG** | `INDEX.md`, `<slug>.md`, `AG_PHASE1_REPORT.md` |
| 2 | **Cursor** | gates 35/35, content fixes — [`CURSOR_PHASE2_REPORT.md`](./CURSOR_PHASE2_REPORT.md) |
| 2.5b | **AG** | Deep/Standard/Light 전체 35 — [`../AG_PHASE2_CONTENT_FIX_PROMPT.md`](../AG_PHASE2_CONTENT_FIX_PROMPT.md) |
| 3 | **Cursor** | **완료** — P0 T3, INDEX — [`T3_POLICY.md`](./T3_POLICY.md) · [`CURSOR_PHASE3_REPORT.md`](./CURSOR_PHASE3_REPORT.md) |

## INDEX authority

| Column | Who sets it | Meaning |
|--------|-------------|---------|
| P, claims, drift, T0–T3 notes | **AG** (expected) | Working hypothesis |
| **validate** | **Cursor** (authoritative) | `pnpm validate:post` or `pnpm trust:update-index` |
| sheet ✓ in Claims | **AG then Cursor** | Not valid until specific URL + human or T3 PASS |

Do not treat AG drafts as verified until Cursor sign-off.

## Claims table rules

1. Every KO numeric/date/legal threshold → a **Claims** row.
2. **Tier-1 source URL** must be a **specific page** (statute section, press release, data table).
3. **Forbidden:** `https://www.mlit.go.jp/` (homepage only) with `[x]` — use `trust:verify-sources` or fix URL.
4. **UNCERTAIN** from T3 → hard block until row has `Verified ✓ (AG|Cursor, date, snippet)` and re-run verify.

## Commands

```bash
pnpm trust:extract <slug>
pnpm trust:verify-sources <slug>
pnpm validate:post <slug>          # full gates + trust
SKIP_TRUST_VERIFY=1 pnpm validate:post <slug>
pnpm trust:update-index
pnpm trust:check-source-urls [slug]   # manifest + archive files (see SOURCE_ARCHIVE_POLICY)
node scripts/tokyo-source-url-spot.mjs  # Tokyo headline PDF/XLS spot
```

**Source archives (dual-link):** [`../SOURCE_ARCHIVE_POLICY.md`](../SOURCE_ARCHIVE_POLICY.md) · [`../TOKYO_REINS_KANTEI_URL_RULES.md`](../TOKYO_REINS_KANTEI_URL_RULES.md) · manifests in [`sources/`](./sources/)

## Templates

- [`../templates/blog-fact-sheet.md`](../templates/blog-fact-sheet.md)
- [`../templates/blog-translation-audit.md`](../templates/blog-translation-audit.md)

**AG batch prompt:** [`../AG_BATCH_FACT_CHECK_PROMPT.md`](../AG_BATCH_FACT_CHECK_PROMPT.md)

## Sign-off (publish bar)

Per [`T3_POLICY.md`](./T3_POLICY.md):

1. Claims: **body + P0** rows with **specific** tier-1 URLs (homepage-only `[x]` forbidden).
2. P0 slugs: primary claim verified — P0 spot table or `Verified ✓ (Cursor, date, snippet)`.
3. `SKIP_TRUST_VERIFY=1 pnpm validate:post <slug>` exit 0.
4. `pnpm trust:update-index` after sheet edits.

Full-sheet network T3 on every row is **not** required.

## UNCERTAIN queue (T3 hard block)

When `pnpm trust:verify-sources <slug>` or `validate:post` reports UNCERTAIN:

| Step | Owner | Action |
|------|--------|--------|
| 1 | AG or Cursor | Open URL; confirm or fix value in ko/en/ja |
| 2 | AG | Replace generic URL with specific page; or soften/remove claim |
| 3 | Cursor | Mark `Verified ✓` in sheet; re-run verify |
| 4 | — | `validate:post` must exit 0 before publish |

Do not downgrade UNCERTAIN to warning-only (roadmap policy).
