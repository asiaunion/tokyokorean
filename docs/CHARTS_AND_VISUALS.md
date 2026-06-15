# Charts and visuals (GSF-Blog)

**Status:** Approved pattern (2026-05-22, macro-barrier pilot)  
**Audience:** Authors, agents (Cursor/Antigravity), and future chart work on GSF-Blog.

This document captures what we learned fixing the macro-barrier Korea YoY chart and related layout issues, so the same mistakes are not repeated.

---

## 1. Executive summary

| Do | Don't |
|----|--------|
| **CSV** as source of truth → **Python/matplotlib** → **static WebP** in `public/assets/images/blog/` | Inline multi-line `<svg>` in MD/MDX |
| `<figure class="supplemental-chart">` + per-language `<figcaption>` in MDX | Astro chart components that embed huge SVG in HTML |
| Economist-style **direct labels** in **empty plot space** | Legend boxes over data; labels on pale lines at trough |
| Image: short English series names only; **detail in figcaption** (KO/EN/JA) | Gemini/AI-generated chart images (wrong numbers) |
| Simple diagrams: **SVG source** → `scripts/render-diagrams-to-webp.mjs` → **WebP** in `public/assets/images/blog/diagrams/` | Raw `.svg` in markdown (`&`, `<` break XML → broken `<img>`) |

**Reference post:** `macro-barrier-and-super-scarce-real-estate-selection` (KO/EN/JA MDX).

---

## 2. What went wrong (and why)

### 2.1 Inline SVG rendered as a code block

**Symptom:** Chart appeared as a syntax-highlighted code fence on production.

**Cause:** CommonMark/Astro markdown treats multi-line raw HTML/SVG as fragile. Blank lines inside `<svg>`, lines that do not start with `<`, or mixed MD + HTML break the block; Shiki then highlights the “code”.

**Fix:** Remove inline SVG from MDX. Ship a pre-rendered asset instead.

### 2.2 `MacroBarrierChart.astro` (~11KB)

**Problems:**

- High token cost for agents editing SVG paths
- Duplicated logic across iterations; easy to drift from CSV data
- Bloated HTML on every page view

**Fix:** Deleted component. Replaced with `scripts/charts/generate-macro-barrier-chart.py` → single WebP (~17–20KB, cached).

### 2.3 `MacroMicroMatrix` at end of post

**Symptom:** Matrix cards appeared after the full article (footer feel).

**Cause:** `PostDetails.astro` appended `<MacroMicroMatrix>` after `<Content />`.

**Fix:** Import matrix in MDX **after the intro** (where editorial flow needs it). Copy lives in `src/data/blog/macro-barrier-matrix.ts`. Layout no longer auto-injects the matrix.

### 2.4 Label and color iteration (UX)

User feedback drove the final spec:

1. Bottom-right-only labels → too cramped; reverted to Economist **direct labels**.
2. Economist cyan/red → **GSF greens** (blog identity).
3. Dark + light green pair: Seoul **deeper**, Outskirts **paler** for contrast.
4. Outskirts label on trough / pale line → poor legibility; anchor in **whitespace** like Seoul.
5. Final Outskirts label: **between '25 Q2 and '25 Q3** (`x=5.5`, mid-segment y), offset `(12, 18)` pt — same pattern as Seoul at peak index `5`.

---

## 3. Approved architecture

```text
public/data/{slug}-chart-source.csv
        ↓
scripts/charts/generate-{slug}-chart.py   # matplotlib → WebP
        ↓
public/assets/images/blog/{slug}.webp
        ↓
src/data/blog/{ko,en,ja}/{slug}.mdx     # <figure class="supplemental-chart">
```

**Build:** WebP is a static asset; no runtime chart library. Regenerate after CSV/script changes, commit WebP, then `pnpm run build` and deploy.

**Dependencies:** Python 3 + `matplotlib` (local/dev only; not bundled in Astro build).

---

## 4. Visual design spec (macro-barrier chart)

### 4.1 Layout (Economist-inspired)

- Left **accent stripe** on title row (GSF green, not Economist red).
- Title + subtitle on warm gray header (`#F5F5F0`).
- Plot on white; **Y-axis on the right**; horizontal grid only; no legend box.
- Subtle plot frame (`FancyBboxPatch`).

### 4.2 Colors (final)

| Role | Hex | Notes |
|------|-----|--------|
| Title stripe + **Seoul** line + Seoul label | `#047857` | emerald-700, primary series |
| **Outskirts** line | `#a7f3d0` | emerald-200, pale for contrast |
| **Outskirts** label text | `#059669` | emerald-600, readable on pale line |
| Text / grid | `#1A1A1A`, `#6B6B6B`, `#D8D8D8` | |

Site CSS accent (`--accent`) is theme-dependent (`#0f4d22` light / `#34d399` dark). Chart PNG/WebP uses **fixed hex** for consistent print/social previews; align semantically with brand green, not necessarily pixel-match dark mode.

### 4.3 Direct label rules

