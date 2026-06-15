# Wave A — numbered footnotes rollout (AG instructions)

> **Pilot reference:** `tokyo-real-estate-investment-complete-guide` (ko/en/ja) — copy the same `citeSources` + `<sup class="source-ref">` pattern.  
> **Cursor:** AG finishes → user sends one line: `Wave A slug <name> — 발행 전 검증 부탁`  
> **Do not** split a post by chapter; complete **one slug (ko + en + ja)** per AG session.

---

## Fixed rules (non‑negotiable)

Read first: repo root [`AGENTS.md`](../AGENTS.md) · [`docs/fact-audit/T3_POLICY.md`](./fact-audit/T3_POLICY.md)

| Rule | Detail |
|------|--------|
| Locales | `src/data/blog/{ko,en,ja}/<slug>.md` — **same slug** |
| Footnote count | **4~6 per post** (not pillar-level 17) |
| `sources` | Every URL in `citeSources` (`url`, `portal`, `secondaryUrl`, `archive` path as https URL if listed) must appear in `sources: []` |
| `citeSources` | Numbered list; order = footnote #1, #2, … |
| Inline HTML | `<sup class="source-ref"><a href="#source-N" id="cite-N">N</a></sup>` on **first** mention of each cited claim only |
| Second ref same # | `<sup class="source-ref"><a href="#source-N">N</a></sup>` (no duplicate `id="cite-N"`) |
| Disclaimer | **Never** add `## 면책` / footer disclaimer in `.md` — `PostDisclaimer` only |
| Diagrams | Link **`/assets/images/blog/diagrams/*.webp` only** — no `.svg`, no inline `<svg>` |
| URLs | Prefer **Pillar URL cheat sheet** below — no homepage-only URLs as sole cite |
| ISA / MOJ | Use `https://www.moj.go.jp/isa/...` not `isa.go.jp/ko/...` paths that 301 to home |
| Handoff | End with: `[AG→Cursor] slug: <slug> / ko·en·ja citeSources+footnotes 반영 / validate:post 요청` |

---

## Pillar URL cheat sheet (reuse)

| Topic | Primary URL | Archive (if any) |
|-------|-------------|------------------|
| Livable 諸費用 7~10% | `https://cs1.livable.co.jp/kounyu/loan/money_plan.html` | — |
| Livable 手付金 5~10% | `https://www.livable.co.jp/l-note/question/g12987/` | — |
| MOJ Affidavit (non-resident registration) | `https://www.moj.go.jp/MINJI/minji05_00494.html` | — |
| Tokyo fixed asset tax 1.4% | `https://www.tax.metro.tokyo.lg.jp/kazei/real_estate/kotei_tosi` | — |
| NTA acquisition tax (rates) | `https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2100.htm` or joto pages — use page that states the % you cite | — |
| Kantei 70㎡ 6-ward prices | `https://www.kantei.ne.jp/wp-content/uploads/c2025.pdf` | `/assets/sources/kantei-2025-chukomansion.pdf` |
| REINS market watch | `https://www.reins.or.jp/pdf/trend/mw/mw_202604_summary.pdf` | `/assets/sources/reins-202604-marketwatch.pdf` |
| Tokyo rental law PDF | `https://www.juutakuseisaku.metro.tokyo.lg.jp/juutaku_seisaku/tintai/pdf/310-6-jyuutaku_eng.pdf` | — |

---

## Frontmatter template

```yaml
sources:
  - "https://..."   # include ALL citeSources URLs + portals
citeSources:
  - label: "Short Korean/English/Japanese label, YYYY-MM"
    url: "https://..."
    archive: "/assets/sources/....pdf"   # optional, only if file exists under public/
    secondaryUrl: "https://..."          # optional
    portal: "https://..."                # optional agency home
```

**EN/JA:** same URLs; translate `label` only.

---

## Inline footnote template

```html
<sup class="source-ref"><a href="#source-1" id="cite-1">1</a></sup>
```

---

## Wave A — six slugs (one session each)

### 1. `tokyo-buying-process-step-by-step`

**Role:** Pillar Ch.2 deep dive.

| # | Cite this claim (first mention) | Suggested source |
|---|--------------------------------|------------------|
| 1 | 비거주자 Affidavit / MOJ registration | MOJ `minji05_00494.html` |
| 2 | 부대비용 **7~10%** (if you add or align with pillar; if body keeps 8~12%, add one line: “Livable 기준 7~10%, 시뮬레이션은 ×1.12~1.18”) | Livable `money_plan.html` |
| 3 | 계약금 **5~10%** | Livable `g12987` |
| 4 | 취득세 토지 1.5% / 건물 3~4% (Step 1 table) | NTA or MLIT acquisition-tax page — tier-1 only |
| 5 | (optional) 중개 수수료 상한 “3% + 6만” | MLIT or Fair Trade Commission broker guideline if you find stable URL; else skip |

