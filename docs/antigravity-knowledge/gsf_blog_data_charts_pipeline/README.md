# GSF-Blog data charts pipeline

**Canonical doc:** [`docs/CHARTS_AND_VISUALS.md`](../../CHARTS_AND_VISUALS.md)

## One-line policy

CSV → `scripts/charts/generate-*.py` → WebP in `public/assets/images/blog/` → MDX `<figure class="supplemental-chart">`. No inline SVG, no AI chart images, no heavy Astro chart components.

## Macro-barrier (reference)

```bash
python3 scripts/charts/generate-macro-barrier-chart.py
```

Final label placement: **Seoul** at '25 Q2 peak; **Outskirts** between '25 Q2 and '25 Q3. Colors: Seoul `#047857`, Outskirts `#a7f3d0`, label `#059669`.

## Incidents this replaces

- Shiki code block instead of SVG (broken MDX HTML)
- `MacroBarrierChart.astro` bloat / agent token churn
- Matrix appended at post footer via layout (fixed: matrix in MDX after intro)
