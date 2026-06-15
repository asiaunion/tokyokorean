# Blog chart assets

**Full guide:** [`docs/CHARTS_AND_VISUALS.md`](../../docs/CHARTS_AND_VISUALS.md) — architecture, lessons learned, label/color spec, MDX templates, agent rules.

## Quick reference

| Approach | When to use | Page weight |
|---|---|---|
| **Static WebP** (`public/assets/images/blog/*.webp`) | Data charts, supplemental context | ~17–35 KB (cached) |
| **Diagram WebP** (`public/assets/images/blog/diagrams/*.webp`) | Simple diagrams (ship in posts) | ~5–15 KB |
| **SVG source** (`svg/*.svg`) | Edit only — run `pnpm diagrams:render` | — |
| **Inline SVG in MD/MDX** | **Avoid** — Shiki/code-block risk, broken XML | — |
| **AI-generated chart images** | **Never** — wrong data/labels | — |

## macro-barrier Korea YoY chart

```bash
# 1. Edit data
vim public/data/macro-barrier-chart-source.csv

# 2. Regenerate (requires Python 3 + matplotlib)
python3 scripts/charts/generate-macro-barrier-chart.py

# 3. Commit WebP + script, build, deploy
pnpm run build
npx vercel deploy --prebuilt --prod --yes
```

| Output | Path |
|--------|------|
| WebP | `public/assets/images/blog/macro-barrier-seoul-outskirts-yoy.webp` |
| CSV | `public/data/macro-barrier-chart-source.csv` |
| Generator | `scripts/charts/generate-macro-barrier-chart.py` |

### Style (final)

- Economist layout: green accent stripe, Y-axis right, direct labels (no legend box).
- **Seoul** line/label: `#047857` — anchor at '25 Q2 peak, offset `(12, 18)`.
- **Outskirts** line: `#a7f3d0` — label `#059669` between **'25 Q2 and '25 Q3** (`x=5.5`).
- Gyeonggi/Incheon, DSR, −28.4%: **figcaption only** (per language in MDX).

Posts use `<figure class="supplemental-chart">` (see `docs/CHARTS_AND_VISUALS.md` §5).  
Diagram smoke: `docs/DIAGRAM_POST_SMOKE_CHECKLIST.md`.