**Do not** footnote every row in the cost table — only headline thresholds.

---

### 2. `japan-real-estate-three-things`

**Role:** Intro tax primer; replace weak `sources` (mlit home, jnto) with specific pages.

| # | Cite this claim | Suggested source |
|---|-----------------|------------------|
| 1 | 고정자산세 **1.4%** | Tokyo `kotei_tosi` or NTA fixed-asset overview |
| 2 | 취득세 토지 **3%** / 건물 **4%** | NTA acquisition-tax answer (verify % on page) |
| 3 | 등록면허세 **2%** (매매) | NTA / registration license tax page |
| 4 | (optional) 소비세 **10%** | NTA consumption tax overview |

**Fix while editing:** Body links to `.svg` diagram → must stay **`.webp`** only (`diagrams/ko-japan-real-estate-three-things.webp`). Do not add new SVG.

---

### 3. `tokyo-moving-contracts-two-notes`

**Role:** Lease contracts (not purchase); cite **Tokyo rental guidelines**, not purchase Livable.

| # | Cite this claim | Suggested source |
|---|-----------------|------------------|
| 1 | 원상회복 / 임대차 framework | Tokyo housing policy `310-6-jyuutaku_eng.pdf` or portal |
| 2 | **4~6배** initial cost vs monthly rent (if kept as market practice) | Same PDF or Tokyo Metro tenant guide — verify phrase on page |
| 3 | (optional) 定期借家 vs 普通借家 distinction | Same tier-1 PDF |

Keep **4~6** as qualitative if PDF does not state exact multiple — soften wording + footnote to “see official guide”.

---

### 4. `tokyo-small-rental-yield-vs-capital-gain-breakeven`

| # | Cite this claim | Suggested source |
|---|-----------------|------------------|
| 1 | Surface yield band **~4–5%** or breakeven math inputs | REINS and/or Kantei — same as pillar Ch.3 |
| 2 | (optional) BOJ rate context | `https://www.boj.or.jp/...` statistics page — **do not** bundle with REINS on same footnote |
| 3 | Holding cost / tax line if specific % | NTA or Tokyo tax — one claim only |

Prefer linking yield bands to **cluster narrative** + one tier-1 stat source.

---

### 5. `tokyo-mansion-tsubo-chiyoda-chuo-minato`

| # | Cite this claim | Suggested source |
|---|-----------------|------------------|
| 1 | **坪単価** / ward price level (one headline) | Kantei PDF + archive |
| 2 | (optional) REINS median if cited in body | REINS `mw_202604_summary.pdf` + archive |
| 3 | Acquisition closing **7~10%** if mentioned | Livable `money_plan.html` |

---

### 6. `tokyo-6-wards-real-estate-insight`

| # | Cite this claim | Suggested source |
|---|-----------------|------------------|
| 1 | **2025 +34.6%** / 6-ward **+38.6%** (verify on PDF) | Kantei `c2025.pdf` + archive |
| 2 | **1億4,000万** / 70㎡ average band | Same Kantei PDF |
| 3 | (optional) Cap rate **2~3%** | Qualitative + Kantei or market commentary; or skip footnote and keep as author framing |

**Note:** Post already has markdown links to Kantei — add **numbered footnotes** on the same stats (do not remove existing links).

---

## AG completion checklist (per slug)

- [ ] `ko` / `en` / `ja` updated
- [ ] `sources` ⊇ all `citeSources` URLs
- [ ] 4~6 footnotes in body; numbers match `citeSources` order
- [ ] No footer disclaimer; no new SVG
- [ ] `[AG→Cursor]` handoff line in your reply to user

---

## After Wave A (Cursor, not AG)

```bash
pnpm trust:check-source-urls <slug>
SKIP_TRUST_VERIFY=1 pnpm validate:post <slug>
```

User commits/deploys when ready.

---

## Wave B — REIT·rates (done on `main`)

`j-reit-five-things-to-know`, `hotel-reit-vs-office-reit-post-covid`, `japan-rate-hike-cycle-j-reit-three-lessons`, `tokyo-office-vacancy-five-wards-2026`

---

## Wave C — 24 slugs — ✅ Done (2026-05-27)

All batches C1–C5 on `main`. **No Wave D.** Record: [`GSF_BLOG_WAVE_C_FOOTNOTES_COMPLETE_20260527.md`](./GSF_BLOG_WAVE_C_FOOTNOTES_COMPLETE_20260527.md). Rules archive: [`FOOTNOTE_ROLLOUT_WAVE_C_AG.md`](./FOOTNOTE_ROLLOUT_WAVE_C_AG.md).
