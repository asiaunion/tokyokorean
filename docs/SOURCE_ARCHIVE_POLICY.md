# Source archive policy (GSF-Blog)

## Purpose

Some tier-1 publishers rotate or retire monthly PDF/XLS URLs. We keep **read-only snapshots** under `public/assets/sources/` so readers can verify headline statistics when external navigation fails.

## When to archive

- Monthly REINS Market Watch, MLIT press PDFs, Miki office market XLS, Tokyo Kantei monthly PDFs cited in **body inline links**.
- Do **not** bulk-archive entire domains; only files tied to a manifest claim.

## Naming

`{publisher}-{YYYYMM}-{topic-slug}.{pdf|xlsx}` — examples:

- `reins-202604-marketwatch.pdf`
- `mlit-202511-mansion-foreign-buyer.pdf`
- `miki-202603-tokyo-office-market.xlsx`

## Numbered citations (pillar pilot)

Posts may define `citeSources` in frontmatter and use inline superscripts:

```html
<sup class="source-ref"><a href="#source-1" id="cite-1">1</a></sup>
```

`SourcesList` renders matching anchors `id="source-1"` with **공식 / PDF / 보관 / 포털** links. Prefer this over long inline link chains.

Legacy dual-link pattern (cluster posts) is still valid:

```markdown
([기관명 공식, YYYY-MM](https://official/url) · [검증용 보관본](/assets/sources/file.pdf))
```

## Legal / attribution

- Government (MLIT) press PDFs: link to official page; archive labeled “2026-05-26 스냅샷”.
- REINS / Kantei / Miki: archive is for **verification convenience**; rights remain with the publisher. Do not imply endorsement.
- On material refresh, add a new file; keep prior archive for posts that still cite that period.

## Manifest

One YAML per high-trust slug: `docs/fact-audit/sources/<slug>.sources.yaml`.

## Health check

```bash
node scripts/check-source-urls.mjs
node scripts/check-source-urls.mjs tokyo-real-estate-investment-complete-guide
```
