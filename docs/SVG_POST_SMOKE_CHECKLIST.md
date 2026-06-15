# SVG post smoke checklist (deprecated)

> **Use instead:** [`DIAGRAM_POST_SMOKE_CHECKLIST.md`](./DIAGRAM_POST_SMOKE_CHECKLIST.md)  
> Posts link **WebP** in `public/assets/images/blog/diagrams/`, not `.svg`.

## Why deprecated

Raw SVG in `<img src="…svg">` broke when XML was invalid (`&`, `<` in `<text>`). Pipeline is now:

`svg/` (edit) → `pnpm diagrams:sanitize` → `pnpm diagrams:render` → `diagrams/*.webp`

See [`CHARTS_AND_VISUALS.md`](./CHARTS_AND_VISUALS.md) §8.

## Legacy command (do not use for release)

```bash
# Replaced by:
pnpm verify:diagram-posts
```

`node scripts/verify-svg-posts.mjs` remains in repo for old audits only.
