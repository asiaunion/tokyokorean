# T3 full network verification (2026-05-25)

> `SKIP_TRUST_VERIFY=0` · `TRUST_SKIP_SOURCE_FETCH` unset · cache cleared before run

## Summary

| Layer | Result |
|-------|--------|
| **Batch trust (fetch ON)** | **24/35 PASS** |
| **Phase3 parity only** (`TRUST_SKIP_SOURCE_FETCH=1`) | **35/35 PASS** (2026-05-25 ginza coverage·extract 보정) |
| **P0 spot** (`p0-spot-verify.mjs`) | **12/12 PASS** |
| **Bulk auto-`[x]` on T3 PASS** | **122** claims marked across 35 sheets |
| **Remaining blocking claims** | **525** (FAIL/UNCERTAIN, still `[ ]`) |
| **`pnpm trust:update-index`** | **35/35** updated |

## Batch failures (11 slugs)

All failures are **`trust-source-alignment`** except ginza (also **`trust-fact-sheet-coverage`**).

| slug | Gates failed | Unverified claims still blocking (after bulk mark) |
|------|--------------|---------------------------------------------------|
| `ginza-marunouchi-walk-dna` | coverage + alignment | 40 |
| `japan-corporate-vs-personal-rental-after-tax-sketch` | alignment | 40 |
| `japan-visa-paths-permanent-business-manager-asset-holders` | alignment | 27 |
| `nihonbashi-hamacho-walking-guide` | alignment | 51 |
| `tokyo-6-wards-real-estate-insight` | alignment | 25 |
| `tokyo-korean-community-beyond-shinokubo` | alignment | 10 |
| `tokyo-mansion-tsubo-chiyoda-chuo-minato` | alignment | 55 |
| `tokyo-real-estate-investment-complete-guide` | alignment | 50 |
| `tokyo-shinjuku-shibuya-bunkyo` | alignment | 155 |
| `tokyo-ward-guide-series-prologue` | alignment | 40 |
| `weak-yen-korean-japan-asset-allocation-fx-scenarios` | alignment | 32 |

**Why P0 12/12 but batch 24/35?**  
P0 spot checks **one primary claim** per slug. Batch T3 requires **every unverified row** in the Claims table to PASS (no FAIL/UNCERTAIN).

## Ginza coverage — resolved (2026-05-25)

- Fact sheet: `4,440만 엔`, `4,440万円`, `4,440`, `¥44.4` Claims 행 추가; `¥67.1` → `¥44.4`
- `trustUtils.ts`: `4,440만` substring 추출 보정, embedded 만/万 fragment dedupe
- `node scripts/rebuild-parity-sections.mjs ginza-marunouchi-walk-dna` — 교차 로케일 블록 union 재구축
- `pnpm validate:post ginza-marunouchi-walk-dna` (fetch skip): **PASS**

## Commands used

```bash
rm -rf .cache/source-verify
node scripts/bulk-t3-mark-passing.mjs
SKIP_VALIDATE_BUILD=1 SKIP_TRUST_VERIFY=0 node scripts/batch-validate-posts.mjs
TRUST_SKIP_SOURCE_FETCH=1 npx tsx scripts/cursor-phase3-verify-all.mjs
pnpm trust:update-index
```

## Path to 35/35 fetch ON (optional)

1. Per-slug: map each blocking claim to a **page that contains that number** (or narrow Claims table to verifiable literals).
2. `pnpm trust:verify-sources <slug>` until `ok: true`.
3. Ginza: fix **coverage** rows for 4,440万 / remove stale 6,710 tokens from KO.
4. Re-run batch with fetch ON.

CI default (`SKIP_TRUST_VERIFY=1` / `TRUST_SKIP_SOURCE_FETCH=1`) remains **35/35** without completing the above.
