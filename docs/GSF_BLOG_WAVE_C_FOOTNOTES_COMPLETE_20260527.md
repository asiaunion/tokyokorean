# GSF-Blog Wave C footnotes — completion record (2026-05-27)

> **Purpose:** Single SSOT for AG/Cursor after Wave C (numbered `citeSources` + inline footnotes).  
> **Related:** [`FOOTNOTE_ROLLOUT_WAVE_C_AG.md`](./FOOTNOTE_ROLLOUT_WAVE_C_AG.md) · [`FOOTNOTE_ROLLOUT_WAVE_A_AG.md`](./FOOTNOTE_ROLLOUT_WAVE_A_AG.md) · [`BLOG_TRUST_AND_QUALITY_ROADMAP.md`](./BLOG_TRUST_AND_QUALITY_ROADMAP.md)

---

## Executive summary

| Item | Status |
|------|--------|
| **Wave A** | 6 Tokyo-cluster slugs (+ `tokyo-meguro-setagaya` separate) — ✅ on `main` |
| **Wave B** | 4 REIT·rates slugs — ✅ on `main` |
| **Wave C** | 24 slugs (C1–C5 batches) — ✅ on `main` |
| **Wave D** | **Does not exist** — no further footnote rollout waves planned |
| **Coverage** | All **36** published KO posts have `citeSources` in frontmatter (ko/en/ja aligned per slug) |
| **Validation** | Cursor: `SKIP_TRUST_VERIFY=1 pnpm validate:post <slug>` → score 100 for all C slugs |
| **Deploy** | `origin/main` through **`5f3a9b7`** (2026-05-27) |

---

## Wave C batches (all complete)

### C1 — 23-ward & Nihonbashi investment (5)

`tokyo-core-3-wards-chiyoda-chuo-minato`, `tokyo-shinjuku-shibuya-bunkyo`, `tokyo-ward-guide-series-prologue`, `nihonbashi-the-origin-of-japan`, `nihonbashi-mitsui-redevelopment-pipeline-three`

### C2 — Nihonbashi · community · safety (5)

`coredo-nihonbashi-mitsui-redevelopment`, `nihonbashi-hamacho-walking-guide`, `nihonbashi-hamacho-supermarket-peacock-city-life`, `tokyo-korean-community-beyond-shinokubo`, `tokyo-earthquake-vulnerable-five-areas`

### C3 — FX · tax · visa (5)

`weak-yen-korean-japan-asset-allocation-fx-scenarios`, `three-things-when-fx-shakes`, `korea-japan-inheritance-gift-tax-cross-border-basics`, `japan-corporate-vs-personal-rental-after-tax-sketch`, `japan-visa-paths-permanent-business-manager-asset-holders`

### C4 — Tokyo local · life (5)

`ginza-marunouchi-walk-dna`, `ginza-weekend-walking-guide`, `tsukiji-to-toyosu-morning-tokyo`, `tokyo-five-sophisticated-spots`, `tokyo-museums-with-kids-five-picks`

### C5 — Essay · transport (4)

`one-failure-three-lessons-postmortem`, `reading-korea-japan-markets-together`, `why-warm-investing-holds`, `tokyo-yokohama-fuji-transport-pass`

---

## Key commits (footnote rollout)

| Commit | Summary |
|--------|---------|
| `e2aab8b` | Wave C AG guide doc |
| `6ea4c8c` | C1–C2 + partial C3 (ko) |
| `c4c486a` … `09622d7` | C3 remaining locales (incremental) |
| `a1f8ac8` | C3 ja + C4/C5 ko |
| `5f3a9b7` | C4 en/ja + C5 en/ja/ko (final Wave C content push) |

---

## Cursor verification notes (patterns to reuse)

1. **`sources` ⊇ `citeSources`** — every `url`, `portal`, `secondaryUrl`; archives in `sources` as `https://gsfark.com/assets/sources/...` (not bare `/assets/...`).
2. **Wave B lesson** — add missing portal URLs (e.g. `jpx.co.jp`, `boj.or.jp`) to `sources`.
3. **`tier-source-minimum`** — KO `sources` must include at least one `.go.jp` / tier-1 host; e.g. `tokyo-yokohama-fuji-transport-pass` needed `https://www.mlit.go.jp/`.
4. **Life/essay** — 2–4 footnotes on quantitative claims only; `citeSources` count may exceed inline `source-ref` count (validator OK).
5. **Do not** re-open bulk T3, footer disclaimers, or `.svg` in posts.

---

## What AG does next (footnotes)

| Do | Do not |
|----|--------|
| Apply pilot pattern on **new** slugs only (`tokyo-real-estate-investment-complete-guide` or Wave A template) | Re-edit all 36 Wave A/B/C slugs without user request |
| 4–6 footnotes, ko+en+ja same slug | `pnpm validate:post`, git commit, push |
| Hand off: `[AG→Cursor] slug: … / validate:post 요청` | Invent **Wave D** or full-sheet T3 `[x]` |

---

## Reliability program (unchanged)

Trust infra **Phase 0–3 complete**. Remaining work is **not** a new footnote wave:

- [`NEXT_WORK_QUEUE.md`](./NEXT_WORK_QUEUE.md) — GSC, AdSense, monetization MVP
- New posts: DoD in [`BLOG_TRUST_AND_QUALITY_ROADMAP.md`](./BLOG_TRUST_AND_QUALITY_ROADMAP.md)
- T3: **P0-only** — [`fact-audit/T3_POLICY.md`](./fact-audit/T3_POLICY.md)

---

*Last updated: 2026-05-27 · maintainer: Cursor session (Wave C verify + commit push)*
