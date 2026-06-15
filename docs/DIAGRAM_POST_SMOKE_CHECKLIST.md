# Diagram (WebP) post smoke checklist

Blog diagrams ship as **WebP** under `public/assets/images/blog/diagrams/`.  
Source SVG lives in `public/assets/images/blog/svg/` for editing only — **posts must not link `.svg`**.

Full pipeline: [`CHARTS_AND_VISUALS.md`](./CHARTS_AND_VISUALS.md) §8.

## Regenerate after SVG edit

```bash
pnpm diagrams:sanitize
pnpm diagrams:render
```

## Automated smoke (production)

```bash
pnpm verify:diagram-posts
# Staging: BASE_URL=https://your-preview.vercel.app pnpm verify:diagram-posts
```

Checks per post with a diagram reference:

| # | Check |
|---|--------|
| 1 | Post HTTP 200, no `noindex` |
| 2 | HTML contains `/assets/images/blog/diagrams/{locale}-{slug}.webp` |
| 3 | WebP HTTP 200, image content-type |

## Manual spot (optional)

Open one P0 post per cluster after a diagram change:

- `japan-corporate-vs-personal-rental-after-tax-sketch`
- `japan-real-estate-three-things`
- `j-reit-five-things-to-know`

Confirm: no broken image icon; labels readable on mobile.

## Deprecated

[`SVG_POST_SMOKE_CHECKLIST.md`](./SVG_POST_SMOKE_CHECKLIST.md) — kept for history; do not use `verify:svg-posts` for new work.