1. **No legend box** over the plot.
2. Anchor on the **series** (`xy`), place text in **empty space** (`xytext` offset points).
3. **Seoul:** index `5` ('25 Q2 peak), `xytext=(12, 18)`, `va="bottom"`.
4. **Outskirts:** `mid_x = 5.5` between Q2/Q3 2025, `mid_y = (outskirts[5]+outskirts[6])/2`, same offset, label color `OUTSKIRTS_LABEL_COLOR`.
5. Keep chart image labels **short English** (`Seoul`, `Outskirts`); put Gyeonggi/Incheon, DSR, −28.4%, sources in **figcaption** per language.

### 4.4 Supplemental chart semantics

Japan-focused post; Korea YoY chart is **reference only**. CSS `.supplemental-chart` limits width (`max-width: 36rem`) and uses `#f5f5f0` background to match chart header.

---

## 5. MDX integration

### 5.1 Figure (all locales)

```mdx
<figure class="supplemental-chart">
  <img
    src="/assets/images/blog/macro-barrier-seoul-outskirts-yoy.webp"
    alt="…localized alt…"
    width="800"
    height="380"
    loading="lazy"
    decoding="async"
  />
  <figcaption>
    <strong>[Figure 1]</strong> …localized detail, sources…
  </figcaption>
</figure>
```

### 5.2 Macro–micro matrix (same post, separate concern)

```mdx
import MacroMicroMatrix from "@/components/blog/MacroMicroMatrix.astro";
import { macroBarrierMatrixKo as macroBarrierMatrix } from "@/data/blog/macro-barrier-matrix";

<MacroMicroMatrix data={macroBarrierMatrix} />
```

Place **after intro**, not via layout footer. Data: `src/data/blog/macro-barrier-matrix.ts` (`macroBarrierMatrixKo|En|Ja`).

---

## 6. Agent / translation rules

From `scripts/translate/README.md` and production lessons:

1. **Never** reintroduce inline `<svg>` charts in translated MDX.
2. **Never** use AI image models for data charts.
3. When translating posts with charts, preserve `<figure class="supplemental-chart">` structure; translate `alt` and `figcaption` only.
4. Regenerate WebP from CSV if numbers change; do not hand-edit WebP.
5. Prefer editing `generate-*.py` + CSV over pasting SVG paths in chat (token cost).

---

## 7. Adding a new data chart (checklist)

- [ ] Add `public/data/{name}-chart-source.csv` (document columns, sources).
- [ ] Add `scripts/charts/generate-{name}-chart.py` (or extend shared helper later).
- [ ] Output to `public/assets/images/blog/{name}.webp`.
- [ ] Add `.supplemental-chart` figure to KO MDX; mirror EN/JA with localized figcaption.
- [ ] Run `python3 scripts/charts/generate-{name}-chart.py` and commit **both** script and WebP.
- [ ] `pnpm run build` locally.
- [ ] Deploy: `pnpm run build` then `npx vercel deploy --prebuilt --prod --yes` (repo upload size limits apply).

---

## 8. Static diagrams (flow boxes, sketches)

For **non–time-series** diagrams:

1. Edit source SVG under `public/assets/images/blog/svg/` (authoring only).
2. `python3 scripts/sanitize_svg_xml.py` — escape `&`, `<` inside `<text>` nodes.
3. `node scripts/render-diagrams-to-webp.mjs` — outputs `public/assets/images/blog/diagrams/*.webp`.
4. Reference in markdown: `![alt](/assets/images/blog/diagrams/{lang}-{slug}.webp)`.

**Never** link `.svg` from posts — browsers and CDNs serve invalid XML as broken images.

Do not mix large inline SVG into MDX for the same reasons as charts.

---

## 9. File map (macro-barrier)

| Path | Role |
|------|------|
| `public/data/macro-barrier-chart-source.csv` | Data source |
| `scripts/charts/generate-macro-barrier-chart.py` | Generator |
| `scripts/charts/README.md` | Quick commands |
| `public/assets/images/blog/macro-barrier-seoul-outskirts-yoy.webp` | Shipped asset |
| `src/styles/global.css` | `.supplemental-chart` |
| `src/data/blog/{ko,en,ja}/macro-barrier-….mdx` | Figure + matrix placement |
| `src/data/blog/macro-barrier-matrix.ts` | Matrix copy SSOT |
| `src/components/blog/MacroMicroMatrix.astro` | Matrix UI |

**Removed:** `src/components/blog/MacroBarrierChart.astro`

---

## 10. Deploy note

Chart changes are **asset + MDX** only; no special Astro integration. After WebP regen, full build + prebuilt Vercel prod deploy is the established path (see `BLOG_AGENT_AUTOMATION_RUNBOOK.md` / postmortem docs).

---

## 11. Revision log (chart styling)

| Commit | Change |
|--------|--------|
| WebP pipeline | Drop inline SVG / `MacroBarrierChart.astro` |
| Economist layout | Red stripe, cyan/red series, peak/trough labels |
| Brand green | `#10b981` stripe; bottom-right labels experiment |
| Restored Economist labels | Peak + trough placement |
| Green contrast | Seoul `#10b981`, Outskirts `#6ee7b7` |
| Dark/light greens | Seoul `#047857`, Outskirts `#a7f3d0`; Outskirts label in early gap |
| Label position | Outskirts label between **'25 Q2–'25 Q3** (`x=5.5`) — **final** |

---

## 12. Related docs

- `scripts/charts/README.md` — command cheat sheet
- `scripts/translate/README.md` — chart policy for translation
- `design-baseline.md` — approved UI states
- `docs/antigravity-knowledge/gsf_blog_tokyo_svg_rendering_issue/` — SVG-in-markdown pitfalls (Tokyo series)
